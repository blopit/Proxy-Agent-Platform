/**
 * OnboardingContext - Global state management for user onboarding
 * Persists onboarding data to AsyncStorage and syncs with backend API
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  OnboardingData,
  OnboardingProgress,
  WorkPreference,
  ADHDSupportLevel,
  DailySchedule,
  ProductivityGoal,
} from '@/src/types/onboarding';
import { DEFAULT_ONBOARDING_DATA as defaultData, TOTAL_ONBOARDING_STEPS, ONBOARDING_STEPS } from '@/src/types/onboarding';
import { onboardingService } from '@/src/services/onboardingService';
import { useAuth } from '@/src/contexts/AuthContext';

const STORAGE_KEY = '@proxy_agent:onboarding_data';
const PROGRESS_KEY = '@proxy_agent:onboarding_progress';

interface OnboardingContextValue {
  // Data
  data: OnboardingData;
  progress: OnboardingProgress;

  // Update methods
  setWorkPreference: (preference: WorkPreference) => Promise<void>;
  setChallenges: (challenges: string[]) => Promise<void>;
  setADHDSupportLevel: (level: ADHDSupportLevel, challenges?: string[]) => Promise<void>;
  setDailySchedule: (schedule: DailySchedule) => Promise<void>;
  setProductivityGoals: (goals: ProductivityGoal[]) => Promise<void>;

  // Progress methods
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  goToStep: (step: number) => Promise<void>;
  markStepComplete: (stepId: string) => Promise<void>;

  // Completion methods
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;

  // State
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Get user from AuthContext for backend sync
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 0,
    totalSteps: TOTAL_ONBOARDING_STEPS,
    completedSteps: [],
    canSkip: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  /**
   * Load onboarding data from AsyncStorage on mount
   */
  useEffect(() => {
    loadOnboardingData();
  }, []);

  const loadOnboardingData = async () => {
    try {
      console.log('[OnboardingContext] Loading onboarding data from AsyncStorage...');
      setIsLoading(true);

      // Load data
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('[OnboardingContext] Stored data exists:', !!storedData);

      if (storedData) {
        const parsedData = JSON.parse(storedData) as OnboardingData;
        console.log('[OnboardingContext] Parsed data:', {
          completedAt: parsedData.completedAt,
          skipped: parsedData.skipped,
        });
        setData(parsedData);

        // Check if onboarding was completed or skipped
        if (parsedData.completedAt || parsedData.skipped) {
          console.log('[OnboardingContext] Onboarding was completed/skipped, setting hasCompletedOnboarding = true');
          setHasCompletedOnboarding(true);
        } else {
          console.log('[OnboardingContext] Onboarding not completed, hasCompletedOnboarding = false');
        }
      } else {
        console.log('[OnboardingContext] No stored data, hasCompletedOnboarding = false');
      }

      // Load progress
      const storedProgress = await AsyncStorage.getItem(PROGRESS_KEY);
      if (storedProgress) {
        setProgress(JSON.parse(storedProgress) as OnboardingProgress);
      }

      console.log('[OnboardingContext] Loading complete, isLoading = false');
    } catch (error) {
      console.error('[OnboardingContext] Failed to load onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save onboarding data to AsyncStorage and sync to backend
   */
  const saveData = useCallback(async (newData: OnboardingData) => {
    try {
      // Save locally first (fast, offline-capable)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);

      // Sync to backend (async, gracefully handles failures)
      if (user?.user_id) {
        try {
          await onboardingService.upsertOnboarding(user.user_id, newData);
        } catch (backendError) {
          console.warn('Backend sync failed, continuing with local data:', backendError);
          // Don't throw - local data is saved, backend will sync on next attempt
        }
      }
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      throw error;
    }
  }, [user]);

  /**
   * Save progress to AsyncStorage
   */
  const saveProgress = useCallback(async (newProgress: OnboardingProgress) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
      throw error;
    }
  }, []);

  /**
   * Update work preference
   */
  const setWorkPreference = useCallback(
    async (preference: WorkPreference) => {
      const newData = { ...data, workPreference: preference };
      await saveData(newData);
    },
    [data, saveData]
  );

  /**
   * Update challenges
   */
  const setChallenges = useCallback(
    async (challenges: string[]) => {
      const newData = { ...data, adhdChallenges: challenges };
      await saveData(newData);
    },
    [data, saveData]
  );

  /**
   * Update ADHD support level
   */
  const setADHDSupportLevel = useCallback(
    async (level: ADHDSupportLevel, challenges?: string[]) => {
      const newData = {
        ...data,
        adhdSupportLevel: level,
        adhdChallenges: challenges || data.adhdChallenges,
      };
      await saveData(newData);
    },
    [data, saveData]
  );

  /**
   * Update daily schedule
   */
  const setDailySchedule = useCallback(
    async (schedule: DailySchedule) => {
      const newData = { ...data, dailySchedule: schedule };
      await saveData(newData);
    },
    [data, saveData]
  );

  /**
   * Update productivity goals
   */
  const setProductivityGoals = useCallback(
    async (goals: ProductivityGoal[]) => {
      const newData = { ...data, productivityGoals: goals };
      await saveData(newData);
    },
    [data, saveData]
  );


  /**
   * Move to next step
   */
  const nextStep = useCallback(async () => {
    const newProgress = {
      ...progress,
      currentStep: Math.min(progress.currentStep + 1, progress.totalSteps - 1),
    };
    await saveProgress(newProgress);
  }, [progress, saveProgress]);

  /**
   * Move to previous step
   */
  const previousStep = useCallback(async () => {
    const newProgress = {
      ...progress,
      currentStep: Math.max(progress.currentStep - 1, 0),
    };
    await saveProgress(newProgress);
  }, [progress, saveProgress]);

  /**
   * Jump to specific step
   */
  const goToStep = useCallback(
    async (step: number) => {
      const newProgress = {
        ...progress,
        currentStep: Math.max(0, Math.min(step, progress.totalSteps - 1)),
      };
      await saveProgress(newProgress);
    },
    [progress, saveProgress]
  );

  /**
   * Mark a specific step as complete
   */
  const markStepComplete = useCallback(
    async (stepId: string) => {
      if (!progress.completedSteps.includes(stepId)) {
        const newProgress = {
          ...progress,
          completedSteps: [...progress.completedSteps, stepId],
        };
        await saveProgress(newProgress);
      }
    },
    [progress, saveProgress]
  );

  /**
   * Complete onboarding and submit data
   */
  const completeOnboarding = useCallback(async () => {
    const completedData: OnboardingData = {
      ...data,
      completedAt: new Date().toISOString(),
      skipped: false,
    };

    // Save locally
    await saveData(completedData);
    setHasCompletedOnboarding(true);

    // Mark as completed on backend
    if (user?.user_id) {
      try {
        await onboardingService.markComplete(user.user_id, true);
      } catch (error) {
        console.error('Failed to mark onboarding complete on backend:', error);
        // Continue anyway - local state is updated
      }
    }
  }, [data, saveData, user]);

  /**
   * Skip onboarding
   */
  const skipOnboarding = useCallback(async () => {
    const skippedData: OnboardingData = {
      ...defaultData,
      skipped: true,
      completedAt: new Date().toISOString(),
    };

    // Save locally
    await saveData(skippedData);
    setHasCompletedOnboarding(true);

    // Mark as skipped on backend
    if (user?.user_id) {
      try {
        await onboardingService.markComplete(user.user_id, false); // false = skipped
      } catch (error) {
        console.error('Failed to mark onboarding skipped on backend:', error);
        // Continue anyway - local state is updated
      }
    }
  }, [saveData, user]);

  /**
   * Reset onboarding (for testing or re-onboarding)
   */
  const resetOnboarding = useCallback(async () => {
    try {
      // Clear local storage
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(PROGRESS_KEY);
      setData(defaultData);
      setProgress({
        currentStep: 0,
        totalSteps: TOTAL_ONBOARDING_STEPS,
        completedSteps: [],
        canSkip: true,
      });
      setHasCompletedOnboarding(false);

      // Delete from backend
      if (user?.user_id) {
        try {
          await onboardingService.deleteOnboarding(user.user_id);
        } catch (error) {
          console.warn('Failed to delete onboarding from backend:', error);
          // Continue anyway - local state is cleared
        }
      }
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
      throw error;
    }
  }, [user]);

  const value: OnboardingContextValue = {
    data,
    progress,
    setWorkPreference,
    setChallenges,
    setADHDSupportLevel,
    setDailySchedule,
    setProductivityGoals,
    nextStep,
    previousStep,
    goToStep,
    markStepComplete,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    isLoading,
    hasCompletedOnboarding,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

/**
 * Hook to access onboarding context
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
