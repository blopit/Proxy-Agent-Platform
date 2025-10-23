/**
 * TaskCardBig - Detailed task card for breakdown display
 * Shows comprehensive task information with micro-steps preview
 * ADHD-optimized with clear visual hierarchy
 */

'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  getPriorityBadgeClass,
  getStatusBadgeClass,
  formatEstimatedTime,
  formatMinutes,
  getLeafTypeIcon,
  getBreakdownSummary,
  truncateText,
} from '@/lib/card-utils';
import type { TaskCardProps } from '@/types/task-schema';

export interface TaskCardBigProps {
  task: TaskCardProps;
  onStartTask?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

/**
 * TaskCardBig Component
 * Displays task with micro-steps preview and breakdown visualization
 */
export default function TaskCardBig({
  task,
  onStartTask,
  onViewDetails,
  className,
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

  // Show first 3 micro-steps as preview
  const previewSteps = micro_steps.slice(0, 3);
  const hasMoreSteps = micro_steps.length > 3;

  return (
    <Card
      className={`bg-[#073642] border-2 ${
        priority === 'high' || priority === 'critical'
          ? 'border-[#dc322f]'
          : priority === 'medium'
            ? 'border-[#b58900]'
            : 'border-[#586e75]'
      } ${className}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4 mb-2">
          <CardTitle className="text-[#93a1a1] text-xl font-bold leading-tight flex-1">
            {title}
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeClass(priority)}`}
            >
              {priority}
            </span>
            {estimated_hours && (
              <span className="text-xs text-[#586e75]">
                {formatEstimatedTime(estimated_hours)}
              </span>
            )}
          </div>
        </div>

        {description && (
          <CardDescription className="text-[#93a1a1] text-sm leading-relaxed line-clamp-2">
            {description}
          </CardDescription>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-[#002b36] text-[#93a1a1] rounded-full text-xs border border-[#586e75]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Breakdown Summary */}
        {breakdown && (
          <div className="mb-4 p-3 bg-[#002b36] rounded-lg border border-[#586e75]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#93a1a1] uppercase tracking-wide">
                Task Breakdown
              </span>
              <span className="text-xs text-[#586e75]">
                {breakdown.total_steps} steps
              </span>
            </div>

            {/* Visual breakdown bar */}
            <div className="flex gap-1 h-2 mb-2 rounded-full overflow-hidden">
              {breakdown.digital_count > 0 && (
                <div
                  className="bg-[#2aa198]"
                  style={{
                    width: `${(breakdown.digital_count / breakdown.total_steps) * 100}%`,
                  }}
                  title={`${breakdown.digital_count} digital steps`}
                />
              )}
              {breakdown.human_count > 0 && (
                <div
                  className="bg-[#268bd2]"
                  style={{
                    width: `${(breakdown.human_count / breakdown.total_steps) * 100}%`,
                  }}
                  title={`${breakdown.human_count} human steps`}
                />
              )}
            </div>

            <p className="text-sm text-[#93a1a1]">{getBreakdownSummary(breakdown)}</p>
          </div>
        )}

        {/* Micro-steps Preview */}
        {previewSteps.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-[#93a1a1] uppercase tracking-wide mb-2">
              Next Steps
            </h4>
            <div className="space-y-2">
              {previewSteps.map((step, index) => (
                <div
                  key={step.step_id}
                  className="flex items-start gap-3 p-2 bg-[#002b36] rounded border border-[#586e75] hover:border-[#2aa198] transition-colors relative"
                >
                  {/* Step icon with robot badge for DIGITAL steps */}
                  <div className="flex-shrink-0 mt-0.5 relative">
                    {/* Show custom emoji or fallback icon */}
                    <span className="text-lg" title={`${step.leaf_type}${step.icon ? ` - ${step.short_label || ''}` : ''}`}>
                      {step.icon ? step.icon : getLeafTypeIcon(step.leaf_type)}
                    </span>
                    {/* Robot badge overlay for automatable steps */}
                    {step.leaf_type === 'DIGITAL' && (
                      <div
                        className="absolute -bottom-1 -right-1 bg-[#2aa198] rounded-full p-0.5 shadow-sm"
                        title="Can be automated by AI"
                      >
                        <Bot size={10} className="text-[#002b36]" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#93a1a1] leading-relaxed">
                      {truncateText(step.description, 80)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#586e75]">
                        {formatMinutes(step.estimated_minutes)}
                      </span>
                      <span className="text-xs text-[#586e75]">•</span>
                      <span
                        className={`text-xs ${
                          step.leaf_type === 'DIGITAL'
                            ? 'text-[#2aa198]'
                            : 'text-[#268bd2]'
                        }`}
                      >
                        {step.leaf_type === 'DIGITAL' ? 'Automatable' : 'Manual'}
                      </span>
                    </div>
                  </div>

                  {/* Step number */}
                  <div className="flex-shrink-0">
                    <span className="text-xs text-[#586e75] font-medium">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}

              {hasMoreSteps && (
                <button
                  onClick={onViewDetails}
                  className="w-full p-2 text-xs text-[#268bd2] hover:text-[#2aa198] text-center transition-colors"
                >
                  +{micro_steps.length - 3} more steps...
                </button>
              )}
            </div>
          </div>
        )}

        {/* Digital task indicator */}
        {is_digital && (
          <div className="mt-4 flex items-center p-2 bg-[#002b36] rounded-lg border border-[#2aa198]">
            <span className="text-[#2aa198] mr-2">⚡</span>
            <span className="text-[#2aa198] text-sm font-medium">
              Can be delegated to agents
            </span>
          </div>
        )}

        {/* Progress indicator */}
        {subtask_progress && subtask_progress.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#93a1a1]">Progress</span>
              <span className="text-xs text-[#586e75]">
                {subtask_progress.completed} / {subtask_progress.total} steps
              </span>
            </div>
            <div className="h-2 bg-[#002b36] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#859900] transition-all duration-300"
                style={{ width: `${subtask_progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      {/* Action Buttons */}
      {(onStartTask || onViewDetails) && (
        <CardFooter className="flex gap-2">
          {onStartTask && (
            <button
              onClick={onStartTask}
              className="flex-1 px-4 py-2 bg-[#2aa198] hover:bg-[#2aa198]/90 text-[#002b36] font-medium rounded-lg transition-colors active:scale-95"
            >
              Start First Step
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="px-4 py-2 bg-[#073642] hover:bg-[#002b36] text-[#93a1a1] border border-[#586e75] rounded-lg transition-colors active:scale-95"
            >
              View All
            </button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
