import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ChevronElement } from './ChevronElement';

const meta = {
  title: 'Shared/Core/ChevronElement',
  component: ChevronElement,
  argTypes: {
    backgroundColor: {
      control: 'color',
      description: 'Background color of the chevron',
    },
    height: {
      control: { type: 'range', min: 40, max: 200, step: 10 },
      description: 'Height of the chevron',
    },
    chevronDepth: {
      control: { type: 'range', min: 5, max: 50, step: 5 },
      description: 'Depth of the chevron angles',
    },
    shadow: {
      control: 'boolean',
      description: 'Add shadow effect',
    },
  },
  decorators: [
    (Story) => (
      <View style={styles.decorator}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ChevronElement>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic chevron element with default blue background
 */
export const Basic: Story = {
  args: {
    backgroundColor: '#3B82F6',
    height: 60,
    chevronDepth: 20,
    shadow: false,
  },
  render: (args) => (
    <ChevronElement {...args}>
      <Text style={styles.text}>Basic Chevron</Text>
    </ChevronElement>
  ),
};

/**
 * Chevron with shadow for depth
 */
export const WithShadow: Story = {
  args: {
    backgroundColor: '#8B5CF6',
    height: 60,
    chevronDepth: 20,
    shadow: true,
  },
  render: (args) => (
    <ChevronElement {...args}>
      <Text style={styles.text}>Chevron with Shadow</Text>
    </ChevronElement>
  ),
};

/**
 * Different colors showcase
 */
export const ColorVariants: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronElement backgroundColor="#EF4444" height={50} chevronDepth={15}>
        <Text style={styles.text}>Red</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#10B981" height={50} chevronDepth={15}>
        <Text style={styles.text}>Green</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#F59E0B" height={50} chevronDepth={15}>
        <Text style={styles.text}>Orange</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#6366F1" height={50} chevronDepth={15}>
        <Text style={styles.text}>Indigo</Text>
      </ChevronElement>
    </View>
  ),
};

/**
 * Different chevron depths
 */
export const DepthVariations: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronElement backgroundColor="#3B82F6" height={50} chevronDepth={10}>
        <Text style={styles.text}>Shallow (10px)</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#3B82F6" height={50} chevronDepth={20}>
        <Text style={styles.text}>Medium (20px)</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#3B82F6" height={50} chevronDepth={30}>
        <Text style={styles.text}>Deep (30px)</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#3B82F6" height={50} chevronDepth={40}>
        <Text style={styles.text}>Very Deep (40px)</Text>
      </ChevronElement>
    </View>
  ),
};

/**
 * Different heights
 */
export const HeightVariations: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronElement backgroundColor="#8B5CF6" height={40} chevronDepth={15}>
        <Text style={styles.smallText}>Small (40px)</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#8B5CF6" height={60} chevronDepth={20}>
        <Text style={styles.text}>Medium (60px)</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#8B5CF6" height={80} chevronDepth={25}>
        <Text style={styles.largeText}>Large (80px)</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#8B5CF6" height={100} chevronDepth={30}>
        <Text style={styles.largeText}>Extra Large (100px)</Text>
      </ChevronElement>
    </View>
  ),
};

/**
 * Stacked chevrons creating a flow
 */
export const StackedFlow: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronElement backgroundColor="#3B82F6" height={50} chevronDepth={20} shadow>
        <Text style={styles.text}>Step 1: Start</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />
      <ChevronElement backgroundColor="#8B5CF6" height={50} chevronDepth={20} shadow>
        <Text style={styles.text}>Step 2: Process</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />
      <ChevronElement backgroundColor="#10B981" height={50} chevronDepth={20} shadow>
        <Text style={styles.text}>Step 3: Complete</Text>
      </ChevronElement>
    </View>
  ),
};

/**
 * Chevrons with custom content
 */
export const WithCustomContent: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronElement backgroundColor="#1F2937" height={70} chevronDepth={25} shadow>
        <View>
          <Text style={[styles.text, { fontSize: 18, fontWeight: 'bold' }]}>
            Task Complete
          </Text>
          <Text style={[styles.text, { fontSize: 12, opacity: 0.8 }]}>
            3 items finished
          </Text>
        </View>
      </ChevronElement>
      <View style={{ height: 15 }} />
      <ChevronElement backgroundColor="#DC2626" height={70} chevronDepth={25} shadow>
        <View>
          <Text style={[styles.text, { fontSize: 18, fontWeight: 'bold' }]}>
            Alert!
          </Text>
          <Text style={[styles.text, { fontSize: 12, opacity: 0.8 }]}>
            Action required
          </Text>
        </View>
      </ChevronElement>
    </View>
  ),
};

/**
 * Minimal chevron with subtle depth
 */
export const Minimal: Story = {
  args: {
    backgroundColor: '#F3F4F6',
    height: 50,
    chevronDepth: 12,
    shadow: false,
  },
  render: (args) => (
    <ChevronElement {...args}>
      <Text style={[styles.text, { color: '#1F2937' }]}>Minimal Style</Text>
    </ChevronElement>
  ),
};

const styles = StyleSheet.create({
  decorator: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  column: {
    gap: 0,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  largeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
