# 🚀 Quick Start: ADHD Productivity App Development

**New to this project?** This guide gets you up to speed in 10 minutes.

---

## 🎯 What Are We Building?

An **ADHD-focused productivity app** that helps users complete tasks through:
- **Chevron progress indicators** (visual step-by-step guidance)
- **Gamification** (virtual pets, XP, badges, themes)
- **Mobile-first UX** (minimal overwhelm, focused flows)
- **Smart modes** (Scout for discovery, Today for execution, Mapper for reflection)

**Goal**: Make task completion feel rewarding and doable, not overwhelming.

---

## 📊 Current State

### What We Already Have ✅
1. **AsyncJobTimeline Component** - Production-ready chevron progress bar with animations
2. **Scout/Today/Mapper Modes** - Working mobile task management screens
3. **Backend** - FastAPI + PostgreSQL with AI task decomposition
4. **Gamification** - XP system, achievements, streaks, zone tracking

### What We're Adding 🎯
1. **ChevronTaskFlow** - Full-screen task execution with step-by-step completion (Week 1-2)
2. **Mapper Restructure** - 5 tabs → 2 tabs (MAP/PLAN) with mini chevron nav (Week 3)
3. **Task Templates** - Pre-built step patterns for common workflows (Week 4)
4. **Virtual Pet System** - Pets that grow when you complete tasks (Week 5-6)
5. **Enhanced Gamification** - Per-step XP, unlockable themes, celebration screens (Week 7-8)
6. **Focus Mode** - Pomodoro timer integrated with steps (Week 9)
7. **PWA + AI** - Installable app with AI suggestions and analytics (Week 10-12)

---

## 🗓️ Where We Are Now

**Current Week**: Week 1 of 12
**Current Phase**: Phase 1 - Chevron-ify Existing Modes
**Current Task**: Building ChevronTaskFlow component

**Next Milestone**: Week 3 end - Full chevron task flow + Mapper restructure complete

---

## 📚 Essential Reading (in order)

### 1. **PRD** (20 min read)
👉 [docs/PRD_ADHD_APP.md](../PRD_ADHD_APP.md)

**Why read**: Understand the *why* behind every feature (ADHD brain science, gamification research)

**Key takeaways**:
- Chevron system = visual progress journey (like a game level)
- ADHD needs: immediate rewards, clear structure, minimal friction
- Phases 1-4: MVP → Gamification → Mobile → Business expansion

---

### 2. **Integration Roadmap** (30 min read)
👉 [docs/roadmap/INTEGRATION_ROADMAP.md](./INTEGRATION_ROADMAP.md)

**Why read**: See the *what* and *when* - detailed 12-week plan

**Key sections**:
- Gap Analysis (PRD vs current state)
- Week-by-week deliverables
- Technical specs (database schema, component API)
- Success metrics

---

### 3. **Phase 1 Specs** (15 min read)
👉 [docs/roadmap/PHASE_1_SPECS.md](./PHASE_1_SPECS.md)

**Why read**: Get *how* to build - actual code specs for Weeks 1-3

**Key components**:
- ChevronTaskFlow (full TypeScript spec)
- MiniChevronNav (sticky section indicator)
- MapperMapTab / MapperPlanTab (restructured tabs)

---

## 🛠️ Development Setup (5 min)

