# Progressive Onboarding Data Strategy

**Status**: 🟢 Strategic Brainstorm - Ready for Implementation
**Target Users**: Neurodivergent community (ADHD, autism, dyslexia, etc.)
**Approach**: Progressive onboarding - start minimal, learn over time
**Last Updated**: November 10, 2025

---

## 🎯 Executive Summary

### Vision
Build a **truly personalized** productivity platform that adapts to neurodivergent needs through progressive data collection. Start with minimal onboarding (5-7 questions), then progressively collect deeper preferences as users engage with the platform.

### Platform Goals
- **ADHD task management**: Reduce overwhelm, improve task initiation, manage time blindness
- **General productivity**: Optimize workflows for all users
- **AI task delegation**: Let AI agents handle decisions and tasks
- **Personal workflow optimization**: Learn unique patterns and adapt

### Key Personalization Dimensions
1. **Task complexity**: How much to break down tasks, level of detail
2. **Timing & scheduling**: When to show tasks, send reminders, suggest breaks
3. **AI agent behavior**: How agents communicate, suggest, make decisions
4. **UI/UX adaptations**: Visual design, information density, sensory considerations

### Current State
✅ **Phase 1 Complete**: Collecting basic preferences (5-7 questions, 2-3 min)
- Work preference
- ADHD support level
- ADHD challenges
- Daily schedule
- Productivity goals

🔴 **Gap**: Data is collected but not yet used (see `ONBOARDING_INTEGRATION.md`)

---

## 📊 Progressive Onboarding Phases

### Philosophy: Learn Through Usage

Instead of overwhelming users with 20+ questions upfront:
1. **Start minimal** (Phase 1): Collect enough to begin basic personalization
2. **Observe behavior** (Weeks 1-2): Watch how user interacts with app
3. **Progressive prompts** (Phases 2-4): Ask for more details as user engages
4. **Learn then confirm** (Ongoing): AI forms hypotheses, asks user to confirm

---

## 📋 Phase 1: Initial Onboarding (CURRENT) ✅

**When**: First app open, before entering main app
**Duration**: 2-3 minutes
**Questions**: 5-7 quick questions
**Completion Rate Target**: 90%+

### Currently Collected Data

| Data Point | Type | Purpose | Used By |
|------------|------|---------|---------|
| **Work Preference** | Single-select | Task scheduling, focus modes | Scheduler, AI agents |
| | Options: Remote, Hybrid, Office, Flexible | | |
| **ADHD Support Level** | Scale (1-10) | UI adaptations, task granularity | UI, Decomposer Agent |
| | 1 = minimal support, 10 = maximum support | | |
| **ADHD Challenges** | Multi-select | Feature personalization | Multiple features |
| | Options: Starting tasks, Focus, Time awareness, Organization, Procrastination, Overwhelm, Transitions, Completion | | |
| **Daily Schedule** | Time grid | Reminder timing, availability tracking | Scheduler, Notifications |
| | Fields: Time preference, Start/end times, Weekly availability, Flexible toggle | | |
| **Productivity Goals** | Multi-select | Metric tracking, feature recommendations | Analytics, Gamification |
| | Options: Task completion, Focus time, Project delivery, Habit building, Work-life balance, Creative output, Learning, Other | | |

### Phase 1 Status
- ✅ Backend: Fully implemented, tested
- ✅ Frontend: 7-screen flow, state management working
- ✅ Storage: SQLite table created, API working
- 🔴 Usage: Data not yet consumed by features (see `ONBOARDING_INTEGRATION.md`)

---

## 🌱 Phase 2: After First Week

**Trigger**: User completes 5-7 tasks
**Timing**: After ~1 week of usage
**Prompt**: "We've noticed you're getting the hang of things! Want to personalize your experience further?"
**Duration**: 1-2 minutes
**Questions**: 3-4 questions
**Skippable**: Yes (ask again in 1 week)

### Goals
- Personalize AI agent communication and tone
- Understand energy patterns for better scheduling
- Optimize task breakdown based on user's capacity

---

### 1. Neurodivergent Communication Preferences

**Purpose**: Adapt how AI agents communicate with the user

#### Question 1.1: Communication Style
*"How do you prefer the AI assistant to communicate with you?"*

**Options** (single-select):
- **Direct & concise**
  - Description: Minimal text, straight to the point
  - Best for: Users who get overwhelmed by too much text
  - Example: "Next task: Call dentist (5 min)"

- **Supportive & encouraging**
  - Description: Gentle, positive framing with emotional support
  - Best for: Users who benefit from encouragement
  - Example: "Great job on your last task! Ready to tackle calling the dentist? It'll only take 5 minutes."

- **Analytical & detailed**
  - Description: Thorough explanations and reasoning
  - Best for: Users who want to understand the "why"
  - Example: "I'm suggesting you call the dentist next because: (1) it's time-sensitive, (2) it's a quick 5-min task, (3) getting it done early reduces your afternoon task load."

- **Casual & friendly**
  - Description: Conversational, relaxed tone
  - Best for: Users who prefer informal interaction
  - Example: "Hey! How about knocking out that dentist call? Should be super quick - 5 mins tops."

**Storage**: `communication_style` (TEXT)
**Impact**: Affects all AI agent message generation

