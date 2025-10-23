# AsyncJobTimeline Component

Universal progress visualization for async operations showing micro-step descriptions as proportional sections.

## Features

- ✅ **Real micro-step descriptions** - Shows actual task steps, not generic labels
- ✅ **Auto-expand** - Current step expands to 50% automatically
- ✅ **Manual toggle** - Click any step to inspect details
- ✅ **Smart width calculation** - HUMAN tasks (2-5 min) proportional, DIGITAL tasks minimal
- ✅ **Three size variants** - Full, Micro, Nano for different contexts
- ✅ **Smooth animations** - 300ms transitions, pulse on active step
- ✅ **Mobile-first** - Touch-friendly, responsive design

---

## Size Variants

### Full Size
Shows complete descriptions, icons, details, and duration.

```tsx
<AsyncJobTimeline
  jobName="Send email to Sara"
  steps={steps}
  currentProgress={45}
  size="full"
/>
```

**Visual:**
```
┌────────────────────────────────────────────────────────┐
│ Send email to Sara                                  [×]│
├────────────────────────────────────────────────────────┤
│ ✓────┏━━━━━━━━━━━━━━━━━━━━━━━┓──┬────┬───           │
│      ┃ 👤 Draft email        ┃  │    │               │
│ Find ┃ Write professional    ┃At│Rev │🤖             │
│      ┃ email message          ┃  │    │               │
│      ┃ 5 minutes • HUMAN      ┃  │    │               │
│      ┗━━━━━━━━━━━━━━━━━━━━━━━┛──┴────┴───           │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░                 │
└────────────────────────────────────────────────────────┘
```

### Micro Size
Shows icons and short labels only.

```tsx
<AsyncJobTimeline
  jobName="Send email to Sara"
  steps={steps}
  currentProgress={45}
  size="micro"
/>
```

**Visual:**
```
┌──────────────────────────────────────┐
│ Send email to Sara                [×]│
├──────────────────────────────────────┤
│ ✓──┏━━━━┓──┬───┬──                 │
│    ┃ 👤  ┃  │   │                   │
│ Fn ┃Draft┃At│Rev│🤖                 │
│    ┗━━━━┛──┴───┴──                 │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░                  │
└──────────────────────────────────────┘
```

### Nano Size
Shows step numbers only (most compact).

```tsx
<AsyncJobTimeline
  jobName="Send email to Sara"
  steps={steps}
  currentProgress={45}
  size="nano"
/>
```

**Visual:**
```
┌──────────────────────────────┐
│ ✓─┏━┓─┬─┬─                  │
│   ┃2┃ │ │                    │
│ 1 ┗━┛3│4│5                   │
│ ▓▓▓▓▓▓░░░░░░                 │
└──────────────────────────────┘
```

---

## Props

```typescript
interface AsyncJobTimelineProps {
  jobName: string;              // Task name (e.g., "Send email to Sara")
  steps: JobStep[];             // Array of micro-steps
  currentProgress: number;      // 0-100 (percentage)
  size?: TimelineSize;          // 'full' | 'micro' | 'nano' (default: 'full')
  onClose?: () => void;         // Close button handler
  onStepClick?: (stepId: string) => void;  // Step click handler
  className?: string;           // Additional CSS classes
  showProgressBar?: boolean;    // Show progress bar (default: true)
  processingTimeMs?: number;    // Show completion time
}
```

### JobStep Interface

```typescript
interface JobStep {
  id: string;                   // Unique step ID
  description: string;          // Full description (e.g., "Draft email message")
  shortLabel?: string;          // Short label for micro size (e.g., "Draft")
  detail?: string;              // Detail text when expanded
  estimatedMinutes: number;     // 0 for DIGITAL (auto), 2-5 for HUMAN
  leafType: 'DIGITAL' | 'HUMAN' | 'unknown';
  icon?: string;                // Emoji icon (e.g., "👤", "🤖")
  status: 'pending' | 'active' | 'done' | 'error';
  startTime?: number;           // When step started (timestamp)
  endTime?: number;             // When step ended (timestamp)
}
```

