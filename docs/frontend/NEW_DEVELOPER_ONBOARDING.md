# New Developer Onboarding Guide

Welcome to the Proxy Agent Platform frontend team! This guide will get you up to speed quickly.

---

## 🎯 Day 1: Setup & Orientation

### 1. Clone & Install (15 minutes)

```bash
# Clone repository
git clone <repo-url>
cd Proxy-Agent-Platform/frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3000

# Start Storybook (in another terminal)
npm run storybook
# Opens at http://localhost:6006
```

### 2. Read Core Documentation (2-3 hours)

**Must Read (in order):**

1. [Frontend Complete Guide](./FRONTEND_COMPLETE_GUIDE.md) - Read sections:
   - Quick Start
   - Tech Stack Overview
   - Project Architecture
   - Design System (CRITICAL!)

2. [Quick Reference](./QUICK_REFERENCE.md) - Bookmark this!
   - Design tokens
   - Common patterns
   - Commands

**Skim These:**

3. [Component Patterns](./COMPONENT_PATTERNS.md) - Reference when building components
4. [Storybook Guide](./STORYBOOK_GUIDE.md) - Reference when creating stories

### 3. Explore the Codebase (1 hour)

**Browse these directories:**

```bash
# Design system (MOST IMPORTANT)
cat src/lib/design-system.ts

# Component template
cat src/components/_TEMPLATE.tsx

# Example components
ls src/components/mobile/
cat src/components/mobile/ChevronButton.tsx

# Custom hooks
ls src/hooks/

# API client
cat src/lib/api.ts
```

**Open Storybook and explore:**
- Browse component categories
- Try different themes (toolbar)
- Test different viewports
- Check accessibility panel

---

## 🛠️ Day 2: First Component

### Morning: Learn by Example

**Pick a simple component to study:**

1. Open `src/components/mobile/ChevronButton.tsx`
2. Open `src/components/mobile/ChevronButton.stories.tsx`
3. View it in Storybook

**Observe:**
- How design tokens are imported
- TypeScript prop interfaces
- JSDoc comments
- Story structure

### Afternoon: Build Your First Component

**Task: Create a simple badge component**

1. **Copy template:**
   ```bash
   cp src/components/_TEMPLATE.tsx src/components/shared/Badge.tsx
   ```

2. **Define props:**
   ```typescript
   interface BadgeProps {
     label: string
     variant?: 'success' | 'warning' | 'error' | 'info'
   }
   ```

3. **Implement using design tokens:**
   ```typescript
   import { spacing, semanticColors, fontSize, borderRadius } from '@/lib/design-system'

   export default function Badge({ label, variant = 'info' }: BadgeProps) {
     const colors = {
       success: semanticColors.status.success,
       warning: semanticColors.status.warning,
       error: semanticColors.status.error,
       info: semanticColors.status.info
     }

     return (
       <span style={{
         padding: `${spacing[1]} ${spacing[2]}`,
         backgroundColor: colors[variant],
         color: semanticColors.text.inverse,
         borderRadius: borderRadius.pill,
         fontSize: fontSize.xs,
         fontWeight: fontWeight.semibold
       }}>
         {label}
       </span>
     )
   }
   ```

4. **Create story:**
   ```typescript
   // Badge.stories.tsx
   import type { Meta, StoryObj } from '@storybook/react'
   import Badge from './Badge'

   const meta: Meta<typeof Badge> = {
     title: 'Shared/Badge',
     component: Badge,
     parameters: { layout: 'centered' },
     tags: ['autodocs']
   }

   export default meta
   type Story = StoryObj<typeof Badge>

   export const Success: Story = {
     args: { label: 'Success', variant: 'success' }
   }

   export const Warning: Story = {
     args: { label: 'Warning', variant: 'warning' }
   }

   export const Error: Story = {
     args: { label: 'Error', variant: 'error' }
   }

   export const Info: Story = {
     args: { label: 'Info', variant: 'info' }
   }
   ```

5. **Test in Storybook:**
   ```bash
   npm run storybook
   # Navigate to Shared > Badge
   # Try different themes
   # Check accessibility panel
   ```

6. **Verify quality:**
   ```bash
   npm run type-check  # Should pass
   npm run lint        # Should pass
   ```

**Success criteria:**
- ✅ Component uses only design tokens (no hardcoded values)
- ✅ TypeScript types are correct
- ✅ Story renders in Storybook
- ✅ Works with all themes
- ✅ No accessibility violations
- ✅ Type-check and lint pass

---

## 📚 Day 3: Understand the Architecture

### Morning: Architecture Deep Dive

