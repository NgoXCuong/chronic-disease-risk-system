"""
Bộ kiểm thử Tự động cho Sprint 16: Module Trợ lý Y tế AI Chatbot RAG (FR-20 -> FR-22).
Tuân thủ Trụ cột 5 (Bảo mật PHI/PII), Trụ cột 7 (Dễ kiểm thử) và Trụ cột 8 (An toàn y tế).
"""
import uuid
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.chat_service import EmergencyDetector, KnowledgeBaseRetriever


def test_emergency_detector_unit():
    """Kiểm thử đơn vị bộ lọc triệu chứng cấp cứu tim mạch & đột quỵ (Triage Red Flag)."""
    # 1. Ca nhồi máu cơ tim / đau thắt ngực cấp
    is_emg, alert = EmergencyDetector.check_emergency("Bác sĩ ơi tôi bị đau thắt ngực trái dữ dội từ sáng đến giờ")
    assert is_emg is True
    assert alert is not None
    assert "115" in alert

    # 2. Ca FAST Đột quỵ não
    is_emg, alert = EmergencyDetector.check_emergency("Bố tôi đột nhiên bị méo miệng và yếu liệt nửa người bên phải")
    assert is_emg is True
    assert alert is not None

    # 3. Ca cơn tăng huyết áp ác tính
    is_emg, alert = EmergencyDetector.check_emergency("Huyết áp đo tại nhà đang vọt lên 190 mmHg")
    assert is_emg is True

    # 4. Ca câu hỏi thông thường về dinh dưỡng (Không khẩn cấp)
    is_emg, alert = EmergencyDetector.check_emergency("Người bệnh tiểu đường nên ăn loại rau xanh nào tốt?")
    assert is_emg is False
    assert alert is None


def test_knowledge_base_retriever_unit():
    """Kiểm thử đơn vị bộ nạp và truy xuất tài liệu tri thức y khoa RAG."""
    # 1. Truy vấn về HbA1c
    chunks = KnowledgeBaseRetriever.retrieve("chỉ số hba1c đái tháo đường", top_k=2)
    assert len(chunks) > 0
    joined_content = " ".join([c["content"] for c in chunks])
    assert "HbA1c" in joined_content or "glucose" in joined_content.lower()

    # 2. Truy vấn về chế độ ăn giảm muối
    chunks_salt = KnowledgeBaseRetriever.retrieve("ăn bao nhiêu muối natri tăng huyết áp", top_k=2)
    assert len(chunks_salt) > 0
    salt_content = " ".join([c["content"] for c in chunks_salt])
    assert "muối" in salt_content.lower() or "natri" in salt_content.lower()


@pytest.mark.asyncio
async def test_chat_full_api_flow():
    """
    Kiểm thử luồng tích hợp đầy đủ của Trợ lý Y tế AI:
    1. Đăng ký & Đăng nhập người dùng mới
    2. Khởi tạo phiên trò chuyện (POST /chat/sessions)
    3. Xem danh sách phiên (GET /chat/sessions)
    4. Gửi câu hỏi dinh dưỡng thông thường (POST /chat/sessions/{id}/message) -> Nhận câu trả lời kèm nguồn RAG
    5. Gửi triệu chứng khẩn cấp -> Hệ thống kích hoạt Red Flag cảnh báo 115
    6. Kiểm tra Row-level Security: Tài khoản khác không được xem phiên của người này
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Tạo tài khoản User 1
        user1_email = f"chat_patient_{uuid.uuid4().hex[:8]}@example.com"
        pwd = "Password123@"
        reg_res = await client.post(
            "/api/v1/auth/register",
            json={
                "email": user1_email,
                "password": pwd,
                "full_name": "Trần Thị Lan",
                "date_of_birth": "1985-08-20",
                "gender": "FEMALE",
                "height_cm": 158.0,
                "weight_kg": 56.0,
            }
        )
        assert reg_res.status_code == 201

        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": user1_email, "password": pwd}
        )
        assert login_res.status_code == 200
        token1 = login_res.json()["access_token"]
        headers1 = {"Authorization": f"Bearer {token1}"}

        # 2. Khởi tạo phiên trò chuyện
        session_create_res = await client.post(
            "/api/v1/chat/sessions",
            json={"title": "Tư vấn dinh dưỡng tiểu đường"},
            headers=headers1
        )
        assert session_create_res.status_code == 201
        session_data = session_create_res.json()
        session_id = session_data["id"]
        assert session_data["title"] == "Tư vấn dinh dưỡng tiểu đường"
        assert len(session_data["messages"]) >= 1  # Tin nhắn chào mừng ban đầu

        # 3. Lấy danh sách phiên
        list_res = await client.get("/api/v1/chat/sessions", headers=headers1)
        assert list_res.status_code == 200
        sessions = list_res.json()
        assert any(s["id"] == session_id for s in sessions)

        # 4. Gửi câu hỏi thông thường (dinh dưỡng / lối sống)
        msg_res = await client.post(
            f"/api/v1/chat/sessions/{session_id}/message",
            json={"content": "Tôi nên ăn uống như thế nào và ăn bao nhiêu muối để phòng ngừa tăng huyết áp?"},
            headers=headers1
        )
        assert msg_res.status_code == 200
        msg_data = msg_res.json()
        assert msg_data["is_emergency"] is False
        assert msg_data["assistant_message"]["content"] != ""
        assert len(msg_data["cited_sources"]) > 0

        # 5. Gửi triệu chứng khẩn cấp
        emg_res = await client.post(
            f"/api/v1/chat/sessions/{session_id}/message",
            json={"content": "Tôi đang bị đau thắt ngực dữ dội đè nặng sau xương ức và vã mồ hôi"},
            headers=headers1
        )
        assert emg_res.status_code == 200
        emg_data = emg_res.json()
        assert emg_data["is_emergency"] is True
        assert emg_data["emergency_alert"] is not None
        assert "115" in emg_data["assistant_message"]["content"]

        # 6. Kiểm tra Row-level Security với User 2
        user2_email = f"chat_other_{uuid.uuid4().hex[:8]}@example.com"
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": user2_email,
                "password": pwd,
                "full_name": "Lê Văn Khác",
                "date_of_birth": "1992-01-01",
                "gender": "MALE",
                "height_cm": 172.0,
                "weight_kg": 68.0,
            }
        )
        login2_res = await client.post(
            "/api/v1/auth/login",
            json={"email": user2_email, "password": pwd}
        )
        token2 = login2_res.json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # User 2 không được phép truy cập session của User 1
        unauthorized_res = await client.get(
            f"/api/v1/chat/sessions/{session_id}",
            headers=headers2
        )
        assert unauthorized_res.status_code == 404
