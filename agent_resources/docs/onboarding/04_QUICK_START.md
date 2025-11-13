# Onboarding System Quick Start Guide

## Prerequisites

### Required Tools

- **Node.js**: v18+ (for mobile app)
- **Python**: 3.11+ (for backend)
- **UV**: Latest version (Python package manager)
- **Expo CLI**: Latest (for React Native development)
- **SQLite**: Comes with Python, no separate install needed

### Optional Tools

- **iOS Simulator** (macOS): For iOS testing
- **Android Studio**: For Android emulator
- **Expo Go App**: For testing on physical devices

## Quick Setup (5 minutes)

### 1. Backend Setup

```bash
# Navigate to project root
cd /path/to/Proxy-Agent-Platform

# Install UV if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and sync dependencies
uv venv
uv sync

# Run database migrations
uv run python -c "from src.services.onboarding_service import OnboardingService; OnboardingService()"

# Start the backend server
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify Backend**:
```bash
# In a new terminal
curl http://localhost:8000/api/v1/health
# Should return: {"status": "healthy"}
```

### 2. Mobile App Setup

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install
# or
yarn install

# Start Expo development server
npx expo start
```

**Verify Mobile App**:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

### 3. Test Onboarding Flow

1. Open the app in simulator/emulator
2. Navigate to onboarding (if not redirected automatically)
3. Complete the 7-step flow:
   - Welcome
   - Work Preferences
   - Challenges
   - ADHD Support Level
   - Daily Schedule
   - Productivity Goals
   - Complete

## Development Workflow

### Running the Full Stack

**Terminal 1 - Backend**:
```bash
cd /path/to/Proxy-Agent-Platform
uv run uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Mobile App**:
```bash
cd /path/to/Proxy-Agent-Platform/mobile
npx expo start
```

### Making Changes

#### Frontend Changes (Mobile App)

1. **Edit a screen** (e.g., `mobile/app/(auth)/onboarding/goals.tsx`)
2. **Save** - Expo will hot reload automatically
3. **Test** - Changes appear immediately in simulator

#### Backend Changes (API)

1. **Edit service or route** (e.g., `src/services/onboarding_service.py`)
2. **Save** - Uvicorn will auto-reload
3. **Test** - Make API call to verify changes

```bash
curl -X GET http://localhost:8000/api/v1/users/test_user/onboarding
```

#### Type Changes (Data Models)

1. **Update TypeScript types** (`mobile/src/types/onboarding.ts`)
2. **Update Pydantic schemas** (`src/api/routes/schemas/onboarding_schemas.py`)
3. **Update database schema if needed** (`src/database/migrations/024_create_user_onboarding.sql`)
4. **Re-run migration** (if DB schema changed)

## Testing

### Manual Testing

#### Test Complete Flow
```bash
# Start at welcome screen
1. Tap "Get Started"
2. Select "Remote" work preference
3. Select 2-3 challenges
4. Set ADHD support level to 7
5. Configure daily schedule
6. Select productivity goals
7. Complete onboarding
```

#### Test Skip Flow
```bash
# From any onboarding screen
1. Tap "Skip for now"
2. Verify redirected to main app
3. Check AsyncStorage has skipped=true
```

#### Test Back Navigation
```bash
# From any onboarding screen (except welcome)
1. Tap "Back" button
2. Verify previous screen appears
3. Verify data is preserved
```

### Automated Testing

#### Backend Unit Tests
```bash
# Run all tests
uv run pytest src/api/routes/tests/test_onboarding.py -v

# Run with coverage
uv run pytest src/api/routes/tests/test_onboarding.py --cov=src/services/onboarding_service --cov-report=html

