import uuid
from typing import Any, Dict, List, TYPE_CHECKING
from sqlalchemy import CheckConstraint, Enum, Float, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import DiseaseType, RiskLevel

if TYPE_CHECKING:
    from app.models.record import HealthRecord
    from app.models.what_if import WhatIfSimulation
    from app.models.chat import AIChatSession
    from app.models.review import ScreeningReview


class ScreeningResult(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    ML Prediction & XAI Screening Result Entity.
    Stores calibrated risk scores, optimal cutoff comparison, and SHAP factor attribution.
    """
    __tablename__ = "screening_results"
    __table_args__ = (
        CheckConstraint("risk_score >= 0.0 AND risk_score <= 1.0", name="chk_valid_risk_score"),
        CheckConstraint("risk_percentage >= 0.0 AND risk_percentage <= 100.0", name="chk_valid_risk_percentage"),
        CheckConstraint("optimal_threshold >= 0.0 AND optimal_threshold <= 1.0", name="chk_valid_optimal_threshold"),
        Index("idx_screening_disease_risk", "disease_type", "risk_level"),
        Index("idx_screening_created", "created_at"),
    )

    health_record_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("health_records.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Foreign Key pointing to raw health survey input"
    )
    disease_type: Mapped[DiseaseType] = mapped_column(
        Enum(DiseaseType, name="disease_type_enum", create_type=False),
        nullable=False,
        doc="Target disease: diabetes, hypertension, cardiovascular, stroke, or clinical diabetes"
    )
    model_version: Mapped[str] = mapped_column(
        String(50),
        default="1.0.0",
        nullable=False,
        doc="Semantic version of model used for inference (e.g., '1.0.0')"
    )
    risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Calibrated probability of risk (0.0 to 1.0)"
    )
    risk_percentage: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Human-friendly risk percentage (risk_score * 100%)"
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel, name="risk_level_enum", create_type=False),
        nullable=False,
        doc="Stratified clinical triage tier: LOW, MEDIUM, HIGH"
    )
    optimal_threshold: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Youden's J decision threshold tuned for maximal clinical recall"
    )
    shap_summary: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        doc="Full SHAP feature attribution mapping (feature -> shap_value)"
    )
    top_risk_factors: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=False,
        doc="Top 3 to 5 highest positive contributing risk factors with % impacts"
    )
    recommendations: Mapped[List[str]] = mapped_column(
        JSONB,
        default=list,
        nullable=False,
        doc="Standard clinical lifestyle and follow-up guidance"
    )

    # Relationships
    health_record: Mapped["HealthRecord"] = relationship(
        "HealthRecord",
        back_populates="screening_results"
    )
    what_if_simulations: Mapped[List["WhatIfSimulation"]] = relationship(
        "WhatIfSimulation",
        back_populates="screening_result",
        cascade="all, delete-orphan",
        lazy="select"
    )
    ai_chat_sessions: Mapped[List["AIChatSession"]] = relationship(
        "AIChatSession",
        back_populates="screening_result",
        lazy="select"
    )
    reviews: Mapped[List["ScreeningReview"]] = relationship(
        "ScreeningReview",
        back_populates="screening_result",
        cascade="all, delete-orphan",
        order_by="desc(ScreeningReview.created_at)",
        lazy="select"
    )

    def __repr__(self) -> str:
        return (
            f"<ScreeningResult(id={self.id}, disease={self.disease_type}, "
            f"score={self.risk_score:.4f}, level={self.risk_level})>"
        )
