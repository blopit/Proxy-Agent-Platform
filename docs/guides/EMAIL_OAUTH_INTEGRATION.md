# Email & OAuth Integration Guide

## Overview

This guide covers integrating Google OAuth and SMTP email connections for the multi-profile email system in the mobile app.

## Architecture

### Multi-Profile Email System

```
User Account
├─ Personal Profile
│  ├─ Gmail Connection
│  └─ SMTP Connection
├─ Lion Motel Profile
│  ├─ Gmail Connection
│  └─ SMTP Connection
└─ AI Service Profile
   ├─ Gmail Connection
   └─ SMTP Connection
```

Each profile maintains independent email connections stored per user.

---

## 1. Environment Configuration

### Add to `.env`

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# OAuth Scopes (Gmail)
GOOGLE_OAUTH_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send

# Mobile OAuth (for Expo app)
MOBILE_GOOGLE_REDIRECT_URI=exp://localhost:8000/--/auth/google

# Email Connection Storage
EMAIL_CONNECTIONS_TABLE=email_connections
```

### Obtaining Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:8000/api/v1/auth/google/callback` (backend)
   - `exp://localhost:8000/--/auth/google` (Expo mobile)
7. Copy Client ID and Client Secret to `.env`

---

## 2. Database Schema

### Email Connections Table

```sql
CREATE TABLE email_connections (
    connection_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    profile TEXT NOT NULL,  -- 'personal', 'lionmotel', 'aiservice'
    connection_type TEXT NOT NULL,  -- 'gmail', 'smtp'

    -- Gmail OAuth fields
    email TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,

    -- SMTP fields
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_username TEXT,
    smtp_password TEXT,  -- Encrypted
    smtp_use_tls BOOLEAN DEFAULT TRUE,

    -- Connection metadata
    status TEXT DEFAULT 'disconnected',  -- 'disconnected', 'connected', 'error'
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, profile, connection_type)
);

CREATE INDEX idx_email_connections_user_profile
ON email_connections(user_id, profile);
```

### Pydantic Models

Create `src/database/email_models.py`:

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID, uuid4

ProfileType = Literal['personal', 'lionmotel', 'aiservice']
ConnectionType = Literal['gmail', 'smtp']
ConnectionStatus = Literal['disconnected', 'connected', 'error', 'connecting']

class EmailConnectionBase(BaseModel):
    """Base model for email connections"""
    user_id: str
    profile: ProfileType
    connection_type: ConnectionType

class GmailConnectionCreate(EmailConnectionBase):
    """Create Gmail OAuth connection"""
    connection_type: Literal['gmail'] = 'gmail'
    authorization_code: str  # From OAuth flow

class SMTPConnectionCreate(EmailConnectionBase):
    """Create SMTP connection"""
    connection_type: Literal['smtp'] = 'smtp'
    email: EmailStr
    smtp_host: str
    smtp_port: int = Field(ge=1, le=65535)
    smtp_username: str
    smtp_password: str
    smtp_use_tls: bool = True

class EmailConnection(EmailConnectionBase):
    """Complete email connection model"""
    connection_id: str = Field(default_factory=lambda: str(uuid4()))
    email: Optional[EmailStr] = None
    status: ConnectionStatus = 'disconnected'

    # Gmail fields (nullable)
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expiry: Optional[datetime] = None

    # SMTP fields (nullable)
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_use_tls: Optional[bool] = None

    last_sync: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True

class EmailConnectionResponse(BaseModel):
    """API response for email connection (no sensitive data)"""
    connection_id: str
    profile: ProfileType
    connection_type: ConnectionType
    email: Optional[str]
    status: ConnectionStatus
    last_sync: Optional[datetime]
```

---

## 3. API Endpoints

### Create `src/api/email_connections.py`

```python
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from typing import List
import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from src.database.email_models import (
    EmailConnectionResponse,
    GmailConnectionCreate,
    SMTPConnectionCreate,
    ProfileType,
    ConnectionStatus
)
from src.database.adapter import DatabaseAdapter

router = APIRouter(prefix="/api/v1/email", tags=["email-connections"])

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
GOOGLE_SCOPES = os.getenv("GOOGLE_OAUTH_SCOPES", "").split(",")

def get_oauth_flow():
    """Create Google OAuth flow"""
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI],
            }
        },
        scopes=GOOGLE_SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI
    )

@router.get("/connections/{user_id}")
async def list_connections(
    user_id: str,
    profile: ProfileType | None = None
) -> List[EmailConnectionResponse]:
    """
    List all email connections for a user, optionally filtered by profile.

    **Query Parameters:**
    - profile: Filter by profile (personal, lionmotel, aiservice)

    **Response:** List of email connections (without sensitive tokens)
    """
    db = DatabaseAdapter()

    query = "SELECT * FROM email_connections WHERE user_id = ?"
    params = [user_id]

    if profile:
        query += " AND profile = ?"
        params.append(profile)

    connections = db.execute_query(query, params)

    return [
        EmailConnectionResponse(
            connection_id=conn["connection_id"],
            profile=conn["profile"],
            connection_type=conn["connection_type"],
            email=conn.get("email"),
            status=conn["status"],
            last_sync=conn.get("last_sync")
        )
        for conn in connections
    ]

