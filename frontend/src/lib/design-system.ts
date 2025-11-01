/**
 * Design System - Comprehensive Token System
 *
 * This file defines ALL design tokens for the application.
 * ⚠️ DO NOT use hardcoded values in components - always import from here!
 *
 * Benefits:
 * - Single source of truth for all design decisions
 * - Easy theme switching (dark/light/custom)
 * - Consistent spacing and sizing across app
 * - Better TypeScript autocomplete
 * - Maintainable and scalable
 *
 * Usage:
 * ```typescript
 * import { spacing, colors, semanticColors, fontSize, borderRadius } from '@/lib/design-system'
 *
 * // ✅ GOOD: Using design tokens
 * <div style={{ padding: spacing[4], color: semanticColors.text.primary }} />
 *
 * // ❌ BAD: Hardcoded values
 * <div style={{ padding: '16px', color: '#93a1a1' }} />
 * ```
 *
 * @see https://docs.google.com/document/d/DESIGN_SYSTEM for full documentation
 */

// ============================================================================
// SPACING - 4px Grid System
// ============================================================================
/**
 * Spacing scale based on 4px grid
 * Use for padding, margin, gap, width, height
 *
 * @example
 * padding: spacing[4]      // 16px
 * gap: spacing[2]          // 8px
 * marginBottom: spacing[6] // 24px
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

// TypeScript type for spacing keys (enables autocomplete)
export type SpacingKey = keyof typeof spacing;

// ============================================================================
// TYPOGRAPHY - Font Sizes
// ============================================================================
/**
 * Font size scale
 * Use for consistent typography hierarchy
 *
 * @example
 * fontSize: fontSize.base  // 16px - body text
 * fontSize: fontSize.lg    // 20px - emphasized text
 * fontSize: fontSize.xs    // 12px - captions
 */
export const fontSize = {
  xs: '12px',     // 12px - Captions, metadata
  sm: '14px',     // 14px - Secondary information
  base: '16px',   // 16px - Body text (default)
  lg: '20px',     // 20px - Emphasized body text
  xl: '24px',     // 24px - Subsection headers
  '2xl': '28px',  // 28px - Section headers
  '3xl': '32px',  // 32px - Page headers
  '4xl': '36px',  // 36px - Hero text
} as const;

export type FontSizeKey = keyof typeof fontSize;

/**
 * Line height scale for typography
 * Use for consistent text readability
 *
 * @example
 * lineHeight: lineHeight.normal  // 1.5 - body text
 * lineHeight: lineHeight.tight   // 1.2 - headings
 */
export const lineHeight = {
  tight: 1.2,     // Headers, compact cards
  normal: 1.5,    // Body text (default)
  relaxed: 1.75,  // Long-form content
} as const;

export type LineHeightKey = keyof typeof lineHeight;

/**
 * Font weight scale
 * Use for consistent text emphasis
 *
 * @example
 * fontWeight: fontWeight.medium    // 500 - button labels
 * fontWeight: fontWeight.semibold  // 600 - card headers
 */
export const fontWeight = {
  light: 300,     // Minimal aesthetics
  regular: 400,   // Body text (default)
  medium: 500,    // Button labels, emphasized text
  semibold: 600,  // Card headers, section titles
  bold: 700,      // Page headers, critical actions
} as const;

export type FontWeightKey = keyof typeof fontWeight;

// ============================================================================
// BORDER RADIUS - Rounding
// ============================================================================
/**
 * Border radius scale for consistent rounding
 *
 * @example
 * borderRadius: borderRadius.base // 8px - default (buttons, inputs, cards)
 * borderRadius: borderRadius.sm   // 4px - compact elements (badges)
 * borderRadius: borderRadius.lg   // 12px - large cards, modals
 * borderRadius: borderRadius.pill // 9999px - fully rounded (avatars)
 */
