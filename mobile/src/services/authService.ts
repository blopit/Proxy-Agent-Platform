/**
 * Authentication Service - Backend API integration
 * Handles user registration, login, and token management
 */

import { API_BASE_URL } from '@/src/api/config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user_id: string;
    username: string;
    email: string;
    full_name?: string;
  };
}

export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  created_at: string;
  is_active: boolean;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Login user and get JWT token
   */
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    return response.json();
  }

  /**
   * Get user profile using access token
   */
  async getProfile(token: string): Promise<UserProfile> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch profile');
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Token refresh failed');
    }

    return response.json();
  }

  /**
   * Logout user (revoke all refresh tokens on backend)
   */
  async logout(token?: string): Promise<void> {
    console.log('[AuthService] Logout called, token provided:', !!token);
    if (token) {
      try {
        console.log('[AuthService] Sending logout request to backend...');
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('[AuthService] Backend logout response status:', response.status);
        if (!response.ok) {
          console.warn('[AuthService] Backend logout failed with status:', response.status);
        } else {
          console.log('[AuthService] Backend logout successful');
        }
      } catch (error) {
        console.error('[AuthService] Logout API call failed:', error);
        // Continue with local cleanup even if backend call fails
      }
    } else {
      console.log('[AuthService] No token provided, skipping backend logout call');
    }
  }
}

export const authService = new AuthService();
