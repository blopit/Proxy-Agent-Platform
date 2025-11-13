# OAuth Integration - Social Authentication

## Overview

The platform supports OAuth 2.0 authentication with multiple providers:
- **Google** (fully implemented)
- **Apple** (stub implementation)
- **GitHub** (stub implementation)
- **Microsoft** (stub implementation)

OAuth allows users to sign up and log in using their existing accounts from these services, eliminating the need for password management.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User taps "Sign in with Google"                            │
│        │                                                     │
│        ▼                                                     │
│  oauthService.signInWithGoogle()                            │
│        │                                                     │
│        ├─ Platform === 'web' ? Web Flow : Native Flow       │
│        │                                                     │
│        ▼                                                     │
│  1. Open OAuth authorization URL                            │
│     https://accounts.google.com/o/oauth2/v2/auth?           │
│       client_id={CLIENT_ID}&                                │
│       redirect_uri={REDIRECT_URI}&                          │
│       response_type=code&                                   │
│       scope=openid profile email                            │
│        │                                                     │
│        ▼                                                     │
│  2. User authorizes in browser                              │
│        │                                                     │
│        ▼                                                     │
│  3. Redirect back with authorization code                   │
│     proxyagent://auth/google?code={CODE}                    │
│        │                                                     │
│        ▼                                                     │
│  4. Exchange code with backend                              │
│     POST /api/v1/auth/oauth/google                          │
│     { code, redirect_uri }                                  │
└─────┬────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  5. Exchange authorization code for access token            │
│     POST https://oauth2.googleapis.com/token                │
│     { code, client_id, client_secret, redirect_uri }        │
│        │                                                     │
│        ▼                                                     │
│  6. Get user profile from Google                            │
│     GET https://www.googleapis.com/oauth2/v2/userinfo       │
│     Authorization: Bearer {GOOGLE_ACCESS_TOKEN}             │
│        │                                                     │
│        ▼                                                     │
│  7. Get or create user in database                          │
│     - Check if user exists by email                         │
│     - If exists: update last_login                          │
│     - If new: create user with OAuth fields                 │
│        │                                                     │
│        ▼                                                     │
│  8. Generate JWT tokens                                     │
│     - Create access_token (30 min)                          │
│     - Create refresh_token (30 days)                        │
│        │                                                     │
│        ▼                                                     │
│  9. Return TokenResponse                                    │
│     { access_token, refresh_token, user }                   │
└─────┬────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App                                │
│                                                              │
│  10. Save tokens to AsyncStorage                            │
│  11. Navigate to onboarding/home                            │
└─────────────────────────────────────────────────────────────┘
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"

### 2. Configure OAuth Clients

You need **two** OAuth clients for proper cross-platform support:

#### Web Application Client (for Expo Web)

- **Application type**: Web application
- **Name**: "Proxy Agent Platform - Web"
- **Authorized redirect URIs**:
  ```
  http://localhost:8081
  http://localhost:8081/
  ```
- **Why**: Expo web runs on localhost:8081 and needs web-specific redirect URIs

#### iOS Client (for iOS and Android)

- **Application type**: iOS
- **Name**: "Proxy Agent Platform - Mobile"
- **Bundle ID**: Your app's bundle identifier (e.g., `com.yourcompany.proxyagent`)
- **Why**: Mobile apps use custom URL schemes, which iOS client type supports

### 3. Backend Configuration

Add to `.env`:
```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Note**: Use the **Web** client credentials for the backend, as it handles token exchange server-side.

### 4. Frontend Configuration

Add to `mobile/.env`:
```bash
# Web OAuth (for Expo web)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com

# Native OAuth (for iOS/Android)
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

### 5. App Configuration

