import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import MessageSenderRole

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.screening import ScreeningResult


class AIChatSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    AI Health Assistant Conversation Session Entity.
    Links conversational exchange to a patient user and optionally a specific screening result.
    """
    __tablename__ = "ai_chat_sessions"
    __table_args__ = (
        Index("idx_chat_session_user_created", "user_id", "created_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Owner of the chat conversation session"
    )
    screening_result_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("screening_results.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
        doc="Optional screening assessment used as contextual grounding for the conversation"
    )
    title: Mapped[str] = mapped_column(
        String(255),
        default="Tư vấn sức khỏe & kết quả sàng lọc",
        nullable=False,
        doc="Display title of conversation topic"
    )
    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Archival flag for soft-hiding older discussions"
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="ai_chat_sessions"
    )
    screening_result: Mapped[Optional["ScreeningResult"]] = relationship(
        "ScreeningResult",
        back_populates="ai_chat_sessions"
    )
    messages: Mapped[List["AIChatMessage"]] = relationship(
        "AIChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="AIChatMessage.created_at",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<AIChatSession(id={self.id}, user_id={self.user_id}, title='{self.title}')>"


class AIChatMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual Message in an AI Assistant Conversation.
    Contains speaker role, content, and safety flags (e.g. emergency redirection).
    """
    __tablename__ = "ai_chat_messages"
    __table_args__ = (
        Index("idx_chat_message_session_created", "session_id", "created_at"),
    )

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ai_chat_sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
        doc="Parent conversation session ID"
    )
    sender_role: Mapped[MessageSenderRole] = mapped_column(
        Enum(MessageSenderRole, name="message_sender_role_enum", create_type=False),
        nullable=False,
        doc="Role: 'user', 'assistant', or 'system'"
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Message payload in UTF-8 text/markdown format"
    )
    is_emergency_flag: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="True if message contains emergency medical indicators requiring urgent 115 redirection"
    )
    tokens_used: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        doc="Track token usage for LLM cost/quota monitoring"
    )

    # Relationships
    session: Mapped["AIChatSession"] = relationship(
        "AIChatSession",
        back_populates="messages"
    )

    def __repr__(self) -> str:
        return f"<AIChatMessage(id={self.id}, role={self.sender_role}, emergency={self.is_emergency_flag})>"
