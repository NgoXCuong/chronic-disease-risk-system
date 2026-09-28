"""
Cấu hình kiểm thử dùng chung toàn bộ test suite (Pytest Configuration & Fixtures).
Tuân thủ Trụ cột 3 (Tối ưu hóa tài nguyên) và Trụ cột 7 (Dễ kiểm thử & Có thể chứng minh).
"""
import pytest
from app.core.database import engine
from app.core.model_loader import ModelRegistry


@pytest.fixture(scope="session", autouse=True)
def load_all_models_once():
    """Nạp sẵn 5 mô hình ML vào RAM một lần duy nhất cho toàn bộ phiên kiểm thử."""
    ModelRegistry.load_all_models()


@pytest.fixture(autouse=True)
def cleanup_db_connections():
    """
    Giải phóng connection pool đồng bộ sau mỗi test case,
    ngăn ngừa việc asyncpg sử dụng lại kết nối socket đã gắn với event loop cũ.
    """
    yield
    engine.sync_engine.dispose()
