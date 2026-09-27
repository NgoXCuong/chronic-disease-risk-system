# KẾ HOẠCH TRIỂN KHAI ĐỒ ÁN TỐT NGHIỆP

**Đề tài:** Xây dựng hệ thống web hỗ trợ sàng lọc và theo dõi nguy cơ một số bệnh mạn tính không lây nhiễm bằng Machine Learning  
**Thời gian dự kiến:** 12 tháng  
**Công nghệ:** Frontend Next.js · Backend FastAPI (Python) · Database PostgreSQL (Docker)  
**Phạm vi bệnh:**  
- **Tầng 1 (Core):** Đái tháo đường (Tiểu đường), Tim mạch, Tăng huyết áp, Bệnh thận mạn tính  
- **Tầng 2 (Mở rộng / Optional):** Đột quỵ, Béo phì / Hội chứng chuyển hóa  

---

## I. KIẾN TRÚC TỔNG THỂ VÀ CẤU TRÚC THƯ MỤC (MONOREPO)

```text
chronic-disease-risk-system/
├── ml-pipeline/                  # Module huấn luyện, đánh giá & export model
│   ├── data/
│   │   ├── raw/                  # Dataset gốc (Pima, BRFSS, Cleveland, UCI...)
│   │   └── processed/            # Data sau khi clean/split
│   ├── notebooks/                # Jupyter Notebooks cho từng bệnh
│   │   ├── 01_poc_diabetes.ipynb
│   │   ├── 02_cardiovascular.ipynb
│   │   ├── 03_hypertension.ipynb
│   │   └── 04_chronic_kidney.ipynb
│   ├── src/                      # Source code tái sử dụng
│   │   ├── preprocessing.py      # Custom Transformers, Pipeline
│   │   ├── train.py              # Pipeline training & calibration
│   │   ├── evaluate.py           # Metrics (Recall, ROC-AUC, F1)
│   │   └── explain.py            # SHAP explainer
│   ├── models/                   # Lưu artifacts sau khi export
│   │   ├── diabetes/ (pipeline.joblib, metadata.json)
│   │   ├── cardiovascular/
│   │   └── ...
│   └── requirements.txt
│
├── backend/                      # FastAPI Web Service
│   ├── app/
│   │   ├── api/v1/               # Endpoints
│   │   │   ├── auth.py           # Đăng ký, đăng nhập (JWT)
│   │   │   ├── screening.py      # API dự đoán nguy cơ (Inference)
│   │   │   ├── records.py        # CRUD chỉ số sức khỏe
│   │   │   └── dashboard.py      # Thống kê, biểu đồ xu hướng
│   │   ├── core/                 # Config, security, database session
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── models/               # SQLAlchemy ORM Models
│   │   ├── schemas/              # Pydantic Schemas (Validation)
│   │   ├── services/             # Business logic
│   │   │   ├── ml_service.py     # Load model & inference engine
│   │   │   ├── record_service.py
│   │   │   └── advice_service.py # Khuyến nghị y tế
│   │   └── main.py               # Lifespan events, CORS, Router mount
│   ├── alembic/                  # Database migrations
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                     # Next.js App Router
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── (auth)/login, register
│   │   │   ├── dashboard/page.tsx # Biểu đồ theo dõi sức khỏe
│   │   │   ├── screening/page.tsx # Form nhập liệu sàng lọc
│   │   │   └── history/page.tsx   # Lịch sử các lần đánh giá
│   │   ├── components/           # UI Components (Shadcn/ui, Recharts)
│   │   │   ├── charts/           # Biểu đồ xu hướng, biểu đồ SHAP
│   │   │   ├── forms/            # Form wizard đa bước
│   │   │   └── ui/               # Button, Input, Modal, Alert...
│   │   ├── lib/                  # Axios client, utils, auth tokens
│   │   └── types/                # TypeScript Interfaces
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml            # Chạy đồng thời Postgres, Backend, Frontend
└── README.md
```

---

## II. CHIẾN LƯỢC DỮ LIỆU & PHÂN TẦNG ĐẶC TRƯNG (FEATURE MATRIX)

