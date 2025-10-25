-- Migration 013: Create Goals Table
-- Enables goal tracking with milestones, progress tracking, and hierarchical goals
-- Goals are specialized captures with target values and achievement dates

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    goal_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,  -- One-to-one with tasks table

    -- Goal-specific fields
    target_value DECIMAL(20,4),  -- Numeric target (e.g., 20 for "lose 20 pounds")
    current_value DECIMAL(20,4) DEFAULT 0.0,  -- Current progress
    unit TEXT,  -- Unit of measurement (pounds, dollars, hours, km, etc.)
    target_date TIMESTAMP,  -- When you want to achieve this goal

    -- Milestones: JSON array of {value: number, date: ISO, completed: bool, completed_at: ISO}
    -- Example: [{"value": 5, "date": "2024-01-15", "completed": true, "completed_at": "2024-01-14"}]
    milestones TEXT DEFAULT '[]',

    -- Progress tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,  -- Computed: (current_value / target_value) * 100
    last_progress_update TIMESTAMP,  -- When progress was last updated

    -- Goal hierarchy (goals can have sub-goals)
    parent_goal_id TEXT,  -- Parent goal (NULL for top-level goals)

    -- Goal status tracking
    is_active INTEGER DEFAULT 1,  -- Boolean: 1=active, 0=archived
    is_achieved INTEGER DEFAULT 0,  -- Boolean: 1=achieved, 0=in-progress
    achieved_at TIMESTAMP,  -- When the goal was achieved

    -- Metadata
    notes TEXT,  -- Additional notes or context
    metadata TEXT DEFAULT '{}',  -- Flexible JSON for goal-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_goals_task_id
    ON goals(task_id);

CREATE INDEX IF NOT EXISTS idx_goals_parent_goal
    ON goals(parent_goal_id);

CREATE INDEX IF NOT EXISTS idx_goals_active_status
    ON goals(is_active, is_achieved);

CREATE INDEX IF NOT EXISTS idx_goals_target_date
    ON goals(target_date);

-- Composite index for filtering active goals by due date
CREATE INDEX IF NOT EXISTS idx_goals_active_due
    ON goals(is_active, target_date)
    WHERE is_active = 1 AND is_achieved = 0;

-- Index for progress tracking queries
CREATE INDEX IF NOT EXISTS idx_goals_progress
    ON goals(progress_percentage);

-- Add comments for documentation
-- goal_id: Unique identifier for this goal
-- task_id: Links to tasks table (capture_type='goal')
-- target_value: Numeric target (NULL for non-quantifiable goals like "Learn Python")
-- current_value: Current progress towards target
-- unit: Measurement unit (NULL for non-quantifiable goals)
-- target_date: Deadline or target achievement date
-- milestones: JSON array of intermediate checkpoints
-- progress_percentage: Auto-calculated or manually set (0-100)
-- parent_goal_id: Enables goal hierarchies (e.g., "Get Fit" → "Run 5K", "Lose Weight")
-- is_active: Whether goal is currently being pursued
-- is_achieved: Whether goal has been completed
-- achieved_at: Timestamp when goal was marked as achieved
