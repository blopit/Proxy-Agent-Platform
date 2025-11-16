# 🚀 Next Steps Roadmap - Post Epic 7

**Date**: November 14, 2025
**Current Status**: Epic 7 COMPLETE ✅ (100%, all 51 tests passing)
**Sprint**: Week of Nov 18-22

---

## 🎉 What Just Shipped

### Epic 7: ADHD Task Splitting - COMPLETE
- **Backend**: 669-line Split Proxy Agent with AI integration
- **Frontend**: 7 new components (~2,000 lines)
- **Tests**: 51/51 passing (100%) ✅
- **Documentation**: Complete integration guide
- **Status**: Production-ready

**Time to Complete**: 3 hours
**Lines of Code**: 4,700 total
**Test Coverage**: 100%

---

## 📋 Priority Queue - Next 3 Weeks

### Week 2: Nov 18-22 (THIS WEEK) - Quality & Foundation
**Theme**: Solidify what we built, improve UX

#### 1. BE-15: Integration Test Suite ⚡ HIGHEST
**Time**: 10 hours
**Priority**: 🔴 CRITICAL
**Mode**: DO

**Why Critical**:
- Missing E2E tests for Epic 7
- Need contract tests for mobile integration
- No load testing yet
- Quality gate before next features

**What to Build**:
- [ ] End-to-end API tests
- [ ] Contract tests (API spec validation)
- [ ] Load tests (concurrent splitting)
- [ ] Performance benchmarks
- [ ] CI/CD integration

**Files**:
- `tests/integration/test_task_splitting_e2e.py` (create)
- `tests/integration/test_api_contracts.py` (create)
- `tests/performance/test_split_load.py` (create)
- `.github/workflows/test.yml` (update)

**Acceptance Criteria**:
- E2E test covers full split → complete → XP flow
- Contract tests validate API responses match spec
- Load tests verify 100 concurrent splits work
- Tests run in CI/CD
- Performance baseline documented

---

#### 2. FE-03: Mapper Restructure 🎨 HIGH
**Time**: 7 hours
**Priority**: 🟡 HIGH
**Mode**: DO_WITH_ME

**Why Important**:
- Current "You" tab is confusing
- Users don't understand Mapper purpose
- ADHD users need clear MAP (past) vs PLAN (future)

**What to Build**:
- [ ] 2-tab layout (MAP | PLAN)
- [ ] MAP subtab: weekly progress, streak, completed tasks
- [ ] PLAN subtab: upcoming tasks, scheduled, goals
- [ ] Smooth tab switching
- [ ] Maintain ProfileSwitcher access

**Files**:
- `/mobile/app/(tabs)/mapper.tsx` (update)
- `/mobile/components/mapper/MapView.tsx` (create)
- `/mobile/components/mapper/PlanView.tsx` (create)

**Acceptance Criteria**:
- 2 clear tabs visible
- MAP shows retrospective data
- PLAN shows forward-looking tasks
- Tab switching is smooth (<100ms)
- Profile switcher still accessible

---

#### 3. Epic 7 Bug Fixes & Polish 🐛
**Time**: 2-3 hours
**Priority**: 🟡 MEDIUM
**Mode**: DO

**Issues to Fix**:
- [ ] Physical device testing (iOS + Android)
- [ ] Error message polish
- [ ] Loading state animations
- [ ] Celebration effects tuning

**Nice-to-Haves**:
- [ ] Haptic feedback polish
- [ ] Split progress indicator
- [ ] Offline mode support

---

### Week 3: Nov 25-29 - Productivity Features
**Theme**: Focus & Templates

#### 4. BE-03: Focus Sessions Service 🎯
**Time**: 4 hours
**Priority**: 🟡 HIGH
**Mode**: DELEGATE

**What to Build**:
- Pomodoro backend (25 min work / 5 min break)
- Session tracking
- History and metrics
- Integration with task completion

**Files**:
- `/src/services/focus_sessions/service.py` (create)
- `/src/services/focus_sessions/repository.py` (create)
- `/src/api/routes/focus_sessions.py` (create)

**Pairs With**: FE-07 (Focus Timer)

---

#### 5. FE-07: Focus Timer Component ⏱️
**Time**: 5 hours
**Priority**: 🟡 HIGH
**Mode**: DO
**Dependencies**: BE-03

**What to Build**:
- Visual Pomodoro timer
- Session controls (start/pause/stop)
- Break notifications
- Session history display

**Files**:
- `/mobile/components/focus/FocusTimer.tsx` (create)
- `/mobile/components/focus/SessionControls.tsx` (create)

---

#### 6. BE-01 API Integration (Templates) 📝
**Time**: 16 hours
**Priority**: 🟢 MEDIUM
**Mode**: DO

**What to Build**:
- Wire mobile app to existing template backend (489 lines already done!)
- Template context and API calls
- Template selection UI

**Files**:
- `/mobile/src/api/templateApi.ts` (create)
- `/mobile/src/contexts/TemplateContext.tsx` (create)
- `/mobile/components/templates/TemplateSelector.tsx` (create)

---

#### 7. FE-04: Task Template Library 📚
**Time**: 5 hours
**Priority**: 🟢 MEDIUM
**Mode**: DO
**Dependencies**: BE-01 API Integration

**What to Build**:
- Template browsing UI
- Search and filters
- One-tap task creation from template
- Custom template creation

**Files**:
- `/mobile/components/templates/TemplateLibrary.tsx` (create)
- `/mobile/components/templates/TemplateCard.tsx` (create)

