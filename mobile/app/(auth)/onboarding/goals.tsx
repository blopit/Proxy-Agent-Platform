/**
 * Productivity Goals Screen - Collect user's productivity goals
 * Step 6 of 7 in onboarding flow
 */

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Target, Plus, X, ArrowRight, ArrowLeft, Check } from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { ONBOARDING_STEPS, ProductivityGoal, ProductivityGoalType } from '@/src/types/onboarding';
import StepProgress from '@/src/components/onboarding/StepProgress';
import OpenMoji from '@/src/components/ui/OpenMoji';

// Suggested goals that users can quickly tap to add
const SUGGESTED_GOALS: {
  id: string;
  type: ProductivityGoalType;
  title: string;
  emoji: string;
}[] = [
  {
    id: 'suggested_1',
    type: 'task_completion',
    title: 'Complete 3 tasks daily',
    emoji: '✅',
  },
  {
    id: 'suggested_2',
    type: 'focus_time',
    title: 'Complete 2 Pomodoros (25 min) daily',
    emoji: '🎯',
  },
  {
    id: 'suggested_3',
    type: 'project_delivery',
    title: 'Finish MVP by end of month',
    emoji: '🚀',
  },
  {
    id: 'suggested_4',
    type: 'habit_building',
    title: 'Morning planning ritual every day',
    emoji: '🌱',
  },
  {
    id: 'suggested_5',
    type: 'work_life_balance',
    title: 'Stop work by 6pm, no weekends',
    emoji: '⚖️',
  },
  {
    id: 'suggested_6',
    type: 'creative_output',
    title: 'Write 500 words daily',
    emoji: '🎨',
  },
  {
    id: 'suggested_7',
    type: 'learning',
    title: 'Study for 30 min daily',
    emoji: '📚',
  },
];

const GOAL_TYPES: {
  value: ProductivityGoalType;
  label: string;
  emoji: string;
  placeholder: string;
}[] = [
  {
    value: 'task_completion',
    label: 'Task Completion',
    emoji: '✅',
    placeholder: 'Complete 3 tasks daily',
  },
  {
    value: 'focus_time',
    label: 'Focus Sessions',
    emoji: '🎯',
    placeholder: 'Complete 2 Pomodoros (25 min) daily',
  },
  {
    value: 'project_delivery',
    label: 'Project Milestones',
    emoji: '🚀',
    placeholder: 'Finish MVP by end of December',
  },
  {
    value: 'habit_building',
    label: 'Daily Habits',
    emoji: '🌱',
    placeholder: 'Morning planning ritual every day',
  },
  {
    value: 'work_life_balance',
    label: 'Work-Life Balance',
    emoji: '⚖️',
    placeholder: 'Stop work by 6pm, no weekends',
  },
  {
    value: 'creative_output',
    label: 'Creative Work',
    emoji: '🎨',
    placeholder: 'Write 500 words daily',
  },
  {
    value: 'learning',
    label: 'Learning & Growth',
    emoji: '📚',
    placeholder: 'Study React for 30 min daily',
  },
  {
    value: 'other',
    label: 'Custom Goal',
    emoji: '💡',
    placeholder: 'Your own productivity goal',
  },
];

