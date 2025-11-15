/**
 * Settings Context - ADHD Mode & User Preferences
 *
 * Manages user settings with AsyncStorage persistence.
 * Includes Epic 7 ADHD Mode toggle for auto-splitting tasks.
 *
 * Reference: Epic 7 Frontend Integration (Days 4-5)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export interface UserSettings {
  adhdMode: boolean;
  autoSplitThreshold: number; // Minutes (tasks > this get auto-split)
  defaultTaskMode: 'adhd' | 'default';
  enableNotifications: boolean;
  enableHapticFeedback: boolean;
  theme: 'light' | 'dark' | 'solarized';
}

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  toggleADHDMode: () => Promise<void>;
  resetSettings: () => Promise<void>;
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS: UserSettings = {
  adhdMode: false,
  autoSplitThreshold: 5, // Auto-split tasks > 5 minutes
  defaultTaskMode: 'default',
  enableNotifications: true,
  enableHapticFeedback: true,
  theme: 'solarized',
};

const SETTINGS_STORAGE_KEY = '@user_settings';

// ============================================================================
// Context
// ============================================================================

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  /**
   * Load settings from AsyncStorage on mount
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load persisted settings
   */
  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        console.log('✅ Settings loaded:', parsed);
      } else {
        console.log('📋 Using default settings');
      }
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update settings and persist to storage
   */
  const updateSettings = async (updates: Partial<UserSettings>) => {
    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));

      console.log('✅ Settings updated:', updates);
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      throw error;
    }
  };

  /**
   * Toggle ADHD Mode (convenience method for Epic 7)
   */
  const toggleADHDMode = async () => {
    const newMode = !settings.adhdMode;

    await updateSettings({
      adhdMode: newMode,
      defaultTaskMode: newMode ? 'adhd' : 'default',
    });

    console.log(`🧠 ADHD Mode: ${newMode ? 'ON' : 'OFF'}`);
  };

  /**
   * Reset to default settings
   */
  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_SETTINGS);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      console.log('🔄 Settings reset to defaults');
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
      throw error;
    }
  };

  const value: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    toggleADHDMode,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
}

// ============================================================================
// Exports
// ============================================================================

export default SettingsContext;
