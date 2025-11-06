/**
 * ConnectionElement Stories - Email/service connection items
 * Shows different connection states with brand icons
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import ConnectionElement, { ConnectionStatus } from './ConnectionElement';
import { THEME } from '../../src/theme/colors';
import BionicText from '../shared/BionicText';

const meta = {
  title: 'Connections/ConnectionElement',
  component: ConnectionElement,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ConnectionElement>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simple-icons SVG paths for common providers
const PROVIDER_ICONS = {
  gmail: {
    path: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
    color: '#EA4335',
  },
  outlook: {
    path: 'M24 7.387v9.226a1.387 1.387 0 0 1-1.387 1.387h-9.226a1.387 1.387 0 0 1-1.387-1.387V7.387A1.387 1.387 0 0 1 13.387 6h9.226A1.387 1.387 0 0 1 24 7.387zM11.026 12a5.476 5.476 0 1 1-10.952 0 5.476 5.476 0 0 1 10.952 0zm-2.629 0a2.847 2.847 0 1 0-5.694 0 2.847 2.847 0 0 0 5.694 0z',
    color: '#0078D4',
  },
  slack: {
    path: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z',
    color: '#4A154B',
  },
  github: {
    path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    color: '#181717',
  },
  notion: {
    path: 'M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z',
    color: '#000000',
  },
  trello: {
    path: 'M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.646-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z',
    color: '#0052CC',
  },
};

/**
 * Disconnected - Gmail Not Connected
 * Shows connect button for disconnected state
 */
export const Disconnected: Story = {
  args: {
    provider: 'Gmail',
    iconSvg: PROVIDER_ICONS.gmail.path,
    iconColor: PROVIDER_ICONS.gmail.color,
    status: 'disconnected',
    onConnect: () => Alert.alert('Connect', 'Gmail OAuth flow would start here'),
  },
};

/**
 * Connected - Slack Connected
 * Shows connected state with checkmark
 */
export const Connected: Story = {
  args: {
    provider: 'Slack',
    iconSvg: PROVIDER_ICONS.slack.path,
    iconColor: PROVIDER_ICONS.slack.color,
    status: 'connected',
  },
};

/**
 * Error - GitHub Connection Error
 * Shows error state with retry option
 */
export const Error: Story = {
  args: {
    provider: 'GitHub',
    iconSvg: PROVIDER_ICONS.github.path,
    iconColor: PROVIDER_ICONS.github.color,
    status: 'error',
    onConnect: () => Alert.alert('Retry', 'Retry GitHub connection'),
  },
};

/**
 * Connecting - Notion Connecting
 * Shows loading state during OAuth flow
 */
export const Connecting: Story = {
  args: {
    provider: 'Notion',
    iconSvg: PROVIDER_ICONS.notion.path,
    iconColor: PROVIDER_ICONS.notion.color,
    status: 'connecting',
  },
};

/**
 * All States - Gmail Connection Flow
 * Shows all connection states side by side
 */
export const AllStates: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.statesContainer}>
        <BionicText style={styles.sectionTitle} boldRatio={0.5}>
          Connection States
        </BionicText>

        <View style={styles.stateSection}>
          <BionicText style={styles.stateLabel}>Disconnected</BionicText>
          <ConnectionElement
            provider="Gmail"
            iconSvg={PROVIDER_ICONS.gmail.path}
            iconColor={PROVIDER_ICONS.gmail.color}
            status="disconnected"
            onConnect={() => Alert.alert('Connect Gmail')}
          />
        </View>

        <View style={styles.stateSection}>
          <BionicText style={styles.stateLabel}>Connecting</BionicText>
          <ConnectionElement
            provider="Gmail"
            iconSvg={PROVIDER_ICONS.gmail.path}
            iconColor={PROVIDER_ICONS.gmail.color}
            status="connecting"
          />
        </View>

        <View style={styles.stateSection}>
          <BionicText style={styles.stateLabel}>Connected</BionicText>
          <ConnectionElement
            provider="Gmail"
            iconSvg={PROVIDER_ICONS.gmail.path}
            iconColor={PROVIDER_ICONS.gmail.color}
            status="connected"
          />
        </View>

        <View style={styles.stateSection}>
          <BionicText style={styles.stateLabel}>Error</BionicText>
          <ConnectionElement
            provider="Gmail"
            iconSvg={PROVIDER_ICONS.gmail.path}
            iconColor={PROVIDER_ICONS.gmail.color}
            status="error"
            onConnect={() => Alert.alert('Retry Gmail')}
          />
        </View>
      </View>
    </ScrollView>
  ),
};

/**
 * All Providers - Multiple Services
 * Shows various service providers
 */
