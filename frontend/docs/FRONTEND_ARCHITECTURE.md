# Frontend Architecture - ADHD Task Management System

## 🎯 Overview

This is a Next.js 14 (App Router) frontend for an ADHD-optimized task management system built around **5 biological circuits**: Capture, Scout, Hunter, Mender, and Mapper.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── mobile/            # Mobile ADHD interface (PRIMARY)
│   │   │   ├── page.tsx       # Main mobile app shell
│   │   │   ├── capture/       # Capture mode (brain dump)
│   │   │   ├── mobile.css     # Mobile-specific styles
│   │   │   └── README.md      # ADHD system documentation
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Desktop homepage
│   │
│   ├── components/
│   │   ├── mobile/            # Mobile-first ADHD components
│   │   │   ├── modes/         # 5 biological mode components
│   │   │   │   ├── CaptureMode.tsx
│   │   │   │   ├── ScoutMode.tsx
│   │   │   │   ├── HunterMode.tsx
│   │   │   │   ├── MenderMode.tsx
│   │   │   │   └── MapperMode.tsx
│   │   │   ├── BiologicalTabs.tsx      # Bottom navigation
│   │   │   ├── SwipeableTaskCard.tsx   # Tinder-style cards
│   │   │   ├── EnergyGauge.tsx         # Energy visualization
│   │   │   ├── AsyncJobTimeline.tsx    # Task breakdown progress
│   │   │   ├── TaskBreakdownModal.tsx  # Post-capture modal
│   │   │   ├── CardStack.tsx           # Swipeable card stack
│   │   │   └── ...                     # Other mobile components
│   │   └── shared/            # Shared components
│   │
│   ├── lib/                   # Core utilities
│   │   ├── design-system.ts   # Design tokens (spacing, colors, etc.)
│   │   ├── api.ts            # API client with type-safe methods
│   │   ├── utils.ts          # Utility functions
│   │   └── hierarchy-config.ts # Task hierarchy configuration
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useVoiceInput.ts  # Web Speech API wrapper
│   │   └── useWebSocket.ts   # Real-time updates
│   │
│   ├── types/                # TypeScript types
│   │   └── capture.ts        # Capture-related types
│   │
│   └── utils/                # Helper utilities
│       └── colorBlending.ts  # Color interpolation
│
├── public/                   # Static assets
├── docs/                     # Documentation (this folder)
└── package.json
```

## 🧠 The 5 Biological Modes

### Architecture Pattern

Each mode follows the same component structure:

```typescript
interface ModeProps {
  onTaskTap?: (task: Task) => void;
  onSwipeLeft?: (task: Task) => void;
  onSwipeRight?: (task: Task) => void;
  refreshTrigger?: number;
  energy?: number;
  xp?: number;
  level?: number;
  streakDays?: number;
}

// All modes are isolated, stateless components
// Parent (page.tsx) manages global state and coordination
```

### 1. Capture Mode 🎯

**Purpose**: Brain dump with minimal friction

**Location**: `src/components/mobile/modes/CaptureMode.tsx`

**Key Features**:
- Large textarea for natural language input
- Voice input support
- Quick suggestion examples
- Auto/Manual mode toggle
- Recent task previews

**State Management**:
```typescript
// Parent manages:
const [chat, setChat] = useState('')
const [isProcessing, setIsProcessing] = useState(false)
const [capturedTask, setCapturedTask] = useState<QuickCaptureResponse | null>(null)

// API call:
const response = await apiClient.quickCapture({
  text: taskText,
  user_id: 'mobile-user',
  voice_input: wasVoiceInput,
  auto_mode: autoMode
})
```

### 2. Scout Mode 🔍

**Purpose**: Discover and organize tasks

**Location**: `src/components/mobile/modes/ScoutMode.tsx`

**Key Features**:
- **Discover** sub-mode: Browse tasks by category
- **Organize** sub-mode: Inbox processing with swipe
- Mystery task bonuses (15% chance)
- Category-based organization:
  - Main Focus (high priority)
  - Urgent Today (due today)
  - Quick Wins (<15 min)
  - This Week (upcoming)
  - Can Delegate (digital tasks)
  - Someday/Maybe (low priority)

**Component Structure**:
```typescript
<ScoutMode>
  <CategoryRow title="Main Focus" tasks={mainFocusTasks} />
  <CategoryRow title="Quick Wins" tasks={quickWins} cardSize="compact" />
  {showMysteryTask && <CategoryRow title="Mystery Task" isMystery={true} />}
</ScoutMode>
```

### 3. Hunter Mode 🎯

**Purpose**: Single-task execution focus

**Location**: `src/components/mobile/modes/HunterMode.tsx`

**Key Features**:
- Full-screen task cards
- Swipe left = dismiss, Swipe right = do/delegate
- Streak counter for motivation
- Progress bar showing completion %
- Minimal UI during work

**Component Structure**:
```typescript
<HunterMode>
  <CardStack
    tasks={sortedTasks}
    onSwipeLeft={handleSwipeLeft}
    onSwipeRight={handleSwipeRight}
    onTap={onTaskTap}
  />
