import type { Meta, StoryObj } from '@storybook/nextjs';
import ConnectionElement from './ConnectionElement';
import { siGmail, siGooglecalendar, siGoogledrive, siSlack, siNotion, siTrello } from 'simple-icons';
import React from 'react';

const meta: Meta<typeof ConnectionElement> = {
  title: 'Mobile/Connections/ConnectionElement',
  component: ConnectionElement,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
    docs: {
      description: {
        component: `Individual connection item for the Connections section.

**Features**:
- Brand logo (SVG from simple-icons)
- Provider name
- Status-based styling with ChevronButton
- Border color changes based on status

**Statuses**:
- **disconnected** - Blue border, "Connect" button
- **connected** - Green border, "Connected" with checkmark
- **error** - Red border, "Retry" button with error icon
- **connecting** - Yellow border, "Connecting..." with spinner (disabled)`,
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['disconnected', 'connected', 'error', 'connecting'],
      description: 'Connection status',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '360px', padding: '20px', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConnectionElement>;

// ============================================================================
// Individual Status States
// ============================================================================

export const Disconnected: Story = {
  args: {
    provider: 'Gmail',
    iconSvg: siGmail.path,
    iconColor: `#${siGmail.hex}`,
    status: 'disconnected',
    onConnect: () => console.log('Connect Gmail'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Disconnected state - blue border with "Connect" button',
      },
    },
  },
};

export const Connected: Story = {
  args: {
    provider: 'Google Drive',
    iconSvg: siGoogledrive.path,
    iconColor: `#${siGoogledrive.hex}`,
    status: 'connected',
  },
  parameters: {
    docs: {
      description: {
        story: 'Connected state - green border with checkmark',
      },
    },
  },
};

export const Error: Story = {
  args: {
    provider: 'Slack',
    iconSvg: siSlack.path,
    iconColor: `#${siSlack.hex}`,
    status: 'error',
    onConnect: () => console.log('Retry Slack'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state - red border with "Retry" button',
      },
    },
  },
};

export const Connecting: Story = {
  args: {
    provider: 'Google Calendar',
    iconSvg: siGooglecalendar.path,
    iconColor: `#${siGooglecalendar.hex}`,
    status: 'connecting',
  },
  parameters: {
    docs: {
      description: {
        story: 'Connecting state - yellow border with loading spinner',
      },
    },
  },
};

// ============================================================================
// Different Providers
// ============================================================================

export const AllProviders: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <h3 style={{ color: 'var(--text-color)', marginBottom: '16px', fontSize: '16px' }}>
        Available Connections
      </h3>

      <ConnectionElement
        provider="Gmail"
        iconSvg={siGmail.path}
        iconColor={`#${siGmail.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Gmail')}
      />

      <ConnectionElement
        provider="Google Calendar"
        iconSvg={siGooglecalendar.path}
        iconColor={`#${siGooglecalendar.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Calendar')}
      />

      <ConnectionElement
        provider="Google Drive"
        iconSvg={siGoogledrive.path}
        iconColor={`#${siGoogledrive.hex}`}
        status="connected"
      />

      <ConnectionElement
        provider="Slack"
        iconSvg={siSlack.path}
        iconColor={`#${siSlack.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Slack')}
      />

      <ConnectionElement
        provider="Notion"
        iconSvg={siNotion.path}
        iconColor={`#${siNotion.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Notion')}
      />

      <ConnectionElement
        provider="Trello"
        iconSvg={siTrello.path}
        iconColor={`#${siTrello.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Trello')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple connection elements showing different providers',
      },
    },
  },
};

// ============================================================================
// Interactive Demo
// ============================================================================

export const InteractiveDemo: Story = {
  render: function InteractiveDemoStory() {
    const [connections, setConnections] = React.useState([
      { id: 'gmail', provider: 'Gmail', iconSvg: siGmail.path, iconColor: `#${siGmail.hex}`, status: 'disconnected' as const },
      { id: 'calendar', provider: 'Google Calendar', iconSvg: siGooglecalendar.path, iconColor: `#${siGooglecalendar.hex}`, status: 'disconnected' as const },
      { id: 'drive', provider: 'Google Drive', iconSvg: siGoogledrive.path, iconColor: `#${siGoogledrive.hex}`, status: 'connected' as const },
      { id: 'slack', provider: 'Slack', iconSvg: siSlack.path, iconColor: `#${siSlack.hex}`, status: 'disconnected' as const },
    ]);

    const handleConnect = (id: string) => {
      // Set to connecting
      setConnections(prev =>
        prev.map(conn =>
          conn.id === id ? { ...conn, status: 'connecting' as const } : conn
        )
      );

      // Simulate connection attempt
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        setConnections(prev =>
          prev.map(conn =>
            conn.id === id ? { ...conn, status: (success ? 'connected' : 'error') as const } : conn
          )
        );
      }, 2000);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <h3 style={{ color: 'var(--text-color)', marginBottom: '8px', fontSize: '16px' }}>
          Interactive Connections
        </h3>
        <p style={{ color: 'var(--emphasis-color)', fontSize: '12px', marginBottom: '16px', lineHeight: '1.5' }}>
          Click "Connect" to simulate connection flow. 80% success rate.
        </p>

        {connections.map((connection) => (
          <ConnectionElement
            key={connection.id}
            provider={connection.provider}
            iconSvg={connection.iconSvg}
            iconColor={connection.iconColor}
            status={connection.status}
            onConnect={() => handleConnect(connection.id)}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - try connecting services with simulated success/failure',
      },
    },
  },
};

