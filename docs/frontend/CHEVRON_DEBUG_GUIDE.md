# Chevron Parallelogram Debug Guide

**Problem**: OpenMoji icons not showing inside skewed parallelogram chevrons
**Status**: 🔴 BLOCKING
**Last Attempt**: Counter-skew on content layer

---

## 🎯 Goal

Create parallelogram chevrons like this reference image:

```
/-----\/-----\/-----\
| 🤖 || 👤 || 📋 |  ← Icons should show inside
\-----/\-----/\-----/
```

**Requirements**:
- Subtle 15-degree slant (parallelogram shape)
- Borders on all 4 edges
- Uncoloured OpenMoji icons visible inside
- Icons stay upright (not skewed)
- Tight fit between chevrons (-4px margin overlap)

---

## 📐 Current Implementation

### ChevronStep.tsx
```tsx
<div style={{ width: '100%', height: '64px' }}>
  {/* Parallelogram container (SKEWED) */}
  <div style={{
    transform: 'skewX(-15deg)',
    backgroundColor: '#fdf6e3',
    border: '2px solid #586e75',
  }}>
    {/* Active glow */}
  </div>

  {/* Content layer (COUNTER-SKEWED) */}
  <div style={{
    transform: 'skewX(15deg)', // Should cancel out parent skew
    zIndex: 1,
  }}>
    {children} {/* OpenMoji here - NOT VISIBLE */}
  </div>
</div>
```

### AsyncJobTimeline.tsx
```tsx
<ChevronStep status="active" position="middle" size="full">
  <OpenMoji
    emoji="🤖"
    size={20}
    variant="black" // Uncoloured
  />
</ChevronStep>
```

---

## 🐛 Debug Checklist

### Step 1: Is the icon rendering at all?
- [ ] Check browser devtools elements tab
- [ ] Look for `<img>` tag with OpenMoji src
- [ ] Verify src URL is loading (check Network tab)
- [ ] Check for console errors

**How to check**:
```bash
# In browser console:
document.querySelectorAll('img[src*="openmoji"]')
```

### Step 2: Is the icon hidden by CSS?
- [ ] Check `opacity` (should be 1)
- [ ] Check `visibility` (should be visible)
- [ ] Check `display` (should NOT be none)
- [ ] Check `color` (might be white on white?)
- [ ] Check parent `overflow` (might be hidden)

**How to check**:
```js
// In browser console, select the OpenMoji img element:
const img = document.querySelector('img[src*="openmoji"]');
console.log(window.getComputedStyle(img));
```

### Step 3: Is the counter-skew working?
- [ ] Measure actual transform on content layer
- [ ] Verify it's exactly `skewX(15deg)` (opposite of parent)
- [ ] Check if nested transforms are combining correctly

**How to check**:
```js
// Get computed transform matrix:
const content = document.querySelector('.chevron-step-wrapper > div:last-child');
console.log(window.getComputedStyle(content).transform);
```

### Step 4: Is z-index correct?
- [ ] Content layer should be `z-index: 1`
- [ ] Parallelogram background should be `z-index: 0` or auto
- [ ] No parent elements blocking with higher z-index

**How to check**:
```js
// Check stacking context:
const layers = document.querySelectorAll('.chevron-step-wrapper > div');
layers.forEach((el, i) => {
  console.log(`Layer ${i}:`, window.getComputedStyle(el).zIndex);
});
```

### Step 5: Is positioning correct?
- [ ] Content layer is `position: relative`
- [ ] Icon is NOT being pushed outside bounds
- [ ] Parent width/height is sufficient

---

## 🔧 Alternative Approaches

### Option A: Absolute Positioning
```tsx
<div style={{ position: 'relative', width: '100%', height: '64px' }}>
  {/* Background parallelogram */}
  <div style={{
    position: 'absolute',
    inset: 0,
    transform: 'skewX(-15deg)',
    backgroundColor: '#fdf6e3',
    border: '2px solid',
  }} />

  {/* Content (NOT nested, NO counter-skew needed) */}
  <div style={{
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  }}>
    <OpenMoji emoji="🤖" size={20} variant="black" />
  </div>
</div>
```

### Option B: Separate Layers
```tsx
<div style={{ position: 'relative', width: '100%', height: '64px' }}>
  {/* Layer 1: Background (skewed) */}
  <div style={{
    position: 'absolute',
    inset: 0,
    transform: 'skewX(-15deg)',
    backgroundColor: '#fdf6e3',
    border: '2px solid',
    zIndex: 0,
  }} />

  {/* Layer 2: Content (NOT skewed, on top) */}
  <div style={{
    position: 'relative', // NOT absolute
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  }}>
    <OpenMoji emoji="🤖" size={20} variant="black" />
  </div>
</div>
```

