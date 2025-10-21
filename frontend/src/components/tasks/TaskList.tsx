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

const statusColors = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-700',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [TaskStatus.BLOCKED]: 'bg-red-100 text-red-700',
  [TaskStatus.REVIEW]: 'bg-yellow-100 text-yellow-700',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-700',
  [TaskStatus.CANCELLED]: 'bg-gray-100 text-gray-500',
}

const priorityColors = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-600',
  [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-600',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-600',
  [TaskPriority.CRITICAL]: 'bg-red-100 text-red-600',
}

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

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadTasks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    <div className={`space-y-6 ${className}`} data-testid={isMobile ? 'task-list-mobile' : 'task-list-desktop'}>
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>

        <div className="flex items-center space-x-2">
          {/* Status Filters */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleStatusFilter(undefined)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                !filter.status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter(TaskStatus.TODO)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter.status === TaskStatus.TODO ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todo
            </button>
            <button
              onClick={() => handleStatusFilter(TaskStatus.IN_PROGRESS)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter.status === TaskStatus.IN_PROGRESS ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => handleStatusFilter(TaskStatus.COMPLETED)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter.status === TaskStatus.COMPLETED ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              <span>Priority</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => handlePriorityFilter(undefined)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    All
                  </button>
                  <button
                    onClick={() => handlePriorityFilter(TaskPriority.HIGH)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    High
                  </button>
                  <button
                    onClick={() => handlePriorityFilter(TaskPriority.MEDIUM)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => handlePriorityFilter(TaskPriority.LOW)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Low
                  </button>
                </div>
              )}
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Sort</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                >
                  <button
                    onClick={() => handleSort('created_at')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Created Date
                  </button>
                  <button
                    onClick={() => handleSort('priority')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Priority
                  </button>
                  <button
                    onClick={() => handleSort('title')}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Title
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Circle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter.status || filter.priority ? filteredMessage : 'No tasks found'}
          </h3>
          <p className="text-gray-600">
            {filter.status || filter.priority ?
              'Try adjusting your filters to see more tasks.' :
              'Create your first task to get started.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task) => {
              const StatusIcon = statusIcons[task.status]
              return (
                <motion.div
                  key={task.task_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Status Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStatusToggle(task)
                      }}
                      className="mt-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <StatusIcon className="w-5 h-5" />
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>

                        {/* Task Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveTaskMenu(activeTaskMenu === task.task_id ? null : task.task_id)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded"
                              aria-label="More actions"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {activeTaskMenu === task.task_id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      // Handle edit
                                      setActiveTaskMenu(null)
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Edit className="w-3 h-3" />
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
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2 disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Task Metadata */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-3">
                          {/* Priority Badge */}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                            {task.priority.toUpperCase()}
                          </span>

                          {/* Status Badge */}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>

                          {/* Subtask Count */}
                          {task.subtask_count > 0 && (
                            <span className="text-xs text-gray-500">
                              {task.subtask_count} subtask{task.subtask_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {task.progress_percentage > 0 && (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${getProgressColor(task.progress_percentage)}`}
                                style={{ width: `${task.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{task.progress_percentage}%</span>
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