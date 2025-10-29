# Mapper Mode Subtabs: Deep Brainstorm & Architecture

## 🧠 Current State Analysis

### Existing MapperMode Structure
**Current tabs (5):**
1. **📊 Overview** - Level, XP, streak, weekly stats (vertical snap scrolling)
2. **🏆 Achievements** - Achievement gallery
3. **💭 Reflect** - Weekly reflection prompts
4. **🌅/🌙 Rituals** - Time-aware (morning/midday/evening/night)
5. **🧭 Vision** - Focus areas, quarterly themes, "why", values, milestones

**Key Insights:**
- Heavy horizontal scrolling tab navigation (already 5 tabs!)
- Each tab has distinct purpose and data
- Some tabs use vertical snap scrolling for sub-sections (Overview)
- Rituals auto-opens at specific times (6am-11am, 6pm-11pm)
- Vision is comprehensive but long-form

---

## 🗺️ The "Map" Concept: What Does It Mean?

### Map = **Spatial Understanding of Your Life**

The mapper isn't just about *progress tracking* (that's Mender) — it's about:

1. **Contextual Awareness**: Where am I right now in relation to my goals?
2. **Navigation**: What's the best path forward given my energy, time, and priorities?
3. **Memory Consolidation**: What patterns have emerged? What can I learn?
4. **Recalibration**: Are my goals still aligned with my values?

**Mental Model**: Think of it like a **GPS for life**:
- **You Are Here** (current state)
- **Destination** (vision/goals)
- **Route** (plan/strategy)
- **Alternate Routes** (flexibility for ADHD)
- **Traffic/Obstacles** (energy, blockers, patterns)

---

## 📋 Current Problem: Tab Overload

**5 tabs = cognitive overwhelm** for ADHD users!

### Psychology of Tab Switching:
- Each tab switch = **context switch cost** (~23 minutes to regain focus per research)
- ADHD brains struggle with: "Where was I? What was I doing?"
- Horizontal scrolling hides information (out of sight = out of mind)
- No clear **hierarchy** or **flow** between tabs

### User Journey Analysis:
Looking at the current tabs, there's a natural **temporal flow**:

```
Daily Rituals → Check Progress (Overview) → Reflect → Adjust Vision → Plan
   (Now)         (Recent Past)           (Past Week)  (Future)      (Next Steps)
```

But the tab order is: Overview → Achievements → Reflect → Rituals → Vision
**Problem**: No clear narrative or temporal progression!

---

## 💡 Proposed Solution: Two-Tier Navigation

### Tier 1: Main Mapper Tabs (Reduce to 2-3)

**Option A: Time-Based Split**
```
┌─────────────────────────────────────────────────────────┐
│  🗺️ MAPPER                                              │
├─────────────────────────────────────────────────────────┤
│  [🧭 NOW] [📊 PAST] [🎯 FUTURE]                        │
└─────────────────────────────────────────────────────────┘
```

- **NOW** = Rituals (time-aware), Today's energy, Current focus
- **PAST** = Overview stats, Achievements, Reflection
- **FUTURE** = Vision, Quarterly themes, Planning

**Option B: Map/Plan Split (Your Idea!)**
```
┌─────────────────────────────────────────────────────────┐
│  🗺️ MAPPER                                              │
├─────────────────────────────────────────────────────────┤
│  [🗺️ MAP] [🎯 PLAN]                                     │
└─────────────────────────────────────────────────────────┘
```

- **MAP** = "Where am I?" (Progress, Stats, Achievements, Reflection)
- **PLAN** = "Where am I going?" (Vision, Rituals, Goals, Strategy)

**Option C: Ritual-Centric (ADHD Priority)**
```
┌─────────────────────────────────────────────────────────┐
│  🗺️ MAPPER                                              │
├─────────────────────────────────────────────────────────┤
│  [🌅 RITUAL] [📊 DASHBOARD] [🧭 VISION]                │
└─────────────────────────────────────────────────────────┘
```

- **RITUAL** = Morning/Evening rituals (auto-selected at ritual times)
- **DASHBOARD** = Overview, Achievements, Reflection
- **VISION** = Focus areas, themes, planning

---

### Tier 2: Sub-Navigation Within Tabs

Use **ChevronTabs** or **vertical snap-scrolling** for sub-sections!

#### Example: MAP Tab Sub-Navigation

