"""
API v2 Routes Module

This module contains the new unified API routes using TaskService v2 with dependency injection.
"""

from src.api.routes.tasks_v2 import router as tasks_v2_router

__all__ = ["tasks_v2_router"]
