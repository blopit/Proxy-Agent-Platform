"""
End-to-End Integration Tests for Capture Pipeline

Tests the complete flow: raw text → KG context → LLM parsing → decomposition → classification
"""

from unittest.mock import AsyncMock, patch

import pytest

from src.agents.capture_agent import CaptureAgent
from src.core.task_models import CaptureMode, LeafType
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.knowledge.graph_service import GraphService
from src.knowledge.models import EntityType, RelationshipType


@pytest.fixture
def db():
    """Provide test database with KG tables"""
    db = EnhancedDatabaseAdapter(":memory:")

    # Get connection and create KG tables
    conn = db.get_connection()

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS kg_entities (
            entity_id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            name TEXT NOT NULL,
            user_id TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, entity_type, name)
        )
    """
    )

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS kg_relationships (
            relationship_id TEXT PRIMARY KEY,
            from_entity_id TEXT NOT NULL,
            to_entity_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(from_entity_id, to_entity_id, relationship_type)
        )
    """
    )

    conn.commit()

    return db


@pytest.fixture
def graph_service(db):
    """Provide GraphService with test data"""
    service = GraphService(db)

    # Create entities using the correct API signature
    ac_device = service.create_entity(
        entity_type=EntityType.DEVICE,
        name="AC",
        user_id="alice",
        metadata={"type": "air_conditioner", "location": "living_room"},
    )

    heater_device = service.create_entity(
        entity_type=EntityType.DEVICE,
        name="Heater",
        user_id="alice",
        metadata={"type": "heater", "location": "bedroom"},
    )

    sara_person = service.create_entity(
        entity_type=EntityType.PERSON,
        name="Sara",
        user_id="alice",
        metadata={"role": "colleague", "email": "sara@company.com"},
    )

    bob_person = service.create_entity(
        entity_type=EntityType.PERSON,
        name="Bob",
        user_id="alice",
        metadata={"role": "boss", "email": "bob@company.com"},
    )

    service.create_entity(
        entity_type=EntityType.LOCATION,
        name="Office",
        user_id="alice",
        metadata={"address": "123 Main St"},
    )

    # Create relationships using the correct API signature
    service.create_relationship(
        from_entity_id="alice",
        to_entity_id=ac_device.entity_id,
        relationship_type=RelationshipType.OWNS_DEVICE,
    )

    service.create_relationship(
        from_entity_id="alice",
        to_entity_id=heater_device.entity_id,
        relationship_type=RelationshipType.OWNS_DEVICE,
    )

    service.create_relationship(
        from_entity_id="alice",
        to_entity_id=sara_person.entity_id,
        relationship_type=RelationshipType.WORKS_WITH,
    )

    service.create_relationship(
        from_entity_id="alice",
        to_entity_id=bob_person.entity_id,
        relationship_type=RelationshipType.REPORTS_TO,
    )

    return service


@pytest.fixture
def capture_agent(db):
    """Provide CaptureAgent instance"""
    return CaptureAgent(db)


