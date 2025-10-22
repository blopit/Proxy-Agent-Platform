"""
Real LLM Integration Tests for Capture Service

Tests with actual OpenAI API calls using gpt-4o-mini for cost-effective testing.
Mark with @pytest.mark.integration and skip by default.
"""

import os

import pytest

from src.knowledge.graph_service import GraphService
from src.knowledge.models import Entity, EntityType, KGContext, Relationship, RelationshipType
from src.services.llm_capture_service import LLMCaptureService

# Skip these tests unless explicitly requested
pytestmark = pytest.mark.skipif(
    not os.getenv("RUN_INTEGRATION_TESTS"),
    reason="Integration tests disabled. Set RUN_INTEGRATION_TESTS=1 to enable.",
)


@pytest.fixture
def llm_service():
    """Provide LLMCaptureService with real API key"""
    # Verify API key is set
    if not os.getenv("OPENAI_API_KEY"):
        pytest.skip("OPENAI_API_KEY not set")
    return LLMCaptureService()


@pytest.fixture
def kg_context():
    """Provide realistic Knowledge Graph context"""
    context = KGContext()

    # Add devices
    ac_device = Entity(
        entity_id="device-1",
        entity_type=EntityType.DEVICE,
        name="AC",
        user_id="alice",
        metadata={"type": "air_conditioner", "location": "living_room"},
    )

    lights_device = Entity(
        entity_id="device-2",
        entity_type=EntityType.DEVICE,
        name="bedroom lights",
        user_id="alice",
        metadata={"type": "smart_lights", "location": "bedroom"},
    )

    # Add people
    sara_person = Entity(
        entity_id="person-1",
        entity_type=EntityType.PERSON,
        name="Sara",
        user_id="alice",
        metadata={"role": "colleague", "email": "sara@company.com"},
    )

    bob_person = Entity(
        entity_id="person-2",
        entity_type=EntityType.PERSON,
        name="Bob",
        user_id="alice",
        metadata={"role": "boss", "email": "bob@company.com"},
    )

    # Add entities to context
    context.add_entity(ac_device)
    context.add_entity(lights_device)
    context.add_entity(sara_person)
    context.add_entity(bob_person)

    # Add facts
    context.add_fact("Alice owns device: AC (air_conditioner in living_room)")
    context.add_fact("Alice owns device: bedroom lights (smart_lights)")
    context.add_fact("Alice works with: Sara (colleague, sara@company.com)")
    context.add_fact("Alice works for: Bob (boss, bob@company.com)")

    return context


