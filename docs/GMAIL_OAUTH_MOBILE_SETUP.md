# Gmail OAuth Mobile Setup Guide

## Overview

This guide explains how to set up and test Gmail OAuth authentication for the mobile app at `http://localhost:8081/capture/connect`.

## Architecture

The implementation uses a **hybrid approach**:
- **Backend**: Existing integrations API (`src/api/routes/integrations.py`)
- **OAuth Flow**: Standard backend callback with mobile deep link redirect
- **Credentials**: `.env` variables instead of `credentials.json`

## Prerequisites

1. **Google Cloud Project** with Gmail API enabled
2. **OAuth 2.0 Client ID** and **Client Secret**
3. **Authorized redirect URI** configured in Google Cloud Console

---

## Step 1: Set Up Google OAuth Credentials

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**:
   - Navigate to **APIs & Services** → **Library**
   - Search for "Gmail API"
   - Click **Enable**

### 1.2 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure OAuth consent screen (if not done):
   - User Type: **External** (for testing)
   - App name: **Proxy Agent Platform**
   - User support email: Your email
   - Authorized domains: Leave empty for localhost testing
   - Scopes: Add Gmail scopes (`gmail.readonly`, `gmail.modify`)
4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Proxy Agent Backend**
   - Authorized redirect URIs:
     ```
     http://localhost:8000/api/v1/integrations/gmail/callback
     ```
5. Click **Create** and save the:
   - **Client ID** (ends with `.apps.googleusercontent.com`)
   - **Client Secret**

---

## Step 2: Configure Environment Variables

### 2.1 Update `.env` File

Add the following to your `.env` file:

```bash
# Gmail OAuth Configuration (for provider integrations)
GMAIL_CLIENT_ID=YOUR-CLIENT-ID.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=YOUR-CLIENT-SECRET
GMAIL_REDIRECT_URI=http://localhost:8000/api/v1/integrations/gmail/callback

# Integration Token Encryption
INTEGRATION_ENCRYPTION_KEY=YOUR-FERNET-KEY-BASE64
```

### 2.2 Generate Encryption Key

Run this Python script to generate a Fernet encryption key:

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copy the output and paste it as `INTEGRATION_ENCRYPTION_KEY` in `.env`.

---

## Step 3: Verify Code Implementation

The following files have been updated to support Gmail OAuth:

### Backend Changes

1. **`.env`** - Gmail OAuth credentials added
2. **`src/api/routes/integrations.py`**:
   - `authorize_provider` endpoint now supports `?mobile=true` parameter
   - `oauth_callback` endpoint redirects to mobile deep link when `mobile=true`

### Mobile Changes

3. **`mobile/src/api/config.ts`** (new) - API base URL configuration
4. **`mobile/src/api/integrations.ts`** (new) - Integration API client
5. **`mobile/app/(tabs)/capture/connect.tsx`** - OAuth flow implementation
6. **`mobile/app.json`** - Deep link scheme (`proxyagent://`) added

---

## Step 4: Run the Application

### 4.1 Start Backend

```bash
cd /path/to/Proxy-Agent-Platform
uv run uvicorn src.main:app --reload --port 8000
```

Verify backend is running:
```bash
curl http://localhost:8000/api/v1/integrations/health
# Should return: {"status":"healthy","service":"provider_integrations","version":"1.0.0"}
```

### 4.2 Start Mobile App

```bash
cd mobile
npm start
```

The app should start on port 8081. Open in your preferred simulator/device.

---

## Step 5: Test OAuth Flow

### 5.1 Navigate to Connect Screen

1. Open mobile app: `http://localhost:8081`
2. Navigate to: **Capture** tab → **Connect** screen
3. You should see:
   - Gmail connection with status "disconnected"
   - SMTP Email connection (coming soon)

### 5.2 Initiate Gmail OAuth

1. Tap **"Connect"** on the Gmail row
2. Status should change to "connecting"
3. Browser window should open with Google OAuth consent screen

### 5.3 Complete OAuth Flow

1. **Sign in** to your Google account (if not signed in)
2. **Grant permissions** for Gmail access
3. **Review scopes**:
   - Read emails
   - Modify email labels
   - Send emails (optional)
