/**
 * Popular color themes for Storybook
 * Includes Solarized, Dracula, Nord, Gruvbox, Tokyo Night, Monokai, One Dark, Catppuccin, and Material themes
 */

// ============================================================================
// Solarized - Precision colors for machines and people
// ============================================================================
export const solarizedColors = {
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
};

export const solarizedLight = {
  name: 'Solarized Light',
  backgroundColor: solarizedColors.base3,
  textColor: solarizedColors.base00,
  borderColor: solarizedColors.base2,
  emphasisColor: solarizedColors.base01,
  secondaryBackgroundColor: solarizedColors.base2,
  accentColor: solarizedColors.blue,
  // Status colors
  blue: solarizedColors.blue,
  green: solarizedColors.green,
  red: solarizedColors.red,
  yellow: solarizedColors.yellow,
  orange: solarizedColors.orange,
  cyan: solarizedColors.cyan,
  magenta: solarizedColors.magenta,
};

export const solarizedDark = {
  name: 'Solarized Dark',
  backgroundColor: solarizedColors.base03,
  textColor: solarizedColors.base0,
  borderColor: solarizedColors.base02,
  emphasisColor: solarizedColors.base1,
  secondaryBackgroundColor: solarizedColors.base02,
  accentColor: solarizedColors.blue,
  // Status colors
  blue: solarizedColors.blue,
  green: solarizedColors.green,
  red: solarizedColors.red,
  yellow: solarizedColors.yellow,
  orange: solarizedColors.orange,
  cyan: solarizedColors.cyan,
  magenta: solarizedColors.magenta,
};

// ============================================================================
// Dracula - Dark theme with vibrant colors
// ============================================================================
export const draculaColors = {
  background: '#282a36',
  currentLine: '#44475a',
  foreground: '#f8f8f2',
  comment: '#6272a4',
  cyan: '#8be9fd',
  green: '#50fa7b',
  orange: '#ffb86c',
  pink: '#ff79c6',
  purple: '#bd93f9',
  red: '#ff5555',
  yellow: '#f1fa8c',
};

export const dracula = {
  name: 'Dracula',
  backgroundColor: draculaColors.background,
  textColor: draculaColors.foreground,
  borderColor: draculaColors.currentLine,
  emphasisColor: draculaColors.comment,
  secondaryBackgroundColor: draculaColors.currentLine,
  accentColor: draculaColors.purple,
  // Status colors
  blue: draculaColors.purple,
  green: draculaColors.green,
  red: draculaColors.red,
  yellow: draculaColors.yellow,
  orange: draculaColors.orange,
  cyan: draculaColors.cyan,
  magenta: draculaColors.pink,
};

// ============================================================================
// Nord - Arctic, north-bluish color palette
// ============================================================================
export const nordColors = {
  // Polar Night
  nord0: '#2e3440',
  nord1: '#3b4252',
  nord2: '#434c5e',
  nord3: '#4c566a',
  // Snow Storm
  nord4: '#d8dee9',
  nord5: '#e5e9f0',
  nord6: '#eceff4',
  // Frost
  nord7: '#8fbcbb',
  nord8: '#88c0d0',
  nord9: '#81a1c1',
  nord10: '#5e81ac',
  // Aurora
  nord11: '#bf616a',
  nord12: '#d08770',
  nord13: '#ebcb8b',
  nord14: '#a3be8c',
  nord15: '#b48ead',
};

export const nordDark = {
  name: 'Nord Dark',
  backgroundColor: nordColors.nord0,
  textColor: nordColors.nord4,
  borderColor: nordColors.nord1,
  emphasisColor: nordColors.nord6,
  secondaryBackgroundColor: nordColors.nord1,
  accentColor: nordColors.nord8,
  // Status colors
  blue: nordColors.nord10,
  green: nordColors.nord14,
  red: nordColors.nord11,
  yellow: nordColors.nord13,
  orange: nordColors.nord12,
  cyan: nordColors.nord8,
  magenta: nordColors.nord15,
};

export const nordLight = {
  name: 'Nord Light',
  backgroundColor: nordColors.nord6,
  textColor: nordColors.nord0,
  borderColor: nordColors.nord4,
  emphasisColor: nordColors.nord3,
  secondaryBackgroundColor: nordColors.nord5,
  accentColor: nordColors.nord10,
  // Status colors
  blue: nordColors.nord10,
  green: nordColors.nord14,
  red: nordColors.nord11,
  yellow: nordColors.nord13,
  orange: nordColors.nord12,
  cyan: nordColors.nord8,
  magenta: nordColors.nord15,
};

