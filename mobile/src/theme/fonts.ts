/**
 * Font Configuration - Lexend Font Family
 * Centralized font definitions for the mobile app
 */

import {
  Lexend_100Thin,
  Lexend_200ExtraLight,
  Lexend_300Light,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Lexend_900Black,
} from '@expo-google-fonts/lexend';

/**
 * Font map for expo-font loading
 */
export const FONTS = {
  'Lexend-Thin': Lexend_100Thin,
  'Lexend-ExtraLight': Lexend_200ExtraLight,
  'Lexend-Light': Lexend_300Light,
  'Lexend-Regular': Lexend_400Regular,
  'Lexend-Medium': Lexend_500Medium,
  'Lexend-SemiBold': Lexend_600SemiBold,
  'Lexend-Bold': Lexend_700Bold,
  'Lexend-ExtraBold': Lexend_800ExtraBold,
  'Lexend-Black': Lexend_900Black,
} as const;

/**
 * Font family constants for easy reference in styles
 */
export const FONT_FAMILY = {
  thin: 'Lexend-Thin',
  extraLight: 'Lexend-ExtraLight',
  light: 'Lexend-Light',
  regular: 'Lexend-Regular',
  medium: 'Lexend-Medium',
  semiBold: 'Lexend-SemiBold',
  bold: 'Lexend-Bold',
  extraBold: 'Lexend-ExtraBold',
  black: 'Lexend-Black',
} as const;

/**
 * Default font family (regular weight)
 */
export const DEFAULT_FONT_FAMILY = FONT_FAMILY.regular;

/**
 * Font weight mapping to font families
 * Use this when you want to apply fontWeight in styles
 */
export const FONT_WEIGHT_MAP: Record<string, keyof typeof FONT_FAMILY> = {
  '100': 'thin',
  '200': 'extraLight',
  '300': 'light',
  '400': 'regular',
  '500': 'medium',
  '600': 'semiBold',
  '700': 'bold',
  '800': 'extraBold',
  '900': 'black',
  'normal': 'regular',
  'bold': 'bold',
} as const;

/**
 * Helper function to get font family based on weight
 */
export const getFontFamily = (weight?: string | number): string => {
  const weightStr = weight?.toString() || '400';
  const mappedWeight = FONT_WEIGHT_MAP[weightStr] || 'regular';
  return FONT_FAMILY[mappedWeight];
};

export type FontFamily = keyof typeof FONT_FAMILY;
export type FontWeight = keyof typeof FONT_WEIGHT_MAP;
