module.exports = function (api) {
  api.cache(true);
  const isStorybook = process.env.STORYBOOK_ENABLED === 'true';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // Mock expo-router in Storybook mode only
            ...(isStorybook
              ? {
                  'expo-router': './.rnstorybook/mocks/expo-router',
                }
              : {}),
          },
        },
      ],
      // Replace process.env.STORYBOOK_ENABLED with actual value at build time
      [
        'transform-inline-environment-variables',
        {
          include: ['STORYBOOK_ENABLED'],
        },
      ],
    ],
  };
};
