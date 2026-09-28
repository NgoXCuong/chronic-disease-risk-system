from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Enum, Float, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import DiseaseType


class MLModelRegistry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    MLOps Machine Learning Model Registry Entity.
    Stores metadata, evaluation metrics (ROC-AUC, Recall), Youden's J thresholds,
    and feature configurations for all trained disease screening algorithms.
    """
    __tablename__ = "ml_models"
    __table_args__ = (
        UniqueConstraint("disease_type", "version", name="uq_model_disease_version"),
        Index("idx_models_disease_active", "disease_type", "is_active"),
    )

    disease_type: Mapped[DiseaseType] = mapped_column(
        Enum(
            DiseaseType,
            name="disease_type_enum",
            create_type=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        index=True,
        doc="Target chronic non-communicable disease"
    )

    version: Mapped[str] = mapped_column(
        String(50),
        default="1.0.0",
        nullable=False,
        doc="Semantic version string (e.g., '1.0.0')"
    )
    model_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        doc="Human-friendly model title (e.g. 'XGBoost Diabetes Risk Classifier')"
    )
    algorithm: Mapped[str] = mapped_column(
        String(100),
        default="XGBoost + CalibratedClassifierCV (Isotonic)",
        nullable=False,
        doc="Underlying ML algorithm family"
    )
    dataset_source: Mapped[str] = mapped_column(
        String(200),
        default="CDC BRFSS 2015 (~253,680 records)",
        nullable=False,
        doc="Training dataset provenance and sample size"
    )
    optimal_threshold: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Youden's J index cutoff calibrated on validation set"
    )
    roc_auc: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Area Under the Receiver Operating Characteristic curve on test set"
    )
    recall: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Test sensitivity / recall score"
    )
    f1_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        doc="Test F1-score metric"
    )
    precision_metric: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Test positive predictive value / precision"
    )
    features_order: Mapped[List[str]] = mapped_column(
        JSONB,
        nullable=False,
        doc="Strict ordered array of feature names fed into preprocessor"
    )
    risk_levels_config: Mapped[Dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        doc="Stratification boundaries dictionary: {low: [0, a], medium: [a, b], high: [b, 1]}"
    )
    artifact_path: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Filesystem or cloud bucket path to joblib artifacts"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="True if this version is currently actively used for live API inference"
    )
    trained_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        doc="Timestamp when model training completed"
    )

    def __repr__(self) -> str:
        return f"<MLModelRegistry(disease={self.disease_type}, version='{self.version}', auc={self.roc_auc:.4f})>"
