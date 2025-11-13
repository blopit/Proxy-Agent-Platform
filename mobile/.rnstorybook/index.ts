import AsyncStorage from '@react-native-async-storage/async-storage';
import { view } from './storybook.requires';
import React from 'react';
import { View } from 'react-native';
import { StorybookThemePicker } from './StorybookThemePicker';

const StorybookUI = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
  shouldPersistSelection: true,
  tabOpen: 1, // Open addons panel by default (0 = sidebar, 1 = addons)
  enableWebsockets: true,
});

// Wrap Storybook UI with theme picker
const StorybookUIRoot = () => (
  <View style={{ flex: 1 }}>
    <StorybookUI />
    <StorybookThemePicker />
  </View>
);

export default StorybookUIRoot;
