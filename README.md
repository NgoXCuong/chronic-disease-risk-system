# Chronic Disease Risk Prediction & Monitoring System

> **Đồ án tốt nghiệp:** Xây dựng hệ thống web hỗ trợ sàng lọc và theo dõi nguy cơ bệnh mạn tính không lây nhiễm bằng Machine Learning.

---

## 📌 Tổng quan dự án

Hệ thống cung cấp giải pháp sàng lọc sớm và theo dõi tiến trình nguy cơ các bệnh mạn tính phổ biến:
* **Tầng 1 (Core - Sàng lọc nhanh theo lối sống):** Đái tháo đường, Tăng huyết áp, Tim mạch, Đột quỵ.
* **Tầng 2 (Chuyên sâu - Xét nghiệm lâm sàng PoC):** Đái tháo đường (Pima Indians).

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Shadcn/ui, Recharts, React Hook Form + Zod.
* **Backend:** FastAPI (Python 3.11), SQLAlchemy 2.0 Async, Pydantic v2, Alembic, JWT (bcrypt).
* **Database:** PostgreSQL 16 (chạy qua Docker).
* **Machine Learning:** Scikit-learn, XGBoost, LightGBM, SHAP (Explainable AI), Imbalanced-learn, Joblib.
* **Triển khai:** Docker & Docker Compose.

---

## 📁 Cấu trúc Monorepo

```text
chronic-disease-risk-system/
├── AGENTS.md                 # Quy tắc chung toàn dự án
├── KE_HOACH_TRIEN_KHAI.md    # Kế hoạch 8 giai đoạn & 24 sprint
├── KE_HOACH_TRAIN_MODEL_ML.md# Hướng dẫn chi tiết huấn luyện mô hình ML
├── docker-compose.yml        # Điều phối 3 services (Frontend, Backend, DB)
│
├── ml-pipeline/              # Huấn luyện mô hình & MLOps
│   ├── data/                 # Raw & Processed datasets (bị gitignore)
│   ├── notebooks/            # Jupyter notebooks thí nghiệm
│   ├── src/                  # Mã nguồn tiền xử lý, training, evaluation
│   └── models/               # Artifacts xuất ra (.joblib, metadata.json)
│
├── backend/                  # RESTful API & Model Inference Engine
│   └── app/                  # FastAPI Application
│
└── frontend/                 # Giao diện người dùng Next.js
    └── src/app/              # Next.js App Router
```

---

## ⚖️ Tuyên bố miễn trừ trách nhiệm y tế (Medical Disclaimer)

*Hệ thống là công cụ hỗ trợ ra quyết định (Decision Support System / Early Screening) phục vụ mục đích nghiên cứu học thuật, **tuyệt đối không thay thế chẩn đoán chuyên môn của bác sĩ hoặc cơ sở y tế.** Mọi thông tin sàng lọc cần được đối chiếu với thăm khám lâm sàng thực tế.*
