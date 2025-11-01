"""
Google Calendar integration service.

Provides access to Google Calendar API for reading and managing calendar events.
"""

from datetime import datetime, date, timedelta
from typing import List, Optional
from pydantic import BaseModel, Field

from src.integrations.google.auth import GoogleAuthService


class CalendarEvent(BaseModel):
    """
    Model representing a Google Calendar event.

    Provides bidirectional conversion between Pydantic model and Google Calendar API format.
    """

    event_id: str
    summary: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: datetime
    is_all_day: bool = False
    attendees: List[str] = Field(default_factory=list)
    time_zone: Optional[str] = None

    @classmethod
    def from_api_response(cls, data: dict) -> "CalendarEvent":
        """
        Parse Google Calendar API response into CalendarEvent.

        Args:
            data: Raw event data from Google Calendar API

        Returns:
            CalendarEvent instance

        Example:
            >>> api_data = {
            ...     "id": "event123",
            ...     "summary": "Team Meeting",
            ...     "start": {"dateTime": "2025-10-30T14:00:00Z"},
            ...     "end": {"dateTime": "2025-10-30T15:00:00Z"}
            ... }
            >>> event = CalendarEvent.from_api_response(api_data)
        """
        # Parse start time
        start_data = data.get("start", {})
        is_all_day = "date" in start_data

        if is_all_day:
            # All-day event
            start_date = datetime.fromisoformat(start_data["date"])
            start_time = datetime.combine(start_date.date(), datetime.min.time())
        else:
            # Timed event
            start_time = datetime.fromisoformat(
                start_data.get("dateTime", "").replace("Z", "+00:00")
            )

        # Parse end time
        end_data = data.get("end", {})
        if is_all_day:
            end_date = datetime.fromisoformat(end_data["date"])
            end_time = datetime.combine(end_date.date(), datetime.max.time())
        else:
            end_time = datetime.fromisoformat(
                end_data.get("dateTime", "").replace("Z", "+00:00")
            )

        # Parse attendees
        attendees = [
            attendee.get("email", "")
            for attendee in data.get("attendees", [])
            if attendee.get("email")
        ]

        return cls(
            event_id=data.get("id", ""),
            summary=data.get("summary", ""),
            description=data.get("description"),
            location=data.get("location"),
            start_time=start_time,
            end_time=end_time,
            is_all_day=is_all_day,
            attendees=attendees,
            time_zone=start_data.get("timeZone"),
        )

    def to_api_format(self) -> dict:
        """
        Convert CalendarEvent to Google Calendar API format.

        Returns:
            Dictionary formatted for Google Calendar API

        Example:
            >>> event = CalendarEvent(
            ...     event_id="event1",
            ...     summary="Meeting",
            ...     start_time=datetime(2025, 10, 30, 14, 0),
            ...     end_time=datetime(2025, 10, 30, 15, 0)
            ... )
            >>> api_data = event.to_api_format()
        """
        result = {
            "summary": self.summary,
        }

        # Add optional fields
        if self.description:
            result["description"] = self.description
        if self.location:
            result["location"] = self.location

        # Format start/end times
        if self.is_all_day:
            result["start"] = {"date": self.start_time.date().isoformat()}
            result["end"] = {"date": self.end_time.date().isoformat()}
        else:
            result["start"] = {
                "dateTime": self.start_time.isoformat(),
                "timeZone": self.time_zone or "UTC",
            }
            result["end"] = {
                "dateTime": self.end_time.isoformat(),
                "timeZone": self.time_zone or "UTC",
            }

        # Add attendees if present
        if self.attendees:
            result["attendees"] = [{"email": email} for email in self.attendees]

        return result


