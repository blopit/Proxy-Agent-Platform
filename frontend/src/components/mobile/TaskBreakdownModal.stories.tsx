import type { Meta, StoryObj } from '@storybook/react';
import TaskBreakdownModal from './TaskBreakdownModal';
import React from 'react';
import type { CaptureResponse } from '@/types/capture';

const meta: Meta<typeof TaskBreakdownModal> = {
  title: 'Components/Mobile/TaskBreakdownModal',
  component: TaskBreakdownModal,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component: `**TaskBreakdownModal** - Slide-up modal showing task breakdown after capture

**Key Features**:
- **Card View**: Traditional task card with action buttons
- **Tree View**: Hierarchical breakdown with 7-level decomposition
- **Live Decomposition**: AsyncJobTimeline shows real-time decomposition progress
- **Interactive Expansion**: Click "🔨 Decompose" button to break down tasks further
- **Celebration Animation**: Success feedback after capture

**Decomposition Flow**:
1. User captures task → Modal opens
2. Switch to Tree View
3. Click "🔨 Decompose" on non-atomic tasks
4. AsyncJobTimeline appears showing 4 steps:
   - 🔍 Analyze complexity
   - 🔨 Break into subtasks
   - 🏷️ Classify steps
   - 💾 Save results
5. Tree updates with new children
6. Timeline transforms into actual subtasks

**ADHD Optimizations**:
- Celebration animation for dopamine reward
- Clear action buttons (Start / View All)
- Processing time displayed for transparency
- Hierarchical view helps understand complexity`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100%', backgroundColor: '#002b36' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TaskBreakdownModal>;

// ============================================================================
// Sample Data
// ============================================================================

const sampleCaptureResponse: CaptureResponse = {
  task: {
    task_id: 'task-123',
    title: 'Set up smart AC automation',
    description: 'Automatically turn off AC when leaving home using geofence',
    status: 'pending',
    priority: 'medium',
    tags: ['🏠 Home', '🤖 Automation'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_hours: 0.25,
  },
  micro_steps: [
    {
      step_id: 'step-1',
      description: 'Research smart plug options',
      short_label: 'Research',
      estimated_minutes: 5,
      total_minutes: 5,
      leaf_type: 'HUMAN',
      icon: '🔍',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
      tags: ['🎯 Focused'],
    },
    {
      step_id: 'step-2',
      description: 'Set up IFTTT geofence trigger',
      short_label: 'Setup geofence',
      estimated_minutes: 7,
      total_minutes: 7,
      leaf_type: 'DIGITAL',
      icon: '🌍',
      is_leaf: false,
      decomposition_state: 'stub',
      level: 5,
      tags: ['🤖 Auto', '🧩 Complex'],
    },
    {
      step_id: 'step-3',
      description: 'Test automation when leaving',
      short_label: 'Test',
      estimated_minutes: 3,
      total_minutes: 3,
      leaf_type: 'HUMAN',
      icon: '🧪',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
      tags: ['⚡ Quick Win'],
    },
  ],
  breakdown: {
    total_steps: 3,
    total_minutes: 15,
    digital_count: 1,
    human_count: 2,
  },
  processing_time_ms: 8234,
  needs_clarification: false,
  clarifications: [],
};

const complexCaptureResponse: CaptureResponse = {
  task: {
    task_id: 'task-456',
    title: 'Write comprehensive project documentation',
    description: 'Create README, API docs, and deployment guide',
    status: 'pending',
    priority: 'high',
    tags: ['📝 Docs', '🎯 Focused'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_hours: 2,
  },
  micro_steps: [
    {
      step_id: 'step-1',
      description: 'Draft README.md overview',
      short_label: 'README',
      estimated_minutes: 20,
      total_minutes: 20,
      leaf_type: 'HUMAN',
      icon: '📄',
      is_leaf: false,
      decomposition_state: 'stub',
      level: 5,
      tags: [],
    },
    {
      step_id: 'step-2',
      description: 'Document API endpoints',
      short_label: 'API docs',
      estimated_minutes: 45,
      total_minutes: 45,
      leaf_type: 'HUMAN',
      icon: '🔌',
      is_leaf: false,
      decomposition_state: 'stub',
      level: 5,
      tags: ['🧩 Complex'],
    },
    {
      step_id: 'step-3',
      description: 'Write deployment guide',
      short_label: 'Deploy guide',
      estimated_minutes: 30,
      total_minutes: 30,
      leaf_type: 'HUMAN',
      icon: '🚀',
      is_leaf: false,
      decomposition_state: 'stub',
      level: 5,
      tags: [],
    },
    {
      step_id: 'step-4',
      description: 'Generate docs site with Docusaurus',
      short_label: 'Build site',
      estimated_minutes: 15,
      total_minutes: 15,
      leaf_type: 'DIGITAL',
      icon: '🏗️',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
      tags: ['🤖 Auto'],
    },
  ],
  breakdown: {
    total_steps: 4,
    total_minutes: 110,
    digital_count: 1,
    human_count: 3,
  },
  processing_time_ms: 12456,
  needs_clarification: false,
  clarifications: [],
};

const simpleTaskResponse: CaptureResponse = {
  task: {
    task_id: 'task-789',
    title: 'Email Sara about meeting',
    description: 'Send quick update email',
    status: 'pending',
    priority: 'low',
    tags: ['📧 Email'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    estimated_hours: 0.1,
  },
  micro_steps: [
    {
      step_id: 'step-1',
      description: 'Draft email message',
      short_label: 'Draft',
      estimated_minutes: 3,
      total_minutes: 3,
      leaf_type: 'HUMAN',
      icon: '✍️',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
      tags: ['⚡ Quick Win'],
    },
    {
      step_id: 'step-2',
      description: 'Send via Gmail',
      short_label: 'Send',
      estimated_minutes: 0,
      total_minutes: 0,
      leaf_type: 'DIGITAL',
      icon: '📧',
      is_leaf: true,
      decomposition_state: 'atomic',
      level: 6,
      tags: ['🤖 Auto'],
    },
  ],
  breakdown: {
    total_steps: 2,
    total_minutes: 3,
    digital_count: 1,
    human_count: 1,
  },
  processing_time_ms: 3421,
  needs_clarification: false,
  clarifications: [],
};

// ============================================================================
// Stories: Default States
// ============================================================================

export const Default: Story = {
  args: {
    captureResponse: sampleCaptureResponse,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onStartTask: () => console.log('Start task clicked'),
    onViewAllTasks: () => console.log('View all tasks clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default modal state after successful task capture. Shows card view by default.',
      },
    },
  },
};

export const TreeViewOpen: Story = {
  args: {
    captureResponse: sampleCaptureResponse,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onStartTask: () => console.log('Start task clicked'),
    onViewAllTasks: () => console.log('View all tasks clicked'),
  },
  render: (args) => {
    const [showTree, setShowTree] = React.useState(true);

    return (
      <>
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 100,
          background: '#073642',
          padding: '12px',
          borderRadius: '8px',
        }}>
          <button
            onClick={() => setShowTree(!showTree)}
            style={{
              background: '#268bd2',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Toggle View
          </button>
        </div>
        <TaskBreakdownModal {...args} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with tree view showing hierarchical task breakdown. Click nodes to expand/collapse.',
      },
    },
  },
};

export const ComplexTask: Story = {
  args: {
    captureResponse: complexCaptureResponse,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onStartTask: () => console.log('Start task clicked'),
    onViewAllTasks: () => console.log('View all tasks clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex task with multiple decomposable steps. Each step can be broken down further.',
      },
    },
  },
};

export const SimpleTask: Story = {
  args: {
    captureResponse: simpleTaskResponse,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onStartTask: () => console.log('Start task clicked'),
    onViewAllTasks: () => console.log('View all tasks clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Simple 2-step task - all atomic, nothing to decompose further.',
      },
    },
  },
};

