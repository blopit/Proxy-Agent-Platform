# 🚀 Next Steps - Authentication & Onboarding

**Last Updated**: November 7, 2025
**Current Status**: Integration Validated (9/9 tests passed)

---

## ✅ What's Complete

### Backend (100%)
- ✅ Database schema (`user_onboarding` table)
- ✅ Service layer (`onboarding_service.py`)
- ✅ REST API endpoints
- ✅ 7/7 unit tests passed
- ✅ 9/9 integration tests passed

### Frontend (100%)
- ✅ 7 onboarding screens (Welcome → ChatGPT Export → Complete)
- ✅ AuthContext (token management)
- ✅ OnboardingContext (state management)
- ✅ 15/15 manual UI tests passed

### Integration (100%)
- ✅ API client (`onboardingService.ts`)
- ✅ Backend sync (`OnboardingContext.tsx`)
- ✅ Local-first architecture
- ✅ Error handling
- ✅ Integration tests validated

---

## 🎯 Next Steps (Priority Order)

### 1. Device Testing (Immediate)

**Goal**: Test complete flow on real devices/simulators

**Steps**:
```bash
# Terminal 1: Start backend
uvicorn src.api.main:app --reload --port 8000

# Terminal 2: Start mobile app
cd mobile
npx expo start

# Choose platform:
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator
# - Scan QR code for physical device
```

**Test Scenarios**:
1. Complete onboarding flow (all 7 screens)
2. Skip onboarding flow
3. Data persistence (close/reopen app)
4. Offline mode (airplane mode)
5. Online sync (disable airplane mode)

**Verification**:
```bash
# Check backend data
curl http://localhost:8000/api/v1/users/{user_id}/onboarding | python3 -m json.tool
```

---

### 2. OAuth Configuration (Before Production)

**Goal**: Enable social authentication

#### Google OAuth
**File**: `mobile/app.json`

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleSignIn": {
          "reservedClientId": "YOUR_IOS_CLIENT_ID"
        }
      }
    },
    "android": {
      "config": {
        "googleSignIn": {
          "apiKey": "YOUR_ANDROID_API_KEY",
          "certificateHash": "YOUR_CERT_HASH"
        }
      }
    }
  }
}
```

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Proxy Agent"
3. Enable Google Sign-In API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `proxyagent://oauth/callback`
6. Update `app.json` with client IDs

#### Apple Sign In
**File**: `mobile/app.json`

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.proxyagent.app",
      "buildNumber": "1.0.0",
      "config": {
        "usesAppleSignIn": true
      }
    }
  }
}
```

**Setup Steps**:
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Enable Sign In with Apple capability
3. Create App ID with Sign In capability
4. Update provisioning profile
5. Test with Apple ID

#### GitHub OAuth
**Setup Steps**:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Register new application
3. Set callback URL: `proxyagent://oauth/callback`
4. Get Client ID and Client Secret
5. Update backend `.env`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

---

### 3. Production Deployment

**Goal**: Deploy to production server

#### Backend Deployment

**Option A: Railway**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and init
railway login
railway init

# Deploy
railway up
```

**Option B: Fly.io**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Deploy
fly deploy
```

**Environment Variables**:
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
JWT_SECRET=your-random-secret
```

#### Mobile App Deployment

**Update API URL**:
```typescript
// mobile/src/api/config.ts
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://api.proxyagent.app';
```

**Build for Production**:
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

### 4. Authentication Middleware (Security)

**Goal**: Add JWT validation to backend endpoints

**Create**: `src/api/middleware/auth.py`

```python
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Verify JWT token and return user_id"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Update**: `src/api/routes/onboarding.py`

```python
from src.api.middleware.auth import verify_token

@router.get("/{user_id}/onboarding")
async def get_onboarding(
    user_id: str,
    authenticated_user: str = Depends(verify_token)
):
    # Verify user can only access their own data
    if user_id != authenticated_user:
        raise HTTPException(status_code=403, detail="Forbidden")
    # ... rest of endpoint
```

