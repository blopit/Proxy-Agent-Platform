# Phase 1: Component Specifications (Weeks 1-3)

**Goal**: Chevron-ify existing modes with core task→steps→completion flow

---

## Week 1-2: ChevronTaskFlow Component

### Component Overview

**Purpose**: Full-screen modal for executing tasks step-by-step using the chevron UI paradigm.

**Location**: `frontend/src/components/mobile/ChevronTaskFlow.tsx`

**User Flow**:
```
TodayMode card → "Start Task" button → ChevronTaskFlow opens →
User completes steps one-by-one → Final step done → CelebrationScreen →
Return to TodayMode (next card)
```

---

### Technical Specification

```typescript
// ChevronTaskFlow.tsx

import React, { useState, useEffect } from 'react';
import AsyncJobTimeline, { JobStep, JobStepStatus } from '../shared/AsyncJobTimeline';
import { X, Play, Pause, CheckCircle, Timer } from 'lucide-react';
import { spacing, fontSize, borderRadius, semanticColors } from '@/lib/design-system';

interface ChevronTaskFlowProps {
  task: Task;                     // The parent task being executed
  onComplete: (completedSteps: number, xpEarned: number) => void;
  onDismiss: () => void;         // Close without completing
  enableFocusTimer?: boolean;    // Optional: enable Pomodoro timer (Week 9 feature)
}

interface Task {
  task_id: string;
  title: string;
  description?: string;
  micro_steps: MicroStep[];      // Array of steps to complete
  estimated_minutes?: number;
  priority: string;
  xp_preview?: number;           // Total XP for completing all steps
}

interface MicroStep {
  step_id: string;
  description: string;
  short_label?: string;
  estimated_minutes: number;
  leaf_type: 'DIGITAL' | 'HUMAN';
  icon?: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

export default function ChevronTaskFlow({
  task,
  onComplete,
  onDismiss,
  enableFocusTimer = false
}: ChevronTaskFlowProps) {
  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<JobStep[]>([]);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Initialize steps from task micro_steps
  useEffect(() => {
    const jobSteps: JobStep[] = task.micro_steps.map((step, index) => ({
      id: step.step_id,
      description: step.description,
      shortLabel: step.short_label || step.description.slice(0, 20),
      estimatedMinutes: step.estimated_minutes,
      leafType: step.leaf_type,
      icon: step.icon,
      status: index === 0 ? 'active' : 'pending',  // First step is active
      tags: [],
    }));
    setSteps(jobSteps);
  }, [task]);

  // Calculate overall progress
  const completedSteps = steps.filter(s => s.status === 'done').length;
  const progress = (completedSteps / steps.length) * 100;

  // Handle step completion
  const handleStepComplete = async (stepId: string) => {
    // Mark current step as done
    const updatedSteps = steps.map(s =>
      s.id === stepId ? { ...s, status: 'done' as JobStepStatus } : s
    );

    // Find next pending step and mark as active
    const nextStepIndex = updatedSteps.findIndex(s => s.status === 'pending');
    if (nextStepIndex !== -1) {
      updatedSteps[nextStepIndex].status = 'active';
      setCurrentStepIndex(nextStepIndex);
    }

    setSteps(updatedSteps);

    // Calculate XP for this step
    const completedStep = steps.find(s => s.id === stepId);
    const stepXp = calculateStepXp(completedStep!);
    setTotalXpEarned(prev => prev + stepXp);

    // Call backend to mark step as done
    try {
      await fetch(`/api/v1/micro-steps/${stepId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xp_earned: stepXp })
      });
    } catch (error) {
      console.error('Failed to mark step complete:', error);
    }

    // Check if all steps done → trigger completion
    if (nextStepIndex === -1) {
      // All steps done!
      const bonusXp = Math.floor(task.xp_preview || 0) * 0.2;  // 20% bonus for full task
      const finalXp = totalXpEarned + stepXp + bonusXp;
      onComplete(steps.length, finalXp);
    }
  };

  // XP calculation per step (PRD: base 10 + priority + time bonus)
  const calculateStepXp = (step: JobStep): number => {
    const baseXp = 10;
    const priorityBonus = { high: 5, medium: 3, low: 1 }[task.priority.toLowerCase()] || 0;
    const timeBonus = Math.min(step.estimatedMinutes / 5, 10);  // Max +10 for long steps
    return Math.round(baseXp + priorityBonus + timeBonus);
  };

  // Focus timer (basic implementation, enhanced in Week 9)
  useEffect(() => {
    if (!isFocusMode) return;

    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocusMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: semanticColors.bg.primary,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: spacing[4],
          borderBottom: `1px solid ${semanticColors.border.default}`,
          backgroundColor: semanticColors.bg.secondary,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: semanticColors.text.primary }}>
            {task.title}
          </h2>
          <button
            onClick={onDismiss}
            style={{
              padding: spacing[2],
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: semanticColors.text.secondary,
            }}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress indicator */}
        <div style={{ marginTop: spacing[3] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[1] }}>
            <span>{completedSteps} of {steps.length} steps complete</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: semanticColors.bg.primary,
              borderRadius: borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(to right, #859900, #268bd2)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* XP earned so far */}
        <div style={{ marginTop: spacing[2], fontSize: fontSize.sm, color: semanticColors.accent.warning }}>
          💰 {totalXpEarned} XP earned so far
        </div>
      </div>

      {/* Chevron Timeline */}
      <div style={{ flex: 1, padding: spacing[4], overflow: 'auto' }}>
        <AsyncJobTimeline
          jobName={task.title}
          steps={steps}
          currentProgress={progress}
          size="full"
          showProgressBar={false}  // We have our own progress bar in header
          onStepClick={(stepId) => {
            // Optional: expand step to show details/notes
            console.log('Step clicked:', stepId);
          }}
        />

        {/* Current step detail card */}
        {steps[currentStepIndex] && (
          <div
            style={{
              marginTop: spacing[6],
              padding: spacing[4],
              backgroundColor: semanticColors.bg.secondary,
              borderRadius: borderRadius.lg,
              border: `2px solid ${semanticColors.accent.primary}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
              <span style={{ fontSize: '32px' }}>{steps[currentStepIndex].icon || '📋'}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: fontSize.base, fontWeight: 'bold', color: semanticColors.text.primary }}>
                  Current Step
                </h3>
                <p style={{ fontSize: fontSize.sm, color: semanticColors.text.secondary }}>
                  {steps[currentStepIndex].description}
                </p>
              </div>
            </div>

            {/* Step metadata */}
            <div style={{ display: 'flex', gap: spacing[4], fontSize: fontSize.xs, color: semanticColors.text.secondary, marginBottom: spacing[3] }}>
              <span>⏱️ ~{steps[currentStepIndex].estimatedMinutes} min</span>
              <span>{steps[currentStepIndex].leafType === 'DIGITAL' ? '🤖 Digital' : '👤 Human'}</span>
              <span>+{calculateStepXp(steps[currentStepIndex])} XP</span>
            </div>

            {/* Focus timer (if enabled) */}
            {enableFocusTimer && (
              <div
                style={{
                  marginBottom: spacing[3],
                  padding: spacing[3],
                  backgroundColor: semanticColors.bg.primary,
                  borderRadius: borderRadius.base,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <Timer size={20} style={{ color: semanticColors.accent.primary }} />
                  <span style={{ fontSize: fontSize.lg, fontWeight: 'bold', color: semanticColors.text.primary }}>
                    {formatTime(timerSeconds)}
                  </span>
                </div>
                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    backgroundColor: isFocusMode ? semanticColors.accent.error : semanticColors.accent.primary,
                    color: semanticColors.text.inverse,
                    border: 'none',
                    borderRadius: borderRadius.base,
                    fontSize: fontSize.xs,
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                  }}
                >
                  {isFocusMode ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start Focus</>}
                </button>
              </div>
            )}

            {/* Complete step button */}
            <button
              onClick={() => handleStepComplete(steps[currentStepIndex].id)}
              style={{
                width: '100%',
                padding: spacing[3],
                backgroundColor: semanticColors.accent.success,
                color: semanticColors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.base,
                fontSize: fontSize.base,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
              }}
            >
              <CheckCircle size={20} />
              Complete This Step
            </button>
          </div>
        )}
      </div>

      {/* Footer (optional: skip task button) */}
      <div
        style={{
          padding: spacing[4],
          borderTop: `1px solid ${semanticColors.border.default}`,
          backgroundColor: semanticColors.bg.secondary,
        }}
      >
        <button
          onClick={onDismiss}
          style={{
            width: '100%',
            padding: spacing[2],
            backgroundColor: 'transparent',
            color: semanticColors.text.secondary,
            border: `1px solid ${semanticColors.border.default}`,
            borderRadius: borderRadius.base,
            fontSize: fontSize.sm,
            cursor: 'pointer',
          }}
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
}
```

---

### Integration with TodayMode

**File**: `frontend/src/components/mobile/modes/TodayMode.tsx`

**Changes**:

```typescript
// Add state for ChevronTaskFlow
const [activeTaskFlow, setActiveTaskFlow] = useState<Task | null>(null);

// Update SwipeableTaskCard to include "Start Task" button
<SwipeableTaskCard
  task={currentTask}
  onSwipeLeft={handleSwipeLeft}
  onSwipeRight={handleSwipeRight}
  onTap={() => setActiveTaskFlow(currentTask)}  // Open flow on tap
  isActive={true}
/>

// Add ChevronTaskFlow modal
{activeTaskFlow && (
  <ChevronTaskFlow
    task={activeTaskFlow}
    onComplete={(completedSteps, xpEarned) => {
      // Award XP
      console.log(`Completed ${completedSteps} steps, earned ${xpEarned} XP`);

      // Mark task as complete in backend
      handleSwipeRight(activeTaskFlow);

      // Show celebration (Week 8 feature)
      // For now, just close modal
      setActiveTaskFlow(null);
    }}
    onDismiss={() => setActiveTaskFlow(null)}
    enableFocusTimer={false}  // Enable in Week 9
  />
)}
```

---

### Testing Checklist

- [ ] Task opens in full-screen modal
- [ ] All micro-steps displayed as chevrons (via AsyncJobTimeline)
- [ ] First step is "active" by default
- [ ] Clicking "Complete This Step" marks chevron as "done"
- [ ] Next step becomes "active" automatically
- [ ] XP calculation correct (base + priority + time bonus)
- [ ] Progress bar updates in real-time
- [ ] Final step completion triggers `onComplete` callback
- [ ] "Skip for Now" closes modal without completing
- [ ] Backend receives step completion events
- [ ] XP total shown in header updates correctly

---

## Week 3: Mapper Mode Restructuring

### Component Overview

**Purpose**: Reduce Mapper from 5 tabs to 2 (MAP/PLAN) with vertical snap-scrolling sections.

**Components to Build**:
1. `MiniChevronNav.tsx` - Sticky section indicator
2. `MapperMapTab.tsx` - "Where Am I?" sections
3. `MapperPlanTab.tsx` - "Where Going?" sections

---

### 1. MiniChevronNav Component

**Location**: `frontend/src/components/mobile/MiniChevronNav.tsx`

```typescript
import React from 'react';
import ChevronStep, { ChevronStatus } from './ChevronStep';
import { spacing } from '@/lib/design-system';

interface MiniChevronNavProps {
  sections: Section[];
  currentSection: string;  // ID of active section
  onNavigate: (sectionId: string) => void;
}

interface Section {
  id: string;
  label: string;   // Short label (e.g., "Stats", "Vision")
  icon: string;    // Emoji icon
}

export default function MiniChevronNav({
  sections,
  currentSection,
  onNavigate
}: MiniChevronNavProps) {
  const getStatus = (sectionId: string): ChevronStatus => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    const sectionIndex = sections.findIndex(s => s.id === sectionId);

    if (sectionIndex < currentIndex) return 'done';
    if (sectionIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getPosition = (index: number): 'first' | 'middle' | 'last' | 'single' => {
    if (sections.length === 1) return 'single';
    if (index === 0) return 'first';
    if (index === sections.length - 1) return 'last';
    return 'middle';
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#002b36',  // Solarized base03 (dark)
        padding: spacing[2],
        display: 'flex',
        gap: 0,  // Chevrons overlap
        overflow: 'visible',
      }}
    >
      {sections.map((section, index) => (
        <div
          key={section.id}
          style={{
            flex: '1 1 0%',
            marginRight: index !== sections.length - 1 ? '-2px' : '0',  // Overlap
          }}
        >
          <ChevronStep
            status={getStatus(section.id)}
            position={getPosition(index)}
            size="nano"
            onClick={() => onNavigate(section.id)}
            emoji={section.icon}
            width="100%"
            ariaLabel={`Navigate to ${section.label}`}
          >
            {/* No text label in nano size (just emoji) */}
          </ChevronStep>
        </div>
      ))}
    </div>
  );
}
```

---

### 2. MapperMapTab Component

**Location**: `frontend/src/components/mobile/MapperMapTab.tsx`

```typescript
import React, { useRef, useEffect } from 'react';
import MiniChevronNav from './MiniChevronNav';
import { spacing, semanticColors } from '@/lib/design-system';

// Import existing components
import LevelCard from './LevelCard';  // From current Overview
import StreakCard from './StreakCard';
import WeeklyStatsCard from './WeeklyStatsCard';
import AchievementGallery from './AchievementGallery';
import ReflectionPrompts from './ReflectionPrompts';
// TODO: Create TrendsSection component in Week 11

interface MapperMapTabProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'reflection', label: 'Reflection', icon: '💭' },
  { id: 'trends', label: 'Trends', icon: '📈' },
];

export default function MapperMapTab({
  activeSection,
  onSectionChange
}: MapperMapTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Detect scroll position and update active section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const snapThreshold = containerHeight / 2;

      // Find which section is in view
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = rect.top - containerRect.top;

        if (relativeTop >= 0 && relativeTop < snapThreshold) {
          onSectionChange(section.id);
          break;
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [onSectionChange]);

  // Navigate to section on MiniChevronNav click
  const handleNavigate = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sticky Mini Chevron Nav */}
      <MiniChevronNav
        sections={sections}
        currentSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Scrollable sections */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Dashboard Section */}
        <section
          ref={el => sectionRefs.current['dashboard'] = el}
          id="dashboard"
          style={{
            minHeight: '100vh',
            scrollSnapAlign: 'start',
            padding: spacing[4],
            backgroundColor: semanticColors.bg.primary,
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: spacing[4], color: semanticColors.text.primary }}>
            📊 Dashboard
          </h2>

          {/* Reuse existing Overview components */}
          <LevelCard level={5} xp={1250} progress={62} />
          <div style={{ marginTop: spacing[3] }}>
            <StreakCard days={7} />
          </div>
          <div style={{ marginTop: spacing[3] }}>
            <WeeklyStatsCard
              tasksCompleted={12}
              xpEarned={450}
              focusMinutes={180}
            />
          </div>
        </section>

        {/* Achievements Section */}
        <section
          ref={el => sectionRefs.current['achievements'] = el}
          id="achievements"
          style={{
            minHeight: '100vh',
            scrollSnapAlign: 'start',
            padding: spacing[4],
            backgroundColor: semanticColors.bg.primary,
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: spacing[4], color: semanticColors.text.primary }}>
            🏆 Achievements
          </h2>
          <AchievementGallery achievements={[]} />  {/* Pass real data */}
        </section>

        {/* Reflection Section */}
        <section
          ref={el => sectionRefs.current['reflection'] = el}
          id="reflection"
          style={{
            minHeight: '100vh',
            scrollSnapAlign: 'start',
            padding: spacing[4],
            backgroundColor: semanticColors.bg.primary,
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: spacing[4], color: semanticColors.text.primary }}>
            💭 Reflection
          </h2>
          <ReflectionPrompts />
        </section>

        {/* Trends Section (placeholder for Week 11) */}
        <section
          ref={el => sectionRefs.current['trends'] = el}
          id="trends"
          style={{
            minHeight: '100vh',
            scrollSnapAlign: 'start',
            padding: spacing[4],
            backgroundColor: semanticColors.bg.primary,
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: spacing[4], color: semanticColors.text.primary }}>
            📈 Trends
          </h2>
          <p style={{ color: semanticColors.text.secondary }}>
            Coming in Week 11: Analytics and pattern insights!
          </p>
        </section>
      </div>
    </div>
  );
}
```

---

### 3. MapperPlanTab Component

**Location**: `frontend/src/components/mobile/MapperPlanTab.tsx`

```typescript
// Similar structure to MapperMapTab, with different sections:

const sections = [
  { id: 'rituals', label: 'Rituals', icon: '🌅' },
  { id: 'vision', label: 'Vision', icon: '🧭' },
  { id: 'goals', label: 'Active Goals', icon: '🎯' },
  { id: 'horizons', label: 'Time Horizons', icon: '📅' },
];

// Reuse existing components:
// - MorningRitualModal (from current MapperMode)
// - Vision board (from current MapperMode)
// - TODO: Create ActiveGoalsSection (Week 4-6)
// - TODO: Create TimeHorizonsSection (Week 4-6)

// Auto-open rituals during ritual times (6-11am, 6-11pm)
useEffect(() => {
  const hour = new Date().getHours();
  const isRitualTime = (hour >= 6 && hour < 11) || (hour >= 18 && hour < 23);

  if (isRitualTime && activeSection !== 'rituals') {
    // Auto-scroll to rituals section
    handleNavigate('rituals');
  }
}, []);
```

---

### 4. Update MapperMode.tsx

**File**: `frontend/src/components/mobile/modes/MapperMode.tsx`

**Changes**:

```typescript
// Replace 5-tab structure with 2-tab structure

const [activeTab, setActiveTab] = useState<'map' | 'plan'>('map');
const [activeMapSection, setActiveMapSection] = useState('dashboard');
const [activePlanSection, setActivePlanSection] = useState('rituals');

return (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    {/* Top-level tab switcher */}
    <div style={{ display: 'flex', gap: 0, backgroundColor: '#073642', padding: spacing[2] }}>
      <button
        onClick={() => setActiveTab('map')}
        style={{
          flex: 1,
          padding: spacing[3],
          backgroundColor: activeTab === 'map' ? '#268bd2' : 'transparent',
          color: '#fdf6e3',
          border: 'none',
          fontSize: fontSize.base,
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        🗺️ MAP
      </button>
      <button
        onClick={() => setActiveTab('plan')}
        style={{
          flex: 1,
          padding: spacing[3],
          backgroundColor: activeTab === 'plan' ? '#268bd2' : 'transparent',
          color: '#fdf6e3',
          border: 'none',
          fontSize: fontSize.base,
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        🎯 PLAN
      </button>
    </div>

    {/* Tab content */}
    <div style={{ flex: 1, overflow: 'hidden' }}>
      {activeTab === 'map' && (
        <MapperMapTab
          activeSection={activeMapSection}
          onSectionChange={setActiveMapSection}
        />
      )}
      {activeTab === 'plan' && (
        <MapperPlanTab
          activeSection={activePlanSection}
          onSectionChange={setActivePlanSection}
        />
      )}
    </div>
  </div>
);
```

---

### Testing Checklist

- [ ] Mapper has 2 main tabs: MAP, PLAN
- [ ] Each tab shows MiniChevronNav at top
- [ ] MAP tab has 4 snap-scrollable sections
- [ ] PLAN tab has 4 snap-scrollable sections
- [ ] Scrolling updates active chevron in MiniChevronNav
- [ ] Clicking chevron in nav scrolls to that section
- [ ] Rituals auto-open during ritual times (6-11am, 6-11pm)
- [ ] All existing features preserved:
  - [ ] Level/XP display works
  - [ ] Achievement gallery loads
  - [ ] Reflection prompts functional
  - [ ] Vision board editable
- [ ] Vertical snap-scroll feels smooth on mobile
- [ ] No data loss during migration

---

## Success Metrics for Phase 1

### Quantitative
- **Task Start Rate**: 70%+ of tasks in Today mode get started (ChevronTaskFlow opened)
- **Step Completion**: 80%+ of started tasks complete at least 1 step
- **Full Task Completion**: 50%+ of started tasks complete all steps
- **Mapper Navigation**: 60%+ users explore both MAP and PLAN tabs
- **Section Engagement**: Each section viewed at least once per session (avg)

### Qualitative
- User feedback: "Chevron flow makes me feel like I'm making progress"
- User feedback: "2 tabs is way less overwhelming than 5"
- No complaints about missing features after Mapper restructure

---

## Next Steps After Phase 1

1. **Week 4**: Begin Phase 2 - Task templates
2. **Week 5-6**: Pet system implementation
3. **Week 7**: Enhanced gamification (per-step XP, badges, themes)

See [INTEGRATION_ROADMAP.md](./INTEGRATION_ROADMAP.md) for full 12-week plan.
