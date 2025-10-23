# System Component Library

Solarized-themed UI component library following the 4px grid design system.

## Overview

This component library provides a consistent, accessible, and beautiful set of UI components for the Proxy Agent Platform. All components follow the Solarized dark theme with precise 4px grid spacing.

## Design Principles

- **4px Grid System**: All spacing, sizing, and layout uses multiples of 4px
- **Solarized Color Palette**: Dark theme optimized for ADHD-friendly low contrast
- **Mobile-First**: Touch-optimized with large tap targets
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Lightweight with minimal dependencies

## Components

### SystemButton

Multi-variant button component with loading states and icons.

```tsx
import { SystemButton } from '@/components/system';

<SystemButton variant="primary" size="base">
  Click Me
</SystemButton>

<SystemButton variant="success" size="lg" isLoading>
  Processing...
</SystemButton>

<SystemButton variant="ghost" size="sm" icon={<Icon />}>
  With Icon
</SystemButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost'
- `size`: 'sm' | 'base' | 'lg'
- `isLoading`: boolean
- `fullWidth`: boolean
- `icon`: React.ReactNode

### SystemInput

Form input with label, error states, and icons.

```tsx
import { SystemInput } from '@/components/system';

<SystemInput
  label="Email"
  placeholder="Enter your email"
  type="email"
  error="Invalid email"
/>

<SystemInput
  icon={<SearchIcon />}
  placeholder="Search..."
/>
```

**Props:**
- `size`: 'sm' | 'base' | 'lg'
- `variant`: 'default' | 'error' | 'success'
- `label`: string
- `error`: string
- `helperText`: string
- `icon`: React.ReactNode
- `fullWidth`: boolean

### SystemCard

Content container with variants for different elevation levels.

```tsx
import { SystemCard } from '@/components/system';

<SystemCard variant="elevated" padding="base">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</SystemCard>

<SystemCard
  variant="outlined"
  header={<h3>Header</h3>}
  footer={<button>Action</button>}
  hoverable
>
  Content
</SystemCard>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'ghost'
- `padding`: 'none' | 'sm' | 'base' | 'lg'
- `header`: React.ReactNode
- `footer`: React.ReactNode
- `hoverable`: boolean

### SystemBadge

Status indicator and label component.

```tsx
import { SystemBadge } from '@/components/system';

<SystemBadge variant="success">Active</SystemBadge>
<SystemBadge variant="warning" size="sm" dot>
  Pending
</SystemBadge>
<SystemBadge variant="error" icon={<AlertIcon />}>
  Error
</SystemBadge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
- `size`: 'sm' | 'base' | 'lg'
- `icon`: React.ReactNode
- `dot`: boolean

### SystemToast

Toast notification system with context provider.

```tsx
import { ToastProvider, useToast } from '@/components/system';

// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const { showToast } = useToast();

  const handleClick = () => {
    showToast({
      variant: 'success',
      message: 'Task completed!',
      description: 'You earned 50 XP',
      duration: 3000
    });
  };
}
```

**Props:**
- `variant`: 'success' | 'error' | 'warning' | 'info'
- `message`: string
- `description`: string
- `duration`: number (milliseconds)

### SystemModal

Modal dialog component with customizable size.

```tsx
import { SystemModal } from '@/components/system';

<SystemModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="base"
  footer={
    <>
      <SystemButton onClick={handleCancel}>Cancel</SystemButton>
      <SystemButton variant="primary" onClick={handleConfirm}>
        Confirm
      </SystemButton>
    </>
  }
>
  <p>Are you sure you want to do this?</p>
</SystemModal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'base' | 'lg' | 'xl' | 'full'
- `footer`: React.ReactNode
- `closeOnOverlayClick`: boolean
- `showCloseButton`: boolean

## Color Palette

### Solarized Colors

```typescript
{
  base03: '#002b36', // Background
  base02: '#073642', // Background highlights
  base01: '#586e75', // Optional emphasized content
  base00: '#657b83', // Body text / default code
  base0: '#839496',  // Body text
  base1: '#93a1a1',  // Optional emphasized content
  base2: '#eee8d5',  // Background highlights (light)
  base3: '#fdf6e3',  // Background (light)

  // Accent colors
  yellow: '#b58900',
  orange: '#cb4b16',
  red: '#dc322f',
  magenta: '#d33682',
  violet: '#6c71c4',
  blue: '#268bd2',
  cyan: '#2aa198',
  green: '#859900'
}
```

## Usage Best Practices

1. **Spacing**: Always use `spacing` from design-system for margins and padding
2. **Typography**: Use `fontSize` constants for consistent text sizing
3. **Colors**: Use semantic color mappings (`semanticColors`) instead of raw colors
4. **Responsive**: All components are mobile-first and touch-optimized
5. **Accessibility**: Include labels, ARIA attributes, and keyboard navigation

## Examples

### Form with System Components

```tsx
import { SystemInput, SystemButton, SystemCard } from '@/components/system';

function LoginForm() {
  return (
    <SystemCard variant="elevated" padding="lg">
      <SystemInput
        label="Email"
        type="email"
        placeholder="Enter your email"
        fullWidth
      />
      <SystemInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        fullWidth
      />
      <SystemButton variant="primary" fullWidth>
        Sign In
      </SystemButton>
    </SystemCard>
  );
}
```

### Status Dashboard

```tsx
import { SystemBadge, SystemCard } from '@/components/system';

function StatusDashboard({ tasks }) {
  return (
    <SystemCard>
      {tasks.map(task => (
        <div key={task.id}>
          <h4>{task.title}</h4>
          <SystemBadge
            variant={task.priority === 'high' ? 'error' : 'info'}
            size="sm"
          >
            {task.status}
          </SystemBadge>
        </div>
      ))}
    </SystemCard>
  );
}
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 13+, Android 8+

## Contributing

When adding new components:
1. Follow the existing component structure
2. Use TypeScript for type safety
3. Follow the 4px grid system
4. Include proper documentation
5. Add examples to this README
