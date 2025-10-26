# Backend Refactoring Plan
**Comprehensive strategy to modernize the Proxy Agent Platform backend**

**Version**: 1.0
**Date**: 2025-10-25
**Status**: READY FOR EXECUTION
**Estimated Timeline**: 6-8 weeks (3 engineers) or 12-16 weeks (1 engineer)

---

## Executive Summary

### Current State Assessment

| Category | Grade | Status | Critical Issues |
|----------|-------|--------|-----------------|
| **Domain Modeling** | A | ✅ Excellent | None - keep as-is |
| **Architecture** | D | 🔴 Critical | No DI, tight coupling, monolithic files |
| **Database** | D | 🔴 Critical | SQLite only, SQL migrations not integrated |
| **Testing** | D | 🔴 Critical | Hard to test, low coverage |
| **API Design** | C | 🟡 Needs Work | 3 overlapping APIs, weak schemas |
| **Production Ready** | F | 🔴 Blocker | Not deployable to production |

### Refactoring Goals

1. **Zero Feature Loss** - All functionality preserved
2. **Backward Compatible APIs** - No breaking changes during migration
3. **Progressive Enhancement** - Each sprint delivers value independently
4. **Test Coverage ≥80%** - Quality gates at every phase
5. **Production Ready** - Deployable after Phase 3

### Success Metrics

- ✅ Single consolidated Task API (from 3)
- ✅ PostgreSQL support with connection pooling
- ✅ Proper Alembic migrations integrated
- ✅ Dependency Injection throughout
- ✅ 80%+ test coverage
- ✅ API response schemas ≥90% complete
- ✅ Files ≤500 lines (current max: 1264)
- ✅ Zero TODO/FIXME in core paths (current: 34)

---

## Phase 1: Foundation (Weeks 1-3)

**Goal**: Fix critical infrastructure blockers without breaking existing functionality

### Sprint 1.1: Database Layer Modernization (Week 1)

#### Objectives
- Integrate existing SQL migrations with Alembic
- Add PostgreSQL support alongside SQLite
- Implement proper connection pooling

#### Tasks

**1.1.1 Initialize Alembic** (2 hours)
```bash
# Setup Alembic structure
uv run alembic init alembic

# Move existing SQL migrations into Alembic
mkdir -p alembic/versions
```

**File**: `alembic/env.py`
```python
"""Alembic environment configuration"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from src.database.models import Base  # Will create in 1.1.3

# Import all models to ensure metadata is complete
from src.database.models import (
    User, Project, Task, MicroStep, FocusSession,
    Achievement, UserAchievement, Goal, Habit,
    CompassZone, MorningRitual, EnergySnapshot
)

config = context.config
target_metadata = Base.metadata

def run_migrations_online():
    """Run migrations in 'online' mode with connection pooling"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()
```

**1.1.2 Convert Existing SQL Migrations** (4 hours)
```bash
# Create baseline migration from existing schema
uv run alembic revision --autogenerate -m "baseline_from_existing_schema"
```

**File**: `alembic/versions/001_baseline.py`
```python
"""Baseline migration from existing schema

Revision ID: 001_baseline
Created: 2025-10-25
"""
from alembic import op
import sqlalchemy as sa

revision = '001_baseline'
down_revision = None

def upgrade():
    """Import existing schema from enhanced_adapter.py"""
    # Read and execute all CREATE TABLE statements
    # from migrations/001-022
    with open('src/database/migrations/baseline.sql', 'r') as f:
        sql = f.read()
        for statement in sql.split(';'):
            if statement.strip():
                op.execute(statement)

def downgrade():
    """Drop all tables"""
    op.execute("DROP TABLE IF EXISTS energy_snapshots CASCADE")
    op.execute("DROP TABLE IF EXISTS morning_rituals CASCADE")
    # ... all tables in reverse dependency order
```

