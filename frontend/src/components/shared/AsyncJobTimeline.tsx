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
  tags?: string[];                 // Context tags (e.g., ["@home", "@work", "Email"])

  // Hierarchical fields
  parentStepId?: string | null;
  level?: number;
  isLeaf?: boolean;
  decompositionState?: 'stub' | 'decomposing' | 'decomposed' | 'atomic';
  children?: JobStep[];  // Loaded on demand
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

  // If no step is expanded, all steps fill the width equally
  if (!expandedStepId) {
    const equalWidth = 100 / steps.length;
    steps.forEach(step => {
      widths.set(step.id, equalWidth);
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
  effectiveExpandedId: string | null;
  totalDurationText: string;
  loadingChildren?: Set<string>; // For expand indicator
  hasNestedContent?: boolean; // True if showing decomposition job or children
}

function StepSection({ step, index, width, isExpanded, size, onClick, stepProgressPercent, onRetry, effectiveExpandedId, totalDurationText, loadingChildren, hasNestedContent }: StepSectionProps) {
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

  // Render white circled number symbol for 0-20; fallback to styled circle for larger
  const getWhiteCircledNumber = (num: number): string | null => {
    const symbols = [
      '⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩',
      '⑪','⑫','⑬','⑭','⑮','⑯','⑰','⑱','⑲','⑳'
    ];
    if (num >= 0 && num <= 20) return symbols[num];
    return null;
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
    if (step.estimatedMinutes === 0) return '⚡';
    if (step.estimatedMinutes < 60) return `${step.estimatedMinutes}m`;
    return `${Math.round(step.estimatedMinutes / 60)}h`;
  };

  // Wrapper controls sizing with flex; inner card stays content-focused
  const wrapperFlexClasses = !effectiveExpandedId
    ? 'flex-1 basis-0 min-w-0' // base: equal widths
    : isExpanded
      ? 'grow basis-0 min-w-0' // expanded: take remaining space
      : 'basis-5 w-5 shrink-0 grow-0 min-w-0'; // collapsed: exactly 20px

  return (
    <div className={`flex flex-col items-center ${wrapperFlexClasses}`}>
      <div
        className={`
          relative flex flex-col items-center justify-center w-full
          border rounded-sm transition-all duration-300 ease-out
          cursor-pointer hover:border-[#2aa198]
          ${statusColors[step.status]}
          ${isExpanded ? 'scale-[1.02] z-10' : 'scale-100'}
          hover:scale-[1.01] hover:shadow-lg
          ${size === 'nano' ? 'h-8' : size === 'micro' ? 'h-9' : isExpanded ? 'h-12' : 'h-10'}
          ${size === 'nano' ? 'px-0.5' : size === 'micro' ? 'px-1.5' : 'px-2'}
          py-0.5
        `}
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
            // Check if any step is expanded (collapsed state)
            effectiveExpandedId ? (
              // Collapsed state - no text, just empty space for icon
              <div className="flex items-center justify-center w-full h-full max-w-[40px] mx-auto">
                {/* Empty space - icon will be positioned absolutely */}
              </div>
            ) : (
              // Base state - text only, icon floats above
              <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
                <span className={`text-[10px] font-medium text-center line-clamp-1 px-0.5 w-full overflow-hidden ${textColors[step.status]}`}>
                  {getLabel()}
                </span>
                {step.status === 'pending' && (
                  <span className="text-[7px] text-[#586e75]">{getDurationText()}</span>
                )}
              </div>
            )
          ) : (
            // Expanded state - text only, icon floats above
            <div className="flex flex-col items-center gap-0.5 w-full h-full justify-center overflow-hidden px-1">
              <span className={`text-[10px] font-semibold text-center line-clamp-2 w-full overflow-hidden ${textColors[step.status]}`}>
                {step.description}
              </span>
              {step.detail && (
                <p className="text-[8px] text-[#93a1a1] text-center line-clamp-1 w-full overflow-hidden">
                  {step.detail}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Icon badge - full size only */}
      {size === 'full' && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-10 transition-all duration-300 rounded-full px-1.5 py-0.5 ${
            isExpanded 
              ? '-top-7' 
              : effectiveExpandedId 
                ? 'top-1/2 -translate-y-1/2' 
                : '-top-3'
          }`}
        >
          <div className={`flex items-center ${isExpanded ? 'gap-1.5' : ''}`}>
            <span className="text-sm">{getIcon()}</span>
            {isExpanded && (
              <span className={`text-[10px] text-[#93a1a1] line-clamp-1 max-w-[400px] -mt-0.5`}>
                {getLabel()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Step number - top-left above step (only when expanded and NOT showing nested content) */}
      {size === 'full' && isExpanded && !hasNestedContent && (
        <span className="absolute -top-4 left-0 text-[12px] leading-none text-[#93a1a1] font-semibold">
          {index + 1}
        </span>
      )}

      {/* Step duration - top-right above step (only when expanded) */}
      {size === 'full' && isExpanded && (
        <span className="absolute -top-4 right-0 text-[12px] leading-none text-[#93a1a1] font-semibold">
          {getDurationText()}
        </span>
      )}

      {/* Expand indicator for decomposable steps */}
      {size === 'full' && step.isLeaf === false && step.decompositionState !== 'atomic' && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-[#93a1a1]">
          {loadingChildren && loadingChildren.has(step.id) ? '⏳' : (isExpanded ? '▼' : '▶')}
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
      
      {/* Duration text below step - only in base state */}
      {!effectiveExpandedId && (
        <div className="text-[9px] text-[#586e75] font-medium whitespace-nowrap no-underline mt-1">
          &nbsp;
        </div>
      )}
      
      {/* Tags below step - only in expanded state */}
      {isExpanded && (
        <div className="text-[10px] text-[#93a1a1] font-medium whitespace-nowrap no-underline mt-1">
          {step.tags && step.tags.length > 0 ? (
            <span>
              {step.tags.slice(0, 5).map((tag, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="no-underline"> • </span>}
                  <span className="underline">{tag}</span>
                </React.Fragment>
              ))}
              {step.tags.length > 5 && (
                <span className="no-underline"> • +{step.tags.length - 5}</span>
              )}
            </span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
      )}
      
      {/* Space character for collapsed state to maintain alignment */}
      {!isExpanded && effectiveExpandedId && (
        <div className="text-[8px] text-[#586e75] font-medium whitespace-nowrap no-underline mt-1">
          &nbsp;
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const AsyncJobTimeline = React.memo(function AsyncJobTimeline({
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

  // State for hierarchical children
  const [expandedStepChildren, setExpandedStepChildren] = useState<Map<string, JobStep[]>>(new Map());
  const [loadingChildren, setLoadingChildren] = useState<Set<string>>(new Set());

  // State for decomposition jobs
  const [decompositionJobs, setDecompositionJobs] = useState<Map<string, {
    steps: JobStep[];
    progress: number;
  }>>(new Map());

  // Auto-expand active step (unless user has manually expanded something)
  useEffect(() => {
    if (!manualExpandId) {
      const activeStep = steps.find(s => s.status === 'active');
      setExpandedStepId(activeStep?.id || null);
    }
  }, [steps, manualExpandId]);

  const handleStepClick = async (stepId: string) => {
    const step = steps.find(s => s.id === stepId);

    // If step is decomposable and not already expanded, fetch children
    // IMPORTANT: Explicitly check isLeaf === false (not just falsy) to avoid treating undefined as decomposable
    if (step && step.isLeaf === false && step.decompositionState && step.decompositionState !== 'atomic') {
      if (!expandedStepChildren.has(stepId) && step.decompositionState === 'decomposed') {

        // Step has already been decomposed - fetch existing children
        setLoadingChildren(prev => new Set(prev).add(stepId));

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${API_URL}/api/v1/micro-steps/${stepId}/children`);
          const data = await response.json();

          // Convert API response to JobStep format
          const children: JobStep[] = data.children.map((child: any) => ({
            id: child.step_id,
            description: child.description,
            shortLabel: child.short_label,
            estimatedMinutes: child.estimated_minutes,
            leafType: child.leaf_type as JobStepType,
            icon: child.icon,
            status: child.status || 'pending' as JobStepStatus,
            tags: child.tags,
            parentStepId: child.parent_step_id,
            level: child.level,
            isLeaf: child.is_leaf,
            decompositionState: child.decomposition_state,
          }));

          setExpandedStepChildren(prev => new Map(prev).set(stepId, children));
        } catch (error) {
          console.error('Failed to fetch children:', error);
        } finally {
          setLoadingChildren(prev => { const next = new Set(prev); next.delete(stepId); return next; });
        }
      } else if (!expandedStepChildren.has(stepId) && step.decompositionState === 'stub') {
        // Step needs decomposition - trigger AI decomposition with job timeline
        setLoadingChildren(prev => new Set(prev).add(stepId));

        // Create decomposition job steps
        const decompositionSteps: JobStep[] = [
          {
            id: 'analyze',
            description: 'Analyze step complexity',
            shortLabel: 'Analyzing',
            estimatedMinutes: 0,
            leafType: 'DIGITAL',
            icon: '🔍',
            status: 'pending' as JobStepStatus,
          },
          {
            id: 'breakdown',
            description: 'Break down into sub-steps',
            shortLabel: 'Breaking down',
            estimatedMinutes: 0,
            leafType: 'DIGITAL',
            icon: '🧩',
            status: 'pending' as JobStepStatus,
          },
          {
            id: 'generate',
            description: 'Generate micro-steps',
            shortLabel: 'Generating',
            estimatedMinutes: 0,
            leafType: 'DIGITAL',
            icon: '✨',
            status: 'pending' as JobStepStatus,
          },
        ];

        setDecompositionJobs(prev => new Map(prev).set(stepId, {
          steps: decompositionSteps,
          progress: 0
        }));

        // Simulate progress
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress += 2;
          if (currentProgress <= 100) {
            setDecompositionJobs(prev => {
              const job = prev.get(stepId);
              if (!job) return prev;

              // Update step statuses based on progress
              const updatedSteps = job.steps.map((s, i) => {
                if (currentProgress >= (i + 1) * 33) {
                  return { ...s, status: 'done' as JobStepStatus };
                } else if (currentProgress >= i * 33) {
                  return { ...s, status: 'active' as JobStepStatus };
                }
                return s;
              });

              return new Map(prev).set(stepId, {
                steps: updatedSteps,
                progress: currentProgress
              });
            });
          }
        }, 100);

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${API_URL}/api/v1/micro-steps/${stepId}/decompose`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 'default-user' })
          });
          const data = await response.json();

          clearInterval(progressInterval);

          // Mark all steps as done
          setDecompositionJobs(prev => {
            const job = prev.get(stepId);
            if (!job) return prev;
            return new Map(prev).set(stepId, {
              steps: job.steps.map(s => ({ ...s, status: 'done' as JobStepStatus })),
              progress: 100
            });
          });

          // Convert API response to JobStep format
          const children: JobStep[] = data.children.map((child: any) => ({
            id: child.step_id,
            description: child.description,
            shortLabel: child.short_label,
            estimatedMinutes: child.estimated_minutes,
            leafType: child.leaf_type as JobStepType,
            icon: child.icon,
            status: 'pending' as JobStepStatus,
            tags: child.tags,
            parentStepId: child.parent_step_id,
            level: child.level,
            isLeaf: child.is_leaf,
            decompositionState: child.decomposition_state,
          }));

          // Wait a bit to show completion, then replace with children
          setTimeout(() => {
            setExpandedStepChildren(prev => new Map(prev).set(stepId, children));
            setDecompositionJobs(prev => {
              const next = new Map(prev);
              next.delete(stepId);
              return next;
            });
          }, 500);
        } catch (error) {
          console.error('Failed to decompose step:', error);
          clearInterval(progressInterval);
          setDecompositionJobs(prev => {
            const next = new Map(prev);
            next.delete(stepId);
            return next;
          });
        } finally {
          setLoadingChildren(prev => { const next = new Set(prev); next.delete(stepId); return next; });
        }
      }
    }

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
  const totalMinutes = steps.reduce((sum, s) => sum + (s.estimatedMinutes || 0), 0);
  const totalDurationText = totalMinutes < 60 ? `${totalMinutes}m` : `${Math.round(totalMinutes / 60)}h`;

  const getDurationText = (step: JobStep) => {
    if (step.estimatedMinutes === 0) return '⚡';
    if (step.estimatedMinutes < 60) return `${step.estimatedMinutes}m`;
    return `${Math.round(step.estimatedMinutes / 60)}h`;
  };

  const getDurationPrompt = (step: JobStep) => {
    const minutes = step.estimatedMinutes;
    if (minutes === 0) return 'AI will handle this automatically';
    if (minutes <= 2) return 'Quick task - under 2 minutes';
    if (minutes <= 5) return 'Short task - 2-5 minutes';
    if (minutes <= 15) return 'Medium task - 5-15 minutes';
    if (minutes <= 30) return 'Longer task - 15-30 minutes';
    if (minutes <= 60) return 'Extended task - 30-60 minutes';
    return 'Major task - over 1 hour';
  };

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
        <div className="relative flex items-center justify-center mb-0.5 -mt-1">
          <p className={`line-clamp-1 w-full text-center mb-2 ${size === 'micro' ? 'text-[9px]' : 'text-[10px]'} text-[#93a1a1] font-medium ${effectiveExpandedId ? 'opacity-0' : ''}`}>
            {jobName}
          </p>
          {(onClose || onDismiss) && (
            <button
              onClick={onDismiss || onClose}
              className="absolute right-0 text-[#586e75] hover:text-[#93a1a1] transition-colors flex-shrink-0"
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
        <div className="flex gap-1 items-end">
          {steps.map((step, index) => {
            // Calculate if this step has nested content (decomposition job or children)
            const hasNestedContent = effectiveExpandedId === step.id &&
              (decompositionJobs.has(step.id) || expandedStepChildren.has(step.id));

            return (
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
                effectiveExpandedId={effectiveExpandedId}
                totalDurationText={totalDurationText}
                loadingChildren={loadingChildren}
                hasNestedContent={hasNestedContent}
              />
            );
          })}
        </div>

        {/* Nested area for expanded step - show decomposition job or children */}
        {effectiveExpandedId && (decompositionJobs.has(effectiveExpandedId) || expandedStepChildren.has(effectiveExpandedId)) && (
          <div className="mt-2 px-2">
            {/* Show decomposition job steps while processing */}
            {decompositionJobs.has(effectiveExpandedId) ? (
              <AsyncJobTimeline
                jobName="Breaking down..."
                steps={decompositionJobs.get(effectiveExpandedId)!.steps}
                currentProgress={decompositionJobs.get(effectiveExpandedId)!.progress}
                size={size === 'full' ? 'micro' : 'nano'}
                showProgressBar={false}
              />
            ) : (
              /* Show children steps after decomposition complete - replaces the job */
              <AsyncJobTimeline
                jobName={`${steps.find(s => s.id === effectiveExpandedId)?.shortLabel || 'Step'} breakdown`}
                steps={expandedStepChildren.get(effectiveExpandedId)!}
                currentProgress={0}
                size={size === 'full' ? 'micro' : 'nano'}
                showProgressBar={false}
              />
            )}
          </div>
        )}

        {/* Total duration - bottom right (only in base state) */}
        {!effectiveExpandedId && (
          <div className="absolute bottom-0 right-0 text-[#586e75] text-[10px] font-medium">
            {totalDurationText}
          </div>
        )}

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

    </div>
  );
});

export default AsyncJobTimeline;
