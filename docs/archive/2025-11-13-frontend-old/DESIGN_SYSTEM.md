# Design System Documentation

## Overview

This design system provides a comprehensive set of design tokens for the Proxy Agent Platform frontend. It ensures consistency, maintainability, and theme-ability across the entire application.

### Core Principles

1. **Single Source of Truth** - All design values live in one place
2. **4px Grid System** - All spacing uses multiples of 4px for visual rhythm
3. **Semantic Naming** - Use semantic colors over direct colors for theme switching
4. **TypeScript First** - Full type safety and autocomplete support
5. **No Hardcoded Values** - Always use tokens, never hardcode design values

---

## Quick Start

### Import Design Tokens

```typescript
import {
  spacing,
  semanticColors,
  colors,
  fontSize,
  borderRadius,
  iconSize,
  zIndex,
  shadow,
  coloredShadow,
  duration,
  animation,
  physics,
} from '@/lib/design-system'
```

### Basic Usage

```tsx
function MyComponent() {
  return (
    <div style={{
      padding: spacing[4],              // 16px
      backgroundColor: semanticColors.bg.primary,
      color: semanticColors.text.primary,
      borderRadius: borderRadius.lg,    // 16px
      boxShadow: shadow.md
    }}>
      <h1 style={{ fontSize: fontSize.xl }}>Hello World</h1>
    </div>
  )
}
```

---

## Token Categories

### 1. Spacing (4px Grid)

Based on a consistent 4px grid for visual rhythm and alignment.

```typescript
spacing[0]  // 0px
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px   ← Most common for padding
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
spacing[16] // 64px
spacing[24] // 96px
```

**Use for:** padding, margin, gap, width, height

**Examples:**
```tsx
// ✅ GOOD
<div style={{ padding: spacing[4], gap: spacing[2] }} />

// ❌ BAD
<div style={{ padding: '16px', gap: '8px' }} />
```

---

### 2. Typography

#### Font Sizes

```typescript
fontSize.xs    // 12px - Captions, meta text
fontSize.sm    // 14px - Body text, labels
fontSize.base  // 16px - Default body
fontSize.lg    // 18px - Subheadings
fontSize.xl    // 20px - Headings
fontSize['2xl'] // 24px - Large headings
fontSize['3xl'] // 30px - Hero text
fontSize['4xl'] // 36px - Display text
```

**Examples:**
```tsx
<h1 style={{ fontSize: fontSize.xl }}>Heading</h1>
<p style={{ fontSize: fontSize.sm }}>Body text</p>
<span style={{ fontSize: fontSize.xs }}>Caption</span>
```

---

### 3. Border Radius

```typescript
borderRadius.none   // 0px - No rounding
borderRadius.sm     // 4px - Subtle
borderRadius.base   // 8px - Standard
borderRadius.md     // 12px - Moderate
borderRadius.lg     // 16px - Cards
borderRadius.xl     // 20px - Large elements
borderRadius['2xl'] // 24px - Extra large
borderRadius['3xl'] // 32px - Dramatic
borderRadius.pill   // 9999px - Pills/capsules
```

**Examples:**
```tsx
<div style={{ borderRadius: borderRadius.lg }}>Card</div>
<button style={{ borderRadius: borderRadius.pill }}>Button</button>
```

---

### 4. Icon Sizes

For use with lucide-react icons.

```typescript
iconSize.xs    // 12px
iconSize.sm    // 16px
iconSize.base  // 20px
iconSize.lg    // 24px
iconSize.xl    // 28px
iconSize['2xl'] // 32px
```

**Examples:**
```tsx
import { Search, Bot, Zap } from 'lucide-react'

<Search size={iconSize.sm} />   // 16px
<Bot size={iconSize.base} />    // 20px
<Zap size={iconSize.lg} />      // 24px
```

---

### 5. Colors

#### Base Colors (Solarized Dark)

```typescript
colors.base03  // #002b36 - Darkest
colors.base02  // #073642 - Dark
colors.base01  // #586e75 - Dark gray
colors.base1   // #93a1a1 - Light gray
colors.base2   // #eee8d5 - Lighter
colors.base3   // #fdf6e3 - Lightest

colors.cyan    // #2aa198
colors.blue    // #268bd2
colors.green   // #859900
colors.yellow  // #b58900
colors.orange  // #cb4b16
colors.red     // #dc322f
colors.magenta // #d33682
colors.violet  // #6c71c4
```

#### ⚠️ Semantic Colors (Preferred)

**ALWAYS use semantic colors for theme switching:**

```typescript
// Backgrounds
semanticColors.bg.primary    // Main background
semanticColors.bg.secondary  // Cards, containers
semanticColors.bg.tertiary   // Subtle backgrounds

// Text
semanticColors.text.primary    // Main text
semanticColors.text.secondary  // Muted text
semanticColors.text.muted      // Disabled text
semanticColors.text.inverse    // Text on colored backgrounds

// Borders
semanticColors.border.default  // Default borders
semanticColors.border.focus    // Focus states
semanticColors.border.accent   // Accent borders

// Accents
semanticColors.accent.primary   // Primary actions (cyan)
semanticColors.accent.secondary // Secondary actions (blue)
semanticColors.accent.success   // Success states (green)
semanticColors.accent.warning   // Warnings (yellow)
semanticColors.accent.error     // Errors (red)
```

