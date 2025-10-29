# 👥 Human-Agent Collaborative Workflow

**Purpose**: Define how humans and AI agents collaborate using our own task management system (dogfooding!)
**Last Updated**: 2025-01-28
**Status**: Active

---

## 🎯 The Meta-Goal

We're building an ADHD task management app. We should **use our own app to build the app**!

This means:
1. All development tasks exist as **real tasks** in the database
2. Tasks are **delegated** using the 4D model (DO/DO_WITH_ME/DELEGATE/DELETE)
3. Humans and agents **collaborate** through the app UI (Scout/Hunter/Mapper modes)
4. Progress is **visible** via chevron indicators
5. We experience our own ADHD-optimized workflow

---

## 🔄 The 4D Delegation Model

### 🟡 DO (Human Only)
**When to use**: Strategic decisions, architecture, design, user research

**Examples**:
- Decide between 2-tab vs 5-tab Mapper structure
- Choose pet species and personality traits
- Define badge unlock criteria
- Review and approve agent-completed work

**Workflow**:
1. Human sees task in Scout mode
2. Marks delegation as "DO"
3. Works on task in Hunter mode (swipeable cards)
4. Completes micro-steps with chevron progress
5. Marks complete, earns XP

---

### 🤝 DO_WITH_ME (Human + AI Collaboration)
**When to use**: Complex features needing both human creativity and AI speed

**Examples**:
- **BE-00 Task Delegation System**: Human designs API, agent implements TDD tests
- **FE-03 Mapper Restructure**: Human reviews UX, agent builds components
- **FE-05 Pet Widgets**: Human approves pet sprites, agent implements animations

**Workflow**:
1. Human claims task as "DO_WITH_ME"
2. Human breaks down into micro-steps (some human, some agent)
3. Agent completes DELEGATE micro-steps autonomously
4. Human reviews agent work, provides feedback
5. Agent iterates based on feedback
6. Human completes final review step
7. Both earn XP (agent gets base XP, human gets completion bonus)

**Example Micro-Steps for BE-00**:
```
1. 🟡 Human: Design delegation API contracts (30 min)
2. ⚙️ Agent: Write TDD tests for delegation (60 min)
3. ⚙️ Agent: Implement repository layer (45 min)
4. ⚙️ Agent: Create FastAPI routes (45 min)
5. 🟡 Human: Code review and architectural feedback (30 min)
6. ⚙️ Agent: Address review feedback (30 min)
7. 🟡 Human: Final approval and merge (15 min)
```

---

### ⚙️ DELEGATE (Full Agent Autonomy)
**When to use**: Well-defined tasks with clear acceptance criteria

**Examples**:
- **BE-01 Task Templates**: Complete TDD spec exists, agent follows RED-GREEN-REFACTOR
- **FE-01 ChevronTaskFlow**: Storybook stories defined, agent implements component
- **BE-04 Gamification**: XP calculation formula specified, agent writes tests + code

**Workflow**:
1. Human delegates task to agent (via /delegation API or UI)
2. Agent claims task from queue
3. Agent reads task spec from `docs/tasks/`
4. Agent executes autonomously (TDD for backend, Storybook for frontend)
5. Agent validates against acceptance criteria
6. Agent marks complete
7. Human receives notification for optional review
8. Agent earns XP

**Agent sees task like this**:
```
Task: BE-01 Task Templates Service
Delegation: DELEGATE
Assigned to: agent:backend-agent-1
Micro-steps:
  ✅ [DONE] Create database schema (30 min) +15 XP
  ✅ [DONE] Write TDD tests (60 min) +22 XP
  🔵 [ACTIVE] Implement models (30 min)
  ⚪ [PENDING] Build repository (45 min)
  ⚪ [PENDING] Create API routes (45 min)
  ...
```

---

### 🗑️ DELETE (Skip Task)
**When to use**: Task no longer needed, duplicate, or out of scope

**Examples**:
- Duplicate task created by mistake
- Feature decided against after discussion
- Blocked task that can't proceed

**Workflow**:
1. Human or agent marks task as "DELETE"
2. Task archived (soft delete, not actually removed)
3. No XP awarded
4. Task removed from active queues

---

## 🏗️ Practical Example: Week 1 Workflow

### Monday: Foundation Setup

**9:00 AM - Human Task (DO)**
```
Task: Set up development environment
- Clone repo
- Install dependencies (uv sync, pnpm install)
- Run tests to verify baseline
- Review roadmap documents
Duration: 30 minutes
XP Earned: 20
```

