# 📊 Two-Phase Progress Display Design

## 🎯 Concept Overview

When a user captures a task, there are **TWO distinct progress bars**:

1. **Capture Progress** (Phase 1) - Creating/parsing the task
2. **Task Execution Progress** (Phase 2) - Running the created task

---

## 📱 Mobile-First Visual Flow

### PHASE 1: Capture Progress (While Capturing)

```
┌─────────────────────────────────────┐
│ 🎯 Capture                          │
├─────────────────────────────────────┤
│                                     │
│ ╔═════════════════════════════════╗ │
│ ║ Capturing your task...          ║ │
│ ║                                 ║ │
│ ║ ┏━━━━━━━━━━━━━━┓──┬──┬──       ║ │
│ ║ ┃🧠 Parse      ┃  │  │          ║ │ ← Auto-expanded
│ ║ ┃Analyzing...  ┃LL│Cl│Sv        ║ │   (progress in this step)
│ ║ ┗━━━━━━━━━━━━━━┛──┴──┴──       ║ │
│ ║ ▓▓▓▓▓░░░░░░░░░░░░░░░░░          ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ What needs to get done?         │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

After 800ms, capture completes:

```
┌─────────────────────────────────────┐
│ 🎯 Capture                          │
├─────────────────────────────────────┤
│                                     │
│ ╔═════════════════════════════════╗ │
│ ║ ✅ Task captured! (847ms)       ║ │
│ ║                                 ║ │
│ ║ ✓───✓───✓──✓                   ║ │
│ ║ Parse LLM Cls Save              ║ │
│ ║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            ║ │
│ ║                                 ║ │
│ ║ [View Task] [Start]             ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ What needs to get done?         │ │ ← Ready for next
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

### PHASE 2: Task Execution Progress (After Task Created)

User taps **[View Task]** or **[Start]** → Shows the actual task progress bar:

```
┌─────────────────────────────────────┐
│ ← Send email to Sara             [⋮]│
├─────────────────────────────────────┤
│                                     │
│ 📧 Send email to Sara               │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                     │
│ Priority: medium • 15 min           │
│ Tags: email, communication          │
│                                     │
│ ╔═════════════════════════════════╗ │
│ ║ Task Progress                   ║ │
│ ║                                 ║ │
│ ║ ✓──┏━━━━━━━━━━━━━━┓───┬───┬──  ║ │
│ ║    ┃👤 Draft Email ┃   │   │    ║ │ ← Auto-expanded
│ ║ Fnd┃Writing msg... ┃Att│Rev│Snd ║ │   (current micro-step)
│ ║    ┗━━━━━━━━━━━━━━┛───┴───┴──  ║ │
│ ║ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░          ║ │
│ ║                                 ║ │
│ ║ Step 2 of 5 • ~10 min left      ║ │
│ ╚═════════════════════════════════╝ │
│                                     │
│ Micro-Steps (5):                    │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Find Sara's email    DONE     │ │
│ │ ⏳ Draft email message  ACTIVE  │ │
│ │ ⋯ Attach project files           │ │
│ │ ⋯ Review for accuracy            │ │
│ │ ⋯ Send email                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Pause] [Skip Step] [Complete]      │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Interaction Model

### Auto-Expand Behavior
```
When progress enters a section:
  → Section expands to 50% width
  → Shows emoji, label, and detail text
  → Other sections shrink proportionally

When progress leaves a section:
  → Section collapses back to expected %
  → Shows checkmark ✓ for completed
  → Next section auto-expands
```

### Manual Toggle Behavior
```
User clicks any section:
  → If collapsed: Expands to 50%
  → If expanded: Collapses to expected %
  → All other sections adjust proportionally

State:
  - At most 1 section expanded at a time
  - All sections can be collapsed (show expected %)
  - Manual expansion overrides auto-expansion
  - Progress still sweeps, but doesn't trigger auto-expand
