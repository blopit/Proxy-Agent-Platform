# 🔐 Google OAuth Setup Guide

**Date**: November 7, 2025
**Status**: Backend ready, need credentials

---

## ✅ What's Already Done

- ✅ Backend OAuth routes created (`/api/v1/auth/oauth/google`)
- ✅ User model updated with OAuth fields
- ✅ Database migration applied (oauth_provider, oauth_provider_id)
- ✅ Settings configured to read Google credentials
- ✅ Frontend OAuth service ready (`oauthService.ts`)
- ✅ Mobile app has Google Sign In button

---

## 🎯 What We Need

Google OAuth credentials from Google Cloud Console:
1. **Client ID** (for web/mobile)
2. **Client Secret** (for backend token exchange)

---

## 📋 Step-by-Step Setup

### Step 1: Go to Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create a New Project

1. Click the project dropdown at the top
2. Click "New Project"
3. **Project Name**: `Proxy Agent Platform`
4. Click "Create"
5. Wait for project creation (~30 seconds)
6. Select the new project from the dropdown

### Step 3: Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click "Google+ API"
4. Click "Enable"

### Step 4: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Click "Create"

**App Information**:
- **App name**: `Proxy Agent`
- **User support email**: Your email
- **App logo**: (optional, skip for now)
- **Application home page**: `http://localhost:8000` (development)
- **Developer contact email**: Your email

4. Click "Save and Continue"

**Scopes**:
5. Click "Add or Remove Scopes"
6. Select these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
7. Click "Update"
8. Click "Save and Continue"

**Test Users** (for development):
9. Click "Add Users"
10. Add your email address
11. Click "Save and Continue"
12. Click "Back to Dashboard"

### Step 5: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**

**Application type**: **Web application**

**Name**: `Proxy Agent Web Client`

**Authorized JavaScript origins**:
```
http://localhost:8000
http://localhost:3000
http://localhost:19006
```

**Authorized redirect URIs**:
```
http://localhost:8000/api/v1/auth/oauth/google
proxyagent://auth/google
com.googleusercontent.apps.YOUR-CLIENT-ID:/oauth2redirect
```

3. Click "Create"

**Important**: Copy these values immediately:
- ✅ **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
- ✅ **Client Secret**: `GOCSPX-abc123xyz`

### Step 6: Update Backend `.env`

Open `/Users/shrenilpatel/Github/Proxy-Agent-Platform/.env`:

```bash
# OAuth Configuration
GOOGLE_CLIENT_ID=YOUR-CLIENT-ID-FROM-STEP-5.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR-CLIENT-SECRET-FROM-STEP-5
```

### Step 7: Update Mobile `.env`

Open `/Users/shrenilpatel/Github/Proxy-Agent-Platform/mobile/.env`:

```bash
# Google OAuth (from parent .env)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=YOUR-CLIENT-ID-FROM-STEP-5.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=YOUR-CLIENT-SECRET-FROM-STEP-5
```

### Step 8: Restart Backend

```bash
# Kill the backend
pkill -f "uvicorn src.api.main:app"

# Restart with new credentials
uvicorn src.api.main:app --reload --port 8000
```

### Step 9: Test OAuth Flow

**Backend test**:
```bash
# Check if OAuth endpoint exists
curl http://localhost:8000/docs

# Look for: POST /api/v1/auth/oauth/google
```

**Mobile test**:
```bash
# Restart mobile app
cd mobile
npx expo start --clear

# On the app:
# 1. Tap "Get Started"
# 2. Tap "Sign in with Google" button
# 3. Complete Google OAuth flow
# 4. Should be redirected back to onboarding
```

---

## 🔍 Verification

### Backend Logs
You should see:
```
INFO - Google OAuth initiated for user...
INFO - User profile fetched from Google
INFO - User created/updated with OAuth
INFO - JWT token issued
```

### Mobile App
You should see:
```
1. Google sign-in popup
2. Select your Google account
3. Grant permissions
4. Redirect back to app
5. Navigate to onboarding welcome screen
```

### Database Check
```bash
# Check if OAuth user was created
sqlite3 proxy_agents_enhanced.db "SELECT user_id, username, email, oauth_provider FROM users WHERE oauth_provider = 'google';"
```

Expected output:
```
user_id_123|john.doe|john.doe@gmail.com|google
```

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Cause**: The redirect URI doesn't match what's in Google Console

**Fix**:
1. Check the error message for the actual redirect_uri being used
2. Add that exact URI to **Authorized redirect URIs** in Google Console
3. Wait 5 minutes for changes to propagate

### Error: "invalid_client"
**Cause**: Client ID or Secret is wrong

**Fix**:
1. Double-check `.env` files have correct credentials
2. Ensure no extra spaces or quotes
3. Restart backend: `pkill -f uvicorn && uvicorn src.api.main:app --reload --port 8000`

### Error: "access_denied"
**Cause**: User canceled or doesn't have permission

**Fix**:
- Add your email as a test user in OAuth consent screen
- Make sure app is not in "Production" mode (use "Testing" mode)

### Mobile App: "Google sign-in failed"
**Cause**: Mobile app can't complete OAuth flow

**Fix**:
1. Check mobile logs for exact error
2. Verify `EXPO_PUBLIC_GOOGLE_CLIENT_ID` is set
3. Try clearing Expo cache: `npx expo start --clear`

---

## 📝 Quick Reference

### Current Status
- ✅ Backend ready
- ✅ Frontend ready
- ⏳ Waiting for Google credentials

### Required Credentials
1. Google Client ID
2. Google Client Secret

### Where to Add Them
1. Backend: `.env` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
2. Mobile: `mobile/.env` → `EXPO_PUBLIC_GOOGLE_CLIENT_ID`

### Test Command
```bash
curl http://localhost:8000/docs
# Look for: POST /api/v1/auth/oauth/google
```

---

## 🎉 Success Criteria

You've successfully set up Google OAuth when:

- ✅ Google Cloud project created
- ✅ OAuth consent screen configured
- ✅ OAuth credentials generated
- ✅ Credentials added to `.env` files
- ✅ Backend restarted with new credentials
- ✅ Mobile app shows Google sign-in button
- ✅ Clicking "Sign in with Google" opens Google auth
- ✅ After authentication, user is redirected to onboarding
- ✅ User appears in database with `oauth_provider = 'google'`

---

## 🔮 Next Steps

After Google OAuth is working:

1. **Test the complete flow**:
   - Sign in with Google
   - Complete onboarding
   - Verify data in backend

2. **Add other OAuth providers** (optional):
   - Apple Sign In (requires Apple Developer account)
   - GitHub OAuth
   - Microsoft OAuth

3. **Production deployment**:
   - Update authorized redirect URIs with production URLs
   - Set OAuth consent screen to "Production" mode
   - Add privacy policy and terms of service

---

**Need help?** Check the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2) or ask in the team channel!

**Ready to start?** Go to Step 1 above! 🚀
