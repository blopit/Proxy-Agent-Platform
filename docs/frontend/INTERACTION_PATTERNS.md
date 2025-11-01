# Interaction Patterns & Micro-Animations

A comprehensive guide to creating consistent, ADHD-friendly interactions and animations.

---

## Philosophy

Animations serve three purposes:
1. **Provide instant feedback** - Confirm user actions
2. **Guide attention** - Direct focus to changes
3. **Create continuity** - Smooth state transitions

**Golden Rule**: Every animation must have a purpose. Decorative animations increase cognitive load for ADHD users.

---

## 1. Animation Timing

### Duration Constants

```typescript
duration = {
  instant:  0,      // No animation (accessibility)
  fast:     150,    // Quick feedback (button press, toggle)
  base:     300,    // Standard transitions (card expand, modal open)
  slow:     500,    // Deliberate animations (page transitions)
  slowest:  1000    // Celebratory animations (achievement unlocked)
}
```

### Usage Guidelines

| Duration | Use Case | Examples |
|----------|----------|----------|
| instant (0ms) | Motion-sensitive users | All animations when `prefers-reduced-motion` |
| fast (150ms) | Immediate feedback | Button press, checkbox toggle, hover state |
| base (300ms) | Standard transitions | Card expand, dropdown open, tooltip appear |
| slow (500ms) | Deliberate changes | Mode switching, page transitions, panel slide |
| slowest (1000ms) | Celebrations | Task completion, level up, achievement unlock |

### Easing Functions

```typescript
easing = {
  linear:     [0, 0, 1, 1],           // Constant speed (loading indicators)
  ease:       [0.25, 0.1, 0.25, 1],   // Natural deceleration (default)
  easeIn:     [0.4, 0, 1, 1],         // Slow start (elements entering)
  easeOut:    [0, 0, 0.2, 1],         // Slow end (elements exiting)
  easeInOut:  [0.4, 0, 0.2, 1],       // Slow both ends (morphing, scaling)
  spring:     { type: "spring", stiffness: 300, damping: 30 }  // Bouncy (playful)
}
```

**When to Use Each**:
- **linear**: Loading spinners, progress bars
- **ease**: Default for most transitions
- **easeIn**: Elements entering viewport
- **easeOut**: Elements exiting viewport
- **easeInOut**: Morphing between states, scaling
- **spring**: Playful interactions, celebration animations

---

## 2. Motion Accessibility

### Respect User Preferences

```typescript
import { useReducedMotion } from '@/hooks/useReducedMotion'

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,  // Disable if requested
        ease: 'easeOut'
      }}
    >
      Content
    </motion.div>
  )
}
```

### Implementation

```typescript
// hooks/useReducedMotion.ts
export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)

    const handleChange = () => setShouldReduceMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return shouldReduceMotion
}
```

**Accessibility Rules**:
- Always check `prefers-reduced-motion`
- Set duration to 0 when motion is reduced
- Maintain functional behavior without animation
- No flashing content (max 3 times per second)

---

## 3. Button Interactions

### Button Press (Scale)

```tsx
import { motion } from 'framer-motion'

<motion.button
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.15 }}
  style={{
    padding: `${spacing[2]} ${spacing[4]}`,
    background: semanticColors.accent.primary,
    borderRadius: borderRadius.base
  }}
>
  Click Me
</motion.button>
```

**Effect**: Button shrinks slightly on press for tactile feedback.

### Button Hover (Lift)

```tsx
<motion.button
  whileHover={{ y: -2, boxShadow: shadows.md }}
  transition={{ duration: 0.15 }}
>
  Hover Me
</motion.button>
```

**Effect**: Button lifts up with increased shadow on hover.

### Loading State

```tsx
function LoadingButton() {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <button disabled={isLoading}>
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block', marginRight: spacing[2] }}
          >
            <Loader size={16} />
          </motion.div>
          Loading...
        </>
      ) : (
        'Submit'
      )}
    </button>
  )
}
```

