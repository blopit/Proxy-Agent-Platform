# Storybook Glossary

**📚 Your Complete Guide to 38 Story Files & 478 Component Stories**

Last Updated: 2025-10-30

---

## 📊 Overview

**Stats:**
- **38 story files** (components with Storybook documentation)
- **478 total stories** (individual variants, states, and use cases)
- **80 total components** (47% have Storybook coverage)
- **6 categories:** System, Shared, Mobile, Dashboard, Tasks, Workflows

**Why so many stories?**
- **Comprehensive documentation** - Every variant, state, and edge case covered
- **Design system showcase** - Demonstrates correct usage of tokens, spacing, colors
- **ADHD-optimized** - Multiple real-world examples reduce decision paralysis
- **Quality assurance** - Visual regression testing for all states

**This is a good thing!** More stories = better documentation = fewer bugs = faster development.

---

## 🔍 Quick Reference Table

| Component | Stories | Category | Purpose | When to Use |
|-----------|---------|----------|---------|-------------|
| **SystemButton** | 24 | System | All button variants | Any clickable action (primary CTA, secondary, destructive) |
| **SystemCard** | 21 | System | Card containers | Grouping related content, elevated surfaces |
| **SystemInput** | 31 | System | Form inputs | Text entry, email, password, textarea, validation |
| **SystemModal** | 14 | System | Dialog overlays | Confirmations, forms, complex interactions |
| **SystemToast** | 22 | System | Notifications | Success/error messages, temporary feedback |
| **SystemBadge** | 30 | System | Status indicators | Priority tags, counts, status dots |
| **AsyncJobTimeline** | 27 | Shared | Multi-step progress | Task execution, async operations, workflows |
| **ProgressBar** | 19 | Shared | Linear progress | File uploads, task completion, skill progress |
| **TaskCheckbox** | 9 | Shared | Task completion | Marking tasks done with animation |
| **OpenMoji** | 19 | Shared | Consistent emojis | Visual language, task types, celebrations |
| **CaptureMode** | 13 | Mobile | Quick task capture | Fast task entry, voice input, 2-sec target |
| **ScoutMode** | 10 | Mobile | Task discovery | Browse tasks by category, Netflix-style |
| **HunterMode** | 3 | Mobile | Deep focus | Single task focus, distraction blocking |
| **MapperMode** | 5 | Mobile | Task breakdown | Hierarchical planning, dependencies |
| **MenderMode** | 4 | Mobile | Recovery/reflection | Review completed tasks, energy management |
| **AddMode** | 21 | Mobile | Multi-modal capture | Advanced capture (text/voice/camera/image) |
| **BiologicalTabs** | 22 | Mobile | Mode navigation | Switch between 5 biological modes |
| **ChevronButton** | 16 | Mobile | Interlocking buttons | Biological tab system, step indicators |
| **ChevronStep** | 14 | Mobile | Step indicators | AsyncJobTimeline steps, progress tracking |
| **EnergyGauge** | 13 | Mobile | Energy visualization | Current energy 0-100%, color-coded |
| **TaskCardBig** | 18 | Mobile | Large task cards | Featured tasks, detailed view |
| **TaskBreakdownModal** | 13 | Mobile | Task details overlay | Show subtasks, micro-steps, time estimates |
| **CaptureModal** | 8 | Mobile | Capture overlay | Quick capture without leaving page |
| **ExpandableTile** | 5 | Mobile | Expandable content | Progressive disclosure, details on demand |
| **ConnectionElement** | 9 | Mobile | Visual connections | Task relationships, dependencies |
| **SuggestionCard** | 7 | Mobile | AI suggestions | Recommended tasks, smart prompts |
| **MapperComponents** | 11 | Mobile | Mapper UI pieces | Map sections, subtabs, mini nav, ritual modal |
| **StatsCard** | 6 | Dashboard | KPI metrics | Display key numbers (tasks, hours, streak) |
| **ActivityFeed** | 2 | Dashboard | Recent activity | Timeline of completed tasks, events |
| **ProductivityChart** | 2 | Dashboard | Data visualization | Weekly trends, productivity graphs |
| **AgentCard** | 9 | Dashboard | AI agent status | Agent capabilities, availability, tasks |
| **DashboardShowcase** | 5 | Dashboard | Full dashboard | Complete layout, all components together |
| **QuickCapture** | 5 | Tasks | Simple task entry | Basic text input, fast capture |
| **TaskList** | 7 | Tasks | Task list display | Filterable, sortable task lists |
| **WorkflowCard** | 7 | Workflows | Workflow preview | Display workflow metadata, status |
| **WorkflowBrowser** | 4 | Workflows | Workflow discovery | Browse available workflows |
| **WorkflowContextDisplay** | 10 | Workflows | Workflow details | Show workflow context, parameters |
| **WorkflowExecutionSteps** | 7 | Workflows | Workflow progress | Track execution, show current step |