// ============================================================================
// Gruvbox - Retro groove color scheme
// ============================================================================
export const gruvboxColors = {
  // Dark
  dark0Hard: '#1d2021',
  dark0: '#282828',
  dark1: '#3c3836',
  dark2: '#504945',
  dark3: '#665c54',
  dark4: '#7c6f64',
  // Light
  light0Hard: '#f9f5d7',
  light0: '#fbf1c7',
  light1: '#ebdbb2',
  light2: '#d5c4a1',
  light3: '#bdae93',
  light4: '#a89984',
  // Colors
  red: '#cc241d',
  green: '#98971a',
  yellow: '#d79921',
  blue: '#458588',
  purple: '#b16286',
  aqua: '#689d6a',
  orange: '#d65d0e',
};

export const gruvboxDark = {
  name: 'Gruvbox Dark',
  backgroundColor: gruvboxColors.dark0,
  textColor: gruvboxColors.light1,
  borderColor: gruvboxColors.dark1,
  emphasisColor: gruvboxColors.light2,
  secondaryBackgroundColor: gruvboxColors.dark1,
  accentColor: gruvboxColors.aqua,
  // Status colors
  blue: gruvboxColors.blue,
  green: gruvboxColors.green,
  red: gruvboxColors.red,
  yellow: gruvboxColors.yellow,
  orange: gruvboxColors.orange,
  cyan: gruvboxColors.aqua,
  magenta: gruvboxColors.purple,
};

export const gruvboxLight = {
  name: 'Gruvbox Light',
  backgroundColor: gruvboxColors.light0,
  textColor: gruvboxColors.dark1,
  borderColor: gruvboxColors.light2,
  emphasisColor: gruvboxColors.dark2,
  secondaryBackgroundColor: gruvboxColors.light1,
  accentColor: gruvboxColors.blue,
  // Status colors
  blue: gruvboxColors.blue,
  green: gruvboxColors.green,
  red: gruvboxColors.red,
  yellow: gruvboxColors.yellow,
  orange: gruvboxColors.orange,
  cyan: gruvboxColors.aqua,
  magenta: gruvboxColors.purple,
};

// ============================================================================
// Tokyo Night - Modern, clean, Japanese-inspired theme
// ============================================================================
export const tokyoNightColors = {
  background: '#1a1b26',
  foreground: '#a9b1d6',
  black: '#32344a',
  red: '#f7768e',
  green: '#9ece6a',
  yellow: '#e0af68',
  blue: '#7aa2f7',
  magenta: '#bb9af7',
  cyan: '#7dcfff',
  white: '#787c99',
  brightBlack: '#444b6a',
  brightRed: '#ff7a93',
  brightGreen: '#b9f27c',
  brightYellow: '#ff9e64',
  brightBlue: '#7da6ff',
  brightMagenta: '#c0b1ff',
  brightCyan: '#a0e1ff',
  brightWhite: '#acb0d0',
};

export const tokyoNight = {
  name: 'Tokyo Night',
  backgroundColor: tokyoNightColors.background,
  textColor: tokyoNightColors.foreground,
  borderColor: tokyoNightColors.black,
  emphasisColor: tokyoNightColors.brightWhite,
  secondaryBackgroundColor: tokyoNightColors.black,
  accentColor: tokyoNightColors.blue,
  // Status colors
  blue: tokyoNightColors.blue,
  green: tokyoNightColors.green,
  red: tokyoNightColors.red,
  yellow: tokyoNightColors.yellow,
  orange: tokyoNightColors.brightYellow,
  cyan: tokyoNightColors.cyan,
  magenta: tokyoNightColors.magenta,
};

// ============================================================================
// Monokai - Classic Sublime Text theme
// ============================================================================
export const monokaiColors = {
  background: '#272822',
  foreground: '#f8f8f2',
  selection: '#49483e',
  line: '#3e3d32',
  black: '#272822',
  red: '#f92672',
  green: '#a6e22e',
  yellow: '#f4bf75',
  blue: '#66d9ef',
  magenta: '#ae81ff',
  cyan: '#a1efe4',
  white: '#f8f8f2',
  brightBlack: '#75715e',
  brightRed: '#f92672',
  brightGreen: '#a6e22e',
  brightYellow: '#e6db74',
  brightBlue: '#66d9ef',
  brightMagenta: '#ae81ff',
  brightCyan: '#a1efe4',
  brightWhite: '#f9f8f5',
};

