import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import ChevronStep, { CollapsedChevron } from './ChevronStep';
import OpenMoji from '@/components/shared/OpenMoji';

const meta: Meta<typeof ChevronStep> = {
  title: 'Components/Mobile/ChevronStep',
  component: ChevronStep,
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
      <div style={{ padding: '40px', minWidth: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChevronStep>;

// ============================================================================
// Basic Shapes
// ============================================================================

export const AllPositions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0', width: '600px' }}>
      <ChevronStep status="pending" position="first" size="full" width="150px">
        <span style={{ fontSize: '12px', color: '#073642' }}>First</span>
      </ChevronStep>
      <ChevronStep status="active" position="middle" size="full" width="150px">
        <span style={{ fontSize: '12px', color: '#268bd2', fontWeight: 'bold' }}>Middle</span>
      </ChevronStep>
      <ChevronStep status="done" position="middle" size="full" width="150px">
        <span style={{ fontSize: '12px', color: '#93a1a1' }}>Middle</span>
      </ChevronStep>
      <ChevronStep status="pending" position="last" size="full" width="150px">
        <span style={{ fontSize: '12px', color: '#073642' }}>Last</span>
      </ChevronStep>
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '600px' }}>
      <div style={{ display: 'flex', gap: '0' }}>
        <ChevronStep status="pending" position="first" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#073642' }}>Pending</span>
        </ChevronStep>
        <ChevronStep status="pending" position="middle" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#073642' }}>Pending</span>
        </ChevronStep>
        <ChevronStep status="pending" position="last" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#073642' }}>Pending</span>
        </ChevronStep>
      </div>

      <div style={{ display: 'flex', gap: '0' }}>
        <ChevronStep status="active" position="first" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#268bd2', fontWeight: 'bold' }}>Active</span>
        </ChevronStep>
        <ChevronStep status="active" position="middle" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#268bd2', fontWeight: 'bold' }}>Active</span>
        </ChevronStep>
        <ChevronStep status="active" position="last" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#268bd2', fontWeight: 'bold' }}>Active</span>
        </ChevronStep>
      </div>

      <div style={{ display: 'flex', gap: '0' }}>
        <ChevronStep status="done" position="first" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#93a1a1' }}>Done</span>
        </ChevronStep>
        <ChevronStep status="done" position="middle" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#93a1a1' }}>Done</span>
        </ChevronStep>
        <ChevronStep status="done" position="last" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#93a1a1' }}>Done</span>
        </ChevronStep>
      </div>

      <div style={{ display: 'flex', gap: '0' }}>
        <ChevronStep status="error" position="first" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold' }}>Error</span>
        </ChevronStep>
        <ChevronStep status="error" position="middle" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold' }}>Error</span>
        </ChevronStep>
        <ChevronStep status="error" position="last" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold' }}>Error</span>
        </ChevronStep>
      </div>

      <div style={{ display: 'flex', gap: '0' }}>
        <ChevronStep status="next" position="first" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold' }}>Next</span>
        </ChevronStep>
        <ChevronStep status="next" position="middle" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold' }}>Next</span>
        </ChevronStep>
        <ChevronStep status="next" position="last" size="full" width="200px">
          <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold' }}>Next</span>
        </ChevronStep>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '600px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Full Size (64px)</h3>
        <div style={{ display: 'flex', gap: '0' }}>
          <ChevronStep status="pending" position="first" size="full" width="150px">
            <span style={{ fontSize: '12px', color: '#073642' }}>Step 1</span>
          </ChevronStep>
          <ChevronStep status="active" position="middle" size="full" width="200px">
            <span style={{ fontSize: '12px', color: '#268bd2', fontWeight: 'bold' }}>Step 2</span>
          </ChevronStep>
          <ChevronStep status="pending" position="middle" size="full" width="150px">
            <span style={{ fontSize: '12px', color: '#073642' }}>Step 3</span>
          </ChevronStep>
          <ChevronStep status="pending" position="last" size="full" width="100px">
            <span style={{ fontSize: '12px', color: '#073642' }}>4</span>
          </ChevronStep>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Micro Size (40px)</h3>
        <div style={{ display: 'flex', gap: '0' }}>
          <ChevronStep status="done" position="first" size="micro" width="100px">
            <span style={{ fontSize: '10px', color: '#93a1a1' }}>Step 1</span>
          </ChevronStep>
          <ChevronStep status="active" position="middle" size="micro" width="150px">
            <span style={{ fontSize: '10px', color: '#268bd2', fontWeight: 'bold' }}>Step 2</span>
          </ChevronStep>
          <ChevronStep status="pending" position="middle" size="micro" width="100px">
            <span style={{ fontSize: '10px', color: '#073642' }}>Step 3</span>
          </ChevronStep>
          <ChevronStep status="pending" position="last" size="micro" width="100px">
            <span style={{ fontSize: '10px', color: '#073642' }}>4</span>
          </ChevronStep>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Nano Size (32px)</h3>
        <div style={{ display: 'flex', gap: '0' }}>
          <ChevronStep status="done" position="first" size="nano" width="100px">
            <span style={{ fontSize: '9px', color: '#93a1a1' }}>1</span>
          </ChevronStep>
          <ChevronStep status="active" position="middle" size="nano" width="100px">
            <span style={{ fontSize: '9px', color: '#268bd2', fontWeight: 'bold' }}>2</span>
          </ChevronStep>
          <ChevronStep status="pending" position="middle" size="nano" width="100px">
            <span style={{ fontSize: '9px', color: '#073642' }}>3</span>
          </ChevronStep>
          <ChevronStep status="pending" position="last" size="nano" width="100px">
            <span style={{ fontSize: '9px', color: '#073642' }}>4</span>
          </ChevronStep>
        </div>
      </div>
    </div>
  ),
};

