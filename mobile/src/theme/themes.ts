/**
 * Theme Definitions - Multiple Theme Support
 *
 * Supports multiple color schemes optimized for ADHD productivity:
 * - Solarized Dark/Light (current)
 * - Nord (cool, calming blues)
 * - Dracula (vibrant, high contrast)
 * - Catppuccin (soft pastels)
 * - High Contrast (accessibility)
 */

export type ThemeName =
  | 'solarized-dark'
  | 'solarized-light'
  | 'nord'
  | 'dracula'
  | 'catppuccin-mocha'
  | 'high-contrast';

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: {
    // Base colors (background to foreground)
    base03: string; // Background highlights
    base02: string; // Background
    base01: string; // Optional emphasized content
    base00: string; // Body text / default code / primary content
    base0: string;  // Comments / secondary content
    base1: string;  // De-emphasized content
    base2: string;  // Background highlights (light)
    base3: string;  // Background (light)

    // Accent colors
    yellow: string;
    orange: string;
    red: string;
    magenta: string;
    violet: string;
    blue: string;
    cyan: string;
    green: string;
  };
}

/**
 * Solarized Dark - Original ADHD-optimized theme
 * Low contrast, warm tones, reduces eye strain
 */
export const SOLARIZED_DARK: Theme = {
  name: 'solarized-dark',
  displayName: 'Solarized Dark',
  description: 'Warm, low-contrast dark theme (default)',
  colors: {
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
  },
};

/**
 * Solarized Light - Light variant
 * Same palette, inverted for light mode
 */
export const SOLARIZED_LIGHT: Theme = {
  name: 'solarized-light',
  displayName: 'Solarized Light',
  description: 'Warm, low-contrast light theme',
  colors: {
    base03: '#fdf6e3',
    base02: '#eee8d5',
    base01: '#93a1a1',
    base00: '#839496',
    base0: '#657b83',
    base1: '#586e75',
    base2: '#073642',
    base3: '#002b36',
    yellow: '#b58900',
    orange: '#cb4b16',
    red: '#dc322f',
    magenta: '#d33682',
    violet: '#6c71c4',
    blue: '#268bd2',
    cyan: '#2aa198',
    green: '#859900',
  },
};

/**
 * Nord - Cool, calming blues
 * Popular for reducing stress, cool color temperature
 */
export const NORD: Theme = {
  name: 'nord',
  displayName: 'Nord',
  description: 'Cool, calming arctic theme',
  colors: {
    base03: '#2e3440', // Polar Night 0
    base02: '#3b4252', // Polar Night 1
    base01: '#4c566a', // Polar Night 3
    base00: '#d8dee9', // Snow Storm 0
    base0: '#e5e9f0',  // Snow Storm 1
    base1: '#eceff4',  // Snow Storm 2
    base2: '#d8dee9',
    base3: '#eceff4',
    yellow: '#ebcb8b', // Aurora Yellow
    orange: '#d08770', // Aurora Orange
    red: '#bf616a',    // Aurora Red
    magenta: '#b48ead', // Aurora Purple
    violet: '#5e81ac',  // Frost Blue
    blue: '#81a1c1',    // Frost Light Blue
    cyan: '#88c0d0',    // Frost Cyan
    green: '#a3be8c',   // Aurora Green
  },
};

/**
 * Dracula - Vibrant, high contrast
 * High energy, excellent for focus mode
 */
export const DRACULA: Theme = {
  name: 'dracula',
  displayName: 'Dracula',
  description: 'Vibrant, high-contrast dark theme',
  colors: {
    base03: '#282a36', // Background
    base02: '#44475a', // Current Line
    base01: '#6272a4', // Comment
    base00: '#f8f8f2', // Foreground
    base0: '#f8f8f2',
    base1: '#f8f8f2',
    base2: '#44475a',
    base3: '#282a36',
    yellow: '#f1fa8c', // Yellow
    orange: '#ffb86c', // Orange
    red: '#ff5555',    // Red
    magenta: '#ff79c6', // Pink
    violet: '#bd93f9',  // Purple
    blue: '#6272a4',    // Comment (as blue)
    cyan: '#8be9fd',    // Cyan
    green: '#50fa7b',   // Green
  },
};

/**
 * Catppuccin Mocha - Soft, warm pastels
 * Gentle on eyes, aesthetically pleasing
 */
export const CATPPUCCIN_MOCHA: Theme = {
  name: 'catppuccin-mocha',
  displayName: 'Catppuccin Mocha',
  description: 'Soft, warm pastel dark theme',
  colors: {
    base03: '#1e1e2e', // Base
    base02: '#181825', // Mantle
    base01: '#585b70', // Surface2
    base00: '#cdd6f4', // Text
    base0: '#cdd6f4',
    base1: '#bac2de',  // Subtext1
    base2: '#313244',  // Surface0
    base3: '#1e1e2e',
    yellow: '#f9e2af', // Yellow
    orange: '#fab387', // Peach
    red: '#f38ba8',    // Red
    magenta: '#f5c2e7', // Pink
    violet: '#cba6f7',  // Mauve
    blue: '#89b4fa',    // Blue
    cyan: '#94e2d5',    // Teal
    green: '#a6e3a1',   // Green
  },
};

/**
 * High Contrast - Maximum accessibility
 * WCAG AAA compliant, for vision accessibility
 */
export const HIGH_CONTRAST: Theme = {
  name: 'high-contrast',
  displayName: 'High Contrast',
  description: 'Maximum contrast for accessibility',
  colors: {
    base03: '#000000', // Pure black
    base02: '#1a1a1a',
    base01: '#666666',
    base00: '#ffffff', // Pure white text
    base0: '#ffffff',
    base1: '#cccccc',
    base2: '#333333',
    base3: '#000000',
    yellow: '#ffff00', // Maximum contrast yellows
    orange: '#ff8800',
    red: '#ff0000',    // Pure red
    magenta: '#ff00ff', // Pure magenta
    violet: '#8800ff',
    blue: '#0088ff',
    cyan: '#00ffff',   // Pure cyan
    green: '#00ff00',  // Pure green
  },
};

/**
 * Theme registry - all available themes
 */
export const THEMES: Record<ThemeName, Theme> = {
  'solarized-dark': SOLARIZED_DARK,
  'solarized-light': SOLARIZED_LIGHT,
  'nord': NORD,
  'dracula': DRACULA,
  'catppuccin-mocha': CATPPUCCIN_MOCHA,
  'high-contrast': HIGH_CONTRAST,
};

/**
 * Get theme by name
 */
export const getTheme = (name: ThemeName): Theme => {
  return THEMES[name];
};

/**
 * Get all theme names
 */
export const getThemeNames = (): ThemeName[] => {
  return Object.keys(THEMES) as ThemeName[];
};

/**
 * Check if theme is dark
 */
export const isDarkTheme = (name: ThemeName): boolean => {
  return !name.includes('light');
};
