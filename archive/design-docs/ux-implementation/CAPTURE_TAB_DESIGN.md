# 📱 Capture Tab - Progressive Display & Full-Screen Detail View

## 🎯 Design Goals

1. **Show progress IN the tab** - Don't hide what's happening behind a loading spinner
2. **Progressive disclosure** - Reveal task structure as it's being analyzed
3. **Full-screen detail view** - Replace modal with immersive full-screen experience
4. **Unified component** - Same view for capture results AND tapping any task card
5. **ADHD-optimized** - Clear visual feedback, minimal cognitive load, satisfying animations

---

## 🎨 Visual Design: In-Tab Progressive Breakdown

### Current Flow (Hidden)
```
User types → Presses Enter → Loading spinner → Modal pops up → Task shown
```
**Problem**: User sees nothing happening for 500-2000ms. Black box experience.

### New Flow (Progressive)
```
User types → Presses Enter → Input shrinks up → Task appears inline →
Grows as steps arrive → Full detail view on tap
```
**Benefit**: User sees exactly what's happening. Engaging, transparent, satisfying.

---

## 📐 Layout: Capture Tab States

### State 1: Ready to Capture (Default)
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
│  │                                                         ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  Toggles:                                                   │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │ ✓ Auto Mode  │  │ Ask Clarity  │                       │
│  └──────────────┘  └──────────────┘                       │
│                                                             │
│  Tip: Press Cmd+Enter to capture quickly                   │
│                                                             │
│                                                             │
│  Recent Tasks ──────────────────────────────────────       │
│  ┌──────────────────────────────────────────────┐         │
│  │ 👤 Draft Q4 presentation     ⏱️ 45m          │  [Tap]  │
│  └──────────────────────────────────────────────┘         │
│  ┌──────────────────────────────────────────────┐         │
│  │ 🤖 Schedule team sync         ⏱️ 5m           │  [Tap]  │
│  └──────────────────────────────────────────────┘         │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  [🎯 Capture] [🔍 Scout] [🎯 Hunter] [🔧 Mender] [🗺 Mapper]│
└────────────────────────────────────────────────────────────┘
```

### State 2: Analyzing (Progressive - Step 1)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │ What needs to get done?                        │  ← Shrinks │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  ╔═══════════════════════════════════════════════╗         │
│  ║  🧠 Analyzing your task...                    ║  ← New  │
│  ║  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░                    ║         │
│  ╚═══════════════════════════════════════════════╝         │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Send email to Sara about project deadline             ││ ← Task
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││   shell
│  │                                                         ││   appears
│  │  Priority: medium • Estimated: ~15 min                 ││
│  │  Tags: email, communication, project                   ││
│  │                                                         ││
│  │  Breaking down into steps...                           ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  Recent Tasks (collapsed)                                  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### State 3: Breaking Down (Progressive - Step 2)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │ What needs to get done?                        │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  ╔═══════════════════════════════════════════════╗         │
│  ║  🔨 Breaking it down...                       ║         │
│  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░                ║         │
│  ╚═══════════════════════════════════════════════╝         │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Send email to Sara about project deadline             ││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │                                                         ││
│  │  Priority: medium • Estimated: 15 min • 5 steps        ││
│  │  Tags: email, communication, project                   ││
│  │                                                         ││
│  │  Micro-Steps:                                          ││
│  │  ┌────────────────────────────────────────────┐       ││
│  │  │ 1. ❓ Find Sara's email address      3 min │ ← Steps││
│  │  └────────────────────────────────────────────┘       ││   appear
│  │  ┌────────────────────────────────────────────┐       ││   one by
│  │  │ 2. 👤 Draft email message            5 min │       ││   one
│  │  └────────────────────────────────────────────┘       ││
│  │  ┌────────────────────────────────────────────┐       ││
│  │  │ 3. 📎 Attach project files           2 min │       ││
│  │  └────────────────────────────────────────────┘       ││
│  │  ┌────────────────────────────────────────────┐       ││
│  │  │ 4. ✅ Review for accuracy            2 min │       ││
│  │  └────────────────────────────────────────────┘       ││
│  │  ┌────────────────────────────────────────────┐       ││
│  │  │ 5. 🤖 Send email                     1 min │       ││
│  │  └────────────────────────────────────────────┘       ││
│  │                                                         ││
│  │  📊 Breakdown: 🤖 1 digital • 👤 3 human • ❓ 1 unknown ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### State 4: Complete (Ready to Act)
```
┌────────────────────────────────────────────────────────────┐
│  🌅 Morning • 72% Energy                          [Profile]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────┐        │
│  │ What needs to get done?                        │        │
│  └────────────────────────────────────────────────┘        │
│                                                             │
│  ✅ Task captured in 847ms!                                │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │  Send email to Sara about project deadline             ││
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  │                                                         ││
│  │  Priority: medium • Estimated: 15 min • 5 steps        ││
│  │  Tags: email, communication, project                   ││
│  │                                                         ││
│  │  Next: ❓ Find Sara's email address (3 min)            ││
│  │                                                         ││
│  │  ⚠️ Need More Info: 1 clarification needed             ││
│  │                                                         ││
│  │  [View Full Details] [Start First Step] [Edit]        ││  ← Actions
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  Recent Tasks ──────────────────────────────────────       │
│  ┌──────────────────────────────────────────────┐         │
│  │ 👤 Draft Q4 presentation     ⏱️ 45m          │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 🖼️ Full-Screen Task Detail View

