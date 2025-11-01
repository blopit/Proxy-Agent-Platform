import type { Meta, StoryObj } from '@storybook/nextjs';
import SystemToast from './SystemToast';
import { Check, Save, Trash2, Upload, Download, Settings } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof SystemToast> = {
  title: 'System/SystemToast',
  component: SystemToast,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `Design system toast notification component for user feedback.

**Features**:
- 4 semantic variants (success, error, warning, info)
- Auto-dismiss with configurable duration
- Manual close button
- Smooth slide-in/out animations
- Backdrop blur effect
- Optional description text
- Icon indicators for each variant
- Fixed top-right positioning
- Stacking support for multiple toasts

**Variants**:
- **success** 🟢 - Green with checkmark (operations completed)
- **error** 🔴 - Red with alert circle (errors, failures)
- **warning** 🟡 - Yellow with triangle (warnings, caution)
- **info** 🔵 - Blue with info icon (general information)

**Use Cases**:
- Operation confirmations
- Error notifications
- Warning messages
- Info updates
- Loading states
- Action feedback`,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Toast variant',
    },
    message: {
      control: 'text',
      description: 'Toast message',
    },
    description: {
      control: 'text',
      description: 'Optional description',
    },
    duration: {
      control: 'number',
      description: 'Auto-dismiss duration (ms), 0 to disable',
    },
    show: {
      control: 'boolean',
      description: 'Show/hide toast',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SystemToast>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Success: Story = {
  args: {
    variant: 'success',
    message: 'Operation completed successfully',
    show: true,
    duration: 0, // Disable auto-dismiss for story
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    message: 'An error occurred',
    show: true,
    duration: 0,
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    message: 'Warning: Please check your input',
    show: true,
    duration: 0,
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    message: 'New update available',
    show: true,
    duration: 0,
  },
};

// ============================================================================
// With Descriptions
// ============================================================================

export const SuccessWithDescription: Story = {
  args: {
    variant: 'success',
    message: 'Changes saved',
    description: 'Your profile has been updated successfully.',
    show: true,
    duration: 0,
  },
};

export const ErrorWithDescription: Story = {
  args: {
    variant: 'error',
    message: 'Upload failed',
    description: 'The file size exceeds the maximum limit of 10MB.',
    show: true,
    duration: 0,
  },
};

export const WarningWithDescription: Story = {
  args: {
    variant: 'warning',
    message: 'Unsaved changes',
    description: 'You have unsaved changes. Do you want to leave this page?',
    show: true,
    duration: 0,
  },
};

export const InfoWithDescription: Story = {
  args: {
    variant: 'info',
    message: 'System maintenance',
    description: 'Scheduled maintenance will occur tonight from 2AM to 4AM EST.',
    show: true,
    duration: 0,
  },
};

// ============================================================================
// All Variants Together
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ position: 'relative', minHeight: '400px', padding: '20px' }}>
      <div style={{ position: 'fixed', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 50 }}>
        <SystemToast variant="success" message="Success notification" show duration={0} />
        <SystemToast variant="error" message="Error notification" show duration={0} />
        <SystemToast variant="warning" message="Warning notification" show duration={0} />
        <SystemToast variant="info" message="Info notification" show duration={0} />
      </div>
    </div>
  ),
};

// ============================================================================
// Interactive Examples
// ============================================================================

export const InteractiveToast: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);
    const [variant, setVariant] = React.useState<'success' | 'error' | 'warning' | 'info'>('success');

    return (
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Toast Trigger</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600' }}>Select Variant:</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as any)}
              style={{
                padding: '8px 12px',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                color: 'inherit',
                fontSize: '14px',
              }}
            >
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <button
            onClick={() => {
              setShowToast(false);
              setTimeout(() => setShowToast(true), 100);
            }}
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
            Show Toast
          </button>
        </div>

        <SystemToast
          variant={variant}
          message={`This is a ${variant} toast`}
          description="This toast will auto-dismiss in 5 seconds"
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      </div>
    );
  },
};

// ============================================================================
// Real-World Examples
// ============================================================================

export const SaveConfirmation: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
          style={{
            padding: '12px 24px',
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
          <Save size={18} />
          Save Changes
        </button>

        <SystemToast
          variant="success"
          message="Changes saved successfully"
          description="Your profile has been updated."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      </div>
    );
  },
};

export const DeleteConfirmation: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
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

        <SystemToast
          variant="success"
          message="Item deleted"
          description="The item has been permanently removed."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={4000}
        />
      </div>
    );
  },
};

export const UploadError: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: '#268bd2',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Upload size={18} />
          Upload File
        </button>

        <SystemToast
          variant="error"
          message="Upload failed"
          description="The file size exceeds the maximum limit of 10MB."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={6000}
        />
      </div>
    );
  },
};

export const DownloadComplete: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
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
          <Download size={18} />
          Download Report
        </button>

        <SystemToast
          variant="success"
          message="Download complete"
          description="Your report has been saved to Downloads folder."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={4000}
        />
      </div>
    );
  },
};

