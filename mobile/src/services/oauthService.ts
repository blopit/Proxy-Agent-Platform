/**
 * OAuthService - Handle OAuth authentication flows
 * Supports Google, Apple, GitHub, and Microsoft OAuth
 */

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_BASE_URL, OAUTH_REDIRECT_SCHEME } from '@/src/api/config';

// Required for dismissing the web browser modal
WebBrowser.maybeCompleteAuthSession();

// App scheme for OAuth redirects
const APP_SCHEME = OAUTH_REDIRECT_SCHEME;

export interface OAuthResult {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user_id: string;
    username: string;
    email: string;
    full_name?: string;
  };
}

export type SocialProvider = 'google' | 'apple' | 'github' | 'microsoft';

/**
 * Google OAuth Configuration
 */
const getGoogleConfig = () => {
  // Try multiple ways to get the client ID
  const clientId =
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ||
    Constants.expoConfig?.extra?.googleClientId ||
    '';

  const scopes = ['openid', 'profile', 'email'];

  // Platform-specific redirect URIs
  let redirectUri: string;
  if (Platform.OS === 'web') {
    // Web uses localhost redirect (works with Web OAuth client)
    // Use localhost instead of 127.0.0.1 for better Google compatibility
    redirectUri = 'http://localhost:19006/auth/google';
  } else {
    // iOS/Android use custom scheme
    redirectUri = AuthSession.makeRedirectUri({
      scheme: APP_SCHEME,
      path: 'auth/google',
    });
  }

  return { clientId, redirectUri, scopes };
};

const GOOGLE_CONFIG = getGoogleConfig();

/**
 * GitHub OAuth Configuration
 */
const GITHUB_CONFIG = {
  clientId: Constants.expoConfig?.extra?.githubClientId || '',
  redirectUri: AuthSession.makeRedirectUri({
    scheme: APP_SCHEME,
    path: 'auth/github',
  }),
  scopes: ['user', 'user:email'],
};

/**
 * Microsoft OAuth Configuration
 */
const MICROSOFT_CONFIG = {
  clientId: Constants.expoConfig?.extra?.microsoftClientId || '',
  redirectUri: AuthSession.makeRedirectUri({
    scheme: APP_SCHEME,
    path: 'auth/microsoft',
  }),
  scopes: ['openid', 'profile', 'email'],
  tenant: Constants.expoConfig?.extra?.microsoftTenant || 'common',
};

class OAuthService {
  /**
   * Sign in with Google - uses platform-specific implementation
   */
  async signInWithGoogle(): Promise<OAuthResult> {
    if (Platform.OS === 'web') {
      return this.signInWithGoogleWeb();
    } else {
      return this.signInWithGoogleNative();
    }
  }

  /**
   * Sign in with Google on web using expo-auth-session
   */
  private async signInWithGoogleWeb(): Promise<OAuthResult> {
    try {
      console.log('[OAuth Web] Starting Google Sign-In on web');
      console.log('[OAuth Web] Client ID:', GOOGLE_CONFIG.clientId);
      console.log('[OAuth Web] Redirect URI:', GOOGLE_CONFIG.redirectUri);
      console.log('[OAuth Web] Scopes:', GOOGLE_CONFIG.scopes);

      // Use AuthSession for web OAuth flow
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const authRequest = new AuthSession.AuthRequest({
        clientId: GOOGLE_CONFIG.clientId,
        scopes: GOOGLE_CONFIG.scopes,
        redirectUri: GOOGLE_CONFIG.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: false,
        extraParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      });

      console.log('[OAuth Web] Auth request created, opening prompt...');
      const result = await authRequest.promptAsync(discovery);
      console.log('[OAuth Web] Prompt result type:', result.type);
      console.log('[OAuth Web] Full result:', JSON.stringify(result, null, 2));

      // Handle user cancellation
      if (result.type === 'cancel') {
        throw new Error('Google authentication cancelled by user');
      }

      // Check for error in response
      if (result.type === 'error') {
        throw new Error(
          `Google authentication error: ${result.error?.description || result.error?.code || 'Unknown error'}`
        );
      }

      // Check for success and authorization code
      if (result.type !== 'success' || !result.params.code) {
        throw new Error('Google authentication failed - no authorization code received');
      }

      const code = result.params.code;
      console.log('[OAuth Web] Authorization code received:', code.substring(0, 20) + '...');

      // Exchange authorization code for token via backend
      console.log('[OAuth Web] Exchanging code with backend...');
      const tokenResponse = await this.exchangeOAuthCode('google', code, GOOGLE_CONFIG.redirectUri);
      console.log('[OAuth Web] Token exchange successful');
      return tokenResponse;
    } catch (error) {
      console.error('Google sign-in error (web):', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign-in failed on web');
    }
  }

  /**
   * Sign in with Google on iOS/Android using WebBrowser
   */
  private async signInWithGoogleNative(): Promise<OAuthResult> {
    try {
      // Build the authorization URL for Google
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CONFIG.clientId);
      authUrl.searchParams.append('redirect_uri', GOOGLE_CONFIG.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', GOOGLE_CONFIG.scopes.join(' '));
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      // Start OAuth flow using WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        GOOGLE_CONFIG.redirectUri
      );

      // Handle user cancellation
      if (result.type === 'cancel') {
        throw new Error('Google authentication cancelled by user');
      }

      // Check for successful redirect with URL
      if (result.type !== 'success' || !result.url) {
        throw new Error('Google authentication failed - no redirect URL received');
      }

      // Parse authorization code from redirect URL
      const redirectUrl = new URL(result.url);
      const code = redirectUrl.searchParams.get('code');

      if (!code) {
        const error = redirectUrl.searchParams.get('error');
        const errorDescription = redirectUrl.searchParams.get('error_description');
        throw new Error(
          `Google authentication failed: ${errorDescription || error || 'No authorization code received'}`
        );
      }

      // Exchange authorization code for token via backend
      const tokenResponse = await this.exchangeOAuthCode('google', code, GOOGLE_CONFIG.redirectUri);
      return tokenResponse;
    } catch (error) {
      console.error('Google sign-in error (native):', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign-in failed on mobile');
    }
  }

  /**
   * Sign in with Apple (iOS native or web)
   */
  async signInWithApple(): Promise<OAuthResult> {
    try {
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
        // Use web-based Apple OAuth for Android/Web
        const discovery = {
          authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
          tokenEndpoint: 'https://appleid.apple.com/auth/token',
        };

        // Web-based Apple OAuth implementation
        throw new Error('Apple Sign In on Android/Web not yet implemented');
      }
    } catch (error) {
      console.error('Apple sign-in error:', error);
      throw new Error('Apple sign-in failed');
    }
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(): Promise<OAuthResult> {
    try {
      // Build the authorization URL for GitHub
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.append('client_id', GITHUB_CONFIG.clientId);
      authUrl.searchParams.append('redirect_uri', GITHUB_CONFIG.redirectUri);
      authUrl.searchParams.append('scope', GITHUB_CONFIG.scopes.join(' '));

      // Start OAuth flow using WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        GITHUB_CONFIG.redirectUri
      );

      // Handle user cancellation
      if (result.type === 'cancel') {
        throw new Error('GitHub authentication cancelled by user');
      }

      // Check for successful redirect with URL
      if (result.type !== 'success' || !result.url) {
        throw new Error('GitHub authentication failed - no redirect URL received');
      }

      // Parse authorization code from redirect URL
      const redirectUrl = new URL(result.url);
      const code = redirectUrl.searchParams.get('code');

      if (!code) {
        const error = redirectUrl.searchParams.get('error');
        const errorDescription = redirectUrl.searchParams.get('error_description');
        throw new Error(
          `GitHub authentication failed: ${errorDescription || error || 'No authorization code received'}`
        );
      }

      // Exchange authorization code for token via backend
      const tokenResponse = await this.exchangeOAuthCode('github', code, GITHUB_CONFIG.redirectUri);
      return tokenResponse;
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('GitHub sign-in failed');
    }
  }

