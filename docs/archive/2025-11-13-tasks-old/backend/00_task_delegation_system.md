# BE-00: Task Delegation System (CRITICAL - Week 1)

**Status**: 🔴 CRITICAL START HERE
**Priority**: HIGHEST (Foundation for all other tasks)
**Dependencies**: None - this IS the foundation
**Estimated Time**: 8-10 hours
**TDD Approach**: RED-GREEN-REFACTOR

---

## 📋 Overview

**META-TASK**: Build the task delegation system that manages all other tasks in this development project. Since we're building an ADHD task management app, we should use the app itself to manage building the app!

This implements the **4D Delegation Model** from Epic 7:
- **DO**: Human executes task
- **DO_WITH_ME**: Human + AI collaborate
- **DELEGATE**: AI agent executes autonomously
- **DELETE**: Task not needed

**ADHD Impact**: Clear ownership, reduced decision paralysis, visible progress

---

## 🎯 The Meta-Problem

We have 11 development tasks (4 backend + 7 frontend). Each task should be:
1. **Created as a real task** in our task management database
2. **Assigned to a human or AI agent** using delegation mode
3. **Tracked through completion** with micro-steps visible
4. **Displayed in the app** so we can use Scout/Hunter/Mapper modes to build the app

**Result**: We dogfood our own product from Day 1!

---

## 🗄️ Database Schema

### Extend `tasks` table with delegation fields

```sql
-- Add delegation columns to existing tasks table
ALTER TABLE tasks ADD COLUMN delegation_mode VARCHAR(20) DEFAULT 'DO';
ALTER TABLE tasks ADD COLUMN assigned_to VARCHAR(255);  -- User ID or 'agent:{agent_name}'
ALTER TABLE tasks ADD COLUMN agent_type VARCHAR(50);    -- 'human', 'backend-tdd', 'frontend-storybook'
ALTER TABLE tasks ADD COLUMN is_meta_task BOOLEAN DEFAULT false;  -- Is this a development task?
ALTER TABLE tasks ADD COLUMN task_source VARCHAR(50) DEFAULT 'user';  -- 'user', 'roadmap', 'system'

-- Index for agent queries
CREATE INDEX idx_tasks_delegation ON tasks(delegation_mode, assigned_to);
CREATE INDEX idx_tasks_agent ON tasks(agent_type);
```

### New table: `task_assignments`

```sql
CREATE TABLE task_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    assigned_to VARCHAR(255) NOT NULL,  -- 'user:123' or 'agent:backend-1'
    assigned_by VARCHAR(255),           -- Who assigned it
    delegation_mode VARCHAR(20) NOT NULL,  -- 'DO', 'DO_WITH_ME', 'DELEGATE', 'DELETE'
    assigned_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'accepted', 'in_progress', 'completed', 'rejected'
    rejection_reason TEXT,

    UNIQUE(task_id, assigned_to)
);

CREATE INDEX idx_assignments_to ON task_assignments(assigned_to, status);
CREATE INDEX idx_assignments_task ON task_assignments(task_id);
```

### New table: `agent_capabilities`

```sql
CREATE TABLE agent_capabilities (
    agent_id VARCHAR(255) PRIMARY KEY,  -- 'backend-agent-1', 'frontend-agent-a'
    agent_type VARCHAR(50) NOT NULL,    -- 'backend-tdd', 'frontend-storybook'
    capabilities TEXT[],                -- ['python', 'pytest', 'fastapi'] or ['react', 'typescript', 'storybook']
    max_concurrent_tasks INT DEFAULT 1,
    current_task_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'idle',  -- 'idle', 'busy', 'offline'
    last_active_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📦 Data Models (`src/database/models.py`)

```python
from pydantic import BaseModel, Field, validator
from typing import Literal, Optional, List
from uuid import UUID, uuid4
from datetime import datetime

# Extend existing Task model
class TaskUpdate(BaseModel):
    # ... existing fields ...
    delegation_mode: Optional[Literal["DO", "DO_WITH_ME", "DELEGATE", "DELETE"]] = None
    assigned_to: Optional[str] = None
    agent_type: Optional[Literal["human", "backend-tdd", "frontend-storybook"]] = None
    is_meta_task: Optional[bool] = None
    task_source: Optional[Literal["user", "roadmap", "system"]] = None

