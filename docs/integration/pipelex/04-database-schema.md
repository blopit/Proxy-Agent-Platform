## 🗄️ Database Schema

### Table: `workflow_templates`

Stores metadata about available workflows (not the .plx file content).

```sql
CREATE TABLE workflow_templates (
    -- Primary key
    workflow_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core metadata
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,  -- 'personal', 'business', 'academic', 'creative', 'health'
    icon VARCHAR(50),                -- Emoji (e.g., '🌅', '💼', '📚')

    -- Pipelex-specific
    plx_file_url TEXT NOT NULL,      -- S3/CDN URL: "https://cdn.example.com/workflows/morning-routine.plx"
    plx_version VARCHAR(50),         -- Pipelex language version (e.g., "0.1.0")
    required_concepts TEXT[],        -- ["UserEnergy", "Schedule"] - inputs needed
    output_concepts TEXT[],          -- ["RoutinePlan", "PlatformTask"] - outputs produced

    -- LLM requirements
    default_llm_provider VARCHAR(100) DEFAULT 'anthropic:claude-3-5-sonnet',
    estimated_tokens INT,            -- Avg tokens per execution (for cost estimation)
    estimated_cost_usd DECIMAL(10, 4),  -- Avg cost per execution in USD
    execution_time_seconds INT,      -- Avg execution time

    -- Publishing info
    author_id UUID REFERENCES users(user_id),  -- Creator (NULL for system templates)
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,  -- Verified by platform team
    is_premium BOOLEAN DEFAULT FALSE,   -- Requires payment
    price_usd DECIMAL(10, 2),          -- Price if premium (NULL if free)

    -- Usage statistics
    download_count INT DEFAULT 0,
    execution_count INT DEFAULT 0,
    success_rate DECIMAL(5, 2),        -- % of successful executions
    avg_rating DECIMAL(3, 2),          -- 1.0 - 5.0 stars
    review_count INT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_executed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_workflows_category ON workflow_templates(category);
CREATE INDEX idx_workflows_public ON workflow_templates(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_workflows_author ON workflow_templates(author_id);
CREATE INDEX idx_workflows_rating ON workflow_templates(avg_rating DESC);
CREATE INDEX idx_workflows_downloads ON workflow_templates(download_count DESC);

-- Full-text search index
CREATE INDEX idx_workflows_search ON workflow_templates USING gin(
    to_tsvector('english', name || ' ' || description)
);
```

### Table: `workflow_executions`

Tracks each time a workflow is executed (for analytics and debugging).

```sql
CREATE TABLE workflow_executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,

    -- Execution details
    status VARCHAR(50) NOT NULL,     -- 'running', 'completed', 'failed', 'cancelled'
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_seconds INT,

    -- Inputs/outputs (stored as JSONB for analysis)
    input_context JSONB,             -- { "user_energy": 2, "schedule": [...] }
    output_result JSONB,             -- { "routine_plan": {...}, "task_created": "task_id" }
    error_message TEXT,              -- If failed, store error

    -- Cost tracking
    llm_provider_used VARCHAR(100),
    tokens_used INT,
    actual_cost_usd DECIMAL(10, 4),

    -- Result tracking
    task_id UUID REFERENCES tasks(task_id),  -- The task created by this workflow
    task_completed BOOLEAN DEFAULT FALSE,     -- Did user complete the task?
    task_completion_rate DECIMAL(5, 2)        -- % of steps completed
);

CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_user ON workflow_executions(user_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_executions_date ON workflow_executions(started_at DESC);
```

### Table: `workflow_reviews`

User ratings and reviews for workflows.

```sql
CREATE TABLE workflow_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,

    -- Review content
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,

    -- Metadata
    execution_id UUID REFERENCES workflow_executions(execution_id),  -- Which execution was reviewed
    is_verified_purchase BOOLEAN DEFAULT FALSE,  -- Did user execute it?
    helpful_count INT DEFAULT 0,  -- Upvotes

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(workflow_id, user_id)  -- One review per user per workflow
);

CREATE INDEX idx_reviews_workflow ON workflow_reviews(workflow_id);
CREATE INDEX idx_reviews_rating ON workflow_reviews(rating DESC);
```

### Table: `user_workflow_library`

Tracks which workflows each user has downloaded/installed.

```sql
CREATE TABLE user_workflow_library (
    library_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,

    -- Customization
    is_customized BOOLEAN DEFAULT FALSE,  -- Did user edit the .plx file?
    custom_plx_content TEXT,              -- If customized, store their version

    -- Usage
    last_executed_at TIMESTAMP,
    execution_count INT DEFAULT 0,
    is_favorited BOOLEAN DEFAULT FALSE,

    -- Timestamps
    added_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, workflow_id)
);

CREATE INDEX idx_library_user ON user_workflow_library(user_id);
CREATE INDEX idx_library_workflow ON user_workflow_library(workflow_id);
```

### Table: `workflow_tags`

Tagging system for workflows (many-to-many).

```sql
CREATE TABLE workflow_tags (
    tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_templates(workflow_id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,

    UNIQUE(workflow_id, tag)
);

CREATE INDEX idx_tags_workflow ON workflow_tags(workflow_id);
CREATE INDEX idx_tags_tag ON workflow_tags(tag);

-- Popular tags: 'adhd-friendly', 'quick-win', 'morning', 'evening', 'productivity', etc.
```
