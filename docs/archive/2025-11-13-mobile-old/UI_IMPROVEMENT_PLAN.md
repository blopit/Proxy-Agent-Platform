# 📱 Mobile App UI Improvement Plan

## 🎯 Current State Analysis

**Status**: Phase 1 Complete - Basic Structure
- ✅ 5 biological mode screens with placeholders
- ✅ Tab navigation with Solarized Dark theme
- ✅ File-based routing with Expo Router
- ❌ No interactive components yet
- ❌ No real data or API integration
- ❌ No animations or gestures

**Current Screens**: Static text + emoji placeholders

---

## 🚀 Priority 1: Core Interaction Components (Week 1-2)

### 1.1 Glass Morphism Design System ✨

Implement **standardized glassmorphism** across all modes for visual cohesion and ADHD-friendly clarity.

#### Glassmorphic Card Component
```typescript
// src/components/system/GlassCard.tsx
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  accentColor?: string;
  elevation?: number;
}

export function GlassCard({
  children,
  intensity = 'medium',
  accentColor = '#2aa198',
  elevation = 2
}: GlassCardProps) {
  const blurIntensity = {
    light: 20,
    medium: 40,
    heavy: 60,
  }[intensity];

  return (
    <View style={[styles.container, { shadowOpacity: elevation * 0.1 }]}>
      {/* Gradient border for glassmorphic effect */}
      <LinearGradient
        colors={[`${accentColor}40`, `${accentColor}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={styles.blur}
        >
          <View style={styles.content}>
            {children}
          </View>
        </BlurView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    ...Platform.select({
      android: { elevation: 4 },
    }),
  },
  gradientBorder: {
    padding: 1.5, // Border width
    borderRadius: 16,
  },
  blur: {
    borderRadius: 14.5,
    overflow: 'hidden',
  },
  content: {
    backgroundColor: 'rgba(7, 54, 66, 0.7)', // base02 with transparency
    padding: 20,
  },
});
```

#### Mode-Specific Color Palette
```typescript
// src/lib/mode-colors.ts
export const modeColors = {
  capture: {
    primary: '#2aa198',   // Cyan
    gradient: ['#2aa198', '#268bd2'],
    glass: 'rgba(42, 161, 152, 0.15)',
  },
  scout: {
    primary: '#268bd2',   // Blue
    gradient: ['#268bd2', '#6c71c4'],
    glass: 'rgba(38, 139, 210, 0.15)',
  },
  today: {
    primary: '#b58900',   // Yellow
    gradient: ['#b58900', '#cb4b16'],
    glass: 'rgba(181, 137, 0, 0.15)',
  },
  mapper: {
    primary: '#6c71c4',   // Violet
    gradient: ['#6c71c4', '#d33682'],
    glass: 'rgba(108, 113, 196, 0.15)',
  },
  hunter: {
    primary: '#cb4b16',   // Orange
    gradient: ['#cb4b16', '#dc322f'],
    glass: 'rgba(203, 75, 22, 0.15)',
  },
} as const;
```

### 1.2 Enhanced Capture Mode

**Goal**: 2-second task capture with zero friction

```typescript
// mobile/app/(tabs)/capture.tsx - IMPROVED VERSION
import { View, Text, TextInput, StyleSheet, Pressable, Keyboard } from 'react-native';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GlassCard } from '@/components/system/GlassCard';
import { HapticButton } from '@/components/system/HapticButton';
import { modeColors } from '@/lib/mode-colors';
import { Mic, Send, Sparkles } from 'lucide-react-native';

