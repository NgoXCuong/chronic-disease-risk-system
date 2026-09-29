from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.core.database import get_async_db
from app.core.security import (
    clear_auth_cookies,
    get_current_user,
    set_auth_cookies,
)
from app.models.user import User
from app.schemas.auth import (
    MessageResponse,
    PasswordChangeRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["1. Xác thực & Tài khoản (Authentication)"])

# Định nghĩa Type Alias Dependency Injection ngắn gọn theo Trụ cột 1 (Concise & Minimalist)
CurrentUser = Annotated[User, Depends(get_current_user)]
DatabaseSession = Annotated[AsyncSession, Depends(get_async_db)]


def get_client_ip(request: Request) -> str:
    """Trích xuất địa chỉ IP của client từ header HTTP hoặc kết nối mạng trực tiếp."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản người dùng mới",
    description="Tạo tài khoản mới với email và mật khẩu an toàn, tự động khởi tạo hồ sơ bệnh nhân rỗng."
)
async def register(
    req: UserRegisterRequest,
    request: Request,
    db: DatabaseSession
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    user = await AuthService.register_user(db, req, ip_address, user_agent)
    
    # Nạp lại dữ liệu người dùng cùng với hồ sơ bệnh nhân đi kèm
    res = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == user.id)
    )
    return res.scalar_one()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Đăng nhập tài khoản & Nhận JWT Tokens",
    description="Xác thực email và mật khẩu, phát hành Access Token (15 phút) và Refresh Token (7 ngày), tự động thiết lập HttpOnly Cookies."
)
async def login(
    req: UserLoginRequest,
    request: Request,
    response: Response,
    db: DatabaseSession
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    token_response = await AuthService.login_user(db, req, ip_address, user_agent)

    # Thiết lập HttpOnly Cookies an toàn bảo vệ chống XSS
    set_auth_cookies(response, token_response.access_token, token_response.refresh_token)
    return token_response


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Cấp mới Access Token (Refresh Token Rotation)",
    description="Kiểm tra tính hợp lệ của Refresh Token (nhận từ HttpOnly cookie hoặc JSON body), hủy token cũ và phát hành cặp token mới."
)
async def refresh_token(
    request: Request,
    response: Response,
    db: DatabaseSession,
    req: Optional[RefreshTokenRequest] = None,
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")

    # Ưu tiên lấy từ JSON body, fallback sang HttpOnly cookie
    raw_token = (req.refresh_token if req and req.refresh_token else None) or request.cookies.get("refresh_token")
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Không tìm thấy Refresh Token (trong JSON body hoặc HttpOnly cookie).",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_response = await AuthService.rotate_refresh_token(db, raw_token, ip_address, user_agent)

    # Cập nhật HttpOnly Cookies mới
    set_auth_cookies(response, token_response.access_token, token_response.refresh_token)
    return token_response


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Đăng xuất khỏi hệ thống",
    description="Hủy và thu hồi (revoke) Refresh Token hiện tại, xóa sạch HttpOnly cookies để kết thúc phiên an toàn."
)
async def logout(
    request: Request,
    response: Response,
    db: DatabaseSession,
    req: Optional[RefreshTokenRequest] = None,
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")

    # Lấy token từ JSON body hoặc cookie
    raw_token = (req.refresh_token if req and req.refresh_token else None) or request.cookies.get("refresh_token")
    if raw_token:
        try:
            await AuthService.logout_user(db, raw_token, ip_address, user_agent)
        except Exception:
            pass  # Nếu token đã hết hạn hoặc không hợp lệ vẫn đảm bảo xóa cookie phía client

    # Xóa sạch toàn bộ cookies xác thực
    clear_auth_cookies(response)
    return MessageResponse(message="Đăng xuất thành công. Phiên làm việc đã kết thúc an toàn.")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Lấy thông tin tài khoản hiện tại",
    description="Trả về thông tin tài khoản, vai trò và hồ sơ sức khỏe cá nhân của người dùng đang đăng nhập."
)
async def get_current_user_info(
    current_user: CurrentUser,
    db: DatabaseSession
):
    res = await db.execute(
        select(User).options(selectinload(User.profile)).where(User.id == current_user.id)
    )
    return res.scalar_one()


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Đổi mật khẩu tài khoản",
    description="Xác thực mật khẩu hiện tại, cập nhật mật khẩu mới và hủy toàn bộ phiên Refresh Token đang mở."
)
async def change_password(
    req: PasswordChangeRequest,
    request: Request,
    response: Response,
    current_user: CurrentUser,
    db: DatabaseSession
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    await AuthService.change_password(db, current_user, req, ip_address, user_agent)
    clear_auth_cookies(response)
    return MessageResponse(message="Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên các thiết bị.")
