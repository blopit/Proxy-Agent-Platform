# 🎯 Capture Progress Bar - Above Textarea Design

## 🎨 Design Goal

Show the capture progress **ABOVE the textarea** with discrete, clear action steps so users can see exactly what's happening during task processing.

---

## 📐 Visual Layout

### State 1: Ready to Capture (Default - No Progress Bar)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│                         🎯 Capture                          │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ What needs to get done?                                ││
│  │                                                         ││
│  │ Send email to Sara about project deadline...           ││
│  │                                                         ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [✓ Auto Mode]  [ Ask Clarity]                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### State 2: Processing - Stage 1 (Analyzing)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│                         🎯 Capture                          │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  Processing your task...                              ║ │
│  ║                                                        ║ │
│  ║  ●━━━○━━━○  Step 1 of 3                               ║ │
│  ║  🧠 Analyzing task with AI...                         ║ │
│  ║                                                        ║ │
│  ║  Actions:                                             ║ │
│  ║  ✓ Parsing natural language                           ║ │
│  ║  ⋯ Extracting entities (action, object, target)       ║ │ ← Current
│  ║  ⋯ Detecting priority and urgency                     ║ │
│  ║  ⋯ Identifying tags and categories                    ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ What needs to get done?                                ││
│  │                                                         ││
│  │                                                         ││ ← Cleared
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [✓ Auto Mode]  [ Ask Clarity]                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### State 3: Processing - Stage 2 (Breaking Down)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│                         🎯 Capture                          │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  Processing your task...                              ║ │
│  ║                                                        ║ │
│  ║  ●━━━●━━━○  Step 2 of 3                               ║ │
│  ║  🔨 Breaking down into micro-steps...                 ║ │
│  ║                                                        ║ │
│  ║  Actions:                                             ║ │
│  ║  ✓ Task parsed successfully                           ║ │
│  ║  ✓ Decomposing into 2-5 minute chunks                 ║ │
│  ║  ⋯ Classifying steps (DIGITAL vs HUMAN)               ║ │ ← Current
│  ║  ⋯ Estimating duration for each step                  ║ │
│  ║  ⋯ Detecting automation opportunities                 ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ What needs to get done?                                ││
│  │                                                         ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [✓ Auto Mode]  [ Ask Clarity]                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### State 4: Processing - Stage 3 (Finalizing)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│                         🎯 Capture                          │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  Processing your task...                              ║ │
│  ║                                                        ║ │
│  ║  ●━━━●━━━●  Step 3 of 3                               ║ │
│  ║  ✨ Almost done...                                     ║ │
│  ║                                                        ║ │
│  ║  Actions:                                             ║ │
│  ║  ✓ Task decomposed into 5 micro-steps                 ║ │
│  ║  ✓ Steps classified (3 human, 1 digital, 1 unknown)   ║ │
│  ║  ✓ Creating task in database                          ║ │
│  ║  ⋯ Generating automation plan                          ║ │ ← Current
│  ║  ⋯ Checking for clarification needs                   ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ What needs to get done?                                ││
│  │                                                         ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [✓ Auto Mode]  [ Ask Clarity]                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### State 5: Complete! (Success)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│                         🎯 Capture                          │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  ✅ Task captured successfully!                       ║ │
│  ║                                                        ║ │
│  ║  ●━━━●━━━●  Complete in 847ms                         ║ │
│  ║                                                        ║ │
│  ║  Results:                                             ║ │
│  ║  ✓ 5 micro-steps created                              ║ │
│  ║  ✓ 3 human tasks • 1 digital task • 1 needs info      ║ │
│  ║  ✓ Estimated time: 15 minutes                         ║ │
│  ║  ⚠️ 1 clarification question                          ║ │
│  ║                                                        ║ │
│  ║  [View Task Details]  [Start First Step]              ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ What needs to get done?                                ││ ← Ready
│  │                                                         ││   again
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [✓ Auto Mode]  [ Ask Clarity]                             │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🎬 Detailed Action Sequences

### Stage 1: Analyzing (600-800ms)
```
Time    Action Label                              Status
────────────────────────────────────────────────────────
0ms     Parsing natural language                  ⋯ (pending)
100ms   Parsing natural language                  ⏳ (active)
300ms   Parsing natural language                  ✓ (done)
        Extracting entities                       ⏳ (active)
500ms   Extracting entities                       ✓ (done)
        Detecting priority and urgency            ⏳ (active)
700ms   Detecting priority and urgency            ✓ (done)
        Identifying tags and categories           ⏳ (active)
800ms   Identifying tags and categories           ✓ (done)
```

