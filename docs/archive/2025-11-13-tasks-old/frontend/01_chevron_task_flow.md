# FE-01: ChevronTaskFlow Component (Week 1-2)

**Status**: 🟢 AVAILABLE
**Priority**: CRITICAL (Phase 1 core component)
**Dependencies**: AsyncJobTimeline (✅ exists), ChevronStep (✅ exists)
**Estimated Time**: 6-8 hours
**Approach**: Storybook-first development

---

## 📋 Overview

Full-screen modal for step-by-step task execution. Opens from TodayMode when user taps a task card. Displays all micro-steps as chevrons, tracks completion, awards XP, and triggers celebration on finish.

**ADHD Impact**: Visual progress journey reduces overwhelm, encourages completion

---

## 🎨 Component API

### File: `frontend/src/components/mobile/ChevronTaskFlow.tsx`

```typescript
interface ChevronTaskFlowProps {
  task: Task;
  onComplete: (completedSteps: number, xpEarned: number) => void;
  onDismiss: () => void;
  enableFocusTimer?: boolean;  // Week 9 feature
}

interface Task {
  task_id: string;
  title: string;
  description?: string;
  micro_steps: MicroStep[];
  estimated_minutes?: number;
  priority: 'low' | 'medium' | 'high';
  xp_preview?: number;
}

interface MicroStep {
  step_id: string;
  description: string;
  short_label?: string;
  estimated_minutes: number;
  leaf_type: 'DIGITAL' | 'HUMAN';
  icon?: string;
  status: 'pending' | 'active' | 'done' | 'error';
}
```

---

## 🎭 Storybook Stories

### File: `frontend/src/components/mobile/ChevronTaskFlow.stories.tsx`

Create these stories FIRST (before implementation):

```typescript
export default {
  title: 'Components/Mobile/ChevronTaskFlow',
  component: ChevronTaskFlow,
  parameters: {
    layout: 'fullscreen',  // Full-screen modal
  },
};

// Story 1: Default state (first step active)
export const Default: Story = {
  args: {
    task: {
      task_id: '123',
      title: 'Complete Homework Assignment',
      description: 'Finish math homework for class',
      priority: 'high',
      estimated_minutes: 60,
      xp_preview: 85,
      micro_steps: [
        {
          step_id: 's1',
          description: 'Research the topic and gather resources',
          short_label: 'Research',
          estimated_minutes: 15,
          leaf_type: 'DIGITAL',
          icon: '🔍',
          status: 'active'  // First step is active
        },
        {
          step_id: 's2',
          description: 'Write the first draft',
          short_label: 'Draft',
          estimated_minutes: 25,
          leaf_type: 'HUMAN',
          icon: '✍️',
          status: 'pending'
        },
        {
          step_id: 's3',
          description: 'Revise and edit your work',
          short_label: 'Revise',
          estimated_minutes: 15,
          leaf_type: 'HUMAN',
          icon: '📝',
          status: 'pending'
        },
        {
          step_id: 's4',
          description: 'Submit the assignment',
          short_label: 'Submit',
          estimated_minutes: 5,
          leaf_type: 'DIGITAL',
          icon: '📤',
          status: 'pending'
        }
      ]
    },
    onComplete: (steps, xp) => console.log(`Completed ${steps} steps, earned ${xp} XP`),
    onDismiss: () => console.log('Dismissed'),
  },
};

// Story 2: Halfway through (2 steps done)
export const HalfwayComplete: Story = {
  args: {
    task: {
      ...Default.args.task,
      micro_steps: [
        { ...Default.args.task.micro_steps[0], status: 'done' },
        { ...Default.args.task.micro_steps[1], status: 'done' },
        { ...Default.args.task.micro_steps[2], status: 'active' },
        { ...Default.args.task.micro_steps[3], status: 'pending' },
      ]
    },
  },
};

// Story 3: Final step (almost done)
export const FinalStep: Story = {
  args: {
    task: {
      ...Default.args.task,
      micro_steps: [
        { ...Default.args.task.micro_steps[0], status: 'done' },
        { ...Default.args.task.micro_steps[1], status: 'done' },
        { ...Default.args.task.micro_steps[2], status: 'done' },
        { ...Default.args.task.micro_steps[3], status: 'active' },
      ]
    },
  },
};

// Story 4: Single step task
export const SingleStep: Story = {
  args: {
    task: {
      task_id: '456',
      title: 'Quick Email Response',
      priority: 'medium',
      estimated_minutes: 5,
      xp_preview: 15,
      micro_steps: [
        {
          step_id: 's1',
          description: 'Write and send email',
          short_label: 'Send',
          estimated_minutes: 5,
          leaf_type: 'DIGITAL',
          icon: '📧',
          status: 'active'
        }
      ]
    },
  },
};

// Story 5: With focus timer (Week 9 feature preview)
export const WithFocusTimer: Story = {
  args: {
    ...Default.args,
    enableFocusTimer: true,
  },
};
```

