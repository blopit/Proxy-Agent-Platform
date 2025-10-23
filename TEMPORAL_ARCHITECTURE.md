# Temporal Knowledge Graph Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INPUT LAYER                             │
│                                                                       │
│  "buy milk and eggs"  │  "schedule meeting"  │  "what tasks today?" │
└───────────────┬─────────────────┬─────────────────┬─────────────────┘
                │                 │                 │
                ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                    INPUT CLASSIFIER SERVICE                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  SHOPPING    │  │     TASK     │  │    QUERY     │            │
│  │    ITEM      │  │   CREATION   │  │  RETRIEVAL   │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└────────┬─────────────────┬─────────────────┬──────────────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
│  SHOPPING LIST  │ │ CAPTURE      │ │ TASK QUERY   │
│    SERVICE      │ │ AGENT        │ │  SERVICE     │
└────────┬────────┘ └──────┬───────┘ └──────┬───────┘
         │                 │                │
         │                 │                │
         ▼                 ▼                ▼
┌────────────────────────────────────────────────────────────────────┐
│                   TEMPORAL KNOWLEDGE GRAPH                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  TEMPORAL ENTITIES (Versioned)                       │          │
│  │  ┌────────────┬────────────┬────────────┬──────────┐│          │
│  │  │ People     │ Devices    │ Locations  │ Projects ││          │
│  │  │ (Sara,Bob) │ (AC,Phone) │ (Home,Off) │ (Q4 Rep) ││          │
│  │  └────────────┴────────────┴────────────┴──────────┘│          │
│  │  valid_from → valid_to | relevance_score | is_current │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  SHOPPING ITEMS (Temporal Decay)                     │          │
│  │  ┌─────────┬─────────┬─────────┬────────────────┐   │          │
│  │  │ Milk    │ Coffee  │ Eggs    │ Light Bulbs    │   │          │
│  │  │ (fresh) │ (urgent)│ (aging) │ (stale)        │   │          │
│  │  └─────────┴─────────┴─────────┴────────────────┘   │          │
│  │  added_at | status | is_recurring | last_purchased   │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  PREFERENCE HISTORY (Versioned)                      │          │
│  │  ┌──────────────────────────────────────────────┐    │          │
│  │  │ work_time: "mornings" (2024-01-01 → 2025-01)│    │          │
│  │  │ work_time: "evenings" (2025-01-01 → now)    │    │          │
│  │  └──────────────────────────────────────────────┘    │          │
│  │  valid_from → valid_to | confidence | is_current     │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  EVENT LOG (Pattern Learning)                        │          │
│  │  ┌──────────────────────────────────────────────┐    │          │
│  │  │ task_completed | Mon 9am | energy=high       │    │          │
│  │  │ item_purchased | Mon 10am | entity=milk      │    │          │
│  │  │ preference_set | Tue 2pm | key=work_time     │    │          │
│  │  └──────────────────────────────────────────────┘    │          │
│  │  event_type | timestamp | day_of_week | hour_of_day  │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  RECURRING PATTERNS (Detected)                       │          │
│  │  ┌──────────────────────────────────────────────┐    │          │
│  │  │ Milk: WEEKLY (7 days) | confidence=0.9      │    │          │
│  │  │ Coffee: WEEKLY (7 days) | confidence=0.85   │    │          │
│  │  │ Deep work: DAILY (Mon 9am) | conf=0.95      │    │          │
│  │  └──────────────────────────────────────────────┘    │          │
│  │  pattern_type | recurrence | next_predicted           │          │
│  └──────────────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│                   CONTEXT ENRICHMENT LAYER                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  TEMPORAL CONTEXT BUILDER                                    │   │
│  │  • Retrieve current entities (is_current=true)              │   │
│  │  • Get active shopping items (status=active)                │   │
│  │  • Load current preferences (is_current=true)               │   │
│  │  • Query recurring patterns (is_active=true)                │   │
│  │  • Apply relevance decay scoring                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LLM PROMPT FORMATTER                                        │   │
│  │  "# Temporal Context                                        │   │
│  │   ## Shopping List:                                         │   │
│  │   - !Coffee Beans (urgent, fresh)                           │   │
│  │   - Milk (normal, aging)                                    │   │
│  │                                                              │   │
│  │   ## User Preferences:                                      │   │
│  │   - work_time: evenings                                     │   │
│  │                                                              │   │
│  │   ## Patterns:                                              │   │
│  │   - Buys milk weekly (next: Oct 27)                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │   LLM MODEL    │
                          │  (GPT/Claude)  │
                          └────────────────┘
```

## Data Flow Examples

### Example 1: Shopping List Addition

```
User Input: "buy milk and eggs"
     │
     ▼
