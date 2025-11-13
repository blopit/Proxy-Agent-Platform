# Storybook Header Control Panel Implementation Report

## Date
January 2025

## Objective
Replace the floating theme picker button with a top header panel in Storybook React Native Expo that includes:
- Theme picker (as a UI component, not modal)
- Grid toggle
- Component sizing options
- Mobile viewport selector

## Current Status
**❌ NOT WORKING** - Header is not visible in Storybook UI

## Files Created

### 1. `StorybookControlPanelContext.tsx`
**Purpose**: Context provider for managing control panel state

**Location**: `mobile/.rnstorybook/StorybookControlPanelContext.tsx`

**Key Features**:
- Manages state for: `showGrid`, `viewport`, `componentSize`
- Provides `VIEWPORT_CONFIGS` with 4 viewport sizes:
  - Mobile: 375×667
  - Tablet: 768×1024
  - Desktop: 1440×900
  - Wide: 1920×1080
- Component sizes: small (0.75x), medium (1x), large (1.25x), xlarge (1.5x)

**Exports**:
- `ControlPanelProvider` - Context provider component
- `useControlPanel` - Hook to access control panel state
- `VIEWPORT_CONFIGS` - Viewport configuration constants

### 2. `StorybookControlPanel.tsx`
**Purpose**: Main header panel component with all controls

**Location**: `mobile/.rnstorybook/StorybookControlPanel.tsx`

**Key Features**:
- **Theme Picker**: Dropdown button with modal for theme selection
- **Grid Toggle**: Button to show/hide grid overlay
- **Viewport Selector**: Dropdown for device viewport sizes
- **Component Size Selector**: Dropdown for component scaling

**Styling Approach**:
- Absolutely positioned at top: `position: 'absolute', top: 0, left: 0, right: 0`
- High z-index: `zIndex: 10000` (iOS), `elevation: 10` (Android)
- Safe area handling: Uses `useSafeAreaInsets()` for status bar spacing
- Horizontal ScrollView for controls
- Modal-based pickers for theme, viewport, and size selection

**Icons Used** (from `lucide-react-native`):
- `Palette` - Theme picker
- `Grid3x3` - Grid toggle
- `Monitor` - Viewport selector
- `Maximize2` - Component sizing
- `ChevronDown` - Dropdown indicator
- `Check` - Selected indicator
- `X` - Close button

### 3. `GridOverlay.tsx`
**Purpose**: Visual grid overlay when grid toggle is enabled

**Location**: `mobile/.rnstorybook/GridOverlay.tsx`

**Key Features**:
- `SimpleGridOverlay` component
- 8px grid system (matches design system)
- Uses theme colors for grid lines
- `pointerEvents="none"` so it doesn't interfere with interactions
- Only renders when `showGrid` is true

### 4. `ViewportWrapper.tsx`
**Purpose**: Optional wrapper component for stories to apply viewport constraints

**Location**: `mobile/.rnstorybook/ViewportWrapper.tsx`

**Key Features**:
- Wraps story content with viewport constraints
- Applies component sizing transforms
- Can be used in story decorators

## Files Modified

### 1. `index.tsx`
**Location**: `mobile/.rnstorybook/index.tsx`

**Changes**:
- Added `SafeAreaProvider` wrapper
- Added `ControlPanelProvider` wrapper
- Replaced `StorybookThemePicker` with `StorybookControlPanel`
- Added `SimpleGridOverlay` component
- Changed component order: StorybookUI first, then overlay components

**Before**:
```tsx
<ThemeProvider>
  <View>
    <StorybookUI />
    <StorybookThemePicker />
  </View>
</ThemeProvider>
```

**After**:
```tsx
<SafeAreaProvider>
  <ThemeProvider>
    <ControlPanelProvider>
      <View>
        <StorybookUI />
        <StorybookControlPanel />
        <SimpleGridOverlay />
      </View>
    </ControlPanelProvider>
  </ThemeProvider>
</SafeAreaProvider>
```

## Implementation Details

### Positioning Strategy
The header uses absolute positioning to overlay on top of Storybook UI:
- `position: 'absolute'`
- `top: 0, left: 0, right: 0`
- `zIndex: 10000` (iOS)
- `elevation: 10` (Android)
- `paddingTop: statusBarHeight + 8` for safe area

### State Management
- Uses React Context API via `ControlPanelProvider`
- State persists during session (not persisted to storage)
- All controls are reactive and update immediately

### Theme Integration
- Uses existing `useTheme()` hook from `ThemeContext`
- All colors come from theme system
- Supports all 6 themes: solarized-dark, solarized-light, nord, dracula, catppuccin-mocha, high-contrast

## Issues Encountered

### Primary Issue: Header Not Visible
**Symptom**: Header control panel does not appear in Storybook UI

**Possible Causes**:
1. **Storybook UI covering header**: The Storybook React Native UI component might be rendering in a way that covers absolutely positioned elements
2. **Z-index conflicts**: Storybook's internal components might have higher z-index values
3. **Rendering order**: React Native's rendering might not respect absolute positioning in this context
4. **SafeAreaProvider context**: The hook might not be working correctly if Storybook UI creates its own rendering context
5. **Component not mounting**: The component might not be rendering at all due to an error

