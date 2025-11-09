# Auth & Onboarding Dogfooding Setup - Complete ✅

**Date**: 2025-11-07
**Status**: Ready for Testing
**Tasks Created**: 15 testing tasks
**Estimated Time**: ~4.4 hours

---

## 🎉 What's Been Set Up

### 1. Testing Tasks Database ✅

Created 15 trackable testing tasks in the dogfooding system:

| Category | Tasks | Estimated Time |
|----------|-------|----------------|
| **Authentication** | 4 tasks | 1.05 hours |
| **Onboarding Flow** | 7 tasks | 1.85 hours |
| **State Management** | 3 tasks | 0.75 hours |
| **End-to-End Integration** | 1 task | 0.75 hours |
| **Total** | **15 tasks** | **~4.4 hours** |

### 2. Task Details

#### Authentication Testing (AUTH-01 to AUTH-04)
- ✅ AUTH-01: Test Landing Screen (0.25h)
- ✅ AUTH-02: Test Login Screen (0.3h)
- ✅ AUTH-03: Test Signup Screen (0.3h)
- ✅ AUTH-04: Test OAuth Buttons (0.2h)

#### Onboarding Flow Testing (OB-01 to OB-07)
- ✅ OB-01: Test Welcome Screen (0.2h)
- ✅ OB-02: Test Work Preferences (0.25h)
- ✅ OB-03: Test ADHD Support Screen (0.3h)
- ✅ OB-04: Test Daily Schedule Screen (0.25h)
- ✅ OB-05: Test Productivity Goals Screen (0.35h)
- ✅ OB-06: Test ChatGPT Export Screen ⭐ (0.3h)
- ✅ OB-07: Test Completion Screen (0.2h)

#### State Management Testing (STATE-01 to STATE-03)
- ✅ STATE-01: Test OnboardingContext CRUD (0.3h)
- ✅ STATE-02: Test AuthContext Token Management (0.25h)
- ✅ STATE-03: Test AsyncStorage Persistence (0.2h)

#### Integration Testing (E2E)
- ✅ E2E: Test Complete User Journeys (0.75h)
  - New user: Signup → Onboarding → App
  - Returning user: Login → App
  - Skip flow: Signup → Skip → App

---

## 🚀 How to Start Testing

### Step 1: Start Backend API (Terminal 1)

```bash
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform
uvicorn src.api.main:app --reload --port 8000
```

**Expected Output:**
```
🚀 Proxy Agent Platform started
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Verify Testing Tasks

```bash
sqlite3 proxy_agents_enhanced.db "
  SELECT title, priority, estimated_hours
  FROM tasks
  WHERE project_id = 'auth-testing'
  ORDER BY title
"
```

**Expected Output:** 15 testing tasks listed

### Step 3: Register Yourself as Testing Agent

```bash
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "auth-tester-001",
    "agent_name": "Your Name",
    "agent_type": "frontend",
    "skills": ["react-native", "expo", "typescript", "testing", "mobile"],
    "max_concurrent_tasks": 3
  }'
```

**Expected Response:**
```json
{
  "capability_id": "...",
  "agent_id": "auth-tester-001",
  "is_available": true,
  ...
}
```

### Step 4: Start Mobile App (Terminal 2)

```bash
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform/mobile
npx expo start
```

Then press:
- **`i`** for iOS Simulator
- **`a`** for Android Emulator
- **Scan QR code** for physical device

---

## 📋 Testing Workflow

### 1. Pick a Task

```bash
# View all testing tasks
curl http://localhost:8000/api/v1/delegation/tasks | \
  python3 -c "import sys, json; tasks = json.load(sys.stdin); \
  [print(f\"{t['task_id'][:8]}... | {t['title']}\") \
  for t in tasks if t.get('project_id') == 'auth-testing']"
```

Or use SQL:
```bash
sqlite3 proxy_agents_enhanced.db "
  SELECT SUBSTR(task_id, 1, 8) as id, title
  FROM tasks
  WHERE project_id = 'auth-testing'
  AND status = 'todo'
  ORDER BY priority DESC, title
