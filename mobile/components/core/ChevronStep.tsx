/**
 * ChevronStep - React Native Version
 * Simplified chevron/arrow shape for step indicators and tabs
 *
 * Features:
 * - SVG-based chevron shapes
 * - Position variants (first, middle, last, single)
 * - Status colors (pending, active, done, error, next, tab, active_tab)
 * - Size variants (full, micro, nano)
 */

import React, { ReactNode } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { THEME } from '../../src/theme/colors';
import { Text } from '@/src/components/ui/Text';

export type ChevronPosition = 'first' | 'middle' | 'last' | 'single';
export type ChevronStatus = 'pending' | 'active' | 'done' | 'error' | 'next' | 'tab' | 'active_tab';
export type ChevronSize = 'full' | 'micro' | 'nano';

export interface ChevronStepProps {
  status: ChevronStatus;
  position: ChevronPosition;
  size: ChevronSize;
  children?: ReactNode;
  emoji?: string;
  fillColor?: string;
  strokeColor?: string;
  onClick?: () => void;
  width?: number | string;
  ariaLabel?: string;
}

// Default colors (Solarized Dark theme)
const DEFAULT_COLORS = {
  pending: { fill: `${THEME.base02}`, stroke: THEME.base01 },
  active: { fill: `${THEME.blue}20`, stroke: THEME.blue },
  done: { fill: `${THEME.green}20`, stroke: THEME.green },
  error: { fill: `${THEME.red}20`, stroke: THEME.red },
  next: { fill: `${THEME.orange}20`, stroke: THEME.orange },
  tab: { fill: THEME.base02, stroke: THEME.base01 },
  active_tab: { fill: `${THEME.blue}30`, stroke: THEME.blue },
};

// Size configurations
const SIZE_CONFIG = {
  full: { height: 60, fontSize: 14 },
  micro: { height: 40, fontSize: 12 },
  nano: { height: 28, fontSize: 10 },
};

const ChevronStep: React.FC<ChevronStepProps> = ({
  status,
  position,
  size,
  children,
  emoji,
  fillColor,
  strokeColor,
  onClick,
  width,
  ariaLabel,
}) => {
  const colors = DEFAULT_COLORS[status];
  const finalFillColor = fillColor || colors.fill;
  const finalStrokeColor = strokeColor || colors.stroke;
  const config = SIZE_CONFIG[size];

  // Generate SVG path based on position
  const getChevronPath = (): string => {
    const indent = 10;

    switch (position) {
      case 'first':
        // Straight left, chevron point right
        return `M 0 0 L ${100 - indent} 0 L 100 50 L ${100 - indent} 100 L 0 100 Z`;

      case 'middle':
        // Chevron indent left, chevron point right
        return `M ${indent} 0 L ${100 - indent} 0 L 100 50 L ${100 - indent} 100 L ${indent} 100 L 0 50 Z`;

      case 'last':
        // Chevron indent left, straight right
        return `M ${indent} 0 L 100 0 L 100 100 L ${indent} 100 L 0 50 Z`;

      case 'single':
        // Rectangle
        return `M 0 0 L 100 0 L 100 100 L 0 100 Z`;
    }
  };

  const content = (
    <View style={[styles.container, { height: config.height, width: width || '100%' }]}>
      {/* SVG Background */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Path
            d={getChevronPath()}
            fill={finalFillColor}
            stroke={finalStrokeColor}
            strokeWidth="2"
          />
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {emoji && <Text style={[styles.emoji, { fontSize: config.fontSize + 4 }]}>{emoji}</Text>}
        {typeof children === 'string' ? (
          <Text style={[styles.text, { fontSize: config.fontSize, color: THEME.base0 }]}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </View>
  );

  if (onClick) {
    return (
      <TouchableOpacity
        onPress={onClick}
        activeOpacity={0.8}
        accessibilityLabel={ariaLabel}
        style={{ flex: 1 }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  emoji: {
    lineHeight: undefined,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ChevronStep;