---

## 📁 Component Categories

### 🎨 System Components (Design Primitives)
**6 components, 142 stories**

These are your **building blocks** - use them for ALL UI construction.

| Component | Stories | Variants/Features |
|-----------|---------|-------------------|
| **SystemButton** | 24 | Primary, Secondary, Success, Error, Warning, Ghost \| SM, Base, LG \| Default, Hover, Active, Disabled, Loading |
| **SystemCard** | 21 | Default, Elevated, Outlined, Ghost \| None, SM, Base, LG padding \| Hoverable, Clickable |
| **SystemInput** | 31 | Text, Email, Password, Number, Date, Tel, Textarea \| Label, Placeholder, Helper, Error \| Icon support |
| **SystemModal** | 14 | SM (400px), Base (600px), LG (800px), XL (1000px), Full (95vw) \| Backdrop, ESC key, Focus trap |
| **SystemToast** | 22 | Success, Error, Warning, Info \| 2s, 5s, 10s, Persistent \| Position variants |
| **SystemBadge** | 30 | Primary, Secondary, Success, Warning, Error, Info \| Dot, Count, Text \| Sizes |

**When to use:**
- ✅ **Always use System components** for buttons, inputs, cards, modals
- ✅ Import from `@/components/system/`
- ✅ Never create custom buttons/inputs - use System variants
- ❌ Don't hardcode styles - use design tokens via System components

---

### 📦 Shared Components (Reusable Utilities)
**4 components, 74 stories**

Cross-cutting components used across multiple features.

| Component | Stories | Use Cases |
|-----------|---------|-----------|
| **AsyncJobTimeline** | 27 | Task execution, API calls, multi-step processes, workflow execution |
| **ProgressBar** | 19 | File uploads, task completion %, skill progress, workload distribution |
| **TaskCheckbox** | 9 | Marking tasks complete, todo lists, selection |
| **OpenMoji** | 19 | Task types 🎯, celebrations 🎉, status indicators, visual consistency |

**When to use:**
- **AsyncJobTimeline**: Any operation with multiple sequential steps (capture, process, delegate, complete)
- **ProgressBar**: Show percentage completion (0-100%) or segmented progress
- **TaskCheckbox**: Task completion with satisfying animation
- **OpenMoji**: Consistent emoji rendering across themes

---

### 📱 Mobile Components (Biological Workflows)
**15 components, 157 stories**

ADHD-optimized task management interface.

#### **Core Modes (5 Biological States)**