```tsx
// Horizontal ChevronTabs within MAP tab
<div className="overflow-x-auto">
  <ChevronTabs>
    <ChevronTab>📊 Stats</ChevronTab>
    <ChevronTab>🏆 Wins</ChevronTab>
    <ChevronTab>💭 Reflect</ChevronTab>
  </ChevronTabs>
</div>

// OR: Vertical snap sections (current approach in Overview)
<div className="snap-y snap-mandatory">
  <section className="snap-start">📊 Stats</section>
  <section className="snap-start">🏆 Achievements</section>
  <section className="snap-start">💭 Reflection</section>
</div>
```

#### Example: PLAN Tab Sub-Navigation

```tsx
<div className="snap-y snap-mandatory">
  <section className="snap-start">🧭 Vision</section>
  <section className="snap-start">📅 Quarter Theme</section>
  <section className="snap-start">🎯 Focus Areas</section>
  <section className="snap-start">🏔️ Milestones</section>
</div>
```

---

## 🎯 Recommended Architecture: **MAP/PLAN Split**

### Why This Works for ADHD:

1. **Clear Mental Model**: "Where am I? (MAP) / Where am I going? (PLAN)"
2. **Reduces Tabs**: 5 tabs → 2 main tabs (60% reduction!)
3. **Natural Flow**: Check progress → Plan next steps
4. **Chevron Reinforcement**: Sub-tabs can use ChevronTabs (pattern consistency!)
5. **Ritual Integration**: Morning ritual shows PLAN first, Evening ritual shows MAP first

---

## 🏗️ Detailed Component Structure

### MAP Tab (🗺️ "Where Am I?")

**Purpose**: Consolidate memory, see patterns, celebrate wins

**Sub-sections (Vertical Snap-Scroll or ChevronTabs):**

#### 1. **📊 Dashboard (Current State)**
```tsx
<DashboardSection>
  {/* Level, XP, Streak - Current from Overview */}
  <LevelCard level={level} xp={xp} progress={xpProgress} />
  <StreakCard days={streakDays} />

  {/* Weekly Stats - Current from Overview */}
  <WeeklyStatsCard
    tasksCompleted={weeklyStats.tasksCompleted}
    xpEarned={weeklyStats.xpEarned}
    focusMinutes={weeklyStats.focusMinutes}
  />

  {/* Category Breakdown - Current from Overview */}
  <CategoryBreakdown categories={weeklyStats.categoriesWorked} />
</DashboardSection>
```

**Snap Scrolling Structure:**
```
┌────────────────┐
│  Level & XP    │  ← Snap point 1
│  Streak        │
│  [Swipe ↓]     │
├────────────────┤
│  Weekly Stats  │  ← Snap point 2
│  Categories    │
│  [Swipe ↓]     │
├────────────────┤
│  Achievements  │  ← Snap point 3
│  [Swipe ↓]     │
├────────────────┤
│  Reflection    │  ← Snap point 4
└────────────────┘
```

#### 2. **🏆 Achievements (Wins Gallery)**
```tsx
<AchievementSection>
  {/* Current AchievementGallery component */}
  <AchievementGallery achievements={achievements} />

  {/* Add: Recent Unlocks (last 7 days) */}
  <RecentUnlocks achievements={recentlyUnlocked} />
</AchievementSection>
```

#### 3. **💭 Reflection (Weekly Review)**
```tsx
<ReflectionSection>
  {/* Current reflection prompts */}
  <ReflectionPrompts>
    <PromptCard question="What went well this week?" />
    <PromptCard question="What could be improved?" />
    <PromptCard question="Next week's focus?" />
  </ReflectionPrompts>

  {/* Add: Pattern Recognition (AI-powered) */}
  <PatternInsights>
    <Insight icon="⚡">
      "You complete most tasks 9-11 AM"
    </Insight>
    <Insight icon="🎯">
      "Digital tasks = 70% completion rate"
    </Insight>
  </PatternInsights>
</ReflectionSection>
```

#### 4. **📈 Trends (NEW - Data Visualization)**
```tsx
<TrendsSection>
  {/* Weekly completion rate chart */}
  <MiniChart type="line" data={weeklyCompletionRate} />

  {/* Energy patterns */}
  <EnergyPatternChart data={energyLevels} />

  {/* Category breakdown over time */}
  <CategoryTrendChart data={categoryHistory} />
</TrendsSection>
```

