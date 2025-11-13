# The Beast Loop: Gamified AI-Augmented Task Execution System

## Overview

The Beast Loop is a dopamine-optimized, swipe-driven productivity system that transforms task management into an engaging game where you train your AI twin and orchestrate digital agents through intuitive gestures.

> **Core Philosophy**: You're not "doing tasks." You're *training your AI twin* and *orchestrating an empire of digital agents* with swipe gestures. You're choosing how your digital self evolves.

---

## 🖐️ Enhanced Swipe Action Mapping

### Primary Gestures

| Swipe Direction    | Action                        | Why                                                  | Backend                                  |
| ------------------ | ----------------------------- | ---------------------------------------------------- | ---------------------------------------- |
| **⬆️ Swipe Up**    | **DO now**                    | Matches "take action" gesture (up = rise to action)  | `POST /api/v1/dogfood/tasks/{id}/execute` |
| **⬅️ Swipe Left**  | **Dismiss / Archive**         | Universal meaning for skip/delete                    | `POST /api/v1/dogfood/tasks/{id}/archive` |
| **➡️ Swipe Right** | **Delegate to agent**         | "Pass it along" gesture (like Tinder match = assign) | `POST /api/v1/dogfood/tasks/{id}/delegate` |
| **⬇️ Swipe Down**  | **Drill down / Get help**     | Pull for details, or start co-focus session          | Opens DO Screen expansion                |
| **Double Tap**     | **Quick Capture Follow-up**   | Spawns related task ("Split it" or "Add context")    | `POST /api/v1/tasks/quick-capture`       |
| **Long Press**     | **Bookmark / Save for Later** | Adds to "Later Stack" or Priority Stack              | `PUT /api/v1/tasks/{id}/priority`        |

### Contextual Swipe Intelligence

The system adapts swipe behavior based on task and user state:

```python
# Example: Energy-aware swipe suggestions
if task.duration > 15 and user.energy == "low":
    swipe_down_action = "suggest_delegate"  # Recommend delegation
elif task.complexity == "high" and user.focus_streak > 3:
    swipe_up_action = "do_with_coach"  # AI-assisted mode
else:
    swipe_up_action = "do_solo"  # Standard focus mode
```

---

## 🧬 Agent Integration Flow

Each swipe triggers intelligent backend logic:

```python
# Swipe Up (DO)
@router.post("/tasks/{task_id}/execute")
async def execute_task(task_id: str, mode: ExecutionMode):
    if mode == "assisted":
        return await workflow_executor.start_assisted(task_id)
    else:
        return await focus_proxy_agent.begin_session(task_id)

# Swipe Right (DELEGATE)
@router.post("/tasks/{task_id}/delegate")
async def delegate_task(task_id: str, agent_id: Optional[str] = None):
    if agent_id:
        return await delegation_service.assign(task_id, agent_id)
    else:
        return await delegation_service.auto_assign_best_agent(task_id)

# Swipe Left (ARCHIVE)
@router.post("/tasks/{task_id}/archive")
async def archive_task(task_id: str, reason: ArchiveReason):
    await task_service.archive(task_id, reason)
    await gamification_service.award_clarity_xp(user_id, +3)
    return {"status": "archived", "xp_earned": 3}

# Swipe Down (HELP/SPLIT)
@router.post("/tasks/{task_id}/split")
async def split_task(task_id: str):
    return await split_proxy_agent.generate_subtasks(task_id)
```

---

## 💥 The Beast Loop Phases: Daily Ritual Structure

### Phase 1: Morning Spawn (7-9am) 🌅

**Goal**: Capture everything in your head, let AI categorize

```
User Action          → Backend Flow                    → Agent
──────────────────────────────────────────────────────────────
/quick-capture       → POST /api/v1/capture/voice     → Scout Agent
"Write blog post"    → task_proxy_agent.categorize()  → assigns category, energy, time
Voice notes          → speech_to_text + AI parsing    → creates structured tasks
```

**Output**: Clean task queue with energy labels, time estimates, and AI recommendations

### Phase 2: Swipe Loop (Hunter Mode) 🎯

**Goal**: Rapid triage through swiping, enter flow state

```
SwipeUp (DO)         → Enters Focus Session
  ├─ Do With Me      → workflow_executor.start_assisted()
  └─ Do Solo         → focus_timer.start_pomodoro(25)

SwipeRight (DELEGATE) → delegation_service.assign_to_agent()
  └─ Agent executes  → Real-time progress updates via WebSocket

SwipeLeft (ARCHIVE)   → task.status = "archived"
  └─ Logs decision   → Used for future AI learning
```

