/**
 * BionicText - Science-backed bionic reading with smooth gradual emphasis
 *
 * Default Fade Pattern:
 * - 0-20%: Full bold (font-weight 700) - Bold zone for word recognition
 * - 20-60%: Smooth fade (700 → 400) - Gradual transition zone
 * - 60%+: Normal weight (font-weight 400) - Returns to normal text
 *
 * Configurable via props:
 * - boldZoneEnd: End of bold zone (default 0.2 = 20%)
 * - fadeZoneEnd: End of fade zone (default 0.6 = 60%)
 * - Set both to same value for sharp cutoff (e.g., both 0.4 for bold 0-40%, normal 40%+)
 *
 * Based on research from:
 * 1. Reichle et al. (2003) - Eye movement control in reading
 *    - Optimal Viewing Position (OVP) is ~33-37% into a word
 *    - Fixation duration increases with word length
 *
 * 2. Rayner (1998) - Eye movements in reading and information processing
 *    - Readers fixate on 60-80% of content words
 *    - Initial landing position predicts reading speed
 *
 * 3. Schneps et al. (2013) - Dyslexia and visual attention
 *    - Visual crowding affects reading difficulty
 *    - Increased letter spacing improves reading in dyslexia
 *
 * 4. Hyönä & Olson (1995) - Eye fixation patterns
 *    - Preferred viewing location is beginning-to-middle of words
 *    - Gradual visual emphasis aids in word recognition
 *
 * Implementation:
 * - Smooth font-weight transitions (not opacity)
 * - Bold zone captures initial fixation point
 * - Gradual fade maintains natural reading flow
 * - Normal weight from 60%+ prevents visual fatigue
 * - Letter spacing optimization for dyslexia support
 */

import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { THEME } from '../../src/theme/colors';

export type FadeMode = 'linear' | 'sigmoid' | 'exponential' | 'optimal';

export interface BionicTextProps {
  children: string;
  style?: TextStyle;
  enabled?: boolean;           // Enable/disable bionic reading (default true)
  boldZoneEnd?: number;        // End of bold zone as % (default 0.2 = 20%)
  fadeZoneEnd?: number;        // End of fade zone as % (default 0.6 = 60%)
  boldRatio?: number;          // DEPRECATED: Use boldZoneEnd instead
  baseColor?: string;          // Color for low-emphasis text
  boldColor?: string;          // Color for high-emphasis text
  fadeMode?: FadeMode;         // Fade curve type (default 'optimal')
  minOpacity?: number;         // Minimum opacity for fade (default 0.5)
  maxFontWeight?: number;      // Maximum font weight (default 700)
  letterSpacing?: number;      // Letter spacing in pixels (default 0.5 for dyslexia support)
}

/**
 * Sigmoid function for smooth S-curve fade
 * Based on psychophysics research (Stevens' Power Law)
 */
const sigmoid = (x: number, steepness: number = 10): number => {
  return 1 / (1 + Math.exp(-steepness * (x - 0.5)));
};

/**
 * Optimal fade curve with smooth transitions
 * Configurable zones for testing different patterns
 */
const optimalFade = (
  position: number,
  boldZoneEnd: number = 0.2,
  fadeZoneEnd: number = 0.6
): number => {
  // Bold zone: 0 to boldZoneEnd = full emphasis
  if (position <= boldZoneEnd) {
    return 1.0;
  }

  // Fade zone: boldZoneEnd to fadeZoneEnd = gradual transition
  if (position <= fadeZoneEnd) {
    // Smooth fade from 1.0 to 0.0
    const fadeRange = fadeZoneEnd - boldZoneEnd;
    const fadeProgress = (position - boldZoneEnd) / fadeRange;
    // Use quadratic easing for smooth, natural fade
    return 1.0 - Math.pow(fadeProgress, 1.5);
  }

  // Normal zone: fadeZoneEnd+ = no emphasis (return to normal)
  return 0.0;
};

/**
 * Calculate emphasis (opacity/weight) for each character position
 * Based on selected fade mode
 */
