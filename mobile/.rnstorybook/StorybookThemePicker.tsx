/**
 * Storybook Theme Picker - Floating Button
 * Appears as part of Storybook UI overlay, not inside story content
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemeName, THEMES, getThemeNames } from '../src/theme/themes';
import { Palette, X, Check } from 'lucide-react-native';

export function StorybookThemePicker() {
  const { colors, themeName, setTheme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const allThemes = getThemeNames();

  const handleThemeSelect = async (name: ThemeName) => {
    await setTheme(name);
    setIsModalVisible(false);
  };

  return (
    <>
      {/* Floating Theme Picker Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.base02, borderColor: colors.base01 }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Palette size={20} color={colors.cyan} />
      </TouchableOpacity>

      {/* Theme Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.base02 }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.base01 }]}>
              <Text style={[styles.modalTitle, { color: colors.base0 }]}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <X size={24} color={colors.base0} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.themeList}>
              {allThemes.map((name) => {
                const theme = THEMES[name];
                const isSelected = name === themeName;

                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: colors.base03,
                        borderColor: isSelected ? colors.cyan : colors.base01,
                      },
                    ]}
                    onPress={() => handleThemeSelect(name)}
                  >
                    <View style={styles.themeOptionContent}>
                      <View style={styles.colorPreview}>
                        <View style={[styles.colorSwatch, { backgroundColor: theme.colors.cyan }]} />
                        <View style={[styles.colorSwatch, { backgroundColor: theme.colors.blue }]} />
                        <View style={[styles.colorSwatch, { backgroundColor: theme.colors.violet }]} />
                        <View style={[styles.colorSwatch, { backgroundColor: theme.colors.green }]} />
                      </View>
                      <View style={styles.themeTextContainer}>
                        <Text style={[styles.themeName, { color: colors.base0 }]}>
                          {theme.displayName}
                        </Text>
                        <Text style={[styles.themeDescription, { color: colors.base01 }]}>
                          {theme.description}
                        </Text>
                      </View>
                    </View>
                    {isSelected && <Check size={20} color={colors.cyan} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  themeList: {
    padding: 20,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorPreview: {
    flexDirection: 'row',
    marginRight: 16,
    gap: 4,
  },
  colorSwatch: {
    width: 6,
    height: 32,
    borderRadius: 3,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 12,
  },
});
