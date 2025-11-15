const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Pass environment variables to Metro
const config = withStorybook(defaultConfig, {
  enabled: true,
  configPath: '.rnstorybook',
  // Disable auto-generation to allow manual story imports for web compatibility
  generate: false,
});

// Ensure STORYBOOK_ENABLED is available to the bundle
config.resolver = {
  ...config.resolver,
  sourceExts: config.resolver.sourceExts || ['js', 'json', 'ts', 'tsx'],
};

// Make environment variables available
if (process.env.STORYBOOK_ENABLED === 'true') {
  config.transformer = {
    ...config.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  };
}

module.exports = config;
