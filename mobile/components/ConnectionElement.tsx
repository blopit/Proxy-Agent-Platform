import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, AlertCircle } from 'lucide-react-native';
import { Svg, Path } from 'react-native-svg';
import ChevronButton, { ChevronVariant } from './ChevronButton';

/**
 * ConnectionElement - React Native version
 * Individual connection item for email/service connections
 *
 * Based on frontend/src/components/mobile/connections/ConnectionElement.tsx
 */

export type ConnectionStatus = 'disconnected' | 'connected' | 'error' | 'connecting';

export interface ConnectionElementProps {
  provider: string;
  iconSvg?: string; // SVG path data from simple-icons
  iconColor?: string; // Brand color from simple-icons
  icon?: React.ReactNode; // Alternative: React Native icon component
  status: ConnectionStatus;
  email?: string; // Optional email to display
  onConnect?: () => void;
}

const ConnectionElement: React.FC<ConnectionElementProps> = ({
  provider,
  iconSvg,
  iconColor = '#586e75',
  icon,
  status,
  email,
  onConnect,
}) => {
  const getStatusColor = (): string => {
    switch (status) {
      case 'connected':
        return '#859900'; // Solarized green
      case 'error':
        return '#dc322f'; // Solarized red
      case 'connecting':
        return '#b58900'; // Solarized yellow
      case 'disconnected':
      default:
        return '#268bd2'; // Solarized blue
    }
  };

  const getBackgroundColor = (): string => {
    switch (status) {
      case 'connected':
        return '#85990022';
      case 'error':
        return '#dc322f22';
      case 'connecting':
        return '#b5890022';
      case 'disconnected':
      default:
        return '#073642'; // Solarized base02
    }
  };

  const getChevronVariant = (): ChevronVariant => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'error':
        return 'error';
      case 'connecting':
        return 'warning';
      case 'disconnected':
      default:
        return 'primary';
    }
  };

  const renderStatusButton = () => {
    const variant = getChevronVariant();
    const isDisabled = status === 'connecting' || status === 'connected';

    let buttonText = '';
    switch (status) {
      case 'connected':
        buttonText = 'Connected';
        break;
      case 'error':
        buttonText = 'Retry';
        break;
      case 'connecting':
        buttonText = 'Connecting...';
        break;
      case 'disconnected':
      default:
        buttonText = 'Connect';
    }

    return (
      <ChevronButton
        variant={variant}
        onPress={onConnect}
        disabled={isDisabled}
        width={120}
      >
        {buttonText}
      </ChevronButton>
    );
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: getBackgroundColor(),
        borderColor: getStatusColor(),
      }
    ]}>
      <View style={styles.leftSection}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          {icon ? (
            icon
          ) : iconSvg ? (
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d={iconSvg} fill={iconColor} />
            </Svg>
          ) : null}
        </View>

        {/* Provider info */}
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider}</Text>
          {email && <Text style={styles.emailText}>{email}</Text>}
        </View>
      </View>

      {/* Status button */}
      <View style={styles.rightSection}>
        {renderStatusButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002b36',
    borderRadius: 8,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#93a1a1',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 12,
    color: '#586e75',
  },
  rightSection: {
    flexShrink: 0,
  },
});

export default ConnectionElement;
