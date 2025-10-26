-- Migration 018: Create creature_templates table
-- Defines the base template for reproducible creature generation

CREATE TABLE IF NOT EXISTS creature_templates (
    template_id TEXT PRIMARY KEY,
    species TEXT NOT NULL,
    creature_type TEXT NOT NULL CHECK(creature_type IN (
        'FIRE', 'WATER', 'EARTH', 'AIR', 'LIGHT', 'SHADOW', 'COSMIC'
    )),
    rarity TEXT NOT NULL CHECK(rarity IN (
        'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'
    )),
    primary_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    accent_color TEXT,
    generation_seed TEXT NOT NULL UNIQUE,
    base_prompt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Optional stats for future battle system
    base_strength INTEGER DEFAULT 10,
    base_agility INTEGER DEFAULT 10,
    base_intelligence INTEGER DEFAULT 10,
    base_charm INTEGER DEFAULT 10
);

CREATE INDEX IF NOT EXISTS idx_templates_rarity ON creature_templates(rarity);
CREATE INDEX IF NOT EXISTS idx_templates_type ON creature_templates(creature_type);
CREATE INDEX IF NOT EXISTS idx_templates_created ON creature_templates(created_at DESC);
