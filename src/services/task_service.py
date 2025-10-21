"""
Task Management Service - Business logic for task operations
"""

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Any

from src.core.task_models import (
    DependencyType,
    Project,
    Task,
    TaskDependency,
    TaskFilter,
    TaskPriority,
    TaskSort,
    TaskStatus,
)
from src.repositories.enhanced_repositories import (
    EnhancedProjectRepository,
    EnhancedTaskRepository,
    PaginatedResult,
)
from src.repositories.task_repository import (
    TaskCommentRepository,
    TaskDependencyRepository,
    TaskTemplateRepository,
)

# Alias for compatibility with existing service code
TaskRepository = EnhancedTaskRepository
ProjectRepository = EnhancedProjectRepository


class TaskServiceError(Exception):
    """Custom exception for task service errors"""

    pass


@dataclass
class TaskCreationData:
    """Data class for task creation"""

    title: str
    description: str
    project_id: str
    parent_id: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    estimated_hours: Decimal | None = None
    tags: list[str] = field(default_factory=list)
    assignee: str | None = None
    due_date: datetime | None = None


@dataclass
class TaskUpdateData:
    """Data class for task updates"""

    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    estimated_hours: Decimal | None = None
    actual_hours: Decimal | None = None
    tags: list[str] | None = None
    assignee: str | None = None
    due_date: datetime | None = None


@dataclass
class ProjectCreationData:
    """Data class for project creation"""

    name: str
    description: str
    owner: str | None = None
    team_members: list[str] = field(default_factory=list)
    start_date: datetime | None = None
    end_date: datetime | None = None
    settings: dict[str, Any] = field(default_factory=dict)


@dataclass
class BulkTaskOperationResult:
    """Result of bulk task operations"""

    successful_count: int
    failed_count: int
    successful_ids: list[str]
    failed_ids: list[str]
    errors: dict[str, str] = field(default_factory=dict)

    @property
    def total_count(self) -> int:
        """Total number of tasks processed"""
        return self.successful_count + self.failed_count

    @property
    def success_rate(self) -> float:
        """Success rate as percentage"""
        if self.total_count == 0:
            return 0.0
        return (self.successful_count / self.total_count) * 100


@dataclass
class TaskPrioritizationResult:
    """Result of AI task prioritization"""

    updated_count: int
    priority_changes: dict[str, TaskPriority] = field(default_factory=dict)


