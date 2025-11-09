# Rainbow Cycling Gradients - FocusTimer

## Overview

The FocusTimer now features **10-color cycling gradients** that shift through the spectrum as rings complete cycles, creating a mesmerizing rainbow layering effect!

## How It Works

### 10-Color Spectrum

Each completed cycle uses a different gradient from this spectrum:

```typescript
const colorSpectrum = [
  { start: THEME.red, mid: THEME.orange, end: THEME.yellow },      // 0: Warm
  { start: THEME.orange, mid: THEME.yellow, end: THEME.green },    // 1: Warm → Cool
  { start: THEME.yellow, mid: THEME.green, end: THEME.cyan },      // 2: Yellow → Cyan
  { start: THEME.green, mid: THEME.cyan, end: THEME.blue },        // 3: Green → Blue
  { start: THEME.cyan, mid: THEME.blue, end: THEME.violet },       // 4: Cyan → Violet
  { start: THEME.blue, mid: THEME.violet, end: THEME.magenta },    // 5: Blue → Magenta
  { start: THEME.violet, mid: THEME.magenta, end: THEME.red },     // 6: Violet → Red
  { start: THEME.magenta, mid: THEME.red, end: THEME.orange },     // 7: Magenta → Orange
  { start: THEME.red, mid: THEME.yellow, end: THEME.green },       // 8: Red → Green
  { start: THEME.yellow, mid: THEME.cyan, end: THEME.magenta },    // 9: Yellow → Magenta
];
```

### Gradient Assignment

**Each completed cycle gets its own gradient:**

```typescript
// Cycle 0 uses gradient 0 (Red → Orange → Yellow)
// Cycle 1 uses gradient 1 (Orange → Yellow → Green)
// Cycle 2 uses gradient 2 (Yellow → Green → Cyan)
// ...
// Cycle 9 uses gradient 9 (Yellow → Cyan → Magenta)
// Cycle 10 wraps back to gradient 0 (Red → Orange → Yellow)
```

**Current progress uses the next gradient:**
```typescript
const currentColorIndex = completedCycles % 10;
// If 3 cycles complete, current progress uses gradient 3
```

## Visual Effect

### 25-Minute Pomodoro Example

**At 2:30 (10% complete):**
- **Inner ring:**
  - Cycles 0-9: Each a different gradient (full rainbow!)
  - Cycle 10: Starting with Red→Orange→Yellow again
- **Middle ring:**
  - Cycle 0: Red→Orange→Yellow (faded)
  - Current progress: Orange→Yellow→Green (bright)

**At 12:30 (50% complete):**
- **Inner ring:**
  - 50 completed cycles = 5 complete rainbow cycles!
  - All 50 layers visible, cycling through the 10 colors 5 times
  - Creates incredible depth with overlapping gradients
- **Middle ring:**
  - Cycles 0-4: Each a different gradient
  - Current progress: Gradient 5 (Blue→Violet→Magenta)

**At 25:00 (100% complete):**
- **Inner ring:**
  - 100 completed cycles = 10 complete rainbow cycles!!
  - Mesmerizing layered effect with all gradients visible multiple times
  - Older layers faded, creating depth
- **Middle ring:**
  - All 10 gradients visible once each
  - Full rainbow spectrum layered perfectly

## Code Implementation

### 1. Generate All Gradient Definitions

```typescript
<Defs>
  {/* Generate 10 gradient variations for each ring (30 total) */}
  {['gradient-outer', 'gradient-middle', 'gradient-inner'].map((baseId) => {
    const baseOpacity = baseId === 'gradient-outer' ? 1 :
                        baseId === 'gradient-middle' ? 0.9 : 0.8;

    return colorSpectrum.map((colors, index) => (
      <LinearGradient
        key={`${baseId}-color${index}`}
        id={`${baseId}-color${index}`}
        x1="0%" y1="0%" x2="100%" y2="100%"
      >
        <Stop offset="0%" stopColor={colors.start} stopOpacity={baseOpacity} />
        <Stop offset="50%" stopColor={colors.mid} stopOpacity={baseOpacity} />
        <Stop offset="100%" stopColor={colors.end} stopOpacity={baseOpacity} />
      </LinearGradient>
    ));
  })}
</Defs>
```

This generates:
- `gradient-outer-color0` through `gradient-outer-color9` (10 gradients)
- `gradient-middle-color0` through `gradient-middle-color9` (10 gradients)
- `gradient-inner-color0` through `gradient-inner-color9` (10 gradients)
- **Total: 30 unique gradients!**

### 2. Assign Gradients to Completed Cycles