Add URL scheme to `mobile/app.json`:
```json
{
  "expo": {
    "scheme": "proxyagent",
    "ios": {
      "bundleIdentifier": "com.yourcompany.proxyagent",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": ["proxyagent"]
          }
        ]
      }
    },
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

## Frontend Implementation

### oauthService (mobile/src/services/oauthService.ts)

#### Platform Detection

```typescript
async signInWithGoogle(): Promise<OAuthResult> {
  if (Platform.OS === 'web') {
    return this.signInWithGoogleWeb();
  } else {
    return this.signInWithGoogleNative();
  }
}
```

#### Web Flow (mobile/src/services/oauthService.ts:134-198)

Uses `expo-auth-session` for web OAuth:

```typescript
private async signInWithGoogleWeb(): Promise<OAuthResult> {
  console.log('[OAuth Web] Starting Google Sign-In on web');

  // OAuth discovery document
  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  };

  // Create auth request
  const authRequest = new AuthSession.AuthRequest({
    clientId: GOOGLE_CONFIG.clientId,  // Web client ID
    scopes: GOOGLE_CONFIG.scopes,      // ['openid', 'profile', 'email']
    redirectUri: GOOGLE_CONFIG.redirectUri,  // http://localhost:8081
    responseType: AuthSession.ResponseType.Code,
    usePKCE: false,
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  });

  // Prompt user for authorization
  const result = await authRequest.promptAsync(discovery);

  if (result.type === 'cancel') {
    throw new Error('Google authentication cancelled by user');
  }

  if (result.type !== 'success' || !result.params.code) {
    throw new Error('Google authentication failed - no authorization code received');
  }

  const code = result.params.code;

  // Exchange code with backend
  const tokenResponse = await this.exchangeOAuthCode(
    'google',
    code,
    GOOGLE_CONFIG.redirectUri
  );

  return tokenResponse;
}
```

#### Native Flow (iOS/Android) (mobile/src/services/oauthService.ts:203-252)

Uses `expo-web-browser` for native OAuth:

```typescript
private async signInWithGoogleNative(): Promise<OAuthResult> {
  // Build authorization URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', GOOGLE_CONFIG.clientId);
  authUrl.searchParams.append('redirect_uri', GOOGLE_CONFIG.redirectUri);  // proxyagent://auth/google
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', GOOGLE_CONFIG.scopes.join(' '));
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');

  // Open OAuth browser
  const result = await WebBrowser.openAuthSessionAsync(
    authUrl.toString(),
    GOOGLE_CONFIG.redirectUri
  );

  if (result.type === 'cancel') {
    throw new Error('Google authentication cancelled by user');
  }

  if (result.type !== 'success' || !result.url) {
    throw new Error('Google authentication failed - no redirect URL received');
  }

  // Parse authorization code from redirect URL
  const redirectUrl = new URL(result.url);
  const code = redirectUrl.searchParams.get('code');

  if (!code) {
    const error = redirectUrl.searchParams.get('error');
    const errorDescription = redirectUrl.searchParams.get('error_description');
    throw new Error(`Google authentication failed: ${errorDescription || error}`);
  }

  // Exchange code with backend
  const tokenResponse = await this.exchangeOAuthCode(
    'google',
    code,
    GOOGLE_CONFIG.redirectUri
  );

  return tokenResponse;
}
```

#### Code Exchange (mobile/src/services/oauthService.ts:397-434)

Sends authorization code to backend:

```typescript
private async exchangeOAuthCode(
  provider: SocialProvider,
  code: string,
  redirectUri: string
): Promise<OAuthResult> {
  const url = `${API_BASE_URL}/auth/oauth/${provider}`;

  console.log('[OAuth Exchange] Sending request to:', url);
  console.log('[OAuth Exchange] Redirect URI:', redirectUri);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OAuth Exchange] Error response:', errorText);
    throw new Error(`${provider} OAuth exchange failed`);
  }

  const result = await response.json();
  return result;
}
```

## Backend Implementation

### OAuth Routes (src/api/routes/oauth.py)

#### Google OAuth Endpoint (src/api/routes/oauth.py:182-252)

```python
@router.post("/google", response_model=TokenResponse)
async def google_oauth_callback(
    request: GoogleOAuthRequest,
    db: EnhancedDatabaseAdapter = Depends(get_enhanced_database)
):
    """
    Handle Google OAuth callback.

    Steps:
    1. Exchange authorization code for Google access token
    2. Fetch user profile from Google
    3. Create or retrieve user from database
    4. Generate JWT tokens
    5. Return TokenResponse
    """
    # 1. Exchange code for access token
    access_token = await exchange_google_code_for_token(
        request.code,
        request.redirect_uri
    )

    # 2. Get user profile from Google
    profile = await get_google_user_profile(access_token)

    # 3. Get or create user
    user = get_or_create_oauth_user(profile)

    # 4. Create JWT tokens
    access_token_expires = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    jwt_token = create_access_token(
        data={"sub": user.username, "user_id": user.user_id},
        expires_delta=access_token_expires
    )

    refresh_token, _ = create_refresh_token(user.user_id, db)

    # 5. Return response
    return TokenResponse(
        access_token=jwt_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.jwt_access_token_expire_minutes * 60,
        user={
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
        },
    )
