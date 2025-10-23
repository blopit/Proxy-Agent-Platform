/**
 * TypeScript types for Task Capture API
 */

export interface MicroStep {
  step_id: string;
  description: string;
  estimated_minutes: number;
  leaf_type: 'DIGITAL' | 'HUMAN' | 'unknown';
  icon: string;
  delegation_mode: string;
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
