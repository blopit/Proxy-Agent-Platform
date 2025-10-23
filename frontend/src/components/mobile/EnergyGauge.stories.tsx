import type { Meta, StoryObj } from '@storybook/react';
import EnergyGauge from './EnergyGauge';
import React from 'react';

const meta: Meta<typeof EnergyGauge> = {
  title: 'Components/Mobile/EnergyGauge',
  component: EnergyGauge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Energy level visualization component with two display modes.

Features:
- **Micro variant**: Compact horizontal layout (96px height)
- **Expanded variant**: Full circular gauge with detailed info
- Smooth color transitions based on energy level
- Trend indicators (rising, falling, stable)
- AI-powered predictions
- Animated gauge with glow effects`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-6 min-h-[400px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    energy: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current energy level (0-100)',
    },
    trend: {
      control: 'select',
      options: ['rising', 'falling', 'stable'],
      description: 'Energy trend indicator',
    },
    predictedNextHour: {
      control: { type: 'number', min: 0, max: 100, step: 1 },
      description: 'Predicted energy level in 1 hour',
    },
    variant: {
      control: 'radio',
      options: ['micro', 'expanded'],
      description: 'Display variant',
    },
  },
};

export default meta;
type Story = StoryObj<typeof EnergyGauge>;

// Expanded variant examples
export const HighEnergy: Story = {
  args: {
    energy: 85,
    trend: 'stable',
    predictedNextHour: 82,
    variant: 'expanded',
  },
  parameters: {
    docs: {
      description: {
        story: 'High energy level (70+) with green color and encouraging message.',
      },
    },
  },
};

export const MediumEnergy: Story = {
  args: {
    energy: 55,
    trend: 'falling',
    predictedNextHour: 48,
    variant: 'expanded',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium energy level (40-69) with yellow color and moderate activity suggestions.',
      },
    },
  },
};

export const LowEnergy: Story = {
  args: {
    energy: 25,
    trend: 'rising',
    predictedNextHour: 35,
    variant: 'expanded',
  },
  parameters: {
    docs: {
      description: {
        story: 'Low energy level (<40) with red color and recovery recommendations.',
      },
    },
  },
};

export const CriticalEnergy: Story = {
  args: {
    energy: 5,
    trend: 'falling',
    predictedNextHour: 3,
    variant: 'expanded',
  },
  parameters: {
    docs: {
      description: {
        story: 'Critical energy level - urgent recovery needed.',
      },
    },
  },
};

export const PerfectEnergy: Story = {
  args: {
    energy: 100,
    trend: 'rising',
    predictedNextHour: 98,
    variant: 'expanded',
  },
  parameters: {
    docs: {
      description: {
        story: 'Maximum energy level - perfect for challenging tasks.',
      },
    },
  },
};

// Micro variant examples
export const MicroHighEnergy: Story = {
  args: {
    energy: 85,
    trend: 'rising',
    predictedNextHour: 90,
    variant: 'micro',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact micro variant with high energy.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 w-[400px] h-[120px]">
        <Story />
      </div>
    ),
  ],
};

export const MicroMediumEnergy: Story = {
  args: {
    energy: 55,
    trend: 'stable',
    predictedNextHour: 54,
    variant: 'micro',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact micro variant with medium energy.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 w-[400px] h-[120px]">
        <Story />
      </div>
    ),
  ],
};

export const MicroLowEnergy: Story = {
  args: {
    energy: 25,
    trend: 'falling',
    predictedNextHour: 18,
    variant: 'micro',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact micro variant with low energy.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 w-[400px] h-[120px]">
        <Story />
      </div>
    ),
  ],
};

export const MicroNoPrediction: Story = {
  args: {
    energy: 65,
    trend: 'stable',
    variant: 'micro',
  },
  parameters: {
    docs: {
      description: {
        story: 'Micro variant without prediction data.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 w-[400px] h-[120px]">
        <Story />
      </div>
    ),
  ],
};

// Trend comparisons
export const TrendComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-[#93a1a1] text-sm mb-2">📈 Rising Trend</h3>
        <div className="bg-[#073642] rounded-lg border border-[#586e75] h-24">
          <EnergyGauge
            energy={60}
            trend="rising"
            predictedNextHour={68}
            variant="micro"
          />
        </div>
      </div>

      <div>
        <h3 className="text-[#93a1a1] text-sm mb-2">➡️ Stable Trend</h3>
        <div className="bg-[#073642] rounded-lg border border-[#586e75] h-24">
          <EnergyGauge
            energy={60}
            trend="stable"
            predictedNextHour={61}
            variant="micro"
          />
        </div>
      </div>

      <div>
        <h3 className="text-[#93a1a1] text-sm mb-2">📉 Falling Trend</h3>
        <div className="bg-[#073642] rounded-lg border border-[#586e75] h-24">
          <EnergyGauge
            energy={60}
            trend="falling"
            predictedNextHour={52}
            variant="micro"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all three trend indicators at the same energy level.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 w-[400px]">
        <Story />
      </div>
    ),
  ],
};

// Energy level spectrum
export const EnergySpectrum: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {[100, 85, 70, 55, 40, 25, 10, 0].map((level) => (
        <div key={level} className="bg-[#073642] p-3 rounded-lg border border-[#586e75]">
          <div className="text-[#586e75] text-xs mb-2 text-center">
            Energy: {level}%
          </div>
          <EnergyGauge
            energy={level}
            trend="stable"
            variant="micro"
          />
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full spectrum of energy levels showing color transitions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-4 w-[600px]">
        <Story />
      </div>
    ),
  ],
};

// Side by side comparison
export const VariantComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-[#93a1a1] text-lg mb-3">Micro Variant</h3>
        <div className="bg-[#073642] rounded-lg border border-[#586e75]">
          <EnergyGauge
            energy={75}
            trend="rising"
            predictedNextHour={80}
            variant="micro"
          />
        </div>
        <p className="text-[#586e75] text-xs mt-2">
          Compact horizontal layout, perfect for collapsed tiles
        </p>
      </div>

      <div>
        <h3 className="text-[#93a1a1] text-lg mb-3">Expanded Variant</h3>
        <div className="bg-[#073642] rounded-lg border border-[#586e75] p-4">
          <EnergyGauge
            energy={75}
            trend="rising"
            predictedNextHour={80}
            variant="expanded"
          />
        </div>
        <p className="text-[#586e75] text-xs mt-2">
          Full display with circular gauge, trend card, prediction, and AI recommendations
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of both variants with the same energy data.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-[#002b36] p-6 w-[500px]">
        <Story />
      </div>
    ),
  ],
};

// Interactive playground
export const InteractivePlayground: Story = {
  args: {
    energy: 65,
    trend: 'stable',
    predictedNextHour: 63,
    variant: 'expanded',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use the controls panel to adjust all parameters and see real-time updates.',
      },
    },
  },
};
