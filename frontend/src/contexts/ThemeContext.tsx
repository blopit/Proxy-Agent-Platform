'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeContext - Manages light/dark theme with Solarized colors
 */

export type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Borders
  border: string;
  borderSecondary: string;

  // Status colors (Solarized - same in both themes)
  blue: string;
  green: string;
  red: string;
  yellow: string;
  orange: string;
  cyan: string;
  magenta: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const lightColors: ThemeColors = {
  // Solarized Light
  background: '#fdf6e3',      // base3
  backgroundSecondary: '#eee8d5', // base2

  text: '#657b83',            // base00
  textSecondary: '#586e75',   // base01
  textMuted: '#93a1a1',       // base1

  border: '#93a1a1',          // base1
  borderSecondary: '#839496', // base0

  // Accent colors
  blue: '#268bd2',
  green: '#859900',
  red: '#dc322f',
  yellow: '#b58900',
  orange: '#cb4b16',
  cyan: '#2aa198',
  magenta: '#d33682',
};

const darkColors: ThemeColors = {
  // Solarized Dark
  background: '#002b36',      // base03
  backgroundSecondary: '#073642', // base02

  text: '#839496',            // base0
  textSecondary: '#93a1a1',   // base1
  textMuted: '#586e75',       // base01

  border: '#586e75',          // base01
  borderSecondary: '#657b83', // base00

  // Accent colors (same as light)
  blue: '#268bd2',
  green: '#859900',
  red: '#dc322f',
  yellow: '#b58900',
  orange: '#cb4b16',
  cyan: '#2aa198',
  magenta: '#d33682',
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  mode?: ThemeMode; // Controlled mode (e.g., for Storybook)
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'dark',
  mode: controlledMode
}) => {
  const [internalMode, setInternalMode] = useState<ThemeMode>(defaultMode);

  // Use controlled mode if provided, otherwise use internal mode
  const mode = controlledMode !== undefined ? controlledMode : internalMode;

  // Load theme from localStorage on mount (only if not controlled)
  useEffect(() => {
    if (controlledMode === undefined) {
      const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setInternalMode(savedTheme);
      }
    }
  }, [controlledMode]);

  // Save theme to localStorage when it changes (only if not controlled)
  useEffect(() => {
    if (controlledMode === undefined) {
      localStorage.setItem('theme', mode);
    }
  }, [mode, controlledMode]);

  const toggleTheme = () => {
    if (controlledMode === undefined) {
      setInternalMode(prev => prev === 'light' ? 'dark' : 'light');
    }
  };

  const setTheme = (newMode: ThemeMode) => {
    if (controlledMode === undefined) {
      setInternalMode(newMode);
    }
  };

  const colors = mode === 'light' ? lightColors : darkColors;

  const value: ThemeContextValue = {
    mode,
    colors,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
