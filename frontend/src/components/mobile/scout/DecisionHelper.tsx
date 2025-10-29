'use client';

import React from 'react';
import { Target, Zap, Clock, Trophy, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import ChevronButton from '../ChevronButton';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';

// ============================================================================
// Types
// ============================================================================

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimated_hours?: number;
  zone?: string;
}

interface TaskComparison {
  task: Task;
  energyCost: number; // 1-10
  estimatedReward: { xp: number; impact: string };
  readinessStatus: 'ready' | 'needs_context' | 'blocked';
  completionProbability?: number; // 0-100
}

export interface DecisionHelperProps {
  comparisons: TaskComparison[];
  onChooseTask: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
}

// ============================================================================
// Component
// ============================================================================

const DecisionHelper: React.FC<DecisionHelperProps> = ({ comparisons, onChooseTask, onViewDetails }) => {
  if (comparisons.length === 0) {
    return null;
  }

  // Get readiness icon and color
  const getReadinessStyle = (status: string) => {
    switch (status) {
      case 'ready':
        return {
          icon: <CheckCircle size={iconSize.sm} />,
          color: semanticColors.accent.success,
          label: 'Ready',
          bg: `${semanticColors.accent.success}20`,
        };
      case 'needs_context':
        return {
          icon: <AlertCircle size={iconSize.sm} />,
          color: semanticColors.accent.warning,
          label: 'Missing Info',
          bg: `${semanticColors.accent.warning}20`,
        };
      case 'blocked':
        return {
          icon: <XCircle size={iconSize.sm} />,
          color: semanticColors.accent.error,
          label: 'Blocked',
          bg: `${semanticColors.accent.error}20`,
        };
      default:
        return {
          icon: <AlertCircle size={iconSize.sm} />,
          color: semanticColors.text.secondary,
          label: 'Unknown',
          bg: semanticColors.bg.secondary,
        };
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical':
        return semanticColors.accent.error;
      case 'high':
        return colors.orange;
      case 'medium':
        return semanticColors.accent.warning;
      case 'low':
        return semanticColors.accent.primary;
      case 'personal':
        return colors.magenta;
      default:
        return semanticColors.text.secondary;
    }
  };

  // Calculate comparison metrics
  const maxEnergy = Math.max(...comparisons.map((c) => c.energyCost));
  const maxTime = Math.max(...comparisons.map((c) => c.task.estimated_hours || 0));
  const maxXP = Math.max(...comparisons.map((c) => c.estimatedReward.xp));

  return (
    <div
      style={{
        marginBottom: spacing[4],
        backgroundColor: semanticColors.bg.primary,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          padding: `${spacing[3]} ${spacing[4]}`,
          marginBottom: spacing[3],
        }}
      >
        <Target size={iconSize.base} style={{ color: colors.orange }} />
        <h3
          style={{
            fontSize: fontSize.base,
            fontWeight: 700,
            color: semanticColors.text.primary,
          }}
        >
          Compare & Decide
        </h3>
      </div>

      {/* Comparison Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: comparisons.length === 2 ? '1fr 1fr' : '1fr',
          gap: spacing[3],
          paddingLeft: spacing[4],
          paddingRight: spacing[4],
        }}
      >
        {comparisons.map((comparison, index) => {
          const readinessStyle = getReadinessStyle(comparison.readinessStatus);
          const isBlocked = comparison.readinessStatus === 'blocked';

          return (
            <div
              key={comparison.task.task_id || comparison.task.id || index}
              style={{
                backgroundColor: semanticColors.bg.secondary,
                borderRadius: borderRadius.lg,
                border: `2px solid ${readinessStyle.color}`,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Task Header */}
              <div
                style={{
                  padding: spacing[3],
                  backgroundColor: `${readinessStyle.color}10`,
                  borderBottom: `1px solid ${semanticColors.border.default}`,
                }}
              >
                {/* Readiness Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    marginBottom: spacing[2],
                  }}
                >
                  <div style={{ color: readinessStyle.color }}>{readinessStyle.icon}</div>
                  <span
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: 600,
                      color: readinessStyle.color,
                    }}
                  >
                    {readinessStyle.label}
                  </span>
                </div>

                {/* Task Title */}
                <h4
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: 600,
                    color: semanticColors.text.primary,
                    marginBottom: spacing[1],
                    lineHeight: 1.4,
                  }}
                  onClick={() => onViewDetails?.(comparison.task)}
                >
                  {comparison.task.title}
                </h4>

                {/* Zone */}
                {comparison.task.zone && (
                  <div
                    style={{
                      fontSize: fontSize.xs,
                      color: semanticColors.text.secondary,
                    }}
                  >
                    {comparison.task.zone}
                  </div>
                )}
              </div>

              {/* Comparison Metrics */}
              <div style={{ padding: spacing[3] }}>
                {/* Energy Cost */}
                <div style={{ marginBottom: spacing[3] }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: spacing[1],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                      <Zap size={iconSize.sm} style={{ color: semanticColors.accent.warning }} />
                      <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Energy</span>
                    </div>
                    <span
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: 600,
                        color: semanticColors.text.primary,
                      }}
                    >
                      {comparison.energyCost}/10
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: spacing[2],
                      backgroundColor: semanticColors.bg.primary,
                      borderRadius: borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(comparison.energyCost / maxEnergy) * 100}%`,
                        height: '100%',
                        backgroundColor: semanticColors.accent.warning,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Time Required */}
                <div style={{ marginBottom: spacing[3] }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: spacing[1],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                      <Clock size={iconSize.sm} style={{ color: semanticColors.accent.primary }} />
                      <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Time</span>
                    </div>
                    <span
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: 600,
                        color: semanticColors.text.primary,
                      }}
                    >
                      {comparison.task.estimated_hours
                        ? comparison.task.estimated_hours < 1
                          ? `${Math.round(comparison.task.estimated_hours * 60)}min`
                          : `${comparison.task.estimated_hours}hr`
                        : 'Unknown'}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: spacing[2],
                      backgroundColor: semanticColors.bg.primary,
                      borderRadius: borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${((comparison.task.estimated_hours || 0) / maxTime) * 100}%`,
                        height: '100%',
                        backgroundColor: semanticColors.accent.primary,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* XP Reward */}
                <div style={{ marginBottom: spacing[3] }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: spacing[1],
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                      <Trophy size={iconSize.sm} style={{ color: colors.yellow }} />
                      <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Reward</span>
                    </div>
                    <span
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: 600,
                        color: semanticColors.text.primary,
                      }}
                    >
                      {comparison.estimatedReward.xp} XP
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: spacing[2],
                      backgroundColor: semanticColors.bg.primary,
                      borderRadius: borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(comparison.estimatedReward.xp / maxXP) * 100}%`,
                        height: '100%',
                        backgroundColor: colors.yellow,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Impact Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: `${getImpactColor(comparison.estimatedReward.impact)}20`,
                    borderRadius: borderRadius.full,
                    marginBottom: spacing[3],
                  }}
                >
                  <span
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: 600,
                      color: getImpactColor(comparison.estimatedReward.impact),
                      textTransform: 'capitalize',
                    }}
                  >
                    {comparison.estimatedReward.impact} Impact
                  </span>
                </div>

                {/* Completion Probability */}
                {comparison.completionProbability !== undefined && (
                  <div style={{ marginBottom: spacing[3] }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: spacing[1],
                      }}
                    >
                      <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
                        Success Rate
                      </span>
                      <span
                        style={{
                          fontSize: fontSize.xs,
                          fontWeight: 600,
                          color:
                            comparison.completionProbability >= 70
                              ? semanticColors.accent.success
                              : comparison.completionProbability >= 40
                                ? semanticColors.accent.warning
                                : semanticColors.accent.error,
                        }}
                      >
                        {comparison.completionProbability}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: spacing[1],
                        backgroundColor: semanticColors.bg.primary,
                        borderRadius: borderRadius.full,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${comparison.completionProbability}%`,
                          height: '100%',
                          backgroundColor:
                            comparison.completionProbability >= 70
                              ? semanticColors.accent.success
                              : comparison.completionProbability >= 40
                                ? semanticColors.accent.warning
                                : semanticColors.accent.error,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Choose Button */}
              <div style={{ padding: `0 ${spacing[3]} ${spacing[3]}` }}>
                <ChevronButton
                  label={isBlocked ? 'Blocked' : 'Choose This'}
                  variant={isBlocked ? 'neutral' : 'success'}
                  position="single"
                  size="micro"
                  disabled={isBlocked}
                  onClick={() => !isBlocked && onChooseTask(comparison.task)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DecisionHelper;
