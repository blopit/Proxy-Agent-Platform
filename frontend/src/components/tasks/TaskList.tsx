'use client';

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  ArrowUpDown,
  MoreVertical,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  ChevronDown,
  RefreshCw,
} from 'lucide-react'
import { taskApi, TaskApiError } from '@/services/taskApi'
import { Task, TaskStatus, TaskPriority, TaskListResponse } from '@/types/task'
import {
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  semanticColors,
  colors,
  borderRadius,
  duration,
  iconSize,
} from '@/lib/design-system'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface TaskListProps {
  projectId: string
  onTaskSelect: (task: Task) => void
  onTaskUpdate: (task: Task) => void
  className?: string
}

interface FilterState {
  status?: TaskStatus
  priority?: TaskPriority
  sortBy: 'created_at' | 'priority' | 'due_date' | 'title'
  sortOrder: 'asc' | 'desc'
}

// Status colors using design system - theme-aware
const getStatusColors = () => ({
  [TaskStatus.TODO]: {
    bg: semanticColors.bg.tertiary,
    text: semanticColors.text.secondary
  },
  [TaskStatus.IN_PROGRESS]: {
    bg: semanticColors.accent.secondary,
    text: colors.blue
  },
  [TaskStatus.BLOCKED]: {
    bg: semanticColors.error.light,
    text: semanticColors.error.dark
  },
  [TaskStatus.REVIEW]: {
    bg: semanticColors.warning.light,
    text: semanticColors.warning.dark
  },
  [TaskStatus.COMPLETED]: {
    bg: semanticColors.success.light,
    text: semanticColors.success.dark
  },
  [TaskStatus.CANCELLED]: {
    bg: semanticColors.bg.tertiary,
    text: semanticColors.text.muted
  },
});

// Priority colors using design system - theme-aware
const getPriorityColors = () => ({
  [TaskPriority.LOW]: {
    bg: semanticColors.bg.tertiary,
    text: semanticColors.text.secondary
  },
  [TaskPriority.MEDIUM]: {
    bg: semanticColors.accent.secondary,
    text: colors.blue  // Scout mode
  },
  [TaskPriority.HIGH]: {
    bg: semanticColors.warning.light,
    text: colors.orange  // Mend mode (attention)
  },
  [TaskPriority.CRITICAL]: {
    bg: semanticColors.error.light,
    text: semanticColors.error.dark
  },
});

const statusIcons = {
  [TaskStatus.TODO]: Circle,
  [TaskStatus.IN_PROGRESS]: Clock,
  [TaskStatus.BLOCKED]: AlertCircle,
  [TaskStatus.REVIEW]: Clock,
  [TaskStatus.COMPLETED]: CheckCircle2,
  [TaskStatus.CANCELLED]: Circle,
}

