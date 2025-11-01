/**
 * HierarchyTreeNode - Expandable tree node for 7-level task hierarchy
 * Supports progressive decomposition with smooth animations
 */

'use client';

import React, { useState } from 'react';
import { Bot, ChevronRight, Loader2 } from 'lucide-react';
import { getLevelConfig, DECOMPOSITION_INDICATORS, formatDuration, type HierarchyLevel } from '@/lib/hierarchy-config';
import { spacing, fontSize, borderRadius, iconSize, semanticColors } from '@/lib/design-system';
import { LevelEmoji } from '../gamification/LevelBadge';
import type { TaskNode, DecompositionState } from '@/types/capture';

interface HierarchyTreeNodeProps {
  node: TaskNode;
  depth?: number;
  isExpanded?: boolean;
  onExpand?: (nodeId: string) => Promise<void>;
  onCollapse?: (nodeId: string) => void;
  onStartWork?: (nodeId: string) => void;
  onDecompose?: (nodeId: string) => Promise<void>;
  showChildren?: boolean;
  className?: string;
}

/**
 * HierarchyTreeNode Component
 * Renders a single node in the hierarchy tree with expand/collapse functionality
 */
export default function HierarchyTreeNode({
  node,
  depth = 0,
  isExpanded = false,
  onExpand,
  onCollapse,
  onStartWork,
  onDecompose,
  showChildren = true,
  className = '',
}: HierarchyTreeNodeProps) {
  const [isDecomposing, setIsDecomposing] = useState(false);
  const config = getLevelConfig(node.level as HierarchyLevel);

  // Calculate indentation based on depth
  const indentWidth = depth * 16; // 16px per level

  // Determine if node can expand
  const canExpand =
    !node.is_leaf &&
    node.decomposition_state !== 'atomic' &&
    node.level < 6;

  // Determine if node can be decomposed
  const canDecompose =
    node.decomposition_state === 'stub' &&
    !node.is_leaf &&
    node.level < 6;

  // Handle expand/collapse
  const handleToggle = async () => {
    if (isDecomposing) return;

    if (isExpanded) {
      // Collapse
      onCollapse?.(node.task_id);
    } else {
      // Expand - may trigger decomposition
      if (node.decomposition_state === 'stub' && onExpand) {
        setIsDecomposing(true);
        try {
          await onExpand(node.task_id);
        } finally {
          setIsDecomposing(false);
        }
      } else if (onExpand) {
        await onExpand(node.task_id);
      }
    }
  };

  // Handle explicit decompose button click
  const handleDecompose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDecomposing || !onDecompose) return;

    setIsDecomposing(true);
    try {
      await onDecompose(node.task_id);
    } finally {
      setIsDecomposing(false);
    }
  };

  // Get expand/collapse indicator
  const getIndicator = () => {
    if (isDecomposing) {
      return <Loader2 size={iconSize.sm} className="animate-spin" />;
    }
    if (node.decomposition_state === 'atomic' || node.is_leaf) {
      return DECOMPOSITION_INDICATORS.atomic;
    }
    if (node.decomposition_state === 'stub') {
      return DECOMPOSITION_INDICATORS.stub;
    }
    return isExpanded
      ? DECOMPOSITION_INDICATORS.decomposed
      : DECOMPOSITION_INDICATORS.stub;
  };

  // Get primary emoji (custom or level default)
  const primaryEmoji = node.custom_emoji || node.icon || config.emoji;

  return (
    <div className={className}>
      {/* Node Row */}
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[#073642] transition-colors cursor-pointer"
        style={{
          marginLeft: `${indentWidth}px`,
          borderLeft: depth > 0 ? `2px solid ${config.color}20` : 'none',
        }}
        onClick={canExpand ? handleToggle : undefined}
      >
        {/* Tree connector line */}
        {depth > 0 && (
          <div
            className="absolute h-2 border-b-2"
            style={{
              left: `${indentWidth - 8}px`,
              width: '8px',
              borderColor: `${config.color}40`,
            }}
          />
        )}

        {/* Expand/Collapse Button */}
        {canExpand ? (
          <button
            className="flex-shrink-0 p-1 hover:bg-[#002b36] rounded transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            disabled={isDecomposing}
          >
            {typeof getIndicator() === 'string' ? (
              <span className="text-sm">{getIndicator()}</span>
            ) : (
              getIndicator()
            )}
          </button>
        ) : (
          <div className="w-6" /> // Spacer
        )}

        {/* Node Icon with Robot Badge */}
        <div className="relative flex-shrink-0">
          <span className="text-xl" title={`${config.label} - Level ${node.level}`}>
            {primaryEmoji}
          </span>

          {/* Robot badge for DIGITAL leaves */}
          {node.is_leaf && node.leaf_type === 'DIGITAL' && (
            <div
              className="absolute -bottom-1 -right-1 bg-[#2aa198] rounded-full p-0.5 shadow-sm"
              title="Can be automated by AI"
            >
              <Bot size={8} className="text-[#002b36]" strokeWidth={2.5} />
            </div>
          )}

          {/* Level number badge (subtle) */}
          <div
            className="absolute -top-1 -left-1 w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: config.color,
              color: '#fff',
              opacity: 0.7,
            }}
          >
            {node.level}
          </div>
        </div>

        {/* Node Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className="font-medium truncate"
              style={{ fontSize: fontSize.sm, color: semanticColors.text.primary }}
            >
              {node.title}
            </h4>

            {/* Time badge */}
            <span
              className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: `${config.color}20`,
                color: config.color,
              }}
            >
              {formatDuration(node.total_minutes || node.estimated_minutes)}
            </span>
          </div>

          {/* Description (if present and not too deep) */}
          {node.description && depth < 3 && (
            <p
              className="text-xs truncate opacity-70 mt-1"
              style={{ color: semanticColors.text.secondary }}
            >
              {node.description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {/* Decompose button for stub nodes */}
        {canDecompose && onDecompose && (
          <button
            className="flex-shrink-0 px-3 py-1 rounded-lg font-medium text-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            style={{
              backgroundColor: '#268bd2',
              color: '#fff',
              opacity: isDecomposing ? 0.6 : 1,
            }}
            onClick={handleDecompose}
            disabled={isDecomposing}
          >
            {isDecomposing ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>Decomposing...</span>
              </>
            ) : (
              <>
                <span>🔨</span>
                <span>Decompose</span>
              </>
            )}
          </button>
        )}

        {/* Start button for leaves */}
        {node.is_leaf && onStartWork && (
          <button
            className="flex-shrink-0 px-3 py-1 rounded-lg font-medium text-xs transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: semanticColors.accent.primary,
              color: semanticColors.bg.primary,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onStartWork(node.task_id);
            }}
          >
            Start
          </button>
        )}

        {/* Chevron for non-expandable leaves */}
        {!canExpand && !node.is_leaf && (
          <ChevronRight size={iconSize.sm} style={{ color: semanticColors.text.secondary }} />
        )}
      </div>

      {/* Children (if expanded and has children) */}
      {isExpanded && showChildren && node.children && node.children.length > 0 && (
        <div className="mt-1">
          {node.children.map((child, index) => (
            <HierarchyTreeNode
              key={child.task_id}
              node={child}
              depth={depth + 1}
              onExpand={onExpand}
              onCollapse={onCollapse}
              onStartWork={onStartWork}
              onDecompose={onDecompose}
            />
          ))}
        </div>
      )}

      {/* Children Count (if collapsed and has children) */}
      {!isExpanded && node.children_ids.length > 0 && (
        <div
          className="ml-12 mt-1 text-xs opacity-50"
          style={{ color: semanticColors.text.secondary }}
        >
          {node.children_ids.length} {node.children_ids.length === 1 ? 'item' : 'items'}
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant - minimal information
 */
export function CompactHierarchyNode({ node }: { node: TaskNode }) {
  const config = getLevelConfig(node.level as HierarchyLevel);
  const primaryEmoji = node.custom_emoji || node.icon || config.emoji;

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#073642]">
      <span className="text-lg">{primaryEmoji}</span>
      <span className="text-sm flex-1 truncate" style={{ color: semanticColors.text.primary }}>
        {node.title}
      </span>
      <span className="text-xs opacity-60" style={{ color: semanticColors.text.secondary }}>
        {formatDuration(node.estimated_minutes)}
      </span>
    </div>
  );
}
