/**
 * Entry point for the app
 * Conditionally loads either Storybook or the main app based on STORYBOOK_ENABLED
 *
 * Note: STORYBOOK_ENABLED is set via environment variable when running npm run storybook
 * Metro bundler will inline this value at build time
 */

import { registerRootComponent } from 'expo';

// Determine which root component to load
// For Expo, environment variables need to be available at build time
// The npm script sets STORYBOOK_ENABLED=true which Babel will inline via transform-inline-environment-variables
// @ts-ignore - process.env is replaced at build time
const STORYBOOK_ENABLED = process.env.STORYBOOK_ENABLED === 'true';

let App;

if (STORYBOOK_ENABLED) {
  // Load Storybook
  // Use platform-specific Storybook entry
  const isWeb = require('react-native').Platform.OS === 'web';
  try {
    const StorybookModule = isWeb
      ? require('./.rnstorybook/index.web.tsx')
      : require('./.rnstorybook/index');
    App = StorybookModule.default || StorybookModule;
  } catch (error) {
    console.error('Failed to load Storybook:', error);
    // Fallback to regular app if Storybook fails to load
    App = require('expo-router/entry').default;
  }
} else {
  // Load regular app with expo-router
  App = require('expo-router/entry').default;
}

// Ensure App is a valid component before registering
if (!App) {
  throw new Error('Failed to load app component. App is undefined.');
}

// Add displayName for better error messages and to satisfy Expo's withDevTools
if (App && typeof App === 'function' && !App.displayName) {
  App.displayName = STORYBOOK_ENABLED ? 'StorybookUIRoot' : 'AppRoot';
}

registerRootComponent(App);
