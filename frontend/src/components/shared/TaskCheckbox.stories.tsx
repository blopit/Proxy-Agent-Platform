import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';
import TaskCheckbox from './TaskCheckbox';

const meta: Meta<typeof TaskCheckbox> = {
  title: 'Shared/TaskCheckbox',
  component: TaskCheckbox,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#fdf6e3' },
        { name: 'dark', value: '#002b36' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '40px', minWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaskCheckbox>;

// ============================================================================
// Size Variants - All three sizes with theme colors
// ============================================================================

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Full Size (24px) - Default for primary tasks
        </h3>
        <TaskCheckbox id="full-1" label="Write comprehensive documentation" size="full" />
        <TaskCheckbox id="full-2" label="Review code changes" size="full" checked />
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Micro Size (18px) - For task cards and compact views
        </h3>
        <TaskCheckbox id="micro-1" label="Draft email to client" size="micro" />
        <TaskCheckbox id="micro-2" label="Attach project files" size="micro" checked />
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Nano Size (14px) - For dense micro-step lists
        </h3>
        <TaskCheckbox id="nano-1" label="Import dependencies" size="nano" />
        <TaskCheckbox id="nano-2" label="Run type checks" size="nano" checked />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive Demo - Watch the animation sequence
// ============================================================================

export const InteractiveDemo: Story = {
  render: function InteractiveDemoStory() {
    const [checked, setChecked] = useState(false);

    return (
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Interactive Animation Demo
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '16px', fontStyle: 'italic' }}>
          Click to watch: SVG checkmark draws (0.4s) → strikethrough shoots across (0.3s) → label fades
        </p>

        <div style={{
          padding: '20px',
          backgroundColor: 'var(--background, #fdf6e3)',
          borderRadius: '8px',
          border: '1px solid var(--border, #d1d6ee)'
        }}>
          <TaskCheckbox
            id="interactive-demo"
            label="Complete project documentation"
            size="full"
            checked={checked}
            onChange={setChecked}
          />
        </div>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '6px' }}>
          <p style={{ fontSize: '11px', color: '#374151', margin: 0 }}>
            <strong>Current state:</strong> {checked ? 'Checked ✓' : 'Unchecked ○'}
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>
            Animation: Check draw (0.4s) + Strikethrough shoot (0.3s) = ~0.7s total
          </p>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Micro-Step List - Real-world ADHD-friendly example
// ============================================================================

export const MicroStepList: Story = {
  render: function MicroStepListStory() {
    const [steps, setSteps] = useState([
      { id: 'step-1', label: 'Open code editor', checked: true },
      { id: 'step-2', label: 'Create new component file', checked: true },
      { id: 'step-3', label: 'Write component interface', checked: false },
      { id: 'step-4', label: 'Implement render logic', checked: false },
      { id: 'step-5', label: 'Add Storybook story', checked: false },
    ]);

    const handleStepChange = (index: number, checked: boolean) => {
      const newSteps = [...steps];
      newSteps[index].checked = checked;
      setSteps(newSteps);
    };

    const completedCount = steps.filter(s => s.checked).length;
    const totalCount = steps.length;
    const progress = Math.round((completedCount / totalCount) * 100);

    return (
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '14px', color: '#586e75', margin: 0 }}>
            Micro-Steps: Build Task Checkbox Component
          </h3>
          <div style={{
            fontSize: '12px',
            color: '#268bd2',
            fontWeight: 'bold',
            padding: '4px 12px',
            backgroundColor: '#eef4fb',
            borderRadius: '12px'
          }}>
            {completedCount}/{totalCount} ({progress}%)
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '16px', fontStyle: 'italic' }}>
          ADHD-optimized: Each step is 2-5 min max. Check them off for dopamine hits! 🎯
        </p>

        <div style={{
          backgroundColor: 'var(--background, #ffffff)',
          border: '1px solid var(--border, #d1d6ee)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {steps.map((step, index) => (
            <TaskCheckbox
              key={step.id}
              id={step.id}
              label={step.label}
              size="micro"
              checked={step.checked}
              onChange={(checked) => handleStepChange(index, checked)}
            />
          ))}
        </div>

        {completedCount === totalCount && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#d1f4e0',
            border: '2px solid #859900',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '14px', color: '#073642', fontWeight: 'bold' }}>
              All steps complete! Great work! 💪
            </div>
          </div>
        )}
      </div>
    );
  },
};

