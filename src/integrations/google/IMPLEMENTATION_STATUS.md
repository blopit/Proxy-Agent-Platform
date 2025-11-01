# Google Integration - TDD Implementation Status

**Created**: 2025-10-30
**Status**: 🟡 In Progress (Phase 1 Complete, Phase 2 Ready)

---

## ✅ **Completed: GoogleAuthService**

### **Test Coverage** (12/12 passing ✅)
- `test_initialization_with_default_paths` ✅
- `test_initialization_with_custom_paths` ✅
- `test_has_valid_credentials_returns_false_without_token` ✅
- `test_has_valid_credentials_returns_true_with_valid_token` ✅
- `test_has_valid_credentials_returns_false_with_expired_token` ✅
- `test_get_credentials_raises_error_without_credentials_file` ✅
- `test_get_credentials_performs_oauth_flow_for_new_user` ✅
- `test_get_credentials_refreshes_expired_token` ✅
- `test_get_credentials_returns_valid_token` ✅
- `test_revoke_credentials_removes_token_file` ✅
- `test_revoke_credentials_handles_missing_token_gracefully` ✅
- `test_build_service_returns_google_service` ✅

### **Implementation**: `src/integrations/google/auth.py`
- OAuth2 flow handling
- Token refresh logic
- Credential storage/retrieval
- Service builder for Google APIs

### **Key Features**:
- ✅ Default scopes for Calendar + Gmail
- ✅ Environment variable configuration
- ✅ Token persistence with auto-refresh
- ✅ Graceful error handling
- ✅ Multiple Google API service support

---

## 🔴 **Next: GoogleCalendarService (RED Phase Complete)**

### **Test Coverage** (17 tests written, 0/17 passing - module not implemented)
- `test_initialization` 🔴
- `test_get_events_returns_list_of_calendar_events` 🔴
- `test_get_events_with_date_range` 🔴
- `test_get_today_events_returns_todays_events` 🔴
- `test_get_upcoming_events_returns_future_events` 🔴
- `test_create_event_creates_calendar_event` 🔴
- `test_update_event_updates_existing_event` 🔴
- `test_delete_event_removes_calendar_event` 🔴
- `test_get_free_busy_returns_availability` 🔴
- `test_calendar_event_from_api_response` 🔴
- `test_calendar_event_handles_all_day_events` 🔴
- `test_calendar_event_to_api_format` 🔴

### **Tests File**: `src/integrations/google/tests/test_calendar.py` ✅
### **Implementation File**: `src/integrations/google/calendar.py` ❌ (NOT CREATED YET)

---

## 📝 **Next Steps to Complete**

### **1. Implement GoogleCalendarService** (2-3 hours)

Create `src/integrations/google/calendar.py` with:

```python
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class CalendarEvent(BaseModel):
    """Pydantic model for Google Calendar events."""
    event_id: str
    summary: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_all_day: bool = False
    attendees: List[str] = []

    @classmethod
    def from_api_response(cls, data: dict) -> "CalendarEvent":
        """Parse Google Calendar API response."""
        pass

    def to_api_format(self) -> dict:
        """Convert to Google Calendar API format."""
        pass


class GoogleCalendarService:
    """Service for interacting with Google Calendar API."""

    def __init__(self, auth_service: GoogleAuthService):
        """Initialize with auth service."""
        self.auth_service = auth_service
        self.service = auth_service.build_service("calendar", "v3")

    def get_events(
        self,
        time_min: Optional[datetime] = None,
        time_max: Optional[datetime] = None,
        max_results: int = 100
    ) -> List[CalendarEvent]:
        """Retrieve calendar events within date range."""
        pass

    def get_today_events(self) -> List[CalendarEvent]:
        """Get events for today."""
        pass

    def get_upcoming_events(self, max_results: int = 10) -> List[CalendarEvent]:
        """Get upcoming events."""
        pass

    def create_event(
        self,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None,
        location: Optional[str] = None
    ) -> CalendarEvent:
        """Create a new calendar event."""
        pass

    def update_event(
        self,
        event_id: str,
        summary: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> CalendarEvent:
        """Update an existing event."""
        pass

    def delete_event(self, event_id: str) -> bool:
        """Delete a calendar event."""
        pass

    def get_free_busy(
        self,
        time_min: datetime,
        time_max: datetime
    ) -> List[dict]:
        """Get free/busy information."""
        pass
```

### **2. Run Tests** (GREEN Phase)

```bash
source .venv/bin/activate
pytest src/integrations/google/tests/test_calendar.py -v
```

**Goal**: All 17 tests passing ✅

### **3. Refactor** (REFACTOR Phase)

- Extract common patterns
- Add docstrings
- Optimize API calls
- Add caching if needed

### **4. Integration**

Update `src/integrations/google/__init__.py`:
```python
from src.integrations.google.auth import GoogleAuthService
from src.integrations.google.calendar import GoogleCalendarService, CalendarEvent

__all__ = ["GoogleAuthService", "GoogleCalendarService", "CalendarEvent"]
```

### **5. Run Full Test Suite**

```bash
pytest src/integrations/google/tests/ -v --cov=src/integrations/google --cov-report=term-missing
```

**Target**: 95%+ coverage

---

## 🎯 **Usage Example (Once Complete)**

```python
from src.integrations.google import GoogleAuthService, GoogleCalendarService

# Authenticate
auth = GoogleAuthService()
if not auth.has_valid_credentials():
    auth.get_credentials()  # Performs OAuth flow

# Use Calendar API
calendar = GoogleCalendarService(auth)

# Get today's events for context-aware workflows
today_events = calendar.get_today_events()
for event in today_events:
    print(f"{event.start_time}: {event.summary}")

# Create task from calendar event
meeting = today_events[0]
task = create_task(
    title=f"Prepare for {meeting.summary}",
    due_date=meeting.start_time - timedelta(hours=1),
    context=meeting.description
)
```

---

## 🐛 **Database Fixes Applied**

Fixed SQLAlchemy `metadata` column naming conflicts:
- `UserIntegration.metadata` → `integration_metadata`
- `IntegrationTask.metadata` → `item_metadata`
- `IntegrationSyncLog.metadata` → `log_metadata`

All using `Column("metadata", Text)` to preserve DB column name while avoiding Python conflicts.

---

## 📊 **Test Execution Commands**

```bash
# Auth tests only
pytest src/integrations/google/tests/test_auth.py -v

# Calendar tests only (after implementation)
pytest src/integrations/google/tests/test_calendar.py -v

# All integration tests
pytest src/integrations/google/tests/ -v

# With coverage
pytest src/integrations/google/tests/ -v \
  --cov=src/integrations/google \
  --cov-report=html \
  --cov-report=term-missing

# Open coverage report
open htmlcov/index.html
```

---

## 🚀 **Next Integration: Notion**

After completing Google Calendar:
1. Install: `uv add notion-client`
2. Add env vars: `NOTION_API_KEY`, `NOTION_DATABASE_ID`
3. Follow same TDD approach:
   - Write tests (RED)
   - Implement (GREEN)
   - Refactor

---

**Status**: Ready for next developer to implement `GoogleCalendarService` following the test suite! 🎯