</HunterMode>
```

### 4. Mender Mode 💙

**Purpose**: Energy recovery and reflection

**Location**: `src/components/mobile/modes/MenderMode.tsx`

**Key Features**:
- Circular energy gauge
- 5-minute recovery tasks
- Mystery box rewards (every 3 sessions)
- Energy-aware recommendations

**Component Structure**:
```typescript
<MenderMode>
  <EnergyGauge energy={energy} trend="rising" variant="expanded" />
  <CategoryRow title="5-Min Wins" tasks={quickRecoveryTasks} />
</MenderMode>
```

### 5. Mapper Mode 🗺️

**Purpose**: Progress tracking and planning

**Location**: `src/components/mobile/modes/MapperMode.tsx`

**Key Features**:
- XP, level, and streak visualization
- Achievement gallery
- Weekly reflection prompts
- Task category breakdowns

## 🎨 Design System

**Location**: `src/lib/design-system.ts`

### Core Tokens

```typescript
// Spacing (4px grid)
spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  // ... up to 96
}

// Colors (Solarized theme)
colors = {
  cyan: '#2aa198',      // Primary accent
  blue: '#268bd2',      // Secondary accent
  green: '#859900',     // Success
  yellow: '#b58900',    // Warning
  orange: '#cb4b16',    // Alert
  red: '#dc322f',       // Error/Urgent
  magenta: '#d33682',   // Special
  violet: '#6c71c4',    // Info
}

// Semantic colors (auto dark mode)
semanticColors = {
  bg: { primary, secondary, tertiary },
  text: { primary, secondary, inverse },
  border: { default, accent },
  accent: { primary, secondary, success, warning, error }
}

// Font sizes
fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  // ... up to 4xl
}
```

### Usage Pattern

```typescript
import { spacing, semanticColors, fontSize } from '@/lib/design-system'

<div style={{
  padding: spacing[4],
  backgroundColor: semanticColors.bg.primary,
  color: semanticColors.text.primary,
  fontSize: fontSize.base
}}>
  Content
</div>
```

## 🔌 API Integration

**Location**: `src/lib/api.ts`

### API Client

```typescript
import { apiClient } from '@/lib/api'

// Quick capture (main API for Capture mode)
const response = await apiClient.quickCapture({
  text: 'Buy groceries and clean house',
  user_id: 'mobile-user',
  voice_input: false,
  auto_mode: true
})

// Fetch tasks (for Scout/Hunter modes)
const tasks = await apiClient.getTasks({
  user_id: 'mobile-user',
  limit: 50,
  status: 'pending,in_progress'
})

// Energy tracking (for Mender mode)
const energyData = await apiClient.getEnergyLevel('mobile-user')

// Progress stats (for Mapper mode)
const stats = await apiClient.getProgressStats('mobile-user')
```

### API Response Types

```typescript
interface QuickCaptureResponse {
  task: Task
  micro_steps: MicroStep[]
  xp_earned?: number
  message: string
}

interface Task {
  task_id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'high' | 'medium' | 'low'
  estimated_hours?: number
  tags?: string[]
  is_digital?: boolean
  due_date?: string
}

interface MicroStep {
  step_id: string
  description: string
  short_label: string
  estimated_minutes: number
  leaf_type: 'DIGITAL' | 'HUMAN'
  is_leaf: boolean
  tags?: string[]
  // Hierarchy fields
  parent_step_id?: string
  level: number
  decomposition_state: 'atomic' | 'composite'
}
```

## 📱 Key Component Patterns

### 1. Swipeable Card Pattern

```typescript
import SwipeableTaskCard from '@/components/mobile/SwipeableTaskCard'

<SwipeableTaskCard
  task={task}
  onSwipeLeft={(task) => console.log('Dismissed:', task)}
  onSwipeRight={(task) => console.log('Accepted:', task)}
  onTap={(task) => console.log('View details:', task)}
  isActive={true}
/>
```

**Features**:
- Touch-optimized swipe detection
- Visual feedback for swipe direction
- Hold-to-view with circular progress
- Priority-based color coding
- Digital task indicators

### 2. Energy Gauge Pattern

```typescript
import EnergyGauge from '@/components/mobile/EnergyGauge'

// Expanded variant (for Mender mode)
<EnergyGauge
  energy={72}
  trend="rising"
  predictedNextHour={75}
  variant="expanded"
/>

// Micro variant (for compact display)
<EnergyGauge energy={72} variant="micro" />
```

### 3. Async Job Timeline Pattern

```typescript
import AsyncJobTimeline from '@/components/shared/AsyncJobTimeline'

<AsyncJobTimeline
  jobName="Buy groceries"
  steps={[
    { id: 'parse', description: 'Parse input', status: 'done' },
    { id: 'llm', description: 'Break down task', status: 'active' },
    { id: 'save', description: 'Save to DB', status: 'pending' }
  ]}
  currentProgress={45}
  size="full"
  showProgressBar={true}
  onDismiss={() => console.log('Dismissed')}
