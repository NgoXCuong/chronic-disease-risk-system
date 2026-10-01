"""
Dịch vụ Xử lý Mô phỏng Can thiệp Lối sống "What-If" (Simulation Service).
Tuân thủ Trụ cột 1 (Ngắn gọn), Trụ cột 4 (Kiến trúc phân tầng) và Trụ cột 8 (Tính tái lập).
"""
import uuid
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logger import logger
from app.models.enums import DiseaseType, RiskLevel
from app.models.record import HealthRecord
from app.models.screening import ScreeningResult
from app.models.what_if import WhatIfSimulation
from app.schemas.simulation import (
    WhatIfDiseaseComparison,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
)
from app.services.ml_service import MLService, DISEASE_NAME_VI_MAP

# Danh sách các đặc trưng lối sống có thể can thiệp được (Modifiable Lifestyle Risk Factors)
MODIFIABLE_FEATURES = {
    "BMI",
    "Smoker",
    "PhysActivity",
    "Fruits",
    "Veggies",
    "HvyAlcoholConsump",
    "GenHlth",
    "PhysHlth",
    "MentHlth",
}

# 4 bệnh lý mạn tính Tầng 1 áp dụng mô phỏng
SIMULATION_DISEASES = [
    DiseaseType.DIABETES_BINARY.value,
    DiseaseType.HYPERTENSION.value,
    DiseaseType.CARDIOVASCULAR.value,
    DiseaseType.STROKE.value,
]


