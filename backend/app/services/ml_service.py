"""
Dịch vụ Suy luận Mô hình Học máy & Trích xuất Giải thích SHAP (ML & XAI Inference Service).
Tuân thủ Trụ cột 3 (Hiệu năng cao), Trụ cột 4 (Kiến trúc phân tầng) và Trụ cột 8 (Minh bạch học thuật XAI).
"""
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
import xgboost as xgb
from fastapi import HTTPException, status

from app.core.logger import logger
from app.core.model_loader import ModelRegistry, LoadedDiseaseModel
from app.schemas.screening import DiseasePredictionResponse, RiskFactorItem


# Bảng ánh xạ tên tiếng Việt thân thiện cho toàn bộ các đặc trưng y tế
FEATURE_NAME_VI_MAP: Dict[str, str] = {
    # 21 đặc trưng của khảo sát Tầng 1 (CDC BRFSS)
    "HighBP": "Tiền sử tăng huyết áp",
    "HighChol": "Mỡ máu (Cholesterol) cao",
    "CholCheck": "Kiểm tra cholesterol định kỳ",
    "BMI": "Chỉ số khối cơ thể (BMI)",
    "Smoker": "Thói quen hút thuốc lá",
    "Stroke": "Tiền sử đột quỵ",
    "HeartDiseaseorAttack": "Tiền sử bệnh mạch vành / nhồi máu cơ tim",
    "Diabetes_binary": "Tiền sử đái tháo đường",
    "PhysActivity": "Thói quen vận động thể lực",
    "Fruits": "Mức độ ăn trái cây hàng ngày",
    "Veggies": "Mức độ ăn rau xanh hàng ngày",
    "HvyAlcoholConsump": "Mức độ tiêu thụ rượu bia",
    "AnyHealthcare": "Có bảo hiểm y tế",
    "NoDocbcCost": "Trở ngại chi phí y tế khi khám",
    "GenHlth": "Tự đánh giá sức khỏe tổng quát",
    "MentHlth": "Số ngày căng thẳng / sức khỏe tinh thần kém",
    "PhysHlth": "Số ngày đau ốm / suy giảm thể chất",
    "DiffWalk": "Khó khăn trong đi bộ hoặc leo cầu thang",
    "Sex": "Giới tính sinh học",
    "Age": "Nhóm tuổi",
    "Education": "Trình độ học vấn",
    "Income": "Mức thu nhập gia đình",
    # 8 đặc trưng của khảo sát Tầng 2 (Lâm sàng Pima)
    "Pregnancies": "Số lần mang thai",
    "Glucose": "Nồng độ Glucose huyết tương lúc đói (mg/dL)",
    "BloodPressure": "Huyết áp tâm trương khi đo (mmHg)",
    "SkinThickness": "Độ dày nếp gấp da cơ tam đầu (mm)",
    "Insulin": "Nồng độ Insulin huyết thanh (mu U/ml)",
    "DiabetesPedigreeFunction": "Chỉ số phả hệ di truyền gia đình",
}

# Tên bệnh lý bằng tiếng Việt chuẩn mực y tế
DISEASE_NAME_VI_MAP: Dict[str, str] = {
    "diabetes_binary": "Đái tháo đường Týp 2 (Sàng lọc nhanh lối sống)",
    "hypertension": "Tăng huyết áp nguyên phát (Sàng lọc lối sống)",
    "cardiovascular": "Bệnh tim mạch & Mạch vành (Sàng lọc lối sống)",
    "stroke": "Nguy cơ Đột quỵ não (Sàng lọc lối sống)",
    "diabetes_clinical": "Đái tháo đường (Đánh giá chuyên sâu qua xét nghiệm lâm sàng)",
}


