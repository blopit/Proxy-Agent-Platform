# Google OAuth Redirect URI Fix - Mobile App

**Status**: ✅ Complete
**Date**: November 7, 2025

---

## Problem

Google Cloud Console was rejecting the custom URL scheme `proxyagent://auth/google` with the error:

```
Invalid Redirect: must end with a public top-level domain (such as .com or .org).
Invalid Redirect: must use a domain that is a valid top private domain.
```

**Root Cause**: Google OAuth doesn't accept arbitrary custom URL schemes. Mobile apps must use the **reversed client ID** format, which is Google's official standard for iOS and Android OAuth redirects.

---

## Solution Implemented

### Reversed Client ID Format

Google requires mobile apps to use the reversed client ID as the redirect URI scheme:

**Your Google Client ID**:
```
YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com
```

**Reversed Client ID** (URL Scheme):
```
com.googleusercontent.apps.YOUR-CLIENT-ID
```

**Complete Redirect URI**:
```
com.googleusercontent.apps.YOUR-CLIENT-ID:/oauth2redirect
```

This is the **official Google OAuth standard** for mobile apps on both iOS and Android.

---

## Changes Made

### 1. Updated OAuth Service (`src/services/oauthService.ts`)

**Added reversed client ID calculation**:
```typescript
// Google reversed client ID for iOS (official Google OAuth redirect URI format)
const GOOGLE_REVERSED_CLIENT_ID = GOOGLE_CLIENT_ID
  ? `com.googleusercontent.apps.${GOOGLE_CLIENT_ID.split('.')[0]}`
  : '';
```

**Updated redirect URI**:
```typescript
const GOOGLE_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  // Official Google OAuth redirect URI for mobile apps
  redirectUri: `${GOOGLE_REVERSED_CLIENT_ID}:/oauth2redirect`,
  scopes: ['openid', 'profile', 'email'],
};
```

### 2. Updated iOS Configuration (`app.json`)

**Added reversed client ID to iOS URL schemes**:
```json
{
  "ios": {
    "bundleIdentifier": "com.proxyagent.app",
    "infoPlist": {
      "CFBundleURLTypes": [
        {
          "CFBundleURLSchemes": [
            "proxyagent",
            "com.googleusercontent.apps.YOUR-CLIENT-ID"
          ]
        }
      ]
    }
  }
}
```

### 3. Updated Android Configuration (`app.json`)

**Added intent filters for OAuth redirects**:
```json
{
  "android": {
    "package": "com.proxyagent.app",
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "proxyagent"
          },
          {
            "scheme": "com.googleusercontent.apps.YOUR-CLIENT-ID"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

---

## Google Cloud Console Configuration

### Step 1: Open OAuth Client Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID: `YOUR-CLIENT-ID`

### Step 2: Add the Redirect URI

Under **Authorized redirect URIs**, add:

```
com.googleusercontent.apps.YOUR-CLIENT-ID:/oauth2redirect
```

**Important Notes**:
- ✅ This URI WILL be accepted by Google (it's their official format)
- ✅ No domain validation errors
- ✅ Works for both iOS and Android
- ✅ The format is: `{REVERSED_CLIENT_ID}:/oauth2redirect`

### Step 3: Save Changes

Click **Save** at the bottom of the page.

---

## Testing the OAuth Flow

### Prerequisites

1. ✅ Backend API running on `http://192.168.1.101:8000` (or update `EXPO_PUBLIC_API_BASE_URL` in `.env`)
2. ✅ Google OAuth credentials configured in backend `.env`
3. ✅ Mobile app `.env` has correct Google Client ID
4. ✅ Redirect URI added to Google Cloud Console (see above)

### Test Steps

#### 1. Start the Mobile App

```bash
cd mobile

# For iOS Simulator
npm start
# Then press 'i'

# For Android Emulator
npm start
# Then press 'a'

# For Physical Device
npm start
# Then scan QR code with Expo Go app
```

#### 2. Test Google Sign-In

1. Open the app (should show Signup screen)
2. Tap **"Continue with Google"** button
3. **Expected**: Browser/WebView opens with Google login page
4. Sign in with your Google account
5. **Expected**: Google redirects to the reversed client ID scheme
6. **Expected**: App captures the redirect and extracts authorization code
7. **Expected**: App sends code to backend for token exchange
8. **Expected**: Backend returns JWT token
9. **Expected**: You're logged into the app with your Google account

### Success Criteria

- ✅ Google OAuth consent screen appears
- ✅ User can authenticate with Google
- ✅ Redirect back to app works (no errors)
- ✅ Authorization code is extracted from redirect URL
- ✅ Backend receives code and returns JWT token
- ✅ User is successfully logged in

### Debugging

If issues occur:

1. **Check backend logs** for OAuth token exchange errors
2. **Check mobile console** for authorization code extraction
3. **Verify redirect URI** in Google Cloud Console matches exactly
4. **Check network tab** for API request/response
5. **Verify environment variables** are loaded (restart Expo dev server)

---

## Technical Details

### OAuth Flow Sequence

```
1. User taps "Continue with Google"
   ↓
2. App builds Google OAuth authorization URL
   ↓
3. WebBrowser.openAuthSessionAsync() opens Google login
   ↓
4. User authenticates with Google
   ↓
5. Google redirects to:
   com.googleusercontent.apps.YOUR-CLIENT-ID:/oauth2redirect?code=...
   ↓
6. iOS/Android captures the redirect (registered URL scheme)
   ↓
7. App extracts authorization code from redirect URL
   ↓
8. App sends code + redirect_uri to backend
   ↓
9. Backend exchanges code for Google access token
   ↓
10. Backend fetches user profile from Google
   ↓
11. Backend creates/updates user in database
   ↓
12. Backend returns JWT token to app
   ↓
13. App stores token and logs user in
```

### Why This Approach Works

**iOS**:
- The reversed client ID is registered in `Info.plist` as a URL scheme
- When Google redirects, iOS recognizes the URL scheme and opens the app
- The app captures the full redirect URL with the authorization code

**Android**:
- The reversed client ID is registered as an intent filter
- When Google redirects, Android recognizes the scheme and opens the app
- The app captures the full redirect URL with the authorization code

**Google OAuth Standard**:
- This is the **official** Google OAuth approach for mobile apps
- Documented in [Google OAuth 2.0 for iOS & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- Used by all major mobile apps that implement Google Sign-In
- No custom backend proxy needed

---

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| **iOS** | ✅ Fully Supported | Uses reversed client ID (official Google standard) |
| **Android** | ✅ Supported (Dev) | Uses reversed client ID for development |
| **Android Production** | ⚠️ Deprecated | Google recommends migrating to [Credential Manager API](https://developers.google.com/identity/android-credential-manager) |
| **Web** | N/A | Would use standard HTTPS redirect |

### Android Production Note

As of 2025, Google has deprecated custom URI schemes for production Android apps due to security concerns. For production Android builds, you should migrate to:

1. **Google Identity Services** - Credential Manager API
2. **App Links** - HTTPS-based redirects with domain verification
3. **Native Google Sign-In SDK** - `@react-native-google-signin/google-signin`

However, the reversed client ID approach still works for:
- Development/testing
- iOS apps (fully supported)
- Android in dev mode

---

## Related Files

| File | Purpose |
|------|---------|
| `src/services/oauthService.ts` | OAuth authentication service with reversed client ID |
| `app.json` | iOS URL schemes and Android intent filters |
| `src/api/config.ts` | API configuration constants |
| `.env` | Google OAuth credentials |
| `OAUTH_FIX_COMPLETE.md` | Previous OAuth API migration documentation |

---

## References

### Google Documentation

- [OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios/start-integrating)
- [Reversed Client ID Format](https://github.com/openid/AppAuth-iOS/blob/master/Examples/README-Google.md)

### Expo Documentation

- [expo-auth-session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [expo-web-browser](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Authentication Guide](https://docs.expo.dev/guides/authentication/)

---

## Summary

✅ **Fixed**: Google OAuth redirect URI now uses the official reversed client ID format
✅ **iOS**: Fully configured with URL schemes
✅ **Android**: Configured with intent filters (development)
✅ **Google Console**: Clear instructions for adding redirect URI
✅ **Ready to test**: Complete OAuth flow should work end-to-end

The mobile app is now properly configured to work with Google OAuth using the official Google-recommended approach for mobile applications!
