/**
 * Task Service - Epic 7 Task Splitting Integration
 *
 * Provides API methods for task splitting, micro-step management,
 * and ADHD-optimized task breakdown.
 *
 * Backend API: src/agents/split_proxy_agent.py
 * Endpoints: /api/v1/tasks/{id}/split, /api/v1/micro-steps/{id}/complete
 */

import { apiGet, apiPost, apiPatch } from '../api/apiClient';
import { API_BASE_URL } from '../api/config';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MicroStep {
  step_id: string;
  step_order: number;
  description: string;
  estimated_minutes: number; // 2-5 minutes (ADHD-optimized)
  delegation_mode: 'DO' | 'DO_WITH_ME' | 'DELEGATE' | 'DELETE';
  leaf_type: 'DIGITAL' | 'HUMAN';
  is_completed: boolean;
  completed_at?: string;
}

export interface TaskScope {
  scope: 'SIMPLE' | 'MULTI' | 'PROJECT';
  estimated_total_minutes: number;
  suggested_step_count: number;
}

export interface SplitTaskRequest {
  mode?: 'adhd' | 'default';
  user_id?: string;
}

export interface SplitTaskResponse {
  task_id: string;
  scope: 'SIMPLE' | 'MULTI' | 'PROJECT';
  micro_steps: MicroStep[];
  delegation_suggestions?: string[];
  total_estimated_minutes: number;
  message?: string;
}

export interface Task {
  task_id: string;
  title: string;
  description?: string;
  estimated_hours?: number;
  status: 'pending' | 'in_progress' | 'completed';
  micro_steps?: MicroStep[];
  created_at: string;
  updated_at: string;
}

export interface CompleteMicroStepResponse {
  step_id: string;
  is_completed: boolean;
  xp_awarded: number;
  message: string;
}

export interface TaskProgressResponse {
  task_id: string;
  total_steps: number;
  completed_steps: number;
  progress_percent: number;
  estimated_time_remaining: number;
}

// ============================================================================
// Task Splitting Service
// ============================================================================

class TaskService {
  /**
   * Split a task into 2-5 minute micro-steps using AI
   *
   * POST /api/v1/tasks/{task_id}/split
   *
   * @param taskId - UUID of task to split
   * @param options - Split options (mode, user_id)
   * @returns Split response with micro-steps
   *
   * @example
   * const result = await taskService.splitTask('task-uuid-123', { mode: 'adhd' });
   * console.log(result.micro_steps); // Array of 3-5 micro-steps
   */
  async splitTask(
    taskId: string,
    options: SplitTaskRequest = {}
  ): Promise<SplitTaskResponse> {
    const response = await apiPost(`${API_BASE_URL}/tasks/${taskId}/split`, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to split task: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get task with all micro-steps
   *
   * GET /api/v1/tasks/{task_id}
   *
   * @param taskId - UUID of task
   * @returns Task with micro-steps array
   */
  async getTaskWithMicroSteps(taskId: string): Promise<Task> {
    const response = await apiGet(`${API_BASE_URL}/tasks/${taskId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }

    return await response.json();
  }

  /**
   * Mark micro-step as complete and award XP
   *
   * PATCH /api/v1/micro-steps/{step_id}/complete
   *
   * @param stepId - UUID of micro-step
   * @returns Completion response with XP awarded
   */
  async completeMicroStep(stepId: string): Promise<CompleteMicroStepResponse> {
    const response = await apiPatch(`${API_BASE_URL}/micro-steps/${stepId}/complete`);

    if (!response.ok) {
      throw new Error('Failed to complete micro-step');
    }

    return await response.json();
  }

  /**
   * Get task completion progress
   *
   * GET /api/v1/tasks/{task_id}/progress
   *
   * @param taskId - UUID of task
   * @returns Progress statistics
   */
  async getTaskProgress(taskId: string): Promise<TaskProgressResponse> {
    const response = await apiGet(`${API_BASE_URL}/tasks/${taskId}/progress`);

    if (!response.ok) {
      throw new Error('Failed to fetch task progress');
    }

    return await response.json();
  }

  /**
   * Determine task complexity before splitting
   *
   * Helper method to preview scope classification
   */
  estimateTaskScope(estimatedHours?: number): TaskScope {
    if (!estimatedHours) {
      return {
        scope: 'MULTI',
        estimated_total_minutes: 30,
        suggested_step_count: 5,
      };
    }

    const minutes = estimatedHours * 60;

    if (minutes < 15) {
      return {
        scope: 'SIMPLE',
        estimated_total_minutes: minutes,
        suggested_step_count: 2,
      };
    } else if (minutes > 60) {
      return {
        scope: 'PROJECT',
        estimated_total_minutes: minutes,
        suggested_step_count: 7,
      };
    } else {
      return {
        scope: 'MULTI',
        estimated_total_minutes: minutes,
        suggested_step_count: Math.ceil(minutes / 5), // ~5 min per step
      };
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();

// Helper to patch since apiClient doesn't have PATCH
async function apiPatch(url: string, body?: any): Promise<Response> {
  const { apiFetch } = await import('../api/apiClient');
  return apiFetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
