# BE-05 Task Splitting Service - Database & API Schema

**Last Updated**: November 13, 2025
**Status**: ✅ Implemented
**Purpose**: ADHD-optimized task breakdown into 2-5 minute micro-steps

---

## Overview

The BE-05 Task Splitting Service enables ADHD-friendly task decomposition by:
1. Analyzing task complexity and scope (SIMPLE/MULTI/PROJECT)
2. Breaking MULTI-scope tasks into 3-5 micro-steps (2-5 minutes each)
3. Supporting hierarchical decomposition (progressive disclosure)
4. Providing dopamine rewards (XP) for completion

---

## Database Schema

### `micro_steps` Table

**Primary table for storing split tasks (2-5 minute ADHD-optimized chunks)**

```sql
CREATE TABLE micro_steps (
    -- Core identification
    step_id TEXT PRIMARY KEY,
    parent_task_id TEXT NOT NULL,
    step_number INTEGER DEFAULT 1,

    -- Content
    description TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL CHECK(estimated_minutes >= 2 AND estimated_minutes <= 5),

    -- Task management
    delegation_mode TEXT DEFAULT 'do',  -- DO, DO_WITH_ME, DELEGATE, DELETE
    status TEXT DEFAULT 'todo',         -- todo, in_progress, done
    actual_minutes INTEGER,

    -- Hierarchical structure (recursive micro-steps)
    parent_step_id TEXT,                -- Parent micro-step ID (for nested breakdown)
    level INTEGER DEFAULT 0,            -- Depth in tree (0 = top-level)
    is_leaf INTEGER DEFAULT 1,          -- Can be decomposed? (0/1)
    decomposition_state TEXT DEFAULT 'atomic',  -- stub, decomposing, decomposed, atomic

    -- UI metadata
    short_label TEXT,                   -- 1-2 word label
    icon TEXT,                          -- Emoji icon

    -- Task categorization
    leaf_type TEXT,                     -- 'DIGITAL' or 'HUMAN'
    automation_plan TEXT,               -- JSON: AutomationPlan details

    -- Completion tracking
    completed INTEGER DEFAULT 0,        -- Boolean: 0=false, 1=true
    completed_at TIMESTAMP,
    energy_level INTEGER,               -- 1-5 scale for reflection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relationships
    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_step_id) REFERENCES micro_steps(step_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_micro_steps_parent_task ON micro_steps(parent_task_id);
CREATE INDEX idx_micro_steps_completed ON micro_steps(completed);
CREATE INDEX idx_micro_steps_leaf_type ON micro_steps(leaf_type);
CREATE INDEX idx_micro_steps_ready ON micro_steps(completed, leaf_type);
```

**Key Constraints:**
- `estimated_minutes` must be 2-5 (ADHD-optimized chunks)
- CASCADE delete: removing a task removes all its micro-steps
- Self-referencing: `parent_step_id` enables recursive decomposition

---

## API Endpoints

### 1. Split Task into Micro-Steps

**POST** `/api/v1/tasks/{task_id}/split`

Split a task into 3-5 micro-steps using AI (SplitProxyAgent)

**Request:**
```json
{
  "user_id": "user-123"
}
```

**Response (SIMPLE scope - no splitting needed):**
```json
{
  "task_id": "task-456",
  "scope": "simple",
  "micro_steps": [],
  "next_action": {
    "step_number": 1,
    "description": "Complete email report",
    "estimated_minutes": 5
  },
  "message": "Task is simple enough - no splitting needed. Just do it!"
}
```

**Response (MULTI scope - task split):**
```json
{
  "task_id": "task-456",
  "scope": "multi",
  "micro_steps": [
    {
      "step_id": "step-001",
      "step_number": 1,
      "description": "Open email client and create new draft",
      "estimated_minutes": 2,
      "delegation_mode": "do",
      "status": "todo",
      "short_label": "Open email",
      "icon": "📧"
    },
    {
      "step_id": "step-002",
      "step_number": 2,
      "description": "Write report summary in bullet points",
      "estimated_minutes": 3,
      "delegation_mode": "do",
      "status": "todo",
      "short_label": "Write summary",
      "icon": "✍️"
    },
    {
      "step_id": "step-003",
      "step_number": 3,
      "description": "Attach files and send email",
      "estimated_minutes": 2,
      "delegation_mode": "do",
      "status": "todo",
      "short_label": "Send",
      "icon": "📤"
    }
  ],
  "next_action": {
    "step_number": 1,
    "description": "Open email client and create new draft",
    "estimated_minutes": 2
  },
  "total_estimated_minutes": 7
}
```