### Stage 2: Breaking Down (400-600ms)
```
Time    Action Label                              Status
────────────────────────────────────────────────────────
800ms   Decomposing into 2-5 minute chunks        ⏳ (active)
1000ms  Decomposing into 2-5 minute chunks        ✓ (done)
        Classifying steps (DIGITAL vs HUMAN)      ⏳ (active)
1200ms  Classifying steps (DIGITAL vs HUMAN)      ✓ (done)
        Estimating duration for each step         ⏳ (active)
1300ms  Estimating duration for each step         ✓ (done)
        Detecting automation opportunities        ⏳ (active)
1400ms  Detecting automation opportunities        ✓ (done)
```

### Stage 3: Finalizing (200-400ms)
```
Time    Action Label                              Status
────────────────────────────────────────────────────────
1400ms  Creating task in database                 ⏳ (active)
1600ms  Creating task in database                 ✓ (done)
        Generating automation plan                ⏳ (active)
1750ms  Generating automation plan                ✓ (done)
        Checking for clarification needs          ⏳ (active)
1850ms  Checking for clarification needs          ✓ (done)
        Finalizing...                             ⏳ (active)
2000ms  Complete!                                 ✓ (done)
```

---

## 🎨 Visual States for Actions

### Action Status Icons
```
⋯  = Pending (not started yet)      - Gray color
⏳ = In Progress (currently running) - Blue color with pulse animation
✓  = Complete (done)                 - Green color
❌ = Failed (error)                  - Red color
```

### Progress Dots
```
●━━━○━━━○  = Step 1 of 3 (Stage 1 active)
●━━━●━━━○  = Step 2 of 3 (Stage 2 active)
●━━━●━━━●  = Step 3 of 3 (Stage 3 active)
```

---

## 🧩 Component Design

### Component: `CaptureProgressBar`

```typescript
// frontend/src/components/mobile/CaptureProgressBar.tsx

interface CaptureProgressBarProps {
  stage: 'analyzing' | 'breaking_down' | 'almost_done' | 'complete' | null;
  actions: ActionStep[];
  processingTimeMs?: number;
  onViewDetails?: () => void;
  onStartTask?: () => void;
}

interface ActionStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
  timestamp?: number;
}

// Example usage:
<CaptureProgressBar
  stage="breaking_down"
  actions={[
    { id: '1', label: 'Parsing natural language', status: 'done' },
    { id: '2', label: 'Extracting entities', status: 'done' },
    { id: '3', label: 'Detecting priority', status: 'done' },
    { id: '4', label: 'Decomposing into chunks', status: 'done' },
    { id: '5', label: 'Classifying steps', status: 'active' },
    { id: '6', label: 'Estimating duration', status: 'pending' },
  ]}
/>
```

### State Management

```typescript
// frontend/src/app/mobile/page.tsx

interface ProcessingState {
  stage: 'analyzing' | 'breaking_down' | 'almost_done' | 'complete' | null;
  actions: ActionStep[];
  startTime: number;
}

const [processingState, setProcessingState] = useState<ProcessingState>({
  stage: null,
  actions: [],
  startTime: 0,
});

// When capture starts
const handleCapture = async (text: string) => {
  setProcessingState({
    stage: 'analyzing',
    actions: [
      { id: '1', label: 'Parsing natural language', status: 'active' },
      { id: '2', label: 'Extracting entities', status: 'pending' },
      { id: '3', label: 'Detecting priority and urgency', status: 'pending' },
      { id: '4', label: 'Identifying tags and categories', status: 'pending' },
    ],
    startTime: Date.now(),
  });

  // Simulate progress updates (in real app, these come from backend or client-side events)
  setTimeout(() => {
    setProcessingState(prev => ({
      ...prev,
      actions: updateActionStatus(prev.actions, '1', 'done', '2', 'active'),
    }));
  }, 200);

  // ... continue with API call
};
```

---

## 🎨 Color Scheme (Solarized Dark)

```typescript
const statusColors = {
  pending: '#586e75',    // Base01 - gray, subdued
  active: '#268bd2',     // Blue - attention-grabbing with pulse
  done: '#859900',       // Green - success
  error: '#dc322f',      // Red - alert
};

const boxColors = {
  background: '#073642', // Base02 - slightly elevated
  border: '#586e75',     // Base01 - subtle border
  borderActive: '#268bd2', // Blue - active state
  borderSuccess: '#859900', // Green - success state
};
```

---

## 📱 Responsive Behavior

### Mobile (Default)
```
- Box takes full width minus 16px padding
- Actions list shows max 4 items (scroll if more)
- Font size: 13px for action labels
- Icons: 16px
```

### Tablet/Desktop
```
- Box max-width: 600px, centered
- Actions list shows max 6 items
- Font size: 14px for action labels
- Icons: 18px
```

---

## 🎭 Animation Details

### Progress Dots Animation
```css
/* Dot fills in from left to right */
.progress-dot {
  transition: all 300ms ease-out;
}

.progress-dot.active {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}
```