class TaskAssignmentCreate(BaseModel):
    task_id: UUID
    assigned_to: str  # 'user:123' or 'agent:backend-1'
    assigned_by: Optional[str] = None
    delegation_mode: Literal["DO", "DO_WITH_ME", "DELEGATE", "DELETE"]

class TaskAssignment(TaskAssignmentCreate):
    assignment_id: UUID = Field(default_factory=uuid4)
    assigned_at: datetime
    accepted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: Literal["pending", "accepted", "in_progress", "completed", "rejected"] = "pending"
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True

class AgentCapability(BaseModel):
    agent_id: str
    agent_type: Literal["backend-tdd", "frontend-storybook"]
    capabilities: List[str]
    max_concurrent_tasks: int = 1
    current_task_count: int = 0
    status: Literal["idle", "busy", "offline"] = "idle"
    last_active_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class DelegateTaskRequest(BaseModel):
    task_id: UUID
    delegation_mode: Literal["DO", "DO_WITH_ME", "DELEGATE", "DELETE"]
    prefer_agent_type: Optional[str] = None  # 'backend-tdd' or 'frontend-storybook'

class DelegateTaskResponse(BaseModel):
    assignment: TaskAssignment
    assigned_agent: Optional[AgentCapability] = None
    message: str
```

---

## 🔧 Repository (`src/repository/task_delegation_repository.py`)

```python
from src.repository.base import BaseRepository
from src.database.models import TaskAssignment, AgentCapability, Task
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, and_, func

class TaskDelegationRepository(BaseRepository[TaskAssignment]):
    def __init__(self):
        super().__init__()

    def assign_task(
        self,
        task_id: UUID,
        assigned_to: str,
        delegation_mode: str,
        assigned_by: Optional[str] = None
    ) -> TaskAssignment:
        """Assign task to human or agent."""
        assignment = TaskAssignment(
            task_id=task_id,
            assigned_to=assigned_to,
            delegation_mode=delegation_mode,
            assigned_by=assigned_by,
            status="pending"
        )
        return self.create(assignment)

    def get_agent_tasks(self, agent_id: str, status: Optional[str] = None) -> List[TaskAssignment]:
        """Get all tasks assigned to a specific agent."""
        with self.get_session() as session:
            query = select(TaskAssignment).where(TaskAssignment.assigned_to == agent_id)
            if status:
                query = query.where(TaskAssignment.status == status)
            return list(session.execute(query).scalars().all())

    def find_available_agent(self, agent_type: str) -> Optional[str]:
        """Find an idle agent of specified type."""
        with self.get_session() as session:
            stmt = select(AgentCapability).where(
                and_(
                    AgentCapability.agent_type == agent_type,
                    AgentCapability.status == "idle",
                    AgentCapability.current_task_count < AgentCapability.max_concurrent_tasks
                )
            ).limit(1)
            agent = session.execute(stmt).scalar_one_or_none()
            return agent.agent_id if agent else None

    def update_agent_status(self, agent_id: str, status: str, task_delta: int = 0):
        """Update agent status and task count."""
        with self.get_session() as session:
            agent = session.get(AgentCapability, agent_id)
            if agent:
                agent.status = status
                agent.current_task_count += task_delta
                agent.last_active_at = datetime.now()
                session.commit()

    def accept_assignment(self, assignment_id: UUID) -> TaskAssignment:
        """Agent/human accepts the assignment."""
        assignment = self.get_by_id(assignment_id)
        if assignment:
            assignment.status = "accepted"
            assignment.accepted_at = datetime.now()
            self.update(assignment_id, assignment)
        return assignment

    def start_assignment(self, assignment_id: UUID) -> TaskAssignment:
        """Mark assignment as in progress."""
        assignment = self.get_by_id(assignment_id)
        if assignment:
            assignment.status = "in_progress"
            self.update(assignment_id, assignment)
        return assignment

    def complete_assignment(self, assignment_id: UUID) -> TaskAssignment:
        """Mark assignment as completed."""
        assignment = self.get_by_id(assignment_id)
        if assignment:
            assignment.status = "completed"
            assignment.completed_at = datetime.now()
            self.update(assignment_id, assignment)
        return assignment
