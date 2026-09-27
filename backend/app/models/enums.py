import enum


class UserRole(str, enum.Enum):
    """User access control roles (RBAC)."""
    USER = "USER"
    HEALTH_CONSULTANT = "HEALTH_CONSULTANT"
    ADMIN = "ADMIN"


class BiologicalSex(str, enum.Enum):
    """Biological sex at birth for clinical reference standards."""
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class RecordType(str, enum.Enum):
    """Categorization of health screening surveys."""
    LIFESTYLE_BRFSS = "LIFESTYLE_BRFSS"
    CLINICAL_PIMA = "CLINICAL_PIMA"


class DiseaseType(str, enum.Enum):
    """Target chronic non-communicable diseases evaluated by ML models."""
    DIABETES_BINARY = "diabetes_binary"
    HYPERTENSION = "hypertension"
    CARDIOVASCULAR = "cardiovascular"
    STROKE = "stroke"
    DIABETES_CLINICAL = "diabetes_clinical"


class RiskLevel(str, enum.Enum):
    """Clinical risk stratification based on optimal decision thresholds."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class MessageSenderRole(str, enum.Enum):
    """Sender roles in AI Assistant conversations."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class FacilitySpecialty(str, enum.Enum):
    """Medical hospital/clinic clinical specialties."""
    ENDOCRINOLOGY = "ENDOCRINOLOGY"           # Nội tiết & Đái tháo đường
    CARDIOLOGY = "CARDIOLOGY"                 # Tim mạch & Tăng huyết áp
    STROKE_NEUROLOGY = "STROKE_NEUROLOGY"     # Đột quỵ & Thần kinh mạch máu
    GENERAL_HOSPITAL = "GENERAL_HOSPITAL"     # Bệnh viện Đa khoa


class FacilityTier(str, enum.Enum):
    """Administrative healthcare hierarchy tier."""
    CENTRAL = "CENTRAL"                       # Tuyến Trung ương
    PROVINCIAL = "PROVINCIAL"                 # Tuyến Tỉnh / Thành phố
    DISTRICT = "DISTRICT"                     # Tuyến Huyện / Quận
    PRIVATE = "PRIVATE"                       # Bệnh viện / Phòng khám Tư nhân


class NotificationType(str, enum.Enum):
    """Notification event types for chronic disease monitoring."""
    SCREENING_REMINDER = "SCREENING_REMINDER"   # Nhắc nhở định kỳ tái sàng lọc (3 tháng, 6 tháng)
    HIGH_RISK_ALERT = "HIGH_RISK_ALERT"         # Cảnh báo chỉ số nguy cơ cao bất thường
    LIFESTYLE_GOAL = "LIFESTYLE_GOAL"           # Nhắc nhở mục tiêu can thiệp lối sống What-If
    DOCTOR_NOTE = "DOCTOR_NOTE"                 # Ý kiến tham vấn từ bác sĩ / cán bộ y tế
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT" # Thông báo hệ thống / cập nhật mô hình


class NotificationPriority(str, enum.Enum):
    """Triage priority level for notifications."""
    LOW = "LOW"
    NORMAL = "NORMAL"
    HIGH = "HIGH"
    URGENT = "URGENT"


class TokenType(str, enum.Enum):
    """Cryptographic authentication & verification token types."""
    REFRESH_TOKEN = "REFRESH_TOKEN"             # Refresh token dài hạn cho rotation
    PASSWORD_RESET = "PASSWORD_RESET"           # Token khôi phục mật khẩu (15 phút)
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION"   # Token kích hoạt tài khoản / email
