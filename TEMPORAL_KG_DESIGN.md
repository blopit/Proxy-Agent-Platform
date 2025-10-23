# Temporal Knowledge Graph Design

## Why Temporal Matters for ADHD Users

ADHD users need **context-aware systems** that understand:
- ✅ **Recency**: "I just bought milk" (don't remind me again)
- ✅ **Patterns**: "I buy coffee every week" (predictive suggestions)
- ✅ **Decay**: "This shopping item was added 2 weeks ago" (probably completed/obsolete)
- ✅ **Context shifts**: "I usually work mornings" vs "This week I'm working nights"
- ✅ **Historical preferences**: "I used to prefer X, now I prefer Y"

## Current State Analysis

### ❌ Problems with Static Knowledge Graph

1. **No versioning** - Can't track preference changes over time
2. **No decay** - Shopping lists accumulate forever
3. **No recency** - Can't distinguish "just added" from "6 months old"
4. **No patterns** - Can't learn "buy milk weekly"
5. **No context** - Can't track "mornings vs evenings" preferences

**Current schema:**
```sql
CREATE TABLE kg_entities (
    entity_id TEXT PRIMARY KEY,
    name TEXT,
    metadata TEXT,
    created_at TIMESTAMP,  -- Only creation time!
    updated_at TIMESTAMP   -- Loses history on update!
);
```

## Temporal Knowledge Graph Architecture

### Design Principles

1. **Bi-temporal Model**: Track both:
   - `valid_from/valid_to`: When fact was TRUE in real world
   - `stored_from/stored_to`: When we KNEW about the fact

2. **Non-destructive updates**: Never delete, only mark as superseded
3. **Temporal queries**: Retrieve "state as of date X"
4. **Automatic decay**: Old facts lose relevance weight
5. **Pattern detection**: Learn from temporal sequences

### Schema Enhancement

```sql
-- ============================================================================
-- TEMPORAL ENTITIES TABLE (versioned entities)
-- ============================================================================

CREATE TABLE kg_temporal_entities (
    version_id TEXT PRIMARY KEY,              -- Unique version identifier
    entity_id TEXT NOT NULL,                  -- Logical entity (stays same across versions)
    entity_type TEXT NOT NULL,
    name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',

    -- Bi-temporal timestamps
    valid_from TIMESTAMP NOT NULL,            -- When this became true in reality
    valid_to TIMESTAMP DEFAULT '9999-12-31', -- When this stopped being true
    stored_from TIMESTAMP NOT NULL,           -- When we learned about this
    stored_to TIMESTAMP DEFAULT '9999-12-31',-- When this was superseded

    -- Decay metadata
    relevance_score REAL DEFAULT 1.0,        -- Auto-decays over time
    last_accessed TIMESTAMP,                  -- Track usage patterns
    access_count INTEGER DEFAULT 0,

    -- Versioning
    is_current BOOLEAN DEFAULT TRUE,
    superseded_by TEXT,                       -- Points to newer version_id

    FOREIGN KEY (superseded_by) REFERENCES kg_temporal_entities(version_id)
);

CREATE INDEX idx_temporal_entity_id ON kg_temporal_entities(entity_id);
CREATE INDEX idx_temporal_valid_from ON kg_temporal_entities(valid_from);
CREATE INDEX idx_temporal_current ON kg_temporal_entities(entity_id, is_current);
CREATE INDEX idx_temporal_user_type ON kg_temporal_entities(user_id, entity_type, valid_to);

-- ============================================================================
-- TEMPORAL RELATIONSHIPS (with validity periods)
-- ============================================================================

CREATE TABLE kg_temporal_relationships (
    version_id TEXT PRIMARY KEY,
    relationship_id TEXT NOT NULL,             -- Logical relationship ID
    from_entity_id TEXT NOT NULL,
    to_entity_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',

    -- Bi-temporal timestamps
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP DEFAULT '9999-12-31',
    stored_from TIMESTAMP NOT NULL,
    stored_to TIMESTAMP DEFAULT '9999-12-31',

    -- Versioning
    is_current BOOLEAN DEFAULT TRUE,
    superseded_by TEXT,

    FOREIGN KEY (superseded_by) REFERENCES kg_temporal_relationships(version_id)
);

CREATE INDEX idx_temporal_rel_id ON kg_temporal_relationships(relationship_id);
CREATE INDEX idx_temporal_rel_from ON kg_temporal_relationships(from_entity_id, valid_to);
CREATE INDEX idx_temporal_rel_to ON kg_temporal_relationships(to_entity_id, valid_to);

-- ============================================================================
-- SHOPPING LIST (with temporal decay)
-- ============================================================================

CREATE TABLE kg_shopping_items (
    item_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT,                             -- groceries, hardware, gifts, etc.
    metadata TEXT DEFAULT '{}',

    -- Temporal tracking
    added_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,                    -- When purchased/crossed off
    expired_at TIMESTAMP,                      -- Auto-expire after N days

    -- Recurrence detection
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,                   -- weekly, monthly, etc.
    last_purchased TIMESTAMP,
    purchase_count INTEGER DEFAULT 0,

    -- Location context
    preferred_store TEXT,
    urgency TEXT DEFAULT 'normal',            -- urgent, normal, someday

    -- Status
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'expired', 'cancelled'))
);

CREATE INDEX idx_shopping_user_status ON kg_shopping_items(user_id, status, added_at);
CREATE INDEX idx_shopping_category ON kg_shopping_items(user_id, category);
CREATE INDEX idx_shopping_urgency ON kg_shopping_items(user_id, urgency, status);

-- ============================================================================
-- PREFERENCE HISTORY (track preference changes over time)
-- ============================================================================

CREATE TABLE kg_preference_history (
    history_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    preference_key TEXT NOT NULL,             -- e.g., "work_time_preference", "coffee_type"
    preference_value TEXT NOT NULL,           -- e.g., "mornings", "oat_milk_latte"
    context TEXT,                              -- Optional context (location, mood, etc.)

    -- Temporal tracking
    valid_from TIMESTAMP NOT NULL,
    valid_to TIMESTAMP DEFAULT '9999-12-31',
    confidence REAL DEFAULT 0.5,              -- How sure are we? (learned over time)

    -- Learning
    observation_count INTEGER DEFAULT 1,      -- How many times we've seen this
    last_observed TIMESTAMP,

    is_current BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_pref_user_key ON kg_preference_history(user_id, preference_key, is_current);
CREATE INDEX idx_pref_valid FROM kg_preference_history(valid_from);

-- ============================================================================
-- EVENT LOG (capture all temporal events for pattern learning)
-- ============================================================================

CREATE TABLE kg_event_log (
    event_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,                 -- task_completed, item_purchased, preference_set, etc.
    entity_id TEXT,                            -- Related entity
    event_time TIMESTAMP NOT NULL,
    metadata TEXT DEFAULT '{}',

    -- Context capture
    day_of_week INTEGER,                      -- 0-6 (Monday-Sunday)
    hour_of_day INTEGER,                      -- 0-23
    location TEXT,
    energy_level TEXT,                        -- high, medium, low

    -- For pattern detection
    recurring_pattern_id TEXT                 -- Link to detected patterns
);

CREATE INDEX idx_event_user_time ON kg_event_log(user_id, event_time);
CREATE INDEX idx_event_type ON kg_event_log(event_type, user_id);
CREATE INDEX idx_event_entity ON kg_event_log(entity_id, event_time);
```

## Use Cases & Examples

### 1. Shopping List with Temporal Decay

**Scenario**: User adds "buy milk" twice in one week (forgot they added it)

```python
# First add
add_shopping_item("milk", user_id="alice")
# Added: 2025-10-20 10:00

# Check before adding again (2025-10-20 14:00)
recent_items = get_recent_shopping_items(user_id="alice", hours=24)
if "milk" in recent_items:
    return "You already added milk 4 hours ago!"

# Auto-expire after 30 days
expire_old_shopping_items(days=30)
```

**Pattern learning**: After 4 purchases at 1-week intervals:
```python
# System learns: Alice buys milk weekly
detect_pattern(item="milk", user_id="alice")
# → Sets is_recurring=True, recurrence_pattern="weekly"

# Proactive suggestion
if last_purchased("milk") > 6 days ago:
    suggest("Time to buy milk again?")
```

### 2. Temporal Preference Tracking

**Scenario**: User's work preferences change over time

```python
# October 2024: Prefers morning work
set_preference("work_time", "mornings", valid_from="2024-10-01")

# January 2025: Switches to evening work
set_preference("work_time", "evenings", valid_from="2025-01-01")
# → Old preference gets valid_to="2025-01-01", is_current=False

# Query: What was Alice's preference in November 2024?
get_preference_at("work_time", as_of="2024-11-15")
# → Returns "mornings"

# Query: What is current preference?
get_preference_at("work_time", as_of=datetime.now())
# → Returns "evenings"
```

### 3. Context-Aware Task Suggestions

**Scenario**: System learns user energy patterns

```python
# Capture events with energy context
log_event("task_completed", task_id="deep-work-coding",
          hour_of_day=9, energy_level="high")
log_event("task_completed", task_id="deep-work-writing",
          hour_of_day=10, energy_level="high")
log_event("task_completed", task_id="admin-emails",
          hour_of_day=15, energy_level="low")

# Learn pattern: High energy 9-11am, low energy 3-5pm
detect_temporal_pattern(user_id="alice", event_type="task_completed")

# Smart suggestions
if current_hour == 9 and energy_level == "high":
    suggest_tasks(category="deep-work")  # Leverage peak energy

if current_hour == 15 and energy_level == "low":
    suggest_tasks(category="admin")      # Match to low-energy tasks
```

### 4. Temporal Entity Queries

**Scenario**: Device ownership changes over time

```python
# User had iPhone in 2024
add_entity("iPhone 12", type="device", valid_from="2024-01-01")

# Upgraded to iPhone 15 in 2025
add_entity("iPhone 15", type="device", valid_from="2025-10-01")
# Old device: valid_to="2025-10-01", is_current=False

# Query: What phone did Alice have in July 2024?
get_devices_at(user_id="alice", as_of="2024-07-01")
# → Returns "iPhone 12"

# Query: What phone does Alice have now?
get_devices_at(user_id="alice", as_of=datetime.now())
# → Returns "iPhone 15"

# Smart context for LLM
format_temporal_context(user_id="alice", query="send myself a text")
# → "Alice currently owns: iPhone 15 (since Oct 2025)"
```

## Implementation Priority

### Phase 1: Shopping List Temporal (HIGH PRIORITY)
- Most immediate user value
- Prevents duplicate entries
- Enables pattern learning (weekly groceries)
- **Files to create:**
  - `src/database/migrations/004_add_temporal_kg.sql`
  - `src/knowledge/temporal_models.py`
  - `src/services/shopping_list_service.py`

### Phase 2: Preference History (MEDIUM PRIORITY)
- Tracks preference changes over time
- Enables "you used to like X, now Y" insights
- **Files to create:**
  - `src/knowledge/preference_service.py`
  - Add preference tracking to `quick_capture_service.py`

### Phase 3: Full Temporal Entities (LOWER PRIORITY)
- Migrate existing kg_entities to temporal model
- Enable time-travel queries
- **Files to update:**
  - `src/knowledge/graph_service.py` (add temporal methods)
  - `src/knowledge/models.py` (add temporal models)

### Phase 4: Pattern Detection (FUTURE)
- Analyze event log for patterns
- Predictive suggestions
- **Files to create:**
  - `src/services/pattern_detection_service.py`

## API Examples

```python
# Shopping List API
POST /api/v1/shopping/items
{
    "text": "buy milk and eggs",  # Natural language
    "urgency": "normal"
}
→ Returns: { items: ["milk", "eggs"], detected_duplicates: [] }

GET /api/v1/shopping/items?status=active&sort=urgency
→ Returns active shopping list, sorted by urgency

# Temporal Queries
GET /api/v1/knowledge/entities?as_of=2024-11-01&type=device
→ Returns devices user owned in November 2024

GET /api/v1/knowledge/preferences/work_time?history=true
→ Returns preference history with temporal changes

# Pattern Detection
GET /api/v1/patterns/shopping?item=milk
→ Returns: { is_recurring: true, pattern: "weekly", next_suggested: "2025-10-27" }
```

## Benefits for ADHD Users

1. **No duplicate reminders** - System knows you just added it
2. **Predictive suggestions** - "Time to buy coffee again?"
3. **Context adaptation** - Learns your changing routines
4. **Forgiveness** - Old forgotten items auto-expire
5. **Pattern awareness** - "You usually do X on Mondays"
6. **Time-aware context** - LLM knows what's current vs historical

## Technical Advantages

1. **Audit trail** - Complete history of changes
2. **Rollback capability** - Restore previous state
3. **Conflict resolution** - Handle simultaneous updates
4. **Pattern mining** - Rich dataset for ML
5. **Context quality** - LLM gets temporal relevance
6. **Performance** - Index on `is_current` keeps queries fast

## Migration Strategy

1. **Dual-write period**: Write to both old and new tables
2. **Background migration**: Copy historical data with inferred timestamps
3. **Gradual cutover**: Switch reads table-by-table
4. **Cleanup**: Archive old tables after validation

## Next Steps

1. ✅ Create migration script `004_add_temporal_kg.sql`
2. ✅ Implement `TemporalEntity` and `ShoppingItem` models
3. ✅ Build `ShoppingListService` with temporal logic
4. ✅ Add temporal queries to `GraphService`
5. ✅ Update `QuickCaptureService` to detect shopping items
6. ✅ Create shopping list API endpoints
7. ✅ Add pattern detection for recurring items
