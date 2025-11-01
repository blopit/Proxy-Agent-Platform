import type { Meta, StoryObj } from '@storybook/nextjs';
import SystemButton from './SystemButton';
import { Rocket, Download, Trash2, AlertCircle, Check, Plus } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof SystemButton> = {
  title: 'System/SystemButton',
  component: SystemButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Design system button component with consistent styling across the application.

**Features**:
- 6 semantic variants (primary, secondary, success, warning, error, ghost)
- 3 sizes (sm, base, lg)
- Loading state with spinner
- Icon support
- Full width option
- Hover and active states
- Disabled state support
- Accessible keyboard navigation

**Variants**:
- **primary** 🔵 - Cyan gradient (main actions)
- **secondary** 🟦 - Blue gradient (secondary actions)
- **success** 🟢 - Green gradient (confirmations)
- **warning** 🟡 - Yellow gradient (cautions)
- **error** 🔴 - Red gradient (destructive actions)
- **ghost** 👻 - Transparent (tertiary actions)

**Sizes**:
- **sm** - 32px height (compact spaces)
- **base** - 40px height (default)
- **lg** - 48px height (emphasis)`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'ghost'],
      description: 'Visual variant of the button',
    },
    size: {
      control: 'radio',
      options: ['sm', 'base', 'lg'],
      description: 'Button size',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    onClick: {
      action: 'clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SystemButton>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning Button',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: 'Error Button',
    variant: 'error',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Base: Story = {
  args: {
    children: 'Base Button',
    size: 'base',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

// ============================================================================
// With Icons
// ============================================================================

export const WithIconLeft: Story = {
  args: {
    children: 'Launch Rocket',
    icon: <Rocket size={16} />,
    variant: 'primary',
  },
};

export const WithIconRight: Story = {
  render: () => (
    <SystemButton variant="secondary">
      Download
      <Download size={16} />
    </SystemButton>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <SystemButton variant="primary" size="base" aria-label="Add item">
      <Plus size={20} />
    </SystemButton>
  ),
};

// ============================================================================
// States
// ============================================================================

export const Loading: Story = {
  args: {
    children: 'Loading...',
    isLoading: true,
    variant: 'primary',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    variant: 'primary',
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    variant: 'primary',
  },
  parameters: {
    layout: 'padded',
  },
};

// ============================================================================
// All Variants Together
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}>
      <SystemButton variant="primary">Primary</SystemButton>
      <SystemButton variant="secondary">Secondary</SystemButton>
      <SystemButton variant="success">Success</SystemButton>
      <SystemButton variant="warning">Warning</SystemButton>
      <SystemButton variant="error">Error</SystemButton>
      <SystemButton variant="ghost">Ghost</SystemButton>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <SystemButton size="sm" variant="primary">Small</SystemButton>
      <SystemButton size="base" variant="primary">Base</SystemButton>
      <SystemButton size="lg" variant="primary">Large</SystemButton>
    </div>
  ),
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const CallToAction: Story = {
  render: () => (
    <SystemButton variant="primary" size="lg" icon={<Rocket size={20} />}>
      Get Started Free
    </SystemButton>
  ),
};

export const ConfirmAction: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <SystemButton variant="ghost">Cancel</SystemButton>
      <SystemButton variant="success" icon={<Check size={16} />}>
        Confirm
      </SystemButton>
    </div>
  ),
};

export const DestructiveAction: Story = {
  render: () => (
    <SystemButton variant="error" icon={<Trash2 size={16} />}>
      Delete Forever
    </SystemButton>
  ),
};

export const WarningAction: Story = {
  render: () => (
    <SystemButton variant="warning" icon={<AlertCircle size={16} />}>
      Proceed with Caution
    </SystemButton>
  ),
};

// ============================================================================
// Interactive
// ============================================================================

export const Interactive: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleClick = () => {
      setIsLoading(true);
      setTimeout(() => {
        setCount(c => c + 1);
        setIsLoading(false);
      }, 1000);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Clicked {count} times
        </div>
        <SystemButton
          variant="primary"
          onClick={handleClick}
          isLoading={isLoading}
        >
          {isLoading ? 'Processing...' : 'Click Me'}
        </SystemButton>
      </div>
    );
  },
};

// ============================================================================
// Button Group
// ============================================================================

export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <SystemButton variant="ghost" size="sm">Previous</SystemButton>
      <SystemButton variant="primary" size="sm">1</SystemButton>
      <SystemButton variant="ghost" size="sm">2</SystemButton>
      <SystemButton variant="ghost" size="sm">3</SystemButton>
      <SystemButton variant="ghost" size="sm">Next</SystemButton>
    </div>
  ),
};

export const ToolbarActions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <SystemButton variant="ghost" size="sm" aria-label="Bold">
        <strong>B</strong>
      </SystemButton>
      <SystemButton variant="ghost" size="sm" aria-label="Italic">
        <em>I</em>
      </SystemButton>
      <SystemButton variant="ghost" size="sm" aria-label="Underline">
        <u>U</u>
      </SystemButton>
      <div style={{ width: '1px', background: '#586e75', margin: '0 4px' }} />
      <SystemButton variant="ghost" size="sm" icon={<Download size={14} />} />
      <SystemButton variant="ghost" size="sm" icon={<Trash2 size={14} />} />
    </div>
  ),
};
