# BE-01: Task Templates Service (Week 4)

**Status**: 🟢 AVAILABLE
**Priority**: HIGH
**Dependencies**: None (standalone service)
**Estimated Time**: 4-6 hours
**TDD Approach**: Strictly follow RED-GREEN-REFACTOR

---

## 📋 Overview

Build a backend service for managing reusable task templates. Templates contain pre-defined micro-steps that users can apply when creating new tasks (e.g., "Homework Assignment" template has steps: Research → Draft → Revise → Submit).

**Why This Matters**: Reduces task creation friction for ADHD users by 50%+ (per PRD research)

---

## 🎯 Success Criteria

- [ ] All tests written BEFORE implementation
- [ ] 95%+ test coverage
- [ ] CRUD API endpoints functional
- [ ] Database schema created with migration
- [ ] Repository pattern followed
- [ ] 5 seed templates created
- [ ] Tests passing: `source .venv/bin/activate && python -m pytest src/api/tests/test_task_templates.py -v`

---

## 🗄️ Database Schema

### Table: `task_templates`

```sql
CREATE TABLE task_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,  -- 'Academic', 'Work', 'Personal', 'Health', 'Creative'
    icon VARCHAR(50),                -- Emoji (e.g., '📚', '💼', '🏠')
    estimated_minutes INT,           -- Total estimated duration
    created_by VARCHAR(255),         -- User ID (or 'system' for default templates)
    is_public BOOLEAN DEFAULT false, -- Public templates visible to all users
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON task_templates(category);
CREATE INDEX idx_templates_public ON task_templates(is_public);
```

### Table: `template_steps`

```sql
CREATE TABLE template_steps (
    step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES task_templates(template_id) ON DELETE CASCADE,
    step_order INT NOT NULL,         -- 1, 2, 3, ... (display order)
    description TEXT NOT NULL,       -- Full step description
    short_label VARCHAR(100),        -- Short label for chevron UI
    estimated_minutes INT,           -- 2-5 minutes per step (ADHD-optimized)
    leaf_type VARCHAR(20) DEFAULT 'HUMAN',  -- 'DIGITAL' or 'HUMAN'
    icon VARCHAR(50),                -- Emoji for this step
    UNIQUE(template_id, step_order)
);

CREATE INDEX idx_template_steps_template ON template_steps(template_id);
```

---

## 📦 Data Models

### File: `src/database/models.py`

Add these Pydantic models:

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from uuid import UUID, uuid4
from datetime import datetime

class TemplateStepBase(BaseModel):
    step_order: int = Field(..., ge=1, description="Display order (1-indexed)")
    description: str = Field(..., min_length=1, max_length=500)
    short_label: Optional[str] = Field(None, max_length=100)
    estimated_minutes: int = Field(..., ge=1, le=10, description="2-5 min target")
    leaf_type: Literal["DIGITAL", "HUMAN"] = "HUMAN"
    icon: Optional[str] = Field(None, max_length=50)

class TemplateStepCreate(TemplateStepBase):
    pass

class TemplateStep(TemplateStepBase):
    step_id: UUID = Field(default_factory=uuid4)
    template_id: UUID

    class Config:
        from_attributes = True

class TaskTemplateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Literal["Academic", "Work", "Personal", "Health", "Creative"]
    icon: Optional[str] = Field(None, max_length=50)
    estimated_minutes: Optional[int] = Field(None, ge=1)

class TaskTemplateCreate(TaskTemplateBase):
    steps: List[TemplateStepCreate] = Field(..., min_items=1, max_items=10)
    created_by: str = "system"
    is_public: bool = True

class TaskTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[Literal["Academic", "Work", "Personal", "Health", "Creative"]] = None
    icon: Optional[str] = None

class TaskTemplate(TaskTemplateBase):
    template_id: UUID = Field(default_factory=uuid4)
    created_by: str
    is_public: bool
    created_at: datetime
    updated_at: datetime
    steps: List[TemplateStep] = []

    class Config:
        from_attributes = True
```

---

## 🔧 Repository Layer

### File: `src/repository/task_template_repository.py`

```python
from src.repository.base import BaseRepository
from src.database.models import TaskTemplate, TemplateStep, TaskTemplateCreate
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, and_

