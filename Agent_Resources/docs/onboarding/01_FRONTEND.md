# Frontend Onboarding Implementation

## Technology Stack

- **Framework**: React Native with Expo
- **Router**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Local Storage**: AsyncStorage
- **UI**: Custom components with Solarized Dark theme
- **Icons**: lucide-react-native + OpenMoji

## Architecture

### Component Hierarchy

```
OnboardingProvider (Context)
  ├── OnboardingLayout (_layout.tsx)
  │   └── Stack Navigator
  │       ├── welcome.tsx
  │       ├── work-preferences.tsx
  │       ├── challenges.tsx (Note: currently has bug - see below)
  │       ├── adhd-support.tsx
  │       ├── daily-schedule.tsx
  │       ├── goals.tsx
  │       └── complete.tsx
  └── Shared Components
      └── StepProgress.tsx
```

## State Management: OnboardingContext

**Location**: `mobile/src/contexts/OnboardingContext.tsx`

### Context API

```typescript
interface OnboardingContextValue {
  // Data
  data: OnboardingData;
  progress: OnboardingProgress;

  // Update methods
  setWorkPreference: (preference: WorkPreference) => Promise<void>;
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

### Usage Pattern

```typescript
import { useOnboarding } from '@/src/contexts/OnboardingContext';

function MyScreen() {
  const {
    data,
    setWorkPreference,
    nextStep,
    skipOnboarding
  } = useOnboarding();

  const handleContinue = async () => {
    await setWorkPreference('remote');
    await nextStep();
    router.push('/next-screen');
  };
}
```

### Data Persistence Flow

```
User Action
    ↓
Update Local State (setData)
    ↓
Save to AsyncStorage (saveData)
    ↓
Sync to Backend API (onboardingService.upsert)
    ↓
Handle Success/Failure
```

**Key Feature**: If backend sync fails, local data is still saved and the error is logged. User experience is not interrupted.

## Routing & Navigation

**Router**: Expo Router (file-based)

### Route Structure

```
/(auth)/onboarding/
├── _layout.tsx          → Stack navigator wrapper
├── welcome.tsx          → /onboarding/welcome
├── work-preferences.tsx → /onboarding/work-preferences
├── challenges.tsx       → /onboarding/challenges
├── adhd-support.tsx     → /onboarding/adhd-support
├── daily-schedule.tsx   → /onboarding/daily-schedule
├── goals.tsx            → /onboarding/goals
└── complete.tsx         → /onboarding/complete
```

### Navigation Methods

```typescript
import { useRouter } from 'expo-router';

const router = useRouter();

// Forward navigation
router.push('/(auth)/onboarding/work-preferences');

// Back navigation
router.back();

// Replace (no back stack)
router.replace('/(tabs)'); // Go to main app
```

### Layout Configuration

**File**: `mobile/app/(auth)/onboarding/_layout.tsx`

```typescript
<Stack
  screenOptions={{
    headerShown: false,              // Hide default header
    contentStyle: {
      backgroundColor: '#002b36',    // Solarized Dark
    },
    animation: 'slide_from_right',   // Slide animation
    gestureEnabled: true,            // Swipe back enabled
  }}
>
  <Stack.Screen
    name="welcome"
    options={{
      gestureEnabled: false,  // Cannot swipe back from first screen
    }}
  />
  <!-- ... other screens ... -->
</Stack>
```

## Screen Implementation Pattern

### Standard Screen Structure

Every onboarding screen follows this pattern:

```typescript
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { ONBOARDING_STEPS } from '@/src/types/onboarding';
import StepProgress from '@/src/components/onboarding/StepProgress';

export default function MyScreen() {
  const router = useRouter();
  const { data, setMyData, markStepComplete, nextStep, skipOnboarding } = useOnboarding();
  const [localState, setLocalState] = useState(data.myField);

  const handleContinue = async () => {
    await setMyData(localState);
    await markStepComplete(ONBOARDING_STEPS.MY_STEP);
    await nextStep();
    router.push('/(auth)/onboarding/next-screen');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Indicator */}
      <StepProgress currentStep={2} totalSteps={7} />

      <ScrollView style={styles.scrollView}>
        {/* Content here */}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity onPress={handleBack}>
            <Text>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleContinue}>
            <Text>Continue</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSkip}>
          <Text>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### Key Elements

