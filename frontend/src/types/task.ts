export interface Task {
  task_id: string
  title: string
  description: string
  project_id: string
  parent_id?: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[]
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  progress_percentage: number
  created_at: string
  updated_at: string
  completed_at?: string
  dependencies: string[]
  assignee?: string
  labels: string[]
  external_references: Record<string, any>
  subtask_count: number
  context?: TaskContext
}

export interface Project {
  project_id: string
  name: string
  description: string
  owner?: string
  team_members: string[]
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
  settings: Record<string, any>
  metadata: Record<string, any>
}

export interface TaskTemplate {
  template_id: string
  name: string
  description: string
  title_template: string
  description_template: string
  default_priority: TaskPriority
  default_tags: string[]
  default_estimated_hours?: number
  variables: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TaskComment {
  comment_id: string
  task_id: string
  author: string
  content: string
  created_at: string
}

export interface TaskContext {
  location?: {
    lat: number
    lng: number
  }
  device_info?: Record<string, any>
  session_data?: Record<string, any>
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface QuickCaptureRequest {
  text: string
  user_id: string
  location?: {
    lat: number
    lng: number
  }
  voice_input?: boolean
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  limit: number
  offset: number
}

export interface BulkTaskOperationResult {
  successful_count: number
  failed_count: number
  successful_ids: string[]
  failed_ids: string[]
  success_rate: number
}

export interface TaskEstimationResponse {
  task_id: string
  estimated_hours: number
  confidence: number
  factors: string[]
}

export interface TaskBreakdownResponse {
  parent_task_id: string
  subtasks: Task[]
  created_count: number
}

export interface VoiceProcessingResponse {
  intent: string
  extracted_data: Record<string, any>
  confidence: number
}

export interface MobileDashboardData {
  total_tasks: number
  completed_today: number
  focus_time_today: number
  current_streak: number
  xp_earned_today: number
}

export interface MobileTaskItem {
  task_id: string
  title: string
  priority: TaskPriority
  due_soon: boolean
  estimated_minutes: number
}