@router.post("/gmail/authorize")
async def initiate_gmail_oauth(
    user_id: str,
    profile: ProfileType,
    mobile: bool = False
) -> dict:
    """
    Step 1: Initiate Gmail OAuth flow

    **Request Body:**
    - user_id: User identifier
    - profile: Which profile to connect (personal, lionmotel, aiservice)
    - mobile: True if initiating from mobile app

    **Response:**
    - authorization_url: URL to redirect user for OAuth consent
    - state: OAuth state token (store for verification)
    """
    flow = get_oauth_flow()

    # Include profile in state for callback
    state = f"{user_id}:{profile}"

    if mobile:
        # Use mobile redirect URI
        flow.redirect_uri = os.getenv("MOBILE_GOOGLE_REDIRECT_URI")

    authorization_url, state_token = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        state=state,
        prompt='consent'  # Force consent to get refresh token
    )

    return {
        "authorization_url": authorization_url,
        "state": state_token
    }

@router.get("/gmail/callback")
async def gmail_oauth_callback(
    request: Request,
    code: str,
    state: str
):
    """
    Step 2: OAuth callback handler

    **Flow:**
    1. Google redirects here with authorization code
    2. Exchange code for access & refresh tokens
    3. Store tokens in database
    4. Fetch user's email address
    5. Mark connection as 'connected'
    """
    try:
        # Parse state to get user_id and profile
        user_id, profile = state.split(":")

        # Exchange authorization code for tokens
        flow = get_oauth_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # Get user's email address
        service = build('gmail', 'v1', credentials=credentials)
        user_profile = service.users().getProfile(userId='me').execute()
        email_address = user_profile['emailAddress']

        # Store connection in database
        db = DatabaseAdapter()
        db.execute_query(
            """
            INSERT OR REPLACE INTO email_connections (
                connection_id, user_id, profile, connection_type,
                email, access_token, refresh_token, token_expiry, status
            ) VALUES (?, ?, ?, 'gmail', ?, ?, ?, ?, 'connected')
            """,
            (
                f"{user_id}:{profile}:gmail",
                user_id,
                profile,
                email_address,
                credentials.token,
                credentials.refresh_token,
                credentials.expiry,
            )
        )

        # Redirect to success page (or mobile deep link)
        return RedirectResponse(
            url=f"/email/success?profile={profile}&email={email_address}"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/smtp/connect")
async def connect_smtp(connection: SMTPConnectionCreate) -> EmailConnectionResponse:
    """
    Connect SMTP email account

    **Request Body:**
    - user_id, profile, connection_type
    - email, smtp_host, smtp_port, smtp_username, smtp_password, smtp_use_tls

    **Flow:**
    1. Validate SMTP credentials by attempting connection
    2. Encrypt password before storage
    3. Store in database
    """
    import smtplib
    from cryptography.fernet import Fernet

    # Test SMTP connection
    try:
        if connection.smtp_use_tls:
            server = smtplib.SMTP(connection.smtp_host, connection.smtp_port)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(connection.smtp_host, connection.smtp_port)

        server.login(connection.smtp_username, connection.smtp_password)
        server.quit()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"SMTP connection failed: {str(e)}"
        )

    # Encrypt password (use Fernet or similar)
    # TODO: Implement proper encryption key management
    encryption_key = os.getenv("SMTP_ENCRYPTION_KEY")
    fernet = Fernet(encryption_key.encode())
    encrypted_password = fernet.encrypt(connection.smtp_password.encode()).decode()

    # Store in database
    db = DatabaseAdapter()
    connection_id = f"{connection.user_id}:{connection.profile}:smtp"

    db.execute_query(
        """
        INSERT OR REPLACE INTO email_connections (
            connection_id, user_id, profile, connection_type,
            email, smtp_host, smtp_port, smtp_username, smtp_password,
            smtp_use_tls, status
        ) VALUES (?, ?, ?, 'smtp', ?, ?, ?, ?, ?, ?, 'connected')
        """,
        (
            connection_id,
            connection.user_id,
            connection.profile,
            connection.email,
            connection.smtp_host,
            connection.smtp_port,
            connection.smtp_username,
            encrypted_password,
            connection.smtp_use_tls,
        )
    )

    return EmailConnectionResponse(
        connection_id=connection_id,
        profile=connection.profile,
        connection_type='smtp',
        email=connection.email,
        status='connected',
        last_sync=None
    )

@router.delete("/connections/{connection_id}")
async def disconnect_email(connection_id: str) -> dict:
    """
    Disconnect and remove email connection

    **Path Parameters:**
    - connection_id: Email connection ID
    """
    db = DatabaseAdapter()
    db.execute_query(
        "DELETE FROM email_connections WHERE connection_id = ?",
        (connection_id,)
    )

    return {"status": "disconnected", "connection_id": connection_id}

