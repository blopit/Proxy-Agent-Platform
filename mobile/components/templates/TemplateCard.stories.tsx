/**
 * TemplateCard Stories - Task Template Component
 * Based on: FE-04 Task Template Library spec
 *
 * Shows task templates users can browse and apply
 * Reference: agent_resources/planning/next_5_tasks.md (Task #5)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import BionicText from '../shared/BionicText';
import { Clock, Star, Users, Briefcase } from 'lucide-react-native';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'work' | 'personal' | 'adhd' | 'custom';
  estimatedTime: number;
  icon: string;
  popularity?: number;
  subtaskCount?: number;
}

interface TemplateCardProps {
  template: TaskTemplate;
  onUse?: (template: TaskTemplate) => void;
  onPreview?: (template: TaskTemplate) => void;
  compact?: boolean;
}

function TemplateCard({
  template,
  onUse,
  onPreview,
  compact = false,
}: TemplateCardProps) {
  const { colors } = useTheme();

  const getCategoryColor = () => {
    switch (template.category) {
      case 'work':
        return colors.blue;
      case 'personal':
        return colors.green;
      case 'adhd':
        return colors.orange;
      case 'custom':
        return colors.violet;
      default:
        return colors.cyan;
    }
  };

  const getIcon = () => {
    const iconColor = getCategoryColor();
    switch (template.category) {
      case 'work':
        return <Briefcase size={24} color={iconColor} />;
      case 'personal':
        return <Star size={24} color={iconColor} />;
      case 'adhd':
        return <Clock size={24} color={iconColor} />;
      default:
        return <Users size={24} color={iconColor} />;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: colors.base02 }]}
        onPress={() => onUse?.(template)}
      >
        <View style={styles.compactContent}>
          {getIcon()}
          <BionicText style={[styles.compactName, { color: colors.base0 }]}>
            {template.name}
          </BionicText>
        </View>
        <BionicText style={[styles.compactTime, { color: colors.base01 }]}>
          {template.estimatedTime}m
        </BionicText>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.base02 }]}
      onPress={() => onPreview?.(template)}
      onLongPress={() => onUse?.(template)}
    >
      {/* Header with icon and category */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.base03 }]}>
          {getIcon()}
        </View>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor() + '30', borderColor: getCategoryColor() },
          ]}
        >
          <Text style={[styles.categoryText, { color: getCategoryColor() }]}>
            {template.category.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Template name */}
      <BionicText style={[styles.name, { color: colors.base0 }]} boldZoneEnd={0.4}>
        {template.name}
      </BionicText>

      {/* Description */}
      <BionicText style={[styles.description, { color: colors.base01 }]}>
        {template.description}
      </BionicText>

      {/* Metadata */}
      <View style={styles.metadata}>
        <View style={styles.metaItem}>
          <Clock size={14} color={colors.base01} />
          <Text style={[styles.metaText, { color: colors.base01 }]}>
            {template.estimatedTime} min
          </Text>
        </View>
        {template.subtaskCount && (
          <View style={styles.metaItem}>
            <Text style={[styles.metaText, { color: colors.base01 }]}>
              {template.subtaskCount} steps
            </Text>
          </View>
        )}
        {template.popularity && (
          <View style={styles.metaItem}>
            <Star size={14} color={colors.yellow} fill={colors.yellow} />
            <Text style={[styles.metaText, { color: colors.base01 }]}>
              {template.popularity}
            </Text>
          </View>
        )}
      </View>

      {/* Use Template Button */}
      <TouchableOpacity
        style={[styles.useButton, { backgroundColor: colors.cyan }]}
        onPress={() => onUse?.(template)}
      >
        <Text style={[styles.useButtonText, { color: colors.base03 }]}>
          Use Template
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const meta = {
  title: 'Templates/TemplateCard',
  component: TemplateCard,
  decorators: [
    (Story) => {
      const { colors } = useTheme();
      return (
        <View style={[styles.container, { backgroundColor: colors.base03 }]}>
          <Story />
        </View>
      );
    },
  ],
} satisfies Meta<typeof TemplateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Work Template - Professional Task
 */
