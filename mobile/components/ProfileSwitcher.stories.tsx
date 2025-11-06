/**
 * ProfileSwitcher Stories - Profile selection dropdown
 * Shows different profile states and menu interactions
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import ProfileSwitcher, { Profile } from './ProfileSwitcher';
import { THEME } from '../src/theme/colors';

const meta = {
  title: 'Mapper/ProfileSwitcher',
  component: ProfileSwitcher,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ProfileSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Personal Profile - Default
 * Shows personal profile selected
 */
export const Personal: Story = {
  args: {
    selectedProfile: 'personal',
    onProfileChange: (profile) => Alert.alert('Profile Changed', `Switched to: ${profile}`),
  },
};

/**
 * Lion Motel Profile
 * Business profile for Lion Motel
 */
export const LionMotel: Story = {
  args: {
    selectedProfile: 'lionmotel',
    onProfileChange: (profile) => Alert.alert('Profile Changed', `Switched to: ${profile}`),
  },
};

/**
 * AI Service Profile
 * Service profile for AI-related tasks
 */
export const AIService: Story = {
  args: {
    selectedProfile: 'aiservice',
    onProfileChange: (profile) => Alert.alert('Profile Changed', `Switched to: ${profile}`),
  },
};

/**
 * Interactive Switcher
 * Fully interactive profile switcher with state
 */
export const Interactive: Story = {
  render: () => {
    const [selectedProfile, setSelectedProfile] = useState<Profile>('personal');

    const handleProfileChange = (profile: Profile) => {
      setSelectedProfile(profile);
      Alert.alert('Profile Changed', `Now using: ${profile}`);
    };

    return (
      <ProfileSwitcher
        selectedProfile={selectedProfile}
        onProfileChange={handleProfileChange}
      />
    );
  },
};

/**
 * All Profiles Demo
 * Shows all three profiles side by side
 */
export const AllProfiles: Story = {
  render: () => {
    const profiles: Profile[] = ['personal', 'lionmotel', 'aiservice'];

    return (
      <View style={styles.multiContainer}>
        {profiles.map((profile) => (
          <View key={profile} style={styles.profileSection}>
            <ProfileSwitcher
              selectedProfile={profile}
              onProfileChange={(p) => Alert.alert('Changed', p)}
            />
          </View>
        ))}
      </View>
    );
  },
};

/**
 * With Confirmation
 * Shows profile switcher with confirmation dialog
 */
export const WithConfirmation: Story = {
  render: () => {
    const [selectedProfile, setSelectedProfile] = useState<Profile>('personal');

    const handleProfileChange = (profile: Profile) => {
      Alert.alert(
        'Confirm Profile Switch',
        `Switch to ${profile} profile?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => {
              setSelectedProfile(profile);
              Alert.alert('Success', `Switched to ${profile} profile`);
            },
          },
        ]
      );
    };

    return (
      <ProfileSwitcher
        selectedProfile={selectedProfile}
        onProfileChange={handleProfileChange}
      />
    );
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: THEME.base03,
  },
  multiContainer: {
    gap: 20,
  },
  profileSection: {
    marginBottom: 16,
  },
});
