from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.profile import PatientProfileResponse, PatientProfileUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["2. Hồ sơ Sức khỏe Cá nhân (User Profile)"])


@router.get(
    "/profile",
    response_model=PatientProfileResponse,
    summary="Lấy hồ sơ sức khỏe cá nhân của người dùng",
    description="Truy vấn thông tin nhân khẩu học (chiều cao, cân nặng, BMI tự động tính, tiền sử bệnh) của người dùng hiện tại."
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    return await UserService.get_patient_profile(db, current_user.id)


@router.put(
    "/profile",
    response_model=PatientProfileResponse,
    summary="Cập nhật hồ sơ sức khỏe cá nhân",
    description="Cập nhật các chỉ số thể chất (chiều cao, cân nặng, tiền sử bệnh). Tự động cập nhật chỉ số BMI."
)
async def update_my_profile(
    req: PatientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db)
):
    return await UserService.update_patient_profile(db, current_user.id, req)
