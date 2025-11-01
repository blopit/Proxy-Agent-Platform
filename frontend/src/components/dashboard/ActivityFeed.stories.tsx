import type { Meta, StoryObj } from '@storybook/nextjs';
import { ActivityFeed } from './ActivityFeed';

const meta: Meta<typeof ActivityFeed> = {
  title: 'Dashboard/ActivityFeed',
  component: ActivityFeed,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Activity feed showing recent user activities, achievements, and milestones.

**Features**:
- Real-time activity tracking
- Multiple activity types (task, focus, achievement, milestone)
- Agent attribution
- XP rewards display
- Relative timestamps (e.g., "2 minutes ago")
- Smooth animations with Framer Motion
- Scrollable feed with max height
- Glass morphism card design
- Color-coded activity types

**Activity Types**:
- **task** - Completed tasks (green)
- **focus** - Focus sessions (purple)
- **achievement** - Unlocked achievements (orange)
- **milestone** - Reached milestones (blue)

**Use Cases**:
- Dashboard sidebar
- User progress tracking
- Gamification feedback
- Agent activity monitoring`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

// ============================================================================
// Default
// ============================================================================

export const Default: Story = {};

export const WithScrolling: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The activity feed is scrollable when content exceeds max height (384px).',
      },
    },
  },
};
