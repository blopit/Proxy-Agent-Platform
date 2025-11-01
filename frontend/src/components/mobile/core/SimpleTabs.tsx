'use client'

/**
 * SimpleTabs - MVP 3-Tab Navigation
 *
 * Replaces BiologicalTabs (5 modes) with simple 3-tab navigation:
 * - 📥 Inbox (Capture + Scout combined)
 * - 🎯 Today (Hunter mode)
 * - 📊 Progress (Mender + Mapper combined)
 */

import React from 'react'
import { Inbox, Target, TrendingUp } from 'lucide-react'
import { spacing, semanticColors, colors, fontSize, shadow } from '@/lib/design-system'

export type SimpleTab = 'inbox' | 'today' | 'progress'

interface SimpleTabsProps {
  activeTab: SimpleTab
  onChange: (tab: SimpleTab) => void
  showBadges?: {
    inbox?: number
    today?: number
    progress?: boolean
  }
}

const TAB_CONFIG = {
  inbox: {
    icon: Inbox,
    label: 'Inbox',
    emoji: '📥',
    color: colors.cyan,
    description: 'Capture & organize tasks'
  },
  today: {
    icon: Target,
    label: 'Today',
    emoji: '🎯',
    color: colors.orange,
    description: 'Focus on current task'
  },
  progress: {
    icon: TrendingUp,
    label: 'Progress',
    emoji: '📊',
    color: colors.violet,
    description: 'View XP, streaks & goals'
  }
} as const

export default function SimpleTabs({ activeTab, onChange, showBadges }: SimpleTabsProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: semanticColors.bg.primary,
        borderTop: `1px solid ${semanticColors.border.default}`,
        boxShadow: shadow.lg,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-around',
        padding: `${spacing[2]} 0`,
        paddingBottom: 'env(safe-area-inset-bottom, 12px)',
      }}
    >
      {(Object.keys(TAB_CONFIG) as SimpleTab[]).map((tab) => {
        const config = TAB_CONFIG[tab]
        const Icon = config.icon
        const isActive = activeTab === tab
        const badge = showBadges?.[tab]

        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: spacing[1],
              padding: `${spacing[2]} ${spacing[4]}`,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: isActive ? 1 : 0.6,
              transform: isActive ? 'translateY(-2px)' : 'none',
              position: 'relative',
            }}
            aria-label={config.description}
          >
            {/* Icon */}
            <div
              style={{
                position: 'relative',
                padding: spacing[1],
                borderRadius: '12px',
                backgroundColor: isActive ? `${config.color}20` : 'transparent',
              }}
            >
              <Icon
                size={24}
                style={{
                  color: isActive ? config.color : semanticColors.text.secondary,
                }}
              />

              {/* Badge */}
              {badge && typeof badge === 'number' && badge > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: colors.red,
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {badge > 99 ? '99+' : badge}
                </div>
              )}

              {badge && typeof badge === 'boolean' && badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    backgroundColor: colors.green,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: `2px solid ${semanticColors.bg.primary}`,
                  }}
                />
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: fontSize.xs,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? config.color : semanticColors.text.secondary,
              }}
            >
              {config.label}
            </span>

            {/* Active indicator */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '32px',
                  height: '3px',
                  backgroundColor: config.color,
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Usage:
 *
 * ```tsx
 * const [activeTab, setActiveTab] = useState<SimpleTab>('today')
 *
 * <SimpleTabs
 *   activeTab={activeTab}
 *   onChange={setActiveTab}
 *   showBadges={{
 *     inbox: 5,           // 5 new tasks
 *     today: 3,           // 3 tasks for today
 *     progress: true      // New achievement unlocked
 *   }}
 * />
 * ```
 */