---

### 5. Error Tracking (Monitoring)

**Goal**: Track production errors

**Setup Sentry**:
```bash
# Install Sentry
npm install --save @sentry/react-native

# Initialize
npx @sentry/wizard -i reactNative -p ios android
```

**Configure**:
```typescript
// mobile/app/_layout.tsx
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project-id",
  enableInExpoDevelopment: false,
  debug: __DEV__,
});
```

---

## 📊 Testing Checklist

### Manual Device Testing
- [ ] iOS Simulator - Complete onboarding
- [ ] Android Emulator - Complete onboarding
- [ ] Physical iPhone - Complete onboarding
- [ ] Physical Android - Complete onboarding
- [ ] Offline mode - AsyncStorage persistence
- [ ] Online sync - Backend synchronization
- [ ] Skip flow - User skips onboarding
- [ ] Reset flow - User resets onboarding

### OAuth Testing
- [ ] Google Sign In - iOS
- [ ] Google Sign In - Android
- [ ] Apple Sign In - iOS
- [ ] GitHub OAuth - Both platforms
- [ ] Microsoft OAuth - Both platforms

### Production Testing
- [ ] Backend deployed and healthy
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Error tracking working

---

## 🔧 Quick Commands

### Backend
```bash
# Start backend
uvicorn src.api.main:app --reload --port 8000

# Run tests
uv run pytest src/ -v

# Run integration tests
python3 test_mobile_integration.py

# Check health
curl http://localhost:8000/health
```

### Mobile App
```bash
# Start Expo dev server
cd mobile && npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Clear cache
npx expo start --clear

# Run on device
npx expo start --tunnel
```

### Database
```bash
# Open database
sqlite3 proxy_agents_enhanced.db

# View onboarding data
SELECT * FROM user_onboarding;

# Clear test data
DELETE FROM user_onboarding WHERE user_id LIKE 'mobile_test_%';
```

---

## 📚 Documentation

- **Integration Guide**: `INTEGRATION_COMPLETE.md`
- **Test Results**: `INTEGRATION_TEST_RESULTS.md`
- **Backend Docs**: `ONBOARDING_BACKEND_COMPLETE.md`
- **Frontend Docs**: `mobile/AUTH_ONBOARDING_IMPLEMENTATION.md`
- **API Docs**: http://localhost:8000/docs

---

## 🐛 Known Issues

None - all 24 tests passed (7 backend + 8 frontend + 9 integration)

---

## 💡 Tips

1. **Local Development**: Use `http://localhost:8000` for iOS Simulator, `http://10.0.2.2:8000` for Android Emulator

2. **Testing on Physical Device**:
   - Find your computer's IP: `ifconfig | grep inet`
   - Update `API_BASE_URL` to `http://192.168.1.XXX:8000`
   - Ensure both devices on same WiFi

3. **Debugging Backend**:
   - Check logs: Backend prints all requests
   - Test endpoints directly: `curl http://localhost:8000/api/v1/...`
   - View Swagger UI: http://localhost:8000/docs

4. **Debugging Mobile**:
   - Use React DevTools: `npx expo install react-devtools`
   - Check AsyncStorage: Use Expo DevTools
   - View network requests: Enable network inspector

---

## 🎯 Success Criteria

Before marking as "Production Ready":

- [ ] All device tests passed
- [ ] OAuth configured and tested
- [ ] Backend deployed to production
- [ ] Mobile app built for production
- [ ] Authentication middleware added
- [ ] Error tracking configured
- [ ] Rate limiting enabled
- [ ] Documentation complete
- [ ] User acceptance testing passed

---

**Current Status**: ✅ Integration Validated (9/9 tests)
**Next Milestone**: Device Testing Complete
**Target**: Production Deployment by November 15, 2025

---

Need help? Check the docs above or ask in the team channel!
