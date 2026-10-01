"""
API Router Phục vụ Mô phỏng Can thiệp Lối sống "What-If" (FR-17 -> FR-19).
Cho phép so sánh rủi ro Trước vs. Sau can thiệp theo thời gian thực (Before vs. After).
"""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_db
from app.core.security import get_optional_current_user
from app.models.user import User
from app.schemas.simulation import (
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
)
from app.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulation", tags=["5. Mô phỏng Can thiệp Lối sống What-If (CDSS Simulation)"])

DatabaseSession = Annotated[AsyncSession, Depends(get_async_db)]
OptionalUser = Annotated[Optional[User], Depends(get_optional_current_user)]


@router.post(
    "/calculate",
    response_model=WhatIfSimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Mô phỏng Can thiệp Lối sống What-If thời gian thực (FR-17, FR-18)",
    description=(
        "Tiếp nhận bộ chỉ số thay đổi giả định (BMI mới, cai thuốc lá, tăng tập thể thao...), "
        "tính toán đối chứng Before vs. After và đo lường mức độ giảm rủi ro y tế (Delta Risk)."
    ),
)
async def calculate_what_if_simulation(
    req: WhatIfSimulationRequest,
    db: DatabaseSession,
    current_user: OptionalUser = None,
):
    user_id = current_user.id if current_user else None
    return await SimulationService.run_what_if_simulation(
        db=db,
        req=req,
        user_id=user_id,
    )
