# Gmail Integration - Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [OAuth Configuration](#oauth-configuration)
4. [Backend Implementation](#backend-implementation)
5. [Mobile App Integration](#mobile-app-integration)
6. [Testing Guide](#testing-guide)
7. [Troubleshooting](#troubleshooting)
8. [Recent Fixes](#recent-fixes)
9. [API Reference](#api-reference)

---

## Overview

The Gmail integration enables users to connect their Gmail accounts to the Proxy Agent Platform for automated task capture from emails. This is a **provider integration** system that is separate from Google OAuth authentication.

### Key Distinction: Google Sign-In vs Gmail Integration

**These are TWO SEPARATE OAuth flows:**

| Feature | Google Sign-In | Gmail Integration |
|---------|----------------|-------------------|
| **Purpose** | User authentication | Email access for task capture |
| **Scopes** | `openid`, `profile`, `email` | `gmail.readonly`, `gmail.modify`, `userinfo.email` |
| **Endpoint** | `/api/v1/auth/oauth/google` | `/api/v1/integrations/gmail/authorize` |
| **Token Storage** | `@auth_token`, `@auth_refresh_token` in AsyncStorage | Backend database (integrations table) |
| **What it does** | Logs user into the app | Grants app access to read/modify Gmail emails |
| **When used** | Initial login or signup | Connecting email provider in Capture tab |

**Important**: Signing in with Google does NOT automatically grant Gmail access. The user must separately connect Gmail integration to enable email task capture.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (Expo)                       │
├─────────────────────────────────────────────────────────────┤
│  • Capture Tab → Connect Screen                             │
│  • ConnectionElement Component                              │
│  • OAuth Flow (WebBrowser + Deep Links)                     │
│  • Integration API Client                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS Requests
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Backend (FastAPI)                               │
├─────────────────────────────────────────────────────────────┤
│  • /api/v1/integrations/gmail/authorize                     │
│  • /api/v1/integrations/gmail/callback                      │
│  • IntegrationService                                       │
│  • GmailProvider (OAuth + Email Fetching)                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ OAuth 2.0
                 │
┌────────────────▼────────────────────────────────────────────┐
│               Google OAuth 2.0                               │
├─────────────────────────────────────────────────────────────┤
│  • Authorization Server                                      │
│  • Token Exchange                                            │
│  • Gmail API Access                                          │
└─────────────────────────────────────────────────────────────┘
```

### OAuth Flow Sequence

```
1. User clicks "Connect" on Gmail in Capture/Connect tab
   └─> Mobile: initiateGmailOAuth(profileId, token)

2. Backend generates OAuth authorization URL
   └─> Backend: POST /api/v1/integrations/gmail/authorize?mobile=true
   └─> Response: { authorization_url, provider, message }

3. Mobile opens OAuth browser
   └─> WebBrowser.openAuthSessionAsync(authorization_url, redirect_uri)

4. Google OAuth consent screen
   └─> User reviews requested scopes
   └─> User clicks "Allow"

5. Google redirects to callback
   └─> Backend: GET /api/v1/integrations/gmail/callback?code=XXX&state=YYY

6. Backend exchanges code for tokens
   └─> POST https://oauth2.googleapis.com/token
   └─> Receives: access_token, refresh_token, expires_in

7. Backend stores integration
   └─> Database: integrations table
   └─> Fields: access_token (encrypted), refresh_token (encrypted), token_expiry

8. Backend redirects to mobile app
   └─> Deep link: proxyagent://oauth/callback?success=true&integration_id=...

9. Mobile handles deep link
   └─> Alert: "Gmail connected successfully!"
   └─> Reload integrations list
   └─> Update UI to show "Connected" status
```

### Database Schema

```sql
-- Integrations table (in src/database/migrations/)
CREATE TABLE integrations (
    integration_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,  -- 'gmail', 'google_calendar', etc.

    -- OAuth tokens (encrypted)
    access_token TEXT,
    refresh_token TEXT,
    token_expiry TIMESTAMP,
    granted_scopes TEXT,  -- JSON array

    -- Provider info
    provider_user_id TEXT,
    provider_username TEXT,  -- Email address

    -- Connection status
    status TEXT DEFAULT 'connected',  -- 'connected', 'disconnected', 'error', 'token_expired'
    sync_enabled BOOLEAN DEFAULT TRUE,

    -- Settings
    settings TEXT,  -- JSON object for provider-specific settings

    -- Sync tracking
    last_sync_at TIMESTAMP,
    last_sync_status TEXT,

    -- Metadata
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, provider)
);
```

---

## OAuth Configuration

### Google Cloud Console Setup

#### Step 1: Create OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**

#### Step 2: Configure OAuth Consent Screen

1. **User Type**: External (for public testing) or Internal (for workspace)
2. **App Information**:
   - App name: `Proxy Agent Platform`
   - User support email: Your email
   - Developer contact: Your email
3. **Scopes**: Add these scopes:
   ```
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/gmail.modify
   https://www.googleapis.com/auth/userinfo.email
   ```
4. **Test Users** (if External): Add your test Gmail accounts

#### Step 3: Configure Redirect URIs

Add BOTH web and mobile redirect URIs:

**Web Application OAuth Client:**
```
http://localhost:8000/api/v1/integrations/gmail/callback
http://127.0.0.1:8000/api/v1/integrations/gmail/callback
```

**For production:**
```
https://yourdomain.com/api/v1/integrations/gmail/callback
```

**Important**:
- The redirect URI must EXACTLY match what backend sends to Google
- Mobile app uses `proxyagent://` deep link for final redirect
- Backend callback receives the auth code, then redirects to mobile deep link

#### Step 4: Enable Gmail API

1. **APIs & Services** → **Library**
2. Search for "Gmail API"
3. Click **ENABLE**

#### Step 5: Copy Credentials

1. Click on your OAuth 2.0 Client ID
2. Copy **Client ID** and **Client Secret**
3. Add to `.env` files:

**Backend `.env`:**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Redirect URI (must match Google Cloud Console)
GMAIL_REDIRECT_URI=http://localhost:8000/api/v1/integrations/gmail/callback
```

**Mobile `mobile/.env`:**
```bash
# Optional: For Google Sign-In (separate from Gmail integration)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=your-native-client-id.apps.googleusercontent.com
```

### Verification

Run the verification script to check configuration:

```bash
./scripts/verify_gmail_oauth.sh
```

Expected output:
```
✓ GOOGLE_CLIENT_ID configured
✓ GOOGLE_CLIENT_SECRET configured
✓ Backend server is running
✓ Gmail OAuth endpoint exists
✓ EXPO_PUBLIC_GOOGLE_CLIENT_ID configured

Configuration: COMPLETE ✓
```

---

## Backend Implementation

### GmailProvider Class

Location: `src/integrations/providers/google.py`

The `GmailProvider` implements the OAuth flow and Gmail API integration:

```python
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
```

**Key Methods:**

1. **`get_authorization_url(state: str) -> str`**
   - Generates OAuth authorization URL with Gmail scopes
   - Includes `access_type=offline` to receive refresh token
   - Includes `prompt=consent` to force consent screen

2. **`exchange_code_for_tokens(code: str) -> tuple`**
   - Exchanges authorization code for access + refresh tokens
   - Returns: `(access_token, refresh_token, expires_at, granted_scopes)`

3. **`refresh_access_token(refresh_token: str) -> tuple`**
   - Refreshes expired access token
   - Returns: `(new_access_token, new_expires_at)`

4. **`fetch_data(integration: UserIntegration) -> list[GmailMessage]`**
   - Fetches unread emails from Gmail
   - Parses email headers, body, labels
   - Returns list of `GmailMessage` objects

5. **`mark_item_processed(integration, item_id, action) -> bool`**
   - Marks email as read or archived
   - Actions: `mark_read`, `archive`

### Integration API Routes

Location: `src/api/routes/integrations.py`

**Key Endpoints:**

#### POST `/api/v1/integrations/gmail/authorize`

Initiates OAuth flow.

**Query Parameters:**
- `mobile=true` - Adds mobile deep link to callback

**Request:**
```http
POST /api/v1/integrations/gmail/authorize?mobile=true
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
  "provider": "gmail",
  "message": "Visit the authorization URL to connect your account"
}
```

**Implementation:**
```python
@router.post("/{provider}/authorize", response_model=AuthorizationResponse)
async def authorize_provider(
    provider: ProviderType,
    mobile: bool = Query(False),
    current_user: User = Depends(get_current_user),
    service: IntegrationService = Depends(get_integration_service),
):
    # Generate redirect URI with mobile=true parameter
    redirect_uri = None
    if mobile:
        base_redirect = os.getenv(f"{provider.upper()}_REDIRECT_URI")
        redirect_uri = f"{base_redirect}?mobile=true"

    # Generate OAuth URL
    auth_url = service.initiate_oauth(provider, current_user.user_id, redirect_uri)

    return AuthorizationResponse(
        authorization_url=auth_url,
        provider=provider,
    )
```

#### GET `/api/v1/integrations/gmail/callback`

Handles OAuth callback.

**Query Parameters:**
- `code` - Authorization code from Google
- `state` - CSRF state parameter
- `mobile=true` - Redirect to mobile deep link

**Flow:**
1. Receive authorization code from Google
2. Exchange code for access + refresh tokens
3. Fetch user's email address
4. Store integration in database (encrypted tokens)
5. Redirect to mobile app or web frontend

**Mobile Redirect:**
```
proxyagent://oauth/callback?success=true&integration_id=XXX&provider=gmail
```

**Implementation:**
```python
@router.get("/{provider}/callback")
async def oauth_callback(
    provider: ProviderType,
    code: str = Query(...),
    state: str = Query(...),
    mobile: bool = Query(False),
    service: IntegrationService = Depends(get_integration_service),
):
    try:
        # Exchange code for tokens and create integration
        integration = await service.handle_callback(provider, code, state)

        # Redirect to mobile or web
        if mobile:
            redirect_url = (
                f"proxyagent://oauth/callback"
                f"?success=true&integration_id={integration['integration_id']}"
                f"&provider={provider}"
            )
        else:
            redirect_url = f"http://localhost:3000/integrations?success=true..."

        return RedirectResponse(url=redirect_url)
    except Exception as e:
        # Redirect with error
        redirect_url = f"proxyagent://oauth/callback?success=false&error={str(e)}"
        return RedirectResponse(url=redirect_url)
```

#### GET `/api/v1/integrations/`

List user's integrations.

**Query Parameters:**
- `provider` - Filter by provider (optional)

**Request:**
```http
GET /api/v1/integrations/?provider=gmail
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "integration_id": "uuid",
    "provider": "gmail",
    "status": "connected",
    "provider_username": "user@gmail.com",
    "sync_enabled": true,
    "last_sync_at": "2025-11-10T12:00:00Z",
    "connected_at": "2025-11-09T10:00:00Z"
  }
]
```

#### POST `/api/v1/integrations/{integration_id}/disconnect`

Disconnect integration.

**Request:**
```http
POST /api/v1/integrations/{integration_id}/disconnect
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Integration disconnected successfully",
  "integration_id": "uuid"
}
```

---

## Mobile App Integration

### Integration API Client

Location: `mobile/src/api/integrations.ts`

**Key Functions:**

```typescript
/**
 * Initiate Gmail OAuth flow
 */
export async function initiateGmailOAuth(
  userId: string,
  token: string
): Promise<AuthorizationResponse> {
  const response = await apiPost(
    `${API_BASE_URL}/integrations/gmail/authorize?mobile=true`
  );
  return response.json();
}

/**
 * List all integrations
 */
export async function listIntegrations(
  userId: string,
  token: string,
  provider?: ProviderType
): Promise<Integration[]> {
  const url = new URL(`${API_BASE_URL}/integrations/`);
  if (provider) {
    url.searchParams.append('provider', provider);
  }
  const response = await apiGet(url.toString());
  return response.json();
}

/**
 * Disconnect integration
 */
export async function disconnectIntegration(
  integrationId: string,
  token: string
): Promise<void> {
  await apiPost(`${API_BASE_URL}/integrations/${integrationId}/disconnect`);
}
```

### Connect Screen

Location: `mobile/app/(tabs)/capture/connect.tsx`

The Connect screen manages email provider connections:

**Key Features:**

1. **Load Existing Integrations**
   ```typescript
   const loadIntegrations = async () => {
     const integrations = await listIntegrations(activeProfile, token);
     const gmailIntegration = integrations.find(i => i.provider === 'gmail');

     if (gmailIntegration) {
       setConnections(prev => prev.map(conn =>
         conn.type === 'gmail'
           ? {
               ...conn,
               status: gmailIntegration.status as ConnectionStatus,
               email: gmailIntegration.provider_username
             }
           : conn
       ));
     }
   };
   ```

2. **Gmail OAuth Flow**
   ```typescript
   const handleGmailConnect = async () => {
     console.log('[Gmail Connect] Starting OAuth flow...');

     // Get authorization URL from backend
     const { authorization_url } = await initiateGmailOAuth(activeProfile, token);

     // Verify Gmail scopes in URL
     if (!authorization_url.includes('gmail')) {
       console.warn('[Gmail Connect] Warning: URL may not include Gmail scopes');
     }

     // Open OAuth browser
     const result = await WebBrowser.openAuthSessionAsync(
       authorization_url,
       'proxyagent://oauth/callback'
     );

     // Success/failure handled by deep link callback
   };
   ```

3. **Deep Link Handler**
   ```typescript
   const handleDeepLink = ({ url }: { url: string }) => {
     const { path, queryParams } = Linking.parse(url);

     if (path === 'oauth/callback') {
       const { success, integration_id, provider, error } = queryParams;

       if (success === 'true' && provider === 'gmail') {
         Alert.alert('Success', 'Gmail connected successfully!');
         loadIntegrations(); // Reload to get updated status
       } else if (error) {
         Alert.alert('Connection Failed', error);
       }
     }
   };
   ```

4. **Deep Link Listener Setup**
   ```typescript
   useEffect(() => {
     const subscription = Linking.addEventListener('url', handleDeepLink);

     // Handle initial deep link (if app opened from one)
     Linking.getInitialURL().then((url) => {
       if (url) handleDeepLink({ url });
     });

     return () => subscription.remove();
   }, []);
   ```

### ConnectionElement Component

Location: `mobile/components/connections/ConnectionElement.tsx`

Displays individual provider connections:

**Props Interface:**
```typescript
export interface ConnectionElementProps {
  icon: React.ReactNode;  // React icon component (e.g., <Mail />)
  email?: string;         // Connected email address
  provider: string;       // Display name
  status: ConnectionStatus;
  onConnect?: () => void;
}
```

**Key Features:**
- Shows provider icon (brand colors)
- Displays connection status (disconnected, connecting, connected, error)
- Shows email address when connected
- Button changes based on status (Connect vs Connected)

**Example Usage:**
```tsx
<ConnectionElement
  provider="Gmail"
  icon={<Mail color="#EA4335" size={24} />}
  status="connected"
  email="user@gmail.com"
  onConnect={handleGmailConnect}
/>
```

### OAuth Service

Location: `mobile/src/services/oauthService.ts`

Handles Google OAuth for authentication (separate from Gmail integration):

**Note**: This is for Google Sign-In, NOT Gmail integration. Gmail integration uses the integrations API.

```typescript
// Google Sign-In OAuth (authentication)
class OAuthService {
  async signInWithGoogle(): Promise<OAuthResult> {
    // Platform-specific implementation
    if (Platform.OS === 'web') {
      return this.signInWithGoogleWeb();
    } else {
      return this.signInWithGoogleNative();
    }
  }
}

// Gmail Integration (provider connection)
// Uses: initiateGmailOAuth() from integrations.ts
```

---

## Testing Guide

### Prerequisites

Before testing Gmail integration:

1. **Backend Configuration**
   ```bash
   # Check .env file
   grep GOOGLE_CLIENT .env

   # Should show:
   # GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   # GOOGLE_CLIENT_SECRET=xxx
   ```

2. **Google Cloud Console**
   - Gmail API enabled
   - OAuth client configured
   - Redirect URIs added
   - Scopes configured

3. **Backend Running**
   ```bash
   python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Mobile App Running**
   ```bash
   cd mobile
   npm start
   ```

5. **User Authenticated**
   - Must be logged into the mobile app
   - Has valid JWT access token

### Testing Procedure

#### Step 1: Verify Backend Health

```bash
curl http://localhost:8000/api/v1/integrations/health

# Expected:
# {
#   "status": "healthy",
#   "service": "provider_integrations",
#   "version": "1.0.0"
# }
```

#### Step 2: Run Verification Script

```bash
./scripts/verify_gmail_oauth.sh

# Expected output:
# ✓ GOOGLE_CLIENT_ID configured
# ✓ GOOGLE_CLIENT_SECRET configured
# ✓ Backend server is running
# ✓ Gmail OAuth endpoint exists
# ✓ EXPO_PUBLIC_GOOGLE_CLIENT_ID configured
# Configuration: COMPLETE ✓
```

#### Step 3: Test Backend OAuth Endpoint

```bash
# Get your access token from mobile app logs or AsyncStorage
TOKEN="your-jwt-token"

# Test OAuth initiation
curl -X POST "http://localhost:8000/api/v1/integrations/gmail/authorize?mobile=true" \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&scope=...gmail...",
#   "provider": "gmail",
#   "message": "Visit the authorization URL to connect your account"
# }
```

**Verify the `authorization_url` includes:**
- `scope=` with `gmail.readonly` and `gmail.modify`
- `access_type=offline` (to get refresh token)
- `prompt=consent` (to force consent screen)

#### Step 4: Test Gmail Connect Button

1. **Open mobile app**
2. **Navigate to** Capture → Connect tab
3. **Open browser console/debugger** (Chrome DevTools, React Native Debugger, or Expo DevTools)
4. **Click "Connect" on Gmail button**

**Expected console logs:**
```
[Gmail Connect] Starting OAuth flow...
[Gmail Connect] Active profile: <profile-id>
[Gmail Connect] Has token: true
[Gmail Connect] Calling backend authorize endpoint...
[Gmail Connect] Authorization response: {
  provider: 'gmail',
  message: '...',
  url_preview: 'https://accounts.google.com...'
}
[Gmail Connect] Opening OAuth browser session...
```

#### Step 5: Complete OAuth Flow

1. **OAuth browser opens** with Google consent screen
2. **Sign in to Google** (if not already)
3. **Review permissions**:
   - "View your email messages and settings"
   - "Manage your email"
4. **Click "Allow"**

#### Step 6: Verify Callback

**Expected console logs:**
```
[Gmail Connect] WebBrowser result: {
  type: 'success',
  url: 'proxyagent://oauth/callback?success=true&integration_id=...'
}

[Deep Link] Received URL: proxyagent://oauth/callback?success=true&integration_id=...&provider=gmail
[Deep Link] Parsed path: oauth/callback
[Deep Link] OAuth callback params: { success: 'true', integration_id: '...', provider: 'gmail' }
[Deep Link] Gmail OAuth succeeded, integration_id: ...

[Load Integrations] Starting...
[Load Integrations] Fetching from backend...
[Load Integrations] Received integrations: [...]
[Load Integrations] Gmail integration: { integration_id: '...', status: 'connected', ... }
[Load Integrations] Updating Gmail connection status to: { status: 'connected', email: 'user@gmail.com' }
```

**Expected UI behavior:**
1. Alert shows "Gmail connected successfully!"
2. Gmail button changes to "Connected"
3. Email address appears below "Gmail" label
4. Status icon changes to green checkmark

#### Step 7: Verify Persistence

1. **Close and reopen app**
2. **Navigate to** Capture → Connect
3. **Gmail should still show "Connected"**
4. **Email address should be displayed**

#### Step 8: Verify Backend Database

```bash
# If using SQLite
sqlite3 proxy_agents_enhanced.db

# Check integrations
SELECT * FROM integrations WHERE provider = 'gmail';

# Expected fields:
# - integration_id
# - user_id
# - provider = 'gmail'
# - status = 'connected'
# - provider_username = 'user@gmail.com'
# - access_token (encrypted)
# - refresh_token (encrypted)
# - token_expiry
```

### Success Checklist

- [ ] Backend health check passes
- [ ] Verification script passes
- [ ] Backend OAuth endpoint returns authorization_url
- [ ] Authorization URL includes Gmail scopes
- [ ] Gmail Connect button is clickable
- [ ] Console logs show OAuth flow starting
- [ ] OAuth browser opens successfully
- [ ] Google consent screen shows correct permissions
- [ ] Can grant permissions successfully
- [ ] Deep link callback received
- [ ] Success alert appears
- [ ] Connection status updates to "connected"
- [ ] Email address displays
- [ ] Integration persists across app restarts
- [ ] No errors in console
- [ ] Backend has integration record in database

---

## Troubleshooting

### Issue: Gmail Button Not Responsive

**Symptoms:**
- Clicking Gmail "Connect" button does nothing
- No console logs appear
- No OAuth flow starts

**Root Cause:**
Props mismatch in ConnectionElement component or React errors preventing handler execution.

**Solution:**
1. Check browser console for React errors
2. Verify ConnectionElement props are correct:
   ```tsx
   <ConnectionElement
     icon={<Mail color="#EA4335" size={24} />}  // React component
     email={connection.email}  // Email string
     provider="Gmail"
     status={connection.status}
     onConnect={handleConnect}
   />
   ```
3. Restart mobile dev server: `npm start` or press `r` in Metro
4. Clear Metro cache: `npm start -- --reset-cache`

### Issue: "No refresh token available"

**Symptoms:**
```
apiClient.ts:47 No refresh token available
POST http://localhost:8000/api/v1/integrations/gmail/authorize 401 (Unauthorized)
Error: Authentication failed - please log in again
```

**Root Cause:**
User logged in before the OAuth endpoint was fixed to return refresh tokens. Their stored tokens don't include a refresh token.

**Solution:**
1. Log out using the logout button in You tab
2. Log back in via Google OAuth (will receive refresh tokens this time)
3. Try Gmail connection again

**Note**: This only affects users who authenticated before the refresh token fix was deployed.

### Issue: Logout Button Not Working (Web)

**Symptoms:**
- Logout button clicked but nothing happens
- Console logs show click detected but no confirmation dialog

**Root Cause:**
`Alert.alert()` doesn't work on web - it's React Native mobile-only.

**Solution:**
Fixed in `mobile/app/(tabs)/you.tsx` to use platform detection:
```typescript
const isWeb = typeof window !== 'undefined';

if (isWeb && typeof window.confirm === 'function') {
  // Use browser confirm on web
  const confirmed = window.confirm('Are you sure you want to log out?');
  if (confirmed) await logout();
} else {
  // Use Alert.alert on mobile
  Alert.alert('Log Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', onPress: logout }
  ]);
}
```

### Issue: OAuth Browser Shows "Invalid redirect URI"

**Symptoms:**
- Google OAuth page shows error
- "Error 400: redirect_uri_mismatch"

**Root Cause:**
Redirect URI in backend doesn't match Google Cloud Console configuration.

**Solution:**
1. Check backend `.env`:
   ```bash
   grep GMAIL_REDIRECT_URI .env
   # Should be: http://localhost:8000/api/v1/integrations/gmail/callback
   ```
2. Check Google Cloud Console:
   - Go to Credentials → OAuth 2.0 Client IDs
   - Click on your client
   - Verify "Authorized redirect URIs" includes:
     - `http://localhost:8000/api/v1/integrations/gmail/callback`
     - `http://127.0.0.1:8000/api/v1/integrations/gmail/callback`
3. Add your local IP if testing on mobile device:
   ```
   http://192.168.1.XXX:8000/api/v1/integrations/gmail/callback
   ```

### Issue: OAuth Succeeds But No Callback Received

**Symptoms:**
- Google OAuth completes successfully
- Browser redirects but app doesn't receive callback
- No deep link logs in console

**Root Cause:**
Deep link scheme not registered or not configured correctly.

**Solution:**
1. Verify `app.json` has correct scheme:
   ```json
   {
     "expo": {
       "scheme": "proxyagent"
     }
   }
   ```
2. Test deep link manually:
   ```bash
   # iOS Simulator
   xcrun simctl openurl booted "proxyagent://oauth/callback?success=true&provider=gmail"

   # Android Emulator
   adb shell am start -W -a android.intent.action.VIEW \
     -d "proxyagent://oauth/callback?success=true&provider=gmail"
   ```
3. Check deep link listener is set up in connect.tsx:
   ```typescript
   useEffect(() => {
     const subscription = Linking.addEventListener('url', handleDeepLink);
     return () => subscription.remove();
   }, []);
   ```

### Issue: "Gmail OAuth not configured" Error

**Symptoms:**
```
HTTPException: Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
```

**Root Cause:**
Backend `.env` missing Google OAuth credentials.

**Solution:**
1. Add credentials to backend `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   ```
2. Restart backend server
3. Verify credentials loaded:
   ```bash
   # Backend should log on startup:
   # INFO: Registered OAuth provider: gmail
   ```

### Issue: Authorization URL Doesn't Include Gmail Scopes

**Symptoms:**
Console warning:
```
[Gmail Connect] Warning: Authorization URL may not include Gmail scopes
```

**Root Cause:**
Backend Gmail provider not configured with correct scopes.

**Solution:**
1. Check `src/integrations/providers/google.py`:
   ```python
   class GmailProvider(OAuthProvider):
       DEFAULT_SCOPES = [
           "https://www.googleapis.com/auth/gmail.readonly",
           "https://www.googleapis.com/auth/gmail.modify",
           "https://www.googleapis.com/auth/userinfo.email",
       ]
   ```
2. Verify provider is registered:
   ```python
   # At bottom of google.py
   register_provider(GmailProvider)
   ```
3. Restart backend server

### Issue: 401 Unauthorized on Integration Endpoints

**Symptoms:**
```
POST http://localhost:8000/api/v1/integrations/gmail/authorize 401 (Unauthorized)
```

**Root Cause:**
JWT access token expired and refresh failed.

**Solution:**
1. Check if refresh token exists:
   ```typescript
   // In mobile app console
   AsyncStorage.getItem('@auth_refresh_token').then(console.log);
   ```
2. If missing, log out and log back in
3. Verify apiClient auto-refresh is working:
   ```typescript
   // mobile/src/api/apiClient.ts should have refresh logic
   if (response.status === 401) {
     // Try to refresh token
     const refreshed = await refreshAuthToken();
     if (refreshed) {
       // Retry original request
     }
   }
   ```

---

## Recent Fixes

### Fix 1: OAuth Endpoint Missing Refresh Tokens (Nov 2025)

**Problem**: Users authenticated via Google OAuth didn't receive refresh tokens, causing 401 errors after 30 minutes.

**Solution**:
- Modified `src/api/routes/oauth.py` to create and return refresh tokens
- Updated `TokenResponse` interface to include `refresh_token` field
- Updated mobile app to store full token response

**Files Changed:**
- `src/api/routes/oauth.py` - Added refresh token creation
- `mobile/src/contexts/AuthContext.tsx` - Updated loginWithToken signature
- `mobile/src/services/oauthService.ts` - Added refresh_token to OAuthResult
- `mobile/app/(auth)/login.tsx` - Pass full token response
- `mobile/app/(auth)/signup.tsx` - Pass full token response

### Fix 2: ConnectionElement Props Mismatch (Nov 2025)

**Problem**: Gmail "Connect" button was unresponsive due to props mismatch - component expected `iconSvg: string` but received React component.

**Solution**:
- Updated ConnectionElement interface to accept `icon: React.ReactNode`
- Added `email?: string` prop for displaying connected email
- Removed SVG path rendering code

**Files Changed:**
- `mobile/components/connections/ConnectionElement.tsx` - Updated props and rendering

### Fix 3: Logout Button Web Compatibility (Nov 2025)

**Problem**: Logout button didn't work on web because `Alert.alert()` is mobile-only.

**Solution**:
- Added platform detection
- Use `window.confirm()` on web
- Use `Alert.alert()` on mobile

**Files Changed:**
- `mobile/app/(tabs)/you.tsx` - Added platform-specific logout handler

### Fix 4: Comprehensive Debug Logging (Nov 2025)

**Problem**: No visibility into OAuth flow failures - difficult to diagnose issues.

**Solution**:
- Added extensive console logging to all OAuth functions
- Log OAuth initiation, authorization response, browser result
- Log deep link reception and parsing
- Log integration loading and status updates

**Files Changed:**
- `mobile/app/(tabs)/capture/connect.tsx` - Added logging to handleGmailConnect, handleDeepLink, loadIntegrations

### Fix 5: Documentation and Testing Tools (Nov 2025)

**Problem**: No testing documentation or verification tools for Gmail integration.

**Solution**:
- Created verification script to check OAuth configuration
- Created comprehensive testing guide
- Created fix completion summary

**Files Created:**
- `scripts/verify_gmail_oauth.sh` - Configuration verification
- `mobile/docs/GMAIL_INTEGRATION_TESTING.md` - Testing guide
- `mobile/docs/GMAIL_INTEGRATION_FIX_COMPLETE.md` - Fix summary

---

## API Reference

### Backend Endpoints

#### POST `/api/v1/integrations/gmail/authorize`

Initiate Gmail OAuth flow.

**Authentication**: Required (JWT Bearer token)

**Query Parameters:**
- `mobile` (boolean, optional): Add mobile deep link to callback

**Request:**
```http
POST /api/v1/integrations/gmail/authorize?mobile=true HTTP/1.1
Host: localhost:8000
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=XXX&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.readonly+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fgmail.modify+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&state=YYY&access_type=offline&prompt=consent",
  "provider": "gmail",
  "message": "Visit the authorization URL to connect your account"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired JWT token
- `404 Not Found` - Gmail provider not configured
- `500 Internal Server Error` - OAuth initialization failed

---

#### GET `/api/v1/integrations/gmail/callback`

Handle OAuth callback from Google.

**Query Parameters:**
- `code` (string, required): Authorization code from Google
- `state` (string, required): CSRF state parameter
- `mobile` (boolean, optional): Redirect to mobile deep link

**Flow:**
1. Receives authorization code
2. Exchanges code for tokens
3. Fetches user email
4. Stores integration in database
5. Redirects to mobile app or web frontend

**Response (302 Redirect):**

**Mobile:**
```
Location: proxyagent://oauth/callback?success=true&integration_id=XXX&provider=gmail
```

**Web:**
```
Location: http://localhost:3000/integrations?success=true&integration_id=XXX&provider=gmail
```

**Error Redirect:**
```
Location: proxyagent://oauth/callback?success=false&error=OAuth+failed
```

---

#### GET `/api/v1/integrations/`

List user's integrations.

**Authentication**: Required (JWT Bearer token)

**Query Parameters:**
- `provider` (string, optional): Filter by provider (`gmail`, `google_calendar`, etc.)

**Request:**
```http
GET /api/v1/integrations/?provider=gmail HTTP/1.1
Host: localhost:8000
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
[
  {
    "integration_id": "550e8400-e29b-41d4-a716-446655440000",
    "provider": "gmail",
    "status": "connected",
    "provider_username": "user@gmail.com",
    "sync_enabled": true,
    "last_sync_at": "2025-11-10T12:00:00Z",
    "connected_at": "2025-11-09T10:00:00Z"
  }
]
```

**Errors:**
- `401 Unauthorized` - Invalid or expired JWT token
- `500 Internal Server Error` - Failed to retrieve integrations

---

#### POST `/api/v1/integrations/{integration_id}/disconnect`

Disconnect an integration.

**Authentication**: Required (JWT Bearer token)

**Path Parameters:**
- `integration_id` (string): Integration ID to disconnect

**Request:**
```http
POST /api/v1/integrations/550e8400-e29b-41d4-a716-446655440000/disconnect HTTP/1.1
Host: localhost:8000
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Integration disconnected successfully",
  "integration_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired JWT token
- `403 Forbidden` - Not authorized to disconnect this integration
- `404 Not Found` - Integration not found

---

#### GET `/api/v1/integrations/{integration_id}/status`

Get integration connection status.

**Authentication**: Required (JWT Bearer token)

**Path Parameters:**
- `integration_id` (string): Integration ID

**Request:**
```http
GET /api/v1/integrations/550e8400-e29b-41d4-a716-446655440000/status HTTP/1.1
Host: localhost:8000
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "integration_id": "550e8400-e29b-41d4-a716-446655440000",
  "provider": "gmail",
  "status": "connected",
  "is_token_expired": false,
  "token_expires_at": "2025-11-10T13:00:00Z",
  "sync_enabled": true,
  "last_sync_at": "2025-11-10T12:00:00Z",
  "last_sync_status": "success",
  "provider_username": "user@gmail.com"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired JWT token
- `403 Forbidden` - Not authorized to view this integration
- `404 Not Found` - Integration not found

---

#### POST `/api/v1/integrations/{integration_id}/sync`

Trigger manual sync.

**Authentication**: Required (JWT Bearer token)

**Path Parameters:**
- `integration_id` (string): Integration ID

**Request:**
```http
POST /api/v1/integrations/550e8400-e29b-41d4-a716-446655440000/sync HTTP/1.1
Host: localhost:8000
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "sync_status": "success",
  "items_fetched": 15,
  "tasks_generated": 8,
  "log_id": "660e8400-e29b-41d4-a716-446655440000",
  "message": "Sync completed successfully"
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired JWT token
- `403 Forbidden` - Not authorized to sync this integration
- `404 Not Found` - Integration not found
- `500 Internal Server Error` - Sync failed

---

#### GET `/api/v1/integrations/health`

Health check endpoint.

**Authentication**: Not required

**Request:**
```http
GET /api/v1/integrations/health HTTP/1.1
Host: localhost:8000
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "provider_integrations",
  "version": "1.0.0"
}
```

---

### Mobile API Client

TypeScript functions in `mobile/src/api/integrations.ts`:

```typescript
// Initiate Gmail OAuth
async function initiateGmailOAuth(
  userId: string,
  token: string
): Promise<AuthorizationResponse>

// List integrations
async function listIntegrations(
  userId: string,
  token: string,
  provider?: ProviderType
): Promise<Integration[]>

// Get integration status
async function getIntegrationStatus(
  integrationId: string,
  token: string
): Promise<ConnectionStatus>

// Disconnect integration
async function disconnectIntegration(
  integrationId: string,
  token: string
): Promise<void>

// Trigger manual sync
async function triggerSync(
  integrationId: string,
  token: string
): Promise<void>

// Helper: Find integration by provider
async function findIntegrationByProvider(
  userId: string,
  token: string,
  provider: ProviderType
): Promise<Integration | null>

// Helper: Check if provider connected
async function isProviderConnected(
  userId: string,
  token: string,
  provider: ProviderType
): Promise<boolean>
```

---

## Next Steps

After successful Gmail integration:

1. **Test Email Fetching**
   - Trigger manual sync
   - Verify emails are fetched from Gmail
   - Check task suggestions are generated

2. **Test Task Generation**
   - Review AI-generated task suggestions
   - Approve/dismiss suggestions
   - Verify tasks are created in main tasks list

3. **Test Token Refresh**
   - Wait for access token to expire (1 hour)
   - Trigger sync
   - Verify backend auto-refreshes token

4. **Test Multiple Profiles**
   - Switch to different profile
   - Connect Gmail to new profile
   - Verify separate integrations per profile

5. **Test Disconnect/Reconnect**
   - Disconnect Gmail integration
   - Verify integration removed from database
   - Reconnect Gmail
   - Verify new integration created

---

## Related Documentation

- **OAuth Refresh Token Fix**: `mobile/docs/OAUTH_REFRESH_TOKEN_FIX.md`
- **Gmail Integration Testing**: `mobile/docs/GMAIL_INTEGRATION_TESTING.md`
- **Gmail Integration Fix Summary**: `mobile/docs/GMAIL_INTEGRATION_FIX_COMPLETE.md`
- **Email OAuth Integration Guide**: `docs/guides/EMAIL_OAUTH_INTEGRATION.md`
- **Google OAuth Setup**: `docs/guides/GOOGLE_OAUTH_SETUP.md`

---

## Appendix: Scopes Explained

### Gmail API Scopes

**`https://www.googleapis.com/auth/gmail.readonly`**
- Read all emails, labels, and settings
- Cannot modify or delete emails
- Safe for read-only integrations

**`https://www.googleapis.com/auth/gmail.modify`**
- Read and modify emails (mark read, archive, label)
- Cannot send emails or delete permanently
- Used for task capture workflow

**`https://www.googleapis.com/auth/userinfo.email`**
- Get user's email address
- Used to identify which Gmail account is connected

### Google Sign-In Scopes (Separate)

**`openid`**
- OpenID Connect authentication
- Required for OAuth login

**`profile`**
- Get user's name, profile picture
- Used for displaying user info in app

**`email`**
- Get user's email address
- Used for account identification

**Important**: These scopes are for authentication (logging in), NOT for Gmail access.

---

**Document Version**: 1.0
**Last Updated**: November 10, 2025
**Status**: Complete and Current