export default function ProductivityGoalsScreen() {
  const router = useRouter();
  const { data, setProductivityGoals, markStepComplete, nextStep, skipOnboarding } =
    useOnboarding();

  const [goals, setGoals] = useState<ProductivityGoal[]>(data.productivityGoals || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalType, setNewGoalType] = useState<ProductivityGoalType>('task_completion');
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleContinue = async () => {
    await setProductivityGoals(goals);
    await markStepComplete(ONBOARDING_STEPS.PRODUCTIVITY_GOALS);
    await nextStep();
    router.push('/(auth)/onboarding/complete');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.replace('/(tabs)/capture/add');
  };

  const handleToggleSuggestedGoal = (suggestedGoal: typeof SUGGESTED_GOALS[0]) => {
    // Check if this suggested goal is already added
    const existingGoal = goals.find((g) => g.title === suggestedGoal.title);

    if (existingGoal) {
      // Remove it if already added (toggle off)
      setGoals(goals.filter((g) => g.id !== existingGoal.id));
    } else {
      // Add it if not already added (toggle on)
      const newGoal: ProductivityGoal = {
        id: Date.now().toString(),
        type: suggestedGoal.type,
        title: suggestedGoal.title,
      };
      setGoals([...goals, newGoal]);
    }
  };

  const handleAddGoal = () => {
    if (newGoalTitle.trim()) {
      const newGoal: ProductivityGoal = {
        id: Date.now().toString(),
        type: newGoalType,
        title: newGoalTitle.trim(),
      };
      setGoals([...goals, newGoal]);
      setNewGoalTitle('');
      setShowAddModal(false);
    }
  };

  const handleRemoveGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
  };

  const getGoalTypeInfo = (type: ProductivityGoalType) => {
    return GOAL_TYPES.find((t) => t.value === type) || GOAL_TYPES[0];
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Indicator */}
      <StepProgress currentStep={6} totalSteps={7} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Target size={32} color={THEME.green} />
            <Text style={styles.title}>Productivity Goals</Text>
          </View>
          <Text style={styles.subtitle}>
            What do you want to achieve? Tap suggested goals or add your own
          </Text>
        </View>

        {/* Suggested Goals */}
        <View style={styles.suggestedSection}>
          <Text style={styles.sectionLabel}>Suggested Goals (tap to add/remove)</Text>
          <View style={styles.suggestedGoals}>
            {SUGGESTED_GOALS.map((suggestedGoal) => {
              const isAdded = goals.some((g) => g.title === suggestedGoal.title);
              return (
                <TouchableOpacity
                  key={suggestedGoal.id}
                  style={[styles.suggestedGoalChip, isAdded && styles.suggestedGoalChipAdded]}
                  onPress={() => handleToggleSuggestedGoal(suggestedGoal)}
                  activeOpacity={0.7}
                >
                  <OpenMoji
                    emoji={suggestedGoal.emoji}
                    size={20}
                    color={isAdded ? THEME.green : THEME.base0}
                  />
                  <Text
                    style={[
                      styles.suggestedGoalText,
                      isAdded && styles.suggestedGoalTextAdded,
                    ]}
                  >
                    {suggestedGoal.title}
                  </Text>
                  {isAdded && <Check size={18} color={THEME.green} strokeWidth={3} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Your Goals List */}
        {goals.length > 0 && (
          <View style={styles.yourGoalsSection}>
            <Text style={styles.sectionLabel}>Your Goals ({goals.length})</Text>
            <View style={styles.goalsList}>
              {goals.map((goal) => {
                const typeInfo = getGoalTypeInfo(goal.type);
                return (
                  <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalContent}>
                      <OpenMoji emoji={typeInfo.emoji} size={32} color={THEME.base0} />
                      <View style={styles.goalText}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveGoal(goal.id)}
                      activeOpacity={0.7}
                    >
                      <X size={20} color={THEME.red} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Add Custom Goal Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.7}
        >
          <Plus size={20} color={THEME.base01} />
          <Text style={styles.addButtonText}>Add Custom Goal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={20} color={THEME.base1} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueButton, goals.length === 0 && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={goals.length === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ArrowRight size={20} color={THEME.base03} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add a Goal</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={THEME.base0} />
              </TouchableOpacity>
            </View>

            {/* Goal Type Selection */}
            <Text style={styles.modalLabel}>Goal Type</Text>
            <ScrollView style={styles.goalTypesScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.goalTypes}>
                {GOAL_TYPES.map((type) => {
                  const isSelected = newGoalType === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[styles.goalTypeChip, isSelected && styles.goalTypeChipSelected]}
                      onPress={() => setNewGoalType(type.value)}
                      activeOpacity={0.7}
                    >
                      <OpenMoji
                        emoji={type.emoji}
                        size={18}
                        color={isSelected ? THEME.green : THEME.base0}
                      />
                      <Text
                        style={[styles.goalTypeText, isSelected && styles.goalTypeTextSelected]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Goal Title Input */}
            <Text style={styles.modalLabel}>What's your goal?</Text>
            <TextInput
              style={styles.modalInput}
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              placeholder={getGoalTypeInfo(newGoalType).placeholder}
              placeholderTextColor={THEME.base01}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Add Button */}
            <TouchableOpacity
              style={[styles.modalAddButton, !newGoalTitle.trim() && styles.modalAddButtonDisabled]}
              onPress={handleAddGoal}
              disabled={!newGoalTitle.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.modalAddButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.base03,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 8,
  },
  header: {
    marginTop: 24,
    marginBottom: 28,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    lineHeight: 22,
  },
  suggestedSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestedGoals: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestedGoalChip: {
    backgroundColor: THEME.base02,
    borderWidth: 2,
    borderColor: THEME.green,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestedGoalChipAdded: {
    backgroundColor: `${THEME.green}30`,
    borderColor: THEME.green,
  },
  suggestedGoalText: {
    fontSize: 14,
    color: THEME.base0,
    fontWeight: '500',
  },
  suggestedGoalTextAdded: {
    color: THEME.green,
  },
  yourGoalsSection: {
    marginBottom: 24,
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: THEME.base02,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  goalText: {
    flex: 1,
  },
  goalType: {
    fontSize: 12,
    color: THEME.green,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalTitle: {
    fontSize: 16,
    color: THEME.base0,
    lineHeight: 20,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.base01,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.base01,
  },
  actions: {
    gap: 12,
    paddingTop: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.base01,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    color: THEME.base1,
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    flex: 2,
    backgroundColor: THEME.blue,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: THEME.base01,
    opacity: 0.5,
  },
  continueButtonText: {
    color: THEME.base3,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: THEME.base01,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.base03,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME.base0,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 12,
  },
  goalTypesScroll: {
    maxHeight: 120,
    marginBottom: 24,
  },
  goalTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalTypeChip: {
    backgroundColor: THEME.base02,
    borderWidth: 1,
    borderColor: THEME.base01,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalTypeChipSelected: {
    backgroundColor: `${THEME.green}30`,
    borderColor: THEME.green,
  },
  goalTypeText: {
    fontSize: 14,
    color: THEME.base0,
  },
  goalTypeTextSelected: {
    color: THEME.green,
    fontWeight: '600',
  },
  modalInput: {
    backgroundColor: THEME.base02,
    borderWidth: 1,
    borderColor: THEME.base01,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: THEME.base0,
    minHeight: 80,
    marginBottom: 24,
  },
  modalAddButton: {
    backgroundColor: THEME.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalAddButtonDisabled: {
    backgroundColor: THEME.base01,
    opacity: 0.5,
  },
  modalAddButtonText: {
    color: THEME.base03,
    fontSize: 16,
    fontWeight: '700',
  },
});