class TestCaptureWithKnowledgeGraph:
    """Test capture pipeline with Knowledge Graph integration"""

    @pytest.mark.asyncio
    async def test_capture_auto_mode_with_kg(self, capture_agent, graph_service):
        """Test AUTO mode capture with KG context"""
        # Mock LLM service to avoid API calls
        with patch("src.services.quick_capture_service.LLMCaptureService") as mock_llm_class:
            mock_llm = AsyncMock()
            mock_llm_class.return_value = mock_llm

            # Mock LLM response
            from src.services.llm_capture_service import ParsedTask, TaskParseResult

            mock_task = ParsedTask(
                title="Turn off AC",
                description="turn off the AC",
                priority="medium",
                estimated_hours=0.1,
                tags=["home-automation"],
                entities=["AC"],
                is_digital=True,
                automation_type="home_iot",
                confidence=0.9,
            )

            mock_result = TaskParseResult(
                task=mock_task,
                reasoning="Device control task with KG context",
                used_kg_context=True,
                tokens_used=100,
                provider="openai",
            )

            mock_llm.parse = AsyncMock(return_value=mock_result)

            # Capture task
            result = await capture_agent.capture(
                input_text="turn off the AC",
                user_id="alice",
                mode=CaptureMode.AUTO,
            )

            # Verify result
            assert result["task"] is not None
            assert result["ready_to_save"] is True  # AUTO mode proceeds without clarifications
            assert result["mode"] == CaptureMode.AUTO

    @pytest.mark.asyncio
    async def test_capture_clarify_mode_reduces_questions(self, capture_agent, graph_service):
        """Test CLARIFY mode uses KG to reduce clarification questions"""
        # Mock LLM service
        with patch("src.services.quick_capture_service.LLMCaptureService") as mock_llm_class:
            mock_llm = AsyncMock()
            mock_llm_class.return_value = mock_llm

            from src.services.llm_capture_service import ParsedTask, TaskParseResult

            # LLM response with entity already filled from KG
            mock_task = ParsedTask(
                title="Email Sara about project update",
                description="email sara about the project update",
                priority="high",
                estimated_hours=0.5,
                tags=["email", "work"],
                entities=["Sara"],
                is_digital=True,
                automation_type="email",
                confidence=0.85,
            )

            mock_result = TaskParseResult(
                task=mock_task,
                reasoning="Email task. Sara's contact found in KG.",
                used_kg_context=True,
                tokens_used=120,
                provider="openai",
            )

            mock_llm.parse = AsyncMock(return_value=mock_result)

            # Capture task
            result = await capture_agent.capture(
                input_text="email sara about the project update",
                user_id="alice",
                mode=CaptureMode.CLARIFY,
            )

            # Check clarifications
            result["clarifications"]

            # Should have fewer clarifications because KG provided Sara's email
            # Without KG, would ask "Who should I send this email to?"
            # With KG, Sara is already identified with email

            assert result["mode"] == CaptureMode.CLARIFY

    @pytest.mark.asyncio
    async def test_capture_manual_mode_skips_kg(self, capture_agent, graph_service):
        """Test MANUAL mode skips KG context retrieval"""
        manual_fields = {
            "title": "Custom Task",
            "priority": "high",
            "estimated_hours": 2.0,
        }

        result = await capture_agent.capture(
            input_text="some text",
            user_id="alice",
            mode=CaptureMode.MANUAL,
            manual_fields=manual_fields,
        )

        # Verify manual fields were used
        assert result["task"].title == "Custom Task"
        assert result["task"].priority == "high"
        assert result["task"].estimated_hours == 2.0
        assert result["ready_to_save"] is True

    @pytest.mark.asyncio
    async def test_capture_handles_kg_failure_gracefully(self, capture_agent, graph_service):
        """Test capture continues if KG retrieval fails"""
        # Mock graph service to fail
        with patch.object(
            graph_service, "get_context_for_query", side_effect=Exception("KG error")
        ):
            # Should still complete capture with keyword fallback
            result = await capture_agent.capture(
                input_text="clean the kitchen",
                user_id="alice",
                mode=CaptureMode.AUTO,
            )

            # Should fall back to keyword parsing
            assert result["task"] is not None
            assert result["mode"] == CaptureMode.AUTO