export default function CaptureScreen() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleCapture = async () => {
    if (!input.trim()) return;

    // TODO: API call to backend
    console.log('Capturing:', input);

    // Clear input and show success
    setInput('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>⚡</Text>
        <Text style={styles.title}>Quick Capture</Text>
        <Text style={styles.subtitle}>
          Brain dump without overthinking
        </Text>
      </View>

      {/* Main input card with glassmorphism */}
      <GlassCard
        accentColor={modeColors.capture.primary}
        intensity="medium"
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="What needs to be done?"
          placeholderTextColor="#586e75"
          multiline
          autoFocus
          maxLength={500}
          returnKeyType="done"
          blurOnSubmit
        />

        <View style={styles.inputFooter}>
          <Text style={styles.charCount}>
            {input.length}/500
          </Text>

          <View style={styles.actions}>
            {/* Voice input */}
            <Pressable
              style={[styles.iconButton, isRecording && styles.recordingActive]}
              onPress={() => setIsRecording(!isRecording)}
            >
              <Mic size={24} color={isRecording ? '#dc322f' : '#839496'} />
            </Pressable>

            {/* AI assist */}
            <Pressable style={styles.iconButton}>
              <Sparkles size={24} color="#839496" />
            </Pressable>
          </View>
        </View>
      </GlassCard>

      {/* Capture button */}
      <HapticButton
        onPress={handleCapture}
        disabled={!input.trim()}
        style={styles.captureButton}
        hapticType="impactMedium"
      >
        <Send size={24} color="#002b36" />
        <Text style={styles.captureButtonText}>
          Capture
        </Text>
      </HapticButton>

      {/* Recent captures preview */}
      <View style={styles.recents}>
        <Text style={styles.recentsTitle}>Recent Captures</Text>
        {/* TODO: Map recent tasks */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: modeColors.capture.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#93a1a1',
    textAlign: 'center',
  },
  input: {
    fontSize: 18,
    color: '#93a1a1',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(88, 110, 117, 0.3)',
  },
  charCount: {
    fontSize: 12,
    color: '#586e75',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(88, 110, 117, 0.2)',
  },
  recordingActive: {
    backgroundColor: 'rgba(220, 50, 47, 0.2)',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: modeColors.capture.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 24,
  },
  captureButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#002b36',
  },
  recents: {
    marginTop: 32,
  },
  recentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#93a1a1',
    marginBottom: 12,
  },
});
```

### 1.3 Scout Mode - Task Discovery

**Goal**: Netflix-style horizontal scrolling with categories

```typescript
// mobile/app/(tabs)/scout.tsx - IMPROVED VERSION
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GlassCard } from '@/components/system/GlassCard';
import { TaskCard } from '@/components/mobile/TaskCard';
import { CategoryRow } from '@/components/mobile/CategoryRow';
import { modeColors } from '@/lib/mode-colors';

export default function ScoutScreen() {
  // TODO: Fetch from API
  const categories = [
    { id: 'main-focus', title: '🔥 Main Focus', tasks: [] },
    { id: 'urgent', title: '⚡ Urgent Today', tasks: [] },
    { id: 'quick-wins', title: '🎯 Quick Wins', tasks: [] },
    { id: 'this-week', title: '📅 This Week', tasks: [] },
    { id: 'delegate', title: '🤖 Can Delegate', tasks: [] },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={styles.title}>Scout Mode</Text>
        <Text style={styles.subtitle}>
          Discover what to work on next
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview stats */}
        <GlassCard
          accentColor={modeColors.scout.primary}
          intensity="light"
        >
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Urgent</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Quick Wins</Text>
            </View>
          </View>
        </GlassCard>

        {/* Category rows */}
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            title={category.title}
            tasks={category.tasks}
            accentColor={modeColors.scout.primary}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: modeColors.scout.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#93a1a1',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: modeColors.scout.primary,
  },
  statLabel: {
    fontSize: 14,
    color: '#839496',
    marginTop: 4,
  },
});
```

---

## 🚀 Priority 2: Shared Component Library (Week 2-3)

### 2.1 Essential Components to Build

#### HapticButton
```typescript
// src/components/system/HapticButton.tsx
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success';
  disabled?: boolean;
  style?: any;
}

