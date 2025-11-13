import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import TaskList from './TaskList';

const meta = {
  title: 'Tasks/TaskList',
  component: TaskList,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#002b36' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockSuggestions = [
  {
    integration_task_id: '1',
    suggested_title: 'Reply to Sarah\'s email about project deadline',
    provider: 'gmail',
    suggested_priority: 'HIGH',
    ai_confidence: 0.95,
    metadata: 'URGENT',
  },
  {
    integration_task_id: '2',
    suggested_title: 'Review PR #123 - Authentication fixes',
    provider: 'gmail',
    suggested_priority: 'MEDIUM',
    ai_confidence: 0.85,
  },
  {
    integration_task_id: '3',
    suggested_title: 'Schedule team meeting for next sprint',
    provider: 'gmail',
    suggested_priority: 'LOW',
    ai_confidence: 0.75,
  },
];

const mockTasks = [
  {
    task_id: 't1',
    title: 'Fix authentication bug in production',
    description: 'Users are experiencing 500 errors on login',
    estimated_minutes: 45,
    micro_steps: 3,
    priority: 'HIGH' as const,
    tags: ['bug', 'urgent', 'backend'],
  },
  {
    task_id: 't2',
    title: 'Write documentation for new API',
    description: 'Document all endpoints with examples',
    estimated_minutes: 120,
    micro_steps: 5,
    priority: 'MEDIUM' as const,
    tags: ['docs'],
  },
  {
    task_id: 't3',
    title: 'Refactor user service',
    description: 'Clean up legacy code',
    estimated_minutes: 90,
    micro_steps: 4,
    priority: 'LOW' as const,
    tags: ['refactor', 'technical-debt'],
  },
];

// === Basic Lists ===

export const WithSuggestionsAndTasks: Story = {
  args: {
    sections: [
      {
        id: 'suggestions',
        title: '📧 From Gmail',
        type: 'suggestions',
        data: mockSuggestions,
      },
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks',
        data: mockTasks,
      },
    ],
    onSuggestionApprove: (id) => console.log('Approve:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
    onTaskPress: (id) => console.log('Task pressed:', id),
  },
};

export const SuggestionsOnly: Story = {
  args: {
    sections: [
      {
        id: 'suggestions',
        title: '📧 From Gmail',
        type: 'suggestions',
        data: mockSuggestions,
      },
    ],
    onSuggestionApprove: (id) => console.log('Approve:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
  },
};

export const TasksOnly: Story = {
  args: {
    sections: [
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks',
        data: mockTasks,
      },
    ],
    onTaskPress: (id) => console.log('Task pressed:', id),
  },
};

// === States ===

export const Empty: Story = {
  args: {
    sections: [
      {
        id: 'suggestions',
        title: '📧 From Gmail',
        type: 'suggestions',
        data: [],
      },
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks',
        data: [],
      },
    ],
    emptyMessage: 'No tasks yet. Tap + to add one!',
  },
};

export const Loading: Story = {
  args: {
    sections: [],
    loading: true,
  },
};

export const Refreshing: Story = {
  args: {
    sections: [
      {
        id: 'suggestions',
        title: '📧 From Gmail',
        type: 'suggestions',
        data: mockSuggestions.slice(0, 2),
      },
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks',
        data: mockTasks.slice(0, 2),
      },
    ],
    refreshing: true,
    onRefresh: () => console.log('Refreshing...'),
  },
};

// === Multiple Sections ===

export const MultipleSources: Story = {
  args: {
    sections: [
      {
        id: 'gmail',
        title: '📧 From Gmail',
        type: 'suggestions',
        data: mockSuggestions.slice(0, 2),
      },
      {
        id: 'calendar',
        title: '📅 From Calendar',
        type: 'suggestions',
        data: [
          {
            integration_task_id: 'c1',
            suggested_title: 'Prepare for 3pm design review',
            provider: 'calendar',
            suggested_priority: 'HIGH',
            ai_confidence: 0.90,
          },
        ],
      },
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks',
        data: mockTasks,
      },
    ],
    onSuggestionApprove: (id) => console.log('Approve:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
    onTaskPress: (id) => console.log('Task pressed:', id),
  },
};

// === Large Lists ===

export const ManySuggestions: Story = {
  args: {
    sections: [
      {
        id: 'suggestions',
        title: '📧 From Gmail',
        type: 'suggestions',
        data: Array.from({ length: 15 }, (_, i) => ({
          integration_task_id: `s${i}`,
          suggested_title: `Suggestion ${i + 1}: ${mockSuggestions[i % 3].suggested_title}`,
          provider: 'gmail',
          suggested_priority: ['HIGH', 'MEDIUM', 'LOW'][i % 3] as any,
          ai_confidence: 0.95 - i * 0.03,
        })),
      },
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks',
        data: mockTasks.slice(0, 2),
      },
    ],
    onSuggestionApprove: (id) => console.log('Approve:', id),
    onSuggestionDismiss: (id) => console.log('Dismiss:', id),
    onTaskPress: (id) => console.log('Task pressed:', id),
  },
};

export const ManyTasks: Story = {
  args: {
    sections: [
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks',
        data: Array.from({ length: 20 }, (_, i) => ({
          task_id: `t${i}`,
          title: `Task ${i + 1}: ${mockTasks[i % 3].title}`,
          description: mockTasks[i % 3].description,
          estimated_minutes: 30 + i * 10,
          micro_steps: (i % 5) + 1,
          priority: ['HIGH', 'MEDIUM', 'LOW'][i % 3] as any,
          tags: mockTasks[i % 3].tags,
        })),
      },
    ],
    onTaskPress: (id) => console.log('Task pressed:', id),
  },
};

// === Interactive Demo ===

export const InteractiveDemo: Story = {
  render: () => {
    const [sections, setSections] = React.useState([
      {
        id: 'suggestions',
        title: '📧 From Gmail',
        type: 'suggestions' as const,
        data: mockSuggestions,
      },
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks' as const,
        data: mockTasks,
      },
    ]);

    const handleApprove = (suggestionId: string) => {
      alert(`Approved suggestion: ${suggestionId}`);
      // Remove from suggestions
      setSections((prev) =>
        prev.map((section) =>
          section.id === 'suggestions'
            ? {
                ...section,
                data: section.data.filter((s: any) => s.integration_task_id !== suggestionId),
              }
            : section
        )
      );
    };

    const handleDismiss = (suggestionId: string) => {
      alert(`Dismissed suggestion: ${suggestionId}`);
      setSections((prev) =>
        prev.map((section) =>
          section.id === 'suggestions'
            ? {
                ...section,
                data: section.data.filter((s: any) => s.integration_task_id !== suggestionId),
              }
            : section
        )
      );
    };

    return (
      <TaskList
        sections={sections}
        onSuggestionApprove={handleApprove}
        onSuggestionDismiss={handleDismiss}
        onTaskPress={(id) => alert(`Task pressed: ${id}`)}
        onRefresh={() => {
          alert('Refreshing...');
          // Reset data
          setSections([
            {
              id: 'suggestions',
              title: '📧 From Gmail',
              type: 'suggestions',
              data: mockSuggestions,
            },
            {
              id: 'tasks',
              title: 'Your Tasks',
              type: 'tasks',
              data: mockTasks,
            },
          ]);
        }}
      />
    );
  },
};
