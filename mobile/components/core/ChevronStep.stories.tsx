import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import ChevronStep from './ChevronStep';

const meta = {
  title: 'Core/ChevronStep',
  component: ChevronStep,
  args: {
    status: 'pending',
    position: 'middle',
    size: 'full',
    children: 'Step Label',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'active', 'done', 'error', 'next', 'tab', 'active_tab'],
    },
    position: {
      control: 'select',
      options: ['first', 'middle', 'last', 'single'],
    },
    size: {
      control: 'select',
      options: ['full', 'micro', 'nano'],
    },
    emoji: {
      control: 'text',
    },
    onClick: { action: 'clicked' },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#002b36', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ChevronStep>;

export default meta;
type Story = StoryObj<typeof meta>;

// === Position Variants ===

export const FirstPosition: Story = {
  args: {
    position: 'first',
    status: 'active',
    children: 'First Step',
  },
};

export const MiddlePosition: Story = {
  args: {
    position: 'middle',
    status: 'active',
    children: 'Middle Step',
  },
};

export const LastPosition: Story = {
  args: {
    position: 'last',
    status: 'active',
    children: 'Last Step',
  },
};

export const SinglePosition: Story = {
  args: {
    position: 'single',
    status: 'active',
    children: 'Single Step',
  },
};

// === Status Variants ===

export const StatusPending: Story = {
  args: {
    status: 'pending',
    position: 'middle',
    children: 'Pending',
  },
};

export const StatusActive: Story = {
  args: {
    status: 'active',
    position: 'middle',
    children: 'Active',
  },
};

export const StatusDone: Story = {
  args: {
    status: 'done',
    position: 'middle',
    emoji: '✅',
    children: 'Done',
  },
};

export const StatusError: Story = {
  args: {
    status: 'error',
    position: 'middle',
    emoji: '❌',
    children: 'Error',
  },
};

export const StatusNext: Story = {
  args: {
    status: 'next',
    position: 'middle',
    children: 'Next',
  },
};

export const StatusTab: Story = {
  args: {
    status: 'tab',
    position: 'middle',
    emoji: '📋',
    children: 'Tab',
  },
};

export const StatusActiveTab: Story = {
  args: {
    status: 'active_tab',
    position: 'middle',
    emoji: '📋',
    children: 'Active Tab',
  },
};

// === Size Variants ===

export const SizeFull: Story = {
  args: {
    size: 'full',
    status: 'active',
    position: 'middle',
    children: 'Full Size (60px)',
  },
};

export const SizeMicro: Story = {
  args: {
    size: 'micro',
    status: 'active',
    position: 'middle',
    children: 'Micro (40px)',
  },
};

export const SizeNano: Story = {
  args: {
    size: 'nano',
    status: 'active',
    position: 'middle',
    children: 'Nano (28px)',
  },
};

// === With Emoji ===

export const WithEmoji: Story = {
  args: {
    status: 'done',
    position: 'middle',
    emoji: '🎯',
    children: 'Task Complete',
  },
};

export const EmojiOnly: Story = {
  args: {
    status: 'active',
    position: 'middle',
    emoji: '⚡',
    children: undefined,
  },
};

// === Interlocking Sequence ===

export const InterlockingSequence: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', width: '100%' }}>
      <View style={{ flex: 1 }}>
        <ChevronStep position="first" status="done" size="full" emoji="✅">
          Step 1
        </ChevronStep>
      </View>
      <View style={{ flex: 1 }}>
        <ChevronStep position="middle" status="active" size="full" emoji="⚡">
          Step 2
        </ChevronStep>
      </View>
      <View style={{ flex: 1 }}>
        <ChevronStep position="middle" status="pending" size="full">
          Step 3
        </ChevronStep>
      </View>
      <View style={{ flex: 1 }}>
        <ChevronStep position="last" status="pending" size="full">
          Step 4
        </ChevronStep>
      </View>
    </View>
  ),
};

// === Interactive ===

export const Interactive: Story = {
  args: {
    status: 'active',
    position: 'middle',
    emoji: '👆',
    children: 'Click Me',
    onClick: () => alert('Chevron clicked!'),
  },
};

// === Custom Colors ===

export const CustomColors: Story = {
  args: {
    status: 'pending',
    position: 'middle',
    children: 'Custom',
    fillColor: '#d33682',
    strokeColor: '#6c71c4',
  },
};

// === Tab Sequence ===

export const TabSequence: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', width: '100%' }}>
      <View style={{ flex: 1 }}>
        <ChevronStep position="first" status="active_tab" size="micro" emoji="🎯">
          Capture
        </ChevronStep>
      </View>
      <View style={{ flex: 1 }}>
        <ChevronStep position="middle" status="tab" size="micro" emoji="🔍">
          Scout
        </ChevronStep>
      </View>
      <View style={{ flex: 1 }}>
        <ChevronStep position="middle" status="tab" size="micro" emoji="🎨">
          Hunter
        </ChevronStep>
      </View>
      <View style={{ flex: 1 }}>
        <ChevronStep position="last" status="tab" size="micro" emoji="🗺️">
          Mapper
        </ChevronStep>
      </View>
    </View>
  ),
};

// === All Sizes Comparison ===

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <ChevronStep position="middle" status="active" size="full">
        Full (60px)
      </ChevronStep>
      <ChevronStep position="middle" status="active" size="micro">
        Micro (40px)
      </ChevronStep>
      <ChevronStep position="middle" status="active" size="nano">
        Nano (28px)
      </ChevronStep>
    </View>
  ),
};

// === All Statuses Comparison ===

export const AllStatuses: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <ChevronStep position="middle" status="pending" size="micro">
        Pending
      </ChevronStep>
      <ChevronStep position="middle" status="active" size="micro" emoji="⚡">
        Active
      </ChevronStep>
      <ChevronStep position="middle" status="done" size="micro" emoji="✅">
        Done
      </ChevronStep>
      <ChevronStep position="middle" status="error" size="micro" emoji="❌">
        Error
      </ChevronStep>
      <ChevronStep position="middle" status="next" size="micro" emoji="👉">
        Next
      </ChevronStep>
      <ChevronStep position="middle" status="tab" size="micro" emoji="📋">
        Tab
      </ChevronStep>
      <ChevronStep position="middle" status="active_tab" size="micro" emoji="📋">
        Active Tab
      </ChevronStep>
    </View>
  ),
};
