/**
 * SubTabs - Top Navigation Bar
 * Used for secondary navigation within a main tab (e.g., Capture mode subtabs)
 *
 * Differences from SimpleTabs (bottom navigation):
 * - Positioned at top instead of bottom
 * - Smaller height (44px vs 58px)
 * - Border on bottom instead of top
 * - Background: base02 (darker than base03)
 */

import React from 'react';
import { Link2, Plus, MessageCircleQuestion } from 'lucide-react-native';
import { Tabs, TabItem } from './Tabs';
import { THEME } from '../../src/theme/colors';

export type SubTab = 'connect' | 'add' | 'clarify';

interface SubTabsProps {
  activeTab: SubTab;
  onChange: (tab: SubTab) => void;
}

const SUB_TAB_CONFIG: TabItem<SubTab>[] = [
  {
    id: 'connect',
    icon: Link2,
    label: 'Connect',
    color: THEME.cyan,
    description: 'Connect accounts',
  },
  {
    id: 'add',
    icon: Plus,
    label: 'Add',
    color: THEME.cyan,
    description: 'Add new task',
  },
  {
    id: 'clarify',
    icon: MessageCircleQuestion,
    label: 'Clarify',
    color: THEME.yellow,
    description: 'Clarify task details',
  },
];

export default function SubTabs({ activeTab, onChange }: SubTabsProps) {
  return (
    <Tabs
      tabs={SUB_TAB_CONFIG}
      activeTab={activeTab}
      onChange={onChange}
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
}
