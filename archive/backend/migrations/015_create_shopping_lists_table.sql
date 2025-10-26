-- Migration 015: Create Shopping Lists Table
-- Enables shopping list management with store/category grouping and cost tracking
-- Shopping lists are specialized captures with item-level management

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
    list_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,  -- One-to-one with tasks table

    -- List organization
    store_name TEXT,  -- Target store (e.g., "Costco", "Whole Foods", "Amazon")
    store_category TEXT,  -- Store type (e.g., "grocery", "hardware", "electronics")

    -- Shopping details
    shopping_date DATE,  -- When you plan to shop (optional)
    total_estimated_cost DECIMAL(10,2) DEFAULT 0.0,  -- Sum of item estimated prices
    total_actual_cost DECIMAL(10,2) DEFAULT 0.0,  -- Actual total spent
    currency TEXT DEFAULT 'USD',  -- Currency code

    -- Completion tracking
    total_items INTEGER DEFAULT 0,  -- Total number of items
    purchased_items INTEGER DEFAULT 0,  -- Number of items purchased
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,  -- (purchased_items / total_items) * 100

    -- List status
    is_active INTEGER DEFAULT 1,  -- Boolean: 1=active, 0=archived/completed
    is_completed INTEGER DEFAULT 0,  -- Boolean: 1=all items purchased
    completed_at TIMESTAMP,  -- When all items were purchased

    -- Shopping trip details
    shopped_at TIMESTAMP,  -- When shopping was completed
    shopping_duration_minutes INTEGER,  -- How long it took

    -- Metadata
    notes TEXT,  -- Additional notes (e.g., "Use Costco membership card")
    metadata TEXT DEFAULT '{}',  -- Flexible JSON for list-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_shopping_lists_task_id
    ON shopping_lists(task_id);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_store
    ON shopping_lists(store_name, store_category);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_active_status
    ON shopping_lists(is_active, is_completed);

CREATE INDEX IF NOT EXISTS idx_shopping_lists_shopping_date
    ON shopping_lists(shopping_date)
    WHERE is_active = 1 AND is_completed = 0;

-- Composite index for finding active lists by store
CREATE INDEX IF NOT EXISTS idx_shopping_lists_active_store
    ON shopping_lists(is_active, store_name)
    WHERE is_active = 1 AND is_completed = 0;

-- Add comments for documentation
-- list_id: Unique identifier for this shopping list
-- task_id: Links to tasks table (capture_type='shopping_list')
-- store_name: Where you plan to shop
-- store_category: Type of store for grouping
-- shopping_date: Planned shopping date (optional)
-- total_estimated_cost: Sum of all item estimated prices
-- total_actual_cost: Actual total spent (updated after shopping)
-- total_items: Count of items in this list
-- purchased_items: Count of items marked as purchased
-- completion_percentage: Progress indicator (0-100)
-- is_active: Whether list is currently relevant
-- is_completed: Whether all items have been purchased
-- completed_at: When shopping was completed
-- shopped_at: Timestamp when shopping trip occurred
-- shopping_duration_minutes: How long shopping took (for time estimation)