// ============================================================================
// Theme Variants - Light and Dark modes
// ============================================================================

export const ThemeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Light Theme (Default)
        </h3>
        <div style={{
          padding: '20px',
          backgroundColor: '#fdf6e3',
          borderRadius: '8px',
          border: '1px solid #d1d6ee'
        }}>
          <TaskCheckbox id="light-1" label="Unchecked task" size="full" />
          <TaskCheckbox id="light-2" label="Checked task" size="full" checked />
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Dark Theme
        </h3>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#002b36',
            borderRadius: '8px',
            border: '1px solid #073642'
          }}
          className="dark"
        >
          <TaskCheckbox id="dark-1" label="Unchecked task" size="full" />
          <TaskCheckbox id="dark-2" label="Checked task" size="full" checked />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// States Showcase - All interaction states
// ============================================================================

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Unchecked State
        </h3>
        <TaskCheckbox id="state-unchecked" label="Task not started" size="full" />
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Checked State (with strikethrough)
        </h3>
        <TaskCheckbox id="state-checked" label="Task completed" size="full" checked />
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Disabled State - Unchecked
        </h3>
        <TaskCheckbox id="state-disabled-unchecked" label="Cannot be modified" size="full" disabled />
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Disabled State - Checked
        </h3>
        <TaskCheckbox
          id="state-disabled-checked"
          label="Completed but locked"
          size="full"
          disabled
          checked
        />
      </div>
    </div>
  ),
};

// ============================================================================
// Animation Timing Showcase - For documentation
// ============================================================================

export const AnimationShowcase: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
        Animation Sequence Breakdown
      </h3>
      <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '16px', fontStyle: 'italic' }}>
        Click each checkbox to see the carefully orchestrated animation sequence
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#268bd2', marginBottom: '8px' }}>
            Phase 1: Checkmark Draw (0-0.4s)
          </div>
          <TaskCheckbox
            id="anim-phase-1"
            label="SVG path animates from start to end"
            size="full"
          />
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            Stroke-dasharray/dashoffset technique for smooth drawing effect
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#cb4b16', marginBottom: '8px' }}>
            Phase 2: Strikethrough Shoot (0.4-0.7s)
          </div>
          <TaskCheckbox
            id="anim-phase-2"
            label="Line expands from left to right across label"
            size="full"
          />
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            Width transition from 0% to 100% with 0.1s delay after check completes
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#859900', marginBottom: '8px' }}>
            Phase 3: Label Fade (0.7s)
          </div>
          <TaskCheckbox
            id="anim-phase-3"
            label="Text color fades to muted foreground"
            size="full"
          />
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
            Color transition completes the visual "done" state
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#eef4fb',
        borderRadius: '6px',
        border: '1px solid #268bd2'
      }}>
        <div style={{ fontSize: '11px', color: '#073642', fontWeight: 'bold', marginBottom: '4px' }}>
          ADHD Optimization:
        </div>
        <div style={{ fontSize: '11px', color: '#586e75' }}>
          Total animation time: ~0.7s - long enough to be satisfying, short enough to maintain momentum.
          Each phase provides a micro-dopamine hit for maximum engagement!
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Accessibility Showcase
// ============================================================================

