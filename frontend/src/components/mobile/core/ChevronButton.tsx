'use client'

import React from 'react';
import { colors, hoverColors, createGradient, coloredShadow } from '@/lib/design-system';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ChevronButton - Stylized button with chevron/arrow shape
 *
 * Features:
 * - Chevron shape using CSS clip-path
 * - Positional variants for interlocking buttons (first, middle, last, single)
 * - Gradient background with inner highlight
 * - Focus state with glow effect
 * - Design system compliant colors
 * - Reduced motion support
 * - Touch-optimized interaction
 */

export type ChevronButtonVariant = 'primary' | 'success' | 'error' | 'warning' | 'neutral';
export type ChevronButtonPosition = 'first' | 'middle' | 'last' | 'single';

export interface ChevronButtonProps {
  variant?: ChevronButtonVariant;
  position?: ChevronButtonPosition;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
  width?: string; // Fixed width for alignment
}

const ChevronButton: React.FC<ChevronButtonProps> = ({
  variant = 'primary',
  position = 'first',
  onClick,
  disabled = false,
  ariaLabel,
  children,
  className = '',
  width
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getClipPath = (): string => {
    switch (position) {
      case 'first':
        // Straight left edge, chevron point on right
        return 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)';
      case 'middle':
        // Chevron indent on left (pointing IN), chevron point on right (pointing OUT)
        return 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%, 8px 50%)';
      case 'last':
        // Chevron indent on left (pointing IN), straight right edge
        return 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)';
      case 'single':
        // Straight on both sides (no chevron)
        return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
    }
  };

  const getPadding = () => {
    const hasLeftIndent = position === 'middle' || position === 'last';
    const hasRightPoint = position === 'first' || position === 'middle';

    return {
      paddingLeft: hasLeftIndent ? '18px' : '14px', // Extra 4px for indent
      paddingRight: hasRightPoint ? '18px' : '14px' // Extra 4px for point
    };
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: createGradient(colors.blue, hoverColors.blue),
          color: colors.base3,
          boxShadow: coloredShadow(colors.blue, '25'),
          focusShadow: `inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), ${coloredShadow(colors.blue, '25')}, 0px 0px 0px 3.5px ${colors.blue}80`
        };
      case 'success':
        return {
          background: createGradient(colors.green, hoverColors.green),
          color: colors.base3,
          boxShadow: coloredShadow(colors.green, '25'),
          focusShadow: `inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), ${coloredShadow(colors.green, '25')}, 0px 0px 0px 3.5px ${colors.green}66`
        };
      case 'error':
        return {
          background: createGradient(colors.red, hoverColors.red),
          color: colors.base3,
          boxShadow: coloredShadow(colors.red, '25'),
          focusShadow: `inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), ${coloredShadow(colors.red, '25')}, 0px 0px 0px 3.5px ${colors.red}66`
        };
      case 'warning':
        return {
          background: createGradient(colors.yellow, hoverColors.yellow),
          color: colors.base03,
          boxShadow: coloredShadow(colors.yellow, '25'),
          focusShadow: `inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), ${coloredShadow(colors.yellow, '25')}, 0px 0px 0px 3.5px ${colors.yellow}66`
        };
      case 'neutral':
        return {
          background: createGradient(colors.cyan, hoverColors.cyan),
          color: colors.base3,
          boxShadow: coloredShadow(colors.cyan, '25'),
          focusShadow: `inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), ${coloredShadow(colors.cyan, '25')}, 0px 0px 0px 3.5px ${colors.cyan}80`
        };
    }
  };

  const styles = getVariantStyles();
  const padding = getPadding();

  return (
    <button
      className={`chevron-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 14px',
        paddingLeft: padding.paddingLeft,
        paddingRight: padding.paddingRight,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Roboto", sans-serif',
        fontSize: '12px',
        fontWeight: 600,
        border: 'none',
        background: styles.background,
        color: styles.color,
        boxShadow: styles.boxShadow,
        clipPath: getClipPath(),
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
        opacity: disabled ? 0.5 : 1,
        transition: shouldReduceMotion ? 'none' : 'box-shadow 0.15s ease, transform 0.05s ease',
        position: 'relative',
        width: width || 'auto',
        minWidth: width ? width : undefined,
        transform: 'translateY(0)'
      }}
      onFocus={(e) => {
        if (!disabled) {
          e.currentTarget.style.boxShadow = styles.focusShadow;
          e.currentTarget.style.outline = '0';
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = styles.boxShadow;
      }}
      onMouseDown={(e) => {
        if (!disabled && !shouldReduceMotion) {
          e.currentTarget.style.transform = 'translateY(1px)';
        }
      }}
      onMouseUp={(e) => {
        if (!shouldReduceMotion) {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      onMouseLeave={(e) => {
        if (!shouldReduceMotion) {
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </button>
  );
};

export default ChevronButton;
