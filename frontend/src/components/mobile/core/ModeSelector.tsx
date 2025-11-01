'use client'

import React from 'react';
import { Sparkles, Search, Target, Heart, Map } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors } from '@/lib/design-system';

type Mode = 'capture' | 'scout' | 'hunter' | 'mender' | 'mapper';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  energy: number;
  taskCount: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface ModeCard {
  id: Mode;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgGradient: string;
  description: string;
  isOptimal: boolean;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  energy,
  taskCount,
  timeOfDay
}) => {
  // Define mode cards with optimal timing
  const modes: ModeCard[] = [
    {
      id: 'capture',
      name: 'Capture',
      icon: Sparkles,
      color: '#2aa198',
      bgGradient: 'linear-gradient(135deg, #2aa198 0%, #268bd2 100%)',
      description: 'Quick thought capture',
      isOptimal: true // Always optimal
    },
    {
      id: 'scout',
      name: 'Scout',
      icon: Search,
      color: '#859900',
      bgGradient: 'linear-gradient(135deg, #859900 0%, #2aa198 100%)',
      description: 'Find doable targets',
      isOptimal: timeOfDay === 'morning' || (timeOfDay === 'afternoon' && energy > 60)
    },
    {
      id: 'hunter',
      name: 'Hunter',
      icon: Target,
      color: '#dc322f',
      bgGradient: 'linear-gradient(135deg, #dc322f 0%, #cb4b16 100%)',
      description: 'Enter pursuit flow',
      isOptimal: timeOfDay === 'morning' || energy > 70
    },
    {
      id: 'mender',
      name: 'Mender',
      icon: Heart,
      color: '#268bd2',
      bgGradient: 'linear-gradient(135deg, #268bd2 0%, #6c71c4 100%)',
      description: 'Recover & rebuild',
      isOptimal: timeOfDay === 'afternoon' || energy < 40
    },
    {
      id: 'mapper',
      name: 'Mapper',
      icon: Map,
      color: '#6c71c4',
      bgGradient: 'linear-gradient(135deg, #6c71c4 0%, #d33682 100%)',
      description: 'Consolidate & plan',
      isOptimal: timeOfDay === 'evening' || timeOfDay === 'night'
    }
  ];

  // Get recommended mode based on context
  const getRecommendedMode = (): Mode => {
    if (energy < 30) return 'mender';
    if (timeOfDay === 'morning' && energy > 70) return 'hunter';
    if (timeOfDay === 'evening' || timeOfDay === 'night') return 'mapper';
    if (taskCount === 0) return 'capture';
    return 'scout';
  };

  const recommendedMode = getRecommendedMode();

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: semanticColors.bg.primary, padding: spacing[4] }}>
      {/* Summary Tile */}
      <div
        className="mb-6"
        style={{
          background: semanticColors.bg.secondary,
          borderRadius: borderRadius.xl,
          padding: spacing[4],
          border: `2px solid ${semanticColors.border.accent}`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
              {timeOfDay === 'morning' && '☀️ Good morning'}
              {timeOfDay === 'afternoon' && '🌤️ Good afternoon'}
              {timeOfDay === 'evening' && '🌅 Good evening'}
              {timeOfDay === 'night' && '🌙 Good night'}
            </div>
            <h2 style={{ fontSize: fontSize['2xl'], fontWeight: 'bold', color: semanticColors.text.primary }}>
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'} ready
            </h2>
          </div>

          {/* Energy Indicator */}
          <div className="flex flex-col items-center">
            <div
              className="relative"
              style={{
                width: spacing[16],
                height: spacing[16],
                borderRadius: borderRadius.full,
                background: `conic-gradient(${semanticColors.accent.primary} ${energy}%, ${semanticColors.bg.primary} ${energy}%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: spacing[12],
                  height: spacing[12],
                  borderRadius: borderRadius.full,
                  backgroundColor: semanticColors.bg.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: fontSize.lg,
                  fontWeight: 'bold',
                  color: semanticColors.text.primary
                }}
              >
                {energy}%
              </div>
            </div>
            <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1] }}>
              Energy
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div
          style={{
            background: `${semanticColors.accent.warning}20`,
            borderRadius: borderRadius.base,
            padding: spacing[2],
            border: `1px solid ${semanticColors.accent.warning}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}
        >
          <span style={{ fontSize: fontSize.lg }}>💡</span>
          <span style={{ fontSize: fontSize.xs, color: semanticColors.text.primary }}>
            Recommended: <strong>{modes.find(m => m.id === recommendedMode)?.name}</strong>
          </span>
        </div>
      </div>

      {/* Mode Cards Grid */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3] }}>
          {modes.map((mode) => {
            const IconComponent = mode.icon;
            const isActive = currentMode === mode.id;
            const isRecommended = recommendedMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className="relative transition-all active:scale-95"
                style={{
                  background: isActive ? mode.bgGradient : semanticColors.bg.secondary,
                  borderRadius: borderRadius.xl,
                  padding: spacing[4],
                  border: isActive
                    ? `3px solid ${mode.color}`
                    : isRecommended
                    ? `2px solid ${semanticColors.accent.warning}`
                    : `2px solid ${semanticColors.border.default}`,
                  minHeight: spacing[32],
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: isActive ? `0 8px 16px ${mode.color}40` : 'none',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                {/* Optimal indicator */}
                {mode.isOptimal && !isActive && (
                  <div
                    className="absolute animate-pulse"
                    style={{
                      top: spacing[2],
                      right: spacing[2],
                      width: spacing[2],
                      height: spacing[2],
                      borderRadius: borderRadius.full,
                      backgroundColor: semanticColors.accent.success
                    }}
                  />
                )}

                {/* Recommended badge */}
                {isRecommended && !isActive && (
                  <div
                    className="absolute"
                    style={{
                      top: spacing[2],
                      left: spacing[2],
                      fontSize: fontSize.xs,
                      backgroundColor: semanticColors.accent.warning,
                      color: semanticColors.bg.primary,
                      padding: `${spacing[1]} ${spacing[2]}`,
                      borderRadius: borderRadius.full,
                      fontWeight: 'bold'
                    }}
                  >
                    ✨
                  </div>
                )}

                {/* Icon */}
                <div style={{ marginBottom: spacing[2] }}>
                  <IconComponent
                    size={iconSize['2xl']}
                    style={{ color: isActive ? semanticColors.text.inverse : mode.color }}
                  />
                </div>

                {/* Mode Name */}
                <div
                  style={{
                    fontSize: fontSize.base,
                    fontWeight: 'bold',
                    color: isActive ? semanticColors.text.inverse : semanticColors.text.primary,
                    marginBottom: spacing[1]
                  }}
                >
                  {mode.name}
                </div>

                {/* Description */}
                <div
                  style={{
                    fontSize: fontSize.xs,
                    color: isActive ? `${semanticColors.text.inverse}CC` : semanticColors.text.secondary
                  }}
                >
                  {mode.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