---

#### Question 1.2: Feedback Preference
*"When would you like feedback on your progress?"*

**Options** (single-select):
- **Immediate feedback**
  - Description: Tell me right away if something's off
  - Behavior: Real-time notifications when user falls behind or misses tasks

- **End-of-day summary**
  - Description: Digest at end of day
  - Behavior: Single notification at user's evening time with daily recap

- **Weekly review**
  - Description: Let me focus, review weekly
  - Behavior: Sunday evening or Monday morning weekly summary

- **I'll ask when I need it**
  - Description: No automatic feedback
  - Behavior: Only show stats if user explicitly opens dashboard

**Storage**: `feedback_timing` (TEXT)
**Impact**: When and how often to show progress/feedback

---

#### Question 1.3: Uncertainty Handling
*"When the AI isn't sure about something (like which task to prioritize), what should it do?"*

**Options** (single-select):
- **Give me options to choose from**
  - Description: Show 2-3 choices, let me decide
  - Behavior: "Which should I prioritize: A, B, or C?"

- **Make a best guess and let me override**
  - Description: AI decides, I can change it
  - Behavior: "I scheduled A first. Change it?"

- **Always ask before assuming**
  - Description: Never make decisions without me
  - Behavior: Pause and ask for every uncertain decision

**Storage**: `uncertainty_handling` (TEXT)
**Impact**: AI agent autonomy level, decision-making flow

---

### 2. Energy & Capacity Patterns

**Purpose**: Schedule tasks during peak energy, respect capacity limits

#### Question 2.1: Energy Pattern
*"Which best describes your daily energy pattern?"*

**Options** (single-select with illustrations):
- **Consistent throughout day**
  - Chart: Flat line
  - Behavior: Schedule evenly, no peak optimization

- **Morning person**
  - Chart: High AM, declining through day
  - Behavior: Schedule hard tasks before noon, easy tasks PM

- **Night owl**
  - Chart: Low AM, rising through evening
  - Behavior: Schedule light tasks AM, hard tasks after 2 PM

- **Roller coaster**
  - Chart: Unpredictable ups and downs
  - Behavior: Let user mark energy level daily, schedule accordingly

**Storage**: `energy_pattern` (TEXT)
**Impact**: Task scheduling, reminder timing

---

#### Question 2.2: Daily Task Capacity
*"How many tasks can you realistically complete in a productive day?"*

**Options** (single-select):
- **1-3 tasks**: Deep focus, quality over quantity
- **4-6 tasks**: Balanced approach
- **7-10 tasks**: High capacity, many small tasks
- **10+ tasks**: Very high capacity or very small tasks
- **It varies a lot**: Different every day

**Storage**: `daily_task_capacity` (INTEGER or TEXT)
**Impact**: Daily task suggestions, overwhelm prevention

---

#### Question 2.3: Task Size Preference
*"Would you rather have..."*

**Options** (single-select):
- **Few big tasks** (2-3 substantial tasks per day)
- **Many small tasks** (8-10 quick wins per day)
- **Mix of both** (balance of big and small)

**Storage**: `task_size_preference` (TEXT)
**Impact**: How tasks are presented and grouped

---

#### Question 2.4: Burnout Sensitivity
*"How carefully do you need to manage energy to avoid burnout?"*

**Options** (single-select):
- **Low** - I can push hard consistently
- **Medium** - I need regular breaks and downtime
- **High** - I need to be very careful about overcommitting
- **Very high** - I'm currently recovering from burnout

**Storage**: `burnout_sensitivity` (TEXT)
**Impact**: Workload limits, mandatory breaks, warning thresholds

---

### 3. Task Breakdown Preferences

**Purpose**: Optimize how AI decomposes tasks into steps

#### Question 3.1: Task Initiation Difficulty
*"What's your biggest challenge with tasks?"*

**Options** (single-select):
- **Starting tasks**
  - "Getting started is my biggest challenge"
  - Behavior: AI creates tiny, specific first steps (2-5 min)
  - Example: "Open laptop" → "Open Google Docs" → "Type task title"

- **Maintaining momentum**
  - "I can start, but lose momentum midway"
  - Behavior: AI adds checkpoints and celebration points
  - Example: Step 3 of 7: ✓ "Take a 2-min break before continuing"

- **Complex tasks**
  - "I start easily but struggle with complex tasks"
  - Behavior: AI provides more structure and sub-steps for complex items

- **Other challenges**
  - "Starting isn't my main challenge"
  - Behavior: Standard task breakdown

**Storage**: `task_initiation_difficulty` (TEXT)
**Impact**: Decomposer Agent step granularity, first-step size

---

#### Question 3.2: Preferred Step Size
*"How granular should task steps be?"*

**Visual slider with examples**:

**Options** (scale 1-4):
1. **Tiny steps** (5-10 min each, very specific)
   - Example: "Reply to Sarah's email" →
     - Open email app
     - Find Sarah's message
     - Click reply
     - Type greeting
     - etc.

2. **Small steps** (15-30 min each, clear actions)
   - Example: "Reply to Sarah's email" →
     - Read Sarah's email and note questions
     - Draft response covering all points
     - Proofread and send

