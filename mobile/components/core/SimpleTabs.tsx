/**
 * SimpleTabs - React Native Version
 * MVP 3-Tab Navigation extending base Tabs
 *
 * - 📥 Inbox (Capture + Scout combined)
 * - 🎯 Today (Hunter mode)
 * - 📊 Progress (Mender + Mapper combined)
 */

import React from 'react';
import { Inbox, Target, TrendingUp } from 'lucide-react-native';
import { Tabs, TabItem } from './Tabs';
import { THEME } from '../../src/theme/colors';

export type SimpleTab = 'inbox' | 'today' | 'progress';

interface SimpleTabsProps {
  activeTab: SimpleTab;
  onChange: (tab: SimpleTab) => void;
  showBadges?: {
    inbox?: number;
    today?: number;
    progress?: boolean;
  };
}

const SIMPLE_TAB_CONFIG: TabItem<SimpleTab>[] = [
  {
    id: 'inbox',
    icon: Inbox,
    label: 'Inbox',
    color: THEME.cyan,
    description: 'Capture & organize tasks',
  },
  {
    id: 'today',
    icon: Target,
    label: 'Today',
    color: THEME.orange,
    description: 'Focus on current task',
  },
  {
    id: 'progress',
    icon: TrendingUp,
    label: 'Progress',
    color: THEME.violet,
    description: 'View XP, streaks & goals',
  },
];

export default function SimpleTabs({ activeTab, onChange, showBadges }: SimpleTabsProps) {
  // Add badges to tab config
  const tabsWithBadges = SIMPLE_TAB_CONFIG.map((tab) => ({
    ...tab,
    badge: showBadges?.[tab.id],
  }));

  return (
    <Tabs
      tabs={tabsWithBadges}
      activeTab={activeTab}
      onChange={onChange}
      showLabels={true}
      showActiveIndicator={false}
    />
  );
}
