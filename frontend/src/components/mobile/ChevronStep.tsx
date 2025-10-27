/**
 * ChevronStep - True chevron/arrow shape for AsyncJobTimeline
 *
 * Geometry: |------> >-------> >------|
 *           5-point  6-point   5-point
 *
 * Features:
 * - Pure SVG approach for reliable shadows and borders
 *   • First: 5-point polygon (straight left |, CONVEX right point >)
 *   • Middle: 6-point polygon (CONCAVE INWARD left notch >, CONVEX right point >)
 *   • Last: 5-point polygon (CONCAVE INWARD left notch >, straight right |)
 *   • Single: 4-point rectangle
 * - FIXED 10px arrow depth that stays consistent across all widths
 *   • Arrow size remains constant whether narrow, base, or expanded width
 *   • No viewBox distortion issues
 * - Chevrons interlock perfectly with -4px overlap for visual rhythm
 * - Sharp raised bevel gradient: pronounced 3D effect with tight transitions
 *   • Vertical gradient: light top (35% lighter) → sharp transition at 30% → base middle → sharp transition at 70% → dark bottom (20% darker)
 *   • Glossy overlay: 45% white at top, sharp fade by 25%, gone by 50%
 *   • White inset ring: 1px white stroke inside (10% opacity, mimics box-shadow inset)
 *   • Tip brightness: concentrated at right edge - 75% threshold, 30% opacity for "future" direction
 * - Subtle 1-2px shimmer animation (4s cycle, 15% opacity) for forward motion cue
 * - ADHD-friendly design: consistent spacing, predictable rhythm, non-urgent motion
 * - All layers rendered as SVG paths with geometricPrecision rendering
 * - Multi-layer SVG filter shadow (mimics box-shadow):
 *   • Small tight shadow: 0px 1px 1px rgba(0,0,0,0.25)
 *   • Medium soft shadow: 0px 2px 8px rgba(0,0,0,0.25)
 * - Supports first/middle/last/single variants
 * - Modern white theme with smooth antialiasing
 * - Active pulse and hover overlays as SVG paths with CSS animations
 * - Uniform 2px borders across all sizes for crisp rendering
 */

'use client';

import React, { ReactNode } from 'react';
import OpenMoji from '@/components/shared/OpenMoji';

// ============================================================================
// Types
// ============================================================================

export type ChevronPosition = 'first' | 'middle' | 'last' | 'single';
export type ChevronStatus = 'pending' | 'active' | 'done' | 'error' | 'next';
export type ChevronSize = 'full' | 'micro' | 'nano';

