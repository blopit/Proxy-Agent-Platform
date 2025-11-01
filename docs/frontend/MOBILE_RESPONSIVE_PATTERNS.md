# Mobile Responsive Patterns

**Purpose**: Comprehensive guide for implementing mobile-first, responsive components
**Target Devices**: Mobile (375px+), Tablet (768px+), Desktop (1440px+)
**Framework**: Design tokens + CSS/Tailwind + Responsive utilities

---

## 📱 Mobile-First Philosophy

### Core Principles

1. **Design for mobile first**, then enhance for larger screens
2. **Touch-friendly by default** - 44×44px minimum touch targets
3. **Performance-optimized** - Lazy load, code split, optimize images
4. **Gesture-aware** - Swipe, long-press, pull-to-refresh
5. **Accessibility-first** - Screen readers, keyboard nav, semantic HTML

---

## 🎯 Breakpoint System

### Standard Breakpoints

```typescript
// Tailwind breakpoints (already configured)
const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large desktops
}

// Custom breakpoints for specific needs
const customBreakpoints = {
  mobile: '375px',   // Min mobile (iPhone SE)
  mobileLg: '428px', // Large phones (iPhone Pro Max)
  tablet: '768px',   // Tablets
  desktop: '1440px', // Standard desktop
  wide: '1920px'     // Ultra-wide monitors
}
```

### Storybook Viewports

```typescript
// Already configured in .storybook/preview.ts
viewports: {
  mobile: { width: 375, height: 667 },    // iPhone SE
  tablet: { width: 768, height: 1024 },   // iPad
  desktop: { width: 1440, height: 900 },  // Standard
  wide: { width: 1920, height: 1080 }     // Ultra-wide
}
```

---

## 🏗️ Responsive Layout Patterns

### Pattern 1: Stack → Horizontal

**Use Case**: Card grids, navigation bars, button groups

**Mobile** (default): Stack vertically
**Desktop**: Horizontal layout

```typescript
import { spacing } from '@/lib/design-system'

// Mobile-first approach
<div className="flex flex-col md:flex-row" style={{ gap: spacing[4] }}>
  <Card />
  <Card />
  <Card />
</div>
```

**Explanation**:
- `flex-col` - Default vertical stacking (mobile)
- `md:flex-row` - Switch to horizontal at 768px+ (tablet/desktop)
- `gap: spacing[4]` - Consistent 16px gap using design tokens

### Pattern 2: Full Width → Constrained

**Use Case**: Content containers, modals, forms

```typescript
import { spacing } from '@/lib/design-system'

<div
  className="w-full md:max-w-2xl lg:max-w-4xl mx-auto"
  style={{ padding: spacing[4] }}
>
  <Content />
</div>
```

**Breakpoints**:
- Mobile: Full width with padding
- Tablet: Max 672px (max-w-2xl)
- Desktop: Max 896px (max-w-4xl)
- Always centered with `mx-auto`

### Pattern 3: Single Column → Multi-Column

**Use Case**: Dashboard grids, task lists, card galleries

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: spacing[4] }}>
  <Card />
  <Card />
  <Card />
</div>
```

**Grid Behavior**:
- Mobile: 1 column (375px+)
- Tablet: 2 columns (768px+)
- Desktop: 3 columns (1024px+)

### Pattern 4: Hidden → Visible

**Use Case**: Desktop sidebars, advanced filters, metadata

```typescript
// Desktop-only sidebar
<div className="hidden lg:block">
  <Sidebar />
</div>

// Mobile hamburger menu
<div className="block lg:hidden">
  <MobileMenu />
</div>
```

---

## 👆 Touch-Friendly Patterns

### Minimum Touch Target Size

**WCAG Guidelines**: 44×44px minimum for touch targets

```typescript
import { spacing } from '@/lib/design-system'

// ✅ CORRECT: 44x44px touch target
<button
  style={{
    minWidth: '44px',
    minHeight: '44px',
    padding: spacing[2],
    // or use spacing[11] if that exists, or define it as 44px
  }}
>
  <Icon size={20} />
</button>

// ❌ WRONG: 32x32px too small for touch
<button
  style={{
    width: '32px',
    height: '32px'
  }}
>
  <Icon size={20} />
</button>
```

### Touch Target Spacing

```typescript
import { spacing } from '@/lib/design-system'

