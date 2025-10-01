from pydantic_settings import BaseSettings
import json
from typing import List

class Settings(BaseSettings):
    MONGODB_URI: str
    JWT_SECRET: str
    JWT_EXPIRES_IN: int
    CORS_ORIGINS: str = '["http://localhost:5137", "http://127.0.0.1:5137", "http://localhost:5173", "http://127.0.0.1:5173"]'

    class Config:
        env_file = ".env"

    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            # Fallback to common development origins
            return [
                "http://localhost:5137",
                "http://127.0.0.1:5137", 
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            ]

settings = Settings()