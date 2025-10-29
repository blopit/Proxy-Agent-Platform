# BE-05: Task Splitting Service (Epic 7 - Adaptive Breakdown)

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 8-10 hours
**Dependencies**: BE-01 (Task Templates), Core task models
**Agent Type**: backend-tdd

---

## 📋 Overview

Implement Epic 7's adaptive task breakdown system that uses AI to intelligently split tasks into 2-5 minute micro-steps based on task complexity, user energy level, and historical patterns.

**Core Functionality**:
- AI-powered task analysis and splitting
- Energy-aware step sizing
- Historical pattern learning
- Dynamic re-breakdown for failed tasks
- Integration with existing micro-step system

---

## 🗄️ Database Schema

### New Tables

```sql
-- Task splitting history and patterns
CREATE TABLE task_splits (
    split_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(task_id) ON DELETE CASCADE,
    split_method VARCHAR(50) NOT NULL,  -- 'ai_auto', 'template', 'manual', 'adaptive'
    original_description TEXT NOT NULL,
    energy_level VARCHAR(20),  -- 'low', 'medium', 'high'
    step_count INT NOT NULL,
    avg_step_minutes DECIMAL(5,2),
    split_at TIMESTAMP DEFAULT NOW(),
    success_rate DECIMAL(3,2),  -- Completion rate of this split
    user_id VARCHAR(255) NOT NULL,
    CONSTRAINT fk_task_splits_task FOREIGN KEY (task_id) REFERENCES tasks(task_id)
);

-- AI splitting patterns learned from user behavior
CREATE TABLE splitting_patterns (
    pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    task_category VARCHAR(100),  -- 'Academic', 'Work', 'Personal', etc.
    task_keywords TEXT[],  -- Common words in successful splits
    optimal_step_count INT,  -- Average ideal number of steps
    optimal_step_duration INT,  -- Average ideal step duration (minutes)
    energy_preference VARCHAR(20),  -- When user prefers this type
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, task_category)
);

-- Step completion feedback for learning
CREATE TABLE step_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES micro_steps(step_id) ON DELETE CASCADE,
    split_id UUID REFERENCES task_splits(split_id) ON DELETE SET NULL,
    too_large BOOLEAN DEFAULT false,
    too_small BOOLEAN DEFAULT false,
    just_right BOOLEAN DEFAULT false,
    actual_duration_minutes INT,
    energy_at_completion VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes

```sql
CREATE INDEX idx_task_splits_user_task ON task_splits(user_id, task_id);
CREATE INDEX idx_task_splits_method ON task_splits(split_method);
CREATE INDEX idx_splitting_patterns_user ON splitting_patterns(user_id);
CREATE INDEX idx_step_feedback_split ON step_feedback(split_id);
```

---

## 🏗️ Pydantic Models

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime
from uuid import UUID, uuid4
from decimal import Decimal

# Request/Response Models
class TaskSplitRequest(BaseModel):
    """Request to split a task into micro-steps."""
    task_id: UUID
    task_description: str = Field(..., min_length=1, max_length=2000)
    current_energy_level: Literal["low", "medium", "high"] = "medium"
    preferred_step_count: Optional[int] = Field(None, ge=2, le=10)
    use_ai: bool = True
    category: Optional[str] = None

    @validator('task_description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError("Task description cannot be empty")
        return v.strip()


class MicroStepSuggestion(BaseModel):
    """AI-generated micro-step suggestion."""
    step_order: int = Field(..., ge=1)
    description: str = Field(..., min_length=1, max_length=500)
    estimated_minutes: int = Field(..., ge=1, le=10)
    leaf_type: Literal["DIGITAL", "HUMAN"] = "HUMAN"
    reasoning: str  # Why AI chose this breakdown
    confidence: Decimal = Field(..., ge=0, le=1, decimal_places=2)


class TaskSplitResponse(BaseModel):
    """Response from task splitting."""
    split_id: UUID
    task_id: UUID
    split_method: str
    suggested_steps: List[MicroStepSuggestion]
    total_estimated_minutes: int
    energy_level: str
    reasoning: str  # Overall strategy explanation
    created_at: datetime


class StepFeedbackCreate(BaseModel):
    """User feedback on step sizing."""
    step_id: UUID
    too_large: bool = False
    too_small: bool = False
    just_right: bool = False
    actual_duration_minutes: Optional[int] = Field(None, ge=1, le=120)
    energy_at_completion: Optional[Literal["low", "medium", "high"]] = None

    @validator('too_large', 'too_small', 'just_right')
    def validate_single_feedback(cls, v, values):
        """Ensure only one feedback option is true."""
        feedback_count = sum([
            values.get('too_large', False),
            values.get('too_small', False),
            v
        ])
        if feedback_count > 1:
            raise ValueError("Only one feedback option can be true")
        return v


class SplittingPattern(BaseModel):
    """Learned pattern for task splitting."""
    pattern_id: UUID = Field(default_factory=uuid4)
    user_id: str
    task_category: Optional[str] = None
    task_keywords: List[str] = []
    optimal_step_count: int = Field(..., ge=2, le=10)
    optimal_step_duration: int = Field(..., ge=1, le=10)
    energy_preference: Literal["low", "medium", "high"] = "medium"
    success_count: int = 0
    failure_count: int = 0
    last_updated: datetime = Field(default_factory=lambda: datetime.now(UTC))

    @property
    def success_rate(self) -> Decimal:
        total = self.success_count + self.failure_count
        if total == 0:
            return Decimal("0.00")
        return Decimal(self.success_count / total).quantize(Decimal("0.01"))

    class Config:
        from_attributes = True
```

