/**
 * BionicText Stories - ADHD-friendly bionic reading
 * Shows different configurations and use cases
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Eye } from 'lucide-react-native';
import BionicText from './BionicText';
import { THEME } from '../../src/theme/colors';

const meta = {
  title: 'Shared/BionicText',
  component: BionicText,
  parameters: {
    notes: 'ADHD-friendly bionic reading with scientifically-backed gradual emphasis',
  },
  tags: ['bionic', 'reading', 'accessibility', 'adhd'],
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof BionicText>;

export default meta;

type Story = StoryObj<typeof meta>;

const SAMPLE_TEXT = `Attention neurodivergent community - this bionic reading method is absolutely mind blowing. Your eyes scan the first bold letters and your brain center automatically completes the words. It lets you read twice as fast, is less overwhelming and helps you to stay focused. You will feel much more productive and a greater sense of achievement which will boost your confidence and makes you overall feel more positive.`;

const SHORT_TEXT = "I've never read so fast. #ADHD";

const TECHNICAL_TEXT = "The BionicText component uses gradual font weight transitions across each word: bold from 0-20%, smooth fade from 20-60%, and normal from 60%+. This scientifically-backed approach helps neurodivergent readers maintain focus and comprehension.";

/**
 * Default - Standard Bionic Reading
 * Default 40% bold ratio for optimal reading
 */
export const Default: Story = {
  args: {
    children: SAMPLE_TEXT,
  },
};

/**
 * Short Text - Quick Example
 * Shows bionic reading on a short sentence
 */
export const ShortText: Story = {
  args: {
    children: SHORT_TEXT,
  },
};

/**
 * Technical Text - Code Documentation
 * Bionic reading for technical content
 */
export const TechnicalText: Story = {
  args: {
    children: TECHNICAL_TEXT,
  },
};

/**
 * Bold Ratio 50% - More Emphasis
 * Higher bold ratio for stronger visual cues
 */
export const BoldRatio50: Story = {
  args: {
    children: SAMPLE_TEXT,
    boldRatio: 0.5,
  },
};

/**
 * Bold Ratio 30% - Subtle Emphasis
 * Lower bold ratio for lighter visual cues
 */
export const BoldRatio30: Story = {
  args: {
    children: SAMPLE_TEXT,
    boldRatio: 0.3,
  },
};

/**
 * Custom Colors - Cyan Bold
 * Bold text in cyan for visual variety
 */
export const CyanBold: Story = {
  args: {
    children: SAMPLE_TEXT,
    boldColor: THEME.cyan,
    baseColor: THEME.base0,
  },
};

/**
 * Custom Colors - Green Bold
 * Bold text in green for emphasis
 */
export const GreenBold: Story = {
  args: {
    children: SAMPLE_TEXT,
    boldColor: THEME.green,
    baseColor: THEME.base0,
  },
};

/**
 * Large Text - Increased Font Size
 * Bionic reading with larger text for readability
 */
export const LargeText: Story = {
  args: {
    children: SAMPLE_TEXT,
    style: {
      fontSize: 20,
      lineHeight: 32,
    },
  },
};

/**
 * Small Text - Compact Display
 * Bionic reading with smaller text
 */
export const SmallText: Story = {
  args: {
    children: SAMPLE_TEXT,
    style: {
      fontSize: 14,
      lineHeight: 20,
    },
  },
};

/**
 * Comparison - Side by Side
 * Shows normal vs bionic reading side by side
 */
export const Comparison: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.comparisonContainer}>
        <View style={styles.section}>
          <BionicText style={styles.sectionTitle}>Normal Reading:</BionicText>
          <BionicText boldRatio={0} style={styles.normalText}>
            {SAMPLE_TEXT}
          </BionicText>
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <BionicText style={styles.sectionTitle}>Bionic Reading (40%):</BionicText>
          <BionicText boldRatio={0.4}>{SAMPLE_TEXT}</BionicText>
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <BionicText style={styles.sectionTitle}>Bionic Reading (50%):</BionicText>
          <BionicText boldRatio={0.5}>{SAMPLE_TEXT}</BionicText>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Dark Mode - Dark Background
 * Bionic reading optimized for dark theme
 */
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <View style={styles.darkContainer}>
        <Story />
      </View>
    ),
  ],
  args: {
    children: SAMPLE_TEXT,
    baseColor: THEME.base0,
    boldColor: THEME.base0,
  },
};

/**
 * High Contrast - Maximum Visibility
 * Bold text with high contrast for accessibility
 */
