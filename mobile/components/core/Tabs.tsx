/**
 * Tabs - Simplified Tab Bar Component
 * Simple icons that get colored when selected with chevron background
 */

import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ChevronElement, ChevronPosition } from './ChevronElement';
import { THEME } from '../../src/theme/colors';
import { Text } from '@/src/components/ui/Text';

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
  containerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  iconSize?: number;
  chevronHeight?: number;
  minHeight?: number;
}

/**
 * Simplified Tabs - Just icons with color + chevron when selected
 */
export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  showLabels = false,
  containerStyle,
  tabStyle,
  iconSize = 24,
  chevronHeight = 52,
  minHeight = 52,
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

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={[styles.tab, { minHeight }, tabStyle]}
            activeOpacity={0.7}
            accessibilityLabel={tab.description}
          >
            {/* Chevron - always present, only visible when selected */}
            {isFocused && (
              <ChevronElement
                backgroundColor={`${tab.color}20`}
                height={chevronHeight}
                width={'100%'}
                chevronDepth={10}
                position={getChevronPosition(index)}
                style={styles.chevronBackground}
              >
                <View style={styles.chevronContent} />
              </ChevronElement>
            )}

            {/* Icon - colored when selected */}
            <View style={styles.iconContainer}>
              {tab.renderContent ? (
                tab.renderContent({ color, isFocused })
              ) : (
                <Icon size={iconSize} color={color} />
              )}

              {/* Badges */}
              {tab.badge && typeof tab.badge === 'number' && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>

            {/* Optional label */}
            {showLabels && tab.label && (
              <Text style={[styles.label, isFocused && { color }]}>
                {tab.label}
              </Text>
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
    backgroundColor: THEME.base03,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  chevronBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  chevronContent: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontSize: 10,
    color: THEME.base01,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: -12,
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
  },
});