### Backend
```bash
cd /path/to/Proxy-Agent-Platform

# Install dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate  # Mac/Linux
# or
.venv\Scripts\activate  # Windows

# Run API server
uv run uvicorn src.api.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

**Open**: http://localhost:3000

---

## 📁 Key Files You'll Touch

### Week 1-2: ChevronTaskFlow
- **Create**: `frontend/src/components/mobile/ChevronTaskFlow.tsx` (new component)
- **Edit**: `frontend/src/components/mobile/modes/TodayMode.tsx` (integrate flow)
- **Test**: Task card → "Start Task" → Step-by-step completion → Celebration

### Week 3: Mapper Restructure
- **Create**:
  - `frontend/src/components/mobile/MiniChevronNav.tsx`
  - `frontend/src/components/mobile/MapperMapTab.tsx`
  - `frontend/src/components/mobile/MapperPlanTab.tsx`
- **Edit**: `frontend/src/components/mobile/modes/MapperMode.tsx`
- **Test**: 2 tabs (MAP/PLAN), 4 snap-scroll sections each, mini nav updates on scroll

---

## 🎨 Design System Quick Reference

### Colors (Solarized Theme)
```typescript
// Already in codebase
import { semanticColors } from '@/lib/design-system';

semanticColors.accent.primary    // #268bd2 (blue)
semanticColors.accent.success    // #859900 (green)
semanticColors.accent.warning    // #cb4b16 (orange)
semanticColors.accent.error      // #dc322f (red)
semanticColors.bg.primary        // #fdf6e3 (light cream)
semanticColors.bg.secondary      // #eee8d5 (darker cream)
semanticColors.text.primary      // #073642 (dark blue-gray)
semanticColors.text.secondary    // #586e75 (gray)
```

### Spacing (4px Grid)
```typescript
import { spacing } from '@/lib/design-system';

spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[6]  // 24px
```

### Typography
```typescript
import { fontSize } from '@/lib/design-system';

fontSize.xs    // 12px
fontSize.sm    // 14px
fontSize.base  // 16px
fontSize.lg    // 18px
fontSize.xl    // 20px
```

---

## 🧩 Component Architecture

### ChevronTaskFlow (Week 1-2)
```
TodayMode
  └─ SwipeableTaskCard
       └─ [Tap] → ChevronTaskFlow (full-screen modal)
            ├─ Header (task title, progress bar, XP earned)
            ├─ AsyncJobTimeline (displays all steps as chevrons)
            ├─ Current Step Card (details, timer, "Complete" button)
            └─ Footer ("Skip for Now" button)
```

**Key Flow**:
1. User taps task card in Today mode
2. ChevronTaskFlow opens (full screen)
3. User sees all steps as chevrons (first step is "active")
4. User clicks "Complete This Step" → chevron turns green, next step activates
5. Repeat until all steps done → CelebrationScreen → Back to Today mode

---

### Mapper Restructure (Week 3)
```
MapperMode
  ├─ Tab Switcher (MAP | PLAN)
  │
  ├─ MAP Tab
  │   ├─ MiniChevronNav (sticky, shows: 📊 🏆 💭 📈)
  │   └─ Vertical Snap Scroll
  │       ├─ Dashboard Section (level, XP, streak, stats)
  │       ├─ Achievements Section (achievement gallery)
  │       ├─ Reflection Section (weekly prompts)
  │       └─ Trends Section (charts - placeholder for Week 11)
  │
  └─ PLAN Tab
      ├─ MiniChevronNav (sticky, shows: 🌅 🧭 🎯 📅)
      └─ Vertical Snap Scroll
          ├─ Rituals Section (time-aware: morning/evening)
          ├─ Vision Section (your why, values, themes)
          ├─ Active Goals Section (quarter/month/week - placeholder)
          └─ Time Horizons Section (today/week/month/quarter - placeholder)