**Effect**: Spinner rotates infinitely, button is disabled.

### Success Confirmation

```tsx
function SuccessButton() {
  const [isSuccess, setIsSuccess] = React.useState(false)

  return (
    <motion.button
      animate={isSuccess ? {
        scale: [1, 1.1, 1],
        backgroundColor: [
          semanticColors.accent.primary,
          semanticColors.accent.success,
          semanticColors.accent.success
        ]
      } : {}}
      transition={{ duration: 0.5 }}
    >
      {isSuccess ? <CheckCircle size={20} /> : 'Save'}
    </motion.button>
  )
}
```

**Effect**: Button pulses and changes to green on success.

---

## 4. Card Interactions

### Card Hover (Lift + Scale)

```tsx
<motion.div
  whileHover={{
    scale: 1.02,
    y: -4,
    boxShadow: shadows.md
  }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
  style={{
    background: semanticColors.bg.secondary,
    borderRadius: borderRadius.base,
    padding: spacing[6],
    cursor: 'pointer'
  }}
>
  <h3>Interactive Card</h3>
  <p>Hover to see lift effect</p>
</motion.div>
```

**Effect**: Card lifts up and scales slightly with enhanced shadow.

### Card Enter Animation (Stagger)

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1  // 100ms delay between each card
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div
  variants={container}
  initial="hidden"
  animate="show"
  style={{ display: 'grid', gap: spacing[5] }}
>
  {cards.map(card => (
    <motion.div
      key={card.id}
      variants={item}
      transition={{ duration: 0.3 }}
    >
      <Card {...card} />
    </motion.div>
  ))}
</motion.div>
```

**Effect**: Cards fade in and slide up sequentially with 100ms stagger.

### Card Flip

```tsx
function FlipCard() {
  const [isFlipped, setIsFlipped] = React.useState(false)

  return (
    <motion.div
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.5 }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div style={{
        backfaceVisibility: 'hidden',
        position: isFlipped ? 'absolute' : 'relative'
      }}>
        Front content
      </div>
      <div style={{
        backfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        position: isFlipped ? 'relative' : 'absolute'
      }}>
        Back content
      </div>
    </motion.div>
  )
}
```

**Effect**: Card rotates 180° to reveal back side.

---

## 5. Modal & Overlay Interactions

### Modal Enter/Exit

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: semanticColors.bg.primary,
          borderRadius: borderRadius.lg,
          padding: spacing[8],
          boxShadow: shadows.xl,
          zIndex: 50
        }}
      >
        Modal content
      </motion.div>
    </>
  )}
</AnimatePresence>
```

**Effect**: Backdrop fades in, modal scales up from center.

### Drawer Slide (Side Panel)

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '400px',
        background: semanticColors.bg.secondary,
        boxShadow: shadows.xl,
        padding: spacing[6]
      }}
    >
      Drawer content
    </motion.div>
  )}
</AnimatePresence>
```

**Effect**: Drawer slides in from right edge.

### Toast Notification

```tsx
<AnimatePresence>
  {toasts.map(toast => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        bottom: spacing[4],
        right: spacing[4],
        background: semanticColors.accent.success,
        color: semanticColors.text.inverse,
        padding: spacing[4],
        borderRadius: borderRadius.base,
        boxShadow: shadows.lg
      }}
    >
      {toast.message}
    </motion.div>
  ))}
</AnimatePresence>
```

**Effect**: Toast slides up from bottom-right, fades in, then shrinks out.

---

## 6. List & Item Interactions

### List Item Hover

```tsx
<motion.li
  whileHover={{ x: 4, backgroundColor: 'rgba(42, 161, 152, 0.05)' }}
  transition={{ duration: 0.15 }}
  style={{
    padding: spacing[3],
    borderRadius: borderRadius.sm,
    cursor: 'pointer'
  }}
>
  List item
</motion.li>
```

**Effect**: Item shifts right and highlights on hover.

### Drag & Drop

```tsx
import { Reorder } from 'framer-motion'

