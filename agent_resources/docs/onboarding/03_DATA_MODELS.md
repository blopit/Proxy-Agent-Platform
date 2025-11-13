# Onboarding Data Models

## Overview

This document describes all data structures used in the onboarding system, including TypeScript types (frontend), Pydantic schemas (backend), and database schema.

## Frontend Types (TypeScript)

**Location**: `mobile/src/types/onboarding.ts`

### Enums and Primitive Types

#### WorkPreference

```typescript
export type WorkPreference = 'remote' | 'hybrid' | 'office' | 'flexible';
```

**Values**:
- `remote`: Work from home or anywhere
- `hybrid`: Mix of remote and office
- `office`: Work from office location
- `flexible`: Varies week to week

#### ADHDSupportLevel

```typescript
export type ADHDSupportLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
```

**Meaning**:
- 1 = Minimal support needed
- 10 = Maximum support needed

#### TimePreference

```typescript
export type TimePreference =
  | 'early_morning'
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  | 'flexible';
```

#### ProductivityGoalType

```typescript
export type ProductivityGoalType =
  | 'task_completion'
  | 'focus_time'
  | 'project_delivery'
  | 'habit_building'
  | 'work_life_balance'
  | 'creative_output'
  | 'learning'
  | 'other';
```

### Complex Types

#### WeeklyAvailability

```typescript
export interface WeeklyAvailability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}
```

**Example**:
```typescript
{
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false
}
```

#### DailySchedule

```typescript
export interface DailySchedule {
  preferredStartTime: string; // HH:mm format (e.g., "09:00")
  preferredEndTime: string;   // HH:mm format (e.g., "17:00")
  timePreference: TimePreference;
  weeklyAvailability: WeeklyAvailability;
  flexibleSchedule: boolean;
}
```

**Example**:
```typescript
{
  preferredStartTime: "09:00",
  preferredEndTime: "17:00",
  timePreference: "morning",
  weeklyAvailability: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  flexibleSchedule: false
}
```

#### ProductivityGoal

```typescript
export interface ProductivityGoal {
  id: string;                     // Unique identifier
  type: ProductivityGoalType;     // Goal type
  title: string;                  // Display title
  description?: string;           // Optional description
  targetValue?: number;           // Optional numeric target (e.g., 5 tasks)
  targetUnit?: string;            // Optional unit (e.g., "tasks", "hours")
}
```

**Example**:
```typescript
{
  id: "goal_1",
  type: "task_completion",
  title: "Complete 5 tasks daily",
  description: "Finish at least 5 tasks every day",
  targetValue: 5,
  targetUnit: "tasks"
}
```

### Main Data Structure

#### OnboardingData

```typescript
export interface OnboardingData {
  // Work preferences
  workPreference: WorkPreference | null;

  // ADHD support
  adhdSupportLevel: ADHDSupportLevel | null;
  adhdChallenges?: string[];  // Optional list of specific challenges

  // Schedule
  dailySchedule: DailySchedule | null;

  // Goals
  productivityGoals: ProductivityGoal[];

  // Metadata
  completedAt?: string;  // ISO timestamp
  skipped: boolean;      // Whether user skipped onboarding
}
```

**Example (Complete)**:
```typescript
{
  workPreference: "remote",
  adhdSupportLevel: 7,
  adhdChallenges: ["time_blindness", "focus", "task_initiation"],
  dailySchedule: {
    preferredStartTime: "09:00",
    preferredEndTime: "17:00",
    timePreference: "morning",
    weeklyAvailability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    flexibleSchedule: false
  },
  productivityGoals: [
    {
      id: "goal_1",
      type: "task_completion",
      title: "Complete daily tasks"
    },
    {
      id: "goal_2",
      type: "focus_time",
      title: "Maintain focus sessions"
    }
  ],
  completedAt: "2025-11-10T10:05:00Z",
  skipped: false
}
```

**Example (Skipped)**:
```typescript
{
  workPreference: null,
  adhdSupportLevel: null,
  adhdChallenges: [],
  dailySchedule: null,
  productivityGoals: [],
  completedAt: "2025-11-10T10:00:00Z",
  skipped: true
}
```

#### OnboardingProgress

```typescript
export interface OnboardingProgress {
  currentStep: number;            // Current step (0-6)
  totalSteps: number;             // Total steps (7)
  completedSteps: string[];       // Array of step IDs completed
  canSkip: boolean;               // Whether skip is allowed
}
```

