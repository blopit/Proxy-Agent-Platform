/**
 * ProgressBar - Reusable progress bar component
 *
 * Features:
 * - Gradient variant: Single smooth gradient bar (for active tasks)
 * - Segmented variant: Split bar showing digital vs human breakdown
 * - Consistent smooth animations across all uses
 * - Multiple size options
 * - Mobile-first responsive design
 * - Theme-aware using design system tokens
 * - Reduced motion support
 */

'use client';

import React from 'react';
import {
  spacing,
  semanticColors,
  colors,
  borderRadius,
  duration,
  createGradient,
  hoverColors
} from '@/lib/design-system';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface ProgressBarSegment {
  percentage: number;
  color: string;
  label: string;
}

export interface ProgressBarProps {
  progress?: number;              // 0-100 (for gradient variant)
  variant?: 'gradient' | 'segmented';
  segments?: ProgressBarSegment[]; // For segmented variant
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

// Size configuration using design system tokens
const SIZE_CONFIG = {
  sm: spacing[1],   // 4px height
  md: spacing[2],   // 8px height
  lg: spacing[3],   // 12px height
};

export default function ProgressBar({
  progress = 0,
  variant = 'gradient',
  segments = [],
  size = 'sm',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const isComplete = progress >= 100;
  const heightValue = SIZE_CONFIG[size];

  // Gradient variant - single smooth bar (mobile-friendly, full width)
  if (variant === 'gradient') {
    return (
      <div
        className={`w-full ${className}`}
        style={{
          height: heightValue,
          backgroundColor: semanticColors.bg.tertiary,
          borderRadius: borderRadius.pill,  // Fully rounded
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            borderRadius: borderRadius.pill,
            width: `${Math.min(progress, 100)}%`,
            background: isComplete
              ? colors.green  // Hunt mode color (success)
              : createGradient(colors.blue, colors.cyan),  // Scout → Capture gradient
            transition: shouldReduceMotion || !animated
              ? 'none'
              : `width ${duration.slow} ease-out`
          }}
        />
      </div>
    );
  }

  // Segmented variant - split by categories (e.g., digital/human)
  if (variant === 'segmented' && segments.length > 0) {
    return (
      <div
        className={`flex ${className}`}
        style={{
          gap: spacing[1],  // 4px gap between segments
          height: heightValue,
          borderRadius: borderRadius.pill,
          overflow: 'hidden'
        }}
      >
        {segments.map((segment, index) => (
          <div
            key={index}
            style={{
              width: `${segment.percentage}%`,
              backgroundColor: segment.color,
              borderRadius: index === 0 || index === segments.length - 1
                ? borderRadius.pill
                : '0',  // Round only first/last
              transition: shouldReduceMotion || !animated
                ? 'none'
                : `all ${duration.slow} ease-out`
            }}
            title={segment.label}
            role="progressbar"
            aria-label={segment.label}
            aria-valuenow={segment.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        ))}
      </div>
    );
  }

  // Fallback: empty bar
  return (
    <div
      className={`w-full ${className}`}
      style={{
        height: heightValue,
        backgroundColor: semanticColors.bg.tertiary,
        borderRadius: borderRadius.pill,
        overflow: 'hidden'
      }}
    />
  );
}