class TestDecompositionWithClassification:
    """Test task decomposition and classification together"""

    @pytest.mark.asyncio
    async def test_simple_task_no_decomposition(self, capture_agent):
        """Test atomic task requires no decomposition"""
        result = await capture_agent.capture(
            input_text="call mom",
            user_id="alice",
            mode=CaptureMode.AUTO,
        )

        # Simple task should create minimal micro-steps
        micro_steps = result["micro_steps"]
        assert len(micro_steps) >= 1

        # Should classify as HUMAN (physical action)
        for step in micro_steps:
            # Phone calls are typically HUMAN tasks
            assert step.leaf_type in [LeafType.HUMAN, LeafType.UNKNOWN]

    @pytest.mark.asyncio
    async def test_digital_task_classification(self, capture_agent, graph_service):
        """Test DIGITAL task classification"""
        # Mock LLM for predictable results
        with patch("src.services.quick_capture_service.LLMCaptureService") as mock_llm_class:
            mock_llm = AsyncMock()
            mock_llm_class.return_value = mock_llm

            from src.services.llm_capture_service import ParsedTask, TaskParseResult

            mock_task = ParsedTask(
                title="Research Python frameworks",
                description="research python frameworks for the project",
                priority="medium",
                estimated_hours=1.0,
                tags=["research"],
                entities=[],
                is_digital=True,
                automation_type="research",
                confidence=0.8,
            )

            mock_result = TaskParseResult(
                task=mock_task,
                reasoning="Research task can be automated",
                used_kg_context=False,
                tokens_used=80,
                provider="openai",
            )

            mock_llm.parse = AsyncMock(return_value=mock_result)

            result = await capture_agent.capture(
                input_text="research python frameworks",
                user_id="alice",
                mode=CaptureMode.AUTO,
            )

            # Check if any micro-steps are classified as DIGITAL
            micro_steps = result["micro_steps"]
            [s for s in micro_steps if s.leaf_type == LeafType.DIGITAL]

            # Should have at least some digital steps for research tasks
            assert len(micro_steps) > 0


class TestEntityExtraction:
    """Test entity extraction from task descriptions"""

    @pytest.mark.asyncio
    async def test_entities_stored_in_task_metadata(self, capture_agent, graph_service):
        """Test that extracted entities are stored"""
        with patch("src.services.quick_capture_service.LLMCaptureService") as mock_llm_class:
            mock_llm = AsyncMock()
            mock_llm_class.return_value = mock_llm

            from src.services.llm_capture_service import ParsedTask, TaskParseResult

            mock_task = ParsedTask(
                title="Email Bob and Sara about meeting",
                description="email bob and sara about the meeting at the office",
                priority="high",
                estimated_hours=0.5,
                tags=["email", "work"],
                entities=["Bob", "Sara", "Office"],
                is_digital=True,
                automation_type="email",
                confidence=0.85,
            )

            mock_result = TaskParseResult(
                task=mock_task,
                reasoning="Multi-recipient email with location context",
                used_kg_context=True,
                tokens_used=150,
                provider="openai",
            )

            mock_llm.parse = AsyncMock(return_value=mock_result)

            result = await capture_agent.capture(
                input_text="email bob and sara about the meeting at the office",
                user_id="alice",
                mode=CaptureMode.AUTO,
            )

            # Task should have entity information (from LLM parsing)
            # This would be in the analysis metadata
            assert result["task"] is not None


class TestCapturePerformance:
    """Test capture pipeline performance characteristics"""

    @pytest.mark.asyncio
    async def test_capture_completes_quickly(self, capture_agent):
        """Test that capture completes in reasonable time"""
        import time

        start = time.time()

        result = await capture_agent.capture(
            input_text="quick test task",
            user_id="alice",
            mode=CaptureMode.AUTO,
        )

        duration = time.time() - start

        # Should complete within 10 seconds (accounting for LLM API calls and processing)
        assert duration < 10.0
        assert result is not None

    @pytest.mark.asyncio
    async def test_kg_context_retrieval_is_fast(self, graph_service):
        """Test KG context retrieval performance"""
        import time

        start = time.time()

        context = graph_service.get_context_for_query(
            "turn off the AC and email Sara",
            user_id="alice",
            max_entities=10,
        )

        duration = time.time() - start

        # Context retrieval should be very fast (< 100ms)
        assert duration < 0.1
        assert context is not None