**1.1.3 Create SQLAlchemy ORM Models** (6 hours)
```python
"""SQLAlchemy ORM models matching existing schema"""
# File: src/database/models.py

from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer,
    String, Text, Numeric, CheckConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from typing import Optional

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String)
    full_name = Column(String)
    timezone = Column(String, default="UTC")
    avatar_url = Column(String)
    bio = Column(Text)
    preferences = Column(Text, default="{}")  # JSON stored as text
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="assignee")
    compass_zones = relationship("CompassZone", back_populates="user", cascade="all, delete-orphan")
    morning_rituals = relationship("MorningRitual", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    owner_id = Column(String, ForeignKey("users.user_id", ondelete="CASCADE"), index=True)
    team_members = Column(Text, default="[]")  # JSON array
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    settings = Column(Text, default="{}")
    metadata = Column(Text, default="{}")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    owner = relationship("User", back_populates="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    task_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    project_id = Column(String, ForeignKey("projects.project_id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(String, ForeignKey("tasks.task_id", ondelete="CASCADE"), index=True)
    capture_type = Column(String, default="task")
    status = Column(String, default="todo", index=True)
    priority = Column(String, default="medium", index=True)
    estimated_hours = Column(Numeric(10, 2))
    actual_hours = Column(Numeric(10, 2), default=0.0)
    tags = Column(Text, default="[]")
    assignee_id = Column(String, ForeignKey("users.user_id", ondelete="SET NULL"))
    due_date = Column(DateTime(timezone=True), index=True)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    metadata = Column(Text, default="{}")

    # Epic 7 fields
    scope = Column(String, default="simple")
    delegation_mode = Column(String, default="do")
    is_micro_step = Column(Boolean, default=False)
    micro_steps = Column(Text, default="[]")
    level = Column(Integer, default=0)
    custom_emoji = Column(String)
    decomposition_state = Column(String, default="stub")
    children_ids = Column(Text, default="[]")
    total_minutes = Column(Integer, default=0)
    is_leaf = Column(Boolean, default=False)
    leaf_type = Column(String)
    zone_id = Column(String, ForeignKey("compass_zones.zone_id"), index=True)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")
    parent = relationship("Task", remote_side=[task_id], backref="children")
    micro_step_records = relationship("MicroStep", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    zone = relationship("CompassZone", back_populates="tasks")

# ... Continue for all 15+ models
# MicroStep, TaskTemplate, TaskDependency, TaskComment,
# FocusSession, Achievement, UserAchievement, Goal, Habit,
# CompassZone, MorningRitual, EnergySnapshot, ProductivityMetric
```

**1.1.4 Add PostgreSQL Support** (4 hours)
```python
# File: src/database/connection.py

"""Database connection management with PostgreSQL and SQLite support"""
import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool, QueuePool

from src.core.config import get_settings

settings = get_settings()

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./proxy_agents_enhanced.db")

# Choose engine based on database type
if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL: Use connection pooling
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connections before using
        echo=settings.debug,
    )
elif DATABASE_URL.startswith("sqlite"):
    # SQLite: No pooling, enable WAL mode
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        connect_args={"check_same_thread": False},
        echo=settings.debug,
    )
else:
    raise ValueError(f"Unsupported database URL: {DATABASE_URL}")

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    Dependency injection for database session

    Usage in FastAPI:
        @app.get("/tasks")
        def get_tasks(db: Session = Depends(get_db)):
            return db.query(Task).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    """Initialize database (create tables if not exist)"""
    from src.database.models import Base
    Base.metadata.create_all(bind=engine)
```

**1.1.5 Update Environment Configuration** (1 hour)
```env
# .env.example
# Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/proxy_agents
# Or for SQLite (default):
# DATABASE_URL=sqlite:///./proxy_agents_enhanced.db

# Database Pool Settings (PostgreSQL only)
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30
```

**Acceptance Criteria**:
- ✅ `alembic upgrade head` runs successfully
- ✅ All 22 existing migrations converted to Alembic
- ✅ PostgreSQL connection works with pooling
- ✅ SQLite still works (backward compatible)
- ✅ SQLAlchemy models match existing schema 100%
- ✅ Tests pass with both databases

**Deliverables**:
- `alembic/` directory with migrations
- `src/database/models.py` with ORM models
- `src/database/connection.py` with session management
- Updated `.env.example` with database configs

---

### Sprint 1.2: Dependency Injection (Week 2)

#### Objectives
- Implement FastAPI dependency injection pattern
- Make services testable with mocks
- Decouple repositories from services

#### Tasks

**1.2.1 Create Repository Interfaces** (3 hours)
```python
# File: src/repositories/interfaces.py

"""Repository interface definitions for dependency injection"""
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List
from sqlalchemy.orm import Session

from src.core.task_models import Task, Project, User

T = TypeVar('T')

class BaseRepositoryInterface(ABC, Generic[T]):
    """Base repository interface"""

    @abstractmethod
    def get_by_id(self, entity_id: str) -> Optional[T]:
        """Get entity by ID"""
        pass

    @abstractmethod
    def create(self, entity: T) -> T:
        """Create new entity"""
        pass

    @abstractmethod
    def update(self, entity_id: str, updates: dict) -> Optional[T]:
        """Update entity"""
        pass

    @abstractmethod
    def delete(self, entity_id: str) -> bool:
        """Delete entity"""
        pass

    @abstractmethod
    def list_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """List all entities with pagination"""
        pass

class TaskRepositoryInterface(BaseRepositoryInterface[Task]):
    """Task-specific repository interface"""

    @abstractmethod
    def get_by_project(self, project_id: str) -> List[Task]:
        """Get tasks by project"""
        pass

    @abstractmethod
    def get_by_status(self, status: str) -> List[Task]:
        """Get tasks by status"""
        pass

    @abstractmethod
    def search(self, query: str) -> List[Task]:
        """Search tasks by query"""
        pass

class ProjectRepositoryInterface(BaseRepositoryInterface[Project]):
    """Project-specific repository interface"""

    @abstractmethod
    def get_by_owner(self, owner_id: str) -> List[Project]:
        """Get projects by owner"""
        pass
```

