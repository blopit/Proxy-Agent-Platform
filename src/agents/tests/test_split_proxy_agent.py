"""
Characterization Tests for SplitProxyAgent - Preserve Behavior During Refactoring

These tests capture the CURRENT behavior of SplitProxyAgent before refactoring.
They serve as a safety net to ensure refactoring doesn't break functionality.

Following TDD RED-GREEN-REFACTOR:
1. RED: These tests capture current behavior (should PASS before refactoring)
2. GREEN: Refactor code (tests should STILL PASS after refactoring)
3. REFACTOR: Verify all functionality preserved

Purpose: Allow safe refactoring of:
- split_task() (74 lines → ~25 lines)
- _build_split_prompt() (55 lines → ~30 lines)
- _split_with_rules() (138 lines → 4 methods ~35 lines each)
"""

import pytest

from src.agents.split_proxy_agent import SplitProxyAgent
from src.core.task_models import Task, TaskScope


class TestSplitProxyAgentCharacterization:
    """Characterization tests to preserve existing behavior during refactoring"""

    @pytest.fixture
    def agent(self):
        """Create SplitProxyAgent instance for testing"""
        return SplitProxyAgent()

    @pytest.fixture
    def simple_task(self):
        """Task under 15 minutes - should NOT be split"""
        return Task(
            task_id="simple_1",
            title="Quick Email",
            description="Send quick email to John",
            estimated_hours=0.1,  # 6 minutes
            project_id="proj_1",
            priority="medium",
        )

    @pytest.fixture
    def multi_task(self):
        """Task 15-60 minutes - SHOULD be split into micro-steps"""
        return Task(
            task_id="multi_1",
            title="Implement Login Feature",
            description="Add user authentication with email and password",
            estimated_hours=0.5,  # 30 minutes
            project_id="proj_1",
            priority="high",
        )

    @pytest.fixture
    def project_task(self):
        """Task over 60 minutes - SHOULD suggest phases"""
        return Task(
            task_id="project_1",
            title="Build Mobile App",
            description="Complete mobile application with all features",
            estimated_hours=40.0,  # 2400 minutes
            project_id="proj_1",
            priority="high",
        )

    @pytest.fixture
    def no_estimate_short_task(self):
        """Task with no estimate but short description"""
        return Task(
            task_id="no_est_1",
            title="Call John",
            description="Quick call",
            estimated_hours=None,
            project_id="proj_1",
            priority="low",
        )

    @pytest.fixture
    def no_estimate_long_task(self):
        """Task with no estimate but long description"""
        return Task(
            task_id="no_est_2",
            title="Research New Framework",
            description=(
                "Research and evaluate the new framework including "
                "documentation review, sample projects, performance testing, "
                "security assessment, and team feedback gathering"
            ),
            estimated_hours=None,
            project_id="proj_1",
            priority="medium",
        )

    # ==================== Scope Determination Tests ====================

    def test_simple_scope_returns_no_split(self, agent, simple_task):
        """
        CHARACTERIZATION: Simple tasks (<15 min) should NOT be split.

        Current Behavior:
        - Returns scope: SIMPLE
        - Returns empty micro_steps array
        - Returns message about no splitting needed
        - Returns next_action with the task itself
        """
        result = agent._determine_task_scope(simple_task)
        assert result == TaskScope.SIMPLE

    def test_multi_scope_for_moderate_tasks(self, agent, multi_task):
        """
        CHARACTERIZATION: Multi tasks (15-60 min) should be MULTI scope.

        Current Behavior:
        - Returns scope: MULTI
        - Will trigger micro-step generation
        """
        result = agent._determine_task_scope(multi_task)
        assert result == TaskScope.MULTI

    def test_project_scope_for_large_tasks(self, agent, project_task):
        """
        CHARACTERIZATION: Project tasks (>60 min) should be PROJECT scope.

        Current Behavior:
        - Returns scope: PROJECT
        - Will suggest breaking into subtasks first
        """
        result = agent._determine_task_scope(project_task)
        assert result == TaskScope.PROJECT

    def test_no_estimate_short_description_is_simple(self, agent, no_estimate_short_task):
        """
        CHARACTERIZATION: No estimate + short description (<100 chars) = SIMPLE.

        Current Behavior:
        - Falls back to description length analysis
        - Short description → SIMPLE scope
        """
        result = agent._determine_task_scope(no_estimate_short_task)
        assert result == TaskScope.SIMPLE

    def test_no_estimate_long_description_is_multi(self, agent, no_estimate_long_task):
        """
        CHARACTERIZATION: No estimate + long description (>100 chars) = MULTI.

        Current Behavior:
        - Falls back to description length analysis
        - Long description → MULTI scope
        """
        result = agent._determine_task_scope(no_estimate_long_task)
        assert result == TaskScope.MULTI

    # ==================== split_task() Orchestration Tests ====================

    @pytest.mark.asyncio
    async def test_simple_task_returns_no_micro_steps(self, agent, simple_task):
        """
        CHARACTERIZATION: Simple tasks return empty micro_steps with message.

        Current Behavior:
        - task_id matches input
        - scope is SIMPLE
        - micro_steps is empty list
        - next_action contains the task itself
        - message explains no splitting needed
        """
        result = await agent.split_task(simple_task, "user_123")

        assert result["task_id"] == simple_task.task_id
        assert result["scope"] == TaskScope.SIMPLE
        assert result["micro_steps"] == []
        assert "next_action" in result
        assert result["next_action"]["step_number"] == 1
        assert result["next_action"]["description"] == simple_task.title
        assert result["next_action"]["estimated_minutes"] == 5
        assert "message" in result
        assert "simple" in result["message"].lower()

    @pytest.mark.asyncio
    async def test_project_task_returns_phase_suggestions(self, agent, project_task):
        """
        CHARACTERIZATION: Project tasks return phase suggestions, not micro-steps.

        Current Behavior:
        - task_id matches input
        - scope is PROJECT
        - micro_steps is empty list
        - suggestion text recommends breaking into subtasks
        - estimated_phases contains 4 phases
        """
        result = await agent.split_task(project_task, "user_123")

        assert result["task_id"] == project_task.task_id
        assert result["scope"] == TaskScope.PROJECT
        assert result["micro_steps"] == []
        assert "suggestion" in result
        assert "complex project" in result["suggestion"].lower()
        assert "estimated_phases" in result
        assert len(result["estimated_phases"]) == 4
        assert "Phase 1" in result["estimated_phases"][0]

    @pytest.mark.asyncio
    async def test_multi_task_returns_3_to_5_micro_steps(self, agent, multi_task):
        """
        CHARACTERIZATION: Multi tasks return 3-5 micro-steps.

        Current Behavior:
        - Returns 3-5 micro-steps (ADHD-optimized, not overwhelming)
        - Each step is 2-5 minutes (enforced range)
        - Steps are ordered with step_number starting at 1
        - Total time roughly matches estimate
        """
        result = await agent.split_task(multi_task, "user_123")

        assert result["task_id"] == multi_task.task_id
        assert result["scope"] == TaskScope.MULTI
        assert 3 <= len(result["micro_steps"]) <= 5, "Should have 3-5 steps (ADHD-friendly)"

        # Verify each step structure
        for i, step in enumerate(result["micro_steps"], 1):
            assert step["step_number"] == i, "Steps should be numbered sequentially"
            assert "step_id" in step
            assert "description" in step
            assert "estimated_minutes" in step
            assert 2 <= step["estimated_minutes"] <= 5, "Each step must be 2-5 minutes"
            assert "delegation_mode" in step
            assert step["delegation_mode"] in ["do", "do_with_me", "delegate", "delete"]
            assert "status" in step
            assert "icon" in step  # May be None if AI unavailable
            assert "short_label" in step  # May be None if AI unavailable

    @pytest.mark.asyncio
    async def test_multi_task_has_next_action(self, agent, multi_task):
        """
        CHARACTERIZATION: Multi tasks return next_action (first step).

        Current Behavior:
        - next_action contains first step details
        - step_number is 1
        - description and estimated_minutes match first micro-step
        """
        result = await agent.split_task(multi_task, "user_123")

        assert "next_action" in result
        assert result["next_action"]["step_number"] == 1
        assert "description" in result["next_action"]
        assert "estimated_minutes" in result["next_action"]

        # Should match first micro-step
        first_step = result["micro_steps"][0]
        assert result["next_action"]["description"] == first_step["description"]
        assert result["next_action"]["estimated_minutes"] == first_step["estimated_minutes"]

    @pytest.mark.asyncio
    async def test_multi_task_has_total_estimated_minutes(self, agent, multi_task):
        """
        CHARACTERIZATION: Multi tasks return total_estimated_minutes.

        Current Behavior:
        - Sums all micro-step estimates
        - Should be close to original task estimate
        """
        result = await agent.split_task(multi_task, "user_123")

        assert "total_estimated_minutes" in result
        total = sum(step["estimated_minutes"] for step in result["micro_steps"])
        assert result["total_estimated_minutes"] == total

    # ==================== Rule-Based Splitting Tests ====================

    def test_split_with_rules_email_task(self, agent):
        """
        CHARACTERIZATION: Email tasks get 3 email-specific steps.

        Current Behavior:
        - Detects "email" keyword
        - Returns 3 steps: Setup → Draft → Send
        - All have appropriate icons and short_labels
        - All steps are 2-5 minutes
        """
        email_task = Task(
            task_id="email_1",
            title="Send Email to Client",
            description="Send project update email",
            project_id="proj_1",
        )

        steps = agent._split_with_rules(email_task)

        assert len(steps) == 3
        assert any("email client" in s["description"].lower() for s in steps)
        assert any("draft" in s["description"].lower() for s in steps)
        assert any("send" in s["description"].lower() for s in steps)

        # All steps should have required fields
        for step in steps:
            assert "description" in step
            assert "short_label" in step
            assert "estimated_minutes" in step
            assert 2 <= step["estimated_minutes"] <= 5
            assert "delegation_mode" in step
            assert step["delegation_mode"] == "do"
            assert "icon" in step

    def test_split_with_rules_shopping_task(self, agent):
        """
        CHARACTERIZATION: Shopping tasks get 3 shopping-specific steps.

        Current Behavior:
        - Detects "shop"/"buy"/"grocery" keywords
        - Returns 3 steps: List → Shop → Pay
        """
        shopping_task = Task(
            task_id="shop_1",
            title="Buy Groceries",
            description="Get items for dinner",
            project_id="proj_1",
        )

        steps = agent._split_with_rules(shopping_task)

        assert len(steps) == 3
        assert any("list" in s["description"].lower() for s in steps)
        assert any(
            "shop" in s["description"].lower() or "store" in s["description"].lower() for s in steps
        )
        assert any(
            "pay" in s["description"].lower() or "checkout" in s["description"].lower()
            for s in steps
        )

    def test_split_with_rules_call_task(self, agent):
        """
        CHARACTERIZATION: Call tasks get 3 call-specific steps.

        Current Behavior:
        - Detects "call"/"phone" keywords
        - Returns 3 steps: Find Contact → Call → Notes
        """
        call_task = Task(
            task_id="call_1",
            title="Call Doctor",
            description="Schedule appointment",
            project_id="proj_1",
        )

        steps = agent._split_with_rules(call_task)

        assert len(steps) == 3
        assert any(
            "contact" in s["description"].lower() or "find" in s["description"].lower()
            for s in steps
        )
        assert any("call" in s["description"].lower() for s in steps)
        assert any("notes" in s["description"].lower() for s in steps)

    def test_split_with_rules_generic_task(self, agent):
        """
        CHARACTERIZATION: Generic tasks get 3 generic steps.

        Current Behavior:
        - No specific keywords detected
        - Returns 3 steps: Setup → Work → Review
        """
        generic_task = Task(
            task_id="generic_1",
            title="Complete Report",
            description="Finish quarterly analysis",
            project_id="proj_1",
        )

        steps = agent._split_with_rules(generic_task)

        assert len(steps) == 3
        assert any(
            "setup" in s["description"].lower() or "gather" in s["description"].lower()
            for s in steps
        )
        assert any("work" in s["description"].lower() for s in steps)
        assert any(
            "review" in s["description"].lower() or "finalize" in s["description"].lower()
            for s in steps
        )

    # ==================== Edge Cases ====================

    @pytest.mark.asyncio
    async def test_estimated_minutes_clamped_to_range(self, agent):
        """
        CHARACTERIZATION: AI estimates are clamped to 2-5 minute range.

        Current Behavior:
        - If AI returns <2 minutes, clamped to 2
        - If AI returns >5 minutes, clamped to 5
        - Ensures ADHD optimization (2-5 min sweet spot)
        """
        # This test verifies the clamping logic exists
        # The actual clamping is in _generate_micro_steps_with_ai at lines 204-209
        task = Task(
            task_id="test_clamp",
            title="Test Task",
            description="Testing minute clamping",
            estimated_hours=0.3,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # All steps should be within 2-5 minute range
        for step in result["micro_steps"]:
            assert 2 <= step["estimated_minutes"] <= 5, (
                f"Step '{step['description']}' has {step['estimated_minutes']} minutes, "
                "must be 2-5 for ADHD optimization"
            )

    def test_project_phases_always_returns_4_phases(self, agent, project_task):
        """
        CHARACTERIZATION: Project scope returns exactly 4 phases.

        Current Behavior:
        - Phase 1: Planning & Research
        - Phase 2: Core Implementation
        - Phase 3: Testing & Refinement
        - Phase 4: Completion & Review
        """
        phases = agent._estimate_project_phases(project_task)

        assert len(phases) == 4
        assert "Phase 1" in phases[0] and "Planning" in phases[0]
        assert "Phase 2" in phases[1] and "Implementation" in phases[1]
        assert "Phase 3" in phases[2] and "Testing" in phases[2]
        assert "Phase 4" in phases[3] and "Completion" in phases[3]

    # ==================== Helper Method Behavior ====================

    def test_build_prompt_includes_task_details(self, agent, multi_task):
        """
        CHARACTERIZATION: Prompt includes task title, description, time, priority.

        Current Behavior:
        - Contains task title
        - Contains task description
        - Contains estimated time (from hours or inferred)
        - Contains priority
        - Contains ADHD-optimized requirements
        """
        prompt = agent._build_split_prompt(multi_task)

        assert multi_task.title in prompt
        assert multi_task.description in prompt
        assert multi_task.priority in prompt
        assert "30 minutes" in prompt or "minutes" in prompt.lower()

        # Should contain ADHD requirements
        assert "2-5 minutes" in prompt
        assert "3-5" in prompt  # 3-5 steps
        assert "delegation_mode" in prompt
        assert "short_label" in prompt
        assert "icon" in prompt or "emoji" in prompt

    def test_build_prompt_handles_no_estimate_short_task(self, agent, no_estimate_short_task):
        """
        CHARACTERIZATION: Prompt infers time from description length if no estimate.

        Current Behavior:
        - No estimated_hours provided
        - Description < 5 words
        - Should infer "10-15 minutes (simple task)"
        """
        prompt = agent._build_split_prompt(no_estimate_short_task)

        assert "10-15 minutes" in prompt

    def test_build_prompt_handles_no_estimate_long_task(self, agent, no_estimate_long_task):
        """
        CHARACTERIZATION: Longer description without estimate infers longer time.

        Current Behavior:
        - No estimated_hours provided
        - Description > 15 words
        - Should infer "30-60 minutes (complex task)"
        """
        prompt = agent._build_split_prompt(no_estimate_long_task)

        assert "30-60 minutes" in prompt


class TestSplitProxyAgentFallbackBehavior:
    """Test graceful degradation when AI is unavailable"""

    @pytest.mark.asyncio
    async def test_no_ai_client_uses_rules(self):
        """
        CHARACTERIZATION: Missing AI client falls back to rule-based splitting.

        Current Behavior:
        - If openai_client is None
        - And anthropic_client is None
        - Should use _split_with_rules fallback
        - Should still return valid micro-steps
        """
        agent = SplitProxyAgent()
        agent.openai_client = None
        agent.anthropic_client = None

        task = Task(
            task_id="fallback_1",
            title="Send Email Report",
            description="Send weekly report email",
            estimated_hours=0.3,
            project_id="proj_1",
        )

        result = await agent.split_task(task, "user_123")

        # Should still work via fallback
        assert result["scope"] == TaskScope.MULTI
        assert len(result["micro_steps"]) >= 2
        assert all(2 <= s["estimated_minutes"] <= 5 for s in result["micro_steps"])
