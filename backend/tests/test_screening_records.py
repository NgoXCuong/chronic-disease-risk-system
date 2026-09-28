"""
Bộ kiểm thử Tích hợp & Kiểm thử Bảo mật CSDL cho Sprint 10 (S10: Record & Screening History).
Tuân thủ Trụ cột 5 (Bảo mật y tế & Row-level Authorization) và Trụ cột 7 (Dễ kiểm thử).
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_anonymous_screening_does_not_persist():

    """Kiểm tra: Khảo sát ẩn danh (không gửi JWT token) vẫn hoạt động nhưng không lưu vào CSDL."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "HighBP": 0,
            "HighChol": 0,
            "CholCheck": 1,
            "BMI": 22.0,
            "Smoker": 0,
            "Stroke": 0,
            "HeartDiseaseorAttack": 0,
            "PhysActivity": 1,
            "Fruits": 1,
            "Veggies": 1,
            "HvyAlcoholConsump": 0,
            "AnyHealthcare": 1,
            "NoDocbcCost": 0,
            "GenHlth": 2,
            "MentHlth": 0,
            "PhysHlth": 0,
            "DiffWalk": 0,
            "Sex": 1,
            "Age": 3,
            "Education": 6,
            "Income": 7,
        }
        res = await client.post("/api/v1/screening/predict/lifestyle/diabetes_binary", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["risk_level"] == "LOW"
        # Người dùng ẩn danh không lưu CSDL nên record_id phải là None
        assert data["record_id"] is None
        assert data["screening_result_id"] is None
        assert "shap_summary" in data


@pytest.mark.asyncio
async def test_authenticated_screening_and_history_lifecycle():
    """
    Vòng đời kiểm thử tích hợp hoàn chỉnh Sprint 10:
    1. Đăng ký tài khoản User A & Đăng nhập lấy Bearer token.
    2. Thực hiện Sàng lọc toàn diện (Tầng 1 - 4 bệnh) có token -> Lưu CSDL thành công.
    3. Kiểm tra record_id và screening_result_id được trả về.
    4. Gọi API /history -> Kiểm tra hiển thị đúng bản ghi vừa lưu.
    5. Gọi API /history/{record_id} -> Kiểm tra chi tiết đầy đủ 4 kết quả kèm giải thích SHAP.
    6. Thực hiện khảo sát lần 2 với chỉ số rủi ro cao hơn -> Kiểm tra diễn tiến nguy cơ /trajectory.
    7. Tạo User B và thử truy cập bản ghi của User A -> Bị chặn 404 (Row-Level Security).
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Đăng ký & Đăng nhập User A
        email_a = f"patient_{uuid.uuid4().hex[:8]}@example.com"
        pwd = "Password123@"
        res_reg = await client.post("/api/v1/auth/register", json={
            "email": email_a,
            "password": pwd,
            "full_name": "Bệnh nhân Kiểm thử A",
            "date_of_birth": "1988-06-20",
            "gender": "MALE",
            "height_cm": 172.0,
            "weight_kg": 68.0,
        })
        assert res_reg.status_code == 201

        res_login = await client.post("/api/v1/auth/login", json={"email": email_a, "password": pwd})
        assert res_login.status_code == 200
        token_a = res_login.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Sàng lọc toàn diện lần 1 (Chỉ số khỏe mạnh)
        survey_1 = {
            "HighBP": 0,
            "HighChol": 0,
            "CholCheck": 1,
            "BMI": 22.0,
            "Smoker": 0,
            "Stroke": 0,
            "HeartDiseaseorAttack": 0,
            "PhysActivity": 1,
            "Fruits": 1,
            "Veggies": 1,
            "HvyAlcoholConsump": 0,
            "AnyHealthcare": 1,
            "NoDocbcCost": 0,
            "GenHlth": 2,
            "MentHlth": 1,
            "PhysHlth": 0,
            "DiffWalk": 0,
            "Sex": 1,
            "Age": 4,
            "Education": 6,
            "Income": 8,
            "notes": "Khảo sát định kỳ đầu năm",
        }
        res_comp_1 = await client.post("/api/v1/screening/comprehensive", json=survey_1, headers=headers_a)
        assert res_comp_1.status_code == 200
        data_comp_1 = res_comp_1.json()

        # Kiểm tra đủ 4 bệnh lý được trả về
        assert "diabetes_binary" in data_comp_1
        assert "hypertension" in data_comp_1
        assert "cardiovascular" in data_comp_1
        assert "stroke" in data_comp_1

        # Cả 4 bệnh phải có cùng 1 record_id đại diện cho đợt khảo sát đó
        record_id_1 = data_comp_1["diabetes_binary"]["record_id"]
        assert record_id_1 is not None
        assert data_comp_1["hypertension"]["record_id"] == record_id_1
        assert data_comp_1["diabetes_binary"]["screening_result_id"] is not None
        assert len(data_comp_1["diabetes_binary"]["shap_summary"]) > 0

        # 3. Lấy danh sách lịch sử sàng lọc (FR-13)
        res_hist = await client.get("/api/v1/screening/history", headers=headers_a)
        assert res_hist.status_code == 200
        data_hist = res_hist.json()
        assert data_hist["total"] >= 1
        first_item = data_hist["items"][0]
        assert first_item["record_id"] == record_id_1
        assert first_item["diseases_count"] == 4
        assert first_item["notes"] == "Khảo sát định kỳ đầu năm"

        # 4. Xem chi tiết hồ sơ khảo sát (FR-12, FR-13)
        res_detail = await client.get(f"/api/v1/screening/history/{record_id_1}", headers=headers_a)
        assert res_detail.status_code == 200
        data_detail = res_detail.json()
        assert data_detail["id"] == record_id_1
        assert len(data_detail["screening_results"]) == 4
        # Kiểm tra giải thích SHAP nguyên vẹn từ PostgreSQL JSONB
        first_sr = data_detail["screening_results"][0]
        assert "shap_summary" in first_sr
        assert len(first_sr["top_risk_factors"]) > 0
        assert len(first_sr["recommendations"]) > 0

        # 5. Sàng lọc lần 2: Người dùng tăng cân và bắt đầu hút thuốc (Khảo sát sau 6 tháng)
        survey_2 = {
            "HighBP": 1,
            "HighChol": 1,
            "CholCheck": 1,
            "BMI": 31.0,
            "Smoker": 1,
            "Stroke": 0,
            "HeartDiseaseorAttack": 0,
            "PhysActivity": 0,
            "Fruits": 0,
            "Veggies": 0,
            "HvyAlcoholConsump": 1,
            "AnyHealthcare": 1,
            "NoDocbcCost": 0,
            "GenHlth": 4,
            "MentHlth": 10,
            "PhysHlth": 5,
            "DiffWalk": 0,
            "Sex": 1,
            "Age": 5,
            "Education": 6,
            "Income": 8,
            "notes": "Tái khám sau 6 tháng, tăng cân",
        }
        res_pred_2 = await client.post(
            "/api/v1/screening/predict/lifestyle/diabetes_binary",
            json=survey_2,
            headers=headers_a
        )
        assert res_pred_2.status_code == 200
        assert res_pred_2.json()["record_id"] is not None

        # 6. Kiểm tra biểu đồ chuỗi thời gian diễn tiến nguy cơ (FR-14, FR-15)
        res_traj = await client.get("/api/v1/screening/trajectory/diabetes_binary", headers=headers_a)
        assert res_traj.status_code == 200
        data_traj = res_traj.json()
        assert data_traj["disease_type"] == "diabetes_binary"
        assert data_traj["total_evaluations"] >= 2
        # Điểm dữ liệu thứ 2 phải có tính toán Delta Risk
        last_point = data_traj["trajectory"][-1]
        assert last_point["delta_risk"] is not None
        assert last_point["trend_status"] is not None

        # 7. Kiểm tra Bảo mật phân quyền theo hàng (Row-level Isolation - Trụ cột 5)
        # Tạo User B
        email_b = f"patient_{uuid.uuid4().hex[:8]}@example.com"
        res_reg_b = await client.post("/api/v1/auth/register", json={
            "email": email_b,
            "password": pwd,
            "full_name": "Bệnh nhân Kiểm thử B",
            "date_of_birth": "1995-01-01",
            "gender": "FEMALE",
            "height_cm": 160.0,
            "weight_kg": 50.0,
        })
        assert res_reg_b.status_code == 201

        res_login_b = await client.post("/api/v1/auth/login", json={"email": email_b, "password": pwd})
        token_b = res_login_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User B thử xem bản ghi khảo sát của User A -> Phải bị chặn 404
        res_unauthorized = await client.get(f"/api/v1/screening/history/{record_id_1}", headers=headers_b)
        assert res_unauthorized.status_code == 404
