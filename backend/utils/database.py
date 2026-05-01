import sqlite3
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent.parent / "todo.db"


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with _conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                completed INTEGER NOT NULL DEFAULT 0,
                owner_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES users(id)
            )
        """)
        conn.commit()


# ── User helpers ──────────────────────────────────────────────────────────────

def user_exists(username: str) -> bool:
    with _conn() as conn:
        row = conn.execute("SELECT 1 FROM users WHERE username = ?", (username,)).fetchone()
        return row is not None


def user_create(username: str, hashed_password: str) -> dict:
    uid = str(uuid.uuid4())
    with _conn() as conn:
        conn.execute(
            "INSERT INTO users (id, username, hashed_password) VALUES (?, ?, ?)",
            (uid, username, hashed_password),
        )
        conn.commit()
    return {"id": uid, "username": username, "hashed_password": hashed_password}


def user_get_by_username(username: str) -> Optional[dict]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        return dict(row) if row else None


# ── Todo helpers ──────────────────────────────────────────────────────────────

def todo_create(title: str, description: Optional[str], owner_id: str) -> dict:
    tid = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    with _conn() as conn:
        conn.execute(
            "INSERT INTO todos (id, title, description, completed, owner_id, created_at) VALUES (?, ?, ?, 0, ?, ?)",
            (tid, title, description, owner_id, created_at),
        )
        conn.commit()
    return {
        "id": tid, "title": title, "description": description,
        "completed": False, "owner_id": owner_id, "created_at": created_at,
    }


def todo_list_by_owner(owner_id: str) -> list[dict]:
    with _conn() as conn:
        rows = conn.execute(
            "SELECT * FROM todos WHERE owner_id = ? ORDER BY created_at DESC", (owner_id,)
        ).fetchall()
        return [_row_to_todo(r) for r in rows]


def todo_get(todo_id: str) -> Optional[dict]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
        return _row_to_todo(row) if row else None


def todo_update(todo_id: str, **fields) -> Optional[dict]:
    allowed = {"title", "description", "completed"}
    updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
    if not updates:
        return todo_get(todo_id)

    # SQLite stores booleans as integers
    if "completed" in updates:
        updates["completed"] = 1 if updates["completed"] else 0

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    values = list(updates.values()) + [todo_id]
    with _conn() as conn:
        conn.execute(f"UPDATE todos SET {set_clause} WHERE id = ?", values)
        conn.commit()
    return todo_get(todo_id)


def todo_delete(todo_id: str) -> bool:
    with _conn() as conn:
        cur = conn.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
        conn.commit()
        return cur.rowcount > 0


def _row_to_todo(row: sqlite3.Row) -> dict:
    d = dict(row)
    d["completed"] = bool(d["completed"])
    return d
