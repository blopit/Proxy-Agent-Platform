# Design System Migration Plan

**Status**: 52.5% Complete (42/80 components compliant)
**Generated**: December 2024
**Goal**: Achieve 100% design system compliance across all components

---

## 📊 Current State

### Compliance Overview

| Category | Components | Compliant | Rate |
|----------|-----------|-----------|------|
| **System** | 6 | 6 | ✅ 100% |
| **Workflows** | 5 | 5 | ✅ 100% |
| **Mobile/Scout** | 6 | 6 | ✅ 100% |
| **Mobile** | 51 | 29 | ⚠️ 57% |
| **Shared** | 5 | 1 | ❌ 20% |
| **Dashboard** | 4 | 0 | ❌ 0% |
| **Tasks** | 4 | 0 | ❌ 0% |
| **Total** | **80** | **42** | **52.5%** |

### Key Findings

✅ **Strengths**:
- All System components (primitives) are compliant
- All Workflow components are compliant
- All Scout sub-components are compliant
- 57% of Mobile components are compliant

❌ **Gaps**:
- **0% compliance** in Dashboard and Tasks categories
- Only 20% of Shared components are compliant
- 43% of Mobile components still have hardcoded values

---

## 🎯 Migration Strategy

### Phase 1: High Priority (Core UI) - Week 1

**Goal**: Migrate foundational shared components used across the app

| Component | Violations | Estimated Time | Priority |
|-----------|-----------|----------------|----------|
| `TaskCheckbox.tsx` | 33 (9 colors, 16px, 8 styles) | 2 hours | 🔴 Critical |
| `ProgressBar.tsx` | 7 (5 colors, 2 styles) | 1 hour | 🔴 Critical |
| `OpenMoji.tsx` | 1 (1 style) | 30 min | 🟡 Medium |
| `AsyncJobTimeline.examples.tsx` | TBD | 1 hour | 🟡 Medium |

**Total Estimated Time**: **4.5 hours**

#### Migration Steps:

1. **TaskCheckbox.tsx** (Most violations)
   - Replace hardcoded colors with `semanticColors.accent.*`
   - Replace px values with `spacing[*]` tokens
   - Replace inline styles with design system patterns
   - Update Storybook stories to test all states

2. **ProgressBar.tsx**
   - Replace color hex codes with `colors.*` or `semanticColors.accent.*`
   - Ensure gradient support uses `gradients.*` or `createGradient()`
   - Test with all theme variations in Storybook

3. **OpenMoji.tsx**
   - Replace inline styles with design system tokens
   - Standardize sizing with `iconSize.*` or `spacing[*]`

### Phase 2: Dashboard Components - Week 1-2

**Goal**: Standardize dashboard visualization components

| Component | Violations | Estimated Time | Notes |
|-----------|-----------|----------------|-------|
| `StatsCard.tsx` | 0 | 1 hour | No violations, but not importing design-system |
| `ActivityFeed.tsx` | 0 | 1 hour | No violations, but not importing design-system |
| `AgentCard.tsx` | TBD | 1.5 hours | May have Tailwind classes to convert |
| `ProductivityChart.tsx` | TBD | 2 hours | Chart library integration |

**Total Estimated Time**: **5.5 hours**

#### Key Patterns:

```typescript
// ❌ Before
<div style={{ padding: '16px', backgroundColor: '#073642' }}>

// ✅ After
import { spacing, semanticColors } from '@/lib/design-system'
<div style={{ padding: spacing[4], backgroundColor: semanticColors.bg.secondary }}>
```

### Phase 3: Task Components - Week 2

**Goal**: Migrate task management UI

| Component | Violations | Estimated Time |
|-----------|-----------|----------------|
| `QuickCapture.tsx` | 0 | 1 hour |
| `TaskList.tsx` | 1 | 1 hour |
| `TaskDashboard.tsx` | TBD | 2 hours |
| `SimpleTaskList.tsx` | TBD | 1 hour |

**Total Estimated Time**: **5 hours**

### Phase 4: Mobile Components - Week 2-3

**Goal**: Complete mobile workflow mode components

#### 4A: Workflow Modes (High Priority)

