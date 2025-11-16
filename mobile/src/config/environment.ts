/**
 * Environment Configuration
 *
 * Centralized configuration for environment-specific values
 * Loads from .env files and provides type-safe access
 *
 * Usage:
 *   import { config } from '@/config/environment';
 *   const apiUrl = config.apiUrl;
 */

import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

interface Config {
  environment: Environment;
  apiUrl: string;
  apiTimeout: number;
  features: {
    analytics: boolean;
    crashReporting: boolean;
    performanceMonitoring: boolean;
    debugTools: boolean;
  };
  oauth: {
    googleClientId: string;
    redirectUri: string;
  };
  notifications: {
    projectId: string;
  };
  sentry: {
    dsn: string;
    environment: string;
  };
  analytics: {
    amplitudeApiKey: string;
    mixpanelToken: string;
  };
  app: {
    version: string;
    buildNumber: string;
  };
}

// Helper to get environment variable
function getEnvVar(key: string, defaultValue: string = ''): string {
  return Constants.expoConfig?.extra?.[key] || process.env[key] || defaultValue;
}

// Helper to get boolean environment variable
function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key, String(defaultValue));
  return value === 'true' || value === '1';
}

// Determine current environment
const currentEnv = (getEnvVar('APP_ENV', 'development') as Environment);

// Build configuration object
export const config: Config = {
  environment: currentEnv,
  apiUrl: getEnvVar('API_URL', 'http://localhost:8000'),
  apiTimeout: parseInt(getEnvVar('API_TIMEOUT', '30000'), 10),

  features: {
    analytics: getEnvBool('ENABLE_ANALYTICS', currentEnv === 'production'),
    crashReporting: getEnvBool('ENABLE_CRASH_REPORTING', currentEnv !== 'development'),
    performanceMonitoring: getEnvBool('ENABLE_PERFORMANCE_MONITORING', true),
    debugTools: getEnvBool('ENABLE_DEBUG_TOOLS', currentEnv === 'development'),
  },

  oauth: {
    googleClientId: getEnvVar('GOOGLE_CLIENT_ID', ''),
    redirectUri: getEnvVar('GOOGLE_OAUTH_REDIRECT_URI', ''),
  },

  notifications: {
    projectId: getEnvVar('EAS_PROJECT_ID', ''),
  },

  sentry: {
    dsn: getEnvVar('SENTRY_DSN', ''),
    environment: getEnvVar('SENTRY_ENVIRONMENT', currentEnv),
  },

  analytics: {
    amplitudeApiKey: getEnvVar('AMPLITUDE_API_KEY', ''),
    mixpanelToken: getEnvVar('MIXPANEL_TOKEN', ''),
  },

  app: {
    version: getEnvVar('APP_VERSION', '1.0.0'),
    buildNumber: Constants.expoConfig?.version || '1',
  },
};

// Helper functions
export const isDevelopment = () => config.environment === 'development';
export const isStaging = () => config.environment === 'staging';
export const isProduction = () => config.environment === 'production';

// Validation
export function validateConfig(): boolean {
  const errors: string[] = [];

  if (isProduction()) {
    if (!config.apiUrl) errors.push('API_URL is required in production');
    if (!config.oauth.googleClientId) errors.push('GOOGLE_CLIENT_ID is required in production');
    if (!config.notifications.projectId) errors.push('EAS_PROJECT_ID is required in production');
  }

  if (errors.length > 0) {
    console.error('[Config] Validation errors:', errors);
    return false;
  }

  return true;
}

// Log configuration (sanitized)
export function logConfig(): void {
  console.log('[Config] Environment:', config.environment);
  console.log('[Config] API URL:', config.apiUrl);
  console.log('[Config] Features:', config.features);
  console.log('[Config] App Version:', config.app.version);
}

// Export for debugging (dev only)
if (__DEV__) {
  (global as Record<string, unknown>).config = config;
}
