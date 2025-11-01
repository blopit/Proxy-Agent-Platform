import type { Meta, StoryObj } from '@storybook/react';
import { TaskList } from './TaskList';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

// Mock the taskApi
jest.mock('@/services/taskApi', () => ({
  taskApi: {
    getTasks: jest.fn().mockResolvedValue({
      tasks: [
        {
          id: '1',
          title: 'Complete project documentation',
          description: 'Write comprehensive documentation for the project',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'user-1',
          tags: ['documentation', 'project'],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        },
        {
          id: '2',
          title: 'Review code changes',
          description: 'Review the latest pull requests',
          status: TaskStatus.TODO,
          priority: TaskPriority.MEDIUM,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'user-1',
          tags: ['code-review'],
          due_date: null,
          completed_at: null,
        },
        {
          id: '3',
          title: 'Fix critical bug',
          description: 'Fix the authentication bug in production',
          status: TaskStatus.BLOCKED,
          priority: TaskPriority.CRITICAL,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'user-1',
          tags: ['bug', 'critical'],
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        },
      ],
      total: 3,
      page: 1,
      limit: 10,
    }),
    updateTask: jest.fn().mockResolvedValue({}),
    deleteTask: jest.fn().mockResolvedValue({}),
  },
  TaskApiError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TaskApiError';
    }
  },
}));

const meta: Meta<typeof TaskList> = {
  title: 'Tasks/TaskList',
  component: TaskList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive task list component with filtering, sorting, and task management capabilities.',
      },
    },
  },
  argTypes: {
    projectId: {
      control: 'text',
      description: 'The project ID to load tasks for',
    },
    onTaskSelect: {
      action: 'taskSelected',
      description: 'Callback when a task is selected',
    },
    onTaskUpdate: {
      action: 'taskUpdated',
      description: 'Callback when a task is updated',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    projectId: 'project-123',
    onTaskSelect: (task: Task) => console.log('Task selected:', task),
    onTaskUpdate: (task: Task) => console.log('Task updated:', task),
  },
};

export default meta;
type Story = StoryObj<typeof TaskList>;

export const Default: Story = {
  args: {
    projectId: 'project-123',
  },
};

export const WithCustomClass: Story = {
  args: {
    projectId: 'project-123',
    className: 'max-w-4xl',
  },
};

export const EmptyState: Story = {
  args: {
    projectId: 'project-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component when no tasks are available.',
      },
    },
  },
  play: async () => {
    // Mock empty response
    const { taskApi } = require('@/services/taskApi');
    taskApi.getTasks.mockResolvedValueOnce({
      tasks: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  },
};

export const Loading: Story = {
  args: {
    projectId: 'project-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component in a loading state.',
      },
    },
  },
  play: async () => {
    // Mock loading state by delaying the response
    const { taskApi } = require('@/services/taskApi');
    taskApi.getTasks.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 2000))
    );
  },
};

export const WithError: Story = {
  args: {
    projectId: 'project-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component showing an error state.',
      },
    },
  },
  play: async () => {
    // Mock an error
    const { taskApi } = require('@/services/taskApi');
    taskApi.getTasks.mockRejectedValueOnce(new Error('Failed to load tasks'));
  },
};

export const FilteredByStatus: Story = {
  args: {
    projectId: 'project-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component with tasks filtered by status.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simulate filtering by status
    const filterButton = canvasElement.querySelector('[data-testid="filter-button"]');
    if (filterButton) {
      filterButton.click();
      
      // Wait for filter dropdown to appear and select a status
      setTimeout(() => {
        const statusFilter = canvasElement.querySelector('[data-testid="status-filter"]');
        if (statusFilter) {
          statusFilter.click();
        }
      }, 100);
    }
  },
};

export const SortedByPriority: Story = {
  args: {
    projectId: 'project-123',
  },
  parameters: {
    docs: {
      description: {
        story: 'The component with tasks sorted by priority.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Simulate sorting by priority
    const sortButton = canvasElement.querySelector('[data-testid="sort-button"]');
    if (sortButton) {
      sortButton.click();
      
      // Wait for sort dropdown to appear and select priority
      setTimeout(() => {
        const prioritySort = canvasElement.querySelector('[data-testid="priority-sort"]');
        if (prioritySort) {
          prioritySort.click();
        }
      }, 100);
    }
  },
};