// ============================================================================
// All States Showcase
// ============================================================================

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <h3 style={{ color: 'var(--text-color)', marginBottom: '16px', fontSize: '16px' }}>
        All Connection States
      </h3>

      <div style={{ marginBottom: '8px' }}>
        <p style={{ color: 'var(--emphasis-color)', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Disconnected
        </p>
        <ConnectionElement
          provider="Gmail"
          iconSvg={siGmail.path}
          iconColor={`#${siGmail.hex}`}
          status="disconnected"
          onConnect={() => console.log('Connect')}
        />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <p style={{ color: 'var(--emphasis-color)', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Connecting
        </p>
        <ConnectionElement
          provider="Google Calendar"
          iconSvg={siGooglecalendar.path}
          iconColor={`#${siGooglecalendar.hex}`}
          status="connecting"
        />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <p style={{ color: 'var(--emphasis-color)', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Connected
        </p>
        <ConnectionElement
          provider="Google Drive"
          iconSvg={siGoogledrive.path}
          iconColor={`#${siGoogledrive.hex}`}
          status="connected"
        />
      </div>

      <div>
        <p style={{ color: 'var(--emphasis-color)', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Error
        </p>
        <ConnectionElement
          provider="Slack"
          iconSvg={siSlack.path}
          iconColor={`#${siSlack.hex}`}
          status="error"
          onConnect={() => console.log('Retry')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All four connection states displayed with labels',
      },
    },
  },
};

// ============================================================================
// In Full Modal Context
// ============================================================================

export const InModalContext: Story = {
  render: () => (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: 'var(--background-color)',
      padding: '60px 24px 100px 24px',
      overflow: 'auto'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 600,
        color: 'var(--text-color)',
        marginBottom: '24px'
      }}>
        Connections
      </h2>

      <ConnectionElement
        provider="Gmail"
        iconSvg={siGmail.path}
        iconColor={`#${siGmail.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Gmail')}
      />

      <ConnectionElement
        provider="Google Calendar"
        iconSvg={siGooglecalendar.path}
        iconColor={`#${siGooglecalendar.hex}`}
        status="connecting"
      />

      <ConnectionElement
        provider="Google Drive"
        iconSvg={siGoogledrive.path}
        iconColor={`#${siGoogledrive.hex}`}
        status="connected"
      />

      <ConnectionElement
        provider="Slack"
        iconSvg={siSlack.path}
        iconColor={`#${siSlack.hex}`}
        status="error"
        onConnect={() => console.log('Retry Slack')}
      />

      <ConnectionElement
        provider="Notion"
        iconSvg={siNotion.path}
        iconColor={`#${siNotion.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Notion')}
      />

      <ConnectionElement
        provider="Trello"
        iconSvg={siTrello.path}
        iconColor={`#${siTrello.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Trello')}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Connection elements in full-screen modal context (as they appear in CaptureModal)',
      },
    },
  },
};

// ============================================================================
// Theme Switching Demo
// ============================================================================

export const ThemeSwitching: Story = {
  render: () => (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--background-color)',
      minHeight: '100vh'
    }}>
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: 'var(--secondary-bg-color)',
        borderRadius: '8px',
        border: `1px solid var(--border-color)`
      }}>
        <p style={{ color: 'var(--text-color)', marginBottom: '8px' }}>
          <strong>Theme Switching Demo</strong>
        </p>
        <p style={{ color: 'var(--emphasis-color)', fontSize: '14px' }}>
          Use the Storybook theme selector (paintbrush icon 🎨 in the toolbar) to switch between 21 different themes and see the connections adapt in real-time!
        </p>
      </div>

      <h3 style={{ color: 'var(--text-color)', marginBottom: '16px', fontSize: '18px' }}>
        Connection Elements
      </h3>

      <ConnectionElement
        provider="Gmail"
        iconSvg={siGmail.path}
        iconColor={`#${siGmail.hex}`}
        status="disconnected"
        onConnect={() => console.log('Connect Gmail')}
      />

      <ConnectionElement
        provider="Google Calendar"
        iconSvg={siGooglecalendar.path}
        iconColor={`#${siGooglecalendar.hex}`}
        status="connecting"
      />

      <ConnectionElement
        provider="Google Drive"
        iconSvg={siGoogledrive.path}
        iconColor={`#${siGoogledrive.hex}`}
        status="connected"
      />

      <ConnectionElement
        provider="Slack"
        iconSvg={siSlack.path}
        iconColor={`#${siSlack.hex}`}
        status="error"
        onConnect={() => console.log('Retry Slack')}
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive demo - Use the Storybook toolbar theme selector to switch between 21 themes and see connections adapt in real-time',
      },
    },
  },
};
