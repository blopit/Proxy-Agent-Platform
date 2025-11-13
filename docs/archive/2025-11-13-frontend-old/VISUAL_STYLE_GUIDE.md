# Visual Style Guide

A practical guide to implementing consistent visual design across the Proxy Agent Platform.

---

## Quick Start

```typescript
import { spacing, fontSize, colors, semanticColors, borderRadius } from '@/lib/design-system'

// Use design tokens exclusively - never hard-code values
<div style={{
  padding: spacing[6],           // 24px
  fontSize: fontSize.lg,         // 20px
  color: semanticColors.text.primary,
  borderRadius: borderRadius.base,  // 8px
  background: semanticColors.bg.secondary
}}>
  Content
</div>
```

---

## 1. Color Palette

### Base Colors (Solarized)

Our default theme uses the Solarized color palette - precision colors for machines and people.

#### Background Tones
```css
base03: #002b36  /* Darkest - primary background (dark mode) */
base02: #073642  /* Dark - secondary background (dark mode) */
base01: #586e75  /* Medium dark - optional emphasized content */
base00: #657b83  /* Medium - body text (dark mode) */
base0:  #839496  /* Medium - body text (light mode) */
base1:  #93a1a1  /* Medium light - optional emphasized content */
base2:  #eee8d5  /* Light - secondary background (light mode) */
base3:  #fdf6e3  /* Lightest - primary background (light mode) */
```

#### Accent Colors
```css
yellow:  #b58900  /* Warnings, caution states */
orange:  #cb4b16  /* Mend mode, restoration */
red:     #dc322f  /* Errors, destructive actions */
magenta: #d33682  /* Special highlights */
violet:  #6c71c4  /* Map mode, planning */
blue:    #268bd2  /* Scout mode, discovery */
cyan:    #2aa198  /* Primary accent, Capture mode */
green:   #859900  /* Success, Hunt mode, completion */
```

### Semantic Colors (Theme-Agnostic)

**Always use semantic colors in components** - they automatically adapt to theme changes.

#### Backgrounds
```typescript
semanticColors.bg.primary    // Main page background
semanticColors.bg.secondary  // Card backgrounds
semanticColors.bg.tertiary   // Nested component backgrounds
```

#### Text
```typescript
semanticColors.text.primary    // Main content text
semanticColors.text.secondary  // De-emphasized text
semanticColors.text.disabled   // Inactive elements
semanticColors.text.inverse    // Text on dark backgrounds
```

#### Borders
```typescript
semanticColors.border.default  // Standard borders
semanticColors.border.focus    // Active input borders (blue)
semanticColors.border.accent   // Highlighted borders (cyan)
```

#### Accents
```typescript
semanticColors.accent.primary   // Brand actions (cyan)
semanticColors.accent.secondary // Alternative actions (blue)
semanticColors.accent.success   // Completion (green)
semanticColors.accent.warning   // Caution (yellow)
semanticColors.accent.error     // Errors (red)
```

### Usage Examples

```typescript
// ✅ Good: Theme-aware
<div style={{
  background: semanticColors.bg.secondary,
  color: semanticColors.text.primary
}}>

// ❌ Bad: Hard-coded color
<div style={{
  background: '#073642',
  color: '#839496'
}}>

// ✅ Good: Status-based semantic color
<button style={{ background: semanticColors.accent.success }}>
  Complete Task
</button>

// ❌ Bad: Direct color reference
<button style={{ background: colors.green }}>
  Complete Task
</button>
```

---

## 2. Typography

### Font Scale

All font sizes follow a modular scale for visual harmony:

```typescript
fontSize = {
  xs:   '12px',  // Captions, metadata, timestamps
  sm:   '14px',  // Secondary information, helper text
  base: '16px',  // Body text, form labels
  lg:   '20px',  // Emphasized body text, small headers
  xl:   '24px',  // Subsection headers, card titles
  '2xl': '28px', // Section headers
  '3xl': '32px', // Page headers
  '4xl': '36px', // Hero text, main titles
}
```

### Line Height

