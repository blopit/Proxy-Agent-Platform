-- Migration 023: Create Provider Integration Tables
-- Enables OAuth 2.0 provider connections and AI-powered task generation from provider data
-- Supports Gmail, Google Calendar, Slack, Notion, and other third-party integrations

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- ============================================================================
-- user_integrations: OAuth connections for external providers
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_integrations (
    integration_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- Provider details
    provider TEXT NOT NULL,  -- 'gmail', 'google_calendar', 'google_drive', 'slack', 'notion', 'trello', etc.
    provider_user_id TEXT,   -- User's ID within the provider (e.g., Google email, Slack user ID)
    provider_username TEXT,  -- Display name from provider (e.g., email address, Slack handle)

    -- Connection status
    status TEXT NOT NULL DEFAULT 'disconnected',  -- 'connected', 'disconnected', 'error', 'connecting'
    error_message TEXT,  -- Error details if status is 'error'
    last_sync_at TIMESTAMP,  -- When provider data was last synced
    next_sync_at TIMESTAMP,  -- When next sync is scheduled

    -- OAuth credentials (encrypted)
    access_token TEXT,       -- OAuth access token (encrypted at rest)
    refresh_token TEXT,      -- OAuth refresh token (encrypted at rest)
    token_type TEXT,         -- Usually 'Bearer'
    token_expires_at TIMESTAMP,  -- When access token expires
    scopes TEXT NOT NULL DEFAULT '[]',  -- JSON array of granted scopes

    -- Sync configuration
    sync_enabled INTEGER DEFAULT 1,  -- Boolean: 1=auto-sync on, 0=manual only
    sync_frequency_minutes INTEGER DEFAULT 15,  -- How often to sync (in minutes)
    auto_generate_tasks INTEGER DEFAULT 1,  -- Boolean: 1=auto-generate tasks, 0=suggest only

    -- Provider-specific settings
    -- For Gmail: {"filter_labels": ["INBOX", "IMPORTANT"], "mark_as_read": true}
    -- For Calendar: {"look_ahead_days": 14, "prep_task_hours": 24}
    -- For Slack: {"watched_channels": ["C123456"], "watched_keywords": ["urgent"]}
    settings TEXT DEFAULT '{}',  -- JSON configuration

    -- Metadata
    metadata TEXT DEFAULT '{}',  -- Flexible JSON for provider-specific data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    -- Unique constraint: one connection per provider per user
    UNIQUE(user_id, provider)
);

-- ============================================================================
-- integration_tasks: Tasks generated from provider data (pending approval)
-- ============================================================================
CREATE TABLE IF NOT EXISTS integration_tasks (
    integration_task_id TEXT PRIMARY KEY,
    integration_id TEXT NOT NULL,
    task_id TEXT,  -- Links to tasks table when approved (nullable until approval)

    -- Provider item details
    provider_item_id TEXT NOT NULL,  -- External ID (e.g., Gmail message ID, Calendar event ID)
    provider_item_type TEXT NOT NULL,  -- 'email', 'calendar_event', 'slack_message', 'notion_page'
    provider_url TEXT,  -- Deep link to provider item (e.g., Gmail message URL)

    -- Suggested task details
    suggested_title TEXT NOT NULL,
    suggested_description TEXT,
    suggested_priority TEXT DEFAULT 'medium',  -- 'low', 'medium', 'high'
    suggested_due_date TIMESTAMP,
    suggested_estimated_hours REAL,
    suggested_tags TEXT DEFAULT '[]',  -- JSON array

    -- AI generation metadata
    ai_confidence REAL,  -- 0.0-1.0 confidence score from AI
    ai_reasoning TEXT,  -- Why AI thinks this should be a task
    generation_model TEXT,  -- Which model generated this (e.g., 'gpt-4.1-mini')

    -- Sync status
    sync_status TEXT NOT NULL DEFAULT 'pending_approval',  -- 'pending_approval', 'approved', 'dismissed', 'auto_approved'
    reviewed_at TIMESTAMP,  -- When user approved/dismissed
    reviewed_by TEXT,  -- User ID who reviewed (if different from owner)

    -- Provider item snapshot (for context when reviewing)
    -- For email: {"subject": "...", "from": "...", "snippet": "...", "received_at": "..."}
    -- For calendar: {"summary": "...", "start": "...", "attendees": [...], "description": "..."}
    provider_item_snapshot TEXT DEFAULT '{}',  -- JSON snapshot of provider data

    -- Metadata
    metadata TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (integration_id) REFERENCES user_integrations(integration_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE SET NULL,

    -- Unique constraint: one suggestion per provider item
    UNIQUE(integration_id, provider_item_id)
);

-- ============================================================================
-- integration_sync_logs: Track sync history and errors
-- ============================================================================
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    log_id TEXT PRIMARY KEY,
    integration_id TEXT NOT NULL,

    -- Sync details
    sync_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_completed_at TIMESTAMP,
    sync_status TEXT NOT NULL,  -- 'success', 'partial_success', 'failed'
    error_message TEXT,

    -- Sync stats
    items_fetched INTEGER DEFAULT 0,  -- Total items retrieved from provider
    tasks_generated INTEGER DEFAULT 0,  -- Tasks created from this sync
    tasks_auto_approved INTEGER DEFAULT 0,  -- Tasks auto-approved (high confidence)
    tasks_pending_review INTEGER DEFAULT 0,  -- Tasks waiting for user review

    -- Provider API usage
    api_calls_made INTEGER DEFAULT 0,
    quota_remaining INTEGER,  -- If provider exposes quota info

    -- Metadata
    metadata TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraints
    FOREIGN KEY (integration_id) REFERENCES user_integrations(integration_id) ON DELETE CASCADE
);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

