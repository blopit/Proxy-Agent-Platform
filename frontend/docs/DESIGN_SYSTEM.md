# Design System Reference

## 🎨 Overview

The ADHD Task Management System uses a comprehensive design system built on **Solarized** color palette with semantic tokens for consistent, accessible, ADHD-friendly interfaces.

**Location**: `src/lib/design-system.ts`

---

## 🎨 Color System

### Base Solarized Palette

```typescript
// Base Solarized colors (background shades)
base03: '#002b36'  // Darkest background
base02: '#073642'  // Dark background highlight
base01: '#586e75'  // Content tone (dark mode)
base00: '#657b83'  // Body text (dark mode)
base0:  '#839496'  // Body text (light mode)
base1:  '#93a1a1'  // Content tone (light mode)
base2:  '#eee8d5'  // Background highlight (light mode)
base3:  '#fdf6e3'  // Brightest background (light mode)

// Accent colors
cyan:    '#2aa198'  // Primary accent
blue:    '#268bd2'  // Secondary accent
green:   '#859900'  // Success
yellow:  '#b58900'  // Warning
orange:  '#cb4b16'  // Alert
red:     '#dc322f'  // Error/Urgent
magenta: '#d33682'  // Special
violet:  '#6c71c4'  // Info
```

### Semantic Color System

**Auto-adapts to dark mode based on system preferences.**

```typescript
semanticColors = {
  bg: {
    primary:   Dark: base03 (#002b36), Light: base3 (#fdf6e3)
    secondary: Dark: base02 (#073642), Light: base2 (#eee8d5)
    tertiary:  Dark: base01 (#586e75), Light: base1 (#93a1a1)
  },

  text: {
    primary:   Dark: base0 (#839496), Light: base00 (#657b83)
    secondary: Dark: base01 (#586e75), Light: base1 (#93a1a1)
    inverse:   Dark: base3 (#fdf6e3),  Light: base03 (#002b36)
  },

  border: {
    default: Dark: base01 (#586e75), Light: base1 (#93a1a1)
    accent:  Dark: base00 (#657b83), Light: base0 (#839496)
  },

  accent: {
    primary:   cyan (#2aa198)
    secondary: blue (#268bd2)
    success:   green (#859900)
    warning:   yellow (#b58900)
    error:     red (#dc322f)
  }
}
```

### Color Usage Guidelines

```typescript
// ✅ Always use semantic colors for backgrounds and text
backgroundColor: semanticColors.bg.primary    // Auto dark mode
color: semanticColors.text.primary

// ✅ Use accent colors for interactive elements
buttonColor: semanticColors.accent.primary    // Cyan
successColor: semanticColors.accent.success   // Green

// ✅ Use base colors for specific accent needs
specialAccent: colors.magenta
infoAccent: colors.violet

// ❌ Never hardcode color values
backgroundColor: '#002b36'  // BAD - breaks dark mode
color: '#839496'            // BAD - not semantic
```

### ADHD-Optimized Color Applications

#### Priority Colors
```typescript
// Task priority indicators
high:   colors.red      // #dc322f - Urgent, demands attention
medium: colors.yellow   // #b58900 - Important but not critical
low:    colors.green    // #859900 - Nice to have
```

#### Energy Levels (smooth interpolation)
```typescript
// Energy gauge colors
0-30%:   Red → Yellow blend     // Critical to low
30-60%:  Yellow → Green blend   // Low to medium
60-100%: Green (solid)           // Good energy
```

#### Mode Colors
```typescript
// Biological circuit mode colors
capture: colors.cyan      // #2aa198 - Calming, receptive
scout:   colors.yellow    // #b58900 - Alert, exploratory
hunt:    colors.red       // #dc322f - Focused, intense
mender:  colors.blue      // #268bd2 - Restorative, calm
mapper:  colors.violet    // #6c71c4 - Reflective, analytical
```

---

## 📏 Spacing System

**4px grid** - All spacing is a multiple of 4px for perfect pixel alignment.

