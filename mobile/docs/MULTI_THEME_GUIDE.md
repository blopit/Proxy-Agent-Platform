# Multi-Theme System Guide

**Last Updated**: November 13, 2025

The Proxy Agent Platform now supports **6 beautiful themes** optimized for different preferences and accessibility needs.

---

## 🎨 Available Themes

### 1. Solarized Dark (Default)
- **Best for**: Long coding sessions, ADHD focus
- **Description**: Warm, low-contrast dark theme that reduces eye strain
- **Color Temperature**: Warm
- **Contrast**: Low (intentionally)
- **Use Case**: Default, all-day use

### 2. Solarized Light
- **Best for**: Daytime work, bright environments
- **Description**: Inverted Solarized palette for light mode
- **Color Temperature**: Warm
- **Contrast**: Low
- **Use Case**: Outdoor use, bright offices

### 3. Nord
- **Best for**: Calming focus, reducing stress
- **Description**: Cool, arctic-inspired theme with calming blues
- **Color Temperature**: Cool
- **Contrast**: Medium
- **Use Case**: Stress reduction, evening work

### 4. Dracula
- **Best for**: High-energy focus sessions
- **Description**: Vibrant, high-contrast theme with punchy colors
- **Color Temperature**: Neutral
- **Contrast**: High
- **Use Case**: Hunter mode, deep work sessions

### 5. Catppuccin Mocha
- **Best for**: Aesthetic pleasure, gentle on eyes
- **Description**: Soft, warm pastel colors in a dark theme
- **Color Temperature**: Warm
- **Contrast**: Medium
- **Use Case**: Relaxed work, creative sessions

### 6. High Contrast
- **Best for**: Vision accessibility, outdoor use
- **Description**: Maximum contrast for WCAG AAA accessibility
- **Color Temperature**: Neutral
- **Contrast**: Maximum
- **Use Case**: Low vision, bright sunlight, accessibility

---

## 🚀 Quick Start

### Using ThemeSwitcher Component

```tsx
import { ThemeSwitcherButton } from '@/components/ui/ThemeSwitcher';

function SettingsScreen() {
  return (
    <View>
      <Text>Settings</Text>
      <ThemeSwitcherButton />
    </View>
  );
}
```

### Using Theme in Components

```tsx
import { useTheme } from '@/src/theme/ThemeContext';

function MyComponent() {
  const { colors, themeName, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: colors.base03 }}>
      <Text style={{ color: colors.base0 }}>
        Current theme: {themeName}
      </Text>
      <Text style={{ color: colors.cyan }}>
        This is cyan accent color
      </Text>
    </View>
  );
}
```

### Programmatic Theme Switching

```tsx
import { useTheme } from '@/src/theme/ThemeContext';

function MyComponent() {
  const { setTheme } = useTheme();

  const switchToNord = async () => {
    await setTheme('nord');
  };

  const switchToDracula = async () => {
    await setTheme('dracula');
  };

  return (
    <View>
      <Button title="Nord Theme" onPress={switchToNord} />
      <Button title="Dracula Theme" onPress={switchToDracula} />
    </View>
  );
}
```

---

## 🎯 Theme Colors Reference

Each theme provides these standardized color keys:

### Background Colors
- `base03` - Background highlights
- `base02` - Background (elevated surfaces)
- `base01` - Optional emphasized content
- `base00` - Body text / primary content
- `base0` - Comments / secondary content
- `base1` - De-emphasized content
- `base2` - Background highlights (light mode)
- `base3` - Background (light mode)

### Accent Colors
- `cyan` - Capture mode, primary actions
- `blue` - Scout mode, information
- `violet` - Mapper mode, navigation
- `green` - Success, Today mode
- `yellow` - Warnings, highlights
- `orange` - Hunter mode, important
- `red` - Errors, danger
- `magenta` - Special emphasis

---

## 🔧 Theme Context API

### `useTheme()` Hook

Returns:
```typescript
{
  themeName: ThemeName;          // e.g., 'solarized-dark'
  theme: Theme;                  // Full theme object
  colors: Theme['colors'];       // Color palette
  fonts: typeof FONTS;           // Font family map
  setTheme: (name) => Promise<void>;  // Change theme
  isDark: boolean;               // Is dark theme?
}
```

### ThemeName Type

```typescript
type ThemeName =
  | 'solarized-dark'
  | 'solarized-light'
  | 'nord'
  | 'dracula'
  | 'catppuccin-mocha'
  | 'high-contrast';
```

---

## 📱 Theme Persistence

Themes are **automatically saved** to AsyncStorage and restored on app launch.

**Storage Key**: `@proxy_agent_theme`

### Manual Persistence Check

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get saved theme
const savedTheme = await AsyncStorage.getItem('@proxy_agent_theme');
console.log('Saved theme:', savedTheme);

// Clear saved theme (reset to default)
await AsyncStorage.removeItem('@proxy_agent_theme');
```

---

## 🎨 Adding Custom Themes

### 1. Define Theme in `themes.ts`

```typescript
// mobile/src/theme/themes.ts

export const MY_CUSTOM_THEME: Theme = {
  name: 'my-custom',
  displayName: 'My Custom Theme',
  description: 'A unique theme for my needs',
  colors: {
    base03: '#1a1a1a',
    base02: '#2a2a2a',
    base01: '#555555',
    base00: '#ffffff',
    base0: '#eeeeee',
    base1: '#cccccc',
    base2: '#333333',
    base3: '#111111',
    yellow: '#ffcc00',
    orange: '#ff8800',
    red: '#ff4444',
    magenta: '#ff00ff',
    violet: '#8844ff',
    blue: '#4488ff',
    cyan: '#00ccff',
    green: '#44ff88',
  },
};
```

### 2. Add to Theme Registry

```typescript
// Add type
export type ThemeName =
  | 'solarized-dark'
  | 'solarized-light'
  | 'nord'
  | 'dracula'
  | 'catppuccin-mocha'
  | 'high-contrast'
  | 'my-custom';  // ← Add here

