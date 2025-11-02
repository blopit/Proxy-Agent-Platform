/**
 * TaskCardBig Stories - React Native Storybook
 * Demonstrates all variants of the TaskCardBig component
 */

import type { Meta, StoryObj } from '@storybook/react';
import TaskCardBig from './TaskCardBig';

const meta = {
  title: 'Cards/TaskCardBig',
  component: TaskCardBig,
  parameters: {
    notes: 'ADHD-optimized task card with micro-steps preview and breakdown visualization',
  },
  argTypes: {
    onStartTask: { action: 'start task' },
    onViewDetails: { action: 'view details' },
  },
} satisfies Meta<typeof TaskCardBig>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample task data
const sampleTask = {
  title: 'Build authentication system',
  description: 'Implement JWT-based authentication with refresh tokens and role-based access control',
  status: 'pending' as const,
  priority: 'high' as const,
  estimated_hours: 4,
  tags: ['backend', 'security', 'authentication'],
  is_digital: true,
  micro_steps: [
    {
      step_id: '1',
      description: 'Set up JWT token generation and validation utilities',
      estimated_minutes: 45,
      leaf_type: 'DIGITAL' as const,
      icon: '🔑',
      short_label: 'JWT Utils',
    },
    {
      step_id: '2',
      description: 'Create user authentication endpoints (login, logout, refresh)',
      estimated_minutes: 60,
      leaf_type: 'DIGITAL' as const,
      icon: '🚪',
      short_label: 'Auth Endpoints',
    },
    {
      step_id: '3',
      description: 'Implement role-based access control middleware',
      estimated_minutes: 50,
      leaf_type: 'DIGITAL' as const,
      icon: '🛡️',
      short_label: 'RBAC',
    },
    {
      step_id: '4',
      description: 'Write integration tests for auth flows',
      estimated_minutes: 70,
      leaf_type: 'DIGITAL' as const,
      icon: '🧪',
      short_label: 'Tests',
    },
  ],
  breakdown: {
    total_steps: 4,
    digital_count: 4,
    human_count: 0,
  },
  subtask_progress: {
    total: 4,
    completed: 1,
    percentage: 25,
  },
};

// Story: Default
export const Default: Story = {
  args: {
    task: sampleTask,
  },
};

// Story: High Priority
export const HighPriority: Story = {
  args: {
    task: {
      ...sampleTask,
      priority: 'critical',
      title: 'Fix critical security vulnerability',
      description: 'Patch SQL injection vulnerability in user search endpoint',
    },
  },
};

// Story: Mixed Digital/Human Steps
export const MixedSteps: Story = {
  args: {
    task: {
      title: 'Launch new product feature',
      description: 'Coordinate with design, engineering, and marketing for feature launch',
      priority: 'medium',
      estimated_hours: 8,
      tags: ['product', 'launch', 'cross-functional'],
      is_digital: false,
      micro_steps: [
        {
          step_id: '1',
          description: 'Review designs with design team',
          estimated_minutes: 60,
          leaf_type: 'HUMAN' as const,
          icon: '🎨',
        },
        {
          step_id: '2',
          description: 'Implement frontend components',
          estimated_minutes: 180,
          leaf_type: 'DIGITAL' as const,
          icon: '💻',
        },
        {
          step_id: '3',
          description: 'Coordinate with marketing on messaging',
          estimated_minutes: 45,
          leaf_type: 'HUMAN' as const,
          icon: '📣',
        },
        {
          step_id: '4',
          description: 'Deploy to staging environment',
          estimated_minutes: 30,
          leaf_type: 'DIGITAL' as const,
          icon: '🚀',
        },
      ],
      breakdown: {
        total_steps: 4,
        digital_count: 2,
        human_count: 2,
      },
      subtask_progress: {
        total: 4,
        completed: 2,
        percentage: 50,
      },
    },
  },
};

// Story: Low Priority
export const LowPriority: Story = {
  args: {
    task: {
      title: 'Refactor logging utilities',
      description: 'Clean up and consolidate logging functions across the codebase',
      priority: 'low',
      estimated_hours: 2,
      tags: ['refactor', 'tech-debt'],
      is_digital: true,
      micro_steps: [
        {
          step_id: '1',
          description: 'Audit current logging patterns',
          estimated_minutes: 30,
          leaf_type: 'DIGITAL' as const,
        },
        {
          step_id: '2',
          description: 'Create unified logging module',
          estimated_minutes: 45,
          leaf_type: 'DIGITAL' as const,
        },
        {
          step_id: '3',
          description: 'Update existing code to use new logger',
          estimated_minutes: 60,
          leaf_type: 'DIGITAL' as const,
        },
      ],
      breakdown: {
        total_steps: 3,
        digital_count: 3,
        human_count: 0,
      },
    },
  },
};

// Story: No Micro Steps
export const NoMicroSteps: Story = {
  args: {
    task: {
      title: 'Research database migration strategies',
      description: 'Evaluate options for migrating from PostgreSQL to a distributed database',
      priority: 'medium',
      estimated_hours: 3,
      tags: ['research', 'database', 'architecture'],
      is_digital: false,
      micro_steps: [],
    },
  },
};

// Story: In Progress
export const InProgress: Story = {
  args: {
    task: {
      ...sampleTask,
      status: 'in-progress',
      subtask_progress: {
        total: 4,
        completed: 2,
        percentage: 50,
      },
    },
  },
};

// Story: Nearly Complete
export const NearlyComplete: Story = {
  args: {
    task: {
      ...sampleTask,
      subtask_progress: {
        total: 4,
        completed: 3,
        percentage: 75,
      },
    },
  },
};

// Story: Many Tags
export const ManyTags: Story = {
  args: {
    task: {
      ...sampleTask,
      tags: [
        'backend',
        'security',
        'authentication',
        'api',
        'jwt',
        'authorization',
        'rbac',
        'critical',
      ],
    },
  },
};
