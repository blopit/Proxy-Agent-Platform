'use client'

import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Flame, Award } from 'lucide-react';
import CompassView from './CompassView';
import { colors, semanticColors, spacing, fontSize, borderRadius } from '@/lib/design-system';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ProgressViewProps {
  userId?: string;
}

interface UserProgress {
  total_xp: number;
  current_level: number;
  xp_for_next_level: number;
  xp_progress_percent: number;
  current_streak: number;
  longest_streak: number;
  total_tasks_completed: number;
}

const ProgressView: React.FC<ProgressViewProps> = ({
  userId = 'mobile-user'
}) => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'compass'>('overview');

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/gamification/progress?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setProgress(data);
    } catch (err) {
      console.warn('Failed to fetch progress:', err);
      // Set defaults
      setProgress({
        total_xp: 0,
        current_level: 1,
        xp_for_next_level: 100,
        xp_progress_percent: 0,
        current_streak: 0,
        longest_streak: 0,
        total_tasks_completed: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !progress) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p style={{ color: semanticColors.text.secondary }}>Loading progress...</p>
        </div>
      </div>
    );
  }

  if (activeView === 'compass') {
    return (
      <div className="h-full flex flex-col">
        {/* Back button */}
        <div
          className="flex-shrink-0 px-4 py-3 border-b"
          style={{
            backgroundColor: semanticColors.bg.secondary,
            borderColor: semanticColors.border.default
          }}
        >
          <button
            onClick={() => setActiveView('overview')}
            className="text-sm font-medium"
            style={{ color: colors.cyan }}
          >
            ← Back to Progress
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <CompassView userId={userId} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ backgroundColor: semanticColors.bg.primary }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3 border-b"
        style={{
          backgroundColor: semanticColors.bg.secondary,
          borderColor: semanticColors.border.default
        }}
      >
        <div className="flex items-center gap-3">
          <TrendingUp size={24} style={{ color: colors.violet }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: semanticColors.text.primary }}>
              Progress
            </h2>
            <p className="text-xs" style={{ color: semanticColors.text.secondary }}>
              Your stats and achievements
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Level & XP Card */}
        <div
          className="rounded-lg p-4"
          style={{
            background: `linear-gradient(135deg, ${colors.violet}15, ${colors.blue}15)`,
            border: `1px solid ${colors.violet}40`,
            borderRadius: borderRadius.lg
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award size={20} style={{ color: colors.violet }} />
                <span className="text-sm font-medium" style={{ color: semanticColors.text.secondary }}>
                  Level
                </span>
              </div>
              <div className="text-3xl font-bold" style={{ color: colors.violet }}>
                {progress.current_level}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm" style={{ color: semanticColors.text.secondary }}>
                Total XP
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.yellow }}>
                {progress.total_xp}
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: semanticColors.text.secondary }}>
                Progress to Level {progress.current_level + 1}
              </span>
              <span style={{ color: colors.violet, fontWeight: 600 }}>
                {Math.round(progress.xp_progress_percent)}%
              </span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: semanticColors.bg.primary }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${progress.xp_progress_percent}%`,
                  background: `linear-gradient(to right, ${colors.violet}, ${colors.blue})`
                }}
              />
            </div>
            <div className="text-xs mt-1 text-center" style={{ color: semanticColors.text.muted }}>
              {progress.xp_for_next_level - Math.floor((progress.xp_for_next_level * progress.xp_progress_percent) / 100)} XP to next level
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div
          className="rounded-lg p-4"
          style={{
            background: `linear-gradient(135deg, ${colors.red}15, ${colors.orange}15)`,
            border: `1px solid ${colors.red}40`,
            borderRadius: borderRadius.lg
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={20} style={{ color: colors.red }} />
                <span className="text-sm font-medium" style={{ color: semanticColors.text.secondary }}>
                  Current Streak
                </span>
              </div>
              <div className="text-3xl font-bold" style={{ color: colors.red }}>
                {progress.current_streak} days
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm" style={{ color: semanticColors.text.secondary }}>
                Longest
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.orange }}>
                {progress.longest_streak}
              </div>
            </div>
          </div>

          {progress.current_streak === 0 && (
            <div className="mt-3 text-xs text-center" style={{ color: semanticColors.text.muted }}>
              Complete a task today to start your streak!
            </div>
          )}
        </div>

        {/* Tasks Completed Card */}
        <div
          className="rounded-lg p-4"
          style={{
            background: `linear-gradient(135deg, ${colors.green}15, ${colors.cyan}15)`,
            border: `1px solid ${colors.green}40`,
            borderRadius: borderRadius.lg
          }}
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap size={20} style={{ color: colors.green }} />
              <span className="text-sm font-medium" style={{ color: semanticColors.text.secondary }}>
                Total Tasks Completed
              </span>
            </div>
            <div className="text-4xl font-bold" style={{ color: colors.green }}>
              {progress.total_tasks_completed}
            </div>
            <div className="text-xs mt-2" style={{ color: semanticColors.text.muted }}>
              Keep up the momentum!
            </div>
          </div>
        </div>

        {/* Compass Zones Preview */}
        <div
          className="rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02]"
          onClick={() => setActiveView('compass')}
          style={{
            backgroundColor: semanticColors.bg.secondary,
            border: `2px solid ${semanticColors.border.accent}`,
            borderRadius: borderRadius.lg
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧭</span>
              <div>
                <h3 className="text-base font-bold" style={{ color: semanticColors.text.primary }}>
                  Compass Zones
                </h3>
                <p className="text-xs" style={{ color: semanticColors.text.secondary }}>
                  View your life balance
                </p>
              </div>
            </div>
            <div className="text-2xl" style={{ color: semanticColors.text.muted }}>
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressView;
