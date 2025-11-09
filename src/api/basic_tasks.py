"""
Basic Task API endpoints - Simplified for frontend integration
"""

import json
import sqlite3
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1", tags=["basic-tasks"])

# Simple database path
DB_PATH = ".data/databases/simple_tasks.db"


def init_simple_db():
    """Initialize a simple tasks database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create simple tasks table without foreign keys
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS simple_tasks (
            task_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'todo',
            priority TEXT DEFAULT 'medium',
            created_at TEXT,
            updated_at TEXT,
            completed_at TEXT,
            due_date TEXT,
            tags TEXT,
            metadata TEXT
        )
    """
    )

    conn.commit()
    conn.close()


# Initialize database on module load
init_simple_db()


@router.get("/simple-tasks")
async def list_simple_tasks():
    """List all simple tasks"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM simple_tasks ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()

        tasks = []
        for row in rows:
            task = {
                "task_id": row[0],
                "title": row[1],
                "description": row[2],
                "status": row[3],
                "priority": row[4],
                "created_at": row[5],
                "updated_at": row[6],
                "completed_at": row[7],
                "due_date": row[8],
                "tags": json.loads(row[9]) if row[9] else [],
                "metadata": json.loads(row[10]) if row[10] else {},
            }
            tasks.append(task)

        return {"tasks": tasks, "total": len(tasks), "limit": 50, "offset": 0}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/simple-tasks")
async def create_simple_task(task_data: dict):
    """Create a new simple task"""
    try:
        task_id = task_data.get("task_id", str(uuid4()))
        title = task_data.get("title", "Untitled Task")
        description = task_data.get("description", "")
        status = task_data.get("status", "todo")
        priority = task_data.get("priority", "medium")
        created_at = datetime.now().isoformat()
        updated_at = created_at
        tags = json.dumps(task_data.get("tags", []))
        metadata = json.dumps(task_data.get("metadata", {}))

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO simple_tasks
            (task_id, title, description, status, priority, created_at, updated_at, tags, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (task_id, title, description, status, priority, created_at, updated_at, tags, metadata),
        )
        conn.commit()
        conn.close()

        return {
            "task_id": task_id,
            "title": title,
            "description": description,
            "status": status,
            "priority": priority,
            "created_at": created_at,
            "updated_at": updated_at,
            "tags": task_data.get("tags", []),
            "metadata": task_data.get("metadata", {}),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/simple-tasks/{task_id}")
async def get_simple_task(task_id: str):
    """Get a specific simple task"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM simple_tasks WHERE task_id = ?", (task_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail="Task not found")

        return {
            "task_id": row[0],
            "title": row[1],
            "description": row[2],
            "status": row[3],
            "priority": row[4],
            "created_at": row[5],
            "updated_at": row[6],
            "completed_at": row[7],
            "due_date": row[8],
            "tags": json.loads(row[9]) if row[9] else [],
            "metadata": json.loads(row[10]) if row[10] else {},
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.put("/simple-tasks/{task_id}")
async def update_simple_task(task_id: str, task_data: dict):
    """Update a simple task"""
    try:
        # Check if task exists
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM simple_tasks WHERE task_id = ?", (task_id,))
        existing = cursor.fetchone()

        if not existing:
            conn.close()
            raise HTTPException(status_code=404, detail="Task not found")

        # Update fields
        title = task_data.get("title", existing[1])
        description = task_data.get("description", existing[2])
        status = task_data.get("status", existing[3])
        priority = task_data.get("priority", existing[4])
        updated_at = datetime.now().isoformat()
        completed_at = existing[7]

        # Set completed_at if status changed to done
        if status == "done" and existing[3] != "done":
            completed_at = updated_at
        elif status != "done":
            completed_at = None

        due_date = task_data.get("due_date", existing[8])
        tags = json.dumps(task_data.get("tags", json.loads(existing[9]) if existing[9] else []))
        metadata = json.dumps(
            task_data.get("metadata", json.loads(existing[10]) if existing[10] else {})
        )

        cursor.execute(
            """
            UPDATE simple_tasks
            SET title=?, description=?, status=?, priority=?, updated_at=?,
                completed_at=?, due_date=?, tags=?, metadata=?
            WHERE task_id=?
        """,
            (
                title,
                description,
                status,
                priority,
                updated_at,
                completed_at,
                due_date,
                tags,
                metadata,
                task_id,
            ),
        )
        conn.commit()
        conn.close()

        return {
            "task_id": task_id,
            "title": title,
            "description": description,
            "status": status,
            "priority": priority,
            "created_at": existing[5],
            "updated_at": updated_at,
            "completed_at": completed_at,
            "due_date": due_date,
            "tags": task_data.get("tags", json.loads(existing[9]) if existing[9] else []),
            "metadata": task_data.get("metadata", json.loads(existing[10]) if existing[10] else {}),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.delete("/simple-tasks/{task_id}")
async def delete_simple_task(task_id: str):
    """Delete a simple task"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM simple_tasks WHERE task_id = ?", (task_id,))

        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Task not found")

        conn.commit()
        conn.close()

        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/simple-tasks/stats/summary")
async def get_task_stats():
    """Get task statistics for dashboard"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Get counts by status
        cursor.execute("SELECT status, COUNT(*) FROM simple_tasks GROUP BY status")
        status_counts = dict(cursor.fetchall())

        # Get total tasks
        cursor.execute("SELECT COUNT(*) FROM simple_tasks")
        total_tasks = cursor.fetchone()[0]

        # Get completed today
        today = datetime.now().date().isoformat()
        cursor.execute("SELECT COUNT(*) FROM simple_tasks WHERE DATE(completed_at) = ?", (today,))
        completed_today = cursor.fetchone()[0]

        conn.close()

        return {
            "total_tasks": total_tasks,
            "todo_tasks": status_counts.get("todo", 0),
            "in_progress_tasks": status_counts.get("in_progress", 0),
            "done_tasks": status_counts.get("done", 0),
            "completed_today": completed_today,
            "completion_rate": (status_counts.get("done", 0) / total_tasks * 100)
            if total_tasks > 0
            else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
