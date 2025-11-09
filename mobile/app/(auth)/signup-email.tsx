/**
 * Email Signup Route - Email/password registration with password strength checker
 * Second screen in signup flow - handles detailed form submission
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import EmailSignupScreen from '@/components/auth/EmailSignupScreen';
import { authService } from '@/src/services/authService';
import { useAuth } from '@/src/contexts/AuthContext';

export default function EmailSignupRoute() {
  const router = useRouter();
  const { login: saveAuthToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle email/password signup
   */
  const handleSignup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      // Extract username from email (part before @)
      // Backend requires alphanumeric + underscores only
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

      // Call backend registration API
      const response = await authService.register({
        username,
        email,
        password,
        full_name: name,
      });

      // Save token to AuthContext (will persist to AsyncStorage)
      await saveAuthToken(response.access_token, response.user);

      // Navigate to onboarding (new users always go through onboarding)
      router.replace('/(auth)/onboarding/welcome');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      setIsLoading(false);
    }
  };

  /**
   * Navigate back to signup options screen
   */
  const handleBack = () => {
    router.back();
  };

  return (
    <EmailSignupScreen
      onSignup={handleSignup}
      onBack={handleBack}
      isLoading={isLoading}
      error={error}
    />
  );
}
