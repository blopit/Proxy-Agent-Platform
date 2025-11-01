/**
 * WorkflowContextDisplay - Show user context used for AI step generation
 *
 * Displays energy level, time of day, codebase state, and recent work
 * to explain why AI generated specific steps.
 */

import React from 'react';
import { spacing, fontSize, fontWeight, semanticColors, borderRadius, colors } from '@/lib/design-system';

export interface WorkflowContextDisplayProps {
  userEnergy: 1 | 2 | 3;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  codebaseState?: {
    testsPassing?: number;
    testsFailing?: number;
    recentFiles?: string[];
  };
  recentTasks?: string[];
  compact?: boolean;
}

const energyConfig = {
  1: { label: 'Low Energy', color: colors.orange, icon: '🔋', description: 'Shorter, simpler steps (3-4 steps, 15-20 min each)' },
  2: { label: 'Medium Energy', color: colors.yellow, icon: '⚡', description: 'Standard workflow (5-6 steps, 20-30 min each)' },
  3: { label: 'High Energy', color: colors.green, icon: '🔥', description: 'Detailed breakdown (7-8 steps, 30-45 min each)' },
};

const timeConfig = {
  morning: { icon: '🌅', label: 'Morning', description: 'Focus on planning and design' },
  afternoon: { icon: '☀️', label: 'Afternoon', description: 'Peak implementation time' },
  evening: { icon: '🌆', label: 'Evening', description: 'Testing and cleanup' },
  night: { icon: '🌙', label: 'Night', description: 'Review and documentation' },
};

export default function WorkflowContextDisplay({
  userEnergy,
  timeOfDay,
  codebaseState,
  recentTasks,
  compact = false,
}: WorkflowContextDisplayProps) {
  const energyData = energyConfig[userEnergy];
  const timeData = timeConfig[timeOfDay];

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          gap: spacing[3],
          flexWrap: 'wrap',
        }}
      >
        {/* Energy Badge */}
        <div
          style={{
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: `${energyData.color}20`,
            color: energyData.color,
            borderRadius: borderRadius.base,
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <span>{energyData.icon}</span>
          <span>{energyData.label}</span>
        </div>

        {/* Time Badge */}
        <div
          style={{
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: semanticColors.bg.tertiary,
            color: semanticColors.text.secondary,
            borderRadius: borderRadius.base,
            fontSize: fontSize.sm,
            fontWeight: fontWeight.medium,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <span>{timeData.icon}</span>
          <span>{timeData.label}</span>
        </div>

        {/* Codebase Status */}
        {codebaseState && (
          <div
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              backgroundColor: semanticColors.bg.tertiary,
              color: semanticColors.text.secondary,
              borderRadius: borderRadius.base,
              fontSize: fontSize.sm,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <span>🧪</span>
            <span>
              {codebaseState.testsPassing}/{codebaseState.testsPassing! + codebaseState.testsFailing!} passing
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: spacing[6],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        border: `1px solid ${semanticColors.border.subtle}`,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: spacing[5] }}>
        <h3
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semibold,
            color: semanticColors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          🤖 AI Context
        </h3>
        <p
          style={{
            fontSize: fontSize.sm,
            color: semanticColors.text.secondary,
            margin: 0,
          }}
        >
          AI uses this context to generate personalized implementation steps
        </p>
      </div>

      {/* Energy Level */}
      <div style={{ marginBottom: spacing[5] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            marginBottom: spacing[2],
          }}
        >
          <span style={{ fontSize: fontSize['2xl'] }}>{energyData.icon}</span>
          <div>
            <div
              style={{
                fontSize: fontSize.base,
                fontWeight: fontWeight.medium,
                color: energyData.color,
              }}
            >
              {energyData.label}
            </div>
            <div
              style={{
                fontSize: fontSize.sm,
                color: semanticColors.text.secondary,
              }}
            >
              {energyData.description}
            </div>
          </div>
        </div>
      </div>

      {/* Time of Day */}
      <div style={{ marginBottom: spacing[5] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
            marginBottom: spacing[2],
          }}
        >
          <span style={{ fontSize: fontSize['2xl'] }}>{timeData.icon}</span>
          <div>
            <div
              style={{
                fontSize: fontSize.base,
                fontWeight: fontWeight.medium,
                color: semanticColors.text.primary,
              }}
            >
              {timeData.label}
            </div>
            <div
              style={{
                fontSize: fontSize.sm,
                color: semanticColors.text.secondary,
              }}
            >
              {timeData.description}
            </div>
          </div>
        </div>
      </div>

      {/* Codebase State */}
      {codebaseState && (
        <div style={{ marginBottom: spacing[5] }}>
          <div
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            📊 Codebase State
          </div>
          <div
            style={{
              padding: spacing[3],
              backgroundColor: semanticColors.bg.tertiary,
              borderRadius: borderRadius.base,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: spacing[2],
              }}
            >
              <span style={{ fontSize: fontSize.sm, color: semanticColors.text.primary, fontWeight: fontWeight.medium }}>
                Tests Passing:
              </span>
              <span
                style={{
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.bold,
                  color: semanticColors.accent.success,
                }}
              >
                ✓ {codebaseState.testsPassing}
              </span>
            </div>
            {codebaseState.testsFailing && codebaseState.testsFailing > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: spacing[2],
                }}
              >
                <span style={{ fontSize: fontSize.sm, color: semanticColors.text.primary, fontWeight: fontWeight.medium }}>
                  Tests Failing:
                </span>
                <span
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.bold,
                    color: semanticColors.accent.error,
                  }}
                >
                  ✗ {codebaseState.testsFailing}
                </span>
              </div>
            )}
            {codebaseState.recentFiles && codebaseState.recentFiles.length > 0 && (
              <div style={{ marginTop: spacing[3] }}>
                <div
                  style={{
                    fontSize: fontSize.sm,
                    color: semanticColors.text.primary,
                    fontWeight: fontWeight.medium,
                    marginBottom: spacing[2],
                  }}
                >
                  Recent Files:
                </div>
                {codebaseState.recentFiles.slice(0, 3).map((file, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: fontSize.sm,
                      color: semanticColors.text.primary,
                      fontFamily: 'monospace',
                      marginBottom: spacing[1],
                      paddingLeft: spacing[2],
                    }}
                  >
                    📄 {file}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      {recentTasks && recentTasks.length > 0 && (
        <div>
          <div
            style={{
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            ✅ Recent Work
          </div>
          <div
            style={{
              padding: spacing[3],
              backgroundColor: semanticColors.bg.tertiary,
              borderRadius: borderRadius.base,
            }}
          >
            {recentTasks.slice(0, 3).map((task, i) => (
              <div
                key={i}
                style={{
                  fontSize: fontSize.sm,
                  color: semanticColors.text.secondary,
                  marginBottom: i < recentTasks.length - 1 ? spacing[2] : 0,
                }}
              >
                • {task}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
