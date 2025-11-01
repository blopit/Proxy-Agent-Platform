"""
Google OAuth provider implementation

Supports Gmail, Google Calendar, and Google Drive integrations.
"""

import base64
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlencode

import httpx
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from src.integrations.models import (
    CalendarEvent,
    GmailMessage,
    ProviderType,
    UserIntegration,
)
from src.integrations.oauth_provider import OAuthProvider, register_provider

logger = logging.getLogger(__name__)


# ============================================================================
# Gmail Provider
# ============================================================================


class GmailProvider(OAuthProvider):
    """OAuth provider for Gmail integration"""

    # Gmail API scopes
    DEFAULT_SCOPES = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/userinfo.email",
    ]

    # OAuth URLs
    AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        redirect_uri: str,
        scopes: Optional[list[str]] = None,
    ):
        super().__init__(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scopes=scopes or self.DEFAULT_SCOPES,
        )

    @property
    def provider_type(self) -> ProviderType:
        return "gmail"

    @property
    def provider_name(self) -> str:
        return "Gmail"

    def get_authorization_url(self, state: str) -> str:
        """Generate Gmail OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": self.get_scope_string(),
            "state": state,
            "access_type": "offline",  # Request refresh token
            "prompt": "consent",  # Force consent screen to ensure refresh token
        }
        return f"{self.AUTHORIZATION_URL}?{urlencode(params)}"

    async def exchange_code_for_tokens(
        self, code: str
    ) -> tuple[str, str, datetime, list[str]]:
        """Exchange authorization code for tokens"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            response.raise_for_status()
            data = response.json()

            access_token = data["access_token"]
            refresh_token = data.get("refresh_token", "")
            expires_in = data.get("expires_in", 3600)
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
            granted_scopes = data.get("scope", "").split()

            return access_token, refresh_token, expires_at, granted_scopes

    async def refresh_access_token(self, refresh_token: str) -> tuple[str, datetime]:
        """Refresh an expired access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.TOKEN_URL,
                data={
                    "refresh_token": refresh_token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "refresh_token",
                },
            )
            response.raise_for_status()
            data = response.json()

            access_token = data["access_token"]
            expires_in = data.get("expires_in", 3600)
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

            return access_token, expires_at

    async def get_provider_user_info(self, access_token: str) -> tuple[str, str]:
        """Get user email from Google"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            data = response.json()

            user_id = data.get("id", "")
            username = data.get("email", "")

            return user_id, username

    async def fetch_data(self, integration: UserIntegration) -> list[GmailMessage]:
        """
        Fetch unread emails from Gmail.

        Args:
            integration: User integration with decrypted tokens

        Returns:
            List of GmailMessage objects
        """
        # Ensure valid access token
        access_token = await self.ensure_valid_token(integration)

        # Build Gmail service
        credentials = Credentials(token=access_token)
        service = build("gmail", "v1", credentials=credentials)

        # Get settings from integration
        settings = integration.settings if isinstance(integration.settings, dict) else {}
        max_results = settings.get("max_results", 20)
        filter_labels = settings.get("filter_labels", ["INBOX", "UNREAD"])

        # Build query
        query_parts = []
        if "UNREAD" in filter_labels:
            query_parts.append("is:unread")
        if "IMPORTANT" in filter_labels:
            query_parts.append("is:important")

        query = " ".join(query_parts) if query_parts else "is:unread"

        # Fetch messages
        messages = []
        try:
            results = (
                service.users()
                .messages()
                .list(userId="me", q=query, maxResults=max_results)
                .execute()
            )

            message_ids = [msg["id"] for msg in results.get("messages", [])]

            # Fetch full message details
            for msg_id in message_ids:
                msg = (
                    service.users().messages().get(userId="me", id=msg_id).execute()
                )

                # Parse headers
                headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
                subject = headers.get("Subject", "")
                from_email = headers.get("From", "")
                to_email = headers.get("To", "")
                date_str = headers.get("Date", "")

                # Extract snippet and body
                snippet = msg.get("snippet", "")
                body_text = self._extract_body(msg["payload"])

                # Parse date
                try:
                    # Gmail dates are in RFC 2822 format
                    from email.utils import parsedate_to_datetime

                    received_at = parsedate_to_datetime(date_str)
                except Exception:
                    received_at = datetime.now(timezone.utc)

                # Extract labels
                labels = msg.get("labelIds", [])

                # Create GmailMessage
                gmail_msg = GmailMessage(
                    message_id=msg_id,
                    thread_id=msg.get("threadId", ""),
                    subject=subject,
                    from_email=from_email,
                    from_name=self._extract_name(from_email),
                    to_email=to_email,
                    snippet=snippet,
                    body_text=body_text,
                    received_at=received_at,
                    labels=labels,
                    is_unread="UNREAD" in labels,
                )

                messages.append(gmail_msg)

        except Exception as e:
            logger.error(f"Failed to fetch Gmail messages: {e}")
            raise

        return messages

    async def mark_item_processed(
        self, integration: UserIntegration, item_id: str, action: str
    ) -> bool:
        """
        Mark Gmail message as processed.

        Args:
            integration: User integration with decrypted tokens
            item_id: Gmail message ID
            action: 'mark_read' or 'archive'

        Returns:
            True if successful
        """
        try:
            # Ensure valid access token
            access_token = await self.ensure_valid_token(integration)

            # Build Gmail service
            credentials = Credentials(token=access_token)
            service = build("gmail", "v1", credentials=credentials)

            if action == "mark_read":
                # Remove UNREAD label
                service.users().messages().modify(
                    userId="me", id=item_id, body={"removeLabelIds": ["UNREAD"]}
                ).execute()
                return True

            elif action == "archive":
                # Remove INBOX label
                service.users().messages().modify(
                    userId="me", id=item_id, body={"removeLabelIds": ["INBOX"]}
                ).execute()
                return True

            else:
                logger.warning(f"Unknown action for Gmail: {action}")
                return False

        except Exception as e:
            logger.error(f"Failed to mark Gmail message as processed: {e}")
            return False

    # Helper methods

    def _extract_body(self, payload: dict) -> str:
        """Extract plain text body from Gmail message payload"""
        if "parts" in payload:
            for part in payload["parts"]:
                if part["mimeType"] == "text/plain":
                    data = part["body"].get("data", "")
                    if data:
                        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
        elif payload.get("mimeType") == "text/plain":
            data = payload["body"].get("data", "")
            if data:
                return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")

        return ""

    def _extract_name(self, email_field: str) -> Optional[str]:
        """Extract name from email field (e.g., 'John Doe <john@example.com>')"""
        if "<" in email_field:
            return email_field.split("<")[0].strip().strip('"')
        return None


