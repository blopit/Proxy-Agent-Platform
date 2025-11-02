/**
 * TaskCardBig - React Native Version
 * Converted from Next.js web component
 * Shows comprehensive task information with micro-steps preview
 * ADHD-optimized with clear visual hierarchy
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Bot } from 'lucide-react-native';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';

// Types (same as web version)
interface MicroStep {
  step_id: string;
  description: string;
  estimated_minutes: number;
  leaf_type: 'DIGITAL' | 'HUMAN';
  icon?: string;
  short_label?: string;
}

interface Breakdown {
  total_steps: number;
  digital_count: number;
  human_count: number;
}

interface SubtaskProgress {
  total: number;
  completed: number;
  percentage: number;
}

interface TaskCardBigProps {
  task: {
    title: string;
    description?: string;
    status?: 'pending' | 'in-progress' | 'completed';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    estimated_hours?: number;
    tags?: string[];
    micro_steps?: MicroStep[];
    breakdown?: Breakdown;
    subtask_progress?: SubtaskProgress;
    is_digital?: boolean;
  };
  onStartTask?: () => void;
  onViewDetails?: () => void;
}

// Utility functions
const getPriorityVariant = (priority: string) => {
  if (priority === 'high' || priority === 'critical') return 'high-priority';
  if (priority === 'medium') return 'medium-priority';
  return 'low-priority';
};

const formatEstimatedTime = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
};

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.round(minutes / 60)}h`;
};

const getLeafTypeIcon = (leafType: string) => {
  return leafType === 'DIGITAL' ? '💻' : '👤';
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function TaskCardBig({
  task,
  onStartTask,
  onViewDetails,
}: TaskCardBigProps) {
  const {
    title,
    description,
    status = 'pending',
    priority = 'medium',
    estimated_hours,
    tags = [],
    micro_steps = [],
    breakdown,
    subtask_progress,
    is_digital,
  } = task;

  const previewSteps = micro_steps.slice(0, 3);
  const hasMoreSteps = micro_steps.length > 3;

  return (
    <Card variant={getPriorityVariant(priority)}>
      <CardHeader>
        {/* Title and Priority Badge */}
        <View style={styles.headerTop}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.priorityBadge, styles[`${priority}Badge`]]}>
              <Text style={styles.priorityText}>{priority}</Text>
            </View>
            {estimated_hours && (
              <Text style={styles.estimatedTime}>
                {formatEstimatedTime(estimated_hours)}
              </Text>
            )}
          </View>
        </View>

        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </CardHeader>

      <CardContent>
        {/* Breakdown Summary */}
        {breakdown && (
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownLabel}>TASK BREAKDOWN</Text>
              <Text style={styles.breakdownSteps}>{breakdown.total_steps} steps</Text>
            </View>

            {/* Visual breakdown bar */}
            <View style={styles.breakdownBar}>
              {breakdown.digital_count > 0 && (
                <View
                  style={[
                    styles.breakdownSegment,
                    styles.digitalSegment,
                    { flex: breakdown.digital_count },
                  ]}
                />
              )}
              {breakdown.human_count > 0 && (
                <View
                  style={[
                    styles.breakdownSegment,
                    styles.humanSegment,
                    { flex: breakdown.human_count },
                  ]}
                />
              )}
            </View>

            <Text style={styles.breakdownSummary}>
              {breakdown.digital_count} digital • {breakdown.human_count} manual
            </Text>
          </View>
        )}

        {/* Micro-steps Preview */}
        {previewSteps.length > 0 && (
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsLabel}>NEXT STEPS</Text>
            {previewSteps.map((step, index) => (
              <View key={step.step_id} style={styles.stepCard}>
                {/* Step icon */}
                <View style={styles.stepIconContainer}>
                  <Text style={styles.stepIcon}>
                    {step.icon || getLeafTypeIcon(step.leaf_type)}
                  </Text>
                  {step.leaf_type === 'DIGITAL' && (
                    <View style={styles.robotBadge}>
                      <Bot size={10} color="#002b36" strokeWidth={2.5} />
                    </View>
                  )}
                </View>

                {/* Step content */}
                <View style={styles.stepContent}>
                  <Text style={styles.stepDescription}>
                    {truncateText(step.description, 80)}
                  </Text>
                  <View style={styles.stepMeta}>
                    <Text style={styles.stepMetaText}>
                      {formatMinutes(step.estimated_minutes)}
                    </Text>
                    <Text style={styles.stepMetaText}>•</Text>
                    <Text
                      style={[
                        styles.stepMetaText,
                        step.leaf_type === 'DIGITAL'
                          ? styles.digitalText
                          : styles.humanText,
                      ]}
                    >
                      {step.leaf_type === 'DIGITAL' ? 'Automatable' : 'Manual'}
                    </Text>
                  </View>
                </View>

                {/* Step number */}
                <Text style={styles.stepNumber}>#{index + 1}</Text>
              </View>
            ))}

            {hasMoreSteps && (
              <TouchableOpacity onPress={onViewDetails} style={styles.moreStepsButton}>
                <Text style={styles.moreStepsText}>
                  +{micro_steps.length - 3} more steps...
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Digital task indicator */}
        {is_digital && (
          <View style={styles.digitalIndicator}>
            <Text style={styles.digitalIcon}>⚡</Text>
            <Text style={styles.digitalLabel}>Can be delegated to agents</Text>
          </View>
        )}

        {/* Progress indicator */}
        {subtask_progress && subtask_progress.total > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressCount}>
                {subtask_progress.completed} / {subtask_progress.total} steps
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${subtask_progress.percentage}%` },
                ]}
              />
            </View>
          </View>
        )}
      </CardContent>

      {/* Action Buttons */}
      {(onStartTask || onViewDetails) && (
        <CardFooter style={styles.footerButtons}>
          {onStartTask && (
            <TouchableOpacity
              onPress={onStartTask}
              style={[styles.button, styles.primaryButton]}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Start First Step</Text>
            </TouchableOpacity>
          )}
          {onViewDetails && (
            <TouchableOpacity
              onPress={onViewDetails}
              style={[styles.button, styles.secondaryButton]}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>View All</Text>
            </TouchableOpacity>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  // Header styles
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#93a1a1', // Solarized base1
    lineHeight: 28,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lowBadge: {
    backgroundColor: '#586e75',
  },
  mediumBadge: {
    backgroundColor: '#b58900',
  },
  highBadge: {
    backgroundColor: '#dc322f',
  },
  criticalBadge: {
    backgroundColor: '#dc322f',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#586e75',
  },
  description: {
    fontSize: 14,
    color: '#93a1a1',
    lineHeight: 20,
    marginTop: 4,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#002b36',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#586e75',
  },
  tagText: {
    fontSize: 12,
    color: '#93a1a1',
  },

  // Breakdown
  breakdownContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#002b36',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#586e75',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93a1a1',
    letterSpacing: 0.5,
  },
  breakdownSteps: {
    fontSize: 12,
    color: '#586e75',
  },
  breakdownBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    gap: 2,
  },
  breakdownSegment: {
    height: '100%',
  },
  digitalSegment: {
    backgroundColor: '#2aa198', // Solarized cyan
  },
  humanSegment: {
    backgroundColor: '#268bd2', // Solarized blue
  },
  breakdownSummary: {
    fontSize: 14,
    color: '#93a1a1',
  },

  // Steps
  stepsContainer: {
    marginBottom: 16,
  },
  stepsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93a1a1',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 8,
    backgroundColor: '#002b36',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#586e75',
    marginBottom: 8,
  },
  stepIconContainer: {
    position: 'relative',
    marginTop: 2,
  },
  stepIcon: {
    fontSize: 18,
  },
  robotBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#2aa198',
    borderRadius: 8,
    padding: 2,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    color: '#93a1a1',
    lineHeight: 20,
  },
  stepMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stepMetaText: {
    fontSize: 12,
    color: '#586e75',
  },
  digitalText: {
    color: '#2aa198',
  },
  humanText: {
    color: '#268bd2',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#586e75',
  },
  moreStepsButton: {
    padding: 8,
    alignItems: 'center',
  },
  moreStepsText: {
    fontSize: 12,
    color: '#268bd2',
  },

  // Digital indicator
  digitalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#002b36',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2aa198',
    marginTop: 16,
  },
  digitalIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  digitalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2aa198',
  },

  // Progress
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#93a1a1',
  },
  progressCount: {
    fontSize: 12,
    color: '#586e75',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#002b36',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#859900', // Solarized green
  },

  // Buttons
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#2aa198',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#002b36',
  },
  secondaryButton: {
    backgroundColor: '#073642',
    borderWidth: 1,
    borderColor: '#586e75',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
  },
});
