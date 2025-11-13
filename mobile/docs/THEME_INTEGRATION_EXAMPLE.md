# Theme Integration Examples

Quick examples of how to add theme switching to your app screens.

---

## 1. Add to Settings Screen

```tsx
// app/(tabs)/you.tsx or settings screen

import { ThemeSwitcherButton } from '@/components/ui/ThemeSwitcher';
import { useTheme } from '@/src/theme/ThemeContext';

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: colors.base03 }}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.base0 }]}>
          Appearance
        </Text>
        <ThemeSwitcherButton />
      </View>
    </ScrollView>
  );
}
```

---

## 2. Add to Dev Menu

```tsx
// app/dev.tsx (already exists)

import { ThemeSwitcherButton } from '@/components/ui/ThemeSwitcher';
import { useTheme } from '@/src/theme/ThemeContext';

export default function DevScreen() {
  const { colors, themeName } = useTheme();

  return (
    <ScrollView style={{ backgroundColor: colors.base03 }}>
      {/* ... existing dev tools ... */}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.cyan }]}>
          🎨 Theme Settings
        </Text>
        <Text style={[styles.subtitle, { color: colors.base01 }]}>
          Current: {themeName}
        </Text>
        <ThemeSwitcherButton />
      </View>
    </ScrollView>
  );
}
```

---

## 3. Quick Theme Toggle (Floating Button)

```tsx
import { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useTheme } from '@/src/theme/ThemeContext';
import { Palette } from 'lucide-react-native';

export function FloatingThemeButton() {
  const [visible, setVisible] = useState(false);
  const { colors } = useTheme();

  return (
    <>
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.cyan }]}
        onPress={() => setVisible(true)}
      >
        <Palette size={24} color={colors.base03} />
      </TouchableOpacity>

      <ThemeSwitcher visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
```

---

## 4. Theme Preview in Onboarding

```tsx
// app/(auth)/onboarding/appearance.tsx

import { useTheme } from '@/src/theme/ThemeContext';
import { THEMES, ThemeName } from '@/src/theme/themes';
import { TouchableOpacity, View, Text } from 'react-native';

export default function AppearanceOnboarding() {
  const { setTheme, themeName, colors } = useTheme();

  const quickThemes: ThemeName[] = [
    'solarized-dark',
    'nord',
    'dracula',
    'high-contrast',
  ];

  return (
    <View style={{ backgroundColor: colors.base03, flex: 1 }}>
      <Text style={[styles.title, { color: colors.base0 }]}>
        Choose Your Theme
      </Text>

      <Text style={[styles.subtitle, { color: colors.base01 }]}>
        You can change this anytime in settings
      </Text>

      <View style={styles.grid}>
        {quickThemes.map((name) => {
          const theme = THEMES[name];
          const isSelected = name === themeName;

          return (
            <TouchableOpacity
              key={name}
              style={[
                styles.themeCard,
                { backgroundColor: colors.base02 },
                isSelected && { borderColor: colors.cyan, borderWidth: 2 },
              ]}
              onPress={() => setTheme(name)}
            >
              {/* Color preview */}
              <View style={styles.colorRow}>
                <View style={[styles.dot, { backgroundColor: theme.colors.cyan }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.blue }]} />
                <View style={[styles.dot, { backgroundColor: theme.colors.violet }]} />
              </View>

              <Text style={[styles.themeName, { color: colors.base0 }]}>
                {theme.displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
```

---

## 5. Automatic Theme Based on Energy Level

```tsx
import { useEffect } from 'react';
import { useTheme } from '@/src/theme/ThemeContext';
import { ThemeName } from '@/src/theme/themes';

export function useEnergyBasedTheme(energyLevel: number) {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Auto-switch theme based on energy
    if (energyLevel > 80) {
      setTheme('dracula'); // High energy = high contrast
    } else if (energyLevel > 50) {
      setTheme('solarized-dark'); // Medium energy = default
    } else if (energyLevel > 20) {
      setTheme('nord'); // Low energy = calming
    } else {
      setTheme('catppuccin-mocha'); // Very low = gentle
    }
  }, [energyLevel]);
}

// Usage:
export default function HunterScreen() {
  const [energy, setEnergy] = useState(75);

  // Optional: Auto-switch themes based on energy
  // useEnergyBasedTheme(energy);

  return (
    // ... your component
  );
}
```

---

## 6. Time-Based Auto Theme

```tsx
import { useEffect } from 'react';
import { useTheme } from '@/src/theme/ThemeContext';

export function useTimeBasedTheme() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      // Morning: Light theme
      setTheme('solarized-light');
    } else if (hour >= 12 && hour < 18) {
      // Afternoon: Default dark
      setTheme('solarized-dark');
    } else if (hour >= 18 && hour < 22) {
      // Evening: Calming
      setTheme('nord');
    } else {
      // Night: Gentle
      setTheme('catppuccin-mocha');
    }
  }, []);
}

// Usage in app/_layout.tsx:
export default function RootLayout() {
  // Optional: Auto-switch based on time
  // useTimeBasedTheme();

  return (
    <ThemeProvider>
      {/* ... rest of app */}
    </ThemeProvider>
  );
}
```

---

## 7. Simple Theme Toggle (Dark/Light)

```tsx
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { Moon, Sun } from 'lucide-react-native';

export function SimpleThemeToggle() {
  const { themeName, setTheme, colors, isDark } = useTheme();

  const toggle = () => {
    setTheme(isDark ? 'solarized-light' : 'solarized-dark');
  };

  return (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: colors.base02 }]}
      onPress={toggle}
    >
      {isDark ? (
        <Sun size={20} color={colors.yellow} />
      ) : (
        <Moon size={20} color={colors.violet} />
      )}
      <Text style={[styles.text, { color: colors.base0 }]}>
        {isDark ? 'Light' : 'Dark'}
      </Text>
    </TouchableOpacity>
  );
}
```

---

## 8. Per-Mode Themes (Advanced)

```tsx
// Different theme for each biological mode
import { useTheme } from '@/src/theme/ThemeContext';
import { useEffect } from 'react';

export function useModeTheme(mode: 'capture' | 'scout' | 'today' | 'hunter' | 'mapper') {
  const { setTheme } = useTheme();

  useEffect(() => {
    switch (mode) {
      case 'capture':
        setTheme('solarized-dark'); // Quick capture
        break;
      case 'scout':
        setTheme('nord'); // Calming exploration
        break;
      case 'today':
        setTheme('solarized-light'); // Bright focus
        break;
      case 'hunter':
        setTheme('dracula'); // High energy
        break;
      case 'mapper':
        setTheme('catppuccin-mocha'); // Gentle reflection
        break;
    }
  }, [mode]);
}
```

---

## Quick Integration Checklist

- [ ] Add `ThemeSwitcherButton` to settings/you screen
- [ ] Test all 6 themes in your existing components
- [ ] Update hardcoded colors to use `colors` from `useTheme()`
- [ ] Test in Storybook with theme toolbar
- [ ] Consider adding to dev menu for quick testing
- [ ] Optional: Add automatic theme switching features

---

**Next Steps**: See [MULTI_THEME_GUIDE.md](./MULTI_THEME_GUIDE.md) for complete documentation.