1. **StepProgress**: Shows current position (e.g., "2/7")
2. **ScrollView**: Content area (handles long content)
3. **Navigation Buttons**: Back + Continue
4. **Skip Button**: Always available (except welcome screen)

## Individual Screens

### 1. Welcome Screen

**File**: `mobile/app/(auth)/onboarding/welcome.tsx`

**Purpose**: Introduction to onboarding

**Content**:
- Welcome message
- Benefits list with emojis
- Time estimate (2-3 minutes)
- "Get Started" primary button
- "Skip for now" secondary button

**Special Notes**:
- No back button (first screen)
- Skip available immediately

### 2. Work Preferences Screen

**File**: `mobile/app/(auth)/onboarding/work-preferences.tsx`

**Purpose**: Collect work environment preference

**Options**:
- Remote (Home icon)
- Hybrid (Shuffle icon)
- Office (Building icon)
- Flexible (Palmtree icon)

**UI Pattern**: Card selection with icons

**Validation**: Must select one option to continue

### 3. Challenges Screen (ADHD Challenges)

**File**: `mobile/app/(auth)/onboarding/challenges.tsx`

**Purpose**: Collect specific challenges user faces

**Options** (multi-select):
- Getting started on tasks
- Staying focused
- Time awareness
- Keeping things organized
- Beating procrastination
- Managing overwhelm
- Switching between tasks
- Finishing what I start

**UI Pattern**: Chip-based multi-select

**Special Notes**:
- Can select multiple
- Can continue with 0 selections
- Shows count of selected items
- Routes to ADHD Support Level screen (next step in flow)
- Uses `setChallenges()` method from context to save selections

### 4. ADHD Support Screen

**File**: `mobile/app/(auth)/onboarding/adhd-support.tsx`

**Purpose**: Collect ADHD support level (1-10)

**UI Pattern**: Slider with visual feedback

**Validation**: Must select a level (1-10)

### 5. Daily Schedule Screen

**File**: `mobile/app/(auth)/onboarding/daily-schedule.tsx`

**Purpose**: Collect time preferences and weekly availability

**Fields**:
- Time preference (dropdown)
- Start time (time picker)
- End time (time picker)
- Weekly availability (day toggles)
- Flexible schedule toggle

**UI Pattern**: Form with multiple inputs

### 6. Goals Screen

**File**: `mobile/app/(auth)/onboarding/goals.tsx`

**Purpose**: Collect productivity goals

**Options** (multi-select):
- Task completion
- Focus time
- Project delivery
- Habit building
- Work-life balance
- Creative output
- Learning
- Other

**UI Pattern**: Card-based multi-select

### 7. Complete Screen

**File**: `mobile/app/(auth)/onboarding/complete.tsx`

**Purpose**: Summary and completion

**Content**:
- Success message
- Summary of selections
- Optional ChatGPT export
- "Go to App" button

**Actions**:
- Calls `completeOnboarding()`
- Navigates to `/(tabs)` (main app)

## Components

### StepProgress

**File**: `mobile/src/components/onboarding/StepProgress.tsx`

**Purpose**: Visual progress indicator

**Props**:
```typescript
interface StepProgressProps {
  currentStep: number;      // Current step (1-7)
  totalSteps: number;       // Total steps (7)
  stepLabels?: string[];    // Optional labels
}
```

**Visual Design**:
- Text: "2/7"
- Dots: Filled for completed, current highlighted, empty for future
- Connecting lines between dots
- Current step has pulse effect

**Usage**:
```typescript
<StepProgress currentStep={2} totalSteps={7} />
```

## API Integration

### OnboardingService

**File**: `mobile/src/services/onboardingService.ts`

