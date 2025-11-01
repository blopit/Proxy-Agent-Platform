# 🐕 START DOGFOODING NOW - Practical Guide

**Current Status**: ✅ API Running | 36 tasks loaded | 2 test assignments completed

---

## 🎯 Reality Check

**You're NOT dogfooding yet.** You have:
- ✅ Infrastructure ready
- ✅ API working
- ✅ 36 tasks in database
- ❌ **But no real work being tracked**

Let's fix that. Here's how to **actually start using the app to build the app**.

---

## 🚀 Option 1: Pick Your Next Real Task (5 min)

### Step 1: Choose What You're Building Next

Looking at your codebase, you probably want to build one of these:

**High Priority Tasks Available:**

| Task | Description | Time | Why Pick This |
|------|-------------|------|---------------|
| **FE-01: ChevronTaskFlow** | Full-screen task execution modal | 8h | Core UX component you need |
| **BE-01: Task Templates** | Reusable task patterns | 6h | Helps create tasks faster |
| **FE-03: Mapper Restructure** | 2-tab MAP/PLAN layout | 7h | Improves progress visualization |
| **BE-02: User Pets** | Virtual pet system | 8h | Gamification feature |
| **FE-02: MiniChevronNav** | Sticky section navigation | 4h | Quick win, good for UX |

### Step 2: Register Yourself

```bash
# Replace with your actual name and skills
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "shrenil",
    "agent_name": "Shrenil Patel",
    "agent_type": "backend",
    "skills": ["python", "fastapi", "react", "typescript"],
    "max_concurrent_tasks": 3
  }'
```

### Step 3: Get the Task ID

```bash
# Find the task you want
sqlite3 proxy_agents_enhanced.db << 'EOF'
SELECT task_id, title FROM tasks
WHERE is_meta_task = 1
AND title LIKE 'FE-01%'
LIMIT 1;
EOF
```

**Copy that task_id!**

### Step 4: Assign It to Yourself

```bash
# Replace <TASK_ID> with the UUID from step 3
curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "<TASK_ID>",
    "assignee_id": "shrenil",
    "assignee_type": "human",
    "estimated_hours": 8.0
  }'
```

**Copy the assignment_id from the response!**

### Step 5: Accept and Start

```bash
# Replace <ASSIGNMENT_ID>
curl -X POST http://localhost:8000/api/v1/delegation/assignments/<ASSIGNMENT_ID>/accept

# Now you're IN_PROGRESS! Go build it!
```

### Step 6: When Done, Complete It

```bash
# Replace <ASSIGNMENT_ID> and actual hours
curl -X POST http://localhost:8000/api/v1/delegation/assignments/<ASSIGNMENT_ID>/complete \
  -H "Content-Type: application/json" \
  -d '{"actual_hours": 6.5}'
```

---

## 🎨 Option 2: Use a Helper Script (Easier!)

I'll create a helper script that makes this super easy:

```bash
# Save this as: dogfood.sh
#!/bin/bash

case "$1" in
  start)
    echo "🚀 Starting dogfooding..."
    uvicorn src.api.main:app --reload --port 8000
    ;;

  tasks)
    echo "📋 Available tasks:"
    sqlite3 proxy_agents_enhanced.db << 'EOF'
.mode column
.headers on
SELECT
    ROW_NUMBER() OVER (ORDER BY priority DESC) as num,
    SUBSTR(task_id, 1, 8) as id,
    SUBSTR(title, 1, 40) as task,
    delegation_mode as mode,
    priority,
    estimated_hours as hours
FROM tasks
WHERE is_meta_task = 1 AND status = 'pending'
ORDER BY priority DESC
LIMIT 15;
EOF
    ;;

  register)
    echo "👤 Registering you as an agent..."
    curl -X POST http://localhost:8000/api/v1/delegation/agents \
      -H "Content-Type: application/json" \
      -d "{
        \"agent_id\": \"$USER\",
        \"agent_name\": \"$(whoami)\",
        \"agent_type\": \"general\",
        \"skills\": [\"python\", \"typescript\", \"react\"],
        \"max_concurrent_tasks\": 3
      }"
    echo ""
    ;;

  assign)
    if [ -z "$2" ]; then
      echo "Usage: ./dogfood.sh assign <task_id>"
      exit 1
    fi

    echo "📌 Assigning task $2 to you..."
    curl -X POST http://localhost:8000/api/v1/delegation/delegate \
      -H "Content-Type: application/json" \
      -d "{
        \"task_id\": \"$2\",
        \"assignee_id\": \"$USER\",
        \"assignee_type\": \"human\",
        \"estimated_hours\": 6.0
      }"
    echo ""
    ;;

  accept)
    if [ -z "$2" ]; then
      echo "Usage: ./dogfood.sh accept <assignment_id>"
      exit 1
    fi

    echo "✅ Accepting assignment $2..."
    curl -X POST "http://localhost:8000/api/v1/delegation/assignments/$2/accept"
    echo ""
    ;;

  complete)
    if [ -z "$2" ] || [ -z "$3" ]; then
      echo "Usage: ./dogfood.sh complete <assignment_id> <hours>"
      exit 1
    fi

    echo "🎉 Completing assignment $2 (${3}h)..."
    curl -X POST "http://localhost:8000/api/v1/delegation/assignments/$2/complete" \
      -H "Content-Type: application/json" \
      -d "{\"actual_hours\": $3}"
    echo ""
    ;;

  my-work)
    echo "📊 Your assignments:"
    curl -s "http://localhost:8000/api/v1/delegation/assignments/agent/$USER" | \
      python3 -m json.tool
    ;;

  *)
    echo "🐕 Dogfooding Helper Script"
    echo ""
    echo "Usage:"
    echo "  ./dogfood.sh start              - Start API server"
    echo "  ./dogfood.sh tasks              - List available tasks"
    echo "  ./dogfood.sh register           - Register yourself"
    echo "  ./dogfood.sh assign <task_id>   - Assign task to yourself"
    echo "  ./dogfood.sh accept <assign_id> - Accept assignment"
    echo "  ./dogfood.sh complete <id> <hrs> - Complete with hours"
    echo "  ./dogfood.sh my-work            - Show your work"
    echo ""
    echo "Quick workflow:"
    echo "  1. ./dogfood.sh register"
    echo "  2. ./dogfood.sh tasks"
    echo "  3. ./dogfood.sh assign <task_id>"
    echo "  4. ./dogfood.sh accept <assignment_id>"
    echo "  5. # Do the work"
    echo "  6. ./dogfood.sh complete <assignment_id> 6.5"
    ;;
esac
```

