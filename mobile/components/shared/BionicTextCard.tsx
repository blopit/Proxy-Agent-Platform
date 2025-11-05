/**
 * BionicTextCard - Card component with bionic reading support
 * Shows how to use BionicText in real UI components
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import BionicText from './BionicText';

export interface BionicTextCardProps {
  title?: string;
  content: string;
  boldRatio?: number;
  defaultBionicEnabled?: boolean;
  showToggle?: boolean;
}

export default function BionicTextCard({
  title,
  content,
  boldRatio = 0.4,
  defaultBionicEnabled = true,
  showToggle = true,
}: BionicTextCardProps) {
  const [bionicEnabled, setBionicEnabled] = useState(defaultBionicEnabled);

  return (
    <View style={styles.card}>
      {/* Header with toggle */}
      {(title || showToggle) && (
        <View style={styles.header}>
          {title && (
            <BionicText style={styles.title} boldRatio={0.5}>
              {title}
            </BionicText>
          )}
          {showToggle && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setBionicEnabled(!bionicEnabled)}
              activeOpacity={0.7}
            >
              {bionicEnabled ? (
                <Eye size={20} color={THEME.cyan} />
              ) : (
                <EyeOff size={20} color={THEME.base01} />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Content with optional bionic reading */}
      <BionicText
        style={styles.content}
        enabled={bionicEnabled}
        boldRatio={boldRatio}
      >
        {content}
      </BionicText>

      {/* Info footer */}
      {showToggle && (
        <View style={styles.footer}>
          <BionicText style={styles.footerText} boldRatio={0.4}>
            {bionicEnabled
              ? 'Bionic reading enabled - tap eye icon to toggle'
              : 'Normal reading - tap eye icon for bionic mode'}
          </BionicText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.base01,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.base0,
    flex: 1,
  },
  toggleButton: {
    padding: 8,
    marginLeft: 12,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: THEME.base0,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.base01,
  },
  footerText: {
    fontSize: 12,
    color: THEME.base01,
    fontStyle: 'italic',
  },
});
