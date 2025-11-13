import React from 'react';
import type { Preview } from '@storybook/react-native';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { View, StyleSheet } from 'react-native';
import { ThemeName } from '../src/theme/themes';

// Note: expo-router is mocked via babel-plugin-module-resolver in babel.config.js

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const themeName = (context.globals.theme || 'solarized-dark') as ThemeName;
      return (
        <ThemeProvider initialTheme={themeName}>
          <View style={styles.container}>
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
      default: 'transparent',
      values: [
        { name: 'transparent', value: 'transparent' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'solarized-dark',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'solarized-dark', title: 'Solarized Dark', icon: 'moon' },
          { value: 'solarized-light', title: 'Solarized Light', icon: 'sun' },
          { value: 'nord', title: 'Nord', icon: 'circlehollow' },
          { value: 'dracula', title: 'Dracula', icon: 'starhollow' },
          { value: 'catppuccin-mocha', title: 'Catppuccin', icon: 'heart' },
          { value: 'high-contrast', title: 'High Contrast', icon: 'contrast' },
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
