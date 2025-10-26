/**
 * ChevronStep - True chevron/arrow shape for AsyncJobTimeline
 *
 * Geometry: |------> >-------> >------|
 *           5-point  6-point   5-point
 *
 * Features:
 * - CSS clip-path approach for pixel-perfect consistent chevron contour
 *   • First: 5-point polygon (straight left |, CONVEX right point >)
 *   • Middle: 6-point polygon (CONCAVE INWARD left notch >, CONVEX right point >)
 *   • Last: 5-point polygon (CONCAVE INWARD left notch >, straight right |)
 *   • Single: 4-point rectangle (no clipping)
 * - FIXED 12px arrow depth that stays consistent across all widths
 *   • Uses CSS calc() with fixed pixel value (12px) for subtle contour
 *   • Arrow size remains constant whether narrow, base, or expanded width
 *   • No SVG viewBox distortion issues
 * - Chevrons interlock perfectly - right > points fit snugly into left > notches
 * - Background color and border applied directly to div (no SVG needed)
 * - Supports first/middle/last/single variants
 * - Solarized palette with active pulse and hover overlays
 * - Performs better than SVG approach (native CSS rendering)
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

// Standardized chevron arrow depth - fixed pixel value for consistent contour
const CHEVRON_ARROW_DEPTH_PX = 10; // Fixed 10px arrow depth for subtle contour

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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(200);

  const config = SIZE_CONFIG[size];
  const colors = DEFAULT_COLORS[status];
  const finalFill = fillColor || colors.fill;
  const finalStroke = strokeColor || colors.stroke;

  // Measure actual rendered width immediately on mount and when expansion changes
  React.useLayoutEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [isExpanded, width]);

  // Track width changes
  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [isExpanded, width]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };

  // Generate CSS clip-path polygon based on position
  const getClipPath = (pos: ChevronPosition): string => {
    const arrow = `${CHEVRON_ARROW_DEPTH_PX}px`;

    if (pos === 'single') {
      // 4-point rectangle - no clipping
      return 'none';
    }

    if (pos === 'first') {
      // 5-point: straight left, CONVEX right point
      return `polygon(
        0 0,
        calc(100% - ${arrow}) 0,
        100% 50%,
        calc(100% - ${arrow}) 100%,
        0 100%
      )`;
    }

    if (pos === 'middle') {
      // 6-point: CONCAVE left notch + CONVEX right point
      return `polygon(
        0 0,
        calc(100% - ${arrow}) 0,
        100% 50%,
        calc(100% - ${arrow}) 100%,
        0 100%,
        ${arrow} 50%
      )`;
    }

    // pos === 'last'
    // 5-point: CONCAVE left notch, straight right
    return `polygon(
      0 0,
      100% 0,
      100% 100%,
      0 100%,
      ${arrow} 50%
    )`;
  };

  // Generate SVG path for border stroke
  const getSVGPath = (pos: ChevronPosition, width: number, height: number, expanded: boolean): string => {
    const arrow = CHEVRON_ARROW_DEPTH_PX;
    const h = height;
    const w = width;
    const half = h / 2;

    // Pull all three right edge points in for collapsed chevrons
    const rightEdgeAdjust = expanded ? 0 : 4;

    if (pos === 'single') {
      return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
    }

    if (pos === 'first') {
      // Move all three right points: top right, tip, bottom right
      return `M 0,0 L ${w - arrow - rightEdgeAdjust},0 L ${w - rightEdgeAdjust},${half} L ${w - arrow - rightEdgeAdjust},${h} L 0,${h} Z`;
    }

    if (pos === 'middle') {
      // Move all three right points: top right, tip, bottom right
      return `M 0,0 L ${w - arrow - rightEdgeAdjust},0 L ${w - rightEdgeAdjust},${half} L ${w - arrow - rightEdgeAdjust},${h} L 0,${h} L ${arrow},${half} Z`;
    }

    // last
    return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} L ${arrow},${half} Z`;
  };


  const h = config.height;

  return (
    <div
      ref={containerRef}
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
      {/* SVG Border Stroke */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
        viewBox={`0 0 ${containerWidth} ${h}`}
        preserveAspectRatio="xMinYMin slice"
      >
        <path
          d={getSVGPath(position, containerWidth, h, isExpanded)}
          fill="none"
          stroke="red"
          strokeWidth={config.borderWidth}
        />
      </svg>

      {/* Background with clip-path */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: finalFill,
          clipPath: getClipPath(position),
          transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Active pulse overlay */}
      {status === 'active' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(38, 139, 210, 0.18)',
            clipPath: getClipPath(position),
            animation: 'pulse-glow 2s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Hover sheen */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.06)',
            clipPath: getClipPath(position),
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content Layer */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: size === 'nano' ? '4px 16px' : size === 'micro' ? '6px 20px' : '8px 24px',
          paddingLeft: position === 'middle' || position === 'last' ? `${CHEVRON_ARROW_DEPTH_PX + 12}px` : undefined,
          paddingRight: position === 'first' || position === 'middle' ? `${CHEVRON_ARROW_DEPTH_PX + 12}px` : undefined,
          fontSize: size === 'nano' ? '18px' : size === 'micro' ? '22px' : '26px',
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
