# OpenMoji Standards for Onboarding

**Date**: November 10, 2025
**Status**: ✅ Standardized Across All Screens

## Overview

All onboarding screens use the `OpenMoji` component for consistent, accessible emoji rendering. This ensures visual consistency across platforms and provides a better user experience.

## Why OpenMoji?

1. **Consistency**: Same emoji appearance across iOS, Android, and web
2. **Accessibility**: Predictable sizing and layout
3. **Maintainability**: Single component to update for all emoji displays
4. **Performance**: Optimized rendering with native platform support

## Component Usage

### Basic Pattern

```typescript
import OpenMoji from '@/src/components/ui/OpenMoji';

// Simple emoji display
<OpenMoji emoji="🎯" size={32} />

// In a data structure
const ITEMS = [
  { id: 'task', label: 'Tasks', emoji: '✅' },
  { id: 'focus', label: 'Focus', emoji: '🎯' },
];

// Rendering
{ITEMS.map((item) => (
  <View key={item.id}>
    <OpenMoji emoji={item.emoji} size={24} />
    <Text>{item.label}</Text>
  </View>
))}
```

### Size Guidelines

| Context | Size | Example |
|---------|------|---------|
| Small icons (chips, badges) | 16-18px | Challenge chips |
| Medium icons (cards) | 20-24px | Time preference cards, help level cards |
| Large icons (headers, features) | 28-32px | Welcome screen benefits, complete screen features |

## Implementation by Screen

### 1. Welcome Screen
**File**: `welcome.tsx`

**Status**: ✅ Already using OpenMoji

**Usage**:
```typescript
<OpenMoji emoji="🎯" size={32} color={THEME.base0} />
<OpenMoji emoji="🧠" size={32} color={THEME.base0} />
<OpenMoji emoji="⚡" size={32} color={THEME.base0} />
<OpenMoji emoji="📊" size={32} color={THEME.base0} />
```

**Note**: Color prop provided but native emojis don't support color override.

### 2. Work Preferences Screen
**File**: `work-preferences.tsx`

**Status**: ✅ No emojis used (uses lucide-react-native icons instead)

### 3. Challenges Screen
**File**: `challenges.tsx`

**Status**: ✅ Updated to use OpenMoji

**Changes Made**:
- Added `import OpenMoji from '@/src/components/ui/OpenMoji'`
- Replaced `<Text style={styles.challengeEmoji}>{challenge.emoji}</Text>` with `<OpenMoji emoji={challenge.emoji} size={18} />`
- Replaced lightbulb emoji in hint with `<OpenMoji emoji="💡" size={16} />`
- Removed `challengeEmoji` style
- Added flexDirection to `hintContainer` style

**Data Structure**:
```typescript
const COMMON_CHALLENGES = [
  { id: 'task_initiation', label: 'Getting started on tasks', emoji: '🏁' },
  { id: 'focus', label: 'Staying focused', emoji: '🎯' },
  // ... etc
];
```

### 4. ADHD Support Screen
**File**: `adhd-support.tsx`

**Status**: ✅ Updated to use OpenMoji

**Changes Made**:
- Added `import OpenMoji from '@/src/components/ui/OpenMoji'`
- Replaced `<Text style={styles.levelEmoji}>{helpLevel.emoji}</Text>` with `<OpenMoji emoji={helpLevel.emoji} size={24} />`
- Removed `levelEmoji` style

**Data Structure**:
```typescript
const HELP_LEVELS = [
  { level: 3, title: 'Light Touch', emoji: '🌱', description: '...' },
  { level: 5, title: 'Balanced', emoji: '⚖️', description: '...' },
  { level: 7, title: 'Focused', emoji: '🎯', description: '...' },
  { level: 9, title: 'Full Support', emoji: '🚀', description: '...' },
];
```

### 5. Daily Schedule Screen
**File**: `daily-schedule.tsx`

**Status**: ✅ Updated to use OpenMoji

**Changes Made**:
- Added `import OpenMoji from '@/src/components/ui/OpenMoji'`
- Replaced `<Text style={styles.timePrefEmoji}>{pref.emoji}</Text>` with `<OpenMoji emoji={pref.emoji} size={20} />`
- Removed `timePrefEmoji` style

**Data Structure**:
```typescript
const TIME_PREFERENCES = [
  { value: 'early_morning', label: 'Early Morning', emoji: '🌅' },
  { value: 'morning', label: 'Morning', emoji: '☀️' },
  { value: 'afternoon', label: 'Afternoon', emoji: '🌤️' },
  { value: 'evening', label: 'Evening', emoji: '🌆' },
  { value: 'night', label: 'Night', emoji: '🌙' },
  { value: 'flexible', label: 'Flexible', emoji: '🔄' },
];
```

### 6. Goals Screen
**File**: `goals.tsx`

**Status**: ✅ Already using OpenMoji

**Usage**:
```typescript
<OpenMoji emoji={typeInfo.emoji} size={32} color={THEME.base0} />
```

**Data Structure**:
```typescript
const SUGGESTED_GOALS = [
  { type: 'task_completion', title: 'Complete Tasks', emoji: '✅' },
  { type: 'focus_time', title: 'Focus Sessions', emoji: '🎯' },
  // ... etc
];
```

### 7. Complete Screen
**File**: `complete.tsx`

**Status**: ✅ Updated to use OpenMoji

**Changes Made**:
- Added `import OpenMoji from '@/src/components/ui/OpenMoji'`
- Replaced all 4 feature emoji `<Text>` elements with `<OpenMoji>`
- Removed `featureEmoji` style

