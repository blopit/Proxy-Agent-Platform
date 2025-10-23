# 📊 Micro-Step Progress Bar Design

## 🎯 Core Concept

The progress bar shows **actual micro-step descriptions** as sections, not generic labels:
- Each section = 1 micro-step from task decomposition
- **HUMAN tasks**: 2-5 minute chunks (proportional width)
- **DIGITAL tasks**: Unlimited duration (flexible width, typically longer)
- Auto-expand current step, manual toggle for inspection

---

## 🎨 Visual Examples

### Example 1: "Buy groceries tomorrow"

After decomposition, micro-steps are:
1. Check pantry for needed items (HUMAN, 3 min)
2. Make shopping list (HUMAN, 2 min)
3. Check store hours (DIGITAL, auto)
4. Drive to store (HUMAN, 10 min)
5. Shop for items (HUMAN, 20 min)

#### Progress Bar Visual (All Collapsed)
```
┌────────────────────────────────────────────────────────────────────┐
│ Buy groceries tomorrow                                          [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌─────┬────┬──┬──────┬────────────────────────────────────┐      │
│ │Check│List│🤖│Drive │Shop for items                      │      │
│ │panty│    │Hr│      │                                    │      │
│ └─────┴────┴──┴──────┴────────────────────────────────────┘      │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
│ │ 3m │ 2m │auto│10m  │◄────────── 20m ──────────►│              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Proportions:
- Check pantry: 3min = ~8%
- Make list: 2min = ~5%
- Check hours: digital = ~2% (fast)
- Drive: 10min = ~28%
- Shop: 20min = ~55%
```

