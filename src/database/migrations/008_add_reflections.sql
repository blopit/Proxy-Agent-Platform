-- Migration 008: Add Reflections Table for Daily End-of-Day Reflections
-- Created following TDD approach - tests written first!
-- Enables daily reflection capture with LLM analysis for pattern detection

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create reflections table
CREATE TABLE IF NOT EXISTS reflections (
    reflection_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reflection_date TEXT NOT NULL,  -- ISO format: YYYY-MM-DD
    step_id TEXT,  -- Optional: link to specific micro-step
    task_id TEXT,  -- Optional: link to parent task
    what_happened TEXT NOT NULL,  -- User's reflection text
    energy_level INTEGER,  -- 1-5 scale: user's energy during task
    difficulty_rating INTEGER,  -- 1-5 scale: how difficult was it
    time_taken_minutes INTEGER,  -- Actual time taken
    llm_analysis TEXT,  -- JSON: LLM's analysis of the reflection
    detected_patterns TEXT,  -- JSON: Array of detected patterns
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints with CASCADE delete
    FOREIGN KEY (step_id) REFERENCES micro_steps(step_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reflections_user
    ON reflections(user_id);

CREATE INDEX IF NOT EXISTS idx_reflections_date
    ON reflections(reflection_date);

CREATE INDEX IF NOT EXISTS idx_reflections_step
    ON reflections(step_id);

CREATE INDEX IF NOT EXISTS idx_reflections_task
    ON reflections(task_id);

-- Index for date range queries (weekly/monthly patterns)
CREATE INDEX IF NOT EXISTS idx_reflections_user_date
    ON reflections(user_id, reflection_date DESC);
