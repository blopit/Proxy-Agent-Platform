import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import ChevronStep, { CollapsedChevron } from './ChevronStep';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Base State - All Positions with Labels
        </h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="120px">
              <span style={{ fontSize: '11px', color: '#22c55e' }}>First</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="140px">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Middle</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="next" position="middle" size="full" width="120px">
              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Middle</span>
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="100px">
              <span style={{ fontSize: '11px', color: '#6b7280' }}>Last</span>
            </ChevronStep>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Accordion State - One Expanded, Others with Icons
        </h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="40px" emoji="✅" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="240px" emoji="⚙️">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Processing Step</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="next" position="middle" size="full" width="40px" emoji="📋" />
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="40px" emoji="💾" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '600px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Pending Status</h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="pending" position="first" size="full" width="120px" emoji="⏸️">
              Pending
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="pending" position="middle" size="full" width="120px" emoji="⏸️">
              Pending
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="120px" emoji="⏸️">
              Pending
            </ChevronStep>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Active Status (with shimmer)</h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="first" size="full" width="120px" emoji="⚙️">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Active</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="120px" emoji="⚙️">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Active</span>
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="active" position="last" size="full" width="120px" emoji="⚙️">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Active</span>
            </ChevronStep>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Done Status</h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="120px" emoji="✅">
              Done
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="120px" emoji="✅">
              Done
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="done" position="last" size="full" width="120px" emoji="✅">
              Done
            </ChevronStep>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Error Status</h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="error" position="first" size="full" width="120px" emoji="❌">
              Error
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="error" position="middle" size="full" width="120px" emoji="❌">
              Error
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="error" position="last" size="full" width="120px" emoji="❌">
              Error
            </ChevronStep>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>Next Status (with elastic wiggle)</h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="next" position="first" size="full" width="120px" emoji="📋">
              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Next</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="next" position="middle" size="full" width="120px" emoji="📋">
              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Next</span>
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="next" position="last" size="full" width="120px" emoji="📋">
              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Next</span>
            </ChevronStep>
          </div>
        </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Collapsed with Step Numbers
        </h3>
        <div style={{ display: 'flex', gap: '0' }}>
          <CollapsedChevron stepNumber={1} status="done" position="first" size="full" />
          <CollapsedChevron stepNumber={2} status="active" position="middle" size="full" />
          <CollapsedChevron stepNumber={3} status="pending" position="middle" size="full" />
          <CollapsedChevron stepNumber={4} status="pending" position="last" size="full" />
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
          Collapsed with OpenMoji Icons
        </h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="40px" emoji="✅" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="40px" emoji="⚙️" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="pending" position="middle" size="full" width="40px" emoji="⏸️" />
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="40px" emoji="📋" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const TightlyKnit: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
          Chevrons fitting together with -4px margin - Text Labels
        </h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="150px">
              <span style={{ fontSize: '11px', color: '#93a1a1' }}>Parse</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="150px">
              <span style={{ fontSize: '11px', color: '#93a1a1' }}>Decompose</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
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

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
          Chevrons fitting together - OpenMoji Icons (Mixed Widths)
        </h3>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="40px" emoji="✅" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="40px" emoji="✅" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="220px" emoji="⚙️">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Classify & Extract</span>
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="40px" emoji="💾" />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const OpenMojiShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Collapsed States with Emoji Icons
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          Clean emoji icons - ideal for collapsed states
        </p>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="40px" emoji="✅" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="40px" emoji="📝" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="40px" emoji="⚙️" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="pending" position="middle" size="full" width="40px" emoji="📋" />
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="40px" emoji="💾" />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Expanded States with Emoji + Text
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          Full-color emojis with labels - adds visual richness and context
        </p>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="100px" emoji="✅">
              Done
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="100px" emoji="📝">
              Parse
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="120px" emoji="⚙️">
              Process
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="pending" position="middle" size="full" width="100px" emoji="📋">
              Review
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="90px" emoji="💾">
              Save
            </ChevronStep>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Process Pipeline with Contextual Icons
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          Using semantic icons to represent different process stages
        </p>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="40px" emoji="📥" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="40px" emoji="🔍" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="40px" emoji="🔧" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="40px" emoji="✨" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="next" position="middle" size="full" width="40px" emoji="✅" />
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="40px" emoji="📤" />
          </div>
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
        All chevrons collapsed with emoji icons (narrow widths &lt; 60px)
      </h3>
      <div style={{ display: 'flex', marginRight: '-2px' }}>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="first" size="full" width="40px" isExpanded={false} emoji="✅" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false} emoji="✅" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="active" position="middle" size="full" width="40px" isExpanded={false} emoji="⚙️" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="pending" position="middle" size="full" width="40px" isExpanded={false} emoji="⏸️" />
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="40px" isExpanded={false} emoji="⏸️" />
        </div>
      </div>
    </div>
  ),
};