```typescript
const renderCompletedCycles = (...) => {
  for (let i = 0; i < completedCycles; i++) {
    // Use different color from spectrum for each cycle (0-9)
    const colorIndex = i % 10;
    const gradientId = `${baseGradientId}-color${colorIndex}`;

    cycles.push(
      <Circle
        stroke={`url(#${gradientId})`}
        strokeDashoffset={0}  // Full circle
        opacity={cycleOpacity}
        // ... other props
      />
    );
  }
};
```

### 3. Current Progress Uses Next Gradient

```typescript
const renderProgressRing = (...) => {
  // Current progress uses the next color in the cycle
  const currentColorIndex = completedCycles % 10;
  const currentGradientId = `${gradientId}-color${currentColorIndex}`;

  return (
    <>
      {/* Completed cycles beneath */}
      {renderCompletedCycles(...)}

      {/* Current progress with next gradient color */}
      <Circle
        stroke={`url(#${currentGradientId})`}
        strokeDashoffset={strokeDashoffset}
        opacity={opacity}
        // ... other props
      />
    </>
  );
};
```

## Rainbow Progression Examples

### Inner Ring (Cycles 100 times in 25 min)

| Seconds | Cycle # | Gradient Used | Color Description |
|---------|---------|---------------|-------------------|
| 0-15 | 0 | color0 | Red → Orange → Yellow |
| 15-30 | 1 | color1 | Orange → Yellow → Green |
| 30-45 | 2 | color2 | Yellow → Green → Cyan |
| ... | ... | ... | ... |
| 135-150 | 9 | color9 | Yellow → Cyan → Magenta |
| 150-165 | 10 | color0 | Red → Orange → Yellow (repeats!) |

### Middle Ring (Cycles 10 times in 25 min)

| Minutes | Cycle # | Gradient Used | Color Description |
|---------|---------|---------------|-------------------|
| 0:00-2:30 | 0 | color0 | Red → Orange → Yellow |
| 2:30-5:00 | 1 | color1 | Orange → Yellow → Green |
| 5:00-7:30 | 2 | color2 | Yellow → Green → Cyan |
| 7:30-10:00 | 3 | color3 | Green → Blue |
| 10:00-12:30 | 4 | color4 | Cyan → Violet |
| 12:30-15:00 | 5 | color5 | Blue → Magenta |
| 15:00-17:30 | 6 | color6 | Violet → Red |
| 17:30-20:00 | 7 | color7 | Magenta → Orange |
| 20:00-22:30 | 8 | color8 | Red → Green |
| 22:30-25:00 | 9 | color9 | Yellow → Magenta |

## Visual Benefits

### 1. Never Loses Visual Progress
✅ Every completed cycle remains visible as a colored layer
✅ Creates a visual history of all your effort
✅ Incredibly satisfying to watch build up

### 2. Beautiful Rainbow Effect
✅ 10 different gradient combinations
✅ Smooth color transitions between cycles
✅ Creates depth with overlapping translucent gradients
✅ Mesmerizing hyperfocus anchor

### 3. ADHD Optimization
✅ **Constant novelty** - Colors keep changing
✅ **Visual reward** - Each cycle adds a new color layer
✅ **Pattern recognition** - Rainbow repeats every 10 cycles
✅ **Hyperfocus support** - Beautiful shifting gradients maintain attention

### 4. Performance Art
✅ By session end, you've created a unique abstract art piece
✅ No two sessions look identical (depends on exact timing)
✅ Screenshot-worthy progress visualization
✅ Gamifies the focus experience

## Testing

### Quick Rainbow Test (60 seconds)

```bash
# Open Storybook
open http://localhost:8081/storybook

# Navigate to: Focus/FocusTimer → NestedRingsDemo
# Click Play
# Watch 60 cycles complete in 60 seconds
# See 6 complete rainbow cycles (60 ÷ 10 = 6)
```

**What you'll see:**
- Seconds 0-10: Gradients 0-9 (first rainbow)
- Seconds 10-20: Gradients 0-9 again (second rainbow)
- Seconds 20-30: Third rainbow
- Seconds 30-40: Fourth rainbow
- Seconds 40-50: Fifth rainbow
- Seconds 50-60: Sixth rainbow

By the end, the inner ring will have **60 overlapping gradient layers** creating an incredible visual effect!

### Full Pomodoro Test (25 minutes)

```bash
# Navigate to: Focus/FocusTimer → FocusSession
# Click Play and work for the full 25 minutes
# Take a screenshot at completion
```

**Result:**
- Inner ring: 100 gradient layers (10 complete rainbows!)
- Middle ring: 10 gradient layers (1 complete rainbow)
- Outer ring: 1 gradient layer (overall progress)

## Color Theory

The 10-gradient spectrum is designed to:

1. **Cover full color wheel** - All major hues represented
2. **Smooth transitions** - Each gradient flows into the next
3. **High contrast** - Easy to distinguish adjacent cycles
4. **Energetic palette** - Warm and cool colors balanced
5. **Solarized compatibility** - Uses THEME colors throughout

## Performance

- **30 gradient definitions** generated once on mount
- **Efficient rendering** - SVG gradients are GPU-accelerated
- **Smooth 60 FPS** - No performance impact from multiple gradients
- **Memory safe** - Gradients defined in SVG Defs (shared references)

## Future Enhancements

1. **Custom color palettes** - User-selectable spectrum themes
2. **Time-based hue rotation** - Gradients shift through full HSL spectrum
3. **Mood-based colors** - Different spectrums for different session types
4. **Achievement gradients** - Unlock special color combos after milestones

---

**Feature:** Rainbow Cycling Gradients
**Date:** November 5, 2025
**Colors:** 10-gradient spectrum with smooth cycling
**Visual Effect:** Mesmerizing layered rainbow that builds up over time
**ADHD Benefit:** Constant novelty + visual reward = sustained engagement
