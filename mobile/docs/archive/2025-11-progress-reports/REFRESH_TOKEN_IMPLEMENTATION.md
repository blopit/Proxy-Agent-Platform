# Refresh Token Implementation

## Overview

Implemented comprehensive refresh token system to solve 401 Unauthorized errors when JWT access tokens expire (after 30 minutes). The system now automatically refreshes expired tokens without requiring users to log in again.

## Problem

Users were experiencing 401 Unauthorized errors when accessing Gmail integration and other authenticated endpoints after 30 minutes:

```
GET http://192.168.1.101:8000/api/v1/integrations/ 401 (Unauthorized)
Error: Token has expired
```

## Solution

Implemented JWT refresh token system with automatic token rotation on both backend and mobile app.

---

## Backend Implementation

### 1. Database Migration

**File**: `src/database/migrations/026_create_refresh_tokens_table.sql`

Created `refresh_tokens` table to store refresh tokens securely:

```sql
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,        -- SHA256 hash (never store plain tokens)
    expires_at TIMESTAMP NOT NULL,    -- 30 days expiration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT 0,
    revoked_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

Indexes for performance:
- `idx_refresh_tokens_user_id` - User lookups
- `idx_refresh_tokens_expires_at` - Cleanup operations
- `idx_refresh_tokens_revoked` - Active token filtering

### 2. Settings Configuration

**File**: `src/core/settings.py`

Added refresh token expiration setting:

```python
jwt_refresh_token_expire_days: int = Field(
    default=30, description="JWT refresh token expiry in days"
)
```

### 3. Authentication Module

**File**: `src/api/auth.py`

#### New Models

```python
class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str  # NEW FIELD
    token_type: str
    expires_in: int
    user: dict
```

#### Core Functions

**`create_refresh_token(user_id, db)`**
- Generates cryptographically secure token using `secrets.token_urlsafe(32)`
- Hashes token with SHA256 before storage (security best practice)
- Stores in database with 30-day expiration
- Returns plain token (sent to client) and expiration date

**`verify_refresh_token(token, db)`**
- Hashes provided token and looks up in database
- Checks if token is revoked
- Checks if token has expired
- Returns user_id if valid, raises HTTPException if invalid

**`revoke_refresh_token(token, db)`**
- Revokes a single refresh token (used during token rotation)
- Sets `revoked=True` and `revoked_at=NOW()`

**`revoke_user_tokens(user_id, db)`**
- Revokes ALL refresh tokens for a user
- Used during logout to sign out from all devices

**`cleanup_expired_tokens(db)`**
- Deletes expired and revoked tokens from database
- Can be run as periodic maintenance task

#### Updated Endpoints

**POST `/auth/login`** - Now returns both tokens:
```python
{
    "access_token": "eyJ...",
    "refresh_token": "abc123...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": { ... }
}
```

**POST `/auth/register`** - Now returns both tokens (same format as login)

**POST `/auth/refresh`** - NEW ENDPOINT for token rotation:
```python
# Request
{
    "refresh_token": "abc123..."
}

# Response
{
    "access_token": "eyJ...",      # New access token
    "refresh_token": "xyz789...",  # New refresh token (old one revoked)
    "token_type": "bearer",
    "expires_in": 1800,
    "user": { ... }
}
```

**POST `/auth/logout`** - Now revokes all refresh tokens for the user

#### Security Features

1. **Token Hashing**: Refresh tokens are hashed with SHA256 before storage
2. **Token Rotation**: Old refresh token is immediately revoked when new one is issued
3. **Revocation Support**: Tokens can be revoked individually or all at once
4. **Expiration Checking**: Expired tokens are rejected
5. **Logout All Devices**: Logout revokes all refresh tokens

---

## Mobile App Implementation

### 1. Updated Auth Service

**File**: `mobile/src/services/authService.ts`

Added refresh token methods:

```typescript
interface TokenResponse {
    access_token: string;
    refresh_token: string;  // NEW FIELD
    token_type: string;
    expires_in: number;
    user: { ... };
}

// New method
async refreshToken(refreshToken: string): Promise<TokenResponse>

