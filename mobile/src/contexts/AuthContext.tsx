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
  loginWithToken: (accessToken: string, user: User) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load auth data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAuthData = async (tokenResponse: TokenResponse) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, tokenResponse.access_token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(tokenResponse.user)),
      ]);
      setToken(tokenResponse.access_token);
      setUser(tokenResponse.user);
    } catch (err) {
      console.error('Failed to save auth data:', err);
      throw new Error('Failed to save authentication data');
    }
  };

  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
      setToken(null);
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

  const loginWithToken = async (accessToken: string, user: User) => {
    try {
      setIsLoading(true);
      setError(null);

      // Directly save OAuth token and user data
      const tokenResponse: TokenResponse = {
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 3600, // 1 hour default
        user,
      };

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

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      await clearAuthData();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
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
