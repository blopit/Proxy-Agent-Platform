import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import TimelineView from '../timeline/TimelineView';
import type { TimelineEvent } from '../timeline/TimelineView';

/**
 * Today Screen - Complete composition showing the Timeline/Calendar interface
 *
 * This is a SCREEN STORY that composes multiple components:
 * - TimelineView (main timeline)
 * - Date navigation
 * - Quick add button
 * - Daily summary
 *
 * Based on: mobile/TABS_AND_DATA_FLOW_PLAN.md - Today Tab
 */

const meta = {
  title: 'Screens/Today',
  component: TodayScreen,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TodayScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock events
const mockEventsToday: TimelineEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    startTime: '09:00',
    endTime: '09:30',
    type: 'meeting',
    description: 'Daily standup with engineering team',
  },
  {
    id: '2',
    title: 'Deep Work: Bug Fixing',
    startTime: '10:00',
    endTime: '12:00',
    type: 'task',
    description: 'Focus session for fixing authentication bugs',
  },
  {
    id: '3',
    title: 'Lunch Break',
    startTime: '12:00',
    endTime: '13:00',
    type: 'break',
  },
  {
    id: '4',
    title: 'Client Review Meeting',
    startTime: '14:00',
    endTime: '15:00',
    type: 'meeting',
    description: 'Present project progress to client stakeholders',
  },
  {
    id: '5',
    title: 'Code Review',
    startTime: '15:30',
    endTime: '16:30',
    type: 'task',
  },
  {
    id: '6',
    title: 'Documentation Writing',
    startTime: '17:00',
    endTime: '18:00',
    type: 'task',
    description: 'Update API documentation for new endpoints',
  },
];

const mockEventsTomorrow: TimelineEvent[] = [
  {
    id: '1',
    title: 'Planning Session',
    startTime: '09:00',
    endTime: '10:30',
    type: 'meeting',
  },
  {
    id: '2',
    title: 'Feature Development',
    startTime: '11:00',
    endTime: '13:00',
    type: 'task',
  },
  {
    id: '3',
    title: 'Team Lunch',
    startTime: '13:00',
    endTime: '14:00',
    type: 'break',
  },
];

// Today Screen Component
interface TodayScreenProps {
  initialEvents?: TimelineEvent[];
  initialDate?: Date;
  showSummary?: boolean;
}

function TodayScreen({
  initialEvents = mockEventsToday,
  initialDate = new Date(),
  showSummary = true,
}: TodayScreenProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [events, setEvents] = useState(initialEvents);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    // In real app, would fetch events for new date
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    // In real app, would fetch events for new date
    if (newDate > new Date()) {
      setEvents(mockEventsTomorrow);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setEvents(mockEventsToday);
  };

  // Calculate summary stats
  const totalEvents = events.length;
  const completedEvents = events.filter((e) => {
    const [hour] = e.endTime.split(':').map(Number);
    return hour < new Date().getHours();
  }).length;
  const upcomingEvents = totalEvents - completedEvents;

  const totalMinutes = events.reduce((acc, event) => {
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    return acc + ((endHour * 60 + endMinute) - (startHour * 60 + startMinute));
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Calendar size={24} color={THEME.blue} />
          <Text style={styles.title}>Today</Text>
        </View>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
          <ChevronLeft size={20} color={THEME.base1} />
        </TouchableOpacity>

        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          {isToday && (
            <View style={styles.todayDot} />
          )}
        </View>

        <TouchableOpacity style={styles.navButton} onPress={goToNextDay}>
          <ChevronRight size={20} color={THEME.base1} />
        </TouchableOpacity>

        {!isToday && (
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Daily Summary */}
      {showSummary && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalEvents}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: THEME.green }]}>
              {completedEvents}
            </Text>
            <Text style={styles.summaryLabel}>Done</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: THEME.cyan }]}>
              {upcomingEvents}
            </Text>
            <Text style={styles.summaryLabel}>Upcoming</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalHours}h</Text>
            <Text style={styles.summaryLabel}>Scheduled</Text>
          </View>
        </View>
      )}

      {/* Timeline */}
      <TimelineView
        date={selectedDate}
        events={events}
        startHour={8}
        endHour={19}
        showCurrentTime={isToday}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Plus size={24} color={THEME.base3} />
      </TouchableOpacity>
    </View>
  );
}

// === Basic Views ===

export const Default: Story = {
  render: () => <TodayScreen />,
};

export const WithoutSummary: Story = {
  render: () => <TodayScreen showSummary={false} />,
};

// === Energy Levels ===

export const LowEnergy: Story = {
  render: () => <TodayScreen energyLevel={25} />,
};

export const HighEnergy: Story = {
  render: () => <TodayScreen energyLevel={95} />,
};

// === Schedule Variants ===

export const LightDay: Story = {
  render: () => (
    <TodayScreen
      initialEvents={[
        {
          id: '1',
          title: 'Morning Task',
          startTime: '09:00',
          endTime: '10:30',
          type: 'task',
        },
        {
          id: '2',
          title: 'Lunch Meeting',
          startTime: '12:00',
          endTime: '13:00',
          type: 'meeting',
        },
        {
          id: '3',
          title: 'Afternoon Work',
          startTime: '14:00',
          endTime: '16:00',
          type: 'task',
        },
      ]}
    />
  ),
};

