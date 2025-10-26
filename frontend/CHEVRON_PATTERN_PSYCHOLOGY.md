# Chevron Pattern Psychology - Design System North Star

**The Addictive Power of Visual Patterns for ADHD Productivity**

---

## Philosophy: Dark Patterns for Good

**Our Mission**: Use behavioral psychology and pattern recognition to create an "addictive" productivity system that trains ADHD brains to crave task completion.

### Why This Works for ADHD

1. **Pattern Recognition Dopamine**: ADHD brains are pattern-seeking machines. Consistent visual patterns trigger recognition → familiarity → comfort → dopamine.

2. **Progress Obsession**: Chevrons inherently communicate "forward movement" and "progress" - they're arrows pointing RIGHT. This taps into the ADHD need for visible progress.

3. **Completion Addiction**: When everything is a chevron progression, completing ANY task feels like "leveling up" in a game. The brain doesn't distinguish between "finished task" and "beat level" - both trigger reward.

4. **Visual Anchoring**: Repeated exposure to chevron = chevron becomes a "productivity symbol". Eventually, just SEEING a chevron triggers focus mode.

5. **Pathological Training**: Like Pavlov's dogs, we're conditioning users:
   - See chevron → task/progress
   - Complete chevron → dopamine hit
   - Crave dopamine → seek more chevrons
   - **Result**: Addicted to getting things done

---

## Core Design Principle: Everything is a Chevron

**Rule**: If it represents progress, state, navigation, or completion → it's a chevron.

### Chevron = Progress Symbol

By making EVERYTHING a chevron, we create:
- **Unified visual language** - No cognitive load switching between "tab mode" and "task mode"
- **Pattern reinforcement** - Every screen reinforces the same symbol = same reward
- **Gamification** - Life becomes a game of "fill the chevrons"

---

## Chevron Anatomy: The Psychology of Shape

### Why Arrow Shapes Create Addiction

```
Traditional UI:          Chevron UI:
[ Tab 1 ] [ Tab 2 ]     >── Tab 1 ──> >── Tab 2 ──>
                        ↑                ↑
                     Points forward    Feels like progress!
```

**Psychological Triggers**:
1. **Directionality**: Right-pointing = forward movement = progress
2. **Interlocking**: Chevrons fit together = completion creates satisfaction
3. **Flow**: Visual flow guides eye left-to-right = reading direction = natural
4. **Segments**: Each segment is a "micro-goal" = constant mini-rewards

### The 20° Angle Standard

**Why exactly 20°?**
- Sharp enough to feel "purposeful" and "directed"
- Not so steep it feels "aggressive" or "rushed"
- Creates perfect interlocking geometry
- Matches shipping/logistics UX patterns (familiar!)

**Consistency = Recognition**: Using the same 20° angle everywhere means the brain recognizes "this is a progress element" instantly.

---

## Pattern Library: Chevrons Everywhere

### 1. Navigation Tabs (Primary Use Case)

**Current State**: Round buttons with icons
**Chevron Version**: Interlocking chevron tabs

```tsx
// BEFORE: BiologicalTabs.tsx (rounded buttons)
<button className="rounded-lg bg-blue-500">
  <Icon /> Capture
</button>

// AFTER: Chevron tabs
<ChevronTab position="first" status="active">
  <Icon /> Capture
</ChevronTab>
<ChevronTab position="middle" status="done">
  <Icon /> Scout
</ChevronTab>
<ChevronTab position="last" status="pending">
  <Icon /> Hunt
</ChevronTab>
```

**Psychology**:
- Tabs now look like a "journey" across the bottom
- Active tab = current location on journey
- Completed tabs = places you've been (done state)
- Future tabs = where you're going (pending state)
- **Result**: Navigation becomes a progress bar

### 2. Task Cards

**Transform cards into horizontal chevron sequences**:

```tsx
// Task card with micro-steps as chevrons
<TaskCard>
  <ChevronProgress
    variant="compact"
    steps={[
      { label: 'Start', status: 'done', icon: '✓' },
      { label: 'Work', status: 'active', icon: '⚡' },
      { label: 'Done', status: 'pending', icon: '○' }
    ]}
  />
</TaskCard>
```

