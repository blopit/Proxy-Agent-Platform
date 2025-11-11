# Onboarding Flow - User Preferences Collection

## Overview

After successful authentication (login or signup), users go through a 7-step onboarding process to collect preferences and personalize their experience. The onboarding system uses an offline-first architecture with automatic backend sync.

**Key Features:**
- 7-step guided flow
- Offline-first with AsyncStorage
- Automatic backend synchronization
- Skip option available
- Progress tracking
- Can be reset for re-onboarding

## Onboarding Steps

```
1. Welcome         → Introduction to the platform
2. Work Preferences → Remote / Hybrid / Office / Flexible
3. Challenges      → Select productivity challenges
4. ADHD Support    → Support level (1-10 scale)
5. Daily Schedule  → Time preferences and weekly availability
6. Goals           → Productivity goals with targets
7. Complete        → Confirmation and next steps
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Mobile App                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │          OnboardingContext                         │ │
│  │          (Global State Management)                 │ │
│  │                                                     │ │
│  │  Data:                                             │ │
│  │   - workPreference                                 │ │
│  │   - adhdSupportLevel                               │ │
│  │   - adhdChallenges []                              │ │
│  │   - dailySchedule                                  │ │
│  │   - productivityGoals []                           │ │
│  │                                                     │ │
│  │  Progress:                                         │ │
│  │   - currentStep                                    │ │
│  │   - completedSteps []                              │ │
│  │   - hasCompletedOnboarding                         │ │
│  └───────────────┬───────────────────┬────────────────┘ │
│                  │                   │                   │
│  ┌───────────────▼──────────┐   ┌───▼─────────────────┐ │
│  │   AsyncStorage           │   │ onboardingService   │ │
│  │   (Offline-First)        │   │ (API Client)        │ │
│  │                          │   │                     │ │
│  │  Keys:                   │   │  - upsertOnboarding │ │
│  │   @proxy_agent:          │   │  - getOnboarding    │ │
│  │     onboarding_data      │   │  - markComplete     │ │
│  │   @proxy_agent:          │   │  - deleteOnboarding │ │
│  │     onboarding_progress  │   │                     │ │
│  └──────────────────────────┘   └─────────┬───────────┘ │
│                                            │             │
└────────────────────────────────────────────┼─────────────┘
                                             │
                                   HTTP/HTTPS│
                                             │
┌────────────────────────────────────────────▼─────────────┐
│                    Backend API                            │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  PUT /api/v1/users/{user_id}/onboarding                  │
│    → Upsert onboarding data (incremental updates)        │
│                                                           │
│  POST /api/v1/users/{user_id}/onboarding/complete        │
│    → Mark onboarding as completed or skipped             │
│                                                           │
│  GET /api/v1/users/{user_id}/onboarding                  │
│    → Retrieve onboarding data                            │
│                                                           │
│  DELETE /api/v1/users/{user_id}/onboarding               │
│    → Delete onboarding data (reset)                      │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           user_onboarding table (SQLite)            │ │
│  │                                                      │ │
│  │  - user_id (PK)                                     │ │
│  │  - work_preference                                  │ │
│  │  - adhd_support_level                               │ │
│  │  - adhd_challenges (JSON)                           │ │
│  │  - daily_schedule (JSON)                            │ │
│  │  - productivity_goals (JSON)                        │ │
│  │  - onboarding_completed                             │ │
│  │  - onboarding_skipped                               │ │
│  │  - completed_at / skipped_at                        │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Data Flow

### Offline-First Architecture

```
User completes step
    │
    ▼
OnboardingContext.setWorkPreference(...)
    │
    ├─────────────────────────────────┐
    │                                 │
    ▼                                 ▼
Save to AsyncStorage          Sync to Backend (async)
(Immediate, always succeeds)  (Best effort, graceful failure)
    │                                 │
    │                                 ▼
    │                          PUT /api/v1/users/{id}/onboarding
    │                                 │
    │                         ┌───────┴───────┐
    │                         │               │
    │                    Success          Failure
    │                         │               │
    │                    Continue         Log warning
    │                                         │
    ▼                                         ▼
