import type { Meta, StoryObj } from '@storybook/react';
import TaskBreakdownModal from './TaskBreakdownModal';
import React from 'react';
import type { CaptureResponse } from '@/types/capture';

const meta: Meta<typeof TaskBreakdownModal> = {
  title: 'Mobile/Modals/TaskBreakdown',
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
- **🎯 Chevron View (Default)**: Beautiful interlocking chevrons show task steps visually
- **📋 Card View**: Traditional task card with action buttons
- **Live Decomposition**: AsyncJobTimeline shows real-time decomposition progress
- **Interactive Chevrons**: Click steps to expand and see sub-tasks
- **Celebration Animation**: Success feedback after capture

**Chevron View Benefits**:
- Visual flow from left to right (past → future)
- Consistent with AsyncJobTimeline design language
- Easy to see digital (🤖) vs human (👤) tasks at a glance
- Interlocking chevrons create satisfying visual rhythm
- Each step shows emoji + label for quick scanning

**Decomposition Flow**:
1. User captures task → Modal opens with Chevron View
2. Chevrons display all micro-steps in a visual timeline
3. Click any chevron to expand sub-tasks (if available)
4. AsyncJobTimeline appears during decomposition showing:
   - 🔍 Analyze complexity
   - 🔨 Break into subtasks
   - 🏷️ Classify steps
   - 💾 Save results
5. New chevrons appear for sub-tasks

**ADHD Optimizations**:
- Celebration animation for dopamine reward
- Clear action buttons (Start / View All)
- Processing time displayed for transparency
- Chevron view reduces cognitive load vs tree structure`,
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
// Quick Start - Most Common Use Cases
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
        story: 'Default modal state after successful task capture. Shows **Chevron View** by default with beautiful interlocking chevrons.',
      },
    },
  },
};

// ============================================================================
// Chevron View - New Default Visualization
// ============================================================================

export const ChevronView__Basic: Story = {
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
        story: 'Basic **Chevron View** with 3 micro-steps. Default visualization using beautiful interlocking chevrons.',
      },
    },
  },
};

export const ChevronView__Interactive: Story = {
  args: {
    captureResponse: sampleCaptureResponse,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onStartTask: () => console.log('Start task clicked'),
    onViewAllTasks: () => console.log('View all tasks clicked'),
  },
  render: (args) => {
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          right: 20,
          zIndex: 100,
          background: '#268bd2',
          padding: '12px',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#fff', fontSize: '12px', margin: 0, fontWeight: 'bold' }}>
            🎯 Click any chevron to expand and see sub-tasks!
          </p>
        </div>
        <TaskBreakdownModal {...args} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '**Interactive Chevron Demo** - Click any chevron step to expand and explore sub-tasks. Chevrons provide visual continuity and clear progression.',
      },
    },
  },
};

export const ChevronView__Complex: Story = {
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
        story: 'Complex task with **4 decomposable steps** shown in Chevron View. Beautiful chevron timeline with emoji icons and labels.',
      },
    },
  },
};

export const ChevronView__ManySteps: Story = {
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
        story: 'Stress test with **12 steps** - tests scrolling, layout, and chevron rendering with many tasks.',
      },
    },
  },
};

// ============================================================================
// Card View - Classic Layout
// ============================================================================

export const CardView__Basic: Story = {
  args: {
    captureResponse: sampleCaptureResponse,
    isOpen: true,
    onClose: () => console.log('Modal closed'),
    onStartTask: () => console.log('Start task clicked'),
    onViewAllTasks: () => console.log('View all tasks clicked'),
  },
  render: (args) => {
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
          <p style={{ color: '#93a1a1', fontSize: '11px', margin: 0 }}>
            💡 Click "📋 Card View" button to see traditional card layout
          </p>
        </div>
        <TaskBreakdownModal {...args} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal with **Card View** showing traditional task card layout. Click "📋 Card View" tab to switch from Chevron View.',
      },
    },
  },
};

export const CardView__Simple: Story = {
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
// Features - Advanced Functionality
// ============================================================================

export const Features__LiveDecomposition: Story = {
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

export const Features__Clarifications: Story = {
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

export const Features__ProcessingSpeed: Story = {
  render: () => {
    const [selectedSpeed, setSelectedSpeed] = React.useState<'fast' | 'slow'>('fast');

    const fastResponse = {
      ...sampleCaptureResponse,
      processing_time_ms: 234,
    };

    const slowResponse = {
      ...complexCaptureResponse,
      processing_time_ms: 45678,
    };

    return (
      <>
        <div style={{
          position: 'fixed',
          top: 20,
          left: 20,
          right: 20,
          zIndex: 100,
          background: '#073642',
          padding: '12px',
          borderRadius: '8px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => setSelectedSpeed('fast')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: selectedSpeed === 'fast' ? '#859900' : '#586e75',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '11px',
            }}
          >
            ⚡ Fast (234ms)
          </button>
          <button
            onClick={() => setSelectedSpeed('slow')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: selectedSpeed === 'slow' ? '#cb4b16' : '#586e75',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '11px',
            }}
          >
            🐌 Slow (45s)
          </button>
        </div>
        <TaskBreakdownModal
          captureResponse={selectedSpeed === 'fast' ? fastResponse : slowResponse}
          isOpen={true}
          onClose={() => console.log('Modal closed')}
        />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Toggle between **fast (234ms)** and **slow (45s)** processing times to see how the UI displays different performance metrics.',
      },
    },
  },
};

// ============================================================================
// Edge Cases - Boundary Conditions
// ============================================================================

export const EdgeCases__AllAtomic: Story = {
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

// ============================================================================
// States - UI States & Animations
// ============================================================================

export const States__Opening: Story = {
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

export const States__Closing: Story = {
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