**Psychology**:
- Every task becomes a mini-game: "Fill all the chevrons"
- Visual satisfaction when last chevron turns green
- Pattern consistent with navigation = brain loves consistency

### 3. Progress Indicators

**All progress = chevrons** (you already have this!):

- `ChevronProgress.tsx` - Horizontal progress
- `ChevronProgressVertical` - Vertical (mobile)
- `AsyncJobTimeline` - Already using ChevronStep

**Psychology**:
- Progress isn't abstract (boring bar) - it's familiar chevrons!
- Same symbol = same dopamine pathway = stronger association

### 4. Category/Mode Headers

Transform mode headers into chevron sequences:

```tsx
// Mode progression: Capture → Scout → Hunt → Mend → Map
<ChevronProgress
  steps={modeSequence.map(mode => ({
    id: mode.id,
    label: mode.name,
    status: getCurrentStatus(mode),
    icon: mode.emoji
  }))}
/>
```

**Psychology**:
- User journey through modes becomes visible
- Encourages "completing the cycle" (all 5 modes)
- Creates narrative: "I'm on a journey through my day"

### 5. Achievement Badges

Badges with chevron progress bars:

```tsx
<AchievementBadge>
  <BadgeIcon />
  <ChevronProgress
    variant="compact"
    steps={milestones}
    showProgress={true}
  />
  <BadgeText>3/5 Complete</BadgeText>
</AchievementBadge>
```

**Psychology**:
- Even achievements use the same pattern
- Reinforces: "Chevron = progress = good feeling"

### 6. Onboarding Flow

First thing users see = chevron journey:

```tsx
<OnboardingTimeline>
  <ChevronProgress
    steps={[
      { label: 'Welcome', status: 'done' },
      { label: 'Setup', status: 'active' },
      { label: 'First Task', status: 'pending' },
      { label: 'Complete', status: 'pending' }
    ]}
  />
</OnboardingTimeline>
```

**Psychology**:
- First exposure to app = chevron pattern
- Immediate association: "This app = progress arrows"
- Sets expectation for entire UX

---

## Dopamine Architecture: Triggering Reward Loops

### The Completion Cascade

When a chevron changes from `pending` → `active` → `done`:

```tsx
// 1. Visual transition (smooth, satisfying)
transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'

// 2. Color change (gray → blue → green)
// Gradual build-up of color = anticipation
// Green = DOPAMINE HIT

// 3. Optional: Micro-celebration
{status === 'done' && (
  <Confetti count={3} duration={500} />
)}

// 4. Pulse animation on NEXT step
{isNextStep && (
  <animation: pulse-glow 2s ease-in-out infinite />
)}
```

**Psychology Breakdown**:
1. **Anticipation**: Blue active state builds tension
2. **Release**: Green done state = relief + reward
3. **Priming**: Next step pulses → brain ready for next dopamine hit
4. **Craving**: User seeks next completion

### Animation Timing (Critical!)

**DO NOT make animations too fast**:
- Too fast = brain doesn't register = no dopamine
- Too slow = frustration

**Optimal timing**:
```typescript
// Transition to 'done' state
transitionDuration: '400ms'  // Just slow enough to notice

// Celebration duration
celebrationDuration: '1000ms'  // 1 second of glory

// Pulse on next step
pulseDelay: '200ms'  // Start pulsing 200ms after completion
```

### Sound Design (Future Enhancement)

**Add subtle sound cues**:
- Pending → Active: Soft "activate" tone
- Active → Done: Satisfying "ding" or "pop"
- All steps done: Triumphant chord

**Psychology**:
- Multi-sensory = stronger memory encoding
- Sound + visual = dopamine multiplier
- Eventually, just the SOUND triggers productivity mode

---

## Step Visibility Psychology: Camera Angles for ADHD Minds

### The Core Question: Show All Steps or Just the Next One?

This is a deep design question that goes to the psychology of **motivation vs overwhelm**, especially in ADHD systems.

