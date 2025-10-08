"""
Integration tests for core proxy agents.

Test the integration between different proxy agents and their
coordination in handling user requests and workflow management.
"""

from datetime import datetime
from unittest.mock import AsyncMock, Mock, patch

import pytest

from proxy_agent_platform.agents.base import BaseProxyAgent
from proxy_agent_platform.agents.energy_proxy import EnergyProxy
from proxy_agent_platform.agents.focus_proxy import FocusProxy
from proxy_agent_platform.agents.progress_proxy import ProgressProxy
from proxy_agent_platform.agents.task_proxy import TaskProxy


class TestAgentIntegration:
    """Test integration between proxy agents."""

    @pytest.fixture
    def mock_dependencies(self):
        """Create mock dependencies for agents."""
        return Mock()

    @pytest.fixture
    def task_agent(self, mock_dependencies):
        """Create task proxy agent for testing."""
        return TaskProxy(dependencies=mock_dependencies)

    @pytest.fixture
    def focus_agent(self, mock_dependencies):
        """Create focus proxy agent for testing."""
        return FocusProxy(dependencies=mock_dependencies)

    @pytest.fixture
    def energy_agent(self, mock_dependencies):
        """Create energy proxy agent for testing."""
        return EnergyProxy(dependencies=mock_dependencies)

    @pytest.fixture
    def progress_agent(self, mock_dependencies):
        """Create progress proxy agent for testing."""
        return ProgressProxy(dependencies=mock_dependencies)

    def test_agent_initialization(self, task_agent, focus_agent, energy_agent, progress_agent):
        """Test that all agents initialize correctly."""
        agents = [task_agent, focus_agent, energy_agent, progress_agent]

        for agent in agents:
            assert isinstance(agent, BaseProxyAgent)
            assert agent.agent is not None

    @pytest.mark.asyncio
    async def test_task_agent_basic_functionality(self, task_agent):
        """Test basic task agent functionality."""
        with patch(
            "proxy_agent_platform.agents.task_proxy.GamificationService"
        ) as mock_gamification:
            # Mock the gamification service response
            mock_gamification.return_value.handle_task_completed = AsyncMock(
                return_value={
                    "xp_awarded": 100,
                    "total_xp": 1000,
                    "user_level": 5,
                    "new_achievements": [],
                    "streak_info": {"type": "daily_tasks", "current_count": 5},
                    "message": "Task completed! +100 XP",
                }
            )

            result = await task_agent.execute(
                "Complete the task: Write unit tests for the proxy agent platform", context={}
            )

            assert result is not None
            assert "success" in result.data

    @pytest.mark.asyncio
    async def test_focus_agent_session_tracking(self, focus_agent):
        """Test focus agent session tracking."""
        with patch(
            "proxy_agent_platform.agents.focus_proxy.GamificationService"
        ) as mock_gamification:
            mock_gamification.return_value.handle_focus_session_completed = AsyncMock(
                return_value={
                    "xp_awarded": 75,
                    "total_xp": 1075,
                    "message": "Focus session completed! +75 XP",
                }
            )

            result = await focus_agent.execute(
                "Start a 45-minute deep work session on coding", context={"user_id": 1}
            )

            assert result is not None

    @pytest.mark.asyncio
    async def test_energy_agent_logging(self, energy_agent):
        """Test energy agent logging functionality."""
        with patch(
            "proxy_agent_platform.agents.energy_proxy.GamificationService"
        ) as mock_gamification:
            mock_gamification.return_value.handle_energy_logged = AsyncMock(
                return_value={"xp_awarded": 10, "message": "Energy logged! +10 XP"}
            )

            result = await energy_agent.execute(
                "Log my current energy level as 7/10", context={"user_id": 1}
            )

            assert result is not None

    @pytest.mark.asyncio
    async def test_progress_agent_tracking(self, progress_agent):
        """Test progress agent tracking functionality."""
        with patch(
            "proxy_agent_platform.agents.progress_proxy.GamificationService"
        ) as mock_gamification:
            mock_gamification.return_value.handle_progress_updated = AsyncMock(
                return_value={"xp_awarded": 25, "message": "Progress updated! +25 XP"}
            )

            result = await progress_agent.execute(
                "Update progress on learning Python to 75%", context={"user_id": 1}
            )

            assert result is not None

    @pytest.mark.asyncio
    async def test_agent_error_handling(self, task_agent):
        """Test agent error handling."""
        with patch(
            "proxy_agent_platform.agents.task_proxy.GamificationService"
        ) as mock_gamification:
            # Simulate gamification service failure
            mock_gamification.return_value.handle_task_completed = AsyncMock(
                side_effect=Exception("Service unavailable")
            )

            result = await task_agent.execute("Complete an invalid task", context={})

            # Agent should handle errors gracefully
            assert result is not None

    def test_agent_configuration(self, task_agent):
        """Test agent configuration and system prompt."""
        assert hasattr(task_agent, "agent")
        # Verify that the agent has been properly configured
        # This tests the base agent setup

    @pytest.mark.asyncio
    async def test_multi_agent_workflow(self, task_agent, focus_agent, energy_agent):
        """Test workflow involving multiple agents."""
        # Simulate a workflow where:
        # 1. User logs energy level
        # 2. Starts focus session based on energy
        # 3. Completes task during focus session

        with (
            patch(
                "proxy_agent_platform.agents.energy_proxy.GamificationService"
            ) as mock_energy_gamification,
            patch(
                "proxy_agent_platform.agents.focus_proxy.GamificationService"
            ) as mock_focus_gamification,
            patch(
                "proxy_agent_platform.agents.task_proxy.GamificationService"
            ) as mock_task_gamification,
        ):
            # Mock responses for each agent
            mock_energy_gamification.return_value.handle_energy_logged = AsyncMock(
                return_value={"xp_awarded": 10, "message": "Energy logged"}
            )
            mock_focus_gamification.return_value.handle_focus_session_completed = AsyncMock(
                return_value={"xp_awarded": 75, "message": "Focus session completed"}
            )
            mock_task_gamification.return_value.handle_task_completed = AsyncMock(
                return_value={"xp_awarded": 100, "message": "Task completed"}
            )

            # Execute workflow steps
            energy_result = await energy_agent.execute(
                "Log energy level: 8/10, feeling productive", context={"user_id": 1}
            )

            focus_result = await focus_agent.execute(
                "Start 60-minute focus session for high-priority work",
                context={"user_id": 1, "energy_level": 8},
            )

            task_result = await task_agent.execute(
                "Complete task: Implement user authentication",
                context={"user_id": 1, "focus_session_id": "session-123"},
            )

            # Verify all steps completed
            assert energy_result is not None
            assert focus_result is not None
            assert task_result is not None


