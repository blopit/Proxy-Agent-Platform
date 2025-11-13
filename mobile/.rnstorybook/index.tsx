import AsyncStorage from '@react-native-async-storage/async-storage';
import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
  shouldPersistSelection: true,
  tabOpen: 1, // Open addons panel by default (0 = sidebar, 1 = addons)
  enableWebsockets: true,
});

// Note: Control panel, theme provider, and grid overlay are now handled
// in preview.tsx as decorators, so they appear within each story's context
export default StorybookUIRoot;
