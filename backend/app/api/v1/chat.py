"""
API Router Phục vụ Trợ lý Y tế AI Chatbot RAG (Sprint 16: FR-20 -> FR-22).
Tuân thủ bảo mật PHI/PII, Row-level authorization và kiến trúc phân tầng trong AGENTS.md.
"""
from typing import Annotated, List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.chat import (
    AIChatSendMessageRequest,
    AIChatSendMessageResponse,
    AIChatSessionCreate,
    AIChatSessionListItem,
    AIChatSessionResponse,
)
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["6. Trợ lý Y tế AI Chatbot RAG (AI Health Assistant)"])

DatabaseSession = Annotated[AsyncSession, Depends(get_async_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "/sessions",
    response_model=AIChatSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Khởi tạo phiên tư vấn AI mới (FR-20)",
    description="Tạo một phiên trao đổi mới, có thể gắn kèm ID kết quả sàng lọc để cung cấp ngữ cảnh lâm sàng.",
)
async def create_chat_session(
    data: AIChatSessionCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    return await ChatService.create_session(
        db=db,
        user_id=current_user.id,
        data=data,
    )


@router.get(
    "/sessions",
    response_model=List[AIChatSessionListItem],
    status_code=status.HTTP_200_OK,
    summary="Danh sách các phiên hội thoại của người dùng (FR-20)",
    description="Truy xuất danh sách các phiên trò chuyện của người dùng hiện tại kèm tin nhắn gần nhất.",
)
async def list_chat_sessions(
    db: DatabaseSession,
    current_user: CurrentUser,
):
    return await ChatService.list_user_sessions(
        db=db,
        user_id=current_user.id,
    )


@router.get(
    "/sessions/{session_id}",
    response_model=AIChatSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Chi tiết phiên và lịch sử tin nhắn (FR-20)",
    description="Lấy chi tiết một phiên trò chuyện cụ thể kèm toàn bộ lịch sử trao đổi.",
)
async def get_chat_session_detail(
    session_id: uuid.UUID,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    return await ChatService.get_session_detail(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
    )


@router.post(
    "/sessions/{session_id}/message",
    response_model=AIChatSendMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Gửi câu hỏi tới Trợ lý Y tế AI (FR-21, FR-22)",
    description=(
        "Xử lý câu hỏi của bệnh nhân với RAG tri thức y khoa Bộ Y tế/WHO, "
        "kích hoạt bộ lọc khẩn cấp (Triage Emergency Rule), và trả lời cá nhân hóa theo hồ sơ sức khỏe."
    ),
)
async def send_chat_message(
    session_id: uuid.UUID,
    data: AIChatSendMessageRequest,
    db: DatabaseSession,
    current_user: CurrentUser,
):
    return await ChatService.send_message(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        data=data,
    )
