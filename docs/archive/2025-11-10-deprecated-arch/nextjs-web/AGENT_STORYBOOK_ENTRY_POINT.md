# Agent Entry Point: Storybook Component Development

**🤖 FOR AI AGENTS & AUTOMATED SYSTEMS**

This guide enables AI agents (like Claude) to autonomously create, test, and iterate on UI components using Storybook.

---

## 🎯 Mission

Enable AI agents to:
1. **Create** new components following design system
2. **Generate** Storybook stories for all variants
3. **Test** components across 20+ themes
4. **Iterate** based on visual feedback
5. **Document** components automatically

---

## 🚀 Quick Start for Agents

### Step 1: Understand the System

**Design System Location:** `frontend/src/lib/design-system.ts`
- All design values (spacing, colors, typography) are tokens
- **NEVER hardcode values** - always import from design-system.ts

**Component Template:** `frontend/src/components/_TEMPLATE.tsx`
- Copy this for new components
- Already includes proper structure

**Storybook Config:** `frontend/.storybook/`
- 20+ themes available
- Automatic theme switching
- Accessibility testing built-in

### Step 2: Create Component

```typescript
// 1. Copy template
// frontend/src/components/[category]/MyComponent.tsx

'use client'

import React from 'react'
import {
  spacing,
  semanticColors,
  fontSize,
  borderRadius,
  shadow,
  duration
} from '@/lib/design-system'

interface MyComponentProps {
  /** Component title */
  title: string
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary'
  /** Click handler */
  onClick?: () => void
}

/**
 * MyComponent - Brief description
 *
 * @example
 * <MyComponent title="Hello" variant="primary" />
 */
export default function MyComponent({
  title,
  variant = 'primary',
  onClick
}: MyComponentProps) {
  const variantColors = {
    primary: semanticColors.accent.primary,
    secondary: semanticColors.accent.secondary,
    tertiary: semanticColors.text.secondary
  }

  return (
    <div
      onClick={onClick}
      style={{
        padding: spacing[4],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        boxShadow: shadow.md,
        border: `2px solid ${variantColors[variant]}`,
        transition: `all ${duration.normal}`,
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <h3 style={{
        fontSize: fontSize.lg,
        color: semanticColors.text.primary,
        margin: 0
      }}>
        {title}
      </h3>
    </div>
  )
}
```

### Step 3: Create Storybook Story

```typescript
// frontend/src/components/[category]/MyComponent.stories.tsx

import type { Meta, StoryObj } from '@storybook/nextjs'
import MyComponent from './MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Components/[Category]/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Brief component description.

**Features**:
- Feature 1
- Feature 2

**Variants**:
- **primary** - Default variant
- **secondary** - Alternative variant
- **tertiary** - Muted variant`
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Visual variant'
    },
    onClick: {
      action: 'clicked'
    }
  }
}

export default meta
type Story = StoryObj<typeof MyComponent>

// Basic stories
export const Primary: Story = {
  args: {
    title: 'Primary Variant',
    variant: 'primary'
  }
}

export const Secondary: Story = {
  args: {
    title: 'Secondary Variant',
    variant: 'secondary'
  }
}

export const Tertiary: Story = {
  args: {
    title: 'Tertiary Variant',
    variant: 'tertiary'
  }
}

// Interactive story
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
```

### Step 4: Test in Storybook

```bash
# Start Storybook
cd frontend
npm run storybook

# Opens at http://localhost:6006
```

**Testing Checklist:**
- ✅ Component renders correctly
- ✅ All variants work
- ✅ Works across all 20+ themes
- ✅ No accessibility violations (check a11y panel)
- ✅ Responsive on mobile/tablet/desktop
- ✅ Interactive states work (hover, click, focus)

---

## 🎨 Design System Reference

### Critical Files

```
frontend/src/lib/design-system.ts  ← SINGLE SOURCE OF TRUTH
frontend/.storybook/themes.ts      ← 20+ color themes
frontend/src/components/_TEMPLATE.tsx  ← Component template
```

### Design Tokens Quick Reference

#### Spacing (4px grid)
```typescript
import { spacing } from '@/lib/design-system'

spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px ← Most common
spacing[6]  // 24px
spacing[8]  // 32px
```

#### Semantic Colors
```typescript
import { semanticColors } from '@/lib/design-system'

// Backgrounds
semanticColors.bg.primary       // Main background
semanticColors.bg.secondary     // Secondary background
semanticColors.bg.tertiary      // Tertiary background
semanticColors.bg.hover         // Hover state

// Text
semanticColors.text.primary     // Main text
semanticColors.text.secondary   // Secondary text
semanticColors.text.muted       // Muted text
semanticColors.text.inverse     // Inverse (on dark bg)

// Borders
semanticColors.border.default   // Default border
semanticColors.border.emphasis  // Emphasized border

// Accents
semanticColors.accent.primary   // Primary accent (blue)
semanticColors.accent.secondary // Secondary accent
semanticColors.accent.soft      // Soft accent

// Status
semanticColors.status.success   // Green
semanticColors.status.warning   // Yellow
semanticColors.status.error     // Red
semanticColors.status.info      // Cyan
```

#### Typography
```typescript
import { fontSize, fontWeight } from '@/lib/design-system'

fontSize.xs     // 12px - captions
fontSize.sm     // 14px - small text
fontSize.base   // 16px - body text
fontSize.lg     // 18px - headings
fontSize.xl     // 20px - large headings

fontWeight.normal   // 400
fontWeight.medium   // 500
fontWeight.semibold // 600
fontWeight.bold     // 700
```

#### Border Radius
```typescript
import { borderRadius } from '@/lib/design-system'

borderRadius.sm    // 4px
borderRadius.base  // 8px
borderRadius.md    // 12px
borderRadius.lg    // 16px ← Cards
borderRadius.xl    // 24px
borderRadius.pill  // 9999px ← Fully rounded
borderRadius.circle // 50%
```

#### Shadows
```typescript
import { shadow } from '@/lib/design-system'

shadow.sm  // Small
shadow.md  // Medium ← Cards
shadow.lg  // Large
shadow.xl  // Extra large
```

#### Animations
```typescript
import { duration, easing } from '@/lib/design-system'

duration.instant // 100ms
duration.fast    // 200ms
duration.normal  // 300ms ← Default
duration.slow    // 500ms

easing.easeIn
easing.easeOut
easing.easeInOut  ← Default
easing.spring

// Usage
transition: `all ${duration.normal} ${easing.easeInOut}`
```

---

## 🎨 Available Themes (20+)

Storybook has 20+ themes pre-configured. Components must work with ALL themes.

### Classic Developer Themes
- Solarized Light ☀️
- Solarized Dark 🌙
- Dracula 🧛
- Nord Light ☀️
- Nord Dark 🌙
- Gruvbox Light ☀️
- Gruvbox Dark 🌙
- Tokyo Night 🌃
- Monokai 🎨
- One Dark 🌙
- Catppuccin Latte ☕
- Catppuccin Mocha ☕
- Material Light ☀️
- Material Dark 🌙

### Creative Themes
- Jungle 🌿 - Deep forest greens
- Oceanic 🌊 - Deep sea blues
- Sunset 🌅 - Warm gradients
- Aurora 🌌 - Northern lights
- Synthwave '84 🕶️ - Retro neon
- Nightfox 🦊 - Soft dark blue
- Cyberpunk 🤖 - Neon dystopian

**Testing:** Switch themes in Storybook toolbar to verify compatibility.

---

## 📝 Component Categories

Organize components by category:

```
Components/
├── Mobile/               # Mobile-first components
│   ├── BiologicalTabs   # Mode tabs
│   ├── ChevronButton    # Chevron-shaped button
│   ├── CaptureModal     # Capture modal
│   ├── Cards/           # Card subcategory
│   └── Modes/           # Mode subcategory
│
├── Shared/              # Reusable components
│   ├── AsyncJobTimeline
│   ├── TaskCheckbox
│   └── ProgressBar
│
├── Dashboard/           # Dashboard components
│   └── StatsCard
│
├── Tasks/               # Task management
│   ├── QuickCapture
│   └── TaskList
│
└── System/              # Design system primitives
    ├── SystemButton
    ├── SystemCard
    └── SystemInput
