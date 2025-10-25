-- Migration 019: Create user_creatures table
-- Instances of creatures owned by users

CREATE TABLE IF NOT EXISTS user_creatures (
    creature_id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    template_id TEXT NOT NULL REFERENCES creature_templates(template_id),

    -- Customization
    nickname TEXT,  -- NULL = use species name from template

    -- Progression
    level INTEGER NOT NULL DEFAULT 1 CHECK(level >= 1 AND level <= 100),
    xp INTEGER NOT NULL DEFAULT 0,
    evolution_stage TEXT NOT NULL DEFAULT 'BABY' CHECK(evolution_stage IN (
        'BABY', 'TEEN', 'ADULT', 'ELITE', 'MASTER', 'LEGENDARY', 'MYTHIC'
    )),

    -- Images for each evolution stage (generated on-demand)
    image_baby TEXT,
    image_teen TEXT,
    image_adult TEXT,
    image_elite TEXT,
    image_master TEXT,
    image_legendary TEXT,
    image_mythic TEXT,

    -- Metadata
    is_starter BOOLEAN NOT NULL DEFAULT FALSE,
    is_tradeable BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,  -- Currently selected creature gaining XP
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    obtained_from TEXT CHECK(obtained_from IN (
        'STARTER', 'TASK_REWARD', 'MYSTERY_BOX', 'TRADE', 'GIFT', 'EVENT'
    )),
    obtained_from_user_id TEXT,  -- If obtained via trade/gift

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_creatures_owner ON user_creatures(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_user_creatures_template ON user_creatures(template_id);
CREATE INDEX IF NOT EXISTS idx_user_creatures_level ON user_creatures(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_creatures_active ON user_creatures(owner_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_creatures_obtained ON user_creatures(obtained_at DESC);

-- Ensure only one active creature per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_per_user
ON user_creatures(owner_user_id)
WHERE is_active = TRUE;
