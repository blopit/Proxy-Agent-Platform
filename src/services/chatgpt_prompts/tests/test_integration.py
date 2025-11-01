"""
Integration tests for ChatGPT Prompt Generator workflow.

Tests the complete user flow:
1. Generate ChatGPT prompt
2. Simulate ChatGPT response
3. Parse and import tasks
"""

import pytest

from src.services.chatgpt_prompts.import_service import TaskImportService
from src.services.chatgpt_prompts.models import PromptGenerationRequest
from src.services.chatgpt_prompts.prompt_service import PromptGeneratorService


@pytest.fixture
def prompt_service():
    """Provide a PromptGeneratorService instance."""
    return PromptGeneratorService()


@pytest.fixture
def import_service():
    """Provide a TaskImportService instance."""
    return TaskImportService()


# ============================================================================
# End-to-End Workflow Tests
# ============================================================================


def test_complete_workflow_text_format(prompt_service, import_service):
    """
    Test complete workflow with structured text format.

    Simulates:
    1. User generates prompt
    2. User uses ChatGPT with video
    3. ChatGPT returns structured text
    4. User imports text
    """
    # Step 1: Generate prompt
    request = PromptGenerationRequest(
        task_context="Clean room 8",
        analysis_focus="Dusty surfaces and windows",
        expected_task_count=3,
    )
    prompt_response = prompt_service.generate_prompt(request)

    assert "Clean room 8" in prompt_response.prompt
    assert len(prompt_response.instructions) > 50

    # Step 2: Simulate ChatGPT response (structured text format)
    chatgpt_response = """**Task Breakdown for: Clean room 8**

1. **Dust all surfaces**
   - What to do: Use microfiber cloth to dust shelves, desk, and windowsills thoroughly
   - Time estimate: 30 minutes
   - Priority: High

2. **Vacuum carpet**
   - What to do: Vacuum all carpet areas including under furniture and in corners
   - Time estimate: 45 minutes
   - Priority: High

3. **Clean windows**
   - What to do: Spray and wipe all windows inside and outside with glass cleaner
   - Time estimate: 1 hour
   - Priority: Medium
"""

    # Step 3: Parse and import
    task_list = import_service.parse_chatgpt_response(chatgpt_response)

    assert task_list.parent_task_context == "Clean room 8"
    assert len(task_list.subtasks) == 3
    assert task_list.subtasks[0].title == "Dust all surfaces"
    assert task_list.subtasks[0].estimated_hours == 0.5  # 30 min → 0.5 hours

    # Step 4: Import into system
    result = import_service.import_task_list(task_list)

    assert result.success is True
    assert result.imported_task_count == 3
    assert len(result.task_ids) == 3
    assert result.parent_task_id is not None

    # Verify parent task
    parent_task = import_service.get_task_by_id(result.parent_task_id)
    assert parent_task["title"] == "Clean room 8"

    # Verify subtasks
    task1 = import_service.get_task_by_id(result.task_ids[0])
    assert task1["title"] == "Dust all surfaces"
    assert task1["estimated_hours"] == 0.5
    assert task1["priority"] == "high"


def test_complete_workflow_json_format(prompt_service, import_service):
    """
    Test complete workflow with JSON format (for technical users).

    Simulates a user who understands JSON and provides it directly.
    """
    # Step 1: Generate prompt
    request = PromptGenerationRequest(task_context="Organize garage")
    prompt_response = prompt_service.generate_prompt(request)

    assert "Organize garage" in prompt_response.prompt

    # Step 2: Simulate ChatGPT response (JSON format)
    chatgpt_response = """{
        "parent_task_context": "Organize garage",
        "subtasks": [
            {
                "title": "Sort items by category",
                "description": "Group tools, sports equipment, and seasonal items",
                "estimated_hours": 2.0,
                "priority": "high",
                "tags": ["organizing"]
            },
            {
                "title": "Install shelving units",
                "description": "Mount wall shelves for storage organization",
                "estimated_hours": 3.0,
                "priority": "medium",
                "tags": ["organizing", "hardware"]
            }
        ],
        "delegation_mode": "human",
        "capture_type": "video"
    }"""

    # Step 3: Parse and import
    task_list = import_service.parse_chatgpt_response(chatgpt_response)

    assert task_list.parent_task_context == "Organize garage"
    assert len(task_list.subtasks) == 2
    assert task_list.subtasks[0].tags == ["organizing"]

    # Step 4: Import into system
    result = import_service.import_task_list(task_list)

    assert result.success is True
    assert result.imported_task_count == 2


