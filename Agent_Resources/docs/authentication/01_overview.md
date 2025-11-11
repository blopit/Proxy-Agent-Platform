# Authentication & Onboarding System - Architecture Overview

## Purpose

This document provides a high-level overview of the authentication and onboarding system for the Proxy Agent Platform. It covers both the backend (Python/FastAPI) and frontend (React Native/Expo) components.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐    ┌────────────────┐   ┌──────────────┐ │
│  │  Auth Screens │───▶│  AuthContext   │◀─▶│ AsyncStorage │ │
│  │  - Login      │    │  - User State  │   │  - Tokens    │ │
│  │  - Signup     │    │  - Token Mgmt  │   │  - User      │ │
│  └───────────────┘    └────────────────┘   └──────────────┘ │
│         │                     │                               │
│         │              ┌──────▼──────┐                        │
│         └─────────────▶│   Services  │                        │
│                        │ - authService│                        │
│                        │ - oauthService                        │
│                        └──────┬──────┘                        │
└───────────────────────────────┼───────────────────────────────┘
                                │
                         HTTP/HTTPS (JWT Bearer)
                                │
┌───────────────────────────────▼───────────────────────────────┐
│                   Backend API (FastAPI/Python)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌─────────────┐    ┌────────────────┐ │
│  │ Auth Routes  │───▶│  JWT Logic  │───▶│  User Repo     │ │
│  │ /auth/*      │    │  - Create   │    │  - CRUD Ops    │ │
│  │              │    │  - Verify   │    │                │ │
│  └──────────────┘    │  - Refresh  │    └────────┬───────┘ │
│                      └─────────────┘             │         │
│  ┌──────────────┐                                │         │
│  │ OAuth Routes │    ┌─────────────┐             │         │
│  │ /auth/oauth/*│───▶│OAuth Handler│             │         │
│  │ - Google     │    │- Exchange   │             │         │
│  │ - Apple      │    │- Profile    │             │         │
│  └──────────────┘    └─────────────┘             │         │
│                                                   │         │
│  ┌──────────────┐                                │         │
│  │ Onboarding   │    ┌────────────────┐          │         │
│  │ Routes       │───▶│Onboarding Svc  │──────────┤         │
│  │ /users/{id}/ │    │- Upsert        │          │         │
│  │  onboarding  │    │- Complete      │          │         │
│  └──────────────┘    └────────────────┘          │         │
│                                                   │         │
│                      ┌────────────────────────────▼───────┐ │
│                      │       SQLite Database              │ │
│                      │  - users                           │ │
│                      │  - refresh_tokens                  │ │
│                      │  - user_onboarding                 │ │
│                      └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Components

### Frontend (Mobile App)

1. **Auth Screens** (`mobile/app/(auth)/`)
   - Login screen with email/password and OAuth
   - Signup screens (social and email)
   - Onboarding flow screens (7 steps)

2. **Context Providers** (`mobile/src/contexts/`)
   - `AuthContext`: Global authentication state management
   - `OnboardingContext`: Onboarding progress and data management

3. **Services** (`mobile/src/services/`)
   - `authService`: Email/password authentication API calls
   - `oauthService`: OAuth provider integrations (Google, Apple, GitHub, Microsoft)
   - `onboardingService`: Onboarding data sync with backend

4. **Storage**
   - AsyncStorage: Persists tokens and user data locally
   - Automatic token refresh on app launch

### Backend (Python API)

1. **Authentication Module** (`src/api/auth.py`)
   - JWT token generation and validation
   - Refresh token rotation
   - Password hashing with bcrypt
   - User registration and login

2. **OAuth Module** (`src/api/routes/oauth.py`)
   - Google OAuth integration (fully implemented)
   - Apple, GitHub, Microsoft (stub implementations)
   - Authorization code exchange
   - User profile fetching from providers

3. **Database Layer**
   - `users` table: User accounts with OAuth support
   - `refresh_tokens` table: Secure token rotation
   - `user_onboarding` table: Onboarding preferences

4. **Security**
   - JWT with HS256 algorithm
   - Refresh token hashing (SHA256)
   - Token rotation on refresh
   - Secure password hashing (bcrypt)

## Authentication Flow

### 1. Email/Password Registration

```
User → Signup Form → authService.register() → POST /api/v1/auth/register
    ← TokenResponse (access_token, refresh_token, user)
    → Save to AsyncStorage → Navigate to Onboarding
```

### 2. Email/Password Login

```
User → Login Form → authService.login() → POST /api/v1/auth/login
    ← TokenResponse (access_token, refresh_token, user)
    → Save to AsyncStorage → Navigate to Onboarding or Home
```

### 3. OAuth Login (Google Example)

```
User → "Sign in with Google" → oauthService.signInWithGoogle()
    → Open OAuth Browser → User Authorizes → Redirect with code
    → POST /api/v1/auth/oauth/google { code, redirect_uri }
        Backend:
        1. Exchange code for Google access_token
        2. Fetch user profile from Google
        3. Create or retrieve user from database
        4. Generate JWT access_token and refresh_token
    ← TokenResponse (access_token, refresh_token, user)
    → Save to AsyncStorage → Navigate to Onboarding
```

### 4. Token Refresh

```
Access token expires → Interceptor detects 401
    → authService.refreshToken(refresh_token)
    → POST /api/v1/auth/refresh { refresh_token }
        Backend:
        1. Verify refresh_token (check hash, expiry, revocation)
        2. Revoke old refresh_token (token rotation)
        3. Generate new access_token and refresh_token
    ← TokenResponse (new access_token, new refresh_token, user)
    → Save to AsyncStorage → Retry original request
```

### 5. Logout

```
User → Logout → authService.logout(token)
    → POST /api/v1/auth/logout (Authorization: Bearer {token})
        Backend: Revoke all refresh_tokens for user
    → Clear AsyncStorage (tokens, user)
    → Navigate to Login/Signup
```

## Onboarding Flow

### 7-Step Onboarding Process

1. **Welcome** (`welcome`) - Introduction screen
2. **Work Preferences** (`work_preferences`) - Remote/Hybrid/Office/Flexible
3. **Challenges** (`challenges`) - User-selected productivity challenges
4. **ADHD Support** (`adhd_support`) - Support level (1-10 scale)
5. **Daily Schedule** (`daily_schedule`) - Time preferences and weekly availability
6. **Productivity Goals** (`productivity_goals`) - Goal selection with targets
7. **Complete** (`complete`) - Completion confirmation

### Onboarding Data Flow

```
User completes step → OnboardingContext.setWorkPreference()
    → Save to AsyncStorage (immediate, offline-first)
    → Sync to backend (async, graceful failure)
        → PUT /api/v1/users/{user_id}/onboarding
            → Upsert to user_onboarding table

User completes all steps → OnboardingContext.completeOnboarding()
    → Mark completedAt timestamp
    → POST /api/v1/users/{user_id}/onboarding/complete
        → Update onboarding_completed = true
```

## Technology Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **OAuth**: expo-auth-session, expo-web-browser, expo-apple-authentication
- **HTTP**: Fetch API with custom API client

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Authentication**: PyJWT, passlib[bcrypt]
- **Database**: SQLite with custom enhanced adapter
- **HTTP Client**: httpx (async)
- **Environment**: Pydantic Settings

## Security Considerations

### Token Security
- Access tokens: Short-lived (30 minutes default)
- Refresh tokens: Long-lived (30 days default), stored hashed
- Token rotation: Old refresh token revoked on refresh
- Secure storage: AsyncStorage on mobile (encrypted by OS)

### Password Security
- Bcrypt hashing with automatic salt
- No plaintext password storage
- Minimum password requirements enforced client-side

### OAuth Security
- PKCE not used (standard OAuth 2.0 with authorization code)
- State parameter for CSRF protection (handled by expo-auth-session)
- Redirect URI validation on backend
- Platform-specific client IDs (Web vs Native)

### API Security
- JWT Bearer token authentication
- Token expiry verification
- Inactive user account checks
- HTTPS required in production

## Key Files Reference

### Frontend
- `mobile/src/contexts/AuthContext.tsx` - Auth state management
- `mobile/src/contexts/OnboardingContext.tsx` - Onboarding state
- `mobile/src/services/authService.ts` - Auth API client
- `mobile/src/services/oauthService.ts` - OAuth integrations
- `mobile/src/services/onboardingService.ts` - Onboarding API client
- `mobile/app/(auth)/login.tsx` - Login screen
- `mobile/app/(auth)/signup.tsx` - Signup screen
- `mobile/app/(auth)/onboarding/*` - Onboarding screens

### Backend
- `src/api/auth.py` - Authentication routes and JWT logic
- `src/api/routes/oauth.py` - OAuth routes and integrations
- `src/core/settings.py` - Configuration and environment variables
- `src/core/task_models.py` - User model definition
- `src/repositories/enhanced_repositories.py` - UserRepository
- `src/database/migrations/025_add_oauth_fields_to_users.sql` - OAuth schema
- `src/database/migrations/024_create_user_onboarding.sql` - Onboarding schema
- `src/database/migrations/026_create_refresh_tokens_table.sql` - Refresh tokens

## Environment Variables

### Backend (.env)
```bash
# Required
JWT_SECRET_KEY=your-secret-key-here

# Optional (with defaults)
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (.env)
```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME=proxyagent

# Google OAuth
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=your-native-client-id
```

## Next Steps

For detailed implementation guides, see:
- [02_database_schema.md](./02_database_schema.md) - Database structure
- [03_backend_authentication.md](./03_backend_authentication.md) - Backend implementation
- [04_frontend_authentication.md](./04_frontend_authentication.md) - Frontend implementation
- [05_oauth_integration.md](./05_oauth_integration.md) - OAuth setup and flow
- [06_onboarding_flow.md](./06_onboarding_flow.md) - Onboarding implementation
- [07_api_reference.md](./07_api_reference.md) - API endpoints reference
