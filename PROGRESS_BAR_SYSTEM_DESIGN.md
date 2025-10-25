# Progress Bar System Design
## The Universal UI Component for Everything

**Core Philosophy**: EVERYTHING IS A PROGRESS BAR

**North Star**: Life is a series of cycles. Every cycle is visual progress. Active step expands, others minimize.

---

## The Insight

```
Traditional UI:
- Tabs = Navigation menu
- Tasks = List items
- Daily schedule = Calendar
- Streaks = Number counter
- Energy = Dropdown selector

Result: Cognitive overload, inconsistent patterns, no visual progress

Our UI:
- EVERYTHING = Progress bar (packed rectangles)
- Same pattern, infinite applications
- Active step = 50% width (expanded)
- Others = share 50% width (minimized)
- Status = Color + emoji
- Progress = Always visible

Result: One pattern to learn, visual progress everywhere, dopamine on demand
```

---

## Part 1: Perfect The Progress Bar Component

### Current State Analysis

**What We Have** (AsyncJobTimeline.tsx):
```typescript
✅ Packed rectangles (no gaps)
✅ Active step expands to 50%
✅ Others minimize proportionally
✅ Emoji icons
✅ Status colors (pending/active/done/error)
✅ Three sizes (full/micro/nano)
✅ Duration display (top-right when expanded)
✅ Pulsing glow on active
✅ Hierarchical (can have children)
✅ Click to expand/collapse
```

**What Needs Fixing** (Based on Earlier Issues):
```typescript
❌ Step number removed (good - we don't need it)
❌ Auto/digital tasks show nothing on top-right (good - clean)
✅ Ordering by step_number (fixed - database aligned)
✅ Height: Expanded = h-10, Collapsed = h-10 (fixed - same height)
```

**What To Add For Anti-Procrastination**:
```typescript
⏳ Ready Now Badge (shows on active step if ready)
⏳ XP Preview (shows above active step)
⏳ Countdown Timer (shows for deadline steps)
⏳ Energy Match Glow (highlights compatible steps)
⏳ Streak Progress (steps become days)
⏳ Smart START Button (replaces expand click)
```

---

## The Perfect Progress Bar Anatomy

```
          🎁 +75 XP                    ⏰ 2h 34m
             ↓                             ↓
    ┌──────────────────────────────────────────────┐
    │  🟢 READY NOW                                │ ← Ready badge
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │                                               │
    │               📧 [ACTIVE]                     │ ← Expanded (50%)
    │           Reply to Alice                      │
    │              2 min                            │
    │                                               │
    │           [▶ START]                          │ ← Smart action
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    └──────────────────────────────────────────────┘
         ↑ Pulsing blue glow

┌────┐ ┌────┐                             ┌────┐ ┌────┐
│ ✅ │ │ ✅ │ ... (minimized done)    ... │ ⚪ │ │ ⚪ │
└────┘ └────┘                             └────┘ └────┘
 Done   Done                              Next   Next
```

**Layers** (from back to front):
1. **Background**: Status color (green=ready, blue=active, gray=pending, red=error)
2. **Glow**: Pulsing animation if active
3. **Content**: Emoji icon + description + duration
4. **Badges**: Ready badge, XP preview, countdown (floating above)
5. **Action**: START button (only on active)
6. **Nested**: Children progress bars (if decomposed)

---

## Part 2: Apply Progress Bar Pattern Everywhere

### 1. Tasks (Micro-Steps) ✅ DONE

**Already implemented**: AsyncJobTimeline for micro-steps

```
Task: "Buy groceries"

[✅ List] [✅ Drive] [📧 Shop (50%)] [⚪ Return] [⚪ Put Away]
  Done     Done      ACTIVE           Next       Next
```

---

### 2. Biological Tabs (Navigation)

**Current**: Tab buttons
**New**: Progress bar showing daily cycle

```
Your Daily Cycle:

[✅ Capture] [✅ Scout] [🎯 Hunter (50%)] [⚪ Mender] [⚪ Mapper]
   Morning    Morning      AFTERNOON         Evening    Night
   (Done)     (Done)       (NOW)            (Next)     (Next)

Click any to jump to that mode
Active mode = Expanded, shows what you do here
```

