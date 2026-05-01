from pydantic import BaseModel, Field
from typing import Optional
import uuid


# ── Pydantic schemas (request / response shapes) ──────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: str
    username: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── In-memory user store ───────────────────────────────────────────────────────
# Maps username -> {"id": str, "username": str, "hashed_password": str}

class UserStore:
    def __init__(self) -> None:
        self._users: dict[str, dict] = {}

    def exists(self, username: str) -> bool:
        return username in self._users

    def create(self, username: str, hashed_password: str) -> dict:
        record = {
            "id": str(uuid.uuid4()),
            "username": username,
            "hashed_password": hashed_password,
        }
        self._users[username] = record
        return record

    def get_by_username(self, username: str) -> Optional[dict]:
        return self._users.get(username)


# Module-level singleton shared across the app
user_store = UserStore()
