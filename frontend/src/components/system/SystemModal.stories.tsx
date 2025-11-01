import type { Meta, StoryObj } from '@storybook/nextjs';
import SystemModal from './SystemModal';
import { Trash2, AlertTriangle, Save, Info, Settings, User, Mail, Lock } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof SystemModal> = {
  title: 'System/SystemModal',
  component: SystemModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Design system modal component for dialogs, confirmations, and overlays.

**Features**:
- 5 size options (sm, base, lg, xl, full)
- Optional title and footer
- Smooth open/close animations (fade + scale)
- Backdrop blur effect
- Close on overlay click (configurable)
- Close on Escape key
- Optional close button
- Auto body scroll lock when open
- Flexible content composition
- Responsive max height (90vh with scroll)

**Sizes**:
- **sm** - 400px (small alerts, confirmations)
- **base** - 600px (default, standard dialogs)
- **lg** - 800px (forms, detailed content)
- **xl** - 1000px (rich content, galleries)
- **full** - 95vw (immersive experiences)

**Use Cases**:
- Confirmation dialogs
- Forms
- Image galleries
- Content viewers
- Settings panels
- Alerts and warnings`,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Control modal visibility',
    },
    size: {
      control: 'radio',
      options: ['sm', 'base', 'lg', 'xl', 'full'],
      description: 'Modal width',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Close when clicking backdrop',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show X close button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SystemModal>;

// ============================================================================
// Basic Modal
// ============================================================================

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Open Modal
          </button>
        </div>

        <SystemModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Default Modal">
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            This is a default modal with a title and close button. Click the X button, press Escape, or click
            outside to close.
          </p>
        </SystemModal>
      </>
    );
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const SmallSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Small Modal
          </button>
        </div>

        <SystemModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Small Modal" size="sm">
          <p style={{ margin: 0 }}>
            Small modal (400px) - perfect for simple confirmations and alerts.
          </p>
        </SystemModal>
      </>
    );
  },
};

export const BaseSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Base Modal
          </button>
        </div>

        <SystemModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Base Modal" size="base">
          <p style={{ margin: 0 }}>
            Base modal (600px) - the default size, suitable for most use cases.
          </p>
        </SystemModal>
      </>
    );
  },
};

export const LargeSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Large Modal
          </button>
        </div>

        <SystemModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Large Modal" size="lg">
          <p style={{ margin: 0 }}>
            Large modal (800px) - ideal for forms and detailed content.
          </p>
        </SystemModal>
      </>
    );
  },
};

export const ExtraLargeSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open XL Modal
          </button>
        </div>

        <SystemModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Extra Large Modal" size="xl">
          <p style={{ margin: 0 }}>
            Extra large modal (1000px) - great for rich content, image galleries, and data tables.
          </p>
        </SystemModal>
      </>
    );
  },
};

export const FullSize: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Full Modal
          </button>
        </div>

        <SystemModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Full Width Modal" size="full">
          <p style={{ margin: 0 }}>
            Full width modal (95vw) - immersive experiences, large forms, or complex layouts.
          </p>
        </SystemModal>
      </>
    );
  },
};

// ============================================================================
// With Footer
// ============================================================================

export const WithFooter: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Modal with Footer
          </button>
        </div>

        <SystemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirmation Required"
          footer={
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid currentColor',
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#268bd2',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
            </div>
          }
        >
          <p style={{ margin: 0, marginBottom: '16px' }}>
            Are you sure you want to proceed with this action? This cannot be undone.
          </p>
        </SystemModal>
      </>
    );
  },
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const DeleteConfirmation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#dc322f',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Trash2 size={18} />
            Delete Item
          </button>
        </div>

        <SystemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Delete Confirmation"
          size="sm"
          footer={
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid currentColor',
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#dc322f',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
            <div style={{ color: '#dc322f', flexShrink: 0, marginTop: '2px' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <p style={{ margin: 0, marginBottom: '8px', fontWeight: '600' }}>
                This action cannot be undone.
              </p>
              <p style={{ margin: 0, opacity: 0.8 }}>
                Are you sure you want to permanently delete this item? All associated data will be lost.
              </p>
            </div>
          </div>
        </SystemModal>
      </>
    );
  },
};

export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Edit Profile
          </button>
        </div>

        <SystemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Edit Profile"
          size="lg"
          footer={
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid currentColor',
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#859900',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'inherit',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Email
              </label>
              <input
                type="email"
                defaultValue="john@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'inherit',
                  fontSize: '14px',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Bio
              </label>
              <textarea
                rows={4}
                defaultValue="Product designer passionate about creating delightful user experiences."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'inherit',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </SystemModal>
      </>
    );
  },
};

export const InfoModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#2aa198',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Info size={18} />
            View Information
          </button>
        </div>

        <SystemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="About This Feature"
          footer={
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: '#268bd2',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Got it!
            </button>
          }
        >
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ color: '#2aa198', flexShrink: 0 }}>
              <Info size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
                New Feature Available
              </h4>
              <p style={{ margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
                We've just released a new feature that allows you to customize your workflow even further.
                Check out the settings panel to explore all the new options.
              </p>
            </div>
          </div>
          <ul style={{ marginTop: '12px', paddingLeft: '36px', lineHeight: 1.8 }}>
            <li>Advanced filtering options</li>
            <li>Custom keyboard shortcuts</li>
            <li>Dark mode themes</li>
            <li>Export to multiple formats</li>
          </ul>
        </SystemModal>
      </>
    );
  },
};

export const SettingsModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#6c71c4',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Settings size={18} />
            Open Settings
          </button>
        </div>

        <SystemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Settings"
          size="lg"
          footer={
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
              <button
                style={{
                  padding: '10px 20px',
                  border: '1px solid currentColor',
                  borderRadius: '8px',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Reset to Defaults
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid currentColor',
                    borderRadius: '8px',
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#859900',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                Appearance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Dark mode</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" />
                  <span>Compact view</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Show avatars</span>
                </label>
              </div>
            </div>

            <div>
              <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                Notifications
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Email notifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Push notifications</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" />
                  <span>Weekly digest</span>
                </label>
              </div>
            </div>

            <div>
              <h4 style={{ margin: 0, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                Privacy
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Profile visible to others</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" />
                  <span>Show online status</span>
                </label>
              </div>
            </div>
          </div>
        </SystemModal>
      </>
    );
  },
};

// ============================================================================
// Configuration Options
// ============================================================================

export const NoCloseOnOverlay: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Modal
          </button>
        </div>

        <SystemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="No Close on Overlay"
          closeOnOverlayClick={false}
          footer={
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: '#268bd2',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Close Modal
            </button>
          }
        >
          <p style={{ margin: 0 }}>
            This modal cannot be closed by clicking the backdrop. You must use the close button or press Escape.
          </p>
        </SystemModal>
      </>
    );
  },
};

export const NoCloseButton: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Modal
          </button>
        </div>

        <SystemModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="No Close Button"
          showCloseButton={false}
          footer={
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: '#268bd2',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Dismiss
            </button>
          }
        >
          <p style={{ margin: 0 }}>
            This modal has no X button. Use the dismiss button or press Escape to close.
          </p>
        </SystemModal>
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <>
        <div style={{ padding: '40px' }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              background: '#268bd2',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Open Modal with Long Content
          </button>
        </div>

        <SystemModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Terms of Service">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
              labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur
              magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed
              quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
              aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit
              esse quam nihil molestiae consequatur.
            </p>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum
              deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non
              provident.
            </p>
          </div>
        </SystemModal>
      </>
    );
  },
};
