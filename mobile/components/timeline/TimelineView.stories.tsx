import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import TimelineView from './TimelineView';
import { THEME } from '../../src/theme/colors';

const meta = {
  title: 'Timeline/TimelineView',
  component: TimelineView,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: THEME.base03 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TimelineView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock events
const mockEvents = [
  {
    id: '1',
    title: 'Team Standup',
    startTime: '09:00',
    endTime: '09:30',
    type: 'meeting' as const,
    description: 'Daily standup with engineering team',
  },
  {
    id: '2',
    title: 'Deep Work: Bug Fixing',
    startTime: '10:00',
    endTime: '12:00',
    type: 'task' as const,
    description: 'Focus session for fixing authentication bugs',
  },
  {
    id: '3',
    title: 'Lunch Break',
    startTime: '12:00',
    endTime: '13:00',
    type: 'break' as const,
  },
  {
    id: '4',
    title: 'Client Review Meeting',
    startTime: '14:00',
    endTime: '15:00',
    type: 'meeting' as const,
    description: 'Present project progress to client stakeholders',
  },
  {
    id: '5',
    title: 'Code Review',
    startTime: '15:30',
    endTime: '16:30',
    type: 'task' as const,
  },
  {
    id: '6',
    title: 'Documentation Writing',
    startTime: '17:00',
    endTime: '18:00',
    type: 'task' as const,
    description: 'Update API documentation for new endpoints',
  },
];

// === Basic Views ===

export const Default: Story = {
  args: {
    events: mockEvents,
    date: new Date(),
  },
};

export const WorkingHours: Story = {
  args: {
    events: mockEvents,
    startHour: 8,
    endHour: 18,
    date: new Date(),
  },
};

export const FullDay: Story = {
  args: {
    events: [
      ...mockEvents,
      {
        id: '7',
        title: 'Morning Exercise',
        startTime: '07:00',
        endTime: '08:00',
        type: 'break' as const,
      },
      {
        id: '8',
        title: 'Evening Planning',
        startTime: '20:00',
        endTime: '20:30',
        type: 'task' as const,
      },
    ],
    startHour: 6,
    endHour: 22,
    date: new Date(),
  },
};

// === Event Types ===

export const OnlyMeetings: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'Team Standup',
        startTime: '09:00',
        endTime: '09:30',
        type: 'meeting',
      },
      {
        id: '2',
        title: '1:1 with Manager',
        startTime: '11:00',
        endTime: '11:45',
        type: 'meeting',
      },
      {
        id: '3',
        title: 'Client Review',
        startTime: '14:00',
        endTime: '15:00',
        type: 'meeting',
      },
      {
        id: '4',
        title: 'Sprint Planning',
        startTime: '16:00',
        endTime: '17:30',
        type: 'meeting',
      },
    ],
    date: new Date(),
  },
};

export const OnlyTasks: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'Write feature specification',
        startTime: '09:00',
        endTime: '10:30',
        type: 'task',
      },
      {
        id: '2',
        title: 'Code implementation',
        startTime: '11:00',
        endTime: '13:00',
        type: 'task',
      },
      {
        id: '3',
        title: 'Unit testing',
        startTime: '14:00',
        endTime: '15:30',
        type: 'task',
      },
      {
        id: '4',
        title: 'Code review',
        startTime: '16:00',
        endTime: '17:00',
        type: 'task',
      },
    ],
    date: new Date(),
  },
};

export const WithBreaks: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'Deep Work Session 1',
        startTime: '09:00',
        endTime: '10:30',
        type: 'task',
      },
      {
        id: '2',
        title: 'Coffee Break',
        startTime: '10:30',
        endTime: '10:45',
        type: 'break',
      },
      {
        id: '3',
        title: 'Deep Work Session 2',
        startTime: '10:45',
        endTime: '12:15',
        type: 'task',
      },
      {
        id: '4',
        title: 'Lunch',
        startTime: '12:15',
        endTime: '13:15',
        type: 'break',
      },
      {
        id: '5',
        title: 'Afternoon Session',
        startTime: '13:15',
        endTime: '15:00',
        type: 'task',
      },
      {
        id: '6',
        title: 'Walk Break',
        startTime: '15:00',
        endTime: '15:15',
        type: 'break',
      },
    ],
    date: new Date(),
  },
};

// === Time Ranges ===

export const MorningOnly: Story = {
  args: {
    events: mockEvents.filter((e) => parseInt(e.startTime) < 12),
    startHour: 6,
    endHour: 12,
    date: new Date(),
  },
};

export const AfternoonOnly: Story = {
  args: {
    events: mockEvents.filter((e) => parseInt(e.startTime) >= 12),
    startHour: 12,
    endHour: 18,
    date: new Date(),
  },
};

// === Density ===

export const SparseSchedule: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'Morning Task',
        startTime: '09:00',
        endTime: '10:00',
        type: 'task',
      },
      {
        id: '2',
        title: 'Afternoon Meeting',
        startTime: '15:00',
        endTime: '16:00',
        type: 'meeting',
      },
    ],
    date: new Date(),
  },
};

