# Frontend Authentication Implementation

## Overview

The frontend authentication system is built with React Native (Expo) and provides a complete auth flow including email/password login, OAuth social login, token management, and persistent storage.

**Tech Stack:**
- React Native with Expo
- React Context API for state management
- AsyncStorage for token persistence
- Fetch API for HTTP requests
- expo-auth-session for OAuth flows

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Mobile App (React Native)               │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │              App Entry Point                       │    │
│  │              mobile/app/_layout.tsx                │    │
│  │                                                     │    │
│  │  <AuthProvider>                                    │    │
│  │    <OnboardingProvider>                            │    │
│  │      <App Routes />                                │    │
│  │    </OnboardingProvider>                           │    │
│  │  </AuthProvider>                                   │    │
│  └───────────────────────────────────────────────────┘    │
│                         │                                   │
│  ┌──────────────────────▼──────────────────────────────┐  │
│  │           AuthContext (Global State)                 │  │
│  │           mobile/src/contexts/AuthContext.tsx        │  │
│  │                                                       │  │
│  │  State:                                              │  │
│  │   - user: User | null                                │  │
│  │   - token: string | null                             │  │
│  │   - refreshToken: string | null                      │  │
│  │   - isLoading: boolean                               │  │
│  │   - isAuthenticated: boolean                         │  │
│  │   - error: string | null                             │  │
│  │                                                       │  │
│  │  Methods:                                            │  │
│  │   - login(username, password)                        │  │
│  │   - loginWithToken(tokenResponse)                    │  │
│  │   - signup(name, email, password)                    │  │
│  │   - logout()                                         │  │
│  │   - refreshAccessToken()                             │  │
│  └───────────────┬───────────────────┬──────────────────┘  │
│                  │                   │                      │
│  ┌───────────────▼──────────┐   ┌───▼──────────────────┐  │
│  │    authService            │   │   AsyncStorage       │  │
│  │    API Client             │   │   Token Storage      │  │
│  │                           │   │                      │  │
│  │  - register()             │   │  Keys:               │  │
│  │  - login()                │   │   @auth_token        │  │
│  │  - refreshToken()         │   │   @auth_refresh_token│  │
│  │  - logout()               │   │   @auth_user         │  │
│  │  - getProfile()           │   │                      │  │
│  └───────────────┬───────────┘   └──────────────────────┘  │
│                  │                                          │
│                  │ HTTP/HTTPS                               │
│                  ▼                                          │
│            Backend API                                      │
│         (FastAPI/Python)                                    │
└────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. AuthContext (State Management)

**Location**: `mobile/src/contexts/AuthContext.tsx`

Provides global authentication state and methods throughout the app.

#### Context Definition

```typescript
interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Methods
  login: (username: string, password: string) => Promise<void>;
  loginWithToken: (tokenResponse: TokenResponse) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  clearError: () => void;
}
```

#### Storage Keys

```typescript
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
const USER_KEY = '@auth_user';
```

#### Loading Stored Auth (mobile/src/contexts/AuthContext.tsx:45-75)

Automatically loads tokens from AsyncStorage on app launch:

```typescript
useEffect(() => {
  loadStoredAuth();
}, []);

const loadStoredAuth = async () => {
  try {
    const [storedToken, storedRefreshToken, storedUser] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);

    console.log('[AuthContext] Loading stored auth from AsyncStorage...');
    console.log('[AuthContext] Stored token exists:', !!storedToken);
    console.log('[AuthContext] Stored refresh_token exists:', !!storedRefreshToken);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
      console.log('[AuthContext] Auth state restored from AsyncStorage');
    } else {
      console.log('[AuthContext] No stored auth data found');
    }
  } catch (err) {
    console.error('[AuthContext] Failed to load auth data:', err);
  } finally {
    setIsLoading(false);
  }
};
```

#### Saving Auth Data (mobile/src/contexts/AuthContext.tsx:77-99)

Persists tokens to AsyncStorage:

```typescript
const saveAuthData = async (tokenResponse: TokenResponse) => {
  try {
    console.log('[AuthContext] Saving auth data...');

    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, tokenResponse.access_token),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(tokenResponse.user)),
    ]);

    console.log('[AuthContext] Auth data saved to AsyncStorage successfully');

    setToken(tokenResponse.access_token);
    setRefreshToken(tokenResponse.refresh_token);
    setUser(tokenResponse.user);
  } catch (err) {
    console.error('[AuthContext] Failed to save auth data:', err);
    throw new Error('Failed to save authentication data');
  }
};
```

#### Login Method (mobile/src/contexts/AuthContext.tsx:116-132)

Email/password authentication:

```typescript
const login = async (username: string, password: string) => {
  try {
    setIsLoading(true);
    setError(null);

    const loginData: LoginRequest = { username, password };
    const response = await authService.login(loginData);

    await saveAuthData(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

#### OAuth Login Method (mobile/src/contexts/AuthContext.tsx:134-148)

For social login (Google, Apple, etc.):

```typescript
const loginWithToken = async (tokenResponse: TokenResponse) => {
  try {
    setIsLoading(true);
    setError(null);

    // Save OAuth token response (includes access_token and refresh_token)
    await saveAuthData(tokenResponse);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OAuth login failed';
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

#### Signup Method (mobile/src/contexts/AuthContext.tsx:150-175)

User registration:

```typescript
const signup = async (name: string, email: string, password: string) => {
  try {
    setIsLoading(true);
    setError(null);

    // Extract username from email (before @)
    const username = email.split('@')[0];

    const registerData: RegisterRequest = {
      username,
      email,
      password,
      full_name: name,
    };

    const response = await authService.register(registerData);

    await saveAuthData(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    setError(message);
    throw err;
  } finally {
    setIsLoading(false);
  }
};
```

#### Token Refresh (mobile/src/contexts/AuthContext.tsx:177-193)

Automatically refreshes expired access tokens:

```typescript
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    const response = await authService.refreshToken(refreshToken);
    await saveAuthData(response);
    return response.access_token;
  } catch (err) {
    console.error('Token refresh failed:', err);
    // If refresh fails, clear auth data and force re-login
    await clearAuthData();
    return null;
  }
};
```

#### Logout Method (mobile/src/contexts/AuthContext.tsx:195-211)

Clears tokens and logs out:

```typescript
const logout = async () => {
  console.log('[AuthContext] Logout called');
  try {
    setIsLoading(true);
    console.log('[AuthContext] Calling authService.logout()...');
    await authService.logout(token || undefined);
    console.log('[AuthContext] Backend logout successful, clearing local data...');
    await clearAuthData();
    console.log('[AuthContext] Logout complete - all data cleared');
  } catch (err) {
    console.error('[AuthContext] Logout error:', err);
  } finally {
    setIsLoading(false);
  }
};

const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  } catch (err) {
    console.error('Failed to clear auth data:', err);
  }
};
```

#### Using AuthContext in Components

```typescript
import { useAuth } from '@/src/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Text>Please log in</Text>;
  }

  return (
    <View>
      <Text>Welcome, {user?.full_name}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

### 2. authService (API Client)

**Location**: `mobile/src/services/authService.ts`

Handles HTTP communication with backend auth endpoints.

#### API Configuration

```typescript
import { API_BASE_URL } from '@/src/api/config';

// mobile/src/api/config.ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
```

#### Register Method

```typescript
async register(data: RegisterRequest): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
}
```

#### Login Method

```typescript
async login(data: LoginRequest): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}
```

#### Refresh Token Method

```typescript
async refreshToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Token refresh failed');
  }

  return response.json();
}
```

#### Logout Method

```typescript
async logout(token?: string): Promise<void> {
  console.log('[AuthService] Logout called, token provided:', !!token);
  if (token) {
    try {
      console.log('[AuthService] Sending logout request to backend...');
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('[AuthService] Backend logout response status:', response.status);
    } catch (error) {
      console.error('[AuthService] Logout API call failed:', error);
      // Continue with local cleanup even if backend call fails
    }
  }
}
```

#### Get Profile Method

```typescript
async getProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch profile');
  }

  return response.json();
}
```

### 3. API Client with Token Management

**Location**: `mobile/src/api/apiClient.ts`

Provides authenticated HTTP helpers with automatic token refresh.

```typescript
import { useAuth } from '@/src/contexts/AuthContext';

// Helper to get current token
const getAuthToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem('@auth_token');
  return token;
};

// Authenticated GET request
export async function apiGet(url: string): Promise<Response> {
  const token = await getAuthToken();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  // If 401, try to refresh token
  if (response.status === 401) {
    const newToken = await refreshTokenIfNeeded();
    if (newToken) {
      // Retry with new token
      return fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
      });
    }
  }

  return response;
}

// Authenticated POST request
export async function apiPost(url: string, data: any): Promise<Response> {
  const token = await getAuthToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    const newToken = await refreshTokenIfNeeded();
    if (newToken) {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    }
  }

  return response;
}

// Similar implementations for apiPut, apiDelete...
```

### 4. Auth Screens

#### Login Screen (mobile/app/(auth)/login.tsx)

```typescript
import { useAuth } from '@/src/contexts/AuthContext';
import { oauthService } from '@/src/services/oauthService';

