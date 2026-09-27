# AGENTS.md — Machine Learning Pipeline Rules (`ml-pipeline/`)

Tệp quy tắc này áp dụng bắt buộc cho toàn bộ mã nguồn, notebook và tiến trình huấn luyện mô hình trong thư mục `ml-pipeline/`.

---

## 1. MÔI TRƯỜNG, TÁI LẬP KẾT QUẢ & PHIÊN BẢN THƯ VIỆN
* **Quy tắc tái lập kết quả (Reproducibility):**
  * Bắt buộc khai báo hằng số toàn cục `RANDOM_STATE = 42`.
  * Mọi hàm có yếu tố ngẫu nhiên (`train_test_split`, `StratifiedKFold`, `XGBClassifier`, `RandomForestClassifier`, `SMOTE`, `sample`) bắt buộc phải truyền `random_state=RANDOM_STATE`.
* **Môi trường:** Python 3.11.
* **Khóa cứng (freeze) thư viện trong `ml-pipeline/requirements.txt`:**
  ```text
  scikit-learn==1.5.2
  xgboost==2.1.1
  lightgbm==4.5.0
  imbalanced-learn==0.12.4
  shap==0.46.0
  joblib==1.4.2
  pandas==2.2.2
  numpy==1.26.4
  optuna==3.6.1
  ```
* **Lưu ý kiểm tra môi trường:** Trước khi chạy chính thức trên Colab hoặc Local, cần chạy thử lệnh cài đặt để đảm bảo không bị xung đột C-extensions giữa các thư viện.

---

## 2. NGUYÊN TẮC QUẢN LÝ DỮ LIỆU & CHỐNG RÒ RỈ (ANTI-DATA LEAKAGE)
* **Quy tắc phân chia dữ liệu:**
  * Bắt buộc chia 3 tập: **70% Train - 15% Validation - 15% Test** bằng `train_test_split(..., test_size=0.3, stratify=y, random_state=RANDOM_STATE)`. Sau đó chia tập 30% còn lại thành Val/Test tỉ lệ 50:50.
  * **Tập Test (15%) đóng băng tuyệt đối:** Lưu riêng thành `test.csv`. Không can thiệp, không fit scaler, imputer hay chọn siêu tham số trên tập này.
  * Tập Test chỉ được nạp đúng **1 lần duy nhất** ở bước nghiệm thu cuối cùng để lấy các chỉ số khách quan ghi vào Báo cáo khóa luận (Chương 4).
* **Xử lý giá trị ngoại lai y tế (Medical Outliers):**
  * Với dữ liệu lâm sàng (Pima/CKD): Các giá trị bằng 0 vô lý ở `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI` là dữ liệu thiếu (missing ẩn). Bắt buộc phải thay thế bằng `np.nan` trước khi đưa vào Imputer.
* **Xử lý mất cân bằng nhãn (Class Imbalance):**
  * Ưu tiên dùng tham số phạt `scale_pos_weight = (y_train == 0).sum() / (y_train == 1).sum()` trong XGBoost/LightGBM.
  * Nếu dùng SMOTE / RandomUnderSampler, bắt buộc dùng `imblearn.pipeline.Pipeline` (không dùng `sklearn.pipeline.Pipeline`) để đảm bảo SMOTE chỉ chạy khi `fit()` trên tập Train và tự động bỏ qua khi `transform/predict`.

---

## 3. QUY TRÌNH TIỀN XỬ LÝ & PHÂN TÁCH ĐẶC TRƯNG CHUẨN XÁC
Để bảo toàn tính thứ bậc y tế và tránh bùng nổ số chiều, đặc trưng bắt buộc được phân tách thành 3 nhóm rõ ràng trong `ColumnTransformer`:

1. **Nhóm số liên tục (`continuous_numeric_cols`):**
   * Ví dụ: `BMI`, `MentHlth`, `PhysHlth` (số ngày/tháng).
   * Xử lý: `SimpleImputer(strategy='median')` $\rightarrow$ `StandardScaler()`.
2. **Nhóm thứ bậc / Ordinal (`ordinal_cols`):**
   * Ví dụ trong BRFSS: `GenHlth` (1: Rất tốt $\rightarrow$ 5: Kém), `Age` (nhóm tuổi 1 $\rightarrow$ 13).
   * **Quy tắc:** Tuyệt đối **KHÔNG dùng OneHotEncoder** vì sẽ phá vỡ mối quan hệ tăng dần rủi ro và tăng số chiều vô ích.
   * Xử lý: `SimpleImputer(strategy='median')` $\rightarrow$ Giữ nguyên giá trị thứ bậc (`passthrough`) hoặc chuẩn hóa nhẹ.
3. **Nhóm nhị phân / Danh mục thuần túy (`binary_or_nominal_cols`):**
   * Nhị phân (0/1: `Smoker`, `PhysActivity`, `Sex`...): Giữ nguyên (`passthrough`).
   * Danh mục không thứ bậc (nếu có $>2$ nhóm không so sánh được): `OneHotEncoder(handle_unknown='ignore')`.

---

