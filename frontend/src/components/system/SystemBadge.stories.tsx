import type { Meta, StoryObj } from '@storybook/nextjs';
import SystemBadge from './SystemBadge';
import { Check, X, AlertCircle, Info, TrendingUp, Star, Zap, Clock, Users } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof SystemBadge> = {
  title: 'System/SystemBadge',
  component: SystemBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Design system badge component for labels, status indicators, and tags.

**Features**:
- 6 semantic variants (primary, secondary, success, warning, error, info)
- 3 sizes (sm, base, lg)
- Optional icon support
- Optional status dot
- Semi-transparent backgrounds with colored borders
- Rounded pill shape
- Consistent with design system tokens

**Variants**:
- **primary** 🔵 - Blue badge (main tags, featured items)
- **secondary** 🟦 - Gray badge (neutral tags, categories)
- **success** 🟢 - Green badge (completed, success states)
- **warning** 🟡 - Yellow badge (pending, caution)
- **error** 🔴 - Red badge (errors, failures, urgent)
- **info** 🔷 - Cyan badge (information, tips)

**Sizes**:
- **sm** - 20px height (compact spaces, dense lists)
- **base** - 24px height (default, most common)
- **lg** - 32px height (emphasis, prominent display)

**Use Cases**:
- Status indicators
- Category tags
- Count badges
- Feature flags
- Priority labels
- User roles`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'info'],
      description: 'Visual variant of the badge',
    },
    size: {
      control: 'radio',
      options: ['sm', 'base', 'lg'],
      description: 'Badge size',
    },
    dot: {
      control: 'boolean',
      description: 'Show status dot indicator',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SystemBadge>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
};

export const InfoVariant: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
    variant: 'primary',
  },
};

export const Base: Story = {
  args: {
    children: 'Base',
    size: 'base',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
    variant: 'primary',
  },
};

// ============================================================================
// With Icons
// ============================================================================

export const WithIconLeft: Story = {
  args: {
    children: 'Verified',
    icon: <Check size={14} />,
    variant: 'success',
  },
};

export const WithIconRight: Story = {
  render: () => (
    <SystemBadge variant="error">
      Rejected
      <X size={14} />
    </SystemBadge>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <SystemBadge variant="info" aria-label="Information">
      <Info size={16} />
    </SystemBadge>
  ),
};

// ============================================================================
// With Status Dot
// ============================================================================

export const WithDot: Story = {
  args: {
    children: 'Online',
    dot: true,
    variant: 'success',
  },
};

export const DotPrimary: Story = {
  args: {
    children: 'Active',
    dot: true,
    variant: 'primary',
  },
};

export const DotWarning: Story = {
  args: {
    children: 'Pending',
    dot: true,
    variant: 'warning',
  },
};

export const DotError: Story = {
  args: {
    children: 'Offline',
    dot: true,
    variant: 'error',
  },
};

// ============================================================================
// Status Indicators
// ============================================================================

export const StatusComplete: Story = {
  render: () => (
    <SystemBadge variant="success" icon={<Check size={14} />}>
      Complete
    </SystemBadge>
  ),
};

export const StatusInProgress: Story = {
  render: () => (
    <SystemBadge variant="primary" dot>
      In Progress
    </SystemBadge>
  ),
};

export const StatusPending: Story = {
  render: () => (
    <SystemBadge variant="warning" icon={<Clock size={14} />}>
      Pending
    </SystemBadge>
  ),
};

export const StatusFailed: Story = {
  render: () => (
    <SystemBadge variant="error" icon={<X size={14} />}>
      Failed
    </SystemBadge>
  ),
};

// ============================================================================
// All Variants Together
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <SystemBadge variant="primary">Primary</SystemBadge>
      <SystemBadge variant="secondary">Secondary</SystemBadge>
      <SystemBadge variant="success">Success</SystemBadge>
      <SystemBadge variant="warning">Warning</SystemBadge>
      <SystemBadge variant="error">Error</SystemBadge>
      <SystemBadge variant="info">Info</SystemBadge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <SystemBadge size="sm" variant="primary">Small</SystemBadge>
      <SystemBadge size="base" variant="primary">Base</SystemBadge>
      <SystemBadge size="lg" variant="primary">Large</SystemBadge>
    </div>
  ),
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const PriorityLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SystemBadge variant="error" size="sm" icon={<AlertCircle size={12} />}>
          Critical
        </SystemBadge>
        <span style={{ fontSize: '14px' }}>System down</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SystemBadge variant="warning" size="sm" icon={<TrendingUp size={12} />}>
          High
        </SystemBadge>
        <span style={{ fontSize: '14px' }}>Performance issue</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SystemBadge variant="primary" size="sm">
          Medium
        </SystemBadge>
        <span style={{ fontSize: '14px' }}>Feature request</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <SystemBadge variant="secondary" size="sm">
          Low
        </SystemBadge>
        <span style={{ fontSize: '14px' }}>Documentation update</span>
      </div>
    </div>
  ),
};

export const CategoryTags: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '400px' }}>
      <SystemBadge variant="primary">React</SystemBadge>
      <SystemBadge variant="primary">TypeScript</SystemBadge>
      <SystemBadge variant="info">Next.js</SystemBadge>
      <SystemBadge variant="success">Storybook</SystemBadge>
      <SystemBadge variant="secondary">Frontend</SystemBadge>
      <SystemBadge variant="secondary">UI/UX</SystemBadge>
      <SystemBadge variant="warning">Beta</SystemBadge>
    </div>
  ),
};

export const UserRoles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #dc322f, #d33682)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Alice Admin</div>
          <SystemBadge variant="error" size="sm" icon={<Star size={12} />}>
            Admin
          </SystemBadge>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #268bd2, #6c71c4)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Bob Developer</div>
          <SystemBadge variant="primary" size="sm">
            Developer
          </SystemBadge>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #859900, #2aa198)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Carol Designer</div>
          <SystemBadge variant="success" size="sm">
            Designer
          </SystemBadge>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #586e75, #657b83)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Dan Guest</div>
          <SystemBadge variant="secondary" size="sm">
            Viewer
          </SystemBadge>
        </div>
      </div>
    </div>
  ),
};

export const NotificationBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(38, 139, 210, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Info size={20} />
        </div>
        <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
          <SystemBadge variant="error" size="sm">
            3
          </SystemBadge>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(38, 139, 210, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={20} />
        </div>
        <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
          <SystemBadge variant="primary" size="sm">
            12
          </SystemBadge>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(38, 139, 210, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={20} />
        </div>
        <div style={{ position: 'absolute', top: '-6px', right: '-6px' }}>
          <SystemBadge variant="warning" size="sm">
            5
          </SystemBadge>
        </div>
      </div>
    </div>
  ),
};

export const FeatureFlags: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' }}>
      <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Dark Mode</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Enable dark theme</div>
        </div>
        <SystemBadge variant="success" icon={<Check size={14} />}>
          Enabled
        </SystemBadge>
      </div>
      <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Beta Features</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Access experimental features</div>
        </div>
        <SystemBadge variant="warning">
          Beta
        </SystemBadge>
      </div>
      <div style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Analytics</div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Track user behavior</div>
        </div>
        <SystemBadge variant="error" icon={<X size={14} />}>
          Disabled
        </SystemBadge>
      </div>
    </div>
  ),
};

export const StatusTimeline: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '350px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#859900' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600' }}>Order Shipped</span>
            <SystemBadge variant="success" size="sm" icon={<Check size={12} />}>
              Complete
            </SystemBadge>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>2 hours ago</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#268bd2', animation: 'pulse 2s infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600' }}>Out for Delivery</span>
            <SystemBadge variant="primary" size="sm" dot>
              In Progress
            </SystemBadge>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>Estimated: 2:00 PM</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600', opacity: 0.5 }}>Delivered</span>
            <SystemBadge variant="secondary" size="sm">
              Pending
            </SystemBadge>
          </div>
          <div style={{ fontSize: '12px', opacity: 0.5 }}>Not yet</div>
        </div>
      </div>
    </div>
  ),
};

export const TaskLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '400px' }}>
      <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, fontWeight: '600' }}>Implement user authentication</h4>
          <SystemBadge variant="error" size="sm">
            High
          </SystemBadge>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <SystemBadge variant="primary" size="sm">Frontend</SystemBadge>
          <SystemBadge variant="info" size="sm">Security</SystemBadge>
          <SystemBadge variant="warning" size="sm" icon={<Clock size={12} />}>
            3 days
          </SystemBadge>
        </div>
      </div>
      <div style={{ padding: '16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ margin: 0, fontWeight: '600' }}>Update documentation</h4>
          <SystemBadge variant="secondary" size="sm">
            Low
          </SystemBadge>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <SystemBadge variant="secondary" size="sm">Docs</SystemBadge>
          <SystemBadge variant="success" size="sm" icon={<Check size={12} />}>
            Ready
          </SystemBadge>
          <SystemBadge variant="info" size="sm" icon={<Clock size={12} />}>
            1 day
          </SystemBadge>
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive Example
// ============================================================================

export const InteractiveStatusToggle: Story = {
  render: () => {
    const [status, setStatus] = React.useState<'online' | 'away' | 'offline'>('online');

    const statusConfig = {
      online: { variant: 'success' as const, label: 'Online', icon: <Check size={14} /> },
      away: { variant: 'warning' as const, label: 'Away', icon: <Clock size={14} /> },
      offline: { variant: 'error' as const, label: 'Offline', icon: <X size={14} /> },
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #268bd2, #6c71c4)' }} />
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>User Status</div>
            <SystemBadge
              variant={statusConfig[status].variant}
              icon={statusConfig[status].icon}
              dot
            >
              {statusConfig[status].label}
            </SystemBadge>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setStatus('online')}
            style={{
              padding: '8px 16px',
              border: '1px solid currentColor',
              borderRadius: '8px',
              background: status === 'online' ? '#859900' : 'transparent',
              color: status === 'online' ? 'white' : 'currentColor',
              cursor: 'pointer',
            }}
          >
            Online
          </button>
          <button
            onClick={() => setStatus('away')}
            style={{
              padding: '8px 16px',
              border: '1px solid currentColor',
              borderRadius: '8px',
              background: status === 'away' ? '#b58900' : 'transparent',
              color: status === 'away' ? 'white' : 'currentColor',
              cursor: 'pointer',
            }}
          >
            Away
          </button>
          <button
            onClick={() => setStatus('offline')}
            style={{
              padding: '8px 16px',
              border: '1px solid currentColor',
              borderRadius: '8px',
              background: status === 'offline' ? '#dc322f' : 'transparent',
              color: status === 'offline' ? 'white' : 'currentColor',
              cursor: 'pointer',
            }}
          >
            Offline
          </button>
        </div>
      </div>
    );
  },
};
