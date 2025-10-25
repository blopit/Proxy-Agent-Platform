# Frontend Patterns & Best Practices

This guide documents common patterns and best practices for the Mobile ADHD Task Management System. Follow these patterns to maintain consistency and leverage ADHD-optimized design principles.

---

## Table of Contents

1. [ADHD-Optimized UI Patterns](#adhd-optimized-ui-patterns)
2. [Design System Usage](#design-system-usage)
3. [Async Job Decomposition Patterns](#async-job-decomposition-patterns)
4. [Mobile Gesture Patterns](#mobile-gesture-patterns)
5. [Component Composition Patterns](#component-composition-patterns)
6. [State Management Patterns](#state-management-patterns)
7. [API Integration Patterns](#api-integration-patterns)

---

## ADHD-Optimized UI Patterns

### 1. One-Task-at-a-Time Focus

**Pattern**: Present a single task in full-screen view to reduce overwhelm and decision fatigue.

```tsx
// ✅ GOOD: Full-screen single task card
<SwipeableTaskCard
  task={currentTask}
  onComplete={handleComplete}
  onSkip={handleSkip}
/>

// ❌ AVOID: Multiple task cards visible at once
<div className="grid grid-cols-2">
  {tasks.map(task => <TaskCard key={task.id} task={task} />)}
</div>
```

**Used in**: `HunterMode.tsx`, `SwipeableTaskCard.tsx`

### 2. Dopamine-Optimized Feedback

**Pattern**: Provide immediate, visually rewarding feedback for every action.

```tsx
// ✅ GOOD: Celebration animation + sound + vibration
const handleTaskComplete = async () => {
  // Visual feedback
  await playAnimation('confetti');

  // Haptic feedback (mobile)
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 30, 50]);
  }

  // Update state
  updateXP(task.estimated_minutes * 10);
  incrementStreak();

  // Show achievement if applicable
  checkForNewAchievement();
};

// ❌ AVOID: Silent completion without feedback
const handleTaskComplete = () => {
  setCompleted(true);
};
```

**Used in**: `RewardCelebration.tsx`, `HunterMode.tsx`, `MapperMode.tsx`

### 3. Mystery Rewards (Unpredictable Dopamine)

**Pattern**: 15% chance of bonus task or reward creates excitement and reduces task-selection paralysis.

```tsx
// ✅ GOOD: Random bonus injection
const getNextTask = () => {
  // 15% chance of mystery task
  if (Math.random() < 0.15) {
    return selectRandomTask(allTasks);
  }

  // Normal priority-based selection
  return selectHighestPriorityTask();
};

// Mystery reward every 3 completed sessions
if (completedSessionCount % 3 === 0) {
  showMysteryBoxReward();
}
```

**Used in**: `ScoutMode.tsx`, `MenderMode.tsx`

### 4. Energy-Aware Task Suggestions

**Pattern**: Suggest tasks based on user's current energy level and time of day.

```tsx
// ✅ GOOD: Energy-aware filtering
const getSuggestedTasks = (energyLevel: number, timeOfDay: 'morning' | 'afternoon' | 'evening') => {
  if (energyLevel < 30) {
    // Low energy: quick wins only
    return tasks.filter(t => t.estimated_minutes <= 5);
  }

  if (timeOfDay === 'morning' && energyLevel > 70) {
    // High morning energy: tackle hard tasks
    return tasks.filter(t => t.priority === 'high' && t.estimated_minutes > 15);
  }

  // Default: balanced mix
  return tasks.filter(t => t.estimated_minutes <= 15);
};
```

**Used in**: `MenderMode.tsx`, `ScoutMode.tsx`

### 5. Micro-Step Decomposition

**Pattern**: Break tasks into 2-5 minute atomic chunks to overcome executive dysfunction.

```tsx
// ✅ GOOD: Task with micro-steps
interface Task {
  id: string;
  title: string;
  micro_steps: MicroStep[];
  total_minutes: number;
}

interface MicroStep {
  step_id: string;
  description: string;
  estimated_minutes: number; // 2-5 minutes
  leaf_type: 'HUMAN' | 'DIGITAL';
}

// Decomposition API call
const breakdownTask = async (taskTitle: string) => {
  const response = await fetch('/api/v1/mobile/quick-capture', {
    method: 'POST',
    body: JSON.stringify({ input: taskTitle, auto_mode: true }),
  });

  const { task, micro_steps } = await response.json();
  return { task, micro_steps };
};
```

**Used in**: `CaptureMode.tsx`, `AsyncJobTimeline.tsx`, `MicroStepsBreakdown.tsx`

---

## Design System Usage

### 1. Always Use Design Tokens

**Pattern**: Reference `design-system.ts` for all styling values.

```tsx
import { spacing, fontSize, borderRadius, semanticColors, iconSize } from '@/lib/design-system';

// ✅ GOOD: Design tokens
<div style={{
  padding: spacing[4],
  fontSize: fontSize.base,
  borderRadius: borderRadius.lg,
  backgroundColor: semanticColors.bg.primary,
  color: semanticColors.text.primary,
}} />

// ❌ AVOID: Hardcoded values
<div style={{
  padding: '16px',
  fontSize: '16px',
  borderRadius: '12px',
  backgroundColor: '#002b36',
  color: '#839496',
}} />
```

### 2. Solarized Color Palette

**Pattern**: Use Solarized colors for ADHD-friendly contrast and reduced eye strain.

```tsx
// Available color tokens
semanticColors = {
  bg: {
    primary: '#002b36',    // Dark blue-gray
    secondary: '#073642',  // Slightly lighter
    tertiary: '#586e75',   // Medium gray
  },
  text: {
    primary: '#839496',    // Light gray
    secondary: '#93a1a1',  // Lighter gray
    inverse: '#fdf6e3',    // Cream (for dark backgrounds)
  },
  accent: {
    primary: '#2aa198',    // Teal
    secondary: '#268bd2',  // Blue
    success: '#859900',    // Green
    warning: '#b58900',    // Yellow
    error: '#dc322f',      // Red
  },
  border: {
    default: '#586e75',
    accent: '#2aa198',
  },
};
```

### 3. Spacing Grid (4px Base)

**Pattern**: Use 4px spacing increments for visual rhythm.

```tsx
// Available spacing values (in pixels)
spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

// ✅ GOOD: Consistent spacing
<div style={{
  marginBottom: spacing[4],  // 16px
  padding: spacing[3],       // 12px
  gap: spacing[2],           // 8px
}} />
```

### 4. Mobile Touch Targets (44px Minimum)

**Pattern**: All interactive elements must be at least 44x44px for ADHD-friendly tapping.

```tsx
// ✅ GOOD: Large touch target
<button style={{
  minWidth: '44px',
  minHeight: '44px',
  padding: spacing[3],
}} />

// ❌ AVOID: Small touch target
<button style={{
  width: '24px',
  height: '24px',
}} />
```

---

## Async Job Decomposition Patterns

### 1. Progressive Decomposition States

**Pattern**: Tasks go through decomposition lifecycle: `stub` → `decomposing` → `decomposed` → `atomic`.

```tsx
type DecompositionState = 'stub' | 'decomposing' | 'decomposed' | 'atomic';

interface TaskNode {
  task_id: string;
  title: string;
  is_leaf: boolean;
  decomposition_state: DecompositionState;
  children_ids: string[];
  children?: TaskNode[];
}

// ✅ GOOD: Handle all states
const handleExpand = async (taskId: string) => {
  const task = tasks.find(t => t.task_id === taskId);

  if (task.decomposition_state === 'stub') {
    // Trigger AI decomposition
    setDecompositionState('decomposing');
    const children = await decomposeTask(taskId);
    setChildren(children);
    setDecompositionState('decomposed');
  } else if (task.decomposition_state === 'decomposed') {
    // Fetch existing children
    const children = await fetchChildren(taskId);
    setChildren(children);
  }
  // Atomic tasks cannot expand further
};
```

**Used in**: `AsyncJobTimeline.tsx`, `HierarchyTreeNode.tsx`, `TaskTreeView.tsx`

### 2. AsyncJobTimeline Usage

**Pattern**: Show real-time progress for multi-step operations.

```tsx
import AsyncJobTimeline from '@/components/shared/AsyncJobTimeline';

// ✅ GOOD: Full breakdown with progress
<AsyncJobTimeline
  jobName="Send email to Sara"
  steps={[
    {
      id: 'draft',
      description: 'Draft email message',
      shortLabel: 'Draft',
      estimatedMinutes: 3,
      leafType: 'HUMAN',
      icon: '✍️',
      status: 'done',
    },
    {
      id: 'send',
      description: 'Send via API',
      shortLabel: 'Send',
      estimatedMinutes: 0,
      leafType: 'DIGITAL',
      icon: '📧',
      status: 'active',
    },
  ]}
  currentProgress={75}
  size="full"
  showProgressBar={true}
  onStepClick={(stepId) => console.log('Clicked:', stepId)}
/>
```

**Size variants**:
- `full` (64px height) - Main task decomposition view
- `micro` (40px height) - Nested sub-tasks
- `nano` (32px height) - Minimal progress indicator

---

## Mobile Gesture Patterns

### 1. Swipe Cards (Tinder-Style)

**Pattern**: Left swipe = skip/dismiss, Right swipe = complete/accept.

```tsx
// ✅ GOOD: Clear swipe directions with visual feedback
<SwipeableTaskCard
  task={task}
  onSwipeLeft={() => {
    playHaptic('light');
    skipTask(task.id);
  }}
  onSwipeRight={() => {
    playHaptic('success');
    completeTask(task.id);
  }}
  swipeThreshold={100} // 100px minimum swipe distance
/>

// Visual indicators
const getSwipeIndicator = (direction: 'left' | 'right') => {
  if (direction === 'left') {
    return { icon: '⏭️', color: '#b58900', label: 'Skip' };
  }
  return { icon: '✅', color: '#859900', label: 'Complete' };
};
```

**Used in**: `SwipeableTaskCard.tsx`, `HunterMode.tsx`

### 2. Hold-to-View Pattern

**Pattern**: Hold button to reveal details without navigation.

```tsx
// ✅ GOOD: Circular progress on hold
const HoldToViewButton = ({ onComplete, duration = 1000 }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const handleHoldStart = () => {
    setIsHolding(true);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return prev + (100 / (duration / 50));
      });
    }, 50);
  };

  return (
    <button
      onMouseDown={handleHoldStart}
      onTouchStart={handleHoldStart}
      style={{
        position: 'relative',
        width: '60px',
        height: '60px',
      }}
    >
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#2aa198"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${progress * 2.83} 283`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span>Hold</span>
    </button>
  );
};
```

**Used in**: `SwipeableTaskCard.tsx` (task details preview)

---

## Component Composition Patterns

### 1. Mode-Based Architecture

**Pattern**: 5 biological modes each in separate component files.

```
src/components/mobile/modes/
├── CaptureMode.tsx   // 🎯 Brain dump & voice input
├── ScoutMode.tsx     // 🔍 Discover & organize
├── HunterMode.tsx    // 🎯 Single-task focus
├── MenderMode.tsx    // 💙 Energy tracking & recovery
└── MapperMode.tsx    // 🗺️ Progress & reflection
```

**Navigation pattern**:
```tsx
// BiologicalTabs.tsx
const modes = [
  { id: 'capture', icon: '🎯', label: 'Capture' },
  { id: 'scout', icon: '🔍', label: 'Scout' },
  { id: 'hunter', icon: '🎯', label: 'Hunter' },
  { id: 'mender', icon: '💙', label: 'Mender' },
  { id: 'mapper', icon: '🗺️', label: 'Mapper' },
];
```

### 2. Expandable Tile Pattern

**Pattern**: Accordion-style panels that expand without navigation.

```tsx
import ExpandableTile from '@/components/mobile/ExpandableTile';

// ✅ GOOD: Inline expansion
<ExpandableTile
  title="Task Breakdown"
  icon="🧩"
  isExpanded={isExpanded}
  onToggle={() => setIsExpanded(!isExpanded)}
>
  <MicroStepsBreakdown steps={microSteps} />
</ExpandableTile>
```

**Used in**: `MicroStepsBreakdown.tsx`, `ScoutMode.tsx`

---

## State Management Patterns

### 1. Local State for UI Only

**Pattern**: Use React `useState` for UI-only state (animations, expanded panels, etc.).

```tsx
// ✅ GOOD: Local UI state
const [isExpanded, setIsExpanded] = useState(false);
const [activeTab, setActiveTab] = useState('capture');
const [showModal, setShowModal] = useState(false);
```

### 2. Fetch-on-Demand for Data

**Pattern**: Load data when needed, not upfront.

```tsx
// ✅ GOOD: Lazy loading children
const handleExpand = async (taskId: string) => {
  if (!childrenCache.has(taskId)) {
    setLoading(true);
    const children = await fetchTaskChildren(taskId);
    setChildrenCache(prev => new Map(prev).set(taskId, children));
    setLoading(false);
  }
  setExpandedId(taskId);
};

// ❌ AVOID: Loading all data upfront
useEffect(() => {
  const loadAllChildren = async () => {
    for (const task of tasks) {
      const children = await fetchTaskChildren(task.id);
      // This is slow and wasteful
    }
  };
  loadAllChildren();
}, []);
```

### 3. Optimistic Updates

**Pattern**: Update UI immediately, revert on error.

```tsx
// ✅ GOOD: Optimistic completion
const handleComplete = async (taskId: string) => {
  // Immediate UI update
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, status: 'done' } : t
  ));

  // Celebration animation
  playAnimation('confetti');

  // Background sync
  try {
    await updateTaskStatus(taskId, 'done');
  } catch (error) {
    // Revert on error
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'pending' } : t
    ));
    showError('Failed to save');
  }
};
```

---

## API Integration Patterns

### 1. Quick Capture Endpoint

**Pattern**: Single endpoint for task creation + AI decomposition.

```tsx
const captureTask = async (input: string, autoMode: boolean = true) => {
  const response = await fetch('/api/v1/mobile/quick-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'default-user',
      input,
      auto_mode: autoMode,
    }),
  });

  const data = await response.json();

  return {
    task: data.task,
    micro_steps: data.micro_steps,
    breakdown: data.breakdown,
  };
};
```

**Response format**:
```typescript
interface QuickCaptureResponse {
  task: {
    task_id: string;
    title: string;
    estimated_minutes: number;
  };
  micro_steps: MicroStep[];
  breakdown: {
    total_steps: number;
    total_minutes: number;
    digital_count: number;
    human_count: number;
  };
}
```

### 2. Hierarchical Decomposition

**Pattern**: On-demand child fetching with progressive states.

```tsx
// Fetch existing children
const fetchChildren = async (stepId: string) => {
  const response = await fetch(`/api/v1/micro-steps/${stepId}/children`);
  const { children } = await response.json();
  return children;
};

// Trigger AI decomposition
const decomposeStep = async (stepId: string) => {
  const response = await fetch(`/api/v1/micro-steps/${stepId}/decompose`, {
    method: 'POST',
    body: JSON.stringify({ user_id: 'default-user' }),
  });
  const { children } = await response.json();
  return children;
};
```

---

## Summary Checklist

When building new features, ensure:

- ✅ Single-task focus (no overwhelming lists)
- ✅ Immediate visual feedback (animations, haptics)
- ✅ Design tokens used (no hardcoded values)
- ✅ 44px minimum touch targets
- ✅ Solarized color palette
- ✅ 4px spacing grid
- ✅ Micro-steps are 2-5 minutes max
- ✅ Progressive decomposition states handled
- ✅ Energy-aware task filtering
- ✅ Dopamine-optimized rewards
- ✅ Mobile gestures (swipe, hold-to-view)
- ✅ Optimistic UI updates
- ✅ Lazy loading for performance

---

**For more information**:
- Pitfalls to avoid: See `FRONTEND_PITFALLS.md`
- Component catalog: See `COMPONENT_CATALOG.md`
- ADHD system overview: See `frontend/src/app/mobile/README.md`
