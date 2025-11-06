/**
 * Login Stories - User authentication login screen
 * Email/password login with social auth options
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Alert } from 'react-native';
import { useState } from 'react';
import LoginScreen from './LoginScreen';

const meta = {
  title: 'Auth/Login',
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
 * Default - Empty Login Form
 * Ready for user input
 */
export const Default: Story = {
  args: {
    onLogin: (email, password) => {
      Alert.alert('Login', `Email: ${email}\nPassword: ${password}`);
    },
    onSignupPress: () => {
      Alert.alert('Navigate to Signup');
    },
  },
};

/**
 * Loading - Authentication in Progress
 * Shows loading indicator while authenticating
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    onLogin: () => {},
    onSignupPress: () => {},
  },
};

/**
 * With Error - Failed Authentication
 * Displays authentication error message
 */
export const WithError: Story = {
  args: {
    error: 'Invalid email or password. Please try again.',
    onLogin: (email, password) => {
      Alert.alert('Login', `Email: ${email}\nPassword: ${password}`);
    },
    onSignupPress: () => {
      Alert.alert('Navigate to Signup');
    },
  },
};

/**
 * With Social Logins - Social Auth Options
 * Shows login screen with social login buttons
 */
export const WithSocial: Story = {
  args: {
    onLogin: (email, password) => {
      Alert.alert('Login', `Email: ${email}\nPassword: ${password}`);
    },
    onSocialLogin: (provider) => {
      Alert.alert('Social Login', `Signing in with ${provider}`);
    },
    onSignupPress: () => {
      Alert.alert('Navigate to Signup');
    },
    showSocialLogins: true,
  },
};

/**
 * Interactive - Fully Functional Login
 * Simulated API call with validation
 * Test credentials: test@example.com / password123
 */
export const Interactive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (email: string, password: string) => {
      setIsLoading(true);
      setError('');

      // Simulate API call
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password123') {
          Alert.alert('Success', 'Logged in successfully!');
          setIsLoading(false);
        } else {
          setError('Invalid email or password');
          setIsLoading(false);
        }
      }, 1500);
    };

    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignupPress={() => Alert.alert('Navigate to Signup')}
        isLoading={isLoading}
        error={error}
      />
    );
  },
};

/**
 * Social Login Interactive - OAuth Simulation
 * Interactive social login with simulated OAuth flow
 */
export const SocialLoginInteractive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSocialLogin = (provider: string) => {
      setIsLoading(true);
      setError('');

      // Simulate OAuth flow
      setTimeout(() => {
        Alert.alert(
          'Social Login Success',
          `Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`,
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
      <LoginScreen
        onLogin={(email, password) => {
          Alert.alert('Email Login', `Logging in as ${email}`);
        }}
        onSocialLogin={handleSocialLogin}
        onSignupPress={() => Alert.alert('Navigate to Signup')}
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

    const handleSocialLogin = (provider: string) => {
      Alert.alert(
        'OAuth Not Configured',
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth requires backend configuration.\n\nSet up OAuth credentials in your backend to enable this feature.`
      );
    };

    return (
      <LoginScreen
        onLogin={handleLogin}
        onSocialLogin={handleSocialLogin}
        onSignupPress={() => Alert.alert('Navigate to Signup')}
        isLoading={isLoading}
        error={error}
        showSocialLogins={true}
      />
    );
  },
};
