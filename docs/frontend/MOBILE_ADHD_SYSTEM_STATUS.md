# Mobile ADHD System - Current Status & Roadmap

**Last Updated**: 2025-10-25
**Status**: 🚧 In Progress - Chevron Timeline Rendering Issues

---

## 🎯 Core Mission

Build a mobile-first ADHD task management system based on **biological circuits** (Scout/Hunter/Mender/Mapper) with:
- **Parallelogram chevron progress indicators** for task decomposition
- **One-task-at-a-time** swipeable cards
- **Dopamine-optimized** gamification
- **Energy-aware** task suggestions

---

## 📊 Component Inventory

### ✅ Completed Components

#### Mobile Components (`src/components/mobile/`)
- [x] **BiologicalTabs.tsx** - Bottom navigation (5 modes)
  - Story: ❌ Missing
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **EnergyGauge.tsx** - Circular energy visualization
  - Story: ✅ EnergyGauge.stories.tsx
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **ExpandableTile.tsx** - Accordion panels
  - Story: ✅ ExpandableTile.stories.tsx
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **ChevronStep.tsx** - Parallelogram progress step
  - Story: ✅ ChevronStep.stories.tsx
  - Docs: ✅ In COMPONENT_CATALOG.md
  - **Status**: 🐛 **BROKEN** - Icons not rendering inside parallelograms

#### Mode Components (`src/components/mobile/modes/`)
- [x] **CaptureMode.tsx** - Brain dump with voice input
  - Story: ❌ Missing
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **ScoutMode.tsx** - Category-based task browser
  - Story: ❌ Missing
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **HunterMode.tsx** - Single-task focus
  - Story: ❌ Missing
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **MenderMode.tsx** - Energy tracking & recovery
  - Story: ❌ Missing
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **MapperMode.tsx** - Progress overview
  - Story: ❌ Missing
  - Docs: ✅ In COMPONENT_CATALOG.md

#### Shared Components (`src/components/shared/`)
- [x] **AsyncJobTimeline.tsx** - Task decomposition timeline
  - Story: ✅ AsyncJobTimeline.stories.tsx
  - Docs: ✅ In COMPONENT_CATALOG.md
  - **Status**: 🐛 **BROKEN** - Chevron parallelograms not showing icons properly

#### Task Components (`src/components/tasks/`)
- [x] **QuickCapture.tsx** - Fast task input
  - Story: ✅ QuickCapture.stories.tsx
  - Docs: ✅ In COMPONENT_CATALOG.md
- [x] **TaskList.tsx** - Task list display
  - Story: ✅ TaskList.stories.tsx
  - Docs: ✅ In COMPONENT_CATALOG.md

---

## 🚨 Current Blocker: Chevron Parallelogram Rendering

### Problem
**ChevronStep.tsx** creates parallelograms using `transform: skewX(-15deg)`, but the **OpenMoji icons inside are not visible**.

### Expected Behavior
```
/-----\/-----\/-----\
| 🤖 || 👤 || 📋 |  ← Icons should show inside parallelograms
\-----/\-----/\-----/
```

### What We Tried
1. ❌ SVG paths with clip-path → borders looked wrong
2. ❌ SVG with proper viewBox → rectangles, not chevrons
3. ❌ CSS pseudo-elements for arrow points → too complex
4. ✅ **CSS skewX transform** → Simple parallelograms ✓
5. ❌ Counter-skew for content → Icons still not showing

### Current Code
```tsx
// Parallelogram container (skewed)
<div style={{ transform: 'skewX(-15deg)', border: '2px solid' }}>
  {/* Pulsing glow */}
</div>

// Content layer (counter-skewed)
<div style={{ transform: 'skewX(15deg)' }}>
  {children} {/* OpenMoji icons here - NOT SHOWING */}
</div>
```

### Debug Questions
1. Are the icons rendering but invisible?
2. Is the counter-skew working?
3. Do we need `position: relative` on content?
4. Is z-index correct?

---

## 📝 Missing Storybook Stories

