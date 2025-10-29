# 🗺️ ADHD Productivity App: PRD Integration Roadmap

**Last Updated**: 2025-01-28
**Timeline**: 12 weeks (Phased rollout)
**Strategy**: Enhance existing modes with PRD chevron-centric philosophy

---

## 📊 Executive Summary

This roadmap integrates the comprehensive [PRD requirements](../PRD_ADHD_APP.md) with our existing codebase, which already has strong foundations:
- ✅ Complete chevron system (AsyncJobTimeline, ChevronStep)
- ✅ Working mobile modes (Scout, Today, Mapper)
- ✅ Gamification infrastructure (XP, achievements, streaks)
- ✅ Backend with AI task decomposition

**Approach**: Progressive enhancement over 12 weeks, keeping existing features while adding PRD's core philosophy of task→steps→completion→reward flow.

---

## 🎯 Gap Analysis

### What We Have ✅
1. **Chevron Components**: Production-ready AsyncJobTimeline with SVG chevrons, animations, and hierarchical decomposition
2. **Mode Architecture**: Scout (discovery), Today (execution), Mapper (reflection/planning)
3. **Gamification**: XP system, achievement gallery, streak tracking, zone-based organization
4. **Backend**: FastAPI + PostgreSQL with micro-steps, AI decomposition, proper repository patterns
5. **Design System**: Solarized theme, 4px grid, OpenMoji embossed style

### What PRD Adds 🎯
1. **Core Flow**: Task creation → manual step breakdown → chevron progress UI → step-by-step completion
2. **Enhanced Gamification**: Virtual pet system, per-step rewards, unlockable themes, celebration screens
3. **ADHD UX**: Linear focused flows, minimal overwhelm (2-3 screens), onboarding tutorial
4. **Task Templates**: Pre-built step patterns for common workflows
5. **Focus Integration**: Pomodoro timer per step, do-not-disturb mode

---

## 📅 12-Week Implementation Plan

### **Phase 1: Chevron-ify Existing Modes** (Weeks 1-3)

#### Week 1-2: ChevronTaskFlow Component
**Goal**: Create full-screen task execution with chevron stepper

**Deliverables**:
- [ ] `frontend/src/components/mobile/ChevronTaskFlow.tsx`
  - Full-screen modal for active task
  - Displays task's micro-steps as AsyncJobTimeline
  - Step completion triggers XP award
  - "Complete Task" celebration transition
- [ ] Integrate with TodayMode:
  - Add "Start Task" button on swipeable cards
  - Opens ChevronTaskFlow on tap
  - Returns to card stack after completion
- [ ] Basic celebration animation (confetti, XP display)
- [ ] Test flow: Task → Steps → Complete → Reward → Next Task

**Technical Notes**:
```typescript
// ChevronTaskFlow.tsx architecture
interface ChevronTaskFlowProps {
  task: Task;
  onComplete: (task: Task, completedSteps: number) => void;
  onDismiss: () => void;
}

// State management
- Current step index
- Step completion status
- Cumulative XP earned
- Focus timer state (if enabled)
```

**Acceptance Criteria**:
- User can start task from Today mode
- All micro-steps displayed as chevrons
- Completing step marks chevron as "done" with animation
- Final step triggers celebration screen
- XP awarded correctly (per step + bonus for full task)

---

#### Week 3: Mapper Mode Restructuring
**Goal**: Implement MAP/PLAN split per [brainstorm doc](../design/MAPPER_SUBTABS_BRAINSTORM.md)

**Deliverables**:
- [ ] `frontend/src/components/mobile/MiniChevronNav.tsx`
  - Sticky header with nano-sized chevron progress indicator
  - Shows current section in MAP or PLAN tab
  - Clickable to jump between sections
- [ ] `frontend/src/components/mobile/MapperMapTab.tsx`
  - Vertical snap-scrolling sections: Dashboard, Achievements, Reflection, Trends
  - Reuses existing Overview/Achievement components
- [ ] `frontend/src/components/mobile/MapperPlanTab.tsx`
  - Vertical snap-scrolling sections: Rituals, Vision, Active Goals, Time Horizons
  - Time-aware ritual auto-open (6-11am, 6-11pm)
- [ ] Update `MapperMode.tsx` to use 2-tab structure
- [ ] Scroll detection for updating MiniChevronNav active state