**Response (PROJECT scope - too complex):**
```json
{
  "task_id": "task-789",
  "scope": "project",
  "micro_steps": [],
  "suggestion": "This is a complex project (60+ minutes). Consider breaking it into smaller subtasks first, then split each subtask into micro-steps.",
  "estimated_phases": [
    {
      "phase": "Planning",
      "description": "Research and plan approach",
      "estimated_minutes": 30
    },
    {
      "phase": "Implementation",
      "description": "Build the feature",
      "estimated_minutes": 120
    }
  ]
}
```

---

### 2. Get Task Micro-Steps

**GET** `/api/v1/tasks/{task_id}/micro-steps`

Retrieve all micro-steps for a task with completion statistics

**Response:**
```json
{
  "task_id": "task-456",
  "micro_steps": [
    {
      "step_id": "step-001",
      "step_number": 1,
      "description": "Open email client",
      "estimated_minutes": 2,
      "delegation_mode": "do",
      "status": "done",
      "actual_minutes": 3,
      "completed_at": "2025-11-13T14:30:00Z"
    },
    {
      "step_id": "step-002",
      "step_number": 2,
      "description": "Write summary",
      "estimated_minutes": 3,
      "delegation_mode": "do",
      "status": "in_progress",
      "actual_minutes": null,
      "completed_at": null
    }
  ],
  "stats": {
    "total": 3,
    "completed": 1,
    "incomplete": 2,
    "completion_percentage": 33.3,
    "total_estimated_minutes": 7,
    "total_actual_minutes": 3
  }
}
```

---

### 3. Complete Micro-Step (Dopamine Hit!)

**PATCH** `/api/v1/micro-steps/{step_id}/complete`

Mark a micro-step as complete and award XP for dopamine reward

**Request:**
```json
{
  "actual_minutes": 2
}
```

**Response:**
```json
{
  "step_id": "step-001",
  "status": "completed",
  "actual_minutes": 2,
  "completed_at": "2025-11-13T14:30:00Z",
  "xp_earned": 15,
  "message": "Great job! Keep the momentum going!"
}
```

**XP Calculation:**
- Base XP: 10 points per step
- Speed Bonus: +5 if completed faster than estimated
- Streak Bonus: +10 if first step of the day (future)

---

### 4. Get Micro-Step Children (Hierarchical)

**GET** `/api/v1/micro-steps/{step_id}/children`

Get child micro-steps for progressive disclosure UI

**Response:**
```json
{
  "step_id": "step-parent-123",
  "children": [
    {
      "step_id": "step-child-001",
      "description": "Substep 1 of parent",
      "estimated_minutes": 2,
      "icon": "🔹",
      "level": 1,
      "parent_step_id": "step-parent-123",
      "is_leaf": true
    }
  ],
  "total": 1
}
```

**Use Case:** User clicks "expand" on a complex micro-step to see its atomic sub-steps

---

### 5. Decompose Micro-Step (Progressive Breakdown)

**POST** `/api/v1/micro-steps/{step_id}/decompose`

Break down a complex micro-step (>5 min, `is_leaf=False`) into smaller atomic steps using AI

**Request:**
```json
{
  "user_id": "user-123"
}
```

**Response:**
```json
{
  "step_id": "step-parent-123",
  "children": [
    {
      "step_id": "step-child-001",
      "description": "First atomic substep",
      "estimated_minutes": 2,
      "level": 1,
      "is_leaf": true,
      "delegation_mode": "do"
    },
    {
      "step_id": "step-child-002",
      "description": "Second atomic substep",
      "estimated_minutes": 3,
      "level": 1,
      "is_leaf": true,
      "delegation_mode": "do"
    }
  ],
  "total_children": 2,
  "message": "Step decomposed into 2 child steps"
}
```

**Flow:**
1. Check if step can be decomposed (`is_leaf=False`, `estimated_minutes > 5`)
2. Update state to "decomposing"
3. Use DecomposerAgent to break down using AI
4. Save children with `parent_step_id` pointing to parent
5. Update parent state to "decomposed"

---

## Data Flow Diagrams

### 1. Task Splitting Flow

```
User creates task → POST /tasks/{task_id}/split
                  ↓
         SplitProxyAgent.split_task()
                  ↓
         _determine_task_scope()
         ├─ SIMPLE (< 15 min)  → Return "just do it" message
         ├─ MULTI (15-60 min)  → Generate 3-5 micro-steps with AI
         └─ PROJECT (60+ min)  → Suggest breaking into subtasks first
                  ↓
         [MULTI] _generate_micro_steps_with_ai()
                  ↓
         INSERT INTO micro_steps (batch)
                  ↓
         Return: micro_steps array + next_action
```

### 2. Micro-Step Retrieval Flow

```
GET /tasks/{task_id}/micro-steps
         ↓
Query: SELECT * FROM micro_steps
       WHERE parent_task_id = ?
       AND parent_step_id IS NULL  -- Top-level only
       ORDER BY step_number
         ↓
Calculate stats (total, completed, percentage)
         ↓
Return: Array of micro_steps + completion stats
```

