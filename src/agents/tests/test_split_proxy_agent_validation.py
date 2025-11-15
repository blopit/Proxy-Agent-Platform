"""
Input Validation Tests for SplitProxyAgent

Tests edge cases, malformed inputs, and boundary conditions.
Ensures robust error handling for invalid data.
"""

import pytest

from src.agents.split_proxy_agent import SplitProxyAgent
from src.core.task_models import Task, TaskScope


class TestSplitProxyAgentValidation:
    """Test input validation and edge cases"""

    @pytest.fixture
    def agent(self):
        """Create SplitProxyAgent instance"""
        return SplitProxyAgent()

    @pytest.mark.asyncio
    async def test_empty_title_rejected_by_pydantic(self, agent):
        """
        VALIDATION: Empty title is rejected by Pydantic validation.

        Edge case: Task with empty title fails at model layer (expected).
        """
        from pydantic import ValidationError

        with pytest.raises(ValidationError) as exc_info:
            Task(
                task_id="empty_title_1",
                title="",
                description="Has description but no title",
                estimated_hours=0.3,
                project_id="proj_1",
            )

        # Pydantic correctly rejects empty title
        assert "title" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_empty_description_handles_gracefully(self, agent):
        """
        VALIDATION: Empty description should not crash.

        Edge case: Task with no description.
        """
        task = Task(
            task_id="empty_desc_1",
            title="Task with no description",
            description="",
            estimated_hours=0.3,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # Should fall back to simple scope or use title
        assert result["scope"] in [TaskScope.SIMPLE, TaskScope.MULTI]

    @pytest.mark.asyncio
    async def test_very_long_description_handles(self, agent):
        """
        VALIDATION: Very long description (>1000 chars) should not crash.

        Edge case: Tasks with extensive descriptions.
        """
        task = Task(
            task_id="long_desc_1",
            title="Complex Task",
            description="A" * 2000,  # 2000 character description
            estimated_hours=0.5,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # Should handle without crashing
        assert "micro_steps" in result

    @pytest.mark.asyncio
    async def test_zero_estimated_hours_infers_from_description(self, agent):
        """
        VALIDATION: Zero estimated hours should infer time from description.

        When hours=0, should fall back to description-based estimation.
        """
        task = Task(
            task_id="zero_hours_1",
            title="Task with zero hours",
            description="Short task",
            estimated_hours=0.0,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # Should classify as simple (short description)
        assert result["scope"] == TaskScope.SIMPLE

    @pytest.mark.asyncio
    async def test_negative_estimated_hours_rejected_by_pydantic(self, agent):
        """
        VALIDATION: Negative hours are rejected by Pydantic validation.

        Invalid input: hours=-1 fails at model layer (expected).
        """
        from pydantic import ValidationError

        with pytest.raises(ValidationError) as exc_info:
            Task(
                task_id="neg_hours_1",
                title="Implement feature",
                description="Long description with many details about implementation",
                estimated_hours=-1.0,
                project_id="proj_1",
            )

        # Pydantic correctly rejects negative hours
        assert "estimated_hours" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_extremely_small_task_0_01_hours(self, agent):
        """
        VALIDATION: Extremely small task (0.01 hours = 36 seconds) is SIMPLE.

        Boundary case: Tasks under 1 minute should not be split.
        """
        task = Task(
            task_id="tiny_1",
            title="Quick check",
            description="Check email",
            estimated_hours=0.01,  # 36 seconds
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        assert result["scope"] == TaskScope.SIMPLE
        assert result["micro_steps"] == []

    @pytest.mark.asyncio
    async def test_boundary_task_exactly_15_minutes(self, agent):
        """
        VALIDATION: Task exactly 15 minutes is MULTI (not SIMPLE).

        Boundary test: 0.25 hours (15 min) is the threshold.
        Spec: SIMPLE is <15 min, MULTI is 15-60 min.
        """
        task = Task(
            task_id="boundary_15_1",
            title="15 minute task",
            description="Task at boundary",
            estimated_hours=0.25,  # Exactly 15 minutes
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # According to spec: SIMPLE = <15 min, so 15 min exactly is MULTI
        assert result["scope"] == TaskScope.MULTI

    @pytest.mark.asyncio
    async def test_boundary_task_exactly_60_minutes(self, agent):
        """
        VALIDATION: Task exactly 60 minutes is MULTI (not PROJECT).

        Boundary test: 1.0 hours (60 min) is the threshold.
        """
        task = Task(
            task_id="boundary_60_1",
            title="60 minute task",
            description="Task at upper boundary",
            estimated_hours=1.0,  # Exactly 60 minutes
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # According to spec: >60 min = PROJECT, so 60 min exactly should be MULTI
        assert result["scope"] == TaskScope.MULTI

    @pytest.mark.asyncio
    async def test_extremely_large_task_1000_hours(self, agent):
        """
        VALIDATION: Extremely large task (1000 hours) is PROJECT.

        Edge case: Very large projects should get phase suggestions.
        """
        task = Task(
            task_id="huge_1",
            title="Build Enterprise System",
            description="Complete enterprise software",
            estimated_hours=1000.0,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        assert result["scope"] == TaskScope.PROJECT
        assert "estimated_phases" in result
        assert len(result["estimated_phases"]) == 4

    @pytest.mark.asyncio
    async def test_special_characters_in_title(self, agent):
        """
        VALIDATION: Special characters in title should not break splitting.

        Edge case: Unicode, emojis, special chars.
        """
        task = Task(
            task_id="special_1",
            title="Fix bug 🐛 with SQL injection '\"<>&",
            description="Handle special characters properly",
            estimated_hours=0.3,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # Should handle without crashing
        assert "micro_steps" in result
        for step in result.get("micro_steps", []):
            assert "description" in step

    @pytest.mark.asyncio
    async def test_unicode_description(self, agent):
        """
        VALIDATION: Unicode characters in description should work.

        Edge case: International characters, emojis.
        """
        task = Task(
            task_id="unicode_1",
            title="Internationalization",
            description="支持中文、日本語、한국어、العربية、עברית",
            estimated_hours=0.5,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        assert result["scope"] == TaskScope.MULTI
        assert len(result["micro_steps"]) >= 2

    @pytest.mark.asyncio
    async def test_none_user_id_handles_gracefully(self, agent):
        """
        VALIDATION: None user_id should not crash.

        Edge case: Missing user context.
        """
        task = Task(
            task_id="no_user_1",
            title="Task without user",
            description="Test missing user context",
            estimated_hours=0.3,
            project_id="proj_1",
        )

        result = await agent.split_task(task, None)

        # Should still work (user_id may not be used in splitting logic)
        assert "micro_steps" in result

    @pytest.mark.asyncio
    async def test_whitespace_only_description(self, agent):
        """
        VALIDATION: Whitespace-only description should not crash.

        Edge case: Description with only spaces/tabs/newlines.
        """
        task = Task(
            task_id="whitespace_1",
            title="Task with whitespace",
            description="   \n\t   ",
            estimated_hours=0.3,  # 18 minutes
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # Has estimate (18 min), so scope is MULTI (description content irrelevant)
        assert result["scope"] == TaskScope.MULTI

    @pytest.mark.asyncio
    async def test_task_with_all_keywords_combined(self, agent):
        """
        VALIDATION: Task with multiple keywords (email+call+shop) prioritizes correctly.

        Edge case: Task matches multiple rule patterns.
        """
        task = Task(
            task_id="multi_keyword_1",
            title="Email client about shopping for phone",
            description="Send email and call about shopping",
            estimated_hours=0.3,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # Should still return valid micro-steps (may pick one pattern)
        assert len(result["micro_steps"]) >= 2
        for step in result["micro_steps"]:
            assert 2 <= step["estimated_minutes"] <= 5
