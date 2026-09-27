import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central Application Settings loaded from environment variables or .env file.
    Follows Pydantic v2 BaseSettings standard.
    """
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    # General Project Info
    PROJECT_NAME: str = "Chronic Disease Risk Assessment System"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security & Tokens
    SECRET_KEY: str = "supersecretjwtkey_chronic_disease_2026_thesis_security_key_xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Configuration (PostgreSQL 16)
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres123"
    POSTGRES_DB: str = "chronic_disease_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # Async Database URL for SQLAlchemy 2.0 asyncpg
    DATABASE_URL: str = (
        f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )
    # Sync Database URL for Alembic migrations
    SYNC_DATABASE_URL: str = (
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # Database Engine Pool Settings
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30

    # CORS Configurations
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    # External LLM Integration (Google Gemini API)
    GEMINI_API_KEY: str = ""

    # Path to ML Model Artifacts directory
    MODEL_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "ml-pipeline", "models")
    )


settings = Settings()
