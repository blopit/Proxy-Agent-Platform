# 🔄 Pipelex Workflow System Integration Specification

**Document Type**: Technical Integration Specification
**Version**: 1.0
**Status**: Approved for Implementation
**Last Updated**: 2025-01-28
**Estimated Implementation**: 16 weeks (4 phases)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Strategic Vision](#strategic-vision)
3. [Architecture Overview](#architecture-overview)
4. [Core Concepts](#core-concepts)
5. [Database Schema](#database-schema)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Workflow Examples](#workflow-examples)
9. [Repository Infrastructure](#repository-infrastructure)
10. [Security & Privacy](#security--privacy)
11. [Implementation Roadmap](#implementation-roadmap)
12. [Testing Strategy](#testing-strategy)
13. [Success Metrics](#success-metrics)
14. [References](#references)

---

## 📊 Executive Summary

### What is This Document?

This specification defines the complete integration of **Pipelex** (open-source declarative AI workflow language) into the Proxy-Agent-Platform to enable:

1. **User-facing workflow repository** - Online library of reusable AI-powered workflows
2. **Downloadable workflows** - Users download `.plx` files to their instance
3. **AI execution engine** - Platform executes workflows using user's LLM provider
4. **Community marketplace** - Users create, share, and monetize workflows
5. **Business workflows** - Enterprise-grade process automation (future)

### Why Pipelex?

| Requirement | Traditional Templates | Pipelex Workflows |
|-------------|----------------------|-------------------|
| **Static steps** | ✅ Pre-defined micro-steps | ✅ Dynamic AI-generated steps |
| **Context-aware** | ❌ Same for everyone | ✅ Adapts to user energy, schedule, context |
| **Composable** | ❌ Isolated templates | ✅ Pipes chain together |
| **Multi-LLM** | ❌ Platform-locked | ✅ User chooses provider |
| **Shareable** | ⚠️ JSON export | ✅ Human-readable `.plx` files |
| **Editable** | ❌ UI-only editing | ✅ Direct file editing (power users) |
| **Validated** | ⚠️ API validation only | ✅ Typed concepts enforce structure |

### Key Benefits

**For ADHD Users**:
- 🎯 Workflows adapt to current energy level (no overwhelm)
- 🤖 AI generates personalized micro-steps (no decision paralysis)
- 🔄 Reusable patterns reduce cognitive load
- 🎨 Visual workflow preview before execution

**For Platform**:
- 📈 Differentiation from competitors (AI-native workflows)
- 💰 New revenue stream (premium workflows, API credits)
- 👥 Community engagement (user-created workflows)
- 🚀 Faster feature development (workflows instead of code)

---

## 🎯 Strategic Vision

### The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                   WORKFLOW ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   CREATORS   │      │   PLATFORM   │      │    USERS     │ │
│  │              │      │              │      │              │ │
│  │ • Write .plx │─────▶│ • Host files │─────▶│ • Download   │ │
│  │ • Submit     │      │ • Validate   │      │ • Execute    │ │
│  │ • Earn $     │      │ • Execute AI │      │ • Customize  │ │
│  │ • Iterate    │◀─────│ • Collect $  │◀─────│ • Review     │ │
│  └──────────────┘      └──────────────┘      └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                    ┌───────────────────────┐
                    │   WORKFLOW LIBRARY    │
                    ├───────────────────────┤
                    │ • Personal (50+)      │
                    │ • Business (30+)      │
                    │ • Academic (20+)      │
                    │ • Creative (20+)      │
                    │ • Health (15+)        │
                    └───────────────────────┘
```

### User Journey

**Before Pipelex** (Static Templates):
```
1. User creates task "Morning Routine"
2. Selects template with fixed steps: Shower → Breakfast → Plan
3. Steps are the same every day
4. User manually adjusts if energy is low
```

**After Pipelex** (AI Workflows):
```
1. User creates task "Morning Routine"
2. Downloads "Adaptive Morning Routine" workflow
3. Workflow executes:
   - Reads user's energy level (from EnergyGauge)
   - Reads today's calendar (from CompassZones)
   - AI generates personalized 3-5 steps
   - Steps adapt: Low energy = shorter routine, High energy = full routine
4. Task appears in Hunter Mode with AI-generated chevron steps
5. User completes task → Earns XP → Feeds pet → Celebration!
```

### Market Positioning

**Competitors**:
- Todoist/Asana: ❌ No AI workflows
- Notion: ⚠️ Manual template creation (no AI)
- Zapier/Make.com: ⚠️ Business automation (not personal productivity)
- ClickUp: ⚠️ Complex UI (overwhelming for ADHD)

**Our Position**:
- ✅ AI-native workflows
- ✅ ADHD-optimized UX
- ✅ Community-driven marketplace
- ✅ Personal + Business use cases
- ✅ Open standard (Pipelex is MIT licensed)

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ WorkflowBrowser│  │ WorkflowPreview│  │ WorkflowEditor │   │
│  │ (Scout Mode)   │  │ (Modal)        │  │ (Advanced)     │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER (FastAPI)                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ /api/v1/workflows                                      │    │
│  │ • GET /workflows (browse)                              │    │
│  │ • GET /workflows/{id} (details)                        │    │
│  │ • POST /workflows/{id}/download (get .plx file)        │    │
│  │ • POST /workflows/{id}/execute (run workflow)          │    │
│  │ • POST /workflows (submit new - authenticated)         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW EXECUTION ENGINE                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ PipelexWorkflowExecutor                                │    │
│  │ • Load .plx file from S3/local                         │    │
│  │ • Inject user context (energy, schedule, zones)        │    │
│  │ • Execute pipeline (Pipelex SDK)                       │    │
│  │ • Transform output → TaskCreate model                  │    │
│  │ • Create task with micro-steps                         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │    Redis     │  │   S3/CDN     │         │
│  │ • Metadata   │  │ • Cache      │  │ • .plx files │         │
│  │ • Stats      │  │ • Sessions   │  │ • Assets     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Anthropic    │  │   OpenAI     │  │   Ollama     │         │
│  │ Claude API   │  │   GPT API    │  │ (Local LLM)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Workflow Execution

```
1. USER TRIGGER
   User taps "Run Morning Routine" workflow
   ↓
2. FETCH METADATA
   GET /api/v1/workflows/{workflow_id}
   Returns: { workflow_id, name, plx_file_url, llm_provider }
   ↓
3. LOAD CONTEXT
   Platform fetches user state:
   • Current energy level (from energy_snapshots table)
   • Today's calendar (from compass_zones, tasks tables)
   • User preferences (from user_settings table)
   ↓
4. DOWNLOAD .PLX FILE
   GET {plx_file_url} from S3/CDN
   Parse .plx file into Pipelex Pipeline object
   ↓
5. EXECUTE PIPELINE
   pipeline.run(inputs={
       "user_energy": 2,  # Medium
       "schedule": ["9am: Team meeting", "2pm: Doctor"],
       "available_time_minutes": 45
   })
   ↓
6. AI PROCESSING
   Pipelex executes each pipe:
   Pipe 1: "assess_morning_state" (Claude API call)
   Pipe 2: "generate_routine_plan" (Claude API call)
   Pipe 3: "format_for_platform" (JSON transformation)
   ↓
7. TRANSFORM OUTPUT
   Workflow output (Pipelex concepts) → TaskCreate model
   {
       "title": "Morning Routine - Jan 28",
       "zone_id": "self_zone_id",
       "priority": "high",
       "micro_steps": [
           { "description": "5-min shower", "estimated_minutes": 5 },
           { "description": "Quick breakfast", "estimated_minutes": 10 },
           { "description": "Review calendar", "estimated_minutes": 5 }
       ]
   }
   ↓
8. CREATE TASK
   POST /api/v1/tasks
   Task created with AI-generated micro-steps
   ↓
9. USER SEES RESULT
   Hunter Mode shows new task with chevron steps
   User completes task → Earns XP → Success!
```

---

## 🧠 Core Concepts

### Pipelex Fundamentals

#### What is a Pipe?

A **pipe** is a single transformation step that takes typed inputs and produces typed outputs.

```toml
[[pipe]]
name = "assess_energy"
input = ["UserEnergyLevel"]
output = "EnergyAssessment"
instruction = """
Analyze the user's current energy level (1-3 scale).
Provide recommendations for task intensity:
- Low (1): Light tasks only (< 15 min)
- Medium (2): Moderate tasks (15-30 min)
- High (3): Complex tasks (30+ min)
"""
provider = "anthropic:claude-3-5-sonnet"
```

#### What is a Concept?

A **concept** is a typed piece of knowledge with validation rules.

```toml
[concept.UserEnergyLevel]
description = "User's current energy level on 1-3 scale"
validation = "Must be integer 1, 2, or 3"

[concept.EnergyAssessment]
description = "Analysis of energy level with task recommendations"
refines = "Text"
```

#### How Pipes Chain Together

```
UserEnergyLevel ─────┐
                     ├─→ [Pipe 1: assess_energy] ─→ EnergyAssessment
TodaySchedule ───────┘                                      │
                                                            │
                                                            ↓
                        [Pipe 2: generate_routine] ─→ RoutinePlan
                                                            │
                                                            ↓
                        [Pipe 3: create_task] ──────→ PlatformTask
```

### Integration Patterns

#### Pattern 1: Context Injection

Platform automatically injects user context into workflows:

```python
# src/workflows/executor.py

async def execute_workflow(workflow_id: UUID, user_id: str) -> Task:
    # Load workflow
    workflow = await get_workflow(workflow_id)
    pipeline = Pipeline.from_file(workflow.plx_file_path)

    # Inject platform context
    user_context = {
        "user_energy": await get_current_energy(user_id),
        "schedule": await get_today_schedule(user_id),
        "zones": await get_compass_zones(user_id),
        "recent_tasks": await get_recent_tasks(user_id, limit=5),
        "preferences": await get_user_preferences(user_id)
    }

    # Execute pipeline
    result = await pipeline.run(user_context)

    # Transform to platform task
    task = transform_workflow_output_to_task(result, user_id)
    return task
```

#### Pattern 2: Output Transformation

Workflow outputs must be converted to platform models:

```python
def transform_workflow_output_to_task(result: PipelineResult, user_id: str) -> Task:
    """Convert Pipelex output to platform Task model."""

    # Extract concepts from result
    routine_plan = result.get_concept("RoutinePlan")

    # Parse AI-generated plan
    steps_data = parse_routine_plan(routine_plan)

    # Create platform task
    task = TaskCreate(
        user_id=user_id,
        title=steps_data["title"],
        description=steps_data["description"],
        priority="high",
        zone_id=get_zone_id_by_name(user_id, "Self"),
        micro_steps=[
            MicroStepCreate(
                description=step["description"],
                estimated_minutes=step["duration"],
                leaf_type=step["type"],
                icon=step.get("icon", "📋")
            )
            for step in steps_data["steps"]
        ]
    )

    return create_task(task)
```

#### Pattern 3: Multi-LLM Support

Users can choose their LLM provider:

```python
# User settings
user_preferences = {
    "llm_provider": "anthropic:claude-3-5-sonnet",  # or "openai:gpt-4", "ollama:llama3"
    "api_key": "sk-...",  # User's own API key (encrypted)
    "max_cost_per_execution": 0.10  # $0.10 limit
}

# Workflow execution respects user settings
pipeline = Pipeline.from_file(workflow.plx_file_path)
pipeline.set_provider(user_preferences["llm_provider"])
pipeline.set_credentials(user_preferences["api_key"])
pipeline.set_max_cost(user_preferences["max_cost_per_execution"])
```

---

## 🗄️ Database Schema

### Table: `workflow_templates`

Stores metadata about available workflows (not the .plx file content).

```sql
CREATE TABLE workflow_templates (
    -- Primary key
    workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core metadata
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,  -- 'personal', 'business', 'academic', 'creative', 'health'
    icon VARCHAR(50),                -- Emoji (e.g., '🌅', '💼', '📚')

    -- Pipelex-specific
    plx_file_url TEXT NOT NULL,      -- S3/CDN URL: "https://cdn.example.com/workflows/morning-routine.plx"
    plx_version VARCHAR(50),         -- Pipelex language version (e.g., "0.1.0")
    required_concepts TEXT[],        -- ["UserEnergy", "Schedule"] - inputs needed
    output_concepts TEXT[],          -- ["RoutinePlan", "PlatformTask"] - outputs produced

    -- LLM requirements
    default_llm_provider VARCHAR(100) DEFAULT 'anthropic:claude-3-5-sonnet',
    estimated_tokens INT,            -- Avg tokens per execution (for cost estimation)
    estimated_cost_usd DECIMAL(10, 4),  -- Avg cost per execution in USD
    execution_time_seconds INT,      -- Avg execution time

    -- Publishing info
    author_id UUID REFERENCES users(user_id),  -- Creator (NULL for system templates)
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,  -- Verified by platform team
    is_premium BOOLEAN DEFAULT FALSE,   -- Requires payment
    price_usd DECIMAL(10, 2),          -- Price if premium (NULL if free)

    -- Usage statistics
    download_count INT DEFAULT 0,
    execution_count INT DEFAULT 0,
    success_rate DECIMAL(5, 2),        -- % of successful executions
    avg_rating DECIMAL(3, 2),          -- 1.0 - 5.0 stars
    review_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_executed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_workflows_category ON workflow_templates(category);
CREATE INDEX idx_workflows_public ON workflow_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_workflows_author ON workflow_templates(author_id);
CREATE INDEX idx_workflows_rating ON workflow_templates(avg_rating DESC);
CREATE INDEX idx_workflows_downloads ON workflow_templates(download_count DESC);

-- Full-text search index
CREATE INDEX idx_workflows_search ON workflow_templates USING gin(
    to_tsvector('english', name || ' ' || description)
);
```

### Table: `workflow_executions`

Tracks each time a workflow is executed (for analytics and debugging).

```sql
CREATE TABLE workflow_executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,

    -- Execution details
    status VARCHAR(50) NOT NULL,     -- 'running', 'completed', 'failed', 'cancelled'
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_seconds INT,

    -- Inputs/outputs (stored as JSONB for analysis)
    input_context JSONB,             -- { "user_energy": 2, "schedule": [...] }
    output_result JSONB,             -- { "routine_plan": {...}, "task_created": "task_id" }
    error_message TEXT,              -- If failed, store error

    -- Cost tracking
    llm_provider_used VARCHAR(100),
    tokens_used INT,
    actual_cost_usd DECIMAL(10, 4),

    -- Result tracking
    task_id UUID REFERENCES tasks(task_id),  -- The task created by this workflow
    task_completed BOOLEAN DEFAULT FALSE,     -- Did user complete the task?
    task_completion_rate DECIMAL(5, 2)        -- % of steps completed
);

CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_user ON workflow_executions(user_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_executions_date ON workflow_executions(started_at DESC);
```

### Table: `workflow_reviews`

User ratings and reviews for workflows.

```sql
CREATE TABLE workflow_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,

    -- Review content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,

    -- Metadata
    execution_id UUID REFERENCES workflow_executions(execution_id),  -- Which execution was reviewed
    is_verified_purchase BOOLEAN DEFAULT FALSE,  -- Did user execute it?
    helpful_count INT DEFAULT 0,  -- Upvotes

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(workflow_id, user_id)  -- One review per user per workflow
);

CREATE INDEX idx_reviews_workflow ON workflow_reviews(workflow_id);
CREATE INDEX idx_reviews_rating ON workflow_reviews(rating DESC);
```

### Table: `user_workflow_library`

Tracks which workflows each user has downloaded/installed.

```sql
CREATE TABLE user_workflow_library (
    library_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,

    -- Customization
    is_customized BOOLEAN DEFAULT FALSE,  -- Did user edit the .plx file?
    custom_plx_content TEXT,              -- If customized, store their version

    -- Usage
    last_executed_at TIMESTAMP,
    execution_count INT DEFAULT 0,
    is_favorited BOOLEAN DEFAULT FALSE,

    -- Timestamps
    added_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, workflow_id)
);

CREATE INDEX idx_library_user ON user_workflow_library(user_id);
CREATE INDEX idx_library_workflow ON user_workflow_library(workflow_id);
```

### Table: `workflow_tags`

Tagging system for workflows (many-to-many).

```sql
CREATE TABLE workflow_tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,

    UNIQUE(workflow_id, tag)
);

CREATE INDEX idx_tags_workflow ON workflow_tags(workflow_id);
CREATE INDEX idx_tags_tag ON workflow_tags(tag);

-- Popular tags: 'adhd-friendly', 'quick-win', 'morning', 'evening', 'productivity', etc.
```

---

## 💻 Backend Implementation

### Phase 1: Core Workflow Service

#### File: `src/workflows/models.py`

```python
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any, Literal
from uuid import UUID, uuid4
from datetime import datetime
from decimal import Decimal

class WorkflowTemplateBase(BaseModel):
    """Base model for workflow templates."""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=10, max_length=2000)
    category: Literal["personal", "business", "academic", "creative", "health"]
    icon: Optional[str] = Field(None, max_length=50)

class WorkflowTemplateCreate(WorkflowTemplateBase):
    """Model for creating a new workflow template."""
    plx_file_content: str = Field(..., description=".plx file content as string")
    plx_version: str = Field(default="0.1.0")
    required_concepts: List[str] = []
    output_concepts: List[str] = []
    default_llm_provider: str = "anthropic:claude-3-5-sonnet"
    estimated_tokens: Optional[int] = None
    estimated_cost_usd: Optional[Decimal] = None
    is_premium: bool = False
    price_usd: Optional[Decimal] = None
    tags: List[str] = []

class WorkflowTemplate(WorkflowTemplateBase):
    """Complete workflow template model."""
    workflow_id: UUID = Field(default_factory=uuid4)
    plx_file_url: HttpUrl
    plx_version: str
    required_concepts: List[str]
    output_concepts: List[str]
    default_llm_provider: str
    estimated_tokens: Optional[int]
    estimated_cost_usd: Optional[Decimal]
    execution_time_seconds: Optional[int]
    author_id: Optional[UUID]
    is_public: bool
    is_verified: bool
    is_premium: bool
    price_usd: Optional[Decimal]
    download_count: int
    execution_count: int
    success_rate: Optional[Decimal]
    avg_rating: Optional[Decimal]
    review_count: int
    created_at: datetime
    updated_at: datetime
    last_executed_at: Optional[datetime]
    tags: List[str] = []

    class Config:
        from_attributes = True

class WorkflowExecutionCreate(BaseModel):
    """Model for starting a workflow execution."""
    workflow_id: UUID
    user_id: str
    input_context: Optional[Dict[str, Any]] = None  # Additional inputs from user

class WorkflowExecution(BaseModel):
    """Complete workflow execution model."""
    execution_id: UUID = Field(default_factory=uuid4)
    workflow_id: UUID
    user_id: str
    status: Literal["running", "completed", "failed", "cancelled"]
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    input_context: Dict[str, Any]
    output_result: Optional[Dict[str, Any]]
    error_message: Optional[str]
    llm_provider_used: str
    tokens_used: Optional[int]
    actual_cost_usd: Optional[Decimal]
    task_id: Optional[UUID]
    task_completed: bool = False
    task_completion_rate: Optional[Decimal]

    class Config:
        from_attributes = True

class WorkflowReviewCreate(BaseModel):
    """Model for creating a workflow review."""
    workflow_id: UUID
    user_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=1000)
    execution_id: Optional[UUID]

class WorkflowReview(WorkflowReviewCreate):
    """Complete workflow review model."""
    review_id: UUID = Field(default_factory=uuid4)
    is_verified_purchase: bool
    helpful_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

#### File: `src/workflows/executor.py`

```python
"""
Pipelex workflow execution engine.
Integrates with platform context and transforms outputs to tasks.
"""
from typing import Dict, Any, Optional
from uuid import UUID
import asyncio
from datetime import datetime
from decimal import Decimal

from pipelex import Pipeline
from pydantic import BaseModel

from src.workflows.models import WorkflowExecution, WorkflowTemplate
from src.workflows.repository import WorkflowRepository
from src.repository.task_repository import TaskRepository
from src.repository.energy_repository import EnergyRepository
from src.database.models import TaskCreate, MicroStepCreate


class PipelexWorkflowExecutor:
    """Executes Pipelex workflows with platform integration."""

    def __init__(self):
        self.workflow_repo = WorkflowRepository()
        self.task_repo = TaskRepository()
        self.energy_repo = EnergyRepository()

    async def execute_workflow(
        self,
        workflow_id: UUID,
        user_id: str,
        additional_inputs: Optional[Dict[str, Any]] = None
    ) -> WorkflowExecution:
        """
        Execute a workflow with full platform context.

        Args:
            workflow_id: The workflow to execute
            user_id: User executing the workflow
            additional_inputs: Optional additional inputs from user

        Returns:
            WorkflowExecution with results and created task

        Raises:
            WorkflowExecutionError: If execution fails
        """
        # Create execution record
        execution = self.workflow_repo.create_execution(
            workflow_id=workflow_id,
            user_id=user_id,
            status="running"
        )

        try:
            # 1. Load workflow metadata
            workflow = self.workflow_repo.get_by_id(workflow_id)
            if not workflow:
                raise ValueError(f"Workflow {workflow_id} not found")

            # 2. Gather platform context
            context = await self._gather_user_context(user_id)

            # 3. Merge with additional inputs
            if additional_inputs:
                context.update(additional_inputs)

            # 4. Load and execute .plx pipeline
            pipeline = await self._load_pipeline(workflow)
            result = await pipeline.run(context)

            # 5. Transform output to platform task
            task = await self._create_task_from_result(result, user_id, workflow)

            # 6. Update execution record
            execution = self.workflow_repo.update_execution(
                execution_id=execution.execution_id,
                status="completed",
                output_result=result.to_dict(),
                task_id=task.task_id,
                tokens_used=result.metadata.get("total_tokens"),
                actual_cost_usd=Decimal(str(result.metadata.get("total_cost", 0)))
            )

            # 7. Update workflow statistics
            self.workflow_repo.increment_execution_count(workflow_id)

            return execution

        except Exception as e:
            # Update execution as failed
            self.workflow_repo.update_execution(
                execution_id=execution.execution_id,
                status="failed",
                error_message=str(e)
            )
            raise WorkflowExecutionError(f"Workflow execution failed: {str(e)}") from e

    async def _gather_user_context(self, user_id: str) -> Dict[str, Any]:
        """Gather all platform context for the user."""
        # Run context gathering in parallel
        energy, schedule, zones, recent_tasks, preferences = await asyncio.gather(
            self._get_current_energy(user_id),
            self._get_today_schedule(user_id),
            self._get_compass_zones(user_id),
            self._get_recent_tasks(user_id, limit=5),
            self._get_user_preferences(user_id)
        )

        return {
            "user_energy": energy,
            "schedule": schedule,
            "compass_zones": zones,
            "recent_tasks": recent_tasks,
            "preferences": preferences,
            "current_time": datetime.now().isoformat(),
            "day_of_week": datetime.now().strftime("%A"),
        }

    async def _get_current_energy(self, user_id: str) -> int:
        """Get user's current energy level (1-3)."""
        snapshot = self.energy_repo.get_current_energy(user_id)
        return snapshot.energy_level if snapshot else 2  # Default to medium

    async def _get_today_schedule(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's calendar for today."""
        # TODO: Integrate with calendar service or tasks with due dates
        tasks = self.task_repo.get_tasks_due_today(user_id)
        return [
            {
                "time": task.due_date.strftime("%I%p") if task.due_date else None,
                "title": task.title,
                "duration_minutes": task.estimated_minutes
            }
            for task in tasks
        ]

    async def _get_compass_zones(self, user_id: str) -> List[Dict[str, str]]:
        """Get user's compass zones (Work, Life, Self)."""
        # TODO: Implement compass zone fetching
        return [
            {"name": "Work", "icon": "💼"},
            {"name": "Life", "icon": "🏠"},
            {"name": "Self", "icon": "❤️"}
        ]

    async def _get_recent_tasks(self, user_id: str, limit: int) -> List[Dict[str, Any]]:
        """Get user's recently completed tasks for pattern learning."""
        tasks = self.task_repo.get_recent_completed(user_id, limit=limit)
        return [
            {
                "title": task.title,
                "completed_at": task.updated_at.isoformat(),
                "steps_completed": len([s for s in task.micro_steps if s.status == "done"]),
                "xp_earned": sum(s.xp_earned for s in task.micro_steps if s.xp_earned)
            }
            for task in tasks
        ]

    async def _get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences (LLM provider, API keys, etc.)."""
        # TODO: Implement user preferences storage
        return {
            "llm_provider": "anthropic:claude-3-5-sonnet",
            "max_cost_per_execution": 0.10,
            "preferred_step_duration": 5  # minutes
        }

    async def _load_pipeline(self, workflow: WorkflowTemplate) -> Pipeline:
        """Load .plx file and create Pipeline object."""
        # Download .plx file from S3/CDN
        plx_content = await self._download_plx_file(workflow.plx_file_url)

        # Write to temp file (Pipelex needs file path)
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.plx', delete=False) as f:
            f.write(plx_content)
            temp_path = f.name

        # Load pipeline
        pipeline = Pipeline.from_file(temp_path)

        # Clean up temp file
        import os
        os.unlink(temp_path)

        return pipeline

    async def _download_plx_file(self, url: str) -> str:
        """Download .plx file content from URL."""
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.text()

    async def _create_task_from_result(
        self,
        result: Any,
        user_id: str,
        workflow: WorkflowTemplate
    ) -> Task:
        """Transform Pipelex output to platform Task."""
        # Extract main output concept
        task_data = result.get_concept("PlatformTask")

        # Parse AI-generated task data
        import json
        parsed = json.loads(task_data) if isinstance(task_data, str) else task_data

        # Create task with micro-steps
        task_create = TaskCreate(
            user_id=user_id,
            title=parsed.get("title", f"Workflow: {workflow.name}"),
            description=parsed.get("description", workflow.description),
            priority=parsed.get("priority", "medium"),
            zone_id=parsed.get("zone_id"),  # TODO: Map zone name to zone_id
            micro_steps=[
                MicroStepCreate(
                    description=step["description"],
                    short_label=step.get("short_label", step["description"][:20]),
                    estimated_minutes=step.get("duration_minutes", 5),
                    leaf_type=step.get("type", "HUMAN"),
                    icon=step.get("icon", "📋")
                )
                for step in parsed.get("steps", [])
            ],
            tags=[f"workflow:{workflow.workflow_id}", "ai-generated"]
        )

        # Create task in database
        task = self.task_repo.create(task_create)
        return task


class WorkflowExecutionError(Exception):
    """Raised when workflow execution fails."""
    pass
```

#### File: `src/workflows/repository.py`

```python
"""Repository for workflow templates and executions."""
from typing import List, Optional
from uuid import UUID
from src.repository.base import BaseRepository
from src.workflows.models import (
    WorkflowTemplate,
    WorkflowTemplateCreate,
    WorkflowExecution,
    WorkflowReview
)
from sqlalchemy import select, and_, func, desc


class WorkflowRepository(BaseRepository[WorkflowTemplate]):
    """Repository for workflow templates."""

    def __init__(self):
        super().__init__()

    def get_public_workflows(
        self,
        category: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[WorkflowTemplate]:
        """Get all public workflows, optionally filtered by category."""
        with self.get_session() as session:
            query = select(self.model).where(self.model.is_public == True)

            if category:
                query = query.where(self.model.category == category)

            query = query.order_by(desc(self.model.download_count))
            query = query.limit(limit).offset(offset)

            return list(session.execute(query).scalars().all())

    def search_workflows(self, search_term: str, limit: int = 20) -> List[WorkflowTemplate]:
        """Full-text search workflows by name and description."""
        with self.get_session() as session:
            # PostgreSQL full-text search
            query = select(self.model).where(
                and_(
                    self.model.is_public == True,
                    func.to_tsvector('english', self.model.name + ' ' + self.model.description)
                        .match(search_term)
                )
            )
            query = query.limit(limit)
            return list(session.execute(query).scalars().all())

    def get_by_tags(self, tags: List[str]) -> List[WorkflowTemplate]:
        """Get workflows by tags (requires workflow_tags join)."""
        # TODO: Implement join with workflow_tags table
        pass

    def increment_download_count(self, workflow_id: UUID):
        """Increment download counter."""
        with self.get_session() as session:
            workflow = session.get(self.model, workflow_id)
            if workflow:
                workflow.download_count += 1
                session.commit()

    def increment_execution_count(self, workflow_id: UUID):
        """Increment execution counter."""
        with self.get_session() as session:
            workflow = session.get(self.model, workflow_id)
            if workflow:
                workflow.execution_count += 1
                workflow.last_executed_at = datetime.now()
                session.commit()

    def update_rating(self, workflow_id: UUID, new_rating: float):
        """Update average rating after new review."""
        with self.get_session() as session:
            workflow = session.get(self.model, workflow_id)
            if workflow:
                # Recalculate average
                total = workflow.avg_rating * workflow.review_count if workflow.avg_rating else 0
                total += new_rating
                workflow.review_count += 1
                workflow.avg_rating = round(total / workflow.review_count, 2)
                session.commit()

    def create_execution(self, **kwargs) -> WorkflowExecution:
        """Create a new workflow execution record."""
        # TODO: Implement execution repository
        pass

    def update_execution(self, execution_id: UUID, **kwargs) -> WorkflowExecution:
        """Update execution record."""
        # TODO: Implement execution repository
        pass


class WorkflowExecutionRepository(BaseRepository[WorkflowExecution]):
    """Repository for workflow executions."""

    def __init__(self):
        super().__init__()

    def get_user_executions(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[WorkflowExecution]:
        """Get user's workflow execution history."""
        with self.get_session() as session:
            query = select(self.model).where(self.model.user_id == user_id)
            query = query.order_by(desc(self.model.started_at))
            query = query.limit(limit)
            return list(session.execute(query).scalars().all())

    def get_workflow_executions(
        self,
        workflow_id: UUID,
        status: Optional[str] = None
    ) -> List[WorkflowExecution]:
        """Get all executions for a workflow."""
        with self.get_session() as session:
            query = select(self.model).where(self.model.workflow_id == workflow_id)

            if status:
                query = query.where(self.model.status == status)

            query = query.order_by(desc(self.model.started_at))
            return list(session.execute(query).scalars().all())

    def get_success_rate(self, workflow_id: UUID) -> float:
        """Calculate success rate for a workflow."""
        with self.get_session() as session:
            total = session.query(func.count(self.model.execution_id)).filter(
                self.model.workflow_id == workflow_id
            ).scalar()

            successful = session.query(func.count(self.model.execution_id)).filter(
                and_(
                    self.model.workflow_id == workflow_id,
                    self.model.status == "completed"
                )
            ).scalar()

            return (successful / total * 100) if total > 0 else 0.0
```

#### File: `src/api/routes/workflows.py`

```python
"""API routes for workflow templates."""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from uuid import UUID

from src.workflows.models import (
    WorkflowTemplate,
    WorkflowTemplateCreate,
    WorkflowExecution,
    WorkflowReviewCreate
)
from src.workflows.repository import WorkflowRepository, WorkflowExecutionRepository
from src.workflows.executor import PipelexWorkflowExecutor
from src.api.dependencies import get_current_user


router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])
workflow_repo = WorkflowRepository()
execution_repo = WorkflowExecutionRepository()
executor = PipelexWorkflowExecutor()


@router.get("/", response_model=List[WorkflowTemplate])
async def list_workflows(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    List all public workflows.

    Query parameters:
    - category: Filter by category (personal, business, academic, creative, health)
    - search: Full-text search in name and description
    - limit: Max results (default 50)
    - offset: Pagination offset
    """
    if search:
        return workflow_repo.search_workflows(search, limit=limit)
    else:
        return workflow_repo.get_public_workflows(
            category=category,
            limit=limit,
            offset=offset
        )


@router.get("/{workflow_id}", response_model=WorkflowTemplate)
async def get_workflow(workflow_id: UUID):
    """Get a specific workflow by ID."""
    workflow = workflow_repo.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.post("/{workflow_id}/download")
async def download_workflow(
    workflow_id: UUID,
    current_user: str = Depends(get_current_user)
):
    """
    Download a workflow's .plx file.
    Increments download counter and adds to user's library.
    """
    workflow = workflow_repo.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Increment download counter
    workflow_repo.increment_download_count(workflow_id)

    # TODO: Add to user's library (user_workflow_library table)

    # Return .plx file URL (frontend will download)
    return {
        "workflow_id": workflow.workflow_id,
        "name": workflow.name,
        "plx_file_url": workflow.plx_file_url,
        "message": "Workflow added to your library"
    }


@router.post("/{workflow_id}/execute", response_model=WorkflowExecution)
async def execute_workflow(
    workflow_id: UUID,
    additional_inputs: Optional[dict] = None,
    current_user: str = Depends(get_current_user)
):
    """
    Execute a workflow with platform context.
    Creates a task with AI-generated micro-steps.
    """
    workflow = workflow_repo.get_by_id(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        execution = await executor.execute_workflow(
            workflow_id=workflow_id,
            user_id=current_user,
            additional_inputs=additional_inputs
        )
        return execution
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Workflow execution failed: {str(e)}"
        )


@router.get("/executions/me", response_model=List[WorkflowExecution])
async def get_my_executions(
    limit: int = 50,
    current_user: str = Depends(get_current_user)
):
    """Get current user's workflow execution history."""
    return execution_repo.get_user_executions(current_user, limit=limit)


@router.post("/", response_model=WorkflowTemplate, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow: WorkflowTemplateCreate,
    current_user: str = Depends(get_current_user)
):
    """
    Submit a new workflow to the marketplace.
    Requires authentication.
    """
    # TODO: Upload .plx file to S3
    # TODO: Validate .plx file syntax
    # TODO: Create workflow template record
    raise HTTPException(status_code=501, detail="Workflow submission coming soon")


@router.post("/{workflow_id}/review", response_model=WorkflowReview)
async def create_review(
    workflow_id: UUID,
    review: WorkflowReviewCreate,
    current_user: str = Depends(get_current_user)
):
    """Submit a review for a workflow."""
    # TODO: Implement review creation
    raise HTTPException(status_code=501, detail="Reviews coming soon")
```

Register in `src/api/main.py`:
```python
from src.api.routes import workflows
app.include_router(workflows.router)
```

---

## 🎨 Frontend Implementation

### Component: WorkflowBrowser

**File**: `frontend/src/components/mobile/WorkflowBrowser.tsx`

```typescript
/**
 * WorkflowBrowser - Browse and search workflow templates
 * Location: Scout Mode → Workflows tab
 */
import React, { useState, useEffect } from 'react';
import { spacing, fontSize, semanticColors, borderRadius } from '@/lib/design-system';

interface WorkflowTemplate {
  workflow_id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  estimated_cost_usd: number;
  execution_time_seconds: number;
  download_count: number;
  avg_rating: number;
  is_premium: boolean;
  price_usd?: number;
}

interface WorkflowBrowserProps {
  category?: string;
  onSelectWorkflow: (workflow: WorkflowTemplate) => void;
}

export default function WorkflowBrowser({ category, onSelectWorkflow }: WorkflowBrowserProps) {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  const categories = ['all', 'personal', 'business', 'academic', 'creative', 'health'];

  useEffect(() => {
    fetchWorkflows();
  }, [selectedCategory, searchTerm]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/v1/workflows?${params}`);
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: spacing[4], backgroundColor: semanticColors.bg.primary }}>
      {/* Search Bar */}
      <div style={{ marginBottom: spacing[4] }}>
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: fontSize.base,
            borderRadius: borderRadius.base,
            border: `1px solid ${semanticColors.border.default}`,
            backgroundColor: semanticColors.bg.secondary,
            color: semanticColors.text.primary,
          }}
        />
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: spacing[2],
        overflowX: 'auto',
        marginBottom: spacing[4],
        paddingBottom: spacing[2],
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: `${spacing[2]} ${spacing[3]}`,
              fontSize: fontSize.sm,
              borderRadius: borderRadius.full,
              border: 'none',
              backgroundColor: selectedCategory === cat
                ? semanticColors.accent.primary
                : semanticColors.bg.secondary,
              color: selectedCategory === cat
                ? semanticColors.text.inverse
                : semanticColors.text.primary,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontWeight: selectedCategory === cat ? '600' : '400',
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Workflow Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8], color: semanticColors.text.secondary }}>
          Loading workflows...
        </div>
      ) : workflows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: spacing[8], color: semanticColors.text.secondary }}>
          No workflows found. Try a different category or search term.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: spacing[4],
        }}>
          {workflows.map(workflow => (
            <WorkflowCard
              key={workflow.workflow_id}
              workflow={workflow}
              onSelect={() => onSelectWorkflow(workflow)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkflowCardProps {
  workflow: WorkflowTemplate;
  onSelect: () => void;
}

function WorkflowCard({ workflow, onSelect }: WorkflowCardProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: spacing[4],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        border: `1px solid ${semanticColors.border.default}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[3] }}>
        <div style={{ fontSize: '40px' }}>{workflow.icon}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: fontSize.base,
            fontWeight: 'bold',
            color: semanticColors.text.primary,
            marginBottom: spacing[1],
          }}>
            {workflow.name}
            {workflow.is_premium && (
              <span style={{
                marginLeft: spacing[2],
                fontSize: fontSize.xs,
                color: semanticColors.accent.warning,
              }}>
                👑 ${workflow.price_usd}
              </span>
            )}
          </h3>
          <p style={{
            fontSize: fontSize.sm,
            color: semanticColors.text.secondary,
            lineHeight: '1.4',
          }}>
            {workflow.description}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div style={{
        display: 'flex',
        gap: spacing[3],
        fontSize: fontSize.xs,
        color: semanticColors.text.secondary,
        marginTop: spacing[3],
        paddingTop: spacing[3],
        borderTop: `1px solid ${semanticColors.border.default}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
          ⭐ {workflow.avg_rating?.toFixed(1) || 'New'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
          ⬇️ {workflow.download_count}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
          ⏱️ ~{workflow.execution_time_seconds}s
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
          💰 ${workflow.estimated_cost_usd?.toFixed(3) || '0.01'}
        </div>
      </div>
    </div>
  );
}
```

### Component: WorkflowPreviewModal

**File**: `frontend/src/components/mobile/WorkflowPreviewModal.tsx`

```typescript
/**
 * WorkflowPreviewModal - Preview workflow details before execution
 */
import React, { useState } from 'react';
import { X, Play, Download } from 'lucide-react';
import { spacing, fontSize, semanticColors, borderRadius } from '@/lib/design-system';

interface WorkflowPreviewModalProps {
  workflow: WorkflowTemplate;
  onExecute: () => void;
  onDownload: () => void;
  onClose: () => void;
}

export default function WorkflowPreviewModal({
  workflow,
  onExecute,
  onDownload,
  onClose
}: WorkflowPreviewModalProps) {
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      await onExecute();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
    }}>
      <div style={{
        backgroundColor: semanticColors.bg.primary,
        borderRadius: borderRadius.lg,
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: spacing[4],
          borderBottom: `1px solid ${semanticColors.border.default}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <span style={{ fontSize: '48px' }}>{workflow.icon}</span>
            <div>
              <h2 style={{
                fontSize: fontSize.lg,
                fontWeight: 'bold',
                color: semanticColors.text.primary,
              }}>
                {workflow.name}
              </h2>
              <p style={{
                fontSize: fontSize.sm,
                color: semanticColors.text.secondary,
              }}>
                {workflow.category.charAt(0).toUpperCase() + workflow.category.slice(1)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: spacing[2],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: semanticColors.text.secondary,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: spacing[4] }}>
          {/* Description */}
          <section style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: fontSize.base,
              fontWeight: '600',
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}>
              What This Workflow Does
            </h3>
            <p style={{
              fontSize: fontSize.sm,
              color: semanticColors.text.secondary,
              lineHeight: '1.6',
            }}>
              {workflow.description}
            </p>
          </section>

          {/* Required Context */}
          <section style={{ marginBottom: spacing[6] }}>
            <h3 style={{
              fontSize: fontSize.base,
              fontWeight: '600',
              color: semanticColors.text.primary,
              marginBottom: spacing[2],
            }}>
              Platform Context Used
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {workflow.required_concepts.map((concept, idx) => (
                <li key={idx} style={{
                  fontSize: fontSize.sm,
                  color: semanticColors.text.secondary,
                  marginBottom: spacing[1],
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}>
                  <span style={{ color: semanticColors.accent.success }}>✓</span>
                  {formatConceptName(concept)}
                </li>
              ))}
            </ul>
          </section>

          {/* Execution Info */}
          <section style={{
            padding: spacing[3],
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.base,
            marginBottom: spacing[6],
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing[3],
            }}>
              <div>
                <div style={{
                  fontSize: fontSize.xs,
                  color: semanticColors.text.secondary,
                  marginBottom: spacing[1],
                }}>
                  Execution Time
                </div>
                <div style={{
                  fontSize: fontSize.base,
                  fontWeight: '600',
                  color: semanticColors.text.primary,
                }}>
                  ~{workflow.execution_time_seconds}s
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: fontSize.xs,
                  color: semanticColors.text.secondary,
                  marginBottom: spacing[1],
                }}>
                  Estimated Cost
                </div>
                <div style={{
                  fontSize: fontSize.base,
                  fontWeight: '600',
                  color: semanticColors.text.primary,
                }}>
                  ${workflow.estimated_cost_usd?.toFixed(3)}
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
          }}>
            <button
              onClick={handleExecute}
              disabled={loading}
              style={{
                flex: 1,
                padding: spacing[3],
                backgroundColor: loading
                  ? semanticColors.bg.disabled
                  : semanticColors.accent.primary,
                color: semanticColors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
            >
              <Play size={20} />
              {loading ? 'Executing...' : 'Run Workflow'}
            </button>
            <button
              onClick={onDownload}
              style={{
                padding: spacing[3],
                backgroundColor: semanticColors.bg.secondary,
                color: semanticColors.text.primary,
                border: `1px solid ${semanticColors.border.default}`,
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Download size={20} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatConceptName(concept: string): string {
  // Convert "UserEnergy" → "Your current energy level"
  const mapping: Record<string, string> = {
    "UserEnergy": "Your current energy level",
    "Schedule": "Your today's calendar",
    "CompassZones": "Your life zones (Work/Life/Self)",
    "RecentTasks": "Your recent task history",
    "Preferences": "Your app preferences"
  };
  return mapping[concept] || concept;
}
```

### Component: WorkflowExecutionResult

**File**: `frontend/src/components/mobile/WorkflowExecutionResult.tsx`

```typescript
/**
 * WorkflowExecutionResult - Show result after workflow execution
 * Displays created task with AI-generated steps
 */
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { spacing, fontSize, semanticColors, borderRadius } from '@/lib/design-system';
import AsyncJobTimeline, { JobStep } from '../shared/AsyncJobTimeline';

interface WorkflowExecutionResultProps {
  workflow: WorkflowTemplate;
  execution: WorkflowExecution;
  task: Task;
  onViewTask: () => void;
  onClose: () => void;
}

export default function WorkflowExecutionResult({
  workflow,
  execution,
  task,
  onViewTask,
  onClose
}: WorkflowExecutionResultProps) {
  // Convert task micro-steps to JobSteps for AsyncJobTimeline
  const jobSteps: JobStep[] = task.micro_steps.map((step, index) => ({
    id: step.step_id,
    description: step.description,
    shortLabel: step.short_label || step.description.slice(0, 20),
    estimatedMinutes: step.estimated_minutes,
    leafType: step.leaf_type,
    icon: step.icon,
    status: index === 0 ? 'active' : 'pending',
    tags: [],
  }));

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
    }}>
      <div style={{
        backgroundColor: semanticColors.bg.primary,
        borderRadius: borderRadius.lg,
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        {/* Success Header */}
        <div style={{
          padding: spacing[6],
          textAlign: 'center',
          backgroundColor: semanticColors.accent.success,
          color: semanticColors.text.inverse,
        }}>
          <CheckCircle size={48} style={{ marginBottom: spacing[3] }} />
          <h2 style={{
            fontSize: fontSize.xl,
            fontWeight: 'bold',
            marginBottom: spacing[2],
          }}>
            Workflow Complete!
          </h2>
          <p style={{ fontSize: fontSize.sm }}>
            AI generated {task.micro_steps.length} personalized steps for you
          </p>
        </div>

        {/* Task Preview */}
        <div style={{ padding: spacing[4] }}>
          <h3 style={{
            fontSize: fontSize.lg,
            fontWeight: 'bold',
            color: semanticColors.text.primary,
            marginBottom: spacing[3],
          }}>
            {task.title}
          </h3>

          {/* Chevron Timeline */}
          <div style={{ marginBottom: spacing[4] }}>
            <AsyncJobTimeline
              jobName={workflow.name}
              steps={jobSteps}
              currentProgress={0}
              size="compact"
            />
          </div>

          {/* Execution Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: spacing[3],
            padding: spacing[3],
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.base,
            marginBottom: spacing[4],
          }}>
            <div>
              <div style={{
                fontSize: fontSize.xs,
                color: semanticColors.text.secondary,
              }}>
                Steps
              </div>
              <div style={{
                fontSize: fontSize.lg,
                fontWeight: 'bold',
                color: semanticColors.text.primary,
              }}>
                {task.micro_steps.length}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: fontSize.xs,
                color: semanticColors.text.secondary,
              }}>
                Est. Time
              </div>
              <div style={{
                fontSize: fontSize.lg,
                fontWeight: 'bold',
                color: semanticColors.text.primary,
              }}>
                {task.estimated_minutes} min
              </div>
            </div>
            <div>
              <div style={{
                fontSize: fontSize.xs,
                color: semanticColors.text.secondary,
              }}>
                Est. XP
              </div>
              <div style={{
                fontSize: fontSize.lg,
                fontWeight: 'bold',
                color: semanticColors.accent.warning,
              }}>
                {task.xp_preview || 'N/A'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
          }}>
            <button
              onClick={onViewTask}
              style={{
                flex: 1,
                padding: spacing[3],
                backgroundColor: semanticColors.accent.primary,
                color: semanticColors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
            >
              Start Task
              <ArrowRight size={20} />
            </button>
            <button
              onClick={onClose}
              style={{
                padding: spacing[3],
                backgroundColor: semanticColors.bg.secondary,
                color: semanticColors.text.primary,
                border: `1px solid ${semanticColors.border.default}`,
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                cursor: 'pointer',
              }}
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Integration into Scout Mode

**File**: `frontend/src/components/mobile/modes/ScoutMode.tsx`

```typescript
// Add Workflows tab to Scout Mode

const [activeTab, setActiveTab] = useState<'discover' | 'workspace' | 'workflows'>('discover');

// ... existing code ...

{activeTab === 'workflows' && (
  <WorkflowBrowser
    onSelectWorkflow={(workflow) => {
      setSelectedWorkflow(workflow);
      setShowWorkflowPreview(true);
    }}
  />
)}

{showWorkflowPreview && selectedWorkflow && (
  <WorkflowPreviewModal
    workflow={selectedWorkflow}
    onExecute={async () => {
      const response = await fetch(`/api/v1/workflows/${selectedWorkflow.workflow_id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const execution = await response.json();
      setWorkflowExecution(execution);
      setShowWorkflowPreview(false);
      setShowExecutionResult(true);
    }}
    onDownload={async () => {
      await fetch(`/api/v1/workflows/${selectedWorkflow.workflow_id}/download`, {
        method: 'POST',
      });
      alert('Workflow added to your library!');
    }}
    onClose={() => setShowWorkflowPreview(false)}
  />
)}
```

---

## 📝 Workflow Examples

### Example 1: Adaptive Morning Routine

**File**: `workflows/personal/adaptive-morning-routine.plx`

```toml
# Adaptive Morning Routine Workflow
# Generates personalized morning routine based on energy and schedule

domain = "personal_productivity"
description = "AI-powered morning routine that adapts to your energy level and today's schedule"
main_pipe = "create_morning_routine"

# ============================================================================
# CONCEPTS (Typed Knowledge)
# ============================================================================

[concept.UserEnergy]
description = """
User's current energy level on 1-3 scale:
- 1 (Low): Tired, need gentle start
- 2 (Medium): Normal energy
- 3 (High): Energized, ready for challenges
"""

[concept.TodaySchedule]
description = "User's calendar events for today with times and durations"

[concept.AvailableTime]
description = "Minutes available before first commitment"

[concept.MorningAssessment]
description = "Analysis of user's morning situation with recommendations"
refines = "Text"

[concept.RoutinePlan]
description = "Personalized morning routine with 3-5 micro-steps"
refines = "Text"

[concept.PlatformTask]
description = "Task formatted for Proxy-Agent-Platform with micro-steps"
refines = "Text"

# ============================================================================
# PIPELINE (Pipes Chain Together)
# ============================================================================

[[pipe]]
name = "assess_morning_situation"
input = ["UserEnergy", "TodaySchedule"]
output = "MorningAssessment"
instruction = """
Analyze the user's morning situation:

1. Energy Level Analysis:
   - Low (1): Recommend light, short activities (5 min each)
   - Medium (2): Balanced routine (5-10 min each)
   - High (3): More comprehensive routine (10-15 min each)

2. Schedule Analysis:
   - Extract first commitment time
   - Calculate available time until then
   - Determine if schedule is busy/moderate/light

3. Provide Assessment:
   - Recommended routine length (total minutes)
   - Routine intensity (light/moderate/full)
   - Key focus areas based on energy + schedule

Output format:
{
  "energy_level": 1-3,
  "available_time_minutes": number,
  "schedule_intensity": "light" | "moderate" | "busy",
  "recommended_total_minutes": number,
  "recommended_intensity": "light" | "moderate" | "full",
  "focus_areas": ["area1", "area2", ...]
}
"""
provider = "anthropic:claude-3-5-sonnet"

[[pipe]]
name = "generate_routine_steps"
input = ["MorningAssessment"]
output = "RoutinePlan"
instruction = """
Generate a personalized morning routine with 3-5 micro-steps.

Requirements:
- Each step: 5-15 minutes (ADHD-optimized)
- Total time: Match MorningAssessment.recommended_total_minutes
- Step types: Mix of HUMAN (physical) and DIGITAL (mental) tasks
- Include emoji icons for each step

Prioritize:
- Low energy: Gentle start (shower, light breakfast, breathing)
- Medium energy: Balanced (exercise, breakfast, planning)
- High energy: Full routine (workout, healthy meal, goal setting)

Output format (JSON):
{
  "title": "Morning Routine - [Date]",
  "description": "AI-generated routine based on your energy and schedule",
  "total_minutes": number,
  "steps": [
    {
      "order": 1,
      "description": "Detailed step description",
      "short_label": "Short label",
      "duration_minutes": 5-15,
      "type": "HUMAN" | "DIGITAL",
      "icon": "emoji"
    },
    ...
  ]
}
"""
provider = "anthropic:claude-3-5-sonnet"

[[pipe]]
name = "format_for_platform"
input = ["RoutinePlan"]
output = "PlatformTask"
instruction = """
Convert the routine plan into platform-compatible task format.

Transform RoutinePlan JSON into:
{
  "title": string,
  "description": string,
  "priority": "high",
  "zone_name": "Self",
  "steps": [
    {
      "description": string,
      "short_label": string,
      "estimated_minutes": number,
      "leaf_type": "HUMAN" | "DIGITAL",
      "icon": string
    },
    ...
  ]
}

Ensure:
- All fields properly formatted
- Steps maintain order
- Icons are valid emojis
"""
provider = "anthropic:claude-3-5-sonnet"
```

### Example 2: Business Client Onboarding

**File**: `workflows/business/client-onboarding.plx`

```toml
# Client Onboarding Workflow
# Generates personalized onboarding checklist based on client type

domain = "business_operations"
description = "AI-powered client onboarding workflow that adapts to client type and industry"
main_pipe = "create_onboarding_plan"

[concept.ClientProfile]
description = """
Client information:
- Name
- Industry
- Company size (small/medium/large)
- Service type (consulting/development/design)
- Contract value
"""

[concept.OnboardingAssessment]
description = "Analysis of client needs and onboarding requirements"
refines = "Text"

[concept.OnboardingPlan]
description = "Structured onboarding checklist with timeline"
refines = "Text"

[concept.PlatformTask]
description = "Task formatted for Proxy-Agent-Platform"
refines = "Text"

[[pipe]]
name = "assess_client_needs"
input = ["ClientProfile"]
output = "OnboardingAssessment"
instruction = """
Analyze client profile and determine onboarding requirements:

1. Complexity Level:
   - Small company + simple service = Basic onboarding
   - Medium company + moderate service = Standard onboarding
   - Large company + complex service = Premium onboarding

2. Key Deliverables:
   - Contract documents
   - Access setup (tools, credentials)
   - Kickoff meeting
   - Communication protocols
   - Success metrics

3. Timeline:
   - Basic: 1-2 days
   - Standard: 3-5 days
   - Premium: 1-2 weeks

Output assessment with recommended steps and timeline.
"""
provider = "anthropic:claude-3-5-sonnet"

[[pipe]]
name = "generate_onboarding_steps"
input = ["OnboardingAssessment", "ClientProfile"]
output = "OnboardingPlan"
instruction = """
Generate detailed onboarding checklist with 5-10 steps.

Include:
- Contract finalization
- Tool/system access setup
- Kickoff meeting scheduling
- Team introductions
- Process documentation sharing
- First milestone definition

Each step should have:
- Clear description
- Responsible party (you/client/both)
- Duration estimate
- Success criteria

Format as JSON with steps array.
"""
provider = "anthropic:claude-3-5-sonnet"

[[pipe]]
name = "format_for_platform"
input = ["OnboardingPlan"]
output = "PlatformTask"
instruction = """
Convert onboarding plan to platform task format.

Task metadata:
- Title: "Client Onboarding - [Client Name]"
- Priority: "high"
- Zone: "Work"
- Tags: ["client", "onboarding", industry]

Transform each step to micro-step with:
- description
- short_label
- estimated_minutes
- leaf_type (DIGITAL for most onboarding tasks)
- icon (use business emojis: 📄, 🔑, 📧, 👥, etc.)
"""
provider = "anthropic:claude-3-5-sonnet"
```

### Example 3: Academic Research Paper

**File**: `workflows/academic/research-paper.plx`

```toml
# Research Paper Writing Workflow
# Generates structured research paper plan with milestones

domain = "academic_productivity"
description = "AI-powered research paper workflow that breaks down the writing process into manageable steps"
main_pipe = "create_research_plan"

[concept.PaperTopic]
description = """
Research paper details:
- Topic/title
- Field (STEM/humanities/social science)
- Length (pages)
- Deadline
- Citation style (APA/MLA/Chicago)
"""

[concept.ResearchAssessment]
description = "Analysis of research complexity and timeline"
refines = "Text"

[concept.ResearchPlan]
description = "Structured research and writing plan with phases"
refines = "Text"

[concept.PlatformTask]
description = "Task formatted for Proxy-Agent-Platform"
refines = "Text"

[[pipe]]
name = "assess_research_scope"
input = ["PaperTopic"]
output = "ResearchAssessment"
instruction = """
Analyze research paper requirements and create timeline:

1. Complexity Analysis:
   - Topic breadth (narrow/moderate/broad)
   - Research depth needed
   - Citation count needed
   - Expected work hours

2. Phase Breakdown:
   - Phase 1: Literature review (20% time)
   - Phase 2: Outline creation (10% time)
   - Phase 3: First draft (40% time)
   - Phase 4: Revision (20% time)
   - Phase 5: Final editing (10% time)

3. Timeline Calculation:
   - Work backwards from deadline
   - Account for ADHD-friendly breaks
   - Suggest daily/weekly milestones

Output assessment with phases, durations, and milestones.
"""
provider = "anthropic:claude-3-5-sonnet"

[[pipe]]
name = "generate_writing_steps"
input = ["ResearchAssessment", "PaperTopic"]
output = "ResearchPlan"
instruction = """
Generate detailed research paper steps (8-15 steps).

Structure:
1. Literature Review Steps:
   - Find 10-15 sources
   - Read and annotate
   - Organize notes

2. Outline Steps:
   - Create thesis statement
   - Build section structure
   - Map evidence to sections

3. Drafting Steps:
   - Write introduction
   - Write body sections (one step per section)
   - Write conclusion

4. Revision Steps:
   - Review for clarity
   - Check citations
   - Proofread

Each step: 30-90 minutes (ADHD-optimized chunks)

Format as JSON with steps array.
"""
provider = "anthropic:claude-3-5-sonnet"

[[pipe]]
name = "format_for_platform"
input = ["ResearchPlan"]
output = "PlatformTask"
instruction = """
Convert research plan to platform task format.

Task metadata:
- Title: "Research Paper - [Topic]"
- Priority: "high"
- Zone: "Work" or "Academic"
- Tags: ["research", "writing", "academic", field]

Transform each step to micro-step with:
- description (detailed action)
- short_label (phase + step number)
- estimated_minutes
- leaf_type (mostly DIGITAL for writing/research)
- icon (use academic emojis: 📚, ✍️, 🔍, 📝, etc.)
"""
provider = "anthropic:claude-3-5-sonnet"
```

---

## 🌐 Repository Infrastructure

### S3/CDN Setup for .plx Files

**File Structure**:
```
s3://proxy-agent-workflows/
├── public/
│   ├── personal/
│   │   ├── adaptive-morning-routine.plx
│   │   ├── weekly-review.plx
│   │   └── inbox-zero.plx
│   ├── business/
│   │   ├── client-onboarding.plx
│   │   ├── quarterly-review.plx
│   │   └── project-kickoff.plx
│   ├── academic/
│   │   ├── research-paper.plx
│   │   └── study-session.plx
│   └── creative/
│       ├── blog-post-creation.plx
│       └── video-script-writing.plx
└── private/
    └── user-{user_id}/
        └── custom-workflow-{id}.plx
```

**CDN Configuration** (CloudFront):
```json
{
  "Origins": [
    {
      "DomainName": "proxy-agent-workflows.s3.us-east-1.amazonaws.com",
      "OriginPath": "/public",
      "S3OriginConfig": {
        "OriginAccessIdentity": "cloudfront-access-identity"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-proxy-agent-workflows",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": ["GET", "HEAD"],
    "CachedMethods": ["GET", "HEAD"],
    "Compress": true,
    "MinTTL": 86400,
    "DefaultTTL": 604800,
    "MaxTTL": 31536000
  }
}
```

**Environment Variables**:
```bash
# .env
WORKFLOW_S3_BUCKET=proxy-agent-workflows
WORKFLOW_CDN_URL=https://workflows.proxy-agent-platform.com
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### File Upload Service

**File**: `src/workflows/storage.py`

```python
"""S3 storage service for workflow .plx files."""
import boto3
from botocore.exceptions import ClientError
from typing import Optional
import os
from uuid import UUID


class WorkflowStorageService:
    """Handles .plx file storage on S3."""

    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket = os.getenv('WORKFLOW_S3_BUCKET', 'proxy-agent-workflows')
        self.cdn_url = os.getenv('WORKFLOW_CDN_URL', 'https://workflows.proxy-agent-platform.com')

    def upload_workflow(
        self,
        workflow_id: UUID,
        plx_content: str,
        category: str,
        is_public: bool = True
    ) -> str:
        """
        Upload .plx file to S3.

        Args:
            workflow_id: Unique workflow identifier
            plx_content: .plx file content as string
            category: Workflow category (personal, business, etc.)
            is_public: Whether workflow is publicly accessible

        Returns:
            CDN URL to the uploaded file
        """
        # Construct S3 key
        visibility = "public" if is_public else "private"
        key = f"{visibility}/{category}/{workflow_id}.plx"

        try:
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=plx_content.encode('utf-8'),
                ContentType='text/plain',
                CacheControl='public, max-age=604800',  # 1 week
                Metadata={
                    'workflow_id': str(workflow_id),
                    'category': category
                }
            )

            # If public, set ACL
            if is_public:
                self.s3_client.put_object_acl(
                    Bucket=self.bucket,
                    Key=key,
                    ACL='public-read'
                )

            # Return CDN URL
            cdn_url = f"{self.cdn_url}/{category}/{workflow_id}.plx"
            return cdn_url

        except ClientError as e:
            raise StorageError(f"Failed to upload workflow: {str(e)}") from e

    def download_workflow(self, workflow_id: UUID, category: str) -> str:
        """
        Download .plx file from S3.

        Returns:
            .plx file content as string
        """
        key = f"public/{category}/{workflow_id}.plx"

        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket,
                Key=key
            )
            return response['Body'].read().decode('utf-8')
        except ClientError as e:
            raise StorageError(f"Failed to download workflow: {str(e)}") from e

    def delete_workflow(self, workflow_id: UUID, category: str):
        """Delete .plx file from S3."""
        key = f"public/{category}/{workflow_id}.plx"

        try:
            self.s3_client.delete_object(
                Bucket=self.bucket,
                Key=key
            )
        except ClientError as e:
            raise StorageError(f"Failed to delete workflow: {str(e)}") from e

    def generate_signed_url(
        self,
        workflow_id: UUID,
        category: str,
        expiration: int = 3600
    ) -> str:
        """
        Generate pre-signed URL for private workflows.

        Args:
            workflow_id: Workflow identifier
            category: Workflow category
            expiration: URL expiration in seconds (default 1 hour)

        Returns:
            Pre-signed URL
        """
        key = f"private/{category}/{workflow_id}.plx"

        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            raise StorageError(f"Failed to generate signed URL: {str(e)}") from e


class StorageError(Exception):
    """Raised when storage operations fail."""
    pass
```

### Workflow Validation Service

**File**: `src/workflows/validation.py`

```python
"""Validates .plx workflow syntax and structure."""
from pipelex import Pipeline
from typing import Dict, List, Any
import tempfile
import os


class WorkflowValidator:
    """Validates .plx workflow files."""

    def validate_plx_syntax(self, plx_content: str) -> Dict[str, Any]:
        """
        Validate .plx file syntax.

        Returns:
            {
                "valid": bool,
                "errors": List[str],
                "warnings": List[str],
                "metadata": {
                    "domain": str,
                    "description": str,
                    "pipe_count": int,
                    "concept_count": int
                }
            }
        """
        result = {
            "valid": False,
            "errors": [],
            "warnings": [],
            "metadata": {}
        }

        # Write to temp file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.plx', delete=False) as f:
            f.write(plx_content)
            temp_path = f.name

        try:
            # Try to load with Pipelex
            pipeline = Pipeline.from_file(temp_path)

            # Extract metadata
            result["metadata"] = {
                "domain": pipeline.domain,
                "description": pipeline.description,
                "pipe_count": len(pipeline.pipes),
                "concept_count": len(pipeline.concepts)
            }

            # Validate required fields
            if not pipeline.domain:
                result["errors"].append("Missing 'domain' field")

            if not pipeline.description:
                result["errors"].append("Missing 'description' field")

            if len(pipeline.pipes) == 0:
                result["errors"].append("No pipes defined")

            # Check for PlatformTask output
            has_platform_output = False
            for pipe in pipeline.pipes:
                if "PlatformTask" in pipe.output:
                    has_platform_output = True
                    break

            if not has_platform_output:
                result["warnings"].append(
                    "No pipe outputs 'PlatformTask' - workflow may not integrate with platform"
                )

            # If no errors, mark as valid
            if len(result["errors"]) == 0:
                result["valid"] = True

        except Exception as e:
            result["errors"].append(f"Syntax error: {str(e)}")

        finally:
            # Clean up temp file
            os.unlink(temp_path)

        return result

    def estimate_execution_cost(self, plx_content: str, llm_provider: str) -> Dict[str, Any]:
        """
        Estimate execution cost based on pipes and LLM provider.

        Returns:
            {
                "estimated_tokens": int,
                "estimated_cost_usd": float,
                "estimated_time_seconds": int
            }
        """
        # Cost per 1K tokens (as of 2025-01)
        cost_per_1k = {
            "anthropic:claude-3-5-sonnet": 0.003,  # Input tokens
            "openai:gpt-4": 0.03,
            "openai:gpt-3.5-turbo": 0.0005,
            "ollama:llama3": 0.0  # Local, free
        }

        # Write to temp file and parse
        with tempfile.NamedTemporaryFile(mode='w', suffix='.plx', delete=False) as f:
            f.write(plx_content)
            temp_path = f.name

        try:
            pipeline = Pipeline.from_file(temp_path)

            # Estimate tokens per pipe (rough heuristic)
            total_tokens = 0
            for pipe in pipeline.pipes:
                # Instruction length as proxy for complexity
                instruction_length = len(pipe.instruction)
                tokens_per_pipe = instruction_length // 4  # ~4 chars per token
                tokens_per_pipe += 500  # Base overhead
                total_tokens += tokens_per_pipe

            # Calculate cost
            cost_rate = cost_per_1k.get(llm_provider, 0.01)
            estimated_cost = (total_tokens / 1000) * cost_rate

            # Estimate time (30s per pipe on average)
            estimated_time = len(pipeline.pipes) * 30

            return {
                "estimated_tokens": total_tokens,
                "estimated_cost_usd": round(estimated_cost, 4),
                "estimated_time_seconds": estimated_time
            }

        finally:
            os.unlink(temp_path)
```

---

## 🔒 Security & Privacy

### Security Considerations

1. **User API Keys**:
   - Stored encrypted in database (use `cryptography` library)
   - Never logged or exposed in API responses
   - Users can delete keys at any time

2. **Workflow Sandboxing**:
   - Pipelex pipelines run in isolated environment
   - No file system access beyond .plx file
   - Network requests only to approved LLM providers

3. **Cost Limits**:
   - Users set max cost per execution (default $0.10)
   - Platform monitors total spend per user
   - Abort execution if cost limit exceeded

4. **Rate Limiting**:
   ```python
   from fastapi import Request
   from slowapi import Limiter
   from slowapi.util import get_remote_address

   limiter = Limiter(key_func=get_remote_address)

   @router.post("/{workflow_id}/execute")
   @limiter.limit("10/minute")  # Max 10 executions per minute
   async def execute_workflow(request: Request, workflow_id: UUID):
       # ...
   ```

5. **Input Validation**:
   - Validate .plx files before upload
   - Sanitize user inputs to workflows
   - Check for malicious prompt injection

### Privacy Considerations

1. **User Context**:
   - Only send necessary context to LLM
   - Never send sensitive data (passwords, API keys)
   - Allow users to opt out of context sharing

2. **Execution Logs**:
   - Store inputs/outputs as JSONB for debugging
   - Anonymize logs after 30 days
   - Users can request data deletion (GDPR compliance)

3. **Private Workflows**:
   - Users can create private workflows (not shared)
   - Stored in separate S3 path with signed URLs
   - Only accessible by owner

### Implementation: API Key Encryption

**File**: `src/security/encryption.py`

```python
"""Encryption utilities for sensitive data."""
from cryptography.fernet import Fernet
import os
import base64


class EncryptionService:
    """Handles encryption/decryption of sensitive data."""

    def __init__(self):
        # Load encryption key from environment
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            raise ValueError("ENCRYPTION_KEY environment variable not set")

        self.cipher = Fernet(key.encode())

    def encrypt_api_key(self, api_key: str) -> str:
        """Encrypt API key for storage."""
        encrypted = self.cipher.encrypt(api_key.encode())
        return base64.b64encode(encrypted).decode()

    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt API key for use."""
        encrypted_bytes = base64.b64decode(encrypted_key.encode())
        decrypted = self.cipher.decrypt(encrypted_bytes)
        return decrypted.decode()


# Usage in user settings
from src.security.encryption import EncryptionService

encryption_service = EncryptionService()

# Storing API key
encrypted_key = encryption_service.encrypt_api_key(user_provided_api_key)
user_settings.llm_api_key_encrypted = encrypted_key

# Using API key
decrypted_key = encryption_service.decrypt_api_key(user_settings.llm_api_key_encrypted)
pipeline.set_credentials(decrypted_key)
```

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (Weeks 13-16) - 4 weeks

**Goal**: Core workflow execution engine working locally

#### Week 13: Setup & Architecture
- [ ] Install Pipelex: `uv add pipelex pipelex[anthropic]`
- [ ] Create database schema (workflow_templates, workflow_executions)
- [ ] Run migrations
- [ ] Create basic models (WorkflowTemplate, WorkflowExecution)
- [ ] Set up /workflows directory in repo

#### Week 14: Execution Engine
- [ ] Implement PipelexWorkflowExecutor
- [ ] Context gathering methods (energy, schedule, zones)
- [ ] Output transformation (Pipelex → TaskCreate)
- [ ] Error handling and logging
- [ ] Write 3 example .plx files (morning routine, inbox zero, weekly review)

#### Week 15: API Layer
- [ ] Create workflow repository (WorkflowRepository)
- [ ] Implement API routes (/workflows, /workflows/{id}/execute)
- [ ] Add authentication middleware
- [ ] Test workflow execution locally
- [ ] Validate outputs match TaskCreate schema

#### Week 16: Testing & Refinement
- [ ] Write TDD tests for executor (95% coverage)
- [ ] Test with different energy levels
- [ ] Test with different schedules
- [ ] Optimize AI prompts in .plx files
- [ ] Document API endpoints

**Deliverables**:
- ✅ Workflow execution engine (local only)
- ✅ 3 working example workflows
- ✅ API endpoints functional
- ✅ Tests passing

---

### Phase 2: Repository Infrastructure (Weeks 17-20) - 4 weeks

**Goal**: Online workflow repository with browse/search

#### Week 17: S3/CDN Setup
- [ ] Set up AWS S3 bucket (proxy-agent-workflows)
- [ ] Configure CloudFront CDN
- [ ] Implement WorkflowStorageService (upload/download)
- [ ] Upload 5 example workflows to S3
- [ ] Test CDN URLs work

#### Week 18: Workflow Metadata
- [ ] Extend workflow_templates table (download_count, ratings, etc.)
- [ ] Implement WorkflowValidator (syntax validation)
- [ ] Estimate execution cost per workflow
- [ ] Add workflow tags system
- [ ] Seed 10 workflows across categories

#### Week 19: Browse & Search API
- [ ] Implement list workflows (by category)
- [ ] Implement full-text search (PostgreSQL)
- [ ] Add pagination (limit/offset)
- [ ] Add filtering (category, rating, cost)
- [ ] Test with 50+ workflows

#### Week 20: Statistics & Analytics
- [ ] Track download counts
- [ ] Track execution counts
- [ ] Calculate success rates
- [ ] Implement trending workflows algorithm
- [ ] Add analytics dashboard (admin only)

**Deliverables**:
- ✅ S3/CDN infrastructure live
- ✅ 10+ workflows available
- ✅ Browse/search API functional
- ✅ Analytics tracking

---

### Phase 3: Frontend Integration (Weeks 21-24) - 4 weeks

**Goal**: User-facing workflow browser and execution UI

#### Week 21: WorkflowBrowser Component
- [ ] Create WorkflowBrowser.tsx (Storybook first)
- [ ] Implement category filtering
- [ ] Implement search bar
- [ ] Create WorkflowCard component
- [ ] Write 5 Storybook stories

#### Week 22: WorkflowPreview Modal
- [ ] Create WorkflowPreviewModal.tsx
- [ ] Show workflow metadata (cost, time, etc.)
- [ ] Display required concepts
- [ ] Add "Execute" and "Download" buttons
- [ ] Test with real workflows

#### Week 23: Execution Result Display
- [ ] Create WorkflowExecutionResult.tsx
- [ ] Show AI-generated task with chevron steps
- [ ] Display execution stats (tokens, cost, time)
- [ ] Add "Start Task" button → ChevronTaskFlow
- [ ] Test full flow: Browse → Preview → Execute → View Task

#### Week 24: Scout Mode Integration
- [ ] Add "Workflows" tab to Scout Mode
- [ ] Wire up WorkflowBrowser
- [ ] Wire up preview/execution modals
- [ ] Add loading states
- [ ] Test on mobile viewport

**Deliverables**:
- ✅ WorkflowBrowser component (Storybook)
- ✅ Full execution flow working
- ✅ Integrated into Scout Mode
- ✅ Mobile-optimized

---

### Phase 4: Marketplace & Monetization (Weeks 25-28) - 4 weeks

**Goal**: Community-driven marketplace with reviews and payments

#### Week 25: User Workflow Submissions
- [ ] Create workflow submission form
- [ ] Upload .plx file (drag & drop)
- [ ] Validate .plx syntax on upload
- [ ] Store in private S3 path (pending review)
- [ ] Admin approval workflow

#### Week 26: Reviews & Ratings
- [ ] Implement workflow_reviews table
- [ ] Create review submission API
- [ ] Display average rating on WorkflowCard
- [ ] Show top reviews in WorkflowPreview
- [ ] Add "helpful" votes on reviews

#### Week 27: Premium Workflows
- [ ] Add is_premium and price_usd fields
- [ ] Integrate payment gateway (Stripe)
- [ ] Implement purchase flow
- [ ] Track purchased workflows per user
- [ ] Revenue sharing calculation (80/20 split)

#### Week 28: API Credits & Billing
- [ ] Implement API credit system
- [ ] Track LLM usage per user
- [ ] Billing dashboard (credits used, remaining)
- [ ] Auto-recharge when credits low
- [ ] Cost breakdown by workflow

**Deliverables**:
- ✅ Workflow submission system
- ✅ Reviews and ratings
- ✅ Premium workflow purchases
- ✅ API credit billing

---

### Phase 5 (Future): Advanced Features (Weeks 29+)

**Features**:
- Workflow versioning (v1, v2, etc.)
- Fork and customize workflows
- Workflow analytics (success rates, popular pipes)
- Enterprise custom workflows
- Multi-LLM A/B testing
- Workflow templates IDE (online editor)
- Community forums & discussions

---

## 🧪 Testing Strategy

### Unit Tests

**File**: `src/workflows/tests/test_executor.py`

```python
"""Unit tests for workflow executor."""
import pytest
from uuid import uuid4
from src.workflows.executor import PipelexWorkflowExecutor
from src.workflows.models import WorkflowTemplate


@pytest.fixture
def sample_workflow():
    """Create a sample workflow for testing."""
    return WorkflowTemplate(
        workflow_id=uuid4(),
        name="Test Workflow",
        description="Test workflow description",
        category="personal",
        icon="🧪",
        plx_file_url="https://cdn.example.com/test.plx",
        plx_version="0.1.0",
        required_concepts=["UserEnergy", "Schedule"],
        output_concepts=["PlatformTask"],
        default_llm_provider="anthropic:claude-3-5-sonnet",
        estimated_tokens=1000,
        estimated_cost_usd=0.003,
        is_public=True,
        is_verified=True,
        # ... other fields
    )


@pytest.fixture
def executor():
    """Create workflow executor instance."""
    return PipelexWorkflowExecutor()


@pytest.mark.asyncio
async def test_gather_user_context(executor):
    """Test that user context is gathered correctly."""
    user_id = "test-user-123"
    context = await executor._gather_user_context(user_id)

    assert "user_energy" in context
    assert "schedule" in context
    assert "compass_zones" in context
    assert "recent_tasks" in context
    assert context["user_energy"] in [1, 2, 3]


@pytest.mark.asyncio
async def test_execute_workflow_success(executor, sample_workflow):
    """Test successful workflow execution."""
    user_id = "test-user-123"

    # Mock .plx file content
    # TODO: Implement mocking

    execution = await executor.execute_workflow(
        workflow_id=sample_workflow.workflow_id,
        user_id=user_id
    )

    assert execution.status == "completed"
    assert execution.task_id is not None
    assert execution.output_result is not None


@pytest.mark.asyncio
async def test_execute_workflow_failure(executor, sample_workflow):
    """Test workflow execution failure handling."""
    user_id = "test-user-123"

    # Mock invalid .plx file
    # TODO: Implement mocking

    with pytest.raises(WorkflowExecutionError):
        await executor.execute_workflow(
            workflow_id=sample_workflow.workflow_id,
            user_id=user_id
        )


def test_create_task_from_result(executor):
    """Test transformation of Pipelex result to Task."""
    # Mock Pipelex result
    result = MockPipelineResult({
        "PlatformTask": {
            "title": "Morning Routine",
            "description": "AI-generated routine",
            "priority": "high",
            "steps": [
                {
                    "description": "5-min shower",
                    "duration_minutes": 5,
                    "type": "HUMAN",
                    "icon": "🚿"
                },
                {
                    "description": "Quick breakfast",
                    "duration_minutes": 10,
                    "type": "HUMAN",
                    "icon": "🍳"
                }
            ]
        }
    })

    user_id = "test-user-123"
    workflow = sample_workflow

    task = executor._create_task_from_result(result, user_id, workflow)

    assert task.title == "Morning Routine"
    assert len(task.micro_steps) == 2
    assert task.micro_steps[0].estimated_minutes == 5
```

### Integration Tests

**File**: `src/workflows/tests/test_integration.py`

```python
"""Integration tests for full workflow execution."""
import pytest
from fastapi.testclient import TestClient
from src.api.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_list_workflows(client):
    """Test listing workflows."""
    response = client.get("/api/v1/workflows")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "workflow_id" in data[0]
        assert "name" in data[0]


def test_list_workflows_by_category(client):
    """Test filtering workflows by category."""
    response = client.get("/api/v1/workflows?category=personal")
    assert response.status_code == 200
    data = response.json()
    assert all(w["category"] == "personal" for w in data)


def test_search_workflows(client):
    """Test full-text search."""
    response = client.get("/api/v1/workflows?search=morning routine")
    assert response.status_code == 200
    data = response.json()
    # Results should contain "morning" or "routine" in name/description


def test_execute_workflow_end_to_end(client, auth_headers):
    """Test full workflow execution flow."""
    # 1. Get a workflow
    response = client.get("/api/v1/workflows")
    workflows = response.json()
    assert len(workflows) > 0
    workflow_id = workflows[0]["workflow_id"]

    # 2. Execute workflow
    response = client.post(
        f"/api/v1/workflows/{workflow_id}/execute",
        headers=auth_headers
    )
    assert response.status_code == 200
    execution = response.json()
    assert execution["status"] == "completed"
    assert execution["task_id"] is not None

    # 3. Verify task was created
    task_id = execution["task_id"]
    response = client.get(f"/api/v1/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 200
    task = response.json()
    assert len(task["micro_steps"]) > 0
```

### Performance Tests

**File**: `src/workflows/tests/test_performance.py`

```python
"""Performance tests for workflow execution."""
import pytest
import time
from src.workflows.executor import PipelexWorkflowExecutor


@pytest.mark.asyncio
async def test_execution_time_within_limits(executor, sample_workflow):
    """Test that workflow executes within expected time."""
    user_id = "test-user-123"

    start_time = time.time()
    execution = await executor.execute_workflow(
        workflow_id=sample_workflow.workflow_id,
        user_id=user_id
    )
    end_time = time.time()

    elapsed = end_time - start_time

    # Should complete within 2x estimated time
    expected_time = sample_workflow.execution_time_seconds
    assert elapsed <= expected_time * 2


@pytest.mark.asyncio
async def test_concurrent_executions(executor, sample_workflow):
    """Test multiple workflows executing concurrently."""
    import asyncio

    user_id = "test-user-123"

    # Execute 5 workflows concurrently
    tasks = [
        executor.execute_workflow(sample_workflow.workflow_id, user_id)
        for _ in range(5)
    ]

    start_time = time.time()
    results = await asyncio.gather(*tasks, return_exceptions=True)
    end_time = time.time()

    # All should succeed
    assert all(not isinstance(r, Exception) for r in results)

    # Should complete faster than sequential (5x faster at least 3x)
    elapsed = end_time - start_time
    sequential_time = sample_workflow.execution_time_seconds * 5
    assert elapsed < sequential_time * 0.6  # At least 40% faster
```

### Test Coverage Requirements

- **Unit tests**: 95%+ coverage
- **Integration tests**: All API endpoints
- **Performance tests**: All critical paths
- **E2E tests**: Full user flows (browse → execute → task creation)

**Run tests**:
```bash
# All tests
source .venv/bin/activate && python -m pytest src/workflows/tests/ -v

# With coverage
python -m pytest src/workflows/tests/ --cov=src/workflows --cov-report=html

# Performance only
python -m pytest src/workflows/tests/test_performance.py -v
```

---

## 📈 Success Metrics

### Key Performance Indicators (KPIs)

#### Phase 1 (Weeks 13-16) - Foundation
| Metric | Target | How to Measure |
|--------|--------|---------------|
| Workflow execution success rate | 95%+ | `workflow_executions.status = 'completed'` |
| Avg execution time | < 60s | `workflow_executions.duration_seconds` |
| AI-generated tasks per workflow | 3-5 steps | Count `micro_steps` in created tasks |
| Test coverage | 95%+ | pytest --cov |

#### Phase 2 (Weeks 17-20) - Repository
| Metric | Target | How to Measure |
|--------|--------|---------------|
| Workflows available | 20+ | Count `workflow_templates` |
| Categories covered | 5/5 | Distinct `category` values |
| Workflow validation success | 100% | All uploaded .plx files valid |
| CDN response time | < 200ms | CloudFront metrics |

#### Phase 3 (Weeks 21-24) - Frontend
| Metric | Target | How to Measure |
|--------|--------|---------------|
| Workflow discovery rate | 70%+ users browse workflows | Analytics: `/workflows` page views |
| Workflow execution rate | 40%+ of browsed workflows executed | Executions / views ratio |
| Task completion rate | 50%+ of generated tasks completed | Tasks with all steps done |
| Mobile usability score | 90+ | Lighthouse mobile score |

#### Phase 4 (Weeks 25-28) - Marketplace
| Metric | Target | How to Measure |
|--------|--------|---------------|
| User-submitted workflows | 5+ per week | Count new `workflow_templates` |
| Workflow reviews | 50+ reviews total | Count `workflow_reviews` |
| Premium workflow purchases | 10+ purchases | Count paid executions |
| Revenue generated | $100+ MRR | Sum of purchases + API credits |

### User Experience Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Workflow discovery time | < 30s | Time to first workflow selection |
| Execution satisfaction | 4+/5 stars | Post-execution survey |
| Task completion rate | 60%+ | Tasks generated from workflows |
| Repeat usage rate | 50%+ users execute 2+ workflows/week | User behavior tracking |

### Business Metrics (Long-term)

| Metric | Year 1 Target | How to Measure |
|--------|---------------|----------------|
| Total workflows available | 100+ | Count all public workflows |
| Monthly workflow executions | 5,000+ | Sum monthly executions |
| Monthly Active Users (MAU) | 1,000+ | Distinct users executing workflows |
| Premium conversion rate | 10% | Paid users / total users |
| Annual Recurring Revenue (ARR) | $50,000+ | Sum of premium subscriptions + credits |

---

## 📚 References

### External Resources

1. **Pipelex Documentation**:
   - GitHub: https://github.com/Pipelex/pipelex
   - Docs: https://docs.pipelex.com/
   - Cookbook: https://github.com/Pipelex/pipelex-cookbook

2. **Related Projects**:
   - LangChain: https://www.langchain.com/ (inspiration for AI pipelines)
   - Zapier: https://zapier.com/ (workflow automation UX)
   - n8n: https://n8n.io/ (open-source workflow automation)

3. **AI/LLM Resources**:
   - Anthropic Claude: https://www.anthropic.com/claude
   - OpenAI API: https://platform.openai.com/docs
   - Ollama (local LLMs): https://ollama.ai/

### Internal Documents

1. **Platform Documentation**:
   - [PRD_ADHD_APP.md](../PRD_ADHD_APP.md) - Product vision
   - [INTEGRATION_ROADMAP.md](../roadmap/INTEGRATION_ROADMAP.md) - 12-week plan
   - [PROJECT_VISION_SYNTHESIS.md](../PROJECT_VISION_SYNTHESIS.md) - Complete vision
   - [AGENT_DEVELOPMENT_ENTRY_POINT.md](../AGENT_DEVELOPMENT_ENTRY_POINT.md) - Agent coordination

2. **Task Specifications**:
   - [BE-01: Task Templates Service](../tasks/backend/01_task_templates_service.md)
   - [FE-04: TaskTemplateLibrary](../tasks/frontend/04_task_template_library.md)

3. **Technical Guides**:
   - [CLAUDE.md](../../CLAUDE.md) - Development standards
   - [TECH_STACK.md](../TECH_STACK.md) - Technology overview
   - [API_REFERENCE.md](../api/API_REFERENCE.md) - API documentation

### Code Examples

1. **Pipelex Examples**:
   - Morning Routine: [workflows/personal/adaptive-morning-routine.plx](#example-1-adaptive-morning-routine)
   - Client Onboarding: [workflows/business/client-onboarding.plx](#example-2-business-client-onboarding)
   - Research Paper: [workflows/academic/research-paper.plx](#example-3-academic-research-paper)

2. **Backend Examples**:
   - Workflow Executor: [src/workflows/executor.py](#file-srcworkflowsexecutorpy)
   - Workflow Repository: [src/workflows/repository.py](#file-srcworkflowsrepositorypy)
   - API Routes: [src/api/routes/workflows.py](#file-srcapiroutesworkflowspy)

3. **Frontend Examples**:
   - WorkflowBrowser: [frontend/src/components/mobile/WorkflowBrowser.tsx](#component-workflowbrowser)
   - WorkflowPreview: [frontend/src/components/mobile/WorkflowPreviewModal.tsx](#component-workflowpreviewmodal)

---

## 🎉 Conclusion

This specification provides a **complete blueprint** for integrating Pipelex into the Proxy-Agent-Platform. The integration enables:

✅ **User-facing workflow repository** - Browse, download, and execute AI-powered workflows
✅ **Adaptive AI workflows** - Context-aware task generation based on user state
✅ **Community marketplace** - Users create, share, and monetize workflows
✅ **Business model** - Premium workflows and API credit system
✅ **ADHD-optimized UX** - Workflows reduce decision paralysis and cognitive load

### Next Actions

1. **Review & Approve** - Stakeholder sign-off on specification
2. **Phase 1 Kickoff** - Begin Week 13 (Foundation)
3. **Set up Infrastructure** - S3 bucket, database schema, Pipelex installation
4. **Build MVP** - Workflow executor + 3 example workflows
5. **User Testing** - Validate with 5-10 ADHD users

### Success Criteria

The integration is successful when:
- ✅ 20+ workflows available online
- ✅ 70%+ users discover and browse workflows
- ✅ 40%+ users execute at least 1 workflow
- ✅ 50%+ AI-generated tasks get completed
- ✅ 4+/5 star user satisfaction rating

---

**Document Status**: ✅ Ready for Implementation
**Next Review**: End of Phase 1 (Week 16)
**Version**: 1.0
**Last Updated**: 2025-01-28

---

**Questions or Feedback?** Contact: [Your Team]
**GitHub Issues**: https://github.com/your-org/proxy-agent-platform/issues
