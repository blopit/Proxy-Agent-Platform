import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';
import TaskCardBig from './TaskCardBig';
import type { TaskCardProps, TaskStatus, TaskPriority, LeafType } from '@/types/task-schema';
import type { MicroStep, TaskBreakdown } from '@/types/capture';

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Generate realistic micro-steps for different task types
 */
function generateMicroSteps(
  count: number,
  digitalRatio: number = 0.6,
  type: 'software' | 'design' | 'content' | 'business' = 'software'
): MicroStep[] {
  const templates = {
    software: [
      { desc: 'Set up development environment', leaf: 'DIGITAL', icon: '⚙️', min: 15 },
      { desc: 'Design database schema', leaf: 'DIGITAL', icon: '🗄️', min: 30 },
      { desc: 'Implement API endpoints', leaf: 'DIGITAL', icon: '🔌', min: 45 },
      { desc: 'Write unit tests', leaf: 'DIGITAL', icon: '🧪', min: 30 },
      { desc: 'Code review with team', leaf: 'HUMAN', icon: '👥', min: 20 },
      { desc: 'Update documentation', leaf: 'DIGITAL', icon: '📝', min: 15 },
      { desc: 'Deploy to staging', leaf: 'DIGITAL', icon: '🚀', min: 10 },
      { desc: 'QA testing session', leaf: 'HUMAN', icon: '🔍', min: 30 },
      { desc: 'Performance optimization', leaf: 'DIGITAL', icon: '⚡', min: 40 },
      { desc: 'Security audit', leaf: 'DIGITAL', icon: '🔒', min: 25 },
    ],
    design: [
      { desc: 'Research design inspiration', leaf: 'HUMAN', icon: '🎨', min: 30 },
      { desc: 'Create mood board', leaf: 'DIGITAL', icon: '🖼️', min: 20 },
      { desc: 'Sketch initial concepts', leaf: 'HUMAN', icon: '✏️', min: 45 },
      { desc: 'Design high-fidelity mockups', leaf: 'DIGITAL', icon: '🎨', min: 60 },
      { desc: 'Review with stakeholders', leaf: 'HUMAN', icon: '💬', min: 30 },
      { desc: 'Iterate based on feedback', leaf: 'DIGITAL', icon: '🔄', min: 40 },
      { desc: 'Create design system components', leaf: 'DIGITAL', icon: '🧩', min: 50 },
      { desc: 'Prepare assets for development', leaf: 'DIGITAL', icon: '📦', min: 20 },
    ],
    content: [
      { desc: 'Research topic and gather sources', leaf: 'HUMAN', icon: '📚', min: 40 },
      { desc: 'Create content outline', leaf: 'DIGITAL', icon: '📋', min: 20 },
      { desc: 'Write first draft', leaf: 'DIGITAL', icon: '✍️', min: 90 },
      { desc: 'Edit and refine content', leaf: 'HUMAN', icon: '✂️', min: 45 },
      { desc: 'Add visuals and formatting', leaf: 'DIGITAL', icon: '🖼️', min: 30 },
      { desc: 'Peer review', leaf: 'HUMAN', icon: '👀', min: 25 },
      { desc: 'Final proofreading', leaf: 'HUMAN', icon: '🔍', min: 20 },
      { desc: 'Publish content', leaf: 'DIGITAL', icon: '📤', min: 10 },
    ],
    business: [
      { desc: 'Schedule stakeholder meeting', leaf: 'DIGITAL', icon: '📅', min: 10 },
      { desc: 'Prepare presentation deck', leaf: 'DIGITAL', icon: '📊', min: 60 },
      { desc: 'Conduct team meeting', leaf: 'HUMAN', icon: '🤝', min: 45 },
      { desc: 'Document action items', leaf: 'DIGITAL', icon: '📝', min: 15 },
      { desc: 'Follow up with stakeholders', leaf: 'HUMAN', icon: '📧', min: 20 },
      { desc: 'Update project roadmap', leaf: 'DIGITAL', icon: '🗺️', min: 30 },
    ],
  };

  const pool = templates[type];
  const steps: MicroStep[] = [];

  for (let i = 0; i < count && i < pool.length; i++) {
    const template = pool[i];
    // Override leaf type based on digital ratio
    const isDigital = Math.random() < digitalRatio;

    steps.push({
      step_id: `step-${i + 1}`,
      description: template.desc,
      estimated_minutes: template.min,
      leaf_type: isDigital ? 'DIGITAL' : 'HUMAN',
      icon: template.icon,
      delegation_mode: isDigital ? 'do' : 'do_with_me',
      level: 0,
      decomposition_state: 'atomic',
      is_leaf: true,
    });
  }

  return steps;
}

