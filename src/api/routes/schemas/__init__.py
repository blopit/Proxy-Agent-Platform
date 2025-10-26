"""
API Schemas for v2 endpoints

This module contains Pydantic request/response schemas for the API.
"""

from src.api.routes.schemas.error_schemas import ErrorResponse
from src.api.routes.schemas.task_schemas import (
    TaskCreateRequest,
    TaskListResponse,
    TaskResponse,
    TaskSearchResponse,
    TaskSearchResultItem,
    TaskStatsResponse,
    TaskStatusUpdateRequest,
    TaskUpdateRequest,
)

__all__ = [
    "TaskCreateRequest",
    "TaskUpdateRequest",
    "TaskStatusUpdateRequest",
    "TaskResponse",
    "TaskListResponse",
    "TaskSearchResponse",
    "TaskSearchResultItem",
    "TaskStatsResponse",
    "ErrorResponse",
]
