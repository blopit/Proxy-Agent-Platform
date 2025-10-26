"""
Unit tests for TaskRepository (TDD Red → Green → Refactor)

Test-Driven Development workflow:
1. Write tests first (RED - they fail)
2. Implement minimal code to pass (GREEN)
3. Refactor while keeping tests green (REFACTOR)
"""

import pytest
from datetime import datetime, timezone

from src.database.models import Task as TaskModel, Project as ProjectModel
from src.core.task_models import Task, TaskStatus, TaskPriority
from src.repositories.task_repository_v2 import TaskRepository


@pytest.mark.unit
class TestTaskRepositoryCreate:
    """Test task creation"""

    def test_create_task_success(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: A valid task
        WHEN: create() is called
        THEN: Task is persisted in database
        """
        # Arrange: Create project first (foreign key requirement)
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        # Create task
        task_data = make_task_data(project_id=project_data["project_id"])
        task = Task(**task_data)

        # Act
        repo = TaskRepository(test_db)
        created_task = repo.create(task)

        # Assert
        assert created_task is not None
        assert created_task.task_id == task.task_id
        assert created_task.title == task.title
        assert created_task.project_id == project_data["project_id"]

        # Verify in database
        db_task = test_db.query(TaskModel).filter(
            TaskModel.task_id == task.task_id
        ).first()
        assert db_task is not None
        assert db_task.title == task.title

    def test_create_task_sets_created_at(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: A task without created_at
        WHEN: create() is called
        THEN: created_at is set to current time
        """
        # Arrange
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        task_data = make_task_data(project_id=project_data["project_id"])
        task_data.pop("created_at", None)  # Remove created_at
        task = Task(**task_data)

        # Act
        repo = TaskRepository(test_db)
        created_task = repo.create(task)

        # Assert
        assert created_task.created_at is not None
        assert isinstance(created_task.created_at, datetime)


@pytest.mark.unit
class TestTaskRepositoryRead:
    """Test task reading"""

    def test_get_by_id_found(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: A task exists in database
        WHEN: get_by_id() is called with its ID
        THEN: Task is returned
        """
        # Arrange: Create task in database
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        task_data = make_task_data(project_id=project_data["project_id"])
        task_model = TaskModel(**task_data)
        test_db.add(task_model)
        test_db.commit()

        # Act
        repo = TaskRepository(test_db)
        found_task = repo.get_by_id(task_data["task_id"])

        # Assert
        assert found_task is not None
        assert found_task.task_id == task_data["task_id"]
        assert found_task.title == task_data["title"]

    def test_get_by_id_not_found(self, test_db):
        """
        GIVEN: No task with the given ID exists
        WHEN: get_by_id() is called
        THEN: None is returned
        """
        # Act
        repo = TaskRepository(test_db)
        found_task = repo.get_by_id("nonexistent_id")

        # Assert
        assert found_task is None

    def test_list_all_with_pagination(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: Multiple tasks exist
        WHEN: list_all() is called with pagination params
        THEN: Correct page of tasks is returned
        """
        # Arrange: Create 5 tasks
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        for i in range(5):
            task_data = make_task_data(
                project_id=project_data["project_id"],
                title=f"Task {i}"
            )
            task_model = TaskModel(**task_data)
            test_db.add(task_model)
        test_db.commit()

        # Act
        repo = TaskRepository(test_db)
        page_1 = repo.list_all(skip=0, limit=2)
        page_2 = repo.list_all(skip=2, limit=2)

        # Assert
        assert len(page_1) == 2
        assert len(page_2) == 2
        assert page_1[0].task_id != page_2[0].task_id


@pytest.mark.unit
class TestTaskRepositoryUpdate:
    """Test task updating"""

    def test_update_task_success(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: A task exists
        WHEN: update() is called with new values
        THEN: Task is updated in database
        """
        # Arrange
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        task_data = make_task_data(project_id=project_data["project_id"])
        task_model = TaskModel(**task_data)
        test_db.add(task_model)
        test_db.commit()

        # Act
        repo = TaskRepository(test_db)
        updated_task = repo.update(task_data["task_id"], {
            "title": "Updated Title",
            "status": TaskStatus.IN_PROGRESS.value
        })

        # Assert
        assert updated_task is not None
        assert updated_task.title == "Updated Title"
        assert updated_task.status == TaskStatus.IN_PROGRESS

        # Verify in database
        db_task = test_db.query(TaskModel).filter(
            TaskModel.task_id == task_data["task_id"]
        ).first()
        assert db_task.title == "Updated Title"

    def test_update_task_not_found(self, test_db):
        """
        GIVEN: No task with the given ID exists
        WHEN: update() is called
        THEN: None is returned
        """
        # Act
        repo = TaskRepository(test_db)
        result = repo.update("nonexistent_id", {"title": "New Title"})

        # Assert
        assert result is None


@pytest.mark.unit
class TestTaskRepositoryDelete:
    """Test task deletion"""

    def test_delete_task_success(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: A task exists
        WHEN: delete() is called
        THEN: Task is removed from database
        """
        # Arrange
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        task_data = make_task_data(project_id=project_data["project_id"])
        task_model = TaskModel(**task_data)
        test_db.add(task_model)
        test_db.commit()

        # Act
        repo = TaskRepository(test_db)
        result = repo.delete(task_data["task_id"])

        # Assert
        assert result is True

        # Verify deletion
        db_task = test_db.query(TaskModel).filter(
            TaskModel.task_id == task_data["task_id"]
        ).first()
        assert db_task is None

    def test_delete_task_not_found(self, test_db):
        """
        GIVEN: No task with the given ID exists
        WHEN: delete() is called
        THEN: False is returned
        """
        # Act
        repo = TaskRepository(test_db)
        result = repo.delete("nonexistent_id")

        # Assert
        assert result is False


@pytest.mark.unit
class TestTaskRepositorySpecificQueries:
    """Test task-specific query methods"""

    def test_get_by_project(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: Tasks from multiple projects exist
        WHEN: get_by_project() is called
        THEN: Only tasks from that project are returned
        """
        # Arrange: Create 2 projects with tasks
        project1_data = make_project_data()
        project1 = ProjectModel(**project1_data)
        project2_data = make_project_data()
        project2 = ProjectModel(**project2_data)
        test_db.add_all([project1, project2])
        test_db.commit()

        # Add 3 tasks to project1
        for i in range(3):
            task = TaskModel(**make_task_data(
                project_id=project1_data["project_id"],
                title=f"Project 1 Task {i}"
            ))
            test_db.add(task)

        # Add 2 tasks to project2
        for i in range(2):
            task = TaskModel(**make_task_data(
                project_id=project2_data["project_id"],
                title=f"Project 2 Task {i}"
            ))
            test_db.add(task)
        test_db.commit()

        # Act
        repo = TaskRepository(test_db)
        project1_tasks = repo.get_by_project(project1_data["project_id"])

        # Assert
        assert len(project1_tasks) == 3
        for task in project1_tasks:
            assert task.project_id == project1_data["project_id"]

    def test_get_by_status(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: Tasks with different statuses exist
        WHEN: get_by_status() is called
        THEN: Only tasks with that status are returned
        """
        # Arrange
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        # Create tasks with different statuses
        for status in [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED]:
            task = TaskModel(**make_task_data(
                project_id=project_data["project_id"],
                status=status.value
            ))
            test_db.add(task)
        test_db.commit()

        # Act
        repo = TaskRepository(test_db)
        todo_tasks = repo.get_by_status(TaskStatus.TODO.value)

        # Assert
        assert len(todo_tasks) == 1
        assert todo_tasks[0].status == TaskStatus.TODO

    def test_search_tasks(self, test_db, make_project_data, make_task_data):
        """
        GIVEN: Tasks with different titles exist
        WHEN: search() is called with a query
        THEN: Tasks matching the query are returned
        """
        # Arrange
        project_data = make_project_data()
        project = ProjectModel(**project_data)
        test_db.add(project)
        test_db.commit()

        # Create tasks with specific titles
        task1 = TaskModel(**make_task_data(
            project_id=project_data["project_id"],
            title="Implement authentication feature"
        ))
        task2 = TaskModel(**make_task_data(
            project_id=project_data["project_id"],
            title="Fix bug in login"
        ))
        task3 = TaskModel(**make_task_data(
            project_id=project_data["project_id"],
            title="Add dashboard widget"
        ))
        test_db.add_all([task1, task2, task3])
        test_db.commit()

        # Act
        repo = TaskRepository(test_db)
        results = repo.search("auth")

        # Assert
        assert len(results) >= 1  # Should find "authentication"
        assert any("auth" in task.title.lower() for task in results)
