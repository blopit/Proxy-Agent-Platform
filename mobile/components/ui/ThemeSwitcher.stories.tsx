/**
 * ThemeSwitcher Stories - Theme Selection Component
 * Demonstrates all available themes and theme switching functionality
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, Text } from 'react-native';
import { ThemeSwitcherButton } from './ThemeSwitcher';
import { useTheme } from '@/src/theme/ThemeContext';
import BionicText from '../shared/BionicText';

const meta = {
  title: 'UI/ThemeSwitcher',
  component: ThemeSwitcherButton,
  decorators: [
    (Story) => {
      const { colors } = useTheme();
      return (
        <View style={[styles.container, { backgroundColor: colors.base03 }]}>
          <Story />
        </View>
      );
    },
  ],
} satisfies Meta<typeof ThemeSwitcherButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - Theme Switcher Button
 * Click to open theme selection modal
 */
export const Default: Story = {};

/**
 * Theme Preview - All Themes Side by Side
 * Shows what each theme looks like
 */
export const ThemePreview: Story = {
  render: () => {
    const { colors, themeName } = useTheme();

    return (
      <View style={styles.previewContainer}>
        <BionicText style={[styles.previewTitle, { color: colors.base0 }]}>
          Current Theme: {themeName}
        </BionicText>

        <View style={styles.colorGrid}>
          {/* Background Colors */}
          <View style={styles.colorSection}>
            <Text style={[styles.sectionTitle, { color: colors.base01 }]}>
              Backgrounds
            </Text>
            <View style={[styles.colorBox, { backgroundColor: colors.base03 }]}>
              <Text style={[styles.colorLabel, { color: colors.base0 }]}>
                base03
              </Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.base02 }]}>
              <Text style={[styles.colorLabel, { color: colors.base0 }]}>
                base02
              </Text>
            </View>
          </View>

          {/* Text Colors */}
          <View style={styles.colorSection}>
            <Text style={[styles.sectionTitle, { color: colors.base01 }]}>
              Text
            </Text>
            <View style={[styles.colorBox, { backgroundColor: colors.base02 }]}>
              <Text style={[styles.colorLabel, { color: colors.base0 }]}>
                base0
              </Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: colors.base02 }]}>
              <Text style={[styles.colorLabel, { color: colors.base01 }]}>
                base01
              </Text>
            </View>
          </View>

          {/* Accent Colors */}
          <View style={styles.colorSection}>
            <Text style={[styles.sectionTitle, { color: colors.base01 }]}>
              Accents
            </Text>
            <View style={styles.accentRow}>
              <View style={[styles.accentBox, { backgroundColor: colors.cyan }]} />
              <View style={[styles.accentBox, { backgroundColor: colors.blue }]} />
              <View style={[styles.accentBox, { backgroundColor: colors.violet }]} />
              <View style={[styles.accentBox, { backgroundColor: colors.green }]} />
            </View>
            <View style={styles.accentRow}>
              <View style={[styles.accentBox, { backgroundColor: colors.yellow }]} />
              <View style={[styles.accentBox, { backgroundColor: colors.orange }]} />
              <View style={[styles.accentBox, { backgroundColor: colors.red }]} />
              <View style={[styles.accentBox, { backgroundColor: colors.magenta }]} />
            </View>
          </View>
        </View>

        <ThemeSwitcherButton />
      </View>
    );
  },
};

/**
 * Interactive Theme Comparison
 * Switch themes and see the difference
 */
export const InteractiveComparison: Story = {
  render: () => {
    const { colors, theme } = useTheme();

    return (
      <View style={styles.comparisonContainer}>
        <BionicText
          style={[styles.comparisonTitle, { color: colors.base0 }]}
          boldZoneEnd={0.3}
        >
          {theme.displayName}
        </BionicText>

        <Text style={[styles.description, { color: colors.base01 }]}>
          {theme.description}
        </Text>

        {/* Sample UI */}
        <View style={[styles.sampleCard, { backgroundColor: colors.base02 }]}>
          <Text style={[styles.cardTitle, { color: colors.cyan }]}>
            Sample Card
          </Text>
          <BionicText style={[styles.cardText, { color: colors.base0 }]}>
            This is how text looks in this theme. Notice the colors and contrast.
          </BionicText>
          <View style={styles.buttonRow}>
            <View style={[styles.sampleButton, { backgroundColor: colors.cyan }]}>
              <Text style={[styles.buttonLabel, { color: colors.base03 }]}>
                Primary
              </Text>
            </View>
            <View
              style={[
                styles.sampleButton,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.base01,
                },
              ]}
            >
              <Text style={[styles.buttonLabel, { color: colors.base0 }]}>
                Secondary
              </Text>
            </View>
          </View>
        </View>

        <ThemeSwitcherButton />
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '100%',
    gap: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  colorGrid: {
    gap: 16,
    marginBottom: 20,
  },
  colorSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  colorBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  accentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accentBox: {
    flex: 1,
    height: 40,
    borderRadius: 8,
  },
  comparisonContainer: {
    width: '100%',
    gap: 16,
  },
  comparisonTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  sampleCard: {
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  sampleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
