# Component Library Reference

## 📦 Mobile Components

Complete reference for all ADHD-optimized mobile components.

---

## Core Navigation

### BiologicalTabs

**Location**: `src/components/mobile/BiologicalTabs.tsx`

Bottom navigation tabs representing the 5 biological circuits.

**Props**:
```typescript
interface BiologicalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  energy: number;              // 0-100 energy level
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}
```

**Usage**:
```typescript
<BiologicalTabs
  activeTab={mode}
  onTabChange={(tab) => setMode(tab as Mode)}
  energy={72}
  timeOfDay="morning"
/>
```

**Features**:
- 5 tabs: Capture, Search (Scout), Hunt (Hunter), Rest (Mender), Plan (Mapper)
- Optimal state indicators (pulsing ring) based on time of day and energy
- Compact design (60px total height)
- Always visible at bottom of screen

**Styling Notes**:
- Active tab: Blue background with scale-up animation
- Inactive tabs: Dark background with border
- Optimal tabs: Yellow ring animation

---

## Task Display Components

### SwipeableTaskCard

**Location**: `src/components/mobile/SwipeableTaskCard.tsx`

Full-screen swipeable task card with Tinder-style gestures.

**Props**:
```typescript
interface SwipeableTaskCardProps {
  task: Task;
  onSwipeLeft: (task: Task) => void;   // Dismiss
  onSwipeRight: (task: Task) => void;  // Do/Delegate
  onTap: (task: Task) => void;         // View details
  isActive: boolean;
  onDismissSwipeTutorial?: () => void;
  onDismissHoldTutorial?: () => void;
}
```

**Usage**:
```typescript
<SwipeableTaskCard
  task={currentTask}
  onSwipeLeft={(task) => handleDismiss(task)}
  onSwipeRight={(task) => handleAccept(task)}
  onTap={(task) => showDetails(task)}
  isActive={true}
/>
```

**Gestures**:
- **Swipe Left**: Dismiss task (red background appears)
- **Swipe Right**: Do now or delegate (green/blue background)
- **Hold 1s**: View task details (circular progress animation)
- **Tap**: Quick tap for details (if not swiping)

**Features**:
- Smooth 60fps drag with GPU acceleration
- Visual feedback: Background indicators show swipe direction
- Velocity-based swipe detection
- 3D layered card content (uses `Layer` component)
- Priority-based color coding
- Digital task indicators (⚡ for delegatable tasks)

**Performance**:
- Uses direct DOM manipulation for smooth dragging
- Refs instead of state for non-render values
- Velocity tracking for momentum swipes

---

### CardStack

**Location**: `src/components/mobile/CardStack.tsx`

Stack of swipeable cards for Hunter mode.

**Props**:
```typescript
interface CardStackProps {
  tasks: Task[];
  onSwipeLeft: (task: Task) => void;
  onSwipeRight: (task: Task) => void;
  onTap: (task: Task) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}
```

**Usage**:
```typescript
<CardStack
  tasks={hunterTasks}
  onSwipeLeft={handleDismiss}
  onSwipeRight={handleComplete}
  onTap={viewDetails}
  currentIndex={currentTaskIndex}
  onIndexChange={setCurrentTaskIndex}
/>
```

**Features**:
- Shows current card + preview of next 2 cards
- Z-index stacking with scale animation
- Automatically advances to next card on swipe
- Empty state when no tasks remain

---

### CategoryRow

**Location**: `src/components/mobile/CategoryRow.tsx`

Horizontal scrolling row of task cards with category header.

**Props**:
```typescript
interface CategoryRowProps {
  title: string;
  icon?: React.ReactNode;
  tasks: Task[];
  onTaskTap: (task: Task) => void;
  cardSize?: 'compact' | 'default' | 'hero';
  isMystery?: boolean;
}
```

**Usage**:
```typescript
<CategoryRow
  title="Quick Wins"
  icon={<Target size={16} color={colors.green} />}
  tasks={quickWinTasks}
  onTaskTap={handleTaskClick}
  cardSize="compact"
/>

// Mystery task variation
<CategoryRow
  title="Mystery Task Bonus"
  icon={<Gift size={16} color={colors.yellow} />}
  tasks={mysteryTasks}
  onTaskTap={handleTaskClick}
  isMystery={true}
/>
```

**Card Sizes**:
- **compact**: 120px width (for quick wins, many items)
- **default**: 160px width (standard tasks)
- **hero**: 280px width (main focus tasks)

**Features**:
- Horizontal scroll with snap points
- Priority-based card colors
- Time estimates displayed
- Digital task indicators
- Mystery task sparkle animation
- Empty state with encouraging message

---

## Progress & Feedback Components

### AsyncJobTimeline

**Location**: `src/components/shared/AsyncJobTimeline.tsx`

