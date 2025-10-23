-- Temporal Knowledge Graph Migration
-- Adds temporal versioning, shopping lists, preference history, and event logging
-- Enables time-aware context and pattern learning for ADHD-optimized capture

-- ============================================================================
-- TEMPORAL ENTITIES (versioned entities with validity periods)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_temporal_entities (
    version_id TEXT PRIMARY KEY,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK(entity_type IN ('person', 'device', 'location', 'project', 'preference', 'shopping_list')),
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',

    -- Bi-temporal timestamps (when valid in reality vs when we knew about it)
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP DEFAULT '9999-12-31 23:59:59',
    stored_from TIMESTAMP NOT NULL,
    stored_to TIMESTAMP DEFAULT '9999-12-31 23:59:59',

    -- Relevance decay tracking
    relevance_score REAL DEFAULT 1.0,
    last_accessed TIMESTAMP,
    access_count INTEGER DEFAULT 0,

    -- Versioning
    is_current BOOLEAN DEFAULT TRUE,
    superseded_by TEXT,

    FOREIGN KEY (superseded_by) REFERENCES kg_temporal_entities(version_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_temporal_entity_id ON kg_temporal_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_temporal_valid_from ON kg_temporal_entities(valid_from);
CREATE INDEX IF NOT EXISTS idx_temporal_valid_to ON kg_temporal_entities(valid_to);
CREATE INDEX IF NOT EXISTS idx_temporal_current ON kg_temporal_entities(entity_id, is_current);
CREATE INDEX IF NOT EXISTS idx_temporal_user_type ON kg_temporal_entities(user_id, entity_type, valid_to);
CREATE INDEX IF NOT EXISTS idx_temporal_relevance ON kg_temporal_entities(user_id, relevance_score DESC);

-- ============================================================================
-- TEMPORAL RELATIONSHIPS (with validity periods)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_temporal_relationships (
    version_id TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL,
    from_entity_id TEXT NOT NULL,
    to_entity_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',

    -- Bi-temporal timestamps
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP DEFAULT '9999-12-31 23:59:59',
    stored_from TIMESTAMP NOT NULL,
    stored_to TIMESTAMP DEFAULT '9999-12-31 23:59:59',

    -- Versioning
    is_current BOOLEAN DEFAULT TRUE,
    superseded_by TEXT,

    FOREIGN KEY (superseded_by) REFERENCES kg_temporal_relationships(version_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_temporal_rel_id ON kg_temporal_relationships(relationship_id);
CREATE INDEX IF NOT EXISTS idx_temporal_rel_from ON kg_temporal_relationships(from_entity_id, valid_to);
CREATE INDEX IF NOT EXISTS idx_temporal_rel_to ON kg_temporal_relationships(to_entity_id, valid_to);
CREATE INDEX IF NOT EXISTS idx_temporal_rel_current ON kg_temporal_relationships(relationship_id, is_current);

-- ============================================================================
-- SHOPPING ITEMS (with temporal decay and recurrence detection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_shopping_items (
    item_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,
    metadata TEXT DEFAULT '{}',

    -- Temporal tracking
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expired_at TIMESTAMP,

    -- Recurrence detection
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    last_purchased TIMESTAMP,
    purchase_count INTEGER DEFAULT 0,

    -- Context
    preferred_store TEXT,
    urgency TEXT DEFAULT 'normal' CHECK(urgency IN ('urgent', 'normal', 'someday')),
    notes TEXT,

    -- Status
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_shopping_user_status ON kg_shopping_items(user_id, status, added_at);
CREATE INDEX IF NOT EXISTS idx_shopping_category ON kg_shopping_items(user_id, category);
CREATE INDEX IF NOT EXISTS idx_shopping_urgency ON kg_shopping_items(user_id, urgency, status);
CREATE INDEX IF NOT EXISTS idx_shopping_recurring ON kg_shopping_items(user_id, is_recurring);

-- ============================================================================
-- PREFERENCE HISTORY (track preference changes over time)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_preference_history (
    history_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    preference_key TEXT NOT NULL,
    preference_value TEXT NOT NULL,
    context TEXT,

    -- Temporal tracking
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP DEFAULT '9999-12-31 23:59:59',
    confidence REAL DEFAULT 0.5 CHECK(confidence >= 0 AND confidence <= 1),

    -- Learning metadata
    observation_count INTEGER DEFAULT 1,
    last_observed TIMESTAMP,

    is_current BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_pref_user_key ON kg_preference_history(user_id, preference_key, is_current);
CREATE INDEX IF NOT EXISTS idx_pref_valid_from ON kg_preference_history(valid_from);
CREATE INDEX IF NOT EXISTS idx_pref_confidence ON kg_preference_history(user_id, confidence DESC);

-- ============================================================================
-- EVENT LOG (capture all temporal events for pattern learning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_event_log (
    event_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    entity_id TEXT,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT DEFAULT '{}',

    -- Context capture
    day_of_week INTEGER CHECK(day_of_week >= 0 AND day_of_week <= 6),
    hour_of_day INTEGER CHECK(hour_of_day >= 0 AND hour_of_day <= 23),
    location TEXT,
    energy_level TEXT CHECK(energy_level IN ('high', 'medium', 'low') OR energy_level IS NULL),

    -- Pattern detection
    recurring_pattern_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_user_time ON kg_event_log(user_id, event_time);
CREATE INDEX IF NOT EXISTS idx_event_type ON kg_event_log(event_type, user_id);
CREATE INDEX IF NOT EXISTS idx_event_entity ON kg_event_log(entity_id, event_time);
CREATE INDEX IF NOT EXISTS idx_event_pattern ON kg_event_log(user_id, event_type, day_of_week, hour_of_day);

-- ============================================================================
-- RECURRING PATTERNS (detected patterns from event log)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kg_recurring_patterns (
    pattern_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pattern_type TEXT NOT NULL,
    entity_id TEXT,
    entity_type TEXT,

    -- Pattern metadata
    recurrence TEXT NOT NULL,
    confidence REAL DEFAULT 0.5 CHECK(confidence >= 0 AND confidence <= 1),
    observation_count INTEGER DEFAULT 0,

    -- Temporal context
    day_of_week INTEGER CHECK(day_of_week >= 0 AND day_of_week <= 6 OR day_of_week IS NULL),
    hour_of_day INTEGER CHECK(hour_of_day >= 0 AND hour_of_day <= 23 OR hour_of_day IS NULL),

    -- Tracking
    first_observed TIMESTAMP NOT NULL,
    last_observed TIMESTAMP NOT NULL,
    next_predicted TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_pattern_user_type ON kg_recurring_patterns(user_id, pattern_type, is_active);
CREATE INDEX IF NOT EXISTS idx_pattern_entity ON kg_recurring_patterns(entity_id);
CREATE INDEX IF NOT EXISTS idx_pattern_predicted ON kg_recurring_patterns(user_id, next_predicted);

-- ============================================================================
-- TEMPORAL UTILITY VIEWS
-- ============================================================================

-- View: Current entities (most common query)
CREATE VIEW IF NOT EXISTS v_current_entities AS
SELECT
    entity_id,
    entity_type,
    name,
    user_id,
    metadata,
    valid_from,
    relevance_score,
    last_accessed,
    access_count
FROM kg_temporal_entities
WHERE is_current = TRUE
  AND valid_to > CURRENT_TIMESTAMP;

-- View: Active shopping items
CREATE VIEW IF NOT EXISTS v_active_shopping AS
SELECT
    item_id,
    user_id,
    item_name,
    category,
    urgency,
    added_at,
    is_recurring,
    recurrence_pattern,
    CASE
        WHEN julianday(CURRENT_TIMESTAMP) - julianday(added_at) > 30 THEN 'stale'
        WHEN julianday(CURRENT_TIMESTAMP) - julianday(added_at) > 7 THEN 'aging'
        ELSE 'fresh'
    END AS freshness
FROM kg_shopping_items
WHERE status = 'active'
ORDER BY urgency DESC, added_at ASC;

-- View: Current preferences
CREATE VIEW IF NOT EXISTS v_current_preferences AS
SELECT
    preference_key,
    preference_value,
    user_id,
    context,
    confidence,
    observation_count,
    valid_from
FROM kg_preference_history
WHERE is_current = TRUE
  AND valid_to > CURRENT_TIMESTAMP
ORDER BY confidence DESC;

-- View: Recent events (for pattern detection)
CREATE VIEW IF NOT EXISTS v_recent_events AS
SELECT
    event_id,
    user_id,
    event_type,
    entity_id,
    event_time,
    day_of_week,
    hour_of_day,
    energy_level,
    metadata
FROM kg_event_log
WHERE event_time >= datetime(CURRENT_TIMESTAMP, '-90 days')
ORDER BY event_time DESC;

-- ============================================================================
-- TEMPORAL QUERY FUNCTIONS (for application use)
-- ============================================================================

-- Example: Get entities as of a specific date
/*
SELECT e.*
FROM kg_temporal_entities e
WHERE e.entity_id = ?
  AND e.valid_from <= ?
  AND e.valid_to > ?
  AND e.stored_from <= ?
  AND e.stored_to > ?
ORDER BY e.valid_from DESC
LIMIT 1;
*/

-- Example: Get preference history
/*
SELECT
    preference_key,
    preference_value,
    valid_from,
    valid_to,
    confidence,
    is_current
FROM kg_preference_history
WHERE user_id = ?
  AND preference_key = ?
ORDER BY valid_from DESC;
*/

-- Example: Detect shopping item patterns
/*
SELECT
    item_name,
    COUNT(*) as purchase_count,
    AVG(julianday(completed_at) - julianday(LAG(completed_at) OVER (ORDER BY completed_at))) as avg_days_between
FROM kg_shopping_items
WHERE user_id = ?
  AND status = 'completed'
GROUP BY item_name
HAVING purchase_count >= 3
  AND avg_days_between IS NOT NULL
  AND avg_days_between BETWEEN 5 AND 90;
*/

-- ============================================================================
-- SAMPLE TEMPORAL DATA
-- ============================================================================

-- Example: Shopping items with temporal context
INSERT OR IGNORE INTO kg_shopping_items (item_id, user_id, item_name, category, urgency, added_at, status) VALUES
    ('shop-1', 'alice', 'Milk', 'groceries', 'normal', datetime('now', '-2 days'), 'active'),
    ('shop-2', 'alice', 'Coffee Beans', 'groceries', 'urgent', datetime('now', '-1 day'), 'active'),
    ('shop-3', 'alice', 'Light Bulbs', 'hardware', 'someday', datetime('now', '-5 days'), 'active');

-- Example: Preference history (user changed work time preference)
INSERT OR IGNORE INTO kg_preference_history (history_id, user_id, preference_key, preference_value, valid_from, valid_to, confidence, is_current) VALUES
    ('pref-1', 'alice', 'work_time', 'mornings', '2024-01-01', '2025-01-01', 0.9, FALSE),
    ('pref-2', 'alice', 'work_time', 'evenings', '2025-01-01', '9999-12-31', 0.8, TRUE);

-- Example: Events for pattern learning
INSERT OR IGNORE INTO kg_event_log (event_id, user_id, event_type, entity_id, event_time, day_of_week, hour_of_day, energy_level) VALUES
    ('evt-1', 'alice', 'task_completed', 'task-deep-work', datetime('now', '-7 days', 'start of day', '+9 hours'), 1, 9, 'high'),
    ('evt-2', 'alice', 'task_completed', 'task-admin', datetime('now', '-7 days', 'start of day', '+15 hours'), 1, 15, 'low'),
    ('evt-3', 'alice', 'item_purchased', 'shop-milk-prev', datetime('now', '-7 days'), 1, 10, NULL);

-- ============================================================================
-- MIGRATION HELPERS
-- ============================================================================

-- Trigger: Auto-expire shopping items after 30 days
CREATE TRIGGER IF NOT EXISTS auto_expire_shopping_items
AFTER UPDATE ON kg_shopping_items
FOR EACH ROW
WHEN NEW.status = 'active'
  AND julianday(CURRENT_TIMESTAMP) - julianday(NEW.added_at) > 30
BEGIN
    UPDATE kg_shopping_items
    SET status = 'expired',
        expired_at = CURRENT_TIMESTAMP
    WHERE item_id = NEW.item_id;
END;

-- Trigger: Log entity access for relevance scoring
-- Note: SQLite doesn't support AFTER SELECT triggers
-- Access tracking should be done at application layer via ShoppingListService

-- ============================================================================
-- CLEANUP & MAINTENANCE
-- ============================================================================

-- Function: Decay relevance scores over time (run periodically)
-- UPDATE kg_temporal_entities
-- SET relevance_score = relevance_score * 0.95
-- WHERE julianday(CURRENT_TIMESTAMP) - julianday(last_accessed) > 30
--   AND relevance_score > 0.1;

-- Function: Archive completed shopping items older than 90 days
-- UPDATE kg_shopping_items
-- SET status = 'archived'
-- WHERE status = 'completed'
--   AND julianday(CURRENT_TIMESTAMP) - julianday(completed_at) > 90;
