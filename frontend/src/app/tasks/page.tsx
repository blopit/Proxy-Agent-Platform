import React from 'react'
import { TaskDashboard } from '@/components/tasks/TaskDashboard'

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TaskDashboard userId="test-user-123" />
      </div>
    </div>
  )
}