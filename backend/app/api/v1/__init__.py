from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.screening import router as screening_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.chat import router as chat_router
from app.api.v1.facilities import router as facilities_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(screening_router)
api_v1_router.include_router(simulation_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(facilities_router)

__all__ = ["api_v1_router"]
