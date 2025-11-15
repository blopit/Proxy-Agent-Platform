/**
 * TaskRow Stories - Task List Item with Slice Button
 * Based on: Epic 7 Frontend Integration (Day 3)
 *
 * Shows task row with quick-access "Slice → 2-5m" button
 * Reference: agent_resources/planning/current_sprint.md (Day 3)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/src/theme/ThemeContext';
import BionicText from '../shared/BionicText';
import { Clock, Scissors, CheckCircle, Circle } from 'lucide-react-native';

interface Task {
  id: string;
  title: string;
  estimatedTime?: number;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  tags?: string[];
}

interface TaskRowProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  onSlice?: (taskId: string) => void;
  onPress?: (taskId: string) => void;
  showSliceButton?: boolean;
  compact?: boolean;
}

function TaskRow({
  task,
  onToggle,
  onSlice,
  onPress,
  showSliceButton = true,
  compact = false,
}: TaskRowProps) {
  const { colors } = useTheme();

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return colors.red;
      case 'medium':
        return colors.orange;
      case 'low':
        return colors.blue;
      default:
        return colors.base01;
    }
  };

  const shouldShowSlice = showSliceButton && task.estimatedTime && task.estimatedTime > 5;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: colors.base02 },
        task.completed && styles.completedRow,
      ]}
      onPress={() => onPress?.(task.id)}
    >
      {/* Checkbox */}
      <TouchableOpacity onPress={() => onToggle?.(task.id)} style={styles.checkbox}>
        {task.completed ? (
          <CheckCircle size={24} color={colors.green} fill={colors.green} />
        ) : (
          <Circle size={24} color={colors.base01} />
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <BionicText
          style={[
            styles.title,
            { color: task.completed ? colors.base01 : colors.base0 },
            task.completed && styles.completedText,
          ]}
        >
          {task.title}
        </BionicText>

        {!compact && (
          <View style={styles.metadata}>
            {task.estimatedTime && (
              <View style={styles.metaItem}>
                <Clock size={12} color={colors.base01} />
                <BionicText style={[styles.metaText, { color: colors.base01 }]}>
                  {task.estimatedTime}m
                </BionicText>
              </View>
            )}

            {task.priority && (
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor() + '30' },
                ]}
              >
                <BionicText
                  style={[styles.priorityText, { color: getPriorityColor() }]}
                >
                  {task.priority.toUpperCase()}
                </BionicText>
              </View>
            )}

            {task.tags?.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: colors.base03 }]}
              >
                <BionicText style={[styles.tagText, { color: colors.cyan }]}>
                  {tag}
                </BionicText>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Slice Button */}
      {shouldShowSlice && !task.completed && (
        <TouchableOpacity
          style={[styles.sliceButton, { backgroundColor: colors.orange }]}
          onPress={() => onSlice?.(task.id)}
        >
          <Scissors size={16} color={colors.base03} />
          <BionicText style={[styles.sliceText, { color: colors.base03 }]}>
            Slice
          </BionicText>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const meta = {
  title: 'Tasks/TaskRow',
  component: TaskRow,
  decorators: [
    (Story) => {
      const { colors } = useTheme();
      return (
        <View style={[styles.container, { backgroundColor: colors.base03 }]}>
          <Story />
        </View>
      );
    },
  ],
} satisfies Meta<typeof TaskRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - With Slice Button
 * Shows task that can be sliced (>5 minutes)
 */
export const Default: Story = {
  args: {
    task: {
      id: '1',
      title: 'Implement user authentication',
      estimatedTime: 30,
      priority: 'high',
      tags: ['backend', 'security'],
    },
    onToggle: (id) => Alert.alert('Toggled', id),
    onSlice: (id) => Alert.alert('Slice Task', `Breaking down task ${id}`),
    onPress: (id) => Alert.alert('Open Task', id),
  },
};

/**
 * Short Task - No Slice Button
 * Tasks under 5 minutes don't show slice button
 */
export const ShortTask: Story = {
  args: {
    task: {
      id: '2',
      title: 'Send quick email to client',
      estimatedTime: 3,
      priority: 'medium',
    },
    onToggle: (id) => Alert.alert('Toggled', id),
  },
};

/**
 * Completed Task
 * Shows checked state with strikethrough
 */
export const Completed: Story = {
  args: {
    task: {
      id: '3',
      title: 'Review pull request',
      estimatedTime: 15,
      priority: 'medium',
      completed: true,
    },
    onToggle: (id) => Alert.alert('Toggled', id),
  },
};

/**
 * High Priority - Long Task
 * Red priority indicator with slice button
 */
export const HighPriority: Story = {
  args: {
    task: {
      id: '4',
      title: 'Fix critical production bug',
      estimatedTime: 120,
      priority: 'high',
      tags: ['urgent', 'production'],
    },
    onToggle: (id) => Alert.alert('Toggled', id),
    onSlice: (id) => Alert.alert('Slice Task', `Breaking down task ${id}`),
  },
};

/**
 * Low Priority
 * Blue priority indicator
 */
export const LowPriority: Story = {
  args: {
    task: {
      id: '5',
      title: 'Update README documentation',
      estimatedTime: 20,
      priority: 'low',
      tags: ['docs'],
    },
    onToggle: (id) => Alert.alert('Toggled', id),
    onSlice: (id) => Alert.alert('Slice Task', id),
  },
};

/**
 * Compact Mode - Minimal UI
 * No metadata shown
 */
export const CompactMode: Story = {
  args: {
    task: {
      id: '6',
      title: 'Quick task in compact view',
      estimatedTime: 10,
    },
    compact: true,
    onToggle: (id) => Alert.alert('Toggled', id),
    onSlice: (id) => Alert.alert('Slice Task', id),
  },
};

/**
 * Interactive - Full Task List
 * Shows multiple tasks with different states
 */
export const InteractiveList: Story = {
  render: () => {
    const { colors } = useTheme();
    const [tasks, setTasks] = useState<Task[]>([
      {
        id: '1',
        title: 'Build landing page',
        estimatedTime: 45,
        priority: 'high',
        tags: ['frontend'],
        completed: false,
      },
      {
        id: '2',
        title: 'Write unit tests',
        estimatedTime: 30,
        priority: 'medium',
        tags: ['testing'],
        completed: false,
      },
      {
        id: '3',
        title: 'Quick standup',
        estimatedTime: 5,
        priority: 'low',
        completed: true,
      },
      {
        id: '4',
        title: 'Refactor authentication module',
        estimatedTime: 90,
        priority: 'high',
        tags: ['backend', 'refactor'],
        completed: false,
      },
    ]);

    const handleToggle = (taskId: string) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    };

    const handleSlice = (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      Alert.alert(
        'Slice Task',
        `Breaking down "${task?.title}" into 2-5 minute micro-steps`
      );
    };

    return (
      <View style={styles.list}>
        <BionicText style={[styles.listTitle, { color: colors.cyan }]}>
          Today's Tasks
        </BionicText>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onSlice={handleSlice}
            onPress={(id) => Alert.alert('Open Task', id)}
          />
        ))}
      </View>
    );
  },
};

