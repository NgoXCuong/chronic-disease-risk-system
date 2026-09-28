"""
Pydantic Schemas phục vụ Lưu trữ và Tra cứu Lịch sử Sàng lọc & Xu hướng Nguy cơ.
Tuân thủ Phân hệ 4 (FR-12, FR-13, FR-14, FR-15) trong YEU_CAU_CHUC_NANG_VA_LO_TRINH.md.
"""
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.models.enums import DiseaseType, RecordType, RiskLevel
from app.schemas.screening import RiskFactorItem


class ScreeningResultDetail(BaseModel):
    """Thông tin chi tiết một kết quả sàng lọc bệnh kèm giải thích SHAP cục bộ."""
    id: uuid.UUID
    health_record_id: uuid.UUID
    disease_type: DiseaseType
    disease_name_vi: str
    model_version: str
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_percentage: float = Field(..., ge=0.0, le=100.0)
    risk_level: RiskLevel
    optimal_threshold: float
    is_above_threshold: bool
    top_risk_factors: List[RiskFactorItem] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    shap_summary: Dict[str, float] = Field(default_factory=dict)
    created_at: datetime


class HealthRecordResponse(BaseModel):
    """Hồ sơ khảo sát sức khỏe đầy đủ kèm toàn bộ kết quả phân tích AI."""
    id: uuid.UUID
    user_id: uuid.UUID
    record_type: RecordType
    input_data: Dict[str, Any]
    notes: Optional[str] = None
    created_at: datetime
    screening_results: List[ScreeningResultDetail] = Field(default_factory=list)


class ScreeningHistoryItem(BaseModel):
    """Mục tóm tắt trong dòng thời gian lịch sử sàng lọc (FR-13)."""
    record_id: uuid.UUID
    record_type: RecordType
    created_at: datetime
    notes: Optional[str] = None
    diseases_count: int
    highest_risk_level: RiskLevel
    highest_risk_score: float
    screened_diseases: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Danh sách ngắn các bệnh kèm mức nguy cơ (ví dụ: [{'disease': 'diabetes_binary', 'risk_level': 'HIGH', 'score': 0.75}])"
    )


class ScreeningHistoryResponse(BaseModel):
    """Danh sách phân trang lịch sử các đợt sàng lọc của người dùng."""
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[ScreeningHistoryItem]


class RiskTrajectoryPoint(BaseModel):
    """Điểm dữ liệu trên biểu đồ đường chuỗi thời gian diễn tiến nguy cơ (FR-14, FR-15)."""
    record_id: uuid.UUID
    screening_result_id: uuid.UUID
    recorded_at: datetime
    risk_score: float
    risk_percentage: float
    risk_level: RiskLevel
    optimal_threshold: float
    is_above_threshold: bool
    delta_risk: Optional[float] = Field(
        default=None,
        description="Độ biến thiên nguy cơ so với lần sàng lọc liền trước (Score_mới - Score_cũ)"
    )
    trend_status: Optional[str] = Field(
        default=None,
        description="Trạng thái xu hướng: Tích cực (Nguy cơ giảm), Ổn định, Cần chú ý (Nguy cơ tăng)"
    )


class RiskTrajectoryResponse(BaseModel):
    """Toàn bộ chuỗi thời gian theo dõi xu hướng nguy cơ của một bệnh lý (FR-14, FR-15)."""
    disease_type: DiseaseType
    disease_name_vi: str
    total_evaluations: int
    optimal_threshold: float
    overall_trend: str
    trajectory: List[RiskTrajectoryPoint]
