import type { Preview, Decorator } from '@storybook/react';
import { useEffect, useGlobals } from '@storybook/preview-api';
import React from 'react';
import '../src/app/globals.css';
import './test-setup';
import { themes, type ThemeKey } from './themes';
import { ThemeProvider } from '../src/contexts/ThemeContext';

const withTheme: Decorator = (Story, context) => {
  const [{ theme }] = useGlobals();
  const selectedTheme = themes[theme as ThemeKey] || themes.solarizedLight;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--background-color', selectedTheme.backgroundColor);
    root.style.setProperty('--text-color', selectedTheme.textColor);
    root.style.setProperty('--border-color', selectedTheme.borderColor);
    root.style.setProperty('--emphasis-color', selectedTheme.emphasisColor);
    root.style.setProperty('--secondary-bg-color', selectedTheme.secondaryBackgroundColor);
    root.style.setProperty('--accent-color', selectedTheme.accentColor);

    // Status colors for component states
    root.style.setProperty('--color-blue', selectedTheme.blue);
    root.style.setProperty('--color-green', selectedTheme.green);
    root.style.setProperty('--color-red', selectedTheme.red);
    root.style.setProperty('--color-yellow', selectedTheme.yellow);
    root.style.setProperty('--color-orange', selectedTheme.orange);
    root.style.setProperty('--color-cyan', selectedTheme.cyan);
    root.style.setProperty('--color-magenta', selectedTheme.magenta);

    document.body.style.backgroundColor = selectedTheme.backgroundColor;
    document.body.style.color = selectedTheme.textColor;
  }, [theme, selectedTheme]);

  // Map Storybook theme to ThemeContext mode (controlled)
  const themeMode = (theme as string)?.toLowerCase().includes('dark') ? 'dark' : 'light';

  return React.createElement(
    ThemeProvider,
    { mode: themeMode }, // Use controlled mode in Storybook
    React.createElement(Story)
  );
};

const preview: Preview = {
  decorators: [withTheme],

  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Disable default backgrounds in favor of theme system
    },
    a11y: {
      config: {},
      options: {},
      manual: true,
    },
    test: {
      disable: false,
    },
    layout: 'padded', // Changed from 'fullscreen' to show Storybook header
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
        wide: {
          name: 'Wide Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
  },

  globalTypes: {
    theme: {
      description: 'Color theme for components',
      defaultValue: 'solarizedLight',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          // Solarized
          { value: 'solarizedLight', title: 'Solarized Light', icon: 'sun' },
          { value: 'solarizedDark', title: 'Solarized Dark', icon: 'moon' },

          // Dracula
          { value: 'dracula', title: 'Dracula', icon: 'moon' },

          // Nord
          { value: 'nordLight', title: 'Nord Light', icon: 'sun' },
          { value: 'nordDark', title: 'Nord Dark', icon: 'moon' },

          // Gruvbox
          { value: 'gruvboxLight', title: 'Gruvbox Light', icon: 'sun' },
          { value: 'gruvboxDark', title: 'Gruvbox Dark', icon: 'moon' },

          // Tokyo Night
          { value: 'tokyoNight', title: 'Tokyo Night', icon: 'moon' },

          // Monokai
          { value: 'monokai', title: 'Monokai', icon: 'moon' },

          // One Dark
          { value: 'oneDark', title: 'One Dark', icon: 'moon' },

          // Catppuccin
          { value: 'catppuccinLatte', title: 'Catppuccin Latte', icon: 'sun' },
          { value: 'catppuccinMocha', title: 'Catppuccin Mocha', icon: 'moon' },

          // Material
          { value: 'materialLight', title: 'Material Light', icon: 'sun' },
          { value: 'materialDark', title: 'Material Dark', icon: 'moon' },

          // Nature & Creative
          { value: 'jungle', title: '🌿 Jungle', icon: 'moon' },
          { value: 'oceanic', title: '🌊 Oceanic', icon: 'moon' },
          { value: 'sunset', title: '🌅 Sunset', icon: 'moon' },
          { value: 'aurora', title: '🌌 Aurora', icon: 'moon' },

          // Retro & Cyberpunk
          { value: 'synthwave', title: '🕶️ Synthwave \'84', icon: 'moon' },
          { value: 'nightfox', title: '🦊 Nightfox', icon: 'moon' },
          { value: 'cyberpunk', title: '🤖 Cyberpunk', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },

  tags: ['autodocs'],

  initialGlobals: {
    theme: 'solarizedLight',
  }
};

export default preview;
