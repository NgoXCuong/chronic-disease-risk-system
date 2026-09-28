import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.logger import logger
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
    """Nghiệp vụ xác thực người dùng, vòng đời mã JWT và kiểm soát an ninh phiên đăng nhập."""

    @staticmethod
    async def register_user(
        db: AsyncSession,
        req: UserRegisterRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> User:
        """Đăng ký tài khoản người dùng mới, băm mật khẩu và khởi tạo hồ sơ nhân trắc bệnh nhân."""
        # 1. Kiểm tra email đã tồn tại trong hệ thống chưa
        existing = await db.execute(select(User).where(User.email == req.email.lower()))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{req.email}' đã được đăng ký trên hệ thống. Vui lòng sử dụng email khác hoặc đăng nhập.",
            )

        # 2. Băm mật khẩu an toàn với thuật toán bcrypt (cost 12)
        hashed_pwd = hash_password(req.password)

        # 3. Tạo bản ghi thực thể Người dùng (User)
        user = User(
            email=req.email.lower(),
            hashed_password=hashed_pwd,
            role=UserRole.USER,
            is_active=True,
            is_verified=False,
        )
        db.add(user)
        await db.flush()

        # 4. Tạo hồ sơ bệnh nhân đi kèm (PatientProfile)
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

        # 5. Ghi nhật ký kiểm toán hệ thống (Audit Trail)
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
        logger.info("[ĐĂNG KÝ] Tạo tài khoản mới thành công: %s | Họ tên: %s", user.email, req.full_name or 'Chưa cập nhật')
        return user

    @staticmethod
    async def login_user(
        db: AsyncSession,
        req: UserLoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        """Xác thực thông tin đăng nhập và cấp cặp khóa Access Token + Refresh Token."""
        # 1. Truy vấn người dùng theo email
        result = await db.execute(
            select(User).options(selectinload(User.profile)).where(User.email == req.email.lower())
        )
        user = result.scalar_one_or_none()

        if not user or not verify_password(req.password, user.hashed_password):
            logger.warning("[ĐĂNG NHẬP] Thất bại cho email: '%s' (Mật khẩu sai hoặc tài khoản không tồn tại)", req.email)
            # Ghi nhận lần đăng nhập thất bại vào nhật ký kiểm toán
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
            logger.warning("[ĐĂNG NHẬP] Tài khoản bị vô hiệu hóa: %s", user.email)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.",
            )

        # 2. Tạo Access Token (15 phút) và Refresh Token (7 ngày)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        refresh_token, token_digest, refresh_exp = create_refresh_token(
            user_id=user.id, email=user.email
        )

        # 3. Lưu mã băm SHA-256 của Refresh Token vào CSDL để quản lý thu hồi
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

        # 4. Ghi nhật ký kiểm toán đăng nhập thành công
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

        logger.info(
            "[ĐĂNG NHẬP] Thành công: %s (Vai trò: %s) | Cấp cặp JWT Tokens (Hạn: %s phút)",
            user.email,
            user.role.value,
            settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        )

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
        Thực hiện cơ chế luân chuyển Refresh Token nghiêm ngặt (Refresh Token Rotation):
        - Kiểm tra chữ ký và tính hợp lệ của refresh token gửi lên.
        - Nếu token đã bị thu hồi trước đó: PHÁT HIỆN TẤN CÔNG TÁI SỬ DỤNG (Token Reuse Attack)! Hủy toàn bộ phiên làm việc của user.
        - Đánh dấu token hiện tại là đã thu hồi (revoked).
        - Cấp phát cặp Access Token mới và Refresh Token hoàn toàn mới.
        """
        # 1. Giải mã cấu trúc token và chữ ký
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

        # 2. Tra cứu token trong cơ sở dữ liệu
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

        # 3. Lá chắn bảo mật: Phát hiện hành vi sử dụng lại token cũ (Token Reuse Detection)
        if token_record.is_revoked:
            # Phát hiện rò rỉ token! Thu hồi toàn bộ token còn hiệu lực của người dùng này trên mọi thiết bị!
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

        # 4. Kiểm tra thời hạn hiệu lực của token
        now = datetime.now(timezone.utc)
        if token_record.expires_at < now:
            token_record.is_revoked = True
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token đã hết hạn. Vui lòng đăng nhập lại.",
            )

        # 5. Thu hồi refresh token hiện tại
        token_record.is_revoked = True

        # 6. Kiểm tra lại trạng thái tài khoản người dùng
        user_res = await db.execute(select(User).where(User.id == user_uuid))
        user = user_res.scalar_one_or_none()
        if not user or not user.is_active:
            await db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản không tồn tại hoặc đã bị khóa.",
            )

        # 7. Cấp mới cặp Access Token và Refresh Token mới (Rotation)
        new_access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        new_refresh_token, new_digest, new_exp = create_refresh_token(
            user_id=user.id, email=user.email
        )

        # 8. Lưu mã băm của Refresh Token mới vào CSDL
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
        """Thu hồi refresh token khi đăng xuất và ghi vết nhật ký kiểm toán."""
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
        """Xác minh mật khẩu cũ, băm cập nhật mật khẩu mới và hủy toàn bộ refresh token trên các thiết bị."""
        if not verify_password(req.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu hiện tại không chính xác.",
            )

        # Cập nhật mã băm mật khẩu mới
        user.hashed_password = hash_password(req.new_password)

        # Hủy toàn bộ refresh token đang hoạt động trên mọi thiết bị
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
