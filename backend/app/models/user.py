from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.profile import PatientProfile
    from app.models.record import HealthRecord
    from app.models.what_if import WhatIfSimulation
    from app.models.chat import AIChatSession
    from app.models.audit import SystemAuditLog
    from app.models.notification import Notification
    from app.models.auth_token import UserAuthToken
    from app.models.review import ScreeningReview


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    User Account Entity.
    Stores authentication credentials, access role, and links to profile and records.
    """
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="Unique email address used as login identity"
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Securely hashed password via bcrypt (cost factor >= 12)"
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role_enum", create_type=False),
        default=UserRole.USER,
        nullable=False,
        doc="Role-based access control level (USER, HEALTH_CONSULTANT, ADMIN)"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        doc="Account status flag: active or soft-disabled"
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Email verification status"
    )

    # Relationships
    profile: Mapped[Optional["PatientProfile"]] = relationship(
        "PatientProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    health_records: Mapped[List["HealthRecord"]] = relationship(
        "HealthRecord",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(HealthRecord.created_at)",
        lazy="select"
    )
    what_if_simulations: Mapped[List["WhatIfSimulation"]] = relationship(
        "WhatIfSimulation",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select"
    )
    ai_chat_sessions: Mapped[List["AIChatSession"]] = relationship(
        "AIChatSession",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(AIChatSession.created_at)",
        lazy="select"
    )
    audit_logs: Mapped[List["SystemAuditLog"]] = relationship(
        "SystemAuditLog",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Notification.created_at)",
        lazy="select"
    )
    auth_tokens: Mapped[List["UserAuthToken"]] = relationship(
        "UserAuthToken",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select"
    )
    consultant_reviews: Mapped[List["ScreeningReview"]] = relationship(
        "ScreeningReview",
        back_populates="consultant",
        cascade="all, delete-orphan",
        lazy="select"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"
