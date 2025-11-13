/**
 * Storybook Control Panel - Top Header
 * Replaces floating button with a comprehensive header panel
 * Includes: Theme picker, Grid toggle, Viewport selector, Component sizing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeContext';
import { ThemeName, THEMES, getThemeNames } from '../src/theme/themes';
import {
  Palette,
  Grid3x3,
  Monitor,
  Maximize2,
  ChevronDown,
  Check,
  X,
} from 'lucide-react-native';
import { useControlPanel, ViewportSize, ComponentSize, VIEWPORT_CONFIGS } from './StorybookControlPanelContext';

const COMPONENT_SIZES: { value: ComponentSize; label: string; scale: number }[] = [
  { value: 'small', label: 'Small (0.75x)', scale: 0.75 },
  { value: 'medium', label: 'Medium (1x)', scale: 1.0 },
  { value: 'large', label: 'Large (1.25x)', scale: 1.25 },
  { value: 'xlarge', label: 'XLarge (1.5x)', scale: 1.5 },
];

export function StorybookControlPanel() {
  const { colors, themeName, setTheme } = useTheme();
  const {
    showGrid,
    viewport,
    componentSize,
    setShowGrid,
    setViewport,
    setComponentSize,
    toggleGrid,
  } = useControlPanel();

  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [viewportPickerOpen, setViewportPickerOpen] = useState(false);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);

  const allThemes = getThemeNames();
  const currentTheme = THEMES[themeName];
  const currentViewport = VIEWPORT_CONFIGS[viewport];
  const currentSize = COMPONENT_SIZES.find((s) => s.value === componentSize);

  // Get safe area insets for proper positioning
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : insets.top;

  const handleThemeSelect = async (name: ThemeName) => {
    await setTheme(name);
    setThemePickerOpen(false);
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.base02,
          borderBottomColor: colors.base01,
          paddingTop: statusBarHeight + 8,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.headerContent}
      >
        {/* Theme Picker */}
        <View style={styles.controlGroup}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.base03, borderColor: colors.base01 }]}
            onPress={() => setThemePickerOpen(true)}
          >
            <Palette size={16} color={colors.cyan} />
            <Text style={[styles.controlLabel, { color: colors.base0 }]} numberOfLines={1}>
              {currentTheme.displayName}
            </Text>
            <ChevronDown size={14} color={colors.base01} />
          </TouchableOpacity>

          <Modal
            visible={themePickerOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setThemePickerOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setThemePickerOpen(false)}
            >
              <View
                style={[styles.pickerModal, { backgroundColor: colors.base02, borderColor: colors.base01 }]}
                onStartShouldSetResponder={() => true}
              >
                <View style={[styles.pickerHeader, { borderBottomColor: colors.base01 }]}>
                  <Text style={[styles.pickerTitle, { color: colors.base0 }]}>Choose Theme</Text>
                  <TouchableOpacity onPress={() => setThemePickerOpen(false)}>
                    <X size={20} color={colors.base0} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerContent}>
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
                        {isSelected && <Check size={18} color={colors.cyan} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Grid Toggle */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: showGrid ? colors.cyan : colors.base03,
              borderColor: showGrid ? colors.cyan : colors.base01,
            },
          ]}
          onPress={toggleGrid}
        >
          <Grid3x3 size={16} color={showGrid ? colors.base03 : colors.base0} />
          <Text
            style={[
              styles.controlLabel,
              { color: showGrid ? colors.base03 : colors.base0 },
            ]}
          >
            Grid
          </Text>
        </TouchableOpacity>

        {/* Viewport Selector */}
        <View style={styles.controlGroup}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.base03, borderColor: colors.base01 }]}
            onPress={() => setViewportPickerOpen(true)}
          >
            <Monitor size={16} color={colors.blue} />
            <Text style={[styles.controlLabel, { color: colors.base0 }]} numberOfLines={1}>
              {currentViewport.label}
            </Text>
            <ChevronDown size={14} color={colors.base01} />
          </TouchableOpacity>

          <Modal
            visible={viewportPickerOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setViewportPickerOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setViewportPickerOpen(false)}
            >
              <View
                style={[styles.pickerModal, { backgroundColor: colors.base02, borderColor: colors.base01 }]}
                onStartShouldSetResponder={() => true}
              >
                <View style={[styles.pickerHeader, { borderBottomColor: colors.base01 }]}>
                  <Text style={[styles.pickerTitle, { color: colors.base0 }]}>Viewport</Text>
                  <TouchableOpacity onPress={() => setViewportPickerOpen(false)}>
                    <X size={20} color={colors.base0} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerContent}>
                  {Object.values(VIEWPORT_CONFIGS).map((config) => {
                    const isSelected = config.name === viewport;
                    return (
                      <TouchableOpacity
                        key={config.name}
                        style={[
                          styles.viewportOption,
                          {
                            backgroundColor: colors.base03,
                            borderColor: isSelected ? colors.blue : colors.base01,
                          },
                        ]}
                        onPress={() => {
                          setViewport(config.name);
                          setViewportPickerOpen(false);
                        }}
                      >
                        <View style={styles.viewportInfo}>
                          <Text style={[styles.viewportLabel, { color: colors.base0 }]}>
                            {config.label}
                          </Text>
                          <Text style={[styles.viewportDimensions, { color: colors.base01 }]}>
                            {config.width} × {config.height}px
                          </Text>
                        </View>
                        {isSelected && <Check size={18} color={colors.blue} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Component Size Selector */}
        <View style={styles.controlGroup}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.base03, borderColor: colors.base01 }]}
            onPress={() => setSizePickerOpen(true)}
          >
            <Maximize2 size={16} color={colors.violet} />
            <Text style={[styles.controlLabel, { color: colors.base0 }]} numberOfLines={1}>
              {currentSize?.label || 'Size'}
            </Text>
            <ChevronDown size={14} color={colors.base01} />
          </TouchableOpacity>

          <Modal
            visible={sizePickerOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSizePickerOpen(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setSizePickerOpen(false)}
            >
              <View
                style={[styles.pickerModal, { backgroundColor: colors.base02, borderColor: colors.base01 }]}
                onStartShouldSetResponder={() => true}
              >
                <View style={[styles.pickerHeader, { borderBottomColor: colors.base01 }]}>
                  <Text style={[styles.pickerTitle, { color: colors.base0 }]}>Component Size</Text>
                  <TouchableOpacity onPress={() => setSizePickerOpen(false)}>
                    <X size={20} color={colors.base0} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.pickerContent}>
                  {COMPONENT_SIZES.map((size) => {
                    const isSelected = size.value === componentSize;
                    return (
                      <TouchableOpacity
                        key={size.value}
                        style={[
                          styles.sizeOption,
                          {
                            backgroundColor: colors.base03,
                            borderColor: isSelected ? colors.violet : colors.base01,
                          },
                        ]}
                        onPress={() => {
                          setComponentSize(size.value);
                          setSizePickerOpen(false);
                        }}
                      >
                        <Text style={[styles.sizeLabel, { color: colors.base0 }]}>
                          {size.label}
                        </Text>
                        {isSelected && <Check size={18} color={colors.violet} strokeWidth={2.5} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 12,
    minHeight: 50,
    zIndex: 10000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Ensure header is above everything
    ...Platform.select({
      ios: {
        zIndex: 10000,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  controlGroup: {
    position: 'relative',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    maxWidth: 180,
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  pickerContent: {
    maxHeight: 400,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    margin: 12,
    marginBottom: 0,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorPreview: {
    flexDirection: 'row',
    marginRight: 12,
    gap: 4,
  },
  colorSwatch: {
    width: 5,
    height: 28,
    borderRadius: 2.5,
  },
  themeTextContainer: {
    flex: 1,
  },
  themeName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  themeDescription: {
    fontSize: 12,
  },
  viewportOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    margin: 12,
    marginBottom: 0,
  },
  viewportInfo: {
    flex: 1,
  },
  viewportLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  viewportDimensions: {
    fontSize: 12,
  },
  sizeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    margin: 12,
    marginBottom: 0,
  },
  sizeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