```

---

## 🚀 API Routes (`src/api/routes/task_delegation.py`)

```python
from fastapi import APIRouter, HTTPException, status
from src.database.models import (
    DelegateTaskRequest, DelegateTaskResponse,
    TaskAssignment, AgentCapability
)
from src.repository.task_delegation_repository import TaskDelegationRepository
from uuid import UUID

router = APIRouter(prefix="/api/v1/delegation", tags=["delegation"])
repo = TaskDelegationRepository()

@router.post("/delegate", response_model=DelegateTaskResponse)
async def delegate_task(request: DelegateTaskRequest):
    """
    Delegate a task using 4D model:
    - DO: Assign to current user
    - DO_WITH_ME: Assign to user + create collaboration session
    - DELEGATE: Find available agent and assign
    - DELETE: Mark task as deleted
    """
    if request.delegation_mode == "DELETE":
        # Mark task as deleted (soft delete)
        return DelegateTaskResponse(
            assignment=None,
            message="Task marked for deletion"
        )

    if request.delegation_mode == "DELEGATE":
        # Find available agent
        agent_type = request.prefer_agent_type or "backend-tdd"
        agent_id = repo.find_available_agent(agent_type)

        if not agent_id:
            raise HTTPException(
                status_code=503,
                detail=f"No available {agent_type} agents"
            )

        # Create assignment
        assignment = repo.assign_task(
            task_id=request.task_id,
            assigned_to=f"agent:{agent_id}",
            delegation_mode=request.delegation_mode
        )

        # Update agent status
        repo.update_agent_status(agent_id, "busy", task_delta=1)

        return DelegateTaskResponse(
            assignment=assignment,
            message=f"Task delegated to {agent_id}"
        )

    # DO or DO_WITH_ME: assign to human
    assignment = repo.assign_task(
        task_id=request.task_id,
        assigned_to="user:current",  # Replace with actual user_id
        delegation_mode=request.delegation_mode
    )

    return DelegateTaskResponse(
        assignment=assignment,
        message=f"Task assigned with mode: {request.delegation_mode}"
    )

@router.get("/assignments/agent/{agent_id}", response_model=List[TaskAssignment])
async def get_agent_assignments(agent_id: str, status: Optional[str] = None):
    """Get all tasks assigned to an agent."""
    return repo.get_agent_tasks(f"agent:{agent_id}", status)

@router.post("/assignments/{assignment_id}/accept")
async def accept_assignment(assignment_id: UUID):
    """Agent accepts assignment."""
    return repo.accept_assignment(assignment_id)

@router.post("/assignments/{assignment_id}/start")
async def start_assignment(assignment_id: UUID):
    """Agent starts working on assignment."""
    return repo.start_assignment(assignment_id)

@router.post("/assignments/{assignment_id}/complete")
async def complete_assignment(assignment_id: UUID):
    """Agent completes assignment."""
    assignment = repo.complete_assignment(assignment_id)

    # Update agent status back to idle
    if assignment.assigned_to.startswith("agent:"):
        agent_id = assignment.assigned_to.split(":")[1]
        repo.update_agent_status(agent_id, "idle", task_delta=-1)

    return assignment

@router.get("/agents", response_model=List[AgentCapability])
async def list_agents(agent_type: Optional[str] = None, status: Optional[str] = None):
    """List all registered agents."""
    # TODO: Implement agent listing with filters
    pass

@router.post("/agents/register", response_model=AgentCapability)
async def register_agent(agent_data: AgentCapability):
    """Register a new agent."""
    # TODO: Implement agent registration
    pass