### High Priority
- [ ] **BiologicalTabs.stories.tsx** - Show all 5 modes with animations
- [ ] **CaptureMode.stories.tsx** - Voice input demo, auto-mode toggle
- [ ] **ScoutMode.stories.tsx** - Category rows, mystery tasks
- [ ] **HunterMode.stories.tsx** - Swipeable cards, streak tracking
- [ ] **MenderMode.stories.tsx** - Energy gauge, recovery tasks
- [ ] **MapperMode.stories.tsx** - XP, levels, achievements

### Medium Priority
- [ ] **CategoryRow.stories.tsx** - Horizontal scrolling categories
- [ ] **SwipeableTaskCard.stories.tsx** - Swipe gestures demo
- [ ] **TaskBreakdownModal.stories.tsx** - Slide-up modal
- [ ] **MicroStepsBreakdown.stories.tsx** - Hierarchical tree
- [ ] **RewardCelebration.stories.tsx** - Particle animations

### Low Priority
- [ ] **Ticker.stories.tsx** - Rotating messages
- [ ] **CaptureLoading.stories.tsx** - 3-stage loading animation
- [ ] **TaskDropAnimation.stories.tsx** - Gravity-based drop

---

## 📚 Missing Documentation

### Component Documentation
- [ ] **Mobile Mode System** - How the 5 biological modes work together
- [ ] **Chevron Timeline Design** - Parallelogram progress indicator patterns
- [ ] **OpenMoji Integration** - How to use uncoloured vs colored variants
- [ ] **Swipe Gesture Patterns** - Left/right swipe conventions
- [ ] **Energy Tracking System** - How energy affects task suggestions

### Developer Guides
- [ ] **Adding a New Mode** - Step-by-step guide
- [ ] **Creating Custom Categories** - Scout mode category configuration
- [ ] **Gamification System** - XP, levels, achievements, streaks
- [ ] **Voice Input Setup** - Web Speech API integration
- [ ] **API Integration** - Backend endpoints for each mode

### Design System
- [x] **FRONTEND_PATTERNS.md** - ✅ Created
- [x] **FRONTEND_PITFALLS.md** - ✅ Created
- [ ] **MOBILE_DESIGN_TOKENS.md** - Touch targets, spacing, animations
- [ ] **SOLARIZED_COLOR_GUIDE.md** - When to use which colors
- [ ] **ANIMATION_GUIDELINES.md** - Dopamine-optimized animations

---

## 🎨 UI Components Needed

### Immediate Needs (Blocking)
1. **Fix ChevronStep icon rendering** 🔴 URGENT
   - Icons must show inside parallelograms
   - Use uncoloured OpenMoji (black variant)
   - Sizes: 12px (nano), 16px (micro), 20px (full)

### Short-term (Next Sprint)
2. **SwipeableTaskCard improvements**
   - Hold-to-view circular progress animation
   - Haptic feedback on swipe
   - Better visual feedback
3. **CategoryRow enhancements**
   - Infinite scroll / pagination
   - Empty state illustrations
   - Loading skeletons
4. **MysteryTaskCard**
   - Special glow effect
   - Random rotation animation
   - Surprise reveal animation

### Long-term (Future)
5. **VoiceInputButton**
   - Waveform visualization
   - Real-time transcription display
   - Error state handling
6. **AchievementGallery**
   - Unlock animations
   - Badge collection grid
   - Share achievements
7. **StreakTracker**
   - Fire animation for streaks
   - Calendar heat map
   - Longest streak celebration

---

## 🧪 Testing Checklist

### Unit Tests Needed
- [ ] ChevronStep rendering (all positions, sizes, statuses)
- [ ] AsyncJobTimeline step progression
- [ ] BiologicalTabs mode switching
- [ ] EnergyGauge value changes
- [ ] SwipeableTaskCard gesture detection

### Integration Tests Needed
- [ ] Capture → AsyncJobTimeline → TaskBreakdownModal flow
- [ ] Scout mode category filtering
- [ ] Hunter mode swipe gestures
- [ ] Mender mode energy tracking
- [ ] Mapper mode XP calculation

