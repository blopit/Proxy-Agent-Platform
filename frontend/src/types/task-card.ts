/**
 * Task Card Management Type Definitions
 * Inspired by claude-task-master structure for card-based task visualization
 */

/**
 * Task status enumeration
 */
export enum CardTaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  DONE = "done",
  REVIEW = "review",
  DEFERRED = "deferred",
  CANCELLED = "cancelled",
}

/**
 * Task priority levels
 */
export enum CardTaskPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

/**
 * Subtask interface - smaller tasks that make up a parent task
 */
export interface CardSubtask {
  /** Unique identifier within parent task */
  id: number;
  /** Brief, descriptive title */
  title: string;
  /** Concise description of the subtask */
  description: string;
  /** Current state of the subtask */
  status: CardTaskStatus;
  /** IDs of prerequisite subtasks or main tasks */
  dependencies: number[];
  /** Detailed implementation instructions */
  details: string;
}

/**
 * Main task card interface
 */
export interface CardTask {
  /** Unique identifier within tag context */
  id: number;
  /** Brief, descriptive title */
  title: string;
  /** Concise summary of what the task involves */
  description: string;
  /** Current state of the task */
  status: CardTaskStatus;
  /** IDs of prerequisite tasks that must be completed first */
  dependencies: number[];
  /** Importance level of the task */
  priority: CardTaskPriority;
  /** In-depth implementation instructions */
  details: string;
  /** Verification approach and test plan */
  testStrategy: string;
  /** List of smaller tasks that make up this task */
  subtasks: CardSubtask[];
}

/**
 * Task list organized by tag (context)
 */
export interface TagContext {
  /** Array of tasks in this context */
  tasks: CardTask[];
}

/**
 * Top-level structure with multiple tagged contexts
 * Example: { "master": {...}, "feature-x": {...} }
 */
export interface TaggedTaskList {
  [tag: string]: TagContext;
}

/**
 * Task complexity analysis result
 */
export interface TaskComplexity {
  /** ID of the analyzed task */
  taskId: number;
  /** Complexity score (1-10 scale) */
  complexityScore: number;
  /** AI-recommended number of subtasks */
  recommendedSubtasks: number;
  /** Tailored prompt for expanding this task */
  expansionPrompt: string;
  /** Breakdown of complexity factors */
  factors: {
    technicalComplexity: number;
    scopeBreadth: number;
    dependencyCount: number;
    estimatedEffort: number;
  };
}

/**
 * Complexity analysis report for all tasks
 */
export interface ComplexityReport {
  /** Timestamp when report was generated */
  generatedAt: string;
  /** Tag context analyzed */
  tag: string;
  /** Analysis for each task */
  analyses: TaskComplexity[];
  /** Distribution statistics */
  distribution: {
    low: number; // 1-3
    medium: number; // 4-6
    high: number; // 7-8
    veryHigh: number; // 9-10
  };
  /** Tasks recommended for expansion */
  recommendedForExpansion: number[];
}

/**
 * Dependency validation result
 */
export interface DependencyValidation {
  /** Whether dependencies are valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** List of warnings */
  warnings: string[];
  /** Detected circular dependency chains */
  cycles: number[][];
}

/**
 * Task creation request
 */
export interface TaskCreateRequest {
  title: string;
  description: string;
  priority: CardTaskPriority;
  details: string;
  testStrategy: string;
  dependencies?: number[];
  tag?: string;
  subtasks?: Omit<CardSubtask, "id">[];
}

/**
 * Task update request (all fields optional)
 */
export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  status?: CardTaskStatus;
  priority?: CardTaskPriority;
  details?: string;
  testStrategy?: string;
  dependencies?: number[];
}

/**
 * Task statistics for dashboard
 */
export interface TaskStatistics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  deferred: number;
  cancelled: number;
  completionPercentage: number;
  avgComplexity?: number;
}

/**
 * Next task recommendation
 */