export const monokai = {
  name: 'Monokai',
  backgroundColor: monokaiColors.background,
  textColor: monokaiColors.foreground,
  borderColor: monokaiColors.selection,
  emphasisColor: monokaiColors.brightWhite,
  secondaryBackgroundColor: monokaiColors.line,
  accentColor: monokaiColors.blue,
  // Status colors
  blue: monokaiColors.blue,
  green: monokaiColors.green,
  red: monokaiColors.red,
  yellow: monokaiColors.yellow,
  orange: monokaiColors.yellow,
  cyan: monokaiColors.cyan,
  magenta: monokaiColors.magenta,
};

// ============================================================================
// One Dark - Atom's iconic dark theme
// ============================================================================
export const oneDarkColors = {
  background: '#282c34',
  foreground: '#abb2bf',
  selection: '#3e4451',
  black: '#282c34',
  red: '#e06c75',
  green: '#98c379',
  yellow: '#e5c07b',
  blue: '#61afef',
  magenta: '#c678dd',
  cyan: '#56b6c2',
  white: '#abb2bf',
  brightBlack: '#5c6370',
  brightRed: '#e06c75',
  brightGreen: '#98c379',
  brightYellow: '#d19a66',
  brightBlue: '#61afef',
  brightMagenta: '#c678dd',
  brightCyan: '#56b6c2',
  brightWhite: '#ffffff',
};

export const oneDark = {
  name: 'One Dark',
  backgroundColor: oneDarkColors.background,
  textColor: oneDarkColors.foreground,
  borderColor: oneDarkColors.selection,
  emphasisColor: oneDarkColors.white,
  secondaryBackgroundColor: oneDarkColors.selection,
  accentColor: oneDarkColors.blue,
  // Status colors
  blue: oneDarkColors.blue,
  green: oneDarkColors.green,
  red: oneDarkColors.red,
  yellow: oneDarkColors.yellow,
  orange: oneDarkColors.brightYellow,
  cyan: oneDarkColors.cyan,
  magenta: oneDarkColors.magenta,
};

// ============================================================================
// Catppuccin - Soothing pastel theme
// ============================================================================
export const catppuccinLatteColors = {
  base: '#eff1f5',
  mantle: '#e6e9ef',
  crust: '#dce0e8',
  text: '#4c4f69',
  subtext1: '#5c5f77',
  subtext0: '#6c6f85',
  overlay2: '#7c7f93',
  overlay1: '#8c8fa1',
  overlay0: '#9ca0b0',
  surface2: '#acb0be',
  surface1: '#bcc0cc',
  surface0: '#ccd0da',
  lavender: '#7287fd',
  blue: '#1e66f5',
  sapphire: '#209fb5',
  sky: '#04a5e5',
  teal: '#179299',
  green: '#40a02b',
  yellow: '#df8e1d',
  peach: '#fe640b',
  maroon: '#e64553',
  red: '#d20f39',
  mauve: '#8839ef',
  pink: '#ea76cb',
  flamingo: '#dd7878',
  rosewater: '#dc8a78',
};

export const catppuccinLatte = {
  name: 'Catppuccin Latte',
  backgroundColor: catppuccinLatteColors.base,
  textColor: catppuccinLatteColors.text,
  borderColor: catppuccinLatteColors.crust,
  emphasisColor: catppuccinLatteColors.subtext1,
  secondaryBackgroundColor: catppuccinLatteColors.mantle,
  accentColor: catppuccinLatteColors.blue,
  // Status colors
  blue: catppuccinLatteColors.blue,
  green: catppuccinLatteColors.green,
  red: catppuccinLatteColors.red,
  yellow: catppuccinLatteColors.yellow,
  orange: catppuccinLatteColors.peach,
  cyan: catppuccinLatteColors.teal,
  magenta: catppuccinLatteColors.mauve,
};

