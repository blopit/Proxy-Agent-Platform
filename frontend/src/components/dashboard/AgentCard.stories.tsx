import type { Meta, StoryObj } from '@storybook/nextjs';
import { AgentCard } from './AgentCard';
import { Brain, Target, Zap, Calendar, TrendingUp, Heart } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof AgentCard> = {
  title: 'Dashboard/AgentCard',
  component: AgentCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Agent card showing AI agent status, description, and recent activity.

**Features**:
- Glass morphism card design
- Gradient icon backgrounds (blue, green, purple, orange)
- Status indicator with dot (active, idle, busy)
- Last action display
- Hover animation (scale + lift effect)
- Hover overlay effect
- Responsive layout

**Status Types**:
- **active** (green) - Agent is currently working
- **idle** (gray) - Agent is waiting for tasks
- **busy** (orange) - Agent is processing

**Color Themes**:
- **blue** - Primary agents
- **green** - Success/completion agents
- **purple** - Focus/deep work agents
- **orange** - Energy/motivation agents

**Use Cases**:
- Dashboard agent overview
- Agent status monitoring
- Agent grid/list layouts`,
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description: 'Agent name',
    },
    description: {
      control: 'text',
      description: 'Agent description',
    },
    status: {
      control: 'select',
      options: ['active', 'idle', 'busy'],
      description: 'Agent status',
    },
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple', 'orange'],
      description: 'Color theme',
    },
    lastAction: {
      control: 'text',
      description: 'Last action performed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AgentCard>;

// ============================================================================
// Status Variants
// ============================================================================

export const ActiveAgent: Story = {
  args: {
    id: '1',
    name: 'Task Agent',
    description: 'Analyzes and suggests optimal task sequences based on your energy and time',
    icon: Target,
    status: 'active',
    lastAction: 'Suggested 3 tasks for your afternoon deep work session',
    color: 'blue',
  },
};

export const IdleAgent: Story = {
  args: {
    id: '2',
    name: 'Focus Agent',
    description: 'Helps you maintain deep focus and avoid distractions',
    icon: Zap,
    status: 'idle',
    lastAction: 'Waiting for next focus session',
    color: 'purple',
  },
};

export const BusyAgent: Story = {
  args: {
    id: '3',
    name: 'Progress Agent',
    description: 'Tracks your achievements and celebrates wins',
    icon: TrendingUp,
    status: 'busy',
    lastAction: 'Calculating weekly progress metrics',
    color: 'green',
  },
};

// ============================================================================
// Color Variants
// ============================================================================

export const BlueTheme: Story = {
  args: {
    id: '4',
    name: 'Intelligence Agent',
    description: 'Provides insights and recommendations based on your patterns',
    icon: Brain,
    status: 'active',
    lastAction: 'Identified productivity peak hours',
    color: 'blue',
  },
};

export const GreenTheme: Story = {
  args: {
    id: '5',
    name: 'Completion Agent',
    description: 'Celebrates task completions and tracks achievements',
    icon: Target,
    status: 'active',
    lastAction: 'Awarded 50 XP for task completion',
    color: 'green',
  },
};

export const PurpleTheme: Story = {
  args: {
    id: '6',
    name: 'Deep Work Agent',
    description: 'Optimizes your schedule for focused, uninterrupted work',
    icon: Zap,
    status: 'active',
    lastAction: 'Blocked 90-minute focus session',
    color: 'purple',
  },
};

export const OrangeTheme: Story = {
  args: {
    id: '7',
    name: 'Energy Agent',
    description: 'Monitors energy levels and suggests optimal work timing',
    icon: Heart,
    status: 'active',
    lastAction: 'Recommended break after 2 hours of work',
    color: 'orange',
  },
};

// ============================================================================
// Agent Grid Example
// ============================================================================

export const AgentGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px' }}>
      <AgentCard
        id="1"
        name="Task Agent"
        description="Analyzes and suggests optimal task sequences"
        icon={Target}
        status="active"
        lastAction="Suggested 3 tasks for afternoon"
        color="blue"
      />
      <AgentCard
        id="2"
        name="Focus Agent"
        description="Helps maintain deep focus and avoid distractions"
        icon={Zap}
        status="idle"
        lastAction="Waiting for next focus session"
        color="purple"
      />
      <AgentCard
        id="3"
        name="Progress Agent"
        description="Tracks achievements and celebrates wins"
        icon={TrendingUp}
        status="busy"
        lastAction="Calculating weekly metrics"
        color="green"
      />
      <AgentCard
        id="4"
        name="Calendar Agent"
        description="Optimizes scheduling and time blocking"
        icon={Calendar}
        status="active"
        lastAction="Blocked focus time for tomorrow"
        color="orange"
      />
      <AgentCard
        id="5"
        name="Intelligence Agent"
        description="Provides insights based on your patterns"
        icon={Brain}
        status="active"
        lastAction="Identified productivity peaks"
        color="blue"
      />
      <AgentCard
        id="6"
        name="Energy Agent"
        description="Monitors energy and suggests work timing"
        icon={Heart}
        status="idle"
        lastAction="Recommended break time"
        color="orange"
      />
    </div>
  ),
};

// ============================================================================
// Different Icons
// ============================================================================

export const WithDifferentIcons: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '900px' }}>
      <AgentCard
        id="brain"
        name="Intelligence Agent"
        description="AI-powered insights and recommendations"
        icon={Brain}
        status="active"
        lastAction="Analyzed 30-day productivity trends"
        color="blue"
      />
      <AgentCard
        id="target"
        name="Task Agent"
        description="Smart task prioritization and sequencing"
        icon={Target}
        status="active"
        lastAction="Prioritized 12 tasks by importance"
        color="green"
      />
      <AgentCard
        id="zap"
        name="Focus Agent"
        description="Deep work optimization specialist"
        icon={Zap}
        status="busy"
        lastAction="Blocking distractions for focus session"
        color="purple"
      />
    </div>
  ),
};