# ============================================================================
# Google Calendar Provider
# ============================================================================


class GoogleCalendarProvider(OAuthProvider):
    """OAuth provider for Google Calendar integration"""

    DEFAULT_SCOPES = [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
    ]

    AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        redirect_uri: str,
        scopes: Optional[list[str]] = None,
    ):
        super().__init__(
            client_id=client_id,
            client_secret=client_secret,
            redirect_uri=redirect_uri,
            scopes=scopes or self.DEFAULT_SCOPES,
        )

    @property
    def provider_type(self) -> ProviderType:
        return "google_calendar"

    @property
    def provider_name(self) -> str:
        return "Google Calendar"

    def get_authorization_url(self, state: str) -> str:
        """Generate Google Calendar OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": self.get_scope_string(),
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        return f"{self.AUTHORIZATION_URL}?{urlencode(params)}"

    async def exchange_code_for_tokens(
        self, code: str
    ) -> tuple[str, str, datetime, list[str]]:
        """Exchange authorization code for tokens (same as Gmail)"""
        gmail_provider = GmailProvider(
            self.client_id, self.client_secret, self.redirect_uri, self.scopes
        )
        return await gmail_provider.exchange_code_for_tokens(code)

    async def refresh_access_token(self, refresh_token: str) -> tuple[str, datetime]:
        """Refresh access token (same as Gmail)"""
        gmail_provider = GmailProvider(
            self.client_id, self.client_secret, self.redirect_uri, self.scopes
        )
        return await gmail_provider.refresh_access_token(refresh_token)

    async def get_provider_user_info(self, access_token: str) -> tuple[str, str]:
        """Get user info (same as Gmail)"""
        gmail_provider = GmailProvider(
            self.client_id, self.client_secret, self.redirect_uri, self.scopes
        )
        return await gmail_provider.get_provider_user_info(access_token)

    async def fetch_data(self, integration: UserIntegration) -> list[CalendarEvent]:
        """
        Fetch upcoming calendar events.

        Args:
            integration: User integration with decrypted tokens

        Returns:
            List of CalendarEvent objects
        """
        # Ensure valid access token
        access_token = await self.ensure_valid_token(integration)

        # Build Calendar service
        credentials = Credentials(token=access_token)
        service = build("calendar", "v3", credentials=credentials)

        # Get settings
        settings = integration.settings if isinstance(integration.settings, dict) else {}
        look_ahead_days = settings.get("look_ahead_days", 14)
        max_results = settings.get("max_results", 50)

        # Calculate time range
        now = datetime.now(timezone.utc)
        time_min = now.isoformat()
        time_max = (now + timedelta(days=look_ahead_days)).isoformat()

        # Fetch events
        events = []
        try:
            results = (
                service.events()
                .list(
                    calendarId="primary",
                    timeMin=time_min,
                    timeMax=time_max,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy="startTime",
                )
                .execute()
            )

            for event_data in results.get("items", []):
                # Parse start/end times
                start = event_data["start"].get("dateTime", event_data["start"].get("date"))
                end = event_data["end"].get("dateTime", event_data["end"].get("date"))

                # Convert to datetime
                start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))

                # Extract attendees
                attendees = [
                    a.get("email", "") for a in event_data.get("attendees", [])
                ]

                # Create CalendarEvent
                cal_event = CalendarEvent(
                    event_id=event_data["id"],
                    summary=event_data.get("summary", ""),
                    description=event_data.get("description"),
                    location=event_data.get("location"),
                    start=start_dt,
                    end=end_dt,
                    attendees=attendees,
                    organizer=event_data.get("organizer", {}).get("email"),
                    status=event_data.get("status", "confirmed"),
                )

                events.append(cal_event)

        except Exception as e:
            logger.error(f"Failed to fetch calendar events: {e}")
            raise

        return events

    async def mark_item_processed(
        self, integration: UserIntegration, item_id: str, action: str
    ) -> bool:
        """
        Mark calendar event as processed.

        For calendar, this is typically used for marking prep tasks as complete.
        """
        # Calendar events don't need processing like emails
        return True


# ============================================================================
# Register providers
# ============================================================================

register_provider(GmailProvider)
register_provider(GoogleCalendarProvider)
