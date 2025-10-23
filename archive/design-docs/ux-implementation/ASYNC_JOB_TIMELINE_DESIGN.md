# ⏱️ Async Job Timeline - Universal Progress Visualization

## 🎯 Design Concept

A **horizontal timeline bar** that shows async job progress with:
1. Each step takes proportional space based on expected duration
2. Progress line sweeps left-to-right as job executes
3. **Auto-expand**: Section naturally expands when progress enters it (only 1 at a time)
4. **Manual toggle**: Click any section to expand/collapse for inspection
5. **Collapsed state**: When no section is expanded, all take expected space
6. **Two-phase display**:
   - **Phase 1**: Capture progress (creating the task)
   - **Phase 2**: Task execution progress (running the created task)
7. Reusable component for ANY async operation

---

## 🎨 Visual Design

### State 1: All Collapsed (Before Start or After Manual Collapse)
```
┌──────────────────────────────────────────────────────────────┐
│ buy mustard                                               [X]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  ┌─────────────────┬─────────────┬──────┬────┐        │ │
│  │  │  🧠 Parse (40%) │  🔨 LLM (35%)│Class│Save│        │ │
│  │  └─────────────────┴─────────────┴──────┴────┘        │ │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  │  │◄──── 40% ────►│◄─── 35% ───►│15%│10%│             │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Legend:
┌──┐ = Collapsed section (takes expected % of width)
░░░  = Progress line (not started yet)
Click any section to expand it manually
```

### State 2: Auto-Expand on Progress Enter (Step 1 Active)
```
┌──────────────────────────────────────────────────────────────┐
│ buy mustard                                               [X]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓───────┬─────┬────────│ │
│  │  ┃ 🧠 Parsing input (40%)      ┃       │     │        │ │
│  │  ┃ Extracting task details...  ┃  LLM  │Class│ Save   │ │
│  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛───────┴─────┴────────│ │
│  │  ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  │  │◄──────── 40% ────────►│                             │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Legend:
┏━━┓ = Auto-expanded (progress entered this section)
───  = Collapsed sections (proportional to expected %)
▓▓▓  = Progress line (sweeps left to right)
Click expanded section to collapse it
```

### State 3: Manual Expand (User Clicks Completed Step)
```
┌──────────────────────────────────────────────────────────────┐
│ buy mustard                                               [X]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  ✓────┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓──────┬────────│ │
│  │       ┃ 🔨 LLM Decompose (35%)         ┃      │        │ │
│  │  Parse┃ Breaking into micro-steps...   ┃Clasfy│ Save   │ │
│  │       ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛──────┴────────│ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  │         │◄───────── 35% ─────────►│                    │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Note:
- "Parse" is now collapsed (shows checkmark)
- "LLM Decompose" expanded to 50% width
- Progress bar at ~45%
```

### State 3: Almost Done (85% - Step 3 Active)
```
┌──────────────────────────────────────────────────────────────┐
│ buy mustard                                               [X]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │  ✓──────────✓─────┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓──────│ │
│  │                   ┃ 🏷️ Classify (15%)          ┃      │ │
│  │  Parse  Decompose ┃ Detecting task types...    ┃ Save │ │
│  │                   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛──────│ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░│ │
│  │                              │◄─── 15% ──►│           │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### State 4: Complete (100%)
```
┌──────────────────────────────────────────────────────────────┐
│ buy mustard                                               [X]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────���──────────────────┐ │
│  │                                                         │ │
│  │  ✓────────────✓───────────✓───────────✓──────────────│ │
│  │                                                         │ │
│  │  Parse     Decompose    Classify      Save            │ │
│  │                                                         │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │
│  │                                                         │ │
│  │  ✅ Complete in 847ms • 5 steps created                │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📐 Detailed Layout with Measurements

### Visual Breakdown
```
Total Width: 100%
─────────────────────────────────────────────────────────────

When step is INACTIVE (upcoming or completed):
  Width: {expectedDuration / totalDuration} * 100%
  Height: 32px
  Label: Small text above bar

When step is ACTIVE (current):
  Width: 50% (expands, other steps shrink proportionally)
  Height: 48px (taller to show details)
  Label: Large text with emoji
  Detail: Sub-label with current action

Example Timeline:
┌─────────────────────────────────────────────────────────────┐
│  Step 1: 40% expected → 40% when inactive                   │
│  Step 2: 35% expected → 35% when inactive, 50% when active  │
│  Step 3: 15% expected → 15% when inactive                   │
│  Step 4: 10% expected → 10% when inactive                   │
│  Total: 100%                                                │
└─────────────────────────────────────────────────────────────┘

When Step 2 is active:
  Remaining width: 100% - 50% = 50%
  Step 1 (completed): (40/90) * 50% = 22.2%
  Step 2 (active):    50%
  Step 3 (upcoming):  (15/90) * 50% = 8.3%
  Step 4 (upcoming):  (10/90) * 50% = 5.5%
  (Note: 90 = 40+35+15 without active step)
```