"
```

### 2. Assign Task to Yourself

```bash
# Get the task_id from above (full UUID)
TASK_ID="<paste-task-id-here>"

# Assign to yourself
RESPONSE=$(curl -X POST http://localhost:8000/api/v1/delegation/delegate \
  -H "Content-Type: application/json" \
  -d "{
    \"task_id\": \"$TASK_ID\",
    \"assignee_id\": \"auth-tester-001\",
    \"assignee_type\": \"human\",
    \"estimated_hours\": 0.25
  }")

echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['assignment_id'])"
```

**Copy the `assignment_id`** from the output!

### 3. Accept Assignment

```bash
ASSIGNMENT_ID="<paste-assignment-id-here>"

curl -X POST "http://localhost:8000/api/v1/delegation/assignments/$ASSIGNMENT_ID/accept"
```

**Expected:** Status changes to `in_progress`

### 4. Do the Testing Work

Open the task description:
```bash
sqlite3 proxy_agents_enhanced.db "
  SELECT description
  FROM tasks
  WHERE task_id = '$TASK_ID'
"
```

Follow the test steps in the description. Example for AUTH-01:
1. Launch mobile app (`npx expo start`)
2. Navigate to landing screen
3. Verify UI renders correctly
4. Test "Get Started" button
5. Test "I have an account" button
6. Check Solarized Dark theme

### 5. Complete the Task

```bash
# Replace with actual hours spent (e.g., 0.3 if it took 18 minutes)
ACTUAL_HOURS=0.3

curl -X POST "http://localhost:8000/api/v1/delegation/assignments/$ASSIGNMENT_ID/complete" \
  -H "Content-Type: application/json" \
  -d "{\"actual_hours\": $ACTUAL_HOURS}"
```

**Expected:** Status changes to `completed` 🎉

### 6. Repeat for Next Task

Continue with the next testing task!

---

## 📊 Track Your Progress

### View All Your Assignments

```bash
curl "http://localhost:8000/api/v1/delegation/assignments/agent/auth-tester-001" | \
  python3 -m json.tool
```

### View Pending Assignments

```bash
curl "http://localhost:8000/api/v1/delegation/assignments/agent/auth-tester-001?status=pending" | \
  python3 -m json.tool
```

### View Completed Assignments

```bash
curl "http://localhost:8000/api/v1/delegation/assignments/agent/auth-tester-001?status=completed" | \
  python3 -m json.tool
```

### Quick Stats

```bash
sqlite3 proxy_agents_enhanced.db "
SELECT
  status,
  COUNT(*) as count,
  ROUND(SUM(actual_hours), 1) as total_hours
FROM task_assignments
WHERE assignee_id = 'auth-tester-001'
GROUP BY status;
"
```

---

## 🎯 Recommended Testing Order

### Week 1: Core Components (2 hours)

**Day 1 - Authentication (1 hour)**
1. AUTH-01: Test Landing Screen (15 min)
2. AUTH-02: Test Login Screen (18 min)
3. AUTH-03: Test Signup Screen (18 min)
4. AUTH-04: Test OAuth Buttons (12 min)

**Day 2 - Onboarding Basics (1 hour)**
5. OB-01: Test Welcome Screen (12 min)
6. OB-02: Test Work Preferences (15 min)
7. OB-03: Test ADHD Support Screen (18 min)
8. OB-04: Test Daily Schedule Screen (15 min)

### Week 2: Advanced Features (1.5 hours)

**Day 3 - Goals & Export (1 hour)**
9. OB-05: Test Productivity Goals (21 min)
10. OB-06: Test ChatGPT Export ⭐ (18 min)
11. OB-07: Test Completion Screen (12 min)

**Day 4 - State Management (45 min)**
12. STATE-01: Test OnboardingContext (18 min)
13. STATE-02: Test AuthContext (15 min)
14. STATE-03: Test AsyncStorage (12 min)

### Week 3: Integration (1 hour)

**Day 5 - End-to-End (45 min)**
15. E2E: Test Complete User Journeys (45 min)

---

## 📝 Test Results Template

As you test, keep notes in this format:

```markdown
## AUTH-01: Test Landing Screen

