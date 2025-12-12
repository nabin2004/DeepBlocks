from app.db.init_db import get_db
from app.models.user import UserInDB
from app.schemas.user import UserCreate

# Use the `bcrypt` package directly to avoid passlib backend detection
# issues that can raise on import in some environments. This also keeps
# behavior explicit: we truncate to 72 bytes (bcrypt limitation) at the
# byte level and pass bytes to the backend.
import bcrypt

BCRYPT_MAX_BYTES = 72


def _truncate_to_bcrypt_bytes(password: str) -> bytes:
    b = password.encode("utf-8")
    return b[:BCRYPT_MAX_BYTES]


def get_password_hash(password: str) -> str:
    truncated = _truncate_to_bcrypt_bytes(password)
    hashed = bcrypt.hashpw(truncated, bcrypt.gensalt())
    # hashed is bytes like b"$2b$12$..."; store/return as utf-8 string
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = _truncate_to_bcrypt_bytes(plain_password)
    # bcrypt.checkpw expects bytes for both arguments
    return bcrypt.checkpw(truncated, hashed_password.encode("utf-8"))


def create_user(user: UserCreate):
    db = get_db()
    hashed = get_password_hash(user.password)

    try:
        user_in_db = UserInDB(
            email=user.email,
            hashed_password=hashed
        )
    except Exception as e:
        raise RuntimeError(f"{e} Failed to create UserInDB instance") from e

    result = db["users"].insert_one(user_in_db.dict())
    return user_in_db


def get_user_by_email(email: str):
    db = get_db()
    user_doc = db["users"].find_one({"email": email})
    if not user_doc:
        return None
    return UserInDB(**user_doc)