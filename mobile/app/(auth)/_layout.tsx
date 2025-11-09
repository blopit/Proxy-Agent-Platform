/**
 * Auth Layout - Stack navigation for authentication screens
 * Handles the authentication flow: Landing → Login/Signup → Onboarding
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AuthLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#002b36', // Solarized Dark base03
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Welcome',
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            title: 'Login',
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: 'Sign Up',
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            title: 'Onboarding',
            gestureEnabled: false, // Prevent swipe back during onboarding
          }}
        />
      </Stack>
    </>
  );
}
