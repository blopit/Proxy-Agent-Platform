import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '@/src/contexts/ProfileContext';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '@/src/contexts/OnboardingContext';
import { useFonts } from 'expo-font';
import { FONTS } from '@/src/theme/fonts';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';

/**
 * Navigation guard - handles auth and onboarding routing
 */
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('[NavigationGuard] Auth state:', {
      user: !!user,
      authLoading,
      onboardingLoading,
      hasCompletedOnboarding,
      segments: segments.join('/'),
    });

    if (authLoading || onboardingLoading) {
      console.log('[NavigationGuard] Still loading, waiting...');
      return; // Wait for auth/onboarding state to load
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user) {
      // Not authenticated - redirect to auth flow
      console.log('[NavigationGuard] No user, redirecting to auth');
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
    } else {
      // Authenticated - check onboarding
      if (!hasCompletedOnboarding) {
        // Not onboarded - redirect to onboarding
        console.log('[NavigationGuard] User not onboarded, redirecting to onboarding');
        if (!segments.includes('onboarding')) {
          router.replace('/(auth)/onboarding/welcome');
        }
      } else {
        // Authenticated and onboarded - redirect to main app
        console.log('[NavigationGuard] User onboarded, redirecting to capture/add');
        if (!inTabsGroup && segments[0] !== 'storybook') {
          router.replace('/(tabs)/capture/add');
        }
      }
    }
  }, [user, hasCompletedOnboarding, authLoading, onboardingLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONTS);

  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#002b36',
        }}
      >
        <ActivityIndicator size="large" color="#268bd2" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <OnboardingProvider>
          <ProfileProvider>
            <NavigationGuard>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#002b36' }, // Solarized Dark base03
                }}
              >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="storybook" options={{ headerShown: false }} />
              </Stack>
            </NavigationGuard>
          </ProfileProvider>
        </OnboardingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
