"""
Knowledge Graph Service - CRUD operations and context retrieval

Provides methods to:
- Create/read/update/delete entities and relationships
- Query the graph (find related entities, retrieve context)
- Extract entities from text for auto-population
- Format context for LLM prompts
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any, Optional

from src.database.enhanced_adapter import EnhancedDatabaseAdapter, get_enhanced_database
from src.knowledge.models import (
    Entity,
    EntityType,
    EntityWithRelationships,
    KGContext,
    Relationship,
    RelationshipType,
)

logger = logging.getLogger(__name__)


class GraphService:
    """
    Service for Knowledge Graph operations.

    Manages entities (people, devices, locations, projects) and their
    relationships to provide context-aware task capture.
    """

    def __init__(self, db: Optional[EnhancedDatabaseAdapter] = None):
        self.db = db or get_enhanced_database()

    # ========================================================================
    # ENTITY CRUD OPERATIONS
    # ========================================================================

    def create_entity(
        self,
        entity_type: EntityType | str,
        name: str,
        user_id: str,
        metadata: Optional[dict[str, Any]] = None,
    ) -> Entity:
        """
        Create a new entity in the knowledge graph.

        Args:
            entity_type: Type of entity (person, device, location, project)
            name: Human-readable name
            user_id: Owner of this entity
            metadata: Optional metadata dict

        Returns:
            Created Entity object

        Example:
            >>> entity = graph.create_entity("person", "Sara", "alice",
            ...                              {"email": "sara@example.com", "team": "Marketing"})
        """
        entity = Entity(
            entity_type=EntityType(entity_type) if isinstance(entity_type, str) else entity_type,
            name=name,
            user_id=user_id,
            metadata=metadata or {},
        )

        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get string value of entity_type (handle both string and enum)
        entity_type_value = entity.entity_type.value if isinstance(entity.entity_type, EntityType) else entity.entity_type

        cursor.execute(
            """
            INSERT INTO kg_entities (entity_id, entity_type, name, user_id, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, entity_type, name) DO UPDATE SET
                metadata = excluded.metadata,
                updated_at = excluded.updated_at
            """,
            (
                entity.entity_id,
                entity_type_value,
                entity.name,
                entity.user_id,
                json.dumps(entity.metadata),
                entity.created_at.isoformat(),
                entity.updated_at.isoformat(),
            ),
        )

        conn.commit()
        return entity

    def get_entity(self, entity_id: str) -> Optional[Entity]:
        """Get entity by ID"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM kg_entities WHERE entity_id = ?", (entity_id,))
        row = cursor.fetchone()

        if row:
            return self._row_to_entity(row)
        return None

    def get_entities_by_user(
        self,
        user_id: str,
        entity_type: Optional[EntityType | str] = None,
    ) -> list[Entity]:
        """
        Get all entities for a user, optionally filtered by type.

        Args:
            user_id: User ID to filter by
            entity_type: Optional entity type filter

        Returns:
            List of Entity objects
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        if entity_type:
            type_value = EntityType(entity_type).value if isinstance(entity_type, str) else entity_type.value
            cursor.execute(
                "SELECT * FROM kg_entities WHERE user_id = ? AND entity_type = ? ORDER BY name",
                (user_id, type_value),
            )
        else:
            cursor.execute(
                "SELECT * FROM kg_entities WHERE user_id = ? ORDER BY entity_type, name",
                (user_id,),
            )

        rows = cursor.fetchall()
        return [self._row_to_entity(row) for row in rows]

    def update_entity(self, entity: Entity) -> Entity:
        """Update an existing entity"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE kg_entities
            SET name = ?, metadata = ?, updated_at = ?
            WHERE entity_id = ?
            """,
            (
                entity.name,
                json.dumps(entity.metadata),
                entity.updated_at.isoformat(),
                entity.entity_id,
            ),
        )

        conn.commit()
        return entity

    def delete_entity(self, entity_id: str) -> bool:
        """Delete an entity (cascades to relationships)"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM kg_entities WHERE entity_id = ?", (entity_id,))
        affected = cursor.rowcount
        conn.commit()

        return affected > 0

    # ========================================================================
    # RELATIONSHIP CRUD OPERATIONS
    # ========================================================================

    def create_relationship(
        self,
        from_entity_id: str,
        to_entity_id: str,
        relationship_type: RelationshipType | str,
        metadata: Optional[dict[str, Any]] = None,
    ) -> Relationship:
        """
        Create a relationship between two entities.

        Args:
            from_entity_id: Source entity ID
            to_entity_id: Target entity ID
            relationship_type: Type of relationship
            metadata: Optional metadata

        Returns:
            Created Relationship object

        Example:
            >>> rel = graph.create_relationship(
            ...     "person-sara", "project-marketing", "workingOn"
            ... )
        """
        relationship = Relationship(
            from_entity_id=from_entity_id,
            to_entity_id=to_entity_id,
            relationship_type=(
                RelationshipType(relationship_type)
                if isinstance(relationship_type, str)
                else relationship_type
            ),
            metadata=metadata or {},
        )

        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get string value of relationship_type (handle both string and enum)
        relationship_type_value = relationship.relationship_type.value if isinstance(relationship.relationship_type, RelationshipType) else relationship.relationship_type

        cursor.execute(
            """
            INSERT INTO kg_relationships (relationship_id, from_entity_id, to_entity_id, relationship_type, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(from_entity_id, to_entity_id, relationship_type) DO NOTHING
            """,
            (
                relationship.relationship_id,
                relationship.from_entity_id,
                relationship.to_entity_id,
                relationship_type_value,
                json.dumps(relationship.metadata),
                relationship.created_at.isoformat(),
            ),
        )

        conn.commit()
        return relationship

    def get_relationships(
        self,
        entity_id: Optional[str] = None,
        relationship_type: Optional[RelationshipType | str] = None,
    ) -> list[Relationship]:
        """
        Get relationships, optionally filtered by entity or type.

        Args:
            entity_id: Filter by source or target entity
            relationship_type: Filter by relationship type

        Returns:
            List of Relationship objects
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        where_conditions = []
        params = []

        if entity_id:
            where_conditions.append("(from_entity_id = ? OR to_entity_id = ?)")
            params.extend([entity_id, entity_id])

        if relationship_type:
            type_value = (
                RelationshipType(relationship_type).value
                if isinstance(relationship_type, str)
                else relationship_type.value
            )
            where_conditions.append("relationship_type = ?")
            params.append(type_value)

        query = "SELECT * FROM kg_relationships"
        if where_conditions:
            query += " WHERE " + " AND ".join(where_conditions)

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [self._row_to_relationship(row) for row in rows]

    def delete_relationship(self, relationship_id: str) -> bool:
        """Delete a relationship"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM kg_relationships WHERE relationship_id = ?", (relationship_id,))
        affected = cursor.rowcount
        conn.commit()

        return affected > 0

    # ========================================================================
    # GRAPH QUERIES
    # ========================================================================

    def get_entity_with_relationships(self, entity_id: str) -> Optional[EntityWithRelationships]:
        """
        Get an entity with all its relationships and connected entities.

        Args:
            entity_id: Entity ID to retrieve

        Returns:
            EntityWithRelationships object or None
        """
        entity = self.get_entity(entity_id)
        if not entity:
            return None

        conn = self.db.get_connection()
        cursor = conn.cursor()

        # Get outgoing relationships
        cursor.execute(
            """
            SELECT r.*, e.*
            FROM kg_relationships r
            JOIN kg_entities e ON r.to_entity_id = e.entity_id
            WHERE r.from_entity_id = ?
            """,
            (entity_id,),
        )

        outgoing = []
        for row in cursor.fetchall():
            rel = self._row_to_relationship(row, prefix_len=6)  # First 6 cols are relationship
            target = self._row_to_entity(row[6:])  # Remaining cols are entity
            outgoing.append((rel, target))

        # Get incoming relationships
        cursor.execute(
            """
            SELECT r.*, e.*
            FROM kg_relationships r
            JOIN kg_entities e ON r.from_entity_id = e.entity_id
            WHERE r.to_entity_id = ?
            """,
            (entity_id,),
        )

        incoming = []
        for row in cursor.fetchall():
            rel = self._row_to_relationship(row, prefix_len=6)
            source = self._row_to_entity(row[6:])
            incoming.append((rel, source))

        return EntityWithRelationships(
            entity=entity,
            outgoing=outgoing,
            incoming=incoming,
        )

    def find_related_entities(
        self,
        entity_id: str,
        max_depth: int = 2,
        relationship_type: Optional[RelationshipType | str] = None,
    ) -> list[Entity]:
        """
        Find entities related to a given entity (graph traversal).

        Uses recursive CTE to traverse relationships up to max_depth hops.

        Args:
            entity_id: Starting entity ID
            max_depth: Maximum traversal depth (default 2)
            relationship_type: Optional filter for relationship type

        Returns:
            List of related Entity objects (excluding the starting entity)
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        relationship_filter = ""
        params = [entity_id, max_depth]

        if relationship_type:
            type_value = (
                RelationshipType(relationship_type).value
                if isinstance(relationship_type, str)
                else relationship_type.value
            )
            relationship_filter = "AND r.relationship_type = ?"
            params.append(type_value)

        query = f"""
        WITH RECURSIVE related_entities(entity_id, depth) AS (
            -- Base case: start with given entity
            SELECT ?, 0

            UNION ALL

            -- Recursive case: find connected entities
            SELECT
                CASE
                    WHEN r.from_entity_id = re.entity_id THEN r.to_entity_id
                    ELSE r.from_entity_id
                END AS entity_id,
                re.depth + 1
            FROM related_entities re
            JOIN kg_relationships r ON (
                r.from_entity_id = re.entity_id OR r.to_entity_id = re.entity_id
            )
            WHERE re.depth < ?
            {relationship_filter}
        )
        SELECT DISTINCT e.*
        FROM related_entities re
        JOIN kg_entities e ON e.entity_id = re.entity_id
        WHERE re.entity_id != ?  -- Exclude starting entity
        """

        params.append(entity_id)  # For the WHERE clause

        cursor.execute(query, params)
        rows = cursor.fetchall()

        return [self._row_to_entity(row) for row in rows]

    # ========================================================================
    # CONTEXT RETRIEVAL (for LLM prompts)
    # ========================================================================

    def get_context_for_query(
        self,
        query_text: str,
        user_id: str,
        max_entities: int = 10,
    ) -> KGContext:
        """
        Retrieve relevant knowledge graph context for a query.

        Extracts entity mentions from text and retrieves related entities/facts.

        Args:
            query_text: User's input text
            user_id: User ID for filtering entities
            max_entities: Maximum entities to return

        Returns:
            KGContext object with relevant entities, relationships, and facts

        Example:
            >>> context = graph.get_context_for_query("email Sara about the report", "alice")
            >>> print(context.format_for_prompt())
        """
        context = KGContext()

        # Extract potential entity mentions from text
        mentioned_entities = self._extract_entity_mentions(query_text, user_id)

        # Add entities to context
        for entity in mentioned_entities[:max_entities]:
            context.add_entity(entity)

            # Get relationships for this entity
            entity_with_rels = self.get_entity_with_relationships(entity.entity_id)
            if entity_with_rels:
                # Add human-readable facts
                for rel, target in entity_with_rels.outgoing:
                    fact = self._relationship_to_fact(entity, rel, target)
                    context.add_fact(fact)
                    context.add_relationship(rel)

                for rel, source in entity_with_rels.incoming:
                    fact = self._relationship_to_fact(source, rel, entity)
                    context.add_fact(fact)
                    context.add_relationship(rel)

        return context

    def _extract_entity_mentions(self, text: str, user_id: str) -> list[Entity]:
        """
        Extract entities mentioned in text via simple name matching.

        More sophisticated implementations could use NER (Named Entity Recognition).
        """
        text_lower = text.lower()
        all_entities = self.get_entities_by_user(user_id)

        mentioned = []
        for entity in all_entities:
            # Simple substring matching (case-insensitive)
            if entity.name.lower() in text_lower:
                mentioned.append(entity)

        # Sort by name length (longer names first to prioritize specific matches)
        mentioned.sort(key=lambda e: len(e.name), reverse=True)

        return mentioned

    def _relationship_to_fact(
        self,
        from_entity: Entity,
        relationship: Relationship,
        to_entity: Entity,
    ) -> str:
        """Convert a relationship to a human-readable fact"""
        rel_type = relationship.relationship_type.value

        # Format based on relationship type
        if rel_type == "worksWith":
            return f"{from_entity.name} works with {to_entity.name}"
        elif rel_type == "workingOn":
            return f"{from_entity.name} is working on {to_entity.name}"
        elif rel_type == "ownsDevice":
            return f"{from_entity.name} owns {to_entity.name}"
        elif rel_type == "locatedIn":
            return f"{from_entity.name} is located in {to_entity.name}"
        elif rel_type == "reportsTo":
            return f"{from_entity.name} reports to {to_entity.name}"
        elif rel_type == "manages":
            return f"{from_entity.name} manages {to_entity.name}"
        else:
            return f"{from_entity.name} → {rel_type} → {to_entity.name}"

    # ========================================================================
    # HELPER METHODS
    # ========================================================================

    def _row_to_entity(self, row) -> Entity:
        """Convert database row to Entity object"""
        row_dict = dict(row)
        return Entity(
            entity_id=row_dict["entity_id"],
            entity_type=EntityType(row_dict["entity_type"]),
            name=row_dict["name"],
            user_id=row_dict["user_id"],
            metadata=json.loads(row_dict.get("metadata", "{}")),
            created_at=row_dict["created_at"],
            updated_at=row_dict["updated_at"],
        )

    def _row_to_relationship(self, row, prefix_len: int = 0) -> Relationship:
        """Convert database row to Relationship object"""
        if prefix_len:
            # Extract relationship columns only
            row_dict = {
                "relationship_id": row[0],
                "from_entity_id": row[1],
                "to_entity_id": row[2],
                "relationship_type": row[3],
                "metadata": row[4],
                "created_at": row[5],
            }
        else:
            row_dict = dict(row)

        return Relationship(
            relationship_id=row_dict["relationship_id"],
            from_entity_id=row_dict["from_entity_id"],
            to_entity_id=row_dict["to_entity_id"],
            relationship_type=RelationshipType(row_dict["relationship_type"]),
            metadata=json.loads(row_dict.get("metadata", "{}")),
            created_at=row_dict["created_at"],
        )

    # ========================================================================
    # BULK OPERATIONS
    # ========================================================================

    def create_entities_bulk(self, entities: list[Entity]) -> int:
        """Create multiple entities in a single transaction"""
        conn = self.db.get_connection()
        cursor = conn.cursor()

        count = 0
        for entity in entities:
            try:
                cursor.execute(
                    """
                    INSERT INTO kg_entities (entity_id, entity_type, name, user_id, metadata, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(user_id, entity_type, name) DO NOTHING
                    """,
                    (
                        entity.entity_id,
                        entity.entity_type.value,
                        entity.name,
                        entity.user_id,
                        json.dumps(entity.metadata),
                        entity.created_at.isoformat(),
                        entity.updated_at.isoformat(),
                    ),
                )
                if cursor.rowcount > 0:
                    count += 1
            except Exception as e:
                logger.error(f"Error inserting entity {entity.name}: {e}")

        conn.commit()
        return count
