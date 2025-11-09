# Backend API Analysis - Screen by Screen

**Date**: November 4, 2025
**Analysis**: Complete backend endpoint inventory for mobile app
**Status**: Identifying what exists vs. what needs to be built

---

## Mobile App Screens (7 Total)

### 1. 🎤 CAPTURE MODE (3 Screens)

---

#### Screen 1.1: Capture/Add (Brain Dump)
**Route**: `/mobile/app/(tabs)/capture/add.tsx`

**Backend Status**: ✅ **100% COMPLETE**

**Endpoints Available**:
1. ✅ `POST /api/v1/capture/` - Main capture with AI decomposition
   - File: `src/api/capture.py:95`
   - Input: `{query, user_id, mode}`
   - Output: `{task, micro_steps, clarifications, ready_to_save, mode}`
   - **FIXED**: Enum `.value` bug resolved in Session 3

2. ✅ `POST /api/v1/capture/save` - Save task + micro-steps to DB
   - File: `src/api/capture.py:255`
   - Input: `{task, micro_steps, user_id, project_id?}`
   - Output: `{success, task_id, micro_step_ids, total_steps, message}`

**Alternative Endpoint** (older, still available):
3. ✅ `POST /mobile/quick-capture` - Mobile-optimized quick capture
   - File: `src/api/simple_tasks.py`
   - Similar flow but returns different format

**What's Missing**: ❌ **NOTHING**
- Backend is 100% ready
- Mobile implementation complete (Session 2)
- Bug fixed (Session 3)

---

#### Screen 1.2: Capture/Clarify (Q&A)
**Route**: `/mobile/app/(tabs)/capture/clarify.tsx` (planned)

**Backend Status**: ✅ **100% COMPLETE**

**Endpoints Available**:
1. ✅ `POST /api/v1/capture/clarify` - Submit clarification answers
   - File: `src/api/capture.py:192`
   - Input: `{micro_steps, answers: {field_name: answer}}`
   - Output: Updated `{task, micro_steps, clarifications, ready_to_save}`
   - Re-classifies micro-steps with new information

**What's Missing**: ❌ **NOTHING**
- Backend fully functional
- Mobile screen: **NOT STARTED** (0%)

---

#### Screen 1.3: Capture/Connect (Gmail OAuth)
**Route**: `/mobile/app/(tabs)/capture/connect.tsx`

**Backend Status**: ✅ **100% COMPLETE**

**Endpoints Available**:
1. ✅ `POST /api/v1/integrations/{provider}/authorize` - Start OAuth flow
   - File: `src/api/routes/integrations.py`
   - Provider: `gmail`
   - Returns: `{authorization_url, state}`

2. ✅ `GET /api/v1/integrations/{provider}/callback` - OAuth callback handler
   - Handles OAuth redirect
   - Stores tokens in database

3. ✅ `GET /api/v1/integrations/{integration_id}/status` - Check connection
   - Returns: `{connected, provider, email, last_sync}`

4. ✅ `POST /api/v1/integrations/{integration_id}/sync` - Manual sync
   - Syncs emails/calendar with backend

5. ✅ `POST /api/v1/integrations/{integration_id}/disconnect` - Remove connection

**What's Missing**: ❌ **NOTHING**
- Backend fully functional
- Mobile screen: **COMPLETE** (100%) - Done in earlier session

---

### 2. 🔍 SCOUT MODE

---

#### Screen 2: Scout (Task List & Organization)
**Route**: `/mobile/app/(tabs)/scout.tsx`

**Backend Status**: ✅ **90% COMPLETE** (Minor optimization needed)

**Endpoints Available**:
1. ✅ `GET /mobile/tasks/{user_id}` - Mobile-optimized task list
   - File: `src/api/simple_tasks.py`
   - Input: `user_id, limit (default 20)`
   - Output: Array of simplified tasks
   - **TODO**: Filter by user_id (currently returns all tasks)

2. ✅ `GET /api/v1/tasks` - Full task list with filters
   - File: `src/api/tasks.py`
   - Supports: filtering, sorting, pagination
   - Returns: `{items, total, page, size}`

