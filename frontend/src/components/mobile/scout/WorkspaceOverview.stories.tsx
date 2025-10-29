import type { Meta, StoryObj } from '@storybook/react';
import WorkspaceOverview from './WorkspaceOverview';
import { semanticColors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof WorkspaceOverview> = {
  title: 'Mobile/Scout/WorkspaceOverview',
  component: WorkspaceOverview,
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
    onFileClick: { action: 'file-clicked' },
    onTaskClick: { action: 'task-clicked' },
    onPinnedClick: { action: 'pinned-clicked' },
    onCloseFile: { action: 'close-file' },
    onUnpin: { action: 'unpin' },
  },
};

export default meta;
type Story = StoryObj<typeof WorkspaceOverview>;

// ============================================================================
// Stories
// ============================================================================

export const OpenFiles: Story = {
  args: {
    openFiles: [
      {
        id: 'f1',
        name: 'Q4_Marketing_Proposal.pdf',
        type: 'pdf',
        lastOpened: '5 min ago',
        relatedTaskId: 'task1',
      },
      {
        id: 'f2',
        name: 'Budget_Spreadsheet.xlsx',
        type: 'sheet',
        lastOpened: '1 hour ago',
      },
      {
        id: 'f3',
        name: 'Project_Spec.md',
        type: 'doc',
        lastOpened: '2 hours ago',
      },
      {
        id: 'f4',
        name: 'Design_Mockup.fig',
        type: 'image',
        lastOpened: 'Yesterday',
      },
    ],
    onFileClick: (file) => console.log('Clicked file:', file.name),
    onCloseFile: (id) => console.log('Close file:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows currently open files with type icons (PDF, sheets, docs, images). Horizontal scrolling with fade edges.',
      },
    },
  },
};

export const InProgressTasks: Story = {
  args: {
    inProgressTasks: [
      {
        id: 't1',
        title: 'Write blog post about productivity',
        progress: 65,
        lastWorkedOn: '30 min ago',
      },
      {
        id: 't2',
        title: 'Review code for authentication module',
        progress: 40,
        lastWorkedOn: '2 hours ago',
      },
      {
        id: 't3',
        title: 'Design landing page mockup',
        progress: 85,
        lastWorkedOn: 'This morning',
      },
    ],
    onTaskClick: (task) => console.log('Clicked task:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows tasks you started but haven\'t finished with progress bars and timestamps.',
      },
    },
  },
};

export const PinnedItems: Story = {
  args: {
    pinnedItems: [
      {
        id: 'p1',
        title: 'Weekly team standup notes',
        type: 'note',
      },
      {
        id: 'p2',
        title: 'Deploy to production checklist',
        type: 'task',
      },
      {
        id: 'p3',
        title: 'Client contact information',
        type: 'file',
      },
    ],
    onPinnedClick: (item) => console.log('Clicked pinned:', item.title),
    onUnpin: (id) => console.log('Unpin:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows user-pinned important items for quick access.',
      },
    },
  },
};

export const MixedWorkspace: Story = {
  args: {
    openFiles: [
      {
        id: 'f1',
        name: 'proposal.pdf',
        type: 'pdf',
        lastOpened: '10 min ago',
      },
      {
        id: 'f2',
        name: 'analysis.xlsx',
        type: 'sheet',
        lastOpened: '1 hour ago',
      },
    ],
    inProgressTasks: [
      {
        id: 't1',
        title: 'Finish quarterly report',
        progress: 75,
        lastWorkedOn: '1 hour ago',
      },
    ],
    pinnedItems: [
      {
        id: 'p1',
        title: 'Important client contacts',
        type: 'file',
      },
    ],
    onFileClick: (file) => console.log('File:', file.name),
    onTaskClick: (task) => console.log('Task:', task.title),
    onPinnedClick: (item) => console.log('Pinned:', item.title),
    onCloseFile: (id) => console.log('Close:', id),
    onUnpin: (id) => console.log('Unpin:', id),
  },
  parameters: {
    docs: {
      description: {
        story: 'Full workspace with all three sections: open files, in-progress tasks, and pinned items.',
      },
    },
  },
};