export interface NextTaskRecommendation {
  /** The recommended task */
  task: CardTask;
  /** Explanation of why this task was chosen */
  reason: string;
  /** Status of dependencies */
  dependencyStatus: {
    taskId: number;
    title: string;
    completed: boolean;
  }[];
  /** Suggested actions */
  suggestedActions: string[];
}

/**
 * Task filter options
 */
export interface TaskFilters {
  status?: CardTaskStatus[];
  priority?: CardTaskPriority[];
  hasSubtasks?: boolean;
  hasDependencies?: boolean;
  searchQuery?: string;
}

/**
 * Task sort options
 */
export enum TaskSortBy {
  PRIORITY = "priority",
  ID = "id",
  STATUS = "status",
  DEPENDENCY_COUNT = "dependencyCount",
  COMPLEXITY = "complexity",
}

/**
 * Task sort order
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/**
 * Task export format
 */
export enum ExportFormat {
  JSON = "json",
  MARKDOWN = "markdown",
  CSV = "csv",
}

/**
 * Helper function to get status color
 */
export function getStatusColor(status: CardTaskStatus): string {
  switch (status) {
    case CardTaskStatus.PENDING:
      return "gray";
    case CardTaskStatus.IN_PROGRESS:
      return "blue";
    case CardTaskStatus.DONE:
      return "green";
    case CardTaskStatus.REVIEW:
      return "yellow";
    case CardTaskStatus.DEFERRED:
      return "orange";
    case CardTaskStatus.CANCELLED:
      return "red";
    default:
      return "gray";
  }
}

/**
 * Helper function to get priority color
 */
export function getPriorityColor(priority: CardTaskPriority): string {
  switch (priority) {
    case CardTaskPriority.HIGH:
      return "red";
    case CardTaskPriority.MEDIUM:
      return "yellow";
    case CardTaskPriority.LOW:
      return "gray";
    default:
      return "gray";
  }
}

/**
 * Helper function to get complexity color
 */
export function getComplexityColor(score: number): string {
  if (score <= 3) return "green";
  if (score <= 6) return "yellow";
  if (score <= 8) return "orange";
  return "red";
}

/**
 * Helper function to calculate subtask completion percentage
 */
export function getSubtaskCompletionPercentage(subtasks: CardSubtask[]): number {
  if (subtasks.length === 0) return 100;
  const completed = subtasks.filter((st) => st.status === CardTaskStatus.DONE).length;
  return Math.round((completed / subtasks.length) * 100);
}

/**
 * Helper function to check if task is blocked by dependencies
 */
export function isTaskBlocked(task: CardTask, allTasks: CardTask[]): boolean {
  if (task.dependencies.length === 0) return false;

  return task.dependencies.some((depId) => {
    const depTask = allTasks.find((t) => t.id === depId);
    return !depTask || depTask.status !== CardTaskStatus.DONE;
  });
}

/**
 * Helper function to get task's blocking dependencies
 */
export function getBlockingDependencies(task: CardTask, allTasks: CardTask[]): CardTask[] {
  return task.dependencies
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter((t): t is CardTask => !!t && t.status !== CardTaskStatus.DONE);
}

/**
 * Helper function to calculate XP award for task completion
 */
export function calculateTaskXP(task: CardTask, complexity?: number): number {
  const baseXP = 10;

  // Priority multiplier
  let priorityMultiplier = 1;
  switch (task.priority) {
    case CardTaskPriority.HIGH:
      priorityMultiplier = 2;
      break;
    case CardTaskPriority.MEDIUM:
      priorityMultiplier = 1.5;
      break;
    case CardTaskPriority.LOW:
      priorityMultiplier = 1;
      break;
  }

  // Complexity multiplier
  const complexityMultiplier = complexity ? complexity / 5 : 1;

  return Math.round(baseXP * priorityMultiplier * complexityMultiplier);
}
