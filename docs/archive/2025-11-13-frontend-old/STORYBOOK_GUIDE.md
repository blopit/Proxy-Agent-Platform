# Storybook Development Guide

Complete guide to using Storybook for component development, testing, and documentation.

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Writing Stories](#writing-stories)
4. [Theme System](#theme-system)
5. [Interactive Stories](#interactive-stories)
6. [Accessibility Testing](#accessibility-testing)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### What is Storybook?

Storybook is a tool for developing UI components in isolation. It allows you to:
- Build components independently
- Test different states and variations
- Document component APIs
- Share components with team members
- Test accessibility
- Visualize components across themes

### Current Setup

- **Version:** Storybook 9.1.15
- **Framework:** Next.js 15 integration
- **Addons:**
  - `@storybook/addon-essentials` - Core features (controls, actions, docs)
  - `@storybook/addon-a11y` - Accessibility testing
- **Stories:** 28+ stories created
- **Themes:** 20+ color themes available

### Running Storybook

```bash
# Start development server
npm run storybook
# Opens at http://localhost:6006

# Build for production
npm run build-storybook
# Output: storybook-static/
```

---

## Getting Started

### Storybook UI Overview

When you open Storybook, you'll see:

1. **Sidebar** (left) - Component tree navigation
2. **Canvas** - Component preview
3. **Toolbar** (top) - Theme switcher, viewport selector, accessibility checker
4. **Addons Panel** (bottom) - Controls, Actions, Accessibility, etc.

### Navigating Stories

Stories are organized by category:

```
Mobile/
  ├── BiologicalTabs
  ├── ChevronButton
  ├── ChevronStep
  ├── CaptureModal
  ├── ConnectionElement
  └── [other mobile components]

Shared/
  ├── AsyncJobTimeline
  ├── TaskCheckbox
  └── [other shared components]

Dashboard/
  └── StatsCard

Tasks/
  ├── QuickCapture
  └── TaskList

Modes/
  ├── CaptureMode
  ├── HunterMode
  └── AddMode
```

### Viewport Selector

Switch between device sizes:
- **Mobile** - 375x667px (iPhone)
- **Tablet** - 768x1024px (iPad)
- **Desktop** - 1440x900px
- **Wide Desktop** - 1920x1080px

---

## Writing Stories

### File Location

Stories live next to their components:

```
src/components/mobile/
  ├── ChevronButton.tsx
  └── ChevronButton.stories.tsx
```

### Basic Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import MyComponent from './MyComponent'

/**
 * Meta configuration defines component metadata
 */
const meta: Meta<typeof MyComponent> = {
  // Category/Name in sidebar
  title: 'Mobile/MyComponent',

  // Component to render
  component: MyComponent,

  // Layout mode
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
  },

  // Enable auto-generated docs
  tags: ['autodocs'],

  // Control types for props
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual variant of the component'
    },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large']
    },
    disabled: {
      control: 'boolean'
    },
    onClick: {
      action: 'clicked' // Logs to Actions panel
    }
  }
}

export default meta
type Story = StoryObj<typeof MyComponent>

/**
 * Default/Primary story
 */
export const Default: Story = {
  args: {
    title: 'Hello World',
    variant: 'primary',
    size: 'medium'
  }
}

/**
 * Additional stories for variations
 */
export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: 'secondary'
  }
}

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true
  }
}

export const WithLongText: Story = {
  args: {
    title: 'This is a very long title that might wrap to multiple lines and test how the component handles overflow'
  }
}
```

### Advanced Story: Custom Render

For stories that need state or complex setup:

```typescript
export const Interactive: Story = {
  render: (args) => {
    const [count, setCount] = React.useState(0)

    return (
      <MyComponent
        {...args}
        title={`Clicked ${count} times`}
        onClick={() => setCount(c => c + 1)}
      />
    )
  }
}

