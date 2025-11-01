import type { Meta, StoryObj } from '@storybook/react';
import ExpandableTile from './ExpandableTile';
import React from 'react';

const meta: Meta<typeof ExpandableTile> = {
  title: 'Mobile/Core/ExpandableTile',
  component: ExpandableTile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `A reusable expandable tile component that smoothly transitions between micro and expanded states.

Features:
- Dynamic height calculation
- Smooth cubic-bezier animations (500ms)
- Visual feedback (border colors, glow, hover states)
- Automatic content shifting
- Touch-friendly click-anywhere-to-toggle`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 min-h-[400px] w-[400px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    defaultExpanded: {
      control: 'boolean',
      description: 'Whether the tile starts expanded',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onExpandChange: {
      action: 'expanded',
      description: 'Callback when expand state changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableTile>;

// Simple text content example
export const SimpleText: Story = {
  args: {
    microContent: (
      <div className="flex items-center justify-between h-24 px-4">
        <div className="text-[#93a1a1] font-bold">Simple Tile</div>
        <div className="text-[#586e75] text-sm">Click to expand</div>
      </div>
    ),
    expandedContent: (
      <div className="p-4">
        <h3 className="text-[#93a1a1] font-bold text-lg mb-2">Expanded Content</h3>
        <p className="text-[#586e75] mb-2">
          This is the expanded view of the tile. It contains more detailed information.
        </p>
        <p className="text-[#586e75]">
          The tile smoothly animates between states and other content shifts naturally.
        </p>
      </div>
    ),
    defaultExpanded: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic example with simple text content in both states.',
      },
    },
  },
};

// Card-like content example
export const CardContent: Story = {
  args: {
    microContent: (
      <div className="flex items-center gap-3 h-24 px-4">
        <div className="w-12 h-12 rounded-full bg-[#268bd2] flex items-center justify-center text-2xl">
          📊
        </div>
        <div className="flex-1">
          <div className="text-[#93a1a1] font-bold">Statistics</div>
          <div className="text-[#586e75] text-sm">42 items · 87% complete</div>
        </div>
      </div>
    ),
    expandedContent: (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#268bd2] flex items-center justify-center text-2xl">
            📊
          </div>
          <div>
            <div className="text-[#93a1a1] font-bold text-lg">Statistics Dashboard</div>
            <div className="text-[#586e75] text-sm">Complete overview</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#073642] p-3 rounded border border-[#586e75]">
            <div className="text-[#586e75] text-xs">Total Items</div>
            <div className="text-[#93a1a1] text-xl font-bold">42</div>
          </div>
          <div className="bg-[#073642] p-3 rounded border border-[#586e75]">
            <div className="text-[#586e75] text-xs">Completed</div>
            <div className="text-[#93a1a1] text-xl font-bold">87%</div>
          </div>
          <div className="bg-[#073642] p-3 rounded border border-[#586e75]">
            <div className="text-[#586e75] text-xs">In Progress</div>
            <div className="text-[#93a1a1] text-xl font-bold">5</div>
          </div>
          <div className="bg-[#073642] p-3 rounded border border-[#586e75]">
            <div className="text-[#586e75] text-xs">Pending</div>
            <div className="text-[#93a1a1] text-xl font-bold">1</div>
          </div>
        </div>
      </div>
    ),
    defaultExpanded: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with card-like content showing statistics.',
      },
    },
  },
};

// Starts expanded
export const StartExpanded: Story = {
  args: {
    microContent: (
      <div className="flex items-center justify-between h-24 px-4">
        <div className="text-[#93a1a1] font-bold">Already Expanded</div>
        <div className="text-[#586e75] text-sm">Click to collapse</div>
      </div>
    ),
    expandedContent: (
      <div className="p-4">
        <h3 className="text-[#93a1a1] font-bold text-lg mb-2">This tile starts expanded</h3>
        <p className="text-[#586e75]">
          Set defaultExpanded=true to start in the expanded state.
        </p>
      </div>
    ),
    defaultExpanded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tile that starts in the expanded state.',
      },
    },
  },
};

