import type { Meta, StoryObj } from '@storybook/react';
import ZoneBalanceWidget from './ZoneBalanceWidget';
import { semanticColors, colors } from '@/lib/design-system';

// ============================================================================
// Meta Configuration
// ============================================================================

const meta: Meta<typeof ZoneBalanceWidget> = {
  title: 'Mobile/Scout/ZoneBalanceWidget',
  component: ZoneBalanceWidget,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'solarized-dark',
      values: [
        {
          name: 'solarized-dark',
          value: semanticColors.bg.primary,
        },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onZoneSelect: { action: 'zone-select' },
    onFilterByZone: { action: 'filter-by-zone' },
  },
};

export default meta;
type Story = StoryObj<typeof ZoneBalanceWidget>;

// ============================================================================
// Stories
// ============================================================================

export const BalancedZones: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 3,
        tasks_completed_this_week: 8,
        tasks_completed_all_time: 42,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 2,
        tasks_completed_this_week: 7,
        tasks_completed_all_time: 35,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 2,
        tasks_completed_this_week: 6,
        tasks_completed_all_time: 28,
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story:
          '✨ Excellent Balance (85%) - All zones have similar weekly progress (6-8 tasks). Shows balance score and status.',
      },
    },
  },
};

export const ImbalancedZones: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 5,
        tasks_completed_this_week: 15,
        tasks_completed_all_time: 120,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 0,
        tasks_completed_this_week: 1,
        tasks_completed_all_time: 8,
        days_since_last_task: 6,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 0,
        tasks_completed_this_week: 2,
        tasks_completed_all_time: 12,
        days_since_last_task: 4,
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story:
          '⚠️ Imbalanced (27%) - Heavy focus on Work (15 tasks), Health & Relationships neglected. Shows warning badges.',
      },
    },
  },
};

export const WithInsights: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 4,
        tasks_completed_this_week: 12,
        tasks_completed_all_time: 95,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 0,
        tasks_completed_this_week: 1,
        tasks_completed_all_time: 15,
        days_since_last_task: 8,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 1,
        tasks_completed_this_week: 3,
        tasks_completed_all_time: 22,
      },
    ],
    insights: [
      {
        type: 'warning',
        message: "Health zone neglected for 8 days. Physical wellbeing affects all areas of life - don't skip it!",
        zoneId: 'z2',
        actionLabel: 'View Health Tasks',
      },
      {
        type: 'info',
        message: 'Work zone is thriving! You completed 12 tasks this week.',
        zoneId: 'z1',
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story: '💡 With Insights - Shows actionable warnings and success messages. Health zone neglected for 8 days.',
      },
    },
  },
};

export const NeglectedHealth: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 6,
        tasks_completed_this_week: 20,
        tasks_completed_all_time: 150,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 0,
        tasks_completed_this_week: 0,
        tasks_completed_all_time: 5,
        days_since_last_task: 14,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 1,
        tasks_completed_this_week: 4,
        tasks_completed_all_time: 18,
      },
    ],
    insights: [
      {
        type: 'warning',
        message:
          "🚨 Health zone abandoned for 2 weeks! Your body is your foundation. Schedule a workout or health check today.",
        zoneId: 'z2',
        actionLabel: 'Find Health Tasks',
      },
      {
        type: 'warning',
        message: 'Work-life imbalance detected. 20 work tasks vs 0 health tasks this week.',
        zoneId: 'z1',
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story:
          '🚨 Critical Imbalance (0%) - Health zone completely neglected (14 days, 0 tasks this week). Multiple warnings.',
      },
    },
  },
};

export const ExcellentBalance: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 3,
        tasks_completed_this_week: 10,
        tasks_completed_all_time: 85,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 3,
        tasks_completed_this_week: 10,
        tasks_completed_all_time: 82,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 3,
        tasks_completed_this_week: 10,
        tasks_completed_all_time: 78,
      },
    ],
    insights: [
      {
        type: 'success',
        message: '🎉 Perfect balance! All zones have equal attention this week (10 tasks each).',
        zoneId: 'z1',
      },
      {
        type: 'success',
        message: "You're maintaining excellent life balance across Work, Health, and Relationships!",
        zoneId: 'z2',
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story: '✨ Perfect Balance (100%) - All zones exactly equal (10 tasks each). Success insights displayed.',
      },
    },
  },
};

export const SingleZoneFocus: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 8,
        tasks_completed_this_week: 25,
        tasks_completed_all_time: 200,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 0,
        tasks_completed_this_week: 0,
        tasks_completed_all_time: 3,
        days_since_last_task: 21,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 0,
        tasks_completed_this_week: 0,
        tasks_completed_all_time: 5,
        days_since_last_task: 18,
      },
    ],
    insights: [
      {
        type: 'warning',
        message:
          '🔥 Burnout risk! You completed 25 work tasks but 0 health or relationship tasks. Balance is critical.',
        zoneId: 'z1',
      },
      {
        type: 'warning',
        message: 'Health zone inactive for 3 weeks. Schedule rest, exercise, or a health check.',
        zoneId: 'z2',
        actionLabel: 'Add Health Task',
      },
      {
        type: 'warning',
        message: 'Relationships zone inactive for 2.5 weeks. Reach out to loved ones.',
        zoneId: 'z3',
        actionLabel: 'Add Relationship Task',
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story:
          '🔥 Burnout Risk (0%) - Only Work zone active (25 tasks), Health & Relationships abandoned. Multiple critical warnings.',
      },
    },
  },
};

export const TwoZones: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 4,
        tasks_completed_this_week: 12,
        tasks_completed_all_time: 95,
      },
      {
        zone_id: 'z2',
        name: 'Personal Growth',
        icon: '📚',
        color: colors.violet,
        simple_goal: 'Learn and improve',
        tasks_completed_today: 2,
        tasks_completed_this_week: 8,
        tasks_completed_all_time: 45,
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story: '📊 Two Zones - Shows 2-column grid when user has only 2 zones configured.',
      },
    },
  },
};

export const NoProgressYet: Story = {
  args: {
    zones: [
      {
        zone_id: 'z1',
        name: 'Work',
        icon: '💼',
        color: colors.blue,
        simple_goal: 'Build great products',
        tasks_completed_today: 0,
        tasks_completed_this_week: 0,
        tasks_completed_all_time: 0,
      },
      {
        zone_id: 'z2',
        name: 'Health',
        icon: '🏃',
        color: colors.green,
        simple_goal: 'Stay physically strong',
        tasks_completed_today: 0,
        tasks_completed_this_week: 0,
        tasks_completed_all_time: 0,
      },
      {
        zone_id: 'z3',
        name: 'Relationships',
        icon: '❤️',
        color: colors.magenta,
        simple_goal: 'Nurture connections',
        tasks_completed_today: 0,
        tasks_completed_this_week: 0,
        tasks_completed_all_time: 0,
      },
    ],
    insights: [
      {
        type: 'info',
        message: "🚀 You're just getting started! Complete your first task in any zone to begin tracking balance.",
        zoneId: 'z1',
      },
    ],
    onZoneSelect: (zoneId) => console.log('Selected zone:', zoneId),
    onFilterByZone: (zoneName) => console.log('Filter by zone:', zoneName),
  },
  parameters: {
    docs: {
      description: {
        story: '🆕 Fresh Start - New user with no completed tasks yet. Shows 100% balance (all zeros).',
      },
    },
  },
};
