import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';
import { Target, Search, Zap, Map, Heart, Calendar, Bell, Settings } from 'lucide-react-native';
import { Tabs } from './Tabs';
import { THEME } from '../../src/theme/colors';

const meta = {
  title: 'Core/Tabs',
  component: Tabs,
  decorators: [
    (Story) => (
      <View style={{ padding: 0, backgroundColor: '#002b36' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// === Basic Tabs ===

export const TwoTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

export const ThreeTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

export const FourTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter' | 'mapper'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter' },
          { id: 'mapper', icon: Map, color: THEME.violet, label: 'Mapper' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

export const FiveTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter' | 'mapper' | 'mender'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter' },
          { id: 'mapper', icon: Map, color: THEME.violet, label: 'Mapper' },
          { id: 'mender', icon: Heart, color: THEME.magenta, label: 'Mender' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

export const SingleTab: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

// === With Labels ===

export const WithLabels: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        showLabels={true}
      />
    );
  },
};

export const WithoutLabels: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        showLabels={false}
      />
    );
  },
};

// === With Badges ===

export const WithNumericBadges: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture', badge: 3 },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout', badge: 12 },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter', badge: 0 },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

export const WithLargeBadges: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'notifications' | 'messages' | 'settings'>('notifications');

    return (
      <Tabs
        tabs={[
          { id: 'notifications', icon: Bell, color: THEME.yellow, label: 'Notifications', badge: 150 },
          { id: 'messages', icon: Calendar, color: THEME.blue, label: 'Messages', badge: 42 },
          { id: 'settings', icon: Settings, color: THEME.base0, label: 'Settings' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        showLabels={true}
      />
    );
  },
};

// === Different Sizes ===

export const SmallIcons: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        iconSize={18}
        chevronHeight={40}
        minHeight={40}
      />
    );
  },
};

export const LargeIcons: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter'>('capture');

    return (
      <Tabs
        tabs={[
          { id: 'capture', icon: Target, color: THEME.cyan, label: 'Capture' },
          { id: 'scout', icon: Search, color: THEME.blue, label: 'Scout' },
          { id: 'hunter', icon: Zap, color: THEME.orange, label: 'Hunter' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        iconSize={32}
        chevronHeight={64}
        minHeight={64}
        showLabels={true}
      />
    );
  },
};

// === Interactive Demo ===

export const Interactive: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'capture' | 'scout' | 'hunter' | 'mapper' | 'mender'>('capture');

    return (
      <View>
        <Tabs
          tabs={[
            {
              id: 'capture',
              icon: Target,
              color: THEME.cyan,
              label: 'Capture',
              description: 'Quick task capture',
              badge: 3,
            },
            {
              id: 'scout',
              icon: Search,
              color: THEME.blue,
              label: 'Scout',
              description: 'Explore tasks',
              badge: 12,
            },
            {
              id: 'hunter',
              icon: Zap,
              color: THEME.orange,
              label: 'Hunter',
              description: 'Focus mode',
            },
            {
              id: 'mapper',
              icon: Map,
              color: THEME.violet,
              label: 'Mapper',
              description: 'Task landscape',
            },
            {
              id: 'mender',
              icon: Heart,
              color: THEME.magenta,
              label: 'Mender',
              description: 'Energy tracking',
              badge: 1,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          showLabels={true}
        />
      </View>
    );
  },
};

// === Different Tab States ===

export const AllTabStates: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState<'first' | 'second' | 'third'>('first');

    return (
      <View style={{ gap: 16 }}>
        {/* First tab active */}
        <Tabs
          tabs={[
            { id: 'first', icon: Target, color: THEME.cyan, label: 'First' },
            { id: 'second', icon: Search, color: THEME.blue, label: 'Second' },
            { id: 'third', icon: Zap, color: THEME.orange, label: 'Third' },
          ]}
          activeTab="first"
          onChange={() => {}}
          showLabels={true}
        />

        {/* Middle tab active */}
        <Tabs
          tabs={[
            { id: 'first', icon: Target, color: THEME.cyan, label: 'First' },
            { id: 'second', icon: Search, color: THEME.blue, label: 'Second' },
            { id: 'third', icon: Zap, color: THEME.orange, label: 'Third' },
          ]}
          activeTab="second"
          onChange={() => {}}
          showLabels={true}
        />

        {/* Last tab active */}
        <Tabs
          tabs={[
            { id: 'first', icon: Target, color: THEME.cyan, label: 'First' },
            { id: 'second', icon: Search, color: THEME.blue, label: 'Second' },
            { id: 'third', icon: Zap, color: THEME.orange, label: 'Third' },
          ]}
          activeTab="third"
          onChange={() => {}}
          showLabels={true}
        />
      </View>
    );
  },
};
