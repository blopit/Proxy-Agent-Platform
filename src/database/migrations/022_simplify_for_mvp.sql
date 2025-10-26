-- Migration 022: Simplify for MVP
-- Date: 2025-01-27
-- Purpose: Add simplified tables for Compass + Morning Ritual, comment out complex features

-- ============================================================================
-- COMPASS ZONES (Simplified: 3 zones max, no complex purpose tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS compass_zones (
    zone_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,                    -- "Work", "Life", "Self"
    icon TEXT NOT NULL,                     -- "💼", "🏠", "❤️"
    simple_goal TEXT,                       -- "Complete 3 work tasks daily" (not abstract purpose)
    color TEXT DEFAULT '#3b82f6',          -- For visualization
    sort_order INTEGER DEFAULT 0,           -- Display order (0, 1, 2)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_compass_zones_user ON compass_zones(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_compass_zones_order ON compass_zones(user_id, sort_order);

-- Ensure max 3 zones per user (enforced in application layer)
-- Zone progress tracked via tasks.zone_id count, not separate table

-- ============================================================================
-- MORNING RITUALS (Simplified: Just morning planning, opportunistic not scheduled)
-- ============================================================================

CREATE TABLE IF NOT EXISTS morning_rituals (
    ritual_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    completion_date DATE NOT NULL,           -- Date completed (YYYY-MM-DD)

    -- Focus tasks selected (comma-separated task_ids or JSON array)
    focus_task_1_id TEXT,
    focus_task_2_id TEXT,
    focus_task_3_id TEXT,

    -- Simple metadata
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    skipped BOOLEAN DEFAULT FALSE,           -- User dismissed the ritual

    -- Unique: One ritual per user per day
    UNIQUE(user_id, completion_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_morning_rituals_user_date ON morning_rituals(user_id, completion_date DESC);

-- ============================================================================
-- ENERGY SNAPSHOTS (Simplified: Manual 3-level selector, not multi-factor algorithm)
-- ============================================================================

CREATE TABLE IF NOT EXISTS energy_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    energy_level INTEGER NOT NULL CHECK(energy_level BETWEEN 1 AND 3),  -- 1=Low, 2=Medium, 3=High
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Optional context (can be null)
    time_of_day TEXT,                       -- "morning", "afternoon", "evening"
    notes TEXT,                              -- Optional user note

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_energy_snapshots_user ON energy_snapshots(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_energy_snapshots_level ON energy_snapshots(user_id, energy_level);

-- ============================================================================
-- ADD ZONE_ID TO TASKS (Connect tasks to Compass zones)
-- ============================================================================

-- Add zone_id to tasks table (if not already exists)
ALTER TABLE tasks ADD COLUMN zone_id TEXT;

-- Create index for zone filtering
CREATE INDEX IF NOT EXISTS idx_tasks_zone ON tasks(zone_id);

-- Add foreign key relationship (if supported by SQLite version)
-- Note: SQLite doesn't easily support adding foreign keys to existing tables
-- This is enforced at application layer instead

-- ============================================================================
-- SIMPLIFY USER PROGRESS (Remove complex XP multipliers for now)
-- ============================================================================

-- user_progress table likely already exists (migration 009)
-- If not, create simplified version:
CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completion_date DATE,
    total_tasks_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- ARCHIVE NOTES (What we're NOT building for MVP)
-- ============================================================================

-- These tables exist in migrations 015-021 but are archived:
-- - shopping_lists (migration 015)
-- - shopping_list_items (migration 016)
-- - creature_templates (migration 018)
-- - user_creatures (migration 019)
-- - creature_trades (migration 020)
-- - creature_collection_progress (migration 021)

-- They are commented out here, not dropped.
-- To restore: Move migrations 015-021 back from archive/

-- ============================================================================
-- MVP SCOPE
-- ============================================================================

-- ✅ KEEP:
-- - tasks, micro_steps (core task management)
-- - goals, habits (migration 013-014)
-- - focus_sessions (pomodoro)
-- - achievements, user_achievements (simple gamification)
-- - productivity_metrics (analytics)
-- - users, projects (core)

-- ✅ NEW:
-- - compass_zones (3 zones: Work, Life, Self)
-- - morning_rituals (daily planning tracking)
-- - energy_snapshots (manual 1-3 selector)

-- ❌ ARCHIVED (not in MVP):
-- - shopping_lists, shopping_list_items
-- - creature_*, trading, collection
-- - kg_temporal_entities (complex temporal graph)

-- ============================================================================
-- DATA MIGRATION (Optional: Add default zones for existing users)
-- ============================================================================

-- Uncomment to add default 3 zones for all existing users:
-- INSERT INTO compass_zones (zone_id, user_id, name, icon, simple_goal, sort_order)
-- SELECT
--     user_id || '_zone_work' AS zone_id,
--     user_id,
--     'Work' AS name,
--     '💼' AS icon,
--     'Complete important work tasks' AS simple_goal,
--     0 AS sort_order
-- FROM users
-- WHERE NOT EXISTS (
--     SELECT 1 FROM compass_zones WHERE compass_zones.user_id = users.user_id
-- );

-- (Repeat for 'Life' and 'Self' zones...)
