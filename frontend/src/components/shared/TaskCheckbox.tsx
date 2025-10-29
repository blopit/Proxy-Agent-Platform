/**
 * TaskCheckbox - ADHD-friendly animated checkbox for micro-step completion
 *
 * Features:
 * - Smooth SVG checkmark animation (~0.4s)
 * - Strikethrough effect that shoots across label (~0.3s)
 * - Theme-aware using CSS variables (supports Storybook theme switching)
 * - Size variants: full (24px), micro (18px), nano (14px)
 * - Optimized for dopamine hits on micro-step completion
 * - Accessible with keyboard support and ARIA labels
 *
 * Animation sequence:
 * 1. Click checkbox → SVG checkmark draws (0-0.4s)
 * 2. Checkmark completes → strikethrough line shoots across label (0.4-0.7s)
 * 3. Label fades to muted color (0.7s)
 */

'use client';

import React, { useState, useEffect } from 'react';

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
// Size Configurations (matches ChevronStep pattern)
// ============================================================================

const SIZE_CONFIG = {
  full: {
    checkboxSize: 24,
    fontSize: '14px',
    lineHeight: '20px',
    padding: '6px',
    strikeWidth: '2px',
    checkStroke: '2.5px',
  },
  micro: {
    checkboxSize: 18,
    fontSize: '12px',
    lineHeight: '16px',
    padding: '4px',
    strikeWidth: '1.5px',
    checkStroke: '2px',
  },
  nano: {
    checkboxSize: 14,
    fontSize: '10px',
    lineHeight: '14px',
    padding: '3px',
    strikeWidth: '1.5px',
    checkStroke: '1.5px',
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
        gridTemplateColumns: `${config.checkboxSize}px auto`,
        alignItems: 'center',
        gap: '12px',
        padding: config.padding,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {/* SVG Checkbox with checkmark animation */}
      <div
        className="task-checkbox"
        style={{
          position: 'relative',
          width: `${config.checkboxSize}px`,
          height: `${config.checkboxSize}px`,
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
            width: '100%',
            height: '100%',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: 'var(--background, #ffffff)',
            border: `${isChecked ? '2px' : '1px'} solid`,
            borderColor: isChecked
              ? 'var(--primary, #268bd2)'
              : 'var(--border, #d1d6ee)',
            borderRadius: '4px',
            outline: 'none',
            margin: 0,
            padding: 0,
            transition: 'all 0.2s linear',
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isChecked) {
              e.currentTarget.style.borderColor = 'var(--muted-foreground, #bbc1e1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isChecked) {
              e.currentTarget.style.borderColor = 'var(--border, #d1d6ee)';
            }
          }}
        />

        {/* SVG Checkmark */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            fill: 'none',
            stroke: 'var(--primary, #268bd2)',
            strokeDasharray: isChecked ? '16 93' : '93',
            strokeDashoffset: isChecked ? '109' : '94',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: config.checkStroke,
            transition: 'stroke-dasharray 0.4s, stroke-dashoffset 0.4s',
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
          color: showStrikethrough
            ? 'var(--muted-foreground, #93a1a1)'
            : 'var(--foreground, #073642)',
          transition: 'color 0.3s ease',
          userSelect: 'none',
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
            backgroundColor: 'var(--muted-foreground, #93a1a1)',
            borderRadius: '2px',
            width: showStrikethrough ? '100%' : '0%',
            transition: 'width 0.3s ease 0.1s',
            transform: 'translateY(-50%)',
          }}
        />

        {/* Label text */}
        <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
      </label>

      <style jsx>{`
        .task-checkbox input:focus {
          box-shadow: 0 0 0 2px var(--ring, rgba(38, 139, 210, 0.3));
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
