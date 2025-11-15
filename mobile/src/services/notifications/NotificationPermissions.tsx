/**
 * NotificationPermissions - React component for permission management
 *
 * Features:
 * - User-friendly permission request UI
 * - Permission status display
 * - Settings deep link (when denied)
 * - Re-request capabilities
 *
 * Usage:
 *   <NotificationPermissionGate>
 *     <MyNotificationEnabledFeature />
 *   </NotificationPermissionGate>
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/src/theme/ThemeContext';

interface NotificationPermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showPrompt?: boolean;
}

export function NotificationPermissionGate({
  children,
  fallback,
  showPrompt = true,
}: NotificationPermissionGateProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermission = async () => {
    setIsRequesting(true);
    const { status } = await Notifications.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    setIsRequesting(false);
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.base03 }]}>
        <Text style={[styles.text, { color: colors.base0 }]}>
          Checking permissions...
        </Text>
      </View>
    );
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (!showPrompt) {
    return <>{fallback || null}</>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.base03 }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.base0 }]}>
          Enable Notifications
        </Text>
        <Text style={[styles.description, { color: colors.base01 }]}>
          Stay on top of your tasks with timely reminders and focus session alerts.
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.cyan }]}
          onPress={requestPermission}
          disabled={isRequesting}
        >
          <Text style={[styles.buttonText, { color: colors.base03 }]}>
            {isRequesting ? 'Requesting...' : 'Enable Notifications'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.base01 }]}
          onPress={openSettings}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.base01 }]}>
            Open Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function useNotificationPermission() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Notifications.PermissionStatus | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const result = await Notifications.getPermissionsAsync();
    setStatus(result.status);
    setHasPermission(result.status === 'granted');
  };

  const requestPermission = async (): Promise<boolean> => {
    const result = await Notifications.requestPermissionsAsync();
    setStatus(result.status);
    setHasPermission(result.status === 'granted');
    return result.status === 'granted';
  };

  return {
    hasPermission,
    status,
    requestPermission,
    checkPermission,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  text: {
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