**Tested**: 2025-11-07 14:30
**Result**: ✅ PASS

### What Worked:
- Landing screen renders in < 1 second
- All emojis and text display correctly
- "Get Started" navigates to signup
- "I have an account" navigates to login
- Solarized Dark theme applied

### Issues Found:
- None

### Time Taken: 0.2 hours (12 minutes)
```

---

## 🐛 Bug Tracking

If you find bugs during testing, create a GitHub issue with:

**Template:**
```markdown
## Bug: [Component] - [Issue]

**Task:** AUTH-01
**Priority:** High/Medium/Low
**Device:** iOS Simulator / Android Emulator / Physical Device

### Steps to Reproduce:
1. Step 1
2. Step 2
3. Step 3

### Expected Behavior:
What should happen

### Actual Behavior:
What actually happens

### Screenshots:
[Attach if possible]

### Proposed Fix:
[Optional]
```

---

## ✅ Success Metrics

**Goal**: Complete all 15 testing tasks

- [ ] **Phase 1**: All 4 AUTH tasks completed
- [ ] **Phase 2**: All 7 OB tasks completed
- [ ] **Phase 3**: All 3 STATE tasks completed
- [ ] **Phase 4**: E2E task completed
- [ ] **Phase 5**: Test results documented
- [ ] **Phase 6**: Bugs filed (if any)

**Definition of Done:**
- ✅ All 15 tasks assigned, tested, and completed
- ✅ Test results documented
- ✅ Bug tracking in place
- ✅ At least 90% pass rate on manual tests
- ✅ ChatGPT export feature validated ⭐

---

## 🔧 Troubleshooting

### API Not Responding

```bash
# Check if API is running
ps aux | grep uvicorn

# If not, start it
uvicorn src.api.main:app --reload --port 8000
```

### Expo Not Starting

```bash
# Clear Expo cache
npx expo start --clear

# Or reinstall dependencies
cd mobile
npm install
```

### Database Locked

```bash
# Close connections
pkill -f uvicorn
sqlite3 proxy_agents_enhanced.db "PRAGMA wal_checkpoint(TRUNCATE);"

# Restart API
uvicorn src.api.main:app --reload --port 8000
```

### Can't Find Tasks

```bash
# Re-seed tasks
uv run python -m src.database.seeds.seed_auth_testing_tasks

# Verify
sqlite3 proxy_agents_enhanced.db "
  SELECT COUNT(*) FROM tasks WHERE project_id = 'auth-testing'
"
# Should show: 15
```

---

## 📚 Related Documentation

- [AUTH_ONBOARDING_IMPLEMENTATION.md](./AUTH_ONBOARDING_IMPLEMENTATION.md) - Implementation details
- [DOGFOODING_GUIDE.md](../docs/guides/DOGFOODING_GUIDE.md) - Dogfooding methodology
- [START_DOGFOODING_NOW.md](../docs/guides/START_DOGFOODING_NOW.md) - Quick start guide

---

## 🎉 You're Ready to Start Testing!

1. ✅ Backend API running (`http://localhost:8000`)
2. ✅ 15 testing tasks in database
3. ✅ Mobile app ready (`npx expo start`)
4. ✅ Testing workflow documented

**Next Command:**
```bash
# Register yourself and start testing!
curl -X POST http://localhost:8000/api/v1/delegation/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "auth-tester-001",
    "agent_name": "Your Name",
    "agent_type": "frontend",
    "skills": ["react-native", "expo", "typescript", "testing", "mobile"],
    "max_concurrent_tasks": 3
  }'
```

Then assign your first task and start testing! 🚀

---

**Happy Dogfooding! 🐕**
