# Model Tests

This directory contains comprehensive tests for the data models and database schemas of the Proxy Agent Platform.

## Overview

The tests/models directory provides test coverage for all data models, validation rules, relationships, and database operations.

## Test Coverage

### Core Model Testing
- **Data Validation**: Pydantic model validation and constraints
- **Business Rules**: Model-level business logic validation
- **Relationships**: Model relationships and foreign key constraints
- **Serialization**: JSON serialization and deserialization
- **Database Operations**: CRUD operations and query testing

### Model Categories
- **Task Models**: Task-related data structures and validation
- **User Models**: User account and profile models
- **Document Models**: Document management and metadata
- **Gamification Models**: XP, achievements, and progress tracking
- **System Models**: Core system entities and configurations

## Test Structure

### Unit Tests
```python
import pytest
from datetime import datetime, timedelta
from uuid import uuid4
from src.core.models import Task, TaskStatus, Priority, User, Document, XPTransaction

class TestTaskModel:
    def test_task_creation(self):
        """Test basic task creation"""
        task = Task(
            title="Test Task",
            description="Test description",
            priority=Priority.HIGH,
            user_id=str(uuid4())
        )
        
        assert task.title == "Test Task"
        assert task.priority == Priority.HIGH
        assert task.status == TaskStatus.PENDING  # Default status
        assert task.created_at is not None
        assert task.updated_at is not None
        assert task.is_active is True
    
    def test_task_validation(self):
        """Test task validation rules"""
        # Test empty title validation
        with pytest.raises(ValueError):
            Task(title="", user_id=str(uuid4()))
        
        # Test title length validation
        with pytest.raises(ValueError):
            Task(title="x" * 201, user_id=str(uuid4()))  # Max 200 chars
        
        # Test negative duration validation
        with pytest.raises(ValueError):
            Task(
                title="Test",
                estimated_duration=-10,
                user_id=str(uuid4())
            )
    
    def test_task_status_transitions(self):
        """Test valid task status transitions"""
        task = Task(title="Test Task", user_id=str(uuid4()))
        
        # Valid transitions
        task.status = TaskStatus.IN_PROGRESS
        assert task.status == TaskStatus.IN_PROGRESS
        
        task.status = TaskStatus.COMPLETED
        assert task.status == TaskStatus.COMPLETED
        
        # Test business rule: completed tasks should have actual duration
        if task.status == TaskStatus.COMPLETED:
            task.actual_duration = 60
            assert task.actual_duration == 60
    
    def test_task_overdue_detection(self):
        """Test overdue task detection"""
        # Task with past due date
        past_date = datetime.utcnow() - timedelta(days=1)
        overdue_task = Task(
            title="Overdue Task",
            due_date=past_date,
            user_id=str(uuid4())
        )
        
        assert overdue_task.is_overdue() is True
        
        # Task with future due date
        future_date = datetime.utcnow() + timedelta(days=1)
        future_task = Task(
            title="Future Task",
            due_date=future_date,
            user_id=str(uuid4())
        )
        
        assert future_task.is_overdue() is False
        
        # Completed task should not be overdue
        completed_task = Task(
            title="Completed Task",
            due_date=past_date,
            status=TaskStatus.COMPLETED,
            user_id=str(uuid4())
        )
        
        assert completed_task.is_overdue() is False
    
    def test_task_tags_normalization(self):
        """Test tag normalization"""
        task = Task(
            title="Test Task",
            tags=["  Work  ", "URGENT", "meeting", ""],
            user_id=str(uuid4())
        )
        
        # Tags should be normalized (lowercase, trimmed, empty removed)
        expected_tags = ["work", "urgent", "meeting"]
        assert task.tags == expected_tags
    
    def test_task_serialization(self):
        """Test task JSON serialization"""
        task = Task(
            title="Test Task",
            description="Test description",
            priority=Priority.HIGH,
            tags=["work", "urgent"],
            user_id=str(uuid4())
        )
        
        # Test serialization
        task_dict = task.dict()
        assert task_dict["title"] == "Test Task"
        assert task_dict["priority"] == "high"
        assert task_dict["tags"] == ["work", "urgent"]
        
        # Test JSON serialization
        task_json = task.json()
        assert isinstance(task_json, str)
        
        # Test deserialization
        import json
        parsed_data = json.loads(task_json)
        assert parsed_data["title"] == "Test Task"

class TestUserModel:
    def test_user_creation(self):
        """Test user model creation"""
        user = User(
            email="test@example.com",
            username="testuser",
            full_name="Test User"
        )
        
        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.is_active is True
        assert user.created_at is not None
    
    def test_email_validation(self):
        """Test email validation"""
        # Valid email
        user = User(email="valid@example.com", username="test")
        assert user.email == "valid@example.com"
        
        # Invalid email should raise validation error
        with pytest.raises(ValueError):
            User(email="invalid-email", username="test")
    
    def test_username_uniqueness_constraint(self):
        """Test username uniqueness (would be enforced at DB level)"""
        # This test would typically involve database constraints
        # For unit testing, we test the model validation
        user1 = User(email="user1@example.com", username="testuser")
        user2 = User(email="user2@example.com", username="testuser")
        
        # Both models are valid individually
        assert user1.username == "testuser"
        assert user2.username == "testuser"
        
        # Database constraint would prevent duplicate usernames

class TestDocumentModel:
    def test_document_creation(self):
        """Test document model creation"""
        document = Document(
            name="test_document.pdf",
            document_type=DocumentType.PDF,
            file_size=1024,
            user_id=str(uuid4())
        )
        
        assert document.name == "test_document.pdf"
        assert document.document_type == DocumentType.PDF
        assert document.file_size == 1024
        assert document.is_processed is False  # Default
    
    def test_file_extension_detection(self):
        """Test file extension detection"""
        document = Document(
            name="report.pdf",
            document_type=DocumentType.PDF,
            user_id=str(uuid4())
        )
        
        assert document.get_file_extension() == ".pdf"
        
        # Test with no extension
        document_no_ext = Document(
            name="document",
            document_type=DocumentType.OTHER,
            user_id=str(uuid4())
        )
        
        assert document_no_ext.get_file_extension() == ""
    
    def test_file_size_validation(self):
        """Test file size validation"""
        # Valid file size
        document = Document(
            name="test.pdf",
            file_size=1024,
            user_id=str(uuid4())
        )
        assert document.file_size == 1024
        
        # Negative file size should raise error
        with pytest.raises(ValueError):
            Document(
                name="test.pdf",
                file_size=-100,
                user_id=str(uuid4())
            )

class TestXPTransactionModel:
    def test_xp_transaction_creation(self):
        """Test XP transaction creation"""
        transaction = XPTransaction(
            user_id=str(uuid4()),
            transaction_type=XPTransactionType.TASK_COMPLETION,
            points=10,
            description="Completed task: Review report"
        )
        
        assert transaction.points == 10
        assert transaction.transaction_type == XPTransactionType.TASK_COMPLETION
        assert transaction.multiplier == 1.0  # Default
        assert transaction.created_at is not None
    
    def test_xp_calculation_with_multiplier(self):
        """Test XP calculation with multiplier"""
        base_points = 10
        multiplier = 1.5
        
        transaction = XPTransaction(
            user_id=str(uuid4()),
            transaction_type=XPTransactionType.TASK_COMPLETION,
            points=base_points,
            multiplier=multiplier
        )
        
        # Calculate effective points
        effective_points = transaction.points * transaction.multiplier
        assert effective_points == 15.0
    
    def test_transaction_type_validation(self):
        """Test transaction type validation"""
        # Valid transaction type
        transaction = XPTransaction(
            user_id=str(uuid4()),
            transaction_type=XPTransactionType.FOCUS_SESSION,
            points=5
        )
        assert transaction.transaction_type == XPTransactionType.FOCUS_SESSION
        
        # Invalid transaction type would be caught by enum validation
        with pytest.raises(ValueError):
            XPTransaction(
                user_id=str(uuid4()),
                transaction_type="invalid_type",
                points=5
            )
```

