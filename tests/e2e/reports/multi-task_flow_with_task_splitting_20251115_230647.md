# E2E Test Report: Multi-Task Flow with Task Splitting

**Test ID**: a718bf80
**Executed At**: 2025-11-15T23:06:29.957536+00:00
**Duration**: 17.24s
**Status**: ✅ PASSED
**Environment**: local

## Test User

- **User ID**: f0dac2cf-870b-4271-bcff-6f03848d1ca4
- **Username**: e2e_multi_task_20251115230629_164be9d3
- **Email**: N/A
- **Token**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkI...

## Test Execution

### 1. Sign Up ✅

**Time**: 2025-11-15T23:06:30.255334+00:00
**User Id**: f0dac2cf-870b-4271-bcff-6f03848d1ca4

### 2. Onboarding (High ADHD Support) ✅

**Time**: 2025-11-15T23:06:30.262972+00:00
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

**Time**: 2025-11-15T23:06:30.267075+00:00
**Project Id**: 91aab808-8ab6-4ee7-bbb3-fcb5874a34a5
**Name**: Mobile App Development

### 4. Create Multiple Tasks ✅

**Time**: 2025-11-15T23:06:30.285378+00:00
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

**Time**: 2025-11-15T23:06:47.160490+00:00
**Complex Tasks Split**: 2
**Split Results**:
```json
[
  {
    "task_id": "2946e8bf-41b1-4aec-a591-4bf31891d58a",
    "scope": "multi",
    "micro_steps": [
      {
        "step_id": "8d3ff77a-cd6f-470c-9fc4-3d9f3f2601e0",
        "step_number": 1,
        "description": "Open the user profile editing page.",
        "short_label": "Open Page",
        "estimated_minutes": 2,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcd6"
      },
      {
        "step_id": "1c16d9e9-ea0b-409a-93ad-a1ac937f9595",
        "step_number": 2,
        "description": "Update display name and bio fields.",
        "short_label": "Edit Info",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcdd"
      },
      {
        "step_id": "04760a84-8766-40f1-9587-393cddea4293",
        "step_number": 3,
        "description": "Select and upload a new profile picture.",
        "short_label": "Upload Photo",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83c\udfa8"
      },
      {
        "step_id": "19647e7e-7ed9-4688-8156-303440e8d391",
        "step_number": 4,
        "description": "Change email address and initiate verification process.",
        "short_label": "Change Email",
        "estimated_minutes": 5,
        "delegation_mode": "do_with_me",
        "status": "todo",
        "icon": "\ud83d\udce7"
      },
      {
        "step_id": "68cf01c3-89a3-4761-afc7-da0a2fcd2934",
        "step_number": 5,
        "description": "Update timezone and personal preferences.",
        "short_label": "Set Preferences",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\u2699\ufe0f"
      }
    ],
    "next_action": {
      "step_number": 1,
      "description": "Open the user profile editing page.",
      "estimated_minutes": 2
    },
    "total_estimated_minutes": 22
  },
  {
    "task_id": "60986067-5308-4f12-a14a-f39345c4c25b",
    "scope": "multi",
    "micro_steps": [
      {
        "step_id": "61f9b0d7-1592-4848-a033-955755122b7c",
        "step_number": 1,
        "description": "Upload a profile picture from your device.",
        "short_label": "Upload",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83c\udfa8"
      },
      {
        "step_id": "05c23ecc-6e5e-4285-8aa7-a23732ca86ee",
        "step_number": 2,
        "description": "Update your display name and bio in the profile settings.",
        "short_label": "Edit Name",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcdd"
      },
      {
        "step_id": "03bfad6b-d74e-4bc8-a004-e5dd603fbd3f",
        "step_number": 3,
        "description": "Change your email address and request a verification email.",
        "short_label": "Change Email",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udce7"
      },
      {
        "step_id": "30f5dc8b-df24-4a3c-8a1f-75c3c03ffdbb",
        "step_number": 4,
        "description": "Check your email for verification link and confirm the new email.",
        "short_label": "Verify Email",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcec"
      },
      {
        "step_id": "4c149e10-0750-4b51-ab06-da057027eb11",
        "step_number": 5,
        "description": "Update your timezone and notification preferences in the settings.",
        "short_label": "Set Preferences",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\u2699\ufe0f"
      }
    ],
    "next_action": {
      "step_number": 1,
      "description": "Upload a profile picture from your device.",
      "estimated_minutes": 5
    },
    "total_estimated_minutes": 25
  }
]
```
**Note**: Check AI reasoning for task breakdowns in results

### 6. Explorer - View All Tasks ✅

**Time**: 2025-11-15T23:06:47.172090+00:00
**Total Tasks**: N/A
**Organized View**: Tasks retrieved for explorer view

### 7. Focus Session ⚠️

**Time**: 2025-11-15T23:06:47.175554+00:00
**Note**: Focus session endpoint not available

### 8. Complete Micro-Steps ⚠️

**Time**: 2025-11-15T23:06:47.187091+00:00
**Completed Steps Count**: 0
**Note**: No micro-steps to complete

### 9. Morning Ritual ⚠️

**Time**: 2025-11-15T23:06:47.189237+00:00
**Note**: Morning ritual endpoint not available

### 10. Gamification Progression ✅

**Time**: 2025-11-15T23:06:47.194066+00:00
**Xp Earned**: N/A
**Level**: N/A
**Pet Health**: N/A
**Tasks Completed**: 1

## Final State

```json
{
  "user": {
    "user_id": "f0dac2cf-870b-4271-bcff-6f03848d1ca4",
    "username": "e2e_multi_task_20251115230629_164be9d3",
    "email": "e2e_multi_task_20251115230629_164be9d3@e2etest.example.com",
    "full_name": "E2E Test User 20251115230629",
    "created_at": "2025-11-15T18:06:30.253504",
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
Generated by E2E Test Suite v1.0 at 2025-11-15T23:06:47.194335+00:00