export const SingleChevron: Story = {
  render: () => (
    <ChevronStep status="pending" position="single" size="full" width="200px">
      <span style={{ fontSize: '12px', color: '#073642' }}>Single Step</span>
    </ChevronStep>
  ),
};

export const CollapsedVariant: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0' }}>
      <CollapsedChevron stepNumber={1} status="done" position="first" size="full" />
      <CollapsedChevron stepNumber={2} status="active" position="middle" size="full" />
      <CollapsedChevron stepNumber={3} status="pending" position="middle" size="full" />
      <CollapsedChevron stepNumber={4} status="pending" position="last" size="full" />
    </div>
  ),
};

export const TightlyKnit: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        Chevrons fitting together with -4px margin
      </h3>
      <div style={{ display: 'flex', marginRight: '-4px' }}>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="first" size="full" width="150px">
            <span style={{ fontSize: '11px', color: '#93a1a1' }}>Parse</span>
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="middle" size="full" width="150px">
            <span style={{ fontSize: '11px', color: '#93a1a1' }}>Decompose</span>
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="active" position="middle" size="full" width="200px">
            <span style={{ fontSize: '11px', color: '#268bd2', fontWeight: 'bold' }}>Classify</span>
          </ChevronStep>
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="100px">
            <span style={{ fontSize: '11px', color: '#073642' }}>Save</span>
          </ChevronStep>
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Expanded vs Collapsed States
// ============================================================================

export const AllCollapsed: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        All chevrons collapsed with OpenMoji black icons (narrow widths &lt; 60px)
      </h3>
      <div style={{ display: 'flex', marginRight: '-4px' }}>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="first" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="✅" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="✅" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="active" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="⚙️" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="pending" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="⏸️" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="⏸️" size={20} variant="black" />
          </ChevronStep>
        </div>
      </div>
    </div>
  ),
};

export const FirstExpanded: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        First step expanded, all others collapsed with OpenMoji icons
      </h3>
      <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
        Accordion behavior: When one step is expanded, all others are collapsed
      </p>
      <div style={{ display: 'flex', marginRight: '-4px' }}>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="first" size="full" width="200px" isExpanded={true}>
            <span style={{ fontSize: '11px', color: '#22c55e' }}>Parse Input</span>
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="✅" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="active" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="⚙️" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="pending" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="⏸️" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="💾" size={20} variant="black" />
          </ChevronStep>
        </div>
      </div>
    </div>
  ),
};

