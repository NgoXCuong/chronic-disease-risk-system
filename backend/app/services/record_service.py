"""
Dịch vụ Quản lý Hồ sơ Sàng lọc & Theo dõi Chuỗi Thời gian Nguy cơ (Record & Longitudinal Tracking Service).
Tuân thủ Trụ cột 3 (Tối ưu truy vấn tránh N+1), Trụ cột 4 (Kiến trúc phân tầng) và Trụ cột 5 (Bảo mật PHI & Row-level Authorization).
"""
import uuid
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logger import logger
from app.models.enums import DiseaseType, RecordType, RiskLevel
from app.models.record import HealthRecord
from app.models.screening import ScreeningResult
from app.schemas.record import (
    HealthRecordResponse,
    RiskTrajectoryPoint,
    RiskTrajectoryResponse,
    ScreeningHistoryItem,
    ScreeningHistoryResponse,
    ScreeningResultDetail,
)
from app.schemas.screening import DiseasePredictionResponse
from app.services.ml_service import DISEASE_NAME_VI_MAP


# Bậc ưu tiên phân tầng nguy cơ để xác định mức rủi ro cao nhất của một đợt khám
RISK_LEVEL_PRIORITY: Dict[RiskLevel, int] = {
    RiskLevel.LOW: 1,
    RiskLevel.MEDIUM: 2,
    RiskLevel.HIGH: 3,
}


