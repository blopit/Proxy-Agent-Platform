-- Migration 009: Add User Progress Table for Gamification
-- Created following TDD approach - tests written first!
-- Enables XP tracking, leveling, badges, achievements, and streak tracking

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY NOT NULL,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    tasks_completed INTEGER DEFAULT 0,
    micro_steps_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,  -- Days with activity
    longest_streak INTEGER DEFAULT 0,  -- Best streak achieved
    last_activity_date TEXT,  -- ISO format: YYYY-MM-DD
    badges_earned TEXT,  -- JSON: Array of badge IDs
    achievements TEXT,  -- JSON: Object with achievement details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_progress_xp
    ON user_progress(total_xp DESC);  -- For leaderboard

CREATE INDEX IF NOT EXISTS idx_user_progress_level
    ON user_progress(current_level DESC);  -- For level-based queries

CREATE INDEX IF NOT EXISTS idx_user_progress_activity
    ON user_progress(last_activity_date DESC);  -- For active users
