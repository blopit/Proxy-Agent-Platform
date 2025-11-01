import type { Meta, StoryObj } from '@storybook/react';
import { StatsCard } from './StatsCard';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';

const meta: Meta<typeof StatsCard> = {
  title: 'Dashboard/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component for displaying statistics with icons and optional change indicators.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'The title of the statistic',
    },
    value: {
      control: 'text',
      description: 'The value to display',
    },
    icon: {
      control: false,
      description: 'The Lucide icon component to display',
    },
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple', 'orange'],
      description: 'The color theme for the card',
    },
    change: {
      control: 'text',
      description: 'Optional change indicator (e.g., "+12%")',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatsCard>;

export const Default: Story = {
  args: {
    title: 'Total Tasks',
    value: '24',
    icon: CheckCircle,
    color: 'blue',
  },
};

export const WithChange: Story = {
  args: {
    title: 'Completed Today',
    value: '8',
    icon: Target,
    color: 'green',
    change: '+25%',
  },
};

export const Purple: Story = {
  args: {
    title: 'In Progress',
    value: '12',
    icon: Clock,
    color: 'purple',
    change: '+5%',
  },
};

export const Orange: Story = {
  args: {
    title: 'Productivity Score',
    value: '87%',
    icon: TrendingUp,
    color: 'orange',
    change: '+12%',
  },
};

export const LargeValue: Story = {
  args: {
    title: 'Total Hours',
    value: '1,247',
    icon: Clock,
    color: 'blue',
    change: '+8%',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-4xl">
      <StatsCard
        title="Tasks Completed"
        value="24"
        icon={CheckCircle}
        color="blue"
        change="+12%"
      />
      <StatsCard
        title="In Progress"
        value="8"
        icon={Clock}
        color="green"
        change="+5%"
      />
      <StatsCard
        title="Productivity"
        value="87%"
        icon={TrendingUp}
        color="purple"
        change="+8%"
      />
      <StatsCard
        title="Goals Met"
        value="15"
        icon={Target}
        color="orange"
        change="+15%"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All color variants displayed together in a grid layout.',
      },
    },
  },
};