3. **Medium chunks** (30-60 min, some flexibility)
   - Example: "Reply to Sarah's email" →
     - Respond to Sarah's email with answers

4. **Large blocks** (60+ min, high-level only)
   - Example: "Handle email backlog"

**Storage**: `step_granularity` (INTEGER 1-4)
**Impact**: Decomposer Agent step size, micro-step count

---

#### Question 3.3: Instruction Detail Level
*"How much detail do you want in task instructions?"*

**Options** (single-select):
- **Explicit**
  - Description: Tell me exactly what to do, step by step
  - Example: "1. Click the 'New Message' button (top right). 2. In the 'To' field, type 'sarah@example.com'. 3. In the subject line, write 'Re: Project Update'..."

- **Guided**
  - Description: Give me structure but let me decide details
  - Example: "Send email to Sarah covering: (1) timeline update, (2) budget questions, (3) next meeting time"

- **Minimal**
  - Description: Just high-level guidance
  - Example: "Email Sarah with project update"

**Storage**: `instruction_detail` (TEXT)
**Impact**: AI-generated step descriptions, help text

---

## 🚀 Phase 3: After 2-3 Weeks (Active Usage)

**Trigger**: User has 2+ weeks of usage data
**Timing**: After ~14 days of active use
**Prompt**: "Ready to supercharge your productivity? Let's dial in your focus and motivation preferences"
**Duration**: 2-3 minutes
**Questions**: 4-5 questions
**Skippable**: Yes (ask again in 1 week)

### Goals
- Optimize focus time and interruption management
- Personalize motivation and reward systems
- Reduce decision fatigue and cognitive load

---

### 4. Focus & Interruption Preferences

**Purpose**: Protect user's focus time, optimize break patterns

#### Question 4.1: Focus Mode Strictness
*"When you're in focus mode, how should we handle interruptions?"*

**Options** (single-select):
- **Block all interruptions** - Nothing gets through except emergencies
- **Allow urgent only** - Only urgent notifications (user-defined)
- **Gentle reminders are OK** - Low-priority notifications allowed
- **I don't need focus mode protection** - Keep all notifications normal

**Storage**: `focus_mode_strictness` (TEXT)
**Impact**: Notification filtering, Do Not Disturb integration

---

#### Question 4.2: Ideal Focus Session Length
*"What's your ideal length for a focused work session?"*

**Options** (single-select with explanation):
- **Short bursts** (10-15 min)
  - Best for: High distractibility, need frequent wins

- **Pomodoro** (25 min)
  - Best for: Classic ADHD-friendly approach

- **Extended** (45-60 min)
  - Best for: Deep work, flow state

- **Long deep work** (90+ min)
  - Best for: Complex projects, hyperfocus

- **Variable** (depends on task)
  - Best for: Different tasks need different durations

**Storage**: `focus_session_length` (INTEGER in minutes or TEXT)
**Impact**: Focus timer default, Pomodoro settings

---

#### Question 4.3: Break Preferences
*"How do you prefer to take breaks?"*

**Sub-questions**:

**Frequency**:
- After every session
- Every 2 hours
- Every 4 hours
- When I feel like it (no reminders)

**Type** (multi-select):
- Movement break (stretch, walk)
- Screen break (look away, close eyes)
- Complete disconnect (leave workspace)
- Social break (talk to someone)
- Creative break (draw, music, etc.)

**Reminders**:
- Yes, remind me to take breaks
- No, I'll remember on my own

**Storage**:
- `break_frequency` (TEXT)
- `break_types` (JSON array)
- `break_reminders_enabled` (BOOLEAN)

**Impact**: Break timer, reminder system, suggested activities

---

#### Question 4.4: Distractibility Factors
*"What tends to derail your focus? (Select all that apply)"*

**Options** (multi-select):
- **Phone notifications** → AI suggests turning on Do Not Disturb
- **Other people/interruptions** → AI suggests communicating focus time
- **Hungry/tired/uncomfortable** → AI reminds to check physical needs
- **Switching between tasks** → AI groups similar tasks together
- **Losing track of time** → AI adds prominent time tracking
- **Getting hyperfocused on wrong thing** → AI adds priority reminders
- **Intrusive thoughts/worries** → AI suggests brain dump feature
- **Environmental noise** → AI suggests soundscaping features

**Storage**: `distractibility_factors` (JSON array)
**Impact**: Proactive suggestions, UI adaptations, feature recommendations

---

### 5. Motivation & Reward System

**Purpose**: Understand what drives user, personalize gamification

#### Question 5.1: Primary Motivators
*"What keeps you motivated to complete tasks? (Select up to 3)"*

**Options** (multi-select, max 3):
- **Progress visualization** - Seeing tasks complete, charts going up
- **Streaks & consistency** - Maintaining daily/weekly streaks
- **Gamification** - Points, levels, achievements, badges
- **Completion dopamine** - The satisfaction of checking things off
- **External accountability** - Someone checking in on me
- **Avoiding negative consequences** - Meeting deadlines, obligations
- **Novelty & variety** - New challenges, different types of tasks
- **Mastery & skill building** - Getting better at things over time

**Storage**: `motivation_drivers` (JSON array)
**Impact**: Which gamification features to emphasize, reward types