**Technical Notes**:
```typescript
// MiniChevronNav.tsx
interface MiniChevronNavProps {
  sections: { id: string; label: string; icon: string }[];
  currentSection: string;
  onNavigate: (sectionId: string) => void;
}

// MapperMode.tsx refactor
const [activeTab, setActiveTab] = useState<'map' | 'plan'>('map');
const [activeMapSection, setActiveMapSection] = useState('dashboard');
const [activePlanSection, setActivePlanSection] = useState('rituals');

// Auto-open logic
useEffect(() => {
  const hour = new Date().getHours();
  const isRitualTime = (hour >= 6 && hour < 11) || (hour >= 18 && hour < 23);
  if (isRitualTime && activeTab !== 'plan') {
    setActiveTab('plan');
    setActivePlanSection('rituals');
  }
}, []);
```

**Acceptance Criteria**:
- Mapper has 2 main tabs: MAP, PLAN
- Each tab has 4 snap-scrollable sections
- MiniChevronNav shows current position
- Rituals auto-open during ritual times
- All existing features preserved (no data loss)

---

### **Phase 2: Enhanced Gamification** (Weeks 4-6)

#### Week 4: Task Templates
**Goal**: Add PRD's template system for task creation

**Deliverables**:
- [ ] Backend: Template CRUD endpoints
  ```python
  # src/database/models/task_template.py
  class TaskTemplate(BaseModel):
      template_id: UUID
      name: str  # "Homework Assignment"
      description: str
      category: str  # "Academic", "Work", "Personal"
      default_steps: List[TemplateStep]
      icon: str
      estimated_minutes: int

  class TemplateStep(BaseModel):
      step_order: int
      description: str
      short_label: str
      estimated_minutes: int
      leaf_type: Literal["DIGITAL", "HUMAN"]
  ```
- [ ] `frontend/src/components/mobile/TaskTemplateLibrary.tsx`
  - Grid of template cards with icons
  - Preview template's chevron structure on select
  - "Customize" option before creating task
- [ ] Integrate into Scout/Capture mode
- [ ] Seed 5 starter templates:
  1. "Homework Assignment" (Research → Draft → Revise → Submit)
  2. "Morning Routine" (Shower → Breakfast → Plan Day)
  3. "Email Inbox Zero" (Scan → Respond → Archive)
  4. "Creative Project" (Brainstorm → Outline → Iterate → Finalize)
  5. "Weekly Review" (Collect → Reflect → Plan → Commit)

**Technical Notes**:
```typescript
// Template picker flow
TaskTemplateLibrary → Select template → Preview steps → Customize (optional) → Create task

// API integration
POST /api/v1/task-templates
GET /api/v1/task-templates?category=Academic
POST /api/v1/tasks/from-template/{template_id}
```

**Acceptance Criteria**:
- Users can browse templates in Scout mode
- Selecting template creates task with pre-filled steps
- Steps are editable before final creation
- Templates reduce task creation time by 50%+ (measured)

---

#### Week 5-6: Virtual Pet System
**Goal**: Implement PRD Phase 2 animal reward system

**Deliverables**:
- [ ] Backend: Pet system models and logic
  ```python
  # src/database/models/user_pet.py
  class UserPet(BaseModel):
      pet_id: UUID
      user_id: str
      species: Literal["dog", "cat", "dragon", "owl", "fox"]
      name: str
      level: int  # 1-10
      xp: int
      hunger: int  # 0-100 (decreases over time)
      happiness: int  # 0-100 (based on completed tasks)
      evolution_stage: int  # 1 (baby), 2 (teen), 3 (adult)
      created_at: datetime
      last_fed_at: datetime

  # State machine
  def feed_pet(xp_earned: int):
      pet.hunger = min(100, pet.hunger + xp_earned // 10)
      pet.happiness = min(100, pet.happiness + 5)
      pet.xp += xp_earned
      if pet.xp >= xp_for_next_level(pet.level):
          pet.level += 1
          check_evolution(pet)
  ```
- [ ] `frontend/src/components/mobile/PetWidget.tsx`
  - Displays pet sprite (animated SVG or Lottie)
  - Status bars: hunger, happiness, XP progress
  - Tap to interact (pet animation)
  - Shown in Mapper→Dashboard section
- [ ] `frontend/src/components/mobile/PetSelectionModal.tsx`
  - First-time setup: choose pet species
  - Name input
  - Introduction to feeding mechanic
