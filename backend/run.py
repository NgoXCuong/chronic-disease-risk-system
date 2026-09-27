"""
Script khởi chạy máy chủ FastAPI Backend trong môi trường phát triển (Development).
Giúp lập trình viên khởi động nhanh máy chủ chỉ với lệnh: python run.py
"""
import uvicorn


if __name__ == "__main__":
    # Khởi chạy máy chủ Uvicorn với tính năng tự động tải lại (hot-reload) khi phát hiện code thay đổi
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
