import os
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-dev-secret")
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError on failure.
    Returns the decoded payload on success.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
