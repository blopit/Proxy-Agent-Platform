# Authentication & Onboarding Documentation

## Overview

This directory contains comprehensive documentation for the Proxy Agent Platform's authentication and onboarding systems. The documentation covers both frontend (React Native/Expo) and backend (Python/FastAPI) implementations.

## Documentation Structure

### 1. [Architecture Overview](./01_overview.md) ⭐ START HERE

High-level overview of the entire authentication and onboarding system.

**Topics Covered:**
- System architecture diagram
- Component interactions
- Authentication flow (email/password and OAuth)
- Onboarding flow
- Technology stack
- Security considerations

**Best for:**
- New developers joining the project
- Understanding the big picture
- Architecture reviews

---

### 2. [Database Schema](./02_database_schema.md)

Complete database schema documentation for authentication and onboarding.

**Topics Covered:**
- `users` table structure
- `refresh_tokens` table structure
- `user_onboarding` table structure
- Entity relationships
- Field descriptions
- Common queries
- Pydantic models

**Best for:**
- Database migrations
- Understanding data storage
- Writing queries
- Schema modifications

---

### 3. [Backend Authentication](./03_backend_authentication.md)

Detailed backend implementation guide (Python/FastAPI).

**Topics Covered:**
- Password hashing with bcrypt
- JWT access token creation
- Refresh token rotation
- Token verification (dependencies)
- API endpoint implementations
- Security best practices
- Configuration
- Testing

**Best for:**
- Backend developers
- Implementing new auth features
- Security audits
- Debugging auth issues

---

### 4. [Frontend Authentication](./04_frontend_authentication.md)

Complete frontend implementation guide (React Native/Expo).

**Topics Covered:**
- AuthContext state management
- authService API client
- AsyncStorage persistence
- Login/signup screens
- Token refresh flow
- Error handling
- Type definitions
- Environment configuration

**Best for:**
- Frontend developers
- Mobile app development
- UI/UX implementation
- Client-side auth logic

---

### 5. [OAuth Integration](./05_oauth_integration.md)

OAuth 2.0 social authentication implementation.

**Topics Covered:**
- Google OAuth setup (fully implemented)
- Apple OAuth (stub)
- GitHub OAuth (stub)
- Microsoft OAuth (stub)
- Platform-specific flows (Web vs Native)
- Backend token exchange
- OAuth client configuration
- Troubleshooting

**Best for:**
- Setting up OAuth providers
- Platform-specific OAuth issues
- Adding new OAuth providers
- OAuth troubleshooting

---

### 6. [Onboarding Flow](./06_onboarding_flow.md)

User onboarding preferences collection system.

**Topics Covered:**
- 7-step onboarding process
- OnboardingContext state management
- Offline-first architecture
- Backend synchronization
- Onboarding screens
- Progress tracking
- Skip and reset functionality

**Best for:**
- Understanding onboarding UX
- Modifying onboarding steps
- Adding new preference fields
- Offline sync logic

---

### 7. [API Reference](./07_api_reference.md)

Quick reference for all API endpoints.

**Topics Covered:**
- Authentication endpoints
- OAuth endpoints
- Onboarding endpoints
- Request/response examples
- Error codes
- curl examples

**Best for:**
- Quick API lookups
- Integration testing
- API debugging
- Third-party integrations

---

## Quick Start Guide

### For New Developers

1. **Start with the [Overview](./01_overview.md)** to understand the system architecture
2. **Read [Database Schema](./02_database_schema.md)** to understand data models
3. **Choose your path**:
   - **Backend developer?** → [Backend Authentication](./03_backend_authentication.md)
   - **Frontend developer?** → [Frontend Authentication](./04_frontend_authentication.md)
4. **Need OAuth?** → [OAuth Integration](./05_oauth_integration.md)
5. **Working on onboarding?** → [Onboarding Flow](./06_onboarding_flow.md)
6. **Need API details?** → [API Reference](./07_api_reference.md)

### For Specific Tasks

