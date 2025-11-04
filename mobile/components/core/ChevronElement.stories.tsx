import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { ChevronElement } from './ChevronElement';

const meta = {
  title: 'Core/ChevronElement',
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
 * Basic chevron with sharp angles
 * Clean geometric design inspired by CSS chevron bars
 */
export const Basic: Story = {
  args: {
    backgroundColor: '#3B82F6',
    height: 60,
    chevronDepth: 20,
    shadow: false,
    position: 'single',
  },
  render: (args) => (
    <ChevronElement {...args}>
      <Text style={styles.text}>Sharp Chevron</Text>
    </ChevronElement>
  ),
};

/**
 * START position - Left edge straight, right edge angled
 */
export const StartPosition: Story = {
  args: {
    backgroundColor: '#3B82F6',
    height: 60,
    chevronDepth: 20,
    position: 'start',
  },
  render: (args) => (
    <ChevronElement {...args}>
      <Text style={styles.text}>Start</Text>
    </ChevronElement>
  ),
};

/**
 * MIDDLE position - Both edges angled
 */
export const MiddlePosition: Story = {
  args: {
    backgroundColor: '#8B5CF6',
    height: 60,
    chevronDepth: 20,
    position: 'middle',
  },
  render: (args) => (
    <ChevronElement {...args}>
      <Text style={styles.text}>Middle</Text>
    </ChevronElement>
  ),
};

/**
 * END position - Left edge angled, right edge straight
 */
export const EndPosition: Story = {
  args: {
    backgroundColor: '#10B981',
    height: 60,
    chevronDepth: 20,
    position: 'end',
  },
  render: (args) => (
    <ChevronElement {...args}>
      <Text style={styles.text}>End</Text>
    </ChevronElement>
  ),
};

/**
 * Chained flow showing all three positions together
 */
export const ChainedFlow: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronElement backgroundColor="#3B82F6" height={50} chevronDepth={20} position="start">
        <Text style={styles.text}>Step 1: Start</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />
      <ChevronElement backgroundColor="#8B5CF6" height={50} chevronDepth={20} position="middle">
        <Text style={styles.text}>Step 2: Process</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />
      <ChevronElement backgroundColor="#EC4899" height={50} chevronDepth={20} position="middle">
        <Text style={styles.text}>Step 3: Review</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />
      <ChevronElement backgroundColor="#10B981" height={50} chevronDepth={20} position="end">
        <Text style={styles.text}>Step 4: Complete</Text>
      </ChevronElement>
    </View>
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
 * Sharp angles showcase
 * All chevrons use clean, geometric shapes with no rounding
 */
export const SharpAngles: Story = {
  render: () => (
    <View style={styles.column}>
      <ChevronElement backgroundColor="#3B82F6" height={60} chevronDepth={15}>
        <Text style={styles.text}>Sharp Geometric Design</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#8B5CF6" height={60} chevronDepth={20}>
        <Text style={styles.text}>Clean Angles</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#EC4899" height={60} chevronDepth={25}>
        <Text style={styles.text}>Bold Chevron</Text>
      </ChevronElement>
      <View style={{ height: 10 }} />
      <ChevronElement backgroundColor="#10B981" height={60} chevronDepth={30}>
        <Text style={styles.text}>Dramatic Angle</Text>
      </ChevronElement>
    </View>
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

/**
 * Shadow Testing - All positions with shadows
 * Tests how shadows render on different chevron positions
 */
export const ShadowTesting: Story = {
  render: () => (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>With Shadows (shadow=true)</Text>

      <ChevronElement backgroundColor="#3B82F6" height={60} chevronDepth={15} shadow position="start">
        <Text style={styles.text}>Start + Shadow</Text>
      </ChevronElement>
      <View style={{ height: 15 }} />

      <ChevronElement backgroundColor="#8B5CF6" height={60} chevronDepth={15} shadow position="middle">
        <Text style={styles.text}>Middle + Shadow</Text>
      </ChevronElement>
      <View style={{ height: 15 }} />

      <ChevronElement backgroundColor="#EC4899" height={60} chevronDepth={15} shadow position="end">
        <Text style={styles.text}>End + Shadow</Text>
      </ChevronElement>
      <View style={{ height: 15 }} />

      <ChevronElement backgroundColor="#10B981" height={60} chevronDepth={15} shadow position="single">
        <Text style={styles.text}>Single + Shadow</Text>
      </ChevronElement>

      <View style={{ height: 30 }} />
      <Text style={styles.sectionTitle}>Without Shadows (shadow=false)</Text>

      <ChevronElement backgroundColor="#3B82F6" height={60} chevronDepth={15} shadow={false} position="middle">
        <Text style={styles.text}>No Shadow (Flat)</Text>
      </ChevronElement>
    </View>
  ),
};

/**
 * Shadow Flow - Chained chevrons with shadows
 * Tests shadows in a realistic flow visualization
 */
export const ShadowFlow: Story = {
  render: () => (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>Task Flow with Shadows</Text>

      <ChevronElement backgroundColor="#3B82F6" height={50} chevronDepth={15} shadow position="start">
        <Text style={styles.text}>1. Capture</Text>
      </ChevronElement>
      <View style={{ height: 8 }} />

      <ChevronElement backgroundColor="#8B5CF6" height={50} chevronDepth={15} shadow position="middle">
        <Text style={styles.text}>2. Scout</Text>
      </ChevronElement>
      <View style={{ height: 8 }} />

      <ChevronElement backgroundColor="#EC4899" height={50} chevronDepth={15} shadow position="middle">
        <Text style={styles.text}>3. Hunter</Text>
      </ChevronElement>
      <View style={{ height: 8 }} />

      <ChevronElement backgroundColor="#F59E0B" height={50} chevronDepth={15} shadow position="middle">
        <Text style={styles.text}>4. Today</Text>
      </ChevronElement>
      <View style={{ height: 8 }} />

      <ChevronElement backgroundColor="#10B981" height={50} chevronDepth={15} shadow position="end">
        <Text style={styles.text}>5. Mapper</Text>
      </ChevronElement>
    </View>
  ),
};

/**
 * Shadow Depth Comparison
 * Same chevron with and without shadow side-by-side
 */
export const ShadowComparison: Story = {
  render: () => (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>Without Shadow</Text>
      <ChevronElement backgroundColor="#3B82F6" height={70} chevronDepth={20} shadow={false}>
        <View>
          <Text style={[styles.text, { fontSize: 16, fontWeight: '700' }]}>
            Flat Design
          </Text>
          <Text style={[styles.text, { fontSize: 12, opacity: 0.8 }]}>
            shadow=false
          </Text>
        </View>
      </ChevronElement>

      <View style={{ height: 30 }} />

      <Text style={styles.sectionTitle}>With Shadow</Text>
      <ChevronElement backgroundColor="#3B82F6" height={70} chevronDepth={20} shadow>
        <View>
          <Text style={[styles.text, { fontSize: 16, fontWeight: '700' }]}>
            3D Depth
          </Text>
          <Text style={[styles.text, { fontSize: 12, opacity: 0.8 }]}>
            shadow=true
          </Text>
        </View>
      </ChevronElement>
    </View>
  ),
};

/**
 * Golden Ratio Fibonacci Heights
 * Chevrons sized using Fibonacci sequence (34, 55, 89, 144)
 * Each height ≈ 1.618x the previous (phi ratio)
 */
export const GoldenRatioFibonacci: Story = {
  render: () => (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>Fibonacci Sequence Heights</Text>

      <ChevronElement backgroundColor="#3B82F6" height={34} chevronDepth={10} shadow>
        <Text style={[styles.text, { fontSize: 11 }]}>34px (Fibonacci)</Text>
      </ChevronElement>
      <View style={{ height: 8 }} />

      <ChevronElement backgroundColor="#8B5CF6" height={55} chevronDepth={12} shadow>
        <Text style={[styles.text, { fontSize: 13 }]}>55px (Fibonacci)</Text>
      </ChevronElement>
      <View style={{ height: 8 }} />

      <ChevronElement backgroundColor="#EC4899" height={89} chevronDepth={15} shadow>
        <Text style={[styles.text, { fontSize: 16 }]}>89px (Fibonacci)</Text>
      </ChevronElement>
      <View style={{ height: 8 }} />

      <ChevronElement backgroundColor="#10B981" height={144} chevronDepth={20} shadow>
        <Text style={[styles.text, { fontSize: 20 }]}>144px (Fibonacci)</Text>
      </ChevronElement>

      <View style={{ height: 20 }} />
      <Text style={[styles.sectionTitle, { fontSize: 12, opacity: 0.7 }]}>
        Each height ≈ 1.618× previous (φ ratio)
      </Text>
    </View>
  ),
};

/**
 * Golden Ratio Proportions
 * Height-to-chevronDepth ratio using phi (1.618)
 * Creates visually harmonious angles
 */
export const GoldenRatioProportions: Story = {
  render: () => {
    // Golden ratio (phi)
    const phi = 1.618;

    return (
      <View style={styles.column}>
        <Text style={styles.sectionTitle}>φ (Phi) Height-to-Depth Ratios</Text>

        <ChevronElement
          backgroundColor="#3B82F6"
          height={55}
          chevronDepth={Math.round(55 / phi)} // 34
          shadow
        >
          <Text style={styles.text}>55px : 34px (φ)</Text>
        </ChevronElement>
        <View style={{ height: 10 }} />

        <ChevronElement
          backgroundColor="#8B5CF6"
          height={89}
          chevronDepth={Math.round(89 / phi)} // 55
          shadow
        >
          <Text style={styles.text}>89px : 55px (φ)</Text>
        </ChevronElement>
        <View style={{ height: 10 }} />

        <ChevronElement
          backgroundColor="#EC4899"
          height={144}
          chevronDepth={Math.round(144 / phi)} // 89
          shadow
        >
          <Text style={styles.text}>144px : 89px (φ)</Text>
        </ChevronElement>

        <View style={{ height: 20 }} />
        <Text style={[styles.sectionTitle, { fontSize: 12, opacity: 0.7 }]}>
          height / depth = 1.618 (golden ratio)
        </Text>
      </View>
    );
  },
};

/**
 * Golden Spiral Flow
 * Chevrons arranged in golden ratio sizes creating visual rhythm
 * Fibonacci sequence: 21, 34, 55, 89, 144
 */
export const GoldenSpiralFlow: Story = {
  render: () => (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>Golden Spiral Workflow</Text>

      <ChevronElement backgroundColor="#F59E0B" height={21} chevronDepth={8} shadow position="start">
        <Text style={[styles.text, { fontSize: 9 }]}>Capture (21)</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />

      <ChevronElement backgroundColor="#3B82F6" height={34} chevronDepth={10} shadow position="middle">
        <Text style={[styles.text, { fontSize: 11 }]}>Scout (34)</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />

      <ChevronElement backgroundColor="#8B5CF6" height={55} chevronDepth={12} shadow position="middle">
        <Text style={[styles.text, { fontSize: 13 }]}>Hunter (55)</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />

      <ChevronElement backgroundColor="#EC4899" height={89} chevronDepth={15} shadow position="middle">
        <Text style={[styles.text, { fontSize: 16 }]}>Today (89)</Text>
      </ChevronElement>
      <View style={{ height: 5 }} />

      <ChevronElement backgroundColor="#10B981" height={144} chevronDepth={20} shadow position="end">
        <Text style={[styles.text, { fontSize: 20 }]}>Mapper (144)</Text>
      </ChevronElement>

      <View style={{ height: 20 }} />
      <Text style={[styles.sectionTitle, { fontSize: 12, opacity: 0.7 }]}>
        Each step grows by φ = 1.618
      </Text>
    </View>
  ),
};

/**
 * Phi-Based Micro to Macro
 * Complete Fibonacci scale from tiny to large
 * 8, 13, 21, 34, 55, 89
 */
export const PhiMicroToMacro: Story = {
  render: () => (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>Fibonacci Scale: Micro → Macro</Text>

      <ChevronElement backgroundColor="#6366F1" height={8} chevronDepth={5} shadow>
        <Text style={[styles.text, { fontSize: 7 }]}>8</Text>
      </ChevronElement>
      <View style={{ height: 3 }} />

      <ChevronElement backgroundColor="#8B5CF6" height={13} chevronDepth={6} shadow>
        <Text style={[styles.text, { fontSize: 8 }]}>13</Text>
      </ChevronElement>
      <View style={{ height: 3 }} />

      <ChevronElement backgroundColor="#A855F7" height={21} chevronDepth={8} shadow>
        <Text style={[styles.text, { fontSize: 9 }]}>21</Text>
      </ChevronElement>
      <View style={{ height: 3 }} />

      <ChevronElement backgroundColor="#C084FC" height={34} chevronDepth={10} shadow>
        <Text style={[styles.text, { fontSize: 11 }]}>34</Text>
      </ChevronElement>
      <View style={{ height: 3 }} />

      <ChevronElement backgroundColor="#D8B4FE" height={55} chevronDepth={12} shadow>
        <Text style={[styles.text, { fontSize: 13 }]}>55</Text>
      </ChevronElement>
      <View style={{ height: 3 }} />

      <ChevronElement backgroundColor="#E9D5FF" height={89} chevronDepth={15} shadow>
        <Text style={[styles.text, { fontSize: 16, color: '#6B21A8' }]}>89</Text>
      </ChevronElement>

      <View style={{ height: 20 }} />
      <Text style={[styles.sectionTitle, { fontSize: 12, opacity: 0.7 }]}>
        Natural scaling: 8→13→21→34→55→89
      </Text>
    </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