export default function LoginRoute() {
  const router = useRouter();
  const { login, loginWithToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      router.replace('/(auth)/onboarding/welcome');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    setError('');

    try {
      let result;

      switch (provider) {
        case 'google':
          result = await oauthService.signInWithGoogle();
          break;
        case 'apple':
          result = await oauthService.signInWithApple();
          break;
        // ... other providers
      }

      await loginWithToken(result);
      router.replace('/(auth)/onboarding/welcome');
    } catch (err) {
      const message = err instanceof Error ? err.message : `${provider} login failed`;
      if (!message.includes('cancelled')) {
        setError(message);
      }
      setIsLoading(false);
    }
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onSocialLogin={handleSocialLogin}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

#### Signup Screen (mobile/app/(auth)/signup.tsx)

```typescript
export default function SignupRoute() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignupPress = () => {
    router.push('/(auth)/signup-email');
  };

  const handleSocialSignup = async (provider: SocialProvider) => {
    setIsLoading(true);
    setError('');

    try {
      let result;

      switch (provider) {
        case 'google':
          result = await oauthService.signInWithGoogle();
          break;
        // ... other providers
      }

      await loginWithToken(result);
      router.replace('/(auth)/onboarding/welcome');
    } catch (err) {
      // Error handling
    }
  };

  return (
    <SignupScreen
      onEmailSignupPress={handleEmailSignupPress}
      onSocialLogin={handleSocialSignup}
      isLoading={isLoading}
      error={error}
    />
  );
}
```

## Authentication Flows

### Email/Password Login Flow

```
1. User enters email and password
2. LoginScreen calls handleLogin()
3. handleLogin() calls AuthContext.login()
4. login() calls authService.login()
5. authService makes POST /auth/login
6. Backend validates credentials
7. Backend returns TokenResponse
8. AuthContext saves tokens to AsyncStorage
9. AuthContext updates state (user, token)
10. Navigate to onboarding/home
```

### OAuth Login Flow

```
1. User taps "Sign in with Google"
2. LoginScreen calls handleSocialLogin('google')
3. Calls oauthService.signInWithGoogle()
4. Opens OAuth browser
5. User authorizes
6. Redirect with authorization code
7. oauthService exchanges code with backend
8. Backend returns TokenResponse
9. AuthContext.loginWithToken() saves tokens
10. Navigate to onboarding/home
```

### Token Refresh Flow

```
1. API request receives 401 Unauthorized
2. apiClient detects 401 response
3. Calls AuthContext.refreshAccessToken()
4. Reads refresh_token from AsyncStorage
5. Calls authService.refreshToken()
6. Backend validates refresh_token
7. Backend revokes old refresh_token
8. Backend returns new access_token + refresh_token
9. AuthContext saves new tokens
10. Retry original API request with new token
```

### Logout Flow

```
1. User taps logout button
2. Calls AuthContext.logout()
3. Calls authService.logout(token)
4. Backend revokes all refresh_tokens for user
5. AuthContext.clearAuthData()
6. Remove tokens from AsyncStorage
7. Clear state (user, token = null)
8. Navigate to login/signup screen
```

## Type Definitions

```typescript
// mobile/src/services/authService.ts

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user_id: string;
    username: string;
    email: string;
    full_name?: string;
  };
}

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  created_at: string;
  is_active: boolean;
}
```

## Environment Configuration

### .env File

```bash
# API Base URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000

# OAuth Redirect Scheme
EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME=proxyagent

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=your-native-client-id.apps.googleusercontent.com
```

### Platform-Specific Configuration

#### iOS

```json
// app.json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.proxyagent",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["proxyagent"]
          }
        ]
      }
    }
  }
}
```

#### Android

```json
// app.json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.proxyagent",
      "intentFilters": [
        {
          "action": "VIEW",
          "category": ["BROWSABLE", "DEFAULT"],
          "data": {
            "scheme": "proxyagent"
          }
        }
      ]
    }
  }
}
```

## Security Considerations

### Token Storage
- AsyncStorage is encrypted by the OS on both iOS and Android
- Never store tokens in unencrypted storage
- Clear tokens on logout

### Error Handling
- Don't expose sensitive info in error messages
- Log errors for debugging but sanitize user-facing messages
- Handle network failures gracefully

### Token Expiry
- Access tokens expire in 30 minutes (default)
- Automatic refresh on 401 responses
- Force logout if refresh fails

### HTTPS
- Always use HTTPS in production
- Never send tokens over HTTP
- Validate SSL certificates

## Testing

### Manual Testing Checklist

- [ ] Registration with email/password
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials
- [ ] OAuth login (Google, Apple if available)
- [ ] Token refresh on API 401
- [ ] Logout clears tokens
- [ ] App restart restores auth state
- [ ] Network failure handling

### Automated Tests

```typescript
// Example test
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';

test('login sets user and token', async () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  await act(async () => {
    await result.current.login('testuser', 'password123');
  });

  expect(result.current.isAuthenticated).toBe(true);
  expect(result.current.user).not.toBeNull();
  expect(result.current.token).not.toBeNull();
});
```

## Common Issues & Solutions

### Issue: Auth state not persisting after app restart
**Solution**: Ensure AsyncStorage is properly configured and loadStoredAuth() is called in useEffect

### Issue: Token refresh infinite loop
**Solution**: Check that refreshAccessToken doesn't trigger on refresh endpoint itself

### Issue: OAuth redirect not working
**Solution**: Verify URL scheme in app.json matches OAUTH_REDIRECT_SCHEME

### Issue: 401 errors not triggering refresh
**Solution**: Implement token refresh in API client middleware

## Related Documentation

- [01_overview.md](./01_overview.md) - System architecture
- [03_backend_authentication.md](./03_backend_authentication.md) - Backend implementation
- [05_oauth_integration.md](./05_oauth_integration.md) - OAuth setup
- [06_onboarding_flow.md](./06_onboarding_flow.md) - Onboarding after auth
