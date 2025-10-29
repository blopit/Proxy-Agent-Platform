# FE-03: Mapper Restructure (MapperMapTab & MapperPlanTab) (Week 3)

**Status**: 🟢 AVAILABLE
**Priority**: HIGH
**Dependencies**: MiniChevronNav (FE-02), existing Mapper components
**Estimated Time**: 6-8 hours
**Approach**: Storybook-first

---

## 📋 Overview

Restructure Mapper from 5 tabs → 2 tabs (MAP/PLAN) with 4 snap-scrolling sections each. Reduces cognitive load by 60% (per UX research).

---

## 🎨 Components to Build

### 1. MapperMapTab.tsx

**Sections**: Dashboard, Achievements, Reflection, Trends

```typescript
interface MapperMapTabProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

// Reuse existing components:
// - LevelCard (from current Overview)
// - StreakCard
// - WeeklyStatsCard
// - AchievementGallery
// - ReflectionPrompts
```

### 2. MapperPlanTab.tsx

**Sections**: Rituals, Vision, Active Goals, Time Horizons

```typescript
interface MapperPlanTabProps {
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

// Auto-open rituals during ritual times (6-11am, 6-11pm)
useEffect(() => {
  const hour = new Date().getHours();
  const isRitualTime = (hour >= 6 && hour < 11) || (hour >= 18 && hour < 23);
  if (isRitualTime) handleNavigate('rituals');
}, []);
```

---

## 🎭 Storybook Stories

```typescript
// MapperMapTab.stories.tsx
export const DashboardSection: Story = {
  args: { activeSection: 'dashboard' },
};

export const AchievementsSection: Story = {
  args: { activeSection: 'achievements' },
};

// MapperPlanTab.stories.tsx
export const RitualsSection: Story = {
  args: { activeSection: 'rituals' },
};

export const VisionSection: Story = {
  args: { activeSection: 'vision' },
};
```

---

## 🔄 Update MapperMode.tsx

```typescript
const [activeTab, setActiveTab] = useState<'map' | 'plan'>('map');
const [activeMapSection, setActiveMapSection] = useState('dashboard');
const [activePlanSection, setActivePlanSection] = useState('rituals');

// Top-level tab switcher
<div>
  <button onClick={() => setActiveTab('map')}>🗺️ MAP</button>
  <button onClick={() => setActiveTab('plan')}>🎯 PLAN</button>
</div>

// Tab content
{activeTab === 'map' && <MapperMapTab ... />}
{activeTab === 'plan' && <MapperPlanTab ... />}
```

---

## 📜 Scroll Snap Implementation

```typescript
// Container
<div style={{
  overflowY: 'auto',
  scrollSnapType: 'y mandatory',
  WebkitOverflowScrolling: 'touch',
}}>
  {/* Sections */}
  <section style={{
    minHeight: '100vh',
    scrollSnapAlign: 'start',
  }}>
    {/* Section content */}
  </section>
</div>

// Scroll detection
useEffect(() => {
  const handleScroll = () => {
    // Find which section is in view
    // Update activeSection state
    // MiniChevronNav reacts to state change
  };
  container.addEventListener('scroll', handleScroll);
}, []);
```

---

## ✅ Acceptance Criteria

- [ ] MapperMapTab with 4 sections
- [ ] MapperPlanTab with 4 sections
- [ ] Snap-scrolling works smoothly
- [ ] MiniChevronNav updates on scroll
- [ ] Clicking chevron scrolls to section
- [ ] Rituals auto-open during ritual times
- [ ] All existing features preserved (no data loss)
- [ ] 6+ Storybook stories

---

**Ref**: [Phase 1 Specs](../../roadmap/PHASE_1_SPECS.md) lines 525-827