```typescript
lineHeight = {
  tight:   1.2,  // Headers, compact cards
  normal:  1.5,  // Default body text
  relaxed: 1.75, // Long-form content, readability
}
```

### Font Weight

```typescript
fontWeight = {
  light:    300,  // Minimal aesthetics (Mend mode)
  regular:  400,  // Body text
  medium:   500,  // Button labels, emphasized text
  semibold: 600,  // Card headers, section titles
  bold:     700,  // Page headers, critical actions
}
```

### Typography Hierarchy

#### Page Layout
```tsx
// Page title
<h1 style={{
  fontSize: fontSize['3xl'],      // 32px
  fontWeight: fontWeight.bold,    // 700
  lineHeight: lineHeight.tight,   // 1.2
  marginBottom: spacing[4]        // 16px
}}>
  Dashboard
</h1>

// Page subtitle
<p style={{
  fontSize: fontSize.base,        // 16px
  color: semanticColors.text.secondary,
  marginBottom: spacing[8]        // 32px
}}>
  Track your productivity and manage AI agents
</p>
```

#### Card Content
```tsx
// Card header
<h3 style={{
  fontSize: fontSize.xl,          // 24px
  fontWeight: fontWeight.semibold,// 600
  marginBottom: spacing[2]        // 8px
}}>
  Task Agent
</h3>

// Card body
<p style={{
  fontSize: fontSize.sm,          // 14px
  color: semanticColors.text.secondary,
  lineHeight: lineHeight.normal   // 1.5
}}>
  Analyzes and suggests optimal task sequences
</p>

// Card metadata
<span style={{
  fontSize: fontSize.xs,          // 12px
  color: semanticColors.text.secondary
}}>
  Last active: 2 minutes ago
</span>
```

#### Button Text
```tsx
// Default button
<button style={{
  fontSize: fontSize.base,        // 16px
  fontWeight: fontWeight.medium   // 500
}}>
  Save Changes
</button>

// Small button
<button style={{
  fontSize: fontSize.sm,          // 14px
  fontWeight: fontWeight.medium   // 500
}}>
  Cancel
</button>

// Large button (CTA)
<button style={{
  fontSize: fontSize.lg,          // 20px
  fontWeight: fontWeight.semibold // 600
}}>
  Get Started
</button>
```

---

## 3. Spacing System

### 4px Grid

All spacing values are multiples of 4px for consistent visual rhythm.

```typescript
spacing = {
  0:  '0px',
  1:  '4px',    // Micro gaps
  2:  '8px',    // Small gaps
  3:  '12px',   // Medium gaps
  4:  '16px',   // Default gap
  5:  '20px',   // Large gaps
  6:  '24px',   // Section spacing
  8:  '32px',   // Major sections
  10: '40px',   // Large sections
  12: '48px',   // Extra large sections
  16: '64px',   // Page sections
  20: '80px',   // Huge sections
  24: '96px',   // Maximum sections
  32: '128px',  // Hero sections
}
```

### Spacing Usage Matrix

| Use Case | Token | Value | Example |
|----------|-------|-------|---------|
| Icon padding | `spacing[1]` | 4px | Padding inside badge |
| Small button padding | `spacing[2]` | 8px | Compact button horizontal padding |
| Default button padding | `spacing[3]` | 12px | Standard button horizontal padding |
| Element separation | `spacing[4]` | 16px | Gap between form fields |
| Card padding | `spacing[6]` | 24px | Standard card internal padding |
| Section spacing | `spacing[8]` | 32px | Gap between page sections |
| Page padding (mobile) | `spacing[4]` | 16px | Viewport edge spacing |
| Page padding (desktop) | `spacing[8]` | 32px | Viewport edge spacing |

### Practical Examples

#### Button Spacing
```tsx
<button style={{
  paddingLeft: spacing[4],    // 16px horizontal
  paddingRight: spacing[4],
  paddingTop: spacing[2],     // 8px vertical
  paddingBottom: spacing[2],
  gap: spacing[2]             // 8px between icon and text
}}>
  <Icon />
  <span>Button Text</span>
</button>
```

