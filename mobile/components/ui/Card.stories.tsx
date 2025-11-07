/**
 * Card Stories - Flexible card container component
 * Shows priority variants and composition patterns
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { THEME } from '../../src/theme/colors';
import BionicText from '../shared/BionicText';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react-native';
import { Text } from '@/src/components/ui/Text';

const meta = {
  title: 'UI/Card',
  component: Card,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default - Basic Card
 * Standard card with default styling
 */
export const Default: Story = {
  render: () => (
    <Card>
      <BionicText style={styles.text}>
        This is a basic card with default styling. Perfect for general content.
      </BionicText>
    </Card>
  ),
};

/**
 * High Priority - Urgent Tasks
 * Red border for high-priority content
 */
export const HighPriority: Story = {
  render: () => (
    <Card variant="high-priority">
      <CardHeader>
        <View style={styles.headerRow}>
          <AlertCircle size={20} color={THEME.red} />
          <BionicText style={[styles.title, { color: THEME.red }]} boldRatio={0.5}>
            High Priority Task
          </BionicText>
        </View>
      </CardHeader>
      <CardContent>
        <BionicText style={styles.text}>
          This task requires immediate attention. The red border indicates urgency.
        </BionicText>
      </CardContent>
      <CardFooter>
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: THEME.red }]}>
            <Text style={styles.badgeText}>URGENT</Text>
          </View>
        </View>
      </CardFooter>
    </Card>
  ),
};

/**
 * Medium Priority - Important Tasks
 * Yellow border for medium-priority content
 */
export const MediumPriority: Story = {
  render: () => (
    <Card variant="medium-priority">
      <CardHeader>
        <View style={styles.headerRow}>
          <Clock size={20} color={THEME.yellow} />
          <BionicText style={[styles.title, { color: THEME.yellow }]} boldRatio={0.5}>
            Medium Priority Task
          </BionicText>
        </View>
      </CardHeader>
      <CardContent>
        <BionicText style={styles.text}>
          This task should be completed soon but is not urgent.
        </BionicText>
      </CardContent>
      <CardFooter>
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: THEME.yellow }]}>
            <Text style={styles.badgeText}>IMPORTANT</Text>
          </View>
        </View>
      </CardFooter>
    </Card>
  ),
};

/**
 * Low Priority - Routine Tasks
 * Gray border for low-priority content
 */
export const LowPriority: Story = {
  render: () => (
    <Card variant="low-priority">
      <CardHeader>
        <View style={styles.headerRow}>
          <CheckCircle size={20} color={THEME.base01} />
          <BionicText style={[styles.title, { color: THEME.base0 }]} boldRatio={0.5}>
            Low Priority Task
          </BionicText>
        </View>
      </CardHeader>
      <CardContent>
        <BionicText style={styles.text}>
          This task can be completed when you have free time.
        </BionicText>
      </CardContent>
      <CardFooter>
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: THEME.base01 }]}>
            <Text style={styles.badgeText}>ROUTINE</Text>
          </View>
        </View>
      </CardFooter>
    </Card>
  ),
};

/**
 * With Header - Card with Header Section
 * Shows CardHeader usage
 */
export const WithHeader: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <BionicText style={styles.title} boldRatio={0.5}>
          Card with Header
        </BionicText>
        <BionicText style={styles.subtitle}>
          Headers help organize card content
        </BionicText>
      </CardHeader>
      <CardContent>
        <BionicText style={styles.text}>
          The CardHeader component provides consistent spacing and styling for card titles.
        </BionicText>
      </CardContent>
    </Card>
  ),
};

/**
 * With Footer - Card with Footer Section
 * Shows CardFooter usage with action buttons
 */
export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardContent>
        <BionicText style={styles.text}>
          This card has a footer section with action buttons.
        </BionicText>
      </CardContent>
      <CardFooter>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </CardFooter>
    </Card>
  ),
};

/**
 * Complete Structure - All Card Parts
 * Shows CardHeader, CardContent, and CardFooter together
 */
export const CompleteStructure: Story = {
  render: () => (
    <Card variant="medium-priority">
      <CardHeader>
        <View style={styles.headerRow}>
          <Calendar size={20} color={THEME.yellow} />
          <BionicText style={styles.title} boldRatio={0.5}>
            Complete Card Example
          </BionicText>
        </View>
        <BionicText style={styles.subtitle}>
          Due today at 5:00 PM
        </BionicText>
      </CardHeader>
      <CardContent>
        <BionicText style={styles.text}>
          This card demonstrates the complete structure with header, content, and footer sections.
        </BionicText>
      </CardContent>
      <CardFooter>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]}>
          <Text style={styles.buttonText}>Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]}>
          <Text style={styles.buttonText}>Snooze</Text>
        </TouchableOpacity>
      </CardFooter>
    </Card>
  ),
};

/**
 * Nested Cards - Cards within Cards
 * Shows how cards can be nested for complex layouts
 */
