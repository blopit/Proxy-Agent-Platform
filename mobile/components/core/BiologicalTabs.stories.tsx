/**
 * BiologicalTabs Stories - 5 biological workflow mode tabs
 * Shows different modes optimized for energy and time of day
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import BiologicalTabs from './BiologicalTabs';
import { THEME } from '../../src/theme/colors';
import BionicText from '../shared/BionicText';

const meta = {
  title: 'Core/BiologicalTabs',
  component: BiologicalTabs,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof BiologicalTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default - Morning High Energy
 * Scout and Hunt optimal for morning peak performance
 */
export const Default: Story = {
  args: {
    activeTab: 'scout',
    onTabChange: () => {},
    energy: 85,
    timeOfDay: 'morning',
    showLabels: false,
  },
};

/**
 * With Labels - Named Tabs
 * Shows tab names below icons
 */
export const WithLabels: Story = {
  args: {
    activeTab: 'hunt',
    onTabChange: () => {},
    energy: 90,
    timeOfDay: 'morning',
    showLabels: true,
  },
};

/**
 * Morning Mode - Peak Productivity
 * Hunt and Scout modes optimal
 */
export const MorningHighEnergy: Story = {
  args: {
    activeTab: 'hunt',
    onTabChange: () => {},
    energy: 100,
    timeOfDay: 'morning',
    showLabels: false,
  },
};

/**
 * Afternoon Low Energy - Recharge Needed
 * Recharge mode optimal when energy drops
 */
export const AfternoonLowEnergy: Story = {
  args: {
    activeTab: 'recharge',
    onTabChange: () => {},
    energy: 25,
    timeOfDay: 'afternoon',
    showLabels: false,
  },
};

/**
 * Evening Mode - Reflection Time
 * Map mode optimal for memory consolidation
 */
export const EveningMediumEnergy: Story = {
  args: {
    activeTab: 'map',
    onTabChange: () => {},
    energy: 60,
    timeOfDay: 'evening',
    showLabels: false,
  },
};

/**
 * Interactive - Full Control
 * Try different energy levels and times
 */
export const Interactive: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('scout');
    const [energy, setEnergy] = useState(75);
    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

    return (
      <View style={styles.interactiveContainer}>
        <BionicText style={styles.title} boldRatio={0.5}>
          Biological Workflow Modes
        </BionicText>

        <BiologicalTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          energy={energy}
          timeOfDay={timeOfDay}
          showLabels={true}
        />

        <View style={styles.controls}>
          <BionicText style={styles.label}>Energy: {energy}%</BionicText>
          <View style={styles.buttonRow}>
            <View style={styles.button} onTouchEnd={() => setEnergy(Math.max(0, energy - 25))}>
              <BionicText style={styles.buttonText}>-25%</BionicText>
            </View>
            <View style={styles.button} onTouchEnd={() => setEnergy(Math.min(100, energy + 25))}>
              <BionicText style={styles.buttonText}>+25%</BionicText>
            </View>
          </View>

          <BionicText style={styles.label}>Time: {timeOfDay}</BionicText>
          <View style={styles.buttonRow}>
            {(['morning', 'afternoon', 'evening', 'night'] as const).map((time) => (
              <View
                key={time}
                style={[styles.button, styles.timeButton]}
                onTouchEnd={() => setTimeOfDay(time)}
              >
                <BionicText style={styles.buttonText}>
                  {time.charAt(0).toUpperCase() + time.slice(1, 3)}
                </BionicText>
              </View>
            ))}
          </View>
        </View>
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
  interactiveContainer: {
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 8,
  },
  controls: {
    gap: 12,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: THEME.cyan,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButton: {
    flex: 0.25,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.base03,
  },
});
