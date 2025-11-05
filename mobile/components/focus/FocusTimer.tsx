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

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Play, Pause, Square, RotateCcw } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { THEME } from '../../src/theme/colors';

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

  // Calculate progress percentages for nested rings
  const overallProgress = ((duration - timeRemaining) / duration) * 100;

  // For middle ring - cycles through 10 times (0-9 complete cycles + current progress)
  const middleCompleteCycles = Math.floor(overallProgress / 10);
  const middleCurrentProgress = (overallProgress % 10) * 10;

  // For inner ring - cycles through 100 times (0-99 complete cycles + current progress)
  const innerCompleteCycles = Math.floor(overallProgress);
  const innerCurrentProgress = (overallProgress % 1) * 100;

  // Get color based on session type
  const getSessionColor = () => {
    switch (sessionType) {
      case 'focus':
        return THEME.orange;
      case 'short-break':
        return THEME.green;
      case 'long-break':
        return THEME.blue;
      default:
        return THEME.orange;
    }
  };

  const sessionColor = getSessionColor();

  // Define 7 Solarized Dark accent colors (no magenta)
  const colorSpectrum = [
    THEME.red,      // 0
    THEME.orange,   // 1
    THEME.yellow,   // 2
    THEME.green,    // 3
    THEME.cyan,     // 4
    THEME.blue,     // 5
    THEME.violet,   // 6
  ];

  // Helper to get gradient from current color to next color
  const getColorToColorGradient = (colorIndex: number) => {
    const currentColor = colorSpectrum[colorIndex % 7];
    const nextColor = colorSpectrum[(colorIndex + 1) % 7];
    return { start: currentColor, end: nextColor };
  };

  // Render accumulated rings for completed cycles with SOLID colors
  const renderCompletedCycles = (
    radius: number,
    strokeWidth: number,
    completedCycles: number,
    totalCycles: number,
    baseGradientId: string,
    baseOpacity: number
  ) => {
    const circumference = 2 * Math.PI * radius;
    const cycles = [];

    for (let i = 0; i < completedCycles; i++) {
      // Completed cycles use SOLID color (no gradient!) for clear distinction
      const colorIndex = i % 7;
      const solidColor = colorSpectrum[colorIndex];

      cycles.push(
        <Circle
          key={`cycle-${i}`}
          cx="120"
          cy="120"
          r={radius}
          stroke={solidColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={0} // Full circle for completed cycles
          strokeLinecap="round"
          opacity={baseOpacity} // No fading - all at same brightness!
          transform="rotate(-90 120 120)"
        />
      );
    }

    return <>{cycles}</>;
  };

  // SVG Circle helper function with layered cycles
  const renderProgressRing = (
    radius: number,
    strokeWidth: number,
    currentProgress: number,
    completedCycles: number,
    totalCycles: number,
    gradientId: string,
    opacity: number = 1
  ) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (currentProgress / 100) * circumference;

    // Current cycle uses solid color (same as completed cycles for consistency)
    const currentColorIndex = completedCycles % 7;
    const currentColor = colorSpectrum[currentColorIndex];

    return (
      <>
        {/* Background circle */}
        <Circle
          cx="120"
          cy="120"
          r={radius}
          stroke={THEME.base02}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* All completed cycles layered beneath with solid colors */}
        {renderCompletedCycles(radius, strokeWidth, completedCycles, totalCycles, gradientId, opacity)}

        {/* Current progress ring - solid color (no gradient issues!) */}
        <Circle
          cx="120"
          cy="120"
          r={radius}
          stroke={currentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          opacity={opacity}
          transform="rotate(-90 120 120)"
        />
      </>
    );
  };

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
      <Text style={styles.sessionLabel}>{getSessionLabel()}</Text>

      {/* Nested Progress Rings */}
      <View style={styles.progressContainer}>
        <Svg width={240} height={240} viewBox="0 0 240 240">
          <Defs>
            {/* Generate gradients for each ring - 10 gradients (color N → color N+1) */}
            {['gradient-outer', 'gradient-middle', 'gradient-inner'].map((baseId) => {
              return colorSpectrum.map((_, index) => {
                const colors = getColorToColorGradient(index);
                return (
                  <LinearGradient
                    key={`${baseId}-cycle${index}`}
                    id={`${baseId}-cycle${index}`}
                    x1="50%"
                    y1="0%"
                    x2="100%"
                    y2="50%"
                    gradientUnits="objectBoundingBox"
                  >
                    <Stop offset="0%" stopColor={colors.start} stopOpacity="1" />
                    <Stop offset="100%" stopColor={colors.end} stopOpacity="1" />
                  </LinearGradient>
                );
              });
            })}
          </Defs>

          {/* All rings equal thickness (6px) with small gaps (4px) */}
          {/* Outer Ring - Full Session Progress (0 cycles, shows overall progress) */}
          {renderProgressRing(110, 6, overallProgress, 0, 1, 'gradient-outer', 1)}

          {/* Middle Ring - Current 10% Segment + Completed 10% Cycles */}
          {renderProgressRing(100, 6, middleCurrentProgress, middleCompleteCycles, 10, 'gradient-middle', 1)}

          {/* Inner Ring - Current 1% Segment + Completed 1% Cycles */}
          {renderProgressRing(90, 6, innerCurrentProgress, innerCompleteCycles, 100, 'gradient-inner', 1)}
        </Svg>

        {/* Time Display - Absolutely positioned over SVG */}
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, isComplete && styles.timeTextComplete]}>
            {formatTime(timeRemaining)}
          </Text>
          {isComplete && <Text style={styles.completeText}>Complete!</Text>}

          {/* Progress Info */}
          <View style={styles.progressInfo}>
            <Text style={styles.progressInfoText}>
              {Math.round(overallProgress)}%
            </Text>
          </View>
        </View>
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

      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        <View style={[styles.progressBarFill, { width: `${overallProgress}%`, backgroundColor: sessionColor }]} />
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
    marginBottom: 32,
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
    marginBottom: 24,
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
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default FocusTimer;
