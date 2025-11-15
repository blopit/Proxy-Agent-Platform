# E2E Test Report: Multi-Task Flow with Task Splitting

**Test ID**: 3ba92194
**Executed At**: 2025-11-15T23:21:48.498101+00:00
**Duration**: 15.01s
**Status**: ✅ PASSED
**Environment**: local

## Test User

- **User ID**: 8b0ba97a-1ed4-49b8-9ea4-4c37fa6f3767
- **Username**: e2e_multi_task_20251115232148_f1ed06ed
- **Email**: N/A
- **Token**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkI...

## Test Execution

### 1. Sign Up ✅

**Time**: 2025-11-15T23:21:48.846760+00:00
**User Id**: 8b0ba97a-1ed4-49b8-9ea4-4c37fa6f3767

### 2. Onboarding (High ADHD Support) ✅

**Time**: 2025-11-15T23:21:48.853490+00:00
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

**Time**: 2025-11-15T23:21:48.856487+00:00
**Project Id**: 8f6ad3c6-6e7b-47fe-94a6-f4c0d38ed76b
**Name**: Mobile App Development

### 4. Create Multiple Tasks ✅

**Time**: 2025-11-15T23:21:48.872374+00:00
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

### 5. Task 81d8d199 - AI Generation Verified ✅

**Time**: 2025-11-15T23:21:57.401032+00:00
**Generation Method**: ai_llm
**Llm Used**: True
**Ai Provider**: openai
**Micro Steps Count**: 5

### 6. Task 2e2600a5 - AI Generation Verified ✅

**Time**: 2025-11-15T23:22:03.481082+00:00
**Generation Method**: ai_llm
**Llm Used**: True
**Ai Provider**: openai
**Micro Steps Count**: 5

### 7. AI Task Splitting ✅

**Time**: 2025-11-15T23:22:03.481121+00:00
**Complex Tasks Split**: 2
**Split Results**:
```json
[
  {
    "task_id": "81d8d199-b0b9-41cf-ba3c-f654a4dcbc4c",
    "scope": "multi",
    "micro_steps": [
      {
        "step_id": "af02067b-740d-4515-aca3-59d0861f4dc6",
        "step_number": 1,
        "description": "Gather the necessary information for your profile edit, including your new display name, bio, and email.",
        "short_label": "Gather",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcdd"
      },
      {
        "step_id": "7092f3d3-3bb8-4d17-b050-7746635558a7",
        "step_number": 2,
        "description": "Open the profile editing interface and locate the fields for display name and bio. Update them with your gathered information.",
        "short_label": "Edit Info",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcbb"
      },
      {
        "step_id": "5aaf9a6d-f116-458d-be50-9e4e76666b28",
        "step_number": 3,
        "description": "Choose a new profile picture from your device and upload it in the profile editing section.",
        "short_label": "Upload Pic",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcf8"
      },
      {
        "step_id": "3160dd40-5589-4a21-80a1-b9547f11d6da",
        "step_number": 4,
        "description": "Enter your new email address and initiate the verification process by checking your inbox for the verification email.",
        "short_label": "Change Email",
        "estimated_minutes": 5,
        "delegation_mode": "do_with_me",
        "status": "todo",
        "icon": "\ud83d\udce7"
      },
      {
        "step_id": "f303c216-912a-424b-a684-1f61889824b0",
        "step_number": 5,
        "description": "Select your preferred timezone and any additional preferences in the settings section, then save your changes.",
        "short_label": "Update Settings",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\u2699\ufe0f"
      }
    ],
    "next_action": {
      "step_number": 1,
      "description": "Gather the necessary information for your profile edit, including your new display name, bio, and email.",
      "estimated_minutes": 5
    },
    "total_estimated_minutes": 25,
    "metadata": {
      "ai_provider": "openai",
      "llm_used": true,
      "generation_method": "ai_llm"
    }
  },
  {
    "task_id": "2e2600a5-3241-4b80-8ecb-7e58e3f0e5a9",
    "scope": "multi",
    "micro_steps": [
      {
        "step_id": "ace2ae5c-0648-480a-930c-aa18e85e8ade",
        "step_number": 1,
        "description": "Open the user profile settings page.",
        "short_label": "Open Settings",
        "estimated_minutes": 3,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\u2699\ufe0f"
      },
      {
        "step_id": "14dba6b3-ccfa-490c-9640-eb039462bef6",
        "step_number": 2,
        "description": "Update the display name and bio fields.",
        "short_label": "Update Info",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcdd"
      },
      {
        "step_id": "d1a5295f-ca9d-4917-bf5c-445df2be41f3",
        "step_number": 3,
        "description": "Upload a new profile picture from your device.",
        "short_label": "Upload Picture",
        "estimated_minutes": 4,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcf8"
      },
      {
        "step_id": "91240d77-dfdc-42ec-af33-27a14247ca41",
        "step_number": 4,
        "description": "Change the email address and initiate verification process.",
        "short_label": "Change Email",
        "estimated_minutes": 5,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udce7"
      },
      {
        "step_id": "3ae0c632-b430-4f8d-8fbb-7e6ad9e6f206",
        "step_number": 5,
        "description": "Select your preferred timezone and notification preferences.",
        "short_label": "Set Preferences",
        "estimated_minutes": 3,
        "delegation_mode": "do",
        "status": "todo",
        "icon": "\ud83d\udcc5"
      }
    ],
    "next_action": {
      "step_number": 1,
      "description": "Open the user profile settings page.",
      "estimated_minutes": 3
    },
    "total_estimated_minutes": 20,
    "metadata": {
      "ai_provider": "openai",
      "llm_used": true,
      "generation_method": "ai_llm"
    }
  }
]
```
**Note**: Check AI reasoning for task breakdowns in results

### 8. Explorer - View All Tasks ✅

**Time**: 2025-11-15T23:22:03.489248+00:00
**Total Tasks**: N/A
**Organized View**: Tasks retrieved for explorer view

### 9. Focus Session ⚠️

**Time**: 2025-11-15T23:22:03.491528+00:00
**Note**: Focus session endpoint not available

### 10. Complete Micro-Steps ⚠️

**Time**: 2025-11-15T23:22:03.499381+00:00
**Completed Steps Count**: 0
**Note**: No micro-steps to complete

### 11. Morning Ritual ⚠️

**Time**: 2025-11-15T23:22:03.501473+00:00
**Note**: Morning ritual endpoint not available

### 12. Gamification Progression ✅

**Time**: 2025-11-15T23:22:03.506442+00:00
**Xp Earned**: N/A
**Level**: N/A
**Pet Health**: N/A
**Tasks Completed**: 1

## Final State

```json
{
  "user": {
    "user_id": "8b0ba97a-1ed4-49b8-9ea4-4c37fa6f3767",
    "username": "e2e_multi_task_20251115232148_f1ed06ed",
    "email": "e2e_multi_task_20251115232148_f1ed06ed@e2etest.example.com",
    "full_name": "E2E Test User 20251115232148",
    "created_at": "2025-11-15T18:21:48.840777",
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
Generated by E2E Test Suite v1.0 at 2025-11-15T23:22:03.506757+00:00
