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

## Project Structure

```
mobile/
├── app/                        # Expo Router file-based routing
│   ├── _layout.tsx            # Root layout with SafeAreaProvider
│   ├── index.tsx              # Redirects to /(tabs)/capture
│   └── (tabs)/                # Tab navigation group
│       ├── _layout.tsx        # Tab bar configuration
│       ├── capture.tsx        # ⚡ Capture Mode
│       ├── scout.tsx          # 🔍 Scout Mode
│       ├── today.tsx          # 📅 Today Mode
│       ├── mapper.tsx         # 🗺️ Mapper Mode
│       └── hunter.tsx         # 🎯 Hunter Mode
├── assets/                    # Images, fonts, icons
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

## Next Steps (Per EXPO_MIGRATION_PLAN.md)

### Phase 2: Design System Port (Week 2)
- [ ] Port `design-system.ts` to StyleSheet API
- [ ] Create semantic color hooks
- [ ] Port System components (Button, Card, Input)

### Phase 3: Storybook Setup (Week 2)
- [ ] Install `@storybook/react-native`
- [ ] Port existing .stories.tsx files
- [ ] Set up on-device story browser

### Phase 4: Component Migration (Weeks 3-5)
- [ ] Port 5 biological mode components
- [ ] Port task cards and lists
- [ ] Port modals and overlays

### Phase 5: Animations (Weeks 5-6)
- [ ] Install React Native Reanimated
- [ ] Port Framer Motion animations to Reanimated
- [ ] Implement gestures with react-native-gesture-handler

### Phase 6: API Integration (Week 6)
- [ ] Connect to backend at http://localhost:8000
- [ ] Implement Zustand state management
- [ ] Add offline support with AsyncStorage

## Resources

- **Expo Docs**: https://docs.expo.dev/
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **React Native**: https://reactnative.dev/
- **Design Principles**: `../docs/frontend/DESIGN_PRINCIPLES.md`
- **Migration Plan**: `../EXPO_MIGRATION_PLAN.md`

## Universal App Support

This app runs everywhere:

- **iOS**: Native app via App Store
- **Android**: Native app via Play Store
- **Web**: PWA via browser (http://localhost:8081)
- **All share the same codebase**: True code reuse!

---

Built with ⚡ by the Proxy Agent Platform team