| Component | Violations | Estimated Time |
|-----------|-----------|----------------|
| `HunterMode.tsx` | TBD | 2 hours |
| `MapperMode.tsx` | TBD | 2 hours |
| `MenderMode.tsx` | TBD | 2 hours |

**Subtotal**: **6 hours**

#### 4B: Mobile Support Components (Medium Priority)

| Component | Violations | Estimated Time |
|-----------|-----------|----------------|
| `BiologicalTabs.tsx` | TBD | 1.5 hours |
| `ExpandableTile.tsx` | 13 | 1 hour |
| `ChevronStep.tsx` | 36 | 2 hours |
| `TaskCardBig.tsx` | TBD | 1.5 hours |
| `SuggestionCard.tsx` | TBD | 1 hour |
| `ConnectionElement.tsx` | 16 | 1 hour |

**Subtotal**: **8 hours**

#### 4C: Complex Modals (Requires Care)

| Component | Violations | Estimated Time | Notes |
|-----------|-----------|----------------|-------|
| `RitualModal.tsx` | 270 🔴 | 4 hours | Most violations - complex animations |
| `TaskBreakdownModal.tsx` | 54 | 2.5 hours | Many nested components |
| `AchievementGallery.tsx` | 43 | 2 hours | Particle effects & animations |
| `SwipeableTaskCard.tsx` | 42 | 2 hours | Touch gestures |

**Subtotal**: **10.5 hours**

**Phase 4 Total**: **24.5 hours**

### Phase 5: Low Priority / Utilities - Week 3

**Goal**: Clean up remaining components

| Component | Violations | Estimated Time | Notes |
|-----------|-----------|----------------|-------|
| `MiniChevronNav.tsx` | TBD | 1 hour | Navigation utility |
| `QuickCapturePill.tsx` | TBD | 1 hour | UI utility |
| `SwipeableModeHeader.tsx` | 14 | 1 hour | Touch utility |
| `MapSection.tsx` | TBD | 1.5 hours | Mapper support |
| `MapSubtabs.tsx` | 26 | 1.5 hours | Mapper support |
| `Layer.tsx` | TBD | 1 hour | Mapper support |
| `CardStack.tsx` | TBD | 1 hour | Animation utility |
| `AIFocusButton.tsx` | TBD | 1 hour | AI feature |
| `ErrorBoundary.tsx` | 5 | 30 min | Error handling |
| `PerformanceOptimizer.tsx` | 2 | 30 min | Performance utility |
| `card.tsx` (ui/) | 0 | 30 min | Legacy shadcn/ui |

**Total Estimated Time**: **11.5 hours**

---

## 📅 Timeline Summary

| Phase | Description | Components | Time Estimate | Week |
|-------|-------------|------------|---------------|------|
| **Phase 1** | Core Shared Components | 4 | 4.5 hours | Week 1 |
| **Phase 2** | Dashboard Components | 4 | 5.5 hours | Week 1-2 |
| **Phase 3** | Task Components | 4 | 5 hours | Week 2 |
| **Phase 4** | Mobile Components | 22 | 24.5 hours | Week 2-3 |
| **Phase 5** | Utilities & Legacy | 11 | 11.5 hours | Week 3 |
| **Total** | **Full Migration** | **45** | **~51 hours** | **3 weeks** |

**Note**: These are development hours. With testing, code review, and Storybook updates, expect **60-70 total hours** (~2 weeks for 1 developer, or 1 week for 2 developers).

---

## 🛠️ Migration Checklist (Per Component)

### Before Starting

- [ ] Read component file and understand its purpose
- [ ] Check if component has existing Storybook stories
- [ ] Note all hardcoded values (colors, px, styles)
- [ ] Identify which design tokens to use

### During Migration

- [ ] Import design system tokens at top of file:
  ```typescript
  import { spacing, fontSize, fontWeight, semanticColors, borderRadius, shadows, colors } from '@/lib/design-system'
  ```
- [ ] Replace all hardcoded colors with semantic colors:
  - Background: `semanticColors.bg.*`
  - Text: `semanticColors.text.*`
  - Border: `semanticColors.border.*`
  - Accent: `semanticColors.accent.*` or `colors.*` for mode colors
- [ ] Replace all px values with spacing tokens:
  - Padding: `spacing[1-8]`
  - Margin: `spacing[3-8]`
  - Gap: `spacing[1-6]`