#### Card Layout
```tsx
<div style={{
  padding: spacing[6],        // 24px internal padding
  marginBottom: spacing[5],   // 20px bottom margin
  gap: spacing[4]             // 16px between child elements
}}>
  <h3>Card Title</h3>
  <p>Card content with consistent spacing</p>
</div>
```

#### Form Layout
```tsx
<form style={{
  display: 'flex',
  flexDirection: 'column',
  gap: spacing[4]             // 16px between form fields
}}>
  <SystemInput label="Name" />
  <SystemInput label="Email" />
  <SystemButton>Submit</SystemButton>
</form>
```

#### Grid Layouts
```tsx
// Card grid
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: spacing[5]             // 20px between cards
}}>
  <Card />
  <Card />
  <Card />
</div>

// Stats grid
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: spacing[4]             // 16px between stats
}}>
  <StatsCard />
  <StatsCard />
  <StatsCard />
  <StatsCard />
</div>
```

---

## 4. Border Radius

### Scale

```typescript
borderRadius = {
  none: '0px',      // Sharp corners (minimal design)
  sm:   '4px',      // Compact elements (badges, pills)
  base: '8px',      // Default (buttons, inputs, cards)
  lg:   '12px',     // Large cards, modals
  xl:   '16px',     // Hero cards, featured content
  pill: '9999px',   // Fully rounded (avatars, status dots)
}
```

### Usage Guidelines

**Base (8px) as Default**
```tsx
// Standard button
<button style={{ borderRadius: borderRadius.base }}>
  Click Me
</button>

// Standard card
<div style={{ borderRadius: borderRadius.base }}>
  Card content
</div>

// Standard input
<input style={{ borderRadius: borderRadius.base }} />
```

**Small (4px) for Compact Elements**
```tsx
// Badge
<span style={{
  borderRadius: borderRadius.sm,
  padding: `${spacing[1]} ${spacing[2]}`
}}>
  New
</span>

// Small button
<button style={{
  borderRadius: borderRadius.sm,
  padding: spacing[2]
}}>
  <Icon size={16} />
</button>
```

**Large (12px) for Prominent Cards**
```tsx
// Featured card
<div style={{
  borderRadius: borderRadius.lg,
  padding: spacing[8]
}}>
  Hero content
</div>

// Modal
<div style={{
  borderRadius: borderRadius.lg,
  maxWidth: '600px'
}}>
  Modal content
</div>
```

**Pill (9999px) for Circular Elements**
```tsx
// Avatar
<img style={{
  borderRadius: borderRadius.pill,
  width: '48px',
  height: '48px'
}} />

// Status dot
<span style={{
  borderRadius: borderRadius.pill,
  width: '8px',
  height: '8px',
  background: semanticColors.accent.success
}} />

// Pill button
<button style={{
  borderRadius: borderRadius.pill,
  padding: `${spacing[2]} ${spacing[4]}`
}}>
  Follow
</button>
```

---

## 5. Shadows and Elevation

### Shadow Scale

```typescript
shadows = {
  none: 'none',
  sm:   '0 1px 2px 0 rgba(0, 0, 0, 0.05)',           // Subtle elevation
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',            // Card elevation
  md:   '0 4px 6px -1px rgba(0, 0, 0, 0.1)',         // Raised cards
  lg:   '0 10px 15px -3px rgba(0, 0, 0, 0.1)',       // Modals, popovers
  xl:   '0 20px 25px -5px rgba(0, 0, 0, 0.1)',       // Maximum elevation
}
```

### Elevation Layers

```
Layer 0 (base)     - Page background
Layer 1 (sm)       - Flat cards, badges
Layer 2 (base)     - Default cards
Layer 3 (md)       - Hover state cards
Layer 4 (lg)       - Dropdowns, tooltips
Layer 5 (xl)       - Modals, alerts
```

### Glass Morphism Effect

Semi-transparent backgrounds with backdrop blur for modern depth:

```tsx
<div style={{
  background: 'rgba(7, 54, 66, 0.8)',  // base02 at 80% opacity
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(88, 110, 117, 0.2)',  // base01 at 20% opacity
  borderRadius: borderRadius.base,
  boxShadow: shadows.base
}}>
  Glass morphism card content
</div>
```