class TaskTemplateRepository(BaseRepository[TaskTemplate]):
    def __init__(self):
        super().__init__()  # Auto-derives "task_templates" table and "template_id" PK

    def get_by_category(self, category: str) -> List[TaskTemplate]:
        """Get all public templates in a category."""
        with self.get_session() as session:
            stmt = select(self.model).where(
                and_(
                    self.model.category == category,
                    self.model.is_public == True
                )
            )
            return list(session.execute(stmt).scalars().all())

    def get_public_templates(self) -> List[TaskTemplate]:
        """Get all public templates."""
        with self.get_session() as session:
            stmt = select(self.model).where(self.model.is_public == True)
            return list(session.execute(stmt).scalars().all())

    def create_with_steps(self, template_data: TaskTemplateCreate) -> TaskTemplate:
        """Create template with associated steps (transaction)."""
        with self.get_session() as session:
            # Create template
            template = TaskTemplate(**template_data.dict(exclude={'steps'}))
            session.add(template)
            session.flush()  # Get template_id

            # Create steps
            for step_data in template_data.steps:
                step = TemplateStep(
                    template_id=template.template_id,
                    **step_data.dict()
                )
                session.add(step)

            session.commit()
            session.refresh(template)
            return template
```

---

## 🚀 API Layer

### File: `src/api/routes/task_templates.py`

```python
from fastapi import APIRouter, HTTPException, status
from src.database.models import TaskTemplate, TaskTemplateCreate, TaskTemplateUpdate
from src.repository.task_template_repository import TaskTemplateRepository
from typing import List
from uuid import UUID

router = APIRouter(prefix="/api/v1/task-templates", tags=["templates"])
repo = TaskTemplateRepository()

@router.post("/", response_model=TaskTemplate, status_code=status.HTTP_201_CREATED)
async def create_template(template: TaskTemplateCreate):
    """Create a new task template with steps."""
    return repo.create_with_steps(template)

@router.get("/", response_model=List[TaskTemplate])
async def list_templates(category: Optional[str] = None):
    """List all public templates, optionally filtered by category."""
    if category:
        return repo.get_by_category(category)
    return repo.get_public_templates()

@router.get("/{template_id}", response_model=TaskTemplate)
async def get_template(template_id: UUID):
    """Get a specific template by ID."""
    template = repo.get_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/{template_id}", response_model=TaskTemplate)
