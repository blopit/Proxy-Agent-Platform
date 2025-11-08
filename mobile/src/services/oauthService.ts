/**
 * OAuthService - Handle OAuth authentication flows
 * Supports Google, Apple, GitHub, and Microsoft OAuth
 */

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Required for dismissing the web browser modal
WebBrowser.maybeCompleteAuthSession();

// Environment variables (use EXPO_PUBLIC_ prefix for Expo)
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:8000/api/v1';
const APP_SCHEME = Constants.expoConfig?.extra?.appScheme || 'proxyagent';

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
const GOOGLE_CONFIG = {
  clientId: Constants.expoConfig?.extra?.googleClientId || '',
  redirectUri: AuthSession.makeRedirectUri({
    scheme: APP_SCHEME,
    path: 'auth/google',
  }),
  scopes: ['openid', 'profile', 'email'],
};

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
   * Sign in with Google using OAuth 2.0
   */
  async signInWithGoogle(): Promise<OAuthResult> {
    try {
      // Build the authorization URL manually
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CONFIG.clientId);
      authUrl.searchParams.append('redirect_uri', GOOGLE_CONFIG.redirectUri);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', GOOGLE_CONFIG.scopes.join(' '));
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      // Start OAuth flow using WebBrowser (modern expo-auth-session v7 API)
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
      console.error('Google sign-in error:', error);
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
   * Exchange OAuth authorization code for app token via backend
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
