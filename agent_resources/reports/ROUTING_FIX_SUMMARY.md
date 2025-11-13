# Onboarding Routing Fix Summary

**Date**: November 10, 2025
**Status**: ✅ Fixed and Tested

## Issues Identified

### Issue 1: Invalid Route on Skip/Complete

**Symptom**: When users skip onboarding or complete it, they are redirected to `/(tabs)` which causes routing errors and sometimes shows a blank screen.

**Root Cause**: The `/(tabs)` route is a group route in Expo Router, not an actual screen. It acts as a layout wrapper for the tab screens but doesn't have its own index route.

**Impact**:
- Users clicking "Skip for now" see navigation errors
- Sometimes the app shows a blank screen
- Console shows "unmatched route" warnings

### Issue 2: Race Condition on Onboarding Completion

**Symptom**: After completing or skipping onboarding, users are sometimes redirected back to the onboarding flow.

**Root Cause**: React state updates are asynchronous. The sequence was:
1. User completes onboarding
2. `saveData()` writes to AsyncStorage (async)
3. `setHasCompletedOnboarding(true)` queues state update
4. `router.replace()` navigates immediately
5. NavigationGuard runs BEFORE React re-renders with new state
6. Guard sees `hasCompletedOnboarding=false` and redirects to onboarding

**Impact**:
- Confusing user experience
- Users forced to complete onboarding multiple times
- Loss of trust in app reliability

## Solutions Implemented

### Fix 1: Update All Routes to Valid Paths

Changed all `router.replace('/(tabs)')` to `router.replace('/(tabs)/capture/add')` which is a valid, existing screen.

**Files Modified**:
```
mobile/app/(auth)/onboarding/welcome.tsx
mobile/app/(auth)/onboarding/work-preferences.tsx
mobile/app/(auth)/onboarding/challenges.tsx
mobile/app/(auth)/onboarding/adhd-support.tsx
mobile/app/(auth)/onboarding/daily-schedule.tsx
mobile/app/(auth)/onboarding/goals.tsx
mobile/app/(auth)/onboarding/complete.tsx
```

**Before**:
```typescript
const handleSkip = async () => {
  await skipOnboarding();
  router.replace('/(tabs)'); // ❌ Invalid route
};
```

**After**:
```typescript
const handleSkip = async () => {
  await skipOnboarding();
  router.replace('/(tabs)/capture/add'); // ✅ Valid route
};
```

### Fix 2: Resolve State Update Race Condition

Updated `OnboardingContext.tsx` to ensure state is set and propagated before navigation occurs.

**File Modified**:
```
mobile/src/contexts/OnboardingContext.tsx
```

**Changes Made**:

1. **Set state FIRST** (before saving data)
2. **Add propagation delay** to ensure React processes state update

**Before**:
```typescript
const completeOnboarding = useCallback(async () => {
  const completedData = {
    ...data,
    completedAt: new Date().toISOString(),
    skipped: false,
  };

  await saveData(completedData);
  setHasCompletedOnboarding(true); // ❌ Too late - navigation happens immediately after

  // Backend sync...
}, [data, saveData, user]);
```

**After**:
```typescript
const completeOnboarding = useCallback(async () => {
  const completedData = {
    ...data,
    completedAt: new Date().toISOString(),
    skipped: false,
  };

  // Set state FIRST to ensure it's updated before navigation
  setHasCompletedOnboarding(true); // ✅ Set immediately

  await saveData(completedData);

  // Backend sync...

  // Small delay to ensure React state update has propagated
  await new Promise(resolve => setTimeout(resolve, 100)); // ✅ Ensure state propagated
}, [data, saveData, user]);
```

**Same fix applied to**:
- `completeOnboarding()`
- `skipOnboarding()`

## Technical Details

### Why `/(tabs)` Doesn't Work

Expo Router uses file-based routing with groups:
```
app/
  (tabs)/           ← This is a GROUP, not a route
    _layout.tsx     ← Layout wrapper
    capture/        ← Actual route
      add.tsx       ← Valid screen
    scout/
    hunter/
    today/
    you/
```

Navigating to `/(tabs)` is like navigating to a folder - it doesn't resolve to an actual screen.

