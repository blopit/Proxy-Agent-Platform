# ChevronProgress Component Guide

## 🎯 Overview

A beautiful, accessible chevron-style progress indicator perfect for showing multi-step workflows. Designed specifically for ADHD-friendly visual feedback with smooth animations and clear state indicators.

## 📦 Component Files

- **Main Component**: `src/components/mobile/ChevronProgress.tsx`
- **Variants**: Horizontal (default) + Vertical (mobile-friendly)

---

## 🚀 Quick Start

### Basic Usage

```typescript
import ChevronProgress from '@/components/mobile/ChevronProgress'

<ChevronProgress
  steps={[
    { id: '1', label: 'Parse Input', status: 'done', icon: '🧠' },
    { id: '2', label: 'AI Breakdown', status: 'active', icon: '🔨' },
    { id: '3', label: 'Save Tasks', status: 'pending', icon: '💾' }
  ]}
/>
```

**Result**: A horizontal chevron bar with green (done) → blue (active) → gray (pending) steps.

---

## 📋 Props Interface

```typescript
interface ChevronProgressProps {
  steps: ChevronStep[]           // Array of steps to display
  variant?: 'default' | 'compact' // Size variant (default: 'default')
  showProgress?: boolean         // Show progress bar below (default: true)
  className?: string             // Additional CSS classes
}

interface ChevronStep {
  id: string                     // Unique identifier
  label: string                  // Step name (e.g., "Parse Input")
  status: 'done' | 'active' | 'pending' // Current state
  icon?: string                  // Optional emoji icon
  detail?: string                // Optional detail text (shown in default variant)
}
```

---

## 🎨 Variants

### Default Variant (64px height)

```typescript
<ChevronProgress
  variant="default"
  steps={[
    {
      id: '1',
      label: 'Capture',
      status: 'done',
      icon: '✨',
      detail: '2 min ago'
    },
    {
      id: '2',
      label: 'Process',
      status: 'active',
      icon: '⚡',
      detail: 'In progress'
    },
    {
      id: '3',
      label: 'Complete',
      status: 'pending',
      icon: '✓'
    }
  ]}
/>
```

**Features**:
- 64px height
- Shows detail text under labels
- Icons displayed prominently
- Progress bar below

### Compact Variant (48px height)

```typescript
<ChevronProgress
  variant="compact"
  steps={[
    { id: '1', label: 'Parse', status: 'done', icon: '🧠' },
    { id: '2', label: 'Breakdown', status: 'active', icon: '🔨' },
    { id: '3', label: 'Save', status: 'pending', icon: '💾' }
  ]}
  showProgress={false}
/>
```

**Features**:
- 48px height (smaller)
- No detail text
- Smaller icons
- Optional to hide progress bar

---

## 📱 Mobile Variant (Vertical)

For narrow screens, use the vertical variant:

```typescript
import { ChevronProgressVertical } from '@/components/mobile/ChevronProgress'

<ChevronProgressVertical
  steps={[
    { id: '1', label: 'Step 1', status: 'done', icon: '✓', detail: 'Completed' },
    { id: '2', label: 'Step 2', status: 'active', icon: '⚡', detail: 'In progress' },
    { id: '3', label: 'Step 3', status: 'pending', icon: '○', detail: 'Waiting' }
  ]}
/>
```

**Features**:
- Stacked vertically
- Connection lines between steps
- Full detail text visible
- Completion percentage shown
- Perfect for portrait screens

---

## 🎯 Real-World Examples

### 1. Task Capture Flow

```typescript
// In CaptureMode after user submits
const [captureSteps, setCaptureSteps] = useState([
  { id: 'parse', label: 'Parse Input', status: 'pending', icon: '🧠' },
  { id: 'llm', label: 'AI Breakdown', status: 'pending', icon: '🔨' },
  { id: 'save', label: 'Save to DB', status: 'pending', icon: '💾' }
])

// Update as job progresses
useEffect(() => {
  if (jobStatus === 'parsing') {
    setCaptureSteps(prev => prev.map(s =>
      s.id === 'parse' ? { ...s, status: 'active' } : s
    ))
  }

  if (jobStatus === 'parsed') {
    setCaptureSteps(prev => prev.map(s =>
      s.id === 'parse' ? { ...s, status: 'done' } :
      s.id === 'llm' ? { ...s, status: 'active' } : s
    ))
  }

  if (jobStatus === 'complete') {
    setCaptureSteps(prev => prev.map(s => ({ ...s, status: 'done' })))
  }
}, [jobStatus])

<ChevronProgress steps={captureSteps} variant="compact" />
```

