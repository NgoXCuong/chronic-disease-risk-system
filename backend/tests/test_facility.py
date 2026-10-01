"""
Bộ kiểm thử Tự động cho Module Cơ sở Y tế Chuyên khoa (Sprint 17: FR-23 -> FR-25).
Tuân thủ Trụ cột 4 (Kiến trúc phân tầng), Trụ cột 7 (Dễ kiểm thử) và Trụ cột 9 (Dữ liệu thật).
"""
import uuid
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.models.enums import FacilitySpecialty
from app.services.facility_service import FacilityService


def test_haversine_distance_calculation():
    """Kiểm thử đơn vị công thức Haversine tính toán khoảng cách địa lý."""
    # 1. Hai điểm trùng nhau khoảng cách bằng 0
    d_zero = FacilityService.calculate_haversine_distance(21.0285, 105.8542, 21.0285, 105.8542)
    assert d_zero == 0.0

    # 2. Khoảng cách Hà Nội - TP. Hồ Chí Minh (~ 1130 - 1160 km)
    d_hn_hcm = FacilityService.calculate_haversine_distance(21.0285, 105.8542, 10.7725, 106.6980)
    assert 1130.0 < d_hn_hcm < 1160.0

    # 3. Khoảng cách cự ly gần giữa BV Bạch Mai và BV Tim Hà Nội (~ 2.6 - 2.8 km)
    d_bach_mai_tim = FacilityService.calculate_haversine_distance(
        20.999863, 105.840742,
        21.023472, 105.845941
    )
    assert 2.0 < d_bach_mai_tim < 3.5


@pytest.mark.asyncio
async def test_get_nearby_facilities_api():
    """Kiểm thử API tìm kiếm cơ sở y tế lân cận theo tọa độ GPS và bán kính (FR-23, FR-24)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Vị trí người dùng tại Trung tâm Hoàn Kiếm, Hà Nội
        user_lat, user_lon = 21.0285, 105.8542

        # 1. Quét trong bán kính 10 km
        res = await client.get(
            f"/api/v1/facilities/nearby?latitude={user_lat}&longitude={user_lon}&radius_km=10.0"
        )
        assert res.status_code == 200
        data = res.json()
        assert data["total_found"] > 0
        assert len(data["facilities"]) > 0

        # Kiểm tra khoảng cách sắp xếp tăng dần và <= 10.0 km
        distances = [f["distance_km"] for f in data["facilities"]]
        assert distances == sorted(distances)
        assert all(d <= 10.0 for d in distances)

        # Kiểm tra có link chỉ đường Google Maps hợp lệ
        first_fac = data["facilities"][0]
        assert "google.com/maps/dir" in first_fac["google_maps_url"]
        assert first_fac["phone"] is not None

        # 2. Lọc theo chuyên khoa Tim mạch (CARDIOLOGY)
        res_cardio = await client.get(
            f"/api/v1/facilities/nearby?latitude={user_lat}&longitude={user_lon}&radius_km=15.0&specialty={FacilitySpecialty.CARDIOLOGY.value}"
        )
        assert res_cardio.status_code == 200
        cardio_data = res_cardio.json()
        assert cardio_data["specialty_filter"] == FacilitySpecialty.CARDIOLOGY.value
        for fac in cardio_data["facilities"]:
            assert fac["specialty"] in [FacilitySpecialty.CARDIOLOGY.value, FacilitySpecialty.GENERAL_HOSPITAL.value]

        # 3. Bán kính siêu nhỏ không có cơ sở nào (0.01 km)
        res_empty = await client.get(
            f"/api/v1/facilities/nearby?latitude={user_lat}&longitude={user_lon}&radius_km=0.01"
        )
        assert res_empty.status_code == 200
        assert res_empty.json()["total_found"] == 0
        assert len(res_empty.json()["facilities"]) == 0


@pytest.mark.asyncio
async def test_recommended_facilities_for_disease_api():
    """Kiểm thử API tự động gợi ý bệnh viện theo bệnh lý nguy cơ cao (FR-25)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Vị trí tại Quận 1, TP. Hồ Chí Minh
        user_lat, user_lon = 10.7769, 106.7009

        # 1. Bệnh Đái tháo đường -> Phải gợi ý BV chuyên khoa Nội tiết (ENDOCRINOLOGY / GENERAL_HOSPITAL)
        res_dia = await client.get(
            f"/api/v1/facilities/recommended-for-disease/diabetes_binary?latitude={user_lat}&longitude={user_lon}&radius_km=15.0"
        )
        assert res_dia.status_code == 200
        dia_data = res_dia.json()
        assert dia_data["total_found"] > 0
        assert dia_data["specialty_filter"] == FacilitySpecialty.ENDOCRINOLOGY.value

        # 2. Đột quỵ -> Phải gợi ý STROKE_NEUROLOGY (ví dụ BV Nhân dân 115)
        res_stroke = await client.get(
            f"/api/v1/facilities/recommended-for-disease/stroke?latitude={user_lat}&longitude={user_lon}&radius_km=15.0"
        )
        assert res_stroke.status_code == 200
        stroke_data = res_stroke.json()
        assert stroke_data["specialty_filter"] == FacilitySpecialty.STROKE_NEUROLOGY.value

        # 3. Loại bệnh không hợp lệ -> Trả về lỗi 400 Bad Request
        res_invalid = await client.get(
            f"/api/v1/facilities/recommended-for-disease/unknown_disease?latitude={user_lat}&longitude={user_lon}"
        )
        assert res_invalid.status_code == 400


@pytest.mark.asyncio
async def test_cities_and_detail_api():
    """Kiểm thử API danh sách Tỉnh/Thành phố và chi tiết cơ sở y tế."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Lấy danh sách thành phố
        cities_res = await client.get("/api/v1/facilities/cities")
        assert cities_res.status_code == 200
        cities = cities_res.json()
        assert len(cities) >= 3
        assert any("Hà Nội" in c for c in cities)
        assert any("TP. Hồ Chí Minh" in c for c in cities)

        # 2. Lấy chi tiết cơ sở y tế hợp lệ
        nearby_res = await client.get("/api/v1/facilities/nearby?latitude=21.0285&longitude=105.8542&radius_km=50.0")
        assert nearby_res.status_code == 200
        fac_id = nearby_res.json()["facilities"][0]["id"]

        detail_res = await client.get(f"/api/v1/facilities/{fac_id}")
        assert detail_res.status_code == 200
        detail = detail_res.json()
        assert detail["id"] == fac_id
        assert detail["name"] != ""
        assert detail["latitude"] is not None

        # 3. ID không tồn tại -> Trả về 404
        fake_id = str(uuid.uuid4())
        not_found_res = await client.get(f"/api/v1/facilities/{fake_id}")
        assert not_found_res.status_code == 404
