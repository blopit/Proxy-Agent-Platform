/**
 * Theme Colors - Solarized Dark Palette (Legacy Export)
 * Centralized color definitions for the mobile app
 *
 * NOTE: For multi-theme support, use:
 * - import { useTheme } from '@/src/theme/ThemeContext'
 * - const { colors } = useTheme()
 *
 * This export maintained for backward compatibility.
 */

import { FONT_FAMILY } from './fonts';
import { SOLARIZED_DARK } from './themes';

// Export Solarized Dark as default THEME for backward compatibility
export const THEME = SOLARIZED_DARK.colors;

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
