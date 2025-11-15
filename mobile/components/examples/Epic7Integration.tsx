/**
 * Epic 7 Integration Example
 *
 * Complete working example of Epic 7 task splitting integration.
 * Shows how to wire TaskRow, TaskBreakdownModal, ADHD Mode, and auto-split.
 *
 * USE THIS AS A REFERENCE for integrating Epic 7 into your screens!
 */

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSettings } from '@/src/contexts/SettingsContext';
import { useAutoSplit } from '@/src/hooks/useAutoSplit';
import BionicText from '../shared/BionicText';
import TaskRow, { type Task } from '../tasks/TaskRow';
import TaskBreakdownModal from '../modals/TaskBreakdownModal';
import ADHDModeToggle from '../settings/ADHDModeToggle';

// ============================================================================
// Example Component
// ============================================================================

export default function Epic7Integration() {
  const { colors } = useTheme();
  const { settings } = useSettings();

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Auto-split hook
  const { autoSplit, isEnabled } = useAutoSplit({
    onSplitComplete: (result) => {
      console.log('✅ Auto-split result:', result);
      if (result.wasSplit) {
        Alert.alert(
          'Task Split!',
          `Task automatically broken into ${result.microSteps?.length} micro-steps`
        );
      }
    },
    onSplitError: (error) => {
      Alert.alert('Auto-Split Failed', error.message);
    },
  });

  // Sample tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Implement Google OAuth',
      estimatedTime: 30,
      priority: 'high',
      tags: ['backend', 'security'],
      completed: false,
    },
    {
      id: '2',
      title: 'Quick standup meeting',
      estimatedTime: 5,
      priority: 'low',
      completed: false,
    },
    {
      id: '3',
      title: 'Build complete user dashboard',
      estimatedTime: 120,
      priority: 'high',
      tags: ['frontend', 'dashboard'],
      completed: false,
    },
  ]);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handle task toggle (complete/uncomplete)
   */
  const handleToggle = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  /**
   * Handle slice button press - opens TaskBreakdownModal
   */
  const handleSlice = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setModalVisible(true);
    }
  };

  /**
   * Handle task press - could navigate to task detail
   */
  const handleTaskPress = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    Alert.alert('Task Details', `View details for: ${task?.title}`);
  };

  /**
   * Handle breakdown complete - called when TaskBreakdownModal succeeds
   */
  const handleBreakdownComplete = (microSteps: any[]) => {
    console.log(`✅ Task broken into ${microSteps.length} micro-steps`);
    Alert.alert(
      'Success!',
      `Task split into ${microSteps.length} micro-steps (2-5 min each)`,
      [{ text: 'Great!', onPress: () => setModalVisible(false) }]
    );
  };

  /**
   * Simulate creating a new task (with auto-split)
   */
  const handleCreateTask = async () => {
    const newTask: Task & { task_id: string; estimated_hours?: number } = {
      id: Date.now().toString(),
      task_id: `task_${Date.now()}`,
      title: 'New task from capture',
      estimatedTime: 45,
      estimated_hours: 0.75, // 45 minutes
      priority: 'medium',
      completed: false,
    };

    // Add to list
    setTasks((prev) => [...prev, newTask]);

    // Auto-split if ADHD Mode enabled
    if (isEnabled) {
      await autoSplit(newTask);
    }

    Alert.alert('Task Created', isEnabled ? 'Auto-splitting...' : 'Task added');
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <View style={[styles.container, { backgroundColor: colors.base03 }]}>
      {/* Header */}
      <BionicText style={[styles.header, { color: colors.cyan }]}>
        Epic 7 Integration Example
      </BionicText>

      {/* ADHD Mode Toggle */}
      <ADHDModeToggle />

      {/* Status Info */}
      <View style={[styles.infoBox, { backgroundColor: colors.base02 }]}>
        <BionicText style={[styles.infoText, { color: colors.base01 }]}>
          ADHD Mode: {settings.adhdMode ? '✅ ON' : '❌ OFF'}
        </BionicText>
        <BionicText style={[styles.infoText, { color: colors.base01 }]}>
          Auto-split threshold: {settings.autoSplitThreshold} minutes
        </BionicText>
        <BionicText style={[styles.infoText, { color: colors.base01 }]}>
          Sliceable tasks: {tasks.filter((t) => t.estimatedTime && t.estimatedTime > 5).length}/
          {tasks.length}
        </BionicText>
      </View>

      {/* Tasks List */}
      <View style={styles.tasksList}>
        <BionicText style={[styles.sectionTitle, { color: colors.base1 }]}>
          Your Tasks ({tasks.length})
        </BionicText>

        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onSlice={handleSlice}
            onPress={handleTaskPress}
            showSliceButton={true}
          />
        ))}
      </View>

      {/* Create Task Button (for testing auto-split) */}
      <View
        style={[styles.createButton, { backgroundColor: colors.green }]}
        onTouchEnd={handleCreateTask}
      >
        <BionicText style={[styles.createButtonText, { color: colors.base03 }]}>
          + Create Test Task (45 min)
        </BionicText>
      </View>

      {/* Task Breakdown Modal */}
      {selectedTask && (
        <TaskBreakdownModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          taskDescription={`Priority: ${selectedTask.priority || 'none'}`}
          estimatedTime={selectedTask.estimatedTime}
          mode={settings.adhdMode ? 'adhd' : 'default'}
          onBreakdownComplete={handleBreakdownComplete}
        />
      )}

      {/* Instructions */}
      <View style={[styles.instructions, { backgroundColor: colors.base02 }]}>
        <BionicText style={[styles.instructionsTitle, { color: colors.orange }]}>
          How to Test Epic 7:
        </BionicText>
        <BionicText style={[styles.instructionText, { color: colors.base0 }]}>
          1. Toggle ADHD Mode ON/OFF
        </BionicText>
        <BionicText style={[styles.instructionText, { color: colors.base0 }]}>
          2. Click "Slice" button on tasks &gt; 5 min
        </BionicText>
        <BionicText style={[styles.instructionText, { color: colors.base0 }]}>
          3. Create a new task to test auto-split
        </BionicText>
        <BionicText style={[styles.instructionText, { color: colors.base0 }]}>
          4. Check console for auto-split logs
        </BionicText>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    gap: 6,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 12,
  },
  tasksList: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  instructions: {
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
