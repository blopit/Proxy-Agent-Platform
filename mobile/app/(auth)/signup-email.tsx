/**
 * Email Signup Route - Email/password registration with password strength checker
 * Second screen in signup flow - handles detailed form submission
 */

import { useState } from 'react';
import { useRouter } from 'expo-router';
import EmailSignupScreen from '@/components/auth/EmailSignupScreen';
import { useAuth } from '@/src/contexts/AuthContext';

export default function EmailSignupRoute() {
  const router = useRouter();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle email/password signup
   */
  const handleSignup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      // AuthContext's signup function handles API call and token storage
      await signup(name, email, password);

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
