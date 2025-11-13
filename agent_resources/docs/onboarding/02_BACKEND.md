# Backend Onboarding Implementation

## Technology Stack

- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite
- **ORM**: Raw SQL (sqlite3)
- **Validation**: Pydantic v2
- **Package Manager**: UV

## Architecture

```
API Layer (FastAPI Router)
    ↓
Service Layer (Business Logic)
    ↓
Database Layer (SQLite)
```

### Separation of Concerns

1. **Router** (`src/api/routes/onboarding.py`): HTTP handlers, input validation, response formatting
2. **Service** (`src/services/onboarding_service.py`): Business logic, data transformation
3. **Schemas** (`src/api/routes/schemas/onboarding_schemas.py`): Pydantic models for validation
4. **Database**: SQL schema defined in migration file

## API Endpoints

### Base URL
```
/api/v1/users/{user_id}/onboarding
```

### 1. GET - Retrieve Onboarding Data

**Endpoint**: `GET /api/v1/users/{user_id}/onboarding`

**Purpose**: Get existing onboarding data for a user

**Parameters**:
- `user_id` (path): User identifier (string)

**Response** (200 OK):
```json
{
  "user_id": "user_123",
  "work_preference": "remote",
  "adhd_support_level": 7,
  "adhd_challenges": ["time_blindness", "focus"],
  "daily_schedule": {
    "time_preference": "morning",
    "flexible_enabled": false,
    "week_grid": {
      "monday": "8-17",
      "tuesday": "8-17"
    }
  },
  "productivity_goals": ["reduce_overwhelm", "increase_focus"],
  "chatgpt_export_prompt": null,
  "chatgpt_exported_at": null,
  "onboarding_completed": true,
  "onboarding_skipped": false,
  "completed_at": "2025-11-10T10:05:00Z",
  "skipped_at": null,
  "created_at": "2025-11-10T10:00:00Z",
  "updated_at": "2025-11-10T10:05:00Z"
}
```

**Response** (404 Not Found):
```json
{
  "detail": "Onboarding data not found for user: user_123"
}
```

**Implementation**:
```python
@router.get("/{user_id}/onboarding", response_model=OnboardingResponse)
async def get_user_onboarding(user_id: str) -> OnboardingResponse:
    onboarding = await _onboarding_service.get_onboarding(user_id)

    if onboarding is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Onboarding data not found for user: {user_id}",
        )

    return onboarding
```

### 2. PUT - Create or Update Onboarding Data

**Endpoint**: `PUT /api/v1/users/{user_id}/onboarding`

**Purpose**: Upsert (create or update) onboarding data

**Parameters**:
- `user_id` (path): User identifier (string)

**Request Body** (all fields optional for updates):
```json
{
  "work_preference": "remote",
  "adhd_support_level": 7,
  "adhd_challenges": ["time_blindness", "task_initiation", "focus"],
  "daily_schedule": {
    "time_preference": "morning",
    "flexible_enabled": false,
    "week_grid": {
      "monday": "8-12,14-18",
      "tuesday": "8-12,14-18",
      "wednesday": "flexible",
      "thursday": "8-12,14-18",
      "friday": "8-13",
      "saturday": "off",
      "sunday": "off"
    }
  },
  "productivity_goals": ["reduce_overwhelm", "increase_focus", "build_habits"],
  "chatgpt_export_prompt": "You are helping someone with...",
  "onboarding_completed": true,
  "onboarding_skipped": false
}
```

**Response** (200 OK):
Returns the complete `OnboardingResponse` object (same as GET)

**Response** (400 Bad Request):
```json
{
  "detail": "Invalid ADHD support level"
}
```

**Implementation**:
```python
@router.put("/{user_id}/onboarding", response_model=OnboardingResponse)
async def update_user_onboarding(
    user_id: str,
    data: OnboardingUpdateRequest
) -> OnboardingResponse:
    try:
        onboarding = await _onboarding_service.upsert_onboarding(user_id, data)
        return onboarding
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) from e
```

### 3. POST - Mark Onboarding Complete/Skipped

**Endpoint**: `POST /api/v1/users/{user_id}/onboarding/complete`

