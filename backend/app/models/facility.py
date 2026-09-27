from typing import Optional
from sqlalchemy import Boolean, Enum, Float, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import FacilitySpecialty, FacilityTier


class MedicalFacility(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Healthcare Facility Entity (Hospitals, Specialty Clinics, Stroke Centers).
    Used by Leaflet.js interactive map to suggest nearby specialized care.
    """
    __tablename__ = "medical_facilities"
    __table_args__ = (
        Index("idx_facility_coords", "latitude", "longitude"),
        Index("idx_facility_specialty_city", "specialty", "city"),
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Official hospital or clinic name"
    )
    specialty: Mapped[FacilitySpecialty] = mapped_column(
        Enum(FacilitySpecialty, name="facility_specialty_enum", create_type=False),
        nullable=False,
        index=True,
        doc="Specialized clinical focus (ENDOCRINOLOGY, CARDIOLOGY, STROKE_NEUROLOGY, GENERAL_HOSPITAL)"
    )
    facility_tier: Mapped[FacilityTier] = mapped_column(
        Enum(FacilityTier, name="facility_tier_enum", create_type=False),
        default=FacilityTier.PROVINCIAL,
        nullable=False,
        doc="Healthcare administrative hierarchy tier (CENTRAL, PROVINCIAL, DISTRICT, PRIVATE)"
    )
    address: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Street address of facility"
    )
    city: Mapped[str] = mapped_column(
        String(100),
        default="Hà Nội",
        nullable=False,
        index=True,
        doc="Province / City location"
    )
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="WGS84 Latitude coordinate (decimal degrees)"
    )
    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="WGS84 Longitude coordinate (decimal degrees)"
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="Standard appointment booking hotline"
    )
    emergency_phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="24/7 Acute emergency department contact"
    )
    website: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Official website URL"
    )
    opening_hours: Mapped[Optional[str]] = mapped_column(
        String(100),
        default="07:30 - 17:00 (Thứ 2 - Thứ 6)",
        nullable=True,
        doc="Working hours summary"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Operational status"
    )

    def __repr__(self) -> str:
        return f"<MedicalFacility(id={self.id}, name='{self.name}', specialty={self.specialty})>"
