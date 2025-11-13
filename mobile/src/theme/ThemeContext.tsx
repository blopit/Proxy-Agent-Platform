import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { FONTS } from './colors';
import { Theme, ThemeName, getTheme, isDarkTheme } from './themes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@proxy_agent_theme';

interface ThemeContextType {
  themeName: ThemeName;
  theme: Theme;
  colors: Theme['colors'];
  fonts: typeof FONTS;
  setTheme: (name: ThemeName) => Promise<void>;
  isDark: boolean;
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
  initialTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'solarized-dark',
}) => {
  const [themeName, setThemeName] = useState<ThemeName>(initialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        setThemeName(saved as ThemeName);
      }
    } catch (error) {
      console.error('Failed to load saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (name: ThemeName) => {
    try {
      setThemeName(name);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const theme = getTheme(themeName);
  const isDark = isDarkTheme(themeName);

  // Show loading state while loading saved theme
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider
      value={{
        themeName,
        theme,
        colors: theme.colors,
        fonts: FONTS,
        setTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Backward compatibility exports
export type ThemeMode = 'dark' | 'light';
export { ThemeName };