// ============================================================================
// Stories: Decomposition Flow
// ============================================================================

export const DecompositionInProgress: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(true);
    const [showDecomposition, setShowDecomposition] = React.useState(false);

    React.useEffect(() => {
      // Auto-trigger decomposition demo after 2 seconds
      const timer = setTimeout(() => {
        setShowDecomposition(true);
      }, 2000);

      return () => clearTimeout(timer);
    }, []);

    return (
      <div>
        {showDecomposition && (
          <div style={{
            position: 'fixed',
            top: 20,
            left: 20,
            right: 20,
            zIndex: 100,
            background: '#268bd2',
            padding: '16px',
            borderRadius: '8px',
            color: '#fff',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            ⚡ Decomposition Demo: Watch the AsyncJobTimeline appear!
          </div>
        )}
        <TaskBreakdownModal
          captureResponse={sampleCaptureResponse}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onStartTask={() => console.log('Start task')}
          onViewAllTasks={() => console.log('View all')}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the decomposition process with AsyncJobTimeline. Click "🔨 Decompose" button on stub nodes.',
      },
    },
  },
};

export const WithClarifications: Story = {
  args: {
    captureResponse: {
      ...sampleCaptureResponse,
      needs_clarification: true,
      clarifications: [
        {
          field: 'smart_plug_brand',
          question: 'Which smart plug brand do you prefer?',
          options: ['TP-Link', 'Wemo', 'Amazon Smart Plug'],
        },
        {
          field: 'geofence_radius',
          question: 'What distance should trigger the automation?',
          options: ['100m', '500m', '1km'],
        },
      ],
    },
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Task requires clarification - shows questions with option chips.',
      },
    },
  },
};

// ============================================================================
// Stories: Interactive Demo
// ============================================================================

