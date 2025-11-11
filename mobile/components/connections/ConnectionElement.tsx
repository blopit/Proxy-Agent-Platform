/**
 * ConnectionElement - React Native Version
 * Individual connection item
 *
 * Features:
 * - Brand icon with name
 * - Status-based display (disconnected, connected, error, connecting)
 * - Connect button for disconnected state
 * - ChevronStep background for visual consistency
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Check, AlertCircle } from 'lucide-react-native';
import ChevronStep from '../core/ChevronStep';
import ChevronButton from '../core/ChevronButton';
import { THEME } from '../../src/theme/colors';
import { Text } from '@/src/components/ui/Text';

export type ConnectionStatus = 'disconnected' | 'connected' | 'error' | 'connecting';

export interface ConnectionElementProps {
  provider: string;
  icon: React.ReactNode; // Brand icon component
  status: ConnectionStatus;
  email?: string; // Connected email address
  onConnect?: () => void;
}

const ConnectionElement: React.FC<ConnectionElementProps> = ({
  provider,
  icon,
  status,
  email,
  onConnect,
}) => {
  const getChevronStatus = (): 'done' | 'error' | 'active' | 'pending' => {
    switch (status) {
      case 'connected':
        return 'done';
      case 'error':
        return 'error';
      case 'connecting':
        return 'active';
      default:
        return 'pending';
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'disconnected':
        return (
          <ChevronButton
            variant="primary"
            position="single"
            onPress={onConnect}
            width={120}
          >
            Connect
          </ChevronButton>
        );

      case 'connected':
        return (
          <ChevronButton variant="success" position="single" width={120}>
            <View style={styles.statusContent}>
              <Check size={14} color={THEME.base03} strokeWidth={2.5} />
              <Text style={[styles.statusText, { color: THEME.base03 }]}>Connected</Text>
            </View>
          </ChevronButton>
        );

      case 'error':
        return (
          <ChevronButton variant="error" position="single" width={120}>
            <View style={styles.statusContent}>
              <AlertCircle size={14} color={THEME.base3} strokeWidth={2.5} />
              <Text style={[styles.statusText, { color: THEME.base3 }]}>Error</Text>
            </View>
          </ChevronButton>
        );

      case 'connecting':
        return (
          <ChevronButton variant="neutral" position="single" width={120}>
            <View style={styles.statusContent}>
              <ActivityIndicator size="small" color={THEME.base03} />
              <Text style={[styles.statusText, { color: THEME.base03 }]}>Connecting...</Text>
            </View>
          </ChevronButton>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ChevronStep
        status={getChevronStatus()}
        position="single"
        size="micro"
      >
        <View style={styles.content}>
          {/* Brand Icon */}
          <View style={styles.iconContainer}>
            {icon}
          </View>

          {/* Provider Name and Email */}
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{provider}</Text>
            {status === 'connected' && email && (
              <Text style={styles.emailText}>{email}</Text>
            )}
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Status/Button */}
          {renderStatus()}
        </View>
      </ChevronStep>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: {
    flexDirection: 'column',
    gap: 2,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base1,
  },
  emailText: {
    fontSize: 11,
    color: THEME.base01,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ConnectionElement;
