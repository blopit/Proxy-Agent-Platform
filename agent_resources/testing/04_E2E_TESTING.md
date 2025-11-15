# End-to-End (E2E) Testing Guide

## Purpose

E2E tests verify complete user workflows across the entire system (mobile app → API → database → mobile app). They test the system from the user's perspective.

## Status

✅ **Backend E2E testing is IMPLEMENTED and WORKING!** (See [07_E2E_IMPLEMENTATION.md](./07_E2E_IMPLEMENTATION.md))

🚧 **Frontend E2E testing is not yet implemented** - This document outlines the planned approach for mobile/web E2E tests.

## Characteristics

✅ **Full system**: Tests entire stack from UI to database
✅ **User perspective**: Simulates real user interactions
✅ **Slow**: 5-30 seconds per test (slowest test type)
✅ **Brittle**: Changes to UI/API can break tests
✅ **High confidence**: Ensures everything works together

## When to Use E2E Tests

Use E2E tests for:
- Critical user journeys (signup, login, core workflows)
- Payment/transaction flows
- Multi-step wizards (onboarding)
- Cross-platform compatibility
- Smoke tests for deployment

Don't use for:
- Testing business logic (use unit tests)
- Testing individual components (use component tests)
- Testing API endpoints (use integration tests)

## Recommended Tools

### For React Native/Expo

**Detox** (Recommended)
- Gray box E2E testing for React Native
- Runs on actual/simulated devices
- Fast and reliable
- https://wix.github.io/Detox/

**Maestro** (Alternative)
- Simple, declarative UI testing
- Cross-platform (iOS, Android, React Native)
- Easy to write and maintain
- https://maestro.mobile.dev/

**Appium** (Alternative)
- Universal mobile automation
- Works with any mobile framework
- More complex setup
- https://appium.io/

## Planned E2E Test Structure

```
tests/
└── e2e/
    ├── setup/
    │   ├── detox.config.js
    │   └── helpers.ts
    ├── specs/
    │   ├── onboarding.e2e.ts
    │   ├── auth.e2e.ts
    │   ├── task-creation.e2e.ts
    │   └── complete-workflow.e2e.ts
    └── README.md
```

## Example E2E Test (Detox)

### Setup

```bash
cd mobile

# Install Detox
npm install --save-dev detox

# Install Detox CLI
npm install -g detox-cli

# Initialize Detox
detox init
```

### Configuration

```javascript
// mobile/.detoxrc.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/ProxyAgent.app',
      build: 'xcodebuild -workspace ios/ProxyAgent.xcworkspace -scheme ProxyAgent -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081]
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_33'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug'
    }
  }
};
```

### Onboarding E2E Test

```typescript
// tests/e2e/specs/onboarding.e2e.ts
describe('Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should complete full onboarding flow', async () => {
    // Welcome screen
    await expect(element(by.text('Welcome to Proxy Agent'))).toBeVisible();
    await element(by.text('Get Started')).tap();

    // Work preferences
    await expect(element(by.text('Work Preferences'))).toBeVisible();
    await element(by.text('Remote')).tap();
    await element(by.text('Continue')).tap();

    // ADHD support
    await expect(element(by.text('ADHD Support'))).toBeVisible();
    await element(by.id('adhd-slider')).swipe('right', 'slow', 0.7);
    await element(by.text('Continue')).tap();

    // Challenges
    await expect(element(by.text('Challenges'))).toBeVisible();
    await element(by.text('Time Blindness')).tap();
    await element(by.text('Focus Issues')).tap();
    await element(by.text('Continue')).tap();

    // Daily schedule
    await expect(element(by.text('Daily Schedule'))).toBeVisible();
    await element(by.text('Morning')).tap();
    await element(by.text('Continue')).tap();

    // Goals
    await expect(element(by.text('Productivity Goals'))).toBeVisible();
    await element(by.text('Reduce Overwhelm')).tap();
    await element(by.text('Increase Focus')).tap();
    await element(by.text('Continue')).tap();

    // Complete
    await expect(element(by.text('All Set!'))).toBeVisible();
    await element(by.text('Get Started')).tap();

    // Should navigate to main app
    await expect(element(by.text('Today'))).toBeVisible();
  });

  it('should allow skipping onboarding', async () => {
    await expect(element(by.text('Welcome to Proxy Agent'))).toBeVisible();
    await element(by.text('Skip for now')).tap();

    // Should go to main app
    await expect(element(by.text('Today'))).toBeVisible();
  });

  it('should allow going back through steps', async () => {
    await element(by.text('Get Started')).tap();
    await element(by.text('Remote')).tap();
    await element(by.text('Continue')).tap();

    // Go back
    await element(by.id('back-button')).tap();

    // Should be on work preferences
    await expect(element(by.text('Work Preferences'))).toBeVisible();
  });
});
```

### Authentication E2E Test

