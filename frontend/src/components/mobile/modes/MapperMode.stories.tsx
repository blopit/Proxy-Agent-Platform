import type { Meta, StoryObj } from '@storybook/nextjs';
import MapperMode from './MapperMode';

const meta: Meta<typeof MapperMode> = {
  title: 'Mobile/Modes/MapperMode',
  component: MapperMode,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        component: `**Mapper Mode** - Progress overview and reflection

**Features**:
- **XP & Leveling System**: Gamified progress tracking
- **Streaks Display**: Maintain completion momentum
- **AchievementGallery**: Unlock badges and rewards
- **Weekly Reflection Prompts**: Memory consolidation
- **Category Breakdowns**: Pattern recognition

**ADHD Optimizations**:
- Gamification provides dopamine rewards
- Visual progress combats RSD (rejection sensitive dysphoria)
- Reflection prompts aid memory consolidation
- Pattern recognition builds self-awareness`,
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
type Story = StoryObj<typeof MapperMode>;

export const Default: Story = {
  args: {},
};

export const ProgressOverview: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Overview showing XP, level, and current progress',
      },
    },
  },
};

export const Achievements: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Achievement gallery with unlocked badges',
      },
    },
  },
};

export const WeeklyReflection: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Weekly reflection prompts for memory consolidation',
      },
    },
  },
};

export const LevelUp: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Level up celebration animation',
      },
    },
  },
};