---

## 🧩 Component Design

### TypeScript Interface

```typescript
// frontend/src/components/shared/AsyncJobTimeline.tsx

export interface JobStep {
  id: string;
  label: string;              // Short label (e.g., "Parse")
  detail?: string;            // Detail text when active (e.g., "Extracting task details...")
  emoji?: string;             // Icon/emoji (e.g., "🧠")
  expectedDuration: number;   // Expected duration in ms (for proportional width)
  status: 'pending' | 'active' | 'done' | 'error';
  startTime?: number;         // When step started
  endTime?: number;           // When step completed
}

export interface AsyncJobTimelineProps {
  jobName: string;            // e.g., "buy mustard"
  steps: JobStep[];
  currentProgress: number;    // 0-100 (percentage)
  onClose?: () => void;
  className?: string;
}

// Usage Example:
<AsyncJobTimeline
  jobName="buy mustard"
  steps={[
    {
      id: 'parse',
      label: 'Parse',
      detail: 'Extracting task details...',
      emoji: '🧠',
      expectedDuration: 400,
      status: 'done'
    },
    {
      id: 'decompose',
      label: 'Decompose',
      detail: 'Breaking into micro-steps...',
      emoji: '🔨',
      expectedDuration: 350,
      status: 'active'
    },
    {
      id: 'classify',
      label: 'Classify',
      emoji: '🏷️',
      expectedDuration: 150,
      status: 'pending'
    },
    {
      id: 'save',
      label: 'Save',
      emoji: '💾',
      expectedDuration: 100,
      status: 'pending'
    }
  ]}
  currentProgress={55}
/>
```

---

## 🎨 HTML/CSS Structure

```tsx
// Simplified structure
<div className="async-job-timeline">
  {/* Header with job name */}
  <div className="job-header">
    <p className="job-name line-clamp-1">buy mustard</p>
    <button className="close-btn">×</button>
  </div>

  {/* Timeline container */}
  <div className="timeline-container">
    {/* Steps */}
    <div className="steps-row">
      {steps.map(step => (
        <div
          key={step.id}
          className={`step step-${step.status}`}
          style={{
            width: calculateWidth(step),
            height: step.status === 'active' ? '48px' : '32px'
          }}
        >
          {/* Label above bar */}
          {step.status === 'done' && <span className="checkmark">✓</span>}
          {step.status === 'active' && (
            <div className="step-active-label">
              <span className="emoji">{step.emoji}</span>
              <span className="label">{step.label}</span>
              {step.detail && <span className="detail">{step.detail}</span>}
            </div>
          )}
          {step.status === 'pending' && (
            <span className="step-label">{step.label}</span>
          )}
        </div>
      ))}
    </div>

    {/* Progress bar overlay */}
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${currentProgress}%` }}
      />
    </div>
  </div>
</div>
```

---

## 🎨 Styling (Solarized Dark)

```css
/* Container */
.async-job-timeline {
  padding: 8px;
  background-color: #073642; /* base02 */
  border-radius: 4px;
  border: 1px solid #586e75; /* base01 */
  margin-bottom: 12px;
}

/* Header */
.job-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.job-name {
  font-size: 12px;
  color: #586e75; /* base01 */
  line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  color: #586e75;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
}

/* Timeline */
.timeline-container {
  position: relative;
  height: 64px;
}

/* Steps row */
.steps-row {
  display: flex;
  gap: 2px;
  height: 100%;
  align-items: flex-end;
  position: relative;
  z-index: 2;
}

/* Individual step */
.step {
  position: relative;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 4px;
  border-radius: 2px;
}

/* Step states */
.step-pending {
  background-color: rgba(88, 110, 117, 0.2); /* base01 dim */
  border: 1px solid #586e75;
}

.step-active {
  background-color: rgba(38, 139, 210, 0.2); /* blue dim */
  border: 1px solid #268bd2; /* blue */
  box-shadow: 0 0 8px rgba(38, 139, 210, 0.4);
}

.step-done {
  background-color: rgba(133, 153, 0, 0.2); /* green dim */
  border: 1px solid #859900; /* green */
}

.step-error {
  background-color: rgba(220, 50, 47, 0.2); /* red dim */
  border: 1px solid #dc322f; /* red */
}

/* Active step label */
.step-active-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
  width: 100%;
}

.step-active-label .emoji {
  font-size: 16px;
}

.step-active-label .label {
  font-size: 11px;
  font-weight: 600;
  color: #268bd2; /* blue */
}