```

---

## 🧪 TDD Tests (`src/api/tests/test_task_delegation.py`)

**RED Phase - Write FIRST:**

```python
class TestTaskDelegation:
    def test_delegate_to_agent(self, test_client, sample_task):
        """RED: Delegate task to available agent."""
        # First register an agent
        agent_data = {
            "agent_id": "backend-agent-1",
            "agent_type": "backend-tdd",
            "capabilities": ["python", "pytest", "fastapi"],
        }
        test_client.post("/api/v1/delegation/agents/register", json=agent_data)

        # Delegate task
        delegate_request = {
            "task_id": sample_task.task_id,
            "delegation_mode": "DELEGATE",
            "prefer_agent_type": "backend-tdd"
        }
        response = test_client.post("/api/v1/delegation/delegate", json=delegate_request)
        assert response.status_code == 200
        data = response.json()
        assert data["assignment"]["assigned_to"] == "agent:backend-agent-1"
        assert data["assignment"]["delegation_mode"] == "DELEGATE"

    def test_delegate_when_no_agents_available(self, test_client, sample_task):
        """RED: Delegation fails when no agents available."""
        delegate_request = {
            "task_id": sample_task.task_id,
            "delegation_mode": "DELEGATE",
            "prefer_agent_type": "backend-tdd"
        }
        response = test_client.post("/api/v1/delegation/delegate", json=delegate_request)
        assert response.status_code == 503
        assert "No available" in response.json()["detail"]

    def test_agent_accepts_assignment(self, test_client, sample_assignment):
        """RED: Agent can accept pending assignment."""
        response = test_client.post(f"/api/v1/delegation/assignments/{sample_assignment.assignment_id}/accept")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "accepted"
        assert data["accepted_at"] is not None

    def test_agent_starts_assignment(self, test_client, accepted_assignment):
        """RED: Agent can start accepted assignment."""
        response = test_client.post(f"/api/v1/delegation/assignments/{accepted_assignment.assignment_id}/start")
        assert response.status_code == 200
        assert response.json()["status"] == "in_progress"

    def test_agent_completes_assignment(self, test_client, in_progress_assignment):
        """RED: Agent can complete in-progress assignment."""
        response = test_client.post(f"/api/v1/delegation/assignments/{in_progress_assignment.assignment_id}/complete")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["completed_at"] is not None

    def test_agent_task_count_updates(self, test_client):
        """RED: Agent task count increments on assignment, decrements on completion."""
        # Register agent
        agent_data = {"agent_id": "backend-agent-1", "agent_type": "backend-tdd", "capabilities": []}
        test_client.post("/api/v1/delegation/agents/register", json=agent_data)

        # Check initial count
        agents = test_client.get("/api/v1/delegation/agents").json()
        assert agents[0]["current_task_count"] == 0

        # Delegate task
        test_client.post("/api/v1/delegation/delegate", json={"task_id": "...", "delegation_mode": "DELEGATE"})
        agents = test_client.get("/api/v1/delegation/agents").json()
        assert agents[0]["current_task_count"] == 1

        # Complete task
        # ... complete flow ...
        agents = test_client.get("/api/v1/delegation/agents").json()
        assert agents[0]["current_task_count"] == 0

    def test_get_agent_assignments(self, test_client):
        """RED: Can retrieve all assignments for an agent."""
        # Create 3 assignments for agent
        # Query assignments
        response = test_client.get("/api/v1/delegation/assignments/agent/backend-agent-1")
        assert response.status_code == 200
        assert len(response.json()) == 3

    def test_filter_assignments_by_status(self, test_client):
        """RED: Can filter agent assignments by status."""
        response = test_client.get("/api/v1/delegation/assignments/agent/backend-agent-1?status=in_progress")
        assert response.status_code == 200
        data = response.json()
        assert all(a["status"] == "in_progress" for a in data)

# 15+ more tests...
```

---

## 🌱 Seed Development Tasks

### File: `src/database/seed_roadmap_tasks.py`

Create all 11 development tasks as real tasks in the database:

```python
from src.database.models import TaskCreate, MicroStepCreate
from src.repository.task_repository import TaskRepository

