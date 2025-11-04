import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { ChevronProgress, ProgressStep } from './ChevronProgress';

const meta = {
  title: 'Shared/Progress/ChevronProgress',
  component: ChevronProgress,
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'range', min: 40, max: 100, step: 5 },
    },
    chevronDepth: {
      control: { type: 'range', min: 5, max: 30, step: 5 },
    },
    shadow: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ChevronProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample progress steps
const workflowSteps: ProgressStep[] = [
  { id: '1', label: 'Start', state: 'completed', description: 'Initialization' },
  { id: '2', label: 'Setup', state: 'completed', description: 'Configuration' },
  { id: '3', label: 'Process', state: 'active', description: 'In Progress' },
  { id: '4', label: 'Review', state: 'pending', description: 'Validation' },
  { id: '5', label: 'Complete', state: 'pending', description: 'Finalization' },
];

const taskSteps: ProgressStep[] = [
  { id: '1', label: 'Capture', state: 'completed' },
  { id: '2', label: 'Clarify', state: 'completed' },
  { id: '3', label: 'Execute', state: 'active' },
  { id: '4', label: 'Done', state: 'pending' },
];

const biologicalWorkflow: ProgressStep[] = [
  { id: '1', label: 'Capture', state: 'completed', description: 'Inbox' },
  { id: '2', label: 'Scout', state: 'completed', description: 'Browse' },
  { id: '3', label: 'Hunter', state: 'active', description: 'Focus' },
  { id: '4', label: 'Today', state: 'pending', description: 'Calendar' },
  { id: '5', label: 'Mapper', state: 'pending', description: 'Connect' },
];

/**
 * Basic 5-step workflow showing progression from completed → active → pending states.
 * Classic progress indicator pattern for multi-step processes.
 */
export const Basic: Story = {
  args: {
    steps: workflowSteps,
    height: 60,
    chevronDepth: 10,
    shadow: true,
  },
};

/**
 * 4-step task workflow with simpler layout.
 * Demonstrates minimal steps with clean state progression.
 */
export const TaskWorkflow: Story = {
  args: {
    steps: taskSteps,
    height: 50,
    chevronDepth: 10,
    shadow: false,
  },
};

/**
 * 5 biological workflow modes from the app's main navigation.
 * Shows how ChevronProgress maps to the app's core workflow tabs.
 */
export const BiologicalModes: Story = {
  args: {
    steps: biologicalWorkflow,
    height: 60,
    chevronDepth: 10,
    shadow: true,
  },
};

/**
 * All steps in completed state with success color (green).
 * Represents a finished workflow or process.
 */
export const AllCompleted: Story = {
  args: {
    steps: workflowSteps.map(step => ({ ...step, state: 'completed' as const })),
    height: 60,
    chevronDepth: 10,
    shadow: true,
  },
};

/**
 * All steps in pending state (gray).
 * Represents a workflow that hasn't started yet.
 */
export const AllPending: Story = {
  args: {
    steps: workflowSteps.map(step => ({ ...step, state: 'pending' as const })),
    height: 60,
    chevronDepth: 10,
    shadow: false,
  },
};

/**
 * Custom color scheme using brand colors.
 * Demonstrates how to override default state colors.
 */
export const CustomColors: Story = {
  args: {
    steps: workflowSteps,
    height: 60,
    chevronDepth: 10,
    shadow: true,
    colors: {
      completed: '#8B5CF6', // Purple
      active: '#F59E0B',    // Amber
      pending: '#6B7280',   // Gray
      disabled: '#E5E7EB',  // Light gray
    },
  },
};

/**
 * Different height variations (compact, standard, spacious).
 * Shows how ChevronProgress scales vertically.
 */
export const HeightVariations: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronProgress
        steps={taskSteps}
        height={44}
        chevronDepth={10}
        shadow={false}
      />
      <View style={styles.spacer} />
      <ChevronProgress
        steps={taskSteps}
        height={60}
        chevronDepth={10}
        shadow={true}
      />
      <View style={styles.spacer} />
      <ChevronProgress
        steps={taskSteps}
        height={80}
        chevronDepth={10}
        shadow={true}
      />
    </View>
  ),
};

/**
 * Different chevron depth variations (subtle, standard, dramatic).
 * Shows how chevron angles change with depth.
 */
