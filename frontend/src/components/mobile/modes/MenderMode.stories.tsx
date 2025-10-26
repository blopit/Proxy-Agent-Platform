import type { Meta, StoryObj } from '@storybook/nextjs';
import MenderMode from './MenderMode';

const meta: Meta<typeof MenderMode> = {
  title: 'Components/Mobile/Modes/MenderMode',
  component: MenderMode,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component: `**Mender Mode** - Energy tracking and recovery

**Features**:
- **Circular EnergyGauge**: Visual energy level (0-100%)
- **5-Minute Recovery Tasks**: Low-effort actions for low energy
- **Mystery Box Rewards**: Every 3 sessions
- **Energy-Aware Suggestions**: Task recommendations based on current energy

**ADHD Optimizations**:
- Respects energy levels (no pushing through fatigue)
- Visual energy tracking prevents burnout
- Recovery tasks are always < 5 minutes
- Mystery rewards maintain engagement`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100%', backgroundColor: '#002b36' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MenderMode>;

export const Default: Story = {
  args: {},
};

export const HighEnergy: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'High energy level (> 70%) - suggests action tasks',
      },
    },
  },
};

export const LowEnergy: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Low energy level (< 30%) - suggests recovery tasks only',
      },
    },
  },
};

export const MysteryReward: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Mystery box reward unlocked after 3 recovery sessions',
      },
    },
  },
};