**10:00 AM - Human + Agent Task (DO_WITH_ME)**
```
Task: BE-00 Task Delegation System
Delegation: DO_WITH_ME

Human micro-steps:
  ✅ Design delegation API (30 min) +18 XP
  ⏳ Review agent's TDD tests (30 min)
  ⏳ Approve final implementation (15 min)

Agent micro-steps:
  🔵 [ACTIVE] Write TDD tests (60 min) +22 XP
  ⏳ Implement repository (45 min)
  ⏳ Create API routes (45 min)
  ⏳ Address code review (30 min)
```

**Human UI (Scout Mode)**:
```
📋 BE-00: Task Delegation System
   Delegation: 🤝 DO_WITH_ME
   Progress: 2/7 steps complete (28%)
   Your next: Review agent's TDD tests
   Agent next: Implement repository
   ════════════════════════════════════
   [Start Next Step]
```

---

### Tuesday: Parallel Development

**Agent 1 (Backend TDD)** - DELEGATE
```
Task: BE-01 Task Templates Service
Status: In Progress (4/9 steps complete)
Current: Building repository layer
Next: Create FastAPI routes
No human intervention needed
```

**Agent 2 (Backend TDD)** - DELEGATE
```
Task: BE-02 User Pets Service
Status: In Progress (2/15 steps complete)
Current: Writing TDD tests
Next: Implement models
No human intervention needed
```

**Agent 3 (Frontend Storybook)** - DELEGATE
```
Task: FE-01 ChevronTaskFlow
Status: In Progress (3/10 steps complete)
Current: Building current step card UI
Next: Implement step completion logic
No human intervention needed
```

**Agent 4 (Frontend Storybook)** - DELEGATE
```
Task: FE-02 MiniChevronNav
Status: In Progress (1/5 steps complete)
Current: Creating Storybook stories
Next: Implement sticky positioning
No human intervention needed
```

**Human (DO_WITH_ME Review)**:
```
Task: Review agent-completed steps
- BE-00: Review TDD test coverage ✅
- FE-01: Review Storybook stories ⏳
Duration: 1 hour total
XP Earned: 45
```

**Human UI (Mapper Mode - Dashboard)**:
```
📊 Your Progress Today
   Tasks completed: 1 (BE-00 design)
   Steps completed: 5
   XP earned: 95
   Agents working: 4

🤖 Agent Activity
   backend-agent-1: BE-01 (step 4/9) ████░░░░░
   backend-agent-2: BE-02 (step 2/15) ██░░░░░░░░░░░░░
   frontend-agent-a: FE-01 (step 3/10) ███░░░░░░░
   frontend-agent-b: FE-02 (step 1/5) █░░░░
```

---

### Wednesday: Human Reviews Agent Work

**Morning - Human Task (DO)**
```
Task: Code review BE-01 (Task Templates)
Micro-steps:
  ✅ Review TDD tests (100% coverage) ✅
  ✅ Check API endpoints match spec ✅
  ✅ Verify database schema correct ✅
  ⏳ Test endpoints locally
  ⏳ Approve and merge PR

Status: Agent completed all implementation steps
Human: Validation and approval
```

**Afternoon - Agents Continue**
```
backend-agent-1: BE-01 approved → starts BE-04 Gamification
backend-agent-2: BE-02 continues (step 8/15)
frontend-agent-a: FE-01 continues (step 7/10)
frontend-agent-b: FE-02 completed → starts FE-04
```

---

## 📊 Task Visibility in App

### Scout Mode (Discovery)
```
🔍 All Development Tasks (filtered: is_meta_task=true)

Categories:
  🔴 Critical (1)
    └─ BE-00: Task Delegation System [DO_WITH_ME] 28% ██░░░░░

  ⚙️ Agent Tasks (7)
    ├─ BE-01: Templates [DELEGATE] 67% ██████░░░
    ├─ BE-02: Pets [DELEGATE] 40% ████░░░░░
    ├─ FE-01: ChevronFlow [DELEGATE] 70% ███████░░
    └─ ... 4 more

  🟡 Human Tasks (2)
    ├─ Review BE-01 [DO] 0%
    └─ Review FE-01 Stories [DO] 0%

  🤝 Collaboration (2)
    ├─ FE-03: Mapper [DO_WITH_ME] 15%
    └─ FE-05: Pets UI [DO_WITH_ME] 0%
```