```

#### Exchange Authorization Code (src/api/routes/oauth.py:88-137)

```python
async def exchange_google_code_for_token(
    code: str,
    redirect_uri: str | None = None
) -> str:
    """Exchange Google authorization code for access token."""
    # Get credentials from settings
    google_client_id = settings.google_client_id
    google_client_secret = settings.google_client_secret

    if not google_client_id or not google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured"
        )

    # Default redirect URI
    if not redirect_uri:
        redirect_uri = "proxyagent://auth/google"

    # Exchange code for token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "code": code,
        "client_id": google_client_id,
        "client_secret": google_client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=token_data)

        if response.status_code != 200:
            error_detail = response.json().get("error_description", "Token exchange failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Google token exchange failed: {error_detail}",
            )

        token_response = response.json()
        return token_response["access_token"]
```

#### Get User Profile from Google (src/api/routes/oauth.py:52-86)

```python
async def get_google_user_profile(access_token: str) -> OAuthUserProfile:
    """Fetch user profile from Google using access token."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch Google user profile",
            )

        data = response.json()

        return OAuthUserProfile(
            provider="google",
            provider_user_id=data["id"],
            email=data["email"],
            full_name=data.get("name"),
            picture=data.get("picture"),
        )
```

#### Get or Create User (src/api/routes/oauth.py:139-180)

```python
def get_or_create_oauth_user(profile: OAuthUserProfile) -> User:
    """Get existing user or create new user from OAuth profile."""
    # Try to find existing user by email
    existing_user = user_repo.get_by_email(profile.email)

    if existing_user:
        # Update last login
        existing_user.last_login = datetime.now()
        user_repo.update(existing_user)
        return existing_user

    # Create new user
    # Generate guaranteed-valid username from UUID
    user_id = str(uuid4())
    username = f"user_{user_id[:8]}"  # e.g., "user_7a3b8c9d"

    new_user = User(
        user_id=user_id,
        username=username,
        email=profile.email,
        full_name=profile.full_name,
        password_hash=None,  # OAuth users don't have passwords
        created_at=datetime.now(),
        updated_at=datetime.now(),
        last_login=datetime.now(),
        is_active=True,
        oauth_provider=profile.provider,
        oauth_provider_id=profile.provider_user_id,
    )

    created_user = user_repo.create(new_user)
    return created_user
```

## OAuth Flow Diagram

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  User   │                 │   App   │                 │ Backend │                 │ Google  │
└────┬────┘                 └────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │                           │
     │ Tap "Sign in with Google" │                           │                           │
     ├──────────────────────────>│                           │                           │
     │                           │                           │                           │
     │                           │ Open OAuth URL            │                           │
     │                           ├──────────────────────────────────────────────────────>│
     │                           │                           │                           │
     │                           │     Show authorization    │                           │
     │<─────────────────────────────────────────────────────────────────────────────────┤
     │                           │                           │                           │
     │ Approve access            │                           │                           │
     ├──────────────────────────────────────────────────────────────────────────────────>│
     │                           │                           │                           │
     │                           │ Redirect with code        │                           │
     │                           │<──────────────────────────────────────────────────────┤
     │                           │                           │                           │
     │                           │ POST /oauth/google        │                           │
     │                           │ { code, redirect_uri }    │                           │
     │                           ├──────────────────────────>│                           │
     │                           │                           │                           │
     │                           │                           │ POST /token               │
     │                           │                           │ Exchange code             │
     │                           │                           ├──────────────────────────>│
     │                           │                           │                           │
     │                           │                           │ Return Google token       │
     │                           │                           │<──────────────────────────┤
     │                           │                           │                           │
     │                           │                           │ GET /userinfo             │
     │                           │                           ├──────────────────────────>│
     │                           │                           │                           │
     │                           │                           │ Return user profile       │
     │                           │                           │<──────────────────────────┤
     │                           │                           │                           │
     │                           │                           │ Create/update user in DB  │
     │                           │                           ├────────┐                  │
     │                           │                           │        │                  │
     │                           │                           │<───────┘                  │
     │                           │                           │                           │
     │                           │                           │ Generate JWT tokens       │
     │                           │                           ├────────┐                  │
     │                           │                           │        │                  │
     │                           │                           │<───────┘                  │
     │                           │                           │                           │
     │                           │ TokenResponse             │                           │
     │                           │ { access_token, ... }     │                           │
     │                           │<──────────────────────────┤                           │
     │                           │                           │                           │
     │                           │ Save to AsyncStorage      │                           │
     │                           ├────────┐                  │                           │
     │                           │        │                  │                           │
     │                           │<───────┘                  │                           │
     │                           │                           │                           │
     │ Navigate to app           │                           │                           │
     │<──────────────────────────┤                           │                           │
     │                           │                           │                           │
```

## Apple OAuth (Stub Implementation)

Apple Sign In is partially implemented for iOS but not yet connected to backend.

### Setup Requirements

1. Apple Developer account with Sign In with Apple capability
2. Configure service ID and key
3. Implement server-side token verification with Apple's public keys

### Current Implementation (mobile/src/services/oauthService.ts:257-285)

```typescript
async signInWithApple(): Promise<OAuthResult> {
  if (Platform.OS === 'ios') {
    // Use native Apple Sign In on iOS
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Exchange Apple credential for app token via backend
    const tokenResponse = await this.exchangeAppleCredential(credential);
    return tokenResponse;
  } else {
    throw new Error('Apple Sign In on Android/Web not yet implemented');
  }
}
```

### Backend Stub (src/api/routes/oauth.py:254-276)

```python
@router.post("/apple", response_model=TokenResponse)
async def apple_oauth_callback(_request: AppleOAuthRequest):
    """Apple OAuth - Not yet implemented."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple OAuth not yet implemented. Please use email/password or Google sign-in.",
    )