```

---

## 🔄 Agent Workflow

### Workflow: Create New Component

```
1. Understand requirement
   ↓
2. Check if component exists
   - Search frontend/src/components/
   - Search Storybook
   ↓
3. Copy template
   - cp _TEMPLATE.tsx → MyComponent.tsx
   ↓
4. Import design tokens
   - import { spacing, semanticColors, ... } from '@/lib/design-system'
   ↓
5. Define TypeScript interface
   - Document all props with JSDoc
   ↓
6. Implement component
   - Use ONLY design tokens
   - No hardcoded values!
   ↓
7. Create story file
   - MyComponent.stories.tsx
   - Cover all variants
   - Include interactive examples
   ↓
8. Test in Storybook
   - npm run storybook
   - Test all themes
   - Check accessibility
   ↓
9. Verify quality
   - npm run type-check
   - npm run lint
   ↓
10. Document
    - Add JSDoc comments
    - Update story descriptions
```

### Workflow: Iterate on Existing Component

```
1. Find component
   - Search frontend/src/components/
   ↓
2. Find story
   - Find .stories.tsx file
   ↓
3. Open in Storybook
   - npm run storybook
   - Navigate to component
   ↓
4. Identify issues
   - Visual problems
   - Theme incompatibilities
   - Accessibility violations
   ↓
5. Make changes
   - Edit component file
   - Hot reload updates Storybook
   ↓
6. Test across themes
   - Switch themes in toolbar
   - Verify all work
   ↓
7. Test accessibility
   - Check a11y panel
   - Fix violations
   ↓
8. Update story if needed
   - Add new variants
   - Update descriptions
```

---

## ⚠️ Critical Rules for Agents

### The 10 Commandments

1. **NEVER hardcode design values**
   ```typescript
   // ❌ FORBIDDEN
   padding: '16px'
   color: '#002b36'

   // ✅ REQUIRED
   padding: spacing[4]
   color: semanticColors.bg.primary
   ```

2. **ALWAYS use TypeScript types**
   ```typescript
   // ❌ FORBIDDEN
   props: any

   // ✅ REQUIRED
   interface MyComponentProps {
     title: string
     variant?: 'primary' | 'secondary'
   }
   ```

3. **ALWAYS add JSDoc comments**
   ```typescript
   /**
    * MyComponent - Brief description
    *
    * @param props - Component props
    * @returns React component
    */
   ```

4. **ALWAYS create Storybook stories**
   - Every component needs a `.stories.tsx` file
   - Cover all variants
   - Include interactive examples

5. **ALWAYS test across ALL themes**
   - Switch themes in Storybook
   - Verify component works with all 20+ themes

6. **ALWAYS check accessibility**
   - Use a11y panel in Storybook
   - Fix all violations
   - Ensure keyboard navigation works

7. **ALWAYS use semantic HTML**
   ```typescript
   // ❌ FORBIDDEN
   <div onClick={handleClick}>Click me</div>

   // ✅ REQUIRED
   <button onClick={handleClick}>Click me</button>
   ```

8. **ALWAYS handle loading/error states**
   ```typescript
   if (isLoading) return <Spinner />
   if (error) return <Error message={error} />
   return <Content />
   ```

9. **ALWAYS clean up side effects**
   ```typescript
   useEffect(() => {
     const cleanup = subscribe()
     return () => cleanup()  // ALWAYS return cleanup
   }, [])
   ```

10. **ALWAYS run quality checks**
    ```bash
    npm run type-check  # Must pass
    npm run lint        # Must pass
    ```

---

## 🎨 Component Pattern Examples

### Example 1: Button Component

```typescript
import { spacing, semanticColors, fontSize, borderRadius, duration } from '@/lib/design-system'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick
}: ButtonProps) {
  const variantColors = {
    primary: {
      bg: semanticColors.accent.primary,
      text: semanticColors.text.inverse
    },
    secondary: {
      bg: semanticColors.bg.secondary,
      text: semanticColors.text.primary
    },
    tertiary: {
      bg: 'transparent',
      text: semanticColors.text.secondary
    }
  }

  const sizes = {
    small: { padding: `${spacing[1]} ${spacing[2]}`, fontSize: fontSize.sm },
    medium: { padding: `${spacing[2]} ${spacing[4]}`, fontSize: fontSize.base },
    large: { padding: `${spacing[3]} ${spacing[6]}`, fontSize: fontSize.lg }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizes[size],
        backgroundColor: variantColors[variant].bg,
        color: variantColors[variant].text,
        border: 'none',
        borderRadius: borderRadius.base,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: `all ${duration.fast}`,
        fontWeight: 600
      }}
    >
      {children}
    </button>
  )
}
```

### Example 2: Card Component

```typescript
import { spacing, semanticColors, borderRadius, shadow } from '@/lib/design-system'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: keyof typeof spacing
}

