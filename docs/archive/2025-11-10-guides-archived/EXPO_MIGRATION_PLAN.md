# 📱 Expo Migration Plan: React Native Universal App

**Goal:** Rebuild the Proxy Agent Platform as a universal app using Expo (iOS, Android, Web from one codebase)

**Current State:** Next.js web app with excellent mobile-first design principles
**Target State:** Expo app with React Native Web for universal deployment

---

## 🎯 Executive Summary

### Why Expo?
- ✅ **Universal:** iOS, Android, Web from one codebase
- ✅ **Developer Experience:** Fast refresh, easy setup, managed workflow
- ✅ **Mobile-First:** Native performance, gestures, animations
- ✅ **Rapid Prototyping:** Expo Go for instant testing
- ✅ **Built-in Features:** Push notifications, camera, sensors

### Migration Scope
| Category | Reusable | Rewrite | New |
|----------|----------|---------|-----|
| Design System | 80% | 20% | 0% |
| Business Logic | 95% | 5% | 0% |
| UI Components | 0% | 100% | 0% |
| Navigation | 0% | 0% | 100% |
| Animations | 10% | 90% | 0% |

**Estimated Effort:** 6-8 weeks for MVP (5 modes + core features)

---

## 📋 Phase 1: Project Setup (Week 1)

### 1.1 Initialize Expo Project
```bash
# Create new Expo project with TypeScript
npx create-expo-app@latest proxy-agent-mobile --template expo-template-blank-typescript

# Install dependencies
cd proxy-agent-mobile
npx expo install expo-router react-native-reanimated react-native-gesture-handler
npx expo install react-native-svg expo-linear-gradient expo-haptics
```

### 1.2 Configure Expo Router (File-based Navigation)
```
app/
  _layout.tsx           # Root layout
  (tabs)/              # Tab navigator
    _layout.tsx
    capture.tsx        # Capture Mode
    scout.tsx          # Scout Mode
    hunt.tsx           # Hunt Mode
    map.tsx            # Map Mode
    mend.tsx           # Mend Mode
  task/[id].tsx        # Task detail screen
  +not-found.tsx       # 404 screen
```

### 1.3 Setup Development Environment
- [ ] Configure EAS (Expo Application Services)
- [ ] Setup Expo Go on iOS/Android for testing
- [ ] Configure web build (`npx expo install react-native-web react-dom`)
- [ ] Setup TypeScript strict mode
- [ ] Configure ESLint + Prettier

### 1.4 Project Structure
```
proxy-agent-mobile/
├── app/                    # Expo Router (screens)
├── src/
│   ├── components/        # React Native components
│   │   ├── system/       # Design system primitives
│   │   ├── shared/       # Cross-platform shared components
│   │   ├── mobile/       # Mobile-specific components
│   │   └── modes/        # 5 biological modes
│   ├── lib/
│   │   ├── design-system.ts  # Port from Next.js (StyleSheet)
│   │   ├── api.ts            # API client
│   │   └── types.ts          # Shared TypeScript types
│   ├── hooks/            # Custom React hooks
│   ├── store/            # State management (Zustand)
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, icons
└── eas.json             # Expo Application Services config
```

---

## 📋 Phase 2: Design System Migration (Week 2)

### 2.1 Port Design Tokens to StyleSheet

**From (Tailwind CSS):**
```typescript
<div className="px-4 py-2 bg-primary rounded-lg" />
```

**To (React Native StyleSheet):**
```typescript
import { StyleSheet } from 'react-native';
import { spacing, colors, borderRadius } from '@/lib/design-system';

<View style={styles.container} />

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.base03,
    borderRadius: borderRadius.lg,
  },
});
```

### 2.2 Design System File Structure
```typescript
// src/lib/design-system.ts (PORT & ADAPT)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  // ... (same as Next.js)
};

export const colors = {
  base03: '#002b36',
  base02: '#073642',
  // ... (exact same as Next.js)
};

// NEW: Platform-specific utilities
export const shadows = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 4,
  },
  web: {
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
});
```

### 2.3 System Components (Design Primitives)

