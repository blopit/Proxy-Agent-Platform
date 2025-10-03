"""
Base models and mixins for Proxy Agent Platform.

Provides common base classes and mixins following CLAUDE.md standards for
data validation and consistency.
"""

from datetime import datetime, timezone
from typing import Optional, Any, Dict
from uuid import uuid4, UUID

from pydantic import BaseModel as PydanticBaseModel, Field, ConfigDict


class BaseModel(PydanticBaseModel):
    """
    Base model for all Proxy Agent Platform entities.

    Provides common configuration and utility methods following
    CLAUDE.md standards for Pydantic v2.
    """

    model_config = ConfigDict(
        use_enum_values=True,
        populate_by_name=True,
        validate_assignment=True,
        extra="forbid",
        frozen=False,
        str_strip_whitespace=True,
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model to dictionary with proper serialization."""
        return self.model_dump(mode="json", exclude_none=True)

    def to_json(self) -> str:
        """Convert model to JSON string."""
        return self.model_dump_json(exclude_none=True)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "BaseModel":
        """Create model instance from dictionary."""
        return cls.model_validate(data)


class TimestampMixin(BaseModel):
    """
    Mixin to add timestamp fields to models.

    Provides created_at and updated_at fields with automatic management.
    """

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When the entity was created"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When the entity was last updated"
    )

    def mark_updated(self) -> None:
        """Mark the entity as updated with current timestamp."""
        self.updated_at = datetime.now(timezone.utc)


class UUIDMixin(BaseModel):
    """
    Mixin to add UUID primary key to models.

    Provides a UUID field that serves as the primary key.
    """

    id: UUID = Field(
        default_factory=uuid4,
        description="Unique identifier for the entity"
    )


class UserContextMixin(BaseModel):
    """
    Mixin to add user context to models.

    Links entities to specific users for multi-tenant support.
    """

    user_id: UUID = Field(
        ...,
        description="ID of the user who owns this entity"
    )


class MetadataMixin(BaseModel):
    """
    Mixin to add metadata field to models.

    Provides flexible metadata storage for additional attributes.
    """

    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional metadata for the entity"
    )

    def set_metadata(self, key: str, value: Any) -> None:
        """Set a metadata value."""
        if self.metadata is None:
            self.metadata = {}
        self.metadata[key] = value

    def get_metadata(self, key: str, default: Any = None) -> Any:
        """Get a metadata value."""
        if self.metadata is None:
            return default
        return self.metadata.get(key, default)

    def remove_metadata(self, key: str) -> None:
        """Remove a metadata key."""
        if self.metadata and key in self.metadata:
            del self.metadata[key]