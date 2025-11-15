# E2E Test Report: Multi-Task Flow with Task Splitting

**Test ID**: 3d3408e3
**Executed At**: 2025-11-15T23:04:34.400426+00:00
**Duration**: 12.83s
**Status**: ✅ PASSED
**Environment**: local

## Test User

- **User ID**: 1b9bfdb6-04b2-4810-85a3-9e680dab76a0
- **Username**: e2e_multi_task_20251115230434_1d0665d1
- **Email**: N/A
- **Token**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkI...

## Test Execution

### 1. Sign Up ✅

**Time**: 2025-11-15T23:04:34.752285+00:00
**User Id**: 1b9bfdb6-04b2-4810-85a3-9e680dab76a0

### 2. Onboarding (High ADHD Support) ✅

**Time**: 2025-11-15T23:04:34.758577+00:00
**Adhd Support Level**: 9
**Challenges**:
```json
[
  "time_blindness",
  "focus",
  "organization"
]
```

### 3. Create Complex Project ✅

**Time**: 2025-11-15T23:04:34.761740+00:00
**Project Id**: 0ddd8391-bd8d-4199-b3ec-d7147a2aded6
**Name**: Mobile App Development

### 4. Create Multiple Tasks ✅

**Time**: 2025-11-15T23:04:34.780991+00:00
**Total Tasks**: 5
**Simple Tasks**: 3
**Complex Tasks**: 2
**Task Titles**:
```json
[
  "Simple task 1: Code review",
  "Simple task 2: Code review",
  "Simple task 3: Code review",
  "Implement user profile editing with photo upload",
  "Add email notification preferences settings"
]
```

### 5. AI Task Splitting ✅

**Time**: 2025-11-15T23:04:47.191128+00:00
**Complex Tasks Split**: 2
**Split Results**:
```json
[
  {
    "task_id": "9e498193-bccf-47e5-adfe-c21c3534d654",
    "scope": "multi",
    "micro_steps": [
      {
        "step_id": "5a99dd7a-0ed0-473d-986c-2dd7d8f10e68",
        "step_number": 1,
        "description": "Open the user profile editing page.",
        "short_label": "Open",
        "estimated_minutes": 2,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcc1"
      },
      {
        "step_id": "1410eac6-d769-4ac0-95f9-3ec215c8d068",
        "step_number": 2,
        "description": "Update the display name and bio fields.",
        "short_label": "Edit Info",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcdd"
      },
      {
        "step_id": "2f07c3e3-a98f-420d-97f7-be22234455f7",
        "step_number": 3,
        "description": "Upload a new profile picture from your device.",
        "short_label": "Upload Photo",
        "estimated_minutes": 4,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcf8"
      },
      {
        "step_id": "649bcf65-9568-4faa-9d13-640c15706f4b",
        "step_number": 4,
        "description": "Change the email address and initiate the verification process.",
        "short_label": "Change Email",
        "estimated_minutes": 5,
        "delegation_mode": "do_with_me",
        "status": "todo",
        "icon": "\ud83d\udce7"
      },
      {
        "step_id": "06d58ebc-68d8-4dff-8a85-56d4d5d547b8",
        "step_number": 5,
        "description": "Update your timezone and preferences settings.",
        "short_label": "Set Preferences",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udee0\ufe0f"
      }
    ],
    "next_action": {
      "step_number": 1,
      "description": "Open the user profile editing page.",
      "estimated_minutes": 2
    },
    "total_estimated_minutes": 21
  },
  {
    "task_id": "f692280d-334a-4a54-9d3d-fc4df1b32487",
    "scope": "multi",
    "micro_steps": [
      {
        "step_id": "274dd32f-8c97-4f14-8730-24ef3600c0f7",
        "step_number": 1,
        "description": "Open user profile settings page",
        "short_label": "Open",
        "estimated_minutes": 2,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcc1"
      },
      {
        "step_id": "d24e9241-a3a7-4d4a-bbee-de544c705f30",
        "step_number": 2,
        "description": "Update display name and bio fields",
        "short_label": "Update Info",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcdd"
      },
      {
        "step_id": "5ffeef0b-84ea-47f4-8b22-c4c9610438d3",
        "step_number": 3,
        "description": "Upload a new profile picture",
        "short_label": "Upload Photo",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83c\udfa8"
      },
      {
        "step_id": "9b9b225e-9bf0-465d-968a-2b2f808d2015",
        "step_number": 4,
        "description": "Change email and initiate verification process",
        "short_label": "Change Email",
        "estimated_minutes": 5,
        "delegation_mode": "do_with_me",
        "status": "todo",
        "icon": "\ud83d\udce7"
      },
      {
        "step_id": "d8172840-dd10-4694-b239-5c3857694303",
        "step_number": 5,
        "description": "Update timezone and notification preferences",
        "short_label": "Set Preferences",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\u2699\ufe0f"
      }
    ],
    "next_action": {
      "step_number": 1,
      "description": "Open user profile settings page",
      "estimated_minutes": 2
    },
    "total_estimated_minutes": 22
  }
]
```
**Note**: Check AI reasoning for task breakdowns in results

### 6. Explorer - View All Tasks ✅

**Time**: 2025-11-15T23:04:47.203671+00:00
**Total Tasks**: N/A
**Organized View**: Tasks retrieved for explorer view

### 7. Focus Session ⚠️

**Time**: 2025-11-15T23:04:47.207348+00:00
**Note**: Focus session endpoint not available

### 8. Complete Micro-Steps ⚠️

**Time**: 2025-11-15T23:04:47.219217+00:00
**Completed Steps Count**: 0
**Note**: No micro-steps to complete

### 9. Morning Ritual ⚠️

**Time**: 2025-11-15T23:04:47.221339+00:00
**Note**: Morning ritual endpoint not available

### 10. Gamification Progression ✅

**Time**: 2025-11-15T23:04:47.226745+00:00
**Xp Earned**: N/A
**Level**: N/A
**Pet Health**: N/A
**Tasks Completed**: 1

## Final State

```json
{
  "user": {
    "user_id": "1b9bfdb6-04b2-4810-85a3-9e680dab76a0",
    "username": "e2e_multi_task_20251115230434_1d0665d1",
    "email": "e2e_multi_task_20251115230434_1d0665d1@e2etest.example.com",
    "full_name": "E2E Test User 20251115230434",
    "created_at": "2025-11-15T18:04:34.748543",
    "is_active": true
  },
  "tasks": {
    "total_created": 5,
    "complex_split": 2,
    "micro_steps_completed": 0
  },
  "pet": {}
}
```

## Human Verification Checklist

- [ ] User was created successfully
- [ ] All API calls returned expected status codes
- [ ] Data consistency maintained throughout workflow
- [ ] AI-generated content makes sense
- [ ] No unexpected errors in execution
- [ ] Gamification logic worked correctly
- [ ] Database state is consistent

---
Generated by E2E Test Suite v1.0 at 2025-11-15T23:04:47.227050+00:00
