# Mobile-First Migration Template

**Quick-Start Guide**: Copy-paste template for migrating components to design system

---

## 🎯 Migration Workflow

```
1. Design at 375px (mobile-first)
   ↓
2. Replace hardcoded values with design tokens
   ↓
3. Ensure 44×44px touch targets
   ↓
4. Add responsive breakpoints (tablet/desktop)
   ↓
5. Test in Storybook (viewports + themes)
```

---

## 📋 Quick Checklist

Before starting:
- [ ] Read component file, understand purpose
- [ ] Note all hardcoded values (colors, px, font sizes)
- [ ] Check if component has Storybook stories
- [ ] Open Storybook in mobile viewport (375px)

During migration:
- [ ] Import design tokens at top
- [ ] Replace hardcoded colors → `semanticColors.*`
- [ ] Replace px values → `spacing[*]`
- [ ] Replace font sizes → `fontSize.*`
- [ ] Add 44×44px minimum touch targets
- [ ] Add `useReducedMotion()` for animations
- [ ] Add responsive breakpoints (`md:`, `lg:`)

After migration:
- [ ] Test mobile viewport (375px)
- [ ] Test tablet viewport (768px)
- [ ] Test desktop viewport (1440px)
- [ ] Test all themes (Solarized, Dracula, Nord, etc.)
- [ ] Run accessibility audit
- [ ] Test with `prefers-reduced-motion` enabled

---

## 📦 Step 1: Import Design Tokens

**Copy-Paste This Import Block**:

```typescript
'use client'

import React from 'react'
import {
  spacing,        // Spacing scale (4px grid)
  fontSize,       // Typography sizes
  fontWeight,     // Typography weights
  lineHeight,     // Typography line heights
  semanticColors, // Theme-aware colors
  colors,         // Raw colors (for mode identities)
  borderRadius,   // Border rounding
  shadows,        // Depth/elevation
  duration,       // Animation timing
  iconSize,       // Icon sizing
  hoverColors,    // Hover state colors
  gradients,      // Pre-built gradients
  createGradient  // Gradient helper function
} from '@/lib/design-system'
import { useReducedMotion } from '@/hooks/useReducedMotion'
```

**What to import**:
- **Always**: `spacing`, `fontSize`, `semanticColors`, `borderRadius`
- **For text**: `fontWeight`, `lineHeight`
- **For animations**: `duration`, `useReducedMotion` hook
- **For mode colors**: `colors` (Capture=cyan, Scout=blue, Hunt=green, Map=purple, Mend=orange)
- **For buttons**: `hoverColors`, `gradients`
- **For icons**: `iconSize`
- **For depth**: `shadows`

---

## 🎨 Step 2: Replace Hardcoded Values

### 2A. Colors → Semantic Colors

```typescript
// ❌ BEFORE: Hardcoded colors (won't adapt to themes)
backgroundColor: '#073642'
color: '#93a1a1'
borderColor: '#586e75'

// ✅ AFTER: Semantic colors (adapts to all 20+ themes)
backgroundColor: semanticColors.bg.secondary
color: semanticColors.text.primary
borderColor: semanticColors.border.default
```

**Semantic Color Reference**:

| Use Case | Token | Example Value |
|----------|-------|---------------|
| Primary background | `semanticColors.bg.primary` | `#002b36` (Solarized Dark) |
| Secondary background | `semanticColors.bg.secondary` | `#073642` |
| Tertiary background | `semanticColors.bg.tertiary` | `#586e75` |
| Primary text | `semanticColors.text.primary` | `#93a1a1` |
| Secondary text | `semanticColors.text.secondary` | `#586e75` |
| Muted text | `semanticColors.text.muted` | `#586e75` |
| Inverse text (on dark) | `semanticColors.text.inverse` | `#002b36` |
| Default border | `semanticColors.border.default` | `#586e75` |
| Focus border | `semanticColors.border.focus` | `#268bd2` |
| Accent border | `semanticColors.border.accent` | `#2aa198` |
| Primary accent | `semanticColors.accent.primary` | `#2aa198` (cyan) |
| Secondary accent | `semanticColors.accent.secondary` | `#268bd2` (blue) |
| Success | `semanticColors.accent.success` | `#859900` (green) |
| Warning | `semanticColors.accent.warning` | `#b58900` (yellow) |
| Error | `semanticColors.accent.error` | `#dc322f` (red) |

**Mode-Specific Colors** (use raw `colors.*`):

