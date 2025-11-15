/**
 * TaskBreakdownModal - Epic 7 Task Splitting Component
 *
 * Displays AI-powered task breakdown into 2-5 minute micro-steps.
 * Integrates with Split Proxy Agent backend API.
 *
 * Reference: FE-11 spec, Epic 7 Frontend Integration
 * Backend: src/agents/split_proxy_agent.py (669 lines)
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import BionicText from '../shared/BionicText';
import { CheckCircle, X, Clock, Sparkles } from 'lucide-react-native';
import { taskService, type MicroStep } from '@/src/services/taskService';

// ============================================================================
// Props & Types
// ============================================================================

export interface TaskBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  estimatedTime?: number;
  mode?: 'adhd' | 'default';
  onBreakdownComplete?: (microSteps: MicroStep[]) => void;
}

// ============================================================================
// Component
// ============================================================================

export default function TaskBreakdownModal({
  visible,
  onClose,
  taskId,
  taskTitle,
  taskDescription,
  estimatedTime = 30,
  mode = 'adhd',
  onBreakdownComplete,
}: TaskBreakdownModalProps) {
  const { colors } = useTheme();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [microSteps, setMicroSteps] = useState<MicroStep[]>([]);
  const [scope, setScope] = useState<'SIMPLE' | 'MULTI' | 'PROJECT'>('MULTI');

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Call Split Proxy Agent API to break down task
   */
  const handleSplitTask = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await taskService.splitTask(taskId, { mode });

      setMicroSteps(result.micro_steps);
      setScope(result.scope);
      onBreakdownComplete?.(result.micro_steps);

      // Success feedback
      console.log(
        `✅ Task split into ${result.micro_steps.length} micro-steps (${result.scope} scope)`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to split task';
      setError(message);
      console.error('Task splitting error:', err);

      Alert.alert('Splitting Failed', message, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark micro-step as complete
   */
  const handleCompleteStep = async (stepId: string) => {
    try {
      const result = await taskService.completeMicroStep(stepId);

      // Update local state
      setMicroSteps((prev) =>
        prev.map((step) =>
          step.step_id === stepId ? { ...step, is_completed: true } : step
        )
      );

      console.log(`✓ Step completed! +${result.xp_awarded} XP`);
    } catch (err) {
      console.error('Failed to complete step:', err);
    }
  };

  /**
   * Reset and close modal
   */
  const handleClose = () => {
    setMicroSteps([]);
    setError(null);
    onClose();
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const getScopeColor = () => {
    switch (scope) {
      case 'SIMPLE':
        return colors.green;
      case 'MULTI':
        return colors.blue;
      case 'PROJECT':
        return colors.orange;
      default:
        return colors.base01;
    }
  };

  const getDelegationColor = (mode: string) => {
    switch (mode) {
      case 'DO':
        return colors.green;
      case 'DO_WITH_ME':
        return colors.blue;
      case 'DELEGATE':
        return colors.orange;
      case 'DELETE':
        return colors.red;
      default:
        return colors.base01;
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.base02 }]}>
          {/* Header */}
          <View style={styles.header}>
            <BionicText style={[styles.title, { color: colors.cyan }]}>
              🧠 Break Down Task
            </BionicText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.base01} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Task Info */}
            <View style={styles.taskInfo}>
              <BionicText style={[styles.taskTitle, { color: colors.base0 }]}>
                {taskTitle}
              </BionicText>

              {taskDescription && (
                <BionicText style={[styles.description, { color: colors.base01 }]}>
                  {taskDescription}
                </BionicText>
              )}

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Clock size={14} color={colors.base01} />
                  <BionicText style={[styles.metaText, { color: colors.base01 }]}>
                    {estimatedTime} min
                  </BionicText>
                </View>

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

                {microSteps.length > 0 && (
                  <View
                    style={[styles.scopeBadge, { backgroundColor: getScopeColor() + '30' }]}
                  >
                    <BionicText style={[styles.scopeText, { color: getScopeColor() }]}>
                      {scope}
                    </BionicText>
                  </View>
                )}
              </View>
            </View>

            {/* Error State */}
            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.red + '20' }]}>
                <BionicText style={[styles.errorText, { color: colors.red }]}>
                  {error}
                </BionicText>
              </View>
            )}

            {/* Split Button or Steps */}
            {microSteps.length === 0 ? (
              <TouchableOpacity
                style={[
                  styles.splitButton,
                  { backgroundColor: loading ? colors.base01 : colors.green },
                ]}
                onPress={handleSplitTask}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color={colors.base03} />
                    <BionicText style={[styles.buttonText, { color: colors.base03 }]}>
                      Splitting Task...
                    </BionicText>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} color={colors.base03} />
                    <BionicText style={[styles.buttonText, { color: colors.base03 }]}>
                      Split Into Micro-Steps
                    </BionicText>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              /* Micro-Steps List */
              <View style={styles.stepsContainer}>
                <BionicText style={[styles.stepsHeader, { color: colors.green }]}>
                  ✓ Breakdown Complete! ({microSteps.length} steps)
                </BionicText>

                {microSteps.map((step, index) => (
                  <TouchableOpacity
                    key={step.step_id}
                    style={[
                      styles.stepCard,
                      { backgroundColor: colors.base03 },
                      step.is_completed && styles.completedStepCard,
                    ]}
                    onPress={() => !step.is_completed && handleCompleteStep(step.step_id)}
                  >
                    {/* Step Header */}
                    <View style={styles.stepHeader}>
                      <View style={styles.stepLeft}>
                        {step.is_completed ? (
                          <CheckCircle size={20} color={colors.green} fill={colors.green} />
                        ) : (
                          <BionicText style={[styles.stepNumber, { color: colors.cyan }]}>
                            {index + 1}
                          </BionicText>
                        )}

                        <BionicText
                          style={[
                            styles.stepTime,
                            { color: colors.base01 },
                            step.is_completed && styles.completedText,
                          ]}
                        >
                          {step.estimated_minutes}m
                        </BionicText>
                      </View>

                      <View
                        style={[
                          styles.delegationBadge,
                          { backgroundColor: getDelegationColor(step.delegation_mode) + '30' },
                        ]}
                      >
                        <BionicText
                          style={[
                            styles.delegationText,
                            { color: getDelegationColor(step.delegation_mode) },
                          ]}
                        >
                          {step.delegation_mode}
                        </BionicText>
                      </View>
                    </View>

                    {/* Step Description */}
                    <BionicText
                      style={[
                        styles.stepDescription,
                        { color: colors.base0 },
                        step.is_completed && styles.completedText,
                      ]}
                    >
                      {step.description}
                    </BionicText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          {microSteps.length > 0 && (
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.cyan }]}
              onPress={handleClose}
            >
              <BionicText style={[styles.doneButtonText, { color: colors.base03 }]}>
                Done
              </BionicText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
  },
  taskInfo: {
    gap: 12,
    marginBottom: 20,
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
  metaRow: {
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
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scopeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scopeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  splitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  stepsHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepCard: {
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  completedStepCard: {
    opacity: 0.6,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  stepTime: {
    fontSize: 12,
  },
  delegationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  delegationText: {
    fontSize: 9,
    fontWeight: '700',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  doneButton: {
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
