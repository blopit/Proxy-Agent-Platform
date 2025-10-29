import type { Meta, StoryObj } from '@storybook/react';
import TaskInspector from './TaskInspector';
import { semanticColors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof TaskInspector> = {
  title: 'Mobile/Scout/TaskInspector',
  component: TaskInspector,
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
    onClose: { action: 'close' },
    onPin: { action: 'pin' },
    onDefer: { action: 'defer' },
    onEdit: { action: 'edit' },
  },
};

export default meta;
type Story = StoryObj<typeof TaskInspector>;

// ============================================================================
// Mock Data
// ============================================================================

const baseTask = {
  task_id: '1',
  title: 'Review project proposal',
  description: 'Review the Q4 marketing proposal and provide feedback on budget allocation and timeline.',
  status: 'pending',
  priority: 'high',
  estimated_hours: 1.5,
  tags: ['review', 'marketing', 'urgent'],
  is_digital: true,
  created_at: '2025-10-20T10:00:00Z',
  due_date: '2025-10-28T17:00:00Z',
  zone: 'Work',
};

const relatedFiles = [
  {
    id: 'f1',
    name: 'Q4_Marketing_Proposal.pdf',
    type: 'pdf' as const,
    url: 'https://example.com/proposal.pdf',
    lastModified: '2 hours ago',
  },
  {
    id: 'f2',
    name: 'Budget_Analysis.xlsx',
    type: 'doc' as const,
    lastModified: '1 day ago',
  },
  {
    id: 'f3',
    name: 'Campaign_Strategy_Doc',
    type: 'link' as const,
    url: 'https://notion.so/campaign',
    lastModified: '3 days ago',
  },
];

const relatedContacts = [
  {
    id: 'c1',
    name: 'Sarah Chen',
    role: 'assigned_by',
    avatar: '👩',
  },
  {
    id: 'c2',
    name: 'Mike Rodriguez',
    role: 'can_help',
    avatar: '👨',
  },
  {
    id: 'c3',
    name: 'Jessica Park',
    role: 'stakeholder',
  },
];

const dependencies = [
  {
    task_id: 'd1',
    title: 'Finalize Q3 report',
    type: 'blocked_by' as const,
    status: 'in_progress',
  },
  {
    task_id: 'd2',
    title: 'Present proposal to team',
    type: 'blocks' as const,
    status: 'pending',
  },
  {
    task_id: 'd3',
    title: 'Update marketing calendar',
    type: 'related_to' as const,
    status: 'pending',
  },
];

const activityHistory = [
  {
    id: 'a1',
    action: 'Task created',
    timestamp: 'Oct 20, 10:00 AM',
    details: 'Created by Sarah Chen',
  },
  {
    id: 'a2',
    action: 'Priority changed to High',
    timestamp: 'Oct 22, 2:30 PM',
    details: 'Changed from Medium to High',
  },
  {
    id: 'a3',
    action: 'File attached',
    timestamp: 'Oct 25, 11:00 AM',
    details: 'Q4_Marketing_Proposal.pdf added',
  },
  {
    id: 'a4',
    action: 'Comment added',
    timestamp: 'Oct 26, 4:15 PM',
    details: 'Sarah: "Please review budget section carefully"',
  },
];

// ============================================================================
// Stories
// ============================================================================

export const SimpleTask: Story = {
  args: {
    task: baseTask,
    energyCost: 6,
    estimatedReward: { xp: 75, impact: 'high' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic task with minimal context - just task details, no files/contacts/dependencies.',
      },
    },
  },
};

export const TaskWithFiles: Story = {
  args: {
    task: baseTask,
    relatedFiles: relatedFiles,
    energyCost: 5,
    estimatedReward: { xp: 75, impact: 'high' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Task with related files - PDF, spreadsheet, and Notion link. Click Files tab to view.',
      },
    },
  },
};

export const TaskWithContacts: Story = {
  args: {
    task: baseTask,
    relatedContacts: relatedContacts,
    energyCost: 4,
    estimatedReward: { xp: 75, impact: 'high' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Task with related contacts - shows who assigned it, who can help, and stakeholders.',
      },
    },
  },
};

export const TaskWithDependencies: Story = {
  args: {
    task: {
      ...baseTask,
      title: 'Present proposal to team',
      description: 'Present the Q4 marketing proposal to the executive team. Blocked by finalization of Q3 report.',
    },
    dependencies: dependencies,
    energyCost: 7,
    estimatedReward: { xp: 100, impact: 'high' },
    readinessStatus: 'needs_context',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Task with dependencies - shows what blocks it, what it blocks, and related tasks.',
      },
    },
  },
};

export const ComplexTask: Story = {
  args: {
    task: baseTask,
    relatedFiles: relatedFiles,
    relatedContacts: relatedContacts,
    dependencies: dependencies,
    activityHistory: activityHistory,
    energyCost: 8,
    estimatedReward: { xp: 150, impact: 'high' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
    onPin: () => console.log('Pin clicked'),
    onDefer: () => console.log('Defer clicked'),
    onEdit: () => console.log('Edit clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex task with ALL context - files, contacts, dependencies, and activity history. Full decision support.',
      },
    },
  },
};