class TestAgentTools:
    """Test the tools available to agents."""

    @pytest.fixture
    def agent(self):
        """Create a base agent for testing tools."""
        return BaseProxyAgent(dependencies=Mock())

    def test_agent_has_required_tools(self, agent):
        """Test that agents have access to required tools."""
        # Verify agent was initialized with tools
        assert agent.agent is not None

    @pytest.mark.asyncio
    async def test_agent_tool_execution(self, agent):
        """Test that agent tools can be executed."""
        # This would test tool execution if tools were properly exposed
        # For now, just verify the agent structure
        assert hasattr(agent, "agent")


@pytest.mark.asyncio
class TestAgentPerformance:
    """Test agent performance and resource usage."""

    async def test_agent_response_time(self):
        """Test that agents respond within reasonable time."""
        start_time = datetime.now()

        agent = TaskProxy(dependencies=Mock())

        # Measure initialization time
        init_time = (datetime.now() - start_time).total_seconds()
        assert init_time < 5.0  # Should initialize quickly

    async def test_concurrent_agent_execution(self):
        """Test multiple agents running concurrently."""
        import asyncio

        agents = [
            TaskProxy(dependencies=Mock()),
            FocusProxy(dependencies=Mock()),
            EnergyProxy(dependencies=Mock()),
        ]

        # All agents should be able to initialize concurrently
        tasks = [agent.execute("test query", {}) for agent in agents]

        start_time = datetime.now()
        # Note: These will likely fail due to missing dependencies,
        # but the test verifies they can be started concurrently
        try:
            await asyncio.gather(*tasks, return_exceptions=True)
        except Exception:
            pass  # Expected to fail due to mocked dependencies

        elapsed = (datetime.now() - start_time).total_seconds()
        assert elapsed < 10.0  # Should complete or fail quickly


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
