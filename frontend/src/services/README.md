# Frontend Services

This directory contains the frontend service layer that handles business logic, API communication, and state management for the Proxy Agent Platform frontend.

## Overview

The services directory provides a clean abstraction layer between React components and external APIs, handling data transformation, caching, and business logic.

## Structure

```
services/
├── README.md      # This file
└── taskApi.ts     # Task API service implementation
```

## Service Architecture

### Design Principles
- **Separation of Concerns**: Business logic separated from UI components
- **API Abstraction**: Clean interface over HTTP APIs
- **Error Handling**: Centralized error management
- **Caching**: Intelligent data caching and invalidation
- **Type Safety**: Full TypeScript support

### Service Categories
- **API Services**: Direct API communication
- **Business Services**: Business logic and data transformation
- **Utility Services**: Common utility functions
- **State Services**: Global state management

## Service Implementations

### Task API Service
```typescript
// services/taskApi.ts
import { APIClient } from '@/api/main';
import { Task, TaskCreate, TaskUpdate, TaskStatus, Priority } from '@/types/task';

export class TaskApiService {
  private apiClient: APIClient;
  private cache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get all tasks for the current user
   */
  async getTasks(options?: {
    status?: TaskStatus;
    priority?: Priority;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    const cacheKey = `tasks_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await this.apiClient.get('/api/v1/tasks', options);
      
      // Cache the response
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    const cacheKey = `task_${taskId}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const task = await this.apiClient.get(`/api/v1/tasks/${taskId}`);
      
      this.cache.set(cacheKey, {
        data: task,
        timestamp: Date.now()
      });

      return task;
    } catch (error) {
      throw new Error(`Failed to fetch task: ${error.message}`);
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: TaskCreate): Promise<Task> {
    try {
      const task = await this.apiClient.post('/api/v1/tasks', taskData);
      
      // Invalidate tasks cache
      this.invalidateTasksCache();
      
      return task;
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: TaskUpdate): Promise<Task> {
    try {
      const task = await this.apiClient.put(`/api/v1/tasks/${taskId}`, updates);
      
      // Update cache
      this.cache.set(`task_${taskId}`, {
        data: task,
        timestamp: Date.now()
      });
      
      // Invalidate tasks cache
      this.invalidateTasksCache();
      
      return task;
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/api/v1/tasks/${taskId}`);
      
      // Remove from cache
      this.cache.delete(`task_${taskId}`);
      
      // Invalidate tasks cache
      this.invalidateTasksCache();
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string): Promise<Task> {
    return this.updateTask(taskId, { status: 'completed' });
  }

  /**
   * Search tasks
   */
  async searchTasks(query: string, filters?: {
    status?: TaskStatus;
    priority?: Priority;
  }): Promise<Task[]> {
    try {
      const params = { q: query, ...filters };
      const response = await this.apiClient.get('/api/v1/tasks/search', params);
      return response.tasks;
    } catch (error) {
      throw new Error(`Failed to search tasks: ${error.message}`);
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
  }> {
    const cacheKey = 'task_stats';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const stats = await this.apiClient.get('/api/v1/tasks/stats');
      
      this.cache.set(cacheKey, {
        data: stats,
        timestamp: Date.now()
      });

      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch task statistics: ${error.message}`);
    }
  }

  /**
   * Invalidate tasks cache
   */
  private invalidateTasksCache(): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(
      key => key.startsWith('tasks_') || key === 'task_stats'
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
```

### Agent Service
```typescript
// services/agentService.ts
import { APIClient } from '@/api/main';

export interface AgentQuery {
  agent: string;
  query: string;
  context?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  data?: any;
  suggestions?: string[];
}

export class AgentService {
  private apiClient: APIClient;

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
  }

  /**
   * Query a specific agent
   */
  async queryAgent(agentType: string, query: string, context?: Record<string, any>): Promise<AgentResponse> {
    try {
      const response = await this.apiClient.post(`/api/v1/agents/${agentType}/query`, {
        query,
        context
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to query ${agentType} agent: ${error.message}`);
    }
  }

  /**
   * Get available agents
   */
  async getAvailableAgents(): Promise<string[]> {
    try {
      const response = await this.apiClient.get('/api/v1/agents');
      return response.agents;
    } catch (error) {
      throw new Error(`Failed to fetch available agents: ${error.message}`);
    }
  }

  /**
   * Get agent status
   */
  async getAgentStatus(agentType: string): Promise<{
    status: 'online' | 'offline' | 'busy';
    lastSeen: string;
    capabilities: string[];
  }> {
    try {
      const response = await this.apiClient.get(`/api/v1/agents/${agentType}/status`);
      return response;
    } catch (error) {
      throw new Error(`Failed to get agent status: ${error.message}`);
    }
  }

  /**
   * Process natural language command
   */
  async processCommand(command: string): Promise<{
    intent: string;
    entities: Record<string, any>;
    action: string;
    confidence: number;
  }> {
    try {
      const response = await this.apiClient.post('/api/v1/agents/process', {
        command
      });

      return response;
    } catch (error) {
      throw new Error(`Failed to process command: ${error.message}`);
    }
  }
}
```

### Gamification Service
```typescript
// services/gamificationService.ts
import { APIClient } from '@/api/main';