**Priority Order:**
1. [ ] **SystemButton** - Touchable with variants, sizes, states
2. [ ] **SystemCard** - Container with padding, borders, shadows
3. [ ] **SystemText** - Typography with semantic sizes
4. [ ] **SystemInput** - TextInput with labels, errors, icons
5. [ ] **SystemBadge** - Status indicators, pills
6. [ ] **SystemModal** - Bottom sheet / full screen modal

**Example: SystemButton**
```typescript
// src/components/system/SystemButton.tsx
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { spacing, colors, fontSize, borderRadius } from '@/lib/design-system';
import { hapticFeedback } from '@/lib/haptics';

interface SystemButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'error' | 'ghost';
  size: 'sm' | 'base' | 'lg';
  children: React.ReactNode;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SystemButton({ variant, size, children, onPress, isLoading, disabled }: SystemButtonProps) {
  const handlePress = () => {
    hapticFeedback('impactLight');
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.base3} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.cyan,
  },
  // ... more variants
  sm: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
  },
  base: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  lg: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
```

---

## 📋 Phase 3: Core Navigation & Structure (Week 2-3)

### 3.1 Tab Navigator (Bottom Bar)
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Zap, Search, Target, Map, Heart } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.base01,
        tabBarStyle: {
          backgroundColor: colors.base02,
          borderTopColor: colors.base01,
        },
      }}
    >
      <Tabs.Screen
        name="capture"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="scout" options={{ title: 'Scout', tabBarIcon: Search }} />
      <Tabs.Screen name="hunt" options={{ title: 'Hunt', tabBarIcon: Target }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: Map }} />
      <Tabs.Screen name="mend" options={{ title: 'Mend', tabBarIcon: Heart }} />
    </Tabs>
  );
}
```

### 3.2 Screen Structure (Example: Capture Mode)
```typescript
// app/(tabs)/capture.tsx
import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { SystemInput } from '@/components/system/SystemInput';
import { SystemButton } from '@/components/system/SystemButton';
import { QuickCapturePill } from '@/components/mobile/QuickCapturePill';
import { spacing, colors } from '@/lib/design-system';
import { useCaptureTask } from '@/hooks/useCaptureTask';

export default function CaptureScreen() {
  const [taskInput, setTaskInput] = useState('');
  const { captureTask, isLoading } = useCaptureTask();

  const handleCapture = async () => {
    await captureTask(taskInput);
    setTaskInput('');
  };

  return (
    <View style={styles.container}>
      <SystemInput
        value={taskInput}
        onChangeText={setTaskInput}
        placeholder="What needs to be done?"
        autoFocus
        multiline
        style={styles.input}
      />
      <SystemButton
        variant="primary"
        size="lg"
        onPress={handleCapture}
        isLoading={isLoading}
      >
        Capture Task
      </SystemButton>
      <QuickCapturePill />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base03,
    padding: spacing[4],
  },
  input: {
    flex: 1,
    marginBottom: spacing[4],
  },
});
```

---

## 📋 Phase 4: Component Migration (Week 3-5)

### 4.1 Migration Priority (By Biological Mode)

#### **Capture Mode Components** (Week 3)
- [ ] QuickCapturePill - Floating action button
- [ ] CaptureModal - Full screen input
- [ ] TaskBreakdownModal - Chevron view (port AsyncJobTimeline)
- [ ] CelebrationAnimation - Lottie or react-native-reanimated

#### **Scout Mode Components** (Week 4)
- [ ] TaskCard - Swipeable card (react-native-gesture-handler)
- [ ] FilterMatrix - Multi-select filter chips
- [ ] SmartRecommendations - AI suggestion cards
- [ ] WorkspaceOverview - Stats dashboard
- [ ] ZoneBalanceWidget - Visual balance indicator

#### **Hunt Mode Components** (Week 4)
- [ ] FocusTimer - Countdown with progress ring
- [ ] TaskDetail - Full screen task view
- [ ] CompletionButton - Large touch target with haptics
- [ ] DistractionBlocker - Overlay with "focus mode" message

#### **Map Mode Components** (Week 5)
- [ ] HierarchyTree - React Native tree view library
- [ ] ConnectionLines - SVG-based connections
- [ ] MapSubtabs - Segmented control (MAP / PLAN)
- [ ] MiniChevronNav - Horizontal scroll chevrons

#### **Mend Mode Components** (Week 5)
- [ ] ProgressVisualization - Recharts alternative (Victory Native)
- [ ] AchievementGallery - Horizontal scroll + cards
- [ ] EnergyGauge - Circular progress indicator
- [ ] ReflectionPrompts - Card-based journaling

### 4.2 Shared Components (Week 3-5)
- [ ] **AsyncJobTimeline** - SVG chevrons (react-native-svg)
- [ ] **ProgressBar** - Animated progress (react-native-reanimated)
- [ ] **TaskCheckbox** - Custom checkbox with animation
- [ ] **OpenMoji** - PNG fallback (no SVG in RN core)

---

## 📋 Phase 5: Animations & Gestures (Week 5-6)

### 5.1 Replace Framer Motion with Reanimated
```typescript
// Before (Framer Motion - Web)
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {content}
</motion.div>