### Option C: Pseudo-element Background
```tsx
<div style={{
  position: 'relative',
  width: '100%',
  height: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}}>
  {/* Use ::before for background */}
  <style jsx>{`
    .chevron-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      transform: skewX(-15deg);
      background-color: #fdf6e3;
      border: 2px solid #586e75;
      z-index: -1;
    }
  `}</style>

  <div className="chevron-bg">
    <OpenMoji emoji="🤖" size={20} variant="black" />
  </div>
</div>
```

---

## 🧪 Test Cases

### Minimal Test (Plain Text)
```tsx
<ChevronStep status="pending" position="single" size="full">
  <span style={{ fontSize: '24px', fontWeight: 'bold' }}>TEST</span>
</ChevronStep>
```

**Expected**: "TEST" text visible and upright
**If fails**: Counter-skew not working

### Minimal Test (Emoji)
```tsx
<ChevronStep status="pending" position="single" size="full">
  <span style={{ fontSize: '24px' }}>🤖</span>
</ChevronStep>
```

**Expected**: Robot emoji visible and upright
**If fails**: Transform affecting emoji rendering

### Minimal Test (OpenMoji)
```tsx
<ChevronStep status="pending" position="single" size="full">
  <img
    src="https://cdn.jsdelivr.net/npm/openmoji@latest/color/svg/1F916.svg"
    width={24}
    height={24}
    alt="robot"
  />
</ChevronStep>
```

**Expected**: OpenMoji robot visible
**If fails**: Image loading or positioning issue

---

## 📊 Browser Devtools Inspection

### Chrome/Edge Devtools
1. Right-click chevron → Inspect
2. Check Elements tab:
   ```html
   <div class="chevron-step-wrapper">
     <div style="transform: skewX(-15deg)">...</div>
     <div style="transform: skewX(15deg)">
       <!-- IS THERE AN IMG TAG HERE? -->
       <img src="..." />
     </div>
   </div>
   ```
3. Check Computed tab for actual transform values
4. Check Layout tab for element size/position
5. Toggle transforms on/off to see effect

### What to Look For
- ✅ `<img>` tag exists
- ✅ `src` attribute has valid URL
- ✅ Image loaded (no broken image icon)
- ✅ `width` and `height` are > 0
- ✅ `opacity` is 1
- ✅ `visibility` is visible
- ✅ Element is inside viewport

---

## 💡 Quick Fixes to Try

### Fix 1: Remove Counter-Skew (Test if content shows at all)
```tsx
// Temporarily remove counter-skew to see if icon appears (will be skewed)
<div style={{
  // transform: 'skewX(15deg)', // COMMENT THIS OUT
  zIndex: 1,
}}>
  {children}
</div>
```

**If icon appears (but skewed)**: Counter-skew is canceling the icon itself
**If icon still doesn't appear**: Problem is elsewhere (positioning, z-index, etc)

### Fix 2: Use Absolute Positioning
```tsx
<div style={{ position: 'relative' }}>
  {/* Skewed background */}
  <div style={{ position: 'absolute', inset: 0, transform: 'skewX(-15deg)' }} />

  {/* Content on top (NOT nested) */}
  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
    {children}
  </div>
</div>
```

### Fix 3: Use CSS ::before Pseudo-element
```tsx
<div style={{ position: 'relative' }} className="chevron-with-bg">
  <style jsx>{`
    .chevron-with-bg::before {
      content: '';
      position: absolute;
      inset: 0;
      transform: skewX(-15deg);
      background: #fdf6e3;
      border: 2px solid #586e75;
      z-index: -1;
    }
  `}</style>
  {children}
</div>
```

---

## 🎯 Success Criteria

When fixed, you should see:

1. ✅ **Parallelogram shape** - Slanted left/right edges
2. ✅ **All borders visible** - Top, bottom, left, right
3. ✅ **Icon visible** - OpenMoji rendering inside
4. ✅ **Icon upright** - Not skewed with parallelogram
5. ✅ **Tight fit** - Chevrons connect with -4px overlap
6. ✅ **All sizes work** - Nano (12px icon), Micro (16px), Full (20px)
7. ✅ **All statuses** - Pending, Active, Done, Error colors

---

## 🚀 Next Steps After Fix

Once chevrons are working:

1. **Create comprehensive Storybook stories**:
   - All positions (first, middle, last, single)
   - All statuses (pending, active, done, error)
   - All sizes (nano, micro, full)
   - Collapsed vs expanded states
   - Tight fit demonstration

2. **Update AsyncJobTimeline**:
   - Test with real task data
   - Verify nested decomposition works
   - Check expand/collapse animations
   - Test progress bar rendering

3. **Document in COMPONENT_CATALOG.md**:
   - Usage examples
   - Props reference
   - Design decisions
   - Common pitfalls

4. **Add tests**:
   - Unit tests for all prop combinations
   - Visual regression tests
   - Accessibility tests