```typescript
spacing = {
  0:  '0px',      // None
  1:  '4px',      // Micro
  2:  '8px',      // Tiny
  3:  '12px',     // Small
  4:  '16px',     // Base
  5:  '20px',     // Medium
  6:  '24px',     // Large
  8:  '32px',     // XL
  10: '40px',     // 2XL
  12: '48px',     // 3XL
  16: '64px',     // 4XL
  20: '80px',     // 5XL
  24: '96px',     // 6XL
}
```

### Spacing Usage

```typescript
// Padding/Margin
padding: spacing[4]              // 16px - Standard padding
margin: spacing[2]               // 8px - Tight margin
gap: spacing[3]                  // 12px - Between related items

// Component spacing
headerPadding: spacing[6]        // 24px - Generous header space
cardPadding: spacing[4]          // 16px - Card internal padding
listGap: spacing[2]              // 8px - Between list items
sectionGap: spacing[8]           // 32px - Between sections
```

### ADHD Spacing Guidelines

```typescript
// ✅ Generous spacing reduces visual clutter
padding: spacing[4]     // Not too tight
marginBottom: spacing[8] // Clear section separation

// ✅ Consistent gaps for visual rhythm
gap: spacing[3]         // Related items
gap: spacing[6]         // Unrelated items

// ❌ Avoid inconsistent spacing
marginBottom: '13px'    // Not on 4px grid
padding: '25px'         // Random value
```

---

## 📝 Typography

### Font Sizes

```typescript
fontSize = {
  xs:   '0.75rem',    // 12px - Labels, captions
  sm:   '0.875rem',   // 14px - Secondary text
  base: '1rem',       // 16px - Body text (MINIMUM for ADHD)
  lg:   '1.125rem',   // 18px - Subheadings
  xl:   '1.25rem',    // 20px - Headings
  '2xl': '1.5rem',    // 24px - Large headings
  '3xl': '1.875rem',  // 30px - Hero text
  '4xl': '2.25rem',   // 36px - Display text
}
```

### Font Weights

```typescript
fontWeight = {
  normal: '400',      // Body text
  medium: '500',      // Emphasis
  semibold: '600',    // Headings
  bold: '700',        // Strong emphasis
}
```

### Line Heights

```typescript
lineHeight = {
  tight: '1.25',      // Headings
  normal: '1.5',      // Body text
  relaxed: '1.75',    // Long-form content
}
```

### Typography Usage

```typescript
// Page title
fontSize: fontSize['2xl']
fontWeight: fontWeight.bold
lineHeight: lineHeight.tight

// Section heading
fontSize: fontSize.xl
fontWeight: fontWeight.semibold

// Body text (ADHD-optimized minimum)
fontSize: fontSize.base     // Never smaller than 16px
lineHeight: lineHeight.normal

// Secondary text
fontSize: fontSize.sm
color: semanticColors.text.secondary
```

---

## 🔲 Border Radius

```typescript
borderRadius = {
  none: '0',
  sm:   '0.125rem',   // 2px
  base: '0.25rem',    // 4px
  md:   '0.375rem',   // 6px
  lg:   '0.5rem',     // 8px
  xl:   '0.75rem',    // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',     // Circular
  pill: '9999px',     // Same as full (semantic)
}
```

### Usage

```typescript
// Buttons
borderRadius: borderRadius.lg         // 8px - Friendly, approachable

// Cards
borderRadius: borderRadius['2xl']     // 16px - Modern, clean

// Pills/Badges
borderRadius: borderRadius.pill       // Fully rounded

// Input fields
borderRadius: borderRadius.xl         // 12px - Smooth, accessible
```

---

## 🎯 Icon Sizes

```typescript
iconSize = {
  xs:   12,    // Tiny icons in badges
  sm:   16,    // Standard small icons
  base: 20,    // Default icon size
  md:   24,    // Medium icons
  lg:   32,    // Large icons
  xl:   40,    // Extra large
  '2xl': 48,   // Hero icons
}
```