**1.2.2 Refactor Repositories to Use SQLAlchemy** (8 hours)
```python
# File: src/repositories/task_repository_v2.py

"""SQLAlchemy-based Task Repository with proper DI"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from src.database.models import Task as TaskModel
from src.core.task_models import Task, TaskStatus, TaskPriority
from src.repositories.interfaces import TaskRepositoryInterface

class TaskRepository(TaskRepositoryInterface):
    """SQLAlchemy implementation of TaskRepository"""

    def __init__(self, db: Session):
        """
        Initialize with database session

        Args:
            db: SQLAlchemy session (injected by FastAPI)
        """
        self.db = db

    def get_by_id(self, task_id: str) -> Optional[Task]:
        """Get task by ID"""
        task_model = self.db.query(TaskModel).filter(TaskModel.task_id == task_id).first()
        return self._to_domain(task_model) if task_model else None

    def create(self, task: Task) -> Task:
        """Create new task"""
        task_model = self._to_model(task)
        self.db.add(task_model)
        self.db.commit()
        self.db.refresh(task_model)
        return self._to_domain(task_model)

    def update(self, task_id: str, updates: dict) -> Optional[Task]:
        """Update task"""
        task_model = self.db.query(TaskModel).filter(TaskModel.task_id == task_id).first()
        if not task_model:
            return None

        for key, value in updates.items():
            setattr(task_model, key, value)

        self.db.commit()
        self.db.refresh(task_model)
        return self._to_domain(task_model)

    def delete(self, task_id: str) -> bool:
        """Delete task"""
        result = self.db.query(TaskModel).filter(TaskModel.task_id == task_id).delete()
        self.db.commit()
        return result > 0

    def list_all(self, skip: int = 0, limit: int = 100) -> List[Task]:
        """List all tasks with pagination"""
        tasks = self.db.query(TaskModel).offset(skip).limit(limit).all()
        return [self._to_domain(t) for t in tasks]

    def get_by_project(self, project_id: str) -> List[Task]:
        """Get tasks by project"""
        tasks = self.db.query(TaskModel).filter(TaskModel.project_id == project_id).all()
        return [self._to_domain(t) for t in tasks]

    def get_by_status(self, status: str) -> List[Task]:
        """Get tasks by status"""
        tasks = self.db.query(TaskModel).filter(TaskModel.status == status).all()
        return [self._to_domain(t) for t in tasks]

    def search(self, query: str) -> List[Task]:
        """Search tasks by query"""
        tasks = self.db.query(TaskModel).filter(
            or_(
                TaskModel.title.ilike(f"%{query}%"),
                TaskModel.description.ilike(f"%{query}%")
            )
        ).all()
        return [self._to_domain(t) for t in tasks]

    @staticmethod
    def _to_domain(task_model: TaskModel) -> Task:
        """Convert SQLAlchemy model to Pydantic domain model"""
        return Task(
            task_id=task_model.task_id,
            title=task_model.title,
            description=task_model.description,
            project_id=task_model.project_id,
            parent_id=task_model.parent_id,
            status=TaskStatus(task_model.status),
            priority=TaskPriority(task_model.priority),
            # ... map all fields
        )

    @staticmethod
    def _to_model(task: Task) -> TaskModel:
        """Convert Pydantic domain model to SQLAlchemy model"""
        return TaskModel(
            task_id=task.task_id,
            title=task.title,
            description=task.description,
            project_id=task.project_id,
            # ... map all fields
        )
```

**1.2.3 Create Dependency Providers** (2 hours)
```python
# File: src/api/dependencies.py

"""FastAPI dependency providers for DI"""
from typing import Annotated
from fastapi import Depends
from sqlalchemy.orm import Session

from src.database.connection import get_db
from src.repositories.task_repository_v2 import TaskRepository
from src.repositories.project_repository_v2 import ProjectRepository
from src.services.task_service_v2 import TaskService

# Database session dependency
DBSession = Annotated[Session, Depends(get_db)]

# Repository dependencies
def get_task_repository(db: DBSession) -> TaskRepository:
    """Get TaskRepository instance"""
    return TaskRepository(db)

def get_project_repository(db: DBSession) -> ProjectRepository:
    """Get ProjectRepository instance"""
    return ProjectRepository(db)

# Service dependencies
def get_task_service(
    task_repo: Annotated[TaskRepository, Depends(get_task_repository)],
    project_repo: Annotated[ProjectRepository, Depends(get_project_repository)]
) -> TaskService:
    """Get TaskService instance with injected dependencies"""
    return TaskService(task_repo, project_repo)

# Type aliases for cleaner API signatures
TaskRepo = Annotated[TaskRepository, Depends(get_task_repository)]
ProjectRepo = Annotated[ProjectRepository, Depends(get_project_repository)]
TaskSvc = Annotated[TaskService, Depends(get_task_service)]
```