export const DepthVariations: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronProgress
        steps={taskSteps}
        height={60}
        chevronDepth={5}
        shadow={true}
      />
      <View style={styles.spacer} />
      <ChevronProgress
        steps={taskSteps}
        height={60}
        chevronDepth={10}
        shadow={true}
      />
      <View style={styles.spacer} />
      <ChevronProgress
        steps={taskSteps}
        height={60}
        chevronDepth={20}
        shadow={true}
      />
    </View>
  ),
};

/**
 * Progress states at different completion levels (0%, 25%, 50%, 75%, 100%).
 * Demonstrates typical workflow progression over time.
 */
export const ProgressLevels: Story = {
  render: () => {
    const createSteps = (activeIndex: number): ProgressStep[] =>
      workflowSteps.map((step, idx) => ({
        ...step,
        state:
          idx < activeIndex ? 'completed' : idx === activeIndex ? 'active' : 'pending',
      }));

    return (
      <View style={styles.column}>
        {/* 0% - All pending */}
        <ChevronProgress
          steps={createSteps(-1).map(s => ({ ...s, state: 'pending' as const }))}
          height={50}
          chevronDepth={10}
          shadow={false}
        />
        <View style={styles.spacer} />

        {/* 25% - First step active */}
        <ChevronProgress
          steps={createSteps(0)}
          height={50}
          chevronDepth={10}
          shadow={false}
        />
        <View style={styles.spacer} />

        {/* 50% - Middle step active */}
        <ChevronProgress
          steps={createSteps(2)}
          height={50}
          chevronDepth={10}
          shadow={false}
        />
        <View style={styles.spacer} />

        {/* 75% - Near end */}
        <ChevronProgress
          steps={createSteps(3)}
          height={50}
          chevronDepth={10}
          shadow={false}
        />
        <View style={styles.spacer} />

        {/* 100% - All completed */}
        <ChevronProgress
          steps={workflowSteps.map(s => ({ ...s, state: 'completed' as const }))}
          height={50}
          chevronDepth={10}
          shadow={true}
        />
      </View>
    );
  },
};

/**
 * Three-step wizard flow (classic pattern).
 * Minimal steps for simple workflows or onboarding.
 */
export const ThreeStepWizard: Story = {
  args: {
    steps: [
      { id: '1', label: 'Account', state: 'completed', description: 'Basic info' },
      { id: '2', label: 'Profile', state: 'active', description: 'Details' },
      { id: '3', label: 'Verify', state: 'pending', description: 'Confirmation' },
    ],
    height: 60,
    chevronDepth: 10,
    shadow: true,
  },
};

/**
 * Six-step detailed workflow.
 * Demonstrates handling of many steps in limited space.
 */
export const SixStepWorkflow: Story = {
  args: {
    steps: [
      { id: '1', label: 'Init', state: 'completed' },
      { id: '2', label: 'Config', state: 'completed' },
      { id: '3', label: 'Build', state: 'completed' },
      { id: '4', label: 'Test', state: 'active' },
      { id: '5', label: 'Deploy', state: 'pending' },
      { id: '6', label: 'Monitor', state: 'pending' },
    ],
    height: 50,
    chevronDepth: 10,
    shadow: false,
  },
};

/**
 * With and without shadows comparison.
 * Shows flat vs elevated design options.
 */
export const ShadowComparison: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronProgress
        steps={taskSteps}
        height={60}
        chevronDepth={10}
        shadow={false}
      />
      <View style={styles.spacer} />
      <ChevronProgress
        steps={taskSteps}
        height={60}
        chevronDepth={10}
        shadow={true}
      />
    </View>
  ),
};

/**
 * Compact mobile size (44px height - iOS tab bar standard).
 * Optimized for small screens and mobile devices.
 */
export const CompactMobile: Story = {
  args: {
    steps: taskSteps.map(s => ({ ...s, description: undefined })),
    height: 44,
    chevronDepth: 10,
    shadow: false,
  },
};

/**
 * All four state types displayed together.
 * Reference for state colors and appearance.
 */
export const AllStates: Story = {
  args: {
    steps: [
      { id: '1', label: 'Completed', state: 'completed', description: 'Green' },
      { id: '2', label: 'Active', state: 'active', description: 'Blue' },
      { id: '3', label: 'Pending', state: 'pending', description: 'Gray' },
      { id: '4', label: 'Disabled', state: 'disabled', description: 'Light' },
    ],
    height: 60,
    chevronDepth: 10,
    shadow: true,
  },
};

const styles = StyleSheet.create({
  column: {
    gap: 16,
  },
  spacer: {
    height: 16,
  },
});
