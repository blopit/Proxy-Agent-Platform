# 🎯 Chevron Progress Design System - November 3, 2025

**Purpose**: Create a progress-based design system using chevron elements for multi-step workflows

**Inspiration**:
- [twslankard/css-chevron-bar](https://github.com/twslankard/css-chevron-bar)
- Classic CSS chevron progress indicators for wizards and workflows

---

## 🎨 Design System Overview

### Core Concept

A **progress indicator** using chevron-shaped elements that chain together horizontally, showing:
- **Completed steps** (green) - Successfully finished
- **Active step** (blue) - Currently in progress
- **Pending steps** (gray) - Not yet started
- **Disabled steps** (light gray) - Unavailable or skipped

### Visual Pattern

```
[Completed] → [Completed] → [Active] → [Pending] → [Pending]
   Green         Green        Blue       Gray        Gray
```

---

## 📁 Components

### 1. ChevronElement (Base Component)

**Location**: `mobile/components/core/ChevronElement.tsx`

**Purpose**: Low-level chevron shape primitive with sharp angles

**Features**:
- ✅ Sharp SVG chevron shapes (no rounding)
- ✅ Four positions: `start`, `middle`, `end`, `single`
- ✅ Configurable depth, height, width
- ✅ Optional SVG shadows (shape-accurate)
- ✅ Antialiasing for smooth edges

**Props**:
```typescript
{
  backgroundColor?: string;      // Fill color
  height?: number;               // Chevron height (default: 60)
  width?: number | string;       // Chevron width (default: '100%')
  chevronDepth?: number;         // Angle depth (default: 10)
  shadow?: boolean;              // Enable shadow (default: false)
  position?: ChevronPosition;    // Chain position
  children: React.ReactNode;     // Content inside chevron
}
```

### 2. ChevronProgress (Progress Component)

**Location**: `mobile/src/components/shared/ChevronProgress.tsx`

**Purpose**: High-level progress indicator with state management

**Features**:
- ✅ State-based color system
- ✅ Automatic chevron chaining
- ✅ Customizable color schemes
- ✅ Responsive layout
- ✅ Optional step descriptions

**Props**:
```typescript
{
  steps: ProgressStep[];         // Array of steps with states
  height?: number;               // Chevron height
  chevronDepth?: number;         // Chevron angle depth
  shadow?: boolean;              // Enable shadows
  colors?: {                     // Custom color scheme
    completed?: string;
    active?: string;
    pending?: string;
    disabled?: string;
  };
  textColors?: {                 // Text colors per state
    completed?: string;
    active?: string;
    pending?: string;
    disabled?: string;
  };
  onStepPress?: (step, index) => void;  // Step interaction
}
```

**ProgressStep Interface**:
```typescript
{
  id: string;                    // Unique identifier
  label: string;                 // Step title
  state: ProgressState;          // 'completed' | 'active' | 'pending' | 'disabled'
  description?: string;          // Optional subtitle
}
```

---

## 🎨 Default Color Scheme

### State Colors

| State | Color | Hex | Usage |
|-------|-------|-----|-------|
| **Completed** | Green | `#10B981` | Successfully finished steps |
| **Active** | Blue | `#3B82F6` | Currently in progress |
| **Pending** | Gray | `#6B7280` | Not yet started |
| **Disabled** | Light Gray | `#D1D5DB` | Unavailable/skipped |

### Text Colors

All states use **white text** (`#FFFFFF`) except disabled (`#9CA3AF`)

### Design Rationale

- **Green** = Success/completion (universal pattern)
- **Blue** = Primary action/focus (draws attention)
- **Gray** = Neutral/waiting (low visual weight)
- **Light Gray** = Inactive (de-emphasized)

---

## 📊 Usage Examples

### 1. Basic Workflow (5 Steps)

```typescript
<ChevronProgress
  steps={[
    { id: '1', label: 'Start', state: 'completed', description: 'Initialization' },
    { id: '2', label: 'Setup', state: 'completed', description: 'Configuration' },
    { id: '3', label: 'Process', state: 'active', description: 'In Progress' },
    { id: '4', label: 'Review', state: 'pending', description: 'Validation' },
    { id: '5', label: 'Complete', state: 'pending', description: 'Finalization' },
  ]}
  height={60}
  chevronDepth={10}
  shadow={true}
/>
```

### 2. Simple Task Workflow (4 Steps)

```typescript
<ChevronProgress
  steps={[
    { id: '1', label: 'Capture', state: 'completed' },
    { id: '2', label: 'Clarify', state: 'completed' },
    { id: '3', label: 'Execute', state: 'active' },
    { id: '4', label: 'Done', state: 'pending' },
  ]}
  height={50}
  chevronDepth={10}
  shadow={false}
/>
```

### 3. Biological Workflow Modes

```typescript
<ChevronProgress
  steps={[
    { id: '1', label: 'Capture', state: 'completed', description: 'Inbox' },
    { id: '2', label: 'Scout', state: 'completed', description: 'Browse' },
    { id: '3', label: 'Hunter', state: 'active', description: 'Focus' },
    { id: '4', label: 'Today', state: 'pending', description: 'Calendar' },
    { id: '5', label: 'Mapper', state: 'pending', description: 'Connect' },
  ]}
  height={60}
  chevronDepth={10}
  shadow={true}
/>
```

### 4. Custom Colors (Brand Theme)

```typescript
<ChevronProgress
  steps={workflowSteps}
  height={60}
  chevronDepth={10}
  shadow={true}
  colors={{
    completed: '#8B5CF6',  // Purple
    active: '#F59E0B',     // Amber
    pending: '#6B7280',    // Gray
    disabled: '#E5E7EB',   // Light gray
  }}
/>
```

---

## 📏 Size Guidelines

### Height Variations

| Size | Height | Use Case |
|------|--------|----------|
| **Compact** | 44px | Mobile tab bars, tight spaces |
| **Standard** | 60px | Default, most workflows |
| **Spacious** | 80px | Desktop, prominent displays |

### Chevron Depth

| Depth | Angle | Use Case |
|-------|-------|----------|
| **5px** | Subtle | Minimal, flat designs |
| **10px** | Standard | Balanced, recommended |
| **20px** | Dramatic | High emphasis, visual impact |

### Recommended Combinations

```typescript
// Compact mobile (iOS tab bar standard)
height={44} chevronDepth={10}

// Standard desktop/mobile
height={60} chevronDepth={10}

// Prominent header/hero
height={80} chevronDepth={15}
```

---

## 🎯 Design Patterns

### 1. Linear Progression

**Pattern**: Each step must complete before next activates

```typescript
// Step 1 → Step 2 → Step 3 → Step 4
const steps = workflowSteps.map((step, idx) => ({
  ...step,
  state: idx < currentIndex ? 'completed'
       : idx === currentIndex ? 'active'
       : 'pending',
}));
```

### 2. Non-Linear (Jumpable)

**Pattern**: Users can click any step to jump

```typescript
const steps = workflowSteps.map((step, idx) => ({
  ...step,
  state: idx === selectedIndex ? 'active'
       : visitedSteps.has(idx) ? 'completed'
       : 'pending',
}));
```

### 3. Wizard (One-Way)

**Pattern**: Can't go backwards, linear flow

```typescript
const steps = workflowSteps.map((step, idx) => ({
  ...step,
  state: idx < currentIndex ? 'completed'
       : idx === currentIndex ? 'active'
       : idx > currentIndex ? 'disabled'  // Can't access future
       : 'pending',
}));
```

---

## 🧪 Storybook Stories

### Created Stories (14 total)

**Location**: `mobile/src/components/shared/ChevronProgress.stories.tsx`

1. **Basic** - 5-step workflow with descriptions
2. **TaskWorkflow** - 4-step simple task flow
3. **BiologicalModes** - 5 app modes (Capture → Scout → Hunter → Today → Mapper)
4. **AllCompleted** - All steps completed (success state)
5. **AllPending** - All steps pending (not started)
6. **CustomColors** - Brand color overrides (purple/amber)
7. **HeightVariations** - Compact (44), Standard (60), Spacious (80)
8. **DepthVariations** - Subtle (5), Standard (10), Dramatic (20)
9. **ProgressLevels** - 0%, 25%, 50%, 75%, 100% completion
10. **ThreeStepWizard** - Minimal wizard (Account → Profile → Verify)
11. **SixStepWorkflow** - Many steps (Init → Config → Build → Test → Deploy → Monitor)
12. **ShadowComparison** - Flat vs elevated designs
13. **CompactMobile** - 44px mobile optimized
14. **AllStates** - Reference showing all 4 state colors

### How to View Stories

```bash
cd mobile
npm run storybook-generate  # Regenerate story loader
npm start                   # Launch Expo
# Navigate to /storybook route in app
```

---

## 🎨 Visual Design

### Chevron Shape Anatomy

```
     ┌──────────────┐
    ╱                ╲      ← Right edge (convex, points →)
   ╱                  ╲
  ┌                    ┐
 ╱   Step Content      ╲
┌                       ┐
╲                       ╱
 ╲                     ╱
  ┘                   └
   ╲                 ╱
    ╲               ╱       ← Left edge (concave, points →)
     └─────────────┘
```

**Key Features**:
- Sharp 45° angles (configurable via depth)
- Left concave (<) pointing RIGHT
- Right convex (>) pointing RIGHT
- Both edges point in same direction (forward flow)

### Chaining Pattern

```
[Start    ] → [Middle   ] → [Middle   ] → [End      ]
  │             ╱ │ ╲         ╱ │ ╲         ╱ │
  │            ╱  │  ╲       ╱  │  ╲       ╱  │
  └───────────┘   └───┘     └───┘   └─────┘   │
  Straight      Both         Both           Straight
  left          angled       angled         right
```

**Overlap**: Steps overlap by `chevronDepth` pixels for seamless connection

---

## 🚀 Use Cases

### Perfect For:

1. **Multi-Step Forms** - Registration, checkout, onboarding
2. **Workflow Tracking** - Task pipelines, approval flows
3. **Process Visualization** - Build steps, deployment stages
4. **Wizard Interfaces** - Step-by-step configuration
5. **Progress Indicators** - Linear progression tracking
6. **ADHD-Optimized UI** - Clear visual hierarchy, state awareness

### Examples:

**E-commerce Checkout**:
```
Cart → Shipping → Payment → Review → Confirm
```

**User Onboarding**:
```
Account → Profile → Preferences → Tutorial → Complete
```

**CI/CD Pipeline**:
```
Build → Test → Security → Deploy → Monitor
```

**Task Management** (ADHD focus):
```
Capture → Clarify → Organize → Execute → Review
```

---

## 🎯 ADHD Optimization

### Why Chevrons Work for ADHD

1. **Clear Visual Hierarchy** - States are immediately obvious
2. **Forward Motion** - Chevron arrows create sense of progress
3. **State Permanence** - Completed steps stay green (positive reinforcement)
4. **Low Cognitive Load** - Simple color system (green/blue/gray)
5. **Spatial Memory** - Position in workflow is visual, not abstract

### Design Principles

- **High Contrast** - Bold state colors, clear differentiation
- **Consistent Depth** - Always 10px (reduces decisions)
- **Predictable Patterns** - Linear left-to-right flow
- **Visual Feedback** - Shadows optional for depth cues
- **Minimal Text** - Labels + optional descriptions (scannable)

---

## 📦 Technical Implementation

### Component Hierarchy

```
ChevronProgress (High-level)
    │
    ├── ProgressStep[] (data)
    │
    └── ChevronElement[] (low-level primitives)
            │
            └── SVG Path (sharp chevron shape)
```

### Key Features

1. **SVG-Based** - Sharp, scalable chevron shapes
2. **State Management** - Automatic color/position handling
3. **Responsive** - Flexbox layout, adaptable widths
4. **Customizable** - Color schemes, sizes, depths
5. **Accessible** - Clear labels, high contrast
6. **Performant** - Lightweight SVG rendering

### Performance Notes

- **SVG Filter Shadows** - Follow exact chevron shape
- **Antialiasing** - `shapeRendering="geometricPrecision"`
- **Minimal Re-renders** - Memoize step calculations
- **Efficient Layout** - Flexbox with negative margin overlap

---

## 🔄 Integration Examples

### 1. Task Decomposition Modal

```typescript
<ChevronProgress
  steps={[
    { id: '1', label: 'Analyze', state: 'completed' },
    { id: '2', label: 'Break Down', state: 'active' },
    { id: '3', label: 'Execute', state: 'pending' },
  ]}
  height={44}
  chevronDepth={10}
  shadow={false}
/>
```

### 2. Main Tab Navigation

```typescript
const tabToState = (currentTab: string, tabName: string) =>
  tabName === currentTab ? 'active' : 'pending';

<ChevronProgress
  steps={[
    { id: 'capture', label: 'Capture', state: tabToState(current, 'capture') },
    { id: 'scout', label: 'Scout', state: tabToState(current, 'scout') },
    { id: 'hunter', label: 'Hunter', state: tabToState(current, 'hunter') },
    { id: 'today', label: 'Today', state: tabToState(current, 'today') },
    { id: 'mapper', label: 'Mapper', state: tabToState(current, 'mapper') },
  ]}
/>
```

### 3. Async Job Timeline

```typescript
<ChevronProgress
  steps={job.steps.map(step => ({
    id: step.id,
    label: step.name,
    state: step.status === 'done' ? 'completed'
         : step.status === 'running' ? 'active'
         : step.status === 'pending' ? 'pending'
         : 'disabled',
  }))}
  height={50}
  chevronDepth={10}
  shadow={true}
/>
```

---

## ✅ Summary

### What We Built

1. ✅ **ChevronProgress** component with 4 state types
2. ✅ **14 Storybook stories** showing all variations
3. ✅ **State-based color system** (completed/active/pending/disabled)
4. ✅ **Customizable props** (colors, sizes, depths)
5. ✅ **Sharp SVG chevrons** with shape-accurate shadows
6. ✅ **ADHD-optimized design** (clear hierarchy, visual progress)

### Design System Benefits

- **Simplified API** - Just pass steps with states
- **Consistent Visuals** - Uniform chevron shapes
- **Flexible Layout** - Adapts to different step counts
- **Brand Customizable** - Override colors easily
- **Mobile Optimized** - Works on small screens (44px height)
- **Performance** - Lightweight SVG rendering

### Next Steps

1. Test in Storybook (`npm run storybook-generate && npm start`)
2. Integrate into TaskBreakdownModal for step tracking
3. Use in main tab navigation as alternative to BiologicalTabs
4. Add to AsyncJobTimeline for visual job progress
5. Consider interactive features (click handlers, animations)

---

**Date**: November 3, 2025
**Status**: ✅ Complete
**Inspiration**: [twslankard/css-chevron-bar](https://github.com/twslankard/css-chevron-bar)
**Components**: ChevronElement, ChevronProgress
**Stories**: 14 comprehensive examples
