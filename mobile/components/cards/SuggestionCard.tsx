/**
 * SuggestionCard - React Native Version
 * 40px tall card for AI-powered suggestions
 *
 * Features:
 * - Fixed 40px height for compact display
 * - Overlapping circular brand icons (avatar stack)
 * - Truncated suggestion text
 * - Optional metadata badge
 * - Dismiss button
 * - Add button with ChevronButton
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Plus } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import ChevronButton from '../core/ChevronButton';
import { Text } from '@/src/components/ui/Text';

export interface Source {
  iconSvg: string; // SVG path data
  iconColor: string; // Brand color
  name: string; // Brand name
}

export interface SuggestionCardProps {
  text: string;
  sources: Source[];
  metadata?: string;
  onAdd: () => void;
  onDismiss: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  text,
  sources,
  metadata,
  onAdd,
  onDismiss,
}) => {
  return (
    <View style={styles.container}>
      {/* Brand source icons (overlapping) */}
      <View
        style={[
          styles.sourcesContainer,
          { width: sources.length === 1 ? 24 : 24 + (sources.length - 1) * 14 },
        ]}
      >
        {sources.map((source, index) => (
          <View
            key={index}
            style={[
              styles.sourceIcon,
              {
                left: index * 14,
                zIndex: sources.length - index,
              },
            ]}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d={source.iconSvg} fill={source.iconColor} />
            </Svg>
          </View>
        ))}
      </View>

      {/* Suggestion text (truncated) */}
      <Text style={styles.text} numberOfLines={1}>
        {text}
      </Text>

      {/* Metadata badge */}
      {metadata && (
        <View style={styles.metadataBadge}>
          <Text style={styles.metadataText}>{metadata}</Text>
        </View>
      )}

      {/* Dismiss button */}
      <TouchableOpacity
        onPress={onDismiss}
        style={styles.dismissButton}
        activeOpacity={0.6}
        accessibilityLabel="Dismiss suggestion"
      >
        <X size={14} color="#586e75" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Add button */}
      <View style={styles.addButton}>
        <ChevronButton
          variant="primary"
          position="single"
          onPress={onAdd}
          width={32}
        >
          <Plus size={14} color="#fdf6e3" strokeWidth={2.5} />
        </ChevronButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#073642', // Solarized base02
    borderWidth: 1,
    borderColor: '#586e75',
    borderRadius: 6,
    gap: 8,
  },
  sourcesContainer: {
    position: 'relative',
    height: 24,
    flexShrink: 0,
  },
  sourceIcon: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#002b36', // Solarized base03
    borderWidth: 2,
    borderColor: '#073642',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#93a1a1', // Solarized base1
  },
  metadataBadge: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#002b36',
    borderRadius: 4,
  },
  metadataText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#586e75',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dismissButton: {
    flexShrink: 0,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexShrink: 0,
  },
});

export default SuggestionCard;
