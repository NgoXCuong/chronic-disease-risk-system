import uuid
from datetime import date, datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import BiologicalSex


class PatientProfileBase(BaseModel):
    """Base schema for patient physical demographic attributes."""
    full_name: Optional[str] = Field(None, max_length=150, description="Họ và tên bệnh nhân")
    date_of_birth: Optional[date] = Field(None, description="Ngày sinh (YYYY-MM-DD)")
    gender: Optional[BiologicalSex] = Field(None, description="Giới tính sinh học (MALE, FEMALE, OTHER)")
    height_cm: Optional[float] = Field(None, ge=40.0, le=250.0, description="Chiều cao đứng (cm)")
    weight_kg: Optional[float] = Field(None, ge=15.0, le=300.0, description="Cân nặng cơ thể (kg)")
    medical_history: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Tiền sử bệnh lý bản thân và gia đình")
    emergency_contact: Optional[Dict[str, Any]] = Field(None, description="Thông tin liên hệ khẩn cấp")


class PatientProfileUpdate(BaseModel):
    """Schema for updating patient profile attributes."""
    full_name: Optional[str] = Field(None, max_length=150)
    date_of_birth: Optional[date] = None
    gender: Optional[BiologicalSex] = None
    height_cm: Optional[float] = Field(None, ge=40.0, le=250.0)
    weight_kg: Optional[float] = Field(None, ge=15.0, le=300.0)
    medical_history: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[Dict[str, Any]] = None


class PatientProfileResponse(PatientProfileBase):
    """Response schema for patient demographic and physical profile."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    bmi: Optional[float] = Field(None, description="Chỉ số khối cơ thể (BMI = kg / m^2)")
    created_at: datetime
    updated_at: datetime
