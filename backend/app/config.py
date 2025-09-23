# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    secret_key: str
    database_url: str
    cors_origins: List[str] = []

    class Config:
        env_file = ".env"

settings = Settings()