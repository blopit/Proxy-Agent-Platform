/**
 * Task Schema Types
 * Extended schema mapping Claude Task Master structure to our API responses
 * Combines capture response fields with card display requirements
 */

import type {
  CaptureResponse,
  CapturedTask,
  MicroStep,
  TaskBreakdown,
} from './capture';

/**
 * Task status aligned with Task Master schema
 */
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'done'
  | 'review'
  | 'blocked'
  | 'deferred'
  | 'cancelled';

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Leaf type classification for micro-steps
 */
export type LeafType = 'DIGITAL' | 'HUMAN' | 'unknown';

/**
 * Delegation mode for task execution
 */
export type DelegationMode = 'do' | 'do_with_me' | 'delegate' | 'delete';

/**
 * Extended task interface with Task Master fields
 * Combines API capture response with card display requirements
 */
export interface ExtendedTask extends CapturedTask {
  // Core Task Master fields
  id?: string; // Task ID (generated server-side)
  status?: TaskStatus; // Current task state
  dependencies?: string[]; // IDs of prerequisite tasks
  subtasks?: MicroStep[]; // Hierarchical nested tasks (micro-steps)
  complexityScore?: number; // Complexity score (1-10 scale)
  testStrategy?: string; // Verification approach

  // Metadata
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp when done

  // Context
  affectedAssets?: string[]; // Files/paths changed by task
  context?: string; // Additional task context
  assignee?: string; // User responsible

  // Progress tracking
  progress?: number; // Completion percentage (0-100)
  actual_hours?: number; // Time actually spent
}

/**
 * Card display properties derived from capture response
 * Used for rendering different card sizes
 */
export interface TaskCardProps {
  // Core display fields
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;

  // Time estimates
  estimated_hours?: number;
  estimated_minutes?: number;
  actual_hours?: number;

  // Classification
  tags: string[];
  leaf_type?: LeafType;
  is_digital?: boolean;

  // Breakdown
  micro_steps?: MicroStep[];
  breakdown?: TaskBreakdown;

  // Progress
  progress?: number;
  subtask_progress?: {
    completed: number;
    total: number;
    percentage: number;
  };

  // Metadata
  created_at?: string;
  updated_at?: string;

  // Dependencies
  dependencies?: string[];
  has_dependencies?: boolean;

  // Context
  context?: string;
  complexity_score?: number;
}

/**
 * Card size variants
 */
export type CardSize = 'nano' | 'mini' | 'medium' | 'big' | 'full';

/**
 * Card variant styling options
 */
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'flat';

/**
 * Convert CaptureResponse to TaskCardProps
 * Maps API response to card display properties
 *
 * @param response - Capture API response
 * @returns Task card display properties
 */
export function captureResponseToCardProps(
  response: CaptureResponse
): TaskCardProps {
  const { task, micro_steps, breakdown } = response;

  // Calculate if task is primarily digital
  const is_digital = breakdown.digital_count > breakdown.human_count;

  // Calculate subtask progress (all start at 0% until completed)
  const subtask_progress = {
    completed: 0,
    total: micro_steps.length,
    percentage: 0,
  };

  // Estimate minutes from hours
  const estimated_minutes = task.estimated_hours
    ? Math.round(task.estimated_hours * 60)
    : breakdown.total_minutes;

  return {
    title: task.title,
    description: task.description,
    status: 'pending' as TaskStatus,
    priority: task.priority.toLowerCase() as TaskPriority,
    estimated_hours: task.estimated_hours,
    estimated_minutes,
    tags: task.tags,
    is_digital,
    micro_steps,
    breakdown,
    progress: 0,
    subtask_progress,
    has_dependencies: false,
    created_at: new Date().toISOString(),
  };
}

/**
 * Get fields to display for a specific card size
 * Returns field visibility configuration
 *
 * @param size - Card size variant
 * @returns Field visibility configuration
 */
export function getCardFieldsForSize(size: CardSize) {
  switch (size) {
    case 'nano':
      return {
        title: true,
        statusIcon: true,
        estimatedTime: true,
        priorityIndicator: true,
        // Everything else hidden
        description: false,
        tags: false,
        microSteps: false,
        breakdown: false,
        dependencies: false,
      };

    case 'mini':
      return {
        title: true,
        statusBadge: true,
        priorityBadge: true,
        estimatedTime: true,
        tags: 2, // Show first 2 tags
        dueDate: true,
        nextAction: true,
        // Hidden fields
        description: false,
        microSteps: false,
        breakdown: false,
        dependencies: false,
      };

    case 'medium':
      return {
        title: true,
        description: '1line', // One line of description
        statusBadge: true,
        priorityBadge: true,
        estimatedTime: true,
        tags: true, // All tags
        subtaskProgress: true,
        dependenciesCount: true,
        digitalIndicator: true,
        // Hidden fields
        microSteps: false,
        breakdown: false,
      };

    case 'big':
      return {
        title: true,
        description: 'short', // Short description (2-3 lines)
        statusBadge: true,
        priorityBadge: true,
        estimatedTime: true,
        tags: true,
        microStepsPreview: 3, // Show first 3 micro-steps
        breakdownChart: true, // Pie chart
        subtaskProgress: true,
        dependenciesCount: true,
        digitalIndicator: true,
        actionButtons: true,
        // Hidden fields
        fullMicroSteps: false,
        audit: false,
      };

    case 'full':
      return {
        // Everything visible
        title: true,
        description: 'full',
        statusBadge: true,
        priorityBadge: true,
        estimatedTime: true,
        actualTime: true,
        tags: true,
        microSteps: true, // All micro-steps
        breakdown: true,
        subtaskProgress: true,
        dependencies: true, // Full list
        complexityScore: true,
        testStrategy: true,
        audit: true, // Created/updated timestamps
        attachments: true,
        actionButtons: true,
      };

    default:
      return getCardFieldsForSize('medium');
  }
}

/**
 * Micro-step with completion tracking
 */
export interface TrackedMicroStep extends MicroStep {
  completed?: boolean;
  started_at?: string;
  completed_at?: string;
}

/**
 * Task with full tracking data
 */
export interface TrackedTask extends ExtendedTask {
  micro_steps: TrackedMicroStep[];
  time_spent_minutes?: number;
  started_at?: string;
  paused_at?: string;
  is_active?: boolean;
}
