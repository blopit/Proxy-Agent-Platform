import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Mail, Server } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import ConnectionElement, { ConnectionStatus } from '../../../components/connections/ConnectionElement';
import { useProfile } from '@/src/contexts/ProfileContext';
import { useAuth } from '@/src/contexts/AuthContext';
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
  const { token } = useAuth();

  const [connections, setConnections] = useState<EmailConnection[]>([
    { id: 'gmail-1', type: 'gmail', label: 'Gmail', status: 'disconnected' },
    { id: 'smtp-1', type: 'smtp', label: 'SMTP Email', status: 'disconnected' },
  ]);
  const [loading, setLoading] = useState(false);

  // Load existing integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, [activeProfile, token]);

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
    console.log('[Load Integrations] Starting...');
    console.log('[Load Integrations] Active profile:', activeProfile);
    console.log('[Load Integrations] Has token:', !!token);

    if (!activeProfile || !token) {
      console.warn('[Load Integrations] Missing activeProfile or token');
      return;
    }

    try {
      console.log('[Load Integrations] Fetching from backend...');
      const integrations = await listIntegrations(activeProfile, token);
      console.log('[Load Integrations] Received integrations:', integrations);

      // Update Gmail connection status based on backend data
      const gmailIntegration = integrations.find(i => i.provider === 'gmail');
      console.log('[Load Integrations] Gmail integration:', gmailIntegration);

      if (gmailIntegration) {
        console.log('[Load Integrations] Updating Gmail connection status to:', {
          status: gmailIntegration.status,
          email: gmailIntegration.provider_username
        });
        setConnections(prev => prev.map(conn =>
          conn.type === 'gmail'
            ? {
                ...conn,
                status: gmailIntegration.status as ConnectionStatus,
                email: gmailIntegration.provider_username
              }
            : conn
        ));
      } else {
        console.log('[Load Integrations] No Gmail integration found');
      }
    } catch (error) {
      console.error('[Load Integrations] Failed to load integrations:', error);
      if (error instanceof Error) {
        console.error('[Load Integrations] Error details:', error.message);
      }
    }
  };

  /**
   * Handle OAuth deep link callback
   */
  const handleDeepLink = ({ url }: { url: string }) => {
    console.log('[Deep Link] Received URL:', url);
    const { path, queryParams } = Linking.parse(url);
    console.log('[Deep Link] Parsed path:', path);
    console.log('[Deep Link] Query params:', queryParams);

    // Check if this is an OAuth callback
    if (path === 'oauth/callback') {
      const { success, integration_id, provider, error } = queryParams as {
        success?: string;
        integration_id?: string;
        provider?: string;
        error?: string;
      };

      console.log('[Deep Link] OAuth callback params:', { success, integration_id, provider, error });

      if (success === 'true' && provider === 'gmail') {
        // OAuth succeeded
        console.log('[Deep Link] Gmail OAuth succeeded, integration_id:', integration_id);
        Alert.alert('Success', 'Gmail connected successfully!');
        loadIntegrations(); // Reload to get updated status
      } else if (error) {
        // OAuth failed
        console.error('[Deep Link] Gmail OAuth failed with error:', error);
        Alert.alert('Connection Failed', error as string);
        setConnections(prev => prev.map(conn =>
          conn.type === 'gmail' ? { ...conn, status: 'disconnected' } : conn
        ));
      } else {
        console.warn('[Deep Link] Unexpected OAuth callback state:', queryParams);
      }
    } else {
      console.log('[Deep Link] Not an OAuth callback, path:', path);
    }
  };

  /**
   * Handle Gmail OAuth connection
   */
  const handleGmailConnect = async () => {
    console.log('[Gmail Connect] Starting OAuth flow...');
    console.log('[Gmail Connect] Active profile:', activeProfile);
    console.log('[Gmail Connect] Has token:', !!token);

    if (!activeProfile) {
      console.error('[Gmail Connect] No active profile selected');
      Alert.alert('Error', 'No active profile selected');
      return;
    }

    if (!token) {
      console.error('[Gmail Connect] Not authenticated');
      Alert.alert('Error', 'Not authenticated. Please log in again.');
      return;
    }

    setLoading(true);
    setConnections(prev => prev.map(conn =>
      conn.type === 'gmail' ? { ...conn, status: 'connecting' } : conn
    ));

    try {
      console.log('[Gmail Connect] Calling backend authorize endpoint...');
      // Initiate OAuth flow with backend
      const { authorization_url, provider, message } = await initiateGmailOAuth(activeProfile, token);
      console.log('[Gmail Connect] Authorization response:', {
        provider,
        message,
        url_preview: authorization_url.substring(0, 100) + '...'
      });

      // Verify the URL contains Gmail scopes (not just basic Google Sign-In scopes)
      if (!authorization_url.includes('gmail')) {
        console.warn('[Gmail Connect] Warning: Authorization URL may not include Gmail scopes');
        console.log('[Gmail Connect] Full URL:', authorization_url);
      }

      console.log('[Gmail Connect] Opening OAuth browser session...');
      // Open OAuth URL in browser
      const result = await WebBrowser.openAuthSessionAsync(
        authorization_url,
        'proxyagent://oauth/callback'
      );

      console.log('[Gmail Connect] WebBrowser result:', {
        type: result.type,
        url: result.type === 'success' ? result.url : undefined
      });

      if (result.type === 'cancel') {
        console.log('[Gmail Connect] User cancelled OAuth flow');
        // User cancelled the OAuth flow
        setConnections(prev => prev.map(conn =>
          conn.type === 'gmail' ? { ...conn, status: 'disconnected' } : conn
        ));
      } else if (result.type === 'dismiss') {
        console.log('[Gmail Connect] OAuth browser dismissed');
        setConnections(prev => prev.map(conn =>
          conn.type === 'gmail' ? { ...conn, status: 'disconnected' } : conn
        ));
      }
      // Success/failure will be handled by deep link callback
    } catch (error) {
      console.error('[Gmail Connect] OAuth failed with error:', error);
      if (error instanceof Error) {
        console.error('[Gmail Connect] Error message:', error.message);
        console.error('[Gmail Connect] Error stack:', error.stack);
      }

      const errorMessage = error instanceof Error ? error.message : 'Could not connect to Gmail. Please try again.';
      Alert.alert('Connection Failed', errorMessage);
      setConnections(prev => prev.map(conn =>
        conn.type === 'gmail' ? { ...conn, status: 'disconnected' } : conn
      ));
    } finally {
      console.log('[Gmail Connect] OAuth flow completed');
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

    if (!token) {
      Alert.alert('Error', 'Not authenticated. Please log in again.');
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
              await disconnectIntegration(integrationId, token);
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