Let's visualize this as two camera angles:

---

### 🎥 **1. "The Overview Shot" — Showing All the Steps**

**Imagine** your camera is zoomed out: you see the whole staircase — 10 steps up to "Clean the room" or "Finish report."

It *feels structured* at first glance — you can see how it ends.

But for an ADHD brain, this can trigger:

* **Cognitive overload** → the brain starts simulating all future effort at once.
* **Reward diffusion** → the dopamine hit of progress is delayed until the very end.
* **Paralysis** → "Ugh, this is a mountain."

So showing *all* the steps is great for **planning mode**, but disastrous for **action mode**.

The camera angle is too wide — the brain stops moving.

---

### 🎥 **2. "The Action Shot" — Showing Only the Next Step**

Now the camera zooms in — tight shot, shallow depth of field.

You see *just the next tile*, glowing like a progress chevron.

You take that step, and only then does the next one reveal itself — almost like a *game level loading as you go.*

This creates:

* **Curiosity** ("What's next?" → dopamine drip)
* **Safety** (no overwhelm)
* **Momentum** (each action reloads motivation)
* **Flow alignment** (you're in *Now Mode*, not *Executive Mode*)

It's how games, quests, and even good UI tutorials hook you — reveal, reward, repeat.

---

### ⚖️ **Best of Both Worlds: Two Modes**

Design it like a camera toggle:

* **Map View (Zoomed Out)**: When planning, show all steps. Let the user drag, reorder, visualize the journey.
* **Focus View (Zoomed In)**: When doing, hide everything except the *next actionable tile*. Reveal each new step as a micro-reward.

This mimics how ADHD brains *naturally time-slice*: we don't see the whole future — we just need to trust there's a next breadcrumb.

---

### 🧠 **Behavioral Principle**

ADHD brains are "dopamine economy" machines — they thrive on **novelty + progress + reward**.

Revealing one step at a time gives the brain a **constant sense of discovery**, while showing all steps shifts focus to the **weight of completion**.

---

### 🎬 **Implementation Strategy**

```tsx
// Two visibility modes for ChevronProgress
<ChevronProgress
  steps={allSteps}
  viewMode="focus"  // Only show current + next step
  // OR
  viewMode="map"    // Show all steps for planning
  onViewModeToggle={(mode) => setViewMode(mode)}
/>
```

**Visual Design**:
- **Focus Mode**: Current step large and glowing, next step visible but dimmed, future steps hidden
- **Map Mode**: All steps visible, allowing drag-to-reorder, visual journey planning
- **Toggle Button**: Camera icon to switch between modes (📷 → 🗺️)

**Animation Strategy**:
- **Step Reveal**: When completing a step in Focus Mode, animate the next step sliding into view
- **Confetti Burst**: Micro-celebration for each completed step (not just at the end)
- **Glow Effect**: Next step pulses subtly to draw attention
- **Progress Tunnel**: Visual effect of "moving forward" through steps

---

### 🎮 **Game-Like Progression**

Think of it like a game level loading system:

1. **Current tile** = bright, active, full opacity
2. **Next tile** = visible, slightly dimmed, pulsing gently
3. **Future tiles** = hidden or extremely subtle (ghost outlines)
4. **Completed tiles** = checkmarked, subtle, receding into background

This creates a **"progression tunnel"** effect where you're always moving forward into revealed space, never overwhelmed by the entire journey ahead.

---

### 📊 **When to Use Each Mode**

| Scenario | Mode | Reasoning |
|----------|------|-----------|
| **Planning/Organizing** | Map View | Need to see full scope, reorder, understand dependencies |
| **Executing Tasks** | Focus View | Need to eliminate overwhelm, maintain momentum |
| **Review/Reflection** | Map View | See what was accomplished, understand patterns |
| **Onboarding** | Focus View | Don't overwhelm new users with complexity |
| **Complex Projects** | Toggle | Plan in Map, execute in Focus |

---

### 🎯 **Success Metrics**

Track these to validate the approach:

1. **Completion Rate**: Do users finish more tasks in Focus Mode?
2. **Time to First Action**: Do users start faster with Focus Mode?
3. **Mode Switching**: How often do users toggle between views?
4. **Session Duration**: Do users stay engaged longer with Focus Mode?
5. **Overwhelm Signals**: Do users abandon less in Focus Mode?

**Hypothesis**: Focus Mode will show 40% higher task completion and 60% faster initiation.

---

## Visual Consistency Rules

### Color States (Enforce Religiously)

**NEVER deviate from these colors**:

```typescript
const CHEVRON_STATES = {
  pending: {
    fill: colors.base2,      // Light cream (Solarized)
    stroke: colors.base01,   // Medium gray
    meaning: "Not started yet - calm, neutral"
  },
  active: {
    fill: colors.base2,      // Cream background
    stroke: colors.blue,     // Blue border
    pulse: 'rgba(38, 139, 210, 0.18)',  // Blue glow
    meaning: "Happening NOW - focus, attention"
  },
  done: {
    fill: colors.base02,     // Dark background
    stroke: colors.green,    // Green border
    meaning: "COMPLETE - reward, success"
  },
  error: {
    fill: colors.red,
    stroke: colors.red,
    meaning: "Failed - requires action"
  }
}
```

**Why consistency matters**:
- Brain learns: Gray = not started, Blue = active, Green = done
- After 3-5 repetitions, this becomes AUTOMATIC
- Automatic recognition = faster dopamine response
- Faster dopamine = stronger habit formation

### Size Variants (Use Contextually)

```typescript
export const CHEVRON_SIZES = {
  nano: {
    height: 32,
    use: "Nested timelines, mobile compact view",
    psychology: "Small = quick task, low pressure"
  },
  micro: {
    height: 40,
    use: "Task cards, secondary progress",
    psychology: "Medium = normal task, achievable"
  },
  full: {
    height: 64,
    use: "Main navigation, primary actions",
    psychology: "Large = important, your main focus"
  }
}
```

**Sizing Psychology**:
- Larger chevron = brain perceives as "more important"
- Use this to guide attention and prioritization
- Main tabs should be FULL size = signals "this is your primary interface"

---

## Implementation Roadmap: Converting Existing Components

### Phase 1: Navigation (HIGHEST IMPACT)

**Priority 1**: Convert `SimpleTabs.tsx` to chevrons

**Current State**:
```tsx
// SimpleTabs.tsx - Rounded buttons at bottom
<button className="rounded-lg">
  <Icon /> Inbox
</button>
```

**Chevron Version**:
```tsx
// ChevronTabs.tsx
<div className="flex gap-0">
  <ChevronTab position="first" status={getTabStatus('inbox')}>
    <Icon /> Inbox
  </ChevronTab>
  <ChevronTab position="middle" status={getTabStatus('today')}>
    <Icon /> Today
  </ChevronTab>
  <ChevronTab position="last" status={getTabStatus('progress')}>
    <Icon /> Progress
  </ChevronTab>
</div>
```

**Impact**:
- IMMEDIATE pattern recognition training
- Bottom tabs = most frequently seen UI element
- Users will see chevrons 50-100 times per day
- Within 1 week: "chevron = my productivity interface"

**Implementation**:
1. Create `ChevronTabs.tsx` component
2. Add status logic (active tab = active, others = pending/done)
3. Add smooth transitions between tabs
4. Add subtle pulse on active tab
5. Replace `SimpleTabs` with `ChevronTabs` in mobile layout

---

### Phase 2: Task Cards

**Priority 2**: Make all task cards show chevron progress

**Current State**: Task cards with progress bars
**Chevron Version**: Task cards with chevron micro-steps

```tsx
<TaskCard>
  <TaskTitle>{task.name}</TaskTitle>

  {/* Add chevron progress to every task */}
  <ChevronProgress
    variant="compact"
    steps={task.microSteps.map(step => ({
      id: step.id,
      label: step.shortLabel,
      status: step.status,
      icon: step.icon
    }))}
    showProgress={false}  // Chevrons ARE the progress
  />

  <TaskMeta>{task.estimatedTime}</TaskMeta>
</TaskCard>
```

**Impact**:
- Every task becomes a "chevron game"
- Seeing incomplete chevrons triggers action
- Completing chevrons triggers satisfaction

---

### Phase 3: Category Headers

**Priority 3**: Mode headers show journey position

```tsx
// At top of each mode page
<ModeHeader>
  <ChevronProgress
    variant="default"
    steps={[
      { id: 'capture', label: 'Capture', status: 'done', icon: '📸' },
      { id: 'scout', label: 'Scout', status: 'done', icon: '🔍' },
      { id: 'hunt', label: 'Hunt', status: 'active', icon: '🎯' },  // Current mode
      { id: 'mend', label: 'Mend', status: 'pending', icon: '💙' },
      { id: 'map', label: 'Map', status: 'pending', icon: '🗺️' }
    ]}
  />
</ModeHeader>
```

**Impact**:
- Contextualizes current mode within larger workflow
- Encourages "completing the cycle" through all modes
- Narrative structure: "I'm on step 3 of my journey"

---

### Phase 4: Onboarding & Achievements

**Priority 4**: First-time user experience

```tsx
// Onboarding.tsx
<OnboardingFlow>
  <ChevronProgress
    steps={onboardingSteps}
    variant="default"
    showProgress={true}
  />
  <OnboardingContent>{currentStep.content}</OnboardingContent>
</OnboardingFlow>

// Achievements.tsx
<AchievementCard>
  <AchievementIcon />
  <ChevronProgress
    variant="compact"
    steps={achievementMilestones}
  />
</AchievementCard>
```

**Impact**:
- First interaction = chevron pattern
- Immediate training begins
- Even badges use chevrons = consistency

---

## Advanced: Chevron Variations for Different Contexts

### 1. Nested Timelines (Already Implemented!)

You already have this in `AsyncJobTimeline.tsx`:
- Parent task: Full size chevrons
- Child tasks: Micro size chevrons (nested)
- Recursive depth shown through size reduction

**Psychology**: Visual hierarchy through size = easy cognitive parsing

### 2. Vertical Chevrons (Mobile Portrait)

`ChevronProgressVertical` - for narrow screens:
- Stacked vertically with connection lines
- Same colors, same states
- Different orientation, same meaning

**Psychology**: Pattern works in ANY direction = flexible mental model

### 3. Circular Chevrons (Future: Energy Gauge)

```tsx
// Imagine: EnergyGauge with circular chevron segments
<CircularChevronProgress
  segments={[
    { angle: 90, status: 'done', label: 'Morning' },
    { angle: 90, status: 'active', label: 'Afternoon' },
    { angle: 180, status: 'pending', label: 'Evening' }
  ]}
/>
```

**Psychology**: Even time-of-day uses chevrons = pattern everywhere

---

## Measuring Success: Dopamine Metrics

### User Behavior Signals

**Track these to measure "addiction level"**:

1. **Chevron Interaction Rate**
   - How often users click chevron elements
   - Target: 80%+ of navigation happens via chevrons

2. **Completion Obsession**
   - Do users finish chevron sequences more than linear lists?
   - Target: 40% higher completion rate vs. traditional UI

3. **Return Frequency**
   - Are users checking the app more often?
   - Target: 3x daily vs. 1x daily (healthy addiction!)

4. **Task Breakdown Adoption**
   - Do users break tasks into micro-steps more often?
   - Target: 60%+ of tasks have micro-steps (chevrons!)

5. **Mode Cycling**
   - Do users move through all 5 modes in sequence?
   - Target: 70%+ complete the cycle daily

### A/B Test Ideas

**Test chevron UI vs. traditional UI**:
- Group A: Chevron tabs, chevron progress
- Group B: Round tabs, progress bars
- Measure: Task completion rate, session length, return frequency

**Hypothesis**: Chevron group will show:
- 25% higher task completion
- 40% longer session time
- 60% more daily returns

---

## Ethical Considerations

### Are We Manipulating Users?

**YES - But for their benefit!**

**Traditional "dark patterns"**:
- Make you scroll endlessly → steal your time
- Trigger FOMO → make you buy things
- Create anxiety → keep you engaged

**Our "bright patterns"**:
- Make you complete tasks → give you accomplishment
- Trigger satisfaction → make you productive
- Create focus → help you achieve goals

### The "Addictive Productivity" Manifesto

We're creating addiction to:
- ✅ Getting things done
- ✅ Making progress
- ✅ Building skills
- ✅ Achieving goals

NOT addiction to:
- ❌ Scrolling feeds
- ❌ Checking notifications
- ❌ Consuming content
- ❌ Spending money

**Result**: Users become "pathologically productive" - and that's the whole point.

---

## Quick Reference: Chevron Component API

### ChevronStep (Individual segment)

```tsx
<ChevronStep
  status="active" | "done" | "pending" | "error"
  position="first" | "middle" | "last" | "single"
  size="full" | "micro" | "nano"
  onClick={() => void}
  onHover={(isHovered: boolean) => void}
>
  {children}
</ChevronStep>
```

### ChevronProgress (Sequence)

```tsx
<ChevronProgress
  steps={[
    { id: '1', label: 'Step 1', status: 'done', icon: '✓' },
    { id: '2', label: 'Step 2', status: 'active', icon: '⚡' },
    { id: '3', label: 'Step 3', status: 'pending', icon: '○' }
  ]}
  variant="default" | "compact"
  showProgress={true}
  className=""
/>
```

### AsyncJobTimeline (Already implemented!)

```tsx
<AsyncJobTimeline
  jobName="Task name"
  steps={microSteps}
  currentProgress={45}
  size="full" | "micro" | "nano"
  onStepClick={(stepId) => void}
/>
```

---

## Next Steps: Building the Chevron Empire

### Week 1: Navigation Takeover
- [ ] Create `ChevronTabs.tsx` component
- [ ] Replace `SimpleTabs` with `ChevronTabs`
- [ ] Add smooth transition animations
- [ ] Ship to production

### Week 2: Task Card Revolution
- [ ] Add `ChevronProgress` to all task cards
- [ ] Make micro-steps visible as chevrons
- [ ] Add completion animations
- [ ] Measure completion rate increase

### Week 3: Step Visibility Modes (NEW - HIGH PRIORITY)
- [ ] Implement Focus View mode (show only current + next step)
- [ ] Implement Map View mode (show all steps for planning)
- [ ] Add camera toggle button to switch between modes
- [ ] Create "progression tunnel" animation for Focus Mode
- [ ] Add step reveal animations when completing in Focus Mode
- [ ] Implement ghost outlines for hidden future steps
- [ ] Add micro-confetti for each step completion (not just at end)
- [ ] Test with ADHD users for completion rate improvement

### Week 4: System-Wide Consistency
- [ ] Convert mode headers to chevrons
- [ ] Update onboarding flow to use Focus Mode by default
- [ ] Add chevrons to achievement cards
- [ ] Document patterns in Storybook

### Week 5: Optimization & Metrics
- [ ] A/B test chevron vs. traditional UI
- [ ] A/B test Focus Mode vs. Map Mode default
- [ ] Track completion rates, time to first action, mode switching
- [ ] Tune animation timing based on data
- [ ] Add sound effects (optional)
- [ ] Measure dopamine metrics

---

## Conclusion: The Chevron is The Product

**Final Philosophy**:

The chevron isn't just a design pattern.
The chevron IS the product.

By making everything a chevron:
- We create a unified visual language
- We trigger pattern recognition
- We associate progress with a single shape
- We make productivity feel like a game
- We train ADHD brains to crave completion

**The endgame**: When users see a chevron ANYWHERE (even outside our app), they think "progress" and feel a tiny dopamine nudge.

That's when we've won.

---

**Last Updated**: 2025-10-25
**Version**: 1.0.0
**Status**: North Star Document - Reference for all UI decisions

**Remember**: If it shows progress, state, or navigation → make it a chevron.
