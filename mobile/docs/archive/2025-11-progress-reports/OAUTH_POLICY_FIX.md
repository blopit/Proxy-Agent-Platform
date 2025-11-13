# Google OAuth 2.0 Policy Compliance Fix

## Current Error
```
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
Request details: redirect_uri=http://localhost:8081
```

## Root Cause
The OAuth client is likely configured as a "Desktop app" or "iOS app" instead of "Web application" for the web redirect URI.

## Solution Options

### Option 1: Create a New Web Application OAuth Client (Recommended)

1. **Go to Google Cloud Console:**
   - URL: https://console.cloud.google.com/apis/credentials
   - Make sure you're in the correct project

2. **Create New OAuth Client:**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "OAuth client ID"
   - Application type: **"Web application"**
   - Name: "Proxy Agent Web Client"

3. **Configure Authorized Redirect URIs:**
   Add these URIs:
   ```
   http://localhost:8081
   http://localhost:8081/
   http://localhost:19006
   http://localhost:19006/
   ```

4. **Save and Get Credentials:**
   - Click "CREATE"
   - Copy the new **Client ID**
   - Copy the **Client Secret**
   - Click "OK"

5. **Update Your .env File:**
   Edit `/mobile/.env`:
   ```bash
   # Replace with your NEW web client credentials
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_NEW_WEB_CLIENT_ID_HERE
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET=YOUR_NEW_WEB_CLIENT_SECRET_HERE
   ```

6. **Update oauthService.ts:**
   We need to modify the OAuth service to use different client IDs for web vs native.

### Option 2: Add Web Redirect URIs to Existing Client

If your current client is a "Desktop app" or "iOS app":

1. **Create Additional Web Client:**
   - Desktop/iOS clients cannot have `http://localhost` redirect URIs
   - You MUST create a separate "Web application" client (see Option 1)

2. **Use Platform-Specific Clients:**
   - Web: Use Web application client ID
   - iOS/Android: Use iOS/Android application client ID

## Implementation: Platform-Specific Client IDs

We need to update the OAuth service to use different credentials per platform:

### 1. Update .env File

```bash
# Google OAuth - WEB CLIENT (for browser)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET=your-web-client-secret

# Google OAuth - NATIVE CLIENT (for iOS/Android)
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=your-native-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 2. Update app.json

Add web client ID to extra config:
```json
{
  "expo": {
    "extra": {
      "googleWebClientId": "${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID}",
      "googleNativeClientId": "${EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID}"
    }
  }
}
```

## Verification Steps

After creating the web client:

1. **Verify Client Type:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - You should see TWO OAuth clients:
     - One "Web application" (for localhost:8081)
     - One "iOS" or "Desktop" (for mobile apps)

2. **Check Redirect URIs:**
   - Web client should have: `http://localhost:8081/`
   - Native client should have: `com.googleusercontent.apps.YOUR-CLIENT-ID:/oauth/callback`

3. **Test:**
   - Restart the dev server
   - Try Google Sign In on web
   - It should now work!

## Quick Start Commands

```bash
# 1. Stop current dev server
# Press Ctrl+C in the terminal running expo

# 2. Update .env with new web client credentials

# 3. Restart dev server
cd mobile
npx expo start
```

## Common Issues

### "Invalid client" error
- Make sure you copied the correct Client ID for web
- Check that .env has the right variable name

### Still getting policy error
- Verify the OAuth client type is "Web application"
- Check that redirect URIs are exactly: `http://localhost:8081/`
- Clear browser cache and try again

### "Origin mismatch" error
- The origin must match the redirect URI domain
- Use `http://localhost:8081` not `http://127.0.0.1:8081`

## Next Steps

1. Create Web Application OAuth client in Google Console
2. Update `.env` with new web client credentials
3. Update `oauthService.ts` to use platform-specific client IDs
4. Restart dev server
5. Test OAuth flow

---

**Status:** Waiting for web client creation
**Last Updated:** 2025-11-07
