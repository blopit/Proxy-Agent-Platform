/**
 * ChevronStep - True chevron/arrow shape for AsyncJobTimeline
 *
 * Geometry: |------> >-------> >------|
 *           5-point  6-point   5-point
 *
 * Features:
 * - Unified chevron geometry using SINGLE SVG path per step
 *   • First: 5-point polygon (straight left |, CONVEX right point >)
 *   • Middle: 6-point polygon (CONCAVE INWARD left notch >, CONVEX right point >)
 *   • Last: 5-point polygon (CONCAVE INWARD left notch >, straight right |)
 *   • Single: 4-point rectangle
 * - CONSISTENT subtle chevron contour with fixed physical size
 *   • Tip width = height × 0.5 (fixed ratio, not angle-based)
 *   • Both left notches and right points use same tip width for symmetry
 *   • Chevron point size stays visually consistent regardless of width
 *   • When stretched wider, arrow keeps same subtle contour (doesn't get longer)
 * - Chevrons interlock perfectly - right > points fit snugly into left > notches
 * - Compacted design - seamless interlocking fit
 * - Supports first/middle/last/single variants
 * - Solarized palette with active pulse and hover overlays
 * - Scales responsively with container width via viewBox
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
  status: ChevronStatus;
  position: ChevronPosition;
  size: ChevronSize;
  children?: ReactNode;
  fillColor?: string;
  strokeColor?: string;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  isExpanded?: boolean;
  width?: number | string;
  className?: string;
  ariaLabel?: string;
}

// ============================================================================
// Default Colors (Solarized)
// ============================================================================

const DEFAULT_COLORS = {
  pending: {
    fill: '#fdf6e3',
    stroke: '#586e75',
  },
  active: {
    fill: '#eee8d5',
    stroke: '#268bd2',
  },
  done: {
    fill: '#073642',
    stroke: '#859900',
  },
  error: {
    fill: '#dc322f',
    stroke: '#dc322f',
  },
};

// ============================================================================
// Size Configurations
// ============================================================================

const SIZE_CONFIG = {
  full: { height: 64, borderWidth: 2 },
  micro: { height: 40, borderWidth: 1.5 },
  nano: { height: 32, borderWidth: 1 },
};

// Standardized chevron tip size - fixed subtle contour regardless of width
const CHEVRON_TIP_SIZE_RATIO = 0.5; // Tip width as ratio of height (e.g., 0.5 = tip is 50% of height)

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
  ariaLabel,
}: ChevronStepProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const config = SIZE_CONFIG[size];
  const colors = DEFAULT_COLORS[status];
  const finalFill = fillColor || colors.fill;
  const finalStroke = strokeColor || colors.stroke;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  // Calculate chevron geometry
  const h = config.height;
  const half = h / 2;

  // Fixed tip size for consistent subtle contour regardless of width
  // Tip size is proportional to height only, not width
  const tip = h * CHEVRON_TIP_SIZE_RATIO;

  // Use proportional viewBox width for natural scaling
  const w = h * 3; // 3:1 aspect ratio base

  // Single unified chevron path with proper point counts
  const getChevronPath = (pos: ChevronPosition): string => {
    if (pos === 'single') {
      // 4-point rectangle
      return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
    }

    if (pos === 'first') {
      // 5-point: straight left, CONVEX right point
      return `
        M 0,0
        L ${w - tip},0
        L ${w},${half}
        L ${w - tip},${h}
        L 0,${h}
        Z
      `;
    }

    if (pos === 'middle') {
      // 6-point: CONCAVE left notch (>) + CONVEX right point (>)
      return `
        M 0,0
        L ${w - tip},0
        L ${w},${half}
        L ${w - tip},${h}
        L 0,${h}
        L ${tip},${half}
        Z
      `;
    }

    // pos === 'last'
    // 5-point: CONCAVE left notch (>), straight right
    return `
      M 0,0
      L ${w},0
      L ${w},${h}
      L 0,${h}
      L ${tip},${half}
      Z
    `;
  };


  return (
    <div
      className={`chevron-step-wrapper ${className}`}
      style={{
        position: 'relative',
        width: width,
        height: `${h}px`,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: isExpanded ? 0 : 1,
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' as const : undefined}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* SVG chevron background */}
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        aria-hidden="true"
      >
        {/* Unified chevron shape - ONE path with concave/convex geometry! */}
        <path
          d={getChevronPath(position)}
          fill={finalFill}
        />

        {/* Stroke overlay */}
        <path
          d={getChevronPath(position)}
          fill="none"
          stroke={finalStroke}
          strokeWidth={config.borderWidth}
          vectorEffect="non-scaling-stroke"
        />

        {/* Active pulse overlay */}
        {status === 'active' && (
          <path
            d={getChevronPath(position)}
            fill="rgba(38, 139, 210, 0.18)"
            style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
          />
        )}

        {/* Hover sheen */}
        {isHovered && (
          <path
            d={getChevronPath(position)}
            fill="rgba(255,255,255,0.06)"
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

      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 0.85;
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
