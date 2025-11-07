"""
Tests for Google Calendar integration service.

Following TDD methodology: RED → GREEN → REFACTOR
"""

from datetime import datetime
from unittest.mock import Mock, patch

import pytest

from src.integrations.google.calendar import CalendarEvent, GoogleCalendarService


class TestGoogleCalendarService:
    """Test suite for GoogleCalendarService."""

    @pytest.fixture
    def mock_auth_service(self):
        """Provide a mock authentication service."""
        mock_auth = Mock()
        mock_service = Mock()
        mock_auth.build_service.return_value = mock_service
        return mock_auth

    @pytest.fixture
    def calendar_service(self, mock_auth_service):
        """Provide a GoogleCalendarService instance."""
        return GoogleCalendarService(auth_service=mock_auth_service)

    def test_initialization(self, mock_auth_service):
        """Test that calendar service initializes correctly."""
        service = GoogleCalendarService(auth_service=mock_auth_service)
        assert service.auth_service == mock_auth_service
        mock_auth_service.build_service.assert_called_once_with("calendar", "v3")

    def test_get_events_returns_list_of_calendar_events(self, calendar_service, mock_auth_service):
        """Test that get_events returns a list of CalendarEvent objects."""
        # Mock API response
        mock_events = {
            "items": [
                {
                    "id": "event1",
                    "summary": "Team Meeting",
                    "start": {"dateTime": "2025-10-30T10:00:00Z"},
                    "end": {"dateTime": "2025-10-30T11:00:00Z"},
                    "description": "Weekly sync",
                },
                {
                    "id": "event2",
                    "summary": "Lunch",
                    "start": {"date": "2025-10-30"},
                    "end": {"date": "2025-10-30"},
                },
            ]
        }

        calendar_service.service.events().list().execute.return_value = mock_events

        events = calendar_service.get_events()

        assert len(events) == 2
        assert all(isinstance(e, CalendarEvent) for e in events)
        assert events[0].summary == "Team Meeting"
        assert events[1].summary == "Lunch"

    def test_get_events_with_date_range(self, calendar_service):
        """Test that get_events respects time_min and time_max parameters."""
        mock_events = {"items": []}
        calendar_service.service.events().list().execute.return_value = mock_events

        start_date = datetime(2025, 10, 30)
        end_date = datetime(2025, 10, 31)

        events = calendar_service.get_events(time_min=start_date, time_max=end_date)

        # Verify API was called
        assert calendar_service.service.events().list.called
        assert events == []

    def test_get_today_events_returns_todays_events(self, calendar_service):
        """Test that get_today_events returns events for current day."""
        mock_events = {
            "items": [
                {
                    "id": "event1",
                    "summary": "Morning Standup",
                    "start": {"dateTime": "2025-10-30T09:00:00Z"},
                    "end": {"dateTime": "2025-10-30T09:30:00Z"},
                }
            ]
        }
        calendar_service.service.events().list().execute.return_value = mock_events

        with patch("src.integrations.google.calendar.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime(2025, 10, 30, 8, 0, 0)
            mock_datetime.combine = datetime.combine
            mock_datetime.min = datetime.min
            mock_datetime.max = datetime.max

            events = calendar_service.get_today_events()

            assert len(events) == 1
            assert events[0].summary == "Morning Standup"

    def test_get_upcoming_events_returns_future_events(self, calendar_service):
        """Test that get_upcoming_events returns future events."""
        mock_events = {
            "items": [
                {
                    "id": "event1",
                    "summary": "Next Week Meeting",
                    "start": {"dateTime": "2025-11-06T14:00:00Z"},
                    "end": {"dateTime": "2025-11-06T15:00:00Z"},
                }
            ]
        }
        calendar_service.service.events().list().execute.return_value = mock_events

        events = calendar_service.get_upcoming_events(max_results=10)

        assert len(events) == 1
        assert calendar_service.service.events().list.called

    def test_create_event_creates_calendar_event(self, calendar_service):
        """Test that create_event creates a new calendar event."""
        mock_created_event = {
            "id": "new_event",
            "summary": "New Task",
            "start": {"dateTime": "2025-10-30T15:00:00Z"},
            "end": {"dateTime": "2025-10-30T16:00:00Z"},
        }
        calendar_service.service.events().insert().execute.return_value = mock_created_event

        start_time = datetime(2025, 10, 30, 15, 0, 0)
        end_time = datetime(2025, 10, 30, 16, 0, 0)

        event = calendar_service.create_event(
            summary="New Task",
            start_time=start_time,
            end_time=end_time,
            description="Task description",
        )

        assert event.event_id == "new_event"
        assert event.summary == "New Task"
        assert calendar_service.service.events().insert.called

    def test_update_event_updates_existing_event(self, calendar_service):
        """Test that update_event modifies an existing event."""
        # Mock get() for existing event
        mock_existing_event = {
            "id": "event1",
            "summary": "Old Meeting",
            "start": {"dateTime": "2025-10-30T10:00:00Z"},
            "end": {"dateTime": "2025-10-30T11:00:00Z"},
        }
        calendar_service.service.events().get().execute.return_value = mock_existing_event

        # Mock update() response
        mock_updated_event = {
            "id": "event1",
            "summary": "Updated Meeting",
            "start": {"dateTime": "2025-10-30T10:00:00Z"},
            "end": {"dateTime": "2025-10-30T11:00:00Z"},
        }
        calendar_service.service.events().update().execute.return_value = mock_updated_event

        event = calendar_service.update_event(event_id="event1", summary="Updated Meeting")

        assert event.summary == "Updated Meeting"
        assert calendar_service.service.events().get.called
        assert calendar_service.service.events().update.called

    def test_delete_event_removes_calendar_event(self, calendar_service):
        """Test that delete_event removes an event from calendar."""
        calendar_service.service.events().delete().execute.return_value = None

        result = calendar_service.delete_event(event_id="event1")

        assert result is True
        assert calendar_service.service.events().delete.called

    def test_get_free_busy_returns_availability(self, calendar_service):
        """Test that get_free_busy returns availability information."""
        mock_response = {
            "calendars": {
                "primary": {
                    "busy": [
                        {
                            "start": "2025-10-30T10:00:00Z",
                            "end": "2025-10-30T11:00:00Z",
                        }
                    ]
                }
            }
        }
        calendar_service.service.freebusy().query().execute.return_value = mock_response

        start_time = datetime(2025, 10, 30, 9, 0, 0)
        end_time = datetime(2025, 10, 30, 17, 0, 0)

        busy_times = calendar_service.get_free_busy(time_min=start_time, time_max=end_time)

        assert len(busy_times) == 1
        assert calendar_service.service.freebusy().query.called

    def test_calendar_event_from_api_response(self):
        """Test that CalendarEvent correctly parses API response."""
        api_response = {
            "id": "event123",
            "summary": "Test Event",
            "description": "Event description",
            "start": {"dateTime": "2025-10-30T14:00:00Z", "timeZone": "UTC"},
            "end": {"dateTime": "2025-10-30T15:00:00Z", "timeZone": "UTC"},
            "location": "Conference Room A",
            "attendees": [{"email": "user@example.com"}],
        }

        event = CalendarEvent.from_api_response(api_response)

        assert event.event_id == "event123"
        assert event.summary == "Test Event"
        assert event.description == "Event description"
        assert event.location == "Conference Room A"
        assert event.start_time is not None
        assert event.end_time is not None

    def test_calendar_event_handles_all_day_events(self):
        """Test that CalendarEvent handles all-day events correctly."""
        api_response = {
            "id": "allday1",
            "summary": "All Day Event",
            "start": {"date": "2025-10-30"},
            "end": {"date": "2025-10-30"},
        }

        event = CalendarEvent.from_api_response(api_response)

        assert event.event_id == "allday1"
        assert event.summary == "All Day Event"
        assert event.is_all_day is True

    def test_calendar_event_to_api_format(self):
        """Test that CalendarEvent converts to API format correctly."""
        event = CalendarEvent(
            event_id="event1",
            summary="Test Event",
            start_time=datetime(2025, 10, 30, 14, 0, 0),
            end_time=datetime(2025, 10, 30, 15, 0, 0),
            description="Test description",
            location="Office",
        )

        api_format = event.to_api_format()

        assert api_format["summary"] == "Test Event"
        assert "start" in api_format
        assert "end" in api_format
        assert api_format["description"] == "Test description"
        assert api_format["location"] == "Office"
