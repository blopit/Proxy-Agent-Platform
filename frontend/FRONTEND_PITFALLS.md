# Frontend Pitfalls & Common Mistakes

This guide documents common mistakes, gotchas, and anti-patterns to avoid when working on the Mobile ADHD Task Management System. Learn from these examples to save debugging time.

---

## Table of Contents

1. [CSS & Styling Pitfalls](#css--styling-pitfalls)
2. [Component Architecture Mistakes](#component-architecture-mistakes)
3. [State Management Issues](#state-management-issues)
4. [API Integration Gotchas](#api-integration-gotchas)
5. [Mobile-Specific Problems](#mobile-specific-problems)
6. [Performance Anti-Patterns](#performance-anti-patterns)
7. [Accessibility Oversights](#accessibility-oversights)

---

## CSS & Styling Pitfalls

### ❌ Don't Use clip-path for Shapes with Borders

**Problem**: CSS `clip-path` cannot render true borders. Margin-based workarounds create visual artifacts and browser inconsistencies.

```tsx
// ❌ BAD: clip-path with fake borders
<div
  style={{
    clipPath: 'polygon(...)',
    backgroundColor: '#dc322f', // Border layer
  }}
>
  <div
    style={{
      clipPath: 'polygon(...)',
      margin: '3px', // Creates "border" effect
      backgroundColor: '#fdf6e3',
    }}
  >
    Content
  </div>
</div>

// ✅ GOOD: Use SVG with proper stroke
<svg width="100%" height="64" viewBox="0 0 100 64">
  <path
    d="M 0 0 L 90 0 L 100 32 L 90 64 L 0 64 Z"
    fill="#fdf6e3"
    stroke="#dc322f"
    strokeWidth="3"
  />
</svg>
```

**Why this matters**: Clip-path borders look inconsistent across browsers, especially on mobile. SVG strokes render perfectly everywhere.

**Fixed in**: `ChevronStep.tsx` (replaced clip-path chevrons with SVG)

---

### ❌ Don't Hardcode Colors or Spacing

**Problem**: Hardcoded values create inconsistencies and make theme changes difficult.

```tsx
// ❌ BAD: Hardcoded values
<div style={{
  padding: '16px',
  fontSize: '14px',
  backgroundColor: '#002b36',
  color: '#839496',
  borderRadius: '8px',
}} />

// ✅ GOOD: Design system tokens
import { spacing, fontSize, semanticColors, borderRadius } from '@/lib/design-system';

<div style={{
  padding: spacing[4],
  fontSize: fontSize.sm,
  backgroundColor: semanticColors.bg.primary,
  color: semanticColors.text.primary,
  borderRadius: borderRadius.lg,
}} />
```

**Why this matters**: Design system tokens ensure visual consistency and make global changes (like dark mode) possible in one place.

**Reference**: `frontend/src/lib/design-system.ts`

---

### ❌ Don't Use Tailwind for Everything

**Problem**: Some Tailwind classes don't match our design system (especially colors).

```tsx
// ❌ BAD: Tailwind classes with custom colors
<div className="bg-[#002b36] p-4 text-sm rounded-lg" />

// ✅ GOOD: Inline styles with design tokens
<div style={{
  backgroundColor: semanticColors.bg.primary,
  padding: spacing[4],
  fontSize: fontSize.sm,
  borderRadius: borderRadius.lg,
}} />

// ✅ ALSO GOOD: Tailwind for layout, tokens for theming
<div className="flex flex-col gap-2" style={{
  backgroundColor: semanticColors.bg.primary,
  padding: spacing[4],
}} />
```

**Why this matters**: Our Solarized color palette isn't in default Tailwind, so custom colors break the design system.

---

## Component Architecture Mistakes

### ❌ Don't Create Deeply Nested Component Hierarchies

**Problem**: Deep nesting makes state management and debugging difficult.

```tsx
// ❌ BAD: Deep nesting with prop drilling
<ModeContainer>
  <ModeHeader>
    <ModeTitle>
      <ModeTitleText>
        <span>{title}</span>
      </ModeTitleText>
    </ModeTitle>
  </ModeHeader>
</ModeContainer>

// ✅ GOOD: Flat component structure
<div className="mode-container">
  <h2 style={{ fontSize: fontSize.lg, color: semanticColors.text.primary }}>
    {title}
  </h2>
</div>
```

**Why this matters**: Flat structures are easier to debug, test, and refactor. Avoid "wrapper hell."

---

### ❌ Don't Spread Props Blindly

**Problem**: Spreading props makes it unclear what props a component accepts.

```tsx
// ❌ BAD: Unclear prop spreading
function TaskCard({ task, ...rest }: TaskCardProps & Record<string, any>) {
  return <div {...rest}>{task.title}</div>;
}

// ✅ GOOD: Explicit props
interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

function TaskCard({ task, onClick, className, style }: TaskCardProps) {
  return (
    <div onClick={onClick} className={className} style={style}>
      {task.title}
    </div>
  );
}
```

**Why this matters**: Explicit props improve TypeScript autocomplete and make components self-documenting.

---

### ❌ Don't Mix Business Logic with UI Components

**Problem**: UI components become untestable and hard to reuse.

```tsx
// ❌ BAD: API calls inside UI component
function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('/api/v1/tasks')
      .then(res => res.json())
      .then(data => setTasks(data.tasks));
  }, []);

  return <div>{tasks.map(task => <TaskCard key={task.id} task={task} />)}</div>;
}

// ✅ GOOD: Separate data fetching from UI
// hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks().then(setTasks).finally(() => setLoading(false));
  }, []);

  return { tasks, loading };
}

// TaskList.tsx
function TaskList() {
  const { tasks, loading } = useTasks();

  if (loading) return <Loading />;
  return <div>{tasks.map(task => <TaskCard key={task.id} task={task} />)}</div>;
}
```

**Why this matters**: Separation of concerns makes components testable and reusable.

---

## State Management Issues

### ❌ Don't Store Derived State

**Problem**: Derived state can become stale and cause bugs.

```tsx
// ❌ BAD: Storing derived state
const [tasks, setTasks] = useState([]);
const [completedCount, setCompletedCount] = useState(0); // Derived!

useEffect(() => {
  setCompletedCount(tasks.filter(t => t.status === 'done').length);
}, [tasks]); // Easy to forget to update

// ✅ GOOD: Calculate on render
const [tasks, setTasks] = useState([]);
const completedCount = tasks.filter(t => t.status === 'done').length;
```

**Why this matters**: Derived state eliminates synchronization bugs and is simpler to reason about.

---

### ❌ Don't Overuse useEffect

**Problem**: Too many `useEffect` hooks create race conditions and hard-to-debug issues.

```tsx
// ❌ BAD: Effect soup
useEffect(() => {
  setFilteredTasks(tasks.filter(t => t.category === category));
}, [tasks, category]);

useEffect(() => {
  setSortedTasks([...filteredTasks].sort((a, b) => a.priority - b.priority));
}, [filteredTasks]);

useEffect(() => {
  setDisplayTasks(sortedTasks.slice(0, pageSize));
}, [sortedTasks, pageSize]);

// ✅ GOOD: Calculate in one place
const displayTasks = useMemo(() => {
  return tasks
    .filter(t => t.category === category)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, pageSize);
}, [tasks, category, pageSize]);
```

**Why this matters**: Multiple effects can run in unpredictable order. Single calculation is simpler and more performant.

---

### ❌ Don't Mutate State Directly

**Problem**: React won't detect changes and won't re-render.

```tsx
// ❌ BAD: Direct mutation
const handleComplete = (taskId: string) => {
  const task = tasks.find(t => t.id === taskId);
  task.status = 'done'; // Mutation!
  setTasks(tasks); // React won't detect change
};

// ✅ GOOD: Immutable update
const handleComplete = (taskId: string) => {
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, status: 'done' } : t
  ));
};
```

**Why this matters**: React's reconciliation relies on reference equality. Mutations break this.

---

## API Integration Gotchas

### ❌ Don't Assume Browser APIs Are Available

**Problem**: Web Speech API, Vibration API, etc. aren't available in all browsers/contexts.

```tsx
// ❌ BAD: Unchecked API usage
const startRecording = () => {
  const recognition = new webkitSpeechRecognition(); // Crashes in Firefox!
  recognition.start();
};

// ✅ GOOD: Feature detection
const startRecording = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showError('Voice input not supported in this browser');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.start();
};
```

**Why this matters**: Graceful degradation prevents crashes and provides better UX.

**Reference**: `frontend/src/hooks/useVoiceInput.ts`

---

### ❌ Don't Forget Error Handling

**Problem**: Network failures, API errors, and malformed data cause crashes.

```tsx
// ❌ BAD: No error handling
const fetchTasks = async () => {
  const response = await fetch('/api/v1/tasks');
  const data = await response.json();
  setTasks(data.tasks);
};

// ✅ GOOD: Comprehensive error handling
const fetchTasks = async () => {
  try {
    const response = await fetch('/api/v1/tasks');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('Invalid response format');
    }

    setTasks(data.tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    showError('Could not load tasks. Please try again.');
    setTasks([]); // Fallback to empty state
  }
};
```

**Why this matters**: Proper error handling prevents crashes and improves user experience.

---

### ❌ Don't Use Async Functions in useEffect Without Cleanup

**Problem**: Race conditions when component unmounts before async operation completes.

```tsx
// ❌ BAD: No cleanup for async operations
useEffect(() => {
  const loadData = async () => {
    const data = await fetchTasks();
    setTasks(data); // Component might be unmounted!
  };
  loadData();
}, []);

// ✅ GOOD: Cleanup with abort controller
useEffect(() => {
  let cancelled = false;
  const controller = new AbortController();

  const loadData = async () => {
    try {
      const data = await fetchTasks({ signal: controller.signal });
      if (!cancelled) {
        setTasks(data);
      }
    } catch (error) {
      if (!cancelled && error.name !== 'AbortError') {
        console.error(error);
      }
    }
  };

  loadData();

  return () => {
    cancelled = true;
    controller.abort();
  };
}, []);
```

**Why this matters**: Prevents "Can't perform a React state update on an unmounted component" warnings and memory leaks.

---

## Mobile-Specific Problems

### ❌ Don't Forget Touch Targets Are Bigger Than Cursors

**Problem**: Small buttons are hard to tap on mobile.

```tsx
// ❌ BAD: Tiny touch target
<button style={{
  width: '24px',
  height: '24px',
  padding: '4px',
}} />

// ✅ GOOD: 44px minimum (Apple HIG guideline)
<button style={{
  minWidth: '44px',
  minHeight: '44px',
  padding: spacing[3],
}} />
```

**Why this matters**: ADHD users especially benefit from large, easy-to-hit targets.

---

### ❌ Don't Use Hover States on Mobile

**Problem**: Mobile doesn't have hover, so hover-only interactions are broken.

```tsx
// ❌ BAD: Hover-only interaction
<div className="group">
  <button>Task</button>
  <div className="hidden group-hover:block">Actions</div>
</div>

// ✅ GOOD: Tap to toggle (or always visible)
const [showActions, setShowActions] = useState(false);

<div onClick={() => setShowActions(!showActions)}>
  <button>Task</button>
  {showActions && <div>Actions</div>}
</div>
```

**Why this matters**: Mobile users can't access hover-only features.

---

### ❌ Don't Forget Haptic Feedback

**Problem**: Missing tactile confirmation reduces engagement (especially for ADHD).

```tsx
// ❌ BAD: No haptic feedback
<button onClick={handleComplete}>Complete</button>

// ✅ GOOD: Haptic + visual + audio feedback
const handleComplete = () => {
  // Haptic
  if ('vibrate' in navigator) {
    navigator.vibrate([50, 30, 50]); // Double buzz
  }

  // Visual
  playAnimation('confetti');

  // Update state
  completeTask();
};
```

**Why this matters**: Multi-sensory feedback increases dopamine response and task completion rates.

---

## Performance Anti-Patterns

### ❌ Don't Fetch All Data Upfront

**Problem**: Loading everything at once causes slow initial load.

```tsx
// ❌ BAD: Load everything upfront
useEffect(() => {
  const loadEverything = async () => {
    const tasks = await fetchTasks();
    const children = await Promise.all(
      tasks.map(t => fetchChildren(t.id)) // Hundreds of requests!
    );
    setAllData({ tasks, children });
  };
  loadEverything();
}, []);

// ✅ GOOD: Lazy load on demand
const [childrenCache, setChildrenCache] = useState(new Map());

const loadChildren = async (taskId: string) => {
  if (childrenCache.has(taskId)) return;

  const children = await fetchChildren(taskId);
  setChildrenCache(prev => new Map(prev).set(taskId, children));
};
```

**Why this matters**: On-demand loading improves perceived performance and reduces unnecessary API calls.

---

### ❌ Don't Create New Objects/Functions in Render

**Problem**: Creates new references on every render, breaking memoization.

```tsx
// ❌ BAD: New object on every render
<TaskCard
  task={task}
  style={{ padding: spacing[4] }} // New object!
  onClick={() => handleClick(task.id)} // New function!
/>

// ✅ GOOD: Stable references
const cardStyle = useMemo(() => ({ padding: spacing[4] }), []);
const handleClick = useCallback((taskId: string) => {
  completeTask(taskId);
}, []);

<TaskCard
  task={task}
  style={cardStyle}
  onClick={() => handleClick(task.id)}
/>
```

**Why this matters**: Stable references enable React.memo and prevent unnecessary re-renders.

---

### ❌ Don't Use Array Index as Key

**Problem**: Causes rendering bugs when list order changes.

```tsx
// ❌ BAD: Index as key
{tasks.map((task, index) => (
  <TaskCard key={index} task={task} />
))}

// ✅ GOOD: Stable unique ID as key
{tasks.map(task => (
  <TaskCard key={task.task_id} task={task} />
))}
```

**Why this matters**: React uses keys to track component identity. Index keys break when items are added/removed/reordered.

---

## Accessibility Oversights

### ❌ Don't Forget Screen Reader Support

**Problem**: ADHD users may also use screen readers or accessibility tools.

```tsx
// ❌ BAD: No screen reader context
<button onClick={handleComplete}>✅</button>

// ✅ GOOD: Descriptive labels
<button
  onClick={handleComplete}
  aria-label="Mark task as complete"
  title="Mark task as complete"
>
  ✅
</button>
```

**Why this matters**: Accessibility benefits everyone, not just users with visual impairments.

---

### ❌ Don't Use Only Color to Convey Information

**Problem**: Color-blind users can't distinguish status.

```tsx
// ❌ BAD: Color-only status
<div style={{ backgroundColor: taskStatus === 'done' ? 'green' : 'red' }} />

// ✅ GOOD: Color + icon + text
<div style={{ backgroundColor: semanticColors.accent.success }}>
  {taskStatus === 'done' ? (
    <>
      <CheckCircle2 size={16} />
      <span>Complete</span>
    </>
  ) : (
    <>
      <Circle size={16} />
      <span>Pending</span>
    </>
  )}
</div>
```

**Why this matters**: Multiple indicators ensure information is accessible to all users.

---

### ❌ Don't Disable Focus Outlines

**Problem**: Keyboard users can't navigate.

```tsx
// ❌ BAD: No focus indication
<button style={{ outline: 'none' }}>Click</button>

// ✅ GOOD: Custom focus style
<button style={{
  outline: 'none',
  boxShadow: 'focus-visible' ? `0 0 0 3px ${semanticColors.accent.primary}` : 'none',
}} />

// ✅ EVEN BETTER: Use :focus-visible CSS
<button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500" />
```

**Why this matters**: Keyboard navigation is essential for accessibility and power users.

---

## Summary: Quick Reference Checklist

Before merging, check that your code:

**Styling**:
- ✅ Uses design system tokens (not hardcoded values)
- ✅ Avoids clip-path for shapes with borders (use SVG)
- ✅ Uses Solarized color palette
- ✅ Follows 4px spacing grid

**Components**:
- ✅ Has explicit props (no blind spreading)
- ✅ Separates business logic from UI
- ✅ Keeps component hierarchy flat

**State**:
- ✅ Avoids storing derived state
- ✅ Uses immutable updates
- ✅ Minimizes useEffect usage

**API**:
- ✅ Checks for browser API availability
- ✅ Has error handling
- ✅ Cleans up async operations

**Mobile**:
- ✅ Has 44px minimum touch targets
- ✅ Includes haptic feedback
- ✅ Avoids hover-only interactions

**Performance**:
- ✅ Lazy loads data on demand
- ✅ Uses stable references for memoization
- ✅ Uses stable keys (not array index)

**Accessibility**:
- ✅ Has screen reader labels
- ✅ Uses multiple indicators (color + icon + text)
- ✅ Has visible focus outlines

---

**For more information**:
- Best practices: See `FRONTEND_PATTERNS.md`
- Component catalog: See `COMPONENT_CATALOG.md`
- Design system: See `frontend/src/lib/design-system.ts`