**Purpose**: Mark onboarding as completed or skipped

**Parameters**:
- `user_id` (path): User identifier (string)

**Request Body**:
```json
{
  "completed": true  // true = completed, false = skipped
}
```

**Response** (200 OK):
Returns the complete `OnboardingResponse` object with updated status

**Implementation**:
```python
@router.post("/{user_id}/onboarding/complete", response_model=OnboardingResponse)
async def complete_user_onboarding(
    user_id: str,
    data: OnboardingCompletionRequest
) -> OnboardingResponse:
    try:
        onboarding = await _onboarding_service.mark_completed(
            user_id,
            data.completed
        )
        return onboarding
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) from e
```

### 4. DELETE - Remove Onboarding Data

**Endpoint**: `DELETE /api/v1/users/{user_id}/onboarding`

**Purpose**: Permanently delete all onboarding data for a user

**Parameters**:
- `user_id` (path): User identifier (string)

**Response** (204 No Content):
Empty body (successful deletion)

**Response** (404 Not Found):
```json
{
  "detail": "Onboarding data not found for user: user_123"
}
```

**Implementation**:
```python
@router.delete("/{user_id}/onboarding", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_onboarding(user_id: str) -> None:
    deleted = await _onboarding_service.delete_onboarding(user_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Onboarding data not found for user: {user_id}",
        )
```

## Service Layer

### OnboardingService Class

**File**: `src/services/onboarding_service.py`

**Purpose**: Handles all onboarding business logic and database operations

#### Constructor

```python
class OnboardingService:
    def __init__(self, db_path: str = "./proxy_agents_enhanced.db"):
        self.db_path = db_path
        self._ensure_table_exists()
```

**Features**:
- Automatic table creation if not exists
- Configurable database path (useful for testing)

#### Methods

##### get_onboarding()

```python
async def get_onboarding(self, user_id: str) -> OnboardingResponse | None:
    """
    Get onboarding data for a user

    Returns:
        OnboardingResponse if exists, None otherwise
    """
```

**Logic**:
1. Query database for user_id
2. If not found, return None
3. Parse JSON fields (challenges, goals, schedule)
4. Convert to Pydantic model
5. Return OnboardingResponse

**JSON Parsing**:
```python
# Parse adhd_challenges from JSON string to list
adhd_challenges = (
    [ADHDChallenge(c) for c in json.loads(row["adhd_challenges"])]
    if row["adhd_challenges"]
    else []
)

# Parse daily_schedule from JSON to Pydantic model
if row["daily_schedule"]:
    schedule_data = json.loads(row["daily_schedule"])
    daily_schedule = DailySchedule(
        time_preference=TimePreference(schedule_data["time_preference"]),
        flexible_enabled=schedule_data.get("flexible_enabled", False),
        week_grid=schedule_data.get("week_grid", {}),
    )
```

##### upsert_onboarding()

```python
async def upsert_onboarding(
    self,
    user_id: str,
    data: OnboardingUpdateRequest
) -> OnboardingResponse:
    """
    Create or update onboarding data for a user
    Supports partial updates
    """
```

**Logic**:
1. Get current timestamp (UTC)
2. Serialize JSON fields (challenges, goals, schedule)
3. Check if record exists
4. If exists: Build dynamic UPDATE query
5. If not exists: INSERT new record
6. Commit transaction
7. Fetch and return updated data

**Upsert Pattern**:
```python
# Check if record exists
cursor.execute("SELECT user_id FROM user_onboarding WHERE user_id = ?", (user_id,))
exists = cursor.fetchone() is not None

if exists:
    # Build dynamic UPDATE query
    update_fields: list[str] = []
    update_values: list[Any] = []

    if data.work_preference is not None:
        update_fields.append("work_preference = ?")
        update_values.append(data.work_preference.value)

    # ... other fields ...

    update_fields.append("updated_at = ?")
    update_values.append(now)
    update_values.append(user_id)

    sql = f"UPDATE user_onboarding SET {', '.join(update_fields)} WHERE user_id = ?"
    cursor.execute(sql, update_values)
else:
    # INSERT new record
    cursor.execute("""
        INSERT INTO user_onboarding (...)
        VALUES (?, ?, ?, ...)
    """, values)
```

