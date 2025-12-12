from datetime import datetime, timedelta 
from jose import jwt 
from app.core.config import settings 

def create_access_token(subject: str):
    expire = datetime.now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": subject, "exp":expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

