# BE-03: Focus Sessions Service - Implementation Status

**Last Updated**: November 13, 2025
**Status**: 🟡 IN PROGRESS (50% Complete)
**Priority**: HIGH
**Estimated Time Remaining**: 2 hours
**TDD Approach**: RED → GREEN → REFACTOR

---

## 📊 Current Status

### ✅ COMPLETED (50%)
1. **Database Migration** - Migration 028 created and applied
   - File: `src/database/migrations/028_create_focus_sessions_table.sql`
   - Tables: `focus_sessions` (with indexes)
   - Applied to: `./proxy_agents_enhanced.db` and `./.data/databases/proxy_agents_enhanced.db`

2. **Directory Structure** - All folders and files created
   ```
   src/services/focus_sessions/
   ├── __init__.py
   ├── models.py         (EMPTY - needs implementation)
   ├── repository.py     (EMPTY - needs implementation)
   ├── routes.py         (EMPTY - needs implementation)
   └── tests/
       ├── __init__.py
       ├── conftest.py   (✅ DONE - has fixtures)
       └── test_focus_sessions.py  (NEEDS TDD TESTS)
   ```

3. **Test Fixtures** - conftest.py created
   - `test_client()` - FastAPI test client
   - `sample_session_data()` - Valid session creation data
   - `sample_completed_session()` - Completed session data

### 🔄 IN PROGRESS (Next Steps)
1. Write TDD tests (RED phase)
2. Implement models.py
3. Implement repository.py
4. Implement routes.py
5. Run tests to verify GREEN
6. REFACTOR to optimize

### ❌ NOT STARTED
- Integration with main FastAPI app
- Seed data (optional)
- Frontend API integration (FE-07)

---

## 🗄️ Database Schema (✅ COMPLETE)

### Table: focus_sessions

```sql
CREATE TABLE focus_sessions (
    session_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    step_id TEXT,  -- Optional link to task steps
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    completed INTEGER DEFAULT 0,  -- 0 = false, 1 = true
    interruptions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_focus_user` on `user_id`
- `idx_focus_step` on `step_id`
- `idx_focus_started` on `started_at DESC`
- `idx_focus_completed` on `completed`

**Migration Commands:**
```bash
# Apply migration
sqlite3 ./proxy_agents_enhanced.db < src/database/migrations/028_create_focus_sessions_table.sql
sqlite3 ./.data/databases/proxy_agents_enhanced.db < src/database/migrations/028_create_focus_sessions_table.sql

# Verify table
sqlite3 ./proxy_agents_enhanced.db "PRAGMA table_info(focus_sessions);"
```

---

## 🧪 TDD Test Plan (RED Phase)

### Required Tests (10 total)

Create these tests in `src/services/focus_sessions/tests/test_focus_sessions.py`:

1. ✅ `test_start_focus_session_success` - Start new session
2. ✅ `test_start_session_validation_error_invalid_duration` - Validate duration (5-90 min)
3. ✅ `test_start_session_validation_error_no_user_id` - Require user_id
4. ✅ `test_end_focus_session_success` - End session successfully
5. ✅ `test_end_session_with_interruptions` - Track interruptions
6. ✅ `test_end_session_not_found` - 404 for non-existent session
7. ✅ `test_get_user_sessions` - List user's sessions
8. ✅ `test_get_user_sessions_with_limit` - Pagination
9. ✅ `test_get_focus_analytics` - Calculate metrics
10. ✅ `test_analytics_with_no_sessions` - Handle empty state

**Run Tests (Should FAIL - RED phase):**
```bash
source .venv/bin/activate
python -m pytest src/services/focus_sessions/tests/test_focus_sessions.py -v
# Expected: 10 failed (RED) - endpoints don't exist yet
```

---

## 📦 Implementation Guide (GREEN Phase)

### Step 1: Create models.py

