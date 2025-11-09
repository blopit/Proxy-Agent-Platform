/**
 * Login Route - Authentication login screen with API integration
 * Handles email/password login and Google OAuth
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import LoginScreen from '@/components/auth/LoginScreen';
import { authService } from '@/src/services/authService';
import { oauthService } from '@/src/services/oauthService';
import { useAuth } from '@/src/contexts/AuthContext';
import type { SocialProvider } from '@/components/auth/SocialLoginButton';

export default function LoginRoute() {
  const router = useRouter();
  const { login: saveAuthToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle email/password login
   */
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Call backend login API
      const response = await authService.login({
        username: email, // Using email as username
        password,
      });

      // Save token to AuthContext (will persist to AsyncStorage)
      await saveAuthToken(response.access_token, response.user);

      // Navigate to onboarding (will check if already onboarded)
      router.replace('/(auth)/onboarding/welcome');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      setIsLoading(false);
    }
  };

  /**
   * Handle social login (Google, Apple, GitHub)
   */
  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    setError('');

    try {
      let result;

      switch (provider) {
        case 'google':
          result = await oauthService.signInWithGoogle();
          break;
        case 'apple':
          result = await oauthService.signInWithApple();
          break;
        case 'github':
          result = await oauthService.signInWithGitHub();
          break;
        case 'microsoft':
          result = await oauthService.signInWithMicrosoft();
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      // Save token to AuthContext
      await saveAuthToken(result.access_token, result.user);

      // Navigate to onboarding
      router.replace('/(auth)/onboarding/welcome');
    } catch (err) {
      const message = err instanceof Error ? err.message : `${provider} login failed`;

      // Check if it's a cancellation (user closed OAuth)
      if (message.includes('cancelled') || message.includes('canceled')) {
        setIsLoading(false);
        return; // Don't show error for user-initiated cancellation
      }

      setError(message);
      setIsLoading(false);

      // Also show alert for critical errors
      Alert.alert(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
        message
      );
    }
  };

  /**
   * Navigate to signup screen
   */
  const handleSignupPress = () => {
    router.push('/(auth)/signup');
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onSocialLogin={handleSocialLogin}
      onSignupPress={handleSignupPress}
      isLoading={isLoading}
      error={error}
      showSocialLogins={true}
    />
  );
}
