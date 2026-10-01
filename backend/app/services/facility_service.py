"""
Dịch vụ Quản lý và Định vị Cơ sở Y tế Chuyên khoa (Sprint 17: FR-23 -> FR-25).
Áp dụng công thức Haversine tính toán cự ly địa lý chính xác, hỗ trợ người bệnh
kết nối nhanh với các bệnh viện chuyên khoa phù hợp với kết quả sàng lọc nguy cơ.
Tuân thủ Trụ cột 1 (Ngắn gọn), Trụ cột 4 (Kiến trúc phân tầng) và Trụ cột 9 (Dữ liệu thật).
"""
import math
from typing import List, Optional
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import DiseaseType, FacilitySpecialty, FacilityTier
from app.models.facility import MedicalFacility
from app.schemas.facility import (
    MedicalFacilityResponse,
    NearbyFacilitiesResponse,
    NearbyFacilityItem,
)


class FacilityService:
    """Xử lý nghiệp vụ truy vấn địa lý và điều phối cơ sở y tế theo chuyên khoa lâm sàng."""

    EARTH_RADIUS_KM = 6371.0

    # Bản đồ ánh xạ từ bệnh lý mạn tính sang chuyên khoa điều trị tương ứng
    DISEASE_TO_SPECIALTY_MAP = {
        DiseaseType.DIABETES_BINARY: FacilitySpecialty.ENDOCRINOLOGY,
        DiseaseType.DIABETES_CLINICAL: FacilitySpecialty.ENDOCRINOLOGY,
        DiseaseType.HYPERTENSION: FacilitySpecialty.CARDIOLOGY,
        DiseaseType.CARDIOVASCULAR: FacilitySpecialty.CARDIOLOGY,
        DiseaseType.STROKE: FacilitySpecialty.STROKE_NEUROLOGY,
    }

    @classmethod
    def calculate_haversine_distance(
        cls,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> float:
        """
        Tính khoảng cách trắc địa đường cong giữa 2 tọa độ GPS (bán kính Trái Đất 6371 km).
        Đảm bảo độ chính xác tính khoảng cách thực tế không phụ thuộc bên thứ ba.
        """
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = (
            math.sin(delta_phi / 2.0) ** 2
            + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
        )
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(cls.EARTH_RADIUS_KM * c, 2)

    @classmethod
    async def get_nearby_facilities(
        cls,
        db: AsyncSession,
        user_lat: float,
        user_lon: float,
        radius_km: float = 15.0,
        specialty: Optional[FacilitySpecialty] = None,
        city: Optional[str] = None,
        limit: int = 20
    ) -> NearbyFacilitiesResponse:
        """
        Truy vấn các cơ sở y tế đang hoạt động, lọc theo bán kính và sắp xếp từ gần nhất đến xa nhất.
        """
        stmt = select(MedicalFacility).where(MedicalFacility.is_active.is_(True))

        if specialty:
            # Cho phép tìm chuyên khoa cụ thể hoặc bệnh viện đa khoa tuyến cuối
            stmt = stmt.where(
                (MedicalFacility.specialty == specialty)
                | (MedicalFacility.specialty == FacilitySpecialty.GENERAL_HOSPITAL)
            )
        if city:
            stmt = stmt.where(MedicalFacility.city.ilike(f"%{city}%"))

        result = await db.execute(stmt)
        all_facilities = result.scalars().all()

        nearby_items: List[NearbyFacilityItem] = []
        for fac in all_facilities:
            dist = cls.calculate_haversine_distance(user_lat, user_lon, fac.latitude, fac.longitude)
            # Chỉ lấy các cơ sở nằm trong bán kính quét chỉ định
            if dist <= radius_km:
                maps_url = f"https://www.google.com/maps/dir/?api=1&destination={fac.latitude},{fac.longitude}"
                item_data = MedicalFacilityResponse.model_validate(fac).model_dump()
                nearby_items.append(
                    NearbyFacilityItem(
                        **item_data,
                        distance_km=dist,
                        google_maps_url=maps_url
                    )
                )

        # Sắp xếp tăng dần theo khoảng cách địa lý
        nearby_items.sort(key=lambda x: x.distance_km)

        return NearbyFacilitiesResponse(
            user_latitude=user_lat,
            user_longitude=user_lon,
            radius_km=radius_km,
            total_found=len(nearby_items),
            specialty_filter=specialty,
            facilities=nearby_items[:limit]
        )

    @classmethod
    async def get_recommended_facilities_for_disease(
        cls,
        db: AsyncSession,
        disease: str,
        user_lat: float,
        user_lon: float,
        radius_km: float = 25.0,
        limit: int = 10
    ) -> NearbyFacilitiesResponse:
        """
        Tự động ánh xạ bệnh lý nguy cơ cao sang chuyên khoa điều trị tương ứng để gợi ý bệnh viện gần nhất.
        """
        try:
            disease_enum = DiseaseType(disease)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Loại bệnh không hợp lệ: {disease}. Chọn một trong {[d.value for d in DiseaseType]}"
            )

        specialty = cls.DISEASE_TO_SPECIALTY_MAP.get(disease_enum, FacilitySpecialty.GENERAL_HOSPITAL)
        return await cls.get_nearby_facilities(
            db=db,
            user_lat=user_lat,
            user_lon=user_lon,
            radius_km=radius_km,
            specialty=specialty,
            limit=limit
        )

    @classmethod
    async def get_facility_detail(
        cls,
        db: AsyncSession,
        facility_id: uuid.UUID
    ) -> MedicalFacilityResponse:
        """Lấy thông tin chi tiết một cơ sở y tế theo ID."""
        stmt = select(MedicalFacility).where(MedicalFacility.id == facility_id)
        result = await db.execute(stmt)
        fac = result.scalar_one_or_none()

        if not fac:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy cơ sở y tế tương ứng."
            )
        return MedicalFacilityResponse.model_validate(fac)

    @classmethod
    async def list_available_cities(cls, db: AsyncSession) -> List[str]:
        """Lấy danh sách các tỉnh/thành phố có cơ sở y tế trong hệ thống."""
        stmt = select(MedicalFacility.city).distinct().order_by(MedicalFacility.city)
        result = await db.execute(stmt)
        return list(result.scalars().all())
