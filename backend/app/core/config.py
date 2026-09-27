import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Cấu hình trung tâm của ứng dụng, nạp từ biến môi trường hoặc tệp .env.
    Tuân thủ chuẩn BaseSettings của Pydantic v2.
    """
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # Thông tin chung về dự án
    PROJECT_NAME: str = "Chronic Disease Risk Assessment System"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Bảo mật và cấu hình Token JWT
    SECRET_KEY: str = "supersecretjwtkey_chronic_disease_2026_thesis_security_key_xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cấu hình Cơ sở dữ liệu (PostgreSQL 16)
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres123"
    POSTGRES_DB: str = "chronic_disease_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Chuỗi kết nối bất đồng bộ cho SQLAlchemy 2.0 (asyncpg)
    DATABASE_URL: str = (
        f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
    # Chuỗi kết nối đồng bộ phục vụ Alembic migration
    SYNC_DATABASE_URL: str = (
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # Cấu hình Connection Pool cho Engine CSDL
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30

    # Cấu hình nguồn gốc được phép truy cập (CORS Origins)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    # Khóa API tích hợp LLM bên ngoài (Google Gemini API)
    GEMINI_API_KEY: str = ""

    # Đường dẫn thư mục chứa Artifacts của 5 mô hình Machine Learning
    MODEL_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "ml-pipeline", "models")
    )


settings = Settings()