```python
# src/services/focus_sessions/models.py
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class FocusSessionCreate(BaseModel):
    """Request model for creating a focus session."""
    user_id: str = Field(..., min_length=1)
    step_id: Optional[str] = None
    duration_minutes: int = Field(25, ge=5, le=90)

class FocusSessionUpdate(BaseModel):
    """Request model for updating/ending a session."""
    ended_at: Optional[datetime] = None
    completed: Optional[bool] = None
    interruptions: Optional[int] = Field(None, ge=0)

class FocusSession(BaseModel):
    """Response model for a focus session."""
    session_id: str
    user_id: str
    step_id: Optional[str]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_minutes: int
    completed: bool
    interruptions: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FocusAnalytics(BaseModel):
    """Analytics summary for user's focus sessions."""
    total_sessions: int
    completed_sessions: int
    completion_rate: float
    total_focus_minutes: int
    average_duration_minutes: float
```

### Step 2: Create repository.py

```python
# src/services/focus_sessions/repository.py
from uuid import uuid4
from datetime import datetime, UTC
from typing import List, Optional

from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.services.focus_sessions.models import (
    FocusSession,
    FocusSessionCreate,
    FocusSessionUpdate,
    FocusAnalytics,
)


class FocusSessionRepository:
    """Repository for focus sessions database operations."""

    def __init__(self, db: EnhancedDatabaseAdapter):
        self.db = db

    def create(self, session_data: FocusSessionCreate) -> FocusSession:
        """Create a new focus session."""
        session_id = str(uuid4())
        now = datetime.now(UTC)

        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO focus_sessions (
                session_id, user_id, step_id, started_at,
                duration_minutes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                session_data.user_id,
                session_data.step_id,
                now,
                session_data.duration_minutes,
                now,
            ),
        )
        conn.commit()

        return self.get_by_id(session_id)

    def get_by_id(self, session_id: str) -> Optional[FocusSession]:
        """Get a session by ID."""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM focus_sessions WHERE session_id = ?",
            (session_id,)
        )
        row = cursor.fetchone()

        if not row:
            return None

        return FocusSession(
            session_id=row[0],
            user_id=row[1],
            step_id=row[2],
            started_at=row[3],
            ended_at=row[4],
            duration_minutes=row[5],
            completed=bool(row[6]),
            interruptions=row[7],
            created_at=row[8],
        )

    def update(self, session_id: str, update_data: FocusSessionUpdate) -> Optional[FocusSession]:
        """Update/end a focus session."""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Build dynamic update
        updates = []
        values = []

        if update_data.ended_at is not None:
            updates.append("ended_at = ?")
            values.append(update_data.ended_at)
        elif update_data.completed is not None:
            # Auto-set ended_at if completing
            updates.append("ended_at = ?")
            values.append(datetime.now(UTC))

        if update_data.completed is not None:
            updates.append("completed = ?")
            values.append(1 if update_data.completed else 0)

        if update_data.interruptions is not None:
            updates.append("interruptions = ?")
            values.append(update_data.interruptions)

        if not updates:
            return self.get_by_id(session_id)

        values.append(session_id)

        cursor.execute(
            f"UPDATE focus_sessions SET {', '.join(updates)} WHERE session_id = ?",
            values
        )
        conn.commit()

        return self.get_by_id(session_id)

    def get_by_user(self, user_id: str, limit: int = 10) -> List[FocusSession]:
        """Get user's recent focus sessions."""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT * FROM focus_sessions
            WHERE user_id = ?
            ORDER BY started_at DESC
            LIMIT ?
            """,
            (user_id, limit)
        )

        return [
            FocusSession(
                session_id=row[0],
                user_id=row[1],
                step_id=row[2],
                started_at=row[3],
                ended_at=row[4],
                duration_minutes=row[5],
                completed=bool(row[6]),
                interruptions=row[7],
                created_at=row[8],
            )
            for row in cursor.fetchall()
        ]

    def get_analytics(self, user_id: str) -> FocusAnalytics:
        """Calculate focus analytics for user."""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
                SUM(duration_minutes) as total_minutes,
                AVG(duration_minutes) as avg_minutes
            FROM focus_sessions
            WHERE user_id = ?
            """,
            (user_id,)
        )

        row = cursor.fetchone()
        total = row[0] or 0
        completed = row[1] or 0
        total_minutes = row[2] or 0
        avg_minutes = row[3] or 0.0

        completion_rate = (completed / total) if total > 0 else 0.0

        return FocusAnalytics(
            total_sessions=total,
            completed_sessions=completed,
            completion_rate=completion_rate,
            total_focus_minutes=total_minutes,
            average_duration_minutes=avg_minutes,
        )
```