**Before**:
```typescript
<Text style={styles.featureEmoji}>🧠</Text>
<Text style={styles.featureEmoji}>🎯</Text>
<Text style={styles.featureEmoji}>🗺️</Text>
<Text style={styles.featureEmoji}>🤖</Text>
```

**After**:
```typescript
<OpenMoji emoji="🧠" size={32} />
<OpenMoji emoji="🎯" size={32} />
<OpenMoji emoji="🗺️" size={32} />
<OpenMoji emoji="🤖" size={32} />
```

## Style Changes

### Removed Styles

All emoji-specific font size styles were removed since OpenMoji handles sizing:

```typescript
// ❌ REMOVED - No longer needed
challengeEmoji: {
  fontSize: 18,
},
levelEmoji: {
  fontSize: 28,
},
timePrefEmoji: {
  fontSize: 18,
},
featureEmoji: {
  fontSize: 32,
},
```

### Updated Container Styles

Some containers were updated to accommodate OpenMoji:

```typescript
// ✅ ADDED - For hint section in challenges.tsx
hintContainer: {
  flexDirection: 'row',     // Added
  alignItems: 'center',     // Added
  gap: 12,                  // Added
  backgroundColor: `${THEME.blue}15`,
  borderRadius: 12,
  padding: 16,
  marginTop: 8,
},
hintText: {
  flex: 1,                  // Added to allow text wrapping
  fontSize: 14,
  color: THEME.base01,
  lineHeight: 20,
},
```

## Best Practices

### ✅ DO

```typescript
// Import OpenMoji
import OpenMoji from '@/src/components/ui/OpenMoji';

// Use OpenMoji component
<OpenMoji emoji="🎯" size={24} />

// Store emojis in data structures
const items = [
  { id: 'task', emoji: '✅', label: 'Tasks' },
];

// Map over data to render
{items.map((item) => (
  <OpenMoji key={item.id} emoji={item.emoji} size={20} />
))}
```

### ❌ DON'T

```typescript
// Don't use plain Text for emojis
<Text style={{ fontSize: 24 }}>🎯</Text>

// Don't hardcode emoji font sizes in styles
const styles = StyleSheet.create({
  emoji: {
    fontSize: 32,  // ❌ Use OpenMoji size prop instead
  },
});

// Don't skip OpenMoji component
<Text>{someEmojiCharacter}</Text>  // ❌ Use OpenMoji
```

## Emoji Selection

When choosing emojis for onboarding:

1. **Be Universal**: Choose emojis that are widely recognized across cultures
2. **Be Relevant**: Emoji should relate directly to the content
3. **Be Consistent**: Use similar emoji styles throughout (e.g., all objects, all faces)
4. **Be Accessible**: Avoid emojis that may have multiple interpretations

### Current Emoji Palette

**Onboarding Screens**:
- Tasks/Completion: ✅ 🏁
- Focus/Goals: 🎯
- Brain/Thinking: 🧠 🤔
- Energy/Action: ⚡ 🚀
- Organization: 📋 🗺️
- Time/Schedule: ⏰ 🌅 ☀️ 🌤️ 🌆 🌙 ⏰
- Growth/Balance: 🌱 ⚖️
- Creativity/Learning: 🎨 📚
- Overwhelm: 🌊
- Transitions: 🔄
- Search: 🔍
- AI/Robot: 🤖
- Light/Ideas: 💡

## Testing Checklist

When adding/updating emojis in onboarding:

- [ ] OpenMoji component is imported
- [ ] All emoji Text elements replaced with OpenMoji
- [ ] Appropriate size is specified (16-32px based on context)
- [ ] Old emoji font size styles removed
- [ ] Container styles updated for proper layout
- [ ] Emojis render correctly on both iOS and Android
- [ ] Layout is consistent across different screen sizes
- [ ] No emoji-related warnings in console

## Maintenance

### Adding New Emojis

1. Add emoji to data structure:
```typescript
const NEW_ITEMS = [
  { id: 'new', label: 'New Feature', emoji: '✨' },
];
```

2. Render with OpenMoji:
```typescript
<OpenMoji emoji={item.emoji} size={24} />
```

3. Test on multiple devices/simulators

### Updating OpenMoji Component

If the OpenMoji component needs updates:
1. Update `mobile/src/components/ui/OpenMoji.tsx`
2. Test all onboarding screens
3. Update this documentation
4. Update size guidelines if needed

## Files Modified

All changes are tracked in the following files:

```
mobile/app/(auth)/onboarding/
├── challenges.tsx           ✅ Updated
├── complete.tsx             ✅ Updated
├── adhd-support.tsx         ✅ Updated
├── daily-schedule.tsx       ✅ Updated
├── goals.tsx                ✅ Already using OpenMoji
└── welcome.tsx              ✅ Already using OpenMoji

mobile/src/components/ui/
└── OpenMoji.tsx             ℹ️ Core component (unchanged)

agent_resources/docs/onboarding/
├── 01_FRONTEND.md           ✅ Updated with OpenMoji section
└── OPENMOJI_STANDARDS.md    ✅ New documentation
```

## Related Documentation

- **Component Implementation**: `mobile/src/components/ui/OpenMoji.tsx`
- **Frontend Guide**: `agent_resources/docs/onboarding/01_FRONTEND.md`
- **Onboarding Overview**: `agent_resources/docs/onboarding/00_OVERVIEW.md`

---

**Last Updated**: November 10, 2025
**Maintained By**: Development Team
**Review Status**: Ready for implementation