@router.post("/connections/{connection_id}/refresh")
async def refresh_gmail_token(connection_id: str) -> EmailConnectionResponse:
    """
    Refresh Gmail OAuth access token using refresh token

    **Usage:** Call when access_token expires (typically after 1 hour)
    """
    db = DatabaseAdapter()

    # Get connection with refresh token
    conn = db.execute_query(
        "SELECT * FROM email_connections WHERE connection_id = ?",
        (connection_id,)
    )[0]

    if conn["connection_type"] != "gmail":
        raise HTTPException(400, "Only Gmail connections can be refreshed")

    # Refresh token
    credentials = Credentials(
        token=conn["access_token"],
        refresh_token=conn["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET
    )

    credentials.refresh(Request())

    # Update database
    db.execute_query(
        """
        UPDATE email_connections
        SET access_token = ?, token_expiry = ?, updated_at = CURRENT_TIMESTAMP
        WHERE connection_id = ?
        """,
        (credentials.token, credentials.expiry, connection_id)
    )

    return EmailConnectionResponse(
        connection_id=connection_id,
        profile=conn["profile"],
        connection_type="gmail",
        email=conn["email"],
        status="connected",
        last_sync=conn.get("last_sync")
    )
```

---

## 4. Mobile Integration (Expo)

### Update `connect.tsx`

```typescript
const handleConnect = async (connectionId: string) => {
  const [userId, profile, type] = connectionId.split('-');

  if (type === 'gmail') {
    // Initiate Gmail OAuth
    const response = await fetch(
      `${API_BASE_URL}/api/v1/email/gmail/authorize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          profile: profile,
          mobile: true
        })
      }
    );

    const { authorization_url } = await response.json();

    // Open OAuth in browser
    await WebBrowser.openAuthSessionAsync(
      authorization_url,
      'exp://localhost:8000/--/auth/google'
    );

    // Update connection status
    setConnections(prev => ({
      ...prev,
      [profile]: prev[profile].map(conn =>
        conn.id === connectionId
          ? { ...conn, status: 'connecting' }
          : conn
      )
    }));

  } else if (type === 'smtp') {
    // Show SMTP configuration modal
    navigation.navigate('SMTPConfig', { connectionId });
  }
};
```

### OAuth Deep Link Handler

Create `app/(tabs)/capture/_layout.tsx`:

```typescript
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export default function CaptureLayout() {
  useEffect(() => {
    // Handle OAuth callback deep link
    const handleDeepLink = async (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);

      if (path === 'auth/google') {
        const { code, state } = queryParams;

        // Exchange code for tokens (backend handles this)
        const response = await fetch(
          `${API_BASE_URL}/api/v1/email/gmail/callback?code=${code}&state=${state}`
        );

        if (response.ok) {
          // Refresh connection list
          // Show success message
          Alert.alert('Success', 'Gmail connected successfully!');
        }
      }
    };

    // Listen for deep links
    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, []);

  // ... rest of layout
}
```

---

## 5. Security Considerations

### Token Storage
- **Access tokens**: Store encrypted in database
- **Refresh tokens**: Store encrypted, never expose in API responses
- **SMTP passwords**: Use Fernet encryption with secure key management

### API Security
- Require authentication (JWT) for all endpoints
- Validate `user_id` matches authenticated user
- Rate limit OAuth endpoints
- Use HTTPS in production

### Best Practices
- Rotate encryption keys regularly
- Log all connection attempts
- Implement token expiry checks
- Handle token refresh automatically

---

## 6. Testing

### Manual Testing

```bash
# 1. Start backend
cd /path/to/project
uv run uvicorn src.main:app --reload

# 2. Test OAuth flow
curl http://localhost:8000/api/v1/email/gmail/authorize \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test-user", "profile": "personal", "mobile": false}'

# Response: { "authorization_url": "https://accounts.google.com/..." }

# 3. Open authorization_url in browser, grant access
# 4. Check database for stored connection
sqlite3 proxy_agents_enhanced.db "SELECT * FROM email_connections;"
```

---

## 7. Next Steps

1. **Add `.env` variables** for Google OAuth
2. **Create database migration** for `email_connections` table
3. **Install dependencies**: `google-auth`, `google-api-python-client`
4. **Implement API endpoints** in `src/api/email_connections.py`
5. **Update mobile app** to call OAuth endpoints
6. **Test OAuth flow** end-to-end
7. **Implement SMTP configuration modal**
8. **Add token refresh cronjob** for Gmail connections

---

## Dependencies

Add to `pyproject.toml`:

```toml
[project]
dependencies = [
    # ... existing deps
    "google-auth>=2.23.0",
    "google-auth-oauthlib>=1.1.0",
    "google-api-python-client>=2.100.0",
    "cryptography>=41.0.0",
]
```

Install:
```bash
uv add google-auth google-auth-oauthlib google-api-python-client cryptography
```

---

## Reference Links

- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Expo WebBrowser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [FastAPI OAuth](https://fastapi.tiangolo.com/advanced/security/oauth2-scopes/)