4. Click **Allow**

### 5.4 Verify Redirect

After authorization:
1. Browser should redirect to: `proxyagent://oauth/callback?success=true&integration_id=...&provider=gmail`
2. Mobile app should catch the deep link
3. Alert should show: **"Success - Gmail connected successfully!"**
4. Connection status should update to **"connected"**
5. Your Gmail address should appear below the connection name

---

## Step 6: Verify Backend Storage

### 6.1 Check Database

```bash
sqlite3 proxy_agents_enhanced.db
```

```sql
-- List all integrations
SELECT
    integration_id,
    user_id,
    provider,
    status,
    provider_username,
    connected_at
FROM user_integrations;

-- You should see your Gmail integration with status='connected'
```

### 6.2 Test API Endpoints

```bash
# List integrations (replace USER_ID)
curl "http://localhost:8000/api/v1/integrations/?user_id=YOUR_USER_ID"

# Should return:
# [
#   {
#     "integration_id": "...",
#     "provider": "gmail",
#     "status": "connected",
#     "provider_username": "your-email@gmail.com",
#     "sync_enabled": false,
#     "connected_at": "2025-11-02T..."
#   }
# ]
```

---

## Step 7: Test Disconnection

1. Long-press or tap on connected Gmail row
2. Tap **"Disconnect"** (if UI supports it) or modify `connect.tsx` to add disconnect button
3. Confirm disconnect alert
4. Status should change to "disconnected"
5. Email should disappear

---

## Troubleshooting

### Issue: "Provider not configured" error

**Solution**: Verify `.env` variables are set correctly:
```bash
# Check if variables are loaded
uv run python -c "import os; print(os.getenv('GMAIL_CLIENT_ID'))"
```

If empty, restart backend after updating `.env`.

---

### Issue: OAuth consent screen shows "App not verified"

**Solution**: This is normal for development. Click **"Advanced"** → **"Go to Proxy Agent Platform (unsafe)"**.

For production, submit app for verification in Google Cloud Console.

---

### Issue: "Redirect URI mismatch" error

**Solution**:
1. Go to Google Cloud Console → **Credentials** → Your OAuth Client
2. Verify authorized redirect URI exactly matches:
   ```
   http://localhost:8000/api/v1/integrations/gmail/callback
   ```
3. Note: No trailing slash, exact URL match required

---

### Issue: Deep link not working (app doesn't open after OAuth)

**Solution**:

**iOS Simulator**:
```bash
# Register URL scheme
xcrun simctl openurl booted "proxyagent://oauth/callback?success=true"
```

**Android Emulator**:
```bash
adb shell am start -a android.intent.action.VIEW -d "proxyagent://oauth/callback?success=true"
```

**Web**: Deep links don't work in web browser. Use physical device or simulator.

---

### Issue: "Integration not found" after OAuth

**Solution**: Check backend logs for errors during token exchange:
```bash
# Backend should log:
# INFO: Generated OAuth URL for gmail (user: YOUR_USER_ID)
# INFO: OAuth callback received for gmail
# INFO: Integration created: integration_id=...
```

If missing, check:
1. `GMAIL_CLIENT_SECRET` is correct
2. OAuth flow completed successfully
3. Database write permissions

---

### Issue: Mobile app can't reach backend API

**Solution**: Update API URL in mobile app:

**iOS Simulator**: Use `http://localhost:8000`
**Android Emulator**: Use `http://10.0.2.2:8000`
**Physical Device**: Use your computer's local IP (e.g., `http://192.168.1.100:8000`)

Edit `mobile/src/api/config.ts`:
```typescript
export const API_BASE_URL = 'http://192.168.1.100:8000'; // Your machine's IP
```

---

## OAuth Flow Diagram