class TaskService:
    """Service layer for task management operations"""

    def __init__(self, db=None):
        """
        Initialize service with repositories

        Args:
            db: Optional database adapter for testing
        """
        from src.database.enhanced_adapter import EnhancedDatabaseAdapter

        self.task_repo = TaskRepository(db)
        self.project_repo = ProjectRepository(db)

        # Old repositories - use db_path if EnhancedDatabaseAdapter provided
        if isinstance(db, EnhancedDatabaseAdapter):
            db_path = db.db_path
        else:
            db_path = "data/task_management.db"  # Default path

        self.template_repo = TaskTemplateRepository(db_path)
        self.dependency_repo = TaskDependencyRepository(db_path)
        self.comment_repo = TaskCommentRepository(db_path)

    def get_db(self):
        """Get database adapter from repository"""
        return self.task_repo.db

    # Task CRUD Operations

    def create_task(self, task_data: TaskCreationData) -> Task:
        """Create a new task"""
        # Validate project exists
        project = self.project_repo.get_by_id(task_data.project_id)
        if not project:
            raise TaskServiceError(f"Project not found: {task_data.project_id}")

        # Validate parent task if specified
        if task_data.parent_id:
            parent_task = self.task_repo.get_by_id(task_data.parent_id)
            if not parent_task:
                raise TaskServiceError(f"Parent task not found: {task_data.parent_id}")
            if parent_task.project_id != task_data.project_id:
                raise TaskServiceError("Parent task must be in the same project")

        # Create task
        task = Task(
            title=task_data.title,
            description=task_data.description,
            project_id=task_data.project_id,
            parent_id=task_data.parent_id,
            priority=task_data.priority,
            estimated_hours=task_data.estimated_hours,
            tags=task_data.tags,
            assignee_id=task_data.assignee,  # Fixed: Task model uses assignee_id
            due_date=task_data.due_date,
        )

        return self.task_repo.create(task)

    def create_task_from_template(
        self, template_name: str, project_id: str, variables: dict[str, str]
    ) -> Task:
        """Create a task from a template"""
        # Get template
        template = self.template_repo.get_by_name(template_name)
        if not template:
            raise TaskServiceError(f"Template not found: {template_name}")

        # Validate project exists
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise TaskServiceError(f"Project not found: {project_id}")

        # Generate task data from template
        task_data_dict = template.generate_task_data(project_id, variables)

        # Create task
        task = Task(**task_data_dict)
        return self.task_repo.create(task)

    def get_task(self, task_id: str) -> Task | None:
        """Get a task by ID"""
        return self.task_repo.get_by_id(task_id)

    def update_task(self, task_id: str, update_data: TaskUpdateData) -> Task:
        """Update an existing task"""
        # Get existing task
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise TaskServiceError(f"Task not found: {task_id}")

        # Apply updates
        if update_data.title is not None:
            task.title = update_data.title
        if update_data.description is not None:
            task.description = update_data.description
        if update_data.status is not None:
            task.status = update_data.status
            # Auto-set timestamps based on status
            if update_data.status == TaskStatus.IN_PROGRESS and not task.started_at:
                task.started_at = datetime.utcnow()
            elif update_data.status == TaskStatus.COMPLETED and not task.completed_at:
                task.completed_at = datetime.utcnow()
        if update_data.priority is not None:
            task.priority = update_data.priority
        if update_data.estimated_hours is not None:
            task.estimated_hours = update_data.estimated_hours
        if update_data.actual_hours is not None:
            task.actual_hours = update_data.actual_hours
        if update_data.tags is not None:
            task.tags = update_data.tags
        if update_data.assignee is not None:
            task.assignee_id = update_data.assignee  # Fixed: Task model uses assignee_id
        if update_data.due_date is not None:
            task.due_date = update_data.due_date

        task.updated_at = datetime.utcnow()

        return self.task_repo.update(task)

    def delete_task(self, task_id: str, force: bool = False) -> bool:
        """Delete a task"""
        # Get task
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise TaskServiceError(f"Task not found: {task_id}")

        # Check for dependent tasks (skip if dependency repo not properly initialized)
        try:
            dependent_tasks = self.dependency_repo.get_dependent_tasks(task_id)
            if dependent_tasks and not force:
                raise TaskServiceError("Task has dependent tasks. Use force=True to delete anyway.")

            # Remove dependencies if force delete
            if force and dependent_tasks:
                for dep in dependent_tasks:
                    self.dependency_repo.delete_dependency(dep.task_id, task_id)
        except RuntimeError:
            # Dependency repo not initialized - skip dependency checks
            pass

        # Delete task
        return self.task_repo.delete(task_id)

    def list_tasks(
        self,
        filter_obj: TaskFilter | None = None,
        sort_obj: TaskSort | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> PaginatedResult:
        """List tasks with filtering, sorting, and pagination"""
        return self.task_repo.list_tasks(filter_obj, sort_obj, limit, offset)

    # Task Hierarchy Operations

    def get_task_hierarchy(self, task_id: str) -> dict[str, Any]:
        """Get task with its hierarchy (children, grandchildren, etc.)"""
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise TaskServiceError(f"Task not found: {task_id}")

        def build_hierarchy(parent_task: Task) -> dict[str, Any]:
            # Get direct children
            filter_obj = TaskFilter(parent_id=parent_task.task_id)
            children_result = self.task_repo.list_tasks(filter_obj)

            children = []
            for child in children_result.items:
                children.append(build_hierarchy(child))

            return {
                "task": parent_task,
                "children": children,
            }

        return build_hierarchy(task)

    # Task Dependencies

    def add_task_dependency(
        self,
        task_id: str,
        depends_on_task_id: str,
        dependency_type: DependencyType = DependencyType.DEPENDS_ON,
    ) -> TaskDependency:
        """Add a dependency between tasks"""
        # Validate both tasks exist
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise TaskServiceError(f"Task not found: {task_id}")

        depends_on_task = self.task_repo.get_by_id(depends_on_task_id)
        if not depends_on_task:
            raise TaskServiceError(f"Dependency task not found: {depends_on_task_id}")

        # Check for circular dependencies
        if self._would_create_circular_dependency(task_id, depends_on_task_id):
            raise TaskServiceError("Circular dependency detected")

        # Create dependency
        dependency = TaskDependency(
            task_id=task_id,
            depends_on_task_id=depends_on_task_id,
            dependency_type=dependency_type,
        )

        return self.dependency_repo.create(dependency)

    def remove_task_dependency(self, task_id: str, depends_on_task_id: str) -> bool:
        """Remove a dependency between tasks"""
        return self.dependency_repo.delete_dependency(task_id, depends_on_task_id)

    def get_task_dependencies(self, task_id: str) -> list[TaskDependency]:
        """Get all dependencies for a task"""
        return self.dependency_repo.get_task_dependencies(task_id)

    # Bulk Operations

    def bulk_update_tasks(
        self, task_ids: list[str], update_data: TaskUpdateData
    ) -> BulkTaskOperationResult:
        """Update multiple tasks at once"""
        successful_ids = []
        failed_ids = []
        errors = {}

        for task_id in task_ids:
            try:
                self.update_task(task_id, update_data)
                successful_ids.append(task_id)
            except Exception as e:
                failed_ids.append(task_id)
                errors[task_id] = str(e)

        return BulkTaskOperationResult(
            successful_count=len(successful_ids),
            failed_count=len(failed_ids),
            successful_ids=successful_ids,
            failed_ids=failed_ids,
            errors=errors,
        )

    def bulk_delete_tasks(
        self, task_ids: list[str], force: bool = False
    ) -> BulkTaskOperationResult:
        """Delete multiple tasks at once"""
        successful_ids = []
        failed_ids = []
        errors = {}

        for task_id in task_ids:
            try:
                self.delete_task(task_id, force=force)
                successful_ids.append(task_id)
            except Exception as e:
                failed_ids.append(task_id)
                errors[task_id] = str(e)

        return BulkTaskOperationResult(
            successful_count=len(successful_ids),
            failed_count=len(failed_ids),
            successful_ids=successful_ids,
            failed_ids=failed_ids,
            errors=errors,
        )

    # AI-Powered Features

    def estimate_task_duration(self, task: Task) -> Decimal:
        """Estimate task duration using AI"""
        return self._estimate_with_ai(task)

    def break_down_task(self, parent_task: Task) -> list[Task]:
        """Break down a complex task into subtasks using AI"""
        subtask_data_list = self._breakdown_with_ai(parent_task)

        subtasks = []
        for subtask_data in subtask_data_list:
            subtask = Task(
                title=subtask_data["title"],
                description=subtask_data["description"],
                project_id=parent_task.project_id,
                parent_id=parent_task.task_id,
                priority=parent_task.priority,
                estimated_hours=Decimal(subtask_data.get("estimated_hours", "0")),
                tags=parent_task.tags.copy(),
            )
            created_subtask = self.task_repo.create(subtask)
            subtasks.append(created_subtask)

        return subtasks

    def smart_prioritize_tasks(self, project_id: str) -> TaskPrioritizationResult:
        """Use AI to intelligently prioritize tasks in a project"""
        tasks = self.task_repo.get_tasks_by_project(project_id)
        priority_suggestions = self._prioritize_with_ai(tasks)

        updated_count = 0
        priority_changes = {}

        for task in tasks:
            if task.task_id in priority_suggestions:
                new_priority = priority_suggestions[task.task_id]
                if task.priority != new_priority:
                    task.priority = new_priority
                    task.updated_at = datetime.utcnow()
                    self.task_repo.update(task)
                    updated_count += 1
                    priority_changes[task.task_id] = new_priority

        return TaskPrioritizationResult(
            updated_count=updated_count,
            priority_changes=priority_changes,
        )

    # Project Operations

    def create_project(self, project_data: ProjectCreationData) -> Project:
        """Create a new project"""
        project = Project(
            name=project_data.name,
            description=project_data.description,
            owner_id=project_data.owner,  # Fixed: Project model uses owner_id
            team_members=project_data.team_members,
            start_date=project_data.start_date,
            end_date=project_data.end_date,
            settings=project_data.settings,
        )

        return self.project_repo.create(project)

    def get_project_analytics(self, project_id: str) -> dict[str, Any]:
        """Get analytics for a project"""
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise TaskServiceError(f"Project not found: {project_id}")

        tasks = self.task_repo.get_tasks_by_project(project_id)

        # Calculate task statistics
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.status == TaskStatus.COMPLETED])
        in_progress_tasks = len([t for t in tasks if t.status == TaskStatus.IN_PROGRESS])
        todo_tasks = len([t for t in tasks if t.status == TaskStatus.TODO])
        blocked_tasks = len([t for t in tasks if t.status == TaskStatus.BLOCKED])

        completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

        # Calculate time statistics
        total_estimated_hours = sum(t.estimated_hours or Decimal("0") for t in tasks)
        total_actual_hours = sum(t.actual_hours for t in tasks)

        return {
            "project": project,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "todo_tasks": todo_tasks,
            "blocked_tasks": blocked_tasks,
            "completion_percentage": round(completion_percentage, 2),
            "total_estimated_hours": total_estimated_hours,
            "total_actual_hours": total_actual_hours,
        }

    def archive_project(self, project_id: str, force: bool = False) -> bool:
        """Archive a project"""
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise TaskServiceError(f"Project not found: {project_id}")

        # Check for active tasks
        if not force:
            tasks = self.task_repo.get_tasks_by_project(project_id)
            active_tasks = [
                t
                for t in tasks
                if t.status in [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED]
            ]
            if active_tasks:
                raise TaskServiceError(
                    "Project has active tasks. Use force=True to archive anyway."
                )

        # Archive project
        project.is_active = False
        project.updated_at = datetime.utcnow()
        self.project_repo.update(project)

        return True

    # Private Helper Methods

    def _would_create_circular_dependency(self, task_id: str, depends_on_task_id: str) -> bool:
        """Check if adding a dependency would create a circular dependency"""
        # Simple circular dependency check: if depends_on_task already depends on task_id
        existing_deps = self.dependency_repo.get_task_dependencies(depends_on_task_id)
        for dep in existing_deps:
            if dep.depends_on_task_id == task_id:
                return True
        return False

    def _estimate_with_ai(self, task: Task) -> Decimal:
        """Estimate task duration using AI (placeholder implementation)"""
        # This would integrate with an AI service like OpenAI, Claude, etc.
        # For now, return a simple heuristic based on title length and complexity keywords

        complexity_keywords = [
            "complex",
            "advanced",
            "integration",
            "architecture",
            "refactor",
            "migration",
        ]
        simple_keywords = ["fix", "update", "small", "minor", "quick"]

        title_lower = task.title.lower()
        description_lower = task.description.lower()

        base_hours = max(len(task.title) / 10, 1.0)  # Base on title length

        # Adjust based on keywords
        if any(
            keyword in title_lower or keyword in description_lower
            for keyword in complexity_keywords
        ):
            base_hours *= 2.5
        elif any(
            keyword in title_lower or keyword in description_lower for keyword in simple_keywords
        ):
            base_hours *= 0.5

        return Decimal(str(round(base_hours, 1)))

    def _breakdown_with_ai(self, task: Task) -> list[dict[str, str]]:
        """Break down task using AI (placeholder implementation)"""
        # This would integrate with an AI service
        # For now, return a simple breakdown based on task type

        if "authentication" in task.title.lower() or "auth" in task.title.lower():
            return [
                {
                    "title": "Create login form",
                    "description": "HTML form with email/password fields",
                    "estimated_hours": "2.0",
                },
                {
                    "title": "Implement authentication API",
                    "description": "Backend endpoints for login/logout",
                    "estimated_hours": "4.0",
                },
                {
                    "title": "Add session management",
                    "description": "Handle user sessions and tokens",
                    "estimated_hours": "3.0",
                },
                {
                    "title": "Create logout functionality",
                    "description": "Clear sessions and redirect",
                    "estimated_hours": "1.0",
                },
            ]
        elif "dashboard" in task.title.lower():
            return [
                {
                    "title": "Design dashboard layout",
                    "description": "Create wireframes and component structure",
                    "estimated_hours": "3.0",
                },
                {
                    "title": "Implement data visualization",
                    "description": "Charts and graphs for metrics",
                    "estimated_hours": "6.0",
                },
                {
                    "title": "Add filters and controls",
                    "description": "Date ranges, search, sorting",
                    "estimated_hours": "4.0",
                },
                {
                    "title": "Optimize performance",
                    "description": "Lazy loading and caching",
                    "estimated_hours": "2.0",
                },
            ]
        else:
            # Generic breakdown
            return [
                {
                    "title": f"Research {task.title}",
                    "description": "Investigate requirements and approach",
                    "estimated_hours": "2.0",
                },
                {
                    "title": f"Implement {task.title}",
                    "description": "Core implementation",
                    "estimated_hours": "6.0",
                },
                {
                    "title": f"Test {task.title}",
                    "description": "Unit and integration tests",
                    "estimated_hours": "3.0",
                },
                {
                    "title": f"Document {task.title}",
                    "description": "Update documentation",
                    "estimated_hours": "1.0",
                },
            ]

    def _prioritize_with_ai(self, tasks: list[Task]) -> dict[str, TaskPriority]:
        """Prioritize tasks using AI (placeholder implementation)"""
        # This would integrate with an AI service
        # For now, return priorities based on keywords

        priority_map = {}

        for task in tasks:
            title_lower = task.title.lower()
            description_lower = task.description.lower()

            # Critical priorities
            if any(
                keyword in title_lower or keyword in description_lower
                for keyword in [
                    "critical",
                    "urgent",
                    "security",
                    "vulnerability",
                    "crash",
                    "error",
                    "bug",
                ]
            ):
                priority_map[task.task_id] = TaskPriority.CRITICAL
            # High priorities
            elif any(
                keyword in title_lower or keyword in description_lower
                for keyword in ["important", "deadline", "blocking", "required"]
            ):
                priority_map[task.task_id] = TaskPriority.HIGH
            # Low priorities
            elif any(
                keyword in title_lower or keyword in description_lower
                for keyword in ["nice", "enhancement", "improvement", "optional"]
            ):
                priority_map[task.task_id] = TaskPriority.LOW
            # Medium is default
            else:
                priority_map[task.task_id] = TaskPriority.MEDIUM

        return priority_map
