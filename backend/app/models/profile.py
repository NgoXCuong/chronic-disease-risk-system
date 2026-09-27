import uuid
from datetime import date
from typing import Any, Dict, Optional, TYPE_CHECKING
from sqlalchemy import CheckConstraint, Date, Enum, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import BiologicalSex

if TYPE_CHECKING:
    from app.models.user import User


class PatientProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Patient Demographics & Baseline Physiological Profile.
    Holds pre-fill physical attributes and family medical history.
    1-to-1 relationship with User.
    """
    __tablename__ = "patient_profiles"
    __table_args__ = (
        CheckConstraint("height_cm >= 40.0 AND height_cm <= 250.0", name="chk_valid_height"),
        CheckConstraint("weight_kg >= 15.0 AND weight_kg <= 300.0", name="chk_valid_weight"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
        doc="Foreign Key pointing to associated user account"
    )
    full_name: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
        doc="Full name of patient for medical reporting"
    )
    date_of_birth: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        doc="Date of birth used to derive accurate age"
    )
    gender: Mapped[Optional[BiologicalSex]] = mapped_column(
        Enum(BiologicalSex, name="biological_sex_enum", create_type=False),
        nullable=True,
        doc="Biological sex (MALE, FEMALE, OTHER)"
    )
    height_cm: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Standing height in centimeters"
    )
    weight_kg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Body weight in kilograms"
    )
    medical_history: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        default=dict,
        nullable=False,
        doc="JSONB storage of personal and family chronic disease history"
    )
    emergency_contact: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        doc="Contact details for next of kin (name, phone, relation)"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="profile"
    )

    @property
    def bmi(self) -> Optional[float]:
        """Calculates Body Mass Index (BMI = kg / m^2)."""
        if self.height_cm and self.weight_kg and self.height_cm > 0:
            height_m = self.height_cm / 100.0
            return round(self.weight_kg / (height_m ** 2), 2)
        return None

    def __repr__(self) -> str:
        return f"<PatientProfile(user_id={self.user_id}, name='{self.full_name}', bmi={self.bmi})>"