export const WithMultipleComponents: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <MyComponent title="First" variant="primary" />
      <MyComponent title="Second" variant="secondary" />
      <MyComponent title="Third" variant="tertiary" />
    </div>
  )
}
```

### Story with Decorators

Decorators wrap stories with additional markup:

```typescript
export const InContainer: Story = {
  decorators: [
    (Story) => (
      <div style={{
        padding: '40px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <Story />
      </div>
    )
  ],
  args: {
    title: 'In a container'
  }
}
```

### Parameters

Parameters control Storybook behavior:

```typescript
export const FullScreenView: Story = {
  parameters: {
    layout: 'fullscreen', // Remove padding
    viewport: {
      defaultViewport: 'mobile' // Force mobile viewport
    },
    backgrounds: {
      default: 'dark' // Set background color
    }
  },
  args: {
    title: 'Full screen component'
  }
}
```

---

## Theme System

### Available Themes

The project includes **20+ color themes**:

#### Classic Developer Themes
- **Solarized Light** ☀️ - Warm, low-contrast light theme
- **Solarized Dark** 🌙 - Cool, low-contrast dark theme
- **Dracula** 🧛 - Purple-heavy dark theme
- **Nord Light** ☀️ - Arctic-inspired light theme
- **Nord Dark** 🌙 - Arctic-inspired dark theme
- **Gruvbox Light** ☀️ - Retro warm light theme
- **Gruvbox Dark** 🌙 - Retro warm dark theme
- **Tokyo Night** 🌃 - Deep blue night theme
- **Monokai** 🎨 - Vibrant syntax highlighting theme
- **One Dark** 🌙 - Atom's iconic dark theme
- **Catppuccin Latte** ☕ - Pastel light theme
- **Catppuccin Mocha** ☕ - Pastel dark theme
- **Material Light** ☀️ - Google Material light
- **Material Dark** 🌙 - Google Material dark

#### Creative Themes
- **Jungle** 🌿 - Deep forest greens
- **Oceanic** 🌊 - Deep sea blues
- **Sunset** 🌅 - Warm orange/purple gradient
- **Aurora** 🌌 - Northern lights inspired
- **Synthwave '84** 🕶️ - Retro neon pink/purple
- **Nightfox** 🦊 - Soft dark with orange accents
- **Cyberpunk** 🤖 - Neon cyan/magenta

### Switching Themes

Use the **Theme** dropdown in the Storybook toolbar to switch between themes.

### Theme Integration

Themes are automatically applied via the `ThemeProvider`:

```typescript
// .storybook/preview.ts
const withTheme: Decorator = (Story, context) => {
  const [{ theme }] = useGlobals()
  const selectedTheme = themes[theme as ThemeKey] || themes.solarizedLight

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--background-color', selectedTheme.backgroundColor)
    root.style.setProperty('--text-color', selectedTheme.textColor)
    // ... more CSS variables
  }, [theme, selectedTheme])

  // Wrap story in ThemeProvider
  return (
    <ThemeProvider mode={theme.includes('dark') ? 'dark' : 'light'}>
      <Story />
    </ThemeProvider>
  )
}
```

### Using Theme in Stories

Components automatically receive theme via context:

```typescript
import { useTheme } from '@/contexts/ThemeContext'