# View coverage report
open htmlcov/index.html
```

#### Frontend Tests (if implemented)
```bash
cd mobile
npm test
# or
yarn test
```

### API Testing with cURL

#### Get Onboarding Data
```bash
curl -X GET http://localhost:8000/api/v1/users/test_user/onboarding
```

#### Create Onboarding Data
```bash
curl -X PUT http://localhost:8000/api/v1/users/test_user/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "work_preference": "remote",
    "adhd_support_level": 7,
    "adhd_challenges": ["time_blindness", "focus"],
    "daily_schedule": {
      "time_preference": "morning",
      "flexible_enabled": false,
      "week_grid": {
        "monday": "8-17",
        "tuesday": "8-17",
        "wednesday": "8-17",
        "thursday": "8-17",
        "friday": "8-17",
        "saturday": "off",
        "sunday": "off"
      }
    },
    "productivity_goals": ["reduce_overwhelm", "increase_focus"]
  }'
```

#### Mark Complete
```bash
curl -X POST http://localhost:8000/api/v1/users/test_user/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

#### Delete Data
```bash
curl -X DELETE http://localhost:8000/api/v1/users/test_user/onboarding
```

## Debugging

### View Local Storage (Mobile)

```typescript
// Add to any screen for debugging
import AsyncStorage from '@react-native-async-storage/async-storage';

const debugStorage = async () => {
  const data = await AsyncStorage.getItem('@proxy_agent:onboarding_data');
  console.log('Stored data:', JSON.parse(data || '{}'));
};

// Call in useEffect
useEffect(() => {
  debugStorage();
}, []);
```

### Reset Onboarding (Mobile)

```typescript
// Option 1: Use context method
const { resetOnboarding } = useOnboarding();
await resetOnboarding();

// Option 2: Clear AsyncStorage manually
await AsyncStorage.removeItem('@proxy_agent:onboarding_data');
await AsyncStorage.removeItem('@proxy_agent:onboarding_progress');
```

### View Database (Backend)

```bash
# Open SQLite database
sqlite3 proxy_agents_enhanced.db

# View all onboarding records
SELECT * FROM user_onboarding;

# View specific user
SELECT * FROM user_onboarding WHERE user_id = 'test_user';

# Delete specific user (for testing)
DELETE FROM user_onboarding WHERE user_id = 'test_user';

# Exit SQLite
.exit
```

### Enable Debug Logging

**Backend (main.py or settings)**:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend (any component)**:
```typescript
console.log('[Onboarding] Current data:', data);
console.log('[Onboarding] Progress:', progress);
```

## Common Issues & Solutions

### Issue: Backend won't start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Ensure you're in the project root
cd /path/to/Proxy-Agent-Platform

# Sync dependencies
uv sync

# Run with uv
uv run uvicorn src.main:app --reload
```

### Issue: Mobile app shows "Network request failed"

**Cause**: Backend not running or wrong URL

**Solution**:
```bash
# 1. Verify backend is running
curl http://localhost:8000/api/v1/health

# 2. Check mobile API base URL
# Edit: mobile/src/services/onboardingService.ts
# Ensure: baseURL points to correct backend address
```

**For iOS Simulator**:
- Use `http://localhost:8000`

**For Android Emulator**:
- Use `http://10.0.2.2:8000`

**For Physical Device**:
- Use your computer's IP address: `http://192.168.x.x:8000`

### Issue: Onboarding shows on every app restart

**Cause**: `hasCompletedOnboarding` not being set

**Solution**:
```typescript
// Check OnboardingContext loading logic
const { hasCompletedOnboarding, isLoading } = useOnboarding();

if (isLoading) return <LoadingScreen />;
if (!hasCompletedOnboarding) return <Redirect href="/onboarding/welcome" />;
```

### Issue: Data not syncing to backend

**Cause**: User not authenticated or network error

**Solution**:
```typescript
// Check auth state
const { user } = useAuth();
console.log('User ID:', user?.user_id);

// Check if upsert is being called
// In OnboardingContext.tsx:saveData
console.log('Syncing to backend for user:', user?.user_id);
```

### Issue: Database table doesn't exist

**Error**: `sqlite3.OperationalError: no such table: user_onboarding`

