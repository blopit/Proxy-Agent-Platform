# Google Provider Documentation

This directory contains documentation for Google-based provider integrations in the Proxy Agent Platform.

## Available Integrations

### [Gmail](./Gmail.md)
Complete documentation for Gmail integration including:
- OAuth setup and configuration
- Backend implementation details
- Mobile app integration
- Testing procedures
- Troubleshooting guides
- API reference

**Status**: ✅ Fully implemented and tested

### Google Calendar
**Status**: 🚧 Planned

Integration for syncing calendar events and generating task suggestions from upcoming meetings.

### Google Drive
**Status**: 🚧 Planned

Integration for accessing and organizing files, with task generation from shared documents.

---

## General Google OAuth Setup

All Google provider integrations share the same OAuth client configuration.

### Prerequisites

1. **Google Cloud Console Project**
   - Create project at [Google Cloud Console](https://console.cloud.google.com/)
   - Enable required APIs (Gmail, Calendar, Drive, etc.)

2. **OAuth Client Credentials**
   - Create OAuth 2.0 Client ID
   - Configure consent screen
   - Add authorized redirect URIs

3. **Environment Variables**
   ```bash
   # Backend .env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### Common Configuration

All Google integrations use:
- **Authorization URL**: `https://accounts.google.com/o/oauth2/v2/auth`
- **Token URL**: `https://oauth2.googleapis.com/token`
- **Backend Callback Pattern**: `http://localhost:8000/api/v1/integrations/{provider}/callback`
- **Mobile Deep Link**: `proxyagent://oauth/callback`

### Shared Backend Components

Located in `src/integrations/providers/google.py`:

- **`GmailProvider`** - Gmail OAuth and email fetching
- **`GoogleCalendarProvider`** - Calendar OAuth and event fetching
- Base OAuth methods (inherited from `OAuthProvider`):
  - `get_authorization_url(state)`
  - `exchange_code_for_tokens(code)`
  - `refresh_access_token(refresh_token)`
  - `get_provider_user_info(access_token)`

---

## Quick Links

- [Gmail Integration Guide](./Gmail.md)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google Drive API Documentation](https://developers.google.com/drive)

---

**Last Updated**: November 10, 2025