export const FirstExpanded: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        First step expanded, all others collapsed with emoji icons
      </h3>
      <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
        Accordion behavior: When one step is expanded, all others are collapsed
      </p>
      <div style={{ display: 'flex', marginRight: '-2px' }}>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="first" size="full" width="200px" isExpanded={true} emoji="📝">
            <span style={{ fontSize: '11px', color: '#22c55e' }}>Parse Input</span>
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false} emoji="✅" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="active" position="middle" size="full" width="40px" isExpanded={false} emoji="⚙️" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="pending" position="middle" size="full" width="40px" isExpanded={false} emoji="⏸️" />
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="40px" isExpanded={false} emoji="💾" />
        </div>
      </div>
    </div>
  ),
};

export const MiddleExpanded: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        Middle step (active) expanded, all others collapsed with emoji icons
      </h3>
      <div style={{ display: 'flex', marginRight: '-2px' }}>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="first" size="full" width="40px" isExpanded={false} emoji="📝" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false} emoji="✅" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="active" position="middle" size="full" width="280px" isExpanded={true} emoji="⚙️">
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Classify & Extract Features</span>
          </ChevronStep>
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="pending" position="middle" size="full" width="40px" isExpanded={false} emoji="📋" />
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="40px" isExpanded={false} emoji="💾" />
        </div>
      </div>
    </div>
  ),
};

