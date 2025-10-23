'use client'

import React from 'react';
import { Monitor, User, HelpCircle, ChevronRight } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors } from '@/lib/design-system';

interface SubTask {
  id: string;
  title: string;
  type: 'digital' | 'human' | 'needs_clarification';
  estimated_minutes?: number;
}

interface TaskNode {
  id: string;
  title: string;
  description?: string;
  subtasks?: SubTask[];
}

interface TaskTreeViewProps {
  task: TaskNode;
  onSaveAndScout: () => void;
}

const TaskTreeView: React.FC<TaskTreeViewProps> = ({ task, onSaveAndScout }) => {
  const getTypeIcon = (type: 'digital' | 'human' | 'needs_clarification') => {
    switch (type) {
      case 'digital':
        return <Monitor size={iconSize.sm} style={{ color: semanticColors.accent.primary }} />;
      case 'human':
        return <User size={iconSize.sm} style={{ color: semanticColors.accent.success }} />;
      case 'needs_clarification':
        return <HelpCircle size={iconSize.sm} style={{ color: semanticColors.accent.warning }} />;
    }
  };

  const getTypeBadge = (type: 'digital' | 'human' | 'needs_clarification') => {
    const colors = {
      digital: { bg: `${semanticColors.accent.primary}20`, border: semanticColors.accent.primary, text: semanticColors.accent.primary },
      human: { bg: `${semanticColors.accent.success}20`, border: semanticColors.accent.success, text: semanticColors.accent.success },
      needs_clarification: { bg: `${semanticColors.accent.warning}20`, border: semanticColors.accent.warning, text: semanticColors.accent.warning }
    };

    const labels = {
      digital: '🖥️ Digital',
      human: '👤 Human',
      needs_clarification: '❓ Needs Info'
    };

    return (
      <span
        style={{
          padding: `${spacing[1]} ${spacing[2]}`,
          borderRadius: borderRadius.full,
          fontSize: fontSize.xs,
          backgroundColor: colors[type].bg,
          border: `1px solid ${colors[type].border}`,
          color: colors[type].text,
          fontWeight: 'bold'
        }}
      >
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: semanticColors.bg.primary, padding: spacing[4] }}>
      {/* Header */}
      <div style={{ marginBottom: spacing[4] }}>
        <h2 style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: semanticColors.text.primary, marginBottom: spacing[1] }}>
          Task Breakdown
        </h2>
        <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
          Your task has been decomposed into actionable steps
        </p>
      </div>

      {/* Root Task Card */}
      <div
        className="mb-4"
        style={{
          backgroundColor: semanticColors.bg.secondary,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
          border: `2px solid ${semanticColors.accent.primary}`
        }}
      >
        <div className="flex items-start" style={{ gap: spacing[2], marginBottom: spacing[2] }}>
          <div
            style={{
              width: spacing[10],
              height: spacing[10],
              borderRadius: borderRadius.full,
              background: `linear-gradient(135deg, ${semanticColors.accent.primary}, ${semanticColors.accent.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: fontSize.lg }}>🎯</span>
          </div>
          <div className="flex-1">
            <h3 style={{ fontSize: fontSize.base, fontWeight: 'bold', color: semanticColors.text.primary, marginBottom: spacing[1] }}>
              {task.title}
            </h3>
            {task.description && (
              <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        {task.subtasks && task.subtasks.length > 0 && (
          <div
            style={{
              backgroundColor: `${semanticColors.accent.secondary}10`,
              borderRadius: borderRadius.base,
              padding: spacing[2],
              fontSize: fontSize.xs,
              color: semanticColors.text.secondary
            }}
          >
            Broken into {task.subtasks.length} {task.subtasks.length === 1 ? 'step' : 'steps'}
          </div>
        )}
      </div>

      {/* Subtasks List */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex-1 overflow-y-auto" style={{ marginBottom: spacing[4] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {task.subtasks.map((subtask, index) => (
              <div
                key={subtask.id}
                className="relative"
                style={{
                  backgroundColor: semanticColors.bg.secondary,
                  borderRadius: borderRadius.lg,
                  padding: spacing[3],
                  border: `1px solid ${semanticColors.border.default}`,
                  paddingLeft: spacing[6]
                }}
              >
                {/* Step number */}
                <div
                  className="absolute"
                  style={{
                    left: spacing[2],
                    top: spacing[3],
                    width: spacing[5],
                    height: spacing[5],
                    borderRadius: borderRadius.full,
                    backgroundColor: semanticColors.accent.secondary,
                    color: semanticColors.text.inverse,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: fontSize.xs,
                    fontWeight: 'bold'
                  }}
                >
                  {index + 1}
                </div>

                <div className="flex items-start justify-between" style={{ gap: spacing[2] }}>
                  <div className="flex-1">
                    <h4 style={{ fontSize: fontSize.sm, fontWeight: 'bold', color: semanticColors.text.primary, marginBottom: spacing[1] }}>
                      {subtask.title}
                    </h4>

                    <div className="flex items-center" style={{ gap: spacing[2], marginTop: spacing[1] }}>
                      {getTypeBadge(subtask.type)}
                      {subtask.estimated_minutes && (
                        <span
                          style={{
                            fontSize: fontSize.xs,
                            color: semanticColors.text.secondary,
                            padding: `${spacing[1]} ${spacing[2]}`,
                            backgroundColor: semanticColors.bg.primary,
                            borderRadius: borderRadius.sm
                          }}
                        >
                          ⏱️ {subtask.estimated_minutes} min
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={iconSize.sm} style={{ color: semanticColors.text.secondary }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onSaveAndScout}
        className="w-full transition-all active:scale-95"
        style={{
          background: `linear-gradient(135deg, ${semanticColors.accent.primary}, ${semanticColors.accent.secondary})`,
          color: semanticColors.text.inverse,
          padding: spacing[4],
          borderRadius: borderRadius.xl,
          fontSize: fontSize.base,
          fontWeight: 'bold',
          border: 'none',
          cursor: 'pointer',
          boxShadow: `0 4px 12px ${semanticColors.accent.primary}40`
        }}
      >
        Save & Go to Scout →
      </button>
    </div>
  );
};

export default TaskTreeView;