export const catppuccinMochaColors = {
  base: '#1e1e2e',
  mantle: '#181825',
  crust: '#11111b',
  text: '#cdd6f4',
  subtext1: '#bac2de',
  subtext0: '#a6adc8',
  overlay2: '#9399b2',
  overlay1: '#7f849c',
  overlay0: '#6c7086',
  surface2: '#585b70',
  surface1: '#45475a',
  surface0: '#313244',
  lavender: '#b4befe',
  blue: '#89b4fa',
  sapphire: '#74c7ec',
  sky: '#89dceb',
  teal: '#94e2d5',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  peach: '#fab387',
  maroon: '#eba0ac',
  red: '#f38ba8',
  mauve: '#cba6f7',
  pink: '#f5c2e7',
  flamingo: '#f2cdcd',
  rosewater: '#f5e0dc',
};

export const catppuccinMocha = {
  name: 'Catppuccin Mocha',
  backgroundColor: catppuccinMochaColors.base,
  textColor: catppuccinMochaColors.text,
  borderColor: catppuccinMochaColors.mantle,
  emphasisColor: catppuccinMochaColors.subtext1,
  secondaryBackgroundColor: catppuccinMochaColors.mantle,
  accentColor: catppuccinMochaColors.blue,
  // Status colors
  blue: catppuccinMochaColors.blue,
  green: catppuccinMochaColors.green,
  red: catppuccinMochaColors.red,
  yellow: catppuccinMochaColors.yellow,
  orange: catppuccinMochaColors.peach,
  cyan: catppuccinMochaColors.teal,
  magenta: catppuccinMochaColors.mauve,
};

// ============================================================================
// Material - Google's Material Design colors
// ============================================================================
export const materialLightColors = {
  background: '#fafafa',
  surface: '#ffffff',
  foreground: '#212121',
  comment: '#90a4ae',
  red: '#e53935',
  pink: '#f06292',
  purple: '#ab47bc',
  deepPurple: '#7e57c2',
  indigo: '#5c6bc0',
  blue: '#42a5f5',
  lightBlue: '#29b6f6',
  cyan: '#26c6da',
  teal: '#26a69a',
  green: '#66bb6a',
  lightGreen: '#9ccc65',
  lime: '#d4e157',
  yellow: '#ffee58',
  amber: '#ffca28',
  orange: '#ffa726',
  deepOrange: '#ff7043',
};

export const materialLight = {
  name: 'Material Light',
  backgroundColor: materialLightColors.background,
  textColor: materialLightColors.foreground,
  borderColor: '#e0e0e0',
  emphasisColor: materialLightColors.comment,
  secondaryBackgroundColor: materialLightColors.surface,
  accentColor: materialLightColors.blue,
  // Status colors
  blue: materialLightColors.blue,
  green: materialLightColors.green,
  red: materialLightColors.red,
  yellow: materialLightColors.yellow,
  orange: materialLightColors.orange,
  cyan: materialLightColors.cyan,
  magenta: materialLightColors.purple,
};

export const materialDarkColors = {
  background: '#212121',
  surface: '#303030',
  foreground: '#eeffff',
  comment: '#546e7a',
  red: '#f07178',
  pink: '#f78c6c',
  purple: '#c792ea',
  deepPurple: '#bb80b3',
  indigo: '#7986cb',
  blue: '#82aaff',
  lightBlue: '#89ddff',
  cyan: '#80cbc4',
  teal: '#26a69a',
  green: '#c3e88d',
  lightGreen: '#c3e88d',
  lime: '#eeffb7',
  yellow: '#ffcb6b',
  amber: '#ffd54f',
  orange: '#f78c6c',
  deepOrange: '#ff5370',
};

export const materialDark = {
  name: 'Material Dark',
  backgroundColor: materialDarkColors.background,
  textColor: materialDarkColors.foreground,
  borderColor: '#424242',
  emphasisColor: materialDarkColors.comment,
  secondaryBackgroundColor: materialDarkColors.surface,
  accentColor: materialDarkColors.blue,
  // Status colors
  blue: materialDarkColors.blue,
  green: materialDarkColors.green,
  red: materialDarkColors.red,
  yellow: materialDarkColors.yellow,
  orange: materialDarkColors.orange,
  cyan: materialDarkColors.cyan,
  magenta: materialDarkColors.purple,
};

// ============================================================================
// Jungle - Lush forest greens and natural tones
// ============================================================================
export const jungleColors = {
  darkGreen: '#1a3319',
  forestGreen: '#2d5016',
  mossGreen: '#4a7c3b',
  leafGreen: '#72b562',
  mintGreen: '#a8d8b9',
  bamboo: '#c8e6c9',
  earth: '#3e2723',
  soil: '#4e342e',
  bark: '#6d4c41',
  sunlight: '#ffd54f',
  water: '#26a69a',
  flower: '#d81b60',
};

