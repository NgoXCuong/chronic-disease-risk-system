import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import PatientProfile
from app.models.user import User
from app.schemas.profile import PatientProfileResponse, PatientProfileUpdate


class UserService:
    """Patient Profile and User Management Business Logic."""

    @staticmethod
    async def get_patient_profile(db: AsyncSession, user_id: uuid.UUID) -> PatientProfile:
        """Fetch patient physical profile by user ID."""
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
        """Update physiological metrics (height, weight, medical history)."""
        result = await db.execute(
            select(PatientProfile).where(PatientProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            # Create if not exists
            profile = PatientProfile(user_id=user_id)
            db.add(profile)

        # Update provided fields
        update_data = req.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(profile, key, value)

        await db.commit()
        await db.refresh(profile)
        return profile
