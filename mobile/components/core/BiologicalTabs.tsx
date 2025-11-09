/**
 * BiologicalTabs - React Native Version
 * 5 biological workflow mode tabs
 *
 * Modes:
 * - Add (Quick Capture)
 * - Scout (Forager)
 * - Hunt (Predator)
 * - Recharge (Herd)
 * - Map (Elder)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Search, Target, Heart, Map, Plus } from 'lucide-react-native';
import ChevronStep, { ChevronPosition } from './ChevronStep';

interface BiologicalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  energy: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  showLabels?: boolean;
}

interface BiologicalCircuit {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  description: string;
  purpose: string;
  isOptimal: boolean;
}

const BiologicalTabs: React.FC<BiologicalTabsProps> = ({
  activeTab,
  onTabChange,
  energy,
  timeOfDay,
  showLabels = false,
}) => {
  // Define the 5 biological circuits
  const circuits: BiologicalCircuit[] = [
    {
      id: 'add',
      name: 'Add',
      icon: Plus,
      description: 'Quick Thought Capture',
      purpose: 'Capture thoughts instantly',
      isOptimal: true, // Always available
    },
    {
      id: 'scout',
      name: 'Scout',
      icon: Search,
      description: 'Forager / Primate',
      purpose: 'Seek novelty & identify doable micro-targets',
      isOptimal: timeOfDay === 'morning' || (timeOfDay === 'afternoon' && energy > 60),
    },
    {
      id: 'hunt',
      name: 'Hunt',
      icon: Target,
      description: 'Predator',
      purpose: 'Enter pursuit flow and harvest reward',
      isOptimal: timeOfDay === 'morning' || energy > 70,
    },
    {
      id: 'recharge',
      name: 'Recharge',
      icon: Heart,
      description: 'Herd / Parasympathetic',
      purpose: 'Recover energy & rebuild cognitive tissue',
      isOptimal: timeOfDay === 'afternoon' || energy < 40,
    },
    {
      id: 'map',
      name: 'Map',
      icon: Map,
      description: 'Elder / Hippocampal replay',
      purpose: 'Consolidate memory and recalibrate priorities',
      isOptimal: timeOfDay === 'evening' || timeOfDay === 'night',
    },
  ];

  // Determine chevron position
  const getPosition = (index: number, total: number): ChevronPosition => {
    if (index === 0) return 'first';
    if (index === total - 1) return 'last';
    return 'middle';
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {circuits.map((circuit, index) => {
          const IconComponent = circuit.icon;
          const isActive = activeTab === circuit.id;

          return (
            <View key={circuit.id} style={styles.tabWrapper}>
              <ChevronStep
                status={isActive ? 'active_tab' : 'tab'}
                position={getPosition(index, circuits.length)}
                size="micro"
                onClick={() => onTabChange(circuit.id)}
                ariaLabel={`${circuit.name} - ${circuit.description}`}
              >
                {showLabels ? (
                  // Icon + Label
                  <View style={styles.tabContentWithLabel}>
                    <IconComponent
                      size={16}
                      strokeWidth={2.5}
                      color={isActive ? '#268bd2' : '#93a1a1'}
                    />
                    <View style={styles.label}>
                      <View style={styles.labelText}>
                        {circuit.name}
                      </View>
                    </View>
                  </View>
                ) : (
                  // Icon only
                  <View style={styles.tabContent}>
                    <IconComponent
                      size={18}
                      strokeWidth={2.5}
                      color={isActive ? '#268bd2' : '#93a1a1'}
                    />
                  </View>
                )}
              </ChevronStep>

              {/* Optimal indicator */}
              {circuit.isOptimal && !isActive && circuit.id !== 'add' && (
                <View style={styles.optimalIndicator} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'stretch',
  },
  tabWrapper: {
    flex: 1,
    position: 'relative',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentWithLabel: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.025,
  },
  labelText: {
    fontSize: 9,
  },
  optimalIndicator: {
    position: 'absolute',
    top: -4,
    left: '50%',
    transform: [{ translateX: -3 }],
    width: 6,
    height: 6,
    backgroundColor: '#b58900', // Solarized yellow
    borderRadius: 3,
    boxShadow: '0px 0px 4px #b5890099', // 99 = 60% opacity in hex
    elevation: 4,
  },
});

export default BiologicalTabs;