### Step 3: Create routes.py

```python
# src/services/focus_sessions/routes.py
from fastapi import APIRouter, HTTPException, Query, status

from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.services.focus_sessions.models import (
    FocusSession,
    FocusSessionCreate,
    FocusSessionUpdate,
    FocusAnalytics,
)
from src.services.focus_sessions.repository import FocusSessionRepository

router = APIRouter(prefix="/api/v1/focus/sessions", tags=["focus"])


def get_repository() -> FocusSessionRepository:
    """Get focus session repository instance."""
    db = EnhancedDatabaseAdapter()
    return FocusSessionRepository(db)


@router.post("/", response_model=FocusSession, status_code=status.HTTP_201_CREATED)
async def start_focus_session(session_data: FocusSessionCreate):
    """Start a new focus session."""
    repo = get_repository()
    return repo.create(session_data)


@router.put("/{session_id}", response_model=FocusSession)
async def end_focus_session(session_id: str, update_data: FocusSessionUpdate):
    """End/update a focus session."""
    repo = get_repository()
    session = repo.update(session_id, update_data)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Focus session not found"
        )

    return session


@router.get("/user/{user_id}", response_model=list[FocusSession])
async def get_user_sessions(user_id: str, limit: int = Query(10, ge=1, le=100)):
    """Get user's recent focus sessions."""
    repo = get_repository()
    return repo.get_by_user(user_id, limit)


@router.get("/analytics/{user_id}", response_model=FocusAnalytics)
async def get_focus_analytics(user_id: str):
    """Get focus session analytics for user."""
    repo = get_repository()
    return repo.get_analytics(user_id)
```

### Step 4: Register Routes in main.py

```python
# Add to src/api/main.py
from src.services.focus_sessions.routes import router as focus_router

app.include_router(focus_router)
```

---

## ✅ Verification (GREEN Phase)

### Run Tests
```bash
source .venv/bin/activate
python -m pytest src/services/focus_sessions/tests/test_focus_sessions.py -v

# Expected: 10 passed (GREEN)
```

### Manual API Testing
```bash
# Start a session
curl -X POST http://localhost:8000/api/v1/focus/sessions \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "duration_minutes": 25}'

# Get user sessions
curl http://localhost:8000/api/v1/focus/sessions/user/test-user

# Get analytics
curl http://localhost:8000/api/v1/focus/sessions/analytics/test-user
```

---

## 🔧 REFACTOR Phase

After tests pass, consider:
1. Add connection pooling for high-frequency requests
2. Add caching for analytics (Redis)
3. Add WebSocket notifications when session ends
4. Optimize SQL queries with prepared statements
5. Add bulk operations for multiple sessions

---

## 📈 Acceptance Criteria

- [x] Database schema created with migration
- [ ] All 10 TDD tests passing
- [ ] Models with Pydantic validation
- [ ] Repository with all CRUD operations
- [ ] 4 API endpoints functional
- [ ] Routes registered in main.py
- [ ] 95%+ test coverage
- [ ] No linting errors

---

## 🔗 Related Tasks

- **FE-07**: Focus Timer Component (depends on this backend)
- **BE-15**: Integration tests will include focus session flows
- **Epic 4**: Real-time dashboard shows focus metrics

---

## 📝 Notes for Future Agents

1. **Database**: Both `./proxy_agents_enhanced.db` and `./.data/databases/proxy_agents_enhanced.db` need migrations
2. **Testing**: Tests use production database (no separate test DB yet)
3. **TDD**: Always write tests FIRST, then implement to make them pass
4. **Models**: Use Pydantic v2 with `ConfigDict` (not old `Config` class)
5. **SQLite**: Use INTEGER (0/1) for booleans, not BOOLEAN type

---

**Next Agent**: Start by running the TDD tests to see current failures, then implement code to make them pass.