Continue with local data              Continue with local data
(Always available)                    (Will retry on next update)
```

**Benefits:**
- Works offline
- Immediate UI feedback
- No blocking on network
- Eventual consistency with backend

## Frontend Implementation

### OnboardingContext (mobile/src/contexts/OnboardingContext.tsx)

#### Context Interface

```typescript
interface OnboardingContextValue {
  // Data
  data: OnboardingData;
  progress: OnboardingProgress;

  // Update methods
  setWorkPreference: (preference: WorkPreference) => Promise<void>;
  setChallenges: (challenges: string[]) => Promise<void>;
  setADHDSupportLevel: (level: ADHDSupportLevel, challenges?: string[]) => Promise<void>;
  setDailySchedule: (schedule: DailySchedule) => Promise<void>;
  setProductivityGoals: (goals: ProductivityGoal[]) => Promise<void>;

  // Progress methods
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  goToStep: (step: number) => Promise<void>;
  markStepComplete: (stepId: string) => Promise<void>;

  // Completion methods
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;

  // State
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}
```

#### Data Types

```typescript
// mobile/src/types/onboarding.ts

export interface OnboardingData {
  workPreference: WorkPreference | null;  // 'remote' | 'hybrid' | 'office' | 'flexible'
  adhdSupportLevel: ADHDSupportLevel | null;  // 1-10
  adhdChallenges?: string[];
  dailySchedule: DailySchedule | null;
  productivityGoals: ProductivityGoal[];
  completedAt?: string;
  skipped: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  canSkip: boolean;
}

export interface DailySchedule {
  preferredStartTime: string;  // "09:00"
  preferredEndTime: string;    // "17:00"
  timePreference: TimePreference;
  weeklyAvailability: WeeklyAvailability;
  flexibleSchedule: boolean;
}

export interface ProductivityGoal {
  id: string;
  type: ProductivityGoalType;
  title: string;
  description?: string;
  targetValue?: number;
  targetUnit?: string;
}
```

#### Loading Onboarding Data (mobile/src/contexts/OnboardingContext.tsx:68-112)

```typescript
useEffect(() => {
  loadOnboardingData();
}, []);

const loadOnboardingData = async () => {
  try {
    console.log('[OnboardingContext] Loading onboarding data from AsyncStorage...');
    setIsLoading(true);

    // Load data
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);

    if (storedData) {
      const parsedData = JSON.parse(storedData) as OnboardingData;
      setData(parsedData);

      // Check if onboarding was completed or skipped
      if (parsedData.completedAt || parsedData.skipped) {
        setHasCompletedOnboarding(true);
      }
    }

    // Load progress
    const storedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress) as OnboardingProgress);
    }
  } catch (error) {
    console.error('[OnboardingContext] Failed to load onboarding data:', error);
  } finally {
    setIsLoading(false);
  }
};
```

#### Saving Data (mobile/src/contexts/OnboardingContext.tsx:117-136)

```typescript
const saveData = useCallback(async (newData: OnboardingData) => {
  try {
    // 1. Save locally first (fast, offline-capable)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);

    // 2. Sync to backend (async, gracefully handles failures)
    if (user?.user_id) {
      try {
        await onboardingService.upsertOnboarding(user.user_id, newData);
      } catch (backendError) {
        console.warn('Backend sync failed, continuing with local data:', backendError);
        // Don't throw - local data is saved, backend will sync on next attempt
      }
    }
  } catch (error) {
    console.error('Failed to save onboarding data:', error);
    throw error;
  }
}, [user]);
```

#### Setting Preferences (mobile/src/contexts/OnboardingContext.tsx:154-208)

```typescript
const setWorkPreference = useCallback(
  async (preference: WorkPreference) => {
    const newData = { ...data, workPreference: preference };
    await saveData(newData);
  },
  [data, saveData]
);

const setChallenges = useCallback(
  async (challenges: string[]) => {
    const newData = { ...data, adhdChallenges: challenges };
    await saveData(newData);
  },
  [data, saveData]
);

