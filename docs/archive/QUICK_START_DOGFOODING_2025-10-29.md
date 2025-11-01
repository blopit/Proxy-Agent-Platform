# 🚀 Quick Start: Dogfooding in 5 Minutes

**Goal**: Start using the app to build the app!

---

## Step 1: Start the API (30 seconds)

```bash
# In terminal 1
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform
source .venv/bin/activate
uvicorn src.api.main:app --reload --port 8000
```

Wait for: `🚀 Proxy Agent Platform started`

---

## Step 2: View Your Tasks (1 minute)

```bash
# In terminal 2
sqlite3 proxy_agents_enhanced.db << EOF
.mode column
.headers on
SELECT
    SUBSTR(title, 1, 40) as task,
    delegation_mode,
    priority,
    ROUND(estimated_hours, 1) as hours
FROM tasks
WHERE is_meta_task = 1
ORDER BY created_at
LIMIT 10;
EOF
```

You should see 10 development tasks like:
- BE-00: Task Delegation System (do_with_me)
- BE-01: Task Templates Service (delegate)
- FE-01: ChevronTaskFlow Component (delegate)
- etc.

---

## Step 3: Pick a Task (1 minute)

### Option A: Backend Developer
Pick any `BE-*` task with `delegate` mode

### Option B: Frontend Developer
Pick any `FE-*` task with `delegate` mode

### Option C: Architect/Lead
Pick any task with `do_with_me` mode (needs collaboration)

**Copy the task_id** - you'll need it next!

---

## Step 4: Register Yourself as an Agent (30 seconds)

```bash
# Register as a backend developer
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "human-dev-001",
    "agent_name": "Your Name",
    "agent_type": "backend",
    "skills": ["python", "fastapi", "pytest"],
    "max_concurrent_tasks": 2
  }'

# OR register as frontend developer
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "human-dev-001",
    "agent_name": "Your Name",
    "agent_type": "frontend",
    "skills": ["react", "typescript", "storybook"],
    "max_concurrent_tasks": 2
  }'
```

You should see: `✅ Agent registered`

---

## Step 5: Assign Task to Yourself (1 minute)

```bash
# Replace <TASK_ID> with the task_id you copied earlier
curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "<TASK_ID>",
    "assignee_id": "human-dev-001",
    "assignee_type": "human",
    "estimated_hours": 6.0
  }'
```

You should see:
```json
{
  "assignment_id": "...",
  "status": "pending",
  "task_id": "...",
  ...
}
```

**Copy the assignment_id** - you'll need it to track progress!

---

## Step 6: Start Working (1 minute)

```bash
# Accept the assignment
curl -X POST http://localhost:8000/api/v1/delegation/assignments/<ASSIGNMENT_ID>/accept

# You should see: "status": "in_progress"
```

Now go build the feature! 🚀

---

## Step 7: Complete the Task (30 seconds)

When you're done:

```bash
curl -X POST http://localhost:8000/api/v1/delegation/assignments/<ASSIGNMENT_ID>/complete \
  -H "Content-Type: application/json" \
  -d '{"actual_hours": 5.5}'
```

You should see: `"status": "completed"` 🎉

---

## 📊 Track Your Progress

### View all your assignments:
```bash
curl http://localhost:8000/api/v1/delegation/assignments/agent/human-dev-001
```

### View pending tasks:
```bash
curl "http://localhost:8000/api/v1/delegation/assignments/agent/human-dev-001?status=pending"
```

### View completed tasks:
```bash
curl "http://localhost:8000/api/v1/delegation/assignments/agent/human-dev-001?status=completed"
```

---

## 🎯 What to Build First

### Week 1: High Priority
1. **FE-01**: ChevronTaskFlow Component (8 hours)
   - Full-screen task execution modal
   - Step-by-step progress
   - XP rewards per step

2. **BE-01**: Task Templates Service (6 hours)
   - CRUD API for templates
   - Reusable task patterns
   - Pre-defined micro-steps

3. **FE-03**: Mapper Restructure (7 hours) [DO_WITH_ME]
   - 2-tab layout: MAP + PLAN
   - Progress visualization
   - Needs human oversight

### Week 2: Core Features
4. **BE-02**: User Pets Service (8 hours)
5. **FE-05**: PetWidget Component (7 hours) [DO_WITH_ME]
6. **FE-02**: MiniChevronNav (4 hours)

---

## 🤝 Collaboration Tips

### For DO_WITH_ME tasks:
1. Break it down into phases
2. Agent does implementation
3. Human reviews and guides
4. Iterate until perfect

### For DELEGATE tasks:
1. Provide clear specs
2. Let agent work autonomously
3. Review when complete
4. Provide feedback

---

## 🎉 You're Dogfooding!

Congratulations! You're now using the Proxy Agent Platform to build itself.

**What's Next?**
- Assign more tasks
- Track your velocity
- Earn XP as you build
- Experience the ADHD workflow
- Find and fix UX issues

**Questions?**
- See [DOGFOODING_STATUS.md](DOGFOODING_STATUS.md) for full details
- Check [docs/DOGFOODING_START.md](docs/DOGFOODING_START.md) for comprehensive guide
- Review API docs at http://localhost:8000/docs

---

**Let's build! 🚀**
