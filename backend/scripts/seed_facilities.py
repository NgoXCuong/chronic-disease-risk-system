"""
Script nạp bổ sung cơ sở y tế chuyên khoa đầu ngành tại Việt Nam (Sprint 17: FR-23 -> FR-25).
Cung cấp dữ liệu định vị địa lý GPS chính xác phục vụ bản đồ Leaflet.js và gợi ý điều trị.
"""
import asyncio
from typing import Any, Dict, List

from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.enums import FacilitySpecialty, FacilityTier
from app.models.facility import MedicalFacility

SEED_FACILITIES: List[Dict[str, Any]] = [
    # --- KHU VỰC HÀ NỘI ---
    {
        "name": "Bệnh viện Bạch Mai - Viện Tim mạch & Khoa Nội tiết",
        "specialty": FacilitySpecialty.CARDIOLOGY,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "78 Giải Phóng, Phường Phương Mai, Quận Đống Đa, Hà Nội",
        "city": "Hà Nội",
        "latitude": 20.999863,
        "longitude": 105.840742,
        "phone": "024 3869 3731",
        "emergency_phone": "024 3869 3731",
        "website": "http://bachmai.gov.vn",
        "opening_hours": "06:30 - 17:00 (Thứ 2 - Thứ 7)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện Nội tiết Trung ương (Cơ sở Tứ Hiệp)",
        "specialty": FacilitySpecialty.ENDOCRINOLOGY,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "Đường gom cầu Tứ Hiệp, Xã Tứ Hiệp, Huyện Thanh Trì, Hà Nội",
        "city": "Hà Nội",
        "latitude": 20.948281,
        "longitude": 105.862143,
        "phone": "024 3861 6009",
        "emergency_phone": "024 3861 6009",
        "website": "http://benhviennoitiet.vn",
        "opening_hours": "07:00 - 17:00 (Thứ 2 - Chủ Nhật)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện Tim Hà Nội (Cơ sở 1)",
        "specialty": FacilitySpecialty.CARDIOLOGY,
        "facility_tier": FacilityTier.PROVINCIAL,
        "address": "92 Trần Hưng Đạo, Phường Cửa Nam, Quận Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "latitude": 21.023472,
        "longitude": 105.845941,
        "phone": "024 3942 2430",
        "emergency_phone": "024 3942 0046",
        "website": "http://benhvientimhanoi.vn",
        "opening_hours": "07:00 - 16:30 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện Trung ương Quân đội 108 - Trung tâm Đột quỵ Não",
        "specialty": FacilitySpecialty.STROKE_NEUROLOGY,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "Số 1 Trần Hưng Đạo, Phường Bạch Đằng, Quận Hai Bà Trưng, Hà Nội",
        "city": "Hà Nội",
        "latitude": 21.018241,
        "longitude": 105.860153,
        "phone": "069 572 400",
        "emergency_phone": "069 555 283",
        "website": "http://benhvien108.vn",
        "opening_hours": "24/7 (Cấp cứu Đột quỵ tiếp nhận liên tục)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện Hữu nghị Việt Đức - Trung tâm Tim mạch & Lồng ngực",
        "specialty": FacilitySpecialty.GENERAL_HOSPITAL,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "40 Tràng Thi, Phường Hàng Bông, Quận Hoàn Kiếm, Hà Nội",
        "city": "Hà Nội",
        "latitude": 21.028912,
        "longitude": 105.847521,
        "phone": "024 3825 3531",
        "emergency_phone": "024 3825 3531",
        "website": "http://benhvienvietduc.org",
        "opening_hours": "07:00 - 16:30 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện E Hà Nội - Trung tâm Tim mạch Quốc gia",
        "specialty": FacilitySpecialty.CARDIOLOGY,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "89 Trần Cung, Phường Nghĩa Tân, Quận Cầu Giấy, Hà Nội",
        "city": "Hà Nội",
        "latitude": 21.050512,
        "longitude": 105.789523,
        "phone": "024 3754 3650",
        "emergency_phone": "024 3754 3650",
        "website": "http://benhviene.com",
        "opening_hours": "07:30 - 17:00 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },

    # --- KHU VỰC TP. HỒ CHÍ MINH ---
    {
        "name": "Bệnh viện Chợ Rẫy - Khoa Nội tiết & Can thiệp Mạch máu",
        "specialty": FacilitySpecialty.GENERAL_HOSPITAL,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh",
        "city": "TP. Hồ Chí Minh",
        "latitude": 10.757829,
        "longitude": 106.659556,
        "phone": "028 3855 4137",
        "emergency_phone": "028 3855 4138",
        "website": "http://choray.vn",
        "opening_hours": "07:00 - 16:00 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện Đại học Y Dược TP. Hồ Chí Minh",
        "specialty": FacilitySpecialty.ENDOCRINOLOGY,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh",
        "city": "TP. Hồ Chí Minh",
        "latitude": 10.755431,
        "longitude": 106.662842,
        "phone": "028 3855 4269",
        "emergency_phone": "028 3952 5355",
        "website": "http://bvdaihoc.com.vn",
        "opening_hours": "06:30 - 16:30 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện Nhân dân 115 - Trung tâm Đột quỵ & Tim mạch Can thiệp",
        "specialty": FacilitySpecialty.STROKE_NEUROLOGY,
        "facility_tier": FacilityTier.PROVINCIAL,
        "address": "527 Sư Vạn Hạnh, Phường 12, Quận 10, TP. Hồ Chí Minh",
        "city": "TP. Hồ Chí Minh",
        "latitude": 10.773812,
        "longitude": 106.665624,
        "phone": "028 3865 2368",
        "emergency_phone": "028 3865 4139",
        "website": "http://benhvien115.com.vn",
        "opening_hours": "24/7 (Cấp cứu và Can thiệp mạch máu)",
        "is_active": True,
    },
    {
        "name": "Viện Tim TP. Hồ Chí Minh",
        "specialty": FacilitySpecialty.CARDIOLOGY,
        "facility_tier": FacilityTier.PROVINCIAL,
        "address": "04 Dương Quang Trung, Phường 12, Quận 10, TP. Hồ Chí Minh",
        "city": "TP. Hồ Chí Minh",
        "latitude": 10.772511,
        "longitude": 106.666012,
        "phone": "028 3865 1586",
        "emergency_phone": "028 3865 1586",
        "website": "http://vientimtphcm.vn",
        "opening_hours": "07:00 - 16:30 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện Thống Nhất - Trung tâm Lão khoa & Bệnh Mạn tính",
        "specialty": FacilitySpecialty.ENDOCRINOLOGY,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "Số 1 Lý Thường Kiệt, Phường 7, Quận Tân Bình, TP. Hồ Chí Minh",
        "city": "TP. Hồ Chí Minh",
        "latitude": 10.791523,
        "longitude": 106.653412,
        "phone": "028 3864 2140",
        "emergency_phone": "028 3864 2140",
        "website": "http://bvtn.org.vn",
        "opening_hours": "07:00 - 16:30 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },

    # --- KHU VỰC ĐÀ NẴNG ---
    {
        "name": "Bệnh viện Đà Nẵng - Trung tâm Tim mạch",
        "specialty": FacilitySpecialty.CARDIOLOGY,
        "facility_tier": FacilityTier.PROVINCIAL,
        "address": "124 Hải Phòng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng",
        "city": "Đà Nẵng",
        "latitude": 16.071812,
        "longitude": 108.214023,
        "phone": "0236 3821 118",
        "emergency_phone": "0236 3821 118",
        "website": "http://dananghospital.org.vn",
        "opening_hours": "07:30 - 17:00 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },
    {
        "name": "Bệnh viện C Đà Nẵng - Khoa Nội tiết",
        "specialty": FacilitySpecialty.ENDOCRINOLOGY,
        "facility_tier": FacilityTier.CENTRAL,
        "address": "122 Hải Phòng, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng",
        "city": "Đà Nẵng",
        "latitude": 16.072215,
        "longitude": 108.213511,
        "phone": "0236 3821 480",
        "emergency_phone": "0236 3821 480",
        "website": "http://bvcdanang.vn",
        "opening_hours": "07:00 - 17:00 (Thứ 2 - Thứ 6)",
        "is_active": True,
    },

    # --- KHU VỰC CẦN THƠ ---
    {
        "name": "Bệnh viện Đa khoa Quốc tế Đột quỵ Tim mạch Cần Thơ (S.I.S Cần Thơ)",
        "specialty": FacilitySpecialty.STROKE_NEUROLOGY,
        "facility_tier": FacilityTier.PRIVATE,
        "address": "397 Nguyễn Văn Cừ nối dài, Phường An Bình, Quận Ninh Kiều, Cần Thơ",
        "city": "Cần Thơ",
        "latitude": 10.021045,
        "longitude": 105.753012,
        "phone": "1800 1115",
        "emergency_phone": "1800 1115",
        "website": "http://siscantho.vn",
        "opening_hours": "24/7 (Cấp cứu Đột quỵ & Tim mạch)",
        "is_active": True,
    },
]


async def seed_facilities():
    """Kiểm tra và chèn các bệnh viện chuyên khoa nếu chưa tồn tại."""
    async with AsyncSessionLocal() as db:
        inserted_count = 0
        for item in SEED_FACILITIES:
            stmt = select(MedicalFacility).where(MedicalFacility.name == item["name"])
            existing = (await db.execute(stmt)).scalar_one_or_none()
            if not existing:
                fac = MedicalFacility(**item)
                db.add(fac)
                inserted_count += 1

        await db.commit()
        print(f"SUCCESS: Seeded {inserted_count} facilities into database.")


if __name__ == "__main__":
    asyncio.run(seed_facilities())