**Gamification Triggers**:
- Swipe combo (3+ in a row) → Combo bonus +12 XP
- Fast decision (<2s) → "Quick Thinker" badge progress
- Delegate streak → "Twin Power increased" notification

### Phase 3: Mender Midday (2-4pm) 🌱

**Goal**: Reflect, clear backlog, rebuild momentum

```
User Action              → Backend Flow                   → Result
──────────────────────────────────────────────────────────────────
Review completed tasks   → GET /api/v1/progress/today     → XP earned, streaks
Clear easy wins          → Filter: energy=low, time<15min → Quick dopamine hits
Redeem achievements      → POST /api/v1/gamification/unlock → Visual rewards
```

**Mender Agent Actions**:
- Identifies blocked tasks
- Suggests task re-prioritization
- Offers "small wins" for momentum recovery

### Phase 4: Closure Night (7-9pm) 🌒

**Goal**: Celebrate progress, plan tomorrow, evolve Twin

```
User Action              → Backend Flow                    → Output
───────────────────────────────────────────────────────────────────
Daily retro              → GET /api/v1/progress/summary    → Stats dashboard
Capture insights         → POST /api/v1/capture/reflection → Learnings stored
Twin evolution           → gamification_service.calculate_twin_growth() → Visual update
```

**Twin Evolution Mechanics**:
```python
# Example Twin evolution based on swipe patterns
daily_stats = {
    "swipe_up_count": 12,    # DO actions
    "swipe_right_count": 8,  # Delegations
    "swipe_left_count": 3,   # Archives
    "focus_time_minutes": 180,
    "tasks_completed": 10
}

# AI analyzes patterns
twin_feedback = await twin_evolution_agent.analyze_daily_patterns(daily_stats)
# Returns: "You delegated 8 tasks today. Your Twin is becoming a master orchestrator."
```

---

## 🎮 XP & Gamification System

### Action Rewards

| Action                              | XP        | Gamification Feedback              |
| ----------------------------------- | --------- | ---------------------------------- |
| DO task (completed)                 | +10-50 XP | Level-up bar wiggle, sound, emoji  |
| Delegate to agent                   | +5 XP     | "Twin Power increased"             |
| Split + start microtask             | +8 XP     | "Small Wins bonus activated"       |
| Archive after analysis              | +3 XP     | "Clarity streak continued"         |
| Swipe combo (e.g. up → right → tap) | +12 XP    | Combo bonus "Proxy Flow x3"        |
| Complete focus session (Pomodoro)   | +15 XP    | "Deep Work Master" badge progress  |
| Morning ritual completed            | +20 XP    | "Early Bird" streak +1             |

### Backend Implementation

```python
@router.post("/tasks/{task_id}/complete")
async def complete_task(task_id: str, focus_time_minutes: int):
    task = await task_service.get(task_id)

    # Base XP
    base_xp = 10

    # Time bonus (deeper work = more XP)
    time_bonus = min(focus_time_minutes, 60)  # Cap at 60 bonus XP

    # Streak multiplier
    streak_multiplier = await gamification_service.get_streak_multiplier(user_id)

    total_xp = (base_xp + time_bonus) * streak_multiplier

    await gamification_service.award_xp(user_id, total_xp)
    await progress_service.log_completion(task_id, focus_time_minutes)

    return {
        "xp_earned": total_xp,
        "new_total_xp": user.total_xp,
        "level": user.level,
        "next_level_xp": calculate_next_level_xp(user.level),
        "streaks": {
            "daily": user.daily_streak,
            "focus": user.focus_streak
        }
    }
```

---

## 🗂 Task Stacks: View Modes

The system intelligently organizes tasks into contextual stacks:

| Stack               | Description                                       | Filter Logic                                |
| ------------------- | ------------------------------------------------- | ------------------------------------------- |
| **Now Stack**       | Tasks matched to current energy + time            | `energy <= user.current_energy AND time < user.available_minutes` |
| **Hunter Stack**    | High value, mid difficulty                        | `priority = high AND difficulty = medium`   |
| **Delegate Stack**  | Best for AI execution                             | `ai_delegation_score > 0.75`                |
| **Easy Wins Stack** | To rebuild streak/momentum                        | `energy = low AND time < 15 AND completion_rate > 0.9` |
| **Hidden Tasks**    | Locked until energy > threshold or streak resumes | `requires_energy > user.current_energy OR requires_streak > user.streak` |

### Backend Stack API

