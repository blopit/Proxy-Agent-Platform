/**
 * Signup Stories - User registration screen
 * Create new account with email/password and social auth
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Alert } from 'react-native';
import { useState } from 'react';
import SignupScreen from './SignupScreen';

const meta = {
  title: 'Auth/Signup',
  component: SignupScreen,
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SignupScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default - Empty Signup Form
 * Ready for new user registration
 */
export const Default: Story = {
  render: () => (
    <SignupScreen
      onSignup={(name, email, password) => {
        Alert.alert('Signup', `Name: ${name}\nEmail: ${email}\nPassword: ${password}`);
      }}
      onLoginPress={() => {
        Alert.alert('Navigate to Login');
      }}
    />
  ),
};

/**
 * Loading - Account Creation in Progress
 * Shows loading indicator while creating account
 */
export const Loading: Story = {
  render: () => (
    <SignupScreen
      isLoading={true}
      onSignup={() => {}}
      onLoginPress={() => {}}
    />
  ),
};

/**
 * With Error - Registration Failed
 * Displays server error message
 */
export const WithError: Story = {
  render: () => (
    <SignupScreen
      error="This email is already registered. Please use a different email or sign in."
      onSignup={(name, email, password) => {
        Alert.alert('Signup', `Name: ${name}\nEmail: ${email}`);
      }}
      onLoginPress={() => {
        Alert.alert('Navigate to Login');
      }}
    />
  ),
};

/**
 * With Social - Social Auth Options
 * Shows signup screen with social login buttons
 */
export const WithSocial: Story = {
  render: () => (
    <SignupScreen
      onSignup={(name, email, password) => {
        Alert.alert('Signup', `Name: ${name}\nEmail: ${email}`);
      }}
      onSocialLogin={(provider) => {
        Alert.alert('Social Login', `Signing up with ${provider}`);
      }}
      onLoginPress={() => {
        Alert.alert('Navigate to Login');
      }}
      showSocialLogins={true}
    />
  ),
};

/**
 * Interactive - Fully Functional Signup
 * Simulated API call with validation
 * Test with existing@example.com to see error
 */
export const Interactive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError('');

      // Simulate API call
      setTimeout(() => {
        if (email === 'existing@example.com') {
          setError('This email is already registered');
          setIsLoading(false);
        } else {
          Alert.alert('Success', `Account created for ${name}!`);
          setIsLoading(false);
        }
      }, 1500);
    };

    return (
      <SignupScreen
        onSignup={handleSignup}
        onLoginPress={() => Alert.alert('Navigate to Login')}
        isLoading={isLoading}
        error={error}
      />
    );
  },
};

/**
 * Social Signup Interactive - OAuth Simulation
 * Interactive social signup with simulated OAuth flow
 */
export const SocialSignupInteractive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSocialLogin = (provider: string) => {
      setIsLoading(true);
      setError('');

      // Simulate OAuth flow
      setTimeout(() => {
        Alert.alert(
          'Social Signup Success',
          `Account created with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                console.log(`${provider} OAuth completed`);
              },
            },
          ]
        );
        setIsLoading(false);
      }, 1500);
    };

    return (
      <SignupScreen
        onSignup={(name, email, password) => {
          Alert.alert('Email Signup', `Creating account for ${name}`);
        }}
        onSocialLogin={handleSocialLogin}
        onLoginPress={() => Alert.alert('Navigate to Login')}
        isLoading={isLoading}
        error={error}
        showSocialLogins={true}
      />
    );
  },
};

/**
 * Real Backend - Live API Integration
 * Connects to backend at http://localhost:8000
 * Note: Backend must be running
 */
export const RealBackend: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    return (
      <SignupScreen
        onSignup={handleSignup}
        onSocialLogin={handleSocialLogin}
        onLoginPress={() => Alert.alert('Navigate to Login')}
        isLoading={isLoading}
        error={error}
        showSocialLogins={true}
      />
    );
  },
};
