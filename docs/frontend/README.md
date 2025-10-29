# Frontend Documentation

**🎯 START HERE:** [**FRONTEND_ENTRY_POINT.md**](./FRONTEND_ENTRY_POINT.md)

**The single source of truth** that connects all frontend documentation, code, and workflows.

---

## ⚡ Quick Start by Role

| I'm a... | Start Here | Time to Productive |
|----------|------------|-------------------|
| **New Developer** | [Entry Point](./FRONTEND_ENTRY_POINT.md#-im-a-new-developer-never-seen-this-codebase) → [Onboarding](./NEW_DEVELOPER_ONBOARDING.md) | 2-3 hours |
| **Experienced Developer** | [Entry Point](./FRONTEND_ENTRY_POINT.md#-im-an-experienced-developer-joining-the-team) → [Architecture](./FRONTEND_ARCHITECTURE.md) | 1-2 hours |
| **UI/Component Developer** | [Entry Point](./FRONTEND_ENTRY_POINT.md#-im-a-uicomponent-developer) → [Component Patterns](./COMPONENT_PATTERNS.md) | 30 min |
| **Backend Integration** | [Entry Point](./FRONTEND_ENTRY_POINT.md#-im-integrating-with-backend-apis) → [API Patterns](./API_PATTERNS.md) | 20 min |
| **Testing & QA** | [Entry Point](./FRONTEND_ENTRY_POINT.md#-im-testing--qa) → [Storybook Guide](./STORYBOOK_GUIDE.md) | 30 min |

---

## 📚 Complete Documentation Web

### Core Documentation (Master Entry Point)

**[FRONTEND_ENTRY_POINT.md](./FRONTEND_ENTRY_POINT.md)** ⭐ **THE SINGLE SOURCE OF TRUTH**
- Complete documentation map connecting all files
- Role-based quick start guides (5 personas)
- Common workflows with step-by-step paths
- Decision trees for when you're stuck
- Critical rules and golden paths
- **Read this first** - it connects to everything

---

### Essential Guides

**1. [Frontend Architecture](./FRONTEND_ARCHITECTURE.md)** - System Design (30 min read)
- 4-layer architecture overview
- Technology stack (Next.js 15, React 18, TypeScript, Storybook)
- 8 core systems documented
  - Design System ⭐ CRITICAL
  - API Client System
  - Theme System
  - Voice Input System
  - WebSocket System
  - Storybook System
  - Component Template System
  - Biological Workflow System
- Component organization (50+ components mapped)
- Data flow patterns
- State management architecture
- Routing architecture
- Performance architecture

**2. [New Developer Onboarding](./NEW_DEVELOPER_ONBOARDING.md)** - 4-Day Learning Path
- Day 1: Setup & first component (2-3 hours)
- Day 2: Build real component (hands-on)
- Day 3: Architecture deep dive
- Day 4: Real task contribution
- Success criteria at each step
- Hands-on exercises

**3. [Quick Reference](./QUICK_REFERENCE.md)** - Daily Lookup (Bookmark This!)
- Design system tokens (spacing, colors, typography, etc.)
- Component templates
- Common patterns (button, card, input, modal, etc.)
- API integration snippets
- Custom hooks usage
- Commands cheat sheet
- File paths reference

**4. [Frontend Complete Guide](./FRONTEND_COMPLETE_GUIDE.md)** - Comprehensive Reference (36KB)

- Quick Start & Setup
- Tech Stack Overview (Next.js 15, React 18, TypeScript, Tailwind)
- Project Architecture (4-layer architecture)
- Design System (spacing, colors, typography, animations)
- Component Development (patterns, best practices)
- State Management (React hooks, ThemeContext)
- Styling Approaches (Tailwind + Design Tokens)
- Storybook Development
- API Integration
- Custom Hooks (useVoiceInput, useWebSocket, useCaptureFlow)
- Testing Strategy
- Performance Optimization
- Build & Deployment
- Troubleshooting

**Who should read this:** All frontend developers, both new and experienced

---

### 2. [Component Patterns](./COMPONENT_PATTERNS.md)

**Deep dive into component patterns and implementation examples:**

- Mobile Components (touch-friendly, gesture support)
- Biological Workflow Modes (Capture, Scout, Hunt, Map, Mend)
- Card Components (hero, standard, compact, mini)
- Animation Patterns (Framer Motion, CSS animations)
- Form Patterns (controlled inputs, validation)
- Modal Patterns (simple, animated)
- Accessibility Patterns (keyboard navigation, ARIA, focus management)

**Who should read this:** Developers implementing new components or features

---

### 3. [Storybook Guide](./STORYBOOK_GUIDE.md)

**Complete guide to Storybook for component development and testing:**

- Getting Started with Storybook
- Writing Stories (basic, advanced, interactive)
- Theme System (20+ color themes)
- Interactive Stories (controls, actions, play functions)
- Accessibility Testing (a11y addon)
- Best Practices
- Troubleshooting

**Who should read this:** Developers creating or testing UI components

---

## 🚀 Quick Start

### New to the Project?

1. **Read:** [Frontend Complete Guide](./FRONTEND_COMPLETE_GUIDE.md) sections:
   - Quick Start
   - Tech Stack Overview
   - Project Architecture
   - Design System

2. **Setup:** Follow installation instructions
   ```bash
   cd frontend
   npm install
   npm run dev        # Start Next.js
   npm run storybook  # Start Storybook
   ```

3. **Explore:** Browse existing components in Storybook

4. **Build:** Follow [Component Development](./FRONTEND_COMPLETE_GUIDE.md#component-development) guide

---

## 🎯 Common Tasks

### I want to...

#### Create a new component
1. Check if it exists: Search [Frontend Complete Guide](./FRONTEND_COMPLETE_GUIDE.md)
2. Copy template: `src/components/_TEMPLATE.tsx`
3. Follow: [Component Development](./FRONTEND_COMPLETE_GUIDE.md#component-development)
4. Reference: [Component Patterns](./COMPONENT_PATTERNS.md)
5. Create story: [Storybook Guide](./STORYBOOK_GUIDE.md#writing-stories)

#### Work with the design system
1. Read: [Design System](./FRONTEND_COMPLETE_GUIDE.md#design-system)
2. Import tokens: `import { spacing, semanticColors } from '@/lib/design-system'`
3. Never hardcode values!

#### Add animations
1. Check: [Animation Patterns](./COMPONENT_PATTERNS.md#animation-patterns)
2. Use Framer Motion or CSS animations
3. Use design system duration/easing tokens

#### Integrate with API
1. Read: [API Integration](./FRONTEND_COMPLETE_GUIDE.md#api-integration)
2. Use: `import { apiClient } from '@/lib/api'`
3. Handle errors and loading states

#### Test accessibility
1. Open component in Storybook
2. Check: [Accessibility Testing](./STORYBOOK_GUIDE.md#accessibility-testing)
3. Review a11y panel for violations
4. Follow: [Accessibility Patterns](./COMPONENT_PATTERNS.md#accessibility-patterns)

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────┐
│  Layer 1: Pages (App Router)              │
│  src/app/ - Route definitions              │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│  Layer 2: Components                       │
│  src/components/ - UI composition          │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│  Layer 3: Hooks (Business Logic)           │
│  src/hooks/ - State & side effects         │
└────────────────────────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│  Layer 4: Services & Utilities             │
│  src/lib/ - API, design system, utils      │
└────────────────────────────────────────────┘
```

**Read more:** [Project Architecture](./FRONTEND_COMPLETE_GUIDE.md#project-architecture)

---

## 🎨 Design System Highlights

### Core Principles
1. **Never hardcode design values**
2. **Always use design tokens from `src/lib/design-system.ts`**
3. **Follow 4px grid for spacing**
4. **Use semantic colors, not raw hex codes**

### Example

```typescript
import { spacing, semanticColors, fontSize, borderRadius } from '@/lib/design-system'

// ✅ GOOD: Using design tokens
<div style={{
  padding: spacing[4],                    // 16px
  backgroundColor: semanticColors.bg.primary,
  fontSize: fontSize.lg,                  // 18px
  borderRadius: borderRadius.lg           // 16px
}} />

// ❌ BAD: Hardcoded values
<div style={{
  padding: '16px',
  backgroundColor: '#002b36',
  fontSize: '18px',
  borderRadius: '16px'
}} />
```

**Read more:** [Design System](./FRONTEND_COMPLETE_GUIDE.md#design-system)

---

## 🧪 Testing & Quality

### Testing Pyramid

```
           E2E Tests (future)
              /     \
         Integration Tests
            /           \
       Unit Tests + Storybook
```

**Current Setup:**
- **Unit Tests:** Jest + @testing-library/react
- **Component Testing:** Storybook with 28+ stories
- **Accessibility:** Storybook a11y addon
- **Type Checking:** TypeScript strict mode

**Commands:**
```bash
npm run test              # Unit tests
npm run test:coverage     # With coverage
npm run type-check        # TypeScript
npm run lint              # ESLint
npm run storybook         # Visual testing
```

**Read more:** [Testing Strategy](./FRONTEND_COMPLETE_GUIDE.md#testing-strategy)

---

## 📱 Key Features

### Biological Workflow Modes

Five ADHD-friendly task management modes:

1. **Capture** 🎤 - Ultra-fast voice/text capture (2-second target)
2. **Scout** 🔍 - Netflix-style task browsing
3. **Hunt** 🎯 - Deep work focus mode
4. **Map** 🗺️ - Task breakdown & dependencies
5. **Mend** ✨ - Review & reflection

**Read more:** [Biological Workflow Modes](./COMPONENT_PATTERNS.md#biological-workflow-modes)

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.6 | React framework |
| React | 18.2.0 | UI library |
| TypeScript | 5.2.2 | Type safety |
| Tailwind CSS | 3.3.0 | Utility CSS |
| Storybook | 9.1.15 | Component dev |
| Framer Motion | 12.23.24 | Animations |

**Full list:** [Tech Stack Overview](./FRONTEND_COMPLETE_GUIDE.md#tech-stack-overview)

---

## 🎯 Best Practices Checklist

Before creating a component:

- [ ] Check if it already exists (search codebase)
- [ ] Copy `_TEMPLATE.tsx` as starting point
- [ ] Import design system tokens
- [ ] Define TypeScript interfaces for props
- [ ] Add JSDoc comments
- [ ] Use semantic colors (not hardcoded)
- [ ] Follow 4px grid with spacing tokens
- [ ] Create Storybook story
- [ ] Test accessibility in Storybook
- [ ] Test in browser at localhost:3000
- [ ] Run `npm run type-check` and `npm run lint`

**Read more:** [Component Development](./FRONTEND_COMPLETE_GUIDE.md#component-development)

---

## 🆘 Getting Help

### Troubleshooting

1. **Search documentation** - Check all 3 guides
2. **Check Storybook** - See working examples
3. **Check git history** - See how others solved similar problems
4. **Check browser console** - Look for errors
5. **Ask in team chat** - Explain what you've tried

**Common issues:** [Troubleshooting](./FRONTEND_COMPLETE_GUIDE.md#troubleshooting)

---

## 📂 File Structure Quick Reference

```
frontend/
├── src/
│   ├── app/                     # Next.js routes
│   ├── components/
│   │   ├── _TEMPLATE.tsx        # 👈 Copy this for new components
│   │   ├── mobile/              # Mobile components (50+)
│   │   ├── shared/              # Reusable components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── tasks/               # Task management
│   │   └── system/              # Design system primitives
│   ├── hooks/                   # Custom hooks
│   │   ├── useVoiceInput.ts
│   │   ├── useWebSocket.ts
│   │   └── useCaptureFlow.ts
│   ├── contexts/                # React contexts
│   │   └── ThemeContext.tsx
│   ├── lib/
│   │   ├── design-system.ts     # 👈 CRITICAL: Design tokens
│   │   ├── api.ts               # API client
│   │   └── ai-api.ts            # AI endpoints
│   └── types/                   # TypeScript types
│
├── .storybook/                  # Storybook config
├── public/                      # Static assets
├── package.json
└── README.md                    # Frontend README
```

---

## 🔗 Related Documentation

### Project-Level Docs
- [Main README](../../README.md) - Project overview
- [Backend CLAUDE.md](../../CLAUDE.md) - Python coding standards
- [Tech Stack](../TECH_STACK.md) - Full stack documentation

### Frontend Specific
- [Frontend README](../../frontend/README.md) - Quick start guide
- Frontend documentation (this directory) - Comprehensive guides

---

## 📝 Contributing to Documentation

### When to Update Docs

Update these docs when:
- Adding new design tokens
- Creating new component patterns
- Adding new hooks or utilities
- Changing architecture
- Adding new tools or libraries
- Discovering new best practices

### How to Update

1. Identify which guide needs updating
2. Follow existing format and style
3. Add examples for new patterns
4. Update "Last Updated" date at bottom
5. Create PR with documentation changes

---

## 📊 Documentation Stats

- **Total Guides:** 3 comprehensive guides
- **Total Sections:** 50+ sections
- **Code Examples:** 100+ examples
- **Coverage:** Architecture, Components, Design System, Testing, Storybook, API Integration, Accessibility

---

**Welcome to the team! Happy coding! 🚀**

---

**Last Updated:** October 28, 2025
**Maintained By:** Frontend Development Team
