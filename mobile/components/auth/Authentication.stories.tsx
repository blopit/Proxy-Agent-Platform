/**
 * Auth Stories - Login and Signup screens
 * Onboarding flow for user authentication
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, Alert } from 'react-native';
import { useState } from 'react';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';

// Login Screen Meta
const loginMeta = {
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

export default loginMeta;

type LoginStory = StoryObj<typeof loginMeta>;
type SignupStory = StoryObj<typeof SignupScreen>;

/**
 * Login - Default State
 * Empty login form ready for user input
 */
export const LoginDefault: LoginStory = {
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
 * Login - Loading State
 * Shows loading indicator while authenticating
 */
export const LoginLoading: LoginStory = {
  args: {
    isLoading: true,
    onLogin: () => {},
    onSignupPress: () => {},
  },
};

/**
 * Login - With Error
 * Displays authentication error message
 */
export const LoginWithError: LoginStory = {
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
 * Login - Interactive
 * Fully functional login form with simulated API call
 */
export const LoginInteractive: LoginStory = {
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
 * Signup - Default State
 * Empty signup form ready for user input
 */
export const SignupDefault: SignupStory = {
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
  parameters: {
    ...loginMeta,
    title: 'Auth/Signup',
  },
};

/**
 * Signup - Loading State
 * Shows loading indicator while creating account
 */
export const SignupLoading: SignupStory = {
  render: () => (
    <SignupScreen
      isLoading={true}
      onSignup={() => {}}
      onLoginPress={() => {}}
    />
  ),
  parameters: {
    title: 'Auth/Signup',
  },
};

/**
 * Signup - With Error
 * Displays server error message
 */
export const SignupWithError: SignupStory = {
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
  parameters: {
    title: 'Auth/Signup',
  },
};

/**
 * Signup - Interactive
 * Fully functional signup form with validation
 */
export const SignupInteractive: SignupStory = {
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
  parameters: {
    title: 'Auth/Signup',
  },
};

/**
 * Onboarding Flow - Complete Interactive Demo
 * Switch between Login and Signup screens
 */
export const OnboardingFlow: LoginStory = {
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
  parameters: {
    title: 'Auth/OnboardingFlow',
  },
};

/**
 * Login With Social - Static UI
 * Shows login screen with social login buttons
 */
export const LoginWithSocial: LoginStory = {
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
 * Signup With Social - Static UI
 * Shows signup screen with social login buttons
 */
export const SignupWithSocial: SignupStory = {
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
  parameters: {
    title: 'Auth/Signup',
  },
};

/**
 * Social Login Interactive - Mock OAuth Flow
 * Interactive social login with simulated OAuth
 */
export const SocialLoginInteractive: LoginStory = {
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
 * Real Backend Integration - Connect to actual API
 * Uses authService to make real API calls to localhost:8000
 * Note: Backend must be running on localhost:8000
 */
export const RealBackendAuth: LoginStory = {
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
        const username = email.split('@')[0];

        const response = await authService.register({
          username,
          email,
          password,
          full_name: name,
        });

        Alert.alert(
          'Account Created!',
          `Welcome ${response.user.username}!\n\nYou can now login.`
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
  parameters: {
    title: 'Auth/RealBackendAuth',
    docs: {
      description: {
        story: 'Connects to real backend API at http://localhost:8000. Make sure the backend is running!',
      },
    },
  },
};