- [ ] Feeding animations:
  - After task completion → "Feed [PetName]" screen
  - Pet eats XP (animation)
  - Happiness/hunger bars update
  - Pet reaction (happy bounce, purr sound)
- [ ] Evolution logic:
  - Level 5 → Teen stage (visual change)
  - Level 10 → Adult stage (final form)
  - Celebrate evolution with special animation

**Pet Species & Personalities**:
1. **Dog** 🐕: Enthusiastic, high-energy feedback
2. **Cat** 🐱: Independent, calm encouragement
3. **Dragon** 🐉: Fierce, challenging (for competitive users)
4. **Owl** 🦉: Wise, analytical (focus on learning)
5. **Fox** 🦊: Clever, playful (ADHD-friendly chaos)

**Technical Notes**:
```typescript
// Pet widget in Mapper→Dashboard
<PetWidget
  pet={userPet}
  onInteract={() => playPetAnimation()}
  compact={true}  // Small widget version
/>

// Post-task feeding flow
TaskComplete → CelebrationScreen (XP earned) → FeedPetScreen (animation) → Return to mode
```

**Acceptance Criteria**:
- Users choose pet on first launch
- Pet appears in Mapper dashboard
- Task completion triggers feeding animation
- Pet level/evolution visible and meaningful
- Users report emotional connection to pet (qualitative feedback)

---

### **Phase 3: Mobile Optimization** (Weeks 7-9)

#### Week 7: Enhanced Gamification (Points, Badges, Themes)
**Goal**: Per-step rewards and unlockable content

**Deliverables**:
- [ ] Per-step XP calculation:
  ```python
  # Step XP = base (10) + priority_bonus + time_bonus
  def calculate_step_xp(step: MicroStep) -> int:
      base_xp = 10
      priority_bonus = {"high": 5, "medium": 3, "low": 1}
      time_bonus = min(step.estimated_minutes // 5, 10)  # Max +10 for long steps
      return base_xp + priority_bonus.get(step.priority, 0) + time_bonus
  ```
- [ ] New badge definitions (20+ total):
  - **Streak Badges**: "3-Day Streak 🔥", "7-Day Streak ⚡", "30-Day Streak 🏆"
  - **Volume Badges**: "10 Steps Completed", "100 Steps Completed", "500 Steps Completed"
  - **Speed Badges**: "Morning Warrior" (3 tasks before 9am), "Night Owl" (task after 10pm)
  - **Specialty Badges**: "Quick Win Master" (10 <15min tasks), "Marathon Runner" (task >2hr)
  - **Pet Badges**: "Pet Whisperer" (pet level 5), "Evolution Master" (evolved pet to adult)
- [ ] Unlockable themes (5 color palettes for chevrons):
  1. **Solarized** (default) - current colors
  2. **Neon Nights** - Dark mode with vibrant accents
  3. **Forest Calm** - Green/brown earth tones
  4. **Ocean Breeze** - Blue/teal gradients
  5. **Sunset Glow** - Orange/pink warm tones
- [ ] Theme unlock logic:
  - Solarized: Free (default)
  - Neon Nights: Unlock at Level 5
  - Forest Calm: Complete 50 tasks
  - Ocean Breeze: Maintain 7-day streak
  - Sunset Glow: Evolve pet to Adult stage
- [ ] Theme switcher in Mapper→Dashboard

**Technical Notes**:
```typescript
// Theme system
interface ChevronTheme {
  name: string;
  colors: {
    pending: { fill: string; stroke: string };
    active: { fill: string; stroke: string };
    done: { fill: string; stroke: string };
    error: { fill: string; stroke: string };
    next: { fill: string; stroke: string };
  };
}

// ChevronStep component accepts theme prop
<ChevronStep
  status="active"
  position="middle"
  size="full"
  theme={userSelectedTheme}  // Override default colors
/>
```

**Acceptance Criteria**:
- Completing step awards XP immediately (not just on task complete)
- Badge notifications appear on unlock (toast or modal)
- Users can preview locked themes (grayed out)
- Theme changes apply globally to all chevrons
- Badge gallery in Mapper→Achievements shows progress toward locked badges

---

#### Week 8: Celebration & Onboarding
**Goal**: Post-completion rewards and first-time tutorial

