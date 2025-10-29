'use client'

import React from 'react';

/**
 * ChevronButton - Stylized button with chevron/arrow shape
 *
 * Features:
 * - Chevron shape using CSS clip-path
 * - Positional variants for interlocking buttons (first, middle, last, single)
 * - Gradient background with inner highlight
 * - Focus state with glow effect
 * - Solarized color variants
 * - Micro size optimized for compact UIs
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
          background: 'linear-gradient(180deg, #4B91F7 0%, #367AF6 100%)',
          color: '#fff',
          boxShadow: '0px 0.5px 1.5px rgba(54, 122, 246, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2)',
          focusShadow: 'inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1.5px rgba(54, 122, 246, 0.25), 0px 0px 0px 3.5px rgba(58, 108, 217, 0.5)'
        };
      case 'success':
        return {
          background: 'linear-gradient(180deg, #95B045 0%, #859900 100%)', // Solarized green
          color: '#fdf6e3',
          boxShadow: '0px 0.5px 1.5px rgba(133, 153, 0, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2)',
          focusShadow: 'inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1.5px rgba(133, 153, 0, 0.25), 0px 0px 0px 3.5px rgba(133, 153, 0, 0.4)'
        };
      case 'error':
        return {
          background: 'linear-gradient(180deg, #E8424D 0%, #dc322f 100%)', // Solarized red
          color: '#fdf6e3',
          boxShadow: '0px 0.5px 1.5px rgba(220, 50, 47, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2)',
          focusShadow: 'inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1.5px rgba(220, 50, 47, 0.25), 0px 0px 0px 3.5px rgba(220, 50, 47, 0.4)'
        };
      case 'warning':
        return {
          background: 'linear-gradient(180deg, #C79F1A 0%, #b58900 100%)', // Solarized yellow
          color: '#fdf6e3',
          boxShadow: '0px 0.5px 1.5px rgba(181, 137, 0, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2)',
          focusShadow: 'inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1.5px rgba(181, 137, 0, 0.25), 0px 0px 0px 3.5px rgba(181, 137, 0, 0.4)'
        };
      case 'neutral':
        return {
          background: 'linear-gradient(180deg, #3C7CA7 0%, #268bd2 100%)', // Solarized blue
          color: '#fdf6e3',
          boxShadow: '0px 0.5px 1.5px rgba(38, 139, 210, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2)',
          focusShadow: 'inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2), 0px 0.5px 1.5px rgba(38, 139, 210, 0.25), 0px 0px 0px 3.5px rgba(38, 139, 210, 0.4)'
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
        transition: 'box-shadow 0.15s ease, transform 0.05s ease',
        position: 'relative',
        width: width || 'auto',
        minWidth: width ? width : undefined
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
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(1px)';
        }
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </button>
  );
};

export default ChevronButton;
