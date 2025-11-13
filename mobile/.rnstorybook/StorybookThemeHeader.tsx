/**
 * Storybook Theme Picker Header
 * Displays a theme picker at the top of all Storybook stories
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemeName, THEMES, getThemeNames } from '../src/theme/themes';
import { Check, Palette } from 'lucide-react-native';

interface StorybookThemeHeaderProps {
  currentTheme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export function StorybookThemeHeader({ currentTheme, onThemeChange }: StorybookThemeHeaderProps) {
  const { colors, themeName, setTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const allThemes = getThemeNames();

  // Sync Storybook global theme with ThemeProvider
  useEffect(() => {
    if (currentTheme !== themeName) {
      setTheme(currentTheme);
    }
  }, [currentTheme]);

  // Sync ThemeProvider theme with Storybook global
  useEffect(() => {
    if (themeName !== currentTheme) {
      onThemeChange(themeName);
    }
  }, [themeName]);

  const handleThemeSelect = (name: ThemeName) => {
    onThemeChange(name);
    setTheme(name);
    setIsExpanded(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.base02, borderBottomColor: colors.base01 }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Palette size={20} color={colors.cyan} />
          <Text style={[styles.headerTitle, { color: colors.base0 }]}>
            Storybook Theme
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.base03, borderColor: colors.base01 }]}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.themeButtonContent}>
            <View style={styles.colorSwatches}>
              <View style={[styles.swatch, { backgroundColor: THEMES[currentTheme].colors.cyan }]} />
              <View style={[styles.swatch, { backgroundColor: THEMES[currentTheme].colors.blue }]} />
              <View style={[styles.swatch, { backgroundColor: THEMES[currentTheme].colors.violet }]} />
            </View>
            <Text style={[styles.themeButtonText, { color: colors.base0 }]}>
              {THEMES[currentTheme].displayName}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {isExpanded && (
        <View style={[styles.themeList, { backgroundColor: colors.base03 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
            {allThemes.map((name) => {
              const theme = THEMES[name];
              const isSelected = name === currentTheme;

              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: colors.base02,
                      borderColor: isSelected ? colors.cyan : colors.base01,
                    },
                  ]}
                  onPress={() => handleThemeSelect(name)}
                >
                  <View style={styles.themeOptionContent}>
                    <View style={styles.themeColorPreview}>
                      <View style={[styles.previewSwatch, { backgroundColor: theme.colors.cyan }]} />
                      <View style={[styles.previewSwatch, { backgroundColor: theme.colors.blue }]} />
                      <View style={[styles.previewSwatch, { backgroundColor: theme.colors.violet }]} />
                      <View style={[styles.previewSwatch, { backgroundColor: theme.colors.green }]} />
                    </View>
                    <Text style={[styles.themeOptionText, { color: colors.base0 }]}>
                      {theme.displayName}
                    </Text>
                    {isSelected && (
                      <Check size={16} color={colors.cyan} strokeWidth={2.5} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: 3,
  },
  swatch: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeList: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  themeOption: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
  },
  themeOptionContent: {
    alignItems: 'center',
    gap: 8,
  },
  themeColorPreview: {
    flexDirection: 'row',
    gap: 3,
  },
  previewSwatch: {
    width: 6,
    height: 24,
    borderRadius: 3,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
