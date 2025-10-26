# Product Development Playbook
## Proxy Agent Platform - ADHD-Optimized Development Methodology

**Version**: 1.0
**Last Updated**: October 23, 2025
**Audience**: Product Managers, Developers, Designers

---

## Purpose

This playbook codifies our approach to building ADHD-optimized productivity software. It captures lessons learned, design patterns, and best practices specific to neurodivergent users.

---

## Table of Contents

1. [Core Philosophy](#1-core-philosophy)
2. [ADHD UX Principles](#2-adhd-ux-principles)
3. [Feature Development Workflow](#3-feature-development-workflow)
4. [Testing with ADHD Users](#4-testing-with-adhd-users)
5. [Friction Audits](#5-friction-audits)
6. [Dopamine-Driven Design](#6-dopamine-driven-design)
7. [Pattern Language](#7-pattern-language)
8. [Anti-Patterns](#8-anti-patterns)
9. [Decision Framework](#9-decision-framework)
10. [Success Metrics](#10-success-metrics)

---

## 1. Core Philosophy

### The 2-Second Rule

**Principle**: Any task should be capturable in 2 seconds or less.

**Why**: ADHD users lose context fast. If capture takes >5 seconds, they forget what they were trying to capture.

**Implementation**:
```
Good: Voice input → "Deploy to production" → Captured (1.5s)
Bad:  Open app → Navigate to tasks → Click "New" → Fill form → Save (45s)
```

### The Forgiveness Principle

**Principle**: The system should forgive mistakes, forgotten items, and imperfect data.

**Why**: ADHD users make more mistakes, forget more often, and rarely have perfect information.

**Implementation**:
- Auto-expire stale items (30 days)
- Duplicate detection (24h window)
- Allow corrections without penalty
- Don't force decisions upfront

### The Friction Budget

**Principle**: Every feature has a "friction budget" of 3 taps/clicks maximum.

**Why**: Every extra tap is a chance for distraction.

**Example**:
```
Task completion budget: 3 taps
1. Tap task card
2. Swipe left
3. Tap "Done"
Total: 3 taps ✅
```

---

## 2. ADHD UX Principles

### 2.1 Low Friction Inputs

**BAD ❌**: Multi-step forms with required fields
```
Title: [          ]  *Required
Description: [          ]
Due date: [  /  /    ]  *Required
Priority: [Select...] *Required
Category: [Select...] *Required
Tags: [          ]
[Cancel] [Save]
```

**GOOD ✅**: Single input with smart defaults
```
What do you need to do?
[                                        ]
        ⬆️ Just type and hit enter

Everything else is optional and inferred.
```

### 2.2 Immediate Feedback

**BAD ❌**: Silent processing
```
[Button clicked]
... (nothing happens)
... (user clicks again)
... (3 seconds later) "Error: Duplicate submission"
```

**GOOD ✅**: Instant acknowledgment
```
[Button clicked]
→ Button becomes "Saving..." immediately
→ Spinner appears (100ms)
→ Success animation (500ms)
→ "Saved!" confirmation (1s)
```

### 2.3 Visual Hierarchy

**BAD ❌**: Everything looks equally important
```
┌─────────────────────────────────────┐
│ TASK: Deploy to production          │
│ Due: Tomorrow 3pm                   │
│ Priority: High                      │
│ Category: Engineering               │
│ Estimated time: 2 hours             │
│ Created: Oct 20, 2025 10:43am      │
│ Updated: Oct 23, 2025 9:12am       │
│ Tags: deployment, urgent, backend   │
└─────────────────────────────────────┘
```

**GOOD ✅**: Clear hierarchy, essential info first
```
┌─────────────────────────────────────┐
│ Deploy to production             🔴 │  ← Title + urgency
│ 2h • Tomorrow 3pm                   │  ← Key info
│                                      │
│ deployment  backend                 │  ← Tags (smaller)
└─────────────────────────────────────┘
```

### 2.4 Progressive Disclosure

**BAD ❌**: Show everything at once
```
Dashboard:
- 47 tasks shown
- 12 graphs
- 8 metrics
- 6 widgets
- 20 notifications
Result: Overwhelm → User closes app
```

**GOOD ✅**: Show what matters NOW
```
Dashboard:
┌─────────────────────────┐
│ Right now:              │
│ 🔋 Energy: 85% (HIGH)   │  ← Current state
│                          │
│ Next up:                │
│ • Deploy to production  │  ← Next action
│                          │
│ [Show more ▼]          │  ← Optional details
└─────────────────────────┘
```

### 2.5 Undo Over Confirm

**BAD ❌**: Confirmation dialogs
```
"Are you sure you want to delete this task?"
[Cancel] [Yes, Delete]

User: "Ugh, another click. Yes I'm sure!"
```

**GOOD ✅**: Optimistic with undo
```
Task deleted. [Undo]
           ↑
    (5 second timer, then permanent)
```

### 2.6 Smart Defaults

**BAD ❌**: Force user to decide everything
```
New task:
Priority: [Select...] ← User has to think
Due date: [Select...] ← User has to think
Time estimate: [  ] ← User has to think
```

**GOOD ✅**: Intelligent defaults
```
New task: "Write blog post"
→ Priority: Medium (inferred from keywords)
→ Due: Tomorrow 5pm (user's typical deadline)
→ Estimate: 2h (learned from past similar tasks)

User can change if needed, but doesn't have to.
```

---

## 3. Feature Development Workflow

### 3.1 Feature Spec Template

```markdown
# Feature: [Name]

## Problem Statement
What ADHD challenge does this solve?
- Forgetting tasks?
- Feeling overwhelmed?
- Procrastination?
- Energy mismatch?

## User Story
As an ADHD user,
I want to [action],
So that I can [benefit],
Without [friction].

## Friction Budget
Max taps/clicks: ___
Max time to complete: ___
Max mental load: [Low/Medium/High]

## Design Mockup
[Include wireframe or sketch]

## Success Metrics
- Task completion rate: +___%
- Time to first action: <___s
- User satisfaction: ___/10
- Daily active use: ___%

## Edge Cases
- What if user forgets midway?
- What if input is incomplete?
- What if user makes a mistake?

## Test Plan
- Unit tests: ___
- Integration tests: ___
- User testing: ___ participants
```

### 3.2 Development Checklist

Before shipping any feature:

- [ ] **Friction Audit**: Is it 2-second capturable?
- [ ] **Accessibility**: Keyboard nav + screen reader support
- [ ] **Loading States**: No silent processing
- [ ] **Error Handling**: User-friendly messages
- [ ] **Undo Support**: Can user reverse their action?
- [ ] **Mobile Optimized**: Works on smallest phone screen
- [ ] **Offline Support** (future): Works without internet
- [ ] **ADHD User Testing**: 3+ users validated it
- [ ] **Documentation**: User-facing docs written
- [ ] **Analytics**: Success metrics tracked

---

## 4. Testing with ADHD Users

### 4.1 Recruitment

**Target**: Adults with ADHD diagnosis (or self-identified)

**Screening questions**:
1. Do you have ADHD or ADHD-like traits?
2. What productivity tools do you currently use?
3. What frustrates you most about them?
4. How often do you abandon tasks due to overwhelm?

### 4.2 Testing Protocol

**Session Length**: 30 minutes (ADHD attention span)

**Structure**:
1. **5 min**: Warm-up, explain purpose
2. **15 min**: Task scenarios
3. **5 min**: Think-aloud observations
4. **5 min**: Feedback interview

**Task Scenarios**:
```
Scenario 1: Quick Capture
"You just remembered you need to buy milk. Add it to your shopping list."
→ Measure: Time to completion, number of taps

Scenario 2: Task Completion
"You've finished your report. Mark it as done."
→ Measure: Time to find task, ease of completion

Scenario 3: Energy Check
"You're feeling low energy. Log your current state."
→ Measure: Intuitiveness, speed

Scenario 4: Recovery from Error
"Oops, you accidentally deleted a task. Get it back."
→ Measure: Discoverability of undo, success rate
```

### 4.3 Red Flags

Watch for these signs during testing:

🚩 **User hesitates**: "Wait, where do I click?"
→ Fix: Improve visual hierarchy or add hints

🚩 **User forgets what they were doing**: "Sorry, what was I supposed to do?"
→ Fix: Reduce steps, add progress indicators

🚩 **User expresses frustration**: "This is too many steps"
→ Fix: Reduce friction, simplify workflow

🚩 **User abandons task**: Closes app mid-task
→ Fix: Critical friction issue, redesign immediately

🚩 **User doesn't notice feedback**: "Did it save?"
→ Fix: Make feedback more prominent

### 4.4 Post-Test Survey

```
1. How easy was it to capture a task? (1-10)
2. Did you feel overwhelmed at any point? (Yes/No)
3. What was the most frustrating part?
4. What did you love?
5. Would you use this daily? (Yes/Maybe/No)
6. On a scale of 1-10, how ADHD-friendly is this?
```

**Success Threshold**: Average 8/10 or higher

---

## 5. Friction Audits

### 5.1 Friction Scorecard

Rate each user flow on friction level:

| Flow | Taps/Clicks | Time | Mental Load | Friction Score |
|------|-------------|------|-------------|----------------|
| Quick capture | 2 | 2s | Low | ✅ 1/10 |
| Task creation (full form) | 8 | 45s | High | ❌ 9/10 |
| Shopping list add | 3 | 5s | Low | ✅ 2/10 |
| Energy logging | 2 | 3s | Low | ✅ 1/10 |
| Settings change | 5 | 15s | Medium | ⚠️ 5/10 |

**Goal**: All primary flows <3 friction score

### 5.2 Friction Audit Process

**Monthly Ritual**: Re-audit all primary flows

1. **Time yourself**: How long does it take?
2. **Count interactions**: Taps, clicks, keyboard inputs
3. **Rate mental load**: Low (automatic) / Medium (some thought) / High (complex decision)
4. **Calculate friction score**: `(taps × 0.5) + (seconds × 0.1) + (mental_load × 2)`
5. **Identify bottlenecks**: Which step is slowest?
6. **Brainstorm improvements**: How to reduce friction?
7. **Implement & re-test**: Did friction decrease?

### 5.3 Common Friction Sources

| Friction Source | Impact | Solution |
|----------------|--------|----------|
| **Multi-step forms** | High | Single input + smart defaults |
| **Required fields** | High | Make everything optional, infer from context |
| **Confirmation dialogs** | Medium | Undo instead of confirm |
| **Nested navigation** | High | Flat navigation, 1 tap to any screen |
| **Slow loading** | Medium | Instant feedback + background processing |
| **Unclear labels** | Medium | Action-oriented labels ("Add task" not "Create") |
| **No keyboard shortcuts** | Low | Add for power users |

---

## 6. Dopamine-Driven Design

### 6.1 Why Dopamine Matters for ADHD

ADHD brains have **dopamine dysregulation**:
- Struggle with delayed rewards
- Need immediate feedback
- Crave novelty and variety
- Respond to gamification

**Design Implication**: Build in micro-rewards at every step.

### 6.2 Dopamine Triggers

| Trigger | Implementation | Example |
|---------|----------------|---------|
| **Progress Bars** | Visual completion feedback | Task breakdown progress: ████░░ 60% |
| **Achievements** | Unlock badges for milestones | "🏆 10-Day Streak!" |
| **Streaks** | Daily engagement tracking | "🔥 15 days in a row" |
| **XP/Levels** | Gamified progression | "Level 7 → Level 8 (200 XP to go)" |
| **Animations** | Delightful micro-interactions | Confetti on task completion 🎉 |
| **Sound Effects** | Audio feedback | Satisfying "pop" on completion |
| **Visual Rewards** | Colorful indicators | Energy gauge fills up 🔋 |
| **Social Proof** | Leaderboards, comparisons | "Top 10% of users this week" |

### 6.3 Dopamine Schedule

**Front-load rewards**: Make first wins FAST

```
New User Journey:
┌─────────────────────────────────────────────────────┐
│ Minute 1: First task captured → 🎉 "Great start!"  │  ← Instant reward
│ Minute 5: First task completed → 🏆 Achievement    │  ← Early win
│ Day 1: Three tasks done → ⭐ Streak started        │  ← Daily reward
│ Week 1: 7-day streak → 🔥 Badge unlocked           │  ← Weekly reward
│ Month 1: Level 5 reached → 💎 Premium feature      │  ← Monthly reward
└─────────────────────────────────────────────────────┘
```

**Avoid**: Long droughts without rewards (>1 day)

### 6.4 Novelty & Variety

ADHD brains crave **novelty**. How to provide it:

- **Rotate motivational messages**: "You're crushing it!" → "Keep it up!" → "On fire today!"
- **Seasonal themes**: Halloween mode, holiday themes
- **New achievements**: Add new badges monthly
- **Surprise rewards**: Random bonus XP (1% chance)
- **Visual variety**: Different task card colors based on category

---

## 7. Pattern Language

### Pattern 1: Quick Capture

**Context**: User needs to save a thought before it's forgotten

**Problem**: Traditional forms are too slow

**Solution**:
```
┌─────────────────────────────────────────┐
│ What do you need to do?                  │
│ ┌─────────────────────────────────────┐ │
│ │ _                                    │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ 🎤 Voice input    ⚡ Quick add          │
└─────────────────────────────────────────┘
```

**Implementation**:
- Single text input
- Voice input optional
- Auto-categorize after capture
- No required fields

**Metrics**: <2s capture time

---

### Pattern 2: Swipeable Actions

**Context**: User wants to complete/delete tasks quickly

**Problem**: Multi-step actions increase friction

**Solution**:
```
┌─────────────────────────────────────┐
│ Deploy to production            🔴  │
│ ← Swipe left to complete            │
│ → Swipe right to archive            │
└─────────────────────────────────────┘
```

**Implementation**:
- Touch-friendly swipe gestures
- Visual feedback (color change)
- Undo available for 5 seconds
- Haptic feedback on mobile

**Metrics**: 80%+ actions via swipe (vs menu)

---

### Pattern 3: Progressive Breakdown

**Context**: User has a complex task but feels overwhelmed

**Problem**: Big tasks cause procrastination

**Solution**:
```
Task: "Deploy authentication system"
→ AI breaks down into:
  1. Review code changes (15m)
  2. Run test suite (10m)
  3. Deploy to staging (20m)
  4. QA testing (30m)
  5. Deploy to production (15m)

User sees: "Just start with step 1: Review code (15m)"
```

**Implementation**:
- AI-powered task decomposition
- Show only next step initially
- "Reveal next step" after completion
- Celebrate each micro-win

**Metrics**: 40%+ increase in task completion

---

### Pattern 4: Energy-Aware Scheduling

**Context**: User has low energy but high-energy tasks

**Problem**: Attempting hard tasks at wrong time → failure

**Solution**:
```
Current time: 3:00 PM
Your energy: 🪫 LOW (35%)

❌ Not recommended now:
   • Write quarterly report (high energy)
   • Code review (requires focus)

✅ Perfect for now:
   • File expense reports (low energy)
   • Respond to emails (low energy)

💡 High energy predicted at 5:30 PM
   Schedule hard tasks then?
```

**Implementation**:
- Track energy patterns
- Predict energy levels
- Suggest appropriate tasks
- Allow overrides

**Metrics**: 25%+ increase in task completion

---

### Pattern 5: Forgiveness System

**Context**: User forgot about an item for 30 days

**Problem**: Stale data clutters the system

**Solution**:
```
Auto-expire logic:
- Item added 30 days ago
- Status still "active"
- No interaction in 30 days
→ Auto-mark as "expired"
→ Notify user: "We archived 'Buy milk' (added 30 days ago)"
→ User can undo if needed
```

**Implementation**:
- Daily cron job checks for stale items
- Expire after 30 days of inactivity
- Notify user (non-intrusive)
- Undo available for 7 days

**Metrics**: 90%+ of expired items stay expired (accurate detection)

---

## 8. Anti-Patterns

### Anti-Pattern 1: Forced Onboarding

❌ **Bad**:
```
Welcome! Let's set up your account.

Step 1/7: What's your name? [        ]
Step 2/7: What's your goal? [Select...]
Step 3/7: When do you work best? [Select...]
...
[You must complete all steps to continue]
```

✅ **Good**:
```
Welcome! Let's get started.

First task: [                        ]
          ⬆️ Just type what you need to do

We'll learn about you as you use the app.
[Skip setup ➜]
```

**Why**: ADHD users abandon multi-step onboarding.

---

### Anti-Pattern 2: Settings Overload

❌ **Bad**:
```
Settings (87 options):

General:
  - Language [Select...]
  - Theme [Select...]
  - Font size [Select...]
  - Animations [On/Off]
  - Sound effects [On/Off]
  ...

Notifications:
  - Enable notifications [On/Off]
  - Email notifications [On/Off]
  - Push notifications [On/Off]
  - Frequency [Select...]
  ...

(5 more categories, 20+ options each)
```

✅ **Good**:
```
Settings:

Essentials:
  - Notifications [On]
  - Theme [Dark]

[Advanced settings ▼]
```

**Why**: Decision fatigue. Most users never change settings.

---

### Anti-Pattern 3: Invisible Feedback

❌ **Bad**:
```
[User taps "Save"]
... (nothing visible happens)
... (3 seconds later, silently saves)
```

✅ **Good**:
```
[User taps "Save"]
→ Button changes to "Saving..." (100ms)
→ Spinner appears (200ms)
→ Success checkmark (500ms)
→ "Saved!" toast notification (1s)
→ Haptic feedback (mobile)
```

**Why**: ADHD users need immediate confirmation that their action worked.

---

### Anti-Pattern 4: Punishing Mistakes

❌ **Bad**:
```
Task deleted.

[No undo option]

User: "Wait, I didn't mean to delete that!"
User: *searches for 10 minutes to find undo*
User: *gives up and rewrites task from memory*
```

✅ **Good**:
```
Task deleted. [Undo]
           ↑
    (5 second timer)

User: "Oops!" *taps Undo*
Task restored.
```

**Why**: ADHD users make mistakes more often. System should be forgiving.

---

### Anti-Pattern 5: Complex Task Creation

❌ **Bad**:
```
New Task Form:

Title: [                  ] *Required
Description: [                  ]
Due Date: [MM/DD/YYYY] *Required
Start Time: [HH:MM] *Required
End Time: [HH:MM] *Required
Priority: [Select...] *Required
Category: [Select...] *Required
Tags: [                  ]
Assignee: [Select...]
Reminders: [Add reminder]
Attachments: [Upload file]
Notes: [                  ]

[Cancel] [Save]
```

✅ **Good**:
```
New Task:

What do you need to do?
┌──────────────────────────────┐
│ _                             │
└──────────────────────────────┘

[Add]  ← That's it. Everything else is optional.
```

**Why**: Friction kills momentum. Capture first, refine later.

---

## 9. Decision Framework

When making product decisions, use this framework:

### 9.1 The ADHD Decision Matrix

Score each option (0-10):

| Criterion | Weight | Option A | Option B |
|-----------|--------|----------|----------|
| **Low Friction** | 3× | ___ | ___ |
| **Immediate Feedback** | 2× | ___ | ___ |
| **Forgiveness** | 2× | ___ | ___ |
| **Dopamine Trigger** | 1× | ___ | ___ |
| **Development Cost** | 1× | ___ | ___ |

**Formula**: `Score = Σ(Criterion × Weight)`

**Example**:
```
Feature: Voice input vs. Keyboard shortcuts

Voice Input:
  - Low Friction: 10 × 3 = 30
  - Immediate Feedback: 9 × 2 = 18
  - Forgiveness: 7 × 2 = 14  (can't undo speech easily)
  - Dopamine: 8 × 1 = 8
  - Dev Cost: 5 × 1 = 5  (expensive)
  Total: 75

Keyboard Shortcuts:
  - Low Friction: 8 × 3 = 24
  - Immediate Feedback: 10 × 2 = 20
  - Forgiveness: 9 × 2 = 18
  - Dopamine: 5 × 1 = 5
  - Dev Cost: 9 × 1 = 9  (cheap)
  Total: 76

Decision: Implement keyboard shortcuts first (higher score, lower cost)
```

### 9.2 The "Would I Use This?" Test

Before building any feature, answer:

1. **Would I use this daily?** (Yes/No)
2. **Would I use this when I'm distracted?** (Yes/No)
3. **Would I use this when I'm low energy?** (Yes/No)
4. **Would I recommend this to my ADHD friends?** (Yes/No)

**Threshold**: 3/4 "Yes" answers required to proceed.

---

## 10. Success Metrics

### 10.1 Product Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Daily Active Users (DAU)** | 70% | TBD | 🔄 |
| **Task Capture Time** | <2s | ~1.5s | ✅ |
| **Task Completion Rate** | 60% | TBD | 🔄 |
| **7-Day Retention** | 40% | TBD | 🔄 |
| **30-Day Retention** | 20% | TBD | 🔄 |
| **Average Session Length** | 3-5 min | TBD | 🔄 |
| **Tasks Created per User per Day** | 3-5 | TBD | 🔄 |
| **Tasks Completed per User per Day** | 2-3 | TBD | 🔄 |

### 10.2 UX Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Time to First Task Capture** | <30s | TBD | 🔄 |
| **Friction Score (primary flows)** | <3 | ~2 | ✅ |
| **User Satisfaction (ADHD-friendliness)** | 8/10 | TBD | 🔄 |
| **Task Abandonment Rate** | <10% | TBD | 🔄 |
| **Undo Usage Rate** | 5-10% | TBD | 🔄 |
| **Voice Input Adoption** | 30% | 0% | ❌ |

### 10.3 Health Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Burnout Reports** | <5% | TBD | 🔄 |
| **"Overwhelmed" Feedback** | <10% | TBD | 🔄 |
| **Energy Level Accuracy** | >75% | TBD | 🔄 |
| **Feature Overwhelm** | <15% | TBD | 🔄 |

### 10.4 How to Measure

**Analytics Events to Track**:
```javascript
// Task capture
track('task_captured', {
  method: 'voice' | 'text' | 'quick_add',
  time_to_capture: 1.8,  // seconds
  user_energy_level: 'high'
})

// Task completion
track('task_completed', {
  method: 'swipe' | 'button' | 'menu',
  time_from_creation: 3600,  // seconds
  micro_steps_completed: 5
})

// User frustration signals
track('user_frustration', {
  signal: 'back_button' | 'app_close' | 'rapid_clicks',
  context: 'task_form'
})
```

---

## Conclusion

Building for ADHD users requires:
- **Empathy**: Understand their struggles
- **Simplicity**: Reduce friction everywhere
- **Forgiveness**: Allow mistakes
- **Dopamine**: Reward constantly
- **Testing**: Validate with real users

**Remember**: If it's hard to use, it won't get used. ADHD users abandon friction.

---

**Playbook Maintained By**: Product Team
**Last Updated**: October 23, 2025
**Next Review**: January 2026

**Feedback**: Share your ADHD UX discoveries with the team!
