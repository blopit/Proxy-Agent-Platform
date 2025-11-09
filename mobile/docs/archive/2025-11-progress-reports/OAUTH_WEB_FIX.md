# OAuth Web Redirect URI Fix

## Problem
Getting "Error 400: redirect_uri_mismatch" when trying to sign in with Google on web.

## Root Cause
The web app is running on `http://localhost:8081` but Google Cloud Console doesn't have this redirect URI registered.

## Solution

### Step 1: Check Current Redirect URI
1. Open the web app: http://localhost:8081
2. Open browser console (F12 → Console tab)
3. Try to sign in with Google
4. Look for log message: `[OAuth Config] Generated web redirect URI:`
5. Note the exact redirect URI being generated

### Step 2: Add Redirect URI to Google Cloud Console

1. **Go to Google Cloud Console:**
   - URL: https://console.cloud.google.com/apis/credentials
   - Select your project

2. **Edit OAuth 2.0 Client ID:**
   - Find: `Web client 1` or your OAuth client ID
   - Client ID: `YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com`
   - Click the "Edit" (pencil) icon

3. **Add Authorized Redirect URIs:**
   Add ALL of the following URIs:
   ```
   http://localhost:8081
   http://localhost:8081/
   http://localhost:19006
   http://localhost:19006/
   https://auth.expo.io/@your-username/proxy-agent-platform
   ```

4. **Save Changes:**
   - Click "Save" at the bottom
   - Wait 5-10 seconds for changes to propagate

### Step 3: Test Again
1. Refresh the web app (Cmd/Ctrl + R)
2. Try signing in with Google again
3. It should work now!

## Common Issues

### Issue: Still getting redirect_uri_mismatch
**Solution:**
- Wait 1-2 minutes after saving in Google Console
- Clear browser cache (Cmd/Ctrl + Shift + R)
- Check that the redirect URI in console exactly matches what you added

### Issue: Different port number
**Solution:**
- If Expo is running on a different port, add that port's redirect URI
- Check the terminal output when you ran `npx expo start`
- Add `http://localhost:[PORT]` and `http://localhost:[PORT]/` to Google Console

## Quick Reference

**Google Cloud Console:** https://console.cloud.google.com/apis/credentials

**Required Redirect URIs:**
- Development Web: `http://localhost:8081/`
- Development Expo: `http://localhost:19006/`
- Production: Your deployed URL

**Client ID:** `YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com`

## Verification

After adding redirect URIs, verify they're saved:
1. Go back to OAuth credentials page
2. Click on your OAuth client
3. Verify all redirect URIs are listed under "Authorized redirect URIs"

---

**Last Updated:** 2025-11-07
**Status:** Ready to test