### 3. Completion Flow with Dopamine Reward

```
User completes step → PATCH /micro-steps/{step_id}/complete
                   ↓
         UPDATE micro_steps SET
           status = 'completed',
           completed = 1,
           completed_at = NOW(),
           actual_minutes = ?
                   ↓
         Calculate XP reward:
           - Base: 10 XP
           - Speed bonus: +5 if faster than estimate
           - Streak bonus: +10 if first of day
                   ↓
         Return: xp_earned + motivational message

         (Future: Update user XP, trigger streak counter)
```

### 4. Hierarchical Decomposition Flow

```
User expands complex step → POST /micro-steps/{step_id}/decompose
                          ↓
         Check: is_leaf=False AND estimated_minutes > 5
                          ↓
         DecomposerAgent.decompose_task()
         (Uses Claude/GPT-4 to break down)
                          ↓
         Generate 2-5 child micro-steps
                          ↓
         INSERT children WITH parent_step_id = {step_id}
         AND level = parent.level + 1
                          ↓
         UPDATE parent: decomposition_state = 'decomposed'
                          ↓
         Return: Children array + metadata
```

---

## Pydantic Models

### Service Layer: MicroStep

**File:** `src/services/micro_step_service.py`

```python
class MicroStep(BaseModel):
    """Service layer model matching database schema"""

    # Core fields
    step_id: str
    parent_task_id: str
    description: str
    estimated_minutes: int  # 2-5 minutes enforced

    # Classification
    leaf_type: str | None  # "DIGITAL" or "HUMAN"
    delegation_mode: str | None  # "DO", "DO_WITH_ME", "DELEGATE", "DELETE"
    automation_plan: dict | None  # JSON automation details
    tags: list[str] | None  # CHAMPS-based tags

    # Completion tracking
    completed: bool = False
    completed_at: datetime | None = None
    energy_level: int | None = None  # 1-5 scale for reflection
    created_at: datetime = Field(default_factory=datetime.now)

    # Hierarchical structure
    parent_step_id: str | None = None  # Parent micro-step
    level: int = 0  # Depth in tree
    is_leaf: bool = True  # Can be decomposed?
    decomposition_state: str = "atomic"  # stub, decomposing, decomposed, atomic
    short_label: str | None = None  # 1-2 word UI label
    icon: str | None = None  # Emoji icon
```

### API Layer: MicroStepResponse

**File:** `src/api/tasks.py`

```python
class MicroStepResponse(BaseModel):
    """API response model for micro-steps"""

    step_id: str
    step_number: int
    description: str
    estimated_minutes: int
    delegation_mode: str
    status: str  # todo, in_progress, done
    actual_minutes: int | None = None
    completed_at: datetime | None = None

    # Hierarchical fields
    parent_step_id: str | None = None
    level: int = 0
    is_leaf: bool = True
    decomposition_state: str = "atomic"
    short_label: str | None = None
    icon: str | None = None
```

---

## Key Features

### 1. ADHD-Optimized Constraints

✅ **2-5 Minute Chunks**: Database CHECK constraint enforces atomic task size
✅ **Dopamine Rewards**: XP system provides immediate feedback loop
✅ **Visual Indicators**: Icons and short labels for quick recognition
✅ **Progressive Disclosure**: Hierarchical decomposition prevents overwhelm

### 2. AI-Powered Intelligence

✅ **Scope Detection**: Automatically determines SIMPLE/MULTI/PROJECT
✅ **Smart Splitting**: Claude/GPT-4 generates context-aware micro-steps
✅ **Rule-Based Fallback**: Predefined patterns for common task types (email, shopping, calls)
✅ **CHAMPS Integration**: AI-generated tags for task categorization

### 3. Hierarchical Decomposition

✅ **Recursive Structure**: `parent_step_id` enables unlimited nesting
✅ **Progressive Disclosure**: User can expand complex steps on-demand
✅ **Level Tracking**: `level` field indicates tree depth
✅ **State Management**: `decomposition_state` tracks breakdown progress

### 4. Automation Preparation

✅ **DIGITAL vs HUMAN**: Classifies steps for future automation
✅ **Automation Plans**: JSON field stores automation metadata
✅ **Delegation Modes**: DO/DO_WITH_ME/DELEGATE/DELETE for workflow routing

---

## Example SQL Queries

### Get all incomplete micro-steps for a task
```sql
SELECT * FROM micro_steps
WHERE parent_task_id = 'task-123'
  AND completed = 0
  AND parent_step_id IS NULL  -- Top-level only
ORDER BY step_number;
```

