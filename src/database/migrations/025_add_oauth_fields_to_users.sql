-- Migration: Add OAuth fields to users table
-- Date: 2025-11-07
-- Description: Add oauth_provider and oauth_provider_id columns to support social authentication

-- Add OAuth provider column (google, apple, github, microsoft)
ALTER TABLE users ADD COLUMN oauth_provider TEXT;

-- Add OAuth provider user ID column (unique ID from the provider)
ALTER TABLE users ADD COLUMN oauth_provider_id TEXT;

-- Create index for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider_id
ON users(oauth_provider, oauth_provider_id);

-- Update password_hash to be nullable (OAuth users don't have passwords)
-- SQLite doesn't support modifying columns, so this is just documentation
-- The field is already nullable in the User model