// Multiple tiles stacked
export const MultipleTilesStacked: Story = {
  render: () => (
    <div className="space-y-3 w-full">
      <ExpandableTile
        microContent={
          <div className="flex items-center gap-2 h-24 px-4">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <div className="text-[#93a1a1] font-bold">Energy Level</div>
              <div className="text-[#586e75] text-sm">75% · Rising</div>
            </div>
          </div>
        }
        expandedContent={
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">⚡</span>
              <div>
                <div className="text-[#93a1a1] font-bold text-lg">Energy Level</div>
                <div className="text-[#586e75] text-sm">Current status: High</div>
              </div>
            </div>
            <div className="bg-[#073642] p-3 rounded border border-[#268bd2]">
              <div className="text-[#586e75] text-xs mb-1">Trend</div>
              <div className="text-[#93a1a1] text-lg">📈 Rising steadily</div>
            </div>
          </div>
        }
      />

      <ExpandableTile
        microContent={
          <div className="flex items-center gap-2 h-24 px-4">
            <span className="text-2xl">🎯</span>
            <div className="flex-1">
              <div className="text-[#93a1a1] font-bold">Tasks Today</div>
              <div className="text-[#586e75] text-sm">8 completed · 3 remaining</div>
            </div>
          </div>
        }
        expandedContent={
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🎯</span>
              <div>
                <div className="text-[#93a1a1] font-bold text-lg">Tasks Today</div>
                <div className="text-[#586e75] text-sm">Making great progress!</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-[#073642] p-2 rounded border border-[#859900]">
                <div className="text-[#859900] text-sm">✓ Completed: 8 tasks</div>
              </div>
              <div className="bg-[#073642] p-2 rounded border border-[#b58900]">
                <div className="text-[#b58900] text-sm">⏳ Remaining: 3 tasks</div>
              </div>
            </div>
          </div>
        }
      />

      <ExpandableTile
        microContent={
          <div className="flex items-center gap-2 h-24 px-4">
            <span className="text-2xl">💙</span>
            <div className="flex-1">
              <div className="text-[#93a1a1] font-bold">Recovery Mode</div>
              <div className="text-[#586e75] text-sm">Take a break</div>
            </div>
          </div>
        }
        expandedContent={
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">💙</span>
              <div>
                <div className="text-[#93a1a1] font-bold text-lg">Recovery Mode</div>
                <div className="text-[#586e75] text-sm">Rebuild your energy</div>
              </div>
            </div>
            <div className="bg-[#073642] p-3 rounded border border-[#268bd2]">
              <div className="text-[#586e75] text-xs mb-2">💡 Recommendation</div>
              <p className="text-[#93a1a1] text-sm">
                Take a 5-minute break with deep breathing exercises.
              </p>
            </div>
          </div>
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple tiles stacked vertically. Click each one to see them expand and shift others smoothly.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 min-h-[600px] w-[400px]">
        <Story />
      </div>
    ),
  ],
};

// With callback
export const WithCallback: Story = {
  args: {
    microContent: (
      <div className="flex items-center justify-between h-24 px-4">
        <div className="text-[#93a1a1] font-bold">Interactive Tile</div>
        <div className="text-[#586e75] text-sm">Check the Actions panel</div>
      </div>
    ),
    expandedContent: (
      <div className="p-4">
        <h3 className="text-[#93a1a1] font-bold text-lg mb-2">Callback Example</h3>
        <p className="text-[#586e75]">
          When you expand/collapse this tile, check the Actions panel below to see the callback being fired.
        </p>
      </div>
    ),
    defaultExpanded: false,
    onExpandChange: (expanded: boolean) => {
      console.log('Tile expanded:', expanded);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing the onExpandChange callback. Watch the Actions panel when toggling.',
      },
    },
  },
};
