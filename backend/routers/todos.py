from fastapi import APIRouter, Depends, HTTPException, status

from auth.dependencies import get_current_user
from models.todo import TodoCreate, TodoOut, TodoUpdate, todo_store
from utils.logger import get_logger

router = APIRouter(tags=["todos"])
logger = get_logger(__name__)


# ── Protected info endpoint ────────────────────────────────────────────────────

@router.get("/protected")
def protected_info(current_user: dict = Depends(get_current_user)):
    logger.info("Protected endpoint accessed by: %s", current_user["username"])
    return {
        "message": f"Welcome, {current_user['username']}! You have access to protected data.",
        "user": {"id": current_user["id"], "username": current_user["username"]},
    }


# ── To-Do CRUD ────────────────────────────────────────────────────────────────

@router.get("/todos", response_model=list[TodoOut])
def list_todos(current_user: dict = Depends(get_current_user)):
    todos = todo_store.list_by_owner(current_user["id"])
    return [TodoOut(**t) for t in todos]


@router.post("/todos", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
def create_todo(body: TodoCreate, current_user: dict = Depends(get_current_user)):
    todo = todo_store.create(body.title, body.description, current_user["id"])
    logger.info("Todo created by %s: %s", current_user["username"], todo["id"])
    return TodoOut(**todo)


@router.put("/todos/{todo_id}", response_model=TodoOut)
def update_todo(
    todo_id: str,
    body: TodoUpdate,
    current_user: dict = Depends(get_current_user),
):
    existing = todo_store.get(todo_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    if existing["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your todo")

    updates = body.model_dump(exclude_none=True)
    updated = todo_store.update(todo_id, **updates)
    return TodoOut(**updated)


@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: str, current_user: dict = Depends(get_current_user)):
    existing = todo_store.get(todo_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    if existing["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your todo")

    todo_store.delete(todo_id)
    logger.info("Todo %s deleted by %s", todo_id, current_user["username"])
