'use client'

import React, { useState, useEffect } from 'react';
import SwipeableTaskCard from '../SwipeableTaskCard';
import { Target, Zap, TrendingUp } from 'lucide-react';
import { colors, semanticColors, spacing, fontSize, borderRadius } from '@/lib/design-system';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  context?: string;
  estimated_minutes?: number;
  tags?: string[];
  ready_now?: boolean;
  xp_preview?: number;
  zone?: string; // Compass zone
}

interface TodayModeProps {
  onSwipeLeft: (task: Task) => void;
  onSwipeRight: (task: Task) => void;
  onTaskTap: (task: Task) => void;
  refreshTrigger?: number;
  energy?: number;
}

const TodayMode: React.FC<TodayModeProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onTaskTap,
  refreshTrigger,
  energy = 70
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    fetchTodayTasks();
  }, [refreshTrigger]);

  const fetchTodayTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch tasks from comprehensive task API
      const response = await fetch(
        `${API_URL}/api/v1/tasks?user_id=mobile-user&status=pending&limit=50`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      const allTasks = data.tasks || [];

      // Filter and sort for Today view
      const todayTasks = allTasks
        .map((task: Task) => ({
          ...task,
          // Calculate "Ready Now" based on energy and time
          ready_now: calculateReadyNow(task, energy),
          // Calculate XP preview (simple estimate: 10 XP per estimated hour)
          xp_preview: Math.round((task.estimated_minutes || 15) / 6)
        }))
        .sort((a: Task, b: Task) => {
          // Sort by: Ready Now > Priority > XP
          if (a.ready_now && !b.ready_now) return -1;
          if (!a.ready_now && b.ready_now) return 1;

          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
          const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;

          if (aPriority !== bPriority) return bPriority - aPriority;

          return (b.xp_preview || 0) - (a.xp_preview || 0);
        });

      setTasks(todayTasks);
    } catch (err) {
      console.warn('Failed to fetch tasks:', err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateReadyNow = (task: Task, energy: number): boolean => {
    // Simple logic: task is "ready" if energy matches effort
    const estimatedMinutes = task.estimated_minutes || 15;

    // High energy (>70%): Can do any task
    if (energy > 70) return true;

    // Medium energy (40-70%): Short/medium tasks only
    if (energy >= 40 && estimatedMinutes <= 30) return true;

    // Low energy (<40%): Very short tasks only
    if (energy < 40 && estimatedMinutes <= 15) return true;

    return false;
  };

  const handleSwipeLeft = async (task: Task) => {
    // Dismiss task (archive/low priority)
    try {
      await fetch(`${API_URL}/api/v1/tasks/${task.task_id || task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
    } catch (err) {
      console.error('Failed to archive task:', err);
    }

    setCurrentIndex(prev => prev + 1);
    onSwipeLeft(task);
  };

  const handleSwipeRight = async (task: Task) => {
    // Complete task
    try {
      await fetch(`${API_URL}/api/v1/tasks/${task.task_id || task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      // Award XP
      if (task.xp_preview) {
        await fetch(`${API_URL}/api/v1/gamification/xp/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'mobile-user',
            xp_amount: task.xp_preview,
            reason: `Completed: ${task.title}`
          })
        });
      }

      setCompletedCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }

    setCurrentIndex(prev => prev + 1);
    onSwipeRight(task);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p style={{ color: semanticColors.text.secondary }}>Loading your day...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0 || currentIndex >= tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: semanticColors.text.primary }}>
          All clear for today!
        </h3>
        <p style={{ color: semanticColors.text.secondary, textAlign: 'center', marginBottom: spacing[4] }}>
          {completedCount > 0
            ? `You completed ${completedCount} task${completedCount > 1 ? 's' : ''} today.`
            : 'No tasks in your Today list.'}
        </p>
        <p style={{ color: semanticColors.text.secondary, textAlign: 'center' }}>
          Switch to Inbox to capture more tasks.
        </p>
      </div>
    );
  }

  const currentTask = tasks[currentIndex];
  const remainingCount = tasks.length - currentIndex;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: semanticColors.bg.primary }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-3 border-b"
        style={{
          borderColor: semanticColors.border.default,
          backgroundColor: semanticColors.bg.secondary
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Target size={24} style={{ color: colors.orange }} />
            <div>
              <h2 className="text-lg font-bold" style={{ color: semanticColors.text.primary }}>
                Today
              </h2>
              <p className="text-xs" style={{ color: semanticColors.text.secondary }}>
                Focus on what matters now
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <TrendingUp size={16} style={{ color: colors.green }} />
              <span className="text-sm font-bold" style={{ color: semanticColors.text.primary }}>
                {completedCount}
              </span>
            </div>
            <span className="text-xs" style={{ color: semanticColors.text.secondary }}>
              done today
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs mb-1" style={{ color: semanticColors.text.secondary }}>
          <span>Task {currentIndex + 1} of {tasks.length}</span>
          <span>{remainingCount} remaining</span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: semanticColors.bg.primary }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / tasks.length) * 100}%`,
              background: `linear-gradient(to right, ${colors.orange}, ${colors.red})`
            }}
          />
        </div>
      </div>

      {/* Task Card Area */}
      <div className="flex-1 p-4 flex flex-col" style={{ minHeight: 0 }}>
        {/* Ready Now Badge */}
        {currentTask.ready_now && (
          <div
            className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              backgroundColor: `${colors.green}20`,
              border: `1px solid ${colors.green}`
            }}
          >
            <Zap size={16} style={{ color: colors.green }} />
            <span className="text-sm font-medium" style={{ color: colors.green }}>
              Ready Now • Perfect for your current energy
            </span>
          </div>
        )}

        {/* XP Preview */}
        <div
          className="mb-3 flex items-center justify-between px-3 py-2 rounded-lg"
          style={{
            backgroundColor: semanticColors.bg.secondary,
            border: `1px solid ${semanticColors.border.default}`
          }}
        >
          <span className="text-sm" style={{ color: semanticColors.text.secondary }}>
            Complete this task to earn
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold" style={{ color: colors.yellow }}>
              +{currentTask.xp_preview || 10} XP
            </span>
          </div>
        </div>

        {/* Task Card */}
        <div className="flex-1 relative" style={{ minHeight: 400 }}>
          <SwipeableTaskCard
            task={currentTask}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onTap={onTaskTap}
            isActive={true}
          />
        </div>
      </div>

      {/* Swipe Hints */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t"
        style={{
          backgroundColor: semanticColors.bg.secondary,
          borderColor: semanticColors.border.default
        }}
      >
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2" style={{ color: colors.red }}>
            <span>←</span>
            <span>Skip for later</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: colors.green }}>
            <span>Complete</span>
            <span>→</span>
          </div>
        </div>
        <div className="text-center mt-1 text-xs" style={{ color: semanticColors.text.secondary }}>
          Hold card to see details
        </div>
      </div>
    </div>
  );
};

export default TodayMode;
