import React from 'react';
import type { Preview } from '@storybook/react-native';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { View, StyleSheet } from 'react-native';

// Note: expo-router is mocked via babel-plugin-module-resolver in babel.config.js

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'dark';
      return (
        <ThemeProvider initialMode={theme}>
          <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#002b36' : '#fdf6e3' }]}>
            <Story />
          </View>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
        { name: 'black', value: '#000000' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default preview;