---

#### Question 5.2: Reward Preferences
*"How do you like to be celebrated when you complete tasks?"*

**Options** (multi-select):
- **Visual celebrations** - Animations, confetti, checkmarks
- **Encouraging messages** - Positive affirmations, praise
- **Unlockable features** - Access to new tools/customizations
- **Statistics & insights** - Data on your productivity patterns
- **No rewards needed** - Just the completion is enough

**Storage**: `reward_preferences` (JSON array)
**Impact**: Completion animations, notification types, gamification UI

---

#### Question 5.3: Accountability Style
*"What kind of accountability works best for you?"*

**Options** (single-select):
- **Self-driven** - I hold myself accountable, just give me tools
- **Gentle nudges** - Soft reminders, suggestions
- **Firm check-ins** - Expect me to explain if I don't complete tasks
- **External accountability partner** - Connect me with someone to report to
- **None** - I don't want accountability features

**Storage**: `accountability_style` (TEXT)
**Impact**: Reminder tone, check-in frequency, social features

---

### 6. Decision Making & Cognitive Load

**Purpose**: Reduce decision fatigue, optimize information density

#### Question 6.1: Decision Fatigue
*"When you need to make a decision (like which task to do next), you prefer..."*

**Options** (single-select):
- **Limited choices** - Show me 1-2 options, decide for me
- **Some options** - Give me 3-5 choices to pick from
- **Full control** - Show me everything, I'll decide
- **Adaptive** - Limit choices when I'm overwhelmed, show more when I'm fresh

**Storage**: `decision_preference` (TEXT)
**Impact**: How many options to show, AI decision-making autonomy

---

#### Question 6.2: Cognitive Load Preference
*"How much information do you want to see at once?"*

**Options** (single-select with visual examples):
- **Minimal** - Show only what I need right now (1 task, hide details)
- **Moderate** - Show current task plus related context
- **High** - I want to see the big picture (all tasks, dependencies, timeline)

**Storage**: `cognitive_load_preference` (TEXT)
**Impact**: UI information density, default view settings

---

#### Question 6.3: Time Estimation Accuracy
*"How accurate are you typically at estimating how long tasks will take?"*

**Options** (single-select):
- **I usually underestimate** (tasks take longer than I think)
  - Behavior: AI multiplies estimates by 1.5-2x

- **I usually overestimate** (tasks take less time than I think)
  - Behavior: AI reduces estimates slightly

- **I'm pretty accurate**
  - Behavior: AI uses estimates as-is

- **I have no idea** (time blindness)
  - Behavior: AI learns from actual completion times, adjusts automatically

**Storage**: `time_estimation_tendency` (TEXT)
**Impact**: Auto-adjust time estimates, buffer time allocation

---

## 🎯 Phase 4: Feature-Specific (Contextual)

**Trigger**: User engages with specific features
**Timing**: When feature is first used
**Prompt**: Contextual, within the feature itself
**Duration**: 30-60 seconds
**Questions**: 2-3 per feature
**Skippable**: Yes, but feature uses defaults

### Goals
- Personalize advanced features only when user needs them
- Avoid overwhelming users with questions they're not ready for
- Just-in-time personalization

---

### 7. Collaboration & Delegation Preferences

**Trigger**: User first tries to delegate to AI or use "auto-schedule" feature

#### Question 7.1: AI Agent Autonomy
*"How much autonomy should the AI have?"*

**Options** (single-select):
- **Full autonomy** - Make decisions for me, only alert if there's a problem
- **Suggest and wait** - Propose actions, wait for my approval
- **Ask for everything** - I want to approve every small decision

**Storage**: `ai_autonomy_level` (TEXT)
**Impact**: Core "proxy agent" behavior, automation level

---

#### Question 7.2: Delegation Comfort Levels
*"What can the AI do without asking you first?"* (Multi-select)

**Options**:
- ☐ Schedule tasks based on my availability
- ☐ Prioritize my task list
- ☐ Break down complex tasks into steps
- ☐ Suggest best time to work on tasks
- ☐ Automatically reschedule if I fall behind
- ☐ Send me reminders
- ☐ Archive completed tasks
- ☐ Move unimportant tasks to "someday" list
- ☐ Decline low-priority requests on my behalf

**Storage**: `delegation_permissions` (JSON array)
**Impact**: Which AI automation features are enabled by default

---

#### Question 7.3: Collaboration Style
*"How do you prefer to work?"*

**Options** (single-select):
- **Solo** - I prefer working alone most of the time
- **Asynchronous** - I like collaborating but on my own schedule
- **Real-time** - I thrive with real-time collaboration
- **Task-dependent** - Depends on what I'm working on

**Storage**: `collaboration_preference` (TEXT)
**Impact**: Team features, shared task recommendations

---

### 8. Stress & Overwhelm Indicators

**Trigger**: User marks 3+ tasks as "overwhelming" OR abandons tasks 3 days in a row

#### Question 8.1: Overwhelm Signals
*"What usually means you're feeling overwhelmed?" (Select all that apply)*

