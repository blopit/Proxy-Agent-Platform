/**
 * ThemeSwitcher Component
 * Allows users to switch between available themes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { ThemeName, getThemeNames, THEMES } from '@/src/theme/themes';
import { Check } from 'lucide-react-native';

interface ThemeSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

export function ThemeSwitcher({ visible, onClose }: ThemeSwitcherProps) {
  const { themeName, setTheme, colors } = useTheme();
  const allThemes = getThemeNames();

  const handleSelectTheme = async (name: ThemeName) => {
    await setTheme(name);
    // Optional: close modal after selection
    // onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.base02 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.base0 }]}>
              Choose Theme
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.cyan }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>

          {/* Theme List */}
          <ScrollView style={styles.scrollView}>
            {allThemes.map((name) => {
              const theme = THEMES[name];
              const isSelected = name === themeName;

              return (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.themeOption,
                    { borderColor: colors.base01 },
                    isSelected && {
                      backgroundColor: colors.base03,
                      borderColor: colors.cyan,
                    },
                  ]}
                  onPress={() => handleSelectTheme(name)}
                >
                  {/* Theme Preview Colors */}
                  <View style={styles.themeInfo}>
                    <View style={styles.colorPreview}>
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: theme.colors.cyan },
                        ]}
                      />
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: theme.colors.blue },
                        ]}
                      />
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: theme.colors.violet },
                        ]}
                      />
                      <View
                        style={[
                          styles.colorSwatch,
                          { backgroundColor: theme.colors.green },
                        ]}
                      />
                    </View>

                    {/* Theme Name & Description */}
                    <View style={styles.textContainer}>
                      <Text style={[styles.themeName, { color: colors.base0 }]}>
                        {theme.displayName}
                      </Text>
                      <Text
                        style={[styles.themeDescription, { color: colors.base01 }]}
                      >
                        {theme.description}
                      </Text>
                    </View>
                  </View>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <Check size={24} color={colors.cyan} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
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
  themeInfo: {
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
    width: 8,
    height: 40,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
  },
});

/**
 * Simple Theme Switcher Button
 * Can be placed anywhere in the app
 */
export function ThemeSwitcherButton() {
  const [visible, setVisible] = useState(false);
  const { colors, theme } = useTheme();

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.base02 }]}
        onPress={() => setVisible(true)}
      >
        {/* Color indicator */}
        <View style={styles.buttonColorPreview}>
          <View style={[styles.buttonSwatch, { backgroundColor: colors.cyan }]} />
          <View style={[styles.buttonSwatch, { backgroundColor: colors.blue }]} />
          <View style={[styles.buttonSwatch, { backgroundColor: colors.violet }]} />
        </View>
        <Text style={[styles.buttonText, { color: colors.base0 }]}>
          {theme.displayName}
        </Text>
      </TouchableOpacity>

      <ThemeSwitcher visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

const buttonStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  buttonColorPreview: {
    flexDirection: 'row',
    gap: 2,
  },
  buttonSwatch: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

Object.assign(styles, buttonStyles);
