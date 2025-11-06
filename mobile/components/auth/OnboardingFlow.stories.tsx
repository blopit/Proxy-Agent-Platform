/**
 * Onboarding Flow Stories - Complete authentication flow
 * Switch between Login and Signup screens with state management
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Alert } from 'react-native';
import { useState } from 'react';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

const meta = {
  title: 'Auth/OnboardingFlow',
  component: LoginScreen,
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof LoginScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Complete Flow - Login/Signup Toggle
 * Switch between Login and Signup screens
 * Test with: test@example.com / password123
 */
export const Complete: Story = {
  render: () => {
    const [screen, setScreen] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (email: string, password: string) => {
      setIsLoading(true);
      setError('');

      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password123') {
          Alert.alert('Success', 'Logged in successfully!');
          setIsLoading(false);
        } else {
          setError('Invalid credentials');
          setIsLoading(false);
        }
      }, 1500);
    };

    const handleSignup = (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError('');

      setTimeout(() => {
        if (email === 'existing@example.com') {
          setError('Email already registered');
          setIsLoading(false);
        } else {
          Alert.alert('Success', `Welcome ${name}!`);
          setScreen('login');
          setIsLoading(false);
        }
      }, 1500);
    };

    if (screen === 'signup') {
      return (
        <SignupScreen
          onSignup={handleSignup}
          onLoginPress={() => {
            setScreen('login');
            setError('');
          }}
          isLoading={isLoading}
          error={error}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignupPress={() => {
          setScreen('signup');
          setError('');
        }}
        isLoading={isLoading}
        error={error}
      />
    );
  },
};

/**
 * With Social Auth - Complete flow with OAuth
 * Includes social login options on both screens
 */
export const WithSocialAuth: Story = {
  render: () => {
    const [screen, setScreen] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (email: string, password: string) => {
      setIsLoading(true);
      setError('');

      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password123') {
          Alert.alert('Success', 'Logged in successfully!');
          setIsLoading(false);
        } else {
          setError('Invalid credentials');
          setIsLoading(false);
        }
      }, 1500);
    };

    const handleSignup = (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError('');

      setTimeout(() => {
        if (email === 'existing@example.com') {
          setError('Email already registered');
          setIsLoading(false);
        } else {
          Alert.alert('Success', `Welcome ${name}!`);
          setScreen('login');
          setIsLoading(false);
        }
      }, 1500);
    };

    const handleSocialLogin = (provider: string) => {
      setIsLoading(true);
      setError('');

      setTimeout(() => {
        Alert.alert(
          'Social Auth Success',
          `Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`
        );
        setIsLoading(false);
      }, 1500);
    };

    if (screen === 'signup') {
      return (
        <SignupScreen
          onSignup={handleSignup}
          onSocialLogin={handleSocialLogin}
          onLoginPress={() => {
            setScreen('login');
            setError('');
          }}
          isLoading={isLoading}
          error={error}
          showSocialLogins={true}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={handleLogin}
        onSocialLogin={handleSocialLogin}
        onSignupPress={() => {
          setScreen('signup');
          setError('');
        }}
        isLoading={isLoading}
        error={error}
        showSocialLogins={true}
      />
    );
  },
};

/**
 * Real Backend Integration - Live API
 * Connect to actual backend at localhost:8000
 * Note: Backend must be running
 */
export const RealBackendIntegration: Story = {
  render: () => {
    const [screen, setScreen] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (username: string, password: string) => {
      setIsLoading(true);
      setError('');

      try {
        const { authService } = await import('../../src/services/authService');
        const response = await authService.login({ username, password });

        Alert.alert(
          'Success!',
          `Welcome back ${response.user.username}!\n\nToken: ${response.access_token.slice(0, 20)}...`
        );
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        setIsLoading(false);
      }
    };

    const handleSignup = async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError('');

      try {
        const { authService } = await import('../../src/services/authService');
        // Generate unique username to avoid conflicts
        const baseUsername = email.split('@')[0];
        const timestamp = Date.now().toString().slice(-6);
        const username = `${baseUsername}${timestamp}`;

        const response = await authService.register({
          username,
          email,
          password,
          full_name: name,
        });

        Alert.alert(
          'Account Created!',
          `Welcome ${response.user.username}!\n\nYou can now login with:\nUsername: ${response.user.username}\nPassword: ${password}`
        );
        setScreen('login');
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Signup failed';
        setError(message);
        setIsLoading(false);
      }
    };

    const handleSocialLogin = (provider: string) => {
      Alert.alert(
        'OAuth Not Configured',
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth requires backend configuration.\n\nSet up OAuth credentials in your backend to enable this feature.`
      );
    };

    if (screen === 'signup') {
      return (
        <SignupScreen
          onSignup={handleSignup}
          onSocialLogin={handleSocialLogin}
          onLoginPress={() => {
            setScreen('login');
            setError('');
          }}
          isLoading={isLoading}
          error={error}
          showSocialLogins={true}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={handleLogin}
        onSocialLogin={handleSocialLogin}
        onSignupPress={() => {
          setScreen('signup');
          setError('');
        }}
        isLoading={isLoading}
        error={error}
        showSocialLogins={true}
      />
    );
  },
};