#### Progress Bar Visual (Step 1 Active - Auto-Expanded)
```
┌────────────────────────────────────────────────────────────────────┐
│ Buy groceries tomorrow                                          [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓──┬──┬────┬─────────────    │
│ ┃ 👤 Check pantry for needed items ┃  │🤖│    │                 │
│ ┃ Look in fridge and cabinets      ┃Ls│Hr│Drv │Shop             │
│ ┃ 3 minutes • HUMAN                 ┃  │  │    │                 │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛──┴──┴────┴─────────────    │
│ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░      │
│ │◄──────────── 50% ──────────►│                                   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Progress Bar Visual (Step 4 Active - Auto-Expanded)
```
┌────────────────────────────────────────────────────────────────────┐
│ Buy groceries tomorrow                                          [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ✓──✓──✓─┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓──────────────────    │
│         ┃ 👤 Drive to store              ┃                       │
│ Chk Lst Hr┃ Head to nearest grocery store ┃Shop for items        │
│         ┃ 10 minutes • HUMAN             ┃                       │
│         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛──────────────────    │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        │
│                │◄────── 50% ──────►│                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

### Example 2: "Send email to Sara about project"

Micro-steps:
1. Find Sara's email address (HUMAN, 3 min)
2. Draft email message (HUMAN, 5 min)
3. Attach project files (HUMAN, 2 min)
4. Review for accuracy (HUMAN, 2 min)
5. Send email via AI agent (DIGITAL, auto)

#### Progress Bar Visual (All Collapsed)
```
┌────────────────────────────────────────────────────────────────────┐
│ Send email to Sara about project                               [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌──────────┬───────────────────┬────────┬────────┬───┐           │
│ │Find email│Draft email message│Attach  │Review  │🤖 │           │
│ │          │                   │files   │        │Snd│           │
│ └──────────┴───────────────────┴────────┴────────┴───┘           │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│ │◄─ 3m ──►│◄───── 5m ───────►│◄─2m──►│◄─2m──►│auto│            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Proportions:
- Find email: 3min = ~25%
- Draft: 5min = ~42%
- Attach: 2min = ~17%
- Review: 2min = ~17%
- Send: digital = ~2% (instant)
```

#### Progress Bar Visual (Step 2 Active - Auto-Expanded)
```
┌────────────────────────────────────────────────────────────────────┐
│ Send email to Sara about project                               [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ✓────┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓──┬────┬───       │
│      ┃ 👤 Draft email message                ┃  │    │           │
│ Find ┃ Write clear, professional email       ┃At│Rev │🤖         │
│      ┃ about project status and next steps   ┃  │    │           │
│      ┃ 5 minutes • HUMAN                      ┃  │    │           │
│      ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛──┴────┴───       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│      │◄──────────── 50% ────────────►│                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Progress Bar Visual (Step 5 Active - DIGITAL)
```
┌────────────────────────────────────────────────────────────────────┐
│ Send email to Sara about project                               [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ✓────────✓──────────────────────✓─────✓────┏━━━━━━━━━━━━━━━━━┓  │
│                                             ┃ 🤖 Send email     ┃  │
│ Find  Draft email              Attach Review┃ Agent sending...  ┃  │
│                                             ┃ DIGITAL • auto    ┃  │
│                                             ┗━━━━━━━━━━━━━━━━━┛  │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░                  │
│                                             │◄──── 50% ────►│      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

### Example 3: "Schedule team meeting next week"

Micro-steps:
1. Check team availability via AI (DIGITAL, auto)
2. Find meeting room (HUMAN, 2 min)
3. Create calendar invite via AI (DIGITAL, auto)
4. Send invite to attendees via AI (DIGITAL, auto)
5. Confirm room booking (HUMAN, 3 min)

#### Progress Bar Visual (All Collapsed)
```
┌────────────────────────────────────────────────────────────────────┐
│ Schedule team meeting next week                                [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌───┬──────────────┬───┬───┬──────────────────┐                  │
│ │🤖 │Find meeting  │🤖 │🤖 │Confirm room      │                  │
│ │Chk│room          │Crt│Snd│booking           │                  │
│ └───┴──────────────┴───┴───┴──────────────────┘                  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                    │
│ │ a │◄── 2m ─────►│ a │ a │◄──── 3m ──────►│                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Note: DIGITAL tasks take minimal space when collapsed
```

#### Progress Bar Visual (Step 1 Active - DIGITAL)
```
┌────────────────────────────────────────────────────────────────────┐
│ Schedule team meeting next week                                [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓──┬──┬──┬─────────    │
│ ┃ 🤖 Check team availability              ┃  │🤖│🤖│             │
│ ┃ AI agent scanning calendars...          ┃Fnd│Cr│Sn│Confirm      │
│ ┃ DIGITAL • automating                    ┃  │  │  │             │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛──┴──┴──┴─────────    │
│ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│ │◄──────────── 50% ────────────►│                                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Proportional Width Rules

### HUMAN Tasks (2-5 minute chunks)
```
Width = (stepDuration / totalHumanDuration) * humanPortionOfBar

Example:
Total human time: 12 minutes (3min + 5min + 2min + 2min)
Human gets: ~85% of bar (leaving ~15% for digital tasks)

Step 1 (3min): (3/12) * 85% = 21.25%
Step 2 (5min): (5/12) * 85% = 35.42%
Step 3 (2min): (2/12) * 85% = 14.17%
Step 4 (2min): (2/12) * 85% = 14.17%
```

### DIGITAL Tasks (unlimited/auto)
```
Width = minimalFixedWidth or proportional to complexity

Option A: Fixed minimal width (5% per digital task)
Option B: Estimated based on API call time (e.g., 500ms = 2%, 2s = 5%)

When collapsed: ~2-5% of bar
When expanded: 50% (same as any step)
```

### Mixed Task Calculation
```typescript
function calculateProportions(steps: MicroStep[]) {
  const humanSteps = steps.filter(s => s.leaf_type === 'HUMAN');
  const digitalSteps = steps.filter(s => s.leaf_type === 'DIGITAL');

  const totalHumanTime = humanSteps.reduce((sum, s) => sum + s.estimated_minutes, 0);
  const digitalCount = digitalSteps.length;

  // Reserve space for digital tasks (5% each, max 20% total)
  const digitalSpace = Math.min(digitalCount * 5, 20);
  const humanSpace = 100 - digitalSpace;

  return steps.map(step => {
    if (step.leaf_type === 'DIGITAL') {
      return {
        ...step,
        collapsedWidth: digitalSpace / digitalCount,
      };
    } else {
      return {
        ...step,
        collapsedWidth: (step.estimated_minutes / totalHumanTime) * humanSpace,
      };
    }
  });
}
```

---

## 🎨 Section Content

### When Collapsed (Inactive)
```
┌─────────────────┐
│ Draft email msg │  ← Truncated label
└─────────────────┘
```

### When Expanded (Active or Manual Click)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 👤 Draft email message        ┃  ← Full label with emoji
┃ Write clear, professional     ┃  ← Detail/instruction
┃ email about project status    ┃
┃ 5 minutes • HUMAN              ┃  ← Duration + type
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### When Completed
```
✓────────────────
Draft email msg    ← Shows checkmark, collapsed
```

---

## 🧩 Data Structure

### MicroStep Interface (Enhanced)
```typescript
interface MicroStep {
  step_id: string;
  description: string;              // Full description (e.g., "Draft email message")
  shortLabel?: string;              // Short label for collapsed state (e.g., "Draft")
  detail?: string;                  // Extra detail when expanded
  estimated_minutes: number;        // For HUMAN: 2-5 min, for DIGITAL: 0 (auto)
  leaf_type: 'DIGITAL' | 'HUMAN';
  icon?: string;                    // Emoji icon
  status: 'pending' | 'active' | 'done' | 'error';

  // Calculated
  collapsedWidth: number;           // % of bar when collapsed
  expandedWidth: 50;                // Always 50% when expanded
}
```

### Example Data
```typescript
const microSteps: MicroStep[] = [
  {
    step_id: 'step1',
    description: 'Check pantry for needed items',
    shortLabel: 'Check pantry',
    detail: 'Look in fridge and cabinets for what you need',
    estimated_minutes: 3,
    leaf_type: 'HUMAN',
    icon: '👤',
    status: 'pending',
    collapsedWidth: 8.6,
  },
  {
    step_id: 'step2',
    description: 'Make shopping list',
    shortLabel: 'Make list',
    detail: 'Write down all items needed',
    estimated_minutes: 2,
    leaf_type: 'HUMAN',
    icon: '👤',
    status: 'pending',
    collapsedWidth: 5.7,
  },
  {
    step_id: 'step3',
    description: 'Check store hours',
    shortLabel: 'Hours',
    detail: 'AI checking store hours...',
    estimated_minutes: 0, // Digital task
    leaf_type: 'DIGITAL',
    icon: '🤖',
    status: 'pending',
    collapsedWidth: 2.0,
  },
  {
    step_id: 'step4',
    description: 'Drive to store',
    shortLabel: 'Drive',
    detail: 'Head to nearest grocery store',
    estimated_minutes: 10,
    leaf_type: 'HUMAN',
    icon: '👤',
    status: 'pending',
    collapsedWidth: 28.6,
  },
  {
    step_id: 'step5',
    description: 'Shop for items',
    shortLabel: 'Shop',
    detail: 'Get all items on your list',
    estimated_minutes: 20,
    leaf_type: 'HUMAN',
    icon: '👤',
    status: 'pending',
    collapsedWidth: 57.1,
  },
];
```

---

## 🎬 Real-World Example: Task Execution Flow

### Task: "Prepare Q4 presentation"

Micro-steps:
1. 🤖 AI research Q4 metrics (DIGITAL, auto)
2. 👤 Review AI findings (HUMAN, 5 min)
3. 👤 Create slide outline (HUMAN, 10 min)
4. 🤖 AI generates draft slides (DIGITAL, auto)
5. 👤 Customize and polish slides (HUMAN, 20 min)
6. 👤 Practice presentation (HUMAN, 15 min)
7. 🤖 AI schedules presentation time (DIGITAL, auto)

#### Timeline: All Collapsed
```
┌────────────────────────────────────────────────────────────────────┐
│ Prepare Q4 presentation                                        [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌──┬─────┬──────────┬──┬──────────────┬─────────────┬──┐         │
│ │🤖│Rev│Create     │🤖│Customize    │Practice     │🤖│         │
│ │Rs│   │outline    │Dr│slides       │             │Sc│         │
│ └──┴─────┴──────────┴──┴──────────────┴─────────────┴──┘         │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│ │a │ 5m │◄─ 10m ──►│a │◄─── 20m ───►│◄── 15m ───►│a │         │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

#### Timeline: Step 3 Active (Create outline)
```
┌────────────────────────────────────────────────────────────────────┐
│ Prepare Q4 presentation                                        [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ✓──✓──┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓──┬────┬────┬──        │
│       ┃ 👤 Create slide outline          ┃  │    │    │          │
│ Rs Rev┃ Structure your presentation:     ┃Dr│Cust│Prc │Sc        │
│       ┃ intro, metrics, insights, next   ┃  │    │    │          │
│       ┃ 10 minutes • HUMAN                ┃  │    │    │          │
│       ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛──┴────┴────┴──        │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│       │◄──────── 50% ────────►│                                   │
│                                                                    │
│ Progress: 35% • ~30 minutes remaining                              │
└────────────────────────────────────────────────────────────────────┘
```

#### Timeline: Step 4 Active (AI generating)
```
┌────────────────────────────────────────────────────────────────────┐
│ Prepare Q4 presentation                                        [×]│
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ✓──✓─────✓──────────┏━━━━━━━━━━━━━━━━━━━━━━━━━┓──────┬────┬──   │
│                     ┃ 🤖 AI generates draft    ┃      │    │     │
│ Rs Rev  Create      ┃ Creating slides from     ┃Custmz│Prc │Sc   │
│         outline     ┃ your outline...          ┃      │    │     │
│                     ┃ DIGITAL • automating     ┃      │    │     │
│                     ┗━━━━━━━━━━━━━━━━━━━━━━━━━┛──────┴────┴──   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░              │
│                     │◄────── 50% ──────►│                         │
│                                                                    │
│ Progress: 50% • AI working... ~20 minutes remaining                │
└────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Design Decisions

### 1. **Show Actual Descriptions**
✅ Users see real task steps: "Draft email message"
❌ Not generic labels: "Step 2"

### 2. **HUMAN = Fixed Time (2-5 min)**
✅ Each human micro-step is 2-5 minutes max
✅ Takes proportional space based on duration
✅ Clear time commitment

### 3. **DIGITAL = Flexible/Unlimited**
✅ Digital tasks can be instant or take longer
✅ Takes minimal space when collapsed (~2-5%)
✅ Still expands to 50% when active to show what's happening

### 4. **Truncation for Long Labels**
When collapsed:
- Show first ~15 characters + "..."
- Or use `shortLabel` if provided
- Full text appears on expand

### 5. **Mobile-First Text Sizing**
```css
Collapsed:
  font-size: 9px
  max-lines: 2

Expanded:
  font-size: 11px (label)
  font-size: 9px (detail)
  max-lines: 3 (detail)
```

---

## 🚀 Component Props (Updated)

```typescript
<AsyncJobTimeline
  jobName="Buy groceries tomorrow"
  steps={[
    {
      id: 'step1',
      description: 'Check pantry for needed items',
      shortLabel: 'Check pantry',
      detail: 'Look in fridge and cabinets',
      estimatedMinutes: 3,
      leafType: 'HUMAN',
      icon: '👤',
      status: 'active',
    },
    {
      id: 'step2',
      description: 'Make shopping list',
      shortLabel: 'Make list',
      detail: 'Write down all items',
      estimatedMinutes: 2,
      leafType: 'HUMAN',
      icon: '👤',
      status: 'pending',
    },
    {
      id: 'step3',
      description: 'Check store hours',
      shortLabel: 'Hours',
      detail: 'AI checking hours...',
      estimatedMinutes: 0, // Digital = auto
      leafType: 'DIGITAL',
      icon: '🤖',
      status: 'pending',
    },
    // ... more steps
  ]}
  currentProgress={25}
  expandedStepId="step1"
  onStepClick={(id) => handleToggleExpand(id)}
/>
```

---

## 🧪 Edge Cases

### Case 1: Very Long Description
```
Description: "Review and edit the comprehensive project documentation including all technical specifications and user requirements"

Collapsed: "Review and edit the comp..."
Expanded: Full text with line wrapping (max 3 lines)
```

### Case 2: All DIGITAL Tasks
```
If all steps are DIGITAL:
  - Each gets equal space when collapsed
  - Progress bar sweeps quickly
  - User sees AI working through each step

Example: "Automate email campaign"
  1. 🤖 Fetch contact list
  2. 🤖 Generate email content
  3. 🤖 Personalize messages
  4. 🤖 Send to recipients
  5. 🤖 Track open rates
```

### Case 3: Single Step Task
```
If only 1 step:
  - Takes 100% of bar width
  - Always expanded (no collapse state)
  - Progress bar shows internal step progress if available
```

### Case 4: Step With Unknown Duration
```
If estimated_minutes = 0 and leaf_type = 'HUMAN':
  - Treat as 5 minutes (max of range)
  - Show "~5 min" in UI
  - Can adjust as user works
```

---

## ✅ Implementation Checklist

- [ ] Update `MicroStep` interface to include `shortLabel` and `detail`
- [ ] Implement proportional width calculation (human vs digital)
- [ ] Handle text truncation for collapsed state
- [ ] Support unlimited duration for DIGITAL tasks
- [ ] Add hover states to show full text on collapsed sections
- [ ] Test with various task types (all human, all digital, mixed)
- [ ] Ensure mobile-friendly text sizes
- [ ] Add accessibility labels (screen readers)

---

**Last Updated**: 2025-10-23
**Version**: 3.0 (Micro-Step Descriptions)
**Status**: Ready to Implement 🚀
