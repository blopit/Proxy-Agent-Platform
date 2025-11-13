/**
 * Viewport Wrapper Component
 * Optional wrapper for stories to apply viewport constraints and component sizing
 * Can be used in story decorators or directly in stories
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useControlPanel, VIEWPORT_CONFIGS } from './StorybookControlPanelContext';

const COMPONENT_SIZE_SCALES = {
  small: 0.75,
  medium: 1.0,
  large: 1.25,
  xlarge: 1.5,
};

interface ViewportWrapperProps {
  children: React.ReactNode;
}

/**
 * Wraps story content with viewport constraints and component sizing
 * Usage in stories:
 *
 * export const MyStory: Story = {
 *   decorators: [
 *     (Story) => (
 *       <ViewportWrapper>
 *         <Story />
 *       </ViewportWrapper>
 *     ),
 *   ],
 * };
 */
export function ViewportWrapper({ children }: ViewportWrapperProps) {
  const { viewport, componentSize } = useControlPanel();
  const viewportConfig = VIEWPORT_CONFIGS[viewport];
  const scale = COMPONENT_SIZE_SCALES[componentSize];

  // For React Native, we can't actually constrain the viewport dimensions
  // but we can apply scaling and show viewport info
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  // Calculate max dimensions based on viewport (scaled down if needed)
  const maxWidth = Math.min(viewportConfig.width, screenWidth);
  const maxHeight = Math.min(viewportConfig.height, screenHeight);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.viewportContainer,
          {
            maxWidth,
            maxHeight,
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  viewportContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
