import type { Meta, StoryObj } from '@storybook/nextjs';
import SystemInput from './SystemInput';
import { Search, Mail, Lock, User, Eye, EyeOff, Calendar, DollarSign, Phone } from 'lucide-react';
import React from 'react';

const meta: Meta<typeof SystemInput> = {
  title: 'System/SystemInput',
  component: SystemInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `Design system input component for form fields with consistent styling.

**Features**:
- 3 sizes (sm, base, lg)
- 3 variants (default, error, success)
- Optional label and helper text
- Error message support
- Icon support (left side)
- Focus states with border and glow
- Disabled state
- Full width option
- forwardRef support for form libraries

**Sizes**:
- **sm** - 32px height (compact forms)
- **base** - 40px height (default, most common)
- **lg** - 48px height (prominent fields)

**Variants**:
- **default** - Standard input with cyan focus
- **error** - Red border for validation errors
- **success** - Green border for valid input

**Use Cases**:
- Form fields
- Search inputs
- Login forms
- Settings inputs
- Filter inputs
- Data entry`,
      },
    },
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'base', 'lg'],
      description: 'Input size',
    },
    variant: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: 'Input variant',
    },
    label: {
      control: 'text',
      description: 'Label text above input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'text',
      description: 'Error message (overrides variant)',
    },
    helperText: {
      control: 'text',
      description: 'Helper text below input',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make input full width',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SystemInput>;

// ============================================================================
// Basic Variants
// ============================================================================

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    helperText: 'We\'ll never share your email with anyone else.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    error: 'Password must be at least 8 characters',
    defaultValue: 'short',
  },
};

export const Success: Story = {
  args: {
    label: 'Username',
    variant: 'success',
    defaultValue: 'john_doe',
    helperText: 'Username is available!',
  },
};

// ============================================================================
// Sizes
// ============================================================================

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Base: Story = {
  args: {
    size: 'base',
    placeholder: 'Base input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

// ============================================================================
// With Icons
// ============================================================================

export const WithIconSearch: Story = {
  args: {
    placeholder: 'Search...',
    icon: <Search size={18} />,
  },
};

export const WithIconEmail: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    icon: <Mail size={18} />,
    type: 'email',
  },
};

export const WithIconPassword: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    icon: <Lock size={18} />,
    type: 'password',
  },
};

export const WithIconUser: Story = {
  args: {
    label: 'Username',
    placeholder: 'Choose a username',
    icon: <User size={18} />,
  },
};

// ============================================================================
// States
// ============================================================================

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
    defaultValue: 'Disabled value',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'This input spans the full width',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    defaultValue: 'This value cannot be changed',
    readOnly: true,
  },
};

// ============================================================================
// Input Types
// ============================================================================

export const EmailInput: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    icon: <Mail size={18} />,
    helperText: 'Enter a valid email address',
  },
};

export const PasswordInput: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    icon: <Lock size={18} />,
    helperText: 'Minimum 8 characters',
  },
};

export const NumberInput: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: '0',
    min: 0,
    max: 120,
  },
};

export const DateInput: Story = {
  args: {
    label: 'Date of Birth',
    type: 'date',
    icon: <Calendar size={18} />,
  },
};

export const TelInput: Story = {
  args: {
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    icon: <Phone size={18} />,
  },
};

// ============================================================================
// All Sizes Together
// ============================================================================

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '300px' }}>
      <SystemInput size="sm" placeholder="Small (32px)" />
      <SystemInput size="base" placeholder="Base (40px)" />
      <SystemInput size="lg" placeholder="Large (48px)" />
    </div>
  ),
};

// ============================================================================
// Form Examples
// ============================================================================

export const LoginForm: Story = {
  render: () => (
    <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0, marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
        Sign In
      </h2>
      <SystemInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail size={18} />}
        fullWidth
      />
      <SystemInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={<Lock size={18} />}
        fullWidth
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input type="checkbox" />
          Remember me
        </label>
        <a href="#" style={{ color: '#268bd2' }}>Forgot password?</a>
      </div>
      <button style={{
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        background: '#268bd2',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '16px'
      }}>
        Sign In
      </button>
    </div>
  ),
};

export const RegistrationForm: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0, marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
        Create Account
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <SystemInput
          label="First Name"
          placeholder="John"
          icon={<User size={18} />}
        />
        <SystemInput
          label="Last Name"
          placeholder="Doe"
          icon={<User size={18} />}
        />
      </div>
      <SystemInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail size={18} />}
        fullWidth
      />
      <SystemInput
        label="Password"
        type="password"
        placeholder="Minimum 8 characters"
        icon={<Lock size={18} />}
        fullWidth
        helperText="Use a mix of letters, numbers, and symbols"
      />
      <SystemInput
        label="Confirm Password"
        type="password"
        placeholder="Re-enter password"
        icon={<Lock size={18} />}
        fullWidth
      />
      <button style={{
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        background: '#859900',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '16px'
      }}>
        Create Account
      </button>
    </div>
  ),
};

