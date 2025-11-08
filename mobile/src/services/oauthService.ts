/**
 * OAuthService - Handle OAuth authentication flows
 * Supports Google, Apple, GitHub, and Microsoft OAuth
 */

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { API_BASE_URL, OAUTH_REDIRECT_SCHEME } from '@/src/api/config';

// Required for dismissing the web browser modal
WebBrowser.maybeCompleteAuthSession();

// App scheme for OAuth redirects
const APP_SCHEME = OAUTH_REDIRECT_SCHEME;

// Google Client ID from environment
const GOOGLE_WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleClientId || '';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID, // From Google Cloud Console (Web OAuth client)
  offlineAccess: true, // To get refresh token
  forceCodeForRefreshToken: true, // Force auth code flow
});

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
   * Sign in with Google using the official Google Sign-In SDK
   *
   * This uses @react-native-google-signin/google-signin which:
   * - Works on iOS, Android, and Web
   * - Handles all OAuth complexity automatically
   * - Provides native Google Sign-In UI
   * - Is the official Google-recommended approach for React Native
   */
  async signInWithGoogle(): Promise<OAuthResult> {
    try {
      // Check if Google Play Services are available (Android only, not on web)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google - this opens native Google Sign-In UI (or popup on web)
      const userInfo = await GoogleSignin.signIn();

      // Get the server auth code (this is what we send to our backend)
      const serverAuthCode = userInfo.serverAuthCode;

      if (!serverAuthCode) {
        throw new Error('Failed to get authorization code from Google Sign-In');
      }

      // Get the ID token for additional user info if needed
      const idToken = userInfo.data?.idToken;

      console.log('Google Sign-In successful:', {
        email: userInfo.data?.user.email,
        name: userInfo.data?.user.name,
        hasAuthCode: !!serverAuthCode,
        hasIdToken: !!idToken,
      });

      // Exchange the server auth code for our app's token via backend
      // Note: We don't send redirect_uri because Google Sign-In SDK handles the OAuth flow
      const tokenResponse = await this.exchangeGoogleAuthCode(serverAuthCode);
      return tokenResponse;
    } catch (error: any) {
      console.error('Google sign-in error:', error);

      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google authentication cancelled by user');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services not available (Android only)');
      }

      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign-in failed');
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
   * Exchange Google Sign-In server auth code for app token via backend
   *
   * The Google Sign-In SDK handles the OAuth flow and provides a server auth code.
   * We send this to our backend which exchanges it for user tokens.
   */
  private async exchangeGoogleAuthCode(code: string): Promise<OAuthResult> {
    const response = await fetch(`${API_BASE_URL}/auth/oauth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        // No redirect_uri needed - Google Sign-In SDK handled the OAuth flow
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Google OAuth exchange failed');
    }

    return response.json();
  }

  /**
   * Exchange OAuth authorization code for app token via backend
   * (Used for GitHub and Microsoft OAuth)
   */
  private async exchangeOAuthCode(
    provider: SocialProvider,
    code: string,
    redirectUri: string
  ): Promise<OAuthResult> {
    const response = await fetch(`${API_BASE_URL}/auth/oauth/${provider}`, {
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
      const error = await response.json();
      throw new Error(error.detail || `${provider} OAuth exchange failed`);
    }

    return response.json();
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
