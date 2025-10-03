import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'green' | 'purple' | 'orange'
  change?: string
}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600'
}

const iconColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600'
}

export function StatsCard({ title, value, icon: Icon, color, change }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-xl p-6 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-5`} />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg bg-white/80 ${iconColorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {change && (
            <span className="text-sm text-green-600 font-medium">
              {change}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-3xl font-bold text-gray-900">
            {value}
          </h3>
          <p className="text-gray-600 font-medium">
            {title}
          </p>
        </div>
      </div>
    </motion.div>
  )
}