| Mode | Stories | Purpose | Color | When to Use |
|------|---------|---------|-------|-------------|
| **CaptureMode** | 13 | Ultra-fast task capture | Cyan (#2aa198) | Need to externalize thoughts quickly (2-sec target) |
| **ScoutMode** | 10 | Task discovery & triage | Blue (#268bd2) | Browse tasks without commitment, explore options |
| **HunterMode** | 3 | Deep focus execution | Green (#859900) | Single-task focus, distraction blocking |
| **MapperMode** | 5 | Strategic planning | Purple (#6c71c4) | Task breakdown, dependencies, hierarchical view |
| **MenderMode** | 4 | Recovery & reflection | Orange (#cb4b16) | Review completed work, celebrate wins, recharge |

#### **ScoutMode Sub-Components** (10 stories in ScoutMode.stories.tsx)
- **TaskInspector**: Deep task details (files, contacts, dependencies)
- **SmartRecommendations**: AI-powered next task suggestions
- **FilterMatrix**: Advanced multi-dimensional filtering
- **DecisionHelper**: Side-by-side task comparison
- **WorkspaceOverview**: High-level productivity dashboard
- **ZoneBalanceWidget**: Work-life balance tracking

#### **Supporting Components**

| Component | Stories | Purpose |
|-----------|---------|---------|
| **AddMode** | 21 | Advanced multi-modal capture (text, voice, camera, image, 6 types) |
| **BiologicalTabs** | 22 | Mode navigation with energy-adaptive icons |
| **ChevronButton** | 16 | Interlocking chevron UI for tabs |
| **ChevronStep** | 14 | Step indicators for AsyncJobTimeline |
| **EnergyGauge** | 13 | Visual energy level (0-100%, color-coded) |
| **TaskCardBig** | 18 | Large task cards (hero, standard, compact, mini) |
| **TaskBreakdownModal** | 13 | Overlay showing task micro-steps |
| **CaptureModal** | 8 | Quick capture without navigation |
| **ExpandableTile** | 5 | Progressive disclosure UI |
| **ConnectionElement** | 9 | Visual task relationship lines |
| **SuggestionCard** | 7 | AI suggestion display |
| **MapperComponents** | 11 | Mapper mode UI pieces (sections, subtabs, nav, ritual) |

**When to use:**
- **Capture/Add**: User needs to add tasks (Capture = simple, Add = advanced with voice/camera)
- **Scout**: User wants to explore tasks without committing
- **Hunt**: User ready to focus on ONE task
- **Map**: User needs to plan complex projects
- **Mend**: User completing work session, needs recovery

---

### 📊 Dashboard Components (Analytics & Overview)
**5 components, 24 stories**

Desktop productivity dashboard.

| Component | Stories | Purpose | When to Use |
|-----------|---------|---------|-------------|
| **StatsCard** | 6 | Display single KPI | Show metrics (tasks today, streak, XP, hours) |
| **ActivityFeed** | 2 | Recent activity timeline | Show completed tasks, events, milestones |
| **ProductivityChart** | 2 | Weekly data visualization | Display trends, patterns, productivity graphs |
| **AgentCard** | 9 | AI agent status | Show agent capabilities, availability, assigned tasks |
| **DashboardShowcase** | 5 | Complete layout demo | See full dashboard, responsive behavior |

**When to use:**
- Desktop/wide screen layouts (1024px+)
- High-level overview of productivity metrics
- Agent monitoring and status

---

### ✅ Tasks Components (Traditional Task Management)
**2 components, 12 stories**

Standard task management UI (non-mobile).

| Component | Stories | Purpose | When to Use |
|-----------|---------|---------|-------------|
| **QuickCapture** | 5 | Simple task input | Basic text entry, no multi-modal features |
| **TaskList** | 7 | Filterable task list | Display, filter, sort multiple tasks |

**When to use:**
- **QuickCapture**: Desktop quick add, simple use cases
- **TaskList**: Traditional task list view (alternative to Scout Mode)

---

### 🔄 Workflows Components (Pipelex Integration)
**4 components, 28 stories**

Workflow automation and execution.

| Component | Stories | Purpose | When to Use |
|-----------|---------|---------|-------------|
| **WorkflowCard** | 7 | Workflow preview card | Browse workflows, show metadata |
| **WorkflowBrowser** | 4 | Workflow discovery | Search, filter, select workflows |
| **WorkflowContextDisplay** | 10 | Workflow details | Show parameters, inputs, context |
| **WorkflowExecutionSteps** | 7 | Execution progress | Track running workflow, show steps |

**When to use:**
- Workflow automation features
- Pipelex integration
- Multi-step process orchestration

---

## 🏷️ Story Naming Conventions

Understanding story names helps you navigate Storybook faster.

### **Pattern: ComponentName → Variant → State → EdgeCase**

**Example Story Names:**

| Story Name | What It Shows |
|------------|---------------|
| **Default** | Basic component with default props |
| **Primary** | Primary variant (most common use) |
| **Secondary** | Secondary variant (alternative style) |
| **Small / Medium / Large** | Size variants |
| **WithIcon** | Component with icon |
| **Loading** | Loading state |
| **Disabled** | Disabled state |
| **Error** | Error state |
| **LongText** | Edge case: very long text |
| **EmptyState** | Edge case: no data |
| **Playground** | Interactive controls for all props |
| **AllVariants** | All variants side-by-side |
| **UseCaseXYZ** | Real-world example scenario |

### **Story Categories:**

1. **Basic Stories**: Default, Primary, Secondary
2. **Variant Stories**: Visual style variations (Outlined, Elevated, Ghost)
3. **Size Stories**: SM, Base, LG, XL
4. **State Stories**: Hover, Active, Disabled, Loading, Error
5. **Edge Case Stories**: LongText, EmptyState, ManyItems, NoItems
6. **Use Case Stories**: Real-world scenarios (QuickTaskCapture, ShoppingList, MeetingNotes)
7. **Playground Stories**: Interactive controls to test all props

---

## 🎯 Decision Trees

### "I need a button"

```
Question: What action type?
├─ Primary action (main CTA) → System/SystemButton → Primary variant
├─ Secondary action → System/SystemButton → Secondary variant
├─ Success (completion) → System/SystemButton → Success variant
├─ Destructive action → System/SystemButton → Error variant
└─ Tertiary/subtle → System/SystemButton → Ghost variant

Question: What size?
├─ Mobile toolbar → SM (32px)
├─ Standard UI → Base (40px)
└─ Hero CTA → LG (48px)
```

### "I need to show a task"

```
Question: Where?
├─ Mobile featured → Mobile/Cards/TaskCardBig → Hero story
├─ Mobile list → Mobile/Cards/TaskCardBig → Standard story
├─ Desktop list → Tasks/TaskList → Default story
└─ Scout mode → Mobile/Modes/ScoutMode → Category rows
```

### "I need task input"

```
Question: Complexity?
├─ Simple text only → Tasks/QuickCapture
├─ Voice + text → Mobile/Modes/CaptureMode
└─ Multi-modal (voice/camera/image) → Mobile/Modes/AddMode

Question: Context?
├─ Standalone capture page → AddMode or CaptureMode
└─ Quick modal overlay → Mobile/CaptureModal
```

### "I need to show progress"

```
Question: Type of progress?
├─ Multi-step process → Shared/AsyncJobTimeline
├─ Percentage (0-100%) → Shared/ProgressBar
├─ Task completion → Shared/TaskCheckbox
└─ Workflow execution → Workflows/WorkflowExecutionSteps
```

### "I need a modal/dialog"

```
Question: Content type?
├─ Simple confirmation → System/SystemModal → SM size
├─ Form input → System/SystemModal → Base size
├─ Complex content → System/SystemModal → LG size
├─ Task capture → Mobile/CaptureModal
└─ Task details → Mobile/TaskBreakdownModal
```

---

## 🔍 Navigation Tips

### **Storybook UI Tips**

1. **Search Bar** (Ctrl/Cmd + K)
   - Type component name: "SystemButton"
   - Type keyword: "form", "task", "progress"
   - Search by story name: "Playground", "AllVariants"

2. **Sidebar Filtering**
   - Click folder names to collapse/expand
   - Ctrl+Click multiple stories to compare

3. **Docs Tab**
   - Click "Docs" to see all stories for a component on one page
   - Shows component API (props, types, defaults)
   - Includes usage examples and code snippets

4. **Controls Panel**
   - Adjust props interactively
   - Test different text lengths, states, variants
   - Perfect for "Playground" stories

5. **Accessibility Panel**
   - Check color contrast
   - Test keyboard navigation
   - Review ARIA labels

### **Finding What You Need**

| I Need To... | Go To... |
|--------------|----------|
| Understand a component | Component → Docs tab |
| See all variants | Component → "AllVariants" story |
| Test interactively | Component → "Playground" story |
| See edge cases | Component → "LongText", "EmptyState", "Error" stories |
| Real-world example | Component → "UseCase*" stories |
| Compare components | Multi-select in sidebar |

---

## 📊 Story Breakdown by Count

### **Top 10 Most Documented Components**

| Rank | Component | Stories | Reason |
|------|-----------|---------|--------|
| 1 | SystemInput | 31 | Many input types × states × validation |
| 2 | SystemBadge | 30 | 6 variants × 3 sizes × states |
| 3 | AsyncJobTimeline | 27 | Complex multi-step visualization |
| 4 | SystemButton | 24 | 6 variants × 3 sizes × 4 states |
| 5 | BiologicalTabs | 22 | 5 modes × energy states × time of day |
| 6 | SystemToast | 22 | 4 types × durations × positions |
| 7 | SystemCard | 21 | 4 variants × paddings × states |
| 8 | AddMode | 21 | 6 capture types × workflows × configurations |
| 9 | ProgressBar | 19 | Linear + segmented × checkpoints × variants |
| 10 | OpenMoji | 19 | Color + line art × sizes × effects |

### **By Category**

| Category | Components | Total Stories | Avg Stories/Component |
|----------|------------|---------------|----------------------|
| **System** | 6 | 142 | 23.7 |
| **Shared** | 4 | 74 | 18.5 |
| **Mobile** | 15 | 157 | 10.5 |
| **Dashboard** | 5 | 24 | 4.8 |
| **Tasks** | 2 | 12 | 6.0 |
| **Workflows** | 4 | 28 | 7.0 |
| **TOTAL** | **38** | **478** | **12.6** |

**Insights:**
- System components have the most stories (average 24 per component) because they're used everywhere and need comprehensive coverage
- Mobile components have moderate coverage (average 11) focused on real-world use cases
- Dashboard components have fewer stories (average 5) as they're simpler display components

---

## 🎨 Component Usage Patterns

### **Common Component Combinations**

**Task Capture Flow:**
```
CaptureMode OR AddMode
  → AsyncJobTimeline (show progress)
  → SystemToast (success notification)
  → TaskCardBig (show created task)
```

**Scout Mode UI:**
```
BiologicalTabs (mode navigation)
  → ScoutMode (main view)
    ├─ TaskCardBig (task cards)
    ├─ SmartRecommendations (AI suggestions)
    ├─ FilterMatrix (filtering)
    └─ TaskInspector (task details)
```

**Dashboard Layout:**
```
StatsCard × 4 (KPIs)
  → AgentCard × 6 (agent grid)
  → ProductivityChart (trends)
  → ActivityFeed (recent activity)
```

**Form Pattern:**
```
SystemCard (container)
  → SystemInput × N (form fields)
  → SystemButton (submit)
  → SystemToast (feedback)
```

---

## 🚀 Getting Started Guides

### **For New Developers**

1. **Start with System Components** (30 min)
   - Browse `System/SystemButton` → See all button variants
   - Check `System/SystemInput` → Understand form patterns
   - Review `System/SystemCard` → Learn container patterns

2. **Explore Shared Components** (15 min)
   - `Shared/AsyncJobTimeline` → Multi-step processes
   - `Shared/ProgressBar` → Progress visualization

3. **Understand Mobile Modes** (45 min)
   - Read `Mobile/Modes/CaptureMode` docs
   - Explore `Mobile/Modes/ScoutMode` and sub-components
   - Try interactive "Playground" stories

4. **Build Your First Component** (1 hour)
   - Copy `src/components/_TEMPLATE.tsx`
   - Import System components
   - Create `.stories.tsx` file
   - Add Default + Variants + Playground stories

### **For Designers**

1. **Browse Design System** → `System/*` components
2. **Check Color Themes** → Storybook toolbar → Theme dropdown
3. **Test Responsive** → Storybook toolbar → Viewport selector
4. **Check Accessibility** → Accessibility panel (a11y addon)

### **For QA/Testers**

1. **Visual Regression** → Browse all stories, check rendering
2. **Interaction Testing** → Use "Playground" stories, adjust controls
3. **Edge Cases** → Look for "LongText", "EmptyState", "Error" stories
4. **Accessibility** → Check a11y panel for all components

---

## 📚 Related Documentation

- **[Frontend Entry Point](./FRONTEND_ENTRY_POINT.md)** - Master hub for all frontend docs
- **[Design Principles](./DESIGN_PRINCIPLES.md)** - Why we designed it this way
- **[Design System](./DESIGN_SYSTEM.md)** - Design tokens reference
- **[Component Patterns](./COMPONENT_PATTERNS.md)** - Implementation patterns
- **[Storybook Guide](./STORYBOOK_GUIDE.md)** - How to write stories

---

## 🆘 FAQ

### **Q: Why do we have 478 stories?**
A: Each component has multiple variants, sizes, states, and edge cases. This comprehensive coverage:
- **Documents** all possible uses
- **Tests** visual appearance across themes
- **Demonstrates** correct design token usage
- **Reduces** bugs by showing edge cases

### **Q: Should I create a story for every component?**
A: **No.** Only create stories for:
- ✅ Reusable components (used in 2+ places)
- ✅ Components with variants or states
- ✅ Complex components that need documentation
- ❌ Skip: One-off components, simple wrappers

### **Q: How do I know which component to use?**
A: Use the **Decision Trees** section above, or:
1. Search this glossary for your use case
2. Check the **Quick Reference Table**
3. Browse related stories in Storybook

### **Q: Can I add more stories?**
A: **Yes!** Add stories when:
- You discover a new use case
- You fix a visual bug (add regression test story)
- You add a new variant
- You want to demonstrate correct usage

### **Q: How do I reduce the number of stories?**
A: **Don't.** More stories = better docs. But you can:
- Consolidate similar variants into one story with controls
- Use "AllVariants" stories to show multiple variants side-by-side
- Group related components (like we did with ScoutMode sub-components)

### **Q: Are these stories used for testing?**
A: **Yes!** Stories serve triple duty:
1. **Documentation** - Show how to use components
2. **Visual Testing** - Chromatic visual regression tests
3. **Interactive Testing** - Manual QA via Storybook UI

---

## 🎯 Quick Lookup Cheatsheet

```
BUTTON → System/SystemButton
CARD → System/SystemCard
INPUT → System/SystemInput
MODAL → System/SystemModal
NOTIFICATION → System/SystemToast
BADGE/TAG → System/SystemBadge

PROGRESS → Shared/ProgressBar or Shared/AsyncJobTimeline
CHECKBOX → Shared/TaskCheckbox
EMOJI → Shared/OpenMoji

TASK CAPTURE → Mobile/Modes/CaptureMode or Mobile/Modes/AddMode
TASK BROWSE → Mobile/Modes/ScoutMode
TASK FOCUS → Mobile/Modes/HunterMode
TASK PLAN → Mobile/Modes/MapperMode
TASK REVIEW → Mobile/Modes/MenderMode

TASK CARD → Mobile/Cards/TaskCardBig
TASK LIST → Tasks/TaskList
TASK DETAILS → Mobile/TaskBreakdownModal

DASHBOARD → Dashboard/DashboardShowcase
STATS → Dashboard/StatsCard
CHART → Dashboard/ProductivityChart
ACTIVITY → Dashboard/ActivityFeed

WORKFLOW → Workflows/*
```

---

**Happy Storybook browsing! 🎨**

**Questions?** Check the [Storybook Guide](./STORYBOOK_GUIDE.md) or ask in team chat.

**Last Updated:** 2025-10-30
**Maintained By:** Frontend Team
