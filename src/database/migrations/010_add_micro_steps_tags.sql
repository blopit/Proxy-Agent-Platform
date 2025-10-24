-- Migration 010: Add CHAMPS Tags to MicroSteps Table
-- Enables LLM-generated success criteria and expectations for micro-steps
-- Uses CHAMPS framework: Conversation, Help, Activity, Movement, Participation, Success

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Add tags column to micro_steps table
ALTER TABLE micro_steps ADD COLUMN tags TEXT;  -- JSON: Array of CHAMPS-based tags

-- Create index for tag-based queries
CREATE INDEX IF NOT EXISTS idx_micro_steps_tags
    ON micro_steps(tags);

-- Add comment for documentation
-- Tags are stored as JSON array of strings
-- Example: ["💬 Communication", "🎯 Focused", "⚡ Quick Win", "🎯 Complete"]
