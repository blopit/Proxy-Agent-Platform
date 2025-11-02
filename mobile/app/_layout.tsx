import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '@/src/contexts/ProfileContext';
import Constants from 'expo-constants';

// Enable Storybook by setting STORYBOOK_ENABLED=true in .env or app.config.js
const STORYBOOK_ENABLED = Constants.expoConfig?.extra?.storybookEnabled || false;

export default function RootLayout() {
  // Conditionally load Storybook
  if (STORYBOOK_ENABLED) {
    const StorybookUIRoot = require('../.rnstorybook').default;
    return <StorybookUIRoot />;
  }

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#002b36' }, // Solarized Dark base03
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
