/**
 * WorkflowBrowser Stories
 *
 * Showcases the workflow selection modal with filtering and selection.
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import { colors, spacing, fontSize, borderRadius } from '@/lib/design-system';
import WorkflowBrowser, { Workflow } from './WorkflowBrowser';
import React from 'react';

const meta: Meta<typeof WorkflowBrowser> = {
  title: 'Workflows/WorkflowBrowser',
  component: WorkflowBrowser,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for browsing and selecting AI-powered workflows with type filtering.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WorkflowBrowser>;

const mockWorkflows: Workflow[] = [
  {
    workflowId: 'backend_api_feature_tdd',
    name: 'Backend API Feature (TDD)',
    description: 'Systematic API implementation following CLAUDE.md standards with Test-Driven Development',
    workflowType: 'backend',
    expectedStepCount: 6,
    tags: ['backend', 'api', 'tdd', 'python', 'fastapi'],
  },
  {
    workflowId: 'frontend_component_storybook',
    name: 'Frontend Component (Storybook-First)',
    description: 'Systematic React component implementation with Storybook stories and design system tokens',
    workflowType: 'frontend',
    expectedStepCount: 5,
    tags: ['frontend', 'react', 'storybook', 'typescript'],
  },
  {
    workflowId: 'systematic_bug_fix',
    name: 'Systematic Bug Fix',
    description: 'Methodical approach to identifying, fixing, and validating bug fixes',
    workflowType: 'bugfix',
    expectedStepCount: 5,
    tags: ['bugfix', 'debugging', 'testing'],
  },
  {
    workflowId: 'api_endpoint_testing',
    name: 'API Endpoint Testing Suite',
    description: 'Comprehensive testing workflow for REST API endpoints with integration tests',
    workflowType: 'testing',
    expectedStepCount: 6,
    tags: ['testing', 'api', 'integration', 'pytest'],
  },
  {
    workflowId: 'backend_refactoring',
    name: 'Backend Code Refactoring',
    description: 'Systematic refactoring while maintaining test coverage and functionality',
    workflowType: 'backend',
    expectedStepCount: 7,
    tags: ['backend', 'refactoring', 'code-quality'],
  },
  {
    workflowId: 'frontend_form_validation',
    name: 'Form with Validation',
    description: 'Build accessible form with client-side validation and error handling',
    workflowType: 'frontend',
    expectedStepCount: 6,
    tags: ['frontend', 'forms', 'validation', 'accessibility'],
  },
];

/**
 * Default Open State
 */
export const Default: Story = {
  args: {
    workflows: mockWorkflows,
    isOpen: true,
    onClose: () => console.log('Close clicked'),
    onSelect: (id) => console.log('Selected:', id),
  },
};

/**
 * With Pre-Selection
 */
export const PreSelected: Story = {
  args: {
    workflows: mockWorkflows,
    isOpen: true,
    selectedWorkflowId: 'backend_api_feature_tdd',
    onClose: () => console.log('Close clicked'),
    onSelect: (id) => console.log('Selected:', id),
  },
};

/**
 * Empty State
 */
export const EmptyState: Story = {
  args: {
    workflows: [],
    isOpen: true,
    onClose: () => console.log('Close clicked'),
    onSelect: (id) => console.log('Selected:', id),
  },
};

/**
 * Interactive Demo
 */
export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedId, setSelectedId] = React.useState<string | undefined>();

    const handleSelect = (id: string) => {
      setSelectedId(id);
      alert(`✅ Workflow selected: ${id}\n\nNow generating AI-powered steps...`);
    };

    return (
      <div style={{ padding: spacing[6], backgroundColor: colors.base03, minHeight: '100vh' }}>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ color: colors.base1, marginBottom: spacing[4] }}>
            Dogfooding Dashboard - Scout Mode
          </h1>

          <div
            style={{
              padding: spacing[6],
              backgroundColor: colors.base02,
              borderRadius: borderRadius.lg,
              marginBottom: spacing[6],
            }}
          >
            <h2 style={{ color: colors.base0, marginBottom: spacing[3], fontSize: fontSize.lg }}>
              📋 Current Task
            </h2>
            <p style={{ color: colors.base01, marginBottom: spacing[4] }}>
              BE-01: Task Delegation System
            </p>

            <button
              onClick={() => setIsOpen(true)}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.cyan,
                color: colors.base03,
                border: 'none',
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              🤖 Generate Implementation Steps
            </button>
          </div>

          {selectedId && (
            <div
              style={{
                padding: spacing[4],
                backgroundColor: 'rgba(42, 161, 152, 0.1)',
                border: '1px solid rgba(42, 161, 152, 0.3)',
                borderRadius: borderRadius.base,
                color: colors.cyan,
              }}
            >
              <strong>✓ Workflow Selected:</strong> {selectedId}
              <br />
              <small style={{ color: colors.base01 }}>
                AI will generate personalized steps based on your energy level and codebase state.
              </small>
            </div>
          )}
        </div>

        <WorkflowBrowser
          workflows={mockWorkflows}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={handleSelect}
          selectedWorkflowId={selectedId}
        />
      </div>
    );
  },
};