```

### Mobile Gestures
```
Tap section     → Toggle expand/collapse
Long-press      → Show step details/logs
Swipe left/right on bar → Navigate between steps (optional)
```

---

## 🎨 State Transitions

### Capture Progress States

```
State                  Width Allocation
──────────────────────────────────────────────
All collapsed         40% | 35% | 15% | 10%
Parse active          50% | 17% | 8%  | 5%
LLM active            22% | 50% | 8%  | 5%
Classify active       22% | 17% | 50% | 5%
Save active           22% | 17% | 8%  | 50%
Complete              25% | 25% | 25% | 25%
```

### Task Execution Progress States

```
For task: "Send email to Sara" (5 steps)
Expected: 20% | 33% | 13% | 13% | 20%

State                  Width Allocation
──────────────────────────────────────────────
All collapsed         20% | 33% | 13% | 13% | 20%
Step 1 active         50% | 17% | 6%  | 6%  | 10%
Step 2 active         10% | 50% | 6%  | 6%  | 10%
Step 3 active         10% | 17% | 50% | 6%  | 10%
...
```

---

## 🧩 Component Structure

### CaptureProgressBar (Phase 1)
```typescript
// Shows progress of task capture
<AsyncJobTimeline
  jobName="Send email to Sara"
  steps={[
    { id: 'parse', label: 'Parse', emoji: '🧠', expectedDuration: 400, status: 'active' },
    { id: 'llm', label: 'LLM', emoji: '🔨', expectedDuration: 350, status: 'pending' },
    { id: 'classify', label: 'Classify', emoji: '🏷️', expectedDuration: 150, status: 'pending' },
    { id: 'save', label: 'Save', emoji: '💾', expectedDuration: 100, status: 'pending' },
  ]}
  currentProgress={25}
  onStepClick={(stepId) => toggleExpand(stepId)}
  expandedStepId="parse" // Auto-expanded by progress
  manualExpandId={null}   // User hasn't clicked anything yet
/>
```

### TaskExecutionProgressBar (Phase 2)
```typescript
// Shows progress of actual task execution
<AsyncJobTimeline
  jobName="Send email to Sara"
  steps={[
    { id: 'step1', label: 'Find Email', emoji: '🔍', expectedDuration: 180, status: 'done' },
    { id: 'step2', label: 'Draft', emoji: '👤', expectedDuration: 300, status: 'active', detail: 'Writing message...' },
    { id: 'step3', label: 'Attach', emoji: '📎', expectedDuration: 120, status: 'pending' },
    { id: 'step4', label: 'Review', emoji: '✅', expectedDuration: 120, status: 'pending' },
    { id: 'step5', label: 'Send', emoji: '🤖', expectedDuration: 60, status: 'pending' },
  ]}
  currentProgress={35}
  onStepClick={(stepId) => toggleExpand(stepId)}
  expandedStepId="step2" // Auto-expanded (current active)
  manualExpandId={null}
/>
```

---

## 🎬 Animation Timeline

### Capture Flow (Phase 1)
```
Time    Event                         Visual
────────────────────────────────────────────────────────────
0ms     User presses Enter           • Input clears
                                     • Capture progress bar appears
                                     • Step 1 auto-expands

100ms   Parse started                • Progress bar → 10%

400ms   Parse done, LLM starts       • Step 1 collapses with ✓
                                     • Step 2 auto-expands
                                     • Progress bar → 40%

750ms   LLM done, Classify starts    • Step 2 collapses with ✓
                                     • Step 3 auto-expands
                                     • Progress bar → 75%

900ms   Classify done, Save starts   • Step 3 collapses with ✓
                                     • Step 4 auto-expands
                                     • Progress bar → 90%

1000ms  Save done                    • Step 4 collapses with ✓
                                     • All steps equal width
                                     • Progress bar → 100%
                                     • Success message appears
                                     • [View Task] [Start] buttons appear

4000ms  Auto-dismiss (optional)      • Progress bar fades out
                                     • User can still click [View Task]
