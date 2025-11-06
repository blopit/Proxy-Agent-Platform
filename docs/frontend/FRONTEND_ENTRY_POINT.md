# Frontend Development Entry Point

**🚨 DEPRECATION NOTICE: This document describes the OLD Next.js web frontend**

**For CURRENT mobile development, go to:**
- **[`FRONTEND_CURRENT_STATE.md`](../FRONTEND_CURRENT_STATE.md)** - Current architecture explanation
- **[`mobile/README.md`](../../mobile/README.md)** - Mobile app setup and development

---

## ⚠️ Historical Reference Only

This document describes the **deprecated Next.js web frontend** that was removed in October 2025.

**Why this document still exists:**
- Historical reference for design decisions
- Component patterns that were migrated to React Native
- Architecture principles that still apply
- Documentation of what was attempted and learned

**This is NOT the current system.**

---

# Frontend Development Entry Point (DEPRECATED)

**🎯 THE SINGLE SOURCE OF TRUTH FOR ALL FRONTEND DEVELOPMENT** (as of October 2025 - now deprecated)

This WAS your starting point for all frontend work on the Proxy Agent Platform. Everything connected from here.

---

## 🚀 Quick Navigation by Role

### 👋 I'm a **New Developer** (Never seen this codebase)
**Time to productive:** 2-3 hours

1. Start → [Onboarding Guide](./NEW_DEVELOPER_ONBOARDING.md)
   - Day 1: Setup (30 min)
   - Day 1: First component (90 min)
   - Day 2-4: Progressive learning

2. Then → [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)
   - Understand the 4-layer system
   - Learn the tech stack
   - See how everything connects

3. Always reference → [Quick Reference](./QUICK_REFERENCE.md)
   - Design tokens
   - Common patterns
   - Code snippets

### 💼 I'm an **Experienced Developer** (Joining the team)
**Time to first PR:** 1-2 hours

1. Skim → [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)
   - Architecture overview (15 min)
   - Design system (CRITICAL - 10 min)
   - Core systems (10 min)

2. Bookmark → [Quick Reference](./QUICK_REFERENCE.md)
   - Design tokens
   - API calls
   - Common patterns

3. Deep dive when needed → [Component Patterns](./COMPONENT_PATTERNS.md)

4. For components → [Storybook Guide](./STORYBOOK_GUIDE.md)

### 🎨 I'm a **UI/Component Developer**
**Building new components or features**

