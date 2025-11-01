"""
FastAPI routes for ChatGPT Prompt Generator System.

Provides endpoints for:
- Generating ChatGPT prompts for video task analysis
- Importing task lists from ChatGPT responses
"""

from typing import Dict

from fastapi import APIRouter, HTTPException, status

from src.services.chatgpt_prompts.import_service import TaskImportService
from src.services.chatgpt_prompts.models import (
    PromptGenerationRequest,
    PromptGenerationResponse,
    TaskImportResult,
    TaskListImportRequest,
)
from src.services.chatgpt_prompts.prompt_service import PromptGeneratorService

router = APIRouter(prefix="/api/v1/chatgpt-prompts", tags=["chatgpt-prompts"])

# Initialize services
prompt_service = PromptGeneratorService()
import_service = TaskImportService()


# ============================================================================
# Prompt Generation Endpoints
# ============================================================================


@router.post(
    "/generate",
    response_model=PromptGenerationResponse,
    status_code=status.HTTP_200_OK,
)
def generate_chatgpt_prompt(
    request: PromptGenerationRequest,
) -> PromptGenerationResponse:
    """
    Generate a ChatGPT prompt for video-based task breakdown.

    This endpoint creates a user-friendly prompt that:
    1. Guides the user to use ChatGPT's voice + camera mode
    2. Instructs ChatGPT to analyze the video and create a task breakdown
    3. Provides a format that can be easily imported back

    Args:
        request: Prompt generation request with task context

    Returns:
        PromptGenerationResponse: Generated prompt and user instructions

    Example:
        POST /api/v1/chatgpt-prompts/generate
        {
            "task_context": "Clean room 8",
            "analysis_focus": "Pay attention to dusty surfaces and windows",
            "expected_task_count": 10,
            "priority": "high"
        }
    """
    try:
        response = prompt_service.generate_prompt(request)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate prompt: {str(e)}",
        )


# ============================================================================
# Task Import Endpoints
# ============================================================================


@router.post(
    "/import",
    response_model=TaskImportResult,
    status_code=status.HTTP_201_CREATED,
)
def import_task_list(request: TaskListImportRequest) -> TaskImportResult:
    """
    Import a structured task list from ChatGPT.

    This endpoint accepts a task breakdown with parent context and subtasks,
    creating all necessary tasks in the database.

    Args:
        request: Task list import request with subtasks

    Returns:
        TaskImportResult: Import result with created task IDs

    Example:
        POST /api/v1/chatgpt-prompts/import
        {
            "parent_task_context": "Clean room 8",
            "subtasks": [
                {
                    "title": "Dust all surfaces",
                    "description": "Use microfiber cloth...",
                    "estimated_hours": 0.5,
                    "priority": "medium"
                }
            ],
            "delegation_mode": "human",
            "capture_type": "video"
        }
    """
    try:
        result = import_service.import_task_list(request)

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.message,
            )

        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to import tasks: {str(e)}",
        )


@router.post(
    "/parse-and-import",
    response_model=TaskImportResult,
    status_code=status.HTTP_201_CREATED,
)
def parse_and_import_chatgpt_response(request: Dict[str, str]) -> TaskImportResult:
    """
    Parse ChatGPT response text and import as tasks.

    This endpoint accepts raw ChatGPT output (either structured text or JSON)
    and automatically parses it into tasks.

    Args:
        request: Dict with 'chatgpt_response' key containing raw response

    Returns:
        TaskImportResult: Import result with created task IDs

    Example:
        POST /api/v1/chatgpt-prompts/parse-and-import
        {
            "chatgpt_response": "**Task Breakdown for: Clean room 8**\n\n1. **Dust surfaces**..."
        }
    """
    try:
        raw_response = request.get("chatgpt_response")
        if not raw_response:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing 'chatgpt_response' in request body",
            )

        # Parse the response
        task_list_request = import_service.parse_chatgpt_response(raw_response)

        # Import the tasks
        result = import_service.import_task_list(task_list_request)

        if not result.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.message,
            )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse ChatGPT response: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process request: {str(e)}",
        )


# ============================================================================
# Utility Endpoints
# ============================================================================


@router.get("/health", status_code=status.HTTP_200_OK)
def health_check() -> Dict[str, str]:
    """
    Health check endpoint.

    Returns:
        Dict with status
    """
    return {"status": "healthy", "service": "chatgpt-prompts"}