---

### PLAN Tab (🎯 "Where Am I Going?")

**Purpose**: Set direction, clarify values, plan ahead

**Sub-sections (Vertical Snap-Scroll):**

#### 1. **🌅 Daily Rituals (Time-Aware)**
```tsx
<RitualSection timeOfDay={currentTimeOfDay}>
  {/* Morning Reset (6am-11am) */}
  {timeOfDay === 'morning' && (
    <MorningRitual>
      <EnergyCheckIn value={morningEnergy} onChange={setMorningEnergy} />
      <IntentionInput value={dailyIntention} onChange={setDailyIntention} />
      <TaskPreview tasks={urgentTasks} />
      <ModeSelector modes={selectedModes} onToggle={toggleMode} />
      <StartDayButton onClick={handleStartDay} />
    </MorningRitual>
  )}

  {/* Midday Checkpoint (11am-3pm) */}
  {timeOfDay === 'midday' && (
    <MiddayCheckpoint>
      <OnTrackCheck value={onTrack} onChange={setOnTrack} />
      <EnergyRecheck value={middayEnergy} onChange={setMiddayEnergy} />
      <QuickWinSuggestion tasks={quickWins} />
    </MiddayCheckpoint>
  )}

  {/* Evening Closure (6pm-11pm) */}
  {timeOfDay === 'evening' && (
    <EveningClosure>
      <TodaysCelebration stats={todayStats} completed={completedToday} />
      <BrainDump value={brainDump} onChange={setBrainDump} />
      <TomorrowIntention value={tomorrowIntention} onChange={setTomorrowIntention} />
      <CloseDayButton onClick={handleCloseDay} />
    </EveningClosure>
  )}

  {/* Night (11pm-6am) */}
  {timeOfDay === 'night' && <NightMessage />}
</RitualSection>
```

**Snap Scrolling Structure (Ritual-specific):**
```
┌───────────────────┐
│  Ritual Header    │  ← Snap point 1
│  Time Indicator   │
│  [Swipe ↓]        │
├───────────────────┤
│  Main Ritual      │  ← Snap point 2
│  Content          │
│  (Morning/Evening)│
│  [Swipe ↓]        │
├───────────────────┤
│  Vision Preview   │  ← Snap point 3
│  "Quick Look"     │
└───────────────────┘
```

#### 2. **🧭 Vision Board (Life GPS)**
```tsx
<VisionSection>
  {/* Core identity */}
  <YourWhy value={yourWhy} onChange={setYourWhy} />
  <CoreValues values={coreValues} onAdd={addValue} />

  {/* Focus areas (current 3, max 5) */}
  <FocusAreas areas={focusAreas} onEdit={editFocusArea} onAdd={addFocusArea} />

  {/* Quarterly theme */}
  <QuarterlyTheme theme={quarterlyTheme} onUpdate={updateTheme} />

  {/* Long-term milestones */}
  <Milestones
    oneYear={milestone1Y}
    threeYears={milestone3Y}
    fiveYears={milestone5Y}
  />

  {/* Vision check-in reminder */}
  <VisionCheckIn lastUpdated={lastVisionUpdate} onReview={reviewVision} />
</VisionSection>
```

#### 3. **🎯 Active Goals (NEW - Actionable Planning)**
```tsx
<ActiveGoalsSection>
  {/* Current quarter goals */}
  <QuarterGoals theme={quarterlyTheme}>
    <GoalCard
      title="Launch beta"
      progress={45}
      milestones={[
        { name: "Design complete", done: true },
        { name: "MVP build", done: false, active: true },
        { name: "User testing", done: false }
      ]}
    />
  </QuarterGoals>

  {/* This month focus */}
  <MonthlyFocus>
    <FocusCard area="Health">
      <MicroGoal>Run 3x per week</MicroGoal>
      <MicroGoal>Track water intake</MicroGoal>
    </FocusCard>
  </MonthlyFocus>

  {/* This week priorities */}
  <WeeklyPriorities>
    <PriorityCard>Complete project proposal</PriorityCard>
    <PriorityCard>Run 5 digital automations</PriorityCard>
    <PriorityCard>Maintain 5-day streak</PriorityCard>
  </WeeklyPriorities>
</ActiveGoalsSection>
```

