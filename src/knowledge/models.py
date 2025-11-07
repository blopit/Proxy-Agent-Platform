"""
Knowledge Graph Models - Entities and Relationships

Defines Pydantic models for the Knowledge Graph system that stores
context about people, devices, locations, and projects to enhance
LLM-powered task capture.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class EntityType(str, Enum):
    """Types of entities in the knowledge graph"""

    PERSON = "person"
    DEVICE = "device"
    LOCATION = "location"
    PROJECT = "project"


class RelationshipType(str, Enum):
    """Types of relationships between entities"""

    # Person relationships
    WORKS_WITH = "worksWith"
    FRIEND_OF = "friendOf"
    REPORTS_TO = "reportsTo"
    MANAGES = "manages"

    # Device relationships
    OWNS_DEVICE = "ownsDevice"
    LOCATED_IN = "locatedIn"
    CONTROLS = "controls"

    # Project relationships
    WORKING_ON = "workingOn"
    PART_OF = "partOf"
    DEPENDS_ON = "dependsOn"

    # Generic
    RELATED_TO = "relatedTo"


class Entity(BaseModel):
    """
    Knowledge Graph Entity - represents a person, device, location, or project.

    Stores flexible metadata in JSON format for entity-specific attributes.
    """

    entity_id: str = Field(default_factory=lambda: str(uuid4()))
    entity_type: EntityType
    name: str = Field(..., min_length=1, max_length=255)
    user_id: str = Field(..., description="Owner of this entity")

    # Flexible metadata storage
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    def get_metadata(self, key: str, default: Any = None) -> Any:
        """Get metadata value with default fallback"""
        return self.metadata.get(key, default)

    def set_metadata(self, key: str, value: Any) -> None:
        """Set metadata value and update timestamp"""
        self.metadata[key] = value
        self.updated_at = datetime.utcnow()


class Relationship(BaseModel):
    """
    Knowledge Graph Relationship - connects two entities.

    Represents directed relationships (from → to) with type and optional metadata.
    """

    relationship_id: str = Field(default_factory=lambda: str(uuid4()))
    from_entity_id: str = Field(..., description="Source entity ID")
    to_entity_id: str = Field(..., description="Target entity ID")
    relationship_type: RelationshipType

    # Optional metadata (e.g., strength, confidence, context)
    metadata: dict[str, Any] = Field(default_factory=dict)

    # Timestamp
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(use_enum_values=True, populate_by_name=True)

    def get_metadata(self, key: str, default: Any = None) -> Any:
        """Get metadata value with default fallback"""
        return self.metadata.get(key, default)


class KGContext(BaseModel):
    """
    Knowledge Graph Context - relevant facts for LLM prompts.

    Aggregates entities and relationships relevant to a query.
    """

    entities: list[Entity] = Field(default_factory=list)
    relationships: list[Relationship] = Field(default_factory=list)
    facts: list[str] = Field(default_factory=list, description="Human-readable facts")

    def format_for_prompt(self) -> str:
        """Format context as readable text for LLM prompts"""
        if not self.facts and not self.entities:
            return "No context available."

        lines = ["**Context from Knowledge Graph:**\n"]

        # Add human-readable facts
        if self.facts:
            for fact in self.facts:
                lines.append(f"- {fact}")

        # Add entity details
        if self.entities:
            lines.append("\n**Known Entities:**")
            for entity in self.entities:
                # Handle both EntityType enum and string
                entity_type_str = (
                    entity.entity_type.value
                    if isinstance(entity.entity_type, EntityType)
                    else str(entity.entity_type)
                )
                entity_info = f"- {entity.name} ({entity_type_str})"
                # Add key metadata
                if entity.metadata:
                    metadata_str = ", ".join(
                        f"{k}={v}" for k, v in list(entity.metadata.items())[:3]
                    )
                    entity_info += f": {metadata_str}"
                lines.append(entity_info)

        return "\n".join(lines)

    def add_fact(self, fact: str) -> None:
        """Add a human-readable fact"""
        if fact not in self.facts:
            self.facts.append(fact)

    def add_entity(self, entity: Entity) -> None:
        """Add an entity to the context"""
        if entity not in self.entities:
            self.entities.append(entity)

    def add_relationship(self, relationship: Relationship) -> None:
        """Add a relationship to the context"""
        if relationship not in self.relationships:
            self.relationships.append(relationship)


# ============================================================================
# Helper Models for Entity Creation
# ============================================================================


class PersonMetadata(BaseModel):
    """Metadata specific to Person entities"""

    email: str | None = None
    phone: str | None = None
    team: str | None = None
    role: str | None = None
    relationship: str | None = None  # e.g., "manager", "colleague", "friend"
    preferred_contact: str | None = None  # e.g., "email", "slack", "phone"


class DeviceMetadata(BaseModel):
    """Metadata specific to Device entities"""

    location: str | None = None
    type: str | None = None  # e.g., "smart_light", "thermostat", "speaker"
    brand: str | None = None
    model: str | None = None
    integration: str | None = None  # e.g., "homekit", "alexa", "google_home"
    capabilities: list[str] = Field(default_factory=list)  # e.g., ["on_off", "dim", "color"]


class LocationMetadata(BaseModel):
    """Metadata specific to Location entities"""

    address: str | None = None
    type: str | None = None  # e.g., "home", "office", "coffee_shop"
    coordinates: dict[str, float] | None = None  # {"lat": 37.7, "lon": -122.4}
    timezone: str | None = None


class ProjectMetadata(BaseModel):
    """Metadata specific to Project entities"""

    deadline: str | None = None  # ISO date string
    status: str | None = None  # e.g., "active", "on_hold", "completed"
    priority: str | None = None  # e.g., "low", "medium", "high"
    tags: list[str] = Field(default_factory=list)


# ============================================================================
# Query Result Models
# ============================================================================


class EntityWithRelationships(BaseModel):
    """Entity with its related entities (for graph traversal results)"""

    entity: Entity
    outgoing: list[tuple[Relationship, Entity]] = Field(
        default_factory=list, description="(relationship, target_entity) pairs"
    )
    incoming: list[tuple[Relationship, Entity]] = Field(
        default_factory=list, description="(relationship, source_entity) pairs"
    )

    def get_related_entities(
        self, relationship_type: RelationshipType | None = None
    ) -> list[Entity]:
        """Get all related entities, optionally filtered by relationship type"""
        related = []

        for rel, entity in self.outgoing:
            if relationship_type is None or rel.relationship_type == relationship_type:
                related.append(entity)

        for rel, entity in self.incoming:
            if relationship_type is None or rel.relationship_type == relationship_type:
                related.append(entity)

        return related
