/**
 * Onboarding Layout - Stack navigation for onboarding screens
 * Manages the 7-step onboarding flow
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OnboardingProvider } from '@/src/contexts/OnboardingContext';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#002b36', // Solarized Dark base03
          },
          animation: 'slide_from_right',
          gestureEnabled: true, // Allow swipe back between screens
        }}
      >
        <Stack.Screen
          name="welcome"
          options={{
            title: 'Welcome',
            gestureEnabled: false, // Can't swipe back from first screen
          }}
        />
        <Stack.Screen
          name="work-preferences"
          options={{
            title: 'Work Preferences',
          }}
        />
        <Stack.Screen
          name="challenges"
          options={{
            title: 'Challenges',
          }}
        />
        <Stack.Screen
          name="adhd-support"
          options={{
            title: 'Support Level',
          }}
        />
        <Stack.Screen
          name="daily-schedule"
          options={{
            title: 'Daily Schedule',
          }}
        />
        <Stack.Screen
          name="goals"
          options={{
            title: 'Productivity Goals',
          }}
        />
        <Stack.Screen
          name="complete"
          options={{
            title: 'Complete',
            gestureEnabled: false, // Can't swipe back from completion screen
          }}
        />
      </Stack>
    </OnboardingProvider>
  );
}
