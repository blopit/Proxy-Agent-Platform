import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileSwitcher } from './ProfileSwitcher';
import { Profile } from '@/src/contexts/ProfileContext';

const meta = {
  title: 'Mapper/ProfileSwitcher',
  component: ProfileSwitcher,
  argTypes: {
    selectedProfile: {
      control: 'select',
      options: ['personal', 'lionmotel', 'aiservice'],
      description: 'Currently selected profile',
    },
    compact: {
      control: 'boolean',
      description: 'Use compact layout',
    },
  },
  decorators: [
    (Story) => (
      <View style={styles.decorator}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ProfileSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default ProfileSwitcher with full layout
 * Shows label and full-size profile selector
 */
export const Default: Story = {
  args: {
    selectedProfile: 'personal',
    compact: false,
  },
  render: (args) => {
    const [selected, setSelected] = useState<Profile>(args.selectedProfile as Profile);
    return (
      <ProfileSwitcher
        {...args}
        selectedProfile={selected}
        onProfileChange={setSelected}
      />
    );
  },
};

/**
 * Compact version for use in navigation or headers
 * Smaller size, no label
 */
export const Compact: Story = {
  args: {
    selectedProfile: 'lionmotel',
    compact: true,
  },
  render: (args) => {
    const [selected, setSelected] = useState<Profile>(args.selectedProfile as Profile);
    return (
      <ProfileSwitcher
        {...args}
        selectedProfile={selected}
        onProfileChange={setSelected}
      />
    );
  },
};

/**
 * All three profile options
 * Demonstrates the menu with all available profiles
 */
export const AllProfiles: Story = {
  render: () => {
    const [selected, setSelected] = useState<Profile>('personal');
    return (
      <View style={styles.column}>
        <View style={styles.section}>
          <ProfileSwitcher
            selectedProfile={selected}
            onProfileChange={setSelected}
            compact={false}
          />
        </View>
      </View>
    );
  },
};

/**
 * Interactive demo showing profile switching
 */
export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState<Profile>('personal');

    const profiles: Record<Profile, { label: string; description: string }> = {
      personal: {
        label: 'Personal',
        description: 'Your personal tasks and goals'
      },
      lionmotel: {
        label: 'Lion Motel',
        description: 'Lion Motel business tasks'
      },
      aiservice: {
        label: 'AI Service',
        description: 'AI Service project tasks'
      },
    };

    return (
      <View style={styles.column}>
        <View style={styles.section}>
          <ProfileSwitcher
            selectedProfile={selected}
            onProfileChange={setSelected}
            compact={false}
          />
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Current: {profiles[selected].label}
          </Text>
          <Text style={styles.infoText}>
            {profiles[selected].description}
          </Text>
        </View>
      </View>
    );
  },
};

/**
 * Side-by-side comparison of full and compact modes
 */
export const Comparison: Story = {
  render: () => {
    const [selected1, setSelected1] = useState<Profile>('personal');
    const [selected2, setSelected2] = useState<Profile>('lionmotel');

    return (
      <View style={styles.column}>
        <Text style={styles.sectionTitle}>Full Mode</Text>
        <ProfileSwitcher
          selectedProfile={selected1}
          onProfileChange={setSelected1}
          compact={false}
        />

        <View style={{ height: 24 }} />

        <Text style={styles.sectionTitle}>Compact Mode</Text>
        <ProfileSwitcher
          selectedProfile={selected2}
          onProfileChange={setSelected2}
          compact={true}
        />
      </View>
    );
  },
};

/**
 * Demonstrates usage in a header/navigation context
 */
export const InHeader: Story = {
  render: () => {
    const [selected, setSelected] = useState<Profile>('aiservice');

    return (
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mapper</Text>
          <ProfileSwitcher
            selectedProfile={selected}
            onProfileChange={setSelected}
            compact={true}
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.contentText}>
            Content area for {selected} profile
          </Text>
        </View>
      </View>
    );
  },
};

const Text = ({ style, children }: { style?: any; children: React.ReactNode }) => {
  return <RNText style={style}>{children}</RNText>;
};

import { Text as RNText } from 'react-native';

const styles = StyleSheet.create({
  decorator: {
    flex: 1,
    padding: 20,
    backgroundColor: '#002b36', // Solarized base03
  },
  column: {
    gap: 0,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#93a1a1', // Solarized base1
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#073642', // Solarized base02
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#586e75',
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2aa198', // Solarized cyan
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#93a1a1', // Solarized base1
    lineHeight: 20,
  },
  headerContainer: {
    flex: 1,
    backgroundColor: '#002b36',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#073642',
    borderBottomWidth: 1,
    borderBottomColor: '#586e75',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#93a1a1',
  },
  headerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 16,
    color: '#586e75',
    textAlign: 'center',
  },
});
