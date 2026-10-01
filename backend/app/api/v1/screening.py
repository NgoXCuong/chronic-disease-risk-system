"""
API Router Phục vụ Đánh giá Sàng lọc Nguy cơ Bệnh Mạn tính (Screening & Risk Assessment).
Hỗ trợ cả sàng lọc từng bệnh lý, sàng lọc toàn diện đa bệnh, và theo dõi dọc chuỗi thời gian (FR-07 -> FR-15).
"""
import uuid
from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_async_db
from app.core.model_loader import ModelRegistry
from app.core.security import get_current_user, get_optional_current_user
from app.models.enums import DiseaseType, RecordType
from app.models.profile import PatientProfile
from app.models.record import HealthRecord
from app.models.user import User
from app.schemas.record import (
    HealthRecordResponse,
    RiskTrajectoryResponse,
    ScreeningHistoryResponse,
)
from app.schemas.screening import (
    ClinicalDiabetesRequest,
    DiseasePredictionResponse,
    LifestyleScreeningRequest,
    LoadedModelSummary,
)
from app.services.ml_service import MLService, DISEASE_NAME_VI_MAP
from app.services.pdf_service import PDFReportService
from app.services.record_service import RecordService

router = APIRouter(prefix="/screening", tags=["3. Sàng lọc & Đánh giá Nguy cơ (Screening & AI Engine)"])

# Type Aliases cho Dependency Injection ngắn gọn theo Trụ cột 1
DatabaseSession = Annotated[AsyncSession, Depends(get_async_db)]
OptionalUser = Annotated[Optional[User], Depends(get_optional_current_user)]
CurrentUser = Annotated[User, Depends(get_current_user)]


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
        "Tự động lưu trữ CSDL (health_records + screening_results) nếu người dùng đã đăng nhập."
    ),
)
async def predict_lifestyle_disease(
    disease_name: DiseaseType,
    req: LifestyleScreeningRequest,
    db: DatabaseSession,
    current_user: OptionalUser = None,
):
    if disease_name == DiseaseType.DIABETES_CLINICAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bệnh 'diabetes_clinical' yêu cầu các chỉ số xét nghiệm lâm sàng. Vui lòng sử dụng endpoint: /predict/clinical/diabetes",
        )

    input_data = req.model_dump(exclude={"notes"})
    pred = MLService.predict_disease_risk(disease_name.value, input_data)

    # Nếu người dùng đã đăng nhập, tự động lưu kết quả vào CSDL theo FR-12
    if current_user:
        await RecordService.save_screening_assessment(
            db=db,
            user_id=current_user.id,
            record_type=RecordType.LIFESTYLE_BRFSS,
            input_data=input_data,
            predictions=[pred],
            notes=req.notes,
        )

    return pred


@router.post(
    "/predict/clinical/diabetes",
    response_model=DiseasePredictionResponse,
    summary="Đánh giá nguy cơ Đái tháo đường chuyên sâu theo Xét nghiệm Lâm sàng (Tầng 2 - Pima)",
    description="Dành cho người đã có kết quả xét nghiệm sinh hóa máu (Glucose, Insulin, Huyết áp, BMI...).",
)
async def predict_clinical_diabetes(
    req: ClinicalDiabetesRequest,
    db: DatabaseSession,
    current_user: OptionalUser = None,
):
    input_data = req.model_dump(exclude={"notes"})
    pred = MLService.predict_disease_risk(DiseaseType.DIABETES_CLINICAL.value, input_data)

    # Tự động lưu vào CSDL nếu có phiên đăng nhập
    if current_user:
        await RecordService.save_screening_assessment(
            db=db,
            user_id=current_user.id,
            record_type=RecordType.CLINICAL_PIMA,
            input_data=input_data,
            predictions=[pred],
            notes=req.notes,
        )

    return pred


