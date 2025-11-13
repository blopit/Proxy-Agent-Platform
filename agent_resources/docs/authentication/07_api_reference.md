# API Reference - Authentication & Onboarding

## Overview

This document provides a quick reference for all authentication and onboarding API endpoints.

**Base URL**: `http://localhost:8000` (development)

**Authentication**: Most endpoints require JWT Bearer token authentication.

## Authentication Endpoints

### POST /api/v1/auth/register

Register a new user account.

**Authentication**: None required

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response (201 Created)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "abc123def456...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

**Errors**:
- `400 Bad Request`: Username or email already registered
- `422 Unprocessable Entity`: Invalid request body

**Frontend Example**:
```typescript
const response = await authService.register({
  username: "johndoe",
  email: "john@example.com",
  password: "SecurePass123!",
  full_name: "John Doe"
});
```

---

### POST /api/v1/auth/login

Authenticate existing user.

**Authentication**: None required

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "xyz789abc012...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

**Errors**:
- `401 Unauthorized`: Incorrect username or password

**Frontend Example**:
```typescript
const response = await authService.login({
  username: "johndoe",
  password: "SecurePass123!"
});
```

---

### POST /api/v1/auth/refresh

Refresh access token using refresh token (implements token rotation).

**Authentication**: None required (refresh token in body)

**Request Body**:
```json
{
  "refresh_token": "abc123def456..."
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "new789token012...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

**Notes**:
- Old refresh token is revoked (token rotation for security)
- New refresh token is issued
- New access token is issued

**Errors**:
- `401 Unauthorized`: Invalid, expired, or revoked refresh token
- `404 Not Found`: User not found
- `403 Forbidden`: Inactive user account

**Frontend Example**:
```typescript
const response = await authService.refreshToken(refreshToken);
```

---

### POST /api/v1/auth/logout

Logout user by revoking all refresh tokens.

**Authentication**: Required (JWT Bearer token)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Response (200 OK)**:
```json
{
  "message": "Successfully logged out from all devices"
}
```

**Notes**:
- Revokes ALL refresh tokens for the user (logs out all devices)
- Client should delete stored access and refresh tokens

**Frontend Example**:
```typescript
await authService.logout(token);
await AsyncStorage.removeItem('@auth_token');
await AsyncStorage.removeItem('@auth_refresh_token');
```

---

### GET /api/v1/auth/profile

Get current user's profile.

**Authentication**: Required (JWT Bearer token)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z",
  "is_active": true
}
```

**Errors**:
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: User not found

**Frontend Example**:
```typescript
const profile = await authService.getProfile(token);
```

---

### GET /api/v1/auth/verify

Verify if token is valid.

**Authentication**: Required (JWT Bearer token)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "valid": true,
  "username": "johndoe"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or expired token

**Frontend Example**:
```typescript
const response = await fetch(`${API_BASE_URL}/auth/verify`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## OAuth Endpoints

### POST /api/v1/auth/oauth/google

Exchange Google authorization code for app tokens.

**Authentication**: None required

**Request Body**:
```json
{
  "code": "4/0AY0e-g7...",
  "redirect_uri": "proxyagent://auth/google"
}
```

**Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "abc123def456...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
    "username": "user_7a3b8c9d",
    "email": "john@gmail.com",
    "full_name": "John Doe"
  }
}
```

**Process**:
1. Backend exchanges code with Google for Google access token
2. Backend fetches user profile from Google
3. Backend creates or updates user in database
4. Backend generates JWT tokens
5. Returns TokenResponse

**Errors**:
- `400 Bad Request`: Invalid authorization code or redirect_uri mismatch
- `500 Internal Server Error`: Google OAuth not configured

**Frontend Example**:
```typescript
const result = await oauthService.signInWithGoogle();
// Returns same TokenResponse as login/register
```

