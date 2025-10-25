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
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'reflection' | 'rituals' | 'vision'>('overview');

  // Time of day detection for rituals
  const getTimeOfDay = (): 'morning' | 'midday' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 15) return 'midday';
    if (hour >= 18 && hour < 23) return 'evening';
    return 'night';
  };

  const [currentTimeOfDay, setCurrentTimeOfDay] = useState(getTimeOfDay());

  // Ritual state
  const [morningEnergy, setMorningEnergy] = useState(7);
  const [dailyIntention, setDailyIntention] = useState('');
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [middayEnergy, setMiddayEnergy] = useState(5);
  const [onTrack, setOnTrack] = useState<boolean | null>(null);
  const [brainDump, setBrainDump] = useState('');
  const [tomorrowIntention, setTomorrowIntention] = useState('');
  const [completedToday, setCompletedToday] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState({ tasks: 0, focusMinutes: 0, xp: 0 });
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);

  // Vision state
  const [focusAreas, setFocusAreas] = useState([
    { id: '1', emoji: '💪', name: 'Health', why: 'I want to feel energized and strong every day' },
    { id: '2', emoji: '💼', name: 'Work', why: 'I want to build meaningful things that help people' },
    { id: '3', emoji: '❤️', name: 'Relationships', why: 'I want to nurture deep connections with loved ones' }
  ]);
  const [quarterlyTheme, setQuarterlyTheme] = useState({
    quarter: 'Q4 2025',
    theme: 'Build & Launch',
    description: 'This quarter is about taking ideas from concept to reality'
  });
  const [yourWhy, setYourWhy] = useState(
    'I want to create systems that help people with ADHD thrive, because I know how it feels to struggle with executive function. Every tool I build is a love letter to my younger self.'
  );
  const [coreValues, setCoreValues] = useState([
    '🎯 Intentionality',
    '🤝 Authenticity',
    '🌱 Growth',
    '❤️ Compassion'
  ]);

  useEffect(() => {
    fetchAchievements();
    fetchWeeklyStats();
    checkWeeklyTreasure();

    // Load ritual data from localStorage
    loadRitualData();

    // Load vision data from localStorage
    loadVisionData();

    // Fetch real task data for rituals
    fetchUrgentTasks(); // For morning ritual
    fetchTodayCompletedTasks(); // For evening closure

    // Auto-open Rituals tab during ritual times
    const timeOfDay = getTimeOfDay();
    if ((timeOfDay === 'morning' || timeOfDay === 'evening') && activeTab !== 'rituals') {
      // Check if ritual was already completed today
      const lastRitual = localStorage.getItem('lastRitualDate');
      const today = new Date().toDateString();
      if (lastRitual !== today) {
        setActiveTab('rituals');
      }
    }
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

  // Load ritual data from localStorage
  const loadRitualData = () => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('ritualData');
      if (saved) {
        const data = JSON.parse(saved);
        setMorningEnergy(data.morningEnergy || 7);
        setDailyIntention(data.dailyIntention || '');
        setSelectedModes(data.selectedModes || []);
        setBrainDump(data.brainDump || '');
        setTomorrowIntention(data.tomorrowIntention || '');
      }
    } catch (error) {
      console.warn('Failed to load ritual data:', error);
    }
  };

  // Save ritual data to localStorage
  const saveRitualData = () => {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        morningEnergy,
        dailyIntention,
        selectedModes,
        brainDump,
        tomorrowIntention,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('ritualData', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save ritual data:', error);
    }
  };

  // Load vision data from localStorage
  const loadVisionData = () => {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('visionData');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.focusAreas) setFocusAreas(data.focusAreas);
        if (data.quarterlyTheme) setQuarterlyTheme(data.quarterlyTheme);
        if (data.yourWhy) setYourWhy(data.yourWhy);
        if (data.coreValues) setCoreValues(data.coreValues);
      }
    } catch (error) {
      console.warn('Failed to load vision data:', error);
    }
  };

  // Save vision data to localStorage
  const saveVisionData = () => {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        focusAreas,
        quarterlyTheme,
        yourWhy,
        coreValues,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('visionData', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save vision data:', error);
    }
  };

  // Handle "Start My Day" button
  const handleStartDay = () => {
    saveRitualData();
    localStorage.setItem('lastRitualDate', new Date().toDateString());
    // TODO: Navigate to Hunt mode or show success message
    alert('Day started! Your intention has been saved. 🌅');
  };

  // Handle "Close My Day" button
  const handleCloseDay = () => {
    saveRitualData();
    localStorage.setItem('lastRitualDate', new Date().toDateString());
    alert('Day closed! Sleep well and see you tomorrow. 🌙');
  };

  // Toggle mode selection
  const toggleMode = (mode: string) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };

  // Fetch urgent tasks for morning ritual
  const fetchUrgentTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/tasks?limit=3&user_id=mobile-user&priority=high&status=TODO`);
      if (response.ok) {
        const data = await response.json();
        const tasks = data.tasks || data || [];
        setUrgentTasks(tasks.slice(0, 3));
      } else {
        // Fallback to mock data
        setUrgentTasks([
          { title: 'Review project proposal', priority: 'high' },
          { title: 'Call dentist', priority: 'high' },
          { title: 'Submit expense report', priority: 'high' }
        ]);
      }
    } catch (error) {
      console.warn('Failed to fetch urgent tasks, using defaults:', error);
      setUrgentTasks([
        { title: 'Review project proposal', priority: 'high' },
        { title: 'Call dentist', priority: 'high' },
        { title: 'Submit expense report', priority: 'high' }
      ]);
    }
  };

  // Fetch today's completed tasks for evening closure
  const fetchTodayCompletedTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/tasks?user_id=mobile-user&status=COMPLETED`);
      if (response.ok) {
        const data = await response.json();
        const tasks = data.tasks || data || [];
        // Filter for today's completions
        const today = new Date().toDateString();
        const todayTasks = tasks.filter((task: any) => {
          if (task.completed_at) {
            const completedDate = new Date(task.completed_at).toDateString();
            return completedDate === today;
          }
          return false;
        });
        setCompletedToday(todayTasks.slice(0, 5)); // Show max 5

        // Calculate stats
        const totalTasks = todayTasks.length;
        const totalMinutes = todayTasks.reduce((sum: number, task: any) =>
          sum + (task.estimated_hours ? task.estimated_hours * 60 : 0), 0
        );
        const totalXP = todayTasks.reduce((sum: number, task: any) =>
          sum + (task.xp_earned || 50), 0
        );

        setTodayStats({
          tasks: totalTasks,
          focusMinutes: Math.round(totalMinutes),
          xp: totalXP
        });
      } else {
        // Fallback to mock data
        setCompletedToday([
          { title: 'Replied to client email', completed_at: new Date() },
          { title: 'Finished project draft', completed_at: new Date() },
          { title: 'Called dentist', completed_at: new Date() }
        ]);
        setTodayStats({ tasks: 7, focusMinutes: 45, xp: 350 });
      }
    } catch (error) {
      console.warn('Failed to fetch completed tasks, using defaults:', error);
      setCompletedToday([
        { title: 'Replied to client email', completed_at: new Date() },
        { title: 'Finished project draft', completed_at: new Date() },
        { title: 'Called dentist', completed_at: new Date() }
      ]);
      setTodayStats({ tasks: 7, focusMinutes: 45, xp: 350 });
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

      {/* Tab Navigation - Scrollable for 5 tabs */}
      <div className="overflow-x-auto px-4 py-3 bg-[#073642] border-b border-[#586e75]">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#268bd2] text-[#fdf6e3]'
                : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'bg-[#268bd2] text-[#fdf6e3]'
                : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
            }`}
          >
            🏆 Achievements
          </button>
          <button
            onClick={() => setActiveTab('reflection')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'reflection'
                ? 'bg-[#268bd2] text-[#fdf6e3]'
                : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
            }`}
          >
            💭 Reflect
          </button>
          <button
            onClick={() => setActiveTab('rituals')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
              activeTab === 'rituals'
                ? 'bg-[#268bd2] text-[#fdf6e3]'
                : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
            }`}
          >
            {currentTimeOfDay === 'morning' ? '🌅' : currentTimeOfDay === 'evening' ? '🌙' : '☀️'} Rituals
            {/* Time badge indicator */}
            {(currentTimeOfDay === 'morning' || currentTimeOfDay === 'evening') && activeTab !== 'rituals' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#b58900] rounded-full animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'vision'
                ? 'bg-[#268bd2] text-[#fdf6e3]'
                : 'bg-[#002b36] text-[#586e75] border border-[#586e75]'
            }`}
          >
            🧭 Vision
          </button>
        </div>
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

          {/* Rituals Tab - Time-aware content */}
          {activeTab === 'rituals' && (
            <div className="h-full overflow-y-auto">
              <div className="px-4 py-6">
                {/* Morning Reset (6am-11am) */}
                {currentTimeOfDay === 'morning' && (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-3 animate-bounce">🌅</div>
                      <h2 className="text-2xl font-bold text-[#93a1a1] mb-2">Morning Reset</h2>
                      <p className="text-sm text-[#586e75]">Set your intention for the day</p>
                    </div>

                    {/* Energy Check-in */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#cb4b16]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">⚡ Energy Check-in</h3>
                      <p className="text-xs text-[#586e75] mb-3">How's your energy right now?</p>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={morningEnergy}
                        onChange={(e) => setMorningEnergy(Number(e.target.value))}
                        className="w-full h-2 bg-[#002b36] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-[#586e75] mt-1">
                        <span>Low (0)</span>
                        <span className="font-bold text-[#93a1a1]">{morningEnergy}/10</span>
                        <span>High (10)</span>
                      </div>
                    </div>

                    {/* Daily Intention */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#268bd2]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">🎯 Today's Intention</h3>
                      <p className="text-xs text-[#586e75] mb-3">What's ONE thing you want to accomplish today?</p>
                      <input
                        type="text"
                        value={dailyIntention}
                        onChange={(e) => setDailyIntention(e.target.value)}
                        className="w-full p-3 bg-[#002b36] text-[#93a1a1] rounded-lg border border-[#586e75] text-sm focus:outline-none focus:border-[#268bd2]"
                        placeholder="My main focus today is..."
                      />
                    </div>

                    {/* Quick Task Review */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#859900]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">📋 What's Calling for Attention</h3>
                      <p className="text-xs text-[#586e75] mb-3">
                        {urgentTasks.length > 0
                          ? `${urgentTasks.length} tasks that need you today:`
                          : 'No urgent tasks today!'}
                      </p>
                      <div className="space-y-2">
                        {urgentTasks.length > 0 ? (
                          urgentTasks.map((task, index) => (
                            <div key={index} className="p-2 bg-[#002b36] rounded-lg text-xs text-[#93a1a1]">
                              • {task.title}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 bg-[#002b36] rounded-lg text-xs text-[#586e75] italic text-center">
                            Looks like you're all caught up! 🎉
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mood/Context Tags */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#6c71c4]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">🎨 Set Your Mode</h3>
                      <p className="text-xs text-[#586e75] mb-3">How do you want to approach today?</p>
                      <div className="flex flex-wrap gap-2">
                        {['🎯 Focused', '💬 Social', '🎨 Creative', '🔋 Low Energy'].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => toggleMode(mode)}
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                              selectedModes.includes(mode)
                                ? 'bg-[#268bd2] text-[#fdf6e3] border-[#268bd2]'
                                : 'bg-[#002b36] text-[#93a1a1] border-[#586e75] hover:bg-[#268bd2] hover:text-[#fdf6e3]'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Yesterday's Win */}
                    <div className="p-4 bg-gradient-to-br from-[#859900]/20 to-[#268bd2]/20 rounded-xl border-2 border-[#859900]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-2">🎉 Yesterday's Wins</h3>
                      <p className="text-xs text-[#586e75]">You completed 5 tasks yesterday!</p>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={handleStartDay}
                      className="w-full py-4 bg-gradient-to-r from-[#cb4b16] to-[#dc322f] text-[#fdf6e3] font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      Start My Day ✨
                    </button>
                  </div>
                )}

                {/* Midday Checkpoint (11am-3pm) */}
                {currentTimeOfDay === 'midday' && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-3">☀️</div>
                      <h2 className="text-2xl font-bold text-[#93a1a1] mb-2">Midday Checkpoint</h2>
                      <p className="text-sm text-[#586e75]">Quick check-in</p>
                    </div>

                    {/* On Track? */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#b58900]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">📍 How's it going?</h3>
                      <p className="text-xs text-[#586e75] mb-3">Still on track with your intention?</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setOnTrack(true)}
                          className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                            onTrack === true
                              ? 'bg-[#859900] text-[#fdf6e3] scale-105'
                              : 'bg-[#002b36] text-[#859900] border border-[#859900]'
                          }`}
                        >
                          👍 On Track
                        </button>
                        <button
                          onClick={() => setOnTrack(false)}
                          className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                            onTrack === false
                              ? 'bg-[#dc322f] text-[#fdf6e3] scale-105'
                              : 'bg-[#002b36] text-[#dc322f] border border-[#dc322f]'
                          }`}
                        >
                          👎 Need Adjust
                        </button>
                      </div>
                    </div>

                    {/* Energy Recheck */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#268bd2]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">⚡ Energy Level</h3>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={middayEnergy}
                        onChange={(e) => setMiddayEnergy(Number(e.target.value))}
                        className="w-full h-2 bg-[#002b36] rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-center text-xs text-[#93a1a1] font-bold mt-1">
                        {middayEnergy}/10
                      </div>
                    </div>

                    {/* Quick Win Suggestion */}
                    <div className="p-4 bg-gradient-to-br from-[#2aa198]/20 to-[#268bd2]/20 rounded-xl border-2 border-[#2aa198]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-2">⚡ Quick Win Available</h3>
                      <p className="text-xs text-[#586e75] mb-3">You have 3 tasks under 2 minutes</p>
                      <button className="w-full py-2 bg-[#2aa198] text-[#fdf6e3] rounded-lg font-bold text-sm">
                        Show Quick Wins
                      </button>
                    </div>
                  </div>
                )}

                {/* Evening Closure (6pm-11pm) */}
                {currentTimeOfDay === 'evening' && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-3 animate-pulse">🌙</div>
                      <h2 className="text-2xl font-bold text-[#93a1a1] mb-2">Evening Closure</h2>
                      <p className="text-sm text-[#586e75]">Wind down & clear your mind</p>
                    </div>

                    {/* Today's Celebration */}
                    <div className="p-4 bg-gradient-to-br from-[#859900]/20 to-[#268bd2]/20 rounded-xl border-2 border-[#859900]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">🎉 You Completed Today</h3>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#859900]">{todayStats.tasks}</div>
                          <div className="text-xs text-[#586e75]">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#268bd2]">{todayStats.focusMinutes}m</div>
                          <div className="text-xs text-[#586e75]">Focus Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#b58900]">{todayStats.xp}</div>
                          <div className="text-xs text-[#586e75]">XP</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {completedToday.length > 0 ? (
                          completedToday.map((task, index) => (
                            <div key={index} className="p-2 bg-[#002b36] rounded-lg text-xs text-[#93a1a1] flex items-center gap-2">
                              <span className="text-base">✅</span> {task.title}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 bg-[#002b36] rounded-lg text-xs text-[#586e75] italic text-center">
                            No tasks completed today yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Brain Dump */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#6c71c4]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">🧠 Brain Dump</h3>
                      <p className="text-xs text-[#586e75] mb-3">What's still on your mind?</p>
                      <textarea
                        value={brainDump}
                        onChange={(e) => setBrainDump(e.target.value)}
                        className="w-full p-3 bg-[#002b36] text-[#93a1a1] rounded-lg border border-[#586e75] text-sm resize-none focus:outline-none focus:border-[#6c71c4]"
                        rows={4}
                        placeholder="Get it out of your head..."
                      />
                    </div>

                    {/* Tomorrow's Intention */}
                    <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#268bd2]">
                      <h3 className="text-sm font-bold text-[#93a1a1] mb-3">🌅 Tomorrow's Intention</h3>
                      <p className="text-xs text-[#586e75] mb-3">What's ONE thing for tomorrow?</p>
                      <input
                        type="text"
                        value={tomorrowIntention}
                        onChange={(e) => setTomorrowIntention(e.target.value)}
                        className="w-full p-3 bg-[#002b36] text-[#93a1a1] rounded-lg border border-[#586e75] text-sm focus:outline-none focus:border-[#268bd2]"
                        placeholder="Tomorrow I will..."
                      />
                    </div>

                    {/* Close Day Button */}
                    <button
                      onClick={handleCloseDay}
                      className="w-full py-4 bg-gradient-to-r from-[#6c71c4] to-[#d33682] text-[#fdf6e3] font-bold rounded-xl text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      Close My Day 🌙
                    </button>
                  </div>
                )}

                {/* Night (11pm-6am) - Different message */}
                {currentTimeOfDay === 'night' && (
                  <div className="space-y-4">
                    <div className="text-center py-12">
                      <div className="text-6xl mb-3">😴</div>
                      <h2 className="text-2xl font-bold text-[#93a1a1] mb-2">Rest Well</h2>
                      <p className="text-sm text-[#586e75] mb-6">
                        Rituals are available in the morning (6am-11am) and evening (6pm-11pm)
                      </p>
                      <p className="text-xs text-[#586e75]">
                        Current time: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vision Tab */}
          {activeTab === 'vision' && (
            <div className="h-full overflow-y-auto">
              <div className="px-4 py-6 space-y-4">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-6xl mb-3">🧭</div>
                  <h2 className="text-2xl font-bold text-[#93a1a1] mb-2">Vision & Compass</h2>
                  <p className="text-sm text-[#586e75]">Where are you going?</p>
                </div>

                {/* Compass Points (Focus Areas) */}
                <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#268bd2]">
                  <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
                    <span>🎯</span>
                    <span>Focus Areas</span>
                  </h3>
                  <p className="text-xs text-[#586e75] mb-4">
                    The 3-5 areas that truly matter to you
                  </p>

                  <div className="space-y-3">
                    {/* Health Focus Area */}
                    <div className="p-3 bg-[#002b36] rounded-lg border border-[#586e75]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💪</span>
                          <span className="text-sm font-bold text-[#93a1a1]">Health</span>
                        </div>
                        <button className="text-xs text-[#586e75] hover:text-[#268bd2]">Edit</button>
                      </div>
                      <p className="text-xs text-[#586e75] italic">
                        "I want to feel energized and strong every day"
                      </p>
                    </div>

                    {/* Work Focus Area */}
                    <div className="p-3 bg-[#002b36] rounded-lg border border-[#586e75]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💼</span>
                          <span className="text-sm font-bold text-[#93a1a1]">Work</span>
                        </div>
                        <button className="text-xs text-[#586e75] hover:text-[#268bd2]">Edit</button>
                      </div>
                      <p className="text-xs text-[#586e75] italic">
                        "I want to build meaningful things that help people"
                      </p>
                    </div>

                    {/* Relationships Focus Area */}
                    <div className="p-3 bg-[#002b36] rounded-lg border border-[#586e75]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">❤️</span>
                          <span className="text-sm font-bold text-[#93a1a1]">Relationships</span>
                        </div>
                        <button className="text-xs text-[#586e75] hover:text-[#268bd2]">Edit</button>
                      </div>
                      <p className="text-xs text-[#586e75] italic">
                        "I want to nurture deep connections with loved ones"
                      </p>
                    </div>

                    {/* Add New Focus Area */}
                    <button className="w-full py-2 bg-[#002b36] text-[#586e75] rounded-lg border border-dashed border-[#586e75] text-xs hover:border-[#268bd2] hover:text-[#268bd2] transition-colors">
                      + Add Focus Area
                    </button>
                  </div>
                </div>

                {/* Quarterly Theme */}
                <div className="p-4 bg-gradient-to-br from-[#6c71c4]/20 to-[#d33682]/20 rounded-xl border-2 border-[#6c71c4]">
                  <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
                    <span>📅</span>
                    <span>Current Quarter Theme</span>
                  </h3>
                  <div className="p-3 bg-[#002b36] rounded-lg mb-3">
                    <div className="text-xs text-[#586e75] mb-1">Q4 2025</div>
                    <div className="text-base font-bold text-[#93a1a1] mb-2">
                      "Build & Launch"
                    </div>
                    <p className="text-xs text-[#586e75] italic">
                      This quarter is about taking ideas from concept to reality
                    </p>
                  </div>
                  <button className="w-full py-2 bg-[#6c71c4] text-[#fdf6e3] rounded-lg text-xs font-bold hover:bg-[#d33682] transition-colors">
                    Update Theme
                  </button>
                </div>

                {/* Your "Why" */}
                <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#859900]">
                  <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
                    <span>🌟</span>
                    <span>Your "Why"</span>
                  </h3>
                  <p className="text-xs text-[#586e75] mb-3">
                    The deeper reason behind what you do
                  </p>
                  <div className="p-3 bg-[#002b36] rounded-lg mb-3">
                    <p className="text-sm text-[#93a1a1] italic leading-relaxed">
                      "I want to create systems that help people with ADHD thrive,
                      because I know how it feels to struggle with executive function.
                      Every tool I build is a love letter to my younger self."
                    </p>
                  </div>
                  <button className="w-full py-2 bg-[#859900] text-[#fdf6e3] rounded-lg text-xs font-bold hover:bg-[#2aa198] transition-colors">
                    Edit Your Why
                  </button>
                </div>

                {/* Values Check */}
                <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#b58900]">
                  <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
                    <span>⭐</span>
                    <span>Core Values</span>
                  </h3>
                  <p className="text-xs text-[#586e75] mb-3">
                    What guides your decisions?
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="px-3 py-1.5 bg-[#002b36] text-[#93a1a1] rounded-full text-xs border border-[#b58900]">
                      🎯 Intentionality
                    </div>
                    <div className="px-3 py-1.5 bg-[#002b36] text-[#93a1a1] rounded-full text-xs border border-[#b58900]">
                      🤝 Authenticity
                    </div>
                    <div className="px-3 py-1.5 bg-[#002b36] text-[#93a1a1] rounded-full text-xs border border-[#b58900]">
                      🌱 Growth
                    </div>
                    <div className="px-3 py-1.5 bg-[#002b36] text-[#93a1a1] rounded-full text-xs border border-[#b58900]">
                      ❤️ Compassion
                    </div>
                  </div>
                  <button className="w-full py-2 bg-[#002b36] text-[#586e75] rounded-lg border border-dashed border-[#586e75] text-xs hover:border-[#b58900] hover:text-[#b58900] transition-colors">
                    + Add Value
                  </button>
                </div>

                {/* Long-term Milestones */}
                <div className="p-4 bg-[#073642] rounded-xl border-2 border-[#2aa198]">
                  <h3 className="text-sm font-bold text-[#93a1a1] mb-3 flex items-center gap-2">
                    <span>🏔️</span>
                    <span>Long-term Milestones</span>
                  </h3>
                  <p className="text-xs text-[#586e75] mb-3">
                    Where do you see yourself in 1, 3, 5 years?
                  </p>
                  <div className="space-y-2">
                    <div className="p-3 bg-[#002b36] rounded-lg">
                      <div className="text-xs text-[#586e75] mb-1">1 Year</div>
                      <p className="text-sm text-[#93a1a1]">
                        Launch ADHD productivity app in beta
                      </p>
                    </div>
                    <div className="p-3 bg-[#002b36] rounded-lg">
                      <div className="text-xs text-[#586e75] mb-1">3 Years</div>
                      <p className="text-sm text-[#93a1a1]">
                        10,000 active users, profitable business
                      </p>
                    </div>
                    <div className="p-3 bg-[#002b36] rounded-lg">
                      <div className="text-xs text-[#586e75] mb-1">5 Years</div>
                      <p className="text-sm text-[#93a1a1]">
                        Built a suite of neurodivergent-friendly tools
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vision Check-in */}
                <div className="p-4 bg-gradient-to-br from-[#268bd2]/20 to-[#2aa198]/20 rounded-xl border-2 border-[#268bd2]">
                  <h3 className="text-sm font-bold text-[#93a1a1] mb-3">🔍 Is this still true?</h3>
                  <p className="text-xs text-[#586e75] mb-3">
                    Revisit your vision regularly. Things change, and that's okay.
                  </p>
                  <div className="text-xs text-[#586e75] mb-2">
                    Last updated: 3 weeks ago
                  </div>
                  <button className="w-full py-2 bg-[#268bd2] text-[#fdf6e3] rounded-lg text-xs font-bold hover:bg-[#2aa198] transition-colors">
                    Review & Update Vision
                  </button>
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
