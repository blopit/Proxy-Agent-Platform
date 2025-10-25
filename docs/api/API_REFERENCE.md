# Proxy Agent Platform API Reference

**Version:** 0.1.0
**Base URL (Development):** `http://localhost:8000`
**Base URL (Production):** `https://api.proxyagent.dev`

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Quick Start](#quick-start)
4. [Core APIs](#core-apis)
   - [Tasks API](#tasks-api) (5 comprehensive endpoints)
   - [Simple Tasks API](#simple-tasks-api) (20 simplified endpoints)
   - [Basic Tasks API](#basic-tasks-api) (6 basic endpoints)
   - [Capture API](#capture-api) (4 brain dump endpoints)
5. [Productivity APIs](#productivity-apis)
   - [Energy API](#energy-api) (6 endpoints)
   - [Focus API](#focus-api) (5 endpoints)
   - [Progress API](#progress-api) (6 endpoints)
   - [Gamification API](#gamification-api) (6 endpoints)
   - [Rewards API](#rewards-api) (4 endpoints)
6. [Organization APIs](#organization-apis)
   - [Secretary API](#secretary-api) (10 endpoints)
7. [Infrastructure](#infrastructure)
   - [Authentication API](#authentication-api) (5 endpoints)
   - [Health & Monitoring](#health--monitoring) (9 untagged endpoints)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [Examples](#examples)

---

## Introduction

The Proxy Agent Platform provides a comprehensive REST API for ADHD-optimized task management
and productivity tracking. The API is built with FastAPI and follows OpenAPI 3.1 standards.

### API Statistics
- **Total Endpoints:** 86
- **Total Schemas:** 76
- **Authentication:** JWT Bearer tokens
- **Response Format:** JSON
- **API Version:** v1

### Key Features
- 🧠 **AI-Powered Capture** - Natural language task breakdown
- ⚡ **Energy Management** - Circadian rhythm tracking
- 🎯 **Focus Sessions** - Pomodoro & deep work
- 🎮 **Gamification** - XP, achievements, streaks
- 📊 **Progress Tracking** - Analytics and insights
- 🗂️ **Secretary Mode** - Intelligent organization

---

## Authentication

The API uses JWT (JSON Web Token) based authentication with Bearer tokens.

### Authentication Flow

#### 1. Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### 2. Using the Token
Include the token in the `Authorization` header for all authenticated requests:

```http
GET /api/v1/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Mobile Endpoints (No Auth Required)
Some endpoints are intentionally unauthenticated for mobile prototyping:
- `/api/v1/capture/*` - Quick capture endpoints
- `/api/v1/rewards/*` - Reward claiming
- Certain energy and progress endpoints

**⚠️ Note:** Production deployments should enable authentication on all endpoints.

---

## Quick Start

### Example: Create and Complete a Task

```bash
# 1. Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo123"}'

# 2. Quick capture a task
curl -X POST "http://localhost:8000/api/v1/capture/" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Deploy authentication system to production",
    "user_id": "demo-user",
    "mode": "auto"
  }'

# 3. List tasks
curl -X GET "http://localhost:8000/api/v1/tasks?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Start focus session
curl -X POST "http://localhost:8000/api/v1/focus/sessions/start" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task_context": "Deploy authentication",
    "technique": "pomodoro",
    "duration_minutes": 25
  }'
```

---

## Core APIs

### Tasks API

**Prefix:** `/api/v1/tasks`
**Tag:** `tasks`
**Description:** Comprehensive task management with hierarchical decomposition, micro-steps, and CHAMPS metadata.

This is the primary task API for production use, offering full CRUD operations with advanced features.

---

#### `POST /api/v1/tasks`
Create a new task with full metadata.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "title": "Deploy authentication system",
  "description": "Deploy new JWT-based authentication to production",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "parent_id": null,
  "priority": "high",
  "estimated_hours": 4.5,
  "tags": ["deployment", "security", "backend"],
  "assignee": "john.doe",
  "due_date": "2025-10-30T17:00:00Z"
}
```

**Request Schema (TaskCreateRequest):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Task title (1-255 chars) |
| description | string | Yes | Task description (max 2000 chars) |
| project_id | string (UUID) | Yes | Project identifier |
| parent_id | string (UUID) | No | Parent task for subtasks |
| priority | enum | No | low, medium, high, critical (default: medium) |
| estimated_hours | number | No | Estimated time in hours |
| tags | array[string] | No | Task tags |
| assignee | string | No | Assigned user |
| due_date | datetime | No | Due date (ISO 8601) |

**Response (201 Created):**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Deploy authentication system",
  "description": "Deploy new JWT-based authentication to production",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "parent_id": null,
  "status": "todo",
  "priority": "high",
  "estimated_hours": 4.5,
  "actual_hours": 0.0,
  "progress_percentage": 0.0,
  "tags": ["deployment", "security", "backend"],
  "assignee": "john.doe",
  "due_date": "2025-10-30T17:00:00Z",
  "is_overdue": false,
  "created_at": "2025-10-24T10:30:00Z",
  "updated_at": "2025-10-24T10:30:00Z",
  "micro_steps": []
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid token
- `422 Validation Error` - Schema validation failed

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/tasks" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Deploy authentication system",
    "description": "Deploy new JWT-based authentication to production",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "priority": "high",
    "estimated_hours": 4.5,
    "tags": ["deployment", "security"],
    "due_date": "2025-10-30T17:00:00Z"
  }'
```

---

#### `GET /api/v1/tasks`
List tasks with filtering and pagination.

**Authentication:** Required (Bearer token)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| project_id | string | No | - | Filter by project |
| status | enum | No | - | Filter by status (todo, in_progress, completed, blocked, archived) |
| priority | enum | No | - | Filter by priority (low, medium, high, critical) |
| assignee | string | No | - | Filter by assignee |
| scope | enum | No | - | all, my_tasks, delegated, unassigned |
| has_due_date | boolean | No | - | Filter tasks with/without due dates |
| is_overdue | boolean | No | - | Filter overdue tasks |
| search_query | string | No | - | Search in title/description |
| tags | array[string] | No | - | Filter by tags |
| sort_by | enum | No | created_at | Sort field (created_at, due_date, priority, updated_at) |
| sort_order | enum | No | desc | Sort order (asc, desc) |
| limit | integer | No | 20 | Results per page (1-100) |
| offset | integer | No | 0 | Pagination offset |

**Response (200 OK):**
```json
{
  "tasks": [
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Deploy authentication system",
      "status": "in_progress",
      "priority": "high",
      "progress_percentage": 35.0,
      "is_overdue": false,
      ...
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/tasks?status=in_progress&priority=high&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### `GET /api/v1/tasks/{task_id}`
Get a single task by ID.

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| task_id | string (UUID) | Yes | Task identifier |

**Response (200 OK):**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Deploy authentication system",
  "description": "Deploy new JWT-based authentication to production",
  "status": "in_progress",
  "priority": "high",
  "estimated_hours": 4.5,
  "actual_hours": 1.5,
  "progress_percentage": 35.0,
  "micro_steps": [
    {
      "step_id": "step-001",
      "step_number": 1,
      "description": "Review deployment checklist",
      "estimated_minutes": 15,
      "delegation_mode": "human_with_ai_assistance",
      "status": "completed",
      "completed_at": "2025-10-24T11:00:00Z"
    },
    {
      "step_id": "step-002",
      "step_number": 2,
      "description": "Run integration tests",
      "estimated_minutes": 30,
      "delegation_mode": "ai_with_human_verification",
      "status": "in_progress"
    }
  ],
  ...
}
```

**Error Responses:**
- `404 Not Found` - Task doesn't exist
- `401 Unauthorized` - Missing or invalid token

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/tasks/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### `PUT /api/v1/tasks/{task_id}`
Update an existing task.

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| task_id | string (UUID) | Yes | Task identifier |

**Request Body (TaskUpdateRequest):**
All fields are optional. Only include fields you want to update.

```json
{
  "status": "completed",
  "actual_hours": 4.0,
  "priority": "medium",
  "tags": ["deployment", "security", "completed"]
}
```

**Request Schema:**
| Field | Type | Description |
|-------|------|-------------|
| title | string | Update title (1-255 chars) |
| description | string | Update description (max 2000 chars) |
| status | enum | todo, in_progress, completed, blocked, archived |
| priority | enum | low, medium, high, critical |
| estimated_hours | number | Update time estimate |
| actual_hours | number | Log actual time spent |
| tags | array[string] | Update tags |
| assignee | string | Reassign task |
| due_date | datetime | Update due date |

**Response (200 OK):**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "completed",
  "actual_hours": 4.0,
  "progress_percentage": 100.0,
  "updated_at": "2025-10-24T14:30:00Z",
  ...
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:8000/api/v1/tasks/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "actual_hours": 4.0
  }'
```

---

#### `DELETE /api/v1/tasks/{task_id}`
Delete a task.

**Authentication:** Required (Bearer token)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| task_id | string (UUID) | Yes | Task identifier |

**Response (204 No Content):**
Empty response body on success.

**Error Responses:**
- `404 Not Found` - Task doesn't exist
- `401 Unauthorized` - Missing or invalid token

**cURL Example:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/tasks/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Capture API

**Prefix:** `/api/v1/capture`
**Tag:** `capture`
**Description:** Full-screen brain dump capture system with AI-powered task decomposition.

The Capture API is the heart of the ADHD-optimized 2-second task capture workflow.

---

#### `POST /api/v1/capture/`
Capture a brain dump and decompose into structured task with micro-steps.

**Authentication:** Not required (mobile-friendly)

**Request Body (CaptureRequest):**
```json
{
  "query": "Deploy authentication system to production by Friday with full testing",
  "user_id": "demo-user",
  "mode": "auto",
  "manual_fields": null
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | Raw user input (brain dump) |
| user_id | string | Yes | User identifier |
| mode | enum | No | auto, manual, clarify (default: auto) |
| manual_fields | object | No | Manual overrides for MANUAL mode |

**Capture Modes:**
- **AUTO**: AI fully decomposes task and assigns CHAMPS metadata
- **MANUAL**: User provides some metadata, AI fills gaps
- **CLARIFY**: AI asks clarification questions before decomposition

**Response (200 OK):**
```json
{
  "task": {
    "task_id": "temp-123",
    "title": "Deploy authentication system to production",
    "description": "Deploy new JWT-based authentication with comprehensive testing",
    "priority": "high",
    "estimated_hours": 5.0,
    "due_date": "2025-10-25T17:00:00Z",
    "tags": ["deployment", "authentication", "testing"],
    "status": "todo"
  },
  "micro_steps": [
    {
      "step_id": "step-001",
      "description": "Review deployment checklist",
      "estimated_minutes": 15,
      "delegation_mode": "human_with_ai_assistance",
      "leaf_type": "checkpoint",
      "icon": "📋",
      "short_label": "Review checklist",
      "tags": ["Conversation: minimal", "Help: documentation", "Activity: reading"]
    },
    {
      "step_id": "step-002",
      "description": "Run integration test suite",
      "estimated_minutes": 30,
      "delegation_mode": "ai_with_human_verification",
      "leaf_type": "automation",
      "icon": "🤖",
      "short_label": "Run tests",
      "automation_plan": {
        "tool": "pytest",
        "command": "pytest tests/integration/",
        "confidence": 0.95
      },
      "tags": ["Conversation: none", "Activity: testing", "Movement: seated"]
    },
    {
      "step_id": "step-003",
      "description": "Deploy to staging environment",
      "estimated_minutes": 20,
      "delegation_mode": "human_led",
      "leaf_type": "checkpoint",
      "icon": "🚀",
      "tags": ["Activity: deploying", "Help: runbook"]
    }
  ],
  "clarifications": [],
  "ready_to_save": true,
  "mode": "auto"
}
```

**Response Schema (CaptureResponse):**
| Field | Type | Description |
|-------|------|-------------|
| task | object | Structured task object |
| micro_steps | array[MicroStep] | Decomposed micro-steps |
| clarifications | array[ClarificationNeed] | Questions needing answers (if mode=clarify) |
| ready_to_save | boolean | True if task can be saved to database |
| mode | string | Capture mode used |

**Processing Time:**
- Target: <2 seconds for 2-second capture workflow
- Typical: 1-3 seconds depending on complexity

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/capture/" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Deploy authentication system to production by Friday",
    "user_id": "demo-user",
    "mode": "auto"
  }'
```

---

#### `POST /api/v1/capture/clarify`
Submit clarification answers and re-classify task.

**Authentication:** Not required

**Request Body (ClarifyRequest):**
```json
{
  "micro_steps": [...],
  "answers": {
    "priority": "high",
    "deadline": "Friday 5pm",
    "complexity": "medium"
  }
}
```

**Response:** Same as capture endpoint with updated task/micro-steps.

---

#### `POST /api/v1/capture/save`
Save finalized capture to database.

**Authentication:** Not required

**Request Body (SaveCaptureRequest):**
```json
{
  "task": {...},
  "micro_steps": [...],
  "user_id": "demo-user",
  "project_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "message": "Task saved successfully",
  "micro_steps_count": 5
}
```

---

### Energy API

**Prefix:** `/api/v1/energy`
**Tag:** `energy`
**Description:** Energy level tracking, circadian rhythm analysis, and energy optimization.

The Energy API helps users match tasks to their current energy levels and optimize productivity.

---

#### `POST /api/v1/energy/track`
Track and assess current energy level.

**Authentication:** Required (Bearer token) - but bypassed for mobile endpoints in current implementation

**Request Body (EnergyTrackingRequest):**
```json
{
  "context_description": "Just finished lunch, feeling focused",
  "sleep_quality": 8,
  "stress_level": 4,
  "last_meal_time": "12:30",
  "hydration_level": 7,
  "physical_activity": "light"
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| context_description | string | No | Current state description |
| sleep_quality | integer (1-10) | No | Last night's sleep quality |
| stress_level | integer (1-10) | No | Current stress level |
| last_meal_time | string (HH:MM) | No | Time of last meal |
| hydration_level | integer (1-10) | No | Hydration level |
| physical_activity | enum | No | sedentary, light, moderate, vigorous |

**Response (200 OK):**
```json
{
  "energy_level": 7.5,
  "trend": "stable",
  "primary_factors": [
    "Good sleep quality (8/10)",
    "Recent meal providing sustained energy",
    "Mild stress - manageable"
  ],
  "predicted_next_hour": 7.2,
  "confidence": 0.85,
  "immediate_recommendations": [
    "Tackle high-priority cognitive tasks now",
    "Maintain hydration",
    "Plan for brief break in 90 minutes"
  ],
  "message": "Your energy is at 75% - great time for focused work!"
}
```

**Energy Levels:**
- **0-3:** Very Low - Rest, minimal tasks only
- **4-6:** Moderate - Routine tasks, avoid complex work
- **7-8:** High - Peak productivity, tackle important work
- **9-10:** Peak - Deep work, creative tasks, strategic thinking

**cURL Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/energy/track" \
  -H "Content-Type: application/json" \
  -d '{
    "context_description": "Morning, well rested",
    "sleep_quality": 8,
    "stress_level": 3,
    "hydration_level": 7
  }'
```

---

#### `POST /api/v1/energy/optimize`
Get energy optimization recommendations.

**Request Body:**
```json
{
  "current_energy": 5.5,
  "target_energy": 7.5,
  "time_available": 30
}
```

**Response (200 OK):**
```json
{
  "immediate_actions": [
    "Take a 5-minute walk outside",
    "Drink 8oz of water",
    "Do 10 deep breathing cycles"
  ],
  "nutritional_advice": [
    "Avoid sugar crash - choose protein snack",
    "Consider green tea for gentle caffeine boost"
  ],
  "environmental_changes": [
    "Open window for fresh air",
    "Adjust lighting to bright/natural",
    "Stand up desk if available"
  ],
  "lifestyle_recommendations": [
    "Energy dip typical for your 2pm circadian rhythm",
    "Consider scheduling breaks at 2:30pm daily"
  ],
  "expected_improvement": 1.8,
  "timeframe_minutes": 25,
  "message": "Follow these steps to boost energy from 5.5 to 7.3 in ~25 minutes"
}
```

---

#### `GET /api/v1/energy/circadian`
Get circadian rhythm pattern analysis.

**Response (200 OK):**
```json
{
  "peak_energy_times": ["09:00-11:30", "14:00-16:00"],
  "low_energy_times": ["02:00-04:00", "13:00-14:00"],
  "chronotype": "intermediate",
  "pattern_confidence": 0.82,
  "recommendations": {
    "schedule_deep_work": ["09:00-11:30"],
    "schedule_breaks": ["13:00-14:00"],
    "avoid_important_decisions": ["02:00-04:00"],
    "optimal_bedtime": "22:30"
  },
  "message": "You're an intermediate chronotype with morning and afternoon peaks"
}
```

---

#### `POST /api/v1/energy/match-task`
Match tasks to current energy level.

**Request Body:**
```json
{
  "current_energy": 7.5,
  "available_tasks": [
    {"id": "task-1", "title": "Code review", "complexity": "medium"},
    {"id": "task-2", "title": "Strategic planning", "complexity": "high"},
    {"id": "task-3", "title": "Email replies", "complexity": "low"}
  ]
}
```

**Response:**
```json
{
  "recommended_task": {
    "id": "task-2",
    "title": "Strategic planning",
    "match_score": 0.95
  },
  "alternative_tasks": [
    {"id": "task-1", "title": "Code review", "match_score": 0.85},
    {"id": "task-3", "title": "Email replies", "match_score": 0.60}
  ],
  "reasoning": "High energy (7.5) is ideal for strategic planning. Your cognitive capacity supports complex thinking now.",
  "message": "Best match: Strategic planning (95% confidence)"
}
```

---

### Focus API

**Prefix:** `/api/v1/focus`
**Tag:** `focus`
**Description:** Focus session management with Pomodoro, deep work, and distraction monitoring.

---

#### `POST /api/v1/focus/sessions/start`
Start a new focus session.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "task_context": "Code review for authentication PR",
  "technique": "pomodoro",
  "duration_minutes": 25
}
```

**Techniques:**
- **pomodoro**: 25-minute work + 5-minute break cycles
- **deep_work**: 90-120 minute uninterrupted sessions
- **timeboxing**: Custom duration focused work

**Response (201 Created):**
```json
{
  "session_id": "session-123e4567",
  "technique": "pomodoro",
  "planned_duration": 25,
  "break_duration": 5,
  "start_time": "2025-10-24T14:00:00Z",
  "status": "active",
  "message": "Pomodoro session started - 25 minutes of focused work begins now!"
}
```

---

#### `GET /api/v1/focus/sessions/{session_id}/status`
Get current session status.

**Response:**
```json
{
  "status": "active",
  "elapsed_minutes": 15,
  "remaining_minutes": 10,
  "progress_percentage": 60.0,
  "distraction_count": 2,
  "technique": "pomodoro"
}
```

---

#### `POST /api/v1/focus/sessions/{session_id}/distraction`
Report a distraction during session.

**Request Body:**
```json
{
  "distraction_type": "notification",
  "context": "Slack message about non-urgent question"
}
```

**Response:**
```json
{
  "intervention_type": "gentle_reminder",
  "primary_suggestion": "Note the distraction and return to focus. You can address this in 10 minutes during your break.",
  "additional_strategies": [
    "Add to 'to-do-later' list",
    "Put phone in another room",
    "Enable Do Not Disturb mode"
  ],
  "encouragement": "You're 15 minutes into a great focus session - stay strong!"
}
```

---

#### `POST /api/v1/focus/sessions/{session_id}/end`
End focus session and get metrics.

**Response (200 OK):**
```json
{
  "session_id": "session-123e4567",
  "actual_duration": 24.5,
  "planned_duration": 25,
  "completion_rate": 0.98,
  "focus_score": 8.5,
  "productivity_rating": 9.0,
  "distraction_count": 2,
  "recommendations": [
    "Excellent focus! Consider trying 50-minute sessions.",
    "Distractions decreased vs last session (+33%)"
  ],
  "xp_earned": 50
}
```

---

#### `GET /api/v1/focus/break-recommendation`
Get break activity recommendations.

**Query Parameters:**
- `session_duration`: Minutes just worked
- `energy_level`: Current energy (0-10)

**Response:**
```json
{
  "break_type": "active_recovery",
  "duration_minutes": 5,
  "recommended_activities": [
    "Walk around the block",
    "Light stretching",
    "Hydrate - drink water"
  ],
  "activities_to_avoid": [
    "Social media scrolling",
    "Starting another task",
    "Heavy meal"
  ],
  "reasoning": "After 25 minutes of focused work, your brain needs movement and fresh oxygen."
}
```

---

### Gamification API

**Prefix:** `/api/v1/gamification`
**Tag:** `gamification`
**Description:** XP system, achievements, leaderboards, and motivation algorithms.

---

#### `POST /api/v1/gamification/achievements/check`
Check for achievement unlocks.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "user_activity": {
    "tasks_completed_today": 8,
    "focus_sessions_completed": 3,
    "current_streak": 5,
    "total_xp": 2450
  }
}
```

**Response (200 OK):**
```json
{
  "achievements_unlocked": [
    {
      "achievement_id": "focus_master",
      "title": "Focus Master",
      "description": "Complete 10 focus sessions in a week",
      "badge_tier": "gold",
      "xp_reward": 100,
      "unlocked_at": "2025-10-24T15:00:00Z"
    }
  ],
  "total_xp_earned": 100,
  "new_badges": ["gold"],
  "message": "🏆 1 achievement unlocked! +100 XP earned",
  "next_achievements": [
    {
      "achievement_id": "productivity_beast",
      "title": "Productivity Beast",
      "description": "Complete 50 tasks in a month",
      "progress": 42,
      "target": 50,
      "progress_percentage": 84.0
    }
  ]
}
```

---

#### `POST /api/v1/gamification/leaderboard`
Get leaderboard rankings.

**Request Body:**
```json
{
  "category": "weekly",
  "limit": 10
}
```

**Categories:**
- **overall**: All-time rankings
- **weekly**: Current week
- **monthly**: Current month

**Response:**
```json
{
  "category": "weekly",
  "entries": [
    {
      "rank": 1,
      "username": "productivity_ninja",
      "score": 850,
      "level": 15,
      "avatar": "🥷"
    },
    {
      "rank": 2,
      "username": "focus_master",
      "score": 780,
      "level": 14,
      "avatar": "🎯"
    }
  ],
  "user_rank": 5,
  "user_score": 520,
  "total_participants": 127,
  "message": "You're ranked #5 out of 127 users this week!"
}
```

---

#### `POST /api/v1/gamification/motivation`
Get personalized motivation recommendations.

**Request Body:**
```json
{
  "user_context": {
    "recent_completion_rate": 0.65,
    "energy_level": 6.5,
    "current_streak": 3,
    "time_of_day": "afternoon"
  }
}
```

**Response:**
```json
{
  "motivation_strategy": "momentum_building",
  "recommendations": [
    "You're on a 3-day streak - keep it going!",
    "Complete 2 more tasks to hit your daily goal",
    "Your afternoon energy (6.5) is perfect for your next task"
  ],
  "encouragement_message": "You've got this! You're 65% of the way there today.",
  "suggested_goals": [
    {
      "type": "daily",
      "title": "Complete 10 tasks",
      "current": 6,
      "target": 10,
      "reward_xp": 50
    }
  ],
  "engagement_score": 7.8,
  "message": "Strong momentum - 2 more tasks to daily goal!"
}
```

---

#### `GET /api/v1/gamification/rewards`
Get reward distribution tracking.

**Response:**
```json
{
  "rewards_earned": [
    {
      "reward_id": "daily_streak_5",
      "type": "streak_bonus",
      "value": 50,
      "earned_at": "2025-10-24T09:00:00Z"
    }
  ],
  "total_rewards_value": 450,
  "pending_rewards": [],
  "redemption_options": [
    {
      "option": "custom_avatar",
      "cost": 500,
      "status": "affordable"
    }
  ],
  "message": "You have 450 reward points available"
}
```

---

#### `GET /api/v1/gamification/analytics`
Get engagement analytics and insights.

**Response:**
```json
{
  "engagement_score": 8.2,
  "active_days_streak": 5,
  "participation_rate": 0.87,
  "achievement_completion_rate": 0.45,
  "engagement_trends": {
    "daily_average_xp": 120,
    "weekly_trend": "+15%",
    "best_day": "Tuesday",
    "best_time": "09:00-11:00"
  },
  "insights": [
    "Your engagement is 23% higher than last week",
    "You're most productive on Tuesday mornings",
    "5-day streak is your 2nd longest ever!"
  ],
  "message": "Engagement score: 8.2/10 - You're crushing it!"
}
```

---

### Progress API

**Prefix:** `/api/v1/progress`
**Tag:** `progress`
**Description:** Progress tracking, XP calculation, streaks, and performance analytics.

---

#### `POST /api/v1/progress/xp/calculate`
Calculate dynamic XP for task completion.

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "task_id": "task-123",
  "complexity": "high",
  "priority": "critical",
  "quality_rating": "excellent",
  "time_spent": 180,
  "estimated_time": 200
}
```

**Request Schema:**
| Field | Type | Description |
|-------|------|-------------|
| task_id | string | Task identifier |
| complexity | enum | low, medium, high, expert |
| priority | enum | low, medium, high, critical |
| quality_rating | enum | poor, average, good, excellent |
| time_spent | integer | Actual minutes spent |
| estimated_time | integer | Estimated minutes |

**Response (200 OK):**
```json
{
  "base_xp": 50,
  "complexity_bonus": 25,
  "efficiency_bonus": 15,
  "quality_bonus": 20,
  "streak_bonus": 10,
  "total_xp": 120,
  "multipliers_applied": [
    "High complexity (1.5x)",
    "Critical priority (1.3x)",
    "Excellent quality (1.2x)",
    "5-day streak (1.1x)"
  ],
  "xp_breakdown": {
    "base": 50,
    "complexity_multiplier": 1.5,
    "priority_multiplier": 1.3,
    "quality_multiplier": 1.2,
    "efficiency_multiplier": 1.1,
    "streak_multiplier": 1.1
  },
  "message": "🎉 Earned 120 XP! (5x multipliers applied)"
}
```

**XP Calculation Formula:**
```
Base XP = 50 (low), 100 (medium), 200 (high), 400 (expert)
Complexity Multiplier = 1x (low), 1.3x (medium), 1.5x (high), 2x (expert)
Priority Multiplier = 1x (low), 1.1x (medium), 1.3x (high), 1.5x (critical)
Quality Multiplier = 0.8x (poor), 1x (average), 1.2x (good), 1.5x (excellent)
Efficiency Multiplier = (estimated / actual) * 1.2, capped at 1.5x
Streak Multiplier = 1 + (streak_days * 0.02), capped at 1.5x

Total XP = Base XP × All Multipliers
```

---

#### `GET /api/v1/progress/streak`
Get user streak data.

**Response:**
```json
{
  "current_streak": 5,
  "longest_streak": 12,
  "streak_type": "daily_tasks",
  "next_milestone": 7,
  "momentum_score": 0.85,
  "streak_bonus_multiplier": 1.1,
  "message": "🔥 5-day streak! 2 more days to next milestone"
}
```

---

#### `GET /api/v1/progress/level`
Get user level and progression.

**Response:**
```json
{
  "current_level": 12,
  "current_xp": 2450,
  "xp_for_next_level": 2800,
  "xp_needed": 350,
  "progress_percentage": 87.5,
  "level_benefits": [
    "Unlock custom themes",
    "Priority support access",
    "Advanced analytics dashboard"
  ],
  "prestige_tier": "silver",
  "message": "Level 12 - 87% to Level 13 (350 XP needed)"
}
```

---

#### `GET /api/v1/progress/visualization`
Get progress visualization data.

**Query Parameters:**
- `period`: day, week, month, year

**Response:**
```json
{
  "daily_xp_trend": [
    {"date": "2025-10-20", "xp": 150},
    {"date": "2025-10-21", "xp": 180},
    {"date": "2025-10-22", "xp": 120},
    {"date": "2025-10-23", "xp": 200},
    {"date": "2025-10-24", "xp": 160}
  ],
  "task_completion_rate": [
    {"week": "Week 1", "rate": 0.75},
    {"week": "Week 2", "rate": 0.82},
    {"week": "Week 3", "rate": 0.88},
    {"week": "Week 4", "rate": 0.91}
  ],
  "productivity_score_trend": [
    {"month": "July", "score": 7.2},
    {"month": "August", "score": 7.8},
    {"month": "September", "score": 8.1},
    {"month": "October", "score": 8.5}
  ],
  "milestone_achievements": [
    {"milestone": "100 tasks", "date": "2025-09-15"},
    {"milestone": "50 focus sessions", "date": "2025-10-01"}
  ],
  "areas_for_improvement": [
    "Morning task completion could increase 15%",
    "Weekend productivity dips - consider light goals"
  ],
  "performance_insights": {
    "best_day": "Tuesday",
    "best_time": "09:00-11:00",
    "peak_productivity": "Morning after 8+ hours sleep"
  },
  "comparative_analysis": {
    "vs_last_week": "+12%",
    "vs_last_month": "+8%",
    "vs_personal_best": "-5%"
  },
  "message": "Productivity trending up +12% vs last week"
}
```

---

#### `GET /api/v1/progress/trends`
Get performance trend analysis.

**Response:**
```json
{
  "trend_direction": "improving",
  "momentum_score": 8.2,
  "productivity_rating": 8.5,
  "recommendations": [
    "Maintain current morning routine - it's working!",
    "Consider adding weekend buffer tasks",
    "Your Tuesday 9am slot is peak performance time"
  ],
  "insights": [
    "Productivity up 15% from last month",
    "Focus quality improved 12%",
    "Streak consistency at all-time high"
  ],
  "message": "Strong upward trend - keep up the great work!"
}
```

---

### Rewards API

**Prefix:** `/api/v1/rewards`
**Tag:** `rewards`
**Description:** Dopamine-engineered reward system with mystery boxes and variable ratio schedules.

**⚠️ Note:** This API uses intentionally addictive game mechanics to maximize engagement. Use responsibly.

---

#### `POST /api/v1/rewards/claim`
Claim reward after task/micro-step completion.

**Authentication:** Not required (mobile-friendly)

**Request Body:**
```json
{
  "user_id": "demo-user",
  "task_id": "task-123",
  "action_type": "task",
  "task_priority": "high",
  "streak_days": 5,
  "power_hour_active": false,
  "energy_level": 75
}
```

**Action Types:**
- **task**: Full task completion
- **microstep**: Single micro-step completion
- **streak**: Streak milestone

**Response (200 OK):**
```json
{
  "success": true,
  "base_xp": 100,
  "multiplier": 1.8,
  "total_xp": 180,
  "tier": "epic",
  "bonus_reason": "High priority + 5-day streak",
  "celebration_type": "confetti",
  "sound_effect": "epic_win",
  "streak_bonus": 20,
  "mystery_unlocked": true,
  "mystery_content": {
    "type": "bonus_xp",
    "value": 50,
    "rarity": "rare",
    "message": "🎁 Mystery Box: +50 Bonus XP!"
  },
  "new_total_xp": 2630,
  "new_level": 13,
  "level_up": true
}
```

**Reward Tiers:**
- **common**: 1.0x multiplier, basic celebration
- **uncommon**: 1.2-1.5x, nice animation
- **rare**: 1.5-2.0x, cool effects
- **epic**: 2.0-3.0x, awesome celebration
- **legendary**: 3.0-5.0x, spectacular effects

**Mystery Box System:**
Variable ratio reward schedule (slot machine psychology):
- 20% chance: Small bonus (10-25 XP)
- 10% chance: Medium bonus (25-50 XP)
- 5% chance: Large bonus (50-100 XP)
- 2% chance: Jackpot (100-250 XP)
- 1% chance: Legendary (250-500 XP + badge)

---

#### `POST /api/v1/rewards/mystery-box`
Open a mystery box.

**Request Body:**
```json
{
  "user_id": "demo-user",
  "user_level": 12
}
```

**Response:**
```json
{
  "success": true,
  "reward_type": "bonus_xp",
  "reward_value": 75,
  "rarity": "rare",
  "celebration": "sparkle_burst",
  "message": "🎁 Rare Mystery Box: +75 XP!"
}
```

---

#### `GET /api/v1/rewards/session-multiplier`
Get current session multiplier.

**Query Parameters:**
- `user_id`: string
- `tasks_completed_today`: integer

**Response:**
```json
{
  "current_multiplier": 1.5,
  "multiplier_reason": "6 tasks completed today (Power Hour active)",
  "next_tier_at": 10,
  "expires_in_minutes": 45,
  "message": "🔥 1.5x multiplier active for 45 more minutes!"
}
```

**Power Hour System:**
Complete 3+ tasks in 1 hour → 1.5x multiplier for next hour
Complete 5+ tasks in 1 hour → 2.0x multiplier for next hour
Complete 10+ tasks in 1 hour → 3.0x multiplier for next 2 hours

---

#### `GET /api/v1/rewards/power-hour/status`
Check if power hour is active.

**Response:**
```json
{
  "active": true,
  "multiplier": 2.0,
  "tasks_completed_in_hour": 6,
  "time_remaining_minutes": 35,
  "next_tier_threshold": 10,
  "message": "⚡ Power Hour: 2.0x multiplier (35 min left)"
}
```

---

### Secretary API

**Prefix:** `/api/v1/secretary`
**Tag:** `secretary`
**Description:** Intelligent task organization, priority matrix, and daily briefings.

The Secretary API acts as your executive assistant, organizing chaos into clarity.

---

#### `GET /api/v1/secretary/dashboard`
Get organized secretary dashboard.

**Query Parameters:**
- `user_id`: string (optional)

**Response (200 OK):**
```json
{
  "categories": {
    "main_priorities": [
      {
        "task_id": "task-1",
        "title": "Deploy authentication system",
        "priority": "critical",
        "due_date": "2025-10-25T17:00:00Z",
        "hours_until_due": 25,
        "urgency_score": 9.5
      }
    ],
    "urgent_tasks": [
      {
        "task_id": "task-2",
        "title": "Review security audit",
        "due_date": "2025-10-26T12:00:00Z",
        "hours_until_due": 44
      }
    ],
    "important_tasks": [
      {
        "task_id": "task-3",
        "title": "Strategic planning Q4",
        "priority": "high",
        "estimated_hours": 4.0
      }
    ],
    "this_week_tasks": [
      {
        "task_id": "task-4",
        "title": "Team sync meeting prep",
        "due_date": "2025-10-27T10:00:00Z"
      }
    ]
  },
  "stats": {
    "main_priorities_count": 1,
    "urgent_count": 3,
    "important_count": 5,
    "this_week_count": 8,
    "total_active": 42
  },
  "upcoming_deadlines": [
    {
      "task_id": "task-1",
      "title": "Deploy authentication system",
      "due_date": "2025-10-25T17:00:00Z",
      "hours_until_due": 25,
      "urgency_level": "critical"
    }
  ],
  "last_updated": "2025-10-24T15:30:00Z"
}
```

**Category Logic:**
- **Main Priorities**: Urgent (due <48h) + High/Critical priority
- **Urgent Tasks**: Due within 48 hours
- **Important Tasks**: High priority, not urgent
- **This Week Tasks**: Medium priority, due this week

---

#### `GET /api/v1/secretary/priority-matrix`
Get Eisenhower Priority Matrix.

**Response:**
```json
{
  "matrix": {
    "do_first": [
      {
        "task_id": "task-1",
        "title": "Critical production bug",
        "urgency": "high",
        "importance": "high",
        "quadrant_score": 10.0
      }
    ],
    "schedule": [
      {
        "task_id": "task-2",
        "title": "Strategic planning",
        "urgency": "low",
        "importance": "high",
        "recommended_date": "2025-10-28T09:00:00Z"
      }
    ],
    "delegate": [
      {
        "task_id": "task-3",
        "title": "Weekly report compilation",
        "urgency": "high",
        "importance": "low",
        "suggested_assignee": "team_member"
      }
    ],
    "eliminate": [
      {
        "task_id": "task-4",
        "title": "Optional meeting attendance",
        "urgency": "low",
        "importance": "low",
        "recommendation": "Consider declining"
      }
    ]
  },
  "stats": {
    "do_first_count": 2,
    "schedule_count": 5,
    "delegate_count": 3,
    "eliminate_count": 1
  },
  "last_updated": "2025-10-24T15:30:00Z"
}
```

**Eisenhower Matrix Quadrants:**
1. **Do First** (Urgent + Important): Critical tasks requiring immediate attention
2. **Schedule** (Important, Not Urgent): Strategic work to schedule
3. **Delegate** (Urgent, Not Important): Tasks to delegate
4. **Eliminate** (Neither): Tasks to delete or decline

---

#### `GET /api/v1/secretary/daily-briefing`
Get daily briefing (morning or evening).

**Query Parameters:**
- `user_id`: string (optional)
- `time_of_day`: "morning" or "evening"

**Morning Briefing Response:**
```json
{
  "time_of_day": "morning",
  "stats": {
    "tasks_for_today": 8,
    "total_estimated_hours": 6.5,
    "urgent_count": 2,
    "high_priority_count": 3
  },
  "upcoming_tasks": [
    {
      "task_id": "task-1",
      "title": "Deploy authentication system",
      "scheduled_time": "09:00-13:00",
      "priority": "critical",
      "estimated_hours": 4.0
    },
    {
      "task_id": "task-2",
      "title": "Code review",
      "scheduled_time": "14:00-15:00",
      "priority": "medium",
      "estimated_hours": 1.0
    }
  ],
  "completed_today": [],
  "alerts": [
    {
      "type": "deadline",
      "message": "Critical task due at 5 PM today",
      "task_id": "task-1",
      "severity": "high"
    },
    {
      "type": "overload",
      "message": "Today's schedule has 6.5 hours of work in 8-hour day - manageable",
      "severity": "medium"
    }
  ],
  "last_updated": "2025-10-24T08:00:00Z"
}
```

**Evening Briefing Response:**
```json
{
  "time_of_day": "evening",
  "stats": {
    "tasks_completed_today": 6,
    "xp_earned_today": 420,
    "productivity_score": 8.5
  },
  "upcoming_tasks": [
    {
      "task_id": "task-5",
      "title": "Prepare for tomorrow's meeting",
      "due_date": "2025-10-25T09:00:00Z",
      "priority": "medium"
    }
  ],
  "completed_today": [
    {
      "task_id": "task-1",
      "title": "Deploy authentication system",
      "completed_at": "2025-10-24T16:30:00Z",
      "xp_earned": 180
    }
  ],
  "alerts": [
    {
      "type": "celebration",
      "message": "Great day! Completed 6/8 planned tasks (75%)",
      "severity": "info"
    },
    {
      "type": "preparation",
      "message": "Tomorrow: 3 tasks scheduled, prepare for 9am meeting",
      "severity": "info"
    }
  ],
  "last_updated": "2025-10-24T18:00:00Z"
}
```

---

#### `POST /api/v1/secretary/priority-suggestions`
Get AI suggestions for priority changes.

**Response:**
```json
{
  "suggestions": [
    {
      "task_id": "task-3",
      "current_priority": "medium",
      "suggested_priority": "high",
      "reason": "Due date approaching (2 days) and blocks 3 other tasks",
      "confidence": 0.85
    },
    {
      "task_id": "task-7",
      "current_priority": "high",
      "suggested_priority": "medium",
      "reason": "Deadline extended, lower urgency now",
      "confidence": 0.72
    }
  ]
}
```

---

### Authentication API

**Prefix:** `/auth`
**Tag:** `authentication`
**Description:** JWT-based authentication and user management.

---

#### `POST /auth/login`
Authenticate and get access token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing username or password

---

#### `POST /auth/register`
Register new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (201 Created):**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "newuser",
  "email": "user@example.com",
  "created_at": "2025-10-24T15:30:00Z"
}
```

---

#### `GET /auth/me`
Get current user profile.

**Authentication:** Required

**Response:**
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "user",
  "email": "user@example.com",
  "level": 12,
  "total_xp": 2450,
  "created_at": "2025-06-01T10:00:00Z"
}
```

---

## Health & Monitoring

**Untagged Endpoints** - System health and monitoring

---

#### `GET /`
Root endpoint - API information.

**Response:**
```json
{
  "message": "Proxy Agent Platform",
  "version": "0.1.0",
  "agents": ["task", "energy", "focus", "gamification", "progress"]
}
```

---

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

Use for monitoring, load balancer health checks, and uptime monitoring.

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Delete/update succeeded, no response body |
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Request body failed Pydantic validation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server encountered an error |
| 503 | Service Unavailable | Server is temporarily down |

### Validation Errors (422)

Pydantic validation errors provide detailed field-level information:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "title"],
      "msg": "Field required",
      "input": {...},
      "url": "https://errors.pydantic.dev/2.5/v/missing"
    },
    {
      "type": "string_too_short",
      "loc": ["body", "description"],
      "msg": "String should have at least 1 character",
      "input": "",
      "ctx": {"min_length": 1}
    }
  ]
}
```

**Field Descriptions:**
- `type`: Error type (missing, string_too_short, value_error, etc.)
- `loc`: Location of error (["body", "field_name"])
- `msg`: Human-readable error message
- `input`: The invalid input value
- `ctx`: Additional context (constraints, etc.)

---

## Rate Limiting

### Current Status
⚠️ **Rate limiting is NOT implemented** in the current version (v0.1.0).

### Planned Limits (Future)
| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| Task Operations | 100 requests | 1 minute |
| Capture API | 30 requests | 1 minute |
| Energy/Focus/Progress | 50 requests | 1 minute |
| Gamification | 100 requests | 1 minute |
| WebSocket Connections | 5 concurrent | per user |

### Rate Limit Headers (Planned)
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1730000000
```

**When Exceeded:**
```json
{
  "detail": "Rate limit exceeded. Try again in 45 seconds.",
  "retry_after": 45
}
```

---

## Examples

### Complete Task Workflow

```bash
#!/bin/bash
# Complete workflow: Create → Track → Focus → Complete

# 1. Login
TOKEN=$(curl -s -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "demo", "password": "demo123"}' \
  | jq -r '.access_token')

# 2. Quick capture a task
TASK=$(curl -s -X POST "http://localhost:8000/api/v1/capture/" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Review and deploy authentication system",
    "user_id": "demo-user",
    "mode": "auto"
  }')

TASK_ID=$(echo $TASK | jq -r '.task.task_id')
echo "Created task: $TASK_ID"

# 3. Save task to database
curl -s -X POST "http://localhost:8000/api/v1/capture/save" \
  -H "Content-Type: application/json" \
  -d "{
    \"task\": $(echo $TASK | jq '.task'),
    \"micro_steps\": $(echo $TASK | jq '.micro_steps'),
    \"user_id\": \"demo-user\",
    \"project_id\": \"project-123\"
  }" | jq

# 4. Check energy level
ENERGY=$(curl -s -X POST "http://localhost:8000/api/v1/energy/track" \
  -H "Content-Type: application/json" \
  -d '{
    "sleep_quality": 8,
    "stress_level": 3,
    "hydration_level": 7
  }')

echo "Energy level: $(echo $ENERGY | jq -r '.energy_level')/10"

# 5. Start focus session
SESSION=$(curl -s -X POST "http://localhost:8000/api/v1/focus/sessions/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task_context": "Authentication deployment",
    "technique": "pomodoro",
    "duration_minutes": 25
  }')

SESSION_ID=$(echo $SESSION | jq -r '.session_id')
echo "Focus session started: $SESSION_ID"

# ... work for 25 minutes ...

# 6. End focus session
curl -s -X POST "http://localhost:8000/api/v1/focus/sessions/$SESSION_ID/end" \
  -H "Authorization: Bearer $TOKEN" | jq

# 7. Complete task and claim reward
curl -s -X POST "http://localhost:8000/api/v1/rewards/claim" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "demo-user",
    "task_id": "'$TASK_ID'",
    "action_type": "task",
    "task_priority": "high",
    "streak_days": 3,
    "energy_level": 75
  }' | jq

echo "✅ Task complete! Reward claimed."
```

### Python Example

```python
import requests
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

class ProxyAgentClient:
    def __init__(self, username: str, password: str):
        self.base_url = BASE_URL
        self.token = self._login(username, password)

    def _login(self, username: str, password: str) -> str:
        """Login and get access token"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        response.raise_for_status()
        return response.json()["access_token"]

    @property
    def headers(self) -> Dict[str, str]:
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def quick_capture(self, query: str, user_id: str = "demo-user") -> Dict[str, Any]:
        """Quick capture a task"""
        response = requests.post(
            f"{self.base_url}/api/v1/capture/",
            json={
                "query": query,
                "user_id": user_id,
                "mode": "auto"
            }
        )
        response.raise_for_status()
        return response.json()

    def start_focus_session(
        self,
        task_context: str,
        technique: str = "pomodoro",
        duration: int = 25
    ) -> Dict[str, Any]:
        """Start a focus session"""
        response = requests.post(
            f"{self.base_url}/api/v1/focus/sessions/start",
            headers=self.headers,
            json={
                "task_context": task_context,
                "technique": technique,
                "duration_minutes": duration
            }
        )
        response.raise_for_status()
        return response.json()

    def track_energy(self, **kwargs) -> Dict[str, Any]:
        """Track current energy level"""
        response = requests.post(
            f"{self.base_url}/api/v1/energy/track",
            json=kwargs
        )
        response.raise_for_status()
        return response.json()

# Usage
client = ProxyAgentClient("demo", "demo123")

# Capture task
task = client.quick_capture("Deploy authentication system by Friday")
print(f"Task created: {task['task']['title']}")

# Track energy
energy = client.track_energy(
    sleep_quality=8,
    stress_level=3,
    hydration_level=7
)
print(f"Energy level: {energy['energy_level']}/10")

# Start focus session
session = client.start_focus_session("Authentication deployment")
print(f"Focus session: {session['session_id']}")
```

### TypeScript/JavaScript Example

```typescript
interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface Task {
  task_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

class ProxyAgentClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async login(username: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const data: LoginResponse = await response.json();
    this.token = data.access_token;
  }

  private get headers(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async quickCapture(query: string, userId: string = 'demo-user') {
    const response = await fetch(`${this.baseUrl}/api/v1/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, user_id: userId, mode: 'auto' })
    });

    if (!response.ok) throw new Error('Capture failed');
    return await response.json();
  }

  async getTasks(filters: any = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${this.baseUrl}/api/v1/tasks?${params}`,
      { headers: this.headers }
    );

    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  }

  async startFocusSession(
    taskContext: string,
    technique: string = 'pomodoro',
    duration: number = 25
  ) {
    const response = await fetch(
      `${this.baseUrl}/api/v1/focus/sessions/start`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          task_context: taskContext,
          technique,
          duration_minutes: duration
        })
      }
    );

    if (!response.ok) throw new Error('Failed to start session');
    return await response.json();
  }
}

// Usage
(async () => {
  const client = new ProxyAgentClient();

  // Login
  await client.login('demo', 'demo123');

  // Capture task
  const capture = await client.quickCapture(
    'Deploy authentication system by Friday'
  );
  console.log('Task created:', capture.task.title);

  // Get tasks
  const tasks = await client.getTasks({ status: 'in_progress' });
  console.log(`Active tasks: ${tasks.total}`);

  // Start focus session
  const session = await client.startFocusSession('Authentication deployment');
  console.log('Focus session:', session.session_id);
})();
```

---

## Additional Resources

### OpenAPI Specification
- **JSON Format:** [openapi.json](./openapi.json)
- **YAML Format:** [openapi.yaml](./openapi.yaml)

Import into:
- **Swagger UI:** [swagger.io/tools/swagger-ui](https://swagger.io/tools/swagger-ui/)
- **Postman:** Import → Link → `http://localhost:8000/openapi.json`
- **Insomnia:** Import → URL → `http://localhost:8000/openapi.json`

### Interactive Documentation
FastAPI provides auto-generated interactive docs:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Support
- **GitHub Issues:** [github.com/your-repo/issues](https://github.com/your-repo/issues)
- **Documentation:** [docs.proxyagent.dev](https://docs.proxyagent.dev)
- **Discord Community:** [discord.gg/proxy-agent](https://discord.gg/proxy-agent)

---

**Last Updated:** October 24, 2025
**API Version:** 0.1.0
**Total Endpoints:** 86
**Total Schemas:** 76

