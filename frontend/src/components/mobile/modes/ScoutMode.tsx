'use client'

import React, { useState, useEffect } from 'react';
import { Search, Flame, Zap, Target, Calendar, Bot, Moon, Gift } from 'lucide-react';
import CategoryRow from '../../../components/mobile/CategoryRow';
import { spacing, fontSize, borderRadius, iconSize, semanticColors } from '@/lib/design-system';

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
  const [activeFilter, setActiveFilter] = useState<'all' | 'digital' | 'human' | 'urgent'>('all');

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  useEffect(() => {
    // 15% chance to show mystery task (ADHD: unpredictable rewards)
    const shouldShowMystery = Math.random() < 0.15;
    setShowMysteryTask(shouldShowMystery);
  }, [tasks]);

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
      console.warn('API not available, using empty task list:', err);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks by category
  const getMainFocus = () => {
    return tasks
      .filter(t => t.status !== 'completed' && t.priority === 'high')
      .slice(0, 3);
  };

  const getUrgentToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      return t.due_date <= today;
    });
  };

  const getQuickWins = () => {
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.estimated_hours || 0) <= 0.25
    ).slice(0, 8);
  };

  const getThisWeek = () => {
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
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.priority === 'low' || !t.due_date)
    ).slice(0, 10);
  };

  const getCanDelegate = () => {
    return tasks.filter(t =>
      t.status !== 'completed' &&
      (t.is_digital ||
       t.tags?.some(tag => ['digital', 'online', 'email', 'research', 'coding'].includes(tag.toLowerCase())))
    );
  };

  const getMysteryTask = () => {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    if (incompleteTasks.length === 0) return [];
    const randomIndex = Math.floor(Math.random() * incompleteTasks.length);
    return [incompleteTasks[randomIndex]];
  };

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: semanticColors.bg.primary }}>
        <div className="text-center">
          <Search size={iconSize['2xl']} className="mx-auto mb-4" style={{ color: semanticColors.accent.primary }} />
          <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>
            Scouting for tasks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full overflow-y-auto"
      style={{
        backgroundColor: semanticColors.bg.primary,
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Compact Header */}
      <div className="flex flex-col" style={{ padding: spacing[4], paddingBottom: spacing[3] }}>
        {/* Header with icon - 4px grid */}
        <div className="flex items-center" style={{ gap: spacing[3], marginBottom: spacing[3] }}>
          <Search size={iconSize.lg} style={{ color: semanticColors.accent.primary }} />
          <div>
            <h2 style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: semanticColors.text.primary }}>
              Scout Mode
            </h2>
            <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
              Seek novelty & identify doable targets
            </p>
          </div>
        </div>

        {/* Filter Pills - 4px grid */}
        <div className="flex" style={{ gap: spacing[2], marginBottom: spacing[3], overflowX: 'auto' }}>
          {[
            { key: 'all', label: 'All', icon: Search },
            { key: 'digital', label: 'Digital', icon: Bot },
            { key: 'urgent', label: 'Urgent', icon: Zap }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key as any)}
              className="flex items-center transition-all"
              style={{
                gap: spacing[1],
                padding: `${spacing[1]} ${spacing[3]}`,
                borderRadius: borderRadius.full,
                fontSize: fontSize.xs,
                backgroundColor: activeFilter === key ? semanticColors.accent.primary : semanticColors.bg.secondary,
                color: activeFilter === key ? semanticColors.text.inverse : semanticColors.text.primary,
                border: `1px solid ${activeFilter === key ? semanticColors.accent.primary : semanticColors.border.default}`,
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Progress Bar - 4px grid */}
        <div style={{ marginBottom: spacing[3], padding: spacing[2], backgroundColor: semanticColors.bg.secondary, borderRadius: borderRadius.base, border: `1px solid ${semanticColors.border.default}` }}>
          <div className="flex items-center justify-between" style={{ marginBottom: spacing[1] }}>
            <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Progress</span>
            <span style={{ fontSize: fontSize.xs, color: semanticColors.text.primary, fontWeight: 'bold' }}>
              {tasks.filter(t => t.status !== 'completed').length} tasks
            </span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: spacing[1], backgroundColor: semanticColors.bg.primary }}>
            <div
              className="h-full bg-gradient-to-r from-[#859900] to-[#268bd2] transition-all duration-500"
              style={{ width: `${Math.min((tasks.length / 50) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Mystery Task (15% chance) - 4px grid */}
        {showMysteryTask && getMysteryTask().length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <CategoryRow
              title="Mystery Task Bonus"
              icon={<Gift size={iconSize.sm} style={{ color: semanticColors.accent.warning }} />}
              tasks={getMysteryTask()}
              onTaskTap={onTaskTap}
              isMystery={true}
            />
          </div>
        )}

        {/* Main Focus - Hero sized cards */}
        {getMainFocus().length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <CategoryRow
              title="Main Focus"
              icon={<Flame size={iconSize.sm} style={{ color: semanticColors.accent.error }} />}
              tasks={getMainFocus()}
              onTaskTap={onTaskTap}
              cardSize="hero"
            />
          </div>
        )}

        {/* Urgent Today - 4px grid */}
        {getUrgentToday().length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <CategoryRow
              title="Urgent Today"
              icon={<Zap size={iconSize.sm} style={{ color: semanticColors.accent.warning }} />}
              tasks={getUrgentToday()}
              onTaskTap={onTaskTap}
            />
          </div>
        )}

      </div>

      {/* Continuous Feed - All Categories */}
      <div className="flex flex-col" style={{ paddingBottom: spacing[20] }}>
        {/* Quick Wins - Compact cards for more visible items */}
        {getQuickWins().length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <CategoryRow
              title="Quick Wins"
              icon={<Target size={iconSize.sm} style={{ color: semanticColors.accent.success }} />}
              tasks={getQuickWins()}
              onTaskTap={onTaskTap}
              cardSize="compact"
            />
          </div>
        )}

        {/* This Week - 4px grid */}
        {getThisWeek().length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <CategoryRow
              title="This Week"
              icon={<Calendar size={iconSize.sm} style={{ color: semanticColors.accent.secondary }} />}
              tasks={getThisWeek()}
              onTaskTap={onTaskTap}
            />
          </div>
        )}

        {/* Can Delegate - 4px grid */}
        {getCanDelegate().length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <CategoryRow
              title="Can Delegate"
              icon={<Bot size={iconSize.sm} style={{ color: semanticColors.accent.primary }} />}
              tasks={getCanDelegate()}
              onTaskTap={onTaskTap}
            />
          </div>
        )}

        {/* Someday/Maybe - Compact cards */}
        {getSomedayMaybe().length > 0 && (
          <div style={{ marginBottom: spacing[2] }}>
            <CategoryRow
              title="Someday/Maybe"
              icon={<Moon size={iconSize.sm} style={{ color: semanticColors.text.secondary }} />}
              tasks={getSomedayMaybe()}
              onTaskTap={onTaskTap}
              cardSize="compact"
            />
          </div>
        )}
      </div>

      {/* Empty State - 4px grid */}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center" style={{ padding: spacing[4], minHeight: '60vh' }}>
          <Search size={64} className="mb-4" style={{ color: semanticColors.text.secondary }} />
          <h3 style={{ fontSize: fontSize.xl, fontWeight: 'bold', color: semanticColors.text.primary, marginBottom: spacing[2] }}>
            No tasks to scout
          </h3>
          <p className="text-center" style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>
            Switch to Capture mode to add your first task!
          </p>
        </div>
      )}
    </div>
  );
};

export default ScoutPage;