.step-active-label .detail {
  font-size: 9px;
  color: #93a1a1; /* base1 */
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Completed checkmark */
.checkmark {
  font-size: 14px;
  color: #859900; /* green */
}

/* Pending label */
.step-label {
  font-size: 9px;
  color: #586e75; /* base01 */
  text-align: center;
}

/* Progress bar */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: rgba(88, 110, 117, 0.3); /* base01 dim */
  border-radius: 2px;
  overflow: hidden;
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    #268bd2 0%,   /* blue */
    #2aa198 100%  /* cyan */
  );
  transition: width 200ms linear;
  border-radius: 2px;
}

/* Complete state */
.timeline-complete .progress-fill {
  background: #859900; /* green */
}

/* Animations */
@keyframes pulse-active {
  0%, 100% {
    box-shadow: 0 0 8px rgba(38, 139, 210, 0.4);
  }
  50% {
    box-shadow: 0 0 12px rgba(38, 139, 210, 0.6);
  }
}

.step-active {
  animation: pulse-active 2s ease-in-out infinite;
}

@keyframes checkmark-pop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.checkmark {
  animation: checkmark-pop 300ms ease-out;
}
```

---

## 🔄 Width Calculation Logic

```typescript
// Calculate width for each step based on active state
function calculateStepWidth(
  step: JobStep,
  allSteps: JobStep[],
  activeStepId: string | null
): string {
  const totalDuration = allSteps.reduce((sum, s) => sum + s.expectedDuration, 0);

  // If this step is active, it takes 50%
  if (step.id === activeStepId) {
    return '50%';
  }

  // Calculate remaining width for inactive steps
  const activeStep = allSteps.find(s => s.id === activeStepId);
  const remainingWidth = 50; // 100% - 50% (active)

  // Sum of durations for all inactive steps
  const inactiveDuration = allSteps
    .filter(s => s.id !== activeStepId)
    .reduce((sum, s) => sum + s.expectedDuration, 0);

  // This step's proportional width of the remaining 50%
  const proportionalWidth = (step.expectedDuration / inactiveDuration) * remainingWidth;

  return `${proportionalWidth}%`;
}

// Example usage in component:
const activeStep = steps.find(s => s.status === 'active');

{steps.map(step => (
  <div
    key={step.id}
    style={{
      width: calculateStepWidth(step, steps, activeStep?.id || null)
    }}
  >
    {/* step content */}
  </div>
))}
```

---

## 📊 Step Duration Guidelines

### Recommended Proportions

```typescript
// For Capture workflow:
const CAPTURE_STEPS = [
  { id: 'parse', label: 'Parse', expectedDuration: 400 },      // 40%
  { id: 'decompose', label: 'LLM', expectedDuration: 350 },    // 35%
  { id: 'classify', label: 'Classify', expectedDuration: 150 }, // 15%
  { id: 'save', label: 'Save', expectedDuration: 100 },        // 10%
];

// For general async jobs:
// - Short steps (< 200ms): 10-15%
// - Medium steps (200-500ms): 20-40%
// - Long steps (> 500ms): 40-60%
```

---

## 🎬 Animation Sequence

```
Time    Event                        Visual
────────────────────────────────────────────────────────────
0ms     Job starts                   • Timeline appears (slide down)
                                     • Step 1 expands to 50%
                                     • Progress bar at 0%

100ms   Step 1 active                • Progress bar → 10%
200ms   ...                          • Progress bar → 20%
400ms   Step 1 done                  • Checkmark pops in
                                     • Step 1 shrinks to ~22%
                                     • Step 2 expands to 50%
                                     • Progress bar → 40%

500ms   Step 2 active                • Progress bar → 50%
700ms   ...                          • Progress bar → 70%
750ms   Step 2 done                  • Checkmark pops in
                                     • Step 2 shrinks
                                     • Step 3 expands to 50%
                                     • Progress bar → 75%

800ms   Step 3 active                • Progress bar → 85%
900ms   Step 3 done                  • Checkmark pops in
                                     • Step 3 shrinks
                                     • Step 4 expands to 50%
                                     • Progress bar → 90%

950ms   Step 4 active                • Progress bar → 95%
1000ms  Step 4 done                  • Checkmark pops in
                                     • Progress bar → 100%
                                     • All steps equal width
                                     • Success message appears

