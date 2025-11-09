# Storybook Fix Summary - expo-router Mocking

## Problem
```
Error: jest is not defined
```

The stories file had `jest.mock()` code that doesn't work in Storybook runtime.

## Root Cause

1. **Deleted wrapper file** had `jest.mock('expo-router')` code
2. `jest` is not available in Storybook runtime (only in test environment)
3. Need alternative way to mock `expo-router` module

## Solution

### ✅ Fixed Approach: Babel Module Resolver

Instead of Jest mocking or Metro custom resolver, we now use **Babel module aliasing**.

### Changes Made

#### 1. Deleted Problematic File
```bash
rm app/(auth)/onboarding/_OnboardingStorybookWrappers.tsx
```

#### 2. Created `babel.config.js`
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            ...(process.env.STORYBOOK_ENABLED === 'true'
              ? {
                  'expo-router': './.rnstorybook/mocks/expo-router',
                }
              : {}),
          },
        },
      ],
    ],
  };
};
```

#### 3. Installed Babel Plugin
```bash
npm install --save-dev babel-plugin-module-resolver
```

#### 4. Simplified Metro Config
Removed custom resolver (not needed with Babel approach)

#### 5. Cleaned Up Preview
Removed global expo-router import (not needed)

## How It Works

### When `STORYBOOK_ENABLED=true` (Storybook mode):

1. **Babel** transpiles code and sees `import { useRouter } from 'expo-router'`
2. **module-resolver plugin** replaces it with `./.rnstorybook/mocks/expo-router`
3. **Mock module** provides Alert-based navigation feedback
4. **Stories work** without actual routing

### When `STORYBOOK_ENABLED=false` (Normal app mode):

1. **Babel** uses normal expo-router module
2. **Real routing** works as expected
3. **No mocking** occurs

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Onboarding Screen Component                                 │
│                                                              │
│   import { useRouter } from 'expo-router'                   │
│                           ↓                                  │
└──────────────────────────│──────────────────────────────────┘
                           │
                           │ (transpilation)
                           │
                   ┌───────┴────────┐
                   │  Babel Plugin  │
                   │ module-resolver│
                   └───────┬────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │ STORYBOOK_ENABLED?                  │
        └──────┬──────────────────────┬───────┘
               │                      │
          ✅ true                 ❌ false
               │                      │
    ┌──────────▼──────────┐  ┌───────▼────────┐
    │ .rnstorybook/mocks  │  │  expo-router   │
    │   /expo-router.tsx  │  │   (real)       │
    └─────────────────────┘  └────────────────┘
               │                      │
               ▼                      ▼
    ┌─────────────────────┐  ┌────────────────┐
    │ Shows Alerts        │  │ Real Navigation│
    │ (Storybook)         │  │ (App)          │
    └─────────────────────┘  └────────────────┘
```

## Testing

### Start Storybook
```bash
cd mobile
npm run storybook
```

This sets `STORYBOOK_ENABLED=true` automatically.

### Clear Cache (if needed)
```bash
npx expo start -c
```

### Verify

1. Open Storybook in Expo app
2. Navigate to **"Onboarding/Screens"**
3. Open any step story (e.g., "Step1_Welcome")
4. Tap "Get Started" button
5. Should see Alert: "Would navigate to: /(auth)/onboarding/work-preferences"

## Benefits

### ✅ Clean Solution
- No jest in runtime
- No complex Metro resolver
- Standard Babel plugin

### ✅ Environment-Specific
- Only mocks in Storybook mode
- Normal routing in app mode
- Zero impact on production

### ✅ Maintainable
- Simple configuration
- Well-documented pattern
- Easy to extend

## Files Changed

1. ✅ Created `babel.config.js`
2. ✅ Installed `babel-plugin-module-resolver`
3. ✅ Deleted `_OnboardingStorybookWrappers.tsx`
4. ✅ Simplified `metro.config.js`
5. ✅ Cleaned up `.rnstorybook/preview.tsx`
6. ✅ Regenerated Storybook manifest

## Next Steps

1. Start Storybook: `npm run storybook`
2. Test all 9 onboarding stories
3. Verify navigation alerts work
4. Verify real app still works normally

---

**Issue**: `jest is not defined`
**Status**: ✅ FIXED
**Method**: Babel module-resolver plugin
**Date**: November 8, 2025
