/**
 * API Client with automatic token refresh
 *
 * Provides a fetch wrapper that automatically handles 401 errors
 * by refreshing the access token and retrying the request.
 */

import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@auth_refresh_token';
const USER_KEY = '@auth_user';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh completion
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers that token refresh is complete
 */
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Refresh access token using stored refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    const response = await authService.refreshToken(refreshToken);

    // Save new tokens
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, response.access_token),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
    ]);

    return response.access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);

    // Clear auth data if refresh fails
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);

    return null;
  }
}

/**
 * Enhanced fetch with automatic token refresh
 *
 * @param url - Request URL
 * @param options - Fetch options (skipAuth: skip adding auth header, skipRetry: skip retry on 401)
 * @returns Promise<Response>
 */
export async function apiFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth, skipRetry, ...fetchOptions } = options;

  // Add auth header if not skipped
  if (!skipAuth) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  // Make initial request
  let response = await fetch(url, fetchOptions);

  // Handle 401 Unauthorized
  if (response.status === 401 && !skipAuth && !skipRetry) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          isRefreshing = false;
          onTokenRefreshed(newToken);

          // Retry original request with new token
          fetchOptions.headers = {
            ...fetchOptions.headers,
            'Authorization': `Bearer ${newToken}`,
          };

          response = await fetch(url, fetchOptions);
        } else {
          // Refresh failed - user needs to re-login
          isRefreshing = false;
          throw new Error('Authentication failed - please log in again');
        }
      } catch (error) {
        isRefreshing = false;
        throw error;
      }
    } else {
      // Wait for ongoing refresh to complete
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token));
      });

      // Retry with new token
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Authorization': `Bearer ${newToken}`,
      };

      response = await fetch(url, fetchOptions);
    }
  }

  return response;
}

/**
 * Convenience method for GET requests
 */
export async function apiGet(url: string, options: FetchOptions = {}): Promise<Response> {
  return apiFetch(url, { ...options, method: 'GET' });
}

/**
 * Convenience method for POST requests
 */
export async function apiPost(
  url: string,
  body?: any,
  options: FetchOptions = {}
): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method for PUT requests
 */
export async function apiPut(
  url: string,
  body?: any,
  options: FetchOptions = {}
): Promise<Response> {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience method for DELETE requests
 */
export async function apiDelete(url: string, options: FetchOptions = {}): Promise<Response> {
  return apiFetch(url, { ...options, method: 'DELETE' });
}