### Design Philosophy
- **Replaces the modal** - No more slide-up sheet, full immersive view
- **Scrollable sections** - Header fixed, content scrolls
- **Action-focused** - Primary actions always visible
- **Rich metadata** - Show everything: tags, time, breakdown, automation plans
- **Reusable** - Same component for capture results AND card taps

### Navigation Flow
```
Capture Tab               Task Detail View            Action
─────────────────────────────────────────────────────────────
[Task Card]     ──tap──→  [Full Detail]      ──tap──→  [Start Scout]
                                            ──tap──→  [Clarify]
                          [Back Button]     ──tap──→  [Capture Tab]
```

### Layout Structure
```
┌────────────────────────────────────────────────────────────┐
│  [← Back]        Task Detail                     [⋮ Menu] │ ← Fixed header
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐ │
│  │  📧 Send email to Sara about project deadline       │ │ ← Title
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │
│  │                                                       │ │
│  │  Send Sara the updated project timeline and         │ │
│  │  deliverables for Q4. Include the latest roadmap    │ │ ← Description
│  │  document and budget breakdown.                      │ │
│  │                                                       │ │
│  │  ┌──────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │MEDIUM│  │ ⏱️ 15 min│  │ PENDING  │              │ │ ← Badges
│  │  └──────┘  └──────────┘  └──────────┘              │ │
│  │                                                       │ │
│  │  Tags: email • communication • project • work        │ │ ← Tags
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗│
│  ║  ⚠️ Need Clarification (1 question)                   ║│ ← Alert
│  ║  What is Sara's email address?                        ║│
│  ║  [Answer Now]                                         ║│
│  ╚═══════════════════════════════════════════════════════╝│
│                                                             │
│  📊 Task Breakdown ───────────────────────────────────     │ ← Breakdown
│  ┌─────────────────────────────────────────────────────┐  │   section
│  │  Total Time: 15 minutes                              │  │
│  │  Steps: 5                                            │  │
│  │                                                       │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░                         │  │  │
│  │  │ 🤖 Digital: 1 (20%)  👤 Human: 3 (60%)        │  │  │
│  │  │ ❓ Needs Info: 1 (20%)                        │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  📋 Micro-Steps (5) ──────────────────────────────────     │ ← Steps
│  ┌─────────────────────────────────────────────────────┐  │   section
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ 1. ❓ Find Sara's email address               │  │  │
│  │  │    3 min • NEEDS CLARIFICATION                │  │  │
│  │  │    ⚠️ Missing: email_recipient                │  │  │
│  │  │    [Provide Info]                             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ 2. 👤 Draft email message                     │  │  │
│  │  │    5 min • HUMAN TASK                         │  │  │
│  │  │    Write clear, professional email about      │  │  │
│  │  │    project deadline and deliverables.         │  │  │
│  │  │    [Start Step] [Skip]                        │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ 3. 📎 Attach project files                    │  │  │
│  │  │    2 min • HUMAN TASK                         │  │  │
│  │  │    Locate and attach: roadmap doc, budget     │  │  │
│  │  │    [Start Step] [Skip]                        │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ 4. ✅ Review for accuracy                     │  │  │
│  │  │    2 min • HUMAN TASK                         │  │  │
│  │  │    Double-check email, attachments, recipients│  │  │
│  │  │    [Start Step] [Skip]                        │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │ 5. 🤖 Send email                              │  │  │
│  │  │    1 min • DIGITAL (Can delegate to agent)    │  │  │
│  │  │                                               │  │  │
│  │  │    Automation Plan:                           │  │  │
│  │  │    • Tool: email_sender                       │  │  │
│  │  │    • Account: work@company.com                │  │  │
│  │  │    • Recipient: sara@company.com              │  │  │
│  │  │    • Attachments: roadmap.pdf, budget.xlsx    │  │  │
│  │  │                                               │  │  │
│  │  │    [Delegate to Agent] [Do Manually]          │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  🤖 Automation Potential ─────────────────────────────     │ ← Automation
│  ┌─────────────────────────────────────────────────────┐  │   section
│  │  This task is 20% automatable                       │  │
│  │                                                       │  │
│  │  Digital Step (1):                                   │  │
│  │  • Step 5: Send email → email_sender agent           │  │
│  │                                                       │  │
│  │  [Set Up Automation]                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  📝 Metadata ─────────────────────────────────────────     │ ← Metadata
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Created: Today at 10:47 AM                          │  │
│  │  Processing Time: 847ms                              │  │
│  │  Voice Input: No                                     │  │
│  │  Location: Not captured                              │  │
│  │  Complexity Score: 3/10                              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  🔗 Dependencies ─────────────────────────────────────     │ ← Dependencies
│  ┌─────────────────────────────────────────────────────┐  │
│  │  None                                                 │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  💬 Notes & Attachments ──────────────────────────────     │ ← Notes
│  ┌─────────────────────────────────────────────────────┐  │
│  │  + Add note or attachment                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  [Answer Clarifications]  [Start First Step]  [•••]       │ ← Fixed footer
└────────────────────────────────────────────────────────────┘
```

