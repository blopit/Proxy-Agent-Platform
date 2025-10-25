# Task Capture & Hierarchy System Report
## Complete Architecture Analysis & Improvement Plan

**Date**: October 23, 2025
**Status**: System Analysis Complete - Critical Issues Identified

---

## Executive Summary

**System Status**: 🟡 **Partially Functional** - Core capture works but has data loss issues

**Key Findings**:
- ✅ **Capture Flow**: Mobile quick-capture API is functional and returns micro-steps
- ❌ **Persistence**: Micro-steps are NOT auto-saved (critical data loss issue)
- ⚠️ **Time Estimation**: Hardcoded to 30 minutes (poor UX)
- ✅ **Decomposition**: DecomposerAgent successfully breaks tasks into atomic steps
- ⚠️ **Database**: Schema is correct but queries miss `step_number` field
- ❌ **Clarification Flow**: Half-implemented, not fully connected

**Priority Fixes**:
1. **P0 - Critical**: Auto-save micro-steps in quick-capture endpoint (data loss!)
2. **P0 - Critical**: Include `step_number` in all micro-step queries (ordering lost)
3. **P1 - High**: Fix hardcoded 30-minute time estimates (UX issue)
4. **P1 - High**: Complete clarification flow end-to-end

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Capture Flow](#2-capture-flow-user-input-task-creation)
3. [Hierarchy & Decomposition](#3-hierarchy-decomposition-system)
4. [Database Schema](#4-database-schema)
5. [Integration Points](#5-integration-points)
6. [What's Working](#6-whats-working)
7. [What's Broken](#7-whats-broken-critical-issues)
8. [Recommended Fixes](#8-recommended-fixes)
9. [Code Locations](#9-key-file-locations)

---

## 1. System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER INPUT (Mobile App)                                     │
│ "Buy groceries for the week"                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ API LAYER: /api/v1/mobile/quick-capture                    │
│ ├─ Receives text, user_id, mode (AUTO/MANUAL/CLARIFY)      │
│ └─ Returns: task + micro_steps + clarifications            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ CAPTURE AGENT (CaptureAgent.capture)                       │
│ ├─ Analyzes text with QuickCaptureService (AI/keywords)    │
│ ├─ Creates Task object                                     │
│ └─ Calls DecomposerAgent for hierarchical breakdown        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ DECOMPOSER AGENT (DecomposerAgent.decompose_task)          │
│ ├─ Determines scope (SIMPLE/MULTI/PROJECT)                 │
│ ├─ Breaks into MicroSteps (2-15 min each)                  │
│ ├─ Sets hierarchy levels (0-6)                             │
│ ├─ Generates icons, labels, CHAMPS tags                    │
│ └─ Returns list of atomic micro-steps                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ CLASSIFIER AGENT (ClassifierAgent.classify)                │
│ ├─ Classifies as DIGITAL (automatable) or HUMAN            │
│ ├─ Creates automation_plan for DIGITAL tasks               │
│ ├─ Generates clarification questions if needed             │
│ └─ Returns classified micro-steps                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE TO FRONTEND                                        │
│ {                                                           │
│   "task": {...},                                            │
│   "micro_steps": [...],                                     │
│   "clarifications": [...],                                  │
│   "ready_to_save": true/false                               │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND DISPLAY (AsyncJobTimeline)                        │
│ ├─ Shows task preview with micro-steps                     │
│ ├─ User can expand/collapse steps                          │
│ ├─ Displays icons, labels, time estimates                  │
│ └─ ❌ User must manually save (NO AUTO-SAVE!)              │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼ (manual action)
┌─────────────────────────────────────────────────────────────┐
│ PERSISTENCE: /api/v1/capture/save                          │
│ ├─ Creates Task in database                                │
│ ├─ Saves each MicroStep to micro_steps table               │
│ └─ Returns task_id + micro_step_ids                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Capture Flow: User Input → Task Creation

### API Endpoints

**Primary Endpoint**: `POST /api/v1/mobile/quick-capture`
- **File**: `src/api/simple_tasks.py:241-362`
- **Purpose**: Mobile-optimized task capture
- **Payload**:
  ```json
  {
    "text": "turn off the AC",
    "user_id": "alice",
    "voice_input": false,
    "auto_mode": true,
    "ask_for_clarity": false
  }
  ```

**Alternative Endpoint**: `POST /api/v1/capture/`
- **File**: `src/api/capture.py:95-189`
- **Purpose**: Formal capture endpoint with full CaptureMode support

### Step-by-Step Pipeline

#### Step 1: QuickCaptureService Analysis
**File**: `src/services/quick_capture_service.py:34-96`

**Input**: Raw text ("turn off the AC")
**Output**:
```python
{
  "title": "Turn off the AC",
  "priority": "medium",
  "category": "home-automation",
  "confidence": 0.92,
  "should_delegate": true,
  "delegation_type": "home_iot",
  "tags": ["quick-capture", "home-automation"],
  "due_date": null,
  "estimated_hours": 0.5  # ← HARDCODED DEFAULT (30 min)
}
```

**Methods**:
- `analyze_capture(text, user_id)` - Main analysis function
- Uses LLMCaptureService if available, else falls back to keywords
- Identifies delegation candidates (home_iot, email, calendar, etc.)

#### Step 2: Task Object Creation
**File**: `src/agents/capture_agent.py:207-222`

```python
def _create_task_from_analysis(analysis: dict) -> Task:
    estimated_hours = analysis.get("estimated_hours", 0.5)  # ← 30 min default

    return Task(
        title=analysis["title"],
        description=analysis["description"],
        project_id="default-project",
        priority=analysis["priority"],
        estimated_hours=estimated_hours,  # ← Passed through
        tags=analysis["tags"]
    )
```

**Issue**: No actual time estimation logic - always defaults to 0.5 hours (30 minutes)

#### Step 3: Task Decomposition
**File**: `src/agents/decomposer_agent.py:102-234`

**Process**:
1. **Determine Scope**:
   ```python
   scope = task.determine_scope()
   # SIMPLE: <10 min (no decomposition needed)
   # MULTI: 10-60 min (break into micro-steps)
   # PROJECT: >60 min (major project, phases needed)
   ```

2. **Split Task** (if MULTI or PROJECT):
   ```python
   # Call SplitProxyAgent to break into 2-15 minute steps
   micro_steps = await split_proxy_agent.split_task(task)

   # Each micro-step gets:
   # - description: "Turn off AC unit in living room"
   # - estimated_minutes: 2-15
   # - icon: "❄️"
   # - short_label: "AC off"
   # - delegation_mode: "do"
   # - leaf_type: "DIGITAL" or "HUMAN"
   ```

3. **Classify Leaf Type**:
   ```python
   # Simple keyword matching
   if "email" in description or "send" in description:
       leaf_type = LeafType.DIGITAL
   elif "api" in description or "database" in description:
       leaf_type = LeafType.DIGITAL
   else:
       leaf_type = LeafType.HUMAN
   ```

4. **Generate CHAMPS Tags**:
   ```python
   # Call CHAMPSTagService for each micro-step
   tags = await champs_service.generate_tags(
       description,
       estimated_minutes,
       leaf_type
   )
   # Returns: ["💬 Communication", "🎯 Focused", "⚡ Quick Win"]
   ```

#### Step 4: Classification & Automation
**File**: `src/agents/classifier_agent.py:74-101`

**Purpose**: Determine if micro-step can be automated

**Logic**:
```python
async def classify_micro_step(micro_step: MicroStep) -> MicroStep:
    # Try to find automation in IntegrationRegistry
    automation = integration_registry.find_automation(
        action=micro_step.description,
        context={"entities": []}
    )

    if automation:
        # Automatable!
        micro_step.leaf_type = LeafType.DIGITAL
        micro_step.automation_plan = automation.plan
    elif needs_clarification:
        # Ambiguous - need user input
        micro_step.leaf_type = LeafType.UNKNOWN
        micro_step.clarification_needs = [
            ClarificationNeed(
                field="email_recipient",
                question="Who should receive this email?",
                required=True
            )
        ]
    else:
        # Manual human action required
        micro_step.leaf_type = LeafType.HUMAN

    return micro_step
```

#### Step 5: Response Assembly
**File**: `src/api/simple_tasks.py:308-334`

**Final Response**:
```json
{
  "task": {
    "task_id": "temp-uuid-123",
    "title": "Turn off the AC",
    "description": "...",
    "priority": "medium",
    "estimated_hours": 0.5,
    "tags": ["quick-capture", "home-automation"]
  },
  "micro_steps": [
    {
      "step_id": "step-456",
      "description": "Turn off AC unit",
      "short_label": "AC off",
      "estimated_minutes": 2,
      "icon": "❄️",
      "leaf_type": "DIGITAL",
      "delegation_mode": "do",
      "tags": ["🎯 Focused", "⚡ Quick Win"],
      "is_leaf": true,
      "level": 0
    }
  ],
  "breakdown": {
    "total_steps": 1,
    "digital_count": 1,
    "human_count": 0,
    "total_minutes": 2
  },
  "needs_clarification": false,
  "clarifications": [],
  "processing_time_ms": 234
}
```

---

## 3. Hierarchy & Decomposition System

### Task Hierarchy Levels (7 Levels)

```
Level 0: Initiative    (6-12 months, strategic goals)
Level 1: Phase         (2-3 months, major milestones)
Level 2: Epic          (2-4 weeks, features)
Level 3: Sprint        (1 week, deliverables)
Level 4: Task          (1-3 days, work items)
Level 5: Subtask       (2-8 hours, sub-components)
Level 6: Step          (2-30 minutes, atomic actions)
```

### MicroStep Model
**File**: `src/core/task_models.py:115-175`

```python
class MicroStep(BaseModel):
    step_id: str
    parent_task_id: str                    # FK to tasks table
    step_number: int                       # Order in sequence (1, 2, 3...)
    description: str
    short_label: str | None                # "Gather", "Draft", "Send" (1-2 words)
    estimated_minutes: int                 # 1-15 minutes (target 2-5)
    icon: str | None                       # Emoji: "📧", "🛒", "✍️"

    # Delegation
    delegation_mode: DelegationMode        # DO, DO_WITH_ME, DELEGATE, DELETE

    # Status
    status: TaskStatus                     # TODO, IN_PROGRESS, COMPLETED

    # Classification
    leaf_type: LeafType                    # DIGITAL, HUMAN, UNKNOWN
    automation_plan: AutomationPlan | None # Structured automation steps
    clarification_needs: list[ClarificationNeed]

    # CHAMPS tags
    tags: list[str]                        # ["💬 Communication", "⚡ Quick Win"]

    # Time tracking
    actual_minutes: int | None
    created_at: datetime
    completed_at: datetime | None
```

### Decomposition Algorithm
**File**: `src/agents/decomposer_agent.py:102-234`

**Recursive Breakdown**:
```python
async def decompose_task(task: Task, user_id: str, depth: int = 0):
    # Base case: Stop if atomic (can't decompose further)
    if _is_atomic(task):
        return [task]

    # Determine scope
    scope = task.determine_scope()  # SIMPLE/MULTI/PROJECT

    if scope == TaskScope.SIMPLE:
        # <10 minutes - no decomposition needed
        return [task]

    elif scope == TaskScope.MULTI:
        # 10-60 minutes - break into micro-steps
        micro_steps = await split_proxy_agent.split_task(task)

        # Generate CHAMPS tags for each step
        for step in micro_steps:
            step.tags = await champs_service.generate_tags(step)

        return micro_steps

    elif scope == TaskScope.PROJECT:
        # >60 minutes - break into subtasks, then recurse
        subtasks = await _generate_subtasks(task)

        all_steps = []
        for subtask in subtasks:
            steps = await decompose_task(subtask, user_id, depth + 1)
            all_steps.extend(steps)

        return all_steps
```

### Atomic Step Detection
**File**: `src/agents/decomposer_agent.py:309-328`

```python
def _is_atomic(micro_step: MicroStep) -> bool:
    """Check if micro-step cannot be decomposed further"""

    # DIGITAL tasks: any duration is fine (AI can handle)
    if micro_step.leaf_type == LeafType.DIGITAL:
        return True

    # HUMAN tasks: max 5 minutes (ADHD-friendly sweet spot)
    if micro_step.leaf_type == LeafType.HUMAN:
        return micro_step.estimated_minutes <= 5

    # Unknown: needs clarification
    return False
```

---

## 4. Database Schema

### Micro-Steps Table
**Migration**: `src/database/migrations/007_add_micro_steps.sql` + `011_add_micro_steps_hierarchy.sql`

```sql
CREATE TABLE micro_steps (
    -- Identity
    step_id TEXT PRIMARY KEY,
    parent_task_id TEXT NOT NULL,

    -- Core fields
    description TEXT NOT NULL,
    short_label TEXT,                   -- 1-2 word UI label
    estimated_minutes INTEGER,          -- 2-15 minute range
    icon TEXT,                          -- Emoji icon

    -- Classification
    leaf_type TEXT,                     -- 'DIGITAL', 'HUMAN', 'UNKNOWN'
    delegation_mode TEXT,               -- 'DO', 'DO_WITH_ME', 'DELEGATE', 'DELETE'

    -- Automation
    automation_plan TEXT,               -- JSON: AutomationPlan

    -- CHAMPS tags
    tags TEXT,                          -- JSON array of CHAMPS tags

    -- Status
    status TEXT DEFAULT 'TODO',
    completed INTEGER DEFAULT 0,
    completed_at TIMESTAMP,

    -- Hierarchy (Migration 011)
    parent_step_id TEXT,                -- Self-referential for nesting
    step_number INTEGER,                -- Order in sequence
    level INTEGER DEFAULT 0,            -- Depth in tree (0-6)
    is_leaf INTEGER DEFAULT 1,          -- Can decompose?
    decomposition_state TEXT,           -- 'stub', 'decomposing', 'decomposed', 'atomic'

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_step_id) REFERENCES micro_steps(step_id) ON DELETE CASCADE
);

CREATE INDEX idx_micro_steps_parent_task ON micro_steps(parent_task_id);
CREATE INDEX idx_micro_steps_parent_step ON micro_steps(parent_step_id);
CREATE INDEX idx_micro_steps_leaf_type ON micro_steps(leaf_type);
CREATE INDEX idx_micro_steps_status ON micro_steps(status);
CREATE INDEX idx_micro_steps_tags ON micro_steps(tags);
```

### Tasks Table (Hierarchy Fields)
**File**: `src/core/task_models.py:187-343`

```python
class Task(BaseModel):
    # ... standard fields ...

    # Hierarchy (Progressive Disclosure Support)
    level: int = Field(default=0, ge=0, le=6)  # 0=Initiative, 6=Step
    custom_emoji: str | None                   # AI-generated icon
    decomposition_state: DecompositionState    # stub/decomposing/decomposed/atomic
    children_ids: list[str]                    # IDs of child tasks
    total_minutes: int                         # Total time including descendants
    is_leaf: bool                              # True if atomic leaf node
    leaf_type: LeafType | None                 # DIGITAL/HUMAN (for leaves only)
```

---

## 5. Integration Points

### A. Frontend ↔ Backend

**Capture Flow**:
```
User types in CaptureMode.tsx
    ↓
POST /api/v1/mobile/quick-capture
    ↓
Response: {task, micro_steps, clarifications}
    ↓
Display in MicroStepsBreakdown.tsx
    ↓
Show in AsyncJobTimeline.tsx
```

**Missing Connection**:
- ❌ No auto-save after capture
- ❌ User must manually call `/api/v1/capture/save`
- ❌ If user doesn't save, micro-steps are lost

### B. Database Persistence

**Save Endpoint**: `POST /api/v1/capture/save`
**File**: `src/api/capture.py:255-322`

```python
@router.post("/capture/save")
async def save_capture(request: SaveCaptureRequest):
    # 1. Create Task
    task_data = TaskCreationData(...)
    created_task = task_service.create_task(task_data)

    # 2. Save MicroSteps
    task_repo = EnhancedTaskRepository(db)
    for micro_step in micro_steps:
        micro_step.parent_task_id = created_task.task_id
        step_id = task_repo.save_micro_step(micro_step)

    return {"success": true, "task_id": created_task.task_id}
```

**Repository Method**: `EnhancedTaskRepository.save_micro_step()`
**File**: `src/repositories/enhanced_repositories.py:654-741`

```python
def save_micro_step(self, micro_step: MicroStep) -> str:
    """Insert MicroStep into database"""

    # Convert enums to values
    leaf_type_value = micro_step.leaf_type.value if micro_step.leaf_type else None

    # Serialize complex fields to JSON
    automation_plan_json = json.dumps(micro_step.automation_plan.dict())
    tags_json = json.dumps(micro_step.tags)

    # Insert SQL
    cursor.execute("""
        INSERT INTO micro_steps (
            step_id, parent_task_id, description, estimated_minutes,
            leaf_type, delegation_mode, automation_plan, tags, ...
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ...)
    """, values)

    return micro_step.step_id
```

### C. Retrieval Flow

**Get Task with Micro-Steps**: `GET /api/v1/tasks/{task_id}`
**File**: `src/api/tasks.py:201-259`

```python
@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    # Get task
    task = task_service.get_task(task_id)

    # Get micro-steps
    micro_steps_data = db.execute("""
        SELECT
            step_id, description, estimated_minutes,
            leaf_type, icon, short_label, tags, status
        FROM micro_steps
        WHERE parent_task_id = ?
        ORDER BY step_number  -- ❌ PROBLEM: step_number not selected!
    """, (task_id,))

    return {"task": task, "micro_steps": micro_steps}
```

**Issue**: Query doesn't SELECT `step_number`, so ordering information is lost!

---

## 6. What's Working ✅

### A. Capture & Decomposition
- ✅ Mobile quick-capture endpoint accepts text and returns structured response
- ✅ DecomposerAgent successfully breaks tasks into 2-15 minute steps
- ✅ Hierarchy levels (0-6) are correctly set
- ✅ Icons and short_labels are generated
- ✅ CHAMPS tags service exists and can generate tags

### B. Classification
- ✅ ClassifierAgent identifies DIGITAL vs HUMAN tasks
- ✅ Clarification questions are generated for ambiguous cases
- ✅ Automation plans are created for known automation types

### C. Database
- ✅ Schema is correct with all necessary fields
- ✅ Indexes exist for performance
- ✅ Foreign key constraints enforce referential integrity
- ✅ Repository save method works correctly

### D. Frontend
- ✅ CaptureMode component displays capture UI
- ✅ MicroStepsBreakdown shows micro-steps with icons and labels
- ✅ AsyncJobTimeline displays task preview cards
- ✅ Expandable/collapsible micro-step lists

---

## 7. What's Broken: Critical Issues ❌

### P0 - Critical (Data Loss)

#### Issue 1: Micro-Steps Not Auto-Saved
**Location**: `src/api/simple_tasks.py:241-362`

**Problem**:
- Quick-capture endpoint returns micro-steps but doesn't persist them
- User must manually call `/api/v1/capture/save` separately
- If user doesn't save, all micro-steps are lost forever

**Impact**: **Data loss** - users lose their decomposed micro-steps

**Evidence**:
```python
# src/api/simple_tasks.py:241-362
@router.post("/mobile/quick-capture")
async def quick_capture(request: dict):
    # ... analyze and decompose ...

    # Return response (NO DATABASE SAVE!)
    return {
        "task": task.dict(),
        "micro_steps": [step.dict() for step in micro_steps],
        ...
    }
    # ❌ Micro-steps exist only in memory - not persisted!
```

**Fix**: Auto-save task and micro-steps in quick-capture endpoint

---

#### Issue 2: Missing `step_number` in Queries
**Location**: `src/api/tasks.py:313-319`

**Problem**:
- Database queries SELECT micro-step fields but omit `step_number`
- Ordering information is lost when retrieving from database
- Micro-steps display in random order instead of correct sequence

**Impact**: **Poor UX** - steps appear out of order

**Evidence**:
```python
# src/api/tasks.py:313-319
micro_steps_data = cursor.execute("""
    SELECT
        step_id, description, estimated_minutes,
        leaf_type, icon, short_label, tags, status
        -- ❌ Missing: step_number!
    FROM micro_steps
    WHERE parent_task_id = ?
    ORDER BY step_number  -- Can't order by field that's not selected!
""").fetchall()
```

**Fix**: Add `step_number` to SELECT clause

---

### P1 - High Priority (Poor UX)

#### Issue 3: Hardcoded 30-Minute Time Estimates
**Location**: Multiple files

**Problem**:
- All tasks default to 0.5 hours (30 minutes) regardless of complexity
- No actual time estimation logic exists
- LLM is told to "default to 0.5 hours for simple tasks"

**Impact**: **Poor UX** - all estimates are wrong

**Root Causes**:
1. `ParsedTask` model default: `estimated_hours: float = Field(default=0.5)`
2. LLM prompt instruction: "Default to 0.5 hours for simple tasks"
3. Fallback in capture_agent.py: `estimated_hours = analysis.get("estimated_hours", 0.5)`

**Fix**:
- Remove default from model
- Update LLM prompt to actually estimate time
- Add keyword-based estimation logic for fallback

---

#### Issue 4: Incomplete Clarification Flow
**Location**: `src/api/capture.py:192-252`

**Problem**:
- Clarification endpoint exists (`/api/v1/capture/clarify`)
- But unclear how frontend triggers it
- No documentation on clarification flow
- Untested end-to-end

**Impact**: **Missing feature** - users can't refine ambiguous tasks

**Fix**: Complete clarification flow with frontend integration

---

### P2 - Medium Priority

#### Issue 5: Progressive Disclosure Not Fully Implemented
**Location**: `src/api/tasks.py:706-741`

**Problem**:
- Endpoint exists: `POST /api/v1/micro-steps/{step_id}/decompose`
- Calls DecomposerAgent but unclear if it works for micro-steps
- No frontend UI to trigger on-demand decomposition
- Untested

**Impact**: **Missing feature** - users can't expand complex steps on demand

---

#### Issue 6: CHAMPS Tags May Have Issues
**Location**: `src/agents/decomposer_agent.py:236-259`

**Problem**:
- Code calls CHAMPSTagService but may have errors
- Unclear if tags are actually generated or just placeholders
- Need to test CHAMPS tag generation end-to-end

**Impact**: **Potential bug** - tags might always be "🎯 Focused", "⚡ Quick Win"

---

## 8. Recommended Fixes (Priority Order)

### P0 Fixes (Critical - Data Loss)

#### Fix 1: Auto-Save Micro-Steps in Quick-Capture

**File**: `src/api/simple_tasks.py:241-362`

**Change**:
```python
@router.post("/mobile/quick-capture")
async def quick_capture(request: dict):
    # ... existing capture logic ...

    # ✅ NEW: Auto-save task and micro-steps
    if not clarifications or auto_save:
        # Create task in database
        task_data = TaskCreationData(
            title=task.title,
            description=task.description,
            project_id="default-project",
            priority=task.priority,
            estimated_hours=task.estimated_hours,
            tags=task.tags
        )
        created_task = task_service.create_task(task_data)

        # Save each micro-step
        task_repo = EnhancedTaskRepository(db)
        saved_step_ids = []
        for micro_step in micro_steps:
            micro_step.parent_task_id = created_task.task_id
            step_id = task_repo.save_micro_step(micro_step)
            saved_step_ids.append(step_id)

        return {
            "task": created_task.dict(),
            "micro_steps": [step.dict() for step in micro_steps],
            "saved": True,  # ← NEW
            "task_id": created_task.task_id,  # ← NEW
            "micro_step_ids": saved_step_ids  # ← NEW
        }
    else:
        # Has clarifications - don't save yet
        return {
            "task": task.dict(),
            "micro_steps": [step.dict() for step in micro_steps],
            "saved": False,
            "needs_clarification": True,
            "clarifications": clarifications
        }
```

**Impact**: Prevents data loss, improves UX

---

#### Fix 2: Include `step_number` in All Queries

**File**: `src/api/tasks.py:313-319`

**Change**:
```python
micro_steps_data = cursor.execute("""
    SELECT
        step_id,
        description,
        estimated_minutes,
        step_number,  -- ✅ ADDED
        leaf_type,
        icon,
        short_label,
        tags,
        status,
        delegation_mode,  -- Also useful
        level,  -- Also useful
        is_leaf  -- Also useful
    FROM micro_steps
    WHERE parent_task_id = ?
    ORDER BY step_number ASC
""", (task_id,)).fetchall()
```

**Impact**: Correct ordering of micro-steps

---

### P1 Fixes (High Priority)

#### Fix 3: Improve Time Estimation

**Changes in 3 files**:

**A. Remove Default from ParsedTask Model**
**File**: `src/services/llm_capture_service.py:43-45`
```python
# Before:
estimated_hours: float = Field(default=0.5, ...)

# After:
estimated_hours: float = Field(..., description="Estimated time in hours", ge=0.0, le=100.0)
# No default - LLM must provide estimate
```

**B. Update LLM Prompt**
**File**: `src/services/llm_capture_service.py:190-200`
```python
# Before:
"3. Estimate time in hours (0.1 to 100)",
"- Default to 0.5 hours for simple tasks",

# After:
"3. Estimate time in hours based on task complexity:",
"   - Simple action (reply email, make call): 0.1-0.2 hours (5-10 min)",
"   - Quick task (write doc, research topic): 0.3-0.5 hours (15-30 min)",
"   - Medium task (prepare presentation): 1-2 hours",
"   - Large task (write report, build feature): 3-8 hours",
"   - Project (major initiative): 8+ hours",
"   Provide realistic estimate - do NOT default to 0.5!",
```

**C. Add Keyword-Based Estimation Fallback**
**File**: `src/services/quick_capture_service.py:97-150` (new function)
```python
def _estimate_time_from_keywords(text: str) -> float:
    """Keyword-based time estimation fallback"""
    text_lower = text.lower()
    word_count = len(text.split())

    # Very quick actions (5-10 min)
    if any(word in text_lower for word in ['call', 'email', 'text', 'message']):
        return 0.1  # 5-10 minutes

    # Quick tasks (15-20 min)
    if any(word in text_lower for word in ['check', 'review', 'read', 'reply']):
        return 0.25  # 15 minutes

    # Medium tasks (30-60 min)
    if any(word in text_lower for word in ['write', 'create', 'prepare', 'plan']):
        return 0.5 if word_count < 10 else 1.0

    # Larger tasks (2+ hours)
    if any(word in text_lower for word in ['project', 'build', 'develop', 'design']):
        return 2.0 if word_count < 15 else 4.0

    # Default based on input length
    if word_count <= 5:
        return 0.25  # 15 min
    elif word_count <= 15:
        return 0.5  # 30 min
    else:
        return 1.0  # 1 hour
```

**Impact**: Accurate time estimates instead of always 30 minutes

---

#### Fix 4: Complete Clarification Flow

**New Frontend Integration**:
1. After quick-capture, check `needs_clarification`
2. If true, show clarification modal
3. Call `/api/v1/capture/clarify` with answers
4. Re-run capture with clarified data
5. Save final task

**Impact**: Users can refine ambiguous tasks through Q&A

---

## 9. Key File Locations

### API Endpoints
| File | Purpose |
|------|---------|
| `src/api/capture.py` | Formal capture endpoints (`/api/v1/capture/`, `/capture/save`, `/capture/clarify`) |
| `src/api/simple_tasks.py` | Mobile quick-capture endpoint (`/api/v1/mobile/quick-capture`) |
| `src/api/tasks.py` | Task CRUD, micro-step retrieval, decomposition endpoint |

### Agents
| File | Purpose |
|------|---------|
| `src/agents/capture_agent.py` | Main capture orchestration |
| `src/agents/decomposer_agent.py` | Hierarchical task breakdown, CHAMPS tag generation |
| `src/agents/classifier_agent.py` | DIGITAL/HUMAN classification, clarification generation |
| `src/agents/split_proxy_agent.py` | AI-powered task splitting into micro-steps |

### Services
| File | Purpose |
|------|---------|
| `src/services/quick_capture_service.py` | Task analysis (AI or keyword-based) |
| `src/services/llm_capture_service.py` | LLM-powered structured parsing |
| `src/services/micro_step_service.py` | MicroStep CRUD operations |
| `src/services/champs_tag_service.py` | CHAMPS tag generation |

### Models
| File | Purpose |
|------|---------|
| `src/core/task_models.py` | Task, MicroStep, Project models |

### Database
| File | Purpose |
|------|---------|
| `src/database/migrations/007_add_micro_steps.sql` | Create micro_steps table |
| `src/database/migrations/011_add_micro_steps_hierarchy.sql` | Add hierarchy fields |

### Repository
| File | Purpose |
|------|---------|
| `src/repositories/enhanced_repositories.py` | EnhancedTaskRepository.save_micro_step() |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/components/mobile/modes/CaptureMode.tsx` | Capture UI |
| `frontend/src/components/mobile/MicroStepsBreakdown.tsx` | Micro-step display |
| `frontend/src/components/shared/AsyncJobTimeline.tsx` | Timeline component |

---

## Summary

### Current State
- 🟢 **Capture works**: Text → Task → MicroSteps decomposition is functional
- 🔴 **Critical bug**: Micro-steps are NOT auto-saved (data loss!)
- 🟡 **Poor UX**: All time estimates are hardcoded to 30 minutes
- 🟡 **Incomplete**: Clarification flow exists but not fully integrated

### Next Steps
1. **P0**: Implement auto-save in quick-capture endpoint ← **CRITICAL**
2. **P0**: Fix step_number query issue ← **CRITICAL**
3. **P1**: Improve time estimation logic
4. **P1**: Complete clarification flow
5. **P2**: Test progressive disclosure
6. **P2**: Verify CHAMPS tag generation

---

**Report Author**: Claude (Anthropic)
**Date**: October 23, 2025
**Status**: Analysis Complete - Ready for Implementation

---

*System works but has critical data loss bug. Fix P0 issues immediately.*
