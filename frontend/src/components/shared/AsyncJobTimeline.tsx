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
import { X, CheckCircle2, Circle, Loader2, AlertCircle, User, Bot, FileText } from 'lucide-react';
import ProgressBar from './ProgressBar';
import ChevronStep from '@/components/mobile/ChevronStep';
import OpenMoji from './OpenMoji';

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
  tab?: boolean;                    // Default: true. When false, icon floats on top border
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
  totalSteps: number;
  width: number;
  isExpanded: boolean;
  size: TimelineSize;
  tab: boolean;
  onClick: () => void;
  stepProgressPercent?: number; // 0-100 for this specific step
  onRetry?: () => void;
  effectiveExpandedId: string | null;
  totalDurationText: string;
  loadingChildren?: Set<string>; // For expand indicator
  hasNestedContent?: boolean; // True if showing decomposition job or children
}

function StepSection({ step, index, totalSteps, width, isExpanded, size, tab, onClick, stepProgressPercent, onRetry, effectiveExpandedId, totalDurationText, loadingChildren, hasNestedContent }: StepSectionProps) {
  // Text colors for modern white backgrounds
  const textColors = {
    pending: '#6b7280',      // Gray 500
    active: '#3b82f6',       // Blue 500
    done: '#22c55e',         // Green 500
    error: '#ef4444',        // Red 500
  };

  const getStepIcon = () => {
    const iconSize = isExpanded ? 32 : 24;

    // Determine which emoji to show
    const getEmoji = () => {
      // Priority: custom icon > leaf type > default
      if (step.icon) return step.icon;
      if (step.leafType === 'DIGITAL') return '🤖';
      if (step.leafType === 'HUMAN') return '👤';
      return '📋'; // Default
    };

    return (
      <OpenMoji
        emoji={getEmoji()}
        size={iconSize}
        variant="color"
      />
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

  // Determine chevron position
  const getChevronPosition = () => {
    const isFirst = index === 0;
    const isLast = index === totalSteps - 1;

    if (isFirst && isLast) return 'single';
    if (isFirst) return 'first';
    if (isLast) return 'last';
    return 'middle';
  };

  // Wrapper controls sizing with flex
  const wrapperFlexClasses = !effectiveExpandedId
    ? 'flex-1 basis-0 min-w-0' // base: equal widths
    : isExpanded
      ? 'grow basis-0 min-w-0' // expanded: take remaining space
      : 'basis-[40px] w-[40px] shrink-0 grow-0 min-w-0'; // collapsed: 40px wide

  return (
    <div
      className={`relative flex flex-col items-center overflow-visible ${wrapperFlexClasses}`}
      style={{ marginRight: index !== totalSteps - 1 ? '-4px' : '0' }}
    >
      {/* SVG Chevron Step */}
      <ChevronStep
        status={step.status}
        position={getChevronPosition()}
        size={size}
        onClick={onClick}
        isExpanded={isExpanded}
        width="100%"
      >
        {/* Content inside chevron */}
        {size === 'nano' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            {step.status === 'active' ? (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: textColors[step.status],
                  lineHeight: 1,
                }}
              >
                {getLabel()}
              </span>
            ) : step.icon ? (
              <OpenMoji
                emoji={step.icon}
                size={16}
                variant="black"
              />
            ) : (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  color: textColors[step.status],
                  lineHeight: 1,
                }}
              >
                {getLabel()}
              </span>
            )}
          </div>
        )}

        {/* Micro size - icon inside when collapsed */}
        {size === 'micro' && effectiveExpandedId && !isExpanded && step.icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              marginLeft: getChevronPosition() === 'middle' ? '4px' : '0',
            }}
          >
            <OpenMoji
              emoji={step.icon}
              size={18}
              variant="black"
            />
          </div>
        )}

        {/* Full size - icon inside when collapsed */}
        {size === 'full' && effectiveExpandedId && !isExpanded && step.icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              marginLeft: getChevronPosition() === 'middle' ? '4px' : '0',
            }}
          >
            <OpenMoji
              emoji={step.icon}
              size={24}
              variant="black"
            />
          </div>
        )}

        {/* Error state overlay with retry button */}
        {step.status === 'error' && onRetry && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ fontSize: '18px', animation: 'bounce 1s infinite' }}>⚠️</span>
            {(size === 'full' || size === 'micro') && (
              <button
                style={{
                  fontSize: '9px',
                  padding: '2px 8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
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

        {/* Mini progress indicator for active steps */}
        {step.status === 'active' && stepProgressPercent !== undefined && stepProgressPercent > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: 'rgba(209, 213, 219, 0.5)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                width: `${stepProgressPercent}%`,
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
        )}
      </ChevronStep>

      {/* Icon + title floating above when NOT collapsed (micro and full sizes) */}
      {(size === 'micro' || size === 'full') && !(effectiveExpandedId && !isExpanded) && (
        <div
          style={{
            position: 'absolute',
            top: size === 'full' ? '-22px' : '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: size === 'full' ? '2px' : '1px',
          }}
        >
          {getStepIcon()}
          <span
            style={{
              fontSize: size === 'full' ? '10px' : '8px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              color: textColors[step.status],
              lineHeight: 1.2,
            }}
          >
            {getLabel()}
          </span>
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
  tab = true,
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
  const [forceCollapsed, setForceCollapsed] = useState(false); // Track if user manually collapsed active step

  // State for hierarchical children
  const [expandedStepChildren, setExpandedStepChildren] = useState<Map<string, JobStep[]>>(new Map());
  const [loadingChildren, setLoadingChildren] = useState<Set<string>>(new Set());

  // State for decomposition jobs
  const [decompositionJobs, setDecompositionJobs] = useState<Map<string, {
    steps: JobStep[];
    progress: number;
  }>>(new Map());

  // Auto-expand active step (unless user has manually expanded something or force collapsed)
  useEffect(() => {
    if (!manualExpandId && !forceCollapsed) {
      const activeStep = steps.find(s => s.status === 'active');
      setExpandedStepId(activeStep?.id || null);
    } else if (forceCollapsed) {
      // If force collapsed, don't auto-expand
      setExpandedStepId(null);
    }
  }, [steps, manualExpandId, forceCollapsed]);

  const handleStepClick = async (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    const effectiveExpanded = manualExpandId || expandedStepId;
    const currentlyExpanded = effectiveExpanded === stepId;
    const isActiveStep = step?.status === 'active';

    // If clicking on currently expanded step (including active step), collapse it
    if (currentlyExpanded) {
      if (isActiveStep && !manualExpandId) {
        // Active step auto-expanded - force collapse it
        setForceCollapsed(true);
      } else if (manualExpandId === stepId) {
        // Manually expanded - collapse it
        setManualExpandId(null);
        setForceCollapsed(false); // Reset force collapsed when manually toggling
      }
      onStepClick?.(stepId);
      return; // Don't proceed to expansion logic
    }

    // Reset force collapsed when expanding a different step
    setForceCollapsed(false);

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

    // Expand this step (collapse is handled at the beginning of the function)
    setManualExpandId(stepId);

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
        bg-gray-50 border border-gray-200 rounded overflow-visible
        ${size === 'nano' ? 'p-1' : size === 'micro' ? 'p-2' : 'p-2'}
        ${size === 'full' ? 'pt-12' : size === 'micro' ? 'pt-10' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header - compact */}
      {size !== 'nano' && (
        <div className={`relative flex items-center justify-center mb-0.5 ${size === 'micro' ? '-mt-8' : '-mt-10'}`}>
          <p className={`line-clamp-1 w-full text-center mb-2 ${size === 'micro' ? 'text-[9px]' : 'text-[10px]'} text-gray-600 font-medium ${effectiveExpandedId ? 'opacity-0' : ''}`}>
            {jobName}
          </p>
          {(onClose || onDismiss) && (
            <button
              onClick={onDismiss || onClose}
              className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label={onDismiss ? "Dismiss" : "Close"}
            >
              <X size={size === 'micro' ? 10 : 12} />
            </button>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative overflow-visible">
        {/* Steps row */}
        <div className="flex gap-0 items-end overflow-visible">
          {steps.map((step, index) => {
            // Calculate if this step has nested content (decomposition job or children)
            const hasNestedContent = effectiveExpandedId === step.id &&
              (decompositionJobs.has(step.id) || expandedStepChildren.has(step.id));

            return (
              <StepSection
                key={step.id}
                step={step}
                index={index}
                totalSteps={steps.length}
                width={stepWidths.get(step.id) || 0}
                isExpanded={effectiveExpandedId === step.id}
                size={size}
                tab={tab}
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
          <div className="mt-2 px-2 overflow-visible">
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

        {/* Progress bar */}
        {showProgressBar && (
          isComplete ? (
            // Completed tasks: Show segmented bar (digital vs human breakdown)
            <ProgressBar
              variant="segmented"
              segments={[
                {
                  percentage: (steps.filter(s => s.leafType === 'DIGITAL').length / steps.length) * 100,
                  color: '#10b981',
                  label: `${steps.filter(s => s.leafType === 'DIGITAL').length} digital steps`,
                },
                {
                  percentage: (steps.filter(s => s.leafType === 'HUMAN').length / steps.length) * 100,
                  color: '#3b82f6',
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
