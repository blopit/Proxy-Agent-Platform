# 🎨 Frontend Developer - Quick Start

**Goal**: Pick up a frontend task and build it in Storybook
**Time to first component**: 30 minutes
**Approach**: Storybook-first, then integrate

---

## ⚡ 5-Minute Setup

### 1. Clone & Install
```bash
cd /path/to/Proxy-Agent-Platform/frontend
pnpm install              # Install dependencies
```

### 2. Verify Setup
```bash
pnpm dev                  # Start dev server (http://localhost:3000)
pnpm storybook            # Start Storybook (http://localhost:6006)
pnpm type-check           # TypeScript should pass
```

### 3. Design System Check
```bash
# Verify design system works
cat src/lib/design-system/index.ts
```

You should see: `colors`, `spacing`, `fontSize`, `borderRadius`, etc.

---

## 📋 Choose Your Task

### Wave 2: Core Components (Pick Any)
- **FE-01**: ChevronTaskFlow (8 hours) - Full-screen task execution modal
- **FE-02**: MiniChevronNav (4 hours) - Sticky section navigation
- **FE-03**: Mapper Restructure (7 hours) - **DO_WITH_ME** - 2-tab Mapper
- **FE-04**: TaskTemplateLibrary (4 hours) - Template picker grid
- **FE-05**: PetWidget (7 hours) - **DO_WITH_ME** - Virtual pet UI
- **FE-06**: CelebrationScreen (4 hours) - Post-completion rewards
- **FE-07**: FocusTimer (4 hours) - Pomodoro timer

### Wave 3: Enhanced UX (After Wave 2)
- **FE-08**: Energy Visualization (5 hours) - Interactive graphs
- **FE-09**: Swipeable Task Cards (6 hours) - Tinder-style cards
- **FE-10**: Biological Tabs (4 hours) - Bottom nav with 5 modes
- **FE-11**: Task Breakdown Modal (4 hours) - AI split review
- **FE-12**: Achievement Gallery (5 hours) - Badge collection
- **FE-13**: Ritual System (6 hours) - Repeating task creator

### Wave 4: Creature System (After BE-02)
- **FE-14**: Creature Animations (7 hours) - Lottie/sprite animations
- **FE-15**: Creature Gallery (4 hours) - Pokédex-style collection

### Wave 5: Advanced Features
- **FE-16**: Temporal Visualization (6 hours) - GitHub-style heatmap
- **FE-17**: Onboarding Flow (6 hours) - 5-step wizard

### Wave 6: Polish & Quality
- **FE-18**: Accessibility Suite (7 hours) - WCAG AA compliance
- **FE-19**: E2E Test Suite (8 hours) - Playwright tests
- **FE-20**: Performance Optimization (7 hours) - Bundle size, Core Web Vitals

**Full task list**: `docs/tasks/README.md`

---

## 🎨 Storybook-First Workflow

### Example: FE-02 MiniChevronNav

**Step 1: Read the Spec**
```bash
cat docs/tasks/frontend/02_mini_chevron_nav.md
```

**Step 2: Create Component File**
```bash
# Create component
touch src/components/mobile/MiniChevronNav.tsx
touch src/components/mobile/MiniChevronNav.stories.tsx
```

**Step 3: Build in Storybook (Stories First!)**
```tsx
// src/components/mobile/MiniChevronNav.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MiniChevronNav } from './MiniChevronNav';

const meta: Meta<typeof MiniChevronNav> = {
  title: 'Mobile/MiniChevronNav',
  component: MiniChevronNav,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof MiniChevronNav>;

// Story 1: Default with 5 sections
export const Default: Story = {
  args: {
    sections: [
      { id: 'overview', label: 'Overview', isActive: true },
      { id: 'steps', label: 'Steps', isActive: false },
      { id: 'details', label: 'Details', isActive: false },
      { id: 'notes', label: 'Notes', isActive: false },
      { id: 'history', label: 'History', isActive: false },
    ],
    onSectionClick: (id) => console.log('Clicked:', id),
  },
};

// Story 2: With active state on third item
export const ThirdActive: Story = {
  args: {
    ...Default.args,
    sections: Default.args.sections?.map((s, i) => ({
      ...s,
      isActive: i === 2
    })),
  },
};

// Story 3: Compact mode (icons only)
export const Compact: Story = {
  args: {
    ...Default.args,
    compactMode: true,
  },
};
```

