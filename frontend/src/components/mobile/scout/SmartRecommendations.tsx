'use client';

import React, { useState } from 'react';
import { Sparkles, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';

// ============================================================================
// Types
// ============================================================================

interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  estimated_hours?: number;
  tags?: string[];
  zone?: string;
}

export interface Recommendation {
  task: Task;
  reason: string;
  badges: ('urgent' | 'quick-win' | 'high-impact' | 'zone-neglected' | 'energy-match' | 'trending')[];
  confidence: number; // 0-100
}

export interface SmartRecommendationsProps {
  recommendations: Recommendation[];
  onHunt: (task: Task) => void;
  onViewTask: (task: Task) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ============================================================================
// Component
// ============================================================================

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  recommendations,
  onHunt,
  onViewTask,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Badge styling
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'urgent':
        return {
          bg: `${semanticColors.accent.error}20`,
          color: semanticColors.accent.error,
          label: '⏰ Urgent',
        };
      case 'quick-win':
        return {
          bg: `${semanticColors.accent.success}20`,
          color: semanticColors.accent.success,
          label: '⚡ Quick Win',
        };
      case 'high-impact':
        return {
          bg: `${colors.orange}20`,
          color: colors.orange,
          label: '🎯 High Impact',
        };
      case 'zone-neglected':
        return {
          bg: `${colors.violet}20`,
          color: colors.violet,
          label: '⚖️ Zone Balance',
        };
      case 'energy-match':
        return {
          bg: `${semanticColors.accent.primary}20`,
          color: semanticColors.accent.primary,
          label: '⚡ Energy Match',
        };
      case 'trending':
        return {
          bg: `${colors.magenta}20`,
          color: colors.magenta,
          label: '🔥 Trending',
        };
      default:
        return {
          bg: semanticColors.bg.secondary,
          color: semanticColors.text.secondary,
          label: badge,
        };
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return semanticColors.accent.success;
    if (confidence >= 60) return semanticColors.accent.primary;
    if (confidence >= 40) return colors.yellow;
    return semanticColors.text.secondary;
  };

  if (recommendations.length === 0) {
    return null;
  }

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
          <Sparkles size={iconSize.base} style={{ color: colors.yellow }} />
          <h3
            style={{
              fontSize: fontSize.base,
              fontWeight: 700,
              color: semanticColors.text.primary,
            }}
          >
            Recommended for You
          </h3>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            style={{
              padding: spacing[1],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: semanticColors.text.secondary,
            }}
          >
            {isCollapsed ? <ChevronDown size={iconSize.base} /> : <ChevronUp size={iconSize.base} />}
          </button>
        )}
      </div>

      {/* Recommendations List */}
      {!isCollapsed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
            paddingLeft: spacing[4],
            paddingRight: spacing[4],
          }}
        >
          {recommendations.map((rec, index) => {
            const isExpanded = expandedId === (rec.task.task_id || rec.task.id?.toString());
            const primaryBadge = rec.badges[0] ? getBadgeStyle(rec.badges[0]) : null;

            return (
              <div
                key={rec.task.task_id || rec.task.id || index}
                style={{
                  backgroundColor: semanticColors.bg.secondary,
                  borderRadius: borderRadius.lg,
                  border: `2px solid ${getConfidenceColor(rec.confidence)}`,
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Main Content */}
                <div
                  onClick={() => onViewTask(rec.task)}
                  style={{
                    padding: spacing[3],
                    cursor: 'pointer',
                  }}
                >
                  {/* Rank Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: spacing[2],
                      marginBottom: spacing[2],
                    }}
                  >
                    <div
                      style={{
                        width: spacing[6],
                        height: spacing[6],
                        borderRadius: borderRadius.full,
                        backgroundColor: getConfidenceColor(rec.confidence),
                        color: semanticColors.text.inverse,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: fontSize.sm,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      {/* Title */}
                      <h4
                        style={{
                          fontSize: fontSize.sm,
                          fontWeight: 600,
                          color: semanticColors.text.primary,
                          marginBottom: spacing[1],
                          lineHeight: 1.4,
                        }}
                      >
                        {rec.task.title}
                      </h4>

                      {/* Primary Badge */}
                      {primaryBadge && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: primaryBadge.bg,
                            borderRadius: borderRadius.full,
                            marginBottom: spacing[2],
                          }}
                        >
                          <span
                            style={{
                              fontSize: fontSize.xs,
                              fontWeight: 600,
                              color: primaryBadge.color,
                            }}
                          >
                            {primaryBadge.label}
                          </span>
                        </div>
                      )}

                      {/* Reason */}
                      <p
                        style={{
                          fontSize: fontSize.xs,
                          color: semanticColors.text.secondary,
                          lineHeight: 1.5,
                          marginBottom: spacing[2],
                        }}
                      >
                        {rec.reason}
                      </p>

                      {/* Additional Badges */}
                      {rec.badges.length > 1 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[1] }}>
                          {rec.badges.slice(1).map((badge, badgeIndex) => {
                            const style = getBadgeStyle(badge);
                            return (
                              <div
                                key={badgeIndex}
                                style={{
                                  display: 'inline-flex',
                                  padding: `${spacing[0]} ${spacing[2]}`,
                                  backgroundColor: style.bg,
                                  borderRadius: borderRadius.full,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    color: style.color,
                                  }}
                                >
                                  {style.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Confidence Bar */}
                      <div style={{ marginTop: spacing[2] }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: spacing[1],
                          }}
                        >
                          <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
                            Confidence
                          </span>
                          <span
                            style={{
                              fontSize: fontSize.xs,
                              fontWeight: 600,
                              color: getConfidenceColor(rec.confidence),
                            }}
                          >
                            {rec.confidence}%
                          </span>
                        </div>
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
                              width: `${rec.confidence}%`,
                              height: '100%',
                              backgroundColor: getConfidenceColor(rec.confidence),
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hunt Button */}
                <div style={{ padding: `0 ${spacing[3]} ${spacing[3]}` }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onHunt(rec.task);
                    }}
                    style={{
                      width: '100%',
                      padding: spacing[2],
                      backgroundColor: colors.orange,
                      color: semanticColors.text.inverse,
                      border: 'none',
                      borderRadius: borderRadius.base,
                      fontSize: fontSize.sm,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing[2],
                      transition: 'all 0.2s ease',
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Target size={iconSize.sm} />
                    Hunt This Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collapsed State */}
      {isCollapsed && (
        <div
          style={{
            padding: spacing[3],
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
