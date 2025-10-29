'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  User,
  Link2,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Target,
} from 'lucide-react';
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
  is_digital?: boolean;
  created_at?: string;
  due_date?: string;
  zone?: string;
}

interface RelatedFile {
  id: string;
  name: string;
  type: 'doc' | 'pdf' | 'link' | 'image' | 'code';
  url?: string;
  lastModified?: string;
}

interface RelatedContact {
  id: string;
  name: string;
  role?: string; // 'assigned_by' | 'can_help' | 'stakeholder'
  avatar?: string;
}

interface Dependency {
  task_id: string;
  title: string;
  type: 'blocks' | 'blocked_by' | 'related_to';
  status: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface TaskInspectorProps {
  task: Task;
  relatedFiles?: RelatedFile[];
  relatedContacts?: RelatedContact[];
  dependencies?: Dependency[];
  activityHistory?: ActivityLog[];
  energyCost?: number; // 1-10 scale
  estimatedReward?: { xp: number; impact: string };
  readinessStatus?: 'ready' | 'needs_context' | 'blocked';
  onHunt: () => void;
  onClose: () => void;
  onPin?: () => void;
  onDefer?: () => void;
  onEdit?: () => void;
}

// ============================================================================
// Component
// ============================================================================

const TaskInspector: React.FC<TaskInspectorProps> = ({
  task,
  relatedFiles = [],
  relatedContacts = [],
  dependencies = [],
  activityHistory = [],
  energyCost = 5,
  estimatedReward = { xp: 50, impact: 'medium' },
  readinessStatus = 'ready',
  onHunt,
  onClose,
  onPin,
  onDefer,
  onEdit,
}) => {
  const [activeSection, setActiveSection] = useState<'details' | 'files' | 'contacts' | 'deps' | 'history'>('details');

  // Get readiness status styling
  const getReadinessStyle = () => {
    switch (readinessStatus) {
      case 'ready':
        return {
          bg: `${semanticColors.accent.success}20`,
          border: semanticColors.accent.success,
          icon: CheckCircle2,
          text: 'Ready to Hunt',
          color: semanticColors.accent.success,
        };
      case 'needs_context':
        return {
          bg: `${colors.yellow}20`,
          border: colors.yellow,
          icon: AlertCircle,
          text: 'Needs Context',
          color: colors.yellow,
        };
      case 'blocked':
        return {
          bg: `${semanticColors.accent.error}20`,
          border: semanticColors.accent.error,
          icon: AlertCircle,
          text: 'Blocked',
          color: semanticColors.accent.error,
        };
    }
  };

  const readiness = getReadinessStyle();
  const ReadinessIcon = readiness.icon;

  // Get file type icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'doc':
        return '📄';
      case 'pdf':
        return '📕';
      case 'link':
        return '🔗';
      case 'image':
        return '🖼️';
      case 'code':
        return '💻';
      default:
        return '📎';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return semanticColors.accent.error;
      case 'medium':
        return colors.yellow;
      case 'low':
        return semanticColors.accent.success;
      default:
        return semanticColors.text.secondary;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      {/* Bottom Sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxHeight: '85vh',
          backgroundColor: semanticColors.bg.primary,
          borderTopLeftRadius: borderRadius.xl,
          borderTopRightRadius: borderRadius.xl,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing[4],
            borderBottom: `1px solid ${semanticColors.border.default}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1, paddingRight: spacing[3] }}>
            <h2
              style={{
                fontSize: fontSize.lg,
                fontWeight: 700,
                color: semanticColors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {task.title}
            </h2>

            {/* Readiness Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[1],
                padding: `${spacing[1]} ${spacing[2]}`,
                backgroundColor: readiness.bg,
                border: `1px solid ${readiness.border}`,
                borderRadius: borderRadius.full,
              }}
            >
              <ReadinessIcon size={14} style={{ color: readiness.color }} />
              <span style={{ fontSize: fontSize.xs, fontWeight: 600, color: readiness.color }}>
                {readiness.text}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: spacing[2],
              backgroundColor: semanticColors.bg.secondary,
              borderRadius: borderRadius.full,
              border: `1px solid ${semanticColors.border.default}`,
              cursor: 'pointer',
            }}
          >
            <X size={iconSize.base} style={{ color: semanticColors.text.primary }} />
          </button>
        </div>

        {/* Section Tabs */}
        <div
          style={{
            display: 'flex',
            gap: spacing[1],
            padding: `${spacing[2]} ${spacing[4]}`,
            borderBottom: `1px solid ${semanticColors.border.default}`,
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'details', label: 'Details', count: null },
            { id: 'files', label: 'Files', count: relatedFiles.length },
            { id: 'contacts', label: 'Contacts', count: relatedContacts.length },
            { id: 'deps', label: 'Links', count: dependencies.length },
            { id: 'history', label: 'History', count: activityHistory.length },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              style={{
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor:
                  activeSection === section.id ? semanticColors.accent.secondary : 'transparent',
                color:
                  activeSection === section.id
                    ? semanticColors.text.inverse
                    : semanticColors.text.secondary,
                border: 'none',
                borderRadius: borderRadius.base,
                fontSize: fontSize.sm,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
              }}
            >
              {section.label}
              {section.count !== null && section.count > 0 && (
                <span
                  style={{
                    backgroundColor:
                      activeSection === section.id ? semanticColors.text.inverse : semanticColors.bg.secondary,
                    color:
                      activeSection === section.id ? semanticColors.accent.secondary : semanticColors.text.primary,
                    padding: `0 ${spacing[1]}`,
                    borderRadius: borderRadius.full,
                    fontSize: '10px',
                    fontWeight: 700,
                    minWidth: spacing[4],
                    textAlign: 'center',
                  }}
                >
                  {section.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area - Scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: spacing[4],
          }}
        >
          {/* Details Section */}
          {activeSection === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
              {/* Description */}
              {task.description && (
                <div>
                  <p
                    style={{
                      fontSize: fontSize.sm,
                      color: semanticColors.text.primary,
                      lineHeight: 1.6,
                    }}
                  >
                    {task.description}
                  </p>
                </div>
              )}

              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing[3],
                }}
              >
                {/* Priority */}
                <div
                  style={{
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.base,
                    border: `1px solid ${semanticColors.border.default}`,
                  }}
                >
                  <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
                    Priority
                  </div>
                  <div
                    style={{
                      fontSize: fontSize.base,
                      fontWeight: 700,
                      color: getPriorityColor(task.priority),
                      textTransform: 'capitalize',
                    }}
                  >
                    {task.priority || 'Medium'}
                  </div>
                </div>

                {/* Estimated Time */}
                <div
                  style={{
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.base,
                    border: `1px solid ${semanticColors.border.default}`,
                  }}
                >
                  <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
                    Est. Time
                  </div>
                  <div style={{ fontSize: fontSize.base, fontWeight: 700, color: semanticColors.text.primary }}>
                    {task.estimated_hours
                      ? task.estimated_hours < 1
                        ? `${Math.round(task.estimated_hours * 60)}m`
                        : `${task.estimated_hours}h`
                      : '15m'}
                  </div>
                </div>

                {/* Energy Cost */}
                <div
                  style={{
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.base,
                    border: `1px solid ${semanticColors.border.default}`,
                  }}
                >
                  <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
                    Energy Cost
                  </div>
                  <div style={{ display: 'flex', gap: spacing[1] }}>
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: spacing[2],
                          height: spacing[4],
                          backgroundColor: i < energyCost ? colors.orange : semanticColors.bg.primary,
                          borderRadius: borderRadius.sm,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Reward */}
                <div
                  style={{
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.base,
                    border: `1px solid ${semanticColors.border.default}`,
                  }}
                >
                  <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
                    Reward
                  </div>
                  <div style={{ fontSize: fontSize.base, fontWeight: 700, color: colors.yellow }}>
                    +{estimatedReward.xp} XP
                  </div>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[2] }}>
                    Tags
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing[2] }}>
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        style={{
                          padding: `${spacing[1]} ${spacing[2]}`,
                          backgroundColor: semanticColors.bg.secondary,
                          border: `1px solid ${semanticColors.border.default}`,
                          borderRadius: borderRadius.full,
                          fontSize: fontSize.xs,
                          color: semanticColors.text.primary,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Zone */}
              {task.zone && (
                <div
                  style={{
                    padding: spacing[3],
                    backgroundColor: `${semanticColors.accent.secondary}15`,
                    border: `1px solid ${semanticColors.accent.secondary}`,
                    borderRadius: borderRadius.base,
                  }}
                >
                  <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
                    Life Zone
                  </div>
                  <div style={{ fontSize: fontSize.base, fontWeight: 600, color: semanticColors.accent.secondary }}>
                    {task.zone}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Files Section */}
          {activeSection === 'files' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {relatedFiles.length > 0 ? (
                relatedFiles.map((file) => (
                  <div
                    key={file.id}
                    style={{
                      padding: spacing[3],
                      backgroundColor: semanticColors.bg.secondary,
                      borderRadius: borderRadius.base,
                      border: `1px solid ${semanticColors.border.default}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[3],
                      cursor: 'pointer',
                    }}
                    onClick={() => file.url && window.open(file.url, '_blank')}
                  >
                    <span style={{ fontSize: '24px' }}>{getFileIcon(file.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: fontSize.sm, fontWeight: 600, color: semanticColors.text.primary }}>
                        {file.name}
                      </div>
                      {file.lastModified && (
                        <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1] }}>
                          Modified {file.lastModified}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: spacing[8] }}>
                  <FileText size={48} style={{ color: semanticColors.text.muted, margin: '0 auto', marginBottom: spacing[2] }} />
                  <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>No related files</p>
                </div>
              )}
            </div>
          )}

          {/* Contacts Section */}
          {activeSection === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {relatedContacts.length > 0 ? (
                relatedContacts.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      padding: spacing[3],
                      backgroundColor: semanticColors.bg.secondary,
                      borderRadius: borderRadius.base,
                      border: `1px solid ${semanticColors.border.default}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[3],
                    }}
                  >
                    <div
                      style={{
                        width: spacing[10],
                        height: spacing[10],
                        borderRadius: borderRadius.full,
                        backgroundColor: semanticColors.accent.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: fontSize.lg,
                        fontWeight: 700,
                        color: semanticColors.text.inverse,
                      }}
                    >
                      {contact.avatar || contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: fontSize.sm, fontWeight: 600, color: semanticColors.text.primary }}>
                        {contact.name}
                      </div>
                      {contact.role && (
                        <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1], textTransform: 'capitalize' }}>
                          {contact.role.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: spacing[8] }}>
                  <User size={48} style={{ color: semanticColors.text.muted, margin: '0 auto', marginBottom: spacing[2] }} />
                  <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>No related contacts</p>
                </div>
              )}
            </div>
          )}

          {/* Dependencies Section */}
          {activeSection === 'deps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {dependencies.length > 0 ? (
                dependencies.map((dep) => (
                  <div
                    key={dep.task_id}
                    style={{
                      padding: spacing[3],
                      backgroundColor: semanticColors.bg.secondary,
                      borderRadius: borderRadius.base,
                      border: `1px solid ${dep.type === 'blocked_by' ? semanticColors.accent.error : semanticColors.border.default}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                      <Link2 size={14} style={{ color: semanticColors.text.secondary }} />
                      <span
                        style={{
                          fontSize: fontSize.xs,
                          color: dep.type === 'blocked_by' ? semanticColors.accent.error : semanticColors.text.secondary,
                          textTransform: 'capitalize',
                        }}
                      >
                        {dep.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: fontSize.sm, fontWeight: 600, color: semanticColors.text.primary }}>
                      {dep.title}
                    </div>
                    <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1] }}>
                      Status: {dep.status}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: spacing[8] }}>
                  <Link2 size={48} style={{ color: semanticColors.text.muted, margin: '0 auto', marginBottom: spacing[2] }} />
                  <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>No dependencies</p>
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {activeSection === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {activityHistory.length > 0 ? (
                activityHistory.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      padding: spacing[3],
                      backgroundColor: semanticColors.bg.secondary,
                      borderRadius: borderRadius.base,
                      border: `1px solid ${semanticColors.border.default}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                      <Clock size={14} style={{ color: semanticColors.text.secondary }} />
                      <span style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary }}>
                        {activity.timestamp}
                      </span>
                    </div>
                    <div style={{ fontSize: fontSize.sm, fontWeight: 600, color: semanticColors.text.primary }}>
                      {activity.action}
                    </div>
                    {activity.details && (
                      <div style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1] }}>
                        {activity.details}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: spacing[8] }}>
                  <Clock size={48} style={{ color: semanticColors.text.muted, margin: '0 auto', marginBottom: spacing[2] }} />
                  <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>No activity history</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div
          style={{
            padding: spacing[4],
            borderTop: `1px solid ${semanticColors.border.default}`,
            backgroundColor: semanticColors.bg.secondary,
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[2],
          }}
        >
          {/* Primary Action */}
          <button
            onClick={onHunt}
            disabled={readinessStatus === 'blocked'}
            style={{
              width: '100%',
              padding: spacing[3],
              backgroundColor: readinessStatus === 'blocked' ? semanticColors.bg.primary : colors.orange,
              color: readinessStatus === 'blocked' ? semanticColors.text.muted : semanticColors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.base,
              fontSize: fontSize.base,
              fontWeight: 700,
              cursor: readinessStatus === 'blocked' ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
              opacity: readinessStatus === 'blocked' ? 0.5 : 1,
            }}
          >
            <Target size={iconSize.base} />
            {readinessStatus === 'blocked' ? 'Blocked - Cannot Hunt' : 'Hunt This Task'}
          </button>

          {/* Secondary Actions */}
          <div style={{ display: 'flex', gap: spacing[2] }}>
            {onPin && (
              <button
                onClick={onPin}
                style={{
                  flex: 1,
                  padding: spacing[2],
                  backgroundColor: semanticColors.bg.primary,
                  color: semanticColors.text.primary,
                  border: `1px solid ${semanticColors.border.default}`,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.sm,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                📌 Pin
              </button>
            )}
            {onDefer && (
              <button
                onClick={onDefer}
                style={{
                  flex: 1,
                  padding: spacing[2],
                  backgroundColor: semanticColors.bg.primary,
                  color: semanticColors.text.primary,
                  border: `1px solid ${semanticColors.border.default}`,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.sm,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ⏸️ Defer
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                style={{
                  flex: 1,
                  padding: spacing[2],
                  backgroundColor: semanticColors.bg.primary,
                  color: semanticColors.text.primary,
                  border: `1px solid ${semanticColors.border.default}`,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.sm,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ✏️ Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskInspector;
