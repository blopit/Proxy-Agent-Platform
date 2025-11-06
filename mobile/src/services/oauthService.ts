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
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
          clientId: GOOGLE_CONFIG.clientId,
          scopes: GOOGLE_CONFIG.scopes,
          redirectUri: GOOGLE_CONFIG.redirectUri,
        },
        discovery
      );

      if (!request) {
        throw new Error('Failed to create auth request');
      }

      const result = await promptAsync();

      if (result.type !== 'success') {
        throw new Error('Google authentication cancelled or failed');
      }

      // Exchange authorization code for token via backend
      const tokenResponse = await this.exchangeOAuthCode('google', result.params.code);
      return tokenResponse;
    } catch (error) {
      console.error('Google sign-in error:', error);
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
      const discovery = {
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token',
      };

      // GitHub OAuth implementation would go here
      throw new Error('GitHub Sign In not yet implemented');
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      throw new Error('GitHub sign-in failed');
    }
  }

  /**
   * Sign in with Microsoft
   */
  async signInWithMicrosoft(): Promise<OAuthResult> {
    try {
      const discovery = {
        authorizationEndpoint: `https://login.microsoftonline.com/${MICROSOFT_CONFIG.tenant}/oauth2/v2.0/authorize`,
        tokenEndpoint: `https://login.microsoftonline.com/${MICROSOFT_CONFIG.tenant}/oauth2/v2.0/token`,
      };

      // Microsoft OAuth implementation would go here
      throw new Error('Microsoft Sign In not yet implemented');
    } catch (error) {
      console.error('Microsoft sign-in error:', error);
      throw new Error('Microsoft sign-in failed');
    }
  }

  /**
   * Exchange OAuth authorization code for app token via backend
   */
  private async exchangeOAuthCode(
    provider: SocialProvider,
    code: string
  ): Promise<OAuthResult> {
    const response = await fetch(`${API_BASE_URL}/auth/oauth/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
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
