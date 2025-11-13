/**
 * Card Component (React Native)
 * Replaces shadcn/ui Card for mobile
 * Theme-aware with ADHD-optimized design
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'high-priority' | 'medium-priority' | 'low-priority';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const { colors } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'high-priority':
        return { borderColor: colors.red };
      case 'medium-priority':
        return { borderColor: colors.yellow };
      case 'low-priority':
        return { borderColor: colors.base01 };
      default:
        return { borderColor: colors.base01 };
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.base02,
          borderColor: colors.base01,
        },
        getVariantStyle(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  header: {
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },
});