function DraggableList({ items }) {
  const [orderedItems, setOrderedItems] = React.useState(items)

  return (
    <Reorder.Group values={orderedItems} onReorder={setOrderedItems}>
      {orderedItems.map(item => (
        <Reorder.Item
          key={item.id}
          value={item}
          whileDrag={{ scale: 1.05, boxShadow: shadows.lg }}
          transition={{ duration: 0.2 }}
        >
          {item.content}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}
```

**Effect**: Item scales up and gains shadow while dragging.

### Swipe Actions (Mobile)

```tsx
import { motion, useMotionValue, useTransform } from 'framer-motion'

function SwipeableItem() {
  const x = useMotionValue(0)
  const backgroundColor = useTransform(
    x,
    [-100, 0, 100],
    [semanticColors.accent.error, 'transparent', semanticColors.accent.success]
  )

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      dragElastic={0.2}
      style={{ x, backgroundColor }}
      onDragEnd={(e, { offset }) => {
        if (offset.x < -50) {
          handleDelete()
        } else if (offset.x > 50) {
          handleComplete()
        }
      }}
    >
      Swipe left to delete, right to complete
    </motion.div>
  )
}
```

**Effect**: Item follows finger, background changes color based on direction.

---

## 7. Input & Form Interactions

### Input Focus Animation

```tsx
<motion.input
  whileFocus={{ scale: 1.02 }}
  transition={{ duration: 0.15 }}
  style={{
    padding: `${spacing[2]} ${spacing[3]}`,
    border: `2px solid ${semanticColors.border.default}`,
    borderRadius: borderRadius.base,
    ':focus': {
      borderColor: semanticColors.border.focus,
      boxShadow: `0 0 0 3px rgba(38, 139, 210, 0.1)`
    }
  }}
/>
```

**Effect**: Input scales slightly and border changes color on focus.

### Checkbox Toggle

```tsx
function AnimatedCheckbox({ checked, onChange }) {
  return (
    <motion.button
      onClick={onChange}
      animate={{
        backgroundColor: checked
          ? semanticColors.accent.success
          : 'transparent',
        borderColor: checked
          ? semanticColors.accent.success
          : semanticColors.border.default
      }}
      transition={{ duration: 0.15 }}
      style={{
        width: '20px',
        height: '20px',
        borderRadius: borderRadius.sm,
        border: '2px solid'
      }}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Check size={16} color={semanticColors.text.inverse} />
        </motion.div>
      )}
    </motion.button>
  )
}
```

**Effect**: Checkbox fills with color, checkmark scales in.

### Form Validation Shake

```tsx
function ShakeOnError({ hasError, children }) {
  return (
    <motion.div
      animate={hasError ? {
        x: [0, -10, 10, -10, 10, 0],
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}
```

**Effect**: Input shakes side-to-side when validation fails.

---

## 8. Loading States

### Skeleton Loading

```tsx
function SkeletonCard() {
  return (
    <div style={{
      padding: spacing[6],
      borderRadius: borderRadius.base,
      background: semanticColors.bg.secondary
    }}>
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          width: '60%',
          height: '24px',
          borderRadius: borderRadius.sm,
          background: `linear-gradient(
            90deg,
            ${semanticColors.bg.tertiary} 0%,
            ${semanticColors.border.default} 50%,
            ${semanticColors.bg.tertiary} 100%
          )`,
          backgroundSize: '200% 100%'
        }}
      />
    </div>
  )
}
```

**Effect**: Shimmering gradient moves across skeleton placeholder.

### Progress Bar

```tsx
function ProgressBar({ progress }) {
  return (
    <div style={{
      width: '100%',
      height: '8px',
      background: semanticColors.bg.tertiary,
      borderRadius: borderRadius.pill,
      overflow: 'hidden'
    }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          height: '100%',
          background: semanticColors.accent.primary,
          borderRadius: borderRadius.pill
        }}
      />
    </div>
  )
}
```

**Effect**: Bar smoothly animates to new progress value.

### Spinner (Circular)

```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 1,
    repeat: Infinity,
    ease: 'linear'
  }}
  style={{
    width: '40px',
    height: '40px',
    border: `4px solid ${semanticColors.bg.tertiary}`,
    borderTopColor: semanticColors.accent.primary,
    borderRadius: borderRadius.pill
  }}
