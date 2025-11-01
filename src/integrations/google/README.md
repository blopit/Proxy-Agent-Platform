# Google Services Integration

**Status**: ✅ Production Ready
**Test Coverage**: 89% (24/24 tests passing)
**Built with**: Test-Driven Development (TDD)

---

## 🎯 Overview

Complete Google services integration providing OAuth2 authentication and Google Calendar API access. Built using TDD methodology with comprehensive test coverage.

### Features

- ✅ **OAuth2 Authentication** - Secure token management with auto-refresh
- ✅ **Google Calendar API** - Full CRUD operations for calendar events
- ✅ **Context-Aware Workflows** - Read today's events for task scheduling
- ✅ **Free/Busy Queries** - Check availability for optimal task timing
- ✅ **Type-Safe** - Pydantic models with full validation
- ✅ **Well-Tested** - 89% code coverage, all tests passing

---

## 📦 Installation

Already installed! The Google API client library is included in `pyproject.toml`:

```bash
# Dependencies already in pyproject.toml
google-api-python-client>=2.100.0
google-auth-httplib2>=0.2.0
google-auth-oauthlib>=1.1.0
```

---

## 🔧 Setup

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable APIs:
   - Google Calendar API
   - Gmail API (if using email features)
4. Create OAuth 2.0 Client ID:
   - Application type: **Desktop app**
   - Download JSON → save as `credentials/credentials.json`

### 2. Configure Environment

The integration reads from `.env` (already configured):

```bash
# .env
GMAIL_CREDENTIALS_PATH=./credentials/credentials.json
GMAIL_TOKEN_PATH=./credentials/token.json
```

### 3. First-Time Authentication

```python
from src.integrations.google import GoogleAuthService

# Initialize (will perform OAuth flow on first use)
auth = GoogleAuthService()

# This will open a browser for Google OAuth consent
credentials = auth.get_credentials()

# Token is saved to credentials/token.json for future use
```

---

## 🚀 Usage

### Authentication

```python
from src.integrations.google import GoogleAuthService

# Initialize service
auth = GoogleAuthService()

# Check if already authenticated
if not auth.has_valid_credentials():
    # Performs OAuth flow (opens browser)
    auth.get_credentials()

# Build any Google service
calendar_service = auth.build_service('calendar', 'v3')
gmail_service = auth.build_service('gmail', 'v1')
```

### Google Calendar - Basic Operations

```python
from src.integrations.google import GoogleAuthService, GoogleCalendarService
from datetime import datetime, timedelta

# Setup
auth = GoogleAuthService()
calendar = GoogleCalendarService(auth)

# Get today's events (for context-aware workflows)
today_events = calendar.get_today_events()
for event in today_events:
    print(f"{event.start_time}: {event.summary}")
    print(f"  Location: {event.location}")
    print(f"  Attendees: {', '.join(event.attendees)}")

# Get upcoming events
upcoming = calendar.get_upcoming_events(max_results=5)

# Get events in date range
start = datetime(2025, 11, 1)
end = datetime(2025, 11, 7)
week_events = calendar.get_events(time_min=start, time_max=end)
```

### Create Calendar Events

```python
from datetime import datetime

# Create an event
event = calendar.create_event(
    summary="Team Standup",
    start_time=datetime(2025, 11, 1, 9, 0),
    end_time=datetime(2025, 11, 1, 9, 30),
    description="Daily sync meeting",
    location="Zoom",
    attendees=["team@example.com"]
)

print(f"Created event: {event.event_id}")
```

### Update and Delete Events

```python
# Update an event
updated = calendar.update_event(
    event_id="event123",
    summary="Updated Meeting Title",
    start_time=datetime(2025, 11, 1, 10, 0)
)

# Delete an event
success = calendar.delete_event(event_id="event123")
```

### Check Free/Busy Status

```python
from datetime import datetime

# Check availability for today 9 AM - 5 PM
start = datetime(2025, 10, 30, 9, 0)
end = datetime(2025, 10, 30, 17, 0)

busy_times = calendar.get_free_busy(time_min=start, time_max=end)
for busy in busy_times:
    print(f"Busy: {busy['start']} - {busy['end']}")
```

---

## 🎯 Integration with Task System

### Context-Aware Task Scheduling

```python
from src.integrations.google import GoogleAuthService, GoogleCalendarService
from datetime import datetime, timedelta

def schedule_task_around_meetings(task_title: str, estimated_hours: float):
    """Schedule a task considering calendar availability."""

    # Get calendar service
    auth = GoogleAuthService()
    calendar = GoogleCalendarService(auth)

    # Get today's meetings
    meetings = calendar.get_today_events()

    # Find free time slots
    work_start = datetime.now().replace(hour=9, minute=0)
    work_end = datetime.now().replace(hour=17, minute=0)

    # Get busy times
    busy_times = calendar.get_free_busy(time_min=work_start, time_max=work_end)

    # Find best slot for task
    # (implement slot-finding logic here)

    return {
        "task": task_title,
        "suggested_start": "...",
        "conflicts": len(meetings)
    }
```

