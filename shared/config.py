import os
from typing import Optional


def get_env(key: str, default: Optional[str] = None, required: bool = False) -> str:
    value = os.getenv(key, default)
    if required and value is None:
        raise ValueError(f"Required environment variable {key} is not set")
    return value


def get_env_int(key: str, default: Optional[int] = None, required: bool = False) -> int:
    value = os.getenv(key, default)
    if value is None:
        if required:
            raise ValueError(f"Required environment variable {key} is not set")
        return default if default is not None else 0
    try:
        return int(value)
    except ValueError:
        raise ValueError(f"Environment variable {key} must be an integer")


def get_env_float(key: str, default: Optional[float] = None, required: bool = False) -> float:
    value = os.getenv(key, default)
    if value is None:
        if required:
            raise ValueError(f"Required environment variable {key} is not set")
        return default if default is not None else 0.0
    try:
        return float(value)
    except ValueError:
        raise ValueError(f"Environment variable {key} must be a float")


POSTGRES_HOST = get_env("POSTGRES_HOST", "localhost")
POSTGRES_PORT = get_env_int("POSTGRES_PORT", 5432)
POSTGRES_DB = get_env("POSTGRES_DB", "fin_platform")
POSTGRES_USER = get_env("POSTGRES_USER", "admin")
POSTGRES_PASSWORD = get_env("POSTGRES_PASSWORD", "secretpw")

REDIS_HOST = get_env("REDIS_HOST", "localhost")
REDIS_PORT = get_env_int("REDIS_PORT", 6379)
REDIS_PASSWORD = get_env("REDIS_PASSWORD", "")

JWT_SECRET = get_env("JWT_SECRET", "supersecretkey", required=True)
JWT_EXPIRE_MINUTES = get_env_int("JWT_EXPIRE_MINUTES", 60)

AWS_ACCESS_KEY_ID = get_env("AWS_ACCESS_KEY_ID", "")
AWS_SECRET_ACCESS_KEY = get_env("AWS_SECRET_ACCESS_KEY", "")
AWS_REGION = get_env("AWS_REGION", "us-east-1")
S3_BUCKET = get_env("S3_BUCKET", "fin-platform-data")

OPENAI_API_KEY = get_env("OPENAI_API_KEY", "")
LLAMA3_API_URL = get_env("LLAMA3_API_URL", "")
LLM_PROVIDER = get_env("LLM_PROVIDER", "openai")

CELERY_BROKER_URL = get_env("CELERY_BROKER_URL", f"redis://{REDIS_HOST}:{REDIS_PORT}/0")
CELERY_RESULT_BACKEND = get_env("CELERY_RESULT_BACKEND", f"redis://{REDIS_HOST}:{REDIS_PORT}/1")

FRONTEND_URL = get_env("FRONTEND_URL", "http://localhost:3000")
API_GATEWAY_URL = get_env("API_GATEWAY_URL", "http://localhost:8000")

DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
SYNC_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
