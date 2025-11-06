"""
Tests for LLM Capture Service

Tests LLM-powered task parsing with Knowledge Graph context integration.
"""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.knowledge.models import Entity, EntityType, KGContext, Relationship, RelationshipType
from src.services.llm_capture_service import LLMCaptureService, ParsedTask, TaskParseResult


@pytest.fixture
def llm_service():
    """Provide LLMCaptureService instance"""
    return LLMCaptureService()


@pytest.fixture
def kg_context():
    """Provide sample Knowledge Graph context"""
    context = KGContext()

    # Add sample entities
    ac_device = Entity(
        entity_id="device-1",
        entity_type=EntityType.DEVICE,
        name="AC",
        user_id="alice",
        metadata={"type": "air_conditioner", "location": "living_room"},
    )

    sara_person = Entity(
        entity_id="person-1",
        entity_type=EntityType.PERSON,
        name="Sara",
        user_id="alice",
        metadata={"role": "colleague", "email": "sara@company.com"},
    )

    context.add_entity(ac_device)
    context.add_entity(sara_person)

    # Add sample relationships
    owns_relationship = Relationship(
        relationship_id="rel-1",
        from_entity_id="alice",
        to_entity_id="device-1",
        relationship_type=RelationshipType.OWNS_DEVICE,
    )

    works_with_relationship = Relationship(
        relationship_id="rel-2",
        from_entity_id="alice",
        to_entity_id="person-1",
        relationship_type=RelationshipType.WORKS_WITH,
    )

    context.add_relationship(owns_relationship)
    context.add_relationship(works_with_relationship)

    # Add facts
    context.add_fact("Alice owns device: AC (air_conditioner)")
    context.add_fact("Alice works with: Sara (colleague)")

    return context


@pytest.fixture
def mock_openai_response():
    """Mock OpenAI response"""
    return {
        "task": {
            "title": "Turn off AC",
            "description": "turn off the AC",
            "priority": "medium",
            "estimated_hours": 0.1,
            "due_date": None,
            "tags": ["home-automation", "quick"],
            "entities": ["AC"],
            "is_digital": True,
            "automation_type": "home_iot",
            "confidence": 0.9,
        },
        "reasoning": "Task requires IoT device control. AC device found in KG context.",
    }


@pytest.fixture
def mock_anthropic_response():
    """Mock Anthropic response"""
    return """```json
{
    "task": {
        "title": "Email Sara about project update",
        "description": "email sara about the project update",
        "priority": "high",
        "estimated_hours": 0.5,
        "due_date": null,
        "tags": ["email", "communication", "work"],
        "entities": ["Sara"],
        "is_digital": true,
        "automation_type": "email",
        "confidence": 0.85
    },
    "reasoning": "Task is an email to Sara. Contact info found in KG context."
}
```"""


class TestLLMCaptureService:
    """Test suite for LLMCaptureService"""

    def test_initialization_without_api_keys(self, llm_service):
        """Test service initializes gracefully without API keys"""
        # Should not raise errors even without API keys
        assert llm_service is not None

    def test_select_provider_with_no_clients(self, llm_service):
        """Test provider selection fails when no clients are available"""
        # Force no clients
        llm_service.openai_client = None
        llm_service.anthropic_client = None

        with pytest.raises(ValueError, match="No LLM provider available"):
            llm_service._select_provider()

    def test_build_prompt_without_kg_context(self, llm_service):
        """Test prompt building without KG context"""
        prompt = llm_service._build_prompt("turn off the AC", kg_context=None)

        assert "turn off the AC" in prompt
        assert "User Input" in prompt
        assert "Output Format" in prompt
        # Note: "Knowledge Graph" appears in instructions even without context
        assert "**Context from Knowledge Graph:**" not in prompt  # No KG context section

    def test_build_prompt_with_kg_context(self, llm_service, kg_context):
        """Test prompt building with KG context"""
        prompt = llm_service._build_prompt("turn off the AC", kg_context=kg_context)

        assert "turn off the AC" in prompt
        assert "User Input" in prompt
        assert "Output Format" in prompt
        assert "Context from Knowledge Graph" in prompt
        assert "AC" in prompt  # Entity from KG
        assert "Sara" in prompt  # Entity from KG

    @pytest.mark.asyncio
    async def test_parse_with_openai(self, llm_service, kg_context, mock_openai_response):
        """Test parsing with OpenAI"""
        # Mock OpenAI client
        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(message=MagicMock(content=json.dumps(mock_openai_response)))
        ]
        mock_response.usage = MagicMock(total_tokens=150)
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

        llm_service.openai_client = mock_client

        # Parse task
        result = await llm_service.parse(
            "turn off the AC", user_id="alice", kg_context=kg_context, provider="openai"
        )

        # Verify result
        assert isinstance(result, TaskParseResult)
        assert result.task.title == "Turn off AC"
        assert result.task.is_digital is True
        assert result.task.automation_type == "home_iot"
        assert result.used_kg_context is True
        assert result.tokens_used == 150
        assert result.provider == "openai"

    @pytest.mark.asyncio
    async def test_parse_with_anthropic(
        self, llm_service, kg_context, mock_anthropic_response
    ):
        """Test parsing with Anthropic Claude"""
        # Mock Anthropic client
        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text=mock_anthropic_response)]
        mock_response.usage = MagicMock(input_tokens=100, output_tokens=80)
        mock_client.messages.create = AsyncMock(return_value=mock_response)

        llm_service.anthropic_client = mock_client

        # Parse task
        result = await llm_service.parse(
            "email sara about the project update",
            user_id="alice",
            kg_context=kg_context,
            provider="anthropic",
        )

        # Verify result
        assert isinstance(result, TaskParseResult)
        assert result.task.title == "Email Sara about project update"
        assert result.task.is_digital is True
        assert result.task.automation_type == "email"
        assert result.task.entities == ["Sara"]
        assert result.used_kg_context is True
        assert result.tokens_used == 180  # 100 + 80
        assert result.provider == "anthropic"

    @pytest.mark.asyncio
    async def test_parse_fallback_on_error(self, llm_service):
        """Test that parse raises error when LLM fails"""
        # Mock OpenAI client to raise error
        mock_client = AsyncMock()
        mock_client.chat.completions.create = AsyncMock(
            side_effect=Exception("API error")
        )

        llm_service.openai_client = mock_client

        # Should raise the exception
        with pytest.raises(Exception, match="API error"):
            await llm_service.parse("test task", user_id="alice", provider="openai")

    def test_create_fallback_result_simple_task(self, llm_service):
        """Test fallback result creation for simple task"""
        result = llm_service.create_fallback_result("clean the kitchen")

        assert isinstance(result, TaskParseResult)
        assert result.task.title == "clean the kitchen"
        assert result.task.priority == "medium"
        assert result.task.estimated_hours == 0.5
        assert "fallback" in result.task.tags
        assert result.provider == "fallback"
        assert result.tokens_used == 0

    def test_create_fallback_result_urgent_task(self, llm_service):
        """Test fallback result detects urgency"""
        result = llm_service.create_fallback_result("URGENT: fix the bug asap")

        assert result.task.priority == "high"

    def test_create_fallback_result_digital_task(self, llm_service):
        """Test fallback result detects digital tasks"""
        result = llm_service.create_fallback_result("email John about the meeting")

        assert result.task.is_digital is True
        assert result.task.automation_type == "email"

    def test_create_fallback_result_with_kg_context(self, llm_service, kg_context):
        """Test fallback result with KG context (should still work)"""
        result = llm_service.create_fallback_result("turn off AC", kg_context=kg_context)

        assert isinstance(result, TaskParseResult)
        assert result.task.title == "turn off AC"
        # Note: Fallback doesn't use KG context, but shouldn't fail