#### Setting up Google OAuth
1. [OAuth Integration](./05_oauth_integration.md) - Setup instructions
2. [Backend Authentication](./03_backend_authentication.md) - Backend OAuth handler
3. [Frontend Authentication](./04_frontend_authentication.md) - Frontend OAuth flow

#### Implementing a new auth feature
1. [Backend Authentication](./03_backend_authentication.md) - Backend implementation
2. [Database Schema](./02_database_schema.md) - Database changes
3. [Frontend Authentication](./04_frontend_authentication.md) - Frontend integration
4. [API Reference](./07_api_reference.md) - Document new endpoints

#### Debugging auth issues
1. [API Reference](./07_api_reference.md) - Check endpoint details
2. [Backend Authentication](./03_backend_authentication.md) - Backend logic
3. [Frontend Authentication](./04_frontend_authentication.md) - Frontend flow
4. [Overview](./01_overview.md) - End-to-end flow

#### Adding onboarding fields
1. [Onboarding Flow](./06_onboarding_flow.md) - Onboarding implementation
2. [Database Schema](./02_database_schema.md) - Add database fields
3. [API Reference](./07_api_reference.md) - Update API documentation

---

## Key Technologies

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **Authentication**: PyJWT, passlib[bcrypt]
- **Database**: SQLite with custom adapter
- **HTTP Client**: httpx (async)
- **Environment**: Pydantic Settings

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State**: React Context API
- **Storage**: AsyncStorage
- **OAuth**: expo-auth-session, expo-web-browser
- **HTTP**: Fetch API

---

## Common Workflows

### Email/Password Registration Flow

```
User → Signup Form
  → authService.register()
  → POST /api/v1/auth/register
  → Backend validates and creates user
  → Backend returns TokenResponse
  → AuthContext saves tokens to AsyncStorage
  → Navigate to onboarding
```

See: [Frontend Authentication](./04_frontend_authentication.md), [Backend Authentication](./03_backend_authentication.md)

---

### Google OAuth Login Flow

```
User → "Sign in with Google"
  → oauthService.signInWithGoogle()
  → Open OAuth browser
  → User authorizes
  → Redirect with authorization code
  → POST /api/v1/auth/oauth/google
  → Backend exchanges code with Google
  → Backend fetches user profile
  → Backend creates/updates user
  → Backend returns TokenResponse
  → AuthContext saves tokens
  → Navigate to onboarding
```

See: [OAuth Integration](./05_oauth_integration.md), [Frontend Authentication](./04_frontend_authentication.md)

---

### Token Refresh Flow

```
API request → 401 Unauthorized
  → apiClient detects 401
  → AuthContext.refreshAccessToken()
  → POST /api/v1/auth/refresh
  → Backend verifies refresh token
  → Backend revokes old token (rotation)
  → Backend returns new tokens
  → AuthContext saves new tokens
  → Retry original request
```

See: [Frontend Authentication](./04_frontend_authentication.md), [Backend Authentication](./03_backend_authentication.md)

---

### Onboarding Data Flow

```
User completes step
  → OnboardingContext.setWorkPreference()
  → Save to AsyncStorage (immediate)
  → Sync to backend (async)
  → PUT /api/v1/users/{id}/onboarding
  → Backend upserts to database
  → Continue with local data
```

See: [Onboarding Flow](./06_onboarding_flow.md)

---

## Security Features

### Token Security
- **Access tokens**: 30-minute expiry, JWT with HS256
- **Refresh tokens**: 30-day expiry, SHA256 hashed, token rotation
- **Token rotation**: Old refresh token revoked on use
- **Secure storage**: AsyncStorage (OS-encrypted)

### Password Security
- **Bcrypt hashing**: Automatic salt generation
- **No plaintext storage**: Passwords never stored
- **Safe error handling**: No password leakage in errors

### API Security
- **JWT Bearer authentication**: All protected endpoints
- **Token expiry verification**: Automatic validation
- **Inactive user checks**: Account status verification
- **HTTPS in production**: Encrypted communication

See: [Backend Authentication](./03_backend_authentication.md)

---

## Environment Setup

### Backend (.env)

