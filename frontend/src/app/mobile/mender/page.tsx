'use client'

import React, { useState, useEffect } from 'react';
import EnergyGauge from '../../../components/mobile/EnergyGauge';
import CategoryRow from '../../../components/mobile/CategoryRow';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimated_hours?: number;
  tags?: string[];
  is_digital?: boolean;
}

interface MenderPageProps {
  energy: number;
  onTaskTap: (task: Task) => void;
  refreshTrigger?: number;
}

const MenderPage: React.FC<MenderPageProps> = ({
  energy,
  onTaskTap,
  refreshTrigger
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menderSessions, setMenderSessions] = useState(0);
  const [showMysteryBox, setShowMysteryBox] = useState(false);
  const [energyTrend, setEnergyTrend] = useState<'rising' | 'falling' | 'stable'>('stable');
  const [predictedEnergy, setPredictedEnergy] = useState<number | undefined>();

  useEffect(() => {
    fetchTasks();
    fetchEnergyData();
  }, [refreshTrigger]);

  useEffect(() => {
    // Show mystery box after 3 mender sessions (HABIT.md: unpredictable rewards)
    if (menderSessions >= 3) {
      setShowMysteryBox(true);
    }
  }, [menderSessions]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/tasks?limit=100&user_id=mobile-user`);
      if (!response.ok) {
        const fallbackResponse = await fetch(`${API_URL}/api/v1/simple-tasks`);
        if (!fallbackResponse.ok) throw new Error('Both tasks endpoints failed');
        const fallbackData = await fallbackResponse.json();
        setTasks(fallbackData.tasks || []);
        return;
      }
      const data = await response.json();
      setTasks(data.tasks || data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnergyData = async () => {
    try {
      // Fetch energy prediction from AI
      const response = await fetch(`${API_URL}/api/v1/energy/current-level?user_id=mobile-user`);
      if (response.ok) {
        const data = await response.json();

        // Try to get AI predictions
        try {
          const trackResponse = await fetch(`${API_URL}/api/v1/energy/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: `Current energy level: ${energy}%` })
          });

          if (trackResponse.ok) {
            const trackData = await trackResponse.json();
            setEnergyTrend(trackData.trend || 'stable');
            setPredictedEnergy(trackData.predicted_next_hour);
          }
        } catch (err) {
          console.log('AI energy prediction not available');
        }
      }
    } catch (err) {
      console.error('Energy fetch error:', err);
    }
  };

  // Filter tasks for mender mode
  const getFiveMinWins = () => {
    // Ultra-short tasks (5 minutes or less, 0.08 hours)
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.estimated_hours || 0) <= 0.08
    ).slice(0, 8);
  };

  const getMindfulBreaks = () => {
    // Tasks tagged with relaxation, meditation, or break
    return tasks.filter(t =>
      t.status !== 'completed' &&
      t.tags?.some(tag => ['meditation', 'break', 'relaxation', 'breathing', 'mindful'].includes(tag.toLowerCase()))
    );
  };

  const getReviewReflect = () => {
    // Tasks related to planning, reviewing, or reflection
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.tags?.some(tag => ['review', 'planning', 'reflection', 'weekly'].includes(tag.toLowerCase())) ||
       t.title.toLowerCase().includes('review') ||
       t.title.toLowerCase().includes('reflect'))
    );
  };

  const getAdministrative = () => {
    // Low cognitive load tasks
    return tasks.filter(t =>
      t.status !== 'completed' &&
      t.priority === 'low' &&
      (t.estimated_hours || 0) <= 0.25
    ).slice(0, 8);
  };

  const handleTaskComplete = () => {
    setMenderSessions(prev => prev + 1);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">💙</div>
          <p className="text-[#586e75]">Preparing recovery mode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Mender Mode Header */}
      <div className="px-4 py-4 border-b border-[#073642]">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">💙</span>
          <div>
            <h2 className="text-xl font-bold text-[#93a1a1]">Mender Mode</h2>
            <p className="text-sm text-[#586e75]">
              Recover energy & rebuild cognitive tissue
            </p>
          </div>
        </div>

        {/* Mender Sessions Progress */}
        {menderSessions > 0 && (
          <div className="p-3 bg-[#073642] rounded-lg border border-[#268bd2]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#586e75]">Mender Sessions Today</span>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < menderSessions ? 'bg-[#268bd2]' : 'bg-[#073642] border border-[#586e75]'
                    }`}
                  />
                ))}
              </div>
            </div>
            {menderSessions >= 3 && (
              <div className="text-xs text-[#b58900] font-bold flex items-center gap-1">
                <span>🎁</span>
                <span>Mystery box unlocked!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Energy Visualization */}
      <div className="py-6 bg-[#073642] border-b border-[#586e75]">
        <EnergyGauge
          energy={energy}
          trend={energyTrend}
          predictedNextHour={predictedEnergy}
        />
      </div>

      {/* Recovery Task Categories */}
      <div className="py-4">
        {/* 5-Min Wins */}
        <CategoryRow
          title="5-Min Wins"
          icon="🌱"
          tasks={getFiveMinWins()}
          onTaskTap={onTaskTap}
        />

        {/* Mindful Breaks */}
        {getMindfulBreaks().length > 0 && (
          <CategoryRow
            title="Mindful Breaks"
            icon="🧘"
            tasks={getMindfulBreaks()}
            onTaskTap={onTaskTap}
          />
        )}

        {/* Review & Reflect */}
        {getReviewReflect().length > 0 && (
          <CategoryRow
            title="Review & Reflect"
            icon="📝"
            tasks={getReviewReflect()}
            onTaskTap={onTaskTap}
          />
        )}

        {/* Administrative */}
        <CategoryRow
          title="Administrative"
          icon="☕"
          tasks={getAdministrative()}
          onTaskTap={onTaskTap}
        />

        {/* Empty State */}
        {tasks.filter(t => t.status !== 'completed').length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">💙</div>
            <h3 className="text-xl font-bold text-[#93a1a1] mb-2">
              Perfect time to rest
            </h3>
            <p className="text-[#586e75] text-center">
              No recovery tasks available. Take a break and recharge!
            </p>
          </div>
        )}
      </div>

      {/* Recovery Tips */}
      <div className="px-4 pb-4">
        <div className="p-4 bg-[#073642] rounded-xl border border-[#268bd2]">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="text-sm font-bold text-[#93a1a1] mb-2">
                Energy Recovery Tips
              </h4>
              <ul className="text-xs text-[#586e75] space-y-1">
                <li>• Complete 3 micro-tasks to unlock mystery box</li>
                <li>• Deep breathing for 2 minutes can boost energy 10-15%</li>
                <li>• Short walks restore cognitive function</li>
                <li>• Hydration directly affects mental clarity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mystery Box Modal */}
      {showMysteryBox && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#b58900] to-[#cb4b16] rounded-2xl p-6 max-w-sm w-full border-2 border-[#b58900] shadow-2xl animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-[#fdf6e3] mb-2">
                Mystery Box Unlocked!
              </h3>
              <p className="text-[#fdf6e3] mb-4">
                You completed 3 mender sessions! Here's your reward:
              </p>
              <div className="p-4 bg-[#fdf6e3] rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-[#073642] font-bold">
                  +25% Energy Boost
                </p>
                <p className="text-[#586e75] text-sm mt-1">
                  Applied to your next Hunter session
                </p>
              </div>
              <button
                onClick={() => setShowMysteryBox(false)}
                className="mt-4 px-6 py-2 bg-[#fdf6e3] text-[#073642] font-bold rounded-lg hover:bg-[#eee8d5] transition-colors"
              >
                Claim Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenderPage;