export const MiddleExpanded: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        Middle step (active) expanded, all others collapsed with OpenMoji icons
      </h3>
      <div style={{ display: 'flex', marginRight: '-4px' }}>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="first" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="📝" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="✅" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="active" position="middle" size="full" width="280px" isExpanded={true}>
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Classify & Extract Features</span>
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="pending" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="📋" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="💾" size={20} variant="black" />
          </ChevronStep>
        </div>
      </div>
    </div>
  ),
};

export const LastExpanded: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        Last step expanded, all others collapsed with OpenMoji icons
      </h3>
      <div style={{ display: 'flex', marginRight: '-4px' }}>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="first" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="📝" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="🔧" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="✅" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-4px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false}>
            <OpenMoji emoji="📋" size={20} variant="black" />
          </ChevronStep>
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="180px" isExpanded={true}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Save to Database</span>
          </ChevronStep>
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive Accordion Behavior
// ============================================================================

export const InteractiveAccordion: Story = {
  render: function InteractiveAccordionStory() {
    const [expandedStep, setExpandedStep] = React.useState<number>(3);

    const steps = [
      { id: 1, label: 'Parse Input', status: 'done' as const, icon: '📝' },
      { id: 2, label: 'Decompose Task', status: 'done' as const, icon: '🔧' },
      { id: 3, label: 'Classify & Extract', status: 'active' as const, icon: '⚙️' },
      { id: 4, label: 'Generate Plan', status: 'pending' as const, icon: '📋' },
      { id: 5, label: 'Save Results', status: 'pending' as const, icon: '💾' },
    ];

    const getPosition = (index: number): 'first' | 'middle' | 'last' => {
      if (index === 0) return 'first';
      if (index === steps.length - 1) return 'last';
      return 'middle';
    };

    return (
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Interactive Accordion - Click any step to expand it
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '16px', fontStyle: 'italic' }}>
          Rule: Only one step can be expanded at a time. Collapsed steps show OpenMoji black icons.
        </p>
        <div style={{ display: 'flex', marginRight: '-4px' }}>
          {steps.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            const position = getPosition(index);

            return (
              <div key={step.id} style={{ marginRight: index < steps.length - 1 ? '-4px' : '0' }}>
                <ChevronStep
                  status={step.status}
                  position={position}
                  size="full"
                  width={isExpanded ? '240px' : '40px'}
                  isExpanded={isExpanded}
                  onClick={() => setExpandedStep(step.id)}
                  ariaLabel={`Step ${step.id}: ${step.label}${isExpanded ? ' (expanded)' : ' (collapsed)'}`}
                >
                  {isExpanded ? (
                    <span style={{
                      fontSize: '11px',
                      color: step.status === 'active' ? '#3b82f6' : step.status === 'done' ? '#22c55e' : '#6b7280',
                      fontWeight: step.status === 'active' ? 'bold' : 'normal'
                    }}>
                      {step.label}
                    </span>
                  ) : (
                    <OpenMoji emoji={step.icon} size={20} variant="black" />
                  )}
                </ChevronStep>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          <p style={{ fontSize: '11px', color: '#374151', margin: 0 }}>
            Currently expanded: <strong>Step {expandedStep} - {steps.find(s => s.id === expandedStep)?.label}</strong>
          </p>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Width Comparison
// ============================================================================

// ============================================================================
// Animation Showcase
// ============================================================================

export const AnimationShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '600px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Active Status - Shimmer Progress Animation
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          Active steps display a left-to-right shimmer sweep to indicate ongoing progress
        </p>
        <div style={{ display: 'flex', gap: '0' }}>
          <ChevronStep status="done" position="first" size="full" width="150px">
            <span style={{ fontSize: '12px', color: '#22c55e' }}>Complete</span>
          </ChevronStep>
          <ChevronStep status="active" position="middle" size="full" width="200px">
            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>In Progress</span>
          </ChevronStep>
          <ChevronStep status="pending" position="last" size="full" width="150px">
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Waiting</span>
          </ChevronStep>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Next Status - Elastic Wiggle Animation
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          Next steps wiggle left and right with elastic squash-and-stretch every 3 seconds
        </p>
        <div style={{ display: 'flex', gap: '0' }}>
          <ChevronStep status="done" position="first" size="full" width="150px">
            <span style={{ fontSize: '12px', color: '#22c55e' }}>Complete</span>
          </ChevronStep>
          <ChevronStep status="next" position="middle" size="full" width="200px">
            <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 'bold' }}>Up Next</span>
          </ChevronStep>
          <ChevronStep status="pending" position="last" size="full" width="150px">
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Later</span>
          </ChevronStep>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Full Pipeline with All Animation States
        </h3>
        <div style={{ display: 'flex', gap: '0' }}>
          <ChevronStep status="done" position="first" size="full" width="120px">
            <span style={{ fontSize: '11px', color: '#22c55e' }}>Done</span>
          </ChevronStep>
          <ChevronStep status="active" position="middle" size="full" width="140px">
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Active</span>
          </ChevronStep>
          <ChevronStep status="next" position="middle" size="full" width="120px">
            <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Next</span>
          </ChevronStep>
          <ChevronStep status="pending" position="last" size="full" width="120px">
            <span style={{ fontSize: '11px', color: '#6b7280' }}>Pending</span>
          </ChevronStep>
        </div>
      </div>
    </div>
  ),
};

