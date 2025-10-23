/**
 * CaptureLoading - Progressive loading animation for task capture
 *
 * Shows different messages as processing progresses:
 * - Analyzing: Initial AI processing
 * - Breaking down: Creating micro-steps
 * - Almost done: Final touches
 */

'use client'

import React from 'react';
import { spacing, fontSize, semanticColors } from '@/lib/design-system';
import type { LoadingStage } from '@/types/capture';

interface CaptureLoadingProps {
  stage: LoadingStage;
}

const stageConfig = {
  analyzing: {
    emoji: '🤖',
    message: 'Analyzing your task...',
    color: semanticColors.accent.primary, // cyan
  },
  breaking_down: {
    emoji: '✂️',
    message: 'Breaking into micro-steps...',
    color: semanticColors.accent.secondary, // blue
  },
  almost_done: {
    emoji: '🎯',
    message: 'Almost done...',
    color: semanticColors.accent.success, // green
  },
};

export default function CaptureLoading({ stage }: CaptureLoadingProps) {
  const config = stageConfig[stage];

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        padding: spacing[6],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: '8px',
        marginBottom: spacing[4],
      }}
    >
      {/* Animated emoji with pulse */}
      <div
        className="animate-pulse"
        style={{
          fontSize: '48px',
          marginBottom: spacing[3],
        }}
      >
        {config.emoji}
      </div>

      {/* Message */}
      <div
        style={{
          fontSize: fontSize.lg,
          color: semanticColors.text.primary,
          fontWeight: 600,
          marginBottom: spacing[2],
        }}
      >
        {config.message}
      </div>

      {/* Animated dots */}
      <div className="flex" style={{ gap: spacing[1] }}>
        <Dot delay={0} color={config.color} />
        <Dot delay={200} color={config.color} />
        <Dot delay={400} color={config.color} />
      </div>
    </div>
  );
}

// Animated dot component
function Dot({ delay, color }: { delay: number; color: string }) {
  return (
    <div
      className="animate-bounce"
      style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: color,
        animationDelay: `${delay}ms`,
        animationDuration: '1000ms',
      }}
    />
  );
}
