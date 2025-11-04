# API Integration Guide
## Proxy Agent Platform - Mobile App

**Date**: November 4, 2025
**Status**: Comprehensive API Reference

---

## Table of Contents
1. [Base URL & Authentication](#base-url--authentication)
2. [Capture Mode APIs](#capture-mode-apis)
3. [Task Management APIs](#task-management-apis)
4. [Integration APIs (Gmail)](#integration-apis-gmail)
5. [Mobile-Specific APIs](#mobile-specific-apis)
6. [Additional Feature APIs](#additional-feature-apis)
7. [Error Handling](#error-handling)
8. [Usage Mapping](#usage-mapping)

---

## Base URL & Authentication

### Base URL
```
Development: http://localhost:8000
Production: TBD
```

### Authentication
Most endpoints require authentication via JWT token:
```typescript
headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>"
}
```

---

## Capture Mode APIs

### 1. Initial Capture (POST /api/v1/capture/)

**Purpose**: Brain dump → task decomposition → micro-step generation

**Request**:
```typescript
POST /api/v1/capture/
{
  "query": "Buy groceries for the week",
  "user_id": "user_123",
  "mode": "auto"  // "auto" | "manual" | "clarify"
}
```

**Response**:
```json
{
  "task": {
    "task_id": "task_abc123",
    "title": "Buy groceries for the week",
    "description": "Purchase all necessary groceries...",
    "estimated_minutes": 45,
    "priority": "medium"
  },
  "micro_steps": [
    {
      "step_id": "step_1",
      "description": "Make grocery list from meal plan",
      "estimated_minutes": 5,
      "delegation_mode": "do",
      "leaf_type": "human",
      "icon": "📝",
      "short_label": "List",
      "tags": ["CHAMPS:Clarity", "energy:low"]
    },
    {
      "step_id": "step_2",
      "description": "Check pantry and fridge inventory",
      "estimated_minutes": 3,
      "delegation_mode": "do",
      "leaf_type": "human",
      "icon": "🔍",
      "short_label": "Check",
      "tags": ["CHAMPS:Action", "energy:medium"]
    }
  ],
  "clarifications": [],
  "ready_to_save": true,
  "mode": "auto"
}
```

**Mobile Usage**: `mobile/app/(tabs)/capture/add.tsx` ⚠️ NOT YET IMPLEMENTED

---

### 2. Submit Clarifications (POST /api/v1/capture/clarify)

**Purpose**: Answer AI clarification questions → re-classify micro-steps

**Request**:
```typescript
POST /api/v1/capture/clarify
{
  "micro_steps": [...],  // From previous capture response
  "answers": {
    "email_recipient": "boss@company.com",
    "email_subject": "Weekly Update",
    "calendar_when": "2025-10-23 14:00",
    "iot_device": "AC"
  }
}
```

**Response**:
```json
{
  "task": {},  // Task unchanged during clarification
  "micro_steps": [
    {
      "step_id": "step_1",
      "description": "Send email to boss@company.com",
      "estimated_minutes": 2,
      "delegation_mode": "delegate",
      "leaf_type": "digital",
      "automation_plan": {
        "provider": "gmail",
        "action": "send_email",
        "params": {
          "to": "boss@company.com",
          "subject": "Weekly Update"
        }
      }
    }
  ],
  "clarifications": [],
  "ready_to_save": true,
  "mode": "clarify"
}
```

**Mobile Usage**: `mobile/app/(tabs)/capture/clarify.tsx` ⚠️ NEEDS VERIFICATION

---

### 3. Save Capture (POST /api/v1/capture/save)

**Purpose**: Save finalized task tree to database

**Request**:
```typescript
POST /api/v1/capture/save
{
  "task": {...},  // From capture response
  "micro_steps": [{...}, {...}],
  "user_id": "alice",
  "project_id": "project-123"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "task_id": "task_abc123",
  "micro_step_ids": ["step_1", "step_2", "step_3"],
  "total_steps": 3,
  "message": "Capture saved: 3 micro-steps created"
}
```

**Mobile Usage**: Called after user confirms task in TaskBreakdownModal

---

## Task Management APIs

### 4. Get All Tasks (GET /api/v1/tasks)

**Purpose**: Load user's task list for Scout mode

**Request**:
```typescript
GET /api/v1/tasks?user_id=user_123&status=todo&limit=50&skip=0
```

**Query Parameters**:
- `user_id` (required): User ID
- `status`: Filter by status (`todo`, `in_progress`, `done`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `limit`: Max results (default: 100)
- `skip`: Pagination offset (default: 0)

**Response**:
```json
{
  "tasks": [
    {
      "task_id": "task_001",
      "title": "Buy groceries for the week",
      "description": "Purchase all necessary groceries",
      "estimated_minutes": 45,
      "priority": "medium",
      "status": "todo",
      "energy_level": "medium",
      "zone_id": "life",
      "tags": ["CHAMPS:Action", "shopping"],
      "micro_steps_count": 5,
      "created_at": "2025-11-04T10:30:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

**Mobile Usage**: `mobile/app/(tabs)/scout.tsx` ❌ NOT YET IMPLEMENTED

---

### 5. Get Task Details (GET /api/v1/tasks/{task_id})

**Purpose**: Load full task with micro-steps for Hunter mode

**Request**:
```typescript
GET /api/v1/tasks/task_001
```

**Response**:
```json
{
  "task": {
    "task_id": "task_001",
    "title": "Buy groceries for the week",
    "description": "Purchase all necessary groceries",
    "estimated_minutes": 45,
    "status": "in_progress",
    "priority": "medium"
  },
  "micro_steps": [
    {
      "step_id": "step_1",
      "step_number": 1,
      "description": "Make grocery list from meal plan",
      "estimated_minutes": 5,
      "status": "todo",
      "completed": false,
      "icon": "📝",
      "short_label": "List"
    },
    {
      "step_id": "step_2",
      "step_number": 2,
      "description": "Check pantry and fridge inventory",
      "estimated_minutes": 3,
      "status": "todo",
      "completed": false,
      "icon": "🔍",
      "short_label": "Check"
    }
  ]
}
```

**Mobile Usage**: `mobile/app/(tabs)/hunter.tsx` ❌ NOT YET IMPLEMENTED

---

### 6. Create Task (POST /api/v1/tasks)

**Purpose**: Manually create a task (alternative to capture flow)

**Request**:
```typescript
POST /api/v1/tasks
{
  "title": "Review financial report",
  "description": "Review Q4 financial report for accuracy",
  "project_id": "default-project",
  "priority": "high",
  "estimated_hours": 2.0,
  "tags": ["finance", "review"],
  "due_date": "2025-11-10T17:00:00Z"
}
```

**Response**:
```json
{
  "task": {
    "task_id": "task_new_123",
    "title": "Review financial report",
    "description": "Review Q4 financial report for accuracy",
    "status": "todo",
    "priority": "high",
    "estimated_hours": 2.0,
    "created_at": "2025-11-04T14:30:00Z"
  }
}
```

**Mobile Usage**: Not currently used (Capture flow preferred)

---

### 7. Update Task Status (PUT /api/v1/tasks/{task_id})

**Purpose**: Update task fields (status, priority, etc.)

**Request**:
```typescript
PUT /api/v1/tasks/task_001
{
  "status": "done",
  "actual_hours": 0.75
}
```

**Response**:
```json
{
  "task": {
    "task_id": "task_001",
    "status": "done",
    "actual_hours": 0.75,
    "completed_at": "2025-11-04T15:00:00Z"
  }
}
```

**Mobile Usage**: Called when user completes all micro-steps in Hunter mode

---

### 8. Complete Micro-Step (PATCH /api/v1/micro-steps/{step_id}/complete)

**Purpose**: Mark a micro-step as complete and award XP

**Request**:
```typescript
PATCH /api/v1/micro-steps/step_1/complete
{
  "completed": true,
  "actual_minutes": 6
}
```

**Response**:
```json
{
  "step": {
    "step_id": "step_1",
    "completed": true,
    "completed_at": "2025-11-04T15:05:00Z",
    "actual_minutes": 6,
    "estimated_minutes": 5
  },
  "xp_awarded": 25,
  "next_step": {
    "step_id": "step_2",
    "description": "Check pantry and fridge inventory"
  }
}
```

**Mobile Usage**: `mobile/app/(tabs)/hunter.tsx` when user swipes up ❌ NOT YET IMPLEMENTED

---

### 9. Split Task (POST /api/v1/tasks/{task_id}/split)

**Purpose**: **Epic 7** - Break complex tasks into atomic micro-steps

**Request**:
```typescript
POST /api/v1/tasks/task_001/split
{
  "user_id": "user_123",
  "min_minutes": 2,
  "max_minutes": 5,
  "target_depth": 3
}
```

**Response**:
```json
{
  "task_id": "task_001",
  "total_steps": 12,
  "steps": [
    {
      "step_id": "step_1",
      "description": "Open meal planning app",
      "estimated_minutes": 2,
      "level": 0,
      "is_leaf": true,
      "short_label": "Open app",
      "icon": "📱"
    },
    {
      "step_id": "step_2",
      "description": "Review this week's meal plan",
      "estimated_minutes": 3,
      "level": 0,
      "is_leaf": true,
      "short_label": "Review",
      "icon": "👀"
    }
  ],
  "estimated_total_minutes": 45,
  "metadata": {
    "split_timestamp": "2025-11-04T15:10:00Z",
    "decomposition_complete": true
  }
}
```

**Status**: ✅ **51/51 tests passing** - Production ready!

**Mobile Usage**: Called automatically during Capture flow, or manually from TaskBreakdownModal

---

### 10. Decompose Micro-Step (POST /api/v1/micro-steps/{step_id}/decompose)

**Purpose**: Further split a micro-step that's still too complex

**Request**:
```typescript
POST /api/v1/micro-steps/step_1/decompose
{
  "user_id": "user_123",
  "target_minutes": 2
}
```

**Response**:
```json
{
  "parent_step_id": "step_1",
  "sub_steps": [
    {
      "step_id": "step_1_1",
      "description": "Open grocery app",
      "estimated_minutes": 1,
      "parent_step_id": "step_1",
      "level": 1
    },
    {
      "step_id": "step_1_2",
      "description": "Create new list named 'Weekly Groceries'",
      "estimated_minutes": 1,
      "parent_step_id": "step_1",
      "level": 1
    }
  ]
}
```

**Mobile Usage**: `mobile/app/(tabs)/hunter.tsx` when user swipes down ❌ NOT YET IMPLEMENTED

---

## Integration APIs (Gmail)

### 11. Authorize Gmail (POST /api/v1/integrations/gmail/authorize)

**Purpose**: Start OAuth flow for Gmail integration

**Request**:
```typescript
POST /api/v1/integrations/gmail/authorize?mobile=true
Headers: {
  "Authorization": "Bearer <jwt_token>"
}
```

**Response**:
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "provider": "gmail",
  "message": "Visit the authorization URL to connect your account"
}
```

**Mobile Usage**:
```typescript
// mobile/app/(tabs)/capture/connect.tsx
const authUrl = await initiateGmailOAuth(activeProfile);
await WebBrowser.openAuthSessionAsync(
  authUrl,
  'exp://oauth/callback'
);
```

**Status**: ✅ **Working** (OAuth flow complete)

---

### 12. OAuth Callback (GET /api/v1/integrations/gmail/callback)

**Purpose**: Handle OAuth redirect with authorization code

**Request**:
```typescript
GET /api/v1/integrations/gmail/callback?code=AUTH_CODE&state=STATE_TOKEN&mobile=true
```

**Response**:
```
HTTP 302 Redirect
Location: proxyagent://oauth/callback?success=true&integration_id=int_123&provider=gmail
```

**Mobile Usage**: Deep link handled by Expo's `Linking.addEventListener`

**Status**: ✅ **Working**

---

### 13. List Integrations (GET /api/v1/integrations/)

**Purpose**: Get user's connected integrations

**Request**:
```typescript
GET /api/v1/integrations/?provider=gmail
Headers: {
  "Authorization": "Bearer <jwt_token>"
}
```

**Response**:
```json
[
  {
    "integration_id": "int_123",
    "provider": "gmail",
    "status": "active",
    "provider_username": "user@gmail.com",
    "sync_enabled": true,
    "last_sync_at": "2025-11-04T14:00:00Z",
    "connected_at": "2025-11-01T10:00:00Z"
  }
]
```

**Mobile Usage**: Display connection status in Capture/Connect screen

**Status**: ✅ **Working**

---

### 14. Trigger Manual Sync (POST /api/v1/integrations/{integration_id}/sync)

**Purpose**: Manually sync Gmail data and generate task suggestions

**Request**:
```typescript
POST /api/v1/integrations/int_123/sync
Headers: {
  "Authorization": "Bearer <jwt_token>"
}
```

**Response**:
```json
{
  "sync_status": "success",
  "items_fetched": 15,
  "tasks_generated": 3,
  "log_id": "log_abc",
  "message": "Sync completed successfully"
}
```

**Mobile Usage**: "Sync Now" button in Capture/Connect screen

---

### 15. Get Suggested Tasks (GET /api/v1/integrations/suggested-tasks)

**Purpose**: Get AI-generated task suggestions from Gmail

**Request**:
```typescript
GET /api/v1/integrations/suggested-tasks?provider=gmail&limit=20
Headers: {
  "Authorization": "Bearer <jwt_token>"
}
```

**Response**:
```json
[
  {
    "integration_task_id": "itask_1",
    "integration_id": "int_123",
    "provider_item_type": "email",
    "suggested_title": "Respond to client meeting request",
    "suggested_description": "Email from john@client.com about scheduling...",
    "suggested_priority": "high",
    "suggested_tags": ["communication", "client"],
    "suggested_deadline": "2025-11-05T17:00:00Z",
    "ai_confidence": 0.85,
    "ai_reasoning": "High-priority email from client requiring response",
    "provider_item_snapshot": {
      "from": "john@client.com",
      "subject": "Meeting Request - Project Kickoff",
      "received_at": "2025-11-04T09:30:00Z"
    },
    "created_at": "2025-11-04T10:00:00Z"
  }
]
```

**Mobile Usage**: Display in Capture mode as suggested tasks to add

---

## Mobile-Specific APIs

### 16. Mobile Quick Capture (POST /api/v1/mobile/quick-capture)

**Purpose**: Optimized capture for mobile with minimal data

**Request**:
```typescript
POST /api/v1/mobile/quick-capture
{
  "text": "Buy milk",
  "user_id": "user_123",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "timestamp": "2025-11-04T15:30:00Z"
}
```

**Response**:
```json
{
  "task_id": "task_quick_123",
  "title": "Buy milk",
  "estimated_minutes": 10,
  "status": "captured",
  "message": "Quick capture saved"
}
```

**Mobile Usage**: Alternative to full capture flow for simple tasks

---

### 17. Mobile Dashboard (GET /api/v1/mobile/dashboard/{user_id})

**Purpose**: Get today's recommended tasks and stats

**Request**:
```typescript
GET /api/v1/mobile/dashboard/user_123
```

**Response**:
```json
{
  "today_tasks": [
    {
      "task_id": "task_001",
      "title": "Buy groceries",
      "estimated_minutes": 45,
      "priority": "high",
      "energy_level": "medium"
    }
  ],
  "stats": {
    "tasks_completed_today": 3,
    "total_xp_today": 150,
    "streak_days": 7
  },
  "recommendations": [
    {
      "task_id": "task_002",
      "reason": "Best match for current energy level (medium)"
    }
  ]
}
```

**Mobile Usage**: `mobile/app/(tabs)/today.tsx` (future implementation)

---

### 18. Mobile Voice Process (POST /api/v1/mobile/voice-process)

**Purpose**: Process voice input (speech-to-text → capture)

**Request**:
```typescript
POST /api/v1/mobile/voice-process
{
  "audio_base64": "...",
  "user_id": "user_123",
  "format": "wav"
}
```

**Response**:
```json
{
  "transcription": "Buy groceries for the week",
  "task": {...},
  "micro_steps": [...]
}
```

**Mobile Usage**: Voice capture button in Capture/Add screen

---

## Additional Feature APIs

### 19. Focus Mode (POST /api/v1/focus/start)

**Purpose**: Start focused work session on a task

**Request**:
```typescript
POST /api/v1/focus/start
{
  "task_id": "task_001",
  "user_id": "user_123",
  "duration_minutes": 25
}
```

**Response**:
```json
{
  "session_id": "session_abc",
  "task_id": "task_001",
  "start_time": "2025-11-04T16:00:00Z",
  "end_time": "2025-11-04T16:25:00Z",
  "status": "active"
}
```

---

### 20. Gamification (GET /api/v1/gamification/stats/{user_id})

**Purpose**: Get user's XP, level, and achievements

**Request**:
```typescript
GET /api/v1/gamification/stats/user_123
```

**Response**:
```json
{
  "user_id": "user_123",
  "level": 12,
  "total_xp": 3450,
  "xp_to_next_level": 550,
  "streak_days": 14,
  "achievements": [
    {
      "achievement_id": "speed_demon",
      "name": "Speed Demon",
      "description": "Complete 10 tasks faster than estimated",
      "unlocked_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

### 21. Compass Zones (GET /api/v1/compass/zones)

**Purpose**: Get life zone categories (Work, Life, Self, etc.)

**Request**:
```typescript
GET /api/v1/compass/zones?user_id=user_123
```

**Response**:
```json
{
  "zones": [
    {
      "zone_id": "work",
      "name": "Work",
      "color": "#3B82F6",
      "icon": "💼",
      "task_count": 15
    },
    {
      "zone_id": "life",
      "name": "Life",
      "color": "#10B981",
      "icon": "🏡",
      "task_count": 8
    }
  ]
}
```

---

## Error Handling

### Standard Error Response

All API errors follow this format:

```json
{
  "detail": "Error message describing what went wrong",
  "status_code": 400,
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2025-11-04T16:00:00Z"
}
```

### Common HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Success with no response body
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid auth token
- `403 Forbidden`: Not authorized to access resource
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server-side error

### Error Handling Example

```typescript
try {
  const response = await fetch('http://localhost:8000/api/v1/tasks/invalid', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  const data = await response.json();
  return data;

} catch (error) {
  console.error('API Error:', error.message);
  Alert.alert('Error', error.message);
}
```

---

## Usage Mapping

### Mobile Screen → API Endpoints

| Screen | APIs Used | Status |
|--------|-----------|--------|
| **capture/add.tsx** | POST /capture/ <br> POST /capture/clarify <br> POST /capture/save | ❌ Not Implemented |
| **capture/connect.tsx** | POST /integrations/gmail/authorize <br> GET /integrations/ | ✅ Working |
| **scout.tsx** | GET /tasks <br> GET /tasks/{id} | ❌ Not Implemented |
| **hunter.tsx** | GET /tasks/{id} <br> PATCH /micro-steps/{id}/complete <br> POST /tasks/{id}/split | ❌ Not Implemented |
| **today.tsx** | GET /mobile/dashboard/{user_id} | ⚠️ Not Started |
| **mapper.tsx** | GET /compass/zones <br> GET /tasks | ⚠️ Not Started |

### Feature → Backend Status

| Feature | Backend API | Frontend UI | Integration |
|---------|-------------|-------------|-------------|
| Gmail OAuth | ✅ Complete | ✅ Complete | ✅ Working |
| Task Capture | ✅ Complete | ❌ Missing | ❌ Not Connected |
| Task Splitting (Epic 7) | ✅ Complete (51/51 tests) | ✅ Component Exists | ⚠️ Needs Mobile Integration |
| Scout Mode | ✅ Complete | ❌ Missing | ❌ Not Connected |
| Hunter Mode | ✅ Complete | ❌ Missing | ❌ Not Connected |
| Micro-step Completion | ✅ Complete | ❌ Missing | ❌ Not Connected |
| XP/Gamification | ✅ Complete | ⚠️ Partial | ⚠️ Partial |

---

## Next Steps: API Integration Priorities

### Week 1: Capture → Scout Flow
1. **Capture/Add Screen** (2 days)
   - Implement text input UI
   - Integrate POST /capture/ API
   - Show TaskBreakdownModal with results
   - Handle clarifications flow
   - Call POST /capture/save when user confirms

2. **Scout Mode** (3 days)
   - Implement GET /tasks API call
   - Build task list UI with filters
   - Add energy/time/zone filters
   - Integrate TaskCard tap → TaskBreakdownModal
   - Swipe right → Navigate to Hunter with task_id

### Week 2: Hunter Mode
1. **Hunter UI** (2 days)
   - Load task with GET /tasks/{id}
   - Display current micro-step (full screen)
   - Implement timer UI
   - Add progress indicator

2. **Swipe Gestures** (2 days)
   - Swipe Up → PATCH /micro-steps/{id}/complete
   - Swipe Down → POST /micro-steps/{id}/decompose
   - Swipe Left → Skip/archive
   - Swipe Right → Delegate

### Week 3: Polish & Features
1. **Today Tab** (2 days)
   - GET /mobile/dashboard/{user_id}
   - Display recommended tasks
   - Show stats and streaks

2. **Gamification** (1 day)
   - GET /gamification/stats/{user_id}
   - Display XP progress
   - Show achievement unlocks

---

**End of API Integration Guide**

For data flow details, see: [DATA_FLOW.md](./DATA_FLOW.md)
For implementation gaps, see: [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)
