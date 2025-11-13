# Database Schema - Authentication & Onboarding

## Overview

The authentication and onboarding system uses three main SQLite tables:
1. `users` - User accounts and authentication
2. `refresh_tokens` - JWT refresh token management
3. `user_onboarding` - User onboarding preferences

## Table Schemas

### 1. users

Stores user account information, supporting both email/password and OAuth authentication.

```sql
CREATE TABLE users (
    user_id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,  -- NULL for OAuth users
    full_name TEXT,

    -- OAuth fields (added in migration 025)
    oauth_provider TEXT,  -- 'google', 'apple', 'github', 'microsoft'
    oauth_provider_id TEXT,  -- Provider's unique user ID

    -- Profile
    timezone TEXT DEFAULT 'UTC',
    avatar_url TEXT,
    bio TEXT,

    -- Preferences (stored as JSON)
    preferences TEXT DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth_provider_id ON users(oauth_provider, oauth_provider_id);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | TEXT (UUID) | Yes | Primary key, UUID v4 |
| `username` | TEXT | Yes | Unique username (3-50 chars, alphanumeric + underscore) |
| `email` | TEXT | Yes | Unique email address |
| `password_hash` | TEXT | No | Bcrypt hashed password (NULL for OAuth users) |
| `full_name` | TEXT | No | User's full name (max 255 chars) |
| `oauth_provider` | TEXT | No | OAuth provider name if user signed up via OAuth |
| `oauth_provider_id` | TEXT | No | User's ID from the OAuth provider |
| `timezone` | TEXT | No | User's timezone (default: 'UTC') |
| `avatar_url` | TEXT | No | URL to user's avatar image |
| `bio` | TEXT | No | User bio (max 500 chars) |
| `preferences` | TEXT (JSON) | No | User preferences as JSON object |
| `is_active` | BOOLEAN | Yes | Whether user account is active |
| `last_login` | TIMESTAMP | No | Last successful login timestamp |
| `created_at` | TIMESTAMP | Yes | Account creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last update timestamp |

#### Username Generation for OAuth

OAuth users get auto-generated usernames:
```python
# Format: user_{first_8_chars_of_uuid}
user_id = str(uuid4())  # e.g., "7a3b8c9d-1234-5678-90ab-cdef12345678"
username = f"user_{user_id[:8]}"  # e.g., "user_7a3b8c9d"
```

### 2. refresh_tokens

Manages JWT refresh tokens with support for token rotation and revocation.

```sql
CREATE TABLE refresh_tokens (
    token_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,  -- SHA256 hash of the token
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT 0,
    revoked_at TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for efficient lookups
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `token_id` | TEXT (UUID) | Yes | Primary key, UUID v4 |
| `user_id` | TEXT (UUID) | Yes | Foreign key to users table |
| `token_hash` | TEXT | Yes | SHA256 hash of the refresh token (NOT the token itself) |
| `expires_at` | TIMESTAMP | Yes | Token expiration timestamp |
| `created_at` | TIMESTAMP | Yes | Token creation timestamp |
| `revoked` | BOOLEAN | Yes | Whether token has been revoked |
| `revoked_at` | TIMESTAMP | No | When token was revoked |

#### Security Notes

- **Never store plaintext tokens**: Only the SHA256 hash is stored
- **Token rotation**: When a refresh token is used, it's revoked and a new one is issued
- **Cascade deletion**: When a user is deleted, all their refresh tokens are deleted
- **Cleanup**: Expired and revoked tokens can be periodically deleted

#### Token Lifecycle

```python
# 1. Create refresh token
token = secrets.token_urlsafe(32)  # Random 32-byte token
token_hash = hashlib.sha256(token.encode()).hexdigest()
expires_at = datetime.now(UTC) + timedelta(days=30)

# 2. Store in database
INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at)
VALUES (uuid4(), user_id, token_hash, expires_at)

# 3. Verify refresh token
provided_hash = hashlib.sha256(provided_token.encode()).hexdigest()
SELECT user_id FROM refresh_tokens
WHERE token_hash = provided_hash
  AND revoked = 0
  AND expires_at > CURRENT_TIMESTAMP

# 4. Revoke on use (token rotation)
UPDATE refresh_tokens
SET revoked = 1, revoked_at = CURRENT_TIMESTAMP
WHERE token_hash = provided_hash
```

### 3. user_onboarding

Stores user onboarding preferences and progress.

```sql
CREATE TABLE user_onboarding (
    user_id TEXT PRIMARY KEY NOT NULL,

    -- Phase 2: Work Preferences
    work_preference TEXT CHECK(work_preference IN ('remote', 'hybrid', 'office', 'flexible')),

    -- Phase 3: ADHD Support
    adhd_support_level INTEGER CHECK(adhd_support_level BETWEEN 1 AND 10),
    adhd_challenges TEXT,  -- JSON: Array of selected challenges

    -- Phase 4: Daily Schedule
    daily_schedule TEXT,  -- JSON: {timePreference, weekGrid, flexibleEnabled}
    time_preference TEXT,  -- 'morning', 'afternoon', 'evening', 'night', 'flexible', 'varied'

    -- Phase 5: Productivity Goals
    productivity_goals TEXT,  -- JSON: Array of selected goal types

    -- Phase 6: ChatGPT Export
    chatgpt_export_prompt TEXT,  -- Generated personalized prompt
    chatgpt_exported_at TIMESTAMP,  -- When user exported prompt

    -- Onboarding completion tracking
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_skipped BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    skipped_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX idx_user_onboarding_completed ON user_onboarding(onboarding_completed);
CREATE INDEX idx_user_onboarding_work_preference ON user_onboarding(work_preference);
CREATE INDEX idx_user_onboarding_adhd_level ON user_onboarding(adhd_support_level);
CREATE INDEX idx_user_onboarding_created ON user_onboarding(created_at DESC);
```

#### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | TEXT (UUID) | Yes | Primary key, foreign key to users |
| `work_preference` | TEXT | No | User's work mode: 'remote', 'hybrid', 'office', or 'flexible' |
| `adhd_support_level` | INTEGER | No | ADHD support level (1-10 scale) |
| `adhd_challenges` | TEXT (JSON) | No | Array of challenge strings |
| `daily_schedule` | TEXT (JSON) | No | Daily schedule object |
| `time_preference` | TEXT | No | Preferred work time |
| `productivity_goals` | TEXT (JSON) | No | Array of goal type strings |
| `chatgpt_export_prompt` | TEXT | No | Generated ChatGPT prompt (future feature) |
| `chatgpt_exported_at` | TIMESTAMP | No | Export timestamp |
| `onboarding_completed` | BOOLEAN | Yes | Whether user completed onboarding |
| `onboarding_skipped` | BOOLEAN | Yes | Whether user skipped onboarding |
| `completed_at` | TIMESTAMP | No | Completion timestamp |
| `skipped_at` | TIMESTAMP | No | Skip timestamp |
| `created_at` | TIMESTAMP | Yes | First onboarding data save |
| `updated_at` | TIMESTAMP | Yes | Last onboarding update |

#### JSON Field Formats

##### adhd_challenges
```json
["task_switching", "time_blindness", "focus", "overwhelm"]
```

##### daily_schedule
```json
{
  "preferredStartTime": "09:00",
  "preferredEndTime": "17:00",
  "timePreference": "morning",
  "weeklyAvailability": {
    "monday": true,
    "tuesday": true,
    "wednesday": true,
    "thursday": true,
    "friday": true,
    "saturday": false,
    "sunday": false
  },
  "flexibleSchedule": false
}
```

##### productivity_goals
```json
["task_completion", "focus_time", "work_life_balance"]
```

## Entity Relationships

```
users (1) ──< (N) refresh_tokens
  │
  └── (1:1) user_onboarding
```

### Relationship Details

1. **users ↔ refresh_tokens** (One-to-Many)
   - One user can have multiple refresh tokens (different devices/sessions)
   - Tokens are deleted when user is deleted (CASCADE)
   - Foreign key: `refresh_tokens.user_id → users.user_id`

2. **users ↔ user_onboarding** (One-to-One)
   - One user has at most one onboarding record
   - Onboarding is deleted when user is deleted (CASCADE)
   - Foreign key: `user_onboarding.user_id → users.user_id`

## Pydantic Models

### User Model

```python
# src/core/task_models.py
class User(BaseModel):
    user_id: str = Field(default_factory=lambda: str(uuid4()))
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., description="User email address")
    password_hash: str | None = Field(None, description="Hashed password")
    full_name: str | None = Field(None, max_length=255)

    # OAuth fields
    oauth_provider: str | None = Field(None)
    oauth_provider_id: str | None = Field(None)

    # Profile
    timezone: str = Field(default="UTC")
    avatar_url: str | None = None
    bio: str | None = Field(None, max_length=500)

    # Preferences
    preferences: dict[str, Any] = Field(default_factory=dict)

    # Status
    is_active: bool = Field(default=True)
    last_login: datetime | None = None

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

## Common Queries

### User Queries

```sql
-- Find user by username
SELECT * FROM users WHERE username = ?;

-- Find user by email
SELECT * FROM users WHERE email = ?;

-- Find OAuth user
SELECT * FROM users
WHERE oauth_provider = ? AND oauth_provider_id = ?;

-- Update last login
UPDATE users SET last_login = CURRENT_TIMESTAMP
WHERE user_id = ?;
```

### Refresh Token Queries

```sql
-- Create refresh token
INSERT INTO refresh_tokens (token_id, user_id, token_hash, expires_at)
VALUES (?, ?, ?, ?);

-- Verify refresh token
SELECT user_id, expires_at, revoked
FROM refresh_tokens
WHERE token_hash = ?;

-- Revoke specific token
UPDATE refresh_tokens
SET revoked = 1, revoked_at = CURRENT_TIMESTAMP
WHERE token_hash = ?;

-- Revoke all user tokens (logout all devices)
UPDATE refresh_tokens
SET revoked = 1, revoked_at = CURRENT_TIMESTAMP
WHERE user_id = ? AND revoked = 0;

-- Cleanup expired/revoked tokens
DELETE FROM refresh_tokens
WHERE expires_at < CURRENT_TIMESTAMP OR revoked = 1;
```

### Onboarding Queries

```sql
-- Upsert onboarding data
INSERT INTO user_onboarding (user_id, work_preference, adhd_support_level, ...)
VALUES (?, ?, ?, ...)
ON CONFLICT(user_id) DO UPDATE SET
    work_preference = excluded.work_preference,
    adhd_support_level = excluded.adhd_support_level,
    updated_at = CURRENT_TIMESTAMP;

-- Mark onboarding complete
UPDATE user_onboarding
SET onboarding_completed = ?,
    completed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = ?;

-- Get onboarding data
SELECT * FROM user_onboarding WHERE user_id = ?;

-- Find users by work preference
SELECT u.*, uo.work_preference
FROM users u
JOIN user_onboarding uo ON u.user_id = uo.user_id
WHERE uo.work_preference = ?;
```

## Migration Files

- `src/database/migrations/025_add_oauth_fields_to_users.sql` - Adds OAuth support to users table
- `src/database/migrations/024_create_user_onboarding.sql` - Creates user_onboarding table
- `src/database/migrations/026_create_refresh_tokens_table.sql` - Creates refresh_tokens table

## Database Location

- **Development**: `.data/databases/proxy_agents_enhanced.db`
- **Testing**: `.data/databases/test_proxy_agents.db`

Configured in `src/core/settings.py`:
```python
database_path: str = Field(
    default=".data/databases/proxy_agents_enhanced.db"
)
```