#### 4. **📅 Time Horizons (NEW - Temporal Planning)**
```tsx
<TimeHorizonsSection>
  {/* Next 24 hours */}
  <HorizonCard period="Today" icon="⏰">
    <IntentionBadge>{dailyIntention}</IntentionBadge>
    <TopPriority>{urgentTasks[0]?.title}</TopPriority>
  </HorizonCard>

  {/* This week */}
  <HorizonCard period="This Week" icon="📅">
    <WeekGoal>{weeklyGoal}</WeekGoal>
    <TaskCount>{weeklyTaskCount} tasks planned</TaskCount>
  </HorizonCard>

  {/* This month */}
  <HorizonCard period="This Month" icon="🗓️">
    <MonthlyTheme>{monthlyTheme}</MonthlyTheme>
    <MilestonProgress>{monthProgress}% complete</MilestonProgress>
  </HorizonCard>

  {/* This quarter */}
  <HorizonCard period="This Quarter" icon="📊">
    <QuarterTheme>{quarterlyTheme.theme}</QuarterTheme>
    <KeyMilestone>{nextMilestone}</KeyMilestone>
  </HorizonCard>
</TimeHorizonsSection>
```

---

## 🎨 UI Component Architecture

### Navigation Pattern Options

#### Option 1: Horizontal ChevronTabs (Sub-navigation)

```tsx
// Inside MAP or PLAN tab
<div className="overflow-x-auto px-4 py-3 bg-[#073642]">
  <div className="flex gap-0">
    <ChevronTab
      position="first"
      status={activeMapSection === 'stats' ? 'active' : 'pending'}
      onClick={() => setActiveMapSection('stats')}
    >
      📊 Stats
    </ChevronTab>
    <ChevronTab
      position="middle"
      status={activeMapSection === 'wins' ? 'active' : 'pending'}
      onClick={() => setActiveMapSection('wins')}
    >
      🏆 Wins
    </ChevronTab>
    <ChevronTab
      position="last"
      status={activeMapSection === 'reflect' ? 'active' : 'pending'}
      onClick={() => setActiveMapSection('reflect')}
    >
      💭 Reflect
    </ChevronTab>
  </div>
</div>
```

**Pros:**
- Reinforces Chevron pattern (ADHD familiarity)
- Visual progress through sections
- Clear "current location" indicator
- Matches AsyncJobTimeline mental model

**Cons:**
- Adds horizontal scrolling (more options)
- Might feel redundant with main tabs

---

#### Option 2: Vertical Snap Scrolling (Current Approach)

```tsx
<div className="h-full overflow-y-auto snap-y snap-mandatory">
  <section className="min-h-screen snap-start flex flex-col px-4 py-6">
    {/* Stats content */}
  </section>
  <section className="min-h-screen snap-start flex flex-col px-4 py-6">
    {/* Wins content */}
  </section>
  <section className="min-h-screen snap-start flex flex-col px-4 py-6">
    {/* Reflect content */}
  </section>
</div>
```

**Pros:**
- Natural mobile gesture (swipe down)
- Full screen for each section (focus)
- Already implemented in Overview tab
- No tab bar clutter

**Cons:**
- Hidden content (out of sight)
- No clear indicator of "what's next"
- Can feel like endless scrolling

---

#### Option 3: Hybrid (ChevronTabs + Snap Scroll) **🏆 RECOMMENDED**

```tsx
// Mini ChevronTabs as progress indicator (top)
<div className="sticky top-0 z-10 bg-[#002b36] px-4 py-2">
  <MiniChevronProgress
    steps={[
      { id: 'stats', label: '📊', status: getStatus('stats') },
      { id: 'wins', label: '🏆', status: getStatus('wins') },
      { id: 'reflect', label: '💭', status: getStatus('reflect') }
    ]}
    currentStep={currentSection}
    size="nano"
  />
</div>

// Snap-scrolling content
<div className="snap-y snap-mandatory" onScroll={detectSection}>
  <section id="stats" className="min-h-screen snap-start">
    {/* Stats */}
  </section>
  <section id="wins" className="min-h-screen snap-start">
    {/* Wins */}
  </section>
  <section id="reflect" className="min-h-screen snap-start">
    {/* Reflect */}
  </section>
</div>
```

