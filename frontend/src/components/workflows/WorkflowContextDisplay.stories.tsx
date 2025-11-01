/**
 * WorkflowContextDisplay Stories
 *
 * Shows how user context is displayed to explain AI step generation.
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import { spacing } from '@/lib/design-system';
import WorkflowContextDisplay from './WorkflowContextDisplay';

const meta: Meta<typeof WorkflowContextDisplay> = {
  title: 'Workflows/WorkflowContextDisplay',
  component: WorkflowContextDisplay,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Display user context used by AI to generate personalized workflow steps. Shows energy level, time of day, codebase state, and recent work.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userEnergy: {
      control: 'select',
      options: [1, 2, 3],
      description: 'User energy level (1=Low, 2=Medium, 3=High)',
    },
    timeOfDay: {
      control: 'select',
      options: ['morning', 'afternoon', 'evening', 'night'],
      description: 'Current time of day',
    },
    compact: {
      control: 'boolean',
      description: 'Show compact badge view instead of detailed view',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowContextDisplay>;

/**
 * Default - Medium energy, morning
 */
export const Default: Story = {
  args: {
    userEnergy: 2,
    timeOfDay: 'morning',
    codebaseState: {
      testsPassing: 150,
      testsFailing: 5,
      recentFiles: [
        'src/services/delegation/routes.py',
        'src/services/delegation/repository.py',
        'src/api/main.py',
      ],
    },
    recentTasks: [
      'Completed BE-00: Task Delegation System',
      'Fixed bug in authentication middleware',
      'Updated API documentation',
    ],
    compact: false,
  },
};

/**
 * Low Energy - Afternoon slump
 */
export const LowEnergy: Story = {
  args: {
    userEnergy: 1,
    timeOfDay: 'afternoon',
    codebaseState: {
      testsPassing: 142,
      testsFailing: 8,
      recentFiles: ['frontend/src/components/dashboard/StatsCard.tsx'],
    },
    recentTasks: ['Morning standup', 'Code review'],
    compact: false,
  },
};

/**
 * High Energy - Morning peak
 */
export const HighEnergy: Story = {
  args: {
    userEnergy: 3,
    timeOfDay: 'morning',
    codebaseState: {
      testsPassing: 165,
      testsFailing: 0,
      recentFiles: [
        'src/workflows/executor.py',
        'src/workflows/models.py',
        'workflows/dev/backend-api-feature.toml',
      ],
    },
    recentTasks: [
      'Implemented workflow system',
      'Created 3 workflow definitions',
      'Added API endpoints',
    ],
    compact: false,
  },
};

/**
 * Evening - Wind down
 */
export const Evening: Story = {
  args: {
    userEnergy: 2,
    timeOfDay: 'evening',
    codebaseState: {
      testsPassing: 158,
      testsFailing: 2,
    },
    recentTasks: [
      'Completed feature implementation',
      'Fixed integration tests',
    ],
    compact: false,
  },
};

/**
 * Compact View - For space-constrained UIs
 */
export const CompactView: Story = {
  args: {
    userEnergy: 2,
    timeOfDay: 'afternoon',
    codebaseState: {
      testsPassing: 150,
      testsFailing: 5,
    },
    compact: true,
  },
};

/**
 * Tests Failing - Needs attention
 */
export const TestsFailing: Story = {
  args: {
    userEnergy: 2,
    timeOfDay: 'morning',
    codebaseState: {
      testsPassing: 120,
      testsFailing: 30,
      recentFiles: [
        'src/api/routes/workflows.py',
        'src/workflows/executor.py',
      ],
    },
    recentTasks: [
      'Started workflow integration',
      'Multiple test failures detected',
    ],
    compact: false,
  },
};

/**
 * All Tests Passing - Clean slate
 */
export const AllTestsPassing: Story = {
  args: {
    userEnergy: 3,
    timeOfDay: 'morning',
    codebaseState: {
      testsPassing: 182,
      testsFailing: 0,
      recentFiles: [
        'src/workflows/tests/test_executor.py',
        'src/api/routes/workflows.py',
      ],
    },
    recentTasks: [
      '✅ All workflows passing',
      '✅ API integration complete',
      '✅ Frontend components created',
    ],
    compact: false,
  },
};

/**
 * Minimal Context - Just energy and time
 */
export const MinimalContext: Story = {
  args: {
    userEnergy: 2,
    timeOfDay: 'afternoon',
    compact: false,
  },
};

/**
 * All Times of Day - Comparison
 */
export const AllTimes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], width: '500px' }}>
      {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => (
        <WorkflowContextDisplay
          key={time}
          userEnergy={2}
          timeOfDay={time}
          compact={true}
        />
      ))}
    </div>
  ),
};

/**
 * All Energy Levels - Comparison
 */
export const AllEnergyLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6], width: '500px' }}>
      {([1, 2, 3] as const).map((energy) => (
        <WorkflowContextDisplay
          key={energy}
          userEnergy={energy}
          timeOfDay="morning"
          codebaseState={{
            testsPassing: 150,
            testsFailing: 5,
          }}
          compact={false}
        />
      ))}
    </div>
  ),
};