---

## Usage Examples

### Example 1: Capture Progress (Phase 1)

Shows progress of task capture (parsing, decomposing, etc.)

```tsx
import AsyncJobTimeline from '@/components/shared/AsyncJobTimeline';

const captureSteps = [
  {
    id: 'parse',
    description: 'Parse natural language',
    shortLabel: 'Parse',
    detail: 'Extracting task details...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🧠',
    status: 'active',
  },
  {
    id: 'llm',
    description: 'LLM decomposition',
    shortLabel: 'LLM',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🔨',
    status: 'pending',
  },
  // ... more steps
];

<AsyncJobTimeline
  jobName="Capturing task..."
  steps={captureSteps}
  currentProgress={25}
  size="full"
/>
```

### Example 2: Task Execution Progress (Phase 2)

Shows progress of actual task execution (micro-steps)

```tsx
const executionSteps = [
  {
    id: 'step1',
    description: 'Find Sara\'s email address',
    shortLabel: 'Find email',
    detail: 'Look up contact info',
    estimatedMinutes: 3,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'done',
  },
  {
    id: 'step2',
    description: 'Draft email message',
    shortLabel: 'Draft',
    detail: 'Write clear, professional email',
    estimatedMinutes: 5,
    leafType: 'HUMAN',
    icon: '👤',
    status: 'active',
  },
  {
    id: 'step5',
    description: 'Send email via agent',
    shortLabel: 'Send',
    detail: 'Agent sending email...',
    estimatedMinutes: 0,
    leafType: 'DIGITAL',
    icon: '🤖',
    status: 'pending',
  },
];

<AsyncJobTimeline
  jobName="Send email to Sara about project"
  steps={executionSteps}
  currentProgress={55}
  size="full"
  onStepClick={(stepId) => console.log('Clicked:', stepId)}
/>
```

### Example 3: In Capture Tab (Above Textarea)

```tsx
export default function CaptureMode() {
  const [captureProgress, setCaptureProgress] = useState(0);
  const [captureSteps, setCaptureSteps] = useState<JobStep[]>([]);

  const handleCapture = async (text: string) => {
    // Initialize steps
    setCaptureSteps([
      { id: 'parse', description: 'Parse input', ... },
      { id: 'llm', description: 'Decompose task', ... },
      { id: 'classify', description: 'Classify steps', ... },
      { id: 'save', description: 'Save to DB', ... },
    ]);

    // Call API and update progress
    const response = await captureTask(text);

    // Update progress as steps complete
    setCaptureProgress(100);
  };

  return (
    <div>
      {/* Progress bar appears above textarea */}
      {captureProgress > 0 && captureProgress < 100 && (
        <AsyncJobTimeline
          jobName="Capturing task..."
          steps={captureSteps}
          currentProgress={captureProgress}
          size="full"
        />
      )}

      {/* Textarea */}
      <textarea
        placeholder="What needs to get done?"
        disabled={captureProgress > 0}
      />
    </div>
  );
}
```

### Example 4: Converting CaptureResponse to JobSteps

```tsx
import type { CaptureResponse } from '@/types/capture';
import type { JobStep } from '@/components/shared/AsyncJobTimeline';

function captureResponseToJobSteps(response: CaptureResponse): JobStep[] {
  return response.micro_steps.map(step => ({
    id: step.step_id,
    description: step.description,
    shortLabel: step.description.split(' ').slice(0, 2).join(' '), // First 2 words
    detail: undefined, // Can be populated if needed
    estimatedMinutes: step.estimated_minutes,
    leafType: step.leaf_type,
    icon: step.icon || (step.leaf_type === 'DIGITAL' ? '🤖' : '👤'),
    status: 'pending' as const,
  }));
}

// Usage
const jobSteps = captureResponseToJobSteps(captureResponse);
<AsyncJobTimeline
  jobName={captureResponse.task.title}
  steps={jobSteps}
  currentProgress={0}
/>
```

