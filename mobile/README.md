# Proxy Agent Platform - Mobile App

Universal React Native app built with Expo for iOS, Android, and Web.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run web     # Web browser
npm run ios     # iOS simulator (macOS only)
npm run android # Android emulator
```

### View Storybook

Access the component library and design system:

```bash
# Start Expo
npm start

# Navigate to Storybook in your app
# URL: exp://localhost:8081/--/storybook

# Or regenerate stories after adding new components
npm run storybook-generate
```

## Project Structure

```
mobile/
├── app/                        # Expo Router file-based routing
│   ├── _layout.tsx            # Root layout with SafeAreaProvider
│   ├── index.tsx              # Redirects to /(tabs)/capture
│   ├── storybook.tsx          # Storybook route (/storybook)
│   └── (tabs)/                # Tab navigation group
│       ├── _layout.tsx        # Tab bar configuration
│       ├── capture/           # ⚡ Capture Mode
│       ├── scout.tsx          # 🔍 Scout Mode
│       ├── today.tsx          # 📅 Today Mode
│       ├── mapper.tsx         # 🗺️ Mapper Mode
│       └── hunter.tsx         # 🎯 Hunter Mode
├── components/                # React Native components
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Card.tsx           # Card component (replaces shadcn)
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   ├── cards/                 # Card components
│   │   ├── TaskCardBig.tsx
│   │   └── TaskCardBig.stories.tsx
│   ├── modals/                # Modal components
│   └── modes/                 # Mode-specific components
├── .rnstorybook/              # Storybook React Native config
│   ├── main.ts
│   ├── preview.tsx
│   └── stories/               # Example stories
├── assets/                    # Images, fonts, icons
├── docs/                      # Documentation and guides
│   ├── STORYBOOK_GUIDE.md     # Storybook usage guide
│   └── archive/               # Historical progress reports
├── metro.config.js            # Metro bundler + Storybook integration
└── package.json
```

## Architecture

### Expo Router (File-Based Navigation)

This app uses [Expo Router](https://docs.expo.dev/router/introduction/) for navigation:

- **File-based routing**: Each file in `app/` becomes a route
- **Tab navigation**: `(tabs)/` creates a bottom tab navigator
- **Type-safe**: Full TypeScript support
- **Deep linking**: Automatic URL scheme support

### Biological Workflow Modes

The app implements 5 cognitive modes optimized for ADHD productivity:

1. **⚡ Capture Mode** - Quick task capture without overthinking
2. **🔍 Scout Mode** - Explore and filter tasks, smart recommendations
3. **📅 Today Mode** - Hyper-focus on current tasks only
4. **🗺️ Mapper Mode** - Visual task landscape and dependencies
5. **🎯 Hunter Mode** - Deep work execution with timers

Each mode has its own screen in `app/(tabs)/`.

## Design System

### Solarized Dark Theme

All screens use the Solarized Dark color palette for ADHD-friendly contrast:

```typescript
const colors = {
  base03: '#002b36',  // Background
  base02: '#073642',  // Tab bar background
  base01: '#586e75',  // Inactive elements
  base0: '#839496',   // Body text
  base1: '#93a1a1',   // Subtitle text
  cyan: '#2aa198',    // Capture mode accent
  blue: '#268bd2',    // Scout mode accent
  yellow: '#b58900',  // Today mode accent
  violet: '#6c71c4',  // Mapper mode accent
  orange: '#cb4b16',  // Hunter mode accent
};
```

### Typography & Spacing

- **4px grid system**: All spacing in multiples of 4 (8, 12, 16, 24, etc.)
- **Font sizes**: 12 (label), 14 (body), 18 (subtitle), 32 (title), 72 (emoji)
- **Font weights**: 600 (semibold labels), 'bold' (titles)

## Storybook Component Library

This app uses **Storybook React Native** for component development and testing.

### Why Separate Storybooks?

The platform has TWO Storybooks:

1. **Next.js Storybook** (`frontend/.storybook/`) - Web dashboard components
2. **React Native Storybook** (`mobile/.rnstorybook/`) - Mobile app components ← **You are here**

They CANNOT share components due to platform differences (web uses HTML/CSS, mobile uses React Native primitives).

### Using Storybook

**Option 1: View in App**

```bash
npm start
# Navigate to /storybook in your Expo app
# URL: exp://localhost:8081/--/storybook
```

**Option 2: Access via Route**

The Storybook UI is available at the `/storybook` route in the app. You can navigate to it from any screen or add a dev menu button.

### Creating New Stories

1. Create a component in `components/`:

```tsx
// components/ui/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export function Button({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#2aa198', padding: 12, borderRadius: 8 },
  text: { color: '#002b36', fontWeight: '600' },
});
```

2. Create a story file:

```tsx
// components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Click Me',
  },
};
```

3. Regenerate stories list:

```bash
npm run storybook-generate
```

4. Restart Expo to see your new story!

### Component Development

**Key React Native differences:**
- `<div>` → `<View>`
- `<span>`/`<p>` → `<Text>`
- `className` → `style` (StyleSheet)
- `lucide-react` → `lucide-react-native`
- shadcn/ui → Custom components (see `components/ui/`)

## Development

### Hot Reload

Expo provides fast refresh for instant updates:

- **iOS**: Shake device → "Reload"
- **Android**: Double-tap R key
- **Web**: Automatic refresh

### Testing

```bash
# Run on web (fastest for iteration)
npm run web

