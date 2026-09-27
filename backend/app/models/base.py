import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy 2.0 ORM models.
    Provides standard UUIDv4 primary keys and audit timestamps.
    """
    pass


class TimestampMixin:
    """
    Mixin to automatically attach timezone-aware created_at and updated_at
    timestamps to any database entity.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class UUIDPrimaryKeyMixin:
    """
    Mixin providing standard universally unique identifiers (UUIDv4)
    as primary keys for high security, uniqueness across distributed nodes,
    and prevention of enumeration attacks.
    """
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )
