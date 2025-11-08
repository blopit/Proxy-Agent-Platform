# Google OAuth Mobile App Setup Guide

**Issue**: Web OAuth client rejects custom URI schemes
**Solution**: Create separate iOS and Android OAuth clients

---

## Problem

The current OAuth client (`765534073366-98ffgpadh021rmhktv4l16lbnaih12t6`) is a **Web** client type, which requires `http` or `https` redirect URIs. It rejects custom URI schemes with:

```
Invalid Redirect: must use either http or https as the scheme.
```

**For mobile apps, you need separate iOS and Android OAuth clients.**

---

## Solution: Create Mobile OAuth Clients

### Option 1: iOS OAuth Client (Recommended for iOS)

#### 1. Create iOS OAuth Client

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: **iOS**
4. Fill in:
   - **Name**: `Proxy Agent iOS`
   - **Bundle ID**: `com.proxyagent.app` (from `mobile/app.json`)
   - **Team ID**: Your Apple Developer Team ID (optional for development)
5. Click **CREATE**

#### 2. Copy the iOS Client ID

Google will generate a new Client ID. It will look like:
```
123456789-abcdefgh.apps.googleusercontent.com
```

**Important**: The iOS OAuth client automatically supports the reversed client ID redirect URI. You don't manually configure redirect URIs.

#### 3. Update Mobile App

Update `mobile/.env`:
```bash
# iOS OAuth Client
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com
```

---

### Option 2: Android OAuth Client (Recommended for Android)

#### 1. Get SHA-1 Fingerprint

For development, get the debug keystore SHA-1:

```bash
# Development keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Look for SHA1 fingerprint:
# SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:00:AA:BB:CC:DD
```

#### 2. Create Android OAuth Client

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: **Android**
4. Fill in:
   - **Name**: `Proxy Agent Android`
   - **Package name**: `com.proxyagent.app` (from `mobile/app.json`)
   - **SHA-1 certificate fingerprint**: Your SHA-1 from step 1
5. Click **CREATE**

#### 3. Copy the Android Client ID

Google will generate a new Client ID.

#### 4. Update Mobile App

Update `mobile/.env`:
```bash
# Android OAuth Client
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com
```

---

### Option 3: Keep Web Client (Development Only)

For development with Expo, you can keep using the Web client with a localhost redirect URI.

#### Update OAuth Service

Edit `mobile/src/services/oauthService.ts`:

```typescript
const GOOGLE_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  // For development with Web OAuth client, use localhost
  redirectUri: 'http://127.0.0.1',
  scopes: ['openid', 'profile', 'email'],
};
```

#### Add to Google Cloud Console

Add this redirect URI to your Web OAuth client:
```
http://127.0.0.1
```

**Limitations**:
- ⚠️ Only works for development
- ⚠️ May not work on physical devices
- ⚠️ Not recommended for production

---

## Recommended Approach: Separate Clients

The best approach is to create separate OAuth clients for each platform:

```typescript
// mobile/src/services/oauthService.ts

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get platform-specific client ID
const getGoogleClientId = () => {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.extra?.googleIosClientId || '';
  } else if (Platform.OS === 'android') {
    return Constants.expoConfig?.extra?.googleAndroidClientId || '';
  }
  // Fallback to web client for web platform
  return Constants.expoConfig?.extra?.googleClientId || '';
};

const GOOGLE_CLIENT_ID = getGoogleClientId();

// Platform-specific redirect URI
const getRedirectUri = () => {
  if (Platform.OS === 'ios') {
    // iOS uses reversed client ID (automatically handled by iOS OAuth client)
    const reversedClientId = GOOGLE_CLIENT_ID
      ? `com.googleusercontent.apps.${GOOGLE_CLIENT_ID.split('.')[0]}`
      : '';
    return `${reversedClientId}:/oauth2redirect`;
  } else if (Platform.OS === 'android') {
    // Android uses reversed client ID (automatically handled by Android OAuth client)
    const reversedClientId = GOOGLE_CLIENT_ID
      ? `com.googleusercontent.apps.${GOOGLE_CLIENT_ID.split('.')[0]}`
      : '';
    return `${reversedClientId}:/oauth2redirect`;
  }
  // Web platform uses https redirect
  return 'http://localhost:19006/auth/google';
};

const GOOGLE_CONFIG = {
  clientId: GOOGLE_CLIENT_ID,
  redirectUri: getRedirectUri(),
  scopes: ['openid', 'profile', 'email'],
};
```

### Update app.json

```json
{
  "expo": {
    "extra": {
      "googleClientId": "${EXPO_PUBLIC_GOOGLE_CLIENT_ID}",
      "googleIosClientId": "${EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID}",
      "googleAndroidClientId": "${EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID}"
    }
  }
}
```

### Update .env

```bash
# Web OAuth Client (for backend)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR-GOOGLE-CLIENT-ID.apps.googleusercontent.com

# iOS OAuth Client (for mobile app on iOS)
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com

# Android OAuth Client (for mobile app on Android)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

---

## Why Multiple OAuth Clients?

**Security**: Each platform has different security mechanisms:
- **iOS**: Uses Bundle ID verification
- **Android**: Uses package name + SHA-1 fingerprint verification
- **Web**: Uses https redirect URI verification

**Best Practice**: Google recommends separate OAuth clients for each platform to properly verify the app's identity.

---

## Quick Fix for Development

If you want to test quickly without creating new OAuth clients:

1. In Google Cloud Console, add this redirect URI to your Web client:
   ```
   http://127.0.0.1
   ```

2. Update `mobile/src/services/oauthService.ts`:
   ```typescript
   const GOOGLE_CONFIG = {
     clientId: GOOGLE_CLIENT_ID,
     redirectUri: 'http://127.0.0.1',
     scopes: ['openid', 'profile', 'email'],
   };
   ```

This will work for development but **should not be used in production**.

---

## Summary

| Approach | Pros | Cons | Recommended For |
|----------|------|------|-----------------|
| **iOS OAuth Client** | ✅ Secure<br>✅ Production-ready<br>✅ Auto-validates Bundle ID | ⚠️ iOS only | Production iOS |
| **Android OAuth Client** | ✅ Secure<br>✅ Production-ready<br>✅ Validates package + SHA-1 | ⚠️ Android only<br>⚠️ Requires SHA-1 | Production Android |
| **Web Client + localhost** | ✅ Quick to test<br>✅ No new client needed | ⚠️ Development only<br>⚠️ Not secure for production | Quick testing |
| **Multiple Clients** | ✅ Best security<br>✅ Platform-specific<br>✅ Production-ready | ⚠️ More setup | **Production apps** |

---

## Next Steps

**Choose one:**

### A. Create iOS + Android OAuth Clients (Recommended)
1. Create iOS OAuth client with Bundle ID: `com.proxyagent.app`
2. Create Android OAuth client with package name: `com.proxyagent.app` + SHA-1
3. Update `mobile/.env` with both client IDs
4. Update `oauthService.ts` to use platform-specific client IDs

### B. Use Web Client for Quick Testing
1. Add `http://127.0.0.1` to Web OAuth client redirect URIs
2. Update `oauthService.ts` to use `http://127.0.0.1` as redirect URI
3. Test OAuth flow
4. Later migrate to platform-specific clients for production

---

## References

- [Google OAuth 2.0 for Mobile Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Setting up OAuth 2.0](https://support.google.com/googleapi/answer/6158849)
- [iOS OAuth Client Setup](https://developers.google.com/identity/sign-in/ios/start-integrating)
- [Android OAuth Client Setup](https://developers.google.com/identity/sign-in/android/start-integrating)
