import type { Meta, StoryObj } from '@storybook/nextjs';
import ChevronButton from './ChevronButton';
import { Check, AlertCircle, Loader2, Link } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof ChevronButton> = {
  title: 'Components/Mobile/ChevronButton',
  component: ChevronButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Stylized button with chevron/arrow shape and gradient effects.

**Features**:
- Chevron shape using CSS clip-path
- Positional variants for interlocking buttons (first, middle, last, single)
- Gradient background with inner highlight for depth
- Focus state with glowing effect
- Active press animation
- Solarized color variants
- Disabled state support

**Variants**:
- **primary** 🔵 - Blue gradient (default)
- **success** 🟢 - Green gradient (Solarized green)
- **error** 🔴 - Red gradient (Solarized red)
- **warning** 🟡 - Yellow gradient (Solarized yellow)
- **neutral** 🔷 - Cyan gradient (Solarized blue)

**Positions**:
- **first** - Straight left edge, chevron point on right (default)
- **middle** - Chevron indent on left, chevron point on right
- **last** - Chevron indent on left, straight right edge
- **single** - Straight on both sides (no chevron)`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'success', 'error', 'warning', 'neutral'],
      description: 'Button color variant',
    },
    position: {
      control: 'select',
      options: ['first', 'middle', 'last', 'single'],
      description: 'Position for interlocking buttons',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChevronButton>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Connect',
    onClick: () => console.log('Connect clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary blue gradient button - default variant',
      },
    },
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Check size={14} strokeWidth={2.5} />
        <span>Connected</span>
      </div>
    ),
    onClick: () => console.log('Connected'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Success state with green gradient and checkmark icon',
      },
    },
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <AlertCircle size={14} strokeWidth={2.5} />
        <span>Error</span>
      </div>
    ),
    onClick: () => console.log('Error'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state with red gradient and alert icon',
      },
    },
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
        <span>Connecting...</span>
      </div>
    ),
    onClick: () => console.log('Connecting'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning/loading state with yellow gradient and spinner',
      },
    },
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'Retry',
    onClick: () => console.log('Retry clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Neutral cyan gradient button',
      },
    },
  },
};

// ============================================================================
// States
// ============================================================================

export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled',
    disabled: true,
    onClick: () => console.log('This should not fire'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state - reduced opacity, no interaction',
      },
    },
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'neutral',
    children: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Link size={14} strokeWidth={2.5} />
        <span>Link Account</span>
      </div>
    ),
    onClick: () => console.log('Link clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with icon and text',
      },
    },
  },
};

export const TextOnly: Story = {
  args: {
    variant: 'primary',
    children: 'Save',
    onClick: () => console.log('Save clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with text only',
      },
    },
  },
};

// ============================================================================
// Showcase All Variants
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px',
      backgroundColor: '#002b36',
      borderRadius: '8px',
    }}>
      <h3 style={{ color: '#839496', marginBottom: '8px', fontSize: '16px' }}>
        All Variants
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <ChevronButton variant="primary" onClick={() => console.log('Primary')}>
          Connect
        </ChevronButton>

        <ChevronButton variant="success" onClick={() => console.log('Success')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={14} strokeWidth={2.5} />
            <span>Connected</span>
          </div>
        </ChevronButton>

        <ChevronButton variant="error" onClick={() => console.log('Error')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} strokeWidth={2.5} />
            <span>Error</span>
          </div>
        </ChevronButton>

        <ChevronButton variant="warning" onClick={() => console.log('Warning')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Loader2 size={14} strokeWidth={2.5} />
            <span>Connecting...</span>
          </div>
        </ChevronButton>

        <ChevronButton variant="neutral" onClick={() => console.log('Neutral')}>
          Retry
        </ChevronButton>

        <ChevronButton variant="primary" disabled onClick={() => console.log('Disabled')}>
          Disabled
        </ChevronButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together',
      },
    },
  },
};

// ============================================================================
// Interactive Demo
// ============================================================================

export const InteractiveDemo: Story = {
  render: function InteractiveDemoStory() {
    const [status, setStatus] = React.useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

    const handleClick = () => {
      if (status === 'disconnected') {
        setStatus('connecting');
        setTimeout(() => {
          // 80% success rate
          if (Math.random() > 0.2) {
            setStatus('connected');
          } else {
            setStatus('error');
          }
        }, 2000);
      } else if (status === 'error') {
        setStatus('disconnected');
      }
    };

    const renderButton = () => {
      switch (status) {
        case 'disconnected':
          return (
            <ChevronButton variant="primary" onClick={handleClick}>
              Connect
            </ChevronButton>
          );
        case 'connecting':
          return (
            <ChevronButton variant="warning" disabled>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />
                <span>Connecting...</span>
              </div>
            </ChevronButton>
          );
        case 'connected':
          return (
            <ChevronButton variant="success">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} strokeWidth={2.5} />
                <span>Connected</span>
              </div>
            </ChevronButton>
          );
        case 'error':
          return (
            <ChevronButton variant="error" onClick={handleClick}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={14} strokeWidth={2.5} />
                <span>Retry</span>
              </div>
            </ChevronButton>
          );
      }
    };

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '32px',
        backgroundColor: '#002b36',
        borderRadius: '8px',
        alignItems: 'center',
      }}>
        <h3 style={{ color: '#839496', fontSize: '16px', marginBottom: '8px' }}>
          Interactive Connection Demo
        </h3>
        <p style={{ color: '#586e75', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
          Click "Connect" to simulate a connection flow
        </p>
        {renderButton()}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing button states during a connection flow',
      },
    },
  },
};

// ============================================================================
// In Context
// ============================================================================

export const InConnectionElement: Story = {
  render: () => (
    <div style={{
      width: '320px',
      padding: '20px',
      backgroundColor: '#002b36',
      borderRadius: '8px',
    }}>
      <h3 style={{ color: '#839496', marginBottom: '16px', fontSize: '16px' }}>
        Connection List
      </h3>

      {/* Gmail - Disconnected */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: '#073642',
        border: '1px solid #268bd2',
        borderRadius: '6px',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '20px' }}>📧</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#839496' }}>Gmail</span>
        </div>
        <ChevronButton variant="primary" onClick={() => console.log('Connect Gmail')}>
          Connect
        </ChevronButton>
      </div>

      {/* Google Drive - Connected */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: '#073642',
        border: '1px solid #859900',
        borderRadius: '6px',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '20px' }}>📁</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#839496' }}>Google Drive</span>
        </div>
        <ChevronButton variant="success">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={14} strokeWidth={2.5} />
            <span>Connected</span>
          </div>
        </ChevronButton>
      </div>

      {/* Slack - Error */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: '#073642',
        border: '1px solid #dc322f',
        borderRadius: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '20px' }}>#️⃣</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#839496' }}>Slack</span>
        </div>
        <ChevronButton variant="error" onClick={() => console.log('Retry Slack')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertCircle size={14} strokeWidth={2.5} />
            <span>Retry</span>
          </div>
        </ChevronButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'ChevronButtons used in connection elements (realistic use case)',
      },
    },
  },
};

// ============================================================================
// Positional Variants (Interlocking)
// ============================================================================

export const PositionalFirst: Story = {
  args: {
    variant: 'primary',
    position: 'first',
    children: 'First',
    onClick: () => console.log('First clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'First position - straight left edge, chevron point on right (default)',
      },
    },
  },
};

export const PositionalMiddle: Story = {
  args: {
    variant: 'primary',
    position: 'middle',
    children: 'Middle',
    onClick: () => console.log('Middle clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Middle position - chevron indent on left, chevron point on right',
      },
    },
  },
};

export const PositionalLast: Story = {
  args: {
    variant: 'primary',
    position: 'last',
    children: 'Last',
    onClick: () => console.log('Last clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Last position - chevron indent on left, straight right edge',
      },
    },
  },
};

export const PositionalSingle: Story = {
  args: {
    variant: 'primary',
    position: 'single',
    children: 'Single',
    onClick: () => console.log('Single clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Single position - straight on both sides (no chevron)',
      },
    },
  },
};

export const InterlockingButtons: Story = {
  render: () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '20px',
      backgroundColor: '#002b36',
      borderRadius: '8px',
    }}>
      <div>
        <h3 style={{ color: '#839496', marginBottom: '12px', fontSize: '14px' }}>
          Three Buttons (with overlap)
        </h3>
        <div style={{ display: 'flex', marginRight: '0' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronButton
              variant="primary"
              position="first"
              width="100px"
              onClick={() => console.log('First')}
            >
              First
            </ChevronButton>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronButton
              variant="success"
              position="middle"
              width="100px"
              onClick={() => console.log('Middle')}
            >
              Middle
            </ChevronButton>
          </div>
          <div>
            <ChevronButton
              variant="neutral"
              position="last"
              width="100px"
              onClick={() => console.log('Last')}
            >
              Last
            </ChevronButton>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#839496', marginBottom: '12px', fontSize: '14px' }}>
          Two Buttons (with overlap)
        </h3>
        <div style={{ display: 'flex', marginRight: '0' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronButton
              variant="error"
              position="first"
              width="120px"
              onClick={() => console.log('Cancel')}
            >
              Cancel
            </ChevronButton>
          </div>
          <div>
            <ChevronButton
              variant="success"
              position="last"
              width="120px"
              onClick={() => console.log('Confirm')}
            >
              Confirm
            </ChevronButton>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#839496', marginBottom: '12px', fontSize: '14px' }}>
          Five Buttons (with overlap)
        </h3>
        <div style={{ display: 'flex', marginRight: '0' }}>
          <div style={{ marginRight: '-2px' }}>
            <ChevronButton
              variant="neutral"
              position="first"
              width="80px"
              onClick={() => console.log('Step 1')}
            >
              Step 1
            </ChevronButton>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronButton
              variant="neutral"
              position="middle"
              width="80px"
              onClick={() => console.log('Step 2')}
            >
              Step 2
            </ChevronButton>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronButton
              variant="primary"
              position="middle"
              width="80px"
              onClick={() => console.log('Step 3')}
            >
              Step 3
            </ChevronButton>
          </div>
          <div style={{ marginRight: '-2px' }}>
            <ChevronButton
              variant="neutral"
              position="middle"
              width="80px"
              onClick={() => console.log('Step 4')}
            >
              Step 4
            </ChevronButton>
          </div>
          <div>
            <ChevronButton
              variant="neutral"
              position="last"
              width="80px"
              onClick={() => console.log('Step 5')}
            >
              Step 5
            </ChevronButton>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#839496', marginBottom: '12px', fontSize: '14px' }}>
          Single Button (no interlocking)
        </h3>
        <ChevronButton
          variant="primary"
          position="single"
          width="200px"
          onClick={() => console.log('Single')}
        >
          Single Button
        </ChevronButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple interlocking buttons with -2px overlap for seamless connection',
      },
    },
  },
};