Hệ thống thiết kế theo **2 cấp độ sàng lọc** để phù hợp thực tế người dùng:

1. **Cấp 1 - Sàng lọc nhanh (Khảo sát lối sống & Chỉ số cơ bản):**
   - *Đặc trưng:* Tuổi, Giới tính, Chiều cao, Cân nặng (BMI), Huyết áp cơ bản, Hút thuốc, Uống rượu, Hoạt động thể lực, Tiền sử gia đình.
   - *Bộ dữ liệu sử dụng:* CDC BRFSS / NHANES.
   - *Mục đích:* Dành cho mọi đối tượng kiểm tra nhanh tại nhà mà không cần xét nghiệm máu/nước tiểu.

2. **Cấp 2 - Đánh giá chi tiết (Chỉ số lâm sàng & Xét nghiệm sinh hóa):**
   - *Đặc trưng bổ sung:* Glucose lúc đói, HbA1c, Cholesterol toàn phần, HDL/LDL, Triglyceride, Creatinine huyết thanh, eGFR, Albumin niệu.
   - *Bộ dữ liệu sử dụng:* Cleveland Heart Disease, Framingham, UCI Chronic Kidney Disease, Pima Indians Diabetes.
   - *Mục đích:* Cho người dùng đã có kết quả xét nghiệm định kỳ để đánh giá nguy cơ chuyên sâu.

---

## III. NỘI DUNG VÀ CÁCH THỨC TRIỂN KHAI 8 GIAI ĐOẠN

### Giai đoạn 1: Nghiên cứu & Phân tích yêu cầu (Tháng 1)
- **Mục tiêu:** Hiểu rõ bài toán y khoa, chốt danh sách bộ dữ liệu và hoàn thiện tài liệu đặc tả yêu cầu (SRS).
- **Nội dung công việc:**
  1. Khảo sát y văn, thang điểm đánh giá lâm sàng hiện hữu (Framingham Risk Score, FINDRISC).
  2. Tải và đánh giá các bộ dữ liệu công khai: kiểm tra kích thước, missing values, mức độ mất cân bằng nhãn.
  3. Lập bảng ma trận các đặc trưng (features) dùng chung giữa các bệnh.
  4. Viết tài liệu đặc tả yêu cầu (SRS) và đề cương chi tiết nộp giảng viên hướng dẫn (GVHD).
- **Deliverables:** Tài liệu SRS rút gọn, bảng phân tích dataset, đề cương chi tiết.

### Giai đoạn 2: Thiết kế hệ thống (Tháng 2)
- **Mục tiêu:** Hoàn thiện kiến trúc hệ thống, thiết kế CSDL (ERD), API specs và wireframe UI/UX.
- **Nội dung công việc:**
  1. Thiết kế cơ sở dữ liệu PostgreSQL:
     - `users`: thông tin người dùng, xác thực.
     - `health_records`: lưu các chỉ số sức khỏe theo thời gian (time-series).
     - `screening_results`: kết quả sàng lọc từng bệnh, điểm nguy cơ, phân loại (LOW/MEDIUM/HIGH), giải thích SHAP (JSONB).
     - `recommendations`: ngân hàng lời khuyên y tế theo từng bệnh và mức độ nguy cơ.
  2. Thiết kế RESTful API (FastAPI + Pydantic schema + OpenAPI specification).
  3. Thiết kế wireframe/mockup trên Figma (Dashboard, Form wizard, Trang kết quả phân tích).
- **Deliverables:** Sơ đồ kiến trúc, ERD, API specs (Swagger), Link Figma mockup.

