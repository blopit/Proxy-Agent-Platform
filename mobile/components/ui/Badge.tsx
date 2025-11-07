/**
 * Badge Component (React Native)
 * Status badges, tags, and labels
 * Solarized Dark theme
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/src/components/ui/Text';

export interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        styles[variant],
        styles[`${size}Size`],
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          styles[`${variant}Text`],
          styles[`${size}Text`],
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  // Variants
  default: {
    backgroundColor: '#073642', // Solarized base02
    borderWidth: 1,
    borderColor: '#586e75', // Solarized base01
  },
  primary: {
    backgroundColor: '#2aa198', // Solarized cyan
  },
  success: {
    backgroundColor: '#859900', // Solarized green
  },
  warning: {
    backgroundColor: '#b58900', // Solarized yellow
  },
  danger: {
    backgroundColor: '#dc322f', // Solarized red
  },
  info: {
    backgroundColor: '#268bd2', // Solarized blue
  },

  // Sizes
  smSize: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mdSize: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lgSize: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  // Text base
  text: {
    fontWeight: '600',
  },

  // Text variants
  defaultText: {
    color: '#93a1a1', // Light text
  },
  primaryText: {
    color: '#002b36', // Dark text on cyan
  },
  successText: {
    color: '#002b36', // Dark text on green
  },
  warningText: {
    color: '#002b36', // Dark text on yellow
  },
  dangerText: {
    color: '#fdf6e3', // Light text on red
  },
  infoText: {
    color: '#fdf6e3', // Light text on blue
  },

  // Text sizes
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 14,
  },
});