export const InteractiveDemo: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(true);
    const [captureData, setCaptureData] = React.useState(sampleCaptureResponse);

    const simulateDecomposition = (stepId: string) => {
      console.log('🔨 Decomposing step:', stepId);

      // Simulate API response with new children after 3 seconds
      setTimeout(() => {
        const newChildren = [
          {
            step_id: `${stepId}-child-1`,
            description: 'Configure IFTTT account',
            short_label: 'IFTTT setup',
            estimated_minutes: 3,
            total_minutes: 3,
            leaf_type: 'HUMAN' as const,
            icon: '⚙️',
            is_leaf: true,
            decomposition_state: 'atomic' as const,
            level: 6,
            tags: ['🎯 Focused'],
          },
          {
            step_id: `${stepId}-child-2`,
            description: 'Create geofence boundary',
            short_label: 'Set boundary',
            estimated_minutes: 2,
            total_minutes: 2,
            leaf_type: 'HUMAN' as const,
            icon: '📍',
            is_leaf: true,
            decomposition_state: 'atomic' as const,
            level: 6,
            tags: ['⚡ Quick Win'],
          },
          {
            step_id: `${stepId}-child-3`,
            description: 'Link smart plug device',
            short_label: 'Link device',
            estimated_minutes: 2,
            total_minutes: 2,
            leaf_type: 'DIGITAL' as const,
            icon: '🔗',
            is_leaf: true,
            decomposition_state: 'atomic' as const,
            level: 6,
            tags: ['🤖 Auto'],
          },
        ];

        console.log('✅ Decomposition complete! New steps:', newChildren);
      }, 3000);
    };

    return (
      <div>
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          right: 20,
          zIndex: 100,
          background: '#073642',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #586e75',
        }}>
          <p style={{ color: '#93a1a1', fontSize: '12px', margin: 0 }}>
            💡 <strong>Tip:</strong> Switch to Tree View, then click "🔨 Decompose" on the middle step (geofence setup)
          </p>
        </div>

        <TaskBreakdownModal
          captureResponse={captureData}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onStartTask={() => {
            console.log('▶️ Starting task...');
            setIsOpen(false);
          }}
          onViewAllTasks={() => {
            console.log('📋 Viewing all tasks...');
            setIsOpen(false);
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive demo - try decomposing tasks and see the AsyncJobTimeline in action!',
      },
    },
  },
};

// ============================================================================
// Stories: Edge Cases
// ============================================================================

export const AllAtomicSteps: Story = {
  args: {
    captureResponse: {
      ...simpleTaskResponse,
      micro_steps: simpleTaskResponse.micro_steps.map(step => ({
        ...step,
        is_leaf: true,
        decomposition_state: 'atomic' as const,
      })),
    },
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'All steps are atomic - no decompose buttons should appear.',
      },
    },
  },
};

export const ManySteps: Story = {
  args: {
    captureResponse: {
      ...complexCaptureResponse,
      micro_steps: Array.from({ length: 12 }, (_, i) => ({
        step_id: `step-${i + 1}`,
        description: `Task step number ${i + 1}`,
        short_label: `Step ${i + 1}`,
        estimated_minutes: Math.floor(Math.random() * 15) + 1,
        total_minutes: Math.floor(Math.random() * 15) + 1,
        leaf_type: (i % 2 === 0 ? 'HUMAN' : 'DIGITAL') as 'HUMAN' | 'DIGITAL',
        icon: ['📝', '🔧', '🎨', '💡', '🚀', '⚙️', '🔍', '🎯'][i % 8],
        is_leaf: i % 3 === 0,
        decomposition_state: (i % 3 === 0 ? 'atomic' : 'stub') as 'atomic' | 'stub',
        level: 5,
        tags: [],
      })),
      breakdown: {
        total_steps: 12,
        total_minutes: 120,
        digital_count: 6,
        human_count: 6,
      },
    },
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Many steps (12) - tests scrolling and layout with large task lists.',
      },
    },
  },
};

export const FastProcessing: Story = {
  args: {
    captureResponse: {
      ...sampleCaptureResponse,
      processing_time_ms: 234,
    },
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Very fast processing time (234ms) displayed.',
      },
    },
  },
};

export const SlowProcessing: Story = {
  args: {
    captureResponse: {
      ...complexCaptureResponse,
      processing_time_ms: 45678,
    },
    isOpen: true,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Slow processing time (45s) for complex task.',
      },
    },
  },
};

// ============================================================================
// Stories: Animation States
// ============================================================================

export const Opening: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
      // Trigger opening animation
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <TaskBreakdownModal
        captureResponse={sampleCaptureResponse}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the slide-up opening animation.',
      },
    },
  },
};

export const Closing: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(true);

    return (
      <div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 100,
            background: '#dc322f',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Close Modal
        </button>
        <TaskBreakdownModal
          captureResponse={sampleCaptureResponse}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Click the close button to see the slide-down animation.',
      },
    },
  },
};
