# Mobile App Documentation

## 📱 Expo/React Native Universal App (PRIMARY FRONTEND)

This directory contains documentation for the **Proxy Agent Platform mobile app** - the primary user interface built with Expo and React Native.

### Quick Links

- **[Mobile App Code](../../mobile/)** - Source code for the mobile app
- **[Setup Guide](../../mobile/README.md)** - Installation and setup instructions
- **[Expo Migration Plan](../../EXPO_MIGRATION_PLAN.md)** - Complete migration roadmap

---

## 🎯 Overview

The mobile app is a **universal React Native application** that runs on:
- **iOS**: Native app via App Store
- **Android**: Native app via Google Play Store
- **Web**: Progressive Web App via browser

### Why Mobile-First?

The Proxy Agent Platform is designed for **ADHD productivity** with a mobile-first approach:

✅ **2-Second Task Capture**: Instant task input without context switching
✅ **Always Available**: Phone is always in your pocket
✅ **Gesture-Based**: Swipe, tap, pinch - natural interactions
✅ **Native Performance**: 60 FPS animations, instant feedback
✅ **Offline Support**: Works without internet connection
✅ **Real-time Sync**: Seamless synchronization across devices

---

## 🏗️ Architecture

### File-Based Routing (Expo Router)

The app uses Expo Router for type-safe, file-based navigation:

```
mobile/
├── app/
│   ├── _layout.tsx              # Root layout with SafeAreaProvider
│   ├── index.tsx                # Entry point (redirects to capture)
│   └── (tabs)/                  # Tab navigation group
│       ├── _layout.tsx          # Tab bar configuration
│       ├── capture.tsx          # ⚡ Capture Mode
│       ├── scout.tsx            # 🔍 Scout Mode
│       ├── today.tsx            # 📅 Today Mode
│       ├── mapper.tsx           # 🗺️ Mapper Mode
│       └── hunter.tsx           # 🎯 Hunter Mode
```

### 5 Biological Workflow Modes

The app implements **5 cognitive modes** optimized for ADHD:

1. **⚡ Capture Mode** - Quick task capture without overthinking
2. **🔍 Scout Mode** - Explore and filter tasks, smart recommendations
3. **📅 Today Mode** - Hyper-focus on current tasks only
4. **🗺️ Mapper Mode** - Visual task landscape and dependencies
5. **🎯 Hunter Mode** - Deep work execution with timers

Each mode has its own:
- **Color scheme**: Solarized Dark with mode-specific accent colors
- **Icon**: Distinctive emoji for quick recognition
- **Purpose**: Clear cognitive goal and workflow
- **Optimizations**: ADHD-friendly UX patterns

---

## 🎨 Design System

### Solarized Dark Theme

All screens use the **Solarized Dark** color palette for ADHD-friendly contrast:

```typescript
const colors = {
  base03: '#002b36',  // Background
  base02: '#073642',  // Tab bar background
  base01: '#586e75',  // Inactive elements
  base0: '#839496',   // Body text
  base1: '#93a1a1',   // Subtitle text

  // Mode-specific accent colors
  cyan: '#2aa198',    // Capture mode
  blue: '#268bd2',    // Scout mode
  yellow: '#b58900',  // Today mode
  violet: '#6c71c4',  // Mapper mode
  orange: '#cb4b16',  // Hunter mode
}
```

### Design Principles

- **4px Grid System**: All spacing in multiples of 4 (8, 12, 16, 24)
- **Large Touch Targets**: 44px minimum for easy tapping
- **Generous Spacing**: Reduces visual clutter for ADHD users
- **High Contrast**: Solarized Dark provides excellent readability
- **Consistent Typography**: Clear hierarchy with semibold labels

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
cd mobile
npm install

# Start dev server
npm start