const setADHDSupportLevel = useCallback(
  async (level: ADHDSupportLevel, challenges?: string[]) => {
    const newData = {
      ...data,
      adhdSupportLevel: level,
      adhdChallenges: challenges || data.adhdChallenges,
    };
    await saveData(newData);
  },
  [data, saveData]
);

const setDailySchedule = useCallback(
  async (schedule: DailySchedule) => {
    const newData = { ...data, dailySchedule: schedule };
    await saveData(newData);
  },
  [data, saveData]
);

const setProductivityGoals = useCallback(
  async (goals: ProductivityGoal[]) => {
    const newData = { ...data, productivityGoals: goals };
    await saveData(newData);
  },
  [data, saveData]
);
```

#### Progress Navigation (mobile/src/contexts/OnboardingContext.tsx:214-261)

```typescript
const nextStep = useCallback(async () => {
  const newProgress = {
    ...progress,
    currentStep: Math.min(progress.currentStep + 1, progress.totalSteps - 1),
  };
  await saveProgress(newProgress);
}, [progress, saveProgress]);

const previousStep = useCallback(async () => {
  const newProgress = {
    ...progress,
    currentStep: Math.max(progress.currentStep - 1, 0),
  };
  await saveProgress(newProgress);
}, [progress, saveProgress]);

const goToStep = useCallback(
  async (step: number) => {
    const newProgress = {
      ...progress,
      currentStep: Math.max(0, Math.min(step, progress.totalSteps - 1)),
    };
    await saveProgress(newProgress);
  },
  [progress, saveProgress]
);

const markStepComplete = useCallback(
  async (stepId: string) => {
    if (!progress.completedSteps.includes(stepId)) {
      const newProgress = {
        ...progress,
        completedSteps: [...progress.completedSteps, stepId],
      };
      await saveProgress(newProgress);
    }
  },
  [progress, saveProgress]
);
```

#### Completing Onboarding (mobile/src/contexts/OnboardingContext.tsx:266-286)

```typescript
const completeOnboarding = useCallback(async () => {
  const completedData: OnboardingData = {
    ...data,
    completedAt: new Date().toISOString(),
    skipped: false,
  };

  // Save locally
  await saveData(completedData);
  setHasCompletedOnboarding(true);

  // Mark as completed on backend
  if (user?.user_id) {
    try {
      await onboardingService.markComplete(user.user_id, true);
    } catch (error) {
      console.error('Failed to mark onboarding complete on backend:', error);
      // Continue anyway - local state is updated
    }
  }
}, [data, saveData, user]);
```

#### Skipping Onboarding (mobile/src/contexts/OnboardingContext.tsx:291-311)

```typescript
const skipOnboarding = useCallback(async () => {
  const skippedData: OnboardingData = {
    ...defaultData,
    skipped: true,
    completedAt: new Date().toISOString(),
  };

  // Save locally
  await saveData(skippedData);
  setHasCompletedOnboarding(true);

  // Mark as skipped on backend
  if (user?.user_id) {
    try {
      await onboardingService.markComplete(user.user_id, false); // false = skipped
    } catch (error) {
      console.error('Failed to mark onboarding skipped on backend:', error);
    }
  }
}, [saveData, user]);
```

### onboardingService (mobile/src/services/onboardingService.ts)

#### Upsert Onboarding Data

```typescript
async upsertOnboarding(
  userId: string,
  data: Partial<OnboardingData>
): Promise<OnboardingResponse> {
  // Map frontend fields to backend format
  const requestBody: any = {};

  if (data.workPreference !== undefined) {
    requestBody.work_preference = data.workPreference;
  }

  if (data.adhdSupportLevel !== undefined) {
    requestBody.adhd_support_level = data.adhdSupportLevel;
  }

  if (data.adhdChallenges !== undefined) {
    requestBody.adhd_challenges = data.adhdChallenges;
  }

  if (data.dailySchedule !== undefined) {
    requestBody.daily_schedule = data.dailySchedule;
  }

  if (data.productivityGoals !== undefined) {
    // Convert ProductivityGoal[] to string[] (just the types)
    requestBody.productivity_goals = data.productivityGoals.map(g => g.type);
  }

  const response = await apiPut(
    `${API_BASE_URL}/api/v1/users/${userId}/onboarding`,
    requestBody
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to update onboarding data');
  }

  return await response.json();
}
```

#### Mark Complete

```typescript
async markComplete(userId: string, completed: boolean): Promise<OnboardingResponse> {
  const response = await apiPost(
    `${API_BASE_URL}/api/v1/users/${userId}/onboarding/complete`,
    { completed }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to mark onboarding complete');
  }

  return await response.json();
}
```

## Backend Implementation

### API Routes

Backend onboarding routes are implemented in the user management module.

#### PUT /api/v1/users/{user_id}/onboarding

Upsert (create or update) onboarding data:

```python
@router.put("/{user_id}/onboarding")
async def upsert_onboarding(
    user_id: str,
    data: OnboardingUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Upsert user onboarding data (incremental updates)."""
    # Verify user can only update their own onboarding
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update own onboarding data"
        )

    # Upsert to database
    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO user_onboarding (
            user_id, work_preference, adhd_support_level,
            adhd_challenges, daily_schedule, productivity_goals,
            created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            work_preference = excluded.work_preference,
            adhd_support_level = excluded.adhd_support_level,
            adhd_challenges = excluded.adhd_challenges,
            daily_schedule = excluded.daily_schedule,
            productivity_goals = excluded.productivity_goals,
            updated_at = CURRENT_TIMESTAMP
        """,
        (
            user_id,
            data.work_preference,
            data.adhd_support_level,
            json.dumps(data.adhd_challenges) if data.adhd_challenges else None,
            json.dumps(data.daily_schedule) if data.daily_schedule else None,
            json.dumps(data.productivity_goals) if data.productivity_goals else None,
            datetime.now(timezone.utc),
            datetime.now(timezone.utc),
        ),
    )
    conn.commit()

    # Fetch and return updated data
    return get_onboarding(user_id)
