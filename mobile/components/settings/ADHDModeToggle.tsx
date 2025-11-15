/**
 * ADHD Mode Toggle - Settings Component
 *
 * Toggle for enabling/disabling ADHD Mode which auto-splits
 * tasks > 5 minutes into 2-5 minute micro-steps.
 *
 * Epic 7 Frontend Integration (Day 4-5)
 */

import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSettings } from '@/src/contexts/SettingsContext';
import BionicText from '../shared/BionicText';
import { Brain, Info } from 'lucide-react-native';

// ============================================================================
// Props
// ============================================================================

interface ADHDModeToggleProps {
  showDescription?: boolean;
  onToggle?: (enabled: boolean) => void;
}

// ============================================================================
// Component
// ============================================================================

export default function ADHDModeToggle({
  showDescription = true,
  onToggle,
}: ADHDModeToggleProps) {
  const { colors } = useTheme();
  const { settings, toggleADHDMode } = useSettings();

  const handleToggle = async () => {
    await toggleADHDMode();
    onToggle?.(! settings.adhdMode);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.base02 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Brain size={24} color={settings.adhdMode ? colors.orange : colors.base01} />
          <BionicText style={[styles.title, { color: colors.base0 }]}>
            ADHD Mode
          </BionicText>

          {settings.adhdMode && (
            <View style={[styles.activeBadge, { backgroundColor: colors.orange }]}>
              <BionicText style={[styles.activeText, { color: colors.base03 }]}>
                ACTIVE
              </BionicText>
            </View>
          )}
        </View>

        <Switch
          value={settings.adhdMode}
          onValueChange={handleToggle}
          trackColor={{ false: colors.base01, true: colors.orange }}
          thumbColor={colors.base03}
          ios_backgroundColor={colors.base01}
        />
      </View>

      {/* Description */}
      {showDescription && (
        <View style={styles.description}>
          <Info size={16} color={colors.base01} />
          <BionicText style={[styles.descriptionText, { color: colors.base01 }]}>
            {settings.adhdMode
              ? 'Tasks over 5 minutes are automatically broken into 2-5 minute micro-steps using AI.'
              : 'Enable to automatically split overwhelming tasks into bite-sized, dopamine-friendly micro-steps.'}
          </BionicText>
        </View>
      )}

      {/* Features List (when enabled) */}
      {settings.adhdMode && showDescription && (
        <View style={styles.features}>
          <BionicText style={[styles.featuresTitle, { color: colors.cyan }]}>
            What ADHD Mode Does:
          </BionicText>

          <View style={styles.feature}>
            <BionicText style={[styles.bullet, { color: colors.green }]}>✓</BionicText>
            <BionicText style={[styles.featureText, { color: colors.base0 }]}>
              Auto-splits tasks &gt; 5 min into 2-5 min steps
            </BionicText>
          </View>

          <View style={styles.feature}>
            <BionicText style={[styles.bullet, { color: colors.green }]}>✓</BionicText>
            <BionicText style={[styles.featureText, { color: colors.base0 }]}>
              Shows delegation mode (DO, DO_WITH_ME, DELEGATE)
            </BionicText>
          </View>

          <View style={styles.feature}>
            <BionicText style={[styles.bullet, { color: colors.green }]}>✓</BionicText>
            <BionicText style={[styles.featureText, { color: colors.base0 }]}>
              Provides immediate first step clarity
            </BionicText>
          </View>

          <View style={styles.feature}>
            <BionicText style={[styles.bullet, { color: colors.green }]}>✓</BionicText>
            <BionicText style={[styles.featureText, { color: colors.base0 }]}>
              Awards XP for each micro-step completion
            </BionicText>
          </View>
        </View>
      )}

      {/* Call to Action (when disabled) */}
      {!settings.adhdMode && showDescription && (
        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.orange }]}
          onPress={handleToggle}
        >
          <BionicText style={[styles.ctaText, { color: colors.base03 }]}>
            Enable ADHD Mode
          </BionicText>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  description: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  descriptionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  features: {
    gap: 10,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  feature: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 14,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
