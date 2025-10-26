# Integrating ChevronProgress into Existing Components

## 🎯 Quick Integration Examples

### 1. Update AsyncJobTimeline (Recommended)

**Before**: Vertical list with circles

**After**: Chevron progress bar + expandable details

```typescript
// src/components/shared/AsyncJobTimeline.tsx

import ChevronProgress from '@/components/mobile/ChevronProgress'

export function AsyncJobTimeline({ jobName, steps, currentProgress, size }: AsyncJobTimelineProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Convert your JobStep[] to ChevronStep[]
  const chevronSteps = steps.map(step => ({
    id: step.id,
    label: step.shortLabel || step.description.slice(0, 20),
    status: step.status === 'done' ? 'done' as const :
            step.status === 'active' ? 'active' as const :
            'pending' as const,
    icon: step.icon,
    detail: step.estimatedMinutes > 0 ? `${step.estimatedMinutes}m` : 'Auto'
  }))

  return (
    <div style={{ width: '100%' }}>
      {/* Job name header */}
      <div style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: spacing[3],
        color: semanticColors.text.primary
      }}>
        {jobName}
      </div>

      {/* Chevron progress */}
      <ChevronProgress
        steps={chevronSteps}
        variant={size === 'micro' ? 'compact' : 'default'}
        showProgress={true}
      />

      {/* Toggle details button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          marginTop: spacing[3],
          padding: `${spacing[2]} ${spacing[3]}`,
          backgroundColor: 'transparent',
          border: `1px solid ${semanticColors.border.default}`,
          borderRadius: '8px',
          color: semanticColors.text.secondary,
          fontSize: '13px',
          cursor: 'pointer'
        }}
      >
        {showDetails ? '▲ Hide Details' : '▼ Show Details'}
      </button>

      {/* Expandable detailed steps */}
      {showDetails && (
        <div style={{ marginTop: spacing[4] }}>
          {steps.map((step, index) => (
            <DetailedStepCard
              key={step.id}
              step={step}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DetailedStepCard({ step, index }: { step: JobStep, index: number }) {
  return (
    <div style={{
      padding: spacing[3],
      marginBottom: spacing[2],
      backgroundColor: semanticColors.bg.secondary,
      borderRadius: '8px',
      border: `1px solid ${semanticColors.border.default}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
        {/* Status icon */}
        {step.status === 'done' && <span style={{ color: colors.green }}>✓</span>}
        {step.status === 'active' && <Loader2 className="animate-spin" size={16} />}
        {step.status === 'pending' && <Circle size={16} opacity={0.3} />}

        {/* Icon */}
        {step.icon && <span>{step.icon}</span>}

        {/* Description */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '14px' }}>
            {step.description}
          </div>
          {step.detail && (
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
              {step.detail}
            </div>
          )}
        </div>

        {/* Time estimate */}
        {step.estimatedMinutes > 0 && (
          <div style={{
            fontSize: '12px',
            color: semanticColors.text.secondary,
            whiteSpace: 'nowrap'
          }}>
            {step.estimatedMinutes}min
          </div>
        )}

        {/* HUMAN/DIGITAL badge */}
        <div style={{
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '600',
          backgroundColor: step.leafType === 'DIGITAL' ? colors.blue : colors.orange,
          color: '#fdf6e3'
        }}>
          {step.leafType === 'DIGITAL' ? '🖥️' : '👤'}
        </div>
      </div>

      {/* Tags */}
      {step.tags && step.tags.length > 0 && (
        <div style={{
          marginTop: spacing[2],
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[1]
        }}>
          {step.tags.map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                backgroundColor: semanticColors.bg.tertiary,
                color: semanticColors.text.secondary
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### 2. Add to Capture Mode

Show progress during task capture:

```typescript
// src/app/mobile/page.tsx (or CaptureMode component)

const [captureSteps, setCaptureSteps] = useState([
  { id: 'parse', label: 'Parse', status: 'pending', icon: '🧠' },
  { id: 'llm', label: 'Breakdown', status: 'pending', icon: '🔨' },
  { id: 'save', label: 'Save', status: 'pending', icon: '💾' }
])

const handleCapture = async () => {
  // Step 1: Parsing
  setCaptureSteps(prev => prev.map(s =>
    s.id === 'parse' ? { ...s, status: 'active' } : s
  ))

  const parsed = await parseInput(chat)

  setCaptureSteps(prev => prev.map(s =>
    s.id === 'parse' ? { ...s, status: 'done' } :
    s.id === 'llm' ? { ...s, status: 'active' } : s
  ))

  // Step 2: LLM Breakdown
  const breakdown = await llmDecompose(parsed)

  setCaptureSteps(prev => prev.map(s =>
    s.id === 'llm' ? { ...s, status: 'done' } :
    s.id === 'save' ? { ...s, status: 'active' } : s
  ))

  // Step 3: Save
  await saveTasks(breakdown)

  setCaptureSteps(prev => prev.map(s => ({ ...s, status: 'done' })))

  // Show success
  setTimeout(() => {
    setShowBreakdown(true)
  }, 500)
}

// In your render:
{isProcessing && (
  <div style={{ marginTop: spacing[4] }}>
    <ChevronProgress
      steps={captureSteps}
      variant="compact"
      showProgress={true}
    />
  </div>
)}
```

---

### 3. Add to Mode Navigation

Show user journey through modes:

```typescript
// src/app/mobile/page.tsx

const getModeProgress = (): ChevronStep[] => {
  const modes = ['capture', 'search', 'hunt', 'rest', 'plan']
  const currentIndex = modes.indexOf(mode)

  return [
    {
      id: 'capture',
      label: 'Capture',
      status: currentIndex > 0 ? 'done' : currentIndex === 0 ? 'active' : 'pending',
      icon: '✨'
    },
    {
      id: 'search',
      label: 'Scout',
      status: currentIndex > 1 ? 'done' : currentIndex === 1 ? 'active' : 'pending',
      icon: '🔍'
    },
    {
      id: 'hunt',
      label: 'Hunt',
      status: currentIndex > 2 ? 'done' : currentIndex === 2 ? 'active' : 'pending',
      icon: '🎯'
    },
    {
      id: 'rest',
      label: 'Mend',
      status: currentIndex > 3 ? 'done' : currentIndex === 3 ? 'active' : 'pending',
      icon: '💙'
    },
    {
      id: 'plan',
      label: 'Map',
      status: currentIndex === 4 ? 'active' : 'pending',
      icon: '🗺️'
    }
  ]
}

// Add above BiologicalTabs
<div style={{ marginBottom: spacing[4] }}>
  <ChevronProgress
    steps={getModeProgress()}
    variant="compact"
    showProgress={false}
  />
</div>

<BiologicalTabs
  activeTab={mode}
  onTabChange={setMode}
  energy={energy}
  timeOfDay={timeOfDay}
/>
```

---

### 4. TaskBreakdownModal Integration

```typescript
// src/components/mobile/TaskBreakdownModal.tsx

export function TaskBreakdownModal({ captureResponse, isOpen, onClose }: Props) {
  if (!isOpen || !captureResponse) return null

  const steps = captureResponse.micro_steps.map((step, index) => ({
    id: step.step_id,
    label: step.short_label || step.description.slice(0, 20),
    status: 'done' as const, // All steps are complete after capture
    icon: step.leaf_type === 'DIGITAL' ? '🖥️' : '👤',
    detail: `${step.estimated_minutes}m`
  }))

  return (
    <div style={modalStyles}>
      {/* Task name */}
      <h2>{captureResponse.task.title}</h2>

      {/* Chevron showing breakdown */}
      <div style={{ marginBottom: spacing[4] }}>
        <div style={{ fontSize: '13px', marginBottom: spacing[2], color: semanticColors.text.secondary }}>
          Task broken into {steps.length} steps:
        </div>
        <ChevronProgress
          steps={steps}
          variant="compact"
          showProgress={true}
        />
      </div>

      {/* XP earned */}
      {captureResponse.xp_earned && (
        <div style={xpBadgeStyles}>
          +{captureResponse.xp_earned} XP
        </div>
      )}

      {/* Action buttons */}
      <div style={buttonContainerStyles}>
        <button onClick={() => { onClose(); setMode('hunt') }}>
          🎯 Start Now
        </button>
        <button onClick={() => { onClose(); setMode('search') }}>
          📋 View All Tasks
        </button>
      </div>
    </div>
  )
}
```

---

### 5. Responsive Mobile/Desktop

```typescript
// Automatically switch to vertical on mobile
import { ChevronProgressVertical } from '@/components/mobile/ChevronProgress'

const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 600)
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])

// Render
{isMobile ? (
  <ChevronProgressVertical steps={steps} />
) : (
  <ChevronProgress steps={steps} variant="compact" />
)}
```

---

## 🎨 Styling Tips

### Match Your Design System

The component automatically uses your design tokens:

```typescript
// Colors
import { colors } from '@/lib/design-system'

// Already configured:
// - Done: colors.green (#859900)
// - Active: colors.blue (#268bd2)
// - Pending: semanticColors.bg.secondary
```

### Custom Wrapper

```typescript
<div className="chevron-container">
  <ChevronProgress steps={steps} />
</div>

<style jsx>{`
  .chevron-container {
    margin: 16px 0;
    padding: 12px;
    background: rgba(38, 139, 210, 0.05);
    border-radius: 16px;
  }
`}</style>
```

---

## 📱 Mobile Best Practices

### Use Compact Variant

```typescript
// On mobile, use compact to save space
<ChevronProgress
  steps={steps}
  variant="compact"  // ← 48px instead of 64px
  showProgress={false} // ← Hide progress bar on small screens
/>
```

### Switch to Vertical Below 500px

```typescript
@media (max-width: 500px) {
  // Automatically handled by ChevronProgressVertical
  // Or detect in React:
  const isMobile = window.innerWidth < 500
}
```

---

## 🚀 Animation Control

### Disable Animations (Accessibility)

```typescript
// Detect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Wrap in a provider or pass as prop
<ChevronProgress
  steps={steps}
  // Future: animate={!prefersReducedMotion}
/>

// Currently: animations respect system preferences via CSS
```

---

## 📊 State Management

### With Zustand (Recommended)

```typescript
// src/lib/store.ts
import { create } from 'zustand'

interface CaptureStore {
  steps: ChevronStep[]
  updateStep: (id: string, status: 'done' | 'active' | 'pending') => void
}

export const useCaptureStore = create<CaptureStore>((set) => ({
  steps: [
    { id: 'parse', label: 'Parse', status: 'pending', icon: '🧠' },
    { id: 'llm', label: 'Breakdown', status: 'pending', icon: '🔨' },
    { id: 'save', label: 'Save', status: 'pending', icon: '💾' }
  ],

  updateStep: (id, status) => set((state) => ({
    steps: state.steps.map(s =>
      s.id === id ? { ...s, status } : s
    )
  }))
}))

// Usage in component
const { steps, updateStep } = useCaptureStore()

<ChevronProgress steps={steps} />

// Update from anywhere
updateStep('parse', 'active')
updateStep('parse', 'done')
updateStep('llm', 'active')
```

---

## 🎯 Quick Wins

### 1. Replace Loading Spinner

**Before**:
```typescript
{isLoading && <Spinner />}
```

**After**:
```typescript
{isLoading && (
  <ChevronProgress
    steps={loadingSteps}
    variant="compact"
  />
)}
```

### 2. Add to Success Toast

```typescript
toast.custom((t) => (
  <div>
    <p>Task captured successfully!</p>
    <ChevronProgress
      steps={[
        { id: '1', label: 'Parse', status: 'done', icon: '✓' },
        { id: '2', label: 'Breakdown', status: 'done', icon: '✓' },
        { id: '3', label: 'Save', status: 'done', icon: '✓' }
      ]}
      variant="compact"
      showProgress={false}
    />
  </div>
))
```

### 3. Onboarding Checklist

```typescript
const onboardingProgress = [
  { id: 'signup', label: 'Sign Up', status: 'done', icon: '✓' },
  { id: 'verify', label: 'Verify Email', status: 'active', icon: '📧' },
  { id: 'setup', label: 'Setup Profile', status: 'pending', icon: '⚙️' }
]

<ChevronProgress steps={onboardingProgress} />
```

---

## 🔗 Related Files

- Component: `src/components/mobile/ChevronProgress.tsx`
- Demo: `src/app/demo/chevron/page.tsx`
- Guide: `frontend/docs/CHEVRON_PROGRESS_GUIDE.md`
- Integration: `frontend/docs/CHEVRON_INTEGRATION_EXAMPLE.md` (this file)

---

**Start with the demo page**: Navigate to `/demo/chevron` to see live examples!