```

#### POST /api/v1/users/{user_id}/onboarding/complete

Mark onboarding as completed or skipped:

```python
@router.post("/{user_id}/onboarding/complete")
async def mark_onboarding_complete(
    user_id: str,
    request: OnboardingCompleteRequest,
    current_user: User = Depends(get_current_user)
):
    """Mark onboarding as completed or skipped."""
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only update own onboarding"
        )

    conn = db.get_connection()
    cursor = conn.cursor()

    if request.completed:
        # Mark as completed
        cursor.execute(
            """
            UPDATE user_onboarding
            SET onboarding_completed = TRUE,
                completed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """,
            (user_id,),
        )
    else:
        # Mark as skipped
        cursor.execute(
            """
            UPDATE user_onboarding
            SET onboarding_skipped = TRUE,
                skipped_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """,
            (user_id,),
        )

    conn.commit()
    return get_onboarding(user_id)
```

#### GET /api/v1/users/{user_id}/onboarding

Retrieve onboarding data:

```python
@router.get("/{user_id}/onboarding")
async def get_onboarding(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get user onboarding data."""
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only view own onboarding"
        )

    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT * FROM user_onboarding WHERE user_id = ?
        """,
        (user_id,),
    )

    result = cursor.fetchone()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding not found"
        )

    # Parse JSON fields and return
    return {
        "user_id": result["user_id"],
        "work_preference": result["work_preference"],
        "adhd_support_level": result["adhd_support_level"],
        "adhd_challenges": json.loads(result["adhd_challenges"]) if result["adhd_challenges"] else None,
        "daily_schedule": json.loads(result["daily_schedule"]) if result["daily_schedule"] else None,
        "productivity_goals": json.loads(result["productivity_goals"]) if result["productivity_goals"] else None,
        "onboarding_completed": result["onboarding_completed"],
        "onboarding_skipped": result["onboarding_skipped"],
        "completed_at": result["completed_at"],
        "skipped_at": result["skipped_at"],
        "created_at": result["created_at"],
        "updated_at": result["updated_at"],
    }
