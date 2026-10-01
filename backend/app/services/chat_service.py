"""
Dịch vụ Trợ lý Y tế AI Chatbot RAG (Sprint 16: FR-20 -> FR-22).
Tuân thủ Trụ cột 1 (Ngắn gọn), Trụ cột 4 (Kiến trúc phân tầng), Trụ cột 5 (Bảo mật PHI/PII)
và Trụ cột 8-9 (Tái lập & Dữ liệu thật) theo hiến pháp kỹ thuật AGENTS.md.
"""
from datetime import datetime, timezone
import glob
import os
import re
from typing import Any, Dict, List, Optional, Tuple
import uuid

from fastapi import HTTPException, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.logger import logger
from app.models.chat import AIChatMessage, AIChatSession
from app.models.enums import MessageSenderRole
from app.models.screening import ScreeningResult
from app.schemas.chat import (
    AIChatMessageItem,
    AIChatSendMessageRequest,
    AIChatSendMessageResponse,
    AIChatSessionCreate,
    AIChatSessionListItem,
    AIChatSessionResponse,
)

# Cấu hình Gemini SDK nếu có API Key
_GEMINI_CLIENT_READY = False
try:
    if settings.GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _GEMINI_CLIENT_READY = True
except Exception as e:
    logger.warning(f"Không thể khởi tạo Google Gemini SDK: {e}")


class EmergencyDetector:
    """Bộ lọc nhận diện triệu chứng cấp cứu tim mạch, đột quỵ và hô hấp cấp (Triage Rule)."""

    EMERGENCY_PATTERNS = [
        # Dấu hiệu đau ngực dữ dội / Nhồi máu cơ tim cấp
        r"(đau|thắt|tức|đè|nặng|bóp nghẹt)\s*(ở|vùng|ngực|xương ức|trái)",
        # FAST Đột quỵ não: Mặt méo, yếu liệt chi, rối loạn ngôn ngữ
        r"(méo|lệch)\s*(miệng|mặt)",
        r"(yếu|liệt)\s*(nửa người|tay chân|một bên|tay|chân)",
        r"(nói ngọng|khó nói|không nói được|ú ớ)",
        r"(mất thị lực|mờ mắt|nhìn đôi)\s*(đột ngột)",
        # Khó thở cấp tính / Ngạt thở
        r"(khó thở|hụt hơi|ngạt thở|thở dốc)\s*(dữ dội|đột ngột|không thở được|tím tái)",
        # Mất ý thức / Hôn mê
        r"(hôn mê|ngất xỉu|bất tỉnh|mất ý thức|co giật)",
        # Cơn tăng huyết áp kịch phát ác tính (>= 180 mmHg)
        r"(huyết áp|ha)[\w\s\.,;:]{0,35}?(18[0-9]|19[0-9]|2[0-9]{2})",
        r"(cơn\s+tăng\s+huyết\s+áp|huyết\s+áp\s+ác\s+tính)",
    ]

    EMERGENCY_ALERT_TEXT = (
        "🚨 **CẢNH BÁO Y TẾ KHẨN CẤP (RED FLAG)**:\n\n"
        "Triệu chứng bạn mô tả có dấu hiệu nghi ngờ của **biến cố tim mạch, đột quỵ não hoặc suy hô hấp cấp tính** đe dọa trực tiếp tính mạng!\n\n"
        "👉 **HÀNH ĐỘNG CẦN THỰC HIỆN NGAY LẬP TỨC:**\n"
        "1. **Gọi ngay Cấp cứu 115** hoặc yêu cầu người thân đưa bạn đến Khoa Cấp cứu của bệnh viện gần nhất.\n"
        "2. Nằm hoặc ngồi nghỉ ở tư thế nửa nằm nửa ngồi, nới lỏng thắt lưng và cổ áo, hít thở đều.\n"
        "3. **TUYỆT ĐỐI KHÔNG:** Tự ý lái xe, cạo gió, chích máu đầu ngón tay hay tự ý uống bất kỳ loại thuốc nào khi chưa có bác sĩ cấp cứu hướng dẫn."
    )

    @classmethod
    def check_emergency(cls, text: str) -> Tuple[bool, Optional[str]]:
        """Kiểm tra xem nội dung câu hỏi có chứa từ khóa đe dọa tính mạng khẩn cấp hay không."""
        clean_text = text.lower()
        for pattern in cls.EMERGENCY_PATTERNS:
            if re.search(pattern, clean_text, re.IGNORECASE):
                return True, cls.EMERGENCY_ALERT_TEXT
        return False, None


