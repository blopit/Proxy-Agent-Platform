/**
 * ProgressBar - Reusable progress bar component
 *
 * Features:
 * - Gradient variant: Single smooth gradient bar (for active tasks)
 * - Segmented variant: Split bar showing digital vs human breakdown
 * - Consistent smooth animations across all uses
 * - Multiple size options
 */

'use client';

import React from 'react';

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

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export default function ProgressBar({
  progress = 0,
  variant = 'gradient',
  segments = [],
  size = 'sm',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const isComplete = progress >= 100;

  // Gradient variant - single smooth bar
  if (variant === 'gradient') {
    return (
      <div className={`w-full ${sizeClasses[size]} bg-[#002b36] rounded-full overflow-hidden ${className}`}>
        <div
          className={`h-full rounded-full ${
            animated ? 'transition-all duration-500 ease-out' : ''
          } ${
            isComplete
              ? 'bg-[#859900]'
              : 'bg-gradient-to-r from-[#268bd2] to-[#2aa198]'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    );
  }

  // Segmented variant - split by categories (e.g., digital/human)
  if (variant === 'segmented' && segments.length > 0) {
    return (
      <div className={`flex gap-1 ${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${animated ? 'transition-all duration-500 ease-out' : ''}`}
            style={{
              width: `${segment.percentage}%`,
              backgroundColor: segment.color,
            }}
            title={segment.label}
          />
        ))}
      </div>
    );
  }

  // Fallback: empty bar
  return (
    <div className={`w-full ${sizeClasses[size]} bg-[#002b36] rounded-full overflow-hidden ${className}`} />
  );
}
