import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { StorybookConfig } from '@storybook/nextjs';

const require = createRequire(import.meta.url);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-a11y")
  ],

  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {
      builder: {
        useSWC: true,
        fsCache: true,
      },
    },
  },

  core: {
    disableTelemetry: true,
  },

  docs: {
    autodocs: true,
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  webpackFinal: async (config) => {
    // Ensure proper module resolution
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    // Mock next/config to suppress runtime config deprecation warning
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/config': require.resolve('./next-config-mock.js'),
    };

    // Fix for Next.js 15 webpack compatibility
    // Remove problematic plugins that cause "tap" errors
    if (config.plugins) {
      config.plugins = config.plugins.filter((plugin: any) => {
        if (!plugin || !plugin.constructor) return true;
        const pluginName = plugin.constructor.name;
        // Filter out Next.js specific plugins that conflict
        return !pluginName.includes('NextTraceEntryPointsPlugin');
      });
    }

    // Enable proper HMR and file watching
    config.watchOptions = {
      aggregateTimeout: 200,
      poll: false,
      ignored: /node_modules/,
    };

    // Fix HMR chunk loading issue - use simpler naming to avoid reduce errors
    config.output = config.output || {};
    config.output.hotUpdateChunkFilename = '[id].[fullhash].hot-update.js';
    config.output.hotUpdateMainFilename = '[runtime].[fullhash].hot-update.json';

    // Ensure proper HMR configuration
    config.optimization = config.optimization || {};
    config.optimization.runtimeChunk = 'single';
    config.optimization.moduleIds = 'named';

    return config;
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
