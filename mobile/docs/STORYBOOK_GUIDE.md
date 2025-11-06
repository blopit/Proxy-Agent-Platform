# Storybook Component Stories Guide

## Creating New Storybook Stories for React Native Components

This guide explains how to create comprehensive Storybook stories for your React Native components in the mobile app.

## Table of Contents

- [Quick Start](#quick-start)
- [Story Structure](#story-structure)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [BionicText Integration](#bionictext-integration)
- [Interactive Stories](#interactive-stories)
- [Web Loader Setup](#web-loader-setup)
- [Examples](#examples)

---

## Quick Start

### 1. Create Story File

Create a `.stories.tsx` file next to your component:

```
components/
  YourComponent.tsx
  YourComponent.stories.tsx  ← Create this file
```

### 2. Basic Story Template

```typescript
/**
 * YourComponent Stories - Brief description
 * Explain what variations are shown
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import YourComponent from './YourComponent';
import { THEME } from '../../src/theme/colors';
import BionicText from '../shared/BionicText';

const meta = {
  title: 'Category/YourComponent',  // Category: UI, Core, Shared, etc.
  component: YourComponent,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof YourComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default - Basic Example
 * Description of what this story demonstrates
 */
export const Default: Story = {
  args: {
    // Component props
    title: 'Example',
    onPress: () => console.log('Pressed'),
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: THEME.base03,
  },
});
```

### 3. Add to Web Loader

Edit `mobile/.rnstorybook/index.web.ts`:

```typescript
// Add import
import * as YourComponentStories from '../components/category/YourComponent.stories';

// Add to stories object
const stories = {
  // ... existing stories
  './category/YourComponent.stories.tsx': YourComponentStories,
};
```

### 4. Update Documentation

Edit `mobile/STORYBOOK_WEB_SETUP.md`:

```markdown
### Current Stories (X total):  ← Increment count

```
components/category/YourComponent.stories.tsx  ← Add your story
```
```

---

## Story Structure

### File Naming

- **Convention**: `ComponentName.stories.tsx`
- **Location**: Same directory as component
- **Examples**:
  - `Button.stories.tsx`
  - `BiologicalTabs.stories.tsx`
  - `ConnectionElement.stories.tsx`

### Story Categories

Organize stories by type in the `title` field:

- **UI**: Basic UI components (`UI/Button`, `UI/Card`)
- **Core**: Core functionality (`Core/ChevronStep`, `Core/BiologicalTabs`)
- **Shared**: Shared utilities (`Shared/BionicText`, `Shared/BionicTextCard`)
- **Auth**: Authentication (`Auth/LoginScreen`, `Auth/SocialLoginButton`)
- **Connections**: Connection components (`Connections/ConnectionElement`)
- **Mapper**: Mapper-specific (`Mapper/ProfileSwitcher`)

### Story Naming Pattern

Use descriptive names with documentation comments:

```typescript
/**
 * High Priority - Urgent Tasks
 * Red border for high-priority content
 */
export const HighPriority: Story = {
  args: {
    variant: 'high-priority',
  },
};
```

---

## Best Practices

### 1. Create Multiple Variants

Show all possible states:

```typescript
// ✅ Good: Multiple variants
export const Default: Story = { ... };
export const Loading: Story = { ... };
export const Error: Story = { ... };
export const Empty: Story = { ... };
export const Success: Story = { ... };

// ❌ Bad: Only one story
export const Default: Story = { ... };
```

### 2. Use Documentation Comments

Every story should have a comment explaining what it shows:

```typescript
/**
 * Interactive Example - User Control
 * Demonstrates real-time tab switching with state
 */
export const Interactive: Story = {
  render: () => { ... }
};
```

### 3. Include Interactive Examples

At least one story should be interactive:

```typescript
/**
 * Interactive Connection Flow - Simulated OAuth
 * Shows realistic connection flow with state transitions
 */
export const InteractiveFlow: Story = {
  render: () => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');

    const handleConnect = () => {
      setStatus('connecting');
      setTimeout(() => {
        setStatus('connected');
      }, 2000);
    };

    return (
      <ConnectionElement
        status={status}
        onConnect={handleConnect}
      />
    );
  },
};
```

### 4. Use BionicText for Labels

Integrate BionicText for ADHD-friendly reading:

```typescript
<BionicText style={styles.title} boldRatio={0.5}>
  Section Title
</BionicText>

<BionicText style={styles.description}>
  Longer description text benefits from bionic reading.
</BionicText>
```

### 5. Follow Solarized Theme

Always use THEME colors from `src/theme/colors`:

```typescript
import { THEME } from '../../src/theme/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.base03,  // Background
  },
  text: {
    color: THEME.base0,  // Normal text
  },
  accent: {
    color: THEME.cyan,  // Accent color
  },
});
```

---

## Common Patterns

### Pattern 1: Simple Args Story

Best for basic prop variations:

```typescript
export const Primary: Story = {
  args: {
    variant: 'primary',
    text: 'Click Me',
    onPress: () => console.log('Pressed'),
  },
};
```

### Pattern 2: Render Function Story

Best for complex layouts or multiple components:

```typescript
export const AllVariants: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Component variant="primary" />
        <Component variant="secondary" />
        <Component variant="tertiary" />
      </View>
    </ScrollView>
  ),
};
```

### Pattern 3: Interactive Story

Best for demonstrating user interactions:

```typescript
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('initial');

    return (
      <View>
        <BionicText>Current Value: {value}</BionicText>
        <Component
          value={value}
          onChange={setValue}
        />
      </View>
    );
  },
};
```

### Pattern 4: Comparison Story

Best for showing differences side-by-side:

```typescript
export const Comparison: Story = {
  render: () => (
    <ScrollView>
      <BionicText style={styles.title}>Before</BionicText>
      <ComponentOld />

      <BionicText style={styles.title}>After</BionicText>
      <ComponentNew />
    </ScrollView>
  ),
};
```

---

## BionicText Integration

### When to Use BionicText

✅ **Use for**:
- Story titles and section headers
- Descriptions and explanations
- Labels for story sections
- Long-form content in stories

❌ **Don't use for**:
- The component being demonstrated (unless it's a text component)
- Very short labels (1-2 words)
- Code snippets

### BionicText Examples

```typescript
// Section title with strong emphasis
<BionicText style={styles.sectionTitle} boldRatio={0.5}>
  Understanding Biological Modes
</BionicText>

// Description with default ratio (40%)
<BionicText style={styles.description}>
  Each mode is optimized for different energy levels and cognitive states.
  The system automatically suggests the best mode based on time of day.
</BionicText>

// Subtle emphasis for metadata
<BionicText style={styles.label} boldRatio={0.3}>
  Energy Level: {energy}%
</BionicText>
```

### BionicText Props Reference

```typescript
interface BionicTextProps {
  children: string;              // Text content
  boldRatio?: number;            // 0-1, default 0.4 (40% bold)
  baseColor?: string;            // Color for normal text
  boldColor?: string;            // Color for bold text
  style?: TextStyle;             // React Native text styles
}
```

---

## Interactive Stories

### State Management Pattern

```typescript
export const Interactive: Story = {
  render: () => {
    // 1. Define state
    const [activeTab, setActiveTab] = useState('scout');
    const [energy, setEnergy] = useState(75);

    // 2. Define handlers
    const handleEnergyChange = (newEnergy: number) => {
      setEnergy(Math.max(0, Math.min(100, newEnergy)));
    };

    // 3. Render with controls
    return (
      <View style={styles.container}>
        {/* Component being demonstrated */}
        <YourComponent
          activeTab={activeTab}
          energy={energy}
          onTabChange={setActiveTab}
        />

        {/* Interactive controls */}
        <View style={styles.controls}>
          <BionicText>Energy: {energy}%</BionicText>
          <Button onPress={() => handleEnergyChange(energy - 10)}>
            -10%
          </Button>
          <Button onPress={() => handleEnergyChange(energy + 10)}>
            +10%
          </Button>
        </View>
      </View>
    );
  },
};
```

### Alert/Console Logging

For non-interactive demos:

```typescript
export const WithActions: Story = {
  args: {
    onPress: () => Alert.alert('Button Pressed'),
    onLongPress: () => console.log('Long press'),
  },
};
```

---

## Web Loader Setup

### Step 1: Add Import

In `mobile/.rnstorybook/index.web.ts`:

```typescript
// Alphabetical order by category, then component name
import * as BiologicalTabsStories from '../components/core/BiologicalTabs.stories';
import * as BionicTextStories from '../components/shared/BionicText.stories';
import * as ButtonStories from '../components/ui/Button.stories';
import * as YourComponentStories from '../components/category/YourComponent.stories';  // ← Add
```

### Step 2: Add to Stories Object

```typescript
const stories = {
  './core/BiologicalTabs.stories.tsx': BiologicalTabsStories,
  './shared/BionicText.stories.tsx': BionicTextStories,
  './ui/Button.stories.tsx': ButtonStories,
  './category/YourComponent.stories.tsx': YourComponentStories,  // ← Add
};
```

### Step 3: Update Documentation

In `mobile/STORYBOOK_WEB_SETUP.md`:

1. Update story count in title
2. Add your story path to the list (alphabetical order)

```markdown
### Current Stories (16 total):  ← Increment

```
components/category/YourComponent.stories.tsx  ← Add here (alphabetical)
```
```

---

## Examples

### Example 1: Simple Component with Variants

```typescript
/**
 * Button Stories - Button component variations
 * Shows all button variants and states
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, Alert } from 'react-native';
import Button from './Button';
import { THEME } from '../../src/theme/colors';

const meta = {
  title: 'UI/Button',
  component: Button,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary - Default Button
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
    onPress: () => Alert.alert('Pressed'),
  },
};

/**
 * Secondary - Outlined Style
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
    onPress: () => Alert.alert('Pressed'),
  },
};

/**
 * Disabled - Non-Interactive
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    children: 'Disabled Button',
    disabled: true,
    onPress: () => Alert.alert('Should not fire'),
  },
};

/**
 * All Variants - Comparison
 */
export const AllVariants: Story = {
  render: () => (
    <View style={styles.variantsContainer}>
      <Button variant="primary" onPress={() => {}}>
        Primary
      </Button>
      <Button variant="secondary" onPress={() => {}}>
        Secondary
      </Button>
      <Button variant="danger" onPress={() => {}}>
        Danger
      </Button>
      <Button variant="primary" disabled onPress={() => {}}>
        Disabled
      </Button>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: THEME.base03,
  },
  variantsContainer: {
    gap: 12,
  },
});
```

### Example 2: Complex Component with BionicText

```typescript
/**
 * ProfileCard Stories - User profile display
 * Shows profile information with different states
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import ProfileCard from './ProfileCard';
import { THEME } from '../../src/theme/colors';
import BionicText from '../shared/BionicText';

const meta = {
  title: 'User/ProfileCard',
  component: ProfileCard,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - Basic Profile
 */
export const Default: Story = {
  args: {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
};

/**
 * All States - State Comparison
 */
export const AllStates: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.statesContainer}>
        <BionicText style={styles.sectionTitle} boldRatio={0.5}>
          Profile States
        </BionicText>

        <View style={styles.stateSection}>
          <BionicText style={styles.stateLabel}>Active User</BionicText>
          <ProfileCard
            name="Active User"
            email="active@example.com"
            status="active"
          />
        </View>

        <View style={styles.stateSection}>
          <BionicText style={styles.stateLabel}>Away</BionicText>
          <ProfileCard
            name="Away User"
            email="away@example.com"
            status="away"
          />
        </View>

        <View style={styles.stateSection}>
          <BionicText style={styles.stateLabel}>Offline</BionicText>
          <ProfileCard
            name="Offline User"
            email="offline@example.com"
            status="offline"
          />
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Interactive - Editable Profile
 */
export const Interactive: Story = {
  render: () => {
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john@example.com');

    return (
      <View>
        <BionicText style={styles.description}>
          Edit the profile information below
        </BionicText>

        <ProfileCard
          name={name}
          email={email}
          editable
          onNameChange={setName}
          onEmailChange={setEmail}
        />
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: THEME.base03,
  },
  scrollView: {
    flex: 1,
  },
  statesContainer: {
    paddingBottom: 40,
  },
  stateSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 16,
  },
  stateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.cyan,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: THEME.base01,
    marginBottom: 16,
  },
});
```

---

## Checklist for New Stories

- [ ] Created `.stories.tsx` file next to component
- [ ] Added meta configuration with proper title category
- [ ] Added decorator with THEME.base03 background
- [ ] Created at least 3-5 story variants
- [ ] Added documentation comments for each story
- [ ] Included at least one interactive example
- [ ] Used BionicText for titles and descriptions
- [ ] Used THEME colors consistently
- [ ] Imported story in `mobile/.rnstorybook/index.web.ts`
- [ ] Added story path to stories object
- [ ] Updated story count in `STORYBOOK_WEB_SETUP.md`
- [ ] Added story path to documentation list
- [ ] Tested stories in Storybook UI
- [ ] Verified stories load in web view

---

## Troubleshooting

### Stories Not Showing Up

1. **Check import path**: Ensure the import path in `index.web.ts` is correct
2. **Check export**: Verify you have `export default meta` in your story file
3. **Regenerate**: Run `npm run storybook-generate` to refresh the loader
4. **Clear cache**: Run `npx expo start --clear` to clear Metro cache

### TypeScript Errors

1. **Import types**: Make sure to import `Meta` and `StoryObj` from `@storybook/react`
2. **Satisfy type**: Use `satisfies Meta<typeof Component>` for type safety
3. **Story type**: Define `type Story = StoryObj<typeof meta>` for story types

### Styling Issues

1. **Background**: Always set `backgroundColor: THEME.base03` on container
2. **Import THEME**: Make sure to import from `'../../src/theme/colors'`
3. **Relative paths**: Adjust `../../` based on component location depth

---

## Additional Resources

- [Storybook React Native Docs](https://storybook.js.org/docs/react/get-started/introduction)
- [Solarized Theme Colors](/mobile/src/theme/colors.ts)
- [BionicText Component](/mobile/components/shared/BionicText.tsx)
- [Existing Story Examples](/mobile/components/)

---

## Questions?

If you have questions or need help creating stories:

1. Check existing story files for patterns
2. Look at comprehensive examples like:
   - `components/shared/BionicText.stories.tsx` (14 stories)
   - `components/connections/ConnectionElement.stories.tsx` (8 stories)
   - `components/core/BiologicalTabs.stories.tsx` (11 stories)
3. Review this guide's examples section
4. Open an issue or ask in the team chat

Happy story writing! 🎨