```

## GitHub & Microsoft OAuth (Stub Implementations)

Similar structure to Google OAuth but not yet implemented.

### GitHub Stub

```python
@router.post("/github", response_model=TokenResponse)
async def github_oauth_callback(_request: GoogleOAuthRequest):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth not yet implemented.",
    )
```

### Microsoft Stub

```python
@router.post("/microsoft", response_model=TokenResponse)
async def microsoft_oauth_callback(_request: GoogleOAuthRequest):
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Microsoft OAuth not yet implemented.",
    )
```

## Security Considerations

### Authorization Code Flow
- Uses authorization code grant (not implicit flow)
- Code is exchanged server-side (client secret never exposed to app)
- Short-lived authorization codes (single use)

### Token Security
- Google access token only used server-side
- Only our own JWT tokens sent to mobile app
- Refresh token rotation on every use

### Redirect URI Validation
- Backend validates redirect_uri matches OAuth client configuration
- Prevents authorization code interception attacks

### Scope Minimization
- Only request necessary scopes: `openid`, `profile`, `email`
- Don't request unnecessary permissions

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause**: Redirect URI doesn't match OAuth client configuration

**Solution**:
1. Check frontend redirect URI matches backend configuration
2. Verify OAuth client authorized redirect URIs
3. For web: Use exact localhost:8081
4. For native: Use exact custom scheme (proxyagent://auth/google)

### Error: "invalid_client"

**Cause**: Client ID or secret is incorrect

**Solution**:
1. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env
2. Ensure using correct client (Web for backend, iOS for mobile)
3. Check credentials in Google Cloud Console

### Error: "Google OAuth not configured"

**Cause**: Missing environment variables

**Solution**:
Add to backend `.env`:
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### User cancelled OAuth flow

**Cause**: User closed OAuth browser

**Solution**: This is expected behavior, handle gracefully in UI:
```typescript
if (message.includes('cancelled') || message.includes('canceled')) {
  // Don't show error, just return to login screen
  return;
}
```

## Testing OAuth

### Manual Testing

1. Start backend: `cd backend && uv run uvicorn src.main:app --reload`
2. Start frontend: `cd mobile && npm start`
3. Click "Sign in with Google"
4. Verify authorization page opens
5. Approve access
6. Verify redirect back to app
7. Check AsyncStorage for tokens
8. Verify user created in database

### Test Accounts

Use Google test accounts for development:
- Create test users in Google Cloud Console
- Don't use personal Google accounts for testing

## Related Documentation

- [01_overview.md](./01_overview.md) - System architecture
- [03_backend_authentication.md](./03_backend_authentication.md) - Backend JWT implementation
- [04_frontend_authentication.md](./04_frontend_authentication.md) - Frontend auth flow
- [07_api_reference.md](./07_api_reference.md) - API endpoints reference