export const PaymentForm: Story = {
  render: () => (
    <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '20px', fontWeight: '600' }}>
        Payment Information
      </h3>
      <SystemInput
        label="Card Number"
        placeholder="1234 5678 9012 3456"
        icon={<DollarSign size={18} />}
        fullWidth
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <SystemInput
          label="Expiry Month"
          placeholder="MM"
          maxLength={2}
        />
        <SystemInput
          label="Expiry Year"
          placeholder="YY"
          maxLength={2}
        />
        <SystemInput
          label="CVV"
          placeholder="123"
          maxLength={3}
          type="password"
        />
      </div>
      <SystemInput
        label="Cardholder Name"
        placeholder="John Doe"
        icon={<User size={18} />}
        fullWidth
      />
    </div>
  ),
};

export const SearchForm: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <SystemInput
        placeholder="Search for anything..."
        icon={<Search size={20} />}
        size="lg"
        fullWidth
      />
    </div>
  ),
};

// ============================================================================
// Validation States
// ============================================================================

export const ValidationStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '350px' }}>
      <SystemInput
        label="Valid Input"
        variant="success"
        defaultValue="john_doe"
        helperText="This username is available!"
        icon={<User size={18} />}
      />
      <SystemInput
        label="Invalid Input"
        error="This email is already taken"
        defaultValue="taken@example.com"
        icon={<Mail size={18} />}
      />
      <SystemInput
        label="Default Input"
        placeholder="Start typing..."
        helperText="Enter at least 3 characters"
        icon={<Search size={18} />}
      />
    </div>
  ),
};

// ============================================================================
// Interactive Examples
// ============================================================================

export const PasswordToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div style={{ maxWidth: '350px', position: 'relative' }}>
        <SystemInput
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password"
          icon={<Lock size={18} />}
          helperText="Click the eye icon to toggle visibility"
          fullWidth
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '38px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7
          }}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
};

export const LiveValidation: Story = {
  render: () => {
    const [email, setEmail] = React.useState('');
    const [isValid, setIsValid] = React.useState<boolean | null>(null);

    const validateEmail = (value: string) => {
      if (value === '') {
        setIsValid(null);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsValid(emailRegex.test(value));
    };

    return (
      <div style={{ maxWidth: '400px' }}>
        <SystemInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          variant={isValid === null ? 'default' : isValid ? 'success' : 'error'}
          error={isValid === false ? 'Please enter a valid email address' : undefined}
          helperText={isValid === true ? 'Valid email format!' : undefined}
          fullWidth
        />
      </div>
    );
  },
};

export const CharacterCounter: Story = {
  render: () => {
    const [text, setText] = React.useState('');
    const maxLength = 50;
    const remaining = maxLength - text.length;
    const isNearLimit = remaining <= 10;

    return (
      <div style={{ maxWidth: '400px' }}>
        <SystemInput
          label="Bio"
          placeholder="Tell us about yourself..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, maxLength))}
          maxLength={maxLength}
          variant={isNearLimit && remaining > 0 ? 'default' : remaining === 0 ? 'error' : 'default'}
          helperText={`${remaining} characters remaining`}
          fullWidth
        />
      </div>
    );
  },
};

export const AutoFocusExample: Story = {
  args: {
    label: 'Auto-focused Input',
    placeholder: 'This input is automatically focused',
    autoFocus: true,
    helperText: 'This input received focus when the page loaded',
  },
};

// ============================================================================
// Settings Form Example
// ============================================================================

export const SettingsForm: Story = {
  render: () => (
    <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
          Profile Settings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SystemInput
            label="Display Name"
            placeholder="Your name"
            icon={<User size={18} />}
            defaultValue="John Doe"
            fullWidth
          />
          <SystemInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} />}
            defaultValue="john@example.com"
            fullWidth
            helperText="Email verification required for changes"
          />
          <SystemInput
            label="Phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            icon={<Phone size={18} />}
            fullWidth
          />
        </div>
      </div>

      <div>
        <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
          Security
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SystemInput
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            icon={<Lock size={18} />}
            fullWidth
          />
          <SystemInput
            label="New Password"
            type="password"
            placeholder="Enter new password"
            icon={<Lock size={18} />}
            fullWidth
            helperText="Minimum 8 characters with letters and numbers"
          />
          <SystemInput
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            icon={<Lock size={18} />}
            fullWidth
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button style={{
          padding: '10px 20px',
          border: '1px solid currentColor',
          borderRadius: '8px',
          background: 'transparent',
          cursor: 'pointer'
        }}>
          Cancel
        </button>
        <button style={{
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          background: '#268bd2',
          color: 'white',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Save Changes
        </button>
      </div>
    </div>
  ),
};
