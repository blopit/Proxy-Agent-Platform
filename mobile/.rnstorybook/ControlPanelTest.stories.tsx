/**
 * Control Panel Test Story
 * Use this story to verify the Storybook control panel is working correctly
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useTheme } from '../src/theme/ThemeContext';

// Simple test component that shows current theme
function ControlPanelTestComponent() {
  const { colors, themeName } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.base03 }]}>
      <View style={[styles.card, { backgroundColor: colors.base02, borderColor: colors.base01 }]}>
        <Text style={[styles.title, { color: colors.cyan }]}>
          🎨 Control Panel Test
        </Text>
        <Text style={[styles.subtitle, { color: colors.base0 }]}>
          Current Theme: {themeName}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.base0 }]}>
            ✅ What to Test:
          </Text>
          <Text style={[styles.text, { color: colors.base01 }]}>
            1. Header should be visible at the top
          </Text>
          <Text style={[styles.text, { color: colors.base01 }]}>
            2. Click theme picker to change themes
          </Text>
          <Text style={[styles.text, { color: colors.base01 }]}>
            3. Toggle grid overlay on/off
          </Text>
          <Text style={[styles.text, { color: colors.base01 }]}>
            4. Click viewport selector
          </Text>
          <Text style={[styles.text, { color: colors.base01 }]}>
            5. Click component size selector
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.base0 }]}>
            🎨 Theme Colors:
          </Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.cyan }]} />
            <Text style={[styles.colorLabel, { color: colors.base01 }]}>Cyan</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.blue }]} />
            <Text style={[styles.colorLabel, { color: colors.base01 }]}>Blue</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.green }]} />
            <Text style={[styles.colorLabel, { color: colors.base01 }]}>Green</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.violet }]} />
            <Text style={[styles.colorLabel, { color: colors.base01 }]}>Violet</Text>
          </View>
          <View style={styles.colorRow}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.orange }]} />
            <Text style={[styles.colorLabel, { color: colors.base01 }]}>Orange</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.note, { color: colors.base01 }]}>
            💡 When you change themes, these colors should update immediately.
          </Text>
          <Text style={[styles.note, { color: colors.base01 }]}>
            📐 Toggle the grid to see 8px alignment guides.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 6,
  },
});

const meta = {
  title: 'Test/Control Panel',
  component: ControlPanelTestComponent,
  parameters: {
    notes: `
# Control Panel Test

Use this story to verify that the Storybook control panel header is working correctly.

## What to Check:

1. **Header Visibility**: You should see a header bar at the top with 4 controls
2. **Theme Picker**: Click to see all 6 themes with previews
3. **Grid Toggle**: Click to show/hide 8px grid overlay
4. **Viewport Selector**: Click to see viewport options
5. **Component Size**: Click to see size options

## Expected Behavior:

- When you change themes, the card colors should update immediately
- Grid overlay should appear/disappear when toggled
- All modals should open and close smoothly
- Touch interactions should work on all buttons

## Themes Available:

- Solarized Dark (default)
- Solarized Light
- Nord
- Dracula
- Catppuccin Mocha
- High Contrast
    `,
  },
} satisfies Meta<typeof ControlPanelTestComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInstructions: Story = {
  parameters: {
    docs: {
      description: {
        story: 'This story displays instructions for testing the control panel. Change themes using the header to see colors update.',
      },
    },
  },
};