export const PackedDay: Story = {
  render: () => (
    <TodayScreen
      initialEvents={[
        { id: '1', title: 'Standup', startTime: '09:00', endTime: '09:30', type: 'meeting' },
        { id: '2', title: 'Task 1', startTime: '09:30', endTime: '10:30', type: 'task' },
        { id: '3', title: 'Meeting 1', startTime: '10:30', endTime: '11:30', type: 'meeting' },
        { id: '4', title: 'Task 2', startTime: '11:30', endTime: '12:30', type: 'task' },
        { id: '5', title: 'Lunch', startTime: '12:30', endTime: '13:00', type: 'break' },
        { id: '6', title: 'Meeting 2', startTime: '13:00', endTime: '14:00', type: 'meeting' },
        { id: '7', title: 'Task 3', startTime: '14:00', endTime: '15:00', type: 'task' },
        { id: '8', title: 'Meeting 3', startTime: '15:00', endTime: '16:00', type: 'meeting' },
        { id: '9', title: 'Task 4', startTime: '16:00', endTime: '17:00', type: 'task' },
        { id: '10', title: 'Wrap Up', startTime: '17:00', endTime: '18:00', type: 'task' },
      ]}
    />
  ),
};

export const EmptyDay: Story = {
  render: () => <TodayScreen initialEvents={[]} />,
};

// === ADHD-Optimized Schedules ===

export const ADHDPomodoro: Story = {
  render: () => (
    <TodayScreen
      initialEvents={[
        { id: '1', title: 'Focus: Hard Task', startTime: '09:00', endTime: '09:25', type: 'task' },
        { id: '2', title: 'Break', startTime: '09:25', endTime: '09:30', type: 'break' },
        { id: '3', title: 'Focus: Hard Task', startTime: '09:30', endTime: '09:55', type: 'task' },
        { id: '4', title: 'Break', startTime: '09:55', endTime: '10:00', type: 'break' },
        { id: '5', title: 'Focus: Medium Task', startTime: '10:00', endTime: '10:25', type: 'task' },
        { id: '6', title: 'Break', startTime: '10:25', endTime: '10:30', type: 'break' },
        { id: '7', title: 'Focus: Medium Task', startTime: '10:30', endTime: '10:55', type: 'task' },
        { id: '8', title: 'Long Break', startTime: '10:55', endTime: '11:15', type: 'break' },
        { id: '9', title: 'Lunch', startTime: '12:00', endTime: '13:00', type: 'break' },
        { id: '10', title: 'Easy Tasks', startTime: '13:00', endTime: '15:00', type: 'task' },
        { id: '11', title: 'Walk', startTime: '15:00', endTime: '15:15', type: 'break' },
        { id: '12', title: 'Review & Plan', startTime: '15:15', endTime: '16:00', type: 'task' },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pomodoro-based schedule with 25min focus + 5min breaks, optimized for ADHD',
      },
    },
  },
};

export const ADHDEnergyAware: Story = {
  render: () => (
    <TodayScreen
      initialEvents={[
        {
          id: '1',
          title: 'Morning Routine',
          startTime: '08:00',
          endTime: '09:00',
          type: 'break',
          color: THEME.green,
        },
        {
          id: '2',
          title: 'HIGH ENERGY: Hard Task',
          startTime: '09:00',
          endTime: '11:00',
          type: 'task',
          color: THEME.red,
          description: 'Tackle hardest task when energy is highest',
        },
        {
          id: '3',
          title: 'Movement Break',
          startTime: '11:00',
          endTime: '11:15',
          type: 'break',
        },
        {
          id: '4',
          title: 'MEDIUM: Meetings',
          startTime: '11:15',
          endTime: '12:00',
          type: 'meeting',
          color: THEME.yellow,
        },
        {
          id: '5',
          title: 'Lunch + Rest',
          startTime: '12:00',
          endTime: '13:00',
          type: 'break',
        },
        {
          id: '6',
          title: 'LOW ENERGY: Easy Tasks',
          startTime: '13:00',
          endTime: '15:00',
          type: 'task',
          color: THEME.cyan,
          description: 'Simple, repetitive tasks after lunch dip',
        },
        {
          id: '7',
          title: 'Walk Break',
          startTime: '15:00',
          endTime: '15:30',
          type: 'break',
        },
        {
          id: '8',
          title: 'Review & Tomorrow Planning',
          startTime: '15:30',
          endTime: '16:00',
          type: 'task',
          color: THEME.blue,
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Energy-aware schedule: Hard tasks in morning, easy tasks afternoon, with frequent breaks',
      },
    },
  },
};

// === Interactive Demo ===

export const FullyInteractive: Story = {
  render: () => {
    const [energy, setEnergy] = useState(75);
    const [date, setDate] = useState(new Date());

    return (
      <View style={{ flex: 1 }}>
        {/* Debug Controls */}
        <View style={styles.debugControls}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setEnergy(Math.max(0, energy - 10))}
          >
            <Text style={styles.debugButtonText}>- Energy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setEnergy(Math.min(100, energy + 10))}
          >
            <Text style={styles.debugButtonText}>+ Energy</Text>
          </TouchableOpacity>
        </View>

        <TodayScreen energyLevel={energy} initialDate={date} />
      </View>
    );
  },
};

// === Styles ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.base1,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.base02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base1,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.cyan,
  },
  todayButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.cyan,
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base3,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.base02,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.base1,
  },
  summaryLabel: {
    fontSize: 11,
    color: THEME.base01,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: THEME.base01 + '40',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.blue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  debugControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: THEME.base02,
  },
  debugButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.blue,
    borderRadius: 8,
  },
  debugButtonText: {
    color: THEME.base3,
    fontSize: 14,
    fontWeight: '600',
  },
});
