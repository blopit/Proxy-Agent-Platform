# 🎯 Next Tasks - Prioritized Action Plan

**Created**: November 2, 2025
**Target**: 5 high-value tasks for immediate implementation
**Timeline**: 4 weeks (Nov 4 - Dec 1, 2025)

---

## 🏆 Top 5 Priority Tasks (38h total)

These tasks were selected based on:
- ✅ **High user value** (ADHD productivity focus)
- ✅ **Clear specifications** (docs/tasks/* ready)
- ✅ **Foundation for other features** (unlocks future work)
- ✅ **Manageable scope** (can complete in 1-2 weeks)

---

### **1. BE-01: Task Templates Service** 🥇

**Priority**: CRITICAL
**Estimated**: 6 hours
**Status**: 🔄 READY TO START
**Spec**: [docs/tasks/backend/01_task_templates_service.md](docs/tasks/backend/01_task_templates_service.md)

**Why This First:**
- Foundation for productivity patterns
- Enables reusable workflows
- Critical for ADHD users (reduce decision fatigue)
- Unlocks FE-04 (Template Library UI)

**What It Does:**
- Create/manage reusable task templates
- Template categories (morning routine, work session, etc.)
- Step-by-step task patterns
- Share templates between users

**Acceptance Criteria:**
- [ ] POST /api/v1/templates - Create template
- [ ] GET /api/v1/templates - List all templates
- [ ] GET /api/v1/templates/{id} - Get template
- [ ] POST /api/v1/templates/{id}/instantiate - Create task from template
- [ ] 80%+ test coverage
- [ ] TDD approach (tests first!)

**Validation:**
```bash
uv run pytest src/services/task_templates/tests/ -v
uv run pytest --cov=src/services/task_templates --cov-report=term-missing
uv run ruff check src/services/task_templates/
```

**Assignment:**
- Assign to: Backend developer or Claude Code
- Use delegation API to track progress
- Create PRP: `.claude/prps/BE-01_task_templates_service.prp.md`

---

### **2. FE-01: ChevronTaskFlow Component** 🥇

**Priority**: CRITICAL
**Estimated**: 8 hours
**Status**: 🔄 READY TO START
**Spec**: [docs/tasks/frontend/01_chevron_task_flow.md](docs/tasks/frontend/01_chevron_task_flow.md)

**Why This Second:**
- Core mobile UX improvement
- Full-screen task execution interface
- Replaces basic task view
- TikTok-style engagement

**What It Does:**
- Fullscreen task display (one at a time)
- Swipe gestures (right=complete, left=delegate)
- Bottom chevron navigation
- Focus mode (no distractions)

**Acceptance Criteria:**
- [ ] ChevronTaskFlow component built
- [ ] Swipe gesture handling
- [ ] Chevron navigation (3 states: up/current/down)
- [ ] Integration with backend task API
- [ ] Storybook stories (5+ variations)
- [ ] Mobile responsive

**Validation:**
```bash
cd frontend
pnpm storybook  # Verify stories
pnpm test       # Component tests
pnpm build      # Production build
```

**Assignment:**
- Assign to: Frontend developer or Claude Code
- Storybook-first development
- Create PRP: `.claude/prps/FE-01_chevron_task_flow.prp.md`

---

### **3. BE-05: Task Splitting Service** 🥇🧠

**Priority**: CRITICAL (Epic 7 - Flagship Feature)
**Estimated**: 12 hours
**Status**: 🔄 READY TO START
**Spec**: [docs/tasks/backend/05_task_splitting_service.md](docs/tasks/backend/05_task_splitting_service.md)

**Why This Third:**
- **Flagship ADHD feature** (AI-powered task breakdown)
- Uses Claude/GPT-4 for intelligence
- Reduces executive function load
- Differentiator from other task apps

**What It Does:**
- Analyzes complex tasks
- Breaks down into atomic steps
- Estimates time for each step
- Detects dependencies
- Suggests optimal order

**Acceptance Criteria:**
- [ ] POST /api/v1/tasks/{id}/split - AI task breakdown
- [ ] Claude/GPT-4 integration working
- [ ] Subtask creation in database
- [ ] Time estimation per subtask
- [ ] Dependency detection
- [ ] 75%+ test coverage (mocked AI responses)

**AI Prompt Example:**
```
Break down this task into atomic steps for an ADHD user:
Task: "Build user authentication system"

Requirements:
- Each step should take 15-45 minutes
- Steps should be concrete and actionable
- Include time estimates
- Identify dependencies
- Optimize for executive function challenges
```

**Validation:**
```bash
uv run pytest src/services/task_splitting/tests/ -v
# Test with real AI API (manual)
curl -X POST http://localhost:8000/api/v1/tasks/{id}/split
```

**Assignment:**
- Assign to: Senior backend developer (AI experience)
- Requires OpenAI/Anthropic API key
- Create PRP: `.claude/prps/BE-05_task_splitting_service.prp.md`

---

### **4. FE-11: Task Breakdown Modal** 🥈

**Priority**: HIGH (Pairs with BE-05)
**Estimated**: 2 hours
**Status**: 🔄 READY TO START
**Spec**: [docs/tasks/frontend/11_task_breakdown_modal.md](docs/tasks/frontend/11_task_breakdown_modal.md)

**Why This Fourth:**
- UI for BE-05 (task splitting)
- Shows AI breakdown results
- Quick win (only 2h)
- High visual impact

**What It Does:**
- Modal displays subtask tree
- Shows time estimates
- Visualizes dependencies
- "Approve breakdown" button
- Edit individual steps

**Acceptance Criteria:**
- [ ] TaskBreakdownModal component
- [ ] Tree/list view toggle
- [ ] Subtask editing
- [ ] Time estimate display
- [ ] Storybook stories (3+ states)

**Validation:**
```bash
cd frontend
pnpm storybook  # Test modal variations
pnpm test       # Component tests
```

**Assignment:**
- Assign to: Frontend developer
- Pairs with BE-05
- Create PRP: `.claude/prps/FE-11_task_breakdown_modal.prp.md`

---

### **5. BE-15: Integration Test Suite** 🥈

**Priority**: HIGH (Quality Gate)
**Estimated**: 10 hours
**Status**: 🔄 READY TO START
**Spec**: [docs/tasks/backend/15_integration_tests.md](docs/tasks/backend/15_integration_tests.md)

**Why This Fifth:**
- Quality confidence for deployments
- End-to-end workflow testing
- Catches integration bugs
- Foundation for CI/CD

**What It Does:**
- Tests complete user workflows
- Database integration tests
- API endpoint integration
- Auth flow testing
- Real database, real HTTP

**Acceptance Criteria:**
- [ ] User registration → login → task creation workflow
- [ ] Task delegation workflow (BE-00)
- [ ] Template instantiation workflow (BE-01)
- [ ] Task splitting workflow (BE-05)
- [ ] All tests pass in CI/CD
- [ ] Test data cleanup

**Validation:**
```bash
uv run pytest tests/integration/ -v --integration
uv run pytest tests/integration/ --cov=src --cov-report=html
```

**Assignment:**
- Assign to: QA engineer or backend developer
- Run last (after BE-01, BE-05)
- Create PRP: `.claude/prps/BE-15_integration_tests.prp.md`

---

## 📅 Suggested Timeline (4 Weeks)

### **Week 1: Nov 4-8 (Foundation)**

| Day | Task | Dev | Hours |
|-----|------|-----|-------|
| Mon | BE-01: Task Templates (start) | Backend | 3h |
| Tue | BE-01: Task Templates (complete) | Backend | 3h |
| Wed | FE-01: ChevronTaskFlow (start) | Frontend | 4h |
| Thu | FE-01: ChevronTaskFlow (continue) | Frontend | 4h |
| Fri | Review + Testing | Both | 2h |

**Deliverables:**
- ✅ Template system working (BE-01)
- ✅ ChevronTaskFlow UI built (FE-01)

### **Week 2: Nov 11-15 (AI Intelligence)**

| Day | Task | Dev | Hours |
|-----|------|-----|-------|
| Mon | BE-05: Task Splitting (start) | Backend | 4h |
| Tue | BE-05: Task Splitting (continue) | Backend | 4h |
| Wed | BE-05: Task Splitting (AI integration) | Backend | 4h |
| Thu | FE-11: Breakdown Modal | Frontend | 2h |
| Fri | Integration + Testing | Both | 2h |

**Deliverables:**
- ✅ AI task splitting working (BE-05)
- ✅ Breakdown modal UI (FE-11)

### **Week 3: Nov 18-22 (Quality & Polish)**

| Day | Task | Dev | Hours |
|-----|------|-----|-------|
| Mon | BE-15: Integration Tests (start) | QA | 3h |
| Tue | BE-15: Integration Tests (workflows) | QA | 3h |
| Wed | BE-15: Integration Tests (complete) | QA | 4h |
| Thu | Bug fixes from testing | Both | 4h |
| Fri | Documentation + Review | Both | 2h |

**Deliverables:**
- ✅ Integration test suite (BE-15)
- ✅ All bugs from testing fixed

### **Week 4: Nov 25-29 (Dogfooding & Validation)**

| Day | Task | Dev | Hours |
|-----|------|-----|-------|
| Mon | Dogfood: Use templates in real work | Team | 2h |
| Tue | Dogfood: Test task splitting on real tasks | Team | 2h |
| Wed | Dogfood: Full workflow validation | Team | 2h |
| Thu | Polish + Performance | Both | 3h |
| Fri | Demo + Retrospective | Team | 2h |

**Deliverables:**
- ✅ All 5 tasks validated in production use
- ✅ Team retrospective completed
- ✅ Next sprint planned

---

## 🎯 Success Metrics

### **Technical Metrics**

- [ ] All 5 tasks completed and merged
- [ ] Test coverage: BE-01 (80%+), BE-05 (75%+), BE-15 (85%+)
- [ ] Integration tests: 100% passing
- [ ] No critical bugs in production
- [ ] API response times: <200ms (p95)

### **Product Metrics**

- [ ] Task templates: 10+ templates created by team
- [ ] Task splitting: 20+ tasks split successfully
- [ ] ChevronTaskFlow: Used in daily workflow
- [ ] Team feedback: "This actually helps!" reactions

### **Process Metrics**

- [ ] Delegation API used for all 5 tasks
- [ ] Daily standups tracked in database
- [ ] Completed work visible in Mapper mode
- [ ] XP earned and levels gained

---

## 🚀 How to Start (Monday Morning Checklist)

### **1. Assign Tasks via Delegation API** (15 min)

```bash
# Start API
uvicorn src.api.main:app --reload --port 8000

# Register developers as agents
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "backend-dev-001",
    "agent_name": "Your Name",
    "agent_type": "backend",
    "skills": ["python", "fastapi", "pytest", "pydantic"],
    "max_concurrent_tasks": 2
  }'

curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "frontend-dev-001",
    "agent_name": "Your Name",
    "agent_type": "frontend",
    "skills": ["react", "typescript", "storybook", "tailwind"],
    "max_concurrent_tasks": 2
  }'

# Get task IDs from database
sqlite3 proxy_agents_enhanced.db << EOF
SELECT task_id, title
FROM tasks
WHERE title LIKE 'BE-01%' OR title LIKE 'FE-01%'
  OR title LIKE 'BE-05%' OR title LIKE 'FE-11%'
  OR title LIKE 'BE-15%';
EOF

# Assign BE-01 to backend dev
curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "<BE-01-TASK-ID>",
    "assignee_id": "backend-dev-001",
    "assignee_type": "human",
    "estimated_hours": 6.0
  }'

# Assign FE-01 to frontend dev
curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "<FE-01-TASK-ID>",
    "assignee_id": "frontend-dev-001",
    "assignee_type": "human",
    "estimated_hours": 8.0
  }'
```

### **2. Create PRP Files for Claude Code** (10 min)

```bash
mkdir -p .claude/prps

# Generate PRPs for each task
# (Will be auto-generated by UI when ready)
# Or manually create from task specs
```

### **3. Start First Task** (Now!)

```bash
# Backend developer:
cd /path/to/project
source .venv/bin/activate
code docs/tasks/backend/01_task_templates_service.md
# Read spec, start TDD implementation

# Frontend developer:
cd /path/to/project/frontend
code docs/tasks/frontend/01_chevron_task_flow.md
pnpm storybook
# Read spec, start Storybook-first development
```

---

## 📊 Dependencies Graph

```
BE-01 (Templates)
  └─> FE-04 (Template Library UI) [Future]

FE-01 (ChevronTaskFlow)
  └─> Mobile UX improvements [Future]

BE-05 (Task Splitting)
  └─> FE-11 (Breakdown Modal) ✅ Week 2
  └─> BE-01 (Templates for common patterns) [Optional]

FE-11 (Breakdown Modal)
  └─> Requires: BE-05 ✅ Week 2

BE-15 (Integration Tests)
  └─> Tests: BE-01, BE-05, BE-00 ✅ Week 3
```

**No blockers!** All 5 tasks can start immediately.

---

## 🎯 Next Tasks After These 5 (Future Backlog)

### **High Priority** (After 5 core tasks)

1. **FE-03: Mapper Restructure** (7h) - DO_WITH_ME
   - 2-tab layout (MAP + PLAN)
   - Critical UX improvement

2. **BE-03: Focus Sessions Service** (4h)
   - Pomodoro timer backend
   - Session tracking

3. **FE-07: Focus Timer Component** (5h)
   - Pairs with BE-03
   - Visual timer UI

4. **FE-04: Task Template Library** (5h)
   - UI for BE-01
   - Template browsing/selection

5. **FE-06: Celebration Screen** (5h)
   - Task completion rewards
   - Dopamine reinforcement

### **Medium Priority**

6. BE-02: User Pets Service (8h)
7. FE-05: PetWidget Component (7h) - DO_WITH_ME
8. BE-04: Gamification Enhancements (6h)
9. FE-09: Swipeable Task Cards (3h)
10. FE-10: Biological Tabs Navigation (3h)

---

## 🔍 Risk Mitigation

### **Technical Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI API rate limits | Medium | High | Cache responses, use fallbacks |
| Test suite instability | Low | High | Fixed! Keep tests isolated |
| Frontend/backend integration | Medium | Medium | Integration tests (BE-15) |
| Performance issues | Low | Medium | Monitor, optimize in Week 4 |

### **Process Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Unclear requirements | Low | High | Specs are detailed ✅ |
| Scope creep | Medium | Medium | Stick to acceptance criteria |
| Developer availability | Medium | High | Use Claude Code as backup |
| Motivation drops | Low | Medium | Dogfood! See progress daily |

---

## 🎉 Celebration Milestones

- ✅ **Day 3**: BE-01 complete → Create first template!
- ✅ **Day 5**: FE-01 complete → Swipe through tasks!
- ✅ **Day 8**: BE-05 complete → AI splits your first task!
- ✅ **Day 10**: FE-11 complete → See beautiful breakdown!
- ✅ **Day 15**: BE-15 complete → 100% integration tests!
- ✅ **Day 20**: All 5 done → Team celebration! 🎉

---

## 📝 Notes & Tips

### **For Backend Developers**

- Follow TDD (RED → GREEN → REFACTOR)
- Reference CLAUDE.md for conventions
- Use `uv run pytest` for all testing
- Keep functions under 50 lines
- 80%+ test coverage minimum

### **For Frontend Developers**

- Storybook-first development
- Build component in isolation first
- Then integrate with backend
- Mobile-responsive from the start
- Use existing design system

### **For Everyone**

- Use delegation API to track work
- Update assignment status daily
- Ask questions in DO_WITH_ME mode
- Dogfood the features you build
- Have fun! This is ADHD-optimized development

---

**Created by**: Claude Code (Honest Status Assessment)
**Next Update**: After Week 1 completion (Nov 8, 2025)
**Questions**: Review task specs in `docs/tasks/backend/` and `docs/tasks/frontend/`

**Let's build!** 🚀
