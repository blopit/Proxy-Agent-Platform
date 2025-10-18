import {
  Task,
  Project,
  TaskTemplate,
  TaskListResponse,
  QuickCaptureRequest,
  BulkTaskOperationResult,
  TaskEstimationResponse,
  TaskBreakdownResponse,
  VoiceProcessingResponse,
  MobileDashboardData,
  MobileTaskItem,
} from '@/types/task'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class TaskApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'TaskApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new TaskApiError(
      errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      response.status
    )
  }

  return response.json()
}

export const taskApi = {
  // Task CRUD operations
  async createTask(taskData: Partial<Task>): Promise<Task> {
    return apiRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  },

  async getTask(taskId: string): Promise<Task> {
    return apiRequest(`/api/v1/tasks/${taskId}`)
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    return apiRequest(`/api/v1/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiRequest(`/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
    })
  },

  async listTasks(params: {
    project_id?: string
    status?: string
    priority?: string
    assignee?: string
    tags?: string[]
    limit?: number
    offset?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
  } = {}): Promise<TaskListResponse> {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    return apiRequest(`/api/v1/tasks?${searchParams.toString()}`)
  },

  // Project operations
  async createProject(projectData: Partial<Project>): Promise<Project> {
    return apiRequest('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  },

  async getProject(projectId: string): Promise<Project> {
    return apiRequest(`/api/v1/projects/${projectId}`)
  },

  async listProjects(): Promise<Project[]> {
    return apiRequest('/api/v1/projects')
  },

  // Advanced task operations
  async getTaskHierarchy(taskId: string): Promise<any> {
    return apiRequest(`/api/v1/tasks/${taskId}/hierarchy`)
  },

  async bulkUpdateTasks(
    taskIds: string[],
    updates: Partial<Task>
  ): Promise<BulkTaskOperationResult> {
    return apiRequest('/api/v1/tasks/bulk', {
      method: 'PATCH',
      body: JSON.stringify({
        task_ids: taskIds,
        updates,
      }),
    })
  },

  async estimateTaskDuration(taskId: string): Promise<TaskEstimationResponse> {
    return apiRequest(`/api/v1/tasks/${taskId}/estimate`, {
      method: 'POST',
    })
  },

  async breakDownTask(taskId: string): Promise<TaskBreakdownResponse> {
    return apiRequest(`/api/v1/tasks/${taskId}/breakdown`, {
      method: 'POST',
    })
  },

  async createTaskFromTemplate(
    templateName: string,
    projectId: string,
    variables: Record<string, any>
  ): Promise<Task> {
    return apiRequest('/api/v1/tasks/from-template', {
      method: 'POST',
      body: JSON.stringify({
        template_name: templateName,
        project_id: projectId,
        variables,
      }),
    })
  },

  // Mobile-specific endpoints
  async quickCapture(request: QuickCaptureRequest): Promise<{ task: Task; processing_time_ms: number }> {
    return apiRequest('/api/v1/mobile/quick-capture', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  async getMobileDashboard(userId: string): Promise<MobileDashboardData> {
    return apiRequest(`/api/v1/mobile/dashboard/${userId}`)
  },

  async getMobileOptimizedTasks(
    userId: string,
    limit: number = 20
  ): Promise<{ tasks: MobileTaskItem[] }> {
    return apiRequest(`/api/v1/mobile/tasks/${userId}?limit=${limit}`)
  },

  async processVoiceInput(
    audioText: string,
    userId: string
  ): Promise<VoiceProcessingResponse> {
    return apiRequest('/api/v1/mobile/voice-process', {
      method: 'POST',
      body: JSON.stringify({
        audio_text: audioText,
        user_id: userId,
      }),
    })
  },

  // Project analytics
  async getProjectAnalytics(projectId: string): Promise<any> {
    return apiRequest(`/api/v1/projects/${projectId}/analytics`)
  },

  async smartPrioritizeTasks(projectId: string): Promise<any> {
    return apiRequest(`/api/v1/projects/${projectId}/prioritize`, {
      method: 'POST',
    })
  },
}

export { TaskApiError }