**Enum Handling**:
```python
# Convert Pydantic enums to strings for database
work_pref_val = (
    data.work_preference
    if isinstance(data.work_preference, str)
    else data.work_preference.value
)
```

##### mark_completed()

```python
async def mark_completed(
    self,
    user_id: str,
    completed: bool = True
) -> OnboardingResponse:
    """
    Mark onboarding as completed or skipped

    Args:
        completed: True = completed, False = skipped
    """
```

**Logic**:
1. Create OnboardingUpdateRequest with completion flags
2. Call upsert_onboarding() with flags
3. Return updated data

**Internal Implementation**:
```python
update_data = OnboardingUpdateRequest(
    onboarding_completed=completed,
    onboarding_skipped=not completed,
)
return await self.upsert_onboarding(user_id, update_data)
```

##### delete_onboarding()

```python
async def delete_onboarding(self, user_id: str) -> bool:
    """
    Delete onboarding data for a user

    Returns:
        True if deleted, False if not found
    """
```

**Logic**:
1. Execute DELETE query
2. Check rowcount to verify deletion
3. Return True/False

## Database Schema

### Table: user_onboarding

**Migration File**: `src/database/migrations/024_create_user_onboarding.sql`

**Schema**:
```sql
CREATE TABLE IF NOT EXISTS user_onboarding (
    user_id TEXT PRIMARY KEY NOT NULL,

    -- Phase 2: Work Preferences
    work_preference TEXT CHECK(
        work_preference IN ('remote', 'hybrid', 'office', 'flexible')
    ),

    -- Phase 3: ADHD Support
    adhd_support_level INTEGER CHECK(adhd_support_level BETWEEN 1 AND 10),
    adhd_challenges TEXT,  -- JSON: Array of selected challenges

    -- Phase 4: Daily Schedule
    daily_schedule TEXT,  -- JSON: {timePreference, weekGrid, flexibleEnabled}
    time_preference TEXT,  -- morning/afternoon/evening/night/flexible/varied

    -- Phase 5: Productivity Goals
    productivity_goals TEXT,  -- JSON: Array of selected goal types

    -- Phase 6: ChatGPT Export
    chatgpt_export_prompt TEXT,  -- Generated personalized prompt
    chatgpt_exported_at TIMESTAMP,  -- When user exported prompt

    -- Onboarding completion tracking
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_skipped BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    skipped_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
```sql
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed
    ON user_onboarding(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_work_preference
    ON user_onboarding(work_preference);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_adhd_level
    ON user_onboarding(adhd_support_level);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_created
    ON user_onboarding(created_at DESC);
```

**Design Decisions**:
- `user_id` as TEXT (supports various ID formats)
- JSON fields as TEXT (SQLite doesn't have native JSON type)
- CHECK constraints for validation at DB level
- Separate `completed_at` and `skipped_at` timestamps
- Indexes on commonly queried fields

## Pydantic Schemas

**File**: `src/api/routes/schemas/onboarding_schemas.py`

See `03_DATA_MODELS.md` for complete schema definitions.

### Key Features

1. **Enums for Type Safety**:
```python
class WorkPreference(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    OFFICE = "office"
    FLEXIBLE = "flexible"
```

2. **Validation Rules**:
```python
adhd_support_level: int | None = Field(
    None,
    ge=1,  # Greater than or equal to 1
    le=10,  # Less than or equal to 10
    description="ADHD support level (1-10)"
)
```

3. **use_enum_values=True**:
```python
model_config = ConfigDict(use_enum_values=True)
```
This automatically converts enums to string values in JSON responses.

4. **from_attributes=True**:
```python
model_config = ConfigDict(from_attributes=True)
```
Enables ORM-like attribute access (useful for SQLite row objects).

## Error Handling

### Common Errors

1. **404 Not Found**: User has no onboarding data
2. **400 Bad Request**: Invalid input data (Pydantic validation)
3. **500 Internal Server Error**: Database errors (rare)

### Error Response Format

```json
{
  "detail": "Error message here"
}
```

### Service Layer Error Handling

```python
try:
    onboarding = await _onboarding_service.upsert_onboarding(user_id, data)
    return onboarding
except ValueError as e:
    # Business logic errors
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(e)
    ) from e
```

## Testing

### Manual API Testing

**Using curl**:

```bash
# Get onboarding data
curl -X GET http://localhost:8000/api/v1/users/test_user/onboarding

# Create/Update onboarding
curl -X PUT http://localhost:8000/api/v1/users/test_user/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "work_preference": "remote",
    "adhd_support_level": 7,
    "adhd_challenges": ["time_blindness", "focus"]
  }'