```

### Task Execution Flow (Phase 2)
```
Time    Event                         Visual
────────────────────────────────────────────────────────────
0ms     User starts task             • Task detail view opens
                                     • Execution progress bar appears
                                     • Step 1 auto-expands

3000ms  Step 1 done                  • Step 1 collapses with ✓
                                     • Step 2 auto-expands
                                     • Progress → 20%

8000ms  Step 2 done                  • Step 2 collapses with ✓
                                     • Step 3 auto-expands
                                     • Progress → 53%

10000ms Step 3 done                  • Step 3 collapses with ✓
                                     • Step 4 auto-expands
                                     • Progress → 66%

...     Continue until all done      • Final step completes
                                     • All steps show ✓
                                     • Success celebration
                                     • Task marked complete
```

---

## 📱 Mobile Layout (< 768px)

```
Container:
  padding: 8px
  background: #073642
  border-radius: 4px
  border: 1px solid #586e75
  max-width: 100%
  margin: 0 16px

Progress Bar:
  height: 48px (when expanded)
  height: 32px (when collapsed)
  transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)

Labels:
  collapsed: 9px font, single emoji
  expanded: 11px font, emoji + label + detail

Touch Target:
  min-height: 44px (Apple HIG)
  min-width: 44px
```

---

## 🎨 Visual Examples (Mobile)

### Capture Progress (Compact)
```
┌───────────────────────────────────┐
│ buy mustard                    [×]│
├───────────────────────────────────┤
│ ┏━━━━━━━━━━┓────┬───┬──          │
│ ┃🧠 Parse  ┃    │   │            │
│ ┃Analyzing ┃ LLM│Cls│Sv          │
│ ┗━━━━━━━━━━┛────┴───┴──          │
│ ▓▓▓▓░░░░░░░░░░░░░░░░              │
└───────────────────────────────────┘
```

### Task Execution (Detailed - When Expanded)
```
┌───────────────────────────────────┐
│ Send email to Sara             [×]│
├───────────────────────────────────┤
│                                   │
│ Task Progress: Step 2 of 5        │
│                                   │
│ ✓─┏━━━━━━━━━━━━━━┓──┬──┬──      │
│   ┃👤 Draft Email ┃  │  │        │
│ Fn┃Writing about  ┃At│Rv│Sn      │
│   ┃project update ┃  │  │        │
│   ┗━━━━━━━━━━━━━━┛──┴──┴──      │
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░              │
│                                   │
│ 35% complete • ~10 min left       │
└───────────────────────────────────┘
```

---

## 🔧 Implementation Details

### Width Calculation (Updated)

```typescript
function calculateStepWidth(
  step: JobStep,
  allSteps: JobStep[],
  expandedStepId: string | null,  // Auto-expanded by progress
  manualExpandId: string | null   // User-clicked to expand
): string {
  const totalDuration = allSteps.reduce((sum, s) => sum + s.expectedDuration, 0);

  // Determine which step should be expanded
  const effectiveExpandedId = manualExpandId || expandedStepId;

  // If NO step is expanded, all take expected %
  if (!effectiveExpandedId) {
    return `${(step.expectedDuration / totalDuration) * 100}%`;
  }

  // If THIS step is expanded, it takes 50%
  if (step.id === effectiveExpandedId) {
    return '50%';
  }

  // Calculate remaining width for collapsed steps
  const remainingWidth = 50; // 100% - 50% (expanded)

  // Sum of durations for all collapsed steps
  const collapsedDuration = allSteps
    .filter(s => s.id !== effectiveExpandedId)
    .reduce((sum, s) => sum + s.expectedDuration, 0);

  // This step's proportional share of remaining 50%
  const proportionalWidth = (step.expectedDuration / collapsedDuration) * remainingWidth;

  return `${proportionalWidth}%`;
}
```

### State Management

```typescript
interface TimelineState {
  expandedStepId: string | null;    // Auto-expanded (follows progress)
  manualExpandId: string | null;    // User-clicked (overrides auto)
  currentProgress: number;          // 0-100
}

