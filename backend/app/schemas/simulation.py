"""
Pydantic Schemas phục vụ Mô phỏng Can thiệp Lối sống "What-If" (FR-17 -> FR-19).
Tuân thủ Hợp đồng dữ liệu liên module và kiến trúc phân tầng trong AGENTS.md.
"""
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.models.enums import RiskLevel


class WhatIfSimulationRequest(BaseModel):
    """
    Dữ liệu yêu cầu tính toán kịch bản giả định What-If.
    Có thể truyền record_id để lấy dữ liệu gốc từ CSDL, hoặc truyền trực tiếp baseline_input.
    """
    record_id: Optional[uuid.UUID] = Field(
        default=None,
        description="ID bản ghi khảo sát gốc trong health_records để làm mốc đối chứng (baseline)"
    )
    baseline_input: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Dữ liệu khảo sát gốc nếu người dùng chưa lưu CSDL hoặc dùng khách vãng lai"
    )
    modified_features: Dict[str, Any] = Field(
        ...,
        description="Tập các đặc trưng lối sống được can thiệp giả định (BMI, Smoker, PhysActivity, Fruits, Veggies, HvyAlcoholConsump, GenHlth...)"
    )


class WhatIfDiseaseComparison(BaseModel):
    """So sánh đối chiếu chi tiết Trước vs. Sau can thiệp cho từng bệnh lý."""
    disease: str
    disease_name_vi: str
    baseline_risk_score: float = Field(..., ge=0.0, le=1.0)
    baseline_risk_percentage: float = Field(..., ge=0.0, le=100.0)
    baseline_risk_level: RiskLevel
    simulated_risk_score: float = Field(..., ge=0.0, le=1.0)
    simulated_risk_percentage: float = Field(..., ge=0.0, le=100.0)
    simulated_risk_level: RiskLevel
    delta_risk_score: float = Field(
        ...,
        description="Chênh lệch xác suất: simulated_score - baseline_score"
    )
    delta_percentage: float = Field(
        ...,
        description="Chênh lệch phần trăm: simulated_pct - baseline_pct (âm là giảm nguy cơ)"
    )
    is_improved: bool = Field(
        ...,
        description="True nếu nguy cơ giảm hoặc giữ nguyên ở mức an toàn"
    )
    clinical_message: str = Field(
        ...,
        description="Thông điệp y tế lâm sàng giải thích tác động của thay đổi"
    )


class WhatIfSimulationResponse(BaseModel):
    """Kết quả hoàn chỉnh của một phiên phân tích mô phỏng What-If."""
    record_id: Optional[uuid.UUID] = None
    baseline_features: Dict[str, Any]
    simulated_features: Dict[str, Any]
    comparisons: List[WhatIfDiseaseComparison]
    average_risk_reduction: float = Field(
        ...,
        description="Mức giảm nguy cơ trung bình trên cả 4 bệnh lý (%)"
    )
    overall_clinical_summary: str = Field(
        ...,
        description="Nhận định lâm sàng tổng thể và lời khuyên y tế khích lệ"
    )
    simulation_id: Optional[uuid.UUID] = None