---

## 🎬 Animation Sequence

### Progressive Reveal (In-Tab)
```
Time    Event                   Visual Change
────────────────────────────────────────────────────────────
0ms     User presses Enter     • Input shrinks (300ms ease-out)
                               • Drop animation plays
100ms   API called             • "Analyzing..." bar appears
                               • Task shell fades in (200ms)
500ms   First parse complete   • Title + description populate
                               • Priority badge animates in
800ms   Tags extracted         • Tags fade in, one by one (50ms stagger)
1000ms  Decomposition starts   • "Breaking down..." bar updates
1200ms  First step arrives     • Step 1 slides in from right (150ms)
1250ms  Second step arrives    • Step 2 slides in from right (150ms)
1300ms  Third step arrives     • Step 3 slides in from right (150ms)
...     ...                    ...
2000ms  All steps complete     • Breakdown chart animates
                               • Success checkmark bounces
                               • Actions buttons fade in
2500ms  Ready to interact      • "View Full Details" pulses once
```

### Transition to Full-Screen Detail
```
Time    Event                   Visual Change
────────────────────────────────────────────────────────────
0ms     User taps card         • Card scales up slightly (100ms)
100ms   Navigation starts      • Card expands to full screen
                               • Background darkens
                               • Header slides in from top
200ms   Content loads          • All sections fade in (stagger 50ms)
300ms   Footer appears         • Action buttons slide up from bottom
350ms   Ready to interact      • Scroll enabled
```

---

## 🧩 Component Architecture

### New Components Needed

#### 1. `ProgressiveTaskCard` (In-Tab Display)
```typescript
// frontend/src/components/mobile/ProgressiveTaskCard.tsx

interface ProgressiveTaskCardProps {
  loadingStage: LoadingStage | null;
  captureResponse: CaptureResponse | null;
  onViewDetails: () => void;
  onStartTask: () => void;
  className?: string;
}

// Shows task as it's being built:
// - Stage 1: Shell + loading bar
// - Stage 2: Title + description + tags
// - Stage 3: Steps appear one by one
// - Stage 4: Complete with actions
```

#### 2. `TaskDetailView` (Full-Screen)
```typescript
// frontend/src/components/mobile/TaskDetailView.tsx

interface TaskDetailViewProps {
  task: ExtendedTask;
  isOpen: boolean;
  onClose: () => void;
  onStartStep: (stepId: string) => void;
  onAnswerClarification: () => void;
  onSetupAutomation: () => void;
  onEditTask: () => void;
}

// Full-screen view with sections:
// - Header (fixed)
// - Hero (title, description, badges, tags)
// - Clarification Alert (if needed)
// - Breakdown Chart
// - Micro-Steps List (expandable)
// - Automation Info (if applicable)
// - Metadata
// - Dependencies
// - Notes
// - Footer Actions (fixed)
```

