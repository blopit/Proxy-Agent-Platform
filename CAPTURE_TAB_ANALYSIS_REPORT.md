# Capture Tab - Analysis & Recommendations Report

**Created:** October 24, 2025
**Status:** Critical Path - Needs Product Decisions
**Priority:** P0

---

## TL;DR

The Capture tab has a **world-class backend** (AI decomposition, CHAMPS tagging, Knowledge Graph integration) but a **minimal frontend UI** that hides most of the power. The tab works for basic task capture but needs UX design for:

1. **Capture Type Selection** - Can't create Goals/Habits/Shopping Lists (DB ready, no UI)
2. **CHAMPS Tag Display** - Backend generates tags but frontend hides them
3. **Type-Specific Forms** - Need different inputs for Goal vs Habit vs Shopping List
4. **Hierarchy Visualization** - Task decomposition tree exists but not shown

**Decision Needed:** Should we expand Capture tab to show all capabilities, or keep it minimal "brain dump" and move complexity elsewhere?

---

## Current State

### What Works Well ✅

**Backend Pipeline (Excellent):**
```
User types → LLM analyzes → Decomposes to micro-steps →
Classifies (DIGITAL/HUMAN) → Generates CHAMPS tags →
Saves to database → Returns breakdown
```

**Features:**
- Natural language parsing with LLM
- Knowledge Graph context integration
- Intelligent time estimation
- CHAMPS framework tagging
- Hierarchical task decomposition
- Auto-save to database

**Performance:**
- ~8 seconds total processing time
- Creates 2-5 micro-steps per capture
- 85%+ confidence on common tasks

### What's Missing ❌