export default function Card({
  children,
  variant = 'default',
  padding = 4
}: CardProps) {
  const variants = {
    default: {
      bg: semanticColors.bg.secondary,
      border: 'none',
      shadow: shadow.md
    },
    elevated: {
      bg: semanticColors.bg.primary,
      border: 'none',
      shadow: shadow.lg
    },
    outlined: {
      bg: semanticColors.bg.primary,
      border: `1px solid ${semanticColors.border.default}`,
      shadow: 'none'
    }
  }

  return (
    <div style={{
      padding: spacing[padding],
      backgroundColor: variants[variant].bg,
      border: variants[variant].border,
      borderRadius: borderRadius.lg,
      boxShadow: variants[variant].shadow
    }}>
      {children}
    </div>
  )
}
```

---

## 🧪 Testing Checklist for Agents

Before marking a component as complete:

### Visual Testing
- [ ] Component renders correctly
- [ ] All variants display properly
- [ ] Layout is responsive
- [ ] Spacing follows 4px grid
- [ ] Typography is readable

### Theme Testing
- [ ] Works with Solarized Light
- [ ] Works with Solarized Dark
- [ ] Works with Dracula
- [ ] Works with all 20+ themes
- [ ] Colors are semantic (not hardcoded)

### Accessibility Testing
- [ ] No a11y violations in Storybook
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA

### Interaction Testing
- [ ] Click/tap works
- [ ] Hover state works
- [ ] Focus state works
- [ ] Active/pressed state works
- [ ] Disabled state works

### Code Quality
- [ ] TypeScript types defined
- [ ] JSDoc comments added
- [ ] No hardcoded values
- [ ] Design tokens used throughout
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes

---

## 📚 Resources for Agents

### Documentation
- [FRONTEND_ENTRY_POINT.md](./FRONTEND_ENTRY_POINT.md) - Master hub
- [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) - System architecture
- [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) - Component patterns
- [STORYBOOK_GUIDE.md](./STORYBOOK_GUIDE.md) - Storybook guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference

### Code References
- Design System: `frontend/src/lib/design-system.ts`
- Component Template: `frontend/src/components/_TEMPLATE.tsx`
- Themes: `frontend/.storybook/themes.ts`
- Existing Stories: `frontend/src/components/**/*.stories.tsx`

### Commands
```bash
npm run storybook        # Start Storybook
npm run type-check       # TypeScript check
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting
```

---

## 🤖 Agent Success Criteria

An agent has successfully created a component when:

1. ✅ Component file exists in appropriate category
2. ✅ Story file exists with all variants
3. ✅ Component uses ONLY design tokens
4. ✅ TypeScript types are complete
5. ✅ JSDoc comments are present
6. ✅ Component works in Storybook
7. ✅ Component works with all 20+ themes
8. ✅ No accessibility violations
9. ✅ Type-check passes
10. ✅ Lint passes

---

**Ready to build? Start with the template and follow the workflow!**

**Last Updated:** October 28, 2025
**For:** AI Agents, Automated Systems, Claude Code
