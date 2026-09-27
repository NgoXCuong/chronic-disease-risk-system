# AGENTS.md — Frontend Next.js Rules (`frontend/`)

Tệp quy tắc này áp dụng bắt buộc cho toàn bộ giao diện, thành phần hiển thị, biểu đồ và mã nguồn client trong thư mục `frontend/`.

---

## 1. CÔNG NGHỆ & MÔI TRƯỜNG PHÁT TRIỂN
* **Framework:** Next.js (App Router, phiên bản $\ge 14.2$).
* **Ngôn ngữ:** TypeScript 5.x (bật `strict: true` trong `tsconfig.json`, hạn chế dùng `any`).
* **UI & Styling:** Tailwind CSS kết hợp **Shadcn/ui** (dựa trên Radix UI primitives), Lucide React Icons.
* **Biểu đồ dữ liệu:** **Recharts** (dành cho biểu đồ đường xu hướng thời gian và biểu đồ đóng góp yếu tố rủi ro SHAP).
* **Quản lý Form & Validation:** `react-hook-form` kết hợp `zod` resolver.
* **Giao tiếp API:** Axios hoặc `fetch` wrapper có interceptor tự động đính kèm Bearer token và xử lý refresh token.

---

## 2. CẤU TRÚC THƯ MỤC CHUẨN MỰC
```text
frontend/src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Route group không ảnh hưởng URL: login, register
│   ├── (dashboard)/      # Layout có sidebar/header:
│   │   ├── dashboard/    # Trang chủ biểu đồ theo dõi xu hướng (Recharts)
│   │   ├── screening/    # Form Wizard sàng lọc nguy cơ
│   │   └── history/      # Lịch sử các lần đánh giá
│   ├── layout.tsx
│   └── page.tsx          # Landing page giới thiệu
├── components/           # Tái sử dụng components
│   ├── ui/               # Shadcn primitives: button, dialog, alert, card...
│   ├── forms/            # Form wizard, input có validation y tế
│   └── charts/           # LineChart xu hướng, GaugeChart mức nguy cơ, BarChart SHAP
├── lib/                  # axios_client.ts, utils.ts, auth.ts
├── types/                # TypeScript Interfaces (User, ScreeningResult, HealthRecord)
└── middleware.ts         # Route guard chuyển hướng người dùng chưa đăng nhập
```

---

## 3. QUY TẮC FORM NHẬP LIỆU CHỈ SỐ Y TẾ (FORM & VALIDATION)
* **Form Wizard Đa bước (Trải nghiệm người dùng tốt):**
  * Với bản khảo sát Tầng 1 (15-20 câu), chia thành 3 bước nhỏ thay vì dồn thành 1 form dài:
    * *Bước 1:* Thông tin nhân trắc (Tuổi, Giới tính, Chiều cao, Cân nặng $\rightarrow$ hiển thị ngay BMI).
    * *Bước 2:* Thói quen sinh hoạt (Hút thuốc, Uống rượu, Hoạt động thể lực).
    * *Bước 3:* Tình trạng sức khỏe & Khó khăn vận động.
* **Validation chặt chẽ bằng Zod ở Client:**
  * Bắt buộc kiểm tra giới hạn sinh lý trước khi cho phép bấm nút gửi API:
    ```typescript
    export const HealthRecordSchema = z.object({
      height: z.number().min(100, "Chiều cao tối thiểu 100cm").max(250, "Chiều cao không hợp lệ"),
      weight: z.number().min(30, "Cân nặng tối thiểu 30kg").max(250, "Cân nặng không hợp lệ"),
      systolic_bp: z.number().min(60, "Huyết áp tâm thu tối thiểu 60 mmHg").max(250, "Vượt quá ngưỡng đo"),
      diastolic_bp: z.number().min(40, "Huyết áp tâm trương tối thiểu 40 mmHg").max(150, "Vượt quá ngưỡng đo"),
    });
    ```

---

## 4. QUY TẮC HIỂN THỊ KẾT QUẢ & TRỰC QUAN HÓA (XAI & DASHBOARD)
* **Quy chuẩn màu sắc phân tầng rủi ro y tế:**
  * 🟢 **Nguy cơ Thấp (LOW):** Màu xanh lá (`text-emerald-600`, `bg-emerald-50`).
  * 🟡 **Nguy cơ Trung bình (MEDIUM):** Màu vàng/cam cảnh báo (`text-amber-600`, `bg-amber-50`).
  * 🔴 **Nguy cơ Cao (HIGH):** Màu đỏ cảnh báo khẩn (`text-rose-600`, `bg-rose-50`).
* **Trực quan hóa giá trị giải thích SHAP:**
  * Không hiển thị công thức toán phức tạp. Hiển thị dạng thanh tiến trình hoặc thẻ trực quan:
    * *Đường huyết cao:* `+25% tác động`
    * *Chỉ số BMI 31:* `+18% tác động`
    * *Tập thể dục đều đặn:* `-10% tác động tích cực`
* **Dashboard theo dõi chuỗi thời gian (Longitudinal Tracking):**
  * Vẽ biểu đồ đường kép (`Recharts LineChart`): Một đường là Huyết áp/BMI, một đường là Điểm nguy cơ qua các lần kiểm tra.
  * Thể hiện rõ xu hướng tăng hoặc giảm sức khỏe qua thời gian.

---

## 5. NGUYÊN TẮC BẮT BUỘC VỀ Y TẾ VÀ AN TOÀN (MEDICAL & SAFETY)
* **Medical Disclaimer Bắt buộc:**
  * Ở chân trang và ở trang kết quả sàng lọc, **bắt buộc luôn hiển thị cảnh báo:**
    > *"Lưu ý: Kết quả trên hệ thống chỉ mang tính chất tham khảo, hỗ trợ sàng lọc và nâng cao nhận thức sức khỏe ban đầu. Hệ thống không thay thế chẩn đoán y khoa của bác sĩ chuyên khoa."*
* **Xử lý trạng thái Loading & Lỗi:**
  * Khi gọi model inference (có thể mất 500ms - 1s), luôn hiển thị skeleton loading hoặc vòng xoay loading sinh động kèm thông điệp *"Đang phân tích chỉ số qua mô hình AI..."*.
  * Xử lý thông báo lỗi thân thiện nếu Backend gặp sự cố.
