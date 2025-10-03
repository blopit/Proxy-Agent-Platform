import { motion } from 'framer-motion'
import { LucideIcon, Circle } from 'lucide-react'

interface AgentCardProps {
  id: string
  name: string
  description: string
  icon: LucideIcon
  status: 'active' | 'idle' | 'busy'
  lastAction: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600'
}

const statusColors = {
  active: 'text-green-500',
  idle: 'text-gray-400',
  busy: 'text-orange-500'
}

export function AgentCard({ name, description, icon: Icon, status, lastAction, color }: AgentCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="agent-card glass-card rounded-xl p-6 cursor-pointer"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5 rounded-xl`} />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1">
            <Circle className={`w-2 h-2 fill-current ${statusColors[status]}`} />
            <span className={`text-xs font-medium ${statusColors[status]}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">
            {name}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>

        {/* Last Action */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last action:
          </p>
          <p className="text-sm font-medium text-gray-700 mt-1">
            {lastAction}
          </p>
        </div>
      </div>

      {/* Hover effect overlay */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-xl opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  )
}