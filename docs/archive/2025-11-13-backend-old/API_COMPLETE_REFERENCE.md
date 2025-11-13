# Complete API Reference

**Last Updated**: October 28, 2025
**Version**: 0.1.0
**Base URL**: `http://localhost:8000` (dev) | `https://api.proxyagent.dev` (prod)

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Tasks API](#tasks-api)
- [Capture API](#capture-api)
- [Compass API](#compass-api)
- [Focus API](#focus-api)
- [Energy API](#energy-api)
- [Gamification API](#gamification-api)
- [Progress API](#progress-api)
- [Ritual API](#ritual-api)
- [Rewards API](#rewards-api)
- [Secretary API](#secretary-api)
- [WebSocket API](#websocket-api)
- [Error Responses](#error-responses)

---

## Overview

The Proxy Agent Platform API is a **RESTful JSON API** built with FastAPI.

### Base URLs

| Environment | URL |
|-------------|-----|
| **Development** | `http://localhost:8000` |
| **Production** | `https://api.proxyagent.dev` |

### API Versions

| Version | Prefix | Status |
|---------|--------|--------|
| **v1** (Legacy) | `/api/v1/` | Deprecated |
| **v2** (Current) | `/api/v2/` | Active |
| **No prefix** (Mixed) | `/api/` | Active |

### Common Headers

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-User-ID: <user_id>
```

### Interactive Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Authentication

### Register User

**POST** `/api/auth/register`

Create a new user account.

**Request**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response** (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "created_at": "2025-10-28T10:00:00Z"
  }
}
```

---

### Login

**POST** `/api/auth/login`

Authenticate and get access token.

**Request**:
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe"
  }
}
```

---

### Get Profile

**GET** `/api/auth/profile`

Get current user profile.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "timezone": "America/New_York",
  "avatar_url": "https://...",
  "bio": "ADHD software engineer",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "created_at": "2025-10-28T10:00:00Z"
}
```

---

### Logout

**POST** `/api/auth/logout`

Invalidate current session.

**Headers**: `Authorization: Bearer <token>`

**Response** (200):
```json
{
  "message": "Successfully logged out"
}
```

---

## Tasks API

### Create Task (v2)

**POST** `/api/v2/tasks`

Create a new task.

**Request**:
```json
{
  "title": "Write backend documentation",
  "description": "Complete API reference and architecture docs",
  "priority": "high",
  "estimated_hours": 4.5,
  "tags": ["documentation", "backend"],
  "due_date": "2025-10-30T17:00:00Z",
  "project_id": "proj-123",
  "zone_id": "zone-work"
}
```

**Response** (201):
```json
{
  "task_id": "task-456",
  "title": "Write backend documentation",
  "description": "Complete API reference and architecture docs",
  "status": "todo",
  "priority": "high",
  "estimated_hours": 4.5,
  "actual_hours": 0.0,
  "tags": ["documentation", "backend"],
  "due_date": "2025-10-30T17:00:00Z",
  "project_id": "proj-123",
  "zone_id": "zone-work",
  "created_at": "2025-10-28T10:00:00Z",
  "updated_at": "2025-10-28T10:00:00Z"
}
```

---

### Get Task

**GET** `/api/v2/tasks/{task_id}`

Retrieve a specific task.

**Path Parameters**:
- `task_id` (string, required) - Task identifier

**Response** (200):
```json
{
  "task_id": "task-456",
  "title": "Write backend documentation",
  "description": "Complete API reference and architecture docs",
  "status": "in_progress",
  "priority": "high",
  "estimated_hours": 4.5,
  "actual_hours": 1.5,
  "completion_percentage": 33,
  "micro_steps": [
    {
      "step_id": "step-1",
      "step_number": 1,
      "description": "Create API reference doc",
      "estimated_minutes": 60,
      "is_completed": true
    },
    {
      "step_id": "step-2",
      "step_number": 2,
      "description": "Document database schema",
      "estimated_minutes": 90,
      "is_completed": false
    }
  ],
  "created_at": "2025-10-28T10:00:00Z",
  "updated_at": "2025-10-28T12:30:00Z"
}
```

---

### Update Task

**PUT** `/api/v2/tasks/{task_id}`

Update an existing task.

**Request**:
```json
{
  "title": "Write comprehensive backend documentation",
  "status": "in_progress",
  "actual_hours": 2.0
}
```

**Response** (200):
```json
{
  "task_id": "task-456",
  "title": "Write comprehensive backend documentation",
  "status": "in_progress",
  "actual_hours": 2.0,
  "updated_at": "2025-10-28T13:00:00Z"
}
```

---

### Delete Task

**DELETE** `/api/v2/tasks/{task_id}`

Soft-delete a task.

**Response** (204): No content

---

### List Tasks

**GET** `/api/v2/tasks`

List tasks with filtering and pagination.

**Query Parameters**:
- `status` (string, optional) - Filter by status: `todo`, `in_progress`, `done`, `blocked`
- `priority` (string, optional) - Filter by priority: `low`, `medium`, `high`, `urgent`
- `project_id` (string, optional) - Filter by project
- `zone_id` (string, optional) - Filter by compass zone
- `due_before` (datetime, optional) - Tasks due before date
- `due_after` (datetime, optional) - Tasks due after date
- `limit` (integer, optional, default: 50) - Results per page
- `offset` (integer, optional, default: 0) - Pagination offset

**Response** (200):
```json
{
  "tasks": [
    {
      "task_id": "task-456",
      "title": "Write backend documentation",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2025-10-30T17:00:00Z"
    },
    {
      "task_id": "task-789",
      "title": "Implement task delegation",
      "status": "todo",
      "priority": "urgent",
      "due_date": "2025-10-29T12:00:00Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0,
  "has_more": false
}
```

---

### Update Task Status

**PATCH** `/api/v2/tasks/{task_id}/status`

Update only the task status.

**Request**:
```json
{
  "status": "done"
}
```

**Response** (200):
```json
{
  "task_id": "task-456",
  "status": "done",
  "completed_at": "2025-10-28T15:30:00Z",
  "xp_earned": 45
}
```

---

### Search Tasks

**GET** `/api/v2/tasks/search`

Full-text search across tasks.

**Query Parameters**:
- `q` (string, required) - Search query
- `limit` (integer, optional, default: 20)

**Response** (200):
```json
{
  "results": [
    {
      "task_id": "task-456",
      "title": "Write backend documentation",
      "description": "Complete API reference...",
      "relevance_score": 0.92
    }
  ],
  "total": 1,
  "query": "backend documentation"
}
```

---

### Get Task Stats

**GET** `/api/v2/tasks/stats`

Get task statistics for the current user.

**Response** (200):
```json
{
  "total_tasks": 127,
  "completed_tasks": 89,
  "in_progress_tasks": 12,
  "blocked_tasks": 3,
  "todo_tasks": 23,
  "completion_rate": 70.1,
  "average_completion_time_hours": 3.2,
  "overdue_tasks": 5,
  "due_today": 7,
  "due_this_week": 18
}
```

---

### Split Task into Micro-Steps

**POST** `/api/v1/tasks/{task_id}/split`

Use AI to split a task into 1-10 minute micro-steps.

**Request**:
```json
{
  "max_steps": 8,
  "max_minutes_per_step": 10
}
```

**Response** (200):
```json
{
  "task_id": "task-456",
  "micro_steps": [
    {
      "step_id": "step-1",
      "step_number": 1,
      "description": "Create API reference markdown file",
      "estimated_minutes": 5,
      "emoji": "📝"
    },
    {
      "step_id": "step-2",
      "step_number": 2,
      "description": "Document authentication endpoints",
      "estimated_minutes": 10,
      "emoji": "🔐"
    }
  ],
  "total_steps": 8,
  "total_minutes": 68
}
```

---

### Complete Micro-Step

**PATCH** `/api/v1/micro-steps/{step_id}/complete`

Mark a micro-step as complete.

**Response** (200):
```json
{
  "step_id": "step-1",
  "is_completed": true,
  "completed_at": "2025-10-28T14:15:00Z",
  "xp_earned": 5,
  "parent_task_progress": 12.5
}
```

---

## Capture API

### Quick Capture

**POST** `/api/capture/`

2-second brain dump capture with LLM parsing.

**Request**:
```json
{
  "text": "Buy milk tomorrow and call dentist about appointment",
  "user_id": "user-123"
}
```

**Response** (200):
```json
{
  "parsed_items": [
    {
      "type": "task",
      "title": "Buy milk",
      "due_date": "2025-10-29T12:00:00Z",
      "confidence": 0.95
    },
    {
      "type": "task",
      "title": "Call dentist about appointment",
      "confidence": 0.88
    }
  ],
  "processing_time_ms": 420,
  "xp_earned": 10
}
```

---

### Clarify Capture

**POST** `/api/capture/clarify`

Ask LLM to clarify ambiguous capture.

**Request**:
```json
{
  "text": "Project meeting next week",
  "user_id": "user-123"
}
```

**Response** (200):
```json
{
  "clarification_question": "Which project is this meeting for?",
  "suggested_values": ["Backend Docs", "Mobile App", "AI Integration"],
  "capture_id": "capture-789"
}
```

---

### Save Capture

**POST** `/api/capture/save`

Save clarified capture as tasks.

**Request**:
```json
{
  "capture_id": "capture-789",
  "items": [
    {
      "title": "Backend Docs project meeting",
      "due_date": "2025-11-04T14:00:00Z",
      "project_id": "proj-backend"
    }
  ]
}
```

**Response** (200):
```json
{
  "tasks_created": [
    {
      "task_id": "task-999",
      "title": "Backend Docs project meeting"
    }
  ],
  "xp_earned": 15
}
```

---

### Get Capture Stats

**GET** `/api/capture/stats/{user_id}`

Get capture usage statistics.

**Response** (200):
```json
{
  "total_captures": 423,
  "captures_this_week": 37,
  "average_processing_time_ms": 380,
  "top_capture_types": [
    { "type": "task", "count": 312 },
    { "type": "thought", "count": 89 },
    { "type": "idea", "count": 22 }
  ]
}
```

---

## Compass API

### Get Zones

**GET** `/api/compass/zones`

List all compass zones for the user.

**Response** (200):
```json
{
  "zones": [
    {
      "zone_id": "zone-work",
      "name": "Work",
      "icon": "💼",
      "color": "#3b82f6",
      "simple_goal": "Ship backend v2",
      "sort_order": 1,
      "task_count": 23,
      "completed_count": 12
    },
    {
      "zone_id": "zone-life",
      "name": "Life",
      "icon": "🏡",
      "color": "#10b981",
      "simple_goal": "Organize home office",
      "sort_order": 2,
      "task_count": 8,
      "completed_count": 5
    },
    {
      "zone_id": "zone-self",
      "name": "Self",
      "icon": "🧘",
      "color": "#f59e0b",
      "simple_goal": "Exercise 3x/week",
      "sort_order": 3,
      "task_count": 5,
      "completed_count": 2
    }
  ]
}
```

---

### Create Zone

**POST** `/api/compass/zones`

Create a new compass zone.

**Request**:
```json
{
  "name": "Health",
  "icon": "💪",
  "color": "#ef4444",
  "simple_goal": "Get 8 hours sleep",
  "sort_order": 4
}
```

**Response** (201):
```json
{
  "zone_id": "zone-health",
  "name": "Health",
  "icon": "💪",
  "color": "#ef4444",
  "simple_goal": "Get 8 hours sleep",
  "sort_order": 4,
  "created_at": "2025-10-28T16:00:00Z"
}
```

---

### Update Zone

**PUT** `/api/compass/zones/{zone_id}`

Update a compass zone.

**Request**:
```json
{
  "simple_goal": "Ship backend v2 by Nov 15"
}
```

**Response** (200):
```json
{
  "zone_id": "zone-work",
  "name": "Work",
  "simple_goal": "Ship backend v2 by Nov 15",
  "updated_at": "2025-10-28T16:30:00Z"
}
```

---

### Get Zone Progress

**GET** `/api/compass/progress`

Get progress for all zones.

**Response** (200):
```json
{
  "zones": [
    {
      "zone_id": "zone-work",
      "name": "Work",
      "total_tasks": 23,
      "completed_tasks": 12,
      "completion_rate": 52.2,
      "xp_earned": 345,
      "streak_days": 7
    }
  ],
  "overall_completion_rate": 58.1,
  "total_xp": 782
}
```

---

## Focus API

### Start Focus Session

**POST** `/api/focus/start`

Start a Pomodoro/focus session.

**Request**:
```json
{
  "task_id": "task-456",
  "duration_minutes": 25,
  "user_id": "user-123"
}
```

**Response** (201):
```json
{
  "session_id": "session-789",
  "task_id": "task-456",
  "duration_minutes": 25,
  "started_at": "2025-10-28T14:00:00Z",
  "ends_at": "2025-10-28T14:25:00Z",
  "is_active": true
}
```

---

### Get Session Status

**GET** `/api/focus/status`

Get current active session.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "has_active_session": true,
  "session": {
    "session_id": "session-789",
    "task_id": "task-456",
    "task_title": "Write backend documentation",
    "duration_minutes": 25,
    "elapsed_minutes": 12,
    "remaining_minutes": 13,
    "started_at": "2025-10-28T14:00:00Z",
    "ends_at": "2025-10-28T14:25:00Z",
    "interruptions": 1
  }
}
```

---

### Complete Focus Session

**POST** `/api/focus/complete`

End and mark session as complete.

**Request**:
```json
{
  "session_id": "session-789",
  "interruptions": 2,
  "notes": "Completed API docs section"
}
```

**Response** (200):
```json
{
  "session_id": "session-789",
  "is_completed": true,
  "completed_at": "2025-10-28T14:25:00Z",
  "actual_duration_minutes": 25,
  "interruptions": 2,
  "xp_earned": 30,
  "task_progress": 45
}
```

---

## Energy API

### Set Energy Level

**POST** `/api/energy/set`

Log current energy level.

**Request**:
```json
{
  "energy_level": 2,
  "user_id": "user-123",
  "notes": "Mid-afternoon slump"
}
```

**Response** (200):
```json
{
  "snapshot_id": "snap-456",
  "energy_level": 2,
  "recorded_at": "2025-10-28T14:30:00Z",
  "time_of_day": "afternoon",
  "xp_earned": 5
}
```

**Energy Levels**:
- `1` = Low (red)
- `2` = Medium (yellow)
- `3` = High (green)

---

### Get Current Energy

**GET** `/api/energy/current`

Get most recent energy snapshot.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "snapshot_id": "snap-456",
  "energy_level": 2,
  "recorded_at": "2025-10-28T14:30:00Z",
  "time_of_day": "afternoon",
  "hours_since_last": 2.5
}
```

---

### Get Energy History

**GET** `/api/energy/history`

Get energy history with pattern analysis.

**Query Parameters**:
- `user_id` (required)
- `days` (optional, default: 7)

**Response** (200):
```json
{
  "snapshots": [
    {
      "snapshot_id": "snap-456",
      "energy_level": 2,
      "recorded_at": "2025-10-28T14:30:00Z",
      "time_of_day": "afternoon"
    }
  ],
  "patterns": {
    "best_time_of_day": "morning",
    "average_energy": 2.3,
    "low_energy_count": 12,
    "high_energy_count": 8
  },
  "recommendations": [
    "Schedule high-focus tasks in the morning",
    "Take breaks during afternoon slumps"
  ]
}
```

---

## Gamification API

### Get User Progress

**GET** `/api/gamification/progress`

Get current XP, level, and achievements.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "user_id": "user-123",
  "current_xp": 3450,
  "level": 12,
  "xp_to_next_level": 550,
  "total_xp_for_level": 4000,
  "level_progress_percent": 86.25,
  "total_achievements_unlocked": 23,
  "total_achievements": 50,
  "recent_achievements": [
    {
      "achievement_id": "ach-streaker",
      "name": "Week Warrior",
      "description": "Maintain 7-day streak",
      "unlocked_at": "2025-10-27T10:00:00Z",
      "xp_reward": 100
    }
  ]
}
```

---

### Add XP

**POST** `/api/gamification/xp/add`

Manually add XP (admin/system use).

**Request**:
```json
{
  "user_id": "user-123",
  "xp_amount": 50,
  "reason": "Completed complex task"
}
```

**Response** (200):
```json
{
  "user_id": "user-123",
  "previous_xp": 3450,
  "added_xp": 50,
  "new_xp": 3500,
  "level_up": false,
  "current_level": 12
}
```

---

### Get Streak

**GET** `/api/gamification/streak`

Get current task completion streak.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "current_streak": 14,
  "longest_streak": 21,
  "streak_start_date": "2025-10-14",
  "last_completion_date": "2025-10-28",
  "streak_status": "active",
  "days_until_break": 0,
  "next_milestone": 21
}
```

---

## Progress API

### Calculate XP

**POST** `/api/progress/xp/calculate`

Calculate XP for task completion.

**Request**:
```json
{
  "task_id": "task-456",
  "completion_time_hours": 3.5,
  "estimated_hours": 4.5
}
```

**Response** (200):
```json
{
  "base_xp": 45,
  "time_bonus": 10,
  "streak_multiplier": 1.2,
  "total_xp": 66,
  "calculation_breakdown": {
    "base_xp": "45 (task complexity)",
    "time_bonus": "10 (completed 22% faster)",
    "streak_multiplier": "1.2x (14-day streak)"
  }
}
```

---

### Get Streak Data

**GET** `/api/progress/streak`

Get detailed streak information.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "current_streak": 14,
  "longest_streak": 21,
  "streak_history": [
    { "date": "2025-10-28", "tasks_completed": 5 },
    { "date": "2025-10-27", "tasks_completed": 3 }
  ],
  "streak_milestones": [
    { "days": 7, "reached": true },
    { "days": 14, "reached": true },
    { "days": 21, "reached": false },
    { "days": 30, "reached": false }
  ]
}
```

---

### Get Level Progression

**GET** `/api/progress/level`

Get level progression details.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "current_level": 12,
  "current_xp": 3450,
  "xp_to_next_level": 550,
  "total_xp_for_level": 4000,
  "progress_percent": 86.25,
  "levels": [
    { "level": 11, "xp_required": 3300, "unlocked": true },
    { "level": 12, "xp_required": 4000, "unlocked": false },
    { "level": 13, "xp_required": 4800, "unlocked": false }
  ]
}
```

---

### Get Progress Visualization

**GET** `/api/progress/visualization`

Get data for progress charts.

**Query**: `user_id=user-123&days=30`

**Response** (200):
```json
{
  "xp_over_time": [
    { "date": "2025-10-01", "xp_earned": 120 },
    { "date": "2025-10-02", "xp_earned": 95 }
  ],
  "tasks_completed_over_time": [
    { "date": "2025-10-01", "tasks": 8 },
    { "date": "2025-10-02", "tasks": 6 }
  ],
  "completion_rate_trend": [
    { "week": "2025-W40", "rate": 72.5 },
    { "week": "2025-W41", "rate": 78.2 }
  ]
}
```

---

## Ritual API

### Check Ritual Status

**GET** `/api/ritual/check`

Check if today's ritual is complete.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "is_completed": false,
  "completion_date": null,
  "needs_completion": true,
  "time_remaining_hours": 8,
  "suggested_tasks": [
    {
      "task_id": "task-456",
      "title": "Write backend documentation",
      "priority": "high",
      "estimated_hours": 4.5
    }
  ]
}
```

---

### Complete Ritual

**POST** `/api/ritual/complete`

Complete morning ritual with 3 focus tasks.

**Request**:
```json
{
  "user_id": "user-123",
  "focus_task_1_id": "task-456",
  "focus_task_2_id": "task-789",
  "focus_task_3_id": "task-101"
}
```

**Response** (200):
```json
{
  "ritual_id": "ritual-222",
  "completion_date": "2025-10-28",
  "completed_at": "2025-10-28T08:30:00Z",
  "focus_tasks": [
    {
      "task_id": "task-456",
      "title": "Write backend documentation"
    },
    {
      "task_id": "task-789",
      "title": "Implement task delegation"
    },
    {
      "task_id": "task-101",
      "title": "Review PRs"
    }
  ],
  "xp_earned": 25,
  "streak_updated": true
}
```

---

### Get Ritual Stats

**GET** `/api/ritual/stats`

Get ritual completion statistics.

**Query**: `user_id=user-123&days=30`

**Response** (200):
```json
{
  "total_rituals": 30,
  "completed_rituals": 24,
  "skipped_rituals": 6,
  "completion_rate": 80.0,
  "current_streak": 7,
  "longest_streak": 14,
  "average_completion_time": "08:45:00",
  "most_productive_day": "Monday",
  "focus_task_completion_rate": 67.5
}
```

---

### Get Today's Ritual

**GET** `/api/ritual/today`

Get today's ritual if completed.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "ritual_id": "ritual-222",
  "completion_date": "2025-10-28",
  "completed_at": "2025-10-28T08:30:00Z",
  "focus_tasks": [
    {
      "task_id": "task-456",
      "title": "Write backend documentation",
      "status": "in_progress",
      "progress_percent": 45
    },
    {
      "task_id": "task-789",
      "title": "Implement task delegation",
      "status": "todo",
      "progress_percent": 0
    },
    {
      "task_id": "task-101",
      "title": "Review PRs",
      "status": "done",
      "progress_percent": 100
    }
  ]
}
```

---

## Rewards API

### Claim Reward

**POST** `/api/rewards/claim`

Claim reward for task completion.

**Request**:
```json
{
  "user_id": "user-123",
  "task_id": "task-456",
  "reward_type": "standard"
}
```

**Response** (200):
```json
{
  "reward_type": "standard",
  "xp_earned": 45,
  "dopamine_boost": "🎉",
  "celebration_message": "Great job! Keep the momentum going!",
  "streak_bonus": 10,
  "total_xp": 55,
  "level_up": false
}
```

---

### Open Mystery Box

**POST** `/api/rewards/mystery-box`

Open a mystery reward box (earned randomly).

**Request**:
```json
{
  "user_id": "user-123",
  "box_type": "gold"
}
```

**Response** (200):
```json
{
  "box_type": "gold",
  "reward": {
    "type": "xp",
    "amount": 150,
    "rarity": "epic"
  },
  "animation": "golden_burst",
  "message": "Epic reward! You earned 150 XP!"
}
```

---

## Secretary API

### Get Dashboard

**GET** `/api/secretary/dashboard`

Get intelligent dashboard overview.

**Query**: `user_id=user-123`

**Response** (200):
```json
{
  "priorities": [
    {
      "task_id": "task-789",
      "title": "Implement task delegation",
      "urgency_score": 9.2,
      "reason": "Due today, high priority"
    }
  ],
  "focus_recommendation": "High energy detected - tackle complex tasks now",
  "overdue_count": 2,
  "due_today_count": 5,
  "bottlenecks": [
    "Project Alpha has 3 blocked tasks"
  ],
  "achievements_available": [
    "One more task to unlock 'Week Warrior' badge!"
  ]
}
```

---

## WebSocket API

### Connect to WebSocket

**WS** `/ws/{user_id}`

Establish WebSocket connection for real-time updates.

**Connection**:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/user-123');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

**Message Types**:

**Task Update**:
```json
{
  "type": "task_update",
  "task_id": "task-456",
  "status": "done",
  "updated_at": "2025-10-28T15:00:00Z"
}
```

**XP Gained**:
```json
{
  "type": "xp_gained",
  "xp_amount": 45,
  "new_total": 3495,
  "reason": "Completed task"
}
```

**Achievement Unlocked**:
```json
{
  "type": "achievement_unlocked",
  "achievement_id": "ach-streaker",
  "name": "Week Warrior",
  "xp_reward": 100
}
```

**Focus Session Started**:
```json
{
  "type": "focus_started",
  "session_id": "session-789",
  "task_id": "task-456",
  "duration_minutes": 25
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Task with ID 'task-999' not found",
    "details": {
      "resource_type": "task",
      "resource_id": "task-999"
    },
    "timestamp": "2025-10-28T15:00:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK | Successful GET/PUT/PATCH |
| **201** | Created | Successful POST |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Invalid input data |
| **401** | Unauthorized | Missing/invalid token |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **422** | Validation Error | Pydantic validation failed |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Error | Server error |
| **503** | Service Unavailable | Temporary outage |

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_INPUT` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Permission denied |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## Rate Limiting

**Current Limits**:
- **Anonymous**: 100 requests/hour
- **Authenticated**: 1000 requests/hour
- **Premium**: 10000 requests/hour

**Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 2025-10-28T16:00:00Z
```

---

## Pagination

**Standard pagination** for list endpoints:

**Request**:
```http
GET /api/v2/tasks?limit=20&offset=40
```

**Response**:
```json
{
  "items": [...],
  "total": 157,
  "limit": 20,
  "offset": 40,
  "has_more": true,
  "next_offset": 60
}
```

---

## Changelog

### v0.1.0 (2025-10-28)
- Initial API documentation
- All core endpoints documented
- WebSocket API added
- Error handling standardized

---

**Questions?** See [BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md) for system design.