export const jungle = {
  name: 'Jungle',
  backgroundColor: jungleColors.darkGreen,
  textColor: jungleColors.mintGreen,
  borderColor: jungleColors.forestGreen,
  emphasisColor: jungleColors.bamboo,
  secondaryBackgroundColor: jungleColors.earth,
  accentColor: jungleColors.leafGreen,
  // Status colors
  blue: jungleColors.water,
  green: jungleColors.leafGreen,
  red: jungleColors.flower,
  yellow: jungleColors.sunlight,
  orange: jungleColors.bark,
  cyan: jungleColors.water,
  magenta: jungleColors.flower,
};

// ============================================================================
// Synthwave '84 - Retro neon 80s vibes
// ============================================================================
export const synthwaveColors = {
  background: '#241b2f',
  darkPurple: '#2a2139',
  slate: '#262335',
  foreground: '#ffffff',
  pink: '#ff7edb',
  hotPink: '#f92aad',
  cyan: '#72f1b8',
  blue: '#36f9f6',
  purple: '#b893ce',
  orange: '#f97e72',
  yellow: '#fede5d',
  comment: '#717280',
};

export const synthwave = {
  name: 'Synthwave \'84',
  backgroundColor: synthwaveColors.background,
  textColor: synthwaveColors.foreground,
  borderColor: synthwaveColors.darkPurple,
  emphasisColor: synthwaveColors.pink,
  secondaryBackgroundColor: synthwaveColors.slate,
  accentColor: synthwaveColors.cyan,
  // Status colors
  blue: synthwaveColors.blue,
  green: synthwaveColors.cyan,
  red: synthwaveColors.hotPink,
  yellow: synthwaveColors.yellow,
  orange: synthwaveColors.orange,
  cyan: synthwaveColors.cyan,
  magenta: synthwaveColors.pink,
};

// ============================================================================
// Nightfox - Soft dark blue-purple theme
// ============================================================================
export const nightfoxColors = {
  bg0: '#131a24',
  bg1: '#192330',
  bg2: '#283648',
  bg3: '#2b3b51',
  fg1: '#cdcecf',
  fg2: '#a4a5a6',
  fg3: '#3b4261',
  red: '#c94f6d',
  green: '#81b29a',
  blue: '#719cd6',
  yellow: '#dbc074',
  cyan: '#63cdcf',
  magenta: '#9d79d6',
  orange: '#f4a261',
  pink: '#d67ad2',
};

export const nightfox = {
  name: 'Nightfox',
  backgroundColor: nightfoxColors.bg1,
  textColor: nightfoxColors.fg1,
  borderColor: nightfoxColors.bg2,
  emphasisColor: nightfoxColors.fg2,
  secondaryBackgroundColor: nightfoxColors.bg0,
  accentColor: nightfoxColors.blue,
  // Status colors
  blue: nightfoxColors.blue,
  green: nightfoxColors.green,
  red: nightfoxColors.red,
  yellow: nightfoxColors.yellow,
  orange: nightfoxColors.orange,
  cyan: nightfoxColors.cyan,
  magenta: nightfoxColors.magenta,
};

// ============================================================================
// Cyberpunk - Neon dystopian future
// ============================================================================
export const cyberpunkColors = {
  background: '#000b1e',
  deepBlue: '#0a1929',
  darkCyan: '#001e3c',
  foreground: '#00ffff',
  neonPink: '#ff2a6d',
  neonBlue: '#00d9ff',
  neonYellow: '#fff01f',
  neonGreen: '#05ffa1',
  neonPurple: '#b967ff',
  neonOrange: '#ff6c11',
  electricBlue: '#01cdfe',
  hotPink: '#ff006e',
};

export const cyberpunk = {
  name: 'Cyberpunk',
  backgroundColor: cyberpunkColors.background,
  textColor: cyberpunkColors.foreground,
  borderColor: cyberpunkColors.deepBlue,
  emphasisColor: cyberpunkColors.neonPink,
  secondaryBackgroundColor: cyberpunkColors.darkCyan,
  accentColor: cyberpunkColors.electricBlue,
  // Status colors
  blue: cyberpunkColors.neonBlue,
  green: cyberpunkColors.neonGreen,
  red: cyberpunkColors.neonPink,
  yellow: cyberpunkColors.neonYellow,
  orange: cyberpunkColors.neonOrange,
  cyan: cyberpunkColors.electricBlue,
  magenta: cyberpunkColors.neonPurple,
};