### 2. User Journey Through Modes

```typescript
// Show user's progress through biological circuits
const modeProgress = [
  { id: 'capture', label: 'Capture', status: 'done', icon: '✨' },
  { id: 'scout', label: 'Scout', status: 'done', icon: '🔍' },
  { id: 'hunt', label: 'Hunt', status: 'active', icon: '🎯' },
  { id: 'mend', label: 'Mend', status: 'pending', icon: '💙' },
  { id: 'map', label: 'Map', status: 'pending', icon: '🗺️' }
]

<ChevronProgress
  steps={modeProgress}
  variant="default"
  showProgress={true}
/>
```

### 3. Onboarding Flow

```typescript
const onboardingSteps = [
  {
    id: 'account',
    label: 'Create Account',
    status: 'done',
    icon: '👤',
    detail: 'Welcome!'
  },
  {
    id: 'preferences',
    label: 'Set Preferences',
    status: 'active',
    icon: '⚙️',
    detail: 'Almost there'
  },
  {
    id: 'first-task',
    label: 'Capture First Task',
    status: 'pending',
    icon: '🎯',
    detail: 'Final step'
  }
]

<ChevronProgress steps={onboardingSteps} />
```

### 4. Integration with AsyncJobTimeline

Replace the current timeline with chevron:

```typescript
// Before: AsyncJobTimeline with vertical list
<AsyncJobTimeline
  jobName="Buy groceries"
  steps={microSteps}
  currentProgress={45}
  size="full"
/>

// After: ChevronProgress at top, then expandable details
<div>
  <ChevronProgress
    variant="compact"
    steps={microSteps.map(step => ({
      id: step.id,
      label: step.shortLabel || step.description,
      status: step.status === 'done' ? 'done' :
              step.status === 'active' ? 'active' : 'pending',
      icon: step.icon
    }))}
  />

  {/* Expandable detailed steps below */}
  {showDetails && (
    <div style={{ marginTop: spacing[3] }}>
      {microSteps.map(step => (
        <MicroStepCard key={step.id} step={step} />
      ))}
    </div>
  )}
</div>
```

---

## 🎨 Styling & Customization

### Colors

The component automatically uses your design system:

```typescript
// Done steps
background: colors.green (#859900)
text: #fdf6e3 (light)

// Active steps
background: colors.blue (#268bd2)
text: #fdf6e3 (light)

// Pending steps
background: semanticColors.bg.secondary
text: semanticColors.text.secondary
```

### Animations

**Active Step Pulse**:
```css
/* Automatically applied to active steps */
animation: chevron-pulse 2s ease-in-out infinite;

/* Pulses between 100% and 85% opacity */
```

**Progress Bar Fill**:
```css
/* Smooth width transition */
transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
```

**State Changes**:
```css
/* Smooth color transitions when status changes */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
```

### Custom Styling

Add custom styles via className:

