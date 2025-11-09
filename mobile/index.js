/**
 * Entry point for the app
 * Conditionally loads either Storybook or the main app based on STORYBOOK_ENABLED
 */

import { registerRootComponent } from 'expo';

// Determine which root component to load
const STORYBOOK_ENABLED = process.env.STORYBOOK_ENABLED === 'true';

let App;

if (STORYBOOK_ENABLED) {
  // Load Storybook
  // Use platform-specific Storybook entry
  const isWeb = require('react-native').Platform.OS === 'web';
  App = isWeb
    ? require('./.rnstorybook/index.web').default
    : require('./.rnstorybook/index').default;
} else {
  // Load regular app with expo-router
  App = require('expo-router/entry').default;
}

registerRootComponent(App);
