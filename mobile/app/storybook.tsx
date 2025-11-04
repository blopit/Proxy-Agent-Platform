/**
 * Storybook Route
 * Access via: /storybook in Expo app
 * This allows toggling between app and Storybook without replacing the entry point
 */

import { Platform } from 'react-native';

// Use web-specific story loader for Metro compatibility
const StorybookUIRoot = Platform.OS === 'web'
  ? require('../.rnstorybook/index.web').default
  : require('../.rnstorybook').default;

export default StorybookUIRoot;
