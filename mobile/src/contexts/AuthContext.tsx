/**
 * AuthContext - Global authentication state management
 * Provides auth state, login, signup, and logout functions throughout the app
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, TokenResponse, RegisterRequest, LoginRequest } from '../services/authService';

interface User {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithToken: (tokenResponse: TokenResponse) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
const USER_KEY = '@auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedRefreshToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      console.log('[AuthContext] Loading stored auth from AsyncStorage...');
      console.log('[AuthContext] Stored token exists:', !!storedToken);
      console.log('[AuthContext] Stored refresh_token exists:', !!storedRefreshToken);
      console.log('[AuthContext] Stored user exists:', !!storedUser);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
        console.log('[AuthContext] Auth state restored from AsyncStorage');
      } else {
        console.log('[AuthContext] No stored auth data found');
      }
    } catch (err) {
      console.error('[AuthContext] Failed to load auth data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (tokenResponse: TokenResponse) => {
    try {
      console.log('[AuthContext] Saving auth data...');
      console.log('[AuthContext] Has access_token:', !!tokenResponse.access_token);
      console.log('[AuthContext] Has refresh_token:', !!tokenResponse.refresh_token);
      console.log('[AuthContext] Has user:', !!tokenResponse.user);

      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, tokenResponse.access_token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(tokenResponse.user)),
      ]);

      console.log('[AuthContext] Auth data saved to AsyncStorage successfully');

      setToken(tokenResponse.access_token);
      setRefreshToken(tokenResponse.refresh_token);
      setUser(tokenResponse.user);
    } catch (err) {
      console.error('[AuthContext] Failed to save auth data:', err);
      throw new Error('Failed to save authentication data');
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } catch (err) {
      console.error('Failed to clear auth data:', err);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const loginData: LoginRequest = { username, password };
      const response = await authService.login(loginData);

      await saveAuthData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (tokenResponse: TokenResponse) => {
    try {
      setIsLoading(true);
      setError(null);

      // Save OAuth token response (includes access_token and refresh_token)
      await saveAuthData(tokenResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Extract username from email (before @)
      const username = email.split('@')[0];

      const registerData: RegisterRequest = {
        username,
        email,
        password,
        full_name: name,
      };

      const response = await authService.register(registerData);

      await saveAuthData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      if (!refreshToken) {
        console.warn('No refresh token available');
        return null;
      }

      const response = await authService.refreshToken(refreshToken);
      await saveAuthData(response);
      return response.access_token;
    } catch (err) {
      console.error('Token refresh failed:', err);
      // If refresh fails, clear auth data and force re-login
      await clearAuthData();
      return null;
    }
  };

  const logout = async () => {
    console.log('[AuthContext] Logout called');
    console.log('[AuthContext] Current token exists:', !!token);
    try {
      setIsLoading(true);
      console.log('[AuthContext] Calling authService.logout()...');
      await authService.logout(token || undefined);
      console.log('[AuthContext] Backend logout successful, clearing local data...');
      await clearAuthData();
      console.log('[AuthContext] Logout complete - all data cleared');
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      setIsLoading(false);
      console.log('[AuthContext] Logout finished, isLoading set to false');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    loginWithToken,
    signup,
    logout,
    refreshAccessToken,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