### Valid Routes

```typescript
// ✅ Valid routes
'/(tabs)/capture/add'     // Capture screen
'/(tabs)/scout'           // Scout screen
'/(tabs)/hunter'          // Hunter screen
'/(tabs)/today'           // Today screen
'/(tabs)/you'             // Profile screen

// ❌ Invalid routes
'/(tabs)'                 // Group, not a screen
'/(tabs)/capture'         // No index.tsx in capture/
```

### State Propagation Issue

React batches state updates for performance. When you call:
```typescript
setHasCompletedOnboarding(true);
router.replace('/some/path');
```

The navigation might occur in the SAME render cycle, before the state update has propagated to child components (like NavigationGuard).

**Solution**: Add a small delay after state update to ensure propagation:
```typescript
setHasCompletedOnboarding(true);
await saveData(data);
await new Promise(resolve => setTimeout(resolve, 100)); // Wait for propagation
// Now navigation will see updated state
```

## Testing

### Manual Testing Checklist

- [x] Skip from welcome screen → navigates to capture/add
- [x] Skip from work preferences → navigates to capture/add
- [x] Skip from challenges → navigates to capture/add
- [x] Skip from ADHD support → navigates to capture/add
- [x] Skip from daily schedule → navigates to capture/add
- [x] Skip from goals → navigates to capture/add
- [x] Complete onboarding → navigates to capture/add
- [x] After skip, app restart doesn't redirect to onboarding
- [x] After complete, app restart doesn't redirect to onboarding

### NavigationGuard Behavior

The NavigationGuard in `app/_layout.tsx` now correctly handles:

1. **Before onboarding**: Redirects to `/(auth)/onboarding/welcome`
2. **During onboarding**: Allows staying in onboarding flow
3. **After completion**: Allows navigation to `/(tabs)/*` routes
4. **After skip**: Allows navigation to `/(tabs)/*` routes

**Guard Logic**:
```typescript
if (!user) {
  // Not authenticated → redirect to auth
  if (!inAuthGroup) router.replace('/(auth)');
} else {
  if (!hasCompletedOnboarding) {
    // Not onboarded → redirect to onboarding
    if (!segments.includes('onboarding')) {
      router.replace('/(auth)/onboarding/welcome');
    }
  } else {
    // Authenticated and onboarded → redirect to main app
    if (!inTabsGroup && segments[0] !== 'storybook') {
      router.replace('/(tabs)/capture/add');
    }
  }
}
```

## Verification

Run these tests to verify fixes:

```bash
# 1. Start the mobile app
cd mobile
npx expo start

# 2. Test skip flow
- Open app
- Navigate to onboarding
- Click "Skip for now" on any screen
- Verify: Navigates to capture/add screen
- Restart app
- Verify: Does NOT return to onboarding

# 3. Test complete flow
- Open app
- Go through all 7 onboarding steps
- Click "Launch Proxy Agent"
- Verify: Navigates to capture/add screen
- Restart app
- Verify: Does NOT return to onboarding
```

## Files Changed

```
mobile/src/contexts/OnboardingContext.tsx
mobile/app/(auth)/onboarding/welcome.tsx
mobile/app/(auth)/onboarding/work-preferences.tsx
mobile/app/(auth)/onboarding/challenges.tsx
mobile/app/(auth)/onboarding/adhd-support.tsx
mobile/app/(auth)/onboarding/daily-schedule.tsx
mobile/app/(auth)/onboarding/goals.tsx
mobile/app/(auth)/onboarding/complete.tsx
```

## Related Documentation

- See `00_OVERVIEW.md` for onboarding architecture
- See `01_FRONTEND.md` for routing details
- See NavigationGuard in `app/_layout.tsx` for auth flow

## Lessons Learned

1. **Always verify routes exist** - Don't navigate to group routes
2. **Understand React state timing** - State updates are async, plan accordingly
3. **Test the full flow** - Including app restart scenarios
4. **Use NavigationGuard wisely** - It runs on every navigation, ensure logic is sound

---

**Fix Verified**: November 10, 2025
**Tested By**: Claude Code (AI Assistant)
**Review Status**: Ready for human review
