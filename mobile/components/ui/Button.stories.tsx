/**
 * Button Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Ghost: Story = {
  args: {
    title: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    title: 'Delete',
    variant: 'danger',
  },
};

export const Small: Story = {
  args: {
    title: 'Small',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    title: 'Medium',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    title: 'Large',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading...',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled',
    disabled: true,
  },
};
