# AGENTS.md — Backend FastAPI Rules (`backend/`)

Tệp quy tắc này áp dụng bắt buộc cho toàn bộ mã nguồn API, dịch vụ suy luận mô hình và tầng truy cập dữ liệu trong thư mục `backend/`.

---

## 1. CÔNG NGHỆ & MÔI TRƯỜNG PHÁT TRIỂN
* **Python Runtime:** Python 3.11.
* **Framework:** FastAPI (phiên bản $\ge 0.110.0$).
* **ORM & Database:** SQLAlchemy 2.0 (sử dụng `AsyncSession` với driver `asyncpg`), Alembic để quản lý migration.
* **Validation:** Pydantic v2.
* **Authentication:** JWT (JSON Web Tokens) với thuật toán `HS256`, băm mật khẩu bằng `passlib[bcrypt]`.
* **Testing:** `pytest`, `pytest-asyncio`, `httpx` (FastAPI `TestClient`).

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN MỰC
Mã nguồn backend bắt buộc tuân theo kiến trúc phân tầng:
```text
backend/
├── app/
│   ├── api/v1/           # Router endpoints: auth.py, records.py, screening.py, dashboard.py
│   ├── core/             # config.py (Pydantic Settings), security.py, database.py
│   ├── models/           # SQLAlchemy ORM models (User, HealthRecord, ScreeningResult, Recommendation)
│   ├── schemas/          # Pydantic models (Request, Response, Token, RiskAssessment)
│   ├── services/         # Business logic: ml_service.py, record_service.py, advice_service.py
│   └── main.py           # Khởi tạo FastAPI app, Lifespan events, CORS middleware
├── alembic/              # Migration scripts
├── tests/                # Test suites cho API và Service
├── Dockerfile            # Multi-stage python:3.11-slim
└── requirements.txt
```

---

## 3. QUY TẮC NẠP VÀ THỰC THI MÔ HÌNH MACHINE LEARNING
* **Nạp Model vào RAM qua Lifespan (Bắt buộc):**
  * Tuyệt đối **không gọi `joblib.load()` bên trong route handler** (gây thắt cổ chai I/O đĩa ở mỗi request).
  * Toàn bộ model (`preprocessor`, `calibrated_model`, `base_model`, `metadata.json`) phải được load vào bộ nhớ RAM một lần duy nhất lúc khởi động server qua cơ chế `@asynccontextmanager` (Lifespan events) trong `app/main.py`.
* **Quy trình thực thi trong `services/ml_service.py`:**
  1. Nhận input payload từ route sau khi Pydantic đã validate hợp lệ.
  2. Đưa dữ liệu vào DataFrame 1 dòng theo đúng thứ tự cột quy định trong `metadata["features_order"]`.
  3. Gọi `preprocessor.transform(df_input)`.
  4. Gọi `calibrated_model.predict_proba()` để lấy xác suất chính xác.
  5. Tính toán SHAP values bằng `shap.TreeExplainer(base_model)` để trích xuất Top 3 yếu tố nguy cơ.
  6. Ánh xạ mức độ rủi ro (`LOW`, `MEDIUM`, `HIGH`) dựa trên `metadata["risk_levels"]`.
  7. Trả kết quả chuẩn hóa cho router lưu DB và phản hồi client.

---

## 4. QUY TẮC AN TOÀN & BẢO MẬT DỮ LIỆU SỨC KHỎE
* **Phân quyền truy cập theo người dùng (Data Isolation):**
  * Tất cả các thao tác đọc/ghi trên bảng `health_records` và `screening_results` bắt buộc phải kèm điều kiện lọc:
    `WHERE user_id == current_user.id`.
  * Không bao giờ để lộ endpoint lấy thông tin bệnh lý của người khác mà không có quyền Admin.
* **Validation đầu vào nghiêm ngặt:**
  * Toàn bộ request body phải định nghĩa kiểu dữ liệu trong `schemas/`.
  * Ràng buộc giá trị hợp lý về mặt sinh học:
    ```python
    systolic_bp: int = Field(..., ge=50, le=280, description="Huyết áp tâm thu (mmHg)")
    diastolic_bp: int = Field(..., ge=30, le=180, description="Huyết áp tâm trương (mmHg)")
    bmi: float = Field(..., ge=10.0, le=70.0, description="Chỉ số khối cơ thể")
    ```
* **Bảo mật thông tin cấu hình:**
  * Không commit file `.env`. Đọc cấu hình thông qua `core/config.py` kế thừa `pydantic_settings.BaseSettings`.
  * Tuyệt đối không log thông tin nhạy cảm (mật khẩu, chỉ số đường huyết/huyết áp cụ thể, token) ra log của server.

---

## 5. THIẾT KẾ CƠ SỞ DỮ LIỆU & ORM
* Bảng `screening_results` bắt buộc có cột:
  * `risk_score`: Kiểu `Float` (giá trị từ $0.0 - 1.0$).
  * `risk_level`: Kiểu `Enum` (`LOW`, `MEDIUM`, `HIGH`).
  * `shap_summary`: Kiểu `JSONB` trong PostgreSQL để lưu linh hoạt các yếu tố rủi ro hàng đầu mà không cần join nhiều bảng.
* Bảng `health_records` phải đánh index trên `(user_id, recorded_at)` để tối ưu hóa truy vấn vẽ biểu đồ xu hướng theo thời gian.

---

## 6. TIÊU CHUẨN KIỂM THỬ (TESTING)
* Viết unit test cho:
  1. Module xác thực: Đăng ký, đăng nhập, token hết hạn, mã hóa mật khẩu.
  2. Module ML Service: Kiểm tra hàm `predict()` với dữ liệu biên (boundary testing: người trẻ khỏe mạnh $\rightarrow$ nguy cơ thấp; người cao tuổi huyết áp cao $\rightarrow$ nguy cơ cao).
  3. API Endpoints: Kiểm tra mã HTTP status (200, 201, 400, 401, 403, 422).
