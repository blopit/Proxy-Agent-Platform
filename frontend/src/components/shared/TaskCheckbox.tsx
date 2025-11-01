/**
 * TaskCheckbox - ADHD-friendly animated checkbox for micro-step completion
 *
 * Features:
 * - Smooth SVG checkmark animation (~0.4s)
 * - Strikethrough effect that shoots across label (~0.3s)
 * - Theme-aware using design system tokens (supports all 20+ themes)
 * - Size variants: full (24px), micro (18px), nano (14px)
 * - Optimized for dopamine hits on micro-step completion
 * - Accessible with keyboard support and ARIA labels
 * - Mobile-first with 44×44px touch targets
 * - Reduced motion support
 *
 * Animation sequence:
 * 1. Click checkbox → SVG checkmark draws (0-0.4s)
 * 2. Checkmark completes → strikethrough line shoots across label (0.4-0.7s)
 * 3. Label fades to muted color (0.7s)
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  semanticColors,
  colors,
  borderRadius,
  duration
} from '@/lib/design-system';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ============================================================================
// Types
// ============================================================================

export type TaskCheckboxSize = 'full' | 'micro' | 'nano';

export interface TaskCheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: TaskCheckboxSize;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

// ============================================================================
// Size Configurations - Using Design System Tokens
// ============================================================================

const SIZE_CONFIG = {
  full: {
    checkboxSize: 24,
    fontSize: fontSize.sm,        // 14px
    lineHeight: lineHeight.normal, // 1.5
    padding: spacing[2],          // 8px (mobile-friendly)
    strikeWidth: '2px',
    checkStroke: '2.5px',
    minTouchTarget: '44px'        // WCAG touch target
  },
  micro: {
    checkboxSize: 18,
    fontSize: fontSize.xs,        // 12px
    lineHeight: lineHeight.tight, // 1.2
    padding: spacing[1],          // 4px
    strikeWidth: '1.5px',
    checkStroke: '2px',
    minTouchTarget: '44px'        // WCAG touch target
  },
  nano: {
    checkboxSize: 14,
    fontSize: fontSize.xs,        // 12px
    lineHeight: lineHeight.tight, // 1.2
    padding: spacing[1],          // 4px
    strikeWidth: '1.5px',
    checkStroke: '1.5px',
    minTouchTarget: '44px'        // WCAG touch target
  },
};

// ============================================================================
// Component
// ============================================================================

export default function TaskCheckbox({
  id,
  label,
  checked = false,
  onChange,
  size = 'full',
  disabled = false,
  className = '',
  ariaLabel,
}: TaskCheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);
  const [showStrikethrough, setShowStrikethrough] = useState(checked);
  const shouldReduceMotion = useReducedMotion();

  const config = SIZE_CONFIG[size];
  const uniqueId = `task-checkbox-${id}`;
  const checkboxId = `checkbox-${uniqueId}`;
  const symbolId = `symbol-${uniqueId}`;

  // Sync with external checked state
  useEffect(() => {
    setIsChecked(checked);
    setShowStrikethrough(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;

    const newChecked = !isChecked;
    setIsChecked(newChecked);

    // Trigger strikethrough after checkmark animation completes (~0.4s)
    if (newChecked) {
      setTimeout(() => {
        setShowStrikethrough(true);
      }, 400);
    } else {
      setShowStrikethrough(false);
    }

    onChange?.(newChecked);
  };

  return (
    <div
      className={`task-checkbox-wrapper ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `${config.minTouchTarget} auto`,
        alignItems: 'center',
        gap: spacing[3],              // 12px
        padding: config.padding,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: config.minTouchTarget  // 44px touch target
      }}
    >
      {/* SVG Checkbox with checkmark animation - 44px touch target wrapper */}
      <div
        className="task-checkbox"
        style={{
          position: 'relative',
          width: config.minTouchTarget,
          height: config.minTouchTarget,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabel || label}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            position: 'absolute',
            width: `${config.checkboxSize}px`,
            height: `${config.checkboxSize}px`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: semanticColors.bg.primary,
            border: `${isChecked ? '2px' : '1px'} solid`,
            borderColor: isChecked
              ? colors.blue  // Scout mode color for completion
              : semanticColors.border.default,
            borderRadius: borderRadius.sm,  // 4px
            outline: 'none',
            margin: 0,
            padding: 0,
            transition: shouldReduceMotion ? 'none' : `all ${duration.fast}`,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isChecked) {
              e.currentTarget.style.borderColor = semanticColors.text.secondary;
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isChecked) {
              e.currentTarget.style.borderColor = semanticColors.border.default;
            }
          }}
        />

        {/* SVG Checkmark */}
        <svg
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${config.checkboxSize}px`,
            height: `${config.checkboxSize}px`,
            pointerEvents: 'none',
            fill: 'none',
            stroke: colors.blue,  // Scout mode color
            strokeDasharray: isChecked ? '16 93' : '93',
            strokeDashoffset: isChecked ? '109' : '94',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: config.checkStroke,
            transition: shouldReduceMotion
              ? 'none'
              : 'stroke-dasharray 0.4s, stroke-dashoffset 0.4s',
          }}
        >
          <use xlinkHref={`#${symbolId}`} />
        </svg>

        {/* Hidden SVG symbol definition */}
        <svg style={{ display: 'none' }}>
          <symbol id={symbolId} viewBox="0 0 22 22">
            <path d="M5.5,11.3L9,14.8L20.2,3.3l0,0c-0.5-1-1.5-1.8-2.7-1.8h-13c-1.7,0-3,1.3-3,3v13c0,1.7,1.3,3,3,3h13c1.7,0,3-1.3,3-3v-13c0-0.4-0.1-0.8-0.3-1.2" />
          </symbol>
        </svg>
      </div>

      {/* Label with strikethrough animation */}
      <label
        htmlFor={checkboxId}
        style={{
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: config.fontSize,
          lineHeight: config.lineHeight,
          fontWeight: fontWeight.regular,
          color: showStrikethrough
            ? semanticColors.text.muted
            : semanticColors.text.primary,
          transition: shouldReduceMotion ? 'none' : `color ${duration.normal}`,
          userSelect: 'none',
          minHeight: config.minTouchTarget,  // Align with touch target
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Strikethrough line (animates from left to right) */}
        <span
          style={{
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            height: config.strikeWidth,
            backgroundColor: semanticColors.text.muted,
            borderRadius: borderRadius.sm,  // 4px
            width: showStrikethrough ? '100%' : '0%',
            transition: shouldReduceMotion
              ? 'none'
              : `width ${duration.normal} ease 0.1s`,
            transform: 'translateY(-50%)',
          }}
        />

        {/* Label text */}
        <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
      </label>

      <style jsx>{`
        .task-checkbox input:focus {
          box-shadow: 0 0 0 2px ${colors.blue}4D;
        }

        .task-checkbox input:hover:not(:disabled) {
          border-width: 2px;
        }

        .task-checkbox input:checked {
          border-width: 2px;
        }
      `}</style>
    </div>
  );
}