### Database Integration Tests
```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from src.core.models import Base, Task, User, Document

class TestModelDatabaseIntegration:
    @pytest.fixture
    async def db_session(self):
        """Create test database session"""
        engine = create_async_engine("sqlite+aiosqlite:///:memory:")
        
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        # Create session
        async_session = sessionmaker(engine, class_=AsyncSession)
        async with async_session() as session:
            yield session
        
        await engine.dispose()
    
    async def test_task_crud_operations(self, db_session):
        """Test task CRUD operations"""
        # Create user first
        user = User(email="test@example.com", username="testuser")
        db_session.add(user)
        await db_session.flush()
        
        # Create task
        task = Task(
            title="Test Task",
            description="Test description",
            user_id=user.id
        )
        db_session.add(task)
        await db_session.commit()
        
        # Read task
        from sqlalchemy import select
        result = await db_session.execute(select(Task).where(Task.id == task.id))
        retrieved_task = result.scalar_one()
        
        assert retrieved_task.title == "Test Task"
        assert retrieved_task.user_id == user.id
        
        # Update task
        retrieved_task.status = TaskStatus.COMPLETED
        await db_session.commit()
        
        # Verify update
        result = await db_session.execute(select(Task).where(Task.id == task.id))
        updated_task = result.scalar_one()
        assert updated_task.status == TaskStatus.COMPLETED
        
        # Delete task
        await db_session.delete(updated_task)
        await db_session.commit()
        
        # Verify deletion
        result = await db_session.execute(select(Task).where(Task.id == task.id))
        deleted_task = result.scalar_one_or_none()
        assert deleted_task is None
    
    async def test_model_relationships(self, db_session):
        """Test model relationships"""
        # Create user
        user = User(email="test@example.com", username="testuser")
        db_session.add(user)
        await db_session.flush()
        
        # Create tasks for user
        tasks = [
            Task(title=f"Task {i}", user_id=user.id)
            for i in range(3)
        ]
        
        for task in tasks:
            db_session.add(task)
        
        await db_session.commit()
        
        # Test relationship loading
        from sqlalchemy.orm import selectinload
        result = await db_session.execute(
            select(User).options(selectinload(User.tasks)).where(User.id == user.id)
        )
        user_with_tasks = result.scalar_one()
        
        assert len(user_with_tasks.tasks) == 3
        assert all(task.user_id == user.id for task in user_with_tasks.tasks)
    
    async def test_database_constraints(self, db_session):
        """Test database constraints"""
        # Test foreign key constraint
        invalid_task = Task(
            title="Invalid Task",
            user_id=str(uuid4())  # Non-existent user ID
        )
        
        db_session.add(invalid_task)
        
        # Should raise foreign key constraint error
        with pytest.raises(Exception):  # Specific exception depends on database
            await db_session.commit()
    
    async def test_model_indexing(self, db_session):
        """Test database indexing performance"""
        # Create user
        user = User(email="test@example.com", username="testuser")
        db_session.add(user)
        await db_session.flush()
        
        # Create many tasks
        tasks = [
            Task(
                title=f"Task {i}",
                user_id=user.id,
                status=TaskStatus.PENDING if i % 2 == 0 else TaskStatus.COMPLETED
            )
            for i in range(1000)
        ]
        
        for task in tasks:
            db_session.add(task)
        
        await db_session.commit()
        
        # Test indexed query performance
        import time
        start_time = time.time()
        
        result = await db_session.execute(
            select(Task).where(
                Task.user_id == user.id,
                Task.status == TaskStatus.PENDING
            ).limit(10)
        )
        pending_tasks = result.scalars().all()
        
        end_time = time.time()
        query_time = end_time - start_time
        
        # Query should be fast with proper indexing
        assert len(pending_tasks) == 10
        assert query_time < 1.0  # Should complete in less than 1 second
```

