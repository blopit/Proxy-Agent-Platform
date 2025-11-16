/**
 * Production App Configuration
 *
 * Use this configuration for production builds:
 * - APP_ENV=production eas build --platform ios --profile production
 * - APP_ENV=production eas build --platform android --profile production
 */

import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Proxy Agent',
  slug: 'proxy-agent-platform',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  scheme: 'proxyagent',

  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#002b36', // Solarized Dark base03
  },

  assetBundlePatterns: ['**/*'],

  ios: {
    bundleIdentifier: 'com.proxyagent.platform',
    buildNumber: '1',
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: 'We need camera access for profile photos and document scanning.',
      NSMicrophoneUsageDescription: 'We need microphone access for voice notes.',
      NSPhotoLibraryUsageDescription: 'We need photo library access for uploading images.',
      NSRemindersUsageDescription: 'We need reminders access to sync your tasks.',
      NSCalendarsUsageDescription: 'We need calendar access to schedule tasks.',
      NSUserTrackingUsageDescription: 'We use tracking to improve app performance and your experience.',
    },
    config: {
      usesNonExemptEncryption: false,
    },
    associatedDomains: [
      'applinks:proxyagent.app',
      'webcredentials:proxyagent.app',
    ],
  },

  android: {
    package: 'com.proxyagent.platform',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#002b36',
    },
    permissions: [
      'CAMERA',
      'RECORD_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'NOTIFICATIONS',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
    ],
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
  },

  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#2aa198', // Solarized cyan
        sounds: [
          './assets/sounds/notification.wav',
          './assets/sounds/focus-complete.wav',
        ],
      },
    ],
    [
      'expo-tracking-transparency',
      {
        userTrackingPermission: 'This app uses tracking to improve performance and your experience.',
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '13.0',
        },
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          buildToolsVersion: '34.0.0',
        },
      },
    ],
  ],

  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'your-project-id',
    },
    apiUrl: process.env.API_URL || 'https://api.proxyagent.app',
    environment: 'production',
    enableAnalytics: true,
    enableCrashReporting: true,
    sentryDsn: process.env.SENTRY_DSN,
  },

  updates: {
    url: 'https://u.expo.dev/your-project-id',
    fallbackToCacheTimeout: 0,
    enabled: true,
    checkAutomatically: 'ON_LOAD',
  },

  runtimeVersion: {
    policy: 'sdkVersion',
  },

  owner: 'proxy-agent-team',
};

export default config;
