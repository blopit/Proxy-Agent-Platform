/**
 * Signup Route - Landing page for signup options
 * Handles social signup and navigation to email signup
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import SignupScreen from '@/components/auth/SignupScreen';
import { oauthService } from '@/src/services/oauthService';
import { useAuth } from '@/src/contexts/AuthContext';
import type { SocialProvider } from '@/components/auth/SocialLoginButton';

export default function SignupRoute() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Navigate to email signup form
   */
  const handleEmailSignupPress = () => {
    router.push('/(auth)/signup-email');
  };

  /**
   * Handle social signup (Google, Apple, GitHub)
   */
  const handleSocialSignup = async (provider: SocialProvider) => {
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

      // Save token to AuthContext (includes access_token and refresh_token)
      await loginWithToken(result);

      // Navigate to onboarding
      router.replace('/(auth)/onboarding/welcome');
    } catch (err) {
      const message = err instanceof Error ? err.message : `${provider} signup failed`;

      // Check if it's a cancellation (user closed OAuth)
      if (message.includes('cancelled') || message.includes('canceled')) {
        setIsLoading(false);
        return; // Don't show error for user-initiated cancellation
      }

      setError(message);
      setIsLoading(false);

      // Also show alert for critical errors
      Alert.alert(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} Signup Failed`,
        message
      );
    }
  };

  /**
   * Navigate to login screen
   */
  const handleLoginPress = () => {
    router.push('/(auth)/login');
  };

  return (
    <SignupScreen
      onEmailSignupPress={handleEmailSignupPress}
      onSocialLogin={handleSocialSignup}
      onLoginPress={handleLoginPress}
      isLoading={isLoading}
      error={error}
    />
  );
}