- [ ] Replace font sizes with `fontSize.*`
- [ ] Replace font weights with `fontWeight.*`
- [ ] Replace border radius with `borderRadius.*`
- [ ] Replace shadows with `shadows.*`
- [ ] Test with reduced motion: Use `useReducedMotion()` hook if animated
- [ ] Verify accessibility: Minimum 44x44px touch targets

### After Migration

- [ ] Test component in Storybook with all themes (20+ themes)
- [ ] Test component in all viewport sizes (mobile, tablet, desktop)
- [ ] Run accessibility audit in Storybook (a11y addon)
- [ ] Update or create Storybook stories if needed
- [ ] Test in actual application (not just Storybook)
- [ ] Update component documentation if needed
- [ ] Run `npm run type-check` and `npm run lint`
- [ ] Commit with message: `refactor(component-name): migrate to design system tokens`

---

## 📖 Migration Examples

### Example 1: Simple Component (TaskCheckbox)

**Before**:
```typescript
// ❌ Hardcoded values
<div style={{
  padding: '8px',
  backgroundColor: '#073642',
  borderRadius: '8px',
  border: '2px solid #2aa198'
}}>
  <input
    type="checkbox"
    style={{
      width: '20px',
      height: '20px',
      accentColor: '#2aa198'
    }}
  />
</div>
```

**After**:
```typescript
// ✅ Design system tokens
import { spacing, semanticColors, borderRadius, colors } from '@/lib/design-system'

<div style={{
  padding: spacing[2],
  backgroundColor: semanticColors.bg.secondary,
  borderRadius: borderRadius.base,
  border: `2px solid ${semanticColors.border.accent}`
}}>
  <input
    type="checkbox"
    style={{
      width: spacing[5],
      height: spacing[5],
      accentColor: colors.cyan
    }}
  />
</div>
```

### Example 2: Component with Animation (RitualModal)

**Before**:
```typescript
// ❌ Hardcoded animation
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
  style={{
    padding: '24px',
    background: 'linear-gradient(180deg, #35b5ac 0%, #2aa198 100%)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(42, 161, 152, 0.3)'
  }}
>
```

**After**:
```typescript
// ✅ Design system tokens + reduced motion support
import { spacing, borderRadius, shadows, colors, hoverColors, gradients, duration } from '@/lib/design-system'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const shouldReduceMotion = useReducedMotion()

<motion.div
  initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
  style={{
    padding: spacing[6],
    background: gradients.neutral, // or createGradient(colors.cyan, hoverColors.cyan)
    borderRadius: borderRadius.xl,
    boxShadow: coloredShadow(colors.cyan, '30')
  }}
>
```

### Example 3: Theme-Aware Component

**Before**:
```typescript
// ❌ Hardcoded, won't adapt to themes
<button style={{
  backgroundColor: '#268bd2',
  color: '#fdf6e3'
}}>
```

**After**:
```typescript
// ✅ Semantic colors - adapts to all 20+ themes
import { semanticColors } from '@/lib/design-system'

<button style={{
  backgroundColor: semanticColors.accent.secondary,
  color: semanticColors.text.inverse
}}>
```

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: Using Raw Color Instead of Semantic Color

❌ **Wrong**:
```typescript
import { colors } from '@/lib/design-system'
backgroundColor: colors.base03  // Won't adapt to themes
```

✅ **Correct**:
```typescript
import { semanticColors } from '@/lib/design-system'
backgroundColor: semanticColors.bg.primary  // Adapts to all themes
```

**Exception**: Mode-specific colors (Capture, Scout, Hunt, Map, Mend) can use raw `colors.*`:
```typescript
// ✅ OK for mode identity colors
borderColor: colors.cyan  // Capture mode accent
```

### Pitfall 2: Hardcoding Spacing Instead of Using Grid

❌ **Wrong**:
```typescript
padding: '18px'  // Off the 4px grid
margin: '14px'   // Off the 4px grid
```

✅ **Correct**:
```typescript
import { spacing } from '@/lib/design-system'
padding: spacing[4]  // 16px - on grid
margin: spacing[3]   // 12px - on grid
// Or if 18px is needed:
padding: '18px'  // Document why it's off-grid in comment
```

