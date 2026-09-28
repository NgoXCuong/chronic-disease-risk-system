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
    Trình quản lý vòng đời ứng dụng (Lifespan Events Handler).
    Khởi tạo kết nối CSDL và nạp sẵn các mô hình Machine Learning vào RAM khi server khởi động.
    """
    # 1. Khởi động (Startup): Kiểm tra kết nối tới cơ sở dữ liệu PostgreSQL
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        print(f"[NGUY HIỂM] Không thể kết nối cơ sở dữ liệu PostgreSQL: {e}")

    yield

    # 2. Tắt ứng dụng (Shutdown): Đóng an toàn toàn bộ kết nối cơ sở dữ liệu
    await engine.dispose()


# Khởi tạo ứng dụng FastAPI với mô tả và tuyên bố miễn trừ y tế
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

# Cấu hình Middleware chia sẻ tài nguyên nguồn gốc chéo (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gắn kết các router API phiên bản v1
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


if __name__ == "__main__":
    import sys
    from pathlib import Path
    import uvicorn

    # Tự động thêm thư mục gốc backend vào sys.path để chạy trực tiếp không bị lỗi import app
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

