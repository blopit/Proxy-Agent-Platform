'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Target,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  BarChart3,
  CheckSquare
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { AgentCard } from '@/components/dashboard/AgentCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ProductivityChart } from '@/components/dashboard/ProductivityChart'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalXP: 2450,
    currentStreak: 12,
    tasksCompleted: 34,
    focusTime: 6.5
  })

  // Future: CopilotKit integration for AI interactions

  const agents = [
    {
      id: 'task-agent',
      name: 'Task Agent',
      description: 'Manages your tasks and priorities',
      icon: Target,
      status: 'active' as const,
      lastAction: 'Created 3 tasks from your meeting notes',
      color: 'blue' as const
    },
    {
      id: 'focus-agent',
      name: 'Focus Agent',
      description: 'Optimizes your focus and deep work',
      icon: Zap,
      status: 'active' as const,
      lastAction: 'Suggested 25-min focus session',
      color: 'purple' as const
    },
    {
      id: 'energy-agent',
      name: 'Energy Agent',
      description: 'Tracks and optimizes your energy levels',
      icon: Activity,
      status: 'idle' as const,
      lastAction: 'Recommended a 10-min break',
      color: 'green' as const
    },
    {
      id: 'progress-agent',
      name: 'Progress Agent',
      description: 'Monitors goals and celebrates wins',
      icon: TrendingUp,
      status: 'active' as const,
      lastAction: 'You completed your weekly goal!',
      color: 'orange' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Productivity Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Powered by AI proxy agents working for you 24/7
          </p>
          <div className="flex justify-center">
            <Link
              href="/tasks"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckSquare className="w-5 h-5" />
              <span>Manage Tasks</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total XP"
            value={stats.totalXP.toLocaleString()}
            icon={Award}
            color="blue"
            change="+120 today"
          />
          <StatsCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon={Calendar}
            color="orange"
            change="Personal best!"
          />
          <StatsCard
            title="Tasks Completed"
            value={stats.tasksCompleted}
            icon={Target}
            color="green"
            change="+8 today"
          />
          <StatsCard
            title="Focus Time"
            value={`${stats.focusTime}h`}
            icon={Clock}
            color="purple"
            change="2.5h remaining"
          />
        </div>

        {/* Agents Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Your AI Proxy Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <div key={agent.id}>
                <AgentCard {...agent} />
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Productivity Chart */}
          <div className="lg:col-span-2">
            <ProductivityChart />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </div>
  )
}