export const LastExpanded: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '16px' }}>
        Last step expanded, all others collapsed with emoji icons
      </h3>
      <div style={{ display: 'flex', marginRight: '-2px' }}>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="first" size="full" width="40px" isExpanded={false} emoji="📝" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false} emoji="🔧" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false} emoji="✅" />
        </div>
        <div style={{ marginRight: '-2px' }}>
          <ChevronStep status="done" position="middle" size="full" width="40px" isExpanded={false} emoji="📋" />
        </div>
        <div>
          <ChevronStep status="pending" position="last" size="full" width="180px" isExpanded={true} emoji="💾">
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
    const [expandedStep, setExpandedStep] = React.useState<number | null>(null);

    const steps = [
      { id: 1, label: 'Parse Input', status: 'done' as const, icon: '📝' },
      { id: 2, label: 'Decompose Task', status: 'done' as const, icon: '🔧' },
      { id: 3, label: 'Classify & Extract', status: 'active' as const, icon: '⚙️' },
      { id: 4, label: 'Generate Plan', status: 'next' as const, icon: '📋' },
      { id: 5, label: 'Save Results', status: 'pending' as const, icon: '💾' },
    ];

    const getPosition = (index: number): 'first' | 'middle' | 'last' => {
      if (index === 0) return 'first';
      if (index === steps.length - 1) return 'last';
      return 'middle';
    };

    const isBaseState = expandedStep === null;

    return (
      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Interactive Accordion - Three States
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '4px', fontStyle: 'italic' }}>
          <strong>Base State:</strong> All steps equal width with OpenMoji icons
        </p>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          <strong>Accordion State:</strong> Click any step to expand it (shows text), others collapse (show icons)
        </p>

        <div style={{ marginBottom: '12px' }}>
          <button
            onClick={() => setExpandedStep(null)}
            style={{
              padding: '6px 12px',
              marginRight: '8px',
              backgroundColor: isBaseState ? '#3b82f6' : '#e5e7eb',
              color: isBaseState ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            Base State
          </button>
          <button
            onClick={() => setExpandedStep(3)}
            style={{
              padding: '6px 12px',
              backgroundColor: !isBaseState ? '#3b82f6' : '#e5e7eb',
              color: !isBaseState ? '#ffffff' : '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            Accordion State
          </button>
        </div>

        <div style={{ display: 'flex', marginRight: '-2px' }}>
          {steps.map((step, index) => {
            const isExpanded = expandedStep === step.id;
            const position = getPosition(index);

            return (
              <div key={step.id} style={{ marginRight: index < steps.length - 1 ? '-4px' : '0' }}>
                <ChevronStep
                  status={step.status}
                  position={position}
                  size="full"
                  width={isBaseState ? '120px' : (isExpanded ? '240px' : '40px')}
                  isExpanded={isExpanded}
                  onClick={() => setExpandedStep(step.id)}
                  ariaLabel={`Step ${step.id}: ${step.label}${isExpanded ? ' (expanded)' : ' (collapsed)'}`}
                  emoji={step.icon}
                >
                  {(isBaseState || isExpanded) && (
                    <span style={{
                      fontSize: '11px',
                      color: step.status === 'active' ? '#3b82f6' : step.status === 'done' ? '#22c55e' : step.status === 'next' ? '#d97706' : '#6b7280',
                      fontWeight: step.status === 'active' || step.status === 'next' ? 'bold' : 'normal'
                    }}>
                      {step.label}
                    </span>
                  )}
                </ChevronStep>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
          <p style={{ fontSize: '11px', color: '#374151', margin: 0 }}>
            {isBaseState ? (
              <span><strong>Base State:</strong> All steps showing labels with equal width (120px each)</span>
            ) : (
              <span><strong>Accordion State:</strong> Step {expandedStep} expanded - {steps.find(s => s.id === expandedStep)?.label}</span>
            )}
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
          Active Status - Sleek Shimmer Progress Animation
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          Active steps display a subtle diagonal shimmer with soft glow - refined and professional
        </p>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="40px" emoji="✅" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="240px" emoji="⚙️">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Processing Data</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="pending" position="middle" size="full" width="40px" emoji="📋" />
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="40px" emoji="💾" />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Next Status - Elastic Wiggle Animation
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          Next steps wiggle left and right with elastic squash-and-stretch every 3 seconds to draw attention
        </p>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="40px" emoji="✅" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="middle" size="full" width="40px" emoji="⚙️" />
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="next" position="middle" size="full" width="200px" emoji="📋">
              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Review Results</span>
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="40px" emoji="💾" />
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '8px' }}>
          Full Pipeline with All Animation States (Base State)
        </h3>
        <p style={{ fontSize: '12px', color: '#586e75', marginBottom: '12px', fontStyle: 'italic' }}>
          All steps equal width showing labels - active shimmers, next wiggles
        </p>
        <div style={{ display: 'flex', marginRight: '-2px' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="done" position="first" size="full" width="120px" emoji="📝">
              <span style={{ fontSize: '11px', color: '#22c55e' }}>Parse</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="active" position="middle" size="full" width="140px" emoji="⚙️">
              <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>Process</span>
            </ChevronStep>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronStep status="next" position="middle" size="full" width="120px" emoji="📋">
              <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Review</span>
            </ChevronStep>
          </div>
          <div>
            <ChevronStep status="pending" position="last" size="full" width="100px" emoji="💾">
              <span style={{ fontSize: '11px', color: '#6b7280' }}>Save</span>
            </ChevronStep>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WidthComparison: Story = {
  render: () => {
    const stepIcons = ['📝', '🔧', '⚙️', '📋', '💾'];
    const stepLabels = ['Parse', 'Build', 'Process', 'Review', 'Save'];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
            Collapsed Width (40px each) - Emoji icons only
          </h3>
          <div style={{ display: 'flex', marginRight: '-2px' }}>
            {[1, 2, 3, 4, 5].map((num, idx) => (
              <div key={num} style={{ marginRight: idx < 4 ? '-4px' : '0' }}>
                <ChevronStep
                  status={num <= 2 ? 'done' : num === 3 ? 'active' : 'pending'}
                  position={idx === 0 ? 'first' : idx === 4 ? 'last' : 'middle'}
                  size="full"
                  width="40px"
                  isExpanded={false}
                  emoji={stepIcons[idx]}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
            Standard Width (120px each) - Emoji + Text labels
          </h3>
          <div style={{ display: 'flex', marginRight: '-2px' }}>
            {[1, 2, 3, 4, 5].map((num, idx) => (
              <div key={num} style={{ marginRight: idx < 4 ? '-4px' : '0' }}>
                <ChevronStep
                  status={num <= 2 ? 'done' : num === 3 ? 'active' : 'pending'}
                  position={idx === 0 ? 'first' : idx === 4 ? 'last' : 'middle'}
                  size="full"
                  width="120px"
                  isExpanded={false}
                  emoji={stepIcons[idx]}
                >
                  <span style={{ fontSize: '11px' }}>{stepLabels[idx]}</span>
                </ChevronStep>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '14px', color: '#586e75', marginBottom: '12px' }}>
            Accordion Mode - Active expanded (200px), others collapsed with icons
          </h3>
          <div style={{ display: 'flex', marginRight: '-2px' }}>
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
                    emoji={stepIcons[idx]}
                  >
                    {isActive && (
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#3b82f6' }}>
                        Classify & Extract
                      </span>
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
