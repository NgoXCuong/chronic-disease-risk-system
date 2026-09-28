"""
Bộ kiểm thử Tích hợp và Kiểm thử Biên y học cho Sprint 9 (S09: Screening & Inference Engine).
Tuân thủ Trụ cột 7 (Dễ kiểm thử & Có thể chứng minh) và Trụ cột 8 (Minh bạch học thuật).
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_get_loaded_models_registry():

    """Kiểm tra API liệt kê danh sách 5 mô hình đã nạp vào RAM."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/screening/models")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 5

        loaded_diseases = [m["disease"] for m in data]
        expected_diseases = [
            "diabetes_binary",
            "hypertension",
            "cardiovascular",
            "stroke",
            "diabetes_clinical",
        ]
        for exp in expected_diseases:
            assert exp in loaded_diseases


@pytest.mark.asyncio
async def test_medical_boundary_young_healthy_adult():
    """
    Kiểm thử biên y học (Medical Boundary Testing) - Kịch bản 1:
    Người trẻ tuổi, thể chất bình thường, tập thể dục thường xuyên, không hút thuốc.
    Kỳ vọng bắt buộc: Nguy cơ phải ở mức THẤP (LOW) và dưới ngưỡng cảnh báo lâm sàng.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        healthy_payload = {
            "HighBP": 0,
            "HighChol": 0,
            "CholCheck": 1,
            "BMI": 21.5,
            "Smoker": 0,
            "Stroke": 0,
            "HeartDiseaseorAttack": 0,
            "PhysActivity": 1,
            "Fruits": 1,
            "Veggies": 1,
            "HvyAlcoholConsump": 0,
            "AnyHealthcare": 1,
            "NoDocbcCost": 0,
            "GenHlth": 1,  # Rất tốt
            "MentHlth": 0,
            "PhysHlth": 0,
            "DiffWalk": 0,
            "Sex": 0,      # Nữ
            "Age": 2,      # 25-29 tuổi
            "Education": 6,
            "Income": 7,
        }

        res = await client.post(
            "/api/v1/screening/predict/lifestyle/diabetes_binary",
            json=healthy_payload,
        )
        assert res.status_code == 200
        result = res.json()

        assert result["disease"] == "diabetes_binary"
        assert result["risk_level"] == "LOW"
        assert result["risk_score"] < result["optimal_threshold"]
        assert result["is_above_threshold"] is False
        assert len(result["top_risk_factors"]) > 0
        assert len(result["recommendations"]) > 0


@pytest.mark.asyncio
async def test_medical_boundary_elderly_high_risk_patient():
    """
    Kiểm thử biên y học (Medical Boundary Testing) - Kịch bản 2:
    Bệnh nhân cao tuổi (75+), béo phì độ 2, hút thuốc, tiền sử cao huyết áp và mỡ máu.
    Kỳ vọng bắt buộc: Phải kích hoạt mức nguy cơ CAO (HIGH) và vượt ngưỡng cảnh báo lâm sàng.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        high_risk_payload = {
            "HighBP": 1,
            "HighChol": 1,
            "CholCheck": 1,
            "BMI": 36.8,   # Béo phì
            "Smoker": 1,   # Hút thuốc lá
            "Stroke": 0,
            "HeartDiseaseorAttack": 1,  # Tiền sử tim mạch
            "PhysActivity": 0,          # Không tập thể thao
            "Fruits": 0,
            "Veggies": 0,
            "HvyAlcoholConsump": 0,
            "AnyHealthcare": 1,
            "NoDocbcCost": 1,
            "GenHlth": 5,  # Sức khỏe rất kém
            "MentHlth": 10,
            "PhysHlth": 20,
            "DiffWalk": 1, # Khó khăn vận động
            "Sex": 1,      # Nam
            "Age": 12,     # 75-79 tuổi
            "Education": 3,
            "Income": 2,
        }

        res = await client.post(
            "/api/v1/screening/predict/lifestyle/diabetes_binary",
            json=high_risk_payload,
        )
        assert res.status_code == 200
        result = res.json()

        assert result["disease"] == "diabetes_binary"
        assert result["risk_level"] == "HIGH"
        assert result["risk_score"] >= result["optimal_threshold"]
        assert result["is_above_threshold"] is True
        assert any("tăng" in f["impact"] for f in result["top_risk_factors"])


@pytest.mark.asyncio
async def test_clinical_pima_diabetes_prediction():
    """Kiểm thử suy luận mô hình đái tháo đường qua xét nghiệm sinh hóa lâm sàng (Tầng 2 - Pima)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Ca đường huyết rất cao (185 mg/dL)
        clinical_payload = {
            "Pregnancies": 2,
            "Glucose": 185.0,
            "BloodPressure": 90.0,
            "SkinThickness": 35.0,
            "Insulin": 220.0,
            "BMI": 38.5,
            "DiabetesPedigreeFunction": 0.85,
            "Age": 52,
        }

        res = await client.post(
            "/api/v1/screening/predict/clinical/diabetes",
            json=clinical_payload,
        )
        assert res.status_code == 200
        result = res.json()

        assert result["disease"] == "diabetes_clinical"
        assert result["risk_level"] in ["MEDIUM", "HIGH"]
        assert result["risk_percentage"] > 25.0
        # Đảm bảo Glucose nằm trong các yếu tố nguy cơ hàng đầu
        factors = [f["feature"] for f in result["top_risk_factors"]]
        assert "Glucose" in factors or "BMI" in factors


@pytest.mark.asyncio
async def test_comprehensive_lifestyle_screening():
    """Kiểm thử sàng lọc toàn diện đa bệnh mạn tính trong 1 lần gửi duy nhất."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "HighBP": 1,
            "HighChol": 0,
            "CholCheck": 1,
            "BMI": 27.5,
            "Smoker": 0,
            "Stroke": 0,
            "HeartDiseaseorAttack": 0,
            "PhysActivity": 1,
            "Fruits": 1,
            "Veggies": 1,
            "HvyAlcoholConsump": 0,
            "AnyHealthcare": 1,
            "NoDocbcCost": 0,
            "GenHlth": 3,
            "MentHlth": 2,
            "PhysHlth": 3,
            "DiffWalk": 0,
            "Sex": 1,
            "Age": 8,  # 55-59 tuổi
            "Education": 4,
            "Income": 5,
        }

        res = await client.post("/api/v1/screening/comprehensive", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "diabetes_binary" in data
        assert "hypertension" in data
        assert "cardiovascular" in data
        assert "stroke" in data

        for d_key, pred in data.items():
            assert 0.0 <= pred["risk_score"] <= 1.0
            assert pred["risk_level"] in ["LOW", "MEDIUM", "HIGH"]
            assert len(pred["recommendations"]) > 0


@pytest.mark.asyncio
async def test_invalid_input_validation():
    """Kiểm thử bắt lỗi dữ liệu đầu vào vượt ngưỡng sinh học (HTTP 422)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        invalid_payload = {
            "BMI": 999.0,  # Vượt quá ngưỡng tối đa 70.0
            "GenHlth": 9,  # Vượt quá khoảng [1, 5]
            "Age": 99,     # Vượt quá khoảng [1, 13]
        }
        res = await client.post(
            "/api/v1/screening/predict/lifestyle/diabetes_binary",
            json=invalid_payload,
        )
        assert res.status_code == 422
