# KẾ HOẠCH CHI TIẾT HUẤN LUYỆN MÔ HÌNH MACHINE LEARNING (ML PIPELINE)

**Đề tài:** Hệ thống web hỗ trợ sàng lọc và theo dõi nguy cơ bệnh mạn tính không lây nhiễm bằng Machine Learning  
**Mục tiêu:** Xây dựng quy trình chuẩn hóa từ xử lý dữ liệu, huấn luyện, đánh giá, hiệu chuẩn xác suất, giải thích mô hình (XAI) đến đóng gói mô hình cho Backend FastAPI.

---

## I. TỔNG QUAN CHIẾN LƯỢC DỮ LIỆU & NGUỒN DATASET

Thay vì sử dụng rời rạc hàng chục bộ dữ liệu gây phân mảnh hệ thống, dự án áp dụng **Chiến lược dữ liệu tinh gọn (2 Dataset trọng tâm)**:

```
                      [CHIẾN LƯỢC DỮ LIỆU TINH GỌN]
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       ▼                                                         ▼
[DATASET 1: TẦNG 1 SÀNG LỌC NHANH]              [DATASET 2: TẦNG 2 CHUYÊN SÂU (PoC)]
- Tên: CDC Diabetes Health Indicators (BRFSS)     - Tên: Pima Indians Diabetes Database
- Quy mô: 253.680 dòng (rút mẫu 70.000 dòng)    - Quy mô: 768 dòng
- Đặc trưng: Khảo sát lối sống & chỉ số cơ bản   - Đặc trưng: Xét nghiệm sinh hóa máu/nước tiểu
- Phạm vi: Cân cả 4 bệnh (Tiểu đường,           - Phạm vi: Chứng minh khả năng tích hợp
  Huyết áp, Tim mạch, Đột quỵ)                    xét nghiệm lâm sàng chuyên sâu (Glucose, Insulin)
```

