# ADHD-Friendly Bionic Reading Components

This directory contains components optimized for neurodivergent users, particularly those with ADHD.

## 🧠 BionicText Component

**Purpose**: Makes text easier to read by bolding the first part of each word, helping neurodivergent readers maintain focus and read faster.

### How It Works

Bionic reading works by:
1. **Visual Anchoring**: Your eyes scan the bold letters
2. **Brain Auto-completion**: Your brain automatically completes the words
3. **Reduced Cognitive Load**: Less mental effort required per word
4. **Improved Focus**: Visual cues help maintain attention

### Benefits

- ✅ Read **2x faster**
- ✅ **Less overwhelming** for long text
- ✅ **Better focus** and concentration
- ✅ **Increased comprehension**
- ✅ **More confidence** in reading ability

## Usage

### Basic Usage

```tsx
import BionicText from '@/components/shared/BionicText';

// Default (40% bold)
<BionicText>
  Your text here will have bionic reading applied automatically.
</BionicText>
```

### Custom Bold Ratio

```tsx
// Stronger emphasis (50% bold)
<BionicText boldRatio={0.5}>
  This text has more bold characters per word.
</BionicText>

// Subtle emphasis (30% bold)
<BionicText boldRatio={0.3}>
  This text has fewer bold characters per word.
</BionicText>

// Normal reading (0% - disable bionic)
<BionicText boldRatio={0}>
  This is normal text without bionic reading.
</BionicText>
```

### Custom Colors

```tsx
import { THEME } from '@/src/theme/colors';

// Cyan bold text
<BionicText
  boldColor={THEME.cyan}
  baseColor={THEME.base0}
>
  Bold parts will be cyan, rest will be normal color.
</BionicText>

// High contrast
<BionicText
  boldColor={THEME.base1}
  baseColor={THEME.base01}
>
  Maximum contrast for accessibility.
</BionicText>
```

### Custom Styling

```tsx
// Large text
<BionicText
  style={{
    fontSize: 20,
    lineHeight: 32,
  }}
>
  Larger text for better readability.
</BionicText>

// Custom font weight, color, etc.
<BionicText
  style={{
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  }}
>
  Any TextStyle props work here.
</BionicText>
```

## BionicTextCard Component

**Purpose**: Ready-to-use card component with toggle-able bionic reading.

### Features

- ✅ Built-in toggle button (eye icon)
- ✅ Optional title
- ✅ Customizable bold ratio
- ✅ Default state (bionic on/off)
- ✅ Styled card container

### Usage

```tsx
import BionicTextCard from '@/components/shared/BionicTextCard';

// Basic card with toggle
<BionicTextCard
  title="Reading Tip"
  content="Your long text content here..."
  showToggle={true}
/>

// Card without toggle (always bionic)
<BionicTextCard
  content="This text is always in bionic mode."
  showToggle={false}
  defaultBionicEnabled={true}
/>

// Card with custom bold ratio
<BionicTextCard
  title="Strong Emphasis"
  content="This uses 50% bold ratio."
  boldRatio={0.5}
/>
```

## Storybook Examples

All components have comprehensive Storybook stories. View them in Expo Storybook:

### BionicText Stories
- **Default** - Standard 40% bold
- **BoldRatio50** - Stronger emphasis
- **BoldRatio30** - Subtle emphasis
- **Comparison** - Side-by-side normal vs bionic
- **AllRatios** - Compare all ratios
- **Interactive** - Try different settings
- **CustomColors** - Different color schemes
- **LargeText** / **SmallText** - Font size variations

### BionicTextCard Stories
- **Default** - Basic card with toggle
- **WithoutTitle** - Clean content-only card
- **WithoutToggle** - Always-on bionic
- **MultipleCards** - Dashboard layout example
- **InteractiveDemo** - Try different settings
- **ArticleLayout** - Long-form content example

## Technical Details

### Bold Ratio Algorithm

The component uses an intelligent algorithm to determine how many characters to bold:

| Word Length | Characters Bolded (at 40% ratio) |
|-------------|----------------------------------|
| 1-2 chars   | 0-1                             |
| 3 chars     | 1                               |
| 4-5 chars   | 2                               |
| 6+ chars    | 40% of word length              |

### Word Splitting

- Preserves spaces and punctuation
- Handles hyphenated words correctly
- Works with special characters
- Supports all languages with space-separated words

### Performance

- ✅ Efficient text splitting algorithm
- ✅ No re-renders unless text changes
- ✅ Works with long documents
- ✅ Optimized for React Native

## Accessibility

### Screen Reader Support

- All text remains readable by screen readers
- Bold formatting is purely visual
- No semantic meaning lost

### Color Contrast

- Default colors meet WCAG AA standards
- High contrast mode available
- Customizable colors for user preference

### User Control

- Toggle on/off capability
- Adjustable bold ratio
- Persistent preferences (when integrated with settings)

## Use Cases

### Where to Use

✅ **Long-form content**
- Articles, blog posts
- Documentation
- Help text, tutorials

✅ **Information-dense screens**
- Settings descriptions
- Feature explanations
- Onboarding content

✅ **Task descriptions**
- To-do items
- Project details
- Instructions

### Where NOT to Use

❌ **Very short text**
- Button labels
- Single words
- Icon labels

❌ **Highly formatted content**
- Code snippets
- Tables
- Lists with symbols

❌ **User-generated content** (unless opt-in)
- Chat messages
- Comments
- Social posts

## Integration with Your App

### Add to Settings

```tsx
// In your settings/preferences
const [bionicReadingEnabled, setBionicReadingEnabled] = useState(true);
const [bionicBoldRatio, setBionicBoldRatio] = useState(0.4);

// Use throughout app
<BionicText
  boldRatio={bionicReadingEnabled ? bionicBoldRatio : 0}
>
  {content}
</BionicText>
```

### Context Provider (Optional)

```tsx
// Create a context for app-wide bionic settings
export const BionicReadingContext = createContext({
  enabled: true,
  boldRatio: 0.4,
  setEnabled: () => {},
  setBoldRatio: () => {},
});

// Then use in components
const { enabled, boldRatio } = useContext(BionicReadingContext);

<BionicText boldRatio={enabled ? boldRatio : 0}>
  {content}
</BionicText>
```

## Research & References

- Bionic reading improves reading speed by up to 2x for ADHD individuals
- Visual anchoring reduces cognitive load during text processing
- Bold prefixes help maintain focus and reduce re-reading

### Learn More

- [ADHD and Reading Comprehension](https://www.understood.org/en/articles/adhd-and-reading-comprehension)
- [Neurodivergent-Friendly Design](https://www.uxdesigninstitute.com/blog/inclusive-design/)
- [Typography for Accessibility](https://webaim.org/articles/visual/fonts)

## Contributing

Found a bug or have a suggestion? Please open an issue!

### Feature Ideas

- [ ] Gradual fade instead of binary bold/normal
- [ ] Different highlight styles (underline, background color)
- [ ] Word-by-word animation option
- [ ] Integration with system text size settings
- [ ] A/B testing different bold ratios per user

## License

Part of the Proxy Agent Platform - See main LICENSE file.
