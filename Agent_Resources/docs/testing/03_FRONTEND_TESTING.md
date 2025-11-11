# Frontend Testing Guide (React Native/Expo)

## Purpose

Frontend tests verify React Native components, hooks, navigation, and mobile app logic work correctly.

## Testing Stack

| Tool | Purpose |
|------|---------|
| **Jest** | Test runner and framework |
| **React Native Testing Library** | Component testing utilities |
| **@testing-library/react-hooks** | Custom hook testing |
| **@testing-library/jest-native** | Additional matchers |
| **MSW (Mock Service Worker)** | API mocking |

## Setup

### Install Dependencies

```bash
cd mobile

# Install testing dependencies
npm install --save-dev \
  @testing-library/react-native \
  @testing-library/jest-native \
  @testing-library/react-hooks \
  jest-expo \
  msw

# Update package.json
```

### Jest Configuration

```javascript
// mobile/jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
```

## Component Testing

### Basic Component Test

```typescript
// mobile/app/(auth)/onboarding/work-preferences.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WorkPreferencesScreen from './work-preferences';
import { OnboardingProvider } from '@/src/contexts/OnboardingContext';

describe('WorkPreferencesScreen', () => {
  it('renders work preference options', () => {
    const { getByText } = render(
      <OnboardingProvider>
        <WorkPreferencesScreen />
      </OnboardingProvider>
    );

    expect(getByText('Remote')).toBeTruthy();
    expect(getByText('Hybrid')).toBeTruthy();
    expect(getByText('Office')).toBeTruthy();
    expect(getByText('Flexible')).toBeTruthy();
  });

  it('selects work preference when tapped', () => {
    const { getByText, getByTestId } = render(
      <OnboardingProvider>
        <WorkPreferencesScreen />
      </OnboardingProvider>
    );

    const remoteOption = getByText('Remote');
    fireEvent.press(remoteOption);

    expect(getByTestId('selected-preference')).toHaveTextContent('remote');
  });

  it('navigates to next step when Continue is pressed', async () => {
    const mockNavigate = jest.fn();
    const { getByText } = render(
      <OnboardingProvider>
        <WorkPreferencesScreen navigation={{ navigate: mockNavigate }} />
      </OnboardingProvider>
    );

    fireEvent.press(getByText('Remote'));
    fireEvent.press(getByText('Continue'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('adhd-support');
    });
  });
});
```

### Testing User Interactions

```typescript
it('updates form when user types', () => {
  const { getByPlaceholderText } = render(<LoginScreen />);

  const emailInput = getByPlaceholderText('Email');
  const passwordInput = getByPlaceholderText('Password');

  fireEvent.changeText(emailInput, 'test@example.com');
  fireEvent.changeText(passwordInput, 'password123');

  expect(emailInput.props.value).toBe('test@example.com');
  expect(passwordInput.props.value).toBe('password123');
});
```

### Testing Conditional Rendering

```typescript
it('shows error message when login fails', async () => {
  const { getByText, getByPlaceholderText, findByText } = render(<LoginScreen />);

  fireEvent.changeText(getByPlaceholderText('Email'), 'wrong@example.com');
  fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpass');
  fireEvent.press(getByText('Log In'));

  const errorMessage = await findByText('Invalid credentials');
  expect(errorMessage).toBeTruthy();
});
```

## Context Testing

### Testing Context Providers

```typescript
// mobile/src/contexts/__tests__/OnboardingContext.test.tsx
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { OnboardingProvider, useOnboarding } from '../OnboardingContext';

describe('OnboardingContext', () => {
  it('provides initial onboarding state', () => {
    const wrapper = ({ children }) => (
      <OnboardingProvider>{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    expect(result.current.data).toEqual({});
    expect(result.current.progress.currentStep).toBe(1);
    expect(result.current.hasCompletedOnboarding).toBe(false);
  });

  it('updates onboarding data', async () => {
    const wrapper = ({ children }) => (
      <OnboardingProvider>{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    await act(async () => {
      await result.current.saveData({ work_preference: 'remote' });
    });

    expect(result.current.data.work_preference).toBe('remote');
  });

  it('marks onboarding as complete', async () => {
    const wrapper = ({ children }) => (
      <OnboardingProvider>{children}</OnboardingProvider>
    );

    const { result } = renderHook(() => useOnboarding(), { wrapper });

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.hasCompletedOnboarding).toBe(true);
  });
});
```

## Custom Hook Testing

```typescript
// mobile/src/hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('starts with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logs in user successfully', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('test@example.com');
  });

  it('logs out user', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'password');
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
```

## API Mocking

### Using MSW (Mock Service Worker)

```typescript
// mobile/src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:8000/api/v1/users/me', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      })
    );
  }),

  rest.put('http://localhost:8000/api/v1/users/:userId/onboarding', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user_id: req.params.userId,
        ...req.body,
        onboarding_completed: false,
      })
    );
  }),
];

// mobile/src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Setup in Tests

```typescript
// mobile/src/setupTests.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Test with Mock API

```typescript
import { server } from '@/mocks/server';
import { rest } from 'msw';

it('handles API error gracefully', async () => {
  // Override the handler for this test
  server.use(
    rest.get('http://localhost:8000/api/v1/users/me', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );

  const { getByText, findByText } = render(<ProfileScreen />);

  const errorMessage = await findByText('Failed to load profile');
  expect(errorMessage).toBeTruthy();
});
```

## Navigation Testing

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

describe('Onboarding Navigation', () => {
  it('navigates through onboarding flow', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="welcome" component={WelcomeScreen} />
          <Stack.Screen name="work-preferences" component={WorkPreferencesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    fireEvent.press(getByText('Get Started'));

    await waitFor(() => {
      expect(getByText('Work Preferences')).toBeTruthy();
    });
  });
});
```

## Snapshot Testing

```typescript
import renderer from 'react-test-renderer';

it('matches snapshot', () => {
  const tree = renderer
    .create(
      <OnboardingProvider>
        <WorkPreferencesScreen />
      </OnboardingProvider>
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});

// Update snapshots with: npm test -- -u
```

## AsyncStorage Testing

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
  AsyncStorage.clear();
});

it('saves data to AsyncStorage', async () => {
  const { result } = renderHook(() => useOnboarding());

  await act(async () => {
    await result.current.saveData({ work_preference: 'remote' });
  });

  const stored = await AsyncStorage.getItem('@proxy_agent:onboarding_data');
  const data = JSON.parse(stored || '{}');

  expect(data.work_preference).toBe('remote');
});
```

## Running Frontend Tests

```bash
cd mobile

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test work-preferences.test.tsx

# Run in watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

## Best Practices

✅ **DO**:
- Test user behavior, not implementation
- Use `getByRole`, `getByLabelText`, `getByText` over `getByTestId`
- Mock external dependencies (APIs, AsyncStorage)
- Test loading and error states
- Keep tests focused and independent

❌ **DON'T**:
- Test component internals (state, props)
- Test library code (React Navigation, Expo)
- Make tests depend on each other
- Use `setTimeout` for async (use `waitFor`)
- Ignore accessibility in tests

## Next Steps

- **E2E Testing**: See `04_E2E_TESTING.md`
- **Test Data**: See `05_TEST_DATA.md`
- **Quick Start**: See `06_QUICK_START.md`

---

**Last Updated**: November 2025
**Version**: 1.0
