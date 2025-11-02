/**
 * Badge Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default',
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary',
    variant: 'primary',
  },
};

export const Success: Story = {
  args: {
    label: 'Completed',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    label: 'Warning',
    variant: 'warning',
  },
};

export const Danger: Story = {
  args: {
    label: 'Critical',
    variant: 'danger',
  },
};

export const Info: Story = {
  args: {
    label: 'Info',
    variant: 'info',
  },
};

export const Small: Story = {
  args: {
    label: 'Small',
    size: 'sm',
    variant: 'primary',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium',
    size: 'md',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    label: 'Large',
    size: 'lg',
    variant: 'primary',
  },
};

export const PriorityHigh: Story = {
  args: {
    label: 'high',
    variant: 'danger',
  },
};

export const PriorityMedium: Story = {
  args: {
    label: 'medium',
    variant: 'warning',
  },
};

export const PriorityLow: Story = {
  args: {
    label: 'low',
    variant: 'default',
  },
};