// Updated method
async logout(token?: string): Promise<void>  // Now calls backend
```

### 2. Updated Auth Context

**File**: `mobile/src/contexts/AuthContext.tsx`

**New State**:
```typescript
const [refreshToken, setRefreshToken] = useState<string | null>(null);
```

**New Storage Key**:
```typescript
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
```

**Updated Functions**:
- `loadStoredAuth()` - Now loads refresh token from AsyncStorage
- `saveAuthData()` - Now saves refresh token to AsyncStorage
- `clearAuthData()` - Now clears refresh token from AsyncStorage
- `logout()` - Now calls backend to revoke all tokens

**New Function**:
```typescript
async refreshAccessToken(): Promise<string | null>
```
- Calls backend `/auth/refresh` endpoint
- Saves new tokens to storage
- Returns new access token
- Clears auth data if refresh fails (forces re-login)

### 3. API Client with Automatic Refresh

**File**: `mobile/src/api/apiClient.ts` (NEW)

Intelligent fetch wrapper with automatic token refresh:

```typescript
async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response>
```

**Features**:

1. **Automatic Token Injection**: Adds `Authorization: Bearer {token}` header
2. **401 Detection**: Detects expired token errors
3. **Automatic Refresh**: Calls refresh endpoint when 401 occurs
4. **Request Retry**: Retries original request with new token
5. **Concurrent Request Handling**: Queues multiple requests during refresh
6. **Token Rotation**: Updates stored tokens after successful refresh
7. **Fallback to Re-login**: Clears auth if refresh fails

**Convenience Methods**:
```typescript
apiGet(url, options)
apiPost(url, body, options)
apiPut(url, body, options)
apiDelete(url, options)
```

### 4. Updated API Services

All API services now use `apiClient` for automatic token refresh:

**`mobile/src/api/integrations.ts`**
- `initiateGmailOAuth()` - Uses `apiPost`
- `listIntegrations()` - Uses `apiGet`
- `getIntegrationStatus()` - Uses `apiGet`
- `disconnectIntegration()` - Uses `apiPost`
- `triggerSync()` - Uses `apiPost`

**`mobile/src/services/captureService.ts`**
- `captureTask()` - Uses `apiPost`
- `saveCapture()` - Uses `apiPost`
- `submitClarifications()` - Uses `apiPost`

**`mobile/src/services/onboardingService.ts`**
- `upsertOnboarding()` - Uses `apiPut`
- `getOnboarding()` - Uses `apiGet`
- `markComplete()` - Uses `apiPost`
- `deleteOnboarding()` - Uses `apiDelete`

---

## User Flow

### Initial Login/Registration

1. User logs in or registers
2. Backend returns `access_token` (30 min) + `refresh_token` (30 days)
3. Mobile app stores both tokens in AsyncStorage
4. App uses access token for authenticated requests

### Automatic Token Refresh (Transparent to User)

1. User makes API request after 30 minutes
2. Access token has expired, backend returns 401
3. API client detects 401 error
4. API client automatically calls `/auth/refresh` with refresh token
5. Backend validates refresh token, issues new tokens (token rotation)
6. API client stores new tokens in AsyncStorage
7. API client retries original request with new access token
8. User sees no interruption - request succeeds

### Token Expiration (Refresh Token Expired)

1. Refresh token expires after 30 days of inactivity
2. Auto-refresh fails
3. App clears stored tokens
4. User is redirected to login screen

### Logout

1. User clicks logout
2. App calls backend `/auth/logout`
3. Backend revokes ALL refresh tokens for user
4. App clears stored tokens
5. User is logged out from all devices

---

## Testing

### Backend Endpoints to Test

1. **Login/Register returns both tokens**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123"}'
```

2. **Refresh endpoint works**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "YOUR_REFRESH_TOKEN"}'
```

3. **Token rotation (old token is revoked)**:
```bash
# Use refresh token twice - second attempt should fail
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "SAME_TOKEN"}'
```

4. **Logout revokes all tokens**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Mobile App Testing

1. **Login and verify tokens are stored**:
   - Check AsyncStorage has `@auth_token` and `@auth_refresh_token`

2. **Wait 30+ minutes and make authenticated request**:
   - Should automatically refresh without user action
   - Check AsyncStorage - tokens should be updated

3. **Make multiple concurrent requests after token expiry**:
   - All requests should queue and succeed after single refresh

4. **Test logout**:
   - Tokens should be cleared from AsyncStorage
   - Subsequent refresh attempts should fail

---

## Security Considerations

### ✅ Implemented

1. **Token Hashing**: Refresh tokens hashed with SHA256 before storage
2. **Token Rotation**: Old refresh token revoked when new one issued
3. **Short Access Token Lifetime**: 30 minutes reduces attack window
4. **Long Refresh Token Lifetime**: 30 days reduces user friction
5. **Revocation Support**: Individual and bulk token revocation
6. **Logout All Devices**: User can revoke all sessions
7. **HTTPS Only**: Tokens should only be transmitted over HTTPS in production

### 🔒 Best Practices

1. **Never log tokens**: Avoid logging refresh tokens in production
2. **Secure storage**: AsyncStorage is encrypted on iOS, use additional encryption on Android if needed
3. **Monitor for abuse**: Track failed refresh attempts
4. **Regular cleanup**: Run `cleanup_expired_tokens()` periodically

---

## Migration Guide

### For Existing Users

1. Existing users will need to log in again to receive refresh tokens
2. Old sessions (access token only) will continue to work until expiration
3. After expiration, user will be prompted to log in again

### Database Migration

```bash
# Run migration
python scripts/run_migration.py 026_create_refresh_tokens_table.sql
```

---

## Future Enhancements

1. **Refresh Token Families**: Track token lineage to detect token theft
2. **Device Tracking**: Associate refresh tokens with specific devices
3. **Suspicious Activity Detection**: Alert on unusual refresh patterns
4. **Admin Token Revocation**: Allow admins to revoke specific user tokens
5. **Token Rotation Policies**: Configurable rotation frequency
6. **Biometric Re-authentication**: Require biometric auth for refresh on sensitive operations

---

## Troubleshooting

### Issue: "Token has expired" error still occurs

**Solution**: User needs to log out and log back in to receive refresh token

### Issue: Refresh token invalid

**Solution**:
- Check if token was revoked (logout, manual revocation)
- Check if token expired (30 days)
- User needs to log in again

### Issue: API requests fail after refresh

**Solution**:
- Check backend `/auth/refresh` endpoint is working
- Verify refresh token is being stored in AsyncStorage
- Check API client is correctly handling 401 responses

### Issue: Multiple refresh attempts

**Solution**:
- API client queues concurrent requests during refresh
- Check `isRefreshing` flag is working correctly
- Verify subscriber pattern is notifying waiting requests

---

## Summary

The refresh token system is now fully implemented end-to-end:

✅ Backend stores refresh tokens securely with hashing and expiration
✅ Backend implements token rotation for security
✅ Mobile app stores both access and refresh tokens
✅ Mobile app automatically refreshes expired tokens
✅ All API services use automatic token refresh
✅ Users never see "Token has expired" errors during normal usage
✅ Logout revokes all user tokens across all devices

The 401 Unauthorized errors you were experiencing should now be completely resolved!
