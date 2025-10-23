/**
 * AsyncJobTimeline - Universal progress visualization for async operations
 *
 * Features:
 * - Shows micro-step descriptions as proportional sections
 * - Auto-expands current step to 50% width
 * - Manual toggle for inspection
 * - HUMAN tasks: 2-5 min chunks (proportional width)
 * - DIGITAL tasks: unlimited/auto (minimal width)
 * - Three size variants: full, micro, nano
 *
 * Usage:
 * <AsyncJobTimeline
 *   jobName="Send email to Sara"
 *   steps={microSteps}
 *   currentProgress={45}
 *   size="full"
 * />
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ProgressBar from './ProgressBar';

// ============================================================================
// Types
// ============================================================================

export type JobStepStatus = 'pending' | 'active' | 'done' | 'error';
export type JobStepType = 'DIGITAL' | 'HUMAN' | 'unknown';
export type TimelineSize = 'full' | 'micro' | 'nano';

export interface JobStep {
  id: string;
  description: string;              // Full description (e.g., "Draft email message")
  shortLabel?: string;              // Short label for collapsed/micro (e.g., "Draft")
  detail?: string;                  // Detail text when expanded
  estimatedMinutes: number;         // 0 for DIGITAL (auto), 2-5 for HUMAN
  leafType: JobStepType;
  icon?: string;                    // Emoji icon
  status: JobStepStatus;
  startTime?: number;
  endTime?: number;
}

export interface AsyncJobTimelineProps {
  jobName: string;
  steps: JobStep[];
  currentProgress: number;          // 0-100
  size?: TimelineSize;
  onClose?: () => void;
  onDismiss?: () => void;           // For task previews - shows [×] to remove
  onStepClick?: (stepId: string) => void;
  onRetryStep?: (stepId: string) => void; // Retry failed step
  className?: string;
  showProgressBar?: boolean;        // Default: true
  processingTimeMs?: number;        // Show completion time
  stepProgress?: Map<string, number>; // Individual step progress (0-100)
}

// ============================================================================
// Width Calculation
// ============================================================================

function calculateStepWidths(
  steps: JobStep[],
  expandedStepId: string | null
): Map<string, number> {
  const widths = new Map<string, number>();

  // If no step is expanded, all take expected proportions
  if (!expandedStepId) {
    const humanSteps = steps.filter(s => s.leafType === 'HUMAN');
    const digitalSteps = steps.filter(s => s.leafType === 'DIGITAL');

    const totalHumanTime = humanSteps.reduce((sum, s) => sum + s.estimatedMinutes, 0);
    const digitalCount = digitalSteps.length;

    // Reserve 5% per digital task (max 20% total)
    const digitalSpace = Math.min(digitalCount * 5, 20);
    const humanSpace = 100 - digitalSpace;

    steps.forEach(step => {
      if (step.leafType === 'DIGITAL') {
        widths.set(step.id, digitalSpace / digitalCount);
      } else {
        const proportion = totalHumanTime > 0
          ? (step.estimatedMinutes / totalHumanTime) * humanSpace
          : humanSpace / humanSteps.length;
        widths.set(step.id, proportion);
      }
    });

    return widths;
  }

  // One step is expanded to 50%, others share remaining 50%
  steps.forEach(step => {
    if (step.id === expandedStepId) {
      widths.set(step.id, 50);
    }
  });

  // Calculate collapsed widths proportionally
  const collapsedSteps = steps.filter(s => s.id !== expandedStepId);
  const humanCollapsed = collapsedSteps.filter(s => s.leafType === 'HUMAN');
  const digitalCollapsed = collapsedSteps.filter(s => s.leafType === 'DIGITAL');

  const totalCollapsedHumanTime = humanCollapsed.reduce((sum, s) => sum + s.estimatedMinutes, 0);
  const digitalCollapsedCount = digitalCollapsed.length;

  const remainingSpace = 50;
  const digitalCollapsedSpace = Math.min(digitalCollapsedCount * 2, remainingSpace * 0.2);
  const humanCollapsedSpace = remainingSpace - digitalCollapsedSpace;

  collapsedSteps.forEach(step => {
    if (step.leafType === 'DIGITAL') {
      widths.set(step.id, digitalCollapsedCount > 0 ? digitalCollapsedSpace / digitalCollapsedCount : 0);
    } else {
      const proportion = totalCollapsedHumanTime > 0
        ? (step.estimatedMinutes / totalCollapsedHumanTime) * humanCollapsedSpace
        : humanCollapsedSpace / humanCollapsed.length;
      widths.set(step.id, proportion);
    }
  });

  return widths;
}

// ============================================================================
// Step Component
// ============================================================================

interface StepSectionProps {
  step: JobStep;
  index: number;
  width: number;
  isExpanded: boolean;
  size: TimelineSize;
  onClick: () => void;
  stepProgressPercent?: number; // 0-100 for this specific step
  onRetry?: () => void;
}

function StepSection({ step, index, width, isExpanded, size, onClick, stepProgressPercent, onRetry }: StepSectionProps) {
  const statusColors = {
    pending: 'bg-[#073642] border-[#586e75]',
    active: 'bg-gradient-to-br from-[#268bd2]/30 to-[#268bd2]/10 border-[#268bd2] shadow-[0_0_12px_rgba(38,139,210,0.6)]',
    done: 'bg-gradient-to-br from-[#859900]/30 to-[#859900]/10 border-[#859900] shadow-[0_0_8px_rgba(133,153,0,0.4)]',
    error: 'bg-gradient-to-br from-[#dc322f]/30 to-[#dc322f]/10 border-[#dc322f] shadow-[0_0_12px_rgba(220,50,47,0.6)]',
  };

  const textColors = {
    pending: 'text-[#586e75]',
    active: 'text-[#268bd2]',
    done: 'text-[#859900]',
    error: 'text-[#dc322f]',
  };

  const getIcon = () => {
    // Always return the custom emoji if available, otherwise default icons
    if (step.icon) return step.icon;

    // Fallback icons based on leaf type
    if (step.leafType === 'DIGITAL') return '🤖';
    if (step.leafType === 'HUMAN') return '👤';
    return '📋';
  };

  const getCheckmarkBadge = () => {
    if (step.status !== 'done') return null;

    return (
      <div className="absolute -bottom-0.5 -right-0.5 bg-[#859900] rounded-full p-0.5 shadow-sm">
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  const getLabel = () => {
    if (size === 'nano') return `${index + 1}`;

    const label = step.shortLabel || step.description;

    if (size === 'micro') {
      // Micro size: very short (10 chars max)
      return label.length > 10 ? `${label.slice(0, 10)}...` : label;
    }

    // Full size collapsed: short (12 chars max)
    if (!isExpanded) {
      return label.length > 12 ? `${label.slice(0, 12)}...` : label;
    }

    // Full size expanded: longer but still limited (25 chars max)
    return label.length > 25 ? `${label.slice(0, 25)}...` : label;
  };

  const getDurationText = () => {
    if (step.estimatedMinutes === 0) return 'auto';
    if (step.estimatedMinutes < 60) return `${step.estimatedMinutes}m`;
    return `${Math.round(step.estimatedMinutes / 60)}h`;
  };

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        border rounded-sm transition-all duration-300 ease-out
        cursor-pointer hover:border-[#2aa198]
        ${statusColors[step.status]}
        ${isExpanded ? 'scale-[1.02] z-10' : 'scale-100'}
        hover:scale-[1.01] hover:shadow-lg
        ${size === 'nano' ? 'h-8' : size === 'micro' ? 'h-9' : isExpanded ? 'h-12' : 'h-10'}
        ${size === 'nano' ? 'px-0.5' : size === 'micro' ? 'px-1.5' : 'px-2'}
        py-0.5
      `}
      style={{ width: `${width}%` }}
      onClick={onClick}
      title={size !== 'full' ? step.description : undefined}
    >
      {/* Nano size - just step number */}
      {size === 'nano' && (
        <span className={`text-[10px] font-medium ${textColors[step.status]}`}>
          {getLabel()}
        </span>
      )}

      {/* Micro size - short label only */}
      {size === 'micro' && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <span className={`text-[9px] font-medium text-center line-clamp-1 ${textColors[step.status]}`}>
            {getLabel()}
          </span>
        </div>
      )}

      {/* Full size - detailed view */}
      {size === 'full' && (
        <>
          {!isExpanded ? (
            // Collapsed state - very compact
            <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
              <span className={`text-[10px] font-medium text-center line-clamp-1 px-0.5 w-full overflow-hidden ${textColors[step.status]}`}>
                {getLabel()}
              </span>
              {step.status === 'pending' && (
                <span className="text-[8px] text-[#586e75]">{getDurationText()}</span>
              )}
            </div>
          ) : (
            // Expanded state - show more detail but still controlled
            <div className="flex flex-col items-center gap-0.5 w-full h-full justify-center overflow-hidden px-1">
              <span className={`text-[10px] font-semibold text-center line-clamp-2 w-full overflow-hidden ${textColors[step.status]}`}>
                {step.description}
              </span>
              {step.detail && (
                <p className="text-[8px] text-[#93a1a1] text-center line-clamp-1 w-full overflow-hidden">
                  {step.detail}
                </p>
              )}
              <span className="text-[7px] text-[#586e75] whitespace-nowrap">
                {getDurationText()} • {step.leafType}
              </span>
            </div>
          )}
        </>
      )}

      {/* Step icon badge (full size only) */}
      {size === 'full' && (
        <div className="absolute -top-1 -left-1 w-6 h-6 flex items-center justify-center z-10 transition-all duration-300">
          <span className="text-base">
            {getIcon()}
          </span>
        </div>
      )}

      {/* Pulsing glow and shimmer effect for active steps */}
      {step.status === 'active' && (
        <>
          {/* Pulsing glow background */}
          <div className="absolute inset-0 rounded-sm bg-[#268bd2]/20 animate-pulse-glow pointer-events-none" />

          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-sm overflow-hidden pointer-events-none">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </>
      )}

      {/* Error state overlay with retry button */}
      {step.status === 'error' && onRetry && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#002b36]/80 rounded-sm backdrop-blur-sm">
          <span className="text-lg animate-bounce">⚠️</span>
          {size === 'full' && (
            <button
              className="text-[9px] px-2 py-0.5 bg-[#dc322f] hover:bg-[#dc322f]/80 text-white rounded transition-colors font-medium"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Mini progress indicator for active steps - only when progress > 0 */}
      {step.status === 'active' && stepProgressPercent !== undefined && stepProgressPercent > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#586e75]/30 rounded-b-sm overflow-hidden">
          <div
            className="h-full bg-[#268bd2] transition-all duration-300"
            style={{ width: `${stepProgressPercent}%` }}
          />
        </div>
      )}

    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AsyncJobTimeline({
  jobName,
  steps,
  currentProgress,
  size = 'full',
  onClose,
  onDismiss,
  onStepClick,
  onRetryStep,
  className = '',
  showProgressBar = true,
  processingTimeMs,
  stepProgress,
}: AsyncJobTimelineProps) {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);
  const [manualExpandId, setManualExpandId] = useState<string | null>(null);

  // Auto-expand active step (unless user has manually expanded something)
  useEffect(() => {
    if (!manualExpandId) {
      const activeStep = steps.find(s => s.status === 'active');
      setExpandedStepId(activeStep?.id || null);
    }
  }, [steps, manualExpandId]);

  const handleStepClick = (stepId: string) => {
    // Toggle manual expansion
    if (manualExpandId === stepId) {
      setManualExpandId(null); // Collapse
    } else {
      setManualExpandId(stepId); // Expand
    }

    onStepClick?.(stepId);
  };

  const effectiveExpandedId = manualExpandId || expandedStepId;
  const stepWidths = calculateStepWidths(steps, effectiveExpandedId);

  const isComplete = currentProgress >= 100;
  const allDone = steps.every(s => s.status === 'done');

  return (
    <div
      className={`
        bg-[#073642] border border-[#586e75] rounded
        ${size === 'nano' ? 'p-1' : size === 'micro' ? 'p-2' : 'p-2'}
        ${className}
      `}
    >
      {/* Header - compact */}
      {size !== 'nano' && (
        <div className="flex items-center justify-between mb-1.5">
          <p className={`line-clamp-1 flex-1 ${size === 'micro' ? 'text-[9px]' : 'text-[10px]'} text-[#93a1a1] font-medium`}>
            {jobName}
          </p>
          {(onClose || onDismiss) && (
            <button
              onClick={onDismiss || onClose}
              className="text-[#586e75] hover:text-[#93a1a1] transition-colors ml-2 flex-shrink-0"
              aria-label={onDismiss ? "Dismiss" : "Close"}
            >
              <X size={size === 'micro' ? 10 : 12} />
            </button>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Steps row */}
        <div className="flex gap-1 items-end mb-1">
          {steps.map((step, index) => (
            <StepSection
              key={step.id}
              step={step}
              index={index}
              width={stepWidths.get(step.id) || 0}
              isExpanded={effectiveExpandedId === step.id}
              size={size}
              onClick={() => handleStepClick(step.id)}
              stepProgressPercent={stepProgress?.get(step.id)}
              onRetry={onRetryStep ? () => onRetryStep(step.id) : undefined}
            />
          ))}
        </div>

        {/* Progress bar */}
        {showProgressBar && (
          isComplete ? (
            // Completed tasks: Show segmented bar (digital vs human breakdown)
            <ProgressBar
              variant="segmented"
              segments={[
                {
                  percentage: (steps.filter(s => s.leafType === 'DIGITAL').length / steps.length) * 100,
                  color: '#2aa198',
                  label: `${steps.filter(s => s.leafType === 'DIGITAL').length} digital steps`,
                },
                {
                  percentage: (steps.filter(s => s.leafType === 'HUMAN').length / steps.length) * 100,
                  color: '#268bd2',
                  label: `${steps.filter(s => s.leafType === 'HUMAN').length} human steps`,
                },
              ].filter(seg => seg.percentage > 0)}
              size="sm"
            />
          ) : (
            // Active tasks: Show gradient progress bar
            <ProgressBar
              variant="gradient"
              progress={currentProgress}
              size="sm"
            />
          )
        )}
      </div>

      {/* Footer (full size only) */}
      {size === 'full' && (isComplete || processingTimeMs) && (
        <div className="mt-2 pt-2 border-t border-[#586e75]">
          {isComplete && allDone && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#859900]">✅ Complete</span>
              {processingTimeMs && (
                <span className="text-[#586e75]">{Math.round(processingTimeMs)}ms</span>
              )}
            </div>
          )}
          {currentProgress < 100 && (
            <div className="text-xs text-[#93a1a1]">
              {Math.round(currentProgress)}% • {steps.filter(s => s.status === 'done').length}/{steps.length} steps
            </div>
          )}
        </div>
      )}
    </div>
  );
}
