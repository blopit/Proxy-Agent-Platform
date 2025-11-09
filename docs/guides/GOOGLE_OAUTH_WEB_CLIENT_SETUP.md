# Google OAuth Web Client Setup - Step by Step

## Problem
Current OAuth client doesn't support `http://localhost` redirect URIs needed for web development.

**Error:** "You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy."

## Solution
Create a separate "Web application" OAuth client for web development.

---

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/apis/credentials
2. Make sure you're in the correct project
3. You should see your existing OAuth client listed

### Step 2: Create New OAuth Client ID

1. **Click the "+ CREATE CREDENTIALS" button** (at the top of the page)
2. **Select "OAuth client ID"** from the dropdown
3. **Application type:** Select **"Web application"** (IMPORTANT!)
4. **Name:** Enter `Proxy Agent Web Client`

### Step 3: Configure Authorized URIs

Under **"Authorized JavaScript origins"** (Optional):
```
http://localhost:8081
http://localhost:19006
```

Under **"Authorized redirect URIs"** (REQUIRED):
```
http://localhost:8081
http://localhost:8081/
http://localhost:19006
http://localhost:19006/
```

**Click "+ ADD URI" for each one**

### Step 4: Create and Save

1. **Click "CREATE"** button at the bottom
2. A popup will appear with your credentials:
   - **Client ID** - Copy this!
   - **Client Secret** - Copy this!
3. **Click "OK"**

### Step 5: Update Your Environment Files

#### Update Backend .env

Edit `/Users/shrenilpatel/Github/Proxy-Agent-Platform/.env`:

Add or update these lines:
```bash
# Google OAuth - Web Client (for web browser)
GOOGLE_WEB_CLIENT_ID=YOUR_NEW_WEB_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_SECRET=YOUR_NEW_WEB_CLIENT_SECRET_HERE
```

#### Update Mobile .env

Edit `/Users/shrenilpatel/Github/Proxy-Agent-Platform/mobile/.env`:

Add these lines:
```bash
# Google OAuth - Web Client (for browser)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_NEW_WEB_CLIENT_ID_HERE.apps.googleusercontent.com

# Google OAuth - Native Client (for iOS/Android)
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com
```

**Keep the existing EXPO_PUBLIC_GOOGLE_CLIENT_ID** for backward compatibility.

### Step 6: Update Backend OAuth Route

The backend needs to accept the new web client credentials. Edit the OAuth route to handle both web and native clients.

### Step 7: Restart Everything

```bash
# Stop the Expo dev server (Ctrl+C in terminal)

# Stop the backend server
lsof -ti:8000 | xargs kill

# Restart backend
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform
uv run uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload &

# Restart Expo
cd mobile
npx expo start
```

### Step 8: Test

1. **Open browser:** http://localhost:8081
2. **Click "Sign in with Google"**
3. **Check browser console** (F12 → Console) for debug logs:
   - Should show: `[OAuth Config] Platform: web`
   - Should show: `[OAuth Config] Web Client ID: YOUR_WEB_CLIENT_ID`
   - Should show: `[OAuth Config] Generated web redirect URI: http://localhost:8081`
4. **Complete OAuth flow** - Should work now!

---

## Verification Checklist

After setup, verify:

- [ ] Created new "Web application" OAuth client in Google Console
- [ ] Added redirect URIs: `http://localhost:8081/` and `http://localhost:19006/`
- [ ] Copied Client ID and Client Secret
- [ ] Updated backend `.env` with web client credentials
- [ ] Updated mobile `.env` with `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- [ ] Restarted both backend and Expo dev servers
- [ ] Browser console shows correct client ID and redirect URI
- [ ] OAuth flow completes successfully

---

## Your OAuth Clients Summary

After completing this setup, you should have:

### 1. iOS/Native OAuth Client
- **Client ID:** `YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com`
- **Type:** iOS or Desktop application
- **Used for:** iOS and Android apps
- **Redirect URI:** Custom scheme (e.g., `com.googleusercontent.apps.765534073366-98ffgpadh021rmhktv4l16lbnaih12t6:/oauth/callback`)

### 2. Web OAuth Client (NEW)
- **Client ID:** `[Your new web client ID].apps.googleusercontent.com`
- **Type:** Web application
- **Used for:** Web browser (localhost development)
- **Redirect URIs:** `http://localhost:8081/`, `http://localhost:19006/`

---

## Troubleshooting

### "Invalid client" error
**Solution:**
- Double-check the Client ID in `.env` matches what Google Console shows
- Make sure there are no extra spaces or quotes

### Still getting "doesn't comply with policy"
**Solution:**
- Verify the OAuth client type is **"Web application"** not "iOS" or "Desktop"
- Check that redirect URIs include `http://localhost:8081/` exactly
- Clear browser cache (Cmd/Ctrl + Shift + R)

### "redirect_uri_mismatch" error
**Solution:**
- The redirect URI in Google Console must **exactly** match
- Check browser console for what URI is being sent
- Make sure to include both `http://localhost:8081` and `http://localhost:8081/`

### Environment variables not loading
**Solution:**
```bash
# Stop Expo
# Edit .env file
# Restart Expo with cache clear
cd mobile
npx expo start -c
```

---

## Quick Reference

**Google Cloud Console:** https://console.cloud.google.com/apis/credentials

**Required Files to Edit:**
1. `/Users/shrenilpatel/Github/Proxy-Agent-Platform/.env` (backend)
2. `/Users/shrenilpatel/Github/Proxy-Agent-Platform/mobile/.env` (frontend)

**Restart Commands:**
```bash
# Backend
lsof -ti:8000 | xargs kill
uv run uvicorn src.api.main:app --reload --port 8000 &

# Frontend
cd mobile && npx expo start -c
```

---

**Status:** Ready to create web client
**Last Updated:** 2025-11-07
**Estimated Time:** 5-10 minutes