### E2E Tests Needed
- [ ] Complete task capture workflow
- [ ] Task delegation to agents
- [ ] Energy-based task suggestions
- [ ] Gamification reward flow
- [ ] Voice input to task creation

---

## 🚀 Next Actions

### 1. Fix Chevron Icon Rendering (TODAY)
**Goal**: Get OpenMoji icons to show inside skewed parallelograms

**Debug Steps**:
1. Check if icons render when NOT skewed
2. Try absolute positioning for icon layer
3. Verify z-index stacking
4. Test with plain text first, then icons
5. Check browser console for errors
6. Inspect DOM in browser devtools

**Success Criteria**:
- ✅ Icons visible inside parallelograms
- ✅ Icons remain upright (not skewed)
- ✅ All sizes work (nano/micro/full)
- ✅ All statuses work (pending/active/done/error)

### 2. Create Missing Stories (THIS WEEK)
**Priority Order**:
1. BiologicalTabs (shows core navigation)
2. CaptureMode (primary user entry point)
3. ScoutMode (main task browsing)
4. HunterMode (task execution)
5. MenderMode & MapperMode

**Template**:
```tsx
import type { Meta, StoryObj } from '@storybook/nextjs';
import ComponentName from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/Mobile/Modes/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'fullscreen', // Mobile components need full screen
    viewport: {
      defaultViewport: 'mobile1', // iPhone 12 Pro
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    // Component props
  },
};
```

### 3. Document Core Patterns (NEXT WEEK)
**Focus Areas**:
1. **Mobile-first design** - Touch targets, gestures, animations
2. **ADHD optimizations** - One-task-focus, dopamine rewards, energy awareness
3. **Biological circuit system** - How modes work together
4. **Chevron progress indicators** - When and how to use them

---

## 📋 Known Issues

### Critical 🔴
1. **ChevronStep icons not rendering** - Blocking AsyncJobTimeline usage
2. **Counter-skew not working** - Content stays skewed with parallelogram

### High 🟠
3. **AsyncJobTimeline nested decomposition** - Children not rendering properly
4. **BiologicalTabs animations** - Pulse effect not smooth on mobile
5. **Voice input browser support** - Only works in Chrome/Edge

### Medium 🟡
6. **CategoryRow scroll snap** - Snaps too aggressively on iOS
7. **EnergyGauge touch interaction** - Hard to tap on small screens
8. **SwipeableTaskCard velocity** - Swipe threshold too high

### Low 🟢
9. **Ticker message rotation** - Timing feels off
10. **RewardCelebration particles** - Performance lag on older devices

---

## 🎯 Success Metrics

### User Experience
- ✅ Task capture in < 5 seconds
- ✅ One-handed mobile operation
- ✅ < 3 taps to complete any action
- ✅ Dopamine reward within 1 second of action

### Technical
- ✅ < 100ms UI response time
- ✅ 60fps animations
- ✅ < 2MB initial bundle size
- ✅ Lighthouse score > 90

### ADHD-Specific
- ✅ Reduces decision paralysis (one task at a time)
- ✅ Provides immediate feedback (animations, sounds)
- ✅ Respects energy levels (adaptive suggestions)
- ✅ Gamifies completion (XP, streaks, achievements)

---

## 🤝 Team Notes

**For Future Frontend Agents**:
1. **Read FRONTEND_PATTERNS.md** before making changes
2. **Check FRONTEND_PITFALLS.md** to avoid common mistakes
3. **Use design-system.ts tokens** - never hardcode values
4. **Test on mobile devices** - this is mobile-first
5. **Check Storybook** - document every component

**Current Blocker**: ChevronStep icon rendering must be fixed before proceeding with other timeline features.

**Questions?** Check:
- `COMPONENT_CATALOG.md` - Full component inventory
- `FRONTEND_PATTERNS.md` - Best practices
- `FRONTEND_PITFALLS.md` - What to avoid
- `frontend/src/app/mobile/README.md` - System overview