```python
@router.get("/tasks/stacks/{stack_name}")
async def get_task_stack(
    stack_name: StackType,
    user_id: str = Depends(get_current_user)
):
    user_state = await energy_service.get_current_state(user_id)

    if stack_name == "now":
        return await task_service.filter(
            energy__lte=user_state.current_energy,
            estimated_minutes__lte=user_state.available_minutes,
            status="todo"
        )
    elif stack_name == "delegate":
        tasks = await task_service.get_all_todo(user_id)
        scored_tasks = await delegation_service.score_for_delegation(tasks)
        return [t for t in scored_tasks if t.delegation_score > 0.75]
    # ... other stacks
```

---

## 🧱 Swipe Tile Structure (UI/UX)

Each task card displays:

```tsx
interface TaskCardProps {
  task: Task;
  onSwipe: (direction: SwipeDirection) => void;
}

<TaskCard>
  <Header>
    <Title>{task.title}</Title>
    <EstimatedDuration>{task.estimated_minutes}m</EstimatedDuration>
  </Header>

  <Body>
    <EnergyBar level={task.energy_cost} />
    <XPReward amount={task.xp_reward} />
    <AgentRecommendationBadge>
      {task.ai_recommendation === "delegate" && "⚡ Best to DELEGATE"}
      {task.energy_cost === "low" && "🌿 Good for low energy"}
      {task.complexity === "high" && "🤝 Good for co-focus"}
    </AgentRecommendationBadge>
  </Body>

  <Footer>
    <SwipeHints>
      <Corner position="left">📦 Archive</Corner>
      <Corner position="up">🚀 DO</Corner>
      <Corner position="right">🤖 Delegate</Corner>
      <Corner position="down">🔍 Split</Corner>
    </SwipeHints>
    <QuickAction onClick={() => openSplitModal()}>
      Split Now
    </QuickAction>
  </Footer>
</TaskCard>
```

---

## 🧭 Meta System: Agent Evaluator Feedback

### Nightly Reflection Agent

Every night at 9pm, the system runs an evaluation:

```python
@router.get("/meta/daily-evaluation")
async def get_daily_evaluation(user_id: str):
    daily_stats = await progress_service.get_daily_stats(user_id)

    evaluation = await meta_evaluation_agent.analyze_patterns(daily_stats)

    # Example outputs:
    # "You delegated 8 tasks today. Your Twin now prioritizes research over chores."
    # "You swiped up 6x on creative tasks. Unlocking [Creative Flow Agent]."
    # "You're stuck on 3 planning tasks. Mender Agent recommends a Focus Block."

    return {
        "insights": evaluation.insights,
        "unlocked_agents": evaluation.new_agents,
        "suggested_actions": evaluation.recommendations,
        "twin_evolution_summary": evaluation.twin_changes
    }
```

### Twin Personality Evolution

The system tracks swipe patterns to evolve the Twin's personality:

```python
class TwinPersonality(BaseModel):
    delegation_preference: float  # 0-1 (0=do_everything, 1=delegate_everything)
    focus_time_preference: int    # Average preferred session length
    energy_patterns: dict         # When user is most productive
    task_type_affinity: dict      # Which types of tasks user enjoys

async def update_twin_personality(user_id: str, daily_stats: DailyStats):
    twin = await twin_service.get(user_id)

    # Update delegation preference based on swipe right frequency
    delegation_ratio = daily_stats.delegate_count / daily_stats.total_swipes
    twin.delegation_preference = (twin.delegation_preference * 0.8) + (delegation_ratio * 0.2)

    # Learn focus time patterns
    avg_session = daily_stats.total_focus_minutes / daily_stats.focus_sessions
    twin.focus_time_preference = (twin.focus_time_preference * 0.7) + (avg_session * 0.3)

    await twin_service.update(twin)

    return {
        "message": f"Your Twin learned that you prefer {int(twin.focus_time_preference)}min focus sessions",
        "personality_update": twin.dict()
    }
```

---

## 🎯 Daily Mission System

### Today's Power Move

Show users their highest-impact action:

