# Design Principles

## Core Philosophy

Our design system is built to support **ADHD-friendly productivity** through biological alignment, visual clarity, and consistent interaction patterns. Every design decision should support users in managing executive function challenges while maintaining a sense of agency and accomplishment.

### Design Pillars

1. **Biological Alignment** - Design follows natural human rhythms and energy states
2. **Cognitive Clarity** - Reduce decision fatigue through clear visual hierarchies
3. **Immediate Feedback** - Provide instant validation for all user actions
4. **Consistent Affordances** - Predictable interactions reduce cognitive load
5. **Accessible by Default** - WCAG AA compliance minimum for all components

---

## 1. Biological Workflow Modes

Our interface is organized around five biological states that align with ADHD work patterns:

### Capture Mode
**Purpose**: Quickly externalize thoughts without friction
- **Design**: Minimal interface, large touch targets, instant feedback
- **Color**: Primary accent (cyan #2aa198)
- **Interaction**: Single-tap to capture, auto-save, no validation friction

### Scout Mode
**Purpose**: Survey and triage work without commitment
- **Design**: Card-based overview, scannable layouts, visual categorization
- **Color**: Blue (#268bd2) - exploration and discovery
- **Interaction**: Swipe gestures, quick filters, preview-first

### Hunt Mode
**Purpose**: Deep focus on a single task with minimal distraction
- **Design**: Full-screen focus, progressive disclosure, countdown timers
- **Color**: Green (#859900) - execution and progress
- **Interaction**: Large completion buttons, distraction blocking, flow state protection

### Map Mode
**Purpose**: High-level strategic planning and task relationships
- **Design**: Hierarchical tree view, connection lines, spatial organization
- **Color**: Purple (#6c71c4) - strategy and planning
- **Interaction**: Drag-and-drop, zoom, relationship creation

### Mend Mode
**Purpose**: Recovery, reflection, and energy management
- **Design**: Calming aesthetics, progress visualization, achievement celebrations
- **Color**: Orange (#cb4b16) - warmth and restoration
- **Interaction**: Read-only views, celebration animations, gentle prompts

---

## 2. Visual Design System

### Typography

#### Hierarchy
```
4xl (36px) - Page titles, hero text
3xl (32px) - Section headers
2xl (28px) - Card titles
xl (24px) - Subsection headers
lg (20px) - Emphasized body text
base (16px) - Default body text
sm (14px) - Secondary information
xs (12px) - Captions, metadata
```

#### Font Weights
- **300 (Light)** - Minimal, calm interfaces (Mend Mode)
- **400 (Regular)** - Body text, general UI
- **500 (Medium)** - Button labels, emphasized text
- **600 (Semibold)** - Card headers, section titles
- **700 (Bold)** - Page headers, critical actions

#### Line Height
- **Tight (1.2)** - Headers, compact cards
- **Normal (1.5)** - Body text, descriptions
- **Relaxed (1.75)** - Long-form content, accessibility

### Spacing

**4px Grid System** - All spacing is a multiple of 4px for visual rhythm

```
0   - 0px    - No spacing
1   - 4px    - Micro gaps (icon padding, badge spacing)
2   - 8px    - Small gaps (button padding, input padding)
3   - 12px   - Medium gaps (between related elements)
4   - 16px   - Default gap (component internal spacing)
5   - 20px   - Large gaps (component margins)
6   - 24px   - Section spacing (card padding)
8   - 32px   - Major sections (page padding)
12  - 48px   - Large sections (section breaks)
16  - 64px   - Extra large spacing (page sections)
```

#### Spacing Usage Guidelines
- **Padding**: Use for internal component spacing (0-6 range)
- **Margin**: Use for component separation (3-8 range)
- **Gaps**: Use for grid/flex layouts (2-6 range)
- **Page padding**: Use for viewport edges (8-16 range)

### Colors

#### Semantic Color System
Our color system is theme-agnostic using semantic naming:

```typescript
semanticColors = {
  bg: {
    primary: "Main background",
    secondary: "Card backgrounds",
    tertiary: "Nested backgrounds"
  },
  text: {
    primary: "Main text",
    secondary: "De-emphasized text",
    disabled: "Inactive text",
    inverse: "Text on dark backgrounds"
  },
  border: {
    default: "Standard borders",
    focus: "Active input borders",
    accent: "Highlighted borders"
  },
  accent: {
    primary: "Main brand actions",
    secondary: "Secondary actions",
    success: "Completion, positive actions",
    warning: "Caution, reversible errors",
    error: "Destructive, irreversible actions"
  }
}
```

#### Status Colors
- **Success (Green)** - Task completion, positive feedback, progress
- **Warning (Yellow)** - Caution, energy depletion, time running low
- **Error (Red)** - Destructive actions, validation errors, blocks
- **Info (Blue)** - Neutral information, help text, discovery
- **Accent (Cyan)** - Primary actions, focus states, brand

#### Glass Morphism
Semi-transparent backgrounds with backdrop blur for depth:
```css
background: rgba(base02, 0.8)
backdrop-filter: blur(12px)
border: 1px solid rgba(border, 0.2)
```

### Border Radius

```
sm (4px)   - Compact buttons, badges, pills
base (8px) - Standard cards, inputs, buttons
lg (12px)  - Large cards, modals
xl (16px)  - Hero cards, featured content
pill (9999px) - Fully rounded (avatars, status dots)
```

**Consistency Rule**: Use `base` (8px) as default; only deviate for specific affordances.

### Shadows

```
sm  - Subtle elevation (badges, dropdowns)
base - Card elevation (default state)
md  - Raised cards (hover state)
lg  - Modals, popovers (overlays)
xl  - Maximum elevation (critical alerts)
```

**Elevation Guidelines**:
- Base layer (0) - Page background
- Cards (1-2) - Content containers
- Sticky elements (3-4) - Navigation, headers
- Overlays (5-6) - Modals, tooltips
- Critical (7-8) - Alerts, confirmations

---

## 3. Component Design Patterns

### System Components (Design Primitives)

#### SystemButton
**Purpose**: All clickable actions
**Variants**:
- `primary` - Main actions (start task, save, submit)
- `secondary` - Alternative actions (cancel, skip)
- `success` - Completion actions (mark done, finish)
- `warning` - Caution actions (pause, skip)
- `error` - Destructive actions (delete, remove)
- `ghost` - Tertiary actions (view details, expand)

**Sizes**:
- `sm` (32px) - Compact lists, mobile toolbars
- `base` (40px) - Default size for most contexts
- `lg` (48px) - Primary CTAs, hero actions

**States**: default, hover, active, disabled, loading

#### SystemCard
**Purpose**: Content grouping and hierarchy
**Variants**:
- `default` - Standard glass morphism card
- `elevated` - Raised with shadow
- `outlined` - Bordered, no background
- `ghost` - Minimal, no visual container

**Padding**:
- `none` - For custom internal layouts
- `sm` (16px) - Compact cards
- `base` (24px) - Default card padding
- `lg` (32px) - Spacious featured cards

#### SystemBadge
**Purpose**: Status indicators, labels, counts
**Variants**: primary, secondary, success, warning, error, info
**Use cases**: Task priority, status dots, notification counts, feature flags

#### SystemInput
**Purpose**: All text input and form fields
**Features**: Label, placeholder, helper text, error states, icon support
**Types**: text, email, password, number, date, tel, textarea

#### SystemModal
**Purpose**: Dialogs, confirmations, complex forms
**Sizes**: sm (400px), base (600px), lg (800px), xl (1000px), full (95vw)
**Behavior**: Backdrop click to close, ESC key support, focus trapping

#### SystemToast
**Purpose**: Temporary notifications and feedback
**Variants**: success, error, warning, info
**Duration**: 2s (quick), 5s (default), 10s (important), persistent (manual dismiss)

### Shared Components (Domain Components)

#### ProgressBar
**Purpose**: Visual progress tracking
**Variants**:
- `gradient` - Single progress bar (0-100%)
- `segmented` - Multi-category breakdown

**Use cases**: Task completion, file upload, skill progress, workload distribution

#### OpenMoji
**Purpose**: Consistent emoji rendering
**Variants**: `black` (line art), `color` (full color)
**Effects**: `engraved`, `embossed` for 3D depth
**Sizes**: 16px - 64px

#### AsyncJobTimeline
**Purpose**: Multi-step process visualization with SVG chevrons
**Features**: Active state, completed state, error state, loading animation
**Accessibility**: ARIA labels, keyboard navigation

---

## 4. Interaction Patterns

### Animation Philosophy

**Goals**:
1. **Provide feedback** - Confirm user actions immediately
2. **Guide attention** - Direct focus to important changes
3. **Create continuity** - Smooth transitions between states
4. **Respect motion preferences** - Honor `prefers-reduced-motion`

#### Animation Timing (Physics Constants)

```typescript
duration = {
  instant: 0,      // No animation
  fast: 150,       // Quick feedback (button press, toggle)
  base: 300,       // Standard transitions (card expand, modal open)
  slow: 500,       // Deliberate animations (page transitions)
  slowest: 1000    // Celebratory animations (achievement unlocked)
}

easing = {
  linear: [0, 0, 1, 1],           // Constant speed
  ease: [0.25, 0.1, 0.25, 1],     // Natural deceleration
  easeIn: [0.4, 0, 1, 1],         // Slow start
  easeOut: [0, 0, 0.2, 1],        // Slow end
  easeInOut: [0.4, 0, 0.2, 1],    // Slow start and end
  spring: { type: "spring", stiffness: 300, damping: 30 }  // Bouncy
}
```

#### Animation Usage Guidelines

**Button Press**:
```typescript
whileTap={{ scale: 0.95 }}
transition={{ duration: 0.15 }}
```

**Card Hover**:
```typescript
whileHover={{ scale: 1.02, y: -2 }}
transition={{ duration: 0.3 }}
```

**Modal Enter/Exit**:
```typescript
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
transition={{ duration: 0.3 }}
```

**Task Completion (Celebration)**:
```typescript
animate={{
  scale: [1, 1.2, 1],
  rotate: [0, 10, -10, 0]
}}
transition={{ duration: 1, ease: "easeInOut" }}
```

**Reduced Motion**:
```typescript
const shouldReduceMotion = useReducedMotion()
transition={{ duration: shouldReduceMotion ? 0 : 300 }}
```

### Micro-interactions

#### Hover States
- **Cards**: Slight lift (2px) + scale (1.02) + shadow increase
- **Buttons**: Background color shift (10% lighter/darker) + scale (0.98)
- **Links**: Underline + color shift

#### Focus States
- **Keyboard focus**: 2px outline in accent color, 4px offset
- **Focus visible**: Only show outline for keyboard navigation (`:focus-visible`)

#### Loading States
- **Buttons**: Spinner icon + disabled state + "Loading..." text
- **Cards**: Skeleton loading with shimmer animation
- **Pages**: Progress bar at top edge (linear indeterminate)

#### Error States
- **Inputs**: Red border + error icon + helper text in red
- **Forms**: Scroll to first error + focus on field + shake animation
- **Toast**: Error toast with auto-dismiss in 5 seconds

### Gesture Support (Mobile)

- **Swipe Right**: Quick actions (complete task, archive)
- **Swipe Left**: Destructive actions (delete, remove)
- **Long Press**: Context menu, additional options
- **Pull to Refresh**: Reload data (top of scrollable lists)
- **Pinch to Zoom**: Map Mode for hierarchical views

---

## 5. Accessibility Standards

### WCAG AA Compliance (Minimum)

#### Color Contrast
- **Normal text (16px)**: 4.5:1 minimum
- **Large text (24px)**: 3:1 minimum
- **UI components**: 3:1 minimum (borders, icons, focus indicators)

#### Keyboard Navigation
- **All interactive elements** must be keyboard accessible
- **Focus indicators** must be clearly visible (2px outline, 4px offset)
- **Tab order** must follow logical reading order
- **Skip links** for bypassing navigation

#### Screen Readers
- **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, `<article>`, etc.
- **ARIA labels**: Provide context for icon-only buttons
- **Live regions**: Announce dynamic content changes (`aria-live`)
- **Alt text**: Describe all meaningful images

#### Motion & Animation
- **Respect `prefers-reduced-motion`**: Disable animations for users who request it
- **No flashing content**: Avoid content that flashes more than 3 times per second
- **Pauseable animations**: Allow users to pause auto-playing content

#### Touch Targets
- **Minimum size**: 44x44px (iOS) / 48x48px (Android)
- **Spacing**: 8px minimum between adjacent touch targets

---

## 6. Theme System

### 20+ Pre-configured Themes

**Classic Coding Themes**:
- Solarized (light/dark) - Precision colors for machines and people
- Dracula - Dark theme with vibrant colors
- Nord (light/dark) - Arctic, north-bluish color palette
- Gruvbox (light/dark) - Retro groove color scheme
- Tokyo Night - Modern, clean, Japanese-inspired theme
- Monokai - Classic Sublime Text theme
- One Dark - Atom's iconic dark theme
- Catppuccin (latte/mocha) - Soothing pastel theme
- Material (light/dark) - Google's Material Design colors

**Creative Themes**:
- Jungle - Lush forest greens and natural tones
- Oceanic - Deep sea blues and teals
- Sunset - Warm golden hour colors
- Aurora - Northern lights inspired
- Synthwave '84 - Retro neon 80s vibes
- Nightfox - Soft dark blue-purple theme
- Cyberpunk - Neon dystopian future

### Theme Structure
```typescript
interface Theme {
  name: string
  backgroundColor: string
  textColor: string
  borderColor: string
  emphasisColor: string
  secondaryBackgroundColor: string
  accentColor: string
  // Status colors
  blue: string
  green: string
  red: string
  yellow: string
  orange: string
  cyan: string
  magenta: string
}
```

### Theme Switching
- **Persist preference**: Save theme choice to localStorage
- **System preference**: Respect `prefers-color-scheme` by default
- **Smooth transition**: Animate theme changes (300ms ease-in-out)

---

## 7. Responsive Design

### Breakpoints

```typescript
breakpoints = {
  mobile: '0px',      // 0-767px
  tablet: '768px',    // 768-1023px
  desktop: '1024px',  // 1024-1439px
  wide: '1440px'      // 1440px+
}
```

### Mobile-First Approach
1. Design for mobile first (320px viewport)
2. Enhance for tablet (768px+)
3. Optimize for desktop (1024px+)
4. Utilize wide screens (1440px+)

### Component Adaptations

**Dashboard**:
- Mobile: 2-column stats grid, stacked chart + feed
- Tablet: 2-column stats grid, side-by-side chart + feed
- Desktop: 4-column stats grid, 2:1 ratio chart + feed

**Navigation**:
- Mobile: Bottom tab bar (5 main sections)
- Tablet: Side drawer + bottom bar
- Desktop: Persistent sidebar + top navigation

**Cards**:
- Mobile: Full width, minimal padding (16px)
- Tablet: 2-column grid, standard padding (24px)
- Desktop: 3-column grid, spacious padding (32px)

---

## 8. Performance Considerations

### Component Optimization

1. **Lazy loading**: Use `React.lazy()` for route-based code splitting
2. **Memoization**: Use `React.memo()` for expensive components
3. **Virtual scrolling**: Use for lists with 100+ items
4. **Debounced inputs**: Debounce search/filter inputs (300ms)
5. **Optimistic updates**: Update UI immediately, sync server later

### Image Optimization

- **Next.js Image**: Use `next/image` for automatic optimization
- **Lazy loading**: Images below fold should lazy load
- **Responsive images**: Serve appropriate sizes for viewport
- **WebP format**: Use WebP with fallbacks for older browsers

### Animation Performance

- **GPU acceleration**: Use `transform` and `opacity` for animations
- **Avoid layout thrashing**: Batch DOM reads and writes
- **RequestAnimationFrame**: Use for smooth 60fps animations
- **Intersection Observer**: Trigger animations only when in viewport

---

## 9. Documentation Standards

### Component Documentation (Storybook)

Every component must have:

1. **Meta description** - Purpose, features, use cases
2. **ArgTypes** - Interactive controls for all props
3. **Default story** - Typical usage example
4. **Variant stories** - All visual variants
5. **State stories** - All interactive states
6. **Real-world examples** - Common usage patterns
7. **Accessibility notes** - ARIA labels, keyboard support

### Code Comments

```typescript
// ✅ Good: Explains WHY, not WHAT
// Use portal to render modal outside parent z-index context
const modalRoot = document.getElementById('modal-root')

// ❌ Bad: Explains obvious code behavior
// Set the count to 0
setCount(0)
```

---

## 10. Design Decision Framework

When designing new components or features, ask:

### 1. Biological Alignment
- Which workflow mode does this support?
- Does this match the user's energy state?
- Is this cognitively demanding? (If yes, move to Mend Mode)

### 2. Cognitive Load
- Can this be completed in one glance/action?
- Are we asking the user to make decisions? (Minimize)
- Is the primary action obvious? (Make it prominent)

### 3. Immediate Feedback
- Does every user action have instant visual feedback?
- Are loading states clear and reassuring?
- Do errors provide actionable next steps?

### 4. Consistency
- Does this follow existing patterns?
- Can we reuse system components?
- If creating new patterns, are they documented?

### 5. Accessibility
- Can this be used with keyboard only?
- Is color contrast sufficient?
- Will screen readers understand this?
- Does this work with reduced motion?

---

## 11. Anti-Patterns (What to Avoid)

### Visual Design
- ❌ Mixing spacing scales (use 4px grid exclusively)
- ❌ Using hard-coded colors (use semantic tokens)
- ❌ Inconsistent border radius (stick to sm/base/lg)
- ❌ Non-standard font sizes (use typography scale)

### Interactions
- ❌ Animations without motion preference check
- ❌ Actions without loading states
- ❌ Errors without recovery instructions
- ❌ Destructive actions without confirmation

### Accessibility
- ❌ Icon-only buttons without ARIA labels
- ❌ Color as sole indicator of state
- ❌ Focus states that are barely visible
- ❌ Touch targets smaller than 44px

### Code Quality
- ❌ Inline styles (use design tokens)
- ❌ Magic numbers (define constants)
- ❌ Duplicate components (create shared component)
- ❌ Undocumented complex logic (add comments)

---

## 12. Future Considerations

### Planned Enhancements
1. **Advanced theming**: User-customizable accent colors
2. **Dynamic spacing**: Adjust spacing based on user preference
3. **Font size controls**: User-adjustable text size (accessibility)
4. **High contrast mode**: Enhanced visibility for low-vision users
5. **Dyslexia-friendly fonts**: OpenDyslexic font option

### Experimental Features
1. **Haptic feedback**: Tactile confirmation for mobile actions
2. **Sound design**: Optional audio cues for task completion
3. **Adaptive UI**: Interface that learns user preferences over time
4. **Focus music integration**: Background audio for Hunt Mode

---

## Quick Reference Card

### Common Patterns

```typescript
// Standard button
<SystemButton variant="primary" size="base">
  Save Changes
</SystemButton>

// Loading button
<SystemButton variant="primary" size="base" isLoading>
  Saving...
</SystemButton>

// Card with hover effect
<SystemCard variant="elevated" padding="base" hoverable>
  {content}
</SystemCard>

// Input with validation
<SystemInput
  label="Email"
  type="email"
  error={errors.email}
  helperText="We'll never share your email"
/>

// Success toast
<SystemToast
  variant="success"
  message="Task completed!"
  duration={3000}
/>

// Modal confirmation
<SystemModal
  isOpen={isOpen}
  onClose={handleClose}
  size="sm"
>
  <h2>Delete Task?</h2>
  <p>This action cannot be undone.</p>
  <SystemButton variant="error">Delete</SystemButton>
  <SystemButton variant="ghost">Cancel</SystemButton>
</SystemModal>
```

### Design Tokens Quick Access

```typescript
import { spacing, fontSize, colors, semanticColors } from '@/lib/design-system'

// Spacing: spacing[4] = '16px'
// Font size: fontSize.lg = '20px'
// Color: colors.blue = '#268bd2'
// Semantic: semanticColors.accent.primary (theme-aware)
```

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
**Maintained by**: Frontend Team