```

#### DELETE /api/v1/users/{user_id}/onboarding

Delete onboarding data (reset):

```python
@router.delete("/{user_id}/onboarding", status_code=204)
async def delete_onboarding(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete onboarding data (reset for re-onboarding)."""
    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete own onboarding"
        )

    conn = db.get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        DELETE FROM user_onboarding WHERE user_id = ?
        """,
        (user_id,),
    )

    conn.commit()
    return Response(status_code=204)
```

## Onboarding Screens

### Screen Routing (mobile/app/(auth)/onboarding/_layout.tsx)

```typescript
// Onboarding screens use stack navigation
<Stack>
  <Stack.Screen name="welcome" />
  <Stack.Screen name="work-preferences" />
  <Stack.Screen name="challenges" />
  <Stack.Screen name="adhd-support" />
  <Stack.Screen name="daily-schedule" />
  <Stack.Screen name="goals" />
  <Stack.Screen name="complete" />
</Stack>
```

### Example Screen: Work Preferences

```typescript
// mobile/app/(auth)/onboarding/work-preferences.tsx
export default function WorkPreferencesScreen() {
  const router = useRouter();
  const { setWorkPreference, nextStep } = useOnboarding();
  const [selected, setSelected] = useState<WorkPreference | null>(null);

  const handleContinue = async () => {
    if (!selected) return;

    // Save preference
    await setWorkPreference(selected);

    // Move to next step
    await nextStep();

    // Navigate
    router.push('/(auth)/onboarding/challenges');
  };

  return (
    <View>
      <Text>What's your work mode?</Text>

      <OptionButton
        title="Remote"
        selected={selected === 'remote'}
        onPress={() => setSelected('remote')}
      />

      <OptionButton
        title="Hybrid"
        selected={selected === 'hybrid'}
        onPress={() => setSelected('hybrid')}
      />

      <OptionButton
        title="Office"
        selected={selected === 'office'}
        onPress={() => setSelected('office')}
      />

      <OptionButton
        title="Flexible"
        selected={selected === 'flexible'}
        onPress={() => setSelected('flexible')}
      />

      <Button
        title="Continue"
        onPress={handleContinue}
        disabled={!selected}
      />
    </View>
  );
}
```

## Testing Onboarding

### Manual Testing Checklist

- [ ] Complete all 7 steps
- [ ] Data persists after app restart
- [ ] Data syncs to backend
- [ ] Skip onboarding works
- [ ] Reset onboarding works
- [ ] Offline mode works (saves locally)
- [ ] Backend sync retries after network restored

### Automated Tests

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { OnboardingProvider, useOnboarding } from '@/src/contexts/OnboardingContext';

test('setWorkPreference saves data', async () => {
  const wrapper = ({ children }) => <OnboardingProvider>{children}</OnboardingProvider>;
  const { result } = renderHook(() => useOnboarding(), { wrapper });

  await act(async () => {
    await result.current.setWorkPreference('remote');
  });

  expect(result.current.data.workPreference).toBe('remote');
});

test('completeOnboarding sets completedAt', async () => {
  const wrapper = ({ children }) => <OnboardingProvider>{children}</OnboardingProvider>;
  const { result } = renderHook(() => useOnboarding(), { wrapper });

  await act(async () => {
    await result.current.completeOnboarding();
  });

  expect(result.current.hasCompletedOnboarding).toBe(true);
  expect(result.current.data.completedAt).toBeDefined();
});
```

## Common Issues & Solutions

### Issue: Onboarding data not persisting
**Solution**: Check AsyncStorage permissions and storage quota

### Issue: Backend sync failing
**Solution**: Check network connectivity and backend availability. Data is saved locally and will sync when backend is available.

### Issue: Onboarding shows after completion
**Solution**: Verify `completedAt` or `skipped` is set in OnboardingData

### Issue: Progress lost on app restart
**Solution**: Ensure `loadOnboardingData()` is called in useEffect on mount

## Related Documentation

- [01_overview.md](./01_overview.md) - System architecture
- [02_database_schema.md](./02_database_schema.md) - Database schema
- [04_frontend_authentication.md](./04_frontend_authentication.md) - Frontend auth flow
- [07_api_reference.md](./07_api_reference.md) - API endpoints
