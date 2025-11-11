# Gmail Integration Testing Guide

## 🎯 Overview

This guide helps you test the Gmail integration OAuth flow end-to-end to ensure users can connect their Gmail accounts for email task capture.

**IMPORTANT**: Gmail integration is **separate** from Google Sign-In:
- **Google Sign-In**: Authentication to log into the app (scopes: `openid`, `profile`, `email`)
- **Gmail Integration**: Provider connection to access Gmail emails (scopes: `gmail.readonly`, `gmail.modify`, `userinfo.email`)

---

## ✅ Prerequisites

### 1. Backend Configuration

Verify `.env` file has Google OAuth credentials:

```bash
# Backend .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**To check if configured:**
```bash
# From project root
grep GOOGLE_CLIENT .env
```

### 2. Google Cloud Console Setup

Verify in Google Cloud Console:

1. **APIs Enabled**:
   - Gmail API ✓
   - Google OAuth2 API ✓

2. **OAuth Redirect URIs include:**:
   - `http://localhost:8000/api/v1/integrations/gmail/callback` (development)
   - `http://YOUR-IP:8000/api/v1/integrations/gmail/callback` (mobile testing)

3. **OAuth Scopes Configured**:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/userinfo.email`

### 3. Mobile App Running

```bash
# Start mobile app
cd mobile
npm start

# Or use the provided script
./START_MOBILE_APP.sh
```

### 4. Backend Running

```bash
# From project root
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🧪 Testing Steps

### Step 1: Verify Backend Health

```bash
# Test backend is running
curl http://localhost:8000/api/v1/integrations/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "provider_integrations",
#   "version": "1.0.0"
# }
```

### Step 2: Verify Authentication

1. **Log into mobile app** (if not already logged in)
2. **Check console logs** for auth token
3. **Verify you can access authenticated endpoints**:

```bash
# Test with your auth token
curl http://localhost:8000/api/v1/integrations/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: 200 OK with list of integrations (may be empty)
```

### Step 3: Test OAuth Initiation (Backend)

```bash
# Test backend OAuth endpoint directly
curl -X POST "http://localhost:8000/api/v1/integrations/gmail/authorize?mobile=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

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

### Step 4: Test Gmail Connect Button (Mobile App)

1. **Open mobile app**
2. **Navigate to** Capture → Connect tab
3. **Open browser console/debugger**:
   - Chrome DevTools (web)
   - React Native Debugger (iOS/Android)
   - Expo DevTools console

4. **Click "Connect" on Gmail button**

5. **Watch console logs** for the OAuth flow:

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

### Step 5: Verify OAuth Browser Opens

**Expected behavior:**
1. OAuth browser window opens
2. Google OAuth consent screen appears
3. Shows app name and requested permissions
4. Permissions include:
   - "View your email messages and settings"
   - "Manage your email"

**If browser doesn't open:**
- Check console for errors
- Verify WebBrowser is configured
- Check network connectivity

### Step 6: Grant Permissions

1. **Sign in to Google** (if not already)
2. **Review permissions** requested
3. **Click "Allow"** to grant access

**Important**: You may need to grant permissions even if already signed in via Google Sign-In, because Gmail integration requests DIFFERENT scopes.

### Step 7: Verify OAuth Callback

**Watch console logs for:**

```
[Gmail Connect] WebBrowser result: {
  type: 'success',
  url: 'proxyagent://oauth/callback?success=true&integration_id=...'
}

[Deep Link] Received URL: proxyagent://oauth/callback?success=true&integration_id=...&provider=gmail
[Deep Link] Parsed path: oauth/callback
[Deep Link] Query params: { success: 'true', integration_id: '...', provider: 'gmail' }
[Deep Link] OAuth callback params: { success: 'true', integration_id: '...', provider: 'gmail' }
[Deep Link] Gmail OAuth succeeded, integration_id: ...

