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

// OpenMoji component for consistent emoji rendering
const OpenMoji = ({ emoji, size = 16, className = '', variant = 'black' }: {
  emoji: string;
  size?: number;
  className?: string;
  variant?: 'color' | 'black';
}) => {
  // Convert emoji to Unicode hex code point (handles multi-byte emojis)
  const getHexCode = (emoji: string) => {
    const codePoint = emoji.codePointAt(0);
    if (!codePoint) return '';
    // Pad to at least 4 digits, but allow more for emojis that need it
    const hex = codePoint.toString(16).toUpperCase();
    return hex.length < 4 ? hex.padStart(4, '0') : hex;
  };

  const hexCode = getHexCode(emoji);
  // Use OpenMoji CDN with black (line art) or color version
  const cdnUrl = `https://cdn.jsdelivr.net/npm/openmoji@15.0.0/${variant}/svg/${hexCode}.svg`;

  return (
    <img
      src={cdnUrl}
      alt={emoji}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block' }}
      onError={(e) => {
        // Fallback to showing the emoji text if SVG fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createTextNode(emoji);
        target.parentNode?.appendChild(fallback);
      }}
    />
  );
};

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
  // Text colors for Solarized backgrounds
  const textColors = {
    pending: 'text-[#073642]',      // Solarized base02 (darker, more visible on light)
    active: 'text-[#268bd2] font-semibold',  // Solarized blue (pops on cream)
    done: 'text-[#93a1a1]',         // Solarized base1 (light on dark)
    error: 'text-white font-semibold',
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

  // Wrapper controls sizing with flex; inner card stays content-focused
  const wrapperFlexClasses = !effectiveExpandedId
    ? 'flex-1 basis-0 min-w-0' // base: equal widths
    : isExpanded
      ? 'grow basis-0 min-w-0' // expanded: take remaining space
      : 'basis-[30px] w-[30px] shrink-0 grow-0 min-w-0'; // collapsed: 30px wide (25% reduction from 40px)

  // Chevron shape using clip-path (cleaner arrow design)
  const getChevronClipPath = () => {
    const isFirst = index === 0;
    const isLast = index === totalSteps - 1;
    const arrowDepth = 10; // Fixed depth - doesn't change with expansion

    if (isFirst && isLast) {
      // Single step: flat both sides (rectangle)
      return 'none';
    }

    if (isFirst) {
      // First step: flat left, chevron right
      return `polygon(0 0, calc(100% - ${arrowDepth}px) 0, 100% 50%, calc(100% - ${arrowDepth}px) 100%, 0 100%)`;
    }

    if (isLast) {
      // Last step: chevron left, flat right
      return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${arrowDepth}px 50%)`;
    }

    // Middle steps: chevron both sides
    return `polygon(0 0, calc(100% - ${arrowDepth}px) 0, 100% 50%, calc(100% - ${arrowDepth}px) 100%, 0 100%, ${arrowDepth}px 50%)`;
  };

  // Get margin for puzzle-fit effect (overlap chevrons with 4px gap)
  const getChevronMargin = () => {
    if (size !== 'full') return undefined;
    const arrowDepth = 10;
    const desiredGap = 4; // 4px visible gap between chevrons
    return index < totalSteps - 1 ? -(arrowDepth - desiredGap) : 0;
  };

  // Original Solarized colors (clean, no gradient progression)
  const getBackgroundColor = () => {
    if (step.status === 'done') {
      return 'bg-[#073642]'; // Solarized base02 (dark)
    }
    if (step.status === 'active') {
      return 'bg-[#eee8d5]'; // Solarized base2 (light cream)
    }
    if (step.status === 'error') {
      return 'bg-[#dc322f]'; // Solarized red
    }
    // Pending
    return 'bg-[#fdf6e3]'; // Solarized base3 (lightest)
  };

  // Get border color based on status for drop-shadow
  const getBorderColor = () => {
    return '#ffcc00'; // Bright yellow border for all states
  };

  return (
    <div
      className={`relative flex flex-col items-center overflow-visible ${wrapperFlexClasses}`}
      style={{ marginRight: size === 'full' && index !== totalSteps - 1 ? '-6px' : '0' }}
    >
      {/* Border layer (yellow) */}
      <div
        className={`
          absolute inset-0 w-full
          ${size === 'nano' ? 'h-8' : size === 'micro' ? 'h-9' : 'h-16'}
        `}
        style={{
          clipPath: size === 'full' ? getChevronClipPath() : undefined,
          backgroundColor: getBorderColor(),
        }}
      />

      {/* Content layer with background (inset by 2px for border) */}
      <div
        className={`
          relative w-full
          transition-all duration-300 ease-out
          cursor-pointer
          ${getBackgroundColor()}
          ${size === 'nano' ? 'h-8' : size === 'micro' ? 'h-9' : 'h-16'}
          ${size === 'nano' ? 'px-2' : size === 'micro' ? 'px-3' : 'px-4'}
          py-1
          flex flex-col items-center justify-center gap-1
          hover:brightness-95
        `}
        style={{
          clipPath: size === 'full' ? getChevronClipPath() : undefined,
          margin: size === 'full' ? '2px' : '0',
        }}
        onClick={onClick}
        title={size !== 'full' ? step.description : undefined}
      >
      {/* Nano size - just step number */}
      {size === 'nano' && (
        <span className={`text-[10px] font-medium ${textColors[step.status]}`}>
          {getLabel()}
        </span>
      )}

      {/* Micro size - show number ONLY when collapsed */}
      {size === 'micro' && (
        <>
          {effectiveExpandedId && !isExpanded ? (
            // Collapsed: show number
            <div className="flex items-center justify-center w-full h-full relative">
              <span
                className={`text-[11px] font-bold ${textColors[step.status]}`}
                style={{
                  position: 'relative',
                  // Adjust horizontal position based on chevron shape
                  left: index === 0 ? '-3px' : // First step: shift left (right side extends)
                        index === totalSteps - 1 ? '3px' : // Last step: shift right (left side indents)
                        '2px' // Middle steps: shift right to center in double-chevron shape
                }}
              >
                {index + 1}
              </span>
            </div>
          ) : (
            // Not collapsed: show icon + text
            <div className="flex flex-col items-center justify-center gap-1">
              {getStepIcon()}
              <span className={`text-[9px] font-medium text-center line-clamp-1 ${textColors[step.status]}`}>
                {getLabel()}
              </span>
            </div>
          )}
        </>
      )}

      {/* Full size - show number ONLY when collapsed */}
      {size === 'full' && (
        <>
          {effectiveExpandedId && !isExpanded ? (
            // Collapsed: show number
            <div className="flex items-center justify-center w-full h-full relative">
              <span
                className={`text-[11px] font-bold ${textColors[step.status]}`}
                style={{
                  position: 'relative',
                  // Adjust horizontal position based on chevron shape
                  left: index === 0 ? '-3px' : // First step: shift left (right side extends)
                        index === totalSteps - 1 ? '3px' : // Last step: shift right (left side indents)
                        '2px' // Middle steps: shift right to center in double-chevron shape
                }}
              >
                {index + 1}
              </span>
            </div>
          ) : tab ? (
            // Not collapsed + tab mode: icon + text inside
            <div className="flex flex-col items-center justify-center gap-1">
              {getStepIcon()}
              <span className={`text-[10px] font-medium text-center line-clamp-2 px-2 ${textColors[step.status]}`}>
                {getLabel()}
              </span>
            </div>
          ) : (
            // Not collapsed + non-tab mode: text only
            <div className="flex items-center justify-center w-full h-full">
              <span className={`text-[10px] font-medium text-center line-clamp-2 px-2 ${textColors[step.status]}`}>
                {getLabel()}
              </span>
            </div>
          )}

          {/* Icon floating on top border when NOT in tab mode and NOT collapsed */}
          {!tab && !(effectiveExpandedId && !isExpanded) && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 bg-[#002b36] rounded-full p-1 border-2 border-[#586e75]">
              {getStepIcon()}
            </div>
          )}
        </>
      )}



      {/* Cleaner pulsing glow for active steps */}
      {step.status === 'active' && (
        <>
          {/* Subtle pulsing glow */}
          <div
            className="absolute inset-0 bg-[#268bd2]/20 animate-pulse-glow pointer-events-none"
            style={{
              clipPath: size === 'full' ? getChevronClipPath() : undefined,
            }}
          />

          {/* Shimmer effect */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              clipPath: size === 'full' ? getChevronClipPath() : undefined,
            }}
          >
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
        bg-[#073642] border border-[#586e75] rounded overflow-visible
        ${size === 'nano' ? 'p-1' : size === 'micro' ? 'p-2' : 'p-2'}
        ${size === 'full' ? 'pt-8' : ''}
        ${className}
      `}
    >
      {/* Header - compact */}
      {size !== 'nano' && (
        <div className="relative flex items-center justify-center mb-0.5 -mt-6">
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