export const NestedCards: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <BionicText style={styles.title} boldRatio={0.5}>
          Project Overview
        </BionicText>
      </CardHeader>
      <CardContent>
        <View style={styles.nestedCardsContainer}>
          <Card variant="high-priority" style={styles.nestedCard}>
            <BionicText style={[styles.subtitle, { color: THEME.red }]} boldRatio={0.5}>
              Critical Task
            </BionicText>
            <BionicText style={styles.smallText}>
              Deploy production fix
            </BionicText>
          </Card>

          <Card variant="medium-priority" style={styles.nestedCard}>
            <BionicText style={[styles.subtitle, { color: THEME.yellow }]} boldRatio={0.5}>
              Important Task
            </BionicText>
            <BionicText style={styles.smallText}>
              Review pull requests
            </BionicText>
          </Card>

          <Card variant="low-priority" style={styles.nestedCard}>
            <BionicText style={styles.subtitle} boldRatio={0.5}>
              Routine Task
            </BionicText>
            <BionicText style={styles.smallText}>
              Update documentation
            </BionicText>
          </Card>
        </View>
      </CardContent>
    </Card>
  ),
};

/**
 * All Variants - Compare All Priorities
 * Side-by-side comparison of all card variants
 */
export const AllVariants: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.variantsContainer}>
        <Card style={styles.variantCard}>
          <BionicText style={styles.title} boldRatio={0.5}>Default</BionicText>
          <BionicText style={styles.text}>Standard card styling</BionicText>
        </Card>

        <Card variant="high-priority" style={styles.variantCard}>
          <BionicText style={[styles.title, { color: THEME.red }]} boldRatio={0.5}>
            High Priority
          </BionicText>
          <BionicText style={styles.text}>Red border for urgency</BionicText>
        </Card>

        <Card variant="medium-priority" style={styles.variantCard}>
          <BionicText style={[styles.title, { color: THEME.yellow }]} boldRatio={0.5}>
            Medium Priority
          </BionicText>
          <BionicText style={styles.text}>Yellow border for importance</BionicText>
        </Card>

        <Card variant="low-priority" style={styles.variantCard}>
          <BionicText style={styles.title} boldRatio={0.5}>Low Priority</BionicText>
          <BionicText style={styles.text}>Gray border for routine tasks</BionicText>
        </Card>
      </View>
    </ScrollView>
  ),
};

/**
 * Custom Styling - Override Default Styles
 * Shows how to customize card appearance
 */
export const CustomStyling: Story = {
  render: () => (
    <View style={styles.customContainer}>
      <Card style={styles.customCard}>
        <BionicText style={[styles.title, { color: THEME.cyan }]} boldRatio={0.5}>
          Custom Styled Card
        </BionicText>
        <BionicText style={styles.text}>
          You can override default styles with the style prop.
        </BionicText>
      </Card>

      <Card style={styles.compactCard}>
        <BionicText style={styles.subtitle} boldRatio={0.5}>
          Compact Card
        </BionicText>
        <BionicText style={styles.smallText}>
          Reduced padding for tight layouts
        </BionicText>
      </Card>

      <Card style={styles.spaciousCard}>
        <BionicText style={styles.title} boldRatio={0.5}>
          Spacious Card
        </BionicText>
        <BionicText style={styles.text}>
          Extra padding for breathing room
        </BionicText>
      </Card>
    </View>
  ),
};

/**
 * Interactive Example - Clickable Cards
 * Shows cards with touch feedback
 */
export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<number | null>(null);

    return (
      <ScrollView style={styles.scrollView}>
        <View style={styles.variantsContainer}>
          {[
            { id: 1, title: 'Task 1', variant: 'high-priority' as const, color: THEME.red },
            { id: 2, title: 'Task 2', variant: 'medium-priority' as const, color: THEME.yellow },
            { id: 3, title: 'Task 3', variant: 'low-priority' as const, color: THEME.base01 },
          ].map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => setSelected(task.id)}
              activeOpacity={0.7}
            >
              <Card
                variant={task.variant}
                style={[
                  styles.variantCard,
                  selected === task.id && styles.selectedCard,
                ]}
              >
                <BionicText
                  style={[styles.title, { color: task.color }]}
                  boldRatio={0.5}
                >
                  {task.title}
                  {selected === task.id && ' ✓'}
                </BionicText>
                <BionicText style={styles.text}>
                  Tap to {selected === task.id ? 'deselect' : 'select'}
                </BionicText>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: THEME.base0,
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
    color: THEME.base0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.base0,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.base01,
    marginTop: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.base03,
    letterSpacing: 0.5,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: THEME.cyan,
  },
  buttonSecondary: {
    backgroundColor: THEME.base01,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base03,
  },
  nestedCardsContainer: {
    gap: 12,
  },
  nestedCard: {
    marginBottom: 0,
  },
  variantsContainer: {
    gap: 16,
    paddingBottom: 40,
  },
  variantCard: {
    marginBottom: 0,
  },
  customContainer: {
    gap: 16,
  },
  customCard: {
    borderColor: THEME.cyan,
    borderWidth: 3,
    backgroundColor: THEME.base02,
  },
  compactCard: {
    padding: 8,
  },
  spaciousCard: {
    padding: 32,
  },
  selectedCard: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