#### 3. `MicroStepDetail` (Individual Step View)
```typescript
// frontend/src/components/mobile/MicroStepDetail.tsx

interface MicroStepDetailProps {
  step: MicroStep;
  index: number;
  onStart: () => void;
  onSkip: () => void;
  onDelegate: () => void;
  onProvideClarification: () => void;
}

// Rich step display:
// - Icon + title
// - Description (expandable)
// - Time estimate
// - Type badge (DIGITAL/HUMAN)
// - Clarification warning (if needed)
// - Automation plan (if DIGITAL)
// - Action buttons
```

#### 4. `ClarificationAlert` (Inline Warning)
```typescript
// frontend/src/components/mobile/ClarificationAlert.tsx

interface ClarificationAlertProps {
  clarifications: ClarificationQuestion[];
  onAnswer: () => void;
  onDismiss: () => void;
}

// Alert banner at top of detail view:
// - Warning icon
// - Count of questions
// - Preview of first question
// - "Answer Now" button
```

#### 5. `BreakdownChart` (Visual Pie Chart)
```typescript
// frontend/src/components/mobile/BreakdownChart.tsx

interface BreakdownChartProps {
  breakdown: TaskBreakdown;
  showLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Visual breakdown:
// - Horizontal bar or donut chart
// - Color-coded segments (digital = cyan, human = blue, unknown = orange)
// - Percentages
// - Time estimate
```

---

## 🔄 State Management

### Capture Tab State
```typescript
// frontend/src/app/mobile/page.tsx

interface CaptureState {
  // Input
  captureText: string;
  autoMode: boolean;
  askForClarity: boolean;

  // Processing
  isProcessing: boolean;
  loadingStage: LoadingStage | null; // 'analyzing' | 'breaking_down' | 'almost_done'

  // Results
  capturedTask: CaptureResponse | null;
  showProgressiveCard: boolean; // Show in-tab progressive display
  showDetailView: boolean; // Show full-screen detail

  // Selected task (for viewing from Recent Tasks)
  selectedTask: ExtendedTask | null;
}

// State flow:
// 1. User enters text → captureText updated
// 2. User presses Enter → isProcessing = true, loadingStage = 'analyzing'
// 3. API returns → capturedTask set, showProgressiveCard = true
// 4. User taps "View Details" → showDetailView = true
// 5. User taps "Back" → showDetailView = false
```

### Progressive Card Reveal Logic
```typescript
// Stages of progressive reveal
const [revealStage, setRevealStage] = useState<
  'shell' | 'title' | 'tags' | 'steps' | 'complete'
>('shell');

useEffect(() => {
  if (!capturedTask) return;

  const timeline = [
    { stage: 'shell', delay: 0 },
    { stage: 'title', delay: 100 },
    { stage: 'tags', delay: 300 },
    { stage: 'steps', delay: 500 },
    { stage: 'complete', delay: 2000 },
  ];

  timeline.forEach(({ stage, delay }) => {
    setTimeout(() => setRevealStage(stage as any), delay);
  });
}, [capturedTask]);
```

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Full-width cards
- Full-screen detail view takes entire viewport
- Actions footer sticks to bottom
- Sections stack vertically

### Tablet (768px - 1024px)
- Slightly wider cards with max-width
- Detail view has side margins (16px)
- Two-column layout for metadata sections

### Desktop (> 1024px)
- Center-aligned with max-width: 600px
- Detail view appears as centered modal-like panel
- Multi-column layout for breakdown and metadata

---

## 🎯 Key Interactions

### 1. Tap "View Full Details"
```
In-Tab Card → Full-Screen Detail View
- Card scales and expands
- Background dims
- Detail view slides up
- All sections animate in
```

### 2. Tap Any Recent Task Card
```
Recent Task Card → Full-Screen Detail View
- Fetch task details from API
- Show loading skeleton
- Transition to detail view
- Same layout as capture result
```

### 3. Tap "Answer Clarifications"
```
Detail View → Clarification Modal
- Detail view stays in background (slightly dimmed)
- Clarification modal slides up from bottom
- User answers questions
- On submit: modal slides down, detail view refreshes
```