**Step 4: Implement Component**
```tsx
// src/components/mobile/MiniChevronNav.tsx
import React from 'react';
import { colors, spacing, fontSize } from '@/lib/design-system';

interface Section {
  id: string;
  label: string;
  isActive: boolean;
}

interface MiniChevronNavProps {
  sections: Section[];
  onSectionClick: (id: string) => void;
  compactMode?: boolean;
}

export const MiniChevronNav: React.FC<MiniChevronNavProps> = ({
  sections,
  onSectionClick,
  compactMode = false,
}) => {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        display: 'flex',
        gap: spacing[2],
        padding: spacing[3],
        backgroundColor: colors.base03,
        borderBottom: `1px solid ${colors.base01}`,
        zIndex: 10,
      }}
    >
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          style={{
            padding: compactMode ? spacing[2] : `${spacing[2]}px ${spacing[3]}px`,
            fontSize: fontSize.sm,
            fontWeight: section.isActive ? 600 : 400,
            color: section.isActive ? colors.blue : colors.base0,
            backgroundColor: section.isActive ? colors.base02 : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {compactMode ? section.label[0] : section.label}
        </button>
      ))}
    </nav>
  );
};
```

**Step 5: View in Storybook**
```bash
pnpm storybook
# Navigate to Mobile/MiniChevronNav
# See all 3 stories rendered
```

**Step 6: Refine & Polish**
- Add hover states
- Add keyboard navigation
- Add accessibility (ARIA labels)
- Test all stories

**Step 7: Integrate into App**
```tsx
// Use in your mode component
import { MiniChevronNav } from '@/components/mobile/MiniChevronNav';

function TaskDetailPage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div>
      <MiniChevronNav
        sections={sections}
        onSectionClick={setActiveSection}
      />
      {/* Rest of page */}
    </div>
  );
}
```

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── mobile/           # Mobile-first components
│   │   │   ├── YourComponent.tsx
│   │   │   ├── YourComponent.stories.tsx
│   │   │   └── tests/
│   │   │       └── YourComponent.test.tsx
│   │   └── shared/           # Shared components
│   ├── lib/
│   │   └── design-system/    # Design tokens
│   │       └── index.ts      # Import from here!
│   ├── app/                  # Next.js 14 app directory
│   └── styles/
├── .storybook/               # Storybook config
└── package.json
```

---

## 🎨 Design System Usage

**Always use design tokens** (never hardcode colors/spacing):

```tsx
import { colors, spacing, fontSize, borderRadius } from '@/lib/design-system';

// ✅ GOOD
<div style={{
  padding: spacing[4],           // 16px
  color: colors.blue,            // Solarized blue
  fontSize: fontSize.md,         // 16px
  borderRadius: borderRadius.md, // 8px
}} />

// ❌ BAD - Hardcoded values
<div style={{
  padding: '16px',
  color: '#268bd2',
  fontSize: '16px',
  borderRadius: '8px',
}} />
```

**Available Tokens**:
```typescript
// Colors (Solarized theme)
colors.base03   // Background (darkest)
colors.base02   // Background highlights
colors.base01   // Optional emphasized content
colors.base00   // Body text
colors.base0    // Secondary text
colors.blue     // Primary accent
colors.cyan     // Links
colors.green    // Success
colors.yellow   // Warning
colors.orange   // Urgent
colors.red      // Error
colors.magenta  // Highlight
colors.violet   // Alternative accent

// Energy-specific colors
colors.energy.low      // Soft blue
colors.energy.medium   // Warm yellow
colors.energy.high     // Vibrant green

// Spacing (4px grid)
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px

// Typography
fontSize.xs   // 12px
fontSize.sm   // 14px
fontSize.md   // 16px
fontSize.lg   // 18px
fontSize.xl   // 20px
```

---

## 📖 Storybook Best Practices

### 1. Minimum 3 Stories Per Component
```typescript
export const Default: Story = { ... };        // Default state
export const WithData: Story = { ... };       // Populated state
export const Loading: Story = { ... };        // Loading state
export const Error: Story = { ... };          // Error state (if applicable)
export const Interactive: Story = { ... };    // Interactive demo
```

### 2. Use Controls for Interactive Props
```typescript
const meta: Meta<typeof YourComponent> = {
  component: YourComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};
```

### 3. Document Props with JSDoc
```typescript
interface YourComponentProps {
  /** The variant style to apply */
  variant: 'primary' | 'secondary';
  /** Size of the component */
  size?: 'sm' | 'md' | 'lg';
  /** Callback when clicked */
  onClick?: () => void;
}
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test:watch

# Run specific test
pnpm test YourComponent.test.tsx

# Run with coverage
pnpm test:coverage
```

**Example Test**:
```tsx
import { render, screen } from '@testing-library/react';
import { MiniChevronNav } from './MiniChevronNav';

