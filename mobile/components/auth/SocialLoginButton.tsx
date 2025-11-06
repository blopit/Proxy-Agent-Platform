/**
 * SocialLoginButton - OAuth provider login button
 * Supports Google, Apple, GitHub, and Microsoft authentication
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Chrome, Github, Apple as AppleIcon } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';

export type SocialProvider = 'google' | 'apple' | 'github' | 'microsoft';

export interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const PROVIDER_CONFIG = {
  google: {
    label: 'Continue with Google',
    icon: Chrome,
    backgroundColor: '#FFFFFF',
    textColor: '#1F1F1F',
    iconColor: '#4285F4',
  },
  apple: {
    label: 'Continue with Apple',
    icon: AppleIcon,
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  github: {
    label: 'Continue with GitHub',
    icon: Github,
    backgroundColor: '#24292E',
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  microsoft: {
    label: 'Continue with Microsoft',
    icon: Chrome, // Using Chrome as placeholder - would need Microsoft icon
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