**Methods**:

```typescript
class OnboardingService {
  // Create or update onboarding data
  async upsertOnboarding(userId: string, data: Partial<OnboardingData>): Promise<OnboardingResponse>

  // Get onboarding data
  async getOnboarding(userId: string): Promise<OnboardingResponse>

  // Mark as completed or skipped
  async markComplete(userId: string, completed: boolean): Promise<OnboardingResponse>

  // Delete all data (reset)
  async deleteOnboarding(userId: string): Promise<void>
}
```

**Error Handling**:
- All methods throw errors (caught by context)
- Context handles errors gracefully (logs, continues)
- User experience not interrupted

## Theme & Styling

### Color Scheme (Solarized Dark)

```typescript
// From mobile/src/theme/colors.ts
export const THEME = {
  base03: '#002b36',  // Background
  base02: '#073642',  // Background highlights
  base01: '#586e75',  // Comments
  base00: '#657b83',  // Body text
  base0:  '#839496',  // Primary content
  base1:  '#93a1a1',  // Optional emphasis
  base2:  '#eee8d5',  // Background highlights (light)
  base3:  '#fdf6e3',  // Background (light)

  yellow:  '#b58900',
  orange:  '#cb4b16',
  red:     '#dc322f',
  magenta: '#d33682',
  violet:  '#6c71c4',
  blue:    '#268bd2',
  cyan:    '#2aa198',
  green:   '#859900',
};
```

### Common Patterns

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
  },
  primaryButton: {
    backgroundColor: THEME.blue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: THEME.base3,
    fontSize: 18,
    fontWeight: '600',
  },
});
```

## TypeScript Types

**File**: `mobile/src/types/onboarding.ts`

See `03_DATA_MODELS.md` for complete type definitions.

## Testing

### Manual Testing Checklist

- [ ] Complete full flow (all 7 steps)
- [ ] Skip at each step
- [ ] Back navigation works
- [ ] Data persists on app restart
- [ ] Works offline (AsyncStorage)
- [ ] Syncs when connection restored
- [ ] Progress indicator shows correct step
- [ ] Can re-open onboarding if skipped

### Dev Tools

**Reset Onboarding**:
```typescript
import { useOnboarding } from '@/src/contexts/OnboardingContext';

const { resetOnboarding } = useOnboarding();
await resetOnboarding(); // Clears AsyncStorage + backend
```

**Check Storage**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const data = await AsyncStorage.getItem('@proxy_agent:onboarding_data');
console.log(JSON.parse(data));
```

## Common Issues & Solutions

### Issue: Onboarding shows on every app start

**Cause**: `hasCompletedOnboarding` not persisted or not checked

**Solution**: Check `OnboardingContext` loading logic:
```typescript
// In _layout.tsx or main app
const { hasCompletedOnboarding, isLoading } = useOnboarding();

if (isLoading) return <LoadingScreen />;
if (!hasCompletedOnboarding) return <Redirect href="/onboarding/welcome" />;
```

### Issue: Data not syncing to backend

**Cause**: Network error or user not authenticated

**Solution**: Check network and auth state:
```typescript
const { user } = useAuth();
if (user?.user_id) {
  await onboardingService.upsertOnboarding(user.user_id, data);
}
```

### Issue: Back button doesn't work

**Cause**: `gestureEnabled: false` in screen options

**Solution**: Remove from screen that needs back:
```typescript
<Stack.Screen
  name="my-screen"
  options={{
    gestureEnabled: true,  // Enable back
  }}
/>
```

## Best Practices

1. **Always await async operations**: Don't let user proceed until save completes
2. **Validate before navigation**: Check data is valid before moving to next screen
3. **Show loading states**: Use loading indicators during saves
4. **Handle errors gracefully**: Log errors but don't block user
5. **Test offline mode**: Ensure AsyncStorage works without network

## Next Steps

- See `02_BACKEND.md` for backend implementation
- See `03_DATA_MODELS.md` for data structures
- See `04_QUICK_START.md` for setup instructions
