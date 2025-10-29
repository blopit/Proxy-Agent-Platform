import type { Meta, StoryObj } from '@storybook/react';
import DecisionHelper from './DecisionHelper';
import { semanticColors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof DecisionHelper> = {
  title: 'Mobile/Scout/DecisionHelper',
  component: DecisionHelper,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'solarized-dark',
      values: [
        {
          name: 'solarized-dark',
          value: semanticColors.bg.primary,
        },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onChooseTask: { action: 'choose-task' },
    onViewDetails: { action: 'view-details' },
  },
};

export default meta;
type Story = StoryObj<typeof DecisionHelper>;

// ============================================================================
// Stories
// ============================================================================

export const ComparingTwoTasks: Story = {
  args: {
    comparisons: [
      {
        task: {
          task_id: '1',
          title: 'Review project proposal',
          description: 'Review Q4 marketing proposal',
          status: 'pending',
          priority: 'high',
          estimated_hours: 1.5,
          zone: 'Work',
        },
        energyCost: 6,
        estimatedReward: { xp: 75, impact: 'high' },
        readinessStatus: 'ready',
        completionProbability: 85,
      },
      {
        task: {
          task_id: '2',
          title: 'Write blog post',
          description: 'Write 1000-word blog post',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 2,
          zone: 'Work',
        },
        energyCost: 7,
        estimatedReward: { xp: 100, impact: 'medium' },
        readinessStatus: 'ready',
        completionProbability: 75,
      },
    ],
    onChooseTask: (task) => console.log('Chose:', task.title),
    onViewDetails: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of 2 tasks - shows energy, time, reward, and success rate with visual bars.',
      },
    },
  },
};

export const QuickWinVsDeepWork: Story = {
  args: {
    comparisons: [
      {
        task: {
          task_id: '1',
          title: 'Reply to client email',
          description: 'Quick status update',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 0.08, // 5 minutes
          zone: 'Work',
        },
        energyCost: 2,
        estimatedReward: { xp: 25, impact: 'low' },
        readinessStatus: 'ready',
        completionProbability: 95,
      },
      {
        task: {
          task_id: '2',
          title: 'Design landing page mockup',
          description: 'Creative design work',
          status: 'pending',
          priority: 'high',
          estimated_hours: 3,
          zone: 'Work',
        },
        energyCost: 9,
        estimatedReward: { xp: 150, impact: 'high' },
        readinessStatus: 'ready',
        completionProbability: 60,
      },
    ],
    onChooseTask: (task) => console.log('Chose:', task.title),
    onViewDetails: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story:
          '⚡ Quick Win (5min, energy=2, 95% success) vs 🎯 Deep Work (3hr, energy=9, 60% success). Clear contrast.',
      },
    },
  },
};

export const ReadyVsBlocked: Story = {
  args: {
    comparisons: [
      {
        task: {
          task_id: '1',
          title: 'Update project documentation',
          description: 'All info available',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 1,
          zone: 'Work',
        },
        energyCost: 4,
        estimatedReward: { xp: 50, impact: 'medium' },
        readinessStatus: 'ready',
        completionProbability: 80,
      },
      {
        task: {
          task_id: '2',
          title: 'Deploy to production',
          description: 'Waiting for code review',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.5,
          zone: 'Work',
        },
        energyCost: 3,
        estimatedReward: { xp: 75, impact: 'high' },
        readinessStatus: 'blocked',
        completionProbability: 0,
      },
    ],
    onChooseTask: (task) => console.log('Chose:', task.title),
    onViewDetails: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '✅ Ready task (green border, huntable) vs 🔴 Blocked task (red border, button disabled). Clear status.',
      },
    },
  },
};