**Deliverables**:
- [ ] `frontend/src/components/mobile/CelebrationScreen.tsx`
  - Full-screen takeover on task completion
  - Animated confetti (react-confetti or Lottie)
  - XP breakdown:
    - Per-step XP earned
    - Task completion bonus
    - Total XP this session
  - Pet reaction animation (if applicable)
  - Badge unlock notification (if triggered)
  - "Next Task" suggestion button
  - Dismiss after 3 seconds (auto or manual)
- [ ] `frontend/src/components/mobile/OnboardingFlow.tsx`
  - 3-screen tutorial on first launch:
    1. "Welcome! This app helps you complete tasks step-by-step"
    2. "Meet the Chevrons" (interactive demo: tap step → turns green)
    3. "Choose Your Pet" (species selection)
  - Skip button (for power users)
  - Stores completion in localStorage
- [ ] A/B test celebration intensity:
  - **Variant A**: Full confetti + sound + 3s animation
  - **Variant B**: Minimal (just XP number + quick fade)
  - Track user preference ("Turn off celebrations" setting)

**Technical Notes**:
```typescript
// CelebrationScreen props
interface CelebrationScreenProps {
  xpEarned: number;
  xpBreakdown: { stepId: string; xp: number; description: string }[];
  badgesUnlocked: Badge[];
  petReaction: 'happy' | 'excited' | 'proud';
  nextTask?: Task;
  onDismiss: () => void;
  onNextTask: () => void;
}

// Celebration lifecycle
TaskComplete → [Celebration animation 2s] → [Badge unlock 1s] → [Pet feed 2s] → Dismiss
```

**Acceptance Criteria**:
- Celebration screen appears after every task completion
- Users can disable celebrations in settings
- Onboarding shows on first launch only
- Interactive chevron demo works (tap → state change)
- Pet selection persists after onboarding

---

#### Week 9: Focus Mode Integration
**Goal**: Pomodoro timer per step

**Deliverables**:
- [ ] `frontend/src/components/mobile/FocusTimer.tsx`
  - Countdown timer (default 25 minutes, configurable)
  - Large display (time remaining in MM:SS)
  - Pause/Resume buttons
  - "Skip to next step" option
  - Sound notification on completion (gentle chime)
  - Haptic feedback on start/stop (Web Vibration API)
- [ ] Integrate into ChevronTaskFlow:
  - "Start Focus Session" button on active step
  - Timer overlay on chevron progress bar
  - Disable mode switching during focus (optional)
  - Track "focus minutes" per step
- [ ] Do-Not-Disturb mode:
  - Hide bottom navigation during focus
  - Suppress notifications (if PWA)
  - Dim non-active chevrons
- [ ] Break reminders:
  - After 25min focus → "Take 5-minute break"
  - After 4 focus sessions → "Take 15-minute break"
  - Skip break option (for hyperfocus)

**Technical Notes**:
```typescript
// FocusTimer state machine
type FocusState = 'idle' | 'running' | 'paused' | 'break' | 'completed';

interface FocusTimerProps {
  stepId: string;
  durationMinutes: number;  // Default 25
  onComplete: () => void;
  onSkip: () => void;
}

// Focus session tracking (for analytics)
interface FocusSession {
  session_id: UUID;
  step_id: UUID;
  started_at: datetime;
  duration_minutes: number;
  completed: boolean;
  interruptions: number;
}
```

**Acceptance Criteria**:
- Timer counts down accurately (1-second intervals)
- User can pause/resume without losing progress
- Completing timer marks step as done
- Focus sessions logged to backend (for Trends analysis)
- Break reminders appear after configured intervals

---

### **Phase 4: Advanced Features** (Weeks 10-12)

#### Week 10: PWA Optimization
**Goal**: Make web app installable and offline-capable

**Deliverables**:
- [ ] PWA manifest (`public/manifest.json`):
  ```json
  {
    "name": "ADHD Task Hero",
    "short_name": "TaskHero",
    "description": "Step-by-step task completion for ADHD brains",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#268bd2",
    "background_color": "#002b36",
    "icons": [
      {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
      {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png"}
    ]
  }
  ```
- [ ] Service worker for offline support:
  - Cache critical assets (index.html, CSS, JS)
  - Cache task data in IndexedDB
  - Sync tasks when back online (Background Sync API)
- [ ] Install prompts:
  - iOS: "Add to Home Screen" instructions
  - Android: Native install banner
  - Dismiss/remind later logic