[Load Integrations] Starting...
[Load Integrations] Fetching from backend...
[Load Integrations] Received integrations: [...]
[Load Integrations] Gmail integration: { integration_id: '...', status: 'connected', ... }
```

**Expected UI behavior:**
1. Alert shows "Gmail connected successfully!"
2. Gmail button changes from "Connect" to "Connected"
3. Email address appears below "Gmail" label
4. Status icon changes to green checkmark

### Step 8: Verify Integration Persists

1. **Close and reopen app**
2. **Navigate to** Capture → Connect
3. **Gmail should still show "Connected"**
4. **Email address should be displayed**

---

## 🐛 Troubleshooting

### Issue: Button click does nothing

**Symptoms:**
- No console logs appear
- No errors shown
- Button appears unresponsive

**Solution:**
- Check for React errors in console
- Verify ConnectionElement props are correct
- Check if button handler is attached
- Restart mobile app

### Issue: Console shows "No refresh token available"

**Symptoms:**
```
apiClient.ts:47 No refresh token available
```

**Solution:**
- This is expected if you just fixed the OAuth endpoint
- Log out and log back in via Google OAuth
- New login will receive refresh tokens

### Issue: Backend returns 401 Unauthorized

**Symptoms:**
```
POST http://localhost:8000/api/v1/integrations/gmail/authorize 401 (Unauthorized)
```

**Solution:**
- Access token expired
- App should auto-refresh (check previous fix)
- If refresh fails, log out and log back in

### Issue: OAuth browser shows "Invalid redirect URI"

**Symptoms:**
- Google OAuth page shows error
- "Error 400: redirect_uri_mismatch"

**Solution:**
1. Check backend `.env` has correct redirect URI
2. Verify Google Cloud Console has redirect URI configured:
   - Development: `http://localhost:8000/api/v1/integrations/gmail/callback`
   - Mobile: `http://YOUR-IP:8000/api/v1/integrations/gmail/callback`
3. Ensure `?mobile=true` parameter doesn't break redirect URI

### Issue: OAuth succeeds but no callback received

**Symptoms:**
- Google OAuth completes successfully
- Browser redirects but app doesn't receive callback
- No deep link logs in console

**Solution:**
1. Verify `proxyagent://` deep link is registered
2. Check `app.json` has correct scheme
3. Test deep link manually:
   ```bash
   # iOS Simulator
   xcrun simctl openurl booted "proxyagent://oauth/callback?success=true&provider=gmail"

   # Android Emulator
   adb shell am start -W -a android.intent.action.VIEW -d "proxyagent://oauth/callback?success=true&provider=gmail"
   ```

### Issue: "Gmail OAuth not configured" error

**Symptoms:**
```
HTTPException: Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
```

**Solution:**
1. Add credentials to backend `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-secret
   ```
2. Restart backend server
3. Verify credentials are loaded:
   ```bash
   # Check backend logs on startup
   # Should show OAuth providers registered
   ```

### Issue: Authorization URL doesn't include Gmail scopes

**Symptoms:**
Console warning:
```
[Gmail Connect] Warning: Authorization URL may not include Gmail scopes
```

**Solution:**
- Check backend Gmail provider configuration
- Verify `src/integrations/providers/google.py` has correct scopes
- Backend should request: `gmail.readonly`, `gmail.modify`, `userinfo.email`

---

## 📊 Success Checklist

- [ ] Backend health check passes
- [ ] Backend OAuth initiation works (returns authorization_url)
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
- [ ] Backend shows integration in database

---

## 🔍 Advanced Debugging

### Enable Detailed Backend Logs

```python
# In src/api/main.py or src/integrations/service.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Backend Integration Database

```bash
# If using SQLite
sqlite3 proxy_agents_enhanced.db

# List integrations
SELECT * FROM integrations;

# Check for Gmail integration
SELECT * FROM integrations WHERE provider = 'gmail';
```

### Monitor Network Requests

**In Chrome DevTools (web):**
1. Open DevTools → Network tab
2. Filter by "gmail" or "integrations"
3. Watch for:
   - POST `/api/v1/integrations/gmail/authorize`
   - GET `/api/v1/integrations/`

**In React Native Debugger:**
1. Enable Network Inspector
2. Watch for backend API calls

### Test OAuth Scopes

After connecting, verify granted scopes:

```bash
# Get integration details
curl http://localhost:8000/api/v1/integrations/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.[] | select(.provider == "gmail")'

# Should show:
# {
#   "integration_id": "...",
#   "provider": "gmail",
#   "status": "connected",
#   "provider_username": "you@gmail.com",
#   "sync_enabled": true,
#   ...
# }
```

---

## 📝 Next Steps After Successful Connection

1. **Test Gmail sync**: Trigger manual sync to fetch emails
2. **Test task generation**: Verify emails generate task suggestions
3. **Test disconnect**: Disconnect and reconnect Gmail
4. **Test multiple profiles**: Connect Gmail to different profiles
5. **Test token refresh**: Wait for token to expire and verify refresh works

---

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check console logs** for detailed error messages
2. **Check backend logs** for server-side errors
3. **Verify all prerequisites** are met
4. **Try the debugging commands** in this guide
5. **Share console logs** and error messages for support

---

## 📚 Related Documentation

- `OAUTH_REFRESH_TOKEN_FIX.md` - OAuth refresh token implementation
- `GOOGLE_OAUTH_SETUP.md` - Initial Google OAuth setup guide
- `REFRESH_TOKEN_IMPLEMENTATION.md` - Token refresh system details
