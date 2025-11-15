"""
Pytest fixtures for Task Templates Service tests.
"""

import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.services.templates.models import TaskTemplateCreate, TemplateStepCreate


@pytest.fixture
def test_client():
    """Provide FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def sample_template_data():
    """Fixture for valid template creation data."""
    return TaskTemplateCreate(
        name="Homework Assignment",
        description="Complete a typical homework assignment",
        category="Academic",
        icon="book",
        estimated_minutes=60,
        created_by="system",
        is_public=True,
        steps=[
            TemplateStepCreate(
                step_order=1,
                description="Research the topic and gather resources",
                short_label="Research",
                estimated_minutes=15,
                leaf_type="DIGITAL",
                icon="search",
            ),
            TemplateStepCreate(
                step_order=2,
                description="Write the first draft",
                short_label="Draft",
                estimated_minutes=25,
                leaf_type="HUMAN",
                icon="write",
            ),
            TemplateStepCreate(
                step_order=3,
                description="Revise and edit your work",
                short_label="Revise",
                estimated_minutes=15,
                leaf_type="HUMAN",
                icon="edit",
            ),
            TemplateStepCreate(
                step_order=4,
                description="Submit the assignment",
                short_label="Submit",
                estimated_minutes=5,
                leaf_type="DIGITAL",
                icon="submit",
            ),
        ],
    )


@pytest.fixture
def work_template_data():
    """Fixture for work category template."""
    return TaskTemplateCreate(
        name="Email Inbox Zero",
        description="Clear your email inbox",
        category="Work",
        icon="email",
        estimated_minutes=25,
        created_by="system",
        is_public=True,
        steps=[
            TemplateStepCreate(
                step_order=1,
                description="Scan all unread emails",
                short_label="Scan",
                estimated_minutes=5,
                leaf_type="DIGITAL",
                icon="scan",
            ),
            TemplateStepCreate(
                step_order=2,
                description="Respond to urgent emails",
                short_label="Respond",
                estimated_minutes=10,
                leaf_type="DIGITAL",
                icon="reply",
            ),
            TemplateStepCreate(
                step_order=3,
                description="Archive or delete",
                short_label="Archive",
                estimated_minutes=10,
                leaf_type="DIGITAL",
                icon="archive",
            ),
        ],
    )
