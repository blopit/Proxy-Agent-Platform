'use client'

import React, { useState, useEffect } from 'react';
import { Search, Flame, Zap, Target, Calendar, Bot, Moon, Gift } from 'lucide-react';
import CategoryRow from '../task/CategoryRow';
import SmartRecommendations from '../scout/SmartRecommendations';
import WorkspaceOverview from '../scout/WorkspaceOverview';
import ZoneBalanceWidget from '../scout/ZoneBalanceWidget';
import FilterMatrix, { FilterState } from '../scout/FilterMatrix';
import DecisionHelper from '../scout/DecisionHelper';
import TaskInspector from '../scout/TaskInspector';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';

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

  // Scout enhancement state
  const [filterState, setFilterState] = useState<FilterState>({});
  const [selectedTaskForInspection, setSelectedTaskForInspection] = useState<Task | null>(null);
  const [comparisonTasks, setComparisonTasks] = useState<Task[]>([]);

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
    const taskArray = Array.isArray(tasks) ? tasks : [];
    return taskArray
      .filter(t => t.status !== 'completed' && t.priority === 'high')
      .slice(0, 3);
  };

  const getUrgentToday = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const today = new Date().toISOString().split('T')[0];
    return taskArray.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      return t.due_date <= today;
    });
  };

  const getQuickWins = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    return taskArray.filter(t =>
      t.status !== 'completed' &&
      (t.estimated_hours || 0) <= 0.25
    ).slice(0, 8);
  };

  const getThisWeek = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const weekEnd = nextWeek.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    return taskArray.filter(t => {
      if (t.status === 'completed') return false;
      if (!t.due_date) return false;
      return t.due_date > todayStr && t.due_date <= weekEnd;
    });
  };

  const getSomedayMaybe = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    return taskArray.filter(t =>
      t.status !== 'completed' &&
      (t.priority === 'low' || !t.due_date)
    ).slice(0, 10);
  };

  const getCanDelegate = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    return taskArray.filter(t =>
      t.status !== 'completed' &&
      (t.is_digital ||
       t.tags?.some(tag => ['digital', 'online', 'email', 'research', 'coding'].includes(tag.toLowerCase())))
    );
  };

  const getMysteryTask = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const incompleteTasks = taskArray.filter(t => t.status !== 'completed');
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

  // Scout enhancement handlers
  const handleTaskInspection = (task: Task) => {
    setSelectedTaskForInspection(task);
  };

  const handleCloseInspector = () => {
    setSelectedTaskForInspection(null);
  };

  const handleHuntTask = (task: Task) => {
    console.log('Hunt task:', task.title);
    setSelectedTaskForInspection(null);
    onTaskTap(task);
  };

  // Mock data generators for Scout components
  const getSmartRecommendations = () => {
    // Ensure tasks is always an array
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const highPriorityTasks = taskArray.filter(t => t.status !== 'completed' && t.priority === 'high').slice(0, 3);
    return highPriorityTasks.map(task => ({
      task,
      reason: task.estimated_hours && task.estimated_hours < 0.5
        ? 'Quick win - takes less than 30 minutes!'
        : task.due_date
          ? 'Due soon - complete before deadline'
          : 'High priority - important for your goals',
      badges: [
        ...(task.estimated_hours && task.estimated_hours < 0.5 ? ['quick-win'] as const : []),
        ...(task.priority === 'high' ? ['high-impact'] as const : []),
        ...(task.due_date ? ['urgent'] as const : []),
      ],
      confidence: 85,
    }));
  };

  const getZoneData = () => {
    return [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 3,
        tasks_completed_this_week: 8,
        tasks_completed_all_time: 42,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 1,
        tasks_completed_this_week: 3,
        tasks_completed_all_time: 18,
        days_since_last_task: 2,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 2,
        tasks_completed_this_week: 5,
        tasks_completed_all_time: 25,
      },
    ];
  };

  const getWorkspaceData = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    return {
      openFiles: [
        { id: 'f1', name: 'Project_Plan.pdf', type: 'pdf' as const, lastOpened: '10 min ago' },
        { id: 'f2', name: 'Budget.xlsx', type: 'sheet' as const, lastOpened: '1 hour ago' },
      ],
      inProgressTasks: taskArray
        .filter(t => t.status === 'in_progress')
        .slice(0, 3)
        .map(t => ({
          id: t.task_id || t.id?.toString() || '',
          title: t.title,
          progress: 60,
          lastWorkedOn: '1 hour ago',
        })),
      pinnedItems: [
        { id: 'p1', title: 'Weekly standup notes', type: 'note' as const },
      ],
    };
  };

  const getDecisionHelperComparisons = () => {
    const taskArray = Array.isArray(tasks) ? tasks : [];
    const topTasks = taskArray.filter(t => t.status !== 'completed').slice(0, 2);
    return topTasks.map(task => ({
      task,
      energyCost: task.estimated_hours ? Math.min(10, Math.ceil(task.estimated_hours * 3)) : 5,
      estimatedReward: {
        xp: task.priority === 'high' ? 100 : task.priority === 'medium' ? 50 : 25,
        impact: task.priority === 'high' ? 'high' : 'medium'
      },
      readinessStatus: 'ready' as const,
      completionProbability: 75,
    }));
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

            {/* Smart Recommendations - AI-powered top picks */}
            {getSmartRecommendations().length > 0 && (
              <div style={{ marginBottom: spacing[3] }}>
                <SmartRecommendations
                  recommendations={getSmartRecommendations()}
                  onHunt={handleHuntTask}
                  onViewTask={handleTaskInspection}
                />
              </div>
            )}

            {/* Workspace Overview - What you're already working on */}
            <div style={{ marginBottom: spacing[3] }}>
              <WorkspaceOverview
                {...getWorkspaceData()}
                onFileClick={(file) => console.log('File:', file.name)}
                onTaskClick={(task) => console.log('Task:', task.title)}
                onPinnedClick={(item) => console.log('Pinned:', item.title)}
              />
            </div>

            {/* Zone Balance Widget - Life balance overview */}
            <div style={{ marginBottom: spacing[3] }}>
              <ZoneBalanceWidget
                zones={getZoneData()}
                insights={[
                  {
                    type: 'info',
                    message: 'Work zone is thriving! You completed 8 tasks this week.',
                    zoneId: 'z1',
                  },
                ]}
                onZoneSelect={(zoneId) => console.log('Selected zone:', zoneId)}
                onFilterByZone={(zoneName) => console.log('Filter by zone:', zoneName)}
              />
            </div>

            {/* Filter Matrix - Advanced filtering */}
            <div style={{ marginBottom: spacing[3] }}>
              <FilterMatrix
                activeFilters={filterState}
                onFiltersChange={setFilterState}
                availableTags={['urgent', 'meeting', 'email', 'creative', 'admin']}
                availableZones={['Work', 'Health', 'Relationships', 'Growth', 'Home']}
              />
            </div>

            {/* Decision Helper - Compare tasks side-by-side */}
            {getDecisionHelperComparisons().length >= 2 && (
              <div style={{ marginBottom: spacing[3] }}>
                <DecisionHelper
                  comparisons={getDecisionHelperComparisons()}
                  onChooseTask={handleHuntTask}
                  onViewDetails={handleTaskInspection}
                />
              </div>
            )}

        {/* Progress Bar - 4px grid */}
        <div style={{ marginBottom: spacing[3], padding: spacing[2], backgroundColor: semanticColors.bg.secondary, borderRadius: borderRadius.base, border: `1px solid ${semanticColors.border.default}` }}>
          <div className="flex items-center justify-between" style={{ marginBottom: spacing[1] }}>
            <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Progress</span>
            <span style={{ fontSize: fontSize.xs, color: semanticColors.text.primary, fontWeight: 'bold' }}>
              {Array.isArray(tasks) ? tasks.filter(t => t.status !== 'completed').length : 0} tasks
            </span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: spacing[1], backgroundColor: semanticColors.bg.primary }}>
            <div
              className="h-full bg-gradient-to-r from-[#859900] to-[#268bd2] transition-all duration-500"
              style={{ width: `${Math.min((Array.isArray(tasks) ? tasks.length : 0) / 50 * 100, 100)}%` }}
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
      {(!Array.isArray(tasks) || tasks.length === 0) && (
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

      {/* Task Inspector Modal - Bottom Sheet */}
      {selectedTaskForInspection && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={handleCloseInspector}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxHeight: '90vh',
              backgroundColor: semanticColors.bg.primary,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              overflow: 'auto',
            }}
          >
            <TaskInspector
              task={selectedTaskForInspection}
              energyCost={selectedTaskForInspection.estimated_hours ? Math.min(10, Math.ceil(selectedTaskForInspection.estimated_hours * 3)) : 5}
              estimatedReward={{
                xp: selectedTaskForInspection.priority === 'high' ? 100 : selectedTaskForInspection.priority === 'medium' ? 50 : 25,
                impact: selectedTaskForInspection.priority === 'high' ? 'high' : 'medium'
              }}
              readinessStatus="ready"
              onHunt={() => handleHuntTask(selectedTaskForInspection)}
              onClose={handleCloseInspector}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoutPage;
