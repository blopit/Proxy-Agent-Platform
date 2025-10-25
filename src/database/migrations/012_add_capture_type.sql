-- Migration 012: Add Capture Type to Tasks Table
-- Enables explicit type distinction for tasks, goals, habits, and shopping lists
-- Part of the comprehensive capture type system implementation

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Add capture_type column to tasks table
-- Values: 'task', 'goal', 'habit', 'shopping_list'
ALTER TABLE tasks ADD COLUMN capture_type TEXT DEFAULT 'task';

-- Create index for type-based queries (filtering by capture type)
CREATE INDEX IF NOT EXISTS idx_tasks_capture_type
    ON tasks(capture_type);

-- Create composite index for common query patterns (type + status)
CREATE INDEX IF NOT EXISTS idx_tasks_type_status
    ON tasks(capture_type, status);

-- Update existing rows to default capture_type based on tags
-- If tags contain 'goal' → set capture_type to 'goal'
-- If tags contain 'habit' → set capture_type to 'habit'
-- If tags contain 'shopping' or 'shopping-list' → set capture_type to 'shopping_list'
-- Otherwise → defaults to 'task'
UPDATE tasks
SET capture_type = CASE
    WHEN tags LIKE '%goal%' THEN 'goal'
    WHEN tags LIKE '%habit%' THEN 'habit'
    WHEN tags LIKE '%shopping%' THEN 'shopping_list'
    ELSE 'task'
END
WHERE capture_type = 'task';

-- Add CHECK constraint to enforce valid capture_type values
-- Note: SQLite doesn't support adding constraints to existing tables,
-- so we'll enforce this in application logic and future table recreations
-- Valid values: 'task', 'goal', 'habit', 'shopping_list'

-- Add comments for documentation
-- capture_type: Discriminates between different capture entities
--   'task' = One-time actionable item with completion criteria
--   'goal' = Long-term objective with milestones and progress tracking
--   'habit' = Recurring activity with frequency pattern and streak tracking
--   'shopping_list' = List of items to purchase with store/category grouping
