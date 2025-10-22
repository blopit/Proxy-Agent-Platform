"""
Knowledge Graph Module - Context-aware entity and relationship management

Provides:
- Entity and Relationship models
- GraphService for CRUD operations and queries
- Context retrieval for LLM prompts
"""

from src.knowledge.models import (
    DeviceMetadata,
    Entity,
    EntityType,
    EntityWithRelationships,
    KGContext,
    LocationMetadata,
    PersonMetadata,
    ProjectMetadata,
    Relationship,
    RelationshipType,
)

__all__ = [
    "Entity",
    "EntityType",
    "Relationship",
    "RelationshipType",
    "KGContext",
    "EntityWithRelationships",
    "PersonMetadata",
    "DeviceMetadata",
    "LocationMetadata",
    "ProjectMetadata",
]