/**
 * Generate task breakdown from micro-steps
 */
function generateBreakdown(steps: MicroStep[]): TaskBreakdown {
  const digitalCount = steps.filter(s => s.leaf_type === 'DIGITAL').length;
  const humanCount = steps.filter(s => s.leaf_type === 'HUMAN').length;
  const totalMinutes = steps.reduce((sum, s) => sum + s.estimated_minutes, 0);

  return {
    total_steps: steps.length,
    digital_count: digitalCount,
    human_count: humanCount,
    total_minutes: totalMinutes,
  };
}

/**
 * Create a complete task card props object
 */
function createTaskCardProps(options: {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  tags?: string[];
  microStepsCount?: number;
  digitalRatio?: number;
  taskType?: 'software' | 'design' | 'content' | 'business';
  progress?: number;
  hasDependencies?: boolean;
  complexityScore?: number;
}): TaskCardProps {
  const {
    title,
    description,
    status,
    priority,
    estimatedHours = 2,
    tags = [],
    microStepsCount = 5,
    digitalRatio = 0.6,
    taskType = 'software',
    progress = 0,
    hasDependencies = false,
    complexityScore,
  } = options;

  const microSteps = generateMicroSteps(microStepsCount, digitalRatio, taskType);
  const breakdown = generateBreakdown(microSteps);
  const isDigital = breakdown.digital_count > breakdown.human_count;

  const completedSteps = Math.floor((progress / 100) * microSteps.length);

  return {
    title,
    description,
    status,
    priority,
    estimated_hours: estimatedHours,
    estimated_minutes: breakdown.total_minutes,
    tags,
    micro_steps: microSteps,
    breakdown,
    is_digital: isDigital,
    progress,
    subtask_progress: {
      completed: completedSteps,
      total: microSteps.length,
      percentage: progress,
    },
    has_dependencies: hasDependencies,
    complexity_score: complexityScore,
    created_at: new Date().toISOString(),
  };
}

// ============================================================================
// Storybook Configuration
// ============================================================================

const meta: Meta<typeof TaskCardBig> = {
  title: 'Components/Mobile/Cards/TaskCardBig',
  component: TaskCardBig,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'solarized-dark',
      values: [
        { name: 'solarized-dark', value: '#002b36' },
        { name: 'solarized-light', value: '#fdf6e3' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', minWidth: '400px', maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    task: {
      control: 'object',
      description: 'Task card properties',
    },
    onStartTask: {
      action: 'onStartTask',
      description: 'Callback when Start Task button is clicked',
    },
    onViewDetails: {
      action: 'onViewDetails',
      description: 'Callback when View Details button is clicked',
    },
  },
  args: {
    onStartTask: undefined,
    onViewDetails: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof TaskCardBig>;

// ============================================================================
// A. Showcase Stories - Visual Gallery
// ============================================================================

export const AllStatuses: Story = {
  name: '📊 All Status States',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '1200px' }}>
      {(['pending', 'in_progress', 'done', 'review', 'blocked', 'deferred', 'cancelled'] as TaskStatus[]).map((status) => (
        <TaskCardBig
          key={status}
          task={createTaskCardProps({
            title: `Task in ${status.replace('_', ' ')} state`,
            description: `This task demonstrates the ${status} status appearance with all visual indicators.`,
            status,
            priority: 'medium',
            tags: [status, 'demo'],
            microStepsCount: 3,
          })}
          onStartTask={() => console.log(`start-${status}`)}
          onViewDetails={() => console.log(`view-${status}`)}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Shows all 7 task status states with their respective color coding and styling.',
      },
    },
  },
};

