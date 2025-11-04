/**
 * SubTabs Stories - Top Navigation Bar
 * Used within Capture mode and other main tabs for secondary navigation
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { useState } from 'react';
import SubTabs, { SubTab } from './SubTabs';

const meta = {
  title: 'Core/SubTabs',
  component: SubTabs,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#002b36' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SubTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component
function InteractiveSubTabs(props: any) {
  const [activeTab, setActiveTab] = useState<SubTab>(props.activeTab || 'add');
  return <SubTabs {...props} activeTab={activeTab} onChange={setActiveTab} />;
}

/**
 * Connect Tab Active
 * Shows the Connect tab (Link2 icon) as active with chevron background
 */
export const ConnectActive: Story = {
  args: {
    activeTab: 'connect',
    onChange: () => {},
  },
};

/**
 * Add Tab Active (Default)
 * Shows the Add tab (Plus icon) as active with chevron background
 * This is the default view when entering Capture mode
 */
export const AddActive: Story = {
  args: {
    activeTab: 'add',
    onChange: () => {},
  },
};

/**
 * Interactive Demo
 * Fully interactive subtabs - tap to switch between Connect and Add
 */
export const Interactive: Story = {
  render: (args) => <InteractiveSubTabs {...args} />,
};

/**
 * Capture Mode Layout
 * Shows how SubTabs appear at the top of Capture mode screen
 * Demonstrates the positioning and styling in context
 */
export const InCaptureContext: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<SubTab>('add');

    return (
      <View style={{ flex: 1, backgroundColor: '#002b36' }}>
        {/* SubTabs at top */}
        <SubTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Content area below */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            padding: 16,
            backgroundColor: '#073642',
            borderRadius: 8,
          }}>
            <View style={{ color: '#839496', fontSize: 14 }}>
              {activeTab === 'connect' ? 'Connect Screen' : 'Add Task Screen'}
            </View>
          </View>
        </View>
      </View>
    );
  },
};
