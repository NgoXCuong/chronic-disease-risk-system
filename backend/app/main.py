from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1 import api_v1_router
from app.core.config import settings
from app.core.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application Lifespan Events Handler.
    Initializes DB connection pools and loads ML model artifacts into RAM once at startup.
    """
    # 1. Startup: Verify database connection
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        print(f"[FATAL] Failed to connect to PostgreSQL database: {e}")

    yield

    # 2. Shutdown: Dispose database connections
    await engine.dispose()


# Initialize FastAPI Application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description=(
        "Hệ thống web hỗ trợ sàng lọc và theo dõi nguy cơ một số bệnh mạn tính bằng Machine Learning.\n\n"
        "**Tuyên bố miễn trừ trách nhiệm y tế (Medical Disclaimer):**\n"
        "Hệ thống này chỉ đóng vai trò hỗ trợ ra quyết định và sàng lọc cộng đồng, "
        "tuyệt đối không thay thế chẩn đoán chuyên môn hoặc chỉ định điều trị của bác sĩ."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get(
    "/",
    tags=["0. Trạng thái Hệ thống (System Health)"],
    summary="Trang thông tin tổng quan API",
    status_code=status.HTTP_200_OK,
)
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "status": "online",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "disclaimer": "Hệ thống hỗ trợ ra quyết định y tế, không thay thế chẩn đoán lâm sàng của bác sĩ.",
    }


@app.get(
    "/health",
    tags=["0. Trạng thái Hệ thống (System Health)"],
    summary="Kiểm tra tình trạng sức khỏe kết nối CSDL",
    status_code=status.HTTP_200_OK,
)
async def health_check():
    db_healthy = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_healthy = True
    except Exception:
        db_healthy = False

    return {
        "status": "healthy" if db_healthy else "unhealthy",
        "database_connected": db_healthy,
        "version": "1.0.0",
    }
