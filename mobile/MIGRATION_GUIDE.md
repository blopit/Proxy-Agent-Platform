# Web to React Native Migration Guide

This guide explains how to convert web components from `frontend/src/components/mobile/` to native React Native components for the Expo app.

## Overview

The frontend has **two separate Storybooks**:

1. **Next.js Storybook** (`frontend/.storybook/`) - For web dashboard (SECONDARY frontend)
2. **React Native Storybook** (`mobile/.rnstorybook/`) - For Expo mobile app (PRIMARY frontend)

Components CANNOT be shared directly between these environments due to fundamental platform differences.

## Key Differences: Web vs React Native

### 1. Component Primitives

| Web (Next.js) | React Native | Notes |
|---------------|--------------|-------|
| `<div>` | `<View>` | Container element |
| `<span>`, `<p>`, `<h1>` | `<Text>` | All text must be in `<Text>` |
| `<button>` | `<TouchableOpacity>` or `<Pressable>` | Interactive elements |
| `<input>` | `<TextInput>` | Text input |
| `<img>` | `<Image>` | Images |

### 2. Styling

| Web | React Native |
|-----|--------------|
| CSS classes (`className`) | StyleSheet objects (`style`) |
| Tailwind utilities | Manual StyleSheet |
| CSS-in-JS (styled-components) | StyleSheet.create() |
| Flexbox (web) | Flexbox (RN - slightly different) |
| `px`, `rem`, `%` | Numbers (logical pixels) |

**Example:**

```tsx
// ❌ Web (Next.js)
<div className="bg-[#073642] rounded-lg p-4 border-2 border-[#586e75]">
  <h2 className="text-xl font-bold text-[#93a1a1]">Title</h2>
</div>

// ✅ React Native
<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#073642',
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#586e75',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#93a1a1',
  },
});
```

### 3. Icons

| Web | React Native |
|-----|--------------|
| `lucide-react` | `lucide-react-native` |
| Import: `from 'lucide-react'` | Import: `from 'lucide-react-native'` |

**Example:**

```tsx
// ❌ Web
import { Bot, Calendar } from 'lucide-react';
<Bot className="w-4 h-4 text-cyan-500" />

// ✅ React Native
import { Bot, Calendar } from 'lucide-react-native';
<Bot size={16} color="#2aa198" />
```

### 4. UI Component Libraries

| Web | React Native | Notes |
|-----|--------------|-------|
| shadcn/ui (`@/components/ui/*`) | Custom components | Must rebuild from scratch |
| `<Card>`, `<CardHeader>` | Custom `Card` component | See `mobile/components/ui/Card.tsx` |
| Framer Motion | `react-native-reanimated` | Animations |

## Step-by-Step Migration Process

### Step 1: Identify Component Dependencies

Before migrating, check what the web component imports:

```tsx
// frontend/src/components/mobile/cards/TaskCardBig.tsx
import { Card, CardHeader } from '@/components/ui/card'; // ❌ Web-only (shadcn)
import { Bot } from 'lucide-react'; // ❌ Web version
import { truncateText } from '@/lib/card-utils'; // ✅ Can port
```

### Step 2: Create React Native Equivalents

1. **Replace UI library components** with custom RN components
2. **Port utility functions** to TypeScript (no DOM dependencies)
3. **Update icon imports** to use `lucide-react-native`

### Step 3: Convert JSX Structure

**Web (Next.js):**
```tsx
<Card className="bg-[#073642] border-2 border-[#dc322f]">
  <CardHeader>
    <CardTitle className="text-[#93a1a1] text-xl font-bold">
      {title}
    </CardTitle>
    <CardDescription className="text-[#93a1a1] text-sm">
      {description}
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**React Native:**
```tsx
<Card variant="high-priority">
  <CardHeader>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>

const styles = StyleSheet.create({
  title: {
    color: '#93a1a1',
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    color: '#93a1a1',
    fontSize: 14,
  },
});
```

### Step 4: Convert Event Handlers

**Web:**
```tsx
<button
  onClick={onStartTask}
  className="px-4 py-2 bg-[#2aa198] rounded-lg"
>
  Start Task
</button>
```

**React Native:**
```tsx
<TouchableOpacity
  onPress={onStartTask}
  style={styles.button}
  activeOpacity={0.8}
>
  <Text style={styles.buttonText}>Start Task</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2aa198',
    borderRadius: 8,
  },
  buttonText: {
    color: '#002b36',
    fontWeight: '600',
  },
});
```

### Step 5: Handle Scrolling

React Native requires explicit `<ScrollView>` for scrollable content:

```tsx
import { ScrollView } from 'react-native';

<ScrollView style={styles.container}>
  {/* Scrollable content */}
</ScrollView>
```

## Common Patterns

### 1. Conditional Styling

**Web:**
```tsx
<div className={`p-4 ${priority === 'high' ? 'border-red-500' : 'border-gray-500'}`}>
```

**React Native:**
```tsx
<View style={[
  styles.container,
  priority === 'high' ? styles.highPriority : styles.lowPriority
]}>