export function TaskList({ projectId, onTaskSelect, onTaskUpdate, className = '' }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterState>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null)
  const [deletingTask, setDeletingTask] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const shouldReduceMotion = useReducedMotion()
  const statusColors = getStatusColors()
  const priorityColors = getPriorityColors()

  // Check if mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        project_id: projectId,
        ...(filter.status && { status: filter.status }),
        ...(filter.priority && { priority: filter.priority }),
        limit: 20,
        offset: 0,
        sort_by: filter.sortBy,
        sort_order: filter.sortOrder,
      }

      const response = await taskApi.listTasks(params)
      setTasks(response.tasks)
    } catch (err) {
      setError(err instanceof TaskApiError ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [projectId, filter])

  const handleStatusFilter = (status?: TaskStatus) => {
    setFilter(prev => ({ ...prev, status }))
  }

  const handlePriorityFilter = (priority?: TaskPriority) => {
    setFilter(prev => ({ ...prev, priority }))
    setShowFilters(false)
  }

  const handleSort = (sortBy: FilterState['sortBy']) => {
    setFilter(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }))
    setShowSortMenu(false)
  }

  const handleTaskClick = (task: Task) => {
    onTaskSelect(task)
  }

  const handleStatusToggle = async (task: Task) => {
    try {
      const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED
      const updatedTask = await taskApi.updateTask(task.task_id, { status: newStatus })

      setTasks(prev => prev.map(t => t.task_id === task.task_id ? updatedTask : t))
      onTaskUpdate(updatedTask)
    } catch (err) {
      console.error('Failed to update task status:', err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingTask(taskId)
      await taskApi.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.task_id !== taskId))
      setActiveTaskMenu(null)
    } catch (err) {
      console.error('Failed to delete task:', err)
    } finally {
      setDeletingTask(null)
    }
  }

  // Progress color using design system tokens
  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return colors.green;      // Hunt mode (complete)
    if (percentage >= 75) return colors.blue;         // Scout mode (active)
    if (percentage >= 50) return colors.yellow;       // Caution
    if (percentage >= 25) return colors.orange;       // Mend mode (needs attention)
    return semanticColors.bg.tertiary;                // Minimal progress
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${spacing[12]}px 0`,  // 48px vertical
        }}
      >
        <RefreshCw
          style={{
            width: iconSize.md,
            height: iconSize.md,
            color: colors.blue,  // Scout mode
            animation: shouldReduceMotion ? 'none' : 'spin 1s linear infinite',
          }}
        />
        <span
          style={{
            marginLeft: spacing[2],  // 8px
            fontSize: fontSize.base,
            color: semanticColors.text.secondary,
          }}
        >
          Loading tasks...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: `${spacing[12]}px 0`,  // 48px vertical
        }}
      >
        <p
          style={{
            color: semanticColors.error.default,
            marginBottom: spacing[4],  // 16px
            fontSize: fontSize.base,
          }}
        >
          {error}
        </p>
        <button
          onClick={loadTasks}
          style={{
            minHeight: '44px',  // Touch target
            padding: `${spacing[2]}px ${spacing[4]}px`,  // 8px 16px
            backgroundColor: colors.blue,  // Scout mode
            color: semanticColors.text.inverse,
            borderRadius: borderRadius.base,  // 8px
            border: 'none',
            fontSize: fontSize.base,
            fontWeight: fontWeight.medium,
            cursor: 'pointer',
            transition: shouldReduceMotion ? 'none' : `all ${duration.normal}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  const filteredMessage = filter.status || filter.priority ?
    `No ${filter.status?.toLowerCase() || filter.priority?.toLowerCase()} tasks found` :
    'No tasks found'

  return (
    <div
      className={className}
      data-testid={isMobile ? 'task-list-mobile' : 'task-list-desktop'}
      style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}
    >
      {/* Header with Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: spacing[4],
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: fontSize.xl,
            fontWeight: fontWeight.semibold,
            color: semanticColors.text.primary,
          }}
        >
          Tasks
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
          {/* Status Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1], flexWrap: 'wrap' }}>
            {[
              { label: 'All', value: undefined },
              { label: 'Todo', value: TaskStatus.TODO },
              { label: 'In Progress', value: TaskStatus.IN_PROGRESS },
              { label: 'Completed', value: TaskStatus.COMPLETED },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => handleStatusFilter(value)}
                style={{
                  minHeight: '44px',
                  padding: `${spacing[1]}px ${spacing[3]}px`,
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  borderRadius: borderRadius.full,
                  border: 'none',
                  cursor: 'pointer',
                  transition: shouldReduceMotion ? 'none' : `all ${duration.normal}`,
                  backgroundColor: filter.status === value ? colors.blue : semanticColors.bg.tertiary,
                  color: filter.status === value ? semanticColors.text.inverse : semanticColors.text.secondary,
                }}
                onMouseEnter={(e) => {
                  if (filter.status !== value) {
                    e.currentTarget.style.backgroundColor = semanticColors.bg.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter.status !== value) {
                    e.currentTarget.style.backgroundColor = semanticColors.bg.tertiary;
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                minHeight: '44px',
                padding: `${spacing[1]}px ${spacing[3]}px`,
                fontSize: fontSize.sm,
                fontWeight: fontWeight.medium,
                backgroundColor: semanticColors.bg.tertiary,
                color: semanticColors.text.secondary,
                borderRadius: borderRadius.full,
                border: 'none',
                cursor: 'pointer',
                transition: shouldReduceMotion ? 'none' : `all ${duration.normal}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = semanticColors.bg.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = semanticColors.bg.tertiary;
              }}
            >
              <Filter size={16} />
              <span>Priority</span>
              <ChevronDown size={14} />
            </button>

            {showFilters && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: spacing[2],
                  width: '128px',
                  backgroundColor: semanticColors.bg.primary,
                  borderRadius: borderRadius.lg,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: `1px solid ${semanticColors.border.default}`,
                  padding: `${spacing[1]}px 0`,
                  zIndex: 10,
                }}
              >
                {[
                  { label: 'All', value: undefined },
                  { label: 'High', value: TaskPriority.HIGH },
                  { label: 'Medium', value: TaskPriority.MEDIUM },
                  { label: 'Low', value: TaskPriority.LOW },
                ].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => handlePriorityFilter(value)}
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      padding: `${spacing[2]}px ${spacing[3]}px`,
                      textAlign: 'left',
                      fontSize: fontSize.sm,
                      color: semanticColors.text.primary,
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: shouldReduceMotion ? 'none' : `background-color ${duration.fast}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = semanticColors.bg.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
                minHeight: '44px',
                padding: `${spacing[1]}px ${spacing[3]}px`,
                fontSize: fontSize.sm,
                fontWeight: fontWeight.medium,
                backgroundColor: semanticColors.bg.tertiary,
                color: semanticColors.text.secondary,
                borderRadius: borderRadius.full,
                border: 'none',
                cursor: 'pointer',
                transition: shouldReduceMotion ? 'none' : `all ${duration.normal}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = semanticColors.bg.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = semanticColors.bg.tertiary;
              }}
            >
              <ArrowUpDown size={16} />
              <span>Sort</span>
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: spacing[2],
                    width: '144px',
                    backgroundColor: semanticColors.bg.primary,
                    borderRadius: borderRadius.lg,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: `1px solid ${semanticColors.border.default}`,
                    padding: `${spacing[1]}px 0`,
                    zIndex: 10,
                  }}
                >
                  {[
                    { label: 'Created Date', value: 'created_at' as const },
                    { label: 'Priority', value: 'priority' as const },
                    { label: 'Title', value: 'title' as const },
                  ].map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => handleSort(value)}
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        padding: `${spacing[2]}px ${spacing[3]}px`,
                        textAlign: 'left',
                        fontSize: fontSize.sm,
                        color: semanticColors.text.primary,
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: shouldReduceMotion ? 'none' : `background-color ${duration.fast}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = semanticColors.bg.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: `${spacing[12]}px 0`,
          }}
        >
          <Circle
            size={iconSize.xl}
            style={{
              color: semanticColors.text.muted,
              margin: `0 auto ${spacing[4]}px`,
            }}
          />
          <h3
            style={{
              fontSize: fontSize.lg,
              fontWeight: fontWeight.medium,
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            {filter.status || filter.priority ? filteredMessage : 'No tasks found'}
          </h3>
          <p
            style={{
              fontSize: fontSize.base,
              color: semanticColors.text.secondary,
            }}
          >
            {filter.status || filter.priority
              ? 'Try adjusting your filters to see more tasks.'
              : 'Create your first task to get started.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          <AnimatePresence>
            {tasks.map((task) => {
              const StatusIcon = statusIcons[task.status]
              return (
                <motion.div
                  key={task.task_id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? false : { opacity: 0, x: -20 }}
                  onClick={() => handleTaskClick(task)}
                  style={{
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.lg,
                    padding: spacing[4],
                    cursor: 'pointer',
                    transition: shouldReduceMotion ? 'none' : `box-shadow ${duration.normal}`,
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    border: `1px solid ${semanticColors.border.subtle}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                    {/* Status Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusToggle(task)
                      }}
                      style={{
                        marginTop: spacing[1],
                        color: semanticColors.text.muted,
                        backgroundColor: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        transition: shouldReduceMotion ? 'none' : `color ${duration.fast}`,
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = colors.blue;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = semanticColors.text.muted;
                      }}
                      aria-label={`Toggle task status: ${task.title}`}
                    >
                      <StatusIcon size={20} />
                    </button>

                    {/* Task Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1 }}>
                          <h3
                            style={{
                              fontSize: fontSize.base,
                              fontWeight: fontWeight.medium,
                              color: semanticColors.text.primary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {task.title}
                          </h3>
                          {task.description && (
                            <p
                              style={{
                                fontSize: fontSize.sm,
                                color: semanticColors.text.secondary,
                                marginTop: spacing[1],
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Task Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginLeft: spacing[4] }}>
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveTaskMenu(activeTaskMenu === task.task_id ? null : task.task_id)
                              }}
                              style={{
                                minWidth: '44px',
                                minHeight: '44px',
                                padding: spacing[1],
                                color: semanticColors.text.muted,
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: borderRadius.base,
                                cursor: 'pointer',
                                transition: shouldReduceMotion ? 'none' : `color ${duration.fast}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = semanticColors.text.secondary;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = semanticColors.text.muted;
                              }}
                              aria-label="More actions"
                            >
                              <MoreVertical size={16} />
                            </button>

                            <AnimatePresence>
                              {activeTaskMenu === task.task_id && (
                                <motion.div
                                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
                                  style={{
                                    position: 'absolute',
                                    right: 0,
                                    marginTop: spacing[1],
                                    width: '128px',
                                    backgroundColor: semanticColors.bg.primary,
                                    borderRadius: borderRadius.lg,
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    border: `1px solid ${semanticColors.border.default}`,
                                    padding: `${spacing[1]}px 0`,
                                    zIndex: 10,
                                  }}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Handle edit
                                      setActiveTaskMenu(null)
                                    }}
                                    style={{
                                      width: '100%',
                                      minHeight: '44px',
                                      padding: `${spacing[2]}px ${spacing[3]}px`,
                                      textAlign: 'left',
                                      fontSize: fontSize.sm,
                                      color: semanticColors.text.primary,
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: spacing[2],
                                      transition: shouldReduceMotion ? 'none' : `background-color ${duration.fast}`,
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = semanticColors.bg.hover;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <Edit size={14} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm('Are you sure you want to delete this task?')) {
                                        handleDeleteTask(task.task_id)
                                      }
                                    }}
                                    disabled={deletingTask === task.task_id}
                                    style={{
                                      width: '100%',
                                      minHeight: '44px',
                                      padding: `${spacing[2]}px ${spacing[3]}px`,
                                      textAlign: 'left',
                                      fontSize: fontSize.sm,
                                      color: semanticColors.error.default,
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: spacing[2],
                                      transition: shouldReduceMotion ? 'none' : `background-color ${duration.fast}`,
                                      opacity: deletingTask === task.task_id ? 0.5 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (deletingTask !== task.task_id) {
                                        e.currentTarget.style.backgroundColor = semanticColors.bg.hover;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Task Metadata */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: spacing[3],
                          flexWrap: 'wrap',
                          gap: spacing[2],
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], flexWrap: 'wrap' }}>
                          {/* Priority Badge */}
                          <span
                            style={{
                              padding: `${spacing[1]}px ${spacing[2]}px`,
                              fontSize: fontSize.xs,
                              fontWeight: fontWeight.medium,
                              borderRadius: borderRadius.full,
                              backgroundColor: priorityColors[task.priority].bg,
                              color: priorityColors[task.priority].text,
                            }}
                          >
                            {task.priority.toUpperCase()}
                          </span>

                          {/* Status Badge */}
                          <span
                            style={{
                              padding: `${spacing[1]}px ${spacing[2]}px`,
                              fontSize: fontSize.xs,
                              fontWeight: fontWeight.medium,
                              borderRadius: borderRadius.full,
                              backgroundColor: statusColors[task.status].bg,
                              color: statusColors[task.status].text,
                            }}
                          >
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>

                          {/* Subtask Count */}
                          {task.subtask_count > 0 && (
                            <span
                              style={{
                                fontSize: fontSize.xs,
                                color: semanticColors.text.tertiary,
                              }}
                            >
                              {task.subtask_count} subtask{task.subtask_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {task.progress_percentage > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                            <div
                              style={{
                                width: '64px',
                                height: '8px',
                                backgroundColor: semanticColors.bg.tertiary,
                                borderRadius: borderRadius.full,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${task.progress_percentage}%`,
                                  backgroundColor: getProgressColor(task.progress_percentage),
                                  transition: shouldReduceMotion ? 'none' : `width ${duration.slow}`,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: fontSize.xs,
                                color: semanticColors.text.secondary,
                              }}
                            >
                              {task.progress_percentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}