---

## 🏛️ Repository Layer

```python
from typing import List, Optional
from uuid import UUID
from datetime import datetime, UTC
from src.repository.base import BaseRepository
from src.database.models import TaskSplit, SplittingPattern, StepFeedback

class TaskSplittingRepository(BaseRepository[TaskSplit]):
    """Repository for task splitting operations."""

    def create_split(
        self,
        task_id: UUID,
        split_method: str,
        original_description: str,
        energy_level: str,
        step_count: int,
        avg_step_minutes: Decimal,
        user_id: str
    ) -> TaskSplit:
        """Create a task split record."""
        split = TaskSplit(
            task_id=task_id,
            split_method=split_method,
            original_description=original_description,
            energy_level=energy_level,
            step_count=step_count,
            avg_step_minutes=avg_step_minutes,
            user_id=user_id,
            split_at=datetime.now(UTC)
        )
        return self.create(split)

    def get_user_splits(
        self,
        user_id: str,
        limit: int = 50
    ) -> List[TaskSplit]:
        """Get recent splits for a user."""
        query = """
            SELECT * FROM task_splits
            WHERE user_id = $1
            ORDER BY split_at DESC
            LIMIT $2
        """
        return self.fetch_all(query, user_id, limit)

    def update_split_success_rate(
        self,
        split_id: UUID,
        success_rate: Decimal
    ) -> None:
        """Update success rate after task completion."""
        query = """
            UPDATE task_splits
            SET success_rate = $1
            WHERE split_id = $2
        """
        self.execute(query, success_rate, split_id)

    def get_pattern_for_user(
        self,
        user_id: str,
        task_category: Optional[str] = None
    ) -> Optional[SplittingPattern]:
        """Get learned pattern for user and category."""
        if task_category:
            query = """
                SELECT * FROM splitting_patterns
                WHERE user_id = $1 AND task_category = $2
            """
            return self.fetch_one(query, user_id, task_category)
        else:
            query = """
                SELECT * FROM splitting_patterns
                WHERE user_id = $1
                ORDER BY success_count DESC
                LIMIT 1
            """
            return self.fetch_one(query, user_id)

    def upsert_pattern(
        self,
        user_id: str,
        task_category: str,
        optimal_step_count: int,
        optimal_step_duration: int,
        energy_preference: str,
        task_keywords: List[str]
    ) -> SplittingPattern:
        """Create or update splitting pattern."""
        query = """
            INSERT INTO splitting_patterns (
                user_id, task_category, task_keywords,
                optimal_step_count, optimal_step_duration,
                energy_preference, success_count, last_updated
            ) VALUES ($1, $2, $3, $4, $5, $6, 1, NOW())
            ON CONFLICT (user_id, task_category)
            DO UPDATE SET
                optimal_step_count = $4,
                optimal_step_duration = $5,
                energy_preference = $6,
                task_keywords = $3,
                success_count = splitting_patterns.success_count + 1,
                last_updated = NOW()
            RETURNING *
        """
        return self.fetch_one(
            query, user_id, task_category, task_keywords,
            optimal_step_count, optimal_step_duration, energy_preference
        )

    def create_step_feedback(
        self,
        step_id: UUID,
        split_id: Optional[UUID],
        feedback: StepFeedbackCreate
    ) -> StepFeedback:
        """Record user feedback on step sizing."""
        record = StepFeedback(
            step_id=step_id,
            split_id=split_id,
            too_large=feedback.too_large,
            too_small=feedback.too_small,
            just_right=feedback.just_right,
            actual_duration_minutes=feedback.actual_duration_minutes,
            energy_at_completion=feedback.energy_at_completion,
            created_at=datetime.now(UTC)
        )
        return self.create(record)
```

---

## 🤖 AI Integration (PydanticAI)

```python
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from typing import List

# AI Agent for task splitting
task_splitter_agent = Agent(
    model=OpenAIModel("gpt-4"),
    system_prompt="""
    You are an expert at breaking down tasks into micro-steps optimized for ADHD brains.

    Guidelines:
    - Each step should be 2-5 minutes
    - Steps should be concrete and actionable
    - Use dopamine-friendly verbs (discover, create, complete)
    - Match step complexity to user's current energy level
    - Low energy: Very simple, physical steps
    - Medium energy: Balanced cognitive load
    - High energy: Complex, creative work

    Return a list of 3-7 micro-steps with reasoning.
    """,
    result_type=List[MicroStepSuggestion]
)

async def ai_split_task(
    task_description: str,
    energy_level: str,
    category: Optional[str],
    learned_pattern: Optional[SplittingPattern]
) -> List[MicroStepSuggestion]:
    """Use AI to intelligently split a task."""

    # Build context from learned patterns
    context = f"Task: {task_description}\n"
    context += f"User energy: {energy_level}\n"

    if category:
        context += f"Category: {category}\n"

    if learned_pattern:
        context += f"User typically prefers {learned_pattern.optimal_step_count} steps "
        context += f"of {learned_pattern.optimal_step_duration} minutes each.\n"
        context += f"Keywords that worked: {', '.join(learned_pattern.task_keywords[:5])}\n"

    result = await task_splitter_agent.run(context)
    return result.data
```

---

## 🌐 API Routes