**Solution**:
```bash
# Run migration manually
sqlite3 proxy_agents_enhanced.db < src/database/migrations/024_create_user_onboarding.sql

# Or let service create it automatically
uv run python -c "from src.services.onboarding_service import OnboardingService; OnboardingService()"
```

## File Locations Reference

### Frontend (Mobile)
```
mobile/
├── app/(auth)/onboarding/          # Onboarding screens
│   ├── _layout.tsx                 # Stack navigator
│   ├── welcome.tsx                 # Step 1
│   ├── work-preferences.tsx        # Step 2
│   ├── challenges.tsx              # Step 3
│   ├── adhd-support.tsx            # Step 4
│   ├── daily-schedule.tsx          # Step 5
│   ├── goals.tsx                   # Step 6
│   └── complete.tsx                # Step 7
├── src/
│   ├── contexts/
│   │   └── OnboardingContext.tsx   # Global state management
│   ├── services/
│   │   └── onboardingService.ts    # API integration
│   ├── types/
│   │   └── onboarding.ts           # TypeScript types
│   └── components/onboarding/
│       └── StepProgress.tsx        # Progress indicator
```

### Backend (Python)
```
src/
├── api/routes/
│   ├── onboarding.py                        # API endpoints
│   └── schemas/
│       └── onboarding_schemas.py            # Pydantic models
├── services/
│   └── onboarding_service.py                # Business logic
└── database/migrations/
    └── 024_create_user_onboarding.sql       # DB schema
```

### Documentation
```
Agent_Resources/docs/onboarding/
├── 00_OVERVIEW.md           # Architecture & design
├── 01_FRONTEND.md           # React Native implementation
├── 02_BACKEND.md            # FastAPI implementation
├── 03_DATA_MODELS.md        # Data structures
└── 04_QUICK_START.md        # This file
```

## Next Steps

### Add New Onboarding Step

1. **Create screen** in `mobile/app/(auth)/onboarding/my-step.tsx`
2. **Add to flow** in `mobile/app/(auth)/onboarding/_layout.tsx`
3. **Update total steps** in `mobile/src/types/onboarding.ts`
4. **Add step ID** to `ONBOARDING_STEPS` constant
5. **Update data model** if collecting new data
6. **Update backend schema** if needed
7. **Test complete flow**

### Customize Styling

1. **Edit theme** in `mobile/src/theme/colors.ts`
2. **Update styles** in individual screen files
3. **Modify StepProgress** component if needed

### Add Validation

1. **Frontend validation** in screen components
2. **Backend validation** in Pydantic schemas
3. **Database constraints** in migration SQL

## Helpful Commands Cheat Sheet

```bash
# Backend
uv run uvicorn src.main:app --reload              # Start backend
uv run pytest -v                                   # Run tests
sqlite3 proxy_agents_enhanced.db                   # Open database

# Frontend
cd mobile && npx expo start                        # Start app
npx expo start --clear                             # Clear cache
npx expo start --ios                               # iOS only
npx expo start --android                           # Android only

# Database
sqlite3 proxy_agents_enhanced.db "SELECT * FROM user_onboarding;"  # Query
sqlite3 proxy_agents_enhanced.db "DELETE FROM user_onboarding;"    # Reset

# Testing
curl http://localhost:8000/api/v1/health                           # Health check
curl http://localhost:8000/api/v1/users/test/onboarding            # Get data
```

## Resources

- **Expo Docs**: https://docs.expo.dev/
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Pydantic Docs**: https://docs.pydantic.dev/
- **React Native Docs**: https://reactnavigation.org/
- **UV Docs**: https://github.com/astral-sh/uv

## Support

If you encounter issues not covered here:
1. Check the detailed documentation in `01_FRONTEND.md`, `02_BACKEND.md`, `03_DATA_MODELS.md`
2. Review the code comments in source files
3. Check console logs for error messages
4. Verify all prerequisites are installed and up to date

---

**Last Updated**: November 2025
**Version**: 1.0
