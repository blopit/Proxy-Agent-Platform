# 🐕 Dogfooding Guide: Using the App to Build the App

This guide will help you use the Proxy Agent Platform to manage building itself! All 36 development tasks are already seeded in the database.

---

## Quick Start (3 Steps)

### 1. Start the Backend API
```bash
# Terminal 1: Start FastAPI server
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform
.venv/bin/python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

# Verify it's running:
# Visit http://localhost:8000/docs (Swagger UI)
```

### 2. Start the Frontend
```bash
# Terminal 2: Start Next.js dev server
cd frontend
pnpm install  # First time only
pnpm dev

# Open http://localhost:3000 in your browser
```

### 3. View Your Tasks!
Open http://localhost:3000 and you'll see:
- **Inbox**: All 36 development tasks ready to work on
- **Today**: Tasks scheduled for today
- **Progress**: Your progress tracking

---

## 📊 What's Already Seeded

The database contains all 36 development tasks organized into 6 waves:

### Wave 1: Foundation (1 task - COMPLETED!)
- ✅ **BE-00**: Task Delegation System (8h) - DO_WITH_ME

### Wave 2: Core Services (11 tasks - 113h)
**Backend:**
- BE-01: Task Templates Service (6h) - DELEGATE
- BE-02: User Pets Service (8h) - DELEGATE
- BE-03: Focus Sessions Service (4h) - DELEGATE
- BE-04: Gamification Enhancements (5h) - DELEGATE

**Frontend:**
- FE-01: ChevronTaskFlow Component (8h) - DELEGATE
- FE-02: MiniChevronNav Component (4h) - DELEGATE
- FE-03: Mapper Restructure (7h) - DO_WITH_ME
- FE-04: TaskTemplateLibrary Component (4h) - DELEGATE
- FE-05: PetWidget Component (7h) - DO_WITH_ME
- FE-06: CelebrationScreen Component (4h) - DELEGATE
- FE-07: FocusTimer Component (4h) - DELEGATE

### Wave 3-6: Advanced Features (24 more tasks)
See all tasks in the UI or run:
```bash
.venv/bin/python -c "
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
db = EnhancedDatabaseAdapter('proxy_agents_enhanced.db')
conn = db.get_connection()
cursor = conn.cursor()
cursor.execute('SELECT title, delegation_mode, estimated_hours FROM tasks ORDER BY title')
for row in cursor.fetchall():
    mode_icon = '🤝' if row['delegation_mode'] == 'do_with_me' else '🤖'
    print(f'{mode_icon} {row[\"title\"]} ({row[\"estimated_hours\"]}h)')
"
```

---

## 🎯 Using the Delegation System

### Via UI (Recommended)
1. Open http://localhost:3000
2. Navigate to **Inbox** tab
3. See all 36 tasks organized by wave
4. Click a task to:
   - View details
   - Start working (marks as in_progress)
   - Complete (marks as completed)
   - Delegate to an agent

### Via API (For Automation)

#### 1. View All Tasks
```bash
curl http://localhost:8000/api/v1/tasks | python3 -m json.tool | less
```

#### 2. Delegate a Task to Agent
```bash
# Get a task ID
TASK_ID="56ea0d0d-5f78-4dbc-a2b5-7a7b87072dd5"  # BE-01: Task Templates

# Delegate to backend agent
curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d "{
    \"task_id\": \"$TASK_ID\",
    \"assignee_id\": \"backend-agent-001\",
    \"assignee_type\": \"agent\",
    \"estimated_hours\": 6.0
  }" | python3 -m json.tool
```

#### 3. Check Agent Workload
```bash
# See what backend agent is working on
curl http://localhost:8000/api/v1/delegation/assignments/agent/backend-agent-001 \
  | python3 -m json.tool
```

#### 4. Complete a Task
```bash
# Accept assignment
curl -X POST http://localhost:8000/api/v1/delegation/assignments/{assignment_id}/accept

# Complete assignment
curl -X POST http://localhost:8000/api/v1/delegation/assignments/{assignment_id}/complete \
  -H "Content-Type: application/json" \
  -d '{"actual_hours": 5.5}' | python3 -m json.tool
```

---

## 📱 Frontend Features

### Tabs
1. **Inbox (Capture + Scout)**
   - See all tasks
   - Capture new tasks with natural language
   - Search and filter

2. **Today (Hunter)**
   - Today's scheduled tasks
   - Energy-based task recommendations
   - Focus mode

3. **Progress (Mender + Mapper)**
   - Task completion stats
   - Productivity insights
   - Weekly/monthly views

### Key Components
- **BiologicalTabs**: Bottom navigation (Inbox, Today, Progress)
- **AsyncJobTimeline**: Visual chevron progress for long operations
- **TaskCards**: Swipeable task cards with actions
- **EnergyGauge**: Energy level visualization
- **ChevronStep**: Micro-step breakdown UI

---

## 🔍 Monitoring Progress

### Database Queries

#### Tasks by Status
```bash
.venv/bin/python -c "
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
db = EnhancedDatabaseAdapter('proxy_agents_enhanced.db')
conn = db.get_connection()
cursor = conn.cursor()
cursor.execute('SELECT status, COUNT(*) as count FROM tasks GROUP BY status')
for row in cursor.fetchall():
    print(f'{row[\"status\"]}: {row[\"count\"]} tasks')
"
```