  /**
   * Sign in with Microsoft
   */
  async signInWithMicrosoft(): Promise<OAuthResult> {
    try {
      // Build the authorization URL for Microsoft
      const authUrl = new URL(
        `https://login.microsoftonline.com/${MICROSOFT_CONFIG.tenant}/oauth2/v2.0/authorize`
      );
      authUrl.searchParams.append('client_id', MICROSOFT_CONFIG.clientId);
      authUrl.searchParams.append('redirect_uri', MICROSOFT_CONFIG.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', MICROSOFT_CONFIG.scopes.join(' '));
      authUrl.searchParams.append('response_mode', 'query');

      // Start OAuth flow using WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        MICROSOFT_CONFIG.redirectUri
      );

      // Handle user cancellation
      if (result.type === 'cancel') {
        throw new Error('Microsoft authentication cancelled by user');
      }

      // Check for successful redirect with URL
      if (result.type !== 'success' || !result.url) {
        throw new Error('Microsoft authentication failed - no redirect URL received');
      }

      // Parse authorization code from redirect URL
      const redirectUrl = new URL(result.url);
      const code = redirectUrl.searchParams.get('code');

      if (!code) {
        const error = redirectUrl.searchParams.get('error');
        const errorDescription = redirectUrl.searchParams.get('error_description');
        throw new Error(
          `Microsoft authentication failed: ${errorDescription || error || 'No authorization code received'}`
        );
      }

      // Exchange authorization code for token via backend
      const tokenResponse = await this.exchangeOAuthCode('microsoft', code, MICROSOFT_CONFIG.redirectUri);
      return tokenResponse;
    } catch (error) {
      console.error('Microsoft sign-in error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Microsoft sign-in failed');
    }
  }

  /**
   * Exchange OAuth authorization code for app token via backend
   * (Used for Google, GitHub, and Microsoft OAuth)
   */
  private async exchangeOAuthCode(
    provider: SocialProvider,
    code: string,
    redirectUri: string
  ): Promise<OAuthResult> {
    const url = `${API_BASE_URL}/auth/oauth/${provider}`;
    console.log('[OAuth Exchange] Sending request to:', url);
    console.log('[OAuth Exchange] Provider:', provider);
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

    console.log('[OAuth Exchange] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OAuth Exchange] Error response:', errorText);
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.detail || `${provider} OAuth exchange failed`);
      } catch {
        throw new Error(`${provider} OAuth exchange failed: ${response.status} - ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('[OAuth Exchange] Success - received token');
    return result;
  }

  /**
   * Exchange Apple credential for app token via backend
   */
  private async exchangeAppleCredential(
    credential: AppleAuthentication.AppleAuthenticationCredential
  ): Promise<OAuthResult> {
    const response = await fetch(`${API_BASE_URL}/auth/oauth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identityToken: credential.identityToken,
        authorizationCode: credential.authorizationCode,
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Apple OAuth exchange failed');
    }

    return response.json();
  }

  /**
   * Check if Apple Sign In is available on this device
   */
  async isAppleAuthAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }
    return await AppleAuthentication.isAvailableAsync();
  }
}

export const oauthService = new OAuthService();