export default function MyComponent() {
  const { mode, colors } = useTheme()

  return (
    <div style={{
      backgroundColor: colors.background,
      color: colors.text
    }}>
      Current theme: {mode}
    </div>
  )
}
```

### Testing All Themes

To ensure your component works with all themes:

1. Open your story in Storybook
2. Switch through different themes using the toolbar
3. Check for:
   - Text readability (contrast)
   - Border visibility
   - Hover states
   - Focus indicators

---

## Interactive Stories

### Controls Panel

The Controls panel allows you to change props in real-time.

**Control Types:**

```typescript
argTypes: {
  // Text input
  title: {
    control: 'text'
  },

  // Number slider
  count: {
    control: { type: 'range', min: 0, max: 100, step: 1 }
  },

  // Boolean checkbox
  disabled: {
    control: 'boolean'
  },

  // Select dropdown
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'tertiary']
  },

  // Radio buttons
  size: {
    control: 'radio',
    options: ['small', 'medium', 'large']
  },

  // Color picker
  backgroundColor: {
    control: 'color'
  },

  // Date picker
  createdAt: {
    control: 'date'
  },

  // Object editor
  config: {
    control: 'object'
  }
}
```

### Actions Panel

Log events to the Actions panel:

```typescript
argTypes: {
  onClick: { action: 'clicked' },
  onSubmit: { action: 'submitted' },
  onHover: { action: 'hovered' }
}

// In your component
<button onClick={onClick}>
  Click me
</button>
// Clicking will log to Actions panel
```

### Play Function (User Interactions)

Simulate user interactions:

```typescript
import { within, userEvent } from '@storybook/testing-library'

export const ClickInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find button and click it
    const button = await canvas.getByRole('button', { name: /click me/i })
    await userEvent.click(button)

    // Type in input
    const input = await canvas.getByRole('textbox')
    await userEvent.type(input, 'Hello World')
  }
}
```

---

## Accessibility Testing

### A11y Addon

The `@storybook/addon-a11y` addon automatically checks for accessibility issues.

**What it checks:**
- Color contrast (WCAG AA/AAA)
- ARIA labels and roles
- Keyboard navigation
- Focus indicators
- Alt text on images
- Form labels
- Heading hierarchy

### Viewing A11y Results

1. Open a story
2. Click the **Accessibility** tab in the bottom panel
3. Review violations, passes, and incomplete checks

### Common A11y Violations

#### 1. Low Color Contrast

```typescript
// ❌ BAD: Low contrast
<div style={{
  backgroundColor: '#ccc',
  color: '#ddd'
}}>
  Hard to read
</div>

// ✅ GOOD: High contrast
<div style={{
  backgroundColor: semanticColors.bg.primary,
  color: semanticColors.text.primary
}}>
  Easy to read
</div>
```

#### 2. Missing ARIA Labels

```typescript
// ❌ BAD: No label
<button onClick={handleClose}>
  <XIcon />
</button>

// ✅ GOOD: ARIA label
<button
  onClick={handleClose}
  aria-label="Close modal"
>
  <XIcon aria-hidden="true" />
</button>
```

#### 3. Missing Alt Text

```typescript
// ❌ BAD: No alt text
<img src="/avatar.png" />

// ✅ GOOD: Descriptive alt
<img src="/avatar.png" alt="User profile picture" />
```

### Testing Keyboard Navigation

Use the **Keyboard** shortcuts:

- `Tab` - Navigate forward
- `Shift + Tab` - Navigate backward
- `Enter` / `Space` - Activate button/link
- `Escape` - Close modal/dropdown
- `Arrow keys` - Navigate lists/menus

**Check that:**
- All interactive elements are focusable
- Focus order is logical
- Focus indicator is visible
- Keyboard shortcuts work

---

## Best Practices

### 1. Write Stories for All Variations

```typescript
// ✅ GOOD: Cover all variants
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Tertiary: Story = { args: { variant: 'tertiary' } }

export const SmallSize: Story = { args: { size: 'small' } }
export const MediumSize: Story = { args: { size: 'medium' } }
export const LargeSize: Story = { args: { size: 'large' } }
```

### 2. Include Edge Cases

```typescript
export const EmptyState: Story = {
  args: { items: [] }
}

export const LoadingState: Story = {
  args: { isLoading: true }
}

export const ErrorState: Story = {
  args: { error: 'Something went wrong' }
}

export const LongContent: Story = {
  args: {
    title: 'This is a very long title that should test how the component handles overflow and wrapping behavior'
  }
}
```

### 3. Document Component APIs

Use JSDoc comments in your component:

```typescript
interface ComponentProps {
  /**
   * The main title to display
   */
  title: string

