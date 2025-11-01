# Components Folder Organization

## Overview

The `/src/components` directory is organized by **feature domain** and **reusability level**, creating a clear hierarchy that makes components easy to find and understand.

## Directory Structure

```
src/components/
├── mobile/               # Mobile-specific ADHD-optimized components
│   ├── animations/       # Animation utilities (ChevronProgress)
│   ├── cards/           # Card components (SuggestionCard, TaskCardBig)
│   ├── connections/     # Connection management UI (ConnectionElement)
│   ├── core/            # Core reusable mobile primitives
│   │   ├── BiologicalTabs.tsx
│   │   ├── ChevronButton.tsx
│   │   ├── ChevronStep.tsx
│   │   ├── EnergyGauge.tsx
│   │   └── ExpandableTile.tsx
│   ├── gamification/    # Gamification elements (AchievementGallery)
│   ├── mapper/          # Mapper mode components (MiniChevronNav)
│   ├── modals/          # Modal dialogs (CaptureModal, TaskBreakdownModal)
│   ├── modes/           # 5 Biological Modes (Capture, Scout, Hunt, Map, Mend)
│   ├── navigation/      # Navigation components (CardStack)
│   ├── scout/           # Scout mode sub-components
│   │   ├── DecisionHelper.tsx
│   │   ├── FilterMatrix.tsx
│   │   ├── SmartRecommendations.tsx
│   │   ├── TaskInspector.tsx
│   │   ├── WorkspaceOverview.tsx
│   │   └── ZoneBalanceWidget.tsx
│   └── task/            # Task-specific components (CategoryRow)
│
├── shared/              # Shared cross-platform components
│   ├── AsyncJobTimeline.tsx    # Timeline with chevron steps
│   ├── OpenMoji.tsx             # Emoji rendering
│   ├── ProgressBar.tsx          # Progress indicators
│   └── TaskCheckbox.tsx         # Task completion checkbox
│
├── system/              # System-level design system components
│   ├── SystemBadge.tsx
│   ├── SystemButton.tsx         # Now uses ChevronButton internally
│   ├── SystemCard.tsx
│   ├── SystemInput.tsx
│   ├── SystemModal.tsx
│   └── SystemToast.tsx
│
├── dashboard/           # Dashboard-specific components
│   ├── ActivityFeed.tsx
│   ├── AgentCard.tsx
│   ├── ProductivityChart.tsx
│   └── StatsCard.tsx
│
├── tasks/               # Task management components
│   ├── QuickCapture.tsx
│   └── TaskList.tsx
│
└── workflows/           # AI workflow components
    ├── WorkflowBrowser.tsx
    ├── WorkflowCard.tsx
    ├── WorkflowContextDisplay.tsx
    └── WorkflowExecutionSteps.tsx
```

## Organization Principles

### 1. **Feature-Based Grouping**
Components are grouped by the feature they belong to, not by technical type.

**Example**: Instead of having all modals in `/components/modals`, we have:
- `/mobile/modals` for mobile-specific modals
- `/system/SystemModal` for system-level modals

### 2. **Mobile-First Hierarchy**
The `/mobile` directory is the largest because the app is mobile-first with ADHD-optimized design:

```
mobile/
  └── core/           # Reusable primitives used across mobile features
  └── modes/          # The 5 Biological Modes (main feature)
  └── scout/          # Sub-components specific to Scout Mode
  └── modals/         # Mobile-specific modal implementations
  └── connections/    # Feature: Connection management
  └── gamification/   # Feature: Achievements and rewards
```

### 3. **Shared vs. System vs. Feature**

| Directory | Purpose | Example |
|-----------|---------|---------|
| `/shared` | Used by MULTIPLE platforms (mobile + desktop) | `AsyncJobTimeline`, `TaskCheckbox` |
| `/system` | Design system primitives | `SystemButton`, `SystemInput` |
| `/mobile` | Mobile-specific implementations | `ChevronButton`, `EnergyGauge` |
| `/dashboard` | Dashboard page components | `ActivityFeed`, `StatsCard` |

### 4. **Co-location with Stories**
All components have their Storybook stories co-located:

```
mobile/core/
  ├── ChevronButton.tsx
  ├── ChevronButton.stories.tsx   # Co-located story
  ├── EnergyGauge.tsx
  └── EnergyGauge.stories.tsx
```

## The 5 Biological Modes

The `/mobile/modes` directory contains the core ADHD-optimized workflow modes:

| Mode | Color | Purpose | Key Component |
|------|-------|---------|---------------|
| **Capture** 🎯 | Cyan | 2-second quick externalization | `/modes/CaptureMode.tsx` |
| **Scout** 🔍 | Blue | Netflix-style browsing/triage | `/modes/ScoutMode.tsx` |
| **Hunt** 🏹 | Green | Deep focus with distraction blocking | `/modes/HunterMode.tsx` |
| **Map** 🗺️ | Purple | Strategic planning, hierarchical views | `/modes/MapperMode.tsx` |
| **Mend** 💙 | Orange | Recovery & reflection | `/modes/MenderMode.tsx` |

