/**
 * WorkflowBrowser - Modal for browsing and selecting workflows
 *
 * Shows available workflows with filtering by type.
 * Allows user to preview and select a workflow for execution.
 */

import React, { useState } from 'react';
import { spacing, fontSize, fontWeight, semanticColors, borderRadius, shadows } from '@/lib/design-system';
import WorkflowCard from './WorkflowCard';
import WorkflowSuggestionCard, { WorkflowSuggestion } from './WorkflowSuggestionCard';

export interface Workflow {
  workflowId: string;
  name: string;
  description: string;
  workflowType: 'backend' | 'frontend' | 'bugfix' | 'documentation' | 'testing';
  expectedStepCount: number;
  tags: string[];
}

export interface WorkflowBrowserProps {
  workflows: Workflow[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (workflowId: string) => void;
  selectedWorkflowId?: string;
  taskTitle?: string; // For AI suggestions
  taskDescription?: string; // For AI suggestions
}

type FilterType = 'all' | 'backend' | 'frontend' | 'bugfix' | 'documentation' | 'testing';

const filterOptions: { value: FilterType; label: string; icon: string }[] = [
  { value: 'all', label: 'All Workflows', icon: '🌐' },
  { value: 'backend', label: 'Backend', icon: '⚙️' },
  { value: 'frontend', label: 'Frontend', icon: '⚛️' },
  { value: 'bugfix', label: 'Bug Fixes', icon: '🐛' },
  { value: 'testing', label: 'Testing', icon: '🧪' },
];

export default function WorkflowBrowser({
  workflows,
  isOpen,
  onClose,
  onSelect,
  selectedWorkflowId,
  taskTitle,
  taskDescription,
}: WorkflowBrowserProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [tempSelectedId, setTempSelectedId] = useState<string | undefined>(selectedWorkflowId);
  const [suggestions, setSuggestions] = useState<WorkflowSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showingSuggestions, setShowingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Get AI-powered workflow suggestions (micro-LLM - only called when ⭐ clicked!)
  const handleGetSuggestions = async () => {
    if (!taskTitle) {
      setSuggestionError('No task title available for suggestions');
      return;
    }

    setLoadingSuggestions(true);
    setSuggestionError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/v1/workflows/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_title: taskTitle,
          task_description: taskDescription || '',
          user_energy: 2, // Medium energy (TODO: get from user state)
          time_of_day: 'morning', // TODO: detect actual time
          estimated_hours: 4.0,
          recent_tasks: [], // TODO: get from user history
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get suggestions');
      }

      const data: WorkflowSuggestion[] = await response.json();
      setSuggestions(data);
      setShowingSuggestions(true);
    } catch (error) {
      console.error('Error getting workflow suggestions:', error);
      setSuggestionError(error instanceof Error ? error.message : 'Failed to get suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Exit suggestion mode
  const handleExitSuggestions = () => {
    setShowingSuggestions(false);
    setSuggestions([]);
    setSuggestionError(null);
  };

  // Filter workflows
  const filteredWorkflows = workflows.filter(w =>
    filter === 'all' || w.workflowType === filter
  );

  const handleSelect = () => {
    if (tempSelectedId) {
      onSelect(tempSelectedId);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: semanticColors.bg.primary,
          borderRadius: borderRadius.xl,
          boxShadow: shadows.xl,
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing[6],
            borderBottom: `1px solid ${semanticColors.border.subtle}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: fontSize['2xl'],
                fontWeight: fontWeight.bold,
                color: semanticColors.text.primary,
                margin: 0,
                marginBottom: spacing[1],
              }}
            >
              {showingSuggestions ? '✨ AI Recommendations' : '🤖 AI Workflow Library'}
            </h2>
            <p
              style={{
                fontSize: fontSize.sm,
                color: semanticColors.text.secondary,
                margin: 0,
              }}
            >
              {showingSuggestions
                ? `Showing AI-powered suggestions for: "${taskTitle}"`
                : 'Select a workflow to generate personalized implementation steps'
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
            {/* Suggestion Button - Only visible when not in suggestion mode and task title is available */}
            {!showingSuggestions && taskTitle && (
              <button
                onClick={handleGetSuggestions}
                disabled={loadingSuggestions}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: loadingSuggestions ? semanticColors.bg.tertiary : colors.yellow,
                  color: semanticColors.text.inverse,
                  border: 'none',
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.semibold,
                  cursor: loadingSuggestions ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  opacity: loadingSuggestions ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loadingSuggestions) {
                    e.currentTarget.style.backgroundColor = colors.orange;
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.yellow;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                aria-label="Get AI workflow suggestions"
                title="Get AI-powered workflow recommendations with grades (A+ to F)"
              >
                <span style={{ fontSize: fontSize.base }}>{loadingSuggestions ? '⏳' : '⭐'}</span>
                <span>{loadingSuggestions ? 'Getting Suggestions...' : 'Get AI Suggestions'}</span>
              </button>
            )}

            {/* Back Button - Only in suggestion mode */}
            {showingSuggestions && (
              <button
                onClick={handleExitSuggestions}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: semanticColors.bg.secondary,
                  color: semanticColors.text.primary,
                  border: `1px solid ${semanticColors.border.subtle}`,
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                ← Back to All Workflows
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                width: spacing[10],
                height: spacing[10],
                border: 'none',
                backgroundColor: 'transparent',
                color: semanticColors.text.secondary,
                fontSize: fontSize['2xl'],
                cursor: 'pointer',
                borderRadius: borderRadius.base,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close workflow browser"
            >
              ×
            </button>
          </div>
        </div>

        {/* Filters - Only show when not in suggestion mode */}
        {!showingSuggestions && (
          <div
            style={{
              padding: spacing[4],
              borderBottom: `1px solid ${semanticColors.border.subtle}`,
              display: 'flex',
              gap: spacing[2],
              overflowX: 'auto',
            }}
          >
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: filter === option.value
                    ? semanticColors.accent.primary
                    : semanticColors.bg.secondary,
                  color: filter === option.value
                    ? semanticColors.text.inverse
                    : semanticColors.text.primary,
                  border: 'none',
                  borderRadius: borderRadius.base,
                  fontSize: fontSize.sm,
                  fontWeight: fontWeight.medium,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content Area - Suggestions OR Workflow Grid */}
        <div
          style={{
            flex: 1,
            padding: spacing[6],
            overflowY: 'auto',
          }}
        >
          {/* Error Message */}
          {suggestionError && (
            <div
              style={{
                backgroundColor: semanticColors.bg.secondary,
                border: `1px solid ${semanticColors.border.default}`,
                borderRadius: borderRadius.base,
                padding: spacing[4],
                marginBottom: spacing[4],
                color: colors.red,
              }}
            >
              <strong>Error:</strong> {suggestionError}
            </div>
          )}

          {/* AI Suggestions View */}
          {showingSuggestions && (
            <>
              {suggestions.length === 0 && !loadingSuggestions ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: spacing[12],
                    color: semanticColors.text.tertiary,
                  }}
                >
                  <div style={{ fontSize: fontSize['4xl'], marginBottom: spacing[4] }}>
                    💫
                  </div>
                  <div style={{ fontSize: fontSize.lg, marginBottom: spacing[2] }}>
                    No suggestions available
                  </div>
                  <div style={{ fontSize: fontSize.sm }}>
                    Click "Back to All Workflows" to browse manually
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: spacing[4],
                  }}
                >
                  {suggestions.map(suggestion => {
                    const workflow = workflows.find(w => w.workflowId === suggestion.workflow_id);
                    return (
                      <WorkflowSuggestionCard
                        key={suggestion.workflow_id}
                        suggestion={suggestion}
                        workflow={workflow}
                        onSelect={setTempSelectedId}
                        selected={tempSelectedId === suggestion.workflow_id}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Regular Workflow Grid View */}
          {!showingSuggestions && (
            <>
              {filteredWorkflows.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: spacing[12],
                    color: semanticColors.text.tertiary,
                  }}
                >
                  <div style={{ fontSize: fontSize['4xl'], marginBottom: spacing[4] }}>
                    🔍
                  </div>
                  <div style={{ fontSize: fontSize.lg, marginBottom: spacing[2] }}>
                    No workflows found
                  </div>
                  <div style={{ fontSize: fontSize.sm }}>
                    Try selecting a different filter
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: spacing[4],
                  }}
                >
                  {filteredWorkflows.map(workflow => (
                    <WorkflowCard
                      key={workflow.workflowId}
                      {...workflow}
                      selected={tempSelectedId === workflow.workflowId}
                      onSelect={setTempSelectedId}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: spacing[6],
            borderTop: `1px solid ${semanticColors.border.subtle}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing[4],
          }}
        >
          <div style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>
            {showingSuggestions ? (
              <>
                {suggestions.length} AI suggestion{suggestions.length !== 1 ? 's' : ''} (sorted by grade)
              </>
            ) : (
              <>
                {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} available
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: spacing[3] }}>
            <button
              onClick={onClose}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: semanticColors.bg.secondary,
                color: semanticColors.text.primary,
                border: `1px solid ${semanticColors.border.subtle}`,
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                fontWeight: fontWeight.medium,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSelect}
              disabled={!tempSelectedId}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: tempSelectedId ? semanticColors.accent.primary : semanticColors.bg.tertiary,
                color: tempSelectedId ? semanticColors.text.inverse : semanticColors.text.tertiary,
                border: 'none',
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                fontWeight: fontWeight.medium,
                cursor: tempSelectedId ? 'pointer' : 'not-allowed',
                opacity: tempSelectedId ? 1 : 0.5,
              }}
            >
              Generate Steps with AI
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
