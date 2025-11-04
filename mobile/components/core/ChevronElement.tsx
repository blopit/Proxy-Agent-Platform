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
   * Additional styles for the container
   */
  style?: ViewStyle;
}

/**
 * Generate SVG path for chevron shape based on position
 * All chevrons use sharp angles (no rounding)
 * Left side is CONCAVE pointing RIGHT, right side is CONVEX pointing RIGHT
 */
const getChevronPath = (
  position: ChevronPosition,
  width: number,
  height: number,
  depth: number
): string => {
  const halfHeight = height / 2;

  switch (position) {
    case 'start':
      // Left edge straight, right edge angled pointing RIGHT (>)
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
      // Left concave pointing RIGHT, right convex pointing RIGHT (both point -->)
      // Shape like: <| bar |>  becomes <|>
      return `
        M 0 0
        L ${width - depth} 0
        L ${width} ${halfHeight}
        L ${width - depth} ${height}
        L 0 ${height}
        L ${depth} ${halfHeight}
        Z
      `;

    case 'end':
      // Left edge concave pointing RIGHT, right edge straight
      return `
        M 0 0
        L ${width} 0
        L ${width} ${height}
        L 0 ${height}
        L ${depth} ${halfHeight}
        Z
      `;
  }
};

/**
 * ChevronElement - A container with sharp chevron styling
 *
 * Creates a div-like element with sharp angled edges for flow/step visualizations.
 * Inspired by CSS chevron bars with clean, geometric shapes.
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
  style,
}) => {
  const numericWidth = typeof width === 'number' ? width : 300;

  return (
    <View style={[styles.container, style, { height }]}>
      {/* SVG Chevron Shape with shape-accurate shadow */}
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
          d={getChevronPath(position, numericWidth, height, chevronDepth)}
          fill={backgroundColor}
          filter={shadow ? 'url(#chevron-shadow)' : undefined}
          shapeRendering="geometricPrecision" // Antialiasing for smooth edges
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
    overflow: 'visible', // Allow shadows to render outside bounds
  },
  content: {
    zIndex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
