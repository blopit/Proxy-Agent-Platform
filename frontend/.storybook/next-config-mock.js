/**
 * Mock for next/config to suppress deprecation warning in Storybook
 * This provides a compatible interface without using deprecated runtime config
 */

function getConfig() {
  return () => ({
    serverRuntimeConfig: {},
    publicRuntimeConfig: {},
  });
}

export default getConfig;
export const setConfig = () => {};
