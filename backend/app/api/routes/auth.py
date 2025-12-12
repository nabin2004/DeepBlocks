from fastapi import APIRouter, HTTPException
from app.schemas.user import UserCreate
from app.crud.user import create_user, get_user_by_email, verify_password
from app.core.security import create_access_token

router = APIRouter()

@router.post("/signup")
def signup(user: UserCreate):
    try: 
        existing = get_user_by_email(user.email)
    except Exception:
        raise HTTPException(status_code=500, detail="get_user_by_email failed!")
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(user)

@router.post("/login")
def login(user: UserCreate):
    db_user = get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token(subject=db_user.email)
    return {"access_token": token, "token_type": "bearer"}


