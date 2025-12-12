from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI + MongoDB"
    MONGO_URI: str = "mongodb://deepblocks:super-secret@localhost:27017/?authSource=admin"
    MONGO_DB: str = "deepblocks"
    SECRET_KEY: str = "super-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 

settings = Settings()