1. Before building anything:
   - Check [Component Catalog](./COMPONENT_CATALOG.md) - Does it exist?
   - Check [Don't Recreate](./DONT_RECREATE.md) - Is there a system for this?

2. Copy template → `src/components/_TEMPLATE.tsx`

3. Follow → [Component Patterns](./COMPONENT_PATTERNS.md)
   - Mobile patterns
   - Animation patterns
   - Accessibility patterns

4. Create story → [Storybook Guide](./STORYBOOK_GUIDE.md)

5. Always use → [Quick Reference](./QUICK_REFERENCE.md)
   - Design tokens (NEVER hardcode!)
   - Common component patterns

### 🔌 I'm Integrating with **Backend APIs**

1. Read → [API Patterns](./API_PATTERNS.md)
   - API client usage
   - Error handling
   - WebSocket integration

2. Reference → [Frontend Architecture](./FRONTEND_ARCHITECTURE.md#core-systems)
   - Section: "API Client System"
   - Section: "WebSocket System"

3. Use hooks → [Frontend Complete Guide](./FRONTEND_COMPLETE_GUIDE.md#custom-hooks)
   - useWebSocket
   - useCaptureFlow

### 🧪 I'm **Testing & QA**

1. Component testing → [Storybook Guide](./STORYBOOK_GUIDE.md)
   - 28+ existing stories
   - Accessibility testing
   - Visual regression

2. Unit testing → [Frontend Complete Guide](./FRONTEND_COMPLETE_GUIDE.md#testing-strategy)

3. Accessibility → [Component Patterns](./COMPONENT_PATTERNS.md#accessibility-patterns)

### 🤖 I'm an **AI Agent / Automation System**

1. Agent workflow → [Agent Storybook Entry Point](./AGENT_STORYBOOK_ENTRY_POINT.md)
   - Autonomous component creation
   - Story generation
   - Theme testing automation
   - Quality checks

### 🎨 I'm a **Designer / Visual Artist**

1. Visual design system → [Designer Guide](./DESIGNER_GUIDE.md)
   - 20+ color themes
   - Component library in Storybook
   - Design tokens and patterns
   - Accessibility guidelines

### 🎯 I'm Implementing **Biological Modes** (Capture/Scout/Hunt/Map/Mend)

1. Understand the system → [Frontend Architecture](./FRONTEND_ARCHITECTURE.md#8-biological-workflow-system)

2. Implementation patterns → [Component Patterns](./COMPONENT_PATTERNS.md#biological-workflow-modes)

3. See examples → `src/components/mobile/modes/`

---

## 📋 Complete Documentation Map

### Core Documentation (Read These First)

```
FRONTEND_ENTRY_POINT.md (YOU ARE HERE)
    ├── NEW_DEVELOPER_ONBOARDING.md          [2-3 hours to productive]
    │   ├── Day 1: Setup (30 min)
    │   ├── Day 1: First Component (90 min)
    │   ├── Day 2: Build Real Component
    │   ├── Day 3: Architecture Deep Dive
    │   └── Day 4: Real Task
    │
    ├── FRONTEND_ARCHITECTURE.md             [System design - 30 min read]
    │   ├── 4-Layer Architecture
    │   ├── Technology Stack (Next.js 15, React 18, TypeScript)
    │   ├── 8 Core Systems
    │   │   ├── Design System ⭐ CRITICAL
    │   │   ├── API Client System
    │   │   ├── Theme System
    │   │   ├── Voice Input System
    │   │   ├── WebSocket System
    │   │   ├── Storybook System
    │   │   ├── Component Template System
    │   │   └── Biological Workflow System
    │   ├── Component Organization (50+ components)
    │   ├── Data Flow Patterns
    │   ├── State Management
    │   ├── Routing Architecture
    │   └── Performance Architecture
    │
    ├── QUICK_REFERENCE.md                   [Daily reference - bookmark this]
    │   ├── Design System Tokens
    │   │   ├── Spacing (4px grid)
    │   │   ├── Colors (semantic)
    │   │   ├── Typography
    │   │   ├── Border Radius
    │   │   ├── Shadows
    │   │   └── Animations
    │   ├── Component Templates
    │   ├── Common Patterns
    │   ├── API Integration
    │   └── Commands Cheat Sheet
    │
    └── README.md                            [Documentation hub]
        └── Links to all guides
```

### Implementation Guides (Reference When Building)

```
COMPONENT_PATTERNS.md                        [Implementation patterns]
    ├── Mobile Component Patterns
    │   ├── Touch-friendly design
    │   ├── Gesture support
    │   └── Mobile-first approach
    ├── Biological Workflow Modes (5 modes)
    │   ├── Capture Mode (voice input, 2-sec target)
    │   ├── Scout Mode (Netflix-style browsing)
    │   ├── Hunter Mode (deep work focus)
    │   ├── Mapper Mode (task breakdown)
    │   └── Mender Mode (review & reflection)
    ├── Card Components (4 sizes)
    ├── Animation Patterns
    │   ├── Framer Motion
    │   └── CSS Animations
    ├── Form Patterns
    ├── Modal Patterns
    └── Accessibility Patterns
        ├── Keyboard Navigation
        ├── ARIA Labels
        └── Focus Management

STORYBOOK_GUIDE.md                           [Component development & testing]
    ├── Getting Started with Storybook
    ├── Writing Stories
    │   ├── Basic Stories
    │   ├── Advanced Stories
    │   └── Interactive Stories
    ├── Theme System (20+ themes)
    │   ├── Solarized Light/Dark
    │   ├── Dracula, Nord, Gruvbox
    │   ├── Tokyo Night, Monokai
    │   └── Creative themes (Jungle, Oceanic, Synthwave, etc.)
    ├── Interactive Stories
    │   ├── Controls Panel
    │   ├── Actions Panel
    │   └── Play Functions
    ├── Accessibility Testing
    │   ├── a11y Addon
    │   ├── WCAG Compliance
    │   └── Keyboard Testing
    └── Best Practices

FRONTEND_COMPLETE_GUIDE.md                   [Comprehensive reference - 36KB]
    ├── Quick Start & Setup
    ├── Tech Stack Overview
    ├── Project Architecture (4 layers)
    ├── Design System (CRITICAL)
    ├── Component Development
    ├── State Management
    ├── Styling Approaches
    ├── Storybook Development
    ├── API Integration
    ├── Custom Hooks
    │   ├── useVoiceInput
    │   ├── useWebSocket
    │   └── useCaptureFlow
    ├── Testing Strategy
    ├── Performance Optimization
    ├── Build & Deployment
    └── Troubleshooting
```

### Domain-Specific Documentation

```
API_PATTERNS.md                              [Backend integration]
    ├── API Client Usage
    ├── Error Handling
    ├── WebSocket Integration
    ├── Optimistic Updates
    └── Real-time Features

COMPONENT_CATALOG.md                         [50+ existing components]
    ├── Mobile Components
    ├── Shared Components
    ├── Dashboard Components
    ├── Task Components
    └── System Components

DESIGN_SYSTEM.md                             [Design tokens reference]
    ├── Spacing Scale
    ├── Color Palette
    ├── Typography Scale
    ├── Semantic Colors
    └── Animation Tokens

DONT_RECREATE.md                             [Existing systems checklist]
    ├── What Already Exists
    ├── Common Patterns
    └── Reusable Systems
```

### Legacy/Specialized Documentation

```
DEVELOPER_GUIDE.md                           [Original developer guide]
FRONTEND_PATTERNS.md                         [Additional patterns]
FRONTEND_PITFALLS.md                         [Common mistakes to avoid]
MOBILE_ADHD_SYSTEM_STATUS.md                 [Mobile ADHD system status]
VOICE_INPUT_IMPLEMENTATION.md                [Voice input deep dive]
CHEVRON_DEBUG_GUIDE.md                       [Chevron component debugging]
CHEVRON_TESTING_GUIDE.md                     [Chevron testing]
STORYBOOK_SETUP_SUMMARY.md                   [Storybook setup]
PROGRESS_BAR_IMPROVEMENTS.md                 [Progress bar improvements]
```

---

## 🎯 Common Workflows

### Workflow 1: Creating a New Component

```
1. Check if it exists
   → Search COMPONENT_CATALOG.md
   → Search DONT_RECREATE.md

2. Copy template
   → src/components/_TEMPLATE.tsx

3. Learn patterns
   → COMPONENT_PATTERNS.md (mobile, animations, accessibility)

4. Use design tokens
   → QUICK_REFERENCE.md (design system section)
   → NEVER hardcode values!

5. Create story
   → STORYBOOK_GUIDE.md (writing stories)

6. Test accessibility
   → STORYBOOK_GUIDE.md (accessibility testing)

7. Verify quality
   → npm run type-check
   → npm run lint
```

### Workflow 2: Integrating with Backend

```
1. Understand API patterns
   → API_PATTERNS.md

2. Use API client
   → QUICK_REFERENCE.md (API integration section)
   → import { apiClient } from '@/lib/api'

3. Handle loading/error states
   → COMPONENT_PATTERNS.md (form patterns)

4. For real-time features
   → Use useWebSocket hook
   → FRONTEND_ARCHITECTURE.md (WebSocket System)
```

### Workflow 3: Building a Biological Mode

```
1. Understand the mode system
   → FRONTEND_ARCHITECTURE.md (Biological Workflow System)

2. See existing modes
   → src/components/mobile/modes/

3. Follow mode patterns
   → COMPONENT_PATTERNS.md (Biological Workflow Modes)

4. Use specific hooks
   → useCaptureFlow (for Capture Mode)
   → useVoiceInput (for voice features)
```

### Workflow 4: Fixing a Bug

```
1. Reproduce in Storybook
   → npm run storybook
   → Find the component story

2. Understand the component
   → Read the component file
   → Check COMPONENT_PATTERNS.md for patterns

3. Check for common issues
   → FRONTEND_PITFALLS.md
   → FRONTEND_COMPLETE_GUIDE.md (Troubleshooting)

4. Fix and verify
   → Update component
   → Test in Storybook
   → Run type-check and lint
```

### Workflow 5: Improving Accessibility

```
1. Test in Storybook
   → Open component story
   → Check Accessibility panel (a11y addon)

2. Learn patterns
   → COMPONENT_PATTERNS.md (Accessibility Patterns)
   → ARIA labels
   → Keyboard navigation
   → Focus management

3. Fix violations
   → Update component
   → Re-test in Storybook

4. Verify with keyboard
   → Tab through all interactive elements
   → Test Enter, Space, Escape, Arrow keys
```

---

## 📂 Codebase Structure Map

### Critical Files (Memorize These Locations)

```
DESIGN SYSTEM (MOST IMPORTANT!)
└── src/lib/design-system.ts                 ⭐ Single source of truth for design

COMPONENT TEMPLATE
└── src/components/_TEMPLATE.tsx             ⭐ Copy this for new components

API CLIENT
├── src/lib/api.ts                           ⭐ All API calls
└── src/lib/ai-api.ts                        ⭐ AI-specific endpoints

CUSTOM HOOKS
├── src/hooks/useVoiceInput.ts               ⭐ Voice-to-text
├── src/hooks/useWebSocket.ts                ⭐ Real-time connection
└── src/hooks/useCaptureFlow.ts              ⭐ Task capture workflow

THEME SYSTEM
└── src/contexts/ThemeContext.tsx            ⭐ Light/dark theme
```

### Component Directories

```
src/components/
├── mobile/                                  50+ mobile-first components
│   ├── modes/                               5 biological workflow modes
│   │   ├── CaptureMode.tsx
│   │   ├── ScoutMode.tsx
│   │   ├── HunterMode.tsx
│   │   ├── MapperMode.tsx
│   │   └── MenderMode.tsx
│   ├── cards/                               Card components (hero, standard, compact, mini)
│   ├── BiologicalTabs.tsx
│   ├── ChevronButton.tsx
│   ├── CaptureModal.tsx
│   └── [40+ more]
│
├── shared/                                  Reusable components
│   ├── AsyncJobTimeline.tsx
│   ├── OpenMoji.tsx
│   ├── ProgressBar.tsx
│   └── TaskCheckbox.tsx
│
├── dashboard/                               Dashboard components
│   ├── StatsCard.tsx
│   ├── ProductivityChart.tsx
│   ├── ActivityFeed.tsx
│   └── AgentCard.tsx
│
├── tasks/                                   Task management
│   ├── QuickCapture.tsx
│   ├── TaskList.tsx
│   └── TaskDashboard.tsx
│
└── system/                                  Design system primitives
    ├── SystemButton.tsx
    ├── SystemCard.tsx
    ├── SystemInput.tsx
    └── SystemModal.tsx
```

### Route Structure

```
src/app/
├── layout.tsx                               Root layout (providers, global styles)
├── page.tsx                                 Dashboard home
├── globals.css                              Global styles (Tailwind)
│
├── mobile/                                  Mobile-specific routes
│   ├── page.tsx                             /mobile
│   ├── capture/                             /mobile/capture
│   ├── scout/                               /mobile/scout
│   ├── hunt/                                /mobile/hunt
│   ├── map/                                 /mobile/map
│   └── mend/                                /mobile/mend
│
├── tasks/                                   Task management routes
│   ├── page.tsx                             /tasks
│   └── [id]/                                /tasks/:id
│
└── demo/                                    Demo pages
    └── page.tsx                             /demo
```

---

## 🔥 Critical Rules (READ THIS!)

### The 10 Commandments of Frontend Development

1. **NEVER hardcode design values** - Always use design-system.ts tokens
2. **ALWAYS use TypeScript types** - No 'any', define interfaces for all props
3. **ALWAYS add JSDoc comments** - Document all components and complex functions
4. **ALWAYS check if it exists first** - Search COMPONENT_CATALOG.md before creating
5. **ALWAYS create Storybook stories** - All significant components need stories
6. **ALWAYS test accessibility** - Use Storybook a11y addon, ensure keyboard nav works
7. **ALWAYS use semantic HTML** - `<button>` not `<div onClick>`, `<nav>` not `<div>`
8. **ALWAYS handle loading/error states** - Never assume success
9. **ALWAYS clean up side effects** - Return cleanup function in useEffect
10. **ALWAYS run type-check and lint before PR** - No exceptions

### Design System Golden Rule

```typescript
// ❌ FORBIDDEN: Hardcoded values
<div style={{
  padding: '16px',
  backgroundColor: '#002b36',
  fontSize: '18px',
  borderRadius: '16px'
}}>

// ✅ REQUIRED: Design tokens
import { spacing, semanticColors, fontSize, borderRadius } from '@/lib/design-system'

<div style={{
  padding: spacing[4],
  backgroundColor: semanticColors.bg.primary,
  fontSize: fontSize.lg,
  borderRadius: borderRadius.lg
}}>
```

**Why?** Hardcoded values break theming, make maintenance hell, and create inconsistency.

---

## 🆘 When You're Stuck

### Decision Tree

```
Problem: I don't know where to start
    → Read: NEW_DEVELOPER_ONBOARDING.md

Problem: I need to create a component
    1. Does it exist? → Check COMPONENT_CATALOG.md
    2. Is there a system? → Check DONT_RECREATE.md
    3. How do I build it? → Read COMPONENT_PATTERNS.md
    4. Copy template → src/components/_TEMPLATE.tsx

Problem: I need a design token
    → Reference: QUICK_REFERENCE.md (Design System Tokens)
    → Source: src/lib/design-system.ts

Problem: I need to call the API
    → Reference: QUICK_REFERENCE.md (API Integration)
    → Guide: API_PATTERNS.md
    → Source: src/lib/api.ts

Problem: Component not working in Storybook
    → Troubleshooting: STORYBOOK_GUIDE.md (Troubleshooting section)

Problem: TypeScript errors
    → Run: npm run type-check
    → Fix type definitions
    → Reference: FRONTEND_COMPLETE_GUIDE.md (Component Development)

Problem: Accessibility violations
    → Guide: COMPONENT_PATTERNS.md (Accessibility Patterns)
    → Test: Open in Storybook, check a11y panel

Problem: General confusion
    → Read: FRONTEND_ARCHITECTURE.md (30 min overview)
    → Ask: Team chat (after checking docs)
```

---

## 📊 Documentation Stats

- **Total Guides:** 6 comprehensive guides + 10+ specialized docs
- **Total Size:** ~150KB of documentation
- **Code Examples:** 150+ snippets
- **Topics Covered:** 70+ sections
- **Components Documented:** 50+ components
- **Onboarding Time:** 2-3 hours to first contribution

---

## 🎓 Learning Paths

### Path 1: Complete Beginner (Never used Next.js/React)
**Time:** 1 week

1. External learning (3-4 days)
   - [React Tutorial](https://react.dev/learn)
   - [Next.js Tutorial](https://nextjs.org/learn)
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

2. Our docs (2-3 days)
   - NEW_DEVELOPER_ONBOARDING.md (follow the 4-day plan)
   - Practice building components

### Path 2: React Developer (New to this codebase)
**Time:** 1-2 days

1. Day 1 Morning: Architecture understanding
   - FRONTEND_ARCHITECTURE.md (30 min)
   - Explore codebase (30 min)
   - Read QUICK_REFERENCE.md (15 min)

2. Day 1 Afternoon: Hands-on
   - Follow NEW_DEVELOPER_ONBOARDING.md Day 1 afternoon
   - Build first component

3. Day 2: Real work
   - Pick an issue
   - Reference docs as needed

### Path 3: Expert Developer (Want quick overview)
**Time:** 1-2 hours

1. Skim FRONTEND_ARCHITECTURE.md (20 min)
   - Focus on: Design System, Core Systems
2. Bookmark QUICK_REFERENCE.md (5 min)
3. Browse Storybook (30 min)
4. Start coding, reference docs as needed

---

## 🚀 Ready to Start?

**New Developer?**
→ Go to [NEW_DEVELOPER_ONBOARDING.md](./NEW_DEVELOPER_ONBOARDING.md)

**Need quick reference?**
→ Go to [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

**Want to understand the system?**
→ Go to [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md)

**Building components?**
→ Go to [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md)

**Working with Storybook?**
→ Go to [STORYBOOK_GUIDE.md](./STORYBOOK_GUIDE.md)

**Need everything?**
→ Go to [FRONTEND_COMPLETE_GUIDE.md](./FRONTEND_COMPLETE_GUIDE.md)

---

**Welcome to the Proxy Agent Platform Frontend! 🎉**

**Last Updated:** October 28, 2025
**Maintained By:** Frontend Development Team
