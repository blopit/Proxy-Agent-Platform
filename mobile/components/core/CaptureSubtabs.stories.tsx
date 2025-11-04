/**
 * CaptureSubtabs Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { useState } from 'react';
import CaptureSubtabs, { CaptureSubtab } from './CaptureSubtabs';

const meta = {
  title: 'Core/CaptureSubtabs',
  component: CaptureSubtabs,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#002b36', justifyContent: 'flex-end' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof CaptureSubtabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
function InteractiveCaptureSubtabs(props: any) {
  const [activeSubtab, setActiveSubtab] = useState<CaptureSubtab>(props.activeSubtab || 'add');
  return <CaptureSubtabs {...props} activeSubtab={activeSubtab} onChange={setActiveSubtab} />;
}

export const AddActive: Story = {
  args: {
    activeSubtab: 'add',
    onChange: () => {},
  },
};

export const ClarifyActive: Story = {
  args: {
    activeSubtab: 'clarify',
    onChange: () => {},
  },
};

export const Interactive: Story = {
  render: (args) => <InteractiveCaptureSubtabs {...args} />,
};
