/**
 * MapperView Stories - Mapper Tab Restructure
 * Based on: FE-03 Mapper Restructure spec
 *
 * Shows redesigned Mapper with MAP (reflection) and PLAN (forward) tabs
 * Reference: agent_resources/planning/next_5_tasks.md (Task #2)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/src/theme/ThemeContext';
import BionicText from '../shared/BionicText';
import { TrendingUp, Calendar, Target, Zap } from 'lucide-react-native';

type MapperTab = 'map' | 'plan';

interface MapperViewProps {
  defaultTab?: MapperTab;
  showWeeklyProgress?: boolean;
  showUpcomingTasks?: boolean;
}

function MapperView({
  defaultTab = 'map',
  showWeeklyProgress = true,
  showUpcomingTasks = true,
}: MapperViewProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<MapperTab>(defaultTab);

  return (
    <View style={[styles.container, { backgroundColor: colors.base03 }]}>
      {/* Tab Selector */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.base02 },
            activeTab === 'map' && {
              backgroundColor: colors.violet,
              borderBottomWidth: 3,
              borderBottomColor: colors.violet,
            },
          ]}
          onPress={() => setActiveTab('map')}
        >
          <BionicText
            style={[
              styles.tabText,
              {
                color: activeTab === 'map' ? colors.base03 : colors.base01,
              },
            ]}
          >
            🗺️ MAP
          </BionicText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: colors.base02 },
            activeTab === 'plan' && {
              backgroundColor: colors.cyan,
              borderBottomWidth: 3,
              borderBottomColor: colors.cyan,
            },
          ]}
          onPress={() => setActiveTab('plan')}
        >
          <BionicText
            style={[
              styles.tabText,
              {
                color: activeTab === 'plan' ? colors.base03 : colors.base01,
              },
            ]}
          >
            📅 PLAN
          </BionicText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'map' ? (
          <MapView colors={colors} showWeeklyProgress={showWeeklyProgress} />
        ) : (
          <PlanView colors={colors} showUpcomingTasks={showUpcomingTasks} />
        )}
      </ScrollView>
    </View>
  );
}

// MAP View - Retrospective/Reflection
function MapView({ colors, showWeeklyProgress }) {
  return (
    <View style={styles.viewContainer}>
      <BionicText style={[styles.viewTitle, { color: colors.violet }]}>
        Your Journey
      </BionicText>

      {showWeeklyProgress && (
        <View style={[styles.card, { backgroundColor: colors.base02 }]}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color={colors.green} />
            <BionicText style={[styles.cardTitle, { color: colors.base0 }]}>
              Weekly Progress
            </BionicText>
          </View>

          {/* Heatmap visualization */}
          <View style={styles.heatmap}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <View key={day} style={styles.heatmapDay}>
                <BionicText style={[styles.dayLabel, { color: colors.base01 }]}>
                  {day}
                </BionicText>
                <View
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: colors.green + '80' },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Completed Tasks Summary */}
      <View style={[styles.card, { backgroundColor: colors.base02 }]}>
        <View style={styles.cardHeader}>
          <Target size={20} color={colors.blue} />
          <BionicText style={[styles.cardTitle, { color: colors.base0 }]}>
            This Week's Wins
          </BionicText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <BionicText style={[styles.statValue, { color: colors.green }]}>
              24
            </BionicText>
            <BionicText style={[styles.statLabel, { color: colors.base01 }]}>
              Tasks Done
            </BionicText>
          </View>
          <View style={styles.stat}>
            <BionicText style={[styles.statValue, { color: colors.cyan }]}>
              8.5h
            </BionicText>
            <BionicText style={[styles.statLabel, { color: colors.base01 }]}>
              Focus Time
            </BionicText>
          </View>
          <View style={styles.stat}>
            <BionicText style={[styles.statValue, { color: colors.orange }]}>
              7
            </BionicText>
            <BionicText style={[styles.statLabel, { color: colors.base01 }]}>
              Day Streak
            </BionicText>
          </View>
        </View>
      </View>

      {/* Energy Patterns */}
      <View style={[styles.card, { backgroundColor: colors.base02 }]}>
        <View style={styles.cardHeader}>
          <Zap size={20} color={colors.yellow} />
          <BionicText style={[styles.cardTitle, { color: colors.base0 }]}>
            Energy Patterns
          </BionicText>
        </View>

        <BionicText style={[styles.insight, { color: colors.base01 }]}>
          Your best focus time is 9-11am with 85% completion rate.
        </BionicText>
      </View>
    </View>
  );
}

