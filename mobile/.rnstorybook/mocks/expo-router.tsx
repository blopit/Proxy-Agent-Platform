/**
 * Mock implementation of expo-router for Storybook
 * Provides alert-based navigation feedback for testing
 */

import { Alert } from 'react-native';

// Mock router that shows alerts instead of navigating
export const mockRouter = {
  push: (path: string) => {
    console.log(`[Storybook Router] Navigate to: ${path}`);
    Alert.alert('Navigation', `Would navigate to:\n${path}`, [{ text: 'OK' }]);
  },
  back: () => {
    console.log('[Storybook Router] Navigate back');
    Alert.alert('Navigation', 'Would navigate back', [{ text: 'OK' }]);
  },
  replace: (path: string) => {
    console.log(`[Storybook Router] Replace with: ${path}`);
    Alert.alert('Navigation', `Would replace with:\n${path}`, [{ text: 'OK' }]);
  },
  canGoBack: () => true,
};

// Mock useRouter hook
export const useRouter = () => mockRouter;

// Mock other expo-router exports as needed
export const router = mockRouter;
export const Stack = ({ children }: any) => children;
export const Tabs = ({ children }: any) => children;
export const Link = ({ children }: any) => children;
export const Redirect = ({ children }: any) => children;
export const useLocalSearchParams = () => ({});
export const useGlobalSearchParams = () => ({});
export const usePathname = () => '/';
export const useSegments = () => [];