### Action Status Transition
```css
/* Status icon fades and scales */
.action-status {
  transition: all 200ms ease-out;
}

.action-status.pending {
  opacity: 0.4;
}

.action-status.active {
  animation: spin 2s linear infinite; /* For ⏳ */
}

.action-status.done {
  animation: checkmark-pop 300ms ease-out;
}

@keyframes checkmark-pop {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Box Entrance
```css
/* Box slides down from top */
.progress-box {
  animation: slide-down 300ms ease-out;
}

@keyframes slide-down {
  0% { transform: translateY(-100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
```

### Box Exit (Success)
```css
/* Box stays for 3 seconds, then fades out */
.progress-box.complete {
  animation: fade-out 500ms ease-out 3s forwards;
}

@keyframes fade-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.95); }
}
```

---

## 🔄 Action List by Stage

### Stage 1: "Analyzing" (🧠)
```
1. ⏳ Parsing natural language
2. ⋯ Extracting entities (action, object, target)
3. ⋯ Detecting priority and urgency
4. ⋯ Identifying tags and categories
```

### Stage 2: "Breaking Down" (🔨)
```
1. ✓ Task parsed successfully
2. ⏳ Decomposing into 2-5 minute chunks
3. ⋯ Classifying steps (DIGITAL vs HUMAN)
4. ⋯ Estimating duration for each step
5. ⋯ Detecting automation opportunities
```

### Stage 3: "Almost Done" (✨)
```
1. ✓ Task decomposed into 5 micro-steps
2. ✓ Steps classified (3 human, 1 digital, 1 unknown)
3. ⏳ Creating task in database
4. ⋯ Generating automation plan
5. ⋯ Checking for clarification needs
```

### Stage 4: "Complete" (✅)
```
Results Summary:
✓ 5 micro-steps created
✓ 3 human tasks • 1 digital task • 1 needs info
✓ Estimated time: 15 minutes
⚠️ 1 clarification question

[Action Buttons]
```

---

## 🧪 Testing Scenarios

### Test 1: Fast Completion (< 1s)
```
Expected: Actions progress quickly, may skip showing some intermediate states
Behavior: Show final "Complete" state for 3 seconds minimum
```

### Test 2: Slow API (> 3s)
```
Expected: Actions stay on "active" state longer
Behavior: Show realistic progress, don't fake it
```

### Test 3: Error During Processing
```
Expected: Action shows ❌ icon with red color
Behavior: Show error message, allow retry
```

### Test 4: Multiple Rapid Captures
```
Expected: New capture cancels previous progress bar
Behavior: Smooth transition, no flickering
```

---

## 📊 Comparison: Before vs After

### Before (Current)
```
┌────────────────────────┐
│  What needs doing?     │
└────────────────────────┘
         ↓ [Enter]
┌────────────────────────┐
│  🧠 Analyzing...       │  ← Generic, no detail
│  ▓▓▓▓░░░░░░            │
└────────────────────────┘
         ↓
    [Modal pops up]
```

### After (New Design)
```
┌────────────────────────────────────┐
│  ●━━━●━━━○  Step 2 of 3           │
│  🔨 Breaking down...               │
│                                    │
│  Actions:                          │
│  ✓ Task parsed successfully        │ ← Specific actions
│  ⏳ Decomposing into chunks         │ ← Current step
│  ⋯ Classifying steps                │ ← Next steps
│  ⋯ Estimating duration              │
└────────────────────────────────────┘
         ↓
┌────────────────────────┐
│  What needs doing?     │  ← Ready for next task
└────────────────────────┘
```

---

## 🚀 Implementation Steps

### Step 1: Create Component
- [ ] Create `CaptureProgressBar.tsx`
- [ ] Add TypeScript interfaces
- [ ] Style with Solarized Dark colors
- [ ] Add animations (slide-down, pulse, checkmark-pop)

### Step 2: Add to Capture Tab
- [ ] Import into `page.tsx`
- [ ] Position above textarea
- [ ] Connect to capture flow state
- [ ] Test with mock data

### Step 3: Wire Up Real Data
- [ ] Map backend stages to action lists
- [ ] Update actions in real-time (or simulate)
- [ ] Show actual processing time
- [ ] Handle errors gracefully

### Step 4: Polish
- [ ] Add haptic feedback on stage transitions (mobile)
- [ ] Add sound effects (optional, subtle)
- [ ] Optimize animations for 60fps
- [ ] Test on various devices

---

## 💡 Future Enhancements

### Phase 2 Features
1. **Expand/Collapse** - Allow users to minimize progress bar if they want
2. **History** - Show last 3 captured tasks in a mini-list below progress bar
3. **Estimated Time Remaining** - Show countdown timer based on average completion time
4. **Confidence Score** - Show AI confidence for each step (e.g., "95% confident")
5. **Debug Mode** - Toggle to show raw API responses and timing data

---

**Last Updated**: 2025-10-23
**Version**: 1.0
**Status**: Ready to Implement 🚀