- [ ] Haptic feedback:
  - Step completion: short pulse
  - Task completion: double pulse
  - Badge unlock: long pulse
  - Uses Web Vibration API
- [ ] Performance audit:
  - Run Lighthouse (target: 90+ score)
  - Optimize bundle size (code splitting)
  - Lazy load heavy components (pet animations)

**Technical Notes**:
```javascript
// Service worker strategy (Next.js with next-pwa)
module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.example\.com\/.*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 }
        }
      }
    ]
  }
});

// Haptic feedback helper
function haptic(pattern: 'short' | 'double' | 'long') {
  if ('vibrate' in navigator) {
    const patterns = { short: 50, double: [50, 100, 50], long: 200 };
    navigator.vibrate(patterns[pattern]);
  }
}
```

**Acceptance Criteria**:
- App installable on iOS (via Add to Home Screen)
- App installable on Android (via install prompt)
- Basic features work offline (view cached tasks)
- Haptic feedback works on supported devices
- Lighthouse score 90+ (Performance, Accessibility, Best Practices)

---

#### Week 11: AI & Analytics
**Goal**: AI step suggestions and pattern insights

**Deliverables**:
- [ ] AI step suggestions in task creation:
  - "Suggest Steps" button in Scout/Capture
  - Sends task title/description to PydanticAI
  - Returns 3-5 suggested micro-steps
  - User can edit, reorder, or regenerate
  - Learns from user edits (implicit feedback)
- [ ] Trends tab in Mapper→MAP:
  - Weekly completion rate chart (line graph)
  - Tasks completed by time of day (bar chart)
  - Energy level patterns (heatmap)
  - Zone balance pie chart (% tasks per zone)
  - Export data as CSV
- [ ] Pattern recognition insights:
  - "You complete most tasks between 9-11am"
  - "Digital tasks have 70% completion rate (vs 50% for human tasks)"
  - "Your 3-day streaks average 5 tasks per day"
  - "You're most productive on Tuesdays"
- [ ] Adaptive nudges:
  - Low energy detected (< 40%) → "Try a Quick Win task"
  - High streak (7+ days) → "You're on fire! Don't break it!"
  - Stale task (not touched in 7 days) → "Still interested in [Task]?"
  - Best time window → "It's 9am - your peak productivity hour!"

**Technical Notes**:
```python
# AI step suggestion endpoint
@router.post("/api/v1/tasks/suggest-steps")
async def suggest_steps(
    task_title: str,
    task_description: Optional[str],
    user_id: str
) -> List[SuggestedStep]:
    """
    Uses PydanticAI to break down task into micro-steps.
    Considers user's past step patterns for personalization.
    """
    # Fetch user's historical step patterns
    past_steps = await get_user_step_patterns(user_id)

    # Generate suggestions with AI
    suggestions = await ai_agent.decompose_task(
        title=task_title,
        description=task_description,
        examples=past_steps  # Few-shot learning
    )

    return suggestions

# Analytics queries (PostgreSQL)
-- Completion rate by hour
SELECT EXTRACT(HOUR FROM completed_at) as hour, COUNT(*)
FROM tasks
WHERE status = 'completed' AND user_id = $1
GROUP BY hour
ORDER BY hour;

-- Zone balance
SELECT zone, COUNT(*) as task_count
FROM tasks
WHERE user_id = $1 AND status = 'completed'
GROUP BY zone;
```

**Acceptance Criteria**:
- AI suggestions generate 3-5 reasonable steps
- Users accept AI suggestions 60%+ of the time (measured)
- Trends tab shows accurate data (cross-checked with DB)
- At least 3 actionable insights shown per user
- Nudges appear contextually (not spammy)

---

#### Week 12: Polish & User Testing
**Goal**: Refinement and validation with ADHD users

**Deliverables**:
- [ ] User testing with 5-10 ADHD volunteers:
  - Recruit via ADHD communities (Reddit r/ADHD, Discord servers, Twitter)
  - Provide beta access (TestFlight for iOS, APK for Android)
  - Structured feedback sessions (30-min interviews)
  - Key questions:
    - Does the chevron flow help you complete tasks?
    - Is the pet system motivating or distracting?
    - Are celebrations too much/just right/not enough?
    - What's your completion rate before vs after using app?
