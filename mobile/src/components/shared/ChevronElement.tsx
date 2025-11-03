import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface ChevronElementProps {
  /**
   * Content to display inside the chevron
   */
  children: React.ReactNode;

  /**
   * Background color of the chevron
   */
  backgroundColor?: string;

  /**
   * Height of the chevron element
   */
  height?: number;

  /**
   * Width of the chevron element
   */
  width?: number | string;

  /**
   * Depth of the chevron cut (how far the angles go in/out)
   */
  chevronDepth?: number;

  /**
   * Add shadow to the chevron
   */
  shadow?: boolean;

  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
}

/**
 * ChevronElement - A container that adds chevron styling
 *
 * Creates a div-like element with:
 * - Left side: Concave (cut inward) right-pointing angle
 * - Right side: Convex (pointed outward) right-pointing angle
 */
export const ChevronElement: React.FC<ChevronElementProps> = ({
  children,
  backgroundColor = '#3B82F6',
  height = 60,
  width = '100%',
  chevronDepth = 20,
  shadow = false,
  style,
}) => {
  const numericWidth = typeof width === 'number' ? width : 300;

  return (
    <View style={[styles.container, style, { height }]}>
      {/* SVG Chevron Shape */}
      <Svg
        height={height}
        width={numericWidth}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${numericWidth} ${height}`}
      >
        <Path
          d={`
            M ${chevronDepth} 0
            L ${numericWidth - chevronDepth} 0
            L ${numericWidth} ${height / 2}
            L ${numericWidth - chevronDepth} ${height}
            L ${chevronDepth} ${height}
            L 0 ${height / 2}
            Z
          `}
          fill={backgroundColor}
          {...(shadow && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          })}
        />
      </Svg>

      {/* Content Layer */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    zIndex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