  /**
   * Visual variant of the component
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'tertiary'

  /**
   * Callback when button is clicked
   */
  onClick?: () => void
}
```

These will appear in the **Docs** tab automatically.

### 4. Use Consistent Naming

```typescript
// ✅ GOOD: Descriptive names
export const WithLongTitle: Story = { ... }
export const DisabledState: Story = { ... }
export const LoadingWithError: Story = { ... }

// ❌ BAD: Generic names
export const Story1: Story = { ... }
export const Test: Story = { ... }
```

### 5. Group Related Stories

```typescript
const meta: Meta<typeof MyComponent> = {
  title: 'Mobile/MyComponent', // Category/Component
  // ...
}

// All MyComponent stories will be grouped under Mobile > MyComponent
```

### 6. Add Examples for Complex Props

```typescript
export const WithComplexConfig: Story = {
  args: {
    config: {
      theme: 'dark',
      animations: true,
      layout: 'grid',
      columns: 3
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Example of a complex configuration object'
      }
    }
  }
}
```

---

## Troubleshooting

### Issue: Storybook won't start

**Error:** `Cannot find module '@storybook/...'`

**Fix:**
```bash
rm -rf node_modules
npm install
npm run storybook
```

### Issue: Stories not appearing

**Check:**
1. File is named `*.stories.tsx`
2. File is in `src/` directory
3. Story is exported: `export const MyStory: Story = { ... }`
4. Meta is exported: `export default meta`

### Issue: Theme not working

**Check:**
1. Component uses `useTheme()` hook or design system tokens
2. ThemeProvider is wrapping the story (should be automatic)
3. CSS variables are defined in `.storybook/preview.ts`

### Issue: Controls not showing

**Check:**
1. ArgTypes are defined in meta
2. Component props have TypeScript types
3. Story uses `args` property

**Example:**
```typescript
const meta: Meta<typeof MyComponent> = {
  argTypes: {
    title: { control: 'text' }
  }
}

export const Default: Story = {
  args: {
    title: 'Hello'
  }
}
```

### Issue: Actions not logging

**Check:**
1. Action is defined in argTypes: `onClick: { action: 'clicked' }`
2. Component receives and calls the prop: `onClick?.()`

### Issue: Build failing

**Error:** Webpack errors or React errors

**Fix:**
```bash
# Clear cache
rm -rf .storybook-cache
rm -rf storybook-static

# Rebuild
npm run build-storybook
```

### Issue: Slow performance

**Causes:**
- Too many stories loaded at once
- Complex components re-rendering
- Large data in args

**Fixes:**
- Use lazy loading for heavy components
- Memoize expensive calculations
- Reduce default data size in args

---

## Advanced Features

### Custom Decorators

Create reusable wrappers for stories:

```typescript
// .storybook/preview.ts
export const decorators = [
  (Story) => (
    <div style={{ margin: '3em' }}>
      <Story />
    </div>
  )
]

// Component-specific decorator
const meta: Meta<typeof MyComponent> = {
  decorators: [
    (Story) => (
      <div className="custom-wrapper">
        <Story />
      </div>
    )
  ]
}
```

### Global Parameters

```typescript
// .storybook/preview.ts
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'centered',
  viewport: {
    defaultViewport: 'desktop'
  }
}
```

### Story-Specific Parameters

```typescript
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile'
    },
    layout: 'fullscreen'
  }
}
```

---

## Useful Links

- [Storybook Documentation](https://storybook.js.org/docs)
- [Next.js Integration](https://storybook.js.org/docs/react/get-started/install)
- [Accessibility Addon](https://storybook.js.org/addons/@storybook/addon-a11y)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Controls](https://storybook.js.org/docs/react/essentials/controls)

---

**Last Updated:** October 28, 2025
