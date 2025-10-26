import type { Meta, StoryObj } from '@storybook/nextjs';
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