### 4. Tap "Start First Step"
```
Detail View → Scout Mode
- Transition to Scout tab
- Load first step context
- Pre-fill any known info
- Detail view closes
```

### 5. Tap "Delegate to Agent"
```
Detail View → Agent Setup Modal
- Show automation configuration
- Select agent type
- Configure parameters
- Confirm and delegate
```

### 6. Swipe Down on Detail View
```
Full-Screen Detail → In-Tab Card (collapsed)
- Detail view slides down
- Background lightens
- Card shrinks back to in-tab size
- OR: closes entirely back to Capture tab
```

---

## 🎨 Color System (Solarized Dark)

```typescript
// Task type colors
const taskColors = {
  digital: '#2aa198',    // Cyan - automatable
  human: '#268bd2',      // Blue - manual
  unknown: '#cb4b16',    // Orange - needs clarification
  resolved: '#859900',   // Green - completed clarification
};

// Priority colors
const priorityColors = {
  low: '#586e75',        // Base01 - subtle
  medium: '#b58900',     // Yellow - moderate
  high: '#cb4b16',       // Orange - important
  critical: '#dc322f',   // Red - urgent
};

// Status colors
const statusColors = {
  pending: '#586e75',    // Base01 - not started
  in_progress: '#268bd2', // Blue - active
  done: '#859900',       // Green - complete
  blocked: '#dc322f',    // Red - stuck
  review: '#6c71c4',     // Violet - needs review
  deferred: '#586e75',   // Base01 - postponed
  cancelled: '#93a1a1',  // Base1 - abandoned
};

// Background colors
const bgColors = {
  base03: '#002b36',     // Darkest - main background
  base02: '#073642',     // Dark - cards, elevated surfaces
  base01: '#586e75',     // Medium - borders, inactive
  base00: '#657b83',     // Content
  base0: '#839496',      // Body text
  base1: '#93a1a1',      // Secondary text
  base2: '#eee8d5',      // Light background (unused in dark mode)
  base3: '#fdf6e3',      // Lightest (unused in dark mode)
};
```

---

## 🔧 Implementation Checklist

### Phase 1: In-Tab Progressive Display ✅
- [ ] Create `ProgressiveTaskCard` component
- [ ] Add progressive reveal animations (title → tags → steps)
- [ ] Wire up to capture flow (replace modal trigger)
- [ ] Add "View Full Details" button
- [ ] Test with various task complexities

### Phase 2: Full-Screen Detail View ✅
- [ ] Create `TaskDetailView` component
- [ ] Implement fixed header and footer
- [ ] Build scrollable content sections:
  - [ ] Hero section (title, description, badges)
  - [ ] Clarification alert
  - [ ] Breakdown chart
  - [ ] Micro-steps list
  - [ ] Automation section
  - [ ] Metadata section
  - [ ] Dependencies section
  - [ ] Notes section
- [ ] Add navigation (back button, close gesture)
- [ ] Test scrolling performance

### Phase 3: Detail View Components ✅
- [ ] Create `MicroStepDetail` component with expand/collapse
- [ ] Create `BreakdownChart` component (visual chart)
- [ ] Create `ClarificationAlert` component
- [ ] Create `AutomationInfo` component
- [ ] Add loading skeletons for each section

### Phase 4: Integration ✅
- [ ] Wire up "View Full Details" from ProgressiveTaskCard
- [ ] Wire up tap on Recent Task cards → Detail View
- [ ] Connect "Answer Clarifications" → ClarificationModal
- [ ] Connect "Start First Step" → Scout Mode
- [ ] Connect "Delegate to Agent" → Agent Setup
- [ ] Test all navigation flows

### Phase 5: Polish & Animation ✅
- [ ] Add page transitions (slide, fade, scale)
- [ ] Add micro-interactions (button press, card hover)
- [ ] Add success celebrations (checkmarks, confetti)
- [ ] Add haptic feedback (mobile only)
- [ ] Optimize performance (lazy loading, code splitting)
- [ ] Test on multiple devices

### Phase 6: Accessibility ✅
- [ ] Add keyboard navigation (Tab, Enter, Esc)
- [ ] Add screen reader labels (ARIA)
- [ ] Add focus management (trap focus in modals)
- [ ] Test with screen reader (VoiceOver, TalkBack)
- [ ] Ensure color contrast (WCAG AA)