**Save that script and use it:**

```bash
chmod +x dogfood.sh
./dogfood.sh register
./dogfood.sh tasks
./dogfood.sh assign <task_id>
./dogfood.sh accept <assignment_id>
# Build the feature...
./dogfood.sh complete <assignment_id> 6.5
```

---

## 🎯 Option 3: What You Should Do RIGHT NOW

Here's my recommendation for actually starting:

### 1. Pick FE-02: MiniChevronNav (4 hours)

**Why?**
- ✅ Quick win (4 hours)
- ✅ Visual component you can see working
- ✅ Doesn't depend on anything else
- ✅ Good first dogfooding task

### 2. Complete Commands

```bash
# 1. Get the task ID
TASK_ID=$(sqlite3 proxy_agents_enhanced.db "SELECT task_id FROM tasks WHERE title LIKE 'FE-02%' LIMIT 1")
echo "Task ID: $TASK_ID"

# 2. Register yourself (if not done)
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "shrenil",
    "agent_name": "Shrenil Patel",
    "agent_type": "frontend",
    "skills": ["react", "typescript", "storybook", "tailwind"],
    "max_concurrent_tasks": 2
  }'

# 3. Assign task
ASSIGNMENT=$(curl -s -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d "{
    \"task_id\": \"$TASK_ID\",
    \"assignee_id\": \"shrenil\",
    \"assignee_type\": \"human\",
    \"estimated_hours\": 4.0
  }")

ASSIGNMENT_ID=$(echo $ASSIGNMENT | python3 -c "import sys, json; print(json.load(sys.stdin)['assignment_id'])")
echo "Assignment ID: $ASSIGNMENT_ID"

# 4. Accept it
curl -X POST "http://localhost:8000/api/v1/delegation/assignments/$ASSIGNMENT_ID/accept"

# 5. Read the spec
cat docs/tasks/frontend/02_mini_chevron_nav.md

# 6. Build it following the spec

# 7. When done
curl -X POST "http://localhost:8000/api/v1/delegation/assignments/$ASSIGNMENT_ID/complete" \
  -H "Content-Type: application/json" \
  -d '{"actual_hours": 3.5}'
```

---

## 📊 How to Check Your Progress

```bash
# See all your assignments
curl -s "http://localhost:8000/api/v1/delegation/assignments/agent/shrenil" | python3 -m json.tool

# See just pending
curl -s "http://localhost:8000/api/v1/delegation/assignments/agent/shrenil?status=pending" | python3 -m json.tool

# See completed
curl -s "http://localhost:8000/api/v1/delegation/assignments/agent/shrenil?status=completed" | python3 -m json.tool

# Quick stats
sqlite3 proxy_agents_enhanced.db "
SELECT
    status,
    COUNT(*) as count,
    ROUND(SUM(actual_hours), 1) as total_hours
FROM task_assignments
WHERE assignee_id = 'shrenil'
GROUP BY status;
"
```

---

## 🎉 The Point of Dogfooding

**Stop treating this like a demo.** Start treating it like your actual task management system:

1. ✅ **Every real task** you work on → Assign it in the app
2. ✅ **Track actual time** → Complete with real hours
3. ✅ **Build the habit** → Check "my-work" daily
4. ✅ **Experience the UX** → Find what works and what doesn't
5. ✅ **Prove it works** → If it manages building itself, it can manage anything

---

## 🚀 Ready? Pick One:

- **[ ] Option 1**: Manual commands (teaches you the API)
- **[ ] Option 2**: Helper script (faster workflow)
- **[ ] Option 3**: Follow my FE-02 recommendation (get started now)

**The app is running. The tasks are ready. Just start!** 🐕

---

**Next**: Pick a task, assign it, and actually track your work through the system. That's dogfooding!
