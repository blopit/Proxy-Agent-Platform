import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskList } from '../TaskList'
import { taskApi } from '@/services/taskApi'
import { TaskStatus, TaskPriority } from '@/types/task'

// Mock the task API
jest.mock('@/services/taskApi', () => ({
  taskApi: {
    listTasks: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}))

const mockTasks = [
  {
    task_id: 'task-1',
    title: 'Buy groceries',
    description: 'Get milk, bread, and eggs',
    project_id: 'proj-123',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    tags: ['shopping', 'urgent'],
    progress_percentage: 0,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    dependencies: [],
    labels: [],
    external_references: {},
    subtask_count: 0,
  },
  {
    task_id: 'task-2',
    title: 'Complete project proposal',
    description: 'Write the quarterly project proposal',
    project_id: 'proj-123',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    tags: ['work'],
    progress_percentage: 60,
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T11:00:00Z',
    dependencies: [],
    labels: [],
    external_references: {},
    subtask_count: 2,
  },
  {
    task_id: 'task-3',
    title: 'Review code changes',
    description: 'Review the new authentication module',
    project_id: 'proj-123',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    tags: ['development'],
    progress_percentage: 100,
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T12:00:00Z',
    completed_at: '2024-01-01T12:00:00Z',
    dependencies: [],
    labels: [],
    external_references: {},
    subtask_count: 0,
  },
]

const mockOnTaskSelect = jest.fn()
const mockOnTaskUpdate = jest.fn()

const defaultProps = {
  projectId: 'proj-123',
  onTaskSelect: mockOnTaskSelect,
  onTaskUpdate: mockOnTaskUpdate,
}

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(taskApi.listTasks as jest.Mock).mockResolvedValue({
      tasks: mockTasks,
      total: 3,
      limit: 10,
      offset: 0,
    })
  })

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      render(<TaskList {...defaultProps} />)
      expect(screen.getByText(/loading tasks/i)).toBeInTheDocument()
    })

    it('renders task list after loading', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
        expect(screen.getByText('Complete project proposal')).toBeInTheDocument()
        expect(screen.getByText('Review code changes')).toBeInTheDocument()
      })
    })

    it('displays task priorities correctly', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('HIGH')).toBeInTheDocument()
        expect(screen.getByText('MEDIUM')).toBeInTheDocument()
        expect(screen.getByText('LOW')).toBeInTheDocument()
      })
    })

    it('displays task status correctly', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('TODO')).toBeInTheDocument()
        expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
        expect(screen.getByText('COMPLETED')).toBeInTheDocument()
      })
    })

    it('shows progress bars for tasks with progress', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        // Task 2 has 60% progress
        expect(screen.getByText('60%')).toBeInTheDocument()
        // Task 3 has 100% progress
        expect(screen.getByText('100%')).toBeInTheDocument()
      })
    })

    it('displays subtask count when present', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('2 subtasks')).toBeInTheDocument()
      })
    })
  })

  describe('Filtering', () => {
    it('renders filter buttons', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /todo/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /in progress/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument()
      })
    })

    it('filters tasks by status when filter button is clicked', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /todo/i }))
      })

      expect(taskApi.listTasks).toHaveBeenLastCalledWith({
        project_id: 'proj-123',
        status: 'todo',
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        sort_order: 'desc',
      })
    })

    it('shows priority filter dropdown', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /priority/i })).toBeInTheDocument()
      })
    })

    it('filters tasks by priority', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        const priorityButton = screen.getByRole('button', { name: /priority/i })
        fireEvent.click(priorityButton)
      })

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /high/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /high/i }))

      expect(taskApi.listTasks).toHaveBeenLastCalledWith({
        project_id: 'proj-123',
        priority: 'high',
        limit: 20,
        offset: 0,
        sort_by: 'created_at',
        sort_order: 'desc',
      })
    })
  })

  describe('Task Interactions', () => {
    it('calls onTaskSelect when task is clicked', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        fireEvent.click(screen.getByText('Buy groceries'))
      })

      expect(mockOnTaskSelect).toHaveBeenCalledWith(mockTasks[0])
    })

    it('allows updating task status', async () => {
      ;(taskApi.updateTask as jest.Mock).mockResolvedValue({
        ...mockTasks[0],
        status: TaskStatus.COMPLETED,
      })

      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        const statusButton = screen.getAllByRole('button')[0] // First task's status button
        fireEvent.click(statusButton)
      })

      expect(taskApi.updateTask).toHaveBeenCalledWith('task-1', {
        status: TaskStatus.COMPLETED,
      })
      expect(mockOnTaskUpdate).toHaveBeenCalled()
    })

    it('shows task actions menu', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        const moreButton = screen.getAllByRole('button', { name: /more/i })[0]
        fireEvent.click(moreButton)
      })

      expect(screen.getByText(/edit/i)).toBeInTheDocument()
      expect(screen.getByText(/delete/i)).toBeInTheDocument()
    })

    it('handles task deletion', async () => {
      ;(taskApi.deleteTask as jest.Mock).mockResolvedValue(undefined)

      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        const moreButton = screen.getAllByRole('button', { name: /more/i })[0]
        fireEvent.click(moreButton)
      })

      const deleteButton = screen.getByText(/delete/i)
      fireEvent.click(deleteButton)

      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: /confirm/i })
        fireEvent.click(confirmButton)
      })

      expect(taskApi.deleteTask).toHaveBeenCalledWith('task-1')
    })
  })

  describe('Sorting', () => {
    it('provides sort options', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument()
      })
    })

    it('sorts tasks by different criteria', async () => {
      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        const sortButton = screen.getByRole('button', { name: /sort/i })
        fireEvent.click(sortButton)
      })

      await waitFor(() => {
        const prioritySort = screen.getByText(/priority/i)
        fireEvent.click(prioritySort)
      })

      expect(taskApi.listTasks).toHaveBeenLastCalledWith({
        project_id: 'proj-123',
        limit: 20,
        offset: 0,
        sort_by: 'priority',
        sort_order: 'desc',
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when API fails', async () => {
      ;(taskApi.listTasks as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument()
      })
    })

    it('provides retry option on error', async () => {
      ;(taskApi.listTasks as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      ).mockResolvedValueOnce({
        tasks: mockTasks,
        total: 3,
        limit: 10,
        offset: 0,
      })

      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: /retry/i })
        fireEvent.click(retryButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Buy groceries')).toBeInTheDocument()
      })
    })
  })

  describe('Mobile Optimization', () => {
    it('shows compact view on mobile', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByTestId('task-list-mobile')).toBeInTheDocument()
      })
    })

    it('supports swipe gestures for task actions', async () => {
      // This would test swipe-to-action functionality
      render(<TaskList {...defaultProps} />)

      // Mock touch events would go here
      // Testing swipe gestures requires more complex setup
    })
  })

  describe('Empty State', () => {
    it('shows empty state when no tasks', async () => {
      ;(taskApi.listTasks as jest.Mock).mockResolvedValue({
        tasks: [],
        total: 0,
        limit: 10,
        offset: 0,
      })

      render(<TaskList {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/no tasks found/i)).toBeInTheDocument()
        expect(screen.getByText(/create your first task/i)).toBeInTheDocument()
      })
    })

    it('shows filtered empty state', async () => {
      ;(taskApi.listTasks as jest.Mock).mockResolvedValue({
        tasks: [],
        total: 0,
        limit: 10,
        offset: 0,
      })

      render(<TaskList {...defaultProps} />)

      // Apply a filter first
      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /completed/i }))
      })

      await waitFor(() => {
        expect(screen.getByText(/no completed tasks/i)).toBeInTheDocument()
      })
    })
  })
})