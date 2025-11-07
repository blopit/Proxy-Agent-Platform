/**
 * Button Component (React Native)
 * Standard button with variants and sizes
 * Solarized Dark theme
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/src/components/ui/Text';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        styles[variant],
        styles[`${size}Size`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#002b36' : '#93a1a1'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            isDisabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Variants
  primary: {
    backgroundColor: '#2aa198', // Solarized cyan
  },
  secondary: {
    backgroundColor: '#073642', // Solarized base02
    borderWidth: 1,
    borderColor: '#586e75', // Solarized base01
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#dc322f', // Solarized red
  },

  // Sizes
  smSize: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mdSize: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lgSize: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // Text base
  text: {
    fontWeight: '600',
  },

  // Text variants
  primaryText: {
    color: '#002b36', // Dark text on cyan
  },
  secondaryText: {
    color: '#93a1a1', // Light text
  },
  ghostText: {
    color: '#93a1a1',
  },
  dangerText: {
    color: '#fdf6e3', // Light text on red
  },

  // Text sizes
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.6,
  },
});
