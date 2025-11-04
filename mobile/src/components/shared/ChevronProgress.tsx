import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ChevronElement, ChevronPosition } from '../../../components/core/ChevronElement';

export type ProgressState = 'completed' | 'active' | 'pending' | 'disabled';

export interface ProgressStep {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * Label/title for the step
   */
  label: string;

  /**
   * Current state of the step
   */
  state: ProgressState;

  /**
   * Optional description
   */
  description?: string;
}

export interface ChevronProgressProps {
  /**
   * Array of progress steps
   */
  steps: ProgressStep[];

  /**
   * Height of each chevron
   */
  height?: number;

  /**
   * Chevron depth (default: 10px)
   */
  chevronDepth?: number;

  /**
   * Enable shadows on chevrons
   */
  shadow?: boolean;

  /**
   * Custom color scheme
   */
  colors?: {
    completed?: string;
    active?: string;
    pending?: string;
    disabled?: string;
  };

  /**
   * Text color for each state
   */
  textColors?: {
    completed?: string;
    active?: string;
    pending?: string;
    disabled?: string;
  };

  /**
   * Callback when step is pressed
   */
  onStepPress?: (step: ProgressStep, index: number) => void;

  /**
   * Additional container styles
   */
  style?: ViewStyle;
}

/**
 * Default color scheme inspired by CSS chevron progress bars
 */
const DEFAULT_COLORS = {
  completed: '#10B981', // Green - success
  active: '#3B82F6',    // Blue - primary
  pending: '#6B7280',   // Gray - neutral
  disabled: '#D1D5DB',  // Light gray - disabled
};

const DEFAULT_TEXT_COLORS = {
  completed: '#FFFFFF',
  active: '#FFFFFF',
  pending: '#FFFFFF',
  disabled: '#9CA3AF',
};

/**
 * ChevronProgress - Progress indicator using chevron elements
 *
 * Creates a horizontal progress bar with chevron-shaped steps.
 * Each step can have one of four states: completed, active, pending, or disabled.
 *
 * Inspired by CSS chevron bars for multi-step workflows and wizards.
 */
export const ChevronProgress: React.FC<ChevronProgressProps> = ({
  steps,
  height = 60,
  chevronDepth = 10,
  shadow = false,
  colors = {},
  textColors = {},
  onStepPress,
  style,
}) => {
  const colorScheme = { ...DEFAULT_COLORS, ...colors };
  const textColorScheme = { ...DEFAULT_TEXT_COLORS, ...textColors };

  const getChevronPosition = (index: number): ChevronPosition => {
    if (steps.length === 1) return 'single';
    if (index === 0) return 'start';
    if (index === steps.length - 1) return 'end';
    return 'middle';
  };

  const getBackgroundColor = (state: ProgressState): string => {
    return colorScheme[state];
  };

  const getTextColor = (state: ProgressState): string => {
    return textColorScheme[state];
  };

  return (
    <View style={[styles.container, style]}>
      {steps.map((step, index) => {
        const position = getChevronPosition(index);
        const backgroundColor = getBackgroundColor(step.state);
        const textColor = getTextColor(step.state);

        return (
          <View
            key={step.id}
            style={[
              styles.stepContainer,
              index < steps.length - 1 && styles.stepSpacing,
            ]}
          >
            <ChevronElement
              backgroundColor={backgroundColor}
              height={height}
              chevronDepth={chevronDepth}
              shadow={shadow}
              position={position}
              style={styles.chevron}
            >
              <View style={styles.content}>
                <Text
                  style={[
                    styles.label,
                    { color: textColor },
                    step.state === 'disabled' && styles.disabledText,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
                {step.description && (
                  <Text
                    style={[
                      styles.description,
                      { color: textColor, opacity: 0.8 },
                    ]}
                    numberOfLines={1}
                  >
                    {step.description}
                  </Text>
                )}
              </View>
            </ChevronElement>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    minWidth: 100,
  },
  stepSpacing: {
    marginRight: -10, // Overlap by chevronDepth for seamless connection
  },
  chevron: {
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.5,
  },
});
