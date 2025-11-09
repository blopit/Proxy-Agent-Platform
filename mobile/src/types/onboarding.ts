/**
 * Onboarding Types - Data models for user onboarding flow
 * Collects user preferences and profile information
 */

/**
 * Work preference mode
 */
export type WorkPreference = 'remote' | 'hybrid' | 'office' | 'flexible';

/**
 * ADHD support level (1-10 scale)
 * 1 = Minimal support needed
 * 10 = Maximum support needed
 */
export type ADHDSupportLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Time of day preference for work
 */
export type TimePreference = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';

/**
 * Days of the week user is available
 */
export interface WeeklyAvailability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

/**
 * Daily schedule and availability preferences
 */
export interface DailySchedule {
  preferredStartTime: string; // HH:mm format (e.g., "09:00")
  preferredEndTime: string; // HH:mm format (e.g., "17:00")
  timePreference: TimePreference;
  weeklyAvailability: WeeklyAvailability;
  flexibleSchedule: boolean;
}

/**
 * Productivity goal type
 */
export type ProductivityGoalType =
  | 'task_completion'
  | 'focus_time'
  | 'project_delivery'
  | 'habit_building'
  | 'work_life_balance'
  | 'creative_output'
  | 'learning'
  | 'other';

/**
 * Individual productivity goal
 */
export interface ProductivityGoal {
  id: string;
  type: ProductivityGoalType;
  title: string;
  description?: string;
  targetValue?: number; // Optional numeric target (e.g., 5 tasks per day)
  targetUnit?: string; // Optional unit (e.g., "tasks", "hours", "projects")
}

/**
 * Complete onboarding data
 */
export interface OnboardingData {
  // Work preferences
  workPreference: WorkPreference | null;

  // ADHD support
  adhdSupportLevel: ADHDSupportLevel | null;
  adhdChallenges?: string[]; // Optional list of specific challenges

  // Schedule
  dailySchedule: DailySchedule | null;

  // Goals
  productivityGoals: ProductivityGoal[];

  // Metadata
  completedAt?: string; // ISO timestamp
  skipped: boolean; // Whether user skipped onboarding
}

/**
 * Onboarding progress tracking
 */
export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[]; // Array of step IDs that are completed
  canSkip: boolean;
}

/**
 * Default onboarding data
 */
export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  workPreference: null,
  adhdSupportLevel: null,
  adhdChallenges: [],
  dailySchedule: null,
  productivityGoals: [],
  skipped: false,
};

/**
 * Default weekly availability (weekdays only)
 */
export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailability = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

/**
 * Default daily schedule (9-5)
 */
export const DEFAULT_DAILY_SCHEDULE: DailySchedule = {
  preferredStartTime: '09:00',
  preferredEndTime: '17:00',
  timePreference: 'morning',
  weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
  flexibleSchedule: false,
};

/**
 * Onboarding step IDs
 */
export const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  WORK_PREFERENCES: 'work_preferences',
  ADHD_SUPPORT: 'adhd_support',
  DAILY_SCHEDULE: 'daily_schedule',
  PRODUCTIVITY_GOALS: 'productivity_goals',
  COMPLETE: 'complete',
} as const;

/**
 * Total number of onboarding steps
 */
export const TOTAL_ONBOARDING_STEPS = Object.keys(ONBOARDING_STEPS).length;
