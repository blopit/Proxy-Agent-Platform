# Nested Progress Rings - FocusTimer

## Overview

The FocusTimer now uses **3 concentric progress rings** that provide multi-scale feedback about session progress. This creates immediate, medium-term, and long-term progress indicators that are especially helpful for ADHD users.

## Inspiration

Based on the concept from [react-progress-label](https://github.com/swiftcarrot/react-progress-label), adapted for React Native using `react-native-svg`.

## Ring System

### 🔴 Outer Ring (Largest)
- **Shows:** Full session progress (0-100%)
- **Stroke Width:** 8px
- **Opacity:** 100%
- **Updates:** Continuously as time elapses
- **Purpose:** Overall context - "How far through the whole session am I?"

### 🟡 Middle Ring
- **Shows:** Current 10% segment progress
- **Stroke Width:** 6px
- **Opacity:** 70%
- **Updates:** Resets every 10% of total time
- **Purpose:** Medium-term feedback - "How far through this chunk?"
- **Cycles:** 10 times per session

### 🟢 Inner Ring (Smallest)
- **Shows:** Current 1% segment progress
- **Stroke Width:** 4px
- **Opacity:** 50%
- **Updates:** Resets every 1% of total time
- **Purpose:** Immediate feedback - "I'm making progress RIGHT NOW"
- **Cycles:** 100 times per session

## How It Works

### Progress Calculation

```typescript
// Overall progress (0-100%)
const overallProgress = ((duration - timeRemaining) / duration) * 100;

// Which 10% segment are we in? (0-9)
const tenPercentSegment = Math.floor(overallProgress / 10);

// Progress within current 10% segment (0-100%)
const tenPercentProgress = (overallProgress % 10) * 10;

// Which 1% segment are we in? (0-99)
const onePercentSegment = Math.floor(overallProgress);

// Progress within current 1% segment (0-100%)
const onePercentProgress = (overallProgress % 1) * 100;
```

### SVG Rendering

Each ring is rendered using SVG `<Circle>` elements with:
- `strokeDasharray`: Full circumference
- `strokeDashoffset`: Calculated from progress percentage
- `rotation="-90"`: Start from top (12 o'clock position)
- `strokeLinecap="round"`: Rounded ends for smooth appearance

## Example Behaviors

### 25-Minute Pomodoro Session

| Time Elapsed | Overall | Middle Ring | Inner Ring |
|--------------|---------|-------------|------------|
| 0:00 | 0% | 0% (Segment 1/10) | 0% |
| 0:15 | 1% | 10% (Segment 1/10) | ✓ Complete → Reset |
| 2:30 | 10% | ✓ Complete → Reset | 0% (Segment 11/100) |
| 12:30 | 50% | 0% (Segment 6/10) | 0% (Segment 51/100) |
| 25:00 | 100% | ✓ Complete | ✓ Complete |

### 5-Minute ADHD Micro-Burst

| Time Elapsed | Overall | Middle Ring | Inner Ring |
|--------------|---------|-------------|------------|
| 0:00 | 0% | 0% | 0% |
| 0:03 | 1% | 10% | ✓ Complete → Reset |
| 0:30 | 10% | ✓ Complete → Reset | 0% |
| 2:30 | 50% | 0% (Segment 6/10) | 0% |
| 5:00 | 100% | ✓ Complete | ✓ Complete |

## Why This Works for ADHD

### 1. Immediate Gratification
The inner ring completes quickly (every 1% of session), providing frequent dopamine hits from visible progress.

**Example:** In a 25-minute session, the inner ring completes every 15 seconds!

### 2. Reduced Overwhelm
Instead of watching a single slow-moving progress bar, you see:
- ✅ Fast movement (inner ring)
- ✅ Medium movement (middle ring)
- ✅ Slow but steady overall progress (outer ring)

### 3. Visual Time Perception
The multiple rings help "chunk" time into digestible pieces:
- "I just need to get through this 1% segment" (15 seconds)
- Rather than "I need to focus for 25 minutes" (overwhelming)

### 4. Flow State Support
The constantly moving inner ring provides:
- Visual anchor for attention
- Rhythmic feedback cycle
- Hyperfocus lock-in mechanism

## Storybook Stories

### New Stories Added

1. **NestedRingsDemo** (60 seconds, auto-start)
   - Best for quick testing
   - Inner ring cycles every 0.6 seconds
   - See all 3 rings in action fast

2. **NestedRingsShortSession** (5 minutes)
   - ADHD micro-burst configuration
   - Inner ring cycles every 3 seconds
   - Perfect for quick wins

3. **NestedRingsLongSession** (50 minutes)
   - Deep work session
   - Appreciate the multi-scale feedback
   - Inner ring provides consistent immediate feedback

## Technical Implementation

### Dependencies

```json
{
  "react-native-svg": "^15.9.0"
}
```

### Key Files

- **`components/focus/FocusTimer.tsx`** - Main component with nested rings
- **`components/focus/FocusTimer.stories.tsx`** - Storybook stories
- **`components/focus/NESTED_RINGS.md`** - This documentation

### Code Structure

```typescript
// Helper function to render each ring
const renderProgressRing = (
  radius: number,
  strokeWidth: number,
  progress: number,
  color: string,
  opacity: number = 1
) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      {/* Background circle */}
      <Circle cx="120" cy="120" r={radius} stroke={THEME.base02} />

      {/* Progress circle */}
      <Circle
        cx="120" cy="120" r={radius}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        rotation="-90" origin="120, 120"
      />
    </>
  );
};

// Render nested rings
<Svg width={240} height={240}>
  {renderProgressRing(110, 8, overallProgress, sessionColor, 1)}
  {renderProgressRing(90, 6, tenPercentProgress, sessionColor, 0.7)}
  {renderProgressRing(70, 4, onePercentProgress, sessionColor, 0.5)}
</Svg>
```

## Customization Options

### For Longer Sessions (1+ hours)

Add a 4th ring for 0.1% segments:

```typescript
const pointOnePercentProgress = (overallProgress % 0.1) * 1000;

{renderProgressRing(50, 3, pointOnePercentProgress, sessionColor, 0.3)}
```

This would cycle 1000 times per session!

### Color Variations

Different colors for each ring:

```typescript
{renderProgressRing(110, 8, overallProgress, THEME.orange, 1)}      // Orange
{renderProgressRing(90, 6, tenPercentProgress, THEME.yellow, 0.7)}  // Yellow
{renderProgressRing(70, 4, onePercentProgress, THEME.green, 0.5)}   // Green
```

### Animation

Add smooth transitions:

```typescript
<Circle
  // ... other props
  style={{
    transition: 'stroke-dashoffset 0.3s ease-in-out'
  }}
/>
```

## Performance Considerations

- **60 FPS target:** Each ring updates independently
- **SVG optimization:** Uses `strokeDasharray` instead of path animation
- **React Native SVG:** Hardware-accelerated on native platforms
- **Web fallback:** Uses same SVG rendering

## Accessibility

The nested rings are accompanied by:
- Text-based time display (MM:SS)
- Percentage complete indicator
- Segment number indicator (e.g., "Segment 5/10")

Screen readers will announce these text values, making the timer fully accessible even without visual ring feedback.

## Future Enhancements

1. **Haptic Feedback:** Vibrate on inner ring completion
2. **Sound Cues:** Subtle tick sound each 1% segment
3. **Pulse Animation:** Rings pulse when completing segments
4. **Color Progression:** Rings change color as session progresses
5. **Adaptive Rings:** More rings for longer sessions, fewer for short bursts

---

**Created:** November 5, 2025
**Component:** FocusTimer
**Feature:** Multi-scale nested progress rings for ADHD-friendly time perception
