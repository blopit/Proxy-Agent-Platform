import type { Meta, StoryObj } from '@storybook/nextjs';
import { ActivityFeed } from './ActivityFeed';
import { ProductivityChart } from './ProductivityChart';
import { AgentCard } from './AgentCard';
import { StatsCard } from './StatsCard';
import { Brain, Target, Zap, Calendar, TrendingUp, Heart, CheckCircle, Clock, Award, Flame } from 'lucide-react';
import React from 'react';

const meta: Meta = {
  title: 'Dashboard/Complete Dashboard Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Complete dashboard layout showcasing all dashboard components working together.

**Components Included**:
- **StatsCard** - KPI metrics (4 cards)
- **AgentCard** - AI agent status (6 cards)
- **ProductivityChart** - Weekly trends
- **ActivityFeed** - Recent activities

**Layout**:
- Responsive grid layout
- Stats cards at top (4-column grid)
- Agent cards in middle (3-column grid)
- Chart and activity feed side-by-side
- Adapts to mobile/tablet/desktop

**Features**:
- Glass morphism design
- Smooth animations
- Consistent spacing
- Color-coded elements
- Real-time data visualization`,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ============================================================================
// Complete Dashboard
// ============================================================================

export const CompleteDashboard: Story = {
  render: () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #002b36 0%, #073642 100%)',
      padding: '32px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#93a1a1' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '16px', color: '#657b83' }}>
            Track your productivity, manage AI agents, and monitor your progress
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <StatsCard
            title="Tasks Completed"
            value="47"
            change="+12%"
            trend="up"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Focus Hours"
            value="24.5"
            change="+8%"
            trend="up"
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Streak Days"
            value="12"
            change="+3"
            trend="up"
            icon={Flame}
            color="orange"
          />
          <StatsCard
            title="XP Earned"
            value="2,340"
            change="+15%"
            trend="up"
            icon={Award}
            color="purple"
          />
        </div>

        {/* Agent Cards Grid */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px', color: '#93a1a1' }}>
            AI Agents
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}>
            <AgentCard
              id="1"
              name="Task Agent"
              description="Analyzes and suggests optimal task sequences based on your energy and time"
              icon={Target}
              status="active"
              lastAction="Suggested 3 tasks for afternoon deep work"
              color="blue"
            />
            <AgentCard
              id="2"
              name="Focus Agent"
              description="Helps you maintain deep focus and avoid distractions"
              icon={Zap}
              status="idle"
              lastAction="Waiting for next focus session"
              color="purple"
            />
            <AgentCard
              id="3"
              name="Progress Agent"
              description="Tracks your achievements and celebrates wins"
              icon={TrendingUp}
              status="busy"
              lastAction="Calculating weekly progress metrics"
              color="green"
            />
            <AgentCard
              id="4"
              name="Calendar Agent"
              description="Optimizes scheduling and time blocking"
              icon={Calendar}
              status="active"
              lastAction="Blocked focus time for tomorrow morning"
              color="orange"
            />
            <AgentCard
              id="5"
              name="Intelligence Agent"
              description="Provides insights and recommendations based on your patterns"
              icon={Brain}
              status="active"
              lastAction="Identified productivity peak hours"
              color="blue"
            />
            <AgentCard
              id="6"
              name="Energy Agent"
              description="Monitors energy levels and suggests optimal work timing"
              icon={Heart}
              status="idle"
              lastAction="Recommended break after 2 hours"
              color="orange"
            />
          </div>
        </div>

        {/* Chart and Activity Feed */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <ProductivityChart />
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Mobile Layout
// ============================================================================

export const MobileLayout: Story = {
  render: () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #002b36 0%, #073642 100%)',
      padding: '16px',
      maxWidth: '414px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px', color: '#93a1a1' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#657b83' }}>
          Your productivity overview
        </p>
      </div>

      {/* Stats Cards - 2 column on mobile */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatsCard
          title="Tasks"
          value="47"
          change="+12%"
          trend="up"
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Focus"
          value="24.5h"
          change="+8%"
          trend="up"
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Streak"
          value="12"
          change="+3"
          trend="up"
          icon={Flame}
          color="orange"
        />
        <StatsCard
          title="XP"
          value="2.3k"
          change="+15%"
          trend="up"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Productivity Chart */}
      <div style={{ marginBottom: '24px' }}>
        <ProductivityChart />
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// ============================================================================
// Tablet Layout
// ============================================================================

export const TabletLayout: Story = {
  render: () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #002b36 0%, #073642 100%)',
      padding: '24px',
      maxWidth: '768px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '6px', color: '#93a1a1' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '15px', color: '#657b83' }}>
          Track your productivity and manage AI agents
        </p>
      </div>

      {/* Stats Cards - 2 column on tablet */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <StatsCard
          title="Tasks Completed"
          value="47"
          change="+12%"
          trend="up"
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Focus Hours"
          value="24.5"
          change="+8%"
          trend="up"
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Streak Days"
          value="12"
          change="+3"
          trend="up"
          icon={Flame}
          color="orange"
        />
        <StatsCard
          title="XP Earned"
          value="2,340"
          change="+15%"
          trend="up"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Chart */}
      <div style={{ marginBottom: '28px' }}>
        <ProductivityChart />
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

// ============================================================================
// Dark Mode Focus
// ============================================================================

export const DarkModeFocus: Story = {
  render: () => (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      padding: '32px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
            Dashboard - Dark Mode
          </h1>
          <p style={{ fontSize: '16px', color: '#888' }}>
            Pure dark mode with maximum contrast
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <StatsCard
            title="Tasks Completed"
            value="47"
            change="+12%"
            trend="up"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Focus Hours"
            value="24.5"
            change="+8%"
            trend="up"
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Streak Days"
            value="12"
            change="+3"
            trend="up"
            icon={Flame}
            color="orange"
          />
          <StatsCard
            title="XP Earned"
            value="2,340"
            change="+15%"
            trend="up"
            icon={Award}
            color="purple"
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <ProductivityChart />
          </div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Minimal Layout
// ============================================================================

export const MinimalLayout: Story = {
  render: () => (
    <div style={{
      minHeight: '100vh',
      background: '#fdf6e3',
      padding: '40px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '40px', fontWeight: '300', marginBottom: '12px', color: '#586e75' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '18px', color: '#93a1a1' }}>
            Simple and focused
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          marginBottom: '40px',
        }}>
          <StatsCard
            title="Tasks"
            value="47"
            change="+12%"
            trend="up"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Focus"
            value="24.5"
            change="+8%"
            trend="up"
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="Streak"
            value="12"
            change="+3"
            trend="up"
            icon={Flame}
            color="orange"
          />
          <StatsCard
            title="XP"
            value="2.3k"
            change="+15%"
            trend="up"
            icon={Award}
            color="purple"
          />
        </div>

        <ProductivityChart />
      </div>
    </div>
  ),
};