```typescript
<ChevronProgress
  steps={steps}
  className="my-custom-chevron"
/>

<style jsx>{`
  .my-custom-chevron {
    margin: 16px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`}</style>
```

---

## ♿ Accessibility

### Built-in Features

✅ **ARIA Roles**:
```html
<div role="progressbar" aria-valuenow="67" aria-valuemin="0" aria-valuemax="100">
<div role="listitem" aria-current="step">
```

✅ **Screen Reader Text**:
```html
<span class="sr-only">
  Completed / Current step / Pending
</span>
```

✅ **Keyboard Navigation**: Steps are focusable (when clickable)

✅ **Color Contrast**: Meets WCAG AA standards

### Testing

```typescript
// Screen reader announcement
const steps = [
  { id: '1', label: 'Parse', status: 'done' }
]
// Announces: "Step 1 of 3: Parse. Completed."

// Progress percentage
// Announces: "Progress: 33%"
```

---

## 📊 Performance

### Optimizations

- **No external dependencies**: Pure React + CSS
- **GPU acceleration**: Uses `transform` for animations
- **Minimal re-renders**: Only updates changed steps
- **Small bundle size**: ~4KB gzipped

### Best Practices

```typescript
// ✅ Good - Memoize steps array
const steps = useMemo(() => [
  { id: '1', label: 'Parse', status: jobStatus === 'parsing' ? 'active' : 'done' },
  // ...
], [jobStatus])

// ✅ Good - Update only changed steps
setSteps(prev => prev.map(s =>
  s.id === currentStepId ? { ...s, status: 'active' } : s
))

// ❌ Bad - Creating new array every render
<ChevronProgress steps={[
  { id: '1', label: 'Parse', status: 'done' }  // New object every render
]} />
```

---

## 🔧 Advanced Usage

### Dynamic Step Addition

```typescript
const [steps, setSteps] = useState([
  { id: '1', label: 'Initial', status: 'done', icon: '✓' }
])

// Add step dynamically
const addStep = () => {
  setSteps(prev => [...prev, {
    id: String(prev.length + 1),
    label: 'New Step',
    status: 'pending',
    icon: '○'
  }])
}
```

### Conditional Steps

```typescript
const steps = [
  { id: 'auth', label: 'Authenticate', status: 'done', icon: '🔐' },

  // Only show if user is admin
  ...(isAdmin ? [{
    id: 'admin', label: 'Admin Setup', status: 'active', icon: '👑'
  }] : []),

  { id: 'finish', label: 'Complete', status: 'pending', icon: '✓' }
]
```

### Time-based Progress

```typescript
const [steps, setSteps] = useState(initialSteps)

useEffect(() => {
  const interval = setInterval(() => {
    setSteps(prev => {
      const activeIndex = prev.findIndex(s => s.status === 'active')
      if (activeIndex === -1) return prev

      // Move to next step every 2 seconds
      return prev.map((s, i) => ({
        ...s,
        status: i < activeIndex ? 'done' :
                i === activeIndex + 1 ? 'active' :
                i === activeIndex ? 'done' : 'pending'
      }))
    })
  }, 2000)

  return () => clearInterval(interval)
}, [])
```

---

## 🐛 Troubleshooting

### Issue: Steps overflow on small screens

**Solution**: Use vertical variant or reduce step count
```typescript
const isMobile = window.innerWidth < 600

{isMobile ? (
  <ChevronProgressVertical steps={steps} />
) : (
  <ChevronProgress steps={steps} variant="compact" />
)}
```

### Issue: Active step not pulsing

**Solution**: Check status is exactly 'active' (not 'in_progress' or 'current')
```typescript
// ✅ Correct
{ status: 'active' }

// ❌ Wrong - won't pulse
{ status: 'in_progress' }
```

### Issue: Progress bar not updating

**Solution**: Ensure steps array reference changes
```typescript
// ✅ Good - new array reference
setSteps(prev => prev.map(s => ({ ...s, status: newStatus })))

// ❌ Bad - mutates array
steps[0].status = 'done'
setSteps(steps)
```

---

## 📚 Related Components

- **AsyncJobTimeline**: Full timeline with expandable details
- **ProgressBar**: Simple linear progress bar
- **EnergyGauge**: Circular energy visualization
- **BiologicalTabs**: Mode navigation tabs

---

## 🎯 Design Decisions

### Why Chevrons?

- **Visual flow**: Arrows naturally suggest forward progress
- **ADHD-friendly**: Clear visual hierarchy, not overwhelming
- **Compact**: Horizontal layout saves vertical space
- **Engaging**: More interesting than plain boxes

### Why Pulse Animation?

- **Attention**: Draws eye to current step
- **Feedback**: Shows the system is active
- **Subtle**: 2s cycle is gentle, not distracting
- **Dopamine**: Movement rewards ADHD brains

### Why Three States?

- **Simple**: Easy to understand at a glance
- **Clear**: No ambiguity about status
- **Color-coded**: Green → Blue → Gray is intuitive
- **Consistent**: Matches broader system design

---

## 📈 Future Enhancements

Potential additions (not yet implemented):

- [ ] Click to skip ahead to pending steps
- [ ] Drag to reorder steps
- [ ] Estimated time remaining per step
- [ ] Error state with retry button
- [ ] Sub-steps (nested chevrons)
- [ ] Branching paths (conditional flows)

---

**Last Updated**: 2025-10-25

**Component Version**: 1.0.0

**Dependencies**: None (uses design-system.ts)