/>
```

### 4. Category Row Pattern

```typescript
import CategoryRow from '@/components/mobile/CategoryRow'

<CategoryRow
  title="Quick Wins"
  icon={<Target size={16} />}
  tasks={quickWinTasks}
  onTaskTap={handleTaskTap}
  cardSize="compact"  // or "default" or "hero"
/>
```

## 🎣 Custom Hooks

### Voice Input Hook

```typescript
import { useVoiceInput } from '@/hooks/useVoiceInput'

const {
  isListening,
  transcript,
  interimTranscript,
  startListening,
  stopListening,
  resetTranscript,
  isSupported,
  error
} = useVoiceInput({
  onTranscript: (text) => setChat(text),
  onError: (error) => console.error(error)
})
```

### WebSocket Hook (currently disabled)

```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

const { isConnected } = useWebSocket({
  userId: 'mobile-user',
  onMessage: (message) => handleRealtimeUpdate(message),
  reconnectInterval: 3000
})
```

## 🚀 Common Development Tasks

### Adding a New Mode

1. Create mode component in `src/components/mobile/modes/NewMode.tsx`
2. Add to `BiologicalTabs.tsx` circuit definition
3. Import and render in `src/app/mobile/page.tsx`
4. Add to mode type: `type Mode = 'capture' | 'scout' | 'hunt' | 'mender' | 'mapper' | 'newmode'`

### Adding a New Component

1. Create in `src/components/mobile/YourComponent.tsx`
2. Follow design system tokens from `lib/design-system.ts`
3. Use TypeScript interfaces for props
4. Export as default

### Styling Best Practices

```typescript
// ✅ Good - Use design system tokens
import { spacing, semanticColors } from '@/lib/design-system'
style={{ padding: spacing[4], color: semanticColors.text.primary }}

// ❌ Bad - Hardcoded values
style={{ padding: '16px', color: '#93a1a1' }}

// ✅ Good - Semantic colors (auto dark mode)
backgroundColor: semanticColors.bg.primary

// ❌ Bad - Direct color values
backgroundColor: '#002b36'
```

## 🐛 Common Issues & Solutions

### Issue: Tasks not loading

**Solution**: Check API URL in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Issue: Voice input not working

**Solution**:
1. Check browser compatibility (Chrome/Edge only)
2. Ensure HTTPS or localhost
3. Grant microphone permissions

### Issue: Animations stuttering

**Solution**: Use CSS transforms instead of position changes:
```typescript
// ✅ Good - GPU accelerated
transform: `translateX(${offset}px)`

// ❌ Bad - Causes repaints
left: `${offset}px`
```

## 📊 Performance Optimization

### Component Optimization

```typescript
// Use React.memo for expensive components
export default React.memo(ExpensiveComponent)

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies])

// Use useMemo for computed values
const sortedTasks = useMemo(() =>
  tasks.sort((a, b) => a.priority - b.priority),
  [tasks]
)
```

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/image.png"
  width={200}
  height={200}
  alt="Description"
  priority={isAboveFold}
/>
```

## 🧪 Testing Guidelines

### Component Testing

```typescript
import { render, screen } from '@testing-library/react'
import EnergyGauge from '@/components/mobile/EnergyGauge'

test('renders energy percentage', () => {
  render(<EnergyGauge energy={72} />)
  expect(screen.getByText('72%')).toBeInTheDocument()
})
```

### API Testing

```typescript
import { apiClient } from '@/lib/api'

// Mock API responses in tests
jest.mock('@/lib/api', () => ({
  apiClient: {
    quickCapture: jest.fn().mockResolvedValue({
      task: mockTask,
      micro_steps: mockSteps
    })
  }
}))
```

## 📚 Additional Resources

- **ADHD UX Documentation**: `frontend/src/app/mobile/README.md`
- **Master ADHD Document**: `docs/ADHD_TASK_MANAGEMENT_MASTER.md`
- **Design System**: `frontend/src/lib/design-system.ts`
- **API Schemas**: `API_schemas/`
- **Component Stories**: `frontend/src/components/mobile/*.stories.tsx`

## 🤝 Contributing

### Code Style

- Follow TypeScript strict mode
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components under 300 lines
- Write self-documenting code with clear names

### Commit Messages

```bash
feat(mobile): add mystery task bonus to Scout mode
fix(energy): correct energy gauge color interpolation
docs(frontend): update component library reference
style(mobile): apply 4px grid to Capture mode
```

## 🔮 Future Enhancements

- [ ] Offline support with service workers
- [ ] Push notifications for task reminders
- [ ] Body doubling integration (virtual co-working)
- [ ] Wearable device integration
- [ ] Advanced analytics dashboard
- [ ] Social accountability features

---

**Last Updated**: 2025-10-25

**Maintainers**: Frontend Team

**Questions?** Check the docs folder or create an issue.