export const MissingContextVsReady: Story = {
  args: {
    comparisons: [
      {
        task: {
          task_id: '1',
          title: 'Design landing page',
          description: 'Waiting for brand guidelines',
          status: 'pending',
          priority: 'high',
          estimated_hours: 3,
          zone: 'Work',
        },
        energyCost: 7,
        estimatedReward: { xp: 125, impact: 'high' },
        readinessStatus: 'needs_context',
        completionProbability: 40,
      },
      {
        task: {
          task_id: '2',
          title: 'Write unit tests for API',
          description: 'All specs ready',
          status: 'pending',
          priority: 'high',
          estimated_hours: 2,
          zone: 'Work',
        },
        energyCost: 6,
        estimatedReward: { xp: 100, impact: 'high' },
        readinessStatus: 'ready',
        completionProbability: 85,
      },
    ],
    onChooseTask: (task) => console.log('Chose:', task.title),
    onViewDetails: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story:
          '⚠️ Missing Context (yellow, 40% success) vs ✅ Ready (green, 85% success). Helps choose the huntable one.',
      },
    },
  },
};

export const EqualDifficulty: Story = {
  args: {
    comparisons: [
      {
        task: {
          task_id: '1',
          title: 'Review code for authentication module',
          status: 'pending',
          priority: 'high',
          estimated_hours: 1.5,
          zone: 'Work',
        },
        energyCost: 6,
        estimatedReward: { xp: 75, impact: 'high' },
        readinessStatus: 'ready',
        completionProbability: 80,
      },
      {
        task: {
          task_id: '2',
          title: 'Update API documentation',
          status: 'pending',
          priority: 'high',
          estimated_hours: 1.5,
          zone: 'Work',
        },
        energyCost: 6,
        estimatedReward: { xp: 75, impact: 'high' },
        readinessStatus: 'ready',
        completionProbability: 80,
      },
    ],
    onChooseTask: (task) => console.log('Chose:', task.title),
    onViewDetails: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '⚖️ Equal difficulty - both tasks have same energy, time, reward, and success rate. Hard choice!',
      },
    },
  },
};

export const WorkLifeBalance: Story = {
  args: {
    comparisons: [
      {
        task: {
          task_id: '1',
          title: 'Finish quarterly report',
          description: 'Work deadline',
          status: 'pending',
          priority: 'high',
          estimated_hours: 2,
          zone: 'Work',
        },
        energyCost: 7,
        estimatedReward: { xp: 100, impact: 'high' },
        readinessStatus: 'ready',
        completionProbability: 75,
      },
      {
        task: {
          task_id: '2',
          title: 'Call mom for birthday',
          description: 'Personal relationship',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.5,
          zone: 'Relationships',
        },
        energyCost: 3,
        estimatedReward: { xp: 50, impact: 'personal' },
        readinessStatus: 'ready',
        completionProbability: 90,
      },
    ],
    onChooseTask: (task) => console.log('Chose:', task.title),
    onViewDetails: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '⚖️ Work vs Life - helps compare work deadline against personal relationship task. Zone balance.',
      },
    },
  },
};

export const HighImpactVsQuickWin: Story = {
  args: {
    comparisons: [
      {
        task: {
          task_id: '1',
          title: 'Finalize partnership agreement',
          description: 'Critical business decision',
          status: 'pending',
          priority: 'urgent',
          estimated_hours: 4,
          zone: 'Work',
        },
        energyCost: 9,
        estimatedReward: { xp: 250, impact: 'critical' },
        readinessStatus: 'ready',
        completionProbability: 70,
      },
      {
        task: {
          task_id: '2',
          title: 'Update Jira ticket status',
          description: 'Quick admin task',
          status: 'pending',
          priority: 'low',
          estimated_hours: 0.05, // 3 minutes
          zone: 'Work',
        },
        energyCost: 2,
        estimatedReward: { xp: 15, impact: 'low' },
        readinessStatus: 'ready',
        completionProbability: 98,
      },
    ],
    onChooseTask: (task) => console.log('Chose:', task.title),
    onViewDetails: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story:
          '🎯 Critical Impact (4hr, 250 XP, 70% success) vs ⚡ Quick Win (3min, 15 XP, 98% success). Risk vs reward.',
      },
    },
  },
};
