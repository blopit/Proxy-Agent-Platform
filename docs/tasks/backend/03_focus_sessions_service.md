# BE-03: Focus Sessions Service (Week 9)

**Status**: 🟢 AVAILABLE
**Priority**: MEDIUM
**Dependencies**: None
**Estimated Time**: 4 hours
**TDD**: RED-GREEN-REFACTOR

---

## 📋 Overview

Track Pomodoro focus sessions for analytics. Records session start/end times, duration, interruptions, and completion status.

---

## 🗄️ Schema

```sql
CREATE TABLE focus_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    step_id UUID REFERENCES micro_steps(step_id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_minutes INT,
    completed BOOLEAN DEFAULT false,
    interruptions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_focus_user ON focus_sessions(user_id);
CREATE INDEX idx_focus_step ON focus_sessions(step_id);
```

---

## 📦 Models

```python
class FocusSessionCreate(BaseModel):
    user_id: str
    step_id: Optional[UUID] = None
    duration_minutes: int = Field(25, ge=5, le=90)

class FocusSessionUpdate(BaseModel):
    ended_at: Optional[datetime] = None
    completed: Optional[bool] = None
    interruptions: Optional[int] = None

class FocusSession(BaseModel):
    session_id: UUID
    user_id: str
    step_id: Optional[UUID]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_minutes: int
    completed: bool
    interruptions: int
```

---

## 🚀 API Routes

```python
@router.post("/", response_model=FocusSession)
async def start_focus_session(session_data: FocusSessionCreate):
    """Start a new focus session."""
    pass

@router.put("/{session_id}", response_model=FocusSession)
async def end_focus_session(session_id: UUID, update_data: FocusSessionUpdate):
    """End focus session, mark complete."""
    pass

@router.get("/user/{user_id}", response_model=List[FocusSession])
async def get_user_sessions(user_id: str, limit: int = 10):
    """Get user's recent focus sessions."""
    pass

@router.get("/analytics/{user_id}")
async def get_focus_analytics(user_id: str):
    """Get focus statistics: avg duration, completion rate, total focus time."""
    pass
```

---

## 🧪 TDD Tests (RED First)

```python
def test_start_focus_session()  # Create session
def test_end_focus_session()    # Complete session
def test_track_interruptions()  # Increment interruption count
def test_calculate_analytics()  # Avg duration, completion %
```

---

## ✅ Checklist

- [ ] Schema + migration
- [ ] Models with validation
- [ ] Repository with analytics queries
- [ ] 4 API endpoints
- [ ] 8+ TDD tests
- [ ] 95%+ coverage

---

**Next**: Frontend FE-07 FocusTimer UI