Shows task breakdown progress with expandable steps.

**Props**:
```typescript
interface AsyncJobTimelineProps {
  jobName: string;
  steps: JobStep[];
  currentProgress: number;     // 0-100
  size?: 'compact' | 'full';
  showProgressBar?: boolean;
  onDismiss?: () => void;
  onStepExpand?: (stepId: string) => void;
}

interface JobStep {
  id: string;
  description: string;
  shortLabel: string;
  detail?: string;
  estimatedMinutes: number;
  leafType: 'DIGITAL' | 'HUMAN';
  icon?: string;
  status: 'pending' | 'active' | 'done';
  tags?: string[];
  // Hierarchy fields for expansion
  parentStepId?: string | null;
  level?: number;
  isLeaf?: boolean;
  decompositionState?: 'atomic' | 'composite';
}
```

**Usage**:
```typescript
// During capture
<AsyncJobTimeline
  jobName="Buy groceries"
  steps={[
    {
      id: 'parse',
      description: 'Parse natural language',
      shortLabel: 'Parsing',
      estimatedMinutes: 0,
      leafType: 'DIGITAL',
      icon: '🧠',
      status: 'done'
    },
    {
      id: 'llm',
      description: 'LLM decomposition',
      shortLabel: 'Breaking down',
      estimatedMinutes: 0,
      leafType: 'DIGITAL',
      icon: '🔨',
      status: 'active'
    }
  ]}
  currentProgress={45}
  size="full"
  showProgressBar={true}
/>

// After capture - showing task breakdown
<AsyncJobTimeline
  jobName="Buy groceries"
  steps={microSteps}
  currentProgress={100}
  size="full"
  onDismiss={() => removePreview()}
  onStepExpand={(stepId) => expandStep(stepId)}
/>
```

**Features**:
- **Status indicators**: Checkmark (done), spinner (active), circle (pending)
- **Expandable steps**: Click to expand composite steps
- **CHAMPS tags**: Displays task classification tags
- **Time estimates**: Shows estimated minutes per step
- **Digital/Human icons**: 🖥️ for digital, 👤 for human tasks
- **Dismiss button**: X button to remove timeline
- **Progress bar**: Optional messenger-style thin progress bar

**Step Expansion**:
- Non-leaf steps (isLeaf=false) show expand arrow
- Clicking expands to show child steps
- Hierarchical indentation based on level
- Atomic steps (decomposition_state='atomic') cannot expand

---

### TaskBreakdownModal

**Location**: `src/components/mobile/TaskBreakdownModal.tsx`

Slide-up modal showing captured task with micro-steps.

**Props**:
```typescript
interface TaskBreakdownModalProps {
  captureResponse: QuickCaptureResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onStartTask: () => void;
  onViewAllTasks: () => void;
}
```

**Usage**:
```typescript
<TaskBreakdownModal
  captureResponse={capturedTask}
  isOpen={showBreakdown}
  onClose={() => setShowBreakdown(false)}
  onStartTask={() => setMode('hunt')}
  onViewAllTasks={() => setMode('search')}
/>
```

**Features**:
- Slide-up animation from bottom
- Shows task title and description
- AsyncJobTimeline with micro-steps
- 3 action buttons:
  - 🎯 Start Now (→ Hunter mode)
  - 📋 View All Tasks (→ Scout mode)
  - ✨ Capture Another (stay in Capture)
- Click outside or X button to dismiss

---

### EnergyGauge

**Location**: `src/components/mobile/EnergyGauge.tsx`

Circular energy level visualization with trend indicators.

**Props**:
```typescript
interface EnergyGaugeProps {
  energy: number;              // 0-100
  trend?: 'rising' | 'falling' | 'stable';
  predictedNextHour?: number;  // 0-100
  variant?: 'micro' | 'expanded';
}
```

**Usage**:
```typescript
// Expanded - for Mender mode
<EnergyGauge
  energy={72}
  trend="rising"
  predictedNextHour={75}
  variant="expanded"
/>

// Micro - for compact header
<EnergyGauge
  energy={65}
  trend="stable"
  variant="micro"
/>
```

**Variants**:

**Expanded** (200px circle):
- Large circular gauge with glow effect
- Center: Energy percentage + level text
- Breathing pulse animation
- Trend indicator below (📈/📉/➡️)
- Predicted energy badge
- AI recommendation text based on level:
  - High (70-100%): "Perfect for challenging tasks"
  - Medium (40-69%): "Try medium tasks or take breaks"
  - Low (0-39%): "Focus on 5-min tasks or recovery"

**Micro** (64px circle):
- Compact horizontal layout
- Mini circular gauge
- Energy level text
- Trend icon
- Optional prediction badge