class TestParsedTaskModel:
    """Test Pydantic models"""

    def test_parsed_task_validation(self):
        """Test ParsedTask model validation"""
        task = ParsedTask(
            title="Test Task",
            description="Test description",
            priority="high",
            estimated_hours=1.5,
            tags=["test", "validation"],
            is_digital=True,
            automation_type="email",
        )

        assert task.title == "Test Task"
        assert task.priority == "high"
        assert task.estimated_hours == 1.5
        assert task.is_digital is True

    def test_parsed_task_defaults(self):
        """Test ParsedTask default values"""
        task = ParsedTask(title="Test Task", description="Description")

        assert task.priority == "medium"
        assert task.estimated_hours == 0.25  # 15 minutes default
        assert task.tags == []
        assert task.entities == []
        assert task.is_digital is False
        assert task.automation_type is None
        assert task.confidence == 0.7

    def test_parsed_task_validation_errors(self):
        """Test ParsedTask validation catches errors"""
        # Missing required fields
        with pytest.raises(Exception):
            ParsedTask(title="Test")  # Missing description

        # Invalid estimated_hours (negative)
        with pytest.raises(Exception):
            ParsedTask(
                title="Test", description="Desc", estimated_hours=-1.0
            )

    def test_task_parse_result_model(self):
        """Test TaskParseResult model"""
        task = ParsedTask(title="Test", description="Desc")
        result = TaskParseResult(
            task=task, reasoning="Test reasoning", provider="openai", tokens_used=100
        )

        assert result.task == task
        assert result.reasoning == "Test reasoning"
        assert result.provider == "openai"
        assert result.tokens_used == 100
        assert result.used_kg_context is False  # Default


class TestPromptTemplates:
    """Test prompt template generation"""

    def test_prompt_includes_adhd_optimizations(self, llm_service):
        """Test prompt includes ADHD-friendly guidelines"""
        prompt = llm_service._build_prompt("test task")

        assert "ADHD Optimization Rules" in prompt
        assert "single actions" in prompt.lower()
        # ADHD optimization mentions breaking compound tasks
        assert "compound tasks" in prompt.lower() or "single action" in prompt.lower()

    def test_prompt_includes_output_schema(self, llm_service):
        """Test prompt includes JSON schema"""
        prompt = llm_service._build_prompt("test task")

        assert "Output Format" in prompt
        assert "```json" in prompt
        assert '"title"' in prompt
        assert '"priority"' in prompt
        assert '"is_digital"' in prompt

    def test_prompt_kg_context_injection(self, llm_service, kg_context):
        """Test KG context is properly injected into prompt"""
        prompt = llm_service._build_prompt("test task", kg_context=kg_context)

        # Should include formatted KG context
        formatted_context = kg_context.format_for_prompt()

        # Check key elements from context are in prompt
        assert "AC" in prompt
        assert "Sara" in prompt
        assert "Context from Knowledge Graph" in prompt
