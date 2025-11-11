# Next 5 High-Priority Tasks

**Updated**: November 10, 2025
**Source**: [NEXT_TASKS_PRIORITIZED.md](../../../docs/status/NEXT_TASKS_PRIORITIZED.md)

These are the top 5 tasks ready to start after current sprint completes.

---

## 1. BE-01 API Integration (Frontend Wiring)

**Priority**: 🔴 HIGHEST
**Time**: 2 days (16 hours)
**Dependencies**: None (BE-01 backend already complete)
**Mode**: DO

### Overview
Wire the mobile app to the existing Task Templates Service backend. Backend has 489 lines of working code, just needs frontend connection.

### What's Complete
- ✅ Backend service: `/src/services/templates/` (489 lines)
- ✅ API endpoints: `POST /api/v1/templates`, `GET /api/v1/templates`, etc.
- ✅ Database models and repository
- ✅ Tests passing

### What's Needed
- [ ] Add template API calls to `/mobile/src/api/taskApi.ts`
- [ ] Create TemplateContext in `/mobile/src/contexts/`
- [ ] Build basic template selection UI
- [ ] Wire to task creation flow

### Files to Modify
- `/mobile/src/api/taskApi.ts`
- `/mobile/src/contexts/TemplateContext.tsx` (create)
- `/mobile/components/TemplateSelector.tsx` (create)

### Acceptance Criteria
- User can browse templates from backend
- Selecting template creates task with pre-filled fields
- Templates persist in database
- Basic CRUD operations work

### Detailed Spec
**[docs/tasks/backend/01_task_templates_service.md](../../../docs/tasks/backend/01_task_templates_service.md)**

---

## 2. FE-03: Mapper Restructure

**Priority**: 🟡 HIGH
**Time**: 7 hours
**Dependencies**: None
**Mode**: DO_WITH_ME (collaborative)

### Overview
Redesign Mapper tab into 2-tab layout: **MAP** (reflection/review) and **PLAN** (upcoming tasks). Critical UX improvement for ADHD users.

### Current State
- Single "You" tab combines too many functions
- Users confused about purpose
- Profile switcher feels cramped

### Proposed Design
```
Mapper Tab
├─ MAP Subtab (default)
│  ├─ Weekly progress heatmap
│  ├─ Completed tasks summary
│  ├─ Streak visualization
│  └─ Energy patterns chart
└─ PLAN Subtab
   ├─ Upcoming tasks (next 3 days)
   ├─ Scheduled tasks
   ├─ Goal progress
   └─ Weekly planning view
```

### Files to Modify
- `/mobile/app/(tabs)/mapper.tsx`
- `/mobile/components/mapper/MapView.tsx` (create)
- `/mobile/components/mapper/PlanView.tsx` (create)

### Acceptance Criteria
- 2 clear tabs within Mapper
- MAP shows retrospective data
- PLAN shows forward-looking tasks
- Smooth tab switching
- Maintains profile switcher access

### Detailed Spec
**[docs/tasks/frontend/03_mapper_restructure.md](../../../docs/tasks/frontend/03_mapper_restructure.md)**

---

## 3. BE-03: Focus Sessions Service

**Priority**: 🟡 HIGH
**Time**: 4 hours
**Dependencies**: None
**Mode**: DO

### Overview
Backend service for Pomodoro-style focus sessions with session tracking, break management, and productivity metrics.

### Features
- Start/stop Pomodoro sessions (25 min work / 5 min break)
- Track session history
- Calculate focus time metrics
- Integration with task completion

### Database Schema
```sql
CREATE TABLE focus_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INT,
  session_type VARCHAR(20), -- 'pomodoro', 'deep_work', 'quick'
  completed BOOLEAN DEFAULT false
);
```

### API Endpoints
- `POST /api/v1/focus/sessions/start`
- `POST /api/v1/focus/sessions/end`
- `GET /api/v1/focus/sessions/current`
- `GET /api/v1/focus/sessions/history`

### Files to Create
- `/src/services/focus_sessions/service.py`
- `/src/services/focus_sessions/repository.py`
- `/src/services/focus_sessions/models.py`
- `/src/api/routes/focus_sessions.py`

### Pairs With
**FE-07: Focus Timer Component** (frontend UI for this backend)

### Detailed Spec
**[docs/tasks/backend/03_focus_sessions_service.md](../../../docs/tasks/backend/03_focus_sessions_service.md)**