### Pitfall 3: Forgetting Reduced Motion

❌ **Wrong**:
```typescript
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 0.5 }}
/>
```

✅ **Correct**:
```typescript
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { duration } from '@/lib/design-system'

const shouldReduceMotion = useReducedMotion()

<motion.div
  animate={shouldReduceMotion ? {} : { x: 100 }}
  transition={{ duration: shouldReduceMotion ? 0 : parseFloat(duration.slow) / 1000 }}
/>
```

### Pitfall 4: Inline Styles Instead of Design System

❌ **Wrong**:
```typescript
style={{
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.5'
}}
```

✅ **Correct**:
```typescript
import { fontSize, fontWeight, lineHeight } from '@/lib/design-system'

style={{
  fontSize: fontSize.base,
  fontWeight: fontWeight.semibold,
  lineHeight: lineHeight.normal
}}
```

---

## 🎯 Success Criteria

### Component-Level Success

- [ ] Component imports from `@/lib/design-system`
- [ ] Zero hardcoded color hex codes (except commented exceptions)
- [ ] Zero hardcoded px values (except documented off-grid cases)
- [ ] Component works with all 20+ themes in Storybook
- [ ] Component passes a11y audit in Storybook
- [ ] Component respects `prefers-reduced-motion`
- [ ] Touch targets are minimum 44x44px (mobile)
- [ ] Component has Storybook stories demonstrating all states

### Project-Level Success

- [ ] **100% compliance** across all components
- [ ] All components use semantic colors for theme support
- [ ] All components use spacing tokens for consistency
- [ ] All components respect accessibility guidelines
- [ ] Design system documentation is up-to-date
- [ ] Migration guide is complete and tested

---

## 📝 Testing Strategy

### Manual Testing (Per Component)

1. **Theme Testing** - Test in Storybook with:
   - Solarized Light (default)
   - Solarized Dark
   - Dracula
   - Nord Light/Dark
   - Tokyo Night
   - At least 2 creative themes (Jungle, Synthwave)

2. **Viewport Testing** - Test in Storybook with:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1440px)
   - Wide (1920px)

3. **Accessibility Testing**:
   - Run a11y addon in Storybook
   - Keyboard navigation (Tab, Enter, ESC)
   - Screen reader test (Voice Over or NVDA)
   - Color contrast check

4. **Reduced Motion Testing**:
   - Enable `prefers-reduced-motion` in browser
   - Verify animations are disabled or simplified

### Automated Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests (if component has tests)
npm test -- ComponentName

# Build test
npm run build
```

---

## 📚 Resources

### Documentation
- [Design System Reference](/docs/frontend/DESIGN_SYSTEM.md)
- [Design Principles](/docs/frontend/DESIGN_PRINCIPLES.md)
- [Visual Style Guide](/docs/frontend/VISUAL_STYLE_GUIDE.md)
- [Interaction Patterns](/docs/frontend/INTERACTION_PATTERNS.md)

### Design System Files
- **Tokens**: `src/lib/design-system.ts`
- **Theme Definitions**: `.storybook/themes.ts`
- **Theme Provider**: `src/contexts/ThemeContext.tsx`
- **Reduced Motion Hook**: `src/hooks/useReducedMotion.ts`

### Example Implementations
- ✅ `src/components/system/SystemButton.tsx` - Perfect example
- ✅ `src/components/system/SystemCard.tsx` - Card patterns
- ✅ `src/components/mobile/ChevronButton.tsx` - Mobile patterns
- ✅ `src/components/mobile/modes/CaptureMode.tsx` - Mode patterns

---

## 🤝 Getting Help

### Questions?

1. Check existing compliant components for patterns
2. Review design system documentation
3. Search Storybook for similar components
4. Ask in team chat with:
   - Component name
   - Specific design token question
   - What you've tried

### Code Review

All migration PRs should include:
- [ ] Before/after screenshots in Storybook
- [ ] Theme variation screenshots (at least 3 themes)
- [ ] Accessibility audit results
- [ ] Mobile viewport screenshots
- [ ] Description of design token choices

---

**Last Updated**: December 2024
**Maintained By**: Frontend Development Team
**Next Review**: After Phase 1 completion
