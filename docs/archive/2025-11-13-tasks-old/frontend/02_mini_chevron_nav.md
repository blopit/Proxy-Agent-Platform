# FE-02: MiniChevronNav Component (Week 3)

**Status**: 🟢 AVAILABLE
**Priority**: HIGH
**Dependencies**: ChevronStep (✅ exists)
**Estimated Time**: 3-4 hours
**Approach**: Storybook-first

---

## 📋 Overview

Sticky navigation bar with nano-sized chevrons showing current section. Used in Mapper tabs to indicate position within snap-scrolling sections.

---

## 🎨 Component API

```typescript
interface MiniChevronNavProps {
  sections: Section[];
  currentSection: string;
  onNavigate: (sectionId: string) => void;
}

interface Section {
  id: string;
  label: string;
  icon: string;  // Emoji
}
```

---

## 🎭 Storybook Stories

```typescript
export const MapperMapNav: Story = {
  args: {
    sections: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'achievements', label: 'Achievements', icon: '🏆' },
      { id: 'reflection', label: 'Reflection', icon: '💭' },
      { id: 'trends', label: 'Trends', icon: '📈' },
    ],
    currentSection: 'dashboard',
    onNavigate: (id) => console.log(`Navigate to ${id}`),
  },
};

export const MapperPlanNav: Story = {
  args: {
    sections: [
      { id: 'rituals', label: 'Rituals', icon: '🌅' },
      { id: 'vision', label: 'Vision', icon: '🧭' },
      { id: 'goals', label: 'Active Goals', icon: '🎯' },
      { id: 'horizons', label: 'Time Horizons', icon: '📅' },
    ],
    currentSection: 'rituals',
  },
};

export const TwoSections: Story = {
  args: {
    sections: [
      { id: 'a', label: 'Section A', icon: '🅰️' },
      { id: 'b', label: 'Section B', icon: '🅱️' },
    ],
    currentSection: 'a',
  },
};
```

---

## 🏗️ Implementation Notes

- Sticky positioning: `position: sticky; top: 0; z-index: 10;`
- Use `ChevronStep` with `size="nano"`
- Chevrons overlap with negative margin: `marginRight: '-2px'`
- Status logic: sections before current = 'done', current = 'active', after = 'pending'
- Click handler calls `onNavigate(section.id)` for smooth scroll

---

## ✅ Acceptance Criteria

- [ ] 3+ Storybook stories
- [ ] Renders nano chevrons for all sections
- [ ] Current section highlighted as 'active'
- [ ] Clicking chevron calls `onNavigate`
- [ ] Sticky positioning works
- [ ] Integrates into MapperMapTab and MapperPlanTab

---

**Ref**: [Phase 1 Specs](../../roadmap/PHASE_1_SPECS.md) lines 445-521