**Example**:
```typescript
{
  currentStep: 2,
  totalSteps: 7,
  completedSteps: ["welcome", "work_preferences"],
  canSkip: true
}
```

### Constants

#### DEFAULT_ONBOARDING_DATA

```typescript
export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  workPreference: null,
  adhdSupportLevel: null,
  adhdChallenges: [],
  dailySchedule: null,
  productivityGoals: [],
  skipped: false,
};
```

#### DEFAULT_WEEKLY_AVAILABILITY

```typescript
export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailability = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};
```

#### DEFAULT_DAILY_SCHEDULE

```typescript
export const DEFAULT_DAILY_SCHEDULE: DailySchedule = {
  preferredStartTime: '09:00',
  preferredEndTime: '17:00',
  timePreference: 'morning',
  weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
  flexibleSchedule: false,
};
```

#### ONBOARDING_STEPS

```typescript
export const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  WORK_PREFERENCES: 'work_preferences',
  ADHD_SUPPORT: 'adhd_support',
  DAILY_SCHEDULE: 'daily_schedule',
  PRODUCTIVITY_GOALS: 'productivity_goals',
  COMPLETE: 'complete',
} as const;
```

## Backend Schemas (Pydantic)

**Location**: `src/api/routes/schemas/onboarding_schemas.py`

### Enums

#### WorkPreference

```python
class WorkPreference(str, Enum):
    """Work environment preferences"""
    REMOTE = "remote"
    HYBRID = "hybrid"
    OFFICE = "office"
    FLEXIBLE = "flexible"
```

#### TimePreference

```python
class TimePreference(str, Enum):
    """Time of day preferences"""
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"
    FLEXIBLE = "flexible"
    VARIED = "varied"
```

#### ADHDChallenge

```python
class ADHDChallenge(str, Enum):
    """Common ADHD challenges"""
    TIME_BLINDNESS = "time_blindness"
    TASK_INITIATION = "task_initiation"
    ORGANIZATION = "organization"
    FOCUS = "focus"
    PRIORITIZATION = "prioritization"
    OVERWHELM = "overwhelm"
    HYPERFOCUS = "hyperfocus"
    TRANSITIONS = "transitions"
```

#### ProductivityGoal

```python
class ProductivityGoal(str, Enum):
    """Productivity goal types"""
    REDUCE_OVERWHELM = "reduce_overwhelm"
    BUILD_HABITS = "build_habits"
    INCREASE_FOCUS = "increase_focus"
    BETTER_PLANNING = "better_planning"
    TIME_MANAGEMENT = "time_management"
    WORK_LIFE_BALANCE = "work_life_balance"
    REDUCE_PROCRASTINATION = "reduce_procrastination"
    TRACK_PROGRESS = "track_progress"
```

### Models

#### DailySchedule

```python
class DailySchedule(BaseModel):
    """Daily schedule configuration"""
    time_preference: TimePreference
    flexible_enabled: bool = False
    # Week grid: Mon-Sun with preferred work hours
    # e.g., "9-5", "flexible", "off"
    week_grid: dict[str, str] = Field(default_factory=dict)

    model_config = ConfigDict(use_enum_values=True)
```

**Example**:
```python
{
    "time_preference": "morning",
    "flexible_enabled": False,
    "week_grid": {
        "monday": "8-12,14-18",
        "tuesday": "8-12,14-18",
        "wednesday": "flexible",
        "thursday": "8-12,14-18",
        "friday": "8-13",
        "saturday": "off",
        "sunday": "off"
    }
}
```

#### OnboardingUpdateRequest

```python
class OnboardingUpdateRequest(BaseModel):
    """Request model for updating user onboarding preferences"""
    work_preference: WorkPreference | None = None
    adhd_support_level: int | None = Field(
        None,
        ge=1,
        le=10,
        description="ADHD support level (1-10)"
    )
    adhd_challenges: list[ADHDChallenge] | None = None
    daily_schedule: DailySchedule | None = None
    productivity_goals: list[ProductivityGoal] | None = None
    chatgpt_export_prompt: str | None = Field(None, max_length=5000)
    onboarding_completed: bool | None = None
    onboarding_skipped: bool | None = None

    model_config = ConfigDict(use_enum_values=True)
```

