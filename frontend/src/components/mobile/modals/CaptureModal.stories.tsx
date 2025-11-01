import type { Meta, StoryObj } from '@storybook/nextjs';
import CaptureModal from './CaptureModal';
import React from 'react';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

const meta: Meta<typeof CaptureModal> = {
  title: 'Mobile/Modals/CaptureModal',
  component: CaptureModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Full-screen swipeable modal for Add/Capture functionality.

**Features**:
- Full viewport coverage with theme support (light/dark)
- X button (top left) to dismiss
- 3 swipeable pages: Connections, Suggestions, Manual
- Bottom tabs navigation (clickable + swipeable)
- Touch gesture support (swipe left/right)
- Smooth page transitions
- Adapts colors based on theme

**Pages**:
1. **Connections** 🔗 - Connect to external services (Gmail, Calendar, Drive)
2. **Suggestions** ⚡ - AI-powered recommendations
3. **Manual** ✏️ - Direct text entry`,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Modal visibility',
    },
    initialPage: {
      control: 'select',
      options: [0, 1, 2],
      description: 'Starting page (0=Connections, 1=Suggestions, 2=Manual)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CaptureModal>;

// ============================================================================
// Basic States
// ============================================================================

export const Default: Story = {
  args: {
    isOpen: true,
    initialPage: 0,
    onClose: () => console.log('Modal closed'),
  },
};

export const ConnectionsPage: Story = {
  args: {
    isOpen: true,
    initialPage: 0,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Connections page - Connect external services like Gmail, Google Calendar, Drive',
      },
    },
  },
};

export const SuggestionsPage: Story = {
  args: {
    isOpen: true,
    initialPage: 1,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Suggestions page - AI-powered recommendations',
      },
    },
  },
};

export const ManualPage: Story = {
  args: {
    isOpen: true,
    initialPage: 2,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Manual entry page - Direct text input',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    initialPage: 0,
    onClose: () => console.log('Modal closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal closed state - nothing rendered',
      },
    },
  },
};

// ============================================================================
// Interactive Example
// ============================================================================

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(0);

    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#002b36',
        gap: '20px'
      }}>
        {/* Demo Controls */}
        <div style={{
          padding: '24px',
          backgroundColor: '#073642',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#839496', marginBottom: '16px', fontSize: '18px' }}>
            CaptureModal Demo
          </h3>

          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#268bd2',
              color: '#fdf6e3',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            Open Modal
          </button>

          <div style={{ marginTop: '16px' }}>
            <label style={{ color: '#93a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
              Starting Page:
            </label>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              style={{
                padding: '8px',
                backgroundColor: '#002b36',
                color: '#fdf6e3',
                border: '1px solid #586e75',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value={0}>Connections</option>
              <option value={1}>Suggestions</option>
              <option value={2}>Manual</option>
            </select>
          </div>

          <p style={{ color: '#586e75', fontSize: '12px', marginTop: '16px', lineHeight: '1.5' }}>
            Click "Open Modal" to launch the full-screen capture modal.
            <br />
            Try swiping left/right to change pages!
          </p>
        </div>

        {/* Modal */}
        <CaptureModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          initialPage={currentPage}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - Open modal and try swiping between pages',
      },
    },
  },
};

// ============================================================================
// Usage Example
// ============================================================================

export const WithTabs: Story = {
  render: function WithTabsStory() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('add');

    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#002b36'
      }}>
        {/* Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#93a1a1',
          fontSize: '18px'
        }}>
          {activeTab === 'add' && <p>Add content (modal will appear)</p>}
          {activeTab === 'scout' && <p>Scout content</p>}
          {activeTab === 'hunt' && <p>Hunt content</p>}
        </div>

        {/* Bottom Tabs */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #073642'
        }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {['add', 'scout', 'hunt'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'add') {
                    setIsModalOpen(true);
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: activeTab === tab ? '#268bd2' : '#073642',
                  color: '#fdf6e3',
                  border: '1px solid #586e75',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CaptureModal */}
        <CaptureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialPage={0}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Usage example - Modal opens when Add tab is pressed',
      },
    },
  },
};

// ============================================================================
// Theme Switching Demo
// ============================================================================

export const ThemeSwitching: Story = {
  render: function ThemeSwitchingStory() {
    const ThemeInfo = () => {
      const { mode, colors } = useTheme();
      const [isOpen, setIsOpen] = React.useState(false);

      return (
        <div style={{ padding: '40px', minHeight: '100vh', backgroundColor: colors.background }}>
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: '8px',
            border: `1px solid ${colors.border}`
          }}>
            <p style={{ color: colors.text, marginBottom: '8px' }}>
              <strong>Current Theme:</strong> {mode === 'dark' ? 'Dark' : 'Light'} Mode
            </p>
            <p style={{ color: colors.textSecondary, fontSize: '14px' }}>
              Use the Storybook theme selector (paintbrush icon in toolbar) to switch themes.
            </p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.blue,
              color: colors.background,
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Open Modal
          </button>

          <CaptureModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            initialPage={0}
          />
        </div>
      );
    };

    return <ThemeInfo />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo - Use the Storybook toolbar theme selector to switch between themes and see the modal adapt',
      },
    },
  },
};
