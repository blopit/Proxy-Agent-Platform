/**
 * EnergyGauge Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import EnergyGauge from './EnergyGauge';

const meta = {
  title: 'Core/EnergyGauge',
  component: EnergyGauge,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#002b36', alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof EnergyGauge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Expanded variant stories
export const HighEnergy: Story = {
  args: {
    energy: 85,
    trend: 'rising',
    variant: 'expanded',
  },
};

export const MediumEnergy: Story = {
  args: {
    energy: 55,
    trend: 'stable',
    variant: 'expanded',
  },
};

export const LowEnergy: Story = {
  args: {
    energy: 25,
    trend: 'falling',
    variant: 'expanded',
  },
};

export const WithPrediction: Story = {
  args: {
    energy: 65,
    trend: 'rising',
    predictedNextHour: 75,
    variant: 'expanded',
  },
};

// Micro variant stories
export const MicroHighEnergy: Story = {
  args: {
    energy: 90,
    trend: 'rising',
    variant: 'micro',
  },
};

export const MicroMediumEnergy: Story = {
  args: {
    energy: 50,
    trend: 'stable',
    variant: 'micro',
  },
};

export const MicroLowEnergy: Story = {
  args: {
    energy: 20,
    trend: 'falling',
    variant: 'micro',
  },
};

export const MicroWithPrediction: Story = {
  args: {
    energy: 60,
    trend: 'rising',
    predictedNextHour: 70,
    variant: 'micro',
  },
};

// Edge cases
export const Empty: Story = {
  args: {
    energy: 0,
    trend: 'falling',
    variant: 'expanded',
  },
};

export const Full: Story = {
  args: {
    energy: 100,
    trend: 'stable',
    variant: 'expanded',
  },
};