---

## Width Calculation Logic

### HUMAN Tasks (2-5 minute chunks)
Takes proportional space based on duration:
- 3 min task = larger section
- 2 min task = smaller section

### DIGITAL Tasks (unlimited/auto)
Takes minimal space (~2-5%) when collapsed:
- Instant operations (API calls)
- AI processing (variable duration)
- Database operations

### Mixed Tasks
```typescript
Example: [3min HUMAN, 5min HUMAN, auto DIGITAL, 2min HUMAN]

Total human time: 10 minutes
Digital count: 1

Digital space: 5%
Human space: 95%

Step 1 (3min): (3/10) * 95% = 28.5%
Step 2 (5min): (5/10) * 95% = 47.5%
Step 3 (digital): 5%
Step 4 (2min): (2/10) * 95% = 19%
```

### When Expanded
- Expanded step: Always 50% width
- Other steps: Share remaining 50% proportionally

---

## Auto-Expand vs Manual Expand

### Auto-Expand
- Triggers when `status: 'active'` changes
- Only one step auto-expands at a time
- Follows progress automatically

### Manual Expand
- User clicks any step to inspect
- Overrides auto-expand
- Click again to collapse and return to auto-follow

```tsx
const [manualExpandId, setManualExpandId] = useState<string | null>(null);

const handleStepClick = (stepId: string) => {
  if (manualExpandId === stepId) {
    setManualExpandId(null); // Collapse
  } else {
    setManualExpandId(stepId); // Expand (overrides auto)
  }
};
```

---

## Styling & Theming

Uses Solarized Dark color scheme:

```typescript
// Status colors
pending: 'bg-[#073642] border-[#586e75]'  // Dark, subdued
active:  'bg-[#268bd2]/20 border-[#268bd2]'  // Blue, attention
done:    'bg-[#859900]/20 border-[#859900]'  // Green, success
error:   'bg-[#dc322f]/20 border-[#dc322f]'  // Red, error

// Progress bar
gradient: 'from-[#268bd2] to-[#2aa198]'  // Blue to cyan
complete: 'bg-[#859900]'  // Green
```

---

## Accessibility

- ✅ Keyboard navigation (Tab to steps, Enter to expand)
- ✅ ARIA labels on buttons
- ✅ Focus management
- ✅ Screen reader support (title attributes)
- ✅ Touch targets: 44px minimum (Apple HIG)

---

## Performance

- Smooth 300ms transitions
- Efficient width recalculation (Map-based)
- No unnecessary re-renders
- CSS-based animations (GPU accelerated)

---

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile browsers: ✅

---

## Examples

See `AsyncJobTimeline.examples.tsx` for:
- Full size examples
- Micro size examples
- Nano size examples
- Animated examples
- Capture flow integration

Run examples:
```bash
# View all examples
npm run dev
# Navigate to /examples/async-job-timeline
```

---

## Migration from Old Components

### Replace CaptureLoading
```tsx
// Before
<CaptureLoading stage="breaking_down" />

// After
<AsyncJobTimeline
  jobName="Capturing task..."
  steps={captureSteps}
  currentProgress={progressPercentage}
  size="full"
/>
```

### Replace TaskBreakdownModal Progress
```tsx
// Before
<div>Processing... {stage}</div>

// After
<AsyncJobTimeline
  jobName={taskTitle}
  steps={microSteps}
  currentProgress={currentStepProgress}
  size="full"
/>
```

---

## Future Enhancements

- [ ] Estimated time remaining
- [ ] Pause/resume functionality
- [ ] Step-level error messages
- [ ] Nested sub-steps
- [ ] Export progress as image
- [ ] Real-time sync via WebSocket

---

## License

Part of Proxy Agent Platform