class GoogleCalendarService:
    """
    Service for interacting with Google Calendar API.

    Provides methods for reading, creating, updating, and deleting calendar events.
    """

    def __init__(self, auth_service: GoogleAuthService):
        """
        Initialize Google Calendar service.

        Args:
            auth_service: Authenticated GoogleAuthService instance

        Example:
            >>> auth = GoogleAuthService()
            >>> calendar = GoogleCalendarService(auth)
        """
        self.auth_service = auth_service
        self.service = auth_service.build_service("calendar", "v3")

    def get_events(
        self,
        time_min: Optional[datetime] = None,
        time_max: Optional[datetime] = None,
        max_results: int = 100,
        calendar_id: str = "primary",
    ) -> List[CalendarEvent]:
        """
        Retrieve calendar events within a date range.

        Args:
            time_min: Start of time range (default: now)
            time_max: End of time range (default: 1 year from now)
            max_results: Maximum number of events to return
            calendar_id: Calendar to query (default: 'primary')

        Returns:
            List of CalendarEvent objects

        Example:
            >>> calendar = GoogleCalendarService(auth)
            >>> start = datetime(2025, 10, 30)
            >>> end = datetime(2025, 10, 31)
            >>> events = calendar.get_events(time_min=start, time_max=end)
        """
        # Set defaults
        if time_min is None:
            time_min = datetime.now()
        if time_max is None:
            time_max = time_min + timedelta(days=365)

        # Format times for API
        time_min_str = time_min.isoformat() + "Z"
        time_max_str = time_max.isoformat() + "Z"

        # Call API
        events_result = (
            self.service.events()
            .list(
                calendarId=calendar_id,
                timeMin=time_min_str,
                timeMax=time_max_str,
                maxResults=max_results,
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )

        # Parse events
        items = events_result.get("items", [])
        return [CalendarEvent.from_api_response(item) for item in items]

    def get_today_events(self, calendar_id: str = "primary") -> List[CalendarEvent]:
        """
        Get all events for today.

        Args:
            calendar_id: Calendar to query (default: 'primary')

        Returns:
            List of today's CalendarEvent objects

        Example:
            >>> calendar = GoogleCalendarService(auth)
            >>> today_events = calendar.get_today_events()
            >>> for event in today_events:
            ...     print(f"{event.start_time}: {event.summary}")
        """
        now = datetime.now()
        start_of_day = datetime.combine(now.date(), datetime.min.time())
        end_of_day = datetime.combine(now.date(), datetime.max.time())

        return self.get_events(
            time_min=start_of_day, time_max=end_of_day, calendar_id=calendar_id
        )

    def get_upcoming_events(
        self, max_results: int = 10, calendar_id: str = "primary"
    ) -> List[CalendarEvent]:
        """
        Get upcoming events starting from now.

        Args:
            max_results: Maximum number of events to return
            calendar_id: Calendar to query (default: 'primary')

        Returns:
            List of upcoming CalendarEvent objects

        Example:
            >>> calendar = GoogleCalendarService(auth)
            >>> upcoming = calendar.get_upcoming_events(max_results=5)
        """
        return self.get_events(max_results=max_results, calendar_id=calendar_id)

    def create_event(
        self,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None,
        location: Optional[str] = None,
        attendees: Optional[List[str]] = None,
        calendar_id: str = "primary",
    ) -> CalendarEvent:
        """
        Create a new calendar event.

        Args:
            summary: Event title
            start_time: Event start time
            end_time: Event end time
            description: Event description (optional)
            location: Event location (optional)
            attendees: List of attendee emails (optional)
            calendar_id: Calendar to create event in (default: 'primary')

        Returns:
            Created CalendarEvent

        Example:
            >>> calendar = GoogleCalendarService(auth)
            >>> event = calendar.create_event(
            ...     summary="Team Meeting",
            ...     start_time=datetime(2025, 10, 30, 14, 0),
            ...     end_time=datetime(2025, 10, 30, 15, 0),
            ...     description="Weekly sync"
            ... )
        """
        # Build event object
        event = CalendarEvent(
            event_id="",  # Will be assigned by API
            summary=summary,
            start_time=start_time,
            end_time=end_time,
            description=description,
            location=location,
            attendees=attendees or [],
        )

        # Convert to API format
        event_body = event.to_api_format()

        # Create event
        created_event = (
            self.service.events()
            .insert(calendarId=calendar_id, body=event_body)
            .execute()
        )

        return CalendarEvent.from_api_response(created_event)

    def update_event(
        self,
        event_id: str,
        summary: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        description: Optional[str] = None,
        location: Optional[str] = None,
        calendar_id: str = "primary",
    ) -> CalendarEvent:
        """
        Update an existing calendar event.

        Args:
            event_id: ID of event to update
            summary: New event title (optional)
            start_time: New start time (optional)
            end_time: New end time (optional)
            description: New description (optional)
            location: New location (optional)
            calendar_id: Calendar containing the event (default: 'primary')

        Returns:
            Updated CalendarEvent

        Example:
            >>> calendar = GoogleCalendarService(auth)
            >>> updated = calendar.update_event(
            ...     event_id="event123",
            ...     summary="Updated Meeting Title"
            ... )
        """
        # Get existing event
        existing_event = (
            self.service.events().get(calendarId=calendar_id, eventId=event_id).execute()
        )

        # Update fields
        if summary is not None:
            existing_event["summary"] = summary
        if description is not None:
            existing_event["description"] = description
        if location is not None:
            existing_event["location"] = location
        if start_time is not None:
            existing_event["start"] = {
                "dateTime": start_time.isoformat(),
                "timeZone": "UTC",
            }
        if end_time is not None:
            existing_event["end"] = {
                "dateTime": end_time.isoformat(),
                "timeZone": "UTC",
            }

        # Update event
        updated_event = (
            self.service.events()
            .update(calendarId=calendar_id, eventId=event_id, body=existing_event)
            .execute()
        )

        return CalendarEvent.from_api_response(updated_event)

    def delete_event(self, event_id: str, calendar_id: str = "primary") -> bool:
        """
        Delete a calendar event.

        Args:
            event_id: ID of event to delete
            calendar_id: Calendar containing the event (default: 'primary')

        Returns:
            True if deletion successful

        Example:
            >>> calendar = GoogleCalendarService(auth)
            >>> success = calendar.delete_event("event123")
        """
        try:
            self.service.events().delete(
                calendarId=calendar_id, eventId=event_id
            ).execute()
            return True
        except Exception:
            return False

    def get_free_busy(
        self,
        time_min: datetime,
        time_max: datetime,
        calendar_ids: Optional[List[str]] = None,
    ) -> List[dict]:
        """
        Get free/busy information for calendars.

        Args:
            time_min: Start of time range
            time_max: End of time range
            calendar_ids: List of calendar IDs to query (default: ['primary'])

        Returns:
            List of busy time periods

        Example:
            >>> calendar = GoogleCalendarService(auth)
            >>> start = datetime(2025, 10, 30, 9, 0)
            >>> end = datetime(2025, 10, 30, 17, 0)
            >>> busy_times = calendar.get_free_busy(start, end)
        """
        if calendar_ids is None:
            calendar_ids = ["primary"]

        # Build request body
        body = {
            "timeMin": time_min.isoformat() + "Z",
            "timeMax": time_max.isoformat() + "Z",
            "items": [{"id": cal_id} for cal_id in calendar_ids],
        }

        # Query free/busy
        result = self.service.freebusy().query(body=body).execute()

        # Extract busy times
        busy_times = []
        for calendar_id in calendar_ids:
            calendar_busy = result.get("calendars", {}).get(calendar_id, {}).get("busy", [])
            busy_times.extend(calendar_busy)

        return busy_times