// Adequate spacing between touch targets (8px minimum)
<div className="flex" style={{ gap: spacing[2] }}>
  <IconButton />
  <IconButton />
  <IconButton />
</div>
```

### Tap-Friendly Card

```typescript
import { spacing, borderRadius, semanticColors } from '@/lib/design-system'

<button
  className="w-full text-left active:scale-[0.98] transition-transform"
  style={{
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    backgroundColor: semanticColors.bg.secondary,
    minHeight: '60px' // Comfortable tap target
  }}
>
  <CardContent />
</button>
```

---

## 🎨 Responsive Typography

### Font Size Scaling

```typescript
import { fontSize, fontWeight, lineHeight } from '@/lib/design-system'

// ✅ RESPONSIVE: Scales with viewport
<h1
  className="text-2xl md:text-3xl lg:text-4xl"
  style={{
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight
  }}
>
  Page Title
</h1>

// Body text - stays consistent
<p style={{
  fontSize: fontSize.base,  // Always 16px
  lineHeight: lineHeight.normal
}}>
  Body content
</p>
```

### Responsive Typography Scale

| Element | Mobile | Tablet | Desktop | Design Token |
|---------|--------|--------|---------|--------------|
| Hero | 28px | 32px | 36px | `fontSize.2xl / 3xl / 4xl` |
| H1 | 24px | 28px | 32px | `fontSize.xl / 2xl / 3xl` |
| H2 | 20px | 24px | 28px | `fontSize.lg / xl / 2xl` |
| H3 | 18px | 20px | 24px | `fontSize.lg / lg / xl` |
| Body | 16px | 16px | 16px | `fontSize.base` |
| Small | 14px | 14px | 14px | `fontSize.sm` |
| Caption | 12px | 12px | 12px | `fontSize.xs` |

---

## 📐 Responsive Spacing

### Container Padding

```typescript
import { spacing } from '@/lib/design-system'

// Mobile: tight padding, Desktop: generous padding
<div
  className="px-4 md:px-6 lg:px-8"
  style={{
    // Translated to design tokens:
    // Mobile: spacing[4] (16px)
    // Tablet: spacing[6] (24px)
    // Desktop: spacing[8] (32px)
  }}
>
  <Content />
</div>
```

### Responsive Margins

```typescript
import { spacing } from '@/lib/design-system'

// Section spacing scales with viewport
<section
  className="my-6 md:my-8 lg:my-12"
  // Mobile: 24px, Tablet: 32px, Desktop: 48px
>
  <SectionContent />
</section>
```

### Responsive Gaps

```typescript
import { spacing } from '@/lib/design-system'

// Flex gap scales up
<div
  className="flex flex-col gap-3 md:gap-4 lg:gap-6"
  // Mobile: 12px, Tablet: 16px, Desktop: 24px
>
  <Item />
  <Item />
</div>
```

---

## 🎬 Responsive Animations

### Reduced Motion Support

**CRITICAL**: Always respect `prefers-reduced-motion`

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

### Touch-Responsive Animation

```typescript
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Scale down on active (touch press)
<motion.button
  whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
  transition={{ duration: 0.15 }}
>
  Tap Me
</motion.button>
```

### Mobile Performance Optimization

```typescript
// Disable expensive animations on mobile
const isMobile = window.innerWidth < 768

<motion.div
  animate={isMobile ? {} : { x: 100 }}
  transition={{ duration: 0.5 }}
>
  <Content />
</motion.div>
```

---

## 📱 Mobile-Specific Patterns

### Pattern 1: Pull-to-Refresh

```typescript
import { useState } from 'react'
import { spacing, semanticColors } from '@/lib/design-system'

const PullToRefreshList = () => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const handleTouchStart = (e: TouchEvent) => {
    // Track initial touch position
  }

  const handleTouchMove = (e: TouchEvent) => {
    // Calculate pull distance
    if (window.scrollY === 0) {
      setPullDistance(/* calculate */)
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      setIsPulling(true)
      // Trigger refresh
    }
    setPullDistance(0)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isPulling && <RefreshIndicator />}
      <List />
    </div>
  )
}
```

### Pattern 2: Swipeable Cards

```typescript
import { motion } from 'framer-motion'
import { borderRadius, semanticColors } from '@/lib/design-system'

