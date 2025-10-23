/**
 * MicroStepsBreakdown - Display generated task breakdown with micro-steps
 *
 * Features:
 * - Expandable panel below input (stays on same page)
 * - Collapsible accordion for micro-steps
 * - Icon badges showing digital/human split
 * - Action buttons for next steps
 */

'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Play, List, Plus, X } from 'lucide-react';
import { spacing, fontSize, borderRadius, semanticColors, iconSize } from '@/lib/design-system';
import type { CaptureResponse } from '@/types/capture';

interface MicroStepsBreakdownProps {
  data: CaptureResponse;
  onStartNow?: () => void;
  onViewTasks?: () => void;
  onCaptureAnother?: () => void;
  onClose?: () => void;
}

export default function MicroStepsBreakdown({
  data,
  onStartNow,
  onViewTasks,
  onCaptureAnother,
  onClose,
}: MicroStepsBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const { task, micro_steps, breakdown } = data;

  return (
    <div
      style={{
        marginTop: spacing[4],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        border: `1px solid ${semanticColors.border.accent}`,
        overflow: 'hidden',
      }}
    >
      {/* Header - Always visible */}
      <div
        style={{
          padding: spacing[4],
          backgroundColor: semanticColors.bg.primary,
          borderBottom: `1px solid ${semanticColors.border.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
            Task Created
          </div>
          <div style={{ fontSize: fontSize.lg, color: semanticColors.text.primary, fontWeight: 600 }}>
            📋 {task.title}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: spacing[2],
            borderRadius: borderRadius.sm,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: semanticColors.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
          }}
          className="hover:bg-[#073642]"
        >
          {isExpanded ? <ChevronUp size={iconSize.base} /> : <ChevronDown size={iconSize.base} />}
        </button>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div style={{ padding: spacing[4] }}>
          {/* Breakdown Stats */}
          <div
            style={{
              display: 'flex',
              gap: spacing[3],
              padding: spacing[3],
              backgroundColor: semanticColors.bg.primary,
              borderRadius: borderRadius.base,
              marginBottom: spacing[4],
              flexWrap: 'wrap',
            }}
          >
            <StatBadge
              icon="🎯"
              label="Total Steps"
              value={breakdown.total_steps}
            />
            <StatBadge
              icon="⏱️"
              label="Total Time"
              value={`${breakdown.total_minutes} min`}
            />
            <StatBadge
              icon="⚡"
              label="Digital"
              value={breakdown.digital_count}
              color={semanticColors.accent.secondary}
            />
            <StatBadge
              icon="🎯"
              label="Human"
              value={breakdown.human_count}
              color={semanticColors.accent.primary}
            />
          </div>

          {/* Micro-steps list */}
          {micro_steps.length > 0 && (
            <div style={{ marginBottom: spacing[4] }}>
              <div
                style={{
                  fontSize: fontSize.sm,
                  color: semanticColors.text.secondary,
                  fontWeight: 600,
                  marginBottom: spacing[2],
                }}
              >
                Micro-Steps:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
                {micro_steps.map((step, index) => (
                  <MicroStepCard
                    key={step.step_id}
                    step={step}
                    index={index}
                    isExpanded={expandedSteps.has(step.step_id)}
                    onToggle={() => toggleStep(step.step_id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[2],
            }}
          >
            <button
              onClick={onStartNow}
              style={{
                padding: spacing[3],
                backgroundColor: semanticColors.accent.success,
                color: semanticColors.text.inverse,
                borderRadius: borderRadius.md,
                border: 'none',
                fontSize: fontSize.base,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
              className="hover:opacity-90 transition-opacity"
            >
              <Play size={iconSize.base} />
              Start Now
            </button>

            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button
                onClick={onViewTasks}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: semanticColors.bg.primary,
                  color: semanticColors.text.primary,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${semanticColors.border.default}`,
                  fontSize: fontSize.sm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                }}
                className="hover:border-[#2aa198] transition-colors"
              >
                <List size={iconSize.sm} />
                View Tasks
              </button>

              <button
                onClick={onCaptureAnother}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: semanticColors.bg.primary,
                  color: semanticColors.text.primary,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${semanticColors.border.default}`,
                  fontSize: fontSize.sm,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing[2],
                }}
                className="hover:border-[#2aa198] transition-colors"
              >
                <Plus size={iconSize.sm} />
                Capture Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat badge component
function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[2]} ${spacing[3]}`,
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.sm,
        border: `1px solid ${color || semanticColors.border.default}`,
      }}
    >
      <span style={{ fontSize: fontSize.base }}>{icon}</span>
      <div>
        <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
          {label}
        </div>
        <div
          style={{
            fontSize: fontSize.sm,
            color: color || semanticColors.text.primary,
            fontWeight: 600,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// Micro-step card (collapsible)
function MicroStepCard({
  step,
  index,
  isExpanded,
  onToggle,
}: {
  step: any;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        padding: spacing[3],
        backgroundColor: semanticColors.bg.primary,
        borderRadius: borderRadius.sm,
        border: `1px solid ${semanticColors.border.default}`,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
        }}
      >
        <div
          style={{
            fontSize: fontSize.base,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.sm,
            fontWeight: 600,
            color: semanticColors.text.secondary,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>

        {/* Step icon with robot badge for DIGITAL steps */}
        <div style={{ fontSize: fontSize.lg, flexShrink: 0, position: 'relative' }}>
          {step.icon || (step.leaf_type === 'DIGITAL' ? '💻' : '🎯')}
          {/* Robot badge for automatable steps */}
          {step.leaf_type === 'DIGITAL' && (
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                backgroundColor: semanticColors.accent.primary,
                borderRadius: '50%',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Can be automated by AI"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke={semanticColors.bg.primary}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8V4H8" />
                <rect width="16" height="12" x="4" y="8" rx="2" />
                <path d="M2 14h2" />
                <path d="M20 14h2" />
                <path d="M15 13v2" />
                <path d="M9 13v2" />
              </svg>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: fontSize.sm,
              color: semanticColors.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: isExpanded ? 'normal' : 'nowrap',
            }}
          >
            {step.description}
          </div>
        </div>

        <div
          style={{
            fontSize: fontSize.xs,
            color: semanticColors.text.secondary,
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.sm,
            flexShrink: 0,
          }}
        >
          {step.estimated_minutes}m
        </div>

        <div style={{ color: semanticColors.text.secondary, flexShrink: 0 }}>
          {isExpanded ? (
            <ChevronUp size={iconSize.sm} />
          ) : (
            <ChevronDown size={iconSize.sm} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div
          style={{
            marginTop: spacing[2],
            paddingTop: spacing[2],
            borderTop: `1px solid ${semanticColors.border.default}`,
          }}
        >
          <div style={{ display: 'flex', gap: spacing[2], fontSize: fontSize.xs }}>
            <span
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: semanticColors.bg.secondary,
                borderRadius: borderRadius.sm,
                color: semanticColors.text.secondary,
              }}
            >
              Type: {step.leaf_type}
            </span>
            <span
              style={{
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: semanticColors.bg.secondary,
                borderRadius: borderRadius.sm,
                color: semanticColors.text.secondary,
              }}
            >
              Mode: {step.delegation_mode}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
