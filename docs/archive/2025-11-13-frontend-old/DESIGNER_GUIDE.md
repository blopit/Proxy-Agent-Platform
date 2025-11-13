# Designer Guide: Visual Design System

**🎨 FOR DESIGNERS, VISUAL ARTISTS, AND UX PROFESSIONALS**

Complete guide to the visual design system, color themes, and component library.

---

## 🎯 Overview

The Proxy Agent Platform uses a **token-based design system** with:
- 20+ pre-built color themes
- Consistent spacing (4px grid)
- Typography scale
- Component library with 50+ components
- Storybook for visual exploration

---

## 🚀 Quick Start for Designers

### 1. Explore the Design System

**Open Storybook** (live component viewer):
```bash
cd frontend
npm run storybook
# Opens at http://localhost:6006
```

**What you can do:**
- Browse all 50+ components
- Switch between 20+ color themes
- See components in different states (hover, active, disabled)
- Test responsive layouts (mobile, tablet, desktop)
- Check accessibility (color contrast, keyboard nav)

### 2. Switch Themes

In Storybook toolbar:
- Click the **theme dropdown** (paintbrush icon)
- Choose from 20+ themes
- See components update in real-time

### 3. Explore Components

Storybook sidebar shows all components organized by category:
- **Mobile/** - Mobile-first components
- **Shared/** - Reusable components
- **Dashboard/** - Dashboard components
- **Tasks/** - Task management
- **System/** - Design primitives

---

## 🎨 Design System Tokens

### Philosophy

**Never hardcode values.** Everything uses **design tokens** - predefined values for:
- Spacing
- Colors
- Typography
- Border radius
- Shadows
- Animations

This ensures consistency and makes theme switching instant.

---

## 📏 Spacing System

**4px Grid System** - All spacing is multiples of 4px

```
1  = 4px    → Micro spacing
2  = 8px    → Small gaps
3  = 12px   → Medium gaps
4  = 16px   → Standard padding (most common)
6  = 24px   → Large gaps
8  = 32px   → Section spacing
12 = 48px   → Major sections
16 = 64px   → Hero spacing
```

**Usage:**
- Card padding: 16px (spacing[4])
- Button padding: 8px horizontal, 4px vertical
- Gap between elements: 8px or 16px
- Section spacing: 32px or 48px

---

## 🎨 Color System

### Color Philosophy

Uses **semantic colors** that adapt to themes:

```
Backgrounds:
- primary   → Main background
- secondary → Elevated surfaces
- tertiary  → Subtle surfaces
- hover     → Hover states

Text:
- primary   → Main text
- secondary → Secondary text
- muted     → De-emphasized text
- inverse   → Text on dark backgrounds

Borders:
- default   → Standard borders
- emphasis  → Highlighted borders

Accents:
- primary   → Primary actions (blue in Solarized)
- secondary → Secondary actions
- soft      → Subtle accents

Status:
- success   → Green (completed, success)
- warning   → Yellow (caution, pending)
- error     → Red (errors, failures)
- info      → Cyan (information)
```

### Available Themes (20+)

#### Classic Developer Themes

**Solarized Light** ☀️
- Background: Warm cream (#fdf6e3)
- Text: Muted brown-gray (#657b83)
- Accent: Blue (#268bd2)
- Use: Low-contrast, easy on eyes

**Solarized Dark** 🌙
- Background: Deep blue-gray (#002b36)
- Text: Light gray (#839496)
- Accent: Blue (#268bd2)
- Use: Default dark theme

**Dracula** 🧛
- Background: Dark purple-gray (#282a36)
- Text: Soft white (#f8f8f2)
- Accent: Purple (#bd93f9)
- Use: Vibrant dark theme with personality

**Nord Light** ☀️
- Background: Icy white (#eceff4)
- Text: Arctic gray (#2e3440)
- Accent: Frost blue (#5e81ac)
- Use: Clean, minimal Scandinavian aesthetic

**Nord Dark** 🌙
- Background: Polar night (#2e3440)
- Text: Snow storm white (#d8dee9)
- Accent: Frost blue (#88c0d0)
- Use: Arctic-inspired dark theme

**Gruvbox Light** ☀️
- Background: Warm cream (#fbf1c7)
- Text: Dark brown (#282828)
- Accent: Aqua (#689d6a)
- Use: Retro, warm, high-contrast

**Gruvbox Dark** 🌙
- Background: Warm dark brown (#282828)
- Text: Light cream (#ebdbb2)
- Accent: Aqua (#689d6a)
- Use: Cozy retro dark theme

**Tokyo Night** 🌃
- Background: Deep blue (#1a1b26)
- Text: Light blue-gray (#a9b1d6)
- Accent: Bright blue (#7aa2f7)
- Use: Modern, clean, Japanese-inspired

**Monokai** 🎨
- Background: Dark gray-green (#272822)
- Text: Off-white (#f8f8f2)
- Accent: Cyan (#66d9ef)
- Use: Classic Sublime Text theme

**One Dark** 🌙
- Background: Charcoal (#282c34)
- Text: Light gray (#abb2bf)
- Accent: Blue (#61afef)
- Use: Atom editor's iconic theme

**Catppuccin Latte** ☕
- Background: Light latte (#eff1f5)
- Text: Dark mocha (#4c4f69)
- Accent: Blue (#1e66f5)
- Use: Soothing pastel light theme

**Catppuccin Mocha** ☕
- Background: Dark mocha (#1e1e2e)
- Text: Light latte (#cdd6f4)
- Accent: Blue (#89b4fa)
- Use: Soothing pastel dark theme

**Material Light** ☀️
- Background: Paper white (#fafafa)
- Text: Nearly black (#212121)
- Accent: Blue (#42a5f5)
- Use: Google Material Design

**Material Dark** 🌙
- Background: Dark gray (#212121)
- Text: Near white (#eeffff)
- Accent: Blue (#82aaff)
- Use: Material Design dark variant

#### Creative Themes

**Jungle** 🌿
- Background: Deep forest green (#1a3319)
- Text: Mint green (#a8d8b9)
- Accent: Leaf green (#72b562)
- Colors: Earthy greens, browns, natural tones
- Use: Nature-inspired, calming

**Oceanic** 🌊
- Background: Deep ocean (#0d1117)
- Text: Pearl white (#eeffff)
- Accent: Wave blue (#89ddff)
- Colors: Blues, teals, coral accents
- Use: Aquatic, serene atmosphere

**Sunset** 🌅
- Background: Twilight purple (#1a1625)
- Text: Golden yellow (#ffb74d)
- Accent: Sun orange (#ff6e40)
- Colors: Warm oranges, purples, golds
- Use: Warm, dreamy vibe

**Aurora** 🌌
- Background: Night sky (#0f1419)
- Text: Emerald green (#a6e3a1)
- Accent: Aurora blue (#59c2ff)
- Colors: Northern lights (greens, blues, purples)
- Use: Ethereal, magical feel

**Synthwave '84** 🕶️
- Background: Deep purple (#241b2f)
- Text: White (#ffffff)
- Accent: Neon cyan (#72f1b8)
- Colors: Neon pink, cyan, purple, yellow
- Use: Retro 80s, high energy

**Nightfox** 🦊
- Background: Midnight blue (#192330)
- Text: Soft white (#cdcecf)
- Accent: Blue (#719cd6)
- Colors: Soft blues, purples, oranges
- Use: Gentle dark theme with warmth

**Cyberpunk** 🤖
- Background: Deep navy (#000b1e)
- Text: Neon cyan (#00ffff)
- Accent: Electric blue (#01cdfe)
- Colors: Bright neons (cyan, magenta, yellow)
- Use: Futuristic, high-tech dystopia

---

## 📝 Typography

### Font Scale

```
xs     = 12px  → Captions, meta text
sm     = 14px  → Small text, labels
base   = 16px  → Body text (default)
lg     = 18px  → Subheadings
xl     = 20px  → Headings
2xl    = 24px  → Large headings
3xl    = 30px  → Hero headings
4xl    = 36px  → Display headings
```

### Font Weights

```
normal   = 400  → Body text
medium   = 500  → Emphasized text
semibold = 600  → Subheadings
bold     = 700  → Headings
```

### Font Families

```
Sans: Inter, system-ui, sans-serif
Mono: Fira Code, Monaco, Consolas, monospace
```

---

## 🔲 Border Radius

```
sm    = 4px     → Subtle rounding
base  = 8px     → Standard (inputs)
md    = 12px    → Medium rounding
lg    = 16px    → Cards, modals
xl    = 24px    → Large elements
pill  = 9999px  → Fully rounded (buttons, badges)
circle = 50%    → Perfect circles
```

---

## 🌑 Shadows

```
sm → Subtle elevation
md → Standard cards
lg → Modals, elevated cards
xl → Popovers, dropdowns
```

---

## ⚡ Animations

### Durations

```
instant = 100ms  → Micro-interactions
fast    = 200ms  → Quick transitions
normal  = 300ms  → Standard (default)
slow    = 500ms  → Deliberate movements
```

### Easing

```
easeIn    → Accelerating
easeOut   → Decelerating
easeInOut → Smooth (default)
spring    → Bouncy, natural
```

---

## 🧩 Component Library

### Mobile Components (50+)

**Biological Tabs**
- 5-mode navigation system
- Icons: Add, Scout, Hunt, Recharge, Map
- Chevron interlocking design
- Adaptive to energy/time of day

**Chevron Button**
- Interlocking chevron shape
- 5 variants (primary, success, error, warning, neutral)
- 4 positions (first, middle, last, single)
- Gradient backgrounds

**Capture Modal**
- Quick task capture interface
- Voice input support
- Minimal friction design

**Task Cards**
- Multiple sizes (hero, standard, compact, mini)
- Status indicators
- Energy/time estimates
- Priority badges

**Progress Indicators**
- Async job timeline
- Energy gauge
- Progress bars with checkpoints

### Shared Components

**AsyncJobTimeline**
- SVG chevron steps
- Status indicators (pending, active, complete, error)
- Accessibility-friendly

**Task Checkbox**
- Animated SVG checkmark
- Smooth transitions

**Progress Bar**
- Checkpoint markers
- Percentage display

**OpenMoji**
- Emoji graphics integration
- Consistent visual language

### Dashboard Components

**Stats Card**
- Metric display
- Trend indicators
- Icon support

**Productivity Chart**
- Data visualization
- Responsive design

**Activity Feed**
- Timeline view
- Status updates

### System Components

**SystemButton**
- Design system primitive
- All variants
- Consistent styling

**SystemCard**
- Base card component
- Multiple variants

**SystemInput**
- Form input primitive
- Validation states

---

## 🎨 Design Patterns

### Cards

**Standard Card Pattern:**
- Padding: 16px (spacing[4])
- Background: secondary
- Border radius: 16px (borderRadius.lg)
- Shadow: medium (shadow.md)

**Elevated Card:**
- Same as standard but shadow.lg

**Outlined Card:**
- Background: primary
- Border: 1px solid border.default
- No shadow

### Buttons

**Primary Button:**
- Background: accent.primary (blue)
- Text: inverse (white)
- Padding: 8px horizontal, 4px vertical
- Border radius: pill (fully rounded)

**Secondary Button:**
- Background: bg.secondary
- Text: text.primary
- Border: 1px solid border.default

**Tertiary Button:**
- Background: transparent
- Text: text.secondary
- No border

### Modals

**Modal Pattern:**
- Overlay: rgba(0,0,0,0.5)
- Content background: bg.primary
- Padding: 24px (spacing[6])
- Border radius: 16px (borderRadius.lg)
- Shadow: xl (shadow.xl)
- Max width: 500px

---

## 📱 Responsive Design

### Breakpoints

```
Mobile:  320px - 767px
Tablet:  768px - 1023px
Desktop: 1024px - 1439px
Wide:    1440px+
```

### Viewport Testing in Storybook

Use toolbar viewport selector:
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1440x900)
- Wide (1920x1080)

---

## ♿ Accessibility

### Color Contrast

All color combinations meet **WCAG AA standards**:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

**Testing:** Storybook includes a11y addon - check the Accessibility panel.

### Keyboard Navigation

All interactive elements support keyboard:
- `Tab` - Navigate forward
- `Shift+Tab` - Navigate backward
- `Enter`/`Space` - Activate
- `Escape` - Close modals/dropdowns
- `Arrow keys` - Navigate lists/menus

### Focus Indicators

All interactive elements show clear focus indicators:
- Outline or glow effect
- High contrast
- Visible in all themes

---

## 🛠️ Designer Workflow

### 1. Explore Components

1. Open Storybook (`npm run storybook`)
2. Browse component categories
3. Switch themes to see variations
4. Note states (hover, active, disabled)

### 2. Create Design Mockups

**When designing:**
- Use spacing multiples of 4px
- Reference color tokens (not hex codes)
- Use typography scale
- Test with multiple themes

**Figma/Sketch Design Tokens:**
```
Spacing: 4, 8, 12, 16, 24, 32, 48, 64px
Font sizes: 12, 14, 16, 18, 20, 24, 30, 36px
Border radius: 4, 8, 12, 16, 24px, pill
```

### 3. Communicate with Developers

**When requesting changes:**
- Reference component name ("ChevronButton")
- Reference variant ("primary variant")
- Reference theme ("in Solarized Dark theme")
- Use design token names ("spacing[4]", "semanticColors.accent.primary")

**Example:**
> "The ChevronButton primary variant needs more padding in Solarized Dark.
> Change padding from spacing[2] to spacing[3]."

### 4. Verify Implementation

1. Open Storybook
2. Find your component
3. Switch to relevant theme
4. Check all states
5. Test on mobile viewport

---

## 🎨 Creating New Themes

New themes can be added to `.storybook/themes.ts`:

```typescript
export const myTheme = {
  name: 'My Theme',
  backgroundColor: '#...',      // Main background
  textColor: '#...',            // Main text
  borderColor: '#...',          // Borders
  emphasisColor: '#...',        // Emphasized text
  secondaryBackgroundColor: '#...',  // Elevated surfaces
  accentColor: '#...',          // Primary accent

  // Status colors
  blue: '#...',
  green: '#...',
  red: '#...',
  yellow: '#...',
  orange: '#...',
  cyan: '#...',
  magenta: '#...',
}

// Add to themes export
export const themes = {
  // ... existing themes
  myTheme,
}
```

**Requirements:**
- All colors defined
- Good contrast ratios (WCAG AA)
- Test with all components

---

## 📚 Resources

### Storybook
- **URL:** http://localhost:6006 (after running `npm run storybook`)
- Browse all components
- Switch themes
- Check accessibility

### Design System Code
- **Tokens:** `frontend/src/lib/design-system.ts`
- **Themes:** `frontend/.storybook/themes.ts`
- **Components:** `frontend/src/components/`

### Documentation
- [FRONTEND_ENTRY_POINT.md](./FRONTEND_ENTRY_POINT.md) - Master hub
- [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) - Component patterns
- [STORYBOOK_GUIDE.md](./STORYBOOK_GUIDE.md) - Storybook guide

---

## 🎯 Designer Checklist

When creating designs:

- [ ] Used 4px spacing grid
- [ ] Used typography scale
- [ ] Referenced semantic colors (not hardcoded)
- [ ] Tested with multiple themes
- [ ] Checked color contrast (WCAG AA)
- [ ] Designed mobile-first
- [ ] Included all states (hover, active, disabled, focus)
- [ ] Considered keyboard navigation
- [ ] Used existing components when possible

When reviewing implementation:

- [ ] Opened Storybook
- [ ] Found component story
- [ ] Switched through themes
- [ ] Tested responsive breakpoints
- [ ] Checked accessibility panel
- [ ] Verified all states work
- [ ] Confirmed spacing matches design

---

## 🆘 Common Questions

**Q: How do I see a component in a specific theme?**
A: Open Storybook → Navigate to component → Use theme dropdown in toolbar

**Q: How do I know what color to use?**
A: Use semantic color names (semanticColors.accent.primary) not hex codes. This ensures it works across all themes.

**Q: Can I add a new color?**
A: New colors should be added to the design system tokens, not hardcoded. Talk to developers about adding semantic color tokens.

**Q: Why do some components look different in different themes?**
A: That's by design! Components adapt to themes using semantic colors. They should work well in ALL themes.

**Q: How do I request a new component?**
A: Check if it exists first in Storybook. If not, create a design and reference existing component patterns.

---

**Welcome to the design system! Explore Storybook and create beautiful, accessible, themeable components! 🎨**

**Last Updated:** October 28, 2025
**For:** Designers, Visual Artists, UX Professionals