**1.2.4 Refactor Services to Accept Injected Dependencies** (6 hours)
```python
# File: src/services/task_service_v2.py

"""Task Service with proper dependency injection"""
from typing import List, Optional
from datetime import datetime

from src.core.task_models import Task, TaskStatus, TaskPriority
from src.repositories.interfaces import TaskRepositoryInterface, ProjectRepositoryInterface

class TaskServiceError(Exception):
    """Task service domain exception"""
    pass

class TaskNotFoundError(TaskServiceError):
    """Task not found"""
    pass

class ProjectNotFoundError(TaskServiceError):
    """Project not found"""
    pass

class TaskService:
    """Task management business logic"""

    def __init__(
        self,
        task_repo: TaskRepositoryInterface,
        project_repo: ProjectRepositoryInterface
    ):
        """
        Initialize with injected repositories

        Args:
            task_repo: Task repository implementation
            project_repo: Project repository implementation
        """
        self.task_repo = task_repo
        self.project_repo = project_repo

    def create_task(
        self,
        title: str,
        description: str,
        project_id: str,
        priority: TaskPriority = TaskPriority.MEDIUM,
        assignee_id: Optional[str] = None
    ) -> Task:
        """
        Create a new task

        Args:
            title: Task title
            description: Task description
            project_id: Parent project ID
            priority: Task priority
            assignee_id: Optional assignee user ID

        Returns:
            Created task

        Raises:
            ProjectNotFoundError: If project doesn't exist
        """
        # Validate project exists
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise ProjectNotFoundError(f"Project {project_id} not found")

        # Create task
        task = Task(
            title=title,
            description=description,
            project_id=project_id,
            priority=priority,
            assignee_id=assignee_id,
            status=TaskStatus.TODO,
            created_at=datetime.utcnow()
        )

        return self.task_repo.create(task)

    def get_task(self, task_id: str) -> Task:
        """
        Get task by ID

        Args:
            task_id: Task ID

        Returns:
            Task

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError(f"Task {task_id} not found")
        return task

    def update_task_status(self, task_id: str, new_status: TaskStatus) -> Task:
        """Update task status"""
        task = self.get_task(task_id)

        updates = {"status": new_status.value}

        if new_status == TaskStatus.COMPLETED:
            updates["completed_at"] = datetime.utcnow()
        elif new_status == TaskStatus.IN_PROGRESS:
            if not task.started_at:
                updates["started_at"] = datetime.utcnow()

        updated_task = self.task_repo.update(task_id, updates)
        if not updated_task:
            raise TaskNotFoundError(f"Task {task_id} not found")

        return updated_task

    # ... More business logic methods
```

**Acceptance Criteria**:
- ✅ All services accept dependencies via constructor
- ✅ FastAPI routes use `Depends()` for DI
- ✅ Mock repositories can be injected for testing
- ✅ No hard-coded database paths in services
- ✅ Type hints on all injected dependencies

**Deliverables**:
- `src/repositories/interfaces.py`
- `src/repositories/*_repository_v2.py`
- `src/services/*_service_v2.py`
- `src/api/dependencies.py`

---

### Sprint 1.3: API Consolidation (Week 3)

#### Objectives
- Merge 3 task APIs into one
- Organize routes by domain
- Add proper response schemas

#### Tasks

**1.3.1 Create routes/ Directory Structure** (1 hour)
```
src/api/
├── __init__.py
├── main.py
└── routes/
    ├── __init__.py
    ├── tasks.py          # Consolidated from 3 files
    ├── projects.py
    ├── users.py
    ├── focus.py
    ├── gamification.py
    ├── secretary.py
    ├── compass.py
    └── websocket.py
```