export function HapticButton({
  onPress,
  children,
  hapticType = 'light',
  disabled,
  style,
}: HapticButtonProps) {
  const handlePress = async () => {
    if (disabled) return;

    // Haptic feedback
    const hapticMap = {
      light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
      medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
      heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
      success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    };

    await hapticMap[hapticType]();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        style,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
```

#### TaskCard (for Scout mode)
```typescript
// src/components/mobile/TaskCard.tsx
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '@/components/system/GlassCard';
import { HapticButton } from '@/components/system/HapticButton';
import { Circle, CheckCircle } from 'lucide-react-native';

interface TaskCardProps {
  title: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: number;
  onComplete: () => void;
  accentColor: string;
}

export function TaskCard({
  title,
  priority,
  estimatedTime,
  onComplete,
  accentColor,
}: TaskCardProps) {
  const priorityColors = {
    low: '#859900',
    medium: '#b58900',
    high: '#dc322f',
  };

  return (
    <GlassCard accentColor={accentColor} intensity="light">
      <View style={styles.content}>
        <HapticButton onPress={onComplete} style={styles.checkbox}>
          <Circle size={24} color="#839496" />
        </HapticButton>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          <View style={styles.meta}>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: `${priorityColors[priority]}30` }
            ]}>
              <Text style={[
                styles.priorityText,
                { color: priorityColors[priority] }
              ]}>
                {priority.toUpperCase()}
              </Text>
            </View>

            {estimatedTime && (
              <Text style={styles.time}>
                ⏱️ {estimatedTime}min
              </Text>
            )}
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#93a1a1',
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    color: '#586e75',
  },
});
```

#### CategoryRow (horizontal scrolling)
```typescript
// src/components/mobile/CategoryRow.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TaskCard } from './TaskCard';

interface CategoryRowProps {
  title: string;
  tasks: any[];
  accentColor: string;
}

export function CategoryRow({ title, tasks, accentColor }: CategoryRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No tasks yet</Text>
          </View>
        ) : (
          tasks.map((task, index) => (
            <View key={task.id || index} style={styles.card}>
              <TaskCard
                {...task}
                accentColor={accentColor}
                onComplete={() => console.log('Complete:', task.id)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#93a1a1',
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  card: {
    width: 280,
  },
  empty: {
    width: 280,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(88, 110, 117, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(88, 110, 117, 0.3)',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#586e75',
  },
});
```

---

## 🚀 Priority 3: Animations & Polish (Week 3-4)

### 3.1 Page Transitions

```typescript
// Use Reanimated for smooth transitions
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn.duration(300)}
  exiting={FadeOut.duration(200)}
>
  {children}
</Animated.View>
```

### 3.2 Success Animations

```typescript
// src/components/animations/SuccessAnimation.tsx
import LottieView from 'lottie-react-native';

export function SuccessAnimation() {
  return (
    <LottieView
      source={require('@/assets/animations/success.json')}
      autoPlay
      loop={false}
      style={{ width: 200, height: 200 }}
    />
  );
}
```

### 3.3 Microinteractions

- **Button press**: Scale down + haptic feedback
- **Task completion**: Checkmark animation + success haptic
- **Swipe gestures**: Rubber-band effect
- **Pull to refresh**: Custom loading indicator

---

## 🎯 Summary: What to Build Next

### Immediate (This Week)
1. ✅ **GlassCard component** - Standardized glassmorphism
2. ✅ **HapticButton component** - Tactile feedback
3. ✅ **Enhanced Capture screen** - Real input functionality
4. ✅ **TaskCard component** - For Scout mode
5. ✅ **CategoryRow component** - Horizontal scrolling

### Next Week
6. **Scout Mode implementation** - Full task discovery UI
7. **Today Mode** - Single task focus
8. **API integration** - Connect to FastAPI backend
9. **State management** - Zustand store setup
10. **Loading states** - Skeleton screens

### Week 3-4
11. **Hunter Mode** - Swipeable cards with gestures
12. **Mapper Mode** - Progress visualization
13. **Animations** - Polish all interactions
14. **Haptics** - Complete haptic feedback system

---

## 💡 Key Improvements Over Current State

### Visual Consistency
- ✅ **Glassmorphism** across all modes
- ✅ **Mode-specific colors** for clear context
- ✅ **Consistent spacing** (4px grid)

### ADHD Optimizations
- ✅ **Large touch targets** (minimum 44px)
- ✅ **Immediate feedback** (haptics + visual)
- ✅ **Reduced overwhelm** (one focus per screen)
- ✅ **Clear visual hierarchy** (size + color + spacing)

### Technical Quality
- ✅ **Type-safe** components (TypeScript)
- ✅ **Reusable** design system
- ✅ **Platform-optimized** (iOS/Android/Web)
- ✅ **Performance** (60 FPS animations)

---

**Ready to implement?** Start with Priority 1 (glassmorphism + Capture mode) and we can iterate from there! 🚀
