/**
 * SocialLoginButton - OAuth provider login button
 * Supports Google, Apple, GitHub, and Microsoft authentication
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { THEME } from '../../src/theme/colors';
import { Text } from '@/src/components/ui/Text';
import { GoogleLogo, AppleLogo, GitHubLogo } from './brand-icons';

export type SocialProvider = 'google' | 'apple' | 'github' | 'microsoft';

export interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

interface ProviderConfig {
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  backgroundColor: string;
  textColor: string;
  iconColor?: string;
}

const PROVIDER_CONFIG: Record<SocialProvider, ProviderConfig> = {
  google: {
    label: 'Continue with Google',
    icon: GoogleLogo,
    backgroundColor: '#FFFFFF',
    textColor: '#1F1F1F',
  },
  apple: {
    label: 'Continue with Apple',
    icon: AppleLogo,
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  github: {
    label: 'Continue with GitHub',
    icon: GitHubLogo,
    backgroundColor: '#24292E',
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  microsoft: {
    label: 'Continue with Microsoft',
    icon: GoogleLogo, // Placeholder - would need Microsoft icon
    backgroundColor: '#2F2F2F',
    textColor: '#FFFFFF',
    iconColor: '#00A4EF',
  },
};

export default function SocialLoginButton({
  provider,
  onPress,
  isLoading = false,
  disabled = false,
}: SocialLoginButtonProps) {
  const config = PROVIDER_CONFIG[provider];
  const Icon = config.icon;

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.backgroundColor },
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color={config.textColor} />
        ) : (
          <Icon size={20} color={config.iconColor} />
        )}
        <Text style={[styles.text, { color: config.textColor }]}>
          {config.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: THEME.base01,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
