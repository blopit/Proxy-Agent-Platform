/**
 * TodaySubTabs - Top Navigation for Today Tab
 * Three subtabs: Today (day), Week, Map
 */

import React from 'react';
import { Calendar, CalendarDays, Map } from 'lucide-react-native';
import { Tabs, TabItem } from './Tabs';
import { THEME } from '../../src/theme/colors';

export type TodaySubTab = 'day' | 'week' | 'map';

interface TodaySubTabsProps {
  activeTab: TodaySubTab;
  onChange: (tab: TodaySubTab) => void;
}

const TODAY_SUBTAB_CONFIG: TabItem<TodaySubTab>[] = [
  {
    id: 'day',
    icon: Calendar,
    label: 'Today',
    color: THEME.magenta,
    description: "Today's tasks",
  },
  {
    id: 'week',
    icon: CalendarDays,
    label: 'Week',
    color: THEME.cyan,
    description: 'Weekly view',
  },
  {
    id: 'map',
    icon: Map,
    label: 'Map',
    color: THEME.violet,
    description: 'Big picture view',
  },
];

export default function TodaySubTabs({ activeTab, onChange }: TodaySubTabsProps) {
  return (
    <Tabs
      tabs={TODAY_SUBTAB_CONFIG}
      activeTab={activeTab}
      onChange={onChange}
      showLabels={true}
      iconSize={20}
      chevronHeight={44}
      minHeight={44}
      containerStyle={{
        backgroundColor: THEME.base02,
        height: 44,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      tabStyle={{
        height: 44,
      }}
    />
  );
}
