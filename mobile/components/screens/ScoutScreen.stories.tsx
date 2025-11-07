import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Search, Filter, SlidersHorizontal } from 'lucide-react-native';
import { THEME } from '../../src/theme/colors';
import TaskList from '../tasks/TaskList';
import ProfileSwitcher from '../ProfileSwitcher';
import { Text } from '@/src/components/ui/Text';

/**
 * Scout Screen - Complete composition showing the Task Discovery interface
 *
 * This is a SCREEN STORY that composes multiple components:
 * - ProfileSwitcher (top left)
 * - Filter controls
 * - TaskList (suggestions + tasks)
 *
 * Based on: mobile/TABS_AND_DATA_FLOW_PLAN.md - Scout Tab
 */

const meta = {
  title: 'Screens/Scout',
  component: ScoutScreen,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ScoutScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data (using ProfileSwitcher's Profile type)
import type { Profile } from '../ProfileSwitcher';

const mockSuggestions = [
  {
    integration_task_id: '1',
    suggested_title: 'Reply to Sarah\'s email about project deadline',
    provider: 'gmail',
    suggested_priority: 'HIGH',
    ai_confidence: 0.95,
    metadata: 'URGENT',
  },
  {
    integration_task_id: '2',
    suggested_title: 'Review PR #123 - Authentication fixes',
    provider: 'gmail',
    suggested_priority: 'MEDIUM',
    ai_confidence: 0.85,
  },
  {
    integration_task_id: '3',
    suggested_title: 'Schedule team meeting for next sprint',
    provider: 'gmail',
    suggested_priority: 'LOW',
    ai_confidence: 0.75,
  },
];

const mockCalendarSuggestions = [
  {
    integration_task_id: 'c1',
    suggested_title: 'Prepare for 3pm design review',
    provider: 'calendar',
    suggested_priority: 'HIGH',
    ai_confidence: 0.90,
  },
  {
    integration_task_id: 'c2',
    suggested_title: 'Follow up on morning standup action items',
    provider: 'calendar',
    suggested_priority: 'MEDIUM',
    ai_confidence: 0.80,
  },
];

const mockTasks = [
  {
    task_id: 't1',
    title: 'Fix authentication bug in production',
    description: 'Users are experiencing 500 errors on login',
    estimated_minutes: 45,
    micro_steps: 3,
    priority: 'HIGH' as const,
    tags: ['bug', 'urgent', 'backend'],
  },
  {
    task_id: 't2',
    title: 'Write documentation for new API',
    description: 'Document all endpoints with examples',
    estimated_minutes: 120,
    micro_steps: 5,
    priority: 'MEDIUM' as const,
    tags: ['docs'],
  },
  {
    task_id: 't3',
    title: 'Refactor user service',
    description: 'Clean up legacy code',
    estimated_minutes: 90,
    micro_steps: 4,
    priority: 'LOW' as const,
    tags: ['refactor', 'technical-debt'],
  },
];

// Scout Screen Component
interface ScoutScreenProps {
  initialSections?: any[];
  showFilters?: boolean;
  selectedProfile?: Profile;
}

function ScoutScreen({
  initialSections,
  showFilters = true,
  selectedProfile = 'personal',
}: ScoutScreenProps) {
  const [sections, setSections] = useState(initialSections || [
    {
      id: 'gmail',
      title: '📧 From Gmail',
      type: 'suggestions' as const,
      data: mockSuggestions,
    },
    {
      id: 'calendar',
      title: '📅 From Calendar',
      type: 'suggestions' as const,
      data: mockCalendarSuggestions,
    },
    {
      id: 'tasks',
      title: 'Your Tasks',
      type: 'tasks' as const,
      data: mockTasks,
    },
  ]);

  const [activeProfile, setActiveProfile] = useState<Profile>(selectedProfile);
  const [filterActive, setFilterActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleApprove = (suggestionId: string) => {
    console.log('Approved:', suggestionId);
    // Remove from suggestions
    setSections((prev) =>
      prev.map((section) =>
        section.type === 'suggestions'
          ? {
              ...section,
              data: section.data.filter((s: any) => s.integration_task_id !== suggestionId),
            }
          : section
      )
    );
  };

  const handleDismiss = (suggestionId: string) => {
    console.log('Dismissed:', suggestionId);
    setSections((prev) =>
      prev.map((section) =>
        section.type === 'suggestions'
          ? {
              ...section,
              data: section.data.filter((s: any) => s.integration_task_id !== suggestionId),
            }
          : section
      )
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Refreshed!');
      setRefreshing(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Profile Switcher */}
        <View style={styles.profileContainer}>
          <ProfileSwitcher
            selectedProfile={activeProfile}
            onProfileChange={setActiveProfile}
          />
        </View>
      </View>

      {/* Screen Title */}
      <View style={styles.titleContainer}>
        <Search size={24} color={THEME.blue} />
        <Text style={styles.title}>Scout</Text>
        <Text style={styles.subtitle}>Discover tasks from your connected apps</Text>
      </View>

      {/* Filter Controls */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterActive && styles.filterButtonActive]}
            onPress={() => setFilterActive(!filterActive)}
          >
            <Filter size={16} color={filterActive ? THEME.cyan : THEME.base0} />
            <Text style={[styles.filterText, filterActive && styles.filterTextActive]}>
              Filter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <SlidersHorizontal size={16} color={THEME.base0} />
            <Text style={styles.filterText}>Sort</Text>
          </TouchableOpacity>

          <View style={styles.filterInfo}>
            <Text style={styles.filterInfoText}>
              {sections.reduce((acc, s) => acc + s.data.length, 0)} items
            </Text>
          </View>
        </View>
      )}

      {/* Task List */}
      <TaskList
        sections={sections}
        onSuggestionApprove={handleApprove}
        onSuggestionDismiss={handleDismiss}
        onTaskPress={(id) => console.log('Task pressed:', id)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />
    </View>
  );
}

// === Basic Views ===

export const Default: Story = {
  render: () => <ScoutScreen />,
};

export const WithoutFilters: Story = {
  render: () => <ScoutScreen showFilters={false} />,
};

// === Data States ===

export const ManySuggestions: Story = {
  render: () => (
    <ScoutScreen
      initialSections={[
        {
          id: 'gmail',
          title: '📧 From Gmail',
          type: 'suggestions',
          data: Array.from({ length: 15 }, (_, i) => ({
            integration_task_id: `g${i}`,
            suggested_title: `Email task ${i + 1}: ${mockSuggestions[i % 3].suggested_title}`,
            provider: 'gmail',
            suggested_priority: ['HIGH', 'MEDIUM', 'LOW'][i % 3],
            ai_confidence: 0.95 - i * 0.03,
          })),
        },
        {
          id: 'tasks',
          title: 'Your Tasks',
          type: 'tasks',
          data: mockTasks,
        },
      ]}
    />
  ),
};

export const OnlySuggestions: Story = {
  render: () => (
    <ScoutScreen
      initialSections={[
        {
          id: 'gmail',
          title: '📧 From Gmail',
          type: 'suggestions',
          data: mockSuggestions,
        },
        {
          id: 'calendar',
          title: '📅 From Calendar',
          type: 'suggestions',
          data: mockCalendarSuggestions,
        },
      ]}
    />
  ),
};

export const OnlyTasks: Story = {
  render: () => (
    <ScoutScreen
      initialSections={[
        {
          id: 'tasks',
          title: 'Your Tasks',
          type: 'tasks',
          data: mockTasks,
        },
      ]}
    />
  ),
};

export const EmptyState: Story = {
  render: () => (
    <ScoutScreen
      initialSections={[
        {
          id: 'suggestions',
          title: '📧 From Gmail',
          type: 'suggestions',
          data: [],
        },
        {
          id: 'tasks',
          title: 'Your Tasks',
          type: 'tasks',
          data: [],
        },
      ]}
    />
  ),
};

// === Profile Variants ===

export const PersonalProfile: Story = {
  render: () => <ScoutScreen selectedProfile="personal" />,
};

export const LionMotelProfile: Story = {
  render: () => <ScoutScreen selectedProfile="lionmotel" />,
};

// === Interactive Demo ===

export const FullyInteractive: Story = {
  render: () => {
    const [sections, setSections] = useState([
      {
        id: 'gmail',
        title: '📧 From Gmail',
        type: 'suggestions' as const,
        data: mockSuggestions,
      },
      {
        id: 'calendar',
        title: '📅 From Calendar',
        type: 'suggestions' as const,
        data: mockCalendarSuggestions,
      },
      {
        id: 'tasks',
        title: 'Your Tasks',
        type: 'tasks' as const,
        data: mockTasks,
      },
    ]);

    const [activeProfile, setActiveProfile] = useState<Profile>('personal');

    return (
      <ScoutScreen
        initialSections={sections}
        selectedProfile={activeProfile}
      />
    );
  },
};

// === Styles ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  profileContainer: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.base1,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.base01,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME.base02,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: THEME.cyan + '20',
  },
  filterText: {
    fontSize: 14,
    color: THEME.base0,
  },
  filterTextActive: {
    color: THEME.cyan,
  },
  filterInfo: {
    marginLeft: 'auto',
  },
  filterInfoText: {
    fontSize: 12,
    color: THEME.base01,
  },
});