**Options** (multi-select):
- ☐ Too many tasks in my backlog (>X tasks)
- ☐ Tasks that are too complex or vague
- ☐ Unclear priorities (don't know what to do first)
- ☐ Tight deadlines stacking up
- ☐ Multiple projects happening at once
- ☐ Lack of structure in my day
- ☐ Too much unstructured/free time
- ☐ Unexpected changes to my schedule

**Storage**: `overwhelm_triggers` (JSON array)
**Impact**: Early warning system, proactive interventions

---

#### Question 8.2: Overwhelm Response
*"When you're overwhelmed, what helps most?"*

**Options** (multi-select, max 3):
- **Simplify everything** - Reduce to just 1-3 priority tasks
- **More structure** - Give me a detailed plan/schedule
- **Break things down** - Make all steps smaller and clearer
- **Clear priorities** - Tell me exactly what to focus on
- **Permission to drop tasks** - Help me decide what to abandon
- **Time to rest** - I need to step away and reset
- **External help** - Connect me with someone who can help

**Storage**: `overwhelm_coping_strategies` (JSON array)
**Impact**: Auto-response when overwhelm is detected

---

#### Question 8.3: Overwhelm Prevention
*"Let's set some limits to prevent overwhelm:"*

**Sub-questions**:
- Warn me when my backlog reaches: [5 / 10 / 20 / 50 / 100] tasks
- Auto-archive tasks older than: [1 week / 2 weeks / 1 month / 3 months / Never]
- Limit daily task suggestions to: [3 / 5 / 10 / 15 / No limit]

**Storage**:
- `backlog_warning_threshold` (INTEGER)
- `auto_archive_days` (INTEGER)
- `daily_suggestion_limit` (INTEGER)

**Impact**: Backlog management, task lifecycle, daily planning

---

### 9. Sensory & Environment Preferences

**Trigger**: User engages with focus mode, workspace features, or customization

#### Question 9.1: Visual Preferences
*"How should we optimize the visual experience for you?"*

**Options** (multi-select):
- ☐ High contrast UI (better readability)
- ☐ Reduce animations (less motion)
- ☐ Reduce visual clutter (minimalist view)
- ☐ Dark mode always
- ☐ Light mode always
- ☐ Auto dark/light based on time
- ☐ Larger text size
- ☐ Color-blind friendly palette

**Storage**: `visual_preferences` (JSON array)
**Impact**: UI theme, animation settings, accessibility features

---

#### Question 9.2: Audio Preferences
*"What helps you focus?"*

**Options** (single-select):
- **Complete silence** - No sounds, no music
- **White noise / ambient sounds** - Nature sounds, rain, etc.
- **Instrumental music** - Music without lyrics
- **Music with lyrics** - Any music
- **Variable** - Depends on the task type

**Follow-up if not silence**:
"Should we suggest focus soundscapes?"
- Yes, integrate with focus sessions
- No, I'll use my own

**Storage**:
- `audio_preference` (TEXT)
- `soundscape_enabled` (BOOLEAN)

**Impact**: Focus mode features, soundscape integration

---

#### Question 9.3: Notification Style
*"How should notifications get your attention?"*

**Options** (multi-select):
- ☐ Visual notifications (banners, badges)
- ☐ Sound notifications
- ☐ Vibration/haptics
- ☐ No interruptions (I'll check when ready)

**Intensity**:
- Gentle (subtle)
- Normal (standard)
- Attention-grabbing (hard to miss)

**Storage**:
- `notification_channels` (JSON array)
- `notification_intensity` (TEXT)

**Impact**: Notification delivery, urgency handling

---

## 📈 Data Collection Strategy Summary

### Progressive Collection Timeline

| Phase | Timing | Trigger | Duration | Questions | Purpose |
|-------|--------|---------|----------|-----------|---------|
| **Phase 1** | First open | New user | 2-3 min | 5-7 | Basic personalization |
| **Phase 2** | After 1 week | 5-7 tasks completed | 1-2 min | 3-4 | Communication & capacity |
| **Phase 3** | After 2-3 weeks | Active usage | 2-3 min | 4-5 | Focus & motivation |
| **Phase 4** | Feature-specific | Feature usage | 30-60 sec | 2-3 per feature | Advanced personalization |
| **Ongoing** | As needed | AI observations | Instant | 1 confirmation | Learn then confirm |

### Total Possible Data Points

| Phase | Data Categories | Individual Fields | Optional |
|-------|----------------|-------------------|----------|
| Phase 1 (Current) | 5 categories | ~15 fields | ❌ Required |
| Phase 2 | 3 categories | ~10 fields | ✅ Skippable |
| Phase 3 | 3 categories | ~12 fields | ✅ Skippable |
| Phase 4 | 3 categories | ~15 fields | ✅ Skippable |
| **Total** | **14 categories** | **~52 fields** | **Majority optional** |

---

## 🎯 Prioritization Matrix

### Implementation Priority (P1 = Highest Impact)

| Data Category | Priority | Phase | Impact | Complexity | ROI |
|---------------|----------|-------|--------|------------|-----|
| **Task breakdown preferences** | 🔥 P1 | 2 | Very High | Low | ⭐⭐⭐⭐⭐ |
| **Energy patterns** | 🔥 P1 | 2 | Very High | Low | ⭐⭐⭐⭐⭐ |
| **Communication style** | 🔥 P1 | 2 | Very High | Medium | ⭐⭐⭐⭐ |
| **Focus session length** | 🔥 P1 | 3 | High | Low | ⭐⭐⭐⭐⭐ |
| **AI autonomy** | 🔥 P1 | 4 | Very High | Medium | ⭐⭐⭐⭐ |
| **Decision fatigue** | 🟡 P2 | 3 | High | Medium | ⭐⭐⭐⭐ |
| **Motivation style** | 🟡 P2 | 3 | Medium | High | ⭐⭐⭐ |
| **Overwhelm indicators** | 🟡 P2 | 4 | High | Low | ⭐⭐⭐⭐ |
| **Time estimation** | 🟡 P2 | 3 | Medium | Medium | ⭐⭐⭐ |
| **Break preferences** | 🟢 P3 | 3 | Medium | Low | ⭐⭐⭐ |
| **Sensory preferences** | 🟢 P3 | 4 | Medium | High | ⭐⭐ |
| **Collaboration style** | 🟢 P3 | 4 | Low | Medium | ⭐⭐ |
| **Reward preferences** | 🟢 P3 | 3 | Medium | High | ⭐⭐ |

### Quick Win Opportunities (High Impact, Low Complexity)

1. **Task breakdown preferences** (P1) - Direct impact on core decomposition feature
2. **Energy patterns** (P1) - Immediate scheduling improvements
3. **Focus session length** (P1) - Simple timer adjustment, huge UX win
4. **Overwhelm indicators** (P2) - Prevent user abandonment

---

## 🧠 "Learn Then Ask" Strategy

Instead of asking everything upfront, the AI can **observe behavior** and then **ask for confirmation**. This reduces initial cognitive load while still achieving personalization.

### Examples

#### Example 1: Time Estimation
**Traditional Approach**:
- Phase 3: Ask "Are you good at estimating time?"
- User might not know their own bias

**Learn Then Ask Approach**:
- AI observes: User estimates 30 min, takes 90 min (3 tasks in a row)
- AI hypothesis: User underestimates by ~3x
- AI asks: "I've noticed tasks tend to take longer than expected. Should I automatically add buffer time to estimates?"
- User confirms: Yes → AI multiplies future estimates by 2-3x

**Benefits**:
- Evidence-based question
- User sees the pattern
- Higher accuracy

---

#### Example 2: Overwhelm Threshold
**Traditional Approach**:
- Phase 2: Ask "How many tasks before you feel overwhelmed?"
- User guesses

**Learn Then Ask Approach**:
- AI observes: User has 25 tasks, hasn't completed any in 3 days
- AI hypothesis: User is overwhelmed at ~20-25 tasks
- AI asks: "Looks like you might be feeling overwhelmed. Want me to help you focus on just the top 3 priorities?"
- User confirms: Yes → AI sets threshold at 20 tasks

**Benefits**:
- Intervention at point of need
- User experiences the solution
- Natural discovery

---

#### Example 3: Break Reminders
**Traditional Approach**:
- Phase 3: Ask "Do you want break reminders?"
- User might not know

**Learn Then Ask Approach**:
- AI observes: User worked 3 hours straight without break
- AI hypothesis: User has time blindness / gets hyperfocused
- AI asks: "You've been at it for a while! Want me to remind you to take breaks every hour?"
- User confirms: Yes → AI enables break reminders

**Benefits**:
- Demonstrates value immediately
- User experiences problem before solution
- Higher adoption

---

### Data Points Ideal for "Learn Then Ask"

| Data Point | What AI Observes | When to Ask | Question |
|------------|------------------|-------------|----------|
| **Time estimation tendency** | 5+ tasks: actual vs estimated time | After clear pattern | "I've noticed tasks take X% longer/shorter than estimated. Adjust automatically?" |
| **Task capacity** | Tasks completed per day over 2 weeks | After 10+ days | "You typically complete X tasks/day. Should I limit suggestions to this?" |
| **Energy pattern** | Completion times, task engagement by hour | After 1 week | "I've noticed you're most productive in [morning/afternoon/evening]. Schedule hard tasks then?" |
| **Break needs** | Long work sessions without breaks | After 2-3 long sessions | "You worked X hours straight. Want break reminders every Y minutes?" |
| **Overwhelm threshold** | Backlog size when user stops engaging | When it happens | "Seems like [X] tasks might be overwhelming. Should I help you focus on fewer priorities?" |
| **Hyperfocus tendency** | Single task sessions > 2 hours | After it happens 2-3 times | "I noticed you hyperfocused for X hours. Want time awareness reminders?" |
| **Task abandonment pattern** | Tasks started but not completed | After 3+ abandonments | "Some tasks keep getting postponed. Should I break them down smaller?" |

---

## 🧪 A/B Testing Opportunities

Test what actually matters to users and what drives engagement.

### Test 1: Initial Onboarding Length
**Hypothesis**: Shorter onboarding has higher completion rate but lower personalization satisfaction

**Variants**:
- **Control**: Current 5 questions (Phase 1 only)
- **Test A**: Add 3 Phase 2 questions upfront (8 total)
- **Test B**: Add all Phase 2 + 3 questions upfront (12 total)

**Metrics**:
- Onboarding completion rate
- Time to complete
- User satisfaction with personalization (survey at 1 week)
- Feature engagement

**Expected Outcome**: Control has highest completion, Test A has best balance of completion + satisfaction

---

### Test 2: Progressive Prompt Timing
**Hypothesis**: Earlier progressive prompts increase engagement but may feel pushy

**Variants**:
- **Control**: Phase 2 prompt after 1 week (current plan)
- **Test A**: Phase 2 prompt after 3 days
- **Test B**: Phase 2 prompt after 2 weeks
- **Test C**: No prompt, user discovers in settings only

**Metrics**:
- Phase 2 completion rate
- User retention at 2 weeks
- Perceived intrusiveness (survey)

**Expected Outcome**: Test A has highest completion, but may feel pushy. Control is sweet spot.

---

### Test 3: "Learn Then Ask" vs "Ask Upfront"
**Hypothesis**: Learning first creates better user experience and higher accuracy

**Variants**:
- **Control**: Ask about time estimation in Phase 3
- **Test**: Observe for 1 week, then ask with evidence

**Metrics**:
- Question completion rate
- User confidence in answer (survey)
- Accuracy of personalization (does it actually help?)

**Expected Outcome**: Test has higher confidence and accuracy, slightly lower completion in Phase 3

---

### Test 4: Progressive vs Comprehensive Onboarding
**Hypothesis**: Progressive approach has better overall experience despite less upfront data

**Variants**:
- **Control**: Progressive (Phase 1 → 2 → 3 → 4 over 3 weeks)
- **Test**: Comprehensive (All questions upfront, 15 min)

**Metrics**:
- Initial onboarding completion rate
- Total data collected by week 3
- User satisfaction at week 1, week 3
- Feature usage
- Retention at 1 month

**Expected Outcome**: Control has much higher initial completion, catches up on data by week 3, higher satisfaction

---

## 📊 Data Schema Additions

### New Database Fields Required

```sql
-- Phase 2: After First Week
communication_style TEXT,                     -- direct, supportive, analytical, casual
feedback_timing TEXT,                         -- immediate, daily, weekly, manual
uncertainty_handling TEXT,                    -- options, auto_override, always_ask
energy_pattern TEXT,                          -- consistent, morning, night, variable
daily_task_capacity INTEGER,                  -- 1-3, 4-6, 7-10, 10+, variable
task_size_preference TEXT,                    -- few_big, many_small, mixed
burnout_sensitivity TEXT,                     -- low, medium, high, very_high
task_initiation_difficulty TEXT,              -- starting, momentum, complexity, other
step_granularity INTEGER,                     -- 1-4 (tiny to large)
instruction_detail TEXT,                      -- explicit, guided, minimal

-- Phase 3: After 2-3 Weeks
focus_mode_strictness TEXT,                   -- block_all, urgent_only, gentle, none
focus_session_length INTEGER,                 -- minutes or NULL for variable
break_frequency TEXT,                         -- per_session, hourly, 2hours, manual
break_types TEXT,                             -- JSON array
break_reminders_enabled BOOLEAN,              -- true/false
distractibility_factors TEXT,                 -- JSON array
motivation_drivers TEXT,                      -- JSON array (max 3)
reward_preferences TEXT,                      -- JSON array
accountability_style TEXT,                    -- self, gentle, firm, partner, none
decision_preference TEXT,                     -- limited, some, full, adaptive
cognitive_load_preference TEXT,               -- minimal, moderate, high
time_estimation_tendency TEXT,                -- underestimate, overestimate, accurate, blind

-- Phase 4: Feature-Specific
ai_autonomy_level TEXT,                       -- full, suggest, ask_always
delegation_permissions TEXT,                  -- JSON array
collaboration_preference TEXT,                -- solo, async, realtime, depends
overwhelm_triggers TEXT,                      -- JSON array
overwhelm_coping_strategies TEXT,             -- JSON array
backlog_warning_threshold INTEGER,            -- task count
auto_archive_days INTEGER,                    -- days
daily_suggestion_limit INTEGER,               -- task count
visual_preferences TEXT,                      -- JSON array
audio_preference TEXT,                        -- silence, white_noise, instrumental, etc
soundscape_enabled BOOLEAN,                   -- true/false
notification_channels TEXT,                   -- JSON array
notification_intensity TEXT,                  -- gentle, normal, attention

-- Metadata
phase_2_completed_at TIMESTAMP,
phase_3_completed_at TIMESTAMP,
phase_4_features_completed TEXT,              -- JSON array of completed feature onboardings
```

---

## 🚀 Implementation Roadmap

### Week 1-2: Foundation (Enable Current Data Usage)
**Before adding new data, use what we already have**

- [ ] Implement `ONBOARDING_INTEGRATION.md` Phase 1
  - [ ] Create `UserPreferencesService` (Backend)
  - [ ] Create `useUserPreferences` hook (Frontend)
- [ ] Implement Phase 2 (Quick Wins)
  - [ ] ADHD-adaptive UI elements
  - [ ] Smart scheduling based on daily schedule
  - [ ] Personalized dashboard

**Deliverable**: Users see personalization from Phase 1 data

---

### Week 3-4: Phase 2 Progressive Questions
**Add communication and capacity data collection**

- [ ] Design Phase 2 UI screens (3-4 questions)
- [ ] Implement trigger logic (after 5-7 tasks)
- [ ] Add database fields for Phase 2 data
- [ ] Create backend endpoints for partial updates
- [ ] Implement data usage:
  - [ ] AI agent communication style
  - [ ] Energy-based scheduling
  - [ ] Task breakdown adaptation
  - [ ] Capacity-based daily limits

**Deliverable**: Progressive prompt shows after 1 week, personalization improves

---

### Week 5-6: Phase 3 Progressive Questions
**Add focus, motivation, and decision-making data**

- [ ] Design Phase 3 UI screens (4-5 questions)
- [ ] Implement trigger logic (after 2 weeks)
- [ ] Add database fields for Phase 3 data
- [ ] Implement data usage:
  - [ ] Focus mode customization
  - [ ] Break reminders
  - [ ] Motivation/reward system
  - [ ] Decision simplification

**Deliverable**: Phase 3 prompt shows after 2-3 weeks, deep personalization active

---

### Week 7-8: "Learn Then Ask" System
**Build AI observation and hypothesis system**

- [ ] Create observation tracking (task times, completion patterns, etc.)
- [ ] Build hypothesis engine (detect patterns)
- [ ] Design contextual prompts (in-app, non-intrusive)
- [ ] Implement confirmation flow
- [ ] Test and refine thresholds

**Deliverable**: AI proactively asks smart questions based on observed behavior

---

### Week 9-10: Phase 4 Feature-Specific
**Add contextual onboarding for advanced features**

- [ ] Delegation preferences (when user tries AI delegation)
- [ ] Overwhelm management (when detected)
- [ ] Sensory preferences (when user accesses customization)
- [ ] Implement feature-specific data usage

**Deliverable**: Advanced features personalize themselves on first use

---

### Week 11-12: A/B Testing & Optimization
**Validate assumptions and optimize**

- [ ] Set up A/B testing framework
- [ ] Run Test 1: Onboarding length
- [ ] Run Test 2: Progressive timing
- [ ] Run Test 3: Learn vs Ask
- [ ] Analyze results
- [ ] Optimize based on data

**Deliverable**: Data-driven optimization of progressive flow

---

## 📏 Success Metrics

### Onboarding Completion Rates
- **Phase 1**: 90%+ completion (current target)
- **Phase 2**: 60-70% completion (progressive, 1 week later)
- **Phase 3**: 40-50% completion (progressive, 2-3 weeks later)
- **Phase 4**: 30-40% per feature (contextual)

### Data Coverage
- **Week 1**: 100% of users have Phase 1 data
- **Week 2**: 60-70% have Phase 2 data
- **Week 4**: 40-50% have Phase 3 data
- **Week 8**: 50-60% have at least 1 Phase 4 feature

### User Satisfaction
- **Personalization**: 80%+ feel app is personalized to them
- **Understanding**: 85%+ understand how their choices affect experience
- **Value**: 75%+ report progressive questions were worth their time
- **Non-intrusive**: 90%+ don't find progressive prompts annoying

### Feature Impact
- **Task completion rate**: +15-20% improvement
- **User retention**: +10-15% at 30 days
- **Session length**: +20-30% (higher engagement)
- **Feature discovery**: +40-50% (personalization drives exploration)

---

## 🎓 Key Learnings & Principles

### 1. Progressive > Comprehensive
Users prefer quick starts with gradual depth over long upfront surveys.

### 2. Show, Don't Tell
Demonstrate value before asking for data. Users are more likely to complete Phase 2 after seeing Phase 1 personalization.

### 3. Context is King
Feature-specific questions (Phase 4) have higher completion when asked in-context vs. upfront.

### 4. Observe Before Asking
"Learn then ask" creates more accurate data and better UX than blind questions.

### 5. Make It Skippable
Every progressive phase should be skippable with sensible defaults. Users can always come back.

### 6. Timing Matters
Too early = feels pushy. Too late = user already formed habits. Week 1 and Week 2-3 are sweet spots.

### 7. Mobile-First Questions
Keep questions short, visual, and mobile-friendly. Avoid long text.

---

## 📚 Related Documents

- **Current Onboarding**: [docs/onboarding/00_OVERVIEW.md](../../docs/onboarding/00_OVERVIEW.md)
- **Integration Plan**: [tasks/ONBOARDING_INTEGRATION.md](../ONBOARDING_INTEGRATION.md)
- **Status Report**: [STATUS.md](../../STATUS.md)

---

## 📝 Next Steps

1. **Review this document** with product, design, and engineering teams
2. **Prioritize Phase 2 data points** - which 3-4 questions to ask first?
3. **Design Phase 2 UI** - how to present the progressive prompt?
4. **Implement Phase 1 integration** - make current data useful first
5. **Build Phase 2 questions** - collect communication and capacity data
6. **Test "learn then ask"** - pilot with time estimation
7. **Iterate based on data** - A/B test and optimize

---

**Status**: 🟢 Ready for Team Review
**Owner**: Product + Engineering
**Next Review**: After Phase 1 integration is complete
**Last Updated**: November 10, 2025
