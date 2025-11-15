"""
AI Error Handling Tests for SplitProxyAgent

Tests graceful degradation when AI providers fail.
Ensures rule-based fallback works reliably.
"""

from unittest.mock import AsyncMock, patch

import pytest

from src.agents.split_proxy_agent import SplitProxyAgent
from src.core.task_models import Task, TaskScope


class TestSplitProxyAgentAIErrors:
    """Test AI error handling and fallback mechanisms"""

    @pytest.fixture
    def agent(self):
        """Create SplitProxyAgent instance"""
        return SplitProxyAgent()

    @pytest.fixture
    def multi_task(self):
        """Standard task requiring AI splitting"""
        return Task(
            task_id="ai_err_1",
            title="Implement Feature",
            description="Add new feature with tests",
            estimated_hours=0.5,
            project_id="proj_1",
        )

    @pytest.mark.asyncio
    async def test_openai_timeout_falls_back_to_rules(self, agent, multi_task):
        """
        AI ERROR: OpenAI timeout triggers rule-based fallback.

        When AI times out, must return valid micro-steps via rules.
        """
        # Mock OpenAI to timeout
        if agent.openai_client:
            with patch.object(
                agent.openai_client.chat.completions,
                "create",
                side_effect=TimeoutError("Request timeout"),
            ):
                result = await agent.split_task(multi_task, "user_123")

                # Should still return valid result
                assert result["scope"] == TaskScope.MULTI
                assert len(result["micro_steps"]) >= 2
                assert "next_action" in result

    @pytest.mark.asyncio
    async def test_openai_rate_limit_falls_back_to_rules(self, agent, multi_task):
        """
        AI ERROR: OpenAI rate limit (429) triggers fallback.

        When rate limited, must gracefully fall back to rules.
        """
        if agent.openai_client:
            # Mock 429 rate limit error
            mock_error = Exception("Rate limit exceeded")
            mock_error.status_code = 429

            with patch.object(
                agent.openai_client.chat.completions, "create", side_effect=mock_error
            ):
                result = await agent.split_task(multi_task, "user_123")

                assert len(result["micro_steps"]) >= 2
                # Should use rule-based splitting
                for step in result["micro_steps"]:
                    assert 2 <= step["estimated_minutes"] <= 5

    @pytest.mark.asyncio
    async def test_openai_invalid_json_falls_back(self, agent, multi_task):
        """
        AI ERROR: Invalid JSON response triggers fallback.

        AI sometimes returns malformed JSON. Must handle gracefully.
        """
        if agent.openai_client:
            # Mock invalid JSON response
            mock_response = AsyncMock()
            mock_response.choices = [
                AsyncMock(message=AsyncMock(content="This is not JSON at all!"))
            ]

            with patch.object(
                agent.openai_client.chat.completions,
                "create",
                return_value=mock_response,
            ):
                result = await agent.split_task(multi_task, "user_123")

                # Should fall back to rules
                assert len(result["micro_steps"]) >= 2
                assert all("description" in step for step in result["micro_steps"])

    @pytest.mark.asyncio
    async def test_anthropic_api_error_falls_back(self, agent, multi_task):
        """
        AI ERROR: Anthropic API error triggers fallback.

        When Anthropic fails, must use rule-based splitting.
        """
        if agent.anthropic_client:
            with patch.object(
                agent.anthropic_client.messages,
                "create",
                side_effect=Exception("API Error"),
            ):
                result = await agent.split_task(multi_task, "user_123")

                assert len(result["micro_steps"]) >= 2
                assert result["scope"] == TaskScope.MULTI

    @pytest.mark.asyncio
    async def test_no_ai_client_uses_rules(self, multi_task):
        """
        AI ERROR: No AI client configured uses rule-based splitting.

        When no API keys configured, must work via rules.
        """
        # Create agent with no AI clients
        agent = SplitProxyAgent()
        agent.openai_client = None
        agent.anthropic_client = None

        result = await agent.split_task(multi_task, "user_123")

        # Should still work
        assert result["scope"] == TaskScope.MULTI
        assert len(result["micro_steps"]) >= 2
        assert all(2 <= s["estimated_minutes"] <= 5 for s in result["micro_steps"])

    @pytest.mark.asyncio
    async def test_ai_returns_too_many_steps_clamps_to_5(self, agent, multi_task):
        """
        AI ERROR: AI returns >5 steps, must clamp to 5 (ADHD optimization).

        AI sometimes ignores constraints. Must enforce 3-5 step limit.
        """
        if agent.openai_client:
            # Mock AI returning 10 steps
            mock_response = AsyncMock()
            mock_response.choices = [
                AsyncMock(
                    message=AsyncMock(
                        content="""[
                    {"description": "Step 1", "estimated_minutes": 3, "delegation_mode": "do"},
                    {"description": "Step 2", "estimated_minutes": 3, "delegation_mode": "do"},
                    {"description": "Step 3", "estimated_minutes": 3, "delegation_mode": "do"},
                    {"description": "Step 4", "estimated_minutes": 3, "delegation_mode": "do"},
                    {"description": "Step 5", "estimated_minutes": 3, "delegation_mode": "do"},
                    {"description": "Step 6", "estimated_minutes": 3, "delegation_mode": "do"},
                    {"description": "Step 7", "estimated_minutes": 3, "delegation_mode": "do"},
                    {"description": "Step 8", "estimated_minutes": 3, "delegation_mode": "do"}
                ]"""
                    )
                )
            ]

            with patch.object(
                agent.openai_client.chat.completions,
                "create",
                return_value=mock_response,
            ):
                result = await agent.split_task(multi_task, "user_123")

                # Should clamp to max 5 steps (ADHD-optimized)
                assert len(result["micro_steps"]) <= 5

    @pytest.mark.asyncio
    async def test_ai_returns_invalid_minutes_clamps_to_range(self, agent, multi_task):
        """
        AI ERROR: AI returns minutes outside 2-5 range, must clamp.

        AI sometimes returns 1 min or 10 min. Must enforce 2-5 min range.
        """
        if agent.openai_client:
            # Mock AI returning invalid estimates
            mock_response = AsyncMock()
            mock_response.choices = [
                AsyncMock(
                    message=AsyncMock(
                        content="""[
                    {"description": "Too short", "estimated_minutes": 1, "delegation_mode": "do"},
                    {"description": "Too long", "estimated_minutes": 15, "delegation_mode": "do"},
                    {"description": "Valid", "estimated_minutes": 3, "delegation_mode": "do"}
                ]"""
                    )
                )
            ]

            with patch.object(
                agent.openai_client.chat.completions,
                "create",
                return_value=mock_response,
            ):
                result = await agent.split_task(multi_task, "user_123")

                # All steps should be clamped to 2-5 minute range
                for step in result["micro_steps"]:
                    assert 2 <= step["estimated_minutes"] <= 5, (
                        f"Step '{step['description']}' has {step['estimated_minutes']} "
                        "minutes, must be 2-5"
                    )

    @pytest.mark.asyncio
    async def test_ai_missing_required_fields_fills_defaults(self, agent, multi_task):
        """
        AI ERROR: AI omits required fields, must fill with defaults.

        When AI response is incomplete, fill missing fields gracefully.
        """
        if agent.openai_client:
            # Mock AI missing delegation_mode
            mock_response = AsyncMock()
            mock_response.choices = [
                AsyncMock(
                    message=AsyncMock(
                        content="""[
                    {"description": "Missing delegation mode", "estimated_minutes": 3}
                ]"""
                    )
                )
            ]

            with patch.object(
                agent.openai_client.chat.completions,
                "create",
                return_value=mock_response,
            ):
                result = await agent.split_task(multi_task, "user_123")

                # Should fill missing fields with defaults
                for step in result["micro_steps"]:
                    assert "delegation_mode" in step
                    assert step["delegation_mode"] in [
                        "do",
                        "do_with_me",
                        "delegate",
                        "delete",
                    ]
