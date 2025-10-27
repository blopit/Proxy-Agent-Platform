import type { Meta, StoryObj } from '@storybook/react';
import AsyncJobTimeline, { type JobStep, type JobStepStatus } from './AsyncJobTimeline';
import React from 'react';

const meta: Meta<typeof AsyncJobTimeline> = {
  title: 'Components/Shared/AsyncJobTimeline',
  component: AsyncJobTimeline,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Universal progress bar component with chevron/arrow design.

**Design Philosophy:**
- Everything is progress bars - tasks, tabs, energy, streaks
- Chevron shapes with clean Solarized colors
- Auto-expanding active step to 50% width
- Supports DIGITAL (auto/unlimited) and HUMAN (2-5 min chunks) tasks

**Features:**
- **Chevron shapes** with CSS clip-path
- **Solarized color scheme** (not gradients)
- **Three size variants:** full, micro, nano
- **Status indicators:** pending, active, done, error
- **Icon support** with emojis
- **Time estimation** (hidden for auto tasks with 0 minutes)
- **Click to expand** for step details
- **Hierarchical decomposition** support`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#fdf6e3] p-6 min-w-[600px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    jobName: {
      control: 'text',
      description: 'Name of the task/job',
    },
    currentProgress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Overall progress percentage (0-100)',
    },
    size: {
      control: 'radio',
      options: ['full', 'micro', 'nano'],
      description: 'Display size variant',
    },
    showProgressBar: {
      control: 'boolean',
      description: 'Show progress bar at bottom',
    },
    activeProgress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress overlay on active step (0-100). Shows semi-transparent fill indicating completion percentage.',
    },
    activeProgressPulse: {
      control: 'boolean',
      description: 'Whether the active progress overlay should animate (shimmer sweep effect)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AsyncJobTimeline>;

// ============================================================================
// Sample Data
// ============================================================================

const basicSteps: JobStep[] = [
  {
    id: 'step-1',
    description: 'Parse natural language',
    shortLabel: 'Parse',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🧠',
    status: 'done',
  },
  {
    id: 'step-2',
    description: 'LLM decomposition',
    shortLabel: 'Decompose',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🤖',
    status: 'done',
  },
  {
    id: 'step-3',
    description: 'Classify steps',
    shortLabel: 'Classify',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🏷️',
    status: 'active',
  },
  {
    id: 'step-4',
    description: 'Save to database',
    shortLabel: 'Save',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '💾',
    status: 'pending',
  },
];

const humanSteps: JobStep[] = [
  {
    id: 'step-1',
    description: 'Draft email message',
    shortLabel: 'Draft',
    estimatedMinutes: 3,
    leafType: 'HUMAN',
    icon: '✍️',
    status: 'done',
  },
  {
    id: 'step-2',
    description: 'Review and edit',
    shortLabel: 'Review',
    estimatedMinutes: 2,
    leafType: 'HUMAN',
    icon: '👀',
    status: 'active',
  },
  {
    id: 'step-3',
    description: 'Send email',
    shortLabel: 'Send',
    estimatedMinutes: 1,
    leafType: 'DIGITAL',
    icon: '📧',
    status: 'pending',
  },
];

const mixedSteps: JobStep[] = [
  {
    id: 'step-1',
    description: 'Find smart plug integration',
    shortLabel: 'Find',
    estimatedMinutes: 5,
    leafType: 'HUMAN',
    icon: '🔍',
    status: 'done',
  },
  {
    id: 'step-2',
    description: 'Set up geofence automation',
    shortLabel: 'Setup',
    estimatedMinutes: 7,
    leafType: 'DIGITAL',
    icon: '🌍',
    status: 'active',
  },
  {
    id: 'step-3',
    description: 'Test automation when leaving',
    shortLabel: 'Test',
    estimatedMinutes: 3,
    leafType: 'HUMAN',
    icon: '🧪',
    status: 'pending',
  },
];

const errorSteps: JobStep[] = [
  {
    id: 'step-1',
    description: 'Connect to API',
    shortLabel: 'Connect',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🔌',
    status: 'done',
  },
  {
    id: 'step-2',
    description: 'Authenticate user',
    shortLabel: 'Auth',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🔐',
    status: 'error',
  },
  {
    id: 'step-3',
    description: 'Fetch data',
    shortLabel: 'Fetch',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '📥',
    status: 'pending',
  },
];

// ============================================================================
// Stories: Basic States
// ============================================================================

export const Default: Story = {
  args: {
    jobName: 'Turn off the AC when I leave',
    steps: basicSteps,
    currentProgress: 67,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default progress bar showing DIGITAL steps (auto tasks). Active step auto-expands to 50% width with chevron shapes.',
      },
    },
  },
};

export const InProgress: Story = {
  args: {
    jobName: 'Analyzing task and creating breakdown...',
    steps: basicSteps,
    currentProgress: 45,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'In-progress state showing active step with blue highlight.',
      },
    },
  },
};

export const Completed: Story = {
  args: {
    jobName: 'Task successfully captured!',
    steps: basicSteps.map((s) => ({ ...s, status: 'done' as const })),
    currentProgress: 100,
    size: 'full',
    showProgressBar: true,
    processingTimeMs: 8234,
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed state - all steps done. Shows processing time.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    jobName: 'Authentication failed',
    steps: errorSteps,
    currentProgress: 50,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state showing failed step in red (Solarized red #dc322f).',
      },
    },
  },
};

// ============================================================================
// Stories: Step Types
// ============================================================================

export const HumanSteps: Story = {
  args: {
    jobName: 'Email Sara the weekly update',
    steps: humanSteps,
    currentProgress: 60,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'HUMAN steps with time estimates (2-5 min). Widths are proportional to estimated time.',
      },
    },
  },
};

export const MixedSteps: Story = {
  args: {
    jobName: 'Set up AC automation',
    steps: mixedSteps,
    currentProgress: 55,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Mixed DIGITAL and HUMAN steps. DIGITAL steps get minimal width, HUMAN steps sized by time.',
      },
    },
  },
};

// ============================================================================
// Stories: Size Variants
// ============================================================================

export const SizeFull: Story = {
  args: {
    jobName: 'Turn off the AC when I leave',
    steps: basicSteps,
    currentProgress: 67,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Full size variant - shows icons, descriptions, and time estimates.',
      },
    },
  },
};

export const SizeMicro: Story = {
  args: {
    jobName: 'Turn off the AC when I leave',
    steps: basicSteps,
    currentProgress: 67,
    size: 'micro',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Micro size variant - shows icons and short labels only.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#fdf6e3] p-4 w-[500px]">
        <Story />
      </div>
    ),
  ],
};

export const SizeNano: Story = {
  args: {
    jobName: 'Turn off the AC when I leave',
    steps: basicSteps,
    currentProgress: 67,
    size: 'nano',
    showProgressBar: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Nano size variant - minimal height, no text, just colored bars.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#fdf6e3] p-4 w-[400px]">
        <Story />
      </div>
    ),
  ],
};

// ============================================================================
// Stories: Progress States
// ============================================================================

export const JustStarted: Story = {
  args: {
    jobName: 'Processing your request...',
    steps: basicSteps.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' })) as JobStep[],
    currentProgress: 5,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Just started - first step active, others pending.',
      },
    },
  },
};

export const HalfwayDone: Story = {
  args: {
    jobName: 'Processing your request...',
    steps: [
      { ...basicSteps[0], status: 'done' },
      { ...basicSteps[1], status: 'done' },
      { ...basicSteps[2], status: 'active' },
      { ...basicSteps[3], status: 'pending' },
    ] as JobStep[],
    currentProgress: 50,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Halfway through - 2 done, 1 active, 1 pending.',
      },
    },
  },
};

export const AlmostDone: Story = {
  args: {
    jobName: 'Almost there...',
    steps: [
      { ...basicSteps[0], status: 'done' },
      { ...basicSteps[1], status: 'done' },
      { ...basicSteps[2], status: 'done' },
      { ...basicSteps[3], status: 'active' },
    ] as JobStep[],
    currentProgress: 95,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Almost done - last step active.',
      },
    },
  },
};

// ============================================================================
// Stories: Color Showcase
// ============================================================================

export const SolarizedColors: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">✅ Done - Solarized base02</h3>
        <AsyncJobTimeline
          jobName="Completed task"
          steps={basicSteps.map((s) => ({ ...s, status: 'done' }))}
          currentProgress={100}
          size="full"
          showProgressBar={false}
        />
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">⚡ Active - Solarized base2</h3>
        <AsyncJobTimeline
          jobName="In progress"
          steps={basicSteps}
          currentProgress={50}
          size="full"
          showProgressBar={false}
        />
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">❌ Error - Solarized red</h3>
        <AsyncJobTimeline
          jobName="Authentication failed"
          steps={errorSteps}
          currentProgress={50}
          size="full"
          showProgressBar={false}
        />
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">⏳ Pending - Solarized base3</h3>
        <AsyncJobTimeline
          jobName="Waiting to start"
          steps={basicSteps.map((s) => ({ ...s, status: 'pending' }))}
          currentProgress={0}
          size="full"
          showProgressBar={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all Solarized colors used in different states.',
      },
    },
  },
};

// ============================================================================
// Stories: Chevron Design
// ============================================================================

export const ChevronShapes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-3">Regular (Not Expanded)</h3>
        <AsyncJobTimeline
          jobName="All steps collapsed"
          steps={basicSteps.map((s) => ({ ...s, status: 'pending' }))}
          currentProgress={0}
          size="full"
          showProgressBar={false}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          Chevron clip-path: 8px arrow depth, -8px margin for overlap
        </p>
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-3">Expanded (Active Step)</h3>
        <AsyncJobTimeline
          jobName="Middle step expanded to 50%"
          steps={basicSteps}
          currentProgress={50}
          size="full"
          showProgressBar={false}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          Expanded chevron: 12px arrow depth, cleaner shadows
        </p>
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-3">Overlap Effect</h3>
        <div className="bg-white p-4 rounded border-2 border-[#268bd2]">
          <AsyncJobTimeline
            jobName="Notice how chevrons overlap seamlessly"
            steps={mixedSteps}
            currentProgress={40}
            size="full"
            showProgressBar={false}
          />
        </div>
        <p className="text-[#93a1a1] text-xs mt-2">
          Negative margin creates smooth arrow progression
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Detailed view of chevron shapes and overlap behavior.',
      },
    },
  },
};

// ============================================================================
// Stories: Real-World Examples
// ============================================================================

export const CaptureTask: Story = {
  args: {
    jobName: 'Turn off the AC when I leave for the day',
    steps: [
      {
        id: '1',
        description: 'Parse natural language input',
        shortLabel: 'Parse',
        estimatedMinutes: 0,
        leafType: 'DIGITAL',
        icon: '🧠',
        status: 'done',
      },
      {
        id: '2',
        description: 'LLM decomposition into micro-steps',
        shortLabel: 'Decompose',
        estimatedMinutes: 0,
        leafType: 'DIGITAL',
        icon: '🤖',
        status: 'done',
      },
      {
        id: '3',
        description: 'Classify steps (DIGITAL/HUMAN)',
        shortLabel: 'Classify',
        estimatedMinutes: 0,
        leafType: 'DIGITAL',
        icon: '🏷️',
        status: 'active',
      },
      {
        id: '4',
        description: 'Save to database',
        shortLabel: 'Save',
        estimatedMinutes: 0,
        leafType: 'DIGITAL',
        icon: '💾',
        status: 'pending',
      },
    ],
    currentProgress: 72,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Real example: Capture tab processing a new task.',
      },
    },
  },
};

export const EmailWorkflow: Story = {
  args: {
    jobName: 'Email Sara the weekly team update',
    steps: [
      {
        id: '1',
        description: 'Draft email message with key points',
        shortLabel: 'Draft',
        estimatedMinutes: 5,
        leafType: 'HUMAN',
        icon: '✍️',
        status: 'done',
      },
      {
        id: '2',
        description: 'Review for clarity and tone',
        shortLabel: 'Review',
        estimatedMinutes: 3,
        leafType: 'HUMAN',
        icon: '👀',
        status: 'done',
      },
      {
        id: '3',
        description: 'Attach relevant documents',
        shortLabel: 'Attach',
        estimatedMinutes: 2,
        leafType: 'HUMAN',
        icon: '📎',
        status: 'active',
      },
      {
        id: '4',
        description: 'Send email via Gmail',
        shortLabel: 'Send',
        estimatedMinutes: 0,
        leafType: 'DIGITAL',
        icon: '📧',
        status: 'pending',
      },
    ],
    currentProgress: 80,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Real example: Email workflow with mixed HUMAN and DIGITAL steps.',
      },
    },
  },
};

export const HomeAutomation: Story = {
  args: {
    jobName: 'Set up smart home AC automation',
    steps: mixedSteps,
    currentProgress: 40,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Real example: Home automation setup with research, configuration, and testing.',
      },
    },
  },
};

// ============================================================================
// Stories: Interactive Comparisons
// ============================================================================

export const AllSizeComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">Full Size</h3>
        <AsyncJobTimeline
          jobName="Turn off the AC when I leave"
          steps={basicSteps}
          currentProgress={50}
          size="full"
          showProgressBar={true}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          Shows icons, descriptions, time estimates, progress bar
        </p>
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">Micro Size</h3>
        <AsyncJobTimeline
          jobName="Turn off the AC when I leave"
          steps={basicSteps}
          currentProgress={50}
          size="micro"
          showProgressBar={true}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          Icons + short labels, compact height
        </p>
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">Nano Size</h3>
        <AsyncJobTimeline
          jobName="Turn off the AC when I leave"
          steps={basicSteps}
          currentProgress={50}
          size="nano"
          showProgressBar={false}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          Minimal height, no text, just colored bars
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all three size variants.',
      },
    },
  },
};

export const ProgressAnimation: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);
    const [stepIndex, setStepIndex] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            return 0;
          }
          return p + 2;
        });

        setStepIndex((i) => {
          const newIndex = Math.floor((progress / 100) * basicSteps.length);
          return Math.min(newIndex, basicSteps.length - 1);
        });
      }, 100);

      return () => clearInterval(interval);
    }, [progress]);

    const animatedSteps = basicSteps.map((step, i) => ({
      ...step,
      status: (i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'pending') as JobStepStatus,
    }));

    return (
      <div>
        <AsyncJobTimeline
          jobName="Watch the progress bar animate..."
          steps={animatedSteps}
          currentProgress={progress}
          size="full"
          showProgressBar={true}
        />
        <div className="mt-4 text-center">
          <p className="text-[#586e75] text-sm">Progress: {progress}%</p>
          <p className="text-[#93a1a1] text-xs">Auto-loops every 5 seconds</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Animated progress showing how the timeline updates in real-time.',
      },
    },
  },
};

// ============================================================================
// Stories: Edge Cases
// ============================================================================

export const SingleStep: Story = {
  args: {
    jobName: 'Quick task',
    steps: [basicSteps[0]],
    currentProgress: 50,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Single step takes full width.',
      },
    },
  },
};

export const ManySteps: Story = {
  args: {
    jobName: 'Complex workflow',
    steps: [
      { id: '1', description: 'Step 1', shortLabel: '1', estimatedMinutes: 2, leafType: 'HUMAN', icon: '1️⃣', status: 'done' },
      { id: '2', description: 'Step 2', shortLabel: '2', estimatedMinutes: 3, leafType: 'HUMAN', icon: '2️⃣', status: 'done' },
      { id: '3', description: 'Step 3', shortLabel: '3', estimatedMinutes: 0, leafType: 'DIGITAL', icon: '3️⃣', status: 'done' },
      { id: '4', description: 'Step 4', shortLabel: '4', estimatedMinutes: 4, leafType: 'HUMAN', icon: '4️⃣', status: 'active' },
      { id: '5', description: 'Step 5', shortLabel: '5', estimatedMinutes: 2, leafType: 'HUMAN', icon: '5️⃣', status: 'pending' },
      { id: '6', description: 'Step 6', shortLabel: '6', estimatedMinutes: 0, leafType: 'DIGITAL', icon: '6️⃣', status: 'pending' },
      { id: '7', description: 'Step 7', shortLabel: '7', estimatedMinutes: 1, leafType: 'HUMAN', icon: '7️⃣', status: 'pending' },
    ] as JobStep[],
    currentProgress: 60,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Many steps with proportional sizing.',
      },
    },
  },
};

export const NoIcons: Story = {
  args: {
    jobName: 'Task without emoji icons',
    steps: basicSteps.map((s) => ({ ...s, icon: undefined })),
    currentProgress: 50,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Steps without icons still look clean.',
      },
    },
  },
};

// ============================================================================
// Stories: Active Progress Overlay
// ============================================================================

export const ActiveProgressPulsing: Story = {
  args: {
    jobName: 'Processing data with active progress...',
    steps: basicSteps,
    currentProgress: 50,
    activeProgress: 65,
    activeProgressPulse: true,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Active step shows an elegant shimmer gradient overlay at 65% completion. The gradient sweeps across with white and subtle blue hints, creating a sophisticated animated effect.',
      },
    },
  },
};

export const ActiveProgressStatic: Story = {
  args: {
    jobName: 'Processing data with static progress...',
    steps: basicSteps,
    currentProgress: 50,
    activeProgress: 40,
    activeProgressPulse: false,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Active step shows a static gradient overlay at 40% completion (no shimmer animation). Use activeProgressPulse={false} to disable the sweep effect.',
      },
    },
  },
};

export const ActiveProgressAnimated: Story = {
  render: () => {
    const [activeProgress, setActiveProgress] = React.useState(0);

    React.useEffect(() => {
      const interval = setInterval(() => {
        setActiveProgress((p) => {
          if (p >= 100) {
            return 0;
          }
          return p + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    }, []);

    return (
      <div>
        <AsyncJobTimeline
          jobName="Watch active step progress fill up..."
          steps={basicSteps}
          currentProgress={50}
          activeProgress={activeProgress}
          activeProgressPulse={true}
          size="full"
          showProgressBar={true}
        />
        <div className="mt-4 text-center">
          <p className="text-[#586e75] text-sm">Active Step Progress: {activeProgress}%</p>
          <p className="text-[#93a1a1] text-xs">Overlay fills from 0% to 100% with pulsing animation</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Animated demonstration of active progress overlay filling from 0% to 100%.',
      },
    },
  },
};

export const ActiveProgressComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">With Pulsing (Default)</h3>
        <AsyncJobTimeline
          jobName="Processing with pulsing overlay"
          steps={basicSteps}
          currentProgress={50}
          activeProgress={60}
          activeProgressPulse={true}
          size="full"
          showProgressBar={false}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          Elegant shimmer sweeps across every 3 seconds with white and blue hints
        </p>
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">Without Shimmer</h3>
        <AsyncJobTimeline
          jobName="Processing with static overlay"
          steps={basicSteps}
          currentProgress={50}
          activeProgress={60}
          activeProgressPulse={false}
          size="full"
          showProgressBar={false}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          Static gradient without animation
        </p>
      </div>

      <div>
        <h3 className="text-[#586e75] text-sm font-medium mb-2">No Active Progress</h3>
        <AsyncJobTimeline
          jobName="Processing without overlay"
          steps={basicSteps}
          currentProgress={50}
          activeProgress={0}
          size="full"
          showProgressBar={false}
        />
        <p className="text-[#93a1a1] text-xs mt-2">
          No overlay shown (activeProgress=0 or undefined)
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of active progress states: shimmer animation, static gradient, and none.',
      },
    },
  },
};

// ============================================================================
// Interactive Playground
// ============================================================================

export const Playground: Story = {
  args: {
    jobName: 'Interactive playground',
    steps: basicSteps,
    currentProgress: 50,
    activeProgress: 0,
    activeProgressPulse: true,
    size: 'full',
    showProgressBar: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use the controls to customize all parameters.',
      },
    },
  },
};