export const AllPriorities: Story = {
  name: '🎯 All Priority Levels',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', maxWidth: '1200px' }}>
      {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map((priority) => (
        <TaskCardBig
          key={priority}
          task={createTaskCardProps({
            title: `${priority.toUpperCase()} Priority Task`,
            description: `This task has ${priority} priority with appropriate visual emphasis and border color.`,
            status: 'pending',
            priority,
            tags: [priority, 'priority-demo'],
            microStepsCount: 4,
          })}
          onStartTask={() => console.log(`start-${priority}`)}
          onViewDetails={() => console.log(`view-${priority}`)}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Displays all 4 priority levels (low, medium, high, critical) with Solarized color coding.',
      },
    },
  },
};

// ============================================================================
// B. Realistic Scenarios
// ============================================================================

export const SimpleTask: Story = {
  name: '✅ Simple Task',
  args: {
    task: createTaskCardProps({
      title: 'Fix navigation menu bug',
      description: 'The mobile navigation menu is not closing properly on iOS devices. Need to update the event handlers.',
      status: 'pending',
      priority: 'high',
      estimatedHours: 0.5,
      tags: ['bug', 'frontend', 'mobile'],
      microStepsCount: 2,
      digitalRatio: 1.0,
      taskType: 'software',
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple bug fix task with minimal complexity - only 2 micro-steps and 30 minutes estimated.',
      },
    },
  },
};

export const MediumComplexity: Story = {
  name: '⚙️ Medium Complexity',
  args: {
    task: createTaskCardProps({
      title: 'Implement user authentication flow',
      description: 'Create a complete authentication system with login, signup, password reset, and session management. Includes both frontend UI and backend API integration.',
      status: 'in_progress',
      priority: 'high',
      estimatedHours: 4,
      tags: ['feature', 'backend', 'frontend', 'security'],
      microStepsCount: 7,
      digitalRatio: 0.7,
      taskType: 'software',
      progress: 35,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'A moderately complex feature with 7 micro-steps, mixed digital/human work, and active progress tracking.',
      },
    },
  },
};

export const HighlyComplex: Story = {
  name: '🏗️ Highly Complex Task',
  args: {
    task: createTaskCardProps({
      title: 'Redesign entire dashboard with new analytics',
      description: 'Complete overhaul of the main dashboard including new data visualizations, real-time updates, responsive design, and performance optimizations. This is a major project spanning multiple systems.',
      status: 'review',
      priority: 'critical',
      estimatedHours: 12,
      tags: ['feature', 'design', 'frontend', 'analytics', 'performance'],
      microStepsCount: 10,
      digitalRatio: 0.5,
      taskType: 'design',
      hasDependencies: true,
      complexityScore: 9,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'A highly complex task with 10+ micro-steps, balanced digital/human work, dependencies, and high complexity score.',
      },
    },
  },
};

export const DigitalOnly: Story = {
  name: '🤖 100% Digital Task',
  args: {
    task: createTaskCardProps({
      title: 'Automate deployment pipeline',
      description: 'Set up CI/CD automation with GitHub Actions for automated testing, building, and deployment to staging and production environments.',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 3,
      tags: ['automation', 'devops', 'ci-cd', 'digital'],
      microStepsCount: 6,
      digitalRatio: 1.0,
      taskType: 'software',
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'A purely digital task with 100% automated work. Shows the digital indicator and bot icon.',
      },
    },
  },
};

export const HumanOnly: Story = {
  name: '👤 100% Human Task',
  args: {
    task: createTaskCardProps({
      title: 'Conduct user research interviews',
      description: 'Schedule and conduct 5 user interviews to gather feedback on the new feature set. Document insights and identify pain points.',
      status: 'pending',
      priority: 'medium',
      estimatedHours: 5,
      tags: ['research', 'user-testing', 'human', 'interviews'],
      microStepsCount: 5,
      digitalRatio: 0.0,
      taskType: 'business',
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'A task requiring 100% human interaction - interviews, meetings, and qualitative analysis.',
      },
    },
  },
};