export const PackedSchedule: Story = {
  args: {
    events: [
      { id: '1', title: 'Standup', startTime: '09:00', endTime: '09:30', type: 'meeting' },
      { id: '2', title: 'Task 1', startTime: '09:30', endTime: '10:30', type: 'task' },
      { id: '3', title: 'Meeting 1', startTime: '10:30', endTime: '11:30', type: 'meeting' },
      { id: '4', title: 'Task 2', startTime: '11:30', endTime: '12:30', type: 'task' },
      { id: '5', title: 'Lunch', startTime: '12:30', endTime: '13:00', type: 'break' },
      { id: '6', title: 'Meeting 2', startTime: '13:00', endTime: '14:00', type: 'meeting' },
      { id: '7', title: 'Task 3', startTime: '14:00', endTime: '15:00', type: 'task' },
      { id: '8', title: 'Meeting 3', startTime: '15:00', endTime: '16:00', type: 'meeting' },
      { id: '9', title: 'Task 4', startTime: '16:00', endTime: '17:00', type: 'task' },
      { id: '10', title: 'Wrap Up', startTime: '17:00', endTime: '17:30', type: 'task' },
    ],
    date: new Date(),
  },
};

// === Empty State ===

export const NoEvents: Story = {
  args: {
    events: [],
    date: new Date(),
  },
};

// === Custom Colors ===

export const CustomColors: Story = {
  args: {
    events: [
      {
        id: '1',
        title: 'High Priority Task',
        startTime: '09:00',
        endTime: '11:00',
        type: 'task',
        color: THEME.red,
      },
      {
        id: '2',
        title: 'Medium Priority',
        startTime: '11:30',
        endTime: '13:00',
        type: 'task',
        color: THEME.yellow,
      },
      {
        id: '3',
        title: 'Low Priority',
        startTime: '14:00',
        endTime: '15:30',
        type: 'task',
        color: THEME.green,
      },
    ],
    date: new Date(),
  },
};

// === Hour Heights ===

export const CompactView: Story = {
  args: {
    events: mockEvents,
    hourHeight: 50,
    date: new Date(),
  },
};

export const SpacedView: Story = {
  args: {
    events: mockEvents,
    hourHeight: 120,
    date: new Date(),
  },
};

// === Date Variants ===

export const Tomorrow: Story = {
  args: {
    events: mockEvents,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
};

export const Yesterday: Story = {
  args: {
    events: mockEvents,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
};

// === ADHD-Optimized Schedules ===

export const ADHDPomodoro: Story = {
  args: {
    events: [
      { id: '1', title: 'Focus: Task A', startTime: '09:00', endTime: '09:25', type: 'task' },
      { id: '2', title: 'Break', startTime: '09:25', endTime: '09:30', type: 'break' },
      { id: '3', title: 'Focus: Task A', startTime: '09:30', endTime: '09:55', type: 'task' },
      { id: '4', title: 'Break', startTime: '09:55', endTime: '10:00', type: 'break' },
      { id: '5', title: 'Focus: Task B', startTime: '10:00', endTime: '10:25', type: 'task' },
      { id: '6', title: 'Break', startTime: '10:25', endTime: '10:30', type: 'break' },
      { id: '7', title: 'Focus: Task B', startTime: '10:30', endTime: '10:55', type: 'task' },
      { id: '8', title: 'Long Break', startTime: '10:55', endTime: '11:15', type: 'break' },
    ],
    startHour: 9,
    endHour: 12,
    date: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pomodoro technique with 25min focus + 5min breaks for ADHD',
      },
    },
  },
};

export const ADHDTimeBlocking: Story = {
  args: {
    events: [
      { id: '1', title: 'Morning Routine', startTime: '08:00', endTime: '09:00', type: 'break', color: THEME.green },
      { id: '2', title: 'HIGH ENERGY: Hard Task', startTime: '09:00', endTime: '11:00', type: 'task', color: THEME.red },
      { id: '3', title: 'Movement Break', startTime: '11:00', endTime: '11:15', type: 'break' },
      { id: '4', title: 'MEDIUM: Meetings', startTime: '11:15', endTime: '12:00', type: 'meeting', color: THEME.yellow },
      { id: '5', title: 'Lunch + Rest', startTime: '12:00', endTime: '13:00', type: 'break' },
      { id: '6', title: 'LOW ENERGY: Easy Tasks', startTime: '13:00', endTime: '15:00', type: 'task', color: THEME.cyan },
      { id: '7', title: 'Walk Break', startTime: '15:00', endTime: '15:30', type: 'break' },
      { id: '8', title: 'Review & Plan Tomorrow', startTime: '15:30', endTime: '16:00', type: 'task', color: THEME.blue },
    ],
    startHour: 8,
    endHour: 17,
    date: new Date(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Energy-aware time blocking: Hard tasks in morning, easy tasks after lunch',
      },
    },
  },
};
