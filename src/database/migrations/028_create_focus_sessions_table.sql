-- Migration 028: Create Focus Sessions Table (BE-03)
-- Created: November 13, 2025
-- Purpose: Track Pomodoro focus sessions for analytics
-- Following TDD approach - Tests will be written first

-- Table: focus_sessions
-- Stores focus session tracking data
CREATE TABLE IF NOT EXISTS focus_sessions (
    session_id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    step_id TEXT,  -- Optional link to task steps
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    completed INTEGER DEFAULT 0,  -- SQLite uses INTEGER for BOOLEAN (0 = false, 1 = true)
    interruptions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_user ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_step ON focus_sessions(step_id);
CREATE INDEX IF NOT EXISTS idx_focus_started ON focus_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_focus_completed ON focus_sessions(completed);