@router.post(
    "/comprehensive",
    response_model=Dict[str, DiseasePredictionResponse],
    summary="Sàng lọc Toàn diện: Đánh giá đồng thời cả 4 bệnh mạn tính Tầng 1 chỉ với 1 bảng khảo sát",
    description=(
        "Người bệnh chỉ cần điền 1 biểu mẫu khảo sát lối sống duy nhất. "
        "Hệ thống sẽ chạy song song qua 4 mô hình Machine Learning (Tiểu đường, Huyết áp, Tim mạch, Đột quỵ) "
        "và tự động lưu trọn gói vào CSDL nếu đã đăng nhập."
    ),
)
async def predict_comprehensive_risk(
    req: LifestyleScreeningRequest,
    db: DatabaseSession,
    current_user: OptionalUser = None,
):
    input_data = req.model_dump(exclude={"notes"})
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

    # Lưu trữ đồng bộ 1 HealthRecord và 4 ScreeningResults trong 1 transaction
    if current_user:
        await RecordService.save_screening_assessment(
            db=db,
            user_id=current_user.id,
            record_type=RecordType.LIFESTYLE_BRFSS,
            input_data=input_data,
            predictions=list(comprehensive_results.values()),
            notes=req.notes,
        )

    return comprehensive_results


@router.get(
    "/history",
    response_model=ScreeningHistoryResponse,
    summary="Lịch sử các đợt sàng lọc của người dùng (FR-13)",
    description="Truy vấn danh sách các lần thực hiện khảo sát, có phân trang và tùy chọn lọc theo bệnh lý.",
)
async def get_screening_history(
    current_user: CurrentUser,
    db: DatabaseSession,
    page: int = Query(1, ge=1, description="Số thứ tự trang (bắt đầu từ 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Số bản ghi mỗi trang (1 - 100)"),
    disease_type: Optional[DiseaseType] = Query(None, description="Lọc theo mã bệnh lý mạn tính cụ thể"),
):
    return await RecordService.get_user_screening_history(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        disease_type=disease_type,
    )


@router.get(
    "/history/{record_id}",
    response_model=HealthRecordResponse,
    summary="Chi tiết một đợt sàng lọc cụ thể (FR-12, FR-13)",
    description="Xem lại toàn bộ chỉ số đầu vào, điểm nguy cơ, phân tầng và giải thích SHAP XAI của lần khám.",
)
async def get_screening_record_detail(
    record_id: uuid.UUID,
    current_user: CurrentUser,
    db: DatabaseSession,
):
    return await RecordService.get_screening_record_detail(
        db=db,
        user_id=current_user.id,
        record_id=record_id,
    )


@router.get(
    "/trajectory/{disease_name}",
    response_model=RiskTrajectoryResponse,
    summary="Biểu đồ Chuỗi thời gian Diễn tiến Nguy cơ theo từng Bệnh lý (FR-14, FR-15)",
    description="Tính toán biến thiên nguy cơ (Delta Risk) giữa các lần khám và đánh giá xu hướng tiến triển.",
)
async def get_disease_risk_trajectory(
    disease_name: DiseaseType,
    current_user: CurrentUser,
    db: DatabaseSession,
):
    return await RecordService.get_disease_risk_trajectory(
        db=db,
        user_id=current_user.id,
        disease_type=disease_name,
    )


@router.get(
    "/history/{record_id}/pdf",
    summary="Xuất phiếu kết quả sàng lọc ra định dạng PDF (FR-16)",
    description="Tải về tệp PDF chuẩn y khoa của một lần khám cụ thể để lưu trữ hoặc tham vấn bác sĩ chuyên khoa.",
)
async def export_screening_pdf(
    record_id: uuid.UUID,
    current_user: CurrentUser,
    db: DatabaseSession,
):
    # 1. Truy vấn hồ sơ sàng lọc kèm danh sách kết quả (Row-Level Security)
    record_query = (
        select(HealthRecord)
        .options(selectinload(HealthRecord.screening_results))
        .where(HealthRecord.id == record_id, HealthRecord.user_id == current_user.id)
    )
    res = await db.execute(record_query)
    record = res.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy hồ sơ khảo sát sức khỏe hoặc bạn không có quyền truy cập.",
        )

    # 2. Truy vấn thông tin nhân trắc học người dùng
    prof_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == current_user.id))
    profile = prof_res.scalar_one_or_none()

    # 3. Tạo tệp PDF chuẩn y khoa
    pdf_bytes = PDFReportService.generate_screening_report_pdf(
        record=record,
        user=current_user,
        profile=profile,
    )

    filename = f"phieu-sang-loc-{record_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        },
    )

