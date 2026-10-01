import os
from typing import List, Optional
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Cấu hình trung tâm của ứng dụng, nạp an toàn từ biến môi trường hoặc tệp .env.
    Tuân thủ nguyên tắc Twelve-Factor App: Không hard-code khóa bảo mật hay mật khẩu vào mã nguồn.
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

    # Bảo mật và cấu hình Token JWT (Bắt buộc nạp từ biến môi trường .env)
    SECRET_KEY: str = Field(..., description="Khóa bí mật ký JWT (tối thiểu 32 ký tự), nạp từ .env")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cấu hình Cơ sở dữ liệu (PostgreSQL 16)
    POSTGRES_USER: str = Field(default="postgres", description="Tên người dùng PostgreSQL")
    POSTGRES_PASSWORD: str = Field(..., description="Mật khẩu PostgreSQL, bắt buộc nạp từ .env")
    POSTGRES_DB: str = Field(default="chronic_disease_db", description="Tên cơ sở dữ liệu")
    POSTGRES_HOST: str = Field(default="localhost", description="Địa chỉ máy chủ cơ sở dữ liệu")
    POSTGRES_PORT: int = Field(default=5432, description="Cổng kết nối cơ sở dữ liệu")

    # Chuỗi kết nối CSDL (Đọc từ .env hoặc tự động sinh nếu chưa được chỉ định)
    DATABASE_URL: str = Field(default="", description="Chuỗi kết nối bất đồng bộ cho SQLAlchemy 2.0 (asyncpg)")
    SYNC_DATABASE_URL: str = Field(default="", description="Chuỗi kết nối đồng bộ phục vụ Alembic migration")

    @model_validator(mode="after")
    def assemble_db_connection_strings(self):
        """Tự động xây dựng chuỗi kết nối CSDL nếu chưa được cung cấp trực tiếp trong .env"""
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        if not self.SYNC_DATABASE_URL:
            self.SYNC_DATABASE_URL = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self

    # Cấu hình Connection Pool cho Engine CSDL
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO: bool = Field(default=False, description="In câu lệnh SQL thô ra terminal (True: bật, False: tắt)")

    # Cấu hình nguồn gốc được phép truy cập (CORS Origins)
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    # Khóa API tích hợp LLM bên ngoài (Google Gemini API)
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # Đường dẫn thư mục chứa Artifacts của 5 mô hình Machine Learning
    MODEL_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "ml-pipeline", "models")
    )


settings = Settings()