### Usage Examples

#### Default Card
```tsx
<div style={{
  background: semanticColors.bg.secondary,
  borderRadius: borderRadius.base,
  boxShadow: shadows.base,           // Subtle elevation
  padding: spacing[6]
}}>
  Card content
</div>
```

#### Hover State
```tsx
<div style={{
  background: semanticColors.bg.secondary,
  borderRadius: borderRadius.base,
  boxShadow: shadows.base,
  transition: 'all 0.3s ease',
  ':hover': {
    boxShadow: shadows.md,           // Increased elevation on hover
    transform: 'translateY(-2px)'
  }
}}>
  Interactive card
</div>
```

#### Modal Overlay
```tsx
<div style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: semanticColors.bg.primary,
  borderRadius: borderRadius.lg,
  boxShadow: shadows.xl,             // Maximum elevation
  padding: spacing[8],
  zIndex: 50
}}>
  Modal content
</div>
```

---

## 6. Icons

### Icon Sizes

```typescript
iconSize = {
  xs:   12,  // Inline with small text
  sm:   16,  // Inline with body text
  base: 20,  // Default size
  lg:   24,  // Section headers
  xl:   32,  // Page headers, hero icons
  '2xl': 48, // Feature icons
}
```

### Icon Usage

```tsx
import { CheckCircle, AlertTriangle } from 'lucide-react'

// Inline with text
<span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
  <CheckCircle size={iconSize.sm} />
  Task completed
</span>

// Button icon
<button style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
  <Plus size={iconSize.base} />
  Add Task
</button>

// Hero icon
<div style={{ textAlign: 'center' }}>
  <Target size={iconSize['2xl']} color={semanticColors.accent.primary} />
  <h2>Scout Mode</h2>
</div>
```

### Icon Colors

```tsx
// Success state
<CheckCircle size={20} color={semanticColors.accent.success} />

// Warning state
<AlertTriangle size={20} color={semanticColors.accent.warning} />

// Error state
<XCircle size={20} color={semanticColors.accent.error} />

// Neutral/Default
<Info size={20} color={semanticColors.text.secondary} />
```

---

## 7. Component Patterns

### Buttons

#### Primary Button
```tsx
<button style={{
  background: semanticColors.accent.primary,
  color: semanticColors.text.inverse,
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: borderRadius.base,
  fontSize: fontSize.base,
  fontWeight: fontWeight.medium,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    opacity: 0.9,
    transform: 'scale(0.98)'
  }
}}>
  Primary Action
</button>
```

#### Secondary Button (Outlined)
```tsx
<button style={{
  background: 'transparent',
  color: semanticColors.accent.primary,
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: borderRadius.base,
  fontSize: fontSize.base,
  fontWeight: fontWeight.medium,
  border: `1px solid ${semanticColors.border.accent}`,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    background: 'rgba(42, 161, 152, 0.1)'
  }
}}>
  Secondary Action
</button>
```

#### Ghost Button
```tsx
<button style={{
  background: 'transparent',
  color: semanticColors.text.primary,
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: borderRadius.base,
  fontSize: fontSize.base,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    background: semanticColors.bg.tertiary
  }
}}>
  Tertiary Action
</button>
```

### Cards

#### Default Card
```tsx
<div style={{
  background: semanticColors.bg.secondary,
  borderRadius: borderRadius.base,
  padding: spacing[6],
  boxShadow: shadows.base
}}>
  <h3 style={{
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing[2]
  }}>
    Card Title
  </h3>
  <p style={{
    fontSize: fontSize.sm,
    color: semanticColors.text.secondary
  }}>
    Card description with consistent styling
  </p>
</div>
```

#### Glass Morphism Card
```tsx
<div style={{
  background: 'rgba(7, 54, 66, 0.8)',
  backdropFilter: 'blur(12px)',
  border: `1px solid rgba(88, 110, 117, 0.2)`,
  borderRadius: borderRadius.base,
  padding: spacing[6],
  boxShadow: shadows.base
}}>
  <h3>Glass Morphism Card</h3>
  <p>Semi-transparent with backdrop blur</p>
</div>
```

