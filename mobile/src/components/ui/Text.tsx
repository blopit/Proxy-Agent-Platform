/**
 * Custom Text Component with Lexend Font
 * Automatically applies Lexend font family to all text
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { DEFAULT_FONT_FAMILY, getFontFamily } from '@/src/theme/fonts';

export interface TextProps extends RNTextProps {
  /**
   * Font weight - automatically maps to correct Lexend font family
   * Supports: '100', '200', '300', '400', '500', '600', '700', '800', '900', 'normal', 'bold'
   */
  weight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold';
}

/**
 * Text component with Lexend font applied by default
 *
 * Usage:
 * ```tsx
 * <Text>Regular text</Text>
 * <Text weight="600">Semi-bold text</Text>
 * <Text weight="bold">Bold text</Text>
 * <Text style={{ fontSize: 20 }}>Large text</Text>
 * <Text style={{ fontWeight: '600' }}>Semi-bold via style</Text>
 * ```
 */
export const Text: React.FC<TextProps> = ({ style, weight, ...props }) => {
  // Extract fontWeight from style if it exists
  const flatStyle = StyleSheet.flatten(style);
  const styleFontWeight = flatStyle?.fontWeight;

  // Determine which weight to use (prop takes precedence over style)
  const effectiveWeight = weight || styleFontWeight;
  const fontFamily = effectiveWeight ? getFontFamily(effectiveWeight) : DEFAULT_FONT_FAMILY;

  // Remove fontWeight from style since we're using fontFamily instead
  const { fontWeight: _, ...styleWithoutFontWeight } = flatStyle || {};

  return (
    <RNText
      {...props}
      style={[
        styles.defaultText,
        { fontFamily },
        styleWithoutFontWeight,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: DEFAULT_FONT_FAMILY,
  },
});

export default Text;