export const HighContrast: Story = {
  args: {
    children: SAMPLE_TEXT,
    baseColor: THEME.base01,
    boldColor: THEME.base1,
    boldRatio: 0.5,
  },
};

/**
 * All Ratios - Complete Comparison (DEPRECATED)
 * Shows all bold ratios from 20% to 60% (old API)
 */
export const AllRatios: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.comparisonContainer}>
        {[0.2, 0.3, 0.4, 0.5, 0.6].map((ratio) => (
          <View key={ratio} style={[styles.section, styles.sectionSpacing]}>
            <BionicText style={styles.sectionTitle}>
              Bold Ratio: {Math.round(ratio * 100)}%
            </BionicText>
            <BionicText boldRatio={ratio}>{SAMPLE_TEXT}</BionicText>
          </View>
        ))}
      </View>
    </ScrollView>
  ),
};

/**
 * Zone Comparison - Different fade patterns
 * Compare default (20-60) vs sharp (40) vs extended (30-70)
 */
export const ZoneComparison: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.comparisonContainer}>
        <View style={styles.section}>
          <BionicText style={styles.sectionTitle}>
            Default (Bold 0-20%, Fade 20-60%, Normal 60%+)
          </BionicText>
          <BionicText boldZoneEnd={0.2} fadeZoneEnd={0.6}>{SAMPLE_TEXT}</BionicText>
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <BionicText style={styles.sectionTitle}>
            Sharp at 40% (Bold 0-40%, Normal 40%+)
          </BionicText>
          <BionicText boldZoneEnd={0.4} fadeZoneEnd={0.4}>{SAMPLE_TEXT}</BionicText>
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <BionicText style={styles.sectionTitle}>
            Extended (Bold 0-30%, Fade 30-70%, Normal 70%+)
          </BionicText>
          <BionicText boldZoneEnd={0.3} fadeZoneEnd={0.7}>{SAMPLE_TEXT}</BionicText>
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * Sharp at 40% - Testing alternate fade pattern
 * Bold 0-40%, normal 40%+ (sharp cutoff for testing)
 */
export const SharpAt40: Story = {
  args: {
    children: SAMPLE_TEXT,
    boldZoneEnd: 0.4,
    fadeZoneEnd: 0.4, // Same as boldZoneEnd = sharp cutoff
  },
};

/**
 * Configurable Zones - Custom fade pattern
 * Bold 0-30%, fade 30-70%, normal 70%+
 */
export const ConfigurableZones: Story = {
  args: {
    children: SAMPLE_TEXT,
    boldZoneEnd: 0.3,
    fadeZoneEnd: 0.7,
  },
};

/**
 * Interactive Example - Adjustable Settings
 * Play with different settings to find your preference
 */
export const Interactive: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.comparisonContainer}>
        <View style={styles.headerRow}>
          <Eye size={32} color={THEME.cyan} strokeWidth={2} />
          <BionicText style={styles.title} boldRatio={0.5}>
            ADHD-Friendly Bionic Reading
          </BionicText>
        </View>

        <BionicText style={styles.subtitle} boldRatio={0.4}>
          Find your optimal reading style below:
        </BionicText>

        <View style={styles.section}>
          <BionicText style={styles.sectionTitle} boldRatio={0.5}>
            Default (Recommended):
          </BionicText>
          <BionicText boldRatio={0.4}>{SAMPLE_TEXT}</BionicText>
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <BionicText style={styles.sectionTitle} boldRatio={0.5}>
            Strong Emphasis:
          </BionicText>
          <BionicText boldRatio={0.5} boldColor={THEME.cyan}>
            {SAMPLE_TEXT}
          </BionicText>
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <BionicText style={styles.sectionTitle} boldRatio={0.5}>
            Subtle Emphasis:
          </BionicText>
          <BionicText boldRatio={0.3}>{SAMPLE_TEXT}</BionicText>
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <BionicText style={styles.sectionTitle} boldRatio={0.5}>
            Large Text (Accessibility):
          </BionicText>
          <BionicText
            boldRatio={0.4}
            style={{ fontSize: 20, lineHeight: 32 }}
          >
            {SAMPLE_TEXT}
          </BionicText>
        </View>
      </View>
    </ScrollView>
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: THEME.base03,
  },
  darkContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: THEME.base03,
  },
  scrollView: {
    flex: 1,
  },
  comparisonContainer: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.cyan,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.base0,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    marginBottom: 24,
  },
  normalText: {
    fontWeight: '400',
  },
});