---

## 4. FE-07: Focus Timer Component

**Priority**: 🟡 HIGH
**Time**: 5 hours
**Dependencies**: BE-03 (Focus Sessions Service)
**Mode**: DO

### Overview
Visual Pomodoro timer component with session tracking, break reminders, and focus metrics.

### Design
- Large circular timer display
- Start/Pause/Stop controls
- Session type selector (Pomodoro / Deep Work / Quick)
- Break notifications
- Session history

### Features
- Real-time countdown
- Background timer support
- Haptic feedback at intervals
- Sound/vibration for breaks
- Session statistics

### Files to Create
- `/mobile/components/focus/FocusTimer.tsx`
- `/mobile/components/focus/SessionControls.tsx`
- `/mobile/components/focus/SessionHistory.tsx`

### Integration
- Calls BE-03 API endpoints
- Updates task status when session completes
- Awards XP for completed sessions
- Shows in Today/Hunter modes

### Acceptance Criteria
- Timer counts down accurately
- Works in background
- Notifications appear on breaks
- Integrates with task completion
- Visually appealing and calming

### Detailed Spec
**[docs/tasks/frontend/07_focus_timer.md](../../../docs/tasks/frontend/07_focus_timer.md)**

---

## 5. FE-04: Task Template Library

**Priority**: 🟢 MEDIUM
**Time**: 5 hours
**Dependencies**: BE-01 API Integration (Task #1 above)
**Mode**: DO

### Overview
UI for browsing, selecting, and creating task templates. Makes BE-01 backend functionality accessible to users.

### Features
- Browse template categories
- Search templates
- Preview template details
- One-tap task creation from template
- Create custom templates
- Share templates (future)

### Design
```
Template Library Screen
├─ Search bar
├─ Category tabs (Work, Personal, ADHD, Custom)
├─ Template grid/list
│  └─ Template Card
│     ├─ Icon
│     ├─ Name
│     ├─ Description
│     ├─ Time estimate
│     └─ "Use Template" button
└─ "Create Template" FAB
```

### Files to Create
- `/mobile/components/templates/TemplateLibrary.tsx`
- `/mobile/components/templates/TemplateCard.tsx`
- `/mobile/components/templates/TemplateDetail.tsx`
- `/mobile/components/templates/CreateTemplate.tsx`

### Integration
- Uses Task #1 API integration
- Accessible from Capture/Scout modes
- Creates tasks via existing task creation flow

### Acceptance Criteria
- Can browse all templates
- Search works
- Template creates task correctly
- Custom templates can be created
- UI is fast and responsive

### Detailed Spec
**[docs/tasks/frontend/04_task_template_library.md](../../../docs/tasks/frontend/04_task_template_library.md)**

---

## Task Sequencing Recommendation

### Week 1 (After Current Sprint)
- **BE-15**: Integration Tests (10h) - Quality foundation
- **BE-01**: API Integration (16h) - Unlocks FE-04

### Week 2
- **FE-03**: Mapper Restructure (7h) - UX improvement
- **BE-03**: Focus Sessions (4h) - Backend for FE-07
- **FE-07**: Focus Timer (5h) - Complete focus feature

### Week 3
- **FE-04**: Template Library (5h) - Complete templates feature
- Dogfooding and user testing
- Bug fixes and polish

---

## Dependencies Visualization

```
Current Sprint (Week 1)
└─ Epic 7 Frontend Integration ✅

Week 2
├─ BE-01 API Integration (No deps) ⏳
│  └─ FE-04 Template Library (Depends on BE-01) ⏳
│
└─ FE-03 Mapper Restructure (No deps) ⏳

Week 3
├─ BE-03 Focus Sessions (No deps) ⏳
└─ FE-07 Focus Timer (Depends on BE-03) ⏳
```

---

## Reference

**Full Task Specs**:
- Backend: [docs/tasks/backend/](../../../docs/tasks/backend/)
- Frontend: [docs/tasks/frontend/](../../../docs/tasks/frontend/)

**Status Tracking**:
- [NEXT_TASKS_PRIORITIZED.md](../../../docs/status/NEXT_TASKS_PRIORITIZED.md)
- [CURRENT_STATUS_AND_NEXT_STEPS.md](../../../docs/status/CURRENT_STATUS_AND_NEXT_STEPS.md)

---

**Last Updated**: November 10, 2025
**Next Review**: After current sprint (Nov 15, 2025)