**Why This Works**:
- Shows where you are in the day
- Visualizes the biological cycle
- Capture (morning brain dump) → Scout (plan) → Hunter (do) → Mender (recover) → Mapper (reflect)
- Each step = emoji + short label when collapsed
- Active = expanded with full explanation

---

### 3. Daily Schedule

**Current**: Nothing
**New**: Progress bar showing time blocks

```
Today's Energy Cycle:

[✅ Wake] [✅ Peak] [✅ Lunch] [⚡ Work (50%)] [⚪ Crash] [⚪ Wind Down] [⚪ Sleep]
  6-9am    9-12pm   12-1pm     1-5pm NOW      5-7pm      7-10pm        10pm-6am
   High     Peak     Med        MEDIUM         Low        Low           Recovery
```

**Why This Works**:
- Shows energy curve through the day
- Active block = current time
- Can filter tasks to match current energy
- Visual reminder: "I'm in the afternoon dip, do easy tasks"

---

### 4. Energy Level Selector

**Current**: Dropdown? Nothing?
**New**: Progress bar showing energy spectrum

```
Your Current Energy:

[⚪ Crash] [⚪ Low] [⚡ Medium (50%)] [⚪ High] [⚪ Peak]
   1         2         3 NOW          4         5

Tasks you can do right now:
✅ Quick Wins (⚡ 2 min)
✅ Focused (🎯 5 min)
⚠️ Sustained (⏱️ 15 min) - Might be hard
❌ Marathon (🏔️ 45 min) - Wait for peak energy
```

**Interaction**: Click any energy level to select
**Effect**: Tasks auto-filter to match
**Why This Works**: Energy is a spectrum, not discrete states

---

### 5. Weekly Streak

**Current**: Number ("7 days")
**New**: Progress bar showing week

```
This Week's Streak:

[✅ Mon] [✅ Tue] [✅ Wed] [✅ Thu] [✅ Fri] [✅ Sat] [🔥 Sun (50%)]
   3        5       2       4       6       3        2 TODAY
  tasks   tasks   tasks   tasks   tasks   tasks    (so far)

Next milestone: 7 days = "Week Warrior" 🏆
```

**Monthly Streak**:
```
[✅✅✅✅✅✅✅] [✅✅✅✅✅✅✅] [✅✅✅✅✅✅✅] [🔥✅✅⚪⚪⚪⚪]
   Week 1         Week 2         Week 3        Week 4 (NOW)

Current: 23 days
Next milestone: 30 days = "Monthly Master" 🏅 (+500 XP)
```

**Why This Works**:
- Visual streak = dopamine
- See progress toward milestones
- "Don't break the chain" is VISIBLE
- Can see exactly how close you are

---

### 6. XP Progress to Next Level

**Current**: Nothing
**New**: Progress bar to level up

```
Level 5 → Level 6:

[████████████████████░░░░░░░░░░░░] 68% (3,400 / 5,000 XP)

Next level unlocks:
🏆 Custom themes
🏆 Advanced analytics
🏆 Team features

1,600 XP to go = ~16 more tasks
```

**Why This Works**: XP feels real when you see the bar fill up

---

### 7. Project Phases

**Current**: Nothing
**New**: Progress bar showing project lifecycle

```
Project: "Launch new feature"

[✅ Research] [✅ Design] [🎨 Build (50%)] [⚪ Test] [⚪ Launch]
   Week 1      Week 2      Week 3 NOW       Week 4    Week 5

Tasks in this phase: 8 done, 12 remaining
Estimated: 3 more days at current pace
```

---

### 8. Focus Session (Pomodoro)

**Current**: Timer
**New**: Progress bar showing session blocks

```
Focus Session:

[✅ Work 25] [✅ Break 5] [⚡ Work 25 (50%)] [⚪ Break 5] [⚪ Work 25] [⚪ Long Break]
   Done         Done         12:34 LEFT        Next        Next       Reward!

Current task: "Write proposal"
Progress: ████████████░░░░░░░░ 60%
```

**Why This Works**: Pomodoro sessions ARE a progress cycle

---

### 9. Daily Goals

**Current**: Checklist
**New**: Progress bar showing goal sequence

```
Today's Goals:

[✅ 1st task] [✅ 3 Quick Wins] [⚡ Email Inbox Zero (50%)] [⚪ Review docs] [⚪ Plan tomorrow]
   Done          Done               4/10 emails cleared         Next           Last
```

---

### 10. Onboarding Flow

