-- Migration 021: Create creature_collection_progress table
-- Tracks which creatures a user has "seen" (for Pokedex-style collection)

CREATE TABLE IF NOT EXISTS creature_collection_progress (
    user_id TEXT NOT NULL,
    template_id TEXT NOT NULL REFERENCES creature_templates(template_id),

    -- Discovery
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    discovered_from TEXT,  -- 'OWNED', 'SEEN_IN_TRADE', 'FRIEND_COLLECTION', 'EVENT'

    -- Ownership tracking
    ever_owned BOOLEAN NOT NULL DEFAULT FALSE,
    currently_owned BOOLEAN NOT NULL DEFAULT FALSE,
    times_owned INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (user_id, template_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collection_user ON creature_collection_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_discovered ON creature_collection_progress(user_id, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_owned ON creature_collection_progress(user_id, currently_owned);
