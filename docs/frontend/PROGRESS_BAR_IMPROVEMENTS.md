# Progress Bar Improvements

## Summary
Enhanced the AsyncJobTimeline component with better UX for progress visualization during task capture.

## Changes Made

### 1. ✅ Progress Bar - Full Width with Smooth Animation
**File:** [AsyncJobTimeline.tsx:336](frontend/src/components/shared/AsyncJobTimeline.tsx#L336)

**Before:**
```tsx
<div className="h-1 bg-[#002b36] rounded-full overflow-hidden">
  <div
    className="h-full transition-all duration-200 ease-linear rounded-full"
    style={{ width: `${Math.min(currentProgress, 100)}%` }}
  />
</div>
```

**After:**
```tsx
<div className="w-full h-1 bg-[#002b36] rounded-full overflow-hidden">
  <div
    className="h-full transition-all duration-500 ease-out rounded-full"
    style={{ width: `${Math.min(currentProgress, 100)}%` }}
  />
</div>
```

**Improvements:**
- ✅ Added `w-full` to ensure 100% width
- ✅ Changed animation from `duration-200` → `duration-500` (smoother)
- ✅ Changed easing from `ease-linear` → `ease-out` (more natural)

---

### 2. ✅ Removed Automatic Robot/Person Icons
**File:** [AsyncJobTimeline.tsx:157-243](frontend/src/components/shared/AsyncJobTimeline.tsx#L157-L243)

**Before:**
```tsx
const getIcon = () => {
  if (step.status === 'done') return '✓';
  if (step.status === 'error') return '❌';
  if (step.icon) return step.icon;
  return step.leafType === 'DIGITAL' ? '🤖' : '👤';  // ← Automatic fallbacks
};

// Rendering (always shows icon)
<span className="text-xs">{getIcon()}</span>
```

**After:**
```tsx
const getIcon = () => {
  if (step.status === 'done') return '✓';
  if (step.status === 'error') return '❌';
  return step.icon || '';  // ← Only show custom icons or empty string
};

// Rendering (conditional - only if icon exists)
{getIcon() && <span className="text-xs">{getIcon()}</span>}
```

**Improvements:**
- ✅ Removed automatic 🤖 (robot) for DIGITAL tasks
- ✅ Removed automatic 👤 (person) for HUMAN tasks
- ✅ Added conditional rendering to hide empty icon spans
- ✅ Now only shows custom icons (🧠, 🔨, 🏷️, 💾) which are more descriptive

---

### 3. ✅ Full Short Labels Instead of Truncation
**File:** [AsyncJobTimeline.tsx:163](frontend/src/components/shared/AsyncJobTimeline.tsx#L163)

**Before:**
```tsx
const getLabel = () => {
  if (size === 'nano') return `${index + 1}`;
  if (size === 'micro') return step.shortLabel || step.description.slice(0, 15);  // ← Cuts mid-word
  return step.description;
};
```

**After:**
```tsx
const getLabel = () => {
  if (size === 'nano') return `${index + 1}`;
  if (size === 'micro') return step.shortLabel || step.description;  // ← Shows full label
  return step.description;
};
```

**Improvements:**
- ✅ Removed `.slice(0, 15)` which cut text mid-word
- ✅ Now shows full `shortLabel` (properly formatted 2-3 words)
- ✅ Better readability and comprehension

---

### 4. ✅ Better Capture Step Descriptions
**File:** [mobile/page.tsx:268-309](frontend/src/app/mobile/page.tsx#L268-L309)

**Before:**
```tsx
setCaptureSteps([
  { id: 'parse', shortLabel: 'Parse', icon: '🧠', ... },
  { id: 'llm', shortLabel: 'LLM', icon: '🔨', ... },
  { id: 'classify', shortLabel: 'Classify', icon: '🏷️', ... },
  { id: 'save', shortLabel: 'Save', icon: '💾', ... },
])
```

**After:**
```tsx
setCaptureSteps([
  { id: 'parse', shortLabel: 'Parsing input', icon: '🧠', ... },
  { id: 'llm', shortLabel: 'Breaking down', icon: '🔨', ... },
  { id: 'classify', shortLabel: 'Classifying steps', icon: '🏷️', ... },
  { id: 'save', shortLabel: 'Saving task', icon: '💾', ... },
])
```

**Improvements:**
- ✅ Changed 1-word labels to 2-3 word descriptive phrases
- ✅ Users now understand what's happening at each step
- ✅ Better ADHD-friendly UX (clear, informative feedback)

---

## Visual Comparison

### Before:
```
[🤖 Parse] [🤖 LLM] [🤖 Classif...] [🤖 Save]
─────────────────────────── 45%  ← Doesn't fill width
```

### After:
```
[🧠 Parsing input] [🔨 Breaking down] [🏷️ Classifying steps] [💾 Saving task]
──────────────────────────────────────────────────── 45%  ← Fills full width
```

## User Benefits

1. **Better Progress Visualization**
   - Progress bar now fills entire container
   - Smooth, natural animation (500ms ease-out)
   - Easier to see progress at a glance

2. **Clearer Step Information**
   - Descriptive labels instead of truncated text
   - Custom icons (🧠🔨🏷️💾) instead of generic 🤖
   - Users understand what's happening in each step

3. **Improved ADHD UX**
   - Clear, informative feedback reduces anxiety
   - Smooth animations are less jarring
   - Better visual hierarchy with full-width bar

## Files Modified

1. ✅ [frontend/src/components/shared/AsyncJobTimeline.tsx](frontend/src/components/shared/AsyncJobTimeline.tsx)
   - Lines 157-161: Removed automatic robot/person icons
   - Lines 163-167: Show full short labels
   - Lines 336-343: Full-width progress bar with smooth animation

2. ✅ [frontend/src/app/mobile/page.tsx](frontend/src/app/mobile/page.tsx)
   - Lines 268-309: Better step descriptions

## Testing

Test the progress bar by:
1. Go to `/mobile` in capture mode
2. Enter a task and submit
3. Watch the progress bar fill smoothly
4. Observe step labels: "Parsing input" → "Breaking down" → "Classifying steps" → "Saving task"
5. Note custom icons (🧠🔨🏷️💾) instead of robots (🤖)

## Related

This work complements:
- Voice input feature (smooth UX during voice capture)
- ADHD-friendly design (clear progress feedback)
- Mobile optimization (full-width utilization)