### Giai đoạn 3: Xây dựng & Huấn luyện mô hình ML (Tháng 3 – Tháng 5)
- **Mục tiêu:** Xây dựng ML Pipeline hoàn chỉnh, ưu tiên chỉ số Recall >= 80%, có giải thích SHAP.
- **Phương pháp kỹ thuật:**
  1. *Tháng 3 (PoC Tiểu đường):*
     - Xây dựng Pipeline tiền xử lý bằng `ColumnTransformer` (Imputer + Scaler + Encoder).
     - Áp dụng kỹ thuật xử lý mất cân bằng: so sánh SMOTE, RandomUnderSampler và `scale_pos_weight`.
  2. *Tháng 4 (Thử nghiệm & So sánh):*
     - Thử nghiệm tối thiểu 3 thuật toán: Logistic Regression, Random Forest, XGBoost/LightGBM.
     - Đánh giá bằng K-Fold Cross Validation trên tập train.
     - Ưu tiên metric: Recall/Sensitivity, ROC-AUC, F1-score.
  3. *Tháng 5 (Hiệu chuẩn xác suất, SHAP & Export):*
     - Hiệu chuẩn xác suất bằng `CalibratedClassifierCV` để điểm xác suất phản ánh chính xác nguy cơ thực tế.
     - Tích hợp `shap.TreeExplainer` để trích xuất Top 3 yếu tố làm tăng nguy cơ nhiều nhất.
     - Export toàn bộ pipeline vào file `pipeline.joblib` và `metadata.json`.
     - Lặp lại quy trình trên cho Tim mạch, Huyết áp và Thận mạn.
- **Deliverables:** Bộ model đã train (`pipeline.joblib`, `metadata.json`) cho 4 bệnh, bảng so sánh metrics.

### Giai đoạn 4: Phát triển Backend FastAPI (Tháng 4 – Tháng 6)
- **Mục tiêu:** Cung cấp API hoàn chỉnh, load model tối ưu vào RAM, phản hồi nhanh (< 100ms).
- **Nội dung công việc:**
  1. Khởi tạo FastAPI với lifespan events (`@asynccontextmanager`) để load trước các model pipeline khi khởi động.
  2. Xây dựng hệ thống xác thực JWT, hash mật khẩu bằng `bcrypt`.
  3. Xây dựng CRUD endpoints cho chỉ số sức khỏe (`/api/v1/records/`).
  4. Xây dựng inference service (`/api/v1/screening/`):
     - Nhận dữ liệu input -> Validate bằng Pydantic -> Chuyển thành DataFrame -> Gọi model pipeline -> Tính SHAP -> Lưu kết quả vào DB -> Trả về kết quả và khuyến nghị.
  5. Viết unit test cho service layer bằng `pytest`.
- **Deliverables:** Backend API hoàn chỉnh, tài liệu Swagger interactive, bộ test coverage cơ bản.

### Giai đoạn 5: Phát triển Frontend Next.js (Tháng 6 – Tháng 8)
- **Mục tiêu:** Giao diện trực quan, thân thiện, hỗ trợ người dùng theo dõi tiến trình sức khỏe.
- **Nội dung công việc:**
  1. Khởi tạo Next.js với App Router, cấu hình Tailwind CSS và Shadcn/ui.
  2. Xây dựng màn hình Đăng ký / Đăng nhập, quản lý token (HTTP-only cookie hoặc localStorage an toàn).
  3. Xây dựng Form nhập liệu đa bước (Wizard Form) với `react-hook-form` + `zod` validation.
  4. Xây dựng trang kết quả: hiển thị mức nguy cơ (Gauge Chart), Top 3 yếu tố nguy cơ (SHAP) và khuyến nghị sinh hoạt.
  5. Xây dựng Dashboard theo dõi xu hướng (Longitudinal Tracking): biểu đồ đường (Recharts) thể hiện sự thay đổi của chỉ số và nguy cơ theo thời gian.
  6. Thêm thông báo miễn trừ trách nhiệm y tế (Medical Disclaimer).
- **Deliverables:** Frontend hoàn chỉnh, responsive trên mobile/desktop, tích hợp đầy đủ với Backend.

### Giai đoạn 6: Tích hợp & Kiểm thử (Tháng 8 – Tháng 9)
- **Mục tiêu:** Đảm bảo toàn bộ luồng hoạt động ổn định, an toàn và chính xác.
- **Nội dung công việc:**
  1. Kiểm thử End-to-End (E2E) từ lúc người dùng nhập liệu đến khi ra biểu đồ theo dõi.
  2. Kiểm thử dữ liệu biên (Boundary Testing): kiểm tra các giá trị cực đại/cực tiểu của chỉ số sức khỏe.
  3. Kiểm thử hiệu năng (Performance Testing): kiểm tra tải của endpoint inference với `Locust`.
  4. Kiểm tra bảo mật: chống SQL Injection, XSS, phân quyền chặt chẽ (người dùng chỉ xem được dữ liệu của chính mình).
