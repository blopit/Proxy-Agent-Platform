# 🐕 Dogfood the App - Quick Start

**Date**: November 9, 2025
**Status**: Ready to test!

---

## ⚡ 5-Minute Quick Start

### Step 1: Start Mobile App (2 min)

```bash
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform/mobile
npx expo start
```

**Choose your platform:**
- Press **`i`** for iOS Simulator
- Press **`a`** for Android Emulator
- Press **`w`** for Web Browser (http://localhost:8081)
- Scan QR code with Expo Go app on physical device

### Step 2: Sign Up with Email (1 min)

1. **Tap "Get Started"**
2. **Tap "Sign Up"** (or go to Signup tab)
3. **Fill in:**
   - Email: `test@example.com` (or your real email)
   - Password: `Test123!`
   - Full Name: Your name
4. **Tap "Create Account"**

### Step 3: Complete Onboarding (2 min)

**7 Quick Screens:**

1. **OB-01 Welcome** → Tap "Let's Go!"
2. **OB-02 Work Preference** → Select "Remote" / "Hybrid" / "Office"
3. **OB-03 ADHD Support** → Drag slider (1-10)
4. **OB-04 Daily Schedule** → Pick your work hours
5. **OB-05 Goals** → Select productivity goals
6. **OB-06 ChatGPT Export** → Tap "Export" or "Skip"
7. **OB-07 Complete** → Tap "Launch Proxy Agent"

✅ **You're in!**

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or "Network error"

**Solution 1 - iOS Simulator:**
```typescript
// mobile/src/api/config.ts should have:
export const API_BASE_URL = 'http://localhost:8000';
```

**Solution 2 - Android Emulator:**
```typescript
// mobile/src/api/config.ts should use:
export const API_BASE_URL = 'http://10.0.2.2:8000';
```

**Solution 3 - Physical Device:**
```bash
# Find your computer's IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update mobile/src/api/config.ts:
export const API_BASE_URL = 'http://YOUR-IP:8000';

# Example:
export const API_BASE_URL = 'http://192.168.1.100:8000';
```

### Issue: Backend not responding

```bash
# Check backend is running
curl http://localhost:8000/health

# Restart backend if needed
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

### Issue: "OAuth not configured" error

**Skip Google OAuth for now!** Use email/password signup instead (see Step 2 above).

---

## 🧪 What to Test

### ✅ Authentication Flow
- [ ] Sign up with email
- [ ] Login works
- [ ] Token persists after app restart

### ✅ Onboarding Flow
- [ ] All 7 screens work
- [ ] Data saves locally (AsyncStorage)
- [ ] Data syncs to backend
- [ ] Can complete onboarding
- [ ] Can skip onboarding

### ✅ Data Persistence
- [ ] Close app, reopen → still logged in
- [ ] Onboarding data persists
- [ ] Backend has your data

### ✅ Backend Sync
```bash
# Check your onboarding data on backend
curl http://localhost:8000/api/v1/users/YOUR_USER_ID/onboarding | python3 -m json.tool
```

---

## 📱 Platforms Tested

- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical iPhone
- [ ] Physical Android
- [ ] Web Browser

---

## 🎯 Known Working Features

According to test results (100% pass rate):

✅ **Backend (16/16 tests)**
- User authentication
- Onboarding CRUD
- Data persistence
- Upsert logic

✅ **Frontend (15/15 tests)**
- All 7 onboarding screens
- State management
- Local persistence
- AsyncStorage

✅ **Integration (9/9 tests)**
- Mobile → Backend sync
- Data integrity
- Error handling

---

## 🆘 Still Stuck?

1. **Check console logs** in Expo dev tools
2. **Check backend logs** in terminal
3. **Verify .env files** have correct values
4. **Try web first** (simplest): `w` in Expo menu

---

## 📊 Success Criteria

You've successfully dogfooded when:

1. ✅ Created an account
2. ✅ Completed onboarding (or skipped)
3. ✅ Data saved locally
4. ✅ Data synced to backend
5. ✅ App works after restart

---

**Ready? Let's go!** 🚀

```bash
cd mobile && npx expo start
```
