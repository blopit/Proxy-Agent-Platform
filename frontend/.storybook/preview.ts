import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import './test-setup';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
      ],
    },
    a11y: {
      config: {},
      options: {},
      manual: true,
    },
    test: {
      disable: false,
    },
  },
  tags: ['autodocs'],
};

export default preview;
