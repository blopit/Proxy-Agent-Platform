# Component Patterns & Best Practices

A comprehensive guide to common component patterns used in the Proxy Agent Platform frontend.

---

## Table of Contents

1. [Mobile Components](#mobile-components)
2. [Biological Workflow Modes](#biological-workflow-modes)
3. [Card Components](#card-components)
4. [Animation Patterns](#animation-patterns)
5. [Form Patterns](#form-patterns)
6. [Modal Patterns](#modal-patterns)
7. [Accessibility Patterns](#accessibility-patterns)

---

## Mobile Components

### Mobile-First Design Philosophy

All components in `src/components/mobile/` follow these principles:

1. **Touch-friendly** - Minimum 44x44px touch targets
2. **Gesture support** - Swipe, drag, pinch where appropriate
3. **Bottom navigation** - Primary actions at thumb-reach
4. **Responsive** - Works on all screen sizes (320px - 1920px)
5. **Performance** - 60fps animations, optimized rendering

### Mobile Component Structure

```typescript
'use client'

import React, { useState } from 'react'
import { spacing, semanticColors, fontSize } from '@/lib/design-system'

interface MobileComponentProps {
  title: string
  onAction?: () => void
}

export default function MobileComponent({ title, onAction }: MobileComponentProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    // Swipe left
    if (diff > 50) {
      console.log('Swiped left')
    }
    // Swipe right
    if (diff < -50) {
      console.log('Swiped right')
    }

    setTouchStart(null)
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        padding: spacing[4],
        minHeight: '44px', // Touch-friendly
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent' // Remove tap highlight
      }}
    >
      {title}
    </div>
  )
}
```

### Touch Interaction Patterns

#### Swipe Detection

```typescript
const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
  console.log(`Swiped ${direction}`)
}

// In component
const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })

const handleTouchStart = (e: React.TouchEvent) => {
  setTouchStart({
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  })
}

const handleTouchEnd = (e: React.TouchEvent) => {
  const touchEnd = {
    x: e.changedTouches[0].clientX,
    y: e.changedTouches[0].clientY
  }

  const diffX = touchStart.x - touchEnd.x
  const diffY = touchStart.y - touchEnd.y

  // Horizontal swipe
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 50) handleSwipe('left')
    if (diffX < -50) handleSwipe('right')
  }
  // Vertical swipe
  else {
    if (diffY > 50) handleSwipe('up')
    if (diffY < -50) handleSwipe('down')
  }
}
```

#### Long Press Detection

```typescript
const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null)

const handleTouchStart = () => {
  const timer = setTimeout(() => {
    console.log('Long press detected')
    onLongPress?.()
  }, 500) // 500ms = long press

  setPressTimer(timer)
}

const handleTouchEnd = () => {
  if (pressTimer) {
    clearTimeout(pressTimer)
    setPressTimer(null)
  }
}
```

---

## Biological Workflow Modes

The platform implements 5 biological workflow modes optimized for ADHD-friendly task management.

### Mode Architecture

Each mode lives in `src/components/mobile/modes/` and follows this structure:

```
modes/
  ├── CaptureMode.tsx       # Quick task capture (2-second target)
  ├── ScoutMode.tsx         # Netflix-style browsing
  ├── HunterMode.tsx        # Deep work focus
  ├── MapperMode.tsx        # Task breakdown & dependencies
  └── MenderMode.tsx        # Review & reflection
```

### 1. Capture Mode

**Purpose:** Ultra-fast task capture via voice or text (2-second target)

**Key Features:**
- Voice input with Web Speech API
- Optimistic UI updates
- Minimal friction
- Auto-submit on pause

**Pattern:**

```typescript
import { useCaptureFlow } from '@/hooks/useCaptureFlow'
import { useVoiceInput } from '@/hooks/useVoiceInput'

export default function CaptureMode() {
  const { state, startCapture, submitTask } = useCaptureFlow({
    userId: 'demo-user'
  })

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing[4]
    }}>
      {state.isListening ? (
        <div>
          <div style={{ fontSize: fontSize.lg }}>
            {state.transcript || 'Listening...'}
          </div>
          <button onClick={submitTask}>Submit</button>
        </div>
      ) : (
        <button onClick={startCapture}>
          Start Capture
        </button>
      )}
    </div>
  )
}
```

### 2. Scout Mode

**Purpose:** Browse tasks Netflix-style with smooth scrolling

**Key Features:**
- Horizontal scrolling cards
- Variable card sizes (hero, standard, compact)
- Edge fade gradients
- No snap-scrolling (momentum-based)

**Pattern:**

```typescript
export default function ScoutMode({ tasks }: ScoutModeProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        gap: spacing[4],
        padding: spacing[4],
        scrollBehavior: 'smooth',
        // Hide scrollbar
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          size={index === 0 ? 'hero' : 'standard'}
        />
      ))}

      {/* Edge fade gradient */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '60px',
        background: 'linear-gradient(to left, rgba(0,43,54,1), transparent)',
        pointerEvents: 'none'
      }} />
    </div>
  )
}
```

### 3. Hunter Mode

**Purpose:** Deep work focus with timer and distractions blocked

**Key Features:**
- Focus timer (Pomodoro-style)
- Single task display
- Progress tracking
- Completion celebration

**Pattern:**

```typescript
export default function HunterMode({ task }: HunterModeProps) {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60) // 25 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: spacing[4]
    }}>
      <h1 style={{ fontSize: fontSize['4xl'] }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </h1>
      <div style={{ marginTop: spacing[8] }}>
        <h2>{task.title}</h2>
      </div>
    </div>
  )
}
```

### 4. Mapper Mode

**Purpose:** Visualize task hierarchies and dependencies

**Key Features:**
- Tree visualization
- Drag-and-drop reordering
- Dependency lines
- Collapse/expand nodes

### 5. Mender Mode

**Purpose:** Review completed tasks and reflect

**Key Features:**
- Timeline view
- Completion stats
- Achievement gallery
- Streak tracking

---

## Card Components

### Card Sizes

Cards come in 4 sizes:

1. **Hero** - 300x400px (featured card)
2. **Standard** - 200x280px (default)
3. **Compact** - 150x200px (list view)
4. **Mini** - 100x140px (thumbnails)

### Card Structure

```typescript
interface CardProps {
  title: string
  description?: string
  size?: 'hero' | 'standard' | 'compact' | 'mini'
  onClick?: () => void
}

export default function Card({ title, description, size = 'standard', onClick }: CardProps) {
  const sizes = {
    hero: { width: '300px', height: '400px' },
    standard: { width: '200px', height: '280px' },
    compact: { width: '150px', height: '200px' },
    mini: { width: '100px', height: '140px' }
  }

  return (
    <div
      onClick={onClick}
      style={{
        ...sizes[size],
        padding: spacing[4],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        boxShadow: shadow.md,
        cursor: onClick ? 'pointer' : 'default',
        transition: `transform ${duration.fast}`,
        ':hover': {
          transform: 'scale(1.02)'
        }
      }}
    >
      <h3 style={{ fontSize: fontSize.lg }}>{title}</h3>
      {description && (
        <p style={{ fontSize: fontSize.sm, marginTop: spacing[2] }}>
          {description}
        </p>
      )}
    </div>
  )
}
```

### Card with Loading State

```typescript
export default function Card({ isLoading, ...props }: CardProps) {
  if (isLoading) {
    return (
      <div style={{
        width: '200px',
        height: '280px',
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        {/* Skeleton loader */}
      </div>
    )
  }

  return <div>{/* Normal card */}</div>
}
```

---

## Animation Patterns

### Using Framer Motion

```typescript
import { motion } from 'framer-motion'

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Slide up
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  Content
</motion.div>

// Stagger children
<motion.div
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.title}
    </motion.div>
  ))}
</motion.div>
```

### CSS Animations

Using design system animation tokens:

```typescript
import { duration, easing } from '@/lib/design-system'

<div style={{
  transition: `all ${duration.normal} ${easing.easeInOut}`,
  transform: isHovered ? 'scale(1.05)' : 'scale(1)'
}}>
  Hover me
</div>
```

---

## Form Patterns

### Controlled Input

```typescript
const [value, setValue] = useState('')

<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  style={{
    padding: spacing[2],
    fontSize: fontSize.base,
    borderRadius: borderRadius.base,
    border: `1px solid ${semanticColors.border.default}`
  }}
/>
```

### Form Validation

```typescript
interface FormState {
  name: string
  email: string
  errors: {
    name?: string
    email?: string
  }
}

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
  errors: {}
})

const validate = () => {
  const errors: typeof form.errors = {}

  if (!form.name) {
    errors.name = 'Name is required'
  }

  if (!form.email.includes('@')) {
    errors.email = 'Invalid email'
  }

  setForm(prev => ({ ...prev, errors }))
  return Object.keys(errors).length === 0
}

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()

  if (validate()) {
    // Submit form
  }
}
```

---

## Modal Patterns

### Simple Modal

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: semanticColors.bg.primary,
          borderRadius: borderRadius.lg,
          padding: spacing[6],
          maxWidth: '500px',
          width: '90%'
        }}
      >
        <h2 style={{ fontSize: fontSize.xl, marginBottom: spacing[4] }}>
          {title}
        </h2>
        {children}
        <button onClick={onClose} style={{ marginTop: spacing[4] }}>
          Close
        </button>
      </div>
    </div>
  )
}
```

### Modal with Animation

```typescript
import { motion, AnimatePresence } from 'framer-motion'

export default function AnimatedModal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: semanticColors.bg.primary,
              borderRadius: borderRadius.lg,
              padding: spacing[6]
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Accessibility Patterns

### Keyboard Navigation

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      onClick?.()
      break
    case 'Escape':
      onClose?.()
      break
    case 'ArrowRight':
      navigateNext?.()
      break
    case 'ArrowLeft':
      navigatePrev?.()
      break
  }
}

<div
  tabIndex={0}
  role="button"
  onKeyDown={handleKeyDown}
  onClick={onClick}
>
  Interactive element
</div>
```

### ARIA Labels

```typescript
<button
  aria-label="Close modal"
  aria-pressed={isActive}
  aria-expanded={isExpanded}
  aria-controls="dropdown-menu"
>
  <XIcon aria-hidden="true" />
</button>

<div
  role="alert"
  aria-live="polite"
>
  {errorMessage}
</div>
```

### Focus Management

```typescript
const buttonRef = useRef<HTMLButtonElement>(null)

useEffect(() => {
  if (isOpen) {
    buttonRef.current?.focus()
  }
}, [isOpen])

<button ref={buttonRef}>
  Focus me on open
</button>
```

---

**Last Updated:** October 28, 2025