# Test on iOS simulator
npm run ios

# Test on Android emulator
npm run android

# Test on physical device
npm start
# Scan QR code with Expo Go app
```

### Environment

- **Node**: 20.x or later
- **Expo SDK**: 54.x
- **React**: 19.1.0
- **React Native**: 0.81.5
- **TypeScript**: 5.9.2

## Current Status (November 2025)

### ✅ Completed

#### Backend Integration (100%)
- ✅ 40+ API endpoints functional and tested
- ✅ 696/803 backend tests passing (86.7%)
- ✅ All 7 mobile screens have backend API support
- ✅ User filtering added to mobile endpoints
- ✅ Capture API working end-to-end

#### App Foundation (100%)
- ✅ Expo SDK 54 + React Native 0.81.5 setup
- ✅ Expo Router file-based navigation
- ✅ Tab navigation with 5 biological modes
- ✅ Solarized Dark theme system
- ✅ Universal deployment (iOS/Android/Web)

#### Core Screens (3/7 = 43%)
1. ✅ **Capture/Add** (580 lines) - Task input with AI breakdown
2. ✅ **Capture/Connect** - Gmail OAuth integration
3. ✅ **Capture/Clarify** (470 lines) - Q&A for task refinement
4. ⏭️ **Scout** - Task list view (NEXT CRITICAL)
5. ⏭️ **Hunter** - Focus mode execution
6. ⏭️ **Today** - Daily planning
7. ⏭️ **Mapper** - Visual task organization

#### Components (8/51 = 16%)
- ✅ Base UI: Card, Button, Badge
- ✅ Cards: TaskCardBig
- ✅ Core: ChevronButton, EnergyGauge, SimpleTabs
- ✅ Auth: Login, Signup screens
- ⏭️ 43 more components to migrate

#### Storybook (100%)
- ✅ React Native Storybook v10.0.2
- ✅ 57 stories across 8 components
- ✅ On-device component library
- ✅ Auto-generation working

#### Documentation (100%)
- ✅ Active documentation in `docs/` directory
- ✅ Storybook usage guide
- ✅ Historical progress reports archived

### ⏭️ Next Steps

#### Immediate (This Week)
- [ ] Migrate remaining 43 components to React Native
- [ ] Build Scout mode UI (task list)
- [ ] Add BiologicalTabs navigation component
- [ ] Create Storybook stories for all components

#### Short-term (Next 2 Weeks)
- [ ] Complete Hunter, Today, Mapper mode UIs
- [ ] Implement animations with react-native-reanimated
- [ ] Add state management (Zustand)
- [ ] Implement gesture handling

#### Long-term (Month 2)
- [ ] Offline support with AsyncStorage
- [ ] Push notifications
- [ ] Performance optimization
- [ ] App store deployment preparation

### Migration Progress
- **Components:** 8/51 (16%)
- **Screens:** 3/7 (43%)
- **Backend:** 100% ready
- **Storybook:** 100% setup
- **Estimated time remaining:** 80-100 hours

## Documentation

- **Storybook Guide**: [`docs/STORYBOOK_GUIDE.md`](./docs/STORYBOOK_GUIDE.md)
- **Progress Archive**: [`docs/archive/`](./docs/archive/2025-11-progress-reports/)
- **Project Docs**: [`../docs/`](../docs/) - Platform-wide documentation

## Resources

- **Expo Docs**: https://docs.expo.dev/
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **React Native**: https://reactnative.dev/

## Universal App Support

This app runs everywhere:

- **iOS**: Native app via App Store
- **Android**: Native app via Play Store
- **Web**: PWA via browser (http://localhost:8081)
- **All share the same codebase**: True code reuse!

---

Built with ⚡ by the Proxy Agent Platform team