class SimulationService:
    """Nghiệp vụ thực thi tính toán đối chứng Trước vs. Sau can thiệp lối sống."""

    @staticmethod
    def _generate_disease_clinical_message(
        disease: str,
        delta_pct: float,
        is_improved: bool,
        sim_level: str
    ) -> str:
        """Sinh thông điệp y tế cá nhân hóa cho từng bệnh lý sau khi can thiệp."""
        abs_delta = abs(delta_pct)
        if not is_improved or delta_pct > 0.5:
            return f"Thay đổi này làm tăng nhẹ nguy cơ (+{abs_delta}%). Cần chú ý điều chỉnh cân bằng dinh dưỡng và vận động."

        if abs_delta < 1.0:
            return "Nguy cơ duy trì ở mức ổn định. Tiếp tục lối sống lành mạnh này."

        if disease == "cardiovascular":
            return f"Tuyệt vời! Việc giảm cân và hạn chế thuốc lá giúp giảm đáng kể gánh nặng mạch vành (-{abs_delta}% nguy cơ)."
        elif disease == "diabetes_binary":
            return f"Mức giảm -{abs_delta}% nguy cơ giúp cải thiện độ nhạy insulin và kiểm soát đường huyết hiệu quả."
        elif disease == "hypertension":
            return f"Giảm -{abs_delta}% nguy cơ tăng huyết áp, giúp bảo vệ tối ưu thành mạch và thận."
        elif disease == "stroke":
            return f"Giảm -{abs_delta}% nguy cơ đột quỵ não, hạ thấp đáng kể rủi ro thiếu máu não cục bộ."
        return f"Mục tiêu can thiệp mang lại hiệu quả phòng bệnh tích cực (giảm -{abs_delta}% nguy cơ)."

    @classmethod
    async def run_what_if_simulation(
        cls,
        db: AsyncSession,
        req: WhatIfSimulationRequest,
        user_id: Optional[uuid.UUID] = None,
    ) -> WhatIfSimulationResponse:
        """
        Thực hiện tính toán mô phỏng What-If:
        1. Lấy dữ liệu khảo sát gốc.
        2. Tạo bộ dữ liệu can thiệp lối sống (áp dụng các đặc trưng hợp lệ).
        3. Suy luận song song 4 mô hình ML cho cả 2 kịch bản.
        4. Tính toán độ chênh lệch Delta Risk và sinh thông điệp lâm sàng.
        """
        baseline_input: Dict[str, Any] = {}

        # 1. Trích xuất dữ liệu gốc từ CSDL hoặc từ payload gửi lên
        if req.record_id:
            query = select(HealthRecord).where(HealthRecord.id == req.record_id)
            if user_id:
                query = query.where(HealthRecord.user_id == user_id)
            res = await db.execute(query.options(selectinload(HealthRecord.screening_results)))
            record = res.scalar_one_or_none()
            if not record:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Không tìm thấy bản ghi khảo sát sức khỏe gốc để làm mốc đối chứng.",
                )
            baseline_input = dict(record.input_data or {})
        elif req.baseline_input:
            baseline_input = dict(req.baseline_input)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vui lòng cung cấp 'record_id' hoặc 'baseline_input' để làm mốc đối chứng.",
            )

        # 2. Xây dựng vector dữ liệu can thiệp giả định (Simulated Input)
        simulated_input = dict(baseline_input)
        applied_modifications: Dict[str, Any] = {}

        for feat, val in req.modified_features.items():
            if feat in MODIFIABLE_FEATURES:
                try:
                    simulated_input[feat] = float(val)
                    applied_modifications[feat] = float(val)
                except (ValueError, TypeError):
                    continue

        # 3. Suy luận đồng thời 4 mô hình ML cho cả 2 kịch bản
        comparisons: List[WhatIfDiseaseComparison] = []
        total_delta = 0.0

        for disease in SIMULATION_DISEASES:
            # Dự đoán mốc gốc (Baseline)
            base_pred = MLService.predict_disease_risk(disease, baseline_input)
            # Dự đoán mốc can thiệp giả định (Simulated)
            sim_pred = MLService.predict_disease_risk(disease, simulated_input)

            delta_score = round(sim_pred.risk_score - base_pred.risk_score, 4)
            delta_pct = round(sim_pred.risk_percentage - base_pred.risk_percentage, 2)
            is_improved = bool(delta_pct <= 0)

            total_delta += delta_pct

            clinical_msg = cls._generate_disease_clinical_message(
                disease=disease,
                delta_pct=delta_pct,
                is_improved=is_improved,
                sim_level=sim_pred.risk_level,
            )

            comparisons.append(
                WhatIfDiseaseComparison(
                    disease=disease,
                    disease_name_vi=DISEASE_NAME_VI_MAP.get(disease, disease),
                    baseline_risk_score=base_pred.risk_score,
                    baseline_risk_percentage=base_pred.risk_percentage,
                    baseline_risk_level=base_pred.risk_level,
                    simulated_risk_score=sim_pred.risk_score,
                    simulated_risk_percentage=sim_pred.risk_percentage,
                    simulated_risk_level=sim_pred.risk_level,
                    delta_risk_score=delta_score,
                    delta_percentage=delta_pct,
                    is_improved=is_improved,
                    clinical_message=clinical_msg,
                )
            )

        avg_reduction = round(-total_delta / len(SIMULATION_DISEASES), 2)

        # 4. Sinh tổng quan nhận định lâm sàng
        if avg_reduction > 10.0:
            overall_summary = (
                f"Kịch bản can thiệp xuất sắc! Lối sống mới giúp bạn giảm trung bình {avg_reduction}% rủi ro "
                f"trên toàn bộ 4 bệnh mạn tính chính. Đây là mục tiêu vô cùng giá trị để bắt đầu thực hiện ngay hôm nay."
            )
        elif avg_reduction > 3.0:
            overall_summary = (
                f"Mục tiêu can thiệp khả thi và có ý nghĩa lâm sàng rõ rệt (giảm trung bình {avg_reduction}% nguy cơ). "
                f"Kiên trì áp dụng chế độ này sẽ giúp đưa các chỉ số về vùng ranh giới an toàn."
            )
        elif avg_reduction > 0:
            overall_summary = (
                f"Lối sống mới giúp cải thiện nhẹ nguy cơ (giảm {avg_reduction}%). "
                f"Bạn có thể kết hợp thêm tăng vận động thể thao hoặc kiểm soát calo để đạt hiệu quả bảo vệ cao hơn."
            )
        else:
            overall_summary = (
                "Kịch bản giả định chưa tạo ra sự cải thiện nguy cơ đáng kể. "
                "Hãy thử giảm cân nặng mục tiêu hoặc tăng cường rau xanh và tập thể thao đều đặn."
            )

        return WhatIfSimulationResponse(
            record_id=req.record_id,
            baseline_features=baseline_input,
            simulated_features=simulated_input,
            comparisons=comparisons,
            average_risk_reduction=max(0.0, avg_reduction),
            overall_clinical_summary=overall_summary,
        )
