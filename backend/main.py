"""
Tệp khởi chạy chính của máy chủ Backend FastAPI.
Cho phép khởi chạy trực tiếp máy chủ từ thư mục backend/ bằng lệnh:
    python main.py
"""
import uvicorn
from app.main import app


if __name__ == "__main__":
    # Khởi chạy máy chủ Uvicorn với chế độ tự động tải lại (hot-reload)
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