**Color Coding** (smooth interpolation):
- 0-30%: Red (#dc322f) - Critical
- 30-60%: Yellow (#b58900) - Medium
- 60-100%: Green (#859900) - Good

**Animation**: 1s smooth transition when energy changes

---

### RewardCelebration / QuickCelebration

**Location**: `src/components/mobile/RewardCelebration.tsx`

Dopamine-optimized success animations.

**Components**:

```typescript
// Full celebration with confetti
<RewardCelebration
  xpEarned={15}
  levelUp={false}
  streakBonus={3}
/>

// Quick celebration (used after capture)
<QuickCelebration />
```

**Features**:
- **QuickCelebration**: Brief checkmark animation with scale effect
- **RewardCelebration**: Full-screen confetti + XP earned display
- Auto-dismiss after 2 seconds
- Fixed position overlay (z-index: 9999)

---

### TaskDropAnimation

**Location**: `src/components/mobile/TaskDropAnimation.tsx`

Brief animation when task is captured.

**Usage**:
```typescript
{dropAnimationText && (
  <TaskDropAnimation text={dropAnimationText} />
)}
```

**Features**:
- Text drops from top with fade-in
- Fixed position overlay
- Auto-dismisses after 800ms
- Shows captured task text briefly

---

### LevelBadge

**Location**: `src/components/mobile/LevelBadge.tsx`

Displays user level with styled badge.

**Props**:
```typescript
interface LevelBadgeProps {
  level: number;
  size?: 'small' | 'medium' | 'large';
}
```

**Usage**:
```typescript
<LevelBadge level={5} size="medium" />
```

---

### AchievementGallery

**Location**: `src/components/mobile/AchievementGallery.tsx`

Grid of unlockable achievements for Mapper mode.

**Props**:
```typescript
interface AchievementGalleryProps {
  unlockedAchievements: Achievement[];
  allAchievements: Achievement[];
}
```

**Usage**:
```typescript
<AchievementGallery
  unlockedAchievements={userAchievements}
  allAchievements={achievementDefinitions}
/>
```

**Features**:
- Grid layout (2-3 columns)
- Unlocked: Full color with icon
- Locked: Grayscale with lock icon
- Hover/tap for achievement description

---

## Utility Components

### Layer

**Location**: `src/components/mobile/Layer.tsx`

3D layering effect for card content.

**Props**:
```typescript
interface LayerProps {
  depth: number;               // Z-axis depth (-50 to 50)
  shadow?: 'none' | 'light' | 'medium' | 'heavy';
  className?: string;
  children: React.ReactNode;
}
```

**Usage**:
```typescript
<Layer depth={10} shadow="light">
  <h2>Title floats forward</h2>
</Layer>

<Layer depth={-15} shadow="none">
  <div>Background element</div>
</Layer>
```

**Depth Values**:
- Positive: Closer to viewer (floats forward)
- Negative: Further from viewer (background)
- Typical range: -20 to 20 for subtle effects

---

### Ticker

**Location**: `src/components/mobile/Ticker.tsx`

Animated placeholder text ticker for input fields.

**Props**:
```typescript
interface TickerProps {
  autoMode: boolean;
  askForClarity: boolean;
  isPaused: boolean;
  mode: Mode;
  className?: string;
}
```

**Usage**:
```typescript
<Ticker
  autoMode={autoMode}
  askForClarity={askForClarity}
  isPaused={tickerPaused}
  mode="capture"
  className="text-[#586e75]"
/>
```

**Features**:
- Cycles through dynamic placeholder text
- Changes based on mode and toggles
- Smooth fade transitions
- Pauses during toggle changes

---

### PurposeTicker

**Location**: `src/components/mobile/PurposeTicker.tsx`

Ticker that shows mode purpose messages.

**Usage**:
```typescript
<PurposeTicker messages={[
  "Seek novelty & identify doable targets",
  "Find quick wins",
  "Organize your task landscape"
]} />
```

---

## Mode Components

### CaptureMode

**Location**: `src/components/mobile/modes/CaptureMode.tsx`

Brain dump interface with suggestion examples.

**Props**:
```typescript
interface CaptureModeProps {
  onTaskCaptured: () => void;
  onExampleClick: (text: string) => void;
  suggestionsVisible: boolean;
  suggestionExamples: string[];
  suggestionLabels: string[];
}
```

**Usage**:
```typescript
<CaptureMode
  onTaskCaptured={() => setRefreshTrigger(prev => prev + 1)}
  onExampleClick={(text) => setChat(text)}
  suggestionsVisible={suggestionsVisible}
  suggestionExamples={SUGGESTION_EXAMPLES}
  suggestionLabels={SUGGESTION_LABELS}
/>
```

---

### ScoutMode

**Location**: `src/components/mobile/modes/ScoutMode.tsx`

Task discovery and organization interface.

**Props**:
```typescript
interface ScoutModeProps {
  onTaskTap: (task: Task) => void;
  refreshTrigger?: number;
}
```

**Features**:
- Two sub-modes: Discover & Organize
- Category-based task filtering
- Inbox processing with batch actions
- Mystery task bonuses (15% chance)

---

### HunterMode

**Location**: `src/components/mobile/modes/HunterMode.tsx`

Single-task focus interface with card stack.

**Props**:
```typescript
interface HunterModeProps {
  onSwipeLeft: (task: Task) => void;
  onSwipeRight: (task: Task) => void;
  onTaskTap: (task: Task) => void;
  refreshTrigger?: number;
}
```

**Features**:
- CardStack for swipeable tasks
- Streak tracking
- Progress bar
- Sorted by priority

---

### MenderMode

**Location**: `src/components/mobile/modes/MenderMode.tsx`

Energy recovery and low-energy task interface.

**Props**:
```typescript
interface MenderModeProps {
  energy: number;
  onTaskTap: (task: Task) => void;
  refreshTrigger?: number;
}
```

**Features**:
- EnergyGauge visualization
- 5-minute recovery tasks
- Mystery box rewards
- Recovery tips

---

### MapperMode

**Location**: `src/components/mobile/modes/MapperMode.tsx`

Progress tracking and reflection interface.

**Props**:
```typescript
interface MapperModeProps {
  xp: number;
  level: number;
  streakDays: number;
}
```

**Features**:
- Overview tab: XP, level, streak
- Achievements tab: AchievementGallery
- Reflection tab: Weekly prompts

---

## Component Composition Examples

### Building a New Mode

```typescript
import { useState, useEffect } from 'react'
import CategoryRow from '@/components/mobile/CategoryRow'
import { spacing, semanticColors } from '@/lib/design-system'

export default function NewMode({ onTaskTap, refreshTrigger }) {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Fetch tasks when mode opens or refresh triggered
    fetchTasks()
  }, [refreshTrigger])

  const fetchTasks = async () => {
    // API call
  }

  return (
    <div style={{
      backgroundColor: semanticColors.bg.primary,
      minHeight: '100vh',
      padding: spacing[4]
    }}>
      <h2 style={{ fontSize: fontSize.lg, marginBottom: spacing[4] }}>
        New Mode
      </h2>

      <CategoryRow
        title="Category Name"
        tasks={tasks}
        onTaskTap={onTaskTap}
      />
    </div>
  )
}
```

---

## Component Best Practices

### 1. State Management

```typescript
// ✅ Good - Lift state to parent
<MobileApp>
  {/* Parent manages global state */}
  <ScoutMode refreshTrigger={refreshTrigger} />
</MobileApp>

// ❌ Bad - Duplicate state in child
<ScoutMode>
  {/* Don't fetch tasks independently */}
</ScoutMode>
```

### 2. Props Interface

```typescript
// ✅ Good - Clear, typed props
interface ComponentProps {
  task: Task;              // Required
  onAction?: () => void;   // Optional with ?
  variant?: 'default' | 'compact';  // Enum
}

// ❌ Bad - Loose typing
function Component(props: any) { }
```

### 3. Design System Usage

```typescript
// ✅ Good - Use tokens
import { spacing, semanticColors } from '@/lib/design-system'
style={{ padding: spacing[4], color: semanticColors.text.primary }}

// ❌ Bad - Hardcoded values
style={{ padding: '16px', color: '#93a1a1' }}
```

### 4. Performance

```typescript
// ✅ Good - Memoize expensive operations
const sortedTasks = useMemo(() =>
  tasks.sort((a, b) => prioritySort(a, b)),
  [tasks]
)

// ❌ Bad - Sort on every render
const sortedTasks = tasks.sort((a, b) => prioritySort(a, b))
```

---

## Quick Reference

### Import Paths

```typescript
// Components
import Component from '@/components/mobile/Component'
import SharedComponent from '@/components/shared/SharedComponent'

// Utilities
import { spacing, colors } from '@/lib/design-system'
import { apiClient } from '@/lib/api'

// Hooks
import { useVoiceInput } from '@/hooks/useVoiceInput'

// Types
import type { Task, MicroStep } from '@/lib/api'
```

### Common Patterns

```typescript
// Task fetch pattern
const [tasks, setTasks] = useState<Task[]>([])
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  fetchTasks()
}, [refreshTrigger])

const fetchTasks = async () => {
  setIsLoading(true)
  try {
    const response = await apiClient.getTasks({ user_id: 'mobile-user' })
    setTasks(response.tasks || [])
  } catch (error) {
    console.error('Failed to fetch:', error)
  } finally {
    setIsLoading(false)
  }
}
```

---

**Last Updated**: 2025-10-25