export const MixedLeafTypes: Story = {
  name: '🔀 Mixed Digital/Human',
  args: {
    task: createTaskCardProps({
      title: 'Launch product marketing campaign',
      description: 'Plan and execute a comprehensive marketing campaign including content creation, social media, email outreach, and analytics tracking.',
      status: 'in_progress',
      priority: 'high',
      estimatedHours: 8,
      tags: ['marketing', 'content', 'social-media'],
      microStepsCount: 8,
      digitalRatio: 0.5,
      taskType: 'content',
      progress: 20,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Balanced 50/50 mix of digital and human work, demonstrating tasks that require both automation and personal touch.',
      },
    },
  },
};

// ============================================================================
// C. Special States
// ============================================================================

export const WithProgress: Story = {
  name: '📈 Active with Progress',
  args: {
    task: createTaskCardProps({
      title: 'Migrate database to PostgreSQL',
      description: 'Migrate from MySQL to PostgreSQL, including schema conversion, data migration, and application updates.',
      status: 'in_progress',
      priority: 'critical',
      estimatedHours: 6,
      tags: ['database', 'migration', 'backend'],
      microStepsCount: 8,
      digitalRatio: 0.8,
      taskType: 'software',
      progress: 45,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Active task showing 45% completion progress with subtask tracking.',
      },
    },
  },
};

export const UrgentHighPriority: Story = {
  name: '🚨 Critical & Urgent',
  args: {
    task: createTaskCardProps({
      title: 'URGENT: Fix production server crash',
      description: 'Production server is experiencing crashes every 30 minutes. Need immediate investigation and fix. Customer-facing impact!',
      status: 'in_progress',
      priority: 'critical',
      estimatedHours: 1,
      tags: ['urgent', 'production', 'bug', 'critical'],
      microStepsCount: 4,
      digitalRatio: 1.0,
      taskType: 'software',
      progress: 25,
      complexityScore: 7,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Critical priority task with urgent visual indicators and short time estimate.',
      },
    },
  },
};

export const LongDurationTask: Story = {
  name: '⏰ Long Duration Project',
  args: {
    task: createTaskCardProps({
      title: 'Build mobile app from scratch',
      description: 'Design and develop a complete mobile application for iOS and Android, including backend API, authentication, data sync, and app store deployment.',
      status: 'pending',
      priority: 'high',
      estimatedHours: 16,
      tags: ['mobile', 'ios', 'android', 'project', 'long-term'],
      microStepsCount: 10,
      digitalRatio: 0.6,
      taskType: 'software',
      hasDependencies: true,
      complexityScore: 10,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Large project with 16+ hours estimated, showing how the card handles long-duration tasks.',
      },
    },
  },
};

export const TagsOverflow: Story = {
  name: '🏷️ Many Tags',
  args: {
    task: createTaskCardProps({
      title: 'Update component library',
      description: 'Comprehensive update to the design system component library with new components and improvements.',
      status: 'review',
      priority: 'medium',
      estimatedHours: 5,
      tags: ['design-system', 'components', 'react', 'typescript', 'storybook', 'accessibility', 'responsive', 'documentation', 'testing'],
      microStepsCount: 6,
      digitalRatio: 0.7,
      taskType: 'design',
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Task with many tags to test tag overflow and truncation behavior.',
      },
    },
  },
};

// ============================================================================
// D. Interactive Playground
// ============================================================================