Each mode has dedicated sub-components in feature-specific directories. For example, Scout Mode's complex UI is broken down into:
- `/scout/SmartRecommendations.tsx`
- `/scout/FilterMatrix.tsx`
- `/scout/DecisionHelper.tsx`
- `/scout/TaskInspector.tsx`
- `/scout/WorkspaceOverview.tsx`
- `/scout/ZoneBalanceWidget.tsx`

## Core Component Patterns

### ChevronButton & ChevronStep
The chevron/arrow shape is a core visual pattern used throughout:

- **ChevronButton** (`/mobile/core/ChevronButton.tsx`): Clickable chevron-shaped buttons
- **ChevronStep** (`/mobile/core/ChevronStep.tsx`): Timeline step visualization
- **AsyncJobTimeline** (`/shared/AsyncJobTimeline.tsx`): Uses ChevronStep for job pipelines

**Usage**: SystemButton now wraps ChevronButton, ConnectionElement uses ChevronStep for backgrounds, WorkflowExecutionSteps uses AsyncJobTimeline.

### Design System Integration
All components follow the mobile-first design system from `/lib/design-system.ts`:

```typescript
import {
  spacing,      // 4px grid (spacing[1] = 4px, spacing[2] = 8px, etc.)
  fontSize,     // Typography scale
  colors,       // Solarized palette for mode identities
  semanticColors, // Theme-aware colors
  borderRadius, // Border radius tokens
  duration,     // Animation durations
  iconSize,     // Icon sizing
} from '@/lib/design-system';
```

## Finding Components

### By Feature
1. **Biological Modes**: `/mobile/modes/`
2. **AI Workflows**: `/workflows/`
3. **Task Management**: `/tasks/` and `/mobile/task/`
4. **Dashboard**: `/dashboard/`
5. **Connections**: `/mobile/connections/`

### By Reusability
1. **Universal Primitives**: `/system/System*.tsx`
2. **Cross-Platform**: `/shared/`
3. **Mobile-Specific**: `/mobile/core/`

### By Visual Pattern
1. **Chevron Shapes**: `/mobile/core/ChevronButton.tsx`, `/mobile/core/ChevronStep.tsx`
2. **Modals**: `/mobile/modals/`, `/system/SystemModal.tsx`
3. **Cards**: `/mobile/cards/`, `/dashboard/`

## Migration Status

Components have been progressively migrated to the design system:

✅ **Fully Migrated** (using design tokens, mobile-first, 44px touch targets):
- TaskCheckbox
- ProgressBar
- QuickCapture
- SystemButton (now uses ChevronButton)
- ConnectionElement (now uses ChevronStep)
- WorkflowExecutionSteps (now uses AsyncJobTimeline)
- WorkflowContextDisplay (improved text readability)

⏳ **Partially Migrated**:
- TaskList (~40% complete)

📋 **Pending Migration**:
- Dashboard components
- Some modal components
- Gamification components

See `/docs/frontend/MOBILE_FIRST_MIGRATION_TEMPLATE.md` for migration guidelines.

## Adding New Components

### Decision Tree

```
Is it a design system primitive?
  YES → /system/System*.tsx
  NO  ↓

Is it used on multiple platforms?
  YES → /shared/
  NO  ↓

Is it mobile-specific?
  YES → /mobile/
        ├─ Does it belong to a biological mode?
        │    YES → /mobile/modes/{ModeName}/
        │    NO  ↓
        ├─ Is it a reusable primitive?
        │    YES → /mobile/core/
        │    NO  ↓
        └─ What feature domain?
             → /mobile/{feature}/
  NO  ↓

What page/feature?
  → /dashboard/, /tasks/, /workflows/, etc.
```

### Example: Adding a New Filter Component

**Question**: Where should a new "PriorityFilter" component go?

**Analysis**:
- Used only in Scout Mode → `/mobile/scout/PriorityFilter.tsx`
- Reusable across modes → `/mobile/core/PriorityFilter.tsx`
- Used in workflows too → `/shared/PriorityFilter.tsx`

### Example: Adding a New Card Type

**Question**: Where should "WorkoutCard" go?

**Analysis**:
- Mobile task card → `/mobile/cards/WorkoutCard.tsx`
- Dashboard widget → `/dashboard/WorkoutCard.tsx`

## Best Practices

1. **Co-locate stories**: Every `.tsx` component should have a `.stories.tsx` file in the same directory
2. **Use index exports**: Complex feature directories should have an `index.ts` for clean imports
3. **Follow naming**: `{FeatureName}{ComponentType}.tsx` (e.g., `TaskCardBig.tsx`, `EnergyGauge.tsx`)
4. **Import from core**: Prefer importing from `/mobile/core/` over duplicating primitives
5. **Design system first**: Always use design tokens from `/lib/design-system.ts`
6. **Mobile-first**: Start at 375px, scale up with breakpoints
7. **44px touch targets**: All interactive elements should have minimum 44×44px touch area (WCAG AA)
8. **Chevron consistency**: Use ChevronButton/ChevronStep for visual rhythm

## Questions?

If you're unsure where a component belongs:

1. Check if similar components already exist using Storybook
2. Review this document's decision tree
3. Consider reusability and platform specificity
4. When in doubt, favor more specific directories over generic ones

---

Last Updated: 2025-10-31
