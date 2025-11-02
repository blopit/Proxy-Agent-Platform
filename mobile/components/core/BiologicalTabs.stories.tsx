/**
 * BiologicalTabs Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { useState } from 'react';
import BiologicalTabs from './BiologicalTabs';

const meta = {
  title: 'Core/BiologicalTabs',
  component: BiologicalTabs,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#002b36' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof BiologicalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper
function InteractiveTabs(props: any) {
  const [activeTab, setActiveTab] = useState(props.activeTab || 'add');
  return <BiologicalTabs {...props} activeTab={activeTab} onTabChange={setActiveTab} />;
}

export const AddActive: Story = {
  args: {
    activeTab: 'add',
    onTabChange: () => {},
    energy: 75,
    timeOfDay: 'morning',
  },
};

export const ScoutActive: Story = {
  args: {
    activeTab: 'scout',
    onTabChange: () => {},
    energy: 75,
    timeOfDay: 'morning',
  },
};

export const HuntActive: Story = {
  args: {
    activeTab: 'hunt',
    onTabChange: () => {},
    energy: 80,
    timeOfDay: 'morning',
  },
};

export const RechargeActive: Story = {
  args: {
    activeTab: 'recharge',
    onTabChange: () => {},
    energy: 30,
    timeOfDay: 'afternoon',
  },
};

export const MapActive: Story = {
  args: {
    activeTab: 'map',
    onTabChange: () => {},
    energy: 50,
    timeOfDay: 'evening',
  },
};

export const MorningHighEnergy: Story = {
  args: {
    activeTab: 'hunt',
    onTabChange: () => {},
    energy: 85,
    timeOfDay: 'morning',
    showLabels: false,
  },
};

export const AfternoonLowEnergy: Story = {
  args: {
    activeTab: 'recharge',
    onTabChange: () => {},
    energy: 25,
    timeOfDay: 'afternoon',
    showLabels: false,
  },
};

export const EveningMediumEnergy: Story = {
  args: {
    activeTab: 'map',
    onTabChange: () => {},
    energy: 60,
    timeOfDay: 'evening',
    showLabels: false,
  },
};

export const WithLabels: Story = {
  args: {
    activeTab: 'scout',
    onTabChange: () => {},
    energy: 70,
    timeOfDay: 'morning',
    showLabels: true,
  },
};

export const Interactive: Story = {
  render: (args) => <InteractiveTabs {...args} />,
  args: {
    energy: 70,
    timeOfDay: 'morning',
    showLabels: false,
  },
};