/>
```

**Effect**: Circle spins infinitely.

### Pulse Loading

```tsx
<motion.div
  animate={{
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1]
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut'
  }}
  style={{
    width: '60px',
    height: '60px',
    borderRadius: borderRadius.pill,
    background: semanticColors.accent.primary
  }}
/>
```

**Effect**: Dot pulses in and out.

---

## 9. Celebration Animations

### Task Completion

```tsx
function TaskCompletionCelebration() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{
        scale: [0, 1.2, 1],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <motion.div
        animate={{
          y: [0, -20, 0]
        }}
        transition={{
          duration: 0.5,
          repeat: 2,
          ease: 'easeOut'
        }}
      >
        <CheckCircle size={64} color={semanticColors.accent.success} />
      </motion.div>
    </motion.div>
  )
}
```

**Effect**: Checkmark bounces in with rotation, then bounces up and down.

### Confetti Burst

```tsx
function ConfettiBurst() {
  const particles = Array.from({ length: 20 })

  return (
    <div style={{ position: 'relative' }}>
      {particles.map((_, i) => {
        const angle = (i / particles.length) * 2 * Math.PI
        const distance = 100
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x,
              y,
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: 1,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              borderRadius: borderRadius.pill,
              background: `hsl(${i * 18}, 80%, 60%)`
            }}
          />
        )
      })}
    </div>
  )
}
```

**Effect**: Colored particles burst outward in all directions.

### Level Up Animation

```tsx
function LevelUpAnimation({ level }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360]
        }}
        transition={{ duration: 1 }}
      >
        <Award size={80} color={semanticColors.accent.warning} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ fontSize: fontSize['3xl'], marginTop: spacing[4] }}
      >
        Level {level}!
      </motion.h2>
    </motion.div>
  )
}
```

**Effect**: Trophy rises up and spins, level text fades in below.

---

## 10. Page Transitions

### Fade Transition

```tsx
import { AnimatePresence } from 'framer-motion'

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Effect**: Page fades out, new page fades in.