```python
@router.get("/gamification/daily-power-move")
async def get_daily_power_move(user_id: str):
    actions = await progress_service.get_today_actions(user_id)

    # Calculate impact scores
    scored_actions = []
    for action in actions:
        impact_score = calculate_impact(
            xp_earned=action.xp,
            time_saved=action.time_saved_by_delegation,
            complexity_tackled=action.task_complexity,
            streak_maintained=action.maintained_streak
        )
        scored_actions.append((action, impact_score))

    top_action = max(scored_actions, key=lambda x: x[1])

    return {
        "power_move": format_power_move(top_action[0]),
        "impact_score": top_action[1],
        "message": "Your highest-value swipe today was RIGHT → DELEGATE → @ResearchAgent"
    }
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Swipe Mechanics ✅ (COMPLETE)

- [x] Backend dogfooding API routes
- [x] Archive, delegate, execute endpoints
- [x] Focus session management
- [x] Router registered in main.py

### Phase 2: Enhanced Swipe System (Next)

- [ ] Implement swipe down (split task)
- [ ] Add double-tap quick capture
- [ ] Long-press bookmark/priority
- [ ] Contextual swipe intelligence

### Phase 3: Gamification Engine

- [ ] XP calculation system
- [ ] Streak tracking
- [ ] Combo detection
- [ ] Level progression
- [ ] Badge/achievement system

### Phase 4: Twin Evolution

- [ ] Personality tracking
- [ ] Pattern analysis agent
- [ ] Daily evaluation system
- [ ] Visual Twin representation

### Phase 5: Frontend Components

- [ ] SwipeableTaskCard component
- [ ] Energy-based stack filtering
- [ ] XP progress animations
- [ ] Twin evolution UI

### Phase 6: Polish & Dogfooding

- [ ] Haptic feedback
- [ ] Sound effects
- [ ] Emoji reactions
- [ ] Daily mission UI
- [ ] Power move highlights

---

## 🔧 API Endpoints Summary

### Task Actions
```
POST /api/v1/dogfood/tasks/{id}/archive      # Swipe Left
POST /api/v1/dogfood/tasks/{id}/delegate     # Swipe Right
POST /api/v1/dogfood/tasks/{id}/execute      # Swipe Up (DO)
POST /api/v1/dogfood/tasks/{id}/split        # Swipe Down
POST /api/v1/dogfood/tasks/{id}/start-solo   # DO Solo mode
```

### Gamification
```
GET  /api/v1/gamification/daily-power-move   # Today's best action
GET  /api/v1/gamification/streaks            # Current streaks
POST /api/v1/gamification/award-xp           # Award XP for action
GET  /api/v1/gamification/leaderboard        # Twin evolution ranking
```

### Stacks & Filtering
```
GET /api/v1/tasks/stacks/now                 # Energy-matched tasks
GET /api/v1/tasks/stacks/hunter              # High-value tasks
GET /api/v1/tasks/stacks/delegate            # AI-recommended tasks
GET /api/v1/tasks/stacks/easy-wins           # Quick momentum builders
```

### Meta & Evolution
```
GET /api/v1/meta/daily-evaluation            # Nightly reflection
GET /api/v1/meta/twin-personality            # Current Twin state
GET /api/v1/meta/pattern-insights            # AI-detected patterns
```

---

## 🎨 Design Principles

### Dopamine Engineering

1. **Instant Feedback**: Every swipe triggers immediate visual/haptic response
2. **Variable Rewards**: XP ranges create excitement (10-50 XP vs fixed 10)
3. **Progress Visibility**: Always show next level, next badge, next unlock
4. **Social Proof**: Twin evolution acts as "future self" motivation
5. **Loss Aversion**: Streak counters create commitment

### ADHD Optimization

1. **Reduce Decision Fatigue**: AI pre-filters tasks by energy
2. **Short Feedback Loops**: Pomodoro (25min) max for focus sessions
3. **Novelty**: Daily power move changes each day
4. **Gamification**: XP/levels provide external motivation structure
5. **Flexibility**: Multiple execution modes (solo, assisted, delegated)

---

## 💡 Example User Story

**Morning (8am)**:
- User opens app, sees "Morning Spawn" prompt
- Voice captures: "Write blog post, email Sarah, review PR #42"
- Scout Agent categorizes: writing=30min/medium-energy, email=5min/low-energy, code-review=20min/high-energy

**Hunter Mode (10am)**:
- User has high energy → System shows "Hunter Stack"
- Swipes Right on blog post → Delegates to Writing Agent
- Swipes Up on code review → Opens DO Screen → "Do With Me" → Workflow starts
- Swipes Left on email → Archives for low-energy afternoon

**Midday (2pm)**:
- Energy drops → System automatically shows "Easy Wins Stack"
- User completes 3 quick tasks (5min each)
- Earns "Momentum Recovery" badge
- XP combo bonus: +18 XP

**Evening (8pm)**:
- Daily evaluation runs
- Insight: "You delegated 3 writing tasks. Your Twin is becoming a Content Strategist."
- Visual: Twin avatar gains "Quill" accessory
- Tomorrow's suggestion: "Try Do With Me mode for technical tasks"

---

This system transforms productivity into an engaging game where every action trains your AI twin and brings you closer to your ideal self.
