'use client'

import React, { useState, useEffect } from 'react';
import CardStack from '../../../components/mobile/CardStack';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  desc?: string;
  status: string;
  priority: string;
  context?: string;
  tone?: string;
  done?: boolean;
  created_at?: string;
  estimated_hours?: number;
  tags?: string[];
  is_digital?: boolean;
}

interface HunterPageProps {
  onSwipeLeft: (task: Task) => void;
  onSwipeRight: (task: Task) => void;
  onTaskTap: (task: Task) => void;
  refreshTrigger?: number;
}

const HunterPage: React.FC<HunterPageProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onTaskTap,
  refreshTrigger
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hunterStreak, setHunterStreak] = useState(0);

  useEffect(() => {
    fetchHunterTasks();
  }, [refreshTrigger]);

  const fetchHunterTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch high-priority incomplete tasks for hunter mode
      const response = await fetch(
        `${API_URL}/api/v1/tasks?limit=50&user_id=mobile-user&status=pending,in_progress`
      );

      if (!response.ok) {
        // Fallback to simple-tasks
        const fallbackResponse = await fetch(`${API_URL}/api/v1/simple-tasks`);
        if (!fallbackResponse.ok) throw new Error('Both tasks endpoints failed');
        const fallbackData = await fallbackResponse.json();
        setTasks(fallbackData.tasks || []);
        return;
      }

      const data = await response.json();
      const allTasks = data.tasks || data || [];

      // Sort by priority: high > medium > low
      const sortedTasks = allTasks.sort((a: Task, b: Task) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
        return bPriority - aPriority;
      });

      setTasks(sortedTasks);
    } catch (err) {
      console.warn('API not available, using empty task list:', err);
      setTasks([]); // Graceful degradation
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeLeft = async (task: Task) => {
    // Increment hunter streak
    setHunterStreak(prev => prev + 1);
    onSwipeLeft(task);
  };

  const handleSwipeRight = async (task: Task) => {
    // Increment hunter streak
    setHunterStreak(prev => prev + 1);
    onSwipeRight(task);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-[#586e75]">Preparing hunt...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-[#93a1a1] mb-2">
          All tasks hunted!
        </h3>
        <p className="text-[#586e75] text-center mb-4">
          You've completed or dismissed all available tasks.
        </p>
        <p className="text-[#586e75] text-center">
          Switch to Scout mode to find more tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Hunter Mode Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#073642] snap-start">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-lg font-bold text-[#93a1a1]">Hunter Mode</h2>
              <p className="text-xs text-[#586e75]">
                Enter pursuit flow & harvest reward
              </p>
            </div>
          </div>

          {/* Hunter Streak */}
          {hunterStreak > 0 && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-lg">🔥</span>
                <span className="text-xl font-bold text-[#dc322f]">
                  {hunterStreak}
                </span>
              </div>
              <span className="text-xs text-[#586e75]">streak</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#586e75]">
              Task {currentTaskIndex + 1} of {tasks.length}
            </span>
            <span className="text-xs text-[#586e75]">
              {Math.round(((currentTaskIndex + 1) / tasks.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#002b36] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#dc322f] to-[#cb4b16] transition-all duration-300"
              style={{ width: `${((currentTaskIndex + 1) / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* CardStack Area - Full immersion */}
      <div className="flex-1 overflow-hidden">
        <CardStack
          tasks={tasks}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onTap={onTaskTap}
          currentIndex={currentTaskIndex}
          onIndexChange={setCurrentTaskIndex}
        />
      </div>

      {/* Swipe Hints */}
      <div className="flex-shrink-0 px-4 py-3 bg-[#073642] border-t border-[#586e75]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#dc322f]">
            <span>←</span>
            <span>Swipe left: Dismiss</span>
          </div>
          <div className="flex items-center gap-2 text-[#859900]">
            <span>Swipe right: Do/Delegate</span>
            <span>→</span>
          </div>
        </div>
        <div className="text-center mt-1 text-[#586e75] text-xs">
          Hold for task details
        </div>
      </div>
    </div>
  );
};

export default HunterPage;