export const Playground: Story = {
  name: '🎮 Interactive Playground',
  render: function PlaygroundStory() {
    const [title, setTitle] = useState('Customize this task');
    const [description, setDescription] = useState('Use the controls below to modify this task card in real-time.');
    const [status, setStatus] = useState<TaskStatus>('pending');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [estimatedHours, setEstimatedHours] = useState(2);
    const [microStepsCount, setMicroStepsCount] = useState(5);
    const [digitalRatio, setDigitalRatio] = useState(0.6);
    const [progress, setProgress] = useState(0);

    const task = createTaskCardProps({
      title,
      description,
      status,
      priority,
      estimatedHours,
      tags: ['playground', 'interactive', 'demo'],
      microStepsCount,
      digitalRatio,
      progress,
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
        {/* Controls */}
        <div style={{ background: '#073642', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#93a1a1', marginBottom: '16px', fontSize: '16px' }}>Customize Task</h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#002b36',
                  border: '1px solid #586e75',
                  borderRadius: '4px',
                  color: '#93a1a1',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#002b36',
                  border: '1px solid #586e75',
                  borderRadius: '4px',
                  color: '#93a1a1',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#002b36',
                    border: '1px solid #586e75',
                    borderRadius: '4px',
                    color: '#93a1a1',
                    fontSize: '14px',
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="review">Review</option>
                  <option value="blocked">Blocked</option>
                  <option value="deferred">Deferred</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#002b36',
                    border: '1px solid #586e75',
                    borderRadius: '4px',
                    color: '#93a1a1',
                    fontSize: '14px',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Estimated Hours: {estimatedHours}h
              </label>
              <input
                type="range"
                min="0.5"
                max="24"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Micro-steps: {microStepsCount}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={microStepsCount}
                onChange={(e) => setMicroStepsCount(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Digital Ratio: {Math.round(digitalRatio * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={digitalRatio}
                onChange={(e) => setDigitalRatio(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ color: '#839496', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Progress: {progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Card Preview */}
        <TaskCardBig
          task={task}
          onStartTask={() => console.log('start-task', task.title)}
          onViewDetails={() => console.log('view-details', task.title)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive playground with real-time controls to customize all aspects of the task card.',
      },
    },
  },
};

// ============================================================================
// E. Edge Cases
// ============================================================================

export const NoMicroSteps: Story = {
  name: '🔍 No Breakdown',
  args: {
    task: {
      title: 'Simple atomic task',
      description: 'This task is simple enough that it doesn\'t need to be broken down into micro-steps.',
      status: 'pending',
      priority: 'low',
      estimated_hours: 0.25,
      tags: ['simple', 'atomic'],
      micro_steps: [],
      breakdown: {
        total_steps: 0,
        digital_count: 0,
        human_count: 0,
        total_minutes: 15,
      },
      is_digital: true,
      progress: 0,
    },
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Task without any micro-steps breakdown.',
      },
    },
  },
};

export const NoDescription: Story = {
  name: '📝 Minimal Task',
  args: {
    task: {
      title: 'Quick task with title only',
      description: '',
      status: 'pending',
      priority: 'low',
      estimated_hours: 0.5,
      tags: ['quick'],
      micro_steps: generateMicroSteps(2, 1.0),
      breakdown: generateBreakdown(generateMicroSteps(2, 1.0)),
      is_digital: true,
      progress: 0,
    },
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Task with no description text.',
      },
    },
  },
};

export const VeryLongTitle: Story = {
  name: '📏 Long Title Truncation',
  args: {
    task: createTaskCardProps({
      title: 'This is an extremely long task title that should test the text truncation and wrapping behavior of the card component to ensure it handles edge cases properly without breaking the layout or causing overflow issues in the UI',
      description: 'Testing how the card handles very long titles.',
      status: 'pending',
      priority: 'medium',
      tags: ['edge-case', 'truncation'],
      microStepsCount: 3,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Very long title to test text truncation behavior.',
      },
    },
  },
};

export const NoTags: Story = {
  name: '🏷️ Without Tags',
  args: {
    task: createTaskCardProps({
      title: 'Task without any tags',
      description: 'This task has no tags assigned to it.',
      status: 'pending',
      priority: 'medium',
      tags: [],
      microStepsCount: 4,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Task with empty tags array.',
      },
    },
  },
};

export const SingleMicroStep: Story = {
  name: '1️⃣ Single Step',
  args: {
    task: createTaskCardProps({
      title: 'Nearly atomic task',
      description: 'This task has only one micro-step, making it almost atomic.',
      status: 'pending',
      priority: 'low',
      estimatedHours: 0.5,
      tags: ['simple'],
      microStepsCount: 1,
    }),
    onStartTask: () => console.log('start-task'),
    onViewDetails: () => console.log('view-details'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case: Task with only a single micro-step.',
      },
    },
  },
};
