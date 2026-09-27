import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import PatientProfile
from app.models.user import User
from app.schemas.profile import PatientProfileResponse, PatientProfileUpdate


class UserService:
    """Nghiệp vụ quản lý hồ sơ nhân trắc và thông tin sức khỏe cá nhân của người bệnh."""

    @staticmethod
    async def get_patient_profile(db: AsyncSession, user_id: uuid.UUID) -> PatientProfile:
        """Truy vấn hồ sơ chỉ số nhân trắc của bệnh nhân theo ID người dùng."""
        result = await db.execute(
            select(PatientProfile).where(PatientProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hồ sơ sức khỏe cá nhân chưa được khởi tạo.",
            )
        return profile

    @staticmethod
    async def update_patient_profile(
        db: AsyncSession,
        user_id: uuid.UUID,
        req: PatientProfileUpdate
    ) -> PatientProfile:
        """Cập nhật các chỉ số sinh lý (chiều cao, cân nặng, tiền sử bệnh án)."""
        result = await db.execute(
            select(PatientProfile).where(PatientProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            # Tự động khởi tạo nếu chưa có hồ sơ
            profile = PatientProfile(user_id=user_id)
            db.add(profile)

        # Cập nhật các trường dữ liệu được gửi lên
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)

        await db.commit()
        await db.refresh(profile)
        return profile
