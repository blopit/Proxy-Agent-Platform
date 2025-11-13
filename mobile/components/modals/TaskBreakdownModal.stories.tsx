/**
 * TaskBreakdownModal Stories - Task Splitting Component
 * Based on: FE-11 spec and Epic 7 Frontend Integration
 *
 * Demonstrates task breakdown into 2-5 minute micro-steps
 * Reference: agent_resources/planning/current_sprint.md
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/src/theme/ThemeContext';
import BionicText from '../shared/BionicText';

// Placeholder component until real one is implemented
interface TaskBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  taskTitle: string;
  taskDescription?: string;
  estimatedTime?: number;
  mode?: 'adhd' | 'default';
  onBreakdownComplete?: (microSteps: string[]) => void;
}

function TaskBreakdownModal({
  visible,
  onClose,
  taskTitle,
  taskDescription,
  estimatedTime = 30,
  mode = 'adhd',
  onBreakdownComplete,
}: TaskBreakdownModalProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [microSteps, setMicroSteps] = useState<string[]>([]);

  const handleSplitTask = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const steps = [
        'Open code editor and locate main.py file',
        'Review current authentication logic',
        'Add OAuth library import at top of file',
        'Create handleGoogleAuth function with 3 parameters',
        'Test with sample credentials (2-3 minutes)',
        'Add error handling with try/catch block',
      ];
      setMicroSteps(steps);
      setLoading(false);
      onBreakdownComplete?.(steps);
    }, 2000);
  };

  if (!visible) return null;

  return (
    <View style={[styles.modal, { backgroundColor: colors.base02 }]}>
      <BionicText style={[styles.title, { color: colors.cyan }]}>
        Break Down Task
      </BionicText>

      <BionicText style={[styles.taskTitle, { color: colors.base0 }]}>
        {taskTitle}
      </BionicText>

      {taskDescription && (
        <BionicText style={[styles.description, { color: colors.base01 }]}>
          {taskDescription}
        </BionicText>
      )}

      <View style={styles.estimateRow}>
        <BionicText style={[styles.estimateLabel, { color: colors.base01 }]}>
          Estimated: {estimatedTime} minutes
        </BionicText>
        <View
          style={[
            styles.modeBadge,
            { backgroundColor: mode === 'adhd' ? colors.orange : colors.blue },
          ]}
        >
          <BionicText style={[styles.modeText, { color: colors.base03 }]}>
            {mode.toUpperCase()} MODE
          </BionicText>
        </View>
      </View>

      {microSteps.length === 0 ? (
        <View style={styles.splitButton}>
          <BionicText
            style={[styles.buttonText, { color: colors.base03 }]}
            onPress={loading ? undefined : handleSplitTask}
          >
            {loading ? 'Splitting Task...' : 'Split Into Micro-Steps'}
          </BionicText>
        </View>
      ) : (
        <View style={styles.stepsContainer}>
          <BionicText style={[styles.stepsHeader, { color: colors.green }]}>
            ✓ Breakdown Complete!
          </BionicText>
          {microSteps.map((step, index) => (
            <View key={index} style={[styles.stepCard, { backgroundColor: colors.base03 }]}>
              <BionicText style={[styles.stepNumber, { color: colors.cyan }]}>
                Step {index + 1}
              </BionicText>
              <BionicText style={[styles.stepText, { color: colors.base0 }]}>
                {step}
              </BionicText>
            </View>
          ))}
        </View>
      )}

      <BionicText
        style={[styles.closeButton, { color: colors.red }]}
        onPress={onClose}
      >
        Close
      </BionicText>
    </View>
  );
}

const meta = {
  title: 'Modals/TaskBreakdownModal',
  component: TaskBreakdownModal,
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
} satisfies Meta<typeof TaskBreakdownModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - Simple Task Breakdown
 * Shows modal for breaking down a 30-minute task
 */
export const Default: Story = {
  args: {
    visible: true,
    onClose: () => Alert.alert('Modal closed'),
    taskTitle: 'Implement Google OAuth',
    taskDescription: 'Add Google authentication to the login page',
    estimatedTime: 30,
    mode: 'adhd',
  },
};

/**
 * Long Task - 2 Hour Task
 * Demonstrates breakdown for longer tasks
 */
export const LongTask: Story = {
  args: {
    visible: true,
    onClose: () => Alert.alert('Modal closed'),
    taskTitle: 'Build complete user dashboard',
    taskDescription:
      'Create responsive dashboard with charts, metrics, and real-time data',
    estimatedTime: 120,
    mode: 'adhd',
  },
};

/**
 * Default Mode - Non-ADHD Mode
 * Shows standard task breakdown (less granular)
 */
export const DefaultMode: Story = {
  args: {
    visible: true,
    onClose: () => Alert.alert('Modal closed'),
    taskTitle: 'Write API documentation',
    taskDescription: 'Document all REST endpoints with examples',
    estimatedTime: 45,
    mode: 'default',
  },
};

/**
 * Interactive - Full User Flow
 * User can interact with split button and see results
 */
export const Interactive: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    const { colors } = useTheme();

    const handleComplete = (steps: string[]) => {
      console.log('Micro-steps created:', steps);
      Alert.alert(
        'Success!',
        `Task split into ${steps.length} micro-steps (2-5 min each)`
      );
    };

    return (
      <View>
        <BionicText style={[styles.info, { color: colors.base01 }]}>
          Click "Split Into Micro-Steps" to see AI breakdown
        </BionicText>

        <TaskBreakdownModal
          visible={visible}
          onClose={() => setVisible(false)}
          taskTitle="Set up CI/CD pipeline"
          taskDescription="Configure GitHub Actions for automated testing and deployment"
          estimatedTime: 60}
          mode="adhd"
          onBreakdownComplete={handleComplete}
        />

        {!visible && (
          <BionicText
            style={[styles.reopenButton, { color: colors.cyan }]}
            onPress={() => setVisible(true)}
          >
            Reopen Modal
          </BionicText>
        )}
      </View>
    );
  },
};

/**
 * With Real API Call - Loading State
 * Shows what happens during API call to backend
 */
export const WithAPICall: Story = {
  args: {
    visible: true,
    onClose: () => Alert.alert('Modal closed'),
    taskTitle: 'Optimize database queries',
    taskDescription: 'Improve performance of slow queries in production',
    estimatedTime: 90,
    mode: 'adhd',
    onBreakdownComplete: (steps) => {
      console.log('API returned:', steps);
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  estimateLabel: {
    fontSize: 14,
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  splitButton: {
    backgroundColor: '#2aa198',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepsContainer: {
    gap: 12,
    marginTop: 8,
  },
  stepsHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepCard: {
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    padding: 12,
  },
  info: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  reopenButton: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    padding: 16,
  },
});