## 4. CHIẾN LƯỢC ĐÁNH GIÁ, K-FOLD CROSS-VALIDATION & LỰA CHỌN MÔ HÌNH
* **Quy trình K-Fold Cross-Validation (Bắt buộc để chọn mô hình):**
  * Sử dụng **Stratified 5-Fold Cross-Validation** (`StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)`) trên **tập Train**.
  * Chạy thử nghiệm đối chứng tối thiểu 3 thuật toán:
    1. *Logistic Regression:* `class_weight='balanced'` (Baseline đối chứng y học).
    2. *Random Forest:* `class_weight='balanced'` (Đại diện Bagging).
    3. *XGBoost / LightGBM:* `scale_pos_weight=imbalance_ratio` (Đại diện Boosting).
  * Lập bảng so sánh kết quả trung bình và độ lệch chuẩn ($\mu \pm \sigma$) của 5 fold để chọn ra mô hình tốt nhất (thường là XGBoost hoặc LightGBM).
* **Hệ thống chỉ số đánh giá (Metrics Hierarchy):**
  1. **Recall / Sensitivity (Ưu tiên số 1):** Bắt buộc $\ge 80\%$. Trong sàng lọc y tế, bỏ sót ca bệnh nguy hiểm hơn báo động nhầm.
  2. **ROC-AUC (Khả năng phân biệt):** Mục tiêu $\ge 0.80$.
  3. **F1-Score / PR-AUC:** Đánh giá cân bằng giữa Precision và Recall.
  4. *Lưu ý:* Tuyệt đối không dùng Accuracy làm tiêu chí đánh giá vì dữ liệu mất cân bằng nhãn.

---

## 5. TỐI ƯU SIÊU THAM SỐ VỚI OPTUNA
* Sau khi chọn được thuật toán chiến thắng qua K-Fold, sử dụng **Optuna** để tinh chỉnh siêu tham số trên tập Train/Validation:
  * **Mục tiêu tối ưu (Objective):** Cực đại hóa chỉ số **ROC-AUC** hoặc **Recall** trên tập Validation.
  * **Không gian tìm kiếm mẫu cho XGBoost:**
    * `n_estimators`: `trial.suggest_int('n_estimators', 100, 300)`
    * `max_depth`: `trial.suggest_int('max_depth', 3, 7)`
    * `learning_rate`: `trial.suggest_float('learning_rate', 0.01, 0.2, log=True)`
    * `subsample`: `trial.suggest_float('subsample', 0.6, 1.0)`
    * `colsample_bytree`: `trial.suggest_float('colsample_bytree', 0.6, 1.0)`
  * Số lượng trial: Tối thiểu 30-50 trials.

---

## 6. TÌM NGƯỠNG CẮT TỐI ƯU, HIỆU CHUẨN XÁC SUẤT & SHAP
* **Tối ưu ngưỡng phân loại (Youden's J Threshold Tuning):**
  * Không dùng ngưỡng mặc định $0.5$.
  * Phải tính chỉ số **Youden's J statistic** ($J = \text{Recall} + \text{Specificity} - 1$) trên tập **Validation** để chọn ra ngưỡng tối ưu $T^*$ (thường dao động từ $0.30 - 0.40$).
* **Hiệu chuẩn xác suất (Probability Calibration):**
  * Bọc mô hình cây vào `CalibratedClassifierCV(estimator=best_model, method='sigmoid', cv='prefit')` sử dụng tập Validation.
  * Xác suất đầu ra phản ánh đúng nguy cơ thực tế ($0 - 100\%$).
* **Giải thích mô hình bằng SHAP:**
  * Dùng `shap.TreeExplainer` khởi tạo trên mô hình cây gốc (`best_model`) trước khi bọc calibration.
  * Viết hàm trích xuất **Top 3 yếu tố nguy cơ hàng đầu** đóng góp làm tăng điểm rủi ro cho mỗi ca dự đoán.

---

## 7. ĐÓNG GÓI VÀ XUẤT ARTIFACTS
Mỗi bệnh sau khi hoàn thành bắt buộc xuất đủ 4 file vào `models/<disease>/`:
1. `preprocessor.joblib`: Đối tượng `ColumnTransformer` đã fit.
2. `calibrated_model.joblib`: Đối tượng `CalibratedClassifierCV` dùng cho `predict_proba`.
3. `base_model.joblib`: Đối tượng mô hình cây gốc dùng cho `TreeExplainer`.
4. `metadata.json`: Bắt buộc chứa đầy đủ các trường:
   ```json
   {
     "disease": "<tên_bệnh>",
     "model_type": "XGBoost_Calibrated",
     "trained_date": "YYYY-MM-DD",
     "random_state": 42,
     "features_order": ["feature1", "feature2", "..."],
     "optimal_threshold": 0.35,
     "cv_metrics_5fold": {
       "mean_recall": 0.85,
       "mean_roc_auc": 0.88
     },
     "test_metrics": {
       "test_recall": 0.86,
       "test_roc_auc": 0.89,
       "test_f1": 0.82
     },
     "risk_levels": {
       "low": [0.0, 0.30],
       "medium": [0.30, 0.65],
       "high": [0.65, 1.0]
     }
   }
   ```
* Đảm bảo toàn bộ dataset và file `.joblib` nặng được liệt kê trong `.gitignore`.
