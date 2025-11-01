"""
ChatGPT Prompt Generator System.

This package provides functionality for:
- Generating user-friendly ChatGPT prompts for video-based task analysis
- Parsing and importing task lists from ChatGPT responses
"""

from src.services.chatgpt_prompts.import_service import TaskImportService
from src.services.chatgpt_prompts.models import (
    ImportedSubtask,
    PromptGenerationRequest,
    PromptGenerationResponse,
    TaskImportResult,
    TaskListImportRequest,
)
from src.services.chatgpt_prompts.prompt_service import PromptGeneratorService
from src.services.chatgpt_prompts.routes import router

__all__ = [
    "router",
    "PromptGeneratorService",
    "TaskImportService",
    "PromptGenerationRequest",
    "PromptGenerationResponse",
    "TaskListImportRequest",
    "ImportedSubtask",
    "TaskImportResult",
]
