/**
 * Week View - 7-day calendar grid + next week preview + weekly goals + timeline
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { THEME } from '@/src/theme/colors';

const CURRENT_WEEK_DAYS = [
  { day: 'Mon', date: 4, tasks: 3 },
  { day: 'Tue', date: 5, tasks: 5 },
  { day: 'Wed', date: 6, tasks: 2 },
  { day: 'Thu', date: 7, tasks: 4 },
  { day: 'Fri', date: 8, tasks: 1 },
  { day: 'Sat', date: 9, tasks: 0 },
  { day: 'Sun', date: 10, tasks: 2 },
];

const NEXT_WEEK_PREVIEW = [
  { day: 'Mon', date: 11, tasks: 2 },
  { day: 'Tue', date: 12, tasks: 3 },
  { day: 'Wed', date: 13, tasks: 1 },
];

export default function WeekScreen() {
  const today = new Date().getDate();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>This Week</Text>
          <Text style={styles.subtitle}>Nov 4 - Nov 10, 2025</Text>
        </View>

        {/* Weekly Goals Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Goals</Text>
          <View style={styles.goalsCard}>
            <View style={styles.goalRow}>
              <Text style={styles.goalEmoji}>🎯</Text>
              <View style={styles.goalContent}>
                <Text style={styles.goalTitle}>Complete 15 tasks</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '60%' }]} />
                </View>
                <Text style={styles.goalProgress}>9/15 completed</Text>
              </View>
            </View>

            <View style={styles.goalRow}>
              <Text style={styles.goalEmoji}>⚡</Text>
              <View style={styles.goalContent}>
                <Text style={styles.goalTitle}>5 focus sessions</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '80%' }]} />
                </View>
                <Text style={styles.goalProgress}>4/5 completed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 7-Day Calendar Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Tasks</Text>
          <View style={styles.weekGrid}>
            {CURRENT_WEEK_DAYS.map((dayInfo) => {
              const isToday = dayInfo.date === today;
              return (
                <View
                  key={dayInfo.date}
                  style={[styles.dayCard, isToday && styles.dayCardToday]}
                >
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                    {dayInfo.day}
                  </Text>
                  <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>
                    {dayInfo.date}
                  </Text>
                  <View style={[styles.taskBadge, dayInfo.tasks === 0 && styles.taskBadgeEmpty]}>
                    <Text style={styles.taskCount}>{dayInfo.tasks}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Next Week Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Week Preview</Text>
          <View style={styles.previewRow}>
            {NEXT_WEEK_PREVIEW.map((dayInfo) => (
              <View key={dayInfo.date} style={styles.previewCard}>
                <Text style={styles.previewDay}>{dayInfo.day}</Text>
                <Text style={styles.previewDate}>{dayInfo.date}</Text>
                <Text style={styles.previewTasks}>{dayInfo.tasks} tasks</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Timeline View */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: THEME.green }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Monday</Text>
                <Text style={styles.timelineTask}>3 tasks scheduled</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: THEME.cyan }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Tuesday</Text>
                <Text style={styles.timelineTask}>5 tasks scheduled</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: THEME.yellow }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Wednesday</Text>
                <Text style={styles.timelineTask}>2 tasks scheduled</Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: THEME.blue }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>Thursday - Sunday</Text>
                <Text style={styles.timelineTask}>7 tasks remaining</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Space for tab bar
  },
  header: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.cyan,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.base01,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalsCard: {
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalEmoji: {
    fontSize: 24,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: THEME.base01,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.cyan,
    borderRadius: 3,
  },
  goalProgress: {
    fontSize: 12,
    color: THEME.base01,
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCard: {
    width: '13%',
    aspectRatio: 1,
    backgroundColor: THEME.base02,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.base02,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dayCardToday: {
    borderColor: THEME.cyan,
    backgroundColor: `${THEME.cyan}20`,
  },
  dayLabel: {
    fontSize: 10,
    color: THEME.base01,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayLabelToday: {
    color: THEME.cyan,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 2,
  },
  dayDateToday: {
    color: THEME.cyan,
  },
  taskBadge: {
    backgroundColor: THEME.blue,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
  },
  taskBadgeEmpty: {
    backgroundColor: THEME.base01,
  },
  taskCount: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.base03,
    textAlign: 'center',
  },
  previewRow: {
    flexDirection: 'row',
    gap: 12,
  },
  previewCard: {
    flex: 1,
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  previewDay: {
    fontSize: 12,
    color: THEME.base01,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewDate: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 8,
  },
  previewTasks: {
    fontSize: 11,
    color: THEME.base01,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: THEME.base02,
    borderRadius: 8,
    padding: 12,
  },
  timelineDay: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 2,
  },
  timelineTask: {
    fontSize: 13,
    color: THEME.base01,
  },
});