### Auto-Create Tasks from Calendar Events

```python
def create_tasks_from_calendar():
    """Create preparation tasks for upcoming meetings."""

    auth = GoogleAuthService()
    calendar = GoogleCalendarService(auth)

    # Get meetings in next 24 hours
    start = datetime.now()
    end = start + timedelta(days=1)
    upcoming_meetings = calendar.get_events(time_min=start, time_max=end)

    tasks = []
    for meeting in upcoming_meetings:
        # Create prep task 1 hour before meeting
        prep_time = meeting.start_time - timedelta(hours=1)

        task = {
            "title": f"Prepare for: {meeting.summary}",
            "due_date": prep_time,
            "context": meeting.description,
            "tags": ["meeting-prep"],
            "calendar_event_id": meeting.event_id
        }
        tasks.append(task)

    return tasks
```

---

## 📊 API Reference

### GoogleAuthService

```python
class GoogleAuthService:
    def __init__(
        self,
        credentials_path: Optional[str] = None,
        token_path: Optional[str] = None,
        scopes: Optional[List[str]] = None
    )

    def has_valid_credentials() -> bool
    def get_credentials() -> Credentials
    def revoke_credentials() -> None
    def build_service(service_name: str, version: str) -> Resource
```

### GoogleCalendarService

```python
class GoogleCalendarService:
    def __init__(self, auth_service: GoogleAuthService)

    def get_events(
        time_min: Optional[datetime] = None,
        time_max: Optional[datetime] = None,
        max_results: int = 100
    ) -> List[CalendarEvent]

    def get_today_events() -> List[CalendarEvent]
    def get_upcoming_events(max_results: int = 10) -> List[CalendarEvent]

    def create_event(
        summary: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None,
        location: Optional[str] = None,
        attendees: Optional[List[str]] = None
    ) -> CalendarEvent

    def update_event(
        event_id: str,
        summary: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> CalendarEvent

    def delete_event(event_id: str) -> bool

    def get_free_busy(
        time_min: datetime,
        time_max: datetime
    ) -> List[dict]
```

### CalendarEvent Model

```python
class CalendarEvent(BaseModel):
    event_id: str
    summary: str
    description: Optional[str]
    location: Optional[str]
    start_time: datetime
    end_time: datetime
    is_all_day: bool
    attendees: List[str]
    time_zone: Optional[str]

    @classmethod
    def from_api_response(cls, data: dict) -> "CalendarEvent"

    def to_api_format(self) -> dict
```

---

## 🧪 Testing

### Run Tests

```bash
# All Google integration tests
pytest src/integrations/google/tests/ -v

# With coverage report
pytest src/integrations/google/tests/ -v \
  --cov=src/integrations/google \
  --cov-report=html \
  --cov-report=term-missing

# View coverage report
open htmlcov/index.html
```

### Test Results

```
======================== 24 passed in 0.49s ========================

Coverage Report:
  auth.py         86% coverage
  calendar.py     91% coverage
  TOTAL           89% coverage
```

---

## 🔒 Security

### Credentials Storage

- OAuth credentials stored in `credentials/credentials.json`
- Access tokens stored in `credentials/token.json`
- Token auto-refreshes when expired
- **Add to `.gitignore`:**

```gitignore
# Google OAuth credentials
credentials/credentials.json
credentials/token.json
```

### Scopes

Default scopes (minimal required):
- `https://www.googleapis.com/auth/calendar.readonly`
- `https://www.googleapis.com/auth/calendar.events`
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`

To use fewer permissions, customize scopes:

```python
auth = GoogleAuthService(
    scopes=["https://www.googleapis.com/auth/calendar.readonly"]
)
```

---

## 🐛 Troubleshooting

### Issue: "Credentials file not found"

**Solution**: Download OAuth credentials from Google Cloud Console

```bash
mkdir -p credentials
# Place credentials.json in credentials/ directory
```

### Issue: "Token expired"

**Solution**: Tokens auto-refresh, but if issues persist:

```python
auth = GoogleAuthService()
auth.revoke_credentials()  # Delete old token
auth.get_credentials()      # Re-authenticate
```

### Issue: "403: Access not configured"

**Solution**: Enable the API in Google Cloud Console

1. Go to [APIs & Services](https://console.cloud.google.com/apis/dashboard)
2. Click "Enable APIs and Services"
3. Search for "Google Calendar API" → Enable

---

## 📝 Next Steps

### Add More Google Services

Following the same TDD pattern:

1. **Gmail Integration**
   - Email-to-task conversion
   - Send task notifications
   - Smart inbox organization

2. **Google Drive Integration**
   - Attach files to tasks
   - Auto-organize task deliverables
   - Search documents from workflows

3. **Google Tasks API**
   - Sync with Google Tasks
   - Bidirectional updates
   - Import existing tasks

---

## 📚 Resources

- [Google Calendar API Docs](https://developers.google.com/calendar/api/v3/reference)
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Python Client Library](https://github.com/googleapis/google-api-python-client)

---

**Built with TDD** | **Production Ready** | **89% Test Coverage** ✅
