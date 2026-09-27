# AGENTS.md — Chronic Disease Risk System (Quy tắc chung toàn dự án)

## 1. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN
* **Đề tài:** Hệ thống web hỗ trợ sàng lọc và theo dõi nguy cơ bệnh mạn tính không lây nhiễm bằng Machine Learning.
* **Bản chất:** Đồ án tốt nghiệp đại học ngành CNTT (thời lượng 12 tháng, 24 sprint).
* **Triết lý kỹ thuật:** Ưu tiên **tính đúng đắn học thuật, sự ổn định, thiết thực và đúng tiến độ sprint**. Tuyệt đối không over-engineer (không tự ý tách microservices phức tạp).
* **Tư cách pháp lý y tế:** Hệ thống là công cụ **Hỗ trợ ra quyết định (Decision Support System / Early Screening)**, tuyệt đối không thay thế chẩn đoán chuyên môn của bác sĩ.

---

## 2. KIẾN TRÚC MONOREPO VÀ PHÂN CHIA TRÁCH NHIỆM

```text
chronic-disease-risk-system/
├── AGENTS.md             # Quy tắc chung toàn dự án (file này)
├── KE_HOACH_TRIEN_KHAI.md
├── KE_HOACH_TRAIN_MODEL_ML.md
├── docker-compose.yml     # Quản lý 3 services: db, backend, frontend
│
├── ml-pipeline/          # Huấn luyện mô hình, đánh giá, SHAP, xuất artifacts
│   └── AGENTS.md         # Quy tắc chuyên biệt cho ML
│
├── backend/              # FastAPI, REST API, nạp model inference, ORM DB
│   └── AGENTS.md         # Quy tắc chuyên biệt cho Backend
│
└── frontend/             # Next.js App Router, Dashboard theo dõi, Form nhập liệu
    └── AGENTS.md         # Quy tắc chuyên biệt cho Frontend
```

---

## 3. TECH STACK BẤT DI BẤT DỊCH (KHÔNG TỰ Ý THAY ĐỔI)

| Thành phần | Công nghệ quy định | Lưu ý đặc biệt |
| :--- | :--- | :--- |
| **Môi trường & Ngôn ngữ** | Python 3.11, TypeScript 5.x, Node.js 20 LTS | Giữ cố định Python 3.11 để tương thích C-extensions |
| **Machine Learning** | `scikit-learn==1.5.2`, `xgboost==2.1.1`, `shap==0.46.0`, `imbalanced-learn==0.12.4`, `joblib==1.4.2` | Khóa cứng version giữa môi trường Train (Colab) và Backend |
| **Backend** | FastAPI, Pydantic v2, SQLAlchemy 2.0 (Async), Alembic, Pytest | Chạy bất đồng bộ, load model qua Lifespan |
| **Database** | PostgreSQL 16 (chạy qua Docker Compose) | Dùng kiểu `JSONB` lưu giá trị giải thích SHAP |
| **Frontend** | Next.js (App Router), Tailwind CSS, Shadcn/ui, Recharts, React Hook Form + Zod | Thiết kế responsive, biểu đồ chuỗi thời gian |
| **Triển khai** | Docker & Docker Compose đa tầng (multi-stage build) | 3 container: `frontend`, `backend`, `db` |

---

## 4. HỢP ĐỒNG DỮ LIỆU LIÊN MODULE (INTER-MODULE DATA CONTRACTS)

Mọi module phải tuân thủ nghiêm ngặt chuẩn giao tiếp sau để tránh lỗi tích hợp:

### A. Chuẩn xuất và nạp Artifacts (ML ──► Backend)
Mỗi mô hình bệnh sau khi huấn luyện xong **bắt buộc xuất đủ 4 file** vào `models/<disease_name>/`:
1. `preprocessor.joblib`: Pipeline tiền xử lý (`ColumnTransformer` chứa Imputer + Scaler).
2. `calibrated_model.joblib`: Mô hình đã bọc qua `CalibratedClassifierCV` (dùng để `predict_proba`).
3. `base_model.joblib`: Mô hình cây gốc XGBoost/LightGBM (dùng riêng cho `shap.TreeExplainer`).
4. `metadata.json`: Bắt buộc đúng cấu trúc JSON sau:
```json
{
  "disease": "diabetes",
  "version": "1.0.0",
  "trained_date": "YYYY-MM-DD",
  "features_order": ["BMI", "Smoker", "PhysActivity", "Age", "..."],
  "optimal_threshold": 0.35,
  "metrics": { "recall": 0.86, "roc_auc": 0.89, "f1": 0.82 },
  "risk_levels": {
    "low": [0.0, 0.30],
    "medium": [0.30, 0.65],
    "high": [0.65, 1.0]
  }
}
```

### B. Chuẩn API Response Đánh giá Nguy cơ (Backend ──► Frontend)
Endpoint `/api/v1/screening/*` trả về payload đồng nhất:
```json
{
  "disease": "diabetes",
  "risk_score": 0.68,
  "risk_percentage": 68.0,
  "risk_level": "HIGH",
  "top_risk_factors": [
    { "feature": "Glucose", "value": 160.0, "impact": "+25% nguy cơ" },
    { "feature": "BMI", "value": 31.5, "impact": "+15% nguy cơ" }
  ],
  "recommendations": [
    "Khám chuyên khoa nội tiết trong vòng 1 tuần",
    "Giảm khẩu phần tinh bột tinh chế và đường đơn"
  ],
  "disclaimer": "Kết quả chỉ mang tính sàng lọc hỗ trợ quyết định, không thay thế chẩn đoán y khoa."
}
```

---

## 5. BẢO MẬT & DỮ LIỆU SỨC KHỎE CÁ NHÂN (PHI / PII)
- Mọi dữ liệu chỉ số sức khỏe đều là thông tin nhạy cảm:
  - **Tuyệt đối không log** chỉ số sức khỏe của người dùng, mật khẩu thô hoặc token ra console/log production.
  - Phân quyền theo hàng (Row-level authorization): Endpoint chỉ cho phép user đọc/ghi bản ghi sức khỏe của chính mình (`user_id == current_user.id`).
  - Mật khẩu băm bằng `bcrypt` với cost factor tối thiểu 12.
  - Secret key đọc từ biến môi trường qua `.env`, không bao giờ hard-code vào code repository.

---

## 6. QUY TẮC PHÁT TRIỂN & QUẢN TRỊ DỰ ÁN
- **Quy chuẩn Git Commit:** Tuân thủ Conventional Commits:
  - `feat(ml):`: Thêm pipeline huấn luyện mô hình mới.
  - `feat(backend):`: Thêm endpoint hoặc service.
  - `feat(frontend):`: Thêm giao diện hoặc component.
  - `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- **Kỷ luật Sprint:** Mọi task thực hiện phải gắn liền với mốc thời gian trong kế hoạch 24 sprint. Không tự ý mở rộng phạm vi ra ngoài các tiêu chí nghiệm thu đã thống nhất.
- **Ngôn ngữ:**
  - Code, tên biến, comment kỹ thuật: Tiếng Anh chuẩn mực.
  - Giao diện người dùng (UI), thông báo lỗi hiển thị, tài liệu báo cáo: Tiếng Việt chuẩn mực y tế.
  - Khi Antigravity trả lời/hướng dẫn: Luôn trả lời bằng Tiếng Việt rõ ràng, súc tích.