**1.3.2 Consolidate Task APIs** (8 hours)
```python
# File: src/api/routes/tasks.py

"""
Consolidated Task API
Combines: tasks.py, simple_tasks.py, basic_tasks.py
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field

from src.api.dependencies import TaskSvc, DBSession
from src.core.task_models import Task, TaskStatus, TaskPriority, TaskScope
from src.services.task_service_v2 import TaskNotFoundError, ProjectNotFoundError

router = APIRouter(prefix="/tasks", tags=["Tasks"])

# ============================================================================
# Request/Response Schemas
# ============================================================================

class TaskCreateRequest(BaseModel):
    """Request schema for creating tasks"""
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field(..., min_length=1)
    project_id: str
    parent_id: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    scope: TaskScope = TaskScope.SIMPLE
    assignee_id: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    estimated_hours: Optional[float] = Field(None, ge=0, le=1000)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Implement user authentication",
                "description": "Add JWT-based authentication to API",
                "project_id": "proj_123",
                "priority": "high",
                "scope": "standard",
                "estimated_hours": 8.0
            }
        }

class TaskUpdateRequest(BaseModel):
    """Request schema for updating tasks"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[str] = None
    tags: Optional[List[str]] = None
    estimated_hours: Optional[float] = Field(None, ge=0, le=1000)

class TaskResponse(BaseModel):
    """Response schema for task operations"""
    task_id: str
    title: str
    description: str
    project_id: str
    parent_id: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    scope: TaskScope
    estimated_hours: Optional[float]
    actual_hours: float
    tags: List[str]
    assignee_id: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    """Paginated task list response"""
    tasks: List[TaskResponse]
    total: int
    page: int
    page_size: int
    has_more: bool

class ErrorResponse(BaseModel):
    """Error response schema"""
    error: str
    detail: str
    status_code: int

# ============================================================================
# API Endpoints
# ============================================================================

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    responses={
        201: {"description": "Task created successfully"},
        404: {"model": ErrorResponse, "description": "Project not found"},
        422: {"model": ErrorResponse, "description": "Validation error"}
    }
)
async def create_task(
    request: TaskCreateRequest,
    service: TaskSvc
) -> TaskResponse:
    """
    Create a new task in a project.

    - **title**: Task title (1-500 characters)
    - **description**: Detailed task description
    - **project_id**: Parent project ID
    - **priority**: Task priority (low, medium, high, urgent)
    - **scope**: Task scope (simple, basic, standard)
    """
    try:
        task = service.create_task(
            title=request.title,
            description=request.description,
            project_id=request.project_id,
            priority=request.priority,
            assignee_id=request.assignee_id
        )
        return TaskResponse.model_validate(task)
    except ProjectNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task by ID",
    responses={
        200: {"description": "Task retrieved successfully"},
        404: {"model": ErrorResponse, "description": "Task not found"}
    }
)
async def get_task(
    task_id: str,
    service: TaskSvc
) -> TaskResponse:
    """Get a specific task by ID"""
    try:
        task = service.get_task(task_id)
        return TaskResponse.model_validate(task)
    except TaskNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update task",
    responses={
        200: {"description": "Task updated successfully"},
        404: {"model": ErrorResponse, "description": "Task not found"}
    }
)
async def update_task(
    task_id: str,
    request: TaskUpdateRequest,
    service: TaskSvc
) -> TaskResponse:
    """Update task fields"""
    try:
        updates = request.model_dump(exclude_unset=True)
        task = service.update_task(task_id, updates)
        return TaskResponse.model_validate(task)
    except TaskNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    responses={
        204: {"description": "Task deleted successfully"},
        404: {"model": ErrorResponse, "description": "Task not found"}
    }
)
async def delete_task(
    task_id: str,
    service: TaskSvc
) -> None:
    """Delete a task"""
    try:
        service.delete_task(task_id)
    except TaskNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get(
    "/",
    response_model=TaskListResponse,
    summary="List tasks with filters"
)
async def list_tasks(
    project_id: Optional[str] = Query(None, description="Filter by project"),
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    priority: Optional[TaskPriority] = Query(None, description="Filter by priority"),
    assignee_id: Optional[str] = Query(None, description="Filter by assignee"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    service: TaskSvc
) -> TaskListResponse:
    """
    List tasks with optional filters and pagination.

    Supports filtering by project, status, priority, and assignee.
    """
    tasks, total = service.list_tasks(
        project_id=project_id,
        status=status,
        priority=priority,
        assignee_id=assignee_id,
        skip=(page - 1) * page_size,
        limit=page_size
    )

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=total,
        page=page,
        page_size=page_size,
        has_more=(page * page_size) < total
    )

# ============================================================================
# Simple Task API (Backward Compatibility)
# ============================================================================

@router.post(
    "/simple",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create simple task (legacy endpoint)",
    deprecated=True
)
async def create_simple_task(
    title: str,
    description: str,
    project_id: str,
    service: TaskSvc
) -> TaskResponse:
    """
    Legacy endpoint for simple task creation.

    **DEPRECATED**: Use POST /tasks with scope=simple instead
    """
    task = service.create_task(
        title=title,
        description=description,
        project_id=project_id,
        priority=TaskPriority.MEDIUM
    )
    return TaskResponse.model_validate(task)
```

**1.3.3 Update main.py to Use New Routes** (2 hours)
```python
# File: src/api/main.py

"""FastAPI application with organized routes"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import (
    tasks,
    projects,
    users,
    focus,
    gamification,
    secretary,
    compass,
    websocket
)
from src.database.connection import init_db

app = FastAPI(
    title="Proxy Agent Platform API",
    version="1.0.0",
    description="AI-powered productivity platform with agent orchestration"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers
app.include_router(tasks.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(focus.router, prefix="/api/v1")
app.include_router(gamification.router, prefix="/api/v1")
app.include_router(secretary.router, prefix="/api/v1")
app.include_router(compass.router, prefix="/api/v1")
app.include_router(websocket.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}
```

