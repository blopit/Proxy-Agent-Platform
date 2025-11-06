/**
 * TaskList - Displays a list of tasks with sections
 *
 * Features:
 * - Sectioned lists (Suggestions, Your Tasks, etc.)
 * - Pull-to-refresh
 * - Empty states
 * - Loading states
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { THEME } from '../../src/theme/colors';
import TaskCardBig from '../cards/TaskCardBig';
import SuggestionCard from '../cards/SuggestionCard';

export interface Task {
  task_id: string;
  title: string;
  description?: string;
  estimated_minutes?: number;
  micro_steps?: number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  tags?: string[];
}

export interface Suggestion {
  integration_task_id: string;
  suggested_title: string;
  provider: string;
  suggested_priority?: string;
  ai_confidence?: number;
  metadata?: string;
}

export interface TaskListSection {
  id: string;
  title: string;
  type: 'suggestions' | 'tasks';
  data: Suggestion[] | Task[];
}

export interface TaskListProps {
  sections: TaskListSection[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onTaskPress?: (taskId: string) => void;
  onSuggestionApprove?: (suggestionId: string) => void;
  onSuggestionDismiss?: (suggestionId: string) => void;
  emptyMessage?: string;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  sections,
  onRefresh,
  refreshing = false,
  onTaskPress,
  onSuggestionApprove,
  onSuggestionDismiss,
  emptyMessage = 'No tasks yet',
  loading = false,
}) => {
  const isEmpty = sections.every(section => section.data.length === 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.cyan}
          />
        ) : undefined
      }
    >
      {sections.map((section) => {
        if (section.data.length === 0) return null;

        return (
          <View key={section.id} style={styles.section}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {section.title} ({section.data.length})
              </Text>
            </View>

            {/* Section Content */}
            <View style={styles.sectionContent}>
              {section.type === 'suggestions' ? (
                // Render Suggestions
                (section.data as Suggestion[]).map((suggestion) => (
                  <View key={suggestion.integration_task_id} style={styles.itemWrapper}>
                    <SuggestionCard
                      text={suggestion.suggested_title}
                      sources={[
                        {
                          icon: suggestion.provider === 'gmail' ? '📧' : '📅',
                          color: THEME.blue,
                        },
                      ]}
                      metadata={suggestion.metadata || suggestion.suggested_priority}
                      onAdd={() => onSuggestionApprove?.(suggestion.integration_task_id)}
                      onDismiss={() => onSuggestionDismiss?.(suggestion.integration_task_id)}
                    />
                  </View>
                ))
              ) : (
                // Render Tasks
                (section.data as Task[]).map((task) => (
                  <View key={task.task_id} style={styles.itemWrapper}>
                    <TaskCardBig
                      task={{
                        task_id: task.task_id,
                        title: task.title,
                        description: task.description,
                        estimated_minutes: task.estimated_minutes,
                        tags: task.tags || [],
                        priority: task.priority,
                        micro_steps: [],
                      }}
                      onPress={() => onTaskPress?.(task.task_id)}
                    />
                  </View>
                ))
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  contentContainer: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.base03,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.base0,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.base01,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base1,
  },
  sectionContent: {
    gap: 12,
  },
  itemWrapper: {
    // Extra spacing between items handled by gap
  },
});

export default TaskList;
