-- Migration 016: Create Shopping List Items Table
-- Enables item-level tracking with quantities, prices, and categories
-- Each shopping list can have multiple items that can be checked off individually

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
    item_id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL,  -- Foreign key to shopping_lists

    -- Item details
    name TEXT NOT NULL,  -- Item name (e.g., "Milk", "Eggs", "Paper Towels")
    quantity DECIMAL(10,2) DEFAULT 1.0,  -- How many (e.g., 2.5)
    unit TEXT,  -- Unit of measurement (gallons, dozen, lbs, oz, count, etc.)

    -- Pricing
    estimated_price DECIMAL(10,2),  -- Estimated price per item or total
    actual_price DECIMAL(10,2),  -- Actual price paid
    currency TEXT DEFAULT 'USD',  -- Currency code

    -- Categorization
    category TEXT,  -- Product category (produce, dairy, meat, bakery, frozen, etc.)
    aisle TEXT,  -- Store aisle/location (optional, e.g., "A12", "Produce Section")

    -- Priority and ordering
    priority TEXT DEFAULT 'medium',  -- 'high', 'medium', 'low' (what's most important)
    item_order INTEGER DEFAULT 0,  -- Display/shopping order (0 = first)

    -- Purchase tracking
    is_purchased INTEGER DEFAULT 0,  -- Boolean: 1=purchased, 0=not yet
    purchased_at TIMESTAMP,  -- When this item was purchased

    -- Metadata
    notes TEXT,  -- Additional notes (e.g., "Get organic", "Check expiration date")
    brand TEXT,  -- Preferred brand (optional)
    barcode TEXT,  -- Product barcode/UPC (for scanning, optional)
    metadata TEXT DEFAULT '{}',  -- Flexible JSON for item-specific data

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (list_id) REFERENCES shopping_lists(list_id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_shopping_items_list_id
    ON shopping_list_items(list_id);

CREATE INDEX IF NOT EXISTS idx_shopping_items_purchased
    ON shopping_list_items(list_id, is_purchased);

CREATE INDEX IF NOT EXISTS idx_shopping_items_category
    ON shopping_list_items(list_id, category);

CREATE INDEX IF NOT EXISTS idx_shopping_items_priority
    ON shopping_list_items(list_id, priority);

-- Composite index for ordering items within a list
CREATE INDEX IF NOT EXISTS idx_shopping_items_order
    ON shopping_list_items(list_id, item_order);

-- Index for finding unpurchased items
CREATE INDEX IF NOT EXISTS idx_shopping_items_unpurchased
    ON shopping_list_items(list_id, is_purchased, item_order)
    WHERE is_purchased = 0;

-- Index for category-grouped shopping (all dairy together, all produce together)
CREATE INDEX IF NOT EXISTS idx_shopping_items_category_order
    ON shopping_list_items(list_id, category, item_order);

-- Add comments for documentation
-- item_id: Unique identifier for this item
-- list_id: Links to shopping_lists table
-- name: Item name/description
-- quantity: Amount needed (supports decimals for weights, volumes)
-- unit: Measurement unit (optional, e.g., "lbs", "gallons", "count")
-- estimated_price: Expected cost (helps with budgeting)
-- actual_price: Real price paid (for expense tracking)
-- category: Product category for grouping (produce, dairy, meat, etc.)
-- aisle: Store location for efficient shopping route
-- priority: Importance level (high=must-have, low=optional)
-- item_order: Display order within list (or shopping route order)
-- is_purchased: Whether item has been checked off
-- purchased_at: Timestamp when item was marked as purchased
-- notes: Optional notes (brand preferences, special instructions)
-- brand: Preferred brand name
-- barcode: UPC/barcode for quick identification
