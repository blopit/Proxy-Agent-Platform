# Gmail OAuth 403 Error - Fixed

## Problem

When trying to connect Gmail, the app was getting:
```
POST http://192.168.1.101:8000/api/v1/integrations/gmail/authorize 403 (Forbidden)
Error: Not authenticated
```

## Root Cause

The backend `/integrations/gmail/authorize` endpoint requires authentication:

```python
@router.post("/{provider}/authorize", response_model=AuthorizationResponse)
async def authorize_provider(
    ...
    current_user: User = Depends(get_current_user),  # ← Requires auth
    ...
):
```

But the mobile app was **not sending the JWT token** in the request headers.

## Solution

Updated all integration API functions to:
1. Accept a `token` parameter
2. Include `Authorization: Bearer ${token}` header in all requests

### Files Changed

#### 1. `/mobile/src/api/integrations.ts`

All functions now require and send the auth token:

```typescript
// Before ❌
export async function initiateGmailOAuth(userId: string): Promise<...> {
  const response = await fetch(
    `${API_BASE_URL}/integrations/gmail/authorize?user_id=${userId}&mobile=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// After ✅
export async function initiateGmailOAuth(
  userId: string,
  token: string
): Promise<...> {
  const response = await fetch(
    `${API_BASE_URL}/integrations/gmail/authorize?mobile=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // ← Added
      },
    }
  );
}
```

Updated functions:
- `initiateGmailOAuth(userId, token)` ✅
- `listIntegrations(userId, token, provider?)` ✅
- `getIntegrationStatus(integrationId, token)` ✅
- `disconnectIntegration(integrationId, token)` ✅
- `triggerSync(integrationId, token)` ✅
- `findIntegrationByProvider(userId, token, provider)` ✅
- `isProviderConnected(userId, token, provider)` ✅

#### 2. `/mobile/app/(tabs)/capture/connect.tsx`

Updated to get token from AuthContext and pass to API calls:

```typescript
// Import auth context
import { useAuth } from '@/src/contexts/AuthContext';

export default function ConnectScreen() {
  const { activeProfile } = useProfile();
  const { token } = useAuth();  // ← Get token

  // Pass token to API calls
  const handleGmailConnect = async () => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated. Please log in again.');
      return;
    }

    const { authorization_url } = await initiateGmailOAuth(activeProfile, token);
    // ...
  };

  const loadIntegrations = async () => {
    if (!activeProfile || !token) return;
    const integrations = await listIntegrations(activeProfile, token);
    // ...
  };
}
```

## Testing

After this fix, the Gmail OAuth flow should work:

1. **Backend running**: `uv run uvicorn src.api.main:app --reload`
2. **Mobile app running**: `cd mobile && npm start`
3. **User logged in**: Token available in AuthContext
4. **Click "Connect Gmail"**: Should now succeed and redirect to Google OAuth

### Expected Flow

1. User clicks "Connect Gmail" button
2. App sends POST request with **Bearer token** ✅
3. Backend validates token and creates OAuth URL
4. App opens Google OAuth in browser
5. User authorizes
6. Callback redirects to app with success
7. Gmail connected!

## Why This Happened

The integration endpoints were added to the backend with authentication required (`Depends(get_current_user)`), but the mobile client was created before auth was fully implemented. The client code was never updated to send the JWT token.

## Prevention

- **Always check backend auth requirements** when calling APIs
- **Use typed API clients** that enforce auth token parameters
- **Test with authentication** enabled in development

## Related Files

- Backend endpoint: `/src/api/routes/integrations.py`
- Auth dependency: `/src/api/auth.py` (`get_current_user`)
- Auth context: `/mobile/src/contexts/AuthContext.tsx`
- Integration service: `/mobile/src/api/integrations.ts`
- Connect screen: `/mobile/app/(tabs)/capture/connect.tsx`

---

**Status**: ✅ Fixed
**Date**: November 9, 2025
**Issue**: 403 Forbidden on Gmail OAuth
**Solution**: Added JWT authentication to all integration API calls
