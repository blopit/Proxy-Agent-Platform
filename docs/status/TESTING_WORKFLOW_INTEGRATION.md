# 🧪 Testing the Workflow Integration

## ✅ Quick Test Guide

### Prerequisites
Both servers should be running:
- **Backend:** http://localhost:8000 ✅ (Running in background)
- **Frontend:** http://localhost:3000 ✅ (Running in background)

---

## 🔍 Test 1: Workflow Browser in Scout Mode

### Steps:
1. Open http://localhost:3000/dogfood
2. Click **Scout Mode** (🔍 tab)
3. Find any task in the list (e.g., "BE-01: Task Delegation")
4. Click **🤖 Generate Steps with AI** button
5. **WorkflowBrowser modal** should open
6. Should see 3 workflows:
   - Backend API Feature (TDD)
   - Frontend Component (Storybook-First)
   - Systematic Bug Fix
7. Click on a workflow card to select it
8. Click **Generate Steps with AI** button

### Expected Result:
- ✅ Modal opens with workflows
- ✅ Workflows load from `/api/v1/workflows/` endpoint
- ✅ Filter buttons work (All, Backend, Frontend, Bug Fixes, Testing)
- ✅ Selection highlights the chosen workflow
- ✅ "Generate Steps" button is enabled when workflow is selected

### Debug Console Output:
Open browser DevTools (F12) → Console tab. You should see:
```
🚀 Executing workflow: backend_api_feature_tdd for task: <task_id>
📋 Task found: <task_title>
📤 Sending request to API: {...}
📥 API response status: 200
✅ Workflow execution response: {...}
💾 Setting workflow execution: {...}
```

---

## 🎯 Test 2: Workflow Execution in Hunter Mode

### Steps:
1. After generating steps in Scout Mode, the UI should:
   - Auto-assign the task to you (if not already assigned)
   - Switch to **Hunter Mode** (🎯 tab)
2. In Hunter Mode, you should see:
   - Task card at the top
   - **WorkflowContextDisplay** badges (energy, time, tests)
   - **WorkflowExecutionSteps** component with AI-generated steps
   - ChevronProgress visual tracker
   - Step details with TDD phases

### Expected Result:
- ✅ WorkflowContextDisplay shows compact badges
- ✅ WorkflowExecutionSteps displays all generated steps
- ✅ Each step shows:
  - Title
  - Description
  - Estimated time
  - TDD phase badge (🔴 RED, 🟢 GREEN, 🔵 REFACTOR)
  - Validation command (in code block)
  - Expected outcome
  - "Start Step" / "Mark Complete" buttons
- ✅ ChevronProgress shows current step highlighted
- ✅ Progress summary shows: X/Y steps, total time, percentage

### Debug Console Output:
```
🎯 Hunter Mode Debug: {
  currentAssignment: {...},
  currentTask: "<task_title>",
  currentWorkflowExecution: {...},
  hasWorkflow: true,
  workflowTaskMatch: true
}
```

---

## 🐛 Test 3: Fallback UI (No Workflow Generated)

### Steps:
1. Go to Scout Mode
2. Assign a task **WITHOUT** generating workflow steps (click "Assign to Me")
3. Switch to Hunter Mode

### Expected Result:
- ✅ Shows "No AI-Powered Steps Yet" card
- ✅ "🤖 Generate Steps with AI" button is visible
- ✅ Clicking button opens WorkflowBrowser modal
- ✅ Fallback ChevronProgress shows basic tracking

---

## 🔧 Test 4: Step Interaction

### Steps:
1. In Hunter Mode with workflow steps displayed
2. Click **"Start Step"** button on first step
3. Click **"Mark Complete"** button on the step
4. Observe the step status change
5. Notice the progress bar update

### Expected Result:
- ✅ Step status changes to "in_progress" when started
- ✅ Step status changes to "completed" when marked complete
- ✅ ChevronProgress updates to show completed step
- ✅ Progress percentage increases
- ✅ Current step indicator moves to next step

---

## 🌐 Test 5: API Endpoints Directly

### Test Backend API:

```bash
# 1. List all workflows
curl http://localhost:8000/api/v1/workflows/

# Expected: JSON array with 3 workflows

# 2. Get specific workflow
curl http://localhost:8000/api/v1/workflows/backend_api_feature_tdd

# Expected: Full workflow definition with TOML content

# 3. Execute workflow (requires ANTHROPIC_API_KEY in env)
curl -X POST http://localhost:8000/api/v1/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "backend_api_feature_tdd",
    "task_id": "test-123",
    "task_title": "Test Task",
    "task_description": "Testing workflow execution",
    "task_priority": "high",
    "estimated_hours": 4.0,
    "user_id": "shrenil",
    "user_energy": 2,
    "time_of_day": "morning",
    "codebase_state": {
      "tests_passing": 150,
      "tests_failing": 5
    },
    "recent_tasks": ["Completed BE-00"]
  }'

# Expected: JSON with execution_id, workflow_id, task_id, and steps array
```

