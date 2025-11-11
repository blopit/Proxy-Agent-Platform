/**
 * Developer Tools Screen
 * Utilities for testing, debugging, and development
 * Access via: http://localhost:8081/dev
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/contexts/AuthContext';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { useProfile } from '@/src/contexts/ProfileContext';
import { THEME } from '@/src/theme/colors';
import {
  Trash2,
  RefreshCw,
  Database,
  User,
  CheckCircle,
  XCircle,
  Home,
  Settings,
  Eye,
} from 'lucide-react-native';

const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  REFRESH_TOKEN: '@auth_refresh_token',
  USER: '@auth_user',
  ONBOARDING_DATA: '@proxy_agent:onboarding_data',
  ONBOARDING_PROGRESS: '@proxy_agent:onboarding_progress',
};

export default function DevToolsScreen() {
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuth();
  const { hasCompletedOnboarding, resetOnboarding, data: onboardingData } = useOnboarding();
  const { activeProfile, profiles } = useProfile();

  const [storageData, setStorageData] = useState<Record<string, any>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(STORAGE_KEYS)) {
      try {
        const stored = await AsyncStorage.getItem(value);
        data[key] = stored ? JSON.parse(stored) : null;
      } catch {
        data[key] = await AsyncStorage.getItem(value); // If not JSON, store raw
      }
    }
    setStorageData(data);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all authentication, onboarding, and profile data. You will need to log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              console.log('[DevTools] All AsyncStorage cleared');
              Alert.alert('Success', 'All data cleared. Reloading app...');
              setTimeout(() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                } else {
                  router.replace('/(auth)');
                }
              }, 1000);
            } catch (error) {
              console.error('[DevTools] Failed to clear storage:', error);
              Alert.alert('Error', 'Failed to clear storage');
            }
          },
        },
      ]
    );
  };

  const handleClearAuth = () => {
    Alert.alert('Clear Auth Data', 'This will log you out and clear authentication tokens.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            console.log('[DevTools] Auth data cleared');
            Alert.alert('Success', 'Authentication data cleared');
            await loadStorageData();
          } catch (error) {
            console.error('[DevTools] Failed to clear auth:', error);
            Alert.alert('Error', 'Failed to clear auth data');
          }
        },
      },
    ]);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will clear onboarding data. You will see the onboarding flow again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetOnboarding();
              console.log('[DevTools] Onboarding reset');
              Alert.alert('Success', 'Onboarding reset');
              await loadStorageData();
            } catch (error) {
              console.error('[DevTools] Failed to reset onboarding:', error);
              Alert.alert('Error', 'Failed to reset onboarding');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStorageData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleViewStorage = (key: string, data: any) => {
    Alert.alert(
      key,
      JSON.stringify(data, null, 2),
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/capture/add');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Settings size={32} color={THEME.yellow} />
          <Text style={styles.title}>Developer Tools</Text>
          <Text style={styles.subtitle}>Testing & Debugging Utilities</Text>
        </View>

        {/* Current State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State</Text>

          <View style={styles.stateGrid}>
            <View style={styles.stateCard}>
              <View style={styles.stateIcon}>
                {isAuthenticated ? (
                  <CheckCircle size={24} color={THEME.green} />
                ) : (
                  <XCircle size={24} color={THEME.red} />
                )}
              </View>
              <Text style={styles.stateLabel}>Authenticated</Text>
              <Text style={styles.stateValue}>{isAuthenticated ? 'Yes' : 'No'}</Text>
            </View>

            <View style={styles.stateCard}>
              <View style={styles.stateIcon}>
                {hasCompletedOnboarding ? (
                  <CheckCircle size={24} color={THEME.green} />
                ) : (
                  <XCircle size={24} color={THEME.orange} />
                )}
              </View>
              <Text style={styles.stateLabel}>Onboarded</Text>
              <Text style={styles.stateValue}>{hasCompletedOnboarding ? 'Yes' : 'No'}</Text>
            </View>

            <View style={styles.stateCard}>
              <User size={24} color={THEME.cyan} />
              <Text style={styles.stateLabel}>Profile</Text>
              <Text style={styles.stateValue}>{activeProfile || 'None'}</Text>
            </View>
          </View>

          {user && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{user.user_id}</Text>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
              <Text style={styles.infoLabel}>Username:</Text>
              <Text style={styles.infoValue}>{user.username}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={[styles.actionButton, styles.refreshButton]}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            <RefreshCw size={20} color={THEME.cyan} />
            <Text style={[styles.actionText, { color: THEME.cyan }]}>
              {isRefreshing ? 'Refreshing...' : 'Refresh State'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.warningButton]}
            onPress={handleResetOnboarding}
            activeOpacity={0.7}
            disabled={!hasCompletedOnboarding}
          >
            <RefreshCw size={20} color={THEME.orange} />
            <Text style={[styles.actionText, { color: THEME.orange }]}>Reset Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.warningButton]}
            onPress={handleClearAuth}
            activeOpacity={0.7}
            disabled={!isAuthenticated}
          >
            <Trash2 size={20} color={THEME.orange} />
            <Text style={[styles.actionText, { color: THEME.orange }]}>Clear Auth Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Database size={20} color={THEME.red} />
            <Text style={[styles.actionText, { color: THEME.red }]}>Clear All Storage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleGoHome}
            activeOpacity={0.7}
          >
            <Home size={20} color={THEME.base0} />
            <Text style={[styles.actionText, { color: THEME.base0 }]}>Go to Capture Tab</Text>
          </TouchableOpacity>
        </View>

        {/* Storage Inspector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AsyncStorage Inspector</Text>

          {Object.entries(STORAGE_KEYS).map(([key, storageKey]) => {
            const data = storageData[key];
            const hasData = data !== null && data !== undefined;

            return (
              <TouchableOpacity
                key={key}
                style={styles.storageItem}
                onPress={() => hasData && handleViewStorage(key, data)}
                activeOpacity={0.7}
                disabled={!hasData}
              >
                <View style={styles.storageLeft}>
                  <Eye size={16} color={hasData ? THEME.base0 : THEME.base01} />
                  <Text style={[styles.storageKey, !hasData && styles.storageEmpty]}>{key}</Text>
                </View>
                <View style={styles.storageRight}>
                  {hasData ? (
                    <CheckCircle size={16} color={THEME.green} />
                  ) : (
                    <XCircle size={16} color={THEME.base01} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Environment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environment</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>
              {typeof window !== 'undefined' ? 'Web' : 'Native'}
            </Text>
            <Text style={styles.infoLabel}>URL:</Text>
            <Text style={styles.infoValue}>
              {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Developer Tools • Debug Only</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: THEME.base02,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.base01,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base01,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  stateCard: {
    width: '31%',
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  stateIcon: {
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: 11,
    color: THEME.base01,
    marginBottom: 4,
  },
  stateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base0,
  },
  infoBox: {
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.base01,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    color: THEME.base0,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: THEME.blue,
    borderColor: THEME.blue,
  },
  refreshButton: {
    backgroundColor: `${THEME.cyan}20`,
    borderColor: THEME.cyan,
  },
  warningButton: {
    backgroundColor: `${THEME.orange}20`,
    borderColor: THEME.orange,
  },
  dangerButton: {
    backgroundColor: `${THEME.red}20`,
    borderColor: THEME.red,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.base02,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageKey: {
    fontSize: 13,
    color: THEME.base0,
    fontFamily: 'monospace',
  },
  storageEmpty: {
    color: THEME.base01,
  },
  storageRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: THEME.base01,
  },
});
