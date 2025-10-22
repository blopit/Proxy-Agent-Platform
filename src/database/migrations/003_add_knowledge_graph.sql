-- Knowledge Graph Schema for Context-Aware Task Capture
-- Stores entities (people, devices, locations, projects) and their relationships
-- Enables LLM to use real context when parsing tasks

-- ============================================================================
-- ENTITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_entities (
    entity_id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK(entity_type IN ('person', 'device', 'location', 'project')),
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,

    -- Flexible metadata storage (JSON)
    metadata TEXT DEFAULT '{}',  -- Stored as JSON string for SQLite compatibility

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for fast lookups
    UNIQUE(user_id, entity_type, name)
);

CREATE INDEX IF NOT EXISTS idx_kg_entities_user_id ON kg_entities(user_id);
CREATE INDEX IF NOT EXISTS idx_kg_entities_type ON kg_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_kg_entities_name ON kg_entities(name);

-- ============================================================================
-- RELATIONSHIPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_relationships (
    relationship_id TEXT PRIMARY KEY,
    from_entity_id TEXT NOT NULL,
    to_entity_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,

    -- Relationship metadata (e.g., strength, confidence)
    metadata TEXT DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    FOREIGN KEY (from_entity_id) REFERENCES kg_entities(entity_id) ON DELETE CASCADE,
    FOREIGN KEY (to_entity_id) REFERENCES kg_entities(entity_id) ON DELETE CASCADE,

    -- Prevent duplicate relationships
    UNIQUE(from_entity_id, to_entity_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_kg_relationships_from ON kg_relationships(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_to ON kg_relationships(to_entity_id);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_type ON kg_relationships(relationship_type);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Example: User's devices
INSERT OR IGNORE INTO kg_entities (entity_id, entity_type, name, user_id, metadata) VALUES
    ('device-ac-living-room', 'device', 'AC', 'alice', '{"location": "Living Room", "type": "air_conditioner", "brand": "Nest"}'),
    ('device-lights-bedroom', 'device', 'Bedroom Lights', 'alice', '{"location": "Bedroom", "type": "smart_lights", "brand": "Philips Hue"}'),
    ('device-heater-basement', 'device', 'Basement Heater', 'alice', '{"location": "Basement", "type": "heater", "brand": "Ecobee"}');

-- Example: User's contacts
INSERT OR IGNORE INTO kg_entities (entity_id, entity_type, name, user_id, metadata) VALUES
    ('person-sara', 'person', 'Sara', 'alice', '{"email": "sara@example.com", "team": "Marketing", "role": "Marketing Manager"}'),
    ('person-bob', 'person', 'Bob', 'alice', '{"email": "bob@example.com", "team": "Engineering", "role": "Tech Lead"}'),
    ('person-boss', 'person', 'Boss', 'alice', '{"email": "boss@company.com", "relationship": "manager"}');

-- Example: Locations
INSERT OR IGNORE INTO kg_entities (entity_id, entity_type, name, user_id, metadata) VALUES
    ('location-home', 'location', 'Home', 'alice', '{"address": "123 Main St", "type": "residence"}'),
    ('location-office', 'location', 'Office', 'alice', '{"address": "456 Work Ave", "type": "workplace"}');

-- Example: Projects
INSERT OR IGNORE INTO kg_entities (entity_id, entity_type, name, user_id, metadata) VALUES
    ('project-q4-report', 'project', 'Q4 Financial Report', 'alice', '{"deadline": "2025-10-31", "status": "active"}'),
    ('project-marketing-campaign', 'project', 'Marketing Campaign', 'alice', '{"deadline": "2025-11-15", "status": "active"}'

);

-- Example: Relationships
INSERT OR IGNORE INTO kg_relationships (relationship_id, from_entity_id, to_entity_id, relationship_type, metadata) VALUES
    ('rel-1', 'person-sara', 'project-marketing-campaign', 'workingOn', '{"since": "2025-10-01"}'),
    ('rel-2', 'person-bob', 'person-alice', 'worksWith', '{"team": "Engineering"}'),
    ('rel-3', 'device-ac-living-room', 'location-home', 'locatedIn', '{}'),
    ('rel-4', 'device-heater-basement', 'location-home', 'locatedIn', '{}'),
    ('rel-5', 'person-sara', 'person-alice', 'worksWith', '{"team": "Marketing"}');

-- ============================================================================
-- HELPER VIEWS (for common queries)
-- ============================================================================

-- View: User's devices with locations
CREATE VIEW IF NOT EXISTS v_user_devices AS
SELECT
    e.entity_id,
    e.name AS device_name,
    e.user_id,
    e.metadata AS device_metadata,
    loc.name AS location_name,
    loc.metadata AS location_metadata
FROM kg_entities e
LEFT JOIN kg_relationships r ON e.entity_id = r.from_entity_id AND r.relationship_type = 'locatedIn'
LEFT JOIN kg_entities loc ON r.to_entity_id = loc.entity_id
WHERE e.entity_type = 'device';

-- View: User's contacts with projects
CREATE VIEW IF NOT EXISTS v_user_contacts AS
SELECT
    p.entity_id,
    p.name AS person_name,
    p.user_id,
    p.metadata AS person_metadata,
    GROUP_CONCAT(proj.name, ', ') AS projects
FROM kg_entities p
LEFT JOIN kg_relationships r ON p.entity_id = r.from_entity_id AND r.relationship_type = 'workingOn'
LEFT JOIN kg_entities proj ON r.to_entity_id = proj.entity_id AND proj.entity_type = 'project'
WHERE p.entity_type = 'person'
GROUP BY p.entity_id, p.name, p.user_id, p.metadata;

-- ============================================================================
-- UTILITY FUNCTIONS (for recursive queries)
-- ============================================================================

-- Note: SQLite recursive CTEs are supported, can be used in application code
-- Example CTE for finding related entities (2 hops):
/*
WITH RECURSIVE related_entities(entity_id, depth) AS (
    SELECT entity_id, 0 FROM kg_entities WHERE entity_id = 'person-sara'
    UNION ALL
    SELECT
        CASE
            WHEN r.from_entity_id = re.entity_id THEN r.to_entity_id
            ELSE r.from_entity_id
        END,
        re.depth + 1
    FROM related_entities re
    JOIN kg_relationships r ON (r.from_entity_id = re.entity_id OR r.to_entity_id = re.entity_id)
    WHERE re.depth < 2
)
SELECT DISTINCT e.*
FROM related_entities re
JOIN kg_entities e ON e.entity_id = re.entity_id;
*/