// After (React Native Reanimated)
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut}>
  {content}
</Animated.View>
```

### 5.2 Gesture Support
```typescript
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

// Swipeable Task Card
const translateX = useSharedValue(0);

const panGesture = Gesture.Pan()
  .onChange((event) => {
    translateX.value = event.translationX;
  })
  .onEnd(() => {
    if (translateX.value > 100) {
      // Complete task (swipe right)
      completeTask();
    } else if (translateX.value < -100) {
      // Delete task (swipe left)
      deleteTask();
    }
    translateX.value = withSpring(0);
  });

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

### 5.3 Haptic Feedback
```typescript
// src/lib/haptics.ts
import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
  impactLight: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  impactMedium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  impactHeavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

// Usage
<SystemButton
  onPress={() => {
    hapticFeedback.success();
    completeTask();
  }}
>
  Complete
</SystemButton>
```

---

## 📋 Phase 6: API Integration & State Management (Week 6)

### 6.1 API Client (Reusable from Next.js)
```typescript
// src/lib/api.ts (PORT FROM NEXT.JS)
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export async function fetchTasks(userId: string) {
  const response = await fetch(`${API_URL}/api/v1/tasks?user_id=${userId}`);
  return response.json();
}

export async function captureTask(title: string, userId: string) {
  const response = await fetch(`${API_URL}/api/v1/tasks/capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, user_id: userId }),
  });
  return response.json();
}
```

### 6.2 State Management with Zustand
```typescript
// src/store/taskStore.ts
import { create } from 'zustand';
import { fetchTasks, captureTask } from '@/lib/api';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  loadTasks: (userId: string) => Promise<void>;
  captureTask: (title: string, userId: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  isLoading: false,
  loadTasks: async (userId) => {
    set({ isLoading: true });
    const data = await fetchTasks(userId);
    set({ tasks: data.tasks, isLoading: false });
  },
  captureTask: async (title, userId) => {
    await captureTask(title, userId);
    // Refresh tasks
    const data = await fetchTasks(userId);
    set({ tasks: data.tasks });
  },
}));
```

---

## 📋 Phase 7: Testing & Polish (Week 7-8)

### 7.1 Platform-Specific Adjustments
- [ ] iOS SafeAreaView for notches
- [ ] Android StatusBar color
- [ ] Web responsive breakpoints
- [ ] Keyboard handling (KeyboardAvoidingView)

### 7.2 Performance Optimization
- [ ] FlatList for long task lists (virtualization)
- [ ] Image optimization with expo-image
- [ ] Bundle size analysis
- [ ] Lazy loading screens

### 7.3 Native Features
- [ ] Push notifications (expo-notifications)
- [ ] Local notifications for reminders
- [ ] Haptic feedback throughout
- [ ] Dark mode support (useColorScheme)

### 7.4 Testing
- [ ] Unit tests with Jest
- [ ] Component tests with React Native Testing Library
- [ ] E2E tests with Detox or Maestro
- [ ] Manual testing on iOS/Android/Web

---

## 📋 Phase 8: Deployment (Week 8)

### 8.1 Build & Deploy
```bash
# iOS Build
eas build --platform ios --profile production

