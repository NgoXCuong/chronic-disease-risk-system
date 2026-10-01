"""
Bộ kiểm thử Tự động cho Sprint 15: Module Mô phỏng Can thiệp Lối sống "What-If" (FR-17 -> FR-19).
Tuân thủ Trụ cột 7 (Dễ kiểm thử) và Trụ cột 8 (Tính tái lập).
"""
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio
async def test_what_if_simulation_lifestyle_intervention():
    """
    Kiểm thử kịch bản can thiệp lối sống tích cực:
    Baseline: Người thừa cân (BMI 32.0), hút thuốc lá, uống nhiều bia rượu, không tập thể dục.
    Intervention: Giảm BMI xuống 24.0, bỏ hút thuốc hoàn toàn, cai bia rượu, tập thể dục đều đặn.
    Kỳ vọng: Toàn bộ 4 bệnh mạn tính phải có mức giảm rủi ro đáng kể (delta_percentage < 0).
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        baseline = {
            "HighBP": 1,
            "HighChol": 1,
            "CholCheck": 1,
            "BMI": 32.0,
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
            "PhysHlth": 8,
            "DiffWalk": 0,
            "Sex": 1,
            "Age": 8,
            "Education": 4,
            "Income": 5,
        }

        payload = {
            "baseline_input": baseline,
            "modified_features": {
                "BMI": 24.0,
                "Smoker": 0,
                "HvyAlcoholConsump": 0,
                "PhysActivity": 1,
                "Fruits": 1,
                "Veggies": 1,
                "GenHlth": 2,
            },
        }

        res = await client.post("/api/v1/simulation/calculate", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "comparisons" in data
        assert len(data["comparisons"]) == 4
        assert data["average_risk_reduction"] > 0

        for comp in data["comparisons"]:
            # Điểm rủi ro sau can thiệp phải nhỏ hơn hoặc bằng mốc ban đầu
            assert comp["simulated_risk_percentage"] <= comp["baseline_risk_percentage"]
            assert comp["delta_percentage"] <= 0
            assert comp["is_improved"] is True
            assert len(comp["clinical_message"]) > 0


@pytest.mark.asyncio
async def test_what_if_validation_error():
    """Kiểm tra phản hồi lỗi khi không cung cấp dữ liệu đối chứng (record_id hoặc baseline_input)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post(
            "/api/v1/simulation/calculate",
            json={"modified_features": {"BMI": 22.0}},
        )
        assert res.status_code == 400
        assert "record_id" in res.json()["detail"]
