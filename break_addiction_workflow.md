# 🚨 Personal Addiction Recovery Workflow

**Created**: 2025-10-31
**Status**: ACTIVE INTERVENTION
**Your Task ID**: `231fa9cd-7752-43b0-b72c-ff3c90a9b5da`

---

## The Problem You're Experiencing

- Addictive scrolling/context-switching
- Feeling unproductive despite being "busy"
- Lost in hyperfocus on wrong things
- ADHD dopamine-seeking behavior overwhelming executive function

**This is EXACTLY what this platform was designed to fix.**

---

## Your Intervention Protocol (Next 24 Hours)

### Phase 1: IMMEDIATE (Next 1 Hour)

**🎯 Goal**: Complete ONE focused task using the platform

**Steps**:

1. **Open Dogfooding UI**: `http://localhost:3000/dogfood`

2. **Find Your Intervention Task**:
   - Look for "Break Addiction - ONE Focused Hour" (🔴 Critical)
   - Click to expand it

3. **Pick ONE Small Thing** (from your 53 existing tasks):
   ```bash
   # View your tasks:
   curl http://localhost:8000/api/v1/tasks | grep title

   # Pick the SMALLEST one you can finish in 1 hour
   ```

4. **Start Timer**:
   - Close ALL browser tabs except:
     - This task
     - Minimal reference docs
   - Put phone in another room
   - Set physical timer: 1 hour

5. **Work Rules**:
   - ✅ Work on the ONE thing
   - ✅ Use 2-second capture for distractions
   - ❌ No email
   - ❌ No social media
   - ❌ No "quick checks"

6. **Complete & Celebrate**:
   ```bash
   # When done:
   curl -X PATCH http://localhost:8000/api/v1/tasks/231fa9cd-7752-43b0-b72c-ff3c90a9b5da \
     -H "Content-Type: application/json" \
     -d '{"status": "completed", "actual_hours": 1.0}'

   # You'll feel AMAZING
   ```

### Phase 2: CALENDAR INTEGRATION (Today)

**Use the Google Calendar integration we just built:**

1. **Set Up OAuth** (5 minutes):
   ```bash
   # Get credentials from: https://console.cloud.google.com/
   # Enable Google Calendar API
   # Download to: credentials/credentials.json
   ```

2. **Create Time-Awareness** (3 minutes):
   ```python
   from src.integrations.google import GoogleAuthService, GoogleCalendarService
   from datetime import datetime, timedelta

   # Authenticate
   auth = GoogleAuthService()
   calendar = GoogleCalendarService(auth)

   # Get today's commitments
   today_events = calendar.get_today_events()

   # See what time you ACTUALLY have
   print(f"You have {len(today_events)} commitments today")
   for event in today_events:
       print(f"  {event.start_time.hour}:00 - {event.summary}")
   ```

3. **Block Focus Time** (2 minutes):
   ```python
   # Create "FOCUS BLOCK" events
   focus_start = datetime.now() + timedelta(hours=1)
   focus_end = focus_start + timedelta(hours=2)

   calendar.create_event(
       summary="🔒 FOCUS BLOCK - NO INTERRUPTIONS",
       start_time=focus_start,
       end_time=focus_end,
       description="Protected time. No meetings. No distractions. One task only."
   )
   ```

### Phase 3: ACCOUNTABILITY SYSTEM (Today)

**Use the delegation system for self-accountability:**

```bash
# 1. Register yourself as an "accountability agent"
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "human-shrenil-recovery",
    "agent_name": "Shrenil (Recovery Mode)",
    "agent_type": "general",
    "skills": ["focus", "single-tasking", "completion"],
    "max_concurrent_tasks": 1
  }'

# 2. Create DAILY focus task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "default-project",
    "title": "Daily Focus Session - '$(date +%Y-%m-%d)'",
    "description": "Complete 3 pomodoros (25min each) on ONE project task",
    "status": "pending",
    "priority": "critical",
    "category": "personal",
    "tags": ["daily-habit", "focus"],
    "estimated_hours": 1.5
  }'

# 3. Assign to yourself
TASK_ID=$(curl -s http://localhost:8000/api/v1/tasks | python3 -c "import sys,json; tasks=json.load(sys.stdin); print([t['task_id'] for t in tasks if 'Daily Focus' in t['title']][0])")

curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d "{
    \"task_id\": \"$TASK_ID\",
    \"assignee_id\": \"human-shrenil-recovery\",
    \"assignee_type\": \"human\",
    \"estimated_hours\": 1.5
  }"
```