#### Interactive Card (Clickable)
```tsx
<div style={{
  background: semanticColors.bg.secondary,
  borderRadius: borderRadius.base,
  padding: spacing[6],
  boxShadow: shadows.base,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  ':hover': {
    boxShadow: shadows.md,
    transform: 'translateY(-2px) scale(1.02)'
  }
}}>
  <h3>Interactive Card</h3>
  <p>Hover me for effect</p>
</div>
```

### Badges

#### Status Badge
```tsx
<span style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: spacing[1],
  padding: `${spacing[1]} ${spacing[2]}`,
  borderRadius: borderRadius.sm,
  fontSize: fontSize.xs,
  fontWeight: fontWeight.medium,
  background: 'rgba(133, 153, 0, 0.1)',
  color: semanticColors.accent.success
}}>
  <span style={{
    width: '6px',
    height: '6px',
    borderRadius: borderRadius.pill,
    background: semanticColors.accent.success
  }} />
  Active
</span>
```

#### Count Badge
```tsx
<span style={{
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
  padding: `0 ${spacing[1]}`,
  borderRadius: borderRadius.pill,
  fontSize: fontSize.xs,
  fontWeight: fontWeight.semibold,
  background: semanticColors.accent.error,
  color: semanticColors.text.inverse
}}>
  3
</span>
```

### Inputs

#### Text Input
```tsx
<div>
  <label style={{
    display: 'block',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing[1],
    color: semanticColors.text.primary
  }}>
    Email
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    style={{
      width: '100%',
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: fontSize.base,
      background: semanticColors.bg.primary,
      border: `1px solid ${semanticColors.border.default}`,
      borderRadius: borderRadius.base,
      color: semanticColors.text.primary,
      ':focus': {
        outline: 'none',
        borderColor: semanticColors.border.focus,
        boxShadow: `0 0 0 3px rgba(38, 139, 210, 0.1)`
      }
    }}
  />
  <span style={{
    display: 'block',
    fontSize: fontSize.xs,
    color: semanticColors.text.secondary,
    marginTop: spacing[1]
  }}>
    We'll never share your email
  </span>
</div>
```

#### Input with Error
```tsx
<div>
  <label style={{
    display: 'block',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: spacing[1],
    color: semanticColors.text.primary
  }}>
    Password
  </label>
  <input
    type="password"
    style={{
      width: '100%',
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: fontSize.base,
      background: semanticColors.bg.primary,
      border: `1px solid ${semanticColors.accent.error}`,  // Error state
      borderRadius: borderRadius.base,
      color: semanticColors.text.primary
    }}
  />
  <span style={{
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    fontSize: fontSize.xs,
    color: semanticColors.accent.error,
    marginTop: spacing[1]
  }}>
    <AlertCircle size={12} />
    Password must be at least 8 characters
  </span>
</div>
```

---

## 8. Layout Patterns

### Page Layout
```tsx
<div style={{
  minHeight: '100vh',
  background: semanticColors.bg.primary,
  padding: spacing[8]
}}>
  <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
    {/* Page header */}
    <div style={{ marginBottom: spacing[8] }}>
      <h1 style={{
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.bold,
        marginBottom: spacing[2]
      }}>
        Dashboard
      </h1>
      <p style={{
        fontSize: fontSize.base,
        color: semanticColors.text.secondary
      }}>
        Track your productivity and manage AI agents
      </p>
    </div>

    {/* Page content */}
    <div style={{
      display: 'grid',
      gap: spacing[6]
    }}>
      {/* Content sections */}
    </div>
  </div>
</div>
```

### Grid Layout (Responsive)
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: spacing[5]
}}>
  <Card />
  <Card />
  <Card />