-- user_integrations indexes
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id
    ON user_integrations(user_id);

CREATE INDEX IF NOT EXISTS idx_user_integrations_provider
    ON user_integrations(provider);

CREATE INDEX IF NOT EXISTS idx_user_integrations_status
    ON user_integrations(status);

CREATE INDEX IF NOT EXISTS idx_user_integrations_sync
    ON user_integrations(sync_enabled, next_sync_at)
    WHERE sync_enabled = 1;

-- integration_tasks indexes
CREATE INDEX IF NOT EXISTS idx_integration_tasks_integration_id
    ON integration_tasks(integration_id);

CREATE INDEX IF NOT EXISTS idx_integration_tasks_task_id
    ON integration_tasks(task_id);

CREATE INDEX IF NOT EXISTS idx_integration_tasks_sync_status
    ON integration_tasks(sync_status);

CREATE INDEX IF NOT EXISTS idx_integration_tasks_provider_item
    ON integration_tasks(provider_item_type, provider_item_id);

-- Composite index for user's pending tasks
CREATE INDEX IF NOT EXISTS idx_integration_tasks_user_pending
    ON integration_tasks(integration_id, sync_status)
    WHERE sync_status = 'pending_approval';

-- integration_sync_logs indexes
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration_id
    ON integration_sync_logs(integration_id);

CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_started_at
    ON integration_sync_logs(sync_started_at DESC);

-- ============================================================================
-- Documentation / Comments
-- ============================================================================

-- user_integrations table:
-- - Stores OAuth credentials for third-party provider connections
-- - One row per provider per user (e.g., user can have Gmail + Slack + Notion)
-- - Tokens should be encrypted at rest using application-level encryption
-- - Supports both automatic and manual sync modes
-- - Settings are provider-specific JSON configurations

-- integration_tasks table:
-- - Stores AI-generated task suggestions from provider data
-- - Pending tasks await user approval before being added to main tasks table
-- - High-confidence tasks can be auto-approved based on user preferences
-- - Provider item snapshot allows reviewing context without re-fetching from API
-- - Each suggestion links back to original provider item (email, event, etc.)

-- integration_sync_logs table:
-- - Tracks sync history for debugging and monitoring
-- - Records API usage and quota information
-- - Helps identify sync issues and performance patterns

-- Security notes:
-- - access_token and refresh_token should be encrypted using Fernet or similar
-- - Never log tokens in sync_logs or metadata fields
-- - Implement token rotation on refresh
-- - Validate scopes before syncing data

-- Example workflow:
-- 1. User clicks "Connect Gmail" in frontend
-- 2. OAuth flow creates user_integrations row with status='connecting'
-- 3. Callback stores tokens, sets status='connected', schedules next_sync_at
-- 4. Background sync job fetches unread emails
-- 5. AI generates task suggestions → integration_tasks rows (sync_status='pending_approval')
-- 6. Frontend shows TaskSuggestionFeed with pending tasks
-- 7. User clicks "Approve" → Creates task in tasks table, updates sync_status='approved'
-- 8. Bidirectional sync: When task marked done, email marked as read via API
