'use client'

import React, { useState, useEffect } from 'react';
import AchievementGallery from '../../../components/mobile/AchievementGallery';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface MapperPageProps {
  xp: number;
  level: number;
  streakDays: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface WeeklyStats {
  tasksCompleted: number;
  xpEarned: number;
  focusMinutes: number;
  categoriesWorked: { [key: string]: number };
}

const MapperPage: React.FC<MapperPageProps> = ({ xp, level, streakDays }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    tasksCompleted: 0,
    xpEarned: 0,
    focusMinutes: 0,
    categoriesWorked: {}
  });
  const [showWeeklyTreasure, setShowWeeklyTreasure] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'reflection'>('overview');

  useEffect(() => {
    fetchAchievements();
    fetchWeeklyStats();
    checkWeeklyTreasure();
  }, []);

  const fetchAchievements = async () => {
    try {
      // Mock achievements for now - replace with real API call
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first task',
          icon: '🎯',
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          rarity: 'common'
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Maintain a 7-day streak',
          icon: '🔥',
          unlocked: streakDays >= 7,
          unlockedAt: streakDays >= 7 ? new Date().toISOString() : undefined,
          rarity: 'rare'
        },
        {
          id: '3',
          name: 'Level Up!',
          description: 'Reach level 5',
          icon: '⭐',
          unlocked: level >= 5,
          unlockedAt: level >= 5 ? new Date().toISOString() : undefined,
          rarity: 'epic'
        },
        {
          id: '4',
          name: 'The Legend',
          description: 'Earn 10,000 XP',
          icon: '👑',
          unlocked: xp >= 10000,
          unlockedAt: xp >= 10000 ? new Date().toISOString() : undefined,
          rarity: 'legendary'
        }
      ];

      setAchievements(mockAchievements);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/progress/weekly-stats?user_id=mobile-user`);
      if (response.ok) {
        const data = await response.json();
        setWeeklyStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch weekly stats:', err);
    }
  };

  const checkWeeklyTreasure = () => {
    // Check if it's Sunday (end of week) for weekly treasure
    const today = new Date().getDay();
    const hasCompletedWeeklyGoal = weeklyStats.tasksCompleted >= 20;

    if (today === 0 && hasCompletedWeeklyGoal) {
      setShowWeeklyTreasure(true);
    }
  };

  // Calculate XP needed for next level
  const xpForNextLevel = level * 100;
  const xpProgress = (xp % xpForNextLevel) / xpForNextLevel * 100;

  return (
    <div className="h-full overflow-y-auto snap-y snap-mandatory">
      {/* Header & Tab Navigation - Snap Section */}
      <div className="min-h-screen snap-start flex flex-col">
        {/* Mapper Mode Header */}
        <div className="px-4 py-4 border-b border-[#073642] bg-gradient-to-r from-[#6c71c4]/20 to-[#d33682]/20">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🗺️</span>
          <div>
            <h2 className="text-xl font-bold text-[#93a1a1]">Mapper Mode</h2>
            <p className="text-sm text-[#586e75]">
              Consolidate memory & recalibrate priorities
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#073642] border-b border-[#586e75]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'overview'
              ? 'bg-[#268bd2] text-[#fdf6e3]'
              : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'achievements'
              ? 'bg-[#268bd2] text-[#fdf6e3]'
              : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
          }`}
        >
          🏆 Achievements
        </button>
        <button
          onClick={() => setActiveTab('reflection')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'reflection'
              ? 'bg-[#268bd2] text-[#fdf6e3]'
              : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
          }`}
        >
          💭 Reflect
        </button>
      </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto snap-y snap-mandatory">
              {/* Level & XP - Snap Section */}
              <div className="min-h-screen snap-start flex flex-col px-4 py-6">
          {/* Level & XP Card */}
          <div className="p-4 bg-gradient-to-br from-[#268bd2]/20 to-[#2aa198]/20 rounded-xl border-2 border-[#268bd2]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-[#586e75] uppercase tracking-wide">Level</div>
                <div className="text-3xl font-bold text-[#268bd2]">{level}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#586e75] uppercase tracking-wide">Total XP</div>
                <div className="text-2xl font-bold text-[#93a1a1]">{xp.toLocaleString()}</div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#586e75]">Progress to Level {level + 1}</span>
                <span className="text-xs text-[#586e75]">{Math.round(xpProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-[#002b36] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#268bd2] to-[#2aa198] transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-[#586e75] text-center">
              {xpForNextLevel - (xp % xpForNextLevel)} XP to next level
            </div>
          </div>

                {/* Scroll hint */}
                <div className="flex-1 flex items-end justify-center pb-4 mt-4">
                  <div className="text-[#586e75] text-xs animate-bounce">
                    ↓ Swipe to see streak
                  </div>
                </div>
              </div>

              {/* Streak - Snap Section */}
              <div className="min-h-screen snap-start flex flex-col px-4 py-6">
                {/* Streak Card */}
                <div className="p-4 bg-gradient-to-br from-[#cb4b16]/20 to-[#dc322f]/20 rounded-xl border-2 border-[#dc322f]">
            <div className="flex items-center gap-3">
              <span className="text-5xl">🔥</span>
              <div>
                <div className="text-xs text-[#586e75] uppercase tracking-wide">Current Streak</div>
                <div className="text-3xl font-bold text-[#dc322f]">{streakDays} days</div>
                <div className="text-xs text-[#586e75] mt-1">Keep it going!</div>
              </div>
            </div>
          </div>

                {/* Scroll hint */}
                <div className="flex-1 flex items-end justify-center pb-4 mt-4">
                  <div className="text-[#586e75] text-xs animate-bounce">
                    ↓ Swipe for weekly stats
                  </div>
                </div>
              </div>

              {/* Weekly Stats - Snap Section */}
              <div className="min-h-screen snap-start flex flex-col px-4 py-6">
                {/* Weekly Stats */}
                <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#586e75]">
            <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
              <span>📈</span>
              <span>This Week</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#268bd2]">
                  {weeklyStats.tasksCompleted}
                </div>
                <div className="text-xs text-[#586e75] mt-1">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#859900]">
                  {weeklyStats.xpEarned}
                </div>
                <div className="text-xs text-[#586e75] mt-1">XP Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#b58900]">
                  {weeklyStats.focusMinutes}m
                </div>
                <div className="text-xs text-[#586e75] mt-1">Focus Time</div>
              </div>
            </div>
          </div>

                {/* Category Breakdown */}
                {Object.keys(weeklyStats.categoriesWorked).length > 0 && (
                  <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#586e75] mt-4">
              <h3 className="text-sm font-bold text-[#93a1a1] mb-3">Category Breakdown</h3>
              {Object.entries(weeklyStats.categoriesWorked).map(([category, count]) => (
                <div key={category} className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#93a1a1] capitalize">{category}</span>
                    <span className="text-xs text-[#586e75]">{count} tasks</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#002b36] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#268bd2]"
                      style={{
                        width: `${(count / weeklyStats.tasksCompleted) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
                )}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="h-full overflow-y-auto">
              <AchievementGallery achievements={achievements} />
            </div>
          )}

          {/* Reflection Tab */}
          {activeTab === 'reflection' && (
            <div className="h-full overflow-y-auto snap-y snap-mandatory">
              <div className="min-h-screen snap-start flex flex-col px-4 py-6">
          <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#586e75]">
            <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
              <span>💭</span>
              <span>Weekly Reflection</span>
            </h3>

            {/* Reflection Prompts */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#586e75] block mb-2">
                  What went well this week?
                </label>
                <textarea
                  className="w-full p-3 bg-[#002b36] text-[#93a1a1] rounded-lg border border-[#586e75] text-sm resize-none focus:outline-none focus:border-[#268bd2]"
                  rows={3}
                  placeholder="Celebrate your wins..."
                />
              </div>

              <div>
                <label className="text-xs text-[#586e75] block mb-2">
                  What could be improved?
                </label>
                <textarea
                  className="w-full p-3 bg-[#002b36] text-[#93a1a1] rounded-lg border border-[#586e75] text-sm resize-none focus:outline-none focus:border-[#268bd2]"
                  rows={3}
                  placeholder="Areas for growth..."
                />
              </div>

              <div>
                <label className="text-xs text-[#586e75] block mb-2">
                  Next week's focus
                </label>
                <textarea
                  className="w-full p-3 bg-[#002b36] text-[#93a1a1] rounded-lg border border-[#586e75] text-sm resize-none focus:outline-none focus:border-[#268bd2]"
                  rows={3}
                  placeholder="What will you prioritize?"
                />
              </div>

              <button className="w-full py-3 bg-[#268bd2] text-[#fdf6e3] font-bold rounded-lg hover:bg-[#2aa198] transition-colors">
                Save Reflection
              </button>
            </div>
          </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Treasure Modal */}
      {showWeeklyTreasure && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#b58900] via-[#cb4b16] to-[#d33682] rounded-2xl p-6 max-w-sm w-full border-2 border-[#b58900] shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🏆</div>
              <h3 className="text-2xl font-bold text-[#fdf6e3] mb-2">
                Weekly Treasure Unlocked!
              </h3>
              <p className="text-[#fdf6e3] mb-4">
                You completed {weeklyStats.tasksCompleted} tasks this week!
              </p>
              <div className="p-4 bg-[#fdf6e3] rounded-lg">
                <div className="text-4xl mb-2">⚡</div>
                <p className="text-[#073642] font-bold text-lg">
                  Power-Up Week Pass
                </p>
                <p className="text-[#586e75] text-sm mt-1">
                  2x XP for all tasks next week
                </p>
              </div>
              <button
                onClick={() => setShowWeeklyTreasure(false)}
                className="mt-4 px-6 py-2 bg-[#fdf6e3] text-[#073642] font-bold rounded-lg hover:bg-[#eee8d5] transition-colors"
              >
                Claim Treasure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapperPage;
