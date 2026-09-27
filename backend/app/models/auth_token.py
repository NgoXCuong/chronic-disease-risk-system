import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import TokenType

if TYPE_CHECKING:
    from app.models.user import User


class UserAuthToken(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Security Authentication Token Entity.
    Manages Refresh Token Rotation, Token Revocation on Logout/Password Change,
    Password Reset Tokens, and Email Verification Codes.
    """
    __tablename__ = "user_auth_tokens"
    __table_args__ = (
        Index("idx_tokens_user_type_revoked", "user_id", "token_type", "is_revoked"),
        Index("idx_tokens_expires", "expires_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Owner user account ID"
    )
    token_hash: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        doc="Cryptographic hash (SHA256) of token for secure indexing"
    )
    token_type: Mapped[TokenType] = mapped_column(
        Enum(TokenType, name="token_type_enum", create_type=False),
        nullable=False,
        index=True,
        doc="Token purpose (REFRESH_TOKEN, PASSWORD_RESET, EMAIL_VERIFICATION)"
    )
    is_revoked: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="Revocation status: True if explicitly logged out or replaced in rotation"
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        doc="Token expiration timestamp"
    )
    user_agent: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        doc="Browser or device agent string during issuance"
    )
    ip_address: Mapped[Optional[str]] = mapped_column(
        String(45),
        nullable=True,
        doc="Client IP address during issuance"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="auth_tokens"
    )

    @property
    def is_expired(self) -> bool:
        """Checks whether token timestamp has expired."""
        return datetime.now(timezone.utc) > self.expires_at

    @property
    def is_valid(self) -> bool:
        """Token is active if not revoked and not expired."""
        return not self.is_revoked and not self.is_expired

    def __repr__(self) -> str:
        return f"<UserAuthToken(user_id={self.user_id}, type={self.token_type}, revoked={self.is_revoked})>"