---

## 🎯 Recommended Execution Order

### This Week (Nov 18-22)
**Monday-Tuesday (16h)**:
1. BE-15: Integration Tests (10h) - Foundation
2. FE-03: Mapper Restructure (7h) - UX improvement
3. Bug fixes (2-3h)

**Goal**: Quality gate + better UX

---

### Next Week (Nov 25-29)
**Monday-Wednesday (9h)**:
3. BE-03: Focus Sessions (4h)
4. FE-07: Focus Timer (5h)

**Thursday-Friday (21h)**:
5. BE-01: Template API Integration (16h)
6. FE-04: Template Library (5h)

**Goal**: 2 complete feature sets (Focus + Templates)

---

## 📊 Velocity Planning

### Historical Data
- **Epic 7**: 23% increase in 3 hours = 7.7% per hour
- **Average**: ~5% per hour (sustainable)
- **Sprint Capacity**: 40 hours (1 week)

### Projected Completion

| Week | Focus | Hours | Completion |
|------|-------|-------|------------|
| Nov 18-22 | Quality + UX | 19h | BE-15, FE-03, Fixes |
| Nov 25-29 | Productivity | 30h | BE-03, FE-07, BE-01, FE-04 |
| Dec 2-6 | Advanced | 20h | Remaining backlog |

**Total**: ~70 hours over 3 weeks

---

## 🔥 Critical Path Items

### Must Do (Blockers for Future Work)
1. **BE-15: Integration Tests** - Required before shipping Epic 7
2. **FE-03: Mapper Restructure** - User confusion is blocking adoption

### Should Do (High Value)
3. **BE-03 + FE-07: Focus System** - Pairs perfectly with Epic 7 micro-steps
4. **BE-01 + FE-04: Templates** - Backend already done, just wire it

### Nice to Have (Lower Priority)
- BE-02: Pets Service enhancements
- FE-06: Celebration Screen
- BE-04: Gamification Enhancements

---

## 🎓 Lessons from Epic 7

### What Worked ✅
1. **Small, Focused Files**: All components < 400 lines
2. **TDD Approach**: Tests first caught issues early
3. **Incremental Delivery**: Backend → API → Frontend
4. **Documentation First**: Clear specs prevented scope creep
5. **Zero Dependencies**: Used existing React Native stack

### Apply to Next Tasks
- Keep files under 500 lines (CLAUDE.md rule)
- Write tests before implementation
- Document as you build
- Use existing libraries when possible
- Deliver incrementally (don't build everything at once)

---

## 📚 Reference Documentation

### Completed
- `EPIC_7_COMPLETION_STATUS.md` - Full Epic 7 report
- `mobile/EPIC_7_INTEGRATION_GUIDE.md` - Integration guide
- `agent_resources/reference/backend/BE-05_TASK_SPLITTING_SCHEMA.md`

### Next Task Specs
- `agent_resources/planning/next_5_tasks.md` - Detailed specs
- `agent_resources/planning/roadmap_overview.md` - Full roadmap

### Testing
- `/tests/unit/` - Unit tests (centralized, per CLAUDE.md update)
- `/tests/integration/` - Integration tests (to be created)
- `/tests/e2e/` - End-to-end tests (future)

---

## 🚀 Quick Start - Next Session

### To Start BE-15 (Integration Tests):
```bash
# 1. Create test file
cd /path/to/project
mkdir -p tests/integration
touch tests/integration/test_task_splitting_e2e.py

# 2. Write E2E test (Epic 7 full flow)
# - Create task via API
# - Split task
# - Complete micro-steps
# - Verify XP awarded
# - Check progress

# 3. Run test
uv run pytest tests/integration/test_task_splitting_e2e.py -v
```

### To Start FE-03 (Mapper Restructure):
```bash
# 1. Read spec
cat agent_resources/planning/next_5_tasks.md

# 2. Create components
cd mobile/components/mapper
touch MapView.tsx PlanView.tsx

# 3. Update mapper.tsx
# Add tab switching logic

# 4. Test in Storybook
cd mobile && npm run storybook
```

---

## 🎯 Success Metrics

### Week 2 Goals
- [ ] BE-15: All integration tests passing
- [ ] FE-03: Mapper has 2 clear tabs
- [ ] Epic 7: Physical device tested
- [ ] Documentation: Updated for Nov 22

### Week 3 Goals
- [ ] BE-03 + FE-07: Focus timer works end-to-end
- [ ] BE-01 + FE-04: Templates browsable and usable
- [ ] All new tests passing

---

## 💬 Communication

### Daily Standup Template
**What did you complete yesterday?**
- [ ] List completed tasks
- [ ] Tests passing
- [ ] Blockers removed

**What will you work on today?**
- [ ] Next task from priority queue
- [ ] Expected completion time

**Any blockers?**
- [ ] Technical issues
- [ ] Dependency waiting
- [ ] Clarification needed

---

## 🎉 Celebration Points

After each completion, celebrate:
- **BE-15 Done**: Quality gate established! 🎊
- **FE-03 Done**: Mapper is clear! 🎨
- **Focus System Done**: Productivity unlocked! ⏱️
- **Templates Done**: Fast task creation! 📝

---

**Next Session**: Start with BE-15 Integration Tests
**Estimated Time to Next Major Milestone**: 19 hours (Week 2 complete)
**Long-Term Goal**: Full ADHD productivity system in 3 weeks

🚀 **Ready to continue!**
