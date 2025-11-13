# Onboarding System Overview

## Purpose

The onboarding system collects user preferences and profile information to personalize the Proxy Agent Platform experience. It's designed with ADHD-optimized features and flexible data collection.

## Architecture

```
┌─────────────────┐
│  Mobile Client  │
│  (React Native) │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   FastAPI       │
│   Backend       │
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│   SQLite DB     │
│ user_onboarding │
└─────────────────┘
```

## Key Components

### Frontend (React Native/Expo)
- **Location**: `mobile/app/(auth)/onboarding/`
- **State Management**: React Context API (`OnboardingContext`)
- **Local Persistence**: AsyncStorage
- **Backend Sync**: Automatic with graceful offline handling

### Backend (FastAPI/Python)
- **Location**: `src/api/routes/onboarding.py`
- **Service Layer**: `src/services/onboarding_service.py`
- **Database**: SQLite with migration `024_create_user_onboarding.sql`

## Onboarding Flow

The onboarding consists of 6 steps:

```
1. Welcome
   ↓
2. Work Preferences (remote/hybrid/office/flexible)
   ↓
3. ADHD Support (challenges selection)
   ↓
4. ADHD Support Level (1-10 scale)
   ↓
5. Daily Schedule (time preferences + weekly availability)
   ↓
6. Productivity Goals (multi-select goals)
   ↓
7. Complete (summary + optional ChatGPT export)
```

### User Journey Options

1. **Complete Flow**: User goes through all steps → Data saved & synced
2. **Skip Onboarding**: Available at any step → Minimal data saved, marked as skipped
3. **Partial Completion**: Data saved incrementally as user progresses

## Data Collection

### Collected Information

| Category | Fields | Purpose |
|----------|--------|---------|
| Work Preferences | `work_preference` | Task scheduling, focus modes |
| ADHD Support | `adhd_support_level`, `adhd_challenges` | Feature personalization, UI adaptations |
| Daily Schedule | `time_preference`, `week_grid` | Reminder timing, availability tracking |
| Productivity Goals | `productivity_goals[]` | Feature recommendations, metric tracking |

### Optional Features
- ChatGPT prompt export (user can export personalized prompt)
- Completion tracking (timestamp for analytics)

## Technical Features

### Offline-First Architecture
- Data saved to AsyncStorage immediately
- Backend sync happens asynchronously
- Graceful failure handling (continues on sync errors)

### Progressive Enhancement
- Partial updates supported (PATCH-like behavior)
- Can complete onboarding in multiple sessions
- Data persists across app restarts

### Privacy & Security
- No sensitive personal data collected
- User-controlled data (can delete via API)
- Optional participation (skip available)

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/users/{user_id}/onboarding` | Retrieve onboarding data |
| PUT | `/api/v1/users/{user_id}/onboarding` | Create/Update (upsert) |
| POST | `/api/v1/users/{user_id}/onboarding/complete` | Mark complete/skip |
| DELETE | `/api/v1/users/{user_id}/onboarding` | Delete all data |

## State Management

### Frontend State
- **Context**: `OnboardingContext` provides global state
- **Persistence**: AsyncStorage for offline capability
- **Sync Strategy**: Save local first, then sync to backend

### Backend State
- **Database**: Single source of truth
- **Upsert Pattern**: Create if not exists, update if exists
- **Timestamps**: Tracks creation, updates, completion

## Key Design Decisions

1. **Progressive Disclosure**: One question per screen to reduce cognitive load
2. **Visual Progress**: Step indicator shows position in flow
3. **Always Escapable**: Skip option on every screen
4. **Graceful Degradation**: Works offline, syncs when connected
5. **ADHD-Optimized**:
   - Clear visual hierarchy
   - Minimal text
   - Immediate feedback
   - Low-pressure environment

## File Structure

```
mobile/
├── app/(auth)/onboarding/
│   ├── _layout.tsx           # Stack navigator
│   ├── welcome.tsx            # Step 1: Introduction
│   ├── work-preferences.tsx   # Step 2: Work setup
│   ├── challenges.tsx         # Step 3: Challenge selection
│   ├── adhd-support.tsx       # Step 4: Support level
│   ├── daily-schedule.tsx     # Step 5: Schedule
│   ├── goals.tsx              # Step 6: Goals
│   └── complete.tsx           # Step 7: Summary
├── src/
│   ├── contexts/
│   │   └── OnboardingContext.tsx  # Global state
│   ├── services/
│   │   └── onboardingService.ts   # API integration
│   ├── types/
│   │   └── onboarding.ts          # TypeScript types
│   └── components/onboarding/
│       └── StepProgress.tsx       # Progress indicator

src/
├── api/routes/
│   ├── onboarding.py              # API endpoints
│   └── schemas/
│       └── onboarding_schemas.py  # Pydantic models
├── services/
│   └── onboarding_service.py      # Business logic
└── database/migrations/
    └── 024_create_user_onboarding.sql  # Schema
```

## Next Steps

- **Frontend Details**: See `01_FRONTEND.md`
- **Backend Details**: See `02_BACKEND.md`
- **Data Models**: See `03_DATA_MODELS.md`
- **Quick Start**: See `04_QUICK_START.md`