/**
 * ADHD Mode - All Sliceable
 * Shows how ADHD mode would auto-slice tasks
 */
export const ADHDMode: Story = {
  render: () => {
    const { colors } = useTheme();

    const tasks: Task[] = [
      {
        id: '1',
        title: 'Large project task (auto-sliced)',
        estimatedTime: 60,
        priority: 'high',
        tags: ['adhd-mode'],
      },
      {
        id: '2',
        title: 'Medium task (auto-sliced)',
        estimatedTime: 25,
        priority: 'medium',
        tags: ['adhd-mode'],
      },
      {
        id: '3',
        title: 'Already micro-sized',
        estimatedTime: 3,
        priority: 'low',
        tags: ['adhd-friendly'],
      },
    ];

    return (
      <View style={styles.list}>
        <BionicText style={[styles.listTitle, { color: colors.orange }]}>
          🧠 ADHD Mode Active
        </BionicText>
        <BionicText style={[styles.listSubtitle, { color: colors.base01 }]}>
          Tasks over 5 minutes automatically split into micro-steps
        </BionicText>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onSlice={(id) =>
              Alert.alert('Auto-Slice', `Task ${id} auto-split on creation`)
            }
          />
        ))}
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  completedRow: {
    opacity: 0.6,
  },
  checkbox: {
    padding: 4,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sliceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  sliceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  listSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
});
