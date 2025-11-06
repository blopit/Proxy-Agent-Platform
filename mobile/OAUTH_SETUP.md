# OAuth Setup Guide

This guide explains how to configure OAuth authentication for the Proxy Agent Platform mobile app.

## Environment Variables

The mobile app uses environment variables prefixed with `EXPO_PUBLIC_` to configure OAuth providers.

### 1. Update `.env` File

Edit `mobile/.env` and add your OAuth credentials:

```bash
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# GitHub OAuth
EXPO_PUBLIC_GITHUB_CLIENT_ID=your-github-oauth-client-id
EXPO_PUBLIC_GITHUB_CLIENT_SECRET=your-github-oauth-client-secret

# Microsoft OAuth
EXPO_PUBLIC_MICROSOFT_CLIENT_ID=your-microsoft-oauth-client-id
EXPO_PUBLIC_MICROSOFT_TENANT=common

# Backend API
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# App Configuration
EXPO_PUBLIC_APP_SCHEME=proxyagent
```

### 2. Get OAuth Credentials

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. For **iOS**:
   - Application type: iOS
   - Bundle ID: `com.proxyagent.mobile` (or your bundle ID)
6. For **Android**:
   - Application type: Android
   - Package name: `com.proxyagent.mobile`
   - SHA-1 certificate fingerprint (get with: `keytool -list -v -keystore ~/.android/debug.keystore`)
7. For **Web** (Expo development):
   - Application type: Web application
   - Authorized redirect URIs: `https://auth.expo.io/@your-username/proxy-agent-platform`

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Proxy Agent Platform Mobile`
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `proxyagent://auth/github`
4. Copy the Client ID and generate a Client Secret

#### Microsoft OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in:
   - Name: `Proxy Agent Platform Mobile`
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: `proxyagent://auth/microsoft`
5. Copy the Application (client) ID
6. Go to "Certificates & secrets" → create a new client secret

#### Apple Sign In (iOS only)

Apple Sign In uses native authentication and doesn't require client IDs in the `.env` file. However, you need to:

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID with "Sign in with Apple" capability enabled
3. Configure your Expo app in `app.json`:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.proxyagent.mobile",
         "usesAppleSignIn": true
       }
     }
   }
   ```

### 3. Configure Backend OAuth Endpoints

Your backend at `http://localhost:8000` needs to implement these endpoints:

- `POST /api/v1/auth/oauth/google` - Exchange Google auth code for app token
- `POST /api/v1/auth/oauth/apple` - Exchange Apple credential for app token
- `POST /api/v1/auth/oauth/github` - Exchange GitHub auth code for app token
- `POST /api/v1/auth/oauth/microsoft` - Exchange Microsoft auth code for app token

Each endpoint should:
1. Receive the OAuth authorization code or credential
2. Verify it with the OAuth provider
3. Create or update user in your database
4. Return your app's JWT token

### 4. URL Scheme Configuration

The app uses the custom URL scheme `proxyagent://` for OAuth redirects. This is already configured in:

- `app.json`: `"scheme": "proxyagent"`
- `.env`: `EXPO_PUBLIC_APP_SCHEME=proxyagent`

When users complete OAuth, they'll be redirected to:
- Google: `proxyagent://auth/google`
- GitHub: `proxyagent://auth/github`
- Microsoft: `proxyagent://auth/microsoft`

### 5. Testing OAuth in Storybook

You can test OAuth flows in Expo Storybook without needing real credentials:

1. Start Expo: `npm start`
2. Navigate to Storybook in the app
3. Go to **Auth/SocialLoginButton** or **Auth/SocialLoginInteractive**
4. Interactive stories simulate the OAuth flow with alerts

### 6. Development vs Production

For development (Expo Go):
- Use web-based OAuth flow
- Redirects go through `https://auth.expo.io`

For production (standalone build):
- Use native OAuth flow
- Redirects use custom URL scheme `proxyagent://`

### 7. Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files with real credentials to git
- Add `mobile/.env` to `.gitignore`
- Use different OAuth apps for development and production
- Rotate secrets regularly
- Use backend token exchange (never expose client secrets in mobile app)

## Troubleshooting

### "OAuth credentials not configured"
- Check that `.env` file exists in `mobile/` directory
- Verify environment variable names use `EXPO_PUBLIC_` prefix
- Restart Expo after changing `.env`

### "Redirect URI mismatch"
- Ensure OAuth provider redirect URI matches: `proxyagent://auth/{provider}`
- For Expo Go development, also add: `https://auth.expo.io/@your-username/proxy-agent-platform`

### "Backend OAuth endpoint not found"
- Verify backend is running on `http://localhost:8000`
- Check that backend implements OAuth exchange endpoints
- Review backend logs for errors

## Resources

- [Expo AuthSession Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth Setup](https://docs.expo.dev/guides/google-authentication/)
- [Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Microsoft Azure OAuth](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow)
