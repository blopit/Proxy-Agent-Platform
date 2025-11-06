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

export default StorybookUIRoot;
