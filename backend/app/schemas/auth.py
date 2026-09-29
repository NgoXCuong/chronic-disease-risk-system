import re
import uuid
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.enums import BiologicalSex, UserRole
from app.schemas.profile import PatientProfileResponse


class UserRegisterRequest(BaseModel):
    """Registration payload for new users."""
    email: EmailStr = Field(..., description="Địa chỉ email đăng ký")
    password: str = Field(..., min_length=8, max_length=100, description="Mật khẩu (tối thiểu 8 ký tự)")
    full_name: Optional[str] = Field(None, max_length=150, description="Họ và tên đầy đủ")
    date_of_birth: Optional[date] = Field(None, description="Ngày sinh (YYYY-MM-DD)")
    gender: Optional[BiologicalSex] = Field(None, description="Giới tính sinh học")
    height_cm: Optional[float] = Field(None, ge=40.0, le=250.0, description="Chiều cao ban đầu (cm)")
    weight_kg: Optional[float] = Field(None, ge=15.0, le=300.0, description="Cân nặng ban đầu (kg)")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Enforce standard clinical-grade password complexity rules."""
        if len(v) < 8:
            raise ValueError("Mật khẩu phải chứa ít nhất 8 ký tự.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ hoa (A-Z).")
        if not re.search(r"[a-z]", v):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ thường (a-z).")
        if not re.search(r"\d", v):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ số (0-9).")
        return v


class UserLoginRequest(BaseModel):
    """Login credentials payload."""
    email: EmailStr = Field(..., description="Địa chỉ email tài khoản")
    password: str = Field(..., description="Mật khẩu tài khoản")


class TokenResponse(BaseModel):
    """JWT Token issuance response."""
    access_token: str = Field(..., description="JWT Access Token ngắn hạn")
    refresh_token: str = Field(..., description="JWT Refresh Token dài hạn")
    token_type: str = Field("bearer", description="Chuẩn token Bearer")
    expires_in: int = Field(..., description="Thời hạn Access Token tính bằng giây")


class RefreshTokenRequest(BaseModel):
    """Request payload for rotating a Refresh Token (hỗ trợ cả JSON body hoặc đọc từ HttpOnly Cookie)."""
    refresh_token: Optional[str] = Field(None, description="Mã Refresh Token hiện tại cần cấp mới")


class PasswordChangeRequest(BaseModel):
    """Payload for authenticated password modification."""
    current_password: str = Field(..., description="Mật khẩu hiện tại")
    new_password: str = Field(..., min_length=8, max_length=100, description="Mật khẩu mới")

    @field_validator("new_password")
    @classmethod
    def validate_new_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Mật khẩu mới phải chứa ít nhất 8 ký tự.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Mật khẩu mới phải chứa ít nhất 1 chữ hoa (A-Z).")
        if not re.search(r"[a-z]", v):
            raise ValueError("Mật khẩu mới phải chứa ít nhất 1 chữ thường (a-z).")
        if not re.search(r"\d", v):
            raise ValueError("Mật khẩu mới phải chứa ít nhất 1 chữ số (0-9).")
        return v


class UserResponse(BaseModel):
    """User account entity response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    profile: Optional[PatientProfileResponse] = None


class MessageResponse(BaseModel):
    """Generic status and notification response message."""
    message: str
    success: bool = True