**1.3.4 Deprecation Strategy for Old Endpoints** (2 hours)
```python
# File: src/api/legacy.py

"""
Legacy API endpoints for backward compatibility
These will be removed in v2.0.0
"""
from fastapi import APIRouter, status
import warnings

router = APIRouter(prefix="/api/v1/legacy", tags=["Legacy (Deprecated)"])

@router.get("/simple-tasks/{task_id}", deprecated=True)
async def get_simple_task_legacy(task_id: str):
    """
    DEPRECATED: Use GET /api/v1/tasks/{task_id} instead

    This endpoint will be removed in v2.0.0 (June 2025)
    """
    warnings.warn(
        "simple-tasks endpoint is deprecated, use /tasks",
        DeprecationWarning
    )
    # Redirect to new endpoint
    from src.api.routes.tasks import get_task
    return await get_task(task_id)
```

**Acceptance Criteria**:
- ✅ Single `/api/v1/tasks` endpoint replaces 3 APIs
- ✅ All endpoints have proper response schemas
- ✅ Request validation with Pydantic
- ✅ Error responses structured and typed
- ✅ Backward compatibility via deprecated endpoints
- ✅ OpenAPI docs show ≥90% schema coverage

**Deliverables**:
- `src/api/routes/` directory with organized endpoints
- Updated `src/api/main.py`
- `src/api/legacy.py` for backward compatibility
- Updated OpenAPI spec

---

## Phase 2: Service Layer Refactoring (Weeks 4-6)

**Goal**: Improve business logic architecture and testability

### Sprint 2.1: Unit of Work Pattern (Week 4)

#### Objectives
- Implement transaction management
- Handle multi-repository operations atomically

**Tasks**:

**2.1.1 Create Unit of Work** (6 hours)
```python
# File: src/repositories/unit_of_work.py

"""Unit of Work pattern for transaction management"""
from typing import Callable
from contextlib import contextmanager
from sqlalchemy.orm import Session

from src.database.connection import SessionLocal
from src.repositories.task_repository_v2 import TaskRepository
from src.repositories.project_repository_v2 import ProjectRepository
from src.repositories.user_repository import UserRepository

class UnitOfWork:
    """
    Unit of Work pattern implementation

    Manages database session and provides access to repositories
    Ensures all operations within a context commit or rollback together
    """

    def __init__(self, session_factory: Callable[[], Session] = SessionLocal):
        self.session_factory = session_factory
        self._session: Session = None

    def __enter__(self):
        """Enter context: create session and repositories"""
        self._session = self.session_factory()

        # Initialize repositories with shared session
        self.tasks = TaskRepository(self._session)
        self.projects = ProjectRepository(self._session)
        self.users = UserRepository(self._session)

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Exit context: commit or rollback"""
        if exc_type is not None:
            self.rollback()
        self._session.close()

    def commit(self):
        """Commit transaction"""
        self._session.commit()

    def rollback(self):
        """Rollback transaction"""
        self._session.rollback()

@contextmanager
def unit_of_work():
    """Context manager for unit of work"""
    uow = UnitOfWork()
    try:
        yield uow
        uow.commit()
    except Exception:
        uow.rollback()
        raise
```

**Usage Example**:
```python
# Multi-repository transaction
with unit_of_work() as uow:
    # Create project
    project = uow.projects.create(project_data)

    # Create task in that project
    task = uow.tasks.create(task_data)

    # Update user stats
    uow.users.increment_task_count(user_id)

    # All commit together or rollback on error
```

**2.1.2 Refactor Services to Use UoW** (6 hours)

**Acceptance Criteria**:
- ✅ Multi-step operations are atomic
- ✅ Rollback on any failure
- ✅ Tests verify transactional behavior

---

### Sprint 2.2: Domain Events (Week 5)

#### Objectives
- Decouple services via event bus
- Enable async processing

**2.2.1 Implement Event Bus** (8 hours)
```python
# File: src/events/bus.py

"""Simple in-memory event bus"""
from typing import Callable, Dict, List
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Event:
    """Base event"""
    event_type: str
    timestamp: datetime
    payload: dict

class EventBus:
    """Simple event bus for domain events"""

    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, handler: Callable):
        """Subscribe handler to event"""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    def publish(self, event: Event):
        """Publish event to all subscribers"""
        if event.event_type in self._handlers:
            for handler in self._handlers[event.event_type]:
                handler(event)

# Global event bus
event_bus = EventBus()
```

**2.2.2 Add Event Publishing to Services** (4 hours)
```python
# Example: Task completion triggers achievements
from src.events.bus import event_bus, Event

class TaskService:
    def complete_task(self, task_id: str):
        task = self.task_repo.update(task_id, {"status": "completed"})

        # Publish event
        event_bus.publish(Event(
            event_type="task.completed",
            timestamp=datetime.utcnow(),
            payload={"task_id": task_id, "user_id": task.assignee_id}
        ))

        return task

# Achievement service subscribes
def on_task_completed(event: Event):
    user_id = event.payload["user_id"]
    # Award XP, check achievements, etc.

event_bus.subscribe("task.completed", on_task_completed)
```

**Acceptance Criteria**:
- ✅ Events published for key actions
- ✅ Services decoupled via events
- ✅ Tests verify event handling

