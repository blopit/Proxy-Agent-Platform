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
  const [activeMode, setActiveMode] = useState<'discover' | 'organize'>('discover');

  // Organize mode state
  const [inboxTasks, setInboxTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [swipedTask, setSwipedTask] = useState<{id: string, direction: 'left' | 'right'} | null>(null);

  useEffect(() => {
    fetchTasks();
    if (activeMode === 'organize') {
      fetchInboxTasks();
    }
  }, [refreshTrigger, activeMode]);

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

  // Organize mode functions
  const fetchInboxTasks = async () => {
    try {
      // Fetch unprocessed tasks (tasks without tags, low priority, or recently created)
      const response = await fetch(`${API_URL}/api/v1/tasks?user_id=mobile-user&status=TODO`);
      if (response.ok) {
        const data = await response.json();
        const allTasks = data.tasks || data || [];
        // Filter for "unprocessed" - no tags or priority not set
        const unprocessed = allTasks.filter((t: Task) =>
          (!t.tags || t.tags.length === 0) || t.priority === 'medium'
        );
        setInboxTasks(unprocessed);
      } else {
        // Fallback to mock data
        setInboxTasks([
          { task_id: '1', title: 'Add milk and eggs to grocery list', status: 'TODO', priority: 'medium', tags: [] },
          { task_id: '2', title: 'Research best noise-canceling headphones', status: 'TODO', priority: 'medium', tags: [] },
          { task_id: '3', title: 'Reply to that text I\'ve been avoiding', status: 'TODO', priority: 'medium', tags: [] },
        ]);
      }
    } catch (error) {
      console.warn('Failed to fetch inbox tasks:', error);
      setInboxTasks([
        { task_id: '1', title: 'Add milk and eggs to grocery list', status: 'TODO', priority: 'medium', tags: [] },
        { task_id: '2', title: 'Research best noise-canceling headphones', status: 'TODO', priority: 'medium', tags: [] },
        { task_id: '3', title: 'Reply to that text I\'ve been avoiding', status: 'TODO', priority: 'medium', tags: [] },
      ]);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSwipe = (taskId: string, direction: 'left' | 'right') => {
    setSwipedTask({ id: taskId, direction });
    // Auto-remove after animation
    setTimeout(() => {
      if (direction === 'right') {
        // Keep as task (mark as high priority)
        handleKeepTask(taskId);
      } else {
        // Archive/Delete
        handleArchiveTask(taskId);
      }
      setSwipedTask(null);
    }, 300);
  };

  const handleKeepTask = async (taskId: string) => {
    // Update task to high priority
    setInboxTasks(prev => prev.filter(t => t.task_id !== taskId || t.id?.toString() !== taskId));
    // TODO: Call API to update task priority
    console.log('Kept task:', taskId);
  };

  const handleArchiveTask = async (taskId: string) => {
    // Remove from inbox
    setInboxTasks(prev => prev.filter(t => t.task_id !== taskId || t.id?.toString() !== taskId));
    // TODO: Call API to archive/delete task
    console.log('Archived task:', taskId);
  };

  const handleBatchTag = (tag: string) => {
    if (selectedTasks.size === 0) return;
    // Apply tag to all selected tasks
    console.log(`Applying tag "${tag}" to ${selectedTasks.size} tasks`);
    // TODO: Call API to batch update tags
    setSelectedTasks(new Set());
  };

  const handleBatchPriority = (priority: 'high' | 'medium' | 'low') => {
    if (selectedTasks.size === 0) return;
    console.log(`Setting priority "${priority}" for ${selectedTasks.size} tasks`);
    // TODO: Call API to batch update priority
    setSelectedTasks(new Set());
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
              {activeMode === 'discover' ? 'Seek novelty & identify doable targets' : 'Give everything a home'}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex" style={{ gap: spacing[2], marginBottom: spacing[3] }}>
          <button
            onClick={() => setActiveMode('discover')}
            className="flex-1 transition-all"
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              borderRadius: borderRadius.base,
              fontSize: fontSize.xs,
              fontWeight: '600',
              backgroundColor: activeMode === 'discover' ? semanticColors.accent.primary : semanticColors.bg.secondary,
              color: activeMode === 'discover' ? semanticColors.text.inverse : semanticColors.text.primary,
              border: `1px solid ${activeMode === 'discover' ? semanticColors.accent.primary : semanticColors.border.default}`
            }}
          >
            🔍 Discover
          </button>
          <button
            onClick={() => setActiveMode('organize')}
            className="flex-1 transition-all relative"
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              borderRadius: borderRadius.base,
              fontSize: fontSize.xs,
              fontWeight: '600',
              backgroundColor: activeMode === 'organize' ? semanticColors.accent.primary : semanticColors.bg.secondary,
              color: activeMode === 'organize' ? semanticColors.text.inverse : semanticColors.text.primary,
              border: `1px solid ${activeMode === 'organize' ? semanticColors.accent.primary : semanticColors.border.default}`
            }}
          >
            📋 Organize
            {inboxTasks.length > 0 && activeMode !== 'organize' && (
              <span
                className="absolute -top-1 -right-1 rounded-full"
                style={{
                  width: spacing[4],
                  height: spacing[4],
                  backgroundColor: semanticColors.accent.warning,
                  color: semanticColors.text.inverse,
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}
              >
                {inboxTasks.length}
              </span>
            )}
          </button>
        </div>

        {/* Discover Mode Content */}
        {activeMode === 'discover' && (
          <>
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
          </>
        )}

        {/* Organize Mode - Inbox Processing */}
        {activeMode === 'organize' && (
          <div style={{ paddingTop: spacing[4], paddingBottom: spacing[20] }}>
            {/* Inbox Header */}
            <div style={{ marginBottom: spacing[4] }}>
              <h3 style={{ fontSize: fontSize.base, fontWeight: 'bold', color: semanticColors.text.primary, marginBottom: spacing[1] }}>
                📥 Inbox ({inboxTasks.length})
              </h3>
              <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
                Swipe right to keep, left to archive
              </p>
            </div>

          {/* Batch Actions Toolbar */}
          {selectedTasks.size > 0 && (
            <div
              className="flex items-center flex-wrap"
              style={{
                gap: spacing[2],
                marginBottom: spacing[4],
                padding: spacing[3],
                backgroundColor: semanticColors.accent.primary,
                borderRadius: borderRadius.base,
                border: `1px solid ${semanticColors.accent.primary}`
              }}
            >
              <span style={{ fontSize: fontSize.xs, color: semanticColors.text.inverse, fontWeight: 'bold' }}>
                {selectedTasks.size} selected
              </span>
              <button
                onClick={() => handleBatchPriority('high')}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.xs,
                  backgroundColor: semanticColors.accent.error,
                  color: semanticColors.text.inverse,
                  border: 'none',
                  fontWeight: '600'
                }}
              >
                🔥 High Priority
              </button>
              <button
                onClick={() => handleBatchTag('🎯 Focus')}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.xs,
                  backgroundColor: semanticColors.bg.secondary,
                  color: semanticColors.text.primary,
                  border: `1px solid ${semanticColors.border.default}`,
                  fontWeight: '600'
                }}
              >
                + Tag
              </button>
              <button
                onClick={() => setSelectedTasks(new Set())}
                style={{
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.xs,
                  backgroundColor: 'transparent',
                  color: semanticColors.text.inverse,
                  border: `1px solid ${semanticColors.text.inverse}`,
                  fontWeight: '600'
                }}
              >
                Clear
              </button>
            </div>
          )}

          {/* Inbox Task List */}
          <div className="space-y-3">
            {inboxTasks.length > 0 ? (
              inboxTasks.map((task, index) => {
                const taskId = task.task_id || task.id?.toString() || `task-${index}`;
                const isSelected = selectedTasks.has(taskId);
                const isSwiped = swipedTask?.id === taskId;

                return (
                  <div
                    key={taskId}
                    className="transition-all duration-300"
                    style={{
                      transform: isSwiped
                        ? swipedTask?.direction === 'right'
                          ? 'translateX(100px)'
                          : 'translateX(-100px)'
                        : 'translateX(0)',
                      opacity: isSwiped ? 0.5 : 1,
                      marginBottom: spacing[2]
                    }}
                  >
                    <div
                      onClick={() => toggleTaskSelection(taskId)}
                      className="flex items-center"
                      style={{
                        gap: spacing[3],
                        padding: spacing[3],
                        backgroundColor: isSelected ? `${semanticColors.accent.primary}20` : semanticColors.bg.secondary,
                        borderRadius: borderRadius.base,
                        border: `2px solid ${isSelected ? semanticColors.accent.primary : semanticColors.border.default}`,
                        cursor: 'pointer'
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: spacing[5],
                          height: spacing[5],
                          borderRadius: borderRadius.base,
                          border: `2px solid ${isSelected ? semanticColors.accent.primary : semanticColors.border.default}`,
                          backgroundColor: isSelected ? semanticColors.accent.primary : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <span style={{ color: semanticColors.text.inverse, fontSize: '12px' }}>✓</span>}
                      </div>

                      {/* Task Content */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: fontSize.sm, color: semanticColors.text.primary, fontWeight: '500' }}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1] }}>
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Swipe Buttons */}
                      <div className="flex" style={{ gap: spacing[2], flexShrink: 0 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwipe(taskId, 'left');
                          }}
                          style={{
                            padding: spacing[2],
                            borderRadius: borderRadius.base,
                            backgroundColor: semanticColors.accent.error,
                            color: semanticColors.text.inverse,
                            border: 'none',
                            fontSize: fontSize.xs
                          }}
                        >
                          🗑️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwipe(taskId, 'right');
                          }}
                          style={{
                            padding: spacing[2],
                            borderRadius: borderRadius.base,
                            backgroundColor: semanticColors.accent.success,
                            color: semanticColors.text.inverse,
                            border: 'none',
                            fontSize: fontSize.xs
                          }}
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="flex flex-col items-center justify-center"
                style={{ padding: spacing[8], textAlign: 'center' }}
              >
                <div style={{ fontSize: '64px', marginBottom: spacing[3] }}>🎉</div>
                <h3 style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: semanticColors.text.primary, marginBottom: spacing[2] }}>
                  Inbox Zero!
                </h3>
                <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>
                  Everything has a home. Great work!
                </p>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoutPage;
