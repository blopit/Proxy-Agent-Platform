import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Defs, Filter, FeDropShadow } from 'react-native-svg';

export type ChevronPosition = 'start' | 'middle' | 'end' | 'single';

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
   * Position in a chevron chain
   * - 'start': Left edge straight, right edge angled (convex)
   * - 'middle': Both edges angled (left concave, right convex)
   * - 'end': Left edge angled (concave), right edge straight
   * - 'single': Same as middle (standalone chevron)
   */
  position?: ChevronPosition;

  /**
   * Border radius for rounding the angle points (0 = sharp angles)
   */
  borderRadius?: number;

  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
}

/**
 * Generate SVG path for chevron shape based on position
 */
const getChevronPath = (
  position: ChevronPosition,
  width: number,
  height: number,
  depth: number,
  radius: number = 0
): string => {
  const halfHeight = height / 2;

  // If no radius, use sharp angles
  if (radius === 0) {
    switch (position) {
      case 'start':
        return `
          M 0 0
          L ${width - depth} 0
          L ${width} ${halfHeight}
          L ${width - depth} ${height}
          L 0 ${height}
          Z
        `;

      case 'middle':
      case 'single':
        return `
          M 0 0
          L ${width - depth} 0
          L ${width} ${halfHeight}
          L ${width - depth} ${height}
          L 0 ${height}
          L ${depth} ${halfHeight}
          L 0 0
          Z
        `;

      case 'end':
        return `
          M 0 0
          L ${width} 0
          L ${width} ${height}
          L 0 ${height}
          L ${depth} ${halfHeight}
          L 0 0
          Z
        `;
    }
  }

  // With radius, use rounded angles
  switch (position) {
    case 'start':
      // Left edge straight, right edge rounded
      return `
        M 0 0
        L ${width - depth - radius} 0
        Q ${width - depth} 0, ${width - depth + radius} ${radius}
        L ${width - radius} ${halfHeight - radius}
        Q ${width} ${halfHeight}, ${width - radius} ${halfHeight + radius}
        L ${width - depth + radius} ${height - radius}
        Q ${width - depth} ${height}, ${width - depth - radius} ${height}
        L 0 ${height}
        Z
      `;

    case 'middle':
    case 'single':
      // Both edges rounded
      return `
        M 0 0
        L ${width - depth - radius} 0
        Q ${width - depth} 0, ${width - depth + radius} ${radius}
        L ${width - radius} ${halfHeight - radius}
        Q ${width} ${halfHeight}, ${width - radius} ${halfHeight + radius}
        L ${width - depth + radius} ${height - radius}
        Q ${width - depth} ${height}, ${width - depth - radius} ${height}
        L ${depth + radius} ${height}
        Q ${depth} ${height}, ${depth - radius} ${height - radius}
        L ${radius} ${halfHeight + radius}
        Q 0 ${halfHeight}, ${radius} ${halfHeight - radius}
        L ${depth - radius} ${radius}
        Q ${depth} 0, ${depth + radius} 0
        L 0 0
        Z
      `;

    case 'end':
      // Left edge rounded, right edge straight
      return `
        M 0 0
        L ${width} 0
        L ${width} ${height}
        L ${depth + radius} ${height}
        Q ${depth} ${height}, ${depth - radius} ${height - radius}
        L ${radius} ${halfHeight + radius}
        Q 0 ${halfHeight}, ${radius} ${halfHeight - radius}
        L ${depth - radius} ${radius}
        Q ${depth} 0, ${depth + radius} 0
        L 0 0
        Z
      `;
  }
};

/**
 * ChevronElement - A container that adds chevron styling
 *
 * Creates a div-like element with angled edges for creating flow/step visualizations.
 * Supports 'start', 'middle', and 'end' positions for chaining multiple chevrons.
 */
export const ChevronElement: React.FC<ChevronElementProps> = ({
  children,
  backgroundColor = '#3B82F6',
  height = 60,
  width = '100%',
  chevronDepth = 10,
  shadow = false,
  position = 'single',
  borderRadius = 3,
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
        {shadow && (
          <Defs>
            <Filter id="chevron-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <FeDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </Filter>
          </Defs>
        )}
        <Path
          d={getChevronPath(position, numericWidth, height, chevronDepth, borderRadius)}
          fill={backgroundColor}
          filter={shadow ? 'url(#chevron-shadow)' : undefined}
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
