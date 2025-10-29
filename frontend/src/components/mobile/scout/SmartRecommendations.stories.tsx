import type { Meta, StoryObj } from '@storybook/react';
import SmartRecommendations from './SmartRecommendations';
import { semanticColors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof SmartRecommendations> = {
  title: 'Mobile/Scout/SmartRecommendations',
  component: SmartRecommendations,
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
    onHunt: { action: 'hunt' },
    onViewTask: { action: 'view-task' },
    onToggleCollapse: { action: 'toggle-collapse' },
  },
};

export default meta;
type Story = StoryObj<typeof SmartRecommendations>;

// ============================================================================
// Stories
// ============================================================================

export const ThreeRecommendations: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Reply to client email about project status',
          description: 'Quick status update',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.08,
          tags: ['email', 'communication'],
          zone: 'Work',
        },
        reason: 'Your energy matches this task perfectly, and it only takes 5 minutes',
        badges: ['quick-win', 'high-impact'],
        confidence: 92,
      },
      {
        task: {
          task_id: '2',
          title: 'Review marketing proposal for Q4',
          description: 'Detailed review needed',
          status: 'pending',
          priority: 'high',
          estimated_hours: 1.5,
          tags: ['review', 'marketing'],
          zone: 'Work',
        },
        reason: 'Due today at 5pm - high priority and blocking team progress',
        badges: ['urgent', 'high-impact'],
        confidence: 88,
      },
      {
        task: {
          task_id: '3',
          title: 'Call mom for birthday',
          description: 'Wish happy birthday',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.5,
          tags: ['personal', 'family'],
          zone: 'Relationships',
        },
        reason: "You haven't worked on Relationships zone in 6 days - maintain life balance",
        badges: ['zone-neglected', 'quick-win'],
        confidence: 75,
      },
    ],
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: 'Standard view with 3 AI-powered recommendations ranked by confidence. Each shows reasoning, badges, and confidence score.',
      },
    },
  },
};

export const OneRecommendation: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Submit expense report by EOD',
          description: 'Finance needs it today',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.25,
          tags: ['admin', 'urgent'],
          zone: 'Work',
        },
        reason: 'Due today at 5pm - only 15 minutes required, unblock finance team',
        badges: ['urgent', 'quick-win', 'high-impact'],
        confidence: 95,
      },
    ],
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: 'Single clear recommendation - when AI has high confidence in one obvious choice.',
      },
    },
  },
};

export const UrgentFirst: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Fix production bug in user authentication',
          description: 'Users cannot log in',
          status: 'pending',
          priority: 'urgent',
          estimated_hours: 2,
          tags: ['bug', 'production', 'urgent'],
          zone: 'Work',
        },
        reason: 'Critical production issue affecting all users - immediate action required',
        badges: ['urgent', 'high-impact'],
        confidence: 98,
      },
      {
        task: {
          task_id: '2',
          title: 'Respond to CEO email',
          description: 'Urgent request for Q3 data',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.5,
          tags: ['email', 'urgent', 'leadership'],
          zone: 'Work',
        },
        reason: 'CEO is waiting for your response - received 2 hours ago',
        badges: ['urgent', 'quick-win'],
        confidence: 90,
      },
      {
        task: {
          task_id: '3',
          title: 'Prepare for client call at 3pm',
          description: 'Review notes and agenda',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.5,
          tags: ['meeting-prep', 'client'],
          zone: 'Work',
        },
        reason: 'Meeting in 1 hour - prepare to avoid looking unprepared',
        badges: ['urgent'],
        confidence: 85,
      },
    ],
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '⏰ Urgent-first ranking - all recommendations have urgent badges, sorted by criticality.',
      },
    },
  },
};

export const QuickWinFirst: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Reply to Slack message from team',
          description: 'Quick question about deploy',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 0.03, // 2 minutes
          tags: ['communication', 'slack'],
          zone: 'Work',
        },
        reason: 'Takes only 2 minutes and unblocks your teammate',
        badges: ['quick-win', 'energy-match'],
        confidence: 88,
      },
      {
        task: {
          task_id: '2',
          title: 'Add task to project board',
          description: 'From this morning meeting',
          status: 'pending',
          priority: 'low',
          estimated_hours: 0.05, // 3 minutes
          tags: ['admin', 'planning'],
          zone: 'Work',
        },
        reason: 'Quick admin task while your energy is low - easy completion',
        badges: ['quick-win'],
        confidence: 75,
      },
      {
        task: {
          task_id: '3',
          title: 'Update Jira ticket status',
          description: 'Mark as complete',
          status: 'pending',
          priority: 'low',
          estimated_hours: 0.05,
          tags: ['admin'],
          zone: 'Work',
        },
        reason: 'Another quick win to build momentum',
        badges: ['quick-win'],
        confidence: 70,
      },
    ],
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '⚡ Quick wins - perfect for low energy moments, all tasks under 5 minutes.',
      },
    },
  },
};

