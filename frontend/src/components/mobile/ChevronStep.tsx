/**
 * ChevronStep - SVG-based chevron shape for AsyncJobTimeline
 *
 * Features:
 * - Clean SVG rendering with proper border support
 * - Position variants: first, middle, last, single
 * - Status variants: pending, active, done, error
 * - Size variants: full, micro, nano
 * - Smooth animations and hover states
 *
 * Benefits over clip-path:
 * - Crisp rendering across all browsers
 * - True stroke-based borders (no margin hacks)
 * - Better performance and maintainability
 */

'use client';

import React, { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ChevronPosition = 'first' | 'middle' | 'last' | 'single';
export type ChevronStatus = 'pending' | 'active' | 'done' | 'error';
export type ChevronSize = 'full' | 'micro' | 'nano';

export interface ChevronStepProps {
  // Visual state
  status: ChevronStatus;
  position: ChevronPosition;
  size: ChevronSize;

  // Content
  children?: ReactNode;

  // Colors (Solarized by default)
  fillColor?: string;
  strokeColor?: string;

  // Behavior
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  isExpanded?: boolean;

  // Dimensions
  width?: number | string;
  className?: string;
}

// ============================================================================
// Default Colors (Solarized)
// ============================================================================

const DEFAULT_COLORS = {
  pending: {
    fill: '#fdf6e3', // Solarized base3 (lightest)
    stroke: '#586e75', // Solarized base01
  },
  active: {
    fill: '#eee8d5', // Solarized base2 (light cream)
    stroke: '#268bd2', // Solarized blue
  },
  done: {
    fill: '#073642', // Solarized base02 (dark)
    stroke: '#859900', // Solarized green
  },
  error: {
    fill: '#dc322f', // Solarized red
    stroke: '#dc322f', // Solarized red
  },
};

// ============================================================================
// Size Configurations
// ============================================================================

const SIZE_CONFIG = {
  full: { height: 64, arrowDepth: 10, strokeWidth: 3 },
  micro: { height: 40, arrowDepth: 8, strokeWidth: 2 },
  nano: { height: 32, arrowDepth: 6, strokeWidth: 2 },
};

// ============================================================================
// SVG Path Generator
// ============================================================================

/**
 * Generate SVG path for chevron shape
 */
function getChevronPath(
  position: ChevronPosition,
  arrowDepth: number,
  height: number
): string {
  const halfHeight = height / 2;

  if (position === 'single') {
    // Rectangle - flat both sides
    return `M 0 0 L 100 0 L 100 ${height} L 0 ${height} Z`;
  }

  if (position === 'first') {
    // Flat left, chevron right
    return `
      M 0 0
      L ${100 - arrowDepth} 0
      L 100 ${halfHeight}
      L ${100 - arrowDepth} ${height}
      L 0 ${height}
      Z
    `;
  }

  if (position === 'last') {
    // Chevron left, flat right
    return `
      M ${arrowDepth} 0
      L 100 0
      L 100 ${height}
      L ${arrowDepth} ${height}
      L 0 ${halfHeight}
      Z
    `;
  }

  // Middle - chevron both sides
  return `
    M ${arrowDepth} 0
    L ${100 - arrowDepth} 0
    L 100 ${halfHeight}
    L ${100 - arrowDepth} ${height}
    L ${arrowDepth} ${height}
    L 0 ${halfHeight}
    Z
  `;
}

// ============================================================================
// Component
// ============================================================================

export default function ChevronStep({
  status,
  position,
  size,
  children,
  fillColor,
  strokeColor,
  onClick,
  onHover,
  isExpanded = false,
  width = '100%',
  className = '',
}: ChevronStepProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const config = SIZE_CONFIG[size];
  const colors = DEFAULT_COLORS[status];
  const finalFill = fillColor || colors.fill;
  const finalStroke = strokeColor || colors.stroke;

  const path = getChevronPath(position, config.arrowDepth, config.height);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  // Wrapper styles
  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: width,
    height: `${config.height}px`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s ease-out',
    flexShrink: isExpanded ? 0 : 1,
  };

  return (
    <div
      className={`chevron-step-wrapper ${className}`}
      style={wrapperStyle}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* SVG Chevron Shape */}
      <svg
        width="100%"
        height={config.height}
        viewBox={`0 0 100 ${config.height}`}
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {/* Main fill */}
        <path
          d={path}
          fill={finalFill}
          stroke={finalStroke}
          strokeWidth={config.strokeWidth}
          strokeLinejoin="miter"
          strokeLinecap="butt"
          style={{
            transition: 'all 0.3s ease-out',
            filter: isHovered ? 'brightness(0.95)' : 'none',
          }}
        />

        {/* Active state: pulsing glow overlay */}
        {status === 'active' && (
          <path
            d={path}
            fill="url(#activeGlow)"
            stroke="none"
            style={{
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />
        )}

        {/* Active state: shimmer effect */}
        {status === 'active' && (
          <defs>
            <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
              <stop offset="100%" stopColor="transparent" />
              <animate
                attributeName="x1"
                values="-100%;200%"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0%;300%"
                dur="2s"
                repeatCount="indefinite"
              />
            </linearGradient>
            <radialGradient id="activeGlow">
              <stop offset="0%" stopColor="rgba(38, 139, 210, 0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        )}

        {status === 'active' && (
          <path
            d={path}
            fill="url(#shimmer)"
            stroke="none"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </svg>

      {/* Content Layer */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: size === 'nano' ? '4px 8px' : size === 'micro' ? '6px 12px' : '8px 16px',
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Global CSS animations for pulsing */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Convenience Wrapper for Collapsed State
// ============================================================================

interface CollapsedChevronProps extends Omit<ChevronStepProps, 'children'> {
  stepNumber: number;
}

export function CollapsedChevron({
  stepNumber,
  status,
  position,
  size,
  ...props
}: CollapsedChevronProps) {
  const textColors = {
    pending: '#073642',
    active: '#268bd2',
    done: '#93a1a1',
    error: '#ffffff',
  };

  const fontSize = size === 'nano' ? '10px' : size === 'micro' ? '11px' : '13px';

  return (
    <ChevronStep status={status} position={position} size={size} {...props}>
      <span
        style={{
          fontSize,
          fontWeight: 'bold',
          color: textColors[status],
        }}
      >
        {stepNumber}
      </span>
    </ChevronStep>
  );
}
