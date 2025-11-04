import React, { createContext, useContext, useState, ReactNode } from 'react';
import { THEME } from './colors';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof THEME;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

// Solarized Light theme (inverse of dark)
const THEME_LIGHT = {
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
} as const;

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'dark',
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const colors = mode === 'dark' ? THEME : THEME_LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