export const AllProviders: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.providersContainer}>
        <BionicText style={styles.sectionTitle} boldRatio={0.5}>
          Available Connections
        </BionicText>

        <ConnectionElement
          provider="Gmail"
          iconSvg={PROVIDER_ICONS.gmail.path}
          iconColor={PROVIDER_ICONS.gmail.color}
          status="connected"
        />

        <ConnectionElement
          provider="Outlook"
          iconSvg={PROVIDER_ICONS.outlook.path}
          iconColor={PROVIDER_ICONS.outlook.color}
          status="disconnected"
          onConnect={() => Alert.alert('Connect Outlook')}
        />

        <ConnectionElement
          provider="Slack"
          iconSvg={PROVIDER_ICONS.slack.path}
          iconColor={PROVIDER_ICONS.slack.color}
          status="connected"
        />

        <ConnectionElement
          provider="GitHub"
          iconSvg={PROVIDER_ICONS.github.path}
          iconColor={PROVIDER_ICONS.github.color}
          status="disconnected"
          onConnect={() => Alert.alert('Connect GitHub')}
        />

        <ConnectionElement
          provider="Notion"
          iconSvg={PROVIDER_ICONS.notion.path}
          iconColor={PROVIDER_ICONS.notion.color}
          status="connected"
        />

        <ConnectionElement
          provider="Trello"
          iconSvg={PROVIDER_ICONS.trello.path}
          iconColor={PROVIDER_ICONS.trello.color}
          status="disconnected"
          onConnect={() => Alert.alert('Connect Trello')}
        />
      </View>
    </ScrollView>
  ),
};

/**
 * Interactive Connection Flow - Simulated OAuth
 * Shows realistic connection flow with state transitions
 */
export const InteractiveFlow: Story = {
  render: () => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');

    const handleConnect = () => {
      setStatus('connecting');

      // Simulate OAuth flow
      setTimeout(() => {
        // 70% success rate
        const success = Math.random() > 0.3;
        setStatus(success ? 'connected' : 'error');

        Alert.alert(
          success ? 'Connected!' : 'Connection Failed',
          success
            ? 'Successfully connected to Gmail'
            : 'Failed to connect. Please try again.'
        );
      }, 2000);
    };

    const handleRetry = () => {
      handleConnect();
    };

    return (
      <View style={styles.interactiveContainer}>
        <BionicText style={styles.sectionTitle} boldRatio={0.5}>
          Interactive Connection Flow
        </BionicText>

        <BionicText style={styles.description}>
          Tap "Connect" to simulate an OAuth flow. The connection will either succeed or fail randomly.
        </BionicText>

        <ConnectionElement
          provider="Gmail"
          iconSvg={PROVIDER_ICONS.gmail.path}
          iconColor={PROVIDER_ICONS.gmail.color}
          status={status}
          onConnect={status === 'error' ? handleRetry : handleConnect}
        />

        <BionicText style={styles.statusInfo}>
          Current Status: <BionicText boldRatio={0.5}>{status}</BionicText>
        </BionicText>
      </View>
    );
  },
};

/**
 * Mixed States Dashboard - Real-World Scenario
 * Shows various providers in different states
 */
export const MixedStatesDashboard: Story = {
  render: () => (
    <ScrollView style={styles.scrollView}>
      <View style={styles.providersContainer}>
        <BionicText style={styles.sectionTitle} boldRatio={0.5}>
          My Connections
        </BionicText>

        <BionicText style={styles.subtitle}>
          Manage your connected services and integrations
        </BionicText>

        <ConnectionElement
          provider="Gmail"
          iconSvg={PROVIDER_ICONS.gmail.path}
          iconColor={PROVIDER_ICONS.gmail.color}
          status="connected"
        />

        <ConnectionElement
          provider="Outlook"
          iconSvg={PROVIDER_ICONS.outlook.path}
          iconColor={PROVIDER_ICONS.outlook.color}
          status="error"
          onConnect={() => Alert.alert('Retry Outlook')}
        />

        <ConnectionElement
          provider="Slack"
          iconSvg={PROVIDER_ICONS.slack.path}
          iconColor={PROVIDER_ICONS.slack.color}
          status="connected"
        />

        <ConnectionElement
          provider="GitHub"
          iconSvg={PROVIDER_ICONS.github.path}
          iconColor={PROVIDER_ICONS.github.color}
          status="disconnected"
          onConnect={() => Alert.alert('Connect GitHub')}
        />

        <ConnectionElement
          provider="Notion"
          iconSvg={PROVIDER_ICONS.notion.path}
          iconColor={PROVIDER_ICONS.notion.color}
          status="connecting"
        />

        <ConnectionElement
          provider="Trello"
          iconSvg={PROVIDER_ICONS.trello.path}
          iconColor={PROVIDER_ICONS.trello.color}
          status="disconnected"
          onConnect={() => Alert.alert('Connect Trello')}
        />
      </View>
    </ScrollView>
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: THEME.base03,
  },
  scrollView: {
    flex: 1,
  },
  statesContainer: {
    paddingBottom: 40,
  },
  providersContainer: {
    paddingBottom: 40,
  },
  interactiveContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.base01,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: THEME.base01,
    lineHeight: 20,
  },
  stateSection: {
    marginBottom: 24,
  },
  stateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.cyan,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusInfo: {
    fontSize: 14,
    color: THEME.base0,
    marginTop: 16,
  },
});