export interface UserXP {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  levelProgress: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalXP: number;
  level: number;
  rank: number;
}

export class GamificationService {
  private apiClient: APIClient;

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get user XP and level information
   */
  async getUserXP(): Promise<UserXP> {
    try {
      const response = await this.apiClient.get('/api/v1/gamification/xp');
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch user XP: ${error.message}`);
    }
  }

  /**
   * Get user achievements
   */
  async getAchievements(): Promise<{
    unlocked: Achievement[];
    available: Achievement[];
    progress: Achievement[];
  }> {
    try {
      const response = await this.apiClient.get('/api/v1/gamification/achievements');
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch achievements: ${error.message}`);
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'weekly'): Promise<{
    entries: LeaderboardEntry[];
    userRank?: number;
    period: string;
  }> {
    try {
      const response = await this.apiClient.get('/api/v1/gamification/leaderboard', {
        period
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch leaderboard: ${error.message}`);
    }
  }

  /**
   * Get XP history
   */
  async getXPHistory(days: number = 30): Promise<{
    date: string;
    xpEarned: number;
    activities: string[];
  }[]> {
    try {
      const response = await this.apiClient.get('/api/v1/gamification/xp/history', {
        days
      });
      return response.history;
    } catch (error) {
      throw new Error(`Failed to fetch XP history: ${error.message}`);
    }
  }
}
```

## Service Factory

### Service Container
```typescript
// services/serviceContainer.ts
import { APIClient } from '@/api/main';
import { TaskApiService } from './taskApi';
import { AgentService } from './agentService';
import { GamificationService } from './gamificationService';

export class ServiceContainer {
  private apiClient: APIClient;
  private services: Map<string, any> = new Map();

  constructor(apiClient: APIClient) {
    this.apiClient = apiClient;
    this.initializeServices();
  }

  private initializeServices(): void {
    this.services.set('task', new TaskApiService(this.apiClient));
    this.services.set('agent', new AgentService(this.apiClient));
    this.services.set('gamification', new GamificationService(this.apiClient));
  }

  getTaskService(): TaskApiService {
    return this.services.get('task');
  }

  getAgentService(): AgentService {
    return this.services.get('agent');
  }

  getGamificationService(): GamificationService {
    return this.services.get('gamification');
  }

  // Generic service getter
  getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    return service as T;
  }
}

// Global service container instance
let serviceContainer: ServiceContainer | null = null;

export const initializeServices = (apiClient: APIClient): ServiceContainer => {
  serviceContainer = new ServiceContainer(apiClient);
  return serviceContainer;
};

export const getServices = (): ServiceContainer => {
  if (!serviceContainer) {
    throw new Error('Services not initialized. Call initializeServices first.');
  }
  return serviceContainer;
};
```

## Usage Examples

### Using Task Service
```typescript
// In a React component
import { useEffect, useState } from 'react';
import { getServices } from '@/services/serviceContainer';
import { Task } from '@/types/task';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const taskService = getServices().getTaskService();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await taskService.getTasks({ status: 'pending' });
        setTasks(response.tasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [taskService]);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskService.completeTask(taskId);
      // Refresh tasks
      const response = await taskService.getTasks({ status: 'pending' });
      setTasks(response.tasks);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Component JSX...
};
```

### Using Agent Service
```typescript
// In a chat component
import { useState } from 'react';
import { getServices } from '@/services/serviceContainer';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const agentService = getServices().getAgentService();

  const handleSendMessage = async (message: string) => {
    try {
      const response = await agentService.queryAgent('task', message);
      
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), content: message, sender: 'user' },
        { id: (Date.now() + 1).toString(), content: response.response, sender: 'assistant' }
      ]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Component JSX...
};
```

## Error Handling

### Service Error Types
```typescript
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class NetworkError extends ServiceError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}

export class ValidationError extends ServiceError {
  constructor(message: string, public details?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

## Testing

### Service Testing
```typescript
// services/__tests__/taskApi.test.ts
import { TaskApiService } from '../taskApi';
import { APIClient } from '@/api/main';

jest.mock('@/api/main');

describe('TaskApiService', () => {
  let taskService: TaskApiService;
  let mockApiClient: jest.Mocked<APIClient>;

  beforeEach(() => {
    mockApiClient = new APIClient() as jest.Mocked<APIClient>;
    taskService = new TaskApiService(mockApiClient);
  });

  it('should fetch tasks successfully', async () => {
    const mockTasks = [{ id: '1', title: 'Test Task' }];
    mockApiClient.get.mockResolvedValue({ tasks: mockTasks, total: 1 });

    const result = await taskService.getTasks();

    expect(result.tasks).toEqual(mockTasks);
    expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/tasks', undefined);
  });

  it('should handle errors when fetching tasks', async () => {
    mockApiClient.get.mockRejectedValue(new Error('Network error'));

    await expect(taskService.getTasks()).rejects.toThrow('Failed to fetch tasks');
  });
});
```

## Dependencies

- **API Client**: HTTP communication
- **TypeScript**: Type safety
- **Error Handling**: Custom error classes
- **Caching**: In-memory caching
- **Testing**: Jest and testing utilities
