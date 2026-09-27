import uuid
from typing import Any, Dict, TYPE_CHECKING
from sqlalchemy import Float, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.screening import ScreeningResult


class WhatIfSimulation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    What-If Counterfactual Lifestyle Simulation Entity.
    Stores hypothetical risk scenarios and calculated delta improvements.
    """
    __tablename__ = "what_if_simulations"
    __table_args__ = (
        Index("idx_whatif_user_created", "user_id", "created_at"),
        Index("idx_whatif_screening", "screening_result_id"),
    )

    screening_result_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("screening_results.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Reference to baseline real-world screening assessment"
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Owner user ID for isolated data queries"
    )
    original_risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Original baseline risk probability"
    )
    simulated_risk_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Predicted risk probability after simulated lifestyle adjustments"
    )
    delta_risk: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Relative risk difference: simulated_risk_score - original_risk_score"
    )
    modified_features: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        doc="Set of parameters altered by the user (e.g. BMI, Smoker, PhysActivity)"
    )

    # Relationships
    screening_result: Mapped["ScreeningResult"] = relationship(
        "ScreeningResult",
        back_populates="what_if_simulations"
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="what_if_simulations"
    )

    def __repr__(self) -> str:
        return (
            f"<WhatIfSimulation(id={self.id}, original={self.original_risk_score:.2f}, "
            f"simulated={self.simulated_risk_score:.2f}, delta={self.delta_risk:.2f})>"
        )
