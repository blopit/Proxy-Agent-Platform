/**
 * Theme Colors - Solarized Dark Palette
 * Centralized color definitions for the mobile app
 */

import { FONT_FAMILY } from './fonts';

export const THEME = {
  // Base colors (dark to light)
  base03: '#002b36', // Background highlights
  base02: '#073642', // Background
  base01: '#586e75', // Optional emphasized content
  base00: '#657b83', // Body text / default code / primary content
  base0: '#839496',  // Comments / secondary content
  base1: '#93a1a1',  // De-emphasized content
  base2: '#eee8d5',  // Background highlights (light)
  base3: '#fdf6e3',  // Background (light)

  // Accent colors
  yellow: '#b58900',
  orange: '#cb4b16',
  red: '#dc322f',
  magenta: '#d33682',
  violet: '#6c71c4',
  blue: '#268bd2',
  cyan: '#2aa198',
  green: '#859900',
} as const;

/**
 * Semantic color mappings for common UI elements
 */
export const SEMANTIC_COLORS = {
  background: THEME.base03,
  backgroundElevated: THEME.base02,
  textPrimary: THEME.base0,
  textSecondary: THEME.base01,
  textInactive: THEME.base1,
  border: THEME.base01,

  // Status colors
  success: THEME.green,
  error: THEME.red,
  warning: THEME.yellow,
  info: THEME.blue,

  // Tab colors
  tabInbox: THEME.cyan,
  tabToday: THEME.orange,
  tabProgress: THEME.violet,
} as const;

/**
 * Font family exports for easy access in theme
 */
export const FONTS = FONT_FAMILY;

export type ThemeColor = keyof typeof THEME;
export type SemanticColor = keyof typeof SEMANTIC_COLORS;
