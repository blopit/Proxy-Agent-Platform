/**
 * ChevronButton - React Native Version
 * Stylized button with chevron/arrow shape using SVG
 *
 * Features:
 * - Chevron shape using react-native-svg
 * - Positional variants (first, middle, last, single)
 * - Linear gradient backgrounds
 * - Inner highlight effect (top edge glow)
 * - Drop shadow with colored glow
 * - Touch feedback with press animation
 * - Solarized Dark theme
 */

import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/src/components/ui/Text';

export type ChevronButtonVariant = 'primary' | 'success' | 'error' | 'warning' | 'neutral';
export type ChevronButtonPosition = 'first' | 'middle' | 'last' | 'single';

export interface ChevronButtonProps {
  variant?: ChevronButtonVariant;
  position?: ChevronButtonPosition;
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  width?: number;
}

const ChevronButton: React.FC<ChevronButtonProps> = ({
  variant = 'primary',
  position = 'first',
  onPress,
  disabled = false,
  children,
  width,
}) => {
  const colors = getVariantColors(variant);
  const padding = getPadding(position);
  const [pressAnim] = useState(new Animated.Value(0));

  const handlePressIn = () => {
    if (!disabled) {
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { width: width || 'auto' },
        {
          transform: [{ translateY }],
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: disabled ? 0 : 0.25,
          shadowRadius: 4,
          elevation: disabled ? 0 : 4,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[styles.touchable, disabled && styles.disabled]}
      >
        {/* SVG Background with chevron shape and gradient */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={colors.gradientStart} stopOpacity="1" />
                <Stop offset="100%" stopColor={colors.gradientEnd} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d={getChevronPath(position)}
              fill={`url(#gradient-${variant})`}
            />
          </Svg>
        </View>

        {/* Inner highlight effect (top edge glow) */}
        <View style={StyleSheet.absoluteFill}>
          <Svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id={`highlight-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" stopOpacity="1" />
                <Stop offset="15%" stopColor="rgba(255, 255, 255, 0)" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Path
              d={getHighlightPath(position)}
              fill={`url(#highlight-${variant})`}
            />
          </Svg>
        </View>

        {/* Content */}
        <View style={[styles.content, padding]}>
          <Text style={[styles.text, { color: colors.text }]}>
            {children}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Get SVG path based on position
function getChevronPath(position: ChevronButtonPosition): string {
  const indent = 8; // Chevron indent size (matches web version)

  switch (position) {
    case 'first':
      // Straight left, chevron point right
      return `M 0 0 L ${100 - indent} 0 L 100 20 L ${100 - indent} 40 L 0 40 Z`;

    case 'middle':
      // Chevron indent left, chevron point right
      return `M ${indent} 0 L ${100 - indent} 0 L 100 20 L ${100 - indent} 40 L ${indent} 40 L 0 20 Z`;

    case 'last':
      // Chevron indent left, straight right
      return `M ${indent} 0 L 100 0 L 100 40 L ${indent} 40 L 0 20 Z`;

    case 'single':
      // Straight rectangle
      return `M 0 0 L 100 0 L 100 40 L 0 40 Z`;
  }
}

// Get highlight path (inner top edge glow) - slightly inset from main path
function getHighlightPath(position: ChevronButtonPosition): string {
  const indent = 8;
  const inset = 0.5; // Slight inset for the highlight

  switch (position) {
    case 'first':
      return `M ${inset} ${inset} L ${100 - indent - inset} ${inset} L ${100 - inset * 2} 20 L ${100 - indent - inset} ${40 - inset} L ${inset} ${40 - inset} Z`;

    case 'middle':
      return `M ${indent + inset} ${inset} L ${100 - indent - inset} ${inset} L ${100 - inset * 2} 20 L ${100 - indent - inset} ${40 - inset} L ${indent + inset} ${40 - inset} L ${inset * 2} 20 Z`;

    case 'last':
      return `M ${indent + inset} ${inset} L ${100 - inset} ${inset} L ${100 - inset} ${40 - inset} L ${indent + inset} ${40 - inset} L ${inset * 2} 20 Z`;

    case 'single':
      return `M ${inset} ${inset} L ${100 - inset} ${inset} L ${100 - inset} ${40 - inset} L ${inset} ${40 - inset} Z`;
  }
}

// Get padding based on position
function getPadding(position: ChevronButtonPosition) {
  const hasLeftIndent = position === 'middle' || position === 'last';
  const hasRightPoint = position === 'first' || position === 'middle';

  return {
    paddingLeft: hasLeftIndent ? 18 : 14,
    paddingRight: hasRightPoint ? 18 : 14,
  };
}

// Get colors for variant with gradients
function getVariantColors(variant: ChevronButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        gradientStart: '#268bd2', // Solarized blue
        gradientEnd: '#1e6aa8',   // Darker blue for gradient
        text: '#fdf6e3',          // Light text
        shadow: '#268bd2',        // Blue shadow
      };
    case 'success':
      return {
        gradientStart: '#859900', // Solarized green
        gradientEnd: '#657500',   // Darker green
        text: '#fdf6e3',
        shadow: '#859900',
      };
    case 'error':
      return {
        gradientStart: '#dc322f', // Solarized red
        gradientEnd: '#b02823',   // Darker red
        text: '#fdf6e3',
        shadow: '#dc322f',
      };
    case 'warning':
      return {
        gradientStart: '#b58900', // Solarized yellow
        gradientEnd: '#8f6b00',   // Darker yellow
        text: '#002b36',          // Dark text on yellow
        shadow: '#b58900',
      };
    case 'neutral':
      return {
        gradientStart: '#2aa198', // Solarized cyan
        gradientEnd: '#1f7d77',   // Darker cyan
        text: '#fdf6e3',
        shadow: '#2aa198',
      };
  }
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    position: 'relative',
  },
  touchable: {
    height: 40,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    zIndex: 10, // Ensure content is above SVG layers
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default ChevronButton;