---

## 🏗️ Component Structure

```
ChevronTaskFlow (full-screen modal)
├─ Header
│  ├─ Task title
│  ├─ Close button (X)
│  ├─ Progress bar (% complete)
│  └─ XP earned so far
├─ Main Content (scrollable)
│  ├─ AsyncJobTimeline (all steps as chevrons)
│  └─ Current Step Card
│     ├─ Step description
│     ├─ Metadata (time estimate, type, XP)
│     ├─ Focus Timer (optional, Week 9)
│     └─ "Complete This Step" button
└─ Footer
   └─ "Skip for Now" button
```

---

## 🎨 Design System Usage

```typescript
import { spacing, fontSize, borderRadius, semanticColors } from '@/lib/design-system';

// Colors
semanticColors.bg.primary        // #fdf6e3 (background)
semanticColors.accent.primary    // #268bd2 (active chevron)
semanticColors.accent.success    // #859900 (done chevron)
semanticColors.text.primary      // #073642 (text)

// Spacing
spacing[4]   // 16px padding
spacing[6]   // 24px margins

// Typography
fontSize.lg  // 18px for title
fontSize.base // 16px for body
fontSize.sm  // 14px for metadata
```

---

## 🔧 State Management

```typescript
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [steps, setSteps] = useState<JobStep[]>([]);
const [totalXpEarned, setTotalXpEarned] = useState(0);
const [isFocusMode, setIsFocusMode] = useState(false);
const [timerSeconds, setTimerSeconds] = useState(0);

// On step complete:
// 1. Mark current step as 'done'
// 2. Find next 'pending' step, mark as 'active'
// 3. Calculate XP for completed step
// 4. Call backend: POST /api/v1/micro-steps/{step_id}/complete
// 5. If no more steps → call onComplete()
```

---

## 🧮 XP Calculation

```typescript
const calculateStepXp = (step: JobStep): number => {
  const baseXp = 10;
  const priorityBonus = { high: 5, medium: 3, low: 1 }[task.priority] || 0;
  const timeBonus = Math.min(step.estimatedMinutes / 5, 10);
  return Math.round(baseXp + priorityBonus + timeBonus);
};

// Example: High priority, 20-minute step
// 10 (base) + 5 (high priority) + 4 (20/5) = 19 XP
```

---

## 🔗 Integration Points

### TodayMode Integration

**File**: `frontend/src/components/mobile/modes/TodayMode.tsx`

```typescript
// Add state
const [activeTaskFlow, setActiveTaskFlow] = useState<Task | null>(null);

// Update card tap handler
<SwipeableTaskCard
  task={currentTask}
  onTap={() => setActiveTaskFlow(currentTask)}
/>

// Add modal
{activeTaskFlow && (
  <ChevronTaskFlow
    task={activeTaskFlow}
    onComplete={(steps, xp) => {
      // Award XP, mark task complete
      setActiveTaskFlow(null);
    }}
    onDismiss={() => setActiveTaskFlow(null)}
  />
)}
```

---

## ✅ Acceptance Criteria

- [ ] Component file created
- [ ] All 5 Storybook stories work
- [ ] Renders full-screen modal
- [ ] Displays AsyncJobTimeline with all steps
- [ ] First step is "active" by default
- [ ] "Complete This Step" button works
- [ ] Next step becomes active after completion
- [ ] Progress bar updates in real-time
- [ ] XP calculation is correct
- [ ] Final step completion triggers `onComplete` callback
- [ ] "Skip for Now" button dismisses modal
- [ ] Integrates into TodayMode successfully
- [ ] Build passes: `cd frontend && pnpm build`

---

## 🧪 Testing in Storybook

```bash
cd frontend
pnpm storybook

# Navigate to: Components/Mobile/ChevronTaskFlow
# Test each story:
# 1. Default - Click "Complete This Step", verify chevron turns green
# 2. HalfwayComplete - Verify progress bar shows 50%
# 3. FinalStep - Click complete, verify onComplete fires
# 4. SingleStep - Verify single-step flow works
# 5. WithFocusTimer - Verify timer UI appears
```

---

## 📚 References

- [Phase 1 Specs](../../roadmap/PHASE_1_SPECS.md) - Full TypeScript spec (lines 15-367)
- [Integration Roadmap](../../roadmap/INTEGRATION_ROADMAP.md) - Week 1-2 deliverables
- [AsyncJobTimeline Component](../../../frontend/src/components/shared/AsyncJobTimeline.tsx) - Reuse this
- [ChevronStep Component](../../../frontend/src/components/mobile/ChevronStep.tsx) - Used by AsyncJobTimeline

---

## 🎯 Success Metrics

- **Task Start Rate**: 70%+ of tasks in Today mode get started (modal opens)
- **Step Completion**: 80%+ of started tasks complete at least 1 step
- **Full Completion**: 50%+ of started tasks complete all steps

---

**Next**: FE-06 CelebrationScreen depends on this component
