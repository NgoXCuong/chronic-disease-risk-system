from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app.core.database import get_async_db
from app.core.security import get_current_user
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
    description="Xác thực email và mật khẩu, phát hành Access Token (15 phút) và Refresh Token (7 ngày)."
)
async def login(
    req: UserLoginRequest,
    request: Request,
    db: DatabaseSession
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    return await AuthService.login_user(db, req, ip_address, user_agent)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Cấp mới Access Token (Refresh Token Rotation)",
    description="Kiểm tra tính hợp lệ của Refresh Token, hủy token cũ và phát hành cặp Access Token + Refresh Token mới."
)
async def refresh_token(
    req: RefreshTokenRequest,
    request: Request,
    db: DatabaseSession
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    return await AuthService.rotate_refresh_token(db, req.refresh_token, ip_address, user_agent)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Đăng xuất khỏi hệ thống",
    description="Hủy và thu hồi (revoke) Refresh Token hiện tại để kết thúc phiên làm việc an toàn. Không bắt buộc phải có Access Token."
)
async def logout(
    req: RefreshTokenRequest,
    request: Request,
    db: DatabaseSession,
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    await AuthService.logout_user(db, req.refresh_token, ip_address, user_agent)
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
    current_user: CurrentUser,
    db: DatabaseSession
):
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    await AuthService.change_password(db, current_user, req, ip_address, user_agent)
    return MessageResponse(message="Đổi mật khẩu thành công. Vui lòng đăng nhập lại trên các thiết bị.")