### Slide Transition

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -300, opacity: 0 }}
    transition={{ duration: 0.5, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Effect**: New page slides in from right, old page slides out to left.

### Scale Transition

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 1.05, opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

**Effect**: Page zooms in slightly on enter, zooms out on exit.

---

## 11. Gesture Interactions (Mobile)

### Pull to Refresh

```tsx
import { motion, useMotionValue, useTransform } from 'framer-motion'

function PullToRefresh({ onRefresh, children }) {
  const y = useMotionValue(0)
  const rotate = useTransform(y, [0, 100], [0, 180])

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0 }}
      onDragEnd={(e, { offset }) => {
        if (offset.y > 80) {
          onRefresh()
        }
      }}
      style={{ y }}
    >
      <motion.div
        style={{
          rotate,
          opacity: useTransform(y, [0, 80], [0, 1])
        }}
      >
        <RefreshCw size={24} />
      </motion.div>
      {children}
    </motion.div>
  )
}
```

**Effect**: Pull down to rotate refresh icon, release to trigger refresh.

### Long Press

```tsx
function LongPressButton({ onLongPress }) {
  const [isPressed, setIsPressed] = React.useState(false)

  return (
    <motion.button
      onPointerDown={() => {
        setIsPressed(true)
        setTimeout(() => {
          if (isPressed) onLongPress()
        }, 500)
      }}
      onPointerUp={() => setIsPressed(false)}
      animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
    >
      <motion.div
        animate={isPressed ? { scale: [1, 1.5, 1.5] } : { scale: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          inset: 0,
          border: `2px solid ${semanticColors.accent.primary}`,
          borderRadius: borderRadius.base,
          opacity: 0.5
        }}
      />
      Hold me
    </motion.button>
  )
}
```

**Effect**: Border expands as you hold, triggers action after 500ms.

---

## 12. Accessibility Patterns

### Focus Indicator

```tsx
<motion.button
  whileFocus={{
    outline: `2px solid ${semanticColors.border.focus}`,
    outlineOffset: '4px'
  }}
  transition={{ duration: 0.15 }}
>
  Keyboard Accessible
</motion.button>
```

**Effect**: Visible outline appears on keyboard focus.

### Skip to Content

```tsx
<motion.a
  href="#main-content"
  initial={{ y: -100 }}
  whileFocus={{ y: 0 }}
  transition={{ duration: 0.3 }}
  style={{
    position: 'fixed',
    top: spacing[4],
    left: spacing[4],
    padding: spacing[3],
    background: semanticColors.accent.primary,
    color: semanticColors.text.inverse,
    borderRadius: borderRadius.base,
    zIndex: 100
  }}
>
  Skip to content
</motion.a>
```

**Effect**: Skip link slides down on keyboard focus.

---

## 13. Performance Optimization

### Use GPU-Accelerated Properties

```tsx
// ✅ Good: Uses transform (GPU-accelerated)
<motion.div animate={{ x: 100, y: 50, scale: 1.2, rotate: 45 }} />

// ❌ Bad: Uses layout properties (triggers reflow)
<motion.div animate={{ left: '100px', top: '50px', width: '120%' }} />
```

### Lazy Loading with Intersection Observer

```tsx
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

function LazyAnimatedComponent() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      Content animates when scrolled into view
    </motion.div>
  )
}
```

**Effect**: Animation only triggers when element is visible.

### Batch Animations with Layout Groups

```tsx
import { LayoutGroup, motion } from 'framer-motion'

<LayoutGroup>
  {items.map(item => (
    <motion.div
      key={item.id}
      layout
      transition={{ duration: 0.3 }}
    >
      {item.content}
    </motion.div>
  ))}
</LayoutGroup>
```

**Effect**: Smooth layout transitions when items reorder.

---

## 14. Common Mistakes to Avoid

### Animation Anti-Patterns

```tsx
// ❌ Bad: Animating layout properties
<motion.div animate={{ width: '100%', height: '200px' }}>

// ✅ Good: Animating transform properties
<motion.div animate={{ scaleX: 2, scaleY: 1.5 }}>

// ❌ Bad: Not checking reduced motion
<motion.div animate={{ x: 100 }} transition={{ duration: 0.5 }}>

// ✅ Good: Respecting motion preferences
const shouldReduce = useReducedMotion()
<motion.div animate={{ x: 100 }} transition={{ duration: shouldReduce ? 0 : 0.5 }}>

// ❌ Bad: Too many simultaneous animations
<motion.div animate={{ x: 100, y: 50, rotate: 45, scale: 1.5, opacity: 0.5 }}>

// ✅ Good: Focused, purposeful animation
<motion.div animate={{ y: -4, scale: 1.02 }}>

// ❌ Bad: Overly long animations
<motion.div transition={{ duration: 3 }}>

// ✅ Good: Quick, snappy animations
<motion.div transition={{ duration: 0.3 }}>
```

---

## 15. Quick Reference

### Most Common Patterns

```typescript
// Button press
whileTap={{ scale: 0.95 }}
transition={{ duration: 0.15 }}

// Card hover
whileHover={{ scale: 1.02, y: -2 }}
transition={{ duration: 0.3 }}

// Modal enter/exit
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
transition={{ duration: 0.3 }}

// List stagger
container: { staggerChildren: 0.1 }
item: { opacity: [0, 1], y: [20, 0] }

// Loading spinner
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
```

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
**Maintained by**: Frontend Team
