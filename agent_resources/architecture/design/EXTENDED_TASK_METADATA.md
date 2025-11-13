# Extended Task Metadata System
## Beyond CHAMPS: Complete Context for ADHD-Optimized Task Execution

**Version**: 1.0
**Last Updated**: October 23, 2025
**Status**: Research & Design

---

## Purpose

While CHAMPS provides essential structure (Conversation, Help, Activity, Movement, Participation, Success), there are many other factors that influence whether an ADHD brain can:

1. **EVALUATE**: "Should I do this task right now?"
2. **INITIATE**: "Can I actually start this?"
3. **EXECUTE**: "How do I successfully complete this?"
4. **COMPLETE**: "How do I know I'm truly done?"

This document explores **10 additional metadata dimensions** that complement CHAMPS.

---

## Table of Contents

1. [Psychological/Emotional Tags](#1-psychologicalemotional-tags)
2. [Cognitive Load Indicators](#2-cognitive-load-indicators)
3. [Prerequisites & Dependencies](#3-prerequisites--dependencies)
4. [Sensory & Environmental](#4-sensory--environmental)
5. [Motivation & Reward](#5-motivation--reward)
6. [Risk & Safety](#6-risk--safety)
7. [Social & Accountability](#7-social--accountability)
8. [Temporal & Timing](#8-temporal--timing)
9. [Learning & Support](#9-learning--support)
10. [Execution Metadata](#10-execution-metadata)

---

## 1. Psychological/Emotional Tags

### Why It Matters
ADHD brains have strong emotional responses to tasks. Anxiety, dread, and procrastination are not character flaws - they're neurological responses to perceived threat or difficulty.

### Metadata Fields

#### 😰 Anxiety Level
**Scale**: 1-5 (😌 Calm → 😰 High Anxiety)

**Purpose**: Helps users avoid anxiety-inducing tasks when already stressed

**Examples**:
- 😌 **Calm (1)**: Reply to friend's text
- 😐 **Mild (2)**: Schedule dentist appointment
- 😟 **Moderate (3)**: Ask boss for feedback
- 😰 **High (4)**: Difficult conversation with family
- 😱 **Severe (5)**: Tax filing with penalties

**Use Cases**:
- Filter: "Show me only Calm tasks" when already overwhelmed
- Warning: "You have 3 High Anxiety tasks today - spread them out?"
- Batching: "Do all Calm tasks first for momentum"

---

#### 🧠 Mental Difficulty
**Scale**: 1-5 (🟢 Easy → 🔴 Expert)

**Purpose**: Separate from duration - a 2-minute task can be mentally exhausting

**Examples**:
- 🟢 **Easy (1)**: Autopilot tasks (check email, file document)
- 🟡 **Moderate (2)**: Familiar tasks (write standard reply, update spreadsheet)
- 🟠 **Hard (3)**: Requires thinking (draft proposal, plan project)
- 🔴 **Very Hard (4)**: Complex problem-solving (debug code, design architecture)
- ⚫ **Expert (5)**: Novel, high-stakes decisions (choose vendor, negotiate contract)

**Correlation with CHAMPS Participation**:
```
Quick Win tasks can be:
- Easy (check inbox) ✅
- Expert (make critical decision) ⚠️ Dangerous combo!

Marathon tasks can be:
- Easy (clean garage) ✅
- Expert (write whitepaper) 😰 Double exhaustion
```

**Key Insight**: Mental Difficulty + Duration = True Cognitive Load

---

#### 😴 Boredom Risk
**Scale**: 1-5 (🎉 Engaging → 😴 Mind-Numbing)

**Purpose**: ADHD brains shut down when bored, even if task is "easy"

**Examples**:
- 🎉 **Engaging (1)**: Creative work, new challenges
- 😊 **Interesting (2)**: Variety, novel elements
- 😐 **Neutral (3)**: Standard work
- 🥱 **Tedious (4)**: Repetitive data entry
- 😴 **Mind-Numbing (5)**: Copy-paste 100 items

**Strategies by Level**:
- Engaging: Save for when you need dopamine
- Neutral: Pair with music/podcast
- Tedious: Time-box (Pomodoro), add gamification
- Mind-Numbing: **Automate or delegate** - never do manually

**Anti-Boredom Techniques**:
- Body doubling (work with someone)
- Music/stimulation
- Gamification (race the timer)
- Rewards after each chunk
- **Automation first** - if boring, script it

---

#### 🦥 Procrastination Score
**Scale**: 1-5 (✅ Never Avoided → 🦥 Always Avoided)

**Purpose**: AI learns which tasks you chronically avoid, suggests interventions

**Calculated From**:
- Snooze count (how many times postponed)
- Days overdue
- Completion rate for similar tasks
- User's past behavior patterns

**Examples**:
- ✅ **Never (1)**: Fun tasks, high interest
- 😐 **Sometimes (2)**: Moderate resistance
- 😬 **Often (3)**: Uncomfortable but necessary
- 🦥 **Usually (4)**: High avoidance, multiple reschedules
- 🚫 **Always (5)**: Never completed, chronic blocker

**Interventions by Score**:
```
Score 1-2: Normal priority
Score 3:   Break into smaller steps
Score 4:   Add accountability (tell someone)
Score 5:   STOP - either delegate, delete, or radical redesign
```

**ADHD Insight**: If you've avoided it 5+ times, the task design is wrong, not you.

---

#### 😊 Fun Factor
**Scale**: 1-5 (😫 Dreadful → 🎉 Exciting)

**Purpose**: Some tasks are genuinely enjoyable - use them strategically

**Examples**:
- 🎉 **Exciting (5)**: Creative projects, new tools
- 😊 **Fun (4)**: Interesting work
- 😐 **Neutral (3)**: Standard tasks
- 😬 **Unpleasant (2)**: Tedious but necessary
- 😫 **Dreadful (1)**: Absolute worst tasks

**Strategic Use**:
- **Reward Sandwich**: Dreadful → Fun → Dreadful
- **Dopamine Boost**: Start day with 1 Fun task
- **Motivation Recovery**: After failed task, do Fun task
- **Celebration**: Save Exciting tasks for achievements

---

## 2. Cognitive Load Indicators

### Why It Matters
ADHD working memory is limited. Knowing cognitive demands helps prevent overwhelm.

### Metadata Fields

#### 🧩 Decision Count
**Scale**: 0-10+ decisions required

**Purpose**: Decision fatigue is real - limit decisions per task

**Examples**:
- **0 decisions**: Follow exact checklist
- **1-2 decisions**: Pick from 3 options
- **3-5 decisions**: Multiple choice points
- **6-10 decisions**: Complex branching logic
- **10+ decisions**: Open-ended, many variables

**Guidelines**:
- Morning: High decision capacity (6-10 OK)
- Afternoon: Lower capacity (1-3 max)
- Low energy: **Zero decision tasks only**

**ADHD Insight**: Every decision depletes mental energy. Aim for ≤3 decisions per task.

---

#### 🔀 Context Switch Cost
**Scale**: 1-5 (🟢 Same Context → 🔴 Total Switch)

**Purpose**: Switching between different types of work is exhausting

**Examples**:
- 🟢 **Same (1)**: Continuing current work
- 🟡 **Similar (2)**: Related topic, same tools
- 🟠 **Different (3)**: Different project, same type of work
- 🔴 **Distant (4)**: Different domain, different tools
- ⚫ **Total (5)**: Completely unrelated (coding → taxes)

**Batching Strategy**:
```
GROUP 1: All "Email" tasks (same tool)
GROUP 2: All "Code" tasks (same environment)
GROUP 3: All "Finance" tasks (same mental model)

DON'T MIX: Email → Code → Finance → Email (4 context switches = exhaustion)
```

---

#### 📚 Learning Curve
**Scale**: 1-5 (✅ Familiar → 📚 Completely New)

**Purpose**: New things require more mental energy

**Examples**:
- ✅ **Familiar (1)**: Done 100+ times
- 😐 **Known (2)**: Done 10+ times
- 🤔 **Some Learning (3)**: Done 1-2 times
- 📖 **New Process (4)**: Never done, have guide
- 📚 **Completely New (5)**: Never done, no guide

**Energy Adjustment**:
- Familiar: Estimate = actual time
- Known: +10% time buffer
- Some Learning: +25% buffer
- New Process: +50% buffer
- Completely New: **+100% buffer + tutorial time**

---

#### 🎯 Focus Intensity
**Scale**: 1-5 (🌊 Background → 🎯 Laser Focus)

**Purpose**: Not all tasks need intense focus - some can be autopilot

**Examples**:
- 🌊 **Background (1)**: Can do while listening to podcast
- 😌 **Relaxed (2)**: Half attention sufficient
- 🙂 **Normal (3)**: Standard attention
- 👀 **Concentrated (4)**: High focus, minimal distraction
- 🎯 **Laser (5)**: Peak concentration, zero distractions

**Environment Matching**:
```
Background:     Music, TV, social environment OK
Relaxed:        Coffee shop OK
Normal:         Office with some noise OK
Concentrated:   Quiet room, headphones
Laser:          Isolation, Do Not Disturb, phone off
```

---

## 3. Prerequisites & Dependencies

### Why It Matters
Can't start a task if you don't have what you need. Explicit prerequisites prevent "false starts".

### Metadata Fields

#### 🛠️ Tools Required
**List**: Specific apps, accounts, physical items

**Examples**:
- 💻 **Digital**: Figma, VS Code, Excel, Browser
- 🔑 **Accounts**: GitHub login, AWS credentials, Zoom license
- 📱 **Devices**: iPhone, iPad, specific laptop
- 🧰 **Physical**: Screwdriver, measuring tape, printer
- 📄 **Materials**: Paper, ingredients, specific files

**Validation**:
```
Before showing task as "ready":
✅ Check: Do I have Figma installed?
✅ Check: Am I logged into GitHub?
✅ Check: Is my laptop charged?
✅ Check: Do I have the project files?

If ANY missing → Task status = "🔴 Blocked - Missing: Figma"
```

---

#### 🔗 Dependencies
**Graph**: What must be done first?

**Types**:
- **Hard Blocker**: Cannot start until X is done
- **Soft Blocker**: Can start, but harder without X
- **Parallel**: Can do simultaneously
- **Sequential**: Must do A, then B, then C

**Visual**:
```
Task: "Deploy to production"
Dependencies:
🔴 HARD BLOCKER: Tests must pass
🟡 SOFT BLOCKER: Code review approved (can override)
🟢 PARALLEL: Update documentation (can do simultaneously)
```

**Smart Scheduling**:
- Auto-hide tasks with unmet hard blockers
- Warn about soft blockers
- Suggest parallel tasks to maximize efficiency

---

#### 📍 Location Requirements
**List**: Where must you be?

**Examples**:
- 🏠 **Home**: Access to home files, equipment
- 🏢 **Office**: Access to office network, printer
- 🏦 **Specific Place**: Bank, post office, store
- 🌍 **Anywhere with WiFi**: Coffee shop OK
- ✈️ **Airplane Mode OK**: Offline work possible

**Use Cases**:
- "I'm at coffee shop" → Filter for "Anywhere with WiFi" tasks
- "I'm home" → Show "Home" tasks, hide "Office" tasks
- "I'm running errands" → Show "Specific Place" tasks, group by location

---

#### ⏰ Prerequisites Time
**Duration**: How long to gather prerequisites?

**Purpose**: Account for setup time in task estimation

**Examples**:
- ✅ **0 min**: Everything ready
- 🟡 **2 min**: Quick login/open app
- 🟠 **5 min**: Download file, install app
- 🔴 **15 min**: Set up environment, gather materials
- ⚫ **30+ min**: Major setup (install software, configure)

**True Time Calculation**:
```
Displayed Time: 5 minutes (actual task)
Prerequisites: 10 minutes (setup)
TRUE TIME: 15 minutes total

Show user: "15 min (10 setup + 5 work)"
```

---

## 4. Sensory & Environmental

### Why It Matters
ADHD often comes with sensory sensitivities. Knowing environmental needs prevents meltdowns.

### Metadata Fields

#### 🔊 Noise Tolerance
**Scale**: 1-5 (🔇 Silence Required → 🎵 Music Preferred)

**Examples**:
- 🔇 **Silence (1)**: Recording audio, phone calls
- 🤫 **Quiet (2)**: Writing, deep thinking
- 😐 **Normal (3)**: Standard work
- 🎧 **Music OK (4)**: Can work with background music
- 🎵 **Music Preferred (5)**: Boring tasks + music = better

**Environment Matching**:
```
Library:        Silence, Quiet tasks ✅
Coffee Shop:    Normal, Music OK ✅
Open Office:    Music Preferred ✅
Loud Gym:       Music Preferred ONLY ⚠️
```

---

#### 💡 Lighting Needs
**Options**: Bright, Dim, Dark Mode, Blue Light Free

**Examples**:
- ☀️ **Bright**: Design work, reading physical docs
- 💡 **Normal**: Standard work
- 🌙 **Dim**: Evening work, eye strain
- 🌑 **Dark Mode**: Late night, photosensitivity
- 🌈 **Color-Sensitive**: No harsh colors, soft palette

**Accessibility**:
- Migraine trigger warning for bright screen tasks
- Evening task suggestions auto-switch to dark mode
- Blue light tasks not suggested after 8pm

---

#### 🧘 Posture/Position
**Options**: Sitting, Standing, Walking, Lying Down

**Purpose**: Some people think better when moving

**Examples**:
- 🪑 **Sitting**: Detail work, typing
- 🧍 **Standing**: Meetings, light tasks
- 🚶 **Walking**: Phone calls, brainstorming
- 🛋️ **Lying Down**: Reading, reviewing
- 🏃 **Moving**: Verbal rehearsal, memorization

**ADHD Insight**: Hyperactivity can be channeled - walking meetings are GREAT.

---

#### 🌡️ Energy Sensitivity
**Options**: Temperature, Hunger, Caffeine, Sleep

**Purpose**: Some tasks need optimal physical state

**Examples**:
```
Task: "Write important proposal"
Sensitivity: 🌡️ Warm room, ☕ Caffeinated, 😴 Well-rested

Warning: "You said you're tired - this task needs peak state"
```

---

## 5. Motivation & Reward

### Why It Matters
ADHD brains need clear, immediate rewards to initiate and sustain tasks.

### Metadata Fields

#### 🎯 Impact Score
**Scale**: 1-5 (🤷 Minimal → 🌟 Life-Changing)

**Purpose**: Helps prioritize what ACTUALLY matters

**Examples**:
- 🤷 **Minimal (1)**: Nice to have
- 😐 **Low (2)**: Small improvement
- 🙂 **Medium (3)**: Noticeable benefit
- 💪 **High (4)**: Significant progress
- 🌟 **Critical (5)**: Life-changing, blocking major goals

**ADHD Insight**: Over-prioritizing low-impact tasks is ADHD tax. Focus on 4-5 only.

---

#### 🎁 Reward Type
**Categories**: Immediate, Delayed, Internal, External

**Examples**:
- ⚡ **Immediate**: Inbox zero, clean desk (instant gratification)
- ⏳ **Delayed**: Promotion, long-term benefit (hard for ADHD)
- 💭 **Internal**: Pride, satisfaction (unreliable for ADHD)
- 🏆 **External**: Praise, money, XP (more reliable for ADHD)

**Strategy**:
- Pair Delayed rewards with Immediate rewards
- Add External rewards to Internal-only tasks
- Example: "Write report" (delayed) + "Get coffee after" (immediate)

---

#### 👀 Visibility
**Scale**: 1-5 (🔒 Private → 👥 Public)

**Purpose**: Social accountability drives completion

**Examples**:
- 🔒 **Private (1)**: No one will know
- 👤 **Self (2)**: Only you track it
- 👥 **Team (3)**: Team sees progress
- 🌍 **Public (4)**: Shared with others
- 📢 **Broadcast (5)**: Announced/celebrated

**Accountability Boost**:
- Private: 50% completion rate
- Team: 75% completion rate
- Public: 90% completion rate

---

#### ⚡ Momentum Value
**Scale**: 1-5 (🤷 Standalone → 🚀 Unlocks Many)

**Purpose**: Some tasks unlock many others (high leverage)

**Examples**:
- 🤷 **Standalone (1)**: Doesn't enable anything else
- 😐 **Minor (2)**: Unlocks 1-2 tasks
- 🙂 **Moderate (3)**: Unlocks 3-5 tasks
- 💪 **High (4)**: Unlocks whole project
- 🚀 **Multiplier (5)**: Unlocks 10+ tasks, major pathway

**Strategy**:
```
Start day with Multiplier task:
✅ "Get API key" (Multiplier) → Unlocks 10 integration tasks
✅ "Set up dev environment" (High) → Unlocks all coding tasks

Don't start with:
❌ "Update README" (Standalone) → Doesn't unlock anything
```

---

## 6. Risk & Safety

### Why It Matters
Fear of failure prevents task initiation. Knowing risks and safety nets enables action.

### Metadata Fields

#### ⚠️ Failure Cost
**Scale**: 1-5 (😌 No Big Deal → 💥 Catastrophic)

**Purpose**: High stakes = high anxiety. Be explicit about real vs. imagined risk.

**Examples**:
- 😌 **No Big Deal (1)**: Easily reversible, low impact
- 😐 **Minor (2)**: Small inconvenience if wrong
- 😟 **Moderate (3)**: Annoying but fixable
- 😰 **High (4)**: Significant consequences, hard to fix
- 💥 **Catastrophic (5)**: Irreversible, major damage

**Anxiety Calibration**:
```
Task: "Reply to email"
Perceived Risk: 😰 High (4) - "What if I say something wrong?"
Actual Risk: 😌 No Big Deal (1) - Emails are editable, retractable

AI Intervention: "Actual risk is LOW - you can clarify later if needed"
```

---

#### 🔄 Undo-ability
**Scale**: 1-5 (🔒 Permanent → ↩️ Fully Reversible)

**Purpose**: Knowing you can undo reduces anxiety

**Examples**:
- ↩️ **Fully Reversible (5)**: Git commit, draft email
- 🔙 **Mostly Reversible (4)**: Can undo with effort
- 🤔 **Partially Reversible (3)**: Some things can be undone
- ⚠️ **Hard to Reverse (2)**: Difficult to undo
- 🔒 **Permanent (1)**: Cannot be undone (delete production DB)

**UI Indicators**:
```
High Undo-ability: Green "Safe to try" badge
Low Undo-ability: Red "Double-check" warning
```

---

#### 🛡️ Safety Net
**Boolean**: Is there a backup/checkpoint system?

**Examples**:
- ✅ **Has Safety Net**: Auto-save, version control, backup
- ❌ **No Safety Net**: Manual work, no backups

**Anxiety Reduction**:
```
With safety net: "Don't worry, auto-saves every 30 seconds"
Without: "⚠️ Remember to save manually - no auto-save"
```

---

## 7. Social & Accountability

### Why It Matters
ADHD brains often perform better with external accountability and social pressure.

### Metadata Fields

#### 👥 Accountability Type
**Options**: Self, Partner, Team, Public, Deadline

**Examples**:
- 🧍 **Self**: Only you care
- 👬 **Partner**: Buddy system
- 👥 **Team**: Team depends on this
- 🌍 **Public**: External commitment
- ⏰ **Deadline**: Time-based pressure

**Effectiveness**:
```
Self:      40% completion (lowest)
Partner:   70% completion (body doubling)
Team:      80% completion (social pressure)
Public:    85% completion (reputation)
Deadline:  90% completion (external structure)
```

---

#### ⏱️ Deadline Urgency
**Options**: None, Soft, Firm, Critical

**Examples**:
- 🤷 **None**: Someday/maybe
- 😐 **Soft**: Preferably done by X
- 🎯 **Firm**: Must be done by X
- 🚨 **Critical**: Disaster if not done by X

**ADHD Reality**:
- None: 20% completion rate (will never do)
- Soft: 40% completion rate (probably won't do)
- Firm: 80% completion rate (will do)
- Critical: 95% completion rate (definitely do)

**Strategy**: Convert "None" to "Soft" with artificial deadlines

---

#### 🤝 Waiting On Someone
**Boolean**: Is someone else blocking this?

**Purpose**: Distinguish between "I'm procrastinating" and "Legitimately blocked"

**Examples**:
- ❌ **Not Waiting**: You can do this now
- ⏳ **Waiting**: Blocked by someone else's action

**Mental Health**:
```
Blocked by you: Guilt, shame, anxiety 😰
Blocked by others: Neutral, patience 😌

Explicitly mark waiting tasks to remove false guilt.
```

---

## 8. Temporal & Timing

### Why It Matters
Timing affects success. Some tasks are time-sensitive or time-optimal.

### Metadata Fields

#### 🕐 Optimal Time of Day
**Options**: Morning, Midday, Afternoon, Evening, Late Night

**Purpose**: Work WITH your circadian rhythm, not against it

**Examples from Research**:
- 🌅 **Morning (6-10am)**: Creative work, strategic thinking
- ☀️ **Midday (10-2pm)**: Communication, meetings, social
- 🌤️ **Afternoon (2-6pm)**: Analytical work, detail tasks
- 🌆 **Evening (6-10pm)**: Routine work, low-stakes tasks
- 🌙 **Late Night (10pm+)**: Varies by person (night owls)

**Personalization**:
```
Track completion rates by time of day:
"You complete 85% of Creative tasks at 8-10am"
"You complete only 40% of Creative tasks at 3-5pm"

Recommendation: Schedule Creative work for mornings.
```

---

#### 📅 Day of Week Pattern
**Options**: Weekday, Weekend, Monday, Friday, etc.

**Purpose**: Some tasks are easier on certain days

**Examples**:
- 📧 **Mondays**: Catch-up, email, planning
- 💪 **Tuesday-Thursday**: Deep work, peak productivity
- 🎉 **Friday**: Light work, wrap-up, celebration
- 🏡 **Weekends**: Personal tasks, life admin

---

#### ⏲️ Time Sensitivity
**Scale**: 1-5 (🤷 Anytime → ⏰ Exact Time)

**Purpose**: Some tasks must be done at specific times

**Examples**:
- 🤷 **Anytime (1)**: No time constraints
- 😐 **Loose (2)**: Better during business hours
- 🕐 **Specific Window (3)**: Must be done 9-5pm
- ⏰ **Exact Time (4)**: Must be done at 2pm meeting
- 🚨 **Deadline (5)**: Must be done by 5pm or fail

---

#### 🔁 Recurrence Pattern
**Options**: One-time, Daily, Weekly, Monthly, Irregular

**Purpose**: Distinguish between recurring and one-off tasks

**Benefits of Explicit Recurrence**:
- Auto-create next instance
- Track streak (completed 30 days in a row)
- Adjust difficulty based on history
- Set up automated reminders

---

## 9. Learning & Support

### Why It Matters
Unknown tasks are scary. Knowing what support exists reduces anxiety and improves success.

### Metadata Fields

#### 📚 Documentation Available
**Options**: None, Minimal, Good, Excellent

**Examples**:
- ❌ **None**: No guide, figure it out
- 📄 **Minimal**: Basic notes
- 📗 **Good**: Clear step-by-step guide
- 📘 **Excellent**: Video tutorial + written guide + examples

**Difficulty Adjustment**:
```
Same task:
With Excellent docs: Difficulty 2/5
With No docs: Difficulty 4/5
```

---

#### 🎓 Expertise Required
**Scale**: 1-5 (👶 Beginner → 🧙 Expert)

**Purpose**: Match task to skill level

**Examples**:
- 👶 **Beginner (1)**: Anyone can do this
- 🙂 **Novice (2)**: Basic familiarity needed
- 💼 **Intermediate (3)**: Moderate experience
- 🏆 **Advanced (4)**: Specialized skills
- 🧙 **Expert (5)**: Deep expertise required

**Delegation Logic**:
```
If (user_skill < required_expertise):
    Suggest: "Consider delegating this task"
    OR: "Pair with someone who knows this"
```

---

#### 🤝 Body Doubling Beneficial
**Boolean**: Is this better with someone else present?

**Purpose**: Body doubling (working alongside someone) helps ADHD focus

**Examples**:
- ✅ **Yes**: Boring tasks, difficult tasks, procrastinated tasks
- ❌ **No**: Deep focus, private work, creative flow

**Recommendations**:
```
Task: "File taxes" + Procrastination Score 5
→ Suggest: "Schedule body doubling session for this"
```

---

#### 🎬 Template/Example Available
**Boolean**: Can you copy an example?

**Purpose**: Examples dramatically reduce cognitive load

**Examples**:
- ✅ **Has Template**: Email template, code snippet, form
- ❌ **No Template**: Create from scratch

**Time Savings**:
```
With template: 5 minutes
Without template: 25 minutes (4x longer)
```

---

## 10. Execution Metadata

### Why It Matters
Once you START a task, these metadata help you successfully COMPLETE it.

### Metadata Fields

#### 🎯 Success Validation
**Type**: Checklist, Output, Feedback, Testing

**Purpose**: Know when you're truly done

**Examples**:
- ✅ **Checklist**: All 5 items checked off
- 📤 **Output**: File created, email sent
- 👥 **Feedback**: Someone confirms it's done
- 🧪 **Testing**: Passes automated test

**ADHD Insight**: Without clear validation, you'll second-guess completion forever.

---

#### 🔢 Measurable Outcome
**Type**: Quantity, Quality, Time, Binary

**Examples**:
- 🔢 **Quantity**: "Send 10 emails"
- ⭐ **Quality**: "Error-free report"
- ⏱️ **Time**: "Complete in 30 minutes"
- ✅ **Binary**: "Posted or not"

**Clarity Boost**:
```
Vague: "Work on project"
Measurable: "Write 500 words of proposal"
```

---

#### 🎮 Gamification Potential
**Scale**: 1-5 (😐 Boring → 🎮 Highly Gamifiable)

**Purpose**: Some tasks can be made fun with timers, challenges, rewards

**Examples**:
- 🎮 **High (5)**: Racing timer on data entry
- 🎯 **Moderate (3)**: Set goal for emails sent
- 😐 **Low (1)**: Hard to gamify

**Gamification Tactics**:
- Timer challenges ("Beat your best time")
- Quantity goals ("Process 20 items")
- Streak tracking ("7 days in a row")
- XP multipliers ("2x XP during happy hour")

---

#### 🧩 Chunking Strategy
**Type**: Time-based, Unit-based, Energy-based

**Purpose**: How to break this into manageable pieces

**Examples**:
- ⏱️ **Time-based**: Pomodoro (25 min chunks)
- 📦 **Unit-based**: Do 10 items at a time
- ⚡ **Energy-based**: Do until tired, then stop
- 🎯 **Milestone-based**: Reach checkpoint A, then B

**ADHD Insight**: Chunking turns marathons into sprints.

---

## Summary: Complete Metadata Schema

### Full Tag System

```yaml
# CHAMPS (Existing)
conversation: ["💬 Communication", "🤔 Decision"]
help: ["💾 Save Progress", "✅ Verify"]
activity: ["🛒 Purchase", "🚗 Travel"]
movement: ["🚗 Travel", "🚶 Move"]
participation: ["⏱️ Sustained"]
success: ["🎯 Complete", "📥 Received"]

# Psychological/Emotional (New)
anxiety_level: 3  # 1-5
mental_difficulty: 4  # 1-5
boredom_risk: 2  # 1-5
procrastination_score: 3  # 1-5 (AI calculated)
fun_factor: 2  # 1-5

# Cognitive Load (New)
decision_count: 5  # Number of decisions required
context_switch_cost: 3  # 1-5
learning_curve: 2  # 1-5
focus_intensity: 4  # 1-5

# Prerequisites & Dependencies (New)
tools_required: ["Figma", "GitHub", "Laptop"]
dependencies: ["task-123", "task-456"]  # Blocking task IDs
location_requirements: ["🏠 Home", "📶 WiFi"]
prerequisites_time: 10  # Minutes to gather what you need

# Sensory & Environmental (New)
noise_tolerance: 3  # 1-5
lighting_needs: "🌙 Dark Mode"
posture_position: "🪑 Sitting"
energy_sensitivity: ["☕ Caffeinated", "😴 Well-rested"]

# Motivation & Reward (New)
impact_score: 4  # 1-5
reward_type: "⚡ Immediate"
visibility: 3  # 1-5 (private to public)
momentum_value: 5  # 1-5 (unlocks other tasks)

# Risk & Safety (New)
failure_cost: 2  # 1-5
undo_ability: 4  # 1-5
has_safety_net: true  # Boolean

# Social & Accountability (New)
accountability_type: "Team"
deadline_urgency: "Firm"
waiting_on_someone: false  # Boolean
social_pressure: 3  # 1-5

# Temporal & Timing (New)
optimal_time_of_day: "🌅 Morning"
day_of_week_pattern: "Tuesday-Thursday"
time_sensitivity: 2  # 1-5
recurrence_pattern: "Weekly"

# Learning & Support (New)
documentation_quality: "📘 Excellent"
expertise_required: 3  # 1-5
body_doubling_beneficial: true  # Boolean
has_template: true  # Boolean

# Execution (New)
success_validation_type: "Checklist"
measurable_outcome: "Send 10 emails"
gamification_potential: 4  # 1-5
chunking_strategy: "Time-based (Pomodoro)"
```

---

## Implementation Priority

### Phase 1: Highest Impact (Implement First)
1. ⚡ **Procrastination Score** (AI learns avoidance patterns)
2. 🧠 **Mental Difficulty** (separate from duration)
3. 🎯 **Impact Score** (focus on what matters)
4. 🔢 **Decision Count** (prevent decision fatigue)
5. 🛠️ **Tools Required** (prevent false starts)
6. 👥 **Accountability Type** (boost completion)
7. 🕐 **Optimal Time of Day** (work with circadian rhythm)

### Phase 2: Medium Impact
8. 😰 **Anxiety Level** (mental health support)
9. 😴 **Boredom Risk** (prevent shutdowns)
10. 🔀 **Context Switch Cost** (efficient batching)
11. ⏱️ **Prerequisites Time** (accurate time estimates)
12. ⚠️ **Failure Cost** (anxiety calibration)
13. 🔁 **Recurrence Pattern** (automate repeating tasks)

### Phase 3: Advanced Features
14. **All remaining fields** (comprehensive system)

---

## Research Questions

### To Validate
1. Does showing **Anxiety Level** help users make better task choices?
2. Does **Procrastination Score** intervention reduce chronic avoidance?
3. Does **Mental Difficulty** + **Duration** improve time estimates?
4. Does **Optimal Time of Day** matching increase completion rates?
5. Does **Body Doubling** suggestion increase adherence?

### To Measure
- Completion rate improvement per metadata field
- User engagement with each metadata type
- Accuracy of AI-generated metadata
- Correlation between metadata and success

---

## Conclusion

CHAMPS provides **structure**. This extended metadata provides:
- **Psychological safety** (anxiety, risk, failure cost)
- **Cognitive clarity** (decisions, difficulty, learning)
- **Practical readiness** (tools, dependencies, location)
- **Motivational alignment** (impact, rewards, accountability)
- **Execution support** (validation, chunking, gamification)

Together, they create a **complete context** that enables ADHD brains to:
1. ✅ Evaluate if now is the right time
2. ✅ Gather what they need
3. ✅ Successfully complete the task
4. ✅ Know when they're done

---

**Next Steps**: Implement Phase 1 fields, measure impact, iterate.

**Document Owner**: Product Team
**Last Review**: October 23, 2025
**Next Review**: November 23, 2025