export const WidthComparison: Story = {
  render: () => {
    const stepIcons = ['📝', '🔧', '⚙️', '📋', '💾'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
            Collapsed Width (40px each) - OpenMoji black icons
          </h3>
          <div style={{ display: 'flex', marginRight: '-4px' }}>
            {[1, 2, 3, 4, 5].map((num, idx) => (
              <div key={num} style={{ marginRight: idx < 4 ? '-4px' : '0' }}>
                <ChevronStep
                  status={num <= 2 ? 'done' : num === 3 ? 'active' : 'pending'}
                  position={idx === 0 ? 'first' : idx === 4 ? 'last' : 'middle'}
                  size="full"
                  width="40px"
                  isExpanded={false}
                >
                  <OpenMoji emoji={stepIcons[idx]} size={20} variant="black" />
                </ChevronStep>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
            Standard Width (120px each) - Text labels
          </h3>
          <div style={{ display: 'flex', marginRight: '-4px' }}>
            {[1, 2, 3, 4, 5].map((num, idx) => (
              <div key={num} style={{ marginRight: idx < 4 ? '-4px' : '0' }}>
                <ChevronStep
                  status={num <= 2 ? 'done' : num === 3 ? 'active' : 'pending'}
                  position={idx === 0 ? 'first' : idx === 4 ? 'last' : 'middle'}
                  size="full"
                  width="120px"
                  isExpanded={false}
                >
                  <span style={{ fontSize: '11px' }}>Step {num}</span>
                </ChevronStep>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
            Accordion Mode - Active expanded (200px), others collapsed with icons
          </h3>
          <div style={{ display: 'flex', marginRight: '-4px' }}>
            {[1, 2, 3, 4, 5].map((num, idx) => {
              const isActive = num === 3;
              return (
                <div key={num} style={{ marginRight: idx < 4 ? '-4px' : '0' }}>
                  <ChevronStep
                    status={num <= 2 ? 'done' : num === 3 ? 'active' : 'pending'}
                    position={idx === 0 ? 'first' : idx === 4 ? 'last' : 'middle'}
                    size="full"
                    width={isActive ? '200px' : '40px'}
                    isExpanded={isActive}
                  >
                    {isActive ? (
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6' }}>
                        Classify & Extract
                      </span>
                    ) : (
                      <OpenMoji emoji={stepIcons[idx]} size={20} variant="black" />
                    )}
                  </ChevronStep>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};
