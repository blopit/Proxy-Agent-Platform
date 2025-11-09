/**
 * API Configuration
 *
 * Central configuration for API base URLs and endpoints
 */

// Backend API base URL
// For development: use localhost with appropriate port (simulators only)
// For physical devices: use your computer's local IP (e.g., 192.168.1.101)
// For production: use your deployed API URL
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// OAuth redirect URI for mobile deep links
export const OAUTH_REDIRECT_SCHEME = 'proxyagent';
export const OAUTH_REDIRECT_PATH = 'oauth/callback';
export const OAUTH_REDIRECT_URI = `${OAUTH_REDIRECT_SCHEME}://${OAUTH_REDIRECT_PATH}`;