### 1. Chi tiết Dataset 1: CDC BRFSS 2015 (Tầng 1 - Sàng lọc lối sống toàn diện)
* **Nguồn tải:** [Kaggle - CDC Diabetes Health Indicators Dataset](https://www.kaggle.com/datasets/alexteb/diabetes-health-indicators-dataset)
* **File sử dụng:** `diabetes_binary_health_indicators_BRFSS2015.csv`
* **Các cột nhãn mục tiêu (Target columns):**
  * `Diabetes_binary`: Tiền sử / Nguy cơ Tiểu đường (0: Không, 1: Có).
  * `HighBP`: Tiền sử Tăng huyết áp (0: Không, 1: Có).
  * `HeartDiseaseorAttack`: Tiền sử Bệnh mạch vành / Nhồi máu cơ tim (0: Không, 1: Có).
  * `Stroke`: Tiền sử Đột quỵ (0: Không, 1: Có).
* **Các cột đặc trưng dùng chung (Features):**
  * *Chỉ số nhân trắc học & sinh tồn:* `BMI`, `Age`, `Sex`.
  * *Hành vi lối sống:* `Smoker`, `PhysActivity`, `Fruits`, `Veggies`, `HvyAlcoholConsump`.
  * *Tình trạng sức khỏe tự đánh giá:* `GenHlth` (Sức khỏe chung), `MentHlth` (Số ngày căng thẳng tâm lý/tháng), `PhysHlth` (Số ngày đau ốm thể chất/tháng), `DiffWalk` (Khó khăn vận động).
* **Ưu điểm vượt trội:** Người dùng trên Web chỉ cần điền **1 bản khảo sát duy nhất (15-20 câu)**, Backend sẽ truyền vector đặc trưng này qua 4 model để đánh giá đồng thời cả 4 bệnh.

### 2. Chi tiết Dataset 2: Pima Indians Diabetes (Tầng 2 - Sàng lọc chuyên sâu mẫu)
* **Nguồn tải:** [Kaggle - Pima Indians Diabetes Database](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) hoặc [UCI ML Repository](https://archive.ics.uci.edu/dataset/34/diabetes)
* **File sử dụng:** `diabetes.csv`
* **Đặc trưng xét nghiệm:** `Glucose` (Đường huyết lúc đói), `BloodPressure` (Huyết áp), `SkinThickness` (Độ dày nếp gấp da), `Insulin` (Insulin huyết thanh 2h), `BMI`, `DiabetesPedigreeFunction` (Chỉ số phả hệ tiểu đường), `Age`.
* **Mục đích:** Đóng vai trò Proof of Concept (PoC) chứng minh kiến trúc sẵn sàng tiếp nhận chỉ số xét nghiệm cận lâm sàng.

### 3. Cách tải tự động bằng Kaggle CLI
```bash
# Cài đặt Kaggle CLI
pip install kaggle

# Tải Dataset 1 (CDC BRFSS)
kaggle datasets download -d alexteb/diabetes-health-indicators-dataset -p ./ml-pipeline/data/raw/ --unzip

# Tải Dataset 2 (Pima)
kaggle datasets download -d uciml/pima-indians-diabetes-database -p ./ml-pipeline/data/raw/ --unzip
```

---

## II. LỰA CHỌN THUẬT TOÁN & TIÊU CHÍ ĐÁNH GIÁ

### 1. Ba thuật toán triển khai và so sánh
1. **Logistic Regression (Baseline):** Chuẩn mực đối chứng kinh điển trong y học. Tính toán nhanh, xác suất tự nhiên ổn định, giải thích mối quan hệ tuyến tính thông qua Odds Ratio ($e^\beta$).
2. **Random Forest (Bagging Ensemble):** Xử lý tốt các giá trị ngoại lai, hạn chế overfitting, học tốt các tương tác phi tuyến.
3. **XGBoost / LightGBM (Boosting Ensemble - Model chính):** Hiệu năng cao nhất trên dữ liệu dạng bảng (Tabular Data). Hỗ trợ trực tiếp tham số xử lý mất cân bằng `scale_pos_weight` và giải thích SHAP tốc độ cao với `TreeExplainer`.

### 2. Tiêu chí đánh giá y tế (Evaluation Metrics)
* **Recall / Sensitivity (Ưu tiên số 1):** $\text{Recall} = \frac{TP}{TP + FN}$. Trong y tế, bỏ sót ca bệnh (False Negative) nguy hiểm hơn báo động nhầm (False Positive). Mục tiêu: $\text{Recall} \ge 80\%$.
* **ROC-AUC (Khả năng phân tách):** Đánh giá năng lực phân loại tổng quát trên mọi ngưỡng cắt. Mục tiêu: $\text{ROC-AUC} \ge 0.80$.
* **F1-Score / PR-AUC:** Cân bằng giữa Precision và Recall trên tập dữ liệu mất cân bằng nhãn.

---

## III. QUY TRÌNH 7 BƯỚC TRIỂN KHAI KỸ THUẬT

```
[Dữ liệu thô CSV]
       │
       ▼
[Bước 1: Làm sạch & EDA]       ──► Xử lý ngoại lai y học (VD: Glucose=0 đổi thành NaN)
       │
       ▼
[Bước 2: Phân chia 70/15/15]    ──► Train (70%) - Validation (15%) - Test (15%)
       │
       ▼
[Bước 3: ColumnTransformer]     ──► Imputer (Median/Mode) + Scaler (StandardScaler)
       │
       ▼
[Bước 4: Huấn luyện có phạt]   ──► XGBoost với scale_pos_weight = N_neg / N_pos
       │
       ▼
[Bước 5: Youden's J Tuning]     ──► Tìm ngưỡng cắt tối ưu hóa Recall trên tập Val
       │
       ▼
[Bước 6: Hiệu chuẩn & XAI]      ──► CalibratedClassifierCV + SHAP TreeExplainer
       │
       ▼
[Bước 7: Xuất Artifacts]        ──► pipeline.joblib + metadata.json
```

### Bước 1: Khám phá & Làm sạch dữ liệu (EDA)
- Rút mẫu ngẫu nhiên có phân tầng 70.000 dòng từ CDC BRFSS để tối ưu hóa thời gian chạy trên Colab.
- Với Pima: Thay thế các giá trị 0 phi lý ở các cột `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI` thành `np.nan` để bộ Imputer xử lý chính xác.

### Bước 2: Phân chia tập dữ liệu (Nguyên tắc chống rò rỉ dữ liệu)
- Tách theo tỷ lệ: **70% Train, 15% Validation, 15% Test** bằng `train_test_split(stratify=y)`.
- **Nguyên tắc bất di bất dịch:** Cất riêng tập Test (15%) vào file độc lập. Không can thiệp, không fit bất kỳ scaler hay model nào lên tập này cho đến bước đánh giá cuối cùng.

### Bước 3: Xây dựng Pipeline tiền xử lý (`ColumnTransformer`)
- Cột số (`numeric_cols`): `SimpleImputer(strategy='median')` $\rightarrow$ `StandardScaler()`.
- Cột nhị phân / phân loại: Giữ nguyên (`passthrough`) hoặc mã hóa OneHot.

### Bước 4: Xử lý mất cân bằng nhãn (Class Imbalance)
- Tính tỷ lệ mất cân bằng:
  $$\text{scale\_pos\_weight} = \frac{\text{Số lượng mẫu âm tính (0)}}{\text{Số lượng mẫu dương tính (1)}}$$
- Truyền trực tiếp vào `XGBClassifier(scale_pos_weight=...)` để tăng trọng số phạt khi dự đoán sai ca dương tính.

### Bước 5: Tối ưu ngưỡng cắt phân loại (Youden's J Threshold Tuning)
- Mặc định các model sử dụng ngưỡng cắt xác suất $0.5$. Tuy nhiên trong y tế, ngưỡng này thường bỏ sót nhiều ca bệnh sớm.
- Sử dụng chỉ số **Youden's J** trên tập Validation:
  $$J = \text{Sensitivity} + \text{Specificity} - 1$$
- Chọn ngưỡng $T^*$ tại vị trí $J$ đạt cực đại (thường từ $0.30 - 0.40$), giúp Recall tăng vọt lên trên $85\%$.

### Bước 6: Hiệu chuẩn xác suất & Giải thích mô hình (Calibration & SHAP)
- **Hiệu chuẩn xác suất:** Bọc mô hình qua `CalibratedClassifierCV(method='sigmoid', cv='prefit')` trên tập Validation. Đảm bảo xác suất dự đoán $0.70$ thực sự phản ánh đúng $70\%$ nguy cơ mắc bệnh.
- **Giải thích SHAP:** Sử dụng `shap.TreeExplainer` trên mô hình gốc để trích xuất **Top 3 yếu tố nguy cơ hàng đầu** tác động tiêu cực nhất đến sức khỏe người dùng.

### Bước 7: Xuất Artifacts cho Backend
- Lưu trữ các file phục vụ inference vào thư mục `models/<disease>/`:
  * `preprocessor.joblib`: Pipeline tiền xử lý dữ liệu.
  * `calibrated_model.joblib`: Mô hình đã hiệu chuẩn xác suất.
  * `base_model.joblib`: Mô hình cây phục vụ tính toán SHAP nhanh.
  * `metadata.json`: Chứa ngưỡng tối ưu, danh sách features, metrics đánh giá và định nghĩa các dải nguy cơ (Thấp/Trung bình/Cao).

---

## IV. MÃ NGUỒN HUẤN LUYỆN HOÀN CHỈNH (CHẠY ĐƯỢC NGAY)

Toàn bộ logic trên được gói gọn trong script dưới đây. Khi chuyển bệnh, chỉ cần sửa giá trị biến `TARGET_COL`:

```python
# train_pipeline.py
import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.metrics import classification_report, roc_auc_score, recall_score, roc_curve
from sklearn.calibration import CalibratedClassifierCV
from xgboost import XGBClassifier

# 1. CẤU HÌNH BỆNH CẦN HUẤN LUYỆN
# Chọn 1 trong các cột: 'Diabetes_binary', 'HighBP', 'HeartDiseaseorAttack', 'Stroke'
TARGET_COL = 'Diabetes_binary' 
DATA_PATH = "diabetes_binary_health_indicators_BRFSS2015.csv"

# 2. TẢI VÀ RÚT MẪU DỮ LIỆU
print(f"[*] Đang tải dữ liệu cho bệnh: {TARGET_COL}...")
df = pd.read_csv(DATA_PATH)

# Rút mẫu 70.000 dòng để Colab chạy mượt mà
if len(df) > 70000:
    df = df.sample(n=70000, random_state=42).reset_index(drop=True)

X = df.drop(columns=[TARGET_COL])
y = df[TARGET_COL].astype(int)

# 3. CHIA TẬP DỮ LIỆU STRATIFIED (70% Train - 15% Val - 15% Test)
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y
)
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
)

# 4. XÂY DỰNG COLUMN TRANSFORMER
numeric_cols = ['BMI', 'MentHlth', 'PhysHlth', 'Age']
binary_cols = [col for col in X.columns if col not in numeric_cols]

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('passthrough', 'passthrough', binary_cols)
    ]
)

X_train_proc = preprocessor.fit_transform(X_train)
X_val_proc = preprocessor.transform(X_val)
X_test_proc = preprocessor.transform(X_test)

# 5. HUẤN LUYỆN MÔ HÌNH XGBOOST CÓ XỬ LÝ MẤT CÂN BẰNG
imbalance_ratio = (y_train == 0).sum() / (y_train == 1).sum()
base_model = XGBClassifier(
    n_estimators=150,
    max_depth=5,
    learning_rate=0.05,
    scale_pos_weight=imbalance_ratio,
    eval_metric='logloss',
    random_state=42
)
base_model.fit(X_train_proc, y_train)

# 6. TÌM NGƯỠNG TỐI ƯU VỚI YOUDEN'S J TRÊN TẬP VALIDATION
y_val_probs = base_model.predict_proba(X_val_proc)[:, 1]
fpr, tpr, thresholds = roc_curve(y_val, y_val_probs)
youden_j = tpr - fpr
optimal_idx = np.argmax(youden_j)
optimal_threshold = float(thresholds[optimal_idx])
print(f"[+] Ngưỡng tối ưu (Youden's J): {optimal_threshold:.4f}")

# 7. HIỆU CHUẨN XÁC SUẤT (CALIBRATION)
calibrated_model = CalibratedClassifierCV(estimator=base_model, method='sigmoid', cv='prefit')
calibrated_model.fit(X_val_proc, y_val)

# 8. ĐÁNH GIÁ TRÊN TẬP TEST ĐỘC LẬP
y_test_probs = calibrated_model.predict_proba(X_test_proc)[:, 1]
y_test_pred = (y_test_probs >= optimal_threshold).astype(int)

auc = roc_auc_score(y_test, y_test_probs)
recall = recall_score(y_test, y_test_pred)
print(f"[+] Đánh giá Test: ROC-AUC = {auc:.4f}, Recall = {recall:.4f}")
print(classification_report(y_test, y_test_pred))

# 9. KHỞI TẠO SHAP EXPLAINER
explainer = shap.TreeExplainer(base_model)

# 10. XUẤT ARTIFACTS
OUTPUT_DIR = f"models/{TARGET_COL.lower()}"
os.makedirs(OUTPUT_DIR, exist_ok=True)

joblib.dump(preprocessor, f"{OUTPUT_DIR}/preprocessor.joblib")
joblib.dump(calibrated_model, f"{OUTPUT_DIR}/calibrated_model.joblib")
joblib.dump(base_model, f"{OUTPUT_DIR}/base_model.joblib")

metadata = {
    "disease": TARGET_COL,
    "model_type": "XGBoost_Calibrated",
    "optimal_threshold": round(optimal_threshold, 4),
    "features": list(X.columns),
    "metrics": {
        "roc_auc": round(auc, 4),
        "recall": round(recall, 4)
    },
    "risk_levels": {
        "low": [0.0, round(optimal_threshold * 0.7, 2)],
        "medium": [round(optimal_threshold * 0.7, 2), round(optimal_threshold * 1.3, 2)],
        "high": [round(optimal_threshold * 1.3, 2), 1.0]
    }
}

with open(f"{OUTPUT_DIR}/metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=4, ensure_ascii=False)

print(f"[SUCCESS] Đã lưu mô hình và metadata vào: {OUTPUT_DIR}/")
```

---

## V. CÁCH TÍCH HỢP VÀO BACKEND FASTAPI

Khi người dùng gửi kết quả khảo sát từ Frontend lên endpoint `/api/v1/screening/assess`, Backend sẽ thực thi như sau:

```python
# backend/app/services/ml_service.py
import joblib
import pandas as pd
import json

class DiseaseInferenceService:
    def __init__(self, disease_name: str):
        model_dir = f"models/{disease_name}"
        self.preprocessor = joblib.load(f"{model_dir}/preprocessor.joblib")
        self.calibrated_model = joblib.load(f"{model_dir}/calibrated_model.joblib")
        self.base_model = joblib.load(f"{model_dir}/base_model.joblib")
        with open(f"{model_dir}/metadata.json", "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

    def predict(self, user_features_dict: dict):
        df_input = pd.DataFrame([user_features_dict])
        X_proc = self.preprocessor.transform(df_input)
        
        # Dự đoán xác suất rủi ro
        prob = float(self.calibrated_model.predict_proba(X_proc)[0, 1])
        
        # Phân loại mức độ nguy cơ dựa trên metadata
        thresholds = self.metadata["risk_levels"]
        if prob < thresholds["low"][1]:
            level = "LOW"
        elif prob < thresholds["medium"][1]:
            level = "MEDIUM"
        else:
            level = "HIGH"
            
        return {
            "disease": self.metadata["disease"],
            "risk_score": round(prob, 4),
            "risk_percentage": round(prob * 100, 1),
            "risk_level": level
        }
```

---

## VI. CHECKLIST TIÊU CHÍ NGHIỆM THU CHO PHẦN ML

- [ ] Tải thành công 2 file dataset (`diabetes_binary_health_indicators_BRFSS2015.csv` và `diabetes.csv`).
- [ ] Hoàn thành EDA, phát hiện và xử lý các giá trị 0 bất thường.
- [ ] Chạy kiểm thử so sánh tối thiểu 3 mô hình (Logistic Regression, Random Forest, XGBoost) trên K-Fold Cross-Validation.
- [ ] Chỉ số Recall trên tập Test đạt $\ge 80\%$.
- [ ] Hiệu chuẩn xác suất hoàn tất với `CalibratedClassifierCV`.
- [ ] Cấu hình SHAP trích xuất được Top 3 yếu tố nguy cơ theo từng ca bệnh.
- [ ] Xuất đủ 4 files: `preprocessor.joblib`, `calibrated_model.joblib`, `base_model.joblib`, `metadata.json`.
- [ ] Tích hợp và test thành công suy luận trên FastAPI TestClient.
