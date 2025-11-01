import type { Meta, StoryObj } from '@storybook/nextjs';
import SystemCard from './SystemCard';
import { TrendingUp, Users, DollarSign, Activity, Settings, Bell, Calendar, Star } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof SystemCard> = {
  title: 'System/SystemCard',
  component: SystemCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Design system card component for consistent content containers.

**Features**:
- 4 visual variants (default, elevated, outlined, ghost)
- 4 padding options (none, sm, base, lg)
- Optional header and footer sections
- Hoverable interaction state
- Flexible content composition
- Responsive design
- Full width support

**Variants**:
- **default** 📦 - Standard card with subtle background
- **elevated** 🎯 - Card with shadow for emphasis
- **outlined** 🔲 - Card with border, no background
- **ghost** 👻 - Transparent card, minimal styling

**Padding Options**:
- **none** - No padding (for custom layouts)
- **sm** - 8px padding (compact cards)
- **base** - 16px padding (default, most common)
- **lg** - 24px padding (spacious cards)

**Use Cases**:
- Dashboard stat cards
- Profile cards
- Content containers
- List items
- Settings panels`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'ghost'],
      description: 'Visual variant of the card',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'base', 'lg'],
      description: 'Padding size',
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover interaction with transform',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make card full width',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SystemCard>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Default Card
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Standard card with subtle background and no shadow.
        </p>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Elevated Card
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Card with shadow to create depth and emphasis.
        </p>
      </div>
    ),
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Outlined Card
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Card with border but no background for subtle containers.
        </p>
      </div>
    ),
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Ghost Card
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Minimal transparent card with subtle hover state.
        </p>
      </div>
    ),
  },
};

// ============================================================================
// Padding Variants
// ============================================================================

export const PaddingNone: Story = {
  args: {
    padding: 'none',
    children: (
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          No Padding
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Card with no padding - useful for custom layouts or full-bleed content.
        </p>
      </div>
    ),
  },
};

export const PaddingSmall: Story = {
  args: {
    padding: 'sm',
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Small Padding (8px)
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Compact card for tight spaces.
        </p>
      </div>
    ),
  },
};

export const PaddingBase: Story = {
  args: {
    padding: 'base',
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Base Padding (16px)
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Standard padding - the default and most common choice.
        </p>
      </div>
    ),
  },
};

export const PaddingLarge: Story = {
  args: {
    padding: 'lg',
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Large Padding (24px)
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Spacious card with extra breathing room.
        </p>
      </div>
    ),
  },
};

// ============================================================================
// With Header and Footer
// ============================================================================

export const WithHeader: Story = {
  args: {
    header: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} />
        <span style={{ fontWeight: '600', fontSize: '16px' }}>Activity</span>
      </div>
    ),
    children: (
      <div>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Your recent activity and updates will appear here.
        </p>
      </div>
    ),
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Confirmation Required
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Are you sure you want to proceed with this action?
        </p>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button style={{ padding: '8px 16px', border: '1px solid currentColor', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>
          Cancel
        </button>
        <button style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#268bd2', color: 'white', cursor: 'pointer' }}>
          Confirm
        </button>
      </div>
    ),
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    variant: 'elevated',
    header: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={20} />
        <span style={{ fontWeight: '600', fontSize: '16px' }}>Settings</span>
      </div>
    ),
    children: (
      <div>
        <p style={{ margin: 0, marginBottom: '12px', fontSize: '14px', opacity: 0.8 }}>
          Configure your account preferences and settings.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input type="checkbox" />
            Enable notifications
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input type="checkbox" />
            Dark mode
          </label>
        </div>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button style={{ padding: '8px 16px', border: '1px solid currentColor', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>
          Reset
        </button>
        <button style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#859900', color: 'white', cursor: 'pointer' }}>
          Save Changes
        </button>
      </div>
    ),
  },
};

// ============================================================================
// Interactive States
// ============================================================================

export const Hoverable: Story = {
  args: {
    hoverable: true,
    variant: 'elevated',
    children: (
      <div>
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
          Hoverable Card
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Hover over this card to see the interaction effect.
        </p>
      </div>
    ),
  },
};

export const ClickableCard: Story = {
  render: () => {
    const [clicked, setClicked] = React.useState(false);
    return (
      <SystemCard
        hoverable
        variant="elevated"
        onClick={() => setClicked(!clicked)}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
            {clicked ? 'Clicked!' : 'Click Me'}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
            {clicked ? 'You clicked this card!' : 'This card is clickable. Try clicking it!'}
          </p>
        </div>
      </SystemCard>
    );
  },
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const StatCard: Story = {
  render: () => (
    <SystemCard variant="elevated" hoverable>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
            Total Revenue
          </p>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
            $45,231
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#859900', fontSize: '14px' }}>
            <TrendingUp size={16} />
            <span>+12.5%</span>
            <span style={{ opacity: 0.7, marginLeft: '4px' }}>from last month</span>
          </div>
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(38, 139, 210, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#268bd2' }}>
          <DollarSign size={24} />
        </div>
      </div>
    </SystemCard>
  ),
};

export const ProfileCard: Story = {
  render: () => (
    <SystemCard variant="elevated" style={{ maxWidth: '300px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #268bd2, #6c71c4)', margin: '0 auto 16px' }} />
        <h3 style={{ margin: 0, marginBottom: '4px', fontSize: '20px', fontWeight: '600' }}>
          Sarah Johnson
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.7, marginBottom: '16px' }}>
          Product Designer
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>127</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Projects</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>2.4k</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Followers</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>365</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Following</div>
          </div>
        </div>
        <button style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '8px', background: '#268bd2', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
          Follow
        </button>
      </div>
    </SystemCard>
  ),
};

export const ContentCard: Story = {
  render: () => (
    <SystemCard variant="elevated" hoverable style={{ maxWidth: '400px' }}>
      <div>
        <div style={{ width: '100%', height: '200px', background: 'linear-gradient(135deg, #268bd2, #2aa198)', borderRadius: '8px', marginBottom: '16px' }} />
        <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '20px', fontWeight: '600' }}>
          Getting Started with React
        </h3>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, marginBottom: '16px', lineHeight: '1.5' }}>
          Learn the fundamentals of React and start building modern web applications with this comprehensive guide.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #268bd2, #6c71c4)' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>John Doe</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>2 days ago</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(38, 139, 210, 0.15)', color: '#268bd2', fontSize: '12px', fontWeight: '600' }}>
              React
            </span>
            <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(42, 161, 152, 0.15)', color: '#2aa198', fontSize: '12px', fontWeight: '600' }}>
              Tutorial
            </span>
          </div>
        </div>
      </div>
    </SystemCard>
  ),
};

export const NotificationCard: Story = {
  render: () => (
    <SystemCard variant="outlined" hoverable style={{ maxWidth: '400px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(38, 139, 210, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#268bd2', flexShrink: 0 }}>
          <Bell size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, marginBottom: '4px', fontSize: '16px', fontWeight: '600' }}>
            New Update Available
          </h4>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>
            Version 2.0.0 is now available with exciting new features and improvements.
          </p>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            5 minutes ago
          </div>
        </div>
      </div>
    </SystemCard>
  ),
};

export const EventCard: Story = {
  render: () => (
    <SystemCard variant="elevated" hoverable style={{ maxWidth: '350px' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ width: '60px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc322f', marginBottom: '4px' }}>
            DEC
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', lineHeight: '1' }}>
            24
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>
            Holiday Team Celebration
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '14px', opacity: 0.8 }}>
            <Calendar size={16} />
            <span>6:00 PM - 9:00 PM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '14px', opacity: 0.8 }}>
            <Users size={16} />
            <span>32 attending</span>
          </div>
          <button style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', background: '#268bd2', color: 'white', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
            RSVP
          </button>
        </div>
      </div>
    </SystemCard>
  ),
};

// ============================================================================
// All Variants Together
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <SystemCard variant="default">
        <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
          Default
        </h4>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Standard card variant
        </p>
      </SystemCard>
      <SystemCard variant="elevated">
        <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
          Elevated
        </h4>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Card with shadow
        </p>
      </SystemCard>
      <SystemCard variant="outlined">
        <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
          Outlined
        </h4>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Card with border
        </p>
      </SystemCard>
      <SystemCard variant="ghost">
        <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
          Ghost
        </h4>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
          Minimal transparent card
        </p>
      </SystemCard>
    </div>
  ),
};

export const AllPaddings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <SystemCard variant="outlined" padding="none">
        <div style={{ padding: '16px' }}>
          <strong>None:</strong> No padding (custom layout)
        </div>
      </SystemCard>
      <SystemCard variant="outlined" padding="sm">
        <strong>Small (8px):</strong> Compact padding
      </SystemCard>
      <SystemCard variant="outlined" padding="base">
        <strong>Base (16px):</strong> Standard padding
      </SystemCard>
      <SystemCard variant="outlined" padding="lg">
        <strong>Large (24px):</strong> Spacious padding
      </SystemCard>
    </div>
  ),
};

// ============================================================================
// Dashboard Layout Example
// ============================================================================

export const DashboardGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <SystemCard variant="elevated" hoverable>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
              Total Users
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
              2,543
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#859900', fontSize: '14px' }}>
              <TrendingUp size={16} />
              <span>+18.2%</span>
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(38, 139, 210, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#268bd2' }}>
            <Users size={24} />
          </div>
        </div>
      </SystemCard>

      <SystemCard variant="elevated" hoverable>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
              Active Now
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
              573
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#2aa198', fontSize: '14px' }}>
              <Activity size={16} />
              <span>+7.3%</span>
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(42, 161, 152, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2aa198' }}>
            <Activity size={24} />
          </div>
        </div>
      </SystemCard>

      <SystemCard variant="elevated" hoverable>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.7, marginBottom: '4px' }}>
              Rating
            </p>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
              4.8
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#b58900', fontSize: '14px' }}>
              <Star size={16} />
              <span>+0.3</span>
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(181, 137, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b58900' }}>
            <Star size={24} />
          </div>
        </div>
      </SystemCard>
    </div>
  ),
};