class MLService:
    """Nghiệp vụ thực thi tiền xử lý, tính toán xác suất hiệu chuẩn và trích xuất SHAP XAI."""

    @staticmethod
    def _stratify_risk_level(risk_score: float, risk_levels: Dict[str, List[float]]) -> str:
        """Phân loại mức độ nguy cơ dựa trên ngưỡng phân tầng của mô hình."""
        low_bound = risk_levels.get("low", [0.0, 0.3])
        med_bound = risk_levels.get("medium", [0.3, 0.65])

        if risk_score <= low_bound[1]:
            return "LOW"
        elif risk_score <= med_bound[1]:
            return "MEDIUM"
        return "HIGH"

    @staticmethod
    def _generate_clinical_recommendations(disease: str, risk_level: str) -> List[str]:
        """Tự động sinh ngân hàng khuyến nghị lâm sàng dựa trên mức độ nguy cơ."""
        if risk_level == "LOW":
            return [
                "Duy trì chế độ dinh dưỡng cân bằng và trọng lượng cơ thể lý tưởng (BMI mục tiêu 18.5 - 22.9 kg/m²).",
                "Tiếp tục thói quen tập luyện thể thao vừa sức ít nhất 150 phút mỗi tuần.",
                "Khám sức khỏe tổng quát và tái thực hiện khảo sát sàng lọc định kỳ mỗi 6 - 12 tháng.",
            ]
        elif risk_level == "MEDIUM":
            return [
                "Cắt giảm lượng muối (<5g/ngày), hạn chế tinh bột tinh chế, đồ uống có đường và chất béo bão hòa.",
                "Tăng cường chất xơ hòa tan từ rau xanh, các loại đậu và ngũ cốc nguyên hạt.",
                "Chủ động tự theo dõi các chỉ số sinh hiệu (huyết áp, đường huyết tại nhà) 1-2 lần/tuần.",
                "Lên kế hoạch thăm khám bác sĩ gia đình hoặc trạm y tế trong vòng 1 tháng để được kiểm tra định kỳ.",
            ]
        else:  # HIGH
            return [
                "CẢNH BÁO QUAN TRỌNG: Chỉ số nguy cơ vượt ngưỡng cảnh báo lâm sàng. Đề nghị đến cơ sở y tế chuyên khoa để thăm khám trong vòng 1-2 tuần.",
                "Thực hiện các xét nghiệm cận lâm sàng chuyên sâu (HbA1c, bilan lipid máu, điện tâm đồ ECG, siêu âm Doppler mạch).",
                "Tuyệt đối không tự ý mua và sử dụng các loại thuốc hạ áp hoặc hạ đường huyết khi chưa có chỉ định và đơn thuốc của bác sĩ chuyên khoa.",
                "Thiết lập ngay nhật ký dinh dưỡng và theo dõi sát sao các dấu hiệu bất thường (đau tức ngực, khó thở, hoa mắt, tê bì tay chân).",
            ]

    @classmethod
    def predict_disease_risk(
        cls,
        disease_name: str,
        input_data: Dict[str, Any]
    ) -> DiseasePredictionResponse:
        """
        Dự đoán xác suất nguy cơ mắc bệnh và trích xuất Top yếu tố thúc đẩy qua SHAP.
        Tối ưu hóa: 0ms I/O ổ đĩa vì mô hình và preprocessor đã nằm sẵn trong bộ nhớ RAM.
        """
        # 1. Lấy mô hình đã nạp từ bộ nhớ RAM
        model_obj = ModelRegistry.get_model(disease_name)
        if not model_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mô hình cho bệnh lý '{disease_name}' chưa được nạp hoặc không tồn tại.",
            )

        # 2. Xây dựng 1-row Pandas DataFrame theo đúng thứ tự cột quy định trong metadata
        features_order = model_obj.features_order
        row_dict = {}
        for feat in features_order:
            val = input_data.get(feat, 0.0)
            try:
                row_dict[feat] = [float(val)]
            except (ValueError, TypeError):
                row_dict[feat] = [0.0]

        df_input = pd.DataFrame(row_dict)

        # 3. Chạy qua pipeline tiền xử lý (Imputer + Scaler)
        try:
            X_transformed = model_obj.preprocessor.transform(df_input)
        except Exception as e:
            logger.error("[ML INFERENCE] Lỗi tiền xử lý dữ liệu cho '%s': %s", disease_name, e)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lỗi định dạng dữ liệu đầu vào: {str(e)}",
            )

        # 4. Dự đoán xác suất nguy cơ đã hiệu chuẩn (Calibrated Probability)
        try:
            prob_array = model_obj.calibrated_model.predict_proba(X_transformed)
            # Lấy xác suất lớp 1 (nguy cơ mắc bệnh)
            risk_score = float(prob_array[0, 1])
        except Exception as e:
            logger.error("[ML INFERENCE] Lỗi suy luận mô hình Calibrated '%s': %s", disease_name, e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Lỗi trong quá trình tính toán xác suất mô hình.",
            )

        risk_score = max(0.0, min(1.0, risk_score))
        risk_percentage = round(risk_score * 100.0, 2)
        optimal_threshold = model_obj.optimal_threshold
        is_above_threshold = bool(risk_score >= optimal_threshold)
        risk_level = cls._stratify_risk_level(risk_score, model_obj.risk_levels)

        # 5. Tính toán giá trị giải thích SHAP XAI tức thì qua C++ Booster
        top_risk_factors: List[RiskFactorItem] = []
        try:
            dmat = xgb.DMatrix(X_transformed)
            contribs = model_obj.base_model.get_booster().predict(dmat, pred_contribs=True)[0]
            feature_contribs = contribs[:-1]  # Loại bỏ phần tử cuối cùng (bias base_value)

            # Ghép tên đặc trưng với giá trị đóng góp SHAP
            shap_tuples = []
            for i, feat in enumerate(features_order):
                shap_val = float(feature_contribs[i])
                raw_val = input_data.get(feat, 0.0)
                shap_tuples.append((feat, raw_val, shap_val))

            # Sắp xếp theo giá trị tuyệt đối độ đóng góp giảm dần
            shap_tuples.sort(key=lambda item: abs(item[2]), reverse=True)

            # Lấy Top 3 - 5 yếu tố có đóng góp lớn nhất
            for feat, raw_val, shap_val in shap_tuples[:4]:
                impact_pct = round(abs(shap_val) * 10.0, 1)
                is_pos = shap_val > 0
                sign_str = "+" if is_pos else "-"
                action_str = "tăng" if is_pos else "giảm"
                impact_str = f"{sign_str}{impact_pct}% (Làm {action_str} nguy cơ)"

                top_risk_factors.append(
                    RiskFactorItem(
                        feature=feat,
                        feature_name_vi=FEATURE_NAME_VI_MAP.get(feat, feat),
                        value=raw_val,
                        shap_value=round(shap_val, 4),
                        impact=impact_str,
                        is_positive_risk=is_pos,
                    )
                )
        except Exception as e:
            logger.warning("[ML INFERENCE] Không thể trích xuất SHAP cho '%s': %s", disease_name, e)

        # 6. Sinh khuyến nghị y tế và hoàn tất Response Payload
        recommendations = cls._generate_clinical_recommendations(disease_name, risk_level)
        disease_name_vi = DISEASE_NAME_VI_MAP.get(disease_name, disease_name.replace("_", " ").title())

        logger.info(
            "[ĐÁNH GIÁ NGUY CƠ] Bệnh: %s | Điểm: %.4f (%.1f%%) | Mức: %s | Vượt ngưỡng: %s",
            disease_name,
            risk_score,
            risk_percentage,
            risk_level,
            is_above_threshold,
        )

        return DiseasePredictionResponse(
            disease=disease_name,
            disease_name_vi=disease_name_vi,
            risk_score=round(risk_score, 4),
            risk_percentage=risk_percentage,
            risk_level=risk_level,
            optimal_threshold=optimal_threshold,
            is_above_threshold=is_above_threshold,
            top_risk_factors=top_risk_factors,
            recommendations=recommendations,
        )
