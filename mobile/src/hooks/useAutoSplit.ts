/**
 * useAutoSplit Hook - Auto-Split Tasks in ADHD Mode
 *
 * Automatically splits tasks > threshold when ADHD Mode is enabled.
 * Integrates with task creation flow to provide seamless micro-step breakdown.
 *
 * Epic 7 Frontend Integration (Day 4-5)
 */

import { useEffect, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { taskService, type Task, type MicroStep } from '../services/taskService';

// ============================================================================
// Types
// ============================================================================

export interface AutoSplitResult {
  taskId: string;
  wasSplit: boolean;
  microSteps?: MicroStep[];
  error?: string;
}

export interface AutoSplitOptions {
  onSplitComplete?: (result: AutoSplitResult) => void;
  onSplitError?: (error: Error) => void;
  enableLogging?: boolean;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for auto-splitting tasks based on ADHD Mode settings
 *
 * @param options - Callbacks and configuration
 * @returns Object with autoSplit function and status
 *
 * @example
 * const { autoSplit, isEnabled } = useAutoSplit({
 *   onSplitComplete: (result) => console.log('Split!', result)
 * });
 *
 * // After creating a task:
 * await autoSplit(newTask);
 */
export function useAutoSplit(options: AutoSplitOptions = {}) {
  const { settings } = useSettings();
  const { onSplitComplete, onSplitError, enableLogging = true } = options;

  const isEnabled = settings.adhdMode;
  const threshold = settings.autoSplitThreshold;

  /**
   * Determine if task should be auto-split
   */
  const shouldAutoSplit = useCallback(
    (task: Partial<Task>): boolean => {
      if (!isEnabled) return false;

      // Skip if task already has micro-steps
      if (task.micro_steps && task.micro_steps.length > 0) return false;

      // Check estimated time
      const estimatedMinutes = task.estimated_hours ? task.estimated_hours * 60 : null;

      if (estimatedMinutes && estimatedMinutes > threshold) {
        return true;
      }

      // Default: don't split if we can't determine time
      return false;
    },
    [isEnabled, threshold]
  );

  /**
   * Auto-split a task if it meets criteria
   */
  const autoSplit = useCallback(
    async (task: Partial<Task> & { task_id: string }): Promise<AutoSplitResult> => {
      const result: AutoSplitResult = {
        taskId: task.task_id,
        wasSplit: false,
      };

      try {
        // Check if should split
        if (!shouldAutoSplit(task)) {
          if (enableLogging) {
            console.log(
              `⏭️ Skipping auto-split for task ${task.task_id} (ADHD Mode: ${isEnabled}, Time: ${task.estimated_hours}h)`
            );
          }
          return result;
        }

        // Perform split
        if (enableLogging) {
          console.log(`🧠 Auto-splitting task ${task.task_id} (ADHD Mode enabled)`);
        }

        const splitResult = await taskService.splitTask(task.task_id, {
          mode: 'adhd',
        });

        result.wasSplit = true;
        result.microSteps = splitResult.micro_steps;

        if (enableLogging) {
          console.log(
            `✅ Auto-split complete: ${splitResult.micro_steps.length} micro-steps created`
          );
        }

        onSplitComplete?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Auto-split failed');
        result.error = err.message;

        if (enableLogging) {
          console.error(`❌ Auto-split failed for task ${task.task_id}:`, err.message);
        }

        onSplitError?.(err);
        return result;
      }
    },
    [shouldAutoSplit, isEnabled, onSplitComplete, onSplitError, enableLogging]
  );

  /**
   * Batch auto-split multiple tasks
   */
  const autoSplitBatch = useCallback(
    async (tasks: Array<Partial<Task> & { task_id: string }>): Promise<AutoSplitResult[]> => {
      const results = await Promise.all(tasks.map((task) => autoSplit(task)));

      const splitCount = results.filter((r) => r.wasSplit).length;

      if (enableLogging && splitCount > 0) {
        console.log(`✅ Batch auto-split: ${splitCount}/${tasks.length} tasks split`);
      }

      return results;
    },
    [autoSplit, enableLogging]
  );

  /**
   * Log ADHD Mode changes
   */
  useEffect(() => {
    if (enableLogging) {
      console.log(
        `🧠 ADHD Mode: ${isEnabled ? 'ON' : 'OFF'} (Threshold: ${threshold} minutes)`
      );
    }
  }, [isEnabled, threshold, enableLogging]);

  return {
    autoSplit,
    autoSplitBatch,
    shouldAutoSplit,
    isEnabled,
    threshold,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default useAutoSplit;