export const WorkTemplate: Story = {
  args: {
    template: {
      id: '1',
      name: 'Weekly Team Standup',
      description: 'Prepare and conduct weekly team synchronization meeting',
      category: 'work',
      estimatedTime: 30,
      icon: 'briefcase',
      subtaskCount: 5,
      popularity: 245,
    },
    onUse: (template) => Alert.alert('Using Template', template.name),
    onPreview: (template) => Alert.alert('Preview', template.name),
  },
};

/**
 * ADHD Template - Focus-Optimized
 * Specifically designed for ADHD users
 */
export const ADHDTemplate: Story = {
  args: {
    template: {
      id: '2',
      name: 'Deep Work Session Setup',
      description:
        'Prepare environment for 90-minute deep focus session with breaks',
      category: 'adhd',
      estimatedTime: 15,
      icon: 'clock',
      subtaskCount: 8,
      popularity: 892,
    },
    onUse: (template) => Alert.alert('Using Template', template.name),
  },
};

/**
 * Personal Template - Life Management
 */
export const PersonalTemplate: Story = {
  args: {
    template: {
      id: '3',
      name: 'Morning Routine',
      description: 'Complete healthy morning routine to start day right',
      category: 'personal',
      estimatedTime: 45,
      icon: 'star',
      subtaskCount: 10,
      popularity: 1523,
    },
    onUse: (template) => Alert.alert('Using Template', template.name),
  },
};

/**
 * Custom Template - User Created
 */
export const CustomTemplate: Story = {
  args: {
    template: {
      id: '4',
      name: 'Deploy to Production',
      description: 'My custom deployment checklist for web apps',
      category: 'custom',
      estimatedTime: 60,
      icon: 'users',
      subtaskCount: 12,
    },
    onUse: (template) => Alert.alert('Using Template', template.name),
  },
};

/**
 * Compact View - Grid Layout
 * Smaller cards for grid/list views
 */
export const CompactView: Story = {
  args: {
    template: {
      id: '5',
      name: 'Code Review',
      description: 'Review pull request and provide feedback',
      category: 'work',
      estimatedTime: 20,
      icon: 'briefcase',
    },
    compact: true,
    onUse: (template) => Alert.alert('Using Template', template.name),
  },
};

/**
 * All Categories - Comparison
 * Shows all template categories side by side
 */
export const AllCategories: Story = {
  render: () => {
    const { colors } = useTheme();

    const templates: TaskTemplate[] = [
      {
        id: '1',
        name: 'Code Review',
        description: 'Review code changes and provide feedback',
        category: 'work',
        estimatedTime: 25,
        icon: 'briefcase',
        subtaskCount: 4,
        popularity: 567,
      },
      {
        id: '2',
        name: 'Meal Prep Sunday',
        description: 'Plan and prepare meals for the week',
        category: 'personal',
        estimatedTime: 120,
        icon: 'star',
        subtaskCount: 8,
      },
      {
        id: '3',
        name: 'Focus Session',
        description: 'Pomodoro technique with 2-minute micro-tasks',
        category: 'adhd',
        estimatedTime: 30,
        icon: 'clock',
        subtaskCount: 12,
        popularity: 2341,
      },
      {
        id: '4',
        name: 'My Custom Flow',
        description: 'Personal workflow for client onboarding',
        category: 'custom',
        estimatedTime: 45,
        icon: 'users',
        subtaskCount: 6,
      },
    ];

    return (
      <View style={styles.grid}>
        <BionicText style={[styles.gridTitle, { color: colors.cyan }]}>
          Template Categories
        </BionicText>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={(t) => Alert.alert('Using', t.name)}
            onPreview={(t) => Alert.alert('Preview', t.name)}
          />
        ))}
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  useButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactTime: {
    fontSize: 12,
  },
  grid: {
    gap: 8,
  },
  gridTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
});
