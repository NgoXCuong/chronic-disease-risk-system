import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, Response, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_async_db
from app.models.enums import UserRole
from app.models.user import User

# Khởi tạo lược đồ xác thực HTTP Bearer (auto_error=False để hỗ trợ fallback sang HttpOnly Cookie)
bearer_scheme = HTTPBearer(auto_error=False)
optional_bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(plain_password: str) -> str:
    """Mã hóa mật khẩu an toàn bằng thuật toán bcrypt với hệ số chi phí (cost factor) 12."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Xác thực mật khẩu thô đối chiếu với chuỗi hash bcrypt đã lưu trong CSDL."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def hash_token(token: str) -> str:
    """Tính mã băm SHA-256 của chuỗi JWT để lưu trữ và lập chỉ mục (index) an toàn trong CSDL."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Tạo Access Token JWT có thời hạn ngắn (mặc định 15 phút)."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "type": "access",
        "iat": now,
        "exp": expire,
    })
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    user_id: uuid.UUID,
    email: str,
    expires_delta: Optional[timedelta] = None
) -> tuple[str, str, datetime]:
    """
    Tạo Refresh Token JWT có thời hạn dài (mặc định 7 ngày).
    Trả về tuple: (mã_token_gốc, mã_băm_sha256, thời_điểm_hết_hạn).
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    jti = str(uuid.uuid4())
    payload = {
        "sub": str(user_id),
        "email": email,
        "jti": jti,
        "type": "refresh",
        "iat": now,
        "exp": expire,
    }
    raw_token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    token_digest = hash_token(raw_token)
    return raw_token, token_digest, expire


def decode_token(token: str) -> Dict[str, Any]:
    """Giải mã và kiểm tra tính hợp lệ của chữ ký số cùng thời hạn của token JWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã phiên xác thực (token) đã hết hạn. Vui lòng đăng nhập lại.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã phiên xác thực không hợp lệ.",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    """
    Dependency bảo mật của FastAPI:
    Trích xuất token từ Authorization Bearer header HOẶC từ HttpOnly cookie 'access_token',
    giải mã payload JWT, xác minh sự tồn tại và trạng thái kích hoạt của người dùng.
    """
    token: Optional[str] = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chưa cung cấp thông tin xác thực (thiếu Bearer token hoặc cookie access_token).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token)

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Loại token không hợp lệ (yêu cầu Access Token).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Không tìm thấy danh tính người dùng trong token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Định dạng ID người dùng không hợp lệ.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản người dùng không tồn tại hoặc đã bị xóa.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị tạm khóa. Vui lòng liên hệ quản trị viên.",
        )

    return user


async def get_optional_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(optional_bearer_scheme),
    db: AsyncSession = Depends(get_async_db)
) -> Optional[User]:
    """
    Dependency bảo mật tùy chọn:
    Nếu có Bearer header hoặc cookie access_token, giải mã và trả về User.
    Nếu không có token hoặc token không hợp lệ, trả về None thay vì quăng lỗi 401.
    """
    token: Optional[str] = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None

        user_id_str = payload.get("sub")
        if not user_id_str:
            return None

        user_uuid = uuid.UUID(user_id_str)
        result = await db.execute(select(User).where(User.id == user_uuid))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            return None
        return user
    except Exception:
        return None


def set_auth_cookies(
    response: Response,
    access_token: str,
    refresh_token: str,
) -> None:
    """
    Thiết lập cặp HttpOnly Cookie an toàn cho trình duyệt:
    - access_token: HttpOnly, Path=/, thời hạn ngắn (15 phút)
    - refresh_token: HttpOnly, Path=/, thời hạn dài (7 ngày)
    - medrisk_logged_in: Cookie không-HttpOnly để Next.js Middleware hoặc client nhận biết trạng thái đăng nhập
    """
    is_prod = settings.ENVIRONMENT == "production"

    # 1. Access Token HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        path="/",
    )
    # 2. Refresh Token HttpOnly Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        path="/",
    )
    # 3. Client state flag cookie (chỉ là cờ boolean cho Middleware kiểm tra nhanh)
    response.set_cookie(
        key="medrisk_logged_in",
        value="true",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=False,
        samesite="lax",
        secure=is_prod,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    """
    Xóa sạch toàn bộ cookies xác thực khi người dùng đăng xuất.
    """
    response.delete_cookie(key="access_token", path="/", samesite="lax")
    response.delete_cookie(key="refresh_token", path="/", samesite="lax")
    response.delete_cookie(key="medrisk_logged_in", path="/", samesite="lax")
    response.delete_cookie(key="medrisk_token", path="/", samesite="lax")


def require_roles(allowed_roles: List[UserRole]):
    """
    Nhà máy tạo Dependency kiểm soát phân quyền dựa trên vai trò người dùng (RBAC).
    Đảm bảo người dùng hiện tại sở hữu ít nhất một trong các vai trò được cấp phép.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Quyền truy cập bị từ chối. Chức năng yêu cầu vai trò: {[r.value for r in allowed_roles]}."
            )
        return current_user

    return role_checker