### Model Performance Tests
```python
class TestModelPerformance:
    def test_model_validation_performance(self):
        """Test model validation performance"""
        import time
        
        start_time = time.time()
        
        # Create many model instances
        tasks = []
        for i in range(1000):
            task = Task(
                title=f"Task {i}",
                description=f"Description for task {i}",
                priority=Priority.MEDIUM,
                tags=[f"tag{j}" for j in range(3)],
                user_id=str(uuid4())
            )
            tasks.append(task)
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        # Model creation should be fast
        assert creation_time < 5.0  # Less than 5 seconds for 1000 models
        assert len(tasks) == 1000
    
    def test_serialization_performance(self):
        """Test model serialization performance"""
        import time
        
        # Create test data
        tasks = [
            Task(
                title=f"Task {i}",
                description=f"Description {i}",
                tags=[f"tag{j}" for j in range(5)],
                user_id=str(uuid4())
            )
            for i in range(100)
        ]
        
        start_time = time.time()
        
        # Serialize all tasks
        serialized_tasks = [task.dict() for task in tasks]
        
        end_time = time.time()
        serialization_time = end_time - start_time
        
        # Serialization should be fast
        assert serialization_time < 1.0  # Less than 1 second
        assert len(serialized_tasks) == 100
        assert all("title" in task for task in serialized_tasks)
```

### Mock Data and Fixtures
```python
@pytest.fixture
def sample_task_data():
    """Sample task data for testing"""
    return {
        "title": "Sample Task",
        "description": "Sample task description",
        "priority": Priority.MEDIUM,
        "estimated_duration": 60,
        "tags": ["work", "important"],
        "user_id": str(uuid4())
    }

@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "is_active": True
    }

class ModelTestHelper:
    """Helper class for model testing"""
    
    @staticmethod
    def create_test_task(**overrides):
        """Create test task with optional overrides"""
        default_data = {
            "title": "Test Task",
            "description": "Test description",
            "priority": Priority.MEDIUM,
            "user_id": str(uuid4())
        }
        default_data.update(overrides)
        return Task(**default_data)
    
    @staticmethod
    def create_test_user(**overrides):
        """Create test user with optional overrides"""
        default_data = {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User"
        }
        default_data.update(overrides)
        return User(**default_data)
    
    @staticmethod
    def assert_model_equality(model1, model2, exclude_fields=None):
        """Assert two models are equal, excluding specified fields"""
        exclude_fields = exclude_fields or ["id", "created_at", "updated_at"]
        
        dict1 = model1.dict(exclude=set(exclude_fields))
        dict2 = model2.dict(exclude=set(exclude_fields))
        
        assert dict1 == dict2
```

## Test Configuration

### Model Test Settings
```python
MODEL_TEST_CONFIG = {
    "validation": {
        "max_title_length": 200,
        "max_description_length": 2000,
        "required_fields": ["title", "user_id"]
    },
    "performance": {
        "max_creation_time": 5.0,
        "max_serialization_time": 1.0,
        "max_query_time": 1.0
    },
    "database": {
        "test_url": "sqlite+aiosqlite:///:memory:",
        "echo": False
    }
}
```

## Dependencies

- **pytest**: Testing framework
- **SQLAlchemy**: Database testing
- **Pydantic**: Model validation
- **UUID**: Unique identifier testing
- **DateTime**: Time-based testing