def test_workflow_with_various_time_formats(import_service):
    """Test that various time formats are parsed correctly."""
    responses = [
        ("30 minutes", 0.5),
        ("1 hour", 1.0),
        ("2.5 hours", 2.5),
        ("45 min", 0.75),
        ("90 minutes", 1.5),
    ]

    for time_str, expected_hours in responses:
        chatgpt_response = f"""**Task Breakdown for: Test task**

1. **Do something**
   - What to do: Task description
   - Time estimate: {time_str}
   - Priority: Medium
"""
        task_list = import_service.parse_chatgpt_response(chatgpt_response)
        assert task_list.subtasks[0].estimated_hours == expected_hours


def test_workflow_handles_missing_priorities(import_service):
    """Test that missing priorities default to medium."""
    chatgpt_response = """**Task Breakdown for: Quick task**

1. **Do work**
   - What to do: Task description
   - Time estimate: 1 hour
"""
    task_list = import_service.parse_chatgpt_response(chatgpt_response)
    result = import_service.import_task_list(task_list)

    task = import_service.get_task_by_id(result.task_ids[0])
    assert task["priority"] == "medium"


def test_workflow_with_special_characters(import_service):
    """Test workflow with special characters in titles and descriptions."""
    chatgpt_response = """**Task Breakdown for: Review code: {API & DB}**

1. **Fix bug in <Component />**
   - What to do: Update props: {x: 1, y: 2} & test [v2.0]
   - Time estimate: 2 hours
   - Priority: High
"""
    task_list = import_service.parse_chatgpt_response(chatgpt_response)
    result = import_service.import_task_list(task_list)

    assert result.success is True
    parent = import_service.get_task_by_id(result.parent_task_id)
    assert "{API & DB}" in parent["title"]


def test_workflow_with_minimal_data(prompt_service, import_service):
    """Test workflow with minimal required data."""
    # Generate prompt with minimal request
    request = PromptGenerationRequest(task_context="A")
    prompt_response = prompt_service.generate_prompt(request)
    assert len(prompt_response.prompt) > 0

    # Parse minimal response
    chatgpt_response = """**Task Breakdown for: A**

1. **B**
   - What to do: C
   - Time estimate: 1 hour
   - Priority: Medium
"""
    task_list = import_service.parse_chatgpt_response(chatgpt_response)
    result = import_service.import_task_list(task_list)

    assert result.success is True
    assert result.imported_task_count == 1


# ============================================================================
# Error Handling Tests
# ============================================================================


def test_workflow_handles_malformed_response(import_service):
    """Test that malformed responses are rejected gracefully."""
    malformed_response = "This is just random text without any structure"

    with pytest.raises(ValueError):
        import_service.parse_chatgpt_response(malformed_response)


def test_workflow_handles_missing_header(import_service):
    """Test that responses without header are rejected."""
    no_header_response = """
1. **Do something**
   - What to do: Description
   - Time estimate: 1 hour
"""
    with pytest.raises(ValueError):
        import_service.parse_chatgpt_response(no_header_response)


def test_workflow_handles_empty_response(import_service):
    """Test that empty responses are rejected."""
    with pytest.raises(ValueError):
        import_service.parse_chatgpt_response("")
