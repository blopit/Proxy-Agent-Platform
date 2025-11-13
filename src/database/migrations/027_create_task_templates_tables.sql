-- Migration 027: Create Task Templates Tables (BE-01)
-- Created: November 13, 2025
-- Purpose: Enable reusable task templates with pre-defined micro-steps
-- Following TDD approach - Tests written first, now implementing schema

-- Table: task_templates
-- Stores template metadata (name, category, icon, etc.)
CREATE TABLE IF NOT EXISTS task_templates (
    template_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN ('Academic', 'Work', 'Personal', 'Health', 'Creative')),
    icon TEXT,
    estimated_minutes INTEGER,
    created_by TEXT DEFAULT 'system',
    is_public BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: template_steps
-- Stores individual steps within a template
CREATE TABLE IF NOT EXISTS template_steps (
    step_id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    description TEXT NOT NULL,
    short_label TEXT,
    estimated_minutes INTEGER,
    leaf_type TEXT DEFAULT 'HUMAN' CHECK(leaf_type IN ('DIGITAL', 'HUMAN')),
    icon TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES task_templates(template_id) ON DELETE CASCADE,
    UNIQUE(template_id, step_order)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON task_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON task_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_template_steps_template ON template_steps(template_id);
CREATE INDEX IF NOT EXISTS idx_template_steps_order ON template_steps(template_id, step_order);