class RecordService:
    """Xử lý nghiệp vụ lưu trữ CSDL kết quả sàng lọc và tính toán xu hướng sức khỏe theo thời gian."""

    @classmethod
    async def save_screening_assessment(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        record_type: RecordType,
        input_data: Dict[str, Any],
        predictions: List[DiseasePredictionResponse],
        notes: Optional[str] = None,
    ) -> HealthRecord:
        """
        Lưu trữ đồng bộ bảng HealthRecord và toàn bộ ScreeningResult (kèm SHAP JSONB) trong 1 Transaction.
        """
        try:
            # 1. Tạo bản ghi khảo sát sức khỏe gốc
            health_record = HealthRecord(
                id=uuid.uuid4(),
                user_id=user_id,
                record_type=record_type,
                input_data=input_data,
                notes=notes,
            )
            db.add(health_record)

            # 2. Tạo các bản ghi kết quả sàng lọc tương ứng với từng mô hình bệnh lý
            for pred in predictions:
                result_id = uuid.uuid4()
                screening_result = ScreeningResult(
                    id=result_id,
                    health_record_id=health_record.id,
                    disease_type=DiseaseType(pred.disease),
                    model_version="1.0.0",
                    risk_score=pred.risk_score,
                    risk_percentage=pred.risk_percentage,
                    risk_level=RiskLevel(pred.risk_level),
                    optimal_threshold=pred.optimal_threshold,
                    shap_summary=pred.shap_summary or {},
                    top_risk_factors=[f.model_dump() for f in pred.top_risk_factors],
                    recommendations=pred.recommendations,
                )
                db.add(screening_result)

                # Gán lại ID CSDL vào Response DTO để trả về cho Client
                pred.record_id = str(health_record.id)
                pred.screening_result_id = str(result_id)

            await db.flush()
            logger.info(
                "[LƯU TRỮ CSDL] Đã lưu khảo sát %s cho người dùng %s | %d kết quả bệnh lý.",
                health_record.id,
                user_id,
                len(predictions),
            )
            return health_record
        except Exception as e:
            logger.error("[LƯU TRỮ CSDL] Lỗi khi lưu kết quả sàng lọc: %s", e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Lỗi lưu trữ dữ liệu khảo sát sức khỏe vào cơ sở dữ liệu.",
            )

    @classmethod
    async def get_user_screening_history(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        page: int = 1,
        page_size: int = 10,
        disease_type: Optional[DiseaseType] = None,
    ) -> ScreeningHistoryResponse:
        """
        Lấy danh sách lịch sử sàng lọc phân trang của người dùng (FR-13).
        Áp dụng Row-Level Security: chỉ người sở hữu mới có quyền truy cập.
        """
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        offset = (page - 1) * page_size

        # 1. Xây dựng câu truy vấn cơ sở lọc theo user_id
        base_query = select(HealthRecord).where(HealthRecord.user_id == user_id)
        count_query = select(func.count(distinct(HealthRecord.id))).where(HealthRecord.user_id == user_id)

        # Lọc theo bệnh lý nếu người dùng yêu cầu
        if disease_type:
            base_query = base_query.join(ScreeningResult).where(ScreeningResult.disease_type == disease_type)
            count_query = count_query.join(ScreeningResult).where(ScreeningResult.disease_type == disease_type)

        # 2. Đếm tổng số bản ghi
        total_res = await db.execute(count_query)
        total = total_res.scalar() or 0
        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        # 3. Truy vấn nạp trước quan hệ screening_results để tránh N+1 Query (Trụ cột 3)
        paginated_query = (
            base_query.options(selectinload(HealthRecord.screening_results))
            .order_by(HealthRecord.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        records_res = await db.execute(paginated_query)
        records = records_res.scalars().all()

        # 4. Chuyển đổi sang DTO tóm tắt dòng thời gian
        history_items: List[ScreeningHistoryItem] = []
        for rec in records:
            highest_level = RiskLevel.LOW
            highest_score = 0.0
            screened_list = []

            for sr in rec.screening_results:
                if RISK_LEVEL_PRIORITY.get(sr.risk_level, 0) > RISK_LEVEL_PRIORITY.get(highest_level, 0):
                    highest_level = sr.risk_level
                if sr.risk_score > highest_score:
                    highest_score = sr.risk_score

                screened_list.append({
                    "disease": sr.disease_type.value,
                    "disease_name_vi": DISEASE_NAME_VI_MAP.get(sr.disease_type.value, sr.disease_type.value),
                    "risk_level": sr.risk_level.value,
                    "risk_score": sr.risk_score,
                    "risk_percentage": sr.risk_percentage,
                })

            history_items.append(
                ScreeningHistoryItem(
                    record_id=rec.id,
                    record_type=rec.record_type,
                    created_at=rec.created_at,
                    notes=rec.notes,
                    diseases_count=len(rec.screening_results),
                    highest_risk_level=highest_level,
                    highest_risk_score=highest_score,
                    screened_diseases=screened_list,
                )
            )

        return ScreeningHistoryResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=history_items,
        )

    @classmethod
    async def get_screening_record_detail(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        record_id: uuid.UUID,
    ) -> HealthRecordResponse:
        """
        Xem chi tiết một bản ghi khảo sát và toàn bộ kết quả SHAP XAI kèm theo (FR-12, FR-13).
        Kiểm tra chặt chẽ quyền sở hữu (Row-Level Authorization).
        """
        query = (
            select(HealthRecord)
            .options(selectinload(HealthRecord.screening_results))
            .where(HealthRecord.id == record_id, HealthRecord.user_id == user_id)
        )
        res = await db.execute(query)
        record = res.scalar_one_or_none()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy hồ sơ khảo sát sức khỏe hoặc bạn không có quyền truy cập.",
            )

        detail_results: List[ScreeningResultDetail] = []
        for sr in record.screening_results:
            detail_results.append(
                ScreeningResultDetail(
                    id=sr.id,
                    health_record_id=sr.health_record_id,
                    disease_type=sr.disease_type,
                    disease_name_vi=DISEASE_NAME_VI_MAP.get(sr.disease_type.value, sr.disease_type.value),
                    model_version=sr.model_version,
                    risk_score=sr.risk_score,
                    risk_percentage=sr.risk_percentage,
                    risk_level=sr.risk_level,
                    optimal_threshold=sr.optimal_threshold,
                    is_above_threshold=bool(sr.risk_score >= sr.optimal_threshold),
                    top_risk_factors=sr.top_risk_factors,
                    recommendations=sr.recommendations,
                    shap_summary=sr.shap_summary or {},
                    created_at=sr.created_at,
                )
            )

        return HealthRecordResponse(
            id=record.id,
            user_id=record.user_id,
            record_type=record.record_type,
            input_data=record.input_data,
            notes=record.notes,
            created_at=record.created_at,
            screening_results=detail_results,
        )

    @classmethod
    async def get_disease_risk_trajectory(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        disease_type: DiseaseType,
    ) -> RiskTrajectoryResponse:
        """
        Truy xuất chuỗi thời gian diễn tiến nguy cơ và phân tích độ biến thiên Delta Risk (FR-14, FR-15).
        """
        query = (
            select(ScreeningResult)
            .join(HealthRecord, ScreeningResult.health_record_id == HealthRecord.id)
            .where(HealthRecord.user_id == user_id, ScreeningResult.disease_type == disease_type)
            .order_by(ScreeningResult.created_at.asc())
        )
        res = await db.execute(query)
        screening_list = res.scalars().all()

        points: List[RiskTrajectoryPoint] = []
        prev_score: Optional[float] = None
        optimal_threshold = 0.5

        for sr in screening_list:
            optimal_threshold = sr.optimal_threshold
            delta: Optional[float] = None
            trend_str: Optional[str] = None

            if prev_score is not None:
                delta = round(sr.risk_score - prev_score, 4)
                if delta <= -0.05:
                    trend_str = "Tích cực (Nguy cơ giảm)"
                elif delta >= 0.05:
                    trend_str = "Cần chú ý (Nguy cơ tăng)"
                else:
                    trend_str = "Ổn định"

            points.append(
                RiskTrajectoryPoint(
                    record_id=sr.health_record_id,
                    screening_result_id=sr.id,
                    recorded_at=sr.created_at,
                    risk_score=sr.risk_score,
                    risk_percentage=sr.risk_percentage,
                    risk_level=sr.risk_level,
                    optimal_threshold=sr.optimal_threshold,
                    is_above_threshold=bool(sr.risk_score >= sr.optimal_threshold),
                    delta_risk=delta,
                    trend_status=trend_str,
                )
            )
            prev_score = sr.risk_score

        # Đánh giá tổng quan xu hướng xuyên suốt các lần khám
        if not points:
            overall_trend = "Chưa có dữ liệu khảo sát cho bệnh lý này."
        elif len(points) == 1:
            overall_trend = "Đây là kết quả khảo sát đầu tiên. Cần tiếp tục theo dõi định kỳ để xác định xu hướng."
        else:
            first_score = points[0].risk_score
            last_score = points[-1].risk_score
            total_change = round(last_score - first_score, 4)
            if total_change <= -0.05:
                overall_trend = f"Xu hướng tích cực: Nguy cơ đã giảm {abs(round(total_change * 100, 1))}% so với lần đầu."
            elif total_change >= 0.05:
                overall_trend = f"Cảnh báo: Nguy cơ có xu hướng gia tăng (+{round(total_change * 100, 1)}% so với lần đầu). Cần tư vấn y tế."
            else:
                overall_trend = "Mức độ nguy cơ duy trì ở trạng thái ổn định."

        disease_name_vi = DISEASE_NAME_VI_MAP.get(disease_type.value, disease_type.value)

        return RiskTrajectoryResponse(
            disease_type=disease_type,
            disease_name_vi=disease_name_vi,
            total_evaluations=len(points),
            optimal_threshold=optimal_threshold,
            overall_trend=overall_trend,
            trajectory=points,
        )