def seed_development_tasks():
    """Seed 11 development tasks from roadmap."""
    repo = TaskRepository()

    tasks = [
        # Backend Tasks
        TaskCreate(
            title="BE-01: Task Templates Service",
            description="Build CRUD service for reusable task templates with pre-defined steps",
            priority="high",
            estimated_minutes=360,  # 6 hours
            delegation_mode="DELEGATE",
            agent_type="backend-tdd",
            is_meta_task=True,
            task_source="roadmap",
            tags=["backend", "tdd", "week-4"],
            micro_steps=[
                MicroStepCreate(
                    description="Create database schema (task_templates, template_steps)",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Write TDD tests (RED phase)",
                    estimated_minutes=60,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Implement Pydantic models",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Build Repository layer",
                    estimated_minutes=45,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Create FastAPI routes",
                    estimated_minutes=45,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="GREEN phase - pass all tests",
                    estimated_minutes=60,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="REFACTOR phase - optimize code",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Create seed data (5 templates)",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Validate 95%+ test coverage",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
            ]
        ),

        TaskCreate(
            title="BE-02: User Pets Service",
            description="Virtual pet system with XP, hunger, happiness, and evolution",
            priority="high",
            estimated_minutes=480,  # 8 hours
            delegation_mode="DELEGATE",
            agent_type="backend-tdd",
            is_meta_task=True,
            task_source="roadmap",
            tags=["backend", "gamification", "week-5"],
            micro_steps=[
                # 15+ micro-steps for pet service...
            ]
        ),

        # Frontend Tasks
        TaskCreate(
            title="FE-01: ChevronTaskFlow Component",
            description="Full-screen modal for step-by-step task execution",
            priority="critical",
            estimated_minutes=420,  # 7 hours
            delegation_mode="DELEGATE",
            agent_type="frontend-storybook",
            is_meta_task=True,
            task_source="roadmap",
            tags=["frontend", "storybook", "week-1"],
            micro_steps=[
                MicroStepCreate(
                    description="Create component file and TypeScript interfaces",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Write 5 Storybook stories (Default, Halfway, Final, Single, WithTimer)",
                    estimated_minutes=60,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Implement state management (steps, XP, timer)",
                    estimated_minutes=45,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Build header with progress bar",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Integrate AsyncJobTimeline",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Build current step card UI",
                    estimated_minutes=45,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Implement step completion logic",
                    estimated_minutes=45,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Add XP calculation",
                    estimated_minutes=30,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Integrate into TodayMode",
                    estimated_minutes=45,
                    leaf_type="DIGITAL"
                ),
                MicroStepCreate(
                    description="Test all stories in Storybook",
                    estimated_minutes=60,
                    leaf_type="DIGITAL"
                ),
            ]
        ),

        # ... Create all 11 tasks ...
    ]

    for task_data in tasks:
        task = repo.create(task_data)
        print(f"✅ Created task: {task.title}")

if __name__ == "__main__":
    seed_development_tasks()
    print(f"\n🎉 Seeded {11} development tasks from roadmap!")
```

---

## ✅ Completion Checklist

- [ ] Database schema extended (delegation fields, task_assignments, agent_capabilities)
- [ ] Migration created
- [ ] Pydantic models for delegation
- [ ] TaskDelegationRepository with agent finding
- [ ] API routes for delegation (/delegate, /assignments, /agents)
- [ ] 15+ TDD tests (delegation, agent lifecycle, task counts)
- [ ] 95%+ test coverage
- [ ] Seed script creates all 11 development tasks
- [ ] Agent registration endpoint
- [ ] Agent task query endpoints

---

## 🎯 Why This Matters

### Dogfooding Benefits
1. **Real-world testing**: We use our own app to build the app
2. **ADHD-optimized workflow**: We experience the chevron system ourselves
3. **Visible progress**: See development tasks in Scout/Hunter/Mapper modes
4. **Agent coordination**: Actual task delegation between humans and AI

### Meta-Task Management
- **Human tasks**: Design decisions, code reviews, architectural choices → `DO` or `DO_WITH_ME`
- **Agent tasks**: TDD implementation, Storybook components → `DELEGATE`
- **Collaboration**: Complex features needing human oversight → `DO_WITH_ME`

---

## 🔗 Next Steps

After this task is complete:
1. **Run seed script**: Creates all 11 tasks in database
2. **Open app**: See tasks in Scout mode (filtered by `is_meta_task=true`)
3. **Delegate tasks**: Use /delegation API to assign to agents
4. **Agents claim tasks**: Backend/frontend agents query for assignments
5. **Track progress**: Watch chevron progress as agents complete micro-steps
6. **Human oversight**: Review agent work, provide feedback via DO_WITH_ME

---

**This is the foundation. Start here!** 🚀