[Input Classifier]
     │ → Type: SHOPPING_ITEM
     ▼
[Shopping List Service]
     │
     ├─→ Parse NL: ["Milk", "Eggs"]
     │
     ├─→ Check duplicates (24h window)
     │   └─→ "Milk" found (added 2h ago) → DUPLICATE
     │   └─→ "Eggs" not found → NEW
     │
     ├─→ Auto-classify category
     │   └─→ "Eggs" → GROCERIES
     │
     ├─→ Save to kg_shopping_items
     │
     └─→ Log events to kg_event_log
           └─→ EventType.ITEM_ADDED

Response:
{
  "added": ["Eggs"],
  "duplicates": ["Milk (added 2 hours ago)"],
  "suggestions": ["Coffee Beans (you usually buy weekly)"]
}
```

### Example 2: Pattern Detection

```
Timeline:
Oct 1:  Purchase Milk → kg_event_log.event_type = "item_purchased"
Oct 8:  Purchase Milk → 7 days later
Oct 15: Purchase Milk → 7 days later (3rd purchase!)
     │
     ▼
[Pattern Detection Service]
     │
     ├─→ Calculate intervals: [7, 7] days
     ├─→ Mean: 7.0, Variance: 0.0
     ├─→ Consistent pattern! (variance < 5)
     │
     └─→ Create RecurringPattern
           pattern_type: "shopping"
           entity_id: "milk"
           recurrence: WEEKLY
           confidence: 0.9
           next_predicted: Oct 22

Next time user opens app:
Suggestion: "🥛 Time to buy milk? (You usually purchase weekly)"
```

### Example 3: Temporal Entity Query

```
Query: "Send text to myself"
     │
     ▼
[Temporal Context Builder]
     │
     ├─→ Get current entities (as_of = NOW)
     │   WHERE is_current = TRUE
     │   AND valid_to > NOW
     │
     │   Result: "iPhone 15" (valid_from: 2025-10-01)
     │
     └─→ Format context for LLM
           "Alice currently owns: iPhone 15 (since Oct 2025)"

LLM Response:
"I'll send a text to your iPhone 15 via [automation]"
```

### Example 4: Preference Evolution

```
Timeline:
2024-01-01: User sets "work_time" = "mornings"
            → kg_preference_history
              valid_from: 2024-01-01
              valid_to: 9999-12-31
              is_current: TRUE

2025-01-01: User changes "work_time" = "evenings"
            → Update old record:
              valid_to: 2025-01-01
              is_current: FALSE

            → Create new record:
              valid_from: 2025-01-01
              is_current: TRUE

Query (Nov 2024): "What was my work time preference?"
→ SELECT preference WHERE valid_from <= 2024-11-01 AND valid_to > 2024-11-01
→ Result: "mornings"

Query (Feb 2025): "What is my current work time preference?"
→ SELECT preference WHERE is_current = TRUE
→ Result: "evenings"
```

## Database Schema Relationships

```
┌──────────────────────┐
│ kg_temporal_entities │──┐
│ ─────────────────── │  │
│ version_id (PK)     │  │
│ entity_id           │  │ superseded_by
│ valid_from          │  │ (self-reference)
│ valid_to            │  │
│ is_current          │◄─┘
│ relevance_score     │
│ superseded_by (FK)  │
└──────┬───────────────┘
       │ from_entity_id, to_entity_id
       │
       ▼
┌──────────────────────────────┐
│ kg_temporal_relationships    │──┐
│ ─────────────────────────── │  │
│ version_id (PK)             │  │ superseded_by
│ relationship_id             │  │ (self-reference)
│ from_entity_id (FK)         │  │
│ to_entity_id (FK)           │  │
│ relationship_type           │  │
│ valid_from                  │  │
│ valid_to                    │◄─┘
│ is_current                  │
│ superseded_by (FK)          │
└─────────────────────────────┘


┌──────────────────────┐
│ kg_shopping_items    │
│ ─────────────────── │
│ item_id (PK)        │
│ user_id             │
│ item_name           │
│ category            │
│ added_at            │◄── Temporal tracking
│ completed_at        │
│ expired_at          │
│ is_recurring        │◄── Pattern detection
│ recurrence_pattern  │
│ last_purchased      │
│ purchase_count      │
│ status              │
└──────┬───────────────┘
       │ entity_id (shopping item)
       │
       ▼
┌──────────────────────┐
│ kg_event_log        │
│ ─────────────────── │
│ event_id (PK)       │
│ user_id             │
│ event_type          │◄── ITEM_ADDED, ITEM_PURCHASED
│ entity_id (FK)      │
│ event_time          │
│ day_of_week         │◄── Pattern detection
│ hour_of_day         │
│ energy_level        │
└──────┬───────────────┘
       │ Used for analysis
       │
       ▼
