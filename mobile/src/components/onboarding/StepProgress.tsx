/**
 * StepProgress - Beautiful step-based progress indicator
 * Shows all onboarding steps with filled/unfilled circles
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { THEME } from '@/src/theme/colors';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export default function StepProgress({
  currentStep,
  totalSteps,
  stepLabels,
}: StepProgressProps) {
  const circleRadius = 6;
  const circleSpacing = 32;
  const lineWidth = circleSpacing - circleRadius * 2 - 2;

  return (
    <View style={styles.container}>
      {/* Compact Progress: Step X/Y + Dots inline */}
      <View style={styles.inlineContainer}>
        <Text style={styles.progressText}>
          {currentStep}/{totalSteps}
        </Text>

        {/* Step Circles with Connecting Lines */}
        <Svg height={circleRadius * 2 + 4} width={totalSteps * circleSpacing - 8}>
          {/* Draw connecting lines */}
          {Array.from({ length: totalSteps - 1 }).map((_, index) => {
            const x1 = index * circleSpacing + circleRadius * 2 + 1;
            const x2 = (index + 1) * circleSpacing - 1;
            const y = circleRadius + 2;
            const isCompleted = index + 1 < currentStep;

            return (
              <Line
                key={`line-${index}`}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke={isCompleted ? THEME.blue : THEME.base02}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}

          {/* Draw step circles */}
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const cx = index * circleSpacing + circleRadius + 1;
            const cy = circleRadius + 2;
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <React.Fragment key={`circle-${index}`}>
                {/* Outer circle (border) */}
                <Circle
                  cx={cx}
                  cy={cy}
                  r={circleRadius}
                  fill={isCompleted || isCurrent ? THEME.blue : THEME.base02}
                  opacity={isCompleted || isCurrent ? 1 : 0.5}
                />

                {/* Inner circle (for completed steps) */}
                {isCompleted && (
                  <Circle cx={cx} cy={cy} r={circleRadius - 2} fill={THEME.base03} />
                )}

                {/* Current step indicator - small pulse */}
                {isCurrent && (
                  <>
                    <Circle cx={cx} cy={cy} r={circleRadius - 2} fill={THEME.base03} />
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={circleRadius + 2}
                      fill="transparent"
                      stroke={THEME.blue}
                      strokeWidth={1.5}
                      opacity={0.4}
                    />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Optional step label - only show if provided */}
        {stepLabels && stepLabels[currentStep - 1] && (
          <Text style={styles.stepLabel}>{stepLabels[currentStep - 1]}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressText: {
    fontSize: 13,
    color: THEME.base01,
    fontWeight: '600',
    minWidth: 32,
  },
  stepLabel: {
    fontSize: 11,
    color: THEME.base0,
    fontWeight: '600',
    marginLeft: 8,
  },
});