# Mark complete
curl -X POST http://localhost:8000/api/v1/users/test_user/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete
curl -X DELETE http://localhost:8000/api/v1/users/test_user/onboarding
```

### Unit Testing

**Test File**: `src/api/routes/tests/test_onboarding.py`

**Run Tests**:
```bash
# Using UV
uv run pytest src/api/routes/tests/test_onboarding.py -v

# With coverage
uv run pytest src/api/routes/tests/test_onboarding.py --cov=src/services/onboarding_service
```

**Example Test**:
```python
import pytest
from src.services.onboarding_service import OnboardingService
from src.api.routes.schemas.onboarding_schemas import OnboardingUpdateRequest

@pytest.mark.asyncio
async def test_upsert_creates_new_record():
    service = OnboardingService(db_path=":memory:")  # In-memory DB

    data = OnboardingUpdateRequest(
        work_preference="remote",
        adhd_support_level=7,
    )

    result = await service.upsert_onboarding("test_user", data)

    assert result.user_id == "test_user"
    assert result.work_preference == "remote"
    assert result.adhd_support_level == 7
```

## Database Migrations

### Running Migrations

**Manual Execution**:
```bash
sqlite3 proxy_agents_enhanced.db < src/database/migrations/024_create_user_onboarding.sql
```

**Automatic** (on service initialization):
```python
def _ensure_table_exists(self) -> None:
    """Ensure user_onboarding table exists"""
    with sqlite3.connect(self.db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='user_onboarding'
        """)
        if not cursor.fetchone():
            # Run migration
            with open("src/database/migrations/024_create_user_onboarding.sql") as f:
                migration_sql = f.read()
                cursor.executescript(migration_sql)
        conn.commit()
```

### Rollback

**No explicit rollback mechanism** - manually drop table:
```sql
DROP TABLE user_onboarding;
```

## Performance Considerations

### Database Queries

- **Single query pattern**: Each operation uses 1-2 queries max
- **Indexed fields**: Common queries use indexes
- **JSON parsing overhead**: Minimal (happens in Python)

### Optimization Tips

1. **Connection Pooling**: Currently uses new connection per request (fine for SQLite)
2. **Bulk Operations**: Not needed (one user at a time)
3. **Caching**: Consider Redis for frequently accessed onboarding data

## Security Considerations

### Input Validation

- Pydantic validates all inputs
- Database CHECK constraints as secondary validation
- SQL injection prevented by parameterized queries

### Authorization

**Currently missing**: No authentication/authorization checks

**Recommended**:
```python
from fastapi import Depends
from src.api.dependencies import get_current_user

@router.get("/{user_id}/onboarding")
async def get_user_onboarding(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    # Verify current_user.id == user_id
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    # ... rest of handler
```

### Data Privacy

- No PII collected (all preference data)
- User can delete their data (DELETE endpoint)
- Data not shared externally

## Deployment

### Environment Variables

```bash
DATABASE_PATH=/app/data/proxy_agents_enhanced.db
```

### Docker

```dockerfile
COPY src/database/migrations/024_create_user_onboarding.sql /app/migrations/
RUN chmod +x /app/migrations/*.sql
```

### Health Check

```python
@router.get("/health")
async def health_check():
    # Test database connection
    try:
        service = OnboardingService()
        # Simple query
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

## Next Steps

- See `01_FRONTEND.md` for frontend integration
- See `03_DATA_MODELS.md` for complete data structures
- See `04_QUICK_START.md` for setup guide