**Notes**:
- All fields are optional (supports partial updates)
- `use_enum_values=True` converts enums to strings in JSON
- Validation happens automatically via Pydantic

#### OnboardingResponse

```python
class OnboardingResponse(BaseModel):
    """Response model for user onboarding data"""
    user_id: str
    work_preference: WorkPreference | None = None
    adhd_support_level: int | None = Field(None, ge=1, le=10)
    adhd_challenges: list[ADHDChallenge] = Field(default_factory=list)
    daily_schedule: DailySchedule | None = None
    productivity_goals: list[ProductivityGoal] = Field(default_factory=list)
    chatgpt_export_prompt: str | None = None
    chatgpt_exported_at: datetime | None = None
    onboarding_completed: bool = False
    onboarding_skipped: bool = False
    completed_at: datetime | None = None
    skipped_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        use_enum_values=True,
        from_attributes=True  # Enable ORM mode
    )
```

**Example**:
```python
{
    "user_id": "user_123",
    "work_preference": "remote",
    "adhd_support_level": 7,
    "adhd_challenges": ["time_blindness", "focus"],
    "daily_schedule": {
        "time_preference": "morning",
        "flexible_enabled": False,
        "week_grid": {"monday": "8-17", "tuesday": "8-17"}
    },
    "productivity_goals": ["reduce_overwhelm", "increase_focus"],
    "chatgpt_export_prompt": None,
    "chatgpt_exported_at": None,
    "onboarding_completed": True,
    "onboarding_skipped": False,
    "completed_at": "2025-11-10T10:05:00Z",
    "skipped_at": None,
    "created_at": "2025-11-10T10:00:00Z",
    "updated_at": "2025-11-10T10:05:00Z"
}
```

#### OnboardingCompletionRequest

```python
class OnboardingCompletionRequest(BaseModel):
    """Request to mark onboarding as completed or skipped"""
    completed: bool = Field(..., description="True to complete, False to skip")
```

**Example**:
```python
{"completed": True}   # Mark as completed
{"completed": False}  # Mark as skipped
```

## Database Schema (SQLite)

**Location**: `src/database/migrations/024_create_user_onboarding.sql`

### Table: user_onboarding

```sql
CREATE TABLE IF NOT EXISTS user_onboarding (
    -- Primary key
    user_id TEXT PRIMARY KEY NOT NULL,

    -- Work Preferences
    work_preference TEXT CHECK(
        work_preference IN ('remote', 'hybrid', 'office', 'flexible')
    ),

    -- ADHD Support
    adhd_support_level INTEGER CHECK(adhd_support_level BETWEEN 1 AND 10),
    adhd_challenges TEXT,  -- JSON: ["time_blindness", "focus"]

    -- Daily Schedule
    daily_schedule TEXT,  -- JSON: {timePreference, weekGrid, flexibleEnabled}
    time_preference TEXT,  -- Extracted for indexing

    -- Productivity Goals
    productivity_goals TEXT,  -- JSON: ["reduce_overwhelm", "increase_focus"]

    -- ChatGPT Export
    chatgpt_export_prompt TEXT,
    chatgpt_exported_at TIMESTAMP,

    -- Completion tracking
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_skipped BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    skipped_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Field Types and Constraints

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user_id` | TEXT | PRIMARY KEY, NOT NULL | User identifier |
| `work_preference` | TEXT | CHECK (enum values) | Work environment |
| `adhd_support_level` | INTEGER | CHECK (1-10) | Support level |
| `adhd_challenges` | TEXT | - | JSON array |
| `daily_schedule` | TEXT | - | JSON object |
| `time_preference` | TEXT | - | Extracted for indexing |
| `productivity_goals` | TEXT | - | JSON array |
| `chatgpt_export_prompt` | TEXT | - | Generated prompt |
| `chatgpt_exported_at` | TIMESTAMP | - | Export timestamp |
| `onboarding_completed` | BOOLEAN | DEFAULT FALSE | Completion flag |
| `onboarding_skipped` | BOOLEAN | DEFAULT FALSE | Skip flag |
| `completed_at` | TIMESTAMP | - | Completion time |
| `skipped_at` | TIMESTAMP | - | Skip time |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update |

### Indexes