export const ReadyToHunt: Story = {
  args: {
    task: {
      task_id: '2',
      title: 'Write blog post about productivity tips',
      description: 'Write a 1000-word blog post about productivity tips for remote workers. All research is complete.',
      status: 'pending',
      priority: 'medium',
      estimated_hours: 2,
      tags: ['writing', 'content', 'blog'],
      is_digital: true,
      zone: 'Work',
    },
    relatedFiles: [
      {
        id: 'f1',
        name: 'Research_Notes.md',
        type: 'doc' as const,
        lastModified: '1 day ago',
      },
      {
        id: 'f2',
        name: 'Outline.md',
        type: 'doc' as const,
        lastModified: '2 hours ago',
      },
    ],
    energyCost: 5,
    estimatedReward: { xp: 100, impact: 'medium' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: '✅ Ready to Hunt - Task has all context needed, green status, huntable immediately.',
      },
    },
  },
};

export const MissingContext: Story = {
  args: {
    task: {
      task_id: '3',
      title: 'Design landing page mockup',
      description: 'Create a mockup for the new product landing page. Waiting for brand guidelines.',
      status: 'pending',
      priority: 'high',
      estimated_hours: 3,
      tags: ['design', 'mockup', 'urgent'],
      is_digital: true,
      zone: 'Work',
    },
    relatedContacts: [
      {
        id: 'c1',
        name: 'Design Lead',
        role: 'can_help',
      },
    ],
    energyCost: 7,
    estimatedReward: { xp: 125, impact: 'high' },
    readinessStatus: 'needs_context',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: '⚠️ Needs Context - Task is missing files or information. Yellow status, huntable but may be harder.',
      },
    },
  },
};

export const BlockedTask: Story = {
  args: {
    task: {
      task_id: '4',
      title: 'Deploy to production',
      description: 'Deploy the new feature to production environment. Cannot proceed until code review is complete.',
      status: 'pending',
      priority: 'high',
      estimated_hours: 0.5,
      tags: ['deployment', 'production', 'urgent'],
      is_digital: true,
      zone: 'Work',
    },
    dependencies: [
      {
        task_id: 'd1',
        title: 'Complete code review',
        type: 'blocked_by' as const,
        status: 'in_progress',
      },
      {
        task_id: 'd2',
        title: 'Run integration tests',
        type: 'blocked_by' as const,
        status: 'pending',
      },
    ],
    energyCost: 3,
    estimatedReward: { xp: 50, impact: 'high' },
    readinessStatus: 'blocked',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: '🔴 Blocked - Task cannot be hunted due to unfinished dependencies. Red status, hunt button disabled.',
      },
    },
  },
};

export const QuickWin: Story = {
  args: {
    task: {
      task_id: '5',
      title: 'Reply to client email',
      description: 'Send quick update email to client about project status.',
      status: 'pending',
      priority: 'low',
      estimated_hours: 0.08, // 5 minutes
      tags: ['email', 'quick-win', 'communication'],
      is_digital: true,
      zone: 'Work',
    },
    energyCost: 2,
    estimatedReward: { xp: 25, impact: 'low' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: '⚡ Quick Win - Low energy cost (2/10), 5 minutes, perfect for low energy moments.',
      },
    },
  },
};

export const HighImpactTask: Story = {
  args: {
    task: {
      task_id: '6',
      title: 'Finalize partnership agreement',
      description: 'Review and sign the partnership agreement with major vendor. High stakes, requires deep focus.',
      status: 'pending',
      priority: 'high',
      estimated_hours: 4,
      tags: ['legal', 'partnership', 'high-stakes'],
      is_digital: false,
      zone: 'Work',
    },
    relatedFiles: [
      {
        id: 'f1',
        name: 'Partnership_Agreement_Draft_v3.pdf',
        type: 'pdf' as const,
        lastModified: '1 hour ago',
      },
      {
        id: 'f2',
        name: 'Legal_Review_Notes.pdf',
        type: 'pdf' as const,
        lastModified: 'Yesterday',
      },
    ],
    relatedContacts: [
      {
        id: 'c1',
        name: 'Legal Counsel',
        role: 'can_help',
      },
      {
        id: 'c2',
        name: 'CEO',
        role: 'stakeholder',
      },
    ],
    activityHistory: [
      {
        id: 'a1',
        action: 'Task created',
        timestamp: 'Oct 15, 9:00 AM',
      },
      {
        id: 'a2',
        action: 'File attached',
        timestamp: 'Oct 25, 3:00 PM',
        details: 'Partnership_Agreement_Draft_v3.pdf',
      },
    ],
    energyCost: 9,
    estimatedReward: { xp: 250, impact: 'critical' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: '🎯 High Impact - Requires high energy (9/10), 4 hours, critical impact, big XP reward (250 XP).',
      },
    },
  },
};

export const PersonalTask: Story = {
  args: {
    task: {
      task_id: '7',
      title: 'Call mom for birthday',
      description: "Mom's birthday is tomorrow. Give her a call to catch up and wish her happy birthday.",
      status: 'pending',
      priority: 'high',
      estimated_hours: 0.5,
      tags: ['family', 'personal', 'phone'],
      is_digital: false,
      zone: 'Relationships',
    },
    energyCost: 3,
    estimatedReward: { xp: 50, impact: 'personal' },
    readinessStatus: 'ready',
    onHunt: () => console.log('Hunt clicked'),
    onClose: () => console.log('Close clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: '❤️ Personal/Relationships Zone - Family task, different zone from work, helps maintain life balance.',
      },
    },
  },
};