const styles = StyleSheet.create({
  container: { padding: 16 },
  highPriority: { borderColor: '#dc322f' },
  lowPriority: { borderColor: '#586e75' },
});
```

### 2. Flexbox Differences

```tsx
// Web: Default flex-direction is 'row'
// RN:  Default flex-direction is 'column' ⚠️

// Web
<div className="flex flex-col gap-4">

// RN (explicit)
<View style={{ flexDirection: 'column', gap: 16 }}>
```

### 3. Text Truncation

**Web:**
```tsx
<p className="line-clamp-2">Long text...</p>
```

**React Native:**
```tsx
<Text numberOfLines={2}>Long text...</Text>
```

### 4. Percentage-based Progress Bars

**Web:**
```tsx
<div className="h-2 bg-gray-800 rounded">
  <div
    className="h-full bg-green-500"
    style={{ width: `${percentage}%` }}
  />
</div>
```

**React Native:**
```tsx
<View style={styles.progressContainer}>
  <View style={[styles.progressBar, { width: `${percentage}%` }]} />
</View>

const styles = StyleSheet.create({
  progressContainer: {
    height: 8,
    backgroundColor: '#002b36',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#859900',
  },
});
```

## Solarized Dark Color Palette

Use these consistent colors across all components:

```tsx
const COLORS = {
  // Base colors
  base03: '#002b36', // Background (darkest)
  base02: '#073642', // Background highlights
  base01: '#586e75', // Comments / secondary text
  base00: '#657b83',
  base0: '#839496',
  base1: '#93a1a1',  // Primary text
  base2: '#eee8d5',
  base3: '#fdf6e3',

  // Accent colors
  yellow: '#b58900',
  orange: '#cb4b16',
  red: '#dc322f',
  magenta: '#d33682',
  violet: '#6c71c4',
  blue: '#268bd2',
  cyan: '#2aa198',
  green: '#859900',
};
```

## Component Structure

Organize components in `mobile/components/`:

```
mobile/
├── components/
│   ├── ui/              # Reusable UI primitives
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── ProgressBar.tsx
│   ├── cards/           # Card components
│   │   ├── TaskCardBig.tsx
│   │   ├── TaskCardBig.stories.tsx
│   │   └── SuggestionCard.tsx
│   ├── modals/          # Modal components
│   │   ├── TaskBreakdownModal.tsx
│   │   └── CaptureModal.tsx
│   └── modes/           # Biological mode screens
│       ├── CaptureMode.tsx
│       ├── ScoutMode.tsx
│       └── HunterMode.tsx
```

## Storybook Setup

### 1. Create Stories

```tsx
// mobile/components/cards/TaskCardBig.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import TaskCardBig from './TaskCardBig';

const meta = {
  title: 'Cards/TaskCardBig',
  component: TaskCardBig,
} satisfies Meta<typeof TaskCardBig>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    task: { /* ... */ },
  },
};
```

### 2. Generate Stories List

After creating stories, regenerate the stories list:

```bash
cd mobile
npm run storybook-generate
```

### 3. View in Storybook

Start Expo and navigate to `/storybook`:

```bash
npm start
# Then navigate to: exp://localhost:8081/--/storybook
```

Or use the dedicated Storybook screen in your app.

## Testing Strategy

1. **Visual Testing**: Use Storybook to verify appearance
2. **Interaction Testing**: Test on iOS Simulator + Android Emulator
3. **Performance**: Profile with React DevTools
4. **Accessibility**: Test with screen readers (VoiceOver, TalkBack)

## Checklist for Each Component

- [ ] Replace `<div>`, `<span>`, `<button>` with RN equivalents
- [ ] Convert `className` to `style` with StyleSheet
- [ ] Update icons from `lucide-react` → `lucide-react-native`
- [ ] Replace shadcn/ui components with custom components
- [ ] Add `<ScrollView>` if content may overflow
- [ ] Update event handlers (`onClick` → `onPress`)
- [ ] Create `.stories.tsx` file
- [ ] Run `npm run storybook-generate`
- [ ] Test on iOS and Android
- [ ] Verify Solarized Dark theme consistency

## Example: Complete Migration

See `mobile/components/cards/TaskCardBig.tsx` for a complete example of migrating:
- `frontend/src/components/mobile/cards/TaskCardBig.tsx` (Web)
- → `mobile/components/cards/TaskCardBig.tsx` (React Native)

Key changes:
1. ✅ Replaced `Card`, `CardHeader`, etc. with custom RN components
2. ✅ Converted all Tailwind classes to StyleSheet
3. ✅ Updated `lucide-react` → `lucide-react-native`
4. ✅ Converted `onClick` → `onPress`
5. ✅ Added proper TypeScript types
6. ✅ Created comprehensive Storybook stories

## Need Help?

- 📖 [React Native Docs](https://reactnative.dev/docs/getting-started)
- 📖 [Storybook React Native Docs](https://github.com/storybookjs/react-native)
- 📖 [Expo Docs](https://docs.expo.dev/)
- 💬 Ask in project Discord/Slack

## Next Steps

1. Migrate high-priority components first (TaskCardBig, CaptureModal)
2. Build shared UI component library (`mobile/components/ui/`)
3. Set up automated visual regression testing
4. Document design system in Storybook
