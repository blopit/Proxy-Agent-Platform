/**
 * Work Preferences Screen - Collect user's work setup preference
 * Step 2 of onboarding flow
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Home, Building2, Palmtree, Shuffle, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { THEME } from '@/src/theme/colors';
import { useOnboarding } from '@/src/contexts/OnboardingContext';
import { ONBOARDING_STEPS, WorkPreference } from '@/src/types/onboarding';
import StepProgress from '@/src/components/onboarding/StepProgress';

const WORK_PREFERENCE_OPTIONS = [
  {
    value: 'remote' as WorkPreference,
    label: 'Remote',
    icon: Home,
    description: 'Work from home or anywhere',
    color: THEME.blue,
  },
  {
    value: 'hybrid' as WorkPreference,
    label: 'Hybrid',
    icon: Shuffle,
    description: 'Mix of remote and office',
    color: THEME.cyan,
  },
  {
    value: 'office' as WorkPreference,
    label: 'Office',
    icon: Building2,
    description: 'Work from office location',
    color: THEME.violet,
  },
  {
    value: 'flexible' as WorkPreference,
    label: 'Flexible',
    icon: Palmtree,
    description: 'Varies week to week',
    color: THEME.green,
  },
];

export default function WorkPreferencesScreen() {
  const router = useRouter();
  const { data, setWorkPreference, markStepComplete, nextStep, skipOnboarding } = useOnboarding();
  const [selectedPreference, setSelectedPreference] = useState<WorkPreference | null>(
    data.workPreference
  );

  const handleContinue = async () => {
    if (selectedPreference) {
      await setWorkPreference(selectedPreference);
      await markStepComplete(ONBOARDING_STEPS.WORK_PREFERENCES);
      await nextStep();
      router.push('/(auth)/onboarding/challenges');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = async () => {
    await skipOnboarding();
    router.replace('/(tabs)/capture/add');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Progress Indicator */}
      <StepProgress currentStep={2} totalSteps={7} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>What's your work setup?</Text>
          <Text style={styles.subtitle}>
            This helps us optimize your task scheduling and focus modes
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {WORK_PREFERENCE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedPreference === option.value;

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                  isSelected && { borderColor: option.color },
                ]}
                onPress={() => setSelectedPreference(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                    <Icon size={32} color={option.color} />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: option.color }]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ArrowLeft size={20} color={THEME.base1} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.continueButton, !selectedPreference && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedPreference}
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
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.base0,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.base01,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: THEME.base02,
    borderWidth: 2,
    borderColor: THEME.base02,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardSelected: {
    borderWidth: 2,
    backgroundColor: `${THEME.base02}cc`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.base0,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: THEME.base01,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: THEME.base03,
    fontSize: 16,
    fontWeight: '700',
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
});
