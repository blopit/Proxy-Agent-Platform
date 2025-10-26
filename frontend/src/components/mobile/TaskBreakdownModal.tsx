/**
 * TaskBreakdownModal - Slide-up modal showing task breakdown after capture
 * ADHD-optimized with celebration animation and clear action buttons
 * Now supports progressive 7-level hierarchy display
 */

'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import TaskCardBig from './cards/TaskCardBig';
import HierarchyTreeNode from './HierarchyTreeNode';
import AsyncJobTimeline, { type JobStep } from '@/components/shared/AsyncJobTimeline';
import { captureResponseToCardProps } from '@/types/task-schema';
import type { CaptureResponse, TaskNode } from '@/types/capture';
import { taskApi } from '@/services/taskApi';

export interface TaskBreakdownModalProps {
  captureResponse: CaptureResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onStartTask?: () => void;
  onViewAllTasks?: () => void;
}

/**
 * TaskBreakdownModal Component
 * Displays successful task capture with breakdown visualization
 */
export default function TaskBreakdownModal({
  captureResponse,
  isOpen,
  onClose,
  onStartTask,
  onViewAllTasks,
}: TaskBreakdownModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showHierarchyView, setShowHierarchyView] = useState(false);

  // Decomposition state
  const [decomposingNodeId, setDecomposingNodeId] = useState<string | null>(null);
  const [decompositionSteps, setDecompositionSteps] = useState<JobStep[]>([]);
  const [decompositionProgress, setDecompositionProgress] = useState(0);
  const [hierarchyTree, setHierarchyTree] = useState<TaskNode | null>(null);

  // Animate content on open
  useEffect(() => {
    if (isOpen && captureResponse) {
      // Show celebration first
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);

      // Then show content
      setTimeout(() => setShowContent(true), 100);

      // Initialize hierarchy tree
      setHierarchyTree(convertToHierarchyTree());
    } else {
      setShowContent(false);
      setHierarchyTree(null);
    }
  }, [isOpen, captureResponse]);

  if (!isOpen || !captureResponse) {
    return null;
  }

  // Convert API response to card props
  const taskCardProps = captureResponseToCardProps(captureResponse);

  // Convert micro_steps to hierarchy tree (currently flat, will be hierarchical after backend update)
  const convertToHierarchyTree = (): TaskNode | null => {
    if (!captureResponse) return null;

    // For now, treat the captured task as the root Initiative (level 0)
    // and micro_steps as children (will be proper hierarchy after backend update)
    const rootNode: TaskNode = {
      task_id: 'root',
      title: captureResponse.task.title,
      description: captureResponse.task.description,
      level: 0,
      children_ids: captureResponse.micro_steps.map(s => s.step_id),
      children: captureResponse.micro_steps.map((step, index) => ({
        task_id: step.step_id,
        title: step.description,
        level: (step.level || 6) as any, // Default to Step level
        parent_id: 'root',
        children_ids: [],
        estimated_minutes: step.estimated_minutes,
        total_minutes: step.total_minutes || step.estimated_minutes,
        decomposition_state: step.decomposition_state || 'atomic',
        is_leaf: step.is_leaf ?? true,
        leaf_type: step.leaf_type,
        icon: step.icon,
        custom_emoji: step.custom_emoji,
        delegation_mode: step.delegation_mode,
        step_number: index + 1,
      })),
      estimated_minutes: Math.round((captureResponse.task.estimated_hours || 0) * 60),
      total_minutes: captureResponse.breakdown.total_minutes,
      decomposition_state: 'decomposed',
      is_leaf: false,
      priority: captureResponse.task.priority,
      tags: captureResponse.task.tags,
    };

    return rootNode;
  };

  const handleExpand = async (nodeId: string) => {
    // Find the node in the tree
    const findNode = (node: TaskNode): TaskNode | null => {
      if (node.task_id === nodeId) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child);
          if (found) return found;
        }
      }
      return null;
    };

    const node = hierarchyTree ? findNode(hierarchyTree) : null;

    // If node needs decomposition (stub state), call API
    if (node && node.decomposition_state === 'stub') {
      setDecomposingNodeId(nodeId);

      // Initialize decomposition steps for timeline
      setDecompositionSteps([
        {
          id: 'analyze',
          description: 'Analyze complexity',
          shortLabel: 'Analyzing',
          detail: 'Understanding task structure...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '🔍',
          status: 'active',
        },
        {
          id: 'breakdown',
          description: 'Break into subtasks',
          shortLabel: 'Breaking down',
          detail: 'Creating micro-steps...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '🔨',
          status: 'pending',
        },
        {
          id: 'classify',
          description: 'Classify steps',
          shortLabel: 'Classifying',
          detail: 'Detecting task types...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '🏷️',
          status: 'pending',
        },
        {
          id: 'save',
          description: 'Save results',
          shortLabel: 'Saving',
          detail: 'Updating task tree...',
          estimatedMinutes: 0,
          leafType: 'DIGITAL',
          icon: '💾',
          status: 'pending',
        },
      ]);
      setDecompositionProgress(0);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setDecompositionProgress(prev => {
          const newProgress = prev + 0.5;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }

          // Update step statuses based on progress
          if (newProgress >= 10 && newProgress < 30) {
            setDecompositionSteps(steps => steps.map((s, i) =>
              i === 0 ? { ...s, status: 'done' } :
              i === 1 ? { ...s, status: 'active' } : s
            ));
          } else if (newProgress >= 30 && newProgress < 60) {
            setDecompositionSteps(steps => steps.map((s, i) =>
              i <= 1 ? { ...s, status: 'done' } :
              i === 2 ? { ...s, status: 'active' } : s
            ));
          } else if (newProgress >= 60 && newProgress < 90) {
            setDecompositionSteps(steps => steps.map((s, i) =>
              i <= 2 ? { ...s, status: 'done' } :
              i === 3 ? { ...s, status: 'active' } : s
            ));
          }

          return newProgress;
        });
      }, 40);

      try {
        // Call the decomposition API
        const response = await taskApi.breakDownTask(nodeId);

        // Clear interval
        clearInterval(progressInterval);

        // Mark all steps as done
        setDecompositionSteps(steps => steps.map(s => ({ ...s, status: 'done' as const })));
        setDecompositionProgress(100);

        // Update the hierarchy tree with new children
        const updateNodeChildren = (node: TaskNode): TaskNode => {
          if (node.task_id === nodeId) {
            return {
              ...node,
              decomposition_state: 'decomposed',
              children: response.subtasks.map((subtask: any) => ({
                task_id: subtask.task_id || subtask.step_id,
                title: subtask.title || subtask.description,
                description: subtask.description,
                level: (subtask.level || node.level + 1) as any,
                parent_id: nodeId,
                children_ids: [],
                estimated_minutes: subtask.estimated_minutes,
                total_minutes: subtask.total_minutes || subtask.estimated_minutes,
                decomposition_state: subtask.decomposition_state || 'atomic',
                is_leaf: subtask.is_leaf ?? true,
                leaf_type: subtask.leaf_type,
                icon: subtask.icon,
                custom_emoji: subtask.custom_emoji,
                delegation_mode: subtask.delegation_mode,
              })),
              children_ids: response.subtasks.map((s: any) => s.task_id || s.step_id),
            };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(updateNodeChildren),
            };
          }
          return node;
        };

        if (hierarchyTree) {
          setHierarchyTree(updateNodeChildren(hierarchyTree));
        }

        // Expand the node after a brief delay to show the transformation
        setTimeout(() => {
          setExpandedNodes(prev => new Set(prev).add(nodeId));
          setDecomposingNodeId(null);
          setDecompositionSteps([]);
          setDecompositionProgress(0);
        }, 1000);

      } catch (error) {
        console.error('Error decomposing task:', error);
        clearInterval(progressInterval);
        setDecomposingNodeId(null);
        setDecompositionSteps([]);
        setDecompositionProgress(0);

        // Show error toast
        const toast = await import('react-hot-toast');
        toast.default.error('Failed to decompose task. Please try again.');
      }
    } else {
      // Just expand/collapse if already decomposed
      setExpandedNodes(prev => new Set(prev).add(nodeId));
    }
  };

  const handleCollapse = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  };

  const handleStartTask = () => {
    onStartTask?.();
    onClose();
  };

  const handleViewAll = () => {
    onViewAllTasks?.();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out ${
          showContent ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Modal Content */}
        <div className="bg-[#002b36] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#586e75]">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-[#859900]" />
              <h2 className="text-lg font-bold text-[#93a1a1]">
                Task Captured Successfully!
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#073642] rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} className="text-[#93a1a1]" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Success Message */}
            <div className="mb-4 p-3 bg-[#859900]/10 border border-[#859900] rounded-lg">
              <p className="text-sm text-[#859900] text-center">
                Your task has been broken down into{' '}
                <span className="font-bold">
                  {captureResponse.breakdown.total_steps} actionable steps
                </span>
                {' '}in{' '}
                <span className="font-bold">
                  {Math.round(captureResponse.processing_time_ms)}ms
                </span>
              </p>
            </div>

            {/* View Toggle */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setShowHierarchyView(false)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !showHierarchyView
                    ? 'bg-[#268bd2] text-white'
                    : 'bg-[#073642] text-[#93a1a1] border border-[#586e75]'
                }`}
              >
                📋 Card View
              </button>
              <button
                onClick={() => setShowHierarchyView(true)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showHierarchyView
                    ? 'bg-[#268bd2] text-white'
                    : 'bg-[#073642] text-[#93a1a1] border border-[#586e75]'
                }`}
              >
                🌳 Tree View
              </button>
            </div>

            {/* Content - Card View or Hierarchy View */}
            {!showHierarchyView ? (
              <TaskCardBig
                task={taskCardProps}
                onStartTask={handleStartTask}
                onViewDetails={handleViewAll}
              />
            ) : (
              <div className="bg-[#073642] rounded-lg p-4 border border-[#586e75]">
                <h3 className="text-sm font-medium text-[#93a1a1] mb-3 flex items-center gap-2">
                  <span>🌳</span>
                  <span>Hierarchy Breakdown</span>
                </h3>

                {/* Decomposition Timeline - shows during active decomposition */}
                {decomposingNodeId && decompositionSteps.length > 0 && (
                  <div className="mb-4 p-3 bg-[#002b36] rounded-lg border border-[#268bd2]">
                    <AsyncJobTimeline
                      jobName="Decomposing task..."
                      steps={decompositionSteps}
                      currentProgress={decompositionProgress}
                      size="full"
                      showProgressBar={true}
                    />
                  </div>
                )}

                {hierarchyTree ? (
                  <HierarchyTreeNode
                    node={hierarchyTree}
                    isExpanded={expandedNodes.has(hierarchyTree.task_id)}
                    onExpand={handleExpand}
                    onCollapse={handleCollapse}
                    onDecompose={handleExpand}
                    onStartWork={(nodeId) => {
                      console.log('Start work on:', nodeId);
                      handleStartTask();
                    }}
                  />
                ) : (
                  <p className="text-sm text-[#586e75] text-center py-4">
                    No hierarchy available
                  </p>
                )}
              </div>
            )}

            {/* Processing Info */}
            <div className="mt-4 p-3 bg-[#073642] rounded-lg border border-[#586e75]">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#586e75] block">Processing Time</span>
                  <span className="text-[#93a1a1] font-medium">
                    {Math.round(captureResponse.processing_time_ms)}ms
                  </span>
                </div>
                <div>
                  <span className="text-[#586e75] block">Breakdown</span>
                  <span className="text-[#93a1a1] font-medium">
                    {captureResponse.breakdown.digital_count} ⚡ /{' '}
                    {captureResponse.breakdown.human_count} 🎯
                  </span>
                </div>
                {captureResponse.voice_processed && (
                  <div>
                    <span className="text-[#586e75] block">Input Method</span>
                    <span className="text-[#93a1a1] font-medium">Voice</span>
                  </div>
                )}
                {captureResponse.location_captured && (
                  <div>
                    <span className="text-[#586e75] block">Location</span>
                    <span className="text-[#93a1a1] font-medium">Captured</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clarifications (if any) */}
            {captureResponse.needs_clarification &&
              captureResponse.clarifications.length > 0 && (
                <div className="mt-4 p-3 bg-[#268bd2]/10 border border-[#268bd2] rounded-lg">
                  <h3 className="text-sm font-medium text-[#268bd2] mb-2">
                    Additional Information Needed
                  </h3>
                  <div className="space-y-2">
                    {captureResponse.clarifications.map((clarification, index) => (
                      <div key={index} className="text-sm">
                        <p className="text-[#93a1a1] mb-1">
                          <span className="font-medium">{clarification.field}:</span>{' '}
                          {clarification.question}
                        </p>
                        {clarification.options && clarification.options.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {clarification.options.map((option, optIndex) => (
                              <button
                                key={optIndex}
                                className="px-2 py-1 text-xs bg-[#073642] text-[#93a1a1] rounded border border-[#586e75] hover:border-[#268bd2] transition-colors"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[#586e75] bg-[#073642]">
            <div className="flex gap-2">
              <button
                onClick={handleStartTask}
                className="flex-1 px-4 py-3 bg-[#2aa198] hover:bg-[#2aa198]/90 text-[#002b36] font-bold rounded-lg transition-all active:scale-95 shadow-lg"
              >
                Start First Step
              </button>
              <button
                onClick={handleViewAll}
                className="px-4 py-3 bg-[#073642] hover:bg-[#002b36] text-[#93a1a1] border border-[#586e75] rounded-lg transition-all active:scale-95"
              >
                View All
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-[#073642] hover:bg-[#002b36] text-[#586e75] border border-[#586e75] rounded-lg transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="animate-bounce">
            <div className="text-8xl">✅</div>
          </div>
        </div>
      )}
    </>
  );
}
