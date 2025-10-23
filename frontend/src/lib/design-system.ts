/**
 * Design System - 4px Grid
 * All spacing, sizing, and layout uses multiples of 4px for consistency
 */

export const spacing = {
  0: '0px',       // 0
  1: '4px',       // 4px
  2: '8px',       // 8px
  3: '12px',      // 12px
  4: '16px',      // 16px
  5: '20px',      // 20px
  6: '24px',      // 24px
  7: '28px',      // 28px
  8: '32px',      // 32px
  9: '36px',      // 36px
  10: '40px',     // 40px
  12: '48px',     // 48px
  14: '56px',     // 56px
  16: '64px',     // 64px
  20: '80px',     // 80px
  24: '96px',     // 96px
  28: '112px',    // 112px
  32: '128px',    // 128px
} as const;

export const fontSize = {
  xs: '12px',     // 12px
  sm: '14px',     // 14px
  base: '16px',   // 16px
  lg: '18px',     // 18px
  xl: '20px',     // 20px
  '2xl': '24px',  // 24px
  '3xl': '30px',  // 30px
  '4xl': '36px',  // 36px
} as const;

export const borderRadius = {
  none: '0px',
  sm: '4px',      // 4px
  base: '8px',    // 8px
  md: '12px',     // 12px
  lg: '16px',     // 16px
  xl: '20px',     // 20px
  '2xl': '24px',  // 24px
  '3xl': '32px',  // 32px
  pill: '9999px', // Pill/capsule shape
  full: '9999px', // Legacy alias for pill
} as const;

export const iconSize = {
  xs: 12,   // 12px
  sm: 16,   // 16px
  base: 20, // 20px
  lg: 24,   // 24px
  xl: 28,   // 28px
  '2xl': 32, // 32px
} as const;

export const colors = {
  // Solarized theme
  base03: '#002b36',
  base02: '#073642',
  base01: '#586e75',
  base00: '#657b83',
  base0: '#839496',
  base1: '#93a1a1',
  base2: '#eee8d5',
  base3: '#fdf6e3',
  yellow: '#b58900',
  orange: '#cb4b16',
  red: '#dc322f',
  magenta: '#d33682',
  violet: '#6c71c4',
  blue: '#268bd2',
  cyan: '#2aa198',
  green: '#859900',
} as const;

// Semantic color mappings
export const semanticColors = {
  bg: {
    primary: colors.base03,
    secondary: colors.base02,
    tertiary: colors.base01,
  },
  text: {
    primary: colors.base1,
    secondary: colors.base01,
    muted: colors.base01,
    inverse: colors.base03,
  },
  border: {
    default: colors.base01,
    focus: colors.blue,
    accent: colors.cyan,
  },
  accent: {
    primary: colors.cyan,
    secondary: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
  },
} as const;

// Common component styles
export const buttonStyles = {
  sm: `px-3 py-1 text-sm`,   // 12px, 4px
  base: `px-4 py-2 text-base`, // 16px, 8px
  lg: `px-6 py-3 text-lg`,   // 24px, 12px
} as const;

export const inputStyles = {
  base: `px-3 py-2 text-sm rounded-lg border-2`, // 12px, 8px
} as const;

// Opacity scale (0-100)
export const opacity = {
  0: '0',
  10: '0.1',
  20: '0.2',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  80: '0.8',
  90: '0.9',
  100: '1',
} as const;

// Z-index layering system
export const zIndex = {
  base: 0,
  sticky: 10,
  fixed: 20,
  overlay: 40,
  modal: 50,
  toast: 60,
} as const;

// Shadow depths
export const shadow = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.2)',
  md: '0 2px 8px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
  xl: '0 12px 32px rgba(0, 0, 0, 0.5)',
} as const;

// Helper function for colored shadows
export const coloredShadow = (color: string, opacity = '40') =>
  `0 2px 8px ${color}${opacity}`;

// Transition and animation durations
export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '1000ms',
  slowest: '1500ms',
  pause: '2000ms',
} as const;

// Animation timing constants
export const animation = {
  tickerInterval: { min: 4000, max: 8000 },
  celebration: 1500,
  dropAnimation: 500,
  loadingStage: 2000,
  togglePause: 2000,
  frameRate: 16, // 60fps
} as const;

// Physics constants for animations
export const physics = {
  gravity: 0.5,
  particleSpeed: {
    slow: 5,
    medium: 10,
    fast: 15,
  },
} as const;
