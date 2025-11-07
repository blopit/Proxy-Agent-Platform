"""
Google services integration.

Provides authentication and access to Google Calendar, Gmail, and other services.
"""

from src.integrations.google.auth import GoogleAuthService
from src.integrations.google.calendar import CalendarEvent, GoogleCalendarService

__all__ = ["GoogleAuthService", "GoogleCalendarService", "CalendarEvent"]