**Frontend UI:**
- No capture type selector (Goal/Habit/Shopping List)
- CHAMPS tags generated but not displayed
- No clarification flow (backend supports it, UI doesn't)
- Recent captures in localStorage only (not synced)
- No hierarchy tree view
- Stats endpoint not implemented

**Impact:**
- Users see 20% of system capability
- Goals/Habits/Shopping Lists tables are unused
- ADHD optimization (CHAMPS) is invisible

---

## The Core Question

**What is the Capture tab supposed to be?**

### Option A: Minimal Brain Dump
- **Philosophy:** Fast, frictionless task creation
- **UX:** Single text field, no forms, auto-everything
- **Captures:** Tasks only (simplest case)
- **Output:** Preview of what was created, then get out of the way
- **Pros:** Zero cognitive load, lightning fast
- **Cons:** Can't leverage Goals/Habits/Shopping Lists

### Option B: Intelligent Input Center
- **Philosophy:** Context-aware capture with guided creation
- **UX:** Type selector, smart forms, clarifications
- **Captures:** All 4 types (Task/Goal/Habit/Shopping)
- **Output:** Detailed breakdown with CHAMPS tags, hierarchy tree
- **Pros:** Unlocks all backend power
- **Cons:** More complex, slower, decision fatigue

### Recommendation: **Start with A, evolve to B**

**Phase 1 (Now):** Keep minimal for tasks
**Phase 2 (Later):** Add type selector when user requests it

---

## Current User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER OPENS CAPTURE TAB                                   │
│    ├─ Sees recent captures (localStorage)                   │
│    ├─ Sees suggestion tickers                               │
│    └─ Input field ready                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. USER TYPES OR CLICKS SUGGESTION                          │
│    "turn off the AC when I leave for the day"              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. FRONTEND SHOWS PROGRESS ANIMATION                        │
│    AsyncJobTimeline with 4 steps:                          │
│    ⚡ Parse natural language (active)                       │
│    ⏳ LLM decomposition (pending)                           │
│    ⏳ Classify steps (pending)                              │
│    ⏳ Save to database (pending)                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND PROCESSING (~8 SECONDS)                          │
│    ├─ LLM parses: "Create automation task"                  │
│    ├─ Decomposes: 3 micro-steps                            │
│    │   1. Find AC smart plug integration                   │
│    │   2. Set up geofence automation                       │
│    │   3. Test automation when leaving                     │
│    ├─ Classifies: Step 1,2 = DIGITAL, Step 3 = HUMAN       │
│    ├─ Tags: [conversation:none, help:automation, ...]      │
│    └─ Saves to database                                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. TASKBREAKDOWNMODAL APPEARS                               │
│    ┌─────────────────────────────────────────────────┐     │
│    │ ✅ Turn off the AC when I leave                 │     │
│    │                                                  │     │
│    │ 📊 Breakdown:                                    │     │
│    │   • 3 total steps                                │     │
│    │   • 2 DIGITAL, 1 HUMAN                          │     │
│    │   • ~15 minutes total                           │     │
│    │                                                  │     │
│    │ Steps:                                           │     │
│    │ 1. Find AC smart plug integration (5 min)       │     │
│    │ 2. Set up geofence automation (7 min)          │     │
│    │ 3. Test automation when leaving (3 min)        │     │
│    │                                                  │     │
│    │ [Start Now] [View Tasks] [Capture Another]     │     │
│    └─────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PREVIEW ADDED TO "RECENTLY CREATED"                      │
│    Shows AsyncJobTimeline with all steps "done" ✅          │
│    Stored in localStorage (lost on clear)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Missing Features Deep Dive

### 1. Capture Type Selection

**Problem:** Users can only create Tasks, not Goals/Habits/Shopping Lists

**Current Code:**
```python
# Backend always defaults to TASK
task = Task(
    capture_type=CaptureType.TASK  # Hardcoded
)
```

**Database Ready:**
```sql
-- Migration 012: capture_type column added
tasks.capture_type IN ('task', 'goal', 'habit', 'shopping_list')

-- Migration 013-016: Type-specific tables created
goals ✅ habits ✅ shopping_lists ✅
```

**Frontend Missing:**
- No type selector buttons
- No type-specific forms
- No way to set Goal targets, Habit frequency, Shopping items

**Proposed Solution:**

```tsx
// Add to Capture tab
<CaptureTypeSelector
  selected={captureType}
  onChange={setCaptureType}
/>

// Shows 4 buttons:
[📝 Task] [🎯 Goal] [🔄 Habit] [🛒 Shopping]

// When type changes, show type-specific fields:
{captureType === 'goal' && (
  <GoalFields>
    <Input label="Target" placeholder="e.g., 10,000" />
    <Input label="Unit" placeholder="e.g., steps" />
    <DatePicker label="Target Date" />
    <MilestoneEditor />
  </GoalFields>
)}

{captureType === 'habit' && (
  <HabitFields>
    <Select label="Frequency" options={['daily', 'weekly', 'monthly']} />
    <RecurrencePatternBuilder />
    <TimePicker label="Reminder Time" />
  </HabitFields>
)}

{captureType === 'shopping_list' && (
  <ShoppingFields>
    <Input label="Store" placeholder="e.g., Trader Joe's" />
    <TextArea label="Items (one per line)" rows={5} />
    <DatePicker label="Shopping Date" />
  </ShoppingFields>
)}
```

**Impact:**
- Unlocks full backend capability
- Users can create Goals, Habits, Shopping Lists
- Leverages unused database tables

**Complexity:** Medium (1 week)

---

### 2. CHAMPS Tags Not Displayed

**Problem:** Backend generates CHAMPS tags but frontend hides them

**CHAMPS Framework:**
- **C**onversation: What level of interaction? (none, async, sync)
- **H**elp: How to get help if stuck? (automation, documentation, expert)
- **A**ctivity: What am I doing? (email, writing, coding, physical)
- **M**ovement: Can I move? (stationary, walking, flexible)
- **P**articipation: Success looks like? (completion, quality, output)
- **S**uccess: Completion criteria? (task_done, email_sent, response_received)

**Current Backend:**
```python
# CHAMPSTagService generates tags
step.tags = [
    "conversation:none",
    "help:automation",
    "activity:email",
    "movement:stationary",
    "participation:completion",
    "success:email_sent"
]
```

**Current Frontend:**
```tsx
// Receives tags but ignores them
micro_steps.map(step => (
  <div>
    {step.description}
    {/* step.tags ← NEVER DISPLAYED */}
  </div>
))
```

**Impact:**
- ADHD optimization invisible
- Users don't see success criteria
- Loses value of CHAMPS framework

**Proposed Solution:**

```tsx
<MicroStepCard>
  <div className="description">{step.description}</div>

  {/* NEW: CHAMPS badges */}
  <CHAMPSBadges tags={step.tags}>
    <Badge color="blue">📢 No conversation needed</Badge>
    <Badge color="green">🤖 Automation help available</Badge>
    <Badge color="purple">📧 Email activity</Badge>
    <Badge color="gray">🪑 Stationary work</Badge>
    <Badge color="yellow">✅ Success: Email sent</Badge>
  </CHAMPSBadges>
</MicroStepCard>
```

**Visual Mock:**
```
┌─────────────────────────────────────────────────────────────┐
│ 1. Find AC smart plug integration                    (5 min)│
│                                                              │
│ 📢 None  🤖 Automation  💻 Research  🪑 Stationary  ✅ Found│
└─────────────────────────────────────────────────────────────┘
```

**Complexity:** Low (2 days)

---

### 3. Type-Specific Forms

**Needed Forms:**

#### A. Goal Creation Form
```
┌─────────────────────────────────────────────┐
│ Goal: Lose weight                           │
│                                             │
│ Target Value: [10      ] [lbs ▼]           │
│ Target Date:  [Dec 31, 2025 📅]            │
│                                             │
│ Milestones:                                 │
│  ☐ Week 1: Track food daily                │
│  ☐ Week 2: Join gym                        │
│  ☐ Week 4: Lose 2 lbs                      │
│  [+ Add Milestone]                          │
│                                             │
│ Current Progress: [0 / 10 lbs]             │
│ ▓░░░░░░░░░ 0%                              │
│                                             │
│ [Create Goal] [Cancel]                      │
└─────────────────────────────────────────────┘
```

#### B. Habit Creation Form
```
┌─────────────────────────────────────────────┐
│ Habit: Exercise                             │
│                                             │
│ Frequency: [Daily ▼]                        │
│                                             │
│ Days: [M] [T] [W] [T] [F] [S] [S]          │
│       ✓   ✓   ✓   ✓   ✓   □   □            │
│                                             │
│ Time: [7:00 AM 🕐]                          │
│                                             │
│ Reminder: [✓] Notify 15 min before         │
│                                             │
│ Streak: 🔥 0 days                           │
│                                             │
│ [Create Habit] [Cancel]                     │
└─────────────────────────────────────────────┘
```

#### C. Shopping List Form
```
┌─────────────────────────────────────────────┐
│ Shopping List                               │
│                                             │
│ Store: [Trader Joe's ▼]                     │
│ Date:  [Tomorrow 📅]                        │
│                                             │
│ Items (paste list or type one per line):   │
│ ┌─────────────────────────────────────────┐ │
│ │ Milk                                    │ │
│ │ Eggs                                    │ │
│ │ Bread                                   │ │
│ │ Bananas                                 │ │
│ │ Coffee                                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ OR paste from clipboard:                    │
│ [📋 Paste List]                             │
│                                             │
│ Estimated Cost: $0.00                       │
│                                             │
│ [Create Shopping List] [Cancel]             │
└─────────────────────────────────────────────┘
```

**Complexity:** Medium-High (2 weeks)

---

### 4. Hierarchy Visualization

**Problem:** Decomposition creates tree structure but frontend shows flat list

**Current Backend:**
```python
micro_steps = [
    {
        "step_id": "1",
        "description": "Set up AC automation",
        "parent_step_id": None,
        "level": 0,
        "is_leaf": False,
        "children": ["1.1", "1.2"]
    },
    {
        "step_id": "1.1",
        "description": "Find smart plug integration",
        "parent_step_id": "1",
        "level": 1,
        "is_leaf": True
    },
    {
        "step_id": "1.2",
        "description": "Set up geofence",
        "parent_step_id": "1",
        "level": 1,
        "is_leaf": True
    }
]
```

**Current Frontend Display:**
```
1. Set up AC automation
2. Find smart plug integration
3. Set up geofence
```

**Proposed Tree View:**
```
┌─ Set up AC automation
│  ├─ 🔍 Find smart plug integration (5 min)
│  └─ 🌍 Set up geofence (7 min)
└─ ✅ Test automation (3 min)
```

**With Expand/Collapse:**
```
▼ Set up AC automation (15 min total)
  ├─ 🔍 Find smart plug integration (5 min)
  │    ├─ Search app store for "AC control"
  │    └─ Read reviews and install
  └─ 🌍 Set up geofence (7 min)
       ├─ Enable location services
       └─ Set home boundary

▶ Test automation (collapsed)
```

**Complexity:** Medium (1 week)

---

### 5. Clarification Flow

**Problem:** Backend supports CLARIFY mode but frontend has no UI

**Backend Flow:**
```python
# Step 1: Initial capture (mode='clarify')
response = await capture_agent.capture(
    input_text="email my boss the update",
    mode="clarify"
)

# Returns:
{
    "task": {...},
    "micro_steps": [...],
    "clarifications": [
        {
            "question": "Who should receive this email?",
            "field": "email_recipient",
            "type": "text",
            "suggestions": ["boss@company.com", "team@company.com"]
        },
        {
            "question": "What is the subject line?",
            "field": "email_subject",
            "type": "text"
        },
        {
            "question": "When should this be sent?",
            "field": "send_time",
            "type": "datetime"
        }
    ],
    "ready_to_save": false  # ← Needs clarification
}

# Step 2: User answers questions
answers = {
    "email_recipient": "boss@company.com",
    "email_subject": "Weekly Update",
    "send_time": "2025-10-25T09:00:00"
}

# Step 3: Submit clarifications
response = await capture_agent.clarify(
    micro_steps=response["micro_steps"],
    answers=answers
)

# Returns refined micro-steps
```

**Frontend Missing:**
- No modal to display clarification questions
- No form to collect answers
- No /api/v1/capture/clarify call

**Proposed UI:**

```tsx
<ClarificationModal
  questions={response.clarifications}
  onSubmit={handleClarificationSubmit}
>
  <h3>We need a few more details...</h3>

  {questions.map(q => (
    <FormField key={q.field}>
      <Label>{q.question}</Label>

      {q.suggestions && (
        <SuggestionChips>
          {q.suggestions.map(s => (
            <Chip onClick={() => setValue(q.field, s)}>{s}</Chip>
          ))}
        </SuggestionChips>
      )}

      <Input
        type={q.type}
        name={q.field}
        placeholder="Your answer..."
      />
    </FormField>
  ))}

  <Button type="submit">Continue</Button>
</ClarificationModal>
```

**Complexity:** Medium (1 week)

---

### 6. Recent Captures Sync

**Problem:** Recent captures stored in localStorage, not backend

**Current Implementation:**
```tsx
// Frontend only
const saveRecentCapture = (capture) => {
  const recent = JSON.parse(localStorage.getItem('recentCaptures') || '[]');
  recent.unshift(capture);
  localStorage.setItem('recentCaptures', JSON.stringify(recent.slice(0, 3)));
};
```

**Issues:**
- Lost when clearing browser data
- Not synced across devices
- No backend analytics

**Proposed Solution:**

```python
# Backend endpoint
@router.get("/api/v1/capture/recent/{user_id}")
async def get_recent_captures(user_id: str, limit: int = 10):
    """Get user's recent captures, ordered by created_at DESC"""
    captures = await task_repository.get_recent_tasks(
        user_id=user_id,
        limit=limit
    )
    return captures
```

```tsx
// Frontend
useEffect(() => {
  const fetchRecent = async () => {
    const captures = await apiClient.getRecentCaptures(userId, 10);
    setRecentCaptures(captures);
  };
  fetchRecent();
}, [userId]);
```

**Complexity:** Low (1 day)

---

### 7. Capture Stats Dashboard

**Problem:** Stats endpoint not implemented

**Current Code:**
```python
@router.get("/api/v1/capture/stats/{user_id}")
async def get_capture_stats(user_id: str):
    # TODO: Implement actual stats
    return {
        "total_captures": 0,
        "digital_count": 0,
        "human_count": 0,
        "avg_steps_per_capture": 0.0,
        "avg_processing_time_ms": 0.0,
        "most_common_tags": [],
        "capture_trend_7d": []
    }
```

**Needed Queries:**
```sql
-- Total captures
SELECT COUNT(*) FROM tasks WHERE user_id = ?;

-- DIGITAL vs HUMAN breakdown
SELECT leaf_type, COUNT(*)
FROM micro_steps
WHERE parent_task_id IN (SELECT task_id FROM tasks WHERE user_id = ?)
GROUP BY leaf_type;

-- Average steps per capture
SELECT AVG(step_count)
FROM (
    SELECT parent_task_id, COUNT(*) as step_count
    FROM micro_steps
    GROUP BY parent_task_id
);

-- Most common CHAMPS tags
SELECT tag, COUNT(*) as count
FROM (
    SELECT json_each.value as tag
    FROM micro_steps, json_each(micro_steps.tags)
)
GROUP BY tag
ORDER BY count DESC
LIMIT 10;

-- 7-day trend
SELECT DATE(created_at) as date, COUNT(*) as captures
FROM tasks
WHERE user_id = ? AND created_at >= DATE('now', '-7 days')
GROUP BY DATE(created_at);
```

**Proposed Dashboard:**
```
┌─────────────────────────────────────────────┐
│ Capture Stats (Last 30 Days)               │
├─────────────────────────────────────────────┤
│                                             │
│ 📊 Total Captures: 127                      │
│                                             │
│ 🤖 DIGITAL Steps: 234 (65%)                │
│ 👤 HUMAN Steps:   126 (35%)                │
│                                             │
│ 📈 Avg Steps/Capture: 2.8                   │
│ ⚡ Avg Processing: 8.2s                     │
│                                             │
│ 🏷️  Top Tags:                               │
│  1. conversation:none (89)                  │
│  2. help:automation (67)                    │
│  3. activity:email (45)                     │
│                                             │
│ 📅 7-Day Trend:                             │
│  [█████████░░░░] Mon-Sun chart             │
│                                             │
└─────────────────────────────────────────────┘
```

**Complexity:** Low (2 days)

---

## Recommendations

### Immediate (This Week)

#### 1. Display CHAMPS Tags
**Why:** Backend already generates them, just needs UI
**Impact:** Shows users "what success looks like" (ADHD optimization)
**Effort:** 2 days
**Files:**
- `frontend/src/components/mobile/TaskBreakdownModal.tsx` (add badges)
- `frontend/src/components/shared/CHAMPSBadges.tsx` (new component)

#### 2. Sync Recent Captures
**Why:** Users lose captures when clearing browser
**Impact:** Better UX, enables cross-device sync
**Effort:** 1 day
**Files:**
- `src/api/capture.py` (add GET /recent endpoint)
- `src/repositories/task_repository.py` (add query)
- `frontend/src/components/mobile/modes/CaptureMode.tsx` (fetch from API)

#### 3. Implement Stats Endpoint
**Why:** Unlock analytics potential
**Impact:** User insights, track engagement
**Effort:** 2 days
**Files:**
- `src/api/capture.py` (implement stats logic)
- `src/repositories/task_repository.py` (add stats queries)

### Short-Term (Next 2 Weeks)

#### 4. Add Capture Type Selector
**Why:** Unlock Goals/Habits/Shopping Lists
**Impact:** Users can leverage full backend capability
**Effort:** 1 week
**Files:**
- `frontend/src/components/mobile/modes/CaptureMode.tsx` (add type buttons)
- `src/api/tasks.py` (accept capture_type param)
- `src/agents/capture_agent.py` (route by type)

**Decision Needed:**
- Show type selector always? Or only when user requests?
- Default to Task and let user discover others?

#### 5. Build Goal Creation Form
**Why:** Most requested feature after Tasks
**Impact:** Users can set and track long-term objectives
**Effort:** 3 days
**Files:**
- `frontend/src/components/mobile/forms/GoalForm.tsx` (new)
- `src/api/goals.py` (new CRUD endpoints)
- `src/services/goal_service.py` (business logic)

### Medium-Term (Next Month)

#### 6. Clarification Flow UI
**Why:** Leverage backend CLARIFY mode
**Impact:** More accurate captures for complex tasks
**Effort:** 1 week
**Files:**
- `frontend/src/components/mobile/modals/ClarificationModal.tsx` (new)
- Update API calls to use /api/v1/capture/ + /clarify flow

#### 7. Hierarchy Tree View
**Why:** Show task decomposition structure
**Impact:** Users understand parent-child relationships
**Effort:** 1 week
**Files:**
- `frontend/src/components/shared/TaskTreeView.tsx` (new)
- Update TaskBreakdownModal to use tree instead of flat list

---

## Product Decisions Needed

### 1. Capture Tab Philosophy

**Question:** Minimal brain dump vs intelligent input center?

**Option A: Keep Minimal**
- Single text field
- Auto-everything
- Hide complexity
- Tasks only (no Goals/Habits)
- Fast, frictionless

**Option B: Show Full Power**
- Type selector (4 types)
- Smart forms
- CHAMPS tags visible
- Clarification flow
- Comprehensive but slower

**Recommendation:** **Start with Option A, add Option B as progressive disclosure**

UI Flow:
```
1. Default: Minimal (text field only)
2. User clicks "Advanced" → Shows type selector
3. User picks type → Shows type-specific form
4. User toggles "Show CHAMPS tags" → Tags appear
```

### 2. CHAMPS Tag Display Strategy

**Question:** How prominent should CHAMPS tags be?

**Option A: Always Visible**
```
┌─────────────────────────────────────────┐
│ 1. Find smart plug (5 min)             │
│                                         │
│ 📢 None  🤖 Auto  💻 Research  ✅ Found │
└─────────────────────────────────────────┘
```

**Option B: Collapsed by Default**
```
┌─────────────────────────────────────────┐
│ 1. Find smart plug (5 min)             │
│                                         │
│ [ℹ️  Show success criteria]             │
└─────────────────────────────────────────┘

// Expands to:
┌─────────────────────────────────────────┐
│ 1. Find smart plug (5 min)             │
│                                         │
│ ✅ Success Criteria:                    │
│  • Found integration in app store       │
│  • Downloaded and installed             │
│                                         │
│ 🏷️  Tags:                                │
│  • No conversation needed               │
│  • Automation help available            │
│  • Stationary work                      │
└─────────────────────────────────────────┘
```

**Recommendation:** **Option B** (progressive disclosure, less overwhelming)

### 3. Type Selector Placement

**Question:** Where should capture type selector live?

**Option A: In Capture Tab**
```
┌─────────────────────────────────────────┐
│ Capture                                 │
├─────────────────────────────────────────┤
│                                         │
│ [📝 Task] [🎯 Goal] [🔄 Habit] [🛒 Shop]│
│                                         │
│ What do you need to do?                 │
│ [_________________________________]     │
│                                         │
│ [Capture]                               │
└─────────────────────────────────────────┘
```

**Option B: Separate Entry Points**
```
// Different tabs for different types
[Capture] [Goals] [Habits] [Shopping]
```

**Option C: Hidden Until Needed**
```
// Default: Just text field
// Advanced button reveals type selector
[Advanced Options ▼]
```

**Recommendation:** **Option C** (keep default simple, show when needed)

### 4. Recent Captures Count

**Question:** How many recent captures to show?

**Option A: 3 (Current)**
- Minimal scroll
- Quick glance

**Option B: 10**
- More context
- Needs scroll

**Option C: Infinite Scroll**
- All history
- Performance concerns

**Recommendation:** **Option A (3)** with "View All" link to full history

---

## Technical Implementation Plan

### Phase 1: Quick Wins (Week 1)
```
Day 1-2: Display CHAMPS tags in TaskBreakdownModal
Day 3:   Sync recent captures with backend
Day 4-5: Implement capture stats endpoint
```

### Phase 2: Type Selector (Week 2)
```
Day 1-2: Add capture type selector UI
Day 3:   Update backend to accept capture_type
Day 4-5: Build Goal creation form
```

### Phase 3: Advanced Features (Week 3-4)
```
Week 3:  Clarification flow UI + API integration
Week 4:  Hierarchy tree view component
```

---

## Success Metrics

**Engagement:**
- Capture usage: +30% (from showing CHAMPS)
- Goal creation: 20% of users (new feature)
- Habit creation: 15% of users (new feature)

**Quality:**
- Task completion rate: +15% (better success criteria)
- Clarification usage: 10% of captures (optional feature)

**Technical:**
- Stats endpoint response time: <200ms
- Recent captures load time: <100ms
- Type-specific forms render: <50ms

---

## Conclusion

The Capture tab is **80% done** (backend excellent) but **20% visible** (frontend minimal).

**Key Decisions:**
1. Keep minimal UX or show full power?
2. How to display CHAMPS tags?
3. Where to put type selector?

**Recommended Path:**
1. **Week 1:** Quick wins (CHAMPS tags, stats, sync)
2. **Week 2:** Type selector + Goal form
3. **Week 3-4:** Advanced features (clarify, hierarchy)

**Next Step:** Product decision on Capture tab philosophy (minimal vs comprehensive)

---

**Report End**

*Document Version: 1.0*
*Last Updated: October 24, 2025*
*Author: Claude Code*