export interface ChevronStepProps {
  status: ChevronStatus;
  position: ChevronPosition;
  size: ChevronSize;
  children?: ReactNode;
  emoji?: string;
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
// Default Colors (Solarized theme)
// ============================================================================

const DEFAULT_COLORS = {
  pending: {
    fill: '#fdf6e3',        // Solarized base3 (light cream)
    stroke: '#93a1a1',      // Solarized base1 (light gray)
  },
  active: {
    fill: '#eef4fb',        // Light blue tint
    stroke: '#268bd2',      // Solarized blue
  },
  done: {
    fill: '#eef2e6',        // Light green tint
    stroke: '#859900',      // Solarized green
  },
  error: {
    fill: '#fae8e8',        // Light red tint
    stroke: '#dc322f',      // Solarized red
  },
  next: {
    fill: '#fdf2e1',        // Light orange tint
    stroke: '#cb4b16',      // Solarized orange
  },
};

// ============================================================================
// Size Configurations
// ============================================================================

const SIZE_CONFIG = {
  full: { height: 64, borderWidth: 2 },
  micro: { height: 40, borderWidth: 2 },
  nano: { height: 32, borderWidth: 2 },
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
  emoji,
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
  const getSVGPath = (pos: ChevronPosition, width: number, height: number, isCollapsed: boolean): string => {
    const arrow = CHEVRON_ARROW_DEPTH_PX;
    const h = height;
    const w = width;
    const half = h / 2;

    if (pos === 'single') {
      return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
    }

    if (pos === 'first') {
      return `M 0,0 L ${w - arrow},0 L ${w},${half} L ${w - arrow},${h} L 0,${h} Z`;
    }

    if (pos === 'middle') {
      return `M 0,0 L ${w - arrow},0 L ${w},${half} L ${w - arrow},${h} L 0,${h} L ${arrow},${half} Z`;
    }

    // last - straight right edge, left notch stays at arrow position
    return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} L ${arrow},${half} Z`;
  };


  const h = config.height;

  // Determine if chevron is truly collapsed (narrow width)
  // Collapsed chevrons are very narrow (< 60px)
  const isCollapsed = containerWidth < 60;

  // Generate unique gradient ID for this chevron instance
  const gradientId = React.useId();

  // Helper functions for bevel gradient colors
  const adjustColor = (color: string, amount: number): string => {
    // For hex colors
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      const adjust = (val: number) => {
        if (amount > 0) {
          // Lighten
          return Math.min(255, Math.floor(val + (255 - val) * amount));
        } else {
          // Darken
          return Math.max(0, Math.floor(val * (1 + amount)));
        }
      };

      return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
    }
    return color;
  };

  // Button-10 style: smooth gradient with subtle contrast
  const highlightColor = adjustColor(finalFill, 0.18);   // Top highlight (lighter, like button)
  const shadowColor = adjustColor(finalFill, -0.18);     // Bottom shadow (darker, like button)
  const tipHighlight = adjustColor(finalFill, 0.25);     // Right tip (future direction)

  // Extract RGB values from finalStroke for colored shadow (Button-10 style)
  const getShadowColor = (color: string): string => {
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.25)`;
    }
    // If already rgb/rgba, just adjust opacity
    return color.replace(/[\d.]+\)$/, '0.25)');
  };
  const statusShadowColor = getShadowColor(finalStroke);

  return (
    <div
      ref={containerRef}
      className={`chevron-step-wrapper ${className} ${status === 'next' ? 'shake-next' : ''}`}
      style={{
        position: 'relative',
        width: width,
        minWidth: '40px',
        maxWidth: width,
        height: `${h}px`,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: isExpanded ? 0 : 1,
        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
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
      {/* Consolidated SVG with all layers and multi-layer shadow */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'visible',
        }}
        viewBox={`0 0 ${containerWidth} ${h}`}
        preserveAspectRatio="xMinYMin slice"
      >
        {/* Gradient definitions */}
        <defs>
          {/* Multi-layer drop shadow filter (mimics box-shadow, Button-10 style: colored shadows) */}
          <filter id={`multi-shadow-${gradientId}`} x="-50%" y="-50%" width="200%" height="200%">
            {/* Shadow 1: Small tight shadow - 0px 1px 1px (status color) */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" result="blur1"/>
            <feOffset in="blur1" dx="0" dy="1" result="offset1"/>
            <feFlood floodColor={statusShadowColor} result="color1"/>
            <feComposite in="color1" in2="offset1" operator="in" result="shadow1"/>

            {/* Shadow 2: Medium soft shadow - 0px 2px 8px (status color) */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur2"/>
            <feOffset in="blur2" dx="0" dy="2" result="offset2"/>
            <feFlood floodColor={statusShadowColor} result="color2"/>
            <feComposite in="color2" in2="offset2" operator="in" result="shadow2"/>

            {/* Merge shadows */}
            <feMerge result="merged-shadows">
              <feMergeNode in="shadow2"/>
              <feMergeNode in="shadow1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Simple 2-stop gradient: smooth top-to-bottom (like Button-10) */}
          <linearGradient id={`bevel-gradient-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={highlightColor} stopOpacity="1" />
            <stop offset="100%" stopColor={shadowColor} stopOpacity="1" />
          </linearGradient>

          {/* Thin inset highlight: mimics 'inset 0px 0.8px' from Button-10 */}
          <linearGradient id={`inset-highlight-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="5%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>

          {/* Sharp tip brightness: concentrated at the future (right edge) */}
          <linearGradient id={`tip-gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="75%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="100%" stopColor={tipHighlight} stopOpacity="0.3" />
          </linearGradient>

          {/* Progress shimmer gradient - sleek horizontal sweep */}
          <linearGradient id={`shimmer-gradient-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="35%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="45%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.35)" />
            <stop offset="55%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="65%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>

          {/* Shimmer glow filter for soft, sleek effect */}
          <filter id={`shimmer-glow-${gradientId}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
            <feComponentTransfer in="blur" result="softBlur">
              <feFuncA type="linear" slope="0.5"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="softBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Inset shadow filter for border effect */}
          <filter id={`inset-border-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            {/* Step 1: Get the inverse of the shape (everything OUTSIDE) */}
            <feFlood floodColor="black" result="outside-color"/>
            <feComposite in="outside-color" in2="SourceAlpha" operator="out" result="outside"/>

            {/* Step 2: Blur the outside to create soft edge */}
            <feGaussianBlur in="outside" stdDeviation="1.5" result="outside-blur"/>

            {/* Step 3: Keep only what's INSIDE the original shape (inset effect) */}
            <feComposite in="outside-blur" in2="SourceAlpha" operator="in" result="inset-shadow"/>

            {/* Step 4: Color it with the status color */}
            <feFlood floodColor={finalStroke} floodOpacity="0.6" result="shadow-color"/>
            <feComposite in="shadow-color" in2="inset-shadow" operator="in" result="colored-inset"/>
          </filter>

          {/* Subtle blur filter for soft borders */}
          <filter id={`border-blur-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blurred"/>
          </filter>
        </defs>

        {/* Layer 1: Base bevel gradient with shadow filter */}
        <path
          d={getSVGPath(position, containerWidth, h, isCollapsed)}
          fill={`url(#bevel-gradient-${gradientId})`}
          shapeRendering="geometricPrecision"
          filter={`url(#multi-shadow-${gradientId})`}
        />

        {/* Layer 2: Thin inset highlight (top edge, like Button-10) */}
        <path
          d={getSVGPath(position, containerWidth, h, isCollapsed)}
          fill={`url(#inset-highlight-${gradientId})`}
          shapeRendering="geometricPrecision"
        />

        {/* Layer 3: Tip brightness (lighter = future) */}
        <path
          d={getSVGPath(position, containerWidth, h, isCollapsed)}
          fill={`url(#tip-gradient-${gradientId})`}
          shapeRendering="geometricPrecision"
        />

        {/* Layer 4: Progress shimmer (active status only) */}
        {status === 'active' && (
          <path
            d={getSVGPath(position, containerWidth, h, isCollapsed)}
            fill={`url(#shimmer-gradient-${gradientId})`}
            shapeRendering="geometricPrecision"
            filter={`url(#shimmer-glow-${gradientId})`}
            className="shimmer-flow"
          />
        )}

        {/* Layer 5: Active pulse overlay */}
        {status === 'active' && (
          <path
            d={getSVGPath(position, containerWidth, h, isCollapsed)}
            fill="rgba(59, 130, 246, 0.12)"
            shapeRendering="geometricPrecision"
            className="pulse-glow"
          />
        )}

        {/* Layer 6: Hover sheen overlay */}
        {isHovered && (
          <path
            d={getSVGPath(position, containerWidth, h, isCollapsed)}
            fill="rgba(0, 0, 0, 0.04)"
            shapeRendering="geometricPrecision"
          />
        )}

        {/* Layer 7: Inset shadow (adds depth) */}
        <g filter={`url(#inset-border-${gradientId})`}>
          <path
            d={getSVGPath(position, containerWidth, h, isCollapsed)}
            fill={finalStroke}
            fillOpacity="0.4"
            shapeRendering="geometricPrecision"
          />
        </g>

        {/* Layer 8: Subtle blurred border stroke */}
        <path
          d={getSVGPath(position, containerWidth, h, isCollapsed)}
          fill="none"
          stroke={finalStroke}
          strokeWidth={config.borderWidth * 0.8}
          strokeOpacity={0.4}
          shapeRendering="geometricPrecision"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          filter={`url(#border-blur-${gradientId})`}
        />
      </svg>

      {/* Content Layer - Engraved text/icon effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: emoji && !isCollapsed ? '8px' : '0',
          fontSize: size === 'nano' ? '18px' : size === 'micro' ? '22px' : '26px',
          lineHeight: 1,
          zIndex: 2,
          pointerEvents: 'none',
          // Engraved/debossed text effect: light highlight below, dark shadow above
          textShadow: (emoji && !isCollapsed) ? undefined : '0 1px 1px rgba(255, 255, 255, 0.4), 0 -1px 0px rgba(0, 0, 0, 0.3)',
          fontWeight: 500,
          // Shift content to the right for last chevron to account for straight edge
          marginLeft: position === 'last' ? '4px' : '0',
        }}
      >
        {emoji && isCollapsed ? (
          // Collapsed: show only colored embossed emoji
          <OpenMoji
            emoji={emoji}
            size={size === 'nano' ? 16 : size === 'micro' ? 18 : 20}
            variant="color"
            embossed
          />
        ) : emoji && !isCollapsed ? (
          // Expanded: show colored embossed emoji + children
          <>
            <OpenMoji
              emoji={emoji}
              size={size === 'nano' ? 16 : size === 'micro' ? 18 : 20}
              variant="color"
              embossed
            />
            <span style={{
              textShadow: '0 1px 1px rgba(255, 255, 255, 0.4), 0 -1px 0px rgba(0, 0, 0, 0.3)',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              {children}
            </span>
          </>
        ) : (
          // No emoji: just children
          children
        )}
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

        @keyframes shimmer-flow {
          0% {
            transform: translateX(-150%);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          20% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          80% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(250%);
            opacity: 0;
          }
        }

        @keyframes bounce-elastic {
          0%, 100% {
            transform: translateX(0) scale(1);
          }
          5% {
            transform: translateX(6px) scale(1.02, 0.98);
          }
          10% {
            transform: translateX(-6px) scale(0.98, 1.02);
          }
          15% {
            transform: translateX(4px) scale(1.015, 0.985);
          }
          20% {
            transform: translateX(-3px) scale(0.99, 1.01);
          }
          25% {
            transform: translateX(2px) scale(1.008, 0.992);
          }
          30% {
            transform: translateX(-1px) scale(0.995, 1.005);
          }
          35% {
            transform: translateX(0.5px) scale(1.002, 0.998);
          }
          40%, 90% {
            transform: translateX(0) scale(1);
          }
        }

        :global(.pulse-glow) {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        :global(.shimmer-flow) {
          animation: shimmer-flow 3s linear infinite;
          transform-origin: center;
          will-change: transform, opacity;
        }

        :global(.shake-next) {
          animation: bounce-elastic 3s ease-in-out infinite;
        }

        :global(.shake-next):hover {
          animation-play-state: paused;
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
    pending: '#6b7280',
    active: '#3b82f6',
    done: '#22c55e',
    error: '#ef4444',
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