export const WithSmartSuggestion: Story = {
  args: {
    openFiles: [
      {
        id: 'f1',
        name: 'Marketing_Proposal_v3.pdf',
        type: 'pdf',
        lastOpened: 'Just now',
        relatedTaskId: 'task123',
      },
    ],
    inProgressTasks: [
      {
        id: 't1',
        title: 'Write documentation',
        progress: 30,
        lastWorkedOn: 'Yesterday',
      },
    ],
    suggestRelatedTask: {
      file: {
        id: 'f1',
        name: 'Marketing_Proposal_v3.pdf',
        type: 'pdf',
      },
      task: {
        id: 'task123',
        title: 'Review and finalize marketing proposal',
        priority: 'high',
      },
    },
    onFileClick: (file) => console.log('File:', file.name),
    onTaskClick: (task) => console.log('Task:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '💡 Smart suggestion banner when you have a file open that\'s related to an incomplete task.',
      },
    },
  },
};

export const EmptyWorkspace: Story = {
  args: {
    openFiles: [],
    inProgressTasks: [],
    pinnedItems: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state - component hides itself when there are no items (returns null).',
      },
    },
  },
};

export const HeavyWorkload: Story = {
  args: {
    openFiles: [
      { id: 'f1', name: 'project_spec.md', type: 'doc', lastOpened: '5 min ago' },
      { id: 'f2', name: 'budget.xlsx', type: 'sheet', lastOpened: '10 min ago' },
      { id: 'f3', name: 'design.fig', type: 'image', lastOpened: '15 min ago' },
      { id: 'f4', name: 'research.pdf', type: 'pdf', lastOpened: '20 min ago' },
      { id: 'f5', name: 'code_review.md', type: 'doc', lastOpened: '30 min ago' },
      { id: 'f6', name: 'meeting_notes.md', type: 'doc', lastOpened: '1 hour ago' },
    ],
    inProgressTasks: [
      { id: 't1', title: 'Build user authentication flow', progress: 45, lastWorkedOn: '1 hour ago' },
      { id: 't2', title: 'Write API documentation', progress: 60, lastWorkedOn: '2 hours ago' },
      { id: 't3', title: 'Design landing page', progress: 25, lastWorkedOn: 'This morning' },
      { id: 't4', title: 'Fix production bug', progress: 90, lastWorkedOn: 'Yesterday' },
    ],
    pinnedItems: [
      { id: 'p1', title: 'Team contacts', type: 'file' },
      { id: 'p2', title: 'Deploy checklist', type: 'task' },
      { id: 'p3', title: 'Sprint goals', type: 'note' },
    ],
    onFileClick: (file) => console.log('File:', file.name),
    onTaskClick: (task) => console.log('Task:', task.title),
    onPinnedClick: (item) => console.log('Pinned:', item.title),
    onCloseFile: (id) => console.log('Close:', id),
    onUnpin: (id) => console.log('Unpin:', id),
  },
  parameters: {
    docs: {
      description: {
        story: '🔥 Heavy workload - many open files, multiple in-progress tasks, and pinned items. Tests horizontal scrolling.',
      },
    },
  },
};

export const AlmostDoneTasks: Story = {
  args: {
    inProgressTasks: [
      {
        id: 't1',
        title: 'Write quarterly business review',
        progress: 95,
        lastWorkedOn: '5 min ago',
      },
      {
        id: 't2',
        title: 'Update team wiki with new processes',
        progress: 88,
        lastWorkedOn: '1 hour ago',
      },
      {
        id: 't3',
        title: 'Code review for feature branch',
        progress: 92,
        lastWorkedOn: 'This morning',
      },
    ],
    onTaskClick: (task) => console.log('Task:', task.title),
  },
  parameters: {
    docs: {
      description: {
        story: '🎯 Almost done tasks (90%+) - suggests finishing what you started for quick wins.',
      },
    },
  },
};

export const CodeFocusedWorkspace: Story = {
  args: {
    openFiles: [
      { id: 'f1', name: 'auth.service.ts', type: 'code', lastOpened: 'Just now' },
      { id: 'f2', name: 'user.model.ts', type: 'code', lastOpened: '5 min ago' },
      { id: 'f3', name: 'api.routes.ts', type: 'code', lastOpened: '10 min ago' },
    ],
    inProgressTasks: [
      {
        id: 't1',
        title: 'Implement JWT refresh token logic',
        progress: 70,
        lastWorkedOn: 'Just now',
      },
    ],
    pinnedItems: [
      { id: 'p1', title: 'Authentication spec', type: 'file' },
    ],
    onFileClick: (file) => console.log('File:', file.name),
    onTaskClick: (task) => console.log('Task:', task.title),
    onPinnedClick: (item) => console.log('Pinned:', item.title),
    onCloseFile: (id) => console.log('Close:', id),
    onUnpin: (id) => console.log('Unpin:', id),
  },
  parameters: {
    docs: {
      description: {
        story: '💻 Code-focused workspace - multiple code files open, deep work in progress.',
      },
    },
  },
};