---

### Sprint 2.3: Testing Infrastructure (Week 6)

#### Objectives
- Achieve 80%+ code coverage
- Mock-based unit tests
- Integration tests with test DB

**2.3.1 Create Test Fixtures** (4 hours)
```python
# File: tests/conftest.py

"""Pytest fixtures for testing"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock

from src.database.models import Base
from src.repositories.task_repository_v2 import TaskRepository
from src.services.task_service_v2 import TaskService

@pytest.fixture(scope="function")
def test_db():
    """In-memory SQLite database for testing"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    TestSessionLocal = sessionmaker(bind=engine)
    session = TestSessionLocal()

    yield session

    session.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def task_repository(test_db):
    """Task repository with test database"""
    return TaskRepository(test_db)

@pytest.fixture
def mock_task_repository():
    """Mock task repository for unit tests"""
    return Mock(spec=TaskRepository)

@pytest.fixture
def task_service(task_repository, project_repository):
    """Task service with real repositories"""
    return TaskService(task_repository, project_repository)

@pytest.fixture
def task_service_with_mocks(mock_task_repository, mock_project_repository):
    """Task service with mocked repositories"""
    return TaskService(mock_task_repository, mock_project_repository)
```

**2.3.2 Write Unit Tests** (8 hours)
```python
# File: tests/services/test_task_service.py

"""Unit tests for TaskService"""
import pytest
from unittest.mock import Mock
from src.services.task_service_v2 import TaskService, TaskNotFoundError
from src.core.task_models import Task, TaskStatus, TaskPriority

def test_create_task_success(task_service_with_mocks):
    """Test successful task creation"""
    # Arrange
    mock_task_repo = task_service_with_mocks.task_repo
    mock_project_repo = task_service_with_mocks.project_repo

    mock_project_repo.get_by_id.return_value = Mock(project_id="proj_1")
    mock_task_repo.create.return_value = Task(
        task_id="task_1",
        title="Test Task",
        description="Test Description",
        project_id="proj_1",
        status=TaskStatus.TODO,
        priority=TaskPriority.MEDIUM
    )

    # Act
    task = task_service_with_mocks.create_task(
        title="Test Task",
        description="Test Description",
        project_id="proj_1"
    )

    # Assert
    assert task.task_id == "task_1"
    assert task.status == TaskStatus.TODO
    mock_project_repo.get_by_id.assert_called_once_with("proj_1")
    mock_task_repo.create.assert_called_once()

def test_create_task_project_not_found(task_service_with_mocks):
    """Test task creation fails when project doesn't exist"""
    # Arrange
    mock_project_repo = task_service_with_mocks.project_repo
    mock_project_repo.get_by_id.return_value = None

    # Act & Assert
    with pytest.raises(ProjectNotFoundError):
        task_service_with_mocks.create_task(
            title="Test",
            description="Test",
            project_id="invalid"
        )
```

**2.3.3 Write Integration Tests** (8 hours)
```python
# File: tests/integration/test_task_api.py

"""Integration tests for Task API"""
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_create_task_e2e(test_db):
    """End-to-end test: Create project and task"""
    # Create project first
    project_response = client.post("/api/v1/projects", json={
        "name": "Test Project",
        "description": "Integration test project"
    })
    assert project_response.status_code == 201
    project_id = project_response.json()["project_id"]

    # Create task
    task_response = client.post("/api/v1/tasks", json={
        "title": "Integration Test Task",
        "description": "Testing E2E flow",
        "project_id": project_id,
        "priority": "high"
    })
    assert task_response.status_code == 201
    task_data = task_response.json()
    assert task_data["title"] == "Integration Test Task"
    assert task_data["priority"] == "high"

    # Retrieve task
    get_response = client.get(f"/api/v1/tasks/{task_data['task_id']}")
    assert get_response.status_code == 200
```

**Acceptance Criteria**:
- ✅ 80%+ code coverage across codebase
- ✅ All services have unit tests with mocks
- ✅ Integration tests cover happy paths
- ✅ Tests run in <30 seconds
- ✅ CI/CD pipeline includes tests

---

## Phase 3: Production Readiness (Weeks 7-8)

**Goal**: Make backend production-ready

### Sprint 3.1: Performance & Monitoring (Week 7)

**3.1.1 Add Caching** (4 hours)
```python
# File: src/cache/redis_cache.py

"""Redis caching layer"""
import redis
import json
from typing import Optional
from functools import wraps

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

def cache(ttl: int = 300):
    """Cache decorator"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{func.__name__}:{args}:{kwargs}"

            # Check cache
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

            # Call function
            result = await func(*args, **kwargs)

            # Store in cache
            redis_client.setex(cache_key, ttl, json.dumps(result))

            return result
        return wrapper
    return decorator
```

**3.1.2 Add Structured Logging** (3 hours)
```python
# File: src/logging_config.py

"""Structured logging with structlog"""
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
)

logger = structlog.get_logger()
```

