"""
Tests for Knowledge Graph Service

Tests CRUD operations, graph traversal, and context retrieval.
"""

import pytest
from datetime import datetime

from src.database.enhanced_adapter import EnhancedDatabaseAdapter
from src.knowledge.graph_service import GraphService
from src.knowledge.models import (
    Entity,
    EntityType,
    KGContext,
    PersonMetadata,
    Relationship,
    RelationshipType,
)


@pytest.fixture
def db():
    """Provide test database"""
    db = EnhancedDatabaseAdapter(":memory:")

    # Get connection and create KG tables
    conn = db.get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS kg_entities (
            entity_id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            name TEXT NOT NULL,
            user_id TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS kg_relationships (
            relationship_id TEXT PRIMARY KEY,
            from_entity_id TEXT NOT NULL,
            to_entity_id TEXT NOT NULL,
            relationship_type TEXT NOT NULL,
            metadata TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()

    return db


@pytest.fixture
def graph_service(db):
    """Provide GraphService instance"""
    return GraphService(db)


@pytest.fixture
def sample_entities():
    """Provide sample entities for testing"""
    return [
        Entity(
            entity_id="person-1",
            entity_type=EntityType.PERSON,
            name="Sara",
            user_id="alice",
            metadata={"role": "colleague", "email": "sara@company.com"},
        ),
        Entity(
            entity_id="device-1",
            entity_type=EntityType.DEVICE,
            name="AC",
            user_id="alice",
            metadata={"type": "air_conditioner", "location": "living_room"},
        ),
        Entity(
            entity_id="location-1",
            entity_type=EntityType.LOCATION,
            name="Office",
            user_id="alice",
            metadata={"address": "123 Main St", "type": "workplace"},
        ),
    ]


@pytest.fixture
def sample_relationships():
    """Provide sample relationships for testing"""
    return [
        Relationship(
            relationship_id="rel-1",
            from_entity_id="alice",
            to_entity_id="person-1",
            relationship_type=RelationshipType.WORKS_WITH,
        ),
        Relationship(
            relationship_id="rel-2",
            from_entity_id="alice",
            to_entity_id="device-1",
            relationship_type=RelationshipType.OWNS_DEVICE,
        ),
        Relationship(
            relationship_id="rel-3",
            from_entity_id="person-1",
            to_entity_id="location-1",
            relationship_type=RelationshipType.LOCATED_IN,
        ),
    ]


class TestEntityCRUD:
    """Test entity CRUD operations"""

    def test_create_entity(self, graph_service, sample_entities):
        """Test entity creation"""
        entity = sample_entities[0]
        created_id = graph_service.create_entity(entity)

        assert created_id == entity.entity_id

        # Verify entity was stored
        retrieved = graph_service.get_entity(created_id)
        assert retrieved is not None
        assert retrieved.name == "Sara"
        assert retrieved.entity_type == EntityType.PERSON
        assert retrieved.user_id == "alice"

    def test_create_duplicate_entity(self, graph_service, sample_entities):
        """Test creating duplicate entity (should update on conflict)"""
        entity = sample_entities[0]

        # Create first time
        graph_service.create_entity(entity)

        # Try to create again with updated metadata
        entity.metadata = {"role": "manager", "email": "sara@company.com"}
        graph_service.create_entity(entity)

        # Should have updated, not created duplicate
        retrieved = graph_service.get_entity(entity.entity_id)
        assert retrieved.metadata.get("role") == "manager"

    def test_get_nonexistent_entity(self, graph_service):
        """Test retrieving non-existent entity"""
        result = graph_service.get_entity("nonexistent-id")
        assert result is None

    def test_get_entities_by_user(self, graph_service, sample_entities):
        """Test retrieving all entities for a user"""
        # Create multiple entities
        for entity in sample_entities:
            graph_service.create_entity(entity)

        # Get all entities for alice
        entities = graph_service.get_entities_by_user("alice")
        assert len(entities) == 3

        # Check types are present
        types = {e.entity_type for e in entities}
        assert EntityType.PERSON in types
        assert EntityType.DEVICE in types
        assert EntityType.LOCATION in types

    def test_get_entities_by_type(self, graph_service, sample_entities):
        """Test filtering entities by type"""
        # Create multiple entities
        for entity in sample_entities:
            graph_service.create_entity(entity)

        # Get only DEVICE entities
        devices = graph_service.get_entities_by_user(
            "alice", entity_type=EntityType.DEVICE
        )
        assert len(devices) == 1
        assert devices[0].name == "AC"

    def test_update_entity(self, graph_service, sample_entities):
        """Test entity update"""
        entity = sample_entities[0]
        graph_service.create_entity(entity)

        # Update entity
        success = graph_service.update_entity(
            entity.entity_id, name="Sara Smith", metadata={"role": "team_lead"}
        )
        assert success is True

        # Verify updates
        updated = graph_service.get_entity(entity.entity_id)
        assert updated.name == "Sara Smith"
        assert updated.metadata.get("role") == "team_lead"

    def test_update_nonexistent_entity(self, graph_service):
        """Test updating non-existent entity"""
        success = graph_service.update_entity("nonexistent", name="Test")
        assert success is False

    def test_delete_entity(self, graph_service, sample_entities):
        """Test entity deletion"""
        entity = sample_entities[0]
        graph_service.create_entity(entity)

        # Delete entity
        success = graph_service.delete_entity(entity.entity_id)
        assert success is True

        # Verify deletion
        deleted = graph_service.get_entity(entity.entity_id)
        assert deleted is None

    def test_delete_nonexistent_entity(self, graph_service):
        """Test deleting non-existent entity"""
        success = graph_service.delete_entity("nonexistent")
        assert success is False


class TestRelationshipCRUD:
    """Test relationship CRUD operations"""

    def test_create_relationship(self, graph_service, sample_relationships):
        """Test relationship creation"""
        rel = sample_relationships[0]
        created_id = graph_service.create_relationship(rel)

        assert created_id == rel.relationship_id

    def test_get_relationships(self, graph_service, sample_relationships):
        """Test retrieving relationships"""
        # Create relationships
        for rel in sample_relationships:
            graph_service.create_relationship(rel)

        # Get all relationships from alice
        rels = graph_service.get_relationships(from_entity_id="alice")
        assert len(rels) == 2

    def test_get_relationships_by_type(self, graph_service, sample_relationships):
        """Test filtering relationships by type"""
        # Create relationships
        for rel in sample_relationships:
            graph_service.create_relationship(rel)

        # Get only WORKS_WITH relationships
        work_rels = graph_service.get_relationships(
            relationship_type=RelationshipType.WORKS_WITH
        )
        assert len(work_rels) == 1
        assert work_rels[0].to_entity_id == "person-1"

    def test_delete_relationship(self, graph_service, sample_relationships):
        """Test relationship deletion"""
        rel = sample_relationships[0]
        graph_service.create_relationship(rel)

        # Delete relationship
        success = graph_service.delete_relationship(rel.relationship_id)
        assert success is True

        # Verify deletion
        rels = graph_service.get_relationships(relationship_id=rel.relationship_id)
        assert len(rels) == 0


class TestGraphTraversal:
    """Test graph traversal and context retrieval"""

    def test_get_entity_with_relationships(
        self, graph_service, sample_entities, sample_relationships
    ):
        """Test retrieving entity with all relationships"""
        # Create entities and relationships
        for entity in sample_entities:
            graph_service.create_entity(entity)
        for rel in sample_relationships:
            graph_service.create_relationship(rel)

        # Get person-1 with relationships
        result = graph_service.get_entity_with_relationships("person-1")

        assert result is not None
        assert result.entity.name == "Sara"
        assert len(result.outgoing) == 1  # One outgoing relationship
        assert len(result.incoming) == 1  # One incoming relationship

        # Check outgoing relationship
        outgoing_rel, target = result.outgoing[0]
        assert outgoing_rel.relationship_type == RelationshipType.LOCATED_IN
        assert target.name == "Office"

    def test_find_related_entities_depth_1(
        self, graph_service, sample_entities, sample_relationships
    ):
        """Test finding related entities (depth 1)"""
        # Create entities and relationships
        for entity in sample_entities:
            graph_service.create_entity(entity)
        for rel in sample_relationships:
            graph_service.create_relationship(rel)

        # Find entities related to alice (depth 1)
        related = graph_service.find_related_entities("alice", max_depth=1)

        # Should find Sara and AC (directly connected)
        assert len(related) == 2
        names = {e.name for e in related}
        assert "Sara" in names
        assert "AC" in names

    def test_find_related_entities_depth_2(
        self, graph_service, sample_entities, sample_relationships
    ):
        """Test finding related entities (depth 2)"""
        # Create entities and relationships
        for entity in sample_entities:
            graph_service.create_entity(entity)
        for rel in sample_relationships:
            graph_service.create_relationship(rel)

        # Find entities related to alice (depth 2)
        related = graph_service.find_related_entities("alice", max_depth=2)

        # Should find Sara, AC, and Office (Sara -> Office)
        assert len(related) == 3
        names = {e.name for e in related}
        assert "Sara" in names
        assert "AC" in names
        assert "Office" in names

    def test_extract_entity_mentions(self, graph_service, sample_entities):
        """Test extracting entity mentions from text"""
        # Create entities
        for entity in sample_entities:
            graph_service.create_entity(entity)

        # Extract mentions from text
        mentions = graph_service._extract_entity_mentions(
            "turn off the AC and email Sara about the office", user_id="alice"
        )

        # Should find AC and Sara
        assert len(mentions) >= 2
        names = {e.name for e in mentions}
        assert "AC" in names
        assert "Sara" in names

    def test_relationship_to_fact(self, graph_service, sample_entities):
        """Test converting relationship to human-readable fact"""
        person = sample_entities[0]
        device = sample_entities[1]

        rel = Relationship(
            relationship_id="rel-1",
            from_entity_id=person.entity_id,
            to_entity_id=device.entity_id,
            relationship_type=RelationshipType.OWNS_DEVICE,
        )

        fact = graph_service._relationship_to_fact(person, rel, device)

        assert person.name in fact  # "Sara"
        assert device.name in fact  # "AC"
        assert "owns device" in fact.lower()


class TestContextRetrieval:
    """Test Knowledge Graph context retrieval for LLM prompts"""

    def test_get_context_for_query(
        self, graph_service, sample_entities, sample_relationships
    ):
        """Test retrieving context for a query"""
        # Create entities and relationships
        for entity in sample_entities:
            graph_service.create_entity(entity)
        for rel in sample_relationships:
            graph_service.create_relationship(rel)

        # Get context for query
        context = graph_service.get_context_for_query(
            "turn off the AC and email Sara", user_id="alice"
        )

        assert isinstance(context, KGContext)
        assert len(context.entities) > 0
        assert len(context.facts) > 0

        # Should include AC and Sara
        entity_names = {e.name for e in context.entities}
        assert "AC" in entity_names or "Sara" in entity_names

    def test_get_context_empty_query(self, graph_service):
        """Test context retrieval with empty query"""
        context = graph_service.get_context_for_query("", user_id="alice")

        assert isinstance(context, KGContext)
        assert len(context.entities) == 0
        assert len(context.facts) == 0

    def test_get_context_no_matches(self, graph_service, sample_entities):
        """Test context retrieval when no entities match"""
        # Create entities
        for entity in sample_entities:
            graph_service.create_entity(entity)

        # Query with no matching entities
        context = graph_service.get_context_for_query(
            "random text with no entities", user_id="alice"
        )

        # Should return empty context
        assert len(context.entities) == 0

    def test_context_format_for_prompt(
        self, graph_service, sample_entities, sample_relationships
    ):
        """Test formatting context for LLM prompt"""
        # Create entities and relationships
        for entity in sample_entities:
            graph_service.create_entity(entity)
        for rel in sample_relationships:
            graph_service.create_relationship(rel)

        # Get context
        context = graph_service.get_context_for_query(
            "email Sara about the AC", user_id="alice"
        )

        # Format for prompt
        formatted = context.format_for_prompt()

        assert isinstance(formatted, str)
        assert len(formatted) > 0
        # Should contain entity info and facts
        if context.facts:
            assert any(fact in formatted for fact in context.facts)


class TestMetadataHandling:
    """Test handling of entity metadata"""

    def test_person_metadata(self, graph_service):
        """Test storing and retrieving person metadata"""
        person = Entity(
            entity_id="person-1",
            entity_type=EntityType.PERSON,
            name="John Doe",
            user_id="alice",
            metadata={
                "role": "manager",
                "email": "john@company.com",
                "phone": "555-1234",
            },
        )

        graph_service.create_entity(person)

        # Retrieve and check metadata
        retrieved = graph_service.get_entity("person-1")
        assert retrieved.metadata["role"] == "manager"
        assert retrieved.metadata["email"] == "john@company.com"

    def test_device_metadata(self, graph_service):
        """Test storing and retrieving device metadata"""
        device = Entity(
            entity_id="device-1",
            entity_type=EntityType.DEVICE,
            name="Smart Thermostat",
            user_id="alice",
            metadata={"type": "thermostat", "location": "bedroom", "ip": "192.168.1.10"},
        )

        graph_service.create_entity(device)

        # Retrieve and check metadata
        retrieved = graph_service.get_entity("device-1")
        assert retrieved.metadata["type"] == "thermostat"
        assert retrieved.metadata["location"] == "bedroom"

    def test_empty_metadata(self, graph_service):
        """Test entity with empty metadata"""
        entity = Entity(
            entity_id="test-1",
            entity_type=EntityType.LOCATION,
            name="Home",
            user_id="alice",
            metadata={},
        )

        graph_service.create_entity(entity)

        retrieved = graph_service.get_entity("test-1")
        assert retrieved.metadata == {}
