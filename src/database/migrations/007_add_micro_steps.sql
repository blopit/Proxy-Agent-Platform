-- Migration 007: Add MicroSteps Table for ADHD Task Breakdown
-- Created following TDD approach - tests written first!
-- Enables 2-5 minute atomic task chunks with DIGITAL/HUMAN classification

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Drop old micro_steps table if it exists (legacy schema)
DROP TABLE IF EXISTS micro_steps;

-- Create new micro_steps table with TDD-designed schema
CREATE TABLE micro_steps (
    step_id TEXT PRIMARY KEY,
    parent_task_id TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_minutes INTEGER,
    leaf_type TEXT,  -- 'DIGITAL' or 'HUMAN'
    delegation_mode TEXT,  -- 'DO', 'DO_WITH_ME', 'DELEGATE', 'DELETE'
    automation_plan TEXT,  -- JSON: AutomationPlan details
    completed INTEGER DEFAULT 0,  -- Boolean: 0=false, 1=true
    completed_at TIMESTAMP,
    energy_level INTEGER,  -- 1-5 scale for reflection
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint with CASCADE delete
    FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_micro_steps_parent_task
    ON micro_steps(parent_task_id);

CREATE INDEX IF NOT EXISTS idx_micro_steps_completed
    ON micro_steps(completed);

CREATE INDEX IF NOT EXISTS idx_micro_steps_leaf_type
    ON micro_steps(leaf_type);

-- Index for filtering ready tasks (incomplete, DIGITAL)
CREATE INDEX IF NOT EXISTS idx_micro_steps_ready
    ON micro_steps(completed, leaf_type);