```python
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from uuid import UUID

router = APIRouter(prefix="/api/v1/task-splitting", tags=["task-splitting"])

@router.post("/split", response_model=TaskSplitResponse, status_code=status.HTTP_201_CREATED)
async def split_task(
    request: TaskSplitRequest,
    repo: TaskSplittingRepository = Depends()
) -> TaskSplitResponse:
    """
    Split a task into micro-steps using AI or patterns.

    - Uses learned patterns if available
    - Falls back to AI generation
    - Adapts to current energy level
    """
    user_id = "user-123"  # TODO: Get from auth

    # Get learned pattern
    pattern = repo.get_pattern_for_user(user_id, request.category)

    # AI-powered splitting
    if request.use_ai:
        steps = await ai_split_task(
            request.task_description,
            request.current_energy_level,
            request.category,
            pattern
        )
    else:
        # Use pattern-based splitting
        if not pattern:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No learned pattern available. Try AI splitting first."
            )
        steps = pattern_based_split(request, pattern)

    # Calculate metrics
    total_minutes = sum(step.estimated_minutes for step in steps)
    avg_minutes = Decimal(total_minutes / len(steps))

    # Save split record
    split = repo.create_split(
        task_id=request.task_id,
        split_method="ai_auto" if request.use_ai else "pattern",
        original_description=request.task_description,
        energy_level=request.current_energy_level,
        step_count=len(steps),
        avg_step_minutes=avg_minutes,
        user_id=user_id
    )

    return TaskSplitResponse(
        split_id=split.split_id,
        task_id=request.task_id,
        split_method=split.split_method,
        suggested_steps=steps,
        total_estimated_minutes=total_minutes,
        energy_level=request.current_energy_level,
        reasoning="AI-generated breakdown optimized for your energy level",
        created_at=split.split_at
    )


@router.post("/feedback", status_code=status.HTTP_201_CREATED)
async def submit_step_feedback(
    feedback: StepFeedbackCreate,
    repo: TaskSplittingRepository = Depends()
):
    """Submit feedback on step sizing to improve future splits."""

    # Get split_id from step
    step = repo.get_step(feedback.step_id)
    split_id = step.split_id if hasattr(step, 'split_id') else None

    # Save feedback
    repo.create_step_feedback(feedback.step_id, split_id, feedback)

    # Update pattern if feedback indicates success
    if feedback.just_right and split_id:
        # Learn from this successful split
        # TODO: Extract keywords and update pattern
        pass

    return {"message": "Feedback recorded"}


@router.get("/patterns/{user_id}", response_model=List[SplittingPattern])
async def get_user_patterns(
    user_id: str,
    repo: TaskSplittingRepository = Depends()
) -> List[SplittingPattern]:
    """Get learned splitting patterns for a user."""
    query = "SELECT * FROM splitting_patterns WHERE user_id = $1"
    patterns = repo.fetch_all(query, user_id)
    return patterns
```

---

## 🧪 TDD Test Specifications

### RED Phase - Write These Tests First

