/**
 * SimpleTabs Stories - React Native Storybook
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Plus, Search, Target, Calendar, Map } from 'lucide-react-native';
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

/**
 * 5-Tab Layout Demo
 * Shows SimpleTabs-style component with 5 actual app tabs:
 * Capture, Scout, Hunt, Today (with day number), Map
 * Icons only, no labels
 */
export const FiveTabLayout: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<string>('capture');
    const currentDay = new Date().getDate();

    const tabs = [
      { id: 'capture', icon: Plus, color: '#2aa198' },
      { id: 'scout', icon: Search, color: '#268bd2' },
      { id: 'hunt', icon: Target, color: '#cb4b16' },
      { id: 'today', icon: Calendar, color: '#d33682', showDay: true },
      { id: 'map', icon: Map, color: '#6c71c4' },
    ];

    return (
      <View style={fiveTabStyles.container}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[fiveTabStyles.tab, isActive && fiveTabStyles.tabActive]}
              activeOpacity={0.7}
            >
              <View style={fiveTabStyles.iconContainer}>
                {isActive && <View style={[StyleSheet.absoluteFill, { backgroundColor: `${tab.color}20`, borderRadius: 12 }]} />}
                <Icon size={24} color={isActive ? tab.color : '#586e75'} />
                {tab.showDay && (
                  <Text style={[fiveTabStyles.dayNumber, { color: isActive ? tab.color : '#586e75' }]}>
                    {currentDay}
                  </Text>
                )}
              </View>
              {isActive && <View style={[fiveTabStyles.activeIndicator, { backgroundColor: tab.color }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  },
};

const fiveTabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#002b36',
    borderTopWidth: 1,
    borderTopColor: '#586e75',
    paddingTop: 6,
    paddingBottom: 8,
    height: 44,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    position: 'relative',
  },
  tabActive: {
    opacity: 1,
    transform: [{ translateY: -2 }],
  },
  iconContainer: {
    padding: 4,
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    top: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    color: '#586e75',
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 32,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
