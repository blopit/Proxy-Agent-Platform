/**
 * OpenMoji Icon Component
 * Renders emoji using native platform emoji rendering
 * Provides a simple, performant, and CORS-free emoji display
 *
 * Usage:
 *   <OpenMoji emoji="🎯" size={32} />
 *   <OpenMoji code="1F3AF" size={48} />
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export interface OpenMojiProps {
  /** Emoji character (e.g., "🎯") or Unicode codepoint (e.g., "1F3AF") */
  emoji?: string;
  code?: string;
  /** Size of the icon in pixels */
  size?: number;
  /** Color override - Note: Native emojis don't support color changes */
  color?: string;
  /** Optional style override */
  style?: any;
}

/**
 * Convert Unicode codepoint to emoji character
 * Example: "1F3AF" → "🎯"
 */
function codepointToEmoji(code: string): string {
  // Split by hyphen for multi-codepoint emojis (e.g., "1F468-200D-1F4BB")
  const codePoints = code.split('-').map(hex => parseInt(hex, 16));
  return String.fromCodePoint(...codePoints);
}

/**
 * OpenMoji component - Renders native emoji
 * Uses platform native emoji rendering for maximum compatibility and performance
 */
export default function OpenMoji({
  emoji,
  code,
  size = 24,
  color,
  style
}: OpenMojiProps) {
  // Determine the emoji character
  const emojiChar = emoji || (code ? codepointToEmoji(code) : '');

  if (!emojiChar) {
    console.warn('OpenMoji: No emoji or code provided');
    return null;
  }

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text style={[styles.emoji, { fontSize: size, lineHeight: size }]}>
        {emojiChar}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