**Pros:**
- Best of both worlds!
- Mini chevron shows "you are here" + "what's next"
- Scroll hint: "Swipe down for [next section]"
- Reinforces pattern without cluttering UI
- Sticky header = always visible navigation aid

**Cons:**
- Slightly more complex implementation

---

## 🧪 Implementation Strategy

### Phase 1: Restructure Existing Tabs into MAP/PLAN

**MAP Tab:**
- Move Overview → MAP (Dashboard section)
- Move Achievements → MAP (Wins section)
- Move Reflection → MAP (Reflect section)
- Add Trends section (NEW)

**PLAN Tab:**
- Move Vision → PLAN (Vision section)
- Move Rituals → PLAN (Rituals section - auto-opens at ritual times)
- Add Active Goals section (NEW)
- Add Time Horizons section (NEW)

### Phase 2: Add Mini Chevron Navigation

```tsx
// New component: MiniChevronNav.tsx
interface MiniChevronNavProps {
  sections: { id: string; label: string; icon: string }[];
  currentSection: string;
  onNavigate: (sectionId: string) => void;
}
```

### Phase 3: Smart Auto-Navigation

```tsx
// Auto-open PLAN tab during ritual times
useEffect(() => {
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 11;
  const isEvening = hour >= 18 && hour < 23;

  if ((isMorning || isEvening) && activeTab !== 'plan') {
    setActiveTab('plan'); // Auto-switch to PLAN
    setActivePlanSection('rituals'); // Scroll to rituals
  }
}, []);
```

---

## 🎯 Final Recommendation

### **MAP/PLAN Split with Hybrid Navigation**

```
┌─────────────────────────────────────────────────────────┐
│  🗺️ MAPPER                                              │
├─────────────────────────────────────────────────────────┤
│  [🗺️ MAP (Where Am I?)] [🎯 PLAN (Where Going?)]       │
└─────────────────────────────────────────────────────────┘

MAP Tab:
  ┌──────────────────────────────────┐
  │  [📊][🏆][💭][📈] ← Mini Chevron │  (Sticky header)
  ├──────────────────────────────────┤
  │                                  │
  │  📊 Dashboard (Stats)            │  ← Snap section 1
  │  [Swipe ↓]                       │
  ├──────────────────────────────────┤
  │  🏆 Achievements                 │  ← Snap section 2
  │  [Swipe ↓]                       │
  ├──────────────────────────────────┤
  │  💭 Reflection                   │  ← Snap section 3
  │  [Swipe ↓]                       │
  ├──────────────────────────────────┤
  │  📈 Trends                       │  ← Snap section 4
  └──────────────────────────────────┘

PLAN Tab:
  ┌──────────────────────────────────┐
  │  [🌅][🧭][🎯][📅] ← Mini Chevron │  (Sticky header)
  ├──────────────────────────────────┤
  │  🌅 Rituals (Time-aware)         │  ← Snap section 1
  │  [Swipe ↓]                       │
  ├──────────────────────────────────┤
  │  🧭 Vision Board                 │  ← Snap section 2
  │  [Swipe ↓]                       │
  ├──────────────────────────────────┤
  │  🎯 Active Goals                 │  ← Snap section 3
  │  [Swipe ↓]                       │
  ├──────────────────────────────────┤
  │  📅 Time Horizons                │  ← Snap section 4
  └──────────────────────────────────┘
```

### Why This Works:

1. **Reduces Cognitive Load**: 5 tabs → 2 main tabs
2. **Clear Mental Model**: "MAP = Past/Present, PLAN = Present/Future"
3. **Maintains Current Features**: All existing functionality preserved
4. **Adds Structure**: Mini Chevron nav provides spatial awareness
5. **ADHD-Optimized**: Vertical snap = focus, Mini nav = context
6. **Pattern Consistency**: Chevrons everywhere (tabs, progress, nav)
7. **Smart Defaults**: Rituals auto-open at ritual times
8. **Scalable**: Easy to add new sections to either tab

---

## 🚀 Next Steps

1. **Prototype Mini Chevron Nav** component (MiniChevronNav.tsx)
2. **Refactor MapperMode.tsx** into MAP/PLAN structure
3. **Add scroll detection** for auto-updating mini nav
4. **Test with ADHD users** for cognitive load feedback
5. **Add subtle animations** for section transitions

Would you like me to start implementing the MiniChevronNav component or the restructured MapperMode?