```bash
# Required
JWT_SECRET_KEY=your-secret-key-here

# Optional (with defaults)
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Database
DATABASE_PATH=.data/databases/proxy_agents_enhanced.db
```

### Frontend (.env)

```bash
# API
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000

# OAuth
EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME=proxyagent
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_NATIVE_CLIENT_ID=your-native-client-id
```

See: [OAuth Integration](./05_oauth_integration.md)

---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Email/password registration
- [ ] Email/password login
- [ ] Google OAuth login
- [ ] Token refresh on expiry
- [ ] Logout clears tokens
- [ ] Auth state persists after app restart

**Onboarding:**
- [ ] Complete all 7 steps
- [ ] Data saves to AsyncStorage
- [ ] Data syncs to backend
- [ ] Skip onboarding works
- [ ] Reset onboarding works
- [ ] Offline mode saves locally

See: [Backend Authentication](./03_backend_authentication.md), [Frontend Authentication](./04_frontend_authentication.md)

---

## Troubleshooting

### Common Issues

#### "Token has expired"
- **Cause**: Access token expired (30 minutes)
- **Solution**: Automatic refresh handled by apiClient
- **See**: [Frontend Authentication](./04_frontend_authentication.md)

#### "Invalid refresh token"
- **Cause**: Refresh token expired (30 days) or revoked
- **Solution**: User must log in again
- **See**: [Backend Authentication](./03_backend_authentication.md)

#### "redirect_uri_mismatch"
- **Cause**: OAuth redirect URI doesn't match configuration
- **Solution**: Verify OAuth client redirect URIs
- **See**: [OAuth Integration](./05_oauth_integration.md)

#### "Google OAuth not configured"
- **Cause**: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET
- **Solution**: Add to backend .env
- **See**: [OAuth Integration](./05_oauth_integration.md)

#### Onboarding data not persisting
- **Cause**: AsyncStorage permissions or quota
- **Solution**: Check storage permissions
- **See**: [Onboarding Flow](./06_onboarding_flow.md)

---

## File Structure

```
Agent_Resources/docs/authentication/
├── README.md                        # This file
├── 01_overview.md                   # Architecture overview
├── 02_database_schema.md            # Database tables
├── 03_backend_authentication.md     # Backend implementation
├── 04_frontend_authentication.md    # Frontend implementation
├── 05_oauth_integration.md          # OAuth setup
├── 06_onboarding_flow.md           # Onboarding system
└── 07_api_reference.md             # API endpoints
```

---

## Contributing

When making changes to authentication or onboarding:

1. **Update code**: Make your changes
2. **Update tests**: Add/update tests
3. **Update docs**: Update relevant documentation
4. **Update API reference**: If API changed
5. **Test thoroughly**: Follow testing checklist

---

## Additional Resources

### Backend Files
- `src/api/auth.py` - Authentication routes
- `src/api/routes/oauth.py` - OAuth routes
- `src/core/settings.py` - Configuration
- `src/core/task_models.py` - User model
- `src/repositories/enhanced_repositories.py` - UserRepository

### Frontend Files
- `mobile/src/contexts/AuthContext.tsx` - Auth state
- `mobile/src/contexts/OnboardingContext.tsx` - Onboarding state
- `mobile/src/services/authService.ts` - Auth API client
- `mobile/src/services/oauthService.ts` - OAuth integrations
- `mobile/src/services/onboardingService.ts` - Onboarding API
- `mobile/app/(auth)/` - Auth screens

### Database Migrations
- `src/database/migrations/025_add_oauth_fields_to_users.sql`
- `src/database/migrations/024_create_user_onboarding.sql`
- `src/database/migrations/026_create_refresh_tokens_table.sql`

---

## Questions or Issues?

1. **Check this documentation** - Most answers are here
2. **Review the code** - Well-commented implementations
3. **Check existing issues** - Someone may have encountered it
4. **Ask the team** - We're here to help!

---

**Last Updated**: 2025-11-10
**Maintainer**: Development Team
**Version**: 1.0.0
