# Component Catalog

> **PURPOSE**: Searchable inventory of ALL components in the frontend codebase.
> **BEFORE CREATING A COMPONENT**: Search this file (Cmd+F / Ctrl+F) to check if it already exists!

## 📋 Table of Contents

- [Mobile Components](#mobile-components)
  - [Biological Modes](#biological-modes)
  - [Mobile UI Components](#mobile-ui-components)
  - [Card Components](#card-components)
- [Dashboard Components](#dashboard-components)
- [Task Components](#task-components)
- [System Components](#system-components)
- [UI Primitives](#ui-primitives)
- [Shared Components](#shared-components)

---

## 🔍 How to Use This Catalog

1. **Before creating a component**: Search (Cmd+F / Ctrl+F) for keywords
2. **Check the component entry**: Review purpose, props, and usage
3. **Import and use**: Copy the import statement and usage example
4. **Still need to create?**: Follow the component creation checklist in [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)

---

## 📱 Mobile Components

### Biological Modes

These are the 5 core modes based on biological workflows (Capture → Scout → Hunt → Map → Mend).

#### CaptureMode
**Purpose**: Quick task capture with voice input and AI processing
**Location**: [`src/components/mobile/modes/CaptureMode.tsx`](src/components/mobile/modes/CaptureMode.tsx)
**Key Props**:
```typescript
interface CaptureModeProps {
  onTaskCaptured: (task: Task) => void
  refreshTrigger?: number
}
```
**Usage**:
```typescript
import CaptureMode from '@/components/mobile/modes/CaptureMode'

<CaptureMode onTaskCaptured={handleTaskCaptured} />
```
**Features**:
- Voice input integration
- Expandable textarea
- Auto/clarity toggle buttons
- Loading states with animations
- Task drop animations

---

#### ScoutMode
**Purpose**: Browse tasks in Netflix-style categories with smooth scrolling
**Location**: [`src/components/mobile/modes/ScoutMode.tsx`](src/components/mobile/modes/ScoutMode.tsx)
**Key Props**:
```typescript
interface ScoutModeProps {
  onTaskTap: (task: Task) => void
  refreshTrigger?: number
}
```
**Usage**:
```typescript
import ScoutMode from '@/components/mobile/modes/ScoutMode'

<ScoutMode onTaskTap={handleTaskTap} refreshTrigger={trigger} />
```
**Features**:
- Netflix-style horizontal carousels
- Variable card sizes (hero, standard, compact)
- Smooth momentum scrolling
- Category filters (All, Digital, Urgent)
- Mystery task bonus (15% chance)
- Task categories: Main Focus, Urgent Today, Quick Wins, This Week, Can Delegate, Someday/Maybe

---

#### HunterMode
**Purpose**: Focus on executing a single task with deep work timer
**Location**: [`src/components/mobile/modes/HunterMode.tsx`](src/components/mobile/modes/HunterMode.tsx)
**Key Props**: None (standalone mode)
**Usage**:
```typescript
import HunterMode from '@/components/mobile/modes/HunterMode'

<HunterMode />
```
**Features**:
- Deep work timer
- Task focus view
- Distraction blocking

---

#### MapperMode
**Purpose**: Break down tasks into subtasks and dependencies
**Location**: [`src/components/mobile/modes/MapperMode.tsx`](src/components/mobile/modes/MapperMode.tsx)
**Key Props**: None (standalone mode)
**Usage**:
```typescript
import MapperMode from '@/components/mobile/modes/MapperMode'

<MapperMode />
```
**Features**:
- Task tree view
- Subtask creation
- Dependency visualization

---

#### MenderMode
**Purpose**: Review completed tasks and reflect on progress
**Location**: [`src/components/mobile/modes/MenderMode.tsx`](src/components/mobile/modes/MenderMode.tsx)
**Key Props**: None (standalone mode)
**Usage**:
```typescript
import MenderMode from '@/components/mobile/modes/MenderMode'

<MenderMode />
```
**Features**:
- Completed task review
- Progress reflection
- Achievement gallery

---

### Mobile UI Components

#### BiologicalTabs
**Purpose**: Bottom tab navigation for biological modes (5 modes)
**Location**: [`src/components/mobile/BiologicalTabs.tsx`](src/components/mobile/BiologicalTabs.tsx)
**Key Props**:
```typescript
interface BiologicalTabsProps {
  activeMode: 'capture' | 'scout' | 'hunter' | 'mapper' | 'mender'
  onModeChange: (mode: string) => void
}
```
**Usage**:
```typescript
import BiologicalTabs from '@/components/mobile/BiologicalTabs'

<BiologicalTabs
  activeMode={currentMode}
  onModeChange={setCurrentMode}
/>
```
**Features**:
- 5 biological mode tabs with icons
- Active state highlighting
- Touch-friendly tap targets
- Design system standardized

---

#### CategoryRow
**Purpose**: Horizontal scrolling carousel for task categories (Netflix-style)
**Location**: [`src/components/mobile/CategoryRow.tsx`](src/components/mobile/CategoryRow.tsx)
**Key Props**:
```typescript
interface CategoryRowProps {
  title: string
  icon: React.ReactNode
  tasks: Task[]
  onTaskTap: (task: Task) => void
  isMystery?: boolean
  cardSize?: 'hero' | 'standard' | 'compact'
}
```
**Usage**:
```typescript
import CategoryRow from '@/components/mobile/CategoryRow'
import { Flame } from 'lucide-react'

<CategoryRow
  title="Main Focus"
  icon={<Flame size={iconSize.sm} />}
  tasks={tasks}
  onTaskTap={handleTap}
  cardSize="hero"
/>
```
**Features**:
- Variable card sizes (hero: 320×180, standard: 240×140, compact: 200×120)
- Smooth horizontal scrolling (no snap-scrolling)
- Edge fade gradients for "peek next card" effect
- GPU-accelerated hover effects
- Priority color coding
- Mystery task styling with glow effect

---

#### TaskBreakdownModal
**Purpose**: Modal for breaking tasks into subtasks
**Location**: [`src/components/mobile/TaskBreakdownModal.tsx`](src/components/mobile/TaskBreakdownModal.tsx)
**Key Props**:
```typescript
interface TaskBreakdownModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onSubtaskCreate: (subtask: Subtask) => void
}
```
**Usage**:
```typescript
import TaskBreakdownModal from '@/components/mobile/TaskBreakdownModal'

<TaskBreakdownModal
  task={selectedTask}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubtaskCreate={handleSubtaskCreate}
/>
```
**Features**:
- AI-powered task breakdown suggestions
- Manual subtask creation
- Dependency mapping
- Estimated time allocation

---

#### RewardCelebration
**Purpose**: Animated celebration for task completion with particles
**Location**: [`src/components/mobile/RewardCelebration.tsx`](src/components/mobile/RewardCelebration.tsx)
**Key Props**:
```typescript
interface RewardCelebrationProps {
  isVisible: boolean
  onComplete: () => void
  xpGained: number
  achievementUnlocked?: Achievement
}
```
**Usage**:
```typescript
import RewardCelebration from '@/components/mobile/RewardCelebration'

<RewardCelebration
  isVisible={showCelebration}
  onComplete={() => setShowCelebration(false)}
  xpGained={50}
/>
```
**Features**:
- Particle physics animation (gravity, velocity)
- XP gain display
- Achievement unlock notification
- Auto-dismiss after 1500ms
- Design system standardized (physics constants, animation timing)

---

#### Ticker
**Purpose**: Rotating purpose/motivation ticker at top of mobile app
**Location**: [`src/components/mobile/Ticker.tsx`](src/components/mobile/Ticker.tsx)
**Key Props**:
```typescript
interface TickerProps {
  messages: string[]
  interval?: number  // milliseconds
}
```
**Usage**:
```typescript
import Ticker from '@/components/mobile/Ticker'

<Ticker
  messages={['Stay focused', 'You got this', 'One step at a time']}
  interval={6000}
/>
```
**Features**:
- Smooth fade transitions
- Random interval variation (4000-8000ms by default)
- Proper cleanup on unmount

---

#### EnergyGauge
**Purpose**: Visual energy level indicator (battery-style)
**Location**: [`src/components/mobile/EnergyGauge.tsx`](src/components/mobile/EnergyGauge.tsx)
**Key Props**:
```typescript
interface EnergyGaugeProps {
  level: number  // 0-100
  label?: string
}
```
**Usage**:
```typescript
import EnergyGauge from '@/components/mobile/EnergyGauge'

<EnergyGauge level={75} label="Energy" />
```
**Features**:
- Color-coded levels (red, yellow, green)
- Smooth animations
- Battery-style visualization

---

#### CaptureLoading
**Purpose**: Loading animation for task capture processing
**Location**: [`src/components/mobile/CaptureLoading.tsx`](src/components/mobile/CaptureLoading.tsx)
**Key Props**:
```typescript
interface CaptureLoadingProps {
  stage: 'listening' | 'processing' | 'saving'
}
```
**Usage**:
```typescript
import CaptureLoading from '@/components/mobile/CaptureLoading'

<CaptureLoading stage="processing" />
```
**Features**:
- 3-stage animation
- Stage-specific messages
- Smooth transitions

---

#### TaskDropAnimation
**Purpose**: Animation for task "dropping" into the system
**Location**: [`src/components/mobile/TaskDropAnimation.tsx`](src/components/mobile/TaskDropAnimation.tsx)
**Key Props**:
```typescript
interface TaskDropAnimationProps {
  task: Task
  onComplete: () => void
}
```
**Usage**:
```typescript
import TaskDropAnimation from '@/components/mobile/TaskDropAnimation'

<TaskDropAnimation
  task={newTask}
  onComplete={() => console.log('Animation complete')}
/>
```
**Features**:
- Gravity-based physics
- Bounce effect
- Fade out

---

#### ExpandableTile
**Purpose**: Expandable content tile with smooth animation
**Location**: [`src/components/mobile/ExpandableTile.tsx`](src/components/mobile/ExpandableTile.tsx)
**Key Props**:
```typescript
interface ExpandableTileProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
}
```
**Usage**:
```typescript
import ExpandableTile from '@/components/mobile/ExpandableTile'

<ExpandableTile title="Task Details">
  <p>Details content here</p>
</ExpandableTile>
```
**Features**:
- Smooth expand/collapse
- Chevron icon rotation
- Accessibility support

---

### Card Components

#### TaskCardBig
**Purpose**: Large task card for mobile task display
**Location**: [`src/components/mobile/cards/TaskCardBig.tsx`](src/components/mobile/cards/TaskCardBig.tsx)
**Key Props**:
```typescript
interface TaskCardBigProps {
  task: Task
  onTap: (task: Task) => void
  variant?: 'hero' | 'standard' | 'compact'
}
```
**Usage**:
```typescript
import TaskCardBig from '@/components/mobile/cards/TaskCardBig'

<TaskCardBig
  task={task}
  onTap={handleTap}
  variant="hero"
/>
```
**Features**:
- Variable sizes based on variant
- Priority color coding
- Time estimation display
- Digital/manual task indicator
- Hover effects

---

## 📊 Dashboard Components

#### StatsCard
**Purpose**: Display key metrics and statistics
**Location**: [`src/components/dashboard/StatsCard.tsx`](src/components/dashboard/StatsCard.tsx)
**Key Props**:
```typescript
interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}
```
**Usage**:
```typescript
import StatsCard from '@/components/dashboard/StatsCard'
import { CheckCircle } from 'lucide-react'

<StatsCard
  title="Tasks Completed"
  value={42}
  icon={<CheckCircle />}
  trend="up"
  trendValue="+12%"
/>
```
**Features**:
- Icon support
- Trend indicators
- Responsive layout

---

#### ProductivityChart
**Purpose**: Chart visualization for productivity metrics
**Location**: [`src/components/dashboard/ProductivityChart.tsx`](src/components/dashboard/ProductivityChart.tsx)
**Key Props**:
```typescript
interface ProductivityChartProps {
  data: ChartDataPoint[]
  type: 'line' | 'bar'
}
```
**Usage**:
```typescript
import ProductivityChart from '@/components/dashboard/ProductivityChart'

<ProductivityChart
  data={productivityData}
  type="line"
/>
```
**Features**:
- Line and bar chart support
- Responsive sizing
- Interactive tooltips

---

#### AgentCard
**Purpose**: Display proxy agent status and metrics
**Location**: [`src/components/dashboard/AgentCard.tsx`](src/components/dashboard/AgentCard.tsx)
**Key Props**:
```typescript
interface AgentCardProps {
  agent: ProxyAgent
  metrics: AgentMetrics
}
```
**Usage**:
```typescript
import AgentCard from '@/components/dashboard/AgentCard'

<AgentCard
  agent={taskProxyAgent}
  metrics={agentMetrics}
/>
```
**Features**:
- Agent status indicator
- Performance metrics
- Activity log

---

#### ActivityFeed
**Purpose**: Real-time feed of user activities and agent actions
**Location**: [`src/components/dashboard/ActivityFeed.tsx`](src/components/dashboard/ActivityFeed.tsx)
**Key Props**:
```typescript
interface ActivityFeedProps {
  activities: Activity[]
  limit?: number
}
```
**Usage**:
```typescript
import ActivityFeed from '@/components/dashboard/ActivityFeed'

<ActivityFeed
  activities={recentActivities}
  limit={10}
/>
```
**Features**:
- Real-time updates
- Activity type icons
- Timestamp display
- Scrollable list

---

## ✅ Task Components

#### TaskDashboard
**Purpose**: Main task management dashboard
**Location**: [`src/components/tasks/TaskDashboard.tsx`](src/components/tasks/TaskDashboard.tsx)
**Key Props**: None (standalone component)
**Usage**:
```typescript
import TaskDashboard from '@/components/tasks/TaskDashboard'

<TaskDashboard />
```
**Features**:
- QuickCapture integration
- TaskList integration
- Filter and sort controls

---

#### QuickCapture
**Purpose**: Fast task input with voice support
**Location**: [`src/components/tasks/QuickCapture.tsx`](src/components/tasks/QuickCapture.tsx)
**Key Props**:
```typescript
interface QuickCaptureProps {
  onTaskCreated: (task: Task) => void
  autoFocus?: boolean
}
```
**Usage**:
```typescript
import QuickCapture from '@/components/tasks/QuickCapture'

<QuickCapture
  onTaskCreated={handleTaskCreated}
  autoFocus={true}
/>
```
**Features**:
- Text input
- Voice input button
- Location awareness
- 2-second capture target
- Optimistic UI updates

---

#### TaskList
**Purpose**: Display and manage list of tasks
**Location**: [`src/components/tasks/TaskList.tsx`](src/components/tasks/TaskList.tsx)
**Key Props**:
```typescript
interface TaskListProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  filter?: TaskFilter
}
```
**Usage**:
```typescript
import TaskList from '@/components/tasks/TaskList'

<TaskList
  tasks={tasks}
  onTaskUpdate={handleUpdate}
  onTaskDelete={handleDelete}
  filter={{ status: 'active' }}
/>
```
**Features**:
- Filterable task list
- Inline editing
- Bulk actions
- Virtual scrolling for large lists

---

#### SimpleTaskList
**Purpose**: Simplified task list for embedded views
**Location**: [`src/components/tasks/SimpleTaskList.tsx`](src/components/tasks/SimpleTaskList.tsx)
**Key Props**:
```typescript
interface SimpleTaskListProps {
  tasks: Task[]
  onTaskClick?: (task: Task) => void
}
```
**Usage**:
```typescript
import SimpleTaskList from '@/components/tasks/SimpleTaskList'

<SimpleTaskList
  tasks={tasks}
  onTaskClick={handleClick}
/>
```
**Features**:
- Minimal UI
- Click-to-view details
- Compact layout

---

## 🧩 System Components

These are reusable design system components that provide consistent UI patterns.

#### SystemButton
**Purpose**: Standardized button component with design system tokens
**Location**: [`src/components/system/SystemButton.tsx`](src/components/system/SystemButton.tsx)
**Key Props**:
```typescript
interface SystemButtonProps {
  variant: 'primary' | 'secondary' | 'danger'
  size: 'sm' | 'base' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}
```
**Usage**:
```typescript
import SystemButton from '@/components/system/SystemButton'

<SystemButton
  variant="primary"
  size="base"
  onClick={handleClick}
>
  Click me
</SystemButton>
```
**Features**:
- Design system standardized
- Multiple variants and sizes
- Loading state support
- Disabled state

---

#### SystemInput
**Purpose**: Standardized input component
**Location**: [`src/components/system/SystemInput.tsx`](src/components/system/SystemInput.tsx)
**Key Props**:
```typescript
interface SystemInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password'
  error?: string
}
```
**Usage**:
```typescript
import SystemInput from '@/components/system/SystemInput'

<SystemInput
  value={inputValue}
  onChange={setInputValue}
  placeholder="Enter text"
  error={validationError}
/>
```
**Features**:
- Design system styling
- Error state display
- Type variants
- Accessibility support

---

#### SystemCard
**Purpose**: Standardized card container
**Location**: [`src/components/system/SystemCard.tsx`](src/components/system/SystemCard.tsx)
**Key Props**:
```typescript
interface SystemCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated'
  padding?: SpacingKey
}
```
**Usage**:
```typescript
import SystemCard from '@/components/system/SystemCard'

<SystemCard variant="elevated" padding={4}>
  <h3>Card Title</h3>
  <p>Card content</p>
</SystemCard>
```
**Features**:
- Design system standardized
- Hover effects
- Shadow variants
- Flexible padding

---

#### SystemBadge
**Purpose**: Standardized badge/tag component
**Location**: [`src/components/system/SystemBadge.tsx`](src/components/system/SystemBadge.tsx)
**Key Props**:
```typescript
interface SystemBadgeProps {
  children: React.ReactNode
  variant: 'success' | 'warning' | 'error' | 'info'
}
```
**Usage**:
```typescript
import SystemBadge from '@/components/system/SystemBadge'

<SystemBadge variant="success">Completed</SystemBadge>
<SystemBadge variant="warning">Urgent</SystemBadge>
```
**Features**:
- Color-coded variants
- Compact design
- Pill shape

---

#### SystemToast
**Purpose**: Toast notification component
**Location**: [`src/components/system/SystemToast.tsx`](src/components/system/SystemToast.tsx)
**Key Props**:
```typescript
interface SystemToastProps {
  message: string
  variant: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}
```
**Usage**:
```typescript
import SystemToast from '@/components/system/SystemToast'

<SystemToast
  message="Task created successfully!"
  variant="success"
  duration={3000}
  onClose={handleClose}
/>
```
**Features**:
- Auto-dismiss
- Manual close button
- Variant styling
- Animation on enter/exit

---

#### SystemModal
**Purpose**: Standardized modal dialog
**Location**: [`src/components/system/SystemModal.tsx`](src/components/system/SystemModal.tsx)
**Key Props**:
```typescript
interface SystemModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}
```
**Usage**:
```typescript
import SystemModal from '@/components/system/SystemModal'

<SystemModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Edit Task"
  size="md"
>
  <TaskEditForm />
</SystemModal>
```
**Features**:
- Backdrop with z-index layering
- Escape key to close
- Click outside to close
- Scroll lock on body
- Size variants

---

## 🎨 UI Primitives

#### Card
**Purpose**: shadcn/ui card component
**Location**: [`src/components/ui/card.tsx`](src/components/ui/card.tsx)
**Usage**:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
</Card>
```
**Features**:
- Compound component pattern
- Header/Content/Footer sections
- Tailwind styling

---

## 🔗 Shared Components

#### AsyncJobTimeline
**Purpose**: Timeline visualization for async job processing with SVG chevron steps
**Location**: [`src/components/shared/AsyncJobTimeline.tsx`](src/components/shared/AsyncJobTimeline.tsx)
**Key Props**:
```typescript
interface AsyncJobTimelineProps {
  jobName: string
  steps: JobStep[]
  currentProgress: number  // 0-100
  size?: 'full' | 'micro' | 'nano'
  onStepClick?: (stepId: string) => void
  onRetryStep?: (stepId: string) => void
  showProgressBar?: boolean
}
```
**Usage**:
```typescript
import AsyncJobTimeline from '@/components/shared/AsyncJobTimeline'

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
  onStepClick={handleStepClick}
/>
```
**Features**:
- Step-by-step progress with SVG chevrons
- Three size variants (full: 64px, micro: 40px, nano: 32px)
- Status indicators (pending, active, done, error)
- Interactive step expansion/collapse
- Hierarchical decomposition support
- Progress bars for active steps
- Solarized color palette
- Smooth animations

**Size Variants**:
- `full` - Main task decomposition view (64px height, full details)
- `micro` - Nested sub-tasks (40px height, icons float above)
- `nano` - Minimal progress indicator (32px height, numbers only)

---

#### ChevronStep
**Purpose**: SVG-based chevron shape for step progression visualization
**Location**: [`src/components/mobile/ChevronStep.tsx`](src/components/mobile/ChevronStep.tsx)
**Key Props**:
```typescript
interface ChevronStepProps {
  status: 'pending' | 'active' | 'done' | 'error'
  position: 'first' | 'middle' | 'last' | 'single'
  size: 'full' | 'micro' | 'nano'
  children?: ReactNode
  onClick?: () => void
  isExpanded?: boolean
  width?: number | string
}
```
**Usage**:
```typescript
import ChevronStep, { CollapsedChevron } from '@/components/mobile/ChevronStep'

// Full content chevron
<ChevronStep
  status="active"
  position="middle"
  size="full"
  onClick={handleClick}
>
  <span>Step content</span>
</ChevronStep>

// Collapsed variant (just step number)
<CollapsedChevron
  stepNumber={2}
  status="pending"
  position="last"
  size="micro"
/>
```
**Features**:
- Clean SVG rendering with proper stroke-based borders
- Four position variants (first, middle, last, single)
- Four status variants with Solarized colors
- Three size variants (full: 64px, micro: 40px, nano: 32px)
- Smooth hover effects
- Active state pulsing glow animation
- Active state shimmer effect
- Content slot for flexible layouts
- Better browser compatibility than clip-path

**Why SVG over clip-path?**
- Crisp rendering across all browsers (especially mobile)
- True stroke-based borders (no margin hacks)
- Better performance with GPU acceleration
- Easier to maintain and customize
- No visual artifacts or rendering inconsistencies

**Color Mapping (Solarized)**:
- `pending`: Light cream fill (#fdf6e3), gray border (#586e75)
- `active`: Cream fill (#eee8d5), blue border (#268bd2) + glow
- `done`: Dark fill (#073642), green border (#859900)
- `error`: Red fill (#dc322f), red border (#dc322f)

**Position Shapes**:
- `first`: Flat left edge, chevron point right →
- `middle`: Chevron points on both sides >→<
- `last`: Chevron point left, flat right edge ←
- `single`: Flat rectangle (no chevron points)

---

#### ErrorBoundary
**Purpose**: React error boundary for error handling
**Location**: [`src/components/ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx)
**Key Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}
```
**Usage**:
```typescript
import ErrorBoundary from '@/components/ErrorBoundary'

<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>
```
**Features**:
- Catches React errors
- Custom fallback UI
- Error logging
- Reset functionality

---

#### PerformanceOptimizer
**Purpose**: Performance monitoring and optimization wrapper
**Location**: [`src/components/PerformanceOptimizer.tsx`](src/components/PerformanceOptimizer.tsx)
**Key Props**:
```typescript
interface PerformanceOptimizerProps {
  children: React.ReactNode
  componentName: string
}
```
**Usage**:
```typescript
import PerformanceOptimizer from '@/components/PerformanceOptimizer'

<PerformanceOptimizer componentName="TaskList">
  <TaskList tasks={tasks} />
</PerformanceOptimizer>
```
**Features**:
- Render performance tracking
- Automatic memoization
- Performance warnings
- DevTools integration

---

## 📝 Component Creation Checklist

Before creating a new component, check:

- [ ] **Search this file** (Cmd+F / Ctrl+F) for similar components
- [ ] **Check the component directory** in VS Code explorer
- [ ] **Review [DONT_RECREATE.md](./DONT_RECREATE.md)** for existing utilities/hooks
- [ ] **Copy [_TEMPLATE.tsx](./src/components/_TEMPLATE.tsx)** as starting point
- [ ] **Import design system tokens** - Never hardcode values
- [ ] **Add TypeScript types** for all props
- [ ] **Write JSDoc comments** explaining purpose and usage
- [ ] **Test in browser** before committing
- [ ] **Add to this catalog** with usage examples

---

## 🔧 How to Update This Catalog

When you create a new component:

1. Add an entry in the appropriate category
2. Include:
   - Component name and purpose
   - File location with link
   - TypeScript props interface
   - Usage example with imports
   - Key features list
3. Keep entries alphabetically sorted within categories
4. Update the Table of Contents if adding a new category

---

**Last Updated**: 2025-10-23
**Total Components**: 50+

**Remember**: If you can't find a component here, it might not exist yet! But always check first before creating.