async def update_template(template_id: UUID, update_data: TaskTemplateUpdate):
    """Update template metadata (not steps)."""
    template = repo.update(template_id, update_data)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: UUID):
    """Delete a template (cascade deletes steps)."""
    deleted = repo.delete(template_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Template not found")
```

Register in `src/api/main.py`:
```python
from src.api.routes import task_templates
app.include_router(task_templates.router)
```

---

## 🧪 TDD Test Specification

### File: `src/api/tests/test_task_templates.py`

**RED Phase - Write these tests FIRST:**

```python
import pytest
from uuid import uuid4
from src.database.models import TaskTemplateCreate, TemplateStepCreate

@pytest.fixture
def sample_template_data():
    """Fixture for valid template creation data."""
    return TaskTemplateCreate(
        name="Homework Assignment",
        description="Complete a typical homework assignment",
        category="Academic",
        icon="📚",
        estimated_minutes=60,
        created_by="system",
        is_public=True,
        steps=[
            TemplateStepCreate(
                step_order=1,
                description="Research the topic and gather resources",
                short_label="Research",
                estimated_minutes=15,
                leaf_type="DIGITAL",
                icon="🔍"
            ),
            TemplateStepCreate(
                step_order=2,
                description="Write the first draft",
                short_label="Draft",
                estimated_minutes=25,
                leaf_type="HUMAN",
                icon="✍️"
            ),
            TemplateStepCreate(
                step_order=3,
                description="Revise and edit your work",
                short_label="Revise",
                estimated_minutes=15,
                leaf_type="HUMAN",
                icon="📝"
            ),
            TemplateStepCreate(
                step_order=4,
                description="Submit the assignment",
                short_label="Submit",
                estimated_minutes=5,
                leaf_type="DIGITAL",
                icon="📤"
            )
        ]
    )

class TestTaskTemplateAPI:
    """TDD tests for task templates API endpoints."""

    def test_create_template_success(self, test_client, sample_template_data):
        """RED: Test creating a template with steps."""
        response = test_client.post("/api/v1/task-templates/", json=sample_template_data.dict())
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Homework Assignment"
        assert len(data["steps"]) == 4
        assert data["steps"][0]["step_order"] == 1

    def test_create_template_validation_error(self, test_client):
        """RED: Test validation fails with empty steps."""
        invalid_data = {
            "name": "Invalid Template",
            "category": "Academic",
            "steps": []  # Must have at least 1 step
        }
        response = test_client.post("/api/v1/task-templates/", json=invalid_data)
        assert response.status_code == 422

    def test_list_all_public_templates(self, test_client, sample_template_data):
        """RED: Test listing all public templates."""
        # Create a template first
        test_client.post("/api/v1/task-templates/", json=sample_template_data.dict())

        response = test_client.get("/api/v1/task-templates/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(t["is_public"] for t in data)

    def test_list_templates_by_category(self, test_client, sample_template_data):
        """RED: Test filtering templates by category."""
        test_client.post("/api/v1/task-templates/", json=sample_template_data.dict())

        response = test_client.get("/api/v1/task-templates/?category=Academic")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(t["category"] == "Academic" for t in data)

    def test_get_template_by_id(self, test_client, sample_template_data):
        """RED: Test retrieving a specific template."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data.dict())
        template_id = create_response.json()["template_id"]

        response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["template_id"] == template_id
        assert len(data["steps"]) == 4

    def test_get_template_not_found(self, test_client):
        """RED: Test 404 for non-existent template."""
        fake_id = str(uuid4())
        response = test_client.get(f"/api/v1/task-templates/{fake_id}")
        assert response.status_code == 404

    def test_update_template(self, test_client, sample_template_data):
        """RED: Test updating template metadata."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data.dict())
        template_id = create_response.json()["template_id"]

        update_data = {"name": "Updated Homework Template"}
        response = test_client.put(f"/api/v1/task-templates/{template_id}", json=update_data)
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Homework Template"

    def test_delete_template(self, test_client, sample_template_data):
        """RED: Test deleting a template."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data.dict())
        template_id = create_response.json()["template_id"]

        response = test_client.delete(f"/api/v1/task-templates/{template_id}")
        assert response.status_code == 204

        # Verify deletion
        get_response = test_client.get(f"/api/v1/task-templates/{template_id}")
        assert get_response.status_code == 404

    def test_delete_cascades_to_steps(self, test_client, sample_template_data):
        """RED: Test that deleting template deletes associated steps."""
        create_response = test_client.post("/api/v1/task-templates/", json=sample_template_data.dict())
        template_id = create_response.json()["template_id"]

        # Delete template
        test_client.delete(f"/api/v1/task-templates/{template_id}")

        # TODO: Verify steps are deleted (query template_steps table directly)
        # This requires database access in tests
```

**GREEN Phase**: Implement code to pass tests above

**REFACTOR Phase**: Optimize queries, improve error handling

---

## 🌱 Seed Data

### File: `src/database/seed_templates.py`

Create 5 default templates:

```python
from src.database.models import TaskTemplateCreate, TemplateStepCreate
from src.repository.task_template_repository import TaskTemplateRepository

def seed_default_templates():
    """Seed 5 default public templates."""
    repo = TaskTemplateRepository()

    templates = [
        TaskTemplateCreate(
            name="Homework Assignment",
            description="Complete a typical homework assignment",
            category="Academic",
            icon="📚",
            estimated_minutes=60,
            steps=[
                TemplateStepCreate(step_order=1, description="Research topic", short_label="Research", estimated_minutes=15, leaf_type="DIGITAL", icon="🔍"),
                TemplateStepCreate(step_order=2, description="Write first draft", short_label="Draft", estimated_minutes=25, leaf_type="HUMAN", icon="✍️"),
                TemplateStepCreate(step_order=3, description="Revise and edit", short_label="Revise", estimated_minutes=15, leaf_type="HUMAN", icon="📝"),
                TemplateStepCreate(step_order=4, description="Submit assignment", short_label="Submit", estimated_minutes=5, leaf_type="DIGITAL", icon="📤"),
            ]
        ),
        TaskTemplateCreate(
            name="Morning Routine",
            description="Start your day right",
            category="Personal",
            icon="🌅",
            estimated_minutes=30,
            steps=[
                TemplateStepCreate(step_order=1, description="Take a shower", short_label="Shower", estimated_minutes=10, leaf_type="HUMAN", icon="🚿"),
                TemplateStepCreate(step_order=2, description="Eat breakfast", short_label="Breakfast", estimated_minutes=15, leaf_type="HUMAN", icon="🍳"),
                TemplateStepCreate(step_order=3, description="Review daily plan", short_label="Plan", estimated_minutes=5, leaf_type="DIGITAL", icon="📅"),
            ]
        ),
        TaskTemplateCreate(
            name="Email Inbox Zero",
            description="Clear your email inbox",
            category="Work",
            icon="📧",
            estimated_minutes=25,
            steps=[
                TemplateStepCreate(step_order=1, description="Scan all unread emails", short_label="Scan", estimated_minutes=5, leaf_type="DIGITAL", icon="👀"),
                TemplateStepCreate(step_order=2, description="Respond to urgent emails", short_label="Respond", estimated_minutes=10, leaf_type="DIGITAL", icon="✉️"),
                TemplateStepCreate(step_order=3, description="Archive or delete", short_label="Archive", estimated_minutes=10, leaf_type="DIGITAL", icon="🗄️"),
            ]
        ),
        TaskTemplateCreate(
            name="Creative Project Kickoff",
            description="Start a new creative project",
            category="Creative",
            icon="🎨",
            estimated_minutes=45,
            steps=[
                TemplateStepCreate(step_order=1, description="Brainstorm ideas", short_label="Brainstorm", estimated_minutes=15, leaf_type="HUMAN", icon="💡"),
                TemplateStepCreate(step_order=2, description="Create rough outline", short_label="Outline", estimated_minutes=10, leaf_type="HUMAN", icon="📋"),
                TemplateStepCreate(step_order=3, description="Gather materials/resources", short_label="Gather", estimated_minutes=10, leaf_type="DIGITAL", icon="🧰"),
                TemplateStepCreate(step_order=4, description="Create first prototype", short_label="Prototype", estimated_minutes=10, leaf_type="HUMAN", icon="🔧"),
            ]
        ),
        TaskTemplateCreate(
            name="Weekly Review",
            description="Reflect on your week",
            category="Personal",
            icon="📊",
            estimated_minutes=20,
            steps=[
                TemplateStepCreate(step_order=1, description="Collect accomplishments", short_label="Collect", estimated_minutes=5, leaf_type="HUMAN", icon="📝"),
                TemplateStepCreate(step_order=2, description="Reflect on challenges", short_label="Reflect", estimated_minutes=5, leaf_type="HUMAN", icon="💭"),
                TemplateStepCreate(step_order=3, description="Plan next week", short_label="Plan", estimated_minutes=5, leaf_type="DIGITAL", icon="🗓️"),
                TemplateStepCreate(step_order=4, description="Set 3 goals", short_label="Goals", estimated_minutes=5, leaf_type="HUMAN", icon="🎯"),
            ]
        ),
    ]

    for template_data in templates:
        repo.create_with_steps(template_data)

if __name__ == "__main__":
    seed_default_templates()
    print("✅ Seeded 5 default templates")
```

---

## ✅ Completion Checklist

- [ ] Database schema created (`task_templates`, `template_steps`)
- [ ] Migration file created
- [ ] Pydantic models added to `src/database/models.py`
- [ ] Repository created (`TaskTemplateRepository`)
- [ ] API routes created (`/api/v1/task-templates`)
- [ ] All 9 tests written (RED phase)
- [ ] All tests passing (GREEN phase)
- [ ] Code refactored (REFACTOR phase)
- [ ] 95%+ test coverage: `source .venv/bin/activate && python -m pytest src/api/tests/test_task_templates.py --cov=src --cov-report=term-missing`
- [ ] Seed script created and 5 templates seeded
- [ ] Linting passes: `source .venv/bin/activate && ruff check src/ --fix`
- [ ] Type checking passes: `source .venv/bin/activate && mypy src/`

---

## 🔗 Related Documents

- [PRD](../../PRD_ADHD_APP.md) - Task templates reduce creation friction
- [Integration Roadmap](../../roadmap/INTEGRATION_ROADMAP.md) - Week 4 deliverables
- [CLAUDE.md](../../../CLAUDE.md) - TDD workflow, repository pattern

---

**Next Step**: Frontend task FE-04 TaskTemplateLibrary depends on this service
