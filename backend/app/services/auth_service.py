import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.audit import SystemAuditLog
from app.models.auth_token import UserAuthToken
from app.models.enums import TokenType, UserRole
from app.models.profile import PatientProfile
from app.models.user import User
from app.schemas.auth import (
    PasswordChangeRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)


class AuthService:
    """Authentication, JWT Token Lifecycle & Security Business Logic."""

    @staticmethod
    async def register_user(
        db: AsyncSession,
        req: UserRegisterRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> User:
        """Register a new user account with hashed password and initial patient profile."""
        # 1. Check if email already registered
        existing = await db.execute(select(User).where(User.email == req.email.lower()))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{req.email}' đã được đăng ký trên hệ thống. Vui lòng sử dụng email khác hoặc đăng nhập.",
            )

        # 2. Hash password with bcrypt
        hashed_pwd = hash_password(req.password)

        # 3. Create User entity
        user = User(
            email=req.email.lower(),
            hashed_password=hashed_pwd,
            role=UserRole.USER,
            is_active=True,
            is_verified=False,
        )
        db.add(user)
        await db.flush()

        # 4. Create associated PatientProfile
        profile = PatientProfile(
            user_id=user.id,
            full_name=req.full_name,
            date_of_birth=req.date_of_birth,
            gender=req.gender,
            height_cm=req.height_cm,
            weight_kg=req.weight_kg,
            medical_history={},
        )
        db.add(profile)

        # 5. Log audit trail
        audit = SystemAuditLog(
            user_id=user.id,
            action="AUTH_REGISTER",
            resource="/api/v1/auth/register",
            ip_address=ip_address,
            user_agent=user_agent,
            status_code=201,
            details={"email": user.email},
        )
        db.add(audit)

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def login_user(
        db: AsyncSession,
        req: UserLoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        """Authenticate user credentials and issue Access Token + Refresh Token."""
        # 1. Fetch user by email
        result = await db.execute(
            select(User).options(selectinload(User.profile)).where(User.email == req.email.lower())
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(req.password, user.hashed_password):
            # Record failed login in audit
            audit = SystemAuditLog(
                user_id=user.id if user else None,
                action="AUTH_LOGIN_FAILED",
                resource="/api/v1/auth/login",
                ip_address=ip_address,
                user_agent=user_agent,
                status_code=401,
                details={"attempted_email": req.email.lower()},
            )
            db.add(audit)
            await db.commit()

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email hoặc mật khẩu không chính xác.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
            )

        # 2. Generate Access Token (15m) and Refresh Token (7d)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        refresh_token, token_digest, refresh_exp = create_refresh_token(
            user_id=user.id, email=user.email
        )

        # 3. Store Refresh Token hash in DB
        auth_token_record = UserAuthToken(
            user_id=user.id,
            token_hash=token_digest,
            token_type=TokenType.REFRESH_TOKEN,
            is_revoked=False,
            expires_at=refresh_exp,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db.add(auth_token_record)

        # 4. Audit Log
        audit = SystemAuditLog(
            user_id=user.id,
            action="AUTH_LOGIN_SUCCESS",
            resource="/api/v1/auth/login",
            ip_address=ip_address,
            user_agent=user_agent,
            status_code=200,
            details={"email": user.email, "role": user.role.value},
        )
        db.add(audit)

        await db.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    async def rotate_refresh_token(
        db: AsyncSession,
        raw_refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        """
        Perform strict Refresh Token Rotation:
        - Validates the incoming refresh token.
        - If token is already revoked: DETECTS REUSE ATTACK! Revokes all tokens for that user.
        - Invalidates the used token.
        - Issues a brand new Access Token and Refresh Token.
        """
        # 1. Decode token structure & signature
        payload = decode_token(raw_refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Loại token không hợp lệ (yêu cầu Refresh Token).",
            )

        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không chứa định danh người dùng.",
            )

        user_uuid = uuid.UUID(user_id_str)
        token_digest = hash_token(raw_refresh_token)

        # 2. Look up token in database
        result = await db.execute(
            select(UserAuthToken).where(
                UserAuthToken.user_id == user_uuid,
                UserAuthToken.token_hash == token_digest,
                UserAuthToken.token_type == TokenType.REFRESH_TOKEN,
            )
        )
        token_record = result.scalar_one_or_none()

        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token không tìm thấy trong hệ thống hoặc đã bị hủy.",
            )

        # 3. Security Guard: Token Reuse Detection
        if token_record.is_revoked:
            # Token reuse breach detected! Revoke ALL active tokens for this user!
            await db.execute(
                update(UserAuthToken)
                .where(
                    UserAuthToken.user_id == user_uuid,
                    UserAuthToken.is_revoked == False,  # noqa: E712
                )
                .values(is_revoked=True)
            )
            audit = SystemAuditLog(
                user_id=user_uuid,
                action="SECURITY_TOKEN_REUSE_BREACH",
                resource="/api/v1/auth/refresh",
                ip_address=ip_address,
                user_agent=user_agent,
                status_code=401,
                details={"alert": "Phát hiện nỗ lực tái sử dụng refresh token cũ. Đã hủy toàn bộ phiên làm việc!"},
            )
            db.add(audit)
            await db.commit()

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Cảnh báo an ninh: Phát hiện mã xác thực đã bị sử dụng lại. Toàn bộ phiên làm việc đã bị hủy vì lý do an toàn.",
            )

        # 4. Check expiration
        now = datetime.now(timezone.utc)
        if token_record.expires_at < now:
            token_record.is_revoked = True
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token đã hết hạn. Vui lòng đăng nhập lại.",
            )

        # 5. Revoke current refresh token
        token_record.is_revoked = True

        # 6. Fetch user to verify active status
        user_res = await db.execute(select(User).where(User.id == user_uuid))
        user = user_res.scalar_one_or_none()
        if not user or not user.is_active:
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản không tồn tại hoặc đã bị khóa.",
            )

        # 7. Issue new Access Token and brand new Refresh Token (Rotation)
        new_access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        new_refresh_token, new_digest, new_exp = create_refresh_token(
            user_id=user.id, email=user.email
        )

        # 8. Save new token hash
        new_token_record = UserAuthToken(
            user_id=user.id,
            token_hash=new_digest,
            token_type=TokenType.REFRESH_TOKEN,
            is_revoked=False,
            expires_at=new_exp,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db.add(new_token_record)

        await db.commit()

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    async def logout_user(
        db: AsyncSession,
        user: User,
        raw_refresh_token: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        """Revoke refresh token on logout and record audit log."""
        if raw_refresh_token:
            token_digest = hash_token(raw_refresh_token)
            await db.execute(
                update(UserAuthToken)
                .where(
                    UserAuthToken.user_id == user.id,
                    UserAuthToken.token_hash == token_digest,
                )
                .values(is_revoked=True)
            )

        audit = SystemAuditLog(
            user_id=user.id,
            action="AUTH_LOGOUT",
            resource="/api/v1/auth/logout",
            ip_address=ip_address,
            user_agent=user_agent,
            status_code=200,
            details={"email": user.email},
        )
        db.add(audit)
        await db.commit()

    @staticmethod
    async def change_password(
        db: AsyncSession,
        user: User,
        req: PasswordChangeRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        """Verify current password, update to new hash, and revoke all active refresh tokens."""
        if not verify_password(req.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu hiện tại không chính xác.",
            )

        # Update password hash
        user.hashed_password = hash_password(req.new_password)

        # Invalidate ALL active refresh tokens on all devices
        await db.execute(
            update(UserAuthToken)
            .where(
                UserAuthToken.user_id == user.id,
                UserAuthToken.is_revoked == False,  # noqa: E712
            )
            .values(is_revoked=True)
        )

        audit = SystemAuditLog(
            user_id=user.id,
            action="AUTH_PASSWORD_CHANGE",
            resource="/api/v1/auth/change-password",
            ip_address=ip_address,
            user_agent=user_agent,
            status_code=200,
            details={"email": user.email},
        )
        db.add(audit)
        await db.commit()
