from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./planetpulse.db"
    FRONTEND_URL: str = "http://localhost:3000"
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
