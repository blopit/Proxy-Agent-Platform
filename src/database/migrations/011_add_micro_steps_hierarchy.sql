-- Migration 011: Add Hierarchical Structure to MicroSteps Table
-- Enables recursive tree structure where micro-steps can have parent-child relationships
-- Allows progressive disclosure: expand complex steps to see nested sub-steps

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Add hierarchy columns to micro_steps table
ALTER TABLE micro_steps ADD COLUMN parent_step_id TEXT;  -- Parent micro-step ID (self-referential)
ALTER TABLE micro_steps ADD COLUMN level INTEGER DEFAULT 0;  -- Depth in tree (0 = top-level)
ALTER TABLE micro_steps ADD COLUMN is_leaf INTEGER DEFAULT 1;  -- Boolean: 1=atomic/can't decompose, 0=can decompose
ALTER TABLE micro_steps ADD COLUMN decomposition_state TEXT DEFAULT 'atomic';  -- 'stub', 'decomposing', 'decomposed', 'atomic'
ALTER TABLE micro_steps ADD COLUMN short_label TEXT;  -- 1-2 word label for UI display
ALTER TABLE micro_steps ADD COLUMN icon TEXT;  -- Emoji icon for this step

-- Create self-referential foreign key constraint (in a new table with migration)
-- Note: SQLite doesn't support ADD CONSTRAINT for existing tables, so we'll handle this in application logic

-- Create indexes for hierarchical queries
CREATE INDEX IF NOT EXISTS idx_micro_steps_parent_step
    ON micro_steps(parent_step_id);

CREATE INDEX IF NOT EXISTS idx_micro_steps_level
    ON micro_steps(level);

CREATE INDEX IF NOT EXISTS idx_micro_steps_leaf_status
    ON micro_steps(is_leaf, decomposition_state);

-- Update existing rows with defaults
-- All existing micro-steps are top-level (parent_step_id = NULL, level = 0)
-- All existing micro-steps are atomic leaves (is_leaf = 1, decomposition_state = 'atomic')
UPDATE micro_steps
SET
    parent_step_id = NULL,
    level = 0,
    is_leaf = 1,
    decomposition_state = 'atomic'
WHERE parent_step_id IS NULL;

-- Add comments for documentation
-- parent_step_id: NULL for top-level steps, or ID of parent micro-step
-- level: 0 = top-level, 1 = first child, 2 = grandchild, etc.
-- is_leaf: 1 if step is atomic (2-5 min, can't be decomposed), 0 if can be expanded
-- decomposition_state:
--   'stub' = created but not decomposed yet
--   'decomposing' = AI is working on decomposition
--   'decomposed' = has children, fully decomposed
--   'atomic' = cannot decompose (leaf node or <= 5 min)
-- short_label: Concise 1-2 word label (e.g., "Draft" for "Draft email message")
-- icon: Emoji icon representing this step (e.g., "📝" for writing tasks)
