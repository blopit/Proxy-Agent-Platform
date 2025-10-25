-- Migration 017: Add step_number to micro_steps table for proper ordering
-- Fixes P0 bug where micro-steps lost their ordering (were ordered by created_at instead)
-- step_number ensures micro-steps display in correct sequence

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Add step_number column
ALTER TABLE micro_steps ADD COLUMN step_number INTEGER DEFAULT 1;

-- Add status column (maps to completed: 'todo', 'in_progress', 'done')
ALTER TABLE micro_steps ADD COLUMN status TEXT DEFAULT 'todo';

-- Add actual_minutes column for tracking actual time spent
ALTER TABLE micro_steps ADD COLUMN actual_minutes INTEGER DEFAULT 0;

-- Backfill existing rows with step_number based on created_at order
-- Group by parent_task_id and assign sequential numbers
WITH numbered AS (
    SELECT
        step_id,
        ROW_NUMBER() OVER (
            PARTITION BY parent_task_id
            ORDER BY created_at ASC
        ) as row_num
    FROM micro_steps
)
UPDATE micro_steps
SET step_number = (
    SELECT row_num
    FROM numbered
    WHERE numbered.step_id = micro_steps.step_id
);

-- Update status based on completed field
UPDATE micro_steps
SET status = CASE
    WHEN completed = 1 THEN 'done'
    ELSE 'todo'
END;

-- Create index on step_number for efficient ordering
CREATE INDEX IF NOT EXISTS idx_micro_steps_step_number
    ON micro_steps(parent_task_id, step_number);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_micro_steps_status
    ON micro_steps(status);
