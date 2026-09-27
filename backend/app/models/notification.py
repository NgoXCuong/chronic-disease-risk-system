import uuid
from datetime import datetime
from typing import Any, Dict, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import NotificationPriority, NotificationType

if TYPE_CHECKING:
    from app.models.user import User


class Notification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Patient Health Notification & Periodic Monitoring Alert Entity.
    Supports screening reminders (3-6 months), critical high-risk alerts,
    What-If lifestyle milestones, and clinical recommendations.
    """
    __tablename__ = "notifications"
    __table_args__ = (
        Index("idx_notifications_user_read_created", "user_id", "is_read", "created_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Recipient user ID"
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Short notification title (e.g., 'Nhắc nhở tái sàng lọc định kỳ')"
    )
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Detailed notification body text"
    )
    notification_type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, name="notification_type_enum", create_type=False),
        default=NotificationType.SCREENING_REMINDER,
        nullable=False,
        index=True,
        doc="Category of notification"
    )
    priority: Mapped[NotificationPriority] = mapped_column(
        Enum(NotificationPriority, name="notification_priority_enum", create_type=False),
        default=NotificationPriority.NORMAL,
        nullable=False,
        doc="Triage urgency (LOW, NORMAL, HIGH, URGENT)"
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="Read status flag for badge counts"
    )
    action_url: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Optional deep-link URL (e.g., '/screening/lifestyle' or '/screening/results/123')"
    )
    read_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="Timestamp when user marked notification as read"
    )
    metadata_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        doc="Auxiliary structured payload (e.g. disease_type, risk_score)"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="notifications"
    )

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.notification_type}, read={self.is_read})>"
