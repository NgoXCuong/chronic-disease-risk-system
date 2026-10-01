"""
Định nghĩa Schema Pydantic cho Module Cơ sở Y tế Chuyên khoa (Sprint 17: FR-23 -> FR-25).
Tuân thủ Trụ cột 1 (Ngắn gọn), Trụ cột 4 (Kiến trúc phân tầng) và Trụ cột 9 (Dữ liệu thật).
"""
from datetime import datetime
from typing import List, Optional
import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import FacilitySpecialty, FacilityTier


class MedicalFacilityBase(BaseModel):
    """Thông tin cơ bản của cơ sở y tế chuyên khoa."""
    name: str = Field(..., description="Tên bệnh viện hoặc phòng khám chuyên khoa")
    specialty: FacilitySpecialty = Field(..., description="Chuyên khoa lâm sàng (Nội tiết, Tim mạch, Đột quỵ, Đa khoa)")
    facility_tier: FacilityTier = Field(default=FacilityTier.PROVINCIAL, description="Tuyến quản lý (Trung ương, Tỉnh, Huyện, Tư nhân)")
    address: str = Field(..., description="Địa chỉ đường, phường/xã, quận/huyện")
    city: str = Field(default="Hà Nội", description="Tỉnh / Thành phố")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Tọa độ Vĩ độ WGS84")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Tọa độ Kinh độ WGS84")
    phone: Optional[str] = Field(None, description="Hotline đặt lịch khám")
    emergency_phone: Optional[str] = Field(None, description="Số điện thoại cấp cứu 24/7")
    website: Optional[str] = Field(None, description="Trang thông tin điện tử")
    opening_hours: Optional[str] = Field(default="07:30 - 17:00 (Thứ 2 - Thứ 6)", description="Thời gian làm việc")
    is_active: bool = Field(default=True, description="Trạng thái hoạt động")


class MedicalFacilityCreate(MedicalFacilityBase):
    """Schema tạo mới cơ sở y tế (dành cho Admin)."""
    pass


class MedicalFacilityResponse(MedicalFacilityBase):
    """Schema trả về chi tiết cơ sở y tế."""
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NearbyFacilityItem(MedicalFacilityResponse):
    """Cơ sở y tế kèm khoảng cách thực tế tính toán từ vị trí người dùng."""
    distance_km: float = Field(..., description="Khoảng cách tính theo đường chim bay (km)")
    google_maps_url: str = Field(..., description="Đường dẫn chỉ đường qua Google Maps")


class NearbyFacilitiesResponse(BaseModel):
    """Phản hồi danh sách cơ sở y tế lân cận theo bán kính."""
    user_latitude: float = Field(..., description="Vĩ độ người dùng")
    user_longitude: float = Field(..., description="Kinh độ người dùng")
    radius_km: float = Field(..., description="Bán kính quét (km)")
    total_found: int = Field(..., description="Tổng số cơ sở y tế tìm thấy")
    specialty_filter: Optional[FacilitySpecialty] = Field(None, description="Bộ lọc chuyên khoa đang áp dụng")
    facilities: List[NearbyFacilityItem] = Field(default_factory=list, description="Danh sách sắp xếp theo khoảng cách gần nhất")