const SwipeableCard = ({ onSwipeLeft, onSwipeRight }) => {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
        if (offset.x > 100) onSwipeRight()
        if (offset.x < -100) onSwipeLeft()
      }}
      style={{
        borderRadius: borderRadius.lg,
        backgroundColor: semanticColors.bg.secondary,
        cursor: 'grab',
      }}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <CardContent />
    </motion.div>
  )
}
```

### Pattern 3: Bottom Sheet Modal

**Use Case**: Mobile-friendly modals, action sheets

```typescript
import { motion, AnimatePresence } from 'framer-motion'
import { spacing, borderRadius, semanticColors, zIndex } from '@/lib/design-system'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const BottomSheetModal = ({ isOpen, onClose, children }) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: zIndex.overlay
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={shouldReduceMotion ? {} : { y: '100%' }}
            animate={{ y: 0 }}
            exit={shouldReduceMotion ? {} : { y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, { offset }) => {
              if (offset.y > 150) onClose()
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: semanticColors.bg.primary,
              borderTopLeftRadius: borderRadius.xl,
              borderTopRightRadius: borderRadius.xl,
              padding: spacing[6],
              zIndex: zIndex.modal,
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Drag Handle */}
            <div
              style={{
                width: '40px',
                height: '4px',
                backgroundColor: semanticColors.border.default,
                borderRadius: borderRadius.pill,
                margin: '0 auto',
                marginBottom: spacing[4]
              }}
            />

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Pattern 4: Horizontal Scroll (Netflix-Style)

```typescript
import { spacing, borderRadius } from '@/lib/design-system'

const HorizontalScrollRow = ({ items }) => {
  return (
    <div
      className="overflow-x-auto scrollbar-hide"
      style={{
        display: 'flex',
        gap: spacing[3],
        padding: spacing[4],
        // Hide scrollbar but maintain functionality
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            minWidth: '280px',
            borderRadius: borderRadius.lg
          }}
        >
          <Card {...item} />
        </div>
      ))}
    </div>
  )
}
```

### Pattern 5: Infinite Scroll

```typescript
import { useEffect, useRef, useState } from 'react'

const InfiniteScrollList = ({ loadMore, hasMore }) => {
  const [loading, setLoading] = useState(false)
  const observerTarget = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setLoading(true)
          loadMore().then(() => setLoading(false))
        }
      },
      { threshold: 1.0 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  return (
    <div>
      <List />
      <div ref={observerTarget} style={{ height: '1px' }} />
      {loading && <LoadingSpinner />}
    </div>
  )
}
```

---

## 🎯 Component-Specific Responsive Patterns

### Responsive Button

```typescript
import { spacing, fontSize, borderRadius, semanticColors } from '@/lib/design-system'

<button
  className="px-4 py-2 md:px-6 md:py-3"
  style={{
    fontSize: fontSize.sm,      // Mobile: 14px
    // Use Tailwind md: for larger sizes
    borderRadius: borderRadius.lg,
    backgroundColor: semanticColors.accent.primary,
    minHeight: '44px' // Touch-friendly
  }}
>
  <span className="md:inline hidden">Full Label</span>
  <span className="md:hidden">Short</span>
</button>
```

### Responsive Card

```typescript
import { spacing, borderRadius, semanticColors } from '@/lib/design-system'

<div
  className="p-4 md:p-6"
  style={{
    borderRadius: borderRadius.lg,
    backgroundColor: semanticColors.bg.secondary,
    // Mobile: 16px padding, Desktop: 24px padding
  }}
>
  <div className="flex flex-col md:flex-row" style={{ gap: spacing[4] }}>
    <CardImage className="w-full md:w-1/3" />
    <CardContent className="w-full md:w-2/3" />
  </div>
</div>
```

### Responsive Navigation

```typescript
import { spacing, semanticColors, zIndex } from '@/lib/design-system'

// Mobile: Bottom navigation bar
// Desktop: Top horizontal nav
<nav
  className="fixed bottom-0 md:top-0 left-0 right-0 md:static"
  style={{
    backgroundColor: semanticColors.bg.secondary,
    padding: spacing[2],
    zIndex: zIndex.fixed
  }}
>
  <div className="flex justify-around md:justify-start" style={{ gap: spacing[4] }}>
    <NavItem />
    <NavItem />
    <NavItem />
  </div>
</nav>
```

---

## 📊 Responsive Images & Media

### Responsive Image

```typescript
<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
  {/* 16:9 aspect ratio */}
  <img
    src="/image.jpg"
    srcSet="/image-375.jpg 375w, /image-768.jpg 768w, /image-1440.jpg 1440w"
    sizes="(max-width: 768px) 100vw, (max-width: 1440px) 50vw, 720px"
    alt="Responsive image"
    className="absolute inset-0 w-full h-full object-cover"
    loading="lazy"
  />
</div>
```

### Video Embed (Responsive)

```typescript
import { borderRadius } from '@/lib/design-system'

<div
  className="relative w-full"
  style={{
    paddingBottom: '56.25%', // 16:9
    borderRadius: borderRadius.lg,
    overflow: 'hidden'
  }}
>
  <iframe
    className="absolute inset-0 w-full h-full"
    src="https://youtube.com/embed/..."
    allowFullScreen
  />
</div>
```

---

## 🧪 Testing Responsive Components

### Manual Testing Checklist

- [ ] Test on real devices (iPhone, Android, iPad)
- [ ] Test in Storybook viewports (375px, 768px, 1440px, 1920px)
- [ ] Test orientation changes (portrait ↔ landscape)
- [ ] Test with browser zoom (100%, 125%, 150%, 200%)
- [ ] Test touch interactions (tap, swipe, long-press)
- [ ] Test with screen reader (VoiceOver, TalkBack)
- [ ] Test with reduced motion enabled
- [ ] Test slow network (throttle to 3G)

### Responsive Testing in Storybook

```typescript
// Example story with multiple viewport variants
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile'
    }
  }
}

export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
}

export const DesktopView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop'
    }
  }
}
```

### Automated Testing (Jest + Testing Library)

```typescript
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'

test('shows mobile menu on small screens', () => {
  // Mock window.innerWidth
  global.innerWidth = 375

  render(<Navigation />)

  expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument()
})

test('shows desktop nav on large screens', () => {
  global.innerWidth = 1440

  render(<Navigation />)

  expect(screen.getByRole('navigation')).toBeInTheDocument()
})
```

---

## 📚 Reference Examples

### Perfect Mobile Components (Study These)

1. **CaptureMode** (`src/components/mobile/modes/CaptureMode.tsx`)
   - Touch-friendly capture interface
   - Voice input support
   - 2-second speed goal

2. **ChevronButton** (`src/components/mobile/ChevronButton.tsx`)
   - 44x44px touch target
   - Touch feedback animation
   - Accessible

3. **EnergyGauge** (`src/components/mobile/EnergyGauge.tsx`)
   - Responsive sizing
   - Touch-draggable slider
   - Visual feedback

4. **ScoutMode** (`src/components/mobile/modes/ScoutMode.tsx`)
   - Netflix-style horizontal scrolling
   - Category cards
   - Swipe gestures

5. **SystemButton** (`src/components/system/SystemButton.tsx`)
   - Responsive sizing (sm, base, lg)
   - Touch-friendly by default
   - Accessibility built-in

---

## 🎯 Quick Reference

### Mobile-First Checklist

- [ ] Start with mobile layout (375px base)
- [ ] Use design system tokens (no hardcoded values)
- [ ] Ensure 44×44px minimum touch targets
- [ ] Test with real devices
- [ ] Support gestures (swipe, long-press)
- [ ] Respect `prefers-reduced-motion`
- [ ] Optimize performance (lazy load, code split)
- [ ] Test with screen reader
- [ ] Support orientation changes
- [ ] Handle safe area insets (iOS notch)

### Responsive Utilities

```typescript
// Tailwind responsive classes
className="
  flex-col md:flex-row          // Layout direction
  text-sm md:text-base lg:text-lg  // Typography
  p-4 md:p-6 lg:p-8             // Padding
  gap-2 md:gap-4 lg:gap-6       // Spacing
  hidden md:block               // Visibility
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3  // Grid
"
```

### Design Token Imports

```typescript
import {
  spacing,        // All spacing needs
  fontSize,       // Typography sizes
  fontWeight,     // Typography weights
  lineHeight,     // Typography line heights
  semanticColors, // Theme-aware colors
  borderRadius,   // Rounding
  shadows,        // Depth/elevation
  duration,       // Animation timing
  iconSize        // Icon sizing
} from '@/lib/design-system'
```

---

**Last Updated**: December 2024
**Maintained By**: Frontend Development Team
**Related Docs**: DESIGN_PRINCIPLES.md, VISUAL_STYLE_GUIDE.md, INTERACTION_PATTERNS.md
