/**
 * TypeScript types for Capture functionality
 */

export interface MicroStep {
  step_id: string;
  description: string;
  estimated_minutes: number;
  delegation_mode: string;
  leaf_type: string;
  icon?: string;
  short_label?: string;
  tags?: string[];
  automation_plan?: {
    provider: string;
    action: string;
    params: Record<string, any>;
  };
}

export interface Task {
  task_id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  priority: string;
}

export interface ClarificationNeed {
  field: string;
  question: string;
  required: boolean;
}

export interface CaptureRequest {
  query: string;
  user_id: string;
  mode: 'auto' | 'manual' | 'clarify';
}

export interface CaptureResponse {
  task: Task;
  micro_steps: MicroStep[];
  clarifications: ClarificationNeed[];
  ready_to_save: boolean;
  mode: string;
}

export interface SaveCaptureRequest {
  task: Task;
  micro_steps: MicroStep[];
  user_id: string;
  project_id?: string;
}

export interface SaveCaptureResponse {
  success: boolean;
  task_id: string;
  micro_step_ids: string[];
  total_steps: number;
  message: string;
}

export interface ClarifyRequest {
  micro_steps: MicroStep[];
  answers: Record<string, string>;
}

export interface ClarifyResponse {
  task: Record<string, any>; // Task doesn't change during clarification
  micro_steps: MicroStep[];
  clarifications: ClarificationNeed[];
  ready_to_save: boolean;
  mode: string;
}
