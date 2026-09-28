"""
Pydantic Schemas phục vụ Sàng lọc Nguy cơ Bệnh Mạn tính (Screening & ML Inference).
Tuân thủ Hợp đồng dữ liệu liên module (Inter-Module Data Contract B) trong AGENTS.md.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DiseaseType, RiskLevel


class LifestyleScreeningRequest(BaseModel):
    """
    Dữ liệu đầu vào cho khảo sát sàng lọc Tầng 1 (CDC BRFSS - Khảo sát lối sống & thể chất).
    Áp dụng chung cho 4 bệnh mạn tính: Đái tháo đường, Tăng huyết áp, Tim mạch, Đột quỵ.
    """
    model_config = ConfigDict(extra="ignore")

    HighBP: int = Field(default=0, ge=0, le=1, description="Tiền sử huyết áp cao (0: Không, 1: Có)")
    HighChol: int = Field(default=0, ge=0, le=1, description="Tiền sử mỡ máu/cholesterol cao (0: Không, 1: Có)")
    CholCheck: int = Field(default=1, ge=0, le=1, description="Đã kiểm tra cholesterol trong 5 năm (0: Không, 1: Có)")
    BMI: float = Field(..., ge=10.0, le=70.0, description="Chỉ số khối cơ thể (BMI = kg / m^2)")
    Smoker: int = Field(default=0, ge=0, le=1, description="Thói quen hút thuốc lá (0: Không, 1: Đã hút ít nhất 100 điếu)")
    Stroke: int = Field(default=0, ge=0, le=1, description="Tiền sử từng đột quỵ (0: Không, 1: Có)")
    HeartDiseaseorAttack: int = Field(default=0, ge=0, le=1, description="Tiền sử nhồi máu cơ tim hoặc bệnh mạch vành (0: Không, 1: Có)")
    Diabetes_binary: Optional[int] = Field(default=0, ge=0, le=1, description="Tiền sử đái tháo đường (0: Không, 1: Có)")
    PhysActivity: int = Field(default=1, ge=0, le=1, description="Có tập thể dục / hoạt động thể lực trong 30 ngày (0: Không, 1: Có)")
    Fruits: int = Field(default=1, ge=0, le=1, description="Ăn trái cây ít nhất 1 lần/ngày (0: Không, 1: Có)")
    Veggies: int = Field(default=1, ge=0, le=1, description="Ăn rau xanh ít nhất 1 lần/ngày (0: Không, 1: Có)")
    HvyAlcoholConsump: int = Field(default=0, ge=0, le=1, description="Uống nhiều rượu bia (>14 ly/tuần nam, >7 ly/tuần nữ) (0: Không, 1: Có)")
    AnyHealthcare: int = Field(default=1, ge=0, le=1, description="Có bảo hiểm y tế (0: Không, 1: Có)")
    NoDocbcCost: int = Field(default=0, ge=0, le=1, description="Không thể đi khám do chi phí kinh tế (0: Không, 1: Có)")
    GenHlth: int = Field(..., ge=1, le=5, description="Đánh giá sức khỏe tổng quát (1: Rất tốt, 2: Tốt, 3: Khá, 4: Trung bình, 5: Kém)")
    MentHlth: int = Field(default=0, ge=0, le=30, description="Số ngày sức khỏe tinh thần không tốt trong tháng (0-30 ngày)")
    PhysHlth: int = Field(default=0, ge=0, le=30, description="Số ngày sức khỏe thể chất bị ốm/đau trong tháng (0-30 ngày)")
    DiffWalk: int = Field(default=0, ge=0, le=1, description="Gặp khó khăn nghiêm trọng khi đi bộ hoặc leo cầu thang (0: Không, 1: Có)")
    Sex: int = Field(..., ge=0, le=1, description="Giới tính sinh học (0: Nữ, 1: Nam)")
    Age: int = Field(..., ge=1, le=13, description="Nhóm tuổi CDC (1: 18-24, 2: 25-29, ..., 9: 60-64, ..., 13: 80+)")
    Education: int = Field(default=4, ge=1, le=6, description="Trình độ học vấn (1: Chưa tốt nghiệp TH, 4: Tốt nghiệp THPT, 6: Đại học)")
    Income: int = Field(default=5, ge=1, le=8, description="Khung thu nhập gia đình (1: Thấp nhất -> 8: Cao nhất)")


class ClinicalDiabetesRequest(BaseModel):
    """
    Dữ liệu đầu vào cho khảo sát sàng lọc Tầng 2 (Bộ dữ liệu lâm sàng Pima Indians Diabetes).
    Dành cho người dùng đã có kết quả xét nghiệm sinh hóa máu định kỳ.
    """
    model_config = ConfigDict(extra="ignore")

    Pregnancies: int = Field(default=0, ge=0, le=20, description="Số lần mang thai")
    Glucose: float = Field(..., ge=40.0, le=500.0, description="Nồng độ Glucose huyết tương lúc đói (mg/dL)")
    BloodPressure: float = Field(..., ge=30.0, le=200.0, description="Huyết áp tâm trương khi đo (mmHg)")
    SkinThickness: float = Field(default=20.0, ge=5.0, le=100.0, description="Độ dày nếp gấp da cơ tam đầu (mm)")
    Insulin: float = Field(default=80.0, ge=5.0, le=900.0, description="Nồng độ Insulin huyết thanh 2 giờ (mu U/ml)")
    BMI: float = Field(..., ge=10.0, le=70.0, description="Chỉ số khối cơ thể (BMI = kg / m^2)")
    DiabetesPedigreeFunction: float = Field(default=0.47, ge=0.05, le=3.0, description="Chỉ số phả hệ đái tháo đường di truyền")
    Age: int = Field(..., ge=18, le=120, description="Tuổi tính theo năm")


class RiskFactorItem(BaseModel):
    """Chi tiết từng yếu tố nguy cơ được giải thích bởi thuật toán TreeSHAP."""
    feature: str = Field(..., description="Tên định danh đặc trưng kỹ thuật")
    feature_name_vi: str = Field(..., description="Tên đặc trưng tiếng Việt thân thiện")
    value: Any = Field(..., description="Giá trị chỉ số thực tế của người bệnh")
    shap_value: float = Field(..., description="Độ đóng góp SHAP value thô")
    impact: str = Field(..., description="Mô tả mức độ tác động (ví dụ: '+22.5% nguy cơ')")
    is_positive_risk: bool = Field(..., description="True nếu làm tăng rủi ro, False nếu là yếu tố bảo vệ/giảm rủi ro")


class DiseasePredictionResponse(BaseModel):
    """
    Chuẩn phản hồi API Đánh giá nguy cơ (Inter-Module Contract B).
    Bảo đảm định dạng thống nhất để tầng Frontend kết nối trực tiếp vào biểu đồ.
    """
    disease: str = Field(..., description="Tên định danh bệnh lý")
    disease_name_vi: str = Field(..., description="Tên bệnh tiếng Việt chuẩn mực y tế")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Điểm xác suất rủi ro đã hiệu chuẩn lâm sàng (0.0 - 1.0)")
    risk_percentage: float = Field(..., ge=0.0, le=100.0, description="Tỷ lệ phần trăm nguy cơ (0% - 100%)")
    risk_level: str = Field(..., description="Phân tầng nguy cơ y tế: LOW, MEDIUM, hoặc HIGH")
    optimal_threshold: float = Field(..., description="Ngưỡng cắt tối ưu Youden's J của mô hình")
    is_above_threshold: bool = Field(..., description="True nếu điểm nguy cơ vượt ngưỡng cảnh báo lâm sàng")
    top_risk_factors: List[RiskFactorItem] = Field(default_factory=list, description="Top các yếu tố đóng góp chính theo SHAP")
    recommendations: List[str] = Field(default_factory=list, description="Khuyến nghị lối sống và theo dõi lâm sàng")
    disclaimer: str = Field(
        default="Kết quả chỉ mang tính sàng lọc hỗ trợ quyết định, không thay thế chẩn đoán chuyên môn y khoa.",
        description="Tuyên bố miễn trừ trách nhiệm y tế bắt buộc"
    )


class LoadedModelSummary(BaseModel):
    """Thông tin tóm tắt về mô hình Machine Learning đã nạp sẵn trong bộ nhớ RAM."""
    disease: str
    disease_name_vi: str
    model_type: str
    optimal_threshold: float
    trained_date: Optional[str] = None
    features_count: int
    features_order: List[str]
    metrics: Dict[str, Any]