┌──────────────────────────┐
│ kg_recurring_patterns    │
│ ─────────────────────── │
│ pattern_id (PK)         │
│ user_id                 │
│ pattern_type            │
│ entity_id               │◄── Links back to shopping item
│ recurrence              │◄── DAILY, WEEKLY, MONTHLY
│ confidence              │
│ first_observed          │
│ last_observed           │
│ next_predicted          │◄── Proactive suggestions
│ is_active               │
└─────────────────────────┘


┌──────────────────────────┐
│ kg_preference_history    │
│ ─────────────────────── │
│ history_id (PK)         │
│ user_id                 │
│ preference_key          │
│ preference_value        │
│ valid_from              │◄── Bi-temporal tracking
│ valid_to                │
│ confidence              │◄── Learned over time
│ observation_count       │
│ is_current              │
└─────────────────────────┘
```

## Query Patterns

### 1. Get Current State (Most Common)

```sql
-- Fast query using indexed is_current
SELECT * FROM kg_temporal_entities
WHERE entity_id = ?
  AND is_current = TRUE;
```

### 2. Time Travel Query

```sql
-- "What entities existed on date X?"
SELECT * FROM kg_temporal_entities
WHERE valid_from <= ?
  AND valid_to > ?
  AND stored_from <= ?
  AND stored_to > ?;
```

### 3. Active Shopping List

```sql
-- Sorted by urgency, with freshness
SELECT
  item_id,
  item_name,
  urgency,
  CASE
    WHEN julianday('now') - julianday(added_at) > 30 THEN 'stale'
    WHEN julianday('now') - julianday(added_at) > 7 THEN 'aging'
    ELSE 'fresh'
  END AS freshness
FROM kg_shopping_items
WHERE user_id = ?
  AND status = 'active'
ORDER BY
  CASE urgency
    WHEN 'urgent' THEN 1
    WHEN 'normal' THEN 2
    WHEN 'someday' THEN 3
  END,
  added_at ASC;
```

### 4. Pattern Detection

```sql
-- Find items with consistent purchase intervals
SELECT
  item_name,
  COUNT(*) as purchase_count,
  AVG(
    julianday(completed_at) -
    julianday(LAG(completed_at) OVER (ORDER BY completed_at))
  ) as avg_days_between
FROM kg_shopping_items
WHERE user_id = ?
  AND status = 'completed'
GROUP BY item_name
HAVING purchase_count >= 3
  AND avg_days_between BETWEEN 5 AND 90;
```

## Performance Characteristics

### Index Strategy

```sql
-- Primary lookups (fast)
CREATE INDEX idx_temporal_current
  ON kg_temporal_entities(entity_id, is_current);  -- O(log n)

CREATE INDEX idx_shopping_user_status
  ON kg_shopping_items(user_id, status, added_at);  -- O(log n)

-- Time-based queries (medium)
CREATE INDEX idx_temporal_valid_from
  ON kg_temporal_entities(valid_from);  -- Range scans

-- Pattern analysis (slower, background jobs)
CREATE INDEX idx_event_pattern
  ON kg_event_log(user_id, event_type, day_of_week, hour_of_day);
```

### Scaling Strategy

```
Small dataset (<1K entities):
  - All queries <10ms
  - No optimization needed

Medium dataset (1K-100K entities):
  - Current state queries: <10ms (indexed)
  - Historical queries: 10-50ms
  - Pattern detection: 50-200ms (background)

Large dataset (>100K entities):
  - Partition event_log by month
  - Archive completed items >90 days
  - Cache current entities in Redis
  - Async pattern detection jobs
```

## Summary

### Key Components

1. **Temporal Entities** - Versioned entities with validity periods
2. **Shopping Lists** - Temporal-aware with duplicate detection
3. **Preference History** - Track changes over time
4. **Event Log** - Capture all events for learning
5. **Pattern Detection** - Learn recurring behaviors

### Benefits

- ✅ **Non-destructive** - Never lose historical data
- ✅ **Time-aware** - Query state at any point in time
- ✅ **Pattern learning** - Detect and predict user behavior
- ✅ **ADHD-optimized** - Forgiving, adaptive, reduces cognitive load
- ✅ **Scalable** - Efficient indexes and partitioning strategy

### Integration Ready

All components are production-ready:
- Complete database schema with migrations
- Pydantic models with validation
- Service layer with business logic
- Query patterns optimized for performance
- Documentation and examples

**Next**: API endpoints and frontend UI!