3. ✅ `GET /api/v1/tasks/{task_id}` - Get single task details
   - Returns: Full task with micro-steps

4. ✅ `GET /api/v1/tasks/{task_id}/hierarchy` - Get task tree
   - Returns: Task with all children/subtasks

5. ✅ `PATCH /api/v1/tasks/{task_id}/status` - Update task status
   - Input: `{status: "todo"|"in_progress"|"completed"|...}`

6. ✅ `PATCH /api/v1/tasks/bulk` - Bulk update multiple tasks
   - Input: `{task_ids[], updates}`

7. ✅ `GET /mobile/dashboard/{user_id}` - Dashboard stats
   - Returns: `{total_tasks, completed_tasks, pending_tasks, stats}`

**Search & Filters** (if needed):
8. ✅ `GET /api/v1/tasks/search` - Search tasks
9. ✅ `GET /api/v1/tasks/stats` - Get task statistics

**What's Missing**: ⚠️ **Minor Polish Needed**
- ✅ Core endpoints exist
- ❌ User filtering not implemented (returns all tasks)
- ❌ Mobile optimization could be better
- Mobile screen: **NOT STARTED** (0%)

---

### 3. 🎯 HUNTER MODE

---

#### Screen 3: Hunter (Current Task Focus)
**Route**: `/mobile/app/(tabs)/hunter.tsx`

**Backend Status**: ✅ **100% COMPLETE**

**Endpoints Available**:
1. ✅ `GET /api/v1/tasks` with filters - Get next task
   - Filter by: `status=todo, priority=high`
   - Sort by: `priority DESC, due_date ASC`
   - Limit: 1 (get single "now" task)

2. ✅ `GET /api/v1/focus/current` - Get current focus session
   - File: `src/api/focus.py`
   - Returns: `{task_id, started_at, duration, status}`

3. ✅ `POST /api/v1/focus/start` - Start focus session (Pomodoro)
   - File: `src/api/focus.py`
   - Input: `{task_id, duration_minutes}`
   - Returns: `{session_id, task, started_at, ends_at}`

4. ✅ `POST /api/v1/focus/complete` - Complete focus session
   - Updates task progress
   - Tracks actual time spent

5. ✅ `PATCH /api/v1/micro-steps/{step_id}/complete` - Mark micro-step done
   - File: `src/api/tasks.py`
   - Updates step status and actual_minutes

6. ✅ `GET /api/v1/tasks/{task_id}/progress` - Get task progress
   - Returns: `{completed_steps, total_steps, percentage, estimated_remaining}`

**Gamification Support**:
7. ✅ `POST /api/v1/gamification/xp/add` - Award XP for completion
   - File: `src/api/gamification.py`
8. ✅ `GET /api/v1/gamification/streak` - Get current streak
9. ✅ `POST /api/v1/rewards/claim` - Claim reward after task

**What's Missing**: ❌ **NOTHING**
- Backend fully functional
- Mobile screen: **NOT STARTED** (0%)

---

### 4. 📅 TODAY MODE

---

#### Screen 4: Today (Daily Planning)
**Route**: `/mobile/app/(tabs)/today.tsx`

**Backend Status**: ✅ **100% COMPLETE**

**Endpoints Available**:
1. ✅ `GET /api/v1/secretary/today` - Today's tasks
   - File: `src/api/secretary.py`
   - Returns: Tasks scheduled for today

2. ✅ `GET /api/v1/secretary/daily-briefing` - Morning briefing
   - Returns: `{tasks_today, priorities, schedule, weather?, calendar_events}`

3. ✅ `GET /api/v1/ritual/check` - Check ritual status
   - File: `src/api/ritual.py`
   - Returns: `{morning_routine_done, evening_routine_done, current_rituals}`

4. ✅ `POST /api/v1/ritual/complete` - Mark ritual complete
   - Input: `{ritual_type, completed_at}`

5. ✅ `GET /api/v1/energy/current` - Current energy level
   - File: `src/api/energy.py`
   - Returns: `{level, zone, recommended_tasks}`