```

**Key Interaction**:
- Swipe down to scroll through sections (snap-scrolling)
- MiniChevronNav shows current position (active chevron highlights)
- Tap chevron in nav → auto-scroll to that section
- Rituals auto-open during ritual times (6-11am, 6-11pm)

---

## ✅ Testing Checklist

### ChevronTaskFlow (Week 1-2)
- [ ] Task opens in full-screen modal from Today mode
- [ ] All micro-steps display as chevrons (via AsyncJobTimeline)
- [ ] First step is "active" (blue chevron with pulse animation)
- [ ] Clicking "Complete This Step" marks chevron as "done" (green)
- [ ] Next step becomes "active" automatically
- [ ] XP calculation correct (base 10 + priority bonus + time bonus)
- [ ] Progress bar updates in real-time
- [ ] Final step completion triggers `onComplete` callback
- [ ] "Skip for Now" closes modal without completing
- [ ] Backend receives step completion events (POST /api/v1/micro-steps/{id}/complete)

### Mapper Restructure (Week 3)
- [ ] Mapper has 2 main tabs: MAP, PLAN
- [ ] Each tab shows MiniChevronNav at top (sticky)
- [ ] MAP tab has 4 sections: Dashboard, Achievements, Reflection, Trends
- [ ] PLAN tab has 4 sections: Rituals, Vision, Active Goals, Time Horizons
- [ ] Vertical snap-scrolling works smoothly
- [ ] Scrolling updates active chevron in MiniChevronNav
- [ ] Clicking chevron in nav scrolls to that section
- [ ] Rituals auto-open during ritual times (test at 9am and 7pm)
- [ ] All existing data preserved (level, XP, achievements, vision board)

---

## 📊 Success Metrics

**Week 3 Goals**:
- ✅ 70%+ of tasks in Today mode get started (ChevronTaskFlow opened)
- ✅ 50%+ of started tasks complete all steps
- ✅ 60%+ users explore both MAP and PLAN tabs
- ✅ No complaints about missing features after Mapper restructure

**How to measure**:
- Add analytics events (PostHog or similar)
- User interviews (5-10 ADHD volunteers)
- Internal dogfooding (use app to build app!)

---

## 🤝 Getting Help

### Before You Ask
1. **Check docs**: PRD → Roadmap → Phase specs
2. **Search code**: Grep for similar components (e.g., AsyncJobTimeline)
3. **Review existing patterns**: See how Scout/Today/Mapper currently work

### Where to Ask
- **Technical questions**: GitHub Discussions
- **Design questions**: Discord #design channel
- **Bug reports**: GitHub Issues (include screenshots!)
- **Blocked?**: Tag @shrenil in Discord or GitHub

### Office Hours
- **Monday 9am**: Weekly kickoff + planning
- **Wednesday 3pm**: Mid-week check-in
- **Friday 4pm**: Demo + retrospective

---

## 🎉 First Task: Build ChevronTaskFlow

**Time estimate**: 4-6 hours

### Step 1: Read Phase 1 Specs (30 min)
👉 [PHASE_1_SPECS.md](./PHASE_1_SPECS.md) - Full TypeScript spec included

### Step 2: Set Up Component File (10 min)
```bash
cd frontend/src/components/mobile
touch ChevronTaskFlow.tsx
```

### Step 3: Copy Boilerplate from Spec (10 min)
Copy the component skeleton from Phase 1 Specs (lines 15-300)

### Step 4: Implement Core Logic (2-3 hours)
- State management (steps, currentStepIndex, totalXpEarned)
- Step completion handler
- XP calculation
- Progress bar

### Step 5: Integrate with TodayMode (30 min)
- Add state: `const [activeTaskFlow, setActiveTaskFlow] = useState(null)`
- Add modal: `{activeTaskFlow && <ChevronTaskFlow ... />}`
- Connect tap handler

### Step 6: Test Locally (1 hour)
- Open Today mode
- Tap task card → Flow opens?
- Complete steps → Chevrons turn green?
- XP calculation correct?
- Final step → onComplete fires?

### Step 7: Create PR (30 min)
- Commit code
- Write PR description (include screenshots!)
- Request review

---

## 🏁 Ready to Start?

1. ✅ Read this guide
2. ✅ Read Phase 1 Specs
3. ✅ Set up development environment
4. ✅ Build ChevronTaskFlow component
5. ✅ Test + create PR
6. 🎉 Celebrate first contribution!

**Questions?** Drop them in Discord or GitHub Discussions.

**Let's build something that actually helps ADHD brains thrive!** 🚀
