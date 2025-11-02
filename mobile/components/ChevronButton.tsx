import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Svg, Path } from 'react-native-svg';

/**
 * ChevronButton - React Native button with right-pointing arrow shape
 *
 * Simple >====> arrow design:
 * - Flat left edge
 * - Pointed right edge (>)
 */

export type ChevronVariant = 'primary' | 'success' | 'error' | 'warning' | 'neutral';

export interface ChevronButtonProps {
  variant?: ChevronVariant;
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  width?: number;
}

const ChevronButton: React.FC<ChevronButtonProps> = ({
  variant = 'primary',
  onPress,
  disabled = false,
  children,
  width = 120,
}) => {
  const colors = getVariantColors(variant);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.container, { width }]}
    >
      {/* SVG Arrow Background: >====> */}
      <Svg
        width={width}
        height={36}
        viewBox={`0 0 ${width} 36`}
        style={StyleSheet.absoluteFill}
      >
        {/* Arrow shape: straight left, pointy right */}
        <Path
          d={`
            M 0 0
            L ${width - 12} 0
            L ${width} 18
            L ${width - 12} 36
            L 0 36
            Z
          `}
          fill={disabled ? colors.disabled : colors.background}
        />

        {/* Inner highlight for depth */}
        <Path
          d={`
            M 1 1
            L ${width - 12} 1
            L ${width - 2} 18
            L ${width - 12} 35
            L 1 35
            L 1 1
          `}
          fill="none"
          stroke={disabled ? 'transparent' : colors.highlight}
          strokeWidth={0.8}
          opacity={0.4}
        />
      </Svg>

      {/* Button Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            {
              color: disabled ? colors.disabledText : colors.text,
            },
          ]}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

function getVariantColors(variant: ChevronVariant) {
  switch (variant) {
    case 'primary':
      return {
        background: '#268bd2', // Solarized blue
        highlight: '#4aa3e3',
        text: '#fdf6e3',
        disabled: '#586e75',
        disabledText: '#93a1a1',
      };
    case 'success':
      return {
        background: '#859900', // Solarized green
        highlight: '#9db933',
        text: '#fdf6e3',
        disabled: '#586e75',
        disabledText: '#93a1a1',
      };
    case 'error':
      return {
        background: '#dc322f', // Solarized red
        highlight: '#e85855',
        text: '#fdf6e3',
        disabled: '#586e75',
        disabledText: '#93a1a1',
      };
    case 'warning':
      return {
        background: '#b58900', // Solarized yellow
        highlight: '#cfa321',
        text: '#002b36',
        disabled: '#586e75',
        disabledText: '#93a1a1',
      };
    case 'neutral':
      return {
        background: '#2aa198', // Solarized cyan
        highlight: '#4ebab2',
        text: '#fdf6e3',
        disabled: '#586e75',
        disabledText: '#93a1a1',
      };
  }
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    position: 'relative',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ChevronButton;
