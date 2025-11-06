/**
 * FocusTimer - Pomodoro-style focus timer for Hunter mode
 *
 * Features:
 * - Visual circular progress indicator
 * - Play/Pause/Stop controls
 * - Time display (minutes:seconds)
 * - Session type indicator (Focus/Break)
 * - Energy-aware duration suggestions
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Play, Pause, Square, RotateCcw } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { THEME } from '../../src/theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type SessionType = 'focus' | 'short-break' | 'long-break';

export interface FocusTimerProps {
  duration?: number; // Duration in seconds
  sessionType?: SessionType;
  onComplete?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  autoStart?: boolean;
}

// Constants - defined outside component to avoid recreation on every render
// Rainbow spectrum order: Yellow -> Green -> Cyan -> Blue -> Violet -> Magenta -> Red
// Start with yellow for clear visual differentiation
// Replaced orange with magenta for better color distinction (orange too similar to red)
const COLOR_SPECTRUM = [
  THEME.yellow,   // 0
  THEME.green,    // 1
  THEME.cyan,     // 2
  THEME.blue,     // 3
  THEME.violet,   // 4
  THEME.magenta,  // 5
  THEME.red,      // 6
];

const MIDDLE_SET_COLORS = [
  THEME.red,      // 0
  THEME.magenta,  // 1
  THEME.yellow,   // 2
  THEME.green,    // 3
  THEME.cyan,     // 4 - goal color placeholder
  THEME.blue,     // 5
  THEME.violet,   // 6
];

const INNER_CYCLE_TIME = 5; // seconds
const MIDDLE_SEGMENT_TIME = 5; // seconds per segment
const TOTAL_MIDDLE_SEGMENTS = 12;
const MIDDLE_CYCLE_TIME = 60; // seconds per complete middle ring cycle
const OUTER_SEGMENT_TIME = 60; // seconds per segment

const FocusTimer: React.FC<FocusTimerProps> = ({
  duration = 25 * 60, // Default: 25 minutes
  sessionType = 'focus',
  onComplete,
  onStart,
  onPause,
  onStop,
  autoStart = false,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  // Track previous segment values to detect completion
  const prevSegmentsRef = useRef({ middle: -1, outer: -1, inner: -1, middleAbsolute: -1 });

  // Animated values for pop effects (scale animations + flash opacity)
  const middleScalesRef = useRef<Animated.Value[]>([]);
  const outerScalesRef = useRef<Animated.Value[]>([]);
  const middleFlashRef = useRef<Animated.Value[]>([]);
  const outerFlashRef = useRef<Animated.Value[]>([]);
  const innerFlashRef = useRef<Animated.Value[]>([]);

  // Initialize animated values
  if (middleScalesRef.current.length === 0) {
    middleScalesRef.current = Array.from({ length: 12 }, () => new Animated.Value(1));
    middleFlashRef.current = Array.from({ length: 12 }, () => new Animated.Value(0));
  }
  if (outerScalesRef.current.length === 0) {
    outerScalesRef.current = Array.from({ length: 100 }, () => new Animated.Value(1));
    outerFlashRef.current = Array.from({ length: 100 }, () => new Animated.Value(0));
  }
  if (innerFlashRef.current.length === 0) {
    innerFlashRef.current = Array.from({ length: 1000 }, () => new Animated.Value(0));
  }

  // Timer effect - updates 60 times per second for smooth ring animation
  useEffect(() => {
    let animationFrame: number | null = null;
    let lastTime = Date.now();

    if (isRunning && timeRemaining > 0) {
      const updateTimer = () => {
        const now = Date.now();
        const delta = (now - lastTime) / 1000; // Convert to seconds

        setTimeRemaining((prev) => {
          const newValue = prev - delta;
          if (newValue <= 0) {
            setIsRunning(false);
            setIsComplete(true);
            onComplete?.();
            return 0;
          }
          return newValue;
        });

        lastTime = now;

        if (isRunning) {
          animationFrame = requestAnimationFrame(updateTimer);
        }
      };

      animationFrame = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, onComplete]);

  // Reset when duration changes
  useEffect(() => {
    setTimeRemaining(duration);
    setIsComplete(false);
  }, [duration]);

  const handleStart = () => {
    setIsRunning(true);
    setIsComplete(false);
    onStart?.();
  };

  const handlePause = () => {
    setIsRunning(false);
    onPause?.();
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
    setIsComplete(false);
    onStop?.();
  };

  const handleReset = () => {
    setTimeRemaining(duration);
    setIsComplete(false);
    setIsRunning(false);
  };

  // Format time as M:SS (no leading zero on minutes)
  const formatTime = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds); // Remove decimals
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Goal color - used for completion state
  const goalColor = THEME.cyan;

  // Helper function to interpolate between two colors - memoized to avoid recreation
  const interpolateColor = useCallback((color1: string, color2: string, factor: number): string => {
    // Convert hex to RGB
    const hex2rgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  // Helper function to get outer ring color based on overall progress (0-100%)
  // Smoothly blends: Red (0%) → Orange (25%) → Yellow (50%) → Green (75%) → Cyan (100%)
  const getOuterRingColor = useCallback((progress: number): string => {
    if (progress <= 25) {
      // Blend from red to orange (0% to 25%)
      const factor = progress / 25;
      return interpolateColor(THEME.red, THEME.orange, factor);
    } else if (progress <= 50) {
      // Blend from orange to yellow (25% to 50%)
      const factor = (progress - 25) / 25;
      return interpolateColor(THEME.orange, THEME.yellow, factor);
    } else if (progress <= 75) {
      // Blend from yellow to green (50% to 75%)
      const factor = (progress - 50) / 25;
      return interpolateColor(THEME.yellow, THEME.green, factor);
    } else {
      // Blend from green to cyan (75% to 100%)
      const factor = (progress - 75) / 25;
      return interpolateColor(THEME.green, THEME.cyan, factor);
    }
  }, [interpolateColor]);

  // Calculate arc-based progress
  const timeElapsed = duration - timeRemaining;
  const overallProgress = (timeElapsed / duration) * 100;

  // Inner ring: Full rotation every 5 seconds
  const innerCompleteCycles = Math.floor(timeElapsed / INNER_CYCLE_TIME);
  const innerProgress = (timeElapsed % INNER_CYCLE_TIME) / INNER_CYCLE_TIME * 100;

  // Middle ring: 12 arc segments, each fills over 5 seconds (60 seconds per complete cycle)
  const totalMiddleCycles = Math.ceil(duration / MIDDLE_CYCLE_TIME); // Total cycles in session
  const currentMiddleCycle = Math.floor(timeElapsed / MIDDLE_CYCLE_TIME); // Which cycle we're on
  const absoluteMiddleSegment = Math.floor(timeElapsed / MIDDLE_SEGMENT_TIME); // Total segments completed (never wraps)
  const currentMiddleSegment = absoluteMiddleSegment % TOTAL_MIDDLE_SEGMENTS; // Position in ring (0-11)
  const middleSegmentProgress = (timeElapsed % MIDDLE_SEGMENT_TIME) / MIDDLE_SEGMENT_TIME * 100;

  // Outer ring: N arc segments (one per minute), each fills over 60 seconds
  const totalOuterSegments = Math.ceil(duration / 60); // Number of minutes (rounded up for half minutes)
  const currentOuterSegment = Math.floor(timeElapsed / OUTER_SEGMENT_TIME);
  const outerSegmentProgress = (timeElapsed % OUTER_SEGMENT_TIME) / OUTER_SEGMENT_TIME * 100;

  // Detect segment completions and trigger elastic pop animation + flash
  useEffect(() => {
    const prev = prevSegmentsRef.current;

    // Middle segment just completed - trigger elastic animation + white flash
    if (absoluteMiddleSegment > prev.middleAbsolute && prev.middleAbsolute >= 0) {
      const segmentIndexInRing = prev.middleAbsolute % 12;
      const scale = middleScalesRef.current[segmentIndexInRing];
      const flash = middleFlashRef.current[segmentIndexInRing];

      // Run scale and flash animations in parallel
      Animated.parallel([
        // Elastic spring animation: scale 1 → 1.3 → 1
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.3,
            tension: 100,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        // White flash: 0 → 0.7 → 0 (quick flash)
        Animated.sequence([
          Animated.timing(flash, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(flash, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    // Outer segment just completed - trigger elastic animation + white flash
    if (currentOuterSegment > prev.outer && prev.outer >= 0) {
      const segmentIndex = prev.outer;
      if (segmentIndex < outerScalesRef.current.length) {
        const scale = outerScalesRef.current[segmentIndex];
        const flash = outerFlashRef.current[segmentIndex];

        // Run scale and flash animations in parallel
        Animated.parallel([
          // Elastic spring animation: scale 1 → 1.3 → 1
          Animated.sequence([
            Animated.spring(scale, {
              toValue: 1.3,
              tension: 100,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              tension: 100,
              friction: 7,
              useNativeDriver: true,
            }),
          ]),
          // White flash: 0 → 0.7 → 0 (quick flash)
          Animated.sequence([
            Animated.timing(flash, {
              toValue: 0.7,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(flash, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }
    }

    // Update previous values
    prevSegmentsRef.current = {
      middle: currentMiddleSegment,
      middleAbsolute: absoluteMiddleSegment,
      outer: currentOuterSegment,
      inner: innerCompleteCycles,
    };
  }, [currentMiddleSegment, absoluteMiddleSegment, currentOuterSegment, innerCompleteCycles]);

  // Helper function to convert polar to cartesian coordinates - memoized
  const polarToCartesian = useCallback((centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }, []);

  // Helper function to create SVG arc path - memoized
  const createArcPath = useCallback((
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  }, [polarToCartesian]);

  // Render arc segment with optional animation and flash - memoized
  const renderArcSegment = useCallback((
    radius: number,
    strokeWidth: number,
    segmentIndex: number,
    totalSegments: number,
    progress: number, // 0-100
    color: string,
    gapDegrees: number = 4,
    animatedScale?: Animated.Value,
    animatedFlash?: Animated.Value
  ) => {
    const degreesPerSegment = 360 / totalSegments;
    const segmentStartAngle = segmentIndex * degreesPerSegment;
    const segmentEndAngle = segmentStartAngle + degreesPerSegment - gapDegrees;

    // Calculate actual end angle based on progress
    const progressAngle = segmentStartAngle + ((segmentEndAngle - segmentStartAngle) * progress / 100);

    if (progress === 0) return null;

    const pathData = createArcPath(120, 120, radius, segmentStartAngle, progressAngle);

    // If animated, use AnimatedPath with strokeWidth animation and flash overlay
    if (animatedScale && animatedFlash) {
      const animatedStrokeWidth = animatedScale.interpolate({
        inputRange: [1, 1.3],
        outputRange: [strokeWidth, strokeWidth * 1.5],
      });

      return (
        <React.Fragment>
          {/* Base colored arc */}
          <AnimatedPath
            d={pathData}
            stroke={color}
            strokeWidth={animatedStrokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* White flash overlay */}
          <AnimatedPath
            d={pathData}
            stroke={THEME.base3}
            strokeWidth={animatedStrokeWidth}
            fill="none"
            strokeLinecap="round"
            opacity={animatedFlash}
          />
        </React.Fragment>
      );
    }

    return (
      <Path
        d={pathData}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    );
  }, [createArcPath]);

  // Get session label
  const getSessionLabel = () => {
    switch (sessionType) {
      case 'focus':
        return 'Focus Session';
      case 'short-break':
        return 'Short Break';
      case 'long-break':
        return 'Long Break';
      default:
        return 'Session';
    }
  };

  return (
    <View style={styles.container}>
      {/* Session Type Label */}
      <Text style={[styles.sessionLabel, isComplete && { color: goalColor }]}>{getSessionLabel()}</Text>

      {/* Nested Progress Rings */}
      <View style={styles.progressContainer}>
        <Svg width={240} height={240} viewBox="0 0 240 240">
          {/* Outer Ring - Current segment white pill-shaped border (renders underneath) - hide at 100% */}
          {!isComplete && (
            <>
              <Path
                d={createArcPath(120, 120, 110, currentOuterSegment * (360 / totalOuterSegments), (currentOuterSegment + 1) * (360 / totalOuterSegments) - 6)}
                stroke={THEME.base3}
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
                opacity={0.3}
              />

              {/* Outer Ring - Background-colored inner layer */}
              <Path
                d={createArcPath(120, 120, 110, currentOuterSegment * (360 / totalOuterSegments), (currentOuterSegment + 1) * (360 / totalOuterSegments) - 6)}
                stroke={THEME.base02}
                strokeWidth={5.5}
                fill="none"
                strokeLinecap="round"
                opacity={0.8}
              />
            </>
          )}

          {/* Middle Ring - Current segment white pill-shaped border (renders underneath) - hide at 100% */}
          {!isComplete && (
            <>
              <Path
                d={createArcPath(120, 120, 98, currentMiddleSegment * 30, (currentMiddleSegment + 1) * 30 - 6)}
                stroke={THEME.base3}
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
                opacity={0.3}
              />

              {/* Middle Ring - Background-colored inner layer */}
              <Path
                d={createArcPath(120, 120, 98, currentMiddleSegment * 30, (currentMiddleSegment + 1) * 30 - 6)}
                stroke={THEME.base02}
                strokeWidth={5.5}
                fill="none"
                strokeLinecap="round"
                opacity={0.8}
              />
            </>
          )}

          {/* Inner Ring - White pill-shaped border (full circle) - only show on first cycle and not complete */}
          {innerCompleteCycles === 0 && !isComplete && (
            <>
              <Circle
                cx="120"
                cy="120"
                r={86}
                stroke={THEME.base3}
                strokeWidth={9}
                fill="none"
                opacity={0.3}
              />

              {/* Inner Ring - Background-colored inner layer (full circle) */}
              <Circle
                cx="120"
                cy="120"
                r={86}
                stroke={THEME.base02}
                strokeWidth={5.5}
                fill="none"
                opacity={0.8}
              />
            </>
          )}

          {/* Outer Ring - Arc segments (one per minute) - gradually shifts Red → Yellow → Green */}
          {/* Radius: 110px, show all completed segments + current with elastic animation + flash */}
          {(() => {
            const outerColor = getOuterRingColor(overallProgress);
            return (
              <>
                {Array.from({ length: currentOuterSegment }).map((_, i) => {
                  const scale = outerScalesRef.current[i];
                  const flash = outerFlashRef.current[i];
                  return (
                    <React.Fragment key={`outer-complete-${i}`}>
                      {renderArcSegment(110, 6, i, totalOuterSegments, 100, outerColor, 6, scale, flash)}
                    </React.Fragment>
                  );
                })}
                {renderArcSegment(110, 6, currentOuterSegment, totalOuterSegments, outerSegmentProgress, outerColor, 6)}
              </>
            );
          })()}

          {/* Middle Ring - 12 arc segments - STACK like inner ring with SET-based color cycling */}
          {/* Each SET of 12 segments shares the SAME color, sets cycle through 7 colors */}
          {/* Colors: Red → Orange → Yellow → Green → Cyan → Blue → Violet → (repeat) */}
          {/* LAST SET is always CYAN (overridden) */}
          {/* Radius: 98px (6px gap from outer) */}
          {/* Performance: Only render most recent 12 completed segments (one per position) */}
          {/* Earlier segments are hidden underneath, so we skip rendering them */}
          {(() => {
            const totalCompletedSegments = Math.floor(timeElapsed / MIDDLE_SEGMENT_TIME);
            // Render only the last 12 segments (or fewer if less than 12 completed)
            const segmentsToRender = Math.min(totalCompletedSegments, 12);
            const startIndex = totalCompletedSegments - segmentsToRender;

            return Array.from({ length: segmentsToRender }).map((_, i) => {
              const absoluteSegmentIndex = startIndex + i;
              const segmentIndexInRing = absoluteSegmentIndex % TOTAL_MIDDLE_SEGMENTS;
              const scale = middleScalesRef.current[segmentIndexInRing];
              const flash = middleFlashRef.current[segmentIndexInRing];

              // Calculate which SET this segment belongs to (each set = 12 segments)
              const setIndex = Math.floor(absoluteSegmentIndex / TOTAL_MIDDLE_SEGMENTS);
              const totalSets = Math.ceil(duration / MIDDLE_CYCLE_TIME); // Total number of sets in session

              // Last set is always goal color, others cycle through MIDDLE_SET_COLORS (7 colors)
              const isLastSet = setIndex === totalSets - 1;
              const color = isLastSet ? goalColor : MIDDLE_SET_COLORS[setIndex % MIDDLE_SET_COLORS.length];

              return (
                <React.Fragment key={`middle-complete-${absoluteSegmentIndex}`}>
                  {renderArcSegment(98, 6, segmentIndexInRing, TOTAL_MIDDLE_SEGMENTS, 100, color, 6, scale, flash)}
                </React.Fragment>
              );
            });
          })()}
          {/* Current filling segment - uses SET color (goal color if last set) */}
          {(() => {
            const setIndex = Math.floor(absoluteMiddleSegment / TOTAL_MIDDLE_SEGMENTS);
            const totalSets = Math.ceil(duration / MIDDLE_CYCLE_TIME);
            const isLastSet = setIndex === totalSets - 1;
            const color = isLastSet ? goalColor : MIDDLE_SET_COLORS[setIndex % MIDDLE_SET_COLORS.length];
            return renderArcSegment(98, 6, currentMiddleSegment, TOTAL_MIDDLE_SEGMENTS, middleSegmentProgress, color, 6);
          })()}

          {/* Inner Ring - Gradient that changes color as it revolves */}
          {/* Each cycle transitions from one spectrum color to the next */}
          {/* Cycles STACK on top of each other (overlap) */}
          {/* Divided into 36 segments (10° each) for smooth gradient transition */}
          {/* Radius: 86px (6px gap from middle) */}

          {/* At 100% completion: Show solid cyan ring */}
          {isComplete && (
            <Circle
              cx="120"
              cy="120"
              r={86}
              stroke={goalColor}
              strokeWidth={6}
              fill="none"
            />
          )}

          {/* Render ONLY the most recent completed cycle (topmost layer) - hide when complete */}
          {/* Performance optimization: previous cycles are hidden underneath, no need to render them */}
          {!isComplete && innerCompleteCycles > 0 && (() => {
            const cycleIndex = innerCompleteCycles - 1; // Most recent completed cycle
            const flash = innerFlashRef.current[cycleIndex % innerFlashRef.current.length];

            // Calculate total cycles needed to reach completion
            const totalCyclesToGoal = Math.ceil(duration / INNER_CYCLE_TIME);
            const isLastCycle = cycleIndex === totalCyclesToGoal - 1;

            // Start color: current position in spectrum (wraps through all 7 colors continuously)
            const startColor = COLOR_SPECTRUM[cycleIndex % COLOR_SPECTRUM.length];
            // End color: next color in spectrum (wraps around), OR goal color if this is the final cycle
            const endColor = isLastCycle ? goalColor : COLOR_SPECTRUM[(cycleIndex + 1) % COLOR_SPECTRUM.length];

            const segmentCount = 36; // 36 segments for smooth gradient

            return (
              <React.Fragment key={`inner-complete-${cycleIndex}`}>
                {/* Render 36 arc segments with color transition */}
                {Array.from({ length: segmentCount }).map((_, segmentIndex) => {
                  const progressFactor = segmentIndex / (segmentCount - 1); // 0 to 1
                  const segmentColor = interpolateColor(startColor, endColor, progressFactor);
                  const startAngle = segmentIndex * (360 / segmentCount);
                  const endAngle = (segmentIndex + 1) * (360 / segmentCount);

                  return (
                    <Path
                      key={`inner-cycle-${cycleIndex}-seg-${segmentIndex}`}
                      d={createArcPath(120, 120, 86, startAngle, endAngle)}
                      stroke={segmentColor}
                      strokeWidth={6}
                      fill="none"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* White flash overlay (full circle) */}
                <AnimatedCircle
                  cx="120"
                  cy="120"
                  r={86}
                  stroke={THEME.base3}
                  strokeWidth={6}
                  fill="none"
                  strokeDasharray={2 * Math.PI * 86}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform="rotate(-90 120 120)"
                  opacity={flash}
                />
              </React.Fragment>
            );
          })()}

          {/* Current filling cycle - transitions from current color to next - hide when complete */}
          {!isComplete && (() => {
            // Calculate total cycles needed to reach completion
            const totalCyclesToGoal = Math.ceil(duration / INNER_CYCLE_TIME);
            const isLastCycle = innerCompleteCycles === totalCyclesToGoal - 1;

            // Start color: current position in spectrum (wraps through all 7 colors continuously)
            const startColor = COLOR_SPECTRUM[innerCompleteCycles % COLOR_SPECTRUM.length];
            // End color: next color in spectrum (wraps around), OR goal color if this is the final cycle
            const endColor = isLastCycle ? goalColor : COLOR_SPECTRUM[(innerCompleteCycles + 1) % COLOR_SPECTRUM.length];

            const segmentCount = 36;
            const completedSegments = Math.floor((innerProgress / 100) * segmentCount);
            const currentSegmentProgress = ((innerProgress / 100) * segmentCount) % 1;

            // Calculate tip position (current progress angle)
            const totalProgressAngle = (innerProgress / 100) * 360;
            const tipPosition = polarToCartesian(120, 120, 86, totalProgressAngle);

            // Current tip color
            const currentProgressFactor = innerProgress / 100;
            const tipColor = interpolateColor(startColor, endColor, currentProgressFactor);

            return (
              <>
                {/* Completed segments in current cycle */}
                {Array.from({ length: completedSegments }).map((_, segmentIndex) => {
                  const progressFactor = segmentIndex / (segmentCount - 1);
                  const segmentColor = interpolateColor(startColor, endColor, progressFactor);
                  const startAngle = segmentIndex * (360 / segmentCount);
                  const endAngle = (segmentIndex + 1) * (360 / segmentCount);

                  return (
                    <Path
                      key={`inner-current-seg-${segmentIndex}`}
                      d={createArcPath(120, 120, 86, startAngle, endAngle)}
                      stroke={segmentColor}
                      strokeWidth={6}
                      fill="none"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Currently filling segment */}
                {completedSegments < segmentCount && (
                  <Path
                    d={createArcPath(
                      120,
                      120,
                      86,
                      completedSegments * (360 / segmentCount),
                      completedSegments * (360 / segmentCount) + (360 / segmentCount) * currentSegmentProgress
                    )}
                    stroke={interpolateColor(
                      startColor,
                      endColor,
                      completedSegments / (segmentCount - 1)
                    )}
                    strokeWidth={6}
                    fill="none"
                    strokeLinecap="round"
                  />
                )}

                {/* Tip indicator - subtle dot at the current progress position */}
                <>
                  {/* Soft glow */}
                  <Circle
                    cx={tipPosition.x}
                    cy={tipPosition.y}
                    r={5}
                    fill={tipColor}
                    opacity={0.3}
                  />
                  {/* Core dot */}
                  <Circle
                    cx={tipPosition.x}
                    cy={tipPosition.y}
                    r={2.5}
                    fill={tipColor}
                    opacity={0.9}
                  />
                </>
              </>
            );
          })()}
        </Svg>

        {/* Time Display - Absolutely positioned over SVG */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, isComplete && { color: goalColor }]}>
            {formatTime(timeRemaining)}
          </Text>
          {isComplete && <Text style={[styles.completeText, { color: goalColor }]}>Complete!</Text>}

          {/* Progress Info */}
          <View style={styles.progressInfo}>
            <Text style={[styles.progressInfoText, isComplete && { color: goalColor }]}>
              {Math.round(overallProgress)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        <View style={[styles.progressBarFill, { width: `${overallProgress}%`, backgroundColor: THEME.orange }]} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={handleStart}
          >
            <Play size={24} color={THEME.base3} fill={THEME.base3} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePause}
          >
            <Pause size={24} color={THEME.base3} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          onPress={handleStop}
        >
          <Square size={24} color={THEME.base3} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={handleReset}
        >
          <RotateCcw size={24} color={THEME.base3} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.base1,
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressContainer: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  timeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME.base1,
    fontVariant: ['tabular-nums'],
  },
  timeTextComplete: {
    color: THEME.green,
  },
  completeText: {
    fontSize: 16,
    color: THEME.green,
    marginTop: 8,
    fontWeight: '600',
  },
  progressInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  progressInfoText: {
    fontSize: 14,
    color: THEME.base0,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: THEME.green,
  },
  pauseButton: {
    backgroundColor: THEME.yellow,
  },
  stopButton: {
    backgroundColor: THEME.red,
  },
  resetButton: {
    backgroundColor: THEME.blue,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: THEME.base02,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

// Wrap in React.memo to prevent unnecessary re-renders when props haven't changed
export default React.memo(FocusTimer);
