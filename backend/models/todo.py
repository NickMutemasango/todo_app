from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime


# ── Pydantic schemas ───────────────────────────────────────────────────────────

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)


class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = None


class TodoOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    completed: bool
    owner_id: str
    created_at: str


# ── In-memory todo store ───────────────────────────────────────────────────────

class TodoStore:
    def __init__(self) -> None:
        # Maps todo_id -> todo dict
        self._todos: dict[str, dict] = {}

    def create(self, title: str, description: Optional[str], owner_id: str) -> dict:
        record = {
            "id": str(uuid.uuid4()),
            "title": title,
            "description": description,
            "completed": False,
            "owner_id": owner_id,
            "created_at": datetime.utcnow().isoformat(),
        }
        self._todos[record["id"]] = record
        return record

    def list_by_owner(self, owner_id: str) -> list[dict]:
        return [t for t in self._todos.values() if t["owner_id"] == owner_id]

    def get(self, todo_id: str) -> Optional[dict]:
        return self._todos.get(todo_id)

    def update(self, todo_id: str, **fields) -> Optional[dict]:
        todo = self._todos.get(todo_id)
        if not todo:
            return None
        todo.update({k: v for k, v in fields.items() if v is not None})
        return todo

    def delete(self, todo_id: str) -> bool:
        return self._todos.pop(todo_id, None) is not None


# Module-level singleton
todo_store = TodoStore()
