'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Target,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { AgentCard } from '@/components/dashboard/AgentCard'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ProductivityChart } from '@/components/dashboard/ProductivityChart'
import { useCopilotAction } from '@copilotkit/react-core'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalXP: 2450,
    currentStreak: 12,
    tasksCompleted: 34,
    focusTime: 6.5
  })

  // CopilotKit actions for AI interaction
  useCopilotAction({
    name: "getProductivityStats",
    description: "Get current productivity statistics and metrics",
    handler: async () => {
      return stats
    }
  })

  useCopilotAction({
    name: "setFocusGoal",
    description: "Set a focus time goal for today",
    parameters: [
      {
        name: "hours",
        type: "number",
        description: "Target focus hours for today"
      }
    ],
    handler: async ({ hours }) => {
      // This would integrate with the backend agent
      console.log(`Setting focus goal to ${hours} hours`)
      return `Focus goal set to ${hours} hours for today`
    }
  })

  const agents = [
    {
      id: 'task-agent',
      name: 'Task Agent',
      description: 'Manages your tasks and priorities',
      icon: Target,
      status: 'active',
      lastAction: 'Created 3 tasks from your meeting notes',
      color: 'blue'
    },
    {
      id: 'focus-agent',
      name: 'Focus Agent',
      description: 'Optimizes your focus and deep work',
      icon: Zap,
      status: 'active',
      lastAction: 'Suggested 25-min focus session',
      color: 'purple'
    },
    {
      id: 'energy-agent',
      name: 'Energy Agent',
      description: 'Tracks and optimizes your energy levels',
      icon: Activity,
      status: 'idle',
      lastAction: 'Recommended a 10-min break',
      color: 'green'
    },
    {
      id: 'progress-agent',
      name: 'Progress Agent',
      description: 'Monitors goals and celebrates wins',
      icon: TrendingUp,
      status: 'active',
      lastAction: 'You completed your weekly goal!',
      color: 'orange'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Productivity Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Powered by AI proxy agents working for you 24/7
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
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
        </motion.div>

        {/* Agents Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Your AI Proxy Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <AgentCard {...agent} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Productivity Chart */}
          <div className="lg:col-span-2">
            <ProductivityChart />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed />
          </div>
        </motion.div>
      </div>
    </div>
  )
}