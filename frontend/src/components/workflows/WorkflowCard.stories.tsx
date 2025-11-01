/**
 * WorkflowCard Stories
 *
 * Showcases workflow cards in different states and types.
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import { colors, spacing, fontSize, borderRadius } from '@/lib/design-system';
import WorkflowCard from './WorkflowCard';

const meta: Meta<typeof WorkflowCard> = {
  title: 'Workflows/WorkflowCard',
  component: WorkflowCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Display workflow summary with type, complexity, and tags. Used in workflow browser.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    workflowType: {
      control: 'select',
      options: ['backend', 'frontend', 'bugfix', 'documentation', 'testing'],
      description: 'Type of workflow (affects visual styling)',
    },
    expectedStepCount: {
      control: { type: 'range', min: 3, max: 10, step: 1 },
      description: 'Expected number of steps AI will generate',
    },
    selected: {
      control: 'boolean',
      description: 'Whether this workflow is currently selected',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WorkflowCard>;

/**
 * Backend API Feature workflow - TDD methodology
 */
export const BackendTDD: Story = {
  args: {
    workflowId: 'backend_api_feature_tdd',
    name: 'Backend API Feature (TDD)',
    description: 'Systematic API implementation following CLAUDE.md standards with Test-Driven Development',
    workflowType: 'backend',
    expectedStepCount: 6,
    tags: ['backend', 'api', 'tdd', 'python', 'fastapi'],
    selected: false,
  },
};

/**
 * Frontend Component workflow - Storybook-first approach
 */
export const FrontendComponent: Story = {
  args: {
    workflowId: 'frontend_component_storybook',
    name: 'Frontend Component (Storybook-First)',
    description: 'Systematic React component implementation with Storybook stories and design system tokens',
    workflowType: 'frontend',
    expectedStepCount: 5,
    tags: ['frontend', 'react', 'storybook', 'typescript'],
    selected: false,
  },
};

/**
 * Bug Fix workflow - Systematic debugging
 */
export const BugFix: Story = {
  args: {
    workflowId: 'systematic_bug_fix',
    name: 'Systematic Bug Fix',
    description: 'Methodical approach to identifying, fixing, and validating bug fixes',
    workflowType: 'bugfix',
    expectedStepCount: 5,
    tags: ['bugfix', 'debugging', 'testing'],
    selected: false,
  },
};

/**
 * Selected state - Shows selection indicator and highlight
 */
export const Selected: Story = {
  args: {
    ...BackendTDD.args,
    selected: true,
  },
};

/**
 * With Many Tags - Shows tag truncation
 */
export const ManyTags: Story = {
  args: {
    workflowId: 'complex_workflow',
    name: 'Complex Full-Stack Feature',
    description: 'End-to-end feature implementation across backend, frontend, and database layers',
    workflowType: 'backend',
    expectedStepCount: 8,
    tags: ['backend', 'frontend', 'database', 'api', 'react', 'python', 'postgresql', 'redis'],
    selected: false,
  },
};

/**
 * All Workflow Types - Compare visual styling
 */
export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], width: '400px' }}>
      <WorkflowCard
        workflowId="backend-1"
        name="Backend Workflow"
        description="API and server-side logic"
        workflowType="backend"
        expectedStepCount={6}
        tags={['api', 'python']}
      />
      <WorkflowCard
        workflowId="frontend-1"
        name="Frontend Workflow"
        description="UI components and interactions"
        workflowType="frontend"
        expectedStepCount={5}
        tags={['react', 'ui']}
      />
      <WorkflowCard
        workflowId="bugfix-1"
        name="Bug Fix Workflow"
        description="Systematic debugging"
        workflowType="bugfix"
        expectedStepCount={5}
        tags={['debug', 'test']}
      />
      <WorkflowCard
        workflowId="docs-1"
        name="Documentation Workflow"
        description="Technical writing"
        workflowType="documentation"
        expectedStepCount={4}
        tags={['docs', 'markdown']}
      />
      <WorkflowCard
        workflowId="test-1"
        name="Testing Workflow"
        description="Comprehensive test suite"
        workflowType="testing"
        expectedStepCount={6}
        tags={['testing', 'qa']}
      />
    </div>
  ),
};

/**
 * Interactive Selection - Click to select workflows
 */
export const InteractiveSelection: Story = {
  render: () => {
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], width: '400px' }}>
        <WorkflowCard
          workflowId="backend_api_feature_tdd"
          name="Backend API Feature (TDD)"
          description="Test-driven API development"
          workflowType="backend"
          expectedStepCount={6}
          tags={['backend', 'tdd']}
          selected={selectedId === 'backend_api_feature_tdd'}
          onSelect={setSelectedId}
        />
        <WorkflowCard
          workflowId="frontend_component_storybook"
          name="Frontend Component"
          description="React component with Storybook"
          workflowType="frontend"
          expectedStepCount={5}
          tags={['frontend', 'storybook']}
          selected={selectedId === 'frontend_component_storybook'}
          onSelect={setSelectedId}
        />
        <WorkflowCard
          workflowId="systematic_bug_fix"
          name="Bug Fix"
          description="Systematic debugging workflow"
          workflowType="bugfix"
          expectedStepCount={5}
          tags={['bugfix']}
          selected={selectedId === 'systematic_bug_fix'}
          onSelect={setSelectedId}
        />

        {selectedId && (
          <div
            style={{
              padding: spacing[3],
              backgroundColor: 'rgba(42, 161, 152, 0.1)',
              borderRadius: borderRadius.base,
              fontSize: fontSize.sm,
              color: colors.cyan,
            }}
          >
            ✓ Selected: {selectedId}
          </div>
        )}
      </div>
    );
  },
};
