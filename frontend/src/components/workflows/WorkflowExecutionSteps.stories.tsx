/**
 * WorkflowExecutionSteps Stories
 *
 * Showcases AI-generated implementation steps with TDD phases and validation.
 */

import type { Meta, StoryObj } from '@storybook/nextjs';
import WorkflowExecutionSteps, { WorkflowStep } from './WorkflowExecutionSteps';
import React from 'react';

const meta: Meta<typeof WorkflowExecutionSteps> = {
  title: 'Workflows/WorkflowExecutionSteps',
  component: WorkflowExecutionSteps,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Display AI-generated implementation steps with TDD phases, validation commands, and progress tracking.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WorkflowExecutionSteps>;

const mockBackendSteps: WorkflowStep[] = [
  {
    stepId: '1',
    title: 'Write failing test for /delegate endpoint',
    description: 'Create test_delegation.py with test cases for POST /api/v1/delegate endpoint. Test should cover happy path, validation errors, and edge cases.',
    estimatedMinutes: 20,
    status: 'completed',
    tddPhase: 'red',
    validationCommand: 'uv run pytest src/services/delegation/tests/test_delegation.py -v',
    expectedOutcome: 'Test fails with "endpoint not found" or "not implemented" error',
    icon: '🔴',
    order: 0,
  },
  {
    stepId: '2',
    title: 'Implement minimal /delegate endpoint',
    description: 'Create delegation route handler in src/services/delegation/routes.py. Implement basic request validation and response structure. Keep implementation minimal to pass tests.',
    estimatedMinutes: 25,
    status: 'in_progress',
    tddPhase: 'green',
    validationCommand: 'uv run pytest src/services/delegation/tests/test_delegation.py -v',
    expectedOutcome: 'All tests pass with basic implementation',
    icon: '🟢',
    order: 1,
  },
  {
    stepId: '3',
    title: 'Refactor delegation logic',
    description: 'Extract delegation logic into separate service layer. Add proper error handling, logging, and type hints. Ensure all tests still pass.',
    estimatedMinutes: 30,
    status: 'pending',
    tddPhase: 'refactor',
    validationCommand: 'uv run pytest src/services/delegation/tests/ && uv run ruff check src/services/delegation/',
    expectedOutcome: 'Tests pass, code quality improved, no ruff errors',
    icon: '🔵',
    order: 2,
  },
  {
    stepId: '4',
    title: 'Add integration tests',
    description: 'Write integration tests that cover the full delegation workflow from API request to database persistence.',
    estimatedMinutes: 20,
    status: 'pending',
    tddPhase: 'red',
    validationCommand: 'uv run pytest src/services/delegation/tests/test_integration.py -v',
    expectedOutcome: 'Integration tests fail initially',
    icon: '🧪',
    order: 3,
  },
  {
    stepId: '5',
    title: 'Implement database persistence',
    description: 'Add repository methods for saving and retrieving delegation records. Update route handler to persist data.',
    estimatedMinutes: 25,
    status: 'pending',
    tddPhase: 'green',
    validationCommand: 'uv run pytest src/services/delegation/tests/ --cov=src/services/delegation',
    expectedOutcome: 'All tests pass, 95%+ coverage achieved',
    icon: '💾',
    order: 4,
  },
  {
    stepId: '6',
    title: 'Final validation and documentation',
    description: 'Run full test suite, check type hints, update API documentation. Ensure all acceptance criteria met.',
    estimatedMinutes: 15,
    status: 'pending',
    validationCommand: 'uv run pytest && uv run mypy src/services/delegation/ && uv run ruff check',
    expectedOutcome: 'All tests pass, no type errors, documentation complete',
    icon: '✅',
    order: 5,
  },
];

const mockFrontendSteps: WorkflowStep[] = [
  {
    stepId: '1',
    title: 'Create component file with TypeScript types',
    description: 'Create WorkflowCard.tsx with props interface using design system types. Import design tokens.',
    estimatedMinutes: 15,
    status: 'completed',
    validationCommand: 'cd frontend && npm run type-check',
    expectedOutcome: 'Component file created, no TypeScript errors',
    icon: '📝',
    order: 0,
  },
  {
    stepId: '2',
    title: 'Create Storybook story with variants',
    description: 'Create WorkflowCard.stories.tsx with stories for all workflow types and states (selected, unselected).',
    estimatedMinutes: 20,
    status: 'in_progress',
    validationCommand: 'cd frontend && npm run storybook',
    expectedOutcome: 'Stories render correctly in Storybook',
    icon: '📚',
    order: 1,
  },
  {
    stepId: '3',
    title: 'Implement component with design tokens',
    description: 'Build component using spacing, fontSize, semanticColors from design-system.ts. Never hardcode values!',
    estimatedMinutes: 30,
    status: 'pending',
    validationCommand: 'cd frontend && npm run lint',
    expectedOutcome: 'Component renders correctly, uses all design tokens',
    icon: '🎨',
    order: 2,
  },
  {
    stepId: '4',
    title: 'Add accessibility and interactions',
    description: 'Add ARIA labels, keyboard navigation, focus management. Test with Storybook a11y addon.',
    estimatedMinutes: 20,
    status: 'pending',
    validationCommand: 'cd frontend && npm run storybook',
    expectedOutcome: 'No a11y violations in Storybook addon',
    icon: '♿',
    order: 3,
  },
  {
    stepId: '5',
    title: 'Integrate into app',
    description: 'Import component into workflow browser. Wire up state management and API calls.',
    estimatedMinutes: 25,
    status: 'pending',
    validationCommand: 'cd frontend && npm run build',
    expectedOutcome: 'Component works in production build',
    icon: '🔌',
    order: 4,
  },
];

/**
 * Backend TDD Workflow - Shows RED-GREEN-REFACTOR phases
 */
export const BackendTDD: Story = {
  args: {
    steps: mockBackendSteps,
    currentStepIndex: 1,
    showDetails: true,
  },
};

/**
 * Frontend Workflow - Component development steps
 */
export const FrontendComponent: Story = {
  args: {
    steps: mockFrontendSteps,
    currentStepIndex: 1,
    showDetails: true,
  },
};

/**
 * Just Started - First step in progress
 */
export const JustStarted: Story = {
  args: {
    steps: mockBackendSteps.map((step, i) => ({
      ...step,
      status: i === 0 ? 'in_progress' : 'pending',
    })),
    currentStepIndex: 0,
    showDetails: true,
  },
};

/**
 * Almost Complete - Last step remaining
 */
export const AlmostComplete: Story = {
  args: {
    steps: mockBackendSteps.map((step, i) => ({
      ...step,
      status: i < 5 ? 'completed' : 'in_progress',
    })),
    currentStepIndex: 5,
    showDetails: true,
  },
};

/**
 * All Complete - Celebration state
 */
export const AllComplete: Story = {
  args: {
    steps: mockBackendSteps.map(step => ({
      ...step,
      status: 'completed',
    })),
    currentStepIndex: 5,
    showDetails: true,
  },
};

/**
 * Without Details - Compact view
 */
export const CompactView: Story = {
  args: {
    steps: mockBackendSteps,
    currentStepIndex: 2,
    showDetails: false,
  },
};

/**
 * Interactive - Click to complete steps
 */
export const Interactive: Story = {
  render: () => {
    const [steps, setSteps] = React.useState(mockBackendSteps);
    const [currentIndex, setCurrentIndex] = React.useState(1);

    const handleStepComplete = (stepId: string) => {
      setSteps(prev => prev.map(step =>
        step.stepId === stepId
          ? { ...step, status: 'completed' as const }
          : step
      ));

      // Move to next step
      const nextIndex = steps.findIndex(s => s.status === 'pending');
      if (nextIndex !== -1) {
        setCurrentIndex(nextIndex);
        setSteps(prev => prev.map((step, i) =>
          i === nextIndex
            ? { ...step, status: 'in_progress' as const }
            : step
        ));
      }
    };

    const handleStepStart = (stepId: string) => {
      setSteps(prev => prev.map(step =>
        step.stepId === stepId
          ? { ...step, status: 'in_progress' as const }
          : step
      ));
    };

    return (
      <div style={{ maxWidth: '800px' }}>
        <WorkflowExecutionSteps
          steps={steps}
          currentStepIndex={currentIndex}
          onStepComplete={handleStepComplete}
          onStepStart={handleStepStart}
          showDetails={true}
        />
      </div>
    );
  },
};