**Examples:**
```tsx
// ✅ CORRECT: Theme-aware
<div style={{
  backgroundColor: semanticColors.bg.primary,
  color: semanticColors.text.primary,
  borderColor: semanticColors.border.accent
}} />

// ❌ WRONG: Hardcoded, breaks themes
<div style={{
  backgroundColor: '#002b36',
  color: '#93a1a1',
  borderColor: '#2aa198'
}} />
```

---

### 6. Opacity

```typescript
opacity[0]   // 0
opacity[10]  // 0.1
opacity[20]  // 0.2
opacity[30]  // 0.3
opacity[40]  // 0.4
opacity[50]  // 0.5
opacity[60]  // 0.6
opacity[70]  // 0.7
opacity[80]  // 0.8
opacity[90]  // 0.9
opacity[100] // 1
```

**Examples:**
```tsx
<div style={{ opacity: opacity[80] }}>80% visible</div>
<div style={{ opacity: opacity[50] }}>50% visible</div>
```

---

### 7. Z-Index (Layering)

Prevents z-index wars by defining clear layers.

```typescript
zIndex.base    // 0  - Default
zIndex.sticky  // 10 - Sticky headers
zIndex.fixed   // 20 - Fixed elements
zIndex.overlay // 40 - Overlays, dropdowns
zIndex.modal   // 50 - Modals, dialogs
zIndex.toast   // 60 - Notifications, toasts
```

**Examples:**
```tsx
<div style={{ position: 'sticky', zIndex: zIndex.sticky }} />
<div style={{ position: 'fixed', zIndex: zIndex.fixed }} />
<div style={{ position: 'fixed', zIndex: zIndex.modal }} />
```

---

### 8. Shadows

```typescript
shadow.none  // No shadow
shadow.sm    // 0 1px 3px rgba(0,0,0,0.2) - Subtle
shadow.md    // 0 2px 8px rgba(0,0,0,0.3) - Standard
shadow.lg    // 0 8px 24px rgba(0,0,0,0.4) - Prominent
shadow.xl    // 0 12px 32px rgba(0,0,0,0.5) - Dramatic
```

#### Colored Shadows (Glows)

```typescript
coloredShadow(color: string, opacity?: string)
```

**Examples:**
```tsx
// Standard shadows
<div style={{ boxShadow: shadow.md }}>Card</div>

// Colored glow effect
<div style={{
  boxShadow: coloredShadow(colors.cyan, '30')
}}>Glowing card</div>

<button style={{
  boxShadow: coloredShadow(colors.blue, '40')
}}>Glowing button</button>
```

---

### 9. Animations & Timing

#### Durations

```typescript
duration.instant  // 0ms
duration.fast     // 150ms
duration.normal   // 300ms  ← Most common
duration.slow     // 500ms
duration.slower   // 1000ms
duration.slowest  // 1500ms
duration.pause    // 2000ms
```

**Examples:**
```tsx
<div style={{
  transition: `all ${duration.normal}`,
  transitionDuration: duration.fast
}} />
```

#### Animation Constants

```typescript
animation.celebration     // 1500ms
animation.dropAnimation   // 500ms
animation.loadingStage    // 2000ms
animation.togglePause     // 2000ms
animation.frameRate       // 16ms (60fps)
animation.tickerInterval  // { min: 4000, max: 8000 }
```

**Examples:**
```tsx
setTimeout(() => setShowCelebration(false), animation.celebration)
setInterval(updateParticles, animation.frameRate)
```

---

### 10. Physics (Particle Animations)

```typescript
physics.gravity                // 0.5
physics.particleSpeed.slow     // 5
physics.particleSpeed.medium   // 10
physics.particleSpeed.fast     // 15
```

**Examples:**
```tsx
// Apply gravity to particles
vy = vy + physics.gravity

// Set particle speed
const speed = physics.particleSpeed.fast
```

---

## Best Practices

### ✅ DO

1. **Import tokens at the top of your file**
   ```tsx
   import { spacing, semanticColors, borderRadius } from '@/lib/design-system'
   ```

2. **Use semantic colors for theme switching**
   ```tsx
   backgroundColor: semanticColors.bg.primary
   color: semanticColors.text.primary
   ```

3. **Use spacing scale for all dimensions**
   ```tsx
   padding: spacing[4]
   gap: spacing[2]
   marginBottom: spacing[6]
   ```

4. **Use TypeScript autocomplete**
   - Type `spacing[` and see all available values
   - Type `semanticColors.` and explore options

### ❌ DON'T

1. **Don't hardcode colors**
   ```tsx
   // ❌ BAD
   backgroundColor: '#002b36'

   // ✅ GOOD
   backgroundColor: semanticColors.bg.primary
   ```

