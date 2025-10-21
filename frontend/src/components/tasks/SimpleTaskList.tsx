import React, { useState, useEffect } from 'react'
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
import { Task, TaskStatus, TaskPriority } from '@/types/task'

interface TaskListProps {
  projectId: string
  onTaskSelect: (task: Task) => void
  onTaskUpdate: (task: Task) => void
  className?: string
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

export function SimpleTaskList({ projectId, onTaskSelect, onTaskUpdate, className = '' }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load tasks from API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await taskApi.listTasks({
          project_id: projectId,
          limit: 50,
          sort_by: 'created_at',
          sort_order: 'desc'
        })

        setTasks(response.tasks || [])
      } catch (err) {
        console.error('Failed to load tasks:', err)
        if (err instanceof TaskApiError) {
          setError(`Failed to load tasks: ${err.message}`)
        } else {
          setError('Failed to load tasks. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [projectId])

  const handleTaskClick = (task: Task) => {
    onTaskSelect(task)
  }

  const handleStatusToggle = async (task: Task) => {
    try {
      const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED
      const updates = {
        status: newStatus,
        progress_percentage: newStatus === TaskStatus.COMPLETED ? 100 : 0
      }

      // Update task via API
      const updatedTask = await taskApi.updateTask(task.task_id, updates)

      // Update local state
      setTasks(prev => prev.map(t => t.task_id === task.task_id ? updatedTask : t))
      onTaskUpdate(updatedTask)
    } catch (err) {
      console.error('Failed to update task status:', err)
      if (err instanceof TaskApiError) {
        setError(`Failed to update task: ${err.message}`)
      }
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
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Tasks ({tasks.length})</h2>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Demo Mode - Showing sample tasks</span>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Circle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Create your first task to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const StatusIcon = task.status === TaskStatus.COMPLETED ? CheckCircle2 : Circle
            return (
              <div
                key={task.task_id}
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
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}