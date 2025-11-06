import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Zap, ChevronRight, Check, Circle } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import FocusTimer from '../focus/FocusTimer';
import TaskCardBig from '../cards/TaskCardBig';

/**
 * Hunter Screen - Complete composition showing the Focus Mode interface
 *
 * This is a SCREEN STORY that composes multiple components:
 * - FocusTimer (main focus area)
 * - Current task display
 * - Micro-step progress tracker
 * - Quick actions
 *
 * Based on: mobile/TABS_AND_DATA_FLOW_PLAN.md - Hunter Tab
 */

const meta = {
  title: 'Screens/Hunter',
  component: HunterScreen,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HunterScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockTask = {
  task_id: 't1',
  title: 'Fix authentication bug in production',
  description: 'Users are experiencing 500 errors on login. Need to investigate session handling and token validation.',
  estimated_minutes: 45,
  micro_steps: [
    { id: '1', text: 'Review error logs from production', completed: true },
    { id: '2', text: 'Identify root cause in auth flow', completed: true },
    { id: '3', text: 'Write fix with tests', completed: false },
    { id: '4', text: 'Deploy to staging', completed: false },
    { id: '5', text: 'Verify fix in production', completed: false },
  ],
  priority: 'HIGH' as const,
  tags: ['bug', 'urgent', 'backend'],
};

const mockUpcomingTasks = [
  {
    task_id: 't2',
    title: 'Write documentation for new API',
    estimated_minutes: 120,
    priority: 'MEDIUM' as const,
  },
  {
    task_id: 't3',
    title: 'Refactor user service',
    estimated_minutes: 90,
    priority: 'LOW' as const,
  },
];

// Hunter Screen Component
interface HunterScreenProps {
  currentTask?: typeof mockTask;
  sessionType?: 'focus' | 'short-break' | 'long-break';
  sessionDuration?: number;
  showUpcoming?: boolean;
}

function HunterScreen({
  currentTask = mockTask,
  sessionType = 'focus',
  sessionDuration = 25 * 60,
  showUpcoming = true,
}: HunterScreenProps) {
  const [task, setTask] = useState(currentTask);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(
    task.micro_steps.filter((s) => s.completed).length
  );

  const toggleMicroStep = (stepId: string) => {
    setTask((prev) => ({
      ...prev,
      micro_steps: prev.micro_steps.map((step) =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      ),
    }));
    setCompletedSteps(task.micro_steps.filter((s) => s.completed).length);
  };

  const progressPercent = (completedSteps / task.micro_steps.length) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Zap size={24} color={THEME.orange} />
          <Text style={styles.title}>Hunter</Text>
        </View>
      </View>

      {/* Session Type Badge */}
      <View style={styles.sessionBadge}>
        <Text style={styles.sessionBadgeText}>
          {sessionType === 'focus'
            ? '🎯 Focus Mode'
            : sessionType === 'short-break'
            ? '☕ Short Break'
            : '🌳 Long Break'}
        </Text>
      </View>

      {/* Focus Timer */}
      <View style={styles.timerSection}>
        <FocusTimer
          duration={sessionDuration}
          sessionType={sessionType}
          onStart={() => setIsSessionActive(true)}
          onPause={() => setIsSessionActive(false)}
          onStop={() => setIsSessionActive(false)}
          onComplete={() => {
            setIsSessionActive(false);
            alert('Great work! Time for a break.');
          }}
        />
      </View>

      {/* Current Task */}
      {sessionType === 'focus' && (
        <View style={styles.currentTaskSection}>
          <Text style={styles.sectionTitle}>Current Task</Text>

          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskTitleRow}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.priority === 'HIGH' && (
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>HIGH</Text>
                  </View>
                )}
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
            </View>

            {/* Micro Steps */}
            <View style={styles.microSteps}>
              <View style={styles.microStepsHeader}>
                <Text style={styles.microStepsTitle}>Progress</Text>
                <Text style={styles.microStepsCount}>
                  {completedSteps} / {task.micro_steps.length}
                </Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                />
              </View>

              {/* Steps List */}
              {task.micro_steps.map((step) => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.microStep}
                  onPress={() => toggleMicroStep(step.id)}
                >
                  <View style={styles.stepCheckbox}>
                    {step.completed ? (
                      <Check size={16} color={THEME.green} />
                    ) : (
                      <Circle size={16} color={THEME.base01} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      step.completed && styles.stepTextCompleted,
                    ]}
                  >
                    {step.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Upcoming Tasks */}
      {showUpcoming && sessionType === 'focus' && (
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>Up Next</Text>
          {mockUpcomingTasks.map((upcomingTask) => (
            <View key={upcomingTask.task_id} style={styles.upcomingTask}>
              <ChevronRight size={16} color={THEME.base01} />
              <Text style={styles.upcomingTaskTitle}>{upcomingTask.title}</Text>
              <Text style={styles.upcomingTaskTime}>
                {upcomingTask.estimated_minutes}m
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>Skip Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickActionButton, styles.quickActionPrimary]}>
          <Text style={[styles.quickActionText, styles.quickActionTextPrimary]}>
            Complete Task
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// === Basic Views ===

export const Default: Story = {
  render: () => <HunterScreen />,
};

export const ShortBreakMode: Story = {
  render: () => (
    <HunterScreen sessionType="short-break" sessionDuration={5 * 60} />
  ),
};

export const LongBreakMode: Story = {
  render: () => (
    <HunterScreen sessionType="long-break" sessionDuration={15 * 60} />
  ),
};

// === Energy Levels ===

export const LowEnergy: Story = {
  render: () => (
    <HunterScreen energyLevel={25} sessionDuration={15 * 60} />
  ),
};

export const HighEnergy: Story = {
  render: () => (
    <HunterScreen energyLevel={95} sessionDuration={50 * 60} />
  ),
};

// === Task Progress ===

export const TaskJustStarted: Story = {
  render: () => (
    <HunterScreen
      currentTask={{
        ...mockTask,
        micro_steps: mockTask.micro_steps.map((s) => ({ ...s, completed: false })),
      }}
    />
  ),
};

export const TaskAlmostDone: Story = {
  render: () => (
    <HunterScreen
      currentTask={{
        ...mockTask,
        micro_steps: mockTask.micro_steps.map((s, i) => ({
          ...s,
          completed: i < 4, // 4 of 5 complete
        })),
      }}
    />
  ),
};

// === Session Variants ===

export const QuickFocus: Story = {
  render: () => <HunterScreen sessionDuration={10 * 60} />,
};

export const DeepWork: Story = {
  render: () => <HunterScreen sessionDuration={50 * 60} />,
};

export const ADHDMicroBurst: Story = {
  render: () => (
    <HunterScreen
      sessionDuration={5 * 60}
      currentTask={{
        ...mockTask,
        micro_steps: mockTask.micro_steps.slice(0, 2), // Only 2 steps for micro-burst
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: '5-minute micro-burst focus session with minimal steps - perfect for ADHD',
      },
    },
  },
};

// === Layout Variants ===

export const WithoutUpcoming: Story = {
  render: () => <HunterScreen showUpcoming={false} />,
};

// === Interactive Demo ===

export const FullyInteractive: Story = {
  render: () => {
    const [energy, setEnergy] = useState(75);
    const [sessionType, setSessionType] = useState<'focus' | 'short-break' | 'long-break'>('focus');

    return (
      <View style={{ flex: 1 }}>
        {/* Debug Controls */}
        <View style={styles.debugControls}>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setSessionType('focus')}
          >
            <Text style={styles.debugButtonText}>Focus</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setSessionType('short-break')}
          >
            <Text style={styles.debugButtonText}>Short Break</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => setSessionType('long-break')}
          >
            <Text style={styles.debugButtonText}>Long Break</Text>
          </TouchableOpacity>
        </View>

        <HunterScreen energyLevel={energy} sessionType={sessionType} />
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
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  sessionBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME.base02,
    borderRadius: 20,
    marginBottom: 16,
  },
  sessionBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base1,
  },
  timerSection: {
    marginBottom: 24,
  },
  currentTaskSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base1,
    marginBottom: 12,
  },
  taskCard: {
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 16,
  },
  taskHeader: {
    marginBottom: 16,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base1,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: THEME.red + '20',
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.red,
  },
  taskDescription: {
    fontSize: 14,
    color: THEME.base0,
    lineHeight: 20,
  },
  microSteps: {
    gap: 12,
  },
  microStepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  microStepsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base1,
  },
  microStepsCount: {
    fontSize: 14,
    color: THEME.base01,
  },
  progressBar: {
    height: 4,
    backgroundColor: THEME.base01 + '40',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.green,
    borderRadius: 2,
  },
  microStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.base01,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    color: THEME.base0,
    flex: 1,
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.base01,
  },
  upcomingSection: {
    marginBottom: 24,
  },
  upcomingTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  upcomingTaskTitle: {
    flex: 1,
    fontSize: 14,
    color: THEME.base0,
  },
  upcomingTaskTime: {
    fontSize: 12,
    color: THEME.base01,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.base01,
    alignItems: 'center',
  },
  quickActionPrimary: {
    backgroundColor: THEME.green,
    borderColor: THEME.green,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.base1,
  },
  quickActionTextPrimary: {
    color: THEME.base3,
  },
  debugControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: THEME.base02,
  },
  debugButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: THEME.orange,
    borderRadius: 8,
  },
  debugButtonText: {
    color: THEME.base3,
    fontSize: 12,
    fontWeight: '600',
  },
});
