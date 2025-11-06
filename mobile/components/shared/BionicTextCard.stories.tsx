/**
 * BionicTextCard Stories - Card component with bionic reading
 * Practical examples of using bionic reading in UI components
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, ScrollView, StyleSheet } from 'react-native';
import BionicTextCard from './BionicTextCard';
import BionicText from './BionicText';
import { THEME } from '../../src/theme/colors';

const meta = {
  title: 'Shared/BionicTextCard',
  component: BionicTextCard,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof BionicTextCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const ADHD_TIP = `Attention neurodivergent community - this bionic reading method is absolutely mind blowing. Your eyes scan the first bold letters and your brain center automatically completes the words. It lets you read twice as fast, is less overwhelming and helps you to stay focused.`;

const PRODUCTIVITY_TIP = `You will feel much more productive and a greater sense of achievement which will boost your confidence and makes you overall feel more positive. Let me know in the comments if this bionic reading method works for you.`;

const FOCUS_TIP = `The key to maintaining focus with ADHD is breaking down large blocks of text into smaller, more digestible chunks. Bionic reading helps by guiding your eyes through the text, reducing the cognitive load required to process each word.`;

/**
 * Default - ADHD Reading Tip
 * Card with toggle-able bionic reading
 */
export const Default: Story = {
  args: {
    title: 'ADHD Reading Tip',
    content: ADHD_TIP,
    showToggle: true,
  },
};

/**
 * Without Title - Clean Card
 * Card without a title, just content
 */
export const WithoutTitle: Story = {
  args: {
    content: ADHD_TIP,
    showToggle: true,
  },
};

/**
 * Without Toggle - Always Bionic
 * Card with bionic reading always enabled
 */
export const WithoutToggle: Story = {
  args: {
    title: 'Focus Improvement',
    content: FOCUS_TIP,
    showToggle: false,
    defaultBionicEnabled: true,
  },
};

/**
 * Disabled by Default - Normal Reading
 * Card starts with normal reading
 */
export const DisabledByDefault: Story = {
  args: {
    title: 'Productivity Boost',
    content: PRODUCTIVITY_TIP,
    defaultBionicEnabled: false,
    showToggle: true,
  },
};

/**
 * High Bold Ratio - Strong Emphasis
 * Card with 50% bold ratio
 */
export const HighBoldRatio: Story = {
  args: {
    title: 'Strong Visual Cues',
    content: ADHD_TIP,
    boldRatio: 0.5,
    showToggle: true,
  },
};

/**
 * Low Bold Ratio - Subtle Emphasis
 * Card with 30% bold ratio
 */
export const LowBoldRatio: Story = {
  args: {
    title: 'Subtle Visual Cues',
    content: ADHD_TIP,
    boldRatio: 0.3,
    showToggle: true,
  },
};

/**
 * Multiple Cards - Dashboard Example
 * Shows multiple cards in a scrollable layout
 */
export const MultipleCards: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.cardsContainer}>
        <BionicText style={styles.pageTitle} boldRatio={0.5}>
          ADHD-Friendly Reading Tips
        </BionicText>

        <BionicTextCard
          title="What is Bionic Reading?"
          content={ADHD_TIP}
          showToggle={true}
        />

        <BionicTextCard
          title="Benefits for Productivity"
          content={PRODUCTIVITY_TIP}
          showToggle={true}
        />

        <BionicTextCard
          title="Maintaining Focus"
          content={FOCUS_TIP}
          showToggle={true}
        />
      </View>
    </ScrollView>
  ),
};

/**
 * Interactive Demo - Try Different Settings
 * Experiment with bionic reading settings
 */
export const InteractiveDemo: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.cardsContainer}>
        <BionicText style={styles.pageTitle} boldRatio={0.5}>
          Try Bionic Reading
        </BionicText>

        <BionicText style={styles.subtitle} boldRatio={0.4}>
          Tap the eye icon on each card to toggle bionic reading on/off
        </BionicText>

        <BionicTextCard
          title="Default (40% Bold)"
          content={ADHD_TIP}
          boldRatio={0.4}
          defaultBionicEnabled={true}
        />

        <BionicTextCard
          title="Strong (50% Bold)"
          content={ADHD_TIP}
          boldRatio={0.5}
          defaultBionicEnabled={true}
        />

        <BionicTextCard
          title="Subtle (30% Bold)"
          content={ADHD_TIP}
          boldRatio={0.3}
          defaultBionicEnabled={true}
        />

        <BionicTextCard
          title="Normal Reading (Compare)"
          content={ADHD_TIP}
          boldRatio={0}
          defaultBionicEnabled={false}
          showToggle={false}
        />
      </View>
    </ScrollView>
  ),
};

/**
 * Article Layout - Long Form Content
 * Bionic reading for article/blog post layout
 */
export const ArticleLayout: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.articleContainer}>
        <BionicText style={styles.articleTitle} boldRatio={0.5}>
          Understanding ADHD and Reading Comprehension
        </BionicText>

        <BionicText style={styles.articleMeta} boldRatio={0.4}>
          Published on January 15, 2025 · 5 min read
        </BionicText>

        <BionicTextCard
          title="The Challenge"
          content="For individuals with ADHD, traditional reading can be exhausting. The brain struggles to maintain focus on dense blocks of uniform text, leading to re-reading, distraction, and decreased comprehension."
          showToggle={true}
          defaultBionicEnabled={true}
        />

        <BionicTextCard
          title="How Bionic Reading Helps"
          content={ADHD_TIP}
          showToggle={true}
          defaultBionicEnabled={true}
        />

        <BionicTextCard
          title="Scientific Basis"
          content="Research suggests that guiding eye movements through strategic text emphasis can reduce cognitive load and improve reading speed for neurodivergent individuals. The bold prefixes serve as visual anchors, allowing the brain to predict and complete words more efficiently."
          showToggle={true}
          defaultBionicEnabled={true}
        />

        <BionicTextCard
          title="Real Results"
          content={PRODUCTIVITY_TIP}
          showToggle={true}
          defaultBionicEnabled={true}
        />
      </View>
    </ScrollView>
  ),
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
  cardsContainer: {
    gap: 16,
    paddingBottom: 40,
  },
  articleContainer: {
    gap: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: THEME.base0,
    lineHeight: 40,
    marginBottom: 8,
  },
  articleMeta: {
    fontSize: 14,
    color: THEME.base01,
    marginBottom: 16,
  },
});