### Hunter Mode (Today's Focus)
```
🎯 Today's Tasks (Swipeable Cards)

[Card 1 - Top of Stack]
═══════════════════════════════════════
BE-00: Task Delegation System
🤝 DO_WITH_ME | ⏰ 2h remaining

Next Step (Your Turn):
Review agent's TDD test coverage
Estimated: 30 minutes | +18 XP

Agent Progress:
  ✅ TDD tests written (60 min)
  ✅ Repository implemented (45 min)
  🔵 API routes created (45 min)

[Swipe Right] Start Review →
[Swipe Left] Skip for Later
═══════════════════════════════════════

[Card 2]
Review FE-01 Storybook Stories
🟡 DO | ⏰ 1h | +25 XP
```

### Mapper Mode (Reflection)
```
📊 MAP Tab - Dashboard

This Week:
  Tasks completed: 3/12 (25%)
  Steps completed: 45/156 (29%)
  XP earned: 1,250
  Current streak: 3 days 🔥

Agent Contributions:
  Backend agents: 18 steps ████████░░
  Frontend agents: 12 steps ██████░░░░
  Your steps: 15 steps ███████░░░

Chevron Journey This Week:
  ══════════════════════════════════════
  Mon  ████ 4 steps
  Tue  ████████ 8 steps (agents joined!)
  Wed  ██████ 6 steps
  Thu  ⏳ In progress...
```

---

## 🔧 API Integration Examples

### 1. Human Delegates Task to Agent

```bash
# Human uses app UI or API
POST /api/v1/delegation/delegate
{
  "task_id": "task-123",
  "delegation_mode": "DELEGATE",
  "prefer_agent_type": "backend-tdd"
}

Response:
{
  "assignment": {
    "assignment_id": "assign-456",
    "task_id": "task-123",
    "assigned_to": "agent:backend-agent-1",
    "delegation_mode": "DELEGATE",
    "status": "pending"
  },
  "assigned_agent": {
    "agent_id": "backend-agent-1",
    "agent_type": "backend-tdd",
    "status": "busy"
  },
  "message": "Task delegated to backend-agent-1"
}
```

### 2. Agent Claims Assignment

```bash
# Agent queries for its assignments
GET /api/v1/delegation/assignments/agent/backend-agent-1?status=pending

Response:
[
  {
    "assignment_id": "assign-456",
    "task_id": "task-123",
    "task": {
      "title": "BE-01: Task Templates Service",
      "micro_steps": [...],
      "estimated_minutes": 360
    },
    "delegation_mode": "DELEGATE",
    "status": "pending"
  }
]

# Agent accepts
POST /api/v1/delegation/assignments/assign-456/accept
```

### 3. Agent Starts Work

```bash
# Agent marks in progress
POST /api/v1/delegation/assignments/assign-456/start

# Agent completes micro-steps
POST /api/v1/micro-steps/step-789/complete
{
  "xp_earned": 22
}

# Human sees real-time update in UI (WebSocket push)
```

### 4. Agent Completes Task

```bash
# Agent finishes all steps
POST /api/v1/delegation/assignments/assign-456/complete

Response:
{
  "assignment_id": "assign-456",
  "status": "completed",
  "completed_at": "2025-01-28T15:30:00Z",
  "total_xp_earned": 156
}

# Agent status updates: busy → idle
# Human receives notification: "BE-01 ready for review"
```

---

## ✅ Success Metrics

### Human Metrics
- **Tasks delegated**: 8/11 tasks (73% delegation rate)
- **Review time saved**: ~20 hours (agents did implementation)
- **Focus time**: Humans focus on design/architecture (high-value work)
- **XP earned**: Humans still earn XP for reviews and DO tasks

### Agent Metrics
- **Task completion rate**: 95% (only blocked when specs unclear)
- **Test coverage**: 97% average (agents love TDD!)
- **Parallel execution**: 4 agents working simultaneously
- **Time to completion**: 3 weeks vs 12 weeks sequential (4x faster)

### System Metrics
- **Dogfooding adoption**: 100% of dev tasks managed in app
- **Chevron visibility**: Real-time progress tracking
- **ADHD UX validation**: Team experiences own product
- **Collaboration quality**: 85% of DO_WITH_ME tasks succeed first try

---

## 🎉 The Meta-Win

By using our own task management system to build the task management system:

1. **We validate the product**: If it works for building itself, it works for users
2. **We find UX issues early**: Experience ADHD workflow firsthand
3. **We improve collaboration**: Human-AI delegation is the future
4. **We ship faster**: Parallel agents + human oversight = 4x speed
5. **We have fun**: Earning XP while building XP system is satisfying!

---

**Start with BE-00, delegate the rest, and watch the magic happen!** 🚀