4000ms  Auto-dismiss                 • Timeline fades out (500ms)
```

---

## 🧪 Usage Examples

### Example 1: Capture Task
```tsx
<AsyncJobTimeline
  jobName="Send email to Sara about project"
  steps={[
    {
      id: 'parse',
      label: 'Parse',
      detail: 'Extracting task details...',
      emoji: '🧠',
      expectedDuration: 400,
      status: 'active'
    },
    {
      id: 'decompose',
      label: 'LLM',
      emoji: '🔨',
      expectedDuration: 350,
      status: 'pending'
    },
    {
      id: 'classify',
      label: 'Classify',
      emoji: '🏷️',
      expectedDuration: 150,
      status: 'pending'
    },
    {
      id: 'save',
      label: 'Save',
      emoji: '💾',
      expectedDuration: 100,
      status: 'pending'
    }
  ]}
  currentProgress={25}
/>
```

### Example 2: File Upload
```tsx
<AsyncJobTimeline
  jobName="quarterly-report.pdf"
  steps={[
    {
      id: 'validate',
      label: 'Validate',
      emoji: '✓',
      expectedDuration: 100,
      status: 'done'
    },
    {
      id: 'upload',
      label: 'Upload',
      detail: 'Uploading 2.4 MB...',
      emoji: '⬆️',
      expectedDuration: 600,
      status: 'active'
    },
    {
      id: 'process',
      label: 'Process',
      emoji: '⚙️',
      expectedDuration: 200,
      status: 'pending'
    },
    {
      id: 'notify',
      label: 'Notify',
      emoji: '🔔',
      expectedDuration: 100,
      status: 'pending'
    }
  ]}
  currentProgress={65}
/>
```

### Example 3: Agent Delegation
```tsx
<AsyncJobTimeline
  jobName="Schedule meeting with team"
  steps={[
    {
      id: 'findSlots',
      label: 'Find Slots',
      detail: 'Checking calendar availability...',
      emoji: '📅',
      expectedDuration: 300,
      status: 'active'
    },
    {
      id: 'sendInvites',
      label: 'Send Invites',
      emoji: '📧',
      expectedDuration: 400,
      status: 'pending'
    },
    {
      id: 'confirm',
      label: 'Confirm',
      emoji: '✓',
      expectedDuration: 300,
      status: 'pending'
    }
  ]}
  currentProgress={30}
/>
```

---

## 🚀 Implementation Checklist

### Phase 1: Core Component
- [ ] Create `AsyncJobTimeline.tsx` component
- [ ] Implement width calculation logic
- [ ] Add step expansion animation (300ms cubic-bezier)
- [ ] Add progress bar with gradient
- [ ] Test with mock data

### Phase 2: Integration
- [ ] Replace `CaptureLoading` with `AsyncJobTimeline`
- [ ] Wire up to capture flow state
- [ ] Map backend stages to steps
- [ ] Update progress in real-time

### Phase 3: Polish
- [ ] Add pulse animation to active step
- [ ] Add checkmark pop animation
- [ ] Add success state (all steps done)
- [ ] Add error state handling
- [ ] Test responsiveness

### Phase 4: Reusability
- [ ] Document usage patterns
- [ ] Add to design system
- [ ] Use for file uploads
- [ ] Use for agent delegations
- [ ] Use for any async operation

---

## 💡 Advanced Features (Future)

1. **Estimated Time Remaining**
   ```
   ⏱️ ~2 seconds remaining
   ```

2. **Pause/Resume**
   ```
   [❚❚ Pause]  [▶ Resume]
   ```

3. **Cancel/Retry**
   ```
   [× Cancel]  [↻ Retry]
   ```

4. **Step Click to View Details**
   ```
   Click step → Show logs/details in modal
   ```

5. **Multi-line Details**
   ```
   Step detail can show:
   - Sub-progress (e.g., "Uploading 45% of file")
   - Error messages
   - Warnings
   ```

---

## 📊 Comparison: Before vs After

### Before (Generic Loader)
```
┌──────────────────────┐
│  🧠 Analyzing...     │  ← What's happening?
│  ▓▓▓▓░░░░░░░░        │  ← How far along?
└──────────────────────┘  ← When will it finish?
```

### After (Timeline)
```
┌────────────────────────────────────────────────────┐
│  ✓────┏━━━━━━━━━━━━━━━━━━━━┓─────┬─────┬─────    │
│       ┃ 🔨 LLM (35%)       ┃     │     │          │
│  Parse┃ Breaking down...   ┃Class│Save │          │
│       ┗━━━━━━━━━━━━━━━━━━━━┛─────┴─────┴─────    │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░        │
└────────────────────────────────────────────────────┘
     ↑        ↑           ↑       ↑      ↑
  Done    Active     Upcoming  Next   Last
```

**Benefits:**
- ✅ See what's done
- ✅ See current action
- ✅ See what's coming
- ✅ Understand proportional time
- ✅ Visual progress tracking

---

**Last Updated**: 2025-10-23
**Version**: 1.0
**Status**: Ready to Implement 🚀
