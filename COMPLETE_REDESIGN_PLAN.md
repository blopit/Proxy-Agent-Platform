# Complete Redesign Plan: The Living Dashboard
## From Task Manager to Life Operating System

**Date**: October 24, 2025
**Status**: Planning Phase
**Decision Point**: Evolve vs Rebuild
**Recommendation**: EVOLVE (80% keep, 20% rebuild)

---

## Executive Summary

### The Vision

Transform from **"app that manages tasks"** to **"system that organizes life"** by adding:
1. **Purpose Layer** (Compass zones - the "why")
2. **Ritual Layer** (Daily touchpoints - habit formation)
3. **Clarity Layer** (Inbox triage - reduce overwhelm)
4. **Motivation Layer** (Anti-procrastination features)
5. **Universal UI** (Progress bars for everything)

### The Verdict: Evolve, Don't Rebuild

**Why NOT rebuild from scratch:**
- ✅ Core architecture is solid (backend, agents, database)
- ✅ Biological tab metaphor is strong (just needs enhancement)
- ✅ AsyncJobTimeline component is excellent (just needs generalization)
- ✅ Progress bar pattern works (just needs to be applied everywhere)
- ✅ CHAMPS framework is implemented (just not used in UI yet)

**What DOES need rebuilding:**
- ❌ Mapper tab → Completely redesign as Compass
- ❌ Tab navigation → Enhance with progress bar visualization
- ❌ Daily rituals → Build from scratch (doesn't exist)
- ❌ Inbox sorting → Build from scratch (doesn't exist)
- ❌ Energy matching UI → Build from scratch (backend exists)

**Estimated Effort:**
- Full rebuild: 3-4 months
- Evolutionary approach: 6-8 weeks
- **Recommendation: Evolve**

---

## Part 1: Current State Analysis

### What We Have (The Good)

#### Backend (Strong Foundation)
```
✅ Task decomposition (AI-powered)
✅ CHAMPS tag generation (6 dimensions)
✅ Micro-step database (hierarchical)
✅ Progress tracking
✅ User state management
✅ OpenAI integration
```

#### Frontend (Mixed - Some Strong, Some Weak)
```
✅ STRONG: AsyncJobTimeline component
   - Progress bar pattern
   - Expand/collapse
   - Status colors
   - Emoji icons
   - Nested children

✅ STRONG: Biological tab metaphor
   - Capture (brain dump)
   - Scout (explore tasks)
   - Hunter (execute)
   - Mender (recover)
   - Mapper (reflect)

⚠️ WEAK: Tab functionality
   - Tabs are just navigation
   - No visual progress
   - No purpose connection
   - No daily rhythm

❌ MISSING: Key features
   - Compass/zones (no "why")
   - Daily rituals (no habit formation)
   - Inbox sorting (no triage)
   - Energy matching (backend exists, no UI)
   - Anti-procrastination (designed but not implemented)
```

### What's Missing (The Gaps)

#### 1. No "Why" Layer
```
Current state:
- User creates task: "Go to gym"
- Task sits in list
- No connection to purpose
- Low motivation to complete

Needed:
- Task connects to "Health" zone
- Zone has purpose: "Stay energized for creative work"
- Completion = progress toward identity
- High motivation
```

#### 2. No Sorting/Triage
```
Current state:
- Capture creates task
- Task appears... somewhere?
- User doesn't know what to do with it
- Tasks pile up

Needed:
- Capture → Inbox (uncategorized)
- Quick sort: swipe or tap to categorize
- Task goes to right mode/zone
- Clean inbox = peace of mind
```

#### 3. No Daily Rhythm
```
Current state:
- User opens app whenever
- No structure
- Easy to forget/abandon
- No habit formation

Needed:
- Morning ritual (8am): Align with compass
- Midday check (1pm): Course correct
- Evening closure (9pm): Reflect + prep
- Daily touchpoints = sustained engagement
```

#### 4. No Energy Matching
```
Current state:
- All tasks shown always
- User sees hard task when tired → avoidance
- No guidance on what to do right now

Needed:
- User sets current energy level
- Tasks filter by energy requirement
- See only what you CAN do right now
- Reduces decision paralysis
```

#### 5. Progress Bars Only for Tasks
```
Current state:
- AsyncJobTimeline shows task micro-steps
- But tabs = buttons (no progress visual)
- Energy = number? (doesn't exist)
- Zones = don't exist
- Streaks = don't exist

Needed:
- EVERYTHING is a progress bar
- Tabs = progress through daily cycle
- Energy = progress bar (1-5)
- Zones = progress bars (weekly)
- Streaks = progress bars (calendar)
```

---

## Part 2: Target State Design

### The New Information Architecture

```
EVERYTHING FLOWS THROUGH COMPASS

         🧭 COMPASS (Purpose Layer)
              ↓
     [Health] [Work] [Home] [Social] [Learn]
              ↓
         Daily Rituals
    🌅 Morning | 🔍 Midday | 🌙 Evening
              ↓
         Capture → Inbox → Sort
              ↓
    Biological Modes (Execution)
    📸 Scout | 🎯 Hunter | 💚 Mender
              ↓
         Progress Review
    (Weekly compass alignment check)
```

### The 5 Enhanced Biological Tabs

#### Tab 1: 📸 CAPTURE (Minimal Changes)
```
CURRENT:
- Voice/text input
- AI decomposition
- Creates task

ENHANCED:
+ Swipe-to-sort gesture after capture
  - Swipe right → "Do soon" (Hunter queue)
  - Swipe left → "Think later" (Scout)
  - Swipe up → "File it" (Reference)
+ Visual feedback (destination tab pulses)
+ Zone assignment suggestion

EFFORT: 1 week (add gestures)
```

#### Tab 2: 🔍 SCOUT → INBOX (Moderate Changes)
```
CURRENT:
- Browse tasks by category
- Filter/search

ENHANCED → INBOX MODE:
+ Pull-down reveals "Inbox" (uncategorized items)
+ Card-based sorting UI:
  ┌──────────────────────┐
  │ "Buy groceries"      │
  │ [🏃][💼][🏠][👥][📚] │ ← Tap zone
  │ [🎯][⏱️][⚡][🗑️]     │ ← Tap mode/archive
  └──────────────────────┘
+ Items slide into destination with animation
+ Counter shows: "Inbox (8)" → visual pressure to clear
+ After sorting, returns to normal Scout mode

SCOUT MODE (default):
- Browse by zone
- Browse by energy level
- Browse by CHAMPS tags
- "Ready Now" filter (show only ready tasks)

EFFORT: 2 weeks (new sorting UI)
```

#### Tab 3: 🎯 HUNTER → FLOW MODE (Moderate Changes)
```
CURRENT:
- Task list
- Swipe to complete

ENHANCED → FLOW MODE:
+ Energy bar at top
  Energy: ████████░░ 72%
+ "Current Quest" framing (1 task at a time)
  ┌─────────────────────┐
  │ 📧 Reply to emails  │
  │ ⚡ Medium energy OK │
  │ 🎁 Earn 75 XP       │
  │ ⏰ Est: 15 min      │
  │                     │
  │ Micro-steps:        │
  │ [✅][✅][🔵][⚪][⚪] │ ← Progress bar
  │                     │
  │ Timer: 25:00 🍅     │
  │ [▶ START FLOW]      │
  └─────────────────────┘
+ Smart START button
  - Opens apps automatically
  - Starts timer
  - Enables DND
+ Anti-procrastination features:
  - 🟢 Ready Now badge
  - 🎁 XP preview
  - ⏰ Countdown timer (if deadline)
+ Queue shows next 2-3 tasks
+ Energy-matched filtering

EFFORT: 3 weeks (add energy UI, anti-procrastination features)
```

#### Tab 4: 💚 MENDER → RECHARGE MODE (Minor Changes)
```
CURRENT:
- Recovery tasks?
- Energy tracking?

ENHANCED → RECHARGE MODE:
+ Energy bar (shows LOW state)
  Energy: ███░░░░░░░ 30%
+ "Low-effort wins" section
  Quick Wins (≤2 min):
  □ Water plants
  □ 5-min desk tidy
  □ Reply to one email
+ Suggestions
  "Take a 10-min walk, then come back fresh"
+ Energy boost activities
  □ Breathing exercise (3 min)
  □ Stretch routine (5 min)
  □ Hydrate + snack (2 min)
+ Can still complete Quick Win tasks (filtered)
+ Cannot see Sustained/Marathon tasks (hidden)

EFFORT: 1 week (add suggestions, filtering)
```

#### Tab 5: 🗺️ MAPPER → COMPASS (Major Rebuild)
```
CURRENT:
- Weekly planning?
- Reflection?

COMPLETELY REDESIGNED → COMPASS MODE:

VIEW 1: Compass (Purpose Layer)
┌──────────────────────────────────┐
│         🧭 YOUR COMPASS          │
├──────────────────────────────────┤
│                                  │
│         [Health 🏃]              │
│        ████████░░ 8hrs           │
│  "Stay energized for work"       │
│                                  │
│  [Work 💼]     [Home 🏠]         │
│  ██████████    ████░░░░          │
│   10hrs         4hrs             │
│                                  │
│ [Social 👥]  [Learn 📚]          │
│  ██░░░░░░░░   ███░░░░░░          │
│   2hrs         3hrs              │
│                                  │
│ Overall Alignment: 78% ⭐        │
└──────────────────────────────────┘

Tap a zone → See zone detail view:

ZONE DETAIL: Health 🏃
┌──────────────────────────────────┐
│ Why: "Stay energized for work"  │
├──────────────────────────────────┤
│ This week: 8/10 hours ████████░░ │
│                                  │
│ Completed:                       │
│ ✅ Workout (Mon, Wed, Fri)       │
│ ✅ Meal prep (Sun, Wed)          │
│ ✅ Doctor appointment (Tue)      │
│                                  │
│ Pending:                         │
│ ⚪ Grocery shopping               │
│ ⚪ Evening walk (3x this week)   │
│                                  │
│ Suggestions:                     │
│ 💡 2 more hours to hit goal      │
│ 💡 Schedule evening walks?       │
└──────────────────────────────────┘

VIEW 2: Weekly Review
┌──────────────────────────────────┐
│      📅 WEEK 42 REVIEW           │
├──────────────────────────────────┤
│ 🎯 Completed: 23 tasks           │
│ 🌟 Compass alignment: 78%        │
│                                  │
│ ZONE BREAKDOWN:                  │
│ Health  ████████░░ 8/10 ⭐       │
│ Work    ██████████ 10/10 🎉      │
│ Home    ████░░░░░░ 4/10 ⚠️       │
│ Social  ██░░░░░░░░ 2/10 ⚠️       │
│ Learn   ███░░░░░░░ 3/10 ⚠️       │
│                                  │
│ Wins this week:                  │
│ 🏆 Launched new feature          │
│ 🏆 Gym 3x (streak!)              │
│ 🏆 Read 2 chapters                │
│                                  │
│ Orphaned tasks (no zone): 5      │
│ [Archive] [Reassign to zone]    │
│                                  │
│ Next week focus:                 │
│ [Pick 3 priority tasks] →        │
└──────────────────────────────────┘

VIEW 3: Setup Zones (First-time)
┌──────────────────────────────────┐
│    🧭 SET UP YOUR COMPASS        │
├──────────────────────────────────┤
│ Choose 3-5 focus zones:          │
│                                  │
│ Suggested:                       │
│ ☑ Health 🏃                      │
│ ☑ Work 💼                        │
│ ☑ Home 🏠                        │
│ □ Social 👥                      │
│ □ Learning 📚                    │
│ □ Finance 💰                     │
│ □ Creative 🎨                    │
│ □ [+ Custom zone]                │
│                                  │
│ For each zone, write WHY:        │
│                                  │
│ Health 🏃                        │
│ Why: ________________________    │
│ Weekly goal: ___ hours           │
│                                  │
│ [Save & Continue] →              │
└──────────────────────────────────┘

EFFORT: 4 weeks (complete rebuild)
- New data model (zones table)
- Zone CRUD operations
- Compass visualization
- Weekly review logic
- Task-to-zone tagging
```

---

## Part 3: New Features (Built from Scratch)

### Feature 1: Daily Rituals (Habit Formation)

```
IMPLEMENTATION:

1. Morning Ritual (8:00 AM notification)
┌──────────────────────────────────┐
│      🌅 MORNING RESET (5 min)    │
├──────────────────────────────────┤
│ Inbox: 8 items → [Clear now]    │
│                                  │
│ Today's 3 focus tasks:           │
│ 1. ________________________      │
│ 2. ________________________      │
│ 3. ________________________      │
│                                  │
│ Energy zones for today:          │
│ [Health 🏃] [Work 💼] [Home 🏠] │
│  ████░░░░   ██████░░   ███░░░   │
│   2hrs       4hrs      2hrs      │
│  (planned energy allocation)     │
│                                  │
│ [Skip] [Start Day] →             │
└──────────────────────────────────┘

2. Midday Checkpoint (1:00 PM notification)
┌──────────────────────────────────┐
│      🔍 MIDDAY CHECK (1 min)     │
├──────────────────────────────────┤
│ Morning progress:                │
│ Focus tasks: 1/3 ✅ 2️⃣ 3️⃣      │
│                                  │
│ Still on track?                  │
│                                  │
│ [Yes, crushing it 🔥]            │
│ [Need to adjust course]          │
│                                  │
│ Energy check:                    │
│ [High] [Medium] [Low] [Drained]  │
└──────────────────────────────────┘

3. Evening Closure (9:00 PM notification)
┌──────────────────────────────────┐
│      🌙 DAY CLOSURE (5 min)      │
├──────────────────────────────────┤
│ What did you win today?          │
│                                  │
│ Completed:                       │
│ ✅ 1. Workout                    │
│ ✅ 2. Write report               │
│ ✅ 3. Groceries                  │
│                                  │
│ 3/3 focus tasks! 🎉              │
│                                  │
│ Today's zone progress:           │
│ [Health] [Work] [Home]           │
│  +2hrs   +4hrs   +2hrs           │
│                                  │
│ Quick reflection (optional):     │
│ [🎤 Voice note] [Skip]           │
│                                  │
│ Tomorrow's spotlight task:       │
│ _________________________        │
│                                  │
│ [Done for today] →               │
└──────────────────────────────────┘

TECHNICAL:
- Modal system (slide-up from bottom)
- Local notifications (scheduled)
- Can snooze (30 min, 1 hour)
- Can disable rituals in settings
- Completion tracked in database

EFFORT: 2 weeks
```

### Feature 2: Energy Matching System

```
IMPLEMENTATION:

1. Energy Selector (appears in Hunter/Mender tabs)
┌──────────────────────────────────┐
│ Your current energy:             │
│                                  │
│ [⚪][⚪][🔵][⚪][⚪]              │
│  1   2   3   4   5               │
│  ↑   ↑   ↑   ↑   ↑               │
│ Crash Low Med High Peak          │
│                                  │
│ Tap to select your state         │
└──────────────────────────────────┘
← Progress bar UI!

2. Tasks Filter Based on Energy
Energy 3 (Medium) selected:

CAN DO RIGHT NOW:
✅ Quick Wins (⚡ ≤2 min)
✅ Focused (🎯 3-5 min)
✅ Sustained (⏱️ 6-15 min)

TRY LATER (grayed out):
⚠️ Endurance (🏃 16-30 min) - Might be hard
❌ Marathon (🏔️ 30+ min) - Wait for peak

3. Energy-Matched Highlighting
Tasks that match show with green outline
Tasks that don't match are 50% opacity

BACKEND (Already Exists):
- CHAMPS Participation tags
  - ⚡ Quick Win
  - 🎯 Focused
  - ⏱️ Sustained
  - 🏃 Endurance
  - 🏔️ Marathon

FRONTEND (New):
- Energy selector component
- Filter logic based on CHAMPS tags
- Visual highlighting/dimming

EFFORT: 1 week
```

### Feature 3: Inbox Sorting

```
IMPLEMENTATION:

1. Pull-down gesture in Scout tab reveals Inbox
┌──────────────────────────────────┐
│         📥 INBOX (8)             │
├──────────────────────────────────┤
│ [Swipe or tap to sort]           │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🛒 Buy groceries             │ │
│ │                              │ │
│ │ Zones:                       │ │
│ │ [🏃][💼][🏠][👥][📚]        │ │
│ │                              │ │
│ │ Actions:                     │ │
│ │ [🎯 Hunt][⏰ Later][🗑️ Archive] │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 📧 Reply to Alice            │ │
│ │ [🏃][💼][🏠][👥][📚]        │ │
│ │ [🎯 Hunt][⏰ Later][🗑️ Archive] │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘

2. Swipe gestures (alternative to tapping)
Swipe right → Hunter queue
Swipe left → Scout (later)
Swipe up → Archive

3. Visual feedback
- Item slides toward destination tab
- Tab pulses/glows briefly
- Counter updates: "Inbox (8)" → "Inbox (7)"
- Confetti when inbox hits zero!

BACKEND:
- Add task.zone_id field
- Add task.triage_status ('inbox', 'sorted')

FRONTEND:
- Inbox view component
- Swipe gesture handlers
- Zone assignment UI
- Animation system

EFFORT: 2 weeks
```

### Feature 4: Anti-Procrastination Features

```
IMPLEMENTATION:

These are added as LAYERS to AsyncJobTimeline component:

LAYER 1: Ready Now Badge
┌──────────────────────────────────┐
│ 🟢 READY NOW                     │
│ Everything you need is ready     │
│ ────────────────────────────────│
│ ✓ No blockers                    │
│ ✓ Energy: Medium (you have this)│
│ ✓ Location: Home (you're here)  │
│ ✓ Tools: All available           │
└──────────────────────────────────┘

LAYER 2: XP Preview
     🎁 +75 XP
        ↓
[🔵 Active task]

LAYER 3: Countdown Timer
     ⏰ 2h 34m
        ↓
[🔴 Urgent task]

LAYER 4: Energy Match Glow
Green outline = Energy matches
Dim/gray = Energy too low

LAYER 5: Smart START Button
[▶ START (15 min)]
   ↓
Opens: Gmail, Starts: 15-min timer, Enables: DND

LAYER 6: Streak Display
🔥 CURRENT STREAK: 7 DAYS
[✅][✅][✅][✅][✅][✅][✅]
Complete 1 task today to keep it alive!

BACKEND (Mostly exists):
- Readiness calculation
- XP system
- Deadline tracking
- Smart actions mapping
- Streak tracking

FRONTEND (New):
- Badge components
- XP preview
- Countdown timer
- Glow effects
- START button
- Streak visualization

EFFORT: 3 weeks
```

---

## Part 4: Universal Progress Bar System

### The Core Component (Already Exists)

**AsyncJobTimeline.tsx** - This is already perfect, just needs to be:
1. Generalized (not just for micro-steps)
2. Applied everywhere (tabs, energy, zones, streaks)

### Current Progress Bar (Micro-Steps)
```typescript
<AsyncJobTimeline
  steps={microSteps}
  activeStep={currentStep}
  size="full"
/>

Result:
[✅][✅][🔵][⚪][⚪]
 Done Done Active Next Next
```

### Generalized Progress Bar (Everything)
```typescript
// Same component, different data!

// Micro-steps
<ProgressBar steps={microSteps} type="task" />

// Biological tabs (daily cycle)
<ProgressBar steps={biologicalModes} type="navigation" />
Result:
[✅ Capture][✅ Scout][🔵 Hunter][⚪ Mender][⚪ Mapper]
  Morning    Morning   AFTERNOON   Evening    Night

// Energy levels
<ProgressBar steps={energyLevels} type="selector" />
Result:
[⚪ Crash][⚪ Low][🔵 Medium][⚪ High][⚪ Peak]
    1       2        3          4        5

// Weekly streak
<ProgressBar steps={weekDays} type="streak" />
Result:
[✅ Mon][✅ Tue][✅ Wed][🔵 Thu][⚪ Fri][⚪ Sat][⚪ Sun]
  3 done  5 done  2 done  IN PROGRESS

// Compass zones
<ProgressBar steps={compassZones} type="compass" />
Result:
[████ Health][██████ Work][███ Home][██ Social][██ Learn]
   8hrs        10hrs       4hrs      2hrs       3hrs

// Daily rituals
<ProgressBar steps={dailyRituals} type="rituals" />
Result:
[✅ Morning][🔵 Midday][⚪ Evening]
   8am Done    1pm NOW    9pm Pending
```

### Implementation Plan

**Step 1: Extract Generic Component**
```typescript
// Before (specific to tasks)
<AsyncJobTimeline
  jobName="Send email"
  steps={microSteps}
  currentProgress={45}
/>

// After (generic)
<ProgressBar
  steps={steps}
  activeStepId={activeId}
  type="task" | "navigation" | "selector" | "streak" | "compass"
  onStepClick={handleClick}
  showBadges={true}
  showRewards={true}
/>
```

**Step 2: Create Type-Specific Renderers**
```typescript
// Internal rendering varies by type
switch (type) {
  case 'task':
    return <TaskStepRenderer {...props} />;
  case 'navigation':
    return <NavStepRenderer {...props} />;
  case 'selector':
    return <SelectorStepRenderer {...props} />;
  case 'streak':
    return <StreakStepRenderer {...props} />;
  case 'compass':
    return <CompassStepRenderer {...props} />;
}
```

**Step 3: Apply Everywhere**
```
✅ Micro-steps → Already done
⏳ Tab navigation → Use progress bar
⏳ Energy selector → Use progress bar
⏳ Weekly streaks → Use progress bar
⏳ Daily rituals → Use progress bar
⏳ Compass zones → Use progress bar
⏳ Daily schedule → Use progress bar
⏳ Focus session → Use progress bar
```

**EFFORT: 2 weeks** (generalize + apply to all use cases)

---

## Part 5: Database Changes

### New Tables

```sql
-- 1. Compass zones
CREATE TABLE compass_zones (
  zone_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,              -- "Health", "Work", etc
  icon TEXT,                        -- "🏃", "💼", etc
  why TEXT,                         -- Purpose statement
  weekly_goal_hours INTEGER,       -- Target hours per week
  color TEXT,                       -- For visualization
  sort_order INTEGER,              -- Display order
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 2. Zone progress tracking
CREATE TABLE zone_progress (
  progress_id TEXT PRIMARY KEY,
  zone_id TEXT NOT NULL,
  week_start DATE NOT NULL,        -- Monday of the week
  hours_logged DECIMAL(5,2),       -- Actual hours spent
  tasks_completed INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES compass_zones(zone_id)
);

-- 3. Task-to-zone mapping
ALTER TABLE tasks ADD COLUMN zone_id TEXT;
ALTER TABLE tasks ADD COLUMN triage_status TEXT DEFAULT 'inbox';
-- triage_status: 'inbox', 'sorted', 'archived'

-- 4. Daily rituals completion
CREATE TABLE ritual_completions (
  completion_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  ritual_type TEXT NOT NULL,       -- 'morning', 'midday', 'evening'
  completion_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  focus_tasks TEXT,                -- JSON array of task IDs
  energy_level INTEGER,            -- User-reported energy
  reflection TEXT,                 -- Evening reflection
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 5. User energy state (already mentioned in anti-procrastination doc)
CREATE TABLE user_energy_states (
  user_id TEXT PRIMARY KEY,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Streak tracking (already mentioned)
CREATE TABLE user_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completion_date DATE,
  streak_freeze_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. XP transactions (already mentioned)
CREATE TABLE xp_transactions (
  transaction_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id TEXT,
  xp_amount INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Schema Migrations

```sql
-- Migration 018: Add compass zones
-- (Create compass_zones table)

-- Migration 019: Add zone progress tracking
-- (Create zone_progress table)

-- Migration 020: Add task triage
-- (ALTER tasks table)

-- Migration 021: Add daily rituals
-- (Create ritual_completions table)

-- Migration 022: Add energy states
-- (Create user_energy_states table)

-- Migration 023: Add streaks
-- (Create user_streaks table)

-- Migration 024: Add XP tracking
-- (Create xp_transactions table)
```

---

## Part 6: Backend Services (New)

### Service 1: CompassService
```python
class CompassService:
    """Manage user's compass zones and purpose"""

    async def create_zone(
        self,
        user_id: str,
        name: str,
        icon: str,
        why: str,
        weekly_goal_hours: int
    ) -> CompassZone:
        """Create a new compass zone"""

    async def get_user_zones(self, user_id: str) -> List[CompassZone]:
        """Get all active zones for user"""

    async def log_zone_progress(
        self,
        zone_id: str,
        task_id: str,
        hours: float
    ) -> ZoneProgress:
        """Log time spent on a task toward zone goal"""

    async def get_weekly_progress(
        self,
        user_id: str,
        week_start: date
    ) -> Dict[str, ZoneProgress]:
        """Get progress for all zones this week"""

    async def calculate_alignment(
        self,
        user_id: str,
        week_start: date
    ) -> float:
        """Calculate overall compass alignment (0-100%)"""
```

### Service 2: RitualService
```python
class RitualService:
    """Manage daily rituals"""

    async def schedule_rituals(self, user_id: str):
        """Schedule daily ritual notifications"""

    async def complete_morning_ritual(
        self,
        user_id: str,
        focus_tasks: List[str],
        zone_allocations: Dict[str, int]
    ):
        """Mark morning ritual complete, set daily plan"""

    async def complete_midday_check(
        self,
        user_id: str,
        on_track: bool,
        energy_level: int
    ):
        """Record midday checkpoint"""

    async def complete_evening_closure(
        self,
        user_id: str,
        reflection: str,
        tomorrow_spotlight: str
    ):
        """Complete day, prep tomorrow"""

    async def get_ritual_status(
        self,
        user_id: str,
        date: date
    ) -> Dict[str, bool]:
        """Check which rituals completed today"""
```

### Service 3: EnergyMatchingService
```python
class EnergyMatchingService:
    """Match tasks to user's current energy level"""

    async def set_user_energy(
        self,
        user_id: str,
        energy_level: int  # 1-5
    ):
        """Store user's current energy state"""

    async def get_energy_matched_tasks(
        self,
        user_id: str
    ) -> Dict[str, List[Task]]:
        """Get tasks grouped by energy compatibility"""
        # Returns:
        # {
        #   'can_do_now': [...],
        #   'try_later': [...],
        #   'wait_for_peak': [...]
        # }

    async def get_energy_requirements(
        self,
        task: Task
    ) -> int:
        """Determine energy required based on CHAMPS Participation tag"""
        # ⚡ Quick Win → 1
        # 🎯 Focused → 2
        # ⏱️ Sustained → 3
        # 🏃 Endurance → 4
        # 🏔️ Marathon → 5
```

### Service 4: InboxService
```python
class InboxService:
    """Manage task inbox and triage"""

    async def get_inbox_items(
        self,
        user_id: str
    ) -> List[Task]:
        """Get all uncategorized tasks"""

    async def sort_to_zone(
        self,
        task_id: str,
        zone_id: str
    ):
        """Assign task to a compass zone"""

    async def sort_to_mode(
        self,
        task_id: str,
        mode: str  # 'hunt', 'scout', 'later'
    ):
        """Route task to appropriate mode"""

    async def archive_task(self, task_id: str):
        """Remove from active views"""

    async def get_inbox_count(self, user_id: str) -> int:
        """Get number of unsorted items"""
```

---

## Part 7: Implementation Roadmap

### Phase 0: Foundation (Week 1)
**Goal**: Prepare infrastructure

- [ ] Database migrations (new tables)
- [ ] Generalize AsyncJobTimeline → ProgressBar component
- [ ] Create base service classes
- [ ] Set up new API routes

**Deliverable**: Clean foundation for building features

---

### Phase 1: Compass (Weeks 2-5)
**Goal**: Add purpose layer - THE MOST IMPORTANT

**Week 2: Data Layer**
- [ ] CompassService backend
- [ ] Zone CRUD APIs
- [ ] Zone progress tracking
- [ ] Weekly alignment calculation

**Week 3: Compass UI**
- [ ] Mapper tab → Compass redesign
- [ ] Circular compass view (zones as wedges)
- [ ] Zone detail view
- [ ] First-time setup flow

**Week 4: Integration**
- [ ] Task-to-zone tagging
- [ ] Zone progress bars
- [ ] Weekly review view
- [ ] Orphaned task handling

**Week 5: Polish**
- [ ] Animations
- [ ] Empty states
- [ ] Error handling
- [ ] Testing

**Deliverable**: Working Compass feature

---

### Phase 2: Daily Rituals (Weeks 6-7)
**Goal**: Create habit formation touchpoints

**Week 6: Backend + Notifications**
- [ ] RitualService backend
- [ ] Notification scheduling
- [ ] Completion tracking
- [ ] APIs for ritual data

**Week 7: Ritual UIs**
- [ ] Morning ritual modal
- [ ] Midday checkpoint modal
- [ ] Evening closure modal
- [ ] Ritual status indicators

**Deliverable**: 3 daily rituals live

---

### Phase 3: Inbox + Sorting (Week 8)
**Goal**: Add triage layer

- [ ] InboxService backend
- [ ] Pull-down inbox reveal
- [ ] Swipe gestures
- [ ] Zone assignment UI
- [ ] Visual feedback animations
- [ ] Inbox counter badge

**Deliverable**: Working inbox with 0-friction sorting

---

### Phase 4: Energy Matching (Week 9)
**Goal**: Filter tasks by energy

- [ ] EnergyMatchingService backend
- [ ] Energy selector UI (progress bar!)
- [ ] Task filtering logic
- [ ] Visual highlighting/dimming
- [ ] Integration with Hunter/Mender modes

**Deliverable**: Energy-aware task display

---

### Phase 5: Anti-Procrastination Features (Weeks 10-12)
**Goal**: Add motivation layer

**Week 10: Readiness + XP**
- [ ] ReadinessService backend
- [ ] Ready Now badge component
- [ ] XP calculation service
- [ ] XP preview component
- [ ] Integration with progress bars

**Week 11: Timers + Actions**
- [ ] Smart action mapping
- [ ] START button component
- [ ] Countdown timer component
- [ ] App integration (open Gmail, etc)

**Week 12: Streaks + Gamification**
- [ ] StreakService backend
- [ ] Streak display component
- [ ] XP progress bars
- [ ] Achievement system
- [ ] Celebration animations

**Deliverable**: Full anti-procrastination suite

---

### Phase 6: Polish & Test (Weeks 13-14)
**Goal**: Production-ready

- [ ] Visual polish (animations, transitions)
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] User testing with ADHD participants
- [ ] A/B test setup
- [ ] Analytics instrumentation
- [ ] Documentation

**Deliverable**: Launch-ready product

---

## Part 8: What Changes, What Stays

### KEEP (80% of current system)

#### Backend
```
✅ Task models
✅ Micro-step system
✅ CHAMPS tag generation
✅ AI decomposition
✅ Database architecture
✅ API structure
✅ Authentication
✅ Repository pattern
```

#### Frontend Components
```
✅ AsyncJobTimeline (just generalize it)
✅ Biological tab concept (just enhance)
✅ Capture UI (minor additions)
✅ Task cards
✅ Mobile-first layout
```

### REBUILD (20% new or major changes)

#### New Features
```
❌ Compass zones (doesn't exist)
❌ Daily rituals (doesn't exist)
❌ Inbox sorting (doesn't exist)
❌ Energy matching UI (backend exists, UI doesn't)
❌ Anti-procrastination features (designed, not built)
```

#### Enhanced Features
```
⚠️ Mapper tab → Complete redesign to Compass
⚠️ Scout tab → Add Inbox view
⚠️ Hunter tab → Add Flow Mode framing
⚠️ Mender tab → Add Recharge suggestions
⚠️ Tab navigation → Add progress visualization
```

### DELETE (Remove complexity)

```
🗑️ Any features not in the core flow
🗑️ Redundant UI elements
🗑️ Unused database fields
🗑️ Dead code
```

---

## Part 9: Risk Assessment

### Technical Risks

**Risk 1: Scope Creep**
- Issue: Adding too many features at once
- Mitigation: Strict phase gating, MVP mentality
- Severity: HIGH

**Risk 2: Progress Bar Over-Application**
- Issue: Everything looking the same, visual fatigue
- Mitigation: Type-specific renderers, varied sizing
- Severity: MEDIUM

**Risk 3: Performance (Many Progress Bars)**
- Issue: Rendering 10+ progress bars on one screen
- Mitigation: Virtual scrolling, lazy loading
- Severity: LOW

**Risk 4: Notification Fatigue**
- Issue: 3 daily rituals = annoying
- Mitigation: Smart timing, easy disable, respectful UX
- Severity: MEDIUM

### Product Risks

**Risk 5: Compass Too Abstract**
- Issue: Users don't understand "zones" or "purpose"
- Mitigation: Onboarding wizard, examples, defaults
- Severity: HIGH

**Risk 6: Too Many Modes**
- Issue: 5 tabs + Inbox + Compass = overwhelming
- Mitigation: Progressive disclosure, smart defaults
- Severity: MEDIUM

**Risk 7: Daily Rituals Feel Like Work**
- Issue: Morning ritual = another task to complete
- Mitigation: Make it fun, optional, rewarding
- Severity: MEDIUM

### Business Risks

**Risk 8: Development Timeline (14 weeks)**
- Issue: Long time to ship, lose momentum
- Mitigation: Ship in phases, beta releases
- Severity: HIGH

**Risk 9: User Adoption**
- Issue: Existing users confused by changes
- Mitigation: Gradual rollout, migration guide
- Severity: MEDIUM

---

## Part 10: Success Criteria

### User Metrics

**Engagement**
- Daily Active Users: +50% (from baseline TBD)
- Session Duration: +30%
- Retention (30-day): +40%

**Task Completion**
- Overall Completion Rate: 24% → 56% (+133%)
- Task Initiation Rate: 40% → 70%
- Time to First Task: ∞ → <5 minutes

**Compass/Purpose**
- % Users with Zones Set Up: >80%
- Compass Alignment (avg): >70%
- Tasks Assigned to Zones: >90%

**Daily Rituals**
- Morning Ritual Completion: >60%
- Midday Check-in: >40%
- Evening Closure: >50%
- 7-day Ritual Streak: >30%

**Inbox**
- Inbox Zero Rate: >50% daily
- Avg Inbox Size: <5 items
- Time to Sort: <2 min per item

**Energy Matching**
- Energy Selector Usage: >70% daily
- Energy-Matched Task Completion: +40% vs non-matched

**Anti-Procrastination**
- Ready Now Badge Interaction: >60%
- Smart START Usage: >80% of task starts
- Streak Maintenance (7+ days): >40%

### Technical Metrics

**Performance**
- Page Load Time: <1 second
- Progress Bar Render: <16ms (60fps)
- API Response: <200ms (p95)

**Quality**
- Test Coverage: >85%
- Bug Rate: <2% of features
- Crash Rate: <0.1%

### Qualitative

**User Feedback**
- NPS Score: >50
- Feature Usefulness: >8/10
- "Would Recommend": >70%

**ADHD User Specific**
- "Reduces Overwhelm": >80% agree
- "Helps Me Start Tasks": >75% agree
- "Makes Purpose Clear": >70% agree

---

## Part 11: The Decision Matrix

### Should We Rebuild from Scratch?

| Factor | Rebuild | Evolve | Winner |
|--------|---------|--------|--------|
| **Time to Ship** | 3-4 months | 6-8 weeks | ✅ EVOLVE |
| **Risk** | HIGH (new bugs) | MEDIUM (known foundation) | ✅ EVOLVE |
| **Cost** | HIGH ($$$) | MEDIUM ($$) | ✅ EVOLVE |
| **Architecture** | Perfect | Good enough | EVOLVE |
| **Learning Curve** | Steep (team) | Gradual | ✅ EVOLVE |
| **User Migration** | Painful | Smooth | ✅ EVOLVE |
| **Innovation** | Total freedom | Constrained | REBUILD |
| **Technical Debt** | Zero | Some remains | REBUILD |

**Score**: EVOLVE wins 6-2

### Final Recommendation: EVOLVE

**Why:**
1. ✅ Core architecture is solid
2. ✅ 80% of code can be reused
3. ✅ Faster time to market (6-8 weeks vs 3-4 months)
4. ✅ Lower risk (known foundation)
5. ✅ Smoother for existing users
6. ✅ Can still achieve the vision

**What We Sacrifice:**
- ❌ Perfect architecture (we'll have some technical debt)
- ❌ Blank slate freedom (constrained by existing decisions)

**What We Gain:**
- ✅ Ship faster
- ✅ Learn faster (user feedback sooner)
- ✅ Iterate faster (working foundation)
- ✅ Less risk

---

## Part 12: The Evolutionary Path

### How We Evolve Without Rebuilding

**Step 1: Generalize the Core (Week 1)**
```
AsyncJobTimeline → ProgressBar (universal component)
Result: One component that does everything
```

**Step 2: Enhance Incrementally (Weeks 2-14)**
```
Phase 1: Add Compass (purpose layer)
Phase 2: Add Rituals (habit formation)
Phase 3: Add Inbox (sorting layer)
Phase 4: Add Energy (filtering layer)
Phase 5: Add Anti-Procrastination (motivation layer)
Phase 6: Polish everything
```

**Step 3: Deprecate Old Patterns Gradually**
```
Old tab buttons → Become progress bars (gradual)
Old Scout mode → Add Inbox view (additive)
Old Mapper tab → Rebuild as Compass (replace)
```

**Step 4: Maintain Backward Compatibility**
```
- Existing tasks still work
- Old routes still function
- Database migrations are additive
- Users can opt-in to new features
```

---

## Conclusion

### The Verdict

**EVOLVE, DON'T REBUILD**

We can achieve the "Living Dashboard" vision by:
1. Generalizing AsyncJobTimeline → ProgressBar
2. Adding 5 new major features (Compass, Rituals, Inbox, Energy, Anti-Procrastination)
3. Enhancing existing tabs (Scout, Hunter, Mender, Mapper)
4. Applying progress bar pattern everywhere

**Timeline**: 14 weeks (3.5 months)
**Effort**: Manageable (evolutionary, not revolutionary)
**Risk**: Medium (controlled, phased rollout)
**Impact**: Transformational (task manager → life OS)

### What We're Building

```
FROM: Task manager with good execution
TO: Life operating system with purpose

ADDS:
- Purpose layer (Compass zones)
- Habit layer (Daily rituals)
- Clarity layer (Inbox sorting)
- Motivation layer (Anti-procrastination)
- Universal UI (Progress bars everywhere)

KEEPS:
- Biological metaphor (enhanced)
- Mobile-first (unchanged)
- AI intelligence (enhanced)
- ADHD-optimized (core value)
- Progress bar pattern (generalized)

RESULT:
A system that works WITH your brain, not against it
A dashboard that shows life progress, not just task lists
An OS that creates habits, not just captures ideas
```

### Next Steps

1. **Review this plan** - Does the vision align? Any concerns?
2. **Prioritize phases** - Can we cut anything? Reorder?
3. **Begin Phase 0** - Foundation work (database, generalize component)
4. **Ship incrementally** - Beta releases every 2-3 weeks
5. **Measure everything** - Analytics on all new features
6. **Iterate based on data** - Adjust as we learn

---

**This is not a redesign.**
**This is an evolution.**
**From task manager to life operating system.**
**Let's build it.** 🚀

---

**Document Owner**: Development Team
**Status**: PENDING APPROVAL
**Next Review**: After stakeholder feedback
**Version**: 1.0
**Date**: October 24, 2025
