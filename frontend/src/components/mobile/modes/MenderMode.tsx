'use client'

import React, { useState, useEffect } from 'react';
import EnergyGauge from '../../../components/mobile/EnergyGauge';
import CategoryRow from '../../../components/mobile/CategoryRow';
import ExpandableTile from '../../../components/mobile/ExpandableTile';

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
      console.warn('API not available:', err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnergyData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/energy/current-level?user_id=mobile-user`);
      if (response.ok) {
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
          console.warn('AI energy prediction not available');
        }
      }
    } catch (err) {
      console.warn('Energy API not available:', err);
      setEnergyTrend('stable');
    }
  };

  const getFiveMinWins = () => {
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.estimated_hours || 0) <= 0.08
    ).slice(0, 8);
  };

  const getMindfulBreaks = () => {
    return tasks.filter(t =>
      t.status !== 'completed' &&
      t.tags?.some(tag => ['meditation', 'break', 'relaxation', 'breathing', 'mindful'].includes(tag.toLowerCase()))
    );
  };

  const getReviewReflect = () => {
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.tags?.some(tag => ['review', 'planning', 'reflection', 'weekly'].includes(tag.toLowerCase())) ||
       t.title.toLowerCase().includes('review') ||
       t.title.toLowerCase().includes('reflect'))
    );
  };

  const getAdministrative = () => {
    return tasks.filter(t =>
      t.status !== 'completed' &&
      t.priority === 'low' &&
      (t.estimated_hours || 0) <= 0.25
    ).slice(0, 8);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">💙</div>
          <p className="text-[#586e75]">Preparing recovery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto snap-y snap-mandatory">
      {/* Section 1: Energy Gauge + Quick Wins - Snap Section */}
      <div className="min-h-screen snap-start flex flex-col px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💙</span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#93a1a1]">Mender Mode</h2>
            <p className="text-xs text-[#586e75]">
              Recover energy & rebuild
            </p>
          </div>
          {menderSessions > 0 && (
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < menderSessions ? 'bg-[#268bd2]' : 'bg-[#586e75]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Energy Gauge - Expandable Tile */}
        <div className="mb-2">
          <ExpandableTile
            microContent={
              <EnergyGauge
                energy={energy}
                trend={energyTrend}
                predictedNextHour={predictedEnergy}
                variant="micro"
              />
            }
            expandedContent={
              <div className="py-3">
                <EnergyGauge
                  energy={energy}
                  trend={energyTrend}
                  predictedNextHour={predictedEnergy}
                  variant="expanded"
                />
              </div>
            }
            defaultExpanded={false}
          />
        </div>

        {/* 5-Min Wins - Compact */}
        {getFiveMinWins().length > 0 && (
          <div className="mb-2">
            <CategoryRow
              title="5-Min Wins"
              icon="🌱"
              tasks={getFiveMinWins()}
              onTaskTap={onTaskTap}
            />
          </div>
        )}

        {/* Mindful Breaks */}
        {getMindfulBreaks().length > 0 && (
          <div className="mb-2">
            <CategoryRow
              title="Mindful Breaks"
              icon="🧘"
              tasks={getMindfulBreaks()}
              onTaskTap={onTaskTap}
            />
          </div>
        )}

        <div className="flex-1 flex items-end justify-center pb-2 mt-2">
          <div className="text-[#586e75] text-xs animate-bounce">
            ↓ Swipe for more recovery tasks
          </div>
        </div>
      </div>

      {/* Section 2: More Recovery Tasks - Snap Section */}
      <div className="min-h-screen snap-start flex flex-col px-4 py-3">
        {/* Review & Reflect */}
        {getReviewReflect().length > 0 && (
          <div className="mb-2">
            <CategoryRow
              title="Review & Reflect"
              icon="📝"
              tasks={getReviewReflect()}
              onTaskTap={onTaskTap}
            />
          </div>
        )}

        {/* Administrative */}
        {getAdministrative().length > 0 && (
          <div className="mb-2">
            <CategoryRow
              title="Administrative"
              icon="☕"
              tasks={getAdministrative()}
              onTaskTap={onTaskTap}
            />
          </div>
        )}

        {/* Recovery Tips - Compact */}
        <div className="p-2 bg-[#073642] rounded-lg border border-[#268bd2]">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <h4 className="text-xs font-bold text-[#93a1a1] mb-1">
                Recovery Tips
              </h4>
              <ul className="text-xs text-[#586e75] space-y-0.5">
                <li>• Complete 3 micro-tasks → mystery box</li>
                <li>• Deep breathing for 2min → 10-15% energy</li>
                <li>• Short walks restore cognitive function</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {tasks.filter(t => t.status !== 'completed').length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">💙</div>
            <h3 className="text-xl font-bold text-[#93a1a1] mb-2">
              Perfect time to rest
            </h3>
            <p className="text-[#586e75] text-center">
              No recovery tasks available. Recharge!
            </p>
          </div>
        )}

        <div className="flex-1 flex items-end justify-center pb-2 mt-2">
          <div className="text-[#586e75] text-xs">End of recovery mode</div>
        </div>
      </div>

      {/* Mystery Box Modal */}
      {showMysteryBox && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#b58900] to-[#cb4b16] rounded-2xl p-6 max-w-sm w-full border-2 border-[#b58900] shadow-2xl animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-[#fdf6e3] mb-2">
                Mystery Box!
              </h3>
              <p className="text-[#fdf6e3] mb-4">
                3 mender sessions complete!
              </p>
              <div className="p-4 bg-[#fdf6e3] rounded-lg">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-[#073642] font-bold">
                  +25% Energy Boost
                </p>
                <p className="text-[#586e75] text-sm mt-1">
                  Applied to next Hunter session
                </p>
              </div>
              <button
                onClick={() => setShowMysteryBox(false)}
                className="mt-4 px-6 py-2 bg-[#fdf6e3] text-[#073642] font-bold rounded-lg"
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