### Technical Challenges
1. **Storybook React Native architecture**: Unlike web Storybook, React Native Storybook uses a different rendering approach that might not support overlay components easily
2. **Native component hierarchy**: React Native's View hierarchy might be interfering with absolute positioning
3. **Storybook UI component**: The `getStorybookUI()` component might be creating a full-screen container that prevents overlays

## Debugging Attempts Made

1. ✅ Added `SafeAreaProvider` wrapper
2. ✅ Increased z-index to 10000
3. ✅ Increased elevation to 10
4. ✅ Added `pointerEvents="box-none"` to container (then removed from ScrollView)
5. ✅ Changed component order (StorybookUI first, then overlays)
6. ✅ Added safe area insets handling
7. ✅ Added minimum height to header
8. ✅ Verified all imports and exports

## Potential Solutions

### Option 1: Use Storybook's Addon API
Instead of overlaying, integrate controls as Storybook addons:
- Use `@storybook/addons` API
- Register controls as toolbar items
- This is the "official" way to add controls to Storybook

### Option 2: Modify Storybook UI Container
- Wrap Storybook UI in a container with padding-top
- Reserve space at top for header
- Header becomes part of layout instead of overlay

### Option 3: Use React Native Modal/Portal
- Render header in a Portal component
- Use React Native's Modal API
- This might work better for overlays

### Option 4: Custom Storybook Wrapper
- Create a custom wrapper that injects header before Storybook UI
- Modify the Storybook UI component structure
- This requires deeper integration with Storybook internals

### Option 5: Use Storybook's Decorator System
- Add header as a decorator in `preview.tsx`
- This would make it part of the story rendering context
- Might work better than trying to overlay on UI

## Recommended Next Steps

1. **Check Storybook React Native documentation** for official ways to add custom UI
2. **Inspect Storybook UI component structure** to understand rendering hierarchy
3. **Try decorator approach** - add header as a decorator in preview.tsx
4. **Consider Storybook addons** - use official addon API if available
5. **Debug rendering** - Add console logs or test background colors to verify component is mounting
6. **Check for errors** - Verify no runtime errors preventing component from rendering

## Code References

### Key Components
- **Control Panel Context**: `mobile/.rnstorybook/StorybookControlPanelContext.tsx`
- **Control Panel UI**: `mobile/.rnstorybook/StorybookControlPanel.tsx`
- **Grid Overlay**: `mobile/.rnstorybook/GridOverlay.tsx`
- **Viewport Wrapper**: `mobile/.rnstorybook/ViewportWrapper.tsx`
- **Storybook Entry**: `mobile/.rnstorybook/index.tsx`

### Dependencies Used
- `react-native-safe-area-context` - For safe area insets
- `lucide-react-native` - For icons
- `@storybook/react-native` - Storybook framework

## Testing Checklist

- [ ] Verify component mounts (add console.log)
- [ ] Check if Storybook UI has higher z-index
- [ ] Test with different background colors to see if header renders
- [ ] Check React Native DevTools for component tree
- [ ] Verify no runtime errors in console
- [ ] Test on both iOS and Android
- [ ] Check if Storybook UI creates its own View hierarchy

## Notes for Next Agent

1. The implementation is complete and should work in theory, but React Native Storybook's rendering might be preventing the overlay
2. Consider using Storybook's official extension points instead of overlays
3. The old `StorybookThemePicker.tsx` (floating button) still exists and worked - reference it for positioning approach
4. All context and state management is set up correctly
5. The issue is likely in how Storybook React Native handles absolutely positioned components

## Old Working Implementation

The previous `StorybookThemePicker.tsx` used:
- `position: 'absolute'`
- `top: 60, right: 16`
- `zIndex: 9999`
- `elevation: 5`

This worked as a floating button. The header approach might need similar positioning but at the top instead of floating.

## Current File Structure

```
mobile/.rnstorybook/
├── index.tsx                          # Main entry (MODIFIED)
├── StorybookControlPanel.tsx         # Header component (NEW)
├── StorybookControlPanelContext.tsx   # Context provider (NEW)
├── GridOverlay.tsx                    # Grid overlay (NEW)
├── ViewportWrapper.tsx                # Viewport wrapper (NEW)
├── StorybookThemePicker.tsx           # Old floating button (UNUSED)
├── preview.tsx                        # Storybook preview config
└── STORYBOOK_HEADER_IMPLEMENTATION_REPORT.md  # This file
```

## Quick Debug Checklist

To verify if component is rendering:
1. Add `console.log('StorybookControlPanel rendering')` in component
2. Add bright test background: `backgroundColor: 'red'` temporarily
3. Check React Native DevTools component tree
4. Verify no errors in Metro bundler console
5. Check if Storybook UI component has `overflow: 'hidden'` or similar

## Alternative Approach: Decorator-Based

Instead of overlaying, try adding header as a decorator in `preview.tsx`:

```tsx
decorators: [
  (Story, context) => (
    <View style={{ flex: 1 }}>
      <StorybookControlPanel />
      <Story />
    </View>
  ),
],
```

This would make the header part of the story rendering context rather than trying to overlay on the Storybook UI itself.