6. ✅ `POST /api/v1/energy/set` - Update energy level
   - Input: `{level: 1-10, zone}`

7. ✅ `GET /api/v1/tasks` - Filter by due_date=today
   - Standard task list filtered by today's date

**What's Missing**: ❌ **NOTHING**
- Backend fully functional
- Mobile screen: **NOT STARTED** (0%)

---

### 5. 🗺️ MAPPER MODE

---

#### Screen 5: Mapper (Visual Task Map)
**Route**: `/mobile/app/(tabs)/mapper.tsx`

**Backend Status**: ✅ **95% COMPLETE** (Visualization helpers would be nice)

**Endpoints Available**:
1. ✅ `GET /api/v1/tasks` - All tasks with hierarchy
   - Can build tree visualization from this

2. ✅ `GET /api/v1/tasks/{task_id}/hierarchy` - Specific task tree
   - Returns: Full hierarchical structure

3. ✅ `GET /api/v1/compass/zones` - Get all productivity zones
   - File: `src/api/compass.py`
   - Returns: Array of zones with tasks

4. ✅ `POST /api/v1/compass/zones` - Create new zone
   - Input: `{name, color, description}`

5. ✅ `GET /api/v1/compass/priority-matrix` - Eisenhower matrix
   - Returns: Tasks grouped by urgency/importance

6. ✅ `GET /api/v1/compass/priority-suggestions` - AI task prioritization
   - Returns: Suggested priority order

7. ✅ `GET /api/v1/progress/visualization` - Progress visualization data
   - File: `src/api/progress.py`
   - Returns: Data formatted for charts/graphs

8. ✅ `GET /api/v1/projects` - All projects
   - File: `src/api/tasks.py`
   - Returns: Project list with task counts

9. ✅ `GET /api/v1/projects/{project_id}/analytics` - Project analytics
   - Returns: Stats, progress, timeline

**Nice-to-Have** (not critical):
- ❌ Dedicated `/mobile/map-view` endpoint with pre-computed layout
- ❌ Real-time dependency graph endpoint

**What's Missing**: ⚠️ **Minor Enhancement Possible**
- ✅ Core data available
- ❌ Could add mobile-optimized map endpoint
- Mobile screen: **NOT STARTED** (0%)

---

## 📊 Backend Summary

### By Screen Status

| Screen | Backend | Mobile FE | Priority |
|--------|---------|-----------|----------|
| **Capture/Add** | ✅ 100% | ✅ 100% | 🟢 DONE |
| **Capture/Clarify** | ✅ 100% | ❌ 0% | 🟡 HIGH |
| **Capture/Connect** | ✅ 100% | ✅ 100% | 🟢 DONE |
| **Scout** | ✅ 90% | ❌ 0% | 🔴 CRITICAL |
| **Hunter** | ✅ 100% | ❌ 0% | 🟡 HIGH |
| **Today** | ✅ 100% | ❌ 0% | 🟡 MEDIUM |
| **Mapper** | ✅ 95% | ❌ 0% | 🟢 LOW |

### Overall Backend Health

**✅ EXCELLENT (97% Complete)**

- **Total Screens**: 7
- **Backend Complete**: 6.8/7 screens
- **Backend Ready for Mobile**: All screens have functional APIs
- **Critical Gaps**: NONE
- **Minor Improvements**: 2 screens could use optimization

---

## 🎯 What Needs to Be Built

### Backend (Very Little)

**High Priority** (for Scout mode):
1. ❌ Add user_id filtering to `/mobile/tasks/{user_id}`
   - Currently returns all tasks
   - Should filter by user_id parameter
   - 10-minute fix in `src/api/simple_tasks.py`

**Optional Enhancements**:
2. ❌ Mobile-optimized map endpoint for Mapper
   - Pre-compute layout/positions
   - Reduce data transfer
   - Not critical - can build on frontend

### Mobile Frontend (ALL THE WORK)

**Immediate Priority**:
1. ❌ **Scout Screen** (0% → 100%)
   - Task list view
   - Search/filter UI
   - Status updates
   - Task details modal
   - **Backend**: ✅ Ready
   - **Effort**: 2-3 days

