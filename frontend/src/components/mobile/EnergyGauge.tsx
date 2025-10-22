'use client'

import React from 'react';

interface EnergyGaugeProps {
  energy: number; // 0-100
  trend?: 'rising' | 'falling' | 'stable';
  predictedNextHour?: number;
}

const EnergyGauge: React.FC<EnergyGaugeProps> = ({
  energy,
  trend = 'stable',
  predictedNextHour
}) => {
  // Calculate stroke dash offset for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (energy / 100) * circumference;

  // Get color based on energy level
  const getEnergyColor = () => {
    if (energy >= 70) return '#859900'; // Green (high energy)
    if (energy >= 40) return '#b58900'; // Yellow (medium energy)
    return '#dc322f'; // Red (low energy)
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
            stroke="#073642"
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
            className="transition-all duration-1000 ease-out"
          />

          {/* Glow effect */}
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
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold" style={{ color: getEnergyColor() }}>
            {energy}%
          </div>
          <div className="text-sm text-[#586e75] mt-1">
            {getEnergyLevel()}
          </div>
        </div>

        {/* Breathing animation pulse */}
        <div
          className="absolute inset-0 rounded-full animate-pulse opacity-20"
          style={{
            background: `radial-gradient(circle, ${getEnergyColor()} 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Trend Indicator */}
      <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#073642] rounded-lg border border-[#586e75]">
        <span className="text-xl">{getTrendIcon()}</span>
        <div>
          <div className="text-xs text-[#586e75] uppercase tracking-wide">
            Trend
          </div>
          <div className="text-sm text-[#93a1a1] font-medium capitalize">
            {trend}
          </div>
        </div>
      </div>

      {/* Prediction */}
      {predictedNextHour !== undefined && (
        <div className="mt-3 px-4 py-2 bg-[#073642] rounded-lg border border-[#586e75]">
          <div className="text-xs text-[#586e75] text-center mb-1">
            Predicted in 1 hour
          </div>
          <div className="text-2xl font-bold text-[#268bd2] text-center">
            {predictedNextHour}%
          </div>
        </div>
      )}

      {/* Energy Tips */}
      <div className="mt-4 px-4 py-3 bg-[#073642] rounded-lg border border-[#586e75] max-w-xs">
        <div className="text-xs text-[#586e75] mb-2">💡 AI Recommendation</div>
        {energy >= 70 && (
          <p className="text-sm text-[#93a1a1]">
            Your energy is high! Perfect for tackling challenging tasks in Hunter mode.
          </p>
        )}
        {energy >= 40 && energy < 70 && (
          <p className="text-sm text-[#93a1a1]">
            Moderate energy. Try medium-priority tasks or take micro-breaks between tasks.
          </p>
        )}
        {energy < 40 && (
          <p className="text-sm text-[#93a1a1]">
            Low energy detected. Focus on 5-min tasks or recovery activities to rebuild.
          </p>
        )}
      </div>
    </div>
  );
};

export default EnergyGauge;