</div>
```

### Two-Column Layout
```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: spacing[6]
}}>
  <div>{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

### Stack Layout (Vertical)
```tsx
<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: spacing[4]
}}>
  <Section />
  <Section />
  <Section />
</div>
```

---

## 9. Mobile Responsive Patterns

### Breakpoint-Based Styling

```tsx
// Mobile-first approach
const cardStyles = {
  padding: spacing[4],           // 16px on mobile
  '@media (min-width: 768px)': {
    padding: spacing[6]          // 24px on tablet+
  }
}

// Grid adaptation
const gridStyles = {
  display: 'grid',
  gridTemplateColumns: '1fr',    // 1 column on mobile
  gap: spacing[4],
  '@media (min-width: 768px)': {
    gridTemplateColumns: 'repeat(2, 1fr)'  // 2 columns on tablet
  },
  '@media (min-width: 1024px)': {
    gridTemplateColumns: 'repeat(4, 1fr)'  // 4 columns on desktop
  }
}
```

### Mobile Navigation
```tsx
// Bottom tab bar (mobile)
<nav style={{
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'space-around',
  padding: spacing[3],
  background: semanticColors.bg.secondary,
  borderTop: `1px solid ${semanticColors.border.default}`
}}>
  <TabButton icon={Home} label="Home" />
  <TabButton icon={Target} label="Tasks" />
  <TabButton icon={Calendar} label="Schedule" />
</nav>
```

---

## 10. Dark Mode Support

All components automatically support dark mode through semantic colors:

```tsx
// Light mode: text.primary = #657b83
// Dark mode: text.primary = #839496

// Component automatically adapts
<p style={{ color: semanticColors.text.primary }}>
  This text color changes with theme
</p>
```

**Theme Switching**:
```typescript
import { themes } from '@/lib/themes'

// Apply theme
const currentTheme = themes.solarizedDark
document.documentElement.style.setProperty('--color-bg-primary', currentTheme.backgroundColor)
document.documentElement.style.setProperty('--color-text-primary', currentTheme.textColor)
// ... apply all theme colors
```

---

## 11. Accessibility Checklist

### Color Contrast
- [ ] Text has 4.5:1 contrast ratio (normal text)
- [ ] Large text has 3:1 contrast ratio (24px+)
- [ ] UI components have 3:1 contrast ratio

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order follows logical flow
- [ ] Focus indicators are clearly visible (2px outline, 4px offset)

### Screen Readers
- [ ] Semantic HTML used (`<button>`, `<nav>`, `<main>`)
- [ ] ARIA labels on icon-only buttons
- [ ] Alt text on all meaningful images

### Touch Targets
- [ ] Minimum 44x44px touch targets
- [ ] 8px spacing between adjacent targets

---

## 12. Common Mistakes to Avoid

### Color Usage
```tsx
// ❌ Bad: Hard-coded color
<div style={{ background: '#073642' }}>

// ✅ Good: Semantic color
<div style={{ background: semanticColors.bg.secondary }}>
```

### Spacing
```tsx
// ❌ Bad: Random spacing value
<div style={{ padding: '17px' }}>

// ✅ Good: Design token from 4px grid
<div style={{ padding: spacing[4] }}>
```

### Font Size
```tsx
// ❌ Bad: Arbitrary font size
<h2 style={{ fontSize: '22px' }}>

// ✅ Good: Typography scale
<h2 style={{ fontSize: fontSize.xl }}>
```

### Border Radius
```tsx
// ❌ Bad: Non-standard radius
<button style={{ borderRadius: '6px' }}>

// ✅ Good: Design token
<button style={{ borderRadius: borderRadius.base }}>
```

---

## 13. Quick Reference

### Most Common Patterns

```typescript
// Standard button
padding: `${spacing[2]} ${spacing[4]}`
fontSize: fontSize.base
borderRadius: borderRadius.base

// Standard card
padding: spacing[6]
borderRadius: borderRadius.base
boxShadow: shadows.base

// Standard input
padding: `${spacing[2]} ${spacing[3]}`
fontSize: fontSize.base
borderRadius: borderRadius.base

// Grid gap
gap: spacing[5]  // 20px between cards

// Section spacing
marginBottom: spacing[8]  // 32px between sections
```

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
**Maintained by**: Frontend Team
