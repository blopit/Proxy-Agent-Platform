// Z-index presets for common content elements - negative values for inset effect
export const Z_LAYERS = {
  BASE: 0,          // Card base
  FLOAT: 70,        // Closest floating elements (least deep)
  HIGHLIGHT: -20,   // Highlighted elements
  PRIMARY: -30,     // Primary content, main text  
  SECONDARY: -50,   // Secondary content
  BACKGROUND: -70   // Deepest background elements
} as const;

// Default border color map
export const DEFAULT_BORDER_COLOR_MAP = {
  purple: "border-purple-200 dark:border-purple-800/50",
  blue: "border-blue-200 dark:border-blue-800/50",
  green: "border-green-200 dark:border-green-800/50",
  teal: "border-teal-200 dark:border-teal-800/50",
  indigo: "border-indigo-200 dark:border-indigo-800/50",
  red: "border-red-200 dark:border-red-800/50",
  orange: "border-orange-200 dark:border-orange-800/50",
  yellow: "border-yellow-200 dark:border-yellow-800/50",
  cyan: "border-cyan-200 dark:border-cyan-800/50",
  violet: "border-violet-200 dark:border-violet-800/50",
  pink: "border-pink-200 dark:border-pink-800/50",
  gray: "border-gray-200 dark:border-gray-800/50",
} as const;

// Default animation settings
export const ANIMATION_SETTINGS = {
  HOVER_SCALE: 1.05,
  MAX_DRAG_DISTANCE: 50,
  PERSPECTIVE: 1000,
  LAYER_MOVEMENT: 1.2,
  PORTAL_DEPTH: 2,
  PEEK_THRESHOLD: 5,
  MAX_PEEK_OFFSET: 50,
} as const; 