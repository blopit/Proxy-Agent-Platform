/**
 * BionicText - ADHD-friendly bionic reading component
 * Bolds the first part of words to create visual fixation points
 *
 * Based on research:
 * - Uses visual fixation points to guide reading
 * - Anecdotal benefits for ADHD/dyslexia (limited scientific evidence)
 * - Can be completely disabled for normal reading
 */

import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { THEME } from '../../src/theme/colors';

export interface BionicTextProps {
  children: string;
  style?: TextStyle;
  enabled?: boolean; // Enable/disable bionic reading (default true)
  boldRatio?: number; // Ratio of word to bold (0.0 to 1.0, default 0.4)
  baseColor?: string;
  boldColor?: string;
}

/**
 * Calculate how many characters to bold based on word length
 * Based on bionic reading research:
 * - 1-2 letters: First letter only
 * - 3-5 letters: ~40% (1-2 letters)
 * - 6+ letters: ~50% with ratio adjustment
 */
const getBoldLength = (wordLength: number, ratio: number): number => {
  // If ratio is 0 or very small, disable bolding
  if (ratio < 0.01) return 0;

  if (wordLength <= 1) return 1; // Single char gets bolded
  if (wordLength === 2) return 1; // "is", "at" -> first letter
  if (wordLength <= 5) {
    // 3-5 letters: Use ratio but cap at 2
    return Math.min(2, Math.max(1, Math.ceil(wordLength * ratio)));
  }

  // 6+ letters: Use 50% as base, adjusted by ratio
  // ratio=0.4 gives ~50%, ratio=0.3 gives ~40%, ratio=0.5 gives ~60%
  const baseRatio = 0.5;
  const adjustedRatio = baseRatio + (ratio - 0.4) * 0.5;
  return Math.max(1, Math.ceil(wordLength * adjustedRatio));
};

/**
 * Split word into bold and normal parts
 */
const splitWord = (word: string, ratio: number) => {
  const boldLength = getBoldLength(word.length, ratio);
  return {
    bold: word.slice(0, boldLength),
    normal: word.slice(boldLength),
  };
};

export default function BionicText({
  children,
  style,
  enabled = true,
  boldRatio = 0.4,
  baseColor = THEME.base0,
  boldColor = THEME.base0,
}: BionicTextProps) {
  // If bionic reading is disabled, just render normal text
  if (!enabled) {
    return (
      <Text style={[styles.container, style, { color: baseColor }]}>
        {children}
      </Text>
    );
  }

  // Split text into words while preserving spaces and punctuation
  const words = children.split(/(\s+)/);

  return (
    <Text style={[styles.container, style, { color: baseColor }]}>
      {words.map((segment, index) => {
        // If it's whitespace, render as-is
        if (/^\s+$/.test(segment)) {
          return <Text key={index}>{segment}</Text>;
        }

        // Split word from trailing punctuation
        const match = segment.match(/^([a-zA-Z0-9]+)([^\w]*)$/);
        if (!match) {
          return <Text key={index}>{segment}</Text>;
        }

        const [, word, punctuation] = match;
        const { bold, normal } = splitWord(word, boldRatio);

        // If no bold content, render as normal text
        if (!bold) {
          return (
            <Text key={index}>
              {word}
              {punctuation && <Text>{punctuation}</Text>}
            </Text>
          );
        }

        return (
          <Text key={index}>
            <Text style={[styles.bold, { color: boldColor }]}>{bold}</Text>
            <Text>{normal}</Text>
            {punctuation && <Text>{punctuation}</Text>}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    fontSize: 16,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
  },
});