**3.1.3 Add Prometheus Metrics** (4 hours)
```python
# File: src/metrics.py

"""Prometheus metrics"""
from prometheus_client import Counter, Histogram

# Metrics
task_created_counter = Counter(
    'tasks_created_total',
    'Total tasks created'
)

task_completion_histogram = Histogram(
    'task_completion_duration_seconds',
    'Task completion duration'
)

# Usage in service
def create_task(self, ...):
    task = self.task_repo.create(...)
    task_created_counter.inc()
    return task
```

**Acceptance Criteria**:
- ✅ Redis caching for expensive queries
- ✅ Structured JSON logging
- ✅ Prometheus metrics exposed
- ✅ Response times <200ms (p95)

---

### Sprint 3.2: Security & Deployment (Week 8)

**3.2.1 Add API Rate Limiting** (3 hours)
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@router.get("/tasks")
@limiter.limit("100/minute")
async def list_tasks(...):
    ...
```

**3.2.2 Docker Configuration** (4 hours)
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy dependencies
COPY pyproject.toml .
RUN uv sync --no-dev

# Copy app
COPY src/ src/
COPY alembic/ alembic/

# Run migrations and start server
CMD ["sh", "-c", "uv run alembic upgrade head && uv run uvicorn src.api.main:app --host 0.0.0.0 --port 8000"]
```

**3.2.3 Kubernetes Deployment** (5 hours)
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: proxy-agent-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: proxy-agent:1.0.0
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

**Acceptance Criteria**:
- ✅ Rate limiting per endpoint
- ✅ Docker image builds successfully
- ✅ Kubernetes deployment tested locally
- ✅ Health checks configured
- ✅ Zero-downtime deployments

---

## Migration Strategy

### Parallel Run Approach

**Week 1-3**: Both old and new systems run
- New code in `*_v2.py` files
- Old code unchanged
- Feature flags control which version runs

**Week 4-6**: Gradual cutover
- New endpoints enabled in production
- Old endpoints deprecated but functional
- Monitor metrics for regressions

**Week 7-8**: Cleanup
- Remove old code
- Delete deprecated endpoints
- Update documentation

### Rollback Plan

Each phase has a rollback strategy:
- **Phase 1**: Feature flag to disable v2 repositories
- **Phase 2**: Revert to direct DB access if UoW breaks
- **Phase 3**: Scale down new pods, route to old version

---

## Risk Mitigation

### High-Risk Areas

1. **Database Migration** (Phase 1.1)
   - **Risk**: Data loss during Alembic conversion
   - **Mitigation**: Backup database before migration, test on staging

2. **Service Refactoring** (Phase 1.2)
   - **Risk**: Breaking existing API contracts
   - **Mitigation**: Comprehensive integration tests, canary deployments

3. **API Consolidation** (Phase 1.3)
   - **Risk**: Breaking clients using old endpoints
   - **Mitigation**: Maintain deprecated endpoints for 6 months, publish migration guide

### Testing Gates

Each sprint must pass:
- ✅ All unit tests (≥80% coverage)
- ✅ Integration tests green
- ✅ Performance tests (no regressions)
- ✅ Manual QA on staging

---

## Success Metrics Dashboard

Track these KPIs weekly:

| Metric | Current | Target | Week 3 | Week 6 | Week 8 |
|--------|---------|--------|--------|--------|--------|
| Test Coverage | 20% | 80% | 40% | 70% | 85% |
| API Files | 13 | 8 | 10 | 8 | 8 |
| Largest File | 1264 | 500 | 800 | 600 | 450 |
| TODO Count | 34 | 0 | 20 | 5 | 0 |
| Response Time (p95) | 800ms | 200ms | 600ms | 300ms | 180ms |
| API Schema Coverage | 10% | 90% | 40% | 80% | 95% |

---

## Resources Required

### Team Composition
- 1 Senior Backend Engineer (lead)
- 2 Backend Engineers
- 1 DevOps Engineer (part-time)
- 1 QA Engineer (part-time)

### Infrastructure
- PostgreSQL instance (staging + prod)
- Redis cluster
- Kubernetes cluster (or managed service)
- CI/CD pipeline (GitHub Actions recommended)

### Budget Estimate
- Development: 480 hours × $150/hr = $72,000
- Infrastructure: $500/month × 2 months = $1,000
- **Total**: ~$73,000

---

## Next Steps

### Immediate Actions (This Week)

1. **Approve Plan** - Review and approve this plan
2. **Setup Repo** - Create `feature/backend-refactor` branch
3. **Sprint Kickoff** - Schedule Sprint 1.1 kickoff meeting
4. **Environment Setup** - Provision PostgreSQL staging database
5. **Baseline Metrics** - Run current test suite, measure coverage

### Week 1 Deliverables

- ✅ Alembic initialized
- ✅ Baseline migration created
- ✅ PostgreSQL connection working
- ✅ SQLAlchemy models defined

**Ready to start?** Let's begin with Sprint 1.1! 🚀