```typescript
// For biological mode identity colors
colors.cyan    // #2aa198 - Capture mode
colors.blue    // #268bd2 - Scout mode
colors.green   // #859900 - Hunt mode
colors.violet  // #6c71c4 - Map mode
colors.orange  // #cb4b16 - Mend mode
```

---

### 2B. Spacing → Spacing Tokens

```typescript
// ❌ BEFORE: Hardcoded px values
padding: '16px'
margin: '24px'
gap: '8px'
width: '48px'
height: '44px'

// ✅ AFTER: Spacing tokens (4px grid system)
padding: spacing[4]       // 16px
margin: spacing[6]        // 24px
gap: spacing[2]           // 8px
width: spacing[12]        // 48px
height: '44px'            // Touch target (off-grid, documented)
```

**Spacing Scale Reference**:

| Token | Value | Common Use |
|-------|-------|------------|
| `spacing[0]` | 0px | No spacing |
| `spacing[1]` | 4px | Micro gaps |
| `spacing[2]` | 8px | Small gaps, button padding |
| `spacing[3]` | 12px | Medium gaps |
| `spacing[4]` | 16px | Default gap, card padding |
| `spacing[5]` | 20px | Large gaps |
| `spacing[6]` | 24px | Section spacing |
| `spacing[8]` | 32px | Major sections |
| `spacing[12]` | 48px | Large sections |
| `spacing[16]` | 64px | Extra large spacing |

---

### 2C. Typography → Font Tokens

```typescript
// ❌ BEFORE: Hardcoded font sizes and weights
fontSize: '16px'
fontWeight: '600'
lineHeight: '1.5'

// ✅ AFTER: Typography tokens
fontSize: fontSize.base           // 16px
fontWeight: fontWeight.semibold   // 600
lineHeight: lineHeight.normal     // 1.5
```

**Typography Scale**:

| Element | Mobile | Token | Weight |
|---------|--------|-------|--------|
| Hero | 28-36px | `fontSize['2xl']` - `fontSize['4xl']` | `fontWeight.bold` |
| H1 | 24-32px | `fontSize.xl` - `fontSize['3xl']` | `fontWeight.bold` |
| H2 | 20-28px | `fontSize.lg` - `fontSize['2xl']` | `fontWeight.semibold` |
| H3 | 18-24px | `fontSize.lg` - `fontSize.xl` | `fontWeight.semibold` |
| Body | 16px | `fontSize.base` | `fontWeight.regular` |
| Small | 14px | `fontSize.sm` | `fontWeight.regular` |
| Caption | 12px | `fontSize.xs` | `fontWeight.regular` |

**IMPORTANT**: Use `fontSize.base` (16px) for mobile inputs to prevent iOS zoom-in!

---

### 2D. Border Radius → Rounding Tokens

```typescript
// ❌ BEFORE: Hardcoded border radius
borderRadius: '8px'
borderRadius: '12px'
borderRadius: '50%'

// ✅ AFTER: Border radius tokens
borderRadius: borderRadius.base   // 8px - default for buttons/cards
borderRadius: borderRadius.lg     // 12px - large cards
borderRadius: borderRadius.pill   // 9999px - fully rounded (avatars)
```

---

## 📱 Step 3: Mobile-First Touch Targets

### 3A. Minimum 44×44px Touch Targets

**WCAG Guideline**: All interactive elements must be at least 44×44px for touch.

```typescript
// ✅ Button with 44px touch target
<button
  style={{
    minWidth: '44px',
    minHeight: '44px',
    padding: spacing[2],              // Internal padding
    borderRadius: borderRadius.lg,
    backgroundColor: semanticColors.accent.primary
  }}
>
  <Icon size={iconSize.base} />
</button>

// ✅ Checkbox with 44px touch area
<div
  style={{
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <input
    type="checkbox"
    style={{
      width: spacing[5],    // 20px visual size
      height: spacing[5],   // 20px visual size
      cursor: 'pointer'
    }}
  />
</div>

// ✅ Input with 44px height
<input
  type="text"
  style={{
    width: '100%',
    minHeight: '44px',
    padding: spacing[3],              // 12px
    fontSize: fontSize.base,          // 16px (prevents iOS zoom)
    borderRadius: borderRadius.base,
    backgroundColor: semanticColors.bg.secondary
  }}
/>
```

### 3B. Touch-Friendly Spacing

```typescript
// ✅ Adequate spacing between touch targets (8px minimum)
<div
  className="flex"
  style={{
    gap: spacing[2],    // 8px minimum
  }}
>
  <IconButton />
  <IconButton />
  <IconButton />
</div>

// ✅ Card with comfortable tap area
<button
  className="w-full text-left"
  style={{
    padding: spacing[4],              // 16px all around
    minHeight: '60px',                // Comfortable tap
    borderRadius: borderRadius.lg,
    backgroundColor: semanticColors.bg.secondary
  }}
>
  <CardContent />
</button>
```

