"""
API routes for Task Templates Service (BE-01).

Provides CRUD endpoints for managing task templates.
"""

from fastapi import APIRouter, HTTPException, Query, status

from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.services.templates.models import (
    TaskTemplate,
    TaskTemplateCreate,
    TaskTemplateUpdate,
)
from src.services.templates.repository import TemplateRepository

router = APIRouter(prefix="/api/v1/task-templates", tags=["templates"])


def get_repository() -> TemplateRepository:
    """Get template repository instance."""
    db = EnhancedDatabaseAdapter()
    return TemplateRepository(db)


@router.post("/", response_model=TaskTemplate, status_code=status.HTTP_201_CREATED)
async def create_template(template: TaskTemplateCreate):
    """
    Create a new task template with steps.

    Args:
        template: Template creation data with steps

    Returns:
        TaskTemplate: Created template with all steps
    """
    repo = get_repository()
    return repo.create_template_with_steps(template)


@router.get("/", response_model=list[TaskTemplate])
async def list_templates(category: str | None = Query(None)):
    """
    List all public templates, optionally filtered by category.

    Args:
        category: Optional category filter (Academic, Work, Personal, Health, Creative)

    Returns:
        List[TaskTemplate]: List of templates
    """
    repo = get_repository()

    if category:
        return repo.get_by_category(category)

    return repo.get_all_public()


@router.get("/{template_id}", response_model=TaskTemplate)
async def get_template(template_id: str):
    """
    Get a specific template by ID.

    Args:
        template_id: Template ID

    Returns:
        TaskTemplate: Template with steps

    Raises:
        HTTPException: 404 if template not found
    """
    repo = get_repository()
    template = repo.get_by_id(template_id)

    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    return template


@router.put("/{template_id}", response_model=TaskTemplate)
async def update_template(template_id: str, update_data: TaskTemplateUpdate):
    """
    Update template metadata (not steps).

    Args:
        template_id: Template ID
        update_data: Fields to update

    Returns:
        TaskTemplate: Updated template

    Raises:
        HTTPException: 404 if template not found
    """
    repo = get_repository()
    template = repo.update(template_id, update_data)

    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    return template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: str):
    """
    Delete a template (cascade deletes steps).

    Args:
        template_id: Template ID

    Raises:
        HTTPException: 404 if template not found
    """
    repo = get_repository()
    deleted = repo.delete(template_id)

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
