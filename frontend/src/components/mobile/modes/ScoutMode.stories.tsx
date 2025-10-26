import type { Meta, StoryObj } from '@storybook/nextjs';
import ScoutMode from './ScoutMode';

const meta: Meta<typeof ScoutMode> = {
  title: 'Components/Mobile/Modes/ScoutMode',
  component: ScoutMode,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component: `**Scout Mode** - Discover & Organize tasks with category-based browsing

**Features**:
- **6 Smart Categories**: Main Focus, Urgent Today, Quick Wins, This Week, Can Delegate, Someday/Maybe
- **15% Mystery Task Bonus**: Unpredictable dopamine rewards
- **Netflix-style Scrolling**: Horizontal category rows
- **Dual Sub-modes**: Discover (browse) and Organize (inbox processing)
- **Filters**: All, Digital, Human, Urgent

**ADHD Optimizations**:
- Category-based organization reduces overwhelm
- Mystery tasks create dopamine uncertainty
- Quick Wins category for low-energy wins
- Visual categorization for pattern recognition`,
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
type Story = StoryObj<typeof ScoutMode>;

export const Default: Story = {
  args: {
    onTaskTap: (task) => console.log('Task tapped:', task),
    refreshTrigger: 0,
  },
};

export const DiscoverMode: Story = {
  args: {
    onTaskTap: (task) => console.log('Task tapped:', task),
    refreshTrigger: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Discover mode - browse tasks by category with Netflix-style scrolling',
      },
    },
  },
};

export const WithMysteryTask: Story = {
  args: {
    onTaskTap: (task) => console.log('Mystery task tapped:', task),
    refreshTrigger: 0,
  },
  parameters: {
    docs: {
      description: {
        story: '15% chance to show mystery task - unpredictable dopamine reward',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    onTaskTap: (task) => console.log('Task tapped:', task),
    refreshTrigger: Date.now(),
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while fetching tasks from API',
      },
    },
  },
};