2. **Don't hardcode spacing**
   ```tsx
   // ❌ BAD
   padding: '16px'

   // ✅ GOOD
   padding: spacing[4]
   ```

3. **Don't use arbitrary z-index values**
   ```tsx
   // ❌ BAD
   zIndex: 999

   // ✅ GOOD
   zIndex: zIndex.modal
   ```

4. **Don't mix hardcoded and token values**
   ```tsx
   // ❌ BAD - Inconsistent
   <div style={{ padding: spacing[4], margin: '8px' }} />

   // ✅ GOOD - Consistent
   <div style={{ padding: spacing[4], margin: spacing[2] }} />
   ```

---

## Common Patterns

### Card Component

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: spacing[4],
      backgroundColor: semanticColors.bg.secondary,
      borderRadius: borderRadius.lg,
      boxShadow: shadow.md,
      border: `1px solid ${semanticColors.border.default}`
    }}>
      {children}
    </div>
  )
}
```

### Button Component

```tsx
function Button({ children }: { children: React.ReactNode }) {
  return (
    <button style={{
      padding: `${spacing[2]} ${spacing[4]}`,
      backgroundColor: semanticColors.accent.primary,
      color: semanticColors.text.inverse,
      borderRadius: borderRadius.pill,
      fontSize: fontSize.sm,
      border: 'none',
      transition: `all ${duration.normal}`,
      cursor: 'pointer'
    }}>
      {children}
    </button>
  )
}
```

### Modal Overlay

```tsx
function Modal({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: `${colors.base03}${opacity[80]}`,
        zIndex: zIndex.overlay
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: semanticColors.bg.secondary,
        padding: spacing[6],
        borderRadius: borderRadius.xl,
        boxShadow: shadow.xl,
        zIndex: zIndex.modal
      }}>
        {children}
      </div>
    </>
  )
}
```

### Smooth Hover Effect

```tsx
function HoverCard() {
  return (
    <div
      style={{
        padding: spacing[4],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        boxShadow: shadow.sm,
        transition: `all ${duration.normal}`,
        transform: 'translateZ(0)', // GPU acceleration
        willChange: 'transform'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02) translateZ(0)'
        e.currentTarget.style.boxShadow = shadow.md
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateZ(0)'
        e.currentTarget.style.boxShadow = shadow.sm
      }}
    >
      Hover me!
    </div>
  )
}
```

---

## Theme Switching (Future)

The design system is structured to support theme switching:

```typescript
// Future: Light theme
export const lightSemanticColors = {
  bg: {
    primary: colors.base3,    // Light background
    secondary: colors.base2,
  },
  text: {
    primary: colors.base03,   // Dark text
    secondary: colors.base01,
  },
  // ... etc
}

// Usage with theme context
const theme = useTheme() // 'dark' | 'light'
const themeColors = theme === 'dark' ? semanticColors : lightSemanticColors
```

---

## TypeScript Support

The design system exports TypeScript types for strict typing:

```typescript
import type {
  SpacingKey,
  FontSizeKey,
  BorderRadiusKey,
  IconSizeKey,
  ColorKey,
  OpacityKey,
  ZIndexKey,
  ShadowKey,
  DurationKey,
  SemanticColorPath
} from '@/lib/design-system'

// Type-safe component props
interface CardProps {
  spacing?: SpacingKey
  shadow?: ShadowKey
}

function Card({ spacing = 4, shadow = 'md' }: CardProps) {
  return <div style={{ padding: spacing[spacing], boxShadow: shadow[shadow] }} />
}
```

---

## Migration Guide

### Migrating Existing Components

1. **Find hardcoded values**
   ```bash
   # Search for hardcoded colors
   grep -r "#[0-9a-f]\{6\}" src/components/

   # Search for hardcoded spacing
   grep -r "'[0-9]\+px'" src/components/
   ```

2. **Replace with tokens**
   ```tsx
   // Before
   <div style={{ padding: '16px', color: '#93a1a1' }} />

   // After
   import { spacing, semanticColors } from '@/lib/design-system'
   <div style={{ padding: spacing[4], color: semanticColors.text.primary }} />
   ```

3. **Test thoroughly** - Ensure visual consistency

---

## Reference

### File Location
```
frontend/src/lib/design-system.ts
```

### Full Import Example
```typescript
import {
  // Spacing
  spacing,

  // Typography
  fontSize,

  // Shapes
  borderRadius,

  // Icons
  iconSize,

  // Colors
  colors,
  semanticColors,

  // Visual Effects
  opacity,
  zIndex,
  shadow,
  coloredShadow,

  // Animations
  duration,
  animation,
  physics,

  // Types (optional)
  type SpacingKey,
  type ColorKey,
  type SemanticColorPath
} from '@/lib/design-system'
```

---

## Questions?

For questions or suggestions about the design system:
1. Review this documentation
2. Check `/lib/design-system.ts` for inline JSDoc comments
3. Ask in team chat or create an issue

**Remember:** The design system is your friend. Use it consistently, and your UI will thank you! 🎨
