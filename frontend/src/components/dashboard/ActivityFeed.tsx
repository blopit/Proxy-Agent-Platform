'use client'

import { motion } from 'framer-motion'
import { Clock, CheckCircle, Zap, Award, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

interface ActivityItem {
  id: string
  type: 'task' | 'focus' | 'achievement' | 'milestone'
  title: string
  description: string
  timestamp: Date
  agent?: string
  xp?: number
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'achievement',
    title: 'Week Streak Master!',
    description: 'Completed 12 consecutive days of productivity',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    agent: 'Progress Agent',
    xp: 250
  },
  {
    id: '2',
    type: 'task',
    title: 'Review quarterly goals',
    description: 'Completed task suggested by Task Agent',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    agent: 'Task Agent',
    xp: 50
  },
  {
    id: '3',
    type: 'focus',
    title: 'Deep Work Session',
    description: 'Completed 90-minute focus session',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    agent: 'Focus Agent',
    xp: 120
  },
  {
    id: '4',
    type: 'milestone',
    title: 'Monthly XP Goal',
    description: 'Reached 2,500 XP this month!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    agent: 'Progress Agent',
    xp: 500
  },
  {
    id: '5',
    type: 'task',
    title: 'Email cleanup',
    description: 'Processed inbox to zero',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    agent: 'Task Agent',
    xp: 75
  }
]

const activityIcons = {
  task: CheckCircle,
  focus: Zap,
  achievement: Award,
  milestone: TrendingUp
}

const activityColors = {
  task: 'text-green-600 bg-green-50',
  focus: 'text-purple-600 bg-purple-50',
  achievement: 'text-orange-600 bg-orange-50',
  milestone: 'text-blue-600 bg-blue-50'
}

export function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-6 space-y-6 h-fit"
    >
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {mockActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type]
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${activityColors[activity.type]}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {activity.title}
                  </h4>
                  {activity.xp && (
                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                      +{activity.xp} XP
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDistanceToNow(activity.timestamp)} ago</span>
                  {activity.agent && (
                    <span className="font-medium">
                      by {activity.agent}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all activity →
        </button>
      </div>
    </motion.div>
  )
}