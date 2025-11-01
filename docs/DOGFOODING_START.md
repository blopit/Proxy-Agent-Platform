# 🐕 Dogfooding: Using Our App to Build Our App

**Meta-Goal**: We're building an ADHD task management app. Let's use it to manage building itself!

**Status**: ✅ **READY FOR DOGFOODING** (BE-00 Complete!)
**Timeline**: 12 weeks, 36 tasks, 7 waves

> **📚 For comprehensive guidance, see [DOGFOODING_GUIDE.md](../DOGFOODING_GUIDE.md)**

---

## 🎯 What is Dogfooding?

**Dogfooding** = Eating your own dog food = Using your own product

Instead of managing development tasks in GitHub Issues or Jira, we'll:
1. ✅ Store all 36 development tasks as **real tasks** in our database
2. ✅ View them in **Scout mode** (discovery)
3. ✅ Work on them in **Hunter mode** (execution)
4. ✅ Track progress in **Mapper mode** (reflection)
5. ✅ Earn XP and level up as we build!

**Why?**
- If it can manage building itself, it can manage anything
- We experience our own ADHD-optimized UX
- We find issues early
- We validate human-agent collaboration
- It's fun! 🎉

---

## ✅ Current Status: READY!

### What We Have ✅
- [x] **BE-00: Task Delegation System** - 100% complete!
  - ✅ `task_assignments` and `agent_capabilities` tables created
  - ✅ 6 API endpoints fully functional
  - ✅ 95% test coverage (14/14 tests passing)
  - ✅ Complete assignment lifecycle working
- [x] **36 tasks seeded** into the database
- [x] **End-to-end workflow** tested and verified
- [x] 36 task specifications written (16 backend + 20 frontend)
- [x] Wave-based execution plan (7 waves over 12 weeks)
- [x] TDD workflow documented (backend)
- [x] Storybook-first workflow documented (frontend)
- [x] Human developer entry points created
- [x] Agent coordination system designed

### What's Next 🚀
- [ ] **YOU ARE HERE**: Start assigning and completing tasks
- [ ] Build UI for task visualization (Scout/Hunter modes)
- [ ] Scale up to 7+ parallel tasks
- [ ] Real-time progress tracking

**Bottom line**: Everything is ready! Start using the system now! 🎉

---

## 🥚 Step 1: Implement BE-00 (Foundation)

**Task**: BE-00 Task Delegation System
**File**: `docs/tasks/backend/00_task_delegation_system.md`
**Mode**: 🟡 DO_WITH_ME (human + agent collaborate)
**Time**: 8-10 hours

### Who Should Do This?
**Backend developer(s)** - Start here: `docs/BACKEND_DEVELOPER_START.md`

