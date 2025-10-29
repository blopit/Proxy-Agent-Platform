'use client';

import React, { useRef } from 'react';
import { FileText, Circle, Pin } from 'lucide-react';
import { spacing, fontSize, borderRadius, iconSize, semanticColors, colors } from '@/lib/design-system';

// ============================================================================
// Types
// ============================================================================

interface WorkspaceFile {
  id: string;
  name: string;
  type: 'doc' | 'pdf' | 'link' | 'image' | 'code' | 'sheet';
  lastOpened?: string;
  relatedTaskId?: string; // Link to a task
}

interface InProgressTask {
  id: string;
  title: string;
  progress: number; // 0-100
  lastWorkedOn?: string;
}

interface PinnedItem {
  id: string;
  title: string;
  type: 'task' | 'file' | 'note';
}

export interface WorkspaceOverviewProps {
  openFiles?: WorkspaceFile[];
  inProgressTasks?: InProgressTask[];
  pinnedItems?: PinnedItem[];
  onFileClick?: (file: WorkspaceFile) => void;
  onTaskClick?: (task: InProgressTask) => void;
  onPinnedClick?: (item: PinnedItem) => void;
  onCloseFile?: (fileId: string) => void;
  onUnpin?: (itemId: string) => void;
  suggestRelatedTask?: { file: WorkspaceFile; task: any } | null;
}

// ============================================================================
// Component
// ============================================================================

