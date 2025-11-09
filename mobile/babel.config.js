module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // Mock expo-router in Storybook mode only
            ...(process.env.STORYBOOK_ENABLED === 'true'
              ? {
                  'expo-router': './.rnstorybook/mocks/expo-router',
                }
              : {}),
          },
        },
      ],
    ],
  };
};