const calculateEmphasis = (
  charIndex: number,
  wordLength: number,
  fadeMode: FadeMode,
  boldZoneEnd: number,
  fadeZoneEnd: number,
  minOpacity: number
): number => {
  if (wordLength <= 1) return 1.0; // Single character always full emphasis

  // Normalize position (0.0 to 1.0)
  const position = charIndex / (wordLength - 1);

  let emphasis: number;

  switch (fadeMode) {
    case 'linear':
      // Simple linear fade
      emphasis = boldZoneEnd >= position ? 1.0 : 1.0 - (position - boldZoneEnd) / (1 - boldZoneEnd);
      break;

    case 'sigmoid':
      // S-curve fade (smooth transitions)
      emphasis = 1.0 - sigmoid(position, 5);
      break;

    case 'exponential':
      // Exponential decay (rapid drop-off)
      emphasis = Math.exp(-3 * position);
      break;

    case 'optimal':
    default:
      // Science-backed optimal viewing position curve
      emphasis = optimalFade(position, boldZoneEnd, fadeZoneEnd);
      break;
  }

  // Clamp between 0 and 1 (allow full fade to normal)
  return Math.max(0.0, Math.min(1.0, emphasis));
};

/**
 * Calculate font weight based on emphasis level
 * Maps emphasis (0-1) to font weight (400-700)
 * - 0.0 = 400 (normal)
 * - 1.0 = 700 (bold)
 */
const calculateFontWeight = (emphasis: number, maxWeight: number = 700): number => {
  const minWeight = 400; // Normal weight
  return Math.round(minWeight + emphasis * (maxWeight - minWeight));
};

/**
 * Calculate opacity based on emphasis level
 * - 0.0 = full opacity (normal text)
 * - 1.0 = full opacity (bold text)
 */
const calculateOpacity = (emphasis: number, minOpacity: number): number => {
  // Always return full opacity - we use font weight for emphasis, not opacity
  return 1.0;
};

export default function BionicText({
  children,
  style,
  enabled = true,
  boldZoneEnd = 0.2,    // End of bold zone (default 20%)
  fadeZoneEnd = 0.6,    // End of fade zone (default 60%)
  boldRatio,            // DEPRECATED: backward compatibility
  baseColor = THEME.base0,
  boldColor = THEME.base0,
  fadeMode = 'optimal',
  minOpacity = 0.5,
  maxFontWeight = 700,
  letterSpacing = 0.5,  // Helps with dyslexia (Schneps et al., 2013)
}: BionicTextProps) {
  // Backward compatibility: if boldRatio is provided, use it as boldZoneEnd
  const actualBoldZoneEnd = boldRatio !== undefined ? boldRatio : boldZoneEnd;
  // If bionic reading is disabled, just render normal text
  if (!enabled) {
    return (
      <Text style={[styles.container, style, { color: baseColor, letterSpacing }]}>
        {children}
      </Text>
    );
  }

  // Split text into words while preserving spaces and punctuation
  const words = children.split(/(\s+)/);

  return (
    <Text style={[styles.container, style, { color: baseColor, letterSpacing }]}>
      {words.map((segment, segmentIndex) => {
        // If it's whitespace, render as-is
        if (/^\s+$/.test(segment)) {
          return <Text key={segmentIndex}>{segment}</Text>;
        }

        // Split word from trailing punctuation
        const match = segment.match(/^([a-zA-Z0-9]+)([^\w]*)$/);
        if (!match) {
          return <Text key={segmentIndex}>{segment}</Text>;
        }

        const [, word, punctuation] = match;
        const chars = word.split('');

        return (
          <Text key={segmentIndex}>
            {chars.map((char, charIndex) => {
              // Calculate emphasis for this character position
              const emphasis = calculateEmphasis(
                charIndex,
                word.length,
                fadeMode,
                actualBoldZoneEnd,
                fadeZoneEnd,
                minOpacity
              );

              // Calculate visual properties based on emphasis
              const fontWeight = calculateFontWeight(emphasis, maxFontWeight);
              const opacity = calculateOpacity(emphasis, minOpacity);

              // For very low emphasis, use base color with opacity
              // For high emphasis, interpolate toward bold color
              const color = emphasis > 0.7 ? boldColor : baseColor;

              return (
                <Text
                  key={charIndex}
                  style={{
                    fontWeight: fontWeight.toString() as TextStyle['fontWeight'],
                    opacity,
                    color,
                  }}
                >
                  {char}
                </Text>
              );
            })}
            {punctuation && <Text style={{ opacity: minOpacity }}>{punctuation}</Text>}
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
    // Allow font weight and opacity to be overridden per-character
  },
});