export const borderRadius = {
  none: '0px',    // 0px - Sharp corners
  sm: '4px',      // 4px - Compact elements (badges, pills)
  base: '8px',    // 8px - Default (buttons, inputs, cards)
  lg: '12px',     // 12px - Large cards, modals
  xl: '16px',     // 16px - Hero cards, featured content
  '2xl': '24px',  // 24px - Extra large features
  '3xl': '32px',  // 32px - Maximum rounding
  pill: '9999px', // Fully rounded (avatars, status dots)
  full: '9999px', // Legacy alias for pill
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;

// ============================================================================
// ICONS - Sizes
// ============================================================================
/**
 * Icon size scale (in pixels, for lucide-react)
 *
 * @example
 * <Search size={iconSize.sm} />   // 16px
 * <Bot size={iconSize.base} />    // 20px
 * <Zap size={iconSize.lg} />      // 24px
 */
export const iconSize = {
  xs: 12,   // 12px
  sm: 16,   // 16px
  base: 20, // 20px
  lg: 24,   // 24px
  xl: 28,   // 28px
  '2xl': 32, // 32px
} as const;

export type IconSizeKey = keyof typeof iconSize;

// ============================================================================
// COLORS - Solarized Palette
// ============================================================================
/**
 * Base Solarized color palette
 * ⚠️ Prefer using semanticColors for better theme switching!
 *
 * @example
 * // ✅ GOOD: Semantic usage
 * color: semanticColors.text.primary
 *
 * // ⚠️ USE SPARINGLY: Direct color
 * color: colors.cyan  // Only for agent colors, accents, etc.
 */
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

export type ColorKey = keyof typeof colors;

// ============================================================================
// SEMANTIC COLORS - Theme-Aware Color Mappings
// ============================================================================
/**
 * Semantic color system for theme switching
 * ALWAYS use these instead of direct colors for text, backgrounds, borders
 *
 * @example
 * // ✅ CORRECT: Will adapt to theme changes
 * backgroundColor: semanticColors.bg.primary
 * color: semanticColors.text.primary
 * borderColor: semanticColors.border.accent
 *
 * // ❌ WRONG: Hardcoded, won't adapt to themes
 * backgroundColor: '#002b36'
 * color: '#93a1a1'
 */
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

// ============================================================================
// COMPONENT STYLES - Reusable Tailwind Classes
// ============================================================================
/**
 * Pre-built component style classes
 * Use for common UI patterns
 */
export const buttonStyles = {
  sm: `px-3 py-1 text-sm`,   // 12px, 4px
  base: `px-4 py-2 text-base`, // 16px, 8px
  lg: `px-6 py-3 text-lg`,   // 24px, 12px
} as const;

export const inputStyles = {
  base: `px-3 py-2 text-sm rounded-lg border-2`, // 12px, 8px
} as const;

// ============================================================================
// OPACITY - Transparency Scale
// ============================================================================
/**
 * Opacity values (0-100)
 * Use for transparency effects
 *
 * @example
 * opacity: opacity[80]  // 0.8
 * opacity: opacity[50]  // 0.5
 */
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

export type OpacityKey = keyof typeof opacity;

// ============================================================================
// Z-INDEX - Layering System
// ============================================================================
/**
 * Z-index scale for consistent layering
 * Prevents z-index wars and ensures proper stacking
 *
 * @example
 * zIndex: zIndex.sticky  // 10 - sticky headers
 * zIndex: zIndex.modal   // 50 - modals, dialogs
 * zIndex: zIndex.toast   // 60 - notifications
 */
export const zIndex = {
  base: 0,
  sticky: 10,
  fixed: 20,
  overlay: 40,
  modal: 50,
  toast: 60,
} as const;

export type ZIndexKey = keyof typeof zIndex;

// ============================================================================
// SHADOWS - Depth & Elevation
// ============================================================================
/**
 * Shadow scale for depth and elevation
 * Creates visual hierarchy through depth
 *
 * @example
 * boxShadow: shadows.sm   // Subtle elevation (badges, dropdowns)
 * boxShadow: shadows.base // Card elevation (default state)
 * boxShadow: shadows.lg   // Modals, popovers (overlays)
 * boxShadow: coloredShadow(colors.cyan, '30')  // Colored glow
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',        // Subtle elevation
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',       // Card elevation
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',      // Raised cards
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',    // Modals, popovers
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',    // Maximum elevation
} as const;

// Legacy alias for backwards compatibility
export const shadow = shadows;

export type ShadowKey = keyof typeof shadows;

/**
 * Helper function for colored shadows (glows)
 * Creates accent-colored shadows for emphasis
 *
 * @param color - Hex color code
 * @param opacity - Hex opacity (default '40' = ~25%)
 * @example
 * boxShadow: coloredShadow(colors.cyan, '30')
 * boxShadow: coloredShadow('#2aa198', '40')
 */
export const coloredShadow = (color: string, opacity = '40') =>
  `0 2px 8px ${color}${opacity}`;

// ============================================================================
// ANIMATIONS - Timing & Durations
// ============================================================================
/**
 * Animation duration scale
 * Use for consistent transition timing
 *
 * @example
 * transition: `all ${duration.normal}`  // 300ms
 * transitionDuration: duration.fast     // 150ms
 */
export const duration = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '1000ms',
  slowest: '1500ms',
  pause: '2000ms',
} as const;

export type DurationKey = keyof typeof duration;

/**
 * Animation timing constants
 * Specific timing values for app animations
 *
 * @example
 * setTimeout(() => {}, animation.celebration)  // 1500ms
 * setInterval(() => {}, animation.frameRate)   // 16ms (60fps)
 */
export const animation = {
  tickerInterval: { min: 4000, max: 8000 },
  celebration: 1500,
  dropAnimation: 500,
  loadingStage: 2000,
  togglePause: 2000,
  frameRate: 16, // 60fps (~60fps = 1000ms / 60 = 16.67ms)
} as const;

// ============================================================================
// PHYSICS - Animation Physics Constants
// ============================================================================
/**
 * Physics constants for particle animations
 * Used in reward celebrations, particle effects
 *
 * @example
 * vy = vy + physics.gravity  // Apply gravity
 * speed = physics.particleSpeed.fast  // Fast particles
 */
