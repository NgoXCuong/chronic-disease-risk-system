"""
API Router Định vị và Tìm kiếm Cơ sở Y tế Chuyên khoa (Sprint 17: FR-23 -> FR-25).
Cung cấp các endpoint tra cứu cơ sở y tế theo tọa độ GPS, cự ly bán kính,
và tự động điều phối chuyên khoa điều trị tương ứng với kết quả sàng lọc.
Tuân thủ Trụ cột 1 (Ngắn gọn), Trụ cột 4 (Kiến trúc phân tầng) và Trụ cột 9 (Dữ liệu thật).
"""
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.models.enums import FacilitySpecialty
from app.schemas.facility import (
    MedicalFacilityResponse,
    NearbyFacilitiesResponse,
)
from app.services.facility_service import FacilityService

router = APIRouter(prefix="/facilities", tags=["Bản đồ & Cơ sở Y tế (Medical Facilities)"])


@router.get(
    "/nearby",
    response_model=NearbyFacilitiesResponse,
    status_code=status.HTTP_200_OK,
    summary="Tìm kiếm cơ sở y tế lân cận theo tọa độ GPS (FR-23, FR-24)"
)
async def get_nearby_facilities(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Vĩ độ người dùng (Latitude)"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Kinh độ người dùng (Longitude)"),
    radius_km: float = Query(default=15.0, gt=0, le=500.0, description="Bán kính quét (km)"),
    specialty: Optional[FacilitySpecialty] = Query(default=None, description="Lọc theo chuyên khoa lâm sàng"),
    city: Optional[str] = Query(default=None, description="Lọc theo tên Tỉnh / Thành phố"),
    limit: int = Query(default=20, ge=1, le=100, description="Giới hạn số lượng cơ sở y tế"),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Truy vấn danh sách bệnh viện, phòng khám chuyên khoa trong bán kính `radius_km` từ vị trí người dùng.
    Dữ liệu được sắp xếp từ gần nhất đến xa nhất và kèm link Google Maps chỉ đường.
    """
    return await FacilityService.get_nearby_facilities(
        db=db,
        user_lat=latitude,
        user_lon=longitude,
        radius_km=radius_km,
        specialty=specialty,
        city=city,
        limit=limit
    )


@router.get(
    "/recommended-for-disease/{disease}",
    response_model=NearbyFacilitiesResponse,
    status_code=status.HTTP_200_OK,
    summary="Gợi ý bệnh viện chuyên khoa theo loại bệnh nguy cơ cao (FR-25)"
)
async def get_recommended_facilities_for_disease(
    disease: str = Path(..., description="Mã bệnh (diabetes_binary, hypertension, cardiovascular, stroke, diabetes_clinical)"),
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Vĩ độ hiện tại"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Kinh độ hiện tại"),
    radius_km: float = Query(default=25.0, gt=0, le=500.0, description="Bán kính tìm kiếm (km)"),
    limit: int = Query(default=10, ge=1, le=50, description="Số lượng kết quả gợi ý"),
    db: AsyncSession = Depends(get_async_db)
):
    """
    Tự động kết nối kết quả sàng lọc ML nguy cơ cao sang cơ sở y tế chuyên khoa đầu ngành gần người bệnh nhất.
    Ví dụ: ĐTĐ -> Bệnh viện Nội tiết; Tim mạch/THA -> Viện Tim; Đột quỵ -> Trung tâm Đột quỵ não.
    """
    return await FacilityService.get_recommended_facilities_for_disease(
        db=db,
        disease=disease,
        user_lat=latitude,
        user_lon=longitude,
        radius_km=radius_km,
        limit=limit
    )


@router.get(
    "/cities",
    response_model=List[str],
    status_code=status.HTTP_200_OK,
    summary="Lấy danh sách các tỉnh thành phố có cơ sở y tế"
)
async def list_cities(
    db: AsyncSession = Depends(get_async_db)
):
    """Lấy danh sách các Tỉnh/Thành phố phục vụ bộ lọc nhanh vị trí trên giao diện."""
    return await FacilityService.list_available_cities(db=db)


@router.get(
    "/{facility_id}",
    response_model=MedicalFacilityResponse,
    status_code=status.HTTP_200_OK,
    summary="Xem thông tin chi tiết một cơ sở y tế theo ID"
)
async def get_facility_detail(
    facility_id: uuid.UUID = Path(..., description="ID định danh duy nhất của cơ sở y tế"),
    db: AsyncSession = Depends(get_async_db)
):
    """Lấy toàn bộ thông tin chi tiết cơ sở y tế (địa chỉ, chuyên khoa, hotline, cấp cứu, website)."""
    return await FacilityService.get_facility_detail(db=db, facility_id=facility_id)