export const ZoneBalanceFirst: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Schedule gym session for this week',
          description: 'Book a class or personal time',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 0.17, // 10 minutes
          tags: ['health', 'exercise', 'planning'],
          zone: 'Health',
        },
        reason: "Health zone neglected for 8 days - you'll feel better with physical activity",
        badges: ['zone-neglected', 'quick-win'],
        confidence: 82,
      },
      {
        task: {
          task_id: '2',
          title: 'Text Sarah about weekend plans',
          description: 'Confirm dinner plans',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 0.05,
          tags: ['social', 'personal'],
          zone: 'Relationships',
        },
        reason: "Relationships zone needs attention - you've been focused only on work",
        badges: ['zone-neglected', 'quick-win'],
        confidence: 78,
      },
      {
        task: {
          task_id: '3',
          title: 'Review quarterly budget',
          description: 'Check spending vs goals',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 1,
          tags: ['finance', 'planning'],
          zone: 'Work',
        },
        reason: 'Important for financial health, matches your current focus mode',
        badges: ['high-impact'],
        confidence: 65,
      },
    ],
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '⚖️ Zone balance - prioritizes neglected life zones (Health, Relationships) to maintain balance.',
      },
    },
  },
};

export const EnergyMatch: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Brainstorm new product features',
          description: 'Creative thinking session',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 1,
          tags: ['creative', 'planning'],
          zone: 'Work',
        },
        reason: 'Your energy is high right now - perfect for creative work',
        badges: ['energy-match', 'high-impact'],
        confidence: 85,
      },
      {
        task: {
          task_id: '2',
          title: 'Write blog post about productivity',
          description: '1000 words',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 2,
          tags: ['writing', 'content'],
          zone: 'Work',
        },
        reason: 'Morning energy is ideal for deep writing work',
        badges: ['energy-match'],
        confidence: 80,
      },
      {
        task: {
          task_id: '3',
          title: 'Design new landing page mockup',
          description: 'Creative design work',
          status: 'pending',
          priority: 'high',
          estimated_hours: 3,
          tags: ['design', 'creative'],
          zone: 'Work',
        },
        reason: 'Your creative energy is peaked - tackle this challenging design task',
        badges: ['energy-match', 'high-impact'],
        confidence: 78,
      },
    ],
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '⚡ Energy-matched tasks - recommendations aligned with your current energy level (high = creative work).',
      },
    },
  },
};

export const MixedBadges: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Deploy critical hotfix to production',
          description: 'Security patch',
          status: 'pending',
          priority: 'urgent',
          estimated_hours: 0.5,
          tags: ['deployment', 'security', 'urgent'],
          zone: 'Work',
        },
        reason: 'Critical security issue - quick deployment, high impact, perfectly matches your current state',
        badges: ['urgent', 'quick-win', 'high-impact', 'energy-match'],
        confidence: 96,
      },
      {
        task: {
          task_id: '2',
          title: 'Update mom on life events',
          description: 'Weekly catch-up call',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 0.5,
          tags: ['family', 'personal'],
          zone: 'Relationships',
        },
        reason: "Haven't called in 2 weeks - Relationships zone needs love, quick 30min call",
        badges: ['zone-neglected', 'quick-win', 'trending'],
        confidence: 72,
      },
      {
        task: {
          task_id: '3',
          title: 'Research competitor products',
          description: 'Market analysis',
          status: 'pending',
          priority: 'low',
          estimated_hours: 2,
          tags: ['research', 'strategy'],
          zone: 'Work',
        },
        reason: 'Good fit for afternoon research time, valuable strategic work',
        badges: ['high-impact', 'energy-match'],
        confidence: 68,
      },
    ],
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: 'Tasks with multiple badges showing different recommendation factors.',
      },
    },
  },
};

export const Collapsible: Story = {
  args: {
    recommendations: [
      {
        task: {
          task_id: '1',
          title: 'Review pull request #234',
          status: 'pending',
          priority: 'high',
          estimated_hours: 0.5,
          zone: 'Work',
        },
        reason: 'Code review needed to unblock deployment',
        badges: ['urgent', 'quick-win'],
        confidence: 85,
      },
      {
        task: {
          task_id: '2',
          title: 'Update project timeline',
          status: 'pending',
          priority: 'medium',
          estimated_hours: 1,
          zone: 'Work',
        },
        reason: 'Stakeholders need updated timeline by EOD',
        badges: ['high-impact'],
        confidence: 75,
      },
    ],
    isCollapsed: false,
    onHunt: (task) => console.log('Hunt:', task.title),
    onViewTask: (task) => console.log('View:', task.title),
    onToggleCollapse: () => console.log('Toggle collapse'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Recommendations can be collapsed to save screen space - click chevron to toggle.',
      },
    },
  },
};