- **Deliverables:** Báo cáo kiểm thử (Test Report), danh sách bug đã fix.

### Giai đoạn 7: Đóng gói Docker & Triển khai (Tháng 9 – Tháng 10)
- **Mục tiêu:** Hệ thống đóng gói chuẩn hóa, triển khai thử nghiệm trên môi trường Cloud/VPS.
- **Nội dung công việc:**
  1. Viết `Dockerfile` đa tầng (multi-stage) cho Next.js để tối ưu kích thước image.
  2. Viết `Dockerfile` cho FastAPI với base `python:3.11-slim`.
  3. Thiết lập `docker-compose.yml` liên kết 3 container: `frontend`, `backend`, `db` (Postgres 16) kèm volume lưu trữ.
  4. Thiết lập biến môi trường an toàn qua file `.env`.
  5. Deploy thử nghiệm lên VPS hoặc nền tảng đám mây (Render/Railway/Vercel).
- **Deliverables:** Hệ thống chạy thực tế, link demo trực tuyến, tài liệu hướng dẫn cài đặt (README.md).

### Giai đoạn 8: Viết báo cáo & Chuẩn bị bảo vệ (Tháng 10 – Tháng 12)
- **Mục tiêu:** Quyển báo cáo khóa luận hoàn chỉnh, slide chuyên nghiệp, bảo vệ thành công.
- **Nội dung công việc:**
  1. Hoàn thiện quyển báo cáo theo cấu trúc 6 chương:
     - *Chương 1: Mở đầu & Đặt vấn đề*
     - *Chương 2: Cơ sở lý thuyết & Y văn*
     - *Chương 3: Phân tích & Thiết kế hệ thống*
     - *Chương 4: Xây dựng & Đánh giá mô hình Machine Learning*
     - *Chương 5: Cài đặt, Thử nghiệm & Đánh giá hệ thống*
     - *Chương 6: Kết luận & Hướng phát triển*
  2. Thiết kế Slide bảo vệ (25 - 30 slide, tập trung vào đóng góp, mô hình và demo).
  3. Chuẩn bị kịch bản demo và danh sách các câu hỏi phản biện thường gặp của hội đồng.
- **Deliverables:** Quyển báo cáo khóa luận (bản cứng + PDF), slide thuyết trình, video demo dự phòng.

---

## IV. LỘ TRÌNH CHI TIẾT 24 SPRINT (2 TUẦN / SPRINT)