- [ ] Accessibility audit:
  - WCAG 2.1 Level AA compliance
  - Screen reader testing (VoiceOver, TalkBack)
  - Keyboard navigation (for users who can't tap)
  - Color contrast ratios (4.5:1 minimum)
  - Focus indicators on all interactive elements
- [ ] Performance optimization:
  - Profile React components (React DevTools Profiler)
  - Reduce re-renders (React.memo, useMemo)
  - Optimize SVG animations (requestAnimationFrame)
  - Lazy load routes (Next.js dynamic imports)
- [ ] Bug fixes:
  - Triage user-reported issues
  - Fix high-priority bugs (crashes, data loss)
  - Polish edge cases (empty states, error handling)
- [ ] Documentation:
  - Update README with feature screenshots
  - Create user guide (How to create task, use templates, feed pet)
  - Record 2-min demo video for landing page
  - Write developer docs (component API, backend endpoints)

**Testing Protocol**:
```markdown
## User Testing Script

### Pre-Test (5 min)
- Demographic: Age, ADHD diagnosis (self-reported), current productivity tools
- Baseline: "How many tasks do you complete in a typical day?"

### Task 1: First-Time Experience (10 min)
- Open app (onboarding)
- Choose pet and name it
- Create first task using template (e.g., "Homework Assignment")
- Complete all steps via ChevronTaskFlow
- Observe: confusion points, time to completion, emotional reaction to celebration

### Task 2: Daily Workflow (10 min)
- Navigate to Today mode
- Start 2-3 tasks from card stack
- Use focus timer on one task
- Feed pet after completion
- Observe: engagement, distraction, ease of navigation

### Post-Test Interview (5 min)
- "What did you like most/least?"
- "Would you use this daily? Why or why not?"
- "Rate on 1-10: How ADHD-friendly is this app?"
- "What feature would you add/remove?"

### Metrics to Track
- Time to first task completion
- Task completion rate (# completed / # attempted)
- Pet interaction frequency
- Settings used (theme changes, celebration toggle)
- Drop-off points (where users quit)
```

**Acceptance Criteria**:
- 5+ ADHD users complete testing
- Average ADHD-friendliness rating: 7/10 or higher
- No critical accessibility violations (WCAG)
- App loads in < 3 seconds on 3G connection
- All P0/P1 bugs fixed before launch

---

## 🎨 Design System Updates

### New Color Themes (for unlockable chevrons)

```typescript
// themes.ts
export const chevronThemes = {
  solarized: {  // Default
    pending: { fill: '#fdf6e3', stroke: '#93a1a1' },
    active: { fill: '#eef4fb', stroke: '#268bd2' },
    done: { fill: '#eef2e6', stroke: '#859900' },
    error: { fill: '#fae8e8', stroke: '#dc322f' },
    next: { fill: '#fdf2e1', stroke: '#cb4b16' },
  },
  neonNights: {
    pending: { fill: '#1a1a2e', stroke: '#16213e' },
    active: { fill: '#0f3460', stroke: '#00d4ff' },
    done: { fill: '#16213e', stroke: '#39ff14' },
    error: { fill: '#1a1a2e', stroke: '#ff006e' },
    next: { fill: '#16213e', stroke: '#fb5607' },
  },
  forestCalm: {
    pending: { fill: '#f1f8e9', stroke: '#9e9d89' },
    active: { fill: '#dcedc8', stroke: '#558b2f' },
    done: { fill: '#c5e1a5', stroke: '#33691e' },
    error: { fill: '#ffccbc', stroke: '#bf360c' },
    next: { fill: '#ffe0b2', stroke: '#e65100' },
  },
  oceanBreeze: {
    pending: { fill: '#e0f7fa', stroke: '#4dd0e1' },
    active: { fill: '#b2ebf2', stroke: '#00acc1' },
    done: { fill: '#80deea', stroke: '#00838f' },
    error: { fill: '#ffccbc', stroke: '#d84315' },
    next: { fill: '#ffe0b2', stroke: '#ef6c00' },
  },
  sunsetGlow: {
    pending: { fill: '#fff3e0', stroke: '#ffb74d' },
    active: { fill: '#ffe0b2', stroke: '#ff9800' },
    done: { fill: '#ffcc80', stroke: '#f57c00' },
    error: { fill: '#ffccbc', stroke: '#e64a19' },
    next: { fill: '#fff9c4', stroke: '#fbc02d' },
  },
};
```

### Pet Sprite Specifications

**Design Requirements**:
- SVG format (scalable, small file size)
- 3 evolution stages per species (baby → teen → adult)
- Animated states: idle, happy, eating, sleeping
- Color palette matches chevron themes (optional theme variants)

**File Structure**:
```
frontend/public/pets/
  dog/
    baby-idle.svg
    baby-happy.svg
    teen-idle.svg
    adult-idle.svg
    adult-eating.svg
  cat/
    ...
  dragon/
    ...
```

**Animation Style**:
- Lottie JSON (for complex animations)
- CSS keyframes (for simple bounces, rotates)
- Max 500KB per animation file

---

## 🗂️ Database Schema Updates

### New Tables

```sql
-- Task templates
CREATE TABLE task_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),  -- 'Academic', 'Work', 'Personal'
    icon VARCHAR(50),  -- Emoji or icon name
    estimated_minutes INT,
    created_by VARCHAR(255),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_steps (
    step_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES task_templates(template_id) ON DELETE CASCADE,
    step_order INT NOT NULL,
    description TEXT NOT NULL,
    short_label VARCHAR(100),
    estimated_minutes INT,
    leaf_type VARCHAR(20),  -- 'DIGITAL' or 'HUMAN'
    icon VARCHAR(50)
);

-- User pets
CREATE TABLE user_pets (
    pet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    species VARCHAR(50) NOT NULL,  -- 'dog', 'cat', 'dragon', 'owl', 'fox'
    name VARCHAR(100) NOT NULL,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    hunger INT DEFAULT 50,  -- 0-100
    happiness INT DEFAULT 50,  -- 0-100
    evolution_stage INT DEFAULT 1,  -- 1 (baby), 2 (teen), 3 (adult)
    created_at TIMESTAMP DEFAULT NOW(),
    last_fed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)  -- One pet per user for now
);

-- Focus sessions (for analytics)
CREATE TABLE focus_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    step_id UUID REFERENCES micro_steps(step_id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_minutes INT,
    completed BOOLEAN DEFAULT false,
    interruptions INT DEFAULT 0
);

-- User themes
CREATE TABLE user_themes (
    user_id VARCHAR(255) PRIMARY KEY,
    active_theme VARCHAR(50) DEFAULT 'solarized',
    unlocked_themes TEXT[],  -- Array of theme names
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Badge progress
CREATE TABLE user_badges (
    badge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    badge_type VARCHAR(100) NOT NULL,  -- '3-day-streak', 'first-task', etc.
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_type)
);
```

### Schema Modifications

```sql
-- Add per-step XP tracking to micro_steps
ALTER TABLE micro_steps ADD COLUMN xp_earned INT DEFAULT 0;
ALTER TABLE micro_steps ADD COLUMN completed_at TIMESTAMP;

-- Add theme preference to users (if users table exists)
ALTER TABLE users ADD COLUMN active_theme VARCHAR(50) DEFAULT 'solarized';
```

---

## 📊 Success Metrics & KPIs

### Phase 1 (Weeks 1-3)
- **Task Completion Rate**: 60%+ of started tasks completed (via ChevronTaskFlow)
- **Step Completion**: Avg 4+ steps per task completed
- **User Engagement**: 3+ tasks started per session
- **Mapper Navigation**: 50%+ users explore both MAP and PLAN tabs
- **Template Usage**: 30%+ of new tasks created via templates

### Phase 2 (Weeks 4-6)
- **Pet Engagement**: 80%+ users name and interact with pet daily
- **XP Per Session**: Avg 50+ XP earned per active session
- **Badge Unlocks**: Avg 2 new badges per user per week
- **Theme Unlocks**: 40%+ users unlock at least 1 new theme
- **Celebration Feedback**: 70%+ users rate celebrations as "helpful" or "very helpful"

### Phase 3 (Weeks 7-9)
- **PWA Installs**: 50%+ of web users install PWA
- **Focus Sessions**: 40%+ of tasks include at least 1 focus session
- **Offline Usage**: App works offline for 100% of users (no crashes)
- **Haptic Feedback**: 60%+ of mobile users enable haptics
- **Performance**: Lighthouse score 90+ on all metrics

### Phase 4 (Weeks 10-12)
- **AI Acceptance**: 60%+ of AI-suggested steps accepted without edit
- **Analytics Usage**: 50%+ users view Trends tab weekly
- **Nudge Effectiveness**: 25%+ of nudges result in task action
- **User Retention**: 70%+ of testers use app 5+ days in Week 12
- **ADHD Rating**: Avg 7.5/10 on "ADHD-friendliness" scale

---

## 🚀 Launch Checklist

### Pre-Launch (Week 12)
- [ ] All P0/P1 bugs fixed
- [ ] 5+ user tests completed with positive feedback
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance benchmarks met (Lighthouse 90+)
- [ ] Documentation complete (README, user guide, API docs)
- [ ] Demo video recorded (2 min)
- [ ] Privacy policy and ToS written
- [ ] Analytics/crash reporting configured (PostHog, Sentry)

### Launch Day
- [ ] Deploy to production (Vercel/Netlify)
- [ ] Submit to App Store (if React Native path)
- [ ] Announce on social media (Twitter, Reddit r/ADHD)
- [ ] Email beta testers with launch link
- [ ] Monitor error logs and user feedback
- [ ] Celebrate! 🎉

### Post-Launch (Week 13+)
- [ ] Collect user feedback (surveys, support tickets)
- [ ] Prioritize bug fixes and quick wins
- [ ] Plan next phase (business features, team collaboration?)
- [ ] Consider monetization (freemium, subscription?)
- [ ] Iterate based on real usage data

---

## 📞 Support & Resources

### Team Contacts
- **Product**: [Your Name] - Vision, prioritization, user research
- **Engineering**: [Your Name] - Full-stack implementation
- **Design**: [Freelancer or AI tools] - Pet sprites, animations
- **Testing**: Community volunteers (recruit via r/ADHD)

### Tools & Services
- **Project Management**: GitHub Projects or Linear
- **Design**: Figma (component library, mockups)
- **Development**: VS Code + GitHub Copilot
- **Testing**: Playwright (E2E), Vitest (unit tests)
- **Analytics**: PostHog (open-source, privacy-friendly)
- **Error Tracking**: Sentry
- **Hosting**: Vercel (frontend), Railway or Fly.io (backend)

### Community Feedback Channels
- **Discord Server**: For beta testers and early adopters
- **GitHub Discussions**: Feature requests and bug reports
- **Weekly Office Hours**: 30-min live Q&A (Zoom or Discord)

---

## 🔄 Iteration & Maintenance

### Weekly Rituals
- **Monday**: Review metrics from previous week, set goals
- **Wednesday**: Mid-week check-in, address blockers
- **Friday**: Demo new features, celebrate wins, plan next week

### Monthly Reviews
- **User Feedback Synthesis**: Aggregate patterns from support tickets, interviews
- **Roadmap Adjustment**: Re-prioritize based on real usage
- **Performance Audit**: Check Lighthouse scores, bundle sizes
- **Security Audit**: Review dependencies, vulnerability scans

### Quarterly Planning
- **User Growth Metrics**: MAU, retention, completion rates
- **Feature Roadmap**: Plan next 3-month phase
- **Technical Debt**: Allocate 20% time to refactoring
- **Community Building**: Host virtual meetup, user showcase

---

## 🎉 Celebrate Milestones

### Week 3: First Chevron Flow Complete
- 🏆 Users can create→start→complete tasks via chevrons!
- 🎊 Team: Order pizza, take a break

### Week 6: Pet System Live
- 🏆 Users have virtual pets that grow with them!
- 🎊 Team: Share favorite pet screenshots

### Week 9: PWA Installed
- 🏆 App works offline and feels native!
- 🎊 Team: Record demo, share on Twitter

### Week 12: Public Launch
- 🏆 ADHD users worldwide can access the app!
- 🎊 Team: Launch party, reflect on journey, plan future

---

## 📝 Notes & Reflections

### What Makes This App Special
1. **Chevrons as North Star**: Every interaction reinforces "progress is a journey"
2. **ADHD-First Design**: Not an afterthought, but the core philosophy
3. **Gamification with Purpose**: Not just "fun", but addresses ADHD motivation challenges
4. **Open & Honest**: Built in public, with real user feedback, no dark patterns

### Lessons Learned (to be filled post-launch)
- What worked better than expected?
- What took longer/was harder than planned?
- What would we do differently next time?
- Best user feedback quotes

---

**Version**: 1.0
**Status**: In Progress (Week 1)
**Next Review**: End of Phase 1 (Week 3)