**Current**: Multi-step form
**New**: Progress bar showing setup steps

```
Welcome to Proxy Agent Platform:

[✅ Account] [✅ Profile] [⚡ Sync Calendar (50%)] [⚪ First Task] [⚪ Complete]
   Done        Done         IN PROGRESS              Next          Finish

Step 3 of 5: Connect your calendar
This helps us understand your schedule
[Skip] [Connect Google Calendar]
```

---

## Part 3: The Anti-Procrastination Integration

### How Features Embed Into Progress Bars

**Not separate components** - they enhance the progress bar itself:

```typescript
// Before: Separate components everywhere
<TaskCard>
  <ReadinessBadge />
  <EnergyMatcher />
  <XPPreview />
  <SmartButton />
  <Countdown />
</TaskCard>

// After: Everything is the progress bar
<ProgressBar
  steps={microSteps}
  activeStep={currentStep}

  // Anti-procrastination props
  showReadiness={true}      // 🟢 badge on ready steps
  showXPPreview={true}       // "+75 XP" above active
  showCountdown={true}       // "⏰ 2h 34m" if deadline
  energyLevel={userEnergy}   // Highlight compatible steps
  onStart={executeSmartAction}  // One-tap START
/>
```

### Enhanced Progress Bar Props

```typescript
interface EnhancedProgressBarProps {
  // Core (existing)
  steps: Step[];
  activeStepId: string;
  onStepClick?: (id: string) => void;
  size?: 'full' | 'micro' | 'nano';

  // Anti-Procrastination (new)
  readinessData?: Map<string, ReadinessCheck>;  // Per-step readiness
  xpRewards?: Map<string, number>;              // Per-step XP
  deadlines?: Map<string, Date>;                // Per-step deadline
  energyLevel?: 1 | 2 | 3 | 4 | 5;             // User's current energy
  onSmartStart?: (stepId: string) => void;      // Smart action handler

  // Visual enhancements
  showBadges?: boolean;      // Ready badges, etc
  showRewards?: boolean;     // XP previews
  showCountdowns?: boolean;  // Deadline timers
  highlightEnergyMatch?: boolean;  // Glow on compatible steps
}
```

### Visual Enhancement Layers

```
LAYER 0: Base Progress Bar (Always)
  → Packed rectangles, status colors, icons

LAYER 1: Readiness (When step is ready)
  → 🟢 "READY NOW" badge floats above active step
  → Green glow around ready steps

LAYER 2: Energy Match (When energy matches)
  → Steps compatible with current energy get highlight
  → Incompatible steps are dimmed (50% opacity)
  → Compatible = normal brightness + green outline

LAYER 3: Rewards (Always for motivation)
  → "+75 XP" floats above active step (top-center)
  → Achievement progress: "2/10 emails" (below XP)

LAYER 4: Urgency (When deadline exists)
  → "⏰ 2h 34m" floats above step (top-right)
  → Color codes: 🔴 <3h, 🟡 3-24h, 🟢 1-7d

LAYER 5: Action (On active step only)
  → [▶ START] button in expanded step
  → Triggers smart actions (opens apps, timers, etc)

LAYER 6: Nested Progress (When decomposed)
  → Children steps render as nested progress bar
  → Indented, smaller size
  → Shows sub-progress within main step
```

---

## Part 4: Implementation Plan

### Phase 1: Perfect The Core (Week 1)

**Goal**: Make AsyncJobTimeline component flawless

**Tasks**:
1. ✅ Fix remaining bugs (step_number, height, etc) - DONE
2. Add readiness badge layer
3. Add XP preview layer
4. Add countdown layer
5. Add energy matching glow
6. Add smart START button
7. Comprehensive tests

**Deliverable**: One perfect progress bar component with all anti-procrastination features baked in

---

### Phase 2: Apply Pattern To Core Flows (Week 2)

**Goal**: Replace key UIs with progress bar pattern

**Priority 1 (Must Have)**:
1. **Biological Tabs**: Replace tab buttons with progress bar
2. **Energy Selector**: Replace dropdown with progress bar
3. **Daily Streak**: Replace number with progress bar (weekly + monthly)

**Priority 2 (Should Have)**:
4. **Daily Schedule**: Add time block progress bar
5. **Focus Session**: Replace timer with progress bar
6. **Daily Goals**: Replace checklist with progress bar

