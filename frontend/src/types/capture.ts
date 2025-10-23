/**
 * TypeScript types for Task Capture API
 */

export type HierarchyLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DecompositionState = 'stub' | 'decomposing' | 'decomposed' | 'atomic';

export interface MicroStep {
  step_id: string;
  description: string;
  estimated_minutes: number;
  leaf_type: 'DIGITAL' | 'HUMAN' | 'unknown';
  icon?: string;
  delegation_mode: string;

  // Hierarchy support
  level?: number;
  custom_emoji?: string;
  decomposition_state?: DecompositionState;
  children_ids?: string[];
  total_minutes?: number;
  is_leaf?: boolean;
}

export interface TaskBreakdown {
  total_steps: number;
  digital_count: number;
  human_count: number;
  total_minutes: number;
}

export interface CapturedTask {
  title: string;
  description: string;
  priority: string;
  estimated_hours: number;
  tags: string[];
}

export interface ClarificationQuestion {
  field: string;
  question: string;
  options?: string[];
}

export interface CaptureResponse {
  task: CapturedTask;
  micro_steps: MicroStep[];
  breakdown: TaskBreakdown;
  needs_clarification: boolean;
  clarifications: ClarificationQuestion[];
  processing_time_ms: number;
  voice_processed: boolean;
  location_captured: boolean;
  error?: string;
}

export interface QuickCaptureRequest {
  text: string;
  user_id: string;
  voice_input: boolean;
  auto_mode: boolean;
  ask_for_clarity: boolean;
}

export type LoadingStage = 'analyzing' | 'breaking_down' | 'almost_done';

export interface CaptureFlowState {
  isProcessing: boolean;
  loadingStage: LoadingStage | null;
  capturedTask: CaptureResponse | null;
  error: string | null;
  showBreakdown: boolean;
  showDropAnimation: boolean;
}

/**
 * Hierarchy Tree Node
 * Represents a node in the 7-level task hierarchy tree
 */
export interface TaskNode {
  task_id: string;
  title: string;
  description?: string;

  // Hierarchy
  level: HierarchyLevel;
  parent_id?: string;
  children?: TaskNode[];  // Populated when decomposed
  children_ids: string[];

  // Time
  estimated_minutes: number;
  total_minutes: number;

  // State
  decomposition_state: DecompositionState;
  is_leaf: boolean;
  leaf_type?: 'DIGITAL' | 'HUMAN' | 'unknown';

  // Display
  icon?: string;
  custom_emoji?: string;
  delegation_mode?: string;
  step_number?: number;

  // Metadata
  priority?: string;
  tags?: string[];
}