```typescript
// tests/e2e/specs/auth.e2e.ts
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should login successfully with valid credentials', async () => {
    // Navigate to login
    await element(by.text('Log In')).tap();

    // Enter credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();

    // Should navigate to main app
    await waitFor(element(by.text('Today')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show error with invalid credentials', async () => {
    await element(by.text('Log In')).tap();

    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpass');
    await element(by.id('login-button')).tap();

    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });

  it('should complete signup flow', async () => {
    await element(by.text('Sign Up')).tap();

    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('signup-button')).tap();

    // Should start onboarding
    await waitFor(element(by.text('Welcome to Proxy Agent')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

### Complete User Journey

```typescript
// tests/e2e/specs/complete-workflow.e2e.ts
describe('Complete User Journey', () => {
  it('should complete signup → onboarding → create task flow', async () => {
    // 1. Sign up
    await device.launchApp();
    await element(by.text('Sign Up')).tap();
    await element(by.id('email-input')).typeText('journey@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('signup-button')).tap();

    // 2. Complete onboarding
    await element(by.text('Get Started')).tap();
    await element(by.text('Remote')).tap();
    await element(by.text('Continue')).tap();
    // ... complete all onboarding steps ...
    await element(by.text('Get Started')).tap();

    // 3. Create first task
    await element(by.id('capture-tab')).tap();
    await element(by.id('task-input')).typeText('Buy groceries');
    await element(by.id('add-task-button')).tap();

    // 4. Verify task appears
    await element(by.id('today-tab')).tap();
    await expect(element(by.text('Buy groceries'))).toBeVisible();

    // 5. Complete task
    await element(by.text('Buy groceries')).tap();
    await element(by.id('mark-complete-button')).tap();

    // 6. Verify completion
    await expect(element(by.id('task-complete-checkmark'))).toBeVisible();
  });
});
```

## Example E2E Test (Maestro)

### Simple YAML Format

```yaml
# tests/e2e/flows/onboarding.yaml
appId: com.proxyagent.app
---
- launchApp

- assertVisible: "Welcome to Proxy Agent"
- tapOn: "Get Started"

- assertVisible: "Work Preferences"
- tapOn: "Remote"
- tapOn: "Continue"

- assertVisible: "ADHD Support"
- tapOn:
    id: "adhd-slider"
- swipe:
    direction: RIGHT
    duration: 1000
- tapOn: "Continue"

- assertVisible: "Challenges"
- tapOn: "Time Blindness"
- tapOn: "Focus Issues"
- tapOn: "Continue"

- assertVisible: "Daily Schedule"
- tapOn: "Morning"
- tapOn: "Continue"

- assertVisible: "Productivity Goals"
- tapOn: "Reduce Overwhelm"
- tapOn: "Continue"

- assertVisible: "All Set!"
- tapOn: "Get Started"

- assertVisible: "Today"
```

### Run Maestro Test

```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Run test
maestro test tests/e2e/flows/onboarding.yaml
```

## Running E2E Tests

### Detox

```bash
# Build app
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug

# Run specific test
detox test tests/e2e/specs/onboarding.e2e.ts --configuration ios.sim.debug

# Run with video recording
detox test --configuration ios.sim.debug --record-videos all

# Run on Android
detox test --configuration android.emu.debug
```

### Maestro

```bash
# Run all flows
maestro test tests/e2e/flows/

# Run specific flow
maestro test tests/e2e/flows/onboarding.yaml

# Record run
maestro test --format junit --output reports/ tests/e2e/flows/

# Interactive mode
maestro studio
```

## Best Practices

✅ **DO**:
- Test critical user paths
- Use stable selectors (testID, accessibility labels)
- Add waits for async operations
- Clean up test data after runs
- Run E2E tests before releases
- Keep tests independent
- Use page object pattern for reusability

❌ **DON'T**:
- Test everything with E2E (prefer unit/integration)
- Use fragile selectors (text that changes)
- Make tests depend on each other
- Test edge cases (use unit tests)
- Run E2E tests on every commit (too slow)
- Use hard-coded delays (use waitFor)

## CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: |
          cd mobile
          npm install

      - name: Setup iOS environment
        run: |
          xcrun simctl boot "iPhone 15 Pro" || true

      - name: Build app
        run: detox build --configuration ios.sim.debug

      - name: Run E2E tests
        run: detox test --configuration ios.sim.debug --record-videos failing

      - name: Upload videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-videos
          path: mobile/artifacts/**/*.mp4

  e2e-android:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Android emulator
        run: |
          # Setup and start emulator

      - name: Run E2E tests
        run: detox test --configuration android.emu.debug
```

## Debugging E2E Tests

```bash
# Run in debug mode
detox test --configuration ios.sim.debug --loglevel trace

# Take screenshot on failure
await device.takeScreenshot('test-failed');

# Pause execution for inspection
await device.pressBack();  # iOS
await device.openURL({ url: 'deeplinkurl' });

# Record video
detox test --configuration ios.sim.debug --record-videos all
```

## Page Object Pattern

```typescript
// tests/e2e/pages/OnboardingPage.ts
export class OnboardingPage {
  async tapGetStarted() {
    await element(by.text('Get Started')).tap();
  }

  async selectWorkPreference(preference: string) {
    await element(by.text(preference)).tap();
  }

  async tapContinue() {
    await element(by.text('Continue')).tap();
  }

  async assertOnStep(stepName: string) {
    await expect(element(by.text(stepName))).toBeVisible();
  }
}

// Usage in test
import { OnboardingPage } from '../pages/OnboardingPage';

const onboarding = new OnboardingPage();

it('completes onboarding', async () => {
  await onboarding.tapGetStarted();
  await onboarding.selectWorkPreference('Remote');
  await onboarding.tapContinue();
});
```

## Future Implementation

When implementing E2E tests:

1. **Choose tool**: Detox (recommended) or Maestro
2. **Setup infrastructure**: Simulators/emulators, CI/CD
3. **Identify critical paths**: 5-10 most important user journeys
4. **Write tests**: Start with happy paths
5. **Add to CI/CD**: Run on PRs to main
6. **Maintain**: Update as UI changes

## Next Steps

- **Test Data**: See `05_TEST_DATA.md`
- **Quick Start**: See `06_QUICK_START.md`
- **Integration Tests**: See `02_INTEGRATION_TESTING.md`

---

**Last Updated**: November 2025
**Version**: 1.0
**Status**: 🚧 Planned (Not Yet Implemented)
