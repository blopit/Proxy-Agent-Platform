import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '@/src/contexts/ProfileContext';
import { useFonts } from 'expo-font';
import { FONTS } from '@/src/theme/fonts';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONTS);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#002b36' }}>
        <ActivityIndicator size="large" color="#268bd2" />
      </View>
    );
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
          <Stack.Screen name="storybook" options={{ headerShown: false }} />
        </Stack>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
