"""
Tests for ChatGPT Prompt Generator Service.
"""

import pytest

from src.services.chatgpt_prompts.models import (
    PromptGenerationRequest,
    PromptGenerationResponse,
)
from src.services.chatgpt_prompts.prompt_service import PromptGeneratorService


@pytest.fixture
def prompt_service():
    """Provide a PromptGeneratorService instance."""
    return PromptGeneratorService()


# ============================================================================
# Prompt Generation Tests
# ============================================================================


def test_generate_basic_prompt(prompt_service):
    """Test basic prompt generation with minimal parameters."""
    request = PromptGenerationRequest(task_context="Clean room 8")

    response = prompt_service.generate_prompt(request)

    assert isinstance(response, PromptGenerationResponse)
    assert len(response.prompt) > 100
    assert "Clean room 8" in response.prompt
    assert "camera" in response.prompt.lower()
    assert "breakdown" in response.prompt.lower()
    assert len(response.instructions) > 50
    assert "expected_json_format" in response.model_dump()


def test_generate_prompt_with_focus(prompt_service):
    """Test prompt generation with specific analysis focus."""
    request = PromptGenerationRequest(
        task_context="Clean room 8",
        analysis_focus="Pay attention to dusty surfaces, windows, and bathroom areas",
    )

    response = prompt_service.generate_prompt(request)

    assert "dusty surfaces" in response.prompt.lower()
    assert "windows" in response.prompt.lower()
    assert "bathroom" in response.prompt.lower()


def test_generate_prompt_with_task_count(prompt_service):
    """Test prompt generation with expected task count."""
    request = PromptGenerationRequest(task_context="Organize garage", expected_task_count=12)

    response = prompt_service.generate_prompt(request)

    assert "12" in response.prompt or "twelve" in response.prompt.lower()


def test_generate_prompt_with_priority(prompt_service):
    """Test prompt generation with priority setting."""
    request = PromptGenerationRequest(task_context="Fix security issue", priority="critical")

    response = prompt_service.generate_prompt(request)

    assert "critical" in response.prompt.lower()


def test_generate_prompt_with_estimated_hours(prompt_service):
    """Test prompt generation with estimated hours."""
    request = PromptGenerationRequest(
        task_context="Paint living room", estimated_hours_per_task=2.5
    )

    response = prompt_service.generate_prompt(request)

    assert "2.5" in response.prompt or "hours" in response.prompt.lower()


def test_prompt_contains_format_instructions(prompt_service):
    """Test that generated prompt includes clear format instructions."""
    request = PromptGenerationRequest(task_context="Review codebase")

    response = prompt_service.generate_prompt(request)

    # Check that format structure is described in the prompt
    # Note: We don't mention "JSON" to users, but show them the expected format
    assert "format your response" in response.prompt.lower()
    assert "step title" in response.prompt.lower()
    assert "what to do" in response.prompt.lower()
    assert "time estimate" in response.prompt.lower()


def test_expected_json_format_structure(prompt_service):
    """Test that expected_json_format has correct structure."""
    request = PromptGenerationRequest(task_context="Test task")

    response = prompt_service.generate_prompt(request)

    json_format = response.expected_json_format
    assert "parent_task_context" in json_format
    assert "subtasks" in json_format
    assert isinstance(json_format["subtasks"], list)
    assert len(json_format["subtasks"]) > 0

    example_subtask = json_format["subtasks"][0]
    assert "title" in example_subtask
    assert "description" in example_subtask
    assert "estimated_hours" in example_subtask
    assert "priority" in example_subtask


def test_instructions_are_clear(prompt_service):
    """Test that instructions are clear and actionable."""
    request = PromptGenerationRequest(task_context="Meal prep for the week")

    response = prompt_service.generate_prompt(request)

    instructions = response.instructions.lower()
    assert "copy" in instructions
    assert "chatgpt" in instructions
    assert "voice" in instructions or "camera" in instructions
    assert "paste" in instructions or "import" in instructions


def test_multiple_generations_are_consistent(prompt_service):
    """Test that multiple generations with same input are consistent."""
    request = PromptGenerationRequest(task_context="Test consistency")

    response1 = prompt_service.generate_prompt(request)
    response2 = prompt_service.generate_prompt(request)

    # Core structure should be consistent
    assert "Test consistency" in response1.prompt
    assert "Test consistency" in response2.prompt
    assert len(response1.prompt) > 100
    assert len(response2.prompt) > 100


# ============================================================================
# Edge Cases
# ============================================================================


def test_handles_very_short_task_context(prompt_service):
    """Test handling of minimal task context."""
    request = PromptGenerationRequest(task_context="A")

    response = prompt_service.generate_prompt(request)

    assert isinstance(response, PromptGenerationResponse)
    assert len(response.prompt) > 50


def test_handles_long_task_context(prompt_service):
    """Test handling of long task context."""
    long_context = "Review and refactor " + "code " * 50  # 250+ chars
    request = PromptGenerationRequest(task_context=long_context[:500])

    response = prompt_service.generate_prompt(request)

    assert isinstance(response, PromptGenerationResponse)


def test_handles_special_characters_in_context(prompt_service):
    """Test handling of special characters in task context."""
    request = PromptGenerationRequest(
        task_context="Review code: {main.py, test_*.py} & docs [v2.0]"
    )

    response = prompt_service.generate_prompt(request)

    assert isinstance(response, PromptGenerationResponse)
    # Special chars should be preserved or safely handled
    assert "main.py" in response.prompt
