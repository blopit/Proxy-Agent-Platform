/**
 * SocialLoginButton Stories - OAuth provider button variations
 * Shows all social login providers with different states
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, Alert } from 'react-native';
import SocialLoginButton from './SocialLoginButton';

const meta = {
  title: 'Auth/SocialLoginButton',
  component: SocialLoginButton,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 24, backgroundColor: '#002b36' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SocialLoginButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Google - Default State
 * Standard Google login button
 */
export const Google: Story = {
  args: {
    provider: 'google',
    onPress: () => Alert.alert('Google Login', 'Initiating Google OAuth flow...'),
  },
};

/**
 * Apple - Default State
 * Standard Apple login button
 */
export const Apple: Story = {
  args: {
    provider: 'apple',
    onPress: () => Alert.alert('Apple Login', 'Initiating Apple OAuth flow...'),
  },
};

/**
 * GitHub - Default State
 * Standard GitHub login button
 */
export const GitHub: Story = {
  args: {
    provider: 'github',
    onPress: () => Alert.alert('GitHub Login', 'Initiating GitHub OAuth flow...'),
  },
};

/**
 * Microsoft - Default State
 * Standard Microsoft login button
 */
export const Microsoft: Story = {
  args: {
    provider: 'microsoft',
    onPress: () => Alert.alert('Microsoft Login', 'Initiating Microsoft OAuth flow...'),
  },
};

/**
 * Loading State - Google
 * Shows loading spinner while authenticating
 */
export const GoogleLoading: Story = {
  args: {
    provider: 'google',
    isLoading: true,
    onPress: () => {},
  },
};

/**
 * Loading State - Apple
 * Shows loading spinner while authenticating
 */
export const AppleLoading: Story = {
  args: {
    provider: 'apple',
    isLoading: true,
    onPress: () => {},
  },
};

/**
 * Disabled State - Google
 * Button is disabled and cannot be pressed
 */
export const GoogleDisabled: Story = {
  args: {
    provider: 'google',
    disabled: true,
    onPress: () => {},
  },
};

/**
 * All Providers - Vertical Stack
 * Shows all social login options together
 */
export const AllProviders: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <SocialLoginButton
        provider="google"
        onPress={() => Alert.alert('Google', 'Sign in with Google')}
      />
      <SocialLoginButton
        provider="apple"
        onPress={() => Alert.alert('Apple', 'Sign in with Apple')}
      />
      <SocialLoginButton
        provider="github"
        onPress={() => Alert.alert('GitHub', 'Sign in with GitHub')}
      />
      <SocialLoginButton
        provider="microsoft"
        onPress={() => Alert.alert('Microsoft', 'Sign in with Microsoft')}
      />
    </View>
  ),
};

/**
 * Interactive - All Providers
 * Fully interactive buttons that respond to presses
 */
export const Interactive: Story = {
  render: () => {
    const handlePress = (provider: string) => {
      Alert.alert(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth`,
        `Initiating ${provider} authentication flow...`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => console.log(`${provider} auth started`) },
        ]
      );
    };

    return (
      <View style={{ gap: 8 }}>
        <SocialLoginButton provider="google" onPress={() => handlePress('google')} />
        <SocialLoginButton provider="apple" onPress={() => handlePress('apple')} />
        <SocialLoginButton provider="github" onPress={() => handlePress('github')} />
        <SocialLoginButton provider="microsoft" onPress={() => handlePress('microsoft')} />
      </View>
    );
  },
};
