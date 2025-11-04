/**
 * SubTabs Stories - Top Navigation Bar
 * Used within Capture mode and other main tabs for secondary navigation
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, Text } from 'react-native';
import { useState } from 'react';
import { Link2, Plus, MessageCircleQuestion } from 'lucide-react-native';
import SubTabs, { SubTab } from './SubTabs';
import { Tabs, TabItem } from './Tabs';
import { THEME } from '../../src/theme/colors';

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
            <Text style={{ color: '#839496', fontSize: 14 }}>
              {activeTab === 'connect' ? 'Connect Screen' : activeTab === 'add' ? 'Add Task Screen' : 'Clarify Screen'}
            </Text>
          </View>
        </View>
      </View>
    );
  },
};

/**
 * SubTabs with Badges
 * Shows notification badges on subtabs for pending items
 */
export const WithBadges: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<SubTab>('clarify');

    const subTabsWithBadges: TabItem<SubTab>[] = [
      {
        id: 'connect',
        icon: Link2,
        color: THEME.cyan,
        description: 'Connect accounts',
        badge: 2, // 2 accounts ready to connect
      },
      {
        id: 'add',
        icon: Plus,
        color: THEME.cyan,
        description: 'Add new task',
      },
      {
        id: 'clarify',
        icon: MessageCircleQuestion,
        color: THEME.yellow,
        description: 'Clarify task details',
        badge: 7, // 7 tasks need clarification
      },
    ];

    return (
      <Tabs
        tabs={subTabsWithBadges}
        activeTab={activeTab}
        onChange={setActiveTab}
        showLabels={false}
        iconSize={20}
        chevronHeight={40}
        minHeight={40}
        containerStyle={{
          backgroundColor: THEME.base02,
          height: 40,
          paddingTop: 0,
          paddingBottom: 0,
        }}
        tabStyle={{
          height: 40,
        }}
      />
    );
  },
};

/**
 * SubTabs with Large Badges
 * Shows high notification counts on subtabs
 */
export const WithLargeBadges: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<SubTab>('add');

    const subTabsWithLargeBadges: TabItem<SubTab>[] = [
      {
        id: 'connect',
        icon: Link2,
        color: THEME.cyan,
        description: 'Connect accounts',
        badge: 5,
      },
      {
        id: 'add',
        icon: Plus,
        color: THEME.cyan,
        description: 'Add new task',
      },
      {
        id: 'clarify',
        icon: MessageCircleQuestion,
        color: THEME.yellow,
        description: 'Clarify task details',
        badge: 120, // Should show as "99+"
      },
    ];

    return (
      <Tabs
        tabs={subTabsWithLargeBadges}
        activeTab={activeTab}
        onChange={setActiveTab}
        showLabels={false}
        iconSize={20}
        chevronHeight={40}
        minHeight={40}
        containerStyle={{
          backgroundColor: THEME.base02,
          height: 40,
          paddingTop: 0,
          paddingBottom: 0,
        }}
        tabStyle={{
          height: 40,
        }}
      />
    );
  },
};
