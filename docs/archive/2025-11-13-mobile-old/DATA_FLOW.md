# Complete Data Flow Documentation
## Proxy Agent Platform - Mobile App

**Date**: November 4, 2025
**Status**: System Analysis Complete

---

## Table of Contents
1. [System Overview](#system-overview)
2. [The Beast Loop Flow](#the-beast-loop-flow)
3. [Capture Mode Data Flow](#capture-mode-data-flow)
4. [Scout Mode Data Flow](#scout-mode-data-flow)
5. [Hunter Mode Data Flow](#hunter-mode-data-flow)
6. [Integration Status](#integration-status)

---

## System Overview

### The Three-Mode System

The app operates in three distinct biological rhythm modes:

```
CAPTURE (🎤) → SCOUT (🔍) → HUNTER (🎯)
    ↓              ↓              ↓
  Add tasks    Organize &     Execute with
  & ideas       prioritize      laser focus
```

### Architecture Pattern

```
Mobile UI (React Native)
      ↓
API Layer (FastAPI - Python)
      ↓
Agent System (AI-powered)
      ↓
Database (SQLite + Enhanced Adapter)
```

---

## The Beast Loop Flow

### Complete User Journey

```
Morning (7-9am): CAPTURE MODE
└─> User brain-dumps tasks into capture/add
    ├─> Text input: "Plan mom's birthday party"
    ├─> Voice input: [Speech-to-text]
    └─> Gmail integration: Auto-capture from emails

    Backend Processing:
    ├─> CaptureAgent analyzes input
    ├─> DecomposerAgent breaks into micro-steps (2-5 min each)
    ├─> ClassifierAgent tags with CHAMPS framework
    └─> Returns: task + micro_steps + clarifications

    If clarifications needed:
    └─> Route to capture/clarify
        └─> User answers questions
            └─> Re-classify with answers
                └─> Save to database

    Else:
    └─> Auto-save to database
        └─> Redirect to Scout Mode

Midday (9am-5pm): SCOUT MODE
└─> User opens scout tab
    ├─> Loads all tasks from database
    ├─> Applies filters (energy, time, zone, CHAMPS tags)
    ├─> Shows organized list
    └─> User taps task → TaskBreakdownModal
        ├─> See full micro-step breakdown
        ├─> Estimate: "15 min total"
        └─> Decision: Swipe right → Start in Hunter

Afternoon/Evening: HUNTER MODE
└─> User focuses on ONE task
    ├─> Full-screen immersive UI
    ├─> Shows current micro-step (1 of 5)
    ├─> Timer countdown (5 min remaining)
    └─> Swipe gestures:
        ├─> Swipe Up: Complete step → +XP → Next step
        ├─> Swipe Left: Skip/archive
        ├─> Swipe Right: Delegate to AI agent
        └─> Swipe Down: Need help/split further

    On completion:
    └─> Celebration animation
        └─> XP awarded
            └─> Next task recommendation
```

---

## Capture Mode Data Flow

### 1. Quick Add (capture/add.tsx)

**Current Status**: ❌ PLACEHOLDER (needs implementation)

**Intended Flow**:

```typescript
// USER INTERACTION
User opens capture/add tab
  ↓
Types: "Buy groceries for the week"
  ↓
Presses "Capture" button
  ↓
FRONTEND: mobile/app/(tabs)/capture/add.tsx
```

**API Call**:
```typescript
POST http://localhost:8000/api/v1/capture/
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "query": "Buy groceries for the week",
  "user_id": "user_123",
  "mode": "auto"  // or "manual" or "clarify"
}
```

**Backend Processing**:
```python
# File: src/api/capture.py
@router.post("/", response_model=CaptureResponse)
async def create_capture(request: CaptureRequest):
    # Step 1: CaptureAgent analyzes input
    capture_agent = CaptureAgent()
    result = await capture_agent.capture(
        text=request.query,
        mode=CaptureMode(request.mode)
    )

    # Step 2: DecomposerAgent breaks into micro-steps
    decomposer = DecomposerAgent()
    micro_steps = await decomposer.decompose_task(result.task)

    # Step 3: ClassifierAgent tags and classifies
    classifier = ClassifierAgent()
    classified_steps = await classifier.classify(micro_steps)

    # Step 4: Return response
    return CaptureResponse(
        task=result.task.dict(),
        micro_steps=[step.dict() for step in classified_steps],
        clarifications=result.clarifications,
        ready_to_save=len(result.clarifications) == 0,
        mode=request.mode
    )
```

**Response Example**:
```json
{
  "task": {
    "task_id": "task_abc123",
    "title": "Buy groceries for the week",
    "description": "Purchase all necessary groceries...",
    "estimated_minutes": 45,
    "priority": "medium"
  },
  "micro_steps": [
    {
      "step_id": "step_1",
      "description": "Make grocery list from meal plan",
      "estimated_minutes": 5,
      "delegation_mode": "do",
      "leaf_type": "human",
      "icon": "📝",
      "short_label": "List",
      "tags": ["CHAMPS:Clarity", "energy:low"]
    },
    {
      "step_id": "step_2",
      "description": "Check pantry and fridge inventory",
      "estimated_minutes": 3,
      "delegation_mode": "do",
      "leaf_type": "human",
      "icon": "🔍",
      "short_label": "Check",
      "tags": ["CHAMPS:Action", "energy:medium"]
    },
    {
      "step_id": "step_3",
      "description": "Drive to grocery store",
      "estimated_minutes": 10,
      "delegation_mode": "do",
      "leaf_type": "human",
      "icon": "🚗",
      "short_label": "Drive"
    },
    {
      "step_id": "step_4",
      "description": "Shop for items on list",
      "estimated_minutes": 20,
      "delegation_mode": "do",
      "leaf_type": "human",
      "icon": "🛒",
      "short_label": "Shop"
    },
    {
      "step_id": "step_5",
      "description": "Checkout and drive home",
      "estimated_minutes": 7,
      "delegation_mode": "do",
      "leaf_type": "human",
      "icon": "💳",
      "short_label": "Checkout"
    }
  ],
  "clarifications": [],
  "ready_to_save": true,
  "mode": "auto"
}
```

**Frontend Display**:
```typescript
// Show loading state with AsyncJobTimeline component
<AsyncJobTimeline
  micro_steps={response.micro_steps}
  isProcessing={false}
/>

// Show TaskBreakdownModal with results
<TaskBreakdownModal
  captureResponse={response}
  isOpen={true}
  onClose={() => {...}}
  onSaveTask={async () => {
    // Call save endpoint
    await POST("/api/v1/capture/save", {
      task: response.task,
      micro_steps: response.micro_steps,
      user_id: currentUser.id
    });

    // Navigate to Scout mode
    router.push("/scout");
  }}
/>
```

### 2. Clarification Flow (capture/clarify.tsx)

**Current Status**: ⚠️ EXISTS (needs verification)

**Flow**:
```
User receives clarifications from capture
  ↓
Navigated to capture/clarify
  ↓
Shows questions:
  - "What's your budget for groceries?"
  - "Any dietary restrictions?"
  ↓
User answers
  ↓
POST /api/v1/capture/clarify
  ↓
Backend re-classifies with answers
  ↓
Returns updated micro-steps
  ↓
Auto-save and redirect to Scout
```

### 3. Gmail Integration (capture/connect.tsx)

**Current Status**: ✅ WORKING

**Flow**:
```
User taps "Connect Gmail"
  ↓
Initiates OAuth flow
  ↓
Browser opens Google login
  ↓
User approves permissions
  ↓
Deep link callback: exp://oauth/callback
  ↓
Integration saved to backend
  ↓
Status updates to "connected"
```

---

## Scout Mode Data Flow

### Overview

**Current Status**: ❌ PLACEHOLDER (needs implementation)

**Purpose**: Browse, filter, and organize all captured tasks

**Intended Flow**:

```typescript
// USER OPENS SCOUT TAB
User navigates to scout tab
  ↓
FRONTEND: mobile/app/(tabs)/scout.tsx
```

**API Call**:
```typescript
GET http://localhost:8000/api/v1/tasks?user_id=user_123&status=todo
Headers: {
  "Content-Type": "application/json"
}
```

**Backend Response**:
```json
{
  "tasks": [
    {
      "task_id": "task_001",
      "title": "Buy groceries for the week",
      "description": "Purchase all necessary groceries",
      "estimated_minutes": 45,
      "priority": "medium",
      "status": "todo",
      "energy_level": "medium",
      "zone_id": "life",
      "tags": ["CHAMPS:Action", "shopping"],
      "micro_steps_count": 5,
      "created_at": "2025-11-04T10:30:00Z"
    },
    {
      "task_id": "task_002",
      "title": "Prepare presentation for meeting",
      "description": "Create slides for quarterly review",
      "estimated_minutes": 60,
      "priority": "high",
      "status": "todo",
      "energy_level": "high",
      "zone_id": "work",
      "tags": ["CHAMPS:Productivity", "urgent"],
      "micro_steps_count": 8,
      "created_at": "2025-11-04T09:15:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

**Frontend Implementation Plan**:

```typescript
// scout.tsx
import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import TaskCard from '@/components/TaskCard';
import FilterBar from '@/components/FilterBar';

export default function ScoutScreen() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    energy: null,  // low, medium, high
    time: null,    // <15min, 15-30min, >30min
    zone: null,    // work, life, self
    tags: []       // CHAMPS tags
  });

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadTasks = async () => {
    const queryParams = new URLSearchParams({
      user_id: currentUser.id,
      status: 'todo',
      ...buildFilterQuery(filters)
    });

    const response = await fetch(
      `http://localhost:8000/api/v1/tasks?${queryParams}`
    );
    const data = await response.json();
    setTasks(data.tasks);
  };

  return (
    <View>
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
      />

      <ScrollView>
        {tasks.map(task => (
          <TaskCard
            key={task.task_id}
            task={task}
            onTap={() => showTaskBreakdown(task)}
            onSwipeRight={() => startInHunter(task)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
```

**Filter Examples**:

1. **Energy Filter**: Show only low-energy tasks when tired
2. **Time Filter**: Show tasks that fit in next 30 minutes
3. **Zone Filter**: Focus on "Work" tasks during work hours
4. **CHAMPS Tags**: Find all "Clarity" tasks to clean up ambiguity

---

## Hunter Mode Data Flow

### Overview

**Current Status**: ❌ PLACEHOLDER (needs implementation)

**Purpose**: Execute a single task with full focus and micro-step tracking

**Intended Flow**:

```typescript
// USER STARTS TASK FROM SCOUT
User swipes right on task in Scout
  ↓
Navigates to Hunter mode with task_id
  ↓
FRONTEND: mobile/app/(tabs)/hunter.tsx
```

**Initial API Call**:
```typescript
GET http://localhost:8000/api/v1/tasks/task_001
Headers: {
  "Content-Type": "application/json"
}
```

**Response**:
```json
{
  "task": {
    "task_id": "task_001",
    "title": "Buy groceries for the week",
    "description": "Purchase all necessary groceries",
    "estimated_minutes": 45,
    "status": "in_progress"
  },
  "micro_steps": [
    {
      "step_id": "step_1",
      "step_number": 1,
      "description": "Make grocery list from meal plan",
      "estimated_minutes": 5,
      "status": "todo",
      "completed": false,
      "icon": "📝",
      "short_label": "List"
    },
    {
      "step_id": "step_2",
      "step_number": 2,
      "description": "Check pantry and fridge inventory",
      "estimated_minutes": 3,
      "status": "todo",
      "completed": false,
      "icon": "🔍",
      "short_label": "Check"
    }
    // ... more steps
  ]
}
```

**Hunter UI Components**:

1. **Task Header**: Title + total progress (2/5 steps complete)
2. **Current Step Display**: Large, focused on ONE step
3. **Timer**: Countdown for estimated time (5:00 remaining)
4. **Swipe Zones**: Visual hints for gestures
5. **Progress Bar**: XP and completion percentage

**Swipe Actions**:

```typescript
// Swipe Up: Complete current step
async function handleSwipeUp(stepId: string) {
  await PUT(`/api/v1/tasks/steps/${stepId}/complete`, {
    completed: true,
    actual_minutes: timerElapsed
  });

  // Award XP
  const xp = calculateXP(timerElapsed, estimatedTime);
  showCelebration(xp);

  // Move to next step
  goToNextStep();
}

// Swipe Right: Delegate to agent
async function handleSwipeRight(stepId: string) {
  await POST(`/api/v1/tasks/steps/${stepId}/delegate`, {
    delegation_mode: "delegate",
    auto_assign: true
  });

  // Skip to next step
  goToNextStep();
}

// Swipe Left: Skip/archive
async function handleSwipeLeft(stepId: string) {
  await POST(`/api/v1/tasks/steps/${stepId}/archive`, {
    reason: "not_needed"
  });

  // Skip to next step
  goToNextStep();
}

// Swipe Down: Need help / split further
async function handleSwipeDown(stepId: string) {
  // Show help options or call split API
  const result = await POST(`/api/v1/tasks/steps/${stepId}/split`);

  // Replace current step with sub-steps
  replaceStepWithSubSteps(result.micro_steps);
}
```

---

## Integration Status

### ✅ Complete & Working

1. **Gmail OAuth** (capture/connect.tsx)
   - OAuth flow ✅
   - Deep linking ✅
   - Integration API ✅

2. **Task Splitting Backend** (Epic 7)
   - Split endpoint ✅
   - 51/51 tests passing ✅
   - Micro-step generation ✅

3. **Capture API** (backend)
   - Create capture ✅
   - Clarify endpoint ✅
   - Save endpoint ✅

4. **Existing Components** (frontend)
   - TaskBreakdownModal ✅
   - AsyncJobTimeline ✅
   - TaskCard components ✅

### ❌ Missing & Needs Implementation

1. **Capture/Add Screen** (mobile/app/(tabs)/capture/add.tsx)
   - Status: Placeholder only
   - Needed: Input UI + API integration
   - Estimated: 1-2 days

2. **Scout Screen** (mobile/app/(tabs)/scout.tsx)
   - Status: Placeholder only
   - Needed: Task list + filters + search
   - Estimated: 2-3 days

3. **Hunter Screen** (mobile/app/(tabs)/hunter.tsx)
   - Status: Placeholder only
   - Needed: Focus UI + timer + swipe gestures
   - Estimated: 3-4 days

4. **Clarify Screen** (mobile/app/(tabs)/capture/clarify.tsx)
   - Status: Unknown (needs verification)
   - Needed: Question/answer UI + API integration
   - Estimated: 1 day (if starting from scratch)

### ⚠️ Needs Verification

1. **Task List API** - Does `GET /api/v1/tasks` support filters?
2. **Step Completion API** - Does `PUT /api/v1/tasks/steps/{id}/complete` exist?
3. **Delegation API** - Does `POST /api/v1/tasks/steps/{id}/delegate` exist?

---

## Next Steps (Priority Order)

### Week 1: Capture → Scout Flow
1. Implement Capture/Add UI (2 days)
2. Verify/Fix Clarify screen (1 day)
3. Implement Scout mode (3 days)

### Week 2: Hunter Mode
1. Build Hunter UI (2 days)
2. Implement swipe gestures (1 day)
3. Add timer + XP system (1 day)

### Week 3: Polish & Integration
1. Today tab recommendations (2 days)
2. Map tab visualization (2 days)
3. Gamification polish (1 day)

---

**End of Data Flow Documentation**

For API details, see: [API_INTEGRATION.md](./API_INTEGRATION.md)
For implementation status, see: [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
