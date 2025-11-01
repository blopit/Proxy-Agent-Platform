'use client';

import React from 'react';
import { Compass, AlertTriangle, TrendingUp, Target } from 'lucide-react';
import ChevronButton from '../core/ChevronButton';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';

// ============================================================================
// Types
// ============================================================================

export interface ZoneData {
  zone_id: string;
  name: string;
  icon: string;
  color: string;
  simple_goal?: string;
  tasks_completed_today: number;
  tasks_completed_this_week: number;
  tasks_completed_all_time: number;
  days_since_last_task?: number;
}

export interface ZoneInsight {
  type: 'warning' | 'success' | 'info';
  message: string;
  zoneId: string;
  actionLabel?: string;
}

export interface ZoneBalanceWidgetProps {
  zones: ZoneData[];
  insights?: ZoneInsight[];
  onZoneSelect?: (zoneId: string) => void;
  onFilterByZone?: (zoneName: string) => void;
}

// ============================================================================
// Component
// ============================================================================

const ZoneBalanceWidget: React.FC<ZoneBalanceWidgetProps> = ({
  zones,
  insights = [],
  onZoneSelect,
  onFilterByZone,
}) => {
  if (zones.length === 0) {
    return null;
  }

  // Calculate balance score (0-100)
  const calculateBalanceScore = () => {
    const weeklyTasks = zones.map((z) => z.tasks_completed_this_week);
    const max = Math.max(...weeklyTasks, 1);
    const min = Math.min(...weeklyTasks);
    const range = max - min;

    // Perfect balance = 100, complete imbalance = 0
    const balanceScore = 100 - (range / max) * 100;
    return Math.round(balanceScore);
  };

  const balanceScore = calculateBalanceScore();

  // Get balance status
  const getBalanceStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent Balance', color: semanticColors.accent.success, icon: '✨' };
    if (score >= 60) return { label: 'Good Balance', color: semanticColors.accent.primary, icon: '👍' };
    if (score >= 40) return { label: 'Needs Attention', color: semanticColors.accent.warning, icon: '⚠️' };
    return { label: 'Imbalanced', color: semanticColors.accent.error, icon: '⚠️' };
  };

  const balanceStatus = getBalanceStatus(balanceScore);

  // Get insight style
  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return {
          bg: `${semanticColors.accent.warning}20`,
          color: semanticColors.accent.warning,
          icon: <AlertTriangle size={iconSize.sm} />,
        };
      case 'success':
        return {
          bg: `${semanticColors.accent.success}20`,
          color: semanticColors.accent.success,
          icon: <TrendingUp size={iconSize.sm} />,
        };
      case 'info':
        return {
          bg: `${semanticColors.accent.primary}20`,
          color: semanticColors.accent.primary,
          icon: <Target size={iconSize.sm} />,
        };
      default:
        return {
          bg: semanticColors.bg.secondary,
          color: semanticColors.text.secondary,
          icon: <Target size={iconSize.sm} />,
        };
    }
  };

  return (
    <div
      style={{
        marginBottom: spacing[4],
        backgroundColor: semanticColors.bg.primary,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing[3]} ${spacing[4]}`,
          marginBottom: spacing[2],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <Compass size={iconSize.base} style={{ color: semanticColors.accent.primary }} />
          <h3
            style={{
              fontSize: fontSize.base,
              fontWeight: 700,
              color: semanticColors.text.primary,
            }}
          >
            Life Balance
          </h3>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[1],
            padding: `${spacing[1]} ${spacing[2]}`,
            backgroundColor: `${balanceStatus.color}20`,
            borderRadius: borderRadius.full,
          }}
        >
          <span style={{ fontSize: fontSize.sm }}>{balanceStatus.icon}</span>
          <span
            style={{
              fontSize: fontSize.xs,
              fontWeight: 600,
              color: balanceStatus.color,
            }}
          >
            {balanceScore}%
          </span>
        </div>
      </div>

      {/* Zones Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: zones.length === 3 ? 'repeat(3, 1fr)' : zones.length === 2 ? 'repeat(2, 1fr)' : '1fr',
          gap: spacing[2],
          paddingLeft: spacing[4],
          paddingRight: spacing[4],
          marginBottom: spacing[3],
        }}
      >
        {zones.map((zone) => (
          <div
            key={zone.zone_id}
            onClick={() => onZoneSelect?.(zone.zone_id)}
            style={{
              backgroundColor: `${zone.color}15`,
              borderRadius: borderRadius.lg,
              border: `2px solid ${zone.color}40`,
              padding: spacing[3],
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Zone Icon & Name */}
            <div style={{ textAlign: 'center', marginBottom: spacing[2] }}>
              <div style={{ fontSize: '32px', marginBottom: spacing[1] }}>{zone.icon}</div>
              <div
                style={{
                  fontSize: fontSize.xs,
                  fontWeight: 600,
                  color: zone.color,
                  marginBottom: spacing[1],
                }}
              >
                {zone.name}
              </div>
              {zone.simple_goal && (
                <div
                  style={{
                    fontSize: '10px',
                    color: semanticColors.text.secondary,
                    marginTop: spacing[1],
                  }}
                >
                  {zone.simple_goal}
                </div>
              )}
            </div>

            {/* Progress Stats */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginBottom: spacing[2],
                paddingTop: spacing[2],
                borderTop: `1px solid ${semanticColors.border.default}`,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Today</div>
                <div
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: 700,
                    color: zone.color,
                  }}
                >
                  {zone.tasks_completed_today}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>Week</div>
                <div
                  style={{
                    fontSize: fontSize.sm,
                    fontWeight: 700,
                    color: zone.color,
                  }}
                >
                  {zone.tasks_completed_this_week}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: spacing[1],
                backgroundColor: semanticColors.bg.primary,
                borderRadius: borderRadius.full,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (zone.tasks_completed_this_week / 10) * 100)}%`,
                  height: '100%',
                  backgroundColor: zone.color,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Days Since Last Task Warning */}
            {zone.days_since_last_task && zone.days_since_last_task >= 3 && (
              <div
                style={{
                  marginTop: spacing[2],
                  padding: spacing[1],
                  backgroundColor: `${semanticColors.accent.warning}20`,
                  borderRadius: borderRadius.base,
                  textAlign: 'center',
                  fontSize: '10px',
                  color: semanticColors.accent.warning,
                  fontWeight: 600,
                }}
              >
                {zone.days_since_last_task} days ago
              </div>
            )}

            {/* Filter Button */}
            {onFilterByZone && (
              <div style={{ marginTop: spacing[2] }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterByZone(zone.name);
                  }}
                  style={{
                    width: '100%',
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: zone.color,
                    border: 'none',
                    borderRadius: borderRadius.base,
                    color: semanticColors.text.inverse,
                    fontSize: fontSize.xs,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  View Tasks
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Insights Section */}
      {insights.length > 0 && (
        <div
          style={{
            paddingLeft: spacing[4],
            paddingRight: spacing[4],
            marginBottom: spacing[3],
          }}
        >
          <div
            style={{
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}
          >
            Insights
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {insights.map((insight, index) => {
              const style = getInsightStyle(insight.type);
              const zone = zones.find((z) => z.zone_id === insight.zoneId);

              return (
                <div
                  key={index}
                  style={{
                    padding: spacing[3],
                    backgroundColor: style.bg,
                    borderRadius: borderRadius.base,
                    border: `1px solid ${style.color}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[2] }}>
                    <div style={{ color: style.color, flexShrink: 0 }}>{style.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: fontSize.xs,
                          color: semanticColors.text.primary,
                          marginBottom: insight.actionLabel ? spacing[2] : 0,
                        }}
                      >
                        {insight.message}
                      </p>
                      {insight.actionLabel && zone && onFilterByZone && (
                        <ChevronButton
                          label={insight.actionLabel}
                          variant="primary"
                          position="single"
                          size="micro"
                          onClick={() => onFilterByZone(zone.name)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Balance Message */}
      <div
        style={{
          marginTop: spacing[2],
          padding: spacing[3],
          marginLeft: spacing[4],
          marginRight: spacing[4],
          backgroundColor: semanticColors.bg.secondary,
          borderRadius: borderRadius.base,
          border: `1px solid ${semanticColors.border.default}`,
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
          {balanceScore >= 80
            ? "🎯 Excellent! You're maintaining great balance across all life zones."
            : balanceScore >= 60
              ? "👍 Good balance! Keep spreading attention across zones."
              : balanceScore >= 40
                ? "⚠️ Some zones need attention. Try to balance your focus."
                : "🔴 Imbalanced! Focus on neglected zones for better life balance."}
        </p>
      </div>
    </div>
  );
};

export default ZoneBalanceWidget;