export const AccessibilityDemo: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
        Accessibility Features
      </h3>
      <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '16px', fontStyle: 'italic' }}>
        Keyboard navigation, screen reader support, and focus states
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #d1d6ee'
      }}>
        <TaskCheckbox
          id="a11y-1"
          label="Press Tab to focus, Space to toggle"
          size="full"
          ariaLabel="Example checkbox with keyboard support"
        />
        <TaskCheckbox
          id="a11y-2"
          label="Focus ring appears on keyboard navigation"
          size="full"
        />
        <TaskCheckbox
          id="a11y-3"
          label="Screen readers announce label and state"
          size="full"
          checked
        />
      </div>

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f4f8', borderRadius: '6px' }}>
        <div style={{ fontSize: '11px', color: '#374151', marginBottom: '8px' }}>
          <strong>Keyboard Shortcuts:</strong>
        </div>
        <ul style={{ fontSize: '11px', color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
          <li><code>Tab</code> - Navigate to next checkbox</li>
          <li><code>Shift + Tab</code> - Navigate to previous checkbox</li>
          <li><code>Space</code> - Toggle checkbox state</li>
          <li><code>Enter</code> - Activate checkbox (when focused)</li>
        </ul>
      </div>
    </div>
  ),
};

// ============================================================================
// Real-world Integration Example
// ============================================================================

export const RealWorldExample: Story = {
  render: function RealWorldExampleStory() {
    const [tasks, setTasks] = useState([
      {
        id: 'task-1',
        title: 'Email John about project',
        microSteps: [
          { id: 'ms-1-1', label: 'Draft email (2 min)', checked: true },
          { id: 'ms-1-2', label: 'Attach files (1 min)', checked: true },
          { id: 'ms-1-3', label: 'Send email (30 sec)', checked: false },
        ],
      },
      {
        id: 'task-2',
        title: 'Fix login bug',
        microSteps: [
          { id: 'ms-2-1', label: 'Reproduce bug (3 min)', checked: false },
          { id: 'ms-2-2', label: 'Identify root cause (5 min)', checked: false },
          { id: 'ms-2-3', label: 'Write fix (4 min)', checked: false },
          { id: 'ms-2-4', label: 'Test fix (2 min)', checked: false },
        ],
      },
    ]);

    const handleMicroStepChange = (taskIndex: number, stepIndex: number, checked: boolean) => {
      const newTasks = [...tasks];
      newTasks[taskIndex].microSteps[stepIndex].checked = checked;
      setTasks(newTasks);
    };

    return (
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Task List with Micro-Steps
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '16px', fontStyle: 'italic' }}>
          How TaskCheckbox integrates with the Hunter mode and AsyncJobTimeline
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tasks.map((task, taskIndex) => {
            const completedSteps = task.microSteps.filter(s => s.checked).length;
            const totalSteps = task.microSteps.length;
            const progress = Math.round((completedSteps / totalSteps) * 100);

            return (
              <div
                key={task.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #d1d6ee',
                  borderRadius: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ fontSize: '13px', color: '#073642', margin: 0, fontWeight: 600 }}>
                    {task.title}
                  </h4>
                  <div style={{
                    fontSize: '11px',
                    color: progress === 100 ? '#859900' : '#268bd2',
                    fontWeight: 'bold',
                    padding: '3px 10px',
                    backgroundColor: progress === 100 ? '#d1f4e0' : '#eef4fb',
                    borderRadius: '10px'
                  }}>
                    {completedSteps}/{totalSteps}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {task.microSteps.map((step, stepIndex) => (
                    <TaskCheckbox
                      key={step.id}
                      id={step.id}
                      label={step.label}
                      size="nano"
                      checked={step.checked}
                      onChange={(checked) => handleMicroStepChange(taskIndex, stepIndex, checked)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};

// ============================================================================
// Default Export
// ============================================================================

export const Default: Story = {
  args: {
    id: 'default-checkbox',
    label: 'Complete this task',
    size: 'full',
    checked: false,
    disabled: false,
  },
};
