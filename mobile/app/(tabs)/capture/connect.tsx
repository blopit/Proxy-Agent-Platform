import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Server } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import ConnectionElement, { ConnectionStatus } from '../../../components/connections/ConnectionElement';
import { useProfile } from '@/src/contexts/ProfileContext';
import {
  initiateGmailOAuth,
  listIntegrations,
  disconnectIntegration,
  Integration,
} from '@/src/api/integrations';

interface EmailConnection {
  id: string;
  type: 'gmail' | 'smtp';
  label: string;
  email?: string;
  status: ConnectionStatus;
}

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export default function ConnectScreen() {
  const { activeProfile } = useProfile();

  const [connections, setConnections] = useState<EmailConnection[]>([
    { id: 'gmail-1', type: 'gmail', label: 'Gmail', status: 'disconnected' },
    { id: 'smtp-1', type: 'smtp', label: 'SMTP Email', status: 'disconnected' },
  ]);
  const [loading, setLoading] = useState(false);

  // Load existing integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, [activeProfile]);

  // Set up deep link listener for OAuth callback
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Handle deep link if app was opened from one
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Load existing integrations from backend
   */
  const loadIntegrations = async () => {
    if (!activeProfile) return;

    try {
      const integrations = await listIntegrations(activeProfile);

      // Update Gmail connection status based on backend data
      const gmailIntegration = integrations.find(i => i.provider === 'gmail');
      if (gmailIntegration) {
        setConnections(prev => prev.map(conn =>
          conn.type === 'gmail'
            ? {
                ...conn,
                status: gmailIntegration.status as ConnectionStatus,
                email: gmailIntegration.provider_username
              }
            : conn
        ));
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  /**
   * Handle OAuth deep link callback
   */
  const handleDeepLink = ({ url }: { url: string }) => {
    const { path, queryParams } = Linking.parse(url);

    // Check if this is an OAuth callback
    if (path === 'oauth/callback') {
      const { success, integration_id, provider, error } = queryParams as {
        success?: string;
        integration_id?: string;
        provider?: string;
        error?: string;
      };

      if (success === 'true' && provider === 'gmail') {
        // OAuth succeeded
        Alert.alert('Success', 'Gmail connected successfully!');
        loadIntegrations(); // Reload to get updated status
      } else if (error) {
        // OAuth failed
        Alert.alert('Connection Failed', error as string);
        setConnections(prev => prev.map(conn =>
          conn.type === 'gmail' ? { ...conn, status: 'disconnected' } : conn
        ));
      }
    }
  };

  /**
   * Handle Gmail OAuth connection
   */
  const handleGmailConnect = async () => {
    if (!activeProfile) {
      Alert.alert('Error', 'No active profile selected');
      return;
    }

    setLoading(true);
    setConnections(prev => prev.map(conn =>
      conn.type === 'gmail' ? { ...conn, status: 'connecting' } : conn
    ));

    try {
      // Initiate OAuth flow with backend
      const { authorization_url } = await initiateGmailOAuth(activeProfile);

      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        authorization_url,
        'proxyagent://oauth/callback'
      );

      if (result.type === 'cancel') {
        // User cancelled the OAuth flow
        setConnections(prev => prev.map(conn =>
          conn.type === 'gmail' ? { ...conn, status: 'disconnected' } : conn
        ));
      }
      // Success/failure will be handled by deep link callback
    } catch (error) {
      console.error('Gmail OAuth failed:', error);
      Alert.alert('Connection Failed', 'Could not connect to Gmail. Please try again.');
      setConnections(prev => prev.map(conn =>
        conn.type === 'gmail' ? { ...conn, status: 'disconnected' } : conn
      ));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Gmail disconnection
   */
  const handleGmailDisconnect = async (integrationId?: string) => {
    if (!integrationId) {
      Alert.alert('Error', 'No integration found to disconnect');
      return;
    }

    Alert.alert(
      'Disconnect Gmail',
      'Are you sure you want to disconnect Gmail? You will need to reconnect to capture tasks from emails.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectIntegration(integrationId);
              Alert.alert('Success', 'Gmail disconnected');
              setConnections(prev => prev.map(conn =>
                conn.type === 'gmail' ? { ...conn, status: 'disconnected', email: undefined } : conn
              ));
            } catch (error) {
              console.error('Failed to disconnect Gmail:', error);
              Alert.alert('Error', 'Failed to disconnect Gmail');
            }
          },
        },
      ]
    );
  };

  /**
   * Handle connection based on type
   */
  const handleConnect = (connection: EmailConnection) => {
    if (connection.type === 'gmail') {
      if (connection.status === 'connected') {
        // Already connected - allow disconnect
        // Find the integration_id from loaded integrations
        // For now, just show alert
        Alert.alert('Gmail Connected', 'Gmail is already connected to this profile.');
      } else {
        handleGmailConnect();
      }
    } else if (connection.type === 'smtp') {
      // TODO: Implement SMTP configuration modal
      Alert.alert('Coming Soon', 'SMTP email configuration is coming soon!');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Email Connections */}
        <View style={styles.connectionsSection}>
          <Text style={styles.sectionLabel}>Email Accounts</Text>

          {connections.map((connection) => (
            <ConnectionElement
              key={connection.id}
              provider={connection.label}
              icon={
                connection.type === 'gmail' ? (
                  <Mail color="#EA4335" size={24} />
                ) : (
                  <Server color="#586e75" size={24} />
                )
              }
              status={connection.status}
              email={connection.email}
              onConnect={() => handleConnect(connection)}
            />
          ))}
        </View>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={styles.helpText}>
            🔗 Connect email accounts to enable task capture from emails.{'\n'}
            Each profile keeps its connections separate.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002b36', // Solarized base03
    paddingTop: 44, // Account for top tab bar
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#586e75',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  connectionsSection: {
    marginBottom: 24,
  },
  helpSection: {
    padding: 16,
    backgroundColor: '#073642',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#586e75',
  },
  helpText: {
    fontSize: 13,
    color: '#839496',
    lineHeight: 20,
    textAlign: 'center',
  },
});