---

## 📊 Success Metrics

### User Experience
- **Time to Understanding**: User understands task breakdown in < 3 seconds
- **Engagement**: User views full details on 60%+ of captures
- **Clarity**: Clarification questions answered 80%+ of the time
- **Satisfaction**: NPS score > 8 for capture experience

### Performance
- **Capture Speed**: Total capture time < 2000ms (p95)
- **Progressive Reveal**: Each step animates in < 150ms
- **Detail View Load**: Full detail view loads < 300ms
- **Scroll Performance**: 60fps scrolling on mobile

### Technical
- **Component Reusability**: TaskDetailView used for both capture and card taps
- **Code Quality**: 0 accessibility violations (axe-core)
- **Bundle Size**: Components add < 50KB to bundle
- **Test Coverage**: > 80% coverage for new components

---

## 🧪 Testing Scenarios

### Test Case 1: Simple Task (No Clarification)
```
Input: "Buy milk tomorrow"
Expected:
1. Progressive reveal: shell → title → tags → 2 steps
2. Steps: ["Add to shopping list", "Set reminder"]
3. Breakdown: 🤖 2 digital, 👤 0 human
4. Detail view: All sections populated, no clarification alert
5. Actions: "Start First Step" enabled immediately
```

### Test Case 2: Complex Task (With Clarification)
```
Input: "Send email to Sara"
Expected:
1. Progressive reveal: shell → title → tags → 3 steps
2. Steps: ["Find email address" (unknown), "Draft email" (human), "Send" (unknown)]
3. Breakdown: 🤖 0 digital, 👤 1 human, ❓ 2 unknown
4. Detail view: Clarification alert shown at top
5. Actions: "Answer Clarifications" highlighted
```

### Test Case 3: Recent Task Tap
```
Action: Tap recent task card "Draft Q4 presentation"
Expected:
1. Fetch task details from API
2. Show loading skeleton
3. Transition to full-screen detail view
4. All sections loaded and displayed
5. Actions: "Start First Step" or "Resume" (if in progress)
```

### Test Case 4: Clarification Flow
```
Starting from: Detail view with clarification alert
Action: Tap "Answer Now"
Expected:
1. Clarification modal slides up
2. Question 1 shown with input field
3. User answers and submits
4. API call to /api/v1/capture/clarify
5. Detail view refreshes with updated steps
6. Clarification alert disappears
7. Steps re-classified (unknown → digital/human)
```

### Test Case 5: Navigation Flow
```
Starting from: Capture tab
Action sequence:
1. Enter task → Progressive card appears
2. Tap "View Full Details" → Detail view opens
3. Tap "Back" → Returns to Capture tab
4. Tap recent task → Detail view opens (different task)
5. Swipe down → Detail view closes
Expected: All transitions smooth, state preserved correctly
```

---

## 🎨 Final Visual Summary

### Before (Current)
```
Capture → [Loading...] → [Modal pops up] → View Task
            ❌ Black box    ❌ Small view
```

### After (New Design)
```
Capture → [Progressive reveal in-tab] → [Full-screen detail] → Action
            ✅ Transparent progress      ✅ Rich information
                                                                → Scout Mode
                                                                → Clarifications
                                                                → Automation
```

---

## 📚 Related Files

### Components to Create
- `frontend/src/components/mobile/ProgressiveTaskCard.tsx` (NEW)
- `frontend/src/components/mobile/TaskDetailView.tsx` (NEW)
- `frontend/src/components/mobile/MicroStepDetail.tsx` (NEW)
- `frontend/src/components/mobile/ClarificationAlert.tsx` (NEW)
- `frontend/src/components/mobile/BreakdownChart.tsx` (NEW)

### Components to Modify
- `frontend/src/app/mobile/page.tsx` - Add state for progressive card and detail view
- `frontend/src/components/mobile/modes/CaptureMode.tsx` - Remove modal trigger, add progressive card
- `frontend/src/components/mobile/TaskBreakdownModal.tsx` - Deprecate or remove (replaced by TaskDetailView)

### Utilities to Create
- `frontend/src/lib/animation-utils.ts` - Helper functions for progressive reveal
- `frontend/src/lib/task-detail-utils.ts` - Data formatting for detail view

---

**Last Updated**: 2025-10-23
**Version**: 2.0
**Status**: Ready for Implementation 🚀