| Sprint | Thời gian | Nhiệm vụ chính | Sản phẩm bàn giao (Deliverables) |
| :---: | :---: | :--- | :--- |
| **S01** | T1 (W1-2) | Khảo sát y văn, tìm kiếm và tổng hợp các bộ dataset | Bảng ma trận dataset & Feature comparison |
| **S02** | T1 (W3-4) | Viết đặc tả yêu cầu (SRS), chốt đề cương với GVHD | Tài liệu SRS + Đề cương chi tiết |
| **S03** | T2 (W1-2) | Thiết kế kiến trúc tổng thể, CSDL (ERD) & API Spec | File ERD + File OpenAPI yaml/json |
| **S04** | T2 (W3-4) | Thiết kế UI/UX Wireframe trên Figma, khởi tạo Git Monorepo | Link Figma + Repo với cấu trúc khung |
| **S05** | T3 (W1-2) | Setup Colab/local, EDA & Preprocessing cho **Tiểu đường** | Notebook EDA + Pipeline tiền xử lý |
| **S06** | T3 (W3-4) | Train, so sánh mô hình, áp dụng SHAP cho **Tiểu đường** (PoC) | `pipeline.joblib` + `metadata.json` (Tiểu đường) |
| **S07** | T4 (W1-2) | Khởi tạo Backend FastAPI, kết nối DB Postgres, Auth JWT | API Auth hoạt động, Alembic migration |
| **S08** | T4 (W3-4) | Tích hợp model Tiểu đường vào FastAPI, xây dựng CRUD records | API sàng lọc Tiểu đường chạy được trên Swagger |
| **S09** | T5 (W1-2) | ML Pipeline cho **Tim mạch** (Cleveland/Framingham) | Model Tim mạch đã calibrate + SHAP |
| **S10** | T5 (W3-4) | ML Pipeline cho **Huyết áp** & **Thận mạn** | Model Huyết áp & Thận mạn hoàn chỉnh |
| **S11** | T6 (W1-2) | Tích hợp toàn bộ 4 model vào Backend, viết logic khuyến nghị | Endpoint `/screening/comprehensive` hoàn tất |
| **S12** | T6 (W3-4) | Khởi tạo Frontend Next.js, cấu hình Tailwind/Shadcn, Auth pages | Trang Đăng ký / Đăng nhập hoạt động |
| **S13** | T7 (W1-2) | Xây dựng Form nhập chỉ số đa bước (Wizard Form) | Form nhập liệu có validation đầy đủ |
| **S14** | T7 (W3-4) | Xây dựng Trang hiển thị kết quả sàng lọc & biểu đồ SHAP | Giao diện kết quả trực quan, có giải thích |
| **S15** | T8 (W1-2) | Xây dựng Dashboard theo dõi xu hướng sức khỏe (Recharts) | Biểu đồ chuỗi thời gian hiển thị đúng data |
| **S16** | T8 (W3-4) | Ghép nối toàn bộ Frontend - Backend, xử lý loading/error | Hệ thống chạy thông suốt luồng người dùng |
| **S17** | T9 (W1-2) | Viết Unit Test, E2E Test, tối ưu tốc độ phản hồi | Bộ test suite tự động với pytest |
| **S18** | T9 (W3-4) | Đóng gói Docker Compose, chạy thử nghiệm trên VPS/Cloud | Link demo live trên môi trường staging |
| **S19** | T10 (W1-2)| Viết bản thảo Chương 1, 2, 3 của Báo cáo khóa luận | Nháp 3 chương đầu nộp GVHD xem trước |
| **S20** | T10 (W3-4)| Viết bản thảo Chương 4 (kết quả ML) và Chương 5 (Hệ thống) | Bản thảo đầy đủ của quyển báo cáo |
| **S21** | T11 (W1-2)| Chỉnh sửa báo cáo theo góp ý của GVHD, chuẩn hóa quy cách | Quyển báo cáo hoàn chỉnh (bản gần cuối) |
| **S22** | T11 (W3-4)| Thiết kế Slide thuyết trình, chuẩn bị kịch bản demo | Bộ Slide bảo vệ (khoảng 25-30 trang) |
| **S23** | T12 (W1-2)| Luyện tập thuyết trình, diễn tập demo, chuẩn bị câu hỏi phản biện | Video quay lại buổi thuyết trình thử |
| **S24** | T12 (W3-4)| Nộp báo cáo chính thức, in ấn, bảo vệ trước Hội đồng | Hoàn thành bảo vệ đồ án tốt nghiệp! |

---

## V. CHECKLIST QUẢN TRỊ RỦI RO

1. **Khóa cứng (freeze) phiên bản thư viện:**  
   - Đồng bộ chính xác phiên bản `scikit-learn`, `xgboost`, `shap` giữa môi trường training (Google Colab) và môi trường backend FastAPI để tránh lỗi deserialization khi load file `pipeline.joblib`.
2. **Tránh Data Leakage:**  
   - Chỉ áp dụng SMOTE hoặc chuẩn hóa trên tập Train. Tập Test chỉ dùng để đánh giá độc lập một lần duy nhất khi chốt mô hình.
3. **Hiệu chuẩn xác suất (Probability Calibration):**  
   - Luôn sử dụng `CalibratedClassifierCV` để xác suất đưa ra thực sự phản ánh đúng tỷ lệ phần trăm nguy cơ mắc bệnh.
4. **Giới hạn trách nhiệm y khoa (Medical Disclaimer):**  
   - Luôn hiển thị cảnh báo: *"Hệ thống là công cụ sàng lọc hỗ trợ quyết định (Decision Support System), không thay thế chẩn đoán y khoa của bác sĩ."*
