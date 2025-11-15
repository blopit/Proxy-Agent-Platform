/**
 * TaskRow - Task List Item with Slice Button
 *
 * Displays a single task with checkbox, metadata, and quick-access
 * "Slice" button for tasks > 5 minutes (Epic 7).
 *
 * Reference: Epic 7 Frontend Integration (Day 3)
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import BionicText from '../shared/BionicText';
import { Clock, Scissors, CheckCircle, Circle } from 'lucide-react-native';

// ============================================================================
// Types
// ============================================================================

export interface Task {
  id: string;
  title: string;
  estimatedTime?: number;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  tags?: string[];
}

export interface TaskRowProps {
  task: Task;
  onToggle?: (taskId: string) => void;
  onSlice?: (taskId: string) => void;
  onPress?: (taskId: string) => void;
  showSliceButton?: boolean;
  compact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function TaskRow({
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

  // Show slice button for tasks > 5 minutes (ADHD threshold)
  const shouldShowSlice = showSliceButton && task.estimatedTime && task.estimatedTime > 5;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: colors.base02 },
        task.completed && styles.completedRow,
      ]}
      onPress={() => onPress?.(task.id)}
      activeOpacity={0.7}
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
                style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '30' }]}
              >
                <BionicText style={[styles.priorityText, { color: getPriorityColor() }]}>
                  {task.priority.toUpperCase()}
                </BionicText>
              </View>
            )}

            {task.tags?.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.base03 }]}>
                <BionicText style={[styles.tagText, { color: colors.cyan }]}>
                  {tag}
                </BionicText>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Slice Button (Epic 7) */}
      {shouldShowSlice && !task.completed && (
        <TouchableOpacity
          style={[styles.sliceButton, { backgroundColor: colors.orange }]}
          onPress={() => onSlice?.(task.id)}
        >
          <Scissors size={16} color={colors.base03} />
          <BionicText style={[styles.sliceText, { color: colors.base03 }]}>Slice</BionicText>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
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
});