// Add to registry
export const THEMES: Record<ThemeName, Theme> = {
  // ... existing themes
  'my-custom': MY_CUSTOM_THEME,
};
```

### 3. Add to Storybook Toolbar

```typescript
// mobile/.rnstorybook/preview.tsx

globalTypes: {
  theme: {
    toolbar: {
      items: [
        // ... existing items
        { value: 'my-custom', title: 'My Custom', icon: 'star' },
      ],
    },
  },
}
```

---

## 🧪 Testing Themes in Storybook

### Run Storybook
```bash
cd mobile
npm run storybook
```

### Switch Themes in Storybook
1. Open Storybook in your app
2. Navigate to **UI → ThemeSwitcher**
3. Use the toolbar theme selector (paintbrush icon)
4. All stories will update with the new theme

### Theme Preview Story

The `ThemePreview` story shows all colors in the current theme:
- Background colors (base03, base02)
- Text colors (base0, base01)
- All 8 accent colors
- Sample UI components

---

## 🎯 Best Practices

### 1. Always Use Theme Colors

```tsx
// ❌ Bad: Hardcoded colors
<View style={{ backgroundColor: '#002b36' }}>
  <Text style={{ color: '#839496' }}>Text</Text>
</View>

// ✅ Good: Theme colors
const { colors } = useTheme();
<View style={{ backgroundColor: colors.base03 }}>
  <Text style={{ color: colors.base0 }}>Text</Text>
</View>
```

### 2. Use Semantic Names

```tsx
// ✅ Good: Semantic usage
<Text style={{ color: colors.cyan }}>Primary Action</Text>
<Text style={{ color: colors.red }}>Error Message</Text>
<Text style={{ color: colors.green }}>Success</Text>
```

### 3. Respect Dark/Light Mode

```tsx
const { isDark, colors } = useTheme();

// Adjust opacity based on theme
const shadowStyle = {
  shadowColor: isDark ? '#000' : '#999',
  shadowOpacity: isDark ? 0.5 : 0.3,
};
```

### 4. Test All Themes

When creating components:
1. Test in Storybook with all 6 themes
2. Ensure contrast is readable in all themes
3. Check accent colors work in context
4. Verify High Contrast theme is accessible

---

## 🔍 Troubleshooting

### Theme Not Changing

```tsx
// ✅ Make sure you're using useTheme() hook
const { colors } = useTheme();

// ❌ Don't import colors directly
import { THEME } from '@/src/theme/colors'; // Won't update
```

### Colors Look Wrong

```tsx
// Check if you're wrapping in ThemeProvider
// In app/_layout.tsx:
<ThemeProvider initialTheme="solarized-dark">
  {children}
</ThemeProvider>
```

### Theme Not Persisting

```typescript
// Check AsyncStorage permissions
import AsyncStorage from '@react-native-async-storage/async-storage';

// Test storage
await AsyncStorage.setItem('@test', 'value');
const test = await AsyncStorage.getItem('@test');
console.log('Storage working:', test === 'value');
```

---

## 📊 Theme Comparison

| Theme | Contrast | Energy | Use Case | Temperature |
|-------|----------|--------|----------|-------------|
| Solarized Dark | Low | Calm | All-day coding | Warm |
| Solarized Light | Low | Neutral | Bright environments | Warm |
| Nord | Medium | Very Calm | Stress reduction | Cool |
| Dracula | High | High | Focus sessions | Neutral |
| Catppuccin | Medium | Gentle | Creative work | Warm |
| High Contrast | Maximum | Neutral | Accessibility | Neutral |

---

## 🎨 Design Guidelines

### When to Use Each Theme

**Solarized Dark**: Default for most users, best for ADHD focus, long sessions

**Solarized Light**: Outdoor use, very bright rooms, user preference

**Nord**: Users who find warm colors distracting, evening work, stress relief

**Dracula**: Hunter mode (deep work), users who prefer high contrast without accessibility needs

**Catppuccin Mocha**: Aesthetic preference, users who love pastels, creative work

**High Contrast**: Vision impairment, bright sunlight, high accessibility requirements

### Color Psychology

- **Warm themes** (Solarized, Catppuccin): Cozy, comfortable, long sessions
- **Cool themes** (Nord): Calming, focus, reduce anxiety
- **High contrast** (Dracula, High Contrast): Alertness, energy, clarity

---

## 🚀 Future Enhancements

Possible additions:
- [ ] Auto-switch based on time of day
- [ ] Auto-switch based on battery level
- [ ] Per-mode themes (different theme for each biological mode)
- [ ] Theme scheduling (Solarized Light 9am-5pm, Nord 5pm-midnight)
- [ ] Energy-level based theme switching
- [ ] Custom theme creator UI

---

## 📚 Resources

- [Solarized Color Scheme](https://ethanschoonover.com/solarized/)
- [Nord Theme](https://www.nordtheme.com/)
- [Dracula Theme](https://draculatheme.com/)
- [Catppuccin](https://github.com/catppuccin/catppuccin)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Navigation**: [↑ Mobile README](../README.md) | [📚 Storybook Guide](./STORYBOOK_GUIDE.md) | [🎨 Design System](../../docs/frontend/DESIGN_SYSTEM.md)
