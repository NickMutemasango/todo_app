import bcrypt
from fastapi import APIRouter, HTTPException, status

from auth.jwt_handler import create_access_token
from models.user import TokenResponse, UserLogin, UserOut, UserRegister, user_store
from utils.logger import get_logger

router = APIRouter(prefix="/auth", tags=["auth"])
logger = get_logger(__name__)


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: UserRegister):
    if user_store.exists(body.username):
        logger.warning("Registration failed — username taken: %s", body.username)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already registered")

    user = user_store.create(body.username, _hash(body.password))
    logger.info("New user registered: %s (id=%s)", user["username"], user["id"])
    return UserOut(id=user["id"], username=user["username"])


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin):
    user = user_store.get_by_username(body.username)
    if not user or not _verify(body.password, user["hashed_password"]):
        logger.warning("Failed login attempt for username: %s", body.username)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = create_access_token({"sub": user["username"], "user_id": user["id"]})
    logger.info("User logged in: %s", user["username"])
    return TokenResponse(
        access_token=token,
        user=UserOut(id=user["id"], username=user["username"]),
    )