# Platform-specific commands
npm run web      # Web browser (fastest)
npm run ios      # iOS simulator (macOS only)
npm run android  # Android emulator
```

### Testing

```bash
# Web (fastest for iteration)
npm run web

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Physical Device
npm start
# Then scan QR code with Expo Go app
```

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

---

## 📚 Documentation Structure

### Core Documentation

- **[Mobile README](../../mobile/README.md)** - Quick start and overview
- **[Expo Migration Plan](../../EXPO_MIGRATION_PLAN.md)** - Detailed migration roadmap
- **[Design Principles](../frontend/DESIGN_PRINCIPLES.md)** - ADHD-optimized UX patterns

### Phase-by-Phase Migration

The mobile app is being built in **6 phases** over 6 weeks:

1. **Phase 1: Basic Structure** ✅ Complete
   - Expo setup with TypeScript
   - 5 biological mode screens
   - Tab navigation with Expo Router
   - Solarized Dark theme

2. **Phase 2: Design System Port** (Week 2)
   - Port design tokens to StyleSheet API
   - Create semantic color hooks
   - Port System components

3. **Phase 3: Storybook Setup** (Week 2)
   - Install `@storybook/react-native`
   - Port existing stories
   - On-device story browser

4. **Phase 4: Component Migration** (Weeks 3-5)
   - Port 5 biological mode components
   - Port task cards and lists
   - Port modals and overlays

5. **Phase 5: Animations** (Weeks 5-6)
   - Install React Native Reanimated
   - Port Framer Motion animations
   - Implement gestures

6. **Phase 6: API Integration** (Week 6)
   - Connect to backend
   - Zustand state management
   - Offline support with AsyncStorage

---

## 🔗 Related Documentation

### Backend Integration

- **[API Reference](../api/API_REFERENCE.md)** - Backend API endpoints
- **[Mobile API Endpoints](../../proxy_agent_platform/mobile/)** - Mobile-specific APIs

### Web Dashboard (Secondary Frontend)

- **[Frontend README](../../frontend/README.md)** - Next.js web dashboard
- **[Web Developer Guide](../frontend/DEVELOPER_GUIDE.md)** - Web-specific development

### Project Documentation

- **[Repository Structure](../REPOSITORY_STRUCTURE.md)** - Overall project organization
- **[Tech Stack](../TECH_STACK.md)** - Technology choices and rationale
- **[Installation Guide](../installation.md)** - Full setup instructions

---

## 🛠️ Development Tools

### Required Tools

- **Node.js 20+**: JavaScript runtime
- **npm or yarn**: Package manager
- **Expo CLI**: Development server
- **Xcode** (macOS only): iOS simulator
- **Android Studio**: Android emulator

### Recommended VS Code Extensions

- **Expo Tools**: Expo-specific features
- **React Native Tools**: Debugging and IntelliSense
- **Prettier**: Code formatting
- **ESLint**: Linting

### Debugging

```bash
# Web: Chrome DevTools
npm run web
# Then open Chrome DevTools

# iOS: Safari Web Inspector
npm run ios
# Safari → Develop → Simulator

# Android: Chrome DevTools
npm run android
# Chrome → chrome://inspect
```

---

## 📊 Performance

### Target Metrics

- **App Launch**: < 2 seconds cold start
- **Task Capture**: < 2 seconds from tap to save
- **Animation FPS**: 60 FPS sustained
- **API Response**: < 500ms backend roundtrip
- **Bundle Size**: < 10 MB initial download

### Optimization Strategies

- **React Native Reanimated**: 60 FPS animations on UI thread
- **Hermes Engine**: Faster startup, lower memory
- **Memoization**: React.memo and useMemo for expensive renders
- **Lazy Loading**: Load screens on demand
- **Image Optimization**: WebP format, progressive loading

---

## 🆘 Troubleshooting

### Common Issues

**Metro bundler won't start**
```bash
# Clear cache and restart
rm -rf node_modules
npm install
npm start --clear
```

**iOS simulator not launching**
```bash
# Check Xcode installation
xcode-select --install

# Reset simulator
xcrun simctl erase all
```

**Android emulator issues**
```bash
# Check Android SDK
echo $ANDROID_HOME

# Start emulator manually
emulator -list-avds
emulator -avd Pixel_5_API_31
```

**Build errors**
```bash
# Clear Expo cache
expo start --clear

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Next Steps

### For New Developers

1. **Read [Mobile README](../../mobile/README.md)** - Understand the basics
2. **Run the app**: `cd mobile && npm start`
3. **Explore the code**: Start with `app/_layout.tsx`
4. **Read [Expo Migration Plan](../../EXPO_MIGRATION_PLAN.md)** - See the roadmap
5. **Join development**: Pick a task from Phase 2-6

### For Contributors

- **Report Issues**: [GitHub Issues](https://github.com/yourusername/proxy-agent-platform/issues)
- **Suggest Features**: [Discussions](https://github.com/yourusername/proxy-agent-platform/discussions)
- **Submit PRs**: Follow the contribution guide

---

**Built with ⚡ by the Proxy Agent Platform team**

*Universal mobile app for ADHD productivity*
