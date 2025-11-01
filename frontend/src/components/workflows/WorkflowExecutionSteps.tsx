/**
 * WorkflowExecutionSteps - Display AI-generated implementation steps
 *
 * Shows steps as AsyncJobTimeline with TDD phases, validation commands,
 * and step completion tracking.
 */

import React from 'react';
import { spacing, fontSize, fontWeight, semanticColors, borderRadius, shadows, colors } from '@/lib/design-system';
import AsyncJobTimeline, { AsyncJobStep } from '@/components/shared/AsyncJobTimeline';

export interface WorkflowStep {
  stepId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  tddPhase?: 'red' | 'green' | 'refactor';
  validationCommand?: string;
  expectedOutcome?: string;
  icon: string;
  order: number;
}

export interface WorkflowExecutionStepsProps {
  steps: WorkflowStep[];
  currentStepIndex?: number;
  onStepComplete?: (stepId: string) => void;
  onStepStart?: (stepId: string) => void;
  showDetails?: boolean;
}

const tddPhaseColors: Record<string, { bg: string; text: string; label: string }> = {
  red: { bg: 'rgba(220, 50, 47, 0.1)', text: colors.red, label: 'RED: Write Test' },
  green: { bg: 'rgba(133, 153, 0, 0.1)', text: colors.green, label: 'GREEN: Implement' },
  refactor: { bg: 'rgba(38, 139, 210, 0.1)', text: colors.blue, label: 'REFACTOR: Improve' },
};

export default function WorkflowExecutionSteps({
  steps,
  currentStepIndex = 0,
  onStepComplete,
  onStepStart,
  showDetails = true,
}: WorkflowExecutionStepsProps) {
  // Convert workflow steps to AsyncJobTimeline format
  const timelineSteps: AsyncJobStep[] = steps.map((step, index) => ({
    id: step.stepId,
    label: step.title,
    status: step.status === 'completed' ? 'done' :
            step.status === 'in_progress' ? 'active' :
            step.status === 'failed' ? 'error' : 'pending',
    emoji: step.icon,
    duration: step.estimatedMinutes > 0 ? `${step.estimatedMinutes}m` : undefined,
  }));

  const currentStep = steps[currentStepIndex];

  return (
    <div className="workflow-execution-steps">
      {/* AsyncJobTimeline */}
      <div style={{ marginBottom: spacing[6] }}>
        <AsyncJobTimeline
          steps={timelineSteps}
          variant="default"
          size="full"
          showProgress={true}
        />
      </div>

      {/* Current Step Details */}
      {showDetails && currentStep && (
        <div
          style={{
            padding: spacing[6],
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm,
          }}
        >
          {/* Step Header */}
          <div style={{ marginBottom: spacing[4] }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                marginBottom: spacing[2],
              }}
            >
              <span style={{ fontSize: fontSize['2xl'] }}>{currentStep.icon}</span>
              <h3
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold,
                  color: semanticColors.text.primary,
                  margin: 0,
                }}
              >
                {currentStep.title}
              </h3>
            </div>

            {/* TDD Phase Badge */}
            {currentStep.tddPhase && (
              <div
                style={{
                  display: 'inline-block',
                  padding: `${spacing[1]} ${spacing[3]}`,
                  backgroundColor: tddPhaseColors[currentStep.tddPhase].bg,
                  color: tddPhaseColors[currentStep.tddPhase].text,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.xs,
                  fontWeight: fontWeight.medium,
                  marginBottom: spacing[3],
                }}
              >
                {tddPhaseColors[currentStep.tddPhase].label}
              </div>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: fontSize.base,
              color: semanticColors.text.secondary,
              lineHeight: 1.6,
              marginBottom: spacing[4],
            }}
          >
            {currentStep.description}
          </p>

          {/* Estimated Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              marginBottom: spacing[4],
              fontSize: fontSize.sm,
              color: semanticColors.text.tertiary,
            }}
          >
            <span>⏱️</span>
            <span>Estimated: {currentStep.estimatedMinutes} minutes</span>
          </div>

          {/* Validation Command */}
          {currentStep.validationCommand && (
            <div style={{ marginBottom: spacing[4] }}>
              <div
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: semanticColors.text.secondary,
                  marginBottom: spacing[2],
                }}
              >
                💻 Validation Command:
              </div>
              <pre
                style={{
                  padding: spacing[3],
                  backgroundColor: semanticColors.bg.tertiary,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.sm,
                  fontFamily: 'monospace',
                  color: semanticColors.text.primary,
                  overflowX: 'auto',
                  margin: 0,
                }}
              >
                {currentStep.validationCommand}
              </pre>
            </div>
          )}

          {/* Expected Outcome */}
          {currentStep.expectedOutcome && (
            <div
              style={{
                padding: spacing[3],
                backgroundColor: 'rgba(133, 153, 0, 0.05)',
                border: '1px solid rgba(133, 153, 0, 0.2)',
                borderRadius: borderRadius.base,
                marginBottom: spacing[4],
              }}
            >
              <div
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  color: semanticColors.accent.success,
                  marginBottom: spacing[1],
                }}
              >
                ✓ Expected Outcome:
              </div>
              <div
                style={{
                  fontSize: fontSize.sm,
                  color: semanticColors.text.secondary,
                }}
              >
                {currentStep.expectedOutcome}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: spacing[3] }}>
            {currentStep.status === 'pending' && onStepStart && (
              <button
                onClick={() => onStepStart(currentStep.stepId)}
                style={{
                  flex: 1,
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: semanticColors.accent.primary,
                  color: semanticColors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.base,
                  fontWeight: fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Start Step
              </button>
            )}

            {currentStep.status === 'in_progress' && onStepComplete && (
              <button
                onClick={() => onStepComplete(currentStep.stepId)}
                style={{
                  flex: 1,
                  padding: `${spacing[3]} ${spacing[4]}`,
                  backgroundColor: semanticColors.accent.success,
                  color: semanticColors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.base,
                  fontWeight: fontWeight.medium,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                ✓ Mark Complete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step Summary */}
      <div
        style={{
          marginTop: spacing[4],
          padding: spacing[4],
          backgroundColor: semanticColors.bg.tertiary,
          borderRadius: borderRadius.base,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: semanticColors.text.primary }}>
            {steps.filter(s => s.status === 'completed').length}/{steps.length}
          </div>
          <div style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>Steps Complete</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: semanticColors.text.primary }}>
            {steps.reduce((sum, s) => sum + s.estimatedMinutes, 0)}m
          </div>
          <div style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>Total Time</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: fontSize['2xl'], fontWeight: fontWeight.bold, color: semanticColors.accent.success }}>
            {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
          </div>
          <div style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>Progress</div>
        </div>
      </div>
    </div>
  );
}
