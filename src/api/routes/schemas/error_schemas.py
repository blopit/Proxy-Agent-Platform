"""
Error response schemas for API v2
"""

from typing import Any

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standard error response format"""

    error_code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error message")
    details: dict[str, Any] | None = Field(None, description="Additional error details")

    model_config = {
        "json_schema_extra": {
            "example": {
                "error_code": "task_not_found",
                "message": "Task task_123 not found",
                "details": {"task_id": "task_123"},
            }
        }
    }