---

## 📐 Step 4: Responsive Breakpoints

### 4A. Mobile-First Layout

**Pattern**: Stack vertically on mobile, horizontal on tablet+

```typescript
// ✅ Mobile: vertical stack, Tablet: horizontal
<div
  className="flex flex-col md:flex-row"
  style={{ gap: spacing[4] }}
>
  <Card />
  <Card />
  <Card />
</div>
```

**Tailwind Breakpoints**:
- `sm:` - 640px+ (small tablets)
- `md:` - 768px+ (tablets)
- `lg:` - 1024px+ (laptops)
- `xl:` - 1280px+ (desktops)

### 4B. Responsive Grid

```typescript
// ✅ Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  style={{ gap: spacing[4] }}
>
  <Card />
  <Card />
  <Card />
</div>
```

### 4C. Responsive Typography

```typescript
// ✅ Scales font size with viewport
<h1
  className="text-2xl md:text-3xl lg:text-4xl"
  style={{
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight
  }}
>
  Page Title
</h1>
```

### 4D. Responsive Padding

```typescript
// ✅ Mobile: tight, Tablet: moderate, Desktop: generous
<div
  className="px-4 md:px-6 lg:px-8"
  // Translates to:
  // Mobile: spacing[4] (16px)
  // Tablet: spacing[6] (24px)
  // Desktop: spacing[8] (32px)
>
  <Content />
</div>
```

### 4E. Show/Hide Based on Viewport

```typescript
// ✅ Desktop-only sidebar
<div className="hidden lg:block">
  <Sidebar />
</div>

// ✅ Mobile-only hamburger menu
<div className="block lg:hidden">
  <MobileMenu />
</div>
```

---

## 🎞️ Step 5: Animations with Reduced Motion

### 5A. Always Use `useReducedMotion()` Hook

```typescript
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { duration } from '@/lib/design-system'

const MyComponent = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : parseFloat(duration.normal) / 1000
      }}
    >
      <Content />
    </motion.div>
  )
}
```

### 5B. CSS Transitions with Reduced Motion

```typescript
<button
  style={{
    padding: spacing[3],
    backgroundColor: semanticColors.accent.primary,
    transition: shouldReduceMotion ? 'none' : `all ${duration.fast}`,
    transform: shouldReduceMotion ? 'none' : 'scale(1)'
  }}
  onMouseDown={(e) => {
    if (!shouldReduceMotion) {
      e.currentTarget.style.transform = 'scale(0.95)'
    }
  }}
  onMouseUp={(e) => {
    if (!shouldReduceMotion) {
      e.currentTarget.style.transform = 'scale(1)'
    }
  }}
>
  Click Me
</button>
```

---

## 📚 Complete Component Example

### Before Migration (Hardcoded Values)

```typescript
'use client'

import React from 'react'

export default function MyButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#fdf6e3',
        backgroundColor: '#2aa198',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#35b5ac'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#2aa198'
      }}
    >
      {label}
    </button>
  )
}
```

### After Migration (Design Tokens + Mobile-First)

```typescript
'use client'

import React from 'react'
import {
  spacing,
  fontSize,
  fontWeight,
  semanticColors,
  colors,
  hoverColors,
  borderRadius,
  duration
} from '@/lib/design-system'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function MyButton({ label, onClick, className = '' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <button
      onClick={onClick}
      className={`active:scale-95 ${className}`}
      style={{
        // Mobile-first sizing (44px touch target)
        minHeight: '44px',
        minWidth: '44px',
        padding: `${spacing[3]} ${spacing[4]}`,  // 12px 16px

        // Typography
        fontSize: fontSize.sm,                     // 14px
        fontWeight: fontWeight.semibold,           // 600

        // Colors (theme-aware)
        color: semanticColors.text.inverse,
        backgroundColor: colors.cyan,              // Mode color

        // Visual styling
        border: 'none',
        borderRadius: borderRadius.base,           // 8px
        cursor: 'pointer',

        // Animation
        transition: shouldReduceMotion ? 'none' : `all ${duration.fast}`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = hoverColors.cyan
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.cyan
      }}
    >
      {label}
    </button>
  )
}
```

**Key Improvements**:
- ✅ 44px minimum touch target
- ✅ Design tokens (adapts to all themes)
- ✅ Reduced motion support
- ✅ Semantic colors for text
- ✅ Mode color (cyan for Capture)
- ✅ Hover state with design tokens

