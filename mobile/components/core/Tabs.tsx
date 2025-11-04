/**
 * Tabs - Base Tab Bar Component
 * Reusable foundation for all tab navigation patterns
 */

import React, { ReactNode } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ChevronElement, ChevronPosition } from './ChevronElement';

// Theme colors - Solarized Dark palette
const THEME = {
  base03: '#002b36', // Background highlights
  base02: '#073642', // Background
  base01: '#586e75', // Optional emphasized content
  base00: '#657b83', // Body text / default code / primary content
  base0: '#839496',  // Comments / secondary content
  base1: '#93a1a1',  // De-emphasized content
  base2: '#eee8d5',  // Background highlights (light)
  base3: '#fdf6e3',  // Background (light)
  yellow: '#b58900',
  orange: '#cb4b16',
  red: '#dc322f',
  magenta: '#d33682',
  violet: '#6c71c4',
  blue: '#268bd2',
  cyan: '#2aa198',
  green: '#859900',
};

export interface TabItem<T extends string = string> {
  id: T;
  icon: React.ComponentType<{ color: string; size: number }>;
  label?: string;
  color: string;
  description?: string;
  badge?: number | boolean;
  renderContent?: (props: { color: string; isFocused: boolean }) => ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  showLabels?: boolean;
  showActiveIndicator?: boolean;
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  iconSize?: number;
}

/**
 * Base Tabs component with flexible configuration
 */
export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  showLabels = true,
  showActiveIndicator = false,
  containerStyle,
  tabStyle,
  iconSize = 24,
}: TabsProps<T>) {
  const getChevronPosition = (index: number): ChevronPosition => {
    if (tabs.length === 1) return 'single';
    if (index === 0) return 'start';
    if (index === tabs.length - 1) return 'end';
    return 'middle';
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isFocused = activeTab === tab.id;
        const color = isFocused ? tab.color : THEME.base01;
        const badge = tab.badge;
        const chevronPosition = getChevronPosition(index);

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[
              styles.tab,
              tabStyle,
              isFocused && styles.tabActive,
            ]}
            activeOpacity={0.7}
            accessibilityLabel={tab.description}
          >
            {/* Chevron background for active tab - extends into padding */}
            {isFocused && (
              <ChevronElement
                backgroundColor={`${tab.color}20`}
                height={44}
                width={80}
                chevronDepth={10}
                position={chevronPosition}
                style={styles.chevronBackground}
              >
                <View style={styles.chevronContent} />
              </ChevronElement>
            )}

            {/* Icon container */}
            <View style={styles.iconContainer}>
              {tab.renderContent ? (
                tab.renderContent({ color, isFocused })
              ) : (
                <Icon size={iconSize} color={color} />
              )}

              {/* Numeric badge */}
              {badge && typeof badge === 'number' && badge > 0 && (
                <View style={styles.numericBadge}>
                  <Text style={styles.badgeText}>
                    {badge > 99 ? '99+' : badge}
                  </Text>
                </View>
              )}

              {/* Boolean badge (dot) */}
              {badge && typeof badge === 'boolean' && badge && (
                <View style={styles.booleanBadge} />
              )}
            </View>

            {/* Label */}
            {showLabels && tab.label && (
              <Text
                style={[
                  styles.label,
                  isFocused && { color: tab.color, fontWeight: '600' },
                ]}
              >
                {tab.label}
              </Text>
            )}

            {/* Active indicator */}
            {showActiveIndicator && isFocused && (
              <View
                style={[styles.activeIndicator, { backgroundColor: tab.color }]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: THEME.base03,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    opacity: 0.6,
    position: 'relative',
  },
  tabActive: {
    opacity: 1,
  },
  chevronBackground: {
    position: 'absolute',
    top: -6, // Extend into top padding
    left: '50%',
    marginLeft: -40, // Half of width (80/2) to center horizontally
  },
  chevronContent: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Above chevron background
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    color: THEME.base01,
    marginTop: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 32,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  numericBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.red,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: THEME.base3,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  booleanBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: THEME.green,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: THEME.base03,
  },
});