class KnowledgeBaseRetriever:
    """Bộ nạp và truy xuất tài liệu y khoa chuẩn Bộ Y tế & WHO (RAG Knowledge Engine)."""

    _chunks: List[Dict[str, Any]] = []
    _is_loaded: bool = False

    @classmethod
    def _load_documents(cls) -> None:
        """Đọc và phân đoạn các tệp tài liệu trong thư mục knowledge_base."""
        if cls._is_loaded:
            return

        kb_dir = os.path.abspath(
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base")
        )
        if not os.path.isdir(kb_dir):
            logger.warning(f"Thư mục Knowledge Base không tồn tại: {kb_dir}")
            cls._is_loaded = True
            return

        cls._chunks = []
        md_files = glob.glob(os.path.join(kb_dir, "*.md"))

        for file_path in md_files:
            file_name = os.path.basename(file_path)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Tách theo các tiêu đề cấp 2 (##)
                sections = re.split(r"\n(?=##\s+)", content)
                doc_title = sections[0].split("\n")[0].replace("#", "").strip() if sections else file_name

                for sec in sections:
                    sec_clean = sec.strip()
                    if not sec_clean:
                        continue
                    sec_lines = sec_clean.split("\n")
                    sec_heading = sec_lines[0].replace("#", "").strip() if sec_lines else ""
                    
                    cls._chunks.append({
                        "file_name": file_name,
                        "doc_title": doc_title,
                        "heading": sec_heading,
                        "content": sec_clean,
                        "keywords": cls._extract_keywords(sec_clean),
                    })
            except Exception as e:
                logger.error(f"Lỗi khi đọc tài liệu {file_name}: {e}")

        cls._is_loaded = True
        logger.info(f"Đã nạp {len(cls._chunks)} phân đoạn tri thức y khoa từ {len(md_files)} tài liệu.")

    @staticmethod
    def _extract_keywords(text: str) -> set:
        """Trích xuất từ khóa y khoa đơn giản để chấm điểm độ tương đồng."""
        words = re.findall(r"\b\w{2,}\b", text.lower())
        return set(words)

    @classmethod
    def retrieve(cls, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Truy xuất top_k đoạn văn bản liên quan nhất tới truy vấn của người dùng."""
        cls._load_documents()
        if not cls._chunks:
            return []

        query_words = set(re.findall(r"\b\w{2,}\b", query.lower()))
        scored_chunks = []

        for chunk in cls._chunks:
            # Chấm điểm dựa trên giao của tập từ khóa
            overlap = len(query_words.intersection(chunk["keywords"]))
            # Tăng điểm nếu từ khóa xuất hiện trong tiêu đề mục
            heading_words = set(re.findall(r"\b\w{2,}\b", chunk["heading"].lower()))
            heading_bonus = len(query_words.intersection(heading_words)) * 3
            total_score = overlap + heading_bonus

            if total_score > 0:
                scored_chunks.append((total_score, chunk))

        # Sắp xếp giảm dần theo điểm số
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_chunks[:top_k]]


class ChatService:
    """Nghiệp vụ quản lý hội thoại và xử lý câu hỏi y tế cá nhân hóa với RAG."""

    @staticmethod
    async def create_session(
        db: AsyncSession,
        user_id: uuid.UUID,
        data: AIChatSessionCreate
    ) -> AIChatSessionResponse:
        """Tạo phiên hội thoại y tế mới, liên kết với kết quả sàng lọc nếu có."""
        # Nếu có screening_result_id, xác thực quyền sở hữu qua health_record
        if data.screening_result_id:
            stmt = (
                select(ScreeningResult)
                .join(ScreeningResult.health_record)
                .where(
                    ScreeningResult.id == data.screening_result_id,
                    ScreeningResult.health_record.has(user_id=user_id)
                )
            )
            result = await db.execute(stmt)
            screening = result.scalar_one_or_none()
            if not screening:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Không tìm thấy kết quả sàng lọc hợp lệ của bạn."
                )

        session = AIChatSession(
            user_id=user_id,
            screening_result_id=data.screening_result_id,
            title=data.title or "Tư vấn sức khỏe & kết quả sàng lọc",
            is_archived=False
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)

        # Tạo tin nhắn chào mừng ban đầu từ Trợ lý Y tế AI
        greeting = (
            "Xin chào! Tôi là Trợ lý Y tế AI hỗ trợ giải đáp thắc mắc về kết quả sàng lọc nguy cơ "
            "bệnh mạn tính, giải thích chỉ số xét nghiệm và tư vấn cải thiện lối sống.\n\n"
            "⚠️ *Lưu ý: Tôi là công cụ hỗ trợ ra quyết định (CDSS), không thay thế kết luận hay chỉ định của bác sĩ. "
            "Nếu bạn có câu hỏi hoặc cần giải thích chỉ số nào, hãy gửi cho tôi nhé!*"
        )
        welcome_msg = AIChatMessage(
            session_id=session.id,
            sender_role=MessageSenderRole.ASSISTANT.value,
            content=greeting,
            is_emergency_flag=False,
            tokens_used=50
        )
        session.messages.append(welcome_msg)
        await db.commit()
        return AIChatSessionResponse.model_validate(session)

    @staticmethod
    async def list_user_sessions(
        db: AsyncSession,
        user_id: uuid.UUID
    ) -> List[AIChatSessionListItem]:
        """Lấy danh sách các phiên hội thoại của người dùng hiện tại (Row-level security)."""
        stmt = (
            select(AIChatSession)
            .options(selectinload(AIChatSession.messages))
            .where(
                AIChatSession.user_id == user_id,
                AIChatSession.is_archived.is_(False)
            )
            .order_by(desc(AIChatSession.updated_at))
        )
        result = await db.execute(stmt)
        sessions = result.scalars().all()

        items = []
        for s in sessions:
            msgs = s.messages or []
            last_msg_content = msgs[-1].content if msgs else None
            items.append(
                AIChatSessionListItem(
                    id=s.id,
                    title=s.title,
                    screening_result_id=s.screening_result_id,
                    is_archived=s.is_archived,
                    message_count=len(msgs),
                    last_message=last_msg_content[:120] + "..." if last_msg_content and len(last_msg_content) > 120 else last_msg_content,
                    created_at=s.created_at,
                    updated_at=s.updated_at,
                )
            )
        return items

    @staticmethod
    async def get_session_detail(
        db: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID
    ) -> AIChatSessionResponse:
        """Lấy chi tiết một phiên chat kèm toàn bộ lịch sử tin nhắn."""
        stmt = (
            select(AIChatSession)
            .options(selectinload(AIChatSession.messages))
            .where(
                AIChatSession.id == session_id,
                AIChatSession.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phiên trò chuyện."
            )
        return AIChatSessionResponse.model_validate(session)

    @classmethod
    async def send_message(
        cls,
        db: AsyncSession,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        data: AIChatSendMessageRequest
    ) -> AIChatSendMessageResponse:
        """Gửi tin nhắn của người dùng, thực thi RAG + Triage Rule, và lưu phản hồi AI."""
        # 1. Xác thực quyền sở hữu phiên
        stmt = (
            select(AIChatSession)
            .options(
                selectinload(AIChatSession.messages),
                selectinload(AIChatSession.screening_result).selectinload(ScreeningResult.health_record)
            )
            .where(
                AIChatSession.id == session_id,
                AIChatSession.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy phiên trò chuyện."
            )

        # 2. Kiểm tra dấu hiệu cấp cứu y tế (Triage Emergency Rule)
        is_emergency, emergency_alert = EmergencyDetector.check_emergency(data.content)

        # 3. Lưu tin nhắn của người dùng
        user_msg = AIChatMessage(
            session_id=session.id,
            sender_role=MessageSenderRole.USER.value,
            content=data.content,
            is_emergency_flag=is_emergency,
            tokens_used=len(data.content.split())
        )
        db.add(user_msg)
        await db.flush()

        cited_sources: List[str] = []
        ai_reply_content: str = ""

        # 4. Phân nhánh xử lý Khẩn cấp vs Bình thường
        if is_emergency:
            ai_reply_content = emergency_alert or EmergencyDetector.EMERGENCY_ALERT_TEXT
            cited_sources = ["Quy trình Cấp cứu Y tế Khẩn cấp (Bộ Y tế Việt Nam)"]
        else:
            # Truy xuất tri thức liên quan từ Knowledge Base
            relevant_chunks = KnowledgeBaseRetriever.retrieve(data.content, top_k=2)
            context_text = ""
            doc_label_map = {
                "bang_tra_cuu_chi_so_sinh_hoa.md": "Bảng chỉ số sinh hóa máu (Bộ Y tế)",
                "huong_dan_tieu_duong_bo_y_te.md": "Hướng dẫn chẩn đoán ĐTĐ (QĐ 5481/QĐ-BYT)",
                "huong_dan_tim_mach_tang_huyet_ap.md": "Hướng dẫn Tim mạch & THA (QĐ 5904/QĐ-BYT)",
                "khuyen_cao_dinh_duong_van_dong.md": "Khuyến cáo Dinh dưỡng & Vận động (WHO)",
            }
            for c in relevant_chunks:
                context_text += f"\n---\n[Nguồn: {c['doc_title']} - {c['heading']}]:\n{c['content']}\n"
                fname = c.get("file_name", "")
                short_title = doc_label_map.get(fname, c.get("doc_title", "Bộ Y tế"))
                heading = c.get("heading", "").strip()
                label = f"{short_title}: {heading}" if heading and len(heading) < 40 else short_title
                if label not in cited_sources:
                    cited_sources.append(label)

            # Thu thập ngữ cảnh hồ sơ kết quả sàng lọc nếu có
            screening_ctx = cls._build_screening_context(session.screening_result)

            # Sinh phản hồi từ Gemini hoặc Fallback y khoa
            ai_reply_content = await cls._generate_ai_response(
                user_question=data.content,
                context_kb=context_text,
                patient_context=screening_ctx,
                recent_history=session.messages[-6:] if session.messages else []
            )

        # 5. Lưu tin nhắn phản hồi của Assistant
        assistant_msg = AIChatMessage(
            session_id=session.id,
            sender_role=MessageSenderRole.ASSISTANT.value,
            content=ai_reply_content,
            is_emergency_flag=is_emergency,
            tokens_used=len(ai_reply_content.split())
        )
        db.add(assistant_msg)
        
        # Cập nhật thời gian phiên
        session.updated_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user_msg)
        await db.refresh(assistant_msg)

        return AIChatSendMessageResponse(
            session_id=session.id,
            user_message=AIChatMessageItem.model_validate(user_msg),
            assistant_message=AIChatMessageItem.model_validate(assistant_msg),
            is_emergency=is_emergency,
            emergency_alert=emergency_alert if is_emergency else None,
            cited_sources=cited_sources
        )

    @staticmethod
    def _build_screening_context(screening: Optional[ScreeningResult]) -> str:
        """Xây dựng chuỗi tóm tắt hồ sơ sàng lọc và giải thích XAI của người dùng."""
        if not screening:
            return "Người dùng chưa liên kết kết quả sàng lọc cụ thể cho phiên này."

        factors_summary = ""
        if screening.top_risk_factors:
            factors_summary = ", ".join(
                [f"{f.get('feature_name_vi', f.get('feature'))} ({f.get('impact', '')})" for f in screening.top_risk_factors[:3]]
            )

        rec_summary = "; ".join(screening.recommendations[:3]) if screening.recommendations else "Chưa có"

        return (
            f"- Bệnh lý đã sàng lọc: {screening.disease_type.value}\n"
            f"- Điểm số nguy cơ ước tính: {screening.risk_percentage:.1f}% (Phân tầng: {screening.risk_level.value})\n"
            f"- Ngưỡng tối ưu lâm sàng: {screening.optimal_threshold:.3f}\n"
            f"- Các yếu tố nguy cơ chính (SHAP XAI): {factors_summary}\n"
            f"- Khuyến nghị ban đầu: {rec_summary}"
        )

    @classmethod
    async def _generate_ai_response(
        cls,
        user_question: str,
        context_kb: str,
        patient_context: str,
        recent_history: List[AIChatMessage]
    ) -> str:
        """Sinh câu trả lời thông minh qua Gemini (gemini-3.8-flash) hoặc fallback RAG y tế."""
        # Thử gọi Google Gemini API nếu key khả dụng
        if _GEMINI_CLIENT_READY and settings.GEMINI_API_KEY:
            import google.generativeai as genai
            system_instruction = (
                "Bạn là Trợ lý Y tế AI thuộc Hệ thống Sàng lọc Nguy cơ Bệnh Mạn tính (Chronic Disease Risk System). "
                "Nhiệm vụ: Giải thích kết quả sàng lọc, phân tích các chỉ số xét nghiệm từ giấy khám bệnh (nếu có), "
                "và tư vấn lối sống (dinh dưỡng, vận động) dựa trên tài liệu chuẩn của Bộ Y tế Việt Nam và WHO.\n\n"
                "QUY TẮC BẮT BUỘC:\n"
                "1. Tư cách CDSS: Luôn nhấn mạnh kết quả chỉ mang tính sàng lọc/tham khảo, KHÔNG thay thế chẩn đoán y khoa.\n"
                "2. Tuyệt đối KHÔNG kê đơn thuốc cụ thể (tên thuốc, liều dùng).\n"
                "3. Dựa sát vào các đoạn tài liệu được cung cấp trong Tri thức Y khoa đính kèm.\n"
                "4. Trả lời bằng tiếng Việt ân cần, giải thích dễ hiểu, cấu trúc rõ ràng với gạch đầu dòng.\n"
                "5. Nếu phát hiện người dùng có triệu chứng khẩn cấp, nhắc nhở đi khám ngay."
            )
            prompt_parts = [
                f"HỒ SƠ BỆNH NHÂN:\n{patient_context}\n",
                f"TRI THỨC Y KHOA THAM CHIẾU (RAG):\n{context_kb or 'Không có tài liệu trực tiếp, hãy dựa trên kiến thức y khoa chuẩn chung.'}\n",
                f"CÂU HỎI CỦA NGƯỜI BỆNH: {user_question}"
            ]

            # Danh sách mô hình ưu tiên thử nghiệm (tránh lỗi 404 deprecated model)
            candidate_models = [
                settings.GEMINI_MODEL,
                "gemini-3.5-flash",
                "gemini-3.5-flash-lite",
                "gemini-flash-latest",
            ]
            models_to_try = []
            for m in candidate_models:
                if m and m not in models_to_try:
                    models_to_try.append(m)

            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(
                        model_name=model_name,
                        system_instruction=system_instruction
                    )
                    response = await model.generate_content_async(prompt_parts)
                    if response and response.text:
                        return response.text.strip()
                except Exception as e:
                    logger.warning(f"Lỗi khi thử mô hình Gemini '{model_name}': {e}")

            logger.error("Tất cả mô hình Gemini đều không phản hồi, chuyển sang Clinical Fallback.")

        # Fallback Y tế Lâm Sàng (Rule-based RAG Response Generator)
        return cls._generate_clinical_fallback_response(user_question, context_kb, patient_context)

    @staticmethod
    def _generate_clinical_fallback_response(
        query: str,
        context_kb: str,
        patient_context: str
    ) -> str:
        """Sinh câu trả lời y tế chuẩn lâm sàng, định dạng sạch sẽ, dễ đọc cho người bệnh."""
        q_lower = query.lower()
        parts = []

        parts.append(
            "Dưới đây là thông tin y khoa tham khảo được tổng hợp từ các hướng dẫn chuyên môn của **Bộ Y tế Việt Nam** và **Tổ chức Y tế Thế giới (WHO)**:\n"
        )

        # 1. Phân loại theo chủ đề câu hỏi để đưa ra khoảng tham chiếu chuẩn
        if any(w in q_lower for w in ["hba1c", "đường huyết", "glucose", "tiểu đường", "đái tháo đường"]):
            parts.append("### 🩸 Khoảng Tham Chiếu Chỉ Số Đường Huyết (QĐ 5481/QĐ-BYT):")
            parts.append("• **Glucose huyết lúc đói (FPG):**")
            parts.append("  - Bình thường: 70 – 99 mg/dL (3.9 – 5.5 mmol/L)")
            parts.append("  - Tiền đái tháo đường: 100 – 125 mg/dL (5.6 – 6.9 mmol/L)")
            parts.append("  - Ngưỡng chẩn đoán ĐTĐ: ≥ 126 mg/dL (≥ 7.0 mmol/L) sau nhịn ăn ≥ 8 giờ.")
            parts.append("• **Chỉ số HbA1c (Đường huyết trung bình 2-3 tháng qua):**")
            parts.append("  - Bình thường: < 5.7%")
            parts.append("  - Tiền đái tháo đường (nguy cơ cao): 5.7% – 6.4%")
            parts.append("  - Ngưỡng đái tháo đường: ≥ 6.5%")
            parts.append("• **Glucose sau ăn 2 giờ (OGTT):** Bình thường < 140 mg/dL, ĐTĐ ≥ 200 mg/dL.\n")

        elif any(w in q_lower for w in ["huyết áp", "ha", "tim mạch", "tăng huyết áp"]):
            parts.append("### 🫀 Phân Độ Huyết Áp & Nguy Cơ Tim Mạch (QĐ 5904/QĐ-BYT):")
            parts.append("• **Huyết áp tối ưu:** < 120/80 mmHg")
            parts.append("• **Tiền tăng huyết áp (Bình thường cao):** 130 – 139 / 85 – 89 mmHg")
            parts.append("• **Tăng huyết áp Độ 1:** 140 – 159 / 90 – 99 mmHg (cần điều chỉnh lối sống và theo dõi)")
            parts.append("• **Tăng huyết áp Độ 2:** 160 – 179 / 100 – 109 mmHg (cần dùng thuốc theo chỉ định)")
            parts.append("• **Tăng huyết áp cấp cứu:** ≥ 180 / 110 mmHg (cần gọi 115 hoặc đi cấp cứu ngay).\n")

        elif any(w in q_lower for w in ["mỡ máu", "cholesterol", "ldl", "hdl", "triglyceride"]):
            parts.append("### 🧪 Khoảng Tham Chiếu Chỉ Số Mỡ Máu (Lipid Panel):")
            parts.append("• **Cholesterol toàn phần:** Mục tiêu lý tưởng < 200 mg/dL (< 5.2 mmol/L)")
            parts.append("• **LDL-Cholesterol (Mỡ 'xấu'):** Mục tiêu < 100 mg/dL (người có bệnh tim mạch cần siết < 70 mg/dL)")
            parts.append("• **HDL-Cholesterol (Mỡ 'tốt'):** Nam ≥ 40 mg/dL, Nữ ≥ 50 mg/dL (bảo vệ thành mạch)")
            parts.append("• **Triglycerides:** Mục tiêu < 150 mg/dL (< 1.7 mmol/L). Vượt 500 mg/dL có nguy cơ viêm tụy cấp.\n")

        elif any(w in q_lower for w in ["thận", "gan", "creatinine", "egfr", "ast", "alt", "acid uric", "xét nghiệm"]):
            parts.append("### 🩺 Chỉ Số Đánh Giá Chức Năng Cơ Quan (Thận & Gan):")
            parts.append("• **Creatinine huyết thanh:** Nam 62 – 106 µmol/L, Nữ 44 – 80 µmol/L")
            parts.append("• **Mức lọc cầu thận (eGFR):** ≥ 90 mL/min/1.73m² (bình thường). Dưới 60 là dấu hiệu bệnh thận mạn.")
            parts.append("• **Men gan AST / ALT:** Dưới 40 U/L (men tăng cảnh báo gan nhiễm mỡ, tổn thương gan).")
            parts.append("• **Acid Uric máu:** Nam 210 – 420 µmol/L, Nữ 150 – 360 µmol/L.\n")

        # 2. Khuyến cáo dinh dưỡng và vận động hành động thực tế
        parts.append("### 💡 Khuyến Cáo Dinh Dưỡng & Vận Động (Chuẩn WHO):")
        if any(w in q_lower for w in ["muối", "natri", "ăn", "dinh dưỡng", "kiêng"]):
            parts.append("• **Kiểm soát lượng muối:** Tiêu thụ dưới 5g muối/ngày (khoảng 1 muỗng cà phê gạt ngang). Người tăng huyết áp nên giảm xuống dưới 3.75g/ngày. Tránh đồ muối chua, dưa cà, mì tôm, đồ hộp chế biến sẵn.")
            parts.append("• **Chế độ ăn lành mạnh:** Tăng cường rau xanh, trái cây ít ngọt, cá béo giàu Omega-3, ngũ cốc nguyên cám. Hạn chế mỡ động vật, thịt đỏ và đồ uống có ga.")
        elif any(w in q_lower for w in ["tập", "vận động", "thể thao", "chạy bộ", "đi bộ"]):
            parts.append("• **Hoạt động thể lực:** Tối thiểu 150 – 300 phút/tuần với cường độ vừa phải (đi bộ nhanh 5-6 km/h, bơi lội, đạp xe). Chia đều ít nhất 3 – 5 ngày/tuần.")
            parts.append("• **Giảm ngồi tĩnh tại:** Cứ sau mỗi 45 – 60 phút làm việc tĩnh tại, hãy đứng dậy vươn vai và đi lại nhẹ nhàng 2 – 3 phút.")
        else:
            parts.append("• **Chế độ dinh dưỡng:** Giảm lượng muối dưới 5g/ngày, cắt giảm đường tinh chế và nước ngọt có gas, bổ sung chất xơ hòa tan.")
            parts.append("• **Vận động thể lực:** Duy trì tối thiểu 150 phút/tuần cường độ vừa, kiểm soát cân nặng (BMI mục tiêu 18.5 – 22.9 kg/m² theo chuẩn Châu Á).")

        # 3. Ngữ cảnh cá nhân hóa nếu có hồ sơ sàng lọc
        if "Người dùng chưa liên kết" not in patient_context:
            parts.append("\n### 📋 Ghi Nhận Từ Hồ Sơ Sàng Lọc Gần Nhất Của Bạn:")
            parts.append(patient_context)

        # 4. Trách nhiệm y khoa
        parts.append(
            "\n---\n*⚠️ Lưu ý y khoa: Thông tin trên mang tính chất hỗ trợ quyết định (CDSS) và nâng cao nhận thức sức khỏe. "
            "Kết quả không thay thế chẩn đoán hay phác đồ điều trị của bác sĩ. Bạn hãy mang phiếu xét nghiệm đến cơ sở y tế để được thăm khám chi tiết.*"
        )

        return "\n".join(parts)