// ============================================================================
// Oceanic - Deep sea blues and teals
// ============================================================================
export const oceanicColors = {
  deepOcean: '#0d1117',
  oceanFloor: '#161b22',
  seabed: '#21262d',
  water: '#30363d',
  wave: '#89ddff',
  foam: '#b3e5fc',
  coral: '#ff6b9d',
  seaweed: '#c3e88d',
  shell: '#ffcb6b',
  pearl: '#eeffff',
  fish: '#82aaff',
  kelp: '#4db6ac',
};

export const oceanic = {
  name: 'Oceanic',
  backgroundColor: oceanicColors.deepOcean,
  textColor: oceanicColors.pearl,
  borderColor: oceanicColors.oceanFloor,
  emphasisColor: oceanicColors.foam,
  secondaryBackgroundColor: oceanicColors.seabed,
  accentColor: oceanicColors.wave,
  // Status colors
  blue: oceanicColors.fish,
  green: oceanicColors.seaweed,
  red: oceanicColors.coral,
  yellow: oceanicColors.shell,
  orange: oceanicColors.coral,
  cyan: oceanicColors.wave,
  magenta: oceanicColors.coral,
};

// ============================================================================
// Sunset - Warm golden hour colors
// ============================================================================
export const sunsetColors = {
  sky: '#1a1625',
  horizon: '#2e1f3a',
  twilight: '#3d2750',
  dusk: '#4a3161',
  sun: '#ff6e40',
  orange: '#ff9e64',
  gold: '#ffb74d',
  amber: '#ffd54f,',
  peach: '#ff8a65',
  rose: '#ff5370',
  purple: '#ba68c8',
  lavender: '#ce93d8',
};

export const sunset = {
  name: 'Sunset',
  backgroundColor: sunsetColors.sky,
  textColor: sunsetColors.gold,
  borderColor: sunsetColors.horizon,
  emphasisColor: sunsetColors.amber,
  secondaryBackgroundColor: sunsetColors.twilight,
  accentColor: sunsetColors.sun,
  // Status colors
  blue: sunsetColors.purple,
  green: sunsetColors.amber,
  red: sunsetColors.rose,
  yellow: sunsetColors.gold,
  orange: sunsetColors.orange,
  cyan: sunsetColors.lavender,
  magenta: sunsetColors.purple,
};

// ============================================================================
// Aurora - Northern lights inspired
// ============================================================================
export const auroraColors = {
  night: '#0f1419',
  midnight: '#1a1f29',
  space: '#232834',
  cosmos: '#2d333f',
  green: '#7fd962',
  emerald: '#a6e3a1',
  teal: '#73daca',
  cyan: '#95e6cb',
  blue: '#59c2ff',
  purple: '#b794f6',
  magenta: '#d38aea',
  pink: '#f694ff',
};

export const aurora = {
  name: 'Aurora',
  backgroundColor: auroraColors.night,
  textColor: auroraColors.emerald,
  borderColor: auroraColors.midnight,
  emphasisColor: auroraColors.cyan,
  secondaryBackgroundColor: auroraColors.space,
  accentColor: auroraColors.blue,
  // Status colors
  blue: auroraColors.blue,
  green: auroraColors.green,
  red: auroraColors.pink,
  yellow: auroraColors.emerald,
  orange: auroraColors.pink,
  cyan: auroraColors.cyan,
  magenta: auroraColors.magenta,
};

// ============================================================================
// Theme exports
// ============================================================================
export const themes = {
  // Solarized
  solarizedLight,
  solarizedDark,

  // Dracula
  dracula,

  // Nord
  nordLight,
  nordDark,

  // Gruvbox
  gruvboxLight,
  gruvboxDark,

  // Tokyo Night
  tokyoNight,

  // Monokai
  monokai,

  // One Dark
  oneDark,

  // Catppuccin
  catppuccinLatte,
  catppuccinMocha,

  // Material
  materialLight,
  materialDark,

  // Nature & Creative
  jungle,
  oceanic,
  sunset,
  aurora,

  // Retro & Cyberpunk
  synthwave,
  nightfox,
  cyberpunk,
};

export type ThemeKey = keyof typeof themes;