### What BE-00 Does
1. **Database Schema**:
   - Adds delegation fields to `tasks` table
   - Creates `task_assignments` table (who's working on what)
   - Creates `agent_capabilities` table (what agents can do)

2. **API Endpoints**:
   - `POST /api/v1/delegation/delegate` - Delegate a task
   - `GET /api/v1/delegation/assignments/agent/{id}` - Agent queries assignments
   - `POST /api/v1/delegation/assignments/{id}/accept` - Accept assignment
   - `POST /api/v1/delegation/assignments/{id}/complete` - Mark complete

3. **Seed Script**:
   - Loads all 36 development tasks as real tasks in DB
   - Sets up initial task assignments
   - Creates sample agent capabilities

### Quick Start for BE-00
```bash
# 1. Read the spec
cat docs/tasks/backend/00_task_delegation_system.md

# 2. Set up service structure
mkdir -p src/services/delegation/tests
touch src/services/delegation/{__init__.py,models.py,repository.py,routes.py}
touch src/services/delegation/tests/{__init__.py,test_delegation.py}

# 3. Follow TDD: RED → GREEN → REFACTOR
# See docs/BACKEND_DEVELOPER_START.md for detailed workflow

# 4. Create seed script
touch src/database/seeds/seed_development_tasks.py
```

**Estimated Time**: 1 week for human + agent collaboration

---

## 🎨 Step 2: Build Minimal UI (Scout + Hunter)

**While BE-00 is being built**, frontend developers can:

### Option A: Build Scout Mode Components
**Tasks**: FE-01 (ChevronTaskFlow), FE-02 (MiniChevronNav)
**File**: `docs/FRONTEND_DEVELOPER_START.md`

These components can be built in **Storybook** with mock data, then integrated once BE-00 is ready.

### Option B: Enhance Existing Scout/Hunter Modes
Check what already exists:
```bash
cat frontend/src/components/mobile/modes/ScoutMode.tsx
cat frontend/src/components/mobile/modes/TodayMode.tsx
```

Add task delegation UI to these existing modes.

---

## 🐕 Step 3: Start Dogfooding! (Week 2+)

Once BE-00 is complete and basic UI exists:

### For Humans

**Morning: Check Your Tasks**
```
1. Open app → Scout mode
2. See all development tasks (filtered by is_meta_task=true)
3. Filter by delegation mode:
   - 🟡 DO_WITH_ME: Tasks needing your input
   - ⚙️ DELEGATE: Tasks for agents
   - 🔴 CRITICAL: Must do first
```

**Pick a Task**
```
1. Click task → See details
2. Check delegation mode
3. If DO_WITH_ME: Collaborate with agent
4. If DO: You handle it yourself
5. If DELEGATE: Assign to available agent
```

**Work on Task**
```
1. Switch to Hunter mode
2. See your assigned tasks as swipeable cards
3. Swipe right → Start task
4. Complete micro-steps with chevron progress
5. Earn XP as you go!
```

**End of Day: Review Progress**
```
1. Switch to Mapper mode
2. See daily progress (tasks completed, XP earned)
3. See agent contributions
4. Feel satisfied! 🎉
```

### For Agents (When Available)

**Query for Assignments**
```bash
curl GET /api/v1/delegation/assignments/agent/backend-agent-1?status=pending
```

**Accept Assignment**
```bash
curl POST /api/v1/delegation/assignments/{id}/accept
```

**Work on Task**
```
1. Read task spec from docs/tasks/
2. Execute with TDD (backend) or Storybook (frontend)
3. Update progress via API
4. Mark complete when done
```

---

## 📊 Dogfooding Workflow Example

### Week 1: Foundation (BE-00)

**Monday**:
- **Human**: Create BE-00 task in app (manually for now)
- **Human**: Design delegation API (2 hours) → Mark step complete → +18 XP
- **Human**: Assign implementation steps to agent

**Tuesday**:
- **Agent**: Write TDD tests (3 hours) → +22 XP
- **Human**: Review tests in app → Mark review complete → +15 XP

**Wednesday-Friday**:
- **Agent**: Implement repository, API routes → +XP per step
- **Human**: Code review, approve → +XP
- **Agent**: Run seed script → All 36 tasks now in database!

**Result**: BE-00 complete, all tasks visible in Scout mode

### Week 2-3: Parallel Development (Wave 2)

**Now dogfooding is REAL**:

**Human Morning Routine**:
1. Open app → Scout mode
2. See 11 Wave 2 tasks ready
3. Review agent-completed tasks from yesterday
4. Assign new tasks to agents

**4 Backend Agents + 3 Frontend Agents Working**:
- Tasks auto-update in app as agents complete steps
- Humans see real-time progress in Mapper mode
- XP accumulates across whole team
- Celebration screens when tasks complete!

**Human Evening Routine**:
1. Mapper mode → See 8 tasks completed today
2. See agent contributions (18 steps!)
3. See personal XP earned (review work)
4. Check weekly progress → 28% complete
5. Feel motivated! 🔥

---

## 🎯 Success Metrics for Dogfooding

### Week 1
- [ ] BE-00 complete
- [ ] All 36 tasks in database
- [ ] Tasks visible in Scout mode
- [ ] Can assign tasks (human or agent)

### Week 2
- [ ] 7 parallel tasks being worked on
- [ ] Daily progress visible in Mapper
- [ ] XP accumulating correctly
- [ ] Agents can query and accept tasks via API

### Week 4
- [ ] 50% of tasks managed through app
- [ ] Team using app daily
- [ ] Finding UX issues and fixing them
- [ ] Dogfooding feels natural

### Week 12
- [ ] 100% of tasks managed through app
- [ ] All 36 tasks completed
- [ ] Team has "lived" the ADHD workflow
- [ ] Product validated through dogfooding
- [ ] Ready for beta users

---

## 📚 Documentation for Dogfooding

### For Humans Starting Tasks
- **Backend devs**: `docs/BACKEND_DEVELOPER_START.md`
- **Frontend devs**: `docs/FRONTEND_DEVELOPER_START.md`

### For Understanding the System
- **Entry point**: `docs/AGENT_DEVELOPMENT_ENTRY_POINT.md`
- **Wave plan**: `docs/WAVE_EXECUTION_PLAN.md`
- **Human-agent workflow**: `docs/HUMAN_AGENT_WORKFLOW.md`
- **Task list**: `docs/tasks/README.md`

### For Vision & Strategy
- **Project vision**: `docs/PROJECT_VISION_SYNTHESIS.md`
- **Development summary**: `docs/PARALLEL_DEVELOPMENT_SUMMARY.md`

---

## 🚀 Getting Started RIGHT NOW

### If You're a Backend Developer
```bash
# 1. Read quick start
cat docs/BACKEND_DEVELOPER_START.md

# 2. Start BE-00 (the foundation)
cat docs/tasks/backend/00_task_delegation_system.md

# 3. Set up and follow TDD workflow
mkdir -p src/services/delegation/tests
# ... follow the guide
```

### If You're a Frontend Developer
```bash
# 1. Read quick start
cat docs/FRONTEND_DEVELOPER_START.md

# 2. Pick an independent task (doesn't need BE-00)
cat docs/tasks/frontend/01_chevron_task_flow.md
# OR
cat docs/tasks/frontend/02_mini_chevron_nav.md

# 3. Build in Storybook
pnpm storybook
# ... follow the guide
```

### If You're Coordinating
```bash
# 1. Review the wave plan
cat docs/WAVE_EXECUTION_PLAN.md

# 2. Assign BE-00 to backend developer(s)
# 3. Assign FE-01, FE-02 to frontend developer(s)
# 4. Monitor progress
# 5. Once BE-00 done → START DOGFOODING!
```

---

## 🎉 The Magic of Dogfooding

When we're dogfooding successfully, you'll:

✅ Start your day by opening the app (not GitHub)
✅ See your tasks in Scout mode
✅ Work on them in Hunter mode with chevron progress
✅ Earn XP as you complete steps
✅ See the team's progress in Mapper mode
✅ Feel the dopamine hits we designed for ADHD
✅ Find UX issues because you're using it daily
✅ Fix those issues immediately
✅ Build a better product

**It becomes a beautiful feedback loop**: The better the app, the better we can build the app, the better the app becomes! 🔄

---

## 🥚 Chicken-and-Egg Solution

**Problem**: We need the app to manage building the app, but we need to build it first!

**Solution**:
1. Week 1: Build BE-00 "traditionally" (GitHub issues, manual tracking)
2. Week 2+: Use the app for everything else (dogfooding kicks in)
3. Week 12: Even BE-00 is managed retroactively in the app for completion

**Meta-moment**: The task delegation system delegates its own creation! 🤯

---

**Ready to start?** Pick your role and dive in:
- 🔧 Backend: `docs/BACKEND_DEVELOPER_START.md` → BE-00
- 🎨 Frontend: `docs/FRONTEND_DEVELOPER_START.md` → FE-01 or FE-02
- 📊 Coordinator: `docs/WAVE_EXECUTION_PLAN.md` → Assign tasks

**Let's build this app by using this app!** 🐕🚀
