"""
Test-Driven Development tests for Task Agent.

This module demonstrates TDD by writing tests first, then implementing features.
"""

import os

# Import the agent we'll test
import sys
from unittest.mock import AsyncMock, Mock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))

from agents.base_agent import AgentResponse

from agents.task_agent import TaskAgent
from database import Task, TaskPriority, TaskStatus, User


class TestTaskAgent:
    """TDD tests for Task Agent functionality."""

    @pytest.fixture
    async def mock_db(self):
        """Mock database session for testing."""
        return AsyncMock(spec=AsyncSession)

    @pytest.fixture
    def task_agent(self):
        """Task agent instance for testing."""
        return TaskAgent()

    @pytest.fixture
    def sample_user(self):
        """Sample user for testing."""
        return User(
            id=1,
            username="testuser",
            email="test@example.com",
            total_xp=100,
            current_level=1,
            current_streak=3
        )

    @pytest.fixture
    def sample_task(self):
        """Sample task for testing."""
        return Task(
            id=1,
            user_id=1,
            title="Test Task",
            description="A test task",
            status=TaskStatus.PENDING,
            priority=TaskPriority.MEDIUM,
            estimated_duration=30,
            xp_reward=50
        )

    # Test 1: Task Creation (TDD)
    @pytest.mark.asyncio
    async def test_create_task_success(self, task_agent, mock_db, sample_user):
        """
        Test: Should successfully create a task with AI analysis.

        This test drives the implementation of task creation functionality.
        """
        # Arrange
        mock_db.get.return_value = sample_user
        mock_db.add = Mock()
        mock_db.commit = AsyncMock()
        mock_db.refresh = AsyncMock()

        # Mock AI agent response
        task_agent.agent.run = AsyncMock(return_value=AgentResponse(
            success=True,
            message="Task analyzed",
            data={
                "estimated_duration": 45,
                "priority_score": 7.5,
                "tags": ["productivity", "important"],
                "suggestions": ["Break into smaller tasks"]
            }
        ))

        request = {
            "action": "create",
            "task_data": {
                "title": "Write documentation",
                "description": "Write API documentation",
                "priority": "high"
            }
        }

        # Act
        result = await task_agent.process_request(mock_db, 1, request)

        # Assert
        assert result.success is True
        assert "Write documentation" in result.message
        assert result.data is not None
        assert "estimated_duration" in result.data
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    # Test 2: Task Completion (TDD)
    @pytest.mark.asyncio
    async def test_complete_task_success(self, task_agent, mock_db, sample_task):
        """
        Test: Should successfully complete a task and award XP.

        This test drives the implementation of task completion.
        """
        # Arrange
        mock_db.get.return_value = sample_task
        mock_db.commit = AsyncMock()

        # Mock XP awarding
        task_agent.award_xp = AsyncMock()
        task_agent.log_activity = AsyncMock()

        request = {
            "action": "complete",
            "task_id": 1,
            "task_data": {"actual_duration": 25}
        }

        # Act
        result = await task_agent.process_request(mock_db, 1, request)

        # Assert
        assert result.success is True
        assert "Congratulations" in result.message
        assert result.xp_earned == 50
        assert sample_task.status == TaskStatus.COMPLETED
        assert sample_task.actual_duration == 25
        task_agent.award_xp.assert_called_once_with(mock_db, 1, 50, "Completed task: Test Task")

    # Test 3: Task Prioritization (TDD)
    @pytest.mark.asyncio
    async def test_prioritize_tasks_with_ai_analysis(self, task_agent, mock_db):
        """
        Test: Should prioritize multiple tasks using AI analysis.

        This test drives AI-powered task prioritization.
        """
        # Arrange
        mock_tasks = [
            Task(id=1, title="Urgent bug fix", priority=TaskPriority.HIGH, user_id=1),
            Task(id=2, title="Code review", priority=TaskPriority.MEDIUM, user_id=1),
            Task(id=3, title="Documentation", priority=TaskPriority.LOW, user_id=1)
        ]

        # Mock database query
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = mock_tasks
        mock_db.execute = AsyncMock(return_value=mock_result)

        # Mock AI prioritization
        task_agent.agent.run = AsyncMock(return_value=AgentResponse(
            success=True,
            message="Tasks prioritized",
            data={
                "prioritized_order": [1, 2, 3],
                "reasoning": "Bug fixes first, then code review"
            },
            suggestions=["Focus on urgent items first"]
        ))

        task_agent.log_activity = AsyncMock()

        request = {"action": "prioritize"}

        # Act
        result = await task_agent.process_request(mock_db, 1, request)

        # Assert
        assert result.success is True
        assert "Prioritized 3 tasks" in result.message
        assert result.data["task_count"] == 3
        assert result.suggestions is not None

    # Test 4: Error Handling (TDD)
    @pytest.mark.asyncio
    async def test_complete_nonexistent_task_fails(self, task_agent, mock_db):
        """
        Test: Should fail gracefully when trying to complete non-existent task.

        This test drives error handling implementation.
        """
        # Arrange
        mock_db.get.return_value = None

        request = {"action": "complete", "task_id": 999}

        # Act
        result = await task_agent.process_request(mock_db, 1, request)

        # Assert
        assert result.success is False
        assert "Task not found" in result.message

    # Test 5: AI Recommendations (TDD)
    @pytest.mark.asyncio
    async def test_get_task_recommendations(self, task_agent, mock_db):
        """
        Test: Should provide AI-generated task recommendations.

        This test drives recommendation system implementation.
        """
        # Arrange
        task_agent._get_task_context = AsyncMock(return_value={
            "pending_tasks_count": 2,
            "completed_tasks_count": 5,
            "completion_rate": 0.7
        })

        task_agent.agent.run = AsyncMock(return_value=AgentResponse(
            success=True,
            message="Recommendations generated",
            data={
                "recommendations": [
                    {
                        "title": "Review quarterly goals",
                        "description": "Time for quarterly review",
                        "estimated_duration": 60,
                        "priority": "high"
                    }
                ]
            }
        ))

        request = {"action": "recommend"}

        # Act
        result = await task_agent.process_request(mock_db, 1, request)

        # Assert
        assert result.success is True
        assert "recommendations" in result.data
        assert len(result.data["recommendations"]) > 0

    # Test 6: System Prompt Validation (TDD)
    def test_task_agent_system_prompt(self, task_agent):
        """
        Test: Should have a comprehensive system prompt for AI.

        This test ensures the agent has proper AI instructions.
        """
        # Act
        prompt = task_agent._get_system_prompt()

        # Assert
        assert "Task Agent" in prompt
        assert "productivity" in prompt.lower()
        assert "GTD" in prompt  # Getting Things Done methodology
        assert "Eisenhower Matrix" in prompt
        assert "priority" in prompt.lower()

    # Test 7: Capabilities Documentation (TDD)
    def test_task_agent_capabilities(self, task_agent):
        """
        Test: Should document all agent capabilities.

        This test drives capability documentation.
        """
        # Act
        capabilities = task_agent._get_capabilities()

        # Assert
        assert isinstance(capabilities, list)
        assert len(capabilities) > 0
        assert any("create" in cap.lower() for cap in capabilities)
        assert any("prioritize" in cap.lower() for cap in capabilities)
        assert any("organize" in cap.lower() for cap in capabilities)


# Integration Tests (TDD)
class TestTaskAgentIntegration:
    """Integration tests for Task Agent with real components."""

    @pytest.mark.asyncio
    async def test_full_task_workflow(self):
        """
        Test: Complete workflow from creation to completion.

        This integration test drives end-to-end functionality.
        """
        # This test would use a real database and test the full workflow
        # For now, it serves as a placeholder for future integration testing
        pass

    @pytest.mark.asyncio
    async def test_agent_manager_integration(self):
        """
        Test: Task agent integration with agent manager.

        This test drives multi-agent coordination.
        """
        # This test would verify the agent works with the manager
        pass


# Performance Tests (TDD)
class TestTaskAgentPerformance:
    """Performance tests for Task Agent."""

    @pytest.mark.asyncio
    async def test_bulk_task_processing(self):
        """
        Test: Should handle bulk task operations efficiently.

        This test drives performance optimization.
        """
        # This test would verify the agent can handle many tasks efficiently
        pass


if __name__ == "__main__":
    # Run tests with: python -m pytest tests/test_task_agent.py -v
    pytest.main([__file__, "-v"])
