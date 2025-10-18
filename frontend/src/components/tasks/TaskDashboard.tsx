'use client'

import React, { useState } from 'react'
import { QuickCapture } from './QuickCapture'
import { SimpleTaskList } from './SimpleTaskList'
import { Task } from '@/types/task'
import { Plus } from 'lucide-react'

interface TaskDashboardProps {
  userId: string
}

export function TaskDashboard({ userId }: TaskDashboardProps) {
  const [selectedProject] = useState('465d0f24-529c-453e-8594-525ae085d3dc') // Use existing test project
  const [tasks, setTasks] = useState<Task[]>([])

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev])
  }

  const handleTaskSelect = (task: Task) => {
    console.log('Selected task:', task)
    // Could navigate to task detail page or open modal
  }

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.task_id === updatedTask.task_id ? updatedTask : t))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Organize and track your tasks efficiently</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Quick Capture Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <QuickCapture
            userId={userId}
            onTaskCreated={handleTaskCreated}
          />
        </div>

        {/* Task List Section */}
        <div className="lg:col-span-2">
          <SimpleTaskList
            projectId={selectedProject}
            onTaskSelect={handleTaskSelect}
            onTaskUpdate={handleTaskUpdate}
          />
        </div>
      </div>
    </div>
  )
}