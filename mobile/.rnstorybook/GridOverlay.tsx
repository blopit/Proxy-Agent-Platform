/**
 * Grid Overlay Component
 * Shows a visual grid overlay when enabled in the control panel
 * Uses 8px grid system for alignment reference
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { useControlPanel } from './StorybookControlPanelContext';

// Simplified grid overlay using a repeating pattern
export function SimpleGridOverlay() {
  const { colors } = useTheme();
  const { showGrid } = useControlPanel();

  if (!showGrid) {
    return null;
  }

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const gridSize = 8;

  // Create grid lines
  const verticalLines = [];
  const horizontalLines = [];

  // Vertical lines
  for (let i = 0; i <= screenWidth; i += gridSize) {
    verticalLines.push(
      <View
        key={`v-${i}`}
        style={[
          styles.verticalLine,
          {
            left: i,
            borderLeftColor: colors.base01,
          },
        ]}
      />
    );
  }

  // Horizontal lines
  for (let i = 0; i <= screenHeight; i += gridSize) {
    horizontalLines.push(
      <View
        key={`h-${i}`}
        style={[
          styles.horizontalLine,
          {
            top: i,
            borderTopColor: colors.base01,
          },
        ]}
      />
    );
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {verticalLines}
      {horizontalLines}
    </View>
  );
}

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    width: 0.5,
    height: '100%',
    borderLeftWidth: 0.5,
    opacity: 0.15,
  },
  horizontalLine: {
    position: 'absolute',
    width: '100%',
    height: 0.5,
    borderTopWidth: 0.5,
    opacity: 0.15,
  },
});