class TestRealLLMIntegration:
    """Integration tests with real OpenAI API calls"""

    @pytest.mark.asyncio
    async def test_simple_task_parsing(self, llm_service):
        """Test parsing a simple task without KG context"""
        result = await llm_service.parse(
            "call mom tomorrow at 3pm", user_id="alice", provider="openai"
        )

        # Verify structure
        assert result.task.title is not None
        assert len(result.task.title) > 0
        assert result.task.description == "call mom tomorrow at 3pm"
        assert result.task.priority in ["critical", "high", "medium", "low"]
        assert 0.0 <= result.task.estimated_hours <= 100.0
        assert result.task.confidence >= 0.5  # Should be confident on simple task
        assert result.tokens_used > 0
        assert result.provider == "openai"

        # Verify reasoning exists
        assert len(result.reasoning) > 0

        print(f"\n✅ Simple task parsing:")
        print(f"   Title: {result.task.title}")
        print(f"   Priority: {result.task.priority}")
        print(f"   Estimated hours: {result.task.estimated_hours}")
        print(f"   Confidence: {result.task.confidence}")
        print(f"   Tokens: {result.tokens_used}")

    @pytest.mark.asyncio
    async def test_digital_task_classification(self, llm_service):
        """Test that LLM correctly identifies digital tasks"""
        result = await llm_service.parse(
            "email john about the project update", user_id="alice", provider="openai"
        )

        # Should classify as digital/automatable
        assert result.task.is_digital is True
        assert result.task.automation_type == "email"

        print(f"\n✅ Digital task classification:")
        print(f"   Title: {result.task.title}")
        print(f"   Is digital: {result.task.is_digital}")
        print(f"   Automation type: {result.task.automation_type}")
        print(f"   Reasoning: {result.reasoning}")

    @pytest.mark.asyncio
    async def test_human_task_classification(self, llm_service):
        """Test that LLM correctly identifies human-only tasks"""
        result = await llm_service.parse(
            "pick up groceries from the store", user_id="alice", provider="openai"
        )

        # Should classify as human task
        assert result.task.is_digital is False
        assert result.task.automation_type is None

        print(f"\n✅ Human task classification:")
        print(f"   Title: {result.task.title}")
        print(f"   Is digital: {result.task.is_digital}")
        print(f"   Reasoning: {result.reasoning}")

    @pytest.mark.asyncio
    async def test_kg_context_integration(self, llm_service, kg_context):
        """Test that LLM uses KG context to enhance parsing"""
        result = await llm_service.parse(
            "turn off the AC",
            user_id="alice",
            kg_context=kg_context,
            provider="openai",
        )

        # Verify KG was used
        assert result.used_kg_context is True

        # Should identify AC entity
        assert "AC" in result.task.entities or "ac" in [
            e.lower() for e in result.task.entities
        ]

        # Should classify as digital (home IoT)
        assert result.task.is_digital is True
        assert result.task.automation_type == "home_iot"

        print(f"\n✅ KG context integration:")
        print(f"   Title: {result.task.title}")
        print(f"   Entities: {result.task.entities}")
        print(f"   Automation: {result.task.automation_type}")
        print(f"   Used KG: {result.used_kg_context}")
        print(f"   Reasoning: {result.reasoning}")

    @pytest.mark.asyncio
    async def test_email_with_kg_context(self, llm_service, kg_context):
        """Test email task uses KG to identify recipient"""
        result = await llm_service.parse(
            "email sara about the meeting",
            user_id="alice",
            kg_context=kg_context,
            provider="openai",
        )

        # Should identify Sara from KG
        assert "Sara" in result.task.entities or "sara" in [
            e.lower() for e in result.task.entities
        ]

        # Should be email task
        assert result.task.is_digital is True
        assert result.task.automation_type == "email"

        print(f"\n✅ Email with KG context:")
        print(f"   Title: {result.task.title}")
        print(f"   Entities: {result.task.entities}")
        print(f"   Used KG: {result.used_kg_context}")

    @pytest.mark.asyncio
    async def test_urgent_task_priority(self, llm_service):
        """Test LLM detects urgency"""
        result = await llm_service.parse(
            "URGENT: fix the critical bug in production ASAP",
            user_id="alice",
            provider="openai",
        )

        # Should detect high priority
        assert result.task.priority in ["critical", "high"]

        print(f"\n✅ Urgent task priority:")
        print(f"   Title: {result.task.title}")
        print(f"   Priority: {result.task.priority}")

    @pytest.mark.asyncio
    async def test_compound_task_parsing(self, llm_service, kg_context):
        """Test parsing compound task (should extract first action per ADHD rules)"""
        result = await llm_service.parse(
            "turn off the AC and email Sara about the meeting",
            user_id="alice",
            kg_context=kg_context,
            provider="openai",
        )

        # Should identify multiple entities
        entities_lower = [e.lower() for e in result.task.entities]
        assert any("ac" in e or "air" in e for e in entities_lower)
        assert any("sara" in e for e in entities_lower)

        # Reasoning should mention compound task or multiple actions
        assert (
            "compound" in result.reasoning.lower()
            or "multiple" in result.reasoning.lower()
            or "first" in result.reasoning.lower()
        )

        print(f"\n✅ Compound task parsing:")
        print(f"   Title: {result.task.title}")
        print(f"   Entities: {result.task.entities}")
        print(f"   Reasoning: {result.reasoning}")

    @pytest.mark.asyncio
    async def test_time_estimation(self, llm_service):
        """Test LLM provides reasonable time estimates"""
        # Simple task
        simple_result = await llm_service.parse(
            "send a quick email", user_id="alice", provider="openai"
        )
        assert simple_result.task.estimated_hours <= 0.5  # Should be quick

        # Complex task
        complex_result = await llm_service.parse(
            "write a comprehensive project report with analysis",
            user_id="alice",
            provider="openai",
        )
        assert complex_result.task.estimated_hours >= 1.0  # Should take longer

        print(f"\n✅ Time estimation:")
        print(f"   Simple task: {simple_result.task.estimated_hours}h")
        print(f"   Complex task: {complex_result.task.estimated_hours}h")

    @pytest.mark.asyncio
    async def test_due_date_extraction(self, llm_service):
        """Test LLM extracts due dates"""
        result = await llm_service.parse(
            "submit the report by 2025-11-15", user_id="alice", provider="openai"
        )

        # Should extract due date
        assert result.task.due_date is not None
        assert "2025-11-15" in result.task.due_date

        print(f"\n✅ Due date extraction:")
        print(f"   Title: {result.task.title}")
        print(f"   Due date: {result.task.due_date}")

    @pytest.mark.asyncio
    async def test_tag_generation(self, llm_service):
        """Test LLM generates relevant tags"""
        result = await llm_service.parse(
            "research machine learning frameworks for the AI project",
            user_id="alice",
            provider="openai",
        )

        # Should generate relevant tags
        assert len(result.task.tags) > 0
        tags_str = " ".join(result.task.tags).lower()
        assert (
            "research" in tags_str or "ai" in tags_str or "project" in tags_str
        )

        print(f"\n✅ Tag generation:")
        print(f"   Title: {result.task.title}")
        print(f"   Tags: {result.task.tags}")


