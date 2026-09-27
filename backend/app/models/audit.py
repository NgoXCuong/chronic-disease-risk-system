import uuid
from typing import Any, Dict, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class SystemAuditLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Security & Operational Audit Log Entity.
    Tracks critical system actions, authentication events, and administrative changes
    for HIPAA/GDPR compliance without storing sensitive medical parameters in plain logs.
    """
    __tablename__ = "system_audit_logs"
    __table_args__ = (
        Index("idx_audit_action_created", "action", "created_at"),
        Index("idx_audit_user_created", "user_id", "created_at"),
    )

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
        doc="Actor user ID (null for anonymous/failed login attempts)"
    )
    action: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="Security action identifier (e.g., 'AUTH_LOGIN', 'SCREENING_EVAL', 'ROLE_CHANGE')"
    )
    resource: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="API route or database resource targeted"
    )
    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True,
        doc="Client IPv4 or IPv6 address"
    )
    user_agent: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Client browser / device user agent"
    )
    status_code: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="HTTP response status code returned"
    )
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
        doc="Sanitized metadata dictionary (never contains raw health data or passwords)"
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="audit_logs"
    )

    def __repr__(self) -> str:
        return f"<SystemAuditLog(id={self.id}, action='{self.action}', user_id={self.user_id})>"
