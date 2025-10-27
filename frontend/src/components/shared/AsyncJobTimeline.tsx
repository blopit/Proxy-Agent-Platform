/**
 * AsyncJobTimeline - Universal progress visualization for async operations
 *
 * === 3 STATES SYSTEM ===
 *
 * 1. BASE STATE (effectiveExpandedId === null)
 *    - All steps equal width (flex: 1)
 *    - Shows EMOJI + TEXT LABEL together
 *    - Example: 🤖 Parse | ⚙️ Process | 📋 Review | 💾 Save
 *
 * 2. ACCORDION EXPANDED (effectiveExpandedId !== null && isExpanded)
 *    - One step takes most space (flex: 1)
 *    - Shows EMOJI + TEXT LABEL together
 *    - Example: ⚙️ Processing Data...
 *
 * 3. ACCORDION COLLAPSED (effectiveExpandedId !== null && !isExpanded)
 *    - Step is narrow (40px, flex: 0 0 40px)
 *    - Shows EMOJI ONLY
 *    - Example: 🤖 or ⚙️
 *
 * === EMOJI STYLING ===
 * - Pending/Next: Black & white OpenMoji (variant="black", embossed) - not started
 * - Done: Colorful OpenMoji (variant="color", embossed) - completed!
 * - Active: Blends between black & white and color OpenMoji - in progress
 *   • Musical timing: 4/4 time at 120 BPM (1 beat = 500ms)
 *   • Pattern: 1 beat blend to color, 3 beats stable, 1 beat blend to b&w, 3 beats stable (4s cycle)
 *   • Uses two overlapping images with opacity crossfade animation
 * - Error: Colorful OpenMoji (variant="color", embossed) - shows error state
 *
 * Features:
 * - Chevrons have -2px overlap for tight interlocking appearance
 * - Auto-expands active step (unless manually collapsed)
 * - Manual toggle for inspection
 * - HUMAN tasks: 2-5 min chunks
 * - DIGITAL tasks: unlimited/auto
 * - Three size variants: full, micro, nano
 * - Active progress overlay: Elegant shimmer gradient with white and subtle blue hints
 *
 * Usage:
 * <AsyncJobTimeline
 *   jobName="Send email to Sara"
 *   steps={microSteps}
 *   currentProgress={45}
 *   activeProgress={50}          // Optional: shows 50% filled overlay on active step
 *   activeProgressPulse={true}   // Optional: whether overlay pulses (default: true)
 *   size="full"
 * />
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, Loader2, AlertCircle, User, Bot, FileText } from 'lucide-react';
import ProgressBar from './ProgressBar';
import ChevronStep, { type ChevronPosition } from '@/components/mobile/ChevronStep';
import OpenMoji from './OpenMoji';

// ============================================================================
// Types
// ============================================================================

export type JobStepStatus = 'pending' | 'active' | 'done' | 'error' | 'next';
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
  activeProgress?: number;          // Progress overlay on active step (0-100), defaults to 0
  activeProgressPulse?: boolean;    // Whether active progress overlay should pulse, defaults to true
}

// ============================================================================
// Step Component
// ============================================================================

interface StepSectionProps {
  step: JobStep;
  index: number;
  totalSteps: number;
  isExpanded: boolean;
  size: TimelineSize;
  tab: boolean;
  onClick: () => void;
  stepProgressPercent?: number; // 0-100 for this specific step
  onRetry?: () => void;
  effectiveExpandedId: string | null;
  loadingChildren?: Set<string>; // For expand indicator
  hasNestedContent?: boolean; // True if showing decomposition job or children
  activeProgress?: number; // Progress overlay on active step (0-100)
  activeProgressPulse?: boolean; // Whether to pulse the overlay
}

function StepSection({ step, index, totalSteps, isExpanded, size, tab, onClick, stepProgressPercent, onRetry, effectiveExpandedId, loadingChildren, hasNestedContent, activeProgress, activeProgressPulse = true }: StepSectionProps) {
  // Text colors (Solarized theme)
  const textColors = {
    pending: '#586e75',      // Solarized base01 (gray)
    active: '#268bd2',       // Solarized blue
    done: '#859900',         // Solarized green
    error: '#dc322f',        // Solarized red
    next: '#cb4b16',         // Solarized orange
  };

  // Get emoji for the step
  const getEmoji = () => {
    if (step.icon) return step.icon;
    if (step.leafType === 'DIGITAL') return '🤖';
    if (step.leafType === 'HUMAN') return '👤';
    return '📋';
  };

  // Get text label for the step
  const getLabel = () => {
    const label = step.shortLabel || step.description;

    if (size === 'nano') {
      return label.length > 15 ? `${label.slice(0, 15)}...` : label;
    }

    if (size === 'micro') {
      return label.length > 18 ? `${label.slice(0, 18)}...` : label;
    }

    // Full size
    return label.length > 25 ? `${label.slice(0, 25)}...` : label;
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

  // === 3 STATES ===
  // Base State: effectiveExpandedId === null → all equal width, show EMOJI + LABEL
  // Accordion Expanded: effectiveExpandedId !== null && isExpanded → wide, show EMOJI + LABEL
  // Accordion Collapsed: effectiveExpandedId !== null && !isExpanded → 40px, show EMOJI ONLY

  const isBaseState = effectiveExpandedId === null;
  const isAccordionCollapsed = effectiveExpandedId !== null && !isExpanded;

  // Generate clip-path for progress overlay - flat right edge, clip left to match chevron
  const getProgressClipPath = (pos: ChevronPosition): string => {
    const arrow = '10px'; // Match ChevronStep's CHEVRON_ARROW_DEPTH_PX

    if (pos === 'single') {
      // Rectangle - no clipping
      return 'none';
    }

    if (pos === 'first') {
      // Straight left edge, FLAT right edge (not pointing)
      return `polygon(
        0 0,
        100% 0,
        100% 100%,
        0 100%
      )`;
    }

    if (pos === 'middle') {
      // CONCAVE left notch, FLAT right edge
      return `polygon(
        0 0,
        100% 0,
        100% 100%,
        0 100%,
        ${arrow} 50%
      )`;
    }

    // 'last' - CONCAVE left notch, FLAT right edge
    return `polygon(
      0 0,
      100% 0,
      100% 100%,
      0 100%,
      ${arrow} 50%
    )`;
  };

  // Calculate width based on state
  const getWidth = () => {
    if (isBaseState) return '100%';  // Equal width (flex: 1)
    if (isExpanded) return '100%';   // Expanded takes remaining space (flex: 1)
    return '40px';                   // Collapsed is fixed 40px
  };

  // Calculate flex based on state
  const getFlex = () => {
    if (isBaseState) return '1 1 0%';      // Base: all equal
    if (isExpanded) return '1 1 0%';       // Expanded: takes space
    return '0 0 40px';                     // Collapsed: fixed 40px
  };

  return (
    <div
      className="relative"
      style={{
        flex: getFlex(),
        minWidth: isBaseState || isExpanded ? 0 : '40px',
        maxWidth: isBaseState || isExpanded ? '100%' : '40px',
        overflow: 'visible',
        marginRight: index !== totalSteps - 1 ? '-2px' : '0',  // -2px overlap between chevrons
      }}
    >
      {/* Active progress overlay - clipped to chevron shape with flat right edge */}
      {step.status === 'active' && activeProgress !== undefined && activeProgress > 0 && (
        <div
          className={activeProgressPulse ? 'active-progress-overlay' : ''}
          style={{
            position: 'absolute',
            inset: 0,
            width: `${activeProgress}%`,
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.25), rgba(210, 240, 255, 0.35) 30%, rgba(255, 255, 255, 0.45) 50%, rgba(210, 240, 255, 0.35) 70%, rgba(255, 255, 255, 0.25))',
            backgroundSize: '200% 100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 10,
            clipPath: getProgressClipPath(getChevronPosition()),
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '16px',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'rgba(0, 0, 0, 0.6)',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.9), 0 -1px 0 rgba(0, 0, 0, 0.15)',
              letterSpacing: '0.5px',
            }}
          >
            {Math.round(activeProgress)}%
          </span>
        </div>
      )}

      {/* SVG Chevron Step */}
      <ChevronStep
        status={step.status}
        position={getChevronPosition()}
        size={size}
        onClick={onClick}
        isExpanded={isExpanded}
        width={getWidth()}
      >
        {/* Content based on 3 states */}
        {isAccordionCollapsed ? (
          // Accordion Collapsed: Show emoji only
          step.status === 'active' ? (
            // Active: Blend between black and color
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <div className="emoji-blend-black">
                <OpenMoji
                  emoji={getEmoji()}
                  size={size === 'nano' ? 18 : size === 'micro' ? 22 : 24}
                  variant="black"
                  embossed
                />
              </div>
              <div className="emoji-blend-color" style={{ position: 'absolute', inset: 0 }}>
                <OpenMoji
                  emoji={getEmoji()}
                  size={size === 'nano' ? 18 : size === 'micro' ? 22 : 24}
                  variant="color"
                  embossed
                />
              </div>
            </div>
          ) : (
            <OpenMoji
              emoji={getEmoji()}
              size={size === 'nano' ? 18 : size === 'micro' ? 22 : 24}
              variant={step.status === 'done' || step.status === 'error' ? 'color' : 'black'}
              embossed
            />
          )
        ) : (
          // Base State or Accordion Expanded: Show emoji + label
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: size === 'nano' ? '4px' : size === 'micro' ? '6px' : '8px',
              flexWrap: 'nowrap',
            }}
          >
            {step.status === 'active' ? (
              // Active: Blend between black and color
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div className="emoji-blend-black">
                  <OpenMoji
                    emoji={getEmoji()}
                    size={size === 'nano' ? 16 : size === 'micro' ? 18 : 20}
                    variant="black"
                    embossed
                  />
                </div>
                <div className="emoji-blend-color" style={{ position: 'absolute', inset: 0 }}>
                  <OpenMoji
                    emoji={getEmoji()}
                    size={size === 'nano' ? 16 : size === 'micro' ? 18 : 20}
                    variant="color"
                    embossed
                  />
                </div>
              </div>
            ) : (
              <OpenMoji
                emoji={getEmoji()}
                size={size === 'nano' ? 16 : size === 'micro' ? 18 : 20}
                variant={step.status === 'done' || step.status === 'error' ? 'color' : 'black'}
                embossed
              />
            )}
            <span
              style={{
                fontSize: size === 'nano' ? '10px' : size === 'micro' ? '11px' : '12px',
                fontWeight: step.status === 'active' || step.status === 'next' ? 600 : 500,
                color: textColors[step.status],
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {getLabel()}
            </span>
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
                  backgroundColor: '#dc322f',  // Solarized red
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
              backgroundColor: 'rgba(147, 161, 161, 0.3)',  // Solarized base1 with opacity
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#268bd2',  // Solarized blue
                width: `${stepProgressPercent}%`,
                transition: 'width 0.3s ease-out',
              }}
            />
          </div>
        )}
      </ChevronStep>
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
  activeProgress = 0,
  activeProgressPulse = true,
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

  const isComplete = currentProgress >= 100;
  const allDone = steps.every(s => s.status === 'done');

  return (
    <div
      className={`
        border rounded overflow-visible
        ${size === 'nano' ? 'p-1' : size === 'micro' ? 'p-2' : 'p-2'}
        ${size === 'full' ? 'pt-12' : size === 'micro' ? 'pt-10' : ''}
        ${className}
      `}
      style={{
        backgroundColor: '#fdf6e3',  // Solarized base3 (light cream)
        borderColor: '#eee8d5',      // Solarized base2 (slightly darker cream)
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header - compact */}
      {size !== 'nano' && (
        <div className={`relative flex items-center justify-center mb-0.5 ${size === 'micro' ? '-mt-8' : '-mt-10'}`}>
          <p
            className={`line-clamp-1 w-full text-center mb-2 ${size === 'micro' ? 'text-[9px]' : 'text-[10px]'} font-medium ${effectiveExpandedId ? 'opacity-0' : ''}`}
            style={{ color: '#586e75' }}  // Solarized base01
          >
            {jobName}
          </p>
          {(onClose || onDismiss) && (
            <button
              onClick={onDismiss || onClose}
              className="absolute right-0 transition-colors flex-shrink-0"
              style={{ color: '#93a1a1' }}  // Solarized base1
              onMouseEnter={(e) => e.currentTarget.style.color = '#586e75'}  // Solarized base01
              onMouseLeave={(e) => e.currentTarget.style.color = '#93a1a1'}  // Solarized base1
              aria-label={onDismiss ? "Dismiss" : "Close"}
            >
              <X size={size === 'micro' ? 10 : 12} />
            </button>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="relative overflow-visible">
        {/* Steps row - chevrons overlap with -8px margins for tighter fit */}
        <div className="flex items-end overflow-visible" style={{ gap: 0 }}>
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
                isExpanded={effectiveExpandedId === step.id}
                size={size}
                tab={tab}
                onClick={() => handleStepClick(step.id)}
                stepProgressPercent={stepProgress?.get(step.id)}
                onRetry={onRetryStep ? () => onRetryStep(step.id) : undefined}
                effectiveExpandedId={effectiveExpandedId}
                loadingChildren={loadingChildren}
                hasNestedContent={hasNestedContent}
                activeProgress={step.status === 'active' ? activeProgress : undefined}
                activeProgressPulse={activeProgressPulse}
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
                  color: '#2aa198',  // Solarized cyan (for digital/automated)
                  label: `${steps.filter(s => s.leafType === 'DIGITAL').length} digital steps`,
                },
                {
                  percentage: (steps.filter(s => s.leafType === 'HUMAN').length / steps.length) * 100,
                  color: '#6c71c4',  // Solarized violet (for human)
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

      {/* CSS animations for emoji blending (musical timing: 4/4 time at 120 BPM) */}
      <style jsx>{`
        @keyframes emoji-show-color {
          0% {
            opacity: 0;
          }
          12.5% {
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          62.5% {
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes emoji-show-black {
          0% {
            opacity: 1;
          }
          12.5% {
            opacity: 0;
          }
          50% {
            opacity: 0;
          }
          62.5% {
            opacity: 1;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes shimmer-sweep {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        :global(.emoji-blend-black) {
          animation: emoji-show-black 4s ease-in-out infinite;
        }

        :global(.emoji-blend-color) {
          animation: emoji-show-color 4s ease-in-out infinite;
        }

        :global(.active-progress-overlay) {
          animation: shimmer-sweep 3s linear infinite;
        }
      `}</style>
    </div>
  );
});

export default AsyncJobTimeline;
