/**
 * WorkflowCard - Display workflow summary
 *
 * Shows workflow name, description, type, and expected complexity.
 * Used in workflow browser and selection UI.
 */

import React from 'react';
import { spacing, fontSize, fontWeight, semanticColors, borderRadius, shadows, colors } from '@/lib/design-system';

export interface WorkflowCardProps {
  workflowId: string;
  name: string;
  description: string;
  workflowType: 'backend' | 'frontend' | 'bugfix' | 'documentation' | 'testing';
  expectedStepCount: number;
  tags: string[];
  selected?: boolean;
  onSelect?: (workflowId: string) => void;
}

const typeColors: Record<string, { bg: string; text: string; icon: string }> = {
  backend: { bg: colors.cyan, text: colors.base03, icon: '⚙️' },
  frontend: { bg: colors.blue, text: colors.base03, icon: '⚛️' },
  bugfix: { bg: colors.orange, text: colors.base3, icon: '🐛' },
  documentation: { bg: colors.violet, text: colors.base3, icon: '📝' },
  testing: { bg: colors.green, text: colors.base03, icon: '🧪' },
};

export default function WorkflowCard({
  workflowId,
  name,
  description,
  workflowType,
  expectedStepCount,
  tags,
  selected = false,
  onSelect,
}: WorkflowCardProps) {
  const typeConfig = typeColors[workflowType] || typeColors.backend;

  return (
    <div
      onClick={() => onSelect?.(workflowId)}
      style={{
        padding: spacing[6],
        backgroundColor: selected ? semanticColors.bg.secondary : semanticColors.bg.primary,
        border: `2px solid ${selected ? semanticColors.accent.primary : semanticColors.border.subtle}`,
        borderRadius: borderRadius.lg,
        boxShadow: selected ? shadows.md : shadows.sm,
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      className="workflow-card"
    >
      {/* Type Badge */}
      <div
        style={{
          position: 'absolute',
          top: spacing[3],
          right: spacing[3],
          padding: `${spacing[1]} ${spacing[3]}`,
          backgroundColor: typeConfig.bg,
          color: typeConfig.text,
          borderRadius: borderRadius.base,
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
          display: 'flex',
          alignItems: 'center',
          gap: spacing[1],
        }}
      >
        <span>{typeConfig.icon}</span>
        <span style={{ textTransform: 'uppercase' }}>{workflowType}</span>
      </div>

      {/* Workflow Name */}
      <h3
        style={{
          fontSize: fontSize.lg,
          fontWeight: fontWeight.semibold,
          color: semanticColors.text.primary,
          marginBottom: spacing[2],
          marginRight: spacing[24], // Space for type badge
        }}
      >
        {name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: fontSize.sm,
          color: semanticColors.text.secondary,
          lineHeight: 1.5,
          marginBottom: spacing[4],
        }}
      >
        {description}
      </p>

      {/* Metadata Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[4],
          marginBottom: spacing[3],
        }}
      >
        {/* Step Count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            fontSize: fontSize.xs,
            color: semanticColors.text.secondary,
          }}
        >
          <span>📋</span>
          <span>{expectedStepCount} steps</span>
        </div>

        {/* AI Powered Badge */}
        <div
          style={{
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: 'rgba(108, 113, 196, 0.1)',
            color: colors.violet,
            borderRadius: borderRadius.sm,
            fontSize: fontSize.xs,
            fontWeight: fontWeight.medium,
          }}
        >
          🤖 AI-Powered
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: spacing[2],
          }}
        >
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: semanticColors.bg.tertiary,
                color: semanticColors.text.secondary,
                borderRadius: borderRadius.sm,
                fontSize: fontSize.xs,
              }}
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                color: semanticColors.text.tertiary,
                fontSize: fontSize.xs,
              }}
            >
              +{tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Selection Indicator */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: spacing[3],
            left: spacing[3],
            width: spacing[5],
            height: spacing[5],
            backgroundColor: semanticColors.accent.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: semanticColors.text.inverse,
            fontSize: fontSize.sm,
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}