### Get next incomplete micro-step (Hunter mode)
```sql
SELECT * FROM micro_steps
WHERE parent_task_id = 'task-123'
  AND completed = 0
ORDER BY step_number
LIMIT 1;
```

### Get completion stats for a task
```sql
SELECT
  COUNT(*) as total,
  SUM(completed) as completed,
  COUNT(*) - SUM(completed) as incomplete,
  (SUM(completed) * 100.0 / COUNT(*)) as completion_percentage,
  SUM(estimated_minutes) as total_estimated_minutes,
  SUM(CASE WHEN completed = 1 THEN actual_minutes ELSE 0 END) as total_actual_minutes
FROM micro_steps
WHERE parent_task_id = 'task-123'
  AND parent_step_id IS NULL;  -- Top-level only
```

### Get hierarchical tree (all levels)
```sql
-- Top-level steps
SELECT * FROM micro_steps
WHERE parent_task_id = 'task-123'
  AND parent_step_id IS NULL
ORDER BY step_number;

-- Children of a specific step
SELECT * FROM micro_steps
WHERE parent_step_id = 'step-parent-123'
ORDER BY step_number;

-- Recursive CTE for full tree (SQLite 3.8.3+)
WITH RECURSIVE step_tree AS (
  -- Base: top-level steps
  SELECT step_id, description, level, parent_step_id, step_number
  FROM micro_steps
  WHERE parent_task_id = 'task-123' AND parent_step_id IS NULL

  UNION ALL

  -- Recursive: children
  SELECT m.step_id, m.description, m.level, m.parent_step_id, m.step_number
  FROM micro_steps m
  INNER JOIN step_tree st ON m.parent_step_id = st.step_id
)
SELECT * FROM step_tree ORDER BY level, step_number;
```

### Get DIGITAL-only steps ready for automation
```sql
SELECT * FROM micro_steps
WHERE parent_task_id = 'task-123'
  AND completed = 0
  AND leaf_type = 'DIGITAL'
ORDER BY step_number;
```

---

## Service Layer Methods

**File:** `src/services/micro_step_service.py`

### Core CRUD Operations

```python
class MicroStepService:
    async def create_micro_step(data: MicroStepCreateData) -> MicroStep
    def get_micro_step(step_id: str) -> MicroStep | None
    def get_micro_steps_by_task(parent_task_id: str) -> list[MicroStep]
    def update_micro_step(step_id: str, data: MicroStepUpdateData) -> MicroStep
    def delete_micro_step(step_id: str) -> bool
```

### Query Methods

```python
    def get_incomplete_micro_steps(parent_task_id: str) -> list[MicroStep]
    def get_next_micro_step(parent_task_id: str) -> MicroStep | None
    def get_completion_percentage(parent_task_id: str) -> float
    def get_total_estimated_minutes(parent_task_id: str) -> int
    def get_completion_stats(parent_task_id: str) -> dict
```

### Hierarchical Methods

```python
    def get_children(parent_step_id: str) -> list[MicroStep]
    async def decompose_step(step_id: str, user_id: str) -> dict
    def can_be_decomposed(step: MicroStep) -> bool
```

### AI Integration

```python
    async def generate_champs_tags(
        description: str,
        estimated_minutes: int,
        leaf_type: str = "HUMAN"
    ) -> list[str]
```

---

## File Locations

### Core Implementation
- **Migration**: `src/database/migrations/007_add_micro_steps.sql`
- **Service**: `src/services/micro_step_service.py`
- **API Endpoints**: `src/api/tasks.py` (lines 542-749)
- **Split Agent**: `src/agents/split_proxy_agent.py`
- **Decomposer Agent**: `src/agents/decomposer_agent.py`

### Tests
- **Service Tests**: `src/services/tests/test_micro_step_service.py`
- **Agent Tests**: `src/agents/tests/test_split_proxy_agent.py`
- **API Tests**: `src/api/tests/test_task_splitting_api.py`
- **Schema Tests**: `src/database/tests/test_micro_steps_schema.py`

### Models
- **Database ORM**: `src/database/models.py` (line 150)
- **Core Models**: `src/core/task_models.py`
- **Service Models**: `src/services/micro_step_service.py` (lines 26-84)

---

## Related Documentation

- **[SplitProxyAgent Design](../../../docs/architecture/agent-architecture-overview.md)** - Agent architecture
- **[CHAMPS Framework](../../../docs/design/CHAMPS_FRAMEWORK.md)** - Task categorization system
- **[Dopamine Reward Service](../../../docs/architecture/gamification-system.md)** - XP and rewards
- **[Hunter Mode Guide](../../../docs/guides/HUMAN_TESTING_PROCESS.md)** - Step-by-step execution UI

---

**Navigation**: [↑ Backend Reference](../) | [📊 Status](../../../status/backend/) | [🏠 Agent Resources](../../../)
