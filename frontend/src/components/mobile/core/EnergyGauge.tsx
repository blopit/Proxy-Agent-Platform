'use client'

import React from 'react';
import { getBatteryColor } from '@/utils/colorBlending';
import { semanticColors, spacing, fontSize, borderRadius } from '@/lib/design-system';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface EnergyGaugeProps {
  energy: number; // 0-100
  trend?: 'rising' | 'falling' | 'stable';
  predictedNextHour?: number;
  variant?: 'micro' | 'expanded';
}

const EnergyGauge: React.FC<EnergyGaugeProps> = ({
  energy,
  trend = 'stable',
  predictedNextHour,
  variant = 'expanded'
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Calculate stroke dash offset for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (energy / 100) * circumference;

  // Get color based on energy level using smooth blending
  const getEnergyColor = () => {
    return getBatteryColor(energy);
  };

  // Get energy level text
  const getEnergyLevel = () => {
    if (energy >= 70) return 'High Energy';
    if (energy >= 40) return 'Medium Energy';
    return 'Low Energy';
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'rising':
        return '📈';
      case 'falling':
        return '📉';
      default:
        return '➡️';
    }
  };

  // Micro variant - compact horizontal display
  if (variant === 'micro') {
    return (
      <div
        className="flex items-center justify-between h-full"
        style={{
          padding: `${spacing[2]} ${spacing[4]}`
        }}
      >
        {/* Compact circular gauge */}
        <div className="relative flex-shrink-0" style={{ width: '64px', height: '64px' }}>
          <svg width="64" height="64" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={semanticColors.bg.secondary}
              strokeWidth="6"
            />
            {/* Energy progress circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={getEnergyColor()}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 28}
              strokeDashoffset={2 * Math.PI * 28 - (energy / 100) * 2 * Math.PI * 28}
              strokeLinecap="round"
              style={{
                transition: shouldReduceMotion ? 'none' : 'all 1s ease-out'
              }}
            />
          </svg>
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                fontSize: fontSize.lg,
                fontWeight: 'bold',
                color: getEnergyColor()
              }}
            >
              {energy}%
            </div>
          </div>
        </div>

        {/* Info section */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ marginLeft: spacing[3] }}
        >
          <div
            style={{
              fontSize: fontSize.sm,
              fontWeight: 'bold',
              color: semanticColors.text.primary
            }}
          >
            {getEnergyLevel()}
          </div>
          <div
            className="flex items-center"
            style={{
              gap: spacing[1],
              marginTop: spacing[1]
            }}
          >
            <span style={{ fontSize: fontSize.sm }}>{getTrendIcon()}</span>
            <span
              style={{
                fontSize: fontSize.xs,
                color: semanticColors.text.secondary,
                textTransform: 'capitalize'
              }}
            >
              {trend}
            </span>
          </div>
        </div>

        {/* Prediction badge */}
        {predictedNextHour !== undefined && (
          <div
            className="flex-shrink-0"
            style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: semanticColors.bg.primary,
              borderRadius: borderRadius.base,
              border: `1px solid ${semanticColors.border.focus}`
            }}
          >
            <div
              style={{
                fontSize: fontSize.xs,
                color: semanticColors.text.secondary
              }}
            >
              Next Hr
            </div>
            <div
              style={{
                fontSize: fontSize.sm,
                fontWeight: 'bold',
                color: semanticColors.border.focus
              }}
            >
              {predictedNextHour}%
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded variant - full display
  return (
    <div className="flex flex-col items-center">
      {/* Circular Energy Gauge */}
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={semanticColors.bg.secondary}
            strokeWidth="12"
          />

          {/* Energy progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getEnergyColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: shouldReduceMotion ? 'none' : 'all 1s ease-out'
            }}
          />

          {/* Glow effect - disabled if reduced motion */}
          {!shouldReduceMotion && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={getEnergyColor()}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              opacity="0.3"
              filter="blur(8px)"
              style={{
                transition: 'all 1s ease-out'
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            style={{
              fontSize: fontSize['4xl'],
              fontWeight: 'bold',
              color: getEnergyColor()
            }}
          >
            {energy}%
          </div>
          <div
            style={{
              fontSize: fontSize.sm,
              color: semanticColors.text.secondary,
              marginTop: spacing[1]
            }}
          >
            {getEnergyLevel()}
          </div>
        </div>

        {/* Breathing animation pulse - disabled if reduced motion */}
        {!shouldReduceMotion && (
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              opacity: 0.2,
              background: `radial-gradient(circle, ${getEnergyColor()} 0%, transparent 70%)`
            }}
          />
        )}
      </div>

      {/* Trend Indicator */}
      <div
        className="flex items-center"
        style={{
          marginTop: spacing[4],
          gap: spacing[2],
          padding: `${spacing[2]} ${spacing[4]}`,
          backgroundColor: semanticColors.bg.secondary,
          borderRadius: borderRadius.lg,
          border: `1px solid ${semanticColors.border.default}`
        }}
      >
        <span style={{ fontSize: fontSize.xl }}>{getTrendIcon()}</span>
        <div>
          <div
            style={{
              fontSize: fontSize.xs,
              color: semanticColors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Trend
          </div>
          <div
            style={{
              fontSize: fontSize.sm,
              color: semanticColors.text.primary,
              fontWeight: 500,
              textTransform: 'capitalize'
            }}
          >
            {trend}
          </div>
        </div>
      </div>

      {/* Prediction */}
      {predictedNextHour !== undefined && (
        <div
          style={{
            marginTop: spacing[3],
            padding: `${spacing[2]} ${spacing[4]}`,
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.lg,
            border: `1px solid ${semanticColors.border.default}`
          }}
        >
          <div
            style={{
              fontSize: fontSize.xs,
              color: semanticColors.text.secondary,
              textAlign: 'center',
              marginBottom: spacing[1]
            }}
          >
            Predicted in 1 hour
          </div>
          <div
            style={{
              fontSize: fontSize['2xl'],
              fontWeight: 'bold',
              color: semanticColors.border.focus,
              textAlign: 'center'
            }}
          >
            {predictedNextHour}%
          </div>
        </div>
      )}

      {/* Energy Tips */}
      <div
        style={{
          marginTop: spacing[4],
          padding: spacing[3],
          backgroundColor: semanticColors.bg.secondary,
          borderRadius: borderRadius.lg,
          border: `1px solid ${semanticColors.border.default}`,
          maxWidth: '320px'
        }}
      >
        <div
          style={{
            fontSize: fontSize.xs,
            color: semanticColors.text.secondary,
            marginBottom: spacing[2]
          }}
        >
          💡 AI Recommendation
        </div>
        {energy >= 70 && (
          <p
            style={{
              fontSize: fontSize.sm,
              color: semanticColors.text.primary,
              margin: 0
            }}
          >
            Your energy is high! Perfect for tackling challenging tasks in Hunter mode.
          </p>
        )}
        {energy >= 40 && energy < 70 && (
          <p
            style={{
              fontSize: fontSize.sm,
              color: semanticColors.text.primary,
              margin: 0
            }}
          >
            Moderate energy. Try medium-priority tasks or take micro-breaks between tasks.
          </p>
        )}
        {energy < 40 && (
          <p
            style={{
              fontSize: fontSize.sm,
              color: semanticColors.text.primary,
              margin: 0
            }}
          >
            Low energy detected. Focus on 5-min tasks or recovery activities to rebuild.
          </p>
        )}
      </div>
    </div>
  );
};

export default EnergyGauge;
