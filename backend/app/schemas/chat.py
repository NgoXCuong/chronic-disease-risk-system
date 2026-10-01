"""
Pydantic Schemas phục vụ Trợ lý Y tế AI Chatbot RAG (Sprint 16: FR-20 -> FR-22).
Tuân thủ Hợp đồng dữ liệu liên module, Type-Safety và quy tắc Clean Architecture trong AGENTS.md.
"""
from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import MessageSenderRole


class AIChatMessageItem(BaseModel):
    """Chi tiết một tin nhắn trong phiên hội thoại AI."""
    id: uuid.UUID
    session_id: uuid.UUID
    sender_role: MessageSenderRole
    content: str
    is_emergency_flag: bool = False
    tokens_used: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIChatSessionCreate(BaseModel):
    """Dữ liệu yêu cầu khởi tạo phiên trò chuyện y tế mới."""
    screening_result_id: Optional[uuid.UUID] = Field(
        default=None,
        description="ID kết quả sàng lọc để gắn ngữ cảnh hồ sơ sức khỏe và XAI cho AI"
    )
    title: Optional[str] = Field(
        default="Tư vấn sức khỏe & kết quả sàng lọc",
        max_length=255,
        description="Tiêu đề phiên hội thoại"
    )


class AIChatSessionResponse(BaseModel):
    """Phản hồi thông tin chi tiết một phiên trò chuyện kèm toàn bộ lịch sử tin nhắn."""
    id: uuid.UUID
    user_id: uuid.UUID
    screening_result_id: Optional[uuid.UUID] = None
    title: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    messages: List[AIChatMessageItem] = []

    model_config = ConfigDict(from_attributes=True)


class AIChatSessionListItem(BaseModel):
    """Thông tin tóm tắt phiên chat hiển thị trên sidebar/danh sách."""
    id: uuid.UUID
    title: str
    screening_result_id: Optional[uuid.UUID] = None
    is_archived: bool
    message_count: int = 0
    last_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AIChatSendMessageRequest(BaseModel):
    """Dữ liệu gửi tin nhắn của người dùng tới Trợ lý AI."""
    content: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Câu hỏi hoặc chia sẻ triệu chứng/chỉ số sức khỏe của người dùng"
    )


class AIChatSendMessageResponse(BaseModel):
    """Kết quả phản hồi của AI kèm theo cờ cảnh báo cấp cứu và nguồn tài liệu tham chiếu."""
    session_id: uuid.UUID
    user_message: AIChatMessageItem
    assistant_message: AIChatMessageItem
    is_emergency: bool = False
    emergency_alert: Optional[str] = None
    cited_sources: List[str] = []