```
Mobile App (port 8081)
    |
    | 1. User taps "Connect Gmail"
    |
    v
POST /api/v1/integrations/gmail/authorize?mobile=true
    |
    | 2. Backend generates OAuth URL
    |
    v
{authorization_url: "https://accounts.google.com/o/oauth2/v2/auth?..."}
    |
    | 3. Mobile opens WebBrowser
    |
    v
Google OAuth Consent Screen
    |
    | 4. User grants permissions
    |
    v
GET /api/v1/integrations/gmail/callback?code=XXX&state=YYY&mobile=true
    |
    | 5. Backend exchanges code for tokens
    | 6. Backend saves integration to database
    |
    v
RedirectResponse(url="proxyagent://oauth/callback?success=true&integration_id=...")
    |
    | 7. Mobile app catches deep link
    |
    v
Mobile App: handleDeepLink()
    |
    | 8. Update UI to "connected"
    | 9. Show success alert
    | 10. Reload integrations from backend
    |
    v
Gmail Connected!
```

---

## Security Considerations

1. **Token Encryption**: Access/refresh tokens are encrypted using Fernet before storage
2. **State Parameter**: CSRF protection via random state token
3. **HTTPS Required**: For production, use HTTPS for all OAuth URLs
4. **Scope Minimization**: Only request necessary Gmail scopes
5. **Token Refresh**: Backend automatically refreshes expired tokens

---

## Next Steps

Once Gmail OAuth is working:

1. **Add Email Capture**: Implement task extraction from Gmail messages
2. **Add Sync**: Periodic background sync of emails
3. **Add Filters**: Let users configure which emails to process
4. **Add Notifications**: Notify when new tasks are created from emails
5. **Add SMTP**: Support manual SMTP email configuration

---

## API Reference

### POST `/api/v1/integrations/gmail/authorize`

**Query Parameters**:
- `user_id` (required): User identifier
- `mobile` (optional): Set to `true` for mobile deep link redirect

**Response**:
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "provider": "gmail",
  "message": "Visit the authorization URL to connect your account"
}
```

### GET `/api/v1/integrations/gmail/callback`

**Query Parameters**:
- `code` (required): Authorization code from Google
- `state` (required): CSRF state parameter
- `mobile` (optional): Redirect to mobile deep link if `true`

**Response**: Redirect to frontend or mobile deep link

### GET `/api/v1/integrations/`

**Query Parameters**:
- `user_id` (required): User identifier
- `provider` (optional): Filter by provider (`gmail`, `google_calendar`, etc.)

**Response**:
```json
[
  {
    "integration_id": "uuid-here",
    "provider": "gmail",
    "status": "connected",
    "provider_username": "user@gmail.com",
    "sync_enabled": false,
    "last_sync_at": null,
    "connected_at": "2025-11-02T01:23:45Z"
  }
]
```

### POST `/api/v1/integrations/{integration_id}/disconnect`

**Response**:
```json
{
  "success": true,
  "message": "Integration disconnected successfully",
  "integration_id": "uuid-here"
}
```

---

## Files Modified

### Backend
- ✅ `.env` - Added Gmail OAuth credentials
- ✅ `src/api/routes/integrations.py` - Mobile redirect support

### Mobile
- ✅ `mobile/src/api/config.ts` - API configuration (new)
- ✅ `mobile/src/api/integrations.ts` - Integration API client (new)
- ✅ `mobile/app/(tabs)/capture/connect.tsx` - OAuth flow implementation
- ✅ `mobile/app.json` - Deep link scheme configuration

---

## Success Checklist

- [ ] Google OAuth credentials configured in Google Cloud Console
- [ ] `.env` file updated with `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `INTEGRATION_ENCRYPTION_KEY`
- [ ] Backend running on port 8000
- [ ] Mobile app running on port 8081
- [ ] Can tap "Connect Gmail" and see browser open
- [ ] Can complete OAuth consent flow
- [ ] App catches deep link and shows "Gmail connected" alert
- [ ] Connection status shows "connected" with email address
- [ ] Backend database contains integration record
- [ ] Can disconnect Gmail successfully

---

## Support

If you encounter issues:
1. Check backend logs for errors
2. Verify `.env` variables are correct
3. Test API endpoints directly with `curl`
4. Check Google Cloud Console for OAuth errors
5. Review this guide's troubleshooting section

For additional help, file an issue with:
- Backend logs
- Mobile app console logs
- Steps to reproduce
- Screenshot of error (if applicable)