```python
import pytest
from uuid import uuid4
from decimal import Decimal

class TestTaskSplittingService:
    """Test suite for Epic 7 task splitting."""

    def test_ai_split_creates_valid_steps(self, test_client):
        """RED: AI should generate 3-7 steps of 2-5 minutes each."""
        request = {
            "task_id": str(uuid4()),
            "task_description": "Write a research paper on climate change",
            "current_energy_level": "medium",
            "use_ai": True,
            "category": "Academic"
        }

        response = test_client.post("/api/v1/task-splitting/split", json=request)

        assert response.status_code == 201
        data = response.json()
        assert 3 <= len(data["suggested_steps"]) <= 7
        for step in data["suggested_steps"]:
            assert 1 <= step["estimated_minutes"] <= 10
            assert step["description"]
            assert step["confidence"] >= 0.5

    def test_low_energy_creates_simpler_steps(self, test_client):
        """RED: Low energy should produce more, simpler steps."""
        request = {
            "task_id": str(uuid4()),
            "task_description": "Organize desk",
            "current_energy_level": "low",
            "use_ai": True
        }

        response = test_client.post("/api/v1/task-splitting/split", json=request)
        data = response.json()

        # Low energy should have more steps (smaller chunks)
        assert len(data["suggested_steps"]) >= 5
        # Average step duration should be lower
        avg_duration = data["total_estimated_minutes"] / len(data["suggested_steps"])
        assert avg_duration <= 3

    def test_pattern_based_split_uses_history(self, repo):
        """RED: Should use learned patterns when available."""
        user_id = "user-123"

        # Create learned pattern
        pattern = repo.upsert_pattern(
            user_id=user_id,
            task_category="Academic",
            optimal_step_count=5,
            optimal_step_duration=4,
            energy_preference="medium",
            task_keywords=["research", "write", "outline"]
        )

        # Split task with pattern
        request = {
            "task_id": str(uuid4()),
            "task_description": "Research and write essay",
            "current_energy_level": "medium",
            "use_ai": False,
            "category": "Academic"
        }

        response = test_client.post("/api/v1/task-splitting/split", json=request)
        data = response.json()

        # Should match learned pattern
        assert len(data["suggested_steps"]) == 5
        assert data["split_method"] == "pattern"

    def test_feedback_updates_pattern(self, repo):
        """RED: Positive feedback should strengthen pattern."""
        split_id = uuid4()
        step_id = uuid4()

        feedback = {
            "step_id": str(step_id),
            "too_large": False,
            "too_small": False,
            "just_right": True,
            "actual_duration_minutes": 4,
            "energy_at_completion": "medium"
        }

        test_client.post("/api/v1/task-splitting/feedback", json=feedback)

        # Pattern success count should increase
        # (Implementation will vary based on how you link steps to patterns)

    def test_split_respects_preferred_count(self, test_client):
        """RED: Should respect user's preferred step count."""
        request = {
            "task_id": str(uuid4()),
            "task_description": "Clean room",
            "current_energy_level": "high",
            "preferred_step_count": 3,
            "use_ai": True
        }

        response = test_client.post("/api/v1/task-splitting/split", json=request)
        data = response.json()

        # Should be close to preferred count (±1)
        assert abs(len(data["suggested_steps"]) - 3) <= 1

    def test_invalid_task_description_rejected(self, test_client):
        """RED: Empty descriptions should be rejected."""
        request = {
            "task_id": str(uuid4()),
            "task_description": "   ",
            "current_energy_level": "medium"
        }

        response = test_client.post("/api/v1/task-splitting/split", json=request)
        assert response.status_code == 422

    def test_get_user_patterns_success(self, test_client, repo):
        """RED: Should retrieve all patterns for user."""
        user_id = "user-123"

        # Create multiple patterns
        repo.upsert_pattern(user_id, "Work", 4, 5, "high", ["code", "debug"])
        repo.upsert_pattern(user_id, "Personal", 6, 3, "low", ["clean", "organize"])

        response = test_client.get(f"/api/v1/task-splitting/patterns/{user_id}")

        assert response.status_code == 200
        patterns = response.json()
        assert len(patterns) >= 2
```

---

## ✅ Acceptance Criteria

- [ ] AI can split tasks into 3-7 micro-steps
- [ ] Steps are sized appropriately for energy level (low=simpler, high=complex)
- [ ] Learned patterns are created from successful completions
- [ ] Pattern-based splitting works without AI
- [ ] User feedback is recorded and influences future splits
- [ ] All database migrations run successfully
- [ ] 95%+ test coverage
- [ ] API endpoints documented with examples
- [ ] Integration with existing task/micro-step models

---

## 🎯 Success Metrics

- **AI Accuracy**: 80%+ of splits rated "just right" by users
- **Pattern Learning**: Patterns improve success rate by 15%+ after 10 uses
- **Performance**: Split generation completes in <2 seconds
- **Adoption**: 60%+ of tasks use AI splitting within first week

---

## 📚 Additional Context

**Related Files**:
- `src/database/models.py` - Existing Task and MicroStep models
- `docs/tasks/backend/01_task_templates_service.md` - Template-based approach
- `docs/EPIC_7_DOPAMINE_MICRO_STEPS.md` - Design philosophy

**Epic 7 Goals**:
- Transform "write essay" → 7 concrete 3-min steps
- Energy-aware sizing (low energy = simpler steps)
- Learn from user patterns over time
- Reduce cognitive load of planning
