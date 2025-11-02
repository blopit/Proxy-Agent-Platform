/**
 * SimpleTabs - React Native Version
 * MVP 3-Tab Navigation
 *
 * - 📥 Inbox (Capture + Scout combined)
 * - 🎯 Today (Hunter mode)
 * - 📊 Progress (Mender + Mapper combined)
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Inbox, Target, TrendingUp } from 'lucide-react-native';

export type SimpleTab = 'inbox' | 'today' | 'progress';

interface SimpleTabsProps {
  activeTab: SimpleTab;
  onChange: (tab: SimpleTab) => void;
  showBadges?: {
    inbox?: number;
    today?: number;
    progress?: boolean;
  };
}

const TAB_CONFIG = {
  inbox: {
    icon: Inbox,
    label: 'Inbox',
    emoji: '📥',
    color: '#2aa198', // Solarized cyan
    description: 'Capture & organize tasks',
  },
  today: {
    icon: Target,
    label: 'Today',
    emoji: '🎯',
    color: '#cb4b16', // Solarized orange
    description: 'Focus on current task',
  },
  progress: {
    icon: TrendingUp,
    label: 'Progress',
    emoji: '📊',
    color: '#6c71c4', // Solarized violet
    description: 'View XP, streaks & goals',
  },
} as const;

export default function SimpleTabs({ activeTab, onChange, showBadges }: SimpleTabsProps) {
  return (
    <View style={styles.container}>
      {(Object.keys(TAB_CONFIG) as SimpleTab[]).map((tab) => {
        const config = TAB_CONFIG[tab];
        const Icon = config.icon;
        const isActive = activeTab === tab;
        const badge = showBadges?.[tab];

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onChange(tab)}
            style={[
              styles.tab,
              isActive && styles.tabActive,
            ]}
            activeOpacity={0.7}
            accessibilityLabel={config.description}
          >
            {/* Icon container */}
            <View
              style={[
                styles.iconContainer,
                isActive && { backgroundColor: `${config.color}20` },
              ]}
            >
              <Icon
                size={24}
                color={isActive ? config.color : '#586e75'}
              />

              {/* Numeric badge */}
              {badge && typeof badge === 'number' && badge > 0 && (
                <View style={styles.numericBadge}>
                  <Text style={styles.badgeText}>
                    {badge > 99 ? '99+' : badge}
                  </Text>
                </View>
              )}

              {/* Boolean badge (dot) */}
              {badge && typeof badge === 'boolean' && badge && (
                <View style={styles.booleanBadge} />
              )}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                isActive && { color: config.color, fontWeight: '600' },
              ]}
            >
              {config.label}
            </Text>

            {/* Active indicator */}
            {isActive && (
              <View
                style={[styles.activeIndicator, { backgroundColor: config.color }]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#002b36', // Solarized base03
    borderTopWidth: 1,
    borderTopColor: '#586e75',
    paddingTop: 8,
    paddingBottom: 12, // Extra padding for safe area
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    opacity: 0.6,
    position: 'relative',
  },
  tabActive: {
    opacity: 1,
    transform: [{ translateY: -2 }],
  },
  iconContainer: {
    position: 'relative',
    padding: 4,
    borderRadius: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    color: '#586e75',
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -16 }],
    width: 32,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  numericBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc322f', // Solarized red
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  booleanBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#859900', // Solarized green
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#002b36',
  },
});
