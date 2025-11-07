-- Migration 024: Add User Onboarding Table
-- Created following TDD approach - tests written first!
-- Captures user preferences from onboarding flow for personalized experience

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create user_onboarding table
CREATE TABLE IF NOT EXISTS user_onboarding (
    user_id TEXT PRIMARY KEY NOT NULL,

    -- Phase 2: Work Preferences (OB-02)
    work_preference TEXT CHECK(work_preference IN ('remote', 'hybrid', 'office', 'flexible')),

    -- Phase 3: ADHD Support (OB-03)
    adhd_support_level INTEGER CHECK(adhd_support_level BETWEEN 1 AND 10),
    adhd_challenges TEXT,  -- JSON: Array of selected challenges

    -- Phase 4: Daily Schedule (OB-04)
    daily_schedule TEXT,  -- JSON: {timePreference, weekGrid, flexibleEnabled}
    time_preference TEXT,  -- morning/afternoon/evening/night/flexible/varied

    -- Phase 5: Productivity Goals (OB-05)
    productivity_goals TEXT,  -- JSON: Array of selected goal types

    -- Phase 6: ChatGPT Export (OB-06)
    chatgpt_export_prompt TEXT,  -- Generated personalized prompt
    chatgpt_exported_at TIMESTAMP,  -- When user exported prompt

    -- Onboarding completion tracking
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_skipped BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    skipped_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed
    ON user_onboarding(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_work_preference
    ON user_onboarding(work_preference);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_adhd_level
    ON user_onboarding(adhd_support_level);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_created
    ON user_onboarding(created_at DESC);
