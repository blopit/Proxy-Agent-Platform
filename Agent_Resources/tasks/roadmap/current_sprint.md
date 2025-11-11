# Current Sprint - Week of Nov 10-15, 2025

**Sprint Goal**: Complete Epic 7 Frontend Integration (77% → 100%)
**Status**: 🟡 In Progress (Day 1)
**Team Focus**: Wire complete backend to 90% complete UI

---

## 📋 Sprint Tasks

### Primary: Epic 7 Frontend Integration

**Target**: 5 days (Mon Nov 10 → Fri Nov 15)
**Current**: Backend 100% ✅ | Frontend 90% 🟡 | Integration 20% 🟡

#### Day 1-2 (Mon-Tue): Connect Task Breakdown Modal to API

**Task**: Wire TaskBreakdownModal.tsx to real Split Proxy Agent API

**Files**:
- Frontend: `/mobile/components/TaskBreakdownModal.tsx`
- API Service: `/mobile/src/api/taskApi.ts`
- Backend: `/src/api/routes/tasks.py` (endpoint: `POST /api/v1/tasks/{id}/split`)

**Steps**:
1. Review backend API contract in [BE-05 spec](../../../docs/tasks/backend/05_task_splitting_service.md)
2. Add `splitTask(taskId)` to taskApi.ts
3. Update TaskBreakdownModal to call API on "Split Task" button
4. Handle loading, success, error states
5. Display returned micro-steps in UI
6. Test with real tasks from database

**Acceptance Criteria**:
- [ ] API call returns micro-steps from backend
- [ ] Loading spinner shows during API call
- [ ] Error handling displays user-friendly message
- [ ] Success shows breakdown with celebration animation
- [ ] Micro-steps saved to database

**Time**: 12-16 hours (2 days)

---

#### Day 3 (Wed): Add "Slice → 2-5m" Button to Task Cards

**Task**: Add quick-access splitting button to TaskRow component

**Files**:
- Component: `/mobile/components/TaskRow.tsx` (or similar)
- Design: Follow ChevronTaskFlow patterns

**Steps**:
1. Add "Slice" button to task card UI
2. Wire to TaskBreakdownModal
3. Add haptic feedback on tap
4. Style consistently with app theme
5. Test on various task types

**Acceptance Criteria**:
- [ ] Button appears on task cards
- [ ] Tapping opens TaskBreakdownModal
- [ ] Haptic feedback confirms tap
- [ ] Works on iOS and Android
- [ ] Accessible (screen reader compatible)

**Time**: 6-8 hours (1 day)

---

#### Day 4-5 (Thu-Fri): ADHD Mode Toggle & Testing

**Task**: Implement persistent ADHD Mode preference

**Files**:
- Settings: `/mobile/src/contexts/SettingsContext.tsx` (create if needed)
- Storage: AsyncStorage for persistence
- UI: Settings screen toggle

**Steps**:
1. Create SettingsContext with ADHD Mode state
2. Add toggle to settings/profile screen
3. Store preference in AsyncStorage
4. Auto-split tasks when ADHD Mode enabled
5. Add visual indicator when mode is active

**Acceptance Criteria**:
- [ ] Toggle persists across app restarts
- [ ] ADHD Mode automatically splits new tasks >5m
- [ ] Visual indicator shows mode status
- [ ] Can toggle on/off smoothly
- [ ] Preference syncs to backend (optional)

**Time**: 12-16 hours (2 days)

**Plus**:
- End-to-end testing
- Bug fixes
- Polish UX
- Documentation updates

---

### Secondary: Mobile Onboarding Testing

**Parallel Work**: Can be done alongside Epic 7 integration

**Tasks**:
1. **iOS Simulator Testing**
   - Test onboarding flow end-to-end
   - Verify Google/Apple OAuth
   - Check offline/online sync
   - Time: 2-3 hours

2. **Android Emulator Testing**
   - Same as iOS
   - Test Android-specific patterns
   - Time: 2-3 hours

3. **OAuth Configuration**
   - Configure production OAuth URLs
   - Test deep linking
   - Verify redirect URIs
   - Time: 1-2 hours

**Owner**: Can be delegated to QA or secondary developer
**Status**: Backend ✅ | Frontend ✅ | Testing ⏳

---

## 📊 Daily Standup Template

### Questions
1. **What did you complete yesterday?**
2. **What will you work on today?**
3. **Any blockers?**

### Monday (Nov 10)
- **Goal**: Start API integration, review backend contract
- **Blocker Check**: Do we have test tasks in database?

### Tuesday (Nov 11)
- **Goal**: Complete API integration, test with real data
- **Blocker Check**: Any API response issues?

### Wednesday (Nov 12)
- **Goal**: Add "Slice" button, wire to modal
- **Blocker Check**: UI/UX design decisions needed?

### Thursday (Nov 13)
- **Goal**: Implement ADHD Mode toggle + persistence
- **Blocker Check**: AsyncStorage working correctly?

### Friday (Nov 14)
- **Goal**: E2E testing, bug fixes, polish
- **Blocker Check**: Any critical bugs blocking release?

---

## 🎯 Success Criteria

### Must Have (Sprint Goal)
- [x] Backend API exists (already complete)
- [ ] Frontend calls backend successfully
- [ ] Task splitting works end-to-end
- [ ] ADHD Mode toggle implemented
- [ ] No critical bugs

### Nice to Have
- [ ] Haptic feedback polished
- [ ] Animations smooth
- [ ] Error messages helpful
- [ ] Celebration feels rewarding

### Out of Scope (Next Sprint)
- Delegation interface (Epic 7 Phase 2.6)
- Voice commands (Epic 7 Phase 2.8)
- XP rewards for micro-steps (Epic 7 Phase 2.7)

---

## 📚 Reference Documentation

### Epic 7 Task Specs
- **[BE-05: Task Splitting Service](../../../docs/tasks/backend/05_task_splitting_service.md)** - Backend API spec
- **[FE-11: Task Breakdown Modal](../../../docs/tasks/frontend/11_task_breakdown_modal.md)** - Frontend UI spec
- **[Epic 7 Status](../../../docs/status/NEXT_STEPS.md)** - Current Epic 7 status

### Backend API
- **Endpoint**: `POST /api/v1/tasks/{task_id}/split`
- **Request**: `{ "mode": "adhd" | "default" }`
- **Response**: `{ "micro_steps": [...], "delegation_suggestions": [...] }`
- **Implementation**: `/src/agents/split_proxy_agent.py`

### Tests
- **Backend Tests**: `/src/api/tests/test_task_splitting_api.py` (16 tests)
- **Model Tests**: `/src/core/tests/test_task_splitting_models.py` (35 tests)

---

## 🚧 Known Issues & Risks

### Risks
1. **API latency**: Splitting might take >2 seconds with LLM calls
   - **Mitigation**: Add loading state, consider caching common patterns

2. **Mobile testing coverage**: No automated E2E tests yet
   - **Mitigation**: Manual testing checklist, add to FE-19 backlog

3. **Scope creep**: Could add too many features
   - **Mitigation**: Stick to sprint goal, defer nice-to-haves

---

## 📈 Sprint Metrics

### Velocity Tracking
- **Planned**: 5 days (40 hours)
- **Actual**: TBD (update daily)
- **Remaining**: TBD

### Burndown
- **Day 1**: 40 hours remaining
- **Day 2**: TBD
- **Day 3**: TBD
- **Day 4**: TBD
- **Day 5**: 0 hours remaining (goal)

---

## 🎉 Sprint Retrospective (End of Week)

**Schedule**: Friday Nov 15, 4pm

**Questions**:
1. What went well?
2. What could be improved?
3. Action items for next sprint?
4. Did we achieve the sprint goal?

---

**Sprint Start**: Monday, November 10, 2025
**Sprint End**: Friday, November 15, 2025
**Next Sprint**: Week of November 18 (BE-15 Integration Tests + FE-03 Mapper)