export const SettingsUpdated: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
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
          Update Settings
        </button>

        <SystemToast
          variant="success"
          message="Settings updated"
          description="Your preferences have been saved."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={3000}
        />
      </div>
    );
  },
};

export const ValidationWarning: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            background: '#b58900',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Submit Form
        </button>

        <SystemToast
          variant="warning"
          message="Please check your input"
          description="Email field is required and must be valid."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      </div>
    );
  },
};

export const SystemInfo: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
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
          Check for Updates
        </button>

        <SystemToast
          variant="info"
          message="New update available"
          description="Version 2.0.0 is ready to install. Click to learn more."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={8000}
        />
      </div>
    );
  },
};

// ============================================================================
// Multiple Toasts (Stacking)
// ============================================================================

export const MultipleToasts: Story = {
  render: () => {
    const [toasts, setToasts] = React.useState<Array<{ id: string; variant: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

    const addToast = (variant: 'success' | 'error' | 'warning' | 'info', message: string) => {
      const id = Math.random().toString(36).substring(7);
      setToasts(prev => [...prev, { id, variant, message }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    return (
      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Trigger Multiple Toasts</h3>

          <button
            onClick={() => addToast('success', 'Operation successful')}
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
            Add Success Toast
          </button>

          <button
            onClick={() => addToast('error', 'An error occurred')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              background: '#dc322f',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Add Error Toast
          </button>

          <button
            onClick={() => addToast('warning', 'Please be careful')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              background: '#b58900',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Add Warning Toast
          </button>

          <button
            onClick={() => addToast('info', 'Just so you know')}
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
            Add Info Toast
          </button>
        </div>

        <div style={{ position: 'fixed', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 50 }}>
          {toasts.map(toast => (
            <SystemToast
              key={toast.id}
              variant={toast.variant}
              message={toast.message}
              show
              duration={0}
              onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            />
          ))}
        </div>
      </div>
    );
  },
};

// ============================================================================
// Duration Examples
// ============================================================================

export const QuickDismiss: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
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
          Show Quick Toast (2s)
        </button>

        <SystemToast
          variant="info"
          message="Quick notification"
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      </div>
    );
  },
};

export const LongDuration: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => {
            setShowToast(false);
            setTimeout(() => setShowToast(true), 100);
          }}
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
          Show Long Toast (10s)
        </button>

        <SystemToast
          variant="info"
          message="Important information"
          description="This toast will stay visible for 10 seconds to give you time to read."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={10000}
        />
      </div>
    );
  },
};

export const NeverAutoDismiss: Story = {
  render: () => {
    const [showToast, setShowToast] = React.useState(false);

    return (
      <div style={{ padding: '40px' }}>
        <button
          onClick={() => setShowToast(!showToast)}
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
          {showToast ? 'Hide' : 'Show'} Persistent Toast
        </button>

        <SystemToast
          variant="warning"
          message="Action required"
          description="This toast will not auto-dismiss. You must manually close it."
          show={showToast}
          onClose={() => setShowToast(false)}
          duration={0}
        />
      </div>
    );
  },
};

// ============================================================================
// Form Workflow Example
// ============================================================================

export const FormWorkflow: Story = {
  render: () => {
    const [toast, setToast] = React.useState<{ show: boolean; variant: 'success' | 'error' | 'info'; message: string; description?: string }>({
      show: false,
      variant: 'info',
      message: '',
    });

    const handleSubmit = () => {
      // Simulate form validation
      const isValid = Math.random() > 0.5;

      if (isValid) {
        setToast({
          show: false,
          variant: 'success',
          message: 'Form submitted successfully',
          description: 'Thank you for your submission!',
        });
        setTimeout(() => setToast(prev => ({ ...prev, show: true })), 100);
      } else {
        setToast({
          show: false,
          variant: 'error',
          message: 'Submission failed',
          description: 'Please check your input and try again.',
        });
        setTimeout(() => setToast(prev => ({ ...prev, show: true })), 100);
      }
    };

    return (
      <div style={{ padding: '40px', maxWidth: '500px' }}>
        <h3 style={{ margin: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
          Contact Form
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            placeholder="Name"
            style={{
              padding: '10px 12px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              color: 'inherit',
              fontSize: '14px',
            }}
          />

          <input
            type="email"
            placeholder="Email"
            style={{
              padding: '10px 12px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              color: 'inherit',
              fontSize: '14px',
            }}
          />

          <textarea
            rows={4}
            placeholder="Message"
            style={{
              padding: '10px 12px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              color: 'inherit',
              fontSize: '14px',
              fontFamily: 'inherit',
            }}
          />

          <button
            onClick={handleSubmit}
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
            Submit Form (Random Success/Error)
          </button>
        </div>

        <SystemToast
          variant={toast.variant}
          message={toast.message}
          description={toast.description}
          show={toast.show}
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          duration={5000}
        />
      </div>
    );
  },
};
