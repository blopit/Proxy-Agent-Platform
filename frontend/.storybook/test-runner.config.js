module.exports = {
  setup() {
    // Global setup code
  },
  setupPage(page) {
    // Setup code for each page
  },
  testMatch: ['**/*.stories.@(js|jsx|ts|tsx)'],
  testEnvironmentOptions: {
    'jest-playwright': {
      use: {
        // Browser options
        headless: true,
        viewport: { width: 1280, height: 720 },
      },
    },
  },
};