const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  openFiles = [],
  inProgressTasks = [],
  pinnedItems = [],
  onFileClick,
  onTaskClick,
  onPinnedClick,
  onCloseFile,
  onUnpin,
  suggestRelatedTask,
}) => {
  const filesScrollRef = useRef<HTMLDivElement>(null);
  const tasksScrollRef = useRef<HTMLDivElement>(null);
  const pinnedScrollRef = useRef<HTMLDivElement>(null);

  // Get file type icon and color
  const getFileStyle = (type: string) => {
    switch (type) {
      case 'doc':
        return { icon: '📄', color: semanticColors.accent.secondary };
      case 'pdf':
        return { icon: '📕', color: semanticColors.accent.error };
      case 'link':
        return { icon: '🔗', color: semanticColors.accent.primary };
      case 'image':
        return { icon: '🖼️', color: colors.violet };
      case 'code':
        return { icon: '💻', color: semanticColors.accent.success };
      case 'sheet':
        return { icon: '📊', color: colors.green };
      default:
        return { icon: '📎', color: semanticColors.text.secondary };
    }
  };

  const hasContent = openFiles.length > 0 || inProgressTasks.length > 0 || pinnedItems.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div style={{ marginBottom: spacing[4] }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing[2]} ${spacing[4]}`,
          marginBottom: spacing[2],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <FileText size={iconSize.base} style={{ color: semanticColors.accent.primary }} />
          <h3
            style={{
              fontSize: fontSize.base,
              fontWeight: 700,
              color: semanticColors.text.primary,
            }}
          >
            Your Workspace
          </h3>
        </div>
        <span
          style={{
            fontSize: fontSize.xs,
            color: semanticColors.text.secondary,
          }}
        >
          {openFiles.length + inProgressTasks.length + pinnedItems.length} items
        </span>
      </div>

      {/* Smart Suggestion Banner */}
      {suggestRelatedTask && (
        <div
          style={{
            margin: `0 ${spacing[4]} ${spacing[3]}`,
            padding: spacing[3],
            backgroundColor: `${colors.yellow}15`,
            border: `1px solid ${colors.yellow}`,
            borderRadius: borderRadius.base,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <span style={{ fontSize: '20px' }}>💡</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: fontSize.xs, color: semanticColors.text.primary, fontWeight: 600 }}>
              You have {suggestRelatedTask.file.name} open
            </p>
            <p style={{ fontSize: fontSize.xs, color: semanticColors.text.secondary, marginTop: spacing[1] }}>
              Consider finishing: {suggestRelatedTask.task.title}
            </p>
          </div>
          <button
            style={{
              padding: `${spacing[1]} ${spacing[2]}`,
              backgroundColor: colors.yellow,
              color: semanticColors.bg.primary,
              border: 'none',
              borderRadius: borderRadius.base,
              fontSize: fontSize.xs,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hunt It
          </button>
        </div>
      )}

      {/* Open Files Section */}
      {openFiles.length > 0 && (
        <div style={{ marginBottom: spacing[3] }}>
          <div
            style={{
              fontSize: fontSize.xs,
              color: semanticColors.text.secondary,
              paddingLeft: spacing[4],
              marginBottom: spacing[2],
            }}
          >
            📂 Open Files ({openFiles.length})
          </div>

          <div style={{ position: 'relative' }}>
            {/* Fade gradients */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '24px',
                background: `linear-gradient(to right, ${semanticColors.bg.primary}, transparent)`,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '40px',
                background: `linear-gradient(to left, ${semanticColors.bg.primary} 0%, transparent 100%)`,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />

            <div
              ref={filesScrollRef}
              style={{
                display: 'flex',
                gap: spacing[2],
                overflowX: 'auto',
                padding: `0 ${spacing[4]} ${spacing[2]}`,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
              }}
            >
              {openFiles.map((file) => {
                const fileStyle = getFileStyle(file.type);
                return (
                  <div
                    key={file.id}
                    onClick={() => onFileClick?.(file)}
                    style={{
                      minWidth: '140px',
                      padding: spacing[3],
                      backgroundColor: semanticColors.bg.secondary,
                      borderRadius: borderRadius.base,
                      border: `1px solid ${semanticColors.border.default}`,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {/* Close button */}
                    {onCloseFile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseFile(file.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: spacing[1],
                          right: spacing[1],
                          width: spacing[4],
                          height: spacing[4],
                          padding: 0,
                          backgroundColor: semanticColors.bg.primary,
                          border: `1px solid ${semanticColors.border.default}`,
                          borderRadius: borderRadius.full,
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: semanticColors.text.secondary,
                        }}
                      >
                        ✕
                      </button>
                    )}

                    <div
                      style={{
                        fontSize: '32px',
                        marginBottom: spacing[2],
                        textAlign: 'center',
                      }}
                    >
                      {fileStyle.icon}
                    </div>
                    <div
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: 600,
                        color: semanticColors.text.primary,
                        marginBottom: spacing[1],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name}
                    </div>
                    {file.lastOpened && (
                      <div style={{ fontSize: '10px', color: semanticColors.text.secondary }}>
                        {file.lastOpened}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* In Progress Tasks Section */}
      {inProgressTasks.length > 0 && (
        <div style={{ marginBottom: spacing[3] }}>
          <div
            style={{
              fontSize: fontSize.xs,
              color: semanticColors.text.secondary,
              paddingLeft: spacing[4],
              marginBottom: spacing[2],
            }}
          >
            🔄 In Progress ({inProgressTasks.length})
          </div>

          <div style={{ position: 'relative' }}>
            {/* Fade gradients */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '24px',
                background: `linear-gradient(to right, ${semanticColors.bg.primary}, transparent)`,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '40px',
                background: `linear-gradient(to left, ${semanticColors.bg.primary} 0%, transparent 100%)`,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />

            <div
              ref={tasksScrollRef}
              style={{
                display: 'flex',
                gap: spacing[2],
                overflowX: 'auto',
                padding: `0 ${spacing[4]} ${spacing[2]}`,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
              }}
            >
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  style={{
                    minWidth: '160px',
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.base,
                    border: `2px solid ${semanticColors.accent.warning}`,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[2],
                      marginBottom: spacing[2],
                    }}
                  >
                    <Circle
                      size={iconSize.sm}
                      style={{
                        color: semanticColors.accent.warning,
                        fill: `${semanticColors.accent.warning}40`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: fontSize.xs,
                        fontWeight: 600,
                        color: semanticColors.accent.warning,
                      }}
                    >
                      {task.progress}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: 600,
                      color: semanticColors.text.primary,
                      marginBottom: spacing[2],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {task.title}
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: spacing[1],
                      backgroundColor: semanticColors.bg.primary,
                      borderRadius: borderRadius.full,
                      overflow: 'hidden',
                      marginBottom: spacing[1],
                    }}
                  >
                    <div
                      style={{
                        width: `${task.progress}%`,
                        height: '100%',
                        backgroundColor: semanticColors.accent.warning,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  {task.lastWorkedOn && (
                    <div style={{ fontSize: '10px', color: semanticColors.text.secondary }}>
                      {task.lastWorkedOn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pinned Items Section */}
      {pinnedItems.length > 0 && (
        <div>
          <div
            style={{
              fontSize: fontSize.xs,
              color: semanticColors.text.secondary,
              paddingLeft: spacing[4],
              marginBottom: spacing[2],
            }}
          >
            📌 Pinned ({pinnedItems.length})
          </div>

          <div style={{ position: 'relative' }}>
            {/* Fade gradients */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '24px',
                background: `linear-gradient(to right, ${semanticColors.bg.primary}, transparent)`,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '40px',
                background: `linear-gradient(to left, ${semanticColors.bg.primary} 0%, transparent 100%)`,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            />

            <div
              ref={pinnedScrollRef}
              style={{
                display: 'flex',
                gap: spacing[2],
                overflowX: 'auto',
                padding: `0 ${spacing[4]} ${spacing[2]}`,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
              }}
            >
              {pinnedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onPinnedClick?.(item)}
                  style={{
                    minWidth: '140px',
                    padding: spacing[3],
                    backgroundColor: semanticColors.bg.secondary,
                    borderRadius: borderRadius.base,
                    border: `1px solid ${semanticColors.accent.primary}`,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Unpin button */}
                  {onUnpin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnpin(item.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: spacing[1],
                        right: spacing[1],
                        width: spacing[4],
                        height: spacing[4],
                        padding: 0,
                        backgroundColor: semanticColors.bg.primary,
                        border: `1px solid ${semanticColors.border.default}`,
                        borderRadius: borderRadius.full,
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: semanticColors.text.secondary,
                      }}
                    >
                      ✕
                    </button>
                  )}

                  <div
                    style={{
                      marginBottom: spacing[2],
                      textAlign: 'center',
                    }}
                  >
                    <Pin
                      size={24}
                      style={{
                        color: semanticColors.accent.primary,
                        fill: `${semanticColors.accent.primary}40`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: fontSize.xs,
                      fontWeight: 600,
                      color: semanticColors.text.primary,
                      marginBottom: spacing[1],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: semanticColors.text.secondary,
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default WorkspaceOverview;
