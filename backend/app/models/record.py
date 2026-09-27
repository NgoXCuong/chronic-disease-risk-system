import uuid
from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import Enum, ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import RecordType

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.screening import ScreeningResult


class HealthRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Health Survey / Clinical Lab Record Entity.
    Stores the exact snapshot of input attributes entered by the user.
    """
    __tablename__ = "health_records"
    __table_args__ = (
        Index("idx_records_user_created", "user_id", "created_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Foreign Key pointing to patient who provided this survey record"
    )
    record_type: Mapped[RecordType] = mapped_column(
        Enum(RecordType, name="record_type_enum", create_type=False),
        nullable=False,
        doc="Survey category (LIFESTYLE_BRFSS or CLINICAL_PIMA)"
    )
    input_data: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        doc="Full raw dictionary of survey answers or lab measurements"
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Optional user notes or clinician observations"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="health_records"
    )
    screening_results: Mapped[List["ScreeningResult"]] = relationship(
        "ScreeningResult",
        back_populates="health_record",
        cascade="all, delete-orphan",
        order_by="ScreeningResult.created_at",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<HealthRecord(id={self.id}, user_id={self.user_id}, type={self.record_type})>"