# Android Build
eas build --platform android --profile production

# Web Deployment (Vercel/Netlify)
npx expo export:web
# Deploy dist/ folder
```

### 8.2 App Store Preparation
- [ ] App Store screenshots (iOS)
- [ ] Play Store screenshots (Android)
- [ ] App descriptions
- [ ] Privacy policy
- [ ] Terms of service

---

## 🎯 Migration Checklist

### ✅ **What Transfers Directly** (Little/No Changes)
- [x] Design principles (ADHD-optimized UX)
- [x] Design tokens (colors, spacing, typography)
- [x] API client logic
- [x] TypeScript types
- [x] Business logic (state management)
- [x] Documentation (design principles, component specs)

### 🔄 **What Needs Port/Adaptation** (Moderate Changes)
- [ ] Design system (Tailwind → StyleSheet)
- [ ] Component structure (div → View, className → style)
- [ ] Navigation (Next.js → Expo Router)
- [ ] Animations (Framer Motion → Reanimated)
- [ ] Icons (lucide-react → lucide-react-native)

### 🆕 **What Needs New Implementation** (Major Changes)
- [ ] All UI components (React Native primitives)
- [ ] Gesture handlers (swipe, long-press)
- [ ] Native features (haptics, notifications)
- [ ] Platform-specific code (iOS vs Android)

---

## 📊 Effort Estimation

| Phase | Duration | Complexity | Team Size |
|-------|----------|------------|-----------|
| 1. Setup | 3-5 days | Low | 1 dev |
| 2. Design System | 5-7 days | Medium | 1 dev |
| 3. Navigation | 3-5 days | Low | 1 dev |
| 4. Components | 15-20 days | High | 2 devs |
| 5. Animations | 5-7 days | Medium | 1 dev |
| 6. API & State | 3-5 days | Low | 1 dev |
| 7. Testing | 5-7 days | Medium | 2 devs |
| 8. Deployment | 2-3 days | Low | 1 dev |

**Total:** 41-59 days (6-8 weeks with 1-2 developers)

---

## 🚀 Quick Start

```bash
# 1. Clone repo
git clone <repo-url>
cd proxy-agent-mobile

# 2. Install dependencies
npm install

# 3. Start Expo dev server
npx expo start

# 4. Test on device
# Scan QR code with Expo Go app (iOS/Android)
# Or press 'w' for web browser
```

---

## 📚 Key Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "^3.5.0",
    "react-native": "0.73.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-svg": "14.1.0",
    "zustand": "^4.5.0",
    "lucide-react-native": "^0.292.0",
    "expo-haptics": "~13.0.0",
    "expo-linear-gradient": "~13.0.0"
  }
}
```

---

## 🎓 Learning Resources

**Expo Documentation:**
- https://docs.expo.dev/
- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/develop/user-interface/animation/

**React Native:**
- https://reactnative.dev/docs/getting-started
- https://docs.swmansion.com/react-native-reanimated/
- https://docs.swmansion.com/react-native-gesture-handler/

**Design:**
- Port DESIGN_PRINCIPLES.md as-is (95% compatible)
- Adapt examples from div → View, className → style

---

## ⚠️ Important Notes

1. **Design System is Portable** - Your design tokens (colors, spacing, typography) transfer 1:1
2. **ADHD Principles Stay** - Large touch targets, clear feedback, minimal friction all work in RN
3. **Component Library Rebuild** - All UI components need React Native primitives
4. **Web Still Works** - Expo can deploy to web, but won't have Next.js SSR/SSG benefits
5. **Native Performance** - True native apps (iOS/Android) with better gestures and animations

---

**Next Steps:**
1. Review this plan
2. Choose MVP scope (which modes to build first)
3. Initialize Expo project
4. Start with Phase 1-2 (setup + design system)

*Generated: 2025-10-31*
*Estimated Timeline: 6-8 weeks*
*Status: Ready to begin*