### Usage with Lucide Icons

```typescript
import { Search, Target } from 'lucide-react'

<Search size={iconSize.base} />     // 20px standard
<Target size={iconSize.lg} />       // 32px large
<Camera size={iconSize.sm} />       // 16px small
```

---

## 📊 Z-Index Layers

```typescript
zIndex = {
  base: 1,           // Normal content
  dropdown: 10,      // Dropdowns, tooltips
  sticky: 20,        // Sticky headers
  fixed: 30,         // Fixed navigation
  modal: 40,         // Modal backgrounds
  popover: 50,       // Popovers, toasts
  tooltip: 60,       // Tooltips (highest)
}
```

### Usage

```typescript
// Bottom tabs (always visible)
position: 'fixed'
zIndex: zIndex.fixed

// Task breakdown modal
position: 'fixed'
zIndex: zIndex.modal

// Success toast
position: 'fixed'
zIndex: zIndex.popover
```

---

## ✨ Shadows

```typescript
shadow = {
  sm:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md:   '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg:   '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl:   '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}
```

### Colored Shadows (ADHD dopamine optimization)

```typescript
// For glowing effects on interactive elements
const coloredShadow = (color: string, opacity: string = '50') => {
  return `0 0 20px ${color}${opacity}`
}

// Usage
boxShadow: coloredShadow(colors.cyan, '30')   // Subtle cyan glow
boxShadow: coloredShadow(colors.red, '50')    // Stronger red glow
```

### Shadow Usage

```typescript
// Floating cards
boxShadow: shadow.lg

// Subtle elevation
boxShadow: shadow.sm

// Hero cards
boxShadow: shadow['2xl']

// Interactive glow (on hover/active)
boxShadow: coloredShadow(colors.blue, '40')
```

---

## ⏱️ Animation Durations

```typescript
duration = {
  instant: 75,       // Immediate feedback
  fast: 150,         // Quick transitions
  normal: 300,       // Standard animations
  slow: 500,         // Deliberate animations
}

// Specific animation timings
animation = {
  dropAnimation: 800,       // Task drop animation
  celebration: 2000,        // Success celebration
  loadingStage: 2000,       // Loading stage transitions
  togglePause: 300,         // Ticker pause on toggle
}
```

### Animation Easings

```typescript
easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Custom ADHD-friendly easings
  snappy: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Quick, responsive
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',  // Natural, flowing
}
```

### Usage

```typescript
// Hover transitions
transition: `all ${duration.fast}ms ${easing.easeOut}`

// Mode transitions
transition: `transform ${duration.normal}ms ${easing.snappy}`

// Success animations
animation: `fadeIn ${duration.slow}ms ${easing.smooth}`
```

---

## 📱 Responsive Breakpoints

```typescript
breakpoints = {
  sm: '640px',    // Small devices
  md: '768px',    // Tablets
  lg: '1024px',   // Laptops
  xl: '1280px',   // Desktops
  '2xl': '1536px', // Large screens
}
```

### Mobile-First Approach

```typescript
// ✅ Mobile-first (default is mobile)
<div style={{
  padding: spacing[4],           // Mobile: 16px
  '@media (min-width: 768px)': {
    padding: spacing[6]          // Tablet+: 24px
  }
}}>

// Media query helper
const isMobile = window.innerWidth < 768
```

---

## 🎨 Component Style Patterns

### Card Pattern

```typescript
const cardStyle = {
  backgroundColor: semanticColors.bg.secondary,
  borderRadius: borderRadius['2xl'],
  padding: spacing[4],
  boxShadow: shadow.md,
  border: `1px solid ${semanticColors.border.default}`
}
```

### Button Pattern

```typescript
const buttonStyle = {
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: borderRadius.lg,
  fontSize: fontSize.base,
  fontWeight: fontWeight.semibold,
  backgroundColor: semanticColors.accent.primary,
  color: semanticColors.text.inverse,
  border: 'none',
  cursor: 'pointer',
  transition: `all ${duration.fast}ms ${easing.easeOut}`,

  // Hover state
  ':hover': {
    boxShadow: coloredShadow(semanticColors.accent.primary, '40')
  }
}
```

