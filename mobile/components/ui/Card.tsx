/**
 * Card Component (React Native)
 * Replaces shadcn/ui Card for mobile
 * Solarized Dark theme with ADHD-optimized design
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'high-priority' | 'medium-priority' | 'low-priority';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]}>
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
    backgroundColor: '#073642', // Solarized base02
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#586e75', // Solarized base01
  },
  'high-priority': {
    borderColor: '#dc322f', // Solarized red
    borderWidth: 2,
  },
  'medium-priority': {
    borderColor: '#b58900', // Solarized yellow
    borderWidth: 2,
  },
  'low-priority': {
    borderColor: '#586e75', // Solarized base01
    borderWidth: 2,
  },
  default: {
    borderColor: '#586e75',
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
