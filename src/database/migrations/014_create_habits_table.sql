-- Migration 014: Create Habits Table
-- Enables habit tracking with recurrence patterns, streaks, and completion history
-- Habits are specialized captures with recurring schedules and streak counting

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    habit_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL UNIQUE,  -- One-to-one with tasks table

    -- Recurrence pattern
    frequency TEXT NOT NULL,  -- 'daily', 'weekly', 'monthly', 'custom'

    -- Recurrence pattern (RRULE-compatible JSON):
    -- {
    --   "frequency": "daily"|"weekly"|"monthly"|"custom",
    --   "interval": 1,  -- Every N days/weeks/months
    --   "active_days": [0,1,2,3,4,5,6],  -- For weekly: 0=Sunday, 6=Saturday
    --   "time_of_day": "09:00",  -- Preferred time (optional)
    --   "rrule": "FREQ=WEEKLY;BYDAY=MO,WE,FR"  -- Full RRULE string (optional)
    -- }
    recurrence_pattern TEXT NOT NULL DEFAULT '{}',

    -- Streak tracking
    streak_count INTEGER DEFAULT 0,  -- Current consecutive completion streak
    longest_streak INTEGER DEFAULT 0,  -- Best streak ever achieved
    total_completions INTEGER DEFAULT 0,  -- Total times completed
    last_completed_at TIMESTAMP,  -- When habit was last completed

    -- Reminders
    reminder_time TEXT,  -- Time for notifications (HH:MM format, e.g., "09:00")
    reminder_enabled INTEGER DEFAULT 0,  -- Boolean: 1=reminders on, 0=off

    -- Activity status
    is_active INTEGER DEFAULT 1,  -- Boolean: 1=active, 0=paused/archived
    paused_at TIMESTAMP,  -- When habit was paused (if applicable)

    -- Completion history (denormalized for quick stats)
    -- Stored as JSON array of ISO dates: ["2024-01-15", "2024-01-16", "2024-01-17"]
    completion_history TEXT DEFAULT '[]',

    -- Metadata
    notes TEXT,  -- Additional notes or context
    metadata TEXT DEFAULT '{}',  -- Flexible JSON for habit-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Create habit_completions table for detailed completion tracking
CREATE TABLE IF NOT EXISTS habit_completions (
    completion_id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,

    -- Completion details
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TEXT NOT NULL,  -- ISO date (YYYY-MM-DD) for easy grouping

    -- Optional: How well did you do?
    energy_level INTEGER,  -- 1-5 scale (optional)
    mood TEXT,  -- 'good', 'neutral', 'bad' (optional)
    notes TEXT,  -- Optional notes about this completion

    -- Metadata
    metadata TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (habit_id) REFERENCES habits(habit_id) ON DELETE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_habits_task_id
    ON habits(task_id);

CREATE INDEX IF NOT EXISTS idx_habits_active_status
    ON habits(is_active);

CREATE INDEX IF NOT EXISTS idx_habits_frequency
    ON habits(frequency);

CREATE INDEX IF NOT EXISTS idx_habits_reminder_time
    ON habits(reminder_time)
    WHERE reminder_enabled = 1;

-- Composite index for finding habits due today
CREATE INDEX IF NOT EXISTS idx_habits_active_due
    ON habits(is_active, frequency)
    WHERE is_active = 1;

-- Indexes for habit_completions table
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id
    ON habit_completions(habit_id);

CREATE INDEX IF NOT EXISTS idx_habit_completions_date
    ON habit_completions(completion_date);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date
    ON habit_completions(habit_id, completion_date);

-- Add comments for documentation
-- habit_id: Unique identifier for this habit
-- task_id: Links to tasks table (capture_type='habit')
-- frequency: Simplified frequency type for quick filtering
-- recurrence_pattern: Full RRULE-compatible JSON pattern
-- streak_count: Current consecutive days/weeks/months completed
-- longest_streak: Record streak (for motivation)
-- total_completions: Lifetime completion count
-- last_completed_at: Timestamp of most recent completion
-- reminder_time: Time of day for notifications (HH:MM format)
-- reminder_enabled: Whether to send reminders
-- is_active: Whether habit is currently being tracked
-- paused_at: When habit was paused (to resume later)
-- completion_history: Quick-access array of completion dates (last 90 days)
-- habit_completions: Detailed table for full completion history with mood/energy
