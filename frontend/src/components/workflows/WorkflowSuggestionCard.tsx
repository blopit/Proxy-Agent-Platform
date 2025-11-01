/**
 * WorkflowSuggestionCard - Displays AI-powered workflow suggestion with letter grade
 *
 * Shows workflow recommendation with:
 * - Letter grade badge (A+ to F) with color coding
 * - Confidence percentage
 * - Reasoning for the grade
 * - Pros and cons lists
 * - Estimated steps and time
 */

import React from 'react';
import { spacing, fontSize, fontWeight, semanticColors, borderRadius, shadows, colors } from '@/lib/design-system';
import { Workflow } from './WorkflowBrowser';

export interface WorkflowSuggestion {
  workflow_id: string;
  grade: string; // A+, A, A-, B+, B, B-, C+, C, C-, D, F
  confidence: number; // 0.0-1.0
  reasoning: string;
  pros: string[];
  cons: string[];
  estimated_steps: number;
  estimated_time_minutes: number;
}

interface WorkflowSuggestionCardProps {
  suggestion: WorkflowSuggestion;
  workflow?: Workflow;
  onSelect: (workflowId: string) => void;
  selected?: boolean;
}

// Grade color mapping (using design system colors)
const GRADE_COLORS: Record<string, string> = {
  'A+': colors.green, // Solarized green
  'A': colors.green,
  'A-': colors.green,
  'B+': colors.yellow, // Solarized yellow
  'B': colors.yellow,
  'B-': colors.yellow,
  'C+': colors.orange, // Solarized orange
  'C': colors.orange,
  'C-': colors.orange,
  'D': colors.red, // Solarized red
  'F': colors.red,
};

const GRADE_EMOJIS: Record<string, string> = {
  'A+': '🌟',
  'A': '🌟',
  'A-': '🌟',
  'B+': '✨',
  'B': '✨',
  'B-': '✨',
  'C+': '⚠️',
  'C': '⚠️',
  'C-': '⚠️',
  'D': '❌',
  'F': '🚫',
};

export default function WorkflowSuggestionCard({
  suggestion,
  workflow,
  onSelect,
  selected = false,
}: WorkflowSuggestionCardProps) {
  const gradeColor = GRADE_COLORS[suggestion.grade] || semanticColors.text.secondary;
  const gradeEmoji = GRADE_EMOJIS[suggestion.grade] || '❓';
  const confidencePercent = Math.round(suggestion.confidence * 100);

  return (
    <div
      onClick={() => onSelect(suggestion.workflow_id)}
      style={{
        backgroundColor: selected ? semanticColors.bg.secondary : semanticColors.bg.primary,
        border: `2px solid ${selected ? semanticColors.accent.primary : semanticColors.border.subtle}`,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: selected ? shadows.md : shadows.sm,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = semanticColors.border.hover;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = shadows.md;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = semanticColors.border.subtle;
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = shadows.sm;
        }
      }}
    >
      {/* Grade Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[3] }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing[2],
            backgroundColor: gradeColor,
            color: semanticColors.text.inverse,
            padding: `${spacing[1]} ${spacing[3]}`,
            borderRadius: borderRadius.full,
            fontSize: fontSize.sm,
            fontWeight: fontWeight.bold,
          }}
        >
          <span>{gradeEmoji}</span>
          <span>{suggestion.grade}</span>
          <span style={{ opacity: 0.9, fontWeight: fontWeight.normal }}>
            ({confidencePercent}%)
          </span>
        </div>

        {workflow && (
          <div style={{ fontSize: fontSize.xs, color: semanticColors.text.tertiary }}>
            {workflow.workflowType}
          </div>
        )}
      </div>

      {/* Workflow Name */}
      {workflow && (
        <h3
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semibold,
            color: semanticColors.text.primary,
            margin: 0,
            marginBottom: spacing[2],
          }}
        >
          {workflow.name}
        </h3>
      )}

      {/* Reasoning */}
      <p
        style={{
          fontSize: fontSize.sm,
          color: semanticColors.text.secondary,
          margin: 0,
          marginBottom: spacing[3],
          lineHeight: 1.5,
        }}
      >
        {suggestion.reasoning}
      </p>

      {/* Pros */}
      {suggestion.pros.length > 0 && (
        <div style={{ marginBottom: spacing[3] }}>
          <div style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: semanticColors.accent.success, marginBottom: spacing[1] }}>
            ✅ Strengths
          </div>
          <ul style={{ margin: 0, paddingLeft: spacing[5], fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
            {suggestion.pros.map((pro, idx) => (
              <li key={idx} style={{ marginBottom: spacing[1] }}>{pro}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cons */}
      {suggestion.cons.length > 0 && (
        <div style={{ marginBottom: spacing[3] }}>
          <div style={{ fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: semanticColors.accent.warning, marginBottom: spacing[1] }}>
            ⚠️ Concerns
          </div>
          <ul style={{ margin: 0, paddingLeft: spacing[5], fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
            {suggestion.cons.map((con, idx) => (
              <li key={idx} style={{ marginBottom: spacing[1] }}>{con}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Estimates */}
      <div
        style={{
          display: 'flex',
          gap: spacing[4],
          paddingTop: spacing[3],
          borderTop: `1px solid ${semanticColors.border.subtle}`,
          fontSize: fontSize.xs,
          color: semanticColors.text.tertiary,
        }}
      >
        <div>
          <span style={{ fontWeight: fontWeight.medium }}>Steps:</span> {suggestion.estimated_steps}
        </div>
        <div>
          <span style={{ fontWeight: fontWeight.medium }}>Time:</span>{' '}
          {Math.round(suggestion.estimated_time_minutes / 60)}h {suggestion.estimated_time_minutes % 60}m
        </div>
      </div>
    </div>
  );
}