#### Completed Tasks
```bash
.venv/bin/python -c "
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
db = EnhancedDatabaseAdapter('proxy_agents_enhanced.db')
conn = db.get_connection()
cursor = conn.cursor()
cursor.execute(\"SELECT title FROM tasks WHERE status = 'completed' ORDER BY completed_at DESC\")
print('Completed Tasks:')
for row in cursor.fetchall():
    print(f'  ✅ {row[\"title\"]}')
"
```

#### Progress by Wave
```bash
.venv/bin/python -c "
from src.database.enhanced_adapter import EnhancedDatabaseAdapter
db = EnhancedDatabaseAdapter('proxy_agents_enhanced.db')
conn = db.get_connection()
cursor = conn.cursor()

# Extract wave from task title (e.g., 'BE-01' -> Wave 2)
cursor.execute('''
    SELECT
        title,
        status,
        estimated_hours
    FROM tasks
    ORDER BY title
''')

waves = {}
for row in cursor.fetchall():
    task_id = row['title'].split(':')[0]  # Get 'BE-00' part
    # Map task IDs to waves (simplified)
    if task_id in ['BE-00']:
        wave = 1
    elif task_id in ['BE-01', 'BE-02', 'BE-03', 'BE-04', 'FE-01', 'FE-02', 'FE-03', 'FE-04', 'FE-05', 'FE-06', 'FE-07']:
        wave = 2
    else:
        wave = 3

    if wave not in waves:
        waves[wave] = {'total': 0, 'completed': 0, 'hours': 0}

    waves[wave]['total'] += 1
    if row['status'] == 'completed':
        waves[wave]['completed'] += 1
    waves[wave]['hours'] += row['estimated_hours'] or 0

for wave, stats in sorted(waves.items()):
    pct = (stats['completed'] / stats['total'] * 100) if stats['total'] > 0 else 0
    print(f\"Wave {wave}: {stats['completed']}/{stats['total']} tasks ({pct:.0f}%) - {stats['hours']:.0f}h\")
"
```

---

## 🧪 Development Workflow

### Adding New Tasks
```bash
# Via API
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Feature",
    "description": "Implement X",
    "priority": "high",
    "delegation_mode": "delegate",
    "estimated_hours": 4.0
  }'

# Via UI
# Use the Capture tab and type naturally:
# "Add a new feature to implement X, should take about 4 hours"
```

### Resetting Database
```bash
# WARNING: This deletes ALL data!
rm -f proxy_agents_enhanced.db
.venv/bin/python -m src.database.seeds.seed_development_tasks

# All 36 tasks are back!
```

---

## 🎨 Storybook (Component Development)

View and develop components in isolation:

```bash
cd frontend
pnpm storybook

# Open http://localhost:6006
```

**Available Component Stories:**
- AsyncJobTimeline - Chevron progress visualization
- BiologicalTabs - Bottom navigation
- TaskCards - Task card variants
- ChevronStep - Micro-step UI
- EnergyGauge - Energy visualization
- And 20+ more...

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is already in use
lsof -i :8000
kill -9 <PID>  # Kill existing process

# Check database exists
ls -lh proxy_agents_enhanced.db

# Recreate database if needed
rm proxy_agents_enhanced.db
.venv/bin/python -m src.database.seeds.seed_development_tasks
```

### Frontend Won't Start
```bash
cd frontend

# Reinstall dependencies
rm -rf node_modules .next
pnpm install

# Check if port 3000 is in use
lsof -i :3000
kill -9 <PID>

# Start dev server
pnpm dev
```

### Database Issues
```bash
# Check database integrity
sqlite3 proxy_agents_enhanced.db "PRAGMA integrity_check;"

# View all tables
sqlite3 proxy_agents_enhanced.db ".tables"

# Check task count
sqlite3 proxy_agents_enhanced.db "SELECT COUNT(*) FROM tasks;"
```

### API Not Responding
```bash
# Check API health
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs

# Check logs
# Look at Terminal 1 where uvicorn is running
```

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (when server running)
- **Delegation System README**: `src/services/delegation/README.md`
- **Database Schema**: `src/database/enhanced_adapter.py`
- **Seed Script**: `src/database/seeds/seed_development_tasks.py`
- **Frontend Components**: `frontend/src/components/`

---

## 🎯 Next Steps

1. **Mark BE-00 as Complete** in the UI (it's done!)
2. **Choose Next Task**: Pick from Wave 2 (BE-01 through FE-07)
3. **Use Delegation**: Delegate tasks to agents via UI or API
4. **Track Progress**: Monitor completion in Progress tab
5. **Iterate**: Use the app to manage building the app!

---

## 💡 Pro Tips

1. **Use DO_WITH_ME tasks for learning** - Work alongside Claude on complex features
2. **DELEGATE simpler tasks** - Let agents handle well-defined work
3. **Check Storybook** - Component UI is already partially built!
4. **Monitor energy** - The app tracks your energy levels for task recommendations
5. **Celebrate wins** - The app has celebration animations for completions!

---

**Happy Dogfooding! 🐕🎉**

You're now using the Proxy Agent Platform to build itself. Meta! 🤯