const [state, setState] = useState<TimelineState>({
  expandedStepId: null,
  manualExpandId: null,
  currentProgress: 0,
});

// Auto-expand logic (when progress enters new step)
useEffect(() => {
  const activeStep = steps.find(s => s.status === 'active');
  if (activeStep && !state.manualExpandId) {
    setState(prev => ({ ...prev, expandedStepId: activeStep.id }));
  }
}, [steps]);

// Manual toggle logic (when user clicks)
const handleStepClick = (stepId: string) => {
  setState(prev => ({
    ...prev,
    manualExpandId: prev.manualExpandId === stepId ? null : stepId,
  }));
};
```

---

## 🎯 User Flow Summary

### 1. Capture a Task
```
Type: "Send email to Sara"
Press: Enter
See: Capture progress bar (Phase 1)
  → Parse (expanded, active)
  → LLM (collapsed)
  → Classify (collapsed)
  → Save (collapsed)
Wait: 800ms
Result: "✅ Task captured!"
Actions: [View Task] [Start]
```

### 2. View Task Details
```
Tap: [View Task]
See: Task detail screen with execution progress bar (Phase 2)
  → All steps collapsed (not started yet)
  → Progress at 0%
```

### 3. Start Task
```
Tap: [Start]
See: First step auto-expands
  → "Find Sara's email" (expanded, active)
  → Other steps collapsed
User: Provides email address
System: Marks step complete, moves to next
See: Second step auto-expands
  → "Draft email" (expanded, active)
Continue: Until all steps done
```

### 4. Inspect Previous Step (Manual)
```
During: Step 3 is active (auto-expanded)
Tap: Step 2 (completed)
See: Step 2 expands, Step 3 collapses
  → Can review what was done in Step 2
  → Progress bar still at Step 3 position
Tap: Step 2 again
See: Step 2 collapses, Step 3 re-expands
  → Back to auto-follow mode
```

---

## 💡 Key Benefits

### Phase 1 (Capture Progress)
- ✅ User sees task being parsed in real-time
- ✅ Transparent AI processing (no black box)
- ✅ Builds trust and engagement
- ✅ Sets expectation for task structure

### Phase 2 (Execution Progress)
- ✅ User tracks progress through micro-steps
- ✅ Can inspect completed steps for review
- ✅ Clear visualization of remaining work
- ✅ Satisfying progress visualization

### Both Phases
- ✅ Consistent visual language
- ✅ Mobile-first design (touch-friendly)
- ✅ Reusable component (any async job)
- ✅ ADHD-friendly (clear, visual, immediate feedback)

---

## 🧪 Testing Scenarios

### Test 1: Auto-Expand During Capture
```
Input: "Buy mustard"
Expected:
1. Parse expands automatically when progress starts
2. Parse collapses when done, LLM expands
3. LLM collapses when done, Classify expands
4. Continue until all done
5. All sections equal width at completion
```

### Test 2: Manual Expand During Execution
```
Action: Click completed step while another is active
Expected:
1. Clicked step expands to 50%
2. Active step collapses proportionally
3. Other steps adjust
4. Progress bar position unchanged
5. Click again to collapse back
```

### Test 3: Rapid Task Capture
```
Action: Capture multiple tasks quickly
Expected:
1. Each task gets its own progress bar
2. Bars stack vertically
3. Each animates independently
4. Completed bars fade out after 4s
```

### Test 4: Error During Step
```
Scenario: LLM API fails during capture
Expected:
1. LLM step shows error state (red border)
2. Progress bar stops
3. Retry button appears
4. Can click step to see error details
```

---

**Last Updated**: 2025-10-23
**Version**: 2.0 (Two-Phase Design)
**Status**: Ready to Implement 🚀