---

## The Science: Why This Works for ADHD

### 1. **External Working Memory**
- ADHD brains struggle with working memory
- The platform becomes your external brain
- Captures thoughts so you can focus

### 2. **Dopamine Replacement**
- Scrolling = instant dopamine
- Task completion = BETTER dopamine
- Gamification = sustainable reward system

### 3. **Reduced Decision Fatigue**
- ADHD = exhausting micro-decisions
- Platform tells you: "Do THIS next"
- Removes paralysis of choice

### 4. **Time Awareness**
- ADHD = time blindness
- Calendar integration shows REALITY
- Creates urgency without anxiety

### 5. **Accountability Without Shame**
- Traditional systems = guilt when failing
- This system = "Here's what's next"
- Progress over perfection

---

## Daily Rituals (Using This Platform)

### Morning (10 minutes)

```bash
# 1. What's already committed?
python3 -c "
from src.integrations.google import GoogleAuthService, GoogleCalendarService
auth = GoogleAuthService()
cal = GoogleCalendarService(auth)
events = cal.get_today_events()
print(f'📅 You have {len(events)} events today')
for e in events:
    print(f'  {e.start_time.hour:02d}:00 - {e.summary}')
"

# 2. How much ACTUAL free time?
# [See the gaps in your calendar]

# 3. Pick ONE task for those gaps
curl http://localhost:8000/api/v1/tasks?status=pending&limit=5

# 4. Commit to it (assign to yourself)
```

### During Work (Every hour)

- **When distracted**: 2-second capture
- **After completing**: Mark task as done
- **Feeling stuck**: Check next task in queue

### Evening (5 minutes)

```bash
# Review what you ACTUALLY did
curl "http://localhost:8000/api/v1/delegation/assignments/agent/human-shrenil-recovery?status=completed"

# Celebrate completions (no matter how small)

# Plan tomorrow's ONE focus task
```

---

## Emergency Interventions

### When You're Spiraling

**1. The 5-Minute Reset**:
```bash
# Close EVERYTHING
# Open ONLY the dogfooding UI
# Look at ONE task
# Set timer: 5 minutes
# Work on that task for JUST 5 minutes
# Give yourself permission to quit after 5 minutes
# (You won't - momentum will carry you)
```

**2. The Capture Dump**:
```bash
# Open Quick Capture
# Brain dump ALL distractions
# Every tab you want to open
# Every "I should check..."
# Every "What if..."
#
# Then close the UI and work
```

**3. The Calendar Reality Check**:
```bash
# Look at your calendar
# See what time you ACTUALLY have
# Accept you can't do everything TODAY
# Pick the ONE most important thing
# Do that
```

---

## Metrics to Track

**Success is NOT:**
- ❌ Completing 20 tasks
- ❌ Working 12 hours
- ❌ Perfect productivity

**Success IS:**
- ✅ ONE focused hour per day
- ✅ Completing tasks you START
- ✅ Using the capture system instead of context-switching
- ✅ Feeling LESS anxious at end of day

---

## Your Challenge for Next 7 Days

**Use this platform to manage your recovery from addiction:**

### Day 1 (TODAY):
- [ ] Complete the 1-hour intervention task
- [ ] Set up Google Calendar OAuth
- [ ] Create 3 focus blocks for tomorrow

### Days 2-7:
- [ ] Daily: ONE focus session (tracked in platform)
- [ ] Daily: Review calendar before starting work
- [ ] Daily: Use 2-second capture instead of context-switching
- [ ] Evening: Mark completed tasks

### Week 1 Success Metric:
**Complete 5 out of 7 daily focus sessions**

---

## Why This Will Work

You built this platform because you understand ADHD deeply.

Now USE what you built.

The irony: You've created the perfect tool for your own recovery, and now you need to trust it.

**The platform can't force you to use it.**
**But when you do use it, it WILL work.**

Because you designed it to work. For people exactly like you.

---

**Start now. One hour. One task. Use what you built.**

🚀 Task ID: `231fa9cd-7752-43b0-b72c-ff3c90a9b5da`

Go to: http://localhost:3000/dogfood

---