export const physics = {
  gravity: 0.5,
  particleSpeed: {
    slow: 5,
    medium: 10,
    fast: 15,
  },
} as const;

// ============================================================================
// TYPE EXPORTS - For Better TypeScript Support
// ============================================================================
/**
 * Exported types for TypeScript autocomplete and type safety
 */
export type DesignToken = {
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  fontWeight: typeof fontWeight;
  borderRadius: typeof borderRadius;
  iconSize: typeof iconSize;
  colors: typeof colors;
  semanticColors: typeof semanticColors;
  opacity: typeof opacity;
  zIndex: typeof zIndex;
  shadows: typeof shadows;
  duration: typeof duration;
  animation: typeof animation;
  physics: typeof physics;
};

/**
 * Helper type to get all semantic color paths
 * Useful for strict typing in components
 */
export type SemanticColorPath =
  | `bg.${keyof typeof semanticColors.bg}`
  | `text.${keyof typeof semanticColors.text}`
  | `border.${keyof typeof semanticColors.border}`
  | `accent.${keyof typeof semanticColors.accent}`;

// ============================================================================
// HOVER COLORS - Lighter versions for hover states
// ============================================================================
/**
 * Pre-calculated hover colors (slightly lighter versions)
 * Use for consistent hover state styling
 *
 * @example
 * onMouseEnter={(e) => {
 *   e.currentTarget.style.backgroundColor = hoverColors.cyan;
 * }}
 */
export const hoverColors = {
  cyan: '#35b5ac',      // Slightly lighter cyan
  blue: '#3a9ee5',      // Slightly lighter blue
  green: '#96aa00',     // Slightly lighter green
  yellow: '#cb9b00',    // Slightly lighter yellow
  red: '#e64747',       // Slightly lighter red
  orange: '#d65b2a',    // Slightly lighter orange
  magenta: '#dc5694',   // Slightly lighter magenta
  violet: '#8589d4',    // Slightly lighter violet
  base02: '#0a4553',    // Slightly lighter base02
} as const;

export type HoverColorKey = keyof typeof hoverColors;

// ============================================================================
// GRADIENT UTILITIES - Button gradients
// ============================================================================
/**
 * Generate consistent gradient backgrounds
 * Creates linear gradients from lighter to base color
 *
 * @param baseColor - Base color hex code
 * @param lighterColor - Lighter variant hex code
 * @returns CSS linear-gradient string
 *
 * @example
 * background: createGradient(colors.cyan, hoverColors.cyan)
 * // Returns: 'linear-gradient(180deg, #35b5ac 0%, #2aa198 100%)'
 */
export function createGradient(baseColor: string, lighterColor: string): string {
  return `linear-gradient(180deg, ${lighterColor} 0%, ${baseColor} 100%)`;
}

/**
 * Pre-built gradients for common use cases
 */
export const gradients = {
  primary: createGradient(colors.blue, hoverColors.blue),
  success: createGradient(colors.green, hoverColors.green),
  error: createGradient(colors.red, hoverColors.red),
  warning: createGradient(colors.yellow, hoverColors.yellow),
  neutral: createGradient(colors.cyan, hoverColors.cyan),
} as const;

export type GradientKey = keyof typeof gradients;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
/**
 * @example Basic Usage
 * ```tsx
 * import { spacing, semanticColors, borderRadius } from '@/lib/design-system'
 *
 * function MyComponent() {
 *   return (
 *     <div style={{
 *       padding: spacing[4],
 *       backgroundColor: semanticColors.bg.primary,
 *       color: semanticColors.text.primary,
 *       borderRadius: borderRadius.lg
 *     }}>
 *       Content
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Advanced Usage with Animations
 * ```tsx
 * import { duration, shadow, coloredShadow, colors } from '@/lib/design-system'
 *
 * function AnimatedCard() {
 *   return (
 *     <div style={{
 *       transition: `all ${duration.normal}`,
 *       boxShadow: shadow.md,
 *       ':hover': {
 *         boxShadow: coloredShadow(colors.cyan, '30'),
 *         transform: 'scale(1.02)'
 *       }
 *     }}>
 *       Card
 *     </div>
 *   )
 * }
 * ```
 *
 * @example Hover Colors
 * ```tsx
 * import { colors, hoverColors } from '@/lib/design-system'
 *
 * function HoverButton() {
 *   return (
 *     <button
 *       style={{ backgroundColor: colors.cyan }}
 *       onMouseEnter={(e) => {
 *         e.currentTarget.style.backgroundColor = hoverColors.cyan;
 *       }}
 *       onMouseLeave={(e) => {
 *         e.currentTarget.style.backgroundColor = colors.cyan;
 *       }}
 *     >
 *       Hover me
 *     </button>
 *   )
 * }
 * ```
 *
 * @example Gradients
 * ```tsx
 * import { gradients } from '@/lib/design-system'
 *
 * function GradientButton() {
 *   return (
 *     <button style={{ background: gradients.primary }}>
 *       Primary Action
 *     </button>
 *   )
 * }
 * ```
 */