---

## 🔍 Debugging Issues

### Issue 1: Workflow Browser Doesn't Open
**Symptoms:** Clicking "Generate Steps" does nothing

**Debug:**
1. Open browser DevTools → Console
2. Look for errors
3. Check if workflows loaded: `console.log(availableWorkflows)`

**Fix:**
- Check backend is running: `lsof -i :8000`
- Check API response: `curl http://localhost:8000/api/v1/workflows/`

---

### Issue 2: Steps Not Showing in Hunter Mode
**Symptoms:** Hunter Mode shows fallback UI instead of workflow steps

**Debug:**
1. Open browser DevTools → Console
2. Look for "🎯 Hunter Mode Debug:" logs
3. Check:
   - `hasWorkflow: true` (should be true)
   - `workflowTaskMatch: true` (should be true)
   - `currentWorkflowExecution` (should have steps array)

**Common Causes:**
- Workflow execution state not set properly
- Task ID mismatch between workflow and current task
- API request failed (check "📥 API response status" log)

**Fix:**
1. Check console logs for API errors
2. Verify ANTHROPIC_API_KEY is set in backend environment
3. Try generating steps again

---

### Issue 3: API Errors
**Symptoms:** Alert shows "Failed to generate workflow steps"

**Debug:**
1. Check backend logs:
```bash
# If backend is in background (shell ID: dea5c8)
# You can view logs with BashOutput tool or restart backend in foreground
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform
uv run uvicorn src.api.main:app --reload
```

2. Look for errors in backend console

**Common Errors:**
- **Missing API Key:** `ANTHROPIC_API_KEY not found`
  - Fix: Set environment variable: `export ANTHROPIC_API_KEY=your_key`
- **Invalid Workflow ID:** `Workflow not found`
  - Fix: Check workflow_id matches TOML filename
- **AI Generation Failed:** PydanticAI error
  - Fix: Check API key is valid, check network connection

---

### Issue 4: WorkflowBrowser Modal Stuck Open
**Symptoms:** Can't close the modal

**Debug:**
- Click backdrop (outside modal)
- Click X button in top-right
- Press ESC key

**Fix:**
- Refresh page if stuck

---

## 📊 Console Logs Cheat Sheet

### Successful Workflow Generation:
```
🚀 Executing workflow: backend_api_feature_tdd for task: BE-01
📋 Task found: Task Delegation System
📤 Sending request to API: {...}
📥 API response status: 200
✅ Workflow execution response: {execution_id: "...", steps: [...]}
💾 Setting workflow execution: {...}
✅ Task already assigned, switching to Hunter mode
🎯 Hunter Mode Debug: {hasWorkflow: true, workflowTaskMatch: true}
```

### Failed Workflow Generation:
```
🚀 Executing workflow: backend_api_feature_tdd for task: BE-01
📋 Task found: Task Delegation System
📤 Sending request to API: {...}
📥 API response status: 500
❌ API error: {"detail": "AI generation failed"}
```

---

## ✅ Test Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can open /dogfood page
- [ ] Can switch between Scout/Hunter/Mapper modes
- [ ] "Generate Steps" button visible in Scout Mode
- [ ] WorkflowBrowser modal opens
- [ ] Can see 3 workflows in browser
- [ ] Can select a workflow
- [ ] Can generate steps with AI
- [ ] Steps appear in Hunter Mode
- [ ] WorkflowContextDisplay shows badges
- [ ] WorkflowExecutionSteps displays steps
- [ ] Can start a step
- [ ] Can mark step complete
- [ ] ChevronProgress updates
- [ ] Can complete all steps
- [ ] Can complete task

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Try Different Workflows:**
   - Test "Frontend Component (Storybook-First)" workflow
   - Test "Systematic Bug Fix" workflow
   - Compare step counts for different energy levels

2. **Customize Workflows:**
   - Edit TOML files in `workflows/dev/`
   - Add your own workflow definitions
   - Adjust step counts, prompts, and phases

3. **Use for Real Tasks:**
   - Start dogfooding your actual development tasks
   - Follow AI-generated steps
   - Track completion
   - Iterate based on feedback

4. **Extend the System:**
   - Add more workflow templates
   - Persist workflow executions to database
   - Add real codebase state detection
   - Integrate with GitHub PRs

---

## 📞 Getting Help

If you encounter issues:

1. Check console logs (both browser and backend)
2. Verify servers are running
3. Check API key is set
4. Review error messages
5. Check network tab in DevTools

**Log Files:**
- Frontend console: Browser DevTools → Console
- Backend logs: Terminal running uvicorn

---

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Modal opens smoothly
- ✅ Workflows load from backend
- ✅ AI generates 5-8 steps (depending on energy)
- ✅ Steps display in Hunter Mode with full details
- ✅ Step completion tracking works
- ✅ Visual progress updates correctly
- ✅ No console errors

---

*Happy Testing! 🎉*
