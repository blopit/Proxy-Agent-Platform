# OAuth Redirect Navigation Fix

## Problem

After Google OAuth login on web, the app redirects to `http://localhost:8081/(tabs)` instead of:
1. Going to onboarding if not completed
2. Going to capture/add tab if onboarding is complete

## Root Cause Investigation

Two potential issues:
1. **NavigationGuard redirect target**: Was redirecting to `/(tabs)` (first tab) instead of `/(tabs)/capture/add`
2. **Onboarding state check**: Need to verify `hasCompletedOnboarding` is being set correctly for new OAuth users

## Changes Made

### 1. `/mobile/app/_layout.tsx` - NavigationGuard

**Added comprehensive debug logging:**
- Logs auth state on every navigation decision
- Tracks user, loading states, onboarding status, and current route segments
- Logs which redirect path is taken

**Fixed redirect target:**
```typescript
// OLD: Redirected to first tab
router.replace('/(tabs)');

// NEW: Redirects to capture/add subtab
router.replace('/(tabs)/capture/add');
```

**Expected logs:**
```
[NavigationGuard] Auth state: {
  user: true,
  authLoading: false,
  onboardingLoading: false,
  hasCompletedOnboarding: false,
  segments: '(tabs)'
}
[NavigationGuard] User not onboarded, redirecting to onboarding
```

### 2. `/mobile/src/contexts/OnboardingContext.tsx`

**Added debug logging to track onboarding state:**
- Logs when loading from AsyncStorage
- Shows if stored data exists
- Logs `completedAt` and `skipped` values
- Tracks when `hasCompletedOnboarding` is set to true/false

**Expected logs for new user:**
```
[OnboardingContext] Loading onboarding data from AsyncStorage...
[OnboardingContext] Stored data exists: false
[OnboardingContext] No stored data, hasCompletedOnboarding = false
[OnboardingContext] Loading complete, isLoading = false
```

**Expected logs for returning user who completed onboarding:**
```
[OnboardingContext] Loading onboarding data from AsyncStorage...
[OnboardingContext] Stored data exists: true
[OnboardingContext] Parsed data: { completedAt: '2025-11-10...', skipped: false }
[OnboardingContext] Onboarding was completed/skipped, setting hasCompletedOnboarding = true
[OnboardingContext] Loading complete, isLoading = false
```

## Expected Behavior After Fix

### New User (First OAuth Login)
1. User clicks "Sign in with Google"
2. Redirects to Google login
3. Google redirects back to `http://localhost:8081`
4. App loads, NavigationGuard runs:
   - `hasCompletedOnboarding` = false (no stored data)
   - Redirects to `/(auth)/onboarding/welcome`
5. User completes onboarding
6. Redirects to `/(tabs)/capture/add`

### Returning User (Already Onboarded)
1. User clicks "Sign in with Google"
2. Redirects to Google login
3. Google redirects back to `http://localhost:8081`
4. App loads, NavigationGuard runs:
   - `hasCompletedOnboarding` = true (from AsyncStorage)
   - Redirects directly to `/(tabs)/capture/add`

## Testing Steps

1. **Clear app data** to simulate new user:
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   // Reload page
   ```

2. **Click "Sign in with Google"**

3. **Check browser console for logs:**
   - Should see OnboardingContext loading
   - Should see NavigationGuard deciding where to redirect
   - Should redirect to onboarding for new user
   - Should redirect to capture/add for returning user

4. **Complete onboarding** (for new user test)

5. **Verify final destination** is `/(tabs)/capture/add`

## Debugging

If still going to wrong location, check the logs to see:

1. **What is `hasCompletedOnboarding`?**
   - If `true` when it should be `false`, check AsyncStorage data
   - If `false` when it should be `true`, onboarding wasn't saved properly

2. **What are the route segments?**
   - Shows where the app thinks it is
   - Might reveal unexpected routing

3. **Is loading stuck?**
   - If `authLoading` or `onboardingLoading` is always `true`, contexts aren't initializing
   - Check for errors in context initialization

4. **Is the redirect happening?**
   - Logs will show if `router.replace()` is being called
   - If not called, check the conditional logic

## Files Modified

- `/mobile/app/_layout.tsx` - NavigationGuard with debug logs and correct redirect
- `/mobile/src/contexts/OnboardingContext.tsx` - Debug logs for onboarding state tracking