test('renders all sections', () => {
  const sections = [
    { id: '1', label: 'Overview', isActive: true },
    { id: '2', label: 'Steps', isActive: false },
  ];

  render(<MiniChevronNav sections={sections} onSectionClick={() => {}} />);

  expect(screen.getByText('Overview')).toBeInTheDocument();
  expect(screen.getByText('Steps')).toBeInTheDocument();
});
```

---

## ✅ Task Completion Checklist

Before marking your task complete:

- [ ] All stories render in Storybook (pnpm storybook)
- [ ] Component uses design system tokens (no hardcoded values)
- [ ] TypeScript strict mode passes (pnpm type-check)
- [ ] All props have TypeScript types
- [ ] Component is accessible (ARIA labels, keyboard nav)
- [ ] Responsive design works (mobile & desktop)
- [ ] Unit tests written and passing
- [ ] Acceptance criteria met (see task spec)
- [ ] Build passes (pnpm build)

---

## 🔗 Key Files to Reference

### Task Specifications
- **Your task**: `docs/tasks/frontend/XX_your_task.md`
- **All frontend tasks**: `docs/tasks/frontend/`

### Existing Components (Learn from these!)
- **ChevronStep**: `src/components/mobile/ChevronStep.tsx`
  - Story: `src/components/mobile/ChevronStep.stories.tsx`
  - SVG chevron shapes, active/complete/pending states
- **AsyncJobTimeline**: `src/components/shared/AsyncJobTimeline.tsx`
  - Nested timeline with chevrons
  - Great example of composition

### Design System
- **Tokens**: `src/lib/design-system/index.ts`
- **Usage examples**: Any existing component

### Documentation
- **Full agent entry point**: `docs/AGENT_DEVELOPMENT_ENTRY_POINT.md`
- **Wave execution plan**: `docs/WAVE_EXECUTION_PLAN.md`

---

## 🚨 Common Issues

### Storybook Won't Start
```bash
# Clear cache
rm -rf node_modules/.cache
pnpm storybook
```

### TypeScript Errors
```bash
# Check types
pnpm type-check

# Common fix: restart TS server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Design System Not Found
```typescript
// Make sure you're importing from the right path
import { colors, spacing } from '@/lib/design-system';

// NOT from individual files
```

### Build Fails
```bash
# Check for type errors
pnpm type-check

# Check for linting errors
pnpm lint

# Try clean build
rm -rf .next
pnpm build
```

---

## 💡 Tips for Success

1. **Storybook first, always** - Build in isolation before integrating
2. **Use design tokens** - Never hardcode colors or spacing
3. **Mobile-first** - Most components are mobile-first, then adapt up
4. **Start simple** - One story, basic implementation, then iterate
5. **Check existing components** - ChevronStep and AsyncJobTimeline are great examples
6. **Test in Storybook** - All states should be visible in stories
7. **TypeScript strict** - Don't use `any`, define proper types
8. **Accessibility matters** - Add ARIA labels, keyboard navigation

---

## 🎯 Your First Task: FE-01 or FE-02

### FE-01: ChevronTaskFlow (Complex, 8 hours)
**Good if you want a challenge**:
- Full-screen modal
- Step progression UI
- XP celebration animations
- 5 Storybook stories

### FE-02: MiniChevronNav (Simple, 4 hours)
**Good if you want to start easier**:
- Sticky navigation bar
- Section switching
- Compact mode
- 3 Storybook stories

```bash
# Start with FE-02 example
cat docs/tasks/frontend/02_mini_chevron_nav.md
touch src/components/mobile/MiniChevronNav.tsx
touch src/components/mobile/MiniChevronNav.stories.tsx
pnpm storybook
```

---

## 🌊 Wave-Based Development

You're part of a **wave-based parallel development** system:

- **Wave 2** (Weeks 2-3): FE-01 to FE-07 (pick any!)
- **Wave 3** (Weeks 4-5): FE-08 to FE-13 (enhanced UX)
- **Wave 4** (Weeks 6-7): FE-14 to FE-15 (creature system)
- **Wave 5** (Weeks 8-9): FE-16 to FE-17 (advanced)
- **Wave 6** (Weeks 10-11): FE-18 to FE-20 (polish)

**Check dependencies** in the task spec before starting!

**Some tasks need backend APIs**:
- FE-04 needs BE-01 (Templates)
- FE-05 needs BE-02 (Pets)
- FE-07 needs BE-03 (Focus)

---

## 🎨 Framer Motion (Animations)

Many components use Framer Motion for animations:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

See ChevronStep for real examples!

---

**Ready?** Pick a task from `docs/tasks/frontend/`, read the spec, and build it in Storybook! 🎨

Questions? Check `docs/AGENT_DEVELOPMENT_ENTRY_POINT.md` for detailed guidance.