---

## 🧪 Step 6: Testing Checklist

### Mobile Testing (375px)
- [ ] Component renders correctly at 375px width
- [ ] All touch targets are 44×44px minimum
- [ ] Text is readable (no tiny fonts)
- [ ] No horizontal overflow
- [ ] Touch interactions work (not just hover)
- [ ] Input font size is 16px (prevents iOS zoom)

### Tablet Testing (768px)
- [ ] Layout adapts correctly (md: breakpoints)
- [ ] Spacing increases appropriately
- [ ] No awkward gaps or overlaps
- [ ] Touch targets remain 44×44px

### Desktop Testing (1440px)
- [ ] Layout uses available space (lg: breakpoints)
- [ ] Typography scales up if needed
- [ ] Hover states work
- [ ] Keyboard navigation works

### Theme Testing
- [ ] Solarized Light (default)
- [ ] Solarized Dark
- [ ] Dracula
- [ ] Nord Light
- [ ] Nord Dark
- [ ] At least 2 creative themes (Jungle, Synthwave, etc.)

### Accessibility Testing
- [ ] Run Storybook a11y addon
- [ ] Keyboard navigation (Tab, Enter, ESC)
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader friendly

### Motion Testing
- [ ] Enable `prefers-reduced-motion` in browser
- [ ] Verify animations are disabled/simplified
- [ ] Component still functional without animations

---

## 🚀 Quick Migration Commands

```bash
# Navigate to frontend directory
cd frontend

# Run Storybook (test visually)
npm run storybook

# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm test -- ComponentName

# Build (final verification)
npm run build
```

---

## 📖 Reference Components (Perfect Examples)

Study these for patterns:

1. **SystemButton** (`src/components/system/SystemButton.tsx`)
   - Perfect example of design tokens
   - Responsive sizing (sm, base, lg)
   - Touch-friendly by default
   - Reduced motion support

2. **ChevronButton** (`src/components/mobile/ChevronButton.tsx`)
   - Mobile-optimized
   - 44×44px touch targets
   - Theme support

3. **CaptureMode** (`src/components/mobile/modes/CaptureMode.tsx`)
   - Mobile-first layout
   - Design system usage
   - Voice input patterns

4. **SystemCard** (`src/components/system/SystemCard.tsx`)
   - Responsive padding
   - Theme support
   - Glass morphism

---

## 🎯 Common Migration Patterns

### Pattern 1: Replace CSS-in-JS Inline Styles

```typescript
// ❌ BEFORE
<div style={{ backgroundColor: '#073642', padding: '16px', borderRadius: '8px' }}>

// ✅ AFTER
<div style={{
  backgroundColor: semanticColors.bg.secondary,
  padding: spacing[4],
  borderRadius: borderRadius.base
}}>
```

### Pattern 2: Replace Tailwind Utilities

```typescript
// ❌ BEFORE
<div className="bg-[#073642] p-4 rounded-lg">

// ✅ AFTER
<div style={{
  backgroundColor: semanticColors.bg.secondary,
  padding: spacing[4],
  borderRadius: borderRadius.lg
}}>
```

### Pattern 3: Replace CSS Variables

```typescript
// ❌ BEFORE
<div style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}>

// ✅ AFTER
<div style={{
  color: semanticColors.text.primary,
  backgroundColor: semanticColors.bg.primary
}}>
```

### Pattern 4: Responsive Font Sizes

```typescript
// ❌ BEFORE
<h1 style={{ fontSize: '28px' }}>Title</h1>

// ✅ AFTER (Mobile-first)
<h1
  className="text-2xl md:text-3xl lg:text-4xl"
  style={{ fontWeight: fontWeight.bold }}
>
  Title
</h1>
```

### Pattern 5: Mode-Specific Colors

```typescript
// ✅ Use raw colors for biological mode identities
const modeColors = {
  capture: colors.cyan,    // #2aa198
  scout: colors.blue,      // #268bd2
  hunt: colors.green,      // #859900
  map: colors.violet,      // #6c71c4
  mend: colors.orange      // #cb4b16
}

<div style={{
  backgroundColor: modeColors.capture,
  color: semanticColors.text.inverse
}}>
  Capture Mode
</div>
```

---

**Last Updated**: December 2024
**Maintained By**: Frontend Development Team
**Related**: DESIGN_SYSTEM_MIGRATION_PLAN.md, MOBILE_RESPONSIVE_PATTERNS.md