### Input Pattern

```typescript
const inputStyle = {
  width: '100%',
  padding: spacing[3],
  fontSize: fontSize.base,
  borderRadius: borderRadius.xl,
  backgroundColor: semanticColors.bg.secondary,
  border: `2px solid ${semanticColors.border.accent}`,
  color: semanticColors.text.primary,

  ':focus': {
    outline: 'none',
    borderColor: semanticColors.accent.primary,
    boxShadow: coloredShadow(semanticColors.accent.primary, '20')
  }
}
```

---

## ♿ Accessibility Guidelines

### ADHD-Specific Accessibility

```typescript
// Minimum sizes for ADHD users
const minTouchTarget = 44  // 44px minimum (WCAG AAA)
const minFontSize = fontSize.base  // 16px minimum

// High contrast for focus
const focusVisible = {
  outline: `3px solid ${semanticColors.accent.primary}`,
  outlineOffset: '2px'
}

// Reduced motion support
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const animation = prefersReducedMotion
  ? 'none'
  : `fadeIn ${duration.normal}ms`
```

### Color Contrast

```typescript
// All text meets WCAG AA standards
// Body text: 4.5:1 contrast ratio minimum
// Large text (18px+): 3:1 contrast ratio minimum

// Test your colors:
const textColor = semanticColors.text.primary
const bgColor = semanticColors.bg.primary
// Should meet 4.5:1 ratio
```

---

## 🎯 ADHD UX Principles

### Visual Hierarchy

```typescript
// Clear hierarchy with size and weight
h1: fontSize['2xl'] + fontWeight.bold
h2: fontSize.xl + fontWeight.semibold
h3: fontSize.lg + fontWeight.semibold
body: fontSize.base + fontWeight.normal
caption: fontSize.sm + semanticColors.text.secondary
```

### Generous Spacing

```typescript
// Reduce visual clutter
padding: spacing[4]      // 16px minimum for cards
gap: spacing[3]          // 12px between related items
sectionGap: spacing[8]   // 32px between sections
```

### Clear Interactive States

```typescript
// Button states (ADHD dopamine optimization)
default: {
  backgroundColor: semanticColors.accent.primary
}
hover: {
  boxShadow: coloredShadow(semanticColors.accent.primary, '40'),
  transform: 'translateY(-1px)'
}
active: {
  transform: 'translateY(0)',
  boxShadow: 'none'
}
disabled: {
  opacity: 0.5,
  cursor: 'not-allowed'
}
```

### Immediate Feedback

```typescript
// Always provide instant visual feedback
onClick: {
  // Show loading state immediately
  setIsProcessing(true)

  // Animate action (brief scale or color change)
  transition: `all ${duration.fast}ms`

  // Display success/error state
  showToast()
}
```

---

## 📦 Importing the Design System

```typescript
// Import all tokens
import {
  spacing,
  colors,
  semanticColors,
  fontSize,
  fontWeight,
  borderRadius,
  iconSize,
  shadow,
  coloredShadow,
  zIndex,
  duration,
  animation,
  easing
} from '@/lib/design-system'

// Use in components
<div style={{
  padding: spacing[4],
  backgroundColor: semanticColors.bg.primary,
  borderRadius: borderRadius.xl,
  fontSize: fontSize.base
}}>
  Content
</div>
```

---

## 🔧 Customizing the Design System

To add new tokens, edit `src/lib/design-system.ts`:

```typescript
// Add new spacing value
export const spacing = {
  // ... existing values
  28: '112px',  // New custom spacing
}

// Add new color
export const colors = {
  // ... existing colors
  teal: '#008080',  // New accent color
}

// Add new semantic color
export const semanticColors = {
  accent: {
    // ... existing accents
    tertiary: colors.teal
  }
}
```

---

**Last Updated**: 2025-10-25

**Next**: See [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) for component usage
