/**
 * Capture Service - API integration for task capture functionality
 */

import type {
  CaptureResponse,
  SaveCaptureResponse,
  ClarifyResponse,
  Task,
  MicroStep,
} from '../types/capture';
import { API_BASE_URL } from '@/src/api/config';

/**
 * Capture a task and decompose it into micro-steps
 *
 * @param query - User's task description
 * @param userId - Current user ID
 * @returns Promise with task, micro-steps, and clarifications
 * @throws Error if API call fails
 */
export async function captureTask(
  query: string,
  userId: string
): Promise<CaptureResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        user_id: userId,
        mode: 'auto',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Capture failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Capture failed');
  }
}

/**
 * Save captured task and micro-steps to database
 *
 * @param task - Task object from capture response
 * @param microSteps - Array of micro-steps
 * @param userId - Current user ID
 * @param projectId - Project ID (defaults to 'default-project')
 * @returns Promise with save confirmation
 * @throws Error if save fails
 */
export async function saveCapture(
  task: Task,
  microSteps: MicroStep[],
  userId: string,
  projectId: string = 'default-project'
): Promise<SaveCaptureResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/capture/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task,
        micro_steps: microSteps,
        user_id: userId,
        project_id: projectId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Save failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Save failed');
  }
}

/**
 * Submit clarification answers and re-classify micro-steps
 *
 * @param microSteps - Array of micro-steps from capture response
 * @param answers - Object mapping field names to user answers
 * @returns Promise with updated micro-steps and clarifications
 * @throws Error if clarify fails
 */
export async function submitClarifications(
  microSteps: MicroStep[],
  answers: Record<string, string>
): Promise<ClarifyResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/capture/clarify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        micro_steps: microSteps,
        answers,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Clarify failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Clarify failed');
  }
}
