# Lexend Font Implementation Guide

This guide explains how to use the Lexend font family throughout the mobile app.

## Overview

Lexend is now the default font family for the entire mobile app. It provides excellent readability and is specifically designed to improve reading proficiency.

## Quick Start

### Using the Custom Text Component

The easiest way to use Lexend is through the custom `Text` component:

```tsx
import { Text } from '@/src/components/ui/Text';

// Regular text (Lexend-Regular)
<Text>This is regular text</Text>

// Bold text (Lexend-Bold)
<Text weight="bold">This is bold text</Text>

// Semi-bold text (Lexend-SemiBold)
<Text weight="600">This is semi-bold text</Text>

// Light text (Lexend-Light)
<Text weight="300">This is light text</Text>

// Styled text
<Text style={{ fontSize: 20, color: '#268bd2' }}>
  Large blue text
</Text>
```

### Available Font Weights

The `weight` prop supports the following values:
- `'100'` - Thin
- `'200'` - ExtraLight
- `'300'` - Light
- `'400'` or `'normal'` - Regular (default)
- `'500'` - Medium
- `'600'` - SemiBold
- `'700'` or `'bold'` - Bold
- `'800'` - ExtraBold
- `'900'` - Black

## Using Fonts Directly in StyleSheet

If you need to apply fonts directly in a `StyleSheet`:

```tsx
import { StyleSheet } from 'react-native';
import { FONT_FAMILY } from '@/src/theme/fonts';

const styles = StyleSheet.create({
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
  },
  caption: {
    fontFamily: FONT_FAMILY.light,
    fontSize: 12,
  },
});
```

## Using Fonts from Theme Context

Access fonts through the theme context:

```tsx
import { useTheme } from '@/src/theme/ThemeContext';

function MyComponent() {
  const { fonts } = useTheme();

  return (
    <Text style={{ fontFamily: fonts.semiBold }}>
      Semi-bold text using theme
    </Text>
  );
}
```

## Font Family Constants

Import font families directly:

```tsx
import { FONT_FAMILY, DEFAULT_FONT_FAMILY } from '@/src/theme/fonts';

// Available constants:
FONT_FAMILY.thin           // 'Lexend-Thin'
FONT_FAMILY.extraLight     // 'Lexend-ExtraLight'
FONT_FAMILY.light          // 'Lexend-Light'
FONT_FAMILY.regular        // 'Lexend-Regular'
FONT_FAMILY.medium         // 'Lexend-Medium'
FONT_FAMILY.semiBold       // 'Lexend-SemiBold'
FONT_FAMILY.bold           // 'Lexend-Bold'
FONT_FAMILY.extraBold      // 'Lexend-ExtraBold'
FONT_FAMILY.black          // 'Lexend-Black'

DEFAULT_FONT_FAMILY        // 'Lexend-Regular'
```

## Helper Functions

### getFontFamily(weight)

Get the appropriate font family based on weight:

```tsx
import { getFontFamily } from '@/src/theme/fonts';

const fontFamily = getFontFamily('600'); // Returns 'Lexend-SemiBold'
const fontFamily2 = getFontFamily('bold'); // Returns 'Lexend-Bold'
```

## Best Practices

1. **Use the Custom Text Component**: Always prefer `<Text>` from `@/src/components/ui/Text` over React Native's `<Text>`.

2. **Consistent Weight Usage**:
   - Regular (400): Body text
   - Medium (500): Emphasized text
   - SemiBold (600): Section headers
   - Bold (700): Main titles

3. **Avoid Native Text**: Don't use React Native's native `Text` component directly as it won't have Lexend applied by default.

4. **Type Safety**: Use TypeScript's auto-completion for weight props and font family constants.

## Implementation Details

### Files Created/Modified

- ✅ `src/theme/fonts.ts` - Font configuration and constants
- ✅ `src/components/ui/Text.tsx` - Custom Text component with Lexend
- ✅ `app/_layout.tsx` - Font loading with expo-font
- ✅ `src/theme/ThemeContext.tsx` - Added fonts to theme context
- ✅ `src/theme/colors.ts` - Exported font constants

### Packages Installed

```json
{
  "expo-font": "^12.0.0",
  "@expo-google-fonts/lexend": "^0.2.3"
}
```

## Troubleshooting

### Fonts Not Loading

If fonts aren't appearing:

1. Check that the app is showing the loading spinner while fonts load
2. Verify `expo-font` and `@expo-google-fonts/lexend` are installed
3. Clear the cache: `expo start --clear`

### TypeScript Errors

If you see TypeScript errors, ensure your imports are correct:

```tsx
import { Text } from '@/src/components/ui/Text'; // ✅ Correct
import { Text } from 'react-native'; // ❌ Don't use this
```

### Font Weight Not Changing

Remember: In React Native, `fontWeight` style prop won't work with custom fonts. Use the `weight` prop on the custom `Text` component or set `fontFamily` directly.

```tsx
// ❌ Won't work
<Text style={{ fontWeight: '600' }}>Text</Text>

// ✅ Use weight prop
<Text weight="600">Text</Text>

// ✅ Or use fontFamily directly
<Text style={{ fontFamily: FONT_FAMILY.semiBold }}>Text</Text>
```

## Examples

### Button Text
```tsx
<Text weight="600" style={{ fontSize: 16, color: '#268bd2' }}>
  Click Me
</Text>
```

### Section Header
```tsx
<Text weight="700" style={{ fontSize: 24, color: '#839496' }}>
  Section Title
</Text>
```

### Body Text
```tsx
<Text style={{ fontSize: 16, color: '#657b83', lineHeight: 24 }}>
  This is body text with default regular weight.
</Text>
```

### Caption
```tsx
<Text weight="300" style={{ fontSize: 12, color: '#586e75' }}>
  Caption text
</Text>
```

---

For more information about the Lexend font, visit: https://www.lexend.com/