class TestTokenUsageAndCost:
    """Test token usage and cost tracking"""

    @pytest.mark.asyncio
    async def test_token_tracking(self, llm_service):
        """Verify token usage is tracked"""
        result = await llm_service.parse(
            "test task for token counting", user_id="alice", provider="openai"
        )

        assert result.tokens_used > 0
        print(f"\n✅ Token usage: {result.tokens_used} tokens")

        # Estimate cost for gpt-4o-mini
        # gpt-4o-mini: $0.150 / 1M input tokens, $0.600 / 1M output tokens
        # Assume 50/50 split for estimation
        estimated_cost = (result.tokens_used / 1_000_000) * 0.375  # Average rate
        print(f"   Estimated cost: ${estimated_cost:.6f}")

    @pytest.mark.asyncio
    async def test_kg_context_token_impact(self, llm_service, kg_context):
        """Test that KG context increases token usage (but provides value)"""
        # Without KG
        result_no_kg = await llm_service.parse(
            "turn off the AC", user_id="alice", provider="openai"
        )

        # With KG
        result_with_kg = await llm_service.parse(
            "turn off the AC", user_id="alice", kg_context=kg_context, provider="openai"
        )

        # KG should add tokens
        assert result_with_kg.tokens_used > result_no_kg.tokens_used

        print(f"\n✅ KG context token impact:")
        print(f"   Without KG: {result_no_kg.tokens_used} tokens")
        print(f"   With KG: {result_with_kg.tokens_used} tokens")
        print(f"   Additional: {result_with_kg.tokens_used - result_no_kg.tokens_used}")


class TestErrorHandling:
    """Test error handling and fallback behavior"""

    @pytest.mark.asyncio
    async def test_invalid_provider(self, llm_service):
        """Test handling of invalid provider"""
        with pytest.raises(ValueError, match="not available"):
            await llm_service.parse(
                "test task", user_id="alice", provider="invalid_provider"
            )

    @pytest.mark.asyncio
    async def test_empty_input(self, llm_service):
        """Test handling of empty input"""
        result = await llm_service.parse("", user_id="alice", provider="openai")

        # Should still parse (LLM should handle gracefully)
        assert result.task.title is not None
        print(f"\n✅ Empty input handling: '{result.task.title}'")
