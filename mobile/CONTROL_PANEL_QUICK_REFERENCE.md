# Storybook Control Panel - Quick Reference

**Visual Header at Top of Every Story**

```
┌─────────────────────────────────────────────────────────────┐
│ [🎨 Solarized Dark ▼] [📐 Grid] [📱 Mobile ▼] [📏 Medium ▼] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
            Your component story appears here
```

---

## 🎨 Button 1: Theme Picker

**Icon**: 🎨 Palette
**Current**: Shows current theme name (e.g., "Solarized Dark")
**Action**: Click to open theme selection modal

### Modal Content
- **6 theme cards** with color swatches
- **Current theme** highlighted with cyan checkmark
- **Preview swatches** show cyan, blue, violet colors
- **Tap any theme** to apply immediately
- **Persists** to AsyncStorage

### Available Themes
1. Solarized Dark (warm, low-contrast)
2. Solarized Light (high-readability)
3. Nord (arctic blue)
4. Dracula (vibrant high-contrast)
5. Catppuccin Mocha (soft pastels)
6. High Contrast (accessibility)

---

## 📐 Button 2: Grid Overlay Toggle

**Icon**: 📐 Grid
**Current**: Shows "Grid" label
**Action**: Click to toggle 8px grid overlay

### Grid Overlay
- **Color**: Pink semi-transparent lines
- **Spacing**: 8px intervals
- **Purpose**: Verify component spacing matches 4px base grid system
- **Visibility**: Overlays entire story canvas
- **Toggle**: Click again to hide

**Use Case**: Check if component padding, margins, and spacing align to 4px/8px grid.

---

## 📱 Button 3: Viewport Selector

**Icon**: 📱 Monitor
**Current**: Shows current viewport (e.g., "Mobile")
**Action**: Click to open viewport selection modal

### Viewport Options
1. **Mobile** (375px)
   - iPhone SE size
   - Test compact layouts

2. **Tablet** (768px)
   - iPad size
   - Test medium layouts

3. **Desktop** (1024px)
   - Standard laptop
   - Test wide layouts

4. **Wide** (1440px)
   - Large desktop
   - Test max-width layouts

**Note**: Story canvas width adjusts to selected viewport.

---

## 📏 Button 4: Component Size

**Icon**: 📏 Maximize
**Current**: Shows current scale (e.g., "Medium")
**Action**: Click to open size selection modal

### Size Options
1. **Small** (0.75x)
   - Compact view
   - Test dense layouts

2. **Medium** (1.0x)
   - Default size
   - Standard component view

3. **Large** (1.25x)
   - Comfortable view
   - Test larger text/spacing

4. **XLarge** (1.5x)
   - Accessibility testing
   - Test high zoom levels

**Use Case**: Verify components scale properly and remain readable at different sizes.

---

## 🚀 Quick Actions

### Switch Theme
1. Click first button (🎨)
2. Select new theme
3. All colors update instantly

### Enable Grid
1. Click second button (📐)
2. Pink 8px grid appears
3. Verify component spacing

### Test Responsive
1. Click third button (📱)
2. Select viewport size
3. Component resizes to width

### Test Scaling
1. Click fourth button (📏)
2. Select scale level
3. Component scales proportionally

---

## 🎯 Common Workflows

### Workflow 1: Theme Testing
1. Open story (e.g., TaskRow)
2. Click theme picker
3. Cycle through all 6 themes
4. Verify colors work in each theme

### Workflow 2: Grid Alignment Check
1. Open story (e.g., Card component)
2. Click grid toggle
3. Verify padding aligns to grid
4. Check margins are 4px/8px multiples

### Workflow 3: Responsive Testing
1. Open story (e.g., MapperView)
2. Start with Mobile viewport
3. Switch to Tablet, then Desktop
4. Verify layout adapts properly

### Workflow 4: Accessibility Check
1. Open story (e.g., BionicText)
2. Set size to XLarge (1.5x)
3. Verify text remains readable
4. Check spacing doesn't break

---

## 🔧 Technical Details

### Implementation
- **File**: `/mobile/.rnstorybook/StorybookControlPanel.tsx`
- **Context**: `/mobile/.rnstorybook/StorybookControlPanelContext.tsx`
- **Grid**: `/mobile/.rnstorybook/GridOverlay.tsx`
- **Decorator**: `/mobile/.rnstorybook/preview.tsx`

### State Management
```tsx
const {
  showGrid,        // boolean
  viewport,        // 'mobile' | 'tablet' | 'desktop' | 'wide'
  componentSize,   // 'small' | 'medium' | 'large' | 'xlarge'
  setShowGrid,
  setViewport,
  setComponentSize,
  toggleGrid,
} = useControlPanel();
```

### Theme Integration
```tsx
const { colors, themeName, setTheme } = useTheme();
```

Control panel directly integrates with ThemeContext for seamless theme switching.

---

## 📱 Platform Support

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Theme Picker | ✅ | ✅ | ✅ |
| Grid Overlay | ✅ | ✅ | ✅ |
| Viewport Selector | ✅ | ✅ | ✅ |
| Component Size | ✅ | ✅ | ✅ |

**Note**: All features work across all platforms because control panel is rendered as a decorator within story canvas.

---

## 🎨 Visual Examples

### Control Panel States

**Normal State**:
```
[🎨 Solarized Dark ▼] - Clickable, shows current theme
```

**Grid Enabled**:
```
[📐 Grid] - Pink grid lines visible over story
```

**Viewport Changed**:
```
[📱 Tablet ▼] - Story canvas width is 768px
```

**Scaled Up**:
```
[📏 Large ▼] - Component appears 1.25x larger
```

---

## 🐛 Troubleshooting

### Control Panel Not Visible
- **Check**: Is Storybook running? (`npm run storybook`)
- **Check**: Are you viewing a story? (not the welcome page)
- **Fix**: Control panel is a decorator, appears on every story

### Theme Not Changing
- **Check**: Is theme actually selected in modal?
- **Check**: Does component use `useTheme()` hook?
- **Fix**: Verify component imports from `@/src/theme/ThemeContext`

### Grid Not Appearing
- **Check**: Is grid toggle button clicked?
- **Check**: Is grid overlay visible? (pink semi-transparent lines)
- **Fix**: Try toggling off and on again

### Viewport Not Resizing
- **Check**: Is viewport selector showing correct size?
- **Check**: Is story container responding to viewport changes?
- **Note**: Some stories may have fixed widths that override viewport

---

## 📚 Related Documentation

- **Full Implementation**: `/mobile/STORYBOOK_IMPLEMENTATION_COMPLETE.md`
- **Technical Details**: `/mobile/.rnstorybook/STORYBOOK_HEADER_FIX_SUMMARY.md`
- **Theme Guide**: `/mobile/docs/MULTI_THEME_GUIDE.md`
- **Storybook Guide**: `/mobile/docs/STORYBOOK_GUIDE.md`

---

**Last Updated**: November 13, 2025
**Implementation**: Commit `280a42e` (decorator approach)
**Status**: ✅ All 4 tools working across web/iOS/Android
