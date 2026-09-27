import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.screening import ScreeningResult


class ScreeningReview(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Clinician / Health Consultant Review Entity.
    Allows verified medical professionals (HEALTH_CONSULTANT role) to annotate
    and provide authoritative medical guidance on AI screening outputs.
    """
    __tablename__ = "screening_reviews"
    __table_args__ = (
        Index("idx_reviews_screening_created", "screening_result_id", "created_at"),
        Index("idx_reviews_consultant_created", "consultant_id", "created_at"),
    )

    screening_result_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("screening_results.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Reference to AI screening result evaluated"
    )
    consultant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Physician or Health Consultant who authored this clinical review"
    )
    clinical_notes: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Authoritative physician commentary and pathophysiological notes"
    )
    lifestyle_advice: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Tailored nutrition, exercise, and lifestyle recommendations"
    )
    recommended_action: Mapped[str] = mapped_column(
        String(100),
        default="FOLLOW_UP_3_MONTHS",
        nullable=False,
        doc="Triage protocol (e.g. 'URGENT_CLINICAL_VISIT', 'FOLLOW_UP_3_MONTHS', 'MONITOR_LIFESTYLE')"
    )

    # Relationships
    screening_result: Mapped["ScreeningResult"] = relationship(
        "ScreeningResult",
        back_populates="reviews"
    )
    consultant: Mapped["User"] = relationship(
        "User",
        back_populates="consultant_reviews"
    )

    def __repr__(self) -> str:
        return f"<ScreeningReview(id={self.id}, screening_id={self.screening_result_id}, consultant_id={self.consultant_id})>"
