import type { Meta, StoryObj } from '@storybook/nextjs';
import HunterMode from './HunterMode';

const meta: Meta<typeof HunterMode> = {
  title: 'Mobile/Modes/HunterMode',
  component: HunterMode,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component: `**Hunter Mode** - Single-task focus with swipeable cards

**Features**:
- **One Task at a Time**: Full-screen focus to reduce overwhelm
- **Swipe Gestures**: Left = dismiss, Right = do/delegate
- **Streak Tracking**: Maintain momentum with completion streaks
- **Progress Bar**: Visual completion percentage
- **CardStack UX**: Tinder-style task cards

**ADHD Optimizations**:
- Single-task focus eliminates decision paralysis
- Swipe gestures enable quick decisions (< 2 seconds)
- Streak tracking provides dopamine motivation
- Large touch targets (mobile-optimized)`,
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
type Story = StoryObj<typeof HunterMode>;

export const Default: Story = {
  args: {},
};

export const SingleTask: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Single task card in full-screen view with swipe gestures',
      },
    },
  },
};

export const StreakActive: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Active streak displayed at top - motivates continued completion',
      },
    },
  },
};