**Read:** [Frontend Complete Guide - Architecture](./FRONTEND_COMPLETE_GUIDE.md#project-architecture)

**Understand the 4 layers:**

1. **Pages** (`src/app/`) - Next.js App Router
   - Route definitions
   - Server components
   - Layout composition

2. **Components** (`src/components/`) - Presentation
   - UI composition
   - Event handling
   - Visual logic

3. **Hooks** (`src/hooks/`) - Business logic
   - State management
   - Side effects
   - Reusable logic

4. **Services** (`src/lib/`) - Data & utilities
   - API communication
   - Design system
   - Utilities

**Exercise: Trace a feature**

Pick "Task Capture" and trace through:
1. `src/app/mobile/capture/page.tsx` (Page)
2. `src/components/mobile/modes/CaptureMode.tsx` (Component)
3. `src/hooks/useCaptureFlow.ts` (Hook)
4. `src/lib/api.ts` (Service)

### Afternoon: Design System Mastery

**Task: Memorize key design tokens**

Create a cheat sheet with:
- Common spacing values (1, 2, 4, 6, 8)
- Semantic colors (bg, text, border, accent, status)
- Font sizes (xs, sm, base, lg)
- Border radius (base, lg, pill)

**Practice: Convert hardcoded styles**

Find a component with hardcoded values and convert it:

```typescript
// Before
<div style={{
  padding: '16px',
  backgroundColor: '#002b36',
  fontSize: '18px'
}}>

// After
<div style={{
  padding: spacing[4],
  backgroundColor: semanticColors.bg.primary,
  fontSize: fontSize.lg
}}>
```

---

## 🚀 Day 4: Real Task

### Morning: Pick a Real Issue

**Good first issues:**
- Fix a bug in an existing component
- Add a new variant to an existing component
- Improve accessibility of a component
- Add missing Storybook story

**Process:**
1. Read the issue description
2. Find the relevant component(s)
3. Check if there's a Storybook story
4. Make changes
5. Test in Storybook
6. Run type-check and lint
7. Create PR

### Afternoon: Code Review

**Review a PR from another developer:**
- Check for design token usage
- Verify TypeScript types
- Test in Storybook
- Check accessibility
- Suggest improvements

**Get your PR reviewed:**
- Address feedback
- Make changes
- Get approval
- Merge!

---

## 🎓 Week 2: Advanced Topics

### Component Patterns

**Study:** [Component Patterns](./COMPONENT_PATTERNS.md)

Focus on:
- Mobile component patterns
- Biological workflow modes
- Animation patterns
- Accessibility patterns

**Practice:**
- Implement touch gestures
- Add smooth animations
- Ensure keyboard navigation

### API Integration

**Study:** [API Integration](./FRONTEND_COMPLETE_GUIDE.md#api-integration)

**Build a feature that:**
- Fetches data from API
- Handles loading states
- Handles errors
- Updates optimistically

### State Management

**Study:** [State Management](./FRONTEND_COMPLETE_GUIDE.md#state-management)

**Practice:**
- Create a custom hook
- Use useContext
- Manage complex state
- Handle side effects

---

## 📋 Checklist: You're Ready When...

### Knowledge
- [ ] I can explain the 4-layer architecture
- [ ] I know where the design system lives
- [ ] I can create a component using only design tokens
- [ ] I can create a Storybook story
- [ ] I know how to use the API client
- [ ] I understand the biological workflow modes

### Skills
- [ ] I've created at least 2 components
- [ ] I've written Storybook stories
- [ ] I've tested accessibility in Storybook
- [ ] I've integrated with the API
- [ ] I've created a custom hook
- [ ] I've submitted a PR

### Tools
- [ ] I can run dev server (`npm run dev`)
- [ ] I can run Storybook (`npm run storybook`)
- [ ] I can run type-check (`npm run type-check`)
- [ ] I can run linter (`npm run lint`)
- [ ] I can navigate the codebase
- [ ] I can debug in browser DevTools

---

## 🆘 Common Questions

### Q: Where do I find...?

**Design tokens?**
- `src/lib/design-system.ts`

**Component template?**
- `src/components/_TEMPLATE.tsx`

**API client?**
- `src/lib/api.ts`

**Custom hooks?**
- `src/hooks/`

**Examples?**
- Storybook (`npm run storybook`)

### Q: How do I...?

**Create a new component?**
1. Copy `_TEMPLATE.tsx`
2. Use design tokens
3. Create `.stories.tsx`
4. Test in Storybook

**Use design tokens?**
```typescript
import { spacing, semanticColors } from '@/lib/design-system'
```

**Call the API?**
```typescript
import { apiClient } from '@/lib/api'
const data = await apiClient.getTasks({ user_id: 'demo-user' })
```

**Test accessibility?**
- Open component in Storybook
- Check Accessibility panel
- Fix violations

**Deploy?**
```bash
npm run build
npm run start
```

### Q: What if I'm stuck?

1. **Search documentation** - Check all guides
2. **Check Storybook** - See working examples
3. **Check git history** - See how others did it
4. **Ask in team chat** - We're here to help!

---

## 📚 Reference Material

### Daily Reference
- [Quick Reference](./QUICK_REFERENCE.md) - Code snippets, patterns, commands

### Comprehensive Guides
- [Frontend Complete Guide](./FRONTEND_COMPLETE_GUIDE.md) - Everything
- [Component Patterns](./COMPONENT_PATTERNS.md) - Implementation patterns
- [Storybook Guide](./STORYBOOK_GUIDE.md) - Component development

### Existing Docs (Legacy)
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Original guide
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Design tokens
- [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) - Component inventory
- [API_PATTERNS.md](./API_PATTERNS.md) - API integration

---

## 🎉 Welcome to the Team!

You're now ready to contribute to the Proxy Agent Platform frontend!

**Remember:**
- Design tokens, always
- Storybook for everything
- Accessibility matters
- Test before PR
- Ask questions

**Happy coding! 🚀**

---

**Questions?** Ask in team chat or create a discussion issue.

**Last Updated:** October 28, 2025
