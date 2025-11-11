/**
 * Onboarding Service - API integration for onboarding data
 * Handles submission of user onboarding preferences to backend
 *
 * Matches backend API endpoints:
 * - PUT /api/v1/users/{user_id}/onboarding - Upsert data
 * - GET /api/v1/users/{user_id}/onboarding - Get data
 * - POST /api/v1/users/{user_id}/onboarding/complete - Mark complete/skip
 * - DELETE /api/v1/users/{user_id}/onboarding - Delete data
 */

import { API_BASE_URL } from './config';
import { apiGet, apiPost, apiPut, apiDelete } from '@/src/api/apiClient';
import type { OnboardingData, DailySchedule } from '@/src/types/onboarding';

/**
 * Backend response format for onboarding data
 */
export interface OnboardingResponse {
  user_id: string;
  work_preference: string | null;
  adhd_support_level: number | null;
  adhd_challenges: string[] | null;
  daily_schedule: DailySchedule | null;
  productivity_goals: string[] | null;
  chatgpt_export_prompt: string | null;
  chatgpt_exported_at: string | null;
  onboarding_completed: boolean;
  onboarding_skipped: boolean;
  completed_at: string | null;
  skipped_at: string | null;
  created_at: string;
  updated_at: string;
}

class OnboardingService {
  /**
   * Upsert (create or update) onboarding data
   * Maps frontend OnboardingData to backend API format
   */
  async upsertOnboarding(userId: string, data: Partial<OnboardingData>): Promise<OnboardingResponse> {
    try {
      // Map frontend fields to backend format
      const requestBody: any = {};

      if (data.workPreference !== undefined) {
        requestBody.work_preference = data.workPreference;
      }

      if (data.adhdSupportLevel !== undefined) {
        requestBody.adhd_support_level = data.adhdSupportLevel;
      }

      if (data.adhdChallenges !== undefined) {
        requestBody.adhd_challenges = data.adhdChallenges;
      }

      if (data.dailySchedule !== undefined) {
        requestBody.daily_schedule = data.dailySchedule;
      }

      if (data.productivityGoals !== undefined) {
        // Convert ProductivityGoal[] to string[] (just the types)
        requestBody.productivity_goals = data.productivityGoals.map(g => g.type);
      }

      const response = await apiPut(
        `${API_BASE_URL}/api/v1/users/${userId}/onboarding`,
        requestBody
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to update onboarding data');
      }

      return await response.json();
    } catch (error) {
      console.error('Onboarding upsert error:', error);
      throw error;
    }
  }

  /**
   * Get onboarding data for a user
   */
  async getOnboarding(userId: string): Promise<OnboardingResponse> {
    try {
      const response = await apiGet(`${API_BASE_URL}/api/v1/users/${userId}/onboarding`);

      if (!response.ok) {
        if (response.status === 404) {
          // User hasn't started onboarding yet
          throw new Error('Onboarding not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch onboarding data');
      }

      return await response.json();
    } catch (error) {
      console.error('Onboarding fetch error:', error);
      throw error;
    }
  }

  /**
   * Mark onboarding as completed or skipped
   */
  async markComplete(userId: string, completed: boolean): Promise<OnboardingResponse> {
    try {
      const response = await apiPost(
        `${API_BASE_URL}/api/v1/users/${userId}/onboarding/complete`,
        { completed }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to mark onboarding complete');
      }

      return await response.json();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      throw error;
    }
  }

  /**
   * Delete onboarding data (reset)
   */
  async deleteOnboarding(userId: string): Promise<void> {
    try {
      const response = await apiDelete(`${API_BASE_URL}/api/v1/users/${userId}/onboarding`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to delete onboarding data');
      }

      // 204 No Content - successful deletion
    } catch (error) {
      console.error('Onboarding deletion error:', error);
      throw error;
    }
  }

  /**
   * Submit complete onboarding data (legacy method for backward compatibility)
   * Now uses upsert internally
   */
  async submitOnboarding(userId: string, data: OnboardingData): Promise<OnboardingResponse> {
    return this.upsertOnboarding(userId, data);
  }
}

export const onboardingService = new OnboardingService();