**Configuration Required**:
```bash
# Backend .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

### POST /api/v1/auth/oauth/apple

Exchange Apple identity token for app tokens.

**Status**: Not yet implemented (stub)

**Response (501 Not Implemented)**:
```json
{
  "detail": "Apple OAuth not yet implemented. Please use email/password or Google sign-in."
}
```

---

### POST /api/v1/auth/oauth/github

Exchange GitHub authorization code for app tokens.

**Status**: Not yet implemented (stub)

**Response (501 Not Implemented)**:
```json
{
  "detail": "GitHub OAuth not yet implemented. Please use email/password or Google sign-in."
}
```

---

### POST /api/v1/auth/oauth/microsoft

Exchange Microsoft authorization code for app tokens.

**Status**: Not yet implemented (stub)

**Response (501 Not Implemented)**:
```json
{
  "detail": "Microsoft OAuth not yet implemented. Please use email/password or Google sign-in."
}
```

---

## Onboarding Endpoints

### PUT /api/v1/users/{user_id}/onboarding

Create or update onboarding data (upsert).

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User ID (must match authenticated user)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body** (all fields optional):
```json
{
  "work_preference": "remote",
  "adhd_support_level": 7,
  "adhd_challenges": [
    "task_switching",
    "time_blindness",
    "focus"
  ],
  "daily_schedule": {
    "preferredStartTime": "09:00",
    "preferredEndTime": "17:00",
    "timePreference": "morning",
    "weeklyAvailability": {
      "monday": true,
      "tuesday": true,
      "wednesday": true,
      "thursday": true,
      "friday": true,
      "saturday": false,
      "sunday": false
    },
    "flexibleSchedule": false
  },
  "productivity_goals": [
    "task_completion",
    "focus_time",
    "work_life_balance"
  ]
}
```

**Response (200 OK)**:
```json
{
  "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
  "work_preference": "remote",
  "adhd_support_level": 7,
  "adhd_challenges": ["task_switching", "time_blindness", "focus"],
  "daily_schedule": { ... },
  "productivity_goals": ["task_completion", "focus_time", "work_life_balance"],
  "chatgpt_export_prompt": null,
  "chatgpt_exported_at": null,
  "onboarding_completed": false,
  "onboarding_skipped": false,
  "completed_at": null,
  "skipped_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

**Notes**:
- Incremental updates supported (only send changed fields)
- Creates new record if doesn't exist (INSERT)
- Updates existing record if exists (UPDATE)

**Errors**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Can only update own onboarding data
- `422 Unprocessable Entity`: Invalid request body

**Frontend Example**:
```typescript
const response = await onboardingService.upsertOnboarding(userId, {
  work_preference: "remote",
  adhd_support_level: 7
});
```

---

### GET /api/v1/users/{user_id}/onboarding

Retrieve user's onboarding data.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User ID (must match authenticated user)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
  "work_preference": "remote",
  "adhd_support_level": 7,
  "adhd_challenges": ["task_switching", "time_blindness"],
  "daily_schedule": { ... },
  "productivity_goals": ["task_completion"],
  "chatgpt_export_prompt": null,
  "chatgpt_exported_at": null,
  "onboarding_completed": true,
  "onboarding_skipped": false,
  "completed_at": "2024-01-15T11:00:00Z",
  "skipped_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Can only view own onboarding data
- `404 Not Found`: Onboarding not found

**Frontend Example**:
```typescript
const onboarding = await onboardingService.getOnboarding(userId);
```

---

### POST /api/v1/users/{user_id}/onboarding/complete

Mark onboarding as completed or skipped.

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User ID (must match authenticated user)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**:
```json
{
  "completed": true
}
```

**Notes**:
- `completed: true` → Mark as completed
- `completed: false` → Mark as skipped

**Response (200 OK)**:
```json
{
  "user_id": "7a3b8c9d-1234-5678-90ab-cdef12345678",
  "work_preference": "remote",
  "adhd_support_level": 7,
  "adhd_challenges": ["task_switching"],
  "daily_schedule": { ... },
  "productivity_goals": ["task_completion"],
  "onboarding_completed": true,
  "onboarding_skipped": false,
  "completed_at": "2024-01-15T11:00:00Z",
  "skipped_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Can only update own onboarding data

**Frontend Example**:
```typescript
// Complete onboarding
await onboardingService.markComplete(userId, true);

// Skip onboarding
await onboardingService.markComplete(userId, false);
```

---

### DELETE /api/v1/users/{user_id}/onboarding

Delete onboarding data (reset for re-onboarding).

**Authentication**: Required (JWT Bearer token)

**Path Parameters**:
- `user_id`: User ID (must match authenticated user)

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (204 No Content)**:
No response body.

**Errors**:
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Can only delete own onboarding data

**Frontend Example**:
```typescript
await onboardingService.deleteOnboarding(userId);
```

---

## Common Response Types

### TokenResponse

Returned by all authentication endpoints (login, register, OAuth, refresh).

```typescript
{
  access_token: string;      // JWT access token (30 min expiry)
  refresh_token: string;     // Refresh token (30 day expiry)
  token_type: string;        // Always "bearer"
  expires_in: number;        // Expiry in seconds (1800 = 30 min)
  user: {
    user_id: string;         // UUID
    username: string;
    email: string;
    full_name?: string;
  };
}
```

### ErrorResponse

Standard error response format.

```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## Authentication Flow

### Using Access Tokens

All protected endpoints require the `Authorization` header:

```http
GET /api/v1/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Handling Token Expiry

When access token expires (after 30 minutes):

1. API returns `401 Unauthorized`
2. Client detects 401
3. Client calls `/auth/refresh` with refresh token
4. Backend verifies refresh token
5. Backend revokes old refresh token (token rotation)
6. Backend returns new access token + new refresh token
7. Client retries original request with new access token

### Handling Refresh Token Expiry

When refresh token expires (after 30 days) or is revoked:

1. `/auth/refresh` returns `401 Unauthorized`
2. Client clears all stored tokens
3. Client redirects to login screen
4. User must log in again

---

## Rate Limiting

**Note**: Rate limiting is not currently implemented but recommended for production.

**Recommended Limits**:
- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- Token refresh: 10 per minute per user
- OAuth: 5 per minute per IP

---

## Error Status Codes

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Successful request |
| `201 Created` | Resource created successfully (registration) |
| `204 No Content` | Successful deletion |
| `400 Bad Request` | Invalid request body or parameters |
| `401 Unauthorized` | Invalid, expired, or missing authentication token |
| `403 Forbidden` | Valid token but insufficient permissions |
| `404 Not Found` | Resource not found |
| `422 Unprocessable Entity` | Validation error |
| `500 Internal Server Error` | Server error |
| `501 Not Implemented` | Endpoint not yet implemented |

---

## Environment Variables

### Backend

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

# Database
DATABASE_PATH=.data/databases/proxy_agents_enhanced.db
```

### Frontend

```bash
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000

# OAuth Configuration
EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME=proxyagent
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=your-native-client-id
```

---

## Testing with curl

### Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "full_name": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

### Get Profile (with token)

```bash
curl -X GET http://localhost:8000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

### Upsert Onboarding

```bash
curl -X PUT http://localhost:8000/api/v1/users/USER_ID/onboarding \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "work_preference": "remote",
    "adhd_support_level": 7
  }'
```

---

## Related Documentation

- [01_overview.md](./01_overview.md) - Architecture overview
- [02_database_schema.md](./02_database_schema.md) - Database tables
- [03_backend_authentication.md](./03_backend_authentication.md) - Backend implementation
- [04_frontend_authentication.md](./04_frontend_authentication.md) - Frontend implementation
- [05_oauth_integration.md](./05_oauth_integration.md) - OAuth setup
- [06_onboarding_flow.md](./06_onboarding_flow.md) - Onboarding implementation
