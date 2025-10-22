'use client'

import React, { useState, useEffect } from 'react';
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
  created_at?: string;
  due_date?: string;
}

interface ScoutPageProps {
  onTaskTap: (task: Task) => void;
  refreshTrigger?: number;
}

const ScoutPage: React.FC<ScoutPageProps> = ({ onTaskTap, refreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMysteryTask, setShowMysteryTask] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  useEffect(() => {
    // 15% chance to show mystery task (HABIT.md: unpredictable rewards)
    const shouldShowMystery = Math.random() < 0.15;
    setShowMysteryTask(shouldShowMystery);
  }, [tasks]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/tasks?limit=100&user_id=mobile-user`);
      if (!response.ok) {
        // Fallback to simple-tasks
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

  // Filter tasks by category
  const getMainFocus = () => {
    // Top 3 high priority incomplete tasks
    return tasks
      .filter(t => t.status !== 'completed' && t.priority === 'high')
      .slice(0, 3);
  };

  const getUrgentToday = () => {
    // Tasks due today or overdue
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      return t.due_date <= today;
    });
  };

  const getQuickWins = () => {
    // Tasks under 15 minutes (0.25 hours)
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.estimated_hours || 0) <= 0.25
    ).slice(0, 8);
  };

  const getThisWeek = () => {
    // Tasks due within next 7 days
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const weekEnd = nextWeek.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    return tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      return t.due_date > todayStr && t.due_date <= weekEnd;
    });
  };

  const getSomedayMaybe = () => {
    // Low priority or no due date
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.priority === 'low' || !t.due_date)
    ).slice(0, 10);
  };

  const getCanDelegate = () => {
    // Digital tasks that can be delegated
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.is_digital ||
       t.tags?.some(tag => ['digital', 'online', 'email', 'research', 'coding'].includes(tag.toLowerCase())))
    );
  };

  const getMysteryTask = () => {
    // Random task from incomplete tasks with bonus XP promise
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    if (incompleteTasks.length === 0) return [];

    const randomIndex = Math.floor(Math.random() * incompleteTasks.length);
    return [incompleteTasks[randomIndex]];
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-[#586e75]">Scouting for tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-4">
      {/* Scout Mode Header */}
      <div className="px-4 py-4 border-b border-[#073642]">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔍</span>
          <div>
            <h2 className="text-xl font-bold text-[#93a1a1]">Scout Mode</h2>
            <p className="text-sm text-[#586e75]">
              Seek novelty & identify doable micro-targets
            </p>
          </div>
        </div>

        {/* Scout Badge Progress */}
        <div className="mt-3 p-3 bg-[#073642] rounded-lg border border-[#586e75]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#586e75]">Scout Badge Progress</span>
            <span className="text-xs text-[#93a1a1] font-bold">
              {tasks.filter(t => t.status !== 'completed').length} tasks discovered
            </span>
          </div>
          <div className="w-full h-2 bg-[#002b36] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#859900] to-[#268bd2] transition-all duration-500"
              style={{ width: `${Math.min((tasks.length / 50) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Netflix-style Categories */}
      <div className="py-4">
        {/* Mystery Task (15% chance) - HABIT.md: unpredictable rewards */}
        {showMysteryTask && getMysteryTask().length > 0 && (
          <CategoryRow
            title="Mystery Task Bonus"
            icon="🎁"
            tasks={getMysteryTask()}
            onTaskTap={onTaskTap}
            isMystery={true}
          />
        )}

        {/* Main Focus */}
        <CategoryRow
          title="Main Focus"
          icon="🔥"
          tasks={getMainFocus()}
          onTaskTap={onTaskTap}
        />

        {/* Urgent Today */}
        <CategoryRow
          title="Urgent Today"
          icon="⚡"
          tasks={getUrgentToday()}
          onTaskTap={onTaskTap}
        />

        {/* Quick Wins */}
        <CategoryRow
          title="Quick Wins"
          icon="🎯"
          tasks={getQuickWins()}
          onTaskTap={onTaskTap}
        />

        {/* This Week */}
        <CategoryRow
          title="This Week"
          icon="📅"
          tasks={getThisWeek()}
          onTaskTap={onTaskTap}
        />

        {/* Can Delegate */}
        <CategoryRow
          title="Can Delegate"
          icon="🤖"
          tasks={getCanDelegate()}
          onTaskTap={onTaskTap}
        />

        {/* Someday/Maybe */}
        <CategoryRow
          title="Someday/Maybe"
          icon="💤"
          tasks={getSomedayMaybe()}
          onTaskTap={onTaskTap}
        />

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-[#93a1a1] mb-2">
              No tasks to scout
            </h3>
            <p className="text-[#586e75] text-center">
              Use the Quick Capture pill above to add your first task!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoutPage;
