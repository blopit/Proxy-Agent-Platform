# Google OAuth Quick Fix - Development Setup

**Status**: Development Only (Web Mode)
**Date**: November 7, 2025
**Time to Setup**: 5 minutes

---

## ✅ What Changed

Updated the redirect URI from `http://127.0.0.1` (invalid - no port) to `http://127.0.0.1:19006/auth/google` (valid - includes port).

**Why Port 19006?**
- This is Expo's default web development port
- Google OAuth requires the complete redirect URI including port
- The previous URI without port caused "400: malformed request" error

---

## 🔧 Google Cloud Console Setup

### Step 1: Add the New Redirect URI

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click on your OAuth 2.0 Client ID: `765534073366-98ffgpadh021rmhktv4l16lbnaih12t6`
3. Under **Authorized redirect URIs**, click **+ ADD URI**
4. Enter exactly: `http://127.0.0.1:19006/auth/google`
5. Click **Save**

✅ This redirect URI **WILL be accepted** (includes http:// scheme and port number)

---

## 🧪 Testing the OAuth Flow

### Step 1: Start Expo in Web Mode

```bash
cd mobile
npm start
```

When Expo DevTools appears, press **`w`** to open in web browser.

**Important**: You must test on **web mode** for this fix to work. The redirect URI `http://127.0.0.1:19006` only works when the app is running as a web application.

### Step 2: Test Google Sign-In

1. The app should open in your browser at `http://localhost:19006`
2. Navigate to the Signup/Login screen
3. Click **"Continue with Google"**
4. Sign in with your Google account
5. **Expected**: You'll be redirected back to the app and logged in successfully

### Success Criteria

- ✅ Google OAuth consent screen appears (no 400 error)
- ✅ User can authenticate with Google
- ✅ Redirect back to app works (no errors)
- ✅ Authorization code is extracted
- ✅ Backend receives code and returns JWT token
- ✅ User is successfully logged in

---

## ⚠️ Limitations

This is a **development-only** solution with the following limitations:

### What Works
- ✅ Testing on Expo web mode (`npm start` then `w`)
- ✅ Testing in browser at `http://localhost:19006`
- ✅ Complete OAuth flow including backend token exchange

### What Doesn't Work
- ❌ iOS Simulator/Device (different port/scheme)
- ❌ Android Emulator/Device (different port/scheme)
- ❌ Expo Go app on physical devices
- ❌ Production builds

### Why These Limitations?

The redirect URI `http://127.0.0.1:19006/auth/google` only matches when:
1. The app is running on web
2. The web server is on port 19006 (Expo's default web port)
3. The browser can access `127.0.0.1`

iOS and Android devices/simulators:
- Use different ports
- Can't access `127.0.0.1` (localhost on the device, not your computer)
- Require platform-specific OAuth clients or native SDK

---

## 🚀 Production Solutions

When you're ready to deploy or test on actual mobile devices, choose one of these production-ready approaches:

### Option A: @react-native-google-signin (Recommended)

**Best for**: Production mobile apps that need Google Sign-In

```bash
cd mobile
npm install @react-native-google-signin/google-signin
```

**Pros**:
- ✅ Official Google SDK for React Native
- ✅ Works on iOS, Android, and Web
- ✅ Handles all OAuth complexity automatically
- ✅ Production-ready and actively maintained
- ✅ Better UX (native Google Sign-In UI)

**Setup Guide**: See `GOOGLE_OAUTH_MOBILE_SETUP.md` → "Option 2"

### Option B: Platform-Specific OAuth Clients

**Best for**: If you want to stick with `expo-auth-session` and avoid additional packages

**Steps**:
1. Create iOS OAuth Client in Google Cloud Console (type: iOS)
2. Create Android OAuth Client in Google Cloud Console (type: Android)
3. Update code to use platform-specific client IDs

**Setup Guide**: See `GOOGLE_OAUTH_MOBILE_SETUP.md` → "Option 3"

---

## 🐛 Troubleshooting

### Still Getting 400 Error?

1. **Check redirect URI exactly matches**:
   - In code: `http://127.0.0.1:19006/auth/google`
   - In Google Console: `http://127.0.0.1:19006/auth/google`
   - They must be **identical** (including trailing path)

2. **Verify you're testing on web**:
   - Run `npm start` in mobile directory
   - Press `w` to open web version
   - URL should be `http://localhost:19006`

3. **Check Expo is using port 19006**:
   - Look at the Expo DevTools output
   - If it says different port (e.g., 19007), update the redirect URI to match

4. **Clear browser cache**:
   - Google OAuth sometimes caches redirect URI errors
   - Try in incognito/private mode

### "Redirect URI Mismatch" Error?

This means the URI in your code doesn't match what's in Google Cloud Console.

**Fix**:
1. Check what URI is actually being sent (check browser network tab)
2. Update Google Cloud Console to match exactly
3. Save changes in Google Console
4. Try again

### Can't Test on iOS/Android?

This quick fix only works on web. For mobile devices, you need:
- Option A: Install `@react-native-google-signin` package
- Option B: Create iOS/Android OAuth clients

See `GOOGLE_OAUTH_MOBILE_SETUP.md` for full mobile setup.

---

## 📊 Comparison: Development vs Production

| Feature | Quick Fix (Current) | @react-native-google-signin | Platform-Specific Clients |
|---------|-------------------|---------------------------|-------------------------|
| **Setup Time** | 5 minutes | 30 minutes | 45 minutes |
| **Web Support** | ✅ Yes | ✅ Yes | ✅ Yes |
| **iOS Support** | ❌ No | ✅ Yes | ✅ Yes |
| **Android Support** | ❌ No | ✅ Yes | ✅ Yes |
| **Production Ready** | ❌ No | ✅ Yes | ✅ Yes |
| **Extra Packages** | None | 1 package | None |
| **Complexity** | Low | Medium | High |
| **Security** | Basic | High | High |
| **Best For** | Quick testing | Production apps | Custom needs |

---

## 📚 Related Documentation

- `OAUTH_FIX_COMPLETE.md` - expo-auth-session v7 API migration
- `OAUTH_REDIRECT_URI_FIX.md` - Reversed client ID approach (deprecated approach)
- `GOOGLE_OAUTH_MOBILE_SETUP.md` - Complete production setup guide
- `mobile/.env` - OAuth credentials configuration

---

## ✅ Summary

**Current Status**: Development-ready for web testing

**What to Do Now**:
1. Add `http://127.0.0.1:19006/auth/google` to Google Cloud Console
2. Test on Expo web mode (`npm start` → press `w`)
3. Verify OAuth flow works end-to-end

**Next Steps** (when ready for production):
- Migrate to `@react-native-google-signin` for mobile support
- Or create platform-specific OAuth clients

The app should now work for development testing on web! 🎉