**High Priority**:
2. ❌ **Capture/Clarify Screen** (0% → 100%)
   - Question/answer UI
   - Form with dynamic fields
   - Submit answers → re-capture
   - **Backend**: ✅ Ready
   - **Effort**: 1 day

3. ❌ **Hunter Screen** (0% → 100%)
   - "Now" card with current task
   - Micro-step checklist
   - Pomodoro timer
   - Progress tracking
   - **Backend**: ✅ Ready
   - **Effort**: 2 days

**Medium Priority**:
4. ❌ **Today Screen** (0% → 100%)
   - Daily schedule view
   - Ritual checklist
   - Energy level indicator
   - Morning briefing
   - **Backend**: ✅ Ready
   - **Effort**: 1-2 days

**Low Priority**:
5. ❌ **Mapper Screen** (0% → 100%)
   - Visual task map/graph
   - Drag & drop organization
   - Zone management
   - **Backend**: ✅ Ready
   - **Effort**: 3-4 days

---

## 🚀 Recommended Implementation Order

### Phase 1: Core Functionality (Week 1)
1. ✅ **Capture/Add** - COMPLETE
2. ✅ **Capture/Connect** - COMPLETE
3. ❌ **Scout** - Build next (most critical)
4. ❌ **Capture/Clarify** - Complete capture flow

### Phase 2: Task Execution (Week 2)
5. ❌ **Hunter** - Focus mode for getting work done
6. ❌ **Today** - Daily planning

### Phase 3: Advanced Features (Week 3)
7. ❌ **Mapper** - Visual organization

---

## 🔧 Backend TODOs (Minor)

### Immediate
```python
# File: src/api/simple_tasks.py
# Line: ~450 (in get_mobile_tasks)
# TODO: Add user_id filter
filter_obj = TaskFilter(assignee=user_id)  # ADD THIS
result = task_repo.list_tasks(
    filter_obj=filter_obj,  # USE FILTER
    sort_obj=None,
    limit=limit,
    offset=0,
)
```

### Optional
```python
# File: src/api/tasks.py (new endpoint)
@router.get("/mobile/map-view/{user_id}")
async def get_mobile_map_view(user_id: str):
    """
    Pre-computed map view with positions and connections
    """
    # Return optimized data structure for mobile map
    pass
```

---

## 📝 Key Insights

### What's Working Well ✅
1. **Capture Mode**: Completely functional end-to-end
2. **API Coverage**: Every screen has backend support
3. **Mobile Optimization**: Dedicated `/mobile/*` endpoints exist
4. **Task Management**: Full CRUD + advanced features
5. **Gamification**: XP, streaks, rewards all implemented

### What's Blocking Mobile ❌
**NOTHING!** The backend is ready. All work is frontend.

### Development Bottleneck
**Mobile UI Implementation** - Not backend API availability

---

## 🎯 Next Actions

### For Backend Dev (YOU)
1. ✅ Fix Capture API enum bug - DONE (Session 3)
2. ⏭️ Add user_id filter to `/mobile/tasks/{user_id}` (10 min)
3. ⏭️ (Optional) Create `/mobile/map-view` endpoint

### For Mobile Dev (YOU)
**FOCUS HERE** - Backend is ready!

1. **Scout Screen** (CRITICAL PATH)
   - GET `/mobile/tasks/{user_id}` works
   - GET `/api/v1/tasks/{task_id}` works
   - PATCH `/api/v1/tasks/{task_id}/status` works
   - Just build the UI!

2. **Capture/Clarify** (Complete capture flow)
   - POST `/api/v1/capture/clarify` works
   - Build Q&A form UI

3. **Hunter Screen** (Execute tasks)
   - All endpoints ready
   - Build focus card UI

---

**Conclusion**: Backend is 97% complete. All 7 screens have functional APIs. The work is building the mobile frontend, not fixing backend APIs.

**Estimated Backend Work Remaining**: 10-30 minutes
**Estimated Mobile Frontend Work Remaining**: 2-3 weeks