// PLAN View - Forward-looking tasks
function PlanView({ colors, showUpcomingTasks }) {
  return (
    <View style={styles.viewContainer}>
      <BionicText style={[styles.viewTitle, { color: colors.cyan }]}>
        What's Ahead
      </BionicText>

      {showUpcomingTasks && (
        <View style={[styles.card, { backgroundColor: colors.base02 }]}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color={colors.blue} />
            <BionicText style={[styles.cardTitle, { color: colors.base0 }]}>
              Next 3 Days
            </BionicText>
          </View>

          {/* Upcoming tasks */}
          <View style={styles.taskList}>
            {[
              { day: 'Today', tasks: 5, urgent: 2 },
              { day: 'Tomorrow', tasks: 3, urgent: 0 },
              { day: 'Friday', tasks: 7, urgent: 1 },
            ].map((day) => (
              <View key={day.day} style={styles.dayRow}>
                <BionicText style={[styles.dayName, { color: colors.base0 }]}>
                  {day.day}
                </BionicText>
                <View style={styles.dayStats}>
                  <BionicText style={[styles.taskCount, { color: colors.cyan }]}>
                    {day.tasks} tasks
                  </BionicText>
                  {day.urgent > 0 && (
                    <BionicText style={[styles.urgentCount, { color: colors.red }]}>
                      {day.urgent} urgent
                    </BionicText>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Goal Progress */}
      <View style={[styles.card, { backgroundColor: colors.base02 }]}>
        <View style={styles.cardHeader}>
          <Target size={20} color={colors.violet} />
          <BionicText style={[styles.cardTitle, { color: colors.base0 }]}>
            Weekly Goals
          </BionicText>
        </View>

        {/* Progress bars */}
        {[
          { goal: 'Complete 30 tasks', current: 24, total: 30 },
          { goal: '10 hours focus time', current: 8.5, total: 10 },
          { goal: 'Maintain streak', current: 7, total: 7 },
        ].map((goal) => (
          <View key={goal.goal} style={styles.goalRow}>
            <BionicText style={[styles.goalText, { color: colors.base01 }]}>
              {goal.goal}
            </BionicText>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.green,
                    width: `${(goal.current / goal.total) * 100}%`,
                  },
                ]}
              />
            </View>
            <BionicText style={[styles.progressText, { color: colors.base0 }]}>
              {goal.current}/{goal.total}
            </BionicText>
          </View>
        ))}
      </View>
    </View>
  );
}

const meta = {
  title: 'Mapper/MapperView',
  component: MapperView,
} satisfies Meta<typeof MapperView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - MAP Tab Active
 * Shows retrospective view by default
 */
export const Default: Story = {
  args: {
    defaultTab: 'map',
    showWeeklyProgress: true,
  },
};

/**
 * Plan Tab - Forward Looking
 * Shows upcoming tasks and goals
 */
export const PlanTab: Story = {
  args: {
    defaultTab: 'plan',
    showUpcomingTasks: true,
  },
};

/**
 * Interactive - Full Experience
 * User can switch between MAP and PLAN tabs
 */
export const Interactive: Story = {
  render: () => {
    return <MapperView defaultTab="map" />;
  },
};

/**
 * MAP Only - Reflection Focus
 * Only shows retrospective data
 */
export const MAPOnly: Story = {
  args: {
    defaultTab: 'map',
    showWeeklyProgress: true,
  },
};

/**
 * PLAN Only - Planning Focus
 * Only shows forward-looking data
 */
export const PLANOnly: Story = {
  args: {
    defaultTab: 'plan',
    showUpcomingTasks: true,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  viewContainer: {
    padding: 16,
    gap: 16,
  },
  viewTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  heatmap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  heatmapDay: {
    alignItems: 'center',
    gap: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  heatmapCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  insight: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  taskList: {
    gap: 12,
    marginTop: 8,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayStats: {
    flexDirection: 'row',
    gap: 12,
  },
  taskCount: {
    fontSize: 14,
  },
  urgentCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalRow: {
    gap: 4,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
});