**Priority 3 (Nice To Have)**:
7. **XP Progress**: Add level-up progress bar
8. **Project Phases**: Add project lifecycle progress bar
9. **Onboarding**: Replace stepper with progress bar

---

### Phase 3: Polish & Test (Week 3)

**Goal**: Refine, optimize, validate

**Tasks**:
1. Visual polish (animations, transitions)
2. Performance optimization (many progress bars on screen)
3. A/B test against old UI
4. User testing with ADHD participants
5. Analytics instrumentation

---

## Part 5: The Design Language

### Core Principle

**ONE COMPONENT TO RULE THEM ALL**

Every UI pattern is just a configured instance of ProgressBar:

```typescript
// Micro-steps
<ProgressBar steps={microSteps} type="task" />

// Biological tabs
<ProgressBar steps={biologicalModes} type="navigation" />

// Energy selector
<ProgressBar steps={energyLevels} type="selector" />

// Streak
<ProgressBar steps={weekDays} type="streak" />

// Schedule
<ProgressBar steps={timeBlocks} type="schedule" />

// Pomodoro
<ProgressBar steps={pomodoroBlocks} type="timer" />

// All the same component, different data
```

### Benefits

**For Users**:
- Learn one pattern, understand everything
- Visual progress everywhere = dopamine everywhere
- Consistent mental model
- Reduced cognitive load

**For Developers**:
- One component to maintain
- Consistent behavior
- Easy to extend
- Type-safe

**For ADHD Brains**:
- Clear "where am I?" orientation
- Visual progress = motivation
- Active step highlighted = focus
- Minimized steps = not overwhelming
- Everything is a cycle = natural rhythm

---

## Part 6: Success Metrics

### Primary Metric

**Visual Progress Engagement**:
- % of users who interact with progress bars daily
- Target: 80%+ (vs baseline TBD)

### Feature-Specific

| Progress Bar Type | Metric | Target |
|------------------|--------|--------|
| Task micro-steps | Completion rate | 56% |
| Biological tabs | Daily cycle completion | 70% |
| Energy selector | Daily usage | 75% |
| Streak bars | 7-day maintenance | 40% |
| Daily schedule | Adherence rate | 60% |
| Focus sessions | Completion rate | 80% |

### User Feedback

Qualitative questions:
- "Does seeing progress bars everywhere help or overwhelm you?"
- "Which progress bar type is most useful?"
- "Do you understand where you are in each cycle?"

---

## Part 7: Technical Architecture

### Component Hierarchy

```
ProgressBar (base component)
  ├─ ProgressBarStep (single step)
  │   ├─ ReadinessBadge (conditional)
  │   ├─ XPPreview (conditional)
  │   ├─ CountdownTimer (conditional)
  │   ├─ EnergyMatchGlow (conditional)
  │   └─ SmartStartButton (conditional)
  │
  ├─ ProgressBarNested (children steps)
  └─ ProgressBarTimeline (wrapper with labels)
```

### Shared State

```typescript
// Global progress bar state (Zustand)
interface ProgressBarState {
  // User state
  currentEnergy: 1 | 2 | 3 | 4 | 5;
  currentBiologicalMode: 'capture' | 'scout' | 'hunter' | 'mender' | 'mapper';
  currentTimeBlock: string;  // e.g., "afternoon-work"

  // Active progress bars
  activeSteps: Map<string, string>;  // progressBarId → activeStepId

  // Progress data
  taskProgress: Map<string, number>;  // taskId → percent complete
  streakData: StreakData;
  xpProgress: XPProgress;

  // Actions
  setEnergy: (level: 1-5) => void;
  setActiveStep: (barId: string, stepId: string) => void;
  updateProgress: (taskId: string, percent: number) => void;
}
```

---

## The Bottom Line

**Everything is a progress bar.**

Not because we're lazy designers.

Because progress bars are the PERFECT UI pattern for:
- Showing where you are
- Showing where you're going
- Showing what's done
- Showing what's next
- Providing visual feedback
- Creating dopamine hits
- Reducing cognitive load
- Working with ADHD brains

**One pattern. Infinite applications. Maximum impact.**

---

**Start**: Perfect AsyncJobTimeline component
**Then**: Apply pattern everywhere
**Result**: The most visually coherent, ADHD-friendly task manager ever built

Let's nail the progress bar first. 🎯
