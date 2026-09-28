"""
API Router Phục vụ Đánh giá Sàng lọc Nguy cơ Bệnh Mạn tính (Screening & Risk Assessment).
Hỗ trợ cả sàng lọc từng bệnh lý và sàng lọc tổng hợp đa bệnh (Tầng 1 BRFSS & Tầng 2 Lâm sàng).
"""
from typing import Annotated, Any, Dict, List, Optional, Union
from fastapi import APIRouter, Body, Depends, HTTPException, Query, status

from app.core.model_loader import ModelRegistry
from app.models.enums import DiseaseType
from app.schemas.screening import (
    ClinicalDiabetesRequest,
    DiseasePredictionResponse,
    LifestyleScreeningRequest,
    LoadedModelSummary,
)
from app.services.ml_service import MLService, DISEASE_NAME_VI_MAP

router = APIRouter(prefix="/screening", tags=["3. Sàng lọc & Đánh giá Nguy cơ (Screening & AI Engine)"])


@router.get(
    "/models",
    response_model=List[LoadedModelSummary],
    summary="Danh sách các mô hình Machine Learning đang sẵn sàng trong RAM",
    description="Truy vấn thông tin kỹ thuật, siêu tham số, chỉ số đánh giá (ROC-AUC, Recall) và danh sách đặc trưng của 5 mô hình.",
)
async def list_loaded_models():
    models = ModelRegistry.get_all_models()
    summary_list: List[LoadedModelSummary] = []
    for d_name, m in models.items():
        summary_list.append(
            LoadedModelSummary(
                disease=d_name,
                disease_name_vi=DISEASE_NAME_VI_MAP.get(d_name, d_name),
                model_type=m.model_type,
                optimal_threshold=m.optimal_threshold,
                trained_date=m.trained_date,
                features_count=len(m.features_order),
                features_order=m.features_order,
                metrics=m.metrics,
            )
        )
    return summary_list


@router.post(
    "/predict/lifestyle/{disease_name}",
    response_model=DiseasePredictionResponse,
    summary="Đánh giá nguy cơ một bệnh lý theo Khảo sát Lối sống (Tầng 1)",
    description=(
        "Chỉ định bệnh lý cần sàng lọc: `diabetes_binary`, `hypertension`, `cardiovascular`, hoặc `stroke`. "
        "Truyền vào bộ 21 chỉ số khảo sát hành vi và nhân trắc CDC BRFSS."
    ),
)
async def predict_lifestyle_disease(
    disease_name: DiseaseType,
    req: LifestyleScreeningRequest,
):
    if disease_name == DiseaseType.DIABETES_CLINICAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bệnh 'diabetes_clinical' yêu cầu các chỉ số xét nghiệm lâm sàng. Vui lòng sử dụng endpoint: /predict/clinical/diabetes",
        )

    input_data = req.model_dump()
    return MLService.predict_disease_risk(disease_name.value, input_data)


@router.post(
    "/predict/clinical/diabetes",
    response_model=DiseasePredictionResponse,
    summary="Đánh giá nguy cơ Đái tháo đường chuyên sâu theo Xét nghiệm Lâm sàng (Tầng 2 - Pima)",
    description="Dành cho người đã có kết quả xét nghiệm sinh hóa máu (Glucose, Insulin, Huyết áp, BMI...).",
)
async def predict_clinical_diabetes(
    req: ClinicalDiabetesRequest,
):
    input_data = req.model_dump()
    return MLService.predict_disease_risk(DiseaseType.DIABETES_CLINICAL.value, input_data)


@router.post(
    "/comprehensive",
    response_model=Dict[str, DiseasePredictionResponse],
    summary="Sàng lọc Toàn diện: Đánh giá đồng thời cả 4 bệnh mạn tính Tầng 1 chỉ với 1 bảng khảo sát",
    description=(
        "Người bệnh chỉ cần điền 1 biểu mẫu khảo sát lối sống duy nhất. "
        "Hệ thống sẽ chạy song song qua 4 mô hình Machine Learning (Tiểu đường, Huyết áp, Tim mạch, Đột quỵ) "
        "và trả về bức tranh rủi ro toàn diện."
    ),
)
async def predict_comprehensive_risk(
    req: LifestyleScreeningRequest,
):
    input_data = req.model_dump()
    target_diseases = [
        DiseaseType.DIABETES_BINARY.value,
        DiseaseType.HYPERTENSION.value,
        DiseaseType.CARDIOVASCULAR.value,
        DiseaseType.STROKE.value,
    ]

    comprehensive_results: Dict[str, DiseasePredictionResponse] = {}
    for d in target_diseases:
        try:
            res = MLService.predict_disease_risk(d, input_data)
            comprehensive_results[d] = res
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Lỗi khi đánh giá bệnh '{d}': {str(e)}",
            )

    return comprehensive_results
