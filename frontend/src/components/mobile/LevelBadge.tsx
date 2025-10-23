/**
 * LevelBadge - Visual indicator for hierarchy level
 * Shows level emoji, name, and color-coded badge
 */

'use client';

import React from 'react';
import { getLevelConfig, type HierarchyLevel } from '@/lib/hierarchy-config';
import { spacing, fontSize, borderRadius } from '@/lib/design-system';

interface LevelBadgeProps {
  level: HierarchyLevel;
  showLabel?: boolean;
  showEmoji?: boolean;
  showDescription?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CONFIG = {
  xs: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: fontSize.xs,
    emojiSize: fontSize.xs,
  },
  sm: {
    padding: `${spacing[1]} ${spacing[2]}`,
    fontSize: fontSize.xs,
    emojiSize: fontSize.sm,
  },
  md: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: fontSize.sm,
    emojiSize: fontSize.base,
  },
  lg: {
    padding: `${spacing[3]} ${spacing[4]}`,
    fontSize: fontSize.base,
    emojiSize: fontSize.lg,
  },
};

/**
 * LevelBadge Component
 * Displays a color-coded badge for hierarchy levels
 */
export default function LevelBadge({
  level,
  showLabel = true,
  showEmoji = true,
  showDescription = false,
  size = 'sm',
  className = '',
}: LevelBadgeProps) {
  const config = getLevelConfig(level);
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-medium ${className}`}
      style={{
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}`,
        color: config.color,
      }}
    >
      {showEmoji && (
        <span style={{ fontSize: sizeConfig.emojiSize }}>{config.emoji}</span>
      )}
      {showLabel && <span>{config.label}</span>}
      {showDescription && (
        <span
          className="opacity-70"
          style={{ fontSize: fontSize.xs, marginLeft: spacing[1] }}
        >
          ({config.description})
        </span>
      )}
    </div>
  );
}

/**
 * Compact level indicator - just the emoji
 */
export function LevelEmoji({ level }: { level: HierarchyLevel }) {
  const config = getLevelConfig(level);
  return (
    <span
      style={{ color: config.color, fontSize: fontSize.lg }}
      title={`${config.label} - ${config.description}`}
    >
      {config.emoji}
    </span>
  );
}

/**
 * Level number badge - small circle with level number
 */
export function LevelNumber({
  level,
  className = '',
}: {
  level: HierarchyLevel;
  className?: string;
}) {
  const config = getLevelConfig(level);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-bold ${className}`}
      style={{
        width: spacing[5],
        height: spacing[5],
        fontSize: fontSize.xs,
        backgroundColor: config.color,
        color: '#fff',
      }}
      title={config.label}
    >
      {level}
    </div>
  );
}