```sql
-- Index on completion status for queries
CREATE INDEX IF NOT EXISTS idx_user_onboarding_completed
    ON user_onboarding(onboarding_completed);

-- Index on work preference for analytics
CREATE INDEX IF NOT EXISTS idx_user_onboarding_work_preference
    ON user_onboarding(work_preference);

-- Index on ADHD level for analytics
CREATE INDEX IF NOT EXISTS idx_user_onboarding_adhd_level
    ON user_onboarding(adhd_support_level);

-- Index on creation date for sorting
CREATE INDEX IF NOT EXISTS idx_user_onboarding_created
    ON user_onboarding(created_at DESC);
```

### JSON Field Examples

#### adhd_challenges
```json
["time_blindness", "task_initiation", "focus"]
```

#### daily_schedule
```json
{
  "time_preference": "morning",
  "flexible_enabled": false,
  "week_grid": {
    "monday": "8-12,14-18",
    "tuesday": "8-12,14-18",
    "wednesday": "flexible",
    "thursday": "8-12,14-18",
    "friday": "8-13",
    "saturday": "off",
    "sunday": "off"
  }
}
```

#### productivity_goals
```json
["reduce_overwhelm", "increase_focus", "build_habits"]
```

## Data Mapping

### Frontend → Backend

**TypeScript to Python conversion happens in `onboardingService.ts`**:

```typescript
// Frontend type
interface OnboardingData {
  workPreference: WorkPreference | null;
  adhdSupportLevel: ADHDSupportLevel | null;
  adhdChallenges?: string[];
  dailySchedule: DailySchedule | null;
  productivityGoals: ProductivityGoal[];
}

// Mapped to backend format
{
  work_preference: "remote",          // camelCase → snake_case
  adhd_support_level: 7,
  adhd_challenges: ["time_blindness"],
  daily_schedule: { ... },
  productivity_goals: ["task_completion"]  // Extract types only
}
```

**Key Mappings**:
- `workPreference` → `work_preference`
- `adhdSupportLevel` → `adhd_support_level`
- `adhdChallenges` → `adhd_challenges`
- `dailySchedule` → `daily_schedule`
- `productivityGoals` → `productivity_goals` (types only)

### Backend → Database

**Pydantic to SQL conversion happens in `onboarding_service.py`**:

```python
# Pydantic model
data.adhd_challenges = [ADHDChallenge.TIME_BLINDNESS, ADHDChallenge.FOCUS]

# Converted to JSON for database
adhd_challenges_json = json.dumps(["time_blindness", "focus"])

# Stored in TEXT field
cursor.execute("INSERT INTO ... VALUES (?)", (adhd_challenges_json,))
```

**Key Conversions**:
- Enums → Strings
- Complex objects → JSON strings
- Timestamps → ISO strings

## Validation Rules

### Frontend Validation

**In Context**:
```typescript
// Must be valid enum value
setWorkPreference(preference: WorkPreference)

// Must be 1-10
setADHDSupportLevel(level: ADHDSupportLevel)
```

### Backend Validation

**Pydantic**:
```python
adhd_support_level: int | None = Field(None, ge=1, le=10)
chatgpt_export_prompt: str | None = Field(None, max_length=5000)
```

### Database Validation

**SQL Constraints**:
```sql
work_preference TEXT CHECK(work_preference IN ('remote', 'hybrid', 'office', 'flexible'))
adhd_support_level INTEGER CHECK(adhd_support_level BETWEEN 1 AND 10)
```

## Example Data Flow

### Complete Onboarding Submission

```
1. User selects "Remote" → Frontend
   {workPreference: "remote"}

2. Context saves to AsyncStorage → Frontend
   await AsyncStorage.setItem(KEY, JSON.stringify(data))

3. Context syncs to backend → API Call
   PUT /api/v1/users/user_123/onboarding
   Body: {work_preference: "remote"}

4. Backend validates with Pydantic → Backend
   OnboardingUpdateRequest(work_preference="remote")

5. Service converts to SQL → Backend
   UPDATE user_onboarding SET work_preference = 'remote' WHERE user_id = 'user_123'

6. Database stores → SQLite
   user_id='user_123', work_preference='remote', updated_at='2025-11-10T10:00:00Z'

7. Backend returns response → API Response
   OnboardingResponse(user_id="user_123", work_preference="remote", ...)

8. Frontend updates state → Context
   setData(parsedResponse)
```

## Next Steps

- See `01_FRONTEND.md` for frontend implementation
- See `02_BACKEND.md` for backend implementation
- See `04_QUICK_START.md` for setup guide
