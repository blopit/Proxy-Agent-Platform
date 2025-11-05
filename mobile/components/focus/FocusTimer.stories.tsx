import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import FocusTimer from './FocusTimer';
import { THEME } from '../../src/theme/colors';

const meta = {
  title: 'Focus/FocusTimer',
  component: FocusTimer,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: THEME.base03, padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof FocusTimer>;

export default meta;
type Story = StoryObj<typeof meta>;

// === Session Types ===

export const FocusSession: Story = {
  args: {
    duration: 25 * 60, // 25 minutes
    sessionType: 'focus',
  },
};

export const ShortBreak: Story = {
  args: {
    duration: 5 * 60, // 5 minutes
    sessionType: 'short-break',
  },
};

export const LongBreak: Story = {
  args: {
    duration: 15 * 60, // 15 minutes
    sessionType: 'long-break',
  },
};

// === Duration Variants ===

export const QuickFocus: Story = {
  args: {
    duration: 10 * 60, // 10 minutes
    sessionType: 'focus',
  },
};

export const DeepWork: Story = {
  args: {
    duration: 50 * 60, // 50 minutes
    sessionType: 'focus',
  },
};

export const MicroBreak: Story = {
  args: {
    duration: 2 * 60, // 2 minutes
    sessionType: 'short-break',
  },
};

// === States ===

export const AutoStart: Story = {
  args: {
    duration: 25 * 60,
    sessionType: 'focus',
    autoStart: true,
  },
};

export const NearCompletion: Story = {
  args: {
    duration: 10, // 10 seconds for testing
    sessionType: 'focus',
  },
};

// === Interactive Demo ===

export const WithCallbacks: Story = {
  args: {
    duration: 15, // 15 seconds for demo
    sessionType: 'focus',
    onStart: () => console.log('Timer started!'),
    onPause: () => console.log('Timer paused!'),
    onStop: () => console.log('Timer stopped!'),
    onComplete: () => {
      console.log('Session complete!');
      alert('Focus session complete! Great work!');
    },
  },
};

// === Energy-Aware Durations ===

export const LowEnergySession: Story = {
  args: {
    duration: 15 * 60, // 15 minutes (shorter for low energy)
    sessionType: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shorter focus session recommended for low energy levels',
      },
    },
  },
};

export const HighEnergySession: Story = {
  args: {
    duration: 50 * 60, // 50 minutes (longer for high energy)
    sessionType: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story: 'Longer deep work session for high energy levels',
      },
    },
  },
};

// === ADHD-Optimized Durations ===

export const ADHDMicroFocus: Story = {
  args: {
    duration: 5 * 60, // 5 minutes
    sessionType: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ultra-short focus burst for ADHD - builds momentum without overwhelm',
      },
    },
  },
};

export const ADHDBodyDouble: Story = {
  args: {
    duration: 20 * 60, // 20 minutes
    sessionType: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story: 'Body doubling session - work alongside others for 20 minutes',
      },
    },
  },
};

// === Nested Rings Demonstrations ===

export const NestedRingsDemo: Story = {
  args: {
    duration: 60, // 1 minute for quick demo
    sessionType: 'focus',
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: '3 nested rings: Inner (1% segments), Middle (10% segments), Outer (full session). Watch the inner ring cycle fastest!',
      },
    },
  },
};

export const NestedRingsShortSession: Story = {
  args: {
    duration: 5 * 60, // 5 minutes
    sessionType: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story: '5-minute session showing nested ring behavior - inner ring provides immediate feedback',
      },
    },
  },
};

export const NestedRingsLongSession: Story = {
  args: {
    duration: 50 * 60, // 50 minutes
    sessionType: 'focus',
  },
  parameters: {
    docs: {
      description: {
        story: 'Long session where you can really appreciate the multi-scale progress feedback',
      },
    },
  },
};
