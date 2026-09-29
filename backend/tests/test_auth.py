import asyncio
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.mark.asyncio

async def test_auth_full_lifecycle():
    """
    Comprehensive Integration Test for Sprint 8:
    1. Register user -> 201 Created
    2. Register duplicate -> 400 Bad Request
    3. Login valid credentials -> 200 OK with tokens
    4. Login invalid credentials -> 401 Unauthorized
    5. Get current user profile (/me) -> 200 OK
    6. Update patient profile -> 200 OK & verify BMI calculation
    7. Refresh Token Rotation -> 200 OK with new tokens
    8. Token Reuse Detection -> 401 Unauthorized
    9. Change Password -> 200 OK
    10. Login with new password -> 200 OK
    11. Logout -> 200 OK
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_email = f"patient_{uuid.uuid4().hex[:8]}@example.com"
        password = "Password123@"

        # 1. Register
        reg_payload = {
            "email": unique_email,
            "password": password,
            "full_name": "Nguyễn Văn Test",
            "date_of_birth": "1990-05-15",
            "gender": "MALE",
            "height_cm": 170.0,
            "weight_kg": 65.0,
        }
        res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_reg.status_code == 201, f"Register failed: {res_reg.text}"
        data_reg = res_reg.json()
        assert data_reg["email"] == unique_email
        assert data_reg["profile"]["full_name"] == "Nguyễn Văn Test"
        assert data_reg["profile"]["bmi"] == 22.49

        # 2. Duplicate registration check
        res_dup = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res_dup.status_code == 400

        # 3. Login
        res_login = await client.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": password},
        )
        assert res_login.status_code == 200
        tokens = res_login.json()
        access_token = tokens["access_token"]
        refresh_token_1 = tokens["refresh_token"]
        assert access_token and refresh_token_1

        # 4. Login with wrong password
        res_wrong_login = await client.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": "WrongPassword123!"},
        )
        assert res_wrong_login.status_code == 401

        # 5. Get current user (/me)
        headers = {"Authorization": f"Bearer {access_token}"}
        res_me = await client.get("/api/v1/auth/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == unique_email

        # 6. Update Profile
        update_payload = {
            "height_cm": 175.0,
            "weight_kg": 70.0,
            "medical_history": {"hypertension_family": True},
        }
        res_profile = await client.put(
            "/api/v1/users/profile", json=update_payload, headers=headers
        )
        assert res_profile.status_code == 200
        assert res_profile.json()["height_cm"] == 175.0
        assert res_profile.json()["bmi"] == 22.86

        # 7. Rotate Refresh Token
        res_refresh = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": refresh_token_1}
        )
        assert res_refresh.status_code == 200
        new_tokens = res_refresh.json()
        new_access_token = new_tokens["access_token"]
        refresh_token_2 = new_tokens["refresh_token"]
        assert refresh_token_2 != refresh_token_1

        # 8. Token Reuse Attack Detection (Re-using refresh_token_1)
        res_reuse = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": refresh_token_1}
        )
        assert res_reuse.status_code == 401

        # 9. Change Password
        new_headers = {"Authorization": f"Bearer {new_access_token}"}
        res_change_pwd = await client.post(
            "/api/v1/auth/change-password",
            json={
                "current_password": password,
                "new_password": "NewStrongPassword456@",
            },
            headers=new_headers,
        )
        assert res_change_pwd.status_code == 200

        # 10. Login with new password
        res_new_login = await client.post(
            "/api/v1/auth/login",
            json={"email": unique_email, "password": "NewStrongPassword456@"},
        )
        assert res_new_login.status_code == 200

        # 11. Logout (Chỉ cần gửi Refresh Token trong body, không bắt buộc header Authorization)
        active_refresh = res_new_login.json()["refresh_token"]
        res_logout = await client.post(
            "/api/v1/auth/logout",
            json={"refresh_token": active_refresh},
        )
        assert res_logout.status_code == 200
        assert "Đăng xuất thành công" in res_logout.json()["message"]


@pytest.mark.asyncio
async def test_auth_httponly_cookies_lifecycle():
    """
    Kiểm thử tự động quy trình xác thực bằng HttpOnly Cookie (Chuẩn bảo mật Y tế - Trụ cột 2.5):
    1. Đăng nhập -> Máy chủ tự động set HttpOnly cookies (access_token, refresh_token).
    2. Gọi /api/v1/auth/me HOÀN TOÀN KHÔNG gửi Header Authorization, chỉ dùng Cookie -> 200 OK.
    3. Cấp mới token (/refresh) HOÀN TOÀN KHÔNG gửi JSON body, chỉ dùng Cookie -> 200 OK.
    4. Đăng xuất (/logout) xóa sạch cookies -> 200 OK.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        cookie_email = f"cookie_{uuid.uuid4().hex[:8]}@example.com"
        password = "Password123@"

        # 1. Đăng ký tài khoản
        res_reg = await client.post(
            "/api/v1/auth/register",
            json={
                "email": cookie_email,
                "password": password,
                "full_name": "Bệnh Nhân Cookie",
            },
        )
        assert res_reg.status_code == 201

        # 2. Đăng nhập và kiểm tra HttpOnly cookies
        res_login = await client.post(
            "/api/v1/auth/login",
            json={"email": cookie_email, "password": password},
        )
        assert res_login.status_code == 200
        cookies = res_login.cookies
        assert "access_token" in cookies
        assert "refresh_token" in cookies
        assert "medrisk_logged_in" in cookies

        access_token_cookie = cookies["access_token"]
        refresh_token_cookie = cookies["refresh_token"]

        # 3. Truy cập /me CHỈ bằng cookie, KHÔNG dùng header Authorization
        client.cookies.set("access_token", access_token_cookie)
        res_me = await client.get("/api/v1/auth/me")
        assert res_me.status_code == 200
        assert res_me.json()["email"] == cookie_email
        assert res_me.json()["profile"]["full_name"] == "Bệnh Nhân Cookie"

        # 4. Refresh token CHỈ bằng cookie
        client.cookies.set("refresh_token", refresh_token_cookie)
        res_refresh = await client.post("/api/v1/auth/refresh")
        assert res_refresh.status_code == 200
        assert "access_token" in res_refresh.cookies

        # 5. Đăng xuất CHỈ bằng cookie
        res_logout = await client.post("/api/v1/auth/logout")
        assert res_logout.status_code == 200
        assert "Đăng xuất thành công" in res_logout.json()["message"]
