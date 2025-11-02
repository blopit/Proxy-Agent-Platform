/**
 * SimpleTabs Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { useState } from 'react';
import SimpleTabs, { SimpleTab } from './SimpleTabs';

const meta = {
  title: 'Core/SimpleTabs',
  component: SimpleTabs,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#002b36', justifyContent: 'flex-end' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SimpleTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
function InteractiveTabs(props: any) {
  const [activeTab, setActiveTab] = useState<SimpleTab>(props.activeTab || 'inbox');
  return <SimpleTabs {...props} activeTab={activeTab} onChange={setActiveTab} />;
}

export const InboxActive: Story = {
  args: {
    activeTab: 'inbox',
    onChange: () => {},
  },
};

export const TodayActive: Story = {
  args: {
    activeTab: 'today',
    onChange: () => {},
  },
};

export const ProgressActive: Story = {
  args: {
    activeTab: 'progress',
    onChange: () => {},
  },
};

export const WithNumericBadges: Story = {
  args: {
    activeTab: 'today',
    onChange: () => {},
    showBadges: {
      inbox: 5,
      today: 3,
    },
  },
};

export const WithBooleanBadge: Story = {
  args: {
    activeTab: 'inbox',
    onChange: () => {},
    showBadges: {
      progress: true, // New achievement unlocked
    },
  },
};

export const WithAllBadges: Story = {
  args: {
    activeTab: 'today',
    onChange: () => {},
    showBadges: {
      inbox: 12,
      today: 5,
      progress: true,
    },
  },
};

export const WithLargeBadge: Story = {
  args: {
    activeTab: 'inbox',
    onChange: () => {},
    showBadges: {
      inbox: 150, // Should display as "99+"
    },
  },
};

export const Interactive: Story = {
  render: (args) => <InteractiveTabs {...args} />,
  args: {
    showBadges: {
      inbox: 8,
      today: 2,
      progress: true,
    },
  },
};
