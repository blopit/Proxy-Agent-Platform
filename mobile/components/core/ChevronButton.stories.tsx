/**
 * ChevronButton Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import ChevronButton from './ChevronButton';

const meta = {
  title: 'Core/ChevronButton',
  component: ChevronButton,
  argTypes: {
    onPress: { action: 'pressed' },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#002b36' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ChevronButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Single buttons
export const Primary: Story = {
  args: {
    variant: 'primary',
    position: 'single',
    children: 'Primary',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    position: 'single',
    children: 'Success',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    position: 'single',
    children: 'Error',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    position: 'single',
    children: 'Warning',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    position: 'single',
    children: 'Neutral',
  },
};

// Positional variants
export const FirstPosition: Story = {
  args: {
    variant: 'primary',
    position: 'first',
    children: 'First',
  },
};

export const MiddlePosition: Story = {
  args: {
    variant: 'primary',
    position: 'middle',
    children: 'Middle',
  },
};

export const LastPosition: Story = {
  args: {
    variant: 'primary',
    position: 'last',
    children: 'Last',
  },
};

// Interlocking sequence (manually shown as separate stories)
export const InterlockingSequence: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', marginLeft: -4 }}>
      <ChevronButton variant="primary" position="first">
        Step 1
      </ChevronButton>
      <View style={{ marginLeft: -8 }}>
        <ChevronButton variant="success" position="middle">
          Step 2
        </ChevronButton>
      </View>
      <View style={{ marginLeft: -8 }}>
        <ChevronButton variant="warning" position="middle">
          Step 3
        </ChevronButton>
      </View>
      <View style={{ marginLeft: -8 }}>
        <ChevronButton variant="neutral" position="last">
          Done
        </ChevronButton>
      </View>
    </View>
  ),
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    position: 'single',
    children: 'Disabled',
    disabled: true,
  },
};
