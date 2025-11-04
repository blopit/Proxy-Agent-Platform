/**
 * SimpleTabs Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Plus, Search, Target, Calendar, Map, MessageCircleQuestion } from 'lucide-react-native';
import SimpleTabs, { SimpleTab } from './SimpleTabs';
import { Tabs, TabItem } from './Tabs';
import { THEME } from '../../src/theme/colors';

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

/**
 * 5-Tab Layout with Chevrons - Actual App Configuration
 * Matches app/(tabs)/_layout.tsx exactly:
 * - Capture, Scout, Hunter, Today, Mapper
 * - Icons only (no labels)
 * - Chevron backgrounds on active tabs
 * - Calendar day number overlay
 */

type FiveTabId = 'capture' | 'scout' | 'hunter' | 'today' | 'mapper';

function FiveTabDemo({ initialTab = 'today' }: { initialTab?: FiveTabId }) {
  const [activeTab, setActiveTab] = useState<FiveTabId>(initialTab);
  const currentDay = new Date().getDate();

  const fiveTabConfig: TabItem<FiveTabId>[] = [
    {
      id: 'capture',
      icon: Plus,
      color: THEME.cyan,
      description: 'Capture new tasks',
    },
    {
      id: 'scout',
      icon: Search,
      color: THEME.blue,
      description: 'Scout for patterns',
    },
    {
      id: 'hunter',
      icon: Target,
      color: THEME.orange,
      description: 'Hunt mode',
    },
    {
      id: 'today',
      icon: Calendar,
      color: THEME.magenta,
      description: 'Today view',
      renderContent: ({ color, isFocused }) => (
        <View style={{ width: 24, height: 24, position: 'relative' }}>
          <Calendar size={24} color={color} />
          <Text
            style={{
              position: 'absolute',
              fontSize: 9,
              fontWeight: '700',
              top: 12,
              left: 0,
              right: 0,
              textAlign: 'center',
              color,
            }}
          >
            {currentDay}
          </Text>
        </View>
      ),
    },
    {
      id: 'mapper',
      icon: Map,
      color: THEME.violet,
      description: 'Map progress',
    },
  ];

  return (
    <Tabs
      tabs={fiveTabConfig}
      activeTab={activeTab}
      onChange={setActiveTab}
      showLabels={false}
      chevronHeight={52}
      containerStyle={{
        paddingVertical: 4,
      }}
      tabStyle={{
        height: 52,
      }}
    />
  );
}

export const FiveTabCaptureActive: Story = {
  render: () => <FiveTabDemo initialTab="capture" />,
};

export const FiveTabScoutActive: Story = {
  render: () => <FiveTabDemo initialTab="scout" />,
};

export const FiveTabHunterActive: Story = {
  render: () => <FiveTabDemo initialTab="hunter" />,
};

export const FiveTabTodayActive: Story = {
  render: () => <FiveTabDemo initialTab="today" />,
};

export const FiveTabMapperActive: Story = {
  render: () => <FiveTabDemo initialTab="mapper" />,
};

export const FiveTabInteractive: Story = {
  render: () => <FiveTabDemo />,
};

/**
 * Capture Subtabs Story
 * Shows subtabs within the Capture mode:
 * - Add (Plus icon)
 * - Clarify (Question bubble icon)
 */
type CaptureSubtabId = 'add' | 'clarify';

function CaptureSubtabsDemo({ initialTab = 'add' }: { initialTab?: CaptureSubtabId }) {
  const [activeSubtab, setActiveSubtab] = useState<CaptureSubtabId>(initialTab);

  const captureSubtabs: TabItem<CaptureSubtabId>[] = [
    {
      id: 'add',
      icon: Plus,
      color: THEME.cyan,
      description: 'Add new task',
      label: 'Add',
    },
    {
      id: 'clarify',
      icon: MessageCircleQuestion,
      color: THEME.yellow,
      description: 'Clarify task details',
      label: 'Clarify',
    },
  ];

  return (
    <Tabs
      tabs={captureSubtabs}
      activeTab={activeSubtab}
      onChange={setActiveSubtab}
      showLabels={true}
      showActiveIndicator={false}
      containerStyle={{
        borderTopWidth: 0, // Remove bottom border
      }}
    />
  );
}

export const CaptureSubtabsAdd: Story = {
  render: () => <CaptureSubtabsDemo initialTab="add" />,
};

export const CaptureSubtabsClarify: Story = {
  render: () => <CaptureSubtabsDemo initialTab="clarify" />,
};

export const CaptureSubtabsInteractive: Story = {
  render: () => <CaptureSubtabsDemo